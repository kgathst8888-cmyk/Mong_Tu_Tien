# Fix428 — Chống hack + tự khoá tài khoản can thiệp
## Đã có sẵn (giữ nguyên)
Phiên chơi duy nhất (phien_dang_nhap.sql) · 1 tab (61) · chữ ký localStorage (61) · sổ cái chống dupe + kthm_item_ok (chong_dube.sql) · chặn tụt cấp & trần BXH (push_save v4) · linh thạch do máy chủ giữ.
## Thêm mới
- `chong_hack_khoa_tk.sql` (CHẠY TRÊN SUPABASE): trigger quét gói lưu (vàng/mảnh, trang bị giả, nhảy cấp-bậc) → cộng điểm → khoá (banned_until + đá phiên). Admin miễn trừ. Quét lỗi không chặn lưu.
- `systems/62-chong-hack-khoa-tk.js` + 1 thẻ script trong index.html: báo LOCAL_TAMPER / LOCAL_RANGE lên máy chủ.
## Vận hành
- Mặc định **auto_lock = false** (chỉ ghi nhật ký). Xem: `select * from kthm_cheat_overview;` và `select * from kthm_cheat_log order by at desc limit 100;`
- Bật khoá: `update kthm_cheat_cfg set auto_lock = true;` (ngưỡng `threshold` = 100 điểm; 7 ngày sạch thì về 0).
- Mở khoá: `select kthm_cheat_unlock('<uid>');`
## Giới hạn thật
Game lưu tiến trình do client gửi lên nên máy chủ chỉ kiểm tra được mức "có hợp lý không", không chứng minh được 100%. Kẻ hiểu code vẫn có thể sửa số nhỏ vừa ngưỡng. Muốn chặt hơn nữa phải chuyển các nguồn thu (vàng, rơi đồ, EXP) sang tính trên máy chủ — việc lớn, làm theo từng hệ thống.
Chưa chạy thử trên DB thật và chưa mở game để kiểm tra; mới kiểm tra cú pháp JS.
