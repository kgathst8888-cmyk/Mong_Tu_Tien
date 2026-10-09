# Làng Online (Fix37)
1. Chạy `village_presence.sql` 1 lần trong Supabase → SQL Editor.
2. Đăng nhập ☁, vào làng (nút làng) → thấy người chơi khác đang ở làng (tối đa 14 người gần nhất), tên + cấp trên đầu.
3. Chạm vào người khác: xem hồ sơ. Cột nút bên trái (👋😄🙏⚔️): gửi biểu cảm, mọi người thấy ~4 giây.
4. Cơ chế: `vp_ping` mỗi ~2.5s (vừa báo vị trí vừa lấy danh sách), rời làng/ẩn tab → `vp_leave`. Im >12s tự biến mất.
5. File: `world/41-lang-online.js` (nằm ngay sau 03-village.js trong index.html). Không sửa file cũ.
6. Lưu ý: trang phục/vũ khí hiển thị theo trang bị của máy bạn (giống Arena), chưa đồng bộ trang bị thật.

## Kiểm thử (headless Chromium, server giả lập)
- 0 lỗi JS; người khác hiển thị đúng lớp/nhánh; rời làng → danh sách xóa, vào lại → hiện lại.
- Chống đè: vị trí được tách theo bề rộng thân (kể cả nhân vật của bạn); 14 người cùng 1 điểm vẫn 0 cặp chồng nhau.
- Nhãn tên xếp 3 tầng độ cao để không dính nhau. Nút biểu cảm gộp thành 1 nút 👋 (bấm mở 4 biểu cảm) để không che menu.
