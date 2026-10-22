/* ===== 🏯 TIÊN GIỚI — NHÀ ĐẸP (world/133-tien-gioi-nha-dep.js · Fix412) =====
 * Nạp SAU world/90-tien-gioi-chi-tiet.js. Chỉ VẼ, không đụng logic/va chạm/vị trí.
 *   • TGD.roof  : mái ngói mới — góc mái cong vút (phi thiềm), sống mái có đầu xi vẫn (xi văn), thú vật trên bờ nóc,
 *                 ngói âm dương + hàng ngói, ngói đầu mái (đĩa vàng), vì kèo/xà đầu hồi, chuông gió ở 4 góc.
 *   • TGD.walls : tường đại điện — cột son, xà ngang vẽ màu (bành hoa văn), đấu củng, cửa sổ lưới/nguyệt môn/bát giác.
 *   • TGD.dec('cot') : thay hẳn nhà tiên gia (6 căn): bệ đá 2 tầng chạm hoa văn, bậc thềm, trụ góc, cửa đinh vàng,
 *                 biển hiệu, đèn lồng treo mái, hoa treo cửa sổ. Nhà tranh (hut) dùng mái rơm + tường ván.
 * Gỡ module = xoá thẻ <script> trong index.html (world/61 tự quay về mái/tường cũ vì hook có kiểm tra TGD.roof/TGD.walls).
 * Mọi sprite dựng 1 lần rồi cache (C.spr) nên không tốn FPS. */
