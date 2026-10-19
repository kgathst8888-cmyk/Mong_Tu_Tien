/* ===== ⏳ CỔNG TREO MÁY · MAP TREO OFFLINE (world/80-map-treo.js) =====
 * Thêm 1 cổng ở Thôn Tân Thủ (thế chỗ cổng Bản Đồ cũ (Fix256)). Chạm cổng → đi tới → mở bảng "Cổng Treo Máy".
 *
 * MAP TREO
 *  - Chỉ rơi: EXP · Vàng · Nguyên liệu (mảnh chế tạo, Quặng Sắt, Huyền Kim, Đá Cường Hóa thường). KHÔNG rơi trang bị
 *    (module chặn give() + thay hẳn drop() khi đang ở map treo, nên mọi module khác bọc drop() phía trong cũng không chạy).
 *  - Cấp quái = ĐÚNG cấp nhân vật (spawn() được bọc: đổi e.lv = P.lv rồi nhân lại máu/thủ theo công thức gốc).
 *      Phàm Thể  → map thường theo cấp (Lv1-20 map 1 · 21-40 map 2 · 41-60 map 3 · 61-80 map 4 · 81+ map 5), quái thường.
 *      Fix154: TIÊN NHÂN (CTHE.on()) → quái TIÊN GIỚI đúng cấp nhân vật (world/81: máu TGQ_CF.hp, EXP ×3 quái Đạo Thể, e.lgi=5); EXP cộng qua TGQ.addXp (engine không cho EXP Tiên Nhân).
 *      Đạo Thể / Tiên Nhân (HDAO.on(), Tiên Nhân luôn là Đạo Thể đã chuyển thế) → quái ĐẠO THỂ (Linh Giới bản đồ 2-5 theo cấp Đạo Cảnh:
 *      Lv1-20 / 21-40 / 41-60 / 61-80 / 81+ dùng bản đồ 61-80), nên Đạo Linh (EXP) vẫn được tính (LGMAP.expOk()).
 *  - Không có Boss/Tinh Anh: bộ đếm pq/NK (hàng đợi boss của map thường) được giữ nguyên, boss thế giới bị bỏ qua trong map này.
 *
 * Fix240 — QUÁI THEO LV + DẠNG THỂ: ngoài cấp (Lv), quái nhân hệ số theo dạng thể [Phàm, Đạo, Tiên] (CF.realmHp/Df/Atk máu·thủ·sát thương; CF.realmXp [1,1,1] = EXP lên cấp giữ 100% như map ngoài; CF.realmGold vàng). Sát thương quái: core/01e đọc e.rm. TU VI tu tiên ở map treo = CF.tvK (80%) so với map thường, cả online (bọc ZC.kill) lẫn offline.
 *
 * GIỜ TREO
 *  - Mỗi ngày (đổi lúc 00:00 giờ VN) có CF.freeSec = 4 giờ miễn phí. Muốn thêm: mua bằng Linh Thạch (CF.ltPerHour = 20💎/giờ, trừ ví ☁ qua LT.spend).
 *  - Giờ đã mua nằm trong "kho giờ" (không mất khi sang ngày); dùng sau khi hết giờ miễn phí của ngày.
 *  - Thời gian ở trong map (đang mở game) và thời gian OFFLINE đều trừ chung vào giờ treo. Hết giờ → tự đưa về Làng.
 *
 * OFFLINE
 *  - Đang ở map treo mà tắt game / khoá máy / app bị treo >CF.gapSec giây → lần mở game sau (hoặc khi app hoạt động lại) module tính:
 *      số quái = (thời gian offline, tối đa bằng số giờ còn lại) / CF.spk giây × CF.offEff
 *      EXP = EXP/quái (đúng công thức engine, ×killMul×expMul bản đồ nếu Đạo Thể) · tu vi (ZC.gain) · vàng CF.goldK×cấp/quái · nguyên liệu theo xác suất CF.*P
 *  - Rời map bằng nút 🏘 Làng (hoặc đổi map/phụ bản/đổi nhân vật) = KHÔNG còn treo offline.
 *
 * Dữ liệu (lưu cùng save): PS[cur].afk = {d:'yyyy-mm-dd', u:giây miễn phí đã dùng hôm nay, b:giây trong kho giờ đã mua, on:0/1, ts:mốc ms nhịp tim gần nhất}.
 * Chỉnh cân bằng: khối CF. Tắt: bỏ <script> trong index.html. API: window.AFKMAP.
 * Phụ thuộc: step/spawn/drop/give/vstep/bld/gm/lgEnter/lgDone, PS/cur/P/E/g/GY/s/fr/vil/lg/mapSel/dg/over/started/gold/frag/NK/pq/wbq, ZC, HDAO, LGMAP, MN, LT, sv. */
