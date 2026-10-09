-- =====================================================================
-- TIÊU LINH THẠCH (Supabase) — chạy sau cho_giao_dich.sql, an toàn khi chạy lại.
--   * cho_spend(p_n, p_why): trừ p_n Linh Thạch trong ví tài khoản ☁ (nguyên tử, không âm).
--       trả 'ok' + số dư mới | 'poor' + số dư hiện có | 'bad' (p_n ngoài 1..1000) | 'auth'.
--   * cho_bal(): số dư + số viên đã kiếm hôm nay (đọc nhẹ, không đụng hòm nhận/tin đăng).
--   Dùng cho: đột phá tầng Linh Căn (tầng 2-10: 10💎 · 11-14: 20💎 · 15 viên mãn: 300💎).
-- =====================================================================
create or replace function public.cho_spend(p_n int, p_why text default '') returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_n int := coalesce(p_n, 0); v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if v_n < 1 or v_n > 1000 then return json_build_object('status','bad'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  update public.cho_wallet set lt = lt - v_n, updated = now()
   where uid = v_u and lt >= v_n returning lt into v_lt;
  if not found then
    select lt into v_lt from public.cho_wallet where uid = v_u;
    return json_build_object('status','poor','lt',coalesce(v_lt,0));
  end if;
  return json_build_object('status','ok','lt',v_lt);
end $$;

create or replace function public.cho_bal() returns json
language plpgsql security definer stable set search_path = public as $$
declare v_u uuid := auth.uid(); v_lt bigint; v_e int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select lt into v_lt from public.cho_wallet where uid = v_u;
  select n into v_e from public.cho_daily where uid = v_u and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  return json_build_object('status','ok','lt',coalesce(v_lt,0),'earned',coalesce(v_e,0));
end $$;

revoke all on function public.cho_spend(int, text), public.cho_bal() from public, anon, authenticated;
grant execute on function public.cho_spend(int, text), public.cho_bal() to authenticated;
