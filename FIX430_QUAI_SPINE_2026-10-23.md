# Fix430 — Quái Spine ở Tuyết Hàn Ma Phong & U Minh Ma Cốc

- Tuyết Hàn Ma Phong (mapSel=1): **Băng Cự Ma Binh** (troll băng, giáo + khiên) — `assets/quai-spine/troll_bang.webp`
- U Minh Ma Cốc (mapSel=3): **U Minh Thi Binh** (lính xương, mũ giáp + khiên đỏ) — `assets/quai-spine/thi_binh.webp`
- Module mới: `world/138-quai-spine-nhan-gioi.js` (đã thêm vào index.html + MODULE_MANIFEST.json). Không sửa file khác.
- Chỉ đổi hình + tên (quái thường, Tinh Anh, Sử Thi). Máu/thủ/sát thương/rơi đồ giữ nguyên. Không áp cho boss thế giới `pal`, phụ bản (Huyễn Cảnh/Cốt Hải dùng chung mapSel), làng, Linh Giới, dungeon.
- Sheet 4x4 ô 320px: 0-3 đứng · 4-9 di chuyển (tư thế gốc, module nhún/nghiêng) · 10-15 tấn công (lấy từ animation Spine).
- Spine đã bake sẵn ra webp (không cần runtime Spine trong game): `python3 tools/bake_spine_quai.py <thư mục json/atlas/png> <id> assets/quai-spine 320`
- Chỉnh: `QSP.maps={1:'troll_bang',3:'thi_binh'}`, `QSP.D.<id>.h` (cao), tắt: `QSP.enable=false`. Ảnh lỗi → tự vẽ quái cũ.
