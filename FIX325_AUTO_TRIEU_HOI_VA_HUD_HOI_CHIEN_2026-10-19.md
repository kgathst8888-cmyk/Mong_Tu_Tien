# Fix325/326 — Auto triệu hồi dùng đủ kỹ năng · Thông báo HUD Hội Chiến Boss

## Fix325 — Auto hệ Triệu Hồi không dùng hết kỹ năng
**Nguyên nhân:** vòng AUTO (`core/01e-step-loop.js`) có dòng `if(kk[4]==6&&PETS.length>=2)continue;` — hễ đã có ≥2 thú là bỏ qua MỌI kỹ năng triệu hồi. Triệu Hồi Sư có 3 chiêu triệu hồi (Linh Lang / Mộc Linh / Cự Thạch), nên chiêu thứ 3 gần như không bao giờ được tung, và thú sắp hết hạn cũng không được làm mới.
**Sửa:** hàm mới `autoSumSkip(kk)` — chỉ bỏ qua khi thú CÙNG LOẠI còn sống và còn > 360 khung (~6 giây). Thú khác loại vẫn được triệu hồi, thú sắp hết hạn được gia hạn (SUMA làm mới thời gian, không đẻ trùng).
Áp dụng cho cả Đấu Trường (`systems/19-arena.js`, `choosePlayerSkill`) vì có cùng lỗi.

## Fix326 — Thông báo HUD khi Hội Chiến Boss mở
`world/94-hoi-chien-boss.js`: tới giờ mở (0h, 3h, …, 21h giờ VN) hiện bảng lớn giữa trên màn hình 12 giây ("HỘI CHIẾN BOSS ĐÃ MỞ!" + đếm ngược) và chữ nổi trên đầu nhân vật; sau đó thu thành chip nhỏ có đếm ngược (✕ để ẩn tới lần mở sau). Chạm vào: ở Làng thì mở bảng cổng, nơi khác thì nhắc đường về cổng.
Hiện ở mọi nơi trừ trong bản đồ Hội Chiến (đã có HUD riêng); chỉ hiện khi đã đăng nhập. Tắt: xoá dòng `setInterval(anTick,1000)`.

File đổi: `core/01e-step-loop.js`, `systems/19-arena.js`, `world/94-hoi-chien-boss.js`.