(function(){
'use strict';
if(typeof step!=='function'||typeof spawn!=='function'||typeof drop!=='function'||typeof give!=='function'||typeof vstep!=='function'||typeof bld!=='function'||typeof gm!=='function'||typeof PS==='undefined'||typeof g==='undefined'||typeof c==='undefined')return;

var CF={
 freeSec:4*3600,   /* giờ treo miễn phí mỗi ngày (giây) */
 ltPerHour:20,     /* giá 1 giờ treo (Linh Thạch) */
 spk:10,           /* giây / quái khi tính offline (10 = 360 quái/giờ) */
 offEff:1,         /* hiệu suất offline (1 = bằng 100%) */
 goldK:20,         /* vàng mỗi quái = gP(goldK × cấp quái) */
 fragP:.10,        /* xác suất rơi 1 mảnh chế tạo / quái */
 feP:.04,          /* xác suất rơi Quặng Sắt (1-2) / quái */
 hkP:.015,         /* xác suất rơi Huyền Kim (1) / quái */
 stoneP:.04,       /* xác suất rơi 1 Đá Cường Hóa thường / quái */
 /* Fix240: hệ số quái theo DẠNG THỂ nhân vật [Phàm Thể, Đạo Thể, Tiên Nhân] (đặt [1,1,1] = tắt) */
 realmHp:[1,1.5,2.5],    /* máu quái */
 realmDf:[1,1.2,1.5],    /* thủ quái */
 realmAtk:[1,1.3,1.6],   /* sát thương quái */
 realmXp:[1,1,1],        /* EXP lên cấp: GIỮ 100% như map ngoài (không tăng theo dạng thể) */
 realmGold:[1,1.5,2],    /* vàng quái */
 tvK:.8,                 /* Fix240: tu vi tu tiên ở map treo (online + offline) = 80% so với đánh quái ở bản đồ thường */
 minOffSec:60,     /* offline ngắn hơn mức này không tính */
 gapSec:20,        /* khung hình cách nhau > mức này (app bị đóng băng) → coi là offline */
 gateK:.72, gateX:.945        /* vị trí cổng trong làng (tỉ lệ bề rộng làng) */
};

var S={on:0,cur:-1,lg:0,ms:0,lgm:0,last:0,hb:0,hu:0,chk:0,nk:0,p0:0,p1:0,ses:null};
var ov=null,box=null,hudEl=null,mode='panel',rep=null,busy=false,noteTx='',noteC='#ffe9a0',gateGo=0,errN=0;

/* ---------- tiện ích ---------- */
function nf(n){return(Math.round(Number(n))||0).toLocaleString('vi-VN')}
function hms(sec){sec=Math.max(0,Math.floor(sec));var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),q=sec%60;return h+':'+(m<10?'0':'')+m+':'+(q<10?'0':'')+q}
function vnDay(){return new Date(Date.now()+25200000).toISOString().slice(0,10)}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#9dffd8',g:1,l:130})}catch(e){}}
function rnd(x){var f=Math.floor(x);return f+(Math.random()<x-f?1:0)}
/* Fix240: dạng thể 0 = Phàm Thể · 1 = Đạo Thể · 2 = Tiên Nhân → hệ số quái & EXP */
function form(){return isTien()?2:isDao()?1:0}
function rmul(k){var v=CF[k];return Array.isArray(v)?(+v[form()]||1):(+v||1)}
function rname(){return who()}
function A(p){
 p=p||PS[cur];if(!p)return null;
 var a=p.afk;if(!a||typeof a!=='object')a=p.afk={d:'',u:0,b:0,on:0,ts:0};
 var d=vnDay();if(a.d!==d){a.d=d;a.u=0}
 a.u=Math.max(0,+a.u||0);a.b=Math.max(0,+a.b||0);return a}
function freeLeft(a){return Math.max(0,CF.freeSec-a.u)}
function total(a){return freeLeft(a)+a.b}
function use(a,sec){sec=Math.max(0,Math.min(+sec||0,total(a)));var f=Math.min(sec,freeLeft(a));a.u+=f;a.b=Math.max(0,a.b-(sec-f));return sec}
function isDao(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function isTien(){try{return !!(window.CTHE&&CTHE.on())}catch(e){return false}}
function daoMap(){var L=P.lv|0;return L<=20?1:L<=40?2:L<=60?3:4}
function nomMap(){return Math.max(0,Math.min(4,Math.floor(((P.lv|0)-1)/20)))}
function mapName(){
 try{if(isTien()&&window.TGQ)return 'Tiên Giới · quái Tiên Giới'}catch(e){}
 try{if(isDao())return LGMAP.maps[daoMap()].n}catch(e){}
 try{return MP[MPX[nomMap()]].n}catch(e){}
 return 'Bản đồ theo cấp'}
function who(){return isTien()?'✨ Tiên Nhân':isDao()?'☯ Đạo Thể':'Phàm Thể'}

/* EXP / quái đúng công thức engine (core/01e dòng xử lý quái chết): round(15×(1+Lv/5)) × HDAO.xg() */
function xpPer(L){return Math.max(1,Math.round(xpBase(L)*rmul('realmXp')))}
function xpBase(L){
 var b=Math.round(15*(1+L/5));if(isTien()&&window.TGQ&&TGQ.xpOf)return TGQ.xpOf(L);if(!isDao())return b;
 var k=3,ex=.5;try{k=HDAO.cfg.killMul}catch(e){}try{var m=LGMAP.cfg[daoMap()];if(m&&m.exp)ex=m.exp}catch(e){}
 return Math.round(b*k*ex)}

/* ---------- Fix240: HỆ THỐNG TU VI CẢNH GIỚI TU TIÊN ở map treo = CF.tvK (80%) so với map ngoài ----------
   Map ngoài có 2 nguồn tu vi: (1) mỗi quái hạ: ceil((3+Lv×.8)×TV.farm) [×LGX ở Linh Giới] (2) tự tu luyện mỗi giây: (1+tầng×.6)×TV.auto [×LGX ở Linh Giới].
   Online: bọc ZC.kill + ZC.tick (nhân tvK). Offline: tvOff() tính đủ cả 2 nguồn × tvK rồi ZC.gain 1 lần (ZC.gain tự lên tầng / dừng ở ngưỡng đột phá). */
function tvOn(){try{return ZC.rI()<5}catch(e){return false}}
function tvTier(){try{var c=PS[cur].cv||{r:-1,s:0};return c.r<0?0:(c.r|0)*9+(c.s|0)}catch(e){return 0}}
function tvOff(L,n,sec){
 if(!tvOn())return 0;
 var T=(ZC.TV)||{},farm=T.farm||1,auto=T.auto||0,lx=isDao()?LGX:1;
 var kill=Math.ceil((3+L*.8)*farm*CF.tvK)*lx*n;
 var pas=Math.floor(sec)*(1+tvTier()*.6)*auto*CF.tvK*lx;
 return Math.round(kill+pas)}

/* ---------- phần thưởng (dùng chung online + offline): vàng + nguyên liệu, KHÔNG trang bị ---------- */
function matAdd(fe,hk){if(!(fe||hk))return;try{var m=MN.get();if(m){m.fe=(m.fe|0)+fe;m.hk=(m.hk|0)+hk}}catch(e){}}
function stoneAdd(n){if(!n)return;var p=PS[cur];if(!p.dch)p.dch={a:0,b:0};p.dch.a=(p.dch.a|0)+n}
function award(n,L){
 var gd=gP(Math.round(CF.goldK*L*n*rmul('realmGold'))),fr_=rnd(n*CF.fragP),fe=rnd(n*CF.feP*1.5),hk=rnd(n*CF.hkP),st=rnd(n*CF.stoneP);
 gold+=gd;frag+=fr_;matAdd(fe,hk);stoneAdd(st);
 return{gold:gd,frag:fr_,fe:fe,hk:hk,st:st}}

/* ---------- vào / rời map ---------- */
function canEnter(){
 if(!started||over)return'Không thể vào lúc này';
 if(dg)return'Hãy rời phụ bản trước';
 if(!vil)return'Hãy về Làng rồi chạm Cổng Treo Máy';
 var a=A();if(!a||total(a)<60)return'⏳ Hết giờ treo hôm nay · mua thêm bằng 💎 Linh Thạch';
 if(isDao()&&typeof lgDone==='function'&&!lgDone())return'Chưa mở Linh Giới';
 return true}
function enter(){
 var r=canEnter();if(r!==true){note(r,'#ffb0b0');render();return r}
 close();try{if(bo)tg()}catch(e){}
 var a=A();
 if(isDao()){PS[cur].lgm=(isTien()&&window.TGQ)?1:daoMap();lgEnter()}else{gm(nomMap())}
 if(vil){note('Không vào được map treo','#ffb0b0');return'fail'}
 S.on=1;S.cur=cur;S.lg=lg;S.ms=mapSel;S.lgm=PS[cur].lgm|0;S.last=Date.now();S.hb=S.last;S.hu=0;
 S.nk=NK;S.p0=pq[0];S.p1=pq[1];S.ses={n:0,gold:0,frag:0,fe:0,hk:0,st:0,sec:0};
 a.on=1;a.ts=S.last;
 try{P.hp=mx();P.mp=mm()}catch(e){}
 try{auto=true;if(typeof ae!=='undefined'&&ae&&ae.style)ae.style.opacity=1}catch(e){}
 say('⏳ Vào Map Treo · quái Lv'+P.lv+' · '+who(),'#9dffd8');
 try{sv()}catch(e){}
 return true}
function toVillage(){
 vil=1;try{P.hp=mx();P.mp=mm()}catch(e){}
 P.atk=0;P.pe=null;vt=null;vgo=-1;
 try{P.x=cl(P.x,40,vw()-40)}catch(e){}
 E=[];PJ=[];FX=[]}
function leave(msg,goHome){
 if(!S.on)return;S.on=0;
 try{var a=PS[S.cur]&&PS[S.cur].afk;if(a){a.on=0;a.ts=0}}catch(e){}
 hudHide();
 if(goHome)toVillage();
 if(S.ses&&S.ses.n>0){try{say('⏳ Phiên treo: '+nf(S.ses.n)+' quái · +'+nf(S.ses.gold)+'💰','#ffe9a0')}catch(e){}}
 if(msg)say(msg,'#ffe9a0');
 try{sv()}catch(e){}}

/* ---------- offline ---------- */
function offline(sec,kind){
 var a=A();if(!a)return;
 var cap=total(a),t=Math.min(sec,cap);
 if(t<=0){return}
 use(a,t);
 var L=Math.max(1,P.lv|0),n=Math.floor(t/CF.spk*CF.offEff);
 if(n<=0)return;
 try{if(window.LCS&&LCS.off)LCS.off(n)}catch(e){}/* Fix253: hấp thụ nguyên tố dị linh căn khi treo offline */
 try{QE('kill',n)}catch(e){}/* Fix296: treo offline vẫn tính quái cho nhiệm vụ (Vòng Lặp Vô Tận) */
 var tvG=0,xp=xpPer(L)*n;var addX=function(){if(window.TGQ&&TGQ.addXp)TGQ.addXp(xp);else P.xp+=xp};
 try{if(window.CSH&&CSH.offXp)CSH.offXp(t,addX);else addX()}catch(e){addX()}/* Fix328: buff % EXP (vé/bùa) tính theo thời gian offline */
 try{tvG=tvOff(L,n,t);if(tvG>0)ZC.gain(tvG)}catch(e){tvG=0}
 try{var pt=pet();if(pt&&pt.lv<pcap(pt)){pt.xp+=n*(1+L/10);pcheck(pt)}}catch(e){}
 var rw=award(n,L);
 rep={sec:t,n:n,xp:xp,tv:tvG,rw:rw,capped:sec>cap,left:total(a),kind:kind,L:L};
 mode='report';openOv();
 try{sv()}catch(e){}}

/* nhịp mỗi khung: tính giờ, kiểm tra rời map, thưởng offline khi vừa mở game */
function tick(){
 var now=Date.now();
 if(!S.on){
  if(now-S.chk<2000)return;S.chk=now;
  if(!started||over)return;
  var p=PS[cur];if(!p||!p.afk||!p.afk.on)return;
  var a0=A(),ts=+a0.ts||0;a0.on=0;a0.ts=0;
  if(ts>0){var gap=(now-ts)/1000;if(gap>=CF.minOffSec)offline(gap,'off')}
  try{sv()}catch(e){}
  return}
 /* đang ở map treo */
 if(cur!==S.cur||vil||dg||lg!==S.lg||mapSel!==S.ms||(S.lg&&(PS[cur].lgm|0)!==S.lgm)){leave('');return}
 NK=S.nk;pq[0]=S.p0;pq[1]=S.p1;   /* kill ở map treo không cộng bộ đếm boss của map thường */
 if(over||!started){S.last=now;return}
 var a=A();if(!a){leave('');return}
 var dt=(now-S.last)/1000;S.last=now;
 if(dt>CF.gapSec){offline(dt,'bg')}else{use(a,dt);S.ses.sec+=dt}
 a.on=1;
 if(now-S.hb>15000){S.hb=now;a.ts=now;try{sv()}catch(e){}}
 if(total(a)<=.5){leave('⏳ Hết giờ treo hôm nay · mua thêm ở Cổng Treo Máy',true);return}
 hud(a,now)}

/* ---------- móc vào engine ---------- */
var _step=step;step=function(){var r=_step.apply(this,arguments);try{tick()}catch(e){if(errN++<5)console.error('[map-treo]',e)}return r};

/* quái đúng cấp nhân vật */
function fit(e){
 if(!e||e.k==='pal')return;var L1=Math.max(1,P.lv|0),L0=e.lv||L1;
 var hk=rmul('realmHp'),dk=rmul('realmDf');
 e.rm=rmul('realmAtk');   /* Fix240: hệ số sát thương theo cảnh giới (core/01e đọc e.rm) */
 if(isTien()&&window.TGQ&&TGQ.stat){var st=TGQ.stat(L1);e.hp=e.max=st.hp*hk;e.df=st.df*dk;e.m=st.m;e.lv=L1;e.lgi=5;return}   /* Tiên Nhân: quái Tiên Giới (máu cố định theo TGQ_CF.hp) × cảnh giới */
 if(L0!==L1){
  e.df*=(8+L1*2.2)/(8+L0*2.2);
  if(!lg){var q=(60+L1*25)/(60+L0*25);e.hp*=q;e.max*=q}   /* quái Đạo Thể có máu cố định (LGS.hpn) nên chỉ đổi thủ */
  e.lv=L1}
 e.hp*=hk;e.max*=hk;e.df*=dk}
var _spawn=spawn;spawn=function(i){
 if(!S.on)return _spawn.apply(this,arguments);
 var a0=pq[0],a1=pq[1],w0=wbq,n0=E.length;
 pq[0]=0;pq[1]=0;wbq=0;                       /* không Boss Tinh Anh / Sử Thi / Thế Giới trong map treo */
 try{_spawn.apply(this,arguments)}finally{pq[0]=a0;pq[1]=a1;wbq=w0}
 try{if(E.length>n0)fit(E[E.length-1])}catch(x){}};

/* Fix240: tu vi khi hạ quái ở map treo = CF.tvK (80%) so với map thường (ZC.kill đọc ZC.TV.farm lúc gọi) */
try{var _zk=ZC.kill;if(typeof _zk==='function'&&ZC.TV)ZC.kill=function(){
 if(!S.on)return _zk.apply(this,arguments);
 var o=ZC.TV.farm;ZC.TV.farm=o*CF.tvK;try{return _zk.apply(this,arguments)}finally{ZC.TV.farm=o}}}catch(e){}
try{var _zt=ZC.tick;if(typeof _zt==='function'&&ZC.TV)ZC.tick=function(){
 if(!S.on)return _zt.apply(this,arguments);
 var o=ZC.TV.auto;ZC.TV.auto=o*CF.tvK;try{return _zt.apply(this,arguments)}finally{ZC.TV.auto=o}}}catch(e){}

/* chỉ rơi vàng + nguyên liệu; chặn mọi trang bị */
var _give=give;give=function(){if(S.on)return;return _give.apply(this,arguments)};
function f_(n){try{return fmtN(n)}catch(e){return nf(n)}}
var _drop=drop;drop=function(e){
 if(!S.on)return _drop.apply(this,arguments);
 try{
  if(isTien()&&window.TGQ&&TGQ.addXp)TGQ.addXp(xpPer(e.lv||P.lv));   /* engine không cho EXP Tiên Nhân → cộng EXP quái Tiên Giới ở đây */
  if(!isTien()){var rx=rmul('realmXp');if(rx>1){var bx=(window.HDAO?HDAO.xg():1)*Math.round(15*(1+(e.lv||P.lv)/5));if(typeof XR==='function')bx=XR(bx);var ex=Math.round(bx*(rx-1));if(ex>0)P.xp+=ex}}   /* Fix240: EXP thêm theo cảnh giới */
  var L=e.lv||P.lv,m=e.b==3?10:e.b?4:1,rw=award(m,L),q=S.ses;
  q.n++;q.gold+=rw.gold;q.frag+=rw.frag;q.fe+=rw.fe;q.hk+=rw.hk;q.st+=rw.st;
  DT.push({x:e.x,y:110,s:'+'+f_(rw.gold)+'💰',c:'#ffd54a',l:50});
  var t=[];if(rw.frag)t.push('🔹'+rw.frag);if(rw.fe)t.push('🔩'+rw.fe);if(rw.hk)t.push('🌑'+rw.hk);if(rw.st)t.push('🪨'+rw.st);
  if(t.length)DT.push({x:e.x,y:140,s:t.join(' '),c:'#9dffd8',l:70})
 }catch(x){if(errN++<5)console.error('[map-treo] drop',x)}};

/* ---------- HUD trong map ---------- */
function mkHud(){
 if(hudEl)return;
 var st=document.createElement('style');
 st.textContent='#afkh{position:fixed;left:58%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2;text-align:center;pointer-events:none;width:min(340px,64vw);display:none}'
  +'@media (max-width:640px){#afkh{left:50%;top:calc(124px + env(safe-area-inset-top,0px))}}'
  +'.afkt{font:bold 14px KTH Serif,Songti SC,STKaiti,KaiTi,serif;color:#9dffd8;text-shadow:0 0 4px #000,0 0 4px #000}'
  +'.afks{font:12px KTH Serif,Songti SC,STKaiti,KaiTi,serif;color:#ffe9a0;text-shadow:0 0 4px #000,0 0 4px #000}'
  +'#afk-ov .afkb{display:block;width:100%;margin:7px 0;padding:10px;border-radius:10px;border:1px solid #b8964e;background:linear-gradient(#6a4a20,#3a2610);color:#ffe9a0;font:bold 15px system-ui,sans-serif;cursor:pointer}'
  +'#afk-ov .afkb.g{border-color:#5fe0a8;background:linear-gradient(#1f6a52,#0e3a2c);color:#d8fff0}'
  +'#afk-ov .afkb[disabled]{opacity:.45;cursor:default}'
  +'#afk-ov .afkr{display:flex;gap:8px}#afk-ov .afkr .afkb{margin:6px 0}'
  +'#afk-ov .afkw{border:1.5px solid #e0603a;border-radius:10px;background:linear-gradient(#3a1410,#240c0a);padding:9px 11px;margin:8px 0;font-size:13px;line-height:1.5;color:#ffd9c8}#afk-ov .afkw b{color:#ffb98a}#afk-ov .afkw ul{margin:5px 0 0;padding-left:18px}#afk-ov .afkw li{margin:3px 0}'
  +'#afk-ov .afkc{border:1px solid #6a5230;border-radius:10px;background:#140d0a;padding:9px 11px;margin:8px 0;font-size:14px;line-height:1.6}';
 document.head.appendChild(st);
 hudEl=document.createElement('div');hudEl.id='afkh';document.body.appendChild(hudEl)}
function hud(a,now){
 if(now-S.hu<500)return;S.hu=now;mkHud();
 hudEl.style.display='block';
 hudEl.innerHTML='<div class="afkt">⏳ MAP TREO · '+who()+' · Quái Lv'+P.lv+' · '+rname()+'</div>'
  +'<div class="afks">Còn '+hms(total(a))+' (miễn phí '+hms(freeLeft(a))+' · đã mua '+hms(a.b)+')</div>'
  +'<div class="afks" style="opacity:.8;font-size:11px">Tắt game vẫn treo · chạm 🏘 để rời map</div>'}
function hudHide(){if(hudEl)hudEl.style.display='none'}

/* ---------- cổng trong làng ---------- */
/* Fix256: cổng Treo Máy thay vào vị trí cổng Bản Đồ (toà số 4); cổng Bản Đồ trong làng bị gỡ, chỉ vào bản đồ qua nút 🗺 Bản đồ */
function gx(){return bxx(4)}
function gk(){return Math.max(.72,bww()/120*.8)}
function plain(){try{return !window.VWD||(VWD.plain?VWD.plain():VWD.on())}catch(e){return true}}
function drawGate(){
 if(!vil||!started||S.on||!plain())return;
 var t=fr,pu=.5+.5*Math.sin(t*.07),j;
 g.save();g.translate(gx()*s,GY);g.scale(s*gk(),s*gk());
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,2,52,8,0,0,6.28);g.fill();
 /* hào quang */
 g.save();g.globalCompositeOperation='lighter';
 var q=g.createRadialGradient(0,-62,6,0,-62,86);q.addColorStop(0,'rgba(120,255,214,'+(.3+.12*pu)+')');q.addColorStop(1,'rgba(120,255,214,0)');
 g.fillStyle=q;g.beginPath();g.arc(0,-62,86,0,6.28);g.fill();g.restore();
 /* lòng cổng */
 g.save();g.beginPath();g.ellipse(0,-60,30,50,0,0,6.28);g.clip();
 q=g.createRadialGradient(0,-60,3,0,-60,56);q.addColorStop(0,'#eafff8');q.addColorStop(.35,'#58e0c0');q.addColorStop(.75,'#1a6a8a');q.addColorStop(1,'#0a1030');
 g.fillStyle=q;g.fillRect(-34,-114,68,108);
 g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.6;
 for(j=0;j<4;j++){g.beginPath();g.ellipse(0,-60,6+j*6,12+j*10,t*.04*(j%2?1:-1)+j,0,4);g.stroke()}
 g.fillStyle='rgba(215,255,240,.8)';
 for(j=0;j<6;j++){var yy=-((t*.5+j*19)%96)-8;g.beginPath();g.arc(Math.sin(t*.03+j*1.7)*20,yy,1.6,0,6.28);g.fill()}
 g.restore();
 /* trụ đá + xà + mái */
 g.fillStyle='#8c877b';g.fillRect(-46,-112,12,112);g.fillRect(34,-112,12,112);
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-46,-112,3,112);g.fillRect(34,-112,3,112);
 g.fillStyle='#6a665c';g.fillRect(-50,-8,20,8);g.fillRect(30,-8,20,8);
 g.fillStyle='#5a4630';g.fillRect(-52,-124,104,12);
 g.fillStyle='#3a3a46';g.beginPath();g.moveTo(-64,-122);g.quadraticCurveTo(-34,-124,0,-152);g.quadraticCurveTo(34,-124,64,-122);g.lineTo(58,-114);g.lineTo(-58,-114);g.closePath();g.fill();
 g.fillStyle='#d9b04a';g.fillRect(-58,-116,116,3);
 g.font='bold 15px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.fillStyle='#ffd88a';g.fillText('掛',0,-126);
 /* nhãn */
 g.font='bold 15px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle='#ffe9a0';
 g.strokeText('⏳ Treo Máy',0,-172);g.fillText('⏳ Treo Máy',0,-172);
 g.fillStyle='#ffd54a';g.fillText('▼',0,-156+Math.sin(t*.12)*4);
 g.restore()}
