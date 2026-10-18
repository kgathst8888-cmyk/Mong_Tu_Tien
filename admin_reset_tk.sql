-- =====================================================================
-- Fix303 · ADMIN: reset tài khoản người chơi + xem tên nhân vật của từng gmail
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
-- Điều kiện: đã chạy admin.sql và linh_thach_khoa.sql (admin_find bản có _lks).
--
-- 1) admin_find: thêm cột "chars" = danh sách nhân vật [{nm, lv}] lấy từ bản lưu trên mây,
--    và tìm được theo TÊN NHÂN VẬT (bảng leaderboard) ngoài email / uuid.
-- 2) admin_reset_account(uid, xoá_linh_thạch): xoá bản lưu + lịch sử + đỉnh cao + xếp hạng + chợ của tài khoản đó,
--    đá khỏi game, tăng "mùa reset riêng" để máy người chơi tự xoá dữ liệu cũ (không đẩy ngược lên mây).
--    Có chụp bản sao riêng của admin (kthm_admin_reset_bak) → dùng admin_reset_undo để khôi phục nếu bấm nhầm.
-- 3) Không reset được tài khoản admin (CANNOT_TARGET_ADMIN).
-- =====================================================================

-- ---------- mùa reset riêng từng tài khoản ----------
create table if not exists public.kthm_user_reset(
  uid uuid primary key,
  n   int  not null default 0,
  at  timestamptz not null default now()
);
alter table public.kthm_user_reset enable row level security;
revoke all on public.kthm_user_reset from anon, authenticated;

-- bản sao trước khi reset (CHỈ admin xem được; người chơi không thấy trong list_snapshots)
create table if not exists public.kthm_admin_reset_bak(
  id    bigserial primary key,
  uid   uuid not null,
  admin uuid,
  at    timestamptz not null default now(),
  data  jsonb not null
);
create index if not exists kthm_admin_reset_bak_u on public.kthm_admin_reset_bak(uid, at desc);
alter table public.kthm_admin_reset_bak enable row level security;
revoke all on public.kthm_admin_reset_bak from anon, authenticated;

-- máy người chơi hỏi: tài khoản của mình đã bị reset mấy lần (module systems/10c-user-reset-live.js)
create or replace function public.user_reset_get() returns jsonb
language sql security definer set search_path = public stable as $$
  select jsonb_build_object('n', coalesce((select n from public.kthm_user_reset where uid = auth.uid()), 0))
$$;
revoke all on function public.user_reset_get() from public, anon;
grant execute on function public.user_reset_get() to authenticated;

-- ---------- admin_find: thêm tên nhân vật + tìm theo tên ----------
create or replace function public.admin_find(p_q text default '') returns json
language plpgsql security definer set search_path = public as $$
declare r json; q text := coalesce(trim(p_q), '');
begin
  perform public._admin_chk();
  select coalesce(json_agg(t), '[]'::json) into r from (
    select u.id, u.email, u.created_at, u.last_sign_in_at, u.banned_until,
           coalesce(w.lt, 0) as lt,
           public._lks(u.id) as lks,
           (select coalesce(sum(k.n), 0) from public.cho_lock k where k.uid = u.id) as lk,
           (s.seen is not null and s.seen > now() - interval '3 minutes') as online,
           s.device, s.seen,
           (b.uid is not null and (b.until is null or b.until > now())) as chat_ban,
           exists(select 1 from public.kthm_admin a where a.uid = u.id) as is_admin,
           (select coalesce(json_agg(json_build_object(
                     'nm', c.v->>'nm',
                     'lv', case when (c.v->>'lv') ~ '^[0-9]{1,4}$' then (c.v->>'lv')::int end
                   ) order by c.i), '[]'::json)
              from public.saves sv,
                   jsonb_array_elements(case when jsonb_typeof(sv.data->'k2'->'PS') = 'array'
                                             then sv.data->'k2'->'PS' else '[]'::jsonb end)
                     with ordinality c(v, i)
             where sv.user_id = u.id and jsonb_typeof(c.v) = 'object' and coalesce(c.v->>'nm', '') <> '') as chars
      from auth.users u
      left join public.cho_wallet   w on w.uid = u.id
      left join public.kthm_session s on s.uid = u.id
      left join public.chat_bans    b on b.uid = u.id
     where case when q = ':online' then (s.seen is not null and s.seen > now() - interval '3 minutes')
                else (q = '' or u.email ilike '%' || q || '%' or u.id::text = q
                      or exists(select 1 from public.leaderboard lb where lb.user_id = u.id and lb.name ilike '%' || q || '%')) end
     order by u.last_sign_in_at desc nulls last
     limit 30) t;
  return r;
