# Fix267 — Avatar, Khung viền, Danh hiệu (world/51b-ho-so-avatar-danh-hieu.js)

Nạp ngay sau world/51 (trước 91/92/96 để vị trí danh hiệu tự theo độ bay, cưỡi thú, lề đường...). Gỡ = xoá thẻ script + hoàn lại systems/28-chat.js.

## Cách dùng
- Mở bảng: nút 🎭 ở tab 🎒 Túi (góc dưới-trái khung nhân vật) hoặc nút 🎭 trên đầu box 💬 Chat. Có 3 tab: Avatar · Khung · Danh hiệu. Chạm mục đã mở khoá để đeo.
- Lưu theo từng nhân vật: `PS[cur].pf = {av, fr, tt, own:{a:[],f:[],t:[]}}` (đi cùng save/cloud save).

## Chat
- Mỗi tin hiện avatar + khung + danh hiệu (màu) + tên. Tin cũ (không có mã) hiện chữ cái đầu của tên.
- Mã hồ sơ `⟦avatar.khung.danhhieu⟧` (tối đa 10 ký tự) gắn đầu tin nhắn → KHÔNG cần sửa SQL. Vì vậy MAXLEN chat giảm 120 → 110 (server vẫn cắt ở 120).

## Danh hiệu
- Vẽ trên đầu nhân vật, phía TRÊN dòng "Tên · Cảnh giới" (bọc nameTag). Độ hiếm ≥3 có quầng sáng.
- Thuộc tính riêng: cộng qua `twB` → `SX` (hpp, dmgp, crit, cdmg, dred, sdmg, eres, goldp...). Bảng chỉ số nhân vật tự hiện.
- Chưa mở khoá mà đang đeo (vd bị reset) → tự coi như không đeo, không cộng chỉ số.

## Mở khoá & thêm mục
- Mục có `lv:N` → tự mở khi cấp độ ≥ N. Mục có `g:1` → chỉ mở khi `PFD.grant('t'|'a'|'f', id)` (sự kiện, shop, admin).
- Danh mục AV / FR / TT nằm đầu file module — thêm 1 dòng là có mục mới (id số, ≤ 99, KHÔNG đổi id cũ vì chat dùng id).
- Avatar hiện dùng emoji (chưa hỗ trợ ảnh riêng; sẽ mở rộng khi có file ảnh).
- Thử nghiệm: `PFD.unlockAll()` trong console mở hết cho nhân vật hiện tại.

## Chỉnh
`PFD_CF.enable` (bật/tắt vẽ danh hiệu) · `.gap` (khoảng cách trên tên) · `.k` (cỡ chữ) · `.size.bt` (cỡ nút ở Túi).

## Fix268 — Danh hiệu hiện cho người chơi khác ở làng online
- Danh hiệu đang đeo gửi kèm mỗi lượt `vp_ping` (tham số mới `p_tt`), người khác nhận về trong danh sách và vẽ phía TRÊN nhãn "Lv.x Tên" của nhân vật đó (world/41-lang-online.js → `PFD.drawTT`).
- Nhãn so le tự rộng hơn khi có danh hiệu; bong bóng emoji tự nâng lên.
- **Phải chạy lại `village_presence.sql` 1 lần trong Supabase** (thêm cột `tt`, thay hàm `vp_ping`). Chưa chạy: game tự lùi về bản cũ (không gửi danh hiệu), làng online vẫn hoạt động bình thường.
- Chỉ dùng id danh hiệu (0-99), không gửi chữ; máy khách nào chưa biết id đó thì không vẽ gì.

## Fix269 — Danh hiệu hiện ở Thành Thị Linh Giới + Tiên Giới online
- Cùng cách với làng: `cp_ping` nhận thêm `p_tt`, trả về `tt` của người khác; world/77-thanh-online.js vẽ danh hiệu phía TRÊN nhãn "Lv.x Tên" (cả Linh Giới lẫn Thành Tiên Giới), nhãn so le tự giãn, bong bóng emoji và vùng chạm thẻ hồ sơ tự nâng lên.
- **Chạy lại `thanh_online.sql` 1 lần** (thêm cột `tt`, thay `cp_ping`). Chưa chạy → game tự lùi về bản cũ, thành online vẫn chạy bình thường.
