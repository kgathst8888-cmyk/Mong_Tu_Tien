# Fix343 — Cánh Cấp 4: +% sát thương kỹ năng/thần thông + Admin tặng Cánh Cấp 4
- ui/102-canh4-sat-thuong.js (MỚI): móc dm(), khi SKF=1 (kỹ năng/thần thông) và wl()>=4 → sát thương ×(1+C4DMG/100). C4DMG=20 (đổi 1 số ở đầu file). Thêm dòng mô tả vào tab Cánh (wrap wgUI).
- ui/69-thong-bao-thu.js: thêm quà `wg4` (t:'wg', tối đa 1/thư) → đặt PS[cur].wg=4. Form 🎁 Gửi quà của ui/70 tự hiện mục mới.
- index.html: nạp ui/102, ui/69 đổi ?v=343.
- Giảm kích thước Cánh Cấp 4 còn 90% (core/01u-wings.js: WGH[3] 125→112.5; áp dụng cả map thường và Tiên Giới).
- Fix344: cánh Tiên Giới (world/78) vỗ mượt hơn: chuyển trạng thái chậm hơn, nhấp nhô/độ mở khi đi được làm mượt (WS.g8by/g8th), lát cắt 12→16 (cấp 4) / 8→12 (cấp 1-3), glow 6/8.
- Fix345: cánh Tiên Giới tự thích ứng chất lượng theo chi phí vẽ (QL 0/1/2: lát cắt 8/12/16 cấp 4, 6/8/12 cấp 1-3; glow nhẹ hơn). Nặng >1.5ms → giảm; nhẹ <1.1ms liên tục 180 khung → tăng. Ép mức: WG8_CF.q=0|1|2.
