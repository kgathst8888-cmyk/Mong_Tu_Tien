# Thành Thị Tiên Giới — bản đồ 2.5D (world/61-tien-gioi-thanh.js)
- Cổng vào: "Thiên Môn Tiên Giới" lơ lửng trên trời Thành Thị Linh Giới (4 ô cổng LCT đã dùng hết nên vẽ riêng). Chạm → nhân vật đi tới dưới cổng → vào.
- Góc nhìn 2.5D (isometric): đảo lơ lửng trên biển mây nối bằng cầu đá vòm lớn; chạm để đi (tự tìm đường qua cầu), phím mũi tên/WASD; nhân vật + thú cưng vẽ bằng hero()/drawEP() (tạm đổi P.x/GY/cam/s).
- Mục TẠM KHOÁ (SPOTS, open:0): Thiên Cung Điện, Tiên Giới Đấu Trường, Linh Mạch Động Phủ, Đan Dược Các, Thiên Binh Các, Tiên Thú Viên, Vạn Pháp Tháp, Tiên Thị. Chạm → đi tới cửa → thẻ "🔒 Tạm khoá — sắp mở". Mở sau này: SPOTS[i].open=1 và gán SPOTS[i].go=function(){...}.
- "Tinh Hà Truyền Tống" (open:1) quay về Thành Thị Linh Giới; nút 🏘 Làng cũng quay về Linh Giới.
- Hiệu năng: sprite tĩnh dựng 1 lần (dựng sẵn dần), lớp nền hạ độ phân giải; theo QL của game: QL1 bớt mây/sao/ruy băng/cánh hoa, QL2 tối giản.
- Tên bản đồ HUD đổi bằng bọc g.fillText (không sửa engine). Chỉnh: CF (needDao, speed, heroK), SPOTS.

## Điều khiển vuốt (Fix120)
- Khi ở Tiên Giới: chạm giữ rồi kéo = nhân vật đi theo hướng ngón tay (hiện cần vuốt nổi, kéo nhẹ đi chậm, kéo xa đi nhanh). Nhả tay = dừng.
- Chạm nhanh không kéo = chạm-để-đi / chạm công trình như cũ (xử lý lúc nhả tay).
- Chỉnh: SWT (ngưỡng bắt đầu vuốt, px), SWR (bán kính cần vuốt, px) trong world/61-tien-gioi-thanh.js. Phím WASD/mũi tên vẫn dùng được.
