/* ===== ⚔ VŨ KHÍ 3D + KHUNG XƯƠNG + HOẠT ẢNH ĐÁNH (world/95-mon-phai-vu-khi-3d.js) — nạp sau world/75 + assets/mon-phai-vukhi3d.js =====
 * 6 vũ khí cắt từ ảnh mẫu, vẽ kiểu 3D GIẢ. Mỗi loại vũ khí có hoạt ảnh đánh riêng, điều khiển bởi KHUNG XƯƠNG tay:
 *   KIẾM  (tkt Thiên Kiếm)                : giơ cao ra sau → VUNG CHÉM chéo xuống, lưỡi lật mặt khi chém, vệt chém ruy-băng
 *   THƯƠNG (hbd Huyền Băng · ptc Phần Thiên): rụt tay về sau, cầm ngang → ĐÂM TỚI mũi thương hướng người xem (co ngắn theo phối cảnh), sóng xung kích
 *   TRƯỢNG (ngc Ngự Cổ)                   : GIƠ CAO quá đầu NIỆM CHÚ (vòng chú xoay quanh đầu trượng + trận pháp dưới chân, linh khí hội tụ) → hạ trượng phóng chú
 *   LƯỠI HÁI (vdm Vạn Độc · umt U Minh)   : kéo hái ra sau cao → VUNG CHÉM RỘNG vòng cung ngang người, vệt chém lớn
 * Khung xương: vai → khuỷu → cổ tay (IK 2 xương, giới hạn tầm với) trong không gian thân (x phải, y lên, z tới trước), chiếu về màn hình theo hướng nhìn
 *   (cùng phép chiếu với xoay 3D của thân) nên đâm/chém về phía người xem thì vũ khí co ngắn + lún xuống như thật.
 * Tiến độ đánh: P.at (world/73) hoặc tự lấy từ P.atk/P.atkT của game (Tiên Giới world/74 cũng chạy). Gọi thử: VPW3.play(900).
 * Hướng nhìn: P.dir (world/73, ±1) · P.ang (world/74, S = π/2). Luôn cầm bằng tay GẦN người xem; tay xa → đổi tay mượt qua giữa thân.
 * Chỉnh: VPW3_CF.enable (false = vũ khí cũ) · .depth (độ dày) · .delta (độ xoay mặt) · .minw · .fx (hạt, 0 = tắt) · .slices · .arm (vẽ cánh tay khi đánh) · .debug (hiện khung xương) ·
 *   KEY[loại] (khung hình then chốt: hx,hy,hz = vị trí tay ×HH; p = ngả tới trước; r = nghiêng sang phải; s = xoay mặt vũ khí) · SPEC[môn].len/.grip. */
