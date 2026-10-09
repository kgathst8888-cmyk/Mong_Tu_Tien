-- =====================================================================
-- LINH THẠCH TỪ BOSS KIẾM THÁNH (Supabase) — chạy sau cho_giao_dich.sql, an toàn khi chạy lại.
--   * cho_earn_ks(p_n): cộng Linh Thạch 💎 vào ví tài khoản ☁ khi hạ Kiếm Thánh.
--   * KHÔNG có trần ngày (khác cho_earn của boss thường: 500/ngày). Game gửi 2 viên mỗi lần hạ Kiếm Thánh.
--   * Mỗi lần gọi tối đa 20 viên (client có thể gom lô). Cần đăng nhập.
--   * Lưu ý: game tính kết quả ở máy người chơi nên hàm này tin client; nếu cần chống gian lận,
--     thêm giới hạn thời gian (vd. 1 lần / 10 phút = thời gian hồi sinh boss) ở phía máy chủ.
-- =====================================================================
create or replace function public.cho_earn_ks(p_n int default 2) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u  uuid := auth.uid();
  v_n  int  := greatest(1, least(coalesce(p_n, 2), 20));
  v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  update public.cho_wallet set lt = lt + v_n, updated = now()
   where uid = v_u returning lt into v_lt;
  return json_build_object('status','ok','lt',v_lt,'got',v_n);
end $$;

revoke all on function public.cho_earn_ks(int) from public, anon;
grant execute on function public.cho_earn_ks(int) to authenticated;
