#!/usr/bin/env python3
"""Ghép index.html + các module <script src> thành 1 file HTML đơn: Mong_Tu_Tien_CLAUDE.html
Dùng:  python3 tools/build.py            (ghi Mong_Tu_Tien_CLAUDE.html cạnh index.html)
       python3 tools/build.py --out X.html
Định dạng mỗi khối:  <script>/* đường/dẫn.js */\\n<nội dung>\\n</script>   (giống bản đóng gói cũ)"""
import re,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def build(root=ROOT):
    idx=open(os.path.join(root,'index.html'),encoding='utf-8').read()
    def rep(m):
        p=m.group(1);f=os.path.join(root,p)
        if not os.path.exists(f):raise SystemExit('THIẾU FILE: '+p)
        body=open(f,encoding='utf-8').read().rstrip('\n')
        if '</script' in body.lower():raise SystemExit('Module chứa </script>: '+p)
        return '<script>/* '+p+' */\n'+body+'\n</script>'
    return re.sub(r'<script src="([^"]+)"></script>',rep,idx)
if __name__=='__main__':
    out=os.path.join(ROOT,'Mong_Tu_Tien_CLAUDE.html')
    if '--out' in sys.argv:out=sys.argv[sys.argv.index('--out')+1]
    h=build();open(out,'w',encoding='utf-8').write(h)
    print('OK',out,len(h),'bytes,',h.count('<script>/*'),'khối script')
