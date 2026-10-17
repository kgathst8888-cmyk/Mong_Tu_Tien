# Fix196 — Auto dùng đủ kỹ năng ở Tiên Giới · nâng thanh máu/mana · bay lướt mượt

1. **Auto không tung kỹ năng** — `world/87`: trước chỉ tung nhóm môn phái (`s0-s4`); nay tung cả ý cảnh (`y`), đạo thể (`f`), linh căn (`l`) của cột nút `#tg8-sk`. Mỗi nhóm 1 chiêu/lượt, tối đa `TGAUTO_CF.perTick` (3) chiêu/lượt. Hướng nhân vật được trả lại sau khi tung (quay mượt, không giật).
2. **Thanh máu/mana che nhân vật** — module mới `world/91-bang-ten-nang.js`: nâng thanh + tên lên đúng bằng độ bay thực tế. Tắt: `TAGUP_CF.enable=false`; chỉnh `TAGUP_CF.pad/padTG`.
3. **Dáng bay** — Fix197: bay như pháp sư, thân đứng thẳng, không nghiêng, không lắc tà áo, không tàn ảnh; chỉ lơ lửng lên xuống nhẹ (world/73 + world/74).

File đổi: `world/87`, `world/74`, `world/73` (+getter `VPG.state`), `world/91` (mới), `index.html`, `MODULE_MANIFEST.json`.