(function(){
'use strict';
var TAU=Math.PI*2,PI=Math.PI;
function lerp(a,b,t){return a+(b-a)*t}
function LP(P,Q,s,bw){return[lerp(P[0],Q[0],s),lerp(P[1],Q[1],s)+bw*Math.sin(PI*s)]}
function poly(q,A){q.beginPath();for(var i=0;i<A.length;i++)i?q.lineTo(A[i][0],A[i][1]):q.moveTo(A[i][0],A[i][1]);q.closePath()}
function pline(q,A){q.beginPath();for(var i=0;i<A.length;i++)i?q.lineTo(A[i][0],A[i][1]):q.moveTo(A[i][0],A[i][1])}
function sh(A,dy){return A.map(function(p){return[p[0],p[1]+dy]})}
function dot(q,x,y,r,fill,stroke,lw){q.beginPath();q.arc(x,y,r,0,TAU);if(fill){q.fillStyle=fill;q.fill()}if(stroke){q.lineWidth=lw||1;q.strokeStyle=stroke;q.stroke()}}
var GOLD='#f4d36a',GOLD2='#c8962e',EDGE='rgba(70,40,10,.85)';

/* ============================== MÁI ============================== */
/* chiwen (xi vẫn) — vây rồng cuộn vào trong ở 2 đầu sống mái */
function chiwen(q,p,dir,k,C){q.save();q.translate(p[0],p[1]+k*.2);q.scale(dir,1);
 var g=C.lg(q,-k,-3.4*k,k*1.2,0,[0,'#fff0a8',.55,GOLD,1,GOLD2]);
 q.beginPath();q.moveTo(-.9*k,0);q.bezierCurveTo(-1.5*k,-1.2*k,-1.2*k,-2.5*k,-.3*k,-3.1*k);q.bezierCurveTo(.4*k,-3.7*k,1.3*k,-3.3*k,1.4*k,-2.6*k);
 q.bezierCurveTo(.7*k,-2.8*k,.2*k,-2.3*k,.4*k,-1.6*k);q.bezierCurveTo(.6*k,-1*k,.5*k,-.4*k,1*k,0);q.closePath();q.fillStyle=g;q.fill();q.lineWidth=1;q.strokeStyle=EDGE;q.stroke();
 q.strokeStyle='rgba(120,70,10,.7)';q.lineWidth=.8;q.beginPath();q.moveTo(-.9*k,-.6*k);q.quadraticCurveTo(-.5*k,-1.7*k,-.1*k,-2.1*k);q.moveTo(-.7*k,-1.9*k);q.quadraticCurveTo(-.2*k,-2.6*k,.5*k,-2.5*k);q.stroke();
 dot(q,-.25*k,-2.2*k,Math.max(.7,k*.14),'#5a1810');q.restore()}
/* bảo đỉnh hồ lô — mái vuông (đỉnh nhọn) */
function gourd(q,p,k,C){var g=C.lg(q,p[0]-k,0,p[0]+k,0,[0,GOLD2,.5,'#fff0a8',1,GOLD2]);q.fillStyle=g;q.strokeStyle=EDGE;q.lineWidth=1;
 [[0,1.05],[-1.7,.78],[-2.8,.56]].forEach(function(a){q.beginPath();q.ellipse(p[0],p[1]+a[0]*k,k*a[1],k*a[1]*.9,0,0,TAU);q.fill();q.stroke()});
 q.beginPath();q.moveTo(p[0]-k*.2,p[1]-3.4*k);q.lineTo(p[0],p[1]-5.2*k);q.lineTo(p[0]+k*.2,p[1]-3.4*k);q.closePath();q.fill();q.stroke()}
function bell(q,T,HW){var L=HW*.13,bx=T[0],by=T[1]+HW*.02;q.strokeStyle=GOLD2;q.lineWidth=1;q.beginPath();q.moveTo(bx,by);q.lineTo(bx,by+L);q.stroke();
 q.fillStyle='#ffd870';q.strokeStyle=EDGE;q.beginPath();q.moveTo(bx-HW*.038,by+L+HW*.055);q.quadraticCurveTo(bx-HW*.04,by+L-.5,bx,by+L-HW*.012);q.quadraticCurveTo(bx+HW*.04,by+L-.5,bx+HW*.038,by+L+HW*.055);q.closePath();q.fill();q.stroke();
 dot(q,bx,by+L+HW*.062,Math.max(.8,HW*.012),'#8a5a14')}

function roof(q,x0,y0,x1,y1,z,rise,ov,c1,c2,C,o){
 o=o||{};var ip=C.ip,HW=C.HW,ZU=C.ZU,lg=C.lg,th=!!o.thatch,i,t,s;
 var w=x1-x0,d=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2,xa=x0-ov,xb=x1+ov,ya=y0-ov,yb=y1+ov;
 var ext=th?.07:Math.min(.3,.12+ov*.3),lift=th?.08:.42,ze=z+.36,aY=d>=w,bw=ZU*(th?.07:.15);
 var rA,rB,rC,rD,r0,r1;
 if(aY){var n1=Math.max(.12,(w+2*ov)/2*.92);r0=ip(cx,ya+n1,z+rise);r1=ip(cx,yb-n1,z+rise);rA=rB=r0;rC=rD=r1}
 else{var n2=Math.max(.12,(d+2*ov)/2*.92);r0=ip(xa+n2,cy,z+rise);r1=ip(xb-n2,cy,z+rise);rA=rD=r0;rB=rC=r1}
 function K(t){return Math.pow(Math.abs(2*t-1),2.4)}
 function eX(yv,sg,xs,xe,n){var P=[],i,t,k;for(i=0;i<=n;i++){t=i/n;k=K(t);P.push(ip(lerp(xs,xe,t)+(t<.5?-ext:ext)*k,yv+sg*ext*k,ze+lift*k))}return P}
 function eY(xv,sg,ys,ye,n){var P=[],i,t,k;for(i=0;i<=n;i++){t=i/n;k=K(t);P.push(ip(xv+sg*ext*k,lerp(ys,ye,t)+(t<.5?-ext:ext)*k,ze+lift*k))}return P}
 function cnt(len){return Math.max(2,Math.round(len*3.2))*3}
 var nx=cnt(xb-xa),ny=cnt(yb-ya);
 var tA=ip(xa-ext,ya-ext,ze+lift),tB=ip(xb+ext,ya-ext,ze+lift),tC=ip(xb+ext,yb+ext,ze+lift),tD=ip(xa-ext,yb+ext,ze+lift);
 function hip(T,R){var P=[],n=16,i;for(i=0;i<=n;i++)P.push(LP(T,R,i/n,bw));return P}
 var hA=hip(tA,rA),hB=hip(tB,rB),hC=hip(tC,rC),hD=hip(tD,rD);
 var EAB=eX(ya,-1,xa,xb,nx),EBC=eY(xb,1,ya,yb,ny),EDC=eX(yb,1,xa,xb,nx),EAD=eY(xa,-1,ya,yb,ny);
 function F(E,hQ,hP){return{E:E,hQ:hQ,hP:hP,aP:hP[hP.length-1],aQ:hQ[hQ.length-1]}}
 var back,hipF,longF;
 if(aY){back=[F(EAD,hD,hA),F(EAB,hB,hA)];hipF=F(EDC,hC,hD);longF=F(EBC,hC,hB)}
 else{back=[F(EAB,hB,hA),F(EAD,hD,hA)];hipF=F(EBC,hC,hB);longF=F(EDC,hC,hD)}
 var minY=Math.min(r0[1],r1[1])-3,maxY=Math.max(tC[1],tD[1])+2;
 var gr=lg(q,0,minY,0,maxY,[0,c1,1,c2]),ed='rgba(10,8,24,.7)';
 function path(f){return f.E.concat(f.hQ.slice(1),f.hP.slice().reverse().slice(0,-1))}
 function fill(f,shade){poly(q,path(f));q.fillStyle=gr;q.fill();if(shade){q.fillStyle=shade;q.fill()}q.lineWidth=1;q.strokeStyle=ed;q.stroke()}
 back.forEach(function(f){fill(f,'rgba(10,20,50,.3)')});
 fill(hipF,'rgba(255,255,255,.03)');fill(longF,'rgba(10,20,50,.24)');
 /* ngói: hàng ngói + gờ ngói âm dương */
 function tiles(f){var E=f.E,n=E.length-1,aP=f.aP,aQ=f.aQ,Em=E[n>>1],dx=(aP[0]+aQ[0])/2-Em[0],dy=(aP[1]+aQ[1])/2-Em[1],j,step=th?1:3;
  function pt(e,s){return[e[0]+dx*s,e[1]+dy*s+bw*Math.sin(PI*Math.min(s,1))]}
  q.save();poly(q,path(f));q.clip();
  [.12,.25,.38,.51,.64,.77,.9,1.03,1.16].forEach(function(s){var L=E.map(function(e){return pt(e,s)});pline(q,L);q.strokeStyle='rgba(10,10,40,.28)';q.lineWidth=1;q.stroke();pline(q,sh(L,1));q.strokeStyle='rgba(255,255,255,.13)';q.stroke();
   if(!th)for(i=1;i<n;i+=3){dot(q,L[i][0]+HW*.045,L[i][1]-.5,.01,null)}});
  for(i=th?1:step;i<n;i+=step){var pts=[];for(j=0;j<=12;j++)pts.push(pt(E[i],j/10));
   pline(q,pts);if(th){q.strokeStyle=i%2?'rgba(110,80,30,.45)':'rgba(255,236,170,.4)';q.lineWidth=1;q.stroke()}
   else{q.strokeStyle='rgba(8,8,36,.4)';q.lineWidth=Math.max(1.3,HW*.032);q.stroke();pline(q,pts.map(function(p){return[p[0]+1.2,p[1]]}));q.strokeStyle='rgba(255,255,255,.22)';q.lineWidth=1;q.stroke()}}
  q.restore()}
 tiles(hipF);tiles(longF);
 /* mép mái: vì kèo (xà đầu hồi) + ngói đầu mái */
 function eave(E){var n=E.length-1,hf=ZU*(th?.1:.17);
  if(th){poly(q,E.concat(sh(E,hf).reverse()));q.fillStyle=lg(q,0,E[0][1],0,E[0][1]+hf*2,[0,'#d8b060',1,'#9a7430']);q.fill();
   for(i=0;i<=n;i++){var e=E[i];q.strokeStyle=i%2?'#8a6420':'#f0d890';q.lineWidth=1;q.beginPath();q.moveTo(e[0],e[1]);q.lineTo(e[0]+(i%3-1),e[1]+hf*(1.1+(i%4)*.18));q.stroke()}return}
  poly(q,E.concat(sh(E,hf).reverse()));q.fillStyle=lg(q,0,Math.min.apply(null,E.map(function(p){return p[1]})),0,maxY,[0,'#9a2e24',1,'#4a1412']);q.fill();
  poly(q,sh(E,hf).concat(sh(E,hf+ZU*.15).reverse()));q.fillStyle='rgba(15,8,25,.5)';q.fill();
  pline(q,sh(E,hf));q.strokeStyle=GOLD2;q.lineWidth=1.3;q.stroke();pline(q,E);q.strokeStyle='rgba(255,226,150,.55)';q.lineWidth=1;q.stroke();
  for(i=0;i<=n;i+=2)dot(q,E[i][0],E[i][1]+hf*.55,Math.max(.9,HW*.02),'#f2dca0','rgba(60,20,10,.6)',.5);
  for(i=0;i<=n;i+=3)dot(q,E[i][0],E[i][1]-.5,Math.max(1.4,HW*.036),GOLD,EDGE,1),dot(q,E[i][0],E[i][1]-.5,Math.max(.6,HW*.014),'#b5481e')}
 eave(EDC);eave(EBC);
 /* gờ mái (hip) + thú vật (tẩu thú) */
 [hA,hB,hD,hC].forEach(function(h,ix){pline(q,h);q.lineCap='round';q.lineJoin='round';q.strokeStyle=th?'#5a3e1c':'rgba(50,24,10,.75)';q.lineWidth=HW*(th?.06:.085);q.stroke();
  q.strokeStyle=th?'#a47c3a':lg(q,h[0][0],h[0][1],h[h.length-1][0],h[h.length-1][1],[0,'#fff0a8',1,GOLD2]);q.lineWidth=HW*(th?.035:.05);q.stroke();
  if(!th&&ix>0)for(i=0;i<3;i++){var p=h[3+i*2];dot(q,p[0],p[1]-HW*.02,HW*(.036-i*.006),GOLD,EDGE,.8)}});
 /* sống mái */
 var rl=Math.hypot(r1[0]-r0[0],r1[1]-r0[1]);
 pline(q,[r0,r1]);q.lineCap='round';q.strokeStyle=th?'#5a3e1c':'#4a2e10';q.lineWidth=HW*.115;q.stroke();
 q.strokeStyle=th?'#b88a3a':lg(q,r0[0],r0[1],r1[0],r1[1],[0,'#fff0a8',.5,GOLD,1,GOLD2]);q.lineWidth=HW*.075;q.stroke();
 if(rl>HW*.3){var nr=Math.max(2,Math.round(rl/(HW*.15)));for(i=0;i<=nr;i++){t=i/nr;var rx=lerp(r0[0],r1[0],t),ry=lerp(r0[1],r1[1],t);
   if(th){q.strokeStyle='#5a3e1c';q.lineWidth=1;q.beginPath();q.moveTo(rx-2,ry-2);q.lineTo(rx+2,ry+2);q.moveTo(rx+2,ry-2);q.lineTo(rx-2,ry+2);q.stroke()}
   else dot(q,rx,ry-HW*.01,HW*.027,'#ffe9a0',EDGE,.8)}}
 if(!th){if(rl>HW*.35){var k=HW*.11;chiwen(q,r0,r1[0]>r0[0]?-1:1,k,C);chiwen(q,r1,r0[0]>r1[0]?-1:1,k,C)}else gourd(q,[(r0[0]+r1[0])/2,(r0[1]+r1[1])/2],HW*.05,C)}
 else if(rl<=HW*.35){q.strokeStyle='#5a3e1c';q.lineWidth=1.6;q.beginPath();q.moveTo(r0[0],r0[1]);q.lineTo(r0[0],r0[1]-HW*.2);q.stroke()}
 /* mũi góc mái + chuông gió */
 if(!th){[tA,tB,tD,tC].forEach(function(T,ix){dot(q,T[0],T[1]-1,HW*.045,'#fff0a8',EDGE,1);dot(q,T[0]-.8,T[1]-2,HW*.016,'#ffffff');if(ix>0)bell(q,T,HW)})}
}

/* ============================== TƯỜNG ============================== */
var BEAM=['#2a5a86','#2a6a52','#6a3a86','#8a4a28','#2a6a6e','#7a2a4a'];
function win0(q,C,a,ww,wy,wh){q.fillStyle='#3a1a10';q.fillRect(a-.04,wy-.04,ww+.08,wh+.08);
 q.fillStyle=C.lg(q,0,wy,0,wy+wh,[0,'rgba(255,232,168,1)',1,'rgba(255,160,72,.98)']);q.fillRect(a,wy,ww,wh);
 q.strokeStyle='rgba(112,46,20,.9)';q.lineWidth=.02;q.beginPath();for(var i=1;i<4;i++){q.moveTo(a+ww*i/4,wy);q.lineTo(a+ww*i/4,wy+wh)}for(i=1;i<3;i++){q.moveTo(a,wy+wh*i/3);q.lineTo(a+ww,wy+wh*i/3)}q.stroke();
 q.beginPath();q.moveTo(a+ww/2,wy+wh*.2);q.lineTo(a+ww*.78,wy+wh/2);q.lineTo(a+ww/2,wy+wh*.8);q.lineTo(a+ww*.22,wy+wh/2);q.closePath();q.stroke();
 q.strokeStyle='rgba(236,196,96,.9)';q.lineWidth=.012;q.strokeRect(a+.012,wy+.012,ww-.024,wh-.024);
 q.fillStyle='#c9cfe0';q.fillRect(a-.08,wy-.075,ww+.16,.06);q.fillStyle='rgba(60,70,110,.5)';q.fillRect(a-.08,wy-.075,ww+.16,.012);
 q.fillStyle='#6a3a22';q.fillRect(a-.05,wy+wh+.03,ww+.1,.05);for(var f=0;f<5;f++)dot(q,a-.02+f*(ww+.04)/4,wy+wh+.055,.018,'#f0c050')}
function winRound(q,C,a,ww,wy,wh,oct){var R=Math.min(ww,wh)*.54,cx=a+ww/2,cy=wy+wh/2;
 function shape(r){q.beginPath();if(oct){for(var i=0;i<8;i++){var an=i/8*TAU+PI/8;i?q.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r):q.moveTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r)}q.closePath()}else q.arc(cx,cy,r,0,TAU)}
 shape(R+.065);q.fillStyle='#c9cfe0';q.fill();shape(R+.04);q.fillStyle='#3a1a10';q.fill();shape(R);q.fillStyle=C.lg(q,0,cy-R,0,cy+R,[0,'rgba(255,232,168,1)',1,'rgba(255,160,72,.98)']);q.fill();
 q.strokeStyle='rgba(112,46,20,.9)';q.lineWidth=.018;q.beginPath();for(var i=0;i<8;i++){var an=i/8*TAU;q.moveTo(cx,cy);q.lineTo(cx+Math.cos(an)*R,cy+Math.sin(an)*R)}q.stroke();
 q.beginPath();q.arc(cx,cy,R*.45,0,TAU);q.stroke();shape(R+.03);q.strokeStyle=GOLD;q.lineWidth=.016;q.stroke();dot(q,cx,cy,.03,GOLD,'#8a5a14',.01)}
