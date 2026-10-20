-- =====================================================================
-- ĐAN PHÒNG CAO CẤP (Làng Tân Thủ 3 · Nhà Số 3) — Fix353
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI.
-- PHẢI chạy SAU tuyet_nguc.sql (dùng chung kho nguyên liệu trong bảng tn_user). Không đổi bảng, chỉ thêm 1 hàm.
--
--   * tn_brew(p_kind): luyện 1 viên đan loại p_kind (1..3). Trừ ❄ Tuyết Tinh làm chất dẫn trong kho tn_user, NGUYÊN TỬ.
--     Dược thảo (Linh Điền) + vàng + 💎 do máy khách trừ trước; lỗi thì máy khách tự hoàn (giống Tuyết Ngục / Tinh Luyện).
--
--   Chất dẫn mỗi viên (khớp DPC_CF trong world/111-dan-phong-cao-cap.js — đổi một nơi phải đổi cả hai):
--       loại 1 (🧊 Hàn Băng Đan)            : 1 ❄
--       loại 2 (🛡 Ngọc Tủy Hộ Thể Đan)     : 1 ❄
--       loại 3 (🌙 Nguyệt Hạch Bạo Đan)     : 2 ❄
-- =====================================================================
do $$
begin
  if to_regclass('public.tn_user') is null then
    raise exception 'Chưa có bảng tn_user — hãy chạy tuyet_nguc.sql trước';
  end if;
end $$;

create or replace function public.tn_brew(p_kind int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user; c_tt int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind is null or p_kind < 1 or p_kind > 3 then return json_build_object('status', 'bad'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u for update;

  c_tt := (array[1, 1, 2])[p_kind];
  if r.mt_tt < c_tt then
    return json_build_object('status', 'poor',
      'tot', json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh));
  end if;

  update public.tn_user set mt_tt = mt_tt - c_tt where uid = v_u returning * into r;

  return json_build_object('status', 'ok', 'kind', p_kind,
    'tot', json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh));
end $$;

revoke all on function public.tn_brew(int) from public, anon;
grant execute on function public.tn_brew(int) to authenticated;
