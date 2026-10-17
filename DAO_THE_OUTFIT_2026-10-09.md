# Trang phục Đạo Thể (2026-10-09)

Module mới: `equipment/51-dao-the-outfit.js` (nạp cuối cùng trong index.html, sau `world/50-y-canh-hieu-ung.js`).

- Khi nhân vật đã Hợp Đạo (`HDAO.on()`), ngoại hình 3 hệ (0 Chiến binh · 1 Pháp sư · 2 Cung thủ) đổi sang bộ trang phục mới.
- Ảnh được cắt thành các mảnh đúng cấu trúc `RIGD` (thân+đầu, tay trên/dưới, chân, giáp vai, điểm khớp) nên khớp mọi hoạt ảnh:
  đi, nhảy/bay, vung kiếm, đâm thương, kéo cung, niệm phép. Pháp sư vẫn lơ lửng, gấu váy vẫn phấp phới.
- Cách gắn: bọc `hero()` ở lớp ngoài cùng, tạm đặt `RIGI[cur]` = bộ mảnh Đạo Thể khi vẽ rồi trả lại. Không sửa engine/save/dữ liệu.
- Chỉ áp dụng cho nhân vật của mình; người chơi khác (Làng Online) và đối thủ Đấu Trường vẽ như cũ.
- Y Phục (Tiệm Thời Trang) tạm ẩn khi mặc bộ này; cánh / hào quang / mũ vẫn hiện.
- Tắt/bật khi chơi: `window.DAOTHE_OUTFIT.enable = false|true`.

File thay đổi: `equipment/51-dao-the-outfit.js` (mới), `index.html`, `MODULE_MANIFEST.json`, `Mong_Tu_Tien_CLAUDE.html`.
