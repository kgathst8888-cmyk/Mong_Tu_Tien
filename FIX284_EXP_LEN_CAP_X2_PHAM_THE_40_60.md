# Fix284 – EXP cần để lên cấp x2 (Phàm Thể Lv40 → Lv60)
- Thay Fix280 (đã gỡ, vốn nhân EXP quái). Sửa core/01c-affix-petdata-skills.js, hàm nx(): EXP cần lên cấp x2 khi Phàm Thể (không Đạo Thể/Tiên Nhân) ở cấp 40-59 (lên tới Lv60).
- Chỉnh: window.NXP_PHAM = {mul:2, lo:40, hi:60} (mul = 1 tắt).
