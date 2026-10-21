-- =====================================================================
-- THÁNH KHÍ · CHỌN CHO NHÂN VẬT (Fix395) — chạy SAU thanh_khi.sql. AN TOÀN KHI CHẠY LẠI.
-- Supabase → SQL Editor → New query → dán toàn bộ → Run.
--
--   * tk_use(p_kind) : trừ 1 món Thánh Khí (1=Kiếm 2=Cung 3=Khiên 4=Trượng) trong kho tài khoản (cột k1..k4 của tk_user)
--                      khi một nhân vật CHỌN món đó để tinh luyện (cấp 1). NGUYÊN TỬ; không đủ → status 'poor'.
--   => Mỗi món dung hợp ở Nhà Tinh Luyện chỉ chuyển được cho 1 nhân vật.
-- =====================================================================
create or replace function public.tk_use(p_kind int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tk_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind is null or p_kind < 1 or p_kind > 4 then return json_build_object('status', 'bad'); end if;
  insert into public.tk_user(uid) values (v_u) on conflict (uid) do nothing;
  select * into r from public.tk_user where uid = v_u for update;
  if (case p_kind when 1 then r.k1 when 2 then r.k2 when 3 then r.k3 else r.k4 end) < 1 then
    return json_build_object('status', 'poor', 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
  end if;
  update public.tk_user set
      k1 = k1 - (p_kind = 1)::int, k2 = k2 - (p_kind = 2)::int,
      k3 = k3 - (p_kind = 3)::int, k4 = k4 - (p_kind = 4)::int, updated = now()
   where uid = v_u returning * into r;
  return json_build_object('status', 'ok', 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
end $$;

revoke all on function public.tk_use(int) from public, anon;
grant execute on function public.tk_use(int) to authenticated;
