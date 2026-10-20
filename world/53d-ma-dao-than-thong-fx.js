/* ===== 🩸 DỤC NƯƠNG HUYẾT CHÚ + 🌀 VẠN NIỆM CÂU HỒN · HIỆU ỨNG MMORPG BẢN ĐỒ 2D (world/53d-ma-dao-than-thong-fx.js) =====
 * CHỈ VẼ — không đổi sát thương / MP / hồi chiêu / trạng thái. Vẽ THÊM lên trên hiệu ứng gốc của world/53 (oán linh bay, hố đen, tia ma khí, quỷ xương vẫn giữ nguyên).
 * Gọi từ world/53 (fire, Ma Tộc j=1/j=2) qua MDFX2.dn / dnHit / vn / vnHit.
 * DỤC NƯƠNG: pháp trận huyết (ngũ giác 5 huyết chú) dưới chân · 5 lá huyết chú quay quanh rồi bay đeo bám 5 địch gần nhất (vòng chú đỏ quay quanh người địch, máu nhỏ giọt) · vệt máu đỏ-tím sau 6 oán linh · vết chém máu khi trúng.
 * VẠN NIỆM: pháp trận ma niệm xoáy dưới chân · cột sáng + 4 sợi xích sắt treo từ hố đen xuống đất · vòng hút co lại + hạt xoáy dưới tâm hố · gai ma khí + sét khi tia trúng địch.
 * Chỉnh: MDFX2.cfg.q (0.35–1) · MDFX2.cfg.enable=false → chỉ còn hiệu ứng gốc. Máy yếu tự giảm. Phụ thuộc: world/53 (YCFXLIB), 53b (MDFX.H). Thiếu → không làm gì. */
