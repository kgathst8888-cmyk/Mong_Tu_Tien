-- =====================================================================
-- CHỐNG HACK + TỰ KHOÁ TÀI KHOẢN CAN THIỆP DỮ LIỆU (Fix428) — Supabase
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
-- Chạy SAU: admin.sql, chong_dube.sql (cần kthm_item_ok), phien_dang_nhap.sql, luu_mang_bao_ve_v3*.sql.
-- KHÔNG sửa push_save: chỉ gắn thêm 1 TRIGGER (kthm_cheat_scan) vào bảng saves + 1 hàm báo cáo cho client.
--
-- Cách hoạt động
--   * Mỗi lần người chơi tự lưu (push_save), máy chủ quét gói lưu: vàng/mảnh ngoài khoảng, trang bị không hợp lệ (kthm_item_ok),
--     nhảy cấp/bậc bất thường trong thời gian ngắn ⇒ ghi nhật ký kthm_cheat_log + cộng ĐIỂM VI PHẠM (kthm_cheat_state).
--   * Client (systems/62-chong-hack-khoa-tk.js) báo kthm_report_cheat khi phát hiện sửa localStorage / số liệu ngoài khoảng.
--   * Điểm >= ngưỡng (mặc định 100, tự giảm về 0 nếu 7 ngày không vi phạm) ⇒ KHOÁ: auth.users.banned_until + xoá kthm_session (đá ngay).
--   * Admin KHÔNG bao giờ bị khoá. Quét KHÔNG BAO GIỜ chặn việc lưu (lỗi trong quét bị bỏ qua).
--   * Linh thạch vốn đã do máy chủ giữ (cho_wallet/cho_earn có trần ngày) nên không nằm trong gói lưu để sửa.
--
-- !! MẶC ĐỊNH CHẠY CHẾ ĐỘ "CHỈ GHI NHẬT KÝ" (auto_lock = false) để xem có báo nhầm người chơi thật không.
--    Xem 2–3 ngày:   select * from public.kthm_cheat_overview limit 50;
--    Ổn thì bật khoá: update public.kthm_cheat_cfg set auto_lock = true;
--    Mở khoá 1 người: select public.kthm_cheat_unlock('<uid>');   (chỉ admin)
-- Gỡ hoàn toàn: drop trigger kthm_cheat_scan_trg on public.saves; drop function public.kthm_report_cheat(text, jsonb);
-- =====================================================================

create table if not exists public.kthm_cheat_cfg(
  id         int primary key default 1 check (id = 1),
  auto_lock  boolean not null default false,
  threshold  int     not null default 100,
  decay_days int     not null default 7
);
insert into public.kthm_cheat_cfg(id) values (1) on conflict do nothing;

create table if not exists public.kthm_cheat_log(
  id     bigserial primary key,
  uid    uuid not null,
  kind   text not null,
  score  int  not null default 0,
  detail jsonb,
  at     timestamptz not null default now()
);
create index if not exists kthm_cheat_log_uid on public.kthm_cheat_log(uid, at desc);

create table if not exists public.kthm_cheat_state(
  uid         uuid primary key,
  score       int  not null default 0,
  last_at     timestamptz not null default now(),
  locked_at   timestamptz,
  lock_reason text
);
alter table public.kthm_cheat_cfg   enable row level security;
alter table public.kthm_cheat_log   enable row level security;
alter table public.kthm_cheat_state enable row level security;
revoke all on public.kthm_cheat_cfg, public.kthm_cheat_log, public.kthm_cheat_state from anon, authenticated;

