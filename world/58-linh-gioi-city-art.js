/* ===== 🏯 THÀNH THỊ LINH GIỚI · BẢN ĐỒ VẼ BẰNG CODE (world/58-linh-gioi-city-art.js) =====
 * v2 — VẼ LẠI HOÀN TOÀN. Không còn ảnh nền nhúng (-263KB): cả cảnh được vẽ bằng canvas, chia 3 lớp ĐÃ CACHE (xa · giữa · gần)
 * + các lớp HOẠT CẢNH vẽ động (sao, cực quang, mây trôi, thác nước, sương, đèn trời, hạc bay, tiên nhân ngự kiếm, sao băng, ánh cửa sổ,
 * hào quang cung điện, phản chiếu sàn đá, trận pháp xoay, cánh hoa anh đào, đom đóm…).
 * THỰC TẾ HƠN: ánh trăng chiếu từ trái, đá có vân + hạt nhiễu, sương mù xa gần (atmospheric perspective), thị sai nhiều tầng (parallax),
 * bóng đổ, ánh phản chiếu của cổng lên sàn, kiến trúc mái cong có đèn sáng.
 * GIỮ NGUYÊN API cũ để các module khác không vỡ: LGART{ver,L,ok,ww,gx,fx,paint,gate,cam,blit}, hệ toạ độ ảnh 1320×743, sàn BASEY=520,
 * cổng FX/PCY/PRX/PRY/LBL, cột sáng Về Làng ở (110,592) (world/65). Camera đi theo nhân vật như cũ.
 * Chỉnh: KB (độ phóng), FX (vị trí cổng), LBL (độ cao nhãn), CAP (độ nét cache), CLOUDS/FLY/CRANES (mật độ hoạt cảnh).
 * Hiệu năng: QL=1 bớt hoạt cảnh nặng, QL=2 chỉ giữ hoạt cảnh nhẹ; cache hạ độ phân giải (≤1.5px/px ảnh, 1.0 khi QL=2). Bản ảnh cũ: _audit/58-linh-gioi-city-art.ANH_CU.js.bak */
(function(){
'use strict';
if(!window.LCT||!LCT.gates)return;
var IW=1320,IH=743,BASEY=520,ET=420,EB=420,KB=.95;
var FX=[.156,.354,.555,.753,.923];
var PCY=442,PRX=36,PRY=58;
var LBL=[351,306,302,323,321];
var CAP=1.5;
var camX=0,camOn=false,B=null,NZ=null,GS={},CLS=[];
function K(){return vw()/IW} /* Fix192: về cơ chế cũ — ảnh vừa khít khung, không camera */
function WW(){return IW*K()}
function ql(){return window.QL|0}
function lite(){return ql()>=2}
function mid(){return ql()>=1}
var A=window.LGART={ver:0,L:null,ok:function(){return true},
  ww:function(){return(LCT.on&&LCT.on())?WW():vw()},
  gx:function(i){return FX[Math.min(i,FX.length-1)]*WW()},
  fx:function(i){return FX[Math.min(i,FX.length-1)]},
  paint:function(){return true},gate:gate,cam:camera,blit:blit};

/* ---------- tiện ích ---------- */
function R(sd){var a=sd%2147483647;if(a<=0)a+=2147483646;return function(){a=a*16807%2147483647;return(a-1)/2147483646}}
function hx(h){return[1,3,5].map(function(i){return parseInt(h.substr(i,2),16)})}
function mx(a,b,t){a=hx(a);b=hx(b);return'rgb('+[0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t)}).join(',')+')'}
function el(q,x,y,rx,ry,rot){q.beginPath();q.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,6.2832)}
function lg(q,x0,y0,x1,y1,st){var g1=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)g1.addColorStop(st[i],st[i+1]);return g1}
function rg(q,x,y,r0,r1,st){var g1=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)g1.addColorStop(st[i],st[i+1]);return g1}
function noise(){var cv=document.createElement('canvas');cv.width=cv.height=128;var q=cv.getContext('2d'),id=q.createImageData(128,128),r=R(7),i,v;
  for(i=0;i<id.data.length;i+=4){v=r()*255|0;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}q.putImageData(id,0,0);return cv}
function grain(q,a){q.save();q.globalAlpha=a;q.globalCompositeOperation='overlay';q.fillStyle=q.createPattern(NZ,'repeat');q.fill();q.restore()}
function spr(w,h,c,fn,hz){var cv=document.createElement('canvas');cv.width=Math.ceil(w*c);cv.height=Math.ceil(h*c);var q=cv.getContext('2d');q.scale(c,c);fn(q);
  if(hz){q.globalCompositeOperation='source-atop';q.fillStyle=hz;q.fillRect(0,0,w,h)}return{cv:cv,w:w,h:h}}
function lay(x0,y0,w,h,c,fn){var cv=document.createElement('canvas');cv.width=Math.ceil(w*c);cv.height=Math.ceil(h*c);var q=cv.getContext('2d');q.scale(c,c);q.translate(-x0,-y0);fn(q);return{cv:cv,x:x0,y:y0,w:w,h:h}}
function glowSpr(rgb){return GS[rgb]||(GS[rgb]=spr(64,64,1,function(q){q.fillStyle=rg(q,32,32,0,32,[0,'rgba('+rgb+',1)',.35,'rgba('+rgb+',.4)',1,'rgba('+rgb+',0)']);q.fillRect(0,0,64,64)}))}
function stoneBox(q,x,y,w,h,a,b){q.fillStyle=lg(q,x,0,x+w,0,[0,a,1,b]);q.fillRect(x,y,w,h);q.fillStyle='rgba(255,255,255,.3)';q.fillRect(x,y,w,1.4);q.fillStyle='rgba(0,0,40,.3)';q.fillRect(x,y+h-1.4,w,1.4)}

/* ---------- đá: đa giác + vân tầng + sáng trái/tối phải + hạt ---------- */
function rock(q,pts,c1,c2,sd,lit){
  var r=R(sd),mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9,i,n;
  pts.forEach(function(p){mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mny=Math.min(mny,p[1]);mxy=Math.max(mxy,p[1])});
  q.beginPath();pts.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();
  q.fillStyle=lg(q,0,mny,0,mxy,[0,c1,1,c2]);q.fill();q.save();q.clip();
  q.fillStyle=lg(q,mnx,0,mxx,0,[0,'rgba(200,222,255,'+(lit==null?.32:lit)+')',.4,'rgba(200,222,255,0)',1,'rgba(6,4,40,.42)']);q.fillRect(mnx,mny,mxx-mnx,mxy-mny);
  n=Math.max(6,(mxy-mny)/6|0);
  for(i=0;i<n;i++){var y=mny+(mxy-mny)*(i+r())/n,cx=mnx+r()*(mxx-mnx)*.25;q.strokeStyle=r()<.55?'rgba(10,8,44,.24)':'rgba(225,238,255,.15)';q.lineWidth=.5+r()*1.3;
    q.beginPath();q.moveTo(cx,y);while(cx<mxx){cx+=5+r()*16;q.lineTo(cx,y+(r()-.5)*5)}q.stroke()}
  for(i=0;i<n*.8;i++){var x2=mnx+r()*(mxx-mnx),y2=mny+r()*(mxy-mny)*.7;q.strokeStyle='rgba(8,6,36,.28)';q.lineWidth=.8+r()*2;q.beginPath();q.moveTo(x2,y2);q.lineTo(x2+(r()-.5)*10,y2+8+r()*38);q.stroke()}
  grain(q,.4);q.restore()}

/* ---------- cây ---------- */
function pine(q,x,y,h,c1,c2){var i,w=h*.3;q.fillStyle='#34252b';q.fillRect(x-h*.025,y-h*.22,h*.05,h*.22);
  for(i=0;i<4;i++){var ty=y-h+i*h*.19,by=y-h*.36+i*h*.1,hw=w*(.42+i*.2);q.fillStyle=lg(q,x-hw,0,x+hw,0,[0,c1,1,c2]);
    q.beginPath();q.moveTo(x,ty);q.lineTo(x+hw,by);q.quadraticCurveTo(x,by+h*.05,x-hw,by);q.closePath();q.fill()}}
function bush(q,x,y,rad,c1,c2,r){var i,n=7;q.fillStyle='#3a2a2c';q.fillRect(x-rad*.07,y-rad*.8,rad*.14,rad*.8);
  for(i=0;i<n;i++){var a=r()*6.28,d=r()*rad*.55,cx=x+Math.cos(a)*d,cy=y-rad*1.15+Math.sin(a)*d*.6,rr=rad*(.42+r()*.28);
    q.fillStyle=rg(q,cx-rr*.3,cy-rr*.35,0,rr,[0,c1,1,c2]);q.beginPath();q.arc(cx,cy,rr,0,6.2832);q.fill()}}


/* ---------- chi tiết đảo: vân đá nhiều màu, rêu, mạch tinh thể, hang có đèn, tảng đá bám, nhũ pha lê, xích đèn, đá vụn trôi ---------- */
function islandDetail(q,cx,ty,w,h,o,r,pts,n,res){
  var i,k,x,L=cx-w/2,E=function(side,t){return side<0?pts[Math.round(t*n)]:pts[2*n+1-Math.round(t*n)]};
  q.save();q.beginPath();pts.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();q.clip();
  var BC=['rgba(150,120,205,.18)','rgba(60,120,150,.17)','rgba(190,140,110,.15)','rgba(90,80,160,.2)','rgba(120,170,150,.14)'];
  for(k=0;k<5;k++){var y0=ty+h*(.1+k*.14),th=3+r()*6;q.fillStyle=BC[k];q.beginPath();q.moveTo(L-4,y0);for(x=L;x<=L+w+4;x+=w/9)q.lineTo(x,y0+Math.sin(x*.06+k*2)*3+r()*2);for(x=L+w+4;x>=L-4;x-=w/9)q.lineTo(x,y0+th+Math.sin(x*.05+k)*3);q.closePath();q.fill()}
  /* rêu + dây rủ ở nửa trên */
  for(k=0;k<(w>100?20:11);k++){var sd=r()<.5?-1:1,pe=E(sd,r()*.4),mxp=pe[0]-sd*r()*w*.07;q.fillStyle='rgba('+(70+r()*40|0)+','+(150+r()*40|0)+',100,.75)';q.beginPath();q.ellipse(mxp,pe[1]+2,3+r()*6,1.6+r()*2.6,0,0,6.2832);q.fill();
    q.strokeStyle='rgba(80,170,100,.7)';q.lineWidth=.9;q.beginPath();q.moveTo(mxp,pe[1]+3);q.lineTo(mxp+(r()-.5)*3,pe[1]+6+r()*12);q.stroke()}
  /* mạch tinh thể phát sáng trong đá */
  q.save();q.globalCompositeOperation='lighter';
  for(k=0;k<(w>100?3:2);k++){var vx=cx+(r()-.5)*w*.5,vy=ty+h*(.18+r()*.2);q.strokeStyle='rgba(120,215,255,.65)';q.lineWidth=1.1;q.beginPath();q.moveTo(vx,vy);
    for(i=0;i<5;i++){vx+=(r()-.5)*w*.1;vy+=h*(.06+r()*.05);q.lineTo(vx,vy);q.fillStyle='rgba(170,235,255,.7)';q.fillRect(vx-1,vy-1,2,2)}q.stroke()}
  q.restore();
  /* hang động có ánh đèn + bậc đá */
  if(o.cave!==0&&w>=90){var cvx=cx+(r()-.5)*w*.34,cvy=ty+h*.3,cw=Math.max(8,w*.075),ch=cw*1.15;
    q.fillStyle=rg(q,cvx,cvy+ch*.3,0,ch*1.2,[0,'#ffcf86',.45,'#8a4a40',1,'#150c28']);q.beginPath();q.moveTo(cvx-cw,cvy+ch*.6);q.lineTo(cvx-cw,cvy);q.quadraticCurveTo(cvx,cvy-ch*1.2,cvx+cw,cvy);q.lineTo(cvx+cw,cvy+ch*.6);q.closePath();q.fill();
    q.strokeStyle='rgba(215,220,245,.8)';q.lineWidth=1.3;q.stroke();q.fillStyle='rgba(220,226,248,.8)';for(i=0;i<3;i++)q.fillRect(cvx-cw*(1+i*.2),cvy+ch*.6+i*2,cw*2*(1+i*.2),2)}
  q.restore();
  /* tảng đá bám hai bên */
  for(k=0;k<3;k++){var sd2=k%2?1:-1,pe2=E(sd2,.18+r()*.4),cxl=pe2[0]+sd2*w*.012,cyl=pe2[1],rr=w*(.035+r()*.04),lp=[],m;
    for(m=0;m<8;m++){var a=m*.785+r()*.3;lp.push([cxl+Math.cos(a)*rr*(.8+r()*.4)*(a>1.6&&a<4.7?1:1.2),cyl+Math.sin(a)*rr*(.8+r()*.4)])}rock(q,lp,'#8a90bc','#2c2e5c',o.sd+k*7,.34)}
  /* nhũ pha lê chúc xuống ở chóp đảo */
  var tip=pts[n];for(k=0;k<3;k++){var cxk=tip[0]+(k-1)*w*.045,hk=h*(.17-k*.02);q.save();q.translate(cxk,tip[1]-h*.07+k*h*.03);q.scale(1,-1);crystal(q,0,0,w*.038,hk,'#e4fbff','#3f8fe0');q.restore();if(res&&res.cr)res.cr.push([cxk,tip[1]+hk*.5])}
  /* xích + đèn lồng treo dưới đảo */
  if(o.chain){for(k=0;k<2;k++){var ex=cx+(k?.14:-.16)*w,ey=ty+h*.34,len=h*(.3+k*.06);q.strokeStyle='rgba(60,56,90,.8)';q.lineWidth=1;q.beginPath();q.moveTo(ex,ey);for(i=1;i<=6;i++)q.lineTo(ex+(i%2?1.2:-1.2),ey+len*i/6);q.stroke();
    var ly=ey+len;q.fillStyle=rg(q,ex,ly+4,0,9,[0,'#ffe0a0',.5,'#e8503a',1,'#8a1c2a']);q.beginPath();q.ellipse(ex,ly+4,4.5,6,0,0,6.2832);q.fill();q.fillStyle='#ffd66b';q.fillRect(ex-2,ly-2,4,2);q.fillRect(ex-2,ly+9,4,2)}}
  /* đá vụn trôi quanh */
  for(k=0;k<(o.deb==null?3:o.deb);k++){var dx=cx+(r()-.5)*w*1.05,dy=ty+h*(.5+r()*.55),dr=w*(.012+r()*.022),dp=[],m2;
    for(m2=0;m2<6;m2++){var a2=m2*1.047+r()*.4;dp.push([dx+Math.cos(a2)*dr*(.8+r()*.5),dy+Math.sin(a2)*dr*.8*(.8+r()*.5)])}rock(q,dp,'#8a90bc','#2c2e5c',o.sd+k*11,.3);
    q.fillStyle='rgba(120,200,120,.7)';q.beginPath();q.ellipse(dx,dy-dr*.55,dr*.7,dr*.22,0,0,6.2832);q.fill()}}
function surfaceDetail(q,cx,ty,w,ry,o,r){
  var i,k;
  /* lối đá uốn lượn */
  q.strokeStyle='rgba(228,232,250,.75)';q.lineWidth=Math.max(1.6,w*.02);q.lineCap='round';q.setLineDash([w*.03,w*.018]);q.beginPath();q.moveTo(cx+w*.04,ty+ry*.15);q.bezierCurveTo(cx+w*.2,ty+ry*.5,cx-w*.1,ty+ry*.7,cx-w*.32,ty+ry*.3);q.stroke();q.setLineDash([]);
  if(o.pond){var px=cx+w*.17,py=ty+ry*.28;q.fillStyle=rg(q,px,py,0,w*.1,[0,'#d8f4ff',.6,'#6aaae8',1,'#3a6ab0']);q.beginPath();q.ellipse(px,py,w*.09,ry*.42,0,0,6.2832);q.fill();q.strokeStyle='rgba(255,255,255,.65)';q.lineWidth=.9;q.beginPath();q.ellipse(px-w*.015,py-ry*.06,w*.05,ry*.16,0,3.3,5.8);q.stroke();
    q.fillStyle='#ffc0e0';for(i=0;i<3;i++){q.beginPath();q.ellipse(px+(i-1)*w*.04,py+ry*.05,w*.012,w*.007,0,0,6.2832);q.fill()}}
  for(k=0;k<(o.sak||0);k++)bush(q,cx+(k?.26:-.24)*w+(r()-.5)*w*.06,ty+ry*.05,w*.07,'#ffe2ee','#e47aa6',r);
  if(o.bam){var bx=cx-w*.3;for(i=0;i<6;i++){var bxx=bx+i*w*.012,bh=w*(.17+r()*.1);q.fillStyle=i%2?'#4fa860':'#3a9050';q.fillRect(bxx,ty-bh+ry*.2,w*.007,bh);q.fillStyle='#8fd890';for(k=1;k<5;k++)q.fillRect(bxx-.3,ty-bh+ry*.2+bh*k/5,w*.007+.6,1);q.fillStyle='rgba(90,190,110,.9)';for(k=0;k<3;k++){q.beginPath();q.ellipse(bxx+(k%2?4:-4),ty-bh+ry*.2+k*5,5,1.8,k%2?-.5:.5,0,6.2832);q.fill()}}}
  /* đèn đá nhỏ (ánh sáng bake sẵn) */
  [-.12,.34].forEach(function(f){var lx=cx+f*w,ly=ty+ry*.55;q.fillStyle='#c4cdee';q.fillRect(lx-1.5,ly-w*.04,3,w*.04);q.fillStyle=rg(q,lx,ly-w*.052,0,w*.04,[0,'#fff1c0',.4,'rgba(255,190,100,.6)',1,'rgba(255,190,100,0)']);q.beginPath();q.arc(lx,ly-w*.052,w*.04,0,6.2832);q.fill();q.fillStyle='#fff4d0';q.fillRect(lx-2,ly-w*.058,4,4)})}
