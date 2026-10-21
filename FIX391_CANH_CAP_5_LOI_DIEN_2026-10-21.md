# Fix391 — Cánh Cấp 5 (Lôi Vũ Thiên Quang Dực) + Thần thông Lôi Điện
- Mở khoá: phải có Cánh Cấp 4 (nút Hợp chỉ bật khi wl()==4). Hợp: 20 Mảnh Cánh Cấp 5 + 200.000.000 vàng + 5.000💎 Linh Thạch (cần chuyển chức lần 3).
- Mảnh Cánh Cấp 5: 0,5% / lần hạ Trùm Hầm Ngục, chỉ rơi khi đang sở hữu Cánh Cấp 4 (WGD[4]). Lưu trong kthm_dg (khoá w5, biến wf5).
- Chỉ số cánh như các cấp (8%×cấp công/máu, 4%×cấp né) → cấp 5 = +40% công, +40% máu, +20% né; vẫn có +20% ST kỹ năng của Cánh 4 (wl()>=4).
- Nội tại mới (ui/104-canh5-loi-dien.js, chỉnh ở khối window.C5): 2% đòn gây ra ×2 sát thương (hiện chữ "x2 Sát thương!"); Thần thông Lôi Điện tự dùng khi có quái trong tầm 620px: mưa sét 3s, hồi 20s, KHÔNG tốn mana, KHÔNG hiện ở HUD (đòn sét tính là đòn kỹ năng).
- Hình: assets/canh-cap-5.js (cắt từ ảnh cánh 8 góc, 221x380, nền trong suốt). 8 hướng dùng chung world/78 (Tiên Giới). Vỗ cánh mềm: 16 lát cắt (map thường) / 10-14-22 lát tự thích ứng (Tiên Giới), tốc độ ×0,6, biên độ ×0,8, làm mượt chậm hơn Cánh 4.
- File sửa: core/01t-dungeon.js, core/01u-wings.js, world/78-canh-8-huong.js, ui/69-thong-bao-thu.js (quà admin wf4/wf5/wg5), ui/70-admin-panel.js (reset wf5), index.html, MODULE_MANIFEST.json. File mới: assets/canh-cap-5.js, ui/104-canh5-loi-dien.js.
- Giảm Cánh Cấp 4 còn 90%: WGH[3] 112.5 → 101.25 (core/01u-wings.js; áp dụng cả map thường và Tiên Giới).
- Thần thông Lôi Điện chạy cả ở Thành Tiên Giới 2.5D: đánh quái TGQ.mon qua TGQ.hit (chỉ khi đang giao chiến được: Tiên Nhân bay ngoài thành), vẽ sét theo toạ độ ô (TG.S2). Tạm tắt TGFX.hit trong lúc sét đánh để hào quang không cộng dồn làm trắng màn hình. Đếm thời gian theo mỗi lần step() (không theo fr).
- Fix391b: world/78 thêm quầng xanh đậm sau Cánh 5 ở Tiên Giới cho nổi trên nền sáng.
