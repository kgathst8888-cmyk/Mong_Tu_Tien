/* ===== ✨ NÂNG CẤP ĐỒ HOẠ KỸ NĂNG TIÊN GIỚI 2.5D (world/82-tien-gioi-fx-pro.js) — nạp sau world/81 =====
 * Chỉ chạy khi đang ở Thành Tiên Giới (TG.on()). Không đổi sát thương / hồi chiêu / logic — chỉ thay phần VẼ:
 *   1) Ghi đè TOÀN BỘ công thức hiệu ứng của world/79 (window.TG8SK.R.*): kỹ năng môn phái (proj, multi, dash, mark, exec, aoe, burst, freeze, sweep,
 *      charge, shield, dotT/dotS/dotU), thần thông Ý Cảnh (ycB/ycM/ycS/ycL, Tiên & Ma), Pháp Bảo Bổn Mệnh (fb0-3), Linh Căn (lc0-4).
 *      Mọi chiêu có: trận pháp bát quái dưới chân khi tụ khí → thân chiêu nhiều lớp (vệt đuôi thon, lõi trắng, hào quang cộng sáng) → dư chấn va chạm.
 *   2) Hạt/tiểu cảnh theo HỆ môn phái (VP.get): Âm hồn (linh hồn tím) · Băng (tinh thể) · Hoả (tàn lửa) · Lôi (sao điện + tia sét) · Mộc (lá) · Kim (ánh kiếm).
 *   3) Hiệu ứng TRÚNG ĐÒN trên quái Tiên Giới (trước đây chỉ có chữ sát thương): loé sáng, sóng nền isometric, mảnh theo hệ, vết chém, CHÍ MẠNG có sao 8 cánh.
 *      Có độ trễ theo loại chiêu để đạn bay tới nơi mới nổ. Quái chết: linh hồn bay lên + sóng linh khí.
 *   4) Nút kỹ năng #tg8-sk: viền sáng nhịp thở khi sẵn sàng, tối + phủ mờ khi hồi chiêu.
 * Vá nhỏ ở world/81: móc TGFX.hit trong hitMon, bỏ vẽ KF cũ khi module này bật, xuất TGQ.KF.
 * Chỉnh: TGFX_CF.enable=false để tắt (về hiệu ứng cũ ngoại trừ KF) · TGFX_CF.q (0.3–1.5, mật độ hạt; máy yếu tự 0.6) · TGFX_CF.maxHit (số hiệu ứng trúng đòn cùng lúc, mặc định 36). */
(function(){
'use strict';
if(typeof hero!=='function'||typeof RGBA!=='function'||!window.TG||!window.TG8SK||!window.TG8SK.R)return;
var CF=window.TGFX_CF=window.TGFX_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(!CF.q)CF.q=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)?.6:1;
if(!CF.maxHit)CF.maxHit=36;
var R=window.TG8SK.R,PI=Math.PI,TAU=PI*2,IMP=[],CUR=null,GS={},RS={},HK=0;
function Q(n){return Math.max(2,Math.round(n*CF.q))}
function tgOn(){try{return !!window.TG.on()}catch(e){return false}}
function sectId(){try{return window.VP.get()||''}catch(e){return ''}}
function ea(p){return 1-(1-p)*(1-p)}
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function fade(p,a){return p>a?Math.max(0,(1-p)/(1-a)):1}
function cl(v){return v<0?0:v>1?1:v}
/* ---------- bảng hệ ---------- */
var EL={umt:{k:'wisp',c2:'#5a1a9a'},hbd:{k:'ice',c2:'#e8fbff'},ptc:{k:'fire',c2:'#ff3a10'},tkt:{k:'spark',c2:'#ffffff'},vdm:{k:'leaf',c2:'#2f9a45'},ngc:{k:'blade',c2:'#fff4c0'}},EL0={k:'spark',c2:'#ffffff'};
function el(){return EL[sectId()]||EL0}
/* ---------- toạ độ: D phía trước, L bên phải, H cao → [x,y] (mặt đất dẹt 2:1) ---------- */
function pt(f,D,L,H){return[D*f.c-L*f.sn,.5*(D*f.sn+L*f.c)-(H||0)]}
function rot(f,da){var a=f.A+da;return{A:a,c:Math.cos(a),sn:Math.sin(a)}}
/* ---------- sprite có sẵn (vẽ 1 lần, dùng lại → nhẹ) ---------- */
function gspr(c){var o=GS[c];if(o)return o;o=document.createElement('canvas');o.width=o.height=128;var q=o.getContext('2d'),r=q.createRadialGradient(64,64,0,64,64,64);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.16,RGBA(c,.95));r.addColorStop(.5,RGBA(c,.36));r.addColorStop(1,RGBA(c,0));q.fillStyle=r;q.fillRect(0,0,128,128);return GS[c]=o}
function rspr(c){var o=RS[c];if(o)return o;var S=256,h=S/2,i,a;o=document.createElement('canvas');o.width=o.height=S;var q=o.getContext('2d');
 q.translate(h,h);q.strokeStyle=c;q.fillStyle=c;q.shadowColor=c;q.shadowBlur=8;
 q.lineWidth=4;q.beginPath();q.arc(0,0,h-8,0,TAU);q.stroke();q.lineWidth=2;q.beginPath();q.arc(0,0,h-27,0,TAU);q.stroke();q.beginPath();q.arc(0,0,h-62,0,TAU);q.stroke();
 q.lineWidth=2.5;for(var t=0;t<2;t++){q.beginPath();for(i=0;i<3;i++){a=t*PI/3+i*2.0944-PI/2;var x=Math.cos(a)*(h-62),y=Math.sin(a)*(h-62);i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath();q.stroke()}
 for(i=0;i<48;i++){a=i*TAU/48;var L=i%6?16:24;q.lineWidth=i%6?1:3;q.beginPath();q.moveTo(Math.cos(a)*(h-8),Math.sin(a)*(h-8));q.lineTo(Math.cos(a)*(h-L),Math.sin(a)*(h-L));q.stroke()}
 var G='乾兌離震巽坎艮坤';q.font='bold 24px serif';q.textAlign='center';q.textBaseline='middle';
 for(i=0;i<8;i++){q.save();q.rotate(i*PI/4);q.translate(0,-(h-44));q.fillText(G.charAt(i),0,0);q.restore()}
 return RS[c]=o}
/* ---------- hình vẽ cơ bản (g ở toạ độ chân nhân vật, y xuống) ---------- */
function glow(x,y,r,c,al){if(r<1||al<=.01)return;var o=g.globalCompositeOperation,a=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.drawImage(gspr(c),x-r,y-r,r*2,r*2);g.globalCompositeOperation=o;g.globalAlpha=a}
function rune(x,y,Rr,c,al,rt){if(Rr<4||al<=.01)return;g.save();g.translate(x,y);g.scale(1,.5);g.rotate(rt||0);g.globalCompositeOperation='lighter';g.globalAlpha=al>1?1:al;g.drawImage(rspr(c),-Rr,-Rr,Rr*2,Rr*2);g.restore()}
function rg(x,y,rx,c,al,lw,dash){if(rx<1||al<=.01)return;lw=lw||3;g.save();g.globalCompositeOperation='lighter';if(dash)g.setLineDash(dash);g.beginPath();g.ellipse(x,y,rx,rx*.5,0,0,TAU);
 g.strokeStyle=c;g.globalAlpha=Math.min(1,al*.3);g.lineWidth=lw*3;g.stroke();g.globalAlpha=Math.min(1,al);g.lineWidth=lw;g.stroke();g.strokeStyle='#ffffff';g.globalAlpha=Math.min(1,al*.55);g.lineWidth=Math.max(1,lw*.35);g.stroke();g.restore()}
function disc(x,y,rx,c,al){if(rx<1||al<=.01)return;g.save();g.globalAlpha=Math.min(1,al);g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,rx*.5,0,0,TAU);g.fill();g.restore()}
function line(x1,y1,x2,y2,c,w,al,add){g.save();if(add)g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al);g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore()}
function ico(x,y,sz,ch,al,rt,c){if(al<=.01)return;if(c)glow(x,y,sz*.95,c,al*.55);g.save();g.globalAlpha=Math.min(1,al);g.translate(x,y);if(rt)g.rotate(rt);g.font=Math.round(sz)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,0,0);g.restore()}
function pillar(x,y,w,h,c,al){if(h<2||al<=.01)return;g.save();g.globalCompositeOperation='lighter';
 var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,RGBA(c,0));q.addColorStop(.7,RGBA(c,.5*Math.min(1,al)));q.addColorStop(1,RGBA(c,.9*Math.min(1,al)));g.fillStyle=q;
 g.beginPath();g.moveTo(x-w*.25,y-h);g.lineTo(x+w*.25,y-h);g.lineTo(x+w*.6,y);g.lineTo(x-w*.6,y);g.closePath();g.fill();
 q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(255,255,255,'+Math.min(1,al)+')');g.fillStyle=q;g.fillRect(x-w*.14,y-h,w*.28,h);g.restore();
 glow(x,y,w*1.1,c,al*.8);glow(x,y-6,w*.5,'#ffffff',al*.7)}
