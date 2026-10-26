# Fix437 — Đồ đã cường hoá không được treo lên chợ online
- Client: `systems/32-cho-giao-dich.js` (`?v=437`) `post()`: món có `u > 0` bị chặn ngay, báo "Đồ đã cường hoá không thể treo lên chợ", đồ không rời túi. Đá khảm/mảnh sách không bị ảnh hưởng.
- Máy chủ: `fix437_cho_cam_do_cuong_hoa.sql` (trigger `cho_no_enhanced` trên `cho_listing`, ném `ENHANCED_ITEM`); client bắt lỗi này và trả đồ về túi. Chặn cả khi ai đó gọi `cho_post` trực tiếp.
- Không đụng tin đã/đang bán. Lúc áp: không có tin đang bán nào là đồ cường hoá.
- Fix436 (cho phép u<=15 trong `kthm_item_ok`) vẫn giữ: đồ +11..+15 được phép sở hữu, chỉ không được lên chợ.
