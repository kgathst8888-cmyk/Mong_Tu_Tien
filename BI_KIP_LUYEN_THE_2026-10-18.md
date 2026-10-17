# Fix247 — Bí kíp luyện thể (ui/96-bi-kip-luyen-the.js)
Module riêng, nạp sau ui/95. Gỡ = xoá thẻ script. Lưu theo nhân vật: `PS[cur].bk`.
- 4 bí kíp: Bách Luyện Kỳ Kinh (Sơ, mua Tạp Hóa) · Thiết Ngưu Hộ Thể Công (Trung, 3% mọi Boss) · Kim Cang Bất Hoại Thân (Thượng, 2% Kiếm Thánh) · Hỗn Mang Bách Diệt Kinh (Đỉnh, 1% Ác Ma Thượng Giới).
- Mang bí kíp chưa luyện vào ô 📖 → mỗi quái chết +1-3 điểm; đủ 1000 → 🔥 Luyện. Thất bại: về 0 điểm, luyện lại. Thành: phẩm Thiên ×1 / Địa ×1.2 / Huyền ×1.5 / Hoàng ×2.
- Trọng số luyện 50/30/20/10/5 (tổng 115) được chuẩn hoá: ≈43,5% bại · 26,1% Thiên · 17,4% Địa · 8,7% Huyền · 4,3% Hoàng. Chỉnh `BK.cfg.roll`.
- Chỉ số: + điểm tiềm năng (cả 6 chỉ số, bọc getter `PS[i].al`), HP/Công/Thủ/MP % (bọc ZC.ph/pa/pd/pm).
- 🛡 Bất Diệt Thân (NỘI TẠI): luôn có khiên 30% HP tối đa, vỡ → hồi chiêu 15s rồi tự có lại; không có nút trên thanh kỹ năng; hoạt động mọi bản đồ kể cả Tiên Giới (qua setter P.hp). Mở khi mang bí kíp đã luyện thành (`CF.skillFrom='any'` để chỉ cần mang).
- Tab Thu thập: chỉ tên + hình, bí kíp chưa từng có hiện ❓.
- Giá Bách Luyện Kỳ Kinh: `CF.price` = 200.000💰 (tạm đặt, chỉnh tuỳ ý).

## Fix248 — Admin tặng bí kíp
- ui/69 (bảng ITM): thêm 4 vật phẩm thư `bkbl/bktn/bkkc/bkhm` (tối đa 10/thư). Form 🎁 Gửi quà của ui/70 tự hiện mục này (gửi cho tất cả hoặc 1 tài khoản). Nhận thư → bí kíp vào túi bí kíp của nhân vật đang chơi (chưa luyện, 0 điểm), tự mở trong Thu thập.
- Kiểm tra trước khi nhận: thiếu chỗ túi bí kíp (60) → báo lỗi, thư giữ lại để nhận sau. Không cần sửa SQL.
- File đổi: ui/69-thong-bao-thu.js · ui/96-bi-kip-luyen-the.js (thêm BK.space) · tài liệu này.
