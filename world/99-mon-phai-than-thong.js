/* ===== ✨ HIỆU ỨNG THẦN THÔNG 6 MÔN PHÁI TIÊN NHÂN (world/99-mon-phai-than-thong.js) — nạp sau world/99-mon-phai-co-che-rieng.js =====
 * Chỉ VẼ (cơ chế/sát thương nằm ở world/72 + world/99-mon-phai-co-che-rieng.js + world/81).
 * Ghi đè công thức hiệu ứng TG8SK.R.* (loại cũ proj,multi,dash,mark,exec,aoe,burst,freeze,sweep,charge,shield,dotT,dotS,dotU và loại riêng từng môn umt1…ngc5) CHỈ cho kỹ năng môn phái
 * (nhận ra qua màu môn + biểu tượng kỹ năng); Ý Cảnh / Pháp Bảo / Linh Căn vẫn dùng công thức cũ (world/82 + 88).
 * Dùng chung cho: Thành Tiên Giới (world/79) và Map Treo / map đánh quái Tiên Giới (world/83, qua TGFX2.cast).
 *
 * Mỗi môn một bản sắc (vẽ vector, không dùng emoji):
 *   U MINH MA TÔNG  : huyết nguyệt liêm, bóng phân thân, xích huyết, dơi, linh hồn tím-đỏ.
 *   HUYỀN BĂNG ĐIỆN : tinh thể băng góc cạnh, hoa tuyết 6 cánh, băng long, bão tuyết, mưa băng thương.
 *   PHẦN THIÊN CỐC  : lưỡi lửa, hoả cầu sao chổi, hoả liên trận (sen lửa), phượng hoàng, 9 mặt trời hoả vũ.
 *   THIÊN KIẾM TÔNG : kiếm khí trăng khuyết, phi kiếm thật, kiếm bộ vô ảnh, thiên kiếm giáng, kiếm trận.
 *   VẠN ĐỘC MÔN     : độc châm, sương độc + bọt, đầu lâu độc chú, độc xà quấn, độc vực + mưa độc.
 *   NGỰ CỔ THÁNH ĐIỆN: đàn cổ trùng, mai giáp tổ ong, bầy cổ bám, Cổ Vương rết khổng lồ, triều cổ.
 *
 * TUYỆT KỸ (dotU): ngoài hiệu ứng, hiện BÓNG MỜ VŨ KHÍ môn phái to trên bầu trời (ảnh assets/mon-phai-vukhi3d.js, MPW3)
 *   — hiện dần khi tung, tồn tại đúng bằng thời gian tuyệt kỹ (sp.dur giây), kết thúc tuyệt kỹ thì tan biến cùng lúc.
 *   Bóng mờ độc lập với danh sách hiệu ứng (TG8SK_CF.max không cắt nó), vẽ phía sau nhân vật (bọc hero ngoài cùng).
 *   Cũng hiện ở bản đồ thường (qua móc TGFX2.cast trong world/72) khi TGFX2 không bật.
 *
 * Chỉnh: MPTT_CF.enable=false (về hiệu ứng cũ) · MPTT_CF.ghost=false (tắt bóng mờ vũ khí) · MPTT_CF.ghostA (độ đậm, mặc định 1)
 *        · MPTT_CF.q (mật độ hạt, mặc định 1; máy yếu đặt .6). API: MPTT.ghost(id,frames) thử nhanh: MPTT.ghost('tkt',300). */
(function(){
'use strict';
if(typeof g==='undefined'||typeof RGBA!=='function'||!window.TG8SK||!window.TG8SK.R)return;
var CF=window.MPTT_CF=window.MPTT_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(CF.ghost===undefined)CF.ghost=true;
if(!CF.ghostA)CF.ghostA=1;
if(!CF.q)CF.q=1;
var R=window.TG8SK.R,PI=Math.PI,TAU=PI*2,SRC='';
var SCOL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
/* a = màu chính · b = màu nhấn · d = màu tối · w = lõi sáng */
var PAL={
 umt:{a:'#c070ff',b:'#ff2a52',d:'#1a0622',w:'#ffd6e4'},
 hbd:{a:'#7fe4ff',b:'#3a8cff',d:'#06203a',w:'#ffffff'},
 ptc:{a:'#ff9a4a',b:'#ff3a14',d:'#3a0a00',w:'#fff2b8'},
 tkt:{a:'#9fc8ff',b:'#ffd84a',d:'#0a1a3a',w:'#ffffff'},
 vdm:{a:'#7cf08a',b:'#2aa84a',d:'#062a10',w:'#ecffc4'},
 ngc:{a:'#ffd890',b:'#c050d0',d:'#2a0a30',w:'#fff6d8'}};
/* ---------- tiện ích toán ---------- */
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function cl(v){return v<0?0:v>1?1:v}
function sm(p){p=cl(p);return p*p*(3-2*p)}
function ea(p){p=cl(p);return 1-(1-p)*(1-p)}
function seg(t,a,b){return cl((t-a)/(b-a))}
function fade(p,a){return p>a?Math.max(0,(1-p)/(1-a)):1}
function Q(n){return Math.max(2,Math.round(n*CF.q*((window.TGFXU_CF&&TGFXU_CF.q)||1)))}
function pt(f,D,L,H){return[D*f.c-L*f.sn,.5*(D*f.sn+L*f.c)-(H||0)]}
function rot(f,da){var a=f.A+da;return{A:a,c:Math.cos(a),sn:Math.sin(a)}}
function ang(f){return Math.atan2(.5*f.sn,f.c)}
function face(x,y,f){g.translate(x,y);var a=ang(f);g.rotate(a);if(Math.cos(a)<-.01)g.scale(1,-1)}
/* ---------- hình vẽ cơ bản ---------- */
var GC={};
function gsp(col){var k=GC[col];if(k)return k;var cv=document.createElement('canvas');cv.width=cv.height=64;var x=cv.getContext('2d'),q=x.createRadialGradient(32,32,0,32,32,32);
 q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.22,RGBA(col,.85));q.addColorStop(.6,RGBA(col,.25));q.addColorStop(1,RGBA(col,0));x.fillStyle=q;x.fillRect(0,0,64,64);return GC[col]=cv}
function glow(x,y,r,col,a){if(r<.5||a<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a>1?1:a;g.drawImage(gsp(col),x-r,y-r,2*r,2*r);g.restore()}
function smoke(x,y,r,col,a){if(r<.5||a<=0)return;g.save();g.globalAlpha=a>1?1:a;g.drawImage(gsp(col),x-r,y-r,2*r,2*r);g.restore()}
function line(x1,y1,x2,y2,col,w,al,ad){g.save();if(ad)g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore()}
function _ring(x,y,r,col,al,lw,dash,off){if(r<1||al<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=lw||3;if(dash){g.setLineDash(dash);g.lineDashOffset=off||0}g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.stroke();g.restore()}
function _disc(x,y,r,col,al){if(r<1||al<=0)return;g.save();g.globalAlpha=al>1?1:al;g.fillStyle=col;g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.fill();g.restore()}
function cring(x,y,r,col,al,lw){if(r<1||al<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=lw||3;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.restore()}
function pil(x,y,w,h,col,al){if(h<1||al<=0)return;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,RGBA(col,0));q.addColorStop(.6,RGBA(col,al*.7));q.addColorStop(1,RGBA('#ffffff',al));g.fillStyle=q;g.fillRect(x-w/2,y-h,w,h);g.restore()}
function star4(x,y,r,col,al,rt){if(r<.5||al<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.translate(x,y);g.rotate(rt||0);g.fillStyle=col;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.12,-r*.12,r,0);g.quadraticCurveTo(r*.12,r*.12,0,r);g.quadraticCurveTo(-r*.12,r*.12,-r,0);g.quadraticCurveTo(-r*.12,-r*.12,0,-r);g.fill();g.restore()}
function poly(P,col,al,ad){g.save();if(ad)g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.fillStyle=col;g.beginPath();g.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1]);g.closePath();g.fill();g.restore()}
/* vệt cong có đầu nhọn: arc tâm (x,y) bán kính Rr, dày th, từ a0 → a1 (k = ép dọc) */
function crescent(x,y,Rr,th,a0,a1,col,al,k){if(a1-a0<.02||al<=0)return;g.save();g.translate(x,y);if(k&&k!==1)g.scale(1,k);var am=(a0+a1)/2;g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.fillStyle=col;
 g.beginPath();g.arc(0,0,Rr,a0,a1);g.quadraticCurveTo(Math.cos(am)*(Rr-th*2),Math.sin(am)*(Rr-th*2),Math.cos(a0)*Rr,Math.sin(a0)*Rr);g.closePath();g.fill();g.restore()}
function moon(x,y,r,off,col,al){if(al<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.beginPath();g.arc(x,y,r,0,TAU);g.clip();g.fillStyle=col;g.beginPath();g.rect(x-r*2,y-r*2,r*4,r*4);g.arc(x+off,y-off*.15,r*.86,0,TAU,true);g.fill('evenodd');g.restore()}
/* dải thon: P = [[x,y]…] từ đuôi → đầu; mode 0: to dần về đầu · 1: nhọn hai đầu */
function ribbon(P,w,col,al,ad,mode){var n=P.length;if(n<2||al<=0)return;var Lf=[],Rt=[],i;
 for(i=0;i<n;i++){var a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/d,ny=dx/d,u=i/(n-1),ww=w*.5*(mode?Math.sin(u*PI):Math.pow(u,.7));Lf.push([P[i][0]+nx*ww,P[i][1]+ny*ww]);Rt.push([P[i][0]-nx*ww,P[i][1]-ny*ww])}
 g.save();if(ad)g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.fillStyle=col;g.beginPath();g.moveTo(Lf[0][0],Lf[0][1]);for(i=1;i<n;i++)g.lineTo(Lf[i][0],Lf[i][1]);for(i=n-1;i>=0;i--)g.lineTo(Rt[i][0],Rt[i][1]);g.closePath();g.fill();g.restore()}
/* tinh thể băng (đáy tại x,y, cao h, rộng w) */
function crystal(x,y,h,w,rt,col,al){if(h<2||al<=0)return;g.save();g.translate(x,y);g.rotate(rt||0);g.globalAlpha=al>1?1:al;
 g.fillStyle=RGBA(col,.88);g.beginPath();g.moveTo(0,-h);g.lineTo(-w,-h*.7);g.lineTo(-w*.8,0);g.lineTo(0,0);g.closePath();g.fill();
 g.fillStyle='rgba(185,232,255,.8)';g.beginPath();g.moveTo(0,-h);g.lineTo(w,-h*.7);g.lineTo(w*.8,0);g.lineTo(0,0);g.closePath();g.fill();
 g.strokeStyle='#fff';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-h);g.lineTo(-w,-h*.7);g.lineTo(-w*.8,0);g.lineTo(w*.8,0);g.lineTo(w,-h*.7);g.closePath();g.moveTo(0,-h);g.lineTo(0,0);g.stroke();
 g.globalCompositeOperation='lighter';g.globalAlpha=al*.35;g.fillStyle=col;g.fillRect(-w*.9,-h,w*1.8,h);g.restore()}
/* lưỡi lửa */
function flame(x,y,h,w,ph,c1,c2,al){if(h<2||al<=0)return;var sw=Math.sin(ph)*w*.55;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;
 var q=g.createLinearGradient(0,y,0,y-h);q.addColorStop(0,c1);q.addColorStop(.35,c1);q.addColorStop(1,RGBA(c1,0));g.fillStyle=q;
 g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w*1.35,y-h*.34,x-w*.55+sw*.3,y-h*.62,x+sw,y-h);g.bezierCurveTo(x+w*.55+sw*.3,y-h*.62,x+w*1.35,y-h*.34,x+w,y);g.quadraticCurveTo(x,y+w*.55,x-w,y);g.closePath();g.fill();
 var q2=g.createLinearGradient(0,y,0,y-h*.72);q2.addColorStop(0,c2);q2.addColorStop(1,RGBA(c2,0));g.fillStyle=q2;g.globalAlpha=(al>1?1:al)*.9;
 g.beginPath();g.moveTo(x-w*.5,y);g.bezierCurveTo(x-w*.7,y-h*.25,x-w*.2+sw*.25,y-h*.45,x+sw*.7,y-h*.72);g.bezierCurveTo(x+w*.2+sw*.25,y-h*.45,x+w*.7,y-h*.25,x+w*.5,y);g.closePath();g.fill();g.restore()}
/* kiếm (mũi hướng lên khi rt=0; len từ chuôi tới mũi) */
function sword(x,y,len,w,rt,col,al,edge){if(len<2||al<=0)return;g.save();g.translate(x,y);g.rotate(rt||0);g.globalAlpha=al>1?1:al;
 var q=g.createLinearGradient(-w,0,w,0);q.addColorStop(0,RGBA(col,.9));q.addColorStop(.5,'#ffffff');q.addColorStop(1,RGBA(col,.9));g.fillStyle=q;
 g.beginPath();g.moveTo(0,-len);g.lineTo(w*.5,-len*.9);g.lineTo(w*.5,-len*.16);g.lineTo(-w*.5,-len*.16);g.lineTo(-w*.5,-len*.9);g.closePath();g.fill();
 g.fillStyle=edge||'#ffd84a';g.fillRect(-w*1.15,-len*.17,w*2.3,Math.max(2,w*.3));g.fillRect(-w*.14,-len*.14,w*.28,len*.2);
 g.globalCompositeOperation='lighter';g.globalAlpha=al*.5;g.strokeStyle='#fff';g.lineWidth=Math.max(1,w*.12);g.beginPath();g.moveTo(0,-len*.9);g.lineTo(0,-len*.2);g.stroke();g.restore()}
