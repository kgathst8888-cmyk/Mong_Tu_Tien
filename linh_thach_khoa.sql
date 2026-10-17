-- =====================================================================
-- LINH THẠCH KHOÁ (THEO TỪNG NHÂN VẬT) / KHÔNG KHOÁ (DÙNG CHUNG) — Supabase.
-- Chạy SAU cho_giao_dich.sql, cho_linh_thach_boss.sql, cho_kiem_thanh.sql, cho_linh_thach_spend.sql, admin.sql. An toàn khi chạy lại.
--
--   cho_wallet.lt         = 💎 KHÔNG KHOÁ — DÙNG CHUNG cả tài khoản (3 nhân vật): nạp tiền (admin cộng) + tiền bán đồ ở Chợ.
--                           Dùng được ở Chợ Online và mua Thẻ Trưởng Thành.
--   cho_lock(uid, slot, n)= 🔒 KHOÁ — RIÊNG TỪNG NHÂN VẬT (slot 0,1,2): kiếm từ đánh Boss / Kiếm Thánh. KHÔNG mua đồ ở Chợ được.
--
--   * cho_earn(p_n, p_slot) / cho_earn_ks(p_n, p_slot): cộng vào ô khoá của nhân vật p_slot. (Trần 500/ngày của cho_earn vẫn tính theo TÀI KHOẢN.)
--   * cho_spend(p_n, p_why, p_unlocked, p_slot): mặc định trừ KHOÁ của nhân vật p_slot trước rồi mới tới không khoá;
--       p_unlocked = true → CHỈ trừ không khoá (Thẻ Trưởng Thành). Khoá của nhân vật khác KHÔNG bị đụng tới.
--   * cho_bal / cho_me / cho_earn / cho_earn_ks / cho_spend trả 'lt' (không khoá) + 'lks' = [khoá slot0, slot1, slot2].
--   * admin_find trả 'lt', 'lks' và 'lk' (tổng 3 nhân vật). admin_grant_lt vẫn cộng vào lt (không khoá) = nạp tiền.
--   * Số dư khoá cũ ở cột cho_wallet.lt_lock (nếu còn) được chuyển sang slot 0 rồi cột bị xoá.
--   * Chợ (cho_buy) không đổi: chỉ trừ cột lt (không khoá); người bán nhận 95% vào lt.
-- =====================================================================
create table if not exists public.cho_lock(
  uid  uuid     not null,
  slot smallint not null check (slot between 0 and 2),
  n    bigint   not null default 0 check (n >= 0),
  primary key (uid, slot));
alter table public.cho_lock enable row level security;   -- không có policy: chỉ truy cập qua hàm security definer

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='cho_wallet' and column_name='lt_lock') then
    insert into public.cho_lock(uid, slot, n) select uid, 0, lt_lock from public.cho_wallet where lt_lock > 0
      on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
    alter table public.cho_wallet drop column lt_lock;
  end if;
end $$;