function door(q,C,a,ww,hut){var h=hut?.7:.82,cx=a+ww/2,i,j,s;
 q.fillStyle=hut?'#7a5a3a':'#c3cadc';q.fillRect(a-.07,0,ww+.14,h+.09);q.fillStyle='#2a1208';q.fillRect(a,0,ww,h);
 var lw=ww/2-.012;for(s=0;s<2;s++){var lx=a+s*(ww/2+.012);
  q.fillStyle=C.lg(q,lx,0,lx+lw,0,[0,hut?'#6a4426':'#8a1c1c',.5,hut?'#a07844':'#c8382e',1,hut?'#6a4426':'#8a1c1c']);q.fillRect(lx,0,lw,h-.02);
  if(hut){q.strokeStyle='rgba(30,16,8,.6)';q.lineWidth=.014;q.beginPath();for(j=1;j<4;j++){q.moveTo(lx+lw*j/4,0);q.lineTo(lx+lw*j/4,h-.02)}q.stroke();q.fillStyle='#4a3a30';q.fillRect(lx,h*.28,lw,.035);q.fillRect(lx,h*.66,lw,.035)}
  else{q.strokeStyle='rgba(240,200,100,.85)';q.lineWidth=.012;q.strokeRect(lx+.03,.05,lw-.06,h-.13);
   for(i=0;i<3;i++)for(j=0;j<4;j++)dot(q,lx+lw*(.22+i*.28),.14+j*(h-.34)/3,.017,GOLD,'rgba(90,40,10,.7)',.006);
   dot(q,s?lx+.05:lx+lw-.05,h*.42,.03,null,GOLD,.016);dot(q,s?lx+.05:lx+lw-.05,h*.42,.012,GOLD)}}
 if(!hut){q.fillStyle='#2a1208';q.fillRect(cx-ww*.36,h+.115,ww*.72,.1);q.strokeStyle=GOLD;q.lineWidth=.012;q.strokeRect(cx-ww*.36,h+.115,ww*.72,.1);for(i=0;i<3;i++)dot(q,cx-ww*.18+i*ww*.18,h+.165,.017,GOLD)}}
