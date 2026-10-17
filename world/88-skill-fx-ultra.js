/* ===== 🌌 HIỆU ỨNG KỸ NĂNG ĐẠI THẦN THÔNG (world/88-skill-fx-ultra.js) — nạp sau world/83 =====
 * Bọc (wrap) 27 công thức TG8SK.R.* của world/82 → mọi nơi đang dùng recipe đều được nâng cấp cùng lúc:
 *   • Thành Tiên Giới (world/79 fire → R[...]) và Map Treo / map đánh quái Tiên Giới (world/83 TGFX2 → R[...]).
 *   • 6 môn phái tiên nhân (proj…dotU) · Ý Cảnh Tiên/Ma (ycB/ycM/ycS/ycL) · Pháp Bảo Bổn Mệnh (fb0-3) · Linh Căn (lc0-4).
 * Mỗi chiêu được phủ thêm 3 lớp (không còn là "ô vuông đơn thuần"):
 *   1) TỤ LINH: 2 vòng trận pháp ngược chiều + 8 cột sáng + linh khí hút về nhân vật.
 *   2) HÀNH TRÌNH / BÁO TRƯỚC: dải tia xoắn theo đường bay; chiêu rơi điểm có vòng trận + cột báo hiệu dưới chân mục tiêu.
 *   3) BÙNG NỔ: cột sáng xuyên trời, 3 sóng xung kích, tia thần quang, vết cháy trên đất, rung màn hình + loé sáng (chiêu lớn),
 *      kèm "tiểu cảnh" riêng theo HỆ: Hoả (lưỡi lửa) · Băng (gai băng) · Lôi (sét giáng từ trời) · Mộc (lốc lá) · Kim (mưa kiếm) · Âm hồn (hồn xoắn)
 *      · Tiên (cánh sen + lông vũ) · Ma (hư không + lửa huyết + xích sét) · Pháp bảo (kiếm vũ / vòng xoáy đỉnh / phong ba / trăng chém)
 *      · Linh căn (thiên thạch / độc vụ / mưa nước / địa chấn).
 *   + Nâng cấp hiệu ứng TRÚNG ĐÒN lên quái (bọc TGFX.hitFx): sóng, tiểu cảnh theo hệ, chí mạng có sao 8 cánh + cột sáng.
 * Chỉ vẽ — không đổi sát thương / hồi chiêu / logic. Nhẹ: dùng sprite glow có cache, mật độ hạt theo TGFX_CF.q (máy yếu tự giảm).
 * Chỉnh: TGFXU_CF.enable=false (tắt, về hiệu ứng 82/83) · TGFXU_CF.shake=false (tắt rung + loé sáng) · TGFXU_CF.q (0.3–1.5). */
