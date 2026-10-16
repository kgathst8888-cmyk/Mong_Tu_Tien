# Thành Thị Online (Fix145) — gặp nhau ở Linh Giới & Tiên Giới
1. Chạy `thanh_online.sql` 1 lần trong Supabase → SQL Editor (tạo bảng `city_presence`, hàm `cp_ping`, `cp_ap`, `cp_leave`).
2. Đăng nhập ☁, vào Thành Thị Linh Giới hoặc Thiên Môn Tiên Giới → thấy người chơi khác cùng bản đồ (tối đa 20 người gần nhất), tên + cấp trên đầu, đi lại mượt.
3. Chạm vào người khác: xem hồ sơ (cấp, lớp, nhánh, cảnh giới, cánh, đạo thể, thú nuôi). Nút 👋 bên trái: biểu cảm 👋😄🙏⚔️ (thấy ~4 giây). Số người online hiện cạnh nút 👋.
4. Ngoại hình đồng bộ thật: lớp/nhánh, cảnh giới, cánh, trang bị (vũ khí/cường hoá), thời trang, môn phái, đạo thể, pháp bảo bản mệnh, hồn phách, ý cảnh, thú nuôi.
   Ngoại hình chỉ gửi khi đổi (hoặc 30s/lần); người khác tải bằng `cp_ap` rồi lưu đệm → mỗi lần ping chỉ ~vài trăm byte.
5. Cơ chế: ping ~2.5s (báo vị trí + nhận danh sách); im >12s tự biến mất; rời bản đồ/ẩn tab → `cp_leave`. Mỗi bản đồ tách riêng (map 1 = Linh Giới, map 2 = Tiên Giới).

## File đã sửa / thêm
- Mới: `world/77-thanh-online.js`, `thanh_online.sql`, tài liệu này.
- `world/61-tien-gioi-thanh.js`: gọi `CITYOL.tgList()/tgDraw()` trong drawTG (xếp chiều sâu cùng công trình) + `CITYOL.tap()` khi chạm.
- `world/48-phap-bao-bon-menh.js`: thêm `FABAO.ghost(ar,tm)` để vẽ pháp bảo của người khác (không đụng trạng thái pháp bảo của mình).
- `world/41-lang-online.js`: làng thường không còn ping khi đang ở 2 thành thị (`inVillage()`).
- `index.html`, `MODULE_MANIFEST.json`: thêm 77 sau 76.

## Lưu ý
- Vẽ người khác bằng cách mượn tạm P/cur/EQ/PS[ci]/HDAO.on/EP rồi trả ngay (như Đấu Trường). Đạo Thể của người khác phụ thuộc module 51 đọc `HDAO.on()` mỗi lần vẽ — nếu thấy không hiện, báo lại để mình xem.
- Kiểm tra: `tools/check.py` OK; chạy thử logic bằng môi trường giả (ping → tải ngoại hình → hero/thú/pháp bảo vẽ đúng, trạng thái của mình được trả nguyên). Chưa thử trên trình duyệt thật + Supabase thật.
