# Vé Reset Hồn Phách (Fix292)
- ui/63-cash-shop.js: thêm hàng CFG.lt {k:'rh'} 500💎 (Shop Linh Thạch); D() khởi tạo csh.rh; kho tab 🎒 có nút Dùng → CSH.soulTk() → HONP.resetTk().
- world/57-hon-phach.js: HONP.resetTk() (xác nhận → trừ 1 vé → hpc.t=-1, tăng hpc.rs) mở lại bảng chọn; choose()/pick() cho chọn lại khi chưa có hồn phách nhưng còn hpc (giữ nguyên r/x/b/bag/m/v). Mục Hồn Phách trong Túi → 🧘 Tu tiên có nút 🎫 Dùng Vé (hoặc gợi ý mua vé). Khi chờ chọn lại, chosen()=null nên rơi hồn phách/buff/hiệu ứng tạm dừng; các nơi khác đã kiểm tra t>=0.
- ui/70-admin-panel.js (CSHL) + ui/69-thong-bao-thu.js (CSHK): thêm 'rh' để admin/thư tặng được vé.
