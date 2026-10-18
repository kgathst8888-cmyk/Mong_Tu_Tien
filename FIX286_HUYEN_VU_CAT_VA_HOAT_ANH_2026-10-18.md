# Fix286 — Cắt gọn 4 hình Huyền Vũ + hoạt ảnh đi / đánh mềm mại (2026-10-18)

## Ảnh (assets/game-assets.js: a048–a051)
- Xoá phần thừa: vỏ trứng (cấp 1), tảng đá + dải đá dưới bụng (cấp 2), bóng đổ dưới đất cả 4 cấp, mảng trắng trong vòng rắn (cấp 3–4). Cắt sát mép sinh vật, đáy ảnh = đáy chân.
- core/01l-loot-weapons-data.js: `HVZ` theo kích thước mới; `HVH` nhân theo tỉ lệ cắt nên thú KHÔNG đổi cỡ ([17.7, 40, 48.9, 62]); thêm `HVM` = vị trí miệng (u,v) mỗi hình.

## Hoạt ảnh (core/01d-pet-render.js `hvDraw` viết lại; pets/31-than-thu-co-che.js)
- Vẽ bằng lưới 20×16 mảnh, mỗi mảnh dịch theo thời gian (bỏ mảnh trong suốt cho nhẹ).
- Đi: chân trước/sau lệch pha, nhấc–bước–đặt; thân lắc nhẹ + nhún theo nhịp chân; đầu gật; rắn/đuôi đung đưa và bị kéo lùi theo tốc độ; bụi nhỏ ở mỗi bước chân. Đứng yên: thở + đầu gật + rắn đung đưa.
- Bắn (đòn thường): thu đầu lùi → vươn đầu nhả đạn đúng nhịp từng phát (cấp 3 bắn 2, cấp 4 bắn 3), rắn quất theo. Đạn nay xuất phát từ MIỆNG thật của từng hình (đầu rắn/rồng từ cấp 2) kèm chớp đầu nòng.
- Bổ nhào: ngồi xuống lấy đà → bật nhảy (chân co) → đầu lao tới, nghiêng người → va đất ép dẹt + bụi.
- Kỹ năng: chồm hai chân trước, đầu rắn ngóc cao → giậm xuống (ép dẹt, bụi, ánh sáng lóe).
- make() (chỉ thú đi đất `ground`): quay đầu mượt (lật ảnh có chuyển tiếp thay vì đảo tức thời); bỏ nảy EP.y khi đi/đánh thường (nhún nằm trong hvDraw nên bóng đất không giật).
## Chỉnh nhanh
- Biên độ bước: `stride`, `lift` trong `hvDraw`; vùng đầu mỗi hình: `HV_HEAD`; số mảnh: `C`,`R`.