/* ---------- đảo nổi (vẽ vào sprite, có sương mù theo độ xa) ---------- */
function island(q,cx,ty,w,h,o,r){
  var L=cx-w/2,Rr=cx+w/2,pts=[],n=9,i,t,hw,res={wf:[],win:[],cr:[]};
  for(i=0;i<=n;i++){t=i/n;hw=w/2*(1-Math.pow(t,1.2))*(1+.08*Math.sin(t*8+o.sd));pts.push([cx-hw-(r()-.4)*w*.05*(i>0?1:0),ty+h*t+(r()-.5)*h*.04])}
  for(i=n;i>=0;i--){t=i/n;hw=w/2*(1-Math.pow(t,1.2))*(1+.08*Math.sin(t*7+o.sd+2));pts.push([cx+hw+(r()-.4)*w*.05*(i>0?1:0),ty+h*t+(r()-.5)*h*.04])}
  rock(q,pts,o.r1||'#7a80a8',o.r2||'#262850',o.sd,.34);
  islandDetail(q,cx,ty,w,h,o,r,pts,n,res);
  /* rễ, dây leo lơ lửng */
  q.strokeStyle='rgba(70,120,80,.7)';q.lineWidth=1.2;for(i=0;i<(o.vine||5);i++){var vx=L+w*(.12+r()*.76),vy=ty+h*.06,vl=h*(.12+r()*.2);q.beginPath();q.moveTo(vx,vy);q.quadraticCurveTo(vx+(r()-.5)*8,vy+vl*.6,vx+(r()-.5)*5,vy+vl);q.stroke()}
  /* mặt cỏ */
  var ry=Math.max(4,w*.05);
  q.fillStyle=lg(q,0,ty-ry,0,ty+ry*1.4,[0,'#9ee08a',.5,'#4fa465',1,'#2d6a52']);el(q,cx,ty,w/2,ry);q.fill();
  q.fillStyle='rgba(255,255,255,.18)';el(q,cx-w*.1,ty-ry*.3,w*.3,ry*.4);q.fill();
  q.save();el(q,cx,ty,w/2,ry);q.clip();grain(q,.35);q.restore();
  /* cây */
  var nt=o.tr==null?4:o.tr;for(i=0;i<nt;i++){var tx=cx+(r()-.5)*w*.78,tyy=ty+(r()-.3)*ry*.6;if(o.bush&&i%2)bush(q,tx,tyy,w*.055,'#c8f0a0','#3f8a5a',r);else pine(q,tx,tyy,w*(.16+r()*.14),'#5ab87a','#1f5a4a')}
  surfaceDetail(q,cx,ty,w,ry,o,r);
  /* công trình */
  if(o.pg){var px=cx+(o.px||0)*w;pagoda(q,px,ty-ry*.2,o.pgw||w*.28,o.pgn||3,o.pgh||w*.4,PAL[o.pal||0],res.win)}
  /* pha lê phát sáng */
  for(i=0;i<(o.cr||0);i++){var xx=cx+(i-(o.cr-1)/2)*w*.12+(r()-.5)*6,hh=h*(.22+r()*.2),ww=w*.04;crystal(q,xx,ty+ry*.5,ww,hh,'#dffaff','#3f8fe0');res.cr.push([xx,ty-hh*.5])}
  /* thác */
  if(o.wf)o.wf.forEach(function(f){var wx=cx+f[0]*w*.5,wy=ty+h*.06+Math.abs(f[0])*h*.08;res.wf.push({x:wx,y:wy,w:f[2]||Math.max(5,w*.045),len:f[1]})});
  return res}
function crystal(q,x,y,w,h,c1,c2){q.fillStyle=lg(q,x,y-h,x,y,[0,c1,1,c2]);q.beginPath();q.moveTo(x-w*.5,y);q.lineTo(x-w*.3,y-h*.6);q.lineTo(x+w*.04,y-h);q.lineTo(x+w*.42,y-h*.55);q.lineTo(x+w*.5,y);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.45)';q.beginPath();q.moveTo(x-w*.3,y-h*.6);q.lineTo(x+w*.04,y-h);q.lineTo(x-w*.05,y-h*.35);q.closePath();q.fill()}
/* đặt đảo vào lớp: dựng sprite (có sương), trả danh sách thác/cửa sổ theo toạ độ ảnh */
function putIsland(q,tg,cx,ty,w,h,o){
  var up=o.up||(o.pg?(o.pgh||w*.4)+w*.18:w*.4),mgn=44,ox=cx-w/2-mgn,oy=ty-up,sw=w+mgn*2,sh=h+up+20,r=R(o.sd||3),res;
  var sp=spr(sw,sh,tg.c,function(sq){res=island(sq,cx-ox,ty-oy,w,h,o,r)},o.hz);
  if(q)q.drawImage(sp.cv,ox,oy,sw,sh);
  if(tg.wf)res.wf.forEach(function(f){tg.wf.push({x:f.x+ox,y:f.y+oy,w:f.w,len:f.len,f:tg.f})});
  if(tg.win)res.win.forEach(function(p){tg.win.push([p[0]+ox,p[1]+oy,p[2]])});
  if(tg.cry)res.cr.forEach(function(p){tg.cry.push([p[0]+ox,p[1]+oy])});
  return{sp:sp,ox:ox,oy:oy}}

/* ---------- kiến trúc: mái cong, tầng tháp ---------- */
var PAL=[{w1:'#f4f1ee',w2:'#c4bfd6',pil:'#b4423e',r1:'#4fb8c6',r2:'#1f5f86',gd:'#ffd66b'},
         {w1:'#ece6f4',w2:'#b0a6d2',pil:'#5a4aa0',r1:'#8a7ae0',r2:'#3a2f8a',gd:'#ffe9a0'},
         {w1:'#f1efe4',w2:'#c1bd9e',pil:'#9a3a34',r1:'#d4764e',r2:'#7a2f36',gd:'#ffd66b'}];
function roof(q,cx,y,w,h,c1,c2){
  var L=cx-w/2,Rr=cx+w/2,t=w*.15;
  q.beginPath();q.moveTo(L-w*.05,y-h*.2);q.quadraticCurveTo(L+w*.02,y+h*.14,L+w*.13,y+h*.1);q.lineTo(Rr-w*.13,y+h*.1);q.quadraticCurveTo(Rr-w*.02,y+h*.14,Rr+w*.05,y-h*.2);
  q.quadraticCurveTo(Rr-w*.13,y-h*.04,cx+t,y-h);q.lineTo(cx-t,y-h);q.quadraticCurveTo(L+w*.13,y-h*.04,L-w*.05,y-h*.2);q.closePath();
  q.fillStyle=lg(q,0,y-h,0,y+h*.12,[0,c1,1,c2]);q.fill();q.save();q.clip();
  q.fillStyle=lg(q,L,0,Rr,0,[0,'rgba(255,255,255,.34)',.5,'rgba(255,255,255,0)',1,'rgba(0,0,40,.35)']);q.fillRect(L-8,y-h,w+16,h*1.3);
  q.strokeStyle='rgba(8,10,50,.32)';q.lineWidth=.8;for(var i=-5;i<=5;i++){q.beginPath();q.moveTo(cx+i*t/5,y-h);q.lineTo(cx+i*w*.095,y+h*.1);q.stroke()}
  q.fillStyle='rgba(8,8,40,.38)';q.fillRect(L,y,w,h*.12);q.restore();
  q.strokeStyle='rgba(255,224,150,.85)';q.lineWidth=Math.max(.8,w*.012);q.beginPath();q.moveTo(cx-t,y-h);q.lineTo(cx+t,y-h);q.stroke();
  q.fillStyle='#ffd66b';[L-w*.05,Rr+w*.05].forEach(function(x){q.beginPath();q.arc(x,y-h*.22,Math.max(1,w*.016),0,6.2832);q.fill()})}
function pagoda(q,cx,by,w,n,hh,pal,win){
  var i,k,th=hh/n;
  for(i=0;i<n;i++){
    var tw=w*(1-i*.15),y=by-i*th,ww=tw*.6,wh=th*.46;
    q.fillStyle=lg(q,cx-ww/2,0,cx+ww/2,0,[0,pal.w1,1,pal.w2]);q.fillRect(cx-ww/2,y-wh,ww,wh);
    q.fillStyle='rgba(255,208,120,.92)';q.fillRect(cx-ww*.3,y-wh*.84,ww*.6,wh*.56);
    q.strokeStyle='rgba(120,50,30,.55)';q.lineWidth=.7;q.beginPath();q.moveTo(cx,y-wh*.84);q.lineTo(cx,y-wh*.28);q.moveTo(cx-ww*.3,y-wh*.56);q.lineTo(cx+ww*.3,y-wh*.56);q.stroke();
    q.fillStyle=pal.pil;for(k=0;k<4;k++)q.fillRect(cx-ww/2+k*(ww*.92)/3,y-wh,ww*.08,wh);
    q.fillStyle='rgba(0,0,40,.25)';q.fillRect(cx-ww/2,y-wh,ww,wh*.1);
    if(win)win.push([cx,y-wh*.55,ww*.55]);
    roof(q,cx,y-wh,tw,th*.62,pal.r1,pal.r2)}
  var ty=by-n*th+th*.08;q.strokeStyle=pal.gd;q.lineWidth=Math.max(1,w*.02);q.beginPath();q.moveTo(cx,ty);q.lineTo(cx,ty-w*.34);q.stroke();
  for(k=0;k<4;k++){q.fillStyle=pal.gd;q.fillRect(cx-w*.045+k*.4,ty-w*.07-k*w*.06,w*.09-k*.8,w*.018)}
  q.fillStyle=rg(q,cx,ty-w*.38,0,w*.06,[0,'#ffffff',.5,pal.gd,1,'rgba(255,210,100,0)']);q.beginPath();q.arc(cx,ty-w*.38,w*.06,0,6.2832);q.fill()}
function bridge(q,x1,y1,x2,y2,sag,col){
  var mxp=(x1+x2)/2,cy=(y1+y2)/2+sag,i,n=14,t,x,y,pt=function(t){var a=1-t;return[a*a*x1+2*a*t*mxp+t*t*x2,a*a*y1+2*a*t*cy+t*t*y2]};
  q.lineCap='round';q.strokeStyle='rgba(20,18,60,.5)';q.lineWidth=6;q.beginPath();q.moveTo(x1,y1+4);q.quadraticCurveTo(mxp,cy+4,x2,y2+4);q.stroke();
  q.strokeStyle=col||'#d8d4ea';q.lineWidth=5;q.beginPath();q.moveTo(x1,y1);q.quadraticCurveTo(mxp,cy,x2,y2);q.stroke();
  q.strokeStyle='rgba(255,255,255,.5)';q.lineWidth=1.4;q.beginPath();q.moveTo(x1,y1-2);q.quadraticCurveTo(mxp,cy-2,x2,y2-2);q.stroke();
  q.strokeStyle='#9a3a3e';q.lineWidth=1.8;q.beginPath();q.moveTo(x1,y1-11);q.quadraticCurveTo(mxp,cy-11,x2,y2-11);q.stroke();
  q.fillStyle='#b0443e';for(i=0;i<=n;i++){t=i/n;var p=pt(t);q.fillRect(p[0]-1,p[1]-11,2,10)}
  q.fillStyle='rgba(255,196,110,.95)';[0,1].forEach(function(t){var p=pt(t);q.beginPath();q.arc(p[0],p[1]-14,2.2,0,6.2832);q.fill()})}


/* =====================  LỚP XA (thị sai 0.25)  ===================== */
var WFm,WFn,WIN,LANT,CRY,FLO,BULB,INC,GCOL=['80,240,255','255,226,122','255,210,110','200,140,255','150,230,190'];
function ridge(q,y0,amp,c1,c2,ph){var x,pts=[[0,490]];for(x=0;x<=IW+12;x+=12){var v=Math.abs(Math.sin(x*.0083+ph))*.55+Math.abs(Math.sin(x*.021+ph*2))*.3+Math.abs(Math.sin(x*.057+ph*3))*.15;pts.push([x,y0-amp*v])}pts.push([IW,490]);
  q.beginPath();pts.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();q.fillStyle=lg(q,0,y0-amp,0,490,[0,c1,1,c2]);q.fill()}
function karst(q,r,x,by,w,h,c1,c2,sd){
  var pts=[],n=9,i,t;
  for(i=0;i<=n;i++){t=i/n;pts.push([x-w/2*(1-.5*Math.pow(t,1.6))+(r()-.5)*w*.07,by-h*t*.92])}
  for(i=0;i<=5;i++){var a=Math.PI+i*Math.PI/5;pts.push([x+Math.cos(a)*w*.27,by-h*.92-Math.sin(a)*h*.08])}
  for(i=n;i>=0;i--){t=i/n;pts.push([x+w/2*(1-.5*Math.pow(t,1.6))+(r()-.5)*w*.07,by-h*t*.92])}
  rock(q,pts,c1,c2,sd,.22);
  for(i=0;i<Math.round(w/16);i++)pine(q,x+(r()-.5)*w*.44,by-h*.92-2+(r()-.5)*4,10+r()*12,'#4a8f8a','#1f4a58')}
function drawFar(q){
  var r=R(11),i;
  ridge(q,402,66,'#4a5fae','#9db0ea',1.2);
  [[70,150,64],[250,120,50],[430,175,58],[610,130,46],[790,170,62],[960,120,48],[1130,160,60],[1280,115,46]].forEach(function(k,j){
    karst(q,r,k[0],480,k[2],k[1],'#4f63b3','#98aae6',j+3)});
  ridge(q,436,52,'#3f55a4','#a6b5ea',3.1);
  for(i=0;i<110;i++){var lx=r()*IW,ly=418+r()*52;q.fillStyle='rgba(255,'+(200+r()*40|0)+',140,'+(.35+r()*.5)+')';q.fillRect(lx,ly,1.4,1.4)}
  var tg={c:B.c,f:.25};
  [[225,210,76,{pg:1,pgw:26,pgn:2,pgh:30,tr:3,sd:2}],[470,150,52,{tr:2,sd:4}],[640,255,44,{tr:2,sd:6}],[890,175,64,{pg:1,pgw:24,pgn:3,pgh:36,tr:3,sd:8}],
   [1100,238,84,{pg:1,pgw:30,pgn:2,pgh:34,tr:4,cr:2,sd:10}],[1290,172,54,{tr:2,sd:12}],[40,240,56,{tr:2,sd:14}]].forEach(function(d){
    var o=d[3];o.hz='rgba(120,140,225,.5)';o.r1='#7b86ba';o.r2='#363a76';putIsland(q,tg,d[0],d[1],d[2],d[2]*.7,o)})}

/* =====================  LỚP GIỮA (thị sai 0.55) · CUNG ĐIỆN  ===================== */
function palace(q,cx,by,win){
  var P0=PAL[0],P1=PAL[1];
  q.fillStyle=lg(q,0,by-16,0,by+6,[0,'#eef1ff',1,'#8d96c8']);q.beginPath();q.moveTo(cx-196,by+6);q.lineTo(cx-170,by-14);q.lineTo(cx+170,by-14);q.lineTo(cx+196,by+6);q.closePath();q.fill();
  q.strokeStyle='rgba(30,30,90,.3)';q.lineWidth=.8;for(var i=1;i<4;i++){q.beginPath();q.moveTo(cx-196+i*6,by+6-i*5);q.lineTo(cx+196-i*6,by+6-i*5);q.stroke()}
  pagoda(q,cx-224,by-10,66,2,70,P1,win);pagoda(q,cx+224,by-10,66,2,70,P1,win);
  /* hành lang cột */
  q.fillStyle=lg(q,0,by-56,0,by-14,[0,'#f6f3f8',1,'#b9b4d4']);q.fillRect(cx-170,by-52,340,38);
  for(var k=0;k<18;k++){var x=cx-168+k*19.8;q.fillStyle='rgba(255,206,120,.9)';q.fillRect(x+3,by-44,12,24);q.fillStyle=P0.pil;q.fillRect(x,by-52,3.5,38);if(k%2===0)win.push([x+9,by-32,10])}
  roof(q,cx,by-52,360,24,P0.r1,P0.r2);
  pagoda(q,cx-124,by-14,100,3,112,P0,win);pagoda(q,cx+124,by-14,100,3,112,P0,win);
  pagoda(q,cx,by-14,158,5,232,P0,win)}
