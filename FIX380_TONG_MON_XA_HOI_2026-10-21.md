# Fix380–385 — Tông Môn: xã hội, danh hiệu, kho, Tông Chiến, tên tông, rương ngẫu nhiên
Làm tiếp Tông Môn (Fix347–350) trên nền v34. **Toàn bộ SQL dưới đây ĐÃ được đẩy lên Supabase** (project fdaoswcyhbkzzuwlbrdp, các migration `tong_mon_xahoi_fix367`, `tong_mon_shop2_kho_fix368_369`, `tong_mon_chien_fix370` — tên migration là số tạm thời lúc làm, nội dung = các file SQL dưới đây) và đã chạy thử trên máy chủ thật trong giao dịch tự huỷ. File SQL để lưu lại / dựng môi trường khác.
**Thứ tự chạy trên môi trường mới:** tong_mon.sql → tong_mon_boss.sql → tong_mon_shop.sql → **tong_mon_xahoi.sql → tong_mon_shop2.sql → tong_mon_kho.sql → tong_mon_chien.sql**. Mọi file chạy lại nhiều lần vẫn an toàn (các hàm cũ chỉ cần thêm nhật ký/cống hiến được BỌC LẠI: bản cũ đổi tên `<tên>0`, không cấp cho máy khách). Thiếu file SQL nào thì tab tương ứng báo "chưa kích hoạt", game vẫn chạy.
Không chạm file Fix379 (`fix379_*.sql`, `dong_ho_may_chu.sql`) — các file đó vẫn CHƯA chạy như ghi trong FIX379.

## Fix380 — Xã hội: duyệt vào tông, chat tông, nhật ký (`tong_mon_xahoi.sql`, `world/106`, `world/127`)
- Chế độ vào tông (Tông Chủ chỉnh ở tab 👥 Người): 🟢 mở cửa · 📨 xin vào (Tông Chủ / Trưởng Lão duyệt, đơn hết hạn 3 ngày, mỗi tài khoản 1 đơn chờ, có nút huỷ) · 🔒 đóng cửa. Tab chính nhắc khi có đơn chờ. Danh sách tông hiện chế độ.
- Tab 💬 Chat: chat riêng của tông (200 tin gần nhất, ≤120 ký tự, 2 giây/tin) + 📜 Nhật ký (vào/rời/bị đuổi/phong chức/lên cấp tông/hạ boss/Tông Chiến/kho; 100 dòng). Tự cập nhật mỗi 6 giây khi tab mở, chỉ vẽ lại danh sách (không đóng bàn phím).
## Fix381 — Danh hiệu Tông Môn (`tong_mon_shop2.sql`, `world/108`)
- 3 danh hiệu PFD id 31–33, mua 1 lần/tài khoản bằng cống hiến: Đệ Tử 5.000 (HP/ST/vàng +3%) · Hộ Pháp 25.000, tông Lv4 · Tông Sư Chi Danh 80.000, tông Lv8 (chỉ số thấp hơn «Cửu Thiên Chí Tôn»). Giới hạn trọn đời do máy chủ giữ; game tự cấp cho mọi nhân vật của tài khoản khi mở tab Shop và đăng ký danh hiệu vào `PFD.TT` khi nạp.
## Fix382 — Kho tông (`tong_mon_kho.sql`, `world/128`)
- Tab 📦 Kho: kho chung chỉ chứa 🌙 Mảnh Nguyệt Thạch và 💠 Mảnh Thánh (không chứa trang bị). Ai cũng quyên (không cộng cống hiến để không đúc cống hiến); Tông Chủ phát ≤500/lần, Trưởng Lão ≤5/lần (không tự phát cho mình) thành "quà" — người nhận tự bấm Nhận (máy chủ đánh dấu 1 lần).
## Fix383 — Tông Chiến (`tong_mon_chien.sql`, `world/107` tab ⚔ Chiến)
- Tông ≥5 thành viên được ghép với tông có sức mạnh gần nhất mỗi tuần (ghép lười). 2 lượt/ngày/tài khoản (đếm riêng với boss), 60 giây đánh "Hộ Pháp" tông địch; tổng sát thương = điểm tông. Hết tuần điểm cao hơn thắng. Nhận thưởng sau tuần (≥2 lượt): thắng / hoà / thua / không đối thủ; lần nhận đầu của tông chốt exp tông (+400/+250/+150/+100) và ghi nhật ký. Dùng chung engine trận đánh với boss (cờ dg.tb).
## Fix384 — Tên tông cạnh tên (`world/127`, vá `world/41`, `systems/28`, SQL `tm_tags` + `chat_recent`)
- Làng online: "Lv.x [Tông] Tên" và thẻ người chơi có dòng 🏯 Tông (tra theo mã băm 10 ký tự của vp_ping, gộp ≤40 mã, nhớ 5 phút). Chat thế giới: [Tông] trước tên (cột `tag` mới trong `chat_recent`; hàm này được viết lại, giữ nguyên các cột cũ).
## Fix385 — Boss Tông Môn: cống hiến + rương ngẫu nhiên (`world/107`, `tong_mon_xahoi.sql`)
- Mỗi lượt đánh boss +30 cống hiến; nhận thưởng tuần +500/+300/+150/+80 theo hạng. Rương trang bị cố định trong thưởng boss → 🎁 rương ngẫu nhiên có Mảnh Thánh (tỉ lệ hiện công khai ở bảng thưởng); cùng cơ chế cho thưởng Tông Chiến (chỉ khi thắng).
- Cống hiến cũng cộng từ Tông Chiến (+20/lượt, +200 thắng / +80 còn lại khi nhận thưởng).

## Giới hạn / lưu ý thành thật
- Vàng, sát thương, Mảnh Nguyệt Thạch/Mảnh Thánh, Linh Thạch khoá, trang bị do MÁY KHÁCH báo và phát (cùng mức tin cậy với Boss Bất Tử / Chiến Công — xem FIX379); máy chủ giữ lượt, máu boss, hạng, điểm tông, kho, số dư cống hiến, giới hạn mua, thưởng 1 lần.
- Tông Chiến: hai tài khoản tự lập 2 tông (mỗi tông đủ 5 người) để hưởng "thắng" không ngăn được hoàn toàn; phần thưởng thắng vừa phải và cần đủ 5 người + 2 lượt/người. Chưa có cơ chế mời người theo tên (game chưa có danh bạ người chơi toàn cục).
- Cân bằng (máu boss, giá shop, thưởng) dựa trên rất ít dữ liệu thật; xem lại khi có nhiều người chơi. Chỉnh: `TMB_CF` (107), `TMS_CF`/CAT (108, đổi giá phải sửa cả `tm_shop_cat` trong SQL), `TMK_CF` (128), `TMX_CF` (127).
- `tools/check.py` báo "THIẾU FILE" cho mọi thẻ script có hậu tố `?v=` (cả module cũ) — giới hạn của công cụ, không phải lỗi mới; `tools/build.py` cũng chưa xử lý `?v=`.
