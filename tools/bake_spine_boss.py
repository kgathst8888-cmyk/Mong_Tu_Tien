#!/usr/bin/env python3
"""Fix440 — Bake Spine 4.2 (json+atlas 'bounds'+png) -> 1 sprite-sheet webp nhiều animation cho BOSS.
Tái sử dụng Skel/raster/build_mesh/render của tools/bake_spine_quai.py (không sửa file đó).
Thêm: atlas định dạng 4.x (bounds), nhiều animation, drawOrder.
Dùng: python3 tools/bake_spine_boss.py <thư mục json/atlas/png> <id> <thư mục ra> [cell=320] [flip=0]
In ra JSON meta (ô, chân, tỉ lệ, khung từng animation) -> dán vào world/143-ac-ma-spine.js (AMS.M).
"""
import sys, os, json, glob, importlib.util
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
_sp = importlib.util.spec_from_file_location('bsq', os.path.join(HERE, 'bake_spine_quai.py'))
bsq = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(bsq)

ANIMS = [('idle', 8, 2.0), ('move', 10, 1.0), ('attack', 12, 1.0), ('skill', 14, 2.0), ('hit', 3, 0.3333)]
COLS = 8


def parse_atlas4(path):
    regs = {}; cur = None; page = None
    for raw in open(path, encoding='utf8').read().split('\n'):
        ln = raw.strip()
        if not ln: continue
        if ':' not in ln:
            if page is None and ln.lower().endswith(('.png', '.jpg', '.webp')): page = ln; continue
            cur = {'rotate': False, 'xy': [0, 0], 'size': [1, 1]}; regs[ln] = cur; continue
        if cur is None: continue
        k, v = [s.strip() for s in ln.split(':', 1)]
        if k == 'bounds':
            x, y, w, h = [int(n) for n in v.split(',')]; cur['xy'] = [x, y]; cur['size'] = [w, h]
        elif k == 'rotate': cur['rotate'] = v in ('true', '90')
        elif k == 'xy': cur['xy'] = [int(n) for n in v.split(',')]
        elif k == 'size': cur['size'] = [int(n) for n in v.split(',')]
    return regs


def draw_order(sk, anim, t):
    """Thứ tự vẽ theo timeline drawOrder (khoá gần nhất <= t; khoá không có offsets = thứ tự gốc)."""
    base = list(sk.slots); key = None
    for f in (anim or {}).get('drawOrder', []):
        if f.get('time', 0) <= t: key = f
    if not key or not key.get('offsets'): return base
    n = len(base); out = [None] * n; used = set()
    name_i = {s['name']: i for i, s in enumerate(base)}
    for o in key['offsets']:
        i = name_i[o['slot']]; j = i + o['offset']
        if 0 <= j < n: out[j] = base[i]; used.add(i)
    rest = [base[i] for i in range(n) if i not in used]; k = 0
    for j in range(n):
        if out[j] is None: out[j] = rest[k]; k += 1
    return out


