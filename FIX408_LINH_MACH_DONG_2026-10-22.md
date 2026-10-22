# Fix408 — Linh Mạch Động (bãi farm quái nhiều người)
- File mới: `world/131-linh-mach-dong.js` (window.LMD, cấu hình `LMD.cfg`) · `linh_mach.sql`. Sửa: `index.html` (+1 <script> sau world/131-thanh-khi-trang-bi, ?v=408). Gỡ <script> thì cổng biến mất, không đụng nhà nào của Làng 2/3.
- **Việc cần làm 1 lần:** chạy `linh_mach.sql` trong Supabase → SQL Editor. Chưa chạy thì farm một mình (không có người khác, không có thưởng vòng).
- Vào: Cổng riêng 🌀 ở Làng Tân Thủ (bên trái Cổng Hội Chiến, `LMD.cfg.gx=-300`), cần Lv100, riêng Đạo Thể và Tiên Nhân (tier≥1) vào được ở mọi cấp. Dùng PBC, nền chỉ số map Nhân Giới số 4 (quái ×1.3 máu, ×1.2 thủ). Không đụng Nhà Số 5 (Tinh Luyện).
- Phòng theo dạng thể (Phàm/Đạo/Tiên), tối đa 20 người/kênh, đầy thì mở kênh mới. Polling 2.5 giây.
- Linh Khí chung 0..100 (0.15/quái): 33 Triều Quái 60s · 66 Linh Tuyền 90s · 100 Boss Mạch Chủ 8 phút (một thanh máu chung, máu dày 1+0.5×số người, tối đa ×8).
- Buff đồng đội +5%/người khác (tối đa +50%) EXP và tu vi; Triều Quái +50% nữa.
- Thưởng (lm_claim, máy chủ cấp): ≥40 quái/vòng; vàng 120k×(dạng thể+1)×(1 / 1.5 / 2 / 3 khi boss chết); boss chết +2×(dạng thể+1) LT khoá, người sát thương cao nhất +3; tối đa 12 vòng/ngày/nhân vật. Chỉnh trong hàm `lm_k()`.
- Chống gian lận: kẹp 3 quái/giây/người, sát thương boss ≤40%/lần báo. Client vẫn tự báo số quái nên cùng mức tin cậy với Hội Chiến Boss.
- Chưa làm: vẽ đầy đủ ngoại hình người khác (đang là linh ảnh + tên), vùng Tranh Mạch PvP, ghép đội theo môn phái/ngũ hành, vật phẩm riêng Linh Mạch Tinh.