function trail(pts,c,w,al){var n=pts.length,i,u;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(i=1;i<n;i++){u=1-i/(n-1);g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);
  g.strokeStyle=c;g.globalAlpha=Math.min(1,al*u*.6);g.lineWidth=w*(u*2.2+.3);g.stroke();g.strokeStyle='#ffffff';g.globalAlpha=Math.min(1,al*u);g.lineWidth=Math.max(.8,w*u*.6);g.stroke()}
 g.restore()}
function bolt(x1,y1,x2,y2,c,w,al,sd,disp){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,n=Math.max(4,Math.round(L/20)),nx=-dy/L,ny=dx/L,j=(disp||1)*L*.08,pts=[[x1,y1]],i;
 for(i=1;i<n;i++){var u=i/n,o=(rnd(sd+i*3.1)-.5)*2*j*Math.sin(u*PI)*1.5;pts.push([x1+dx*u+nx*o,y1+dy*u+ny*o])}pts.push([x2,y2]);
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 [[w*4,.22,c],[w*1.8,.6,c],[w*.7,1,'#ffffff']].forEach(function(l){g.globalAlpha=Math.min(1,al*l[1]);g.strokeStyle=l[2];g.lineWidth=l[0];g.beginPath();pts.forEach(function(q,k){k?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.stroke()});
 g.restore();return pts}
function crescent(cx,cy,r,a0,a1,th,c,al,n){n=n||14;g.save();g.globalCompositeOperation='lighter';
 for(var i=0;i<n;i++){var u0=i/n,u1=(i+1)/n,b0=a0+(a1-a0)*u0,b1=a0+(a1-a0)*u1,t0=th*u0,t1=th*u1,x0=cx+Math.cos(b0)*r,y0=cy+Math.sin(b0)*r*.5,x1=cx+Math.cos(b1)*r,y1=cy+Math.sin(b1)*r*.5;
  g.globalAlpha=Math.min(1,al*(.12+.88*u1));g.fillStyle=c;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(cx+Math.cos(b1)*(r-t1),cy+Math.sin(b1)*(r-t1)*.5);g.lineTo(cx+Math.cos(b0)*(r-t0),cy+Math.sin(b0)*(r-t0)*.5);g.closePath();g.fill();
  g.globalAlpha=Math.min(1,al*u1);g.strokeStyle='#ffffff';g.lineWidth=.6+2.6*u1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
 g.restore()}
function star4(x,y,r,rt,c,al){if(al<=.01)return;g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rt);g.globalAlpha=Math.min(1,al);g.fillStyle='#ffffff';g.beginPath();
 g.moveTo(0,-r);g.lineTo(r*.18,-r*.18);g.lineTo(r,0);g.lineTo(r*.18,r*.18);g.lineTo(0,r);g.lineTo(-r*.18,r*.18);g.lineTo(-r,0);g.lineTo(-r*.18,-r*.18);g.closePath();g.fill();g.restore();glow(x,y,r*1.5,c,al*.6)}
function diamond(x,y,r,rt,c1,c2,al){if(al<=.01)return;g.save();g.translate(x,y);g.rotate(rt);g.globalAlpha=Math.min(1,al);g.fillStyle=c1;g.strokeStyle=c2;g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*1.5);g.lineTo(r*.6,0);g.lineTo(0,r*1.5);g.lineTo(-r*.6,0);g.closePath();g.fill();g.stroke();g.restore();glow(x,y,r*1.7,c2,al*.4)}
function leaf(x,y,r,rt,c,c2,al){if(al<=.01)return;g.save();g.translate(x,y);g.rotate(rt);g.globalAlpha=Math.min(1,al);g.fillStyle=c2;g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.ellipse(0,0,r*1.3,r*.6,0,0,TAU);g.fill();g.stroke();g.restore();glow(x,y,r*1.4,c,al*.35)}
function streak(x,y,L,rt,c,al){var dx=Math.cos(rt)*L,dy=Math.sin(rt)*L*.6;line(x-dx,y-dy,x+dx,y+dy,c,3.2,al*.6,1);line(x-dx*.6,y-dy*.6,x+dx*.6,y+dy*.6,'#ffffff',1.4,al,1)}
/* hạt theo hệ */
function part(k,x,y,sz,c,al,rt,c2){
 if(k==='fire'){glow(x,y,sz*1.9,c2,al*.5);glow(x,y,sz,c,al)}
 else if(k==='ice')diamond(x,y,sz,rt,'#e8fbff',c,al);
 else if(k==='leaf')leaf(x,y,sz,rt,c,c2,al);
 else if(k==='blade')streak(x,y,sz*2.2,rt,c,al);
 else if(k==='wisp'){glow(x,y,sz*1.4,c,al*.6);glow(x+Math.cos(rt)*sz,y+Math.sin(rt)*sz*.6,sz*.8,c2,al*.8)}
 else star4(x,y,sz*1.2,rt,c,al)}
/* dư chấn va chạm chung (x,y = mặt đất; k 0→1) */
function impact(x,y,c,k,sz,E){E=E||el();if(k>=1||k<0)return;var a=1-k,e=ea(k),i,n=Q(10),an,r;
 glow(x,y-14,(64+60*k)*sz,c,.9*a);glow(x,y-14,34*sz*(1-k*.5),'#ffffff',a);
 rg(x,y,(24+92*e)*sz,c,a,4);rg(x,y,(14+54*e)*sz,'#ffffff',a*.8,2);
 for(i=0;i<n;i++){an=rnd(i*3)*TAU;r=e*(40+80*rnd(i+5))*sz;part(E.k,x+Math.cos(an)*r,y+Math.sin(an)*r*.5-e*34*rnd(i+9)-6,5+4*rnd(i+1),c,a,an,E.c2)}
 if(k<.35){var u=1-k/.35;line(x-40*sz*u,y-30,x+40*sz*u,y-6,'#ffffff',3,u,1);line(x+40*sz*u,y-30,x-40*sz*u,y-6,c,5,u,1)}}
/* tụ khí dưới chân khi thi triển */
function aura(F,k){var c=F.col,E=el(),i,n=Q(6),u;if(k>=1)return;
 rune(0,0,56+30*k,c,.8*(1-k*.6),fr*.06);glow(0,-34,40*(1-k*.4),c,.5*(1-k));
 for(i=0;i<n;i++){u=(k*1.6+i/n)%1;part(E.k,Math.cos(i*1.05+fr*.06)*(36-u*12),-u*76-6+Math.sin(i*1.05+fr*.06)*8,3.5+2*rnd(i),c,(1-u)*.9,i+fr*.1,E.c2)}}
function def(name,fn,noAura){R[name]=function(F){var e=fn(F);CUR={c:F.col,t:name,fr:fr,E:el(),ma:!!F.ma};return{life:e.life,main:e.draw,aura:noAura?null:function(p){if(p<.3)aura(F,p/.3)},draw:function(p){if(!noAura&&p<.3)aura(F,p/.3);e.draw(p)}}}}
function flash(c,a){if(a<=.01)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(.5,a);g.fillStyle=c;g.fillRect(-1100,-1100,2200,2200);g.restore()}

/* ================= KỸ NĂNG MÔN PHÁI ================= */
def('proj',function(F){var f=F.f,c=F.col,E=el();return{life:34,draw:function(p){
 var tp=Math.min(1,p/.66),D=40+380*ea(tp),i,u,h;
 if(p<.72){var tr=[];for(i=0;i<9;i++)tr.push(pt(f,40+380*ea(Math.max(0,tp-i*.035)),0,36));trail(tr,c,9,fade(p,.72));h=tr[0];
  glow(h[0],h[1],36,c,.9);glow(h[0],h[1],16,'#ffffff',1);
  for(i=0;i<2;i++){var o=Math.sin(tp*20+i*3.14)*16,b=pt(f,D-10,o,36+o*.4);glow(b[0],b[1],9,E.c2,.8)}
  for(i=0;i<Q(5);i++){u=(tp*3+i*.2)%1;var pd=pt(f,D-u*90,(rnd(i)-.5)*26,36+(rnd(i+4)-.5)*18);part(E.k,pd[0],pd[1],5+3*rnd(i+2),c,.8*(1-u),i+tp*8,E.c2)}
  ico(h[0],h[1],18,F.ic,.9,0,c)}
 if(p>.64){var e2=pt(f,420,0,0);impact(e2[0],e2[1],c,(p-.64)/.36,1,E)}}}});
def('multi',function(F){var n=Math.min(6,F.sp.h||3),c=F.col,E=el();return{life:42,draw:function(p){
 for(var k=0;k<n;k++){var q=(p-k*.06)/.62;if(q<=0)continue;var r=rot(F.f,(k-(n-1)/2)*.26);
  if(q<1){var tr=[],i;for(i=0;i<7;i++)tr.push(pt(r,40+350*ea(Math.max(0,q-i*.04)),Math.sin((q-i*.04)*14+k)*7,34));trail(tr,c,6,1-q*.3);var h=tr[0];
   glow(h[0],h[1],22,c,.9);star4(h[0],h[1],10,r.A+q*6,c,.9);ico(h[0],h[1],14,F.ic,.9,r.A)}
  else{var k2=(q-1)/.5;if(k2<1){var e=pt(r,390,0,0);impact(e[0],e[1],c,k2,.55,E)}}}}}});
def('dash',function(F){var f=F.f,c=F.col,E=el();return{life:30,draw:function(p){var e=ea(Math.min(1,p/.7)),a=fade(p,.55),i,s0=pt(f,-30,0,30),s1=pt(f,300*e,0,30);
 for(i=0;i<7;i++){var L=(i-3)*9,hh=10+rnd(i+3)*50,a0=pt(f,-30-40*rnd(i),L,hh),b0=pt(f,300*e-20*rnd(i+5),L,hh);line(a0[0],a0[1],b0[0],b0[1],i%2?c:'#ffffff',1.5+2*rnd(i),.5*a,1)}
 line(s0[0],s0[1],s1[0],s1[1],c,22*(1-p*.6),.35*a,1);line(s0[0],s0[1],s1[0],s1[1],'#ffffff',5*(1-p),.8*a,1);
 for(i=1;i<=5;i++){var q=pt(f,300*Math.max(0,e-i*.1),0,0);disc(q[0],q[1],24,c,.34*a/i);glow(q[0],q[1]-34,30,c,.45*a/i);part(E.k,q[0]+(rnd(i)-.5)*20,q[1]-8-rnd(i+2)*40,4,c,.8*a,i,E.c2)}
 if(p<.35)rg(0,0,70*p/.35,c,1-p/.35,3);
 var h=pt(f,300*e,0,40);glow(h[0],h[1],46,c,.8*a);ico(h[0],h[1],22,F.ic,a);
 if(p>.6){var en=pt(f,300,0,0);impact(en[0],en[1],c,(p-.6)/.4,.9,E)}}}});
def('mark',function(F){var c=F.col,E=el();return{life:72,draw:function(p){var e=pt(F.f,200,0,0),a=fade(p,.7),t=fr*.06,k=ea(Math.min(1,p/.15)),i;
 rune(e[0],e[1],84*k,c,a,-t);rg(e[0],e[1],48+5*Math.sin(t*3),c,a,2);glow(e[0],e[1]-6,40,c,.45*a);
 for(i=0;i<4;i++){var an=i*PI/2+t*2,x=e[0]+Math.cos(an)*74,y=e[1]+Math.sin(an)*37;glow(x,y,12,c,.8*a);line(x,y,x,y-30-6*Math.sin(t*3+i),c,3,.8*a,1)}
 pillar(e[0],e[1],14,150*k,c,.6*a);
 for(i=0;i<Q(5);i++){var u=(p*2+i/5)%1;part(E.k,e[0]+Math.cos(i*1.26)*50,e[1]+Math.sin(i*1.26)*25-u*90,3.5,c,(1-u)*a,i+t,E.c2)}
 ico(e[0],e[1]-68+Math.sin(t*2)*5,28,F.ic,a,0,c)}}});
def('exec',function(F){var c=F.col,E=el();return{life:44,draw:function(p){var e=pt(F.f,190,0,0),k=ea(Math.min(1,p/.4));
 rune(e[0],e[1],110*k,c,fade(p,.5),fr*.08);
 for(var i=0;i<Q(6);i++){var q=cl((p-i*.03)/.35),xx=e[0]+(rnd(i)-.5)*120,yy=e[1]+(rnd(i+3)-.5)*60;if(q>0&&q<1)line(xx,yy-420*(1-q),xx,yy-420*(1-q)+70,'#ffffff',3,.8,1)}
 pillar(e[0],e[1],36*(1-p*.5),250*k,c,fade(p,.5));
 if(p>.35){var q2=(p-.35)/.65,r=100*ea(q2);flash(c,.3*(1-q2));
  line(e[0]-r,e[1]-r*.5-30,e[0]+r,e[1]+r*.5-30,'#ffffff',6*(1-q2),1-q2,1);line(e[0]+r,e[1]-r*.5-30,e[0]-r,e[1]+r*.5-30,c,9*(1-q2),1-q2,1);
  impact(e[0],e[1],c,q2,1.15,E)}
 ico(e[0],e[1]-74,30,F.ic,fade(p,.6),0,c)}}});
def('aoe',function(F){var c=F.col,E=el(),Rr=Math.max(70,Math.min(F.sp.r||150,170));return{life:42,draw:function(p){var e=pt(F.f,190,0,0),k=ea(p),i;
 disc(e[0],e[1],Rr*k,c,.18*(1-p));rune(e[0],e[1],Rr*1.05*k,c,1-p*.8,p*3);rg(e[0],e[1],Rr*k,c,1-p,4);rg(e[0],e[1],Rr*k*.6,'#ffffff',.8*(1-p),2);
 for(i=0;i<8;i++){var a=i*PI/4+.3,rr=Rr*k,x=e[0]+Math.cos(a)*rr,y=e[1]+Math.sin(a)*rr*.5;pillar(x,y,10,50+40*Math.sin(Math.min(1,p*1.8)*PI*.5),c,.85*(1-p))}
 pillar(e[0],e[1],42*(1-p),140*Math.sin(Math.min(1,p*1.6)*PI*.5),c,.95*(1-p));
 for(i=0;i<Q(10);i++){var u=(p*1.4+i/10)%1,an=i*2.4;part(E.k,e[0]+Math.cos(an)*Rr*.8*k,e[1]+Math.sin(an)*Rr*.4*k-u*110,4+2*rnd(i),c,(1-p)*(1-u),an+p*5,E.c2)}
 ico(e[0],e[1]-64*k,28,F.ic,1-p,0,c)}}});
def('burst',function(F){var c=F.col,E=el();return{life:48,draw:function(p){var e=pt(F.f,180,0,0),k=ea(p),i,a=1-p;
 disc(e[0],e[1]+4,100*k,'#120a10',.35*a);glow(e[0],e[1]-26,(120+60*k),c,.8*a);glow(e[0],e[1]-26,60*(1-p*.7),'#ffffff',a);
 for(i=0;i<Q(14);i++){var an=i*TAU/14+.2,L=(60+90*rnd(i))*k;line(e[0]+Math.cos(an)*20*k,e[1]-26+Math.sin(an)*10*k,e[0]+Math.cos(an)*L,e[1]-26+Math.sin(an)*L*.55,i%2?c:'#ffffff',3+3*rnd(i+4),.8*a,1)}
 for(i=0;i<Q(12);i++){var a2=rnd(i)*TAU,r=rnd(i+9)*130*k;part(E.k,e[0]+Math.cos(a2)*r,e[1]+Math.sin(a2)*r*.5-14-34*k*rnd(i+3),5+4*rnd(i+5),c,.8*a,a2,E.c2)}
 rg(e[0],e[1],140*k,c,a,4);rg(e[0],e[1],90*k,'#ffffff',a*.8,2);if(p<.15)flash(c,.25*(1-p/.15));
 ico(e[0],e[1]-44,26,F.ic,a,0,c)}}});
def('freeze',function(F){var c=F.col,E=el();return{life:58,draw:function(p){var e=pt(F.f,190,0,0),k=ea(Math.min(1,p/.3)),a=fade(p,.7),i,sh=p>.78?(p-.78)/.22:0;
 rune(e[0],e[1],120*k,c,a,fr*.03);disc(e[0],e[1],100*k,c,.14*a);rg(e[0],e[1],110*k,c,a,3);
 for(i=0;i<9;i++){var an=i*TAU/9+.4,x=e[0]+Math.cos(an)*(66+14*rnd(i))*k,y=e[1]+Math.sin(an)*(33+7*rnd(i))*k,h=(46+34*rnd(i+2))*k*(1-sh*.3),w=10+4*rnd(i+4);
  if(sh>0){x+=Math.cos(an)*sh*70;y+=Math.sin(an)*sh*35-sh*sh*-30}
  g.save();g.globalAlpha=Math.max(0,.9*a*(1-sh));var q=g.createLinearGradient(x,y-h,x,y);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(1,RGBA(c,.8));g.fillStyle=q;g.strokeStyle='#ffffff';g.lineWidth=1.5;
  g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y-h*.4);g.lineTo(x+w*.7,y);g.lineTo(x-w*.7,y);g.lineTo(x-w,y-h*.4);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(x,y-h);g.lineTo(x,y);g.globalAlpha*=.5;g.stroke();g.restore();glow(x,y-h*.5,w*2,c,.25*a*(1-sh))}
 for(i=0;i<Q(10);i++){var u=(p*1.2+i/10)%1;part('ice',e[0]+Math.cos(i*2.3)*95*k,e[1]+Math.sin(i*2.3)*47*k-u*100,3+2*rnd(i),c,a*(1-u),i+p*4,'#ffffff')}
 if(sh>0)rg(e[0],e[1],110+60*sh,'#ffffff',(1-sh)*.8,3);
 ico(e[0],e[1]-66,28,F.ic,a,0,c)}}});
