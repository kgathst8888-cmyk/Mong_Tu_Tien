# Fix425 — Phụ bản 5 "Cửu U Luyện Ngục" (Đạo Thể, hợp Ma Đạo)
- File mới: `world/136-cuu-u-luyen-nguc.js` (nạp cuối, `?v=425`, có trong MODULE_MANIFEST). Sửa nhỏ `world/40-phu-ban-2.js` (thẻ số 5 trong bảng 🕳 Phụ Bản: html/go/refresh). Không sửa engine.
- Vào: bảng 🕳 Phụ Bản (thẻ 5) hoặc lối tắt cạnh Linh Giới (thẻ trong bảng Bản đồ Linh Giới + dòng trong tab 🗺 Bản đồ). Chỉ Đạo Thể, Đạo Cảnh Lv61, hồi chiêu 30 phút từ lúc vào (`PS[cur].cu9`).
- Trận: 24 quái (Ngục Tốt, Ma Tướng, Ác Linh Bị Giam) → Boss Ngục Chủ. Chỉ số lấy từ bản đồ Linh Giới 5 (`LGMAP.cfg[4]`) nhân hệ số trong `CU`.
- Oán hồn: quái chết có xác suất để lại oán hồn bay quanh; diệt hết trong 5 giây → thêm Đạo Linh (`CU.clearK`); hết hạn → hợp thể thành Oán Linh Tinh Anh. Ngục Chủ triệu hồn ở 70% và 35% máu, kèm "Xích Sắt Trấn Hồn".
- Ma Đạo (Ý Cảnh): +2 giây, EXP tịnh hóa ×1.5, hồi 1.5% máu mỗi hồn diệt. Tiên Đạo vẫn vào được (`CU.onlyMa=true` để chỉ Ma Đạo).
- Thưởng: KHÔNG rơi trang bị. Boss rơi 1 rương ngẫu nhiên (vàng 400k/800k · Quặng Sắt+Huyền Kim 150/300 · 1% Mảnh Thánh). EXP kill đi qua đường engine (đã mở `LGMAP.expOk/expMul` cho dg.cu).
- Tắt: bỏ `<script>` 136 trong index.html (thẻ 5 tự ẩn).
- Hạ Ngục Chủ: thưởng thêm `CU.lk` = 10 Linh Thạch KHOÁ (`LT.earnKS`, không giới hạn ngày, cần đăng nhập ☁; chưa đăng nhập thì không nhận).
