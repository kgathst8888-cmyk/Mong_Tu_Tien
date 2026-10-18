/* ===== 🖐 NHẤC TAY CẦM VŨ KHÍ — 6 môn phái (world/93-mon-phai-tay.js) — Fix206 — nạp sau assets/mon-phai-tay.js + assets/mon-phai-vukhi.js =====
 * Fix238 — gắn vào Fix237: vũ khí 3D mới (MPW3, đứng yên sau lưng ở world/95) khi TUNG CHIÊU được "triệu hồi" vào bàn tay: vũ khí sau lưng ẩn đi, tay nhấc lên cầm vũ khí đó; hết chiêu thu về sau lưng.
 * Fix239: MẶC ĐỊNH LUÔN CẦM VŨ KHÍ TRONG TAY (vũ khí sau lưng ẩn hẳn) + hiệu ứng vung mạnh hơn: người ngả ra sau lấy đà rồi lao tới theo nhát chém, ảnh mờ của vũ khí, vệt kiếm 2 lớp, tia lửa + loé sáng lúc trúng, vũ khí đung đưa theo nhịp thở / bước đi.
 * Fix240: CẮT RỜI TỪNG BỘ PHẬN — mỗi khung ảnh vẽ được tách (khi chạy, bằng mặt nạ mờ) thành CHÂN/ÁO DƯỚI · THÂN (kèm tay buông) · ĐẦU, cộng cẳng tay + vũ khí. Mỗi phần chuyển động riêng quanh khớp của nó:
 *   thân ngả/xoắn quanh eo, đầu quay/gật quanh cổ ngược chiều thân để giữ mắt nhìn mục tiêu, chân/áo dưới nhún + trượt chân khi lao, thở, đi bộ lắc người, rồi mới tới tay và vũ khí gắn trên thân.
 * Fix262: CHUYỂN ĐỘNG UYỂN CHUYỂN — nội suy cong (Catmull-Rom) qua các tư thế thay cho từng đoạn rời; mọi biến điều khiển (hướng cẳng tay, nhấc khuỷu, hướng vũ khí, lao/ngả, sáng) đi qua LÒ XO có quán tính:
 *   khuỷu bám nhanh, VŨ KHÍ vung trễ hơn tay và nảy nhẹ khi dừng (follow-through), thân/đầu/áo bị kéo xiên theo gia tốc khi lao (drag), vào/ra chiêu êm không giật dù bấm chiêu liên tục, nhịp thời gian có ì lấy đà – nhanh lúc chém – chậm lúc thu.
 * Giữ NGUYÊN nét vẽ của ảnh 8 hướng (MP8): thân, tóc, đạo bào vẫn là tranh gốc. Chỉ phần TAY được tách ra làm "hoạt hình cắt rời":
 *   • assets/mon-phai-tay.js: với mỗi môn × nam/nữ × 8 hướng có sẵn CẲNG TAY + BÀN TAY cắt từ chính ảnh vẽ, và một mảng vá nền (đã xoá tay cũ) để lấp chỗ trống.
 *   • Khi tung chiêu: thân đổi sang bản đã xoá tay (hoà dần), cẳng tay xoay quanh khuỷu / nhấc khuỷu lên, bàn tay NẮM vũ khí vẽ sẵn (assets/mon-phai-vukhi.js).
 *   • Hướng cử động tính theo KHÔNG GIAN 3 CHIỀU (phải · lên · tới trước) rồi chiếu xuống màn hình theo đúng hướng nhìn của 8 khung → nhìn thẳng thì tay/vũ khí chúc về phía người xem (co ngắn),
 *     nhìn ngang thì vung ngang, nhìn lưng thì vung ra xa. Không phải vũ khí xoay tại chỗ.
 *   • 6 bước: cầm sẵn → GIƠ TAY (khuỷu nhấc, cẳng tay lên) → đỉnh (vũ khí sáng, tụ lực) → CHÉM/ĐÂM về phía trước (vệt sáng theo mũi) → theo đà → thu về. Mỗi môn một bộ hướng vũ khí riêng.
 * Được gọi từ world/74 (Tiên Giới 8 hướng) và world/73 (bản đồ 2D): MPAR.tick(o) mỗi khung, MPAR.img(f) lấy ảnh thân, MPAR.draw(g,f,alpha,HH) vẽ tay + vũ khí.
 * Chỉnh: MPAR_CF.enable=false (về như cũ) · .dur (số khung 1 lần giơ-chém, mặc định 56) · .trail=false (tắt vệt sáng) · .weapon=false (không vẽ vũ khí trong tay, vũ khí sau lưng giữ nguyên) · .always=false (chỉ cầm lúc tung chiêu, còn lại vũ khí đứng sau lưng như Fix237) · .rig=false (về thân 1 tấm như Fix239) · .power (độ mạnh hiệu ứng vung: người lao tới/ngả, vệt mờ, tia lửa; mặc định 1, 0 = tắt). */
