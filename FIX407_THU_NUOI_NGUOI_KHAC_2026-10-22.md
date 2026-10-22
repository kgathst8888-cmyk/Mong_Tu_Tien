# Fix407 — Thú nuôi của người chơi khác (Làng/Thành Thị/Tiên Giới online)
- Chỉ sửa world/77-thanh-online.js (paint) + index.html (?v=407).
- Lỗi cũ: thú người khác đứng im (không chạy hoạt ảnh bay/nhún/lửa); dùng chung mảng trail/queue với thú của mình và để lại trường lạ trên EP → thú lệch/nhoè; chủ dịch chuyển xa thì thú bay ngang cả màn hình.
- Nay: mỗi thú có trạng thái riêng, có hoạt ảnh (bay lơ lửng / nhảy bước, cánh/lửa), dọn EP sau khi vẽ, thú bám sát chủ khi chủ nhảy xa.
- Chưa làm: thú người khác bay tự do/tấn công như thú của mình.
