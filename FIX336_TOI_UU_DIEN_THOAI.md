# Fix336 — Giảm giật lag / nóng máy trên điện thoại
Chỉ sửa core/01v-perf-boot.js (không đổi logic, sát thương, hồi chiêu, tốc độ chơi):
- Mức "Cân bằng" (mặc định của điện thoại): độ phân giải canvas tối đa 1.5 → 1.25 (~30% ít điểm ảnh phải vẽ). Muốn trả lại: QC=[2,1.5,1].
- Khi túi đồ/bảng (#bag, nền đen mờ che game) đang mở: vẽ canvas chậm lại 15fps (Cân bằng/Tiết kiệm) hoặc 30fps (Cao). Logic vẫn chạy 60 bước/giây.
- Kiểm tra trạng thái túi/đấu trường mỗi 12 khung thay vì 30 để phản ứng kịp.
Lưu ý: chưa đo trên máy thật (môi trường không có trình duyệt). Các tối ưu cũ (Fix35/231/329/335) giữ nguyên.
## Bổ sung: giảm đồng hồ thăm dò (polling)
Bộ đếm giờ chạy ngầm bị nới nhịp và tạm dừng khi tab ẩn: ui/58 (150→300ms), equipment/64 (300→1000ms, 700→1400ms), world/34 (700→1500ms), world/85 (600→1000ms), ui/101 (1200→2000ms), ui/16 (250→500ms). Không đổi logic.
