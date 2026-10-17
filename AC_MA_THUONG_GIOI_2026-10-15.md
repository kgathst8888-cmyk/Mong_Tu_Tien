# Ác Ma Thượng Giới (cổng mới ở Thành Thị Linh Giới) — đã chuyển sang bản Fix168

- **Cổng (Fix168)**: ô "Hư Không Truyền Tống" đã thành Tiên Giới (`world/61`), nên boss có **cổng thứ 7 riêng** (cuối `LCT.gates`), đặt giữa Hợp Đạo Đài và Kiếm Thánh Đài, vẽ xoáy đỏ. Cùng kiểu `world/65-cong-ve-lang.js` (chỉ bọc `LGART.gx` / `LGART.gate`). Chỉnh vị trí/cỡ: `GPX, GPY, GLB, GK` trong `world/62-ac-ma-thuong-gioi.js`. Chạm cổng → hộp xác nhận → vào trận.
- **Điều kiện vào**: nhân vật đã Hợp Đạo (Đạo Thể, `HDAO.on()`). Chưa đủ điều kiện sẽ báo "Chỉ nhân vật Đạo Thể mới vào được".
- **Bản đồ**: ảnh người chơi cung cấp (`assets/ac-ma-assets.js`, khoá `ACMA_ASSETS.bg`), đã tách boss; lòng cổng ma ở giữa là xoáy động vẽ bằng canvas.
- **Chỉ có 1 boss, không có quái**: Ác Ma Vương bước ra từ cổng giữa bản đồ (~2,7 giây, trong lúc đó không thể bị đánh).
- **Sức mạnh**: HP và sát thương GẤP 20 LẦN Kiếm Thánh (đọc `KTHANH.cfg`, nên luôn bám theo Kiếm Thánh); DEF bằng Kiếm Thánh. Chỉnh `CF.mul`.
- **Chiêu thức** (boss vẽ bằng bộ khung có khớp, chuyển động mượt, mọi đòn có vòng báo trước dưới đất):
  đi bộ · Liệt Diệm Trảm (chém ngang) · Xuyên Tâm Thích (lao tới đâm) · Thiên Ma Trấn Địa (nhảy vọt giáng xuống) ·
  Huyết Nguyệt Phún Trào (5 cột lửa) · Cửu U Diệt Thế (dưới 50% máu; an toàn nếu áp sát chân boss).
- **Thưởng** (`CF.rw = 10`): vàng, mảnh chế tạo, 5 món trang bị phẩm Thiên Thần, tu vi, Mảnh Sách Thần Thông. Không có thời gian hồi.
- **Khác Fix83**: mỗi món trang bị rơi theo `EQD.boss` (như Ma Thần/Kiếm Thánh ở Fix168); `systems/67-tang-quai-boss.js` nhân thêm máu ×3 / sát thương ×2 cho mọi boss `k==="boss"` (kể cả Ác Ma) nên tỉ lệ ×20 so với Kiếm Thánh vẫn giữ nguyên.
- Khung dùng chung với Kiếm Thánh/Ma Thần: `dgSp, dgAI, dgTick, dgHurt, dgFoe, dgHud, bgd, drop`.

## File
- Mới: `world/62-ac-ma-thuong-gioi.js`, `assets/ac-ma-assets.js`, `AC_MA_THUONG_GIOI.md`
- Sửa nhỏ: `index.html` (2 thẻ script, đặt ngay sau `world/83-map-treo-fx-pro.js`, trước `systems/67`), `MODULE_MANIFEST.json`, SYMBOL_INDEX.tsv + MODULE_MAP.md (tự làm mới); (bản build `Mong_Tu_Tien_CLAUDE.html` tự sinh bằng `python3 tools/check.py --build`)
- Không sửa module nào khác (lỗi setter của `world/58-linh-gioi-city-art.js` đã được sửa sẵn ở bản này).