-- Ghi vi phạm + (nếu bật) khoá. Chỉ gọi nội bộ.
create or replace function public._kthm_strike(p_uid uuid, p_kind text, p_score int, p_detail jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare cfg public.kthm_cheat_cfg; st public.kthm_cheat_state; ns int;
begin
  if p_uid is null or exists(select 1 from public.kthm_admin where uid = p_uid) then return; end if;
  select * into cfg from public.kthm_cheat_cfg where id = 1;
  insert into public.kthm_cheat_log(uid, kind, score, detail) values (p_uid, p_kind, p_score, case when length(coalesce(p_detail::text,'')) <= 3000 then p_detail else null end);
  insert into public.kthm_cheat_state(uid, score, last_at) values (p_uid, 0, now()) on conflict do nothing;
  select * into st from public.kthm_cheat_state where uid = p_uid for update;
  ns := case when st.last_at < now() - make_interval(days => cfg.decay_days) then p_score else st.score + p_score end;
  update public.kthm_cheat_state set score = ns, last_at = now() where uid = p_uid;
  if cfg.auto_lock and ns >= cfg.threshold and st.locked_at is null then
    update auth.users set banned_until = now() + interval '100 years' where id = p_uid;
    delete from public.kthm_session where uid = p_uid;                       -- đá khỏi game ngay
    update public.kthm_cheat_state set locked_at = now(), lock_reason = p_kind where uid = p_uid;
  end if;
exception when others then null;   -- không bao giờ làm hỏng luồng gọi
end $$;

-- Quét gói lưu khi người chơi tự ghi (auth.uid() = chủ bản lưu). Admin sửa hộ người khác thì bỏ qua.
create or replace function public.kthm_cheat_scan() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  k2 jsonb; g numeric; fr numeric; bad int := 0; n int := 0; arr jsonb; it jsonb; ci int;
  ot int; ol int; nt int; nl int; legit boolean := false; secs numeric;
begin
  if auth.uid() is null or auth.uid() <> NEW.user_id then return NEW; end if;
  begin
    k2 := NEW.data->'k2';
    if k2 is null or jsonb_typeof(k2) <> 'object' then return NEW; end if;

    -- (1) vàng / mảnh ngoài khoảng hợp lý
    begin g := (k2->>'gold')::numeric; fr := (k2->>'frag')::numeric; exception when others then g := null; fr := null; end;
    if (g is not null and (g < 0 or g > 1e13)) or (fr is not null and (fr < 0 or fr > 1e12)) then
      perform public._kthm_strike(NEW.user_id, 'RANGE_GOLD', 60, jsonb_build_object('gold', g, 'frag', fr));
    end if;

    -- (2) trang bị không hợp lệ (đồ làm giả chỉ số). Đồ mới sinh có thể chưa có uid ⇒ gắn uid giả để không báo nhầm.
    for ci in 0..2 loop
      for arr in select k2->'EQS'->ci union all select k2->'BAGS'->ci loop
        if arr is not null and jsonb_typeof(arr) = 'array' then
          for it in select * from jsonb_array_elements(arr) loop
            exit when n >= 600;
            if jsonb_typeof(it) = 'object' then
              n := n + 1;
              if not public.kthm_item_ok(case when it ? 'uid' then it else it || jsonb_build_object('uid', repeat('0', 20)) end) then
                bad := bad + 1;
              end if;
            end if;
          end loop;
        end if;
      end loop;
    end loop;
    if bad > 0 then
      perform public._kthm_strike(NEW.user_id, 'BAD_ITEM', least(20 + bad * 10, 60), jsonb_build_object('bad', bad, 'scanned', n));
    end if;

    -- (3) nhảy cấp/bậc bất thường trong thời gian ngắn (trừ Hợp Đạo / Chuyển Thế hợp lệ)
    secs := extract(epoch from (now() - OLD.updated_at));
    select b.o_tier, b.o_lv into ot, ol from public.kthm_best(OLD.data) b;
    select b.o_tier, b.o_lv into nt, nl from public.kthm_best(NEW.data) b;
    legit := exists(
      select 1 from jsonb_array_elements(coalesce(k2->'PS', '[]'::jsonb)) with ordinality x(v, i)
       where jsonb_typeof(x.v) = 'object' and (
         ((x.v->'hd'->>'d') = '1' and coalesce((OLD.data->'k2'->'PS'->((x.i - 1)::int))->'hd'->>'d', '') <> '1')
         or ((x.v->'ct'->>'d') = '1' and coalesce((OLD.data->'k2'->'PS'->((x.i - 1)::int))->'ct'->>'d', '') <> '1')));
    if not legit and ol is not null and nl is not null and secs < 600 then
      if nt - ot >= 2 or (nt = ot and nl - ol >= 80) then
        perform public._kthm_strike(NEW.user_id, 'LV_JUMP', 40, jsonb_build_object('from_tier', ot, 'from_lv', ol, 'to_tier', nt, 'to_lv', nl, 'secs', round(secs)));
      end if;
    end if;
  exception when others then null;   -- quét lỗi ⇒ bỏ qua, KHÔNG chặn lưu
  end;
  return NEW;
end $$;

drop trigger if exists kthm_cheat_scan_trg on public.saves;
create trigger kthm_cheat_scan_trg before update of data on public.saves
  for each row execute function public.kthm_cheat_scan();

-- Client báo cáo (chỉ ảnh hưởng chính tài khoản gọi; tối đa 1 lần/loại/10 phút)
create or replace function public.kthm_report_cheat(p_kind text, p_detail jsonb default null) returns json
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); sc int;
begin
  if u is null then return json_build_object('status', 'auth'); end if;
  sc := case p_kind when 'LOCAL_TAMPER' then 25 when 'LOCAL_RANGE' then 25 else null end;
  if sc is null then return json_build_object('status', 'bad'); end if;
  if exists(select 1 from public.kthm_cheat_log where uid = u and kind = p_kind and at > now() - interval '10 minutes') then
    return json_build_object('status', 'dup');
  end if;
  perform public._kthm_strike(u, p_kind, sc, p_detail);
  return json_build_object('status', 'ok');
end $$;

-- Quản trị
create or replace view public.kthm_cheat_overview as
  select s.uid, u.email, s.score, s.last_at, s.locked_at, s.lock_reason,
         (select count(*) from public.kthm_cheat_log l where l.uid = s.uid) as so_lan,
         (select string_agg(distinct l.kind, ',') from public.kthm_cheat_log l where l.uid = s.uid) as loai
    from public.kthm_cheat_state s left join auth.users u on u.id = s.uid
   order by s.score desc, s.last_at desc;
revoke all on public.kthm_cheat_overview from anon, authenticated;

create or replace function public.kthm_cheat_unlock(p_uid uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_chk();
  update auth.users set banned_until = null where id = p_uid;
  update public.kthm_cheat_state set score = 0, locked_at = null, lock_reason = null where uid = p_uid;
  perform public._admin_log('cheat_unlock', p_uid, null);
  return true;
end $$;

revoke all on function public._kthm_strike(uuid, text, int, jsonb), public.kthm_cheat_scan(),
  public.kthm_report_cheat(text, jsonb), public.kthm_cheat_unlock(uuid) from public, anon;
grant execute on function public.kthm_report_cheat(text, jsonb), public.kthm_cheat_unlock(uuid) to authenticated;