def('sweep',function(F){var c=F.col,Rr=250,E=el();return{life:42,draw:function(p){var f=F.f,k=ea(Math.min(1,p/.7)),a0=f.A-1.1,al=fade(p,.6),i;
 disc(0,0,Rr*.95,c,.06*al);
 crescent(0,-30,Rr,a0,a0+2.2*k,46*(1-p*.3),c,al*.85);crescent(0,-30,Rr*.72,a0,a0+2.2*k,26,'#ffffff',al*.35,10);
 var h=a0+2.2*k;glow(Rr*Math.cos(h),Rr*.5*Math.sin(h)-30,40,c,al);
 for(i=0;i<Q(12);i++){var u=rnd(i),an=a0+2.2*k*u,rr=Rr*(.8+.35*rnd(i+3)),x=Rr*0+rr*Math.cos(an),y=rr*.5*Math.sin(an)-30+(rnd(i+7)-.5)*20-(p*30*rnd(i+1));part(E.k,x,y,4+3*rnd(i+9),c,al*u,an,E.c2)}
 ico(Rr*Math.cos(h),Rr*.5*Math.sin(h)-30,36,F.ic,al,h,c)}}});
def('charge',function(F){var c=F.col,E=el();return{life:60,draw:function(p){var e=pt(F.f,200,0,0),i;
 if(p<.5){var k=p/.5;rune(e[0],e[1],120*(1-k*.35),c,.5+.4*k,fr*.12);
  for(i=0;i<Q(14);i++){var an=i*TAU/14+fr*.04,rr=(1-((k*1.3+i/14)%1))*150;part(E.k,e[0]+Math.cos(an)*rr,e[1]+Math.sin(an)*rr*.5-20,3.5+2*rnd(i),c,.5+.5*k,an,E.c2)}
  glow(e[0],e[1]-40,20+50*k,c,.4+.5*k);ico(e[0],e[1]-170*(1-ea(k)),30,F.ic,.9,0,c)}
 else{var q=(p-.5)/.5;flash(c,.3*(1-q));pillar(e[0],e[1],54*(1-q*.6),230*(1-q*.35),c,1-q);impact(e[0],e[1],c,q,1.3,E);glow(e[0],e[1]-14,70*(1-q),'#ffffff',.7*(1-q))}}}});
