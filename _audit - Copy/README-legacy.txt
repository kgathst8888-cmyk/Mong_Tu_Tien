Mộng Tu Tiên / Kiếm Tiên Hoang Mạc — modular build
====================================================

FILES
- index.html: game entry point.
- assets/game-assets.js: isolated Base64/data-URI asset module (images + fonts).
- js/00..18-module.js: gameplay/feature modules kept in original execution order.

IMPORTANT
- The modules are loaded as classic scripts in the same order as the original HTML,
  so existing global state and gameplay flow are preserved.
- The visible ReferenceError in the supplied screenshot was caused by the combat
  module's late reference to ZKf across the ZC initialization boundary. The fix
  uses a late-bound window.__ZK_NAMES table, without changing skill logic.
- For future feature work, Claude can ignore assets/game-assets.js unless visual
  assets are being changed.
- index.html still needs the assets/ and js/ folders beside it.

Also supplied:
- Mong_Tu_Tien_fixed.html: single-file fixed version for direct upload/deployment.
