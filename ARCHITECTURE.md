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

## Cập nhật 2026-10-07 (lần 4) · Chợ Giao Dịch online + Linh Thạch
- `systems/32-cho-giao-dich.js` (load sau `ui/31-bag-scroll.js`) + `cho_giao_dich.sql` (chạy 1 lần trong Supabase SQL Editor). Không sửa engine/assets.
- Nút 🏮 ngay bên phải nút 💬 Chat. Ba tab: 🛒 Chợ (lọc loại/sắp xếp giá, mua) · 📦 Đăng bán (chọn trang bị trong túi, nhập giá) · 📜 Của tôi (hủy bán). Chạm một món để xem chi tiết/opt.
- Tiền tệ 💎 Linh Thạch: ví nằm trên máy chủ theo tài khoản ☁ (dùng chung mọi nhân vật). Cách kiếm CHƯA có — tạm cấp thủ công: `select public.cho_admin_grant('<uuid>', 1000);`. API phía game: `window.LT.get()` / `.refresh()` / `.open()`. Khi làm cách kiếm, thêm RPC kiếm riêng trong SQL rồi gọi từ game (đừng cho client tự cộng số dư).
- Luật: phí bán 5% · tối đa 10 món/tài khoản · hết hạn 48 giờ · giá 1 → 1.000.000.000 · không tự mua đồ của mình. Chỉnh ở khối `CF` (JS) và hằng số trong SQL.
- An toàn nhân bản đồ: đăng bán → đồ rời túi trước, máy chủ giữ (ký gửi). Mua / hủy / hết hạn → đồ vào HÒM NHẬN trên máy chủ, game chuyển vào túi rồi mới xác nhận (`cho_ack`); túi đầy thì đồ nằm lại hòm. Mất mạng giữa chừng khi đăng: game tự kiểm tra mã `_mk` để không nhân/mất đồ.
- Lưu ý: giống cloud save/boss, dữ liệu món đồ do client gửi lên; máy chủ chỉ kiểm tra giá trị hợp lệ cơ bản (loại, phẩm, cấp, kích thước), không chống được client bị sửa.
- Bản HTML chạy trên Claude (không có mạng ngoài): nút chợ vẫn có, mở ra chỉ báo cần ☁ + mạng; không ảnh hưởng phần còn lại của game.

## Linh Thạch từ Boss — systems/32-cho-giao-dich.js (khối "KIẾM LINH THẠCH TỪ BOSS") + cho_linh_thach_boss.sql
- Mỗi boss hạ được = 1 💎 vào ví tài khoản ☁; tối đa 500/ngày (giờ VN). Máy chủ tự cắt trần qua RPC `cho_earn` (bảng `cho_daily`); client gom lô ≤ 50 viên/lần.
- Hook: bọc `ZC.kill(e)` — tính khi `e.b >= 2` (boss thường, siêu boss, boss Hầm Ngục/Tháp/Ma Thần). Quái tinh anh (b=1) và quái thường không tính. Boss Bất Tử (world/27) tính 1 viên mỗi lượt đánh.
- Chưa đăng nhập ☁ thì không nhận Linh Thạch (hiện nhắc 1 lần). Panel Chợ hiện "(+đã kiếm/500)". API: `LT.earn(n)`, `LT.today()`.

## Đột phá tầng Linh Căn tốn Linh Thạch — systems/18-linh-can.js + cho_linh_thach_spend.sql
- Luyện LÊN tầng t tốn thêm 💎 ngoài vàng (hàm `LTC` trong 18-linh-can.js): tầng 2-10 = 10💎 · tầng 11-14 = 20💎 · tầng 15 (Viên Mãn) = 300💎.
- Linh Thạch trừ trong ví ☁ trên máy chủ qua RPC `cho_spend` (nguyên tử, không âm). Game giữ chỗ vàng trước, máy chủ từ chối/lỗi mạng thì hoàn vàng; chống bấm đúp bằng `lcBusy`.
- API ví trong systems/32-cho-giao-dich.js: `LT.spend(n,why)`, `LT.sync()` (RPC `cho_bal`), `LT.logged()`. Chưa đăng nhập ☁ thì không luyện được tầng mới.