def('shield',function(F){var c=F.col,E=el();return{life:80,draw:function(p){var a=fade(p,.75),t=fr*.08,k=ea(Math.min(1,p/.15)),i,rr=64*k;
 g.save();var q=g.createRadialGradient(0,-36,10,0,-36,76);q.addColorStop(0,RGBA(c,0));q.addColorStop(.75,RGBA(c,.12*a));q.addColorStop(1,RGBA(c,.45*a));g.fillStyle=q;g.beginPath();g.ellipse(0,-36,rr,76*k,0,0,TAU);g.fill();g.restore();
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle=c;g.lineWidth=3;g.globalAlpha=.8*a;g.beginPath();g.ellipse(0,-36,rr,76*k,0,0,TAU);g.stroke();
 for(i=0;i<3;i++){g.globalAlpha=.9*a;g.strokeStyle='#ffffff';g.lineWidth=2.5;g.beginPath();g.ellipse(0,-36,rr*.96,74*k,0,t+i*2.094,t+i*2.094+.9);g.stroke()}
 g.globalAlpha=.3*a;g.strokeStyle=c;g.lineWidth=1.2;for(i=-2;i<=2;i++){g.beginPath();g.ellipse(0,-36,rr*Math.cos(i*.4),74*k,0,0,TAU);g.stroke()}g.restore();
 rune(0,0,rr+8,c,a*.8,-t);rg(0,0,rr,c,a,3);var pu=(p*2)%1;rg(0,-36,rr*(.6+.5*pu),c,a*(1-pu)*.5,2);
 for(i=0;i<3;i++){var an=t*1.5+i*2.094;ico(Math.cos(an)*60,-36+Math.sin(an)*18,22,F.ic,a,0,c)}
 for(i=0;i<Q(6);i++){var u=(p*1.5+i/6)%1;part(E.k,Math.cos(i*1.05)*50,-u*100,3,c,a*(1-u),i,E.c2)}}}});