(function(){
'use strict';
if(typeof g==='undefined'||typeof RGBA!=='function'||!window.TG8SK||!window.TG8SK.R||!window.TGFX||!window.TGFX.hitFx)return;
var CF=window.TGFXU_CF=window.TGFXU_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(CF.shake===undefined)CF.shake=true;
if(!CF.power)CF.power=1.25;   /* hệ số cỡ hiệu ứng (1 = như thiết kế gốc) */
if(!CF.q)CF.q=(window.TGFX.CF&&window.TGFX.CF.q)||1;
var R=window.TG8SK.R,PI=Math.PI,TAU=PI*2,GS={},LF=-999;
function Q(n){return Math.max(2,Math.round(n*CF.q))}
function nn(n,o){return Q(o&&o.lite?Math.ceil(n*.45):n)}
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function ea(p){return 1-(1-p)*(1-p)}
function cl(v){return v<0?0:v>1?1:v}
function fade(p,a){return p>a?Math.max(0,(1-p)/(1-a)):1}
function pt(f,D,L,H){return[D*f.c-L*f.sn,.5*(D*f.sn+L*f.c)-(H||0)]}
/* ---------- hình vẽ cơ bản (g ở toạ độ chân nhân vật; mặt đất dẹt 2:1) ---------- */
function gspr(c){var o=GS[c];if(o)return o;o=document.createElement('canvas');o.width=o.height=96;var q=o.getContext('2d'),r=q.createRadialGradient(48,48,0,48,48,48);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,RGBA(c,.95));r.addColorStop(.5,RGBA(c,.34));r.addColorStop(1,RGBA(c,0));q.fillStyle=r;q.fillRect(0,0,96,96);return GS[c]=o}
function glow(x,y,r,c,al){if(r<1||al<=.01)return;var o=g.globalCompositeOperation,a=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.drawImage(gspr(c),x-r,y-r,r*2,r*2);g.globalCompositeOperation=o;g.globalAlpha=a}
function dring(x,y,rx,c,al,lw,dash,off){if(rx<2||al<=.01)return;g.save();g.globalCompositeOperation='lighter';if(dash){g.setLineDash(dash);g.lineDashOffset=off||0}
 g.beginPath();g.ellipse(x,y,rx,rx*.5,0,0,TAU);g.strokeStyle=c;g.globalAlpha=Math.min(1,al*.3);g.lineWidth=lw*3;g.stroke();g.globalAlpha=Math.min(1,al);g.lineWidth=lw;g.stroke();g.restore()}
function line(x1,y1,x2,y2,c,w,al){if(al<=.01)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al);g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore()}
function beam(x,y,h,w,c,al){if(h<2||al<=.01)return;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,RGBA(c,0));q.addColorStop(1,RGBA(c,.8*Math.min(1,al)));
 g.fillStyle=q;g.fillRect(x-w/2,y-h,w,h);g.globalAlpha=.75*Math.min(1,al);g.fillStyle='#ffffff';g.fillRect(x-w*.14,y-h*.85,w*.28,h*.85);g.restore();glow(x,y,w*1.3,c,al*.8)}
