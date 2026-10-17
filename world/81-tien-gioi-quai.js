/* ===== 🐲 QUÁI TIÊN GIỚI Lv1-20 · TIÊN NHÂN BAY RA NGOÀI THÀNH THỊ (world/81-tien-gioi-quai.js) — nạp sau world/79 =====
 * Bản đồ Thành Thị Tiên Giới (world/61, 2.5D) có thêm quái bay quanh thành thị:
 *   • Quái Tiên Giới Lv1–20 (CF.lvMin/lvMax), bay đủ mọi hướng (di chuyển liên tục trong mặt phẳng + nhấp nhô độ cao), BỊ GIỚI HẠN không vào được thành thị
 *     (mặt đảo/cầu đi bộ + công trình + viền an toàn 0.75 ô). Quái chỉ tấn công khi nhân vật đang bay ngoài thành; trong thành là vùng an toàn.
 *   • Tiên Nhân (đã chuyển thế, CTHE.on()) tự mọc cánh khi rời mặt đất và BAY được ra ngoài thành thị (swipe / WASD như đi bộ). Có cánh sở hữu (PS.wg) → dùng cánh đó;
 *     chưa có cánh → vẽ cánh ánh sáng mặc định lúc bay. Phàm Thể/Đạo Thể: vẫn thấy quái nhưng không bay được → không giao chiến.
 *   • EXP quái = công thức engine (round(15×(1+Lv/5))) × killMul Đạo Thể × hệ số EXP bản đồ Đạo Thể Lv1-20 × CF.expK (3) → GẤP 3 LẦN quái Đạo Thể cùng cấp.
 *   • Máu quái = CF.hp (5.000.000/con) × CF.hpK; thủ/sức đánh bám bản đồ Đạo Thể Lv1-20 (LGMAP.cfg[1]) × CF.atkK. Không rơi trang bị/vật phẩm.
 *   • Tiên Nhân CHỈ tăng EXP bằng quái Tiên Giới (CF.onlyTgExp): HDAO.xg() trả 0 cho Tiên Nhân + mọi EXP cộng từ nguồn khác (nhiệm vụ, thuốc EXP, quái bản đồ khác) bị thu hồi
 *     trước mỗi khung (TGQ.addXp là đường cộng EXP hợp lệ). Map Treo của Tiên Nhân (world/80) dùng quái Tiên Giới đúng cấp nhân vật, cùng công thức EXP ×3.
 *   • Sát thương nhân vật: dùng đúng dm() của engine (chí mạng, Ý Cảnh, hấp huyết... như mọi bản đồ), hệ số lấy từ module gốc:
 *       Thần thông môn phái (world/72: mul × cấp kỹ năng) · Thần thông Ý Cảnh Tiên/Ma (world/49: YCTT.mul, trừ MP) · Pháp Bảo Bổn Mệnh (world/48: CF.sw/mn/gh/ax)
 *       · Linh Căn (systems/18: công thức từng hệ × (1.2+0.02×cấp)). Hình dạng vùng đánh khớp hiệu ứng 8 hướng của world/79 (đường thẳng/vòng/quạt theo hướng nhân vật quay mặt).
 *     Thêm đòn thường tự động (CF.basic) khi đang bay: đánh quái gần nhất trong CF.basicRange ô.
 *   • Trong thành thị (CF.safeCity=true) kỹ năng chỉ có hiệu ứng, không gây sát thương, không trừ MP.
 * Cách làm: bọc vstep (cập nhật), hero (vẽ quái bằng foe() gốc theo chiều sâu 2.5D, nâng nhân vật khi bay) — quái dựng bằng foe() với e.lgi=5 (chủ đề Tử Vân Linh Cảnh) + hào quang/cánh.
 * Vá nhỏ: world/61 (TG.flyHook cho phép bay + nâng nhân vật; xuất TG.ground/blocked/S2) · world/79 (móc TGQ.pre/TGQ.cast; TG8SK_CF.cd tự nâng lên 60s để hồi chiêu thật).
 * (HUD HP/MP dùng thanh có sẵn của game.)
 * Chỉnh: TGQ_CF (enable, max, lvMin, lvMax, hpK, atkK, expK, aggro, leash, safeCity, basic, fly, lift, box). Tắt: TGQ_CF.enable=false hoặc bỏ <script>. API: window.TGQ.
 * Phụ thuộc: TG (world/61), TG8SK (world/79), PS/cur/P/g/s/fr/cam/GY/W/H, dm/foe/MS/DT/PT, atk/mx/mm/nx/LC, ZC, HDAO, LGMAP, VPD, YCTT, YCANH, FABAO, CTHE (tuỳ chọn). Thiếu móc cốt lõi → module tự tắt. */
