#!/usr/bin/env python3
"""Xuất sprite-sheet WebP (nền trong suốt) 12 quái Tiên Giới từ assets/tien-gioi-quai-art.js bằng Chromium headless (playwright + Pillow).
Chạy: python3 tools/gen_tg_quai.py [id ...]  →  assets/tien-gioi-quai/<id>.webp (1280×1280, lưới 4×4 khung 320px: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công)
và tools/_xem-truoc.png (bảng xem nhanh, không nằm trong game)."""
import base64, io, pathlib, sys
from playwright.sync_api import sync_playwright
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
out = root/'assets'/'tien-gioi-quai'; out.mkdir(parents=True, exist_ok=True)
js = (root/'assets'/'tien-gioi-quai-art.js').read_text(encoding='utf8')
only = sys.argv[1:]; prev = {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content('<canvas></canvas>'); pg.add_script_tag(content=js)
    ids = pg.evaluate('TGMART.SP.map(s=>s.id)')
    for i, sid in enumerate(ids):
        if only and sid not in only: continue
        d = pg.evaluate('''i=>{const F=TGMART.FR,S=F.size,cv=document.createElement('canvas');cv.width=S*F.cols;cv.height=S*F.cols;const c=cv.getContext('2d');
          for(let f=0;f<F.n;f++){c.save();c.translate((f%F.cols)*S,Math.floor(f/F.cols)*S);c.beginPath();c.rect(0,0,S,S);c.clip();TGMART.draw(c,i,f);c.restore()}
          return cv.toDataURL('image/png')}''', i)
        im = Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')
        im.save(out/f'{sid}.webp', 'WEBP', quality=86, alpha_quality=90, method=6); prev[sid] = im
        print('ok', sid, (out/f'{sid}.webp').stat().st_size//1024, 'KB')
    b.close()
if prev:
    S = 320; W = Image.new('RGBA', (S*6, S*6), (60, 74, 100, 255))
    for n, sid in enumerate(prev):
        for k, f in enumerate((0, 6, 12)):
            W.alpha_composite(prev[sid].crop(((f%4)*S, (f//4)*S, (f%4+1)*S, (f//4+1)*S)), (((n%2)*3+k)*S, (n//2)*S))
    W.convert('RGB').save(root/'tools'/'_xem-truoc.png')
