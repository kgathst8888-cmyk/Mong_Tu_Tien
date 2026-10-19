# Fix338 — Làm lại bản đồ Bế Quan Đài (vẽ bằng code, hợp tông Thành Thị Linh Giới)

**Vấn đề:** nền cũ là ảnh biển mây sáng (HPA.bg, 860×796 bị kéo giãn) có người đá xanh — lệch tông tối/tím/vàng của game, nhân vật đi trên đường sàn không khớp với đài trong ảnh.

**Làm mới:** `world/57a-be-quan-dai-art.js` (API `BQART.paint`), vẽ hoàn toàn bằng canvas, 3 lớp cache + lớp động:
- Trời tím sao + trăng ngọc có vòng sáng, cực quang (rèm dựng sẵn trượt ngang), sao nháy, sao băng (~12s/lần).
- Núi đá tiên 3 tầng (sương xa gần), 2 đảo nổi có điện các, biển mây + mây trôi.
- Sân đá lát (phối cảnh), lan can con tiện + đèn đá nhấp nháy, tùng cổ, pha lê ngọc.
- 4 bia đá khắc 佛 妖 仙 冥 = 4 hồn phách; bia của hồn phách đang chọn sáng rực + cột sáng.
- Đài tròn trận pháp (3 bậc, bát quái, hoa sen), dải sáng chạy vòng, vòng ấn khắc trên sân, linh khí bay lên.
- Sàn đi lại vẫn là y=GY, hồn phách ngồi (W/2, GY-2s). Thích ứng dọc/ngang; cache dựng lại khi đổi kích thước.
- `window.QL>=2`: tắt cực quang, giảm mây/linh khí.

**Sửa trong `world/57-hon-phach.js`:** `draw()` gọi `BQART.paint`; nếu lỗi/thiếu module thì tự về ảnh cũ (`drawOld`, ảnh chỉ nạp khi cần). Dòng gợi ý cuối màn hình đổi sang viên mờ viền ngọc.
**index.html:** thêm `57a-be-quan-dai-art.js?v=337` trước 57 (+ `?v=337` cho 57 để điện thoại không giữ cache cũ).
Ảnh `HPA.bg` còn nằm trong assets (không xoá, dùng làm dự phòng).
