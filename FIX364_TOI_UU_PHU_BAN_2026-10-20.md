# Fix364 — Tối ưu lag/nóng máy cho phụ bản Fix361/362 (chỉ sửa 114a, 115, 116, 117; không đụng core/engine)
- Nền phụ bản: phần TĨNH (gradient, trăng, đồi cát, xương rồng...) vẽ 1 lần vào canvas đệm rồi `drawImage` mỗi khung. Cấu hình bằng `cfg.bgS(gy,api,ctx)` (PBC, `114a`); phần động còn lại ở `cfg.bg`. Đổi cỡ màn hình thì vẽ lại; nếu key đổi liên tục (>12 lần/120 khung) tự quay về vẽ trực tiếp. Canvas đệm được giải phóng khi rời phụ bản.
- Lớp phủ bão cát (Cốt Hải): vẽ ở NỬA độ phân giải (0.35 khi QL=2), chỉ vẽ lại mỗi 2 khung, gộp 2 lớp phủ thành 1, vệt cát 70→48 (28→20 khi lite). `getBoundingClientRect` chỉ đo lại mỗi 45 khung (trước đây mỗi khung → ép layout).
- Hình boss (vẽ canvas): vẽ lại mỗi 12 khung (Kính Hồ: 10), lite 24/20 (trước: 6 và 5); bỏ `shadowBlur` (rất nặng trên điện thoại, đã có gradient phát sáng).
- Kính Hồ: bỏ gradient hào quang Ảnh Thể ở chế độ lite.
- Độ khó (117): cache hệ số theo lựa chọn; các lần drop thêm chỉ hiện tối đa 3 chữ nổi.
- Lưu ý: nền Cốt Hải/Kính Hồ giờ là ảnh đệm nên giống hệt về hình, trừ lớp bão cát hơi mờ hơn do nửa độ phân giải. Nâng cấp Hoàng Kim (ui/103) không nặng nên giữ nguyên.
- Tắt phần cache nền: xoá `bgS` khỏi cfg và đưa phần vẽ vào `bg` như cũ.
