# Fix196 — Auto dùng đủ kỹ năng ở Tiên Giới · nâng thanh máu/mana · bay lướt mượt

1. **Auto không tung kỹ năng** — `world/87`: trước chỉ tung nhóm môn phái (`s0-s4`); nay tung cả ý cảnh (`y`), đạo thể (`f`), linh căn (`l`) của cột nút `#tg8-sk`. Mỗi nhóm 1 chiêu/lượt, tối đa `TGAUTO_CF.perTick` (3) chiêu/lượt. Hướng nhân vật được trả lại sau khi tung (quay mượt, không giật).
2. **Thanh máu/mana che nhân vật** — module mới `world/91-bang-ten-nang.js`: nâng thanh + tên lên đúng bằng độ bay thực tế. Tắt: `TAGUP_CF.enable=false`; chỉnh `TAGUP_CF.pad/padTG`.
3. **Dáng bay** — Fix197: bay như pháp sư, thân đứng thẳng, không nghiêng, không lắc tà áo, không tàn ảnh; chỉ lơ lửng lên xuống nhẹ (world/73 + world/74).

File đổi: `world/87`, `world/74`, `world/73` (+getter `VPG.state`), `world/91` (mới), `index.html`, `MODULE_MANIFEST.json`.

## Fix198 — Quay theo hướng chiêu + vũ khí vung theo kỹ năng (Tiên Giới)
`world/87`: mọi chiêu (bấm tay hoặc auto) đặt hướng chiêu cho `VPG8.state` (ca/cf). `world/74`: trong 30 khung sau chiêu người quay mượt về hướng đó; ghi nhịp vung (`s0`) khi `P.atk` tăng, truyền `at` cho vũ khí. `world/75`: mọi tư thế vũ khí cầm tay giơ lên → chém → thu về; pháp bảo lơ lửng phóng to, sáng và xoay nhanh khi tung chiêu.

## Fix199 — Xoay người mượt
`world/74`: khi bay, đổi tư thế/hướng không còn lật đột ngột: thân thu hẹp bề ngang rồi mở ra ở tư thế mới (~14 khung, `VPG8_CF.turn`). Đi bộ giữ hoà mờ cũ.

## Fix200 — Hiệu ứng kỹ năng 6 phái chậm lại
`world/79`: thời lượng mọi hiệu ứng chiêu ×`TG8SK_CF.slow` (mặc định 1,7; 1 = như cũ); `TG8SK_CF.max` nâng 10→14 vì hiệu ứng tồn tại lâu hơn.

## Fix201 — Mỗi lần chỉ 1-2 hiệu ứng chiêu
`TG8SK_CF.max`=2 (tối đa 2 hiệu ứng cùng lúc, chiêu tay mới nhất thay chiêu cũ nhất); auto chỉ tung 1 chiêu/lượt và chờ khi đã đủ 2 hiệu ứng (`TGAUTO_CF.perTick`=1).

## Fix202 — Xoay 8 hướng liên tục (bỏ kiểu lật hình)
`world/74`: khi bay, hình nhân vật = pha trộn 2 góc nhìn chính kề nhau (mặt trước · bên · lưng) theo góc nhìn thật `VPG8.state.ang` (đã làm mượt) + co nhẹ bề ngang giữa chừng; không còn đổi tư thế/lật đột ngột. Vũ khí chỉ vẽ theo góc nhìn gần hơn (không bị nhân đôi).
