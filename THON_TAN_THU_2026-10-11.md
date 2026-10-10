# Thôn Tân Thủ — vẽ lại phong cách cổ trang Trung Hoa (world/56-thon-tan-thu.js)
Chỉ thay HÌNH VẼ của làng; không đổi logic, toạ độ, tương tác. Hook: xbg(gy,-1) (nền), bld(i) (5 toà nhà), vdraw (lớp cánh hoa/đom đóm phía trước).
- Nền: trời hoàng hôn + mặt trời có quầng/tia, 3 lớp núi mực (nét cọ, chùa tháp, đình, thác), đảo bay, làng xa, đào/liễu/trúc/tùng, đường đá lát nhiều tông + rêu/nứt, đèn đá giữa các toà, 2 cổng tam quan hai bên ("新手村", "仙緣", câu đối), dây đèn lồng + cờ đuôi nheo.
- 5 toà nhà (theo bxx(i)/bww()): Thợ Rèn 鍛 (lò rèn, đe, giá binh khí, ống khói), Tạp Hóa 貨 (quầy, chum vại, cờ hiệu), Hồi Phục 藥 (tủ thuốc, đỉnh luyện, hồ lô), Nhiệm Vụ 令 (cửa son đinh vàng, sư tử đá, trống, bảng cáo thị), Bản Đồ (cổng trăng + cổng truyền tống xoáy, rồng quấn cột). Mái cong ngói vảy, đấu củng, nóc có thú đầu.
- Động: mây xiangyun trôi, hạc bay, thác lấp lánh, đèn lồng đung đưa + ánh sáng, lò rèn đỏ lửa + tia lửa + khói, hơi nước đỉnh thuốc, cờ phấp phới, cổng truyền tống xoáy, cánh hoa đào + đom đóm.
- Hiệu năng: phần tĩnh vẽ 1 lần vào canvas đệm theo (W,H,s,DPR,font) rồi drawImage; thử trong game thật: ngang mức làng cũ.
- Tắt/bật: window.TTT.on=false (về hình cũ); lỗi vẽ tự quay về hình cũ (sau 3 lần). window.TTT.rebuild() dựng lại đệm.
