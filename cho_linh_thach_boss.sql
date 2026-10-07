-- =====================================================================
-- LINH THẠCH TỪ BOSS (Supabase) — chạy sau cho_giao_dich.sql, an toàn khi chạy lại.
--   * Mỗi boss hạ được = 1 Linh Thạch 💎 vào ví tài khoản ☁.
--   * Tối đa 500 viên / ngày / tài khoản (ngày tính theo giờ Việt Nam, đổi lúc 00:00 GMT+7).
--   * Máy chủ tự cắt theo trần ngày; mỗi lần gọi tối đa 50 viên (client gom lô).
--   * cho_me trả thêm 'earned' (số viên đã kiếm hôm nay) để hiện "x/500" trong Chợ.
-- =====================================================================
create table if not exists public.cho_daily(
  uid uuid not null,
  day date not null,
  n   int  not null default 0 check (n >= 0),
  primary key(uid, day)
);
alter table public.cho_daily enable row level security;
revoke all on public.cho_daily from anon, authenticated;

create or replace function public.cho_earn(p_n int default 1) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_n int  := greatest(1, least(coalesce(p_n, 1), 50));
  v_used int; v_got int; v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_daily(uid, day, n) values (v_u, v_d, 0) on conflict do nothing;
  select n into v_used from public.cho_daily where uid = v_u and day = v_d for update;
  if v_used = 0 then delete from public.cho_daily where uid = v_u and day < v_d - 7; end if;
  v_got := greatest(0, least(v_n, 500 - v_used));
  if v_got > 0 then
    update public.cho_daily set n = n + v_got where uid = v_u and day = v_d;
    insert into public.cho_wallet(uid, lt) values (v_u, v_got)
      on conflict (uid) do update set lt = public.cho_wallet.lt + excluded.lt, updated = now()
      returning lt into v_lt;
  else
    select lt into v_lt from public.cho_wallet where uid = v_u;
  end if;
  return json_build_object('status', case when v_got > 0 then 'ok' else 'cap' end,
                           'got', v_got, 'today', v_used + v_got, 'max', 500, 'lt', coalesce(v_lt, 0));
end $$;

create or replace function public.cho_me() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_lt bigint; v_in json; v_my json; v_sold json; v_e int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  with ex as (
    update public.cho_listing set status = 'expired'
     where seller = v_u and status = 'active' and expires <= now() returning item)
  insert into public.cho_inbox(uid, item, why) select v_u, item, 'Hết hạn' from ex;
  select lt into v_lt from public.cho_wallet where uid = v_u;
  select n into v_e from public.cho_daily where uid = v_u and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  select coalesce(json_agg(t order by t.id), '[]'::json) into v_in from (
    select id, item, why from public.cho_inbox where uid = v_u order by id limit 50) t;
  select coalesce(json_agg(t order by t.id desc), '[]'::json) into v_my from (
    select id, item, price, extract(epoch from expires)::bigint as exp
      from public.cho_listing where seller = v_u and status = 'active') t;
  with s as (
    update public.cho_listing set seen = true
     where seller = v_u and status = 'sold' and not seen
     returning id, item, price, (price * 95 / 100) as net)
  select coalesce(json_agg(s), '[]'::json) into v_sold from s;
  return json_build_object('status','ok','lt',v_lt,'earned',coalesce(v_e,0),'inbox',v_in,'mine',v_my,'sold',v_sold);
end $$;

revoke all on function public.cho_earn(int), public.cho_me() from public, anon, authenticated;
grant execute on function public.cho_earn(int), public.cho_me() to authenticated;
