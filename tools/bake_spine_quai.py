#!/usr/bin/env python3
"""Fix421 — Bake Spine 4.2 (json+atlas+png) -> sprite-sheet webp cho quái map Nhân Giới.
Dùng: python3 tools/bake_spine_quai.py <thư mục chứa json/atlas/png> <id> <thư mục ra> [cell=320]
Sheet 4x4: 0-3 đứng · 4-9 di chuyển (tư thế gốc, module tự nhún/nghiêng) · 10-15 tấn công (lấy từ animation).
In ra JSON {ox,oy,cell,scale,w,h,events}: ox,oy = chân nhân vật (px trong ô), h = chiều cao thân (px, không tính vũ khí vươn xa).
"""
import sys, os, json, math, glob
import numpy as np
from PIL import Image

D2R = math.pi / 180.0

def parse_atlas(path):
    regs = {}; page = None; cur = None
    for raw in open(path, encoding='utf8').read().split('\n'):
        ln = raw.rstrip()
        if not ln.strip():
            continue
        if not raw.startswith(' ') and ':' not in ln:
            if page is None and ln.lower().endswith(('.png', '.jpg', '.webp')):
                page = ln.strip(); continue
            cur = {'name': ln.strip(), 'rotate': False}; regs[cur['name']] = cur; continue
        k, v = [s.strip() for s in ln.split(':', 1)]
        if cur is None:
            continue
        if k == 'rotate': cur['rotate'] = (v == 'true') or v == '90'
        elif k == 'xy': cur['xy'] = [int(x) for x in v.split(',')]
        elif k == 'size': cur['size'] = [int(x) for x in v.split(',')]
        elif k == 'orig': cur['orig'] = [int(x) for x in v.split(',')]
        elif k == 'offset': cur['offset'] = [int(x) for x in v.split(',')]
    return regs