function drawMid(q){
  var tg={c:B.c,f:.55,wf:WFm,win:WIN,cry:FLO.cr},hz='rgba(150,170,235,.14)';
  putIsland(q,tg,660,394,380,200,{sd:5,r1:'#8b93bd',r2:'#2a2c5a',tr:0,vine:9,chain:1,deb:7,wf:[[-.62,110,9],[.05,120,14],[.64,104,8]],hz:hz,up:30});
  palace(q,660,392,WIN);
  putIsland(q,tg,105,352,240,230,{sd:21,pond:1,sak:2,deb:6,chain:1,pg:1,px:.04,pgw:92,pgn:3,pgh:116,tr:5,bush:1,wf:[[.55,116,10]],vine:7,hz:hz,up:200});
  putIsland(q,tg,1195,346,250,240,{sd:33,bam:1,pond:1,deb:6,pg:1,px:-.06,pgw:106,pgn:4,pgh:146,pal:1,tr:5,cr:3,wf:[[-.5,120,10]],vine:8,hz:hz,up:230});
  putIsland(q,tg,330,404,140,110,{sd:44,sak:1,deb:3,pg:1,pgw:58,pgn:2,pgh:68,pal:2,tr:3,wf:[[.3,64,6]],hz:hz,up:120});
  putIsland(q,tg,990,406,146,112,{sd:55,pond:1,bam:1,deb:3,chain:1,pg:1,pgw:64,pgn:3,pgh:90,pal:1,tr:3,cr:2,wf:[[-.3,66,6]],hz:hz,up:140});
  bridge(q,206,358,262,406,-6);bridge(q,396,406,486,398,-16);bridge(q,834,398,922,408,-16);bridge(q,1060,410,1086,360,-4)}

/* =====================  LỚP GẦN (thị sai 1.0)  ===================== */
var YB=455,YF=618;
function cliff(q){
  var r=R(77),pts=[[0,636]],x,i;
  for(x=0;x<=IW;x+=26){var d=Math.abs(Math.sin(x*.013+1))*44+Math.abs(Math.sin(x*.041))*30;pts.push([x,696+d+(r()<.22?r()*36:0)])}
  pts.push([IW,636]);rock(q,pts,'#6b75a8','#1b1d46',91,.3);
  for(i=0;i<34;i++){var sx=r()*IW,sw=10+r()*26,sh=26+r()*70,by0=700+Math.abs(Math.sin(sx*.013+1))*44;
    rock(q,[[sx-sw,by0-8],[sx-sw*.3,by0+sh*.6],[sx+(r()-.5)*5,by0+sh],[sx+sw*.35,by0+sh*.55],[sx+sw,by0-8]],'#5a6498','#1a1c42',100+i,.25)}
  q.fillStyle='rgba(70,150,100,.65)';for(x=0;x<IW;x+=7){q.beginPath();q.ellipse(x,640+r()*4,5,3+r()*5,0,0,6.2832);q.fill()}
  q.strokeStyle='rgba(80,160,100,.65)';q.lineWidth=1.4;for(i=0;i<46;i++){var vx=r()*IW,vl=14+r()*54;q.beginPath();q.moveTo(vx,642);q.quadraticCurveTo(vx+(r()-.5)*10,642+vl*.6,vx+(r()-.5)*6,642+vl);q.stroke()}
  for(i=0;i<14;i++){var cx=60+i*92+r()*50,cy=668+r()*46,cr=GCOL[i%5];crystal(q,cx,cy,9+r()*7,22+r()*26,'#ecfcff','#3a8ae0');CRY.push([cx,cy-14,cr])}}
function plaza(q){
  var x,i,n=10;
  q.fillStyle=lg(q,0,YB,0,YF,[0,'#b4c2ec',.35,'#8d9fd6',1,'#5f72b6']);q.fillRect(0,YB,IW,YF-YB);
  q.save();q.beginPath();q.rect(0,YB,IW,YF-YB);q.clip();
  q.lineWidth=1;for(i=1;i<n;i++){var y=YB+(YF-YB)*Math.pow(i/n,1.55);q.strokeStyle='rgba(20,30,90,.3)';q.beginPath();q.moveTo(0,y);q.lineTo(IW,y);q.stroke();q.strokeStyle='rgba(255,255,255,.18)';q.beginPath();q.moveTo(0,y+1);q.lineTo(IW,y+1);q.stroke()}
  for(x=-1500;x<=2800;x+=110){var xb=660+(x-660)*1.228;q.strokeStyle='rgba(20,30,90,.28)';q.beginPath();q.moveTo(x,YB);q.lineTo(xb,YF);q.stroke();q.strokeStyle='rgba(255,255,255,.14)';q.beginPath();q.moveTo(x+1.5,YB);q.lineTo(xb+1.5,YF);q.stroke()}
  /* trận pháp khắc chìm giữa sân */
  var cx=660,cy=556;
  [[430,60,2],[408,57,1],[300,41,1.4],[270,37,1],[120,17,1.6]].forEach(function(e){q.strokeStyle='rgba(255,232,170,.55)';q.lineWidth=e[2];el(q,cx,cy,e[0],e[1]);q.stroke()});
  for(i=0;i<36;i++){var a=i*6.2832/36,c1=Math.cos(a),s1=Math.sin(a);q.strokeStyle='rgba(255,232,170,'+(i%3?.28:.55)+')';q.lineWidth=1;q.beginPath();q.moveTo(cx+c1*300,cy+s1*41);q.lineTo(cx+c1*(i%3?345:408),cy+s1*(i%3?47:57));q.stroke()}
  for(i=0;i<8;i++){var a2=i*.7854+.39;q.strokeStyle='rgba(255,232,170,.4)';q.beginPath();q.moveTo(cx+Math.cos(a2)*120,cy+Math.sin(a2)*17);q.lineTo(cx+Math.cos(a2)*270,cy+Math.sin(a2)*37);q.stroke()}
  q.fillStyle=rg(q,cx,cy,0,130,[0,'rgba(255,240,200,.35)',1,'rgba(255,240,200,0)']);el(q,cx,cy,130,26);q.fill();
  q.restore();
  el(q,660,540,IW,150);q.save();q.beginPath();q.rect(0,YB,IW,YF-YB);q.clip();el(q,660,545,IW*.75,150);grain(q,.3);q.restore();
  /* mặt trước sàn */
  q.fillStyle=lg(q,0,YF,0,YF+24,[0,'#c4cff0',1,'#56628e']);q.fillRect(0,YF,IW,24);
  q.strokeStyle='rgba(20,24,70,.35)';q.lineWidth=1;for(x=0;x<IW;x+=44){q.beginPath();q.moveTo(x,YF);q.lineTo(x,YF+24);q.stroke()}
  q.beginPath();q.moveTo(0,YF+12);q.lineTo(IW,YF+12);q.stroke();
  q.fillStyle='rgba(240,250,255,.85)';q.fillRect(0,YF,IW,1.8);q.fillStyle='rgba(120,230,255,.4)';q.fillRect(0,YF+22,IW,1.5);
  q.beginPath();q.rect(0,YF,IW,24);q.save();q.clip();grain(q,.4);q.restore()}
function lantern(q,x,y,sc){
  stoneBox(q,x-7*sc,y-6*sc,14*sc,6*sc,'#d0d8f2','#8f9ac8');stoneBox(q,x-2.5*sc,y-26*sc,5*sc,20*sc,'#c4cdee','#8590c0');
  stoneBox(q,x-9*sc,y-34*sc,18*sc,9*sc,'#d8e0f8','#9aa4d2');
  q.fillStyle=lg(q,0,y-48*sc,0,y-34*sc,[0,'#fff3c4',1,'#ffb54e']);q.fillRect(x-6.5*sc,y-47*sc,13*sc,13*sc);
  q.strokeStyle='rgba(90,50,20,.6)';q.lineWidth=.8;q.beginPath();q.moveTo(x,y-47*sc);q.lineTo(x,y-34*sc);q.moveTo(x-6.5*sc,y-40*sc);q.lineTo(x+6.5*sc,y-40*sc);q.stroke();
  roof(q,x,y-47*sc,28*sc,11*sc,'#7a86bc','#3a4280');q.fillStyle='#ffd66b';q.beginPath();q.arc(x,y-60*sc,2*sc,0,6.2832);q.fill();LANT.push([x,y-40*sc,sc])}
function parapet(q){
  var x,i;stoneBox(q,0,440,IW,16,'#d8e0fa','#8f9bd0');
  q.strokeStyle='rgba(20,30,90,.3)';q.lineWidth=1;for(x=10;x<IW;x+=22){q.strokeRect(x,444,14,8)}
  stoneBox(q,0,435,IW,6,'#f0f4ff','#a8b4e2');
  for(i=0,x=40;x<IW;x+=110,i++){stoneBox(q,x-7,420,14,36,'#e4eafc','#98a4d4');q.fillStyle=rg(q,x,418,0,6,[0,'#ffffff',1,'#b8c6f0']);q.beginPath();q.arc(x,418,6,0,6.2832);q.fill();if(i%2===0)lantern(q,x,420,.78);if(x+110<IW){var x2=x+110,k;q.strokeStyle='rgba(255,226,160,.7)';q.lineWidth=1;q.beginPath();q.moveTo(x,414);q.quadraticCurveTo((x+x2)/2,438,x2,414);q.stroke();
    for(k=1;k<=5;k++){var u=k/6,bx=x+(x2-x)*u,by2=414+Math.sin(u*3.1416)*12;q.fillStyle='#fff1c0';q.beginPath();q.arc(bx,by2+1,1.7,0,6.2832);q.fill();BULB.push([bx,by2+1])}}}}
/* ---------- khung cổng ---------- */
var GST=[null,
 {a:'#f2f4ff',b:'#a2acd6',trim:'#f4d878',r1:'#58c0cc',r2:'#1f5f86',gl:'255,226,122',emb:'taiji',h:342},
 {a:'#c04048',b:'#601c28',trim:'#ffd36a',r1:'#3e4a8a',r2:'#161a42',gl:'255,210,110',emb:'sword',h:336},
 {a:'#6a4aa0',b:'#2a1a56',trim:'#dcb0ff',r1:'#8a5cd8',r2:'#321a68',gl:'200,140,255',emb:'crys',h:354},
 {a:'#52b498',b:'#205c54',trim:'#c4f8de',r1:'#38a078',r2:'#14503f',gl:'150,230,190',emb:'lotus',h:352}];
function taiji(q,x,y,r){q.fillStyle='#f6f8ff';q.beginPath();q.arc(x,y,r,0,6.2832);q.fill();q.fillStyle='#1a1c3c';q.beginPath();q.arc(x,y,r,-1.5708,1.5708);q.arc(x,y+r/2,r/2,1.5708,-1.5708,true);q.arc(x,y-r/2,r/2,1.5708,-1.5708,false);q.fill();
  q.fillStyle='#f6f8ff';q.beginPath();q.arc(x,y-r/2,r*.14,0,6.2832);q.fill();q.fillStyle='#1a1c3c';q.beginPath();q.arc(x,y+r/2,r*.14,0,6.2832);q.fill();q.strokeStyle='#f4d878';q.lineWidth=1.2;q.beginPath();q.arc(x,y,r+1,0,6.2832);q.stroke()}
function swords(q,x,y,L){[-1,1].forEach(function(d){q.save();q.translate(x,y);q.rotate(d*.62);q.fillStyle=lg(q,-3,0,3,0,[0,'#ffffff',1,'#9aa8c8']);q.beginPath();q.moveTo(0,-L/2);q.lineTo(3.2,-L/2+8);q.lineTo(2.6,L/2-6);q.lineTo(-2.6,L/2-6);q.lineTo(-3.2,-L/2+8);q.closePath();q.fill();
  q.fillStyle='#ffd36a';q.fillRect(-7,L/2-7,14,3);q.fillStyle='#7a2a30';q.fillRect(-1.6,L/2-4,3.2,8);q.restore()})}
function lotus(q,x,y,r,c){for(var i=-2;i<=2;i++){q.save();q.translate(x,y);q.rotate(i*.42);q.fillStyle=lg(q,0,-r,0,0,[0,'#ffffff',1,c]);q.beginPath();q.ellipse(0,-r*.55,r*.3,r*.58,0,0,6.2832);q.fill();q.restore()}}
function gateFrame(q,x,i){
  var st=GST[i],by=520,mid=mx(st.a,st.b,.5),d,k;
  q.fillStyle='rgba(8,12,50,.4)';el(q,x,by+5,104,11);q.fill();
  stoneBox(q,x-98,by-9,196,13,'#dfe6fa','#8794c8');stoneBox(q,x-86,by-21,172,12,'#e6ecfd','#96a2d2');
  [-1,1].forEach(function(d){
    var px=x+d*63;q.fillStyle=lg(q,px-11,0,px+11,0,[0,st.a,.55,mid,1,st.b]);q.fillRect(px-11,st.h+30,22,by-21-st.h-30);
    q.fillStyle=st.trim;for(k=0;k<6;k++)q.fillRect(px-11,st.h+44+k*24,22,2.4);
    q.fillStyle='rgba(255,255,255,.3)';q.fillRect(px-11,st.h+30,3,by-21-st.h-30);q.fillStyle='rgba(0,0,40,.35)';q.fillRect(px+8,st.h+30,3,by-21-st.h-30);
    stoneBox(q,px-16,st.h+24,32,9,st.a,st.b);stoneBox(q,px-16,by-30,32,9,st.a,st.b);
    q.fillStyle='rgba('+st.gl+',.9)';for(k=0;k<4;k++){q.beginPath();q.moveTo(px,st.h+60+k*24);q.lineTo(px+3,st.h+66+k*24);q.lineTo(px,st.h+72+k*24);q.lineTo(px-3,st.h+66+k*24);q.closePath();q.fill()}
    /* tinh thể dưới chân */
    crystal(q,x+d*92,by-8,13,34,'#f6ffff',i===3?'#8a4ad8':i===4?'#3aa890':i===2?'#e0a840':'#e8c860');crystal(q,x+d*79,by-8,9,22,'#f6ffff',i===3?'#6a3ab8':i===4?'#2a8870':i===2?'#c08830':'#d0a840');CRY.push([x+d*92,by-26,st.gl])});
  /* hốc cổng + vòng kim loại */
  q.fillStyle=rg(q,x,PCY,0,66,[0,'#10206a',.6,'#0a1248',1,'#04071c']);el(q,x,PCY,43,64);q.fill();
  q.strokeStyle=lg(q,x-48,0,x+48,0,[0,st.trim,.5,'#ffffff',1,st.trim]);q.lineWidth=9;el(q,x,PCY,46,67);q.stroke();
  q.strokeStyle='rgba(20,20,60,.5)';q.lineWidth=1.2;el(q,x,PCY,50.5,71.5);q.stroke();el(q,x,PCY,41.5,62.5);q.stroke();
  for(k=0;k<12;k++){var a=k*.5236;q.fillStyle='rgba('+st.gl+',.95)';q.beginPath();q.arc(x+Math.cos(a)*46,PCY+Math.sin(a)*67,2,0,6.2832);q.fill()}
  /* xà ngang + biển + mái */
  stoneBox(q,x-80,st.h+28,160,12,st.a,st.b);q.fillStyle=st.trim;q.fillRect(x-80,st.h+38,160,2);
  q.fillStyle=lg(q,x-28,0,x+28,0,[0,st.b,.5,mx(st.b,st.a,.2),1,st.b]);q.fillRect(x-30,st.h+22,60,28);q.strokeStyle=st.trim;q.lineWidth=1.6;q.strokeRect(x-30,st.h+22,60,28);
  if(st.emb==='taiji')taiji(q,x,st.h+36,10);else if(st.emb==='sword')swords(q,x,st.h+36,28);
  else if(st.emb==='crys'){crystal(q,x,st.h+48,12,26,'#f4e6ff','#a05ae8');crystal(q,x-12,st.h+48,8,16,'#f4e6ff','#7a3ad0');crystal(q,x+12,st.h+48,8,16,'#f4e6ff','#7a3ad0')}
  else lotus(q,x,st.h+47,12,'#bff5d8');
  roof(q,x,st.h+24,196,38,st.r1,st.r2);roof(q,x,st.h+2,98,24,st.r1,st.r2);
  q.fillStyle=rg(q,x,st.h-26,0,8,[0,'#ffffff',.5,st.trim,1,'rgba(255,255,255,0)']);q.beginPath();q.arc(x,st.h-26,8,0,6.2832);q.fill();
  q.strokeStyle=st.trim;q.lineWidth=2;q.beginPath();q.moveTo(x,st.h-4);q.lineTo(x,st.h-24);q.stroke();
  [-1,1].forEach(function(d){q.strokeStyle='rgba('+st.gl+',.9)';q.lineWidth=1;q.beginPath();q.moveTo(x+d*92,st.h+36);q.lineTo(x+d*92,st.h+52);q.stroke();q.fillStyle=rg(q,x+d*92,st.h+56,0,6,[0,'#ffffff',.5,'rgb('+st.gl+')',1,'rgba('+st.gl+',0)']);q.beginPath();q.arc(x+d*92,st.h+56,6,0,6.2832);q.fill()});
  q.save();q.beginPath();q.rect(x-100,st.h-30,200,by-st.h+30);q.clip();q.beginPath();q.rect(x-100,st.h-30,200,by-st.h+30);grain(q,.18);q.restore()}