(function(){
'use strict';
var L=window.YCFXLIB,M=window.MDFX;
if(!L||!M||!M.H||!L.wraithX||typeof FX==='undefined'||typeof g==='undefined')return;
var H=M.H,fx=L.fx,blob=L.blob,hs=L.hs,easeO=L.easeO,PI=Math.PI,TAU=PI*2,CFG={enable:true,q:1};
function on(){return CFG.enable&&typeof P!=='undefined'}
function Q(){return Math.max(.35,Math.min(1,CFG.q*(L.slow()?.5:1)*(L.light()?.75:1)))}
function fa(p,a0,a1){return p<a0?p/a0:p>1-a1?(1-p)/a1:1}
function paper(x,y,rot,al,seed,sc){var w=14*s*sc,h=44*s*sc;
 g.save();g.translate(x,y);g.rotate(rot);
 g.globalCompositeOperation='lighter';blob(0,0,34*s*sc,'255,30,70',.45*al);
 g.globalCompositeOperation='source-over';g.globalAlpha=al;
 var gd=g.createLinearGradient(0,-h/2,0,h/2);gd.addColorStop(0,'#f03050');gd.addColorStop(1,'#5a0818');g.fillStyle=gd;g.fillRect(-w/2,-h/2,w,h);
 g.fillStyle='#ffd070';g.fillRect(-w/2,-h/2,w,3*s*sc);g.fillRect(-w/2,h/2-3*s*sc,w,3*s*sc);
 g.strokeStyle='#ffd8e0';g.lineWidth=s;g.strokeRect(-w/2,-h/2,w,h);
 g.strokeStyle='#26030c';g.lineWidth=1.7*s*sc;g.save();g.translate(0,-9*s*sc);H.glyph(seed*5.3,9*s*sc);g.restore();g.save();g.translate(0,8*s*sc);H.glyph(seed*7.9+3,9*s*sc);g.restore();
 g.restore()}

/* ================= DỤC NƯƠNG HUYẾT CHÚ ================= */
function dnSeal(px){
 fx(px,200,function(f,p,X,gy){
  var a=fa(p,.06,.1),gr=easeO(p/.1),t=fr,pul=.65+.35*Math.sin(t*.25),i,Ro=210*s*gr;
  g.save();g.globalCompositeOperation='lighter';
  blob(X,gy-4*s,380*s,'150,16,60',.3*a);blob(X,gy-4*s,210*s,'255,30,80',.3*a*pul);
  g.translate(X,gy-3*s);g.scale(1,.3);
  g.globalCompositeOperation='source-over';g.globalAlpha=.5*a;g.fillStyle='#2a0410';g.beginPath();g.arc(0,0,Ro*.98,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.save();g.rotate(t*.012);H.ring(Ro,6*s,'#ff2a5a',.85*a);H.ring(Ro*1.05,2*s,'#9a50ff',.7*a);H.ring(Ro*.93,2*s,'#ffd0dc',.55*a);
  g.strokeStyle='#ffc0d0';g.lineWidth=1.9*s;g.globalAlpha=.85*a*pul;
  for(i=0;i<26;i++){g.save();g.rotate(i/26*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);H.glyph(i*4.1+9,14*s);g.restore()}g.restore();
  g.save();g.rotate(-t*.018);var rs=Ro*.8,pts=[];for(i=0;i<5;i++){var an=i*TAU/5-PI/2;pts.push([Math.cos(an)*rs,Math.sin(an)*rs])}
  g.strokeStyle='#ff5a8a';g.lineWidth=4*s;g.globalAlpha=.9*a;g.beginPath();[0,2,4,1,3,0].forEach(function(k,j){j?g.lineTo(pts[k][0],pts[k][1]):g.moveTo(pts[k][0],pts[k][1])});g.stroke();
  g.strokeStyle='#ffd0e0';g.lineWidth=1.4*s;g.globalAlpha=.7*a;g.stroke();
  for(i=0;i<5;i++){g.globalAlpha=a;g.fillStyle='#ff2a5a';g.beginPath();g.arc(pts[i][0],pts[i][1],11*s,0,TAU);g.fill();g.fillStyle='#fff0f4';g.beginPath();g.arc(pts[i][0],pts[i][1],4.5*s,0,TAU);g.fill()}
  g.restore();
  H.ring(Ro*.36,4*s,'#ff2a6a',.8*a*pul);H.ring(Ro*.5,2*s,'#c070ff',.6*a);
  g.restore();
  blob(X,gy-6*s,60*s,'255,60,110',.45*a*pul);
  g.restore()})}

function dnTal(px,dd){
 var tg=null,N=5,i;
 fx(px,200,function(f,p,X,gy){
  var a=fa(p,.04,.12),t=fr;
  if(!tg&&p>=.13){var A=L.alive().sort(function(u,v){return Math.abs(u.x-px)-Math.abs(v.x-px)}).slice(0,N);tg=[];for(i=0;i<N;i++)tg.push(A.length?A[i%A.length]:{x:px+dd*(160+i*60),hh:90,fake:1})}
  g.save();
  for(i=0;i<N;i++){
   var ang=t*.12+i*TAU/N,ox=X+Math.cos(ang)*78*s,oy=gy-(74+Math.sin(ang)*20+Math.sin(t*.08+i)*5)*s,rs=easeO(p/.1),x=ox,y=oy-(1-rs)*60*s,rot=Math.sin(t*.05+i)*.2;
   if(tg&&p>=.13){var e=tg[i],hx=X+(e.x-px)*s,hh=(e.hh||90)*(typeof SZ!=='undefined'?SZ:1),hy=gy-(hh+30)*s,u=easeO((p-.13)/.14);
    if(p<.27){var a0=.13*200,an0=(t-(p-.13)*200)*.12+i*TAU/N,sx=X+Math.cos(an0)*78*s,sy=gy-(74+Math.sin(an0)*20)*s;
     x=sx+(hx-sx)*u;y=sy+(hy-sy)*u-Math.sin(u*PI)*46*s;rot=Math.atan2(hy-sy,hx-sx)*.35+Math.sin(t*.4)*.1;
     g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.strokeStyle='#ff2a5a';g.lineWidth=5*s;g.lineCap='round';g.beginPath();g.moveTo(sx+(x-sx)*.55,sy+(y-sy)*.55+14*s);g.lineTo(x,y);g.stroke();g.restore()}
    else{x=hx+Math.sin(t*.07+i)*3*s;y=hy+Math.sin(t*.09+i*2)*4*s;rot=Math.sin(t*.06+i)*.15;
     var cy=gy-hh*.5*s,k;g.save();g.globalCompositeOperation='lighter';g.translate(x,cy);g.scale(1,.42);g.rotate(t*.05+i);
     H.ring(30*s,3*s,'#ff2a5a',.85*a);H.ring(22*s,1.4*s,'#ffd0dc',.6*a);g.strokeStyle='#ffc0d0';g.lineWidth=1.6*s;g.globalAlpha=.85*a;
     for(k=0;k<8;k++){g.save();g.rotate(k/8*TAU);g.translate(26*s,0);H.glyph(k*3+i*11,8*s);g.restore()}g.restore();
     g.save();g.globalCompositeOperation='lighter';for(k=0;k<3;k++){var d=(t*.03+k/3+i*.2)%1;blob(x+(k-1)*8*s,y+14*s+d*(hh*.7)*s,3.2*s,'255,40,90',.9*(1-d)*a)}g.restore()}
   }
   paper(x,y,rot,a,i+1,1);
  }
  g.restore()})}

function dnTrail(px,dd,q){
 var nW=q<.6?4:6;
 fx(px,190,function(f,p,X,gy){
  var a=fa(p,.1,.12),t=fr,i,k,j;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(i=0;i<nW;i++){var pts=[];for(k=0;k<9;k++){var t2=t-k*2.4;pts.push([X+L.wraithX(i,t2,dd)*s,gy-(58+(i%3)*52+Math.sin(t2*.13+i)*14)*s])}
   for(k=1;k<9;k++){var al=a*(1-k/9)*.75;g.globalAlpha=al*.55;g.strokeStyle='#ff2a5a';g.lineWidth=(11-k)*s;g.beginPath();g.moveTo(pts[k-1][0],pts[k-1][1]);g.lineTo(pts[k][0],pts[k][1]);g.stroke();
    g.globalAlpha=al;g.strokeStyle='#ffc0d4';g.lineWidth=(2.6-k*.2)*s;g.beginPath();g.moveTo(pts[k-1][0],pts[k-1][1]);g.lineTo(pts[k][0],pts[k][1]);g.stroke()}
   blob(pts[0][0],pts[0][1],34*s,'255,30,80',.3*a);
   for(j=0;j<2;j++){var d=(t*.025+i*.31+j*.5)%1;blob(pts[0][0]-8*s+j*14*s,pts[0][1]+10*s+d*80*s,3*s,'255,40,90',.85*(1-d)*a)}}
  g.restore()})}

function dnHitFx(e){
 var sd=e.x*.37+fr;
 fx(e.x,14,function(f,p,X,gy){
  var a=1-p,cy=gy-((e.hh||90)*(typeof SZ!=='undefined'?SZ:1)*.5)*s,i;
  g.save();g.globalCompositeOperation='lighter';blob(X,cy,(28+30*p)*s,'255,40,90',.65*a);
  g.lineCap='round';
  for(i=0;i<3;i++){var o=(i-1)*13*s,len=(46+i*8)*s*Math.min(1,p*3+.25);
   g.globalAlpha=a*.8;g.strokeStyle='#ff2a5a';g.lineWidth=6*s;g.beginPath();g.moveTo(X-len*.5+o,cy-len*.6);g.lineTo(X+len*.5+o,cy+len*.6);g.stroke();
   g.globalAlpha=a;g.strokeStyle='#fff0f4';g.lineWidth=1.8*s;g.beginPath();g.moveTo(X-len*.5+o,cy-len*.6);g.lineTo(X+len*.5+o,cy+len*.6);g.stroke()}
  for(i=0;i<6;i++){var an=-PI/2+(hs(sd+i)-.5)*2.2,sp=(30+hs(sd+i+5)*36)*s,dx=Math.cos(an)*sp*p,dy=Math.sin(an)*sp*p+60*s*p*p;blob(X+dx,cy+dy,3.4*s,'255,40,90',.9*a)}
  g.restore()})}

/* ================= VẠN NIỆM CÂU HỒN ================= */
function vnSeal(px){
 fx(px,150,function(f,p,X,gy){
  var a=fa(p,.08,.14),gr=easeO(p/.12),t=fr,i,Ro=250*s*gr,pul=.7+.3*Math.sin(t*.3);
  g.save();g.globalCompositeOperation='lighter';blob(X,gy-4*s,330*s,'110,40,210',.34*a);blob(X,gy-4*s,150*s,'200,120,255',.3*a*pul);
  g.translate(X,gy-3*s);g.scale(1,.3);
  g.globalCompositeOperation='source-over';g.globalAlpha=.55*a;g.fillStyle='#10042a';g.beginPath();g.arc(0,0,Ro,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.save();g.rotate(-t*.014);H.ring(Ro,6*s,'#a060ff',.85*a);H.ring(Ro*1.05,2*s,'#ff2a6a',.7*a);H.ring(Ro*.92,2*s,'#e8d0ff',.55*a);
  g.strokeStyle='#f0e0ff';g.lineWidth=1.9*s;g.globalAlpha=.85*a*pul;
  for(i=0;i<28;i++){g.save();g.rotate(i/28*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);H.glyph(i*3.3+21,14*s);g.restore()}g.restore();
  var arm,k;g.save();g.rotate(t*.05);g.lineCap='round';
  for(arm=0;arm<4;arm++){var a0=arm*TAU/4;g.strokeStyle=arm%2?'rgba(255,60,120,.6)':'rgba(176,112,255,.7)';g.globalAlpha=a;g.lineWidth=5*s;g.beginPath();
   for(k=0;k<=18;k++){var rr=Ro*(.12+k*.042),an=a0+k*.2;k?g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):g.moveTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.stroke()}g.restore();
  g.globalCompositeOperation='source-over';g.globalAlpha=a;g.fillStyle='#000';g.beginPath();g.arc(0,0,Ro*.12,0,TAU);g.fill();
  g.restore();g.restore()})}

function vnPull(cx,HY,q){
 var nP=Math.round(26*q);
 fx(cx,130,function(f,p,X,gy){
  var a=fa(p,.1,.14),t=fr,i,k,top=Math.max(70*s,gy-HY*s);
  g.save();
  g.globalCompositeOperation='source-over';g.globalAlpha=.5*a;g.fillStyle='#07020f';g.beginPath();g.ellipse(X,gy-3*s,130*s,50*s,0,0,TAU);g.fill();g.globalAlpha=1;
  g.globalCompositeOperation='lighter';
  var cg=g.createLinearGradient(0,top,0,gy);cg.addColorStop(0,'rgba(150,70,255,0)');cg.addColorStop(1,'rgba(150,70,255,'+.26*a+')');g.fillStyle=cg;g.beginPath();g.moveTo(X-18*s,top);g.lineTo(X+18*s,top);g.lineTo(X+90*s,gy-3*s);g.lineTo(X-90*s,gy-3*s);g.closePath();g.fill();
  for(k=0;k<3;k++){var u=(t*.022+k/3)%1,rr=(1-u)*320*s;g.globalAlpha=Math.sin(u*PI)*a*.9;g.strokeStyle=k%2?'#ff3a7a':'#b070ff';g.lineWidth=(2+3*(1-u))*s;g.beginPath();g.ellipse(X,gy-3*s,rr,rr*.3,0,0,TAU);g.stroke()}
  for(i=0;i<nP;i++){var u2=(t*.014*(.6+hs(i)*.8)+hs(i+7))%1,rr2=(1-u2)*290*s,aq=hs(i+3)*TAU+t*.06+u2*3.2;g.globalAlpha=Math.sin(u2*PI)*a;g.fillStyle=i%3?'#d0a8ff':'#ff4d8a';g.beginPath();g.arc(X+Math.cos(aq)*rr2,gy-3*s+Math.sin(aq)*rr2*.3,(1.2+1.8*(1-u2))*s,0,TAU);g.fill()}
  g.restore()})}

function vnChains(cx,HY){
 var offs=[-260,-90,90,260];
 fx(cx,130,function(f,p,X,gy){
  var a=fa(p,.1,.14),t=fr,top=Math.max(70*s,gy-HY*s),gr=easeO(p/.16),c,k;
  g.save();g.lineCap='round';
  for(c=0;c<4;c++){var x1=X+offs[c]*s,y1=gy-4*s,mx=(X+x1)/2+Math.sin(t*.05+c*1.7)*16*s,my=(top+y1)/2+34*s,N=18;
   for(k=0;k<=N;k++){var u=k/N*gr,q=1-u,x=q*q*X+2*q*u*mx+u*u*x1,y=q*q*top+2*q*u*my+u*u*y1,dx=2*q*(mx-X)+2*u*(x1-mx),dy=2*q*(my-top)+2*u*(y1-my),an=Math.atan2(dy,dx),al=a*(k>N*gr-2?.5:1);
    g.save();g.translate(x,y);g.rotate(an);
    g.globalCompositeOperation='source-over';g.globalAlpha=al;g.strokeStyle='#120a1e';g.lineWidth=3.6*s;g.beginPath();if(k&1)g.ellipse(0,0,8*s,4.2*s,0,0,TAU);else g.ellipse(0,0,4.2*s,6.4*s,0,0,TAU);g.stroke();
    g.globalCompositeOperation='lighter';g.globalAlpha=al*.8;g.strokeStyle=c%2?'#ff5a9a':'#b880ff';g.lineWidth=1.2*s;g.beginPath();if(k&1)g.ellipse(0,0,8*s,4.2*s,0,0,TAU);else g.ellipse(0,0,4.2*s,6.4*s,0,0,TAU);g.stroke();
    g.restore()}
   if(gr>.9){g.globalCompositeOperation='lighter';blob(x1,gy-4*s,26*s,'190,110,255',.5*a)}}
  g.restore()})}

function vnHitFx(e){
 var sd=e.x*.29+fr;
 fx(e.x,22,function(f,p,X,gy){
  var a=1-p,cy=gy-((e.hh||90)*(typeof SZ!=='undefined'?SZ:1)*.5)*s,i;
  g.save();g.globalCompositeOperation='lighter';
  g.globalAlpha=a*.7;g.strokeStyle='#b070ff';g.lineWidth=4*s;g.beginPath();g.ellipse(X,gy-3*s,(14+70*p)*s,(5+22*p)*s,0,0,TAU);g.stroke();
  blob(X,cy,(30+34*p)*s,'150,70,255',.7*a);blob(X,cy,(14+12*p)*s,'255,120,200',.5*a);
  g.globalCompositeOperation='source-over';g.fillStyle='#07030d';g.globalAlpha=a*.95;
  for(i=0;i<8;i++){var an=hs(sd+i)*TAU,r0=8*s,r1=(26+34*hs(sd+i+4))*s*Math.min(1,p*3+.2),w=4*s;g.beginPath();g.moveTo(X+Math.cos(an-.12)*r0,cy+Math.sin(an-.12)*r0);g.lineTo(X+Math.cos(an)*r1,cy+Math.sin(an)*r1);g.lineTo(X+Math.cos(an+.12)*r0,cy+Math.sin(an+.12)*r0);g.fill()}
  g.globalCompositeOperation='lighter';g.strokeStyle='#e8c8ff';g.lineWidth=1.6*s;g.globalAlpha=a;g.beginPath();
  for(i=0;i<8;i++){var an2=hs(sd+i)*TAU,r1b=(26+34*hs(sd+i+4))*s*Math.min(1,p*3+.2);g.moveTo(X+Math.cos(an2)*8*s,cy+Math.sin(an2)*8*s);g.lineTo(X+Math.cos(an2)*r1b,cy+Math.sin(an2)*r1b)}g.stroke();
  g.restore()})}

/* ---------- API cho world/53 ---------- */
function dn(px,dd,lg){var q=Q();dnSeal(px);dnTal(px,dd);dnTrail(px,dd,q);try{L.flash('#a01040',3)}catch(e){}}
function dnHit(e,qq){if(FX.length>90||(qq&1))return;dnHitFx(e)}
function vn(cx,HY,lg,dd){var q=Q();vnSeal(P.x);vnPull(cx,HY,q);vnChains(cx,HY)}
function vnHit(tg){if(FX.length>90)return;vnHitFx(tg);if(Q()>=.6&&hs(tg.x+fr)>.45)try{H.boltFx(tg.x)}catch(e){}}
window.MDFX2={on:on,dn:dn,dnHit:dnHit,vn:vn,vnHit:vnHit,cfg:CFG};
})();
