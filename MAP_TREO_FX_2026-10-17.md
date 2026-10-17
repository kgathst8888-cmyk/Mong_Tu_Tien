# Fix168 — Hiệu ứng kỹ năng mới cho Map Treo (kể cả map quái Tiên Giới của Tiên Nhân)

File mới: `world/83-map-treo-fx-pro.js` (nạp sau world/82). Chỉ bật khi `AFKMAP.on()`; map khác giữ nguyên. Không đổi sát thương/hồi chiêu.
- Tái dùng `TG8SK.R.*` của world/82 theo góc nhìn ngang (quay mặt theo `P.d`); chiêu đánh điểm tự dời tâm tới mục tiêu.
- Môn phái (world/72): thay hẳn hiệu ứng cũ + hiệu ứng trúng đòn. Ý Cảnh (49), Pháp Bảo (48), Linh Căn (systems/18): vẽ thêm lên hiệu ứng gốc.
Vá nhỏ: 72 (guard ring/pillar/beam/slash/sparks, hook cast + hit), 49/48/18 (1 dòng hook cast); world/82 (xuất main/aura/hitFx/cur).
Chỉnh: `TGFX2_CF.scope` = 'treo' (mặc định) | 'tien' (thêm Tiên Nhân mọi map 2D) | 'all'; `TGFX2_CF.maxFx`; `TGFX2_CF.enable=false` để tắt.
