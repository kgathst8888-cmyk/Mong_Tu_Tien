# Fix337 — Lò Luyện Thánh Khí: bước Kết hợp không còn "bấm mà không chế được"
File sửa: core/01b-items-sets-wheel.js (HL.combine) — không đổi chi phí/tỉ lệ.
- Bỏ hộp xác nhận confirm() (trình duyệt điện thoại/webview hay chặn → bấm Kết hợp mà không có gì xảy ra). Nay: bấm ✨ Kết hợp lần 1 → hiện cảnh báo chi phí; bấm lần 2 trong 8 giây → thực hiện.
- Nếu lỗi xảy ra SAU khi đã trừ 💎 (vd lỗi tạo đồ), báo đúng "đã trừ phí nhưng lỗi…" thay vì báo nhầm "lỗi mạng — chưa mất mảnh".
Đã chạy thử headless (Chromium): luyện Mảnh Thánh, kết hợp, tạo đủ 10 vị trí × 3 nhân vật × 150 lần đều không lỗi; chưa tái hiện được lỗi gốc nên nếu vẫn không chế được, cần biết dòng thông báo hiện ra.
