# Fix360/361 — 12 quái Tiên Giới (tự vẽ bằng code, theo bố cục & màu tranh tham khảo)
- KHÔNG cắt/dán ảnh nào. Bộ vẽ: `assets/tien-gioi-quai-art.js` (canvas 2D: tô khối, ánh sáng, bóng, vảy/lông/lông vũ, lửa, hào quang).
- Hình xuất ra: `assets/tien-gioi-quai/<id>.webp` (nền trong suốt, 1280×1280, lưới 4×4 khung 320px: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công). Dựng lại: `python3 tools/gen_tg_quai.py [id]` (cần playwright + Pillow).
- Tích hợp: `world/125-tien-gioi-quai-12.js`; móc 1 dòng ở world/80 (e.tg12), 81 (drawMon), 84 (draw). Chỉ đổi hình/hoạt ảnh, chỉ số-AI-va chạm giữ nguyên. Tắt: `TGM_CF.enable=false`. Kiểm tra: `TGM.check()`. Hình lỗi → tự vẽ dự phòng.
- Hạn chế: kiểu minh hoạ vector, chưa đạt độ chi tiết tranh vẽ tay; mỗi quái 1 góc nhìn (ngang, lật trái/phải).
