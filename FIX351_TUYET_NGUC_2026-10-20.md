# Fix351 — Tuyết Ngục (Làng Tân Thủ 3 · Nhà Số 1)
- File: `world/109-tuyet-nguc.js` (window.TNG, cấu hình window.TNG_CF) · `tuyet_nguc.sql`. Sửa: `index.html` (thêm `<script>` sau world/108; đổi `?v=` của world/102), `world/102-lang-tan-thu-3.js` (chỉ vẽ xích/ổ khoá cho nhà chưa mở; dòng "n nhà đang tạm khoá" đếm động). Gắn vào `TT3.houses[0].open`. Gỡ `<script>` thì nhà về "Tạm khoá".
- **Chạy `tuyet_nguc.sql` 1 lần trong Supabase** (an toàn chạy lại). Chưa chạy thì nhà báo "chưa kích hoạt" và không cho vào.
- Luồng: chạm Nhà Số 1 → chọn tầng 1–10 (muốn vào tầng N phải đã hạ tầng N−1) → trả phí → 1 boss thật **Tuyết Ngục Quân Chủ** trong 240 giây → hạ boss mới nhận thưởng → về lại Làng 3.
- **Phí mỗi lượt: 5.000.000💰 + 20💎** (LT.spend, cần đăng nhập). Thua / hết giờ / rời trận = mất phí. Máy chủ lỗi lúc mở lượt thì tự hoàn cả vàng lẫn 💎 (Linh Thạch khoá). **3 lượt/ngày/tài khoản** (giờ VN, máy chủ giữ).
- Độ khó: máu boss = Trùm Hầm Ngục × 8 (tầng 1) → × 41 (tầng 10); sát thương × 6 → × 12,3; dưới 30% máu nổi giận × 1,25. Boss không rơi đồ Hầm Ngục.
- Nguyên liệu khó kiếm, MÁY CHỦ tự quay (kho theo tài khoản, `TNG.mat()`):
  | Nguyên liệu | Từ tầng | Tỉ lệ / lần hạ | Tối đa/ngày | Bảo hiểm |
  |---|---|---|---|---|
  | ❄ Tuyết Tinh | 1 | 22% + 4%/tầng (tối đa 60%); tầng ≥ 6: 25% ra 2 | 4 | — |
  | 🔷 Hàn Ngọc Tủy | 3 | 6% + 1,5%/tầng | 2 | 20 lần hạ không rơi → chắc chắn rơi |
  | 🌙 Huyết Nguyệt Hạch | 7 | 1,5% + 0,5%/tầng | 1 | 40 lần hạ không rơi → chắc chắn rơi |
  Lần đầu hạ 1 tầng: +5.000.000💰 +2 ❄ (không tính hạn mức ngày); tầng 5 +1 🔷; tầng 10 +1 🌙. Vàng mỗi lần hạ: 2.000.000 + 1.000.000 × tầng.
- Chống gian lận: báo "đã hạ boss" chỉ nhận trong 20 giây → 15 phút kể từ lúc vào; xác suất/hạn mức/kho do máy chủ quyết. Việc "có thật sự hạ boss hay không" vẫn do máy khách báo (như Đấu Trường/Chiến Trường), bị chặn bởi 3 lượt/ngày + phí 💎.
- **Sửa lỗi so với bản v17 (Fix348 cũ):** bản đó đánh dấu trận bằng `dg.tn` / `e.tn` — trùng với **Tháp Thử Luyện** (`world/07-trial-tower.js`, cũng dùng `dg.tn` = số tầng, `e.tn`). Hậu quả: khi leo Tháp, module Tuyết Ngục sẽ chặn rơi đồ boss Tháp, đổi cách vẽ boss, nhân sát thương boss và thay luôn đồng hồ trận. Bản này đổi sang `dg.tng` / `e.tng` (20 chỗ) và đã có test riêng: Tháp vẫn rơi đồ, nhận đúng sát thương, `dgTick` chuyển tiếp bình thường.
- Đã thử trong môi trường giả lập (chưa thử trên game thật): mở bảng, trừ phí, vào trận, boss ×8 máu/×6 sát thương/nổi giận, hạ boss nhận thưởng, hết giờ, khoá tầng, hết lượt, chưa chạy SQL, hoàn phí khi mở lượt lỗi, Tháp Thử Luyện không bị ảnh hưởng (27 kiểm tra).
