# Mong Tu Tien — Full Runtime Audit / Hotfix 1

## Scope
- Audited the current `Mong_Tu_Tien_Modular_v2_PLAYABLE.zip`.
- Preserved gameplay modules and Base64 asset payloads.
- No asset payloads were rewritten.

## Checks passed
- 20 JavaScript modules parse successfully with Node syntax check.
- Concatenated script-order syntax check passed (no cross-file lexical declaration collision).
- All 20 `<script src>` references in `index.html` point to existing files.
- All modules execute through top-level initialization in a browser-like VM stub.
- Five startup game frames (`step(); draw();`) execute successfully in the browser-like VM audit.

## Fixes
1. `core/00-error-handler.js`
   - Deduplicates repeated error banners.
   - Shows source filename/line/column and short stack when available.
   - Ignores the ambiguous cross-origin `Script error.` event when the browser supplies no source or error object. This prevents a false-positive banner without hiding identifiable game errors.
   - Keeps errors in `window.__gameErrors` and logs them to the console.
2. `core/01-engine.js`
   - Hardened the `CanvasRenderingContext2D.prototype.shadowBlur` optimization.
   - The optimization now checks for the API and accessor descriptor before redefining the property and safely skips the optimization if unsupported.
   - This improves Safari/WebKit compatibility.
3. `index.html`
   - Build marker updated to `modular-architecture-2026-10-06-hotfix1`.

## Important
The screenshot showed the game's own error banner displaying only `Script error.`. That message is inherently ambiguous in Safari/WebKit when the browser withholds the source. The hotfix removes that false-positive form and makes any future identifiable JS error report its exact source.