def main():
    src, ident, outd = sys.argv[1], sys.argv[2], sys.argv[3]
    cell = int(sys.argv[4]) if len(sys.argv) > 4 else 320
    flip = (sys.argv[5] == '1') if len(sys.argv) > 5 else False
    data = json.load(open(glob.glob(os.path.join(src, '*.json'))[0], encoding='utf8'))
    regs = parse_atlas4(glob.glob(os.path.join(src, '*.atlas'))[0])
    pim = Image.open(glob.glob(os.path.join(src, '*.png'))[0]).convert('RGBA')
    # atlas có thể khai báo 'size:' lớn hơn PNG thật (xuất ở tỉ lệ nhỏ) -> quy đổi toạ độ vùng ảnh
    asz = [int(n) for n in [l for l in open(glob.glob(os.path.join(src, '*.atlas'))[0], encoding='utf8') if l.startswith('size:')][0].split(':')[1].split(',')]
    k = pim.size[0] / asz[0]
    for r in regs.values():
        r['xy'] = [r['xy'][0] * k, r['xy'][1] * k]; r['size'] = [r['size'][0] * k, r['size'][1] * k]
    tex = np.asarray(pim, dtype=np.float32) / 255.0
    tex[..., :3] *= tex[..., 3:4]
    sk = bsq.Skel(data); base_slots = list(sk.slots)

    def frame(an, t):
        anim = data['animations'][an] if an else None
        loc, att = sk.pose(anim, t)
        if not an: att = {s['name']: s.get('attachment') for s in base_slots}
        return sk.world(loc), att, draw_order(sk, anim, t)

    def paint(W, att, order, tf, size):
        sk.slots = order
        try: return bsq.render(sk, W, att, regs, tex, tf, size)
        finally: sk.slots = base_slots

    # danh sách khung
    frames = []
    for an, n, ln in ANIMS:
        for i in range(n):
            t = ln * i / n if an in ('idle', 'move') else ln * i / max(1, n - 1)
            frames.append((an, i, t))
    # 1) bbox hợp (render nhẹ) -> tỉ lệ ô. Đơn vị Spine, y xuống so với gốc skeleton
    big = 1024; PS = .4; ob = (big / 2, big * .82); pts = []
    for an, i, t in frames:
        W, att, od = frame(an, t); c = paint(W, att, od, (PS, ob[0], ob[1]), big)
        ys, xs = np.where(c[..., 3] > .04)
        if len(xs): pts.append(((xs.min() - ob[0]) / PS, (xs.max() - ob[0]) / PS, (ys.min() - ob[1]) / PS, (ys.max() - ob[1]) / PS, an, i))
    x_min = min(p[0] for p in pts); x_max = max(p[1] for p in pts)
    y_top = min(p[2] for p in pts); y_bot = max(p[3] for p in pts)
    idle = [p for p in pts if p[4] == 'idle']
    foot = max(p[3] for p in idle)          # đáy nhân vật lúc đứng (đơn vị Spine, y xuống)
    pad = .04
    sc = min(cell * (1 - 2 * pad) / (x_max - x_min), cell * (1 - 2 * pad) / (y_bot - y_top))
    ox = cell / 2 - (x_min + x_max) / 2 * sc
    oy = cell * pad + (-y_top) * sc
    foot_px = oy + foot * sc
    S = 2
    rows = (len(frames) + COLS - 1) // COLS
    sheet = Image.new('RGBA', (cell * COLS, cell * rows), (0, 0, 0, 0))
    for k, (an, i, t) in enumerate(frames):
        W, att, od = frame(an, t); c = paint(W, att, od, (sc * S, ox * S, oy * S), cell * S)
        rgb = c[..., :3]; a = c[..., 3:4]
        un = np.where(a > 1e-4, rgb / np.maximum(a, 1e-4), 0)
        im = Image.fromarray((np.concatenate([np.clip(un, 0, 1), np.clip(a, 0, 1)], 2) * 255 + .5).astype(np.uint8), 'RGBA').resize((cell, cell), Image.LANCZOS)
        if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        sheet.paste(im, ((k % COLS) * cell, (k // COLS) * cell))
    os.makedirs(outd, exist_ok=True)
    sheet.save(os.path.join(outd, ident + '.webp'), 'WEBP', quality=88, method=6)
    ip = [p for p in idle]
    body_top = min(p[2] for p in ip); body_bot = max(p[3] for p in ip)
    ox_out = (cell - ox) if flip else ox
    starts = {}; k = 0
    for an, n, ln in ANIMS: starts[an] = {'s': k, 'n': n, 'len': ln}; k += n
    print(json.dumps({'id': ident, 'cell': cell, 'cols': COLS, 'ox': round(ox_out, 1), 'foot': round(foot_px, 1),
                      'bodyH': round((body_bot - body_top) * sc, 1), 'scale': round(sc, 4), 'anims': starts, 'flip': flip,
                      'hitT': {'attack': 0.4}}))


if __name__ == '__main__':
    main()
