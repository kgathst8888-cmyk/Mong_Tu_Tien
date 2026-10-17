# Audit Arena v5 — Real Map Combat

## Mục tiêu
Thay battle simulation đứng yên của Arena v4 bằng combat chạy trên chính canvas/game renderer của map.

## Đã làm
- `systems/19-arena.js` dùng trực tiếp renderer `hero()` của engine map.
- Player Arena dùng `CHR`, `PS`, `sks()`, `cast()`, `fire()`, `dm()` thật.
- Skill special type 13/16/17 giữ dash/jump của engine.
- Có thêm lướt/nhảy Arena để nhân vật không đứng bất động giữa các skill.
- Player có nút AUTO/MANUAL, nút NHẢY và skill bar lấy tên/icon thật.
- Opponent dùng `RIGI` + `WPI/WXI` thật, có chạy, nhảy, attack animation và skill data thật.
- Canvas Arena là canvas chính của game; không tạo canvas/Base64 riêng.
- `bo`/`step`/`draw` chỉ được chuyển tạm trong lúc Arena active, sau trận restore lại context game.
- Replay vẫn giữ, không nhận thưởng lần hai.
- Save key Arena vẫn là `kthm2_arena_v3`.
- Không chỉnh `assets/game-assets.js`.

## Validation
- `node --check systems/19-arena.js`: PASS
- `node --check` toàn bộ `core/combat/equipment/systems/ui/world`: PASS
- ZIP integrity: kiểm tra bằng `unzip -t` sau khi đóng gói.

## Giới hạn
- PvE local, chưa phải server-authoritative PvP.
- Đối thủ dùng sprite/weapon/animation thật nhưng phần logic skill của đối thủ là Arena AI riêng để tránh làm hỏng context của engine player.
- Arena không sửa dữ liệu Base64.
