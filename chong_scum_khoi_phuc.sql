-- Fix429 · Chống "scum" bản lưu: đập đồ thất bại -> quay về mốc cũ. (an toàn chạy lại nhiều lần; KHÔNG đụng push_save)
-- Lỗ hổng: ☁ Tài khoản → Khôi phục theo thời điểm cho quay về mốc 10 phút/lần, không giới hạn số lần
--          => cường hóa/đúc/ép… thất bại thì quay lại mốc cũ làm lại (cũng có thể nhân đôi đồ sau khi bán/giao dịch rồi quay về).
-- Cách vá (người chơi thường; tài khoản trong kthm_admin không bị giới hạn):
--   1) Mỗi tài khoản chỉ được khôi phục 1 lần / 24 giờ và tối đa 3 lần / 7 ngày (restore_snapshot + restore_backup dùng CHUNG hạn mức).
--   2) Không cho quay về mốc 'frequent' (10 phút) và 'prerestore' (đổi qua đổi lại). Còn lại: hourly/force/daily/drop/peak.
--   3) Ghi nhật ký restore_log để admin soát tài khoản khôi phục nhiều/ nghi lách.
--   4) restore_status(): client hỏi còn bao lâu mới được khôi phục.
-- Hạn mức đổi ở 3 biến đầu mỗi hàm (cd_h, max_7d). Hoàn tác: chong_scum_khoi_phuc_ROLLBACK.sql

create table if not exists public.restore_log(
  id bigserial primary key,
  user_id uuid not null,
  at timestamptz not null default now(),
  kind text not null,          -- 'snapshot' | 'backup'
  snap_id bigint,
  why text,
  snap_at timestamptz,
  cur_lv int,
  cur_tier int
);
create index if not exists restore_log_u_idx on public.restore_log(user_id, at desc);
alter table public.restore_log enable row level security;
revoke all on public.restore_log from public, anon, authenticated;

-- Trạng thái hạn mức của người gọi
create or replace function public.restore_status() returns jsonb
 language plpgsql security definer set search_path to 'public'
as $function$
declare uid uuid := auth.uid(); cd_h int := 24; max_7d int := 3;
        isadm boolean; last_at timestamptz; n7 int; nxt timestamptz; nxt7 timestamptz;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  isadm := exists(select 1 from public.kthm_admin a where a.uid = uid);
  if isadm then return jsonb_build_object('locked', false, 'admin', true); end if;
  select max(at) into last_at from public.restore_log where user_id = uid;
  select count(*) into n7 from public.restore_log where user_id = uid and at > now() - interval '7 days';
  nxt := case when last_at is null then null else last_at + make_interval(hours => cd_h) end;
  if n7 >= max_7d then
    select min(at) + interval '7 days' into nxt7 from (
      select at from public.restore_log where user_id = uid and at > now() - interval '7 days' order by at desc limit max_7d) q;
    if nxt is null or nxt7 > nxt then nxt := nxt7; end if;
  end if;
  return jsonb_build_object('locked', nxt is not null and nxt > now(), 'next_at', nxt, 'used_7d', n7, 'max_7d', max_7d, 'cd_h', cd_h);
end $function$;

-- Danh sách mốc: ẩn 'frequent' và 'prerestore' với người chơi thường
create or replace function public.list_snapshots() returns jsonb
 language plpgsql security definer set search_path to 'public'
