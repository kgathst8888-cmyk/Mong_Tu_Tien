# Fix362 — Nâng cấp Hoàng Kim (cấp 2→10) + Độ khó/Lời Nguyền phụ bản
- File mới (không sửa core/engine/ui101/115/116): `ui/103-nang-cap-hoang-kim.js` (HKU), `world/117-do-kho-phu-ban.js` (DKP). Nạp trong index.html (?v=362) và MODULE_MANIFEST.json: 103 sau ui/101, 117 sau world/116.

## ⬆ Nâng cấp Hoàng Kim (HKU)
- Nút "⬆ Nâng cấp" trong cửa sổ thông tin món (chạm ô Hoàng Kim ở tab Túi) và trong Nhà Chế Tạo Trang Sức Hoàng Kim. Nâng từng món tới cấp 10.
- Linh Thạch: cấp 2 = 2.000, mỗi cấp sau +1.000 (cấp 10 = 10.000). Tỉ lệ: cấp 2–4 = 50%, từ cấp 5 giảm 4%/cấp (5:46, 6:42, 7:38, 8:34, 9:30, 10:26).
- Nguyên liệu (rơi từ boss phụ bản): cấp 2–5 cần 2×cấp 🪞Tinh Hoa Kính Hồ; cấp 6–10 cần 10 🪞 + (2×cấp−8) 💀Cốt Long Tủy.
- Thất bại: mất nguyên liệu + Linh Thạch, món giữ nguyên cấp. Cần đăng nhập ☁ (LT.spend).
- Chỉ số mỗi món cấp L: +2L% Công/Thủ/Máu, +1000L Năng lượng (cấp 1 như cũ). Bộ cùng cấp vẫn do ui/101 tính.
- Lưu: PS[cur].hkg.mat = {kh, ct}. Chỉnh toàn bộ ở `window.HKU_CFG` (lt0, ltStep, rate0, drop, dropFrom, stat(L)) và hàm need(L) trong file.

## 🔥 Độ khó + Lời Nguyền (DKP) — áp cho Huyễn Cảnh Kính Hồ và Cốt Hải Sa Mạc (lõi PBC)
- Bảng chọn hiện khi bấm nhà phụ bản (trước khi rời làng). 3 độ khó: Thường / Ác Mộng (máu ×1.5, ST ×1.25, thưởng ×1.6) / Địa Ngục (máu ×2.2, ST ×1.5, thưởng ×2.5).
- 3 Lời Nguyền (tối đa 3, mỗi cái +20% thưởng): 🩸 Quái Cường Hoá (+40% máu quái) · 💢 Hung Bạo (+30% sát thương quái) · ☠ Hiểm Địa (hazard/phản đòn/bão cát +50%). Thưởng tối đa ×4.
- Thưởng (EXP · vàng · rơi đồ) nhân theo hệ số: bọc `drop(e)`, chạy thêm các lần drop gốc + cộng thêm EXP theo công thức engine. Chỉ tính khi đang ở phụ bản.
- Boss (b==3) rơi nguyên liệu: cơ bản 2 × hệ số độ khó (Thường 2, Ác Mộng 4, Địa Ngục 6, +20%/Lời Nguyền).
- Hazard vẫn không giết người chơi. Thiên Lôi (TLC) KHÔNG nằm trong bản này.
- Chỉnh: `window.DKP.cfg` (LV, CU, matBase, rwCap, matName). Tắt = bỏ <script> tương ứng (117 cần 114a/115/116).
