# Sửa: cung thủ chạy lùi, quay lưng vào quái (core/01-engine.js, bước di chuyển tự động)
- Hệ bắn xa (cung thủ, pháp sư) tự lùi khi quái vào quá gần. Trước đây lúc lùi nhân vật quay mặt theo hướng chạy (P.d=dir) → quay lưng vào quái.
- Nay ở chế độ tự động, khi đang lùi ra xa mục tiêu thì mặt vẫn hướng về quái (P.d=-dir). Điều khiển tay và lúc tiến tới/đứng bắn giữ nguyên.
