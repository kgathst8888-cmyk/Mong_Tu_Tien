# Fix225 — Bỏ cánh tay cầm vũ khí, vũ khí bay chậm quanh nhân vật

Áp dụng cho 6 môn phái tiên nhân (vdm · hbd · ptc · tkt · umt · ngc).

- **Bỏ** cánh tay đen (vai → khuỷu → cổ tay), bàn tay và toàn bộ khung xương/IK/hoạt ảnh vung–đâm của Fix221–224.
- **Thay bằng** vũ khí lơ lửng bay CHẬM vòng quanh người (≈ 8 giây/vòng), quỹ đạo elip nghiêng:
  - nửa sau quỹ đạo vẽ TRƯỚC thân (bị thân che), nửa trước vẽ SAU thân → có chiều sâu;
  - mặt vũ khí hướng ra ngoài: phía trước thấy mặt sáng, phía sau thấy mặt tối, hai bên nghiêng mỏng; có độ dày nhiều lát;
  - nhấp nhô lơ lửng, nghiêng nhẹ theo quỹ đạo, vệt sáng mờ phía sau + hạt linh khí theo môn phái;
  - khi đánh: bay xoay nhanh, quỹ đạo nở rộng, vệt sáng dài + vòng khí quét quanh thân, rồi chậm lại dần.

File sửa:
- `world/95-mon-phai-vu-khi-3d.js` — viết lại.
- `world/73-mon-phai-ngoai-hinh.js` — gọi `VPW.draw(...,'back')` TRƯỚC khi vẽ thân, `'front'` sau thân.
- `world/74-mon-phai-8-huong.js` — như trên, và nằm trong khối bay (theo độ cao bay của Tiên Nhân).

Chỉnh nhanh (console): `VPW3_CF.speed` (tốc độ, mặc định .5) · `.radius` · `.height` · `.count` (số bản vũ khí rải đều quanh người, thử 3) · `.scale` · `.trail` (0 = tắt vệt) · `.fx` (0 = tắt hạt) · `.enable=false` (tắt hẳn). Thử chiêu đánh: `VPW3.play(900)`.

## Fix225b
Kích thước vũ khí về cỡ gốc (`VPW3_CF.scale=1`), quỹ đạo rộng hơn (bán kính .72×HH) để không dính sát người, bay nhanh hơn (`speed=.8`), góc bay tính theo đồng hồ tuyệt đối nên không bao giờ đứng yên.

## Fix226 — Vũ khí đứng yên sau lưng, 3D sắc nét
Thay Fix225: vũ khí KHÔNG xoay tròn nữa mà lơ lửng ĐỨNG YÊN sau lưng nhân vật (đeo chéo lệch vai), kích thước gốc (`scale=1`).
- Quay theo hướng nhìn: nhìn về người xem → vũ khí ló sau vai (mặt trong tối); quay lưng → vũ khí hiện rõ phía trước thân (mặt sáng); nhìn ngang → nghiêng, lộ độ dày.
- 12 lát ảnh theo trục sâu (xa tối, gần sáng), viền sáng màu môn phái, lắc nhẹ trục + nhấp nhô lơ lửng, hạt linh khí nhỏ, ánh sáng mờ. Đánh: bừng sáng, nhích tới trước.
- Chỉnh: `VPW3_CF.dist` (ra sau lưng) · `.side` (lệch vai) · `.height` · `.lean` · `.scale` · `.slices` · `.depth` · `.minw` · `.sway` · `.glow` · `.fx`.
- File sửa: `world/95-mon-phai-vu-khi-3d.js` (viết lại; world/73 và world/74 giữ như Fix225).

## Fix227 — Cầm vũ khí ở tay (kiếm khách · thương thủ · pháp sư)
Thay Fix226: nhân vật cầm vũ khí trong tay. KHÔNG vẽ cánh tay đen; chỉ có bàn tay (găng + dải cổ tay màu môn phái) nắm đúng điểm cầm trên cán.
- Kiếm (tkt): cầm chếch hông · đánh: giơ cao → chém chéo, lưỡi lật mặt, vệt chém.
- Thương (hbd, ptc): dựng sát người · đánh: rụt ra sau → đâm vọt, sóng xung kích.
- Trượng (ngc): dựng thẳng như pháp sư · đánh: giơ cao niệm chú, trận pháp dưới chân → hạ trượng bùng sóng.
- Hái (vdm, umt): cầm chếch ngoài · đánh: kéo ra sau → vung vòng cung ngang người.
- Luôn cầm tay gần người xem, đổi tay mượt khi quay; xoay 3D theo hướng nhìn, nhiều lát có độ dày; kích thước gốc (`scale=1`).
- Chỉnh: `VPW3.HOLD[loại]` (tư thế cầm), `VPW3.KEY[loại]` (khung đánh), `VPW3_CF.hand=false` (ẩn bàn tay), `.scale`, `.fx`.
- File sửa: `world/95-mon-phai-vu-khi-3d.js` (world/73, 74 giữ nguyên).
