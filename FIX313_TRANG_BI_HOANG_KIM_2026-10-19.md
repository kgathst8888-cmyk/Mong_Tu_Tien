# Fix313 — Trang Bị Hoàng Kim (chế tạo cấp 1 + bộ 2/3/4 món)
- Module mới: `ui/101-trang-bi-hoang-kim.js` (window.HKG), nạp sau world/102 trong index.html (?v=313). Icon 4 món cắt từ ảnh người dùng (base64 WebP trong module).
- 4 món: Mão (Long Quan) · Kiếm · Nhẫn · Dây chuyền → nằm trong 4 ô Hoàng Kim của tab Túi (ui/100).
- Chế tạo: chạm 🏠 Nhà Trang Sức Hoàng Kim (Làng Tân Thủ 2) → chọn món → chọn 10 trang bị Thiên Thần (không tính đồ thú nuôi, đồ khoá c) + 1.000💎 (LT.spend, cần đăng nhập) → 50%. Thất bại mất cả nguyên liệu lẫn Linh Thạch. Mỗi ô chỉ chế 1 món (CF.maxMake=1). Nâng cấp 2→10: cập nhật sau.
- Dùng được khi Lv60+. Cấp 1: +2% Công/Thủ/Máu, +1000 Năng lượng (cộng phẳng).
- Bộ (đếm món CÙNG cấp): 2 món +20% ST kỹ năng (+5%/cấp) · 3 món thần thông 1% (+1%/cấp) gây ×3 · 4 món 🌍 Địa Tiên tự tung mỗi 8s (CF.dtCd): 100% Công (+30%/cấp) lên số địch = cấp (tối đa 10), bỏ qua 30% giáp.
- Lưu: PS[cur].hkg = {s:[null|{l,t}×4]} theo từng nhân vật. Móc: ZC.pa/pd/ph/pm, dm() (SKF=1), ZC.tick, HK.open, TT2.houses[1].open.
- Thử nhanh: `HKG.give(0,1)` … `HKG.give(3,1)` trong console để nhận 4 món. Gỡ = xoá thẻ script ui/101.
- Fix314: icon 4 món dựng lại 224px từ kênh trong suốt gốc của ảnh (không viền/halo), WebP q94 + làm nét nhẹ.
