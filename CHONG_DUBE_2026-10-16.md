# Ghép chống dube + khoá 1 tab (từ Fix89_ChongDube → Fix117)
- Thêm: systems/61-chong-dube-bao-mat.js (nạp CUỐI index.html, sau ui/70-admin-panel.js để bọc sv/step/gen sau mọi module), chong_dube.sql.
- Vá: systems/12-cloud-save.js (lsSet gọi ANTIDUPE.resign); systems/32-cho-giao-dich.js (thông báo DUPE_ITEM/BAD_ITEM/RATE_LIMIT, gán uid khi đăng/nhận, bỏ bản trùng uid trong hòm nhận, KHÔNG trả đồ về túi khi máy chủ từ chối DUPE/BAD). Đá khảm / mảnh sách thần thông (bản Fix117) vẫn giữ nguyên.
- Máy chủ: chạy chong_dube.sql trong Supabase SQL Editor SAU cho_giao_dich.sql (an toàn chạy lại; nếu đã chạy ở bản Fix89 thì không cần chạy lại).
- Không build HTML đơn — chỉ giao zip.
