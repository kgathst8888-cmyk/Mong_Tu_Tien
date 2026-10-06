# Mong Tu Tien — Modular Architecture / Arena v5 Fixed

This build was reconstructed from `Mong_Tu_Tien_ARENA_v5_FIXED_small.html`.

## Structure
- `assets/game-assets.js`: Base64/image assets only. Do not edit for gameplay changes.
- `core/`: engine and cross-browser error handling.
- `world/`: world/map systems.
- `ui/`: UI systems.
- `combat/`: combat/status/enemy systems.
- `systems/`: farming, save, input, arena, quest HUD.
- `equipment/`: cosmetics/shop.

## Load order
The module order in `index.html` matches the original standalone HTML script order.

## Rules for future changes
1. Do not modify Base64 unless assets are explicitly changed.
2. Prefer adding/changing the smallest relevant module.
3. Preserve old save keys and backward compatibility.
4. Do not rewrite `core/01-engine.js` unless necessary.
5. Run `node --check` on every JS file before deployment.
6. Test startup and Arena on Safari/iPhone as well as desktop.
