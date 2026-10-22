# Fix421 — Thôn Tân Thủ: chi tiết 5 toà nhà (world/135)
Thêm world/135-thon-tan-thu-nha-chi-tiet.js (nạp sau world/134, index ?v=421). world/134 chỉ thêm `TTD.h` (chia sẻ tiện ích). Không sửa world/56; không đổi vị trí/kích thước/chạm-để-vào/nhãn/lửa lò/cổng truyền tống.
- Chung: ngói loang (ngói thay mới, rêu, vệt mưa, mép sáng), búp bê đồng + chim sẻ trên nóc, đèn lồng dưới mái, dây leo + hoa ở cột, chậu cảnh hai bên bậc.
- Thợ Rèn: đá mài + máng nước, đống than, giá búa kìm, móng ngựa. Tạp Hóa: thùng rau củ, bao gạo, vại, rổ trái cây, chuỗi ớt/tỏi, cờ hiệu 茶.
- Hồi Phục: giàn phơi thuốc, nong tre, cối chày, vại thuốc, bó thuốc dưới mái. Nhiệm Vụ: đôi sư tử đá, trống lệnh, bức hoành đỏ, đèn lồng đôi.
- Bản Đồ: 8 quẻ quanh vòng cổng (nhấp nháy nhẹ), trụ đá có cầu, cây cảnh, đèn lồng xanh.
- Hiệu năng: mỗi nhà 1 sprite cache theo (s,k,DPR,font); mỗi khung chỉ drawImage + vài nét động (tắt khi QL>=2 hoặc TTN.fx=false).
- Tắt/bật: window.TTN.on=false (về hình world/56); lỗi vẽ 3 lần tự tắt; TTN.rebuild() dựng lại.
- Chỉnh: hàm bForge/bShop/bHerb/bHall/bPortal (đồ vật từng nhà), roofDetail (mái).
