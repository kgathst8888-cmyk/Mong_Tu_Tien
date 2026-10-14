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


## Rule 6 — Quy trình tiết kiệm (từ Fix80, engine đã tách 22 file)
`core/01-engine.js` KHÔNG còn. Lõi game nằm ở `core/01a…01v-*.js` (nạp đúng thứ tự trong index.html). Khi sửa:
1. **Tìm vị trí**: `python3 tools/where.py TÊN` (vd `petUI pev ZS`) → in `file:dòng`. Không quét/đọc cả dự án, không đọc `assets/`, không đọc `Mong_Tu_Tien_CLAUDE.html`.
   Bảng đầy đủ: `SYMBOL_INDEX.tsv` (grep theo tên) · việc của từng file: `MODULE_MAP.md`.
2. **Mở đúng đoạn**: `sed -n 'a,bp' file` quanh dòng tìm được. Patch nhỏ bằng thay chuỗi, kiểm tra số lần khớp = 1.
3. **Kiểm tra**: `python3 tools/check.py` (đường dẫn, cú pháp, trùng const/let). Sau khi sửa xong chạy
   `python3 tools/check.py --build` (ghép lại `Mong_Tu_Tien_CLAUDE.html` + làm mới 2 file chỉ mục) rồi `--run` nếu có playwright.
4. **Không vá tay file HTML đơn** — luôn sinh bằng `tools/build.py`.

### Cạm bẫy khi tách file
- Hàm `function x(){}` chỉ "nâng" (hoisting) trong CÙNG file. Lệnh chạy ngay lúc nạp (vd `const _a=x; x=function…`) ở file A KHÔNG được gọi hàm khai báo ở file B nạp SAU. Đặt móc/đoạn chạy-ngay ở file sau khai báo.
- `const/let` cấp cao nhất không được trùng tên giữa các file (check.py báo).
- `core/01h-skill-fx.js` (76KB) là 1 IIFE `ZS` duy nhất — không cắt nhỏ được mà không viết lại.
