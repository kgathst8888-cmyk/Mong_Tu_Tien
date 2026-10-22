# Fix411 – Giảm 50% sức mạnh quái bản đồ Phàm Thể Lv1-20
- world/132-giam-quai-pham-the-1-20.js (module mới, bọc spawn()): quái map 0 (Lv1-20) máu ×0.5, thủ ×0.5, sức đánh ×0.5 (e.rm). Gồm quái thường, Tinh Anh, Boss Sử Thi; trừ boss thế giới 'pal'.
- Chỉ áp khi quái Lv<=20, không đụng Nhân Giới / Linh Giới / Tiên Giới / phụ bản / làng.
- index.html: thêm script world/132-giam-quai-pham-the-1-20.js?v=411 sau world/131-linh-mach-dong.js.
- Chỉnh: window.QPT_GIAM.mul (0.5; đặt 1 để tắt).
