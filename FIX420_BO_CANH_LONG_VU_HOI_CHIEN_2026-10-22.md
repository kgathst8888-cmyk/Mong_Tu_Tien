# Fix420 – Rương Hội Chiến chỉ rơi Mảnh Cánh Cấp 4, không rơi nguyên cánh; thu hồi cánh đã rơi
- Nguyên nhân: hcb_roll (hoi_chien_boss.sql) có loại thưởng 'lv' (5%); world/94-hoi-chien-boss.js applyRw đặt thẳng p.wg=4 → ra luôn Long Vũ Thiên Thần Dực.
- Sửa JS (world/94-hoi-chien-boss.js, index.html ?v=420): 'lv' nếu máy chủ còn trả → chỉ cộng 1 Mảnh Cánh Cấp 4 (WFA(3,1)); bỏ dòng "Long Vũ Thiên Dực 5%" trong bảng mô tả; thêm thuHoi() (4 giây/lần, mỗi nhân vật 1 lần).
- Sửa SQL: hoi_chien_boss.sql (bỏ 'lv'; mảnh vẫn 5%) + fix420_hcb_bo_canh_long_vu.sql (PHẢI chạy 1 lần): đổi hcb_roll, tạo bảng hcb_thuhoi, hàm hcb_thuhoi.
- Thu hồi: nhân vật có trong hcb_thuhoi mà đang có ĐÚNG Cánh Cấp 4 (wg=4) khi đăng nhập → wg=0. Rương cũ không ghi ai trúng 'lv', nên danh sách = đã mở rương Hội Chiến + bản lưu mây có wg=4. Người hợp cánh hợp lệ nằm trong danh sách thì `delete from hcb_thuhoi where uid=… and slot=…` TRƯỚC khi họ đăng nhập.
- Không đụng: cánh cấp 5, cánh nhận qua thư/admin, mảnh cánh đã có.
