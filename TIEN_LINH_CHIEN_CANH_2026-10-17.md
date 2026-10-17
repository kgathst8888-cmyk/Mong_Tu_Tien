# ⚔️ Tiên Linh Chiến Cảnh — bản đồ quái theo cấp của Tiên Nhân (Fix176)

Cổng nằm ở quảng trường Thành Thị Tiên Giới (SPOT `warp`, phía nam, hơi lệch về sau nhân vật lúc vào). **Chỉ Tiên Nhân** (`CTHE.on()`) mới vào được; người khác chạm cổng chỉ thấy thẻ "Chỉ Tiên Nhân". Cổng tự mở/khoá mỗi giây.

## Quái (dựa trên quái Tiên Giới Lv1-20 của world/81)
| Mục | Giá trị |
|---|---|
| Cấp | cấp nhân vật ± `lvSpread` (2), tối thiểu 1 |
| Chỉ số gốc | bản đồ Đạo Thể theo cấp (`LGMAP.cfg`): Lv1-20 → map 2, 21-40 → 3, 41-60 → 4, 61+ → 5 |
| Máu | `hpn × hpK` = **×50** quái Đạo Thể |
| Sức đánh | hệ số `(1+0,35m)·at` **×50** (trước khi trừ giáp) |
| Thủ | `dfK` = ×1 (giữ nguyên; ×50 thủ làm quái gần như bất tử) |
| EXP | `round(15(1+Lv/5)) × killMul × expMap × expK` = **×5** quái Đạo Thể (qua `TGQ.addXp`) |
| Rơi đồ | không |

Ví dụ Lv15: Đạo Thể 3e5 máu / 90 EXP → chiến cảnh 15.000.000 máu / 450 EXP.

## 8 hướng
Quái chỉ có 8 hướng màn hình (E, SE, S, SW, W, NW, N, NE). Mỗi 5 khung quay 1 nấc 45°, đi theo hướng đang quay, đuổi người chơi bằng cách chọn hướng gần nhất; khi đánh thì quay hẳn về phía nhân vật. Hình quái là tranh nhìn ngang nên 8 hướng được dựng bằng lật trái/phải, co chiều ngang, phủ tối khi quay lưng (N/NE/NW) và vòng dưới chân có múi sáng chỉ hướng mặt.

## Khác
- Đảo `war` (world/61) xa thành thị, cùng hệ toạ độ → hero 8 hướng, cánh, nút kỹ năng và sát thương thật của world/79 + 81 dùng nguyên vẹn; hiệu ứng trúng đòn của world/82-fx-pro cũng áp dụng.
- Cổng về `warpback` (phía bắc đảo); quanh cổng (`safeR`) quái không đuổi. Nút 🏘 Làng trong chiến cảnh = về thành thị. Bại trận → hồi sinh ở cổng về với 50% HP/MP.
- Cổng ở thành thị mờ đi khi nhân vật đứng phía sau nó.

## File thay đổi
`world/84-tien-gioi-chien-canh.js` (mới, nạp sau 81) · `world/61-tien-gioi-thanh.js` (đảo `war`, 2 cổng `wargate`, nền rune, mây, nodes đường đi) · `world/81-tien-gioi-quai.js` (móc `TGQ.ext`, xuất `pr/hurt/ft/say/ftHero/uid/lvUp`, `m.xp` riêng, hồi máu ngoài thành chỉ khi không ở chiến cảnh) · `index.html` · `MODULE_MANIFEST.json`.

## Chỉnh / tắt
`TGQA_CF`: `enable, hpK, atkK, dfK, expK, max, lvSpread, spawnEvery, aggro, safeR, turnFr, speed, size`. Tắt: `TGQA_CF.enable=false` hoặc bỏ `<script>`. API: `window.TGQA`.

## Lưu ý cân bằng
Sức đánh ×50 rất đau: nhân vật thử Lv15 (2.366 máu) bị một đòn quái giết ngay. Nếu cần dễ chơi hơn, hạ `TGQA_CF.atkK`.
