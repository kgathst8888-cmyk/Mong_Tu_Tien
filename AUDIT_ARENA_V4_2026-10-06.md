# AUDIT ARENA v4 — 2026-10-06

## Mục tiêu
Arena dùng nhân vật thật + skill data thật thay cho fighter hình học và log combat giả.

## Đã kiểm tra
- `systems/19-arena.js`: `node --check` PASS.
- `index.html` vẫn load `systems/19-arena.js` sau `core/01-engine.js` và các module combat/UI hiện có.
- Không sửa `assets/game-assets.js` và không inline Base64 mới.
- Arena giữ save key `kthm2_arena_v3` để không tạo save arena mới không cần thiết.
- Player skill lấy từ `CHR/PS` hiện tại; opponent skill lấy từ cùng bảng `CHR`.
- Skill name/icon/MP/cooldown/damage multiplier dùng từ skill array thật; skill healing/buff được xử lý riêng để tránh trừ HP sai.
- Canvas kích thước luôn clamp >= 1 để tránh lỗi Safari `IndexSizeError`.
- Có replay không nhận lại thưởng.

## Giới hạn
- Đây vẫn là PvE/local simulation, chưa phải PvP online server-authoritative.
- Sprite hiện dùng base character images đã có trong game; chưa tạo sprite-sheet attack riêng cho từng skill. Animation skill là lớp VFX/weapon animation trên sprite thật.