var _bld=bld;bld=function(i){if(i===4&&vil&&started&&!S.on&&plain()){try{drawGate();return}catch(e){if(errN++<5)console.error('[map-treo] gate',e)}}return _bld.apply(this,arguments)};
/* Fix256: chạm toà Bản Đồ ở làng Tân Thủ không còn mở bản đồ nữa (Linh Giới giữ nguyên) */
var _openB=openB;openB=function(i){if(i===4&&plain())return;return _openB.apply(this,arguments)};

c.addEventListener('pointerdown',function(e){
 gateGo=0;if(!vil||bo||!started||S.on||!plain()||(ov&&ov.style.display!=='none'))return;
 var x=e.offsetX/s,y=e.offsetY;
 if(Math.abs(x-gx())<Math.max(46*gk(),bww()/2+12)&&y>GY-185*s*gk()&&y<GY+40*s){vt=cl(gx(),40,vw()-40);vgo=-1;gateGo=1}});
var _vstep=vstep;vstep=function(){
 var r=_vstep.apply(this,arguments);
 if(gateGo){if(mvDir)gateGo=0;else if(vt==null){gateGo=0;if(Math.abs(P.x-cl(gx(),40,vw()-40))<16)openPanel()}}
 return r};

/* ---------- bảng Cổng Treo Máy ---------- */
function note(t,col){noteTx=t||'';noteC=col||'#ffe9a0'}
function est(){
 var L=Math.max(1,P.lv|0),n=Math.floor(3600/CF.spk*CF.offEff);
 return{n:n,tv:tvOff(L,n,3600),xp:xpPer(L)*n,gold:gP(Math.round(CF.goldK*L*n*rmul('realmGold'))),frag:Math.round(n*CF.fragP),fe:Math.round(n*CF.feP*1.5),hk:Math.round(n*CF.hkP)}}
