#!/usr/bin/env python3
"""Xuất sprite-sheet PNG (nền trong suốt) 12 quái Tiên Giới từ assets/tien-gioi-quai-art.js bằng Chromium headless.
Chạy: python3 tools/gen_tg_quai.py   (cần playwright + chromium). Kết quả: assets/tien-gioi-quai/<id>.png (1024x1024, 4x4 khung 256px)
và assets/tien-gioi-quai/_xem-truoc.png (bảng xem nhanh). Khung: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công."""
import base64, pathlib, sys
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'assets' / 'tien-gioi-quai'; out.mkdir(parents=True, exist_ok=True)
js = (root / 'assets' / 'tien-gioi-quai-art.js').read_text(encoding='utf8')
only = sys.argv[1:]  # tuỳ chọn: id cần vẽ lại
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content('<canvas id=c></canvas>'); pg.add_script_tag(content=js)
    ids = pg.evaluate('TGMART.SP.map(s=>s.id)')
    for i, sid in enumerate(ids):
        if only and sid not in only: continue
        d = pg.evaluate('''i=>{const F=TGMART.FR,S=F.size,cv=document.createElement('canvas');cv.width=S*F.cols;cv.height=S*F.cols;const c=cv.getContext('2d');
          for(let f=0;f<F.n;f++){c.save();c.translate((f%F.cols)*S,Math.floor(f/F.cols)*S);c.beginPath();c.rect(0,0,S,S);c.clip();TGMART.draw(c,i,f);c.restore()}
          return cv.toDataURL('image/png')}''', i)
        (out / f'{sid}.png').write_bytes(base64.b64decode(d.split(',')[1])); print('ok', sid)
    # bảng xem nhanh: mỗi quái 3 khung (đứng 0, di chuyển 6, tấn công 12)
    d = pg.evaluate('''()=>{const F=TGMART.FR,S=256,n=TGMART.SP.length,cv=document.createElement('canvas');cv.width=S*6;cv.height=S*4;const c=cv.getContext('2d');
      c.fillStyle='#dfe9f4';c.fillRect(0,0,cv.width,cv.height);
      for(let i=0;i<n;i++){const bx=(i%2)*S*3,by=Math.floor(i/2)*S*.0+0;}
      for(let i=0;i<n;i++){const col=i%2,row=Math.floor(i/2);[0,6,12].forEach((f,k)=>{c.save();c.translate((col*3+k)*S,0);c.restore()})}
      cv.height=S*6;cv.width=S*6;c.fillStyle='#dfe9f4';c.fillRect(0,0,cv.width,cv.height);
      for(let i=0;i<n;i++){const col=i%2,row=Math.floor(i/2);[0,6,12].forEach((f,k)=>{c.save();c.translate((col*3+k)*S,row*S);c.beginPath();c.rect(0,0,S,S);c.clip();TGMART.draw(c,i,f);c.restore()})}
      return cv.toDataURL('image/png')}''')
    (out / '_xem-truoc.png').write_bytes(base64.b64decode(d.split(',')[1])); b.close()
