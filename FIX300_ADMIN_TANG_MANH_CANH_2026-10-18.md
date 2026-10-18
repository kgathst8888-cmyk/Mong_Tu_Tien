# Fix300 — Admin tặng Mảnh Cánh cấp 1, 2, 3
- ui/69-thong-bao-thu.js: thêm vào bảng ITM 3 khoá `wf1` / `wf2` / `wf3` (🪽 Mảnh Cánh Cấp 1/2/3, t:'wf', tối đa 1000 mỗi thư). Nhận thư → WFA(cấp-1, số lượng) + dgSave() (cùng kho mảnh cánh với Hầm Ngục / gói Thần Cánh). itErr báo lỗi nếu chưa có kho mảnh cánh.
- Form 🎁 Gửi quà của ui/70 tự hiện 3 mục mới từ MAIL.IT — không sửa ui/70, không sửa admin.sql.
- index.html: script ui/69 thêm ?v=300 để chống cache.
- Lưu ý: kho mảnh cánh lưu ở localStorage 'kthm_dg' của máy (như mảnh cánh rơi từ Hầm Ngục), không theo từng nhân vật.
