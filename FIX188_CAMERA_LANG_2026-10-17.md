# Fix188 — camera làng + bảng chẩn đoán
- world/61-lang-gian-rong.js: camera dùng bề rộng màn hình thật (realW), chốt cứng nhân vật trong ≤80% màn hình; ghi lỗi vẽ vào VWD.err.
- Mở game với `?dbg=1` để hiện bảng chẩn đoán (Px, cam, scr, begun, TT, gate, ERR) góc trái dưới.

## Fix189 — tốc độ đi bộ ở làng
- world/61: `WALK=.75` giảm tốc độ đi bộ riêng ở làng thường (chỉnh bằng `VWD.walk(số)`, 1 = như cũ). Linh Điền/Mỏ/Thành Thị không đổi.

## Fix192 — về cơ chế cũ: không camera, thấy toàn bản đồ
- world/61-lang-gian-rong.js: cờ `WIDE_ON=false` tắt làng rộng + camera bám nhân vật ở Thôn Tân Thủ (vw()=bề rộng màn hình). Bật lại: đặt `WIDE_ON=true`. Tốc độ đi bộ làng (WALK) giữ nguyên; thêm `VWD.plain()` cho module khác.
- world/80-map-treo.js: nhận diện làng thường qua `VWD.plain()` để cổng Map Treo vẫn hiện.
- world/58-linh-gioi-city-art.js: `K()=vw()/IW` (ảnh Thành Thị Linh Giới vừa khít khung), camera `max=0` nên không cuộn.
