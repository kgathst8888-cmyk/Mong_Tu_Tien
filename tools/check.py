#!/usr/bin/env python3
"""Kiểm tra nhanh trước khi giao file:
   python3 tools/check.py            → đường dẫn index.html, cú pháp mọi module, trùng const/let giữa các file
   python3 tools/check.py --build    → thêm: ghép lại Mong_Tu_Tien_CLAUDE.html + làm mới SYMBOL_INDEX/MODULE_MAP
   python3 tools/check.py --run      → thêm: chạy game thật bằng trình duyệt (cần playwright) 6 giây, báo lỗi script"""
import os,re,sys,subprocess,collections
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import symbols,build
def main():
    bad=0;scripts=symbols.index_scripts(ROOT)
    for p in scripts:
        if not os.path.exists(os.path.join(ROOT,p)):print('THIẾU FILE',p);bad+=1
    print('index.html:',len(scripts),'script,',len(set(scripts)),'khác nhau')
    if len(set(scripts))!=len(scripts):
        d=[p for p,c in collections.Counter(scripts).items() if c>1];print('LẶP script:',d);bad+=1
    for p in scripts:
        f=os.path.join(ROOT,p)
        if not os.path.exists(f) or p.startswith('assets/'):continue
        r=subprocess.run(['node','--check',f],capture_output=True,text=True)
        if r.returncode:print('LỖI CÚ PHÁP',p,'\n',r.stderr[:400]);bad+=1
    seen=collections.defaultdict(list)
    for p in scripts:
        f=os.path.join(ROOT,p)
        if p.startswith('assets/') or not os.path.exists(f):continue
        for name,kind,line in symbols.scan_file(f):seen[name].append((p,kind,line))
    for name,v in seen.items():
        lex=[x for x in v if x[1] in('const','let','class')]
        if len(lex)>1 or (lex and len(v)>len(lex) and any(x[1]=='function' for x in v)):
            print('TRÙNG khai báo cấp cao nhất (có thể lỗi lúc nạp):',name,v);bad+=1
    fn=[(n,v) for n,v in seen.items() if sum(1 for x in v if x[1]=='function')>1]
    if fn:print('Ghi chú: %d hàm khai báo ở nhiều file (cái nạp sau thắng):'%len(fn),', '.join(n for n,_ in fn[:12]))
    if '--build' in sys.argv or '--run' in sys.argv:
        out=os.path.join(ROOT,'Mong_Tu_Tien_CLAUDE.html')
        h=build.build(ROOT);open(out,'w',encoding='utf-8').write(h);print('Đã ghép',out,len(h),'bytes')
        subprocess.run([sys.executable,os.path.join(ROOT,'tools','symbols.py')])
    if '--run' in sys.argv:
        try:
            from playwright.sync_api import sync_playwright
        except Exception:
            print('Không có playwright, bỏ qua --run');return 1 if bad else 0
        import time
        with sync_playwright() as pw:
            b=pw.chromium.launch();pg=b.new_page(viewport={'width':900,'height':500});errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
            pg.goto('file://'+os.path.join(ROOT,'index.html'));time.sleep(2.5)
            pg.evaluate("()=>{document.querySelectorAll('#kg').forEach(e=>e.remove());window.__GATE=0}")   # bỏ cổng đăng nhập (systems/60) để thử offline
            try:
                pg.get_by_text('Game mới').first.click(timeout=4000);time.sleep(1)
                pg.get_by_text('Bắt đầu').first.click(timeout=4000);time.sleep(6)
            except Exception as e:print('Không bấm được menu:',str(e)[:80])
            print('Lỗi script khi chạy:',errs[:5] or 'không');bad+=len(errs);b.close()
    print('KẾT QUẢ:','OK' if not bad else '%d vấn đề'%bad)
    return 1 if bad else 0
if __name__=='__main__':sys.exit(main())
