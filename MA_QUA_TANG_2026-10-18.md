# Mã Quà Tặng (Fix271) — ui/99-ma-qua.js + ma_qua.sql + tab 🎟 trong ui/70
Người chơi bấm nút 🎟 **Mã quà** (hàng icon trái, sau ✨ Sự kiện) → nhập mã → nhận quà.

## Cài đặt máy chủ (bắt buộc, 1 lần)
Supabase → SQL Editor → dán toàn bộ `ma_qua.sql` → Run (an toàn khi chạy lại). Cần đã chạy trước: cho_giao_dich.sql, admin.sql.

## Quy tắc
- Máy chủ quyết định mọi thứ (hàm `redeem_giftcode`): mã đúng · đang bật · đã đến giờ dùng · chưa hết hạn · còn lượt · tài khoản này chưa dùng.
- **Mỗi TÀI KHOẢN** dùng mỗi mã 1 lần (không phải mỗi nhân vật). Có thể giới hạn tổng lượt dùng và hạn dùng.
- Nhập sai quá 8 lần / 10 phút → tạm khoá nhập (chống dò mã).
- Linh Thạch (nếu mã có) cộng thẳng vào ví KHÔNG KHOÁ trên máy chủ. Phần còn lại (vàng, vật phẩm Cash Shop, quặng, rương trang bị, vật phẩm mới) gửi về ✉️ Hòm Thư của nhân vật đang chơi (id thư `gc_<MÃ>`) để bấm Nhận quà — túi đầy thì chưa mất.
- Chống mất quà: sau khi thư đã vào nhân vật và bản lưu đã lên mây, game mới gọi `gc_confirm`. Nếu tắt game giữa chừng, nhập lại mã sẽ giao lại quà (không cộng Linh Thạch lần 2, không nhân đôi thư trên cùng nhân vật).

## Admin: 🛡 Admin → tab 🎟 Mã quà
- Tạo 1 mã tên tuỳ chọn (A–Z, số, `-`, `_`, 3–40 ký tự) hoặc để trống để tự sinh `KTxxxxxxxxxx`.
- Số mã tạo ≥ 2 → sinh ngẫu nhiên tối đa 200 mã, mỗi mã dùng 1 lần (kết quả hiện trong ô để sao chép).
- Quà dùng đúng form của thư quà + ô 💎 Linh Thạch (tối đa 100.000.000/mã), số lượt dùng, hạn dùng (ngày), ghi chú.
- Danh sách mã: số lượt đã dùng, trạng thái (đang mở / tắt / hết hạn / hết lượt), nút ⏸ Tắt / ▶ Bật, 🗑 Xoá. Mọi thao tác ghi vào 📜 Nhật ký.
- Xoá mã = mã không nhập được nữa; quà người chơi đã nhận vẫn còn.

## File đổi
- mới: ui/99-ma-qua.js · ma_qua.sql · MA_QUA_TANG_2026-10-18.md
- sửa: ui/70-admin-panel.js (tab 🎟 Mã quà) · ui/98-hud-gon.js (nút 🎟 theo nút thu gọn HUD) · index.html (+1 thẻ script sau ui/97)
- SYMBOL_INDEX.tsv, MODULE_MAP.md: sinh lại bằng tools/check.py --build

## Fix272 — UID trong bảng ☁ Tài khoản (systems/12-cloud-save.js)
- Dưới email hiện thêm dòng `UID: <uuid tài khoản>` + nút 📋 Sao chép (chạm giữ cũng chọn được). UID chính là ID Supabase của tài khoản — dán vào ô tìm của 🛡 Admin → 👤 Tài khoản (hỗ trợ tìm theo email hoặc UUID) để gửi quà/cộng LT đúng người.
