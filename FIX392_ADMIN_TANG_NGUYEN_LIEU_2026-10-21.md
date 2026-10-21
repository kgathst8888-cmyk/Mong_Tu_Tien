# Fix392 — Admin tặng nguyên liệu / kẹo / bí ngô
- Cánh 5: đã có từ Fix391 (thư quà `wg5` = tặng thẳng Cánh Cấp 5, `wf5` = Mảnh Cánh Cấp 5) — không đổi.
- ui/69-thong-bao-thu.js: thêm 6 vật phẩm vào bảng ITM (form 🎁 Gửi quà của ui/70 tự hiện, cũng dùng được cho Mã Quà):
  - `hkkh` 🪞 Tinh Hoa Kính Hồ, `hkct` 💀 Cốt Long Tủy → nguyên liệu nâng cấp Trang Sức Hoàng Kim (HKU.addMat → PS[cur].hkg.mat). Tối đa 100.000/thư.
  - `hc1` 🍭 Kẹo Ngọt, `hc2` 🍬 Kẹo Dẻo, `hc3` 🤢 Kẹo Thối, `hpk` 🎃 Bí Ngô → PS[cur].hw (HALW.data). Tối đa 10.000/thư.
  - itErr báo lỗi nếu thiếu module HKU/HALW; thư chỉ nhận khi nhân vật đã vào game (như các vật phẩm khác).
- Nguyên liệu Pháp Bảo Bổn Mệnh (❄ Tuyết Tinh, 🔷 Hàn Ngọc Tủy, 🌙 Huyết Nguyệt Hạch) nằm trên MÁY CHỦ (tn_user) nên không gửi qua thư được:
  - File mới `admin_tang_nl_tuyet_nguc.sql` (hàm `admin_tang_tn`, chỉ admin, tối đa 100.000/loại/lần, có ghi nhật ký). **Chạy 1 lần trong Supabase SQL Editor** (sau admin.sql + tuyet_nguc.sql).
  - ui/70-admin-panel.js: trong thẻ tài khoản đã chọn thêm mục "❄ Nguyên liệu Pháp Bảo Bổn Mệnh" (3 ô số + nút ➕ Cộng). Cộng xong người chơi mở lại Nhà Tinh Luyện là thấy.
- index.html: ui/69 và ui/70 thêm ?v=392.
