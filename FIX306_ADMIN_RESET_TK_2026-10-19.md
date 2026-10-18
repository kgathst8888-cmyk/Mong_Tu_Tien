# Fix306 — Admin: reset tài khoản người chơi + hiện tên nhân vật theo từng gmail
Làm trên bản Fix305b_LangTanThu3.

## Cài đặt (bắt buộc cho tính năng mới)
Supabase → SQL Editor → chạy `admin_reset_tk.sql` (1 lần, chạy lại an toàn). Cần đã chạy admin.sql + linh_thach_khoa.sql.

## Tab 👤 Tài khoản
- Mỗi gmail hiện thêm dòng 🧙 tên nhân vật (Lv) lấy từ bản lưu trên mây. Tìm kiếm nhận thêm TÊN NHÂN VẬT.
- Mở một tài khoản → mục ♻ Reset tài khoản:
  - ♻ Reset: xoá bản lưu, lịch sử, đỉnh cao, xếp hạng, đồ đang bán chợ; đá khỏi game. Mặc định GIỮ Linh Thạch; tick "xoá cả Linh Thạch" để xoá luôn. Hỏi xác nhận 2 lần. Không áp dụng cho tài khoản admin.
  - ↩ Khôi phục bản trước reset: chỉ khi người đó chưa tạo dữ liệu mới (giữ 3 bản sao gần nhất, người chơi không thấy được).
- systems/10c-user-reset-live.js: máy người chơi tự xoá dữ liệu cũ và tải lại khi bị reset, chặn việc đẩy ngược bản cũ lên mây.

## File đổi
ui/70-admin-panel.js · index.html (thêm script 10c, ui/70 ?v=306) · mới: admin_reset_tk.sql, systems/10c-user-reset-live.js, file này.
Lưu ý: thư hệ thống còn hạn (≤14 ngày) có thể được nhận lại sau reset.

## Fix307 — Gợi ý Mã chung toàn game
Tab 🎟 Mã quà đã hỗ trợ sẵn mã chung (ma_qua.sql): nhập Mã, để trống Số lượt, Số mã = 1. Chỉ thêm dòng hướng dẫn trong form; ui/70 ?v=307.
