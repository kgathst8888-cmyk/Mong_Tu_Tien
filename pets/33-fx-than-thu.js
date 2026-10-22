/* ===================================================================
   HIỆU ỨNG KỸ NĂNG THẦN THÚ — phong cách tiên hiệp (Fix423) — nạp SAU pets/32-bo-ky-nang-rieng.js
   Chỉ THÊM lớp hình ảnh bọc quanh PETKIT[0|2|3].skill: không đổi sát thương / hồi chiêu / cơ chế.
   Chu Tước không đổi.
   Bạch Hổ  : vòng pháp trận vàng, vệt chém trăng khuyết, tia sáng toả, ấn Liệp Sát, Phân Ảnh chém lớn.
   Thanh Long: xoáy gió, ruy-băng rồng bay, sét nổ cầu, cánh hoa mộc xoáy, mây bão + rồng sét.
   Huyền Vũ : sóng gợn + bọt, mảnh băng + tuyết, khiên mai rùa lục giác, xoáy nước Trấn Thiên.
   Tắt: xoá dòng script (hoặc đặt window.PETFX_OFF=true). Máy yếu: window.PETFX_LITE=true giảm số hạt.
   =================================================================== */
(function(){
'use strict';
if(!window.PETKIT||!window.PFH||typeof g==='undefined'||typeof glowDraw!=='function'){console.warn('[fx thần thú] thiếu engine, bỏ qua');return}
const sX=x=>(x-cam)*s,FXD=o=>window.PFH.fx(o);
const rnd=i=>{const q=Math.sin(i*127.1+3.7)*43758.5;return q-Math.floor(q)};
const ease=p=>1-Math.pow(1-p,3),fade=p=>p<.15?p/.15:p>.7?(1-p)/.3:1;
const LITE=()=>!!window.PETFX_LITE,N=n=>LITE()?Math.max(4,Math.round(n/2)):n;
const tg=(x,r,n)=>E.filter(e=>e.in<=0&&e.hp>0&&Math.abs(e.x-x)<r).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)).slice(0,n||4);
const later=(n,f)=>window.PFH.later(n,()=>{try{f()}catch(e){}});

/* ---- khối dựng hình ---- */
function rays(x,y,col,len,l,n){n=N(n||14);FXD({x,l,fn:(f,p,X,gy)=>{const a=1-p,R0=len*ease(p)*s,cx=sX(x),cy=gy-y*s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.globalAlpha=a;g.lineCap='round';
 for(let i=0;i<n;i++){const an=i*6.2832/n+rnd(i)*.3,r0=R0*.25,r1=R0*(.7+rnd(i+9)*.3);g.lineWidth=(i%2?1.6:3)*s*a+.4;g.beginPath();g.moveTo(cx+Math.cos(an)*r0,cy+Math.sin(an)*r0);g.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1);g.stroke()}
 glowDraw(cx,cy,R0*.35,col,.5*a);g.restore()}})}
function circ(x,y,R,col,l,flat,rev){FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p),cx=sX(x),cy=gy-y*s,rr=R*s*(.6+.4*ease(Math.min(1,p*2)));g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy);if(flat)g.scale(1,.3);g.rotate((rev?-1:1)*p*5);g.strokeStyle=col;g.globalAlpha=a*.85;g.lineWidth=2*s;
 g.beginPath();g.arc(0,0,rr,0,6.2832);g.stroke();g.lineWidth=1.2*s;g.beginPath();g.arc(0,0,rr*.82,0,6.2832);g.stroke();
 for(let i=0;i<24;i++){const an=i*.2618,c=Math.cos(an),n=Math.sin(an),k=i%3?.92:1.06;g.beginPath();g.moveTo(c*rr*.82,n*rr*.82);g.lineTo(c*rr*k,n*rr*k);g.stroke()}
 for(let t=0;t<2;t++){g.beginPath();for(let i=0;i<=3;i++){const an=i*2.0944+t*1.0472,c=Math.cos(an)*rr*.78,n=Math.sin(an)*rr*.78;i?g.lineTo(c,n):g.moveTo(c,n)}g.stroke()}
 g.restore()}})}