(function(){
'use strict';
if(typeof g==='undefined'||!window.MPW3||!window.VPW)return;
var CF=window.VPW3_CF=window.VPW3_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(CF.depth===undefined)CF.depth=1;
if(CF.delta===undefined)CF.delta=50;
if(CF.minw===undefined)CF.minw=.22;
if(CF.fx===undefined)CF.fx=1;
if(CF.slices===undefined)CF.slices=5;
if(CF.arm===undefined)CF.arm=true;
if(CF.debug===undefined)CF.debug=false;
var PI=Math.PI,R=PI/180,TAU=PI*2,OLD=VPW.draw,DEPTHK=.22;
var SPEC={
 umt:{cls:'scythe',len:1.08,grip:.60,c1:'#ff3a4a',c2:'#ffb0b8',fx:'wisp'},
 hbd:{cls:'spear',len:1.16,grip:.60,c1:'#7fe4ff',c2:'#eafcff',fx:'snow'},
 ptc:{cls:'spear',len:1.16,grip:.60,c1:'#ffb14a',c2:'#fff0b8',fx:'ember'},
 tkt:{cls:'sword',len:.86,grip:.86,c1:'#6a9cff',c2:'#d8e8ff',fx:'qi'},
 vdm:{cls:'scythe',len:1.12,grip:.58,c1:'#7cf08a',c2:'#e0ffb8',fx:'mote'},
 ngc:{cls:'staff',len:1.14,grip:.60,c1:'#5ee8ff',c2:'#ffe9a8',fx:'star'}
};
/* khung hình then chốt (t = tiến độ chiêu 0..1). Toạ độ thân tay phải: hx sang phải, hy lên cao, hz tới trước (đơn vị ×HH); p = trục vũ khí ngả tới trước (rad), r = ngả sang phải, s = xoay mặt quanh trục */
var IDLE={hx:.15,hy:.46,hz:.08,p:-.08,r:.14,s:0};
function K(t,o){var k={t:t};for(var q in IDLE)k[q]=o&&o[q]!==undefined?o[q]:IDLE[q];return k}
var KEY=CF.KEY||(CF.KEY={
 sword:[K(0),K(.26,{hx:.2,hy:.95,hz:-.14,p:-.6,r:.5}),K(.34,{hx:.2,hy:.97,hz:-.16,p:-.66,r:.55}),K(.54,{hx:-.14,hy:.44,hz:.5,p:1.3,r:-.6,s:1.9}),K(.7,{hx:-.1,hy:.4,hz:.42,p:1.05,r:-.4,s:1.9}),K(1)],
 spear:[K(0),K(.28,{hx:.1,hy:.52,hz:-.34,p:1.35,r:.05}),K(.38,{hx:.1,hy:.53,hz:-.38,p:1.38,r:.05}),K(.5,{hx:.08,hy:.55,hz:.6,p:1.45,r:0}),K(.66,{hx:.08,hy:.55,hz:.6,p:1.45,r:0}),K(1)],
 staff:[K(0),K(.3,{hx:.12,hy:1.02,hz:.06,p:.05,r:.02,s:.8}),K(.62,{hx:.12,hy:1.07,hz:.06,p:0,r:-.02,s:3.2}),K(.74,{hx:.1,hy:.8,hz:.42,p:.8,r:-.1,s:3.2}),K(.86,{hx:.1,hy:.62,hz:.3,p:.4,r:0,s:3.2}),K(1)],
 scythe:[K(0),K(.28,{hx:.32,hy:.96,hz:-.22,p:-.42,r:.85}),K(.38,{hx:.34,hy:.98,hz:-.24,p:-.46,r:.9}),K(.6,{hx:-.3,hy:.5,hz:.52,p:.9,r:-1.25,s:2.2}),K(.76,{hx:-.26,hy:.46,hz:.44,p:.75,r:-1.1,s:2.2}),K(1)]
});
var IM={},DK={},S={a:PI/2,t:0,sid:'',sd:1,tg:1,pl:0,pd:900};
function img(sid){var k=IM[sid];if(k)return k;var d=MPW3[sid];if(!d)return null;var im=new Image();im.src=d[0];return IM[sid]={im:im,w:d[1],h:d[2]}}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function dark(sid,o,amt){var key=sid+amt,c=DK[key];if(c)return c;var cv=document.createElement('canvas');cv.width=o.im.naturalWidth;cv.height=o.im.naturalHeight;var x=cv.getContext('2d');x.drawImage(o.im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(6,8,22,'+amt+')';x.fillRect(0,0,cv.width,cv.height);return DK[key]=cv}
function wrap(a){while(a>PI)a-=TAU;while(a<-PI)a+=TAU;return a}
function ease(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function sample(cls,at){ /* nội suy khung hình then chốt */
 var A=KEY[cls],i=0,a,b,u,o={};
 if(at<=0)return A[0];if(at>=1)return A[A.length-1];
 while(i<A.length-2&&at>A[i+1].t)i++;
 a=A[i];b=A[i+1];u=ease((at-a.t)/Math.max(.001,b.t-a.t));
 for(var q in IDLE)o[q]=a[q]+(b[q]-a[q])*u;return o}
/* ---- khung xương: vai → khuỷu → cổ tay (IK 2 xương, giới hạn tầm với) ---- */
var L1=.27,L2=.27;
function ik(sx,sy,sz,hx,hy,hz,pole){
 var dx=hx-sx,dy=hy-sy,dz=hz-sz,d=Math.sqrt(dx*dx+dy*dy+dz*dz),mx=(L1+L2)*.985;
 if(d<.06){d=.06}
 if(d>mx){var k=mx/d;dx*=k;dy*=k;dz*=k;d=mx;hx=sx+dx;hy=sy+dy;hz=sz+dz}
 var ux=dx/d,uy=dy/d,uz=dz/d,a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a)),
  dp=pole[0]*ux+pole[1]*uy+pole[2]*uz,px=pole[0]-dp*ux,py=pole[1]-dp*uy,pz=pole[2]-dp*uz,pl=Math.sqrt(px*px+py*py+pz*pz)||1;
 return{hand:[hx,hy,hz],elbow:[sx+ux*a+px/pl*h,sy+uy*a+py/pl*h,sz+uz*a+pz/pl*h]}}
/* hạt linh khí theo môn (cộng sáng) */
function spark(kind,x,y,z,c1,c2,sz,al,t,i){
 g.globalAlpha=Math.max(0,Math.min(1,al));
 if(kind==='snow'||kind==='star'){g.fillStyle=i%2?c1:c2;g.beginPath();g.moveTo(x,y-sz*1.6);g.lineTo(x+sz*.45,y);g.lineTo(x,y+sz*1.6);g.lineTo(x-sz*.45,y);g.closePath();g.fill();g.beginPath();g.moveTo(x-sz*1.6,y);g.lineTo(x,y+sz*.45);g.lineTo(x+sz*1.6,y);g.lineTo(x,y-sz*.45);g.closePath();g.fill()}
 else if(kind==='qi'){g.strokeStyle=i%2?c1:c2;g.lineWidth=Math.max(.8,sz*.55);g.lineCap='round';g.beginPath();g.moveTo(x,y-sz*2.4);g.lineTo(x+z*.8,y+sz*2.4);g.stroke()}
 else if(kind==='wisp'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.7,sz*1.7,Math.sin(t*2+i)*.5,0,TAU);g.fill()}
 else if(kind==='ember'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.6,sz*1.1,Math.sin(t*3+i)*.8,0,TAU);g.fill()}
 else{g.fillStyle=i%2?c1:c2;g.beginPath();g.arc(x,y,sz,0,TAU);g.fill()}
}
function orbit(sp,half,dh,dw,t,atk,HH){
 var M=7,gp=sp.grip,rr=dw*.46+HH*.05,sc=HH/76,spd=1.7*(1+3.2*Math.max(0,atk)),i,ph,z,u,y,x,vis;
 g.save();g.globalCompositeOperation='lighter';
 try{for(i=0;i<M;i++){
  ph=t*spd+i*TAU/M;z=Math.sin(ph);if((half==='f')!==(z>=0))continue;
  u=(i*.618+t*.09*(i%2?1:-.7)+8)%1;y=(-gp+.06+.88*u)*dh;x=Math.cos(ph)*rr*(.55+.45*Math.sin(u*PI));vis=Math.sin(u*PI);
  spark(sp.fx,x,y,z,sp.c1,sp.c2,(1.1+.9*(.5+.5*z))*sc*1.25,(.28+.5*(.5+.5*z))*vis*CF.fx,t,i)}}
 finally{g.restore()}
}
function atOf(pp,now){
 if(pp.at>=0)return pp.at;
 try{if(typeof P==='object'&&P&&P.atk>0&&P.atkT>0)return Math.min(1,Math.max(0,1-P.atk/P.atkT))}catch(e){}
 if(S.pl&&now-S.pl<S.pd)return (now-S.pl)/S.pd;
 return -1}
function draw3(sid,phase,pp,o,sp){
 if(phase==='back')return;
 var now=performance.now(),t=now/1000,HH=pp.HH,bp=pp.bp||0,k=pp.k||0,atk=atOf(pp,now),cls=sp.cls,fx,fy,rx0,ry0,sd;
 if(now-S.t>=2||S.sid!==sid){
  var dt=Math.min(.08,(now-S.t)/1000),ta;
  if(pp.ang!=null)ta=pp.ang;else{var d=pp.dir||0,kk=Math.min(1,k*1.5);ta=d?Math.atan2(.8-.6*kk,d*(.55+.45*kk)):PI/2}
  if(S.sid!==sid||now-S.t>600)S.a=ta;else S.a=wrap(S.a+wrap(ta-S.a)*(1-Math.exp(-dt*13)));
  var r0=Math.cos(S.a);if(S.tg===1&&r0<-.35)S.tg=-1;else if(S.tg===-1&&r0>.35)S.tg=1;
  S.sd=(S.sid!==sid||now-S.t>600)?S.tg:S.sd+(S.tg-S.sd)*(1-Math.exp(-dt*9));
  S.t=now;S.sid=sid}
 fx=Math.cos(S.a);fy=Math.sin(S.a);rx0=-fy;ry0=fx;sd=S.sd;
 var dh=sp.len*HH,dw=dh*o.w/o.h,pu=atk>=0?Math.sin(atk*PI):0;
 /* chiếu thân→màn hình: x phải, y lên, z tới; x đã nhân sd (đổi tay) */
 function pj(x,y,z){x*=sd;return[(x*rx0+z*fx)*HH,-y*HH+(x*ry0+z*fy)*DEPTHK*HH]}
 function posOf(a){ /* tư thế tại tiến độ a: khung xương + trục vũ khí */
  var q=a>=0?sample(cls,a):{hx:IDLE.hx,hy:IDLE.hy+.01*Math.sin(bp*1.3),hz:IDLE.hz,p:IDLE.p+Math.sin(bp*1.1)*.03-k*.5,r:IDLE.r+Math.sin(bp*.9)*.02,s:Math.sin(bp*.7)*.35};
  var sh=[.2,.74,0],ikr=ik(sh[0],sh[1],sh[2],q.hx,q.hy,q.hz,[.7,-.7,-.2]),h=ikr.hand;
  var ax=Math.sin(q.r)*Math.cos(q.p),ay=Math.cos(q.r)*Math.cos(q.p),az=Math.sin(q.p),
   H=pj(h[0],h[1],h[2]),dx=(ax*sd)*rx0+az*fx,dy=-ay+(ax*sd*ry0+az*fy)*DEPTHK,dl=Math.sqrt(dx*dx+dy*dy)||1;
  return{ik:ikr,sh:sh,H:H,ang:Math.atan2(dx,-dy),Lf:Math.max(.42,Math.min(1,dl)),s:q.s,ux:dx/dl,uy:dy/dl}}
 var ps=posOf(atk),H=ps.H,ang=ps.ang,Lf=ps.Lf;
 function tipOf(p2,u){return[p2.H[0]+p2.ux*sp.grip*dh*p2.Lf*u,p2.H[1]+p2.uy*sp.grip*dh*p2.Lf*u]}
 function ptAt(p2,fr){return[p2.H[0]+p2.ux*(sp.grip-fr)*dh*p2.Lf,p2.H[1]+p2.uy*(sp.grip-fr)*dh*p2.Lf]} /* điểm dọc trục: fr=0 đỉnh … 1 đáy ảnh */
 var vis=atk>=0?ease((atk-.22)/.1)*(1-ease((atk-.74)/.2)):0;
 g.save();
 try{
  /* trận pháp niệm chú dưới chân (trượng) */
  if(cls==='staff'&&atk>=0){var cp=ease((atk-.12)/.2)*(1-ease((atk-.8)/.2));
   if(cp>.01){g.save();g.globalCompositeOperation='lighter';g.translate(0,2);g.scale(1,.26);g.strokeStyle=sp.c1;g.fillStyle=sp.c2;g.lineWidth=1.8;
    for(var rr2=0;rr2<2;rr2++){g.globalAlpha=cp*.6;g.setLineDash(rr2?[3,5]:[10,4]);g.lineDashOffset=t*(rr2?-26:20);g.beginPath();g.arc(0,0,HH*(.42+.2*rr2),0,TAU);g.stroke()}
    g.setLineDash([]);for(var ri=0;ri<6;ri++){var ra=t*1.4+ri*TAU/6;g.globalAlpha=cp*.7;g.beginPath();g.arc(Math.cos(ra)*HH*.62,Math.sin(ra)*HH*.62,2.4,0,TAU);g.fill()}
    g.restore()}}
  /* vệt chém ruy-băng (kiếm · hái · thương) */
  if(vis>.02&&cls!=='staff'){
   var segs=10,prev=null,fa=cls==='scythe'?.5:(cls==='spear'?.32:.42),j,pj2,pt,pm,tipFr=cls==='spear'?.02:.04,midFr=cls==='spear'?.2:.42;
   g.save();g.globalCompositeOperation='lighter';
   for(j=0;j<segs;j++){
    var a2=atk-.03*j;if(a2<0)break;pj2=posOf(a2);pt=ptAt(pj2,tipFr);pm=ptAt(pj2,midFr);
    if(prev){var al=(1-j/segs)*fa*vis;g.globalAlpha=al;g.fillStyle=sp.c1;g.beginPath();g.moveTo(prev[0][0],prev[0][1]);g.lineTo(pt[0],pt[1]);g.lineTo(pm[0],pm[1]);g.lineTo(prev[1][0],prev[1][1]);g.closePath();g.fill();
     g.globalAlpha=al*1.3;g.strokeStyle=sp.c2;g.lineWidth=1.4;g.beginPath();g.moveTo(prev[0][0],prev[0][1]);g.lineTo(pt[0],pt[1]);g.stroke()}
    prev=[pt,pm]}
   g.restore()}
  /* cánh tay khung xương (chỉ khi đánh) / chế độ debug */
  var armA=atk>=0?Math.min(1,atk/.07,(1-atk)/.1):0;
  if((CF.arm&&armA>.02)||CF.debug){
   var sj=pj(ps.sh[0],ps.sh[1],ps.sh[2]),ej=pj(ps.ik.elbow[0],ps.ik.elbow[1],ps.ik.elbow[2]),hj=H;
   g.save();g.lineCap='round';g.lineJoin='round';
   if(CF.debug){g.globalAlpha=.9;g.strokeStyle='#7dff7d';g.lineWidth=1.5;g.beginPath();g.moveTo(sj[0],sj[1]);g.lineTo(ej[0],ej[1]);g.lineTo(hj[0],hj[1]);g.stroke();g.fillStyle='#fff';[sj,ej,hj].forEach(function(q){g.beginPath();g.arc(q[0],q[1],2,0,TAU);g.fill()})}
   else{g.globalAlpha=armA*.92;g.strokeStyle='#161a2c';g.lineWidth=HH*.085;g.beginPath();g.moveTo(sj[0],sj[1]);g.lineTo(ej[0],ej[1]);g.stroke();
    g.lineWidth=HH*.07;g.beginPath();g.moveTo(ej[0],ej[1]);g.lineTo(hj[0],hj[1]);g.stroke();
    g.strokeStyle=sp.c1;g.globalAlpha=armA*.55;g.lineWidth=1;g.beginPath();g.moveTo(sj[0],sj[1]);g.lineTo(ej[0],ej[1]);g.lineTo(hj[0],hj[1]);g.stroke()}
   g.restore()}
  /* ---- vũ khí (hệ toạ độ tay) ---- */
  g.translate(H[0],H[1]);g.rotate(ang);g.scale(1,Lf);
  var dl2=-CF.delta*R+ps.s,c=Math.cos(dl2),s2=Math.sin(dl2),rxv=rx0*sd,ryv=ry0*sd,nx=rxv*c-ryv*s2,ny=rxv*s2+ryv*c,
   wf=Math.max(CF.minw,Math.abs(ny)),N=Math.max(2,CF.slices|0),D=dh*.04*CF.depth,
   bright=o.im,dk=dark(sid,o,.5),bk=dark(sid,o,.30),i,tt,off,src;
  g.save();g.globalCompositeOperation='lighter';g.translate(0,(.5-sp.grip)*dh);g.scale(.42+.2*wf,1);
  var rg=g.createRadialGradient(0,0,2,0,0,dh*.62);rg.addColorStop(0,sp.c1);rg.addColorStop(1,'rgba(0,0,0,0)');
  g.globalAlpha=.20+.07*Math.sin(bp*1.7)+.34*pu;g.fillStyle=rg;g.beginPath();g.arc(0,0,dh*.62,0,TAU);g.fill();g.restore();
  if(CF.fx>0)orbit(sp,'b',dh,dw,t,atk,HH);
  for(i=0;i<N;i++){
   tt=ny>=0?i/(N-1)-.5:.5-i/(N-1);off=tt*D*nx;src=(i===N-1)?(ny>=0?bright:bk):dk;
   g.save();g.translate(off,0);g.scale(ny>=0?1:-1,1);g.drawImage(src,-dw*wf/2,-sp.grip*dh,dw*wf,dh);g.restore()}
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(.10+.12*Math.abs(nx))*(1+pu);g.translate(D*nx*.5,0);g.scale(ny>=0?1:-1,1);g.drawImage(bright,-dw*wf/2,-sp.grip*dh,dw*wf,dh);g.restore();
  if(CF.fx>0)orbit(sp,'f',dh,dw,t,atk,HH);
  /* bàn tay nắm cán */
  if(atk>=0&&CF.arm){g.globalAlpha=armA;g.fillStyle='#161a2c';g.beginPath();g.arc(0,0,HH*.045,0,TAU);g.fill()}
 }finally{g.restore()}
 /* ---- hiệu ứng riêng từng loại (hệ toạ độ thân) ---- */
 if(atk>=0&&CF.fx>0){
  g.save();g.globalCompositeOperation='lighter';
  try{
   var T0=ptAt(ps,.04),k2;
   if(cls==='staff'){ /* niệm chú: vòng chú quanh đầu trượng + linh khí hội tụ → bùng nổ khi hạ trượng */
    var hd=ptAt(ps,.12),cs=ease((atk-.14)/.2)*(1-ease((atk-.7)/.06)),bs=ease((atk-.7)/.1)*(1-ease((atk-.7)/.3)*0+0)*(1-ease((atk-.72)/.28));
    if(cs>.01){for(k2=0;k2<2;k2++){g.save();g.translate(hd[0],hd[1]);g.scale(1,.3);g.strokeStyle=k2?sp.c2:sp.c1;g.lineWidth=1.6;g.globalAlpha=cs*.75;g.setLineDash(k2?[2,4]:[9,4]);g.lineDashOffset=t*(k2?-30:24);g.beginPath();g.arc(0,0,HH*(.2+.1*k2)*(1+.1*Math.sin(t*6)),0,TAU);g.stroke();g.restore()}
     for(k2=0;k2<9;k2++){var pr=((t*.9+k2/9)%1),ang2=k2*2.4+t*2,rad=(1-pr)*HH*.55;g.globalAlpha=cs*(.2+.6*pr);g.fillStyle=k2%2?sp.c1:sp.c2;g.beginPath();g.arc(hd[0]+Math.cos(ang2)*rad,hd[1]+Math.sin(ang2)*rad*.5,1+1.4*pr,0,TAU);g.fill()}}
    if(bs>.01){g.save();g.translate(hd[0],hd[1]);g.scale(1,.5);g.strokeStyle=sp.c2;g.lineWidth=3*(1-bs*.5);g.globalAlpha=bs*.8;g.beginPath();g.arc(0,0,HH*(.18+.7*(1-bs)),0,TAU);g.stroke();g.restore()}
   }else if(cls==='spear'){ /* đâm: vệt tốc độ + sóng xung kích ở mũi */
    var ip=ease((atk-.38)/.1)*(1-ease((atk-.5)/.2));
    if(ip>.01){for(k2=0;k2<4;k2++){var b=[T0[0]-ps.ux*HH*(.18+.12*k2),T0[1]-ps.uy*HH*(.18+.12*k2)],ox=(k2-1.5)*HH*.05;g.globalAlpha=ip*.45/(1+k2*.4);g.strokeStyle=k2%2?sp.c1:sp.c2;g.lineWidth=1.6;g.beginPath();g.moveTo(b[0]+ox,b[1]);g.lineTo(T0[0]+ox,T0[1]);g.stroke()}
     g.save();g.translate(T0[0],T0[1]);g.scale(1,.6);g.strokeStyle=sp.c2;g.lineWidth=2.4*ip;g.globalAlpha=ip*.9;g.beginPath();g.arc(0,0,HH*(.08+.3*(1-ip)),0,TAU);g.stroke();g.restore()}
   }else{ /* kiếm · hái: tia lửa bắn ở điểm chém */
    var sp2=ease((atk-.5)/.06)*(1-ease((atk-.56)/.22));
    if(sp2>.01){for(k2=0;k2<8;k2++){var aa=k2*.8+atk*9,rr3=HH*.22*(1-sp2)+4;g.globalAlpha=sp2*.9;g.strokeStyle=k2%2?sp.c1:sp.c2;g.lineWidth=1.3;g.beginPath();g.moveTo(T0[0]+Math.cos(aa)*rr3*.4,T0[1]+Math.sin(aa)*rr3*.4);g.lineTo(T0[0]+Math.cos(aa)*rr3,T0[1]+Math.sin(aa)*rr3);g.stroke()}}
   }
  }finally{g.restore()}
 }
}
VPW.draw=function(sid,phase,pp){
 var sp=SPEC[sid],o=sp&&CF.enable&&pp?img(sid):null;
 if(!ok(o))return OLD.apply(this,arguments);
 try{draw3(sid,phase,pp,o,sp)}catch(e){CF.err=e;return OLD.apply(this,arguments)}
};
window.VPW3={SPEC:SPEC,KEY:KEY,CF:CF,state:S,play:function(ms){S.pl=performance.now();S.pd=ms||900}};
})();
