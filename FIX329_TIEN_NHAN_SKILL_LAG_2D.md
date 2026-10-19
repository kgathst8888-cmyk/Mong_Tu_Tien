# Fix329 — Tiên Nhân tung skill ở bản đồ 2D bị giật lag
- Nguyên nhân: world/88 phủ lớp hiệu ứng nặng (hàng chục glow "lighter", dring, beam gradient) cho MỖI chiêu và MỖI quái trúng đòn; AoE trúng nhiều quái hoặc auto-cast liên tục → hàng trăm lệnh vẽ/khung.
- Vá (chỉ world/88-skill-fx-ultra.js): giới hạn lớp phủ đồng thời TGFXU_CF.maxOv=2 (chiêu) và TGFXU_CF.maxHit=3 (trúng đòn); phần vượt chỉ vẽ hiệu ứng gốc 82/83. Mật độ hạt Q() tự giảm 25-50% khi nhiều lớp phủ đang chạy.
- Không đổi sát thương/hồi chiêu/logic. Chỉnh: nâng maxOv/maxHit nếu máy mạnh.
