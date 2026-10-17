/* ===== ⚔ VŨ KHÍ 3D ĐỨNG YÊN SAU LƯNG (world/95-mon-phai-vu-khi-3d.js) — nạp sau world/75 + assets/mon-phai-vukhi3d.js =====
 * Fix226: vũ khí 6 môn phái tiên nhân LƠ LỬNG ĐỨNG YÊN phía SAU LƯNG nhân vật (không cầm tay, không xoay tròn). Kích thước gốc (scale 1).
 *   Vạn Độc Môn (vdm) · Huyền Băng Điện (hbd) · Phần Thiên Cốc (ptc) · Thiên Kiếm Tông (tkt) · U Minh Ma Tông (umt) · Ngự Cổ Thánh Điện (ngc)
 * 3D giả sắc nét:
 *   - Vũ khí nằm trên mặt phẳng sau lưng, QUAY THEO HƯỚNG NHÌN của nhân vật: nhân vật nhìn về người xem → vũ khí ló sau vai, thấy mặt trong (tối);
 *     nhân vật quay lưng → vũ khí hiện RÕ phía trước thân, thấy mặt sáng; nhìn ngang → vũ khí nghiêng mỏng, lộ độ dày.
 *   - Nhiều lát ảnh xếp theo trục sâu (có độ dày thật), lát ngoài sáng — lát trong tối dần, viền sáng (rim light).
 *   - Lơ lửng nhấp nhô rất nhẹ, lắc nhẹ trục xoay để thấy khối; hạt linh khí nhỏ theo môn phái; ánh sáng mờ theo màu môn phái.
 *   - Khi đánh: vũ khí bừng sáng, nhích tới trước một chút, hạt quay nhanh.
 * Hook: VPW.draw(sid,'back',P) gọi TRƯỚC khi vẽ thân (vũ khí nằm sau thân), VPW.draw(sid,'front',P) gọi SAU khi vẽ thân (khi nhân vật quay lưng).
 * Chỉnh: VPW3_CF.enable (false = tắt) · .scale (kích thước, 1 = cỡ gốc) · .dist (khoảng cách ra sau lưng ×HH, .26) · .side (lệch vai, .2) · .height (độ cao tâm ×HH, .56) · .lean (độ nghiêng, .5) ·
 *   .slices (số lát, 12) · .depth (độ dày, .8) · .minw (bề ngang tối thiểu khi nhìn nghiêng) · .sway (lắc trục xoay, .25) · .fx (hạt, 0 = tắt) · .glow (ánh sáng, 1)
 * Thử chiêu đánh trong console: VPW3.play(900). */
