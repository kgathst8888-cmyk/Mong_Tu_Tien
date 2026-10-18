# Fix301 — Thôn Tân Thủ thấy người chơi khác với ngoại hình đầy đủ
- Trước: làng (world/41 + village_presence.sql) chỉ đồng bộ lớp/nhánh/cảnh giới; áo quần, cánh, hiệu ứng lấy theo trang bị của máy mình.
- Nay: làng dùng cơ chế "Thành Thị Online" (world/77 + thanh_online.sql) như map 3 → đồng bộ thật: áo quần theo cảnh giới (tier), cánh cao nhất đã hợp (wg), trang bị/cường hoá, thời trang, môn phái, đạo thể, pháp bảo bản mệnh, hồn phách, ý cảnh, thú nuôi, danh hiệu; chạm vào người khác xem hồ sơ (kèm tên cánh), biểu cảm 👋 như cũ.
- BẮT BUỘC: chạy lại `thanh_online.sql` 1 lần trong Supabase → SQL Editor (an toàn chạy lại; thêm map 3 + trả `map` trong cp_ping). Chưa chạy → game tự dùng làng cũ (world/41), KHÔNG lẫn người Linh Giới vào làng.
- File đổi: world/77-thanh-online.js (map 3, vDraw, tự lùi khi máy chủ cũ) · world/41-lang-online.js (vdraw gọi CITYOL.vDraw khi map 3; 41 tự tắt ping) · thanh_online.sql · index.html (?v=301 cho 41 và 77) · tài liệu này.
- Chưa thử trên trình duyệt thật + Supabase thật (chỉ kiểm cú pháp). Nếu thấy lệch vị trí nhãn/vùng chạm ở làng, báo lại.
