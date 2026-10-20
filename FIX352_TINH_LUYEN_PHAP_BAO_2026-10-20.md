# Fix352 — Tinh Luyện Pháp Bảo (Làng Tân Thủ 3 · Nhà Số 2)
- File: `world/110-tinh-luyen-phap-bao.js` (window.TLP, cấu hình window.TLP_CF) · `tinh_luyen_phap_bao.sql`. Sửa: `index.html` (thêm `<script>` sau world/109). Gắn vào `TT3.houses[1].open`. Gỡ `<script>` thì nhà về "Tạm khoá" và chỉ số ★ mất (★ vẫn giữ trên máy chủ).
- **Chạy `tinh_luyen_phap_bao.sql` 1 lần trong Supabase, SAU `tuyet_nguc.sql`** (an toàn chạy lại; có kiểm tra thứ tự). Nó thêm cột `tn_user.star`, thay `tn_me()` (thêm trường `star`, các trường cũ giữ nguyên nên Nhà Số 1 không ảnh hưởng) và thêm `tn_refine(p_to)`.
- Dùng nguyên liệu Tuyết Ngục + vàng + 💎 để lên ★1…★5 cho **Pháp Bảo Bổn Mệnh** đang đeo (world/48; chỉ Đạo Thể có). Mỗi ★ = **+0,8 cấp** thuộc tính riêng của pháp bảo:
  - 🗡️ Kiếm Linh: +3,2% sát thương/★ · 🏺 Hồ Lô: +4,8% sức mạnh quái/thú triệu hồi/★ · 🚩 Hồn Phiên: +6,4% DoT, +1,2% choáng, +1,2% băng/★ · 🪓 Cự Phủ: +4,8% bạo kích/★.
  - ★5 ≈ +4 cấp pháp bảo. (Hồn Phiên "+% thời gian hiệu ứng" nằm trong chính world/48 nên Tinh Luyện không cộng được.)
- Chi phí mỗi ★ (nguyên liệu khớp SQL `tn_refine`; vàng/💎/cấp do máy khách kiểm tra — `TLP_CF`):
  | ★ | ❄ | 🔷 | 🌙 | 💎 | 💰 | Pháp bảo cấp ≥ |
  |---|---|---|---|---|---|---|
  | 1 | 10 | – | – | 30 | 10.000.000 | 1 |
  | 2 | 20 | 5 | – | 60 | 20.000.000 | 2 |
  | 3 | 30 | 5 | – | 100 | 40.000.000 | 3 |
  | 4 | 40 | 10 | 5 | 150 | 80.000.000 | 4 |
  | 5 | 50 | 10 | 5 | 200 | 150.000.000 | 5 |
  Tổng ★5: **150 ❄ · 30 🔷 · 10 🌙** · 540 💎 · 300.000.000 💰. (Nguyên liệu đã nhân ×5 so với bản đầu — số vàng/💎/cấp giữ nguyên.)
  Ước lượng thời gian (3 lượt/ngày, cố đánh tầng cao): ❄ khoảng 1–1,5/ngày → ~4 tháng; 🌙 khoảng 1 cái/30 lần hạ (kể cả bảo hiểm 40 lần) → ~3 tháng. Muốn nhanh/chậm hơn: đổi cùng lúc `TLP_CF.cost` (JS) và 3 mảng `array[...]` trong `tn_refine` (SQL).
- Luồng: kiểm tra (pháp bảo, cấp, nguyên liệu, vàng, đăng nhập) → trừ 💎 + vàng ở máy khách → máy chủ `tn_refine` trừ nguyên liệu và tăng ★ nguyên tử → lỗi bất kỳ thì hoàn vàng + 💎 (Linh Thạch khoá).
- ★ là của **tài khoản**, máy chủ giữ. `PS[cur].tl` chỉ là bản nhớ đệm để chỉ số đúng ngay lúc vào game; khi tải xong từ máy chủ thì máy chủ thắng (sửa save thành ★5 vô ích). ★ được tải ngay khi đăng nhập, không cần mở nhà.
- Móc: `twB` (dmgp/cdmg/dotd/stnc/frzc), `dm` + `pstep` (Hồ Lô, cùng cách world/48), `ZC.ui` (thêm 1 dòng ★ dưới thẻ Pháp Bảo), `TT3.houses[1]`. Đều có try/catch.
- Đã thử trong môi trường giả lập (chưa thử trên game thật): cộng chỉ số đúng cho 4 loại pháp bảo, Hồ Lô chỉ tăng trong pstep, ★ máy chủ ghi đè bản nhớ đệm bị sửa, lên ★1…★5, chặn khi thiếu cấp/nguyên liệu/vàng (không trừ phí), hoàn phí khi máy chủ lỗi, ★5 khoá nút, chưa có pháp bảo (21 kiểm tra).
- Chưa làm: Nhà Số 3 (Đan Phòng Cao Cấp), Nhà Số 4, 5. Chưa cập nhật `MODULE_MAP.md` / `SYMBOL_INDEX.tsv` (chạy lại công cụ sinh của bạn nếu cần).
