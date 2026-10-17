# Fix238 — 6 môn phái tiên nhân NHẤC TAY CẦM VŨ KHÍ khi tung chiêu (2026-10-18)

**Mục tiêu:** vũ khí không còn chỉ lơ lửng/xoay tại chỗ — khi tung chiêu nhân vật *giơ tay lên cầm vũ khí* rồi chém/đâm, đúng hướng nhìn của 8 khung ảnh.

## Cách hoạt động (giữ nguyên nét vẽ của ảnh gốc)
- Thân, tóc, đạo bào vẫn là ảnh vẽ MP8 (không dựng khối thô).
- `assets/mon-phai-tay.js` (MPA): với mỗi môn × nam/nữ × 8 hướng có sẵn **cẳng tay + bàn tay cắt từ chính ảnh vẽ** + mảng vá nền đã xoá tay (dựng bằng inpaint, 96 khung).
- `world/93-mon-phai-tay.js` (MPAR):
  1. Bình thường: không đổi gì, vũ khí 3D vẫn đứng sau lưng (world/95).
  2. Vừa tung chiêu: vũ khí sau lưng **ẩn đi, hiện trong bàn tay** (cùng ảnh MPW3); thân hoà sang bản xoá tay.
  3. 6 bước: cầm → **giơ tay** (khuỷu nhấc, cẳng tay lên) → đỉnh (vũ khí sáng) → **chém/đâm** (vệt sáng theo mũi) → theo đà → thu về sau lưng.
  4. Hướng cử động tính trong không gian 3 chiều (phải · lên · trước) rồi chiếu theo hướng nhìn: nhìn thẳng → vũ khí chúc về phía người xem (co ngắn); nhìn ngang → vung ngang; nhìn lưng → vung ra xa.
- Gọi từ `world/74` (Tiên Giới 8 hướng, kích hoạt theo `ST.cf` / `P.atk`) và `world/73` (bản đồ 2D, theo `P.atk`).

## Chỉnh / tắt (console)
`MPAR_CF.enable=false` (về như cũ) · `.dur` (56 khung/chiêu) · `.trail=false` · `.weapon=false` (không cầm trong tay) · `.always=true` (luôn cầm vũ khí trong tay, không chỉ lúc tung chiêu).

## File đổi
`world/93-mon-phai-tay.js` (mới) · `assets/mon-phai-tay.js` (mới, ~0.4MB) · `world/73`, `world/74` (thêm móc MPAR: id/gen/i cho khung ảnh, bản xoá tay, vẽ tay+vũ khí) · `index.html` (nạp sau world/95) · `MODULE_MANIFEST.json`.
Lỗi → tự quay về tranh cũ (mọi móc bọc try/catch).