/* ---------- tượng chiến thần có cánh (cổng 1 · Chiến Trường) ---------- */
function statue(q,x,by){
  var gy=by-30,d,i;
  q.fillStyle='rgba(8,12,50,.4)';el(q,x,by+4,70,9);q.fill();
  stoneBox(q,x-62,by-10,124,12,'#dfe6fa','#8794c8');stoneBox(q,x-48,by-20,96,11,'#e8eefe','#98a4d4');stoneBox(q,x-34,by-30,68,11,'#eef3ff','#a4b0dc');
  q.fillStyle='rgba(95,240,255,.8)';q.fillRect(x-62,by-4,124,1.6);q.fillRect(x-34,by-24,68,1.6);
  /* cánh */
  [-1,1].forEach(function(d){
    q.fillStyle=lg(q,x,gy-110,x+d*70,gy-40,[0,'#f4ffff',.5,'#a8e8fa',1,'#4aa0d8']);q.beginPath();q.moveTo(x+d*9,gy-76);
    q.bezierCurveTo(x+d*46,gy-128,x+d*84,gy-118,x+d*86,gy-104);q.bezierCurveTo(x+d*92,gy-84,x+d*78,gy-58,x+d*60,gy-46);q.bezierCurveTo(x+d*44,gy-38,x+d*24,gy-48,x+d*10,gy-62);q.closePath();q.fill();
    q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=1;for(i=0;i<6;i++){q.beginPath();q.moveTo(x+d*(14+i*3),gy-74+i*3);q.quadraticCurveTo(x+d*(46+i*7),gy-100+i*8,x+d*(84-i*4),gy-102+i*9);q.stroke()}
    q.strokeStyle='rgba(20,70,130,.35)';for(i=0;i<5;i++){q.beginPath();q.moveTo(x+d*(20+i*4),gy-58-i*2);q.quadraticCurveTo(x+d*(48+i*6),gy-70+i*3,x+d*(66+i*3),gy-54+i*2);q.stroke()}});
  /* thân giáp + váy */
  q.fillStyle=lg(q,x-24,0,x+24,0,[0,'#f2ffff',.5,'#9ad8f0',1,'#3a82bc']);
  q.beginPath();q.moveTo(x-9,gy-92);q.lineTo(x+9,gy-92);q.lineTo(x+17,gy-78);q.lineTo(x+13,gy-52);q.lineTo(x+27,gy);q.quadraticCurveTo(x,gy+5,x-27,gy);q.lineTo(x-13,gy-52);q.lineTo(x-17,gy-78);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.55)';q.beginPath();q.moveTo(x-10,gy-88);q.lineTo(x+1,gy-90);q.lineTo(x-3,gy-56);q.lineTo(x-12,gy-54);q.closePath();q.fill();
  q.fillStyle='#ffe27a';q.fillRect(x-14,gy-56,28,3.5);q.beginPath();q.moveTo(x,gy-78);q.lineTo(x+4,gy-72);q.lineTo(x,gy-66);q.lineTo(x-4,gy-72);q.closePath();q.fill();
  [-1,1].forEach(function(d){q.fillStyle=lg(q,x+d*14,0,x+d*26,0,[0,'#e6fbff',1,'#58a8d8']);q.beginPath();q.ellipse(x+d*19,gy-84,9,5.5,d*.4,0,6.2832);q.fill()});
  /* kiếm cắm trước người + hai tay */
  q.fillStyle=lg(q,x-3,0,x+3,0,[0,'#ffffff',1,'#8fd0f0']);q.beginPath();q.moveTo(x,gy-4);q.lineTo(x+4,gy-66);q.lineTo(x,gy-74);q.lineTo(x-4,gy-66);q.closePath();q.fill();
  q.fillStyle='#ffd36a';q.fillRect(x-11,gy-62,22,3.5);q.fillStyle='#fff';q.fillRect(x-1.6,gy-72,3.2,10);
  q.fillStyle='#d8f6ff';q.beginPath();q.ellipse(x-7,gy-60,4,3,0,0,6.2832);q.ellipse(x+7,gy-60,4,3,0,0,6.2832);q.fill();
  /* đầu, mũ, vòng hào quang */
  q.fillStyle='#e8fbff';q.beginPath();q.arc(x,gy-100,7.5,0,6.2832);q.fill();
  q.fillStyle=lg(q,x-9,0,x+9,0,[0,'#ffffff',1,'#7ac0e8']);q.beginPath();q.arc(x,gy-102,8.5,3.14,0);q.lineTo(x+8.5,gy-98);q.lineTo(x-8.5,gy-98);q.closePath();q.fill();
  q.fillStyle='#ffe27a';q.beginPath();q.moveTo(x-2,gy-110);q.quadraticCurveTo(x,gy-124,x+3,gy-110);q.closePath();q.fill();
  q.strokeStyle='rgba(120,240,255,.9)';q.lineWidth=1.6;el(q,x,gy-104,22,22);q.stroke();q.lineWidth=.8;q.strokeStyle='rgba(255,255,255,.9)';el(q,x,gy-104,25,25);q.stroke();
  q.save();q.beginPath();q.rect(x-100,gy-130,200,140);q.clip();q.beginPath();q.rect(x-100,gy-130,200,140);grain(q,.15);q.restore()}
/* ---------- đài Về Làng (65 vẽ xoáy sáng đè lên) ---------- */
function dais(q,x,y){
  q.fillStyle='rgba(8,12,50,.4)';el(q,x,y+10,70,12);q.fill();
  q.fillStyle=lg(q,0,y-4,0,y+12,[0,'#d8e2f8',1,'#6c7aac']);el(q,x,y+6,62,17);q.fill();
  q.fillStyle=lg(q,0,y-14,0,y+6,[0,'#eef3ff',1,'#9aa8d8']);el(q,x,y,62,17);q.fill();
  q.strokeStyle='rgba(120,255,200,.8)';q.lineWidth=1.6;el(q,x,y,50,13.5);q.stroke();q.lineWidth=1;q.strokeStyle='rgba(120,255,200,.5)';el(q,x,y,34,9);q.stroke();
  for(var i=0;i<8;i++){var a=i*.7854;q.beginPath();q.moveTo(x+Math.cos(a)*34,y+Math.sin(a)*9);q.lineTo(x+Math.cos(a)*50,y+Math.sin(a)*13.5);q.stroke()}}
/* ---------- anh đào ---------- */
function taper(q,pts,w0,w1,col){var i,n=pts.length-1;q.lineCap='round';q.strokeStyle=col;for(i=0;i<n;i++){q.lineWidth=w0+(w1-w0)*i/n;q.beginPath();q.moveTo(pts[i][0],pts[i][1]);q.lineTo(pts[i+1][0],pts[i+1][1]);q.stroke()}}
function bez(p0,p1,p2,p3,n){var o=[],i,t,a;for(i=0;i<=n;i++){t=i/n;a=1-t;o.push([a*a*a*p0[0]+3*a*a*t*p1[0]+3*a*t*t*p2[0]+t*t*t*p3[0],a*a*a*p0[1]+3*a*a*t*p1[1]+3*a*t*t*p2[1]+t*t*t*p3[1]])}return o}
function blossom(q,cx,cy,rad,n,r){
  var COL=['#a8407a','#d86a9e','#f492bc','#ffc0d8','#fff0f6'],i;
  for(i=0;i<n;i++){var a=r()*6.2832,dd=Math.sqrt(r())*rad,bx=cx+Math.cos(a)*dd,by=cy+Math.sin(a)*dd*.78,sh=(-(bx-cx)/rad*.45-(by-cy)/rad*.55)+.45+(r()-.5)*.5;
    var ci=Math.max(0,Math.min(4,Math.round(sh*4))),rr=2.6+r()*5.4;q.fillStyle=rg(q,bx-rr*.3,by-rr*.3,0,rr,[0,COL[Math.min(4,ci+1)],1,COL[ci]]);q.beginPath();q.arc(bx,by,rr,0,6.2832);q.fill()}}
function sakura(q,x,by,sc,dir,sd){
  var r=R(sd),tr=[bez([x,by],[x+dir*10*sc,by-60*sc],[x+dir*40*sc,by-110*sc],[x+dir*34*sc,by-170*sc],18)],cl=[],i;
  taper(q,tr[0],17*sc,6*sc,'#3a2630');taper(q,tr[0].map(function(p){return[p[0]-2*sc,p[1]]}),5*sc,1.6*sc,'rgba(150,100,110,.5)');
  var tips=[[x+dir*130*sc,by-250*sc,.7],[x+dir*60*sc,by-290*sc,.9],[x-dir*20*sc,by-240*sc,.8],[x+dir*150*sc,by-170*sc,.7],[x+dir*10*sc,by-190*sc,.6]];
  tips.forEach(function(t,j){taper(q,bez([x+dir*34*sc,by-150*sc],[x+dir*50*sc,by-170*sc],[(x+t[0])/2,t[1]+40*sc],[t[0],t[1]],12),6*sc,1.4*sc,'#3a2630')});
  /* tán hoa: lớp tối → sáng */
  tips.forEach(function(t,j){var rad=(70+r()*24)*sc*t[2];blossom(q,t[0]+dir*6*sc,t[1]+12*sc,rad,52,r)});
  tips.forEach(function(t,j){var rad=(50+r()*20)*sc*t[2];blossom(q,t[0]-6*sc,t[1]-6*sc,rad,46,r)});
  q.fillStyle='#ffffff';for(i=0;i<22;i++){var t2=tips[i%5];q.globalAlpha=.7;q.beginPath();q.arc(t2[0]+(r()-.5)*90*sc,t2[1]+(r()-.5)*70*sc,1+r()*1.6,0,6.2832);q.fill()}q.globalAlpha=1}
function flowers(q,x,by,w,sd){var r=R(sd),i;for(i=0;i<9;i++){var bx=x+(i/8)*w+(r()-.5)*10;bush(q,bx,by+r()*6,13+r()*9,'#a0e090','#2f7a52',r)}
  for(i=0;i<34;i++){var fx=x+r()*w,fy=by-8-r()*26,cc=['#ffc0dc','#ffffff','#ff94c4','#d8b0ff'][i%4];q.fillStyle=cc;q.beginPath();q.arc(fx,fy,1.8+r()*2,0,6.2832);q.fill()}}
function censer(q,x,y){
  q.fillStyle='rgba(8,12,50,.4)';el(q,x,y+3,24,5);q.fill();
  q.strokeStyle='#6a4a22';q.lineWidth=3;[-1,0,1].forEach(function(d){q.beginPath();q.moveTo(x+d*11,y-12);q.lineTo(x+d*15,y+1);q.stroke()});
  q.fillStyle=lg(q,x-20,0,x+20,0,[0,'#e8c070',.5,'#a87a30',1,'#5a3a14']);q.beginPath();q.ellipse(x,y-16,19,11,0,0,3.1416);q.lineTo(x-19,y-18);q.lineTo(x+19,y-18);q.closePath();q.fill();
  q.fillStyle='#f0d088';el(q,x,y-18,19,5);q.fill();q.fillStyle='#2a1a10';el(q,x,y-18.4,15,3.4);q.fill();
  q.fillStyle='#ffb85a';[-8,-3,3,8].forEach(function(d){q.fillRect(x+d-.6,y-24,1.2,6)});INC.push([x,y-24])}
function homeGate(q){
  var x=110,cy=526,by=592,k;
  /* lối đá dẫn ra cổng */
  for(k=0;k<4;k++){q.fillStyle=lg(q,0,by+8+k*5,0,by+13+k*5,[0,'#dce6fa',1,'#8f9cd0']);el(q,x,by+10+k*4.5,48-k*6,6-k*.6);q.fill()}
  /* trụ gỗ-ngọc */
  [-1,1].forEach(function(d){var px=x+d*47;
    q.fillStyle=lg(q,px-8,0,px+8,0,[0,'#4fbf8a',.55,'#2a8a62',1,'#12503c']);q.fillRect(px-8,468,16,by-6-468);
    q.fillStyle='#ffd66b';for(k=0;k<5;k++)q.fillRect(px-8,486+k*20,16,2.2);q.fillStyle='rgba(255,255,255,.3)';q.fillRect(px-8,468,2.6,by-6-468);
    stoneBox(q,px-12,by-14,24,10,'#e6edff','#8a98ca');stoneBox(q,px-11,464,22,7,'#d8f4e4','#5aa888');
    /* bên trụ: lá tre */
    for(k=0;k<7;k++){var yy=by-30-k*17;q.strokeStyle='rgba(60,150,90,.9)';q.lineWidth=1.6;q.beginPath();q.moveTo(px+d*8,yy);q.quadraticCurveTo(px+d*20,yy-6,px+d*28,yy+3);q.stroke()}});
  /* vòng cổng */
  q.fillStyle=rg(q,x,cy,0,62,[0,'#fff3d8',.55,'#ffd9a8',1,'#6ac08a']);el(q,x,cy,31,59);q.fill();
  q.strokeStyle=lg(q,x-36,0,x+36,0,[0,'#ffe9a0',.5,'#ffffff',1,'#f0c860']);q.lineWidth=7;el(q,x,cy,34,62);q.stroke();
  q.strokeStyle='rgba(20,60,40,.55)';q.lineWidth=1;el(q,x,cy,38,66);q.stroke();el(q,x,cy,30.5,58);q.stroke();
  /* biển + mái hai tầng */
  stoneBox(q,x-52,468,104,9,'#3aa878','#165a44');q.fillStyle='#ffd66b';q.fillRect(x-52,476,104,1.8);
  q.fillStyle=lg(q,0,452,0,470,[0,'#1c5c48',1,'#2f8a68']);q.fillRect(x-24,452,48,17);q.strokeStyle='#ffd66b';q.lineWidth=1.4;q.strokeRect(x-24,452,48,17);
  q.fillStyle='#ffe9a0';q.font='bold 14px KTH Serif,Songti SC,STKaiti,serif';q.textAlign='center';q.textBaseline='middle';q.fillText('歸',x-9,461);q.font='bold 11px KTH Serif,Songti SC,STKaiti,serif';q.fillText('鄉',x+9,461.5);
  roof(q,x,452,142,28,'#52c08a','#1c6a52');roof(q,x,432,70,18,'#52c08a','#1c6a52');
  q.fillStyle=rg(q,x,408,0,7,[0,'#ffffff',.5,'#9affc8',1,'rgba(150,255,200,0)']);q.beginPath();q.arc(x,408,7,0,6.2832);q.fill();q.strokeStyle='#ffd66b';q.lineWidth=1.6;q.beginPath();q.moveTo(x,414);q.lineTo(x,430);q.stroke();
  /* đèn lồng đỏ treo hai bên */
  [-1,1].forEach(function(d){var lx=x+d*62;q.strokeStyle='#caa050';q.lineWidth=1;q.beginPath();q.moveTo(lx,462);q.lineTo(lx,470);q.stroke();
    q.fillStyle=rg(q,lx,480,0,12,[0,'#ffd08a',.5,'#e8503a',1,'#9a2230']);el(q,lx,480,8,11);q.fill();q.fillStyle='#ffd66b';q.fillRect(lx-3,468,6,2.4);q.fillRect(lx-3,490,6,2.4);LANT.push([lx,480,.55])});
  /* đèn đá hai bên lối */
  lantern(q,x-70,604,.62);lantern(q,x+76,606,.62)}
function drawNear(q){
  cliff(q);plaza(q);parapet(q);
  dais(q,110,592);statue(q,206,520);censer(q,338,600);censer(q,1100,600);
  for(var i=1;i<=4;i++)gateFrame(q,Math.round(FX[i]*IW),i);
  flowers(q,0,612,190,5);flowers(q,1140,612,180,6);
  sakura(q,22,566,.58,1,31);sakura(q,1302,566,.56,-1,42);homeGate(q)}


