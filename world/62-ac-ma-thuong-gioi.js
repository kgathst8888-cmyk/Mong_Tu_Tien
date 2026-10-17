/* ===== 😈 ÁC MA THƯỢNG GIỚI (world/62-ac-ma-thuong-gioi.js) =====
 * Cổng mới (cổng thứ 7, giữa Hợp Đạo Đài và Kiếm Thánh Đài) ở Thành Thị Linh Giới — Fix168: ô "Hư Không Truyền Tống" đã thuộc Tiên Giới nên không chiếm ô cũ nữa.
 * - ĐIỀU KIỆN VÀO: nhân vật phải đã Hợp Đạo (Đạo Thể: HDAO.on()).
 * - Bản đồ: ảnh do người chơi cung cấp (assets/ac-ma-assets.js → ACMA_ASSETS.bg). Cổng ma giữa bản đồ là xoáy động vẽ bằng canvas.
 * - CHỈ 1 BOSS, KHÔNG CÓ QUÁI: Ác Ma Vương bước ra từ cổng giữa bản đồ (cảnh vào ~2,7 giây, bất tử trong lúc bước ra).
 * - Sức mạnh: HP và sát thương GẤP CF.mul (=20) LẦN BOSS KIẾM THÁNH (đọc cấu hình KTHANH.cfg nên luôn bám theo Kiếm Thánh); DEF bằng Kiếm Thánh.
 * - Boss vẽ bằng bộ khung có khớp (thân, đầu, 2 tay, 2 chân, áo choàng, giáo lửa) nên di chuyển / chém / ra chiêu uyển chuyển:
 *     đi bộ · Liệt Diệm Trảm (chém ngang) · Xuyên Tâm Thích (lao tới đâm) · Thiên Ma Trấn Địa (nhảy vọt giáng xuống) ·
 *     Huyết Nguyệt Phún Trào (5 cột lửa dưới chân) · Cửu U Diệt Thế (dưới 50% máu, nổ vòng rộng, an toàn sát chân boss).
 *   Mọi đòn đều có vòng báo trước dưới đất.
 * - Dựa trên khung phụ bản của Kiếm Thánh/Ma Thần (dgSp, dgAI, dgTick, dgHurt, dgFoe, dgHud, bgd, drop). Không sửa engine hay module khác.
 * - Thưởng (hệ số CF.rw=10): vàng, mảnh chế tạo, 5 món trang bị phẩm Thiên Thần, tu vi, Mảnh Sách Thần Thông. Chỉnh trong khối CF. */
