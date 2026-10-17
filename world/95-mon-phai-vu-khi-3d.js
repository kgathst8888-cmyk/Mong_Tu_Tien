/* ===== ⚔ VŨ KHÍ BAY QUANH NGƯỜI 3D (world/95-mon-phai-vu-khi-3d.js) — nạp sau world/75 + assets/mon-phai-vukhi3d.js =====
 * Fix225: BỎ cánh tay + bàn tay cầm vũ khí. Vũ khí của 6 môn phái tiên nhân giờ LƠ LỬNG và BAY CHẬM vòng quanh nhân vật (quỹ đạo elip nghiêng, kiểu phi kiếm):
 *   Vạn Độc Môn (vdm) · Huyền Băng Điện (hbd) · Phần Thiên Cốc (ptc) · Thiên Kiếm Tông (tkt) · U Minh Ma Tông (umt) · Ngự Cổ Thánh Điện (ngc)
 * Cách 3D giả:
 *   - Quỹ đạo quanh thân: nửa SAU vẽ TRƯỚC thân (bị thân che), nửa TRƯỚC vẽ SAU thân. Phía gần người xem thì to + thấp hơn, phía xa nhỏ + cao hơn.
 *   - Mặt vũ khí luôn hướng RA NGOÀI quỹ đạo: ở phía trước thấy mặt trước, ở phía sau thấy mặt sau (tối, lật), ở hai bên thì nghiêng mỏng (co bề ngang theo cos).
 *   - Xếp vài lát ảnh theo trục sâu → có độ dày khi nhìn nghiêng. Lơ lửng nhấp nhô, nghiêng nhẹ theo quỹ đạo, có vệt sáng mờ phía sau và hạt linh khí theo môn phái.
 * Khi đánh (P.at của world/73 hoặc P.atk/P.atkT của game, Tiên Giới cũng chạy): vũ khí XOAY NHANH quanh người, quỹ đạo nở rộng, vệt sáng dài + vòng khí quét quanh thân; xong thì chậm lại dần.
 * Hook: VPW.draw(sid,'back',P) gọi TRƯỚC khi vẽ thân, VPW.draw(sid,'front',P) gọi SAU khi vẽ thân (world/73 + world/74; cần VPG_CF.weapon / VPG8_CF.weapon = true — file này tự bật).
 * Chỉnh: VPW3_CF.enable (false = tắt) · .speed (tốc độ bay, rad/giây, mặc định .5 ≈ 12 giây/vòng) · .radius (bán kính ×1) · .height (độ cao tâm quỹ đạo ×HH, .52) ·
 *   .count (số bản vũ khí rải đều quanh người, mặc định 1; thử 3) · .scale (kích thước vũ khí, .6) · .trail (vệt sáng, 0 = tắt) · .fx (hạt, 0 = tắt) · .depth (độ dày) · .minw (bề ngang tối thiểu) · .slices
 * Thử chiêu đánh trong console: VPW3.play(900). */
