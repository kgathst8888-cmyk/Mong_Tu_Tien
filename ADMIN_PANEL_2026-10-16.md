# Trang Admin (ui/70-admin-panel.js + admin.sql)
- Nút 🛡 Admin (left:192px, hàng 💬 🏮 📢 ✉️) chỉ hiện với tài khoản có trong bảng Supabase `kthm_admin` (RPC `admin_is`).
- Tab: 👤 Tài khoản (tìm, online, cộng/trừ Linh Thạch, khoá, cấm chat, đá khỏi game) · 🎁 Gửi quà (thư tất cả / 1 người) · 📢 Thông báo (đăng thông báo toàn game, đặt hạn, xoá) · ✉️ Đã gửi (thu hồi thư chưa nhận) · 📜 Nhật ký.
- Cài đặt máy chủ: Supabase → SQL Editor → chạy `admin.sql` → chạy câu cuối (đổi email):
  insert into public.kthm_admin(uid,note) select id,'chủ game' from auth.users where email='EMAIL@gmail.com' on conflict do nothing;
- admin.sql cũng thay `lay_thong_bao()` để thư có cột `uid` (gửi riêng 1 người); thư cũ (uid null) vẫn gửi cho tất cả.
- Giới hạn: quà đã nhận (vàng, vật phẩm, trang bị) nằm trong bản lưu nhân vật, chưa thu hồi được. Linh Thạch thì trừ được.
- File đổi: ui/70-admin-panel.js (mới) · admin.sql (mới) · index.html (thêm 1 thẻ script sau ui/69) · ADMIN_PANEL_2026-10-16.md (mới) · SYMBOL_INDEX.tsv, MODULE_MAP.md (tự sinh lại bằng tools/check.py --build). Mong_Tu_Tien_CLAUDE.html KHÔNG đóng kèm zip (bản ghép 4,7 MB, tạo lại bằng build.py khi cần).

- Tab 🧪 Test (chỉ phía máy, không cần SQL): cộng tu vi (số tuỳ ý, +10%, +50%, đầy), đặt cảnh giới + tầng, ±1 tầng, Đại Thừa tầng 9 cho nhân vật đang chơi; bỏ qua điều kiện đột phá. Dùng ZC.gain + sửa PS[cur].cv rồi gọi sv().