(function(){
'use strict';
if(typeof hero!=='function'||typeof vstep!=='function'||typeof foe!=='function'||typeof dm!=='function'||typeof PS==='undefined'||typeof MS==='undefined'||typeof g==='undefined'||!window.TG||!TG.ground||!TG.flyHook||!TG.S2||!TG.set)return;
var CF=window.TGQ_CF=window.TGQ_CF||{};
function def(k,v){if(CF[k]===undefined)CF[k]=v}
def('enable',true);def('needTien',true);def('fly',true);def('lift',44);
def('lvMin',1);def('lvMax',20);def('max',9);def('spawnEvery',80);def('aggro',7.5);def('leash',24);
def('hp',5e6);def('hpK',1);def('atkK',1);def('expK',3);def('onlyTgExp',true);
def('safeCity',true);def('basic',true);def('basicRange',3.2);def('basicCd',55);def('basicMul',1);
def('box',{x0:-13,x1:41,y0:-15,y1:51});
/* hồi chiêu thật cho kỹ năng (world/79 mặc định chỉ 5 giây vì trước đây chỉ là hiệu ứng) */
try{if(window.TG8SK_CF&&TG8SK_CF.cd===5)TG8SK_CF.cd=60}catch(e){}

var PI=Math.PI,TAU=PI*2,RM=34;
var AX=null,MON=[],FT=[],PR=[],TQ=[],KF=[],uid=0,kills=0,lastSp=0,lastSave=0,lastNote=0,bcd=0,lift=0,flying=false,seeded=0,hinted=0,SH={v:0,u:0};
var KINDS=['gob','wolf','scorp','arch','mage','gob','wolf','scorp'],RANGED={arch:1,mage:1};
function rnd(){return Math.random()}
function nf(n){return(Math.round(Number(n))||0).toLocaleString('vi-VN')}
function tien(){try{return !!(window.CTHE&&CTHE.on())}catch(e){return false}}
function tgOn(){try{return !!TG.on()}catch(e){return false}}
function inBox(x,y){var b=CF.box;return x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1}
/* "ngoài thành thị": không phải mặt đảo/cầu đi bộ, không sát công trình, trong khung bản đồ */
function outside(x,y){var m=.75;return inBox(x,y)&&!TG.ground(x,y)&&!TG.ground(x+m,y)&&!TG.ground(x-m,y)&&!TG.ground(x,y+m)&&!TG.ground(x,y-m)&&!TG.blocked(x,y)}
function liftNow(){return lift>2?lift+Math.sin(fr*.09)*3:lift}
function canFly(x,y){return !!CF.enable&&!!CF.fly&&(!CF.needTien||tien())&&inBox(x,y)}
TG.flyHook(canFly,liftNow);

/* ---------- hình học: mặt đất isometric 2:1, đơn vị = px "không gian nhân vật" (cùng hệ với hiệu ứng world/79) ---------- */
function KK(){return(TG.CF&&TG.CF.heroK)||.6}
function w2fx(dx,dy){var q=46/KK();return[(dx-dy)*q,(dx+dy)*q]}
function fx2w(u,v){var q=46/KK();return[(u+v)/(2*q),(v-u)/(2*q)]}
function ctxNew(A){var h=TG.hero();return{hx:h[0],hy:h[1],A:A,c:Math.cos(A),sn:Math.sin(A)}}
function relOf(cx,m,A){var uv=w2fx(m.x-cx.hx,m.y-cx.hy),c=A===undefined?cx.c:Math.cos(A),sn=A===undefined?cx.sn:Math.sin(A);return{D:uv[0]*c+uv[1]*sn,L:-uv[0]*sn+uv[1]*c}}
function alive(){return MON.filter(function(m){return m.hp>0&&!m.dead&&!m.gone})}
function pick(cx,fn,A){var o=[];alive().forEach(function(m){var r=relOf(cx,m,A);if(fn(r.D,r.L,m))o.push({m:m,D:r.D,L:r.L,d:Math.hypot(r.D,r.L)})});o.sort(function(a,b){return a.d-b.d});return o}
function wc(cx,D,L){var u=D*cx.c-L*cx.sn,v=D*cx.sn+L*cx.c,w=fx2w(u,v);return[cx.hx+w[0],cx.hy+w[1]]}
function circW(x,y,r){return alive().filter(function(m){var uv=w2fx(m.x-x,m.y-y);return Math.hypot(uv[0],uv[1])<r+RM})}
function later(n,fn){TQ.push({t:fr+Math.max(1,n|0),fn:fn})}

/* ---------- chữ nổi + thông báo ---------- */
function ft(m,s_,c,k,big){FT.push({wx:m.x,wy:m.y,z:(m.z||0)+(MS[m.k]?MS[m.k].h*.7:60)+10,s:s_,c:c||'#fff',k:!!k,big:!!big,t:0,l:(k||big)?72:50,dx:(rnd()-.5)*22});if(FT.length>40)FT.shift()}
function ftHero(s_,c){var h=TG.hero();FT.push({wx:h[0],wy:h[1],z:liftNow()+96,s:s_,c:c||'#fff',k:false,big:true,t:0,l:78,dx:0});if(FT.length>40)FT.shift()}
var toastEl=null,toastT=0;
function say(t){try{if(!toastEl){toastEl=document.createElement('div');toastEl.id='tgq-toast';toastEl.style.cssText='position:fixed;left:50%;top:calc(92px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:86vw;padding:6px 12px;border-radius:10px;background:rgba(14,10,40,.88);border:1px solid #b8a4ff;color:#f2eaff;font:bold 13px/1.4 KTH Serif,Songti SC,serif;text-align:center;z-index:29;display:none;pointer-events:none';document.body.appendChild(toastEl)}
 toastEl.textContent=t;toastEl.style.display='block';clearTimeout(toastT);toastT=setTimeout(function(){toastEl.style.display='none'},2600)}catch(e){}}

/* ---------- quái ---------- */
function stats(L){var c=null;try{c=LGMAP.cfg[1]}catch(e){}c=c||{m:1.2,hpn:3e5,df:2.7,at:24,exp:.5};
 return{hp:CF.hp*CF.hpK,df:(8+L*2.2)*(1+c.m*.4)*c.df,m:((1+.35*c.m)*c.at-1)/.35*CF.atkK}}
function mk(x,y){var L=CF.lvMin+Math.floor(rnd()*(CF.lvMax-CF.lvMin+1)),k=KINDS[Math.floor(rnd()*KINDS.length)],st=stats(L),id=++uid;
 return{id:id,k:k,lv:L,x:x,y:y,z:30+rnd()*50,zb:34+rnd()*60,hp:st.hp,max:st.hp,df:st.df,m:st.m,b:0,hh:MS[k]?MS[k].h:60,rg:RANGED[k]?340:60,
  tx:x,ty:y,tw:0,cd:60+rnd()*60,fl:0,sl:0,tqSt:0,tqMk:0,ph:rnd()*6,atk:0,mv:0,sn:id%5}}
function spawnOne(){var h=TG.hero(),hx=h[0],hy=h[1];
 for(var t=0;t<16;t++){var a=rnd()*TAU,d=5+rnd()*8,x=hx+Math.cos(a)*d,y=hy+Math.sin(a)*d;if(!outside(x,y))continue;
  var ok=true;for(var i=0;i<MON.length;i++)if(Math.hypot(MON[i].x-x,MON[i].y-y)<1.6){ok=false;break}
  if(ok){MON.push(mk(x,y));return true}}
 return false}

function hurtHero(m,k){
 if(!flying||!(P.hp>0))return;
 var df_=0;try{df_=Math.floor((sm('d')+alD())*ZC.pd()*HL.df()/5)}catch(e){}
 var q=Math.max(1,Math.round(.65*(8+m.lv*3)*(1+m.m*.35)*(k||1)-P.lv-df_));
 var dg=0;try{dg=Math.min(.4,SX('dodge')/100)+ZC.dg()}catch(e){}
 if(rnd()<dg){ftHero('Né','#7fe0ff');return}
 var q2=q;try{q2=Math.max(1,Math.round(q*(1-Math.min(.5,SX('dred')/100))*ZC.shd()))}catch(e){}
 if(SH.v>0&&SH.u>fr){var ab=Math.min(SH.v,q2);SH.v-=ab;q2-=ab}
 if(q2>0){P.hp-=q2;var h=TG.hero();FT.push({wx:h[0],wy:h[1],z:liftNow()+70,s:'-'+nf(q2),c:'#ff6a5a',k:false,big:false,t:0,l:50,dx:(rnd()-.5)*20})}
}
function ai(m,hx,hy){
 var dx=hx-m.x,dy=hy-m.y,d=Math.hypot(dx,dy)||.001;
 if(m.fl>0)m.fl--;if(m.sl>0)m.sl--;if(m.cd>0)m.cd--;m.ph+=.07;
 if(m.tqSt>0){m.tqSt--;m.mv=0;return}
 var rg=!!RANGED[m.k],chase=flying&&d<CF.aggro,stop=rg?4.2:1.05,sp=(chase?.032:.016)*(m.sl>0?.45:1),vx=0,vy=0;
 if(m.atk>0){
  m.atk--;
  if(!rg){var u=dx/d,v=dy/d,f=m.atk>11?.07:-.03;vx=u*f;vy=v*f;if(m.atk===11&&d<stop+.9)hurtHero(m,1)}
 }else if(chase){
  var ux=dx/d,uy=dy/d,want=d>stop?1:(rg&&d<stop-1.1?-1:0),sw=Math.sin(m.ph*1.3)*sp*.7;
  vx=ux*sp*want-uy*sw;vy=uy*sp*want+ux*sw;
  if(m.cd<=0){
   if(!rg&&d<=stop+.3){m.atk=22;m.cd=100+rnd()*30}
   else if(rg&&d<stop+1.8){m.cd=105+rnd()*30;PR.push({x:m.x,y:m.y,z:m.z,tx:hx,ty:hy,t:0,n:38,m:m})}
  }
 }else{
  if(--m.tw<=0||Math.hypot(m.tx-m.x,m.ty-m.y)<.4){var a=rnd()*TAU,r=2+rnd()*4,tx=m.x+Math.cos(a)*r,ty=m.y+Math.sin(a)*r;if(!outside(tx,ty)){tx=m.x;ty=m.y}m.tx=tx;m.ty=ty;m.tw=120+rnd()*180}
  var ex=m.tx-m.x,ey=m.ty-m.y,e=Math.hypot(ex,ey)||1;vx=ex/e*sp*.7;vy=ey/e*sp*.7;
 }
 for(var j=0;j<MON.length;j++){var o=MON[j];if(o===m||o.hp<=0)continue;var ox=m.x-o.x,oy=m.y-o.y,od=Math.hypot(ox,oy);if(od<.9&&od>.001){vx+=ox/od*.008;vy+=oy/od*.008}}
 var nx=m.x+vx,ny=m.y+vy;
 if(outside(nx,ny)){m.x=nx;m.y=ny}else if(outside(nx,m.y))m.x=nx;else if(outside(m.x,ny))m.y=ny;else m.tw=0;
 m.mv=(Math.abs(vx)+Math.abs(vy))>.002?1:0;
 var zt=chase?46+Math.sin(m.ph)*8:m.zb+Math.sin(m.ph*.7)*10;m.z+=(zt-m.z)*.04;
 if(!outside(m.x,m.y))m.gone=1;
}

/* ---------- sát thương lên quái (dùng dm() của engine) ---------- */
function hitMon(m,mul,o){
 if(!m||m.hp<=0||m.dead||m.gone)return 0;o=o||{};
 if(m.tqMk>fr)mul*=1.5;
 var n0=DT.length,p0=PT.length,h0=m.hp,f=typeof SKF!=='undefined';
 if(f&&o.skill)SKF=1;
 try{dm(m,mul,o.sl?1:0)}finally{if(f&&o.skill)SKF=0}
 var nt=DT.splice(n0);if(PT.length>p0)PT.splice(p0);
 nt.forEach(function(t){if(t&&t.s!==undefined)ft(m,t.s,t.k?'#ffe27a':(t.c||'#ffffff'),t.k)});
 try{if(window.TGFX&&TGFX.hit)TGFX.hit(m,o,h0-m.hp,nt)}catch(e){}
 if(o.sl)m.sl=Math.max(m.sl,150);
 if(m.hp<=0&&!m.dead){m.dead=1;kill(m)}
 return h0-m.hp}
function dotHit(m,mul,col){
 if(!m||m.hp<=0||m.dead||m.gone)return;
 var d=1,k=0;try{d=atk()*mul*(1+SX('dotd')/100);d=Math.max(1,Math.round(Math.min(d,m.max*.08)));d=Math.max(1,Math.round(dotCrit(d)));k=dotCrit.k|0}catch(e){}
 m.hp-=d;m.fl=4;ft(m,'👻'+nf(d),col||'#cda8ff',k);
 if(m.hp<=0&&!m.dead){m.dead=1;kill(m)}}
function lvUp(){
 try{var guard=0;
  while(P.xp>=nx()&&P.lv<LC(PS[cur].tier)&&guard++<50){P.xp-=nx();P.lv++;var pp=(window.CTHE&&CTHE.on())?CTHE.cfg.pts:(window.HDAO&&HDAO.on())?10:5;PS[cur].pts+=pp;P.hp=mx();P.mp=mm();ftHero('Lên cấp '+P.lv+'! +'+pp+' điểm tiềm năng','#ffe27a')}
 }catch(e){}}
/* EXP 1 quái Tiên Giới cấp L = công thức engine × killMul Đạo Thể × hệ số EXP bản đồ Đạo Thể Lv1-20 × CF.expK (3) */
function xpOf(L){var base=Math.round(15*(1+L/5)),km=3,ex=.5;try{km=HDAO.cfg.killMul}catch(e){}try{ex=LGMAP.cfg[1].exp||.5}catch(e){}return Math.max(1,Math.round(base*km*ex*CF.expK))}
/* đường cộng EXP hợp lệ cho Tiên Nhân (cập nhật mốc để bộ chặn bên dưới không thu hồi) */
var gB=0,gP=null,gC=-1,gLv=0,gNote=0;
function addXp(n){try{P.xp+=n;if(gP===P&&gC===cur)gB+=n}catch(e){}}
function kill(m){
 var xp=m.xp||xpOf(m.lv);
 addXp(xp);
 try{ZC.kill(m)}catch(e){}try{petGain(m)}catch(e){}try{QE('kill');QE('tgk')}catch(e){}
 kills++;ft(m,'+'+nf(xp)+' EXP','#8ff0ff',0,1);
 try{if(m.ax&&AX&&AX.killed)AX.killed(m,xp)}catch(e){}
 KF.push({wx:m.x,wy:m.y,z:m.z,t:0,l:26});
 lvUp();
 if(Date.now()-lastSave>20000){lastSave=Date.now();try{sv()}catch(e){}}}

/* ---------- kỹ năng ---------- */
function mpOf(it){try{var c=it.k.charAt(0),j=+it.k.slice(1);
 if(c==='y'){var inf=YCANH.info();return(YCTT.cfg.sk[inf.path][j]||{}).mp|0}
 if(c==='f')return FABAO.cfg.mp|0}catch(e){}return 0}
/* Fix163: móc cho world/84 (Tiên Linh Chiến Cảnh): AX={on,upd,ai,draw,killed,defeat} */
function axOn(){try{return !!(AX&&AX.on&&AX.on())}catch(e){return false}}
function canFight(){return flying||!CF.safeCity||axOn()}
function pre(it){
 if(!CF.enable||!tgOn())return true;
 if(!canFight()){if(Date.now()-lastNote>4000){lastNote=Date.now();say(tien()?'🏙 Thành thị là vùng an toàn — hãy bay ra ngoài để giao chiến':'🔒 Chỉ Tiên Nhân (đã chuyển thế) mới bay ra ngoài thành thị để chiến đấu')}return true}
 var mp=mpOf(it);if(mp>0&&P.mp<mp){say('Không đủ nội lực ('+nf(mp)+')');return false}
 return true}
function doSect(it,cx){
 var sp=it.sp||{},t=sp.t,m0=sp.mul||1,A=cx.A;
 try{var id=VPD.sect(),idx=[0,1,2,3,5][+it.k.slice(1)],inf=VPD.info(id,idx);m0=(sp.mul||1)*(1+((VPD.cfg&&VPD.cfg.lvScale)||.1)*((inf.lv||1)-1))}catch(e){}
 var sl=!!(sp.st&&sp.st.sl);
 function H(m,mu){hitMon(m,mu,{skill:1,sl:sl})}
 function circ(D,L,r,mu,fn){circW.apply(null,wc(cx,D,L).concat([r])).forEach(function(m){H(m,fn?fn(m):mu)})}
 if(t==='proj'){var a=pick(cx,function(D,L){return D>-20&&D<460&&Math.abs(L)<60+RM});if(a[0])H(a[0].m,m0)}
 else if(t==='multi'){var n=Math.min(6,sp.h||3);for(var i=0;i<n;i++){var rA=A+(i-(n-1)/2)*.26,b=pick(cx,function(D,L){return D>-20&&D<400&&Math.abs(L)<46+RM},rA);if(b[0])H(b[0].m,m0)}}
 else if(t==='dash'){pick(cx,function(D,L){return D>-20&&D<320&&Math.abs(L)<70+RM}).forEach(function(o){H(o.m,m0)})}
 else if(t==='mark'){var q=pick(cx,function(D,L){return D>-20&&Math.hypot(D,L)<320})[0];if(q){q.m.tqMk=fr+Math.round((sp.dur||5)*60);H(q.m,m0)}}
 else if(t==='exec'){circ(190,0,100,m0,function(m){return m0*(m.hp<m.max*.3?1.8:1)})}
 else if(t==='aoe'){circ(190,0,Math.max(70,Math.min(sp.r||150,170)),m0)}
 else if(t==='burst'){circ(180,0,130,m0)}
 else if(t==='freeze'){var cw=wc(cx,190,0);circW(cw[0],cw[1],110).forEach(function(m){H(m,m0);m.tqSt=150})}
 else if(t==='sweep'){pick(cx,function(D,L){return Math.hypot(D,L)<250+RM&&Math.abs(Math.atan2(L,D))<1.15}).forEach(function(o){H(o.m,m0)})}
 else if(t==='charge'){var c2=wc(cx,200,0);later(28,function(){circW(c2[0],c2[1],130).forEach(function(m){H(m,m0)})})}
 else if(t==='shield'){try{SH.v=mx()*(sp.pct||.12);SH.u=fr+Math.round((sp.dur||6)*60);ftHero('🛡 Hộ thể','#9fe8ff')}catch(e){}}
 else if(t==='dot'){
  var nT=Math.max(1,Math.round((sp.dur||5)*60/(sp.every||30))),per=m0/Math.min(nT,sp.cap||nT),cnt={},self=sp.where!=='tgt',R_=Math.max(70,Math.min(sp.r||150,sp.ult?300:170)*(sp.where==='self'?(sp.ult?.55:.7):1));
  var tg=pick(cx,function(D,L){return Math.hypot(D,L)<300})[0],cc=self?null:(tg?[tg.m.x,tg.m.y]:wc(cx,170,0));
  for(var k=1;k<=nT;k++)(function(k){later(k*(sp.every||30),function(){
   var ctr=self?TG.hero():cc;circW(ctr[0],ctr[1],self?Math.max(190,Math.min((sp.r||500)*.55,300)):R_).forEach(function(m){cnt[m.id]=(cnt[m.id]|0)+1;if(sp.cap&&cnt[m.id]>sp.cap)return;H(m,per)})})})(k)
 }
 else{circ(190,0,120,m0)}
}
function doYc(it,cx){
 var j=+it.k.slice(1),mul=1,s={};
 try{mul=YCTT.mul(j);var inf=YCANH.info();s=YCTT.cfg.sk[inf.path][j]||{}}catch(e){}
 var k=(it.rc||'ycB').charAt(2),sl=!!s.sl;
 function H(m,mu){hitMon(m,mu,{skill:1,sl:sl})}
 function heal(){try{if(s.heal)P.hp=Math.min(mx(),P.hp+mx()*s.heal)}catch(e){}}
 if(k==='B'){var n=pick(cx,function(D,L){return Math.hypot(D,L)<600})[0],cw=n?[n.m.x,n.m.y]:wc(cx,210,0);circW(cw[0],cw[1],(s.r||300)*.55).forEach(function(m){H(m,mul)});heal()}
 else if(k==='M'){var h=s.h||5;for(var q=0;q<h;q++)later(q*7,function(){var t=pick(ctxNew(cx.A),function(D,L){return Math.hypot(D,L)<600})[0];if(t)H(t.m,mul*1.2/h)})}
 else if(k==='S'){pick(cx,function(D,L){return Math.hypot(D,L)<900}).forEach(function(o,i){later(Math.min(i,8)*3,function(){H(o.m,mul*.8)})})}
 else{pick(cx,function(D,L){return D>-40&&D<560&&Math.abs(L)<70+RM}).forEach(function(o){H(o.m,mul)});heal()}
}
function doFb(it,cx){
 var t=+it.k.slice(1),l=1,C=null;try{l=FABAO.level()||1;C=FABAO.cfg}catch(e){return}
 if(t===0){var mul=C.sw.base+C.sw.lv*l,a=pick(cx,function(D,L){return Math.hypot(D,L)<720});if(!a.length)return;
  for(var k=0;k<C.sw.n;k++)(function(k){later(6+k*3,function(){hitMon(a[k%a.length].m,mul,{skill:1})})})(k)}
 else if(t===1){var mu=C.mn.base+C.mn.lv*l;if(!pick(cx,function(D,L){return Math.hypot(D,L)<700}).length)return;
  for(var i=0;i<12;i++)later(10+i*5,function(){var q=pick(ctxNew(cx.A),function(D,L){return Math.hypot(D,L)<700})[0];if(q)hitMon(q.m,mu,{skill:1})})}
 else if(t===2){var mg=C.gh.base+C.gh.lv*l,gs=pick(cx,function(D,L){return Math.hypot(D,L)<760}).slice(0,C.gh.n),nT=Math.round(C.gh.dur/C.gh.tick);
  gs.forEach(function(o){for(var k=1;k<=nT;k++)later(k*C.gh.tick,function(){dotHit(o.m,mg,'#cda8ff')})})}
 else{var tg=pick(cx,function(D,L){return Math.hypot(D,L)<640})[0];if(!tg)return;var cw=[tg.m.x,tg.m.y],ma=C.ax.base+C.ax.lv*l;
  later(C.ax.fall,function(){circW(cw[0],cw[1],190).forEach(function(m){hitMon(m,ma,{skill:1});m.tqSt=120})})}
}
function doLc(it,cx){
 var r=+it.k.slice(1),L=1,lv=1;
 try{lv=(PS[cur].lc.lv[r]|0)||1;L=lv+((window.TTLB&&TTLB.n)?TTLB.n():0)}catch(e){}
 var pw=1.2+.02*lv;
 function H(m,mu,sl){hitMon(m,mu*pw,{skill:1,sl:sl})}
 if(r===0){for(var k=0;k<5;k++)(function(k){later(k*6,function(){var cw=wc(ctxNew(cx.A),110+80*k,0);circW(cw[0],cw[1],52).forEach(function(m){H(m,1.4+.3*L)})})})(k)}
 else if(r===1){var seen={};[-.4,0,.4].forEach(function(off){pick(cx,function(D,L2){return D>-10&&D<360&&Math.abs(L2)<40+RM},cx.A+off).forEach(function(o){if(seen[o.m.id])return;seen[o.m.id]=1;H(o.m,1+.2*L,1)})});
  var n=pick(cx,function(D,L2){return D>-20&&Math.hypot(D,L2)<420})[0];if(n)H(n.m,3+.5*L)}
 else if(r===2){var cw2=wc(cx,150,0);for(var i=0;i<6;i++)later(i*12,function(){circW(cw2[0],cw2[1],240).forEach(function(m){H(m,.5+.12*L,1)})})}
 else if(r===3){[30,-30].forEach(function(off,b){later(b*10,function(){pick(ctxNew(cx.A),function(D,L2){return D>-10&&D<520&&Math.abs(L2-off)<45+RM}).forEach(function(o){H(o.m,4+.7*L)})})})}
 else{pick(cx,function(D,L2){return D>-10&&D<440&&Math.abs(L2)<75+RM}).forEach(function(o){H(o.m,3+.55*L,1)})}
}
function cast(it,sc,A){
 if(!CF.enable||!tgOn()||!canFight())return;
 var cx=ctxNew(A),c=it.k.charAt(0),mp=mpOf(it);
 if(mp>0)P.mp=Math.max(0,P.mp-mp);
 try{if(c==='s')doSect(it,cx);else if(c==='y')doYc(it,cx);else if(c==='f')doFb(it,cx);else if(c==='l')doLc(it,cx)}catch(e){}
}

/* ---------- cập nhật mỗi khung (bọc vstep) ---------- */
function reset(){MON.length=0;FT.length=0;PR.length=0;TQ.length=0;KF.length=0;lift=0;flying=false;seeded=0;bcd=0;SH.v=0}
function defeat(){
 if(axOn()&&AX.defeat){SH.v=0;MON.forEach(function(m){m.cd=90;m.atk=0});PR.length=0;try{AX.defeat()}catch(e){}return}
 ftHero('💀 Bại trận — được tiên khí đưa về thành','#ff8a7a');
 try{TG.set(14,36.6)}catch(e){}
 try{P.hp=Math.max(1,Math.round(mx()*.5));P.mp=Math.round(mm()*.5)}catch(e){P.hp=1}
 SH.v=0;MON.forEach(function(m){m.cd=90;m.atk=0});PR.length=0}
function upd(){
 var h=TG.hero(),hx=h[0],hy=h[1],T=tien(),onG=!!TG.ground(hx,hy),i,m,X=axOn();
 var air=!!(T&&CF.fly&&!onG);flying=air||X;
 var tgt=air?CF.lift:0;lift+=(tgt-lift)*.12;if(Math.abs(lift-tgt)<.3)lift=tgt;
 if(T&&!hinted){hinted=1;say('🪽 Tiên Nhân có thể bay ra ngoài thành thị để đánh quái Tiên Giới (EXP ×3)')}
 if(P.atk>0)P.atk--;
 try{if(P.hp<=0){defeat()}else{var mxh=mx(),mxm=mm();if(P.hp<mxh)P.hp=Math.min(mxh,P.hp+(onG&&!X?mxh*.0016:.05));if(P.mp<mxm)P.mp=Math.min(mxm,P.mp+(onG&&!X?mxm*.0016:.09))}}catch(e){}
 if(!seeded&&!X){seeded=1;for(i=0;i<Math.ceil(CF.max*.7);i++)spawnOne()}
 for(i=MON.length-1;i>=0;i--){m=MON[i];if(m.gone||(m.hp<=0&&m.dead)||Math.hypot(m.x-hx,m.y-hy)>CF.leash)MON.splice(i,1)}
 if(!X&&MON.length<CF.max&&fr-lastSp>CF.spawnEvery){lastSp=fr;spawnOne()}
 if(X&&AX.upd){try{AX.upd(hx,hy)}catch(e){}}
 MON.forEach(function(q){if(q.hp>0){if(q.ax&&AX&&AX.ai)AX.ai(q,hx,hy);else ai(q,hx,hy)}});
 for(i=PR.length-1;i>=0;i--){var p=PR[i];p.t++;if(p.t<p.n*.6){p.tx=hx;p.ty=hy}if(p.t>=p.n){if(flying&&Math.hypot(hx-p.tx,hy-p.ty)<1.3)hurtHero(p.m,.85);PR.splice(i,1)}}
 for(i=TQ.length-1;i>=0;i--)if(TQ[i].t<=fr){var f=TQ[i].fn;TQ.splice(i,1);try{f()}catch(e){}}
 if(bcd>0)bcd--;
 if(CF.basic&&canFight()&&flying&&bcd<=0){var cx=ctxNew(0),n=null,nd=1e9;alive().forEach(function(q){var d=Math.hypot(q.x-hx,q.y-hy);if(d<CF.basicRange&&d<nd){nd=d;n=q}});
  if(n){bcd=CF.basicCd;P.atk=Math.max(P.atk|0,14);hitMon(n,CF.basicMul,{skill:0});KF.push({wx:n.x,wy:n.y,z:n.z,t:0,l:12,sl:1})}}
 for(i=FT.length-1;i>=0;i--){if(++FT[i].t>=FT[i].l)FT.splice(i,1)}
 for(i=KF.length-1;i>=0;i--){if(++KF[i].t>=KF[i].l)KF.splice(i,1)}
}
/* Tiên Nhân chỉ tăng EXP bằng quái Tiên Giới: quái engine không cho EXP, nguồn EXP khác bị thu hồi trước khi engine xét lên cấp */
function hintXp(){if(Date.now()-gNote<8000)return;gNote=Date.now();try{DT.push({x:P.x,y:150,s:'🧚 Tiên Nhân chỉ tăng EXP bằng quái Tiên Giới',c:'#c8b8ff',g:1,l:110})}catch(e){}if(tgOn())say('🧚 Tiên Nhân chỉ tăng EXP bằng quái Tiên Giới')}
if(window.HDAO&&HDAO.xg){var _xg=HDAO.xg;HDAO.xg=function(){if(CF.enable&&CF.onlyTgExp&&tien()){hintXp();return 0}return _xg.apply(this,arguments)}}
var _stp=step;
step=function(){
 try{if(CF.enable&&CF.onlyTgExp&&tien()&&gP===P&&gC===cur&&gLv===P.lv&&P.xp>gB+.5){P.xp=gB;hintXp()}}catch(e){}
 var r=_stp.apply(this,arguments);
 try{gP=P;gC=cur;gLv=P.lv;gB=P.xp}catch(e){}
 return r};
var _vs=vstep;
vstep=function(){var r=_vs.apply(this,arguments);try{if(CF.enable&&tgOn())upd();else if(MON.length||TQ.length||lift)reset()}catch(e){}return r};

/* ---------- vẽ (bọc hero) ---------- */
var PE={k:'gob',x:0,hp:1,max:1,df:0,b:0,m:1,lv:1,cd:0,sl:0,fl:0,'in':0,sn:0,hh:60,rg:60,mv:0,lgi:5};
function orb(x,y,r,col,al){if(r<.5||al<=0)return;g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(255,255,255,'+Math.min(1,al)+')');q.addColorStop(.4,col.replace('A',String(al*.85)));q.addColorStop(1,col.replace('A','0'));g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore()}
function drawMon(m){
 var a=TG.S2(m.x,m.y),X=a[0],Y=a[1];
 if(X<-140||X>W+140||Y<-220||Y>H+180)return;
 var z=m.z*s,hh=(MS[m.k]?MS[m.k].h:60)*.7,cy=Y-z-hh*.5*s;
 g.save();g.globalAlpha=.28*Math.max(.35,1-m.z/180);g.fillStyle='#02021a';g.beginPath();g.ellipse(X,Y,22*s,9*s,0,0,TAU);g.fill();g.restore();
 orb(X,cy,36*s,'rgba(150,235,255,A)',.4+.1*Math.sin(fr*.1+m.ph));
 var fl=Math.sin(fr*.28+m.ph*3);
 for(var sd=-1;sd<=1;sd+=2){g.save();g.translate(X+sd*5*s,cy-4*s);g.scale(sd,1);g.rotate(-.5-fl*.35);g.globalAlpha=.5;
  var q=g.createLinearGradient(0,0,46*s,-10*s);q.addColorStop(0,'rgba(255,255,255,.9)');q.addColorStop(1,'rgba(150,225,255,.1)');g.fillStyle=q;
  g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(26*s,-28*s,46*s,-6*s);g.quadraticCurveTo(26*s,6*s,0,6*s);g.closePath();g.fill();g.restore()}
 PE.k=m.k;PE.x=X/s;PE.hp=m.hp;PE.max=m.max;PE.df=m.df;PE.m=m.m;PE.lv=m.lv;PE.sl=m.sl;PE.fl=m.fl;PE.mv=m.mv;PE.sn=m.sn;PE.hh=m.hh;PE.rg=m.rg;
 PE.cd=(m.atk>0&&!RANGED[m.k])?48+Math.min(16,22-m.atk):0;
 var og=GY;GY=Y-z;try{foe(PE)}catch(e){}finally{GY=og}
}
function wingsFB(){
 var ax=(P.x-cam)*s,ay=GY-52*s,f=Math.sin(fr*.22);
 g.save();g.translate(ax,ay);
 for(var sd=-1;sd<=1;sd+=2){g.save();g.scale(sd,1);g.rotate(-.3-f*.3);
  for(var i=0;i<3;i++){var L=(78-i*16)*s,q=g.createLinearGradient(0,0,L,-30*s);q.addColorStop(0,'rgba(255,255,255,.85)');q.addColorStop(1,'rgba(150,220,255,.12)');g.fillStyle=q;g.globalAlpha=.78-i*.12;
   g.beginPath();g.moveTo(4*s,-i*7*s);g.quadraticCurveTo(L*.55,-(46-i*6)*s,L,(-12+i*10)*s);g.quadraticCurveTo(L*.5,(8+i*5)*s,4*s,(6-i*3)*s);g.closePath();g.fill()}
  g.restore()}
 g.restore()}
function drawFx(){
 var i,a;
 PR.forEach(function(p){var u=p.t/p.n,wx=p.x+(p.tx-p.x)*u,wy=p.y+(p.ty-p.y)*u;a=TG.S2(wx,wy);var zz=(p.z+(26-p.z)*u)*s;orb(a[0],a[1]-zz,14*s,'rgba(120,230,255,A)',.95)});
 KF.forEach(function(k){if(window.TGFX&&TGFX.on&&TGFX.on())return;a=TG.S2(k.wx,k.wy);var u=k.t/k.l,zz=(k.z+22)*s;
  if(k.sl){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=1-u;g.strokeStyle='#fff';g.lineWidth=3*s;g.beginPath();g.moveTo(a[0]-18*s,a[1]-zz-14*s);g.lineTo(a[0]+18*s,a[1]-zz+14*s);g.stroke();g.restore()}
  else{g.save();g.globalCompositeOperation='lighter';g.globalAlpha=1-u;g.strokeStyle='#bff4ff';g.lineWidth=3*s;g.beginPath();g.ellipse(a[0],a[1]-zz,(14+46*u)*s,(14+46*u)*s*.6,0,0,TAU);g.stroke();g.restore();
   for(var j=0;j<6;j++){var an=j*1.047+u*2;orb(a[0]+Math.cos(an)*30*u*s,a[1]-zz+Math.sin(an)*18*u*s-12*u*s,7*s,'rgba(160,240,255,A)',.9*(1-u))}}});
 g.save();g.textAlign='center';g.lineJoin='round';
 FT.forEach(function(t){a=TG.S2(t.wx,t.wy);var u=t.t/t.l,sz=(t.k?22:t.big?17:14)*s*1.5;
  g.font='bold '+sz+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.globalAlpha=u>.7?Math.max(0,(1-u)/.3):1;
  var x=a[0]+t.dx*s*.5,y=a[1]-(t.z+u*46)*s;g.lineWidth=3*s;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(String(t.s),x,y);g.fillStyle=t.c;g.fillText(String(t.s),x,y)});
 g.restore()
}
function dMon(m){if(m.ax&&AX&&AX.draw)AX.draw(m);else drawMon(m)}
var _h=hero;
hero=function(){
 if(!CF.enable||!tgOn())return _h.apply(this,arguments);
 var h=TG.hero(),a=TG.S2(h[0],h[1]);
 if(Math.abs(P.x*s-a[0])>2||Math.abs(GY+liftNow()*s-a[1])>3)return _h.apply(this,arguments);
 var hd=h[0]+h[1],back=[],front=[];
 MON.forEach(function(m){if(m.hp<=0||m.gone)return;(m.x+m.y<=hd?back:front).push(m)});
 var srt=function(p,q){return(p.x+p.y)-(q.x+q.y)};back.sort(srt);front.sort(srt);
 back.forEach(dMon);
 try{if(tien()&&lift>4&&!(typeof wl==='function'&&wl()>0))wingsFB()}catch(e){}
 var r=_h.apply(this,arguments);
 front.forEach(dMon);
 try{drawFx()}catch(e){}
 return r};

window.TGQ={ext:function(o){AX=o},pr:PR,hurt:hurtHero,ft:ft,say:say,ftHero:ftHero,uid:function(){return ++uid},lvUp:lvUp,KF:KF,pre:pre,cast:cast,CF:CF,xpOf:xpOf,stat:stats,addXp:addXp,tien:tien,mon:MON,spawn:spawnOne,reset:reset,flying:function(){return flying},kills:function(){return kills},hit:hitMon};
})();