## Hợp Đạo · Đạo Cảnh — world/33-hop-dao.js
- Cửa vào: Thành Thị Linh Giới → cổng 2 "☯ Hợp Đạo Đài" (mảng `LCG` trong world/10-farming-map.js, thay ô "Bí Cảnh" cũ). Mở bảng Hợp Đạo Đài (overlay), không phải bản đồ chiến đấu.
- Điều kiện: Lv100, mỗi nhân vật hợp đạo 1 lần (`PS[cur].hd={d:1,t,lv0}`), không hoàn tác.
- Hợp đạo: về Lv1/EXP 0 · điểm tiềm năng (`pts`, `al`) giữ nguyên · cảnh giới thay bằng Đạo Cảnh Lv1-100 (= cấp nhân vật; hiển thị "Đạo Cảnh Lv N" ở HUD/tab 🧘/tên nhân vật) · EXP lên cấp ×5 (`nx()` nhân `HD.xm()`; chỉnh `CF.xpMul`) · xoá kỹ năng phàm thể (chặn `cast()`, ẩn `#sk`/`#ult`), chỉ còn Thần Thông (`zcast`) + đánh thường.
- Dữ liệu cảnh giới cũ `PS[cur].cv` được giữ nguyên bên dưới để Thần Thông đã mở vẫn dùng được; nút Đột phá cảnh giới bị chặn sau khi hợp đạo.
- API global là `HDAO` (KHÔNG dùng tên `HD` — trùng biến có sẵn trong engine). Engine sửa: `nx` (EXP ×HDAO.xm()), kill EXP (nhân `HDAO.xg()`), 6 chỗ so cấp trang bị (`.l>P.lv` → bỏ qua cấp khi Đạo Cảnh), `gen()` chặn cấp ≤80. Module bọc `cast`, `ZC.nm/rn/tx/pg/col/bt/ui`.
- Đạo Cảnh chỉ nhận EXP từ quái khi `mi()>=8` (Linh Giới trở lên); chỉnh `CF.mapMin`. Quà nhiệm vụ/rương EXP không bị chặn.
- Cấp trang bị tối đa 80 (`CF.itemLv`, và hằng số trong `gen`); đồ cũ vượt cấp trong túi/đang mặc tự về 80.
- Đạo Cảnh mặc được mọi trang bị bất kể cấp.
- Lưu ý: trang bị cấp cao hơn nhân vật không mặc được → sau khi về Lv1 cần lên cấp lại hoặc dùng đồ cấp thấp.
- Xoá trang bị cũ 1 lần: `HDAO.wipe()` chạy sau khi vào game, xoá toàn bộ trang bị (túi + đang mặc) của nhân vật Lv>1 hoặc đã hợp đạo, rồi đặt cờ `PS[i].wp=CF.wipeId` ('w80'). Nhân vật Lv1 chưa hợp đạo giữ đồ khởi đầu. Vàng/nguyên liệu/thú/cánh giữ nguyên. Muốn xoá lại: đổi `CF.wipeId`.
- Tối ưu Đạo Cảnh: chuỗi EXP trên HUD chỉ định dạng lại khi số đổi (bớt toLocaleString mỗi khung hình); gộp 2 timer thành 1 (1s, bỏ qua khi tab ẩn); hoạt ảnh nghi lễ chỉ dùng transform/opacity (will-change) và tắt khi hệ thống bật "giảm chuyển động".
- HUD (mobile + máy tính): nhãn "EXP" đổi thành "Đạo Linh" khi nhân vật đã hợp đạo (engine: `HDAO.on()` ở 2 chỗ vẽ thanh EXP). Các bảng của Đạo Cảnh cũng gọi EXP là Đạo Linh.

