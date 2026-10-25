# Fix427 — Tiên Giới: đêm sâu, bớt chói, thêm chi tiết ánh sáng

Module mới `world/134-tien-gioi-dem-sau.js` (nạp sau world/133, thẻ `?v=427`). Chỉ VẼ, không đổi logic/va chạm.

## Vì sao
Nền Tiên Giới quá sáng (đá trắng, cỏ, mây) nên che hiệu ứng nhân vật/kỹ năng.

## Đã làm
- `world/61`: bầu trời tối hơn (gradient + tinh vân), hook `TGD.grade` trong `spr()` (1 dòng, bọc try/catch).
- `TGD.grade` (module 134): mọi sprite tĩnh (đảo, cầu, nhà, cây, đá) được phủ xanh đêm + tối dần về chân đảo; đèn/nấm/tinh thể chỉ tối nhẹ. Dựng 1 lần rồi cache → không tốn FPS.
- `under()`: vũng sáng ấm trên mặt đất quanh đèn + trước cửa nhà, sương mù trôi quanh viền đảo, trăng/sao soi mặt ao, sao băng.
- `fx()`: đốm linh khí bay lên, vignette viền màn hình.
- `world/90`: export thêm `TGD.lights` (1 chữ).
- QL1 bớt hiệu ứng, QL2 chỉ còn chỉnh màu.

## Chỉnh độ tối
Đầu file 134: `GR={base:.47,spot:.42,cloud:.36,light:.12}` (tăng = tối hơn). Màu trời: hàm `skyCache()` trong world/61.
Gỡ: xoá thẻ script 134 (nền vẫn tối nhờ sky; sprite quay về màu cũ nếu cũng bỏ hook grade).
