# Thông báo + Thư (ui/69-thong-bao-thu.js, nạp sau systems/68)
- Nút 📢 Thông báo (left:100px) và ✉️ Thư (left:146px) cùng hàng 💬 Chat / 🏮 Chợ (top:132px). Chấm đỏ = chưa đọc / chưa nhận quà. Một bảng 2 tab.
- Thông báo: mảng NOTICES đầu file (thêm dòng MỚI lên ĐẦU, id không trùng). Đã đọc lưu localStorage `ktb_read`.
- Thư: lưu `PS[cur].mail` (đi cùng save/cloud save), tối đa 60, đã đọc + đã nhận quà tự xoá sau 30 ngày. Quà: vàng, vật phẩm Cash Shop (CSH.give), quặng sắt/huyền kim (MN.get()), rương trang bị (gen). Không có Linh Thạch (ví ở máy chủ).
- Gửi thư từ code: `MAIL.send({id:'su-kien-1',from:'Hệ Thống',title:'..',body:'..',q:{gold:500000,csh:{vx:1},eq:{r:3,n:1}}})` (id trùng → bỏ qua, không gửi lại).
- Tuỳ chọn máy chủ: chạy thong_bao_thu.sql → thông báo/thư hệ thống từ bảng `thong_bao`. Lưu ý: thư quà từ máy chủ phát theo từng nhân vật.