class Skel:
    def __init__(self, data):
        self.d = data
        self.bones = data['bones']
        self.idx = {b['name']: i for i, b in enumerate(self.bones)}
        self.par = [self.idx[b['parent']] if 'parent' in b else -1 for b in self.bones]
        self.slots = data['slots']
        self.skin = data['skins'][0]['attachments'] if isinstance(data['skins'], list) else data['skins']['default']
        self.ik = sorted(data.get('ik', []), key=lambda c: c.get('order', 0))

    def setup(self):
        return [dict(x=b.get('x', 0), y=b.get('y', 0), r=b.get('rotation', 0), sx=b.get('scaleX', 1), sy=b.get('scaleY', 1)) for b in self.bones]

    @staticmethod
    def curve_t(fr, t0, t1, t):
        # dữ liệu mẫu chỉ có tuyến tính / stepped (không có bezier) -> nội suy tuyến tính
        return (t - t0) / (t1 - t0) if t1 != t0 else 0

    def sample(self, frames, t, keys, defaults):
        if not frames: return list(defaults)
        def val(fr): return [fr.get(k, dv) for k, dv in zip(keys, defaults)]
        if t <= frames[0].get('time', 0): return val(frames[0])
        for i in range(len(frames) - 1):
            f0, f1 = frames[i], frames[i + 1]
            t0, t1 = f0.get('time', 0), f1.get('time', 0)
            if t0 <= t <= t1:
                a = self.curve_t(f0, t0, t1, t)
                if f0.get('curve') == 'stepped': a = 0
                v0, v1 = val(f0), val(f1)
                return [p + (q - p) * a for p, q in zip(v0, v1)]
        return val(frames[-1])

    def pose(self, anim, t):
        loc = self.setup()
        att = {s['name']: s.get('attachment') for s in self.slots}
        if anim:
            for bn, ch in anim.get('bones', {}).items():
                i = self.idx[bn]; L = loc[i]; b = self.bones[i]
                if 'rotate' in ch:
                    L['r'] = b.get('rotation', 0) + self.sample(ch['rotate'], t, ['value'], [0])[0]
                if 'translate' in ch:
                    dx, dy = self.sample(ch['translate'], t, ['x', 'y'], [0, 0]); L['x'] = b.get('x', 0) + dx; L['y'] = b.get('y', 0) + dy
                if 'scale' in ch:
                    sx, sy = self.sample(ch['scale'], t, ['x', 'y'], [1, 1]); L['sx'] = b.get('scaleX', 1) * sx; L['sy'] = b.get('scaleY', 1) * sy
            for sn, ch in anim.get('slots', {}).items():
                fr = ch.get('attachment')
                if fr:
                    cur = None
                    for f in fr:
                        if f.get('time', 0) <= t: cur = f.get('name')
                    att[sn] = cur
        return loc, att

    def world(self, loc):
        W = [None] * len(self.bones)
        for i, L in enumerate(loc):
            c, s = math.cos(L['r'] * D2R), math.sin(L['r'] * D2R)
            a, b, cc, d = c * L['sx'], -s * L['sy'], s * L['sx'], c * L['sy']
            p = self.par[i]
            if p < 0:
                W[i] = [a, b, L['x'], cc, d, L['y']]
            else:
                P = W[p]
                W[i] = [P[0] * a + P[1] * cc, P[0] * b + P[1] * d, P[0] * L['x'] + P[1] * L['y'] + P[2],
                        P[3] * a + P[4] * cc, P[3] * b + P[4] * d, P[3] * L['x'] + P[4] * L['y'] + P[5]]
        return W

    def solve_ik(self, loc):
        W = self.world(loc)
        for c in self.ik:
            if c.get('mix', 1) <= 0: continue
            tg = self.idx[c['target']]; tx, ty = W[tg][2], W[tg][5]
            bl = [self.idx[n] for n in c['bones']]
            stretch = c.get('stretch', False); bend = 1 if c.get('bendPositive', True) else -1
            if len(bl) == 1:
                i = bl[0]; p = self.par[i]; P = W[p] if p >= 0 else [1, 0, 0, 0, 1, 0]
                det = P[0] * P[4] - P[1] * P[3]
                x, y = tx - P[2], ty - P[5]
                px = (x * P[4] - y * P[1]) / det - loc[i]['x']; py = (y * P[0] - x * P[3]) / det - loc[i]['y']
                loc[i]['r'] = math.atan2(py, px) / D2R
                if stretch:
                    l = self.bones[i].get('length', 0) * loc[i]['sx']; dd = math.hypot(px, py)
                    pass
            else:
                pi_, ci = bl
                Lp, Lc = loc[pi_], loc[ci]
                pp = self.par[pi_]; PP = W[pp] if pp >= 0 else [1, 0, 0, 0, 1, 0]
                det = PP[0] * PP[4] - PP[1] * PP[3]
                def toP(wx, wy):
                    x, y = wx - PP[2], wy - PP[5]
                    return (x * PP[4] - y * PP[1]) / det, (y * PP[0] - x * PP[3]) / det
                px, py = Lp['x'], Lp['y']
                psx = Lp['sx']; csx = Lc['sx']
                l1 = math.hypot(Lc['x'] * psx, 0) if False else None
                # vị trí gốc con trong không gian cha-của-cha: dùng world hiện tại
                cw = W[ci]
                cx_, cy_ = toP(cw[2], cw[5]); dx, dy = cx_ - px, cy_ - py
                l1 = math.hypot(dx, dy)
                l2 = self.bones[ci].get('length', 0) * abs(csx)
                if l1 < 1e-4:
                    continue
                txp, typ = toP(tx, ty); txp -= px; typ -= py
                dd = txp * txp + typ * typ
                l2 *= abs(psx)
                cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2)
                a2 = None
                if cos < -1: cos = -1; a2 = math.pi * bend
                elif cos > 1:
                    cos = 1; a2 = 0
                    if stretch:
                        s = math.sqrt(dd) / (l1 + l2)
                        Lp['sx'] *= s; Lp['sy'] *= s
                        l1 *= s
                if a2 is None: a2 = math.acos(cos) * bend
                a = l1 + l2 * cos; b = l2 * math.sin(a2)
                a1 = math.atan2(typ * a - txp * b, txp * a + typ * b)
                os_ = math.atan2(Lc['y'], Lc['x'])
                Lp['r'] = a1 / D2R - os_ / D2R
                Lc['r'] = (a2 + os_) / D2R
            W = self.world(loc)
        return W


