# Fix379 — Rà lỗi & chống khai thác (2026-10-21)

## Đã sửa trong code game
1. **Chỉnh giờ máy để lách giới hạn ngày/tuần** (lỗ hổng lớn nhất): điểm danh, quà online, nhiệm vụ ngày/tuần, vòng quay miễn phí, Chiến Trường, Cửa Hàng Chiến Công, Bế Quan Đài (nhập định/Tâm Ma), quà sự kiện đều đọc giờ máy người chơi.
   → Module mới `core/00b-dong-ho-tin-cay.js` (nạp ngay sau error-handler): `Date.now()` và `new Date()` trả giờ MÁY CHỦ, đo từ tiêu đề `Date` của phản hồi Supabase. Lệch <2 phút bỏ qua; chưa đo được thì giữ giờ máy. Dự phòng tuỳ chọn: `dong_ho_may_chu.sql` (RPC `kthm_now`) nếu trình duyệt không đọc được tiêu đề Date.
2. **Nhân bản đồ ở Chợ** (`systems/32-cho-giao-dich.js`): `cho_ack` lỗi bị nuốt → món vẫn nằm trong hòm nhận; bán/hợp món đó rồi mở lại chợ → nhận thêm 1 bản. Nay ghi sổ id đã nhận (localStorage `kthm_cho_ack`) TRƯỚC khi gọi mạng, ack thử lại 3 lần, lần sau chỉ ack lại chứ không phát lại.
3. **Mất Linh Thạch khi đổi nhân vật lúc đang trừ 💎 ở Đài Trận Pháp** (`world/57b-be-quan-nang-cap.js`): trước đây trừ tiền xong mất quyền lợi; nay xếp hàng và cộng khi quay lại nhân vật cũ.

## SQL cần chạy trên Supabase (CHƯA chạy — chưa thử trên DB thật)
- `fix379_bxh_xac_thuc_push_save.sql`: bảng xếp hạng/bản cao nhất không còn tin `p_lv/p_tier` do client gửi; lấy trần từ chính dữ liệu lưu (kthm_best). Hoàn tác: `luu_mang_bao_ve_v3b_push_save.sql`.
- `fix379_bxh_xac_thuc_rank2.sql`: `rank2_submit` chặn trần lv/cảnh giới theo bản lưu thật. `pw` (chiến lực) vẫn do client báo → nên xếp hạng theo cấp/cảnh giới. Hoàn tác: `xep_hang_mot_nhan_vat.sql`.
- `dong_ho_may_chu.sql` (tuỳ chọn, xem mục 1).

## Giới hạn còn lại (thành thật)
- Game lưu toàn bộ trạng thái ở máy khách: người am hiểu mở DevTools vẫn sửa được biến trong RAM (vàng, kết quả Tâm Ma…). Chữ ký toàn vẹn localStorage dùng muối nằm trong mã nguồn nên chỉ cản được sửa thô. Muốn chặn hẳn phải chuyển phần thưởng/tiền tệ sang RPC máy chủ từng tính năng.
- Chiến Công, Điểm danh, Tâm Ma, Cửa Hàng Chiến Công vẫn tính ở máy khách.
- Các `world/*` hiệu ứng, assets: không thay đổi.
