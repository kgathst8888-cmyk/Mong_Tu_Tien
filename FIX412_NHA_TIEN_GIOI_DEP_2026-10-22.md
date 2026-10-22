# Fix412 — Nâng cấp nhà / mái / hoa văn bản đồ Tiên Giới

Module mới: `world/133-tien-gioi-nha-dep.js` (nạp ngay sau `world/90-tien-gioi-chi-tiet.js`, thẻ `?v=412` trong index.html).
Chỉ VẼ — không đổi va chạm, vị trí, đường đi, logic game. Sprite dựng 1 lần rồi cache (C.spr) nên không tốn FPS.

## Có gì mới
- **Mái (`TGD.roof`)** — dùng chung cho nhà tiên gia, đại điện, đình, tháp:
  4 góc mái cong vút (phi thiềm) + chuông gió vàng; sống mái có đầu xi vẫn (mái vuông: hồ lô vàng);
  gờ mái có thú vật (tẩu thú); ngói âm dương song song + hàng ngói; ngói đầu mái hình đĩa vàng;
  vì kèo đỏ có đầu đinh + vệt bóng dưới mái. Nhà tranh: mái rơm + xà gỗ.
- **Tường (`TGD.walls`)** — đại điện/tháp: cột son có vòng vàng, chân tường xây đá, xà ngang vẽ màu có
  hoa văn thoi vàng + như ý, đấu củng, cửa sổ lưới / nguyệt môn / bát giác, chậu hoa treo, cửa đinh vàng + biển hiệu.
- **Bệ đá (`TGD.base`)** — chạm hình thoi, bậc thềm giữa, 3 cọc lan can đầu sen.
- **Nhà tiên gia (`TGD.dec('cot')`)** — thay hẳn 6 căn: bệ 2 tầng + bậc thềm trước cửa, trụ góc 3D, tường cao hơn,
  đèn lồng treo mái 2 bên cửa, ống khói có nắp.

## Móc vào file cũ (rất nhỏ, bọc try/catch, lỗi in console 'TGD')
- `world/61-tien-gioi-thanh.js`: đầu `roof()` → `TGD.roof`, đầu `walls()` → `TGD.walls`, `hallB()`/`pavB()` → `TGD.base`.
- Gỡ module = xoá thẻ `<script src="world/133-...">` trong index.html → map về như Fix411 (hook tự bỏ qua).

## Chỉnh
Đầu `cottage()`: `H` (cao tường), `roof(...)` đối số rise/ov. Trong `roof()`: `ext` (độ vươn góc), `lift` (độ cong lên).
`BEAM` = bảng màu xà ngang theo từng căn.
