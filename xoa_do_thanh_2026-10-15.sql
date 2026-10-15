-- =====================================================================
-- XOÁ ĐỒ THÁNH CŨ TRÊN CHỢ ONLINE (Supabase)
-- Chạy: Supabase → SQL Editor → New query → dán → Run. AN TOÀN CHẠY LẠI NHIỀU LẦN.
--   * Chỉ xoá đồ Thánh CŨ (hl = 1 và KHÔNG có cờ g). Đồ Thánh chế sau bản cập nhật có g = 1 nên không bị đụng.
--   * Xoá cả món đang bán (cho_listing) lẫn món nằm trong hòm nhận (cho_inbox).
--   * Phần bù 200 Mảnh Thánh do game tự cộng vào bản lưu của từng người khi họ vào game (1 lần / bản lưu).
-- Nên chạy NGAY sau khi đưa bản game mới lên; chạy thêm 1 lần sau vài giờ để quét đồ từ tab cũ còn mở.
-- =====================================================================
delete from public.cho_inbox
 where (item->>'hl') = '1' and (item->>'g') is null;

delete from public.cho_listing
 where status = 'active' and (item->>'hl') = '1' and (item->>'g') is null;

-- Kiểm tra: phải ra 0 / 0
select (select count(*) from public.cho_listing where status='active' and (item->>'hl')='1' and (item->>'g') is null) as con_tren_cho,
       (select count(*) from public.cho_inbox   where (item->>'hl')='1' and (item->>'g') is null) as con_trong_hom;
