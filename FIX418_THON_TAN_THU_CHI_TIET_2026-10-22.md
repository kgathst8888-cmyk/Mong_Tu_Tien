# Fix418 — Thôn Tân Thủ: thêm lớp chi tiết mặt đất & đồ vật (bớt đơn điệu)
Thêm world/134-thon-tan-thu-chi-tiet.js (+ index.html ?v=418, MODULE_MANIFEST). Không sửa world/56, không đổi logic/toạ độ nhà/cổng/camera/VDY.
- Đường lát đá phiến (so le, rêu ở khe, đá viền, cỏ lấn) đúng hàng nhân vật đi; lối đá từ cửa mỗi nhà ra đường; mảng đất/cỏ/vũng nước trên đường.
- Bãi cỏ trước đường: cỏ nhiều tông, cỏ cao, hoa dại 7 loại, cỏ ba lá, lá rụng, sỏi.
- Vật dụng: vườn rau + bù nhìn (giữa nhà 2–3), củi + rìu, bó rơm, ghế gỗ + xô nước + giỏ trái cây, biển chỉ đường, cột đèn lồng, đá.
- Màn hình dọc (đủ chỗ): ao sen đá viền + sen + lau sậy.
- Động (tắt khi window.QL>=2 hoặc TTD.fx=false): 4 con gà mổ thóc, 3 con bướm, cá chép + gợn nước, cánh hoa đào rơi, lấp lánh vũng nước.
- Hiệu năng: lớp tĩnh vẽ 1 lần vào canvas đệm (chỉ phần từ mép nhà xuống đáy), mỗi khung chỉ drawImage + vài nét động.
- Tắt/bật: window.TTD.on=false (về hình cũ của world/56); lỗi vẽ 3 lần tự tắt; TTD.rebuild() dựng lại.
- Chỉnh: paint() (bố cục/màu), dyn() (hiệu ứng động), hàm đồ vật (garden, scarecrow, woodpile, bench, pond...).
