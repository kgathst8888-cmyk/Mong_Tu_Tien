# Fix353 — Đan Phòng Cao Cấp (Làng Tân Thủ 3 · Nhà Số 3)
- File: `world/111-dan-phong-cao-cap.js` (window.DPC, cấu hình window.DPC_CF) · `dan_phong_cao_cap.sql`. Sửa: `index.html` (thêm `<script>` sau world/110), chú thích đầu `world/109`. Gắn vào `TT3.houses[2].open`. Gỡ `<script>` thì nhà về "Tạm khoá" (đan và thời gian còn lại vẫn nằm trong save).
- **Chạy `dan_phong_cao_cap.sql` 1 lần trong Supabase, SAU `tuyet_nguc.sql`** (an toàn chạy lại; có kiểm tra thứ tự; không đổi bảng, chỉ thêm hàm `tn_brew`). Chưa chạy thì nhà báo "chưa kích hoạt" và hoàn phí.
- Luyện **3 loại đan buff thời gian** (không vĩnh viễn → không đụng giới hạn đan của Linh Điền). Mỗi viên dùng = **+60 phút**, cộng dồn tối đa **3 giờ**, tính theo **giờ thật kể cả offline**. 3 loại cộng được cùng lúc:
  | Đan | Hiệu lực | Dược thảo (Linh Điền) | ❄ chất dẫn | 💰 | 💎 |
  |---|---|---|---|---|---|
  | 🧊 Hàn Băng Đan | +12% sát thương | 12 Xích Hỏa Hoa + 6 Linh Chi Thảo | 1 | 3.000.000 | 5 |
  | 🛡 Ngọc Tủy Hộ Thể Đan | +15% máu · −6% sát thương nhận | 12 Hồi Sinh Thảo + 6 Huyền Quy Đằng | 1 | 3.000.000 | 5 |
  | 🌙 Nguyệt Hạch Bạo Đan | +20% sát thương chí mạng | 8 Thiên Tâm Sâm + 12 Băng Tâm Liên | 2 | 5.000.000 | 8 |
- Thiết kế: dùng dược thảo **có sẵn** của Linh Điền (`FM.get().herbs`) để dược thảo dư có chỗ tiêu, và chỉ tốn **1–2 ❄** mỗi viên để không tranh nguyên liệu với Tinh Luyện Pháp Bảo (cần 150 ❄ cho ★5). Cộng chỉ số qua `twB` (khóa dmgp, hpp, dred, cdmg).
- Luồng: kiểm tra (dược thảo, ❄, vàng, đăng nhập) → trừ 💎 + vàng → máy chủ `tn_brew` trừ ❄ nguyên tử → trừ dược thảo, +1 đan → lỗi bất kỳ thì hoàn vàng + 💎 (Linh Thạch khoá), dược thảo giữ nguyên. Đan lưu `PS[cur].dp = {n:{id:số viên}, u:{id:mốc hết hạn ms}}`.
- Giới hạn đã biết: đan và mốc hết hạn nằm trong save (như đan Linh Điền) nên người sửa save có thể tự tăng đan; nguyên liệu quý (❄) thì không thể bị bỏ qua khi luyện qua luồng chính thức. Buff chỉ 12–20% trong tối đa 3 giờ nên rủi ro thấp.
- Đã thử trong môi trường giả lập (chưa thử trên game thật): luyện 3 loại, trừ đúng vàng/💎/❄/dược thảo, dùng đan, cộng chỉ số đúng khóa, 3 loại cùng lúc, cộng dồn chặn ở 3 giờ, đầy thì không mất đan, hết hạn mất buff, thiếu ❄/dược thảo/vàng thì chặn trước khi trừ phí, máy chủ lỗi thì hoàn đủ.
- Chưa làm: Nhà Số 4, 5 vẫn khoá. Chưa cập nhật `MODULE_MAP.md` / `SYMBOL_INDEX.tsv`.
