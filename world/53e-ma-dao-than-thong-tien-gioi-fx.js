/* ===== 🩸 DỤC NƯƠNG HUYẾT CHÚ + 🌀 VẠN NIỆM CÂU HỒN · BẢN VẼ CHO TIÊN GIỚI 2.5D (world/53e-ma-dao-than-thong-tien-gioi-fx.js) — nạp SAU world/53c =====
 * Cắm vào khung của world/53c (MDTG.K) và bọc R.ycM / R.ycS (world/79) CHỈ cho nhánh Ma Đạo (F.ma). KHÔNG đụng TGQ.cast / sát thương / MP / hồi chiêu.
 * DỤC NƯƠNG (kiểu M — world/81 đánh 5 nhịp, mỗi 7 khung vào địch gần nhất trong 600): pháp trận huyết ngũ giác dưới chân · 6 oán linh bay vòng quanh nhân vật (vệt mờ) · 5 lá huyết chú quay quanh rồi bay đeo bám 5 quái gần nhất
 *   (vòng chú đỏ quanh người quái, máu nhỏ giọt, vết chém máu lúc chạm).
 * VẠN NIỆM (kiểu S — world/81 đánh MỌI quái trong 900, trễ 3 khung/quái): pháp trận ma niệm xoáy dưới chân + vòng hút co lại · hố đen trên đầu nhân vật · xích sắt tím từ hố đen tới từng quái · gai ma khí nổ trên quái.
 * Nền thành thị sáng → lớp tím/đỏ sẫm bên dưới để ánh sáng nổi. Nhánh Map Treo/2D: bản vẽ rỗng (world/53d đã vẽ). Tiên Đạo giữ nguyên.
 * Chỉnh: MDTG2.cfg.q · MDTG2.cfg.enable=false → bản vẽ cũ. Phụ thuộc: world/53c (MDTG.X/K), 53b (MDFX.H), 53 (YCFXLIB.wraithDraw), 79 (TG8SK.R). Thiếu → không làm gì. */