/* =====================  DỰNG CACHE  ===================== */
var NEB=null,STARS=[],FARCL=[],MIDCL=[],SEACL=[],FLT=[],WFC=[],PET=[],FIRE=[];
function mkCloud(w,h,sd,rgb,sh){return spr(w,h,1,function(q){var r=R(sd),n=18,i;
  for(i=0;i<n;i++){var u=(i+.5)/n,x=w*(.08+.84*u),bump=Math.sin(u*3.14159),rad=h*(.26+.3*bump*(.55+.45*r())),y=h*.64-bump*h*.2*(.4+r()*.7);
    q.fillStyle=rg(q,x,y,0,rad,[0,'rgba('+rgb+',.95)',.5,'rgba('+rgb+',.55)',1,'rgba('+rgb+',0)']);q.beginPath();q.arc(x,y,rad,0,6.2832);q.fill()}
  q.globalCompositeOperation='source-atop';q.fillStyle=lg(q,0,h*.18,0,h*.95,[0,'rgba('+sh+',0)',1,'rgba('+sh+',.62)']);q.fillRect(0,0,w,h)})}
function mkNebula(){return spr(IW,760,.5,function(q){
  var r=R(5),i;q.scale(1,1);
  for(i=0;i<170;i++){var x=r()*IW,y=60+x*.2+(r()-.5)*190,c=['150,120,255','80,160,255','255,150,220','90,220,230'][i%4],rad=40+r()*110;
    q.fillStyle=rg(q,x,y,0,rad,[0,'rgba('+c+','+(.05+r()*.05)+')',1,'rgba('+c+',0)']);q.beginPath();q.arc(x,y,rad,0,6.2832);q.fill()}
  for(i=0;i<420;i++){var sx=r()*IW,sy=40+sx*.2+(r()-.5)*150;q.fillStyle='rgba(225,235,255,'+(.2+r()*.5)+')';q.fillRect(sx,sy,1.3,1.3)}
  /* trăng lớn */
  var mxp=1010,myp=250;q.fillStyle=rg(q,mxp,myp,50,170,[0,'rgba(190,215,255,.35)',1,'rgba(190,215,255,0)']);q.beginPath();q.arc(mxp,myp,170,0,6.2832);q.fill();
  q.fillStyle=rg(q,mxp-14,myp-14,4,58,[0,'#ffffff',.55,'#e4edff',1,'#a8b8e8']);q.beginPath();q.arc(mxp,myp,56,0,6.2832);q.fill();
  q.fillStyle='rgba(120,140,200,.35)';[[-18,-8,13],[14,12,17],[-4,24,8],[22,-20,9],[-26,16,6]].forEach(function(c){q.beginPath();q.arc(mxp+c[0],myp+c[1],c[2],0,6.2832);q.fill()})})}
function build(c){
  NZ=NZ||noise();WFm=[];WFn=[];WIN=[];LANT=[];CRY=[];BULB=[];INC=[];FLO={cr:[]};
  B={c:c};
  var r=R(99),i;
  B.far=lay(0,60,IW,430,c,drawFar);B.mid=lay(0,70,IW,440,c,drawMid);B.near=lay(0,170,IW,640,c,drawNear);
  NEB=mkNebula();
  CLS=[mkCloud(420,150,1,'236,242,255','118,138,214'),mkCloud(320,118,2,'226,218,250','112,102,190'),mkCloud(520,170,3,'214,226,255','88,106,190'),mkCloud(380,130,4,'150,166,226','62,78,152')];
  STARS=[];for(i=0;i<130;i++)STARS.push([r()*IW,-420+r()*r()*700,.5+r()*1.2,r()*6.28,.4+r()*.6]);
  FARCL=[];for(i=0;i<8;i++)FARCL.push([r()*IW,150+r()*230,.7+r()*.8,.05+r()*.12,.5+r()*.3,i%3===1?1:0]);
  MIDCL=[];for(i=0;i<8;i++)MIDCL.push([r()*IW,418+r()*52,.6+r()*.5,.1+r()*.14,.32+r()*.22,i%2?0:1]);
  SEACL=[];for(i=0;i<15;i++)SEACL.push([r()*IW,790+i*26+r()*30,1.1+r()*1.0,.06+r()*.12,.55+r()*.3,i<5?(i%2?0:1):i<10?2:3]);
  /* đảo lơ lửng nhỏ (bập bềnh) */
  FLT=[];[[255,112,104,{pg:1,pond:1,sak:2,chain:1}],[548,64,78,{cr:4,tr:2,deb:5}],[802,100,100,{pg:1,bam:1,pond:1,chain:1,deb:4}],[1046,142,126,{pg:1,sak:2,deb:5,wf:[[.25,56,5]]}],[1258,86,92,{cr:3,bam:1,deb:4}],[58,138,86,{sak:1,pond:1,deb:3}],[410,188,72,{tr:2,cr:2,deb:3}],[945,212,80,{bam:1,sak:1,deb:3,chain:1}]].forEach(function(d,j){
    var cl=[],tg={c:c,f:.4,cry:cl},o=d[3];o.sd=60+j*3;o.cr=o.cr||0;o.tr=o.tr==null?3:o.tr;o.bush=j%2;o.vine=5;o.pgw=d[2]*.3;o.pgn=2;o.pgh=d[2]*.36;o.hz='rgba(150,170,235,.2)';o.r1='#8a90bc';o.r2='#2a2c5a';o.up=d[2]*.62;
    var p=putIsland(null,tg,d[0],d[1],d[2],d[2]*.8,o);
    FLT.push({sp:p.sp,ox:p.ox,oy:p.oy,ph:j*1.7,f:.4,cr:cl,wf:o.wf?{x:d[0]+d[2]*.1,y:d[1]+d[2]*.08,w:5}:null})});
  WFC=[[250,640,150,8],[560,640,160,12],[880,640,140,7],[1160,640,150,10],[40,640,120,6]];
  LT=[];for(i=0;i<9;i++)LT.push([r(),.05+r()*.9,0,.7+r()*.6]);
  PET=[];for(i=0;i<20;i++)PET.push([r(),r(),r(),i<12?0:1]);
  FIRE=[];for(i=0;i<22;i++)FIRE.push([r()*IW,420+r()*190,r()*6.28,.3+r()*.7]);
  A.ver++}
function capNow(k){var d=(typeof DPR==='number'?DPR:1),c=Math.min(lite()?1:CAP,Math.max(.6,k*d));return Math.max(.6,Math.round(c*4)/4)}

/* =====================  HOẠT CẢNH (vẽ động)  ===================== */
var gq,gk,gtop,gcam,gs,gt,GW,GH;
function PX(x,f){return x*gk-gcam*gs*f}
function PY(y){return gtop+y*gk}
function gl(x,y,r,rgb,a){var G=glowSpr(rgb),pa=gq.globalAlpha;gq.globalAlpha=a*pa;gq.drawImage(G.cv,x-r,y-r,r*2,r*2);gq.globalAlpha=pa}
function glE(x,y,rx,ry,rgb,a){var G=glowSpr(rgb);gq.save();gq.translate(x,y);gq.scale(1,ry/rx);gq.globalAlpha*=a;gq.drawImage(G.cv,-rx,-rx,rx*2,rx*2);gq.restore()}
function dl(l,f){var x=l.x*gk-gcam*gs*f,y=gtop+l.y*gk,w=l.w*gk;if(x>GW||x+w<0)return;gq.drawImage(l.cv,x,y,w,l.h*gk)}
function clouds(list,f,al){var q=gq,i,n=lite()?Math.ceil(list.length*.6):list.length;
  for(i=0;i<n;i++){var c=list[i],sp=CLS[c[5]],sc=c[2],xx=((c[0]+gt*c[3])%(IW+900))-450,w=sp.w*sc*gk,h=sp.h*sc*gk,x=PX(xx,f)-w/2,y=PY(c[1])-h/2;
    if(x>GW||x+w<0)continue;q.globalAlpha=Math.min(1,c[4]*(al==null?1:al));q.drawImage(sp.cv,x,y,w,h)}q.globalAlpha=1}

/* ---------- thuyền bay (phi chu) ---------- */
function boat(x,y,u,dir,t,ph){
  var q=gq,bob=Math.sin(t*.03+ph)*2*u,fl=Math.sin(t*.06+ph)*2.2*u;q.save();q.translate(x,y+bob);q.scale(dir,1);q.rotate(Math.sin(t*.02+ph)*.03);
  q.save();q.globalCompositeOperation='lighter';gl(0,-6*u,44*u,'255,200,130',.22);q.restore();
  /* mây + hào quang dưới thân */
  q.save();q.globalCompositeOperation='lighter';glE(0,8*u,34*u,7*u,'150,210,255',.45);q.restore();
  q.globalAlpha=.8;q.drawImage(CLS[1].cv,-34*u,2*u,66*u,24*u);q.globalAlpha=1;
  /* cánh buồm */
  q.fillStyle=lg(q,-4*u,-40*u,14*u,-8*u,[0,'rgba(255,248,224,.95)',1,'rgba(255,200,150,.82)']);q.beginPath();q.moveTo(2*u,-42*u);q.bezierCurveTo(16*u+fl,-34*u,17*u+fl,-18*u,12*u,-9*u);q.lineTo(2*u,-9*u);q.closePath();q.fill();
  q.strokeStyle='rgba(180,120,70,.7)';q.lineWidth=.5*u;for(var i=1;i<4;i++){q.beginPath();q.moveTo(2*u,-9*u-i*8*u);q.lineTo(12*u+fl*.7,-9*u-i*8*u);q.stroke()}
  q.fillStyle='rgba(200,70,50,.85)';q.beginPath();q.arc(8*u+fl*.4,-24*u,3.2*u,0,6.2832);q.fill();
  q.fillStyle='#6a4228';q.fillRect(1*u,-44*u,1.4*u,36*u);q.fillStyle='#e8503a';q.beginPath();q.moveTo(1.4*u,-44*u);q.lineTo(-9*u+fl*.5,-42*u);q.lineTo(1.4*u,-39*u);q.closePath();q.fill();
  /* thân thuyền cong, mũi vút */
  q.fillStyle=lg(q,0,-8*u,0,6*u,[0,'#b4784a',1,'#4a2a1c']);q.beginPath();q.moveTo(-24*u,-8*u);q.quadraticCurveTo(-18*u,5*u,-4*u,6*u);q.lineTo(14*u,6*u);q.quadraticCurveTo(24*u,2*u,30*u,-12*u);q.quadraticCurveTo(18*u,-6*u,10*u,-7*u);q.lineTo(-16*u,-7*u);q.closePath();q.fill();
  q.strokeStyle='#ffd66b';q.lineWidth=.9*u;q.beginPath();q.moveTo(-23*u,-7.5*u);q.lineTo(10*u,-7*u);q.quadraticCurveTo(18*u,-6*u,29*u,-12*u);q.stroke();
  q.fillStyle='rgba(255,236,170,.95)';for(i=0;i<4;i++){q.beginPath();q.arc(-12*u+i*7*u,-1*u,1.1*u,0,6.2832);q.fill()}
  /* đèn lồng đầu thuyền + cánh quạt khí */
  q.save();q.globalCompositeOperation='lighter';gl(27*u,-8*u,10*u,'255,190,100',.7+.2*Math.sin(t*.1));q.restore();q.fillStyle='#e8503a';q.beginPath();q.ellipse(27*u,-6*u,2*u,2.8*u,0,0,6.2832);q.fill();
  q.save();q.globalCompositeOperation='lighter';for(i=0;i<8;i++){var uu=((t*.012+i/8)%1);sparkle(q,-26*u-uu*60*u,2*u+Math.sin(uu*9+i)*3*u,(1-uu)*1.6*u,'255,215,150',Math.sin(uu*3.14))}q.restore();
  q.restore()}
function boats(){var t=gt,W2=IW+600,i,n=lite()?0:mid()?1:2,B2=[[.34,150,.45,1,0],[.22,260,.52,-1,2]];
  for(i=0;i<n;i++){var b=B2[i],tt=t*b[0]+i*700,x=b[3]>0?(tt%W2)-300:IW+300-(tt%W2),y=b[1]+Math.sin(t*.008+i*2)*10;boat(PX(x,b[2]),PY(y),gk*1.15,b[3],t,i*2)}}
function sky(){
  var q=gq,t=gt,i,y0=PY(-ET),y1=PY(IH+EB);
  q.fillStyle=lg(q,0,y0,0,y1,[0,'#04061c',.2,'#0a1245',.35,'#1c2f86',.455,'#3a5cb8',.54,'#6f8fdc',.6,'#a5b5f0',.71,'#c4c9f4',.78,'#8f9ee0',1,'#3f4d9c']);q.fillRect(0,0,GW,GH);
  q.drawImage(NEB.cv,PX(0,.08),PY(-420),IW*gk,760*gk);
  var ns=lite()?60:STARS.length;
  for(i=0;i<ns;i++){var st=STARS[i],a=st[4]*(.55+.45*Math.sin(t*.03+st[3]))*(1-(st[1]+420)/720*.85);if(a<.05)continue;q.fillStyle='rgba(230,238,255,'+a+')';var sz=Math.max(.8,st[2]*gk);q.fillRect(PX(st[0],.05),PY(st[1]),sz,sz);
    if(st[2]>1.5){q.fillRect(PX(st[0],.05)-sz*1.2,PY(st[1])+sz*.4,sz*3.4,sz*.3);q.fillRect(PX(st[0],.05)+sz*.4,PY(st[1])-sz*1.2,sz*.3,sz*3.4)}}
  q.save();q.globalCompositeOperation='lighter';
  gl(PX(1010,.08),PY(250-420+420),150*gk,'190,215,255',.2+.06*Math.sin(t*.02));
  if(!mid()){ /* cực quang */
    [['80,255,200',-170,.05,.0042],['130,190,255',-100,.045,.0035],['200,130,255',-30,.04,.003]].forEach(function(a,k){
      var pts=[],x,by=PY(a[1]),th=70*gk;q.fillStyle=lg(q,0,by-th,0,by+th*1.6,[0,'rgba('+a[0]+',0)',.4,'rgba('+a[0]+','+a[2]*3+')',1,'rgba('+a[0]+',0)']);q.beginPath();
      for(x=0;x<=GW+40;x+=40){var yy=by+Math.sin(x*.006/gk*1+t*.011+k)*30*gk+Math.sin(x*.013/gk-t*.007)*12*gk;x?q.lineTo(x,yy):q.moveTo(x,yy)}
      for(x=GW+40;x>=0;x-=40)q.lineTo(x,by+th*1.5+Math.sin(x*.005/gk+t*.009+k*2)*26*gk);q.closePath();q.fill()})}
  if(!mid()){ /* tia sáng trăng */
    var mxs=PX(1010,.08),mys=PY(250);q.fillStyle='rgba(190,215,255,.045)';for(i=0;i<4;i++){var an=1.95+i*.13+Math.sin(t*.003+i)*.03,L=1500*gk;q.beginPath();q.moveTo(mxs,mys);q.lineTo(mxs+Math.cos(an-.035)*L,mys+Math.sin(an-.035)*L);q.lineTo(mxs+Math.cos(an+.035)*L,mys+Math.sin(an+.035)*L);q.closePath();q.fill()}}
  /* sao băng */
  var ph=(t%520)/520;if(ph<.05&&!lite()){var p=ph/.05,sx=PX(260+(Math.floor(t/520)*397)%700,.08)+p*140*gk,sy=PY(-260)+p*70*gk;q.strokeStyle=lg(q,sx-120*gk,sy-60*gk,sx,sy,[0,'rgba(255,255,255,0)',1,'rgba(235,245,255,'+Math.sin(p*3.14)+')']);q.lineWidth=1.8;q.beginPath();q.moveTo(sx-120*gk,sy-60*gk);q.lineTo(sx,sy);q.stroke()}
  q.restore()}
function falls(list,f){
  var q=gq,t=gt,i,j,lt=lite();
  for(i=0;i<list.length;i++){var w=list[i],ff=w.f==null?f:w.f,x=PX(w.x,ff),y0=PY(w.y),len=w.len*gk,ww=w.w*gk;if(x<-60||x>GW+60)continue;
    q.fillStyle=lg(q,0,y0,0,y0+len,[0,'rgba(236,248,255,.75)',.65,'rgba(214,236,255,.5)',1,'rgba(214,236,255,0)']);q.beginPath();q.moveTo(x-ww*.4,y0);q.lineTo(x+ww*.4,y0);q.lineTo(x+ww*.7,y0+len);q.lineTo(x-ww*.7,y0+len);q.closePath();q.fill();
    if(!lt){q.fillStyle='rgba(255,255,255,.7)';for(j=0;j<5;j++){var u=((t*(.012+j*.003)+j*.21+i*.13)%1),yy=y0+u*len;q.globalAlpha=Math.sin(u*3.14);q.fillRect(x-ww*(.3+.2*(j%3-1)),yy,Math.max(1,ww*.16),len*.13);q.globalAlpha=1}}
    q.save();q.globalCompositeOperation='lighter';gl(x,y0+len,ww*3.4,'220,240,255',.34+.1*Math.sin(t*.05+i));if(!lt)gl(x+Math.sin(t*.02+i)*ww,y0+len-ww,ww*2.2,'255,255,255',.18);q.restore()}}
