# Fix332 — Admin test không mang được đồ
- Nguyên nhân: nhân vật là Tiên Nhân → world/76 chỉ cho mặc đồ Thánh (r>=6); bảng admin chỉ tạo đồ tối đa phẩm 5 nên admin không có đồ để mặc.
- Vá: tài khoản admin (ADMIN.isAdmin) bỏ qua luật Thánh-only (world/76 holy/admOk, thêm CTHE.canWear); core/01p (pkEmpty) và core/01l (tự mặc) dùng CTHE.canWear. Người chơi thường giữ nguyên luật.
