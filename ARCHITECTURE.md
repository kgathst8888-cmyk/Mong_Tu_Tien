KIẾM TIÊN HOANG MẠC — MODULAR ARCHITECTURE v2

Mục tiêu: tổ chức code theo domain để khi thêm tính năng chỉ cần đọc/sửa phần liên quan, đồng thời giữ nguyên gameplay/runtime hiện tại.

NGUYÊN TẮC AN TOÀN
- Nội dung JavaScript gameplay được giữ nguyên byte-for-byte khi di chuyển file; chỉ đổi đường dẫn script trong index.html.
- Thứ tự load script giữ nguyên 00 → 18 để không thay đổi dependency runtime.
- Base64 được giữ riêng trong assets/game-assets.js; không inline lại vào gameplay.
- Không đổi save schema, global API, combat formulas hoặc UI behavior.

CẤU TRÚC
core/       engine + error handler
player/     reserved cho player/stat/cultivation mới; hiện chưa tách gameplay cũ để tránh rủi ro
combat/     status effects + enemy/combat extension
equipment/  equipment/cosmetics; nơi mở rộng item/equipment
world/      village, demon realm, tower, farming map, mining, boss
ui/         stats, icons, guide, tutorial, ranking/name
systems/    farming/alchemy, input guards, cloud save
assets/     Base64 payloads/images/fonts, tách khỏi gameplay

TẠI SAO player/ TRỐNG?
Core player logic hiện nằm trong core/01-engine.js. Tách tiếp bằng cách cắt nhỏ engine là rủi ro cao vì nhiều global/dependency cũ. Bản này ưu tiên 100% tương thích trước. Khi cần, có thể bóc từng hệ thống player thành module facade/hook nhỏ mà không rewrite engine.

QUY TẮC CHO AI
- Chỉ đọc module liên quan trực tiếp.
- Không đọc assets/game-assets.js nếu không thêm/sửa asset.
- Không rewrite file lớn.
- Không inline Base64.
- Ưu tiên thêm data/config hoặc module mới.
- Giữ thứ tự load và backward compatibility.

MAPPING MODULE CŨ → MỚI
00-module.js       -> core/00-error-handler.js
01-module.js       -> core/01-engine.js
02-module.js       -> world/02-demon-realm.js
03-module.js       -> world/03-village.js
04-module.js       -> ui/04-character-stats.js
05-module.js       -> world/05-demon-boss.js
06-module.js       -> ui/06-combat-icons.js
07-module.js       -> world/07-trial-tower.js
08-module.js       -> systems/08-farming-alchemy.js
09-module.js       -> systems/09-input-guard.js
10-module.js       -> world/10-farming-map.js
11-module.js       -> combat/11-status-effects.js
12-module.js       -> systems/12-cloud-save.js
13-module.js       -> world/13-mining.js
14-module.js       -> equipment/14-cosmetics-shop.js
15-module.js       -> ui/15-guide.js
16-module.js       -> ui/16-tutorial.js
17-module.js       -> ui/17-ranking-name.js
18-module.js       -> combat/18-enemies.js

## Chay game
- Windows: double-click `PLAY_GAME.bat`.
- macOS/Linux: chay `PLAY_GAME.command` neu Python 3 co san.
- Hoac mo `index.html` truc tiep trong Chrome/Edge.
- De test tot nhat, dung local server: `python -m http.server 8765`.


## Arena v4
- `systems/19-arena.js` dùng sprite nhân vật thật từ `RIGI` và weapon assets đã được engine load sẵn.
- Bộ skill lấy từ `CHR/PS` hiện tại; tên, icon, MP, cooldown và multiplier sát thương dùng trực tiếp từ skill data.
- Arena vẫn là PvE/local simulation; chưa phải server-authoritative PvP.
- Không inline Base64 và không sửa `assets/game-assets.js`.


## Arena v5 — Real Map Combat
- Đấu Trường không còn là battle log đứng yên. Khi vào trận, engine tạm chuyển canvas game sang Arena mode.
- Nhân vật người chơi dùng trực tiếp `hero()` của map, vì vậy sprite thân/tay/chân, vũ khí, cánh và animation đánh dùng cùng renderer với đánh quái.
- Skill người chơi đi qua `cast()`/`fire()`/`dm()` thật; các skill đặc biệt có dash/jump của engine được giữ nguyên.
- Arena thêm lướt/nhảy giữa các đòn để tạo chuyển động trên màn hình nhỏ; nút kỹ năng hiển thị skill thật của nhân vật hiện tại.
- Đối thủ cũng dùng `RIGI` + `WPI/WXI` thật, có chạy, nhảy, đánh và HP/MP.
- Arena vẫn local PvE, không phải server-authoritative PvP.
- Không chỉnh Base64/assets payload.


