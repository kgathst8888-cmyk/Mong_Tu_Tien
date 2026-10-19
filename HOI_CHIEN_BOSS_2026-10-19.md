# Hội Chiến Boss — boss nhiều người chơi, mở 3 giờ / lần
**CÀI ĐẶT (bắt buộc):** Supabase → SQL Editor → chạy `hoi_chien_boss.sql` 1 lần (cần đã chạy `linh_thach_khoa.sql`). Chưa chạy thì cổng vẫn hiện nhưng báo "Máy chủ chưa cài Hội Chiến".

- Cổng mới ở Thôn Tân Thủ, ngay bên trái Cổng Ma Thần (chỉnh `CF.gx`/`CF.gy` trong module).
- Lịch (giờ VN, theo đồng hồ máy chủ): 0h, 3h, …, 21h. Mỗi lần 20 phút: 5 phút tập trung → 15 phút boss.
- Boss không bị hạ: người có đóng góp nhận 3.000.000 vàng + 5 Linh Thạch khoá.
- Boss bị hạ: 20 rương rơi trên đất (mở trong 120 giây), mỗi người 1 rương = 1 trang bị Thiên Thần ngẫu nhiên; người kết liễu +20 LT khoá; người sát thương cao nhất +20 LT khoá.
- MỘT BOSS CHUNG: boss đứng cố định ở mép phải bản đồ; đòn đánh (cột Ma Khí) sinh từ hạt giống + đồng hồ máy chủ nên mọi người thấy cùng vị trí, cùng vòng cảnh báo, cùng lúc cột giáng xuống (đứng trong vòng thì mất máu). Sau 8 phút boss cuồng nộ (nhiều cột hơn, nhanh hơn). Chỉnh ở `CY` trong module.
- Máu chung: mỗi máy báo sát thương lên máy chủ (`hcb_ping`, 2 giây/lần), máy chủ cộng dồn và trả thanh máu chung. Hệ số máu m = 6 + 1 × số người đã vào (tối đa 80), chốt khi boss ra.
- Máy chủ tự chống nhận trùng thưởng, chống rương trùng, giới hạn sát thương/giây. Linh Thạch khoá cộng thẳng vào `cho_lock` của nhân vật.

- **Chết = hồi sinh tại chỗ, tối đa 3 lần/trận**: gục thì hồi sinh ngay trong bản đồ (đầy máu, về mép trái, bất tử 3 giây) rồi đánh tiếp; sát thương đã gây và máu chung không mất. **Chết lần thứ 4 → về Làng Tân Thủ và không vào lại được trận đó** (máy chủ đếm trong cột `deaths`, hàm `hcb_die`/`hcb_deaths`, nên tải lại game cũng không reset). Người bị loại vẫn nhận thưởng tham gia nếu đã đạt mức đóng góp. Chỉnh: `CF.rsMax` (JS) + `hcb_k('respawns')` (SQL), `CF.rsHp` / `rsInv` / `rsX`.

## Quy ước mình tự đặt (chỉnh được)
- "Tham gia" = gây ≥ 0,05% máu boss (`min_dmg` = 500 trong `hcb_k`). Chỉ người đạt mức này mới nhận thưởng tham gia / được mở rương (chống vào treo nhận quà).
- Boss bị hạ mà ai đó không mở được rương (hết rương/bỏ lỡ) vẫn nhận phần "tham gia" 3tr + 5 LT.
- Thưởng kết liễu / sát thương cao nhất nhận ngay khi boss chết; phần "tham gia" nhận khi trận đóng. Thoát giữa chừng vẫn nhận lại được (mở bảng cổng hoặc lần về Làng sau).
- Cân bằng (máu, trần sát thương, thưởng, số rương, thời gian) nằm ở hàm `hcb_k()` trong SQL; chạy lại file để áp dụng.

## File
`world/94-hoi-chien-boss.js` (mới, nạp cuối trong index.html) · `hoi_chien_boss.sql` (mới) · `index.html` (+1 thẻ script). Không sửa engine; dùng lại boss Ma Thần + bản đồ Huyết Nguyệt (cờ riêng `dg.wb` / `e.wb`). Tắt: bỏ thẻ script.
