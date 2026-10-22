/* ===== 🏮 THÔN TÂN THỦ — CHI TIẾT 5 TOÀ NHÀ (world/135-thon-tan-thu-nha-chi-tiet.js · Fix419) =====
 * Vẽ THÊM lên 5 toà nhà của world/56 (không đổi vị trí, kích thước, chạm-để-vào, nhãn tên, lửa lò/khói/cờ/cổng truyền tống).
 * Chung: ngói loang (ngói thay mới, rêu, vệt mưa, mép sáng), nóc có búp bê đồng + chim sẻ, đèn lồng/chuông gió dưới mái, dây leo + hoa ở cột, chậu cảnh hai bên bậc.
 * Riêng: Thợ Rèn = đá mài + máng nước + đống than + giá búa kìm · Tạp Hóa = thùng rau củ + bao gạo + chuỗi ớt tỏi + cờ hiệu 茶 ·
 *        Hồi Phục = giàn phơi thuốc + nong tre + cối chày + vại thuốc · Nhiệm Vụ = đôi sư tử đá + trống lệnh + bức hoành đỏ ·
 *        Bản Đồ = 8 quẻ quanh vòng cổng (nhấp nháy nhẹ) + trụ đá có cầu + cây cảnh + đèn lồng xanh.
 * Hiệu năng: mỗi nhà vẽ sẵn 1 sprite (cache theo s,k,DPR,font); mỗi khung chỉ drawImage + vài nét động (chuông gió, quẻ, đèn) — tắt khi window.QL>=2 hoặc TTN.fx=false.
 * Tắt/bật: window.TTN.on=false (về hình world/56). Lỗi vẽ 3 lần → tự tắt. TTN.rebuild() dựng lại.
 * Phụ thuộc: world/56 (TTT), world/134 (TTD.h), bld, bxx, bww, s, DPR, g, fr. Nạp SAU world/134. */
