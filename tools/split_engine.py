#!/usr/bin/env python3
"""[ĐÃ CHẠY 1 LẦN — chỉ lưu để tham khảo; core/01-engine.js không còn, nguồn thật nay là các file core/01a…01v]
Tách core/01-engine.js thành các module theo chủ đề (chạy 1 lần; giữ lại để tham khảo).
Cắt SAU dòng i (0-based); mọi điểm cắt đã kiểm tra là ranh giới câu lệnh cấp cao nhất (biên dịch được từng phần)."""
import json,subprocess,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'core','01-engine.js')
CHUNKS=[
 ('01a-base-data',27,'Canvas, resize, RNG, bảng dữ liệu nhân vật/ô trang bị (ADJ, SLS, CHR)'),
 ('01b-items-sets-wheel',156,'Bộ trang bị, rèn/gộp, tiệm, vòng quay (reward/spin)'),
 ('01c-affix-petdata-skills',220,'Opt ngẫu nhiên, dữ liệu thú nuôi PT4/PB/PK, init, dm, kỹ năng (cast/fire/basic)'),
 ('01d-pet-render',324,'glowSpr/glowDraw, pm, vẽ Huyền Vũ/Rồng, epstep, drawEP (vòng thú nuôi gốc)'),
 ('01e-step-loop',349,'pstep, cbar, step (vòng cập nhật chính)'),
 ('01f-backgrounds',417,'Nền map: bgd0/xbg/bgd/bgdOld, XP, các layer'),
 ('01g-hero-draw',488,'RGBA, armXY, dArm/dLeg, hero(), heroSpark, foe()'),
 ('01h-skill-fx',861,'Hệ hiệu ứng kỹ năng ZS (FX, SFX, ACT, bst, fx, shake...)'),
 ('01i-combat-core',919,'Lõi chiến đấu ZC (tick, kill, gain, aura, panel...)'),
 ('01j-hud-draw',955,'pets(), mbar/mhud, draw() chính'),
 ('01k-icons-equip',1002,'Icon trang bị (mkIcon/mkIcon2/drawWpn), gen, eqp'),
 ('01l-loot-weapons-data',1054,'Tự động bán, tiệm rèn, give/drop, dữ liệu vũ khí (WPU, WSET...)'),
 ('01m-weapon-char-ui',1092,'Thẻ vũ khí, charUI, wpnUI'),
 ('01n-tab-menu',1131,'Thanh tab menu (tabBar, NAVI)'),
 ('01o-quests',1202,'Hệ nhiệm vụ (qs*, QE)'),
 ('01p-bag-pet-ui',1252,'ui() túi đồ, petUI/pev/petEvo, thao tác túi (fuse, eq1, bsort...)'),
 ('01q-village',1274,'Làng: nameTag, vstep, vdraw, bld'),
 ('01r-class-quest',1285,'Nhiệm vụ chuyển chức (cq*)'),
 ('01s-save-load',1297,'Lưu/tải/di trú: sv, st, ng, mig, ld, mn'),
 ('01t-dungeon',1370,'Hầm ngục (dg*)'),
 ('01u-wings',1405,'Cánh (wg*, drawWings)'),
 ('01v-perf-boot',99999,'Tối ưu hiệu năng + khởi động (rf(); init(); loop)'),
]
def main():
    lines=open(SRC,encoding='utf-8').read().split('\n')
    start=0;out=[]
    for name,end,desc in CHUNKS:
        end=min(end,len(lines)-1)
        body='\n'.join(lines[start:end+1])
        hdr='/* core/%s.js — %s\n   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */\n'%(name,desc)
        open(os.path.join(ROOT,'core',name+'.js'),'w',encoding='utf-8').write(hdr+body+'\n')
        out.append(name);start=end+1
    assert start>=len(lines)
    print('\n'.join(out))
if __name__=='__main__':main()
