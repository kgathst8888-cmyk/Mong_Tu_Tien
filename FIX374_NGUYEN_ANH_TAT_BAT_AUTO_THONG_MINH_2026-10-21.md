# Fix374 — Nguyên Anh trồng cây: nút Tắt/Bật + auto thông minh (2026-10-21)
- Nút ⏸ Tắt / ▶ Bật (đầu tab 🌱 Linh Điền): tắt = tạm dừng, thời gian thuê còn lại được giữ nguyên (S.na.pz, S.na.left); bật lại chạy tiếp. Mua thêm khi đang tạm dừng sẽ cộng dồn và chạy lại.
- Chế độ gieo (S.na.mode): 🧠 smart (mặc định) / 📌 keep (như cũ).
  - smart: mỗi lần gieo chọn loại dược thảo THIẾU nhất = nhu cầu luyện đan (tổng rc ×5 mọi loại đan) − kho − cây đang trồng/đã gieo trong lượt; hoà thì chọn loại chín nhanh; kho đủ hết thì quay về loại cũ/loại đang chọn; hết hạt tự đổi loại khác còn hạt.
- File đổi: systems/08-farming-alchemy.js (naPick, naNeed, naToggle, naMode, lưu/tải pz/left/mode) · systems/33-nguyen-anh-trong-cay.js (UI + NATC.toggle/mode) · index.html (?v=374).
