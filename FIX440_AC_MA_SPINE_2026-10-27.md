# Fix440 — Ác Ma Vương dùng nhân vật Spine (ch35022)
- Chỉ đổi hình boss Ác Ma Thượng Giới; AI, máu, sát thương, vòng báo trước, thưởng giữ nguyên.
- Mới: `world/143-ac-ma-spine.js`, `assets/ac-ma-spine/ac_ma_vuong.webp`, `tools/bake_spine_boss.py`.
- Sửa nhỏ: `world/62-ac-ma-thuong-gioi.js` (2 chỗ gọi vẽ trong dgFoe), `index.html` + `MODULE_MANIFEST.json` (thêm module 143).
- Ánh xạ: đứng/xuất hiện=idle · đi=move · Liệt Diệm Trảm & Xuyên Tâm Thích=attack · Thiên Ma Trấn Địa/Huyết Nguyệt/Cửu U Diệt Thế=skill · bị đánh=hit.
- Chỉnh cỡ: `ACMA_SPX.H` (mặc định 260); tắt: `ACMA_SPX.enable=false`; ảnh lỗi → tự vẽ bộ khung cũ.
- Hiệu năng: ảnh chỉ tải khi boss được vẽ (tải xong mới hiện, không nháy), không vẽ ~60s thì tự nhả bộ nhớ (`ACMA_SPX.idle`).
- Bake lại: `python3 tools/bake_spine_boss.py <thư mục json/atlas/png> ac_ma_vuong assets/ac-ma-spine 320 1`

## Fix441 — chỉnh sức mạnh & thưởng (world/62-ac-ma-thuong-gioi.js)
- Máu boss ×5 (`CF.hp=5`), sát thương boss ×3 (`CF.atk=3`) — nhân thêm trên `CF.mul=20` so với Kiếm Thánh → máu ×100, sát thương ×60. Nhãn hiển thị (hộp xác nhận, thẻ cổng, HUD) tự cập nhật theo `KL()`.
- Hạ boss: tỉ lệ `CF.pSH=0.10` rơi thêm `CF.nSH=3` Mảnh Thánh (qua `HL.addSH`, có thông báo màn hình). Chỉnh tỉ lệ/số lượng ở `CF`.
- Fix442: Linh Thạch khoá khi hạ boss 10 → 60 (thêm 50), chỉnh ở `CF.lk`.