(function(){
'use strict';
if(typeof bld!=='function'||typeof bxx!=='function'||typeof g==='undefined'||!window.TTT||!window.TTD||!window.TTD.h)return;
var H=window.TTD.h,rng=H.rng,lg=H.lg,mk=H.mk,mix=H.mix,ell=H.ell,poly=H.poly,line=H.line,shadow=H.shadow,GR=H.GR,lite=H.lite,TAU=Math.PI*2;
var N={on:true,fx:true},_bld=bld,fails=0,SC={};window.TTN=N;
var FONT='Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';
function fontOK(){try{return document.fonts&&document.fonts.check('20px "Ma Shan Zheng"')?1:0}catch(e){return 0}}

/* ---------- mái: ngói loang, rêu, vệt mưa, nóc ---------- */
function roofPath(q,cx,yE,hw,rise,over,rl,tip){var xL=cx-hw-over,xR=cx+hw+over,yT=yE-rise,ax=xL+over*.8,bx=xR-over*.8;
  q.beginPath();q.moveTo(xL,yE-tip);q.quadraticCurveTo(xL+over*.35,yE+3,ax,yE+4);q.lineTo(bx,yE+4);q.quadraticCurveTo(xR-over*.35,yE+3,xR,yE-tip);q.quadraticCurveTo(cx+hw*.98,yE-rise*.4,cx+rl,yT);q.lineTo(cx-rl,yT);q.quadraticCurveTo(cx-hw*.98,yE-rise*.4,xL,yE-tip);q.closePath()}
function roofDetail(q,cx,yE,hw,rise,over,rl,tip,seed,moss,noOrn){var R=rng(seed),xL=cx-hw-over,xR=cx+hw+over,yT=yE-rise,rows=Math.max(4,Math.round(rise/5)),j,i,n=Math.round((xR-xL)/5.2);
  q.save();roofPath(q,cx,yE,hw,rise,over,rl,tip);q.clip();
  for(j=0;j<rows;j++){var y0=yT+(yE+4-yT)*(j/rows),y1=yT+(yE+4-yT)*((j+1)/rows);
    for(i=0;i<n;i++){var r=R();if(r<.1){q.fillStyle='rgba(255,236,200,'+(.07+R()*.07).toFixed(3)+')';q.fillRect(xL+i*5.2+(j%2)*2.6,y0+1,4.4,y1-y0-.6)}else if(r<.2){q.fillStyle='rgba(8,12,16,'+(.07+R()*.08).toFixed(3)+')';q.fillRect(xL+i*5.2+(j%2)*2.6,y0+1,4.4,y1-y0-.6)}}}
  for(i=0;i<9;i++){var sx=xL+10+R()*(xR-xL-20),sy=yT+(yE-yT)*(.2+R()*.25),sl=(yE-sy)*(.35+R()*.5);q.strokeStyle='rgba(10,14,18,.11)';q.lineWidth=.8+R()*1.4;q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+(R()-.5)*2,sy+sl);q.stroke()}
  for(i=0;i<moss;i++){var mx=xL+8+R()*(xR-xL-16)*(R()<.6?.5:1),my=yE-R()*rise*.5,mr=(2+R()*4);ell(q,mx,my,mr*1.5,mr*.6,'rgba(88,128,62,.34)');ell(q,mx+.5,my-.4,mr*.8,mr*.3,'rgba(150,186,96,.3)')}
  q.fillStyle=lg(q,cx,0,xR,0,[0,'rgba(255,236,200,0)',1,'rgba(255,236,200,.13)']);q.fillRect(cx,yT-4,xR-cx,rise+14);
  q.fillStyle=lg(q,0,yE-9,0,yE+4,[0,'rgba(10,14,18,0)',1,'rgba(10,14,18,.22)']);q.fillRect(xL,yE-9,xR-xL,14);
  q.restore();
  /* nóc: búp bê đồng + mép sáng */
  q.fillStyle='rgba(255,244,214,.38)';q.fillRect(cx-rl-3,yT-3.6,rl*2+6,1);
  if(noOrn)return;
  var ox=cx+(R()-.5)*rl*.6;q.fillStyle=lg(q,ox-3,0,ox+3,0,[0,'#6a4a22',.5,'#c9a24a',1,'#8a6a2c']);q.fillRect(ox-2.4,yT-6,4.8,3);
  ell(q,ox,yT-9.2,2.9,3.4,lg(q,ox-3,0,ox+3,0,[0,'#7a5a26',.45,'#e2c064',1,'#8a6a2c']));ell(q,ox-.8,yT-10.2,.9,1.2,'rgba(255,248,214,.7)');poly(q,[ox-.8,yT-12.4,ox,yT-15.6,ox+.8,yT-12.4],'#c9a24a')}
function sparrow(q,x,y,dir){q.save();q.translate(x,y);q.scale(dir,1);ell(q,0,-2.2,3.2,2.2,'#8a6a46',-.15);ell(q,-1,-2.6,2,1.2,'#6a4e30',-.4);ell(q,2.4,-4.2,1.7,1.6,'#7a5a3a');poly(q,[3.8,-4.2,5.6,-3.8,3.8,-3.2],'#d9a23a');ell(q,3,-4.4,.35,.35,'#1a1208');ell(q,2.6,-3.2,1.1,.8,'#d8c8a8');poly(q,[-3,-2.6,-6.4,-1.4,-3,-1.6],'#5a4228');line(q,-.4,-.4,-.4,1,'#b8894a',.5);line(q,.8,-.4,.8,1,'#b8894a',.5);q.restore()}

/* ---------- đèn, chuông, dây leo, chậu ---------- */
function lantern(q,x,y,sc,col){col=col||'#c2402c';q.save();q.translate(x,y);q.scale(sc,sc);line(q,0,-10,0,-5,'#2a1c12',.7);
  q.fillStyle='#2a1c12';q.fillRect(-3.4,-5.2,6.8,1.8);var gr=lg(q,-5,0,5,0,[0,mix(col,'#000000',.3),.45,mix(col,'#ffb070',.35),1,mix(col,'#000000',.2)]);q.fillStyle=gr;q.beginPath();q.moveTo(-3.6,-3.4);q.quadraticCurveTo(-7.4,2.4,-3.6,8.2);q.lineTo(3.6,8.2);q.quadraticCurveTo(7.4,2.4,3.6,-3.4);q.closePath();q.fill();
  q.strokeStyle='rgba(60,16,8,.45)';q.lineWidth=.5;[-2,0,2].forEach(function(k){q.beginPath();q.moveTo(k*.9,-3.4);q.quadraticCurveTo(k*3.2,2.4,k*.9,8.2);q.stroke()});
  q.fillStyle='#2a1c12';q.fillRect(-3.8,8.2,7.6,1.4);line(q,0,9.6,0,13.4,'#d9a23a',.7);ell(q,0,13.6,.9,1.2,'#d9a23a');ell(q,-1.6,1,1,2.6,'rgba(255,220,170,.35)');q.restore()}
function chime(q,x,y,sw,sc){q.save();q.translate(x,y);q.scale(sc,sc);line(q,0,0,0,3,'#3a2a1a',.7);q.rotate(sw);ell(q,0,4,3.2,.9,'#6a4a2c');
  [[-2.2,6.6],[0,7.6],[2.2,6.6]].forEach(function(p,k){line(q,p[0],4.4,p[0],p[1],'#7a6a50',.4);q.fillStyle=lg(q,p[0]-1.6,0,p[0]+1.6,0,[0,'#8a6a26',.5,'#e2c064',1,'#8a6a26']);q.beginPath();q.moveTo(p[0]-1,p[1]);q.lineTo(p[0]-1.7,p[1]+3.2);q.lineTo(p[0]+1.7,p[1]+3.2);q.lineTo(p[0]+1,p[1]);q.closePath();q.fill()});
  line(q,0,4.4,0,11.8,'#7a6a50',.4);poly(q,[-1.4,11.8,1.4,11.8,1,15,-1,15],'#d8c4a0');q.restore()}
function vine(q,x0,y0,len,dir,seed,flo){var R=rng(seed),n=Math.round(len/2.6),i,x=x0,y=y0,pts=[];q.strokeStyle='#3d5a2a';q.lineWidth=.9;q.lineCap='round';q.beginPath();q.moveTo(x,y);
  for(i=1;i<=n;i++){x=x0+Math.sin(i*.55+seed)*3.4*dir+i*.14*dir;y=y0-i*2.6;q.lineTo(x,y);pts.push([x,y,i/n])}q.stroke();
  pts.forEach(function(p,k){var th=1-p[2]*.5,c=GR[(R()*GR.length)|0],a=(R()-.5)*3;ell(q,p[0]+(k%2?3:-3)*th,p[1]+R()*2,(2.8+R()*1.6)*th,(1.5+R()*.8)*th,c,a);if(R()<.55)ell(q,p[0]+(k%2?-2:2),p[1]-1,(2+R())*th,(1.1+R()*.5)*th,GR[(R()*GR.length)|0],-a);
    if(flo&&R()<.2){var fc=['#fbf7ea','#f4a7bd','#d9c3f0'][(R()*3)|0];ell(q,p[0]+3,p[1]+1,1.5,1.5,fc);ell(q,p[0]+3,p[1]+1,.6,.6,'#f2c231')}})}
function pot(q,x,y,sc,kind,seed){var R=rng(seed);q.save();q.translate(x,y);q.scale(sc,sc);shadow(q,-2,0,10,2,.3);
  q.fillStyle=lg(q,-6,0,6,0,[0,'#6a4a3a',.5,'#a8705a',1,'#c89478']);q.beginPath();q.moveTo(-5,0);q.lineTo(-6.2,-8);q.lineTo(6.2,-8);q.lineTo(5,0);q.closePath();q.fill();ell(q,0,-8,6.4,1.5,'#4a3224');line(q,-6,-6.2,6,-6.2,'rgba(255,230,190,.3)',.6);
  if(kind==0){line(q,0,-8,1,-15,'#4a3a2a',1.8);line(q,1,-13,-5,-17,'#4a3a2a',1);line(q,1,-12,7,-16,'#4a3a2a',1);[[ -5,-18,5,2.6],[7,-17,5,2.4],[1,-20,6,3]].forEach(function(f){ell(q,f[0],f[1],f[2],f[3],'#2f5230');ell(q,f[0]+.8,f[1]-.8,f[2]*.7,f[3]*.6,'#42713a')})}
  else if(kind==1){for(var i=0;i<9;i++){var a=-Math.PI/2+(R()-.5)*2.2,l=6+R()*6;line(q,0,-8,Math.cos(a)*l,-8+Math.sin(a)*l,GR[(R()*4)|0],1)}for(i=0;i<6;i++){var fx=(R()-.5)*10,fy=-12-R()*7;ell(q,fx,fy,1.8,1.8,['#f4a7bd','#fbf7ea','#f09a42','#a98fe0'][i%4]);ell(q,fx,fy,.6,.6,'#f2c231')}}
  else if(kind==2){for(var i2=0;i2<5;i2++){var a2=-Math.PI/2+(i2-2)*.38;line(q,0,-8,Math.cos(a2)*13,-8+Math.sin(a2)*15,'#4e8a3a',1.6)}q.strokeStyle='#5a7a3a';q.lineWidth=.6;q.beginPath();q.moveTo(2,-8);q.quadraticCurveTo(9,-16,12,-13);q.stroke();[[9,-15.4],[11,-13.6],[6.4,-15.4]].forEach(function(p){ell(q,p[0],p[1],1.5,1.1,'#e9a8d2');ell(q,p[0],p[1],.5,.5,'#f2e072')})}
  else{for(var i3=0;i3<4;i3++){var bx=-3+i3*2,bh=15+R()*5;line(q,bx,-8,bx+(R()-.5)*3,-8-bh,'#6a9a4a',1.1);for(var k=0;k<3;k++)ell(q,bx+(R()-.5)*3+2,-12-k*4.4,2.4,.8,'#5a9040',-.5)}}
  q.restore()}
function lion(q,x,y,sc,dir){q.save();q.translate(x,y);q.scale(dir*sc,sc);shadow(q,-3,0,15,2.6,.3);var st=lg(q,-9,0,9,0,[0,'#7e7a70',.5,'#b8b3a4',1,'#d2ccba']);
  q.fillStyle=st;q.fillRect(-9,-4.6,18,4.6);q.fillRect(-7.4,-7,14.8,2.4);line(q,-9,-4.6,9,-4.6,'rgba(255,248,226,.4)',.6);
  q.fillStyle=st;q.beginPath();q.moveTo(-6,-7);q.quadraticCurveTo(-8,-14,-3.6,-17);q.lineTo(3.6,-17);q.quadraticCurveTo(7,-12,6,-7);q.closePath();q.fill();
  ell(q,-1,-9.4,4.6,3.2,st);ell(q,2.4,-14.6,4.8,4.6,st);ell(q,2.4,-14.6,6,5.6,'rgba(110,104,92,.55)');ell(q,2.4,-14.6,4.4,4.2,mix('#b8b3a4','#ffffff',.1));
  ell(q,.4,-15.8,1,.9,'#3a362e');ell(q,4.2,-15.8,1,.9,'#3a362e');ell(q,2.4,-13,2,1.1,'#5a554a');line(q,1.4,-12.6,3.4,-12.6,'#2a2620',.5);poly(q,[-.6,-19,.2,-21.6,1.4,-19],st);poly(q,[3.4,-19,4.4,-21.6,5.2,-19],st);
  ell(q,-3.4,-12,1.8,3,'rgba(255,248,226,.28)');ell(q,5,-4,2,1.4,'rgba(0,0,0,.1)');q.restore()}
function crate(q,x,y,w,h,fill,seed){var R=rng(seed),i;q.fillStyle=lg(q,0,y-h,0,y,[0,'#b08a5a',1,'#7a5a38']);q.fillRect(x-w/2,y-h,w,h);line(q,x-w/2,y-h*.5,x+w/2,y-h*.5,'rgba(40,24,12,.45)',.7);line(q,x-w/2,y-h+.4,x+w/2,y-h+.4,'rgba(255,236,200,.4)',.7);q.fillStyle='rgba(40,24,12,.5)';q.fillRect(x-w/2,y-h,1.4,h);q.fillRect(x+w/2-1.4,y-h,1.4,h);
  if(fill)for(i=0;i<Math.round(w/4.2);i++){var fx=x-w/2+2.4+i*4.2+R()*.6;ell(q,fx,y-h-1.6+R(),2.6,2.2,mix(fill,'#000000',.2));ell(q,fx-.3,y-h-2.2+R(),2.1,1.8,fill);ell(q,fx-.8,y-h-3,.8,.6,'rgba(255,255,240,.4)')}}
function sack(q,x,y,s2,c){q.fillStyle=lg(q,x-7*s2,0,x+7*s2,0,[0,mix(c,'#000000',.2),.55,c,1,mix(c,'#ffffff',.2)]);q.beginPath();q.moveTo(x-6*s2,y);q.quadraticCurveTo(x-8*s2,y-8*s2,x-4.4*s2,y-12*s2);q.lineTo(x-2*s2,y-14.6*s2);q.lineTo(x+2*s2,y-14.6*s2);q.lineTo(x+4.4*s2,y-12*s2);q.quadraticCurveTo(x+8*s2,y-8*s2,x+6*s2,y);q.closePath();q.fill();line(q,x-2.4*s2,y-12.4*s2,x+2.4*s2,y-12.4*s2,'#6a4a2a',.8);ell(q,x-2*s2,y-7*s2,1.2*s2,3*s2,'rgba(255,248,226,.2)')}
function jar(q,x,y,s2,c,lid){q.fillStyle=lg(q,x-8*s2,0,x+8*s2,0,[0,mix(c,'#000000',.35),.45,c,1,mix(c,'#ffffff',.18)]);q.beginPath();q.moveTo(x-3.6*s2,y-17*s2);q.quadraticCurveTo(x-9*s2,y-10*s2,x-6*s2,y-2*s2);q.quadraticCurveTo(x-5*s2,y,x-3*s2,y);q.lineTo(x+3*s2,y);q.quadraticCurveTo(x+5*s2,y,x+6*s2,y-2*s2);q.quadraticCurveTo(x+9*s2,y-10*s2,x+3.6*s2,y-17*s2);q.closePath();q.fill();ell(q,x,y-17*s2,3.8*s2,1.1*s2,'#2a1c12');if(lid){ell(q,x,y-18.4*s2,4.2*s2,1.6*s2,'#8a6342');ell(q,x,y-19.8*s2,1.2*s2,1*s2,'#6a4a2a')}ell(q,x-3*s2,y-9*s2,1.3*s2,4*s2,'rgba(255,255,255,.2)')}

/* ---------- từng nhà ---------- */
function bForge(q,R){
  /* đá mài + máng nước (trái) */
  q.save();q.translate(-80,0);shadow(q,-2,0,16,3,.3);line(q,-9,0,-6,-12,'#5a4331',2);line(q,9,0,6,-12,'#5a4331',2);line(q,-10,-12,10,-12,'#4a3626',2);
  q.fillStyle=lg(q,-9,0,9,0,[0,'#7a766c',.5,'#bab4a4',1,'#8e897c']);q.beginPath();q.ellipse(0,-17,9,9,0,0,TAU);q.fill();ell(q,0,-17,2.2,2.2,'#4a3626');ell(q,-3,-20,3,2,'rgba(255,250,232,.3)');q.strokeStyle='rgba(60,54,44,.4)';q.lineWidth=.5;q.beginPath();q.arc(0,-17,5.6,0,TAU);q.stroke();
  poly(q,[-12,-2,12,-2,10,2,-10,2],'#6a4a30');ell(q,0,-2,11,1.4,'#6aa4c0');q.restore();
  /* giá búa kìm gắn tường trái ngoài + móng ngựa */
  q.save();q.translate(-64,-52);q.fillStyle='#5a4331';q.fillRect(-1,-4,2,2);line(q,-9,-2,9,-2,'#5a4331',1.6);
  [[-6,'#8a8f96'],[-2,'#7a7f86'],[2,'#9aa0a8']].forEach(function(t,k){line(q,t[0],-1.4,t[0],7+k*2,t[1],1.2);ell(q,t[0],8+k*2,1.6,1.1,t[1])});
  q.strokeStyle='#8a8f96';q.lineWidth=1;q.beginPath();q.arc(6,5,2.8,.5,TAU-.5);q.stroke();q.restore();
  /* đống than + tàn lửa (phải) */
  q.save();q.translate(80,0);shadow(q,0,0,18,3,.3);for(var i=0;i<22;i++){var cx=(R()-.5)*20,cy=-R()*8*(1-Math.abs(cx)/12);var cr=1.8+R()*2.6;ell(q,cx,cy-cr*.4,cr,cr*.8,['#1e1c1a','#2a2724','#34302c','#171614'][(R()*4)|0],R()*3);if(R()<.3)ell(q,cx-.5,cy-cr*.7,cr*.4,cr*.2,'rgba(255,255,255,.14)')}
  for(i=0;i<4;i++)ell(q,(R()-.5)*14,-1-R()*5,.9,.7,'#e8742a');q.restore();
  /* xẻng than + xô nước nhỏ */
  line(q,66,0,70,-22,'#6a4a30',1.2);poly(q,[68,-22,74,-23,73,-17,68,-18],'#6a6f76');
  chime(q,-60,-74,0,.9);lantern(q,60,-70,.95,'#b83a28');
  vine(q,-55,-9,48,-1,11,1);vine(q,55,-9,40,1,12,0);
  pot(q,-40,-9,.9,0,31);pot(q,44,-9,.9,3,32);
  roofDetail(q,0,-78,58,40,13,30,7,501,7);sparrow(q,-22,-118,1)}
function bShop(q,R){
  /* thùng rau củ + bao gạo (trái) */
  crate(q,-70,-1,18,9,'#6fa05a',61);crate(q,-70,-10,16,8,'#e08a2c',62);crate(q,-86,-1,14,8,'#d9452f',63);sack(q,-80,-9,.8,'#c9b184');sack(q,-60,0,.9,'#d6c394');
  /* vại + rổ (phải) */
  jar(q,76,0,1,'#7a6a52',1);jar(q,90,0,.8,'#8e5a3a',0);q.save();q.translate(66,0);shadow(q,0,0,10,2,.3);q.fillStyle=lg(q,-8,0,8,0,[0,'#a88a50',.5,'#c8a868',1,'#d8bc7c']);q.beginPath();q.moveTo(-6,0);q.lineTo(-8,-10);q.lineTo(8,-10);q.lineTo(6,0);q.closePath();q.fill();[['#d9452f',-3],['#f2b24a',1],['#8bbd52',4]].forEach(function(f){ell(q,f[1],-11,2.6,2.4,f[0]);ell(q,f[1]-.7,-11.8,.9,.7,'rgba(255,255,240,.4)')});q.restore();
  /* chuỗi ớt + tỏi dưới mái */
  [[-46,'#d9452f'],[-34,'#e2563a'],[34,'#d9452f'],[46,'#c83a26']].forEach(function(c,k){var L=10+(k%2)*5;line(q,c[0],-69,c[0],-69+L,'#6a4a2a',.7);for(var j=0;j<4;j++){var yy=-67+j*(L/4);ell(q,c[0]-1.3,yy+2,1.2,2.6,c[1],.2);ell(q,c[0]+1.3,yy+3,1.1,2.4,mix(c[1],'#000000',.15),-.2)}});
  [[-22,'#e8dfc2'],[22,'#ede4c8']].forEach(function(c,k){line(q,c[0],-69,c[0],-58,'#6a4a2a',.6);for(var j=0;j<3;j++){ell(q,c[0],-66+j*3.6,2,1.7,c[1]);poly(q,[c[0]-.5,-68+j*3.6,c[0],-70+j*3.6,c[0]+.5,-68+j*3.6],c[1])}});
  /* cờ hiệu 茶 */
  q.save();q.translate(-98,0);line(q,0,0,0,-58,'#4a3626',2);ell(q,0,-58.4,1.6,1.1,'#8a6342');q.fillStyle=lg(q,0,-56,0,-18,[0,'#c45a30',1,'#a8421f']);q.beginPath();q.moveTo(1,-56);q.lineTo(15,-56);q.lineTo(15,-22);q.lineTo(8,-26);q.lineTo(1,-22);q.closePath();q.fill();q.strokeStyle='#e8c870';q.lineWidth=.8;q.stroke();
  q.fillStyle='#fff0c8';q.font='bold 15px '+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText('茶',8,-40);q.restore();
  chime(q,60,-74,0,.9);lantern(q,-60,-70,.95,'#c2402c');vine(q,-55,-9,44,-1,21,1);vine(q,56,-9,34,1,22,1);pot(q,-47,-9,.85,1,33);pot(q,48,-9,.85,2,34);
  roofDetail(q,0,-78,58,40,13,30,7,502,5);sparrow(q,18,-118,-1)}
function bHerb(q,R){
  /* giàn phơi thuốc (trái) */
  q.save();q.translate(-94,0);shadow(q,0,0,18,3,.28);line(q,-13,0,-13,-34,'#6a4a30',2);line(q,13,0,13,-34,'#6a4a30',2);line(q,-15,-31,15,-31,'#5a4331',1.8);
  [[-9,'#7a9a4a',9],[-3,'#a08a3c',11],[3,'#6a8a3c',8],[9,'#b0803c',10]].forEach(function(b,k){line(q,b[0],-31,b[0],-28,'#4a3626',.7);q.fillStyle=b[1];q.beginPath();q.moveTo(b[0]-1.4,-28);q.lineTo(b[0]+1.4,-28);q.lineTo(b[0]+3,-28+b[2]);q.lineTo(b[0]-3,-28+b[2]);q.closePath();q.fill();for(var j=0;j<4;j++)line(q,b[0]-2+j*1.4,-26,b[0]-2.6+j*1.7,-28+b[2]+1,mix(b[1],'#ffffff',.2),.4)});q.restore();
  /* nong tre phơi thuốc + cối chày + vại (phải) */
  q.save();q.translate(-70,0);q.scale(.85,.85);shadow(q,0,0,16,3,.3);line(q,-9,0,-7,-9,'#5a4331',1.6);line(q,9,0,7,-9,'#5a4331',1.6);ell(q,0,-11,15,4.6,'#a88a50');ell(q,0,-11.6,13,3.6,'#c8a868');for(var i=0;i<26;i++){var ax=(R()-.5)*22,ay=-11.8+(R()-.5)*4;ell(q,ax,ay,1.3,.7,['#6a8a3c','#8a6a2c','#a8883c','#4e7a38'][(R()*4)|0],R()*3)}q.restore();
  q.save();q.translate(80,0);shadow(q,0,0,8,2,.3);q.fillStyle=lg(q,-6,0,6,0,[0,'#6a665c',.5,'#a8a396',1,'#847f72']);q.beginPath();q.moveTo(-5,0);q.lineTo(-6,-6);q.lineTo(6,-6);q.lineTo(5,0);q.closePath();q.fill();ell(q,0,-6,6,1.5,'#3a362e');line(q,1,-8,6,-16,'#6a4a30',1.6);ell(q,6.4,-16.4,1.6,1.3,'#6a4a30');q.restore();
  jar(q,66,0,.9,'#5a7a5a',1);
  /* bó thuốc dưới mái */
  [-40,-26,40].forEach(function(x,k){line(q,x,-69,x,-62,'#4a3626',.6);q.fillStyle=['#7a9a4a','#a08a3c','#6a8a3c'][k];q.beginPath();q.moveTo(x-1.4,-62);q.lineTo(x+1.4,-62);q.lineTo(x+3.4,-51);q.lineTo(x-3.4,-51);q.closePath();q.fill();for(var j=0;j<4;j++)line(q,x-2+j*1.3,-60,x-3+j*2,-50,mix(['#7a9a4a','#a08a3c','#6a8a3c'][k],'#ffffff',.25),.4)});
  chime(q,-58,-74,0,.9);lantern(q,60,-70,.9,'#b8892c');vine(q,-55,-9,50,-1,41,1);vine(q,56,-9,44,1,42,1);pot(q,-42,-9,.85,1,35);pot(q,46,-9,.85,3,36);
  roofDetail(q,0,-78,58,40,13,30,7,503,8);sparrow(q,-26,-118,1)}
function bHall(q,R){
  lion(q,-74,0,1,1);lion(q,74,0,1,-1);
  /* trống lệnh (trái ngoài) */
  q.save();q.translate(-96,0);shadow(q,0,0,12,2.4,.3);line(q,-8,0,-5,-14,'#5a4331',1.8);line(q,8,0,5,-14,'#5a4331',1.8);q.fillStyle=lg(q,-9,0,9,0,[0,'#7a2a1c',.5,'#c2402c',1,'#8a2a1c']);q.beginPath();q.ellipse(0,-19,9,10,0,0,TAU);q.fill();ell(q,0,-19,7,8,'#d8b078');ell(q,-1.4,-21,3.6,2.2,'rgba(255,248,226,.3)');q.strokeStyle='#c9a24a';q.lineWidth=.8;q.beginPath();q.ellipse(0,-19,9,10,0,0,TAU);q.stroke();for(var i=0;i<12;i++){var a=i/12*TAU;ell(q,Math.cos(a)*8.2,-19+Math.sin(a)*9.2,.7,.7,'#e2c064')}q.restore();
  /* bức hoành đỏ + đôi đèn lồng cạnh cửa */
  q.save();q.translate(43,-64);q.fillStyle='#4a3626';q.fillRect(-1,-3,12,1.4);q.fillStyle=lg(q,0,0,0,32,[0,'#d8c48a',1,'#c8b078']);q.fillRect(0,-1.4,10,30);q.strokeStyle='#a8421f';q.lineWidth=1;q.strokeRect(.5,-.9,9,29);q.fillStyle='rgba(60,30,16,.7)';for(var j=0;j<5;j++){q.fillRect(2.4,1.6+j*5.2,5.2,1.4);if(j%2==0)q.fillRect(2.4,2.8+j*5.2,2.6,.8)}poly(q,[0,28.6,10,28.6,5,32],'#4a3626');q.restore();
  lantern(q,-22,-70,.95,'#c2402c');lantern(q,22,-70,.95,'#c2402c');chime(q,-60,-74,0,.9);
  vine(q,-55,-9,40,-1,51,1);pot(q,-45,-9,.85,0,37);pot(q,47,-9,.85,1,38);
  roofDetail(q,0,-78,58,44,15,34,7,504,6);sparrow(q,30,-123,1)}
function bPortal(q,R){
  /* 8 quẻ quanh vòng cổng */
  var cx=0,cy=-50,i,k,a,rr=45;q.lineCap='butt';
  for(i=0;i<8;i++){a=i/8*TAU-Math.PI/2+TAU/16;var px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr*1.02;q.save();q.translate(px,py);q.rotate(a+Math.PI/2);var pat=i*37%7;
    for(k=0;k<3;k++){var broken=(pat>>k)&1;q.strokeStyle='rgba(54,40,24,.78)';q.lineWidth=1.5;q.beginPath();if(broken){q.moveTo(-5,k*3.2-3.2);q.lineTo(-1.2,k*3.2-3.2);q.moveTo(1.2,k*3.2-3.2);q.lineTo(5,k*3.2-3.2)}else{q.moveTo(-5,k*3.2-3.2);q.lineTo(5,k*3.2-3.2)}q.stroke()}q.restore()}
  /* trụ đá có cầu + cây cảnh */
  [-84,84].forEach(function(x,k){q.save();q.translate(x,0);shadow(q,-2,0,13,2.6,.3);var st=lg(q,-6,0,6,0,[0,'#7e7a70',.5,'#c4bfae',1,'#94907f']);q.fillStyle=st;q.fillRect(-7,-4,14,4);q.fillRect(-5,-26,10,22);q.fillRect(-6.4,-29,12.8,3.4);line(q,-7,-4,7,-4,'rgba(255,248,226,.4)',.6);for(var j=0;j<3;j++)line(q,-3,-9-j*5.4,3,-9-j*5.4,'rgba(60,54,44,.4)',.6);ell(q,0,-33,4.6,4.6,st);ell(q,-1.4,-34.4,1.6,1.4,'rgba(255,250,232,.5)');q.restore()});
  pot(q,-70,0,1.05,0,43);pot(q,70,0,1.05,0,44);pot(q,-94,0,.9,3,45);pot(q,96,0,.9,1,46);
  lantern(q,-52,-84,.95,'#2f7aa8');lantern(q,52,-84,.95,'#2f7aa8');
  vine(q,-60,-9,60,-1,47,1);vine(q,60,-9,56,1,48,1);
  roofDetail(q,0,-92,62,16,9,48,5,505,5,1);sparrow(q,-44,-109,1)}
var DRAW=[bForge,bShop,bHerb,bHall,bPortal];
var built=-1;function cd(){return Math.min(DPR,(window.QL|0)>=1?1:2)}
function sprite(i,k){var C=cd(),key=[s.toFixed(3),k.toFixed(3),C,fontOK()].join('|'),b=SC[i];if(b&&b.k===key)return b.c;if(built===fr)return null;built=fr;var sc=s*k,o=mk(220*sc,214*sc,C),q=o.q;q.setTransform(sc*C,0,0,sc*C,110*sc*C,190*sc*C);var R=rng(900+i);try{DRAW[i](q,R)}catch(e){fails++;if(fails>=3)N.on=false;try{console.warn('[nhà chi tiết]',e)}catch(x){}}SC[i]={k:key,c:o.c};return o.c}

/* ---------- lớp động (nhẹ) ---------- */
function dyn(i,t){
  if(i==0){g.save();g.fillStyle='rgba(255,140,50,'+(.5+.3*Math.sin(t*.2))+')';g.beginPath();g.arc(80+Math.sin(t*.13)*2,-5,1.2,0,TAU);g.fill();g.fillStyle='rgba(255,160,60,'+(.4+.3*Math.sin(t*.27+2))+')';g.beginPath();g.arc(76,-3.4,.9,0,TAU);g.fill();g.restore()}
  if(i==4){g.save();for(var k=0;k<8;k++){var a=k/8*TAU-Math.PI/2+TAU/16,al=.1+.16*Math.max(0,Math.sin(t*.05-k*.8));g.fillStyle='rgba(150,205,255,'+al.toFixed(3)+')';g.beginPath();g.arc(Math.cos(a)*45,-50+Math.sin(a)*45*1.02,3.4,0,TAU);g.fill()}g.restore()}
  /* đèn lồng nhấp sáng nhẹ */
  var lp=[[-60,-61],[-60,-61],[60,-61],[-22,-61],[-52,-75]][i];if(lp){g.save();g.fillStyle='rgba(255,170,90,'+(.14+.06*Math.sin(t*.09+i)).toFixed(3)+')';g.beginPath();g.arc(lp[0],lp[1],7,0,TAU);g.fill();g.restore()}}
function draw(i){var k=bww()/120,sc=s*k,cx=bxx(i)*s,D=window.TTD,x0=D&&D.vx0!=null?D.vx0:-1e9,x1=D&&D.vx1!=null?D.vx1:1e9;if(cx+112*sc<x0||cx-112*sc>x1)return;
  var c=sprite(i,k);if(!c)return;g.save();g.translate(cx,GY);g.scale(sc,sc);g.drawImage(c,-110,-190,220,214);if(N.fx&&!lite())dyn(i,fr);g.restore()}
bld=function(i){var r=_bld.apply(this,arguments);
  if(N.on&&window.TTD&&window.TTD.on&&window.TTT&&window.TTT.on&&window.TTT.drawn===fr&&i>=0&&i<5){try{draw(i)}catch(e){if(++fails>=3)N.on=false;try{console.warn('[nhà chi tiết]',e)}catch(x){}}}
  return r};
N.rebuild=function(){SC={}};
})();
