# Fix255 — Khoá zoom trên trình duyệt điện thoại
- Nguyên nhân phóng to: ô đăng nhập chữ 15px -> iOS Safari tự zoom khi focus và giữ zoom sau khi tắt bàn phím.
- Sửa: core/00-khoa-zoom-mobile.js (mới, nạp đầu tiên), index.html (viewport khoá scale + nạp module), MODULE_MANIFEST.json.
- Module: viewport max-scale=1 + user-scalable=no; ô nhập >=16px trên cảm ứng; chặn gesture/pinch/Ctrl+lăn; tự reset scale về 1.
