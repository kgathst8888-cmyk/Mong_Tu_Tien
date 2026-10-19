# Fix343 — Cánh Cấp 4: +% sát thương kỹ năng/thần thông + Admin tặng Cánh Cấp 4
- ui/102-canh4-sat-thuong.js (MỚI): móc dm(), khi SKF=1 (kỹ năng/thần thông) và wl()>=4 → sát thương ×(1+C4DMG/100). C4DMG=20 (đổi 1 số ở đầu file). Thêm dòng mô tả vào tab Cánh (wrap wgUI).
- ui/69-thong-bao-thu.js: thêm quà `wg4` (t:'wg', tối đa 1/thư) → đặt PS[cur].wg=4. Form 🎁 Gửi quà của ui/70 tự hiện mục mới.
- index.html: nạp ui/102, ui/69 đổi ?v=343.
