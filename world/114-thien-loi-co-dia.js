/* ===== ⚡ THIÊN LÔI CỔ ĐỊA (world/114-thien-loi-co-dia.js · Fix356 + Fix357) =====
 * Bản đồ quái Nhân Giới mới, vào từ mục 🗺 Bản đồ (nhà Bản Đồ Làng Tân Thủ 1) → hàng "Thiên Lôi Cổ Địa".
 * - Điều kiện: Lv40 (CFG.req). Dùng chỉ số quái/rơi đồ của map Nhân Giới số 2 (CFG.base) nên không đụng 5 map cũ.
 * - Nền: cao nguyên đá đen, mây sấm trôi, chớp xa; vẽ phủ lên nền map gốc (bọc bgd).
 * - Cơ chế sét: vòng cảnh báo hiện CFG.warn khung trên đất rồi sét đánh xuống.
 *     · nhân vật đứng trong vòng → mất CFG.pPct máu tối đa (KHÔNG chết vì sét, tối thiểu còn 1 máu)
 *     · quái đứng trong vòng → mất CFG.mPct máu tối đa (không bị hạ dưới 1 máu, để engine tính rơi đồ/EXP như thường)
 *     · sét rơi ngẫu nhiên: nửa gần nhân vật, nửa gần quái → né được thì quái trúng thay.
 * - Fix357: quái đổi tên theo chủ đề Lôi (NAMES) + hào quang điện/tia điện quanh quái (bọc foe, vẫn dùng sprite & chỉ số gốc);
 *   Boss Sử Thi (b==3) thành "Lôi Đế Tàn Hồn": hồi 66% máu → 3 sét nhắm vào nhân vật; hồi 33% → "Mưa Sét" quét cả map; luôn gọi 1 sét nhắm nhân vật mỗi 4 giây.
 * - Fix359: Lôi Đế Tàn Hồn có hình riêng vẽ bằng canvas (paintBoss), đổi sắc theo pha (xanh → trắng xanh → tím hồng).
 * - Fix361 độ khó: sét dày hơn/đau hơn (period 110, warn 58, R 52, người -14%), quái ×1.8 máu ×1.4 sát thương, Boss ×2.4 máu ×1.35 sát thương, sét nhắm người mỗi ~2.8 giây.
 * - Chưa có: sprite quái thường riêng, vật phẩm rơi riêng (Lôi Tinh), cột thu lôi nạp buff.
 * Chỉnh: window.TLC.cfg (req, base, period, warn, R, pPct, mPct). Tắt: bỏ <script> trong index.html.
 * Phụ thuộc: gm, bgd, step, mapSel, vil, lg, dg, started, P, E, DT, W, s, g, mx, BDT (world/101, tuỳ chọn). */
