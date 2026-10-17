# Fix185 — Hiệu ứng kỹ năng đại thần thông (Tiên Giới + Map đánh quái Tiên Giới)

File mới: `world/88-skill-fx-ultra.js` (nạp sau world/83). Chỉ vẽ, không đổi sát thương/hồi chiêu.
- Bọc 27 recipe `TG8SK.R.*` → áp dụng đồng thời cho Thành Tiên Giới (world/79) và Map Treo/map quái Tiên Giới (world/83).
- 3 lớp: Tụ linh (2 vòng trận ngược chiều, 8 cột sáng, linh khí hút vào) → Hành trình/báo trước (dải tia xoắn, vòng trận + cột báo dưới mục tiêu) → Bùng nổ (cột sáng xuyên trời, 3 sóng xung kích, tia thần quang, vết cháy, rung màn hình + loé sáng với chiêu lớn).
- Tiểu cảnh theo hệ: Hoả, Băng, Lôi, Mộc, Kim, Âm hồn (6 môn phái) · Tiên (cánh sen) / Ma (hư không + lửa huyết) · Pháp bảo (kiếm vũ, vòng xoáy, phong ba, trăng chém) · Linh căn (thiên thạch, độc vụ, mưa nước, địa chấn).
- Hiệu ứng trúng đòn lên quái: bọc `TGFX.hitFx` (sóng + tiểu cảnh theo hệ, chí mạng có sao 8 cánh + cột sáng).
Vá nhỏ: world/82 (1 dòng: vẽ trúng đòn qua `window.TGFX.hitFx`), index.html (+1 script), MODULE_MANIFEST.json.
Chỉnh: `TGFXU_CF.enable=false` tắt · `TGFXU_CF.shake=false` tắt rung/loé · `TGFXU_CF.q` mật độ hạt (máy yếu tự 0.6). Tắt hẳn: bỏ `<script>` 88 và hoàn tác dòng hitFx ở 82 (không bắt buộc, có fallback).
