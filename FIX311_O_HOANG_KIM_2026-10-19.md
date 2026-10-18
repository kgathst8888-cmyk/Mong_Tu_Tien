# Fix311 — 4 ô Trang Bị Hoàng Kim (tab Túi)
- Module mới: `ui/100-o-hoang-kim.js` (window.HK), nạp sau ui/99 trong index.html (?v=311).
- Vị trí: hàng dưới khung nhân vật, 2 ô trái + 2 ô phải ô thú nuôi. Hiện đang trống (chưa có trang bị Hoàng Kim).
- Chạm ô → bảng giới thiệu → nút "Đến Nhà Trang Sức": đóng túi, dịch chuyển Làng Tân Thủ 2 (BDT.go('l2'), cần Lv60) và tự đi bộ tới Nhà Chế Tạo Trang Sức Hoàng Kim. Nhà vẫn hiện "Cập nhật sau" (chức năng chế tác chưa làm).
- Patch nhỏ: `world/100-lang-tan-thu-2.js` thêm `TT2.goHouse(i)` (đi bộ tới nhà i).
- Cập nhật sau: HK.slots (tên/icon 4 ô), HK.items[i] (món đã mặc), gắn `open` cho HOUSES[1] ở world/100.
- Gỡ: xoá thẻ script ui/100 (TT2.goHouse vô hại).