create or replace function public._lks(p_uid uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_array(
    coalesce((select n from public.cho_lock where uid = p_uid and slot = 0), 0),
    coalesce((select n from public.cho_lock where uid = p_uid and slot = 1), 0),
    coalesce((select n from public.cho_lock where uid = p_uid and slot = 2), 0)) $$;

-- ---------- kiếm từ Boss → KHOÁ của nhân vật ----------
drop function if exists public.cho_earn(int);
create or replace function public.cho_earn(p_n int default 1, p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_n int  := greatest(1, least(coalesce(p_n, 1), 50));
  v_used int; v_got int; v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  insert into public.cho_daily(uid, day, n) values (v_u, v_d, 0) on conflict do nothing;
  select n into v_used from public.cho_daily where uid = v_u and day = v_d for update;
  if v_used = 0 then delete from public.cho_daily where uid = v_u and day < v_d - 7; end if;
  v_got := greatest(0, least(v_n, 500 - v_used));
  if v_got > 0 then
    update public.cho_daily set n = n + v_got where uid = v_u and day = v_d;
    insert into public.cho_lock(uid, slot, n) values (v_u, v_s, v_got)
      on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
  end if;
  select lt into v_lt from public.cho_wallet where uid = v_u;
  return json_build_object('status', case when v_got > 0 then 'ok' else 'cap' end,
                           'got', v_got, 'today', v_used + v_got, 'max', 500,
                           'lt', coalesce(v_lt, 0), 'lks', public._lks(v_u));
end $$;

-- ---------- Kiếm Thánh → KHOÁ của nhân vật ----------
drop function if exists public.cho_earn_ks(int);
create or replace function public.cho_earn_ks(p_n int default 2, p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
        v_n int := greatest(1, least(coalesce(p_n, 2), 20)); v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  insert into public.cho_lock(uid, slot, n) values (v_u, v_s, v_n)
    on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
  update public.cho_wallet set updated = now() where uid = v_u returning lt into v_lt;
  return json_build_object('status','ok','lt',v_lt,'lks',public._lks(v_u),'got',v_n);
end $$;

-- ---------- tiêu: khoá của nhân vật trước, rồi tới không khoá (hoặc chỉ không khoá) ----------
drop function if exists public.cho_spend(int, text);
drop function if exists public.cho_spend(int, text, boolean);
create or replace function public.cho_spend(p_n int, p_why text default '', p_unlocked boolean default false, p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
        v_n int := coalesce(p_n, 0); v_lt bigint; v_lk bigint; v_take bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if v_n < 1 or v_n > 20000 then return json_build_object('status','bad'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  insert into public.cho_lock(uid, slot, n) values (v_u, v_s, 0) on conflict do nothing;
  select lt into v_lt from public.cho_wallet where uid = v_u for update;
  select n  into v_lk from public.cho_lock where uid = v_u and slot = v_s for update;
  if coalesce(p_unlocked, false) then
    if v_lt < v_n then return json_build_object('status','poor','lt',v_lt,'lks',public._lks(v_u)); end if;
    v_take := 0;
  else
    if v_lt + v_lk < v_n then return json_build_object('status','poor','lt',v_lt,'lks',public._lks(v_u)); end if;
    v_take := least(v_lk, v_n);
  end if;
  if v_take > 0 then update public.cho_lock set n = n - v_take where uid = v_u and slot = v_s; end if;
  update public.cho_wallet set lt = lt - (v_n - v_take), updated = now() where uid = v_u returning lt into v_lt;
  return json_build_object('status','ok','lt',v_lt,'lks',public._lks(v_u));
end $$;

create or replace function public.cho_bal() returns json
language plpgsql security definer stable set search_path = public as $$
declare v_u uuid := auth.uid(); v_lt bigint; v_e int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select lt into v_lt from public.cho_wallet where uid = v_u;
  select n into v_e from public.cho_daily where uid = v_u and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  return json_build_object('status','ok','lt',coalesce(v_lt,0),'lks',public._lks(v_u),'earned',coalesce(v_e,0));
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
  return json_build_object('status','ok','lt',v_lt,'lks',public._lks(v_u),'earned',coalesce(v_e,0),'inbox',v_in,'mine',v_my,'sold',v_sold);
end $$;

-- ---------- admin_find: thêm lks (từng nhân vật) + lk (tổng) ----------
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
           exists(select 1 from public.kthm_admin a where a.uid = u.id) as is_admin
      from auth.users u
      left join public.cho_wallet   w on w.uid = u.id
      left join public.kthm_session s on s.uid = u.id
      left join public.chat_bans    b on b.uid = u.id
     where case when q = ':online' then (s.seen is not null and s.seen > now() - interval '3 minutes')
                else (q = '' or u.email ilike '%' || q || '%' or u.id::text = q) end
     order by u.last_sign_in_at desc nulls last
     limit 30) t;
  return r;
end $$;

revoke all on function public._lks(uuid) from public, anon, authenticated;
revoke all on function public.cho_earn(int, int), public.cho_earn_ks(int, int), public.cho_spend(int, text, boolean, int), public.cho_bal(), public.cho_me() from public, anon, authenticated;
grant execute on function public.cho_earn(int, int), public.cho_earn_ks(int, int), public.cho_spend(int, text, boolean, int), public.cho_bal(), public.cho_me() to authenticated;
