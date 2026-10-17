# Icon Tiệm Y Phục + Linh Điền lên hàng HUD (ui/58-hud-tiem-linh-dien.js)
- 2 nút nhỏ 26px 👘 "Y Phục" và 🌱 "Linh Điền" CÙNG HÀNG với 🏆 Xếp hạng, bên trái ⚔️ Đấu trường (hàng: 👘 🌱 ⚔️ 💀 🏆). Màn hẹp -> xuống hàng ngay dưới 🏆.
- Chỉ hiện ở Làng (đúng lúc icon nổi cũ lẽ ra được vẽ). Bấm 👘 = FSH.show(); bấm 🌱 = FGATE.enter().
- Icon nổi cũ + vùng bấm canvas cũ bị tắt khi HUDX.on (mặc định true; HUDX.on=false để quay lại kiểu cũ).
- Patch nhỏ: equipment/14-cosmetics-shop.js (banner + click, cờ HUDX.shop), world/10-farming-map.js (gateDraw + click, cờ HUDX.gate, xuất window.FGATE).
