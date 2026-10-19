# Fix340 — Chiến Trường Tiên · Ma: tối ưu hiệu năng + sửa lỗi PvP
**Việc cần làm:** chạy lại `chien_truong_tien_ma.sql` bản mới trong Supabase → SQL Editor (an toàn: giữ nguyên bảng/dữ liệu, chỉ thêm 2 cột + thay 4 hàm + thêm chỉ mục). Chưa chạy lại thì PvP vẫn chạy với hàm cũ, nhưng các lỗi phía máy chủ bên dưới vẫn còn.

## Tối ưu (phía máy khách, world/104)
- Không còn vẽ thế giới Làng phía dưới khi đang đánh (bọc `draw()` giống cách các module khác đang làm; thoát trận là vẽ lại ngay). Trước đây game vẽ 2 cảnh cùng lúc.
- Nền chiến trường (trời, ánh sáng 2 phe, sao, mặt đất) vẽ 1 lần vào canvas phụ rồi `drawImage` mỗi khung (trước: tạo 4 gradient + 40 hình mỗi khung).
- Khung hình tối đa 45 fps (`CTM_CF.pv.fps`), DPR tối đa 1.5 (`pv.dpr`), không cấp phát mảng/hàm mới mỗi khung (sắp xếp đơn vị dùng mảng tái sử dụng).
- Đồng bộ mạng 300ms (trước 250ms) → giảm ~17% số lần gọi.
## Tối ưu (phía máy chủ, SQL)
- `ctm_sync` không còn khoá hàng phòng ở mỗi lần gọi (chỉ khoá khi chuyển trạng thái chờ→đang đánh→kết thúc).
- Chỉ mục mới (`ctm_room(created)`, chỉ mục riêng cho phòng đang chờ), tự dọn phòng cũ hơn 3 giờ.

## Lỗi đã sửa
1. **Người "ma" mở trận trống:** thoát/đóng game khi đang chờ vẫn được tính là có mặt → trận mở ra với đối thủ không tồn tại. Nay chỉ tính người đã gửi tín hiệu trong 8 giây gần nhất, và dọn người ma khỏi phòng chờ.
2. **Bấm "Đánh với máy ngay" lúc đang ghép** để lại người ma trong phòng (gây lỗi 1). Nay tự rời phòng.
3. **Đối thủ bỏ đi giữa trận:** trận cứ chạy đến hết giờ. Nay một phe mất hết người > 8 giây thì trận kết thúc, phe còn lại thắng; người bỏ đi không có thưởng.
4. **Bị giữ chân ở căn cứ:** thêm bất tử 2 giây (`pv.inv`) khi vào trận và sau mỗi lần hồi sinh.
5. **Đối thủ hồi sinh "trượt" ngang bản đồ** thay vì xuất hiện ở căn cứ.
6. **Tab bị ẩn/thoát màn hình** khi đang đánh: anh hùng đứng yên bị đánh chết liên tục (tặng điểm cho địch). Nay ẩn > 4 giây (`pv.hideS`) thì bị loại khỏi trận và báo rời.
7. **Kẹt "Đang tính thưởng"** khi mạng chập chờn: thêm timeout 8 giây và tự thử lại 1 lần; máy chủ trả lại đúng kết quả lần đầu (không thưởng đôi).
8. **Kẹt đồng bộ** khi một yêu cầu mạng treo: tự gỡ sau 3 giây.
9. Ghép vào phòng sắp hết hạn: nay chỉ ghép vào phòng còn ít nhất 10 giây chờ.

## Đã thử (mô phỏng, chưa đo trên máy thật)
- Luồng đầy đủ qua giao diện: chọn phe → trả vé → ghép → đánh → kết thúc → nhận thưởng (đúng 1 lần, vàng + Chiến Công cập nhật), thế giới dưới không vẽ khi đang đánh và vẽ lại sau khi thoát.
- Đối thủ biến mất (máy chủ kết thúc, mình thắng, nhận thưởng) · bấm bỏ chờ lúc đang ghép (máy chủ ghi rời) · ẩn tab (bị loại, máy chủ ghi rời).
- SQL mới đã được đọc rà kỹ nhưng CHƯA chạy thử trên Postgres thật — sau khi chạy hãy thử 1 trận 1v1 giữa 2 tài khoản.