/* thương băng/lửa (mũi hướng +x, dài len) */
function lance(len,w,col,al){g.save();g.globalAlpha=al>1?1:al;var q=g.createLinearGradient(-len,0,len*.2,0);q.addColorStop(0,RGBA(col,0));q.addColorStop(.6,RGBA(col,.85));q.addColorStop(1,'#ffffff');g.fillStyle=q;
 g.beginPath();g.moveTo(len*.2,0);g.lineTo(-len*.1,-w);g.lineTo(-len,-w*.25);g.lineTo(-len,w*.25);g.lineTo(-len*.1,w);g.closePath();g.fill();g.restore()}
/* hoa tuyết 6 cánh trên mặt đất */
function snow6(x,y,Rr,col,al,rt,lw){if(Rr<2||al<=0)return;g.save();g.translate(x,y);g.scale(1,.5);g.rotate(rt||0);g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=lw||2;g.lineCap='round';g.beginPath();
 for(var i=0;i<6;i++){var a=i*PI/3,c=Math.cos(a),s2=Math.sin(a);g.moveTo(0,0);g.lineTo(c*Rr,s2*Rr);
  [.45,.72].forEach(function(u){var bx=c*Rr*u,by=s2*Rr*u,bl=Rr*(.28-.1*u);g.moveTo(bx,by);g.lineTo(bx+Math.cos(a+.8)*bl,by+Math.sin(a+.8)*bl);g.moveTo(bx,by);g.lineTo(bx+Math.cos(a-.8)*bl,by+Math.sin(a-.8)*bl)})}
 g.stroke();g.restore()}
/* ngôi sao n cánh nối cách (trận pháp) trên mặt đất */
function _starN(x,y,Rr,n,col,al,rt,lw){if(Rr<2||al<=0)return;g.save();g.translate(x,y);g.scale(1,.5);g.rotate(rt||0);g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=lw||2;g.beginPath();
 var st=n%2?2:Math.floor(n/2)-1||1;for(var i=0;i<=n;i++){var a=-PI/2+(i*st%n)*TAU/n;if(i)g.lineTo(Math.cos(a)*Rr,Math.sin(a)*Rr);else g.moveTo(Math.cos(a)*Rr,Math.sin(a)*Rr)}g.stroke();g.restore()}

/* ====== HÌNH KHỐI RIÊNG TỪNG MÔN: nền đất / vòng / trận pháp không còn dùng chung khung tròn ====== */
var CUR='';
function pathBlob(x,y,r,n,amp,seed,spike,wave){g.beginPath();for(var i=0;i<=n;i++){var a=i/n*TAU,k=1+amp*(rnd(seed+(i%n))-.5)*2;if(spike&&i%2)k*=.62;if(wave)k*=1+wave*Math.sin(a*9+fr*.18);var px=x+Math.cos(a)*r*k,py=y+Math.sin(a)*r*k*.5;if(i)g.lineTo(px,py);else g.moveTo(px,py)}g.closePath()}
function disc(x,y,r,col,al){if(!CUR)return _disc(x,y,r,col,al);if(r<1||al<=0)return;var C=PAL[CUR];g.save();g.globalAlpha=al>1?1:al;g.fillStyle=col;
 if(CUR==='umt'){pathBlob(x,y,r,22,.1,3,1,0);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.5;g.strokeStyle=C.b;g.lineWidth=1.6;for(var i=0;i<7;i++){var a=rnd(i+40)*TAU,l=r*(.5+.45*rnd(i+50));g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l*.5+(rnd(i)-.5)*10,y+Math.sin(a)*l*.25);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l*.5);g.stroke()}}
 else if(CUR==='hbd'){pathBlob(x,y,r,11,.16,7,0,0);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.55;g.strokeStyle=C.w;g.lineWidth=1.2;for(i=0;i<5;i++){a=rnd(i+60)*TAU;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.25+(rnd(i)-.5)*8);g.lineTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.45);g.stroke()}}
 else if(CUR==='ptc'){pathBlob(x,y,r,48,.05,11,0,.08);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.5;var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,RGBA(C.b,.7));q.addColorStop(1,RGBA(C.b,0));g.fillStyle=q;pathBlob(x,y,r,48,.05,11,0,.08);g.fill()}
 else if(CUR==='tkt'){g.beginPath();g.moveTo(x-r*1.2,y);g.lineTo(x,y-r*.6);g.lineTo(x+r*1.2,y);g.lineTo(x,y+r*.6);g.closePath();g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.35;g.strokeStyle=C.a;g.lineWidth=1.2;g.beginPath();g.moveTo(x-r*.6,y-r*.3);g.lineTo(x+r*.6,y+r*.3);g.moveTo(x-r*.6,y+r*.3);g.lineTo(x+r*.6,y-r*.3);g.stroke()}
 else if(CUR==='vdm'){pathBlob(x,y,r,16,.2,17,0,.05);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.4;g.strokeStyle=C.a;g.lineWidth=2;pathBlob(x,y,r*.92,16,.2,17,0,.05);g.stroke()}
 else{g.beginPath();for(i=0;i<6;i++){a=i*PI/3;var hx=x+Math.cos(a)*r*1.1,hy=y+Math.sin(a)*r*.55;if(i)g.lineTo(hx,hy);else g.moveTo(hx,hy)}g.closePath();g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.3;g.strokeStyle=C.a;g.lineWidth=1.2;for(var ii=-1;ii<=1;ii++)for(var jj=-1;jj<=1;jj++){var cx=x+(ii*.62+(jj&1?.31:0))*r,cy=y+jj*r*.3,rr=r*.2;g.beginPath();for(var v=0;v<6;v++){var aa=v*PI/3;var qx=cx+Math.cos(aa)*rr*1.1,qy=cy+Math.sin(aa)*rr*.55;if(v)g.lineTo(qx,qy);else g.moveTo(qx,qy)}g.closePath();g.stroke()}}
 g.restore()}
function ring(x,y,r,col,al,lw,dash,off){if(!CUR)return _ring(x,y,r,col,al,lw,dash,off);if(r<1||al<=0)return;var i,a,n;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.fillStyle=col;g.lineWidth=lw||3;g.lineJoin='miter';
 if(CUR==='umt'){for(i=0;i<4;i++){var a0=i*PI/2+(off||0)*.01+fr*.01;g.beginPath();for(var k=0;k<=8;k++){a=a0+k/8*1.15;var rr=r*(1+((k%2)?.07:-.03)*Math.sin(a*3));k?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.5):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.5)}g.stroke()}}
 else if(CUR==='hbd'){n=Math.max(10,Math.round(r/5));for(i=0;i<n;i++){a=i/n*TAU;var cx=x+Math.cos(a)*r,cy=y+Math.sin(a)*r*.5,h=5+(i%3)*3+(lw||3)*.8;g.beginPath();g.moveTo(cx-3,cy);g.lineTo(cx,cy-h);g.lineTo(cx+3,cy);g.closePath();g.fill()}g.globalAlpha=al*.5;g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.stroke()}
 else if(CUR==='ptc'){g.beginPath();for(i=0;i<=60;i++){a=i/60*TAU;var rr2=r*(1+.1*Math.sin(a*10+fr*.22));i?g.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2*.5):g.moveTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2*.5)}g.closePath();g.stroke()}
 else if(CUR==='tkt'){g.beginPath();g.moveTo(x-r*1.15,y);g.lineTo(x,y-r*.58);g.lineTo(x+r*1.15,y);g.lineTo(x,y+r*.58);g.closePath();g.stroke();[[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){var cx=x+d[0]*r*1.15,cy=y+d[1]*r*.58*(d[1]?1:0);g.beginPath();g.moveTo(cx-d[0]*0-0,cy);g.lineTo(cx+(d[0]?d[0]*10:0),cy+(d[1]?d[1]*8:0));g.stroke()})}
 else if(CUR==='vdm'){g.beginPath();for(i=0;i<=40;i++){a=i/40*TAU;var rr3=r*(1+.07*Math.sin(a*5+fr*.05)+.05*Math.sin(a*11));i?g.lineTo(x+Math.cos(a)*rr3,y+Math.sin(a)*rr3*.5):g.moveTo(x+Math.cos(a)*rr3,y+Math.sin(a)*rr3*.5)}g.closePath();g.stroke();for(i=0;i<5;i++){a=i*1.3+.4;var dx=x+Math.cos(a)*r,dy=y+Math.sin(a)*r*.5,dl=6+8*((fr*.05+i)%1);g.beginPath();g.arc(dx,dy+dl,2.4,0,TAU);g.fill()}}
 else{g.beginPath();for(i=0;i<6;i++){a=i*PI/3+Math.PI/6;var hx=x+Math.cos(a)*r*1.08,hy=y+Math.sin(a)*r*.54;i?g.lineTo(hx,hy):g.moveTo(hx,hy)}g.closePath();g.stroke()}
 g.restore()}
function starN(x,y,Rr,n,col,al,rt,lw){if(!CUR||CUR==='umt')return _starN(x,y,Rr,n,col,al,rt,lw);if(Rr<2||al<=0)return;var i;
 if(CUR==='hbd')return snow6(x,y,Rr,col,al,rt,lw);
 g.save();g.translate(x,y);g.scale(1,.5);g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.strokeStyle=col;g.lineWidth=lw||2;g.lineCap='round';g.beginPath();
 if(CUR==='ptc'){for(i=0;i<16;i++){var a=i/16*TAU+(rt||0)*.5,l0=Rr*.25,l1=Rr*(i%2?.7:1);g.moveTo(Math.cos(a)*l0,Math.sin(a)*l0);g.lineTo(Math.cos(a)*l1,Math.sin(a)*l1)}}
 else if(CUR==='tkt'){for(i=-2;i<=2;i++){g.moveTo(-Rr,i*Rr*.4);g.lineTo(Rr,i*Rr*.4);g.moveTo(i*Rr*.4,-Rr);g.lineTo(i*Rr*.4,Rr)}g.moveTo(-Rr,-Rr);g.lineTo(Rr,Rr);g.moveTo(Rr,-Rr);g.lineTo(-Rr,Rr)}
 else if(CUR==='vdm'){for(var arm=0;arm<3;arm++){for(i=0;i<=24;i++){var t=i/24,a2=arm*TAU/3+t*5+(rt||0),rr=Rr*t;i?g.lineTo(Math.cos(a2)*rr,Math.sin(a2)*rr):g.moveTo(Math.cos(a2)*rr,Math.sin(a2)*rr)}}}
 else{for(var j=0;j<7;j++){var cx=j?Math.cos((j-1)*PI/3+(rt||0))*Rr*.55:0,cy=j?Math.sin((j-1)*PI/3+(rt||0))*Rr*.55:0;for(i=0;i<=6;i++){var a3=i*PI/3+(rt||0),px=cx+Math.cos(a3)*Rr*.3,py=cy+Math.sin(a3)*Rr*.3;i?g.lineTo(px,py):g.moveTo(px,py)}}}
 g.stroke();g.restore()}
/* màu không khí cả vùng khi tung TUYỆT KỸ: mỗi môn một sắc thái */
function atmos(id,a){if(a<=.01)return;var T={umt:['#2a0618',.30,0],hbd:['#cfeeff',.13,1],ptc:['#ff7a20',.11,1],tkt:['#fff2c0',.09,1],vdm:['#0f4a1c',.26,0],ngc:['#b050d8',.13,1]}[id];if(!T)return;
 g.save();g.globalCompositeOperation=T[2]?'lighter':'source-over';g.globalAlpha=T[1]*a;g.fillStyle=T[0];g.fillRect(-2400,-2400,4800,3000);
 if(id==='tkt'){g.globalCompositeOperation='lighter';for(var i=0;i<7;i++){var x=(i-3)*150+Math.sin(fr*.01+i)*20;var q=g.createLinearGradient(x,-900,x,0);q.addColorStop(0,RGBA('#ffe27a',0));q.addColorStop(1,RGBA('#ffe27a',.22*a));g.fillStyle=q;g.fillRect(x-7,-900,14,900)}}
 if(id==='hbd'){g.globalCompositeOperation='lighter';g.strokeStyle='#fff';g.lineWidth=1.4;g.globalAlpha=.4*a;for(i=0;i<26;i++){var u=((fr*.02*(.6+rnd(i))+rnd(i+3))%1),sx=(rnd(i+7)-.5)*900+u*160,sy=-700+u*700;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-14,sy-40);g.stroke()}}
 g.restore()}
function bat(x,y,sz,rt,col,ph,al){g.save();g.translate(x,y);g.rotate(rt);g.globalAlpha=al>1?1:al;g.fillStyle=col;var fl=Math.sin(ph)*.6;
 [-1,1].forEach(function(sd){g.save();g.scale(1,sd);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-sz*.3,-sz*(.7+fl),-sz*1.1,-sz*(.55+fl));g.quadraticCurveTo(-sz*.7,-sz*(.3+fl*.4),-sz*.45,-sz*.2);g.quadraticCurveTo(-sz*.25,-sz*.05,0,0);g.fill();g.restore()});
 g.beginPath();g.ellipse(0,0,sz*.28,sz*.2,0,0,TAU);g.fill();g.restore()}
