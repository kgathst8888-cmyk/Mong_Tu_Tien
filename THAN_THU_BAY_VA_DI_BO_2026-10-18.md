# Fix270 — Chỉ Chu Tước & Thanh Long bay; Bạch Hổ & Huyền Vũ đi trên mặt đất

| Thần thú | k | Di chuyển |
|---|---|---|
| Bạch Hổ | 0 | Mặt đất (cấp 4 không còn lơ lửng) |
| Chu Tước | 1 | Bay tự do |
| Thanh Long | 2 | Bay tự do |
| Huyền Vũ | 3 | Mặt đất (không còn lơ lửng 44–62) |

## Đã đổi
- `pets/24-than-thu-bay.js`: `PFLY.on()` chỉ true với k=1,2 (và khi nút 🕊 Bay tự do đang BẬT). Thú k=0,3 dùng hành vi "theo chủ" của engine/vstep: không lượn khắp bản đồ, tự dịch về cạnh chủ khi cách >480px, chỉ lao vào địch trong tầm đánh quanh chủ. Thêm `idleGround()` cho Làng/Thành/Mỏ/Linh Điền: hạ về mặt đất + chân chạy theo quãng đường thực. Tab 🐾 Thú: Hổ/Huyền Vũ hiện dòng ghi chú "chỉ đi trên mặt đất", chỉ Chu Tước/Thanh Long có nút bay.
- `pets/27-bach-ho.js`: `base=0` (cấp 4 trước đây lơ lửng 16).
- `pets/31-than-thu-co-che.js`: cờ `ground:1` cho Huyền Vũ → không nhấp nhô/lơ lửng; bổ nhào thành cú lao thấp (nảy ~10), kỹ năng đứng yên mặt đất, đi bộ nảy nhẹ như engine gốc.

## Giữ nguyên
Kỹ năng, hiệu ứng, hồi sinh, tiến hoá của cả 4 thú; cú vồ nhảy của Bạch Hổ (nhảy rồi tiếp đất). Cánh của Bạch Hổ cấp 4 vẫn là hình vẽ cũ (không bay).
Cờ lưu `PS[cur].thb` (nút Bay tự do) không đổi, chỉ còn tác dụng với Chu Tước/Thanh Long.
