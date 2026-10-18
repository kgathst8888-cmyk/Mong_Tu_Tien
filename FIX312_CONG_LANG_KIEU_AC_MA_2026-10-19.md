# Fix312 — Vẽ lại cổng Làng Tân Thủ 2 & 3 theo kiểu cổng Ác Ma
- Module mới: `world/100a-cong-kieu-ac-ma.js` (window.GTK), nạp TRƯỚC world/100 (?v=312). Chỉnh cỡ: `GTK.K` (mặc định .5).
- Kiểu Ác Ma: trận pháp elip dưới chân + hào quang, xoáy cổng nhỏ lõi tối, khung elip + 4 ngọc, bảng tên viên thuốc (icon · tên · dòng phụ).
- `world/100` và `world/102`: portal()/plate() gọi GTK nếu có (không có → vẽ bản cũ); GATE_R 46→34 (vùng chạm gọn hơn). Áp cho cả cổng vào (Làng 1) lẫn cổng "Về Làng" trong Làng 2/3.
- Màu theo từng làng: L2 vàng · L3 xanh băng · cổng về xanh lục; chưa đủ điều kiện → xám khoá, quay chậm.
