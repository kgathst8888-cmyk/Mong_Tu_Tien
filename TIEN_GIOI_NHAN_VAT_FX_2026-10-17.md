# Fix186 — Thành Tiên Giới hiển thị đủ nhân vật + hiệu ứng kỹ năng mạnh hơn

File mới: `world/89-tien-gioi-nhan-vat-fx.js` (nạp sau world/88). Chỉ khi TG.on() và là chính mình.
- Thú nuôi: bước epstep() 1 lần/khung (E tạm rỗng) → có hoạt ảnh, đi/bay theo.
- Hiệu ứng nhân vật: gọi ZC.aura() (aura cảnh giới; Đạo Thể: trận pháp + luyện hư world/46) bằng cách tạm vil=false rồi trả lại.
- Pháp bảo bổn mệnh: FABAO.ghost() với trạng thái bay riêng (lơ lửng cạnh người, có vệt đuôi).
Vá nhỏ: world/61 heroDraw (+2 hook TGCH.pet / TGCH.pre, bọc try), index.html (+1 script), MODULE_MANIFEST.json.
world/88: thêm `TGFXU_CF.power` (mặc định 1.25 = cỡ hiệu ứng) và kén năng lượng quanh nhân vật khi tung chiêu lớn.
Chỉnh: `TGCH_CF.enable=false` tắt · `TGCH_CF.pet/aura/fabao=false` tắt riêng từng phần.

## Fix187 — Aura tu tiên xoay 8 hướng
`world/89` thêm `cult8()`: vẽ lại aura tu tiên (cột sáng, hào quang, cánh sáng, vòng trận) theo hướng 8 chiều của nhân vật (đọc `VPG8.state.ang` của world/74). Hiện cả khi đã chọn môn phái.
- Vòng trận dưới chân dẹt 2:1, có cung + mũi tên chỉ hướng, chữ cảnh giới quay.
- Hào quang mỏng lại khi nhìn ngang; cánh sáng (cảnh giới ≥ 4) xoè 2 bên khi nhìn thẳng/lưng, gập ra sau lưng khi quay ngang.
- Đạo Thể vẫn dùng aura của world/46. Tắt riêng: `TGCH_CF.cult8=false` (về aura gốc, không xoay).
