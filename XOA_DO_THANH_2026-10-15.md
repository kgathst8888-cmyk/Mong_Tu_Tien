# Xoá đồ Thánh cũ + bù 200 Mảnh Thánh (Fix90)
- core/01b-items-sets-wheel.js (khối HL): `wipeOld()` + `WV/WBONUS`; `HL.load` chạy 1 lần/bản lưu (cờ `S.w`): xoá đồ Thánh cũ (hl=1, không có g) ở cả 3 nhân vật (mặc + túi), cộng +200 Mảnh Thánh.
- `gen()` đánh dấu đồ Thánh mới `g:1` → chế sau bản này không bị xoá.
- Game mới (`HL.reset`) đặt `S.w=WV` → không được bù.
- Chợ online: chạy `xoa_do_thanh_2026-10-15.sql` trong Supabase (an toàn chạy lại nhiều lần).
- Muốn xoá + bù thêm lần nữa: tăng `WV`.