function panelHtml(){
 var a=A();if(!a)return'';
 var e=est(),tt=total(a),lt=0,logged=false;
 try{lt=LT.get();logged=!!LT.logged()}catch(x){}
 var pc=Math.round(freeLeft(a)/CF.freeSec*100);
 var h='<h2 style="margin:0 0 6px;color:#9dffd8;font-size:19px">⏳ Cổng Treo Máy</h2>'
 +'<div style="font-size:13px;opacity:.9">Quái <b>Lv'+P.lv+'</b> theo cấp bạn · '+who()+' → <b style="color:#ffe27a">'+mapName()+'</b>'+(isTien()&&window.TGQ?'<br>Quái Tiên Giới · EXP gấp 3 quái Đạo Thể · Tiên Nhân chỉ tăng EXP bằng quái Tiên Giới':isDao()?'<br>Quái Đạo Thể (Linh Giới) · vẫn nhận Đạo Linh':'')+'</div>'
 +'<div class="afkc" style="font-size:13px">👹 <b>Quái theo Lv &amp; dạng thể</b> (<b style="color:#ffe27a">'+rname()+'</b>)<br>Máu <b>×'+rmul('realmHp').toFixed(2)+'</b> · Thủ <b>×'+rmul('realmDf').toFixed(2)+'</b> · Sát thương <b>×'+rmul('realmAtk').toFixed(2)+'</b><br>✨ EXP lên cấp <b style="color:#9dffd8">100%</b> như map ngoài · 💰 Vàng <b>×'+rmul('realmGold').toFixed(2)+'</b><br>🧘 Tu vi cảnh giới tu tiên: <b style="color:#9dffd8">'+Math.round(CF.tvK*100)+'%</b> so với map ngoài'+(tvOn()?'':' <span style="color:#ffd98a">(cảnh giới này không tu vi qua đánh quái)</span>')+'</div>'
 +'<div class="afkc"><div>🕒 Miễn phí hôm nay: <b>'+hms(freeLeft(a))+'</b> / '+hms(CF.freeSec)+'</div>'
 +'<div style="height:8px;border-radius:5px;background:#2a1c10;overflow:hidden;margin:3px 0 5px"><i style="display:block;height:100%;width:'+pc+'%;background:linear-gradient(90deg,#3ad0a0,#8affd0)"></i></div>'
 +'<div>🎫 Giờ đã mua (kho): <b>'+hms(a.b)+'</b></div>'
 +'<div>⏳ Tổng có thể treo: <b style="color:#9dffd8">'+hms(tt)+'</b></div></div>'
 +'<div class="afkc" style="font-size:13px"><b>Thưởng ước tính / giờ</b> (không rơi trang bị)<br>✨ '+nf(e.xp)+' EXP · 🧘 '+(tvOn()?nf(e.tv)+' tu vi':'— tu vi')+' · 💰 '+nf(e.gold)+'<br>🔹 ~'+e.frag+' mảnh · 🔩 ~'+e.fe+' Quặng Sắt · 🌑 ~'+e.hk+' Huyền Kim · 🪨 Đá Cường Hóa</div>'
 +'<div class="afkw">⚠️ <b>CẢNH BÁO · MAP TREO OFFLINE</b>'
  +'<ul>'
  +'<li>Quái luôn <b>Lv'+P.lv+'</b> bằng cấp bạn và <b>mạnh theo dạng thể</b> ('+rname()+'): Đạo Thể / Tiên Nhân gặp quái trâu &amp; đau hơn, bù lại vàng nhiều hơn (EXP lên cấp vẫn 100%). Hãy chắc nhân vật đủ sức trước khi treo.</li>'
  +'<li>🧘 <b>Tu vi cảnh giới tu tiên</b> khi treo (online lẫn offline) = <b>'+Math.round(CF.tvK*100)+'%</b> map ngoài (gồm tu vi hạ quái + tự tu luyện). EXP lên cấp vẫn <b>100%</b> như map ngoài. Tu vi dừng ở ngưỡng đột phá — bạn tự đột phá khi mở game.</li>'
  +'<li><b>Giờ treo bị trừ cả khi tắt game</b> (tối đa bằng số giờ còn lại). Hết giờ là dừng, phần dư không được cộng bù.</li>'
  +'<li>Offline <b>chỉ tính khi bạn còn đứng trong map</b>. Bấm 🏘 Làng, đổi map/phụ bản hoặc đổi nhân vật = <b>mất treo offline</b>.</li>'
  +'<li>Treo chỉ nhận <b>EXP · Vàng · Nguyên liệu</b>, <b>không rơi trang bị</b>. Thưởng offline tính theo công thức ('+CF.spk+' giây/quái), không có boss.</li>'
  +'<li>Hãy chờ game <b>lưu xong</b> rồi mới tắt; mở lại đúng nhân vật đang treo để nhận thưởng.</li>'
  +'</ul></div>'
 +(noteTx?'<div style="color:'+noteC+';font-size:13.5px;margin:4px 0">'+noteTx+'</div>':'')
 +'<button class="afkb g" data-act="enter"'+(tt<60?' disabled':'')+'>▶ Vào Map Treo</button>'
 +'<div style="font-size:13px;margin-top:8px">💎 Linh Thạch: <b>'+(logged?nf(lt):'—')+'</b>'+(logged?'':' <span style="color:#ffb0b0">(cần đăng nhập ☁ để mua)</span>')+'</div>'
 +'<div class="afkr"><button class="afkb" data-act="buy1"'+(busy?' disabled':'')+'>+1 giờ · '+CF.ltPerHour+'💎</button><button class="afkb" data-act="buy4"'+(busy?' disabled':'')+'>+4 giờ · '+(4*CF.ltPerHour)+'💎</button></div>'
 +'<div style="font-size:12px;opacity:.75;line-height:1.5">Vào map rồi <b>tắt game</b> vẫn tiếp tục treo; mở lại sẽ nhận thưởng (tối đa theo số giờ còn lại). Bấm 🏘 Làng để rời map = dừng treo. Giờ miễn phí reset lúc 00:00; giờ đã mua không mất.</div>'
 +'<button class="afkb" style="background:#3a3a3a;border-color:#777;color:#fff" data-act="close">Đóng</button>';
 return h}