function wallFace(q,C,u,H,o){
 var n=o.n||Math.max(2,Math.round(u/.9)),bw=u/n,k,i,pil=o.pil||'#b82a22',hut=!!o.hut,wain=H*.19,wy=H*.33,wh=H*.31,bY=H*.7,bH=H*.13,vv=Math.abs(o.v|0),rr=C.rng(vv*977+(u*100|0)+(o.isY?7:3));
 q.fillStyle=C.lg(q,0,0,0,H,[0,'rgba(255,255,255,.1)',1,'rgba(0,0,50,.26)']);q.fillRect(0,0,u,H);
 if(hut){q.strokeStyle='rgba(60,36,18,.5)';q.lineWidth=.014;q.beginPath();for(i=1;i<u/.1;i++){q.moveTo(i*.1,0);q.lineTo(i*.1,H)}q.stroke();
  q.fillStyle='rgba(60,36,18,.55)';q.fillRect(0,H-.1,u,.1);q.fillRect(0,H*.42,u,.04);q.fillStyle='rgba(255,230,180,.18)';for(i=0;i<u/.1;i+=2)q.fillRect(i*.1+.02,0,.025,H)}
 else{/* chân tường đá xây */
  q.fillStyle=C.lg(q,0,0,0,wain,[0,'rgba(92,102,138,.7)',1,'rgba(130,140,172,.5)']);q.fillRect(0,0,u,wain);
  q.strokeStyle='rgba(50,58,96,.5)';q.lineWidth=.012;q.beginPath();for(var rw=0;rw<3;rw++){var yy=wain*(rw+1)/3;q.moveTo(0,yy);q.lineTo(u,yy);for(i=((rw&1)?.13:0);i<u;i+=.26){q.moveTo(i,wain*rw/3);q.lineTo(i,wain*(rw+1)/3)}}q.stroke();
  q.fillStyle='#9aa2c0';q.fillRect(0,wain,u,.03);q.fillStyle='rgba(255,255,255,.35)';q.fillRect(0,wain+.03,u,.01);
  /* xà ngang vẽ màu (bành hoa văn) */
  q.fillStyle=o.beam||BEAM[0];q.fillRect(0,bY,u,bH);q.fillStyle='rgba(0,0,0,.18)';q.fillRect(0,bY,u,bH*.28);
  q.fillStyle='#e6bc58';q.fillRect(0,bY,u,.02);q.fillRect(0,bY+bH-.02,u,.02);q.fillStyle='#fff0b0';q.fillRect(0,bY+.02,u,.008);
  for(k=0;k<n;k++){var mx=(k+.5)*bw,hw2=Math.min(bw*.22,.16);
   q.beginPath();q.moveTo(mx,bY+bH*.14);q.lineTo(mx+hw2,bY+bH/2);q.lineTo(mx,bY+bH*.86);q.lineTo(mx-hw2,bY+bH/2);q.closePath();q.fillStyle=GOLD;q.fill();q.lineWidth=.012;q.strokeStyle='#7a4a10';q.stroke();
   dot(q,mx,bY+bH/2,.022,'#b5281e');
   [-1,1].forEach(function(sd){var bx=mx+sd*bw*.3;q.strokeStyle='rgba(240,200,100,.9)';q.lineWidth=.014;q.beginPath();q.arc(bx,bY+bH/2,bH*.26,sd>0?-PI/2:PI/2,sd>0?PI/2:PI*1.5,sd<0);q.stroke();dot(q,bx,bY+bH/2,.012,'#fff0b0');
    q.fillStyle='#4ac8a0';q.beginPath();q.moveTo(k*bw+(sd>0?bw-.1:.1),bY+bH);q.lineTo(k*bw+(sd>0?bw-.1:.1)+sd*-.07,bY+bH*.35);q.lineTo(k*bw+(sd>0?bw-.1:.1)+sd*-.14,bY+bH);q.closePath();q.fill()})}
  /* bậc xà trên + đầu kèo (xà vòm) */
  q.fillStyle='#3a1612';q.fillRect(0,bY+bH,u,H-bY-bH);q.fillStyle='#e6bc58';q.fillRect(0,bY+bH,u,.015);
  for(i=.04;i<u;i+=.085)dot(q,i,H-.06,.017,'#f2dca0','rgba(60,20,10,.7)',.5)}
 /* cột + đấu củng */
 for(k=0;k<=n;k++){var x=k*bw;
  q.fillStyle=C.lg(q,x-.05,0,x+.05,0,[0,hut?'#5a3a20':'#7a1410',.45,hut?'#8a6238':pil,1,hut?'#5a3a20':'#8e1c18']);q.fillRect(x-.05,.05,.1,H-.05);
  q.fillStyle='rgba(255,230,170,.3)';q.fillRect(x-.02,.06,.018,H*.62);
  if(!hut){q.fillStyle='#8e96b4';q.fillRect(x-.08,0,.16,.075);q.fillStyle='#d4d9e8';q.fillRect(x-.08,.075,.16,.014);
   q.fillStyle='#e6bc58';q.fillRect(x-.06,wain+.04,.12,.028);q.fillRect(x-.06,bY-.03,.12,.026);
   /* đấu củng */
   q.fillStyle='#d8a838';q.fillRect(x-.1,bY+bH-.005,.2,.03);q.fillStyle='#b82a22';q.fillRect(x-.075,bY+bH+.025,.15,.035);q.fillStyle=GOLD;q.fillRect(x-.14,bY+bH+.06,.28,.028);q.fillStyle='#8e1c18';q.fillRect(x-.1,bY+bH+.088,.2,.03)}}
 /* ô cửa theo từng gian */
 var dk=o.door?(o.dk!=null?o.dk:Math.floor(n/2)):-1;
 for(k=0;k<n;k++){var a=k*bw+.15,ww=bw-.3;
  if(k===dk){door(q,C,a,ww,hut);continue}
  if(hut){if(o.isY===0&&k===0)continue;q.fillStyle='#3a2014';q.fillRect(a-.03,wy-.03,ww+.06,wh+.06);q.fillStyle=C.lg(q,0,wy,0,wy+wh,[0,'rgba(255,224,150,.98)',1,'rgba(255,166,80,.95)']);q.fillRect(a,wy,ww,wh);
   q.strokeStyle='rgba(110,44,20,.85)';q.lineWidth=.02;q.beginPath();q.moveTo(a+ww/2,wy);q.lineTo(a+ww/2,wy+wh);q.moveTo(a,wy+wh/2);q.lineTo(a+ww,wy+wh/2);q.stroke();
   q.fillStyle='#6a4426';q.fillRect(a-.1,wy-.01,.1,wh+.02);q.fillRect(a+ww,wy-.01,.1,wh+.02);q.fillStyle='#4a2a18';q.fillRect(a-.05,wy-.07,ww+.1,.05);continue}
  var ty=(vv+k+(o.isY?0:1))%3;
  if(ty===1)winRound(q,C,a,ww,wy,wh,0);else if(ty===2&&ww>.4)winRound(q,C,a,ww,wy,wh,1);else win0(q,C,a,ww,wy,wh);
  if(!hut){/* chậu hoa treo dưới cửa sổ */
   q.fillStyle='#6a3a22';q.fillRect(a-.03,wy-.19,ww+.06,.09);q.fillStyle='rgba(255,220,160,.25)';q.fillRect(a-.03,wy-.19,ww+.06,.015);
   var fc=[['#ff8fb4','#ffd0e0'],['#ffd86a','#fff4b0'],['#b890ff','#e4d4ff']][(k+vv)%3];
   for(i=0;i<6;i++){var fx=a+i*ww/5,fy=wy-.21-rr()*.06;dot(q,fx,fy,.034,fc[0],'rgba(60,20,30,.4)',.006);dot(q,fx-.008,fy-.01,.012,fc[1]);q.strokeStyle='#3a8a54';q.lineWidth=.016;q.beginPath();q.moveTo(fx,wy-.19);q.quadraticCurveTo(fx+.03,wy-.26,fx+.015,wy-.3);q.stroke()}}}
 if(!o.isY){q.fillStyle='rgba(20,20,70,.16)';q.fillRect(0,0,u,H)}
 q.fillStyle='rgba(0,0,0,.2)';q.fillRect(0,H-.06,u,.06)}
