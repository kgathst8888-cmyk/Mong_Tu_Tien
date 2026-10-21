# Fix400 — Sửa lỗi Làng Tân Thủ 3 (world/102-lang-tan-thu-3.js, index.html ?v=400)
- Chạm vào nhà: chọn nhà GẦN NHẤT (trước đây lấy nhà cuối cùng trùng vùng chạm → dễ vào nhầm nhà ở chỗ giáp ranh).
- Mở nhà: nếu open() của phụ bản lỗi thì báo "Không mở được…", không báo nhầm "đang tạm khoá".
- Vẽ lỗi: tự về Làng 1 và đặt lại toạ độ/điểm chạm (trước đây giữ trạng thái cũ).
- Biển chữ Hán trên nhà: vẽ lại sprite khi font tải xong (trước đây có thể kẹt font dự phòng).
- Hồ lô Đan Phòng không còn đè lên đèn lồng của game; đèn lồng treo sát mái; tinh thể đỉnh Tuyết Ngục thấp hơn để không chạm mũi tên ▼ của nhãn; chữ 骨 rõ hơn.
- Tên cổng "Về Làng Tân Thủ": màn thấp thì đặt dưới cổng, không bị cắt mép trên.
- Nhẹ hơn: tuyết rơi bỏ save/translate/rotate từng bông; đèn trời bỏ 6 gradient mỗi khung hình.
