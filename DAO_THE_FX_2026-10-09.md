# Hiệu ứng Đạo Thể (world/46-dao-the-fx.js)
- Từ lúc Hợp Đạo (Đạo Thể, Đạo Cảnh Lv1 trở lên): ẨN toàn bộ hiệu ứng cảnh giới tu tiên (cột sáng, cánh, vòng trận mặt đất, Kim Đan, Nguyên Anh, Hóa Thần...). Chỉ GIỮ hiệu ứng Luyện Hư (vầng sáng HQI xoay ở ngực).
- THÊM hiệu ứng Đạo Thể: trận đồ Bát Quái – Thái Cực vàng (ảnh nhúng trong module) dưới chân + ánh vàng sau lưng + tinh quang bay lên.
- Cách làm: bọc ZC.aura() (engine và Đấu Trường đều gọi trước hero()). Nhân vật chưa hợp đạo → gọi nguyên bản. Không đổi save/dữ liệu.
- Chỉnh: khối CF đầu module (w, flat, alpha, glow, motes). Mức hiệu năng "Tiết kiệm" (QL>=2) tự bỏ lớp nhấp nháy + tinh quang.
