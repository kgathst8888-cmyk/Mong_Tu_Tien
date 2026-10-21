# Fix395 — Ô trang bị Thánh Khí (Túi) + 4 Thánh Khí 10 cấp
- File mới: `world/131-thanh-khi-trang-bi.js` (window.TKQ, cấu hình `TKQ.cfg`); `thanh_khi_v2.sql` (**chạy 1 lần trong Supabase, sau thanh_khi.sql**); sửa `index.html` (thêm `<script>` sau world/130).
- Ô ✨ nằm cột trái nhân vật trong Túi, dưới ô Linh Căn. Bấm → 4 Thánh Khí (Kiếm · Cung · Khiên · Trượng/Gậy phép). Mỗi nhân vật chọn 1 món, không đổi: chọn = tiêu hao 1 món trong kho tài khoản (RPC `tk_use`) → cấp 1.
- Nâng cấp: 10 cấp, phí tăng dần: cấp 1→2 tốn 100 triệu, mỗi cấp sau cộng thêm 100 triệu (cấp 9→10 tốn 900 triệu; tổng 1→10 = 4,5 tỷ). Chỉnh: TKQ.cfg.cost / costStep. Có cấp 1 → icon nhỏ sau tên cảnh giới trên đầu.
- Mặc định (không tăng theo cấp): +10% ST, +10% giáp, +10% máu, +10% xuyên giáp.
- Riêng: Kiếm +10% ST thần thông (+5%/cấp, tính khi đang ở Đạo Cảnh/thần thông) · Cung +10% ST bạo kích (+5%/cấp) · Khiên +10% miễn thương, 1% bỏ qua 1 đòn kỹ năng quái (+0,5%/cấp) · Trượng +10% ST kỹ năng (+5%/cấp).
- Cấp 10: thần thông thánh khí tự thi triển: Thiên Quang Trảm (Kiếm) · Vạn Vũ Quang Tiễn (Cung) · Thánh Quang Hộ Thể (Khiên) · Quang Minh Thiên Giáng (Trượng). Số liệu: `TKQ.cfg.sk`.
- Lưu: `PS[cur].tkq = {i, lv}` (theo nhân vật). Móc: twB · ZC.pd · dgHurt · step · nameTag · ui(). Đổi tên 4 món ở world/130 (TKL_CF.items) cho khớp.

## Fix395b — sửa lỗi + tối ưu Thánh Khí
- Sửa: chọn Thánh Khí xong ghi nhầm sang nhân vật khác nếu đổi nhân vật lúc đang chờ máy chủ (nay ghi đúng nhân vật đã bấm).
- Sửa: Khiên "bỏ qua đòn" trước chỉ chạy trong hầm ngục; nay theo dõi máu mỗi khung → mọi bản đồ. Chỉ đòn ≥ 2% máu tối đa mới tính (`TKQ.cfg.ignMin`).
- Thêm bước XÁC NHẬN khi chọn Thánh Khí (không đổi được, tiêu hao 1 món) · nút ⏫ Nâng nhanh ×N cấp theo số vàng đang có.
- Tối ưu: chỉ số Thánh Khí ghi nhớ theo (tham chiếu, món, cấp) — không tạo đối tượng mỗi lần tính; cache độ rộng tên cảnh giới khi vẽ icon; hồi chiêu thần thông riêng từng nhân vật.
- world/130: bỏ chữ cũ "cập nhật sau", đổi tên 4 món (Thánh Kiếm/Cung/Khiên/Trượng), hiện icon 4 món trong Nhà Tinh Luyện.
- Giới hạn còn lại: cấp Thánh Khí nằm trong save nhân vật (giống các hệ khác), chỉ món trong kho tài khoản do máy chủ giữ.
