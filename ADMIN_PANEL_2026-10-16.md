# Trang Admin (ui/70-admin-panel.js + admin.sql)
- Nút 🛡 Admin (left:192px, hàng 💬 🏮 📢 ✉️) chỉ hiện với tài khoản có trong bảng Supabase `kthm_admin` (RPC `admin_is`).
- Tab: 👤 Tài khoản (tìm, online, cộng/trừ Linh Thạch, khoá, cấm chat, đá khỏi game) · 🎁 Gửi quà (thư tất cả / 1 người) · 📢 Thông báo (đăng thông báo toàn game, đặt hạn, xoá) · ✉️ Đã gửi (thu hồi thư chưa nhận) · 📜 Nhật ký.
- Cài đặt máy chủ: Supabase → SQL Editor → chạy `admin.sql` → chạy câu cuối (đổi email):
  insert into public.kthm_admin(uid,note) select id,'chủ game' from auth.users where email='EMAIL@gmail.com' on conflict do nothing;
- admin.sql cũng thay `lay_thong_bao()` để thư có cột `uid` (gửi riêng 1 người); thư cũ (uid null) vẫn gửi cho tất cả.
- Giới hạn: quà đã nhận (vàng, vật phẩm, trang bị) nằm trong bản lưu nhân vật, chưa thu hồi được. Linh Thạch thì trừ được.
- File đổi: ui/70-admin-panel.js (mới) · admin.sql (mới) · index.html (thêm 1 thẻ script sau ui/69) · ADMIN_PANEL_2026-10-16.md (mới) · SYMBOL_INDEX.tsv, MODULE_MAP.md (tự sinh lại bằng tools/check.py --build). Mong_Tu_Tien_CLAUDE.html KHÔNG đóng kèm zip (bản ghép 4,7 MB, tạo lại bằng build.py khi cần).

- Tab 🧪 Test (chỉ phía máy, không cần SQL): cộng tu vi (số tuỳ ý, +10%, +50%, đầy), đặt cảnh giới + tầng, ±1 tầng, Đại Thừa tầng 9 cho nhân vật đang chơi; bỏ qua điều kiện đột phá. Dùng ZC.gain + sửa PS[cur].cv rồi gọi sv().

## Fix163 — Test mở rộng + vật phẩm mới (ui/70, ui/69)
- Tab 🧪 Test thêm: ☯ Đạo Linh (EXP: số tuỳ ý, +10%, +50%, đầy = lên cấp) · ☯ Cấp độ Đạo Thể (đặt cấp, +1, +10, −1, tối đa) · ✨ Cấp độ Tiên Nhân (như trên) · ♻ Reset nhân vật.
  - Đạo Thể / Tiên Nhân chỉ dùng được khi nhân vật đang chơi đúng dạng đó (CTHE.on() = Tiên Nhân, HDAO.on() = Đạo Thể). Đặt cấp tối đa theo LC(tier) (=100 sau chuyển chức 3). Tăng cấp cộng điểm tiềm năng như lên cấp thật (Đạo Thể 10, Tiên Nhân CTHE.cfg.pts, phàm 5); EXP về 0.
  - Đạo Linh của Tiên Nhân cộng qua TGQ.addXp (đường EXP hợp lệ, không bị bộ chặn của world/81 thu hồi).
  - ♻ Reset nhân vật: CHỈ nhân vật đang chơi (khác ng() reset cả 3 + vàng). Về Lv1, xoá mọi trường riêng của nhân vật (kể cả .hd .ct .yc .hpc…), trang bị đang mặc + túi đồ; GIỮ tên, lớp, .csh (kho Cash Shop), .td, .mail/.mailIds (tránh nhận lại thư cũ), vàng và dữ liệu chung tài khoản. Hỏi xác nhận 2 lần.
- Tab 🎁 Gửi quà thêm mục 🆕 Vật phẩm mới (khoá trong q.it, không cần sửa admin.sql): 🌙 Mảnh Nguyệt Thạch · ✨ Mảnh Thánh · 💎 Mảnh Kim Tinh · 🔹 Mảnh Chế Tạo · 🔮 Hồn Phách (cần đã chọn hồn phách) · 📊 Điểm Tiềm Năng · 🧪 Bình Máu · 💧 Bình Mana · 5 Đan Cảnh Giới (Trúc Cơ → Luyện Hư) · 5 Nguyên Liệu đan + Nguyên Liệu Đúc Nguyên Anh. Mức tối đa mỗi thư ghi ở ô nhập.
- Sửa lỗi cũ: Vé Tẩy Opt Chọn (tc) admin gửi được nhưng ui/69 lọc mất vì thiếu trong CSHK → đã thêm.
- Muốn thêm vật phẩm nữa: thêm 1 dòng vào bảng ITM trong ui/69 (t = cách cộng, xem giveIt) — form admin tự hiện.
- File đổi: ui/69-thong-bao-thu.js · ui/70-admin-panel.js · ADMIN_PANEL_2026-10-16.md · SYMBOL_INDEX.tsv, MODULE_MAP.md (tự sinh lại).
