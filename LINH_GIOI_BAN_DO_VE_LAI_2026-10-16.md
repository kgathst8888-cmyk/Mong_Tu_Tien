# Bản đồ Thành Thị Linh Giới — vẽ lại hoàn toàn (2026-10-16)
File đổi: `world/58-linh-gioi-city-art.js` (273KB -> ~50KB). Ảnh nền nhúng đã bỏ; bản cũ lưu ở `_audit/58-linh-gioi-city-art.ANH_CU.js.bak` (đổi tên về .js để quay lại).
Giữ nguyên API LGART và hệ toạ độ ảnh 1320x743 -> world/10, 65 và các cổng khác không phải sửa.
- 3 lớp cache (xa 0.25 · giữa 0.55 · gần 1.0) có thị sai khi camera đi theo nhân vật.
- Hoạt cảnh: sao nhấp nháy, sao băng, cực quang, mây trôi, thác nước + sương, đảo nhỏ bập bềnh, ánh cửa sổ cung điện, tia sáng + vòng hào quang đỉnh tháp,
  hạc bay, tiên nhân ngự kiếm, trận pháp sân xoay sáng, phản chiếu cổng trên sàn, đèn đá, tinh thể, hào quang tượng thần, đom đóm, cánh hoa anh đào.
- Hiệu năng: QL=1 bỏ cực quang/tia trăng/tiên nhân; QL=2 giảm sao, mây, hạc, hoa; cache <=1.5px/px ảnh (1.0 khi QL=2).
- Chỉnh nhanh: KB, FX, LBL, CAP ở đầu file; GST (kiểu khung cổng), drawMid (đảo/cung điện), CLOUDS-FLY trong critters().
- Bản nâng cấp: cổng Về Làng (world/65 + homeGate trong world/58) có mái ngọc hai tầng, biển 歸鄉, đèn lồng, nhìn xuyên cổng thấy cảnh Thôn Tân Thủ lúc bình minh.
- Thêm chi tiết: lư hương có khói, đèn dây trên lan can, bát quái xoay quanh trận pháp, tu sĩ đi dạo/ngồi thiền, đèn Khổng Minh bay lên, đèn thành xa.
- Đã bỏ hình người trên sân; thêm 6 tiên nhân bay lượn trên trời (ngự kiếm, đạp mây, phi thiên) với áo/tóc/dải lụa bay theo gió, chỉnh trong IMM (world/58).
- Tiên nhân v2: 10 người chia 3 tầng (xa mờ nhỏ · giữa · gần lớn bay trước cả sân), áo nhiều lớp viền vàng, ngọc bội, ngọc quan, phất trần/hoa sen đăng, kiếm trận xoay, mây đuôi, bụi sao, đạo quang. Chỉnh bảng IMM (cột 10 = tầng, cột 11 = QL tối đa còn hiện).
- Thu nhỏ tiên nhân tầng gần (cỡ 2.4→1.7, 2.2→1.6 trong IMM).
