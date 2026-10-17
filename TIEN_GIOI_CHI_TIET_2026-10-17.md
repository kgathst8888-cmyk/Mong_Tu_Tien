# Bản đồ Tiên Giới chi tiết — world/90-tien-gioi-chi-tiet.js (Fix190)

Module riêng, nạp sau world/89. Gỡ = xoá thẻ script trong index.html, map về như cũ.

## Móc thêm vào world/61-tien-gioi-thanh.js (rất nhỏ, đều bọc try/catch, lỗi in console 'TGD')
- `blocked()` → `TGD.blk(x,y)` (nhà + ao chặn đường đi; quái bay cũng bị chặn theo)
- `islSpr()` → `TGD.ground(...)` vẽ chi tiết mặt đảo (chỉ 9 đảo: arr, wst, est, pal, nw, ne, fe, fw, nn; đảo chiến cảnh `war` không đụng)
- `sc()` → `TGD.avoid` (tắt rải cây ngẫu nhiên cũ, module tự bố trí)
- `buildDraw()` → `TGD.build` · `decSpr()` → `TGD.dec` · `drawTG()` → `TGD.under` / `TGD.fx`
- `CTX()` + `TG.ctx` để module lấy các hàm vẽ riêng của world/61

## Nội dung
- Đường: đá cuội ở vườn, đá phiến viền vàng ở quảng trường/sân thượng, thảm đỏ hoa văn, sân hoa văn bát quái + sen
- Nhà tiên gia: 6 căn (vườn Tây 1, vườn Đông 2, sân thượng 2, đảo phụ Đông-Nam 1), có ống khói, cửa sổ sáng, đèn lồng
- Cây: tùng, anh đào, đào tiên (quả vàng), phong, bạch quả, liễu, trúc, linh thụ, bụi hoa, cỏ, nấm phát sáng, đá rêu
- Ao sen 3 cái (cá chép, sen, lá sen), luống hoa, bồn cây, giếng, sư tử đá, bia, cờ, hàng rào, rơm, hạc
- Hiệu ứng nhẹ (tự tắt ở QL cao): sóng ao, khói bếp, quầng sáng cửa sổ/đèn, đom đóm

## Chỉnh bố cục
Đầu file: `HOUSES`, `PONDS`, `ROADS`, `MED`, `BEDS`, `RINGS`, `PL` (vật thể: [loại,x,y,biến thể]), `AROUND` (đảo phụ).
Kiểm tra đi được: mọi cửa công trình vẫn tới được (BFS), `TGD.dropped()` liệt kê vật thể rơi ngoài đảo (hiện rỗng).

## Fix191 — ngã tư cầu liền mạch (world/61)
- BRG: nhánh Tây/Đông trước lệch nhau 2 ô (y 22.9–25.1 vs 20.9–23.1) → nay cùng dải y 22–24.2, chạm đúng mép cầu chính; thêm mảnh mặt cầu `patch` ở ô giao (hoa văn sen + bát quái).
- Màu mặt cầu + vạch ván dùng chung hệ toạ độ thế giới nên 3 cầu khớp nhau; tường vòm cầu chính chừa trống chỗ giao.
- Cột lan can: dừng sát ô giao, 4 cột góc có đèn; lan can nối theo `pv` (cột liền trước cùng đoạn) thay vì cố định 1.6 ô.