function skull(x,y,sz,col,al,jaw,eye){g.save();g.translate(x,y);g.globalAlpha=al>1?1:al;g.fillStyle=col;g.beginPath();g.arc(0,-sz*.1,sz*.62,PI*.92,PI*2.08);g.lineTo(sz*.42,sz*.4);g.lineTo(sz*.28,sz*.4+(jaw||0));g.lineTo(-sz*.28,sz*.4+(jaw||0));g.lineTo(-sz*.42,sz*.4);g.closePath();g.fill();
 g.fillStyle=eye||'#06140a';g.beginPath();g.ellipse(-sz*.24,-sz*.05,sz*.16,sz*.2,0,0,TAU);g.ellipse(sz*.24,-sz*.05,sz*.16,sz*.2,0,0,TAU);g.fill();g.beginPath();g.moveTo(0,sz*.12);g.lineTo(-sz*.08,sz*.3);g.lineTo(sz*.08,sz*.3);g.fill();g.restore()}
function bug(x,y,sz,rt,col,body,ph,al){sz*=1.9;g.save();g.translate(x,y);g.rotate(rt);g.globalAlpha=al>1?1:al;var wf=.35+.65*Math.abs(Math.sin(ph));
 g.fillStyle='rgba(255,255,255,.45)';[-1,1].forEach(function(sd){g.beginPath();g.ellipse(-sz*.1,sd*sz*.5,sz*.75,sz*.3*wf+sz*.04,sd*-.45,0,TAU);g.fill()});
 g.strokeStyle=body;g.lineWidth=Math.max(.8,sz*.1);g.beginPath();g.moveTo(sz*.9,-sz*.12);g.lineTo(sz*1.7,-sz*.55);g.moveTo(sz*.9,sz*.12);g.lineTo(sz*1.7,sz*.55);g.stroke();
 g.fillStyle=body;g.beginPath();g.ellipse(0,0,sz,sz*.44,0,0,TAU);g.fill();g.fillStyle=col;g.beginPath();g.ellipse(-sz*.15,0,sz*.62,sz*.3,0,0,TAU);g.fill();g.beginPath();g.arc(sz*.9,0,sz*.3,0,TAU);g.fill();g.restore()}
/* mai giáp xà cừ / bọ vàng (nhìn từ trên xuống, dài len) */
function beetle(x,y,len,rt,al){g.save();g.translate(x,y);g.rotate(rt);g.globalAlpha=al>1?1:al;var w=len*.55;
 g.strokeStyle='#5a3a10';g.lineWidth=Math.max(1,len*.07);g.beginPath();for(var i=-1;i<=1;i++){g.moveTo(len*.1*i,w*.5);g.lineTo(len*.22*i-len*.1,w*1.05);g.moveTo(len*.1*i,-w*.5);g.lineTo(len*.22*i-len*.1,-w*1.05)}g.stroke();
 var q=g.createLinearGradient(0,-w,0,w);q.addColorStop(0,'#fff2a8');q.addColorStop(.5,'#e8a820');q.addColorStop(1,'#8a5a10');g.fillStyle=q;g.beginPath();g.ellipse(0,0,len*.5,w*.62,0,0,TAU);g.fill();
 g.strokeStyle='#fff6c8';g.lineWidth=Math.max(1,len*.05);g.beginPath();g.moveTo(-len*.46,0);g.lineTo(len*.4,0);g.stroke();g.fillStyle='#3a2208';g.beginPath();g.arc(len*.52,0,len*.17,0,TAU);g.fill();g.restore()}
/* ========================================================================================== */
/*  BÓNG MỜ VŨ KHÍ TRÊN BẦU TRỜI (tuyệt kỹ)                                                    */
/* ========================================================================================== */
var WI={},TN={},GH=null;
function wimg(id){var k=WI[id];if(k)return k;var d=window.MPW3&&MPW3[id];if(!d)return null;var im=new Image();im.src=d[0];return WI[id]={im:im,w:d[1],h:d[2]}}
function tinted(id,o,col){var k=TN[id];if(k)return k;if(!o.im.complete||!o.im.naturalWidth)return null;var cv=document.createElement('canvas');cv.width=o.im.naturalWidth;cv.height=o.im.naturalHeight;var x=cv.getContext('2d');x.drawImage(o.im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);return TN[id]=cv}
function ghostStart(id,T){if(!CF.ghost||!PAL[id])return;wimg(id);GH={id:id,t0:fr,T:Math.max(30,T|0)}}
function mote(id,x,y,sz,al,t,i){var C=PAL[id];
 if(id==='vdm'){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al*.8;g.strokeStyle=C.a;g.lineWidth=1.5;g.beginPath();g.arc(x,y,sz*.7,0,TAU);g.stroke();g.restore();glow(x-sz*.2,y-sz*.2,sz*.3,'#ffffff',al*.7)}
 else if(id==='hbd'||id==='ngc')star4(x,y,sz*1.1,id==='hbd'?C.w:C.a,al,t*.02+i);
 else if(id==='tkt'){line(x,y+sz*1.6,x,y-sz*1.6,C.w,1.6,al*.8,1);glow(x,y,sz*.8,C.b,al*.5)}
 else glow(x,y,sz,id==='umt'?C.b:C.a,al)}
function ghostDraw(){
 if(!GH)return;var t=fr-GH.t0;if(t<0||t>=GH.T){GH=null;return}
 var id=GH.id,C=PAL[id],o=wimg(id),p=t/GH.T,a=sm(p/.09)*(1-sm((p-.9)/.1))*CF.ghostA;if(a<=.01)return;
 var top=-(GY-30)/s,bot=-140,hL=Math.max(230,bot-top),cy=(top+bot)/2;hL=Math.min(hL,-top*1.05);cy=Math.min(cy,bot-hL/2);
 var aw=o?hL*o.w/o.h:hL*.4,up=1-sm(p/.12);                       /* up: 1 → 0 lúc hiện ra */
 g.save();g.globalCompositeOperation='source-over';
 /* vầng sáng trời + trận pháp tròn phía sau */
 glow(0,cy,hL*.62,C.a,.22*a);glow(0,cy,hL*.3,C.b,.12*a);
 var Rr=hL*.44*(1.12-.12*(1-up));g.save();g.translate(0,cy);g.globalCompositeOperation='lighter';g.strokeStyle=C.a;
 g.globalAlpha=.34*a;g.lineWidth=3;g.beginPath();g.arc(0,0,Rr,0,TAU);g.stroke();g.lineWidth=1.5;g.beginPath();g.arc(0,0,Rr*.9,0,TAU);g.stroke();
 g.save();g.rotate(t*.006);g.globalAlpha=.3*a;g.lineWidth=2;g.setLineDash([Rr*.08,Rr*.06]);g.beginPath();g.arc(0,0,Rr*.8,0,TAU);g.stroke();g.restore();
 g.save();g.rotate(-t*.008);g.globalAlpha=.34*a;g.lineWidth=2;for(var i=0;i<24;i++){var an=i*TAU/24,l0=i%3?Rr*.92:Rr*.84;g.beginPath();g.moveTo(Math.cos(an)*l0,Math.sin(an)*l0);g.lineTo(Math.cos(an)*Rr*.99,Math.sin(an)*Rr*.99);g.stroke()}g.restore();
 g.save();g.rotate(t*.004);g.globalAlpha=.22*a;g.lineWidth=2;g.beginPath();for(i=0;i<=6;i++){var an2=i*TAU/6*2%TAU;if(i)g.lineTo(Math.cos(an2)*Rr*.78,Math.sin(an2)*Rr*.78);else g.moveTo(Rr*.78,0)}g.stroke();g.restore();g.restore();
 /* vũ khí */
 if(o&&o.im.complete&&o.im.naturalWidth){
  var tn=tinted(id,o,C.a),k=.72+.28*sm(p/.1),sx=.88+.12*Math.cos(t*.03),bob=Math.sin(t*.045)*9,tilt=id==='tkt'?PI:Math.sin(t*.02)*.05;
  g.save();g.translate(0,cy+bob+up*40);g.rotate(tilt);g.scale(k*sx,k);
  if(tn){g.globalCompositeOperation='lighter';[1.2,1.1,1.03].forEach(function(m,j){g.globalAlpha=a*[.08,.13,.2][j];g.drawImage(tn,-aw*m/2,-hL*m/2,aw*m,hL*m)})}
  g.globalCompositeOperation='source-over';g.globalAlpha=.36*a;g.drawImage(o.im,-aw/2,-hL/2,aw,hL);
  g.globalCompositeOperation='lighter';g.globalAlpha=.16*a;g.drawImage(o.im,-aw/2,-hL/2,aw,hL);g.restore()}
 /* hạt linh khí bay lên theo bản sắc môn phái */
 var N=Q(18);for(i=0;i<N;i++){var u=((t*.006*(.6+rnd(i))+rnd(i+5))%1),mx=(rnd(i+9)-.5)*(aw*1.25+60),my=cy+hL*.5-u*hL;mote(id,mx+Math.sin(t*.03+i)*8,my,3+rnd(i+2)*5,(1-u)*Math.min(1,u*6)*a*.85,t,i)}
 /* tan biến: tia sáng toả ra khi tuyệt kỹ kết thúc */
 if(p>.88){var e=sm((p-.88)/.12);for(i=0;i<Q(14);i++){var an3=rnd(i+30)*TAU,rr=hL*.5*e*(.4+rnd(i+40)*.8);star4(Math.cos(an3)*rr,cy+Math.sin(an3)*rr*1.2,6+rnd(i)*8,C.w,(1-e)*.9,an3)}}
 g.restore()}
/* bọc hero ngoài cùng: vẽ bóng mờ phía sau nhân vật */
if(typeof hero==='function'){var _h0=hero;hero=function(){
 if(GH&&CF.enable&&CF.ghost){try{g.save();try{g.translate((P.x-cam)*s,GY);g.scale(s,s);ghostDraw()}finally{g.restore()}}catch(e){GH=null}}
 return _h0.apply(this,arguments)}}
/* bản đồ thường: world/72 gọi TGFX2.cast('s',…) ở đầu mỗi chiêu → bắt tuyệt kỹ để hiện bóng mờ; ghi nhớ nguồn (map treo) cho thời lượng */
var T2=window.TGFX2;
if(T2&&T2.cast){var _c2=T2.cast;T2.cast=function(kind,o){var on=false;try{on=!!T2.on()}catch(e){}SRC=on?'treo':'';
 try{if(!on&&kind==='s'&&o&&o.s&&o.s.ult&&o.id)ghostStart(o.id,Math.round((o.s.dur||5)*60));return _c2.apply(this,arguments)}finally{SRC=''}}}
/* ========================================================================================== */
/*  KHO CÔNG THỨC: SK[môn][biểu tượng kỹ năng] = function(F,C) → {T: số khung thật, ult?, draw(p,t)}     */
/* ========================================================================================== */
var SK={umt:{},hbd:{},ptc:{},tkt:{},vdm:{},ngc:{}};
function nk(s){return String(s||'').replace(/\uFE0F/g,'')}
function reg(id,ic,fn){SK[id][nk(ic)]=fn}
function dur(F,d){return Math.round((F.sp.dur||d)*60)}
function Rult(F){return Math.max(190,Math.min((F.sp.r||500)*.55,300))}
function Rarea(F){return Math.max(70,Math.min(F.sp.r||150,170))}
function sortY(a){a.sort(function(u,v){return u.y-v.y});return a}
/* bóng người áo choàng (phân thân U Minh) */
function phantom(x,y,sc,C,al,lean){if(al<=0)return;g.save();g.translate(x,y);g.scale(sc,sc);g.transform(1,0,lean||0,1,0,0);g.globalAlpha=al>1?1:al;
 g.fillStyle=C.d;g.strokeStyle=C.a;g.lineWidth=1.6;g.beginPath();g.moveTo(-14,-80);g.quadraticCurveTo(-26,-40,-30,0);g.lineTo(-20,-8);g.lineTo(-10,2);g.lineTo(0,-8);g.lineTo(10,2);g.lineTo(20,-8);g.lineTo(30,0);g.quadraticCurveTo(26,-40,14,-80);g.closePath();g.fill();g.stroke();
 g.beginPath();g.arc(0,-92,14,0,TAU);g.fill();g.stroke();g.globalCompositeOperation='lighter';g.fillStyle=C.b;g.beginPath();g.ellipse(-5,-93,3.2,1.8,.3,0,TAU);g.ellipse(5,-93,3.2,1.8,-.3,0,TAU);g.fill();
 g.strokeStyle=C.b;g.lineWidth=2.4;g.beginPath();g.moveTo(22,-60);g.lineTo(46,-120);g.stroke();g.beginPath();g.arc(46,-120,16,PI*1.1,PI*1.75);g.stroke();g.restore();glow(x,y-92*sc,16*sc,C.b,al*.5)}
