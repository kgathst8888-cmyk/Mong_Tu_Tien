# Huy hiệu Tiên Tộc / Ma Tộc (world/51-toc-huy-hieu.js)
- Nhân vật đã chọn Tiên Đạo (Ý Cảnh, PS[cur].yc.p = 't') → huy hiệu vàng "TIÊN TỘC"; chọn Ma Đạo ('m') → huy hiệu đen tím "MA TỘC".
- Huy hiệu hiện ngay bên trái tên nhân vật (dòng "Tên · Cảnh giới" phía trên đầu nhân vật trong map). Chưa chọn đạo → không hiện.
- Cách làm: bọc nameTag() của engine, tính vị trí đúng công thức nameTag. Ảnh nền trong suốt nhúng sẵn trong module. Không đổi save/dữ liệu.
- Chỉnh cỡ: CF.h (cao tối thiểu), CF.k (tỉ lệ theo cỡ chữ), CF.gap (khoảng cách tới tên).
