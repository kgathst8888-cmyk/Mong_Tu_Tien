# Fix374 — Đấu Trường Plus (sàn đấu, VS, hiệu ứng đòn, hạng/mùa/rương, giao diện)
- File mới: `systems/19b-arena-plus.js` (window.ArenaPlus, cấu hình `ArenaPlus.cfg`). Sửa: `systems/19-arena.js` (9 điểm móc nhỏ, đều bọc try/catch), `index.html` (+1 <script> sau 19-arena), `MODULE_MANIFEST.json`. Không đụng SQL, không đổi công thức sát thương / điểm online. Gỡ <script> 19b thì Đấu Trường quay về như cũ.
- **Sàn đấu**: bầu trời + trăng theo hạng, núi xa, đấu trường cổ có khán đài + vòm, 2 lá cờ, 4 đuốc cháy, trận pháp xoay, tàn lửa. Nền dựng 1 lần rồi cache (chỉ vẽ phần động mỗi khung -> nhẹ).
- **Cảnh VS** khi vào trận: 2 bên (môn phái, cảnh giới, lực chiến, hạng), "VS" đập xuống, "CHIẾN!". Trận offline/bản sao tạm dừng ~1.7s cho cảnh VS; trận LIVE không dừng (chỉ phủ ~1.2s).
- **Hiệu ứng đòn**: tia lửa, vòng sóng, vệt chém, rung màn hình theo % máu mất, loé trắng khi đòn nặng (>7% máu), viền đỏ nhấp nháy khi máu <25%.
- **Hạng**: Tân Binh <1000 · Thanh Đồng 1000 · Bạch Ngân 1100 · Hoàng Kim 1250 · Bạch Kim 1450 · Kim Cương 1700 · Tiên Vương 2000 · Chí Tôn 2400 (theo điểm đấu trường online). Banner hạng + thanh tiến độ ở sảnh, nhãn hạng ở danh sách đối thủ và bảng xếp hạng (top 1-3 có nền huy chương), thông báo ⬆ THĂNG HẠNG ở màn kết quả.
- **Thưởng** (chỉ tính trận bạn thách đấu; trận được mời LIVE không tính, tránh cày bằng acc phụ): thắng = vàng theo hạng × (1 + 5%/chuỗi, tối đa 10 chuỗi). Rương mốc trong ngày khi thắng 2/5/8 trận (vàng 100k/250k/500k × (1+0.3×hạng); rương 3 thêm LT khoá 3+hạng). **Thưởng cuối mùa** (mùa = tháng, đổi lúc 0h UTC như ngày của Đấu Trường): theo hạng cao nhất đạt được trong mùa — vàng 200k→6 triệu, LT khoá 5→50 (từ Hoàng Kim). Điểm trên máy chủ KHÔNG reset; "mùa" chỉ là mốc thưởng + hạng cao nhất.
- Lưu local ở khoá `kthm2_arena_plus_v1` (thưởng cộng thẳng vào vàng / LT.earnKS của nhân vật đang chơi, rồi sv()). Cân bằng kinh tế: chỉnh `ArenaPlus.cfg` (winGold, chestGold, chestLT, seasonGold, seasonLT, chestAt, streakStep).

## Fix374b — sửa lỗi + auto 100%
- Bỏ viền đỏ nháy khi máu thấp (và giảm loé trắng: chỉ còn khi đòn rất nặng, rất nhẹ).
- Đấu Trường auto 100%: bỏ điều khiển tay (nút NHẢY ẩn, nút kỹ năng chỉ hiển thị hồi chiêu/linh lực, nút AUTO khoá). Vẫn còn nút ✕ thoát và ⏩ tốc độ (trận offline).
- Đối thủ sát thật hơn: cùng tốc độ di chuyển, cùng hồi chiêu và nhịp đánh như người chơi (trước đây chậm hơn ×1.6); áp dụng né, giảm sát thương, hút máu, hút linh từ hồ sơ; hình ảnh vẽ theo toàn bộ thuộc tính hiển thị của nhân vật (hồ sơ mới có thêm `vis`). Người chơi cần mở Đấu Trường 1 lần ở bản mới để hồ sơ có `vis`.
- File sửa: `systems/19-arena.js`, `systems/19b-arena-plus.js`.