function midDyn(){
  var q=gq,t=gt,i;falls(WFm,.55);
  q.save();q.globalCompositeOperation='lighter';
  var n=WIN.length,st=lite()?2:1;for(i=0;i<n;i+=st){var w=WIN[i];gl(PX(w[0],.55),PY(w[1]),w[2]*1.5*gk,'255,196,110',.34+.18*Math.sin(t*.05+w[0]*.37))}
  var bx=PX(660,.55),by=PY(104);
  q.fillStyle=lg(q,0,by,0,PY(-420),[0,'rgba(200,228,255,.6)',.5,'rgba(190,220,255,.25)',1,'rgba(190,220,255,0)']);q.fillRect(bx-4*gk*(1+.15*Math.sin(t*.05)),PY(-420),8*gk*(1+.15*Math.sin(t*.05)),by-PY(-420));
  gl(bx,by,46*gk,'200,230,255',.75+.15*Math.sin(t*.06));gl(bx,by,110*gk,'160,205,255',.26+.08*Math.sin(t*.04));
  if(!lite()){q.save();q.translate(bx,PY(170));q.scale(1,.2);q.lineCap='round';
    for(i=0;i<3;i++){q.strokeStyle='rgba(190,226,255,'+(.5-.1*i)+')';q.lineWidth=Math.max(1.2,2.4*gk);q.setLineDash([16*gk,9*gk]);q.lineDashOffset=-t*(.7+i*.3)*(i%2?-1:1);q.beginPath();q.arc(0,0,(86+i*38)*gk,0,6.2832);q.stroke()}q.restore()}
  var cr=FLO.cr;for(i=0;i<cr.length;i++)gl(PX(cr[i][0],.55),PY(cr[i][1]),24*gk,'120,200,255',.3+.15*Math.sin(t*.06+i*2));
  q.restore()}
function floaters(){
  var q=gq,t=gt,i,j;
  for(i=0;i<FLT.length;i++){var f=FLT[i],bob=Math.sin(t*.018+f.ph)*4,x=PX(f.ox,f.f),y=PY(f.oy+bob),w=f.sp.w*gk;if(x>GW||x+w<0)continue;
    q.drawImage(f.sp.cv,x,y,w,f.sp.h*gk);
    if(f.wf)falls([{x:f.wf.x,y:f.wf.y+bob,w:f.wf.w,len:46,f:f.f}],f.f);
    q.save();q.globalCompositeOperation='lighter';for(j=0;j<f.cr.length;j++)gl(PX(f.cr[j][0],f.f),PY(f.cr[j][1]+bob),20*gk,'120,205,255',.32+.16*Math.sin(t*.07+i+j));q.restore()}}
/* hạc bay + tiên nhân ngự kiếm */
function crane(x,y,u,ph,dir,a){
  var q=gq,w=Math.sin(ph)*9*u;q.save();q.translate(x,y);q.scale(dir,1);q.globalAlpha=a;
  q.fillStyle='#f4f6ff';q.beginPath();q.ellipse(0,0,8*u,3*u,0,0,6.2832);q.fill();
  q.strokeStyle='#f4f6ff';q.lineWidth=1.6*u;q.beginPath();q.moveTo(7*u,-1*u);q.quadraticCurveTo(12*u,-5*u,13*u,-8*u);q.stroke();q.fillStyle='#d03a3a';q.beginPath();q.arc(13.4*u,-8.4*u,1.3*u,0,6.2832);q.fill();
  q.strokeStyle='#6a6a8a';q.lineWidth=.9*u;q.beginPath();q.moveTo(-8*u,0);q.lineTo(-19*u,2*u);q.stroke();
  q.fillStyle='rgba(240,244,255,.95)';q.strokeStyle='rgba(120,130,180,.6)';q.lineWidth=.6*u;
  [-1,1].forEach(function(s2){q.beginPath();q.moveTo(-2*u,0);q.quadraticCurveTo(-4*u,-10*u*s2*1+w*s2,-16*u,-6*u*s2+w*1.6*s2);q.quadraticCurveTo(-8*u,-2*u*s2+w*.4*s2,4*u,0);q.closePath();q.fill();q.stroke()});
  q.restore()}

/* ---------- TIÊN NHÂN bay lượn (3 tầng: XA mờ/nhỏ · GIỮA · GẦN lớn, bay trước cả sân) ---------- */
/* [loại 0 ngự kiếm·1 đạp mây phất trần·2 phi thiên cầm sen, tốc độ, lệch pha, độ cao, thị sai, cỡ, hướng, áo ngoài, áo trong, dải lụa rgb, tầng 0 xa·1 giữa·2 gần, hiện khi QL<=] */
var IMM=[
 /* XA (mờ, nhỏ) */
 [0,2.6,0,70,.22,.62,1,'#dfe9ff','#8aa8ee','200,230,255',0,1],
 [2,.16,700,170,.28,.68,-1,'#ffd0e4','#ffffff','255,200,225',0,0],
 [0,1.4,300,300,.3,.72,-1,'#c8b8f8','#f0e8ff','220,200,255',0,2],
 [1,.2,200,118,.25,.62,1,'#f4d890','#e07a5a','255,215,150',0,0],
 [0,3.4,900,225,.24,.55,-1,'#bfe8d8','#effff8','170,255,220',0,2],
 /* GIỮA */
 [0,2.2,0,250,.5,1.3,1,'#e8f2ff','#7aa8ee','255,255,255',1,2],
 [1,.18,200,330,.65,1.5,1,'#f0c060','#d8503c','255,200,120',1,2],
 [2,.45,900,205,.55,1.4,-1,'#ffc0da','#fff2f8','255,190,220',1,1],
 [0,.9,500,140,.35,1.1,-1,'#b99cf0','#ece0ff','220,190,255',1,0],
 [2,1.9,300,290,.58,1.25,1,'#a8e8ff','#ffffff','190,240,255',1,1],
 [1,.34,650,400,.7,1.35,-1,'#e8d0ff','#9a6ae0','230,200,255',1,0],
 /* GẦN (lớn nhất, nhanh/chậm) */
 [0,3.0,0,205,.95,1.7,1,'#f2f6ff','#6f9ae8','190,225,255',2,2],
 [2,.22,1100,330,.95,1.6,-1,'#ffb4d4','#fff0f6','255,175,215',2,1],
 [0,.7,500,150,.95,1.5,-1,'#ffe8b0','#e8884a','255,215,150',2,0]];
function sparkle(q,x,y,r,rgb,a){q.fillStyle='rgba('+rgb+','+a+')';q.fillRect(x-r*2,y-r*.18,r*4,r*.36);q.fillRect(x-r*.18,y-r*2,r*.36,r*4);q.fillStyle='rgba(255,255,255,'+a+')';q.beginPath();q.arc(x,y,r*.45,0,6.2832);q.fill()}
/* ---------- thân tiên nhân: vẽ 1 lần ở độ phân giải cao (mặt nghiêng, tay, áo nhiều lớp, tóc), phần bay động vẽ riêng ---------- */
function mkFig(m){
  var S=9,W=30,H=50,ox=10,oy=47,c1=m[7],c2=m[8],type=m[0];
  var sp=spr(W,H,S,function(q){
    q.translate(ox,oy);q.lineCap='round';q.lineJoin='round';
    var c1d=mx(c1,'#14143a',.4),c1l=mx(c1,'#ffffff',.5),c2d=mx(c2,'#14143a',.36),c2l=mx(c2,'#ffffff',.55),skin='#f7e1cd',skd='#d8a88a',k,x;
    function shoe(x){q.fillStyle=lg(q,0,-1.8,0,0,[0,'#3a3458',1,'#14102a']);q.beginPath();q.moveTo(x-1.5,-1.9);q.lineTo(x+2.2,-1.6);q.quadraticCurveTo(x+3.6,-.9,x+2.7,0);q.lineTo(x-1.7,0);q.closePath();q.fill();q.fillStyle='#f4f4ff';q.fillRect(x-1.7,-.45,4.6,.45)}
    shoe(-2.6);shoe(2.0);
    /* váy lót + nếp gấp + thêu */
    q.fillStyle=lg(q,-4.6,0,4.8,0,[0,c2d,.45,c2,1,c2l]);q.beginPath();q.moveTo(-2.7,-22.4);q.lineTo(2.9,-22.4);q.bezierCurveTo(3.6,-12,4.2,-6,4.9,-1.7);q.lineTo(-5,-1.5);q.bezierCurveTo(-4.2,-8,-3.2,-14,-2.7,-22.4);q.closePath();q.fill();
    for(k=0;k<7;k++){var x0=-2.3+k*.75;q.strokeStyle=k%2?'rgba(255,255,255,.34)':'rgba(15,15,60,.22)';q.lineWidth=.13;q.beginPath();q.moveTo(x0,-21.6);q.quadraticCurveTo(x0*1.4+(k-3)*.12,-12,-4.5+k*1.45,-2);q.stroke()}
    /* lớp voan ngoài trong mờ */
    q.fillStyle=lg(q,-4,-20,4.6,-2,[0,'rgba(255,255,255,.0)',.5,c1l.replace('rgb','rgba').replace(')',',.42)'),1,c1.length===7?'rgba('+hx(c1).join(',')+',.55)':'rgba(255,255,255,.4)']);
    q.beginPath();q.moveTo(-2.6,-22.2);q.lineTo(2.9,-22.2);q.bezierCurveTo(3.8,-13,4.7,-6,5.5,-2.2);q.quadraticCurveTo(0,-.6,-5.6,-2.4);q.bezierCurveTo(-4.6,-9,-3.2,-15,-2.6,-22.2);q.closePath();q.fill();
    q.strokeStyle='rgba(255,214,107,.95)';q.lineWidth=.22;q.beginPath();q.moveTo(-5.5,-2.3);q.quadraticCurveTo(0,-.7,5.5,-2.1);q.stroke();
    q.strokeStyle='rgba(255,214,107,.7)';q.lineWidth=.14;for(k=0;k<5;k++){var ex=-3.6+k*1.8;q.beginPath();q.arc(ex,-3.6,.5,3.4,6.0);q.arc(ex+.55,-3.5,.32,3.2,5.9);q.stroke()}
    /* thân + cổ áo chéo */
    q.fillStyle=lg(q,-3.1,0,3.1,0,[0,c1d,.5,c1,1,c1l]);q.beginPath();q.moveTo(-2.7,-34.2);q.quadraticCurveTo(-3.3,-28,-2.4,-22);q.lineTo(2.5,-22);q.quadraticCurveTo(3.1,-28,2.8,-33.6);q.closePath();q.fill();
    q.fillStyle=lg(q,-.4,0,2.6,0,[0,c2,1,c2l]);q.beginPath();q.moveTo(.1,-35.6);q.lineTo(2.7,-33.4);q.lineTo(1.7,-22.2);q.lineTo(-.4,-22.2);q.lineTo(-.7,-29);q.closePath();q.fill();
    q.strokeStyle='#ffffff';q.lineWidth=.26;q.beginPath();q.moveTo(.1,-35.7);q.lineTo(-.7,-29.2);q.lineTo(-.4,-22.4);q.stroke();
    q.strokeStyle='rgba(255,214,107,.95)';q.lineWidth=.2;q.beginPath();q.moveTo(.4,-35.4);q.lineTo(2.8,-33.3);q.lineTo(1.8,-22.4);q.stroke();
    q.fillStyle='rgba(15,15,60,.16)';q.beginPath();q.ellipse(-2.4,-29,.8,5.5,0,0,6.2832);q.fill();
    /* đai ngọc + nút thắt */
    q.fillStyle=lg(q,0,-23.6,0,-21.6,[0,'#ffe9a0',.5,'#d89a3a',1,'#8a5a1c']);q.fillRect(-2.9,-23.7,6,1.7);q.fillStyle=rg(q,1.1,-22.8,0,.9,[0,'#ffffff',.5,'#8af0c8',1,'#2a9a7a']);q.beginPath();q.arc(1.1,-22.8,.85,0,6.2832);q.fill();q.strokeStyle='#e8503a';q.lineWidth=.3;q.beginPath();q.moveTo(1.1,-22);q.lineTo(.6,-20);q.moveTo(1.1,-22);q.lineTo(1.7,-19.8);q.stroke();
    /* cổ */
    q.fillStyle=lg(q,-1,0,1.6,0,[0,skd,1,skin]);q.beginPath();q.moveTo(-.8,-37.4);q.lineTo(1.3,-37.4);q.lineTo(1.6,-34.6);q.lineTo(-1.1,-34.4);q.closePath();q.fill();q.fillStyle='rgba(120,70,60,.2)';q.beginPath();q.ellipse(.3,-36.5,1.3,.6,0,0,6.2832);q.fill();
    /* tay áo rộng đưa ra trước */
    q.fillStyle=lg(q,0,-34.5,0,-29,[0,c1l,.5,c1,1,c1d]);q.beginPath();q.moveTo(-.8,-34);q.bezierCurveTo(3,-35.2,7,-34.4,10,-32.2);q.lineTo(10.7,-28.6);q.bezierCurveTo(7,-29.8,3.4,-29.8,.2,-29.2);q.closePath();q.fill();
    q.strokeStyle='rgba(15,15,60,.2)';q.lineWidth=.12;for(k=0;k<3;k++){q.beginPath();q.moveTo(1+k*.5,-33.6+k*1.3);q.quadraticCurveTo(5,-33.2+k*1.3,9.4,-31.4+k*.9);q.stroke()}
    q.fillStyle=lg(q,9.2,0,10.9,0,[0,c2,1,c2l]);q.beginPath();q.moveTo(9.5,-32.5);q.lineTo(10.9,-31.8);q.lineTo(10.9,-28.4);q.lineTo(9.7,-28.7);q.closePath();q.fill();q.strokeStyle='rgba(255,214,107,.95)';q.lineWidth=.2;q.beginPath();q.moveTo(10.9,-31.8);q.lineTo(10.9,-28.4);q.stroke();
    /* bàn tay */
    var hx0=11.2,hy0=-30.3;q.fillStyle=lg(q,0,hy0-1,0,hy0+1,[0,skin,1,skd]);
    if(type===0){ /* kiếm quyết: hai ngón duỗi */
      q.beginPath();q.ellipse(hx0+.5,hy0,.95,.6,-.1,0,6.2832);q.fill();q.strokeStyle=skin;q.lineWidth=.42;q.beginPath();q.moveTo(hx0+1.1,hy0-.15);q.lineTo(hx0+3,hy0-1.0);q.moveTo(hx0+1.2,hy0+.1);q.lineTo(hx0+3.1,hy0-.35);q.stroke();q.lineWidth=.3;q.strokeStyle=skd;q.beginPath();q.moveTo(hx0+.8,hy0+.4);q.lineTo(hx0+1.4,hy0+.9);q.stroke()}
    else if(type===1){ /* nắm phất trần */
      q.beginPath();q.arc(hx0+.5,hy0,.85,0,6.2832);q.fill();q.strokeStyle=skd;q.lineWidth=.12;for(k=0;k<4;k++){q.beginPath();q.moveTo(hx0+.2+k*.28,hy0-.7);q.lineTo(hx0+.2+k*.28,hy0+.7);q.stroke()}}
    else{ /* bàn tay ngửa đỡ hoa sen */
      q.beginPath();q.ellipse(hx0+.4,hy0+.1,1.1,.5,-.25,0,6.2832);q.fill();q.strokeStyle=skin;q.lineWidth=.3;for(k=0;k<4;k++){q.beginPath();q.moveTo(hx0+1.2,hy0+.1);q.lineTo(hx0+2.4+k*.12,hy0-.5+k*.4);q.stroke()}}
    /* đầu: gương mặt nghiêng */
    q.fillStyle=lg(q,-2.5,0,3.5,0,[0,skd,.45,skin,1,'#fff0e2']);q.beginPath();q.moveTo(-2.1,-41.9);q.bezierCurveTo(-.5,-43,1.8,-42.7,2.6,-41.2);q.bezierCurveTo(2.9,-40.6,2.85,-40.2,2.7,-39.8);q.lineTo(2.55,-39.3);q.bezierCurveTo(2.9,-38.9,3.4,-38.7,3.5,-38.5);q.bezierCurveTo(3.35,-38.3,3,-38.3,2.8,-38.3);q.lineTo(3,-37.9);q.lineTo(2.8,-37.65);q.lineTo(2.95,-37.3);q.lineTo(2.6,-36.9);q.bezierCurveTo(2.5,-36.4,2.1,-36.1,1.5,-36);q.bezierCurveTo(.6,-35.9,-.6,-36.5,-1.5,-37.7);q.bezierCurveTo(-2.4,-38.9,-2.6,-40.5,-2.1,-41.9);q.closePath();q.fill();
    q.fillStyle='rgba(255,140,140,.28)';q.beginPath();q.ellipse(1.6,-38,.9,.6,0,0,6.2832);q.fill();q.fillStyle='rgba(120,70,60,.18)';q.beginPath();q.ellipse(.3,-36.7,1.5,.5,0,0,6.2832);q.fill();
    q.fillStyle='#ffffff';q.beginPath();q.moveTo(1.15,-39.4);q.quadraticCurveTo(1.7,-39.95,2.4,-39.5);q.quadraticCurveTo(1.8,-39.05,1.15,-39.4);q.fill();q.fillStyle='#241528';q.beginPath();q.ellipse(1.95,-39.45,.3,.32,0,0,6.2832);q.fill();q.fillStyle='#fff';q.fillRect(1.85,-39.62,.1,.1);
    q.strokeStyle='#120a1c';q.lineWidth=.16;q.beginPath();q.moveTo(1.05,-39.35);q.quadraticCurveTo(1.7,-40.05,2.5,-39.55);q.stroke();q.lineWidth=.1;q.beginPath();q.moveTo(1.05,-39.35);q.lineTo(.7,-39.1);q.stroke();
    q.strokeStyle='#1a1224';q.lineWidth=.17;q.beginPath();q.moveTo(.95,-40.45);q.quadraticCurveTo(1.9,-41,2.8,-40.35);q.stroke();
    q.fillStyle='#c4505a';q.beginPath();q.moveTo(2.85,-37.95);q.lineTo(3,-37.9);q.lineTo(2.82,-37.65);q.lineTo(2.97,-37.3);q.lineTo(2.62,-37);q.lineTo(2.5,-37.4);q.lineTo(2.55,-37.7);q.closePath();q.fill();
    q.fillStyle=lg(q,0,-39.5,0,-38,[0,skin,1,skd]);q.beginPath();q.ellipse(-.4,-38.7,.55,.9,.2,0,6.2832);q.fill();
    /* tóc búi + sợi bóng + ngọc quan */
    q.fillStyle=lg(q,-3,-44,2.6,-37,[0,'#262050',.5,'#120c26',1,'#0a0618']);q.beginPath();q.moveTo(2.6,-41.1);q.bezierCurveTo(1.9,-43.6,-1.7,-43.8,-2.9,-41);q.bezierCurveTo(-3.3,-39,-3,-37.4,-2.2,-36.2);q.bezierCurveTo(-1.2,-37.2,-1.2,-39.6,.5,-40.6);q.bezierCurveTo(1.2,-40.9,2,-41.1,2.6,-41.1);q.closePath();q.fill();
    q.strokeStyle='rgba(160,170,255,.55)';q.lineWidth=.1;for(k=0;k<6;k++){q.beginPath();q.moveTo(2-k*.15,-42.9+k*.12);q.bezierCurveTo(.6,-43.5+k*.15,-1.8,-42.8+k*.2,-2.7+k*.05,-40.4+k*.55);q.stroke()}
    q.strokeStyle='#120c26';q.lineWidth=.22;q.beginPath();q.moveTo(1.2,-40.7);q.quadraticCurveTo(1.1,-39.4,.95,-37.9);q.stroke();
    q.fillStyle=lg(q,-1.6,0,1,0,[0,'#2a2250',1,'#0e0820']);q.beginPath();q.ellipse(-.5,-44.4,1.5,1.25,0,0,6.2832);q.fill();q.strokeStyle='rgba(160,170,255,.5)';q.lineWidth=.1;q.beginPath();q.arc(-.6,-44.5,.9,3.6,5.2);q.stroke();
    q.fillStyle=lg(q,-.6,-43.9,1.3,-43.1,[0,'#fff0a8',1,'#c8902a']);q.beginPath();q.moveTo(-.9,-43.2);q.lineTo(-.6,-44.2);q.lineTo(.6,-44.2);q.lineTo(1.1,-43.2);q.closePath();q.fill();q.fillStyle='#8af0c8';q.beginPath();q.arc(.1,-44.4,.3,0,6.2832);q.fill();
    q.strokeStyle='#ffd66b';q.lineWidth=.16;q.beginPath();q.moveTo(-2.6,-44.7);q.lineTo(1.9,-43.6);q.stroke();q.fillStyle='#e8503a';q.fillRect(-1.5,-43.3,.45,.9);
  });
  sp.ox=ox;sp.oy=oy;return sp}
