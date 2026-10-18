# Fix305 — Làng Tân Thủ 3 (Lv100, 5 nhà tạm khoá)
- Module mới: `world/102-lang-tan-thu-3.js` (window.TT3). Nạp sau world/101 trong index.html (?v=305).
- Cổng truyền tống giữa Làng Tân Thủ 1 (cạnh cổng Làng 2). Điều kiện: Lv100 (`REQ_LV`). Chưa đủ → cổng xám + thông báo.
- Cảnh: đêm tuyết, trăng đỏ, mai trắng; 5 nhà bị xích + ổ khoá + dấu niêm 封, chạm → "đang tạm khoá". Mở nhà: sửa HOUSES, bỏ locked, thêm open().
- Chưa có online: patch 1 dòng `world/77` (mapId trả 0 khi TT3.on) và 1 điều kiện `world/41` (inVillage).
- `world/101`: thêm điểm dịch chuyển ❄ Làng Tân Thủ 3 (khoá nếu chưa Lv100).
- Tắt: bỏ <script> 102 (và dòng TT3 ở 41/77/101 vô hại nếu thiếu module).
