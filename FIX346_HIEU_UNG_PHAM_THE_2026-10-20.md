# Fix346 — Nâng cấp hiệu ứng kỹ năng cơ bản + tu tiên của Phàm Thể

Chỉ vẽ, KHÔNG đổi sát thương / hồi chiêu / logic.

**File mới**
- `world/105-pham-the-fx-pro.js` — bộ vẽ: trảm trăng khuyết 3 lớp, trận pháp elip có chữ, vòng sóng, cột sáng, tia, sét 3 lớp, sao nổ, kiếm/thương/tên/tinh thể vẽ chi tiết, xoáy, khói, vật rơi (kiếm/thương/tên/sao băng). Không dùng shadowBlur.
- `world/105b-pham-the-fx-recipes.js` — công thức từng kỹ năng.

**Vá nhỏ** `core/01h-skill-fx.js`: cờ `MUT` (tắt vẽ khi chạy logic gốc), lộ `ZS.X` (SFX, ZFC, helper), 2 móc `PTX.on('quake'|'dragon')` cho Địa Chấn / Long Đảm Phá. `index.html` +2 script (sau world/88), `MODULE_MANIFEST.json`.

**Phủ**
- Cơ bản (thay hẳn bảng SFX): Kiếm Sĩ (Chém Mạnh, Xung Phong) · Kiếm Khách (Liên Hoàn Trảm, Hộ Thể, Phong Ma Trảm, Vạn Kiếm Quy Tông) · Thương Thủ (Liên Thích, Lưu Tinh Đột, Xuyên Tâm Thương, Thương Vũ, Địa Chấn, Long Đảm Phá) · Pháp Sư (Hỏa Cầu, Sét Đánh) · Triệu Hồi Sư (6) · Ma Thuật Sư (Lôi Liên Chuỗi, Băng Giáp, Bão Tuyết, Thiên Hỏa Giáng) · Cung Thủ (Tên Nhanh, Mưa Tên) · Xạ Thủ (4) · Thích Khách (6) + Hỏa Long Cầu.
- Tu tiên (30): w, m, a, w1, m0, a1 × (Luyện Khí → Hoá Thần). Logic gốc chạy với phần vẽ cũ bị mute, hiệu ứng mới thay thế.
- Đòn trúng (`ZS.hit`): thêm sao nổ + tia theo hệ.

**Chỉnh**: `PTXU_CF.enable=false` tắt (về hiệu ứng cũ) · `PTXU_CF.q` (0.4–1.5) mật độ hạt · `PTXU_CF.maxFx` trần số lớp vẽ (mặc định 90).
