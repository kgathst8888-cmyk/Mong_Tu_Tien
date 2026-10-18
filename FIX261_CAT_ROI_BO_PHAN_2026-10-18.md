# Fix261 — cắt rời bộ phận nhân vật (đầu · thân · chân/áo dưới · cẳng tay) cho 6 môn phái (2026-10-18)

Nâng cấp world/93-mon-phai-tay.js (Fix238/239: luôn cầm vũ khí trong tay + vung mạnh) từ "thân 1 tấm" thành **hoạt hình cắt rời**:
- Mỗi khung ảnh vẽ MP8 được tách lúc chạy bằng mặt nạ mờ thành 3 lớp: **chân/áo dưới** · **thân** (kèm tay buông) · **đầu**, cộng **cẳng tay** + vũ khí đã có. Đường nối được làm mờ chồng lên nhau nên không lộ khe khi xoay nhẹ.
- Mỗi phần chuyển động riêng quanh khớp: thân ngả/xoắn quanh **eo**, đầu quay/gật quanh **cổ** (ngược chiều thân để vẫn nhìn mục tiêu), chân/áo dưới nhún + trượt khi lao; có thở, lắc người khi đi, nhịp bay khi `hv`.
- Tay + vũ khí gắn trên thân nên đi theo thân ngả.
- Hook ở world/74 (Tiên Giới) và world/73 (bản đồ 2D): hàm vẽ 26 dải sóng được bọc thành `DS(canvas)` và gọi qua `MPAR.parts` + `MPAR.eachPart` (lỗi → vẽ 1 tấm như cũ).
- Tắt/chỉnh: `MPAR_CF.rig=false` (về thân 1 tấm), `MPAR_CF.power` (độ mạnh lao/ngả), `MPAR_CF.always`, `MPAR_CF.trail`, `MPAR_CF.enable`.