function cres(x,y,R,rot,col,l,w){FXD({x,l,fn:(f,p,X,gy)=>{const u=Math.min(1,p*2.2),a=p<.5?1:(1-p)/.5,cx=sX(x),cy=gy-y*s;g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy);g.rotate(rot);g.strokeStyle=col;g.lineCap='round';
 const a0=-1.2,a1=a0+2.4*u;for(let k=0;k<10;k++){const t0=a0+(a1-a0)*k/10,t1=a0+(a1-a0)*(k+1)/10;g.globalAlpha=a*(k+1)/10*.28;g.lineWidth=((w||9)*(k+1)/10)*s*2.4;g.beginPath();g.arc(0,0,R*s,t0,t1);g.stroke();g.globalAlpha=a*(k+1)/10;g.lineWidth=((w||9)*(k+1)/10)*s;g.beginPath();g.arc(0,0,R*s,t0,t1);g.stroke()}
 g.restore()}})}
function spiral(x,y0,y1,col,l,R,n,col2){n=N(n);FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p);g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const t=(p*1.3+i/n)%1,an=t*11+i*2.1,rr=R*(1-.35*t),px=sX(x+Math.cos(an)*rr),py=gy-(y0+(y1-y0)*t+Math.sin(an)*rr*.18)*s;glowDraw(px,py,(3+rnd(i)*3)*s,i%2||!col2?col:col2,.75*a*(1-t*.5))}
 g.restore()}})}
function ribbon(x0,x1,y,col,col2,l,amp){FXD({x:x0,l,fn:(f,p,X,gy)=>{const u=Math.min(1,p*1.15),a=p>.75?(1-p)/.25:1,M=34;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 const pt=t=>[sX(x0+(x1-x0)*t),gy-(y+Math.sin(t*9+p*14)*amp+Math.sin(t*3.1)*amp*.5)*s];
 for(let i=0;i<M;i++){const t=Math.max(0,u-i*.018),q=pt(t),k=1-i/M;g.globalAlpha=a*k;g.fillStyle=i%3?col:col2;g.beginPath();g.arc(q[0],q[1],(2+9*k)*s,0,6.2832);g.fill();if(i%2==0)glowDraw(q[0],q[1],(7+15*k)*s,col,.3*a*k)}
 const h=pt(u);glowDraw(h[0],h[1],18*s,'#ffffff',.8*a);g.restore()}})}
function hex(x,y,R,col,l){FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p),cx=sX(x),cy=gy-y*s,r=R*s,h=15*s,hh=h*.866;g.save();g.globalCompositeOperation='lighter';g.beginPath();g.arc(cx,cy,r,0,6.2832);g.clip();
 const gr=g.createRadialGradient(cx,cy,r*.4,cx,cy,r);gr.addColorStop(0,'rgba(120,200,255,0)');gr.addColorStop(1,RGBA(col,.35*a));g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);
 g.strokeStyle=col;g.lineWidth=1.3*s;
 for(let j=-Math.ceil(r/hh/1.5);j<=Math.ceil(r/hh/1.5);j++)for(let i=-Math.ceil(r/h/1.6);i<=Math.ceil(r/h/1.6);i++){const px=cx+(i*1.5*h),py=cy+(j*2*hh+(i&1?hh:0));if(Math.hypot(px-cx,py-cy)>r)continue;g.globalAlpha=a*(.25+.6*Math.abs(Math.sin(p*9+i*.7+j*1.3)));g.beginPath();for(let k=0;k<6;k++){const an=k*1.0472;k?g.lineTo(px+Math.cos(an)*h*.9,py+Math.sin(an)*h*.9):g.moveTo(px+Math.cos(an)*h*.9,py+Math.sin(an)*h*.9)}g.closePath();g.stroke()}
 g.restore();g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.8;g.strokeStyle=col;g.lineWidth=2.2*s;g.beginPath();g.arc(cx,cy,r,0,6.2832);g.stroke();g.restore()}})}