## Thần Thông · Đạo Cảnh — world/34-than-thong.js
- Chỉ nhân vật đã hợp đạo (`HDAO.on()`). 6 hệ × 5 thần thông, xếp theo ngũ hành tương sinh từ linh căn sở trường: ô1 ★ chiến đấu (tự mở khi hợp đạo), ô2 chiến đấu, ô3 buff, ô4 chiến đấu cực nghĩa, ô5 nội tại. Bảng `K` (kỹ năng) và `SC` (hệ số, hồi chiêu, MP, số mảnh: 0/10/20/35/60) chỉnh ở đầu file.
- Hệ = lớp (`CHR[cur].t`) + nhánh (`PS[cur].br`): 0 Kiếm Khách, 1 Thương Thủ, 2 Triệu Hồi Sư, 3 Ma Thuật Sư, 4 Xạ Thủ, 5 Thích Khách. Dữ liệu học: `PS[cur].tt={on:[5 cờ]}`.
- Linh căn: sát thương/buff/nội tại nhân `lcMul(e)` (e: 0 Hỏa, 1 Mộc, 2 Thủy, 3 Kim, 4 Thổ) khi trùng linh căn nhân vật (×1,2–1,5).
- Mảnh Sách Thần Thông = vật phẩm xếp chồng trong túi `{s:5,r:4,c:1,tt:{h,e,q[,k]}}` (h hệ, e linh căn, q số lượng) → bán/mua được ở Chợ giao dịch (module 32). Chạm mảnh trong túi mở bảng Thần Thông (`pk`/`fzt` được bọc để không mặc/bán/hợp nhầm); c:1 giữ khỏi Bán nhanh/Dọn đồ. Hệ khác không học được mảnh của hệ này. Nút ⇄ đổi 5 mảnh bất kỳ → 1 mảnh tùy chọn; nút Tách chia chồng để đăng bán một phần.
- Nguồn mảnh: chỉ boss Kiếm Thánh (chưa có) gọi `TTHONG.drop()` = 5–20 mảnh, linh căn ngẫu nhiên, cho hệ nhân vật hạ boss. Test: thêm `?ttest` vào URL để hiện nút "Nhặt thử".
- Nút thần thông riêng `#tt-bar` (4 nút: 3 chiến đấu + buff; nội tại không có nút). Ẩn `#zk` khi `body.hd-on`. Bọc: `dm` (buff/nội tại sát thương, chí mạng), `ZC.shd/dg` (giảm sát thương, né), `ZC.kill` (Minh Thổ Ảnh Tâm), `ZC.zauto/zcast` (AUTO + phím ZXCV), `ZC.ui` (nút mở bảng trong tab 🧘).
- Thẻ "Thần thông Linh căn" trong bảng Thần Thông chỉ hiển thị thần thông tự động thi triển của linh căn (module systems/18-linh-can.js, `PS[cur].lc`). Nó độc lập với 5 ô của hệ, không dùng mảnh, hợp đạo không xóa.
- Tối ưu hoạt ảnh Thần Thông: đo thời gian khung hình (EMA) → `fps.q` 0/1/2; máy yếu tự giảm hiệu ứng phụ (sigil/gwave/vcol/flash/shake, số mục tiêu có hiệu ứng, số hạt vệt kiếm), bỏ hiệu ứng phụ khi hàng đợi `FX` > 50. Sát thương và hồi chiêu không đổi. `pass()` cache 200ms, nút #tt-bar chỉ ghi DOM khi đổi trạng thái, CSS dùng opacity thay filter.
- Hoạt ảnh tung chiêu Thần Thông: thời gian dựng chiêu `WU=[11,14,8,18]` khung hình (★/ô2/buff/cực nghĩa; trước là 18 cho tất cả) + hồi thế 7 khung; bấm khi đang tung chiêu khác thì lệnh được đệm 0,45s (`pend`, xử lý mỗi khung trong `flush()`); tự quay mặt về địch gần nhất; chỉ cực nghĩa hiện tên nổi.