/* ============================== U MINH MA TÔNG ============================== */
reg('umt','🗡️',function(F,C){var f=F.f,an=ang(f),n=Math.min(5,F.sp.h||3);   /* Ảnh Nhận Trảm: 3 vệt huyết nguyệt chém chéo */
 return{T:46,draw:function(p,t){var k,j;
  for(k=0;k<n;k++){var q=seg(t,k*9,k*9+14),al=1-seg(t,k*9+14,k*9+32);if(q<=0||al<=0)continue;
   var c=pt(f,115+k*55,(k-(n-1)/2)*16,48+k*4),tl=[-.75,.7,-.2,.55,-.5][k%5],a1=-1.25+2.5*sm(q);
   smoke(c[0]+30,c[1],70,C.d,.35*al);
   g.save();g.translate(c[0],c[1]);g.rotate(an+tl);crescent(0,0,100,36,-1.25,a1,C.a,al*.3,1);crescent(0,0,98,22,-1.25,a1,C.b,al*.6,1);crescent(0,0,96,5,-1.25,a1,C.w,al*.75,1);g.restore();
   if(q>.55)for(j=0;j<4;j++){var d=(q-.55)*60*(.6+rnd(k*5+j));glow(c[0]+(rnd(k*7+j)-.3)*90,c[1]+(rnd(k+j)-.5)*50+d,3+rnd(j)*3,C.b,al*.9)}}
  var qx=seg(t,n*9+3,n*9+10),ax=1-seg(t,n*9+10,n*9+26);if(qx>0&&ax>0){var m=pt(f,115+(n-1)/2*55,0,50),r=64*ea(qx);
   line(m[0]-r,m[1]-r*.6,m[0]+r,m[1]+r*.6,C.w,4*ax,ax,1);line(m[0]+r,m[1]-r*.6,m[0]-r,m[1]+r*.6,C.b,7*ax,ax,1);glow(m[0],m[1],r*1.1,C.b,.5*ax);ring(m[0],m[1]+30,r*1.3,C.a,.8*ax,3)}}}});
reg('umt','💨',function(F,C){var f=F.f,an=ang(f);   /* U Minh Độn: bóng lướt xuyên, để lại Ám Ảnh nổ sau 1,3 giây */
 return{T:94,draw:function(p,t){var e=ea(seg(t,2,17)),al=1-seg(t,17,30),k,P=[],o=pt(f,-30,0,0);
  if(al>0){for(k=0;k<=14;k++){var u=k/14;P.push(pt(f,-30+(300*e+30)*u,Math.sin(u*9+t*.3)*7,34))}
   ribbon(P,54*al+8,C.d,.8*al,0,0);ribbon(P,30*al,C.a,.7*al,1,0);ribbon(P,10*al,C.b,.95*al,1,0);
   for(k=1;k<=4;k++){var q=pt(f,300*Math.max(0,e-k*.11),0,0);phantom(q[0],q[1],.9,C,al*(.6-k*.12),0)}
   var a=pt(f,-30,0,40);if(t<16)for(k=0;k<7;k++){var u2=t/16,bx=a[0]+Math.cos(k*.9+an)*70*u2*(1+rnd(k)),by=a[1]+Math.sin(k*1.7)*44*u2-30*u2;bat(bx,by,8+rnd(k)*5,k*.9+an,C.d,t*.9+k,(1-u2)*.95)}
   var h=pt(f,300*e,0,36),qq=seg(t,14,30);glow(h[0],h[1],38,C.b,.7*al);if(qq>0){var r=70*ea(qq);line(h[0]-r,h[1]-r*.4,h[0]+r,h[1]+r*.4,C.w,3*al,al,1);line(h[0]-r*.8,h[1]+r*.3,h[0]+r*.8,h[1]-r*.3,C.b,6*al,.9*al,1)}}
  /* Ám Ảnh ở lại điểm xuất phát rồi nổ */
  var ea2=sm(seg(t,10,22))*(1-seg(t,80,90));if(ea2>0){phantom(o[0],o[1],1,C,.55*ea2*(.7+.3*Math.sin(t*.4)),0);ring(o[0],o[1],40+60*seg(t,50,78),C.b,.5*ea2,2,[6,6],-t)}
  var bq=seg(t,78,94);if(bq>0){ring(o[0],o[1],150*ea(bq),C.b,1-bq,4);ring(o[0],o[1],90*ea(bq),C.w,.8*(1-bq),2);glow(o[0],o[1]-40,110*(1-bq*.4),C.b,.6*(1-bq));
   for(k=0;k<10;k++){var an2=k*TAU/10;line(o[0]+Math.cos(an2)*20,o[1]-30+Math.sin(an2)*10,o[0]+Math.cos(an2)*(30+90*ea(bq)),o[1]-30+Math.sin(an2)*(15+45*ea(bq)),k%2?C.a:C.b,3*(1-bq),1-bq,1)}}}}});
reg('umt','🩸',function(F,C){var f=F.f;   /* Huyết Ảnh Truy Hồn: ấn máu + nhãn + xích */
 return{T:100,draw:function(p,t){var e=pt(f,200,0,0),a=fade(p,.8),k=sm(seg(t,0,14)),i,j;
  disc(e[0],e[1],86*k,C.d,.5*a);ring(e[0],e[1],84*k,C.b,a,3,[12,7],-t*.8);ring(e[0],e[1],60*k,C.a,a*.8,2);starN(e[0],e[1],80*k,5,C.b,a*.9,t*.012,2.4);
  for(i=0;i<4;i++){var an=i*PI/2+.7,cx=e[0]+Math.cos(an)*58*k,cy=e[1]+Math.sin(an)*29*k,h=(80+30*rnd(i))*sm(seg(t,4+i*3,24));
   for(j=0;j<h/9;j++){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.85;g.strokeStyle=j%2?C.a:C.b;g.lineWidth=2.2;g.beginPath();g.ellipse(cx+Math.sin(t*.07+i+j*.4)*3,cy-j*9,j%2?3.5:2,5,0,0,TAU);g.stroke();g.restore()}}
  var ey=e[1]-92+Math.sin(t*.08)*4,bl=Math.max(0,Math.sin(t*.11)*2-1.4);g.save();g.translate(e[0],ey);g.scale(k,k);g.globalCompositeOperation='lighter';g.globalAlpha=a;g.fillStyle=C.b;
  g.beginPath();g.moveTo(-30,0);g.quadraticCurveTo(0,-22*(1-bl),30,0);g.quadraticCurveTo(0,22*(1-bl),-30,0);g.fill();g.globalCompositeOperation='source-over';g.fillStyle='#14020a';g.beginPath();g.ellipse(0,0,9,12*(1-bl),0,0,TAU);g.fill();g.restore();
  glow(e[0],e[1]-20,56*k,C.b,.32*a);for(i=0;i<9;i++){var u=((t*.014+rnd(i))%1);glow(e[0]+(rnd(i+3)-.5)*110*k,e[1]-u*120,6,C.b,a*(1-u))}}}});
reg('umt','🌙',function(F,C){var f=F.f;   /* Ma Liêm Đoạt Mệnh: huyết nguyệt + liêm khổng lồ giáng xuống */
 return{T:56,draw:function(p,t){var e=pt(f,190,0,0),i,ma=sm(seg(t,0,12))*(1-sm(seg(t,32,56)));
  glow(e[0],e[1]-190,130,C.b,.32*ma);moon(e[0],e[1]-190,62,22,C.w,.5*ma);moon(e[0],e[1]-190,66,22,C.b,.35*ma);
  var q=seg(t,8,22),al=1-seg(t,24,46);if(q>0&&al>0){g.save();g.translate(e[0]-20,e[1]-90);g.rotate(-.55);var a1=-2.2+3.0*sm(q);
   crescent(0,0,168,56,-2.2,a1,C.a,al*.3,1);crescent(0,0,166,34,-2.2,a1,C.b,al*.62,1);crescent(0,0,164,7,-2.2,a1,C.w,al*.8,1);g.restore()}
  var qx=seg(t,17,28),ax=1-seg(t,30,52);if(qx>0&&ax>0){var r=76*ea(qx);line(e[0]-r,e[1]-34-r*.5,e[0]+r,e[1]-34+r*.5,C.w,5*ax,ax,1);line(e[0]+r,e[1]-34-r*.5,e[0]-r,e[1]-34+r*.5,C.b,9*ax,ax,1);
   glow(e[0],e[1]-34,110*ea(qx),C.b,.5*ax);ring(e[0],e[1],120*ea(qx),C.b,ax,4);ring(e[0],e[1],70*ea(qx),C.a,ax*.8,2);pil(e[0],e[1],46*ax,220*ea(qx),C.a,.7*ax);
   for(i=0;i<16;i++){var tt=(t-17)/9,sp=3+rnd(i)*4,ag=PI+rnd(i+5)*PI;glow(e[0]+Math.cos(ag)*sp*tt*9,e[1]-34+Math.sin(ag)*sp*tt*9+.5*.5*tt*tt*6,3+rnd(i+2)*3,C.b,ax)}}}}});
reg('umt','👥',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,5),ev=F.sp.every||15;   /* Cửu U Đoạt Hồn: phân thân liên kích */
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,24)),i,jj,pass;
  disc(m[0],m[1],Rr*k,C.d,.55*a);disc(m[0],m[1],Rr*.62*k,'#2a0a38',.3*a);ring(m[0],m[1],Rr*k,C.b,a,4,[16,10],-t*.7);ring(m[0],m[1],Rr*.78*k,C.a,a*.8,2);
  starN(m[0],m[1],Rr*.74*k,5,C.b,a*.8,t*.005,2.2);starN(m[0],m[1],Rr*.5*k,7,C.a,a*.6,-t*.007,1.6);
  for(i=0;i<8;i++){var wx=m[0]+Math.cos(i*.785+t*.01)*Rr*.9*k,wy=m[1]+Math.sin(i*.785+t*.01)*Rr*.45*k;flame(wx,wy,34+14*Math.sin(t*.1+i),9,t*.12+i,C.a,C.w,.7*a*k)}
  for(pass=0;pass<2;pass++)for(i=0;i<6;i++){var ph=t*.012+i*TAU/6,sn=Math.sin(ph);if((sn>=0)!==(pass===1))continue;var lc=((t+i*17)%60)/60,lg=lc<.28?Math.sin(lc/.28*PI):0,r=Rr*(.64-.52*lg);
   var x=m[0]+Math.cos(ph)*r,y=m[1]+Math.sin(ph)*r*.5;phantom(Math.cos(ph-.25)*r+m[0],Math.sin(ph-.25)*r*.5+m[1],.8,C,.18*a*k,0);phantom(x,y,.86+.1*sn,C,.92*a*k,Math.cos(ph)*.2);
   if(lg>.3){g.save();g.translate(x,y-40);g.rotate(Math.atan2(m[1]-y,m[0]-x)-.3);crescent(0,0,46,16,-1,1,C.b,lg*a,1);g.restore()}}
  for(jj=Math.floor(t/ev)-1;jj<=Math.floor(t/ev);jj++){var q=(t-jj*ev)/11;if(jj<0||q<0||q>=1)continue;var sx=m[0]+(rnd(jj+1)-.5)*Rr*1.5,sy=m[1]+(rnd(jj+3)-.5)*Rr*.7;
   g.save();g.translate(sx,sy-30);g.rotate((rnd(jj+7)-.5)*2);crescent(0,0,64,22,-1.2,-1.2+2.4*sm(q*1.4),C.b,(1-q)*a,1);crescent(0,0,62,6,-1.2,-1.2+2.4*sm(q*1.4),C.w,(1-q)*a,1);g.restore();ring(sx,sy,40*q+14,C.b,(1-q)*a,2.5);glow(sx,sy-20,44,C.b,.5*(1-q)*a)}
  for(i=0;i<Q(10);i++){var u=((t*.01+rnd(i))%1),an2=rnd(i+9)*TAU,rr=Math.sqrt(rnd(i+4))*Rr*.9*k;glow(m[0]+Math.cos(an2)*rr,m[1]+Math.sin(an2)*rr*.5-u*120,5,C.a,a*(1-u)*.8)}}}});
/* ============================== HUYỀN BĂNG ĐIỆN ============================== */
reg('hbd','❄️',function(F,C){var f=F.f;   /* Hàn Băng Chỉ: băng thương xé gió */
 return{T:34,draw:function(p,t){var e=ea(seg(t,0,24)),al=1-seg(t,26,34),i,P=[],D=40+380*e;
  if(al>0){for(i=0;i<=12;i++)P.push(pt(f,40+(D-40)*i/12,0,40));ribbon(P,28,C.b,.45*al,1,0);ribbon(P,12,C.a,.85*al,1,0);ribbon(P,4,'#fff',al,1,0);
   for(i=0;i<7;i++){var u=((t*.07+rnd(i))%1),s0=pt(f,D-u*150,(rnd(i+3)-.5)*30,40+(rnd(i+7)-.5)*24);star4(s0[0],s0[1],4+rnd(i)*4,C.w,.85*(1-u)*al,t*.05+i)}
   var h=pt(f,D,0,40);g.save();face(h[0],h[1],f);lance(62,9,C.a,al);g.restore();glow(h[0],h[1],28,C.a,.75*al)}
  if(t>22){var q=seg(t,22,34),e2=pt(f,420,0,0);ring(e2[0],e2[1],70*ea(q),C.a,1-q,3);star4(e2[0],e2[1]-26,60*(1-q*.4),C.w,1-q,.4);
   for(i=0;i<10;i++){var an=i*TAU/10+.2,r0=10+16*q,r1=20+80*ea(q);line(e2[0]+Math.cos(an)*r0,e2[1]-26+Math.sin(an)*r0*.6,e2[0]+Math.cos(an)*r1,e2[1]-26+Math.sin(an)*r1*.6,i%2?C.a:C.w,3*(1-q),1-q,1)}}}}});
