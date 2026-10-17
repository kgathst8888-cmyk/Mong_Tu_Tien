/* ===== 🧭 MÔN PHÁI 8 HƯỚNG THẬT — 2.5D Tiên Giới (world/74-mon-phai-8-huong.js) — nạp sau world/73 + assets/mon-phai-8h.js =====
 * Fix204: dùng 8 KHUNG ẢNH THẬT cho mỗi môn × nam/nữ (MP8, cắt từ ảnh mẫu "8 hướng"): Trước · Trước-Phải · Phải · Sau-Phải · Sau · Sau-Trái · Trái · Trước-Trái.
 *   Không còn lật hình / dùng tư thế chạy chung: mỗi hướng nhìn là 1 tranh riêng, đúng trang phục, tóc, vạt áo của từng hướng.
 * XOAY MƯỢT: hướng mục tiêu chọn theo vector đi trên màn hình (có độ trễ chống giật ở ranh giới); góc hiển thị ST.ang quay dần (tốc độ giới hạn, giảm tốc khi gần tới)
 *   qua các hướng trung gian; hiển thị = hoà trộn 2 khung kề nhau theo góc thật (chỉ hoà trong khoảng giữa, đầu/cuối là khung nguyên) + thu hẹp nhẹ bề ngang khi đang xoay.
 * BAY MƯỢT (Tiên Nhân, CTHE.on()): lơ lửng không bước chân; cất/hạ cánh êm (ST.hv, ST.fo), nhấp nhô 2 nhịp, tà áo/tóc lướt trễ pha ngược hướng bay, xoay chậm hơn khi bay, giữ đà 14 khung sau khi dừng.
 * Chỉ khi ở Thành Tiên Giới (TG.on()); mọi bản đồ khác vẫn do world/73 vẽ. API giữ nguyên cho world/78,79,87,89,91: VPG8.state {ang, sec, hv, fo, k, ca, cf, ...}.
 * Hướng đi lấy từ window.TGV = {sx,sy} (world/61). sec: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE (góc màn hình, y hướng xuống). Khung MP8 = (2-sec+8)%8.
 * Chỉnh: VPG8_CF.enable=false tắt · .spin (rad/khung khi đi, mặc định .2) · .spinHover (rad/khung khi bay, .1) · .hover/.hoverH · .weapon=true bật lại lớp vũ khí cũ (đã lệch với tranh mới). */