function cloud(x,y,w,l){FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p),cx=sX(x),cy=gy-y*s;g.save();
 for(let i=0;i<9;i++){const px=cx+(i-4)*w*s/8+Math.sin(p*3+i)*8*s,r=(46+rnd(i)*30)*s,gr=g.createRadialGradient(px,cy,0,px,cy,r);gr.addColorStop(0,'rgba(50,40,100,'+(.6*a)+')');gr.addColorStop(1,'rgba(30,20,70,0)');g.fillStyle=gr;g.beginPath();g.arc(px,cy+Math.sin(i*2)*10*s,r,0,6.2832);g.fill()}
 if(Math.floor(p*60)%9<2){g.globalCompositeOperation='lighter';glowDraw(cx+(rnd(Math.floor(p*60))-.5)*w*s,cy,70*s,'#cfd8ff',.35*a)}
 g.restore()}})}
function snow(x,w,l,col){const n=N(34);FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p);g.save();g.globalCompositeOperation='lighter';g.fillStyle=col;
 for(let i=0;i<n;i++){const t=(p*1.1+rnd(i))%1,px=sX(x+(rnd(i+5)-.5)*w)+Math.sin(t*6+i)*10*s,py=gy-(300-t*290)*s;g.globalAlpha=a*.85;g.beginPath();g.arc(px,py,(1.5+rnd(i+2)*2.2)*s,0,6.2832);g.fill()}
 g.restore()}})}
function vortex(x,y,R,col,l){FXD({x,l,fn:(f,p,X,gy)=>{const a=fade(p),cx=sX(x),cy=gy-y*s;g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy);g.scale(1,.45);g.rotate(p*9);g.strokeStyle=col;g.lineCap='round';
 for(let arm=0;arm<4;arm++){g.globalAlpha=a*.8;g.lineWidth=(4-arm*.5)*s;g.beginPath();for(let i=0;i<=30;i++){const t=i/30,an=arm*1.5708+t*5.5,rr=R*s*(1-t)*(.35+.65*ease(Math.min(1,p*2)));i?g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):g.moveTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.stroke()}
 g.restore()}})}