reg('hbd','🧊',function(F,C){var f=F.f,Rr=Rarea(F),cs=[],i;   /* Băng Tinh Phá: băng trụ trồi lên */
 for(i=0;i<9;i++){var an=rnd(i)*TAU,rr=(i?Math.sqrt(rnd(i+5)):0)*Rr*.78;cs.push({x:Math.cos(an)*rr,y:Math.sin(an)*rr*.5,h:(80+110*rnd(i+2))*(i?1:1.5),w:12+14*rnd(i+4),st:i*1.3,rt:(rnd(i+8)-.5)*.35})}
 sortY(cs);
 return{T:48,draw:function(p,t){var e=pt(f,190,0,0),al=fade(p,.7),gk=ea(seg(t,0,8)),i;
  disc(e[0],e[1],Rr*gk*.9,'#9fe8ff',.2*al);ring(e[0],e[1],Rr*gk,C.a,al,3);snow6(e[0],e[1],Rr*.92*gk,C.w,.6*al,t*.01,1.6);
  var sh=seg(t,36,48);for(i=0;i<cs.length;i++){var c=cs[i],gr=ea(seg(t,2+c.st,10+c.st));crystal(e[0]+c.x,e[1]+c.y,c.h*gr*(1-sh*.45),c.w,c.rt,C.a,al*(1-sh*.5))}
  glow(e[0],e[1]-40,Rr*.85,C.a,.22*al*gk);smoke(e[0],e[1]-6,Rr*.9,'#cfeeff',.16*al);
  if(sh>0)for(i=0;i<16;i++){var an=rnd(i+20)*TAU,sp=40+rnd(i+30)*70;var x=e[0]+Math.cos(an)*sp*sh,y=e[1]-40-Math.abs(Math.sin(an))*sp*sh*1.1+sh*sh*60;star4(x,y,5+rnd(i)*5,C.w,(1-sh)*.9,an)}}}});
reg('hbd','🥶',function(F,C){var f=F.f;   /* Huyền Băng Lao: giam băng rồi NỨT VỠ */
 return{T:108,draw:function(p,t){var e=pt(f,190,0,0),k=ea(seg(t,0,12)),al=1-seg(t,98,108),sh=seg(t,92,108),i,pass,fz=1-sh*.9;
  disc(e[0],e[1],100*k,'#bff4ff',.18*al);snow6(e[0],e[1],94*k,C.w,.8*al,-t*.01,2);ring(e[0],e[1],70*k,C.a,al,3);
  for(pass=0;pass<2;pass++){if(pass===1)glow(e[0],e[1]-50,56*k,C.a,.4*al*fz);
   for(i=0;i<8;i++){var an=i*TAU/8+.3,sn=Math.sin(an);if((sn>=0)!==(pass===1))continue;var h=(122+22*rnd(i))*ea(seg(t,3+i,16+i))*fz;crystal(e[0]+Math.cos(an)*84*k,e[1]+sn*42*k,h,14,-Math.cos(an)*.16,C.a,al)}}
  if(t>40&&t<92){var cr=seg(t,40,92);for(i=0;i<5;i++){var a1=rnd(i+3)*TAU;line(e[0]+Math.cos(a1)*10,e[1]-50+Math.sin(a1)*10,e[0]+Math.cos(a1)*(30+30*cr),e[1]-50+Math.sin(a1)*(24+24*cr),C.w,1.4,.6*cr,1)}}
  if(sh>0){ring(e[0],e[1],130*ea(sh),C.w,1-sh,4);ring(e[0],e[1],80*ea(sh),C.a,.8*(1-sh),3);glow(e[0],e[1]-40,120*(1-sh*.5),C.w,.6*(1-sh));
   for(i=0;i<18;i++){var a2=rnd(i+9)*TAU,sp=30+rnd(i+11)*90;star4(e[0]+Math.cos(a2)*sp*sh,e[1]-50+Math.sin(a2)*sp*sh*.8+sh*sh*40,5+rnd(i)*7,C.w,1-sh,a2)}}
  for(i=0;i<10;i++){var u=((t*.012+rnd(i))%1);star4(e[0]+(rnd(i+2)-.5)*130,e[1]-120+u*130,3+rnd(i)*4,C.w,.8*al*Math.sin(u*PI),t*.04+i)}}}});
reg('hbd','🐲',function(F,C){var f=F.f;   /* Băng Long Xuất Hải: rồng băng từng đốt */
 return{T:48,draw:function(p,t){var hd=ea(seg(t,0,34)),al=1-seg(t,38,48),N=20,i,D=60+360*hd,pts=[];if(al<=0)return;
  for(i=0;i<=N;i++){var u=i/N;pts.push(pt(f,D-u*230,Math.sin(u*7-t*.3)*30*Math.min(1,u*3),44+Math.cos(u*6-t*.28)*16))}
  for(i=N;i>=1;i--){var u2=i/N,z=31*(1-u2*.8)+6,x=pts[i][0],y=pts[i][1];if(i%2===0)poly([[x-z*.5,y-z*.7],[x,y-z*1.9],[x+z*.5,y-z*.7]],C.w,.85*al);poly([[x+z*1.4,y],[x,y-z*.85],[x-z*1.4,y],[x,y+z*.85]],C.a,.82*al);poly([[x+z*.9,y],[x,y-z*.5],[x-z*.9,y],[x,y+z*.5]],C.w,.8*al);glow(x,y,z*1.6,C.a,.3*al)}
  var h=pts[0];glow(h[0],h[1],64,C.a,.5*al);g.save();face(h[0],h[1],f);g.globalAlpha=al;g.fillStyle=C.w;g.beginPath();g.moveTo(48,0);g.lineTo(12,-16);g.lineTo(-14,-13);g.lineTo(-10,13);g.lineTo(14,16);g.closePath();g.fill();
  g.fillStyle=C.a;g.beginPath();g.moveTo(48,0);g.lineTo(14,-3);g.lineTo(-8,-1);g.lineTo(-8,5);g.lineTo(14,6);g.closePath();g.fill();
  g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(-6,-12);g.lineTo(-30,-34);g.moveTo(2,-14);g.lineTo(-14,-42);g.stroke();g.globalCompositeOperation='lighter';g.fillStyle=C.b;g.beginPath();g.arc(8,-6,3.4,0,TAU);g.fill();g.restore();
  var br=pt(f,D+50,0,44);for(i=0;i<9;i++){var u3=((t*.1+rnd(i))%1),bp=pt(f,D+50+u3*110,(rnd(i+3)-.5)*60*u3,44+(rnd(i+5)-.5)*40*u3);star4(bp[0],bp[1],5+rnd(i)*5,C.w,(1-u3)*.9*al,t*.1+i)}
  glow(br[0],br[1],40,C.w,.5*al);ring(pts[0][0],pts[0][1]+44,56,C.a,.6*al,3)}}});
reg('hbd','🌨️',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,6),ev=F.sp.every||30;   /* Băng Phong Vạn Lý: bão tuyết */
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,26)),i,jj;
  disc(m[0],m[1],Rr*k,'#0a2a4a',.4*a);disc(m[0],m[1],Rr*.7*k,'#bff4ff',.1*a);snow6(m[0],m[1],Rr*.94*k,C.w,.75*a,t*.004,2.6);snow6(m[0],m[1],Rr*.5*k,C.a,.6*a,-t*.007,2);
  ring(m[0],m[1],Rr*k,C.a,a,4,[18,10],-t*.6);ring(m[0],m[1],Rr*.72*k,C.b,a*.8,2.5);
  for(i=0;i<Q(16);i++){var an=t*.016*(1+.4*rnd(i))+i*TAU/16,rr=Rr*(.35+.55*rnd(i+4))*k;star4(m[0]+Math.cos(an)*rr,m[1]+Math.sin(an)*rr*.5-14,4+rnd(i)*5,C.w,.8*a,t*.05+i)}
  for(jj=Math.floor(t/ev)-1;jj<=Math.floor(t/ev);jj++){var q=(t-jj*ev)/20;if(jj<0||q<0||q>=1)continue;var lx=m[0]+(rnd(jj+11)-.5)*Rr*1.5,ly=m[1]+(rnd(jj+12)-.5)*Rr*.7,fl=seg(q,0,.55);
   if(q<.55){var yy=ly-(1-ea(fl))*360;line(lx,yy-70,lx,yy,C.a,4,.8,1);crystal(lx,yy,64,10,PI,C.a,.95)}
   else{var gq=seg(q,.55,1);crystal(lx,ly,48*(1-gq*.4),14,0,C.a,1-gq);ring(lx,ly,60*ea(gq),C.w,1-gq,3);star4(lx,ly-30,40*(1-gq),C.w,1-gq,gq*2)}}
  for(i=0;i<Q(34);i++){var u=((t*.024*(.7+rnd(i))+rnd(i+1))%1),x=m[0]+(rnd(i+2)-.5)*Rr*2.4+u*100,y=m[1]+(rnd(i+3)-.5)*Rr*.6-(1-u)*340;line(x,y,x-14,y-44,C.w,1.6,.65*a*Math.min(1,u*5),1)}}}});
/* ============================== PHẦN THIÊN CỐC ============================== */
function flameBurst(x,y,n,rad,hMax,t0,t,C,al,seed){for(var i=0;i<n;i++){var an=rnd(i+seed)*TAU,rr=(i?Math.sqrt(rnd(i+seed+5)):0)*rad,gr=ea(seg(t,t0+i*.9,t0+8+i*.9))*(1-sm(seg(t,t0+16,t0+30)));
 flame(x+Math.cos(an)*rr,y+Math.sin(an)*rr*.5,(hMax*(.5+.5*rnd(i+seed+2)))*gr,12+9*rnd(i+seed+3),t*.2+i,C.b,C.w,al)}}
reg('ptc','🔥',function(F,C){var f=F.f;   /* Viêm Hỏa Chú: hoả cầu sao chổi */
 return{T:34,draw:function(p,t){var e=ea(seg(t,0,24)),al=1-seg(t,26,34),i,D=40+380*e;
  if(al>0){for(i=7;i>=0;i--){var u=i/8,q=pt(f,D-u*130,0,36);g.save();face(q[0],q[1],f);g.rotate(-PI/2);flame(0,0,70*(1-u*.5),18*(1-u*.5),t*.3+i,C.b,C.a,.85*al*(1-u*.4));g.restore()}
   var h=pt(f,D,0,36);glow(h[0],h[1],46,C.b,.7*al);glow(h[0],h[1],30,C.a,.9*al);glow(h[0],h[1],15,C.w,al);
   for(i=0;i<6;i++){var u2=((t*.08+rnd(i))%1),sp=pt(f,D-u2*120,(rnd(i+3)-.5)*40,36+(rnd(i+9)-.5)*30+u2*20);glow(sp[0],sp[1],3+rnd(i)*3,C.a,(1-u2)*al)}}
  if(t>22){var q2=seg(t,22,34),e2=pt(f,420,0,0);ring(e2[0],e2[1],80*ea(q2),C.b,1-q2,4);glow(e2[0],e2[1]-24,70*(1-q2*.4),C.a,(1-q2)*.8);
   for(i=0;i<7;i++){var an=-PI*.15-i*PI*.12-.2;flame(e2[0]+(i-3)*10,e2[1],(40+40*rnd(i))*Math.sin(Math.min(1,q2*1.5)*PI*.9),9,t*.3+i,C.b,C.w,1-q2)}}}}});
reg('ptc','💥',function(F,C){var f=F.f,Rr=Rarea(F);   /* Liệt Diễm Bạo Phát: bùng nổ cột lửa */
 return{T:48,draw:function(p,t){var e=pt(f,190,0,0),al=fade(p,.72),i;
  var w=seg(t,0,9);if(t<12){ring(e[0],e[1],Rr*(1.2-.2*w),C.a,.9*(1-w*.3),3,[8,6],-t);ring(e[0],e[1],Rr*.5*w,C.b,.8,2)}
  var x=seg(t,9,16);if(x>0){disc(e[0],e[1],Rr*ea(x),'#3a0a00',.4*al);ring(e[0],e[1],Rr*1.1*ea(x),C.b,(1-seg(t,16,40))*.9,5);ring(e[0],e[1],Rr*.7*ea(x),C.w,(1-seg(t,16,34))*.9,3);
   flameBurst(e[0],e[1],11,Rr*.85,200,9,t,C,al,3);pil(e[0],e[1],70*(1-seg(t,16,40)),240*ea(x),C.a,.75*al);glow(e[0],e[1]-50,Rr*1.1*(1-seg(t,12,44)*.5),C.b,.6*al);glow(e[0],e[1]-40,Rr*.5,C.w,.7*(1-seg(t,10,30)));
   for(i=0;i<16;i++){var tt=Math.max(0,t-10),an=rnd(i)*PI,sp=3+rnd(i+5)*5;glow(e[0]+Math.cos(an)*(1-rnd(i+8)*2)*sp*tt*1.6,e[1]-20-Math.sin(an)*sp*tt*1.5+tt*tt*.07*6,3+rnd(i+2)*3,i%2?C.a:C.w,al*(1-tt/38))}}}}});
