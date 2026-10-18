# Fix293/294 — Cloud Guard + snapshot 2 tầng + đẩy theo mức quan trọng
## Máy chủ (ĐÃ áp dụng lên Supabase, file: luu_mang_snapshot_v2.sql · hoàn tác: luu_mang_snapshot_v2_ROLLBACK.sql)
- push_save: giữ nguyên logic cũ; lịch sử 2 tầng: 'frequent' mỗi 10 phút (giữ 12) + 'hourly'/'force' mỗi giờ (giữ 48).
- list_snapshots() / restore_snapshot(id): người chơi tự quay về mốc (bản hiện tại được giữ làm backup + ghi 'prerestore').
## Client
- systems/12b-cloud-guard.js (mới, nạp sau 12): xếp hàng push_save, tự nối rev, tự chữa mất phản hồi, chặn ghi đè bản rỗng,
  đẩy NGAY khi: lên cấp / chuyển chức / đột phá cảnh giới / đổi trang bị / nhặt đồ Sử Thi+ (cách nhau ≥3s).
- systems/12-cloud-save.js: DEB 3000, MINGAP 12000 (việc thường gộp 12s); nút "🕰 Khôi phục theo thời điểm" trong ☁ Tài khoản.
## Fix295 — hộp "Chọn bản lưu"
- Hai ô cũ là ẢNH CHỤP lúc phát hiện xung đột (ghi giờ), không cập nhật khi tiếp tục chơi. Thêm ô 🎮 "Đang chơi" cập nhật mỗi giây (nhân vật đang hoạt động, không phải nhân vật mạnh nhất).
- "Dùng bản đang chơi" luôn đẩy trạng thái hiện tại (pack() lúc bấm). Server luôn chụp 'force' bản mây cũ trước khi ghi đè.
