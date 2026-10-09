# Claude Modular Workspace

## Rule 1 — Runtime is protected
Do not modify, rename, delete, or reorder runtime files unless the task explicitly requires it.

The existing game source is the authoritative source:
- core/
- combat/
- world/
- systems/
- ui/
- pets/
- equipment/
- assets/
- index.html

## Rule 2 — Work by module
When fixing a feature, inspect only the smallest relevant module first.
Expand to dependencies only when necessary.

## Rule 3 — Preserve compatibility
Do not replace the current architecture with a different engine or import system.
Do not copy logic from older game versions.

## Rule 4 — Legacy/build files
The original build, audit reports, notes, SQL, and launch helpers are intentionally preserved.
They are reference material, not runtime modules.

## Rule 5 — Before committing a change
1. Check the affected module.
2. Check its direct dependencies.
3. Run syntax checks on changed JS.
4. Verify index.html script paths.
5. Report exactly which files changed.

## Current module map
- core/       Core engine and shared runtime
- combat/     Combat systems
- world/      World/map/NPC systems
- systems/    Game-wide systems
- ui/         Interface systems
- pets/       Pet systems
- equipment/  Equipment systems
- assets/     Static assets

## Important
This workspace was generated from the supplied ZIP without changing existing game files.
