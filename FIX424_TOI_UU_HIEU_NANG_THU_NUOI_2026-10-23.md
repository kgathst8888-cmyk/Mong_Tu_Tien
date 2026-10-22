# Fix424 — Tối ưu hiệu năng thú nuôi

Đo bằng trình duyệt headless (chi phí vẽ mỗi khung, cấp 4): Bạch Hổ 2,1→~1,1 ms · Thanh Long 2,1→~1,5 ms · Huyền Vũ 2,7→~1,9 ms (cấp 1 Huyền Vũ 1,6→~0,5–1,0). Máy thật có GPU/điện thoại: số lệnh vẽ giảm nhiều hơn tỉ lệ này.

## Thay đổi
1. `core/01d-pet-render.js`
   - `hvDraw` (Huyền Vũ): lưới biến dạng vẽ vào ảnh đệm trên `EP.__hvc`, làm mới 30Hz (khung xen kẽ chỉ dán 1 ảnh). Ảnh đệm theo từng EP nên thú của người chơi khác ở làng không đè nhau.
   - `drDraw` (Rồng): thân hàm chuyển thành `drDrawBody(G,…)`; `drDraw` vẽ vào ảnh đệm `EP.__drc` 30Hz.
   - `glowDraw`: bỏ `save/restore`, bỏ qua quầng alpha<0,012 hoặc bán kính<0,6 (quầng cộng sáng là phần tốn fill-rate nhất).
2. `pets/34-toi-uu-hieu-nang.js` (MỚI): cắt vẽ thú ngoài màn hình (Bạch Hổ/Thanh Long/Huyền Vũ); tự bật `PETFX_LITE` khi khung hình chậm (TB trượt >26ms trong ~1,5s), tự tắt khi mượt lại.
3. `pets/32` + `pets/33`: bỏ toàn bộ `shadowBlur` (rất nặng trên di động) — thay bằng lượt nét rộng mờ + `glowDraw` có sẵn bộ đệm.
Bạch Hổ đã có ảnh đệm lưới 30Hz sẵn (cmesh) nên không đổi. Chu Tước không đụng.

## Công tắc
`window.PETPERF_OFF=true` tắt ảnh đệm + cắt ngoài màn hình (về cách vẽ cũ). `window.PETFX_LITE=true` + `PETFX_LITE_USER=true` ép chế độ nhẹ cố định.

## Đã kiểm
So sánh điểm ảnh bản đệm với bản cũ ở 16 trạng thái (2 thú × 4 cấp × đứng/đánh): hình giống nhau (chỉ lệch ở viền khử răng cưa), ảnh đệm không bị cắt (0 điểm chạm biên). Cast đủ 15 kỹ năng không lỗi.
