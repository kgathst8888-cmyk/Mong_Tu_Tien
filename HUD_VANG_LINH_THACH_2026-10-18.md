# HUD vàng rút gọn + Linh Thạch cùng hàng (Fix243, 2026-10-18)
- Vàng từ 1.000.000 trở lên hiện rút gọn: 1,23 Triệu · 4,56 Tỷ (cắt bớt, không làm tròn lên). Dưới 1 triệu giữ nguyên số đầy đủ. Áp dụng ở HUD trên màn hình (canvas) và ô 💰 ở hàng tài nguyên trong túi (rê chuột/giữ để xem số đầy đủ).
- Linh Thạch hiện cùng hàng với vàng: 🔒 khoá (của nhân vật đang chơi) + 💎 không khoá (dùng chung tài khoản). Chỉ hiện khi đã đăng nhập ☁.
- Hàm mới ở core/01n-tab-menu.js: fmtG(n) (định dạng vàng), ltHud() ([khoá, không khoá] hoặc null). fmtN giữ nguyên nên giá/chi phí ở nơi khác không đổi.
- File đổi: core/01n-tab-menu.js · core/01j-hud-draw.js.

## Fix244 — icon Linh Thạch thay emoji
- Linh Thạch khoá = ngọc xám xanh + ổ khoá vàng nhỏ; không khoá = ngọc xanh. Chỉ icon + số, không chữ/emoji.
- HUD canvas: hàm ltGem(x,y,size,khoá) trong core/01j-hud-draw.js; hàng tài nguyên trong túi: ltSvg(khoá) trong core/01n-tab-menu.js.
