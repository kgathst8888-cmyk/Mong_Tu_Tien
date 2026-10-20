# Fix359 — Thiên Lôi Cổ Địa (ghép vào v22) + hình riêng boss
- File mới: `world/114-thien-loi-co-dia.js` (window.TLC). Nạp sau world/113 trong index.html (?v=359), có trong MODULE_MANIFEST.json. Không sửa core/engine; chỉ bọc `gm`, `bgd`, `step`, `foe`, `BDT.panel`.
- Vào: mục 🗺 Bản đồ (nhà Bản Đồ Làng 1) → ⚡ Thiên Lôi Cổ Địa, cần Lv40, dùng chỉ số quái map Nhân Giới số 2.
- Sét theo vòng cảnh báo (người: -10% máu tối đa, không chết vì sét; quái: -6%, không dưới 1 máu).
- Quái đổi tên theo chủ đề Lôi + hào quang điện. Boss Sử Thi = Lôi Đế Tàn Hồn: 3 pha (<66% sét nhắm người, <33% Mưa Sét), luôn gọi sét nhắm người mỗi 4 giây.
- Mới (Fix359): Lôi Đế Tàn Hồn có hình riêng vẽ bằng canvas (`paintBoss`), đổi sắc theo pha: xanh → trắng xanh → tím hồng. Chỉ thay hình khi đang ở map Thiên Lôi; map khác không ảnh hưởng.
- Chưa làm: hình quái thường riêng, vật phẩm rơi riêng (Lôi Tinh), cột thu lôi.
- Chỉnh: NAMES, bossStep(), paintBoss(), TLC.cfg. Tắt: bỏ <script> 114 trong index.html.
