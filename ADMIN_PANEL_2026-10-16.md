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

## Fix169 — Test: cấp độ Phàm Thể (ui/70)
- Tab 🧪 Test thêm mục 🧑 Cấp độ Phàm Thể (đặt cấp, +1, +10, −1, tối đa; +5 điểm tiềm năng/cấp, EXP về 0). Chỉ áp dụng khi nhân vật đang chơi là Phàm Thể (không Hợp Đạo/Chuyển Thế).
- File đổi: ui/70-admin-panel.js · ADMIN_PANEL_2026-10-16.md

## Fix170 — Reset nhân vật sạch trang phục + kỹ năng (ui/70)
- Lỗi: ♻ Reset chỉ xoá trường trong PS[cur]; còn sót biến toàn cục (cq, NK, pq, fz, AUTOF, dg) và bộ nhớ đệm của module (tủ Y Phục, Ý Cảnh, Thần Thông…) nên vẫn thấy trang phục / kỹ năng cũ.
- Sửa: resetChar dọn thêm cq/NK/pq/fz/AUTOF/dg, rf(), lưu sv(), kiểm bản lưu đã sạch rồi gọi ld() để mọi module nạp lại từ dữ liệu mới.
- File đổi: ui/70-admin-panel.js · ADMIN_PANEL_2026-10-16.md

## Fix171 — Reset sạch hoàn toàn (ui/70)
- Sau ♻ Reset: lưu sạch → đẩy lên mây (KTHM_CLOUD.saveNow, chờ dirty()=false và không lỗi) → tự tải lại trang (kthm_resume) để mọi module bỏ bộ nhớ cũ (trang phục, kỹ năng, hiệu ứng).
- Không đăng nhập mây hoặc đẩy lỗi → KHÔNG tải lại (tránh mất dữ liệu ở chế độ cloud-only), chỉ báo cảnh báo.
- Vẫn giữ: tên, lớp, kho Cash Shop (.csh, đồ mua bằng Linh Thạch), .td, thư, vàng, dữ liệu chung tài khoản.

## Fix172 — Reset như nhân vật mới hoàn toàn (ui/70)
- Xoá cả Linh Căn: đặt lại tường minh PS.tw (Tháp Thí Luyện, nơi giữ gốc linh căn) và PS.lc về chưa có linh căn.
- Không còn giữ kho Cash Shop (.csh) và .td; chỉ giữ tên, lớp, sổ thư đã nhận (.mail/.mailIds).
- Không đụng dữ liệu dùng chung tài khoản: vàng, Linh Thạch (máy chủ), nhiệm vụ, Hợp Thể…

## Fix173 — Reset xoá TOÀN BỘ (ui/70)
- Xoá thêm dữ liệu dùng chung như ng(): vàng (về 100), mảnh, nhiệm vụ (QS mới), Linh Điền (FM), Mỏ (MN), Huyền Tinh (FSH), Thánh (HL), Vòng Quay (LW), Hầm Ngục, bình máu/mana, thư đã nhận.
- Chỉ giữ tên + lớp. Linh Thạch trên máy chủ KHÔNG xoá được từ client.
- Lưu ý: dữ liệu dùng chung nên ảnh hưởng cả 2 nhân vật còn lại (vàng/nhiệm vụ/Linh Điền/Mỏ).

## Fix174 — Admin: thêm công cụ Test (ui/70)
- 💰 Vàng: số tuỳ ý, +10 triệu, +1 tỷ, +100 tỷ (trần 1e15) · 💠 Mảnh · 📊 Điểm tiềm năng (số tuỳ ý).
- ⚔ Chiến đấu: ❤ Hồi đầy HP/MP · 🛡 Bất tử (bật/tắt, tự hồi máu mỗi 0,12s; mất khi tải lại trang) · ☠ Diệt hết quái trên màn hình.
- 🎒 Tạo trang bị: chọn phẩm (Thường → Thiên Thần), ô (hoặc ngẫu nhiên), cấp 1-80, số lượng 1-30, vào túi (dừng khi hết chỗ) · 🗑 Dọn sạch túi (có hỏi xác nhận).
- Tất cả chỉ tác động nhân vật đang chơi, chạy phía máy, không cần SQL. Lưu qua sv() như thường.

## Fix175 — Chống cache + nhãn phiên bản
- index.html nạp `ui/70-admin-panel.js?v=174` (trình duyệt tải lại file mới). Tiêu đề bảng 🛡 Quản trị có nhãn "bản Fix174": không thấy nhãn = đang chạy bản cũ (cache / bản ghép cũ / chưa triển khai lên máy chủ web).
- Nếu chơi bằng bản ghép Mong_Tu_Tien_CLAUDE.html: phải build lại (tools/build.py), vì zip không kèm file đó.