def raster(canvas, tri_dst, tri_uv, tex):
    """Vẽ 1 tam giác (toạ độ đích px, uv px trong atlas) lên canvas premultiplied float32 HxWx4 (over)."""
    H, Wd = canvas.shape[:2]
    xs = tri_dst[:, 0]; ys = tri_dst[:, 1]
    x0, x1 = int(max(0, math.floor(xs.min()))), int(min(Wd - 1, math.ceil(xs.max())))
    y0, y1 = int(max(0, math.floor(ys.min()))), int(min(H - 1, math.ceil(ys.max())))
    if x1 < x0 or y1 < y0: return
    (ax, ay), (bx, by), (cx, cy) = tri_dst
    den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
    if abs(den) < 1e-9: return
    gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
    w0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / den
    w1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den
    w2 = 1 - w0 - w1
    e = -0.02
    m = (w0 >= e) & (w1 >= e) & (w2 >= e)
    if not m.any(): return
    u = w0 * tri_uv[0, 0] + w1 * tri_uv[1, 0] + w2 * tri_uv[2, 0]
    v = w0 * tri_uv[0, 1] + w1 * tri_uv[1, 1] + w2 * tri_uv[2, 1]
    th, tw = tex.shape[:2]
    u = np.clip(u - .5, 0, tw - 1.001); v = np.clip(v - .5, 0, th - 1.001)
    iu = u.astype(np.int32); iv = v.astype(np.int32); fu = (u - iu)[..., None]; fv = (v - iv)[..., None]
    s = (tex[iv, iu] * (1 - fu) * (1 - fv) + tex[iv, iu + 1] * fu * (1 - fv) + tex[iv + 1, iu] * (1 - fu) * fv + tex[iv + 1, iu + 1] * fu * fv)
    sub = canvas[y0:y1 + 1, x0:x1 + 1]
    mm = m[..., None]
    out = s + sub * (1 - s[..., 3:4])
    canvas[y0:y1 + 1, x0:x1 + 1] = np.where(mm, out, sub)


def build_mesh(sk, W, slot, att, regs):
    """Trả (verts_world Nx2 (y-up), uv_px Nx2, tris) hoặc None."""
    a = att
    typ = a.get('type', 'region')
    name = a.get('path', None) or slot_att_name[0]
    r = regs.get(name)
    if r is None: return None
    sz = r['size']; x0, y0 = r['xy']
    bi = sk.idx[slot['bone']]; B = W[bi]
    if typ == 'region':
        w, h = a['width'], a['height']
        sxs, sys_ = a.get('scaleX', 1), a.get('scaleY', 1); rot = a.get('rotation', 0) * D2R
        lx, ly = a.get('x', 0), a.get('y', 0)
        cr, sr = math.cos(rot), math.sin(rot)
        corners = [(-w / 2 * sxs, h / 2 * sys_), (w / 2 * sxs, h / 2 * sys_), (w / 2 * sxs, -h / 2 * sys_), (-w / 2 * sxs, -h / 2 * sys_)]
        uvn = [(0, 0), (1, 0), (1, 1), (0, 1)]
        vs = []
        for (cx, cy) in corners:
            px, py = cx * cr - cy * sr + lx, cx * sr + cy * cr + ly
            vs.append((B[0] * px + B[1] * py + B[2], B[3] * px + B[4] * py + B[5]))
        tris = [(0, 1, 2), (0, 2, 3)]
    else:
        uvn = [(a['uvs'][i], a['uvs'][i + 1]) for i in range(0, len(a['uvs']), 2)]
        n = len(uvn); vv = a['vertices']; vs = []
        if len(vv) == n * 2:
            for i in range(n):
                px, py = vv[i * 2], vv[i * 2 + 1]
                vs.append((B[0] * px + B[1] * py + B[2], B[3] * px + B[4] * py + B[5]))
        else:
            p = 0
            for i in range(n):
                cnt = int(vv[p]); p += 1; wx = wy = 0
                for _ in range(cnt):
                    bj = int(vv[p]); vx, vy, wt = vv[p + 1], vv[p + 2], vv[p + 3]; p += 4
                    M = W[bj]; wx += (M[0] * vx + M[1] * vy + M[2]) * wt; wy += (M[3] * vx + M[4] * vy + M[5]) * wt
                vs.append((wx, wy))
        t = a['triangles']; tris = [(t[i], t[i + 1], t[i + 2]) for i in range(0, len(t), 3)]
    # uv -> px atlas
    uvp = []
    for (u, v) in uvn:
        if r['rotate']:
            wp, hp = sz[1], sz[0]
            uvp.append((x0 + v * wp, y0 + (1 - u) * hp))
        else:
            uvp.append((x0 + u * sz[0], y0 + v * sz[1]))
    return np.array(vs, dtype=np.float64), np.array(uvp, dtype=np.float64), tris


slot_att_name = ['']


def render(sk, W, attmap, regs, tex, tf, size):
    canvas = np.zeros((size, size, 4), dtype=np.float32)
    for slot in sk.slots:
        an = attmap.get(slot['name'])
        if not an: continue
        at = sk.skin.get(slot['name'], {}).get(an)
        if not at: continue
        slot_att_name[0] = an
        res = build_mesh(sk, W, slot, at, regs)
        if res is None: continue
        vs, uvp, tris = res
        sc, ox, oy = tf
        dst = np.stack([vs[:, 0] * sc + ox, -vs[:, 1] * sc + oy], axis=1)
        for t in tris:
            raster(canvas, dst[list(t)], uvp[list(t)], tex)
    return canvas


