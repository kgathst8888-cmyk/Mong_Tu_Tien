# Fix388 — Hội Chiến Boss: sửa boss không chết · 2 rương · lịch 12h/15h/20h · Bùa Chống Rơi

**CẦN CHẠY LẠI `hoi_chien_boss.sql`** trên Supabase (chạy lại an toàn) — lịch, 2 rương và phần thưởng đều do máy chủ quyết định.

## Sửa lỗi
- Boss hết máu nhưng không chết: máu cục bộ bị chặn ở 1 nên phần sát thương cuối (<1 đơn vị) không bao giờ được báo lên máy chủ → máy chủ kẹt ~99,99x%. Nay khi máu cục bộ chạm đáy, máy khách báo nốt phần còn lại (`track()`), và máy chủ coi sót < 0,002% là đã hạ.

## Lịch
- Chỉ mở lúc **12:00 · 15:00 · 20:00** (giờ VN). Hàm `hcb_cur()` (SQL) và `slotInfo()` (JS) dùng chung công thức; số `ev` vẫn tăng dần, không đụng dữ liệu cũ.

## Rương
- Mỗi người mở tối đa **2 rương** (`hcb_k('per_p')` + `CF.perP`). Bảng mới `hcb_open` ghi từng rương đã mở.
- Mỗi rương: 1 trang bị Thiên Thần (cố định) + **2 phần thưởng ngẫu nhiên khác loại** (hàm `hcb_roll`): 🔒 LT khoá 10–50 · Đá cấp 1 hoặc 2 (x1–2) · 💰 2–10 triệu · 🪽 Mảnh Cánh Cấp 4 (5%, x1) · 🪽 Long Vũ Thiên Dực (5%, x1; đã có thì đổi 10 triệu vàng) · 🛡 Bùa Chống Rơi (2%, x1). Ba loại đầu chia đều phần còn lại.
- Số rương vẫn là 20 (`hcb_k('chests')` + `CF.chests`).

## Bùa Chống Rơi
- Lưu ở `PS[cur].csh.bcr`. Cường hoá **+10→+11** thất bại → về **+10** (không về +7/+0), ưu tiên hơn Định Hồn; chỉ mất 1 bùa khi thất bại.

## File đã sửa
world/94-hoi-chien-boss.js · world/38-da-cuong-hoa.js · hoi_chien_boss.sql · index.html (?v=388)