function bolt(x1,y1,x2,y2,c,w,al,sd,j){var n=9,dx=x2-x1,dy=y2-y1,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,pts=[[x1,y1]],i;
 for(i=1;i<n;i++){var u=i/n,o=(rnd(sd+i*3.1)-.5)*2*j*Math.sin(u*PI);pts.push([x1+dx*u+nx*o,y1+dy*u+ny*o])}pts.push([x2,y2]);
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 [[w*4,.22,c],[w*1.8,.6,c],[w*.7,1,'#ffffff']].forEach(function(l){g.globalAlpha=Math.min(1,al*l[1]);g.strokeStyle=l[2];g.lineWidth=l[0];g.beginPath();pts.forEach(function(q,k){k?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.stroke()});g.restore()}
function star8(x,y,r,rt,c,al){if(al<=.01)return;var i,a,L;for(i=0;i<8;i++){a=rt+i*PI/4;L=r*(i%2?.55:1);line(x+Math.cos(a)*r*.12,y+Math.sin(a)*r*.12,x+Math.cos(a)*L,y+Math.sin(a)*L,i%2?c:'#ffffff',i%2?3:4.5,al)}glow(x,y,r*.9,c,al*.7);glow(x,y,r*.4,'#ffffff',al)}
function fall(x,y,hh,c,al){line(x,y-hh,x,y,c,3,.55*al);line(x,y-hh*.7,x,y,'#ffffff',1.4,al);glow(x,y,11,c,al)}
/* ---------- tiểu cảnh bùng nổ theo HỆ (x,y = mặt đất; k 0→1; o={c,c2,rs,lite}) ---------- */
var ER={
fire:function(x,y,k,o){var a=fade(k,.55),i,j,u,n=nn(7,o),an,rr,bx,by,H;
 for(i=0;i<n;i++){an=i/n*TAU+rnd(i)*.5;rr=(18+60*rnd(i+2))*o.rs*ea(Math.min(1,k*3));bx=x+Math.cos(an)*rr;by=y+Math.sin(an)*rr*.5;H=(70+90*rnd(i+4))*o.rs*Math.sin(Math.min(1,k*1.4)*PI*.8+.2)*(1-k*.3);
  for(j=0;j<6;j++){u=j/5;glow(bx+Math.sin(fr*.3+i+j)*6*u,by-H*u,(22-14*u)*o.rs,j%3?o.c:o.c2,a*(1-u*.5))}}
 glow(x,y-20,(70+40*k)*o.rs,o.c2,a*.55)},
ice:function(x,y,k,o){var a=fade(k,.6),i,n=nn(11,o),e=ea(Math.min(1,k*3)),an,rr,bx,by,H,w;
 for(i=0;i<n;i++){an=i/n*TAU+rnd(i)*.4;rr=(20+90*rnd(i+2))*o.rs;bx=x+Math.cos(an)*rr;by=y+Math.sin(an)*rr*.5;H=(40+80*rnd(i+5))*o.rs*e;w=7+6*rnd(i+8);
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.85;g.fillStyle=o.c;g.beginPath();g.moveTo(bx-w,by);g.lineTo(bx,by-H);g.lineTo(bx+w,by);g.closePath();g.fill();
  g.globalAlpha=a;g.fillStyle=o.c2;g.beginPath();g.moveTo(bx-w*.3,by);g.lineTo(bx,by-H);g.lineTo(bx+w*.45,by);g.closePath();g.fill();g.restore();glow(bx,by-H,8,'#ffffff',a*.8)}
 glow(x,y-6,(80+50*k)*o.rs,o.c,a*.35)},
spark:function(x,y,k,o){var a=fade(k,.6),i,n=nn(5,o),sd=((fr>>1)*7)|0,tx,L;
 for(i=0;i<n;i++){tx=x+(rnd(i+3)-.5)*100*o.rs;bolt(x+(rnd(i)-.5)*170*o.rs,y-300*o.rs-60,tx,y,o.c,3,a,sd+i*13,22*o.rs+8)}
 for(i=0;i<3;i++){L=(50+70*ea(Math.min(1,k*2)))*o.rs;var an=rnd(i+sd)*TAU;bolt(x,y,x+Math.cos(an)*L,y+Math.sin(an)*L*.5,o.c2,2,a,sd+i*5,10)}
 glow(x,y-10,(60+30*k)*o.rs,o.c,a*.5)},
leaf:function(x,y,k,o){var a=fade(k,.6),i,n=nn(22,o),u,an,rr,lx,ly;
 for(i=0;i<n;i++){u=cl(k*1.3-rnd(i)*.25);an=i*2.4+k*9+rnd(i)*3;rr=(20+(80-u*30)*rnd(i+3))*o.rs*(.4+u);lx=x+Math.cos(an)*rr;ly=y+Math.sin(an)*rr*.5-u*170*o.rs*.8;
  g.save();g.translate(lx,ly);g.rotate(an+k*6);g.globalAlpha=a*(1-u*.5);g.fillStyle=i%2?o.c:o.c2;g.beginPath();g.ellipse(0,0,8,3.4,0,0,TAU);g.fill();g.restore();if(i%3===0)glow(lx,ly,10,o.c,a*.3)}
 glow(x,y-12,(60+30*k)*o.rs,o.c,a*.35)},
blade:function(x,y,k,o){var a=fade(k,.7),i,n=nn(12,o),q,bx,by,fy,w;
 for(i=0;i<n;i++){q=cl(k*1.7-rnd(i)*.6);if(q<=0)continue;bx=x+(rnd(i+1)-.5)*190*o.rs;by=y+(rnd(i+4)-.5)*70*o.rs;
  if(q<.62){fy=by-300*(1-ea(Math.min(1,q*1.6)));fall(bx,fy,70,o.c,a)}
  else{w=(q-.62)/.38;line(bx,by-32*(1-w*.3),bx,by,o.c2,3,a*(1-w*.5));dring(bx,by,10+30*w,o.c,(1-w)*a,2)}}},
wisp:function(x,y,k,o){var a=fade(k,.6),i,j,n=nn(9,o),u,an,rr,px,py;
 for(i=0;i<n;i++){u=cl(k*1.25-rnd(i)*.3);an=i/n*TAU+k*5;rr=(18+50*rnd(i+2))*o.rs*(1-u*.4);px=x+Math.cos(an)*rr;py=y+Math.sin(an)*rr*.5-u*190*o.rs*.8;
  for(j=0;j<4;j++){glow(px-Math.cos(an+1.5)*j*5,py+j*9,(14-j*2.6)*o.rs,j%2?o.c:o.c2,a*(1-j*.22)*(1-u*.4))}
  glow(px,py-3,5,'#ffffff',a*.9)}
 glow(x,y-14,(70+40*k)*o.rs,o.c,a*.4)},
holy:function(x,y,k,o){var a=fade(k,.6),i,n=12,e=ea(Math.min(1,k*2.2)),an,L,u;
 for(i=0;i<n;i++){an=i/n*TAU+k*1.2;L=(30+95*e)*o.rs;g.save();g.translate(x+Math.cos(an)*L*.45,y+Math.sin(an)*L*.22-e*10);g.rotate(an);g.scale(1,.5);g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.fillStyle=i%2?o.c:o.c2;
  g.beginPath();g.ellipse(L*.3,0,L*.42,L*.16,0,0,TAU);g.fill();g.restore()}
 for(i=0;i<nn(9,o);i++){u=cl(k*1.2-rnd(i)*.3);glow(x+(rnd(i+1)-.5)*130*o.rs+Math.sin(u*6+i)*10,y-u*230*o.rs,5+3*rnd(i+3),i%2?'#ffffff':o.c,a*(1-u))}
 glow(x,y-16,(80+40*k)*o.rs,o.c2,a*.4)},
demon:function(x,y,k,o){var a=fade(k,.6),e=ea(Math.min(1,k*2)),i,j,u,n=nn(9,o),an,rr,H,sd=((fr>>1)*7)|0;
 g.save();g.globalAlpha=.5*a;g.fillStyle='#14000c';g.beginPath();g.ellipse(x,y,(40+110*e)*o.rs,(40+110*e)*o.rs*.5,0,0,TAU);g.fill();g.restore();
 for(i=0;i<n;i++){an=i/n*TAU+k*2;rr=(26+80*rnd(i))*o.rs*e;H=(50+90*rnd(i+3))*o.rs*Math.sin(Math.min(1,k*1.3)*PI*.9+.1);
  for(j=0;j<5;j++){u=j/4;glow(x+Math.cos(an)*rr+Math.sin(fr*.25+i+j)*7*u,y+Math.sin(an)*rr*.5-H*u,(18-10*u)*o.rs,j%2?o.c:o.c2,a*(1-u*.6))}}
 for(i=0;i<3;i++)bolt(x+(rnd(i)-.5)*60,y-260*o.rs-40,x+(rnd(i+7)-.5)*40,y,o.c2,2.5,a,sd+i*13,18)},
vortex:function(x,y,k,o){var a=fade(k,.65),i,n=nn(26,o),u,an,rr,e=ea(k);
 for(i=0;i<n;i++){u=i/n;an=u*TAU*2+k*10;rr=(120-80*e)*o.rs*(1-u*.5);glow(x+Math.cos(an)*rr,y+Math.sin(an)*rr*.5-u*200*o.rs,9*(1-u*.5)*o.rs+3,i%3?o.c:'#ffffff',a*(1-u*.4))}
 beam(x,y,220*o.rs*Math.min(1,k*3),22*o.rs,o.c,a*.7)},
wind:function(x,y,k,o){var a=fade(k,.6),i,e=ea(k);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(i=0;i<5;i++){var r0=(50+i*26+90*e)*o.rs,st=fr*.12*(i%2?-1:1)+i*1.3;g.beginPath();g.ellipse(x,y-14-i*15,r0,r0*.5,0,st,st+2.1);g.strokeStyle=o.c;g.globalAlpha=a*.5;g.lineWidth=9;g.stroke();g.strokeStyle='#ffffff';g.globalAlpha=a;g.lineWidth=2.5;g.stroke()}
 g.restore();glow(x,y-20,(60+50*k)*o.rs,o.c,a*.35)},
moon:function(x,y,k,o){var a=fade(k,.65),i,e=ea(Math.min(1,k*1.6));g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(i=0;i<3;i++){var r0=(40+(120+i*36)*e)*o.rs,st=i*2.1+k*3;g.beginPath();g.ellipse(x,y-10-i*8,r0,r0*.5,0,st,st+2.4);g.strokeStyle=o.c;g.globalAlpha=a*.6;g.lineWidth=16*(1-k*.6);g.stroke();g.strokeStyle='#ffffff';g.globalAlpha=a;g.lineWidth=4*(1-k*.5);g.stroke()}
 g.restore();glow(x,y-10,(70+40*k)*o.rs,o.c,a*.4)},
meteor:function(x,y,k,o){var a=fade(k,.7),i,n=nn(6,o),q,bx,by,hx,hy,w;
 for(i=0;i<n;i++){q=cl(k*1.8-rnd(i)*.7);if(q<=0)continue;bx=x+(rnd(i+1)-.5)*170*o.rs;by=y+(rnd(i+4)-.5)*60*o.rs;
  if(q<.6){var u=ea(q/.6);hx=bx+130*(1-u);hy=by-340*(1-u);line(hx+60*(1-u)*.4,hy-150*.4,hx,hy,o.c,9,.5*a);line(hx+30*.4,hy-90*.4,hx,hy,'#ffffff',3,a);glow(hx,hy,24,o.c,a);glow(hx,hy,10,'#ffffff',a)}
  else{w=(q-.6)/.4;dring(bx,by,16+60*w,o.c,(1-w)*a,3);glow(bx,by-12,(30+26*w)*o.rs,o.c,(1-w)*a);glow(bx,by-26-w*30,16*(1-w),'#fff3b0',(1-w)*a)}}},
toxic:function(x,y,k,o){var a=fade(k,.6),i,n=nn(14,o),u,an,rr,bx,by;
 for(i=0;i<5;i++){an=i/5*TAU+k*1.4;glow(x+Math.cos(an)*60*o.rs,y+Math.sin(an)*30*o.rs-10,(50+40*k)*o.rs,o.c,a*.28)}
 for(i=0;i<n;i++){u=cl(k*1.3-rnd(i)*.3);bx=x+(rnd(i+2)-.5)*130*o.rs;by=y+(rnd(i+5)-.5)*60*o.rs-u*130*o.rs;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*(1-u*.6);g.strokeStyle=o.c;g.lineWidth=1.6;g.beginPath();g.arc(bx,by,3+6*rnd(i+8)*(.5+u),0,TAU);g.stroke();g.restore()}},
rainw:function(x,y,k,o){var a=fade(k,.7),i,n=nn(22,o),q,bx,by,w;
 for(i=0;i<n;i++){q=cl(k*2-rnd(i)*.8);if(q<=0||q>=1)continue;bx=x+(rnd(i+1)-.5)*200*o.rs;by=y+(rnd(i+4)-.5)*80*o.rs;
  if(q<.55)fall(bx,by-260*(1-q/.55),46,o.c,a);else{w=(q-.55)/.45;dring(bx,by,6+26*w,o.c,(1-w)*a,1.6)}}
 glow(x,y-8,(70+40*k)*o.rs,o.c,a*.25)},
quake:function(x,y,k,o){var a=fade(k,.7),i,n=nn(9,o),e=ea(Math.min(1,k*2.5)),an,L,u;
 for(i=0;i<n;i++){an=i/n*TAU+rnd(i)*.4;L=(40+110*rnd(i+2))*o.rs*e;var mx=x+Math.cos(an)*L*.5+(rnd(i+9)-.5)*12,my=y+Math.sin(an)*L*.25;
  line(x,y,mx,my,o.c,3,a*.9);line(mx,my,x+Math.cos(an)*L,y+Math.sin(an)*L*.5,o.c2,2,a*.9);glow(x+Math.cos(an)*L,y+Math.sin(an)*L*.5,8,o.c,a*.6)}
 for(i=0;i<nn(12,o);i++){u=cl(k*1.4-rnd(i)*.3);an=rnd(i+3)*TAU;var h=Math.sin(u*PI)*(60+50*rnd(i+6))*o.rs;g.save();g.globalAlpha=a;g.fillStyle=i%2?'#8a6a3a':o.c;g.fillRect(x+Math.cos(an)*(20+70*rnd(i+4))*o.rs-3,y+Math.sin(an)*(10+35*rnd(i+4))*o.rs-h-3,6,6);g.restore()}
 glow(x,y-8,(80+40*k)*o.rs,'#c89a5a',a*.35)}
};
/* ---------- bảng chiêu: d=tâm (0 = quanh nhân vật) · t=thời điểm nổ · m=kiểu · rs=cỡ · big=chiêu lớn · soft=hỗ trợ (không rung) ---------- */
var SP={
 proj:{d:420,t:.64,m:'path',rs:1},multi:{d:390,t:.7,m:'path',rs:.8},dash:{d:300,t:.6,m:'path',rs:1},
 mark:{d:200,t:.2,m:'zone',rs:1,soft:1},exec:{d:190,t:.4,m:'zone',rs:1.15},aoe:{d:190,t:.35,m:'zone',rs:1.2},burst:{d:180,t:.3,m:'zone',rs:1.25},
 freeze:{d:190,t:.3,m:'zone',rs:1.15},sweep:{d:0,t:.5,m:'self',rs:1.3},charge:{d:200,t:.5,m:'zone',rs:1.15},shield:{d:0,t:.2,m:'self',rs:.9,soft:1},
 dotT:{d:170,t:.25,m:'zone',rs:1.1},dotS:{d:0,t:.2,m:'self',rs:.9,soft:1},dotU:{d:0,t:.3,m:'self',rs:1.7,big:1},
 ycB:{d:210,t:.4,m:'zone',rs:1.3},ycM:{d:120,t:.4,m:'self',rs:1.3},ycS:{d:70,t:.35,m:'self',rs:1.6,big:1},ycL:{d:0,t:.35,m:'self',rs:1.9,big:1},
 fb0:{d:60,t:.3,m:'self',rs:1.3},fb1:{d:30,t:.3,m:'self',rs:1.3},fb2:{d:40,t:.25,m:'self',rs:1.3,soft:1},fb3:{d:220,t:.4,m:'zone',rs:1.4,big:1},
 lc0:{d:110,t:.35,m:'self',rs:1.5,big:1},lc1:{d:360,t:.5,m:'path',rs:1.3},lc2:{d:150,t:.3,m:'zone',rs:1.4},lc3:{d:540,t:.35,m:'path',rs:1},lc4:{d:60,t:.3,m:'self',rs:1.6,big:1}};
var SE={umt:['wisp','#d9a0ff'],hbd:['ice','#e8fbff'],ptc:['fire','#ffe27a'],tkt:['spark','#ffffff'],vdm:['leaf','#b6ff9a'],ngc:['blade','#fff4c0']};
var FE=['blade','vortex','wind','moon'],LE=['meteor','toxic','rainw','blade','quake'];
function theme(name,F){var c=F.col||'#ffffff',E,c2='#ffffff',id,t;
 if(name.charAt(0)==='y'){E=F.ma?'demon':'holy';c2=F.ma?'#ff2a6a':'#fff0a0'}
 else if(name.charAt(0)==='f'&&name.charAt(1)==='b'){E=FE[+name.charAt(2)]||'blade'}
 else if(name.charAt(0)==='l'&&name.charAt(1)==='c'){E=LE[+name.charAt(2)]||'meteor'}
 else{try{id=window.VP.get()||''}catch(e){id=''}t=SE[id]||['spark','#ffffff'];E=t[0];c2=t[1]}
 return{c:c,c2:c2,E:E}}
function boom(st,sp,o){if(st.f)return;st.f=1;if(sp.soft||!CF.shake)return;
 try{if(typeof shake==='function')shake(sp.big?11:5)}catch(e){}
 if(sp.big&&fr-LF>50){LF=fr;try{if(typeof flash==='function')flash(o.c,9)}catch(e){}}}
/* ---------- lớp phủ chính ---------- */
function ult(sp,F,p,o,st){
 var f=F.f,c=o.c,c2=o.c2,rs=sp.rs*CF.power,t=sp.t,i,u,an,al,n,A=sp.d?pt(f,sp.d,0,0):[0,0],ax=A[0],ay=A[1],pre=Math.max(.22,Math.min(t,.45)),sr=Math.sqrt(rs);
 /* 1) tụ linh quanh nhân vật */
 if(p<pre){u=p/pre;al=fade(u,.55)*Math.min(1,u*5);
  dring(0,0,(46+34*u)*sr,c,al,3,[10,8],fr*.9);dring(0,0,(80+40*u)*sr,c2,al*.8,2,[3,9],-fr*1.3);
  for(i=0;i<8;i++){an=i*PI/4+fr*.04;var bx=Math.cos(an)*(66+12*u)*sr,by=Math.sin(an)*(66+12*u)*sr*.5;beam(bx,by,26+90*u,5,i%2?c:c2,al*.85)}
  n=Q(10);for(i=0;i<n;i++){var w=(u*1.5+i/n)%1,r=(110-86*w)*sr;an=i*2.4+fr*.12;glow(Math.cos(an)*r,Math.sin(an)*r*.5-w*44,4+3*rnd(i),i%2?c:'#ffffff',(1-w)*al)}}
 /* kén năng lượng quanh nhân vật khi tung chiêu lớn */
 if(sp.big&&p<t+.35){u=Math.sin(p/(t+.35)*PI);glow(0,-40,(70+60*u)*sr,c,.55*u);glow(0,-40,40*sr,'#ffffff',.3*u);for(i=0;i<6;i++){var w2=(p*2.2+i/6)%1;line(Math.cos(i*1.05+fr*.05)*30*sr,-w2*130*sr+6,Math.cos(i*1.05+fr*.05)*30*sr,-w2*130*sr-24,i%2?c:c2,3,u*(1-w2))}}
 /* 2) hành trình / báo trước */
 if(sp.m==='path'&&p<t+.06){u=ea(Math.min(1,p/t));var D1=40+(sp.d-40)*u,al2=fade(p,t)*.95,hp=pt(f,D1,0,36),sp0=pt(f,40,0,36);
  line(sp0[0],sp0[1],hp[0],hp[1],c,5*rs,.35*al2);
  n=Q(16);for(i=0;i<n;i++){var v=i/n,Dv=40+(D1-40)*v,off=Math.sin(v*11+fr*.4)*16*(1-v*.3),q2=pt(f,Dv,off,36+Math.cos(v*9+fr*.3)*10),q3=pt(f,Dv,-off,36-Math.cos(v*9+fr*.3)*10);
   glow(q2[0],q2[1],5+5*v,c,al2*v);glow(q3[0],q3[1],4+4*v,c2,al2*v*.8)}
  glow(hp[0],hp[1],38*sr,c,al2*.6);glow(hp[0],hp[1],14,'#ffffff',al2)}
 if(sp.m==='zone'&&p<t){u=p/t;al=.45+.5*u;dring(ax,ay,(30+90*rs)*ea(u),c,al,2,[6,6],fr*.5);dring(ax,ay,(18+50*rs)*ea(u),c2,al*.8,2,[2,7],-fr);beam(ax,ay,130*u*sr,6+8*u,c,al*.7)}
 /* 3) bùng nổ */
 if(p>=t){var k=(p-t)/(1-t),a=1-k,e=ea(Math.min(1,k*2));boom(st,sp,o);
  var os={c:c,c2:c2,rs:rs*(sp.soft?.6:1)};
  if(!sp.soft){beam(ax,ay,360,(26+10*sp.big)*sr*(1-k*.45),c,fade(k,.3)*.9);
   for(i=0;i<3;i++){var kk=cl(k*1.4-i*.18);if(kk>0&&kk<1)dring(ax,ay,26+(170+i*34)*rs*ea(kk),i?c:'#ffffff',(1-kk)*.9,4-i)}
   n=Q(12);for(i=0;i<n;i++){an=i*TAU/n+st.seed*.1;var L2=(60+130*ea(Math.min(1,k*2)))*rs;line(ax+Math.cos(an)*18,ay+Math.sin(an)*9,ax+Math.cos(an)*L2,ay+Math.sin(an)*L2*.5,i%2?c:'#ffffff',3,fade(k,.5)*.8)}
   g.save();g.globalAlpha=.38*fade(k,.25);g.fillStyle='#0a0008';g.beginPath();g.ellipse(ax,ay,(40+70*e)*rs,(40+70*e)*rs*.5,0,0,TAU);g.fill();g.restore();
   if(sp.big){var kb=cl(k*1.2-.25);if(kb>0&&kb<1){dring(ax,ay,60+300*rs*ea(kb),c2,(1-kb)*.8,5);star8(ax,ay-90*sr,(110+50*kb)*sr,k*2,c,fade(k,.4)*.85)}}}
  else{dring(ax,ay,(40+110*e)*rs,c,a*.8,3);dring(ax,ay,(26+70*e)*rs,'#ffffff',a*.6,2)}
  (ER[o.E]||ER.spark)(ax,ay,k,os)}}
/* ---------- bọc recipe ---------- */
function wrap(name){var orig=R[name],sp=SP[name];if(!orig||!sp||orig.__u)return;
 var nf=function(F){var rec=orig(F);if(!CF.enable)return rec;
  var o=theme(name,F),st={f:0,seed:(Math.random()*997)|0},m0=rec.main||rec.draw,d0=rec.draw||rec.main;
  function ov(p){try{ult(sp,F,p,o,st)}catch(e){}}
  return{life:rec.life,aura:rec.aura,main:function(p){m0(p);ov(p)},draw:function(p){d0(p);ov(p)}}};
 nf.__u=1;R[name]=nf}
Object.keys(SP).forEach(wrap);
/* ---------- nâng cấp hiệu ứng TRÚNG ĐÒN (bọc TGFX.hitFx; 82 vẽ qua window.TGFX.hitFx, 83 qua TGX.hitFx) ---------- */
var HC2={fire:'#ffd76a',ice:'#e8fbff',leaf:'#b6ff9a',blade:'#fff4c0',wisp:'#d9a0ff',spark:'#ffffff'};
function hitUlt(it,p){if(!CF.enable||p>=1)return;
 var E=it.E||{k:'spark'},k=E.k,gy=(it.h||60)*.5,cr=!!it.crit,o={c:it.c,c2:HC2[k]||'#ffffff',rs:cr?.75:.5,lite:1},a=1-p,e=ea(p);
 dring(0,gy,(30+120*e)*(cr?1.4:1),it.c,a*.8,3);
 (ER[k]||ER.spark)(0,gy,p,o);
 if(cr){if(!it.__s){it.__s=1;if(CF.shake&&!it.nf){try{if(typeof shake==='function')shake(3)}catch(x){}}}
  star8(0,0,72*(1-p*.4),p*1.5,'#ffe27a',a);beam(0,gy,150*e,16*(1-p),'#ffe27a',a*.7)}}
var _hx=window.TGFX.hitFx;
window.TGFX.hitFx=function(it,p){_hx(it,p);try{hitUlt(it,p)}catch(e){}};
window.TGFXU={CF:CF,SP:SP,ER:ER};
})();