function reportHtml(){
 var r=rep;if(!r)return'';var w=r.rw;
 return'<h2 style="margin:0 0 6px;color:#9dffd8;font-size:19px">🌙 Treo '+(r.kind==='off'?'offline':'nền')+' hoàn tất</h2>'
 +'<div class="afkc">⏱ Thời gian: <b>'+hms(r.sec)+'</b>'+(r.capped?' <span style="color:#ffd98a">(đã hết giờ treo)</span>':'')+'<br>⚔ Quái hạ: <b>'+nf(r.n)+'</b> (Lv'+r.L+')<br>✨ EXP: <b>+'+nf(r.xp)+'</b>'+(r.tv?'<br>🧘 Tu vi: <b>+'+nf(r.tv)+'</b> <span style="opacity:.7">(80% map ngoài)</span>':'')+'<br>💰 Vàng: <b>+'+nf(w.gold)+'</b>'
 +'<br>🔹 Mảnh chế tạo: +'+nf(w.frag)+' · 🔩 Quặng Sắt: +'+nf(w.fe)+'<br>🌑 Huyền Kim: +'+nf(w.hk)+' · 🪨 Đá Cường Hóa: +'+nf(w.st)+'</div>'
 +'<div style="font-size:13px;opacity:.85">Giờ treo còn lại: <b>'+hms(r.left)+'</b></div>'
 +'<button class="afkb g" data-act="ok">Nhận · OK</button>'}
