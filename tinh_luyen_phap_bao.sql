-- =====================================================================
-- TINH LUYỆN PHÁP BẢO (Làng Tân Thủ 3 · Nhà Số 2) — Fix352
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI.
-- PHẢI chạy SAU tuyet_nguc.sql (dùng chung bảng tn_user và kho nguyên liệu).
--
--   * Thêm cột tn_user.star (0-5): số ★ tinh luyện của tài khoản. Máy chủ giữ, máy khách chỉ đọc.
--   * tn_me() được thay bản mới: trả thêm 'star' (các trường cũ giữ nguyên → Nhà Số 1 vẫn chạy bình thường).
--   * tn_refine(p_to): lên ★ p_to (phải đúng = ★ hiện tại + 1). Trừ nguyên liệu trong kho tn_user, tăng ★, NGUYÊN TỬ.
--     Vàng + Linh Thạch trừ ở máy khách trước (giống Tuyết Ngục / Chiến Trường); lỗi thì máy khách tự hoàn.
--
--   Chi phí nguyên liệu mỗi ★ (khớp TLP_CF trong world/110-tinh-luyen-phap-bao.js — đổi một nơi phải đổi cả hai):
--       ★1: 10❄         ★2: 20❄ 5🔷       ★3: 30❄ 5🔷      ★4: 40❄ 10🔷 5🌙     ★5: 50❄ 10🔷 5🌙
--       tổng 150 ❄ Tuyết Tinh · 30 🔷 Hàn Ngọc Tủy · 10 🌙 Huyết Nguyệt Hạch
--   (Vàng / Linh Thạch / cấp pháp bảo yêu cầu do máy khách kiểm tra — xem TLP_CF.)
-- =====================================================================
do $$
begin
  if to_regclass('public.tn_user') is null then
    raise exception 'Chưa có bảng tn_user — hãy chạy tuyet_nguc.sql trước';
  end if;
end $$;

alter table public.tn_user add column if not exists star int not null default 0;

-- Thay tn_me: thêm 'star' (giữ nguyên các trường cũ)
create or replace function public.tn_me() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u;
  return json_build_object('status', 'ok', 'used', r.used, 'left', greatest(3 - r.used, 0), 'best', r.best,
    'tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh, 'dtt', r.d_tt, 'dhn', r.d_hn, 'dhh', r.d_hh, 'star', r.star);
end $$;

-- Lên ★: trừ nguyên liệu trong kho + tăng ★ (nguyên tử)
create or replace function public.tn_refine(p_to int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user; c_tt int; c_hn int; c_hh int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_to is null or p_to < 1 or p_to > 5 then return json_build_object('status', 'bad'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u for update;
  if r.star >= 5 then return json_build_object('status', 'max', 'star', r.star); end if;
  if p_to <> r.star + 1 then return json_build_object('status', 'bad', 'star', r.star); end if;

  c_tt := (array[10, 20, 30, 40, 50])[p_to];
  c_hn := (array[0, 5, 5, 10, 10])[p_to];
  c_hh := (array[0, 0, 0, 5, 5])[p_to];
  if r.mt_tt < c_tt or r.mt_hn < c_hn or r.mt_hh < c_hh then
    return json_build_object('status', 'poor', 'star', r.star,
      'tot', json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh));
  end if;

  update public.tn_user
     set star = p_to, mt_tt = mt_tt - c_tt, mt_hn = mt_hn - c_hn, mt_hh = mt_hh - c_hh
   where uid = v_u
  returning * into r;

  return json_build_object('status', 'ok', 'star', r.star,
    'tot', json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh));
end $$;

revoke all on function public.tn_me(), public.tn_refine(int) from public, anon;
grant execute on function public.tn_me(), public.tn_refine(int) to authenticated;