function hallWalls(q,x0,y0,x1,y1,z0,h,o,C){
 C.box(q,x0,y0,x1,y1,z0,z0+h,o.top||'#cfc7b4',C.mixc(o.wall,'#2a2a50',.45),o.wall);
 function nb(w){return Math.max(2,Math.round(w/.85))}
 var bc=BEAM[Math.abs((x0*7+y0*13)|0)%BEAM.length];
 C.FY(q,x0,y1,z0,function(q){wallFace(q,C,x1-x0,h,{n:nb(x1-x0),isY:1,door:!!o.door,pil:o.pil,beam:bc,v:(x0|0)})});
 C.FX(q,x1,y0,z0,function(q){wallFace(q,C,y1-y0,h,{n:nb(y1-y0),isY:0,door:false,pil:o.pil,beam:bc,v:(y0|0)})})}

/* bệ đá đại điện/đình: hoa văn hình thoi, bậc thềm giữa, cọc lan can đầu sen ở 3 góc */
function base(q,x0,y0,x1,y1,z0,z1,C){var hh=z1-z0,cx=(x0+x1)/2,HW=C.HW,ip=C.ip,st=['#e6eaf4','#848aa6','#bcc4d8'];
 function chain(u){return function(q){q.fillStyle='rgba(255,255,255,.3)';q.fillRect(0,hh*.86,u,.012);q.fillStyle='rgba(60,70,120,.35)';q.fillRect(0,hh*.12,u,.012);q.strokeStyle='rgba(60,70,120,.62)';q.lineWidth=.012;
  for(var m=.14;m<u-.08;m+=.28){q.beginPath();q.moveTo(m,hh*.5-hh*.3);q.lineTo(m+.09,hh*.5);q.lineTo(m,hh*.5+hh*.3);q.lineTo(m-.09,hh*.5);q.closePath();q.stroke();dot(q,m,hh*.5,.016,GOLD2)}}}
 C.FY(q,x0,y1,z0,chain(x1-x0));C.FX(q,x1,y0,z0,chain(y1-y0));
 C.box(q,cx-.62,y1,cx+.62,y1+.36,z0,z0+hh*.42,st[0],st[1],st[2]);C.box(q,cx-.52,y1,cx+.52,y1+.19,z0+hh*.42,z0+hh*.78,st[0],st[1],st[2]);
 [[x0+.13,y1-.13],[x1-.13,y1-.13],[x1-.13,y0+.13]].forEach(function(p){C.box(q,p[0]-.055,p[1]-.055,p[0]+.055,p[1]+.055,z1,z1+.26,'#e6eaf4','#848aa6','#bcc4d8');C.box(q,p[0]-.07,p[1]-.07,p[0]+.07,p[1]+.07,z1+.26,z1+.31,'#f2f4fb','#8e96b4','#c6cee0');var t=ip(p[0],p[1],z1+.35);dot(q,t[0],t[1],HW*.04,'#fff0a8',EDGE,.8)})}