def('dotT',function(F){var c=F.col,E=el(),Rr=Math.max(70,Math.min(F.sp.r||150,170));return{life:70,draw:function(p){var e=pt(F.f,170,0,0),a=fade(p,.7),k=ea(Math.min(1,p/.2)),i;
 disc(e[0],e[1],Rr*k,c,.16*a);rune(e[0],e[1],Rr*1.05*k,c,a*.9,fr*.04);rg(e[0],e[1],Rr*k,c,a,3,[12,6]);
 for(i=0;i<2;i++){var pu=(p*2.4+i*.5)%1;rg(e[0],e[1],Rr*k*pu,c,a*(1-pu)*.8,2)}
 for(i=0;i<Q(10);i++){var u=((p*1.6+i/10)%1),an=i*.628+fr*.01;part(E.k,e[0]+Math.cos(an)*Rr*.7*k,e[1]+Math.sin(an)*Rr*.35*k-u*100,4+2*rnd(i),c,a*(1-u),an,E.c2)}
 ico(e[0],e[1]-52+Math.sin(fr*.1)*4,26,F.ic,a,0,c)}}});
def('dotS',function(F){var c=F.col,E=el();return{life:60,draw:function(p){var a=fade(p,.7),k;
 for(k=0;k<5;k++){var q=(p-k*.05)/.8;if(q<=0||q>=1)continue;var r=rot(F.f,(k-2)*.3),tr=[],i;
  for(i=0;i<7;i++)tr.push(pt(r,40+320*ea(Math.max(0,q-i*.03)),Math.sin((q-i*.03)*10+k)*14,10+Math.abs(Math.sin((q-i*.03)*14))*14));
  trail(tr,c,7,a);var h=tr[0];disc(h[0],h[1]+14,16,c,.3*a);ico(h[0],h[1],26,F.ic,a,0,c);part(E.k,h[0]+(rnd(k+fr)-.5)*20,h[1]+10,4,c,.8*a,k+fr*.2,E.c2)}
 rg(0,0,50+90*ea(p),c,.8*(1-p),3)}}});
def('dotU',function(F){var c=F.col,E=el(),Rr=Math.max(190,Math.min((F.sp.r||500)*.55,300));return{life:100,draw:function(p){var m=pt(F.f,Math.min(160,Rr*.5),0,0),a=fade(p,.75),k=ea(Math.min(1,p/.15)),i;
 if(p<.12)flash(c,.35*(1-p/.12));
 disc(m[0],m[1],Rr*k,c,.14*a);rune(m[0],m[1],Rr*1.08*k,c,a,fr*.03);rg(m[0],m[1],Rr*k,c,a,4,[14,8]);rg(m[0],m[1],Rr*((p*2.4)%1),c,a*.7,3);
 pillar(m[0],m[1],60*k,260*k,c,.7*a);
 for(i=0;i<Q(14);i++){var u=((p*1.4+rnd(i+1))%1),an=rnd(i)*TAU,rr=Math.sqrt(rnd(i+7))*Rr*k,x=m[0]+Math.cos(an)*rr,y=m[1]+Math.sin(an)*rr*.5,fy=y-320*(1-u);
  line(x,fy-60,x,fy,c,4,a*Math.min(1,u*4)*.7,1);glow(x,fy,16,c,a*Math.min(1,u*4));ico(x,fy,22,F.ic,a*Math.min(1,u*4));
  if(u>.9)impact(x,y,c,(u-.9)*10,.4,E)}
 ico(m[0],m[1]-80,42,F.ic,a,0,c)}}});

/* ================= Ý CẢNH (Tiên = vàng, Ma = đỏ thẫm) ================= */
def('ycB',function(F){var c=F.col,ma=F.ma,E=el(),c2=ma?'#ff2a6a':'#ffe27a';return{life:60,draw:function(p){var e=pt(F.f,210,0,0),k=ea(Math.min(1,p/.3)),a=fade(p,.6),i;
 if(ma){disc(e[0],e[1],160*k,'#0c0614',.6*a);rune(e[0],e[1],160*k,c2,a,-fr*.05)}else{disc(e[0],e[1],150*k,'#ffe27a',.18*a);rune(e[0],e[1],160*k,c,a,fr*.04)}
 rg(e[0],e[1],150*k,c,a,4);rg(e[0],e[1],95*k,c2,a*.8,2);
 pillar(e[0],e[1],ma?90:110,330*k,c,a);
 for(i=0;i<8;i++){var an=i*PI/4+p*1.6,x=e[0]+Math.cos(an)*105*k,y=e[1]+Math.sin(an)*52*k;pillar(x,y,22,(110+70*rnd(i))*k,i%2?c:c2,a*.8)}
 for(i=0;i<Q(14);i++){var u=(p*1.6+i/14)%1,an2=i*2.4;glow(e[0]+Math.cos(an2)*(40+90*rnd(i))*k,e[1]+Math.sin(an2)*(20+45*rnd(i))*k-u*240,6+3*rnd(i+4),i%2?c:c2,a*(1-u))}
 if(p<.2)flash(c,.28*(1-p/.2));
 ico(e[0],e[1]-140*k,40,F.ic,a,0,c)}}});
def('ycM',function(F){var c=F.col,ma=F.ma,E=el(),c2=ma?'#ff2a6a':'#fff0a0';return{life:60,draw:function(p){var a=fade(p,.75),k;
 for(k=0;k<5;k++){var q=(p-k*.08)/.6;if(q<=0||q>=1)continue;
  if(!ma){var e=pt(F.f,120+60*k,(k-2)*38,0),h=320*(1-ea(q));
   line(e[0],e[1]-h-110,e[0],e[1]-h,c,10,.35,1);line(e[0],e[1]-h-90,e[0],e[1]-h,'#ffffff',3,.95,1);glow(e[0],e[1]-h,22,c,.9);ico(e[0],e[1]-h-8,26,F.ic,1,PI,c);
   if(h<28){impact(e[0],e[1],c,Math.min(.99,q*1.3-.3>0?q*1.3-.3:0),.7,E);rune(e[0],e[1],46,c,.8*a,q*5)}}
  else{var tr=[],i;for(i=0;i<9;i++){var qq=Math.max(0,q-i*.025);tr.push(pt(F.f,40+380*ea(qq),Math.sin(qq*9+k)*40,34))}trail(tr,'#ff2a6a',8,a);trail(tr,c,5,a*.8);var h2=tr[0];glow(h2[0],h2[1],26,'#ff2a6a',.6*a);glow(h2[0],h2[1],14,c,.9*a);ico(h2[0],h2[1],20,F.ic,a,0,'#ff2a6a')}}}}});