(function(){
'use strict';
if(typeof g==='undefined'||!window.MPW3||!window.VPW)return;
var CF=window.VPW3_CF=window.VPW3_CF||{};
function def(k,v){if(CF[k]===undefined)CF[k]=v}
def('enable',true);def('scale',1);def('dist',.26);def('side',.2);def('height',.56);def('lean',.5);def('slices',12);def('depth',.8);def('minw',.42);def('sway',.25);def('fx',1);def('glow',1);
try{if(window.VPG_CF)VPG_CF.weapon=true;if(window.VPG8_CF)VPG8_CF.weapon=true}catch(e){}
var PI=Math.PI,TAU=PI*2,OLD=function(){};
var SPEC={
 umt:{len:1.08,c1:'#ff3a4a',c2:'#ffb0b8',fx:'wisp'},
 hbd:{len:1.16,c1:'#7fe4ff',c2:'#eafcff',fx:'snow'},
 ptc:{len:1.16,c1:'#ffb14a',c2:'#fff0b8',fx:'ember'},
 tkt:{len:.86,c1:'#6a9cff',c2:'#d8e8ff',fx:'qi'},
 vdm:{len:1.12,c1:'#7cf08a',c2:'#e0ffb8',fx:'mote'},
 ngc:{len:1.14,c1:'#5ee8ff',c2:'#ffe9a8',fx:'star'}
};
var IM={},DK={},S={a:PI/2,t:0,sid:'',pl:0,pd:900,sg:1,sd:1};
function img(sid){var k=IM[sid];if(k)return k;var d=MPW3[sid];if(!d)return null;var im=new Image();im.src=d[0];return IM[sid]={im:im,w:d[1],h:d[2]}}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function dark(sid,o,amt){var key=sid+amt,c=DK[key];if(c)return c;var cv=document.createElement('canvas');cv.width=o.im.naturalWidth;cv.height=o.im.naturalHeight;var x=cv.getContext('2d');x.drawImage(o.im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(6,8,22,'+amt+')';x.fillRect(0,0,cv.width,cv.height);return DK[key]=cv}
/* bản tô sáng viền (rim light) màu môn phái: chỉ giữ hình, tô c2 */
function tint(sid,o,col){var key=sid+'t'+col,c=DK[key];if(c)return c;var cv=document.createElement('canvas');cv.width=o.im.naturalWidth;cv.height=o.im.naturalHeight;var x=cv.getContext('2d');x.drawImage(o.im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);return DK[key]=cv}
function wrap(a){while(a>PI)a-=TAU;while(a<-PI)a+=TAU;return a}
function spark(kind,x,y,z,c1,c2,sz,al,t,i){
 g.globalAlpha=Math.max(0,Math.min(1,al));
 if(kind==='snow'||kind==='star'){g.fillStyle=i%2?c1:c2;g.beginPath();g.moveTo(x,y-sz*1.6);g.lineTo(x+sz*.45,y);g.lineTo(x,y+sz*1.6);g.lineTo(x-sz*.45,y);g.closePath();g.fill();g.beginPath();g.moveTo(x-sz*1.6,y);g.lineTo(x,y+sz*.45);g.lineTo(x+sz*1.6,y);g.lineTo(x,y-sz*.45);g.closePath();g.fill()}
 else if(kind==='qi'){g.strokeStyle=i%2?c1:c2;g.lineWidth=Math.max(.8,sz*.55);g.lineCap='round';g.beginPath();g.moveTo(x,y-sz*2.4);g.lineTo(x+z*.8,y+sz*2.4);g.stroke()}
 else if(kind==='wisp'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.7,sz*1.7,Math.sin(t*2+i)*.5,0,TAU);g.fill()}
 else if(kind==='ember'){g.fillStyle=i%2?c1:c2;g.beginPath();g.ellipse(x,y,sz*.6,sz*1.1,Math.sin(t*3+i)*.8,0,TAU);g.fill()}
 else{g.fillStyle=i%2?c1:c2;g.beginPath();g.arc(x,y,sz,0,TAU);g.fill()}
}
/* hạt linh khí nhỏ bay lên quanh vũ khí (toạ độ cục bộ, tâm = giữa ảnh) */
function motes(sp,dh,dw,t,pu,HH){
 var M=6,rr=dw*.5+HH*.04,sc=HH/76,spd=.9*(1+4*pu),i,ph,z,u,y,x,vis;
 g.save();g.globalCompositeOperation='lighter';
 try{for(i=0;i<M;i++){
  ph=t*spd+i*TAU/M;z=Math.sin(ph);u=(i*.618+t*.07*(i%2?1:-.7)+8)%1;y=(.45-.9*u)*dh;x=Math.cos(ph)*rr*(.5+.5*Math.sin(u*PI));vis=Math.sin(u*PI);
  spark(sp.fx,x,y,z,sp.c1,sp.c2,(1+.8*(.5+.5*z))*sc*1.1,(.22+.4*(.5+.5*z))*vis*CF.fx,t,i)}}
 finally{g.restore()}
}
function atOf(pp,now){
 if(pp.at>=0)return pp.at;
 try{if(typeof P==='object'&&P&&P.atk>0&&P.atkT>0)return Math.min(1,Math.max(0,1-P.atk/P.atkT))}catch(e){}
 if(S.pl&&now-S.pl<S.pd)return (now-S.pl)/S.pd;
 return -1}
/* hướng nhìn mượt: S.a (0 = phải, π/2 = về phía người xem, π = trái, -π/2 = quay lưng) */
function face(sid,pp,now){
 var dt=(S.sid!==sid||now-S.t>600)?0:Math.min(.08,(now-S.t)/1000),ta,k=pp.k||0;
 if(pp.ang!=null)ta=pp.ang;else{var d=pp.dir||0,kk=Math.min(1,k*1.5);ta=d?Math.atan2(.8-.6*kk,d*(.55+.45*kk)):PI/2}
 if(!dt)S.a=ta;else S.a=wrap(S.a+wrap(ta-S.a)*(1-Math.exp(-dt*13)));
 var c=Math.cos(S.a);if(c>.3)S.sg=-1;else if(c<-.3)S.sg=1;S.sd=dt?S.sd+(S.sg-S.sd)*(1-Math.exp(-dt*6)):S.sg;
 S.t=now;S.sid=sid}
function draw3(sid,phase,pp,o,sp){
 if(phase!=='back'&&phase!=='front')return;
 var now=performance.now(),t=now/1000,HH=pp.HH,bp=pp.bp||0,k=pp.k||0,atk=atOf(pp,now),pu=atk>=0?Math.sin(atk*PI):0;
 if(now-S.t>=2||S.sid!==sid)face(sid,pp,now);
 var fx=Math.cos(S.a),fy=Math.sin(S.a),zb=-fy;               /* zb > 0: vũ khí (sau lưng) quay về phía người xem → vẽ SAU thân */
 var inFront=zb>.3;if((phase==='front')!==inFront)return;
 var xn=-fx*CF.dist+CF.side*S.sd,                 /* sau lưng, đeo chéo lệch vai (bên không bị thân che) */
  bob=Math.sin(t*1.25)*HH*.018+Math.sin(t*2.1+1)*HH*.006+(k?Math.abs(Math.sin(pp.wp||0))*k*1.4:0),
  cx=xn*HH+fx*pu*HH*.06,cy=-HH*CF.height-bob-pu*HH*.03+zb*HH*.02,
  sc=1+.08*zb,dh=sp.len*HH*CF.scale*sc,dw=dh*o.w/o.h,
  ang=CF.lean*xn/(Math.abs(xn)+.25)*.9+Math.sin(t*.8)*.03,
  phi=S.a+PI+.5*S.sd+CF.sway*Math.sin(t*.7)*(1-Math.abs(fy)*.4),   /* pháp tuyến mặt vũ khí = quay lưng ra sau */
  nx=Math.cos(phi),ny=Math.sin(phi),wf=Math.max(CF.minw,Math.abs(ny)),N=Math.max(2,CF.slices|0),D=dh*.05*CF.depth,
  bright=o.im,dk=dark(sid,o,.55),mid=dark(sid,o,.32),bk=dark(sid,o,.30),rim=tint(sid,o,sp.c2),j,u,tt,off,src,rg,flip=ny>=0?1:-1;
 g.save();
 try{
  try{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high'}catch(e){}
  g.translate(cx,cy);g.rotate(ang);
  /* ánh sáng mờ theo màu môn phái (nhỏ, không làm nhoè hình) */
  if(CF.glow>0){g.save();g.globalCompositeOperation='lighter';g.scale(.34+.16*wf,1);
   rg=g.createRadialGradient(0,0,2,0,0,dh*.55);rg.addColorStop(0,sp.c1);rg.addColorStop(1,'rgba(0,0,0,0)');
   g.globalAlpha=(.13+.05*Math.sin(bp*1.7)+.32*pu)*CF.glow;g.fillStyle=rg;g.beginPath();g.arc(0,0,dh*.55,0,TAU);g.fill();g.restore()}
  /* các lát theo trục sâu: lát xa tối, lát gần sáng dần → khối có độ dày thật */
  for(j=0;j<N;j++){
   u=j/(N-1);tt=flip>0?u-.5:.5-u;off=tt*D*nx;
   src=(j===N-1)?(flip>0?bright:bk):(u>.6?mid:dk);
   g.save();g.translate(off,0);g.scale(flip,1);g.drawImage(src,-dw*wf/2,-dh/2,dw*wf,dh);g.restore()}
  /* viền sáng (cộng sáng lớp ảnh gốc) → sắc nét */
  g.save();g.translate(D*nx*.5,0);g.scale(flip,1);g.globalCompositeOperation='lighter';
  g.globalAlpha=(.10+.10*Math.abs(nx))*(1+pu*1.5)*(flip>0?1:.45);g.drawImage(bright,-dw*wf/2,-dh/2,dw*wf,dh);
  g.restore();
  /* rim light: bản tô màu c2 mờ, lệch nhẹ theo độ dày */
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(.10+.18*pu)*(flip>0?1:.5);g.translate(D*nx*.5+flip*dw*wf*.012,0);g.scale(flip,1);g.drawImage(rim,-dw*wf/2,-dh/2,dw*wf,dh);g.restore();
  if(CF.fx>0)motes(sp,dh,dw,t,pu,HH)
 }finally{g.restore()}
}
VPW.draw=function(sid,phase,pp){
 var sp=SPEC[sid],o=sp&&CF.enable&&pp?img(sid):null;
 if(!ok(o))return OLD.apply(this,arguments);
 try{draw3(sid,phase,pp,o,sp)}catch(e){CF.err=e;return OLD.apply(this,arguments)}
};
window.VPW3={SPEC:SPEC,CF:CF,state:S,play:function(ms){S.pl=performance.now();S.pd=ms||900}};
})();
