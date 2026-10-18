# FIX272b — Reset Alpha: một số tài khoản không reset
Nguyên nhân: epoch chỉ kiểm tra 1 lần lúc mở trang (và lỗi mạng thì bỏ qua) → tab đang mở/chạy nền hoặc máy lỗi mạng giữ dữ liệu cũ và đẩy ngược lên mây sau khi máy chủ đã xoá.
File sửa: systems/10-alpha-epoch.js (thử lại 3 lần), systems/10b-alpha-epoch-live.js (MỚI), index.html (+1 thẻ script), MODULE_MANIFEST.json.
Cơ chế: kiểm tra epoch mỗi 30s/khi hiện tab/online; đổi mùa → khoá ghi, xoá dữ liệu cục bộ + phiên, tải lại; cổng chặn push_save khi mùa đã đổi.
Lưu ý: tài khoản đã bị đẩy lại dữ liệu cũ TRƯỚC khi vá cần reset lại phía Supabase (xoá bản lưu của các tài khoản đó + tăng epoch).