/* ---- lớp hiệu ứng theo từng kỹ năng ---- */
const GOLD='#ffe9a0',ICE='#bfe6ff',WHT='#ffffff';
const FX0={   /* Bạch Hổ */
 0:(ev,x)=>{circ(x,0,200+ev*30,GOLD,40,true);rays(x,60,GOLD,150+ev*10,22,16);later(5,()=>rays(x,60,WHT,110,20,12))},
 1:(ev,x)=>{tg(x,420,3+ev).forEach((e,i)=>{later(8+i*4,()=>{cres(e.x,62,70,-.7,ICE,16,10);cres(e.x,62,70,.7,WHT,16,10)});later(16+i*4,()=>rays(e.x,60,WHT,70,14,10))})},
 2:(ev,x)=>{const c=tg(x,450,12);if(!c.length)return;const e=c.reduce((a,b)=>b.hp/Math.max(1,b.max||b.hp)<a.hp/Math.max(1,a.max||a.hp)?b:a);
  circ(e.x,70,64,GOLD,46,false);circ(e.x,0,90,GOLD,46,true,true);later(8,()=>{cres(e.x,70,130,-.95,WHT,16,16);cres(e.x,70,100,.5,GOLD,16,10)});later(14,()=>rays(e.x,60,GOLD,160,24,18))},
 3:(ev,x,big)=>{circ(P.x,60,130,GOLD,big?80:80,false);circ(P.x,0,big?260:240,ICE,big?80:80,true,true);rays(P.x,70,GOLD,200,26,18);
  const n=big?5:9;for(let i=0;i<n;i++)later(18+i*(big?26:50),()=>{const q=tg(P.x,520,5);if(!q.length)return;const e=q[(rnd(i+Math.floor(fr))*q.length)|0];cres(e.x,70,110,(rnd(i)-.5)*2.4,i%2?ICE:GOLD,14,12);rays(e.x,60,WHT,70,12,8)})}
};
const FX2={   /* Thanh Long */
 0:(ev,x)=>{const d=EP.d||1,L=300+ev*40;ribbon(x+d*30,x+d*(L+60),50,'#bfe9ff','#ffffff',34,10);later(3,()=>ribbon(x+d*30,x+d*(L+60),80,'#8fe0e8','#ffffff',34,12));later(6,()=>ribbon(x+d*30,x+d*(L+60),28,'#bfe9ff','#e8ffd8',34,8));spiral(x+d*140,10,100,'#bfe9ff',44,40,16,'#ffffff')},
 1:(ev,x)=>{const t=tg(x,420,3+ev);rays(x,(EP.y||0)+40,'#ffd870',70,14,10);t.forEach((e,i)=>later(4+i*5,()=>{rays(e.x,52,'#ffd870',100,16,12);circ(e.x,52,46,'#4fe0e8',22,false)}))},
 2:(ev,x)=>{circ(P.x,0,110,'#8fe8a0',300,true);circ(P.x,70,60,'#e8ffd8',300,false,true);spiral(P.x,0,130,'#8fe8a0',300,46,26,'#e8ffd8')},
 3:(ev,x,big)=>{const cx=P.x;cloud(cx,260,640,big?130:560);ribbon(cx-340,cx+340,220,'#4fe0e8','#b8a8ff',70,34);if(!big){later(200,()=>ribbon(cx+340,cx-340,200,'#b8a8ff','#ffffff',70,40));later(400,()=>ribbon(cx-340,cx+340,230,'#4fe0e8','#ffffff',70,34))}
  circ(cx,0,big?300:360,'#b8a8ff',big?90:120,true)}
};
const FX3={   /* Huyền Vũ */
 0:(ev,x)=>{circ(P.x,0,110,'#9fe0ff',50,true);circ(P.x,0,160,'#e6f7ff',54,true,true);spiral(P.x,0,100,'#9fe0ff',60,40,20,'#e6f7ff')},
 1:(ev,x)=>{tg(x,350+ev*28,2+ev*2).forEach((e,i)=>later(4+i*3,()=>{rays(e.x,40,'#e6f7ff',100,24,14);snow(e.x,90,44,'#e6f7ff')}))},
 2:(ev,x)=>{hex(P.x,70,100+ev*4,'#9fe0ff',360);circ(P.x,0,125,'#59a0ff',360,true)},
 3:(ev,x)=>{vortex(P.x+(P.d||1)*130,50,280,'#9fe0ff',80);circ(P.x,0,330,'#ffffff',60,true);snow(P.x,560,120,'#e6f7ff');later(10,()=>vortex(P.x+(P.d||1)*130,50,200,'#59a0ff',70))}
};
const FX4_3=(ev,x)=>{hex(P.x,70,125,'#ffd36a',480);circ(P.x,0,140,'#ffd36a',480,true);rays(P.x,70,'#fff0b8',200,26,16)};

function wrap(K,map,big){const o=K.skill;K.skill=function(ev,x,M,p,sn){o.apply(this,arguments);
 if(window.PETFX_OFF)return;try{const f=sn==4?(big?big:map[3]):map[sn];if(f)f(ev,x,sn==4)}catch(e){console.error('[fx thần thú]',e)}}}
wrap(PETKIT[0],FX0);wrap(PETKIT[2],FX2);wrap(PETKIT[3],FX3,FX4_3);
if(typeof PTG!=='undefined')PTG.skill=PETKIT[0].skill;   /* Bạch Hổ gọi PTG.skill theo thuộc tính */
window.PETFX={circ,rays,cres,spiral,ribbon,hex,cloud,snow,vortex};
})();
