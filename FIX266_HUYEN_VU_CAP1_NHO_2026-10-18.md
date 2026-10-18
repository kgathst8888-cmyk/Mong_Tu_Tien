# Fix266 — thu nhỏ Huyền Vũ cấp 1 (2026-10-18)
- core/01l-loot-weapons-data.js: `HVH[0]` 30 → 20 (chiều cao Huyền Vũ cấp 1 giảm ~1/3: 37,5 → 25 đơn vị khi vẽ; rộng theo tỉ lệ ảnh 165×132 nên cũng nhỏ theo ~31 đơn vị).
- Vầng sáng, hạt, tia đạn, vòng bóng đều tính theo chiều cao nên nhỏ theo cùng tỉ lệ. Cấp 2–4 giữ nguyên.
- Muốn to/nhỏ hơn: sửa số đầu tiên của `HVH`.