def('ycS',function(F){var c=F.col,ma=F.ma,E=el();return{life:74,draw:function(p){var a=fade(p,.7),i;
 if(!ma){if(p<.14)flash(c,.4*(1-p/.14));
  for(i=0;i<7;i++){var q=(p-i*.07)/.4;if(q<=0||q>=1)continue;var e=pt(F.f,70+rnd(i)*330,(rnd(i+4)-.5)*320,0),sd=Math.floor(fr/2)*7.7+i*13,top=[e[0]+(rnd(i+9)-.5)*60,e[1]-360],pts=bolt(top[0],top[1],e[0],e[1],c,5*(1-q*.6),1-q,sd,1.2);
   var m=pts[Math.floor(pts.length/2)];bolt(m[0],m[1],m[0]+(rnd(i+2)-.5)*140,m[1]+120,c,2.5,(1-q)*.8,sd+5,1);
   rune(e[0],e[1],60*q+16,c,(1-q)*.9,q*4);impact(e[0],e[1],c,q,.8,E)}}
 else{var m2=pt(F.f,170,0,0),k=ea(Math.min(1,p/.2));disc(m2[0],m2[1],210*k,'#0c0614',.55*a);rune(m2[0],m2[1],215*k,c,a,-fr*.05);rg(m2[0],m2[1],200*k,c,a,4);
  for(i=0;i<Q(34);i++){var u=i/34,an=u*18.8+fr*.08,r=(1-((p*1.5+u)%1))*195*k;glow(m2[0]+Math.cos(an)*r,m2[1]+Math.sin(an)*r*.5-10-(1-r/195)*20,10,i%3?c:'#ff2a6a',a*.9)}
  glow(m2[0],m2[1]-20,70,'#ff2a6a',.4*a);ico(m2[0],m2[1]-50,44,F.ic,a,fr*.1,c)}}}});
def('ycL',function(F){var c=F.col,ma=F.ma,E=el(),c2=ma?'#ff2a6a':'#ffffff';return{life:46,draw:function(p){var f=F.f,k=ea(p),a=fade(p,.6),i;
 var s0=pt(f,30,0,40),s1=pt(f,40+520*k,0,40);
 if(ma){line(s0[0],s0[1],s1[0],s1[1],'#0c0614',34*a,.8*a)}
 line(s0[0],s0[1],s1[0],s1[1],c,30*a,.35*a,1);line(s0[0],s0[1],s1[0],s1[1],c,12*a,.9*a,1);line(s0[0],s0[1],s1[0],s1[1],c2,4*a,1,1);
 for(i=0;i<Q(10);i++){var u=rnd(i),pp=pt(f,40+520*k*u,(rnd(i+3)-.5)*40,40+(rnd(i+5)-.5)*40);part(E.k,pp[0],pp[1],4,c,a*.8,i,E.c2)}
 for(i=0;i<3;i++){var ring=pt(f,40+520*k*(i/3+.1),0,40);rg(ring[0],ring[1]+40,26,c,a*.5,2)}
 var h=pt(f,40+520*k,0,40);glow(h[0],h[1],54,c,.7*a);glow(h[0],h[1],26,'#ffffff',a);ico(h[0],h[1],40,F.ic,a,0,c);
 if(k>.85){var en=pt(f,560,0,0);impact(en[0],en[1],c,(k-.85)/.15*.6,1.1,E)}}}});

/* ================= PHÁP BẢO BỔN MỆNH ================= */
def('fb0',function(F){var c=F.col,E=el();return{life:64,draw:function(p){var f=F.f,k;
 if(p<.45)rune(0,0,80*Math.min(1,p/.2),c,.9,-fr*.1);
 for(k=0;k<8;k++){var an=k*PI/4,o=Math.min(1,p/.4),x0=Math.cos(an)*60*o,y0=-40+Math.sin(an)*20*o,x,y,rt;
  if(p<.45){x=x0;y=y0;rt=an}
  else{var q=ea((p-.45)/.55),e=pt(f,60+340*q,(k-3.5)*10,40);x=x0+(e[0]-x0)*q;y=y0+(e[1]-y0)*q;rt=f.A;trail([[x,y],[x-f.c*20*q,y-f.sn*10*q],[x-f.c*50*q,y-f.sn*25*q]],c,5,.8*(1-q))}
  glow(x,y,20,c,.8*fade(p,.8));ico(x,y,19,'🗡️',fade(p,.8),rt+PI/4);if(p>.95)impact(x,y+40,c,.5,.4,E)}}}});
def('fb1',function(F){var c=F.col,E=el();return{life:70,draw:function(p){
 rune(60,0,90*Math.min(1,p/.2),c,fade(p,.7)*.8,fr*.05);
 for(var k=0;k<4;k++){var q=(p-k*.06)/.8;if(q<=0||q>=1)continue;var e=pt(F.f,30+330*ea(q),(k-1.5)*46,0),b=Math.abs(Math.sin(q*16))*14;
  disc(e[0],e[1],20,'#000000',.3*(1-q));glow(e[0],e[1]-26-b,38,c,.5*fade(q,.7));ico(e[0],e[1]-18-b,32,'👹',fade(q,.7),0,c);
  part(E.k,e[0]-10+rnd(k+fr)*20,e[1]-4,4,c,.6*(1-q),k,E.c2);if(q>.9)impact(e[0],e[1],c,(q-.9)*10*.6,.5,E)}}}});
def('fb2',function(F){var c=F.col,E=el();return{life:74,draw:function(p){rune(0,0,70*Math.min(1,p/.15),c,fade(p,.6),-fr*.07);
 for(var k=0;k<5;k++){var q=(p-k*.05)/.75;if(q<=0||q>=1)continue;var r=rot(F.f,(k-2)*.34),tr=[],i;
  for(i=0;i<8;i++){var qq=Math.max(0,q-i*.03);tr.push(pt(r,40+330*ea(qq),Math.sin(qq*8+k)*16+Math.sin(i)*3,50+Math.sin(qq*6+k)*10))}
  trail(tr,c,7,.8*fade(q,.6));var h=tr[0];glow(h[0],h[1],28,c,.55*fade(q,.6));ico(h[0],h[1],28,'👻',fade(q,.6),0,c);if(q>.9)impact(h[0],h[1]+50,c,(q-.9)*10*.6,.5,E)}}}});
def('fb3',function(F){var c=F.col,E=el();return{life:66,draw:function(p){var e=pt(F.f,220,0,0),i;
 if(p<.4){var q=ea(p/.4);rune(e[0],e[1],110*q,c,.9,fr*.06);glow(e[0],e[1]-420*(1-q)-30,120+60*q,c,.5*q);ico(e[0],e[1]-420*(1-q)-30,120+40*q,'🪓',1,(1-q)*3,c);
  line(e[0],e[1]-420*(1-q)-30,e[0],e[1]-420*(1-q)-300,c,26,.3,1)}
 else{var q2=(p-.4)/.6,w=ea(q2);if(q2<.2)flash(c,.45*(1-q2/.2));
  ico(e[0],e[1]-48,140,'🪓',fade(q2,.5),0,c);rg(e[0],e[1],210*w,c,1-q2,7);rg(e[0],e[1],120*w,'#ffffff',.8*(1-q2),3);disc(e[0],e[1],170*w,c,.25*(1-q2));
  for(i=0;i<Q(10);i++){var an=i*TAU/10+.3,L=(40+190*w),xx=e[0]+Math.cos(an)*L,yy=e[1]+Math.sin(an)*L*.5;line(e[0]+Math.cos(an)*30*w,e[1]+Math.sin(an)*15*w,xx,yy,i%2?c:'#ffffff',3,.8*(1-q2),1)}
  for(i=0;i<Q(10);i++){var a2=rnd(i)*TAU,r2=rnd(i+9)*140*w,h2=Math.sin(Math.min(1,q2*1.6)*PI)*(50+50*rnd(i+3));g.save();g.globalAlpha=Math.max(0,1-q2);g.fillStyle='#3a2a1a';g.strokeStyle=c;g.beginPath();g.moveTo(e[0]+Math.cos(a2)*r2,e[1]+Math.sin(a2)*r2*.5-h2-8);g.lineTo(e[0]+Math.cos(a2)*r2+7,e[1]+Math.sin(a2)*r2*.5-h2+5);g.lineTo(e[0]+Math.cos(a2)*r2-6,e[1]+Math.sin(a2)*r2*.5-h2+6);g.closePath();g.fill();g.stroke();g.restore()}
  impact(e[0],e[1],c,Math.min(.99,q2),1.4,E)}}}});