(function(){
'use strict';
var D=window.MDTG,L=window.YCFXLIB,M=window.MDFX;
if(!D||!D.X||!L||!M||!M.H||!L.wraithDraw||!window.TG8SK||!TG8SK.R||typeof g==='undefined')return;
var X=D.X,K=D.K,R=TG8SK.R,H=M.H,blob=L.blob,hs=L.hs,easeO=L.easeO,PI=Math.PI,TAU=PI*2,CFG={enable:true,q:1},origM=R.ycM,origS=R.ycS;
function fa(p,a0,a1){return p<a0?p/a0:p>1-a1?(1-p)/a1:1}
function qq(){return Math.max(.35,Math.min(1,CFG.q*X.Q()))}
function near(e,maxD,n){return X.mons().map(function(m){var r=X.mrel(e,m);return{m:m,r:r,d:Math.hypot(r.D,r.L)}}).filter(function(o){return o.d<maxD}).sort(function(a,b){return a.d-b.d}).slice(0,n)}
function paper(x,y,rot,al,seed){var w=14*s,h=44*s;
 g.save();g.translate(x,y);g.rotate(rot);
 g.globalCompositeOperation='lighter';blob(0,0,34*s,'255,30,70',.45*al);
 g.globalCompositeOperation='source-over';g.globalAlpha=al;
 var gd=g.createLinearGradient(0,-h/2,0,h/2);gd.addColorStop(0,'#f03050');gd.addColorStop(1,'#5a0818');g.fillStyle=gd;g.fillRect(-w/2,-h/2,w,h);
 g.fillStyle='#ffd070';g.fillRect(-w/2,-h/2,w,3*s);g.fillRect(-w/2,h/2-3*s,w,3*s);
 g.strokeStyle='#ffd8e0';g.lineWidth=s;g.strokeRect(-w/2,-h/2,w,h);
 g.strokeStyle='#26030c';g.lineWidth=1.7*s;g.save();g.translate(0,-9*s);H.glyph(seed*5.3,9*s);g.restore();g.save();g.translate(0,8*s);H.glyph(seed*7.9+3,9*s);g.restore();
 g.restore()}
function link(x,y,an,al,col,k){
 g.save();g.translate(x,y);g.rotate(an);
 g.globalCompositeOperation='source-over';g.globalAlpha=al;g.strokeStyle='#120a1e';g.lineWidth=3.4*s;g.beginPath();if(k&1)g.ellipse(0,0,7.5*s,4*s,0,0,TAU);else g.ellipse(0,0,4*s,6*s,0,0,TAU);g.stroke();
 g.globalCompositeOperation='lighter';g.globalAlpha=al*.85;g.strokeStyle=col;g.lineWidth=1.2*s;g.beginPath();if(k&1)g.ellipse(0,0,7.5*s,4*s,0,0,TAU);else g.ellipse(0,0,4*s,6*s,0,0,TAU);g.stroke();
 g.restore()}
function chain(x0,y0,x1,y1,grow,al,col,sway){
 var mx=(x0+x1)/2+sway,my=(y0+y1)/2+30*s,N=16,k;
 for(k=0;k<=N;k++){var u=k/N*grow,q=1-u,x=q*q*x0+2*q*u*mx+u*u*x1,y=q*q*y0+2*q*u*my+u*u*y1,dx=2*q*(mx-x0)+2*u*(x1-mx),dy=2*q*(my-y0)+2*u*(y1-my);link(x,y,Math.atan2(dy,dx),al,col,k)}}

/* ================= DỤC NƯƠNG ================= */
K.dn={
 ground:function(e){
  var t=fr-e.t0,p=t/e.life,a=fa(p,.06,.1),gr=easeO(p/.1),o=X.org(),i,Ro=150*s*gr,pul=.65+.35*Math.sin(fr*.25);
  g.save();g.globalCompositeOperation='lighter';
  blob(o[0],o[1]-4*s,260*s,'150,16,60',.34*a);blob(o[0],o[1]-4*s,140*s,'255,30,80',.3*a*pul);
  g.translate(o[0],o[1]-3*s);g.scale(1,.5);
  g.globalCompositeOperation='source-over';g.globalAlpha=.55*a;g.fillStyle='#2a0410';g.beginPath();g.arc(0,0,Ro*.98,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.save();g.rotate(fr*.012);H.ring(Ro,5*s,'#ff2a5a',.9*a);H.ring(Ro*1.05,2*s,'#9a50ff',.7*a);H.ring(Ro*.93,1.8*s,'#ffd0dc',.55*a);
  g.strokeStyle='#ffc0d0';g.lineWidth=1.7*s;g.globalAlpha=.85*a*pul;
  for(i=0;i<22;i++){g.save();g.rotate(i/22*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);H.glyph(i*4.1+9,12*s);g.restore()}g.restore();
  g.save();g.rotate(-fr*.018);var rs=Ro*.8,pts=[];for(i=0;i<5;i++){var an=i*TAU/5-PI/2;pts.push([Math.cos(an)*rs,Math.sin(an)*rs])}
  g.strokeStyle='#ff5a8a';g.lineWidth=3.6*s;g.globalAlpha=.9*a;g.beginPath();[0,2,4,1,3,0].forEach(function(k,j){j?g.lineTo(pts[k][0],pts[k][1]):g.moveTo(pts[k][0],pts[k][1])});g.stroke();
  g.strokeStyle='#ffd0e0';g.lineWidth=1.2*s;g.globalAlpha=.7*a;g.stroke();
  for(i=0;i<5;i++){g.globalAlpha=a;g.fillStyle='#ff2a5a';g.beginPath();g.arc(pts[i][0],pts[i][1],9*s,0,TAU);g.fill();g.fillStyle='#fff0f4';g.beginPath();g.arc(pts[i][0],pts[i][1],3.6*s,0,TAU);g.fill()}
  g.restore();H.ring(Ro*.36,3.4*s,'#ff2a6a',.8*a*pul);
  g.restore()},
 top:function(e){
  var t=fr-e.t0,p=t/e.life,a=fa(p,.04,.12),o=X.org(),i,k,N=5;
  if(!e.tg&&t>=6){var A=near(e,600,N);e.tg=[];for(i=0;i<N;i++)e.tg.push(A.length?A[i%A.length]:{m:null,fx:300+i*40,fl:(i-2)*34})}
  g.save();
  /* oán linh bay vòng quanh nhân vật */
  var nW=qq()<.6?4:6;
  for(i=0;i<nW;i++){
   var sp=.045+(i%3)*.012,Rr=(120+(i%3)*40)*s,hh=(48+(i%3)*30)*s,sc=.8+(i%3)*.12;
   for(k=3;k>=0;k--){var t2=fr-k*3.4,an=t2*sp+i*1.1,x=o[0]+Math.cos(an)*Rr,y=o[1]+Math.sin(an)*Rr*.5-hh-Math.sin(t2*.13+i)*8*s,dir=Math.sin(an)>0?-1:1;
    try{L.wraithDraw(x,y,dir,a*(k?.15:1),t2,i,sc,!!k)}catch(x2){}}}
  /* 5 huyết chú */
  var P2=[];
  for(i=0;i<N;i++){
   var ts=6+i*6,fl=14,ang=fr*.12+i*TAU/N,ox=o[0]+Math.cos(ang)*70*s,oy=o[1]-(66+Math.sin(ang)*14)*s,rs=easeO(t/14),x3=ox,y3=oy-(1-rs)*50*s,rot=Math.sin(fr*.05+i)*.2;
   if(e.tg&&t>=ts){
    var T=e.tg[i],tp=T.m?X.mpos(e,T.m):null,hx,hy,hgt=T.m?(T.m.hh||60)*.7:60;
    if(T.m){hx=tp[0];hy=tp[1]-((T.m.z||0)+hgt+24)*s}else{var q0=X.off(e,T.fx,T.fl);hx=o[0]+q0[0];hy=o[1]+q0[1]-70*s}
    var u=Math.min(1,(t-ts)/fl),ea=easeO(u);
    var an0=(e.t0+ts)*.12+i*TAU/N,sx=o[0]+Math.cos(an0)*70*s,sy=o[1]-(66+Math.sin(an0)*14)*s;
    if(u<1){x3=sx+(hx-sx)*ea;y3=sy+(hy-sy)*ea-Math.sin(ea*PI)*40*s;rot=Math.atan2(hy-sy,hx-sx)*.35+Math.sin(fr*.4)*.1;
     g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.strokeStyle='#ff2a5a';g.lineWidth=5*s;g.lineCap='round';g.beginPath();g.moveTo(sx+(x3-sx)*.55,sy+(y3-sy)*.55+12*s);g.lineTo(x3,y3);g.stroke();g.restore()}
    else{x3=hx+Math.sin(fr*.07+i)*3*s;y3=hy+Math.sin(fr*.09+i*2)*4*s;rot=Math.sin(fr*.06+i)*.15;
     if(!e['l'+i]){e['l'+i]=1;e.hits=e.hits||[];e.hits.push({m:T.m,x:hx,y:hy+24*s,t0:fr,sd:i*3.7+e.t0})}
     if(T.m){var mm=X.mpos(e,T.m),cy=mm[1]-((T.m.z||0)+hgt*.5)*s;g.save();g.globalCompositeOperation='lighter';g.translate(mm[0],mm[1]-(T.m.z||0)*s);g.scale(1,.5);g.rotate(fr*.05+i);
      H.ring(30*s,2.6*s,'#ff2a5a',.85*a);H.ring(21*s,1.3*s,'#ffd0dc',.6*a);g.strokeStyle='#ffc0d0';g.lineWidth=1.4*s;g.globalAlpha=.85*a;
      for(k=0;k<8;k++){g.save();g.rotate(k/8*TAU);g.translate(25*s,0);H.glyph(k*3+i*11,7*s);g.restore()}g.restore();
      g.save();g.globalCompositeOperation='lighter';for(k=0;k<3;k++){var d=(fr*.03+k/3+i*.2)%1;blob(x3+(k-1)*7*s,y3+12*s+d*((T.m.z||0)+hgt)*s*.8,3*s,'255,40,90',.9*(1-d)*a)}g.restore()}}
   }
   P2.push([x3,y3,rot,i+1])}
  P2.forEach(function(q){paper(q[0],q[1],q[2],a,q[3])});
  /* vết chém máu lúc chạm */
  e.hits=(e.hits||[]).filter(function(h){var hp=(fr-h.t0)/16;if(hp>=1)return false;var ha=1-hp,hx=h.m?X.mpos(e,h.m):[h.x,h.y],cx=hx[0],cy=h.m?hx[1]-((h.m.z||0)+(h.m.hh||60)*.35)*s:h.y,j;
   g.save();g.globalCompositeOperation='lighter';blob(cx,cy,(26+28*hp)*s,'255,40,90',.65*ha);g.lineCap='round';
   for(j=0;j<3;j++){var of=(j-1)*11*s,len=(40+j*8)*s*Math.min(1,hp*3+.25);
    g.globalAlpha=ha*.8;g.strokeStyle='#ff2a5a';g.lineWidth=5*s;g.beginPath();g.moveTo(cx-len*.5+of,cy-len*.6);g.lineTo(cx+len*.5+of,cy+len*.6);g.stroke();
    g.globalAlpha=ha;g.strokeStyle='#fff0f4';g.lineWidth=1.6*s;g.beginPath();g.moveTo(cx-len*.5+of,cy-len*.6);g.lineTo(cx+len*.5+of,cy+len*.6);g.stroke()}
   for(j=0;j<6;j++){var an2=-PI/2+(hs(h.sd+j)-.5)*2.2,spd=(26+hs(h.sd+j+5)*30)*s;blob(cx+Math.cos(an2)*spd*hp,cy+Math.sin(an2)*spd*hp+50*s*hp*hp,3*s,'255,40,90',.9*ha)}
   g.restore();return true});
  g.restore()}
};

/* ================= VẠN NIỆM ================= */
K.vn={
 ground:function(e){
  var t=fr-e.t0,p=t/e.life,a=fa(p,.08,.14),gr=easeO(p/.12),o=X.org(),i,k,Ro=175*s*gr,pul=.7+.3*Math.sin(fr*.3);
  g.save();g.globalCompositeOperation='lighter';blob(o[0],o[1]-4*s,260*s,'110,40,210',.34*a);blob(o[0],o[1]-4*s,120*s,'200,120,255',.3*a*pul);
  g.translate(o[0],o[1]-3*s);g.scale(1,.5);
  g.globalCompositeOperation='source-over';g.globalAlpha=.55*a;g.fillStyle='#10042a';g.beginPath();g.arc(0,0,Ro,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.save();g.rotate(-fr*.014);H.ring(Ro,5*s,'#a060ff',.9*a);H.ring(Ro*1.05,2*s,'#ff2a6a',.7*a);H.ring(Ro*.92,1.8*s,'#e8d0ff',.55*a);
  g.strokeStyle='#f0e0ff';g.lineWidth=1.7*s;g.globalAlpha=.85*a*pul;
  for(i=0;i<24;i++){g.save();g.rotate(i/24*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);H.glyph(i*3.3+21,12*s);g.restore()}g.restore();
  g.save();g.rotate(fr*.05);g.lineCap='round';
  for(i=0;i<4;i++){var a0=i*TAU/4;g.strokeStyle=i%2?'rgba(255,60,120,.6)':'rgba(176,112,255,.7)';g.globalAlpha=a;g.lineWidth=4*s;g.beginPath();
   for(k=0;k<=18;k++){var rr=Ro*(.12+k*.042),an=a0+k*.2;k?g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):g.moveTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.stroke()}g.restore();
  /* vòng hút co lại */
  for(k=0;k<3;k++){var u=(fr*.022+k/3)%1,rr2=(1-u)*320*s;g.globalAlpha=Math.sin(u*PI)*a*.85;g.strokeStyle=k%2?'#ff3a7a':'#b070ff';g.lineWidth=(2+3*(1-u))*s;g.beginPath();g.arc(0,0,rr2,0,TAU);g.stroke()}
  g.restore()},
 top:function(e){
  var t=fr-e.t0,p=t/e.life,a=fa(p,.1,.14),o=X.org(),hx=o[0],hy=o[1]-250*s,R0=54*s*Math.min(1,easeO(p/.14)),i,arm,k,nP=Math.round(24*qq());
  if(!e.tg&&t>=8){e.tg=near(e,900,6);e.ch=e.tg.map(function(q,j){return{m:q.m,t0:e.t0+10+Math.min(j,8)*3,sd:j*2.3+e.t0}})}
  g.save();
  /* hố đen */
  g.globalCompositeOperation='source-over';g.globalAlpha=.3*a;g.fillStyle='#06020c';g.fillRect(0,0,W,H);g.globalAlpha=a;
  blob(hx,hy,R0*3.2,'60,16,120',.55);blob(hx,hy,R0*1.9,'12,4,24',.85);
  g.globalCompositeOperation='lighter';
  for(arm=0;arm<3;arm++){var a0=fr*.06+arm*2.0944;for(var pass=0;pass<2;pass++){g.strokeStyle=pass?'rgba(255,60,120,.55)':'rgba(150,80,235,.5)';g.lineWidth=(pass?3:8)*s*a;g.lineCap='round';g.beginPath();
   for(k=0;k<=16;k++){var r=R0*(.95+k*.085),an=a0+k*.22;k?g.lineTo(hx+Math.cos(an)*r,hy+Math.sin(an)*r*.46):g.moveTo(hx+Math.cos(an)*r,hy+Math.sin(an)*r*.46)}g.stroke()}}
  for(i=0;i<nP;i++){var u=(fr*.012*(.6+hs(i)*.8)+hs(i+7))%1,rr=R0*(2.6-2.2*u),aq=hs(i+3)*TAU+fr*.05+u*3;g.globalAlpha=a*Math.sin(u*PI)*.9;g.fillStyle=i%3?'#c9a0ff':'#ff4d8a';g.beginPath();g.arc(hx+Math.cos(aq)*rr,hy+Math.sin(aq)*rr*.46,(1+1.6*(1-u))*s,0,TAU);g.fill()}
  g.globalAlpha=a;g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();g.ellipse(hx,hy,R0,R0*.5,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(235,205,255,.9)';g.lineWidth=2*s;g.beginPath();g.ellipse(hx,hy,R0*1.01,R0*.51,0,0,TAU);g.stroke();
  /* xích tới từng quái + gai nổ */
  if(e.ch)e.ch.forEach(function(c,j){var cp=(fr-c.t0)/40;if(cp<0||cp>=1&&0)return;
   var tp=c.m?X.mpos(e,c.m):null,tx=tp?tp[0]:o[0]+Math.cos(j*1.1)*160*s,ty=tp?X.chest(c.m,tp):o[1]-30*s,gr=easeO(Math.min(1,cp*2.2)),al=a*(cp>.8?(1-cp)/.2:1);
   if(cp>=1)return;
   chain(hx,hy+R0*.2,tx,ty,gr,al,j%2?'#ff5a9a':'#b880ff',Math.sin(fr*.05+j)*14*s);
   if(c.m&&cp>.18){var hp=Math.min(1,(cp-.18)/.5),ha=1-hp,i2;g.save();g.globalCompositeOperation='lighter';
    g.globalAlpha=ha*.7;g.strokeStyle='#b070ff';g.lineWidth=3.4*s;g.beginPath();g.ellipse(tp[0],tp[1],(12+56*hp)*s,(6+28*hp)*s,0,0,TAU);g.stroke();
    blob(tx,ty,(28+30*hp)*s,'150,70,255',.7*ha);blob(tx,ty,(13+11*hp)*s,'255,120,200',.5*ha);
    g.globalCompositeOperation='source-over';g.fillStyle='#07030d';g.globalAlpha=ha*.95;
    for(i2=0;i2<8;i2++){var an3=hs(c.sd+i2)*TAU,r0=7*s,r1=(24+30*hs(c.sd+i2+4))*s*Math.min(1,hp*3+.2);g.beginPath();g.moveTo(tx+Math.cos(an3-.12)*r0,ty+Math.sin(an3-.12)*r0);g.lineTo(tx+Math.cos(an3)*r1,ty+Math.sin(an3)*r1);g.lineTo(tx+Math.cos(an3+.12)*r0,ty+Math.sin(an3+.12)*r0);g.fill()}
    g.restore()}});
  g.restore()}
};

/* ---------- bọc R.ycM / R.ycS ---------- */
function wrapR(name,orig,kind,life){
 if(!orig)return;
 R[name]=function(F){
  if(!F||!F.ma)return orig.apply(this,arguments);
  if(CFG.enable&&X.tgOn()){X.push({K:kind,t0:fr,life:life,A:F.f.A,c:F.f.c,sn:F.f.sn,hits:[]});return{life:2,draw:function(){}}}
  if(window.MDFX2&&MDFX2.on&&MDFX2.cfg.enable)return{life:1,draw:function(){}};
  return orig.apply(this,arguments)}}
wrapR('ycM',origM,'dn',200);
wrapR('ycS',origS,'vn',150);
window.MDTG2={cfg:CFG};
})();
