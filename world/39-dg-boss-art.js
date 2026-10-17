/* ===== 🎨 VẼ LẠI BOSS PHỤ BẢN (Hầm Ngục) THEO PHONG CÁCH BOSS MA THẦN v2 =====
 * Trước: boss là ảnh webp (DGI.boss, p001). Giờ: vẽ canvas 1 lần — giáp đen/tím chạm rune phát sáng, sừng, vai gai, rìu rune.
 * Thay thẳng DGI.boss bằng canvas (có naturalWidth/Height) nên mọi nơi dùng chung sprite này tự đổi theo, không sửa engine:
 *   Trùm Hầm Ngục, Boss Tháp (đổi tông bằng hue-rotate), Boss Bất Tử. Hoạt ảnh (chém/nhảy/rung) vẫn do dgFoe của engine lo.
 * Biến thể DGI.boss2 (Ngục Long Vương · Phụ Bản 2, giáp lục-ngọc, đầu rồng, đuôi, kích trăng khuyết; dùng ở world/40-phu-ban-2.js).
 * Biến thể DGI.bossKS (giáp bạc-xanh, rune xanh, trường kiếm) dành cho Kiếm Thánh (world/35-kiem-thanh.js).
 * Sprite quay mặt sang TRÁI, chân ở đáy, tỉ lệ 377×300 như ảnh cũ (vẽ ở độ phân giải ×2).
 * Chỉnh màu: khối TH. Lỗi vẽ → giữ ảnh cũ. Phụ thuộc: DGI (engine). */