## Kiếm Thánh (Fix15)
- world/35-kiem-thanh.js: boss Kiếm Thánh, cổng ở Thành Thị Linh Giới (ô 3), mạnh gấp 10 lần Ma Thần, hồi sinh 10 phút, thông báo hồi sinh trên màn hình chính. Chỉnh khối CF đầu file.

## Thần thú bay tự do — pets/24-than-thu-bay.js (load sau ui/26-pet-evo4-lock.js)
- API global `PFLY` (không dùng tên HD/THB: dễ trùng biến engine). Cả 4 thần thú bay lượn khắp bản đồ (toàn chiều ngang `vw()`), nhiều độ cao, lao tới địch ở bất cứ đâu; không còn bị kéo về khi ở xa chủ.
- Ở Làng / Thành Thị Linh Giới / Mỏ / Linh Điền (không có vòng lặp thú của engine) module tự lượn bằng `PFLY.idle()` (rAF riêng, nhường engine khi đang ở bản đồ chiến đấu).
- Móc trong engine: `epstep` (bỏ teleport >480px, tìm địch bán kính 9999, đích đến/tốc độ lấy từ `PFLY.tx/run`), `vstep` (không dính chủ), `pets/22-chu-tuoc.js` step (Chu Tước). Bọc `epstep` để giữ độ cao bay khi không tung đòn.
- Bật/tắt bằng nút "🕊 Bay tự do" trong tab 🐾 Thú (`PS[cur].thb`: 0 = tắt → hành vi cũ; mặc định bật). Khoá tiến hoá cấp 4 (ui/26) không bị đụng tới.

## Bản đồ Linh Giới — world/36-linh-gioi-maps.js
- Cổng 1 (Chiến Trường) của Thành Thị Linh Giới mở bảng chọn 6 bản đồ (`LGMAP.open()`); Đạo Thể còn có danh sách bản đồ trong tab 🗺 (bọc `lgUI`). Chọn bản đồ lưu `PS[cur].lgm` (0..4); vẫn là `lg=1`, `mapSel=4`, `mi()=8` nên Đạo Cảnh vẫn nhận EXP.
- Bản đồ 1 = quái hiện tại Lv80-100. Bản đồ 2–5 = quái mới cho Đạo Thể Lv1-20/21-40/41-60/61-80 (chỉ Đạo Thể): `LR[4]` đổi theo bản đồ mỗi khung (bọc `step`), `spawn()` được bọc để tính lại máu/thủ/sức đánh theo `LGS`. Bản đồ 6 Thánh Địa: Đạo Thể Lv100, tạm khóa (`LGMAP.holy.open=false`).
- Quái/nền mới: 4 chủ đề thêm vào `LVX.LT` (chỉ số 5–8), tên quái trong `window.LGNMN`; `05-demon-boss.js` được sửa 4 chỗ nhỏ để đọc `e.lgi` / `window.LGI` / `LGNMN` (hình dáng quái dùng chung khung `MON`, đổi màu + tên).
- Fix27: Đạo Thể chỉ vào bản đồ 2–6 khi đủ cấp Đạo Cảnh tối thiểu (Lv1/21/41/61/100); Đạo Linh (EXP) chỉ tăng ở bản đồ Đạo Thể (`LGMAP.expOk()`, `HDAO.xg` đọc hàm này; bản đồ 1 không cho EXP Đạo Thể); mỗi cấp Đạo Cảnh nhận 10 điểm tiềm năng (engine dòng lên cấp: `HDAO.on()?10:5`).
 - Fix28: quái bản đồ Đạo Thể (2–5) mạnh hơn nhiều: bảng `LGS` (máu ×5–8, thủ ×1,8–2,4, sức đánh ×4–6 qua `e.m`), Đạo Linh nhận ×`LGS[i].exp` (0,5) qua `LGMAP.expMul()` (HDAO.xg trả hệ số này). Muốn dễ/khó hơn chỉ sửa `LGS`.
