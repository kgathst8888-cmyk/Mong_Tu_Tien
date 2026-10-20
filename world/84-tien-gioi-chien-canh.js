/* ===== ⚔️ TIÊN LINH CHIẾN CẢNH · BẢN ĐỒ QUÁI THEO CẤP CỦA TIÊN NHÂN (world/84-tien-gioi-chien-canh.js) — nạp sau world/81 =====
 * Cổng "Tiên Linh Chiến Cảnh" nằm trên quảng trường Thành Thị Tiên Giới (SPOT id 'warp', world/61). CHỈ Tiên Nhân (CTHE.on()) mới vào được;
 * người khác chạm cổng chỉ thấy thẻ "Chỉ Tiên Nhân". Bên trong là 1 đảo chiến trường 2.5D (isometric) riêng, xa thành thị (đảo 'war' trong world/61),
 * cùng hệ toạ độ/camera/nhân vật/kỹ năng với Thành Thị Tiên Giới nên mọi thứ của Tiên Giới dùng được nguyên vẹn:
 *   hero 8 hướng (world/74) · cánh 8 hướng (world/78) · nút kỹ năng + sát thương thật (world/79 → TGQ.cast của world/81) · đòn thường tự động (TGQ).
 * Quái: DỰA TRÊN quái Tiên Giới Lv1-20 của world/81 (cùng 5 loại gob/wolf/scorp/arch/mage, cùng đường tính sát thương/hạ gục/EXP/cấp), khác ở chỗ:
 *   • CẤP THEO NHÂN VẬT: cấp quái = cấp nhân vật ± CF.lvSpread (tối thiểu 1). Chỉ số gốc lấy theo bản đồ Đạo Thể tương ứng (LGMAP.cfg):
 *       Lv1-20 → bản đồ 2 · 21-40 → bản đồ 3 · 41-60 → bản đồ 4 · 61+ → bản đồ 5 (giống Map Treo). Hình/tên quái theo chủ đề bản đồ đó (LGNMN).
 *   • MẠNH GẤP 50 LẦN quái Đạo Thể cùng cấp: MÁU = hpn × CF.hpK (50) · SỨC ĐÁNH (hệ số trước khi trừ giáp) = at × CF.atkK (50) · THỦ × CF.dfK (mặc định 1, vì thủ tính theo
 *     công thức giảm sát thương nên ×50 sẽ gần như không thể đánh nổi — đổi nếu muốn).
 *   • EXP GẤP 5 LẦN quái Đạo Thể cùng cấp: round(15×(1+Lv/5)) × killMul Đạo Thể × hệ số EXP bản đồ Đạo Thể × CF.expK (5). Cộng qua TGQ.addXp (đường EXP hợp lệ của Tiên Nhân).
 *   • Không rơi trang bị/vật phẩm (như quái Tiên Giới).
 *   • DI CHUYỂN & QUAY 8 HƯỚNG: quái chỉ có 8 hướng (E,SE,S,SW,W,NW,N,NE trên màn hình = 4 trục bản đồ + 4 đường chéo), mỗi lần quay 1 nấc 45° (CF.turnFr khung/nấc),
 *     đi theo hướng đang quay mặt, đuổi theo người chơi bằng cách chọn hướng gần nhất. Hình quái là tranh nhìn ngang (LVX.lvMon) nên các hướng được dựng bằng lật trái/phải,
 *     co chiều ngang (nhìn chéo/thẳng), phủ tối khi quay lưng (N, NE, NW) + vòng dưới chân có múi sáng chỉ đúng hướng mặt.
 * An toàn: quanh cổng về (CF.safeR) quái không đuổi/không tới. Bại trận → hồi sinh ở cổng về với 50% HP/MP (quái giữ nguyên). Nút 🏘 Làng trong chiến cảnh = về Thành Thị Tiên Giới.
 * Móc: world/81 (TGQ.ext({on,upd,ai,draw,killed,defeat}); quái có cờ ax=1 nên 81 không chạy AI/vẽ quái thành thị cho chúng) · world/61 (đảo 'war', SPOT 'warp'/'warpback').
 * Chỉnh: TGQA_CF (enable, hpK, atkK, dfK, expK, max, lvSpread, spawnEvery, aggro, safeR, turnFr, speed, size). Tắt: TGQA_CF.enable=false hoặc bỏ <script>. API: window.TGQA. */
