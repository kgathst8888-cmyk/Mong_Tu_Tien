# Pháp Bảo Bổn Mệnh (world/48-phap-bao-bon-menh.js)
- Mở khoá khi thành Đạo Thể (HDAO.on()). Thẻ "Pháp Bảo Bổn Mệnh" nằm trong ô nhân vật (ZC.ui) → bảng luyện (FABAO.open()).
- 4 pháp bảo bay sau lưng nhân vật (vẽ trong ZC.aura): Kiếm Linh (+sát thương) · Hồ Lô (+sức mạnh quái/thú triệu hồi) · Hồn Phiên (+hiệu ứng kỹ năng) · Cự Phủ (+sát thương bạo kích).
- Mỗi cái: 1 bị động + 1 chủ động (hồi chiêu 14s, 45 MP; nút 🔮 bên trái cột Thần Thông, phím F, tự dùng khi AUTO).
  Kiếm: xoè 8 phi kiếm (CF.sw.n) · Hồ lô: 4 quái vật 10s · Phiên: bóng ma tối đa 5 địch (DoT 6s) · Cự phủ: bổ xuống + choáng.
- Dữ liệu: PS[cur].fb={t,lv:[4],c:[4]} (lưu theo save sẵn có). Chọn 1 trong 4 pháp bảo, CHỈ 1 LẦN (3.000.000 vàng, Lv1); KHÔNG đổi/chọn lại được.
- Cấp pháp bảo = cấp kỹ năng, tối đa Lv10. Lên Lv n+1: thi triển kỹ năng chủ động đủ 1000×2^(n-1) lần (1000, 2000, 4000... mỗi loại đếm riêng, dư giữ lại) VÀ trả 50×n Linh Thạch (LT.spend, cần đăng nhập). Chỉnh: CF.castBase, CF.ltBase.
- Chỉ số cộng qua twB→SX (dmgp, cdmg, dotd, stnc, frzc). Không sửa engine. Chỉnh số liệu: khối CF / FB đầu module.
- Không vẽ/không chạy hiệu ứng trong Đấu Trường và Làng (chỉ số cộng vẫn tính).

- Hiệu ứng (tối ưu): sprite ánh sáng + gradient cache dùng lại, hạt sáng chung (tự giảm theo window.QL: QL>=2 bỏ vệt/vòng/hạt phụ), pháp bảo bay theo nhân vật có độ trễ mềm; phi kiếm xoè quạt rồi phóng kèm vệt sáng, trận triệu hồi cho hồ lô, vết nứt + vòng chấn động cho cự phủ, bóng ma có linh hồn quay quanh cho hồn phiên.

- Luật chọn: chỉ chọn 1 trong 4, chỉ 1 lần, có bước xác nhận trong bảng. Save cũ đã nâng cấp nhiều loại: tự giữ loại CẤP CAO NHẤT (hoà cấp: giữ loại đang đeo, rồi loại đứng trước), các loại còn lại về 0 (hàm fix() trong module; chạy khi đọc dữ liệu và khi mở bảng).

- Hình pháp bảo: assets/phap-bao-sprites.js (window.FABAO_IMG[0..3] = kiếm, hồ lô, phiên, phủ; webp nền trong suốt). Dùng ở: bay sau lưng nhân vật, bảng chọn, thẻ ô nhân vật, nút kỹ năng, phi kiếm và cự phủ khổng lồ. Thiếu file → tự dùng hình vẽ vector cũ.
- Chuyển động: lò xo-giảm chấn theo nhân vật (quán tính, nghiêng theo vận tốc, giới hạn ±0,4 rad), lơ lửng 2 nhịp sin, vệt mờ khi chạy nhanh (QL0); tung chiêu: kiếm/phủ xoay trọn vòng + phồng lên + loé sáng, hồ lô lắc, hồn phiên bay phấp phới mạnh hơn (cắt dải 14 lát sóng).

- Kích thước hiển thị (đơn vị thế giới, nhân vật cao ~120): kiếm 58, hồ lô 40, phiên 70, phủ 60 (SPR trong module); vị trí sau lưng: lệch 46, cao 100. Chỉnh SPR[i].h để to/nhỏ.

- Kiếm Linh chủ động: 8 phi kiếm xoè quạt quanh pháp bảo (góc xoè tự co theo số kiếm, tối đa ±49°) rồi lần lượt lao vào địch (cách nhau 4 khung). Sát thương mỗi kiếm giữ nguyên nên tổng tăng theo số kiếm.