function render(){if(!ov||ov.style.display==='none'||!box)return;box.innerHTML=mode==='report'?reportHtml():panelHtml()}
function mkOv(){
 if(ov)return;mkHud();
 ov=document.createElement('div');ov.id='afk-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3';
 box=document.createElement('div');
 box.style.cssText='max-width:430px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px';
 ov.appendChild(box);
 ['pointerdown','pointerup','mousedown','touchstart','touchend','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
 ov.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-act]');
  var act=b?b.getAttribute('data-act'):(e.target===ov&&mode==='panel'?'close':'');
  if(b&&b.disabled)return;
  if(act==='enter')enter();else if(act==='buy1')buy(1);else if(act==='buy4')buy(4);else if(act==='close'||act==='ok')close()});
 document.body.appendChild(ov)}
function openOv(){mkOv();ov.style.display='flex';render()}
function openPanel(){if(!started||S.on)return;mode='panel';note('');openOv();try{if(window.LT&&LT.sync)LT.sync().then(function(){render()})}catch(e){}}
function close(){if(ov)ov.style.display='none'}

/* ---------- mua giờ bằng Linh Thạch ---------- */
function buy(h){
 if(busy)return;
 if(!(window.LT&&LT.spend&&LT.logged&&LT.logged())){note('🔒 Cần đăng nhập tài khoản ☁ để mua giờ bằng Linh Thạch','#ffb0b0');render();return}
 var cost=h*CF.ltPerHour,p=PS[cur];busy=true;note('Đang xử lý…','#ffe9a0');render();
 var done=function(){busy=false;render()};
 try{
  LT.spend(cost,'afk_'+h+'h').then(function(r){
   if(r&&r.ok){var a=A(p);if(a)a.b+=h*3600;try{sv()}catch(e){}note('✅ Đã mua +'+h+' giờ treo (−'+cost+'💎)','#9dffa0')}
   else if(r&&r.err==='poor')note('Không đủ Linh Thạch (cần '+cost+'💎)','#ffb0b0');
   else if(r&&r.err==='login')note('🔒 Cần đăng nhập để mua','#ffb0b0');
   else note('Mua thất bại, thử lại sau','#ffb0b0');
   done()},function(){note('Lỗi mạng, thử lại sau','#ffb0b0');done()})
 }catch(e){note('Lỗi: không mua được','#ffb0b0');done()}}

