# Fix429 – Chặn lách "đập đồ thất bại → khôi phục bản lưu cũ"
- Lỗ hổng: ☁ Tài khoản → Khôi phục theo thời điểm cho quay về mốc 10 phút không giới hạn → cường hóa lỗi thì quay lại làm lại (và có thể nhân đồ sau khi bán/giao dịch). Ngoài ra F5 trước khi bản lưu (3–12s) lên mây cũng huỷ được kết quả xấu.
- SQL (PHẢI chạy 1 lần trong Supabase SQL Editor): chong_scum_khoi_phuc.sql
  * Khôi phục: 1 lần/24h, tối đa 3 lần/7 ngày (chung cho restore_snapshot + restore_backup). Admin (kthm_admin) không bị giới hạn.
  * Không cho quay về mốc 'frequent' (10 phút) và 'prerestore'; list_snapshots ẩn các mốc này.
  * Bảng restore_log ghi nhật ký; restore_status() cho client biết còn khoá bao lâu.
- Client: systems/12-cloud-save.js (hiện khoá + cảnh báo rõ trước khi khôi phục); world/38-da-cuong-hoa.js (saveNow ngay sau mỗi lần cường hóa). index.html thêm ?v=429.
- Chỉnh hạn mức: biến cd_h, max_7d trong restore_status(). Hoàn tác: chong_scum_khoi_phuc_ROLLBACK.sql.
- Chưa vá được: người chơi chặn mạng đúng lúc cường hóa rồi F5 (RNG chạy ở client). Muốn triệt để phải chuyển phần roll cường hóa lên máy chủ.
