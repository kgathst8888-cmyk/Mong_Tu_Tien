# Phàm Thể bước đi bằng ảnh GIF (Fix241)

Nhân vật CỦA MÌNH ở cảnh giới Phàm Thể (chưa Hợp Đạo, chưa Chuyển Thể, chưa chọn môn phái) dùng khung ảnh bước đi tách từ IMG_5516.gif.

- `assets/pham-the-gif-assets.js` — ảnh sprite (WebP base64) của Chiến binh / Pháp sư / Cung thủ + thông số (`window.PTGIF`).
- `equipment/60-pham-the-gif.js` — bọc `hero()` ở lớp ngoài cùng (nạp cuối index.html), tạm đặt `RIGI[cur]` = bộ xương phẳng rồi trả lại.
  Cánh, mũ, hào quang, cường hóa, hiệu ứng trạng thái, vũ khí/cung/chiêu đánh vẫn vẽ như cũ (theo tọa độ tay).
- Chỉ đi trái/phải: ảnh gốc quay mặt trái, được lật sang phải; `hero()` tự lật theo `P.d`.
- Pha bước theo quãng đường `P.x`; đứng yên dùng khung đứng yên. Đang đánh (P.atk>0) vẽ bằng bộ xương cũ để tay vung như trước (`PHAMTHE_GIF.gifAttack=true` để dùng ảnh GIF cả lúc đánh). Pháp sư chạy xuôi–ngược (váy che chân) và hạ sát đất (`CF.mageDrop`, 0 = lơ lửng như cũ).
- Không áp dụng: Đạo Thể, Tiên Nhân, đã chọn môn phái, người chơi khác (Làng Online), đối thủ Đấu Trường. Y Phục Tiệm Thời Trang tạm ẩn khi dùng ảnh này.
- Tắt/bật: `PHAMTHE_GIF.enable=false|true`. Chỉnh nhịp bước: `PHAMTHE_GIF.cyc` (lớn = bước chậm).
- File sửa: `index.html` (thêm 2 thẻ script cuối), `MODULE_MANIFEST.json`. File mới: 2 file trên + tài liệu này.
