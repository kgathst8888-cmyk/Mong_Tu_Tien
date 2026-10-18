# Fix260 – Vẽ lại 5 bản đồ luyện cấp Nhân Giới
- File mới: world/84-nhan-gioi-ban-do-pro.js (nạp ngay sau world/60-ban-do-tu-tien.js trong index.html; thêm vào MODULE_MANIFEST.json)
- Chỉ thay nền (bgd) khi !dg && !vil && !lg && LGI==null. Quái, rơi đồ, Linh Giới, phó bản không đổi.
- Tắt nhanh để so sánh: window.NGPRO_OFF=1. Dựng lại nền: NGPRO.rebuild().
- Nền cache 2 lớp (trời + tiền cảnh); hiệu ứng động giảm khi QL>=1.