- Fix29: máu quái Đạo Thể cố định `LGS[i].hpn` (bản đồ 2 = 100k, gấp đôi mỗi bản đồ sau), Tinh Anh ×`LGE.e`=3, Boss ×`LGE.b`=10; sức đánh `at` 12/14/16/20 (Tinh Anh ×1,5, Boss ×2 thêm). Chỉnh trong module 36.

## Cường hóa trang bị — hệ số chỉ số + hiệu ứng +7/+10 (Fix30)
- `UM(u)` trong core/01-engine.js: hệ số chỉ số cơ bản (Công/Thủ/HP) theo cấp cường hóa +0..+10 = [1,1.3,1.6,1.9,2.2,2.5,2.8,3.4,3.8,4.2,10] (cũ: 1+0,15×cấp, tối đa ×2,5). Mốc +7 nhảy 0,6 và +10 = ×10 (Fix31). Dùng trong `sm()` (chỉ số thật) và `ev()` (hiển thị).
- world/37-cuong-hoa-fx.js: huy hiệu +N trên ô trang bị; +7 viền xanh quay, +10 viền vàng-lửa; bùng nổ toàn màn hình khi cường hóa lên đúng +7/+10 (bọc `en1`); hào quang quanh nhân vật khi mặc đồ +7 (xanh) / +10 (vàng-lửa) (bọc `hero`).

## Đá cường hóa — world/38-da-cuong-hoa.js (Fix32)
- Cường hóa lần 1–7 (+0→+7) tốn 💰 + 1 🪨 Đá Cường Hóa. Từ +7 lên +8/+9/+10 tốn 💰 + 1 💠 Đá Cường Hóa Cao Cấp; thất bại ở giai đoạn này → trang bị về +0 (có hộp xác nhận). Kho đá `PS[cur].dch={a,b}`. Rơi từ quái (Boss/Ma Thần/Kiếm Thánh rơi đá cao cấp) + mua ở Thợ Rèn (`DCH.price`). Module nạp TRƯỚC 37 để hiệu ứng +7/+10 bọc được `en1`; nút Cường hóa trong engine gọi `DCH.need/buyBtn`.


## Vẽ lại boss phụ bản (Fix33)
- world/39-dg-boss-art.js: thay DGI.boss (ảnh webp) bằng sprite canvas theo phong cách Ma Thần v2; DGI.bossKS (trường kiếm, rune xanh) cho Kiếm Thánh. Engine: nhãn tên boss đọc e.nm.


## Phụ Bản 2 (Fix34)
- world/40-phu-ban-2.js: nút 🕳 mở bảng chọn phụ bản; Phụ Bản 2 "Địa Long Điện" (Lv80, vào lại sau 10 phút, boss Ngục Long Vương ×5 Trùm Hầm Ngục) rơi Mảnh Đan Đột Phá Cảnh Giới 4 Thần Thú (2-5/lần, 100 mảnh ghép 1 Đan; Thú dùng Đan khi tiến hoá cấp 4). Sprite boss: DGI.boss2 trong world/39. Engine: e.big (cỡ boss), e.gc (màu hào quang).