(function(){
'use strict';
if(typeof g==='undefined'||!window.MPW3||!window.VPW)return;
var CF=window.VPW3_CF=window.VPW3_CF||{};
function def(k,v){if(CF[k]===undefined)CF[k]=v}
def('enable',true);def('depth',1);def('minw',.22);def('fx',1);def('slices',5);def('scale',.6);
def('speed',.5);def('radius',1);def('height',.52);def('count',1);def('trail',1);
/* world/73 + world/74 để lớp vũ khí TẮT mặc định (CF.weapon=false) → bật lên để vũ khí được gọi vẽ */
try{if(window.VPG_CF)VPG_CF.weapon=true;if(window.VPG8_CF)VPG8_CF.weapon=true}catch(e){}
var PI=Math.PI,TAU=PI*2,DEPTHK=.22,OLD=function(){}; /* vũ khí tay cũ lệch với tranh mới → không dùng làm dự phòng */
var SPEC={
 umt:{len:1.08,c1:'#ff3a4a',c2:'#ffb0b8',fx:'wisp'},
 hbd:{len:1.16,c1:'#7fe4ff',c2:'#eafcff',fx:'snow'},
 ptc:{len:1.16,c1:'#ffb14a',c2:'#fff0b8',fx:'ember'},
 tkt:{len:.86,c1:'#6a9cff',c2:'#d8e8ff',fx:'qi'},
 vdm:{len:1.12,c1:'#7cf08a',c2:'#e0ffb8',fx:'mote'},
 ngc:{len:1.14,c1:'#5ee8ff',c2:'#ffe9a8',fx:'star'}
};
var IM={},DK={},S={th:0,v:CF.speed,t:0,sid:'',pl:0,pd:900};
function img(sid){var k=IM[sid];if(k)return k;var d=MPW3[sid];if(!d)return null;var im=new Image();im.src=d[0];return IM[sid]={im:im,w:d[1],h:d[2]}}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function dark(sid,o,amt){var key=sid+amt,c=DK[key];if(c)return c;var cv=document.createElement('canvas');cv.width=o.im.naturalWidth;cv.height=o.im.naturalHeight;var x=cv.getContext('2d');x.drawImage(o.im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(6,8,22,'+amt+')';x.fillRect(0,0,cv.width,cv.height);return DK[key]=cv}
/* hạt linh khí theo môn (cộng sáng) */
function spark(kind,x,y,z,c1,c2,sz,al,t,i){
 g.globalAlpha=Math.max(0,Math.min(1,al));
 if(kind==='snow'||kind==='star'){g.fillStyle=i%2?c1:c2;g.beginPath();g.moveTo(x,y-sz*1.6);g.lineTo(x+sz*.45,y);g.lineTo(x,y+sz*1.6);g.lineTo(x-sz*.45,y);g.closePath();g.fill();g.beginPath();g.moveTo(x-sz*1.6,y);g.lineTo(x,y+sz*.45);g.lineTo(x+sz*1.6,y);g.lineTo(x,y-sz*.45);g.closePath();g.fill()}
 else if(kind==='qi'){g.strokeStyle=i%2?c1:c2;g.lineWidth=Math.max(.8,sz*.55);g.lineCap='round';g.beginPath();g.moveTo(x,y-sz*2.4);g.lineTo(x+z*.8,y+sz*2.4);g.stroke()}
 else if(kind==='wisp'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.7,sz*1.7,Math.sin(t*2+i)*.5,0,TAU);g.fill()}
 else if(kind==='ember'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.6,sz*1.1,Math.sin(t*3+i)*.8,0,TAU);g.fill()}
 else{g.fillStyle=i%2?c1:c2;g.beginPath();g.arc(x,y,sz,0,TAU);g.fill()}
}
/* hạt quay quanh vũ khí (toạ độ cục bộ của vũ khí, tâm = giữa ảnh) */
function motes(sp,dh,dw,t,pu,HH){
 var M=6,rr=dw*.5+HH*.05,sc=HH/76,spd=1.7*(1+3*pu),i,ph,z,u,y,x,vis;
 g.save();g.globalCompositeOperation='lighter';
 try{for(i=0;i<M;i++){
  ph=t*spd+i*TAU/M;z=Math.sin(ph);u=(i*.618+t*.09*(i%2?1:-.7)+8)%1;y=(-.45+.9*u)*dh;x=Math.cos(ph)*rr*(.55+.45*Math.sin(u*PI));vis=Math.sin(u*PI);
  spark(sp.fx,x,y,z,sp.c1,sp.c2,(1.1+.9*(.5+.5*z))*sc*1.25,(.28+.5*(.5+.5*z))*vis*CF.fx,t,i)}}
 finally{g.restore()}
}
/* vệt sáng mờ phía sau vũ khí theo quỹ đạo; mỗi đoạn vẽ ở lượt (trước/sau thân) đúng với độ sâu của nó */
function trail(sp,th0,R,yc,by,HH,front,pu){
 var segs=12,span=.5+1.4*pu,al0=(.10+.5*pu)*CF.trail,px=0,py=0,j,a,x,y,zm;
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 try{for(j=0;j<=segs;j++){
  a=th0-span*j/segs;x=Math.cos(a)*R;y=-yc-by+Math.sin(a)*R*DEPTHK;
  if(j>0){zm=Math.sin(a+span/segs/2);
   if((zm>=0)===front){g.globalAlpha=al0*(1-j/segs);g.strokeStyle=j%3?sp.c1:sp.c2;g.lineWidth=(3.4*(1-j/segs)+.6)*HH/76;g.beginPath();g.moveTo(px,py);g.lineTo(x,y);g.stroke()}}
  px=x;py=y}}
 finally{g.restore()}
}
/* vòng khí quét quanh thân khi đánh (nửa sau / nửa trước theo lượt vẽ) */
function ring(sp,R,yc,HH,t,pu,front){
 g.save();g.globalCompositeOperation='lighter';g.translate(0,-yc);g.scale(1,DEPTHK);
 try{
  g.strokeStyle=sp.c1;g.lineWidth=5*HH/76;g.setLineDash([14,8]);g.lineDashOffset=-t*70;g.globalAlpha=pu*.4;
  g.beginPath();g.arc(0,0,R,front?0:PI,front?PI:TAU);g.stroke();
  g.strokeStyle=sp.c2;g.lineWidth=2.4*HH/76;g.setLineDash([4,7]);g.lineDashOffset=t*50;g.globalAlpha=pu*.35;
  g.beginPath();g.arc(0,0,R*.82,front?0:PI,front?PI:TAU);g.stroke()}
 finally{g.restore()}
}
function atOf(pp,now){
 if(pp.at>=0)return pp.at;
 try{if(typeof P==='object'&&P&&P.atk>0&&P.atkT>0)return Math.min(1,Math.max(0,1-P.atk/P.atkT))}catch(e){}
 if(S.pl&&now-S.pl<S.pd)return (now-S.pl)/S.pd;
 return -1}
/* tiến góc bay: chậm khi bình thường, nhanh khi đánh, mượt khi đổi tốc */
function step(sid,now,pu){
 var dt=(S.sid!==sid||now-S.t>600)?0:Math.min(.08,(now-S.t)/1000),tg=CF.speed+7*pu;
 S.v+=(tg-S.v)*(1-Math.exp(-dt*5));S.th=(S.th+S.v*dt)%TAU;S.t=now;S.sid=sid}
function drawOne(sid,o,sp,pp,th,z,i,by,pu,now){
 var HH=pp.HH,t=now/1000,bp=pp.bp||0,R=HH*.5*CF.radius*(1+.3*pu),yc=HH*CF.height,
  sc=1+.12*z,dh=sp.len*HH*CF.scale*sc*(1+.18*pu),dw=dh*o.w/o.h,
  cx=Math.cos(th)*R,cy=-yc-by+z*R*DEPTHK,
  ang=Math.cos(th)*.28+Math.sin(t*.9+i*1.7)*.05,
  phi=th+.35*Math.sin(t*.7+i),nx=Math.cos(phi),ny=Math.sin(phi),
  wf=Math.max(CF.minw,Math.abs(ny)),N=Math.max(2,CF.slices|0),D=dh*.04*CF.depth,
  bright=o.im,dk=dark(sid,o,.5),bk=dark(sid,o,.30),j,tt,off,src,rg;
 g.save();
 try{
  g.translate(cx,cy);g.rotate(ang);
  /* ánh sáng lan theo màu môn phái */
  g.save();g.globalCompositeOperation='lighter';g.scale(.42+.2*wf,1);
  rg=g.createRadialGradient(0,0,2,0,0,dh*.62);rg.addColorStop(0,sp.c1);rg.addColorStop(1,'rgba(0,0,0,0)');
  g.globalAlpha=(.20+.07*Math.sin(bp*1.7+i)+.34*pu)*(z<0?.7:1);g.fillStyle=rg;g.beginPath();g.arc(0,0,dh*.62,0,TAU);g.fill();g.restore();
  /* các lát ảnh theo trục sâu → độ dày; lát ngoài cùng sáng, còn lại tối */
  for(j=0;j<N;j++){
   tt=ny>=0?j/(N-1)-.5:.5-j/(N-1);off=tt*D*nx;src=(j===N-1)?(ny>=0?bright:bk):dk;
   g.save();g.translate(off,0);g.scale(ny>=0?1:-1,1);g.drawImage(src,-dw*wf/2,-dh/2,dw*wf,dh);g.restore()}
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(.10+.12*Math.abs(nx))*(1+pu)*(z<0?.6:1);g.translate(D*nx*.5,0);g.scale(ny>=0?1:-1,1);g.drawImage(bright,-dw*wf/2,-dh/2,dw*wf,dh);g.restore();
  if(CF.fx>0)motes(sp,dh,dw,t,pu,HH)
 }finally{g.restore()}
}
function draw3(sid,phase,pp,o,sp){
 var now=performance.now(),atk=atOf(pp,now),pu=atk>=0?Math.sin(atk*PI):0,
  front=phase==='front',n=Math.max(1,CF.count|0),HH=pp.HH,k=pp.k||0,t=now/1000,
  R=HH*.5*CF.radius*(1+.3*pu),yc=HH*CF.height,i,th,z,by;
 if(phase!=='back'&&phase!=='front')return;
 if(now-S.t>=2||S.sid!==sid)step(sid,now,pu);
 g.save();
 try{
  if(pu>.02&&CF.fx>0)ring(sp,R,yc,HH,t,pu,front);
  for(i=0;i<n;i++){
   th=S.th+i*TAU/n;z=Math.sin(th);
   by=Math.sin(t*1.3+i*2.1)*HH*.025+(k?Math.abs(Math.sin(pp.wp||0))*k*1.5:0);
   if(CF.trail>0)trail(sp,th,R,yc,by,HH,front,pu);
   if((z>=0)===front)drawOne(sid,o,sp,pp,th,z,i,by,pu,now)}
 }finally{g.restore()}
}
VPW.draw=function(sid,phase,pp){
 var sp=SPEC[sid],o=sp&&CF.enable&&pp?img(sid):null;
 if(!ok(o))return OLD.apply(this,arguments);
 try{draw3(sid,phase,pp,o,sp)}catch(e){CF.err=e;return OLD.apply(this,arguments)}
};
window.VPW3={SPEC:SPEC,CF:CF,state:S,play:function(ms){S.pl=performance.now();S.pd=ms||900}};
})();