function immBody(q,u,t,ph,m,lean,mode){
  var w1=Math.sin(t*FS*.11+ph)*2.6*u,w2=Math.sin(t*FS*.11+ph+1.1)*3.6*u,w3=Math.sin(t*FS*.11+ph+2.1)*4.4*u,c1=m[7],c2=m[8],rgb=m[9],i,k,sp=m[13]||(m[13]=mkFig(m));
  function U(px,py,fn){q.save();q.translate(px,py);q.rotate(-lean);q.translate(-px,-py);fn();q.restore()}
  q.rotate(lean);
  /* dải lụa hồng lăng uốn lượn */
  U(0,-34*u,function(){q.save();q.globalCompositeOperation='lighter';q.lineCap='round';
    [[1,2.4],[-1,1.6],[1,1]].forEach(function(r,k){q.strokeStyle='rgba('+rgb+','+(.5-k*.1)+')';q.lineWidth=r[1]*u*.5;q.beginPath();q.moveTo(0,-34*u);
      q.bezierCurveTo(-18*u,-35*u+w1*r[0],-36*u,-26*u+w2*r[0],-66*u+k*9*u,-33*u+w3*r[0]-k*3*u);q.stroke()});q.restore()});
  /* tóc dài buông sau lưng, nhiều lọn có ánh */
  U(-2.6*u,-40*u,function(){q.lineCap='round';
    for(i=0;i<7;i++){q.strokeStyle=i%2?'#241c4c':'#120c26';q.lineWidth=(1.15-i*.08)*u;q.beginPath();q.moveTo(-2.6*u,-40.2*u+i*.45*u);q.bezierCurveTo(-9*u,-40*u+w1*.5+i*.6*u,-15*u,-35*u+w2*.6,-26*u-i*1.6*u,-32*u+w3*.7+i*.9*u);q.stroke()}
    q.strokeStyle='rgba(150,150,240,.5)';q.lineWidth=.35*u;for(i=0;i<3;i++){q.beginPath();q.moveTo(-3*u,-41*u+i*.5*u);q.bezierCurveTo(-9*u,-41*u+w1*.5,-14*u,-36*u+w2*.6,-23*u-i*u,-33.5*u+w3*.7);q.stroke()}});
  /* tay áo sau (voan) bay phía sau */
  U(-1*u,-33*u,function(){q.fillStyle=lg(q,-28*u,0,0,0,[0,'rgba('+hx(c2).join(',')+',0)',.4,'rgba('+hx(c2).join(',')+',.7)',1,c1]);
    q.beginPath();q.moveTo(-1*u,-34*u);q.bezierCurveTo(-9*u,-36*u,-18*u,-33*u+w2*.5,-28*u,-29*u+w2);q.bezierCurveTo(-18*u,-26*u,-8*u,-27*u,-.5*u,-28.5*u);q.closePath();q.fill();
    q.strokeStyle='rgba(255,214,107,.8)';q.lineWidth=.45*u;q.beginPath();q.moveTo(-28*u,-29*u+w2);q.bezierCurveTo(-18*u,-26*u,-8*u,-27*u,-.5*u,-28.5*u);q.stroke();
    q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=.25*u;q.beginPath();q.moveTo(-2*u,-33.5*u);q.bezierCurveTo(-10*u,-35.2*u,-18*u,-32.4*u+w2*.5,-26*u,-29.6*u+w2*.95);q.stroke()});
  /* tà váy ngoài bay sau (hai lớp voan, nếp gấp, viền vàng) */
  U(0,-22*u,function(){
    q.fillStyle=lg(q,-38*u,0,3*u,0,[0,'rgba('+hx(c2).join(',')+',0)',.45,c2,1,c1]);
    q.beginPath();q.moveTo(2.8*u,-22*u);q.lineTo(-2.8*u,-22*u);q.bezierCurveTo(-9*u,-18*u+w1*.4,-18*u,-11*u+w1,-38*u,-14*u+w2);q.bezierCurveTo(-28*u,-6*u+w1,-12*u,-1*u,-4*u,-3*u);q.lineTo(4*u,-3*u);q.closePath();q.fill();
    q.fillStyle='rgba(255,255,255,.28)';q.beginPath();q.moveTo(-3*u,-21*u);q.bezierCurveTo(-12*u,-15*u,-22*u,-11*u+w1,-38*u,-14*u+w2);q.bezierCurveTo(-24*u,-14*u,-12*u,-17*u,-2*u,-17.5*u);q.closePath();q.fill();
    q.strokeStyle='rgba(30,30,90,.22)';q.lineWidth=.35*u;for(i=0;i<5;i++){q.beginPath();q.moveTo(-2*u+i*1.2*u,-21*u);q.bezierCurveTo(-12*u,-16*u+i*2*u+w1*.3,-22*u,-11*u+w1+i*u,-35*u+i*u,-13*u+w2+i*.6*u);q.stroke()}
    q.strokeStyle='rgba(255,214,107,.9)';q.lineWidth=.5*u;q.beginPath();q.moveTo(4*u,-3*u);q.bezierCurveTo(-4*u,-1*u,-12*u,-1*u,-26*u,-6*u+w1);q.bezierCurveTo(-31*u,-9*u,-35*u,-12*u,-38*u,-14*u+w2);q.stroke();
    /* tua ngọc bội đung đưa */
    q.strokeStyle='rgba(232,80,58,.95)';q.lineWidth=.5*u;q.beginPath();q.moveTo(1.1*u,-21.5*u);q.quadraticCurveTo(-1*u+w1*.3,-17*u,-2*u+w1*.5,-12.5*u);q.stroke();q.fillStyle=rg(q,-2*u+w1*.5,-11.5*u,0,1.6*u,[0,'#e8fff4',1,'#4fc8a0']);q.beginPath();q.arc(-2*u+w1*.5,-11.5*u,1.5*u,0,6.2832);q.fill()});
  /* thân người đã vẽ sẵn chi tiết cao */
  q.imageSmoothingEnabled=true;q.imageSmoothingQuality='high';q.drawImage(sp.cv,-sp.ox*u,-sp.oy*u,sp.w*u,sp.h*u)}
var FS=1;
function immortal(x,y,u,dir,m,t,ph){
  var q=gq,type=m[0],v=m[1],fast=v>1.5,slow=v<.4,lean=(type===2?.6:.08)+(fast&&type!==2?.18:0),i,g2,AL=m[10]===0?.72:1,near=m[10]===2,rgb=m[9],lt=lite();
  FS=slow?.5:fast?1.8:1;
  q.save();q.translate(x,y);q.scale(dir,1);q.globalAlpha=AL;
  if(slow)q.rotate(Math.sin(t*.018+ph)*.045);
  q.save();q.globalCompositeOperation='lighter';
  gl(0,-22*u,(slow?58:42)*u,rgb,(slow?.36:.3)+.08*Math.sin(t*.07+ph));
  /* bụi sao: nhanh -> kéo dài, chậm -> thưa và lả tả */
  var ln=fast?2.3:slow?.7:1,ns=lt?6:fast?22:slow?9:14;
  for(i=0;i<ns;i++){var uu=((t*(fast?.03:slow?.006:.013)+i/ns+ph*.13)%1),px=-(12+uu*(near?190:130)*ln)*u,py=-14*u+Math.sin(uu*8+i*1.3+ph)*(slow?16:fast?4:11)*u,al=Math.sin(uu*3.1416)*(.5+.5*Math.sin(t*.2+i));sparkle(q,px,py,(1-uu*.6)*(near?2.4:1.7)*u*(slow?1.2:1),rgb,al)}
  /* vệt gió khi bay nhanh */
  if(v>1.1&&!lt){for(i=0;i<(fast?9:5);i++){var yy=-36*u+i*(fast?4.8:7)*u,xs=-(6+((t*(fast?4:2)+i*29)%46))*u,len=(fast?110:60)*u*(.6+((i*37)%10)/14);q.strokeStyle=lg(q,xs,0,xs-len,0,[0,'rgba('+rgb+',.55)',1,'rgba('+rgb+',0)']);q.lineWidth=Math.max(.6,.55*u);q.beginPath();q.moveTo(xs,yy);q.lineTo(xs-len,yy);q.stroke()}}
  q.restore();
  /* ảnh tàn khi lướt cực nhanh */
  if(fast&&!lt){for(g2=2;g2>=1;g2--){q.save();q.translate(-g2*(near?20:15)*u,g2*.8*u);q.globalAlpha=AL*.24/g2;immBody(q,u,t,ph,m,lean,type===0?0:1);q.restore()}}
  if(type===0){ /* ngự kiếm */
    q.save();q.globalCompositeOperation='lighter';q.fillStyle=lg(q,-160*u*(fast?1.5:1),0,0,0,[0,'rgba(120,200,255,0)',1,'rgba(190,236,255,.85)']);q.beginPath();q.moveTo(-160*u*(fast?1.5:1),0);q.lineTo(-2*u,-3*u);q.lineTo(22*u,0);q.lineTo(-2*u,3*u);q.closePath();q.fill();gl(8*u,0,(fast?26:20)*u,'150,225,255',.65);
    q.save();q.translate(0,3*u);q.scale(1,.2);q.strokeStyle='rgba(160,230,255,.7)';q.lineWidth=Math.max(1,1.4*u);q.setLineDash([5*u,4*u]);q.lineDashOffset=-t*(fast?1.8:.8)*u;q.beginPath();q.arc(0,0,26*u,0,6.2832);q.stroke();q.lineDashOffset=t*(fast?1.4:.6)*u;q.beginPath();q.arc(0,0,17*u,0,6.2832);q.stroke();q.restore();q.restore();
    q.fillStyle=lg(q,0,-2*u,0,2*u,[0,'#ffffff',1,'#9fc8e8']);q.beginPath();q.moveTo(-23*u,0);q.lineTo(-12*u,-1.9*u);q.lineTo(23*u,0);q.lineTo(-12*u,1.9*u);q.closePath();q.fill();q.fillStyle='#ffd66b';q.fillRect(-15*u,-2.8*u,2.2*u,5.6*u);q.fillStyle='#7af0c8';q.beginPath();q.arc(-17*u,0,1.2*u,0,6.2832);q.fill()}
  else if(type===1){ /* đạp mây */
    var cs=CLS[1],cw=60*u;for(i=4;i>=1;i--){q.globalAlpha=AL*(.5-i*.09);q.drawImage(cs.cv,-cw*.5-i*(slow?13:17)*u,-4*u+Math.sin(t*.05*FS+i)*2*u,cw*(.8-i*.08),cw*.36)}
    q.globalAlpha=AL*.97;q.drawImage(cs.cv,-cw*.55,-9*u,cw,cw*cs.h/cs.w);q.globalAlpha=AL;
    q.save();q.globalCompositeOperation='lighter';gl(0,2*u,28*u,rgb,.42);q.restore();
    q.strokeStyle='#2a2444';q.lineWidth=1.9*u;q.lineCap='round';q.beginPath();q.moveTo(-1*u,-9*u);q.lineTo(-3*u,-1.4*u);q.moveTo(1.6*u,-9*u);q.lineTo(3.4*u,-1.4*u);q.stroke()}
  else{ /* phi thiên: cánh hoa */
    q.save();q.globalCompositeOperation='lighter';for(i=0;i<(slow?14:9);i++){var pu=((t*(slow?.005:fast?.02:.01)+i/9+ph)%1),px2=-pu*(slow?70:90)*u,py2=-12*u+Math.sin(pu*9+i)*(slow?16:10)*u;q.fillStyle='rgba('+rgb+','+(.85*Math.sin(pu*3.14))+')';q.beginPath();q.ellipse(px2,py2,2.8*u,1.5*u,pu*6,0,6.2832);q.fill()}q.restore()}
  immBody(q,u,t,ph,m,lean,type===0?0:1);
  q.save();q.rotate(lean);var hx0=11.4*u,hy=-30.3*u+Math.sin(t*FS*.11+ph)*.8*u;
  if(type===1){
    q.strokeStyle='#c89a50';q.lineWidth=1.1*u;q.beginPath();q.moveTo(hx0,hy+1.2*u);q.lineTo(hx0+7*u,hy-6*u);q.stroke();q.fillStyle='#ffd66b';q.fillRect(hx0+6*u,hy-6.6*u,1.4*u,1.4*u);
    q.strokeStyle='rgba(255,255,255,.85)';q.lineWidth=.45*u;for(i=0;i<16;i++){var sw2=Math.sin(t*FS*.09+i*.5+ph)*3*u;q.beginPath();q.moveTo(hx0+7*u,hy-6*u);q.quadraticCurveTo(hx0+10*u+i*.5*u,hy-1*u+sw2,hx0+4*u+(i-8)*1.6*u-sw2,hy+13*u+(i%4)*u);q.stroke()}}
  else if(type===2){
    var lx=hx0+2*u,ly=hy-1.4*u;q.save();q.globalCompositeOperation='lighter';gl(lx,ly-3*u,15*u,'255,200,230',.6+.2*Math.sin(t*.1));q.restore();lotus(q,lx,ly,4*u,'#ff9ccc')}
  q.restore();q.restore()}