/* ============================== NHÀ TIÊN GIA ============================== */
function lantern(q,x,y,HW,col){q.strokeStyle='#5a3a22';q.lineWidth=1;q.beginPath();q.moveTo(x,y-HW*.14);q.lineTo(x,y);q.stroke();
 q.fillStyle=GOLD2;q.fillRect(x-HW*.045,y,HW*.09,HW*.022);
 var g=q.createRadialGradient(x-1,y+HW*.07,1,x,y+HW*.08,HW*.1);g.addColorStop(0,'#ff8a5a');g.addColorStop(.6,col||'#e03a2a');g.addColorStop(1,'#8a1410');
 q.fillStyle=g;q.beginPath();q.ellipse(x,y+HW*.085,HW*.065,HW*.075,0,0,TAU);q.fill();q.strokeStyle='rgba(60,10,6,.5)';q.lineWidth=.8;q.beginPath();q.ellipse(x,y+HW*.085,HW*.03,HW*.075,0,0,TAU);q.stroke();
 q.fillStyle=GOLD2;q.fillRect(x-HW*.045,y+HW*.145,HW*.09,HW*.022);q.strokeStyle='#e8c050';q.lineWidth=1;q.beginPath();q.moveTo(x,y+HW*.167);q.lineTo(x,y+HW*.24);q.moveTo(x-1.5,y+HW*.167);q.lineTo(x-2,y+HW*.22);q.moveTo(x+1.5,y+HW*.167);q.lineTo(x+2,y+HW*.22);q.stroke()}
