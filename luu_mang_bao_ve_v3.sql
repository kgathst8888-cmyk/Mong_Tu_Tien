-- Fix297 · Bảo vệ dữ liệu v3 (an toàn chạy lại nhiều lần). KHÔNG đụng push_save.
-- 1) Bảng saves_guard: ảnh chụp ĐƯỢC GIỮ LÂU, không bị push_save xoá xoay vòng.
--    'daily' mỗi ~24h (giữ 14 bản) · 'drop' chụp bản cũ NGAY KHI bản mới bị tụt bậc/cấp (giữ 20 bản)
-- 2) Trigger trên saves: tự chụp, mọi lỗi trong trigger đều bị nuốt -> KHÔNG BAO GIỜ làm hỏng việc lưu.
-- 3) list_snapshots / restore_snapshot: thêm mốc guard (id âm) và 'đỉnh cao nhất' (id = 0). Client cũ vẫn dùng được.
-- Hoàn tác: luu_mang_bao_ve_v3_ROLLBACK.sql

create table if not exists public.saves_guard(
  id bigserial primary key,
  user_id uuid not null,
  kind text not null,
  rev bigint,
  tier int,
  lv int,
  taken_at timestamptz not null default now(),
  data jsonb not null
);
create index if not exists saves_guard_u_idx on public.saves_guard(user_id, kind, taken_at desc);
alter table public.saves_guard enable row level security;
revoke all on public.saves_guard from public, anon, authenticated;

create or replace function public.saves_guard_trg() returns trigger
 language plpgsql security definer set search_path to 'public'
as $f$
declare ot int; ol int; opw bigint; nt int; nl int; npw bigint;
begin
  begin
    if OLD.data is null or OLD.data is not distinct from NEW.data then return NEW; end if;
    select o_tier, o_lv, o_pw into ot, ol, opw from public.kthm_best(OLD.data);
    select o_tier, o_lv, o_pw into nt, nl, npw from public.kthm_best(NEW.data);
    if coalesce(opw,-1) >= 0 then
      -- chụp hằng ngày
      if not exists(select 1 from public.saves_guard where user_id=OLD.user_id and kind='daily' and taken_at > now() - interval '20 hours') then
        insert into public.saves_guard(user_id,kind,rev,tier,lv,data) values (OLD.user_id,'daily',OLD.rev,ot,ol,OLD.data);
        delete from public.saves_guard where user_id=OLD.user_id and kind='daily'
          and id not in (select id from public.saves_guard where user_id=OLD.user_id and kind='daily' order by taken_at desc, id desc limit 14);
      end if;
      -- chụp khi tụt bậc, hoặc cùng bậc mà tụt từ 3 cấp trở lên (cách nhau >= 5 phút để không tràn)
      if (nt < ot or (nt = ot and nl <= ol - 3))
         and not exists(select 1 from public.saves_guard where user_id=OLD.user_id and kind='drop' and taken_at > now() - interval '5 minutes') then
        insert into public.saves_guard(user_id,kind,rev,tier,lv,data) values (OLD.user_id,'drop',OLD.rev,ot,ol,OLD.data);
        delete from public.saves_guard where user_id=OLD.user_id and kind='drop'
          and id not in (select id from public.saves_guard where user_id=OLD.user_id and kind='drop' order by taken_at desc, id desc limit 20);
      end if;
    end if;
  exception when others then
    null;  -- tuyệt đối không chặn việc lưu
  end;
  return NEW;
end $f$;

drop trigger if exists saves_guard_before_update on public.saves;
create trigger saves_guard_before_update before update of data on public.saves
  for each row execute function public.saves_guard_trg();

create or replace function public.list_snapshots() returns jsonb
 language plpgsql security definer set search_path to 'public'
as $function$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  return coalesce((
    select jsonb_agg(x.j order by x.t desc, x.o desc) from (
      select taken_at t, id o, jsonb_build_object('id', id, 'at', taken_at, 'rev', rev, 'tier', tier, 'lv', lv, 'why', why,
                                                  'gold', data->'k2'->>'gold') j
        from public.saves_history where user_id = uid
      union all
      select taken_at, id, jsonb_build_object('id', -id, 'at', taken_at, 'rev', rev, 'tier', tier, 'lv', lv, 'why', kind,
                                              'gold', data->'k2'->>'gold')
        from public.saves_guard where user_id = uid
      union all
      select taken_at, 0, jsonb_build_object('id', 0, 'at', taken_at, 'rev', rev, 'tier', tier, 'lv', lv, 'why', 'peak',
                                             'gold', data->'k2'->>'gold')
        from public.saves_peak where user_id = uid
    ) x), '[]'::jsonb);
end $function$;

create or replace function public.restore_snapshot(p_id bigint) returns jsonb
 language plpgsql security definer set search_path to 'public'
as $function$
declare uid uuid := auth.uid(); r public.saves; src jsonb; nrev bigint; ot int; ol int;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  select * into r from public.saves where user_id = uid for update;
  if not found then return jsonb_build_object('status', 'none'); end if;
  if p_id = 0 then
    select data into src from public.saves_peak where user_id = uid;
  elsif p_id < 0 then
    select data into src from public.saves_guard where id = -p_id and user_id = uid;
  else
    select data into src from public.saves_history where id = p_id and user_id = uid;
  end if;
  if src is null then return jsonb_build_object('status', 'none'); end if;
  select b.o_tier, b.o_lv into ot, ol from public.kthm_best(r.data) b;
  insert into public.saves_history(user_id, rev, tier, lv, why, data) values (uid, r.rev, ot, ol, 'prerestore', r.data);
  nrev := r.rev + 1;
  update public.saves set data = src, backup = r.data, backup_at = now(), rev = nrev, updated_at = now() where user_id = uid;
  return jsonb_build_object('status', 'ok', 'rev', nrev, 'data', src);
end $function$;

revoke all on function public.list_snapshots() from public, anon;
revoke all on function public.restore_snapshot(bigint) from public, anon;
grant execute on function public.list_snapshots() to authenticated;
grant execute on function public.restore_snapshot(bigint) to authenticated;
