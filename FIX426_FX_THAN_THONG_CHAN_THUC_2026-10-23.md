# Fix426 — Hiệu ứng thần thông: bớt loè, tăng độ nét/chi tiết (toàn game)
Chỉ đổi phần VẼ. Không đổi sát thương, hồi chiêu, MP, logic, dữ liệu.

## 1) core/01h-skill-fx.js (hệ ZS — dùng cho kỹ năng mọi lớp + thú cưng)
Viết lại bộ vẽ: bỏ `shadowBlur` lớn + 'lighter' chói → dùng 'screen' (dịu, không cháy trắng) + nét mảnh sắc.
- ring: vành sóng nền có viền sáng mảnh, vòng đứt nét, bụi đất bật theo vành.
- cres (kiếm khí): thân vầng trăng + cạnh ngoài sắc, cạnh trong, vệt gió dọc lưỡi.
- beam: thân thon + lõi trắng mảnh + 2 sợi năng lượng dao động + đầu tia.
- rune (trận pháp): 3 vòng mảnh, 36 vạch chia, ngũ giác xoay, 6 điểm sáng.
- pillar: 3 lớp chồng + vân dọc bay lên · dome: viền Fresnel + lưới kinh/vĩ tuyến · orb: mặt thoi có gân.
- bolt (sét): quầng xanh mỏng + lõi trắng, nhấp nháy, vệt chạm đất · crack: vết nứt có viền đen + dung nham 2 lớp.
- spike (gai băng): khối tinh thể 2 mặt sáng/tối + cạnh phản chiếu · claw/sl/whirl: nét mảnh có lõi.
- mv: kiếm có thân kim loại, thiên thạch có lõi đá + đuôi lửa, mũi tên có lông vũ/đầu nhọn.
- Hạt: tia lửa vuốt nhọn đuôi; hạt tối/đất thành bụi (pha trộn thường, không phát sáng); hạt lửa có tâm trắng nguội dần.
- Loé sáng toàn màn hình → quầng tròn quanh nhân vật (hết trắng xoá nền). Rung màn hình ×0.6.

## 2) world/137-skill-fx-realism.js (MỚI) — bộ lọc dùng chung cho ~60 file hiệu ứng còn lại
Chặn ở tầng canvas 2D (fill/stroke/fillRect/strokeRect/drawImage/fillText/strokeText):
- Pha 'lighter': alpha ×0.74, shadowBlur ×0.35 (tối đa 6) → bớt chói.
- Nét 'lighter' dày ≥5px: thu mảnh ×0.66 + thêm LÕI SÁNG MẢNH → tia/sét/kiếm khí có lõi rõ.
- Ô cộng sáng phủ ≥70% màn hình: alpha ×0.4 (chống loé trắng).
- shadowBlur lớn ở pha trộn thường: rút gọn.
Chỉnh: `SKFXR_CF` hoặc `SKFXR.preset('off'|'soft'|'real'|'vivid')` (mặc định 'real'). `enable:false` = như cũ.

## Sửa kèm
index.html (+1 thẻ script, sau world/136), MODULE_MANIFEST.json (+1 dòng).
Hoàn tác: bỏ thẻ script 137 và thay lại core/01h-skill-fx.js bản cũ (Fix425).

## Đã kiểm
node --check OK · chạy game headless Chromium: không lỗi JS · so ảnh trước/sau cho Chém Mạnh, Sét Đánh, Bão Tuyết, Thiên Hỏa Giáng, Xạ Kích, Vạn Kiếm Quy Tông, Xung Phong.
## Chưa kiểm / chưa làm
- Chưa chạy từng thần thông của world/* (Tiên Giới, Ý Cảnh, Ma Đạo, môn phái, thú thần…) trên màn hình: các file này chỉ được lọc tông màu, chưa thiết kế lại chi tiết từng chiêu.
- Chưa đo FPS trên máy thật/điện thoại.
