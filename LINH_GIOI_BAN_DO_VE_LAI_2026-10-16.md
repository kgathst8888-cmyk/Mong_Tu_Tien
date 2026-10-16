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
- Đảo lơ lửng v3: vân đá nhiều màu, rêu rủ, mạch tinh thể phát sáng, hang động có đèn + bậc đá, tảng đá bám, nhũ pha lê chúc xuống, xích + đèn lồng treo, đá vụn trôi quanh, ao sen, lối đá, tre, anh đào nhỏ, đèn đá; 8 đảo nổi bập bềnh (tăng từ 6). Thêm 2 thuyền bay (phi chu) buồm sáng bay ngang trời (boats() trong world/58). Chỉnh tuỳ chọn từng đảo ở drawMid và danh sách FLT trong build().
- Sửa hướng bay tiên nhân: thân nghiêng VỀ PHÍA TRƯỚC theo chiều bay (trước đây nghiêng ngược), tóc/váy/dải lụa/tay áo sau vẫn bay ngang phía sau; vật cầm tay (phất trần, sen) xoay theo thân.
- Tiên nhân v3: 14 người, có nhanh (v>1.5: ảnh tàn, vệt gió, sóng khí phía trước, kiếm khí dài, vải bay nhanh), vừa (lúc nhanh lúc chậm), chậm (v<0.4: lơ lửng, nghiêng nhẹ, hào quang rộng, hoa lả tả). Cột 2 bảng IMM = tốc độ (px ảnh/khung).
- Tiên nhân v4 (chân thực): thân vẽ 1 lần ở độ phân giải cao (mkFig): tỉ lệ ~8 đầu, mặt nghiêng có mắt/mày/mũi/môi/tai, búi tóc + ngọc quan + trâm, tóc có sợi bóng, cổ áo chéo, đai ngọc, váy lót + voan ngoài + nếp gấp + thêu mây viền vàng, giày, bàn tay có ngón (kiếm quyết / nắm phất trần / ngửa đỡ sen). Phần bay động (tóc, tà váy, tay áo sau, dải lụa, tua ngọc bội) vẽ riêng 2 lớp voan.
- Bỏ các vòng tròn đạo quang và cung sóng khí quanh người tiên nhân.