## Chu Tước (thay chim ưng) — pets/22-chu-tuoc.js
- Thú số 1 (trước là Ưng) nay là Chu Tước, 4 cấp tiến hoá, mỗi cấp một hình (assets/phoenix-assets.js, base64 webp tách riêng).
- Module `PHX` (pets/22-chu-tuoc.js) lo vẽ (lưới biến dạng vỗ cánh/đuôi), bay lượn, tấn công, kỹ năng theo cấp, hồi sinh Niết Bàn và điều kiện tiến hoá (khối `EVO`).
- Engine chỉ có 11 hook nhỏ trong core/01-engine.js (`typeof PHX!='undefined'`): pimg/pcol/peg, PB, giao diện Tab Thú, pev, epstep, drawEP, hiệu ứng PF và hồi sinh khi chết. Thêm `window.PFH` để module dùng lại hiệu ứng của ZS.
- Dữ liệu PT4[1]/PK[1]/PSK[1]/PTU[1] được module ghi đè lúc nạp, không sửa mảng gốc.

## Bản chạy trên Claude — Mong_Tu_Tien_CLAUDE.html
- File duy nhất, gộp toàn bộ script theo đúng thứ tự trong index.html (tạo bằng script ghép, không đổi mã nguồn).
- Chạy được khi mở trang trong Claude (hoặc mở thẳng trong trình duyệt). Tiến trình lưu trong localStorage của trình duyệt.
- Lưu mây (Supabase) cần gọi mạng ngoài nên không hoạt động trên trang Claude; các tính năng còn lại không ảnh hưởng.

## Cập nhật 2026-10-07 · Thú triệu hồi v2 + icon trang bị
- `pets/23-summon-beasts.js`: vẽ lại Sói Linh / Thạch Cự (golem) / Cổ Thụ bằng khung xương (IK): chân bước theo quãng đường, tay vung-đập-giơ, đầu/hàm/tai/đuôi/cành lá cử động. Chỉ đổi hiển thị, logic đánh vẫn ở `combat/18-enemies.js`. Chỉnh kích thước ở bảng `LOOK` (trường `z`).
- `ui/24-equip-icon-fit.js`: thu nhỏ icon trong ô trang bị đang mặc (biến CSS `--eq-cell`, `--eq-ico`, `--eq-tip`). Hình trong túi đồ giữ nguyên.
- Thứ tự load: sau `pets/22-chu-tuoc.js`. Bản HTML đơn (`Mong_Tu_Tien_CLAUDE.html`) đã nhúng sẵn 2 module này.
- `ui/25-pet-preview.js`: nhân vật dưới Lv20 (chưa chuyển chức) xem trước được tab 🐾 Thú (4 thần thú, tiến hoá, kỹ năng); chỉ xem, chưa chọn được. Bọc `petUI` gốc, không sửa engine.
- `ui/26-pet-evo4-lock.js`: khoá tiến hoá cấp 4 của cả 4 thú nuôi (cờ `LOCK_EV4`) cho tới khi cập nhật đủ; thú đã cấp 4 từ trước giữ nguyên.


## Boss Bất Tử hằng ngày — world/27-immortal-boss.js
- Nút 💀 "Boss Bất Tử" nằm ngay bên trái nút 🏆 Xếp hạng (đặt theo vị trí `#rkb` của ui/17-ranking-name.js).
- Mỗi ngày (giờ VN) một boss khác nhau theo thứ (bảng `BC.days`). Boss không thể bị hạ: mỗi nhịp module đo máu boss mất đi → cộng vào sát thương, rồi hồi đầy máu.
- Mỗi lượt `BC.secs` = 60 giây (hoặc tới khi gục / bấm Thoát). 3 lượt/ngày/nhân vật. Mỗi lượt nhận 💰 `BC.gold` = 500.000.
- Lượt sát thương cao nhất trong ngày lên bảng trên mây. Sang ngày mới, vào panel để nhận thưởng hạng hôm trước (bảng `RW`): Top1 = 2 Mảnh Thánh + rương (30% Thiên Thần / 70% Thần Thoại); Top2-3 = 5 Nguyệt Thạch + rương; Top4-10 = 2 Nguyệt Thạch + rương; còn lại = rương thường (mọi độ hiếm trừ Thánh).
- Máy chủ: chạy `boss_hang_ngay.sql` 1 lần trong Supabase (SQL Editor). RPC: boss_status / boss_begin / boss_end / boss_claim_ack. Máy chủ tự kiểm tra 3 lượt/ngày và chỉ nhận kết quả của lượt đang chờ (≤10 phút), trần 1e12 sát thương/lượt.
- Chưa đăng nhập ☁ hoặc chưa cài SQL: vẫn đánh được ở chế độ cục bộ (chỉ nhận vàng, không lên bảng).
- Engine chỉ thêm `HL.addSH(k)` (cộng Mảnh Thánh) trong core/01-engine.js. Module móc vào `dgTick/dgExit/init/dgHurt/dgHud/dgFoe` giống Tháp Thí Luyện; dữ liệu cục bộ lưu ở `PS[cur].bs`.
- Chỉnh độ khó/thưởng: khối hằng số `BC` và `RW` ở đầu file module.

