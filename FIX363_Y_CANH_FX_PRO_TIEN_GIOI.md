# Fix363 — Hiệu ứng Ý Cảnh Tiên Đạo 2.5D · GIAI ĐOẠN 1 (thử nghiệm 1 kỹ năng)

## Phạm vi
Chỉ làm lại hiệu ứng **Kim Quang Phổ Chiếu** (Tiên Đạo #1). Chờ xác nhận rồi mới áp cho các kỹ năng còn lại.

## Tệp
- **MỚI** `world/118-y-canh-fx-pro.js` — thư viện hiệu ứng + hiệu ứng Kim Quang Phổ Chiếu.
- **SỬA** `index.html` — thêm 1 thẻ `<script src="world/118-y-canh-fx-pro.js">` ngay sau `world/53-y-canh-ky-nang-toc.js`.
- Không sửa tệp nào khác. Không đụng sát thương / MP / hồi chiêu / bạo kích / AUTO / quái / boss / nhiệm vụ.

## Cách hoạt động
Bọc `YCTOC.fire` (world/53): chạy hiệu ứng mới rồi gọi lại hàm gốc → thiên thần chém, sát thương (khung 19), STLAST, choáng/xuyên giáp/bạo kích (world/50) giữ nguyên.
Dòng thời gian (52 khung): 0–19 tụ lực (pháp trận mọc, bùa dựng lên, hạt linh lực hút vào tâm) → 19 bùng nổ cùng lúc có sát thương (sóng xung kích vàng + tím, cột sáng, tia hào quang, nổ trên từng địch trúng) → 19–52 tan dần.
Lớp: vòng chân nhân vật · Thái Cực xoay · Bát Quái xoay ngược · vòng phù văn · 4–8 bùa phù · hạt · sóng xung kích · cột sáng · hiệu ứng trúng đích (theo đúng bán kính `r` của chiêu).

## Tối ưu / dọn dẹp
- Texture vẽ sẵn 1 lần (không cần tệp ảnh, không dùng font) → không có đường dẫn tài nguyên giả.
- 3 mức chất lượng: 0 thấp · 1 vừa (mặc định điện thoại) · 2 cao (mặc định máy tính). Tự hạ khi `window.FXSLOW===1`, khi FX>50 hoặc địch>10. Ép tay: `YCFXP.cfg.q = 0|1|2`; tắt hẳn: `YCFXP.cfg.on=false`.
- Giới hạn số trận chạy đồng thời (3–4). FX tự bị engine gỡ khi hết life; `YCFXP.clear()` gỡ tay.
- Mọi lỗi trong module bị nuốt bằng try/catch, không chặn chiến đấu.

## Thư viện dùng lại cho các kỹ năng sau
`YCFXP.lib` = layer · glow · shock · pillar · burst · motes · banners · foot · tex{ring,bagua,taiji,glow,banner}. Đăng ký chiêu: `YCFXP.reg('t',j,fn)` (đạo, số thứ tự 0-2).

## Ghi chú
`tools/check.py` báo 21–22 "THIẾU FILE" giả vì không bỏ phần `?v=` của URL — đã có từ bản cũ, các tệp đều tồn tại.

## Bổ sung — bản Tiên Giới 2.5D isometric (world/119-y-canh-fx-tien-gioi.js)
- Thành Tiên Giới (world/61) và Tiên Linh Chiến Cảnh (world/84) dùng hệ kỹ năng 8 hướng của world/79, KHÔNG đi qua `YCTOC.fire` → module 111 không chạm tới. Module 112 bọc `TG8SK.R.ycB` (sau world/82 + world/88).
- Chỉ Tiên Đạo (`F.ma=false`) dùng bản vẽ mới; Ma Đạo, chiêu khác, hoặc `YCFXTG.cfg.on=false`, hoặc lỗi bất kỳ → hiệu ứng cũ. Công thức gốc vẫn được gọi 1 lần để world/82 giữ đúng màu/kiểu hiệu ứng trúng đòn.
- Vẽ theo mặt đất isometric 2:1 (màn hình = (u, v/2)), tâm trận = đúng mục tiêu world/81 `doYc` chọn, bán kính vẽ = 1,2 × bán kính sát thương, NEO THEO THẾ GIỚI (nhân vật đi tiếp thì trận đứng yên).
- world/81 gây sát thương ngay lúc bấm nên vùng nổ ở p≈0,08 (≈10 khung tụ lực). Không đổi sát thương/MP/hồi chiêu.
- Nền Tiên Giới là đá trắng sáng: mỗi lớp trận vẽ 2 lượt (cộng sáng `lighter` cho nền tối + nhân màu `multiply` cho nền sáng) để nét vàng/tím không bị cháy.
- `index.html`: thẻ `<script src="world/119-y-canh-fx-tien-gioi.js">` đặt ngay sau `world/90-tien-gioi-chi-tiet.js`.


## Bổ sung — 2 chiêu còn lại của Tiên Đạo cho Tiên Giới (world/120-y-canh-fx-tien-gioi-2.js)
- Bọc `TG8SK.R.ycM` (Vô Ngã Kiếm Vũ) và `TG8SK.R.ycS` (Quy Nhất Thiên Phạt) — cùng điều kiện như world/119: chỉ Tiên Đạo + `TG.on()`; Ma Đạo / Map Treo 2D / `YCFXTG2.cfg.on=false` / lỗi → hiệu ứng gốc. Nạp ngay sau world/119 (dùng `YCFXTG.lib` xuất từ 112).
- **Vô Ngã Kiếm Vũ**: world/81 đánh `h` đòn (5) vào địch gần nhất (<600), mỗi 7 khung → 2 rồng vàng (thân vàng hổ phách + viền tím, đầu có sừng/râu) bay đường xoắn kép tới mục tiêu rồi cuộn quanh, vòng xoáy Thái Cực dưới mục tiêu bám theo khi địch di chuyển; mỗi đòn có kiếm khí lưỡi liềm + nổ trúng đích đúng khung gây sát thương.
- **Quy Nhất Thiên Phạt**: world/81 đánh MỌI địch trong 900, địch thứ i ở khung 3×min(i,8) → trận pháp dưới chân, khe nứt hư không trên trời (neo mép trên màn hình), thiên thạch rơi đúng từng địch (chạm đất đúng khung gây sát thương), thiên thạch phụ rơi quanh, nứt đất, cột sáng giữa + sóng xung kích.
- Nhịp tính theo KHUNG (không đổi theo `TG8SK_CF.slow`); `life` tự tính để tổng thời gian không phụ thuộc hệ số làm chậm.
- Chất lượng 0/1/2 theo `YCFXP.cfg.q` / FXSLOW / TGFX_CF.q: giảm độ dài rồng, số thiên thạch (6/10/16 theo địch + 6/12/22 phụ), bỏ Bát Quái + vòng gió ở mức thấp.
- `index.html`: thẻ `<script src="world/120-y-canh-fx-tien-gioi-2.js">` sau world/119.

## Ghi chú ghép vào v23_Fix362
- Số module 105–117 đã được các tính năng khác dùng → module Ý Cảnh đặt ở `world/118` (2D), `world/119` (Tiên Giới: Kim Quang Phổ Chiếu), `world/120` (Tiên Giới: Vô Ngã Kiếm Vũ + Quy Nhất Thiên Phạt). Không đè tệp nào có sẵn.
- Bản Tiên Giới chỉ chạy khi `TG.on()`; world/83 (Map Treo 2D) cũng gọi `TG8SK.R.ycB` nên ở đó vẫn dùng hiệu ứng gốc.