(function(){
'use strict';
var CF=window.MPAR_CF=window.MPAR_CF||{};
if(CF.enable===undefined)CF.enable=true;if(!CF.dur)CF.dur=62;if(CF.trail===undefined)CF.trail=true;if(CF.weapon===undefined)CF.weapon=true;if(CF.always===undefined)CF.always=true;if(CF.power===undefined)CF.power=1;if(CF.rig===undefined)CF.rig=true;
var PI=Math.PI,sin=Math.sin,cos=Math.cos,sqrt=Math.sqrt,abs=Math.abs,atan2=Math.atan2;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
/* vũ khí tay thuận = ảnh MPW3 (cùng ảnh với vũ khí đứng sau lưng ở world/95). len = chiều dài (×chiều cao thân); grip = điểm nắm (0 đỉnh … 1 đáy ảnh) */
var SPEC={
 umt:{len:.98,grip:.56},hbd:{len:.98,grip:.56},ptc:{len:1.0,grip:.56},
 tkt:{len:.78,grip:.80},vdm:{len:.98,grip:.54},ngc:{len:1.0,grip:.58}
};
/* ---------- bộ cử động theo thời gian: mốc 0 cầm sẵn · .26 giơ lên · .46 đỉnh · .62 chém · .80 theo đà · 1 thu về ---------- */
var TT=[0,.30,.50,.60,.80,1];   /* lấy đà dài · chạm đỉnh · CHÉM nhanh · theo đà · thu chậm */
/* các vector 3D theo hệ nhân vật: [ngoài (phía tay), lên, tới trước] */
var FD=[[.05,-1,.1],[.8,.45,.25],[.35,1,-.1],[.15,.15,.95],[.35,-.45,.7],[.05,-1,.1]];      /* hướng cẳng tay (khuỷu → bàn tay) */
var ED=[[0,0,0],[.3,.4,.2],[.15,.75,0],[.1,.3,.7],[.25,.05,.35],[0,0,0]];                  /* độ nhấc khuỷu (×30 px) */
var WDS={sword:[[.35,1,.1],[.15,1,-.25],[0,.85,-.55],[0,-.3,1],[.3,.1,.8],[.35,1,.1]],      /* hướng mũi vũ khí: kiếm/đao */
         staff:[[.12,1,.05],[.05,1,.2],[0,1,.35],[0,.05,1],[.1,.55,.8],[.12,1,.05]]};       /* trượng */
var WKIND={umt:'staff',hbd:'staff',tkt:'sword',ptc:'staff',vdm:'staff',ngc:'staff'};
var GLOWK=[0,.35,1,1.4,.6,0];
/* bên tay thuận của nhân vật trong ảnh từng khung (-1 trái ảnh, +1 phải ảnh) */
var RSIDE=[-1,-1,1,1,1,1,-1,-1];
function lp(a,b,t){return a+(b-a)*t}
function sm(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
function seg(u){var i=0;while(i<TT.length-2&&u>TT[i+1])i++;var t=(u-TT[i])/(TT[i+1]-TT[i]);return[i,t<0?0:t>1?1:t]}
function cr(p0,p1,p2,p3,t){var t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
function interp(A,u){var q=seg(u),i=q[0],t=q[1],n=A.length,a=A[Math.max(0,i-1)],b=A[i],c=A[i+1],d=A[Math.min(n-1,i+2)];
 return[cr(a[0],b[0],c[0],d[0],t),cr(a[1],b[1],c[1],d[1],t),cr(a[2],b[2],c[2],d[2],t)]}
function interp1(A,u){var q=seg(u),i=q[0],t=q[1],n=A.length;return cr(A[Math.max(0,i-1)],A[i],A[i+1],A[Math.min(n-1,i+2)],t)}
/* lò xo có quán tính: x' = x + v ; v' = v + (đích-x)·k − v·d  (d nhỏ → nảy) */
function spr(a,i,tg,k,d){var v=S.sv[a][i];v+=(tg-S.sp[a][i])*k-v*d;S.sv[a][i]=v;S.sp[a][i]+=v;return S.sp[a][i]}
function sprV(a,tg,k,d){for(var i=0;i<3;i++)spr(a,i,tg[i],k,d)}
/* ---------- ảnh ---------- */
var IMC={};
function pimg(url){var o=IMC[url];if(o)return o;o=IMC[url]=new Image();o.src=url;return o}
function ok(im){return im&&im.complete&&im.naturalWidth>0}
function wimg(sid){var d=window.MPW3&&MPW3[sid];return d?pimg(d[0]):null}
var STRIP={};
/* ảnh thân đã xoá tay (dựng 1 lần từ mảng vá, lưu cache) */
function strip(f){
 var M=window.MPA&&MPA[f.id]&&MPA[f.id][f.gen]&&MPA[f.id][f.gen][f.i];if(!M||!ok(f.im))return null;
 var k=f.id+f.gen+f.i,c=STRIP[k];if(c)return c;
 var pm=pimg(M.p[0]);if(!ok(pm))return null;
 c=document.createElement('canvas');c.width=f.im.naturalWidth;c.height=f.im.naturalHeight;
 var x=c.getContext('2d');x.drawImage(f.im,0,0);x.clearRect(M.p[1],M.p[2],M.p[3],M.p[4]);x.drawImage(pm,M.p[1],M.p[2],M.p[3],M.p[4]);
 return STRIP[k]=c;
}
/* ---------- trạng thái ---------- */
var S={sp:{fd:[0,-1,0],ed:[0,0,0],wd:[.12,1,.05],ls:[0],gl:[0],en:[0]},sv:{fd:[0,0,0],ed:[0,0,0],wd:[0,0,0],ls:[0],gl:[0],en:[0]},kind:'staff',wh:[],wp:0,f:-1e9,cs:-1e9,pa:0,t0:-1e9,u:-1,sa:0,hold:0,env:0,ang:PI/2,bp:0,k:0,tr:[],trf:-1,hv:0};
function env(u){if(u<0)return 0;var a=sm(u/.14),b=sm((1-u)/.14);return a<b?a:b}
function tick(o){
 var fr=o.fr|0;if(S.f===fr)return;S.f=fr;
 if(o.u!==undefined&&o.u!==null)S.u=(o.u>=0&&o.u<=1)?o.u:-1;
 else{
  if(o.t0!==undefined&&o.t0>-1e8&&o.t0!==S.t0){S.t0=o.t0;S.cs=fr}
  if((o.atk|0)>S.pa+1&&fr-S.cs>6)S.cs=fr;
  S.pa=o.atk|0;var uu=(fr-S.cs)/CF.dur;S.u=(uu>=0&&uu<1)?uu:-1;
 }
 S.env=env(S.u);
 var tu=S.u>=0?S.u:0,wk=WDS[S.kind]||WDS.staff,steps=Math.max(1,Math.min(3,fr-(S._lf||fr-1)));S._lf=fr;
 for(var st=0;st<steps;st++){
  sprV('fd',interp(FD,tu),.30,.55);sprV('ed',interp(ED,tu),.28,.52);
  sprV('wd',interp(wk,tu),.16,.30);                         /* vũ khí vung trễ hơn tay, nảy nhẹ */
  spr('ls',0,(S.u>=0?interp1(LUNA,tu):0)*CF.power,.22,.42);spr('gl',0,interp1(GLOWK,tu),.2,.5);spr('en',0,S.env,.3,.6);
 }
 S.l=S.sp.ls[0];S.lv=S.sv.ls[0];S.gl=S.sp.gl[0];S.en=Math.max(0,Math.min(1,S.sp.en[0]));
 S.hold+=((S.u>=0||CF.always?1:0)-S.hold)*.28;if(S.hold<.01)S.hold=0;if(S.hold>.99)S.hold=1;S.sa+=((S.u>=0?1:0)-S.sa)*.3;if(S.sa<.01)S.sa=0;if(S.sa>.99)S.sa=1;
 S.ang=o.ang!==undefined?o.ang:S.ang;S.wp=o.wp||0;S.bp=o.bp||0;S.k=o.k||0;S.hv=o.hv||0;
}
/* ---------- chiếu vector 3D (phải · lên · trước) → màn hình, theo hướng nhìn ---------- */
function proj(v,cs,fx,fz,sc){
 var rx=-fz,rz=fx,wx=rx*cs*v[0]+fx*v[2],wy=v[1],wz=rz*cs*v[0]+fz*v[2],sx=wx,sy=-wy+.5*wz,l3=sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2])||1,ls=sqrt(sx*sx+sy*sy);
 return{x:sx,y:sy,fs:ls/l3,d:atan2(sx,-sy)};   /* d = góc từ hướng "lên", chiều kim đồng hồ */
}
function frameGeom(f){
 var M=MPA[f.id][f.gen][f.i];
 return M;
}
/* ---------- vẽ vũ khí (gốc toạ độ: pixel khung ảnh; g đã dịch/scale sẵn) ---------- */
function drawW(g,im,len,grip,ih,x,y,ang,fs,al,add){
 if(!ok(im))return;var h=len*ih,w=h*im.naturalWidth/im.naturalHeight;
 g.save();g.translate(x,y);g.rotate(ang);g.scale(1,fs);g.globalAlpha*=al;
 if(add)g.globalCompositeOperation='lighter';
 g.drawImage(im,-w/2,-grip*h,w,h);g.restore();
}
function glow(g,x,y,r,col,a){
 var go=g.globalCompositeOperation;g.globalCompositeOperation='lighter';
 var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(255,255,255,'+Math.min(1,a)+')');q.addColorStop(.35,rgba(col,a*.7));q.addColorStop(1,rgba(col,0));
 g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.globalCompositeOperation=go;
}
function rgba(h,a){var r=parseInt(h.substr(1,2),16),gg=parseInt(h.substr(3,2),16),b=parseInt(h.substr(5,2),16);return'rgba('+r+','+gg+','+b+','+a+')'}
/* ---------- vẽ tay + vũ khí cho 1 khung (f = {im,w,h,id,gen,i}); g đang ở hệ toạ độ thân (chân = (0,0), y lên là âm), alpha = độ đậm khung này ---------- */
function draw(g,f,alpha,HH,wantTip){
 if(!CF.enable)return;
 var M=window.MPA&&MPA[f.id]&&MPA[f.id][f.gen]&&MPA[f.id][f.gen][f.i];if(!M)return;
 var sid=f.id,sp=SPEC[sid];if(!sp)return;
 var ih=f.im.naturalHeight||303,iw=f.im.naturalWidth||f.w,sc=HH/ih,u=S.u,en=S.env,fx=cos(S.ang),fz=sin(S.ang),
  sg=M.s[0],cs=(sg===RSIDE[f.i])?1:-1,E0=M.e,H0=M.h,v0x=H0[0]-E0[0],v0y=H0[1]-E0[1],L0=sqrt(v0x*v0x+v0y*v0y)||1;v0x/=L0;v0y/=L0;
 var uu=u>=0?u:0,kind=WKIND[sid]||'sword';S.kind=kind;en=S.en;
 /* khuỷu nhấc + hướng cẳng tay */
 var ed=S.sp.ed,pe=proj(ed,cs,fx,fz),Ex=E0[0]+pe.x*44*en,Ey=E0[1]+pe.y*44*en;
 var fd=S.sp.fd,pf=proj(fd,cs,fx,fz),tl=sqrt(pf.x*pf.x+pf.y*pf.y)||1,tx=pf.x/tl,ty=pf.y/tl;
 var dx=lp(v0x,tx,en),dy=lp(v0y,ty,en),dl=sqrt(dx*dx+dy*dy)||1;dx/=dl;dy/=dl;
 var fsA=lp(1,Math.max(.4,pf.fs),en),Hx=Ex+dx*L0*fsA,Hy=Ey+dy*L0*fsA;
 g.save();
 if(CF.rig)torsoT(g,HH,ih);
 g.translate(-HH*f.w/f.h/2,-HH);g.scale(sc,sc);
 g.globalAlpha=alpha;
 /* cẳng tay cắt rời (chỉ khi đang tung chiêu: lúc đó thân đã là bản xoá tay) */
 if(S.sa>.01){
  var cm=pimg(M.c[0]);
  if(ok(cm)){
   g.save();g.globalAlpha=alpha*Math.min(1,S.sa*1.5);
   g.translate(Ex,Ey);g.rotate(atan2(dy,dx));g.scale(fsA,1);g.rotate(-atan2(v0y,v0x));
   g.drawImage(cm,M.c[1]-E0[0],M.c[2]-E0[1],M.c[3],M.c[4]);g.restore();
  }
 }
 var hx0=S.sa>.01?Hx:H0[0],hy0=S.sa>.01?Hy:H0[1];
 /* vũ khí tay thuận */
 var tipX=hx0,tipY=hy0,PW=CF.power,sw=sin(S.bp*1.1)*.035+sin(S.wp)*S.k*.07*(1-en);
 if(CF.weapon&&S.hold>.02){
  var wd=S.sp.wd,cw=kind==='sword'?[.35,1,.1]:[.12,1,.05],wv=[lp(cw[0],wd[0],en),lp(cw[1],wd[1],en),lp(cw[2],wd[2],en)],pw=proj(wv,cs,fx,fz),
   wfs=Math.max(.38,Math.min(1,pw.fs)),wim=wimg(sid),ang=pw.d+sw*cs,hh=sp.len*ih,tipD=sp.grip*hh*wfs,dxw=sin(ang),dyw=-cos(ang),ha=Math.min(1,S.hold*1.25);
  g.save();g.globalAlpha=alpha*ha;
  /* ảnh mờ của vũ khí khi vung (motion blur) */
  if(wantTip&&PW>0){
   if(S.trf!==S.f){S.wh.push(S.u>=.40&&S.u<.92?{x:hx0,y:hy0,a:ang,s:wfs}:null);if(S.wh.length>6)S.wh.shift()}
   for(var gi=0;gi<S.wh.length-1;gi++){var gh=S.wh[gi];if(!gh)continue;var gk=(gi+1)/S.wh.length;g.save();g.globalAlpha=alpha*ha*.32*gk*Math.min(1,PW);drawW(g,wim,sp.len,sp.grip,ih,gh.x,gh.y,gh.a,gh.s,1,1);g.restore()}
  }
  drawW(g,wim,sp.len,sp.grip,ih,hx0,hy0,ang,wfs,1,0);
  var glw=Math.max(S.gl*Math.min(1,en*1.4),(S.u>=0&&S.u<.2&&S.hold<1?.6:0));
  if(glw>.05)glow(g,hx0+dxw*tipD*.6,hy0+dyw*tipD*.6,30+28*glw,COL[sid],Math.min(.7,.22+.3*glw));
  g.restore();
  tipX=hx0+dxw*tipD;tipY=hy0+dyw*tipD;
 }
 /* vệt kiếm 2 lớp + tia lửa / loé sáng khi trúng */
 if(wantTip&&CF.trail&&PW>0){
  if(S.trf!==S.f){S.trf=S.f;if(S.u>=.56&&S.u<.88){S.tr.push([tipX,tipY]);if(S.tr.length>9)S.tr.shift()}else if(S.tr.length)S.tr.shift()}
  if(S.tr.length>2){
   var go=g.globalCompositeOperation;g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   for(var pass=0;pass<2;pass++){
    for(var q=1;q<S.tr.length;q++){var a=q/S.tr.length;g.beginPath();g.moveTo(S.tr[q-1][0],S.tr[q-1][1]);g.lineTo(S.tr[q][0],S.tr[q][1]);
     g.strokeStyle=pass?'rgba(255,255,255,'+(.7*a*alpha*PW)+')':rgba(COL[sid],Math.min(1,.55*a*alpha*PW));g.lineWidth=pass?1+4*a:3+16*a;g.stroke()}
   }
   g.globalCompositeOperation=go;
  }
  if(S.u>=.56&&S.u<.76){
   var ik=1-abs(S.u-.64)/.12;if(ik>0){
    glow(g,tipX,tipY,34+46*ik,COL[sid],Math.min(.9,.35+.5*ik)*alpha*PW);
    var go2=g.globalCompositeOperation;g.globalCompositeOperation='lighter';g.lineCap='round';
    for(var sk=0;sk<9;sk++){var sa=sk*.7+S.f*.13,r0=8+ik*6,r1=r0+16+14*((sk*7+S.f)%5)/5*ik;
     g.beginPath();g.moveTo(tipX+cos(sa)*r0,tipY+sin(sa)*r0);g.lineTo(tipX+cos(sa)*r1,tipY+sin(sa)*r1);g.strokeStyle='rgba(255,255,255,'+(.8*ik*alpha*PW)+')';g.lineWidth=1.6;g.stroke()}
    g.globalCompositeOperation=go2;
   }
  }
 }
 g.restore();
}
/* ---------- cắt rời bộ phận: chân/áo dưới · thân · đầu ---------- */
var PARTS={};
function mk(src,W,H,stops){
 var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.drawImage(src,0,0);
 x.globalCompositeOperation='destination-in';var gr=x.createLinearGradient(0,0,0,H);
 for(var i=0;i<stops.length;i++)gr.addColorStop(Math.max(0,Math.min(1,stops[i][0]/H)),'rgba(0,0,0,'+stops[i][1]+')');
 x.fillStyle=gr;x.fillRect(0,0,W,H);return c;
}
function parts(f,src){
 if(!CF.enable||!CF.rig||!src||!f||!f.im)return null;
 var W=src.naturalWidth||src.width,H=src.naturalHeight||src.height;if(!W||!H)return null;
 var key=f.id+f.gen+f.i+(src===f.im?'o':'s'),pr=PARTS[key];if(pr)return pr;
 var yN=H*.19,yW=H*.455;
 pr=PARTS[key]={ih:H,yN:yN,yW:yW,
  lo:mk(src,W,H,[[0,0],[yW-20,0],[yW-6,1],[H,1]]),
  to:mk(src,W,H,[[0,0],[yN-16,0],[yN-4,1],[yW+14,1],[yW+28,0],[H,0]]),
  hd:mk(src,W,H,[[0,1],[yN,1],[yN+12,0],[H,0]])};
 return pr;
}
/* chuyển động từng bộ phận (đơn vị: toạ độ game; góc: rad; y xuống là dương) */
function rig(HH){
 var u=S.u,k=S.k,hv=S.hv,l=S.l||0,lv=S.lv||0,fx=cos(S.ang),afx=abs(fx),b=sin(S.bp),wk=(1-hv)*k,sw=sin(S.wp)*wk,sw2=sin(S.wp*2)*wk,hb=hv?sin(S.bp*2.1+.8):0;
 return{
  lo:{k:-fx*lv*.9,x:fx*l*HH*.02+sw*HH*.006,y:-wk*abs(sin(S.wp))*HH*.007+hb*HH*.004,sy:1-.014*Math.max(0,l)},
  to:{k:-fx*lv*1.5,x:fx*l*HH*.05-sw*HH*.004,y:-wk*abs(sin(S.wp))*HH*.004,r:fx*l*.11-sw*.03+sin(S.bp*.9)*.006+hb*.012,sx:1-.045*abs(l)*(1-afx),sy:1+.007*b+.03*Math.max(0,l)*(1-afx)},
  hd:{k:-fx*lv*2.2,x:fx*l*HH*.03,y:-.35*b*HH*.01-Math.max(0,l)*HH*.01*(1-afx),r:-fx*l*.07+sw*.02+sw2*.01+hb*.015}
 };
}
function torsoT(g,HH,ih){
 var R=rig(HH).to,py=-HH+HH*.455;g.translate(R.x,R.y+py);g.rotate(R.r);g.scale(R.sx,R.sy);g.translate(0,-py);
}
/* vẽ các phần theo thứ tự chân → thân → đầu; DS(canvas) = hàm vẽ 26 dải (có sóng) do world/73,74 cung cấp */
function eachPart(g,HH,pr,DS){
 var R=rig(HH),sc=HH/pr.ih,py=-HH+pr.yW*sc,hy=-HH+pr.yN*sc;
 g.save();g.translate(R.lo.x,R.lo.y);g.scale(1,R.lo.sy);g.transform(1,0,R.lo.k,1,-R.lo.k*(-HH*.2),0);DS(pr.lo);g.restore();
 g.save();g.translate(R.to.x,R.to.y+py);g.rotate(R.to.r);g.scale(R.to.sx,R.to.sy);g.transform(1,0,R.to.k,1,0,0);g.translate(0,-py);DS(pr.to);
 g.translate(R.hd.x,R.hd.y+hy);g.rotate(R.hd.r);g.transform(1,0,R.hd.k-R.to.k,1,0,0);g.translate(0,-hy);DS(pr.hd);g.restore();
}
/* thân lao tới / ngả theo nhát chém (áp dụng lên toàn thân ở world/73, world/74) */
var LUNA=[0,-.45,-.7,1,.55,0];
function pose(HH){
 var z={x:0,r:0,s:1};if(!CF.enable||S.u<0||!(CF.power>0))return z;
 var l=S.l||0,fx=cos(S.ang);
 if(CF.rig){z.x=fx*l*HH*.03;return z}
 z.x=fx*l*HH*.085;z.r=fx*l*.1;z.s=1+.035*l*(1-abs(fx));return z;
}
function fin(f){return !!(CF.enable&&window.MPA&&f&&f.id&&MPA[f.id]&&MPA[f.id][f.gen])}
window.MPAR={tick:tick,draw:draw,pose:pose,parts:parts,eachPart:eachPart,back:function(){},front:function(){},hold:function(){return CF.enable&&CF.weapon&&S.hold>.4},
 img:function(f){if(!fin(f)||S.sa<.01)return null;return strip(f)},sa:function(){return S.sa},on:function(f){return fin(f)},state:S,CF:CF};
/* vũ khí sau lưng (world/95) ẩn đi khi nhân vật đang cầm nó trong tay */
try{if(window.VPW&&typeof VPW.draw==='function'&&!VPW.__mpar){var _vd=VPW.draw;VPW.draw=function(){if(window.MPAR&&MPAR.hold())return;return _vd.apply(this,arguments)};VPW.__mpar=1}}catch(e){}
})();
