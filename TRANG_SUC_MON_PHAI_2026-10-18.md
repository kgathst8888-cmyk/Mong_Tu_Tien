# Fix245 — Ô trang sức môn phái + bí kíp luyện thể (ui/95-trang-suc-mon-phai.js)

Module riêng, nạp sau world/98 (bọc `ui()`, chèn ô vào khung nhân vật `.eqd .chp` ở tab 🎒 Túi). Gỡ = xoá thẻ script trong index.html.

- BÊN PHẢI nhân vật: 4 ô trang sức môn phái. Chưa chọn môn phái (Vạn Pháp Tháp, Tiên Giới) → khoá 🔒. Chạm vào → bảng bộ 4 món.
- BÊN TRÁI nhân vật: 1 ô 📖 Bí kíp luyện thể (đang khoá, cập nhật sau).
- Điều kiện mở: `VPD.sect()` khác rỗng (fallback `VP.get()`).

## Cập nhật sau (đã chừa móc)
- `TSM.items['umt'|'hbd'|...] = [{n,ic,d} ×4]` → bảng tự hiện món thật.
- `TSM.setBonus[idMon] = 'hiệu ứng đủ 4 món'`.
- `TSM.bikip = {n,ic,d}` → ô bí kíp hết khoá.
- `TSM.cell` đổi cỡ ô (mặc định 34px).
