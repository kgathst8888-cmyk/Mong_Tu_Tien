# Fix219 — Thành Thị Linh Giới: cổng lùi ra sau, nhân vật lùi xuống, cổng Ác Ma lên cạnh mặt trăng

Yêu cầu: đẩy các cổng ra phía sau, nhân vật lùi xuống một chút cho rộng rãi; cổng boss Ác Ma đặt cạnh mặt trăng.

File đã sửa (patch nhỏ, không đụng phần khác):
- `world/58-linh-gioi-city-art.js` — `BASEY` 520 → 556: cả cảnh (cổng, nhãn, trận pháp, cột sáng Về Làng) dịch lên 36 đơn vị ảnh so với dòng chân nhân vật. Chỉnh độ lùi: đổi số 556.
- `world/92-dung-tren-dat.js` — thêm `VDY.kc` (=16): riêng Thành Thị, nhân vật/thú cưng/thanh tên/người chơi online vẽ thấp thêm `kc*s` px (chỉ dịch vẽ, không đổi logic). Chỉnh: `VDY.kc`.
- `world/62-ac-ma-thuong-gioi.js` — cổng Ác Ma: `GPX=880, GPY=-122, GLB=-270` (toạ độ ảnh 1320×743; trăng ở (1010,-170), tâm xoáy cổng = GPY-66*GK ≈ -170). Nhãn có chặn trên (≥60px). Thêm `G.hit`: vùng chạm riêng (nhãn + xoáy cổng) vì cổng nằm trên trời.
- `world/10-farming-map.js` — `LCT.tap`: gate có `hit` được xét trước; gate khác giữ vùng chạm cũ. Chạm cổng Ác Ma → nhân vật đi tới đúng chân cổng (x≈880) rồi hỏi vào như cũ.
- `world/58-linh-gioi-city-art.js` (thêm) — bỏ 3 tiên nhân tầng GẦN (mảng `IMM`, tầng 2, bay lớn trước sân); còn tầng XA và GIỮA. Muốn bật lại: thêm dòng tầng 2 vào cuối `IMM`.
