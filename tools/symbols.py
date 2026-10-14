#!/usr/bin/env python3
"""Quét khai báo cấp cao nhất (function / const / let / var / class / window.X=) của mọi module trong index.html.
Dùng thư viện:  from symbols import scan_file
CLI:  python3 tools/symbols.py           → ghi SYMBOL_INDEX.tsv + MODULE_MAP.md
      python3 tools/where.py TÊN         → tra nhanh 'TÊN nằm ở file:dòng nào'"""
import re,os,sys,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KW_STMT={'const','let','var','function','class','async'}
REGEX_PREV=set('(,=:[!&|?{};+-*%<>~^')
REGEX_KW={'return','typeof','case','in','of','delete','void','throw','new','else','do','instanceof'}
def scan_source(src):
    """Trả về list (tên, loại, dòng) cho khai báo ở độ sâu 0."""
    out=[];n=len(src);i=0;line=1;depth=0;stack=[]   # stack: ký tự mở; template: ('T',depth)
    prev=None;prevword=None;nl=False;mode=None;expect=None;async_ok=False
    def isid(c):return c.isalnum() or c in '_$' or ord(c)>127
    while i<n:
        c=src[i]
        if c=='\n':line+=1;nl=True;i+=1;continue
        if c in ' \t\r':i+=1;continue
        if src.startswith('//',i):
            j=src.find('\n',i);i=n if j<0 else j;continue
        if src.startswith('/*',i):
            j=src.find('*/',i+2);j=n if j<0 else j+2;line+=src.count('\n',i,j);i=j;continue
        if c in '"\'':
            j=i+1
            while j<n and src[j]!=c:
                if src[j]=='\\':j+=1
                if j<n and src[j]=='\n':line+=1
                j+=1
            i=j+1;prev='s';prevword=None;nl=False;continue
        if c=='`':
            j=i+1;d=0
            while j<n:
                ch=src[j]
                if ch=='\\':j+=2;continue
                if ch=='\n':line+=1
                if d==0 and ch=='`':break
                if ch=='$' and j+1<n and src[j+1]=='{':d+=1;j+=2;continue
                if d>0 and ch=='{':d+=1
                elif d>0 and ch=='}':d-=1
                elif d>0 and ch in '"\'':   # chuỗi trong ${}
                    q=ch;j+=1
                    while j<n and src[j]!=q:
                        if src[j]=='\\':j+=1
                        j+=1
                elif d>0 and ch=='`':        # template lồng
                    j+=1
                    while j<n and src[j]!='`':
                        if src[j]=='\\':j+=1
                        j+=1
                j+=1
            i=j+1;prev='s';prevword=None;nl=False;continue
        if c=='/':
            if prev is None or prev in REGEX_PREV or prevword in REGEX_KW:
                j=i+1;cls=False
                while j<n:
                    ch=src[j]
                    if ch=='\\':j+=2;continue
                    if ch=='[':cls=True
                    elif ch==']':cls=False
                    elif ch=='/' and not cls:break
                    elif ch=='\n':break
                    j+=1
                j+=1
                while j<n and isid(src[j]):j+=1
                i=j;prev='r';prevword=None;nl=False;continue
            i+=1;prev='/';prevword=None;nl=False;continue
        if isid(c) and not c.isdigit():
            j=i
            while j<n and isid(src[j]):j+=1
            w=src[i:j]
            if depth==0:
                start=(prev is None or prev in ';}' or (nl and prev not in REGEX_PREV and prev not in '.,'))
                if start and w in('const','let','var'):mode=w;expect='name'
                elif start and w in('function','class'):mode=None;expect='fn'
                elif w=='function' and prevword=='async' and async_ok:expect='fn'
                elif expect=='fn' and prev in('w','*'):out.append((w,'function' if prevword!='class' else 'class',line));expect=None
                elif expect=='name' and prev=='w' and prevword==mode:out.append((w,mode,line));expect=None
                elif expect=='name' and prev==',':out.append((w,mode,line));expect=None
                elif start and w=='window':
                    m=re.match(r'window\.([A-Za-z_$][\w$]*)\s*=(?!=)',src[i:i+120])
                    if m:out.append((m.group(1),'window',line))
                async_ok=bool(start and w=='async')
            prev='w';prevword=w;nl=False;i=j;continue
        if c.isdigit():
            j=i
            while j<n and (isid(src[j]) or src[j]=='.'):j+=1
            i=j;prev='n';prevword=None;nl=False;continue
        if c==',' and depth==0 and mode:expect='name'
        if c in '([{':
            if depth==0 and expect=='name' and prev=='w':expect=None
            depth+=1;stack.append(c)
        elif c in ')]}':
            depth=max(0,depth-1)
            if stack:stack.pop()
        elif c==';' and depth==0:
            mode=None;expect=None
        prev=c;prevword=None;nl=False;i+=1
    return out
def scan_file(path):
    return scan_source(open(path,encoding='utf-8',errors='replace').read())
def index_scripts(root=ROOT):
    idx=open(os.path.join(root,'index.html'),encoding='utf-8').read()
    return re.findall(r'<script src="([^"]+)"',idx)
DESC={}
def first_comment(path):
    try:
        s=open(path,encoding='utf-8',errors='replace').read(1500)
    except Exception:return ''
    m=re.match(r'\s*/\*+\s*(.*?)\*/',s,re.S)
    if m:
        t=re.sub(r'\s+',' ',m.group(1)).strip(' *=-')
        return t[:150]
    m=re.match(r'\s*//\s*(.*)',s)
    return m.group(1)[:150] if m else ''
def main():
    scripts=index_scripts();rows=[];files=[]
    for p in scripts:
        f=os.path.join(ROOT,p)
        if p.startswith('assets/'):
            files.append((p,os.path.getsize(f),'(dữ liệu ảnh/font base64 — KHÔNG đọc)',0));continue
        syms=scan_file(f);names=set(s[0] for s in syms)
        for name,kind,line in syms:rows.append((name,kind,p,line))
        files.append((p,os.path.getsize(f),first_comment(f),len(names)))
    rows.sort(key=lambda r:(r[0].lower(),r[2]))
    with open(os.path.join(ROOT,'SYMBOL_INDEX.tsv'),'w',encoding='utf-8') as o:
        o.write('# name\tkind\tfile\tline   (tạo bởi tools/symbols.py; tra: python3 tools/where.py TÊN  hoặc grep -P "^TÊN\\t" SYMBOL_INDEX.tsv)\n')
        for r in rows:o.write('%s\t%s\t%s\t%d\n'%r)
    with open(os.path.join(ROOT,'MODULE_MAP.md'),'w',encoding='utf-8') as o:
        o.write('# MODULE_MAP — thứ tự nạp (theo index.html) và việc của từng file\n\n')
        o.write('Tạo tự động bởi `python3 tools/symbols.py`. Cột KB = dung lượng, "ký hiệu" = số khai báo cấp cao nhất.\n\n')
        o.write('| # | file | KB | ký hiệu | mô tả (chú thích đầu file) |\n|--:|---|--:|--:|---|\n')
        for k,(p,sz,d,ns) in enumerate(files,1):
            o.write('| %d | `%s` | %d | %d | %s |\n'%(k,p,round(sz/1024),ns,d.replace('|','/')))
    print('SYMBOL_INDEX.tsv:',len(rows),'khai báo;','MODULE_MAP.md:',len(files),'file')
if __name__=='__main__':main()
