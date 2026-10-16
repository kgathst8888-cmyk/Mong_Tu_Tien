# Môn phái 8 hướng — 2.5D Tiên Giới (Fix136)
- File mới: `world/74-mon-phai-8-huong.js` (nạp sau world/73) + `assets/mon-phai-sprites2.js` (ảnh mặt sau 6 môn × nam/nữ + tư thế chạy ngang 6 môn, cắt từ ảnh mẫu).
- Sửa nhỏ `world/61-tien-gioi-thanh.js`: ghi hướng đi trên màn hình vào `window.TGV={sx,sy}` (stepTG), reset khi vào Tiên Giới.
- **Chỉ ở Thành Tiên Giới** (`TG.on()`): hướng xuống = mặt trước · hướng lên = **mặt sau** · trái/phải = tư thế **chạy** (lật theo hướng) · 4 hướng chéo = mặt trước/sau xoay 3/4 + nghiêng người. Đứng yên giữ hướng cuối.
- Bản đồ khác (Làng, Linh Giới, hang, phụ bản, Làng Online, Đấu Trường): KHÔNG đổi — vẫn dùng hero() của world/73 như cũ.
- Góc hướng bù độ dẹt isometric 2:1 (sy×2): đi dọc trục bản đồ = chéo 45°; phím W/A/S/D = lên/trái/xuống/phải trên màn hình.
- Mượt: làm mượt góc, độ trễ chống giật ở ranh giới sector, hoà mờ ~6 khung khi đổi tư thế.
- API: `VPG8.state` (ang, sec 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE), `VPG8_CF.enable=false` để tắt, `VPG8_CF.runH` chỉnh cao tư thế chạy.
- Giới hạn: ảnh mặt sau/chạy trong ảnh mẫu nhỏ (~140px cao) nên hơi mờ hơn mặt trước; tư thế chạy dùng chung nam/nữ (ảnh mẫu chỉ có 1 bản); đi bộ vẫn là hoạt hoạ trên tranh tĩnh (nhún/nghiêng/vạt áo bay), chưa có khung chân riêng. Ảnh "Bay / Lướt" chưa dùng.

## Fix137 — Vũ khí môn phái (world/75-mon-phai-vu-khi.js + assets/mon-phai-vukhi.js)
- Vũ khí cắt từ ô "Vũ khí" của ảnh mẫu, xoay thẳng đứng, vẽ lên nhân vật môn phái ở **mọi bản đồ** (world/73) và **Tiên Giới 8 hướng** (world/74).
- U Minh: song đao 2 tay · Huyền Băng: băng kiếm + huyền châu lơ lửng · Phần Thiên: hoả trượng + viêm luân lơ lửng (xoay) · Thiên Kiếm: phi kiếm + cổ kiếm lơ lửng · Vạn Độc: độc trượng + độc phiến (tay kia) · Ngự Cổ: cổ ấn trượng + linh trùng lơ lửng.
- Mặt trước: tay thuận bên trái người xem; mặt sau: đổi bên; chạy ngang: vũ khí hất ra sau. Vũ khí nhún/nghiêng/lắc theo thân; khi đánh (P.atk) vung từ sau ra trước (bản đồ thường).
- Chỉnh: `SPEC` (len, grip), `ANCH` (toạ độ bàn tay) trong world/75; `VPW_CF.enable=false` để tắt.
- Giới hạn: vị trí tay là ước lượng chung cho mọi hình nên có thể lệch vài pixel so với bàn tay thật; vũ khí là hình tĩnh (không có khung nắm tay riêng).

## Fix138 — Vũ khí quay đủ 8 hướng
- `ANCH` trong world/75 có 6 tư thế: front (S) · frontd (SE/SW) · side (E/W đứng) · run (E/W chạy) · back (N) · backd (NE/NW); hướng đối xứng lật theo thân.
- Mỗi tư thế có vị trí tay, góc cầm và lớp vẽ riêng: tay gần người xem vẽ TRƯỚC thân, tay xa vẽ SAU thân (bị che bớt) → có chiều sâu khi nhìn nghiêng/quay lưng.
- Tay thuận (main) luôn là tay gần người xem khi nhìn nghiêng. Pháp bảo lơ lửng đổi bên theo hướng (bay sau lưng khi đi).
