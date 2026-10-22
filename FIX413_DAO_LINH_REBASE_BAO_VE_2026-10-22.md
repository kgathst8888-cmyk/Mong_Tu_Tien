# Fix413 – Bảo vệ dữ liệu nhận biết đợt lùi cấp Đạo Thể do game làm (Đạo Linh ×25)
- Nguyên nhân: Fix410 (world/33-hop-dao.js rebase()) tự lùi cấp Đạo Thể khi đổi cách tính Đạo Linh. push_save (Fix379) có "CHẶN TỤT CẤP v3": tụt bậc hoặc tụt ≥3 cấp trên bản mây bị trả 'regress'/'protected' (chỉ miễn khi vừa Hợp Đạo, vừa Chuyển Thế, hoặc admin) → bản lưu sau khi lùi cấp bị từ chối.
- Sửa: luu_mang_bao_ve_v3c_dao_linh_rebase.sql (mới, = Fix379 + 1 điều kiện trong khối legit): nhận bản lưu mà nhân vật Đạo Thể (hd bật, chưa Chuyển Thế) có cờ xrb vừa đổi sang giá trị trong danh sách cho phép ('x25' = CF.rebaseId).
- Lần sau đổi CF.rebaseId (đợt lùi cấp mới): thêm id vào `in ('x25')` trong file SQL rồi chạy lại.
- PHẢI chạy luu_mang_bao_ve_v3c_dao_linh_rebase.sql 1 lần trong Supabase SQL Editor. Hoàn tác: chạy lại fix379_bxh_xac_thuc_push_save.sql.
- Không sửa file JS nào. Trigger 'drop' (luu_mang_bao_ve_v3.sql) vẫn chụp bản cũ trước khi tụt cấp, giữ làm điểm khôi phục.