reg('ptc','🔴',function(F,C){var f=F.f,Rr=Rarea(F),T=dur(F,5);   /* Hỏa Liên Trận: sen lửa */
 return{T:T,draw:function(p,t){var e=pt(f,170,0,0),a=fade(p,.88),k=ea(seg(t,0,18)),i;
  disc(e[0],e[1],Rr*k,'#3a0a00',.42*a);ring(e[0],e[1],Rr*k,C.b,a,3.5,[14,7],-t*.5);ring(e[0],e[1],Rr*.72*k,C.a,a*.85,2);starN(e[0],e[1],Rr*.66*k,8,C.a,a*.7,t*.01,1.8);
  for(i=0;i<8;i++){var an=i*PI/4+t*.008,x=e[0]+Math.cos(an)*Rr*.45*k,y=e[1]+Math.sin(an)*Rr*.225*k;flame(x,y,(60+18*Math.sin(t*.12+i))*k,13,t*.15+i,C.b,C.w,.85*a)}
  for(i=0;i<14;i++){var an2=i*TAU/14-t*.006,x2=e[0]+Math.cos(an2)*Rr*.92*k,y2=e[1]+Math.sin(an2)*Rr*.46*k;flame(x2,y2,(34+14*Math.sin(t*.1+i*2))*k,8,t*.2+i,C.b,C.a,.8*a)}
  flame(e[0],e[1],(120+26*Math.sin(t*.13))*k,22,t*.18,C.b,C.w,.95*a);glow(e[0],e[1]-40,Rr*.8,C.b,.25*a)}}});
reg('ptc','🦅',function(F,C){var f=F.f;   /* Phượng Hoàng Niết Bàn */
 return{T:48,draw:function(p,t){var hd=ea(seg(t,0,34)),al=1-seg(t,38,48),D=60+360*hd,i,j,P=[];if(al<=0)return;
  for(i=0;i<=10;i++)P.push(pt(f,D-230*(1-i/10),0,52));ribbon(P,64,C.b,.45*al,1,0);ribbon(P,32,C.a,.65*al,1,0);ribbon(P,10,C.w,.8*al,1,0);
  var h=pt(f,D,0,52),fl=Math.sin(t*.5);glow(h[0],h[1],80,C.b,.45*al);g.save();face(h[0],h[1],f);
  for(var sd=-1;sd<=1;sd+=2)for(j=0;j<7;j++){g.save();g.rotate(PI+sd*(.42+j*.17+fl*.24)+PI/2);flame(0,0,120-j*9,15,t*.2+j,C.b,j%2?C.w:C.a,.9*al);g.restore()}
  for(j=0;j<3;j++){g.save();g.rotate(PI+(j-1)*.2+PI/2);flame(-8,0,130+j*6,12,t*.17+j*2,C.b,C.a,.85*al);g.restore()}
  g.globalAlpha=al;g.fillStyle=C.w;g.beginPath();g.ellipse(0,0,26,12,0,0,TAU);g.fill();g.beginPath();g.arc(26,-2,8,0,TAU);g.fill();g.fillStyle=C.b;g.beginPath();g.moveTo(32,-5);g.lineTo(46,-1);g.lineTo(32,2);g.closePath();g.fill();
  g.fillStyle=C.a;g.beginPath();g.ellipse(-6,0,20,8,0,0,TAU);g.fill();g.restore();
  for(i=0;i<8;i++){var u=((t*.09+rnd(i))%1),sp=pt(f,D-u*160,(rnd(i+3)-.5)*60,52+(rnd(i+7)-.5)*50);glow(sp[0],sp[1],3+rnd(i)*4,i%2?C.a:C.w,(1-u)*al)}}}});
reg('ptc','☄️',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,6);   /* Cửu Dương Phần Thiên: 9 mặt trời hoả vũ */
 var sun=function(i,t){return[m[0]+(i-4)*Rr*.27,m[1]-300+Math.abs(i-4)*20+Math.sin(t*.04+i)*8]};
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,26)),i,jj;
  disc(m[0],m[1],Rr*k,'#2a0800',.5*a);ring(m[0],m[1],Rr*k,C.b,a,4,[16,10],-t*.6);ring(m[0],m[1],Rr*.74*k,C.a,a*.8,2.5);
  for(i=0;i<12;i++){var an=i*TAU/12+.3,r0=Rr*(.15+.1*rnd(i)),r1=Rr*(.6+.38*rnd(i+3));line(m[0]+Math.cos(an)*r0*k,m[1]+Math.sin(an)*r0*.5*k,m[0]+Math.cos(an)*r1*k,m[1]+Math.sin(an)*r1*.5*k,C.b,2.4,(.55+.35*Math.sin(t*.1+i))*a,1)}
  for(i=0;i<9;i++){var sn=sun(i,t),pu=1+.12*Math.sin(t*.12+i),sa=sm(seg(t,i*2,i*2+18))*a;glow(sn[0],sn[1],70*pu,C.b,.4*sa);glow(sn[0],sn[1],40*pu,C.a,.85*sa);glow(sn[0],sn[1],20*pu,C.w,sa);
   for(var r=0;r<8;r++){var ra=r*PI/4+t*.02;line(sn[0]+Math.cos(ra)*26,sn[1]+Math.sin(ra)*26,sn[0]+Math.cos(ra)*(44+8*Math.sin(t*.15+r)),sn[1]+Math.sin(ra)*(44+8*Math.sin(t*.15+r)),C.a,2,.7*sa,1)}}
  for(jj=Math.floor(t/9)-3;jj<=Math.floor(t/9);jj++){var q=(t-jj*9)/28;if(jj<2||q<0||q>=1)continue;var si=Math.floor(rnd(jj)*9),s0=sun(si,jj*9),lx=m[0]+(rnd(jj+2)-.5)*Rr*1.6,ly=m[1]+(rnd(jj+3)-.5)*Rr*.75;
   if(q<.5){var u=sm(q/.5),cx=s0[0]+(lx-s0[0])*u,cy=s0[1]+(ly-s0[1])*u,P2=[];for(i=0;i<=8;i++){var uu=Math.max(0,u-(1-i/8)*.22);P2.push([s0[0]+(lx-s0[0])*uu,s0[1]+(ly-s0[1])*uu])}
    ribbon(P2,22,C.b,.7*a,1,0);ribbon(P2,9,C.w,.9*a,1,0);glow(cx,cy,28,C.a,.9*a);glow(cx,cy,12,C.w,a)}
   else{var x=seg(q,.5,1);ring(lx,ly,70*ea(x),C.b,(1-x)*a,4);ring(lx,ly,40*ea(x),C.w,(1-x)*a,2);glow(lx,ly-20,60*(1-x*.5),C.b,.6*(1-x)*a);for(i=0;i<4;i++)flame(lx+(i-1.5)*12,ly,(50+30*rnd(i+jj))*Math.sin(Math.min(1,x*1.4)*PI*.9),9,t*.3+i,C.b,C.w,(1-x)*a)}}}}});
/* ============================== THIÊN KIẾM TÔNG ============================== */
reg('tkt','🌙',function(F,C){var f=F.f,an=ang(f);   /* Kiếm Khí Trảm: trăng khuyết kiếm khí */
 return{T:34,draw:function(p,t){var e=ea(seg(t,0,24)),al=1-seg(t,26,34),D=40+380*e,i;
  if(al>0){for(i=0;i<5;i++){var a0=pt(f,D-30-i*34,(i-2)*20,44),a1=pt(f,D-90-i*34,(i-2)*20,44);line(a0[0],a0[1],a1[0],a1[1],i%2?C.b:C.a,2.2,.55*al,1)}
   var c=pt(f,D,0,44);g.save();g.translate(c[0],c[1]);g.rotate(an);[[150,26,C.a,.35],[132,15,C.b,.65],[112,6,C.w,.95]].forEach(function(L){g.globalCompositeOperation='lighter';g.globalAlpha=L[3]*al;g.fillStyle=L[2];g.beginPath();g.moveTo(-L[0]*.55,0);g.lineTo(-L[0]*.1,-L[1]*.5);g.lineTo(L[0]*.6,0);g.lineTo(-L[0]*.1,L[1]*.5);g.closePath();g.fill()});g.restore();glow(c[0]+30,c[1],40,C.a,.45*al)}
  if(t>22){var q=seg(t,22,34),e2=pt(f,420,0,0);ring(e2[0],e2[1],60*ea(q),C.b,1-q,3);for(i=0;i<6;i++)star4(e2[0]+(rnd(i)-.5)*70*q,e2[1]-30-rnd(i+3)*50*q,6+rnd(i)*6,C.w,1-q,i)}}}});
reg('tkt','🗡️',function(F,C){var f=F.f,n=Math.min(6,F.sp.h||5);   /* Ngự Kiếm Quyết: phi kiếm truy kích */
 return{T:46,draw:function(p,t){var k,i,an=ang(f);
  for(k=0;k<n;k++){var o=k-(n-1)/2,b=pt(f,-5,o*26,96-Math.abs(o)*12),tg=pt(f,360,o*16,36),ls=12+k*3,q=ea(seg(t,ls,ls+13)),al=1-seg(t,ls+14,ls+34),ap=sm(seg(t,0,8));if(al<=0)continue;
   var x=b[0]+(tg[0]-b[0])*q,y=b[1]+(tg[1]-b[1])*q+Math.sin(t*.12+k)*3*(1-q),rt=(o*.3)*(1-q)+(an+PI/2)*q;
   if(q>0&&q<1){var P=[];for(i=0;i<=8;i++){var u=Math.max(0,q-(1-i/8)*.3);P.push([b[0]+(tg[0]-b[0])*u,b[1]+(tg[1]-b[1])*u])}ribbon(P,10,C.a,.7*al,1,0);ribbon(P,3.5,'#fff',.9*al,1,0)}
   glow(x,y,26,C.a,.45*al*ap);sword(x,y+28,58,8,rt,C.a,al*ap,C.b);if(q>=1){var r=seg(t,ls+13,ls+26);ring(tg[0],tg[1]+34,38*ea(r),C.b,(1-r)*.9,2.5);star4(tg[0],tg[1],20*(1-r),C.w,1-r,0)}}}}});
reg('tkt','⚡',function(F,C){var f=F.f;   /* Kiếm Bộ Vô Ảnh: một vệt sáng xuyên qua */
 return{T:26,draw:function(p,t){var e=ea(seg(t,2,14)),al=1-seg(t,14,26),i,P=[];if(al<=0)return;
  for(i=0;i<=12;i++)P.push(pt(f,-30+(300*e+30)*i/12,0,32));ribbon(P,36*al,C.a,.5*al,1,1);ribbon(P,14*al,C.w,.9*al,1,1);ribbon(P,4*al,'#fff',al,1,1);
  for(i=1;i<=3;i++){var q=pt(f,300*Math.max(0,e-i*.13),0,32);glow(q[0],q[1],24,C.a,.3*al/i);sword(q[0],q[1]+26,54,6,ang(f)+PI/2,C.a,.35*al/i,C.b)}
  var a=pt(f,-30,0,0);if(t<10){ring(a[0],a[1],56*t/10,C.w,1-t/10,3);ring(a[0],a[1],34*t/10,C.b,1-t/10,2)}
  var h=pt(f,300*e,0,32),qq=seg(t,12,26);if(qq>0){var r=84*ea(qq);line(h[0]-r*.9,h[1]+r*.5,h[0]+r*.9,h[1]-r*.5,C.w,4*(1-qq),1-qq,1);line(h[0]-r*.6,h[1]+r*.35,h[0]+r*.6,h[1]-r*.35,C.b,8*(1-qq),.8*(1-qq),1);glow(h[0],h[1],60*(1-qq*.5),C.a,.5*(1-qq))}}}});
reg('tkt','🌠',function(F,C){var f=F.f;   /* Trảm Thiên Nhất Kiếm: thiên kiếm giáng */
 return{T:64,draw:function(p,t){var e=pt(f,200,0,0),i,al=1-seg(t,50,64),cv=1-ea(seg(t,0,34));
  if(t<36){ring(e[0],e[1],40+120*cv,C.b,.85,3,[10,8],t);ring(e[0],e[1],20+70*cv,C.a,.8,2)}
  var len=290*ea(seg(t,0,24)),hy=e[1]-430+150*ea(seg(t,34,41)),sa=al;
  if(len>4){glow(e[0],hy+len*.6,150,C.a,.35*sa);for(i=0;i<10;i++){var an=i*TAU/10+t*.01;line(e[0]+Math.cos(an)*30,hy+len*.5+Math.sin(an)*30,e[0]+Math.cos(an)*(100+30*Math.sin(t*.2+i)),hy+len*.5+Math.sin(an)*(100+30*Math.sin(t*.2+i)),C.w,1.6,.35*sa,1)}sword(e[0],hy,len,40,PI,C.a,sa,C.b)}
  var x=seg(t,40,56);if(x>0){var bx=1-seg(t,44,60);pil(e[0],e[1],64*bx,340*ea(Math.min(1,x*2)),C.a,.9*bx);glow(e[0],e[1]-30,160*(1-x*.5),C.w,.8*(1-x));
   ring(e[0],e[1],150*ea(x),C.b,1-x,5);ring(e[0],e[1],95*ea(x),C.w,1-x,3);ring(e[0],e[1],50*ea(x),C.a,1-x,2);
   for(i=0;i<8;i++){var an2=i*PI/4+.2,r1=130*ea(x);line(e[0]+Math.cos(an2)*18,e[1]+Math.sin(an2)*9,e[0]+Math.cos(an2)*r1,e[1]+Math.sin(an2)*r1*.5,i%2?C.b:C.w,2.5*(1-x),(1-x)*.95,1)}
   for(i=0;i<14;i++){var aa=rnd(i)*PI,sp=40+rnd(i+4)*90;star4(e[0]+Math.cos(aa+PI)*sp*x,e[1]-20-Math.sin(aa)*sp*x*1.2,5+rnd(i)*6,C.w,1-x,aa)}}}}});
