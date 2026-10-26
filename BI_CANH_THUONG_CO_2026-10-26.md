# Bí Cảnh Thượng Cổ (Fix436) — phụ bản 7, chế độ roguelike
- Module mới: `world/142-bi-canh-thuong-co.js` (cấu hình ở khối `BC`). Tắt: bỏ `<script>` 142 trong index.html.
- Patch nhỏ: `world/40-phu-ban-2.js` (thẻ số 7: html + trạng thái + `go(7)`), `index.html` (1 script), `MODULE_MANIFEST.json`.
- Luật: cấp ≥30, 3 lượt/ngày (giờ tin cậy), 10 phòng, Boss giữa phòng 5, Boss cuối phòng 10; xong mỗi phòng chọn 1/3 Cơ Duyên (buff tạm, cộng dồn).
- Thưởng: vàng + EXP trả ngay mỗi phòng; Rương ở 2 Boss; Boss cuối thêm Linh Thạch khoá; KHÔNG rơi trang bị.
- Kỷ lục tuần lưu `PS[cur].bc9` (cục bộ theo nhân vật). Chưa có BXH online.
- Bọc (không sửa engine): dgTick, dm, dgHurt, drop, dgHud, dgb.onpointerdown.
- Fix437: tăng độ khó (máu/sức đánh/thủ quái mỗi phòng, Boss máu+thủ+công, nhiều quái hơn, hồi máu giữa phòng giảm). Thưởng giữ nguyên.
- Fix438: chợ online (systems/32-cho-giao-dich.js, toggle) chỉ mở khi HDAO.on() (đã đạt Đạo Thể). Chỉ chặn phía client.
