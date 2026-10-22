# Sự kiện Halloween (Fix261) — world/99-su-kien-halloween.js
- Thời gian: 18/10/2026 → hết 31/10/2026 (giờ VN). Chỉnh CF.start / CF.end. Hết hạn: NPC + trang trí biến mất, ngừng rơi; đồ còn trong dữ liệu nhưng không đổi được.
- Làng Tân Thủ: bí ngô + bộ xương + NPC 🎃 Sứ Giả Halloween (vw()*0.59). index.html: nạp ngay TRƯỚC world/61-lang-gian-rong.js.
- Rơi: quái thường/Tinh Anh 5% mỗi loại Đường/Bột Mì/Mạch Nha; Boss 5% Bí Ngô.
- Ghép kẹo: 5+5+5 + 2 LT + 50k vàng → Ngọt 10% / Dẻo 20% / Thối 70%. Ghép Bí Ngô Ma Quái: 20 Bí Ngô + 20 LT + 5m vàng.
- Linh Thạch thưởng: LT.earnKS (khoá, không trần ngày). Cần đăng nhập ☁ để ghép/mở.
- Mảnh Cánh Cấp 4: chỉ cộng bộ đếm PS[cur].hw.wf4 (chờ hệ thống cánh cấp 4). "Ngọc" = Đá Khảm chưa mài (GEMX.add).
- Dữ liệu: PS[cur].hw. Tỉ lệ phần thưởng chưa nêu (vàng các mức, trang bị): xem RW_SWEET/RW_CHEW/RW_ROT/RW_GHOST/EQ_W.
- Fix289: sửa không chạm được Sứ Giả (HUDX.on luôn bật nên chặn; đã bỏ điều kiện) và vẽ bí ngô/xương/NPC TRƯỚC nhân vật (bọc drawEP trong vdraw) để không che nhân vật.
- Fix290: làm lại hiệu ứng: bầu trời đêm tím (sao, trăng, dơi, quầng cam chân trời), bí ngô phát sáng, bộ xương, bia mộ, ma bay, sương, đom đóm, NPC vẽ lại (sprite độ phân giải x2).

# Fix394 — Boss Halloween ngẫu nhiên (world/99-su-kien-halloween.js)
- Cứ 30 phút (giờ thật, theo nhân vật, PS[cur].hw.bn) có 1 "🎃 Vua Bí Ngô" xuất hiện ở bản đồ quái (mảng E: map thường + Linh Giới). Tới giờ mà đang ở làng/phụ bản/Tiên Giới/map treo thì chờ, vào map quái là xuất hiện. Đổi map khi chưa hạ → xuất hiện lại sau ~3s.
- Hạ boss: +1 Bí Ngô MA QUÁI (h.gp, mở thẳng ở Sứ Giả, không cần ghép), +5 Kẹo (mỗi viên ngẫu nhiên Ngọt 10% / Dẻo 20% / Thối 70%). Boss này không roll thêm 5% Bí Ngô boss thường.
- Chỉnh ở khối BO (every, pump, candy, hpMul, dfMul, slot). Test: HALW.boss() ép xuất hiện.
- Fix394b: mảng mốc quà trong module đổi tên MS → MSQ (trước đây che mất bảng quái MS của game → boss vẽ lỗi "reading 'h'"). Boss biến mất chưa chết → xuất hiện lại sau ~3s (đặt hw.bn=now+3s).
