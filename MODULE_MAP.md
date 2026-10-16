# MODULE_MAP — thứ tự nạp (theo index.html) và việc của từng file

Tạo tự động bởi `python3 tools/symbols.py`. Cột KB = dung lượng, "ký hiệu" = số khai báo cấp cao nhất.

| # | file | KB | ký hiệu | mô tả (chú thích đầu file) |
|--:|---|--:|--:|---|
| 1 | `assets/game-assets.js` | 1566 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 2 | `assets/ban-do-assets.js` | 305 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 3 | `core/00-error-handler.js` | 2 | 0 | BỘ BẮT LỖI AN TOÀN / CROSS-BROWSER ===== - Không che lỗi thật. - Không hiện "Script error." mơ hồ do script/resource khác origin. - Nếu có lỗi JS thật |
| 4 | `core/01a-base-data.js` | 5 | 16 | core/01a-base-data.js — Canvas, resize, RNG, bảng dữ liệu nhân vật/ô trang bị (ADJ, SLS, CHR) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem i |
| 5 | `core/01b-items-sets-wheel.js` | 13 | 41 | core/01b-items-sets-wheel.js — Bộ trang bị, rèn/gộp, tiệm, vòng quay (reward/spin) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 6 | `core/01c-affix-petdata-skills.js` | 14 | 112 | core/01c-affix-petdata-skills.js — Opt ngẫu nhiên, dữ liệu thú nuôi PT4/PB/PK, init, dm, kỹ năng (cast/fire/basic) (tách từ core/01-engine.js; thứ tự  |
| 7 | `core/01d-pet-render.js` | 11 | 11 | core/01d-pet-render.js — glowSpr/glowDraw, pm, vẽ Huyền Vũ/Rồng, epstep, drawEP (vòng thú nuôi gốc) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, |
| 8 | `core/01e-step-loop.js` | 6 | 7 | core/01e-step-loop.js — pstep, cbar, step (vòng cập nhật chính) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 9 | `core/01f-backgrounds.js` | 14 | 13 | core/01f-backgrounds.js — Nền map: bgd0/xbg/bgd/bgdOld, XP, các layer (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 10 | `core/01g-hero-draw.js` | 16 | 18 | core/01g-hero-draw.js — RGBA, armXY, dArm/dLeg, hero(), heroSpark, foe() (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 11 | `core/01h-skill-fx.js` | 74 | 2 | core/01h-skill-fx.js — Hệ hiệu ứng kỹ năng ZS (FX, SFX, ACT, bst, fx, shake...) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 12 | `core/01i-combat-core.js` | 18 | 1 | core/01i-combat-core.js — Lõi chiến đấu ZC (tick, kill, gain, aura, panel...) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 13 | `core/01j-hud-draw.js` | 10 | 16 | core/01j-hud-draw.js — pets(), mbar/mhud, draw() chính (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 14 | `core/01k-icons-equip.js` | 13 | 28 | core/01k-icons-equip.js — Icon trang bị (mkIcon/mkIcon2/drawWpn), gen, eqp (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 15 | `core/01l-loot-weapons-data.js` | 16 | 60 | core/01l-loot-weapons-data.js — Tự động bán, tiệm rèn, give/drop, dữ liệu vũ khí (WPU, WSET...) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem |
| 16 | `core/01m-weapon-char-ui.js` | 9 | 18 | core/01m-weapon-char-ui.js — Thẻ vũ khí, charUI, wpnUI (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 17 | `core/01n-tab-menu.js` | 5 | 5 | core/01n-tab-menu.js — Thanh tab menu (tabBar, NAVI) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 18 | `core/01o-quests.js` | 17 | 36 | core/01o-quests.js — Hệ nhiệm vụ (qs*, QE) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 19 | `core/01p-bag-pet-ui.js` | 17 | 29 | core/01p-bag-pet-ui.js — ui() túi đồ, petUI/pev/petEvo, thao tác túi (fuse, eq1, bsort...) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem inde |
| 20 | `core/01q-village.js` | 6 | 10 | core/01q-village.js — Làng: nameTag, vstep, vdraw, bld (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 21 | `core/01r-class-quest.js` | 2 | 10 | core/01r-class-quest.js — Nhiệm vụ chuyển chức (cq*) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 22 | `core/01s-save-load.js` | 5 | 12 | core/01s-save-load.js — Lưu/tải/di trú: sv, st, ng, mig, ld, mn (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 23 | `core/01t-dungeon.js` | 11 | 38 | core/01t-dungeon.js — Hầm ngục (dg*) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 24 | `core/01u-wings.js` | 5 | 17 | core/01u-wings.js — Cánh (wg*, drawWings) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 25 | `core/01v-perf-boot.js` | 4 | 0 | core/01v-perf-boot.js — Tối ưu hiệu năng + khởi động (rf(); init(); loop) (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) |
| 26 | `world/02-demon-realm.js` | 9 | 28 | MA THẦN + LINH GIỚI |
| 27 | `world/03-village.js` | 36 | 0 | THÔN TÂN THỦ v2: THANH VÂN TIÊN THÔN (dựng lại theo ảnh mẫu) |
| 28 | `world/41-lang-online.js` | 10 | 0 | 🏮 LÀNG ONLINE ===== * Gặp người chơi khác ở thôn tân thủ. Cần chạy village_presence.sql 1 lần trong Supabase. * - Chỉ hoạt động khi đang ở làng (vil)  |
| 29 | `ui/04-character-stats.js` | 5 | 0 | BẢNG CHỈ SỐ NHÂN VẬT |
| 30 | `world/05-demon-boss.js` | 65 | 0 | MA THẦN v2: thiết kế lại Boss + bản đồ "Huyết Nguyệt Ma Điện" (theo ảnh mẫu Gemini) ==== - Boss vẽ bằng canvas: cánh dơi + giáp đen chạm rune cam + ki |
| 31 | `world/60-ban-do-tu-tien.js` | 14 | 0 |  |
| 32 | `ui/06-combat-icons.js` | 7 | 0 |  |
| 33 | `world/07-trial-tower.js` | 27 | 59 | THÁP THÍ LUYỆN · Tháp 9 tầng ở Thanh Vân Tiên Thôn ==== - 9 tầng × 10 Boss, độ khó tăng dần. Hạ lần lượt từng Boss; hạ đủ 10 Boss thì lên tầng kế. - B |
| 34 | `systems/08-farming-alchemy.js` | 18 | 1 | LINH ĐIỀN (trồng cây) + LUYỆN ĐAN - Hạt giống rơi ngẫu nhiên (tỉ lệ riêng từng loại) ở MỌI loại Boss - Cây lớn theo thời gian thật (offline vẫn lớn),  |
| 35 | `systems/09-input-guard.js` | 0 | 0 | Chặn chạm của Làng khi đang ở Thành Thị Linh Giới (phải chạy trước script Linh Điền) |
| 36 | `world/10-farming-map.js` | 34 | 1 | BẢN ĐỒ LINH ĐIỀN ĐỘNG THIÊN - Cổng 🌱 trên trời Làng Thanh Vân (chạm → đi tới → vào bản đồ) - Trong bản đồ: chạm ô đất để đi tới và gieo / thu hoạch, c |
| 37 | `combat/11-status-effects.js` | 10 | 0 | CƠ CHẾ TRẠNG THÁI: BỎNG · ĐỘC TỐ · CHOÁNG · XUYÊN GIÁP · ĐÓNG BĂNG |
| 37b | `systems/11-cloud-only.js` | ~90 | 0 | ☁ CHỈ LƯU ĐÁM MÂY: khoá dữ liệu game chuyển vào RAM, nạp từ mây lúc mở game, đồng hồ nền Worker (nạp ĐẦU TIÊN, sau core/00) |
| 38 | `systems/12-cloud-save.js` | 25 | 0 | ☁ LƯU GAME TRÊN MẠNG (Supabase) · đăng nhập + đồng bộ + bảng xếp hạng ==== Điền 2 giá trị dưới đây (xem HUONG_DAN_CLOUD.md). Để trống = game chạy như  |
| 39 | `world/13-mining.js` | 29 | 1 | KHAI KHOÁNG: Mỏ Vàng · Quặng Sắt · Huyền Kim - Ngọn núi ở bản đồ tân thủ (Thanh Vân Sơn Môn): chạm vào để vào hầm mỏ - Trong hầm: chạm mạch khoáng để  |
| 40 | `equipment/14-cosmetics-shop.js` | 22 | 1 | TIỆM Y PHỤC LINH VÂN · Ngoại trang (chỉ làm đẹp, không cộng chỉ số) ==== Tiền tệ: 💠 Đồng Huyền Tinh — rơi từ Boss Thế Giới 🐲 và Boss Hoàng Kim 👑 (chỉn |
| 41 | `ui/15-guide.js` | 3 | 0 |  |
| 42 | `ui/16-tutorial.js` | 7 | 0 |  |
| 43 | `ui/17-ranking-name.js` | 14 | 0 | XẾP HẠNG + TÊN NHÂN VẬT (RK) ================= - Nút 🏆 nằm cạnh đồng hồ Boss Thế Giới ở HUD. - 3 bảng: Tu vi · Cấp độ · Lực chiến (từng hệ). Dữ liệu t |
| 44 | `combat/18-enemies.js` | 6 | 0 |  |
| 45 | `systems/18-linh-can.js` | 18 | 0 | LINH CĂN (tu tiên) ===== * 5 linh căn: Hỏa / Mộc / Thủy / Kim / Thổ. Chọn 1 linh căn đang dùng. * - Passive: tăng sức mạnh thần thông (tiên thuật) cùn |
| 46 | `systems/19-arena.js` | 48 | 0 | ĐẤU TRƯỜNG v5 — REAL COMBAT / MAP-STYLE ===== - Dùng chính renderer hero() của game map: sprite, tay/chân, vũ khí, cánh, animation đánh. - Dùng chính  |
| 47 | `systems/20-quest-hud.js` | 6 | 0 | Bấm vào phần nhiệm vụ 📜 trên màn hình chính → mở bảng chi tiết nhiệm vụ (chính tuyến, hằng ngày, hằng tuần). Mobile: dòng nhiệm vụ dưới thanh EXP/Tu v |
| 48 | `systems/21-bulk-fuse.js` | 2 | 4 | Hợp hàng loạt trang bị Sử Thi (tím) + gỡ thuộc tính "Giảm hồi chiêu" khỏi đồ cũ |
| 49 | `assets/phoenix-assets.js` | 128 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 50 | `assets/bach-ho-assets.js` | 81 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 51 | `pets/22-chu-tuoc.js` | 18 | 1 | THẦN THÚ CHU TƯỚC (thay chim ưng) - 4 cấp tiến hoá, mỗi cấp một hình riêng (webp trong suốt đã tối ưu) - Vỗ cánh bằng lưới biến dạng (cánh phập phồng, |
| 52 | `pets/27-bach-ho.js` | 18 | 1 | THẦN THÚ BẠCH HỔ (thay "Hổ"), cơ chế như Chu Tước - 4 cấp tiến hoá, mỗi cấp một hình (assets/bach-ho-assets.js, webp trong suốt): Sơ Sinh → Chiến Binh |
| 53 | `pets/23-summon-beasts.js` | 25 | 0 | THÚ TRIỆU HỒI v2 · Linh Lang (sói) · Thạch Cự (golem) · Cổ Thụ (cây) - Thay ảnh tĩnh bằng nhân vật vẽ theo khung xương (IK): chân bước thật theo quãng |
| 54 | `ui/24-equip-icon-fit.js` | 1 | 0 | THU NHỎ ICON TRANG BỊ (ô trang bị đang mặc + khung mô tả) - Ảnh icon trang bị trong túi đồ giữ nguyên (đẹp, chi tiết); chỉ thu hình trong các ô đang m |
| 55 | `ui/25-pet-preview.js` | 3 | 0 | XEM TRƯỚC THÚ NUÔI cho nhân vật dưới Lv20 (chưa chuyển chức) - Tab 🐾 Thú hiện danh sách 4 thần thú, hướng tiến hoá và kỹ năng để cân nhắc trước. - Chư |
| 56 | `ui/26-pet-evo4-lock.js` | 1 | 0 | KHOÁ TIẾN HOÁ CẤP 4 (hình cuối) CHO CẢ 4 THÚ NUÔI - Chặn tiến hoá từ cấp 3 → cấp 4 cho tới khi cả 4 thú được cập nhật đầy đủ. - Thú đã ở cấp 4 từ trướ |
| 57 | `pets/24-than-thu-bay.js` | 5 | 0 | 🕊 THẦN THÚ BAY TỰ DO ===== * Cả 4 thần thú (Hổ, Chu Tước, Rồng, Hồn Khuyển/Huyền Vũ) bay lượn khắp bản đồ, không còn bị buộc quanh nhân vật: * - Khi k |
| 58 | `pets/31-than-thu-co-che.js` | 25 | 0 | CƠ CHẾ THẦN THÚ NHƯ CHU TƯỚC — áp dụng cho THANH LONG (ô 3) và HUYỀN VŨ (ô 4) Giống Chu Tước: - 4 cấp tiến hoá, mỗi cấp một hình riêng; bay lượn tự do |
| 59 | `world/27-immortal-boss.js` | 18 | 0 | BOSS BẤT TỬ HẰNG NGÀY (BS) ================= - Cửa vào: nút 💀 "Boss Bất Tử" nằm ngay bên trái nút 🏆 Xếp hạng. - Mỗi ngày (giờ VN, đổi lúc 00:00) có 1  |
| 60 | `systems/28-chat.js` | 8 | 0 | 💬 CHAT THẾ GIỚI ===== * Dùng chung tài khoản ☁ (KCL.rpc). Cần chạy chat.sql 1 lần trong Supabase. * Một kênh chung, hỏi máy chủ (polling) nên không cầ |
| 61 | `systems/29-quest-plus.js` | 8 | 0 | NHIỆM VỤ+ : thêm chương chính tuyến, thêm nhiệm vụ hằng ngày/tuần/thành tựu, tăng quà - Chỉ sửa DỮ LIỆU (mảng QCH/QDP/QWP/QMS/QAC/QAR sửa tại chỗ), kh |
| 62 | `ui/30-bag-plus.js` | 3 | 0 | TÚI ĐỒ+ : icon trang bị trong túi nhỏ gọn hơn + ghép trang bị ngay trong túi - Chỉnh cỡ ô/icon: --bg-cell (px), --bg-ico (% icon trong ô). - Ghép: chạ |
| 63 | `ui/31-bag-scroll.js` | 1 | 0 | Giữ nguyên vị trí cuộn của túi đồ khi giao diện vẽ lại (bấm nút trong tab không bị cuộn lên đầu). Đổi tab / đổi mục nhiệm vụ thì vẫn về đầu trang như  |
| 64 | `systems/32-cho-giao-dich.js` | 22 | 0 | 🏮 CHỢ GIAO DỊCH ONLINE · LINH THẠCH ===== * Dùng chung tài khoản ☁ (KCL.rpc). Cần chạy cho_giao_dich.sql 1 lần trong Supabase. * - Linh Thạch (💎) nằm  |
| 65 | `world/33-hop-dao.js` | 11 | 0 | ☯ HỢP ĐẠO · ĐẠO CẢNH ===== * Cửa vào: Thành Thị Linh Giới → cổng 2 "Hợp Đạo Đài" (mảng LCG trong world/10-farming-map.js). * Điều kiện: nhân vật Lv100 |
| 66 | `world/34-than-thong.js` | 25 | 0 | 📜 THẦN THÔNG · ĐẠO CẢNH (6 hệ × 5 thần thông) ===== * Chỉ nhân vật ĐÃ HỢP ĐẠO (HDAO.on()). Mỗi hệ có 5 thần thông xếp theo ngũ hành tương sinh, bắt đầ |
| 67 | `world/35-kiem-thanh.js` | 12 | 0 | 🗡️ KIẾM THÁNH · BOSS THÀNH THỊ LINH GIỚI ===== * Dựa trên Ma Thần (world/02-demon-realm.js): cùng kiểu trận đấu (dg), cùng công thức chỉ số nhưng mạnh |
| 68 | `world/36-linh-gioi-maps.js` | 12 | 0 | 🌀 BẢN ĐỒ LINH GIỚI (6 bản đồ) ===== * Cổng 1 (Chiến Trường) của Thành Thị Linh Giới mở bảng chọn bản đồ. Đạo Thể còn có danh sách bản đồ ngay trong ta |
| 69 | `world/62-thanh-dia.js` | 9 | 0 | ✨ THÁNH ĐỊA · BẢN ĐỒ 6 (Lv80-100) · 2 BOSS: MA THẦN + KIẾM THÁNH ×10 ===== * Mở khoá ô "Thánh Địa" trong bảng chọn bản đồ Linh Giới (world/36-linh-gio |
| 70 | `world/38-da-cuong-hoa.js` | 4 | 0 | 🪨 ĐÁ CƯỜNG HÓA ===== (nạp TRƯỚC 37-cuong-hoa-fx.js để hiệu ứng +7/+10 bọc được en1 mới) * Cường hóa +0→+7 (lần thứ 1–7): tốn 💰 + 1 🪨 Đá Cường Hóa. Thấ |
| 71 | `world/37-cuong-hoa-fx.js` | 7 | 0 | ✨ HIỆU ỨNG CƯỜNG HÓA +7 / +10 ===== * Chỉ số trang bị theo cấp cường hóa: UM(u) trong core/01*.js (engine đã tách, tra SYMBOL_INDEX.md) (bảng hệ số: + |
| 72 | `world/39-dg-boss-art.js` | 17 | 0 | 🎨 VẼ LẠI BOSS PHỤ BẢN (Hầm Ngục) THEO PHONG CÁCH BOSS MA THẦN v2 ===== * Trước: boss là ảnh webp (DGI.boss, p001). Giờ: vẽ canvas 1 lần — giáp đen/tím |
| 73 | `world/40-phu-ban-2.js` | 15 | 0 |  |
| 74 | `world/42-phu-ban-vang.js` | 11 | 0 | 💰 PHỤ BẢN 3 "PHỤ BẢN VÀNG" ===== * Mở từ bảng 🕳 Phụ Bản (world/40-phu-ban-2.js, thẻ số 3). Module riêng, không sửa engine. * - 1 Boss Bất Tử KHÔNG THỂ |
| 75 | `systems/36-hop-the-tieu-canh.js` | 2 | 0 | 💎 ĐỘT PHÁ TIỂU CẢNH GIỚI TỪ HỢP THỂ ===== * Từ Hợp Thể, mỗi lần lên 1 tầng (tiểu cảnh giới) phải đột phá thủ công và tốn Linh Thạch: * tầng 1→2: 10💎 · |
| 76 | `equipment/43-nhan-than-thong.js` | 3 | 0 | 💍 OPT "CẤP THẦN THÔNG" CHO NHẪN ===== * Thuộc tính mới: it.ttl = 1..3 → tăng cấp TẤT CẢ kỹ năng thần thông thêm ttl cấp (cộng dồn các món đang mặc). * |
| 77 | `ui/44-ban-nhanh-chon.js` | 7 | 0 | 💰 BÁN NHANH · CHỌN TỪNG MÓN (dưới Thần Thoại) ===== * Nút "💰 Bán nhanh < Thần Thoại" trong túi mở bảng này (engine: onclick="window.BNC?BNC.open():sa( |
| 78 | `ui/45-bao-ve-tui-do.js` | 2 | 0 | 🛡️ BẢO VỆ TÚI ĐỒ: KHÔNG TỰ MẶC · KHÔNG TỰ BÁN MẢNH Ý CẢNH (ui/45-bao-ve-tui-do.js) ===== * 1) KHÔNG TỰ MẶC trang bị mạnh hơn: engine (core/01*.js (eng |
| 79 | `world/45-y-canh.js` | 10 | 0 | 🌌 Ý CẢNH · TIÊN ĐẠO / MA ĐẠO ===== * Cửa vào: Thành Thị Linh Giới → cổng "Hợp Đạo Đài" → khối "🌌 Ý Cảnh" trong bảng (world/33-hop-dao.js gọi YCANH.min |
| 80 | `world/46-dao-the-fx.js` | 55 | 0 | ☯ HIỆU ỨNG ĐẠO THỂ (world/46-dao-the-fx.js) ===== * Khi nhân vật đã Hợp Đạo (Đạo Thể: HDAO.on(), Đạo Cảnh Lv1 trở lên): * - TẤT CẢ hiệu ứng cảnh giới  |
| 81 | `world/47-phu-ban-ma-than.js` | 14 | 0 |  |
| 82 | `assets/phap-bao-sprites.js` | 67 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 83 | `assets/hon-phach-assets.js` | 498 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 84 | `world/48-phap-bao-bon-menh.js` | 37 | 0 |  |
| 85 | `world/49-y-canh-than-thong.js` | 16 | 0 | 📜 THẦN THÔNG Ý CẢNH · TIÊN ĐẠO / MA ĐẠO (world/49-y-canh-than-thong.js) ===== * Mỗi đạo (world/45-y-canh.js) có 3 thần thông RIÊNG, độc lập với 6 hệ T |
| 86 | `world/50-y-canh-hieu-ung.js` | 6 | 0 | ✨ HIỆU ỨNG TRẠNG THÁI THẦN THÔNG Ý CẢNH · TIÊN / MA (world/50-y-canh-hieu-ung.js) ===== * Bổ sung hiệu ứng cho 6 thần thông của world/49-y-canh-than-t |
| 87 | `world/51-toc-huy-hieu.js` | 19 | 0 | 🏅 HUY HIỆU TIÊN TỘC / MA TỘC (world/51-toc-huy-hieu.js) ===== * Khi nhân vật đã chọn Tiên Đạo hoặc Ma Đạo ở Ý Cảnh (PS[cur].yc.p = 't' / 'm'): * - Tiê |
| 88 | `world/52-skill-layout.js` | 3 | 0 | 🧩 SẮP XẾP CÁC Ô KỸ NĂNG BÊN PHẢI MÀN HÌNH (world/52-skill-layout.js) ===== * Lỗi: 3 module cùng đặt nút kỹ năng ở cùng một chỗ (right≈60-62px, top≈124 |
| 89 | `world/53-y-canh-ky-nang-toc.js` | 48 | 0 | 🌟 KỸ NĂNG TIÊN TỘC / MA TỘC · HIỆU ỨNG MỚI + MỞ KHOÁ BẰNG NGỘ ĐẠO / MA KHÍ (world/53-y-canh-ky-nang-toc.js) ===== * Mở rộng world/49-y-canh-than-thong |
| 90 | `equipment/51-dao-the-outfit.js` | 189 | 0 | 👘 TRANG PHỤC ĐẠO THỂ (equipment/51-dao-the-outfit.js) ===== * Khi nhân vật đã Hợp Đạo (Đạo Thể: HDAO.on()), ngoại hình 3 hệ (Chiến binh / Pháp sư / Cu |
| 91 | `world/54-than-thong-sat-thuong.js` | 4 | 0 | ⚖️ CÂN BẰNG: SÁT THƯƠNG THẦN THÔNG LUÔN CAO HƠN KỸ NĂNG THƯỜNG ===== * Trước đây nhiều thần thông yếu hơn kỹ năng phàm thể (đo trong game, hệ số nhân  |
| 92 | `equipment/55-opt-moi.js` | 8 | 0 |  |
| 93 | `world/56-thon-tan-thu.js` | 54 | 0 | 🏡 THÔN TÂN THỦ — vẽ lại theo hướng mộc mạc, chân thực (world/56-thon-tan-thu.js) ===== * Chỉ thay HÌNH VẼ của làng; không đổi logic, toạ độ, tương tác |
| 94 | `world/57-hon-phach.js` | 25 | 0 |  |
| 95 | `world/58-linh-gioi-city-art.js` | 80 | 0 | 🏯 THÀNH THỊ LINH GIỚI · BẢN ĐỒ VẼ BẰNG CODE (world/58-linh-gioi-city-art.js) ===== * v2 — VẼ LẠI HOÀN TOÀN. Không còn ảnh nền nhúng (-263KB): cả cảnh  |
| 96 | `world/59-hon-phach-than-thong.js` | 13 | 0 |  |
| 97 | `ui/58-hud-tiem-linh-dien.js` | 4 | 0 | 👘🌱 ICON TIỆM Y PHỤC + LINH ĐIỀN lên HÀNG HUD cùng 🏆 Xếp hạng (ui/58-hud-tiem-linh-dien.js) ===== * Trước: 2 icon nổi lơ lửng trong cảnh Làng (vẽ canva |
| 98 | `ui/63-cash-shop.js` | 17 | 0 | 🛒 CASH SHOP · CỬA HÀNG LINH VÂN (ui/63-cash-shop.js) ===== * Nút 🛒 nằm cùng hàng HUD với ⚔️ Đấu trường / 🌱 Linh Điền / 👘 Y Phục (ui/58-hud-tiem-linh-d |
| 99 | `equipment/64-duc-lo-kham-da.js` | 26 | 0 |  |
| 100 | `systems/60-dang-nhap-bat-buoc.js` | 10 | 0 | 🔐 BẮT BUỘC ĐĂNG NHẬP + PHIÊN CHƠI DUY NHẤT (systems/60-dang-nhap-bat-buoc.js) ===== * Luồng: * 1) Mở game → cổng đăng nhập phủ kín màn hình. Nhập emai |
| 101 | `world/61-lang-gian-rong.js` | 4 | 0 | LÀNG TÂN THỦ GIÃN RỘNG + CAMERA THEO NHÂN VẬT (như Linh Giới) - Thế giới làng rộng tối thiểu WIDE (mặc định 1320 đơn vị), màn hình hẹp chỉ thấy một ph |
| 102 | `world/65-cong-ve-lang.js` | 8 | 0 | 🏘 CỔNG VỀ THÔN TÂN THỦ · Thành Thị Linh Giới (world/65-cong-ve-lang.js) ===== * Thêm cổng thứ 6 (chỉ số cuối của LCT.gates) đặt đúng ở cột sáng phía t |
| 103 | `world/61-tien-gioi-thanh.js` | 57 | 0 |  |
| 104 | `systems/66-dot-pha-canh-gioi.js` | 9 | 0 |  |
| 105 | `world/71-van-phap-mon-phai.js` | 13 | 0 | 🗼 VẠN PHÁP THÁP — CHỌN MÔN PHÁI (world/71-van-phap-mon-phai.js) ===== * Mục "Vạn Pháp Tháp" ở Thành Thị Tiên Giới (TG.spots id 'pagoda'): TẠM KHOÁ cho |
| 106 | `world/72-mon-phai-ky-nang.js` | 17 | 0 | ⚔️ KỸ NĂNG MÔN PHÁI (world/72-mon-phai-ky-nang.js) — chạy sau world/71-van-phap-mon-phai.js ===== * Sau khi chọn môn ở Vạn Pháp Tháp: kỹ năng 1 mở nga |
| 107 | `assets/mon-phai-sprites.js` | 460 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 108 | `world/73-mon-phai-ngoai-hinh.js` | 5 | 0 | 🎭 NGOẠI HÌNH MÔN PHÁI + GIỚI TÍNH (world/73-mon-phai-ngoai-hinh.js) — nạp sau world/72, sau assets/mon-phai-sprites.js ===== * Chọn môn phái ở Vạn Phá |
| 109 | `assets/mon-phai-sprites2.js` | 334 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 110 | `world/74-mon-phai-8-huong.js` | 6 | 0 | 🧭 MÔN PHÁI 8 HƯỚNG — 2.5D Tiên Giới (world/74-mon-phai-8-huong.js) — nạp sau world/73 + assets/mon-phai-sprites2.js ===== * CHỈ khi đang ở Thành Tiên  |
| 111 | `assets/mon-phai-vukhi.js` | 100 | 0 | (dữ liệu ảnh/font base64 — KHÔNG đọc) |
| 112 | `world/75-mon-phai-vu-khi.js` | 5 | 0 | ⚔ VŨ KHÍ MÔN PHÁI (world/75-mon-phai-vu-khi.js) — nạp sau world/74 + assets/mon-phai-vukhi.js ===== * Vẽ vũ khí (ảnh MPW, cắt từ ô "Vũ khí" của ảnh mẫ |
| 113 | `world/76-chuyen-the.js` | 12 | 0 | 🌌 CHUYỂN THẾ ĐÀI · ĐẠO THỂ → TIÊN NHÂN ===== * Cửa vào: Thành Thị Tiên Giới → "Chuyển Thế Đài" (thay Đan Dược Các, TG.spots id 'rebirth'). * Điều kiện |
| 114 | `world/77-thanh-online.js` | 16 | 0 | 🏙 THÀNH THỊ ONLINE (world/77-thanh-online.js) ===== * Gặp người chơi khác ở Thành Thị Linh Giới (LCT, đi ngang 1 chiều) và Thành Thị Tiên Giới (TG, 2. |
| 115 | `world/78-canh-8-huong.js` | 4 | 0 | 🪽 CÁNH 8 HƯỚNG — Tiên Giới (world/78-canh-8-huong.js) — nạp sau world/74 + world/77 ===== * CHỈ khi đang ở Thành Tiên Giới (TG.on()) và nhân vật đã ch |
| 116 | `world/79-tien-gioi-ky-nang-8-huong.js` | 21 | 0 | ✨ KỸ NĂNG 8 HƯỚNG — Tiên Giới (world/79-tien-gioi-ky-nang-8-huong.js) — nạp sau world/78 ===== * Thành Tiên Giới là bản đồ thành thị (vil, không có qu |
| 117 | `systems/67-tang-quai-boss.js` | 3 | 0 | ⚔ TĂNG CHỈ SỐ BOSS (module riêng, nạp CUỐI) ===== * BOSSUP.hp = nhân MÁU boss (mọi loại boss: ngoài map b>=2, Hầm Ngục, Ma Thần, Kiếm Thánh, Tháp, Phụ |
| 118 | `systems/68-ng-reset-du-lieu-module.js` | 1 | 0 | FIX: NHÂN VẬT MỚI TẠO (ng) BỊ GIỮ KỸ NĂNG CẤP CAO (systems/68-ng-reset-du-lieu-module.js) ===== * Lỗi: ng() (core/01s) chỉ reset các trường gốc của PS |
| 119 | `ui/69-thong-bao-thu.js` | 18 | 0 |  |
| 120 | `ui/70-admin-panel.js` | 27 | 0 | 🛡 TRANG ADMIN (ui/70-admin-panel.js, nạp sau ui/69) ===== * Nút tròn 🛡 Admin nằm cạnh ✉️ Thư (left:192px, top:132px). CHỈ HIỆN với tài khoản có trong  |
| 121 | `systems/61-chong-dube-bao-mat.js` | 11 | 0 |  |
| 122 | `world/80-map-treo.js` | 22 | 0 |  |
