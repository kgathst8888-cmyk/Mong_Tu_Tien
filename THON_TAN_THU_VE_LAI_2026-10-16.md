# Thôn Tân Thủ — vẽ lại mộc mạc, chân thực (2026-10-16)
File đổi: `world/56-thon-tan-thu.js` (viết lại hoàn toàn) · `world/03-village.js` (thêm 1 dòng đầu `fgDraw()`: bỏ cột đèn lồng + cánh hoa cũ khi bản mới đang bật).
Bản cũ lưu ở `_audit/56-thon-tan-thu.PHONG_CU.js.bak` (đổi tên về .js để quay lại). Giữ nguyên API: `xbg(gy,-1)`, `bld(i)`, `window.TTT`, `window.TWPG` (tháp Thí Luyện) → các module khác không phải sửa.
- Phong cách: làng núi buổi sớm. Trời dịu, 3 lớp núi phối cảnh khí quyển (sáng bên mặt trời), rừng tùng, nhà xa có khói bếp, cây vẽ từng mảng lá (tùng, lá rộng, trúc, một cây đào), giếng, xe kéo, hàng rào, đá.
- 5 toà nhà: vách trát vôi + khung gỗ + mái ngói xám, nền đá. Thợ Rèn (tường đá, lò, đe, giá binh khí, ống khói) · Tạp Hóa (quầy, mái vải, hũ chum) · Hồi Phục (tủ thuốc, nồi sắc, cửa sổ giấy) · Nhiệm Vụ (cửa gỗ, bảng cáo thị, cờ lệnh) · Bản Đồ (cổng trăng + cổng truyền tống).
- Tháp Thí Luyện 9 tầng: gỗ + vôi + ngói xám; tầng đang chinh phục có quầng sáng xanh (nếu có `twS`).
- Đã bỏ: đảo bay, hạc, thác, tia nắng quạt, dây đèn lồng, cổng đỏ-vàng + câu đối, đèn đá, cánh hoa, đom đóm, chữ vàng, đấu củng nhiều màu.
- Chuyển động (chỉ cái có thật): mây trôi, vài con chim, khói lò rèn/khói bếp xa, lửa + tia lửa lò rèn, hơi nước nồi thuốc, cờ lệnh, xoáy cổng truyền tống.
- Hiệu năng: nền và từng toà nhà vẽ 1 lần vào canvas đệm rồi `drawImage`. Chỉnh nhanh: bảng màu `PAL`, `TH` (màu tường/mái), vị trí cây ở cuối `paintBG`. Tắt/bật: `TTT.on=false`.

## Cập nhật: dời tháp, núi chi tiết, động vật bay (Fix127)
- Tháp Thí Luyện dời ra khoảng trống giữa Tạp Hóa và Hồi Phục, đứng trên mặt đất, không chồng lên nhà nào (vị trí theo `(bxx(1)+bxx(2))/2` trong `paintBG`; `TWPG` tự cập nhật nên nhãn + chạm vào tháp vẫn đúng). Giếng + trúc chuyển sang khoảng giữa Hồi Phục và Nhiệm Vụ.
- Núi sau làng: 4 lớp (xa nhất có đỉnh phủ sáng) · sống núi/vách đá đổ bóng theo hướng mặt trời · nét đá + rừng tùng thưa ở lớp giữa. Chỉnh ở 4 lệnh `ridge(...)` trong `paintBG` (base/amp = độ cao, spur/str = độ chi tiết, sa = độ đậm sọc bóng).
- Động vật bay sau làng: đàn 5 con hạc bay chữ V qua làng, đàn 3 con hạc nhỏ xa bay ngược chiều, 1 con diều hâu lượn vòng trên núi (hàm `crane`, `hawk`, vẽ trong `drawBG`).

## Cập nhật: tháp lùi ra sau (Fix128)
- Tháp Thí Luyện không còn đứng ngang hàng nhà: lùi lên sườn đồi phía sau (`gy-60*u`), cỡ `u*.95`, phủ sương nhẹ + bụi cây ở chân; thân tháp nhô cao qua mái nhà nên có cảm giác to lớn, ở xa. Vẫn nằm ngang trong khoảng giữa Tạp Hóa và Hồi Phục. Chỉnh ở dòng `M.tw=tower9(...)` trong `paintBG` (số thứ 2 = độ lùi, số thứ 3 = cỡ).

## Cập nhật: cờ Việt Nam + Cổng Ma Thần vẽ lại (Fix129)
- Cột cờ ở toà Nhiệm Vụ nay treo **cờ đỏ sao vàng** (tỉ lệ 3:2, sao 5 cánh) tung bay theo gió, có nếp vải sáng/tối (hàm `vnFlag`; chỉnh cỡ/vị trí ở `drawBld` nhánh `i==3`, cột ở `bHall`). Cờ lệnh 令 cũ đã bỏ.
- Cổng Ma Thần (phong ấn trên không) vẽ lại cho hợp làng: vòng đá cổ (khối đá chia múi, rêu, nứt, ký tự khắc), thừng rơm quấn nửa trên, bùa giấy vàng treo đung đưa, xoáy khói trong lòng cổng. **Chỉ đổi hình**: logic, toạ độ, vùng chạm, chữ ở `world/02-demon-realm.js` giữ nguyên (module 56 ghi đè hàm `gateDraw` của 02 khi `TTT.on`, lỗi thì tự quay về hình cũ).
  - Chưa đủ điều kiện: đá xám tím, lòng cổng tối, thừng + bùa vàng nguyên.
  - Sẵn sàng khiêu chiến: ký tự đỏ cam sáng, lòng cổng đỏ thẫm, bùa cháy xém, đốm lửa bay lên, thừng đứt.
  - Đã hạ Ma Thần (Cổng Linh Giới): đá ngọc lam, lòng cổng xanh ngọc sáng, hết bùa/thừng.