/* lưu mốc offline ngay khi đóng / ẩn trang */
function flush(){try{if(S.on){var a=A();if(a){a.on=1;a.ts=Date.now();sv()}}}catch(e){}}
addEventListener('pagehide',flush);addEventListener('beforeunload',flush);
document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});

/* Fix257: mỗi lần về làng Tân Thủ → mũi tên vàng chỉ vào nút Bản đồ, nhấp nháy 3 lần rồi mất */
var wEl=null,wTm=0,wPrev=null;
function warnShow(){
 try{
  var b=document.getElementById('mpb');if(!b)return;
  var r=b.getBoundingClientRect();if(!r.width)return;
  if(!document.getElementById('afkArrowCss')){var st=document.createElement('style');st.id='afkArrowCss';st.textContent='@keyframes afkArr{0%,100%{opacity:0;transform:translate(-50%,6px)}40%,60%{opacity:1;transform:translate(-50%,-6px)}}';document.head.appendChild(st)}
  if(!wEl){wEl=document.createElement('div');wEl.textContent='\u25bc';wEl.style.cssText='position:fixed;z-index:99999;font-size:44px;line-height:1;color:#ffd54a;text-shadow:0 0 8px #ffb300,0 2px 0 #000,0 0 3px #000;pointer-events:none;display:none'}
  if(!wEl.parentNode)document.body.appendChild(wEl);
  wEl.style.left=(r.left+r.width/2)+'px';wEl.style.top=(r.top-50)+'px';
  wEl.style.animation='none';void wEl.offsetWidth;wEl.style.animation='afkArr .8s ease-in-out 3';
  wEl.style.display='block';clearTimeout(wTm);wTm=setTimeout(function(){wEl.style.display='none'},2500)
 }catch(e){}}
setInterval(function(){try{
 if(!started){wPrev=null;return}
 var v=!!vil&&plain();
 if(wPrev===null){wPrev=v;return}
 if(v&&!wPrev)warnShow();
 if(!v&&wEl){wEl.style.display='none'}
 wPrev=v}catch(e){}},250);

window.AFKMAP={cfg:CF,open:openPanel,enter:enter,leave:function(){leave('',true)},on:function(){return !!S.on},
 left:function(){var a=A();return a?total(a):0},addHours:function(h){var a=A();if(a){a.b+=Math.max(0,+h||0)*3600;try{sv()}catch(e){}}}};
})();
