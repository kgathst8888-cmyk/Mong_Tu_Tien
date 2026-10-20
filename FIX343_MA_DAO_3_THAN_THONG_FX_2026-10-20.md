# Fix343 — Hiệu ứng MMORPG cho CẢ 3 thần thông Ý Cảnh Ma Đạo (2 bản đồ) — làm trên v25

Chỉ thay phần VẼ. Không đổi: sát thương, MP, hồi chiêu, hút máu, trạng thái (world/50), AUTO, `TGQ.cast`, logic `YCTOC`.
Tiên Đạo (world/118–120) không bị đụng: mọi hook ở đây chỉ chạy khi Ma Đạo (`F.ma` / nhánh Ma Tộc của `fire`), Tiên Đạo đi nguyên đường cũ.

## Tệp mới (5) + sửa (3)
| Tệp | Chức năng |
|---|---|
| world/53b-ma-sat-phe-hon-fx.js | Bản đồ 2D · Ma Sát Phệ Hồn: pháp trận Thái Cực, nứt đất, sóng xung kích, bùa, bàn tay quỷ 18 nhịp/3s, sét, dấu trúng đòn, hút máu |
| world/53d-ma-dao-than-thong-fx.js | Bản đồ 2D · Dục Nương Huyết Chú (pháp trận ngũ giác huyết, 5 huyết chú bay đeo bám địch, vệt máu oán linh, vết chém) + Vạn Niệm Câu Hồn (pháp trận xoáy, xích treo từ hố đen, vòng hút, gai ma khí + sét). Vẽ THÊM lên hiệu ứng gốc (oán linh, hố đen, tia ma khí, quỷ xương giữ nguyên) |
| world/53c-ma-sat-phe-hon-tien-gioi-fx.js | Tiên Giới 2.5D · khung chung (hero() wrapper, bám TGQ.mon, hành lang đánh của world/81) + Ma Sát Phệ Hồn |
| world/53e-ma-dao-than-thong-tien-gioi-fx.js | Tiên Giới 2.5D · Dục Nương (huyết chú bay đeo quái, 6 oán linh quanh nhân vật) + Vạn Niệm (hố đen trên đầu, xích tới từng quái, gai nổ) — bọc `R.ycM`/`R.ycS` chỉ nhánh Ma Đạo |
| world/53-y-canh-ky-nang-toc.js (sửa) | xuất `YCFXLIB`; móc `MDFX.start/tick` (Ma Sát), `MDFX2.dn/dnHit/vn/vnHit` (Dục Nương, Vạn Niệm). Thiếu module → chạy hiệu ứng cũ |
| index.html (+4 thẻ script), MODULE_MANIFEST.json (+4 dòng) | 53b, 53d sau 53; 53c, 53e sau 88 (và trước 119) |

## Lỗi đã gặp & xử lý
- `globalAlpha` còn thấp sau lớp làm tối → quầng sáng/nứt đất mờ: trả alpha về 1 (53b, 53c).
- Nền thành thị Tiên Giới vẽ bên trong chuỗi `hero()` → lớp mặt đất vẽ sau chuỗi; nền sáng nên có lớp tím/đỏ sẫm bên dưới ánh sáng cộng.
- Ở Map Treo/2D `R.ycL/M/S` (world/83) vẽ thêm vệt cũ chồng hiệu ứng mới → nhánh Ma Đạo trả bản vẽ rỗng.

## Chỉnh / tắt
`MDFX.cfg` (Ma Sát 2D) · `MDFX2.cfg` (Dục Nương/Vạn Niệm 2D) · `MDTG.cfg` (Ma Sát Tiên Giới) · `MDTG2.cfg` (Dục Nương/Vạn Niệm Tiên Giới): `{q:0.35–1, enable:false → hiệu ứng cũ}`. Máy yếu tự giảm theo FXSLOW/light(). FX tự hết hạn (~2,5–3,4s).

## Đã kiểm (chạy game thật, Chromium headless / Playwright)
Không lỗi JS; 3 chiêu ở bản đồ 2D chạy; Tiên Giới: Ma Sát, Dục Nương, Vạn Niệm chạy ở Thành Thị (900×500, ma sát cả 390×760); ngoài thành bay đánh quái: Ma Sát và Vạn Niệm chạy, quái trong vùng nhận sát thương, MP trừ như cũ. Tiên Đạo vẫn cast bình thường. `tools/check.py`: 39 vấn đề = đúng bằng v25 gốc ("?v=" công cụ không bỏ).
Chưa kiểm: Dục Nương khi bay đánh quái ngoài thành (lần thử bị quái hạ nhân vật trước khi chụp được), FPS máy thật, boss, AUTO lâu, các hướng quay khác ngoài hướng Nam.
