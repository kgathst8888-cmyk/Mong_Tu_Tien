# Lỗi: cung thủ quay ngược hướng khi di chuyển/bắn ở Đạo Cảnh (đã sửa)

**Triệu chứng:** sau khi Hợp Đạo (Đạo Cảnh / Đạo Thể), nhân vật Cung thủ có thân, mặt, chân quay ngược chiều với tay cầm cung và hướng di chuyển.
**Nguyên nhân:** `equipment/51-dao-the-outfit.js` thay ngoại hình bằng bộ trang phục Đạo Thể. Ở hệ Cung thủ (RS[2]) ảnh thân+đầu, giáp vai và 2 chân nghiêng ngược so với bộ xương RIGD của engine (tay/cung vẫn đúng hướng). Hướng `P.d` và logic di chuyển/lùi không sai (đã kiểm tra bằng mô phỏng 500 khung: mặt luôn hướng về quái).
**Cách sửa (patch nhỏ, chỉ trong module 51):** lật ngang 4 mảnh `base`, `sh`, `LL`, `LR` của Cung thủ một lần lúc nạp, giữ nguyên toạ độ. Chiến binh/Pháp sư, trang phục thường, Làng Online và Đấu Trường không đổi.
**Tắt sửa lỗi nếu cần:** đặt `window.DAOTHE_OUTFIT={flipArcher:false}` trước khi nạp module 51.
**Kiểm tra:** `python3 tools/check.py --run` → OK, không lỗi script.
