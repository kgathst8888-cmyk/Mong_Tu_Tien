# Fix256 · Cổng Treo Máy thay cổng Bản Đồ
- File sửa: world/80-map-treo.js (không đụng module khác)
- Cổng Treo Máy vẽ đúng vị trí toà số 4 (trước là cổng Bản Đồ); cổng Treo Máy cũ ở mép phải làng đã gỡ.
- Chỉ áp dụng ở làng Tân Thủ (plain()); Linh Giới giữ nguyên. Cổng Bản Đồ Tân Thủ không còn vẽ/chạm được (openB(4) bị chặn). Vào bản đồ chỉ qua nút 🗺 Bản đồ ở thanh dưới.
- Fix257: mỗi lần về làng Tân Thủ hiện mũi tên vàng chỉ vào nút Bản đồ (id mpb), nhấp nháy 3 lần rồi mất (world/80-map-treo.js).
