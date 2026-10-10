# Kỹ năng Tiên Tộc / Ma Tộc + sắp xếp ô kỹ năng (Fix55)
## world/53-y-canh-ky-nang-toc.js (+ vá nhỏ world/49 và systems/08)
- Màu hiệu ứng = màu sát thương Ý Cảnh: Tiên vàng #ffe24a viền cam #ff9a00; Ma đen #0c0614 viền tím #b070ff.
- TIÊN: 1) Thiên thần cầm kiếm chém xuống · 2) Hai rồng lao nhanh về phía địch (xuyên) · 3) Khe nứt hư không rải thiên thạch.
  Mở khoá 2-3 bằng NGỘ ĐẠO: thu hoạch 1 cây = +1, luyện thành 1 viên đan = +1; cần 1000 / 5000 (PS[cur].yc.ng).
- MA: 1) Bàn tay quỷ mọc từ đất liên tục 3s · 2) Oán linh bay qua bay lại gây sát thương 3s · 3) Hố đen bắn tia ma khí đen; tia giết địch triệu hồi quỷ xương (sống 5s, tối đa 5).
  Mở khoá 2-3 bằng MA KHÍ: hạ Boss Ma Thần (e.mt) ngẫu nhiên +1~10; cần 1000 / 5000 (PS[cur].yc.mk).
- Giữ nguyên TÊN, MP, hồi chiêu, hệ số sát thương và trạng thái (STLAST) của 3 thần thông. Chỉnh số liệu: khối CF.
## world/52-skill-layout.js
- Gom #lc-btn (18), #fb-bar (48), #yt-bar (49) vào khung #sk-side để không chồng lên nhau (trước đó cả 3 cùng right≈60-62px, top≈124px).

## Vẽ lại hiệu ứng (Fix64)
- Tiên: thiên thần có cánh lông vũ 3 lớp, giáp, hào quang, kiếm; hai rồng có vảy, chân vuốt, sừng, râu; khe nứt hư không có sao bên trong + thiên thạch đá nứt lửa.
- Ma: bàn tay quỷ nhiều đốt có móng, oán linh áo choàng rách + vệt bóng, hố đen xoáy + tia ma khí xúc tu, quỷ xương đủ bộ.