(function(){
'use strict';
if(typeof DGI==='undefined')return;
var Q=2,TAU=Math.PI*2,SW=377,SH=300;
var TH={
 axe:{wp:'axe',horns:true,a1:'#40384c',a2:'#17121f',a3:'#2e2738',hi:'rgba(165,148,190,.6)',skin1:'#6a2c30',skin2:'#2a0e13',run:'#ff9a3a',glow:'#ff5a10',eye:'#ffd45a',core:'255,150,50',cloth1:'#33201a',cloth2:'#0e0709'},
 sword:{wp:'sword',horns:false,a1:'#56637d',a2:'#161d2c',a3:'#35435c',hi:'rgba(205,230,255,.7)',skin1:'#3b5878',skin2:'#101c2c',run:'#9fe8ff',glow:'#2a9cff',eye:'#e8ffff',core:'110,210,255',cloth1:'#1d2c44',cloth2:'#070b14'}
,dragon:{wp:'halberd',head:'dragon',horns:true,a1:'#34504c',a2:'#0d1a1a',a3:'#24403a',hi:'rgba(170,235,205,.65)',skin1:'#2f7a58',skin2:'#0a2a20',run:'#7dffc0',glow:'#10c870',eye:'#ffe27a',core:'90,255,170',cloth1:'#12302a',cloth2:'#04100e'}
};
function build(T){
 var cv=document.createElement('canvas');cv.width=SW*Q;cv.height=SH*Q;
 var c=cv.getContext('2d');if(!c)return null;
 c.scale(Q,Q);c.lineJoin='round';c.lineCap='round';
 function path(p,close){c.beginPath();p.forEach(function(v,i){i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1])});if(close)c.closePath()}
 function fp(p,c1,c2,y1,y2,ed,lw){var q=c.createLinearGradient(0,y1,0,y2);q.addColorStop(0,c1);q.addColorStop(1,c2);path(p,1);c.fillStyle=q;c.fill();c.lineWidth=lw||1.6;c.strokeStyle=ed||'#07040a';c.stroke()}
 function rl(p,lw,b){c.save();c.shadowColor=T.glow;c.shadowBlur=b==null?6:b;c.strokeStyle=T.run;c.lineWidth=lw||1.6;path(p,0);c.stroke();c.restore()}
 function hl(p,lw){c.save();c.strokeStyle=T.hi;c.lineWidth=lw||1;path(p,0);c.stroke();c.restore()}
 function limb(p,w,col){c.strokeStyle='#07040a';c.lineWidth=w+4;path(p,0);c.stroke();c.strokeStyle=col;c.lineWidth=w;path(p,0);c.stroke()}
 function glowDot(x,y,r,rgb,a){var q=c.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');c.save();c.globalCompositeOperation='lighter';c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
 function horn(p0,p1,p2,r0,r1,c1,c2){var pts=[];for(var i=0;i<=26;i++){var t=i/26,u=1-t;pts.push([u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1],r0+(r1-r0)*t])}
  c.fillStyle='#07040a';pts.forEach(function(v){c.beginPath();c.arc(v[0],v[1],v[2]+1.7,0,TAU);c.fill()});
  pts.forEach(function(v,i){var k=i/26;c.fillStyle=k<.5?c1:c2;c.beginPath();c.arc(v[0],v[1],v[2],0,TAU);c.fill()});
  c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1;c.beginPath();pts.forEach(function(v,i){var x=v[0]-v[2]*.35,y=v[1]-v[2]*.35;i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()}
 function spike(x,y,w,h,ang,c1,c2){c.save();c.translate(x,y);c.rotate(ang);fp([[-w/2,0],[0,-h],[w/2,0]],c1||T.a1,c2||T.a2,-h,0);c.restore()}
 function ik(S,Hd,L,sx){var dx=Hd[0]-S[0],dy=Hd[1]-S[1],d=Math.hypot(dx,dy)||1;if(d>2*L-1){var k=(2*L-1)/d;Hd=[S[0]+dx*k,S[1]+dy*k];dx=Hd[0]-S[0];dy=Hd[1]-S[1];d=2*L-1}
  var a=d/2,h=Math.sqrt(Math.max(0,L*L-a*a)),px=-dy/d,py=dx/d;if(px*sx<0){px=-px;py=-py}return{e:[S[0]+dx/2+px*h,S[1]+dy/2+py*h],h:Hd}}

 // vị trí vũ khí: đường cán từ O theo hướng u
 var O=[52,258],ang=Math.atan2(-166,250),ux=Math.cos(ang),uy=Math.sin(ang);
 function onW(x){return[O[0]+ux*x,O[1]+uy*x]}
 var HN=T.wp=='sword'?onW(40):onW(72),HF=T.wp=='sword'?onW(96):onW(220);

 // ---- đuôi rồng ----
 if(T.head=='dragon'){horn([214,200],[292,246],[352,208],15,3.2,'#1d4638','#2f7a58');for(var tk=0;tk<5;tk++){var tt=.18+tk*.17,tu=1-tt,tx=tu*tu*214+2*tu*tt*292+tt*tt*352,ty=tu*tu*200+2*tu*tt*246+tt*tt*208;spike(tx,ty-9+tk,9-tk,16-tk*2,-.5-tk*.08,T.a3,T.a2)}rl([[226,206],[290,238],[340,214]],1.2,5)}
 // ---- chân sau ----
 limb([[208,198],[234,244],[252,288]],24,'#2c2434');
 fp([[238,282],[276,282],[290,296],[240,296]],T.a3,T.a2,282,296);
 fp([[224,226],[248,224],[254,262],[234,266]],T.a1,T.a2,224,266);rl([[240,230],[243,258]],1.3,4);
 // ---- áo choàng rách ----
 {var q=c.createLinearGradient(0,196,0,262);q.addColorStop(0,T.cloth1);q.addColorStop(1,T.cloth2);c.fillStyle=q;c.beginPath();c.moveTo(146,196);
  [[236,192],[246,236],[232,226],[218,258],[204,228],[190,262],[176,230],[162,254],[152,226],[140,236]].forEach(function(v){c.lineTo(v[0],v[1])});c.closePath();c.fill();c.strokeStyle='#070307';c.lineWidth=1.5;c.stroke();
  c.fillStyle=T.run;for(var i=0;i<12;i++){c.globalAlpha=.35+((i*37)%10)/16;c.beginPath();c.arc(150+((i*53)%90),208+((i*29)%40),.8+((i*7)%3)*.4,0,TAU);c.fill()}c.globalAlpha=1}
 // ---- gai lưng ----
 spike(236,128,22,46,.9,T.a3,T.a2);spike(246,150,20,40,1.15,T.a3,T.a2);spike(226,108,22,50,.55,T.a3,T.a2);
 // ---- thân giáp ----
 fp([[132,104],[214,98],[240,134],[226,196],[160,214],[138,170]],T.a1,T.a2,98,214);
 fp([[150,196],[230,190],[232,212],[152,222]],T.a3,T.a2,190,222);
 hl([[136,168],[160,132]]);hl([[238,134],[216,114]]);
 c.fillStyle='#0b070f';path([[165,104],[200,100],[184,142]],1);c.fill();
 c.strokeStyle='#07040a';c.lineWidth=2;path([[184,142],[184,196]],0);c.stroke();
 [[150,158,176,168],[150,176,178,186],[196,166,226,158],[196,184,224,176]].forEach(function(l){c.strokeStyle='rgba(7,4,10,.85)';c.lineWidth=2.2;path([[l[0],l[1]],[l[2],l[3]]],0);c.stroke()});
 glowDot(186,150,34,T.core,.7);
 c.save();c.shadowColor=T.glow;c.shadowBlur=9;c.strokeStyle=T.run;c.lineWidth=1.9;c.beginPath();c.arc(186,150,10,0,TAU);c.stroke();c.beginPath();c.moveTo(186,141);c.lineTo(186,159);c.moveTo(186,146);c.lineTo(181,151);c.moveTo(186,151);c.lineTo(192,146);c.stroke();c.restore();
 rl([[146,114],[142,154]],1.5,5);rl([[226,110],[228,150]],1.5,5);rl([[158,196],[156,176]],1.3,4);rl([[214,194],[216,174]],1.3,4);
 // đầu sọ ở khoá thắt lưng
 c.fillStyle=T.a1;c.strokeStyle='#07040a';c.lineWidth=1.4;c.beginPath();c.ellipse(190,206,10,9,0,0,TAU);c.fill();c.stroke();c.fillStyle='#07040a';c.beginPath();c.arc(186,205,2.2,0,TAU);c.arc(194,205,2.2,0,TAU);c.fill();

 // vai xa
 fp([[212,96],[246,100],[254,124],[226,128]],T.a1,T.a2,96,128);spike(222,98,16,34,.15,T.a1,T.a2);spike(238,102,15,30,.55,T.a1,T.a2);rl([[218,108],[244,114]],1.3,4);
 // ---- cán + vũ khí ----
 c.save();c.translate(O[0],O[1]);c.rotate(ang);
 if(T.wp=='axe'){
  c.strokeStyle='#07040a';c.lineWidth=13;path([[-6,0],[262,0]],0);c.stroke();c.strokeStyle='#3a2c32';c.lineWidth=9;path([[-6,0],[262,0]],0);c.stroke();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.2;path([[0,-2.5],[258,-2.5]],0);c.stroke();
  for(var k=28;k<250;k+=26){rl([[k,-4.5],[k,4.5]],1.6,4)}
  fp([[-6,-6],[-26,0],[-6,6]],T.a1,T.a2,-6,6);
  // đầu rìu hai lưỡi (gốc tại x=252)
  c.translate(256,0);c.scale(1.12,1.12);
  for(var sd=-1;sd<=1;sd+=2){c.save();c.scale(1,sd);
   var q2=c.createLinearGradient(0,0,0,-78);q2.addColorStop(0,'#3d3040');q2.addColorStop(1,'#120b17');
   c.fillStyle=q2;c.beginPath();c.moveTo(-8,-6);c.quadraticCurveTo(-4,-34,-26,-62);c.quadraticCurveTo(0,-84,32,-60);c.quadraticCurveTo(26,-34,16,-8);c.closePath();c.fill();c.strokeStyle='#07040a';c.lineWidth=2;c.stroke();
   c.save();c.shadowColor=T.glow;c.shadowBlur=12;c.strokeStyle=T.run;c.lineWidth=2.2;c.beginPath();c.moveTo(-26,-62);c.quadraticCurveTo(0,-84,32,-60);c.stroke();c.restore();
   c.strokeStyle='rgba(255,230,190,.9)';c.lineWidth=.9;c.beginPath();c.moveTo(-22,-62);c.quadraticCurveTo(0,-80,28,-60);c.stroke();
   rl([[0,-12],[-6,-34],[6,-52]],1.4,5);rl([[10,-14],[14,-34]],1.2,4);
   c.restore()}
  fp([[-10,-8],[18,-8],[24,0],[18,8],[-10,8]],'#4a3c52','#1b1522',-8,8);
  fp([[20,-5],[56,0],[20,5]],'#5a4a60','#1b1522',-5,5);rl([[22,0],[50,0]],1.4,6);
  glowDot(6,0,16,T.core,.7);c.save();c.shadowColor=T.glow;c.shadowBlur=10;c.fillStyle='#ffb050';c.beginPath();c.arc(6,0,4.4,0,TAU);c.fill();c.restore();
 }else if(T.wp=='halberd'){
  c.strokeStyle='#07040a';c.lineWidth=13;path([[-6,0],[268,0]],0);c.stroke();c.strokeStyle='#2c4a40';c.lineWidth=9;path([[-6,0],[268,0]],0);c.stroke();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.2;path([[0,-2.5],[262,-2.5]],0);c.stroke();
  for(var kh=26;kh<250;kh+=26){rl([[kh,-4.5],[kh,4.5]],1.6,4)}
  fp([[-6,-6],[-30,0],[-6,6]],T.a1,T.a2,-6,6);
  c.translate(258,0);c.scale(1.1,1.1);
  // lưỡi trăng khuyết (một bên) + mũi thương
  var hq=c.createLinearGradient(0,0,0,-80);hq.addColorStop(0,'#2e4a42');hq.addColorStop(1,'#0c1614');c.fillStyle=hq;c.beginPath();c.moveTo(-10,-6);c.quadraticCurveTo(-6,-30,-34,-58);c.quadraticCurveTo(10,-84,44,-52);c.quadraticCurveTo(22,-36,18,-8);c.closePath();c.fill();c.strokeStyle='#07040a';c.lineWidth=2;c.stroke();
  c.save();c.shadowColor=T.glow;c.shadowBlur=12;c.strokeStyle=T.run;c.lineWidth=2.2;c.beginPath();c.moveTo(-34,-58);c.quadraticCurveTo(10,-84,44,-52);c.stroke();c.restore();c.strokeStyle='rgba(225,255,240,.9)';c.lineWidth=.9;c.beginPath();c.moveTo(-30,-58);c.quadraticCurveTo(10,-79,40,-52);c.stroke();
  rl([[2,-12],[-4,-34],[10,-50]],1.4,5);
  fp([[-10,-8],[20,-8],[26,0],[20,8],[-10,8]],'#3a5a50','#12201c',-8,8);
  fp([[22,-7],[84,0],[22,7]],'#f0f4e0','#506a5c',-7,7);rl([[26,0],[74,0]],1.4,6);c.save();c.strokeStyle='#ffd070';c.lineWidth=2;path([[-6,-8],[-6,8]],0);c.stroke();c.restore();
  glowDot(4,0,18,T.core,.7);c.save();c.shadowColor=T.glow;c.shadowBlur=10;c.fillStyle='#ffe27a';c.beginPath();c.arc(4,0,4.2,0,TAU);c.fill();c.restore();
 }else{
  // cán kiếm + chắn kiếm + lưỡi trường kiếm
  c.strokeStyle='#07040a';c.lineWidth=12;path([[-8,0],[110,0]],0);c.stroke();c.strokeStyle='#2b3550';c.lineWidth=8;path([[-8,0],[110,0]],0);c.stroke();
  for(var k2=10;k2<100;k2+=18){rl([[k2,-3.6],[k2,3.6]],1.4,4)}
  fp([[-16,-5],[-6,-9],[2,0],[-6,9],[-16,5]],T.a1,T.a2,-9,9);
  fp([[104,-24],[116,-10],[116,10],[104,24],[98,10],[98,-10]],'#7b8aa8','#1f2a40',-24,24);rl([[107,-16],[107,16]],1.6,6);
  var bq=c.createLinearGradient(0,-12,0,12);bq.addColorStop(0,'#f2fbff');bq.addColorStop(.5,'#9cc0e6');bq.addColorStop(1,'#33507a');
  c.fillStyle=bq;path([[116,-9],[290,-12],[338,0],[290,12],[116,9]],1);c.fill();c.strokeStyle='#07040a';c.lineWidth=1.8;c.stroke();
  c.save();c.shadowColor=T.glow;c.shadowBlur=12;c.strokeStyle=T.run;c.lineWidth=1.6;path([[120,-8],[286,-11],[332,0]],0);c.stroke();path([[120,8],[286,11],[332,0]],0);c.stroke();c.restore();
  c.strokeStyle='rgba(20,40,80,.7)';c.lineWidth=2;path([[124,0],[300,0]],0);c.stroke();
  for(var k3=150;k3<290;k3+=28){rl([[k3,-3],[k3+7,0],[k3,3]],1.1,3)}
  glowDot(210,0,70,T.core,.28);
 }
 c.restore();

 // ---- chân trước ----
 limb([[160,208],[130,250],[106,288]],30,'#3a3344');
 fp([[88,282],[124,282],[132,296],[78,296]],T.a1,T.a2,282,296);
 [[84,296,72,300],[96,296,88,300],[108,296,104,300]].forEach(function(t){c.strokeStyle='#14101a';c.lineWidth=4;path([[t[0],t[1]-2],[t[2],t[3]]],0);c.stroke()});
 fp([[108,232],[142,230],[136,266],[104,268]],T.a1,T.a2,230,268);rl([[124,236],[120,262]],1.4,4);
 spike(118,244,16,22,-.5,T.a3,T.a2);
 fp([[122,196],[170,194],[176,224],[134,232]],T.a1,T.a2,194,232);hl([[126,200],[168,198]]);

 // ---- tay xa ----
 {var S=[228,112],r=ik(S,HF,T.wp=='sword'?68:52,1),Ee=r.e,Hh=r.h;
  limb([S,Ee,Hh],18,'#2e2838');rl([[S[0]+2,S[1]+4],Ee,[Hh[0],Hh[1]-6]],1.3,4);
  fp([[Ee[0]-9,Ee[1]-9],[Ee[0]+9,Ee[1]-9],[Ee[0]+8,Ee[1]+9],[Ee[0]-9,Ee[1]+9]],T.a1,T.a2,Ee[1]-9,Ee[1]+9);
  c.fillStyle='#3d3547';c.strokeStyle='#07040a';c.lineWidth=2;c.beginPath();c.arc(Hh[0],Hh[1],10,0,TAU);c.fill();c.stroke();c.fillStyle=T.run;c.beginPath();c.arc(Hh[0],Hh[1],2.2,0,TAU);c.fill()}

 // ---- đầu ----
 c.save();c.translate(112,100);c.scale(1.16,1.16);c.translate(-112,-100);
 limb([[142,112],[122,100]],28,T.skin2);
 if(T.head=='dragon'){
  // gạc rồng + vảy lưng cổ
  horn([132,70],[176,32],[226,54],8.5,2,'#3a5a46','#f0d890');horn([118,66],[150,22],[200,28],7.5,1.8,'#3a5a46','#f0d890');
  horn([160,50],[184,40],[196,62],4,1.2,'#3a5a46','#f0d890');
  [[150,86,1.15],[160,98,1.3],[152,110,1.5]].forEach(function(b){spike(b[0],b[1],13,28,b[2],T.a3,T.a2)});
  fp([[72,90],[98,68],[130,64],[148,82],[144,110],[120,124],[92,122],[72,108]],T.skin1,T.skin2,64,124);
  fp([[36,94],[74,80],[92,100],[84,116],[40,110]],T.skin1,T.skin2,80,116);
  fp([[44,110],[90,114],[112,126],[84,138],[50,126]],'#0c1a16','#040a08',110,138,'#07040a',1.4);
  c.fillStyle='#f4eed6';c.strokeStyle='#1a1a12';c.lineWidth=.8;[[44,104,6],[54,104,7],[66,106,6],[78,108,5],[90,110,5]].forEach(function(q){c.beginPath();c.moveTo(q[0]-3,q[1]);c.lineTo(q[0],q[1]+q[2]+3);c.lineTo(q[0]+3,q[1]+1);c.closePath();c.fill();c.stroke()});
  [[52,124],[64,126],[76,128]].forEach(function(q){c.beginPath();c.moveTo(q[0]-3,q[1]);c.lineTo(q[0],q[1]-8);c.lineTo(q[0]+3,q[1]);c.closePath();c.fill()});
  c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.ellipse(46,96,2.4,1.6,.2,0,TAU);c.fill();
  glowDot(66,118,16,T.core,.4);
  fp([[74,84],[108,72],[112,86],[82,92]],'#0c1e18','#040a08',72,92,'#07040a',1.2);
  c.save();c.shadowColor=T.eye;c.shadowBlur=12;c.fillStyle=T.eye;c.beginPath();c.moveTo(86,90);c.lineTo(104,85);c.lineTo(98,95);c.closePath();c.fill();c.beginPath();c.moveTo(120,84);c.lineTo(133,86);c.lineTo(127,92);c.closePath();c.fill();c.restore();
  c.save();c.shadowColor=T.glow;c.shadowBlur=8;c.strokeStyle=T.run;c.lineWidth=1.6;[[[46,100],[24,118],[34,146]],[[52,106],[30,134],[44,160]]].forEach(function(w){c.beginPath();c.moveTo(w[0][0],w[0][1]);c.quadraticCurveTo(w[1][0],w[1][1],w[2][0],w[2][1]);c.stroke()});c.restore();
  rl([[96,70],[92,62]],1.2,4);rl([[112,74],[128,70]],1.2,4);
 }else{
 if(T.horns){
  horn([128,70],[160,18],[122,24],8.5,2,'#46303a','#c8b090');
  horn([112,70],[66,14],[40,52],10,2.2,'#46303a','#d6c4a2');
 }else{
  [[-.5,36],[-.9,30],[-1.3,24]].forEach(function(b){spike(130,72,12,b[1],-b[0]*.5+1.1,T.a1,T.a2)});
 }
 fp([[80,84],[96,66],[128,64],[146,82],[142,110],[120,124],[96,122],[84,106]],T.skin1,T.skin2,64,124);
 fp([[84,98],[118,108],[124,124],[92,136],[78,120]],'#2a0c10','#120408',98,136,'#07040a',1.4);
 if(!T.horns){c.fillStyle='rgba(0,0,0,.35)';path([[82,84],[110,74],[112,88],[90,94]],1);c.fill()}
 // răng nanh
 c.fillStyle='#efe6d0';c.strokeStyle='#2a1a14';c.lineWidth=.8;[[88,104,5],[97,107,6],[106,108,5],[114,109,4]].forEach(function(t){c.beginPath();c.moveTo(t[0]-3,t[1]);c.lineTo(t[0],t[1]+t[2]+3);c.lineTo(t[0]+3,t[1]+1);c.closePath();c.fill();c.stroke()});
 [[94,128,-4],[104,128,-4]].forEach(function(t){c.beginPath();c.moveTo(t[0]-3,t[1]);c.lineTo(t[0]-1,t[1]+t[2]);c.lineTo(t[0]+3,t[1]);c.closePath();c.fill()});
 horn([86,118],[70,126],[72,96],4.2,1.4,'#c9b894','#efe6d0');
 glowDot(100,118,16,T.core,.4);
 // mày + mắt
 fp([[80,82],[112,72],[114,86],[88,92]],'#241014','#0e0507',72,92,'#07040a',1.2);
 c.save();c.shadowColor=T.eye;c.shadowBlur=11;c.fillStyle=T.eye;c.beginPath();c.moveTo(88,90);c.lineTo(104,86);c.lineTo(100,94);c.closePath();c.fill();c.beginPath();c.moveTo(120,84);c.lineTo(132,86);c.lineTo(126,92);c.closePath();c.fill();c.restore();
 rl([[118,68],[112,62]],1.2,4);rl([[134,76],[142,84]],1.2,4);
 c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.arc(82,100,1.6,0,TAU);c.arc(88,100,1.6,0,TAU);c.fill();
 }
 c.restore();
 // vai gần
 fp([[100,112],[116,94],[160,92],[172,120],[150,138],[112,136]],T.a1,T.a2,92,138);
 spike(112,98,18,36,-.35,T.a1,T.a2);spike(132,94,18,40,.05,T.a1,T.a2);spike(154,96,17,34,.5,T.a1,T.a2);
 hl([[106,112],[120,98],[158,96]]);rl([[116,112],[148,112],[160,122]],1.4,5);rl([[120,124],[146,128]],1.2,4);
 // tay gần (ở trên cùng)
 {var S2=[140,122],r2=ik(S2,HN,62,-1),E2=r2.e,H2=r2.h;
  limb([S2,E2,H2],22,'#32293a');rl([[S2[0]-2,S2[1]+4],E2,[H2[0],H2[1]-8]],1.5,5);
  fp([[E2[0]-12,E2[1]-11],[E2[0]+12,E2[1]-11],[E2[0]+10,E2[1]+11],[E2[0]-10,E2[1]+11]],T.a1,T.a2,E2[1]-11,E2[1]+11);spike(E2[0]-8,E2[1]-6,12,22,-1.2,T.a3,T.a2);
  fp([[H2[0]-13,H2[1]-18],[H2[0]+13,H2[1]-18],[H2[0]+11,H2[1]-5],[H2[0]-11,H2[1]-5]],T.a3,T.a2,H2[1]-18,H2[1]-5);
  c.fillStyle='#3d3547';c.strokeStyle='#07040a';c.lineWidth=2;c.beginPath();c.arc(H2[0],H2[1],12,0,TAU);c.fill();c.stroke();
  c.strokeStyle='#14101a';c.lineWidth=3.4;[[-8,6,-12,14],[-1,9,-3,18],[7,6,9,15]].forEach(function(t){c.beginPath();c.moveTo(H2[0]+t[0],H2[1]+t[1]);c.lineTo(H2[0]+t[2],H2[1]+t[3]);c.stroke()});
  c.fillStyle=T.run;c.beginPath();c.arc(H2[0],H2[1],2.4,0,TAU);c.fill()}
 cv.naturalWidth=SW;cv.naturalHeight=SH;
 return cv}

function init(){
 try{var a=build(TH.axe);if(a){DGI.boss=a}}catch(e){}
 try{var b=build(TH.sword);if(b){DGI.bossKS=b}}catch(e){}
 try{var d=build(TH.dragon);if(d){DGI.boss2=d}}catch(e){}
}
init();
window.DGART={build:build,themes:TH,init:init};
})();
