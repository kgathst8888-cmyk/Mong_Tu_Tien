# Arena v2.1 hotfix — 2026-10-06

## Fix
- Replaced delegated document-level click handling for Arena opponent buttons with direct button handlers after each Arena render.
- Added `type="button"` to Arena challenge buttons.
- Added a short 300ms battle-start delay so the battle screen is visibly mounted before the first turn.
- Kept watchable turn-by-turn battle, pause, speed, skip, and replay behavior.
- Arena storage key bumped to `kthm2_arena_v2_1` to avoid schema ambiguity with v2.
- No Base64/game-assets changes.

## Validation
- All JS modules pass `node --check`.
- Concatenated JS in actual index.html script order passes `node --check`.