function critters(near){
  var t=gt,i,W2=IW+560;
  for(i=0;i<IMM.length;i++){var m=IMM[i];if((m[10]===2)!==!!near||ql()>m[11])continue;
    var v=m[1],surge=v>.4&&v<1.6?Math.sin(t*.004+i)*60:0,tt=t*v+m[2]+surge,x=m[6]>0?(tt%W2)-280:IW+280-(tt%W2),
        amp=v>1.5?5:v<.4?(m[10]===2?26:20):12,y=m[3]+Math.sin(t*.011*(.6+i*.12)*(v<.4?.6:1)+i*2)*amp+Math.sin(x*.012+i)*(v>1.5?3:6);
    immortal(PX(x,m[4]),PY(y),gk*m[5],m[6],m,t,i*1.7)}
  if(near)return;
  var cx=((t*.55+120)%(IW+600))-300,cy=300+Math.sin(t*.006)*14,nc=lite()?3:5,off=[[0,0],[-26,10],[-26,-10],[-52,19],[-52,-19]];
  for(i=0;i<nc;i++)crane(PX(cx+off[i][0],.7),PY(cy+off[i][1]+Math.sin(t*.02+i)*3),gk*.85,t*.2+i*.7,1,.92)}
function nearDyn(){
  var q=gq,t=gt,i,j;
  q.save();q.globalCompositeOperation='lighter';
  /* phản chiếu cổng trên sàn đá */
  for(i=0;i<5;i++){var G=LCT.gates[i]||{},op=G.open?1:.28,x=PX(FX[i]*IW,1),rgb=GCOL[i];glE(x,PY(552),130*gk,150*gk*.42,rgb,op*(.5+.13*Math.sin(t*.06+i)));
    if(i>0){q.fillStyle=lg(q,0,PY(520),0,PY(612),[0,'rgba('+rgb+','+.32*op+')',1,'rgba('+rgb+',0)']);q.beginPath();q.moveTo(x-34*gk,PY(522));q.lineTo(x+34*gk,PY(522));q.lineTo(x+60*gk,PY(612));q.lineTo(x-60*gk,PY(612));q.closePath();q.fill()}}
  /* trận pháp: cung sáng chạy quanh */
  var ax=PX(660,1),ay=PY(556);q.lineCap='round';
  [[430,60,.011,1],[300,41,-.016,1.4],[120,17,.02,1]].forEach(function(r,k){for(j=0;j<2;j++){var a0=t*r[2]+j*3.1416;q.strokeStyle='rgba(255,238,180,'+(.7-.15*k)+')';q.lineWidth=Math.max(1,1.3*gk);q.beginPath();q.ellipse(ax,ay,r[0]*gk,r[1]*gk,0,a0,a0+1.0);q.stroke()}});
  glE(ax,ay,150*gk,34*gk,'255,230,160',.2+.08*Math.sin(t*.04));
  /* đèn đá + tinh thể */
  for(i=0;i<LANT.length;i++){var l=LANT[i],lx=PX(l[0],1);if(lx<-60||lx>GW+60)continue;gl(lx,PY(l[1]),44*l[2]*gk,'255,176,80',.58+.18*Math.sin(t*.11+l[0]))}
  for(i=0;i<CRY.length;i++){var c2=CRY[i],cx=PX(c2[0],1);if(cx<-60||cx>GW+60)continue;gl(cx,PY(c2[1]),26*gk,c2[2],.28+.16*Math.sin(t*.06+i*1.9))}
  /* hào quang tượng thần */
  var sx=PX(206,1);gl(sx,PY(386),64*gk,'110,235,255',.5+.15*Math.sin(t*.07));gl(sx,PY(470),96*gk,'95,235,255',.22+.08*Math.sin(t*.05));
  /* đom đóm / linh quang */
  if(!lite())for(i=0;i<FIRE.length;i++){var f=FIRE[i],fx=PX(f[0]+Math.sin(t*.01*f[3]+f[2])*30,1),fy=PY(f[1]+Math.cos(t*.012*f[3]+f[2])*18);if(fx<-20||fx>GW+20)continue;gl(fx,fy,7*gk,'255,244,170',.35+.5*Math.abs(Math.sin(t*.04*f[3]+f[2])))}
  q.restore();
  /* thác chảy từ mép đảo xuống biển mây */
  var wl=[];for(i=0;i<WFC.length;i++)wl.push({x:WFC[i][0],y:WFC[i][1],len:WFC[i][2],w:WFC[i][3]});falls(wl,1);
  /* cánh hoa anh đào */
  var np=lite()?6:mid()?12:PET.length;
  for(i=0;i<np;i++){var p=PET[i],u=((t*.0016*(.7+p[1]*.7)+p[0])%1),side=p[3],bx=side?1060+p[2]*260:-20+p[2]*300,px=PX(bx+u*(side?-170:190)+Math.sin(u*9+i)*20,1),py=PY(190+u*(side?380:390)),rot=t*.03+i;
    if(px<-10||px>GW+10)continue;q.save();q.translate(px,py);q.rotate(rot);q.globalAlpha=.88*Math.sin(u*3.1416);q.fillStyle=i%3?'#ffaecf':'#ffe2ee';q.beginPath();q.ellipse(0,0,Math.max(1.4,4.6*gk),Math.max(.9,2.4*gk*Math.abs(Math.cos(rot*1.3)+.3)),0,0,6.2832);q.fill();q.restore()}
}

/* ---------- hoạt cảnh sinh hoạt: tu sĩ đi dạo/ngồi thiền, khói nhang, bát quái bay, đèn dây, đèn trời ---------- */
function trigram(q,x,y,w,pat){var i,h=w*.2,gp=w*.16;for(i=0;i<3;i++){var yy=y+(i-1)*(h+gp);if(pat[i])q.fillRect(x-w/2,yy-h/2,w,h);else{q.fillRect(x-w/2,yy-h/2,w*.42,h);q.fillRect(x+w*.08,yy-h/2,w*.42,h)}}}
var BAGUA=[[1,1,1],[0,1,1],[1,0,1],[0,0,1],[1,1,0],[0,1,0],[1,0,0],[0,0,0]];
var LT=[];
function liveDyn(){
  var q=gq,t=gt,i,u=gk,lt=lite();
  q.save();q.globalCompositeOperation='lighter';
  /* đèn dây lấp lánh */
  var nb=BULB.length,st=lt?3:1;for(i=0;i<nb;i+=st){var b=BULB[i],bx=PX(b[0],1);if(bx<-10||bx>GW+10)continue;gl(bx,PY(b[1]),6*u,'255,222,150',.35+.45*Math.abs(Math.sin(t*.07+i*.9)))}
  /* bát quái xoay quanh trận pháp */
  if(!lt){var ax=PX(660,1),ay=PY(556);for(i=0;i<8;i++){var a=t*.008+i*.7854,tx=ax+Math.cos(a)*372*u,ty=ay+Math.sin(a)*52*u-(34+6*Math.sin(t*.03+i))*u,sc=.55+.45*(Math.sin(a)+1)/2;
    q.fillStyle='rgba(255,232,160,'+(.45+.4*sc)+')';trigram(q,tx,ty,13*u*sc,BAGUA[i]);gl(tx,ty,16*u*sc,'255,215,120',.22)}}
  q.restore();
  /* khói nhang */
  if(!lt)for(i=0;i<INC.length;i++){var c=INC[i],cx=PX(c[0],1);if(cx<-40||cx>GW+40)continue;for(var j=0;j<6;j++){var uu=((t*.004+j/6+i*.3)%1),px=cx+Math.sin(uu*7+j+i)*7*u*(.4+uu),py=PY(c[1])-uu*70*u,rad=(3+uu*13)*u;q.globalAlpha=.3*(1-uu)*Math.min(1,uu*6);q.drawImage(glowSpr('220,225,245').cv,px-rad,py-rad,rad*2,rad*2)}q.globalAlpha=1}
  /* đèn Khổng Minh bay lên */
  var nl=lt?3:LT.length;for(i=0;i<nl;i++){var L=LT[i],uu=((t*.0009*L[3]+L[0])%1),lx=PX(L[1]*IW+Math.sin(uu*8+i)*26,.8),ly=PY(600-uu*560),a=Math.sin(Math.min(1,uu*1.6)*3.1416)*.95;if(lx<-20||lx>GW+20)continue;
    q.save();q.globalCompositeOperation='lighter';gl(lx,ly,20*u,'255,170,70',.5*a);q.restore();q.globalAlpha=a;q.fillStyle='#ffb347';q.beginPath();q.moveTo(lx-4*u,ly+5*u);q.lineTo(lx-5*u,ly-3*u);q.quadraticCurveTo(lx,ly-8*u,lx+5*u,ly-3*u);q.lineTo(lx+4*u,ly+5*u);q.closePath();q.fill();q.fillStyle='#fff3c0';q.fillRect(lx-1.6*u,ly-1*u,3.2*u,4*u);q.globalAlpha=1}}
function sea(){
  var q=gq,i;clouds(SEACL,1.0,1);
  /* sương rìa đảo */
  var y=PY(IH-12);q.fillStyle=lg(q,0,y-40*gk,0,y+60*gk,[0,'rgba(170,184,240,0)',.5,'rgba(170,184,240,.35)',1,'rgba(150,166,230,0)']);q.fillRect(0,y-40*gk,GW,100*gk)}
function vign(){var q=gq;q.fillStyle=rg(q,GW/2,GH*.52,GH*.3,Math.max(GW,GH)*.8,[0,'rgba(0,0,24,0)',1,'rgba(0,0,24,.34)']);q.fillRect(0,0,GW,GH)}

/* =====================  KHUNG HÌNH  ===================== */
function camera(){
  if(!(LCT.on&&LCT.on())){camOn=false;return}
  var v=vw(),max=0,tg=Math.max(0,Math.min(max,P.x-v/2));
  if(!camOn){camX=tg;camOn=true}else{camX+=(tg-camX)*.16;if(Math.abs(tg-camX)<.4)camX=tg}
  cam=Math.max(0,Math.min(max,camX))}
function blit(q,W,H,gy){
  var k=K()*s,top=gy-BASEY*k,c=capNow(k);
  if(!B||Math.abs(B.c-c)>.01){try{build(c)}catch(e){if(window.console)console.error('LGART build',e);return}}
  A.L={W:W,H:H,gy:gy,sw:k,ih:IH*k,dy:top};
  gq=q;gk=k;gtop=top;gcam=cam;gs=s;gt=(typeof fr==='number'?fr:0);GW=W;GH=H;
  q.save();
  sky();
  dl(B.far,.25);clouds(FARCL,.3,1);
  floaters();boats();critters();
  dl(B.mid,.55);midDyn();clouds(MIDCL,.8,1);
  dl(B.near,1);nearDyn();liveDyn();sea();critters(true);
  vign();
  q.restore()}
function idle(){try{if(!B)build(capNow(K()*(typeof s==='number'?s:1)))}catch(e){}}
if(window.requestIdleCallback)requestIdleCallback(idle,{timeout:2500});else setTimeout(idle,900);

/* ---------- 5 cổng: đổi tên đúng tính năng + khóa cổng chưa có (chịu được đối tượng bị đóng băng) ---------- */
(function(){var G=LCT.gates,bq=null,k;for(k=0;k<G.length;k++)if(/Bế Quan/.test(G[k].n||'')){bq=G[k];break}
  function fix(g,o){try{for(var p in o)g[p]=o[p];return g}catch(e){var c={},q;for(q in g)c[q]=g[q];for(q in o)c[q]=o[q];return c}}
  if(G[0])G[0]=fix(G[0],{n:'Chiến Trường Linh Giới',sn:'Chiến Trường',e:'⚔️',sub:'Chọn bản đồ · Chạm để vào'});
  if(G[1])G[1]=fix(G[1],{n:'Hợp Đạo Đài',sn:'Hợp Đạo',e:'☯️',sub:'Lv100 · Hợp đạo tẩy luyện'});
  if(G[2])G[2]=fix(G[2],{n:'Kiếm Thánh Đài',sn:'Kiếm Thánh',e:'🗡️',sub:'Boss Lv100 · Chạm để đánh'});
  if(bq)bq=fix(bq,{sn:bq.sn||'Bế Quan',e:bq.e||'🧘'});
  var lock={sn:'Truyền Tống',n:'Hư Không Truyền Tống',e:'🌀',c:'#d9a8ff',rgb:'200,140,255',sub:'Tạm khóa · sắp mở',open:0,go:function(){}};
  var lock2={sn:'Nhất Nguyên',n:'Nhất Nguyên Tứ Sắc',e:'🌈',c:'#9fe0c0',rgb:'150,230,190',sub:'Tạm khóa · sắp mở',open:0,go:function(){}};
  var out=[G[0],G[1],G[2],lock,bq||lock2].filter(Boolean);G.splice.apply(G,[0,G.length].concat(out))})();
/* ---------- cổng: xoáy sáng + nhãn ---------- */
function glow(x,y,r,rgb,a){var G=glowSpr(rgb);g.globalAlpha=a;g.drawImage(G.cv,x-r,y-r,r*2,r*2);g.globalAlpha=1}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function banner(x,y,G,op,fs){
  var nm=G.n,sub=op?(G.sub||''):'🔒 '+(G.sub||'Tạm khóa'),F='KTH Serif,Georgia,serif';
  g.save();g.textAlign='left';g.textBaseline='middle';
  g.font='700 '+fs+'px '+F;var w1=g.measureText(nm).width;g.font='600 '+(fs*.76)+'px '+F;var w2=g.measureText(sub).width;
  var ic=fs*1.18,bw=Math.max(w1,w2)+ic*2+fs*1.3,bh=fs*2.7,bx=x-bw/2,by=y-bh/2;
  g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=8;g.fillStyle='rgba(16,22,42,.88)';rr(bx,by,bw,bh,bh*.32);g.fill();g.shadowBlur=0;
  g.lineWidth=1.2;g.strokeStyle=op?'rgba(236,205,130,.85)':'rgba(150,150,185,.6)';g.stroke();
  g.beginPath();g.arc(bx+ic+fs*.2,y,ic*.78,0,6.2832);g.fillStyle='rgba(10,14,30,.95)';g.fill();g.strokeStyle=op?(G.c||'#ffd76a'):'#7c7c98';g.lineWidth=1.4;g.stroke();
  g.textAlign='center';g.font=(fs*1.05)+'px sans-serif';g.globalAlpha=op?1:.7;g.fillText(op?(G.e||'✦'):'🔒',bx+ic+fs*.2,y+fs*.06);g.globalAlpha=1;
  g.textAlign='left';var tx=bx+ic*2+fs*.55;
  g.font='700 '+fs+'px '+F;g.fillStyle=op?'#fff2c4':'#cfc9e6';g.fillText(nm,tx,y-fs*.52);
  g.font='600 '+(fs*.76)+'px '+F;g.fillStyle=op?'#ffd9a0':'#aaa3c8';g.fillText(sub,tx,y+fs*.66);
  g.restore()}
function gate(G,i,x,t,tgt){
  var L=A.L;if(!L)return false;
  if(x<-260||x>L.W+260)return true;                                   /* ngoài màn hình: bỏ qua */
  var sw=L.sw,op=!!G.open,rgb=G.rgb||'255,255,255',cy=L.dy+PCY*sw,rx=PRX*sw,ry=PRY*sw;
  g.save();
  if(i>0){g.save();g.globalCompositeOperation='lighter';glow(x,cy,ry*2.1,rgb,op?(.16+.1*Math.sin(t*.06+i)):.05);
    g.beginPath();g.ellipse(x,cy,rx,ry,0,0,6.2832);g.clip();
    var sp=op?1:.35;g.lineCap='round';
    for(var k=0;k<3;k++){var a0=t*.045*sp*(k%2?-1:1)+k*2.1,rad=.42+k*.26;g.strokeStyle='rgba('+rgb+','+(op?.55:.2)+')';g.lineWidth=Math.max(1,2.2*sw);g.beginPath();g.ellipse(x,cy,rx*rad,ry*rad,0,a0,a0+2.4);g.stroke()}
    if(op)glow(x,cy,rx*.9,'255,255,255',.18+.12*Math.sin(t*.1+i));
    g.restore();
    if(!op){g.save();g.beginPath();g.ellipse(x,cy,rx*1.12,ry*1.12,0,0,6.2832);g.fillStyle='rgba(8,6,26,.52)';g.fill();g.restore()}}
  g.restore();
  var fs=Math.max(12,Math.min(18,10.5*s)),ly=L.dy+LBL[i]*sw;
  banner(x,ly,G,op,fs);
  if(op||tgt===i){g.save();g.fillStyle=op?'#ffd54a':'#b9b4d0';g.font='bold '+fs+'px sans-serif';g.textAlign='center';g.fillText('▼',x,ly+fs*2.3+Math.sin(t*.12+i)*3);g.restore()}
  return true}
})();