reg('tkt','⚔️',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,5),ev=F.sp.every||15;   /* Vạn Kiếm Quy Tông: kiếm trận */
 var RG=[[6,.32,1],[8,.62,-1],[10,.92,1]];
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,26)),i,j,L=[],jj;
  disc(m[0],m[1],Rr*k,C.d,.5*a);disc(m[0],m[1],Rr*.6*k,'#1a3a7a',.22*a);ring(m[0],m[1],Rr*k,C.b,a,4,[18,10],-t*.5);ring(m[0],m[1],Rr*.64*k,C.a,a*.85,2.5);ring(m[0],m[1],Rr*.33*k,C.b,a*.8,2);
  starN(m[0],m[1],Rr*.97*k,8,C.a,a*.55,t*.004,1.8);for(i=0;i<8;i++){var an=i*PI/4+t*.004;line(m[0]+Math.cos(an)*Rr*.9*k,m[1]+Math.sin(an)*Rr*.45*k,m[0]+Math.cos(an)*Rr*1.02*k,m[1]+Math.sin(an)*Rr*.51*k,C.b,3,a*.9,1)}
  for(j=0;j<3;j++)for(i=0;i<RG[j][0];i++){var ph=t*.006*RG[j][2]+i*TAU/RG[j][0]+j,r=Rr*RG[j][1]*k,hv=26+18*Math.sin(t*.06+i+j*2)+j*8,gr=ea(seg(t,4+i*1.4+j*6,22+i*1.4+j*6));L.push({x:m[0]+Math.cos(ph)*r,y:m[1]+Math.sin(ph)*r*.5,hv:hv,len:84+j*10,gr:gr})}
  sortY(L);for(i=0;i<L.length;i++){var s0=L[i];line(s0.x,s0.y-s0.hv,s0.x,s0.y,C.a,2,.3*a*s0.gr,1);glow(s0.x,s0.y,14,C.a,.35*a*s0.gr);sword(s0.x,s0.y-s0.hv-s0.len*s0.gr,s0.len*s0.gr,10,PI,C.a,a*s0.gr,C.b)}
  for(jj=Math.floor(t/7)-1;jj<=Math.floor(t/7);jj++){var q=(t-jj*7)/18;if(jj<2||q<0||q>=1)continue;var lx=m[0]+(rnd(jj+2)-.5)*Rr*1.6,ly=m[1]+(rnd(jj+3)-.5)*Rr*.75;
   if(q<.5){var yy=ly-(1-sm(q/.5))*330;line(lx,yy-120,lx,yy,C.w,3,.7*a,1);sword(lx,yy-90,90,9,PI,C.a,a,C.b)}else{var x=seg(q,.5,1);sword(lx,ly-90,90,9,PI,C.a,(1-x)*a,C.b);ring(lx,ly,52*ea(x),C.b,(1-x)*a,3);star4(lx,ly-14,22*(1-x),C.w,(1-x)*a,x*3)}}
  for(jj=Math.floor(t/ev)-1;jj<=Math.floor(t/ev);jj++){var q2=(t-jj*ev)/12;if(jj<0||q2<0||q2>=1)continue;glow(m[0],m[1]-20,Rr*.5*q2,C.b,(1-q2)*.35*a);ring(m[0],m[1],Rr*.9*ea(q2),C.w,(1-q2)*.6*a,2.5)}}}});
/* ============================== VẠN ĐỘC MÔN ============================== */
reg('vdm','🪡',function(F,C){var f=F.f;   /* Độc Châm Xuyên Tâm: 3 độc châm */
 return{T:34,draw:function(p,t){var e=ea(seg(t,0,24)),al=1-seg(t,26,34),D=40+380*e,k,i;
  if(al>0)for(k=0;k<3;k++){var L=(k-1)*15,P=[];for(i=0;i<=6;i++)P.push(pt(f,D-70+i*11.6-(k?0:8),L,38));ribbon(P,7,C.a,.9*al,1,0);ribbon(P,2.6,C.w,al,1,0);var h=pt(f,D-(k?0:8),L,38);glow(h[0],h[1],13,C.a,.8*al);
   for(i=0;i<3;i++){var u=((t*.09+rnd(i+k*3))%1),d=pt(f,D-u*110-8,L+(rnd(i+k)-.5)*14,38+u*26);glow(d[0],d[1],3+rnd(i)*2,C.b,(1-u)*al)}}
  if(t>22){var q=seg(t,22,34),e2=pt(f,420,0,0);ring(e2[0],e2[1],64*ea(q),C.a,1-q,3);smoke(e2[0],e2[1]-20,50*ea(q),C.b,.4*(1-q));
   for(i=0;i<10;i++){var an=PI+rnd(i)*PI,sp=18+rnd(i+4)*52;glow(e2[0]+Math.cos(an)*sp*q*1.3,e2[1]-16+Math.sin(an)*sp*q*1.1+q*q*50,3+rnd(i+2)*4,i%2?C.a:C.w,1-q)}}}}});
reg('vdm','🟢',function(F,C){var f=F.f,Rr=Rarea(F),T=dur(F,5);   /* Vạn Độc Mê Vụ: sương độc */
 return{T:T,draw:function(p,t){var e=pt(f,170,0,0),a=fade(p,.88),k=ea(seg(t,0,22)),i;
  disc(e[0],e[1],Rr*k,'#0a3a14',.4*a);ring(e[0],e[1],Rr*k,C.a,a,3,[12,8],-t*.4);ring(e[0],e[1],Rr*.62*k,C.b,a*.7,2);
  for(i=0;i<Q(14);i++){var an=rnd(i)*TAU+t*.004*(1+rnd(i+2)),rr=Math.sqrt(rnd(i+5))*Rr*.82*k,x=e[0]+Math.cos(an)*rr,y=e[1]+Math.sin(an)*rr*.5-10-8*Math.sin(t*.03+i);smoke(x,y,44+22*rnd(i+8),i%3?C.b:'#0a5a20',.3*a);glow(x,y,34,C.a,.1*a)}
  for(i=0;i<Q(12);i++){var u=((t*.012+rnd(i))%1),bx=e[0]+(rnd(i+3)-.5)*Rr*1.5*k,by=e[1]+(rnd(i+4)-.5)*Rr*.5*k-u*96,br=4+rnd(i+6)*6;cring(bx,by,br,C.a,.85*a*(1-u),1.6);glow(bx-br*.3,by-br*.3,br*.5,'#fff',.6*a*(1-u))}
  for(i=0;i<3;i++){var u2=((t*.007+i/3)%1);skull(e[0]+(i-1)*Rr*.55,e[1]-u2*130,22,C.a,.42*a*Math.sin(u2*PI),0)}}}});
reg('vdm','🧪',function(F,C){var f=F.f;   /* Phệ Tâm Độc Chú: đầu lâu độc nổ bào tử */
 return{T:48,draw:function(p,t){var e=pt(f,180,0,0),al=fade(p,.75),k=ea(seg(t,0,12)),i;
  disc(e[0],e[1],70*k,'#0a3a14',.4*al);ring(e[0],e[1],68*k,C.a,al,3,[8,6],-t);starN(e[0],e[1],60*k,5,C.a,al*.8,t*.02,2);
  if(t<18){var u=ea(seg(t,0,16));glow(e[0],e[1]-10-70*u,50*u+10,C.a,.5);skull(e[0],e[1]-10-70*u,18+24*u,C.a,.95,Math.sin(t*.6)*4+3)}
  if(t>=16){var q=seg(t,16,48);ring(e[0],e[1],130*ea(q),C.a,1-q,4);ring(e[0],e[1],80*ea(q),C.w,.8*(1-q),2);smoke(e[0],e[1]-30,100*ea(q),C.b,.45*(1-q));
   for(i=0;i<18;i++){var an=rnd(i)*TAU,r=ea(q)*(30+86*rnd(i+3));glow(e[0]+Math.cos(an)*r,e[1]-34+Math.sin(an)*r*.5-ea(q)*40,5+4*rnd(i+5),i%2?C.a:C.w,(1-q)*.9);if(i%3===0)cring(e[0]+Math.cos(an)*r*.8,e[1]-40+Math.sin(an)*r*.4,5+q*8,C.a,(1-q)*.8,1.4)}}}}});
reg('vdm','🐍',function(F,C){var f=F.f,Rr=Rarea(F),T=dur(F,6);   /* Bích Lân Độc Xà: độc xà quấn lấy mục tiêu */
 return{T:T,draw:function(p,t){var e=pt(f,170,0,0),a=fade(p,.9),k=ea(seg(t,0,22)),N=30,i,P=[],q=(t%72)/72,st=q<.22?Math.sin(q/.22*PI):0;
  disc(e[0],e[1],Rr*k,'#0a3a14',.42*a);ring(e[0],e[1],Rr*1.05*k,C.a,a*.9,3,[10,7],-t*.5);
  for(i=0;i<=N;i++){var u=i/N,th=t*.045+u*PI*3.4,rad=Rr*.95*(.38+.62*u)*(i<3?1-.7*st:1)*k,lift=Math.pow(1-u,1.7)*118*(1+.12*Math.sin(t*.08))*(1-.55*st)*k;P.push([e[0]+Math.cos(th)*rad,e[1]+Math.sin(th)*rad*.5-lift-4,th])}
  for(i=N;i>=1;i--){var u2=i/N,z=6.5+10*Math.pow(1-u2,.55);g.save();g.globalAlpha=.92*a;g.fillStyle=C.d;g.beginPath();g.ellipse(P[i][0],P[i][1],z*1.05,z,0,0,TAU);g.fill();g.fillStyle=i%2?C.b:C.a;g.beginPath();g.ellipse(P[i][0],P[i][1]-z*.12,z*.78,z*.7,0,0,TAU);g.fill();g.restore();if(i%3===0)glow(P[i][0],P[i][1],z*1.5,C.a,.2*a)}
  var h=P[0];g.save();g.translate(h[0],h[1]);g.scale(1.45,1.45);g.rotate(Math.atan2(e[1]-30-h[1],e[0]-h[0])+(st>0?0:Math.sin(t*.06)*.3));g.globalAlpha=a;g.fillStyle=C.d;g.beginPath();g.ellipse(0,0,19,13,0,0,TAU);g.fill();g.fillStyle=C.b;g.beginPath();g.ellipse(2,-1,15,10,0,0,TAU);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(14,3);g.lineTo(26,10+st*8);g.lineTo(18,-1);g.moveTo(14,-3);g.lineTo(26,-10-st*8);g.lineTo(18,1);g.fill();g.globalCompositeOperation='lighter';g.fillStyle='#ffe84a';g.beginPath();g.arc(8,-5,3.2,0,TAU);g.arc(8,5,3.2,0,TAU);g.fill();
  g.strokeStyle='#ff3a5a';g.lineWidth=2;g.beginPath();g.moveTo(19,0);g.lineTo(32+Math.sin(t*.6)*5,0);g.lineTo(36,-3);g.moveTo(32,0);g.lineTo(36,3);g.stroke();g.restore();glow(h[0],h[1],32,C.a,.4*a);
  for(i=0;i<5;i++){var u3=((t*.02+rnd(i))%1);glow(h[0]+(rnd(i+3)-.5)*30,h[1]+14+u3*70,3,C.a,(1-u3)*a)}}}});
reg('vdm','☠️',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,6),ev=F.sp.every||20;   /* Vạn Độc Phệ Thiên: độc vực */
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,26)),i,j;
  disc(m[0],m[1],Rr*k,'#052a10',.58*a);disc(m[0],m[1],Rr*.64*k,'#0a5a20',.22*a);ring(m[0],m[1],Rr*k,C.a,a,4,[16,10],-t*.6);ring(m[0],m[1],Rr*.7*k,C.b,a*.85,2.5);starN(m[0],m[1],Rr*.66*k,6,C.a,a*.6,t*.005,2);starN(m[0],m[1],Rr*.44*k,5,C.b,a*.7,-t*.008,2);
  for(i=0;i<8;i++){var an=i*PI/4+t*.004,sx=m[0]+Math.cos(an)*Rr*.88*k,sy=m[1]+Math.sin(an)*Rr*.44*k;glow(sx,sy-16,30,C.a,.35*a);skull(sx,sy-16+Math.sin(t*.07+i)*3,17,C.a,.85*a,Math.sin(t*.3+i)*2)}
  for(i=0;i<9;i++){var an2=i*TAU/9+.4,cx=m[0]+Math.cos(an2)*Rr*.5*k,cy=m[1]+Math.sin(an2)*Rr*.25*k;for(j=0;j<5;j++)smoke(cx+Math.sin(t*.03+i+j)*14,cy-j*32,30+j*6,j%2?C.b:'#0a5a20',.3*a*(1-j*.15))}
  glow(m[0],m[1]-70,Rr*.55,C.a,.2*a);skull(m[0],m[1]-70,54,C.a,.4*a*(.8+.2*Math.sin(t*.1)),Math.sin(t*.14)*5+4);
  for(i=0;i<Q(30);i++){var u=((t*.026*(.7+rnd(i))+rnd(i+1))%1),x=m[0]+(rnd(i+2)-.5)*Rr*2.2,y=m[1]+(rnd(i+3)-.5)*Rr*.6-(1-u)*320;line(x,y,x-4,y-34,C.a,1.8,.7*a*Math.min(1,u*5),1);if(u>.94)ring(x,y,14,C.a,.8*a,1.6)}
  for(i=0;i<Q(12);i++){var u2=((t*.012+rnd(i+20))%1),bx=m[0]+(rnd(i+21)-.5)*Rr*1.6*k,by=m[1]+(rnd(i+22)-.5)*Rr*.7*k-u2*110;cring(bx,by,4+rnd(i)*7,C.a,.8*a*(1-u2),1.6)}
  var jj=Math.floor(t/ev),q=(t-jj*ev)/16;if(q<1)ring(m[0],m[1],Rr*.95*ea(q),C.w,(1-q)*.55*a,2.5)}}});