## Đổi tên nút Hầm Ngục → "Phụ bản"
- Nút đáy màn hình 🕳 hiện chữ "Phụ bản" khi vào được (thay cho "Mở!"); phần đếm ngược giữ nguyên. Sửa trong `dgBtn()` (core/01-engine.js), index.html và đoạn Cẩm nang.

## Cập nhật 2026-10-07 · Nhiệm vụ+ · Túi đồ+ · thuộc tính mới
- `systems/20-quest-hud.js`: bấm vào phần nhiệm vụ 📜 ở màn hình chính (mobile: dòng dưới thanh EXP; máy tính: khung "Chương … · Chính tuyến") → mở bảng chi tiết: chính tuyến + quà, hằng ngày, hằng tuần, nút Nhận / Nhận tất cả / mở bảng đầy đủ.
- `systems/29-quest-plus.js` (chỉ sửa dữ liệu): chính tuyến 11 → 27 chương (chương mới xen giữa; save cũ tự đổi chỉ số chương nên giữ nguyên vị trí), hằng ngày 8 → 14 nhiệm vụ, hằng tuần 6 → 10, thành tựu 9 → 12, tăng quà ×1.5-1.6, rương hoạt lực & thành tựu có thêm Nguyệt Thạch / Chìa Khóa Vòng Quay (khoá thưởng `kk`). Hệ số: `UP_CH`, `UP_WK` đầu file.
- `ui/30-bag-plus.js`: icon trong túi nhỏ lại (lưới 6 cột, `--bg-cell`, `--bg-ico`), thanh "🔗 Ghép trang bị" ngay trong túi (chạm món Sử Thi/Thần Thoại → Chọn ghép, hoặc ⚡ Chọn tự động). Ghép không cần về Làng.
- `core/01-engine.js`: bỏ dòng "So với đồ đang mặc"; Tự bán / Bán nhanh thêm bậc ≤Sử Thi (có hỏi xác nhận); thuộc tính mới `ls` Hút máu và `ms` Hút năng lượng (chỉ vũ khí, 1-7%), `goldp` Tăng vàng nhận được (1-20%, mọi trang bị) — khoảng giá trị cố định trong `AXF`, không đổi theo phẩm. Hút máu/năng lượng tối đa 10% HP/MP mỗi đòn. Vàng cộng thêm áp cho vàng rơi từ quái, hầm ngục, Tháp, Ma Thần và quà nhiệm vụ (hàm `gP`).

## Cập nhật 2026-10-07 (lần 2) · sửa lỗi túi đồ / chuyển chức / trồng trọt / Nguyên Anh
- `ui/31-bag-scroll.js`: túi đồ không còn bị cuộn lên đầu khi bấm nút trong tab (giữ vị trí cuộn khi vẽ lại cùng một tab; đổi tab/mục nhiệm vụ vẫn về đầu).
- Nhiệm vụ chuyển chức: nhận và trả nhiệm vụ không còn bắt buộc ở Làng (`core/01-engine.js`, tab Nhiệm vụ › Chuyển chức); bảng nhiệm vụ ở màn hình chính cũng có mục 🎓 Chuyển chức để nhận / chọn nhánh.
- Linh Điền: trồng, thu hoạch, mở ô đất ngay trong tab 🌱 của túi đồ, không cần vào bản đồ Linh Điền (`systems/08-farming-alchemy.js`: `noF` luôn cho phép, `farmUI` luôn hiện bảng đầy đủ).
- Nguyên Anh thu thập vàng nhiều hơn (`world/13-mining.js`): gốc 300 → 1000/phút, nhân thêm (1 + Lv/`auLv`) và % "Tăng vàng nhận được" của trang bị, vẫn nhân theo (cảnh giới − Nguyên Anh + 1). Quặng sắt/Huyền Kim giữ nguyên.

## Cập nhật 2026-10-07 (lần 3) · cấp độ trên icon trang bị
- Mỗi ô trang bị (túi + ô đang mặc) hiện cấp độ ở góc dưới phải. Trang bị chưa mặc được (cấp cao hơn nhân vật, không phải đồ chế tác ✦) bị làm mờ + xám, số cấp màu đỏ nhạt. Sửa ở hàm `cell` trong `core/01-engine.js` và CSS trong `ui/30-bag-plus.js` (`.ce>i.il`, `.ce.nw>img`).