end $$;

-- ---------- reset tài khoản ----------
-- p_lt = true: xoá luôn Linh Thạch (ví + LT khoá). Mặc định giữ Linh Thạch (tiền nạp).
create or replace function public.admin_reset_account(p_uid uuid, p_lt boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n int; bak boolean := false; x record;
begin
  perform public._admin_chk();
  if p_uid is null or not exists(select 1 from auth.users where id = p_uid) then raise exception 'NO_USER'; end if;
  if exists(select 1 from public.kthm_admin where uid = p_uid) then raise exception 'CANNOT_TARGET_ADMIN'; end if;

  -- 1) chụp bản sao riêng của admin (lỗi → huỷ cả thao tác, không xoá gì)
  insert into public.kthm_admin_reset_bak(uid, admin, data)
    select user_id, auth.uid(), data from public.saves where user_id = p_uid;
  get diagnostics n = row_count; bak := n > 0;
  delete from public.kthm_admin_reset_bak where uid = p_uid
    and id not in (select id from public.kthm_admin_reset_bak where uid = p_uid order by id desc limit 3);

  -- 2) xoá bản lưu chính
  delete from public.saves where user_id = p_uid;

  -- 3) dọn dữ liệu phụ (bảng nào chưa có / khác cột thì bỏ qua, không làm hỏng việc reset)
  for x in select * from (values
      ('saves_peak','user_id'), ('saves_history','user_id'), ('saves_guard','user_id'),
      ('leaderboard','user_id'), ('rank2_chars','uid'), ('boss_scores','uid'),
      ('arena_prof','uid'), ('arena_players','uid'),
      ('cho_listing','seller'), ('cho_inbox','uid'), ('kthm_item_ledger','owner')
    ) v(tb, col) loop
    begin
      if to_regclass('public.' || x.tb) is not null then
        execute format('delete from public.%I where %I = $1', x.tb, x.col) using p_uid;
      end if;
    exception when others then null;
    end;
  end loop;

  if coalesce(p_lt, false) then
    update public.cho_wallet set lt = 0, updated = now() where uid = p_uid;
    begin delete from public.cho_lock where uid = p_uid; exception when others then null; end;
  end if;

  -- 4) đá khỏi game + tăng mùa reset riêng để máy người chơi tự xoá dữ liệu cũ
  delete from public.kthm_session where uid = p_uid;
  insert into public.kthm_user_reset(uid, n, at) values (p_uid, 1, now())
    on conflict (uid) do update set n = public.kthm_user_reset.n + 1, at = now();

  perform public._admin_log('reset', p_uid, jsonb_build_object('lt', coalesce(p_lt, false), 'backup', bak));
  return jsonb_build_object('ok', true, 'backup', bak, 'lt', coalesce(p_lt, false));
end $$;

-- khôi phục bản sao gần nhất trước lần reset (chỉ khi tài khoản chưa tạo dữ liệu mới)
create or replace function public.admin_reset_undo(p_uid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare b public.kthm_admin_reset_bak;
begin
  perform public._admin_chk();
  select * into b from public.kthm_admin_reset_bak where uid = p_uid order by id desc limit 1;
  if not found then raise exception 'NO_BACKUP'; end if;
  if exists(select 1 from public.saves where user_id = p_uid) then raise exception 'HAS_NEW_DATA'; end if;
  insert into public.saves(user_id, data, rev) values (p_uid, b.data, 1);
  delete from public.kthm_admin_reset_bak where id = b.id;
  delete from public.kthm_session where uid = p_uid;
  perform public._admin_log('reset_undo', p_uid, jsonb_build_object('bak_at', b.at));
  return jsonb_build_object('ok', true, 'bak_at', b.at);
end $$;

revoke all on function public.admin_reset_account(uuid, boolean), public.admin_reset_undo(uuid) from public, anon, authenticated;
grant execute on function public.admin_reset_account(uuid, boolean), public.admin_reset_undo(uuid) to authenticated;
grant execute on function public.admin_find(text) to authenticated;

notify pgrst, 'reload schema';
