# Fix327 — Tối ưu hệ thống AUTO, chống treo game khi có lỗi
`core/01e-step-loop.js`:
- Logic auto gom vào `autoRun()`: mỗi kỹ năng bọc `try/catch` riêng, bỏ qua kỹ năng thiếu (`SK[i]` rỗng), dừng gọi tiếp ngay khi đã có 1 chiêu đang tung (`P.pe`/`P.act`). `ZC.zauto()` (tiên thuật, ý cảnh, môn phái, thần thông, pháp bảo) cũng bọc riêng.
- `P.pe.f()` (hiệu ứng/sát thương của chiêu) bọc `try/catch`: một chiêu lỗi không còn làm đứng cả vòng `step()`.
- `autoLogErr()`: lỗi chỉ ghi console `[AUTO]`, tối đa 1 lần/10 giây (không spam).
- Giữ nguyên thứ tự ưu tiên 4→0 → chiêu 5 → zauto, và quy tắc Fix325 (triệu hồi theo từng loại thú).
Đã mô phỏng: Triệu Hồi Sư dùng đủ 3 chiêu triệu hồi + Vạn Linh; chiêu 1 lỗi hoặc zauto lỗi thì các chiêu còn lại vẫn chạy.
