# Fix422 — Tối ưu hình ảnh Thôn Tân Thủ (chống giật, world/134 + world/135)
Nguyên nhân giật: lúc vào làng/xoay màn hình, world/134 dựng nền trong 1 khung — riêng bãi cỏ vẽ ~24.000 nhúm cỏ (đo trên trình duyệt không GPU: màn dọc DPR3 ≈ 2,2 s, ngang DPR2 ≈ 0,6 s).
- Bãi cỏ: vẽ 1 hoạ tiết cỏ nhỏ (pattern lặp liền mạch) rồi tô cả bãi; còn ~900 mảng cỏ mềm tối đa. Đệm sau tối ưu: màn dọc ≈ 0,15 s.
- Dựng nền theo bước (4 bước, mỗi khung 1 bước, ngân sách ~4ms): khung nặng nhất còn ≈ 40–85 ms thay vì 600–2200 ms. 135: mỗi khung dựng tối đa 1 sprite nhà.
- Độ phân giải đệm tối đa 1,5x (nhà: 2x); QL>=1 → 1x. Giảm ~4x bộ nhớ trên màn DPR 3.
- Mỗi khung chỉ drawImage đúng phần đang nhìn thấy (cắt theo camera làng rộng); hiệu ứng động (gà, bướm, cá, cánh hoa, nhà ngoài màn hình) bị bỏ qua khi ngoài tầm nhìn.
- Bỏ globalCompositeOperation 'lighter' (chậm trên mobile) → dùng alpha thường.
- Tự bảo vệ: nếu phần vẽ làng trung bình > 3,5 ms/khung (sau 120 khung) → tự tắt hiệu ứng động (TTD.fx=false, TTD.auto=true), giữ nguyên hình tĩnh.
- Không đổi hình/logic: bố cục, màu, đồ vật như Fix418/421 (cỏ nhúm thay bằng hoạ tiết nên hạt cỏ hơi khác).
- Bật/tắt: TTD.on / TTN.on / TTD.fx / TTN.fx; TTD.rebuild() / TTN.rebuild() dựng lại.
