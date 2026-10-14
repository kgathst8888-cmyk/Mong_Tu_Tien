#!/usr/bin/env python3
"""Tra nhanh vị trí khai báo:  python3 tools/where.py petUI pev PHX     (chỉ cần tên đầy đủ hoặc 1 phần với -p)"""
import sys,os,re
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args=[a for a in sys.argv[1:] if not a.startswith('-')];part='-p' in sys.argv
if not args:raise SystemExit(__doc__)
rows=[l.rstrip('\n').split('\t') for l in open(os.path.join(ROOT,'SYMBOL_INDEX.tsv'),encoding='utf-8') if not l.startswith('#')]
for a in args:
    hit=[r for r in rows if (a.lower() in r[0].lower() if part else r[0]==a)]
    if not hit:print('%s: (không thấy — thử -p, hoặc nó nằm trong hàm/IIFE; dùng grep -rn)'%a)
    for r in hit:print('%s\t%s\t%s:%s'%(r[0],r[1],r[2],r[3]))
