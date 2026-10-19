# Fix348 — Tuyết Ngục (Làng Tân Thủ 3 · Nhà Số 1)
- File mới: `world/107-tuyet-nguc.js` (window.TNG, cấu hình window.TNG_CF) · `tuyet_nguc.sql`. Sửa: `index.html` (thêm 1 `<script>` sau world/106, `?v=348`; đổi `?v=` của world/102), `world/102-lang-tan-thu-3.js` (2 dòng nhỏ: chỉ vẽ xích/ổ khoá cho nhà chưa mở; dòng "n nhà đang tạm khoá" đếm động). Gắn vào `TT3.houses[0].open`. Gỡ `<script>` 107 thì nhà quay về "Tạm khoá".
- **Việc cần làm 1 lần:** chạy `tuyet_nguc.sql` trong Supabase → SQL Editor (an toàn chạy lại). Chưa chạy thì nhà báo "chưa kích hoạt" và KHÔNG cho vào (phần thưởng nằm trên máy chủ nên không có chế độ luyện tập).
- Luồng: chạm Nhà Số 1 → bảng chọn tầng (1–10; muốn vào tầng N phải đã hạ tầng N−1) → trả phí → vào trận 1 boss thật **Tuyết Ngục Quân Chủ** trong 240 giây → hạ boss mới nhận thưởng → về lại Làng 3.
- **Phí mỗi lượt: 5.000.000💰 + 20💎 Linh Thạch** (LT.spend, cần đăng nhập ☁). Thua / hết giờ / rời trận = mất phí, không hoàn. Máy chủ lỗi lúc mở lượt thì tự hoàn cả vàng lẫn 💎 (Linh Thạch khoá).
- **3 lượt/ngày/tài khoản** (giờ VN, đổi 00:00) — máy chủ giữ.
- Độ khó: máu boss = Trùm Hầm Ngục × 8 (tầng 1) → × 41 (tầng 10); sát thương × 6 → × 12,3; dưới 30% máu nổi giận × 1,25. Boss không rơi đồ Hầm Ngục (`drop` bị chặn cho e.tn).
- **Nguyên liệu khó kiếm, máy chủ tự quay** (kho theo tài khoản, đọc bằng `TNG.mat()`):
  | Nguyên liệu | Tầng | Tỉ lệ mỗi lần hạ | Tối đa/ngày | Bảo hiểm |
  |---|---|---|---|---|
  | ❄ Tuyết Tinh | 1+ | 22% + 4%/tầng (tối đa 60%), tầng ≥ 6 có 25% ra 2 | 4 | — |
  | 🔷 Hàn Ngọc Tủy | 3+ | 6% + 1,5%/tầng | 2 | 20 lần hạ không rơi → chắc chắn rơi |
  | 🌙 Huyết Nguyệt Hạch | 7+ | 1,5% + 0,5%/tầng | 1 | 40 lần hạ không rơi → chắc chắn rơi |
  Lần đầu hạ 1 tầng: +5.000.000💰, +2 ❄ (không tính hạn mức ngày); tầng 5 thêm +1 🔷; tầng 10 thêm +1 🌙. Vàng thưởng mỗi lần hạ: 2.000.000 + 1.000.000 × tầng.
- Chống gian lận: báo "đã hạ boss" chỉ nhận trong 20 giây → 15 phút kể từ lúc vào; mỗi lượt chỉ báo 1 lần; xác suất, hạn mức, kho nguyên liệu đều do máy chủ quyết. Vẫn như Đấu Trường/Chiến Trường: việc "có thật sự hạ boss hay không" do máy khách báo, nhưng mỗi tài khoản tối đa 3 lần/ngày và mỗi lần tốn 💎 nên mức rủi ro bị chặn.
- Đã thử (môi trường giả lập, chưa thử trên game thật): mở bảng, trừ phí, vào trận, boss ×8 máu/×6 sát thương/nổi giận, hạ boss nhận thưởng, hết giờ, khoá tầng, hết lượt, chưa chạy SQL, hoàn phí khi mở lượt lỗi.
- Chưa làm: Nhà Số 2 (Tinh Luyện Pháp Bảo) và Nhà Số 3 (Đan Phòng Cao Cấp) dùng nguyên liệu này; Nhà Số 4, 5 vẫn khoá. Chưa có BXH tầng.
- Cần chỉnh khi cân bằng: độ khó/phí ở `TNG_CF` (JS). Tỉ lệ/hạn mức/vàng thưởng/số lượt nằm ở `tuyet_nguc.sql` — đổi SQL thì đổi luôn `TNG_CF` để bảng hiển thị khớp.
