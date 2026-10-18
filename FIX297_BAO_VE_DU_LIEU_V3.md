# Fix297 — Bảo vệ dữ liệu v3 (đã áp dụng lên Supabase)
- SQL: luu_mang_bao_ve_v3.sql · hoàn tác: luu_mang_bao_ve_v3_ROLLBACK.sql. KHÔNG sửa push_save.
- Bảng mới saves_guard (khoá RLS, chỉ truy cập qua hàm): ảnh chụp giữ lâu, không bị xoay vòng như saves_history.
  * 'daily': mỗi ~24h, giữ 14 bản.
  * 'drop': chụp bản cũ NGAY khi bản mới bị tụt bậc, hoặc cùng bậc mà tụt >= 3 cấp (cách nhau >= 5 phút), giữ 20 bản.
- Trigger saves_guard_before_update trên saves: tự chụp; mọi lỗi trong trigger bị nuốt nên không bao giờ chặn việc lưu.
- list_snapshots: gộp thêm mốc guard (id âm) và mốc '⭐ đỉnh cao nhất' (id 0, từ saves_peak).
- restore_snapshot: hiểu id âm (guard) và id 0 (đỉnh cao nhất); luôn ghi 'prerestore' bản hiện tại trước khi khôi phục.
- Client: systems/12-cloud-save.js thêm nhãn cho daily / drop / peak (không đổi logic).
- Đã kiểm thử trong giao dịch rồi huỷ: giả lập tụt Lv100→Lv1 → sinh đúng 2 bản guard, danh sách có mốc peak.

# Fix298 — Chặn tụt cấp thật sự (đã áp dụng lên Supabase)
- SQL: luu_mang_bao_ve_v3b_push_save.sql (thay push_save). Hoàn tác: chạy lại khối push_save trong luu_mang_snapshot_v2.sql.
- Máy chủ tự tính bậc/cấp từ CHÍNH dữ liệu gửi lên (không tin số client). Từ chối nếu tụt bậc, hoặc cùng bậc mà tụt >= 3 cấp:
  * p_force = false → status 'regress' · p_force = true (ép ghi đè) → status 'protected'. Trước đây ép ghi đè lách được mọi chặn.
  * Ngoại lệ HỢP LỆ (cho qua, không còn hộp thoại xung đột): vừa bật cờ Hợp Đạo (PS[i].hd) hoặc Chuyển Thế (PS[i].ct) ở bất kỳ nhân vật nào; tài khoản trong kthm_admin.
  * Reset Alpha (xoá bản lưu phía máy chủ) không bị ảnh hưởng vì đi đường tạo mới.
- Client (systems/12-cloud-save.js): nhận 'protected'/'regress' → hộp thoại "🛡 Máy chủ đã CHẶN lưu": OK = tải lại nhân vật từ mây · Huỷ = tạm không lưu. Chỉ hỏi 1 lần/10 phút.
- Kiểm thử trong giao dịch tự huỷ: tụt cấp thường → regress · tụt cấp có force → protected · lưu bình thường → ok · Hợp Đạo hợp lệ (Lv50→Lv1 có cờ hd) → ok.
- Lưu ý: systems/93-single-char.js (tài khoản cũ nhiều nhân vật → giữ nhân vật LỰC CHIẾN cao nhất, reset slot còn lại) có thể xoá nhân vật cấp cao hơn nhưng lực chiến thấp hơn. Nay bị chặn nếu làm tụt bậc/cấp so với mây; bản guard 'drop' giữ lại bản cũ.

# Fix299 — Bỏ cơ chế xoá nhân vật theo lực chiến (systems/93-single-char.js)
- migrate() không còn tự chọn nhân vật lực chiến cao nhất, không sw(), không wipe() các slot còn lại. Chỉ gắn cờ PS[cur].one=1.
- Lý do: lực chiến phụ thuộc trang bị đang mặc; tháo đồ làm lực chiến tụt → nhân vật cấp cao bị xoá nhầm.
- Phần tạo nhân vật (chỉ 1 nhân vật, hỏi xác nhận) giữ nguyên.
