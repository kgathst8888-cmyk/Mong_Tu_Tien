# Fix404 + Fix405 — Mỏ Vàng cố định & tối ưu hầm mỏ (2026-10-22)
## Fix404
- CFG.auTbl: Mỏ Vàng Lv1..5 = 30k/40k/50k/60k/70k vàng/phút (Nguyên Anh thu thập), không nhân cấp nhân vật/cảnh giới/bonus/nghề.
## Fix405 — tối ưu vẽ hầm mỏ (world/13-mining.js)
- Nền hầm tĩnh (vách đá, nhũ đá, xà gỗ, ray, nền) + vignette vẽ 1 lần vào 2 canvas phụ (cMake), mỗi khung chỉ drawImage; tự vẽ lại khi đổi kích thước màn hình.
- Phần động giữ nguyên: ánh đèn lồng nhấp nháy, bụi lơ lửng (máy QL>=1: 12 hạt thay vì 24).
- Giới hạn hạt đào tối đa 140; rời hầm thì giải phóng canvas phụ + xoá hạt/chữ bay.
- Có đường dự phòng vẽ trực tiếp như cũ nếu tạo canvas phụ lỗi. Không đổi gameplay.
- Chi tiết nhỏ: ánh đèn lồng giờ phủ lên thân đèn (trước đây nằm dưới).
