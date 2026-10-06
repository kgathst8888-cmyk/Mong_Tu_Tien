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
