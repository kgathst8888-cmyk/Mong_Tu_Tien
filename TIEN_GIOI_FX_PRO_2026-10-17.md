# Fix167 — Nâng cấp đồ hoạ hiệu ứng kỹ năng Tiên Giới (2.5D)

File mới: `world/82-tien-gioi-fx-pro.js` (nạp sau world/81). Chỉ vẽ, không đổi sát thương/hồi chiêu.
- Ghi đè 27 công thức `TG8SK.R.*` của world/79 (môn phái, Ý Cảnh Tiên/Ma, Pháp Bảo, Linh Căn): trận bát quái, vệt đuôi thon, tia sét phân nhánh, trăng khuyết quét, tinh thể băng, cột sáng, hạt theo hệ môn phái.
- Hiệu ứng trúng đòn trên quái Tiên Giới (có độ trễ theo loại chiêu, chí mạng có sao 8 cánh), hiệu ứng quái chết (linh hồn bay lên), vết chém đòn thường.
- Nút kỹ năng #tg8-sk: viền nhịp thở khi sẵn sàng, tối + số giây khi hồi chiêu.
Vá nhỏ world/81: móc `TGFX.hit` trong `hitMon`, bỏ vẽ KF cũ khi module bật, xuất `TGQ.KF`.
Chỉnh: `TGFX_CF.enable`, `TGFX_CF.q` (mật độ hạt, máy yếu tự 0.6), `TGFX_CF.maxHit`. Tắt: bỏ `<script>` trong index.html.
