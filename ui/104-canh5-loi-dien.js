/* ui/104-canh5-loi-dien.js — Fix391: Cánh Cấp 5 (Lôi Vũ Thiên Quang Dực)
   • Nội tại 1: 2% mỗi đòn gây ra → sát thương ×2 (móc dm(), chỉ khi đòn trúng).
   • Nội tại 2: Thần thông Lôi Điện — tự kích hoạt (không tốn mana, không hiện HUD): mưa sấm sét 3 giây, hồi 20 giây.
     Chỉ tự dùng khi có quái trong tầm. Đòn sét tính như đòn kỹ năng (SKF=1) nên hưởng cả +% sát thương kỹ năng của Cánh 4.
   • Không sửa core. Chỉnh số ở khối LD bên dưới. */
(function(){
'use strict';
if(typeof dm!=='function'||typeof wl!=='function'||typeof step!=='function'||typeof draw!=='function')return;
var LD=window.C5=window.C5||{
 x2:2,          /* % tỉ lệ ×2 sát thương */
 dur:180,       /* 3 giây (60 khung/giây) */
 cd:1200,       /* hồi 20 giây */
 gap:8,         /* khung giữa 2 tia sét */
 n:3,           /* số mục tiêu mỗi loạt sét */
 mult:1.5,      /* hệ số sát thương mỗi tia (× công, qua dm) */
 rad:80,        /* bán kính trúng sét (px thế giới) */
 range:620,     /* tầm tự kích hoạt quanh nhân vật (map thường, px) */
 tgRange:9,     /* tầm tự kích hoạt ở Tiên Giới (số ô) */
 tgRad:2        /* bán kính trúng sét ở Tiên Giới (số ô) */
};
function has(){try{return wl()>=5}catch(e){return false}}
function arenaOn(){try{var a=document.getElementById('arena-scene');return !!(a&&a.classList.contains('on'))}catch(e){return false}}
/* ---- 2% ×2 sát thương ---- */
var _dm=dm;
dm=function(e,m,sl){
 var dbl=false;
 try{dbl=has()&&Math.random()*100<LD.x2}catch(x){}
 if(!dbl)return _dm.call(this,e,m,sl);
 var hp0=e.hp;_dm.call(this,e,m*2,sl);
 try{if(e.hp<hp0)DT.push({x:e.x,y:(e.hh||100)*SZ+34,s:'⚡ x2 Sát thương!',c:'#8fd8ff',l:50})}catch(x){}
};
/* ---- Thần thông Lôi Điện ---- */
var st={t:0,cd:0,bolts:[],flash:0,lastFr:-1};
/* Tiên Giới 2.5D: quái nằm trong TGQ.mon (toạ độ ô), hit qua TGQ.hit; chỉ đánh khi đang giao chiến được (bay ngoài thành) */
function tgMode(){try{return !!(window.TG&&TG.on&&TG.on())}catch(e){return false}}
function tgFight(){try{return !!(window.TGQ&&TGQ.mon&&(TGQ.flying()||(TGQ.CF&&!TGQ.CF.safeCity)))}catch(e){return false}}
function tgEnemies(){
 var r=[],h=TG.hero();
 TGQ.mon.forEach(function(m){if(m&&m.hp>0&&!m.dead&&!m.gone&&Math.hypot(m.x-h[0],m.y-h[1])<LD.tgRange)r.push(m)});
 return r}
function enemies(){
 if(tgMode())return tgFight()?tgEnemies():[];
 var r=[];if(typeof E==='undefined'||!E)return r;
 for(var i=0;i<E.length;i++){var e=E[i];if(e&&e.hp>0&&!(e.in>0)&&typeof e.x==='number'&&Math.abs(e.x-P.x)<LD.range)r.push(e)}
 return r}
function canRun(){if(!has()||!started||!P||!(P.hp>0))return false;if(tgMode())return tgFight();return !vil&&!over&&!arenaOn()}
function strikeTG(){
 var es=tgEnemies(),pick=[],h=TG.hero(),pool=es.slice(),pts=[];
 while(pick.length<LD.n&&pool.length)pick.push(pool.splice((Math.random()*pool.length)|0,1)[0]);
 if(pick.length)pick.forEach(function(m){pts.push({x:m.x,y:m.y,z:m.z||0})});
 else pts.push({x:h[0]+(Math.random()-.5)*7,y:h[1]+(Math.random()-.5)*7,z:0});
 pts.forEach(function(q){st.bolts.push({tg:1,wx:q.x,wy:q.y,z:q.z,t:0,l:16,seed:(Math.random()*9999)|0})});
 st.flash=Math.max(st.flash,5);
 /* tắt hiệu ứng 'trúng đòn' của TGFX cho đòn sét (nếu không, nhiều tia/quái cộng dồn hào quang làm trắng cả màn hình) */
 var fx=window.TGFX,fh=fx&&fx.hit;if(fh)fx.hit=function(){};
 try{pts.forEach(function(q){es.forEach(function(m){if(m.hp>0&&!m.dead&&Math.hypot(m.x-q.x,m.y-q.y)<LD.tgRad)TGQ.hit(m,LD.mult,{skill:1})})})}
 finally{if(fh)fx.hit=fh}}
function strike(){
 if(tgMode())return strikeTG();
 var es=enemies(),i,pick=[];
 if(es.length){
  /* chọn tối đa n mục tiêu khác nhau, ngẫu nhiên */
  var pool=es.slice();
  while(pick.length<LD.n&&pool.length){pick.push(pool.splice((Math.random()*pool.length)|0,1)[0])}
 }
 var xs=pick.length?pick.map(function(e){return e.x}):[P.x+(Math.random()-.5)*LD.range];
 xs.forEach(function(x,k){
  x+=(Math.random()-.5)*30;
  st.bolts.push({x:x,t:0,l:16,seed:(Math.random()*9999)|0});
 });
 st.flash=Math.max(st.flash,5);
 /* sát thương: quái trong bán kính của mỗi tia */
 SKF=1;
 try{
  xs.forEach(function(x){
   es.forEach(function(e){
    if(e.hp>0&&Math.abs(e.x-x)<LD.rad)dm(e,LD.mult,0);
   });
  });
 }finally{SKF=0}
}
var _step=step;
step=function(){
 _step.apply(this,arguments);
 try{
   var b=st.bolts;for(var i=b.length-1;i>=0;i--){if(++b[i].t>=b[i].l)b.splice(i,1)}
  if(st.flash>0)st.flash--;
  if(!canRun()){if(st.t>0)st.t=0;return}
  if(st.cd>0)st.cd--;
  if(st.t>0){
   st.t--;if(st.t%LD.gap===0)strike();
  }else if(st.cd<=0&&enemies().length){
   st.t=LD.dur;st.cd=LD.cd;
   DT.push({x:P.x,y:170,s:'⚡ Lôi Điện Thần Thông!',c:'#8fd8ff',g:1,l:90});
  }
 }catch(x){}
};
/* ---- vẽ mưa sét (không dùng shadowBlur để nhẹ máy) ---- */
function rnd(n){var x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)}
function drawBolt(b){
 var sx,y1,y0=-10,n=9;if(b.tg){var tq=TG.S2(b.wx,b.wy);sx=tq[0];y1=tq[1]-b.z*s}else{sx=(b.x-cam)*s;y1=GY-14*s}
 var a=1-b.t/b.l,pts=[],i,u,j;
 for(i=0;i<=n;i++){u=i/n;j=(i==0||i==n)?0:(rnd(b.seed+i*7+(b.t>>1))-.5)*46*s*(1-.3*u);pts.push([sx+j,y0+(y1-y0)*u])}
 g.globalAlpha=a*.55;g.strokeStyle='#4aa8ff';g.lineWidth=7*s;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(i=1;i<=n;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
 g.globalAlpha=a;g.strokeStyle='#e8f6ff';g.lineWidth=2.4*s;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(i=1;i<=n;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
 /* nhánh phụ */
 var m=3+((b.seed)%3);if(m<pts.length-1){g.globalAlpha=a*.7;g.lineWidth=1.3*s;g.strokeStyle='#bfe4ff';g.beginPath();g.moveTo(pts[m][0],pts[m][1]);g.lineTo(pts[m][0]+(rnd(b.seed+3)<.5?-1:1)*(26+rnd(b.seed+5)*22)*s,pts[m][1]+(34+rnd(b.seed+9)*26)*s);g.stroke()}
 /* vệt sáng chạm đất */
 var q=g.createRadialGradient(sx,y1,2,sx,y1,46*s);q.addColorStop(0,'rgba(190,230,255,'+(a*.8)+')');q.addColorStop(1,'rgba(80,160,255,0)');g.globalAlpha=1;g.fillStyle=q;g.beginPath();g.arc(sx,y1,46*s,0,6.2832);g.fill()}
var _draw=draw;
draw=function(){
 _draw.apply(this,arguments);
 try{
  if(!st.bolts.length&&st.t<=0&&st.flash<=0)return;
  g.save();g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  if(st.t>0){ /* mây sấm trên đỉnh màn hình, hiện/tắt mượt */
   var e=Math.min(1,st.t/20,(LD.dur-st.t)/20),gr=g.createLinearGradient(0,0,0,H*.28);gr.addColorStop(0,'rgba(70,130,255,'+(.38*e)+')');gr.addColorStop(1,'rgba(70,130,255,0)');
   g.globalAlpha=1;g.fillStyle=gr;g.fillRect(0,0,W,H*.28)}
  if(st.flash>0){g.globalAlpha=st.flash*.018;g.fillStyle='#bfe0ff';g.fillRect(0,0,W,H)}
  for(var i=0;i<st.bolts.length;i++)drawBolt(st.bolts[i]);
  g.restore();
 }catch(x){try{g.restore()}catch(y){}}
};
/* ---- dòng mô tả trong tab Cánh ---- */
if(typeof wgUI==='function'){var _ui=wgUI;
 wgUI=function(){var h=_ui.apply(this,arguments);
  try{if(has())h+='<div class="dt">⚡ <b>Lôi Vũ Thiên Quang Dực</b>: +'+LD.x2+'% tỉ lệ <b>x2</b> sát thương gây ra<br>⚡ <b>Thần thông Lôi Điện</b> (nội tại, tự dùng, không tốn mana): mưa sấm sét '+LD.dur/60+'s · hồi '+LD.cd/60+'s</div>';
  else h+='<div class="dt"><small>⚡ Cánh Cấp 5: +'+LD.x2+'% tỉ lệ x2 sát thương · Thần thông Lôi Điện (mưa sét '+LD.dur/60+'s, hồi '+LD.cd/60+'s)</small></div>'}catch(x){}
  return h}}
window.C5ST=st;
})();