/* ================= LINH CĂN ================= */
function flame(x,y,h,w,c,al,ph){if(h<4||al<=.01)return;g.save();g.globalCompositeOperation='lighter';
 var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,RGBA('#ff3a10',0));q.addColorStop(.5,RGBA(c,.55*Math.min(1,al)));q.addColorStop(1,RGBA('#fff0a0',.9*Math.min(1,al)));g.fillStyle=q;
 var s1=Math.sin(fr*.3+ph)*w*.3,s2=Math.sin(fr*.37+ph*2)*w*.3;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.9+s1,y-h*.55,x+s2,y-h);g.quadraticCurveTo(x+w*.9+s1,y-h*.55,x+w,y);g.closePath();g.fill();g.restore();glow(x,y-h*.2,w*1.5,c,al*.5)}
def('lc0',function(F){var c=F.col,E=el();return{life:66,draw:function(p){
 for(var k=0;k<5;k++){var q=(p-k*.1)/.5;if(q<=0||q>=1)continue;var e=pt(F.f,110+80*k,0,0),h=190*Math.sin(Math.min(1,q*1.4)*PI*.5),a=fade(q,.5),i;
  disc(e[0],e[1],36*Math.min(1,q*3),'#ff3a1a',.3*a);rune(e[0],e[1],50*Math.min(1,q*3),c,.7*a,q*4);
  flame(e[0],e[1],h,22,c,a,k);flame(e[0]-10,e[1],h*.7,14,'#ff7a2a',a,k+3);flame(e[0]+10,e[1],h*.6,12,'#ffb04a',a,k+6);
  for(i=0;i<5;i++){var u=(q*1.5+i/5)%1;glow(e[0]+(rnd(k*5+i)-.5)*50,e[1]-u*h*1.2,4,'#ffd060',a*(1-u))}
  if(q<.3)rg(e[0],e[1],54*q/.3,c,1-q/.3,3)}}}});
def('lc1',function(F){var c=F.col,E=el();return{life:70,draw:function(p){var a=fade(p,.7),m=pt(F.f,360,0,0);rune(m[0],m[1],90*ea(Math.min(1,p/.4)),c,a*.8,fr*.04);
 for(var v=0;v<3;v++){var r=rot(F.f,(v-1)*.4),k=ea(Math.min(1,p/.55)),prev=null,i;
  for(i=0;i<=16;i++){var u=i/16*k,e=pt(r,30+330*u,Math.sin(u*9+v)*16,Math.abs(Math.sin(u*5))*10);
   if(prev){line(prev[0],prev[1],e[0],e[1],'#1d6a2e',8*(1-u*.6),a);line(prev[0],prev[1],e[0],e[1],'#2f9a45',5*(1-u*.6),a);line(prev[0],prev[1],e[0],e[1],c,2,a*.9,1);if(i%4===0)line(e[0],e[1],e[0]+(rnd(i+v*9)-.5)*20,e[1]-14,c,2,a,1)}prev=e}
  if(prev){glow(prev[0],prev[1],20,c,.7*a);ico(prev[0],prev[1]-8,24,'🌿',a)}}
 if(p>.5){var z=ea((p-.5)*2);glow(m[0],m[1]-24,80*z,c,.45*a);ico(m[0],m[1]-24*z,44*z,'👹',a,0,c);impact(m[0],m[1],c,Math.min(.99,(p-.5)*2),.9,E)}}}});
def('lc2',function(F){var c=F.col,E=el();return{life:80,draw:function(p){var m=pt(F.f,150,0,0),a=fade(p,.75),k=ea(Math.min(1,p/.2)),i;
 disc(m[0],m[1],240*k,c,.12*a);rune(m[0],m[1],240*k,c,.5*a,fr*.02);
 for(i=0;i<5;i++){var cx=m[0]+(i-2)*90,cy=m[1]-250+Math.sin(i*2.1)*10;g.save();g.globalAlpha=.55*a*k;g.fillStyle='#10223a';g.beginPath();g.ellipse(cx,cy,70,26,0,0,TAU);g.fill();g.restore();glow(cx,cy+8,60,'#4a7fc0',.3*a*k)}
 if(fr%23<2)bolt(m[0]+(rnd(Math.floor(fr/23))-.5)*200,m[1]-240,m[0]+(rnd(Math.floor(fr/23)+7)-.5)*160,m[1]-10,'#bfe8ff',3,.9*a,fr,1);
 for(i=0;i<Q(34);i++){var u=((p*2.2+rnd(i))%1),an=rnd(i+3)*TAU,rr=Math.sqrt(rnd(i+8))*230*k,x=m[0]+Math.cos(an)*rr,y=m[1]+Math.sin(an)*rr*.5;
  line(x,y-260*(1-u),x-3,y-260*(1-u)+22,'#bfe8ff',2,a*.85,1);if(u>.92)rg(x,y,16*(u-.92)*12,c,1-(u-.92)*12,2)}
 rg(m[0],m[1],240*k,c,a,3,[10,6]);ico(m[0],m[1]-84,36,'💧',a,0,c)}}});
def('lc3',function(F){var c=F.col,E=el();return{life:50,draw:function(p){var a=fade(p,.6),b;
 for(b=0;b<2;b++){var q=ea(cl((p-b*.22)/.6)),L=b?-30:30,s0=pt(F.f,20,L,40),s1=pt(F.f,20+520*q,L,40),i;
  line(s0[0],s0[1],s1[0],s1[1],c,22,.3*a,1);line(s0[0],s0[1],s1[0],s1[1],c,9,.7*a,1);line(s0[0],s0[1],s1[0],s1[1],'#ffffff',4,.95*a,1);
  glow(s1[0],s1[1],42,c,a);glow(s1[0],s1[1],18,'#ffffff',a);ico(s1[0],s1[1],26,'🗡️',a,F.f.A+PI/4,c);
  for(i=0;i<Q(8);i++){var e=pt(F.f,20+520*q*rnd(i+b*7),L+(rnd(i+3)-.5)*30,40+(rnd(i+5)-.5)*40);part(E.k,e[0],e[1],5,c,.8*a,i,E.c2)}
  if(q>.9){var en=pt(F.f,540,L,0);impact(en[0],en[1],c,Math.min(.99,(q-.9)*10*(1-p)),.7,E)}}}}});
def('lc4',function(F){var c=F.col,E=el();return{life:72,draw:function(p){var a=fade(p,.7);
 for(var k=0;k<6;k++){var q=(p-k*.08)/.45;if(q<=0||q>=1)continue;var e=pt(F.f,60+68*k,Math.sin(k*1.3)*10,0),h=Math.sin(q*PI)*(44+k*9),last=k===5;
  disc(e[0],e[1],32,'#6b4a22',.45*a);rg(e[0],e[1],42*q+8,c,1-q,3);rune(e[0],e[1],38,c,.5*a,q*3);
  g.save();g.globalAlpha=a;for(var j=-1;j<=1;j++){var hh=h*(1-Math.abs(j)*.3),x=e[0]+j*13;g.fillStyle='#4a3216';g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();g.moveTo(x,e[1]-hh);g.lineTo(x+9,e[1]);g.lineTo(x-9,e[1]);g.closePath();g.fill();g.stroke()}g.restore();
  if(last){glow(e[0],e[1]-h,70,c,.5*a);ico(e[0],e[1]-h-10,64,'🐉',a,0,c)}
  for(var i=0;i<4;i++){var u=(q*1.4+i/4)%1;glow(e[0]+(rnd(k*4+i)-.5)*40,e[1]-u*70,4,'#ffd890',a*(1-u))}}}}});

