# Đấu Trường Online (Fix36)
1. Chạy `arena_online.sql` 1 lần trong Supabase → SQL Editor (an toàn chạy lại nhiều lần).
2. Người chơi đăng nhập ☁ rồi mở ⚔️ Đấu Trường: hồ sơ chiến đấu (tên, lớp, nhánh, cấp, lực chiến) được gửi lên `arena_players`.
3. Sảnh có 3 tab: Thách đấu (5 người thật có điểm gần mình) · Xếp hạng (top 20) · Nhật ký (kể cả lượt người khác thách đấu mình, có chấm đỏ).
4. Thách đấu = đánh với bản sao hồ sơ của người chơi thật (họ không cần online). Trận chạy trên máy người thách đấu bằng engine map thật; HP/ATK/DEF đối thủ suy ra từ tỉ lệ lực chiến (cùng công thức cũ).
5. Máy chủ giữ ĐIỂM (Elo K=32), HẠNG, 10 lượt/ngày (giờ VN), nhật ký. Người bị thách đấu thua/thắng nửa số điểm. Rời trận giữa chừng = thua.
6. Thiếu người thật (<5) → bù đối thủ máy "🤖 Luyện tập" (không tính điểm online, 10 lượt/ngày riêng, cục bộ). Chưa đăng nhập → chỉ luyện tập với máy như bản cũ.
7. Giới hạn: kết quả trận do máy khách báo lên (cùng mức tin cậy với Boss Bất Tử); máy chủ chỉ nhận khi có lượt đang chờ (arena_begin, hạn 15 phút).