/* ============================== NGỰ CỔ THÁNH ĐIỆN ============================== */
reg('ngc','🐛',function(F,C){var f=F.f,n=Math.min(5,F.sp.h||4);   /* Linh Cổ Xuất Khiếu: đàn linh trùng */
 return{T:48,draw:function(p,t){var k,i;
  for(k=0;k<n;k++){var ls=k*5,q=ea(seg(t,ls,ls+22)),al=1-seg(t,ls+22,ls+40);if(al<=0)continue;var tg=pt(f,360,(k-(n-1)/2)*18,36);
   for(i=0;i<6;i++){var b=pt(f,-10,(rnd(k*9+i)-.5)*34,52+(rnd(k*9+i+3)-.5)*30),w=Math.sin(q*PI*3+i+k)*20*(1-q),x=b[0]+(tg[0]-b[0])*q,y=b[1]+(tg[1]-b[1])*q+w,x2=b[0]+(tg[0]-b[0])*Math.max(0,q-.06),y2=b[1]+(tg[1]-b[1])*Math.max(0,q-.06)+Math.sin(Math.max(0,q-.06)*PI*3+i+k)*20*(1-q);
    line(x2,y2,x,y,C.a,2,.5*al,1);bug(x,y,5.5,Math.atan2(y-y2,x-x2),C.a,C.d,t*1.1+i+k,al)}
   if(q>=1){var r=seg(t,ls+22,ls+36);ring(tg[0],tg[1]+34,40*ea(r),C.b,(1-r)*.9,2.5);star4(tg[0],tg[1],20*(1-r),C.w,1-r,r*3)}}}}});
reg('ngc','🛡️',function(F,C){var T=dur(F,6);   /* Kim Giáp Cổ: mai giáp tổ ong */
 return{T:T,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,16)),i,j,pass,RX=64*k,RY=78*k;
  function bt(sn0){for(i=0;i<3;i++){var ph=t*.04+i*TAU/3,sn=Math.sin(ph);if((sn>=0)!==sn0)continue;beetle(Math.cos(ph)*(RX+6),-40+sn*20,(30+10*sn)*k,ph+PI/2,a)}}
  if(t<14)ring(0,0,60+80*t/14,C.a,1-t/14,3);ring(0,0,64*k,C.a,a*.6,2.5);bt(false);
  g.save();g.beginPath();g.ellipse(0,-40,RX,RY,0,0,TAU);var q=g.createRadialGradient(0,-40,RY*.2,0,-40,RY);q.addColorStop(0,'rgba(255,220,120,.04)');q.addColorStop(1,'rgba(255,220,120,.28)');g.fillStyle=q;g.fill();g.clip();
  g.globalCompositeOperation='lighter';g.strokeStyle=C.a;g.lineWidth=1.6;g.globalAlpha=.55*a;var hs=17;g.beginPath();
  for(j=-6;j<=6;j++)for(i=-5;i<=5;i++){var cx=i*hs*1.74+(j&1?hs*.87:0),cy=-40+j*hs*1.5;for(var v=0;v<6;v++){var an=PI/6+v*PI/3,px=cx+Math.cos(an)*hs,py=cy+Math.sin(an)*hs;if(v)g.lineTo(px,py);else g.moveTo(px,py)}g.closePath()}
  g.stroke();g.restore();
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.9*a;g.strokeStyle=C.w;g.lineWidth=2.4;g.beginPath();g.ellipse(0,-40,RX,RY,0,0,TAU);g.stroke();g.restore();glow(0,-40,RY*1.1,C.a,.18*a);
  bt(true)}}});
reg('ngc','🪲',function(F,C){var f=F.f,Rr=Rarea(F),T=dur(F,5);   /* Phệ Linh Cổ Quần: bầy cổ bám mục tiêu */
 return{T:T,draw:function(p,t){var e=pt(f,170,0,0),a=fade(p,.88),k=ea(seg(t,0,18)),i;
  disc(e[0],e[1],Rr*k,C.d,.46*a);ring(e[0],e[1],Rr*k,C.b,a,3,[10,7],-t*.5);ring(e[0],e[1],Rr*.62*k,C.a,a*.8,2);starN(e[0],e[1],Rr*.6*k,6,C.a,a*.6,t*.012,1.8);
  smoke(e[0],e[1]-24,Rr*.9,C.b,.22*a);
  for(i=0;i<Q(26);i++){var ph=t*(.02+.016*rnd(i))*(i%2?1:-1)+rnd(i+2)*TAU,rr=Rr*(.2+.74*rnd(i+3))*k,x=e[0]+Math.cos(ph)*rr,y=e[1]+Math.sin(ph)*rr*.5-6-Math.abs(Math.sin(t*.1+i))*12;bug(x,y,4.6+rnd(i+5)*1.6,ph+(i%2?PI/2:-PI/2),C.a,C.d,t*1.1+i,.95*a)}
  for(i=0;i<3;i++){var u=((t*.02+i/3)%1);star4(e[0]+(rnd(i+9)-.5)*40,e[1]-20-u*40,7,'#ff5a7a',Math.sin(u*PI)*a,t*.1+i)}}}});
reg('ngc','🦂',function(F,C){var T=dur(F,8);   /* Thiên Túc Cổ Vương: rết khổng lồ vòng quanh */
 return{T:T,draw:function(p,t){var a=fade(p,.92),k=ea(seg(t,0,24)),N=26,Ro=146*k,i,L=[];
  ring(0,0,Ro,C.b,a*.8,3,[12,8],-t*.5);ring(0,0,Ro*.55,C.a,a*.5,2);glow(0,-10,Ro*1.2,C.b,.12*a);
  for(i=0;i<=N;i++){var th=t*.05-i*.17,sn=Math.sin(th);L.push({i:i,x:Math.cos(th)*Ro,y:-8+sn*Ro*.5-(14+6*Math.sin(t*.1+i)),th:th})}
  sortY(L);
  for(var j=0;j<L.length;j++){var s0=L[j],i2=s0.i,z=(i2?17*(1-i2/N*.45):26),tx=-Math.sin(s0.th),ty=Math.cos(s0.th)*.5,tl=Math.sqrt(tx*tx+ty*ty)||1,nx=-ty/tl,ny=tx/tl;
   g.save();g.globalAlpha=a;g.strokeStyle=C.d;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(s0.x+nx*z*.6,s0.y+ny*z*.6);g.lineTo(s0.x+nx*z*2.3+tx/tl*8,s0.y+ny*z*2.3+ty/tl*8);g.moveTo(s0.x-nx*z*.6,s0.y-ny*z*.6);g.lineTo(s0.x-nx*z*2.3+tx/tl*8,s0.y-ny*z*2.3+ty/tl*8);g.stroke();
   g.fillStyle=C.d;g.beginPath();g.ellipse(s0.x,s0.y,z*1.1,z*.9,0,0,TAU);g.fill();g.fillStyle=i2%2?C.b:C.a;g.beginPath();g.ellipse(s0.x,s0.y-z*.1,z*.82,z*.66,0,0,TAU);g.fill();g.fillStyle='rgba(255,246,216,.7)';g.beginPath();g.ellipse(s0.x-z*.2,s0.y-z*.35,z*.3,z*.16,0,0,TAU);g.fill();g.restore();
   if(i2===0){g.save();g.translate(s0.x,s0.y);g.rotate(Math.atan2(ty,tx));g.globalAlpha=a;g.strokeStyle=C.w;g.lineWidth=3;g.beginPath();g.moveTo(14,-4);g.quadraticCurveTo(30,-12,34,2);g.moveTo(14,4);g.quadraticCurveTo(30,12,34,-2);g.stroke();g.globalCompositeOperation='lighter';g.fillStyle='#ff5a7a';g.beginPath();g.arc(8,-6,3.4,0,TAU);g.arc(8,6,3.4,0,TAU);g.fill();g.restore();glow(s0.x,s0.y,36,C.b,.5*a)}}
  var q=(t%34)/34,hd=L.filter(function(o){return o.i===0})[0];if(hd){ring(hd.x,hd.y+14,60*q,C.a,(1-q)*.7*a,2.5)}}}});
reg('ngc','🦗',function(F,C){var f=F.f,Rr=Rult(F),m=pt(f,Math.min(160,Rr*.5),0,0),T=dur(F,6),ev=F.sp.every||20,an=ang(f);   /* Vạn Cổ Triều Tông: triều cổ trùng */
 return{T:T,ult:1,draw:function(p,t){var a=fade(p,.9),k=ea(seg(t,0,26)),i;
  disc(m[0],m[1],Rr*k,C.d,.54*a);disc(m[0],m[1],Rr*.62*k,'#4a1a58',.24*a);ring(m[0],m[1],Rr*k,C.b,a,4,[16,10],-t*.6);ring(m[0],m[1],Rr*.72*k,C.a,a*.85,2.5);ring(m[0],m[1],Rr*.4*k,C.b,a*.7,2);
  starN(m[0],m[1],Rr*.68*k,8,C.a,a*.6,t*.005,1.8);starN(m[0],m[1],Rr*.46*k,6,C.b,a*.7,-t*.008,1.8);
  for(i=0;i<8;i++){var ag=i*PI/4+t*.006;g.save();g.translate(m[0]+Math.cos(ag)*Rr*.86*k,m[1]+Math.sin(ag)*Rr*.43*k);g.scale(1,.5);g.rotate(ag+PI/2);crescent(0,0,22,8,-1.2,1.2,C.a,.8*a,1);g.restore()}
  for(i=0;i<Q(60);i++){var cy=((t*.011*(.7+.6*rnd(i))+rnd(i+1))%1),hop=Math.abs(Math.sin(t*.12+i))*10,b=pt(f,(cy*2-1)*Rr*1.15,(rnd(i+2)-.5)*Rr*1.5,hop);bug(m[0]+b[0],m[1]+b[1]-4,4+rnd(i+3)*3,an+Math.sin(t*.1+i)*.5,C.a,C.d,t*1.2+i,Math.sin(cy*PI)*a*.95)}
  for(i=0;i<Q(10);i++){var u=((t*.01+rnd(i+30))%1);glow(m[0]+(rnd(i+31)-.5)*Rr*1.4,m[1]+(rnd(i+32)-.5)*Rr*.6-u*130,6,i%2?C.b:C.a,(1-u)*.8*a)}
  var jj=Math.floor(t/ev),q=(t-jj*ev)/16;if(q<1){ring(m[0],m[1],Rr*.95*ea(q),C.w,(1-q)*.55*a,2.5);glow(m[0],m[1]-20,Rr*.45*ea(q),C.b,(1-q)*.3*a)}}}});
/* ========================================================================================== */
/*  GÀI VÀO BẢNG CÔNG THỨC DÙNG CHUNG (world/79 thành Tiên Giới + world/83 map đánh quái)          */
/* ========================================================================================== */
var TYPES=['proj','multi','dash','mark','exec','aoe','burst','freeze','sweep','charge','shield','dotT','dotS','dotU',
 'umt1','umt2','umt5','hbd1','hbd2','hbd3','hbd4','hbd5','ptc1','ptc2','ptc3','ptc4','ptc5','tkt1','tkt2','tkt3','tkt4','tkt5','vdm1','vdm2','vdm3','vdm4','vdm5','ngc1','ngc3','ngc4','ngc5'];
function sectOf(F){var c=String((F&&F.col)||'').toLowerCase();for(var k in SCOL)if(SCOL[k]===c)return k;return ''}
TYPES.forEach(function(ty){var old=R[ty];if(typeof old!=='function')old=function(F){return R.aoe(F)};
 R[ty]=function(F){
  if(CF.enable&&F&&F.sp&&F.sp.t){var id=sectOf(F),mk=id&&SK[id][nk(F.sp.i||F.ic)];
   if(mk){var rec=null;try{rec=mk(F,PAL[id])}catch(e){rec=null}
    if(rec){var slow=(window.TG8SK_CF&&TG8SK_CF.slow)||1,T=rec.T;if(rec.ult)ghostStart(id,T);
     /* world/79 nhân life với TG8SK_CF.slow, world/83 dùng nguyên life → chia lại để số khung thật = T */
     return{life:SRC==='treo'?T:Math.max(8,Math.round(T/slow)),draw:function(p){CUR=id;try{if(rec.ult)atmos(id,sm(p/.08)*(1-sm((p-.92)/.08)));rec.draw(p,p*T)}finally{CUR=''}}}}}}
  return old.apply(this,arguments)}});
window.MPTT={SK:SK,PAL:PAL,CF:CF,ghost:function(id,frames){ghostStart(id,frames||300)},state:function(){return GH}};
})();