as $function$
declare uid uuid := auth.uid(); isadm boolean;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  isadm := exists(select 1 from public.kthm_admin a where a.uid = uid);
  return coalesce((
    select jsonb_agg(x.j order by x.t desc, x.o desc) from (
      select taken_at t, id o, jsonb_build_object('id', id, 'at', taken_at, 'rev', rev, 'tier', tier, 'lv', lv, 'why', why,
                                                  'gold', data->'k2'->>'gold') j
        from public.saves_history where user_id = uid and (isadm or why not in ('frequent','prerestore'))
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
        why_ text; at_ timestamptz; isadm boolean; st jsonb;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  isadm := exists(select 1 from public.kthm_admin a where a.uid = uid);
  select * into r from public.saves where user_id = uid for update;   -- khoá dòng: không gọi song song để lách hạn mức
  if not found then return jsonb_build_object('status', 'none'); end if;

  if not isadm then
    st := public.restore_status();
    if (st->>'locked')::boolean then
      return jsonb_build_object('status', 'cooldown', 'next_at', st->'next_at', 'used_7d', st->'used_7d', 'max_7d', st->'max_7d');
    end if;
  end if;

  if p_id = 0 then
    select data, 'peak', taken_at into src, why_, at_ from public.saves_peak where user_id = uid;
  elsif p_id < 0 then
    select data, kind, taken_at into src, why_, at_ from public.saves_guard where id = -p_id and user_id = uid;
  else
    select data, why, taken_at into src, why_, at_ from public.saves_history where id = p_id and user_id = uid;
  end if;
  if src is null then return jsonb_build_object('status', 'none'); end if;
  if not isadm and why_ in ('frequent', 'prerestore') then
    return jsonb_build_object('status', 'blocked');
  end if;

  select b.o_tier, b.o_lv into ot, ol from public.kthm_best(r.data) b;
  insert into public.saves_history(user_id, rev, tier, lv, why, data) values (uid, r.rev, ot, ol, 'prerestore', r.data);
  insert into public.restore_log(user_id, kind, snap_id, why, snap_at, cur_lv, cur_tier) values (uid, 'snapshot', p_id, why_, at_, ol, ot);
  nrev := r.rev + 1;
  update public.saves set data = src, backup = r.data, backup_at = now(), rev = nrev, updated_at = now() where user_id = uid;
  return jsonb_build_object('status', 'ok', 'rev', nrev, 'data', src);
end $function$;

-- "Khôi phục bản sao lưu" (đổi data <-> backup) cũng phải chịu cùng hạn mức, nếu không sẽ lách bằng cách đổi qua lại.
create or replace function public.restore_backup() returns jsonb
 language plpgsql security definer set search_path to 'public'
as $function$
declare uid uuid := auth.uid(); r public.saves; nrev bigint; ot int; ol int; isadm boolean; st jsonb;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  isadm := exists(select 1 from public.kthm_admin a where a.uid = uid);
  select * into r from public.saves where user_id = uid for update;
  if not found or r.backup is null then return jsonb_build_object('status', 'none'); end if;
  if not isadm then
    st := public.restore_status();
    if (st->>'locked')::boolean then
      return jsonb_build_object('status', 'cooldown', 'next_at', st->'next_at', 'used_7d', st->'used_7d', 'max_7d', st->'max_7d');
    end if;
  end if;
  select b.o_tier, b.o_lv into ot, ol from public.kthm_best(r.data) b;
  insert into public.restore_log(user_id, kind, snap_id, why, snap_at, cur_lv, cur_tier) values (uid, 'backup', null, 'backup', r.backup_at, ol, ot);
  nrev := r.rev + 1;
  update public.saves set data = r.backup, backup = r.data, backup_at = now(), rev = nrev, updated_at = now() where user_id = uid;
  return jsonb_build_object('status', 'ok', 'rev', nrev, 'data', r.backup);
end $function$;

revoke all on function public.restore_status() from public, anon;
revoke all on function public.list_snapshots() from public, anon;
revoke all on function public.restore_snapshot(bigint) from public, anon;
revoke all on function public.restore_backup() from public, anon;
grant execute on function public.restore_status() to authenticated;
grant execute on function public.list_snapshots() to authenticated;
grant execute on function public.restore_snapshot(bigint) to authenticated;
grant execute on function public.restore_backup() to authenticated;

-- Soát tài khoản nghi scum (chạy tay khi cần):
--   select user_id, count(*) n, max(at) from public.restore_log where at > now() - interval '30 days' group by 1 order by n desc;
