# Arena v3.2 — Stable battle-map fix

## Root cause fixed
Arena v3.1 called `makeBattle(power(), opponent)` while the function treated its first argument as an object and read `me.pw`. This produced `NaN` opponent HP, an empty event list, and Safari then failed at `events[events.length-1].at`.

## Fixes
- `makeBattle()` now accepts a numeric player power and validates both power values.
- Opponent list is cached so the selected opponent keeps the displayed stats.
- Empty event arrays are handled safely; no invalid `events[-1]` access.
- Canvas scene waits for a valid measured size before rendering.
- Pause now actually freezes the battle clock.
- Replay remains non-rewarding.
- Build marker updated to `modular-architecture-2026-10-06-arena3-stable`.

## Validation
- `node --check systems/19-arena.js` passed.
- All 21 JavaScript modules concatenated in actual index.html load order passed `node --check`.
- Base64/game-assets.js was not modified.
