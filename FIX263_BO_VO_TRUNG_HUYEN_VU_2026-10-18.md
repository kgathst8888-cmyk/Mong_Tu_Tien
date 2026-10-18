# Fix263 — bỏ vỏ trứng thừa ở Huyền Vũ cấp 1 (2026-10-18)

- assets/game-assets.js: ảnh `a048` (Huyền Vũ cấp 1) đã xoá vỏ trứng, 2 mảnh vỏ vỡ và bóng đổ của vỏ trứng; cắt bỏ phần trống bên trái (246×132 → 165×132, giữ nguyên chiều cao nên rùa không đổi tỉ lệ/chân vẫn chạm đất cùng mức).
- core/01l-loot-weapons-data.js: `HVZ[0]` 246×132 → 165×132 cho khớp ảnh mới.
- Cấp 2–4 (a049–a051) giữ nguyên.