def main():
    src, ident, out = sys.argv[1], sys.argv[2], sys.argv[3]
    cell = int(sys.argv[4]) if len(sys.argv) > 4 else 320
    hide = [s for s in (sys.argv[5].split(',') if len(sys.argv) > 5 else []) if s]
    js = glob.glob(os.path.join(src, '*.json'))[0]; at = glob.glob(os.path.join(src, '*.atlas'))[0]; pn = glob.glob(os.path.join(src, '*.png'))[0]
    data = json.load(open(js, encoding='utf8')); regs = parse_atlas(at)
    tex = np.asarray(Image.open(pn).convert('RGBA'), dtype=np.float32) / 255.0
    tex[..., :3] *= tex[..., 3:4]  # premultiply
    sk = Skel(data)
    for s in sk.slots:
        if s['name'] in hide: s['attachment'] = None
    aname = list(data['animations'].keys())[0]; anim = data['animations'][aname]
    ATK_T = [0.08, 0.2, 0.33, 0.47, 0.62, 0.82]

    def frame_data(t, use_anim=True):
        loc, att = sk.pose(anim if use_anim else None, t)
        if not use_anim:
            att = {s['name']: s.get('attachment') for s in sk.slots}
        else:
            for k in hide: att[k] = None
        W = sk.solve_ik(loc) if sk.ik else sk.world(loc)
        return W, att

    # 1) bbox hợp của tất cả khung -> khớp ô
    poses = [frame_data(0, False)] + [frame_data(t) for t in ATK_T]
    big = 1024
    pts = []
    for (W, att) in poses:
        c = render(sk, W, att, regs, tex, (1.0, big / 2, big * .75), big)
        ys, xs = np.where(c[..., 3] > .04)
        pts.append((xs.min(), xs.max(), ys.min(), ys.max()))
    x_min = min(p[0] for p in pts) - big / 2; x_max = max(p[1] for p in pts) - big / 2
    y_top = min(p[2] for p in pts) - big * .75; y_bot = max(p[3] for p in pts) - big * .75
    idle = pts[0]
    wspan = (x_max - x_min); hspan = (y_bot - y_top)
    pad = 0.06
    sc = min(cell * (1 - 2 * pad) / wspan, cell * (1 - 2 * pad) / hspan)
    # chân nhân vật = y gốc skeleton (0) hoặc đáy hình lúc idle
    foot = y_bot  # đáy lớn nhất (px y-down so với gốc)
    ox = cell / 2 - (x_min + x_max) / 2 * sc
    oy = cell * pad + (-y_top) * sc  # vị trí y của gốc skeleton trong ô
    foot_px = oy + foot * sc
    S = 2  # siêu lấy mẫu
    sheet = Image.new('RGBA', (cell * 4, cell * 4), (0, 0, 0, 0))

    def put(idx, W, att):
        c = render(sk, W, att, regs, tex, (sc * S, ox * S, oy * S), cell * S)
        rgb = c[..., :3]; a = c[..., 3:4]
        un = np.where(a > 1e-4, rgb / np.maximum(a, 1e-4), 0)
        arr = np.concatenate([np.clip(un, 0, 1), np.clip(a, 0, 1)], axis=2)
        im = Image.fromarray((arr * 255 + .5).astype(np.uint8), 'RGBA').resize((cell, cell), Image.LANCZOS)
        sheet.paste(im, ((idx % 4) * cell, (idx // 4) * cell))

    W0, a0 = poses[0]
    for i in range(10):
        put(i, W0, a0)  # 0-9 tư thế gốc (di chuyển / đứng được module nhún nhẹ)
    for k, t in enumerate(ATK_T):
        W, a = frame_data(t); put(10 + k, W, a)
    os.makedirs(out, exist_ok=True)
    sheet.save(os.path.join(out, ident + '.webp'), 'WEBP', quality=88, method=6)
    # chiều cao thân lúc idle (px trong ô)
    body_h = (idle[3] - idle[2]) * sc
    i_top = oy + (idle[2] - big * .75) * sc; i_bot = oy + (idle[3] - big * .75) * sc
    i_cx = ox + ((idle[0] + idle[1]) / 2 - big / 2) * sc
    ev = anim.get('events', [])
    print(json.dumps({'id': ident, 'cell': cell, 'ox': round(ox, 1), 'foot': round(foot_px, 1), 'scale': round(sc, 4), 'bodyH': round(body_h, 1), 'top': round(i_top, 1), 'bot': round(i_bot, 1), 'cx': round(i_cx, 1),
                      'x': [round(ox + x_min * sc, 1), round(ox + x_max * sc, 1)], 'dur': 1, 'hitT': ev[0]['time'] if ev else .47}))


if __name__ == '__main__':
    main()
