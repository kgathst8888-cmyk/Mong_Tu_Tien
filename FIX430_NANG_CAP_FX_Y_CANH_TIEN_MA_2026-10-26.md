# Fix430 — Nâng cấp hiệu ứng Ý Cảnh Tiên/Ma: chi tiết hơn, nét hơn, bớt loè
Chỉ đổi phần VẼ trong `world/53-y-canh-ky-nang-toc.js`. Không đổi sát thương, MP, hồi chiêu, logic, dữ liệu.

## Giảm loè
- `blob()` (quầng sáng): nhân hệ số `GLOW=.55` khi ở pha 'lighter'. Chỉnh 1 chỗ: biến `GLOW`.
- Tiên: tia/vầng sáng thiên thần, vệt kiếm, cột sáng, vòng sóng, viền khe nứt, đuôi thiên thạch → mảnh hơn, alpha thấp hơn; vàng/cam gắt → vàng nhạt/hổ phách.
- Ma: viền oán linh, xoắn hố đen (9px→5px), tia ma khí (34→28px), tia hồng → alpha thấp, tím/hồng dịu; phủ tối màn hình nhẹ hơn.

## Thêm chi tiết
- Tiên: lông vũ có sống + gân lông; giáp ngực có đường ghép tấm; vai có viền + đinh tán; kiếm có vạch phù văn + cạnh sáng; vòng sóng có 24 vạch chia.
- Rồng: vạch vảy bụng, gờ lông mày, má vảy, đường sáng sống mũi.
- Khe nứt: các vòng xoáy mảnh trong khe. Thiên thạch: mặt cắt đá + mảng sáng.
- Quỷ thủ: nếp lòng bàn tay, viền sáng khớp ngón. Oán linh: nếp áo choàng, gò má/vết nứt sọ.
- Hố đen: 4 vòng bồi tụ mảnh. Tia ma khí: gai xúc tu dọc thân.

## Đã kiểm
node --check OK · chạy thử 6 chiêu (Tiên 1-3, Ma 1-3) bằng canvas giả qua nhiều khung: 0 lỗi.
## Chưa kiểm
Chưa xem trên màn hình thật/điện thoại (môi trường không có trình duyệt). Overlay 118/119/120/53b/53c/53d/53e giữ nguyên, vẫn đi qua bộ lọc 137.
Hoàn tác: thay lại `world/53` bản v86 gốc.

## Đợt 2 — thần thông Tiên/Ma: nét mảnh, sắc, nhiều chi tiết hơn
Chỉ đổi phần vẽ ở `world/53b-ma-sat-phe-hon-fx.js`, `world/53d-ma-dao-than-thong-fx.js`, `world/118-y-canh-fx-pro.js`.
- Ma (Ma Sát Phệ Hồn / Dục Nương / Vạn Niệm): vành pháp trận 6–7px → 2.8–3px, thêm vòng viền mảnh + vạch chia (`MDFX.H.ticks`: 72–120 vạch, vạch dài mỗi 5–6 vạch); đỏ/tím bão hoà → đỏ huyết + tím xám; nền tối phủ màn hình nhẹ hơn (.24→.16, .5→.38, .55→.42); nứt đất, sét, sóng xung kích, vệt quỷ, dấu chém mảnh hơn; ngũ giác Dục Nương có nút tròn viền; bùa có dấu ấn vàng + tua rua.
- Tiên (Kim Quang Phổ Chiếu): texture vòng trận bớt nhoè (shadowBlur 7–12 → 2.5–4), thêm 144 vạch chia mịn + vòng chấm; vàng chói → vàng ngọc.
Đã kiểm: node --check OK; chạy thử 6 chiêu + overlay bằng canvas giả nhiều khung: 0 lỗi. Chưa xem trên màn hình thật.
Chưa đổi: world/119, 120, 53c, 53e (bản Tiên Giới, vốn đã nét mảnh).

## Đợt 3 — kiểm lỗi + tối ưu hiệu năng
- Kiểm: node --check 4 file OK; tools/check.py không phát sinh cảnh báo mới so với v86; chạy thử 6 chiêu + overlay (chế độ thường và chế độ máy yếu FX>50): 0 lỗi.
- Đo số lệnh fill/stroke/drawImage/gradient mỗi khung (tb): Tiên 1-3 = 88/155/219 (gốc 76/155/209), Ma 1-3 = 722/526/462 (gốc 657/522/482). Ma 3 thấp hơn gốc, Ma 2 ≈ gốc, Ma 1 còn +10% do chi tiết mới.
- Tối ưu: phù văn vòng trận (28 chữ/vòng) gom thành 1 lệnh stroke (`MDFX.H.glyphP`, hình y hệt); vạch chia, vạch vảy rồng, gai tia ma khí, nếp áo oán linh, vòng xoáy khe nứt, mặt cắt thiên thạch, viền khớp ngón gom path + chỉ vẽ khi máy không yếu (`light()`/`SLOW`); vạch chia giảm một nửa khi chất lượng thấp; lông vũ giảm sống lông (sprite build rẻ hơn).
- Lưu ý: số liệu là đếm lệnh vẽ bằng canvas giả, KHÔNG phải FPS thật; chưa đo trên điện thoại.

## Đợt 4 — tối ưu game (Fix431): boss
Phát hiện qua rà tĩnh toàn dự án (không có trình duyệt để profile):
- `world/07-trial-tower.js`, `world/27-immortal-boss.js`, `world/107-boss-tong-mon.js` đặt `ctx.filter='hue-rotate(..)'` rồi vẽ cả con boss MỖI KHUNG. `ctx.filter` buộc canvas chạy đường vẽ phần mềm, rất nặng trên điện thoại. Nay chỉ bật khi chất lượng "Cao" (`QL===0`, giống cách world/42 và world/109 đã làm); mức Cân bằng/Tiết kiệm (mặc định điện thoại) bỏ đổi tông màu boss, vẫn giữ quầng sáng + tên màu riêng từng boss.
- Quầng sáng boss trước đây tạo `createRadialGradient` + 3 chuỗi màu mỗi khung → vẽ sẵn 1 lần/màu (`window.BGLOW(col)`), mỗi khung chỉ `drawImage`.
Hoàn tác: thay lại 3 file từ v86.
Chưa làm (cần đo trên máy thật): cache nền trời/đất, bộ lọc canvas world/137 (bọc 7 hàm vẽ toàn cục), nạp trễ các file assets lớn (~16MB JS).
