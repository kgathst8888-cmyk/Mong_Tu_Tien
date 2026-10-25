# Fix432 — Thu hồi toàn bộ đồ Thánh + sửa lỗi trang bị + tối ưu nhẹ

## Thu hồi đồ Thánh
- SQL (chạy 1 lần, có sao lưu `thanh_thuhoi_bak`): `fix432_thu_hoi_do_thanh.sql`. Hoàn tác: `fix432_thu_hoi_do_thanh_ROLLBACK.sql`.
- Máy khách: `world/140-thu-hoi-do-thanh.js` (thẻ `?v=432`). Mỗi nhân vật xử lý 1 lần khi đăng nhập: gỡ đồ Bộ Thánh (it.hl) ở ô mặc + Túi, xoá Thánh Khí `PS[slot].tkq`, đẩy mây xong mới báo máy chủ.
- Máy chủ: Thánh Khí kho tài khoản (tk_user.k1..k4) về 0; đồ Thánh trên Chợ / hòm thư Chợ bị xoá (đã sao lưu).
- KHÔNG đụng: Mảnh Thánh, Mảnh Thánh Khí, nguyên liệu. Lò Thánh vẫn mở.
- Lưu ý: Tiên Nhân chỉ mặc được đồ Thánh → bị trống trang bị. Công tắc `CF.keepTienNhan` đầu file 140.
- Chưa chạy thử trên Supabase thật.

## Lỗi trang bị (core/01k, 01l, 01p, world/76)
- Túi đầy + tự mặc đồ mới → đồ quý đang mặc (cường hóa/chế tác/Thần Thoại+/Thánh) bị bán lặng lẽ. Nay `eqp` từ chối (trả false), `give` rơi về luồng nhặt thường.
- `un()` báo "Túi đầy"; `un()`/`sl1()` chặn chọn lỗi thời; world/76 trả false khi chặn Tiên Nhân.
- Fuzz 4.000 thao tác: mất đồ lặng lẽ 41 → 0.

## Hiệu năng
- world/134: chỉnh màu đêm gộp 2 lượt tô → 1 (dựng sprite Tiên Giới nhanh hơn).
- Đo: JS mỗi khung nhẹ (không shadowBlur, timer ~không đáng kể); hiệu ứng đêm ~0,36 ms/khung.
