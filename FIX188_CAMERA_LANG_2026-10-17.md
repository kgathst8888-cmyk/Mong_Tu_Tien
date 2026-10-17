# Fix188 — camera làng + bảng chẩn đoán
- world/61-lang-gian-rong.js: camera dùng bề rộng màn hình thật (realW), chốt cứng nhân vật trong ≤80% màn hình; ghi lỗi vẽ vào VWD.err.
- Mở game với `?dbg=1` để hiện bảng chẩn đoán (Px, cam, scr, begun, TT, gate, ERR) góc trái dưới.

## Fix189 — tốc độ đi bộ ở làng
- world/61: `WALK=.75` giảm tốc độ đi bộ riêng ở làng thường (chỉnh bằng `VWD.walk(số)`, 1 = như cũ). Linh Điền/Mỏ/Thành Thị không đổi.