(function(){
'use strict';
if(typeof hero!=='function'||typeof PS==='undefined'||typeof CHR==='undefined'||!window.MP8||!window.VP||!window.VPG||!window.TG)return;
var CF=window.VPG8_CF=window.VPG8_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.spin)CF.spin=.2;if(!CF.spinHover)CF.spinHover=.1;if(CF.hover===undefined)CF.hover=true;if(!CF.hoverH)CF.hoverH=22;if(CF.weapon===undefined)CF.weapon=false;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var PI=Math.PI,IM={};
function fr8(id,gen,i){var k=id+gen+i;if(IM[k])return IM[k];var d=MP8[id]&&MP8[id][gen]&&MP8[id][gen][i];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2]}}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function ease2(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function wrap(a){while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
var ST={f:-1,ang:PI/2,tg:PI/2,sec:2,k:0,bp:0,wp:0,hv:0,fo:0,mh:0,ln:0,hx:0,tr:0,du:0,sd:1,s0:-99,pa:0,ca:0,cf:0,key:'',prev:null,fade:0,fl:1};
function hovOn(){try{return !!(CF.hover&&window.CTHE&&CTHE.on&&CTHE.on())}catch(e){return false}}
function tick(){
 if(ST.f===fr)return;ST.f=fr;
 var mv=P.mv?1:0,hn0=hovOn();
 /* giữ đà 14 khung sau khi dừng khi bay (auto đi-dừng liên tục không làm người giật) */
 if(hn0){if(mv)ST.mh=14;else if(ST.mh>0){ST.mh--;mv=1}}else ST.mh=0;
 ST.k+=(mv-ST.k)*(mv?(hn0?.1:.22):(hn0?.06:.16));if(ST.k<.002)ST.k=0;
 var v=window.TGV;if(P.mv&&v&&(v.sx||v.sy))ST.tg=Math.atan2(v.sy*2,v.sx);
 if((P.atk|0)>ST.pa)ST.s0=fr;ST.pa=P.atk|0;
 var cst=ST.cf>fr;if(cst)ST.tg=ST.ca;
 /* 1) chọn HƯỚNG MỤC TIÊU (8 hướng) có độ trễ */
 var raw=((Math.round(ST.tg/(PI/4))%8)+8)%8;
 if(raw!==ST.sec&&Math.abs(wrap(ST.tg-ST.sec*PI/4))>PI/8+(hn0?.3:.14))ST.sec=raw;
 /* 2) XOAY dần góc hiển thị về hướng mục tiêu: tốc độ giới hạn + giảm tốc khi gần tới → đi qua các khung trung gian, không nhảy cóc */
 var goal=ST.sec*PI/4,df=wrap(goal-ST.ang),cap=hn0?CF.spinHover:(cst?CF.spin*1.5:CF.spin),step=df*(hn0?.2:.3);
 if(step>cap)step=cap;else if(step<-cap)step=-cap;
 var a0=ST.ang;
 if(Math.abs(df)<.006)ST.ang=wrap(goal);
 else{if(Math.abs(step)<.014)step=.014*(df>0?1:-1);if(Math.abs(step)>Math.abs(df))step=df;ST.ang=wrap(ST.ang+step)}
 var du=-wrap(ST.ang-a0)/(PI/4);ST.du+=(du-ST.du)*.35;if(Math.abs(ST.du)>.01)ST.sd=ST.du>0?1:-1;
 ST.tr+=(Math.min(1,Math.abs(wrap(goal-ST.ang))/(PI/6))-ST.tr)*.3;
 /* hướng ngang trên màn hình × độ chạy → làm tà áo trôi ngược chiều, mượt */
 ST.hx+=(Math.cos(ST.ang)*ST.k-ST.hx)*.14;
 var fly=false;try{fly=!!(window.TGQ&&TGQ.flying&&TGQ.flying())}catch(e){}
 var hn=hovOn();ST.hv+=((hn?1:0)-ST.hv)*.07;if(ST.hv<.004)ST.hv=0;if(ST.hv>.996)ST.hv=1;
 ST.fo+=((hn&&!fly?CF.hoverH:0)-ST.fo)*.1;if(ST.fo<.05)ST.fo=0;
 ST.bp+=.05;ST.wp+=.3*ST.k*(hn?.2:1);
}
/* ----- vẽ 1 khung (dải ngang: đầu đứng yên, gấu áo/tóc trôi) ----- */
function drawPose(o,alpha,ws,off,tw){off=off||0;tw=tw||0;
 var k=ST.k,wp=ST.wp,bp=ST.bp,hv=ST.hv,hx=ST.hx,im=o.im,HH=(window.VPG_CF&&VPG_CF.h)||76,w=HH*o.w/o.h,
  bob=-(k*Math.abs(Math.sin(wp))*2.6*(1-hv))+Math.sin(bp)*.7+hv*Math.sin(bp*2.1+.8)*.5,
  rot=hx*(.05*(1-hv)+.012*hv)+Math.sin(wp)*.024*k*(1-hv)+hv*Math.sin(bp*.9)*.016,
  sy=1+Math.sin(bp)*.006+Math.cos(wp*2)*.012*k*(1-hv),sx=1/sy,
  N=26,ih=im.naturalHeight,iw=im.naturalWidth,sh=ih/N,dh=HH/N;
 g.save();
 try{
  g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
  g.globalAlpha=alpha;g.translate(off,0);g.scale(ws,1);g.translate(0,bob+HH*.012);g.rotate(rot);g.scale(sx,sy);
  if(k>.45&&hv<.5&&alpha>.5){var ga=(k-.45)*.5*alpha*(1-.5*hv),sgn=hx>=0?-1:1;for(var q=2;q>=1;q--){g.globalAlpha=ga*(.5/q);g.drawImage(im,-w/2+sgn*q*8*Math.min(1,Math.abs(hx)*1.2),-HH,w,HH)}g.globalAlpha=alpha}
  for(var j=0;j<N;j++){
   var u=(j+.5)/N,uu=Math.pow(Math.max(0,u-.12)/.88,1.55),
    dx=uu*((1-hv)*Math.sin(bp*1.3-u*2.6)*1.5+hv*(Math.sin(bp*1.1-u*2.4)*2.1+Math.sin(bp*.7-u*3.1+1)*1.1)
      -5.6*hx*(1+.45*hv)+k*Math.sin(wp*2-u*3.4)*3.2*(1-hv)+hv*k*Math.sin(bp*2.2-u*3)*1.6)
      +Math.sin(wp+1.2)*k*u*u*1.6*(1-hv)+tw*(.5-u)*2;
   g.drawImage(im,0,j*sh,iw,sh+.5,-w/2+dx,-HH+j*dh,w,dh+.9)}
 }finally{g.restore()}
}
function hovFx(col,up,k,bp){
 if(window.HOVFX&&HOVFX.draw&&HOVFX.CF.enable){g.save();g.translate(0,-up+2);HOVFX.draw(g,col,k,bp,ST.hv,-Math.cos(ST.ang),-Math.sin(ST.ang)*.5);g.restore();return}
 var hv=ST.hv,a=hv*(.3+.1*Math.sin(bp*1.8)),dx=-Math.cos(ST.ang),dy=-Math.sin(ST.ang)*.5,i,q,ph;
 g.save();g.globalCompositeOperation='lighter';g.translate(0,-up+2);
 g.save();g.scale(1,.26);g.strokeStyle=col;g.lineWidth=2;g.globalAlpha=a+.12*k;g.beginPath();g.arc(0,0,17+2*Math.sin(bp*1.8),0,6.2832);g.stroke();g.lineWidth=1.2;g.globalAlpha=a*.6;g.beginPath();g.arc(0,0,11-1.5*Math.sin(bp*1.8),0,6.2832);g.stroke();g.restore();
 g.fillStyle=col;
 for(i=0;i<5;i++){ph=(bp*.35+i/5)%1;g.globalAlpha=hv*(1-ph)*.55;g.beginPath();g.arc(Math.sin(i*2.4+bp*.5)*13+dx*ph*k*16,ph*12+dy*ph*k*8,2.2*(1-ph)+.5,0,6.2832);g.fill()}
 if(k>.08)for(q=1;q<=3;q++){g.globalAlpha=.13*k*hv/q;g.beginPath();g.arc(dx*q*9*k,-34+dy*q*5*k,10-2*q,0,6.2832);g.fill()}
 g.restore();
}
function draw8(sid){
 var gen=window.VPG.gender();tick();
 /* vị trí khung liên tục: S=0 · SE=1 · E=2 · NE=3 · N=4 · NW=5 · W=6 · SW=7 */
 var u=(PI/2-ST.ang)/(PI/4);u=((u%8)+8)%8;
 var i0=Math.floor(u),t=u-i0,i1=(i0+1)%8,A=fr8(sid,gen,i0),B=fr8(sid,gen,i1);
 if(!ok(A)&&!ok(B))return false;
 if(!ok(A))A=B;if(!ok(B))B=A;
 var wB=t<.35?0:(t>.65?1:ease2((t-.35)/.3)),ws=1-.16*Math.sin(PI*t)*ST.tr,sf=Math.sin(ST.ang)>=0?1:-1,HHd=(window.VPG_CF&&VPG_CF.h)||76,dl=HHd*.04*ST.tr,tw=sf*ST.sd*HHd*.03*ST.tr;
 ST.key=i0+'';
 var col=COL[sid]||'#fff',k=ST.k,bp=ST.bp;
 var up=ST.fo+ST.hv*(Math.sin(bp*1.25)*3.2+Math.sin(bp*2.3+1.1)*.9);
 try{if(typeof drawWings==='function'){g.save();if(up)g.translate(0,-up*s);drawWings();g.restore()}}catch(e){}
 g.save();
 try{
  g.translate((P.x-cam)*s,GY);g.scale(s,s);
  var hs=1-.3*Math.min(1,ST.fo/Math.max(1,CF.hoverH||1));g.fillStyle='rgba(0,0,0,'+(.38*(1-(1-hs)*1.2)).toFixed(3)+')';g.beginPath();g.ellipse(0,2,27*hs,6.2*hs,0,0,6.2832);g.fill();
  g.save();g.translate(0,1);g.scale(1,.24);g.globalCompositeOperation='lighter';g.strokeStyle=col;g.globalAlpha=(.28+.1*Math.sin(bp*1.6)+.18*k)*(1-.65*ST.hv);g.lineWidth=2.2;g.beginPath();g.arc(0,0,23+2*Math.sin(bp*1.6),0,6.2832);g.stroke();g.restore();
  if(ST.hv>.02)hovFx(col,up,k,bp);
  g.save();if(up)g.translate(0,-up);
  /* XOAY 3D GIẢ: bề mặt thân trượt như hình trụ quanh trục dọc (khung cũ trôi theo chiều xoay, khung mới trượt vào), đầu quay trước – gấu áo trễ sau (tw), thu ngang khi nghiêng */
  if(wB<=.002)drawPose(A,1,ws,sf*t*dl,tw);
  else if(wB>=.998)drawPose(B,1,ws,-sf*(1-t)*dl,tw);
  else{drawPose(A,1,ws,sf*t*dl,tw);drawPose(B,wB,ws,-sf*(1-t)*dl,tw)}
  g.restore();
  if(CF.weapon){try{if(window.VPW){var HH=(window.VPG_CF&&VPG_CF.h)||76,wk={kind:'front',ang:ST.ang,w:HH*A.w/A.h,HH:HH,k:k,bp:bp,wp:ST.wp,at:-1};VPW.draw(sid,'back',wk);VPW.draw(sid,'front',wk)}}catch(e){}}
 }finally{g.restore()}
 return true;
}
window.VPG8={state:ST,CF:CF,sector:function(){return ST.sec}};
var _hero=hero;
hero=function(){
 if(!CF.enable||!own()||!window.TG.on())return _hero.apply(this,arguments);
 var sid='';try{sid=window.VP.get()||''}catch(e){}
 if(!sid)return _hero.apply(this,arguments);
 var done=false;
 try{done=draw8(sid)}catch(e){done=false}
 if(!done)return _hero.apply(this,arguments);
};
})();
