# Fix436 — Treo đồ cường hoá +11..+15 lên chợ bị mất
- Nguyên nhân: `kthm_item_ok` (chong_dube.sql) chặn cường hoá `u > 10` nhưng game cho lên +15 (`world/38-da-cuong-hoa.js` MAXU=15). Đăng đồ +11..+15 -> máy chủ ném BAD_ITEM -> client (`post()` trong systems/32) coi là đồ làm giả, đã rút khỏi túi từ trước nên KHÔNG trả lại => mất đồ (máy chủ không lưu gì).
- Sửa phía máy chủ: `fix436_cho_cuong_hoa_15.sql` (chạy 1 lần): đổi đúng 1 dòng u>10 -> u>15. Hàm này cũng dùng trong quét lưu (`kthm_cheat_scan`) nên đồ +11..+15 trong túi/ô mặc không còn bị tính nhầm là đồ giả.
- Sửa phía client: `systems/32-cho-giao-dich.js` (`?v=436`): BAD_ITEM không còn nuốt đồ, trả lại túi + báo lý do; DUPE_ITEM vẫn giữ nguyên (không trả lại bản nhân bản).
- Đồ đã mất trước đó: máy chủ không lưu nên không khôi phục tự động, cần admin tặng lại.