(function(){
'use strict';
if(typeof g==='undefined'||typeof MS==='undefined'||!window.TGQ||!TGQ.ext||!TGQ.pr||!window.TG||!TG.spots||!TG.ground||!TG.blocked||!TG.S2||!TG.set||!window.LVX||!LVX.lvMon)return;
var CF=window.TGQA_CF=window.TGQA_CF||{};
function def(k,v){if(CF[k]===undefined)CF[k]=v}
def('enable',true);def('hpK',50);def('atkK',50);def('dfK',1);def('expK',5);def('max',12);def('lvSpread',2);def('spawnEvery',46);
def('aggro',8.5);def('safeR',3.2);def('turnFr',5);def('speed',.03);def('size',1.3);
var PI=Math.PI,TAU=PI*2;
var AR={cx:62,cy:22,rx:10.5,ry:9.5},ENTRY=[62,17.4],PAD=[62,15.6],CITY=[14,41.3];
var KINDS=['gob','wolf','scorp','arch','mage','gob','wolf','scorp'],RANGED={arch:1,mage:1};
var FALL=[null,{m:1.2,hpn:3e5,df:2.7,at:24,exp:.5},{m:2,hpn:6e5,df:3,at:28,exp:.5},{m:3,hpn:1.2e6,df:3.3,at:32,exp:.5},{m:4.2,hpn:2.4e6,df:3.6,at:40,exp:.5}];
var kills=0,lastSp=0,lastHud=0,hudEl=null,entered=0;
function rnd(){return Math.random()}
function nf(n){return(Math.round(Number(n))||0).toLocaleString('vi-VN')}
function tien(){try{return !!(window.CTHE&&CTHE.on())}catch(e){return false}}
function tgOn(){try{return !!TG.on()}catch(e){return false}}
function inArena(x,y){return x>AR.cx-13&&x<AR.cx+13&&y>AR.cy-12&&y<AR.cy+12}
function here(){var h=TG.hero();return inArena(h[0],h[1])}
function on(){return !!CF.enable&&tgOn()&&here()}
function say(t){try{TGQ.say(t)}catch(e){}}

/* ---------- chỉ số quái: gốc = quái Đạo Thể cùng cấp, rồi nhân hệ số ---------- */
function bracket(L){return L<=20?1:L<=40?2:L<=60?3:4}
function cfgOf(bk){var c=null;try{c=LGMAP.cfg[bk]}catch(e){}return c||FALL[bk]}
/* quái Đạo Thể cùng cấp (để so sánh / kiểm thử): máu, hệ số sức đánh (trước giáp), thủ, EXP */
function daoRef(L){var bk=bracket(L),c=cfgOf(bk),km=3;try{km=HDAO.cfg.killMul}catch(e){}
  return{bk:bk,hp:c.hpn,atkF:(1+.35*c.m)*c.at,df:(8+L*2.2)*(1+c.m*.4)*c.df,xp:Math.max(1,Math.round(Math.round(15*(1+L/5))*km*(c.exp||.5)))}}
function stats(L){var r=daoRef(L),c=cfgOf(r.bk);
  return{bk:r.bk,hp:c.hpn*CF.hpK,df:r.df*CF.dfK,m:((1+.35*c.m)*c.at*CF.atkK-1)/.35,xp:Math.max(1,Math.round(r.xp*CF.expK))}}
function lvRoll(){var p=Math.max(1,(typeof P!=='undefined'?(P.lv|0):1)||1),sp=CF.lvSpread|0;return Math.max(1,p+Math.floor(rnd()*(sp*2+1))-sp)}

/* ---------- 8 hướng: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE (hướng trên MÀN HÌNH, cùng quy ước world/74 & 79) ---------- */
var D8=[];(function(){for(var k=0;k<8;k++){var c=Math.cos(k*PI/4),s=Math.sin(k*PI/4);D8.push([(c+s)*.7071,(s-c)*.7071])}})();
function hdOf(dx,dy){var th=Math.atan2(dx+dy,dx-dy);return((Math.round(th/(PI/4))%8)+8)%8}
function dHd(a,b){var d=(((b-a)%8)+8)%8;return d>4?d-8:d}
function ground(x,y){return TG.ground(x,y)&&!TG.blocked(x,y)&&Math.hypot(x-PAD[0],y-PAD[1])>2.1}

function mk(x,y){var L=lvRoll(),k=KINDS[Math.floor(rnd()*KINDS.length)],st=stats(L),id=TGQ.uid();
  return{id:id,ax:1,k:k,lv:L,bk:st.bk,x:x,y:y,z:0,hp:st.hp,max:st.hp,df:st.df,m:st.m,xp:st.xp,b:0,hh:MS[k]?MS[k].h:60,rg:RANGED[k]?340:60,
    tx:x,ty:y,tw:0,cd:50+rnd()*60,fl:0,sl:0,tqSt:0,tqMk:0,ph:rnd()*6,atk:0,mv:0,sn:id%5,hd:Math.floor(rnd()*8),tn:0,wd:0,fin:22,fx:rnd()<.5?1:-1}}
function spawnOne(hx,hy,mons){
  for(var t=0;t<18;t++){var a=rnd()*TAU,r=Math.sqrt(rnd())*.82,x=AR.cx+Math.cos(a)*AR.rx*r,y=AR.cy+Math.sin(a)*AR.ry*r;
    if(!ground(x,y)||Math.hypot(x-hx,y-hy)<5.5)continue;
    var ok=true;for(var i=0;i<mons.length;i++)if(Math.hypot(mons[i].x-x,mons[i].y-y)<1.6){ok=false;break}
    if(ok){mons.push(mk(x,y));return true}}
  return false}

/* ---------- AI: quay từng nấc 45°, đi theo hướng đang quay ---------- */
function ai(m,hx,hy){
  var dx=hx-m.x,dy=hy-m.y,d=Math.hypot(dx,dy)||.001,rg=!!RANGED[m.k];
  if(m.fl>0)m.fl--;if(m.sl>0)m.sl--;if(m.cd>0)m.cd--;if(m.fin>0)m.fin--;m.ph+=.07;
  if(m.tqSt>0){m.tqSt--;m.mv=0;return}
  var safe=Math.hypot(hx-PAD[0],hy-PAD[1])<CF.safeR,chase=d<CF.aggro&&!safe&&(P.hp>0),stop=rg?4.2:1.05,
      sp=CF.speed*(chase?1:.5)*(m.sl>0?.45:1),want=m.hd,move=0,k;
  if(m.atk>0){
    m.atk--;m.mv=0;m.hd=hdOf(dx,dy);
    if(!rg){var f=m.atk>11?.06:-.025;k=D8[m.hd];tryMove(m,k[0]*f,k[1]*f);if(m.atk===11&&d<stop+.9)TGQ.hurt(m,1)}
    return}
  if(chase){
    want=hdOf(dx,dy);
    if(rg&&d<stop-1.1)want=(want+4)%8;
    move=(d>stop||(rg&&d<stop-1.1))?1:0;
    if(m.cd<=0){
      if(!rg&&d<=stop+.3){m.atk=22;m.cd=100+rnd()*30;m.hd=hdOf(dx,dy);return}
      if(rg&&d<stop+1.8){m.atk=12;m.cd=105+rnd()*30;m.hd=hdOf(dx,dy);TGQ.pr.push({x:m.x,y:m.y,z:34,tx:hx,ty:hy,t:0,n:38,m:m});return}}
  }else{
    if(--m.tw<=0){m.tw=70+rnd()*140;m.wd=rnd()<.35?0:1;want=Math.floor(rnd()*8);m.wh=want;
      /* gần mép đảo thì hướng về tâm */
      if(Math.hypot((m.x-AR.cx)/AR.rx,(m.y-AR.cy)/AR.ry)>.74)m.wh=hdOf(AR.cx-m.x,AR.cy-m.y)}
    want=m.wh===undefined?m.hd:m.wh;move=m.wd}
  /* quay 1 nấc / CF.turnFr khung */
  var df_=dHd(m.hd,want);
  if(df_!==0){if(++m.tn>=CF.turnFr){m.tn=0;m.hd=(m.hd+(df_>0?1:-1)+8)%8}}else m.tn=0;
  m.mv=0;
  if(move&&Math.abs(dHd(m.hd,want))<=1){k=D8[m.hd];if(tryMove(m,k[0]*sp,k[1]*sp))m.mv=1;else if(!chase){m.tw=0;m.wh=hdOf(AR.cx-m.x,AR.cy-m.y)}}
  /* tách nhau ra */
  for(var j=0;j<MONS().length;j++){var o=MONS()[j];if(o===m||o.hp<=0||!o.ax)continue;var ox=m.x-o.x,oy=m.y-o.y,od=Math.hypot(ox,oy);if(od<.9&&od>.001)tryMove(m,ox/od*.008,oy/od*.008)}
}
function MONS(){return TGQ.mon}
function tryMove(m,vx,vy){var nx=m.x+vx,ny=m.y+vy;if(ground(nx,ny)){m.x=nx;m.y=ny;return true}if(ground(nx,m.y)){m.x=nx;return true}if(ground(m.x,ny)){m.y=ny;return true}return false}

/* ---------- vòng cập nhật (81 gọi mỗi khung khi đang ở chiến cảnh) ---------- */
function upd(hx,hy){
  var mons=MONS(),alive=0,i;for(i=0;i<mons.length;i++)if(mons[i].ax&&mons[i].hp>0)alive++;
  var need=CF.max-alive;
  if(need>0){if(entered<2){for(i=0;i<Math.min(need,Math.ceil(CF.max*.7));i++)spawnOne(hx,hy,mons);entered=2;lastSp=fr}
    else if(fr-lastSp>CF.spawnEvery){lastSp=fr;spawnOne(hx,hy,mons)}}
  if(fr-lastHud>14){lastHud=fr;hud()}}
function killed(m,xp){kills++;hud()}
function defeat(){
  try{TGQ.ftHero('💀 Bại trận — về cổng chiến cảnh','#ff8a7a')}catch(e){}
  try{TG.set(ENTRY[0],ENTRY[1])}catch(e){}
  try{P.hp=Math.max(1,Math.round(mx()*.5));P.mp=Math.round(mm()*.5)}catch(e){P.hp=1}}

/* ---------- vẽ quái 8 hướng ---------- */
var TINT={};
function tintOf(sp,key){var c=TINT[key];if(c&&c.width===sp.width)return c;
  var o=document.createElement('canvas');o.width=sp.width;o.height=sp.height;var q=o.getContext('2d');q.drawImage(sp,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(14,6,44,.5)';q.fillRect(0,0,o.width,o.height);
  o.naturalWidth=o.width;o.naturalHeight=o.height;return TINT[key]=o}
var WX=[1,.88,.7,.88,1,.88,.7,.88];
function themeOf(bk){try{return LVX.LT[4+bk].rune||'#ffb0f0'}catch(e){return'#ffb0f0'}}
function nameOf(m){try{var n=(window.LGNMN||{})[4+m.bk];if(n&&n[m.k])return n[m.k]}catch(e){}return MS[m.k]?MS[m.k].n:m.k}
function draw(m){
  var a=TG.S2(m.x,m.y),X=a[0],Y=a[1];
  if(X<-170||X>W+170||Y<-260||Y>H+200)return;
  try{if(window.TGM&&TGM.d84(m,X,Y,s,{size:CF.size,col:themeOf(m.bk)}))return}catch(e){}   /* Fix360: 12 quái mới */
  var sp=null;try{sp=LVX.lvMon(m.k,4+m.bk)||LVX.lvMon(m.k,1)}catch(e){}
  if(!sp||!sp.width)return;
  var ms=MS[m.k]||{h:60},HHm=ms.h,sc=s*((typeof SZ==='number'&&SZ)||1)*CF.size,w=sp.width/sp.height*HHm,k=m.hd,th=k*PI/4,cs=Math.cos(th),sn=Math.sin(th),
      back=(k===5||k===6||k===7);
  if(k===7||k===0||k===1)m.fx=1;else if(k===3||k===4||k===5)m.fx=-1;
  var al=Math.max(.05,Math.min(1,1-m.fin/22)),col=themeOf(m.bk),lung=m.atk>0?(m.atk>11?(22-m.atk)/11:m.atk/11):0,
      bob=m.mv?Math.abs(Math.sin(fr*.25+m.sn))*5*sc:Math.sin(fr*.06+m.ph)*1.2*sc,
      ox=cs*20*sc*lung,oy=sn*10*sc*lung;
  g.save();g.globalAlpha=al;
  /* vòng dưới chân + múi sáng chỉ hướng mặt (mặt đất dẹt 2:1) */
  g.save();g.translate(X,Y);g.scale(1,.5);var R=30*sc;
  g.fillStyle='rgba(0,0,20,.34)';g.beginPath();g.arc(0,0,R*.78,0,TAU);g.fill();
  g.strokeStyle=col;g.globalAlpha=al*.55;g.lineWidth=2*s;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';g.globalAlpha=al*.55;g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.arc(0,0,R*1.12,th-.4,th+.4);g.closePath();g.fill();
  g.restore();
  /* thân */
  g.save();g.globalAlpha=al;g.translate(X+ox,Y+oy-bob);g.scale((m.fx||1)*WX[k]*sc,sc*(1+Math.sin(fr*.12+m.sn)*.012));
  var src=back?tintOf(sp,m.k+'@'+m.bk):sp;
  g.drawImage(src,-w/2,-HHm,w,HHm);
  if(m.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=al*.55;g.drawImage(src,-w/2,-HHm,w,HHm)}
  g.restore();
  /* tên + thanh máu */
  var ty=Y-HHm*sc-14*s,nm=nameOf(m)+' Lv'+m.lv;
  g.font='bold '+Math.round(11*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';
  var tw=g.measureText(nm).width;g.globalAlpha=al;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(X-tw/2-3,ty-11*s,tw+6,12*s);
  g.fillStyle='#ffd6ff';g.fillText(nm,X,ty-1*s);
  g.fillStyle='#000a';g.fillRect(X-30*s,ty+3*s,60*s,5*s);g.fillStyle='#e8c040';g.fillRect(X-30*s,ty+3*s,60*s*Math.max(0,Math.min(1,m.hp/m.max)),5*s);
  g.restore()}

/* ---------- HUD nhỏ ---------- */
function hud(){
  try{
    if(!hudEl){hudEl=document.createElement('div');hudEl.id='tga-hud';hudEl.style.cssText='position:fixed;left:50%;top:calc(104px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:92vw;padding:3px 10px;border-radius:10px;background:rgba(20,8,40,.78);border:1px solid #b88aff;color:#ffe9c8;font:bold 11.5px/1.45 KTH Serif,Songti SC,serif;text-align:center;z-index:5;pointer-events:none;display:none';document.body.appendChild(hudEl)}
    if(!on()){hudEl.style.display='none';return}
    var p=Math.max(1,(P.lv|0)||1),sp=CF.lvSpread|0,t='⚔️ Tiên Linh Chiến Cảnh · quái Lv'+Math.max(1,p-sp)+'-'+(p+sp)+' · máu ×'+CF.hpK+' · sức đánh ×'+CF.atkK+' · EXP ×'+CF.expK+' · hạ '+nf(kills);
    if(hudEl.textContent!==t)hudEl.textContent=t;hudEl.style.display='block'}catch(e){}}
setInterval(function(){try{if(!on()&&hudEl&&hudEl.style.display!=='none')hud()}catch(e){}},400);

/* ---------- vào / ra ---------- */
function enter(){
  if(!CF.enable)return false;
  if(!tien()){say('🔒 Chỉ Tiên Nhân (đã chuyển thế) mới vào được Tiên Linh Chiến Cảnh');return false}
  if(!tgOn())return false;
  try{TGQ.reset()}catch(e){}
  kills=0;entered=0;lastSp=fr;
  try{TG.set(ENTRY[0],ENTRY[1])}catch(e){return false}
  say('⚔️ Tiên Linh Chiến Cảnh · quái theo cấp, mạnh gấp '+CF.hpK+' lần quái Đạo Thể · EXP ×'+CF.expK);
  hud();return true}
function exit(){
  try{TGQ.reset()}catch(e){}
  try{TG.set(CITY[0],CITY[1])}catch(e){}
  entered=0;hud();say('🏙 Về Thành Thị Tiên Giới');return true}

/* mở/khoá cổng theo cảnh giới (kiểm tra 1 giây/lần) */
var LOCK_SUB='Bản đồ quái theo cấp · chỉ Tiên Nhân',OPEN_SUB='Bản đồ quái theo cấp · quái ×'+CF.hpK+' · EXP ×'+CF.expK;
function sync(){TG.spots.forEach(function(p){
  if(p.id==='warp'){var ok=CF.enable&&tien();if(ok&&(!p.open||p.go!==enter)){p.open=1;p.go=enter;p.sub=OPEN_SUB}else if(!ok&&(p.open||p.go)){p.open=0;p.go=null;p.sub=LOCK_SUB}}
  else if(p.id==='warpback'){if(p.go!==exit){p.open=1;p.go=exit}}})}
sync();setInterval(sync,1000);

/* nút 🏘 Làng trong chiến cảnh = về thành thị (không thoát Tiên Giới) */
try{var vlb=document.getElementById('vl'),_ov=vlb&&vlb.onpointerdown;
  if(vlb)vlb.onpointerdown=function(e){if(on()){try{e.stopPropagation()}catch(x){}exit();return}return _ov&&_ov.call(this,e)}}catch(e){}
/* tên bản đồ trên HUD */
try{var _ft=g.fillText,_st=g.strokeText;
  g.fillText=function(a,x,y,m){if(a==='Thanh Vân Tiên Thôn'&&on())a='Tiên Linh Chiến Cảnh';return _ft.call(this,a,x,y,m)};
  g.strokeText=function(a,x,y,m){if(a==='Thanh Vân Tiên Thôn'&&on())a='Tiên Linh Chiến Cảnh';return _st.call(this,a,x,y,m)}}catch(e){}

TGQ.ext({on:on,upd:upd,ai:ai,draw:draw,killed:killed,defeat:defeat});
window.TGQA={CF:CF,on:on,enter:enter,exit:exit,stats:stats,daoRef:daoRef,bracket:bracket,spawn:function(){var h=TG.hero();return spawnOne(h[0],h[1],MONS())},kills:function(){return kills},AR:AR,D8:D8,hdOf:hdOf,mk:mk};
})();
