# Cơ chế opt trang bị (2026-10-07)

Sửa trong `core/01-engine.js` (và bản build `Mong_Tu_Tien_CLAUDE.html`):

- Thuộc tính cơ bản (Công/Thủ/HP) vẫn tăng theo phẩm chất (`RM[r]`) — không đổi.
- Số opt ngẫu nhiên KHÔNG còn phụ thuộc phẩm: mọi trang bị có 1-6 opt (ngẫu nhiên đều); phẩm **Thánh** (r=6, kể cả bộ Thánh Quang) luôn 7 opt.
- Sức mạnh opt vẫn tăng theo phẩm (`RMX[r]`), nên đồ phẩm cao có opt mạnh hơn.
- Mỗi opt roll 11 bậc z=0..10 (70%..130% dải giá trị của chính nó), lưu ở `item.xq` (`{ten_opt:z}`).
- **Màu opt theo phẩm của chính opt**: bậc roll chia 7 mức ↔ 7 màu phẩm cấp `RC[0..6]` (xám, lục, lam, tím, cam, hồng, vàng). Không phụ thuộc phẩm của món đồ.
- Bậc 10 = opt MAX → màu vàng + ★ xanh ở đầu dòng. Mỗi opt một dòng.
- Đồ cũ (không có `xq`) vẫn dùng bình thường: số opt giữ nguyên, bậc/màu/★ được suy ra từ giá trị so với dải của món.
- Hàm mới: `rollXM(r,l,mp)` (trả `{x,q}`), `xQ`, `xTier`, `xStar`, `xHtml`. `rollX` giữ lại để tương thích.