/* ================= TRÚNG ĐÒN TRÊN QUÁI TIÊN GIỚI ================= */
var DLY={proj:14,multi:10,dash:4,ycL:8,lc3:8,lc1:10};
function hit(m,o,dmg,nt){
 if(!CF.enable||!m||!(dmg>0))return;
 var i,cr=false;if(nt)for(i=0;i<nt.length;i++)if(nt[i]&&nt[i].k){cr=true;break}
 var c0=(CUR&&o&&o.skill&&fr-CUR.fr<160)?CUR:null;
 for(i=IMP.length-1;i>=Math.max(0,IMP.length-6);i--)if(IMP[i].m===m&&IMP[i].t0===fr+(c0?(DLY[c0.t]||0):0))return;
 var h=60;try{if(typeof MS!=='undefined'&&MS[m.k])h=MS[m.k].h*.7}catch(e){}
 IMP.push({m:m,x:m.x,y:m.y,z:m.z||0,h:h,t0:fr+(c0?(DLY[c0.t]||0):0),life:cr?32:24,c:c0?c0.c:'#bff4ff',E:c0?c0.E:EL0,crit:cr,sl:!!(o&&o.sl),gen:!c0,sd:(m.id||0)*3.7+fr%97});
 while(IMP.length>CF.maxHit)IMP.shift()}
function hitFx(it,p){
 var c=it.c,E=it.E,cr=it.crit,a=1-p,sz=cr?1.5:1,e=ea(p),gy=it.h*.5,i,n=Q(cr?14:8),sd=it.sd;
 if(p<.12&&!it.nf)flash(c,.12*(1-p/.12)*(cr?1.6:1));
 glow(0,0,(40+46*e)*sz,c,.85*a);glow(0,0,24*sz*(1-p*.6),'#ffffff',a);
 if(it.sl||it.gen||E.k==='blade'){var an=(rnd(sd)-.5)*1.6-.5,L=70*sz*ea(Math.min(1,p*3)),u=fade(p,.4);
  line(-Math.cos(an)*L,-Math.sin(an)*L,Math.cos(an)*L,Math.sin(an)*L,c,9*sz*u,.6*u,1);line(-Math.cos(an)*L,-Math.sin(an)*L,Math.cos(an)*L,Math.sin(an)*L,'#ffffff',3*sz*u,u,1)}
 rg(0,gy,(16+60*e)*sz,c,a,3);
 if(E.k==='spark'){for(i=0;i<3;i++){var b=rnd(sd+i)*TAU;bolt(0,0,Math.cos(b)*(50+30*e)*sz,Math.sin(b)*(40+20*e)*sz,c,2,a,Math.floor(fr/2)*5+i*9,.8)}}
 for(i=0;i<n;i++){var an2=rnd(sd*10+i)*TAU,r=e*(26+64*rnd(sd+i+5))*sz,x=Math.cos(an2)*r,y=Math.sin(an2)*r*.7+(E.k==='fire'?-e*40:0)+(E.k==='ice'||E.k==='leaf'?e*e*26:-e*14*rnd(i));part(E.k==='spark'?'spark':E.k,x,y,4+3*rnd(sd+i),c,a,an2+p*4,E.c2)}
 if(cr){for(i=0;i<8;i++){var a3=i*PI/4+.3,L2=(34+78*e)*(i%2?.65:1);line(Math.cos(a3)*14,Math.sin(a3)*14,Math.cos(a3)*L2,Math.sin(a3)*L2,i%2?'#ffe27a':'#ffffff',(i%2?3:4.5)*a,a,1)}
  rg(0,gy,(20+90*e)*sz,'#ffe27a',a,3);star4(0,0,40*(1-p*.5),p*2,'#ffe27a',a)}}
function killFx(k,p){var a=1-p,e=ea(p),i;
 rg(0,0,(20+100*e),'#bff4ff',a,3);rg(0,0,(10+60*e),'#ffffff',a*.8,2);
 var uy=-e*86;glow(0,uy-16,28*(1-p*.4),'#bff4ff',.9*a);glow(0,uy-16,12,'#ffffff',a);
 trail([[0,uy-16],[0,uy-16+e*20],[0,uy-16+e*44]].reverse(),'#bff4ff',6,.6*a);
 for(i=0;i<Q(12);i++){var an=i*TAU/12,u=cl(p*1.3-rnd(i)*.2);glow(Math.cos(an)*u*50,Math.sin(an)*u*26-u*50-rnd(i+3)*20*u,4+3*rnd(i+2),i%2?'#bff4ff':'#ffe9a8',a)}
 star4(0,uy-16,18*(1-p),p*3,'#bff4ff',a)}
function slashKF(p){var a=1-p,u=ea(Math.min(1,p*2.5)),i;
 for(i=0;i<2;i++){var sgn=i?-1:1;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.lineCap='round';g.strokeStyle=i?'#7fd8ff':'#ffffff';g.lineWidth=(i?7:3)*a+1;g.beginPath();g.moveTo(-30*sgn,-22+i*8);g.quadraticCurveTo(0,-4*sgn,30*sgn*u,22+i*8);g.stroke();g.restore()}}
function drawAll(){
 var i,it,a,X,Y,p,list=window.TGQ&&window.TGQ.KF;
 for(i=IMP.length-1;i>=0;i--){it=IMP[i];if(fr<it.t0)continue;p=(fr-it.t0)/it.life;if(p>=1){IMP.splice(i,1);continue}
  a=TG.S2(it.x,it.y);X=a[0];Y=a[1]-(it.z+it.h*.5)*s;if(X<-170||X>W+170||Y<-250||Y>H+210)continue;
  g.save();g.translate(X,Y);g.scale(s,s);try{hitFx(it,p)}catch(e){}g.restore()}
 if(list)for(i=0;i<list.length;i++){it=list[i];a=TG.S2(it.wx,it.wy);X=a[0];Y=a[1]-(it.z+22)*s;if(X<-170||X>W+170||Y<-250||Y>H+210)continue;p=it.t/it.l;
  g.save();g.translate(X,Y);g.scale(s,s);try{if(it.sl)slashKF(p);else killFx(it,p)}catch(e){}g.restore()}}
var _h=hero;
hero=function(){
 var r=_h.apply(this,arguments);
 if(!tgOn()){if(IMP.length)IMP.length=0;return r}
 if(CF.enable||(window.TGQ&&window.TGQ.KF&&window.TGQ.KF.length)){try{drawAll()}catch(e){}}
 return r};
/* ---------- nút kỹ năng: viền sáng nhịp thở, tối khi hồi chiêu ---------- */
(function(){var c=document.createElement('style');
 c.textContent='#tg8-sk button{width:48px!important;height:48px!important;background:radial-gradient(circle at 50% 30%,rgba(90,76,130,.97),rgba(10,8,26,.97) 72%)!important;border-width:2px!important}'
 +'#tg8-sk button::before{content:"";position:absolute;inset:3px;border-radius:50%;border:1px solid rgba(255,255,255,.35);pointer-events:none}'
 +'#tg8-sk button::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 25%,rgba(255,255,255,.28),rgba(255,255,255,0) 55%);pointer-events:none}'
 +'#tg8-sk button:not(.cd):not(.lk){animation:tg8p 1.7s ease-in-out infinite}'
 +'#tg8-sk button.cd{opacity:1!important;filter:grayscale(.75) brightness(.55)}'
 +'#tg8-sk button.cd small{font-size:14px;font-weight:bold;bottom:auto;top:50%;transform:translateY(-50%);text-shadow:0 0 4px #000,0 0 8px #000}'
 +'#tg8-sk button.lk{filter:grayscale(1) brightness(.6)}'
 +'#tg8-sk button:active{transform:scale(.9)}'
 +'@keyframes tg8p{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4) saturate(1.2)}}';
 document.head.appendChild(c)})();
window.TGFX={on:function(){return !!(CF.enable&&tgOn())},hit:hit,imp:IMP,CF:CF,R:R,hitFx:hitFx,EL0:EL0,DLY:DLY,cur:function(){return CUR}};
})();
