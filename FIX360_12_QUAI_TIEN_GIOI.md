# Fix360 — 12 quái Tiên Giới mới
Module mới: `assets/tien-gioi-quai-art.js` (bộ vẽ), `world/125-tien-gioi-quai-12.js` (tích hợp), `assets/tien-gioi-quai/*.png` (12 sprite-sheet nền trong suốt, 4×4 khung 256px: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công), `tools/gen_tg_quai.py` (xuất lại PNG).
Sửa 4 dòng: world/81 (drawMon), world/84 (draw), world/80 (e.tg12), index.html (2 thẻ script) + MODULE_MANIFEST.json. Bản gốc: `_audit/*.TRUOC_FIX360.bak`.
Chỉ đổi hình/hoạt ảnh; chỉ số, AI, va chạm giữ nguyên. Tắt: `TGM_CF.enable=false`. Kiểm tra PNG: `TGM.check()` trong console.
Giới hạn: hình vẽ bằng code (vector, kiểu minh hoạ), KHÔNG phải tranh vẽ tay như bảng tham khảo; chỉ có góc nhìn ngang (lật trái/phải), chưa có mặt trước/sau riêng.
