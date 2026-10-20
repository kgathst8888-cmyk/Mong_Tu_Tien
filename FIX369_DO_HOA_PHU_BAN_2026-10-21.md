# Fix369 — Nâng cấp đồ hoạ + hình vẽ 3 phụ bản (Thiên Lôi · Kính Hồ · Cốt Hải)
- File mới: `world/126-do-hoa-phu-ban.js` (window.PBG). Nạp sau world/125 trong index.html (?v=369) và có trong MODULE_MANIFEST.json.
- Sửa nhỏ `world/114-thien-loi-co-dia.js`: thêm móc `PRO` (`TLC.setPro`) ở 7 chỗ (bgd, hình boss, hào quang quái, dọn bộ đệm khi rời map). Không có PRO thì vẽ hình cũ y nguyên. 115/116/114a/117 KHÔNG sửa — module 126 thay hàm vẽ trong `PBC.maps[].cfg`.
- Không đổi chỉ số, cơ chế, độ khó, thưởng, hazard logic.

## Có gì mới
- ⚡ Thiên Lôi: trời bão nhiều tầng, núi xa, 3 đảo đá lơ lửng + tinh thể, 4 tháp thu lôi, nền đá bazan nứt phát sáng (nứt nhấp nháy), mưa, tia lửa bay lên, chớp xa có nhánh. Vòng cảnh báo: vòng rune xoay + sao 6 cánh; sét phân nhánh nhiều lớp, cột sáng, vòng xung kích, tia lửa. Quái: bóng điện dưới chân, quả cầu điện xoay, tia hồ quang. Boss Lôi Đế: thêm cánh mây bão, gân sáng trên giáp, mắt sáng, vòng quỹ đạo.
- 🪞 Kính Hồ: trời sao + cực quang, trăng có miệng hố, núi, cụm pha lê + bóng phản chiếu trên mặt hồ, cột sáng trăng, hoa sen phát sáng, đom đóm, mảnh gương lơ lửng lấp lánh, sương. Vòng sóng hồ thật: vòng rune + 6 mảnh pha lê; bóng giả: nét đứt mờ; khi nổ: cột sáng, vòng sóng kép, nứt tia, mảnh vỡ bay. Boss Kính Hồ Tiên Tử: cánh pha lê, vòng mảnh gương quay, lấp lánh trên váy/vương miện.
- 💀 Cốt Hải: hoàng hôn + mặt trời có vệt, 3 lớp cồn cát, lồng ngực rồng khổng lồ, sọ rồng, cây khô, tháp đá cổ có chữ phát sáng, sọ/xương rải đất, lửa ma trên xương, nắng nóng rung, kền kền bay, bụi gió. Gai cát: nứt đất + vòng rune sọ, gai xương 2 mặt sáng/tối, bụi cát bắn. Boss Cốt Long Vương: lửa mắt, gân sườn phát sáng, tàn lửa bay, vòng cát xoáy; lúc chui cát có hố, vết nứt và 2 sừng nhô lên.
- Hiệu năng: nền tĩnh vẽ 1 lần vào canvas đệm (Thiên Lôi dùng bộ đệm riêng trong 126, Kính Hồ/Cốt Hải dùng bộ đệm PBC); phần động giảm theo `QL` (Tiết kiệm bỏ mưa/vết nứt nhấp nháy/kền kền/mảnh gương/tia lửa/hào quang quái). Không dùng shadowBlur. Hình boss vẽ lại theo chu kỳ cũ (Thiên Lôi: 5 khung, lite 10).
- Tắt nhanh trong game: `PBG.off()` (về hình cũ) / `PBG.on()`. Tắt hẳn: bỏ <script> 126.
