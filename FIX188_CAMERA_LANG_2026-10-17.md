# Fix188 — camera làng + bảng chẩn đoán
- world/61-lang-gian-rong.js: camera dùng bề rộng màn hình thật (realW), chốt cứng nhân vật trong ≤80% màn hình; ghi lỗi vẽ vào VWD.err.
- Mở game với `?dbg=1` để hiện bảng chẩn đoán (Px, cam, scr, begun, TT, gate, ERR) góc trái dưới.

## Fix189 — tốc độ đi bộ ở làng
- world/61: `WALK=.75` giảm tốc độ đi bộ riêng ở làng thường (chỉnh bằng `VWD.walk(số)`, 1 = như cũ). Linh Điền/Mỏ/Thành Thị không đổi.

## Fix192 — về cơ chế cũ: không camera, thấy toàn bản đồ
- world/61-lang-gian-rong.js: cờ `WIDE_ON=false` tắt làng rộng + camera bám nhân vật ở Thôn Tân Thủ (vw()=bề rộng màn hình). Bật lại: đặt `WIDE_ON=true`. Tốc độ đi bộ làng (WALK) giữ nguyên; thêm `VWD.plain()` cho module khác.
- world/80-map-treo.js: nhận diện làng thường qua `VWD.plain()` để cổng Map Treo vẫn hiện.
- world/58-linh-gioi-city-art.js: `K()=vw()/IW` (ảnh Thành Thị Linh Giới vừa khít khung), camera `max=0` nên không cuộn.

## Fix193 — đứng trên đường, cổng Treo Máy nhỏ lại
- world/92-dung-tren-dat.js (mới, nạp sau 80): ở Thôn Tân Thủ, hero/thú cưng/thanh tên dịch xuống `VDY.k*s` (=16) để đứng trên lề đường lát đá thay vì ngay chân tường nhà. Chỉnh `VDY.k` (0 = như cũ). Không áp dụng ở Linh Điền/Mỏ/Thành Thị/Tiên Giới/hầm ngục.
- world/41-lang-online.js: người chơi online dịch cùng độ lệch.
- world/80-map-treo.js: cổng Treo Máy thu nhỏ `CF.gateK=.72` (vùng chạm co theo).

## Fix194 — tên cổng nhỏ ở màn dọc · xoay màn hình · hạt thú bay
- world/58, 62, 65: khi màn dọc (`PORT`) bảng tên cổng dùng tên ngắn (`sn`), phụ đề chỉ lấy đoạn đầu, cỡ chữ 6.5–8.5 (trước 12–18) → không đè lên cổng bên cạnh. Màn ngang giữ nguyên.
- core/01a-base-data.js: xoay dọc→ngang trên iOS Safari hay báo kích thước cũ nên canvas giữ cỡ cũ (mất/lệch bản đồ). Nay đo lại sau 50/150/300/550/900/1500ms, thêm ResizeObserver, visualViewport, screen.orientation và đồng hồ tự kiểm tra 400ms.
- world/58 blit(): khi dựng lại lớp nền (đổi độ nét do xoay) → giải phóng lớp cũ, lỗi thì thử độ nét thấp hơn, vẫn lỗi thì vẽ nền trời thay vì bỏ trống.
- pets/24-than-thu-bay.js: step() thoát sớm khi ở Làng/Thành Thị nên mảng hạt `PT` không bao giờ tàn, trong khi draw() vẫn vẽ → "chấm chấm" đứng yên khắp bản đồ. Nay vstep làm già/xoá hạt (giới hạn 160) và thú bay chỉ thêm vệt khi PT<120.
- core/01e-step-loop.js (Fix194b): vilClean() — vào Làng thì xoá PT/PJ/FX và số sát thương DT còn sót từ bản đồ quái; trong Làng bỏ hết hạt PT, DT/FX tàn dần bình thường (trước đây đứng yên mãi vì step() thoát sớm).
- Màn ngang: tên cổng Linh Giới cũng thu nhỏ (9–12). Fix194c: bỏ hẳn hạt PT ở mọi bản đồ (core/01j, systems/19-arena).