## Opt nhẫn "Cấp thần thông" — equipment/43-nhan-than-thong.js
- `it.ttl` (1-3) chỉ trên Nhẫn (s=7/8): nhẫn thường siêu hiếm (`CF.chance` theo phẩm), nhẫn Bộ Thánh chắc chắn có (ngẫu nhiên 1-3). Mỗi +1 cấp: kỹ năng Linh Căn +1 tầng (`L0()`/cast trong systems/18-linh-can.js), thần thông/tiên thuật +10% sức mạnh (bọc `lcMul`). Cộng dồn các món đang mặc.
- Patch nhỏ: engine (xHtml hiển thị, HL.gen nhẫn Thánh, SPK/autoKeep/sa/pk không bán đồ có ttl), systems/18-linh-can.js (2 chỗ). `holyAll=true` trong CF nếu muốn mọi món Thánh đều có opt này.
- Túi đồ: nút "💰 Bán nhanh < Thần Thoại (N)" cạnh "↕ Sắp xếp" gọi sa(4) có sẵn (bán Thường→Sử Thi, giữ đồ chế tác, đã cường hóa, nhẫn Cấp Thần Thông), có hộp xác nhận; N = số món sẽ bán.
- Túi đồ: nút "💰 Bán nhanh < Thần Thoại" mở bảng chọn từng món (ui/44-ban-nhanh-chon.js, API `BNC`): tick từng món, chọn/bỏ theo phẩm, xem tổng vàng, bấm Bán. Vẫn bảo vệ đồ chế tác/cường hóa/nhẫn Cấp Thần Thông/đồ Thánh. Không tải module thì nút tự quay về sa(4).


## Ý Cảnh (Fix39)
- world/45-y-canh.js: Ý Cảnh Tiên Đạo / Ma Đạo trong Hợp Đạo Đài (Linh Giới). Chọn 1 đạo, 5 cảnh giới × 3 tiểu cảnh; sát thương phụ 10-50% cho kỹ năng + Thần Thông (bọc dm() khi SKF=1). Chưa có cách tu luyện (YCANH.up(n) chừa sẵn). Patch nhỏ: engine DT đọc d.sc (màu viền), world/33-hop-dao.js thêm khối YCANH.mini() + nút data-a="yc".

## Phụ Bản 4 "Ma Thần" + Kiếm Thánh chỉ Đạo Thể — world/47-phu-ban-ma-than.js
- Thẻ số 4 trong bảng 🕳 Phụ Bản (world/40 gọi `PBMT.html/refresh/canEnter/enter`). Tái dùng Boss Ma Thần + bản đồ Huyết Nguyệt Ma Điện của world/02 + 05 (cờ `dg.mt=1`, thêm cờ `dg.pm=1` để tách phần thưởng/thoát trận). API global `PBMT`.
- Chỉ mở sau khi hạ Ma Thần lần đầu (`lgDone()`). Hồi chiêu 1 giờ tính từ lúc vào (`PS[cur].pmt.cd`). Rơi "Ma Thần Tinh Huyết" 5–10/lần (+ vàng, mảnh chế tạo, tu vi như Ma Thần; trang bị Thần Thoại `CF.gear=0`).
- Tinh Huyết nâng Ý Cảnh Ma Đạo qua `YCANH.up(1)`: giá = `CF.base + CF.step × (cấp − 1)`. Chỉ Ma Đạo dùng được; Tiên Đạo vẫn tích luỹ.
- Thoát trận / chết giữa trận → `back(w)` đưa về đúng bản đồ trước đó (Làng / Linh Giới). Lần hạ Ma Thần đầu tiên (không có `dg.pm`) giữ nguyên.
- Kiếm Thánh (world/35): `ask()`/`enter()` chặn nếu không phải Đạo Thể (`HDAO.on()`); ô cổng hiện "Chỉ Đạo Thể được đánh".


## Thần Thông Ý Cảnh (Fix43)
- world/49-y-canh-than-thong.js: 3 thần thông riêng cho Tiên Đạo (vàng kim) và Ma Đạo (tím đen), mở khoá theo cảnh giới Ý Cảnh [1,3,5]; nút #yt-bar (tự dịch khi có #fb-bar), tự dùng khi AUTO (bọc step()/cast() trong vòng AUTO + ZC.zauto dự phòng). world/45-y-canh.js render thêm YCTT.card().