(function(){
'use strict';
if(typeof dgSp!=='function'||typeof mtStats!=='function'||typeof LCT==='undefined'||!LCT.gates||typeof HDAO==='undefined')return;
/* ---------- thư viện vẽ chung (gốc toạ độ = giữa chân, y âm = đi lên) ---------- */
var PI=Math.PI,TAU=PI*2,sin=Math.sin,cos=Math.cos,abs=Math.abs;
function hx(h){h=h.replace('#','');if(h.length==3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function mix(a,b,t){var A=hx(a),B=hx(b);return'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')'}
function rgba(h,a){var A=hx(h);return'rgba('+A[0]+','+A[1]+','+A[2]+','+a+')'}
function smooth(c,P,open){var n=P.length;c.beginPath();if(open){c.moveTo(P[0][0],P[0][1]);for(var i=1;i<n-1;i++)c.quadraticCurveTo(P[i][0],P[i][1],(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2);c.lineTo(P[n-1][0],P[n-1][1])}else{c.moveTo((P[0][0]+P[n-1][0])/2,(P[0][1]+P[n-1][1])/2);for(var i=0;i<n;i++){var a=P[i],b=P[(i+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath()}}
/* khối hữu cơ: tô gradient dọc, viền tối, ánh rìa sáng */
function shape(c,P,c1,c2,y0,y1,line,lw,rim){smooth(c,P);var gr=c.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c1);gr.addColorStop(1,c2);c.fillStyle=gr;c.fill();c.lineWidth=lw||2.2;c.strokeStyle=line||'#080408';c.lineJoin='round';c.stroke();if(rim){c.save();c.clip();c.lineWidth=(lw||2.2)*2.2;c.strokeStyle=rim;c.translate(-1.3,-1.6);smooth(c,P);c.stroke();c.restore()}}
function poly(c,P,fill,line,lw){c.beginPath();c.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(line){c.lineWidth=lw||1.6;c.strokeStyle=line;c.lineJoin='round';c.stroke()}}
/* chi thon dần: P=[[x,y]..], W=bề rộng mỗi điểm */
function limb(c,P,W,col,line,hi){c.lineCap='round';c.lineJoin='round';for(var pass=0;pass<3;pass++)for(var i=0;i<P.length-1;i++){var w=(W[i]+W[i+1])/2,o=pass==2?-w*.2:0;c.lineWidth=pass==0?w+3.4:pass==1?w:Math.max(1,w*.28);c.strokeStyle=pass==0?line:pass==1?col:hi;c.beginPath();c.moveTo(P[i][0]+o,P[i][1]+o*.8);c.lineTo(P[i+1][0]+o,P[i+1][1]+o*.8);c.stroke()}}
function glow(c,x,y,r,col,a){var gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(col,a));gr.addColorStop(1,rgba(col,0));c.save();c.globalCompositeOperation='lighter';c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function eye(c,x,y,r,T,sq){glow(c,x,y,r*3.2,T.ey,.55);c.save();c.translate(x,y);c.rotate(sq||0);c.fillStyle=T.ey;c.beginPath();c.ellipse(0,0,r*1.25,r*.8,0,0,TAU);c.fill();c.fillStyle=T.e2;c.beginPath();c.ellipse(-r*.2,-r*.1,r*.7,r*.4,0,0,TAU);c.fill();c.fillStyle='#1a0408';c.beginPath();c.ellipse(r*.15,0,r*.2,r*.7,0,0,TAU);c.fill();c.restore()}
function flame(c,x,y,h,w,t,col1,col2,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.globalCompositeOperation='lighter';for(var k=0;k<3;k++){var hh=h*(1-k*.22),ww=w*(1-k*.25),sw=sin(t*.2+k*1.7)*ww*.5;c.fillStyle=rgba(k<2?col2:col1,.55-k*.1);c.beginPath();c.moveTo(-ww,0);c.quadraticCurveTo(-ww*.8+sw,-hh*.5,sw*1.4,-hh);c.quadraticCurveTo(ww*.8+sw,-hh*.5,ww,0);c.closePath();c.fill()}c.restore()}
function rune(c,x,y,r,col,a){c.save();c.translate(x,y);c.strokeStyle=rgba(col,a);c.lineWidth=Math.max(1,r*.18);c.lineCap='round';c.beginPath();c.moveTo(-r,-r*.6);c.lineTo(r,-r*.6);c.moveTo(0,-r*.6);c.lineTo(0,r);c.moveTo(-r*.7,r*.2);c.lineTo(r*.7,r*.2);c.moveTo(-r*.5,r);c.lineTo(r*.5,r*.55);c.stroke();c.restore()}
function blade(c,x,y,ang,len,wd,T,curve){c.save();c.translate(x,y);c.rotate(ang);var gr=c.createLinearGradient(0,-wd,0,wd);gr.addColorStop(0,'#f4f8ff');gr.addColorStop(.5,'#9aa8bc');gr.addColorStop(1,'#3a4658');c.beginPath();c.moveTo(0,-wd*.5);c.quadraticCurveTo(len*.55,-wd*(1.1+curve),len,-wd*.2*(1-curve));c.quadraticCurveTo(len*.6,wd*(.3-curve*.3),0,wd*.5);c.closePath();c.fillStyle=gr;c.fill();c.lineWidth=1.8;c.strokeStyle='#0a0a12';c.stroke();c.globalCompositeOperation='lighter';c.strokeStyle=rgba(T.gl,.75);c.lineWidth=1.3;c.beginPath();c.moveTo(len*.1,-wd*.35);c.quadraticCurveTo(len*.55,-wd*(.95+curve),len*.96,-wd*.2*(1-curve));c.stroke();c.restore()}
function fangs(c,x,y,n,sz,dir,col){c.fillStyle=col||'#f4efe0';for(var i=0;i<n;i++){var xx=x+i*sz*1.15*dir;c.beginPath();c.moveTo(xx,y);c.lineTo(xx+sz*.5*dir,y+sz*1.5);c.lineTo(xx+sz*dir,y);c.closePath();c.fill()}}

/* ======================= ÁC MA VƯƠNG: bộ khung có khớp ======================= */
function ez(t){t=t<0?0:t>1?1:t;return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}
var POSE0={lean:0,bob:0,tor:0,head:0,aS:.12,aE:.22,bS:-.1,bE:.18,fh:0,fk:.05,bh:0,bk:.05,sa:.85,glow:.4,cape:1,dy:0,cr:0,spy:0};
function K(t,keys){var p=Object.assign({},POSE0);if(t<=keys[0][0])return Object.assign(p,keys[0][1]);for(var i=0;i<keys.length-1;i++){var a=keys[i],b=keys[i+1];if(t<=b[0]){var u=ez((t-a[0])/(b[0]-a[0])),A=Object.assign({},POSE0,a[1]),B=Object.assign({},POSE0,b[1]);for(var k in A)p[k]=lerp(A[k],B[k],u);return p}}return Object.assign(p,keys[keys.length-1][1])}
/* tư thế theo trạng thái: st=tên, t=khung đã trôi qua, w=pha đi bộ */
function POSE(st,t,w,tt){
 var br=Math.sin(tt*.06)*1.4,p;
 if(st=='walk'){var s=Math.sin(w),c=Math.cos(w);p=Object.assign({},POSE0,{bob:-Math.abs(s)*4,lean:3,tor:.04+s*.03,fh:s*.62,fk:Math.max(0,c)*.5+.1,bh:-s*.62,bk:Math.max(0,-c)*.5+.1,aS:-s*.28+.16,aE:.3,bS:s*.4-.1,bE:.3,sa:.9,glow:.5})}
 else if(st=='slash'){ /* Liệt Diệm Trảm: gồng 0-30, chém 30-42, thu 42-70 */
  p=K(t,[[0,{}],[30,{lean:-8,tor:-.22,head:-.1,aS:-2.5,aE:-.6,bS:.9,bE:.4,fh:-.2,bh:.3,fk:.25,bk:.3,sa:-2.3,glow:1,spy:0}],[34,{lean:-10,tor:-.26,aS:-2.7,aE:-.7,bS:1,bE:.4,fh:-.2,bh:.3,fk:.25,bk:.3,sa:-2.4,glow:1}],[38,{lean:2,tor:.08,aS:-.9,aE:.1,bS:.2,bE:.5,fh:.2,bh:-.1,fk:.3,bk:.25,sa:-.3,glow:1}],[42,{lean:14,tor:.3,head:.12,aS:.85,aE:.1,bS:-.7,bE:.6,fh:.5,bh:-.35,fk:.45,bk:.2,sa:1.15,glow:1}],[70,{}]])}
 else if(st=='thrust'){ /* Xuyên Tâm Thích: gồng 0-24, đâm 24-32, thu */
  p=K(t,[[0,{}],[24,{lean:-14,tor:-.18,aS:-1.0,aE:1.55,bS:.5,bE:.5,fh:-.3,bh:.5,fk:.5,bk:.45,sa:.12,glow:1,dy:6}],[32,{lean:34,tor:.32,aS:-1.5,aE:.1,bS:-.4,bE:.8,fh:.75,bh:-.5,fk:.35,bk:.25,sa:.04,glow:1,dy:3}],[62,{}]])}
 else if(st=='leap'){ /* Thiên Ma Trấn Địa: ngồi 0-18, bay 18-48, rơi 48-58, hạ 58-80 */
  p=K(t,[[0,{}],[18,{dy:16,tor:.1,aS:-1.3,aE:.6,bS:-1.2,bE:.6,fh:.5,bh:-.5,fk:1.1,bk:1.1,sa:-.3,glow:.9}],[30,{dy:-4,tor:-.1,aS:-2.8,aE:-.4,bS:-2.6,bE:-.5,fh:-.3,bh:.4,fk:.8,bk:.9,sa:-2.3,glow:1}],[48,{dy:0,tor:-.14,aS:-3.0,aE:-.3,bS:-2.8,bE:-.3,fh:-.2,bh:.3,fk:.6,bk:.7,sa:-2.4,glow:1}],[56,{dy:-2,tor:.34,aS:.5,aE:.1,bS:.2,bE:.2,fh:.7,bh:-.5,fk:.5,bk:.3,sa:1.3,glow:1}],[62,{dy:22,tor:.22,aS:.7,aE:.1,bS:.4,bE:.2,fh:.8,bh:-.6,fk:1.1,bk:.9,sa:1.45,glow:1}],[82,{}]])}
 else if(st=='cast'){ /* Huyết Nguyệt Phún Trào: cắm giáo, tay giơ */
  p=K(t,[[0,{}],[22,{dy:8,tor:-.1,aS:-1.8,aE:-.5,bS:-2.6,bE:-.3,sa:-1.45,glow:1,fh:.15,bh:-.15,fk:.4,bk:.4}],[70,{dy:-4,tor:-.16,aS:-2.2,aE:-.4,bS:-2.8,bE:-.3,sa:-1.55,glow:1,fh:.15,bh:-.15,fk:.3,bk:.3}],[92,{}]])}
 else if(st=='nova'){ p=K(t,[[0,{}],[30,{dy:20,tor:.12,aS:-.6,aE:1.2,bS:-.6,bE:1.2,fh:.4,bh:-.4,fk:1.1,bk:1.1,sa:.9,glow:1}],[50,{dy:-14,tor:-.2,aS:-2.8,aE:-.2,bS:-2.8,bE:-.2,fh:.1,bh:-.1,fk:.2,bk:.2,sa:-1.5,glow:1}],[62,{dy:0,tor:.08,aS:-1.0,aE:.9,bS:-1.0,bE:.9,fk:.6,bk:.6,glow:1}],[96,{}]])}
 else if(st=='hurt'){p=Object.assign({},POSE0,{lean:-6,tor:-.1,head:-.15,aS:-.3,bS:.2})}
 else p=Object.assign({},POSE0,{bob:br,aS:.12+Math.sin(tt*.05)*.03,bS:-.1-Math.sin(tt*.05)*.03,glow:.4+.1*Math.sin(tt*.08)});
 p.t=tt;return p}
/* ---------- vẽ ---------- */
var ARM={d:'#14121c',m:'#3a3846',h:'#7a7890',g:'#e6b04a',g2:'#8c5a1a',r:'#ff3a3a',r2:'#a0101c',line:'#07050a',cape:'#b01828',cape2:'#4a0610'};
function plate(c,P,t1,t2,y0,y1,lw){shape(c,P,t1||ARM.m,t2||ARM.d,y0,y1,ARM.line,lw||2.2,rgba(ARM.h,.55))}
function trim(c,P,lw){c.strokeStyle=ARM.g;c.lineWidth=lw||1.6;c.lineJoin='round';c.beginPath();c.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.stroke()}
function spike(c,x,y,ang,len,w,col){c.save();c.translate(x,y);c.rotate(ang);poly(c,[[-w,0],[0,-len],[w,0]],col||ARM.g,ARM.line,1.3);c.restore()}
function leg(c,x,hip,knee,front,P){c.save();c.translate(x,-128);c.rotate(hip);
 plate(c,[[-15,-6],[15,-8],[13,32],[16,58],[-12,58],[-16,30]],front?ARM.m:ARM.d,ARM.d,-8,58);trim(c,[[-12,10],[12,8]]);trim(c,[[-12,40],[13,40]]);
 c.translate(0,60);c.rotate(knee);
 plate(c,[[-17,-8],[17,-8],[19,6],[0,16],[-19,6]],ARM.m,ARM.d,-8,16);spike(c,10,2,.9,16,5);
 plate(c,[[-13,6],[13,6],[11,40],[13,62],[-11,62],[-14,38]],front?ARM.m:ARM.d,ARM.d,6,62);trim(c,[[-9,18],[10,18]]);c.strokeStyle=rgba(ARM.r,.7);c.lineWidth=1.4;c.beginPath();c.moveTo(0,12);c.lineTo(0,52);c.stroke();
 c.translate(0,62);c.rotate(-knee*.6-hip*.4);
 plate(c,[[-12,-2],[12,-2],[34,6],[40,14],[-12,16]],ARM.m,ARM.d,-2,16);spike(c,34,8,1.35,12,4);
 c.restore()}
function arm(c,sx,sy,aS,aE,back,withSpear,sp,P){c.save();c.translate(sx,sy);c.rotate(aS);
 plate(c,[[-11,-4],[11,-4],[10,34],[12,50],[-9,50],[-12,32]],back?ARM.d:ARM.m,ARM.d,-4,50);trim(c,[[-9,22],[10,22]]);
 c.translate(0,50);c.rotate(aE);
 plate(c,[[-13,-6],[13,-6],[12,30],[15,52],[-9,52],[-13,30]],back?ARM.d:ARM.m,ARM.d,-6,52);trim(c,[[-11,10],[12,10]]);spike(c,-12,30,-.7,13,4.5);spike(c,13,34,.8,12,4);
 c.translate(0,52);
 if(withSpear){c.save();c.rotate(P.sa-P.tor-aS-aE+P.spy);spear(c,P);c.restore()}
 plate(c,[[-11,-3],[11,-3],[12,13],[0,19],[-12,13]],ARM.m,ARM.d,-3,19);
 c.restore()}
function spear(c,P){ /* giáo lửa dài: tay cầm ở khoảng 1/3 cán */
 var L=230,hot=P.glow;
 c.save();  /* trục +x = hướng mũi */
 c.strokeStyle=ARM.line;c.lineWidth=11;c.lineCap='round';c.beginPath();c.moveTo(-70,0);c.lineTo(L-70,0);c.stroke();
 var gr=c.createLinearGradient(0,-5,0,5);gr.addColorStop(0,'#5a5666');gr.addColorStop(1,'#1c1a24');c.strokeStyle=gr;c.lineWidth=7;c.beginPath();c.moveTo(-70,0);c.lineTo(L-70,0);c.stroke();
 for(var i=0;i<5;i++){c.fillStyle=ARM.g;c.fillRect(-60+i*34,-5.5,5,11)}
 /* đuôi giáo */
 poly(c,[[-78,-4],[-62,0],[-78,4],[-86,0]],ARM.g,ARM.line,1.2);
 /* lưỡi giáo răng cưa */
 var bx=L-72;poly(c,[[bx,-9],[bx+26,-30],[bx+30,-14],[bx+56,-36],[bx+60,-12],[bx+88,-26],[bx+84,-4],[bx+124,0],[bx+84,4],[bx+88,26],[bx+60,12],[bx+56,36],[bx+30,14],[bx+26,30],[bx,9]],'#ffb050','#3a0c04',2);
 var bg=c.createLinearGradient(bx,0,bx+124,0);bg.addColorStop(0,'#fff0b0');bg.addColorStop(.6,'#ff9030');bg.addColorStop(1,'#c02010');c.fillStyle=bg;c.beginPath();c.moveTo(bx+4,-5);c.lineTo(bx+54,-8);c.lineTo(bx+118,0);c.lineTo(bx+54,8);c.lineTo(bx+4,5);c.closePath();c.fill();
 c.globalCompositeOperation='lighter';
 for(var i=0;i<6;i++){var fx=bx+12+i*18,fy=(i%2?-1:1)*(18-i*1.5);flame(c,fx,fy,22+hot*20,7,P.t+i*9,'#ff8a20','#ff3a10',-1.57+(i%2?.35:-.35)+Math.sin(P.t*.13+i)*.2)}
 glow(c,bx+70,0,90*(.6+hot*.7),'#ff6a20',.5*hot+.15);
 c.restore()}
function cape(c,P,sx,sy){ /* áo choàng đỏ rách tung theo gió */
 var t=P.t,w=P.cape,a=Math.sin(t*.07)*5*w,b=Math.sin(t*.09+1)*9*w,gr=c.createLinearGradient(sx,sy,sx-60,sy+150);gr.addColorStop(0,ARM.cape);gr.addColorStop(1,ARM.cape2);
 c.beginPath();c.moveTo(sx+6,sy-4);c.quadraticCurveTo(sx-34+a,sy+40,sx-52+b,sy+130);
 var hx=sx-52+b,hy=sy+130;for(var i=0;i<7;i++){c.lineTo(hx+i*(-8)+(i%2?-4:8)+Math.sin(t*.1+i)*3,hy+(i%2?22:-2)+i*9)}
 c.quadraticCurveTo(sx-48+b,sy+158,sx-34+a*1.5,sy+176);c.lineTo(sx-6,sy+176);c.quadraticCurveTo(sx+20,sy+90,sx+12,sy+30);c.closePath();c.fillStyle=gr;c.fill();c.lineWidth=2;c.strokeStyle=ARM.line;c.stroke();
 c.strokeStyle=rgba('#ff8a8a',.35);c.lineWidth=1.4;for(var i=0;i<4;i++){c.beginPath();c.moveTo(sx-6-i*9,sy+30+i*4);c.quadraticCurveTo(sx-20-i*10+a,sy+90,sx-34-i*9+b,sy+150);c.stroke()}}
function helm(c,P){
 /* sừng lớn cong */
 [-1,1].forEach(function(sd){c.save();c.scale(sd,1);
  var g1=c.createLinearGradient(0,0,26,-70);g1.addColorStop(0,'#6a4020');g1.addColorStop(.6,'#c88a38');g1.addColorStop(1,'#ffe6a0');
  c.fillStyle=g1;c.strokeStyle=ARM.line;c.lineWidth=2;c.beginPath();c.moveTo(7,-22);c.quadraticCurveTo(30,-30,28,-62);c.quadraticCurveTo(26,-84,14,-92);c.quadraticCurveTo(22,-72,16,-52);c.quadraticCurveTo(10,-34,2,-26);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(14,-8);c.quadraticCurveTo(38,-14,44,-34);c.quadraticCurveTo(34,-26,12,-18);c.closePath();c.fillStyle='#b07a30';c.fill();c.stroke();c.restore()});
 spike(c,0,-44,0,22,5.5,ARM.g);
 /* mũ + mặt nạ bạc */
 shape(c,[[-20,-26],[-14,-42],[0,-46],[14,-42],[20,-26],[18,-4],[10,12],[0,18],[-10,12],[-18,-4]],'#d8dce8','#6a6e80',-46,18,ARM.line,2.4,rgba('#ffffff',.7));
 c.strokeStyle=ARM.g;c.lineWidth=2;c.beginPath();c.moveTo(-17,-24);c.lineTo(0,-30);c.lineTo(17,-24);c.stroke();
 poly(c,[[-12,-12],[-3,-8],[-3,0],[-12,-4]],'#14121c',null);poly(c,[[12,-12],[3,-8],[3,0],[12,-4]],'#14121c',null);
 glow(c,-7,-6,16,'#ff5a4a',.7+P.glow*.3);glow(c,7,-6,16,'#ff5a4a',.7+P.glow*.3);
 c.fillStyle='#fff2e0';c.beginPath();c.ellipse(-7.5,-6,4,1.6,.25,0,6.3);c.ellipse(7.5,-6,4,1.6,-.25,0,6.3);c.fill();
 c.strokeStyle='#2a1a22';c.lineWidth=1.4;for(var i=0;i<4;i++){c.beginPath();c.moveTo(-8+i*5.3,6);c.lineTo(-8+i*5.3,13);c.stroke()}
 poly(c,[[-6,12],[-3,19],[0,12]],'#f2eedc',ARM.line,1)}
function bossDraw(c,P){
 var t=P.t,hy=-128;
 c.save();c.lineJoin='round';c.lineCap='round';
 /* hào quang vòng đỏ sau đầu */
 var hx=P.lean*.5,hhy=-258+P.bob+P.dy;
 c.save();c.globalCompositeOperation='lighter';c.translate(hx,hhy);for(var i=0;i<3;i++){c.strokeStyle=rgba('#ff4a5a',.28-.07*i);c.lineWidth=3-i*.7;c.beginPath();c.arc(0,0,64+i*16+Math.sin(t*.05+i)*3,t*.02*(i%2?-1:1),t*.02*(i%2?-1:1)+4.4);c.stroke()}c.restore();
 glow(c,hx,hhy,110,'#ff2a3a',.2+P.glow*.18);
 c.translate(P.lean,P.bob+P.dy);
 /* chân sau, tay sau */
 leg(c,-14,P.bh,P.bk,false,P);
 arm(c,-30,-216,P.bS,P.bE,true,false,0,P);
 /* áo choàng */
 cape(c,P,-24,-218);
 /* thân: xoay quanh hông */
 c.save();c.translate(0,hy);c.rotate(P.tor);c.translate(0,-hy);
 /* váy giáp rách */
 for(var i=0;i<7;i++){var x=-26+i*8.6;poly(c,[[x-4,-136],[x+5,-136],[x+2+Math.sin(t*.08+i)*2,-96-(i%2)*14]],i%2?ARM.cape:ARM.cape2,ARM.line,1.3)}
 plate(c,[[-26,-140],[26,-140],[22,-120],[0,-112],[-22,-120]],ARM.m,ARM.d,-140,-112);
 /* ngực */
 plate(c,[[-34,-226],[-44,-206],[-30,-150],[-22,-134],[22,-134],[30,-150],[44,-206],[34,-226],[0,-232]],ARM.m,ARM.d,-232,-134,2.6);
 trim(c,[[-30,-222],[0,-196],[30,-222]],2);trim(c,[[-30,-150],[0,-196],[30,-150]],2);trim(c,[[-24,-224],[18,-150]],1.6);trim(c,[[24,-224],[-18,-150]],1.6);
 for(var i=0;i<3;i++)trim(c,[[-24+i*2,-176+i*13],[24-i*2,-176+i*13]],1.4);
 glow(c,0,-196,26,'#ff3a3a',.55+P.glow*.35);c.fillStyle='#ff4a3a';c.beginPath();c.moveTo(0,-206);c.lineTo(8,-196);c.lineTo(0,-184);c.lineTo(-8,-196);c.closePath();c.fill();c.strokeStyle=ARM.g;c.lineWidth=1.6;c.stroke();
 /* thắt lưng + mặt quỷ */
 plate(c,[[-26,-146],[26,-146],[26,-132],[-26,-132]],'#6a4a20','#2a1a08',-146,-132);shape(c,[[-9,-146],[9,-146],[11,-134],[0,-128],[-11,-134]],ARM.g,ARM.g2,-146,-128,ARM.line,1.8);
 /* cổ + yếm */
 plate(c,[[-14,-232],[14,-232],[18,-244],[-18,-244]],ARM.m,ARM.d,-244,-232);
 /* giáp vai: 2 bên, gai vàng */
 [-1,1].forEach(function(sd){var x=sd*38;c.save();c.translate(x,-226);c.scale(sd,1);
  plate(c,[[-8,2],[8,-14],[30,-12],[40,8],[34,30],[8,30]],ARM.m,ARM.d,-14,30,2.4);trim(c,[[2,2],[30,-2],[36,16]],1.8);
  plate(c,[[-4,14],[30,10],[34,34],[6,38]],ARM.d,ARM.m,10,38,2);spike(c,36,-4,.9,22,6);spike(c,26,-14,.3,24,6);spike(c,40,16,1.4,18,5);spike(c,12,-14,-.2,18,5);c.restore()});
 /* đầu */
 c.save();c.translate(0,-258);c.rotate(P.head-P.tor*.5);helm(c,P);c.restore();
 c.restore();
 /* chân trước */
 leg(c,16,P.fh,P.fk,true,P);
 /* tay trước + giáo */
 var tr=P.tor;c.save();c.translate(0,hy);c.rotate(tr);c.translate(0,-hy);arm(c,34,-216,P.aS,P.aE,false,true,P.sp,P);c.restore();
 c.restore()}

function confirmBox(text,yesLabel,noLabel,yes){if(document.getElementById('am-cf'))return;var o=document.createElement('div');o.id='am-cf';o.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center';var bx=document.createElement('div');bx.style.cssText='background:linear-gradient(#3a2618,#150d09);border:2px solid #b8964e;border-radius:14px;padding:16px 18px;max-width:82vw;color:#f2e3b3;text-align:center;font-size:15px;line-height:1.5;box-shadow:0 8px 30px #000';var t=document.createElement('div');t.style.cssText='white-space:pre-line;margin-bottom:14px';t.textContent=text;bx.appendChild(t);
 function mk(n,f){var b=document.createElement('button');b.textContent=n;b.style.cssText='margin:0 6px;padding:9px 20px;font-size:15px;border-radius:9px;border:1px solid #b8964e;background:#5a3a22;color:#fff;cursor:pointer';b.onpointerdown=function(e){e.stopPropagation()};b.onclick=function(e){e.stopPropagation();o.remove();if(f)f()};return b}
 bx.appendChild(mk(yesLabel,yes));bx.appendChild(mk(noLabel,null));o.appendChild(bx);['pointerdown','pointerup','click','touchstart','touchend'].forEach(function(ev){o.addEventListener(ev,function(e){e.stopPropagation()})});document.body.appendChild(o)}
/* ---------- cấu hình ---------- */
function KC(){return(window.KTHANH&&KTHANH.cfg)||{hp:10,atk:10,def:3,rw:3}}
var CF={mul:20,rw:10,size:.86,emerge:160,speed:1.9,cd:3600000,lk:10,pHam:.02,pBua:.02};   /* mul: mạnh gấp bao nhiêu lần Kiếm Thánh (HP và sát thương); rw: hệ số thưởng */
function say(t,c,l){try{DT.push({x:P.x,y:200,s:t,c:c||'#ff9a8a',g:1,l:l||150})}catch(e){}}
function save(){try{sv()}catch(e){}}
function band(a,b){return a+Math.floor(R()*(b-a+1))}
var BG={img:null,ok:false,sc:1,X0:0,Y0:0};
(function(){var u=window.ACMA_ASSETS&&window.ACMA_ASSETS.bg;if(!u)return;var im=new Image();im.onload=function(){BG.ok=true};im.src=u;BG.img=im})();
var IW=1672,IH=662,GROUND_Y=548,GATE_X=860,PORTAL_Y=484;
var PORTAL=[[735,484],[735,262],[760,240],[800,224],[840,216],[880,224],[920,240],[985,262],[985,484]];
function ease(t){return t<0?0:t>1?1:t*t*(3-2*t)}
function gateWX(){return cam+W/s/2}
function boss(){return E.find(function(e){return e.am})}
/* ---------- chỉ số: gấp CF.mul lần Kiếm Thánh (HP, sát thương); DEF giữ bằng Kiếm Thánh ---------- */
function stats(){var b=mtStats(),k=KC();return{hp:b.hp*k.hp*CF.mul,df:b.df/MT_DEF*k.def}}
var _hurt=dgHurt;dgHurt=function(e,mu){return _hurt.call(this,e,e&&e.am?mu*MT_ATK*KC().atk*CF.mul*2:mu)};
/* ---------- vào / ra / thắng ---------- */
function spawn(){dgSp('boss');var e=E[E.length-1],st=stats();e.am=1;e.nm='😈 Ác Ma Vương';e.lv=MT_LV;e.m=7;e.hp=e.max=st.hp;e.df=st.df;e.x=gateWX();e.y=0;e.in=CF.emerge;
 e.ac={st:'emerge',t:0,w:0,dir:-1,cd:70,y:0,nv:0};dg.pz=0;say('😈 ÁC MA VƯƠNG bước ra từ Thượng Giới!','#ff7a6a',200)}
function cdD(){var p=PS[cur];if(!p)return{cd:0};if(!p.amv||typeof p.amv!=='object')p.amv={cd:0};return p.amv}
function cdLeft(){var q=cdD(),n=Date.now(),c=+q.cd||0;if(c>n+CF.cd){c=n+CF.cd;q.cd=c}return Math.max(0,c-n)}
function cdFmt(ms){var t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0')}
function enter(){if(!started||!LCT.on())return;if(cdLeft()>0){say('⏳ Ác Ma Thượng Giới: vào lại sau '+cdFmt(cdLeft()),'#ffd98a',170);return}cdD().cd=Date.now()+CF.cd;save();if(!(window.HDAO&&HDAO.on())){say('☯ Chỉ nhân vật Đạo Thể (đã Hợp Đạo) mới vào được Ác Ma Thượng Giới','#ffd98a',170);return}if(bo)tg();try{LCT.off()}catch(e){}vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:1,kill:1,am:1};say('😈 Tiến vào Ác Ma Thượng Giới!','#ff7a6a',130)}
function ask(){if(!started)return;if(!(window.HDAO&&HDAO.on())){say('☯ Chỉ nhân vật Đạo Thể (đã Hợp Đạo) mới vào được Ác Ma Thượng Giới','#ffd98a',170);return}
 if(cdLeft()>0){say('⏳ Ác Ma Thượng Giới: vào lại sau '+cdFmt(cdLeft()),'#ffd98a',170);return}
 confirmBox('Tiến vào ÁC MA THƯỢNG GIỚI?\\nChỉ có 1 boss — Ác Ma Vương (Lv'+MT_LV+', mạnh gấp '+CF.mul+' lần Kiếm Thánh) bước ra từ cổng giữa bản đồ. Không có quái phụ.\\nMỗi giờ vào được 1 lần (tính từ lúc vào). Bạn có thể rời trận bất cứ lúc nào.','Tiến vào','Thôi',enter)}
function exit(){mtExit();try{LCT.enter()}catch(e){}}
function win(){try{QE('boss');QE('acma')}catch(e){}save();say('🏆 Hạ Ác Ma Vương!','#ffd070',230)}
/* ---------- cổng trong Thành Thị Linh Giới (bản Fix168): THÊM Ô CỔNG MỚI ----------
 * Ở Fix83 boss chiếm ô "Hư Không Truyền Tống" đang khoá; sang Fix168 ô đó đã thành "Tiên Giới Thiên Môn" (world/61), ô 5 là Bế Quan Đài (world/57),
 * cổng cuối là "Về Thôn Tân Thủ" (world/65) → không còn ô trống. Nên thêm 1 cổng riêng (cuối mảng LCT.gates), đặt giữa Hợp Đạo Đài và Kiếm Thánh Đài (Fix219: dời lên trời cạnh mặt trăng),
 * cùng kiểu với world/65: chỉ bọc LGART.gx (toạ độ) và LGART.gate (vẽ) cho riêng cổng này. Chỉnh vị trí/cỡ: GPX, GPY, GLB, GK. */
var G={sn:'Ác Ma',n:'Ác Ma Thượng Giới',e:'😈',c:'#ff4a5a',rgb:'255,74,90',open:1,go:ask};
Object.defineProperty(G,'sub',{configurable:true,enumerable:true,get:function(){try{return window.HDAO&&HDAO.on()?'Boss Lv'+MT_LV+' · ×'+CF.mul+' Kiếm Thánh':'☯ Chỉ Đạo Thể được vào'}catch(e){return'Boss ×'+CF.mul+' Kiếm Thánh'}}});
var GIDX=-1,gk;for(gk=0;gk<LCT.gates.length;gk++)if(LCT.gates[gk]&&LCT.gates[gk].n===G.n){GIDX=gk;break}
if(GIDX<0)GIDX=LCT.gates.push(G)-1;else{LCT.gates[GIDX].go=ask}
if(window.LGART&&typeof LGART.gx==='function'&&typeof LGART.gate==='function'&&typeof LGART.ok==='function'){(function(){
var GPX=880,GPY=-122,GIW=1320,GLB=-270,GK=.72;   /* GPX/GPY: vị trí chân cổng (px ảnh gốc 1320 của world/58); GLB: độ cao nhãn; GK: hệ số thu nhỏ.
   Fix219: cổng bay lên bên trái mặt trăng (trăng ở ảnh (1010,-170); tâm xoáy cổng = GPY-66*GK ≈ -170) */
function geo(){var L=LGART.L;if(!L)return null;var sw=L.sw,by=L.dy+GPY*sw;return{sw:sw,pcy:by-66*GK*sw,prx:30*GK*sw,pry:58*GK*sw,ly:Math.max(L.dy+GLB*sw,60)}}
/* vùng chạm riêng (cổng ở trên trời nên không dùng vùng chạm sát đất mặc định của world/10): nhãn + xoáy cổng */
G.hit=function(px,py,x){var o=geo();if(!o)return false;return Math.abs(px-x)<Math.max(o.prx*2.2,38)&&py>o.ly-30&&py<o.pcy+Math.max(o.pry*1.35,44)};
var _gx=LGART.gx;LGART.gx=function(i){return i===GIDX?GPX/GIW*LGART.ww():_gx.apply(this,arguments)};
function gtRnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function gtGlow(x,y,rx,ry,rgb,a){g.save();g.translate(x,y);g.scale(1,ry/rx);var q=g.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.beginPath();g.arc(0,0,rx,0,6.2832);g.fill();g.restore()}
function gtRR(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function gtBanner(x,y,fs){
 var F='KTH Serif,Georgia,serif',pt=!!PORT,nm=pt?(G.sn||G.n):G.n,sub=pt?String(G.sub||'').split(' · ')[0]:G.sub;g.save();g.textBaseline='middle';
 g.font='700 '+fs+'px '+F;var w1=g.measureText(nm).width;g.font='600 '+(fs*.76)+'px '+F;var w2=g.measureText(sub).width;
 var ic=fs*1.18,bw=Math.max(w1,w2)+ic*2+fs*1.3,bh=fs*2.7,bx=x-bw/2,by=y-bh/2;
 g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=8;g.fillStyle='rgba(30,10,16,.9)';gtRR(bx,by,bw,bh,bh*.32);g.fill();g.shadowBlur=0;
 g.lineWidth=1.2;g.strokeStyle='rgba(255,110,120,.9)';g.stroke();
 g.beginPath();g.arc(bx+ic+fs*.2,y,ic*.78,0,6.2832);g.fillStyle='rgba(20,6,12,.95)';g.fill();g.strokeStyle=G.c;g.lineWidth=1.4;g.stroke();
 g.textAlign='center';g.font=(fs*1.05)+'px sans-serif';g.fillStyle='#fff';g.fillText(G.e,bx+ic+fs*.2,y+fs*.06);
 g.textAlign='left';var tx=bx+ic*2+fs*.55;
 g.font='700 '+fs+'px '+F;g.fillStyle='#fff0ea';g.fillText(nm,tx,y-fs*.52);
 g.font='600 '+(fs*.76)+'px '+F;g.fillStyle='#ffc0b8';g.fillText(sub,tx,y+fs*.66);
 g.restore();return bx+bw/2}
var _gate=LGART.gate;
LGART.gate=function(Gt,i,x,t,tgt){
 if(i!==GIDX)return _gate.apply(this,arguments);
 var L=LGART.L;if(!LGART.ok()||!L)return true;
 if(x<-260||x>L.W+260)return true;
 var sw=L.sw,by=L.dy+GPY*sw,K=GK,rx=50*K*sw,ry=14*K*sw,pu=.5+.5*Math.sin(t*.07),rgb=G.rgb,j,lite=(window.QL|0)>=2;
 var pcy=by-66*K*sw,prx=30*K*sw,pry=58*K*sw;
 /* 1) trận pháp dưới chân + hào quang đỏ */
 g.save();g.globalCompositeOperation='lighter';
 gtGlow(x,by-2*sw,rx*1.8,ry*2,rgb,.4+.14*pu);gtGlow(x,pcy,pry*1.5,pry*1.7,rgb,.24+.1*pu);
 g.lineWidth=Math.max(1.5,2.2*sw);g.strokeStyle='rgba('+rgb+',.95)';g.beginPath();g.ellipse(x,by,rx,ry,0,0,6.2832);g.stroke();
 g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(255,200,180,.55)';g.beginPath();g.ellipse(x,by,rx*.62,ry*.62,0,0,6.2832);g.stroke();
 for(j=0;j<12;j++){var ar=-t*.012+j*.5236,c1=Math.cos(ar),s1=Math.sin(ar);g.strokeStyle='rgba(255,140,120,'+(j%2?.35:.75)+')';g.beginPath();g.moveTo(x+c1*rx*.62,by+s1*ry*.62);g.lineTo(x+c1*rx*(j%2?.78:.92),by+s1*ry*(j%2?.78:.92));g.stroke()}
 g.setLineDash([6*sw,8*sw]);g.lineDashOffset=t*.4;g.strokeStyle='rgba(255,210,190,.7)';g.beginPath();g.ellipse(x,by,rx*.8,ry*.8,0,0,6.2832);g.stroke();g.setLineDash([]);
 g.restore();
 /* 2) xoáy cổng ma: lõi đen đỏ, vòng xoắn quay ngược */
 g.save();g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,6.2832);
 var pg=g.createRadialGradient(x,pcy,2,x,pcy,pry);pg.addColorStop(0,'rgba(10,0,6,.98)');pg.addColorStop(.4,'rgba(120,10,28,.92)');pg.addColorStop(.8,'rgba('+rgb+',.6)');pg.addColorStop(1,'rgba('+rgb+',.2)');
 g.fillStyle=pg;g.fill();g.clip();
 g.lineCap='round';g.strokeStyle='rgba(255,170,140,.55)';g.lineWidth=Math.max(1,1.4*sw);
 for(j=0;j<4;j++){var a0=-t*.05*(j%2?-1:1)+j*1.3,k2=.2+j*.17;g.beginPath();g.ellipse(x,pcy,prx*k2,pry*k2,a0,0,3.8);g.stroke()}
 if(!lite)for(j=0;j<10;j++){var q2=((t*.014)+j*.1)%1,an=j*2.4-q2*5,r2=(1-q2)*pry;g.fillStyle='rgba(255,'+(120+j*10)+',90,'+(.85*Math.sin(q2*3.1416))+')';g.beginPath();g.arc(x+Math.cos(an)*r2*.52,pcy+Math.sin(an)*r2,Math.max(.8,(1+(j%3)*.5)*sw),0,6.2832);g.fill()}
 g.restore();
 /* 3) khung cổng đỏ + 4 ngọc */
 g.save();g.lineWidth=Math.max(2,3.4*sw);g.strokeStyle=G.c;if(!lite){g.shadowColor=G.c;g.shadowBlur=8+6*pu}
 g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,6.2832);g.stroke();g.shadowBlur=0;
 g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(255,225,215,.9)';g.beginPath();g.ellipse(x,pcy,prx*1.12,pry*1.06,0,0,6.2832);g.stroke();
 [[0,-pry*1.06],[0,pry*1.06],[-prx*1.12,0],[prx*1.12,0]].forEach(function(o,n){var jr=Math.max(2.2,3.6*sw);var jg=g.createRadialGradient(x+o[0],pcy+o[1],0,x+o[0],pcy+o[1],jr*2);jg.addColorStop(0,'#fff');jg.addColorStop(.4,n?'#ff8a7a':'#ffd0c0');jg.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=jg;g.beginPath();g.arc(x+o[0],pcy+o[1],jr*2,0,6.2832);g.fill()});
 g.restore();
 /* 4) đốm lửa bay lên quanh cổng */
 if(!lite){g.save();g.globalCompositeOperation='lighter';for(j=0;j<10;j++){var u=((t*.007+gtRnd(j+5))%1);g.fillStyle=j%3?'rgba(255,150,100,'+(.9*Math.sin(u*3.1416))+')':'rgba(255,220,120,'+(.9*Math.sin(u*3.1416))+')';g.beginPath();g.arc(x+(gtRnd(j+11)-.5)*rx*1.5+Math.sin(u*6+j)*4*sw,by-u*150*K*sw,Math.max(.8,1.8*sw*(1-u*.5)),0,6.2832);g.fill()}g.restore()}
 var fs=PORT?Math.max(6.5,Math.min(8.5,9*s)):Math.max(8,Math.min(10,6.5*s)),ly=Math.max(L.dy+GLB*sw,60),cx=gtBanner(x,ly,fs);
 g.save();g.fillStyle='#ff8a7a';g.font='bold '+fs+'px sans-serif';g.textAlign='center';g.fillText('▼',cx,ly+fs*2.2+Math.sin(t*.12+i)*3);g.restore();
 return true};
})()}
/* ---------- hiệu ứng báo đòn & đòn đánh ---------- */
function fxg(wx,life,fn){FX.push({x:wx,l:life,m:life,fn:fn})}
function markCircle(wx,r,life,col,hole){fxg(wx,life,function(f,p,X,gy){g.save();g.translate(X,gy-3*s);g.scale(s,s*.26);var a=.16+.34*p;g.fillStyle='rgba('+col+','+a*.7+')';g.strokeStyle='rgba('+col+','+(.5+.5*p)+')';g.lineWidth=5;g.beginPath();g.arc(0,0,r,0,6.2832);if(hole){g.moveTo(hole,0);g.arc(0,0,hole,0,6.2832,true)}g.fill('evenodd');g.stroke();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,230,200,'+p*.6+')';g.lineWidth=2;g.beginPath();g.arc(0,0,r*p,0,6.2832);g.stroke();g.restore()})}
function markLine(wx,dir,len,life){fxg(wx,life,function(f,p,X,gy){g.save();g.translate(X,gy-3*s);g.scale(s,s*.26);var a=.12+.3*p;g.fillStyle='rgba(255,60,60,'+a+')';g.strokeStyle='rgba(255,90,70,'+(.4+.5*p)+')';g.lineWidth=4;g.beginPath();g.rect(dir>0?0:-len,-46,len,92);g.fill();g.stroke();g.restore()})}
function crescent(e,dir,life,rad,from,to){var K2=s*CF.size;fxg(e.x,life,function(f,p,X,gy){var cx=X+dir*30*K2,cy=gy-((e.y||0)+170)*K2*.0+(-(e.y||0)*s)-170*K2,R2=rad*K2;g.save();g.globalCompositeOperation='lighter';
  var a0=dir>0?from:Math.PI-from,a1=dir>0?to:Math.PI-to,sweep=a0+(a1-a0)*Math.min(1,p*2.2);g.translate(cx,cy);
  for(var k=0;k<3;k++){g.strokeStyle='rgba('+(k?'255,170,70':'255,90,50')+','+(1-p)*(.9-k*.25)+')';g.lineWidth=(34-k*10)*K2;g.lineCap='round';g.beginPath();g.arc(0,0,R2*(1-k*.03),a0,sweep,dir<0);g.stroke()}g.restore()})}
function geyser(wx,life,r){fxg(wx,life,function(f,p,X,gy){var h=(p<.3?p/.3:1-(p-.3)/.7);g.save();g.globalCompositeOperation='lighter';var K2=s*CF.size;
  for(var k=0;k<3;k++){var ww=(r*.8-k*12)*s*.5,hh=(260-k*50)*K2*h;var gr=g.createLinearGradient(0,gy,0,gy-hh);gr.addColorStop(0,'rgba(255,220,120,.95)');gr.addColorStop(.5,'rgba(255,90,40,.7)');gr.addColorStop(1,'rgba(160,10,20,0)');g.fillStyle=gr;g.beginPath();g.moveTo(X-ww,gy);g.quadraticCurveTo(X-ww*.5+Math.sin(fr*.4+k)*8,gy-hh*.6,X+Math.sin(fr*.3)*10,gy-hh);g.quadraticCurveTo(X+ww*.5,gy-hh*.6,X+ww,gy);g.closePath();g.fill()}
  g.restore()})}
function ringFx(wx,r,life,col){fxg(wx,life,function(f,p,X,gy){g.save();g.translate(X,gy-3*s);g.scale(s,s*.26);g.globalCompositeOperation='lighter';g.strokeStyle='rgba('+(col||'255,120,80')+','+(1-p)+')';g.lineWidth=18*(1-p)+3;g.beginPath();g.arc(0,0,r*(.15+.85*p),0,6.2832);g.stroke();g.restore()})}
function shake(n){try{dgFl=n}catch(e){}}
/* ---------- AI: các chiêu thức ---------- */
function end(e,a){a.st='walk';a.t=0;a.cd=45+Math.floor(R()*55)}
function pick(e,a,dist,enr){var r=R(),n;
 if(enr&&a.nv<=0&&r<.22){n='nova';a.nv=620}
 else if(dist<210)n=r<.5?'slash':r<.78?'thrust':'cast';
 else if(dist<470)n=r<.34?'thrust':r<.68?'leap':'cast';
 else n=r<.6?'leap':'cast';
 a.st=n;a.t=0;a.x0=e.x;
 if(n==='slash'){markLine(e.x,a.dir,230,42)}
 else if(n==='thrust'){markLine(e.x,a.dir,330,28)}
 else if(n==='nova'){say('😈 Cửu U Diệt Thế!','#ff6a5a',90)}}
function ai(e){var a=e.ac,t,dx=P.x-e.x,dist=Math.abs(dx),dirTo=dx>=0?1:-1,enr=e.hp<e.max*.5;a.t++;t=a.t;a.nv--;
 if(a.st==='emerge'){e.in=Math.max(1,CF.emerge-t);dg.pz=Math.min(1,t/CF.emerge);if(t>=CF.emerge){e.in=0;a.st='walk';a.t=0;a.cd=50;dg.pz=1}return}
 e.in=0;
 if(a.st==='walk'||a.st==='idle'){a.dir=dirTo;var want=150;if(dist>want){e.x+=dirTo*CF.speed*(enr?1.3:1);a.w+=.15*(enr?1.3:1);a.st='walk'}else a.st='idle';e.x=cl(e.x,50,vw()-50);if(--a.cd<=0)pick(e,a,dist,enr);return}
 var dir=a.dir;
 if(a.st==='slash'){
  if(t===40){crescent(e,dir,16,250,-2.2,1.2);ringFx(e.x+dir*120,170,16,'255,150,80');shake(3);if((P.x-e.x)*dir>-50&&Math.abs(P.x-e.x)<240)dgHurt(e,1.2)}
  if(t>=70)end(e,a)}
 else if(a.st==='thrust'){
  if(t>=24&&t<=32)e.x+=dir*14;
  if(t===30){fxg(e.x,14,function(f,p,X,gy){var K2=s*CF.size;g.save();g.globalCompositeOperation='lighter';var gr=g.createLinearGradient(X,0,X+dir*340*s,0);gr.addColorStop(0,'rgba(255,200,120,.9)');gr.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=gr;g.globalAlpha=1-p;g.beginPath();g.moveTo(X,gy-150*K2);g.lineTo(X+dir*340*s,gy-130*K2);g.lineTo(X+dir*340*s,gy-120*K2);g.lineTo(X,gy-110*K2);g.closePath();g.fill();g.restore()});shake(3);if((P.x-e.x)*dir>-30&&Math.abs(P.x-e.x)<320)dgHurt(e,1.5)}
  e.x=cl(e.x,50,vw()-50);if(t>=62)end(e,a)}
 else if(a.st==='leap'){
  if(t===18){a.tx=cl(P.x,90,vw()-90);markCircle(a.tx,240,40,'255,60,50')}
  if(t>=18&&t<=56){var u=(t-18)/38;e.x=a.x0+(a.tx-a.x0)*ease(u);a.y=Math.sin(u*Math.PI)*250;a.dir=a.tx>=e.x?1:-1}
  if(t===56){a.y=0;e.x=a.tx;ringFx(e.x,260,30);geyser(e.x-60,24,70);geyser(e.x+60,24,70);shake(6);if(Math.abs(P.x-e.x)<240)dgHurt(e,2)}
  if(t>=82)end(e,a)}
 else if(a.st==='cast'){
  if(t===22){a.xs=[-200,-100,0,100,200].map(function(o){return cl(P.x+o,70,vw()-70)});a.xs.forEach(function(x,i){markCircle(x,70,18+i*7,'255,110,40')})}
  if(a.xs)a.xs.forEach(function(x,i){if(t===40+i*7){geyser(x,26,90);shake(2);if(Math.abs(P.x-x)<70)dgHurt(e,.9)}});
  if(t>=96)end(e,a)}
 else if(a.st==='nova'){
  if(t===30)markCircle(e.x,380,22,'255,40,70',70);
  if(t===52){ringFx(e.x,400,40,'255,70,110');geyser(e.x-130,24,80);geyser(e.x+130,24,80);shake(7);var d=Math.abs(P.x-e.x);if(d>70&&d<380)dgHurt(e,2.4)}
  if(t>=100)end(e,a)}
 else end(e,a)}
var _ai=dgAI;dgAI=function(e){if(!e||!e.am)return _ai.apply(this,arguments);if(!e.ac)return;ai(e)};
/* ---------- vòng đời trận ---------- */
var _tick=dgTick;dgTick=function(){if(!dg||!dg.am)return _tick.apply(this,arguments);if(over||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>60){dg.bs=1;spawn()}
 else if(dg.bs&&!E.some(function(e){return e.am})&&!dg.done){dg.done=1;dg.out=300;win()}
 if(dg.done&&--dg.out<=0)exit()};
var _drop=drop;drop=function(e){if(!e||!e.am)return _drop.apply(this,arguments);var L=MT_LV;gold+=gP(3000*L*CF.rw);var f=(30+Math.floor(R()*10))*CF.rw;frag+=f;DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:140});for(var i=0;i<5;i++){if(window.EQD&&Math.random()>=EQD.boss)continue;give(gen(L,5),e.x+(i-2)*40,150+i*30)};try{ZC.gain(25000)}catch(x){}try{if(window.TTHONG){TTHONG.drop();TTHONG.drop()}}catch(x){}
 try{if(window.LT&&LT.earnKS)LT.earnKS(CF.lk)}catch(x){}
 try{if(window.CSH&&CSH.give){if(Math.random()<CF.pHam){CSH.give('ham',1);DT.push({x:e.x,y:170,s:'🔨 +1 Búa Đục Lỗ',c:'#ffe9a0',l:160})}if(Math.random()<CF.pBua){CSH.give('b10',1);DT.push({x:e.x,y:200,s:'📜 +1 Bùa Cường Hóa +10%',c:'#ffe9a0',l:160})}}}catch(x){}};
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);if(dg&&dg.am){var b=boss();dgh.innerHTML='<div class="dgt">😈 ÁC MA VƯƠNG · Lv'+MT_LV+' · ×'+CF.mul+' Kiếm Thánh</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};
/* ---------- bản đồ: ảnh nền + cổng ma xoáy động ---------- */
function layout(gy){var sc=Math.max(W/IW,gy/GROUND_Y);BG.sc=sc;BG.X0=W/2-GATE_X*sc;BG.Y0=gy-GROUND_Y*sc;return sc}
function portalPath(sc){g.beginPath();PORTAL.forEach(function(p,i){var x=BG.X0+p[0]*sc,y=BG.Y0+p[1]*sc;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath()}
function drawPortal(sc,z){var cx=BG.X0+GATE_X*sc,cy=BG.Y0+372*sc,R0=190*sc,t=fr;g.save();portalPath(sc);g.clip();
 var gr=g.createRadialGradient(cx,cy,5*sc,cx,cy,R0);gr.addColorStop(0,'rgba(8,0,18,1)');gr.addColorStop(.45,'rgba(70,6,40,.96)');gr.addColorStop(1,'rgba(150,20,60,.92)');g.fillStyle=gr;g.fillRect(BG.X0+700*sc,BG.Y0+200*sc,330*sc,300*sc);
 g.globalCompositeOperation='lighter';
 for(var arm=0;arm<5;arm++){g.beginPath();for(var i=0;i<=40;i++){var u=i/40,ang=arm*1.2566+t*.012+u*5.2,rr=(.08+u*.95)*R0,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr*1.1;i?g.lineTo(x,y):g.moveTo(x,y)}g.strokeStyle='rgba('+(arm%2?'255,90,110':'255,160,130')+','+(.22+.1*Math.sin(t*.05+arm))+')';g.lineWidth=(7-arm)*sc;g.stroke()}
 for(var k=0;k<26;k++){var ph=((t*.006+k*.137)%1),ang2=k*2.4+t*.01,rr2=R0*(1-ph);g.fillStyle='rgba(255,'+(120+k*4)+',120,'+(.75*ph)+')';g.beginPath();g.arc(cx+Math.cos(ang2)*rr2,cy+Math.sin(ang2)*rr2*1.1,(1+2*ph)*sc*1.2,0,6.2832);g.fill()}
 var pulse=.35+.12*Math.sin(t*.05)+(1-z)*0+(z<1?.6*(1-Math.abs(z*2-1)):0);var gc=g.createRadialGradient(cx,cy+60*sc,5,cx,cy+60*sc,140*sc);gc.addColorStop(0,'rgba(255,90,70,'+pulse+')');gc.addColorStop(1,'rgba(255,60,60,0)');g.fillStyle=gc;g.fillRect(BG.X0+700*sc,BG.Y0+200*sc,330*sc,300*sc);
 g.restore()}
var _bg=bgd;bgd=function(gy){if(!(dg&&dg.am))return _bg.apply(this,arguments);
 if(!BG.ok){xbg(gy,7);g.save();g.fillStyle='rgba(60,6,16,.5)';g.fillRect(0,0,W,H);g.restore();return}
 var sc=layout(gy),w=IW*sc,h=IH*sc;g.save();g.fillStyle='#14080c';g.fillRect(0,0,W,H);
 g.drawImage(BG.img,BG.X0,BG.Y0,w,h);
 var by=BG.Y0+h;if(by<H){g.drawImage(BG.img,0,IH-4,IW,4,BG.X0,by-1,w,H-by+2);var gr=g.createLinearGradient(0,by,0,H);gr.addColorStop(0,'rgba(10,4,8,0)');gr.addColorStop(1,'rgba(10,4,8,.55)');g.fillStyle=gr;g.fillRect(0,by,W,H-by)}
 if(BG.X0>0){g.fillStyle='#14080c';g.fillRect(0,0,BG.X0,H);g.fillRect(BG.X0+w,0,W,H)}
 drawPortal(sc,dg.pz==null?1:dg.pz);
 /* tro đỏ bay */
 g.globalCompositeOperation='lighter';for(var k=0;k<22;k++){var ph=((fr*.004+k*.173)%1);g.fillStyle='rgba(255,'+(90+k*5)+',70,'+(.55*(1-ph))+')';g.beginPath();g.arc((k*97+fr*.3*(1+k%3))%W,gy-ph*H*.8,1.2+k%3*.7,0,6.2832);g.fill()}
 g.restore()};
/* ---------- vẽ boss: bộ khung có khớp ---------- */
var fq={ms:16.7,t:0,q:0};
var _foe=dgFoe;dgFoe=function(e){if(!e||!e.am||!e.ac)return _foe.apply(this,arguments);
 var a=e.ac,K2=s*CF.size,X=(e.x-cam)*s,dir=a.dir||-1,z=a.st==='emerge'?ease(a.t/CF.emerge):1,pose,w=a.w;
 pose=POSE(a.st==='emerge'?'idle':a.st,a.t,w,fr);
 var lift=(1-z)*(GROUND_Y-PORTAL_Y)*BG.sc*(BG.ok?1:.5);
 var Y=GY-(e.y||0)*s*0+(-(a.y||0)*s)-lift,zk=.55+.45*z;
 g.save();g.globalAlpha=Math.min(1,z*2.2);
 g.fillStyle='rgba(0,0,0,'+(.35*z)+')';g.beginPath();g.ellipse(X,GY+2,74*K2*zk*(1-Math.min(.6,(a.y||0)/420)),11*K2*zk,0,0,6.2832);g.fill();
 g.translate(X,Y);g.scale(dir*K2*zk,K2*zk);g.lineJoin='round';g.lineCap='round';
 if(a.st==='emerge'){g.shadowColor='rgba(255,60,60,'+(1-z)+')';g.shadowBlur=40*(1-z)}
 bossDraw(g,pose);
 if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.3*Math.min(1,e.fl/6);bossDraw(g,pose)}
 g.restore()};
/* ---------- nút rời trận ---------- */
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){if(dg&&dg.am){ev.stopPropagation();if(!started)return;confirmBox('Rời Ác Ma Thượng Giới?\\nBạn sẽ về Thành Thị Linh Giới, có thể khiêu chiến lại bất cứ lúc nào.','Rời đi','Ở lại',exit);return}return _dp.call(this,ev)}}catch(e){}
window.ACMA={cfg:CF,ask:ask,enter:enter,force:function(n){var e=boss();if(e&&e.ac){e.ac.st=n;e.ac.t=0;e.ac.x0=e.x}}};

})();
