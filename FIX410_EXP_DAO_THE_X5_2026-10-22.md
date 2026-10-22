# Fix410 – EXP Đạo Thể ×5 + lùi cấp theo tu vi tích luỹ
- world/33-hop-dao.js: CF.xpMul 5 → 25 (EXP cần để lên cấp của Đạo Thể gấp 5 lần). Thêm rebase(): mỗi nhân vật Đạo Thể (chưa chuyển thế) bị lùi cấp 1 lần (cờ PS[i].xrb='x25') theo tổng EXP đã tích luỹ tính bằng hệ số cũ, xếp lại cấp theo bảng EXP mới; không bao giờ tăng cấp; điểm tiềm năng giữ nguyên. apply() (Hợp Đạo mới) tự gắn cờ nên không bị lùi.
- world/76-chuyen-the.js: CF.xpK 20 → 4 để Tiên Nhân giữ nguyên tổng ×100 (không bị ảnh hưởng bởi thay đổi này).
- Chỉnh: CF.xpMul (33), CF.rebaseId (đổi id để chạy lại đợt lùi cấp).
