# Đột phá cảnh giới v2 (2026-10-15)
Module mới: `systems/66-dot-pha-canh-gioi.js` (window.DP). Chỉnh cân bằng ở khối `CF` trong module và `TV` đầu `core/01i-combat-core.js`.

| Đích | Cần thêm | Lôi kiếp |
|---|---|---|
| Luyện Khí | — | — |
| Trúc Cơ | 10 Trúc Cơ Đan | — |
| Kim Đan | 10 Kim Đan Đan | — |
| Nguyên Anh | 10 Nguyên Anh Đan + 10 Nguyên Liệu Đúc Nguyên Anh (Boss rơi 10%) | 3 đạo (cũ) |
| Hoá Thần | 10 Hoá Thần Đan | 6 đạo, mỗi đạo 10–25% HP tối đa |
| Luyện Hư | 10 Luyện Hư Đan | 9 đạo, như Hoá Thần |
| Hợp Thể | Linh Căn viên mãn (cũ) + Hồn Phách đạt Hợp Thể | 10 đạo (cũ) |
| Đại Thừa | Hồn Phách đạt Đại Thừa + Thần Thể viên mãn | 10 đạo (cũ) |

- Lôi kiếp giảm bởi chỉ số Giảm sát thương (SX 'dred', tối đa 50%), khiên kỹ năng và Tị Lôi Đan.
- Đan luyện ở tab ⚗ từ nguyên liệu rơi Boss (2 nguyên liệu → 1 đan, thành 90%). Nguyên liệu của cảnh giới X ngừng rơi khi nhân vật đã đạt X.
- Vàng và tỉ lệ đột phá giữ nguyên. Đan/nguyên liệu bị trừ cùng lúc với vàng (kể cả khi thất bại).
- Tu vi: cần ×10 · tự tu luyện ×1/3 · hạ quái ×1/2 · thuộc tính cộng từ tu tiên ×1/2 (`ZC.TV`).
- Mở Đại Thừa: ZC cho phép r=7 (tiểu cảnh 1–9 dùng htStep như Hợp Thể, viên mãn = Đại Thừa tầng 9).
- Đạo Thể (world/33-hop-dao.js) không còn thay cảnh giới bằng Đạo Cảnh: tu vi + đột phá vẫn hiện ở bảng nhân vật; tiên thuật vẫn bị khoá (thay bằng Thần Thông ở world/34).
