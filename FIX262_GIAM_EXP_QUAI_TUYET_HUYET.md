# Fix262 – EXP quái Huyết Nguyệt Sơn Môn + Tuyết Hàn Ma Phong còn 30%
- File mới: world/89-giam-exp-quai-tuyet-huyet.js (nạp sau world/89-quai-nhan-gioi-x3.js)
- Bọc drop(): mapSel in {0,1}, !lg/!dg/!vil, quái thường/Tinh Anh/Boss Sử Thi (không 'pal', không e.dg) -> trừ 70% EXP vừa cộng.
- Chỉnh: window.GEXP_MAP.mul (0.3 mặc định, 1 = tắt).