function cottage(q,C,h){
 var w=h.w,d=h.d,x0=-w/2,x1=w/2,y0=-d/2,y1=d/2,ip=C.ip,box=C.box,HW=C.HW,hut=!!h.hut,H=hut?1.3:1.75,z0=.28,wallC=h.wall,mix=C.mixc,i;
 C.GR(q,0,0,0,function(q){q.fillStyle='rgba(0,0,30,.24)';q.beginPath();q.ellipse(0,0,w*.82,d*.82,0,0,TAU);q.fill()});
 var top='#e9edf5',R='#848aa6',Lf='#bcc4d8';
 box(q,x0-.22,y0-.22,x1+.22,y1+.22,0,.14,'#dfe4ef','#7c829c','#b4bcd0');
 box(q,x0-.12,y0-.12,x1+.12,y1+.12,.14,z0,top,R,Lf);
 function chain(u){return function(q){q.fillStyle='rgba(255,255,255,.28)';q.fillRect(0,.1,u,.012);q.strokeStyle='rgba(60,70,120,.6)';q.lineWidth=.012;
  for(var m=.1;m<u-.05;m+=.2){q.beginPath();q.moveTo(m,.07);q.lineTo(m+.07,.115);q.lineTo(m,.16);q.lineTo(m-.07,.115);q.closePath();q.stroke();dot(q,m,.115,.012,GOLD2)}}}
 C.FY(q,x0-.12,y1+.12,.0,chain(w+.24));C.FX(q,x1+.12,y0-.12,.0,chain(d+.24));
 var n=Math.max(2,Math.round((hut?d:w)/.9)),nY=Math.max(2,Math.round(w/.9)),nX=Math.max(2,Math.round(d/.9)),dkY=Math.floor(nY/2),dkX=Math.floor(nX/2);
 /* bậc thềm trước cửa */
 var st=['#e6eaf4','#848aa6','#bcc4d8'];
 if(h.f==='y'){var sx=x0+(dkY+.5)*w/nY;box(q,sx-.44,y1+.22,sx+.44,y1+.52,0,.08,st[0],st[1],st[2]);box(q,sx-.38,y1+.12,sx+.38,y1+.36,.08,.17,st[0],st[1],st[2])}
 else{var sy=y0+(dkX+.5)*d/nX;box(q,x1+.22,sy-.44,x1+.52,sy+.44,0,.08,st[0],st[1],st[2]);box(q,x1+.12,sy-.38,x1+.36,sy+.38,.08,.17,st[0],st[1],st[2])}
 /* tường */
 box(q,x0,y0,x1,y1,z0,z0+H,'#e8dfc8',mix(wallC,'#2a2a50',.5),wallC);
 var bc=BEAM[h.v%BEAM.length],pil=hut?'#7a5230':'#c22e26';
 C.FY(q,x0,y1,z0,function(q){wallFace(q,C,w,H,{n:nY,isY:1,door:h.f==='y',dk:dkY,pil:pil,beam:bc,v:h.v,hut:hut})});
 C.FX(q,x1,y0,z0,function(q){wallFace(q,C,d,H,{n:nX,isY:0,door:h.f==='x',dk:dkX,pil:pil,beam:bc,v:h.v,hut:hut})});
 /* trụ góc 3D */
 function post(px,py){if(hut){box(q,px-.07,py-.07,px+.07,py+.07,z0,z0+H,'#9a7248','#5a3a20','#7a5430');return}
  box(q,px-.075,py-.075,px+.075,py+.075,z0,z0+H,'#e8604f','#8a1a16','#c4382c');box(q,px-.1,py-.1,px+.1,py+.1,z0,z0+.1,'#aab2c8','#6c7290','#8e96b4');
  box(q,px-.078,py-.078,px+.078,py+.078,z0+.34,z0+.37,'#c8962e','#a67a20','#e6bc58');box(q,px-.078,py-.078,px+.078,py+.078,z0+H*.7-.035,z0+H*.7,'#c8962e','#a67a20','#e6bc58')}
 post(x0,y1);post(x1,y1);post(x1,y0);
 /* mái */
 roof(q,x0,y0,x1,y1,z0+H,hut?.7:.85,hut?.34:.4,h.rf[0],h.rf[1],C,{thatch:hut});
 /* ống khói */
 if(!hut){var cx=h.f==='y'?x1-.5:x0+.45,cy=y0+.4,zb=z0+H+.5;box(q,cx-.17,cy-.17,cx+.17,cy+.17,zb,zb+.95,'#d8d2c6','#6a6258','#a49c90');
  box(q,cx-.22,cy-.22,cx+.22,cy+.22,zb+.95,zb+1.08,'#c4bcae','#5a5248','#8c8478');box(q,cx-.14,cy-.14,cx+.14,cy+.14,zb+1.08,zb+1.16,'#4a443c','#2a2620','#3a342c');
  var cp=ip(cx,cy,zb+.5);q.strokeStyle='rgba(60,50,40,.45)';q.lineWidth=1;q.beginPath();q.moveTo(cp[0]-HW*.1,cp[1]);q.lineTo(cp[0]+HW*.1,cp[1]+HW*.04);q.stroke()}
 /* đèn lồng treo dưới mái, 2 bên cửa */
 if(!hut){var zl=z0+H+.1;if(h.f==='y'){[-.5,.5].forEach(function(o){var p=ip(sx+o,y1+.3,zl);lantern(q,p[0],p[1],HW,o<0?'#e03a2a':'#d8502a')})}
  else{[-.5,.5].forEach(function(o){var p=ip(x1+.3,sy+o,zl);lantern(q,p[0],p[1],HW,o<0?'#e03a2a':'#d8502a')})}}
 /* cọc đá lan can ở 2 góc bệ */
 if(!hut)[[x0-.16,y1+.16],[x1+.16,y1+.16],[x1+.16,y0-.16]].forEach(function(p){box(q,p[0]-.05,p[1]-.05,p[0]+.05,p[1]+.05,.14,.42,'#e6eaf4','#848aa6','#bcc4d8');var t=ip(p[0],p[1],.46);dot(q,t[0],t[1],HW*.04,'#fff0a8',EDGE,.8)})}
function cotSprite(C,v){var h=window.TGD&&TGD.houses&&TGD.houses[v];if(!h)return null;
 var hw=(h.w+h.d)*C.HW/2+C.HW*2.6,up=C.ZU*4.5,dn=(h.w+h.d)*C.HH/2+C.HH*3.2;
 return C.spr('xcp'+v,hw*2,up+dn,hw,up,function(q){cottage(q,C,h)},C.dG())}

/* ============================== NỐI VÀO world/61 + world/90 ============================== */
function hook(){if(!window.TGD)return;var D=TGD,_dec=D.dec;
 D.roof=function(q,x0,y0,x1,y1,z,rise,ov,c1,c2,C){roof(q,x0,y0,x1,y1,z,rise,ov,c1,c2,C,null)};
 D.walls=hallWalls;D.base=base;
 D.dec=function(k,v,C){if(k==='cot'){try{var r=cotSprite(C,v);if(r)return r}catch(e){console.error('TGD2',e)}}return _dec(k,v,C)};
 D.nhaDep=1}
hook();
})();
