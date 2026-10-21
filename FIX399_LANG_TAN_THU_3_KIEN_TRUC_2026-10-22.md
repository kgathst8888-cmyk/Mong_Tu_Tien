# Fix399 — Thiết kế lại Làng Tân Thủ 3 (phong cảnh + kiến trúc từng nhà), Nhà 5 = Nhà Tinh Luyện
Chỉ sửa world/102-lang-tan-thu-3.js (+ index.html: ?v=399). Không đổi logic vào/ra làng, vị trí nhà, cổng, khoá, các phụ bản 109/110/111/116/130.
- Nhận diện nhà theo chữ trên biển do từng phụ bản đặt (styleOf): 雪 Tuyết Ngục (nhà 1) · 煉 Tinh Luyện Pháp Bảo (nhà 2) · 丹 Đan Phòng (nhà 3) · 骨 Cốt Hải (nhà 4) · 鍛 Nhà Tinh Luyện Thánh Khí (nhà 5, world/130). Nhà chưa gắn phụ bản = nhà hoang bị xích.
- Nhà 5 (鍛): lò đúc đá bazan, đai sắt viền cam, miệng lò nóng chảy + dòng kim loại chảy xuống bậc thang, giá vũ khí, giá giáp thánh khí, bánh răng + biển 鍛, mái dốc đá phiến, 3 ống khói (khói, đốm lửa).
- Các nhà khác: Tuyết Ngục = pháo đài băng · Tinh Luyện Pháp Bảo = tháp tím có lò, đe, vạc · Đan Phòng = tháp ngọc lục, đan lô, giàn thảo dược · Cốt Hải = đền xương sa thạch.
- Phong cảnh: cực quang, trăng đỏ, núi tuyết, chùa xa, sương, 2 lớp rừng thông, tường viện + ô cửa trăng, mai nở, đèn đá, đường lát đá có hoạ tiết. Hiệu ứng động tắt khi QL>=2.
- Nhà vẽ sẵn thành sprite (cache theo kích thước/màu/trạng thái khoá). Chỉnh: WIN, buildHouse/fort/pagoda/bone/smithy/mansion, paintBG.
