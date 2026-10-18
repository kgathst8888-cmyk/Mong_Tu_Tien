# Fix304 — Dịch chuyển từ mục 🗺 Bản đồ
- Module mới: `world/101-ban-do-dich-chuyen.js` (window.BDT). Nạp sau world/100 trong index.html (?v=304).
- Patch 1 dòng: `core/01p-bag-pet-ui.js` (tab==6) chèn `BDT.html()` lên đầu bảng bản đồ.
- 4 điểm đến: Làng Tân Thủ 1, Làng Tân Thủ 2 (TT2.eligible: Lv60 Phàm Thể), Linh Giới và Tiên Giới (cần hạ Ma Thần, lgDone).
- Chưa đủ điều kiện → nút khoá 🔒 + điều kiện. Đang trong phụ bản/boss (dg) → không dịch chuyển.
- Sửa điều kiện: bảng REQ trong module. Tắt: bỏ <script> và bỏ `BDT` ở core/01p.

## Gọn giao diện bảng bản đồ
- Dịch chuyển: lưới thẻ 2×2 (tên + 1 dòng trạng thái: đang ở đây / mô tả ngắn / 🔒 điều kiện).
- Bản đồ luyện cấp và Chiến trường Linh Giới nằm trong nhóm gập (<details>); Linh Giới tự mở khi đang ở Linh Giới.
- CSS riêng trong module (#bdt-css), phạm vi .bdt nên không ảnh hưởng bảng khác.
- core/01p tab==6: tách mr/lu/ft rồi gọi BDT.panel(...); không có BDT thì hiển thị như cũ.