(function(){
'use strict';
if(typeof gm!=='function'||typeof bgd!=='function'||typeof step!=='function'||typeof g==='undefined'||typeof P==='undefined')return;

var CFG={req:40,base:2,period:110,warn:58,R:52,pPct:.14,mPct:.04,hp:1.8,df:1.4,eHp:1.1,eDf:1.05,bHp:2.4,bDf:1.35,bossGap:170};
var on=false,entering=false,tick=0,nextAt=90,bolts=[],flash=0,farAt=240,farX=.5;

function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:150})}catch(e){}}
function lite(){return (window.QL|0)>=2}
function active(){
  try{return on&&started&&!vil&&!lg&&!dg&&mapSel===CFG.base}catch(e){return false}
}
function rnd(a){var x=Math.sin(a*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function wmax(){try{return W/s}catch(e){return 800}}

/* ---------- vào / ra ---------- */
function eligible(){try{return P.lv>=CFG.req}catch(e){return false}}
function enter(){
  if(!started)return;
  if(!eligible()){say('🔒 Cần Lv'+CFG.req+' để vào Thiên Lôi Cổ Địa','#ff9a8a');return}
  entering=true;
  try{gm(CFG.base)}finally{entering=false}
  on=true;bolts=[];nextAt=tick+120;
  say('⚡ Thiên Lôi Cổ Địa','#bfe0ff');
}
/* mọi lần đổi map khác (gm) đều tắt chế độ */
var _gm=gm;
gm=function(){
  if(!entering){on=false;bolts=[]}
  return _gm.apply(this,arguments);
};

/* ---------- sét ---------- */
function addBolt(){
  var bx,e;
  if(typeof E!=='undefined'&&E.length&&Math.random()<.5){
    e=E[(Math.random()*E.length)|0];bx=(e&&typeof e.x==='number'?e.x:P.x)+(Math.random()-.5)*40;
  }else bx=P.x+(Math.random()-.5)*220;
  bx=Math.max(40,Math.min(wmax()-40,bx));
  bolts.push({x:bx,t0:tick,seed:(Math.random()*1e4)|0,hit:false});
}
function addBoltAt(x){
  if(bolts.length>=9)return;
  bolts.push({x:Math.max(40,Math.min(wmax()-40,x)),t0:tick,seed:(Math.random()*1e4)|0,hit:false});
}
function strike(b){
  b.hit=true;flash=10;
  try{
    var R=CFG.R;
    if(Math.abs(P.x-b.x)<R){
      var d=Math.max(1,Math.round(mx()*CFG.pPct));
      P.hp=Math.max(1,P.hp-d);
      DT.push({x:P.x,y:100,s:d,r:1,l:45});
      DT.push({x:P.x,y:150,s:'⚡ Bị sét đánh!',c:'#bfe0ff',g:1,l:60});
    }
    if(typeof E!=='undefined')for(var i=0;i<E.length;i++){
      var e=E[i];
      if(!e||e.k==='pal'||typeof e.x!=='number'||!(e.max>0))continue;
      if(Math.abs(e.x-b.x)<R){
        var dm=Math.max(1,Math.round(e.max*CFG.mPct));
        e.hp=Math.max(1,e.hp-dm);
        DT.push({x:e.x,y:110,s:dm,c:'#bfe0ff',l:40});
      }
    }
  }catch(x){}
}
/* Fix361 — tăng độ khó: nhân chỉ số quái mới xuất hiện (hp/max/df), Boss riêng hệ số lớn hơn */
function scaleMon(){
  var i,e,hm,dm;
  if(typeof E==='undefined')return;
  for(i=0;i<E.length;i++){
    e=E[i];if(!e||e._tld||!(e.max>0)||e.k==='pal')continue;
    e._tld=1;
    hm=e.b===3?CFG.bHp:e.b===1?CFG.eHp:CFG.hp;dm=e.b===3?CFG.bDf:e.b===1?CFG.eDf:CFG.df;
    e.hp*=hm;e.max*=hm;if(typeof e.df==='number')e.df*=dm;
  }
}
var _step=step;
step=function(){
  var r=_step.apply(this,arguments);
  try{
    tick++;
    if(!active()){if(bolts.length)bolts=[];return r}
    scaleMon();
    if(tick>=nextAt&&bolts.length<3){
      addBolt();if(Math.random()<.3)addBolt();
      nextAt=tick+CFG.period*(lite()?1.4:1)+Math.random()*90;
    }
    for(var i=bolts.length-1;i>=0;i--){
      var b=bolts[i],age=tick-b.t0;
      if(age>=CFG.warn&&!b.hit)strike(b);
      if(age>CFG.warn+18)bolts.splice(i,1);
    }
    bossStep();
    if(flash>0)flash--;
  }catch(e){}
  return r;
};


/* ---------- Lôi Đế Tàn Hồn (Boss Sử Thi b==3) ---------- */
var rainUntil=0,rainNext=0;
function bossStep(){
  var i,e,bo=null;
  if(typeof E==='undefined')return;
  for(i=0;i<E.length;i++){e=E[i];if(e&&e.b===3&&e.k!=='pal'&&e.max>0){bo=e;break}}
  if(!bo){rainUntil=0;return}
  var ratio=bo.hp/bo.max;
  if(!bo.tlp)bo.tlp=0;
  if(bo.tlp<1&&ratio<.66){
    bo.tlp=1;say('⚡ Lôi Đế nổi giận! Sét nhắm thẳng vào bạn','#bfe0ff');
    for(i=0;i<3;i++)addBoltAt(P.x+(i-1)*70);
  }
  if(bo.tlp<2&&ratio<.33){
    bo.tlp=2;say('⛈ MƯA SÉT! Hãy tìm chỗ trống','#ffd0ff');
    rainUntil=tick+480;rainNext=tick;
  }
  if(rainUntil>tick&&tick>=rainNext){
    var n=lite()?3:5,gap=wmax()/n,off=Math.random()*gap;
    for(i=0;i<n;i++)addBoltAt(off+i*gap);
    rainNext=tick+110;
  }
  if(!bo.tlN||tick>=bo.tlN){
    if(bo.tlN)addBoltAt(P.x);
    bo.tlN=tick+CFG.bossGap;
  }
}

/* ---------- đổi tên + hào quang điện cho quái ---------- */
var NAMES={gob:'Lôi Thạch Khôi',wolf:'Điện Lang',scorp:'Điện Hạt',arch:'Lôi Cung Thủ',mage:'Lôi Pháp Sư',ogre:'Lôi Tướng',golem:'Lôi Đế Tàn Hồn'};
function arcs(e,m){
  var HH=m.h*(typeof BZ!=='undefined'?(BZ[e.b|0]||1):1)*SZ*s,x=e.x*s,cy=GY-HH*.5,rx=HH*.45,ry=HH*.55,
      boss=e.b===3,cnt=lite()?1:(boss?6:e.b===1?4:3),al=Math.max(.05,Math.min(1,1-e.in/30)),ph=Math.floor(tick/6),i,j;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;
  if(!lite()){
    var q=g.createRadialGradient(x,cy,HH*.05,x,cy,HH*.75);
    q.addColorStop(0,'rgba(140,190,255,'+(boss?.30:.18)+')');q.addColorStop(1,'rgba(90,130,255,0)');
    g.fillStyle=q;g.beginPath();g.arc(x,cy,HH*.75,0,6.283);g.fill();
  }
  g.strokeStyle='rgba(215,235,255,.9)';g.lineWidth=Math.max(1,(boss?2:1.3)*s);g.lineJoin='round';
  for(i=0;i<cnt;i++){
    var a0=rnd(ph*7+i*3+e.sn)*6.283,a1=a0+1.1+rnd(ph*5+i+e.sn)*1.4;
    g.beginPath();g.moveTo(x+Math.cos(a0)*rx,cy+Math.sin(a0)*ry);
    for(j=1;j<4;j++){
      var u=j/4,aa=a0+(a1-a0)*u,jit=(rnd(ph*11+i*5+j+e.sn)-.5)*HH*.22;
      g.lineTo(x+Math.cos(aa)*(rx+jit),cy+Math.sin(aa)*(ry+jit));
    }
    g.lineTo(x+Math.cos(a1)*rx,cy+Math.sin(a1)*ry);g.stroke();
  }
  g.restore();
}

/* ---------- hình riêng Lôi Đế Tàn Hồn (vẽ bằng canvas, thay sprite Boss Sử Thi trong map này) ---------- */
var BC=document.createElement('canvas');BC.width=256;BC.height=320;BC.naturalWidth=256;BC.naturalHeight=320;
var bcKey='';
var BPAL=[{c:'#8fd8ff',a:'143,216,255',w:'#e4f6ff'},{c:'#a9c8ff',a:'169,200,255',w:'#ffffff'},{c:'#ff8fe8',a:'255,143,232',w:'#ffe3ff'}];
function zig(c,x0,y0,x1,y1,n,amp,seed){
  var i,u;c.beginPath();c.moveTo(x0,y0);
  for(i=1;i<n;i++){u=i/n;c.lineTo(x0+(x1-x0)*u+(rnd(seed+i)-.5)*amp,y0+(y1-y0)*u+(rnd(seed+i+40)-.5)*amp)}
  c.lineTo(x1,y1);c.stroke();
}
function poly(c,pts,fill,stroke,lw){
  var i;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();
  if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||2;c.stroke()}
}
function paintBoss(cv,ph,t){
  var c=cv.getContext('2d'),K=BPAL[ph]||BPAL[0],pu=.5+.5*Math.sin(t*.13),fl=rnd(Math.floor(t/3))>.82?1.4:1,i,a,q,sd=Math.floor(t/4);
  c.clearRect(0,0,256,320);c.lineJoin='round';c.lineCap='round';
  /* hào quang + vòng rune sau đầu */
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(128,86,16,128,86,96);q.addColorStop(0,'rgba('+K.a+',.34)');q.addColorStop(1,'rgba('+K.a+',0)');
  c.fillStyle=q;c.beginPath();c.arc(128,86,96,0,6.283);c.fill();
  c.strokeStyle='rgba('+K.a+',.85)';c.lineWidth=3;c.beginPath();c.arc(128,86,62,0,6.283);c.stroke();
  c.lineWidth=2;
  for(i=0;i<18;i++){a=i/18*6.283+t*.018;var r1=62,r2=70+(i%3)*5;c.beginPath();c.moveTo(128+Math.cos(a)*r1,86+Math.sin(a)*r1);c.lineTo(128+Math.cos(a)*r2,86+Math.sin(a)*r2);c.stroke()}
  c.restore();
  /* áo choàng mây bão */
  q=c.createLinearGradient(0,110,0,316);q.addColorStop(0,'#2a2466');q.addColorStop(1,'#07071c');
  c.beginPath();c.moveTo(80,118);c.quadraticCurveTo(38,200,14,304);
  c.lineTo(50,294);c.lineTo(68,314);c.lineTo(96,296);c.lineTo(128,316);c.lineTo(160,296);c.lineTo(188,314);c.lineTo(206,294);c.lineTo(242,304);
  c.quadraticCurveTo(218,200,176,118);c.closePath();c.fillStyle=q;c.fill();
  c.strokeStyle='rgba('+K.a+',.45)';c.lineWidth=2;c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba('+K.a+',.22)';c.lineWidth=3;
  for(i=0;i<4;i++){c.beginPath();c.moveTo(70+i*8,150+i*20);c.bezierCurveTo(40+i*10,200+i*10,60+i*14,250,36+i*16,300);c.stroke();
    c.beginPath();c.moveTo(186-i*8,150+i*20);c.bezierCurveTo(216-i*10,200+i*10,196-i*14,250,220-i*16,300);c.stroke()}
  c.restore();
  /* thân giáp */
  q=c.createLinearGradient(0,116,0,216);q.addColorStop(0,'#40468a');q.addColorStop(1,'#12143a');
  poly(c,[[88,118],[168,118],[158,216],[98,216]],q,'rgba('+K.a+',.9)',2);
  c.strokeStyle='rgba('+K.a+',.5)';c.lineWidth=2;c.beginPath();c.moveTo(128,122);c.lineTo(128,212);c.stroke();
  poly(c,[[96,216],[160,216],[162,228],[94,228]],'#202450','rgba('+K.a+',.7)',1.5);
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(128,160,1,128,160,26*fl);q.addColorStop(0,'#ffffff');q.addColorStop(.35,'rgba('+K.a+',.95)');q.addColorStop(1,'rgba('+K.a+',0)');
  c.fillStyle=q;c.beginPath();c.arc(128,160,(14+pu*5)*fl+10,0,6.283);c.fill();c.restore();
  /* vai giáp gai */
  var L=[[96,110],[72,98],[76,112],[48,114],[60,128],[38,142],[66,144],[92,152]];
  poly(c,L,'#2c3270','rgba('+K.a+',.9)',2);
  poly(c,L.map(function(p){return[256-p[0],p[1]]}),'#2c3270','rgba('+K.a+',.9)',2);
  /* tay trái buông, nắm đấm phát sáng */
  c.strokeStyle='#262a62';c.lineWidth=18;c.beginPath();c.moveTo(66,148);c.lineTo(56,216);c.stroke();
  c.strokeStyle='rgba('+K.a+',.6)';c.lineWidth=2;c.beginPath();c.moveTo(60,148);c.lineTo(50,216);c.stroke();
  c.fillStyle='#343a80';c.beginPath();c.arc(54,226,11,0,6.283);c.fill();
  c.save();c.globalCompositeOperation='lighter';q=c.createRadialGradient(54,226,1,54,226,22);q.addColorStop(0,'rgba('+K.a+',.8)');q.addColorStop(1,'rgba('+K.a+',0)');c.fillStyle=q;c.beginPath();c.arc(54,226,22,0,6.283);c.fill();c.restore();
  /* tay phải giơ cao cầm Lôi Trượng */
  c.strokeStyle='#262a62';c.lineWidth=16;c.beginPath();c.moveTo(190,148);c.lineTo(214,178);c.lineTo(218,194);c.stroke();
  c.strokeStyle='#5c609e';c.lineWidth=6;c.beginPath();c.moveTo(218,312);c.lineTo(218,60);c.stroke();
  c.strokeStyle='rgba('+K.a+',.6)';c.lineWidth=2;c.beginPath();c.moveTo(216,312);c.lineTo(216,60);c.stroke();
  c.fillStyle='#343a80';c.beginPath();c.arc(218,194,10,0,6.283);c.fill();
  c.strokeStyle=K.c;c.lineWidth=4;
  c.beginPath();c.moveTo(218,64);c.lineTo(218,30);c.stroke();
  c.beginPath();c.moveTo(218,64);c.quadraticCurveTo(200,60,204,36);c.stroke();
  c.beginPath();c.moveTo(218,64);c.quadraticCurveTo(236,60,232,36);c.stroke();
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(218,70,1,218,70,30*fl);q.addColorStop(0,'#ffffff');q.addColorStop(.4,'rgba('+K.a+',.9)');q.addColorStop(1,'rgba('+K.a+',0)');
  c.fillStyle=q;c.beginPath();c.arc(218,70,(10+pu*3)*fl+14,0,6.283);c.fill();
  c.strokeStyle=K.w;c.lineWidth=2;
  for(i=0;i<3;i++){a=rnd(sd*3+i)*6.283;zig(c,218,70,218+Math.cos(a)*(26+rnd(sd+i)*14),70+Math.sin(a)*(26+rnd(sd+i)*14),4,10,sd*7+i*13)}
  c.restore();
  /* đầu: mũ giáp + mặt nạ xương + mắt sáng */
  q=c.createLinearGradient(0,56,0,118);q.addColorStop(0,'#2e3478');q.addColorStop(1,'#0f1130');
  c.fillStyle=q;c.beginPath();c.ellipse(128,86,28,32,0,0,6.283);c.fill();
  c.strokeStyle='rgba('+K.a+',.9)';c.lineWidth=2;c.stroke();
  q=c.createLinearGradient(0,82,0,122);q.addColorStop(0,'#cdd8f0');q.addColorStop(1,'#707ea8');
  poly(c,[[105,82],[151,82],[145,112],[128,122],[111,112]],q,'rgba(20,24,60,.8)',1.5);
  c.strokeStyle='rgba(30,34,80,.7)';c.lineWidth=1.5;
  for(i=0;i<4;i++){c.beginPath();c.moveTo(116+i*8,108);c.lineTo(116+i*8,118);c.stroke()}
  c.save();c.globalCompositeOperation='lighter';c.shadowColor=K.c;c.shadowBlur=14;c.fillStyle=K.w;
  poly(c,[[108,88],[124,92],[110,99]],K.w);poly(c,[[148,88],[132,92],[146,99]],K.w);c.restore();
  /* mão trán sét */
  c.save();c.globalCompositeOperation='lighter';c.shadowColor=K.c;c.shadowBlur=10;
  poly(c,[[128,8],[119,34],[128,31],[121,58],[137,28],[128,30]],K.w);
  poly(c,[[104,46],[93,18],[113,38]],K.c);poly(c,[[152,46],[163,18],[143,38]],K.c);
  poly(c,[[92,60],[78,36],[100,52]],K.c);poly(c,[[164,60],[178,36],[156,52]],K.c);c.restore();
  /* sương điện dưới chân */
  c.save();c.globalCompositeOperation='lighter';
  for(i=0;i<7;i++){var wx=40+i*29+Math.sin(t*.05+i*1.7)*10,wy=304-Math.abs(Math.sin(t*.04+i))*18;
    q=c.createRadialGradient(wx,wy,1,wx,wy,26);q.addColorStop(0,'rgba('+K.a+',.30)');q.addColorStop(1,'rgba('+K.a+',0)');c.fillStyle=q;c.beginPath();c.ellipse(wx,wy,30,12,0,0,6.283);c.fill()}
  c.restore();
}

var _foe=typeof foe==='function'?foe:null;
if(_foe){
  foe=function(e){
    if(!e||!active()||e.k==='pal'||typeof MS==='undefined'||!MS[e.k])return _foe.apply(this,arguments);
    var m=MS[e.k],old=m.n,nm=(e.b===3)?NAMES.golem:(e.b===1&&e.k==='ogre')?NAMES.ogre:NAMES[e.k],r,sw=0,oIm,oF;
    try{
      if(nm)m.n=nm;
      if(e.b===3&&typeof MI!=='undefined'){
        var key=(e.tlp|0)+':'+Math.floor(tick/5);
        if(key!==bcKey){bcKey=key;try{paintBoss(BC,e.tlp|0,tick)}catch(x){}}
        oIm=MI[e.k];oF=m.f;MI[e.k]=BC;m.f=1;sw=1;
      }
      r=_foe.apply(this,arguments);
    }finally{m.n=old;if(sw){MI[e.k]=oIm;m.f=oF}}
    try{arcs(e,m)}catch(x){}
    return r;
  };
}

/* ---------- vẽ ---------- */
function boltPath(x,gy,seed){
  var pts=[[x,-10]],n=9,i,y;
  for(i=1;i<n;i++){y=-10+(gy+10)*i/n;pts.push([x+(rnd(seed+i)-.5)*46*s,y])}
  pts.push([x,gy]);
  return pts;
}
function drawSky(gy){
  var i,t=tick;
  g.save();
  g.fillStyle='rgba(8,12,32,.40)';g.fillRect(0,0,W,gy);
  var cn=lite()?4:7;
  for(i=0;i<cn;i++){
    var cx=((i*W/cn*1.15+t*(.12+i*.03))%(W*1.3))-W*.15,cy=gy*(.12+(i%3)*.11),rw=W*(.16+(i%4)*.05);
    var q=g.createRadialGradient(cx,cy,2,cx,cy,rw);
    q.addColorStop(0,'rgba(40,46,78,.55)');q.addColorStop(1,'rgba(40,46,78,0)');
    g.fillStyle=q;g.beginPath();g.ellipse(cx,cy,rw,rw*.32,0,0,6.283);g.fill();
  }
  if(t>=farAt){farAt=t+200+Math.random()*260;farX=.1+Math.random()*.8;flash=Math.max(flash,5)}
  if(flash>0){
    var fa=Math.min(.34,flash*.034);
    g.globalCompositeOperation='lighter';
    g.fillStyle='rgba(170,200,255,'+fa+')';g.fillRect(0,0,W,gy);
  }
  g.restore();
}
function drawGround(gy){
  var i,t=tick;
  g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<bolts.length;i++){
    var b=bolts[i],age=t-b.t0,x=b.x*s,R=CFG.R*s;
    if(age<CFG.warn){
      var u=age/CFG.warn,pu=.5+.5*Math.sin(t*(.25+u*.5));
      var q=g.createRadialGradient(x,gy,R*.1,x,gy,R*1.1);
      q.addColorStop(0,'rgba(190,225,255,'+(.12+.28*u)+')');q.addColorStop(1,'rgba(120,170,255,0)');
      g.fillStyle=q;g.beginPath();g.ellipse(x,gy,R*1.1,R*.32,0,0,6.283);g.fill();
      g.strokeStyle='rgba(220,238,255,'+(.35+.5*pu)+')';g.lineWidth=2*s;
      g.beginPath();g.ellipse(x,gy,R,R*.28,0,0,6.283);g.stroke();
      g.beginPath();g.ellipse(x,gy,R*(1-u),R*.28*(1-u),0,0,6.283);g.stroke();
    }else{
      var k=(age-CFG.warn)/18,al=Math.max(0,1-k),p=boltPath(x,gy,b.seed);
      g.strokeStyle='rgba(150,190,255,'+(.5*al)+')';g.lineWidth=9*s;g.lineJoin='round';
      g.beginPath();p.forEach(function(a,j){j?g.lineTo(a[0],a[1]):g.moveTo(a[0],a[1])});g.stroke();
      g.strokeStyle='rgba(255,255,255,'+al+')';g.lineWidth=3*s;
      g.beginPath();p.forEach(function(a,j){j?g.lineTo(a[0],a[1]):g.moveTo(a[0],a[1])});g.stroke();
      var rr=R*(.6+k*.9);
      g.strokeStyle='rgba(200,225,255,'+(.8*al)+')';g.lineWidth=3*s*al;
      g.beginPath();g.ellipse(x,gy,rr,rr*.28,0,0,6.283);g.stroke();
    }
  }
  g.restore();
}
var _bgd=bgd;
bgd=function(gy){
  _bgd.apply(this,arguments);
  if(!active())return;
  try{drawSky(gy);drawGround(gy)}catch(e){}
};

/* ---------- hàng trong bảng Bản đồ ---------- */
function row(){
  var ok=eligible(),here=active();
  return '<div class="st" style="margin:4px 0"><button style="width:100%;text-align:left;'+(here?'background:#8a6420':ok?'':'opacity:.55')+'" onclick="TLC.enter()">⚡ Thiên Lôi Cổ Địa · quái Lv40-60 · sét đánh theo vòng cảnh báo'+(ok?'':' 🔒 Cần Lv'+CFG.req)+(here?' (đang ở đây)':'')+'</button></div>';
}
if(window.BDT&&typeof BDT.panel==='function'){
  var _p=BDT.panel;
  BDT.panel=function(mr,lu,ft){return _p.call(this,String(mr||'')+row(),lu,ft)};
}

window.TLC={paintBoss:function(cv,ph,t){paintBoss(cv,ph,t)},cfg:CFG,enter:enter,on:function(){return active()},eligible:eligible};
})();
