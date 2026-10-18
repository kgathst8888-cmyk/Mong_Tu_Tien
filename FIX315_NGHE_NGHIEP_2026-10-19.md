# Fix315 — Kỹ Năng Nghề Nghiệp (Nhà Nghề Nghiệp, Làng Tân Thủ 2)
- Module mới: `world/103-nghe-nghiep.js` (window.NGH), nạp sau ui/101 trong index.html (?v=315). Gắn vào `TT2.houses[2].open`.
- 5 nghề, mỗi nhân vật học TỐI ĐA 2 (CF.maxLearn): ⛏ Khai Khoáng · 🌱 Linh Nông · ⚗ Luyện Đan · 🔨 Rèn Đúc · 💎 Giám Bảo. Cấp 1→10, lên cấp bằng EXP nghề.
- Học: 20.000.000💰 + 50💎 (LT.spend, cần đăng nhập ☁). Quên nghề: 100💎, mất cấp nghề đó. Lưu `PS[cur].ng`.
- Bonus cấp 10: KK +50% vàng/quặng, +30% ra thêm quặng, +20% Huyền Kim, Nguyên Anh thu nhanh +50% · LN cây chín −30%, sâu bệnh −80%, +40% sản lượng · LD +20% thành đan, +10% thượng phẩm, −20% phí vàng · RD +5% cường hóa, −20% phí vàng · GB +10% ghép đá, −20% phí 💎 mài/ghép.
- EXP: đào 1/nhát · thu hoạch 6/ô · luyện đan 4/lò (tối đa 40/lần) · cường hóa 8/lần · mài đá 3/viên · ghép đá 12/lần.
- Patch nhỏ (có kiểm tra window.NGH, gỡ module vẫn chạy): world/13-mining.js · systems/08-farming-alchemy.js · world/38-da-cuong-hoa.js · equipment/64-duc-lo-kham-da.js · index.html · MODULE_MANIFEST.json.
- API thử nghiệm: NGH.give('kk',10) · NGH.open() · NGH.lv('kk'). Chỉnh cân bằng: CF và B trong module.
- Hiển thị tỉ lệ/phí cường hóa (hộp xác nhận +7→+10 và nút trong túi: core/01p-bag-pet-ui.js) đã cộng bonus Rèn Đúc.
