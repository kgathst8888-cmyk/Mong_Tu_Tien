# Arena v2 audit — 2026-10-06

- Added watchable Arena battles without changing the main combat engine.
- Added turn-by-turn HP bars, combat log, pause/resume, 1x/2x/4x speed, skip, and replay of the last completed battle.
- Arena save key moved from `kthm2_arena_v1` to `kthm2_arena_v2` to preserve the previous v1 data rather than silently changing its schema.
- Replay does not consume another daily attempt or grant rewards again.
- Main game assets/Base64 payloads were not rewritten.
- All JavaScript files pass `node --check`.
- This remains a local simulation; real multiplayer/server-authoritative PvP is a later step.
