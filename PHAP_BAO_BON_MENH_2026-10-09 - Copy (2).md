# Pháp Bảo Bổn Mệnh (world/48-phap-bao-bon-menh.js)
- Mở khoá khi thành Đạo Thể (HDAO.on()). Thẻ "Pháp Bảo Bổn Mệnh" nằm trong ô nhân vật (ZC.ui) → bảng luyện (FABAO.open()).
- 4 pháp bảo bay sau lưng nhân vật (vẽ trong ZC.aura): Kiếm Linh (+sát thương) · Hồ Lô (+sức mạnh quái/thú triệu hồi) · Hồn Phiên (+hiệu ứng kỹ năng) · Cự Phủ (+sát thương bạo kích).
- Mỗi cái: 1 bị động + 1 chủ động (hồi chiêu 14s, 45 MP; nút 🔮 bên trái cột Thần Thông, phím F, tự dùng khi AUTO).
  Kiếm: 5 phi kiếm · Hồ lô: 4 quái vật 10s · Phiên: bóng ma tối đa 5 địch (DoT 6s) · Cự phủ: bổ xuống + choáng.
- Dữ liệu: PS[cur].fb={t,lv:[4],c:[4]} (lưu theo save sẵn có). Luyện hoá 3.000.000 vàng (Lv1); đổi pháp bảo đã luyện: miễn phí.
- Cấp pháp bảo = cấp kỹ năng, tối đa Lv10. Lên Lv n+1: thi triển kỹ năng chủ động đủ 1000×2^(n-1) lần (1000, 2000, 4000... mỗi loại đếm riêng, dư giữ lại) VÀ trả 50×n Linh Thạch (LT.spend, cần đăng nhập). Chỉnh: CF.castBase, CF.ltBase.
- Chỉ số cộng qua twB→SX (dmgp, cdmg, dotd, stnc, frzc). Không sửa engine. Chỉnh số liệu: khối CF / FB đầu module.
- Không vẽ/không chạy hiệu ứng trong Đấu Trường và Làng (chỉ số cộng vẫn tính).
