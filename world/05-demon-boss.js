
/*==== MA THẦN v2: thiết kế lại Boss + bản đồ "Huyết Nguyệt Ma Điện" (theo ảnh mẫu Gemini) ====
  - Boss vẽ bằng canvas: cánh dơi + giáp đen chạm rune cam + kiếm khổng lồ, vung kiếm linh hoạt (combo 1-3 nhát, 3 kiểu chém)
  - 2 kỹ năng: 🌙 Huyết Nguyệt Trảm (sóng kiếm) và 🔥 Ma Phù Hỏa Ngục (trụ lửa tím nổ theo vòng cảnh báo)
  - Chỉnh độ khó ở MT2 bên dưới: máu ×0.75 (giảm 1/4), thủ ×2/3 (giảm 1/3), sát thương ×1.3 (tăng 30%) */
(function(){
const MT2={hp:.75,df:2/3,atk:1.3};
let WINC='255,140,50',RUNC='#ff3a1a',RUNG='#ff2a10',PILC=['#08040a','#1f1118','#0a0509'],CC1='#d8c2ff',CC2='#8a50ff';
window.MT2=MT2;
const TAU=Math.PI*2,rnd=Math.random,Q=2,BK=.72,SK=.86,REST=.75;
const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>{t=cl(t,0,1);return t*t*(3-2*t)},eo=t=>{t=cl(t,0,1);return 1-(1-t)*(1-t)},ei=t=>{t=cl(t,0,1);return t*t};
const mkc=(w,h)=>{const o=document.createElement('canvas');o.width=Math.ceil(w);o.height=Math.ceil(h);return o};
function srand(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function rune(ct,x,y,sz,seed){const r=srand(seed*977+13);ct.beginPath();ct.moveTo(x,y-sz);ct.lineTo(x,y+sz);const n=1+Math.floor(r()*3);for(let i=0;i<n;i++){const yy=y+(r()*2-1)*sz*.7,d=r()<.5?-1:1,l=sz*(.4+r()*.5),k=r()<.5?-1:1;ct.moveTo(x,yy);ct.lineTo(x+d*l,yy+k*l*.8)}ct.stroke()}
const glowOn=(ct,col,b)=>{ct.shadowColor=col;ct.shadowBlur=b},glowOff=ct=>{ct.shadowBlur=0};
function poly(ct,pts){ct.beginPath();pts.forEach((p,i)=>i?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]));ct.closePath()}
function ring(ct,r,lw){ct.lineWidth=lw;ct.beginPath();ct.arc(0,0,r,0,TAU);ct.stroke()}

/* ---------- SPRITE: cánh ---------- */
function buildWing(){
 const OX=24,OY=262,w=272,h=330,cv=mkc(w*Q,h*Q),ct=cv.getContext('2d');ct.scale(Q,Q);ct.translate(OX,OY);
 const Wr={x:62,y:-64},fing=[[-1.22,195],[-.74,208],[-.26,185],[.26,135]],tips=fing.map(f=>({x:Wr.x+Math.cos(f[0])*f[1],y:Wr.y+Math.sin(f[0])*f[1]})),bd={x:8,y:50};
 const mem=new Path2D();mem.moveTo(0,0);mem.lineTo(Wr.x,Wr.y);mem.lineTo(tips[0].x,tips[0].y);
 for(let i=1;i<4;i++){const a=tips[i-1],b=tips[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;mem.quadraticCurveTo(mx+(Wr.x-mx)*.4,my+(Wr.y-my)*.4,b.x,b.y)}
 {const a=tips[3],mx=(a.x+bd.x)/2,my=(a.y+bd.y)/2;mem.quadraticCurveTo(mx+(Wr.x-mx)*.3,my+(Wr.y-my)*.3,bd.x,bd.y)}
 mem.closePath();
 let q=ct.createLinearGradient(0,0,tips[2].x,tips[2].y);q.addColorStop(0,'#58306a');q.addColorStop(.55,'#331848');q.addColorStop(1,'#1c0c2c');ct.fillStyle=q;ct.fill(mem);
 ct.save();ct.clip(mem);
 const nb=ct.createRadialGradient(165,-110,4,165,-110,95);nb.addColorStop(0,'rgba(130,80,220,.4)');nb.addColorStop(1,'rgba(60,20,120,0)');ct.fillStyle=nb;ct.fillRect(0,-260,260,320);
 const r=srand(11);for(let i=0;i<90;i++){ct.globalAlpha=.15+r()*.5;ct.fillStyle=r()<.5?'#cbb4ff':'#ffd9a0';ct.beginPath();ct.arc(r()*250,-250+r()*310,.5+r()*1.2,0,TAU);ct.fill()}
 ct.restore();ct.globalAlpha=1;
 const bone=(x1,y1,x2,y2,w1)=>{ct.lineCap='round';ct.strokeStyle='#0b050f';ct.lineWidth=w1+3;ct.beginPath();ct.moveTo(x1,y1);ct.lineTo(x2,y2);ct.stroke();ct.strokeStyle='#2a1a34';ct.lineWidth=w1;ct.stroke();ct.save();glowOn(ct,'#ff5a10',7);ct.strokeStyle='#ff9a3a';ct.lineWidth=1.6;ct.stroke();ct.restore()};
 bone(0,0,Wr.x,Wr.y,7);tips.forEach(t=>bone(Wr.x,Wr.y,t.x,t.y,5));
 ct.lineWidth=1.5;ct.strokeStyle='#ffb35a';glowOn(ct,'#ff6a10',6);
 tips.forEach((t,i)=>{const ang=Math.atan2(t.y-Wr.y,t.x-Wr.x);for(let j=1;j<=3;j++){const f=.22+j*.2,px=Wr.x+(t.x-Wr.x)*f,py=Wr.y+(t.y-Wr.y)*f;ct.save();ct.translate(px,py);ct.rotate(ang+Math.PI/2);rune(ct,0,0,6,i*5+j);ct.restore()}});
 glowOff(ct);ct.strokeStyle='rgba(255,150,60,.75)';ct.lineWidth=2;ct.stroke(mem);
 ct.fillStyle='#0b050f';tips.forEach(t=>{const ang=Math.atan2(t.y-Wr.y,t.x-Wr.x),cs=Math.cos(ang),sn=Math.sin(ang);ct.beginPath();ct.moveTo(t.x-sn*3,t.y+cs*3);ct.lineTo(t.x+cs*16,t.y+sn*16);ct.lineTo(t.x+sn*3,t.y-cs*3);ct.fill()});
 return{cv,OX,OY,w,h}
}

/* ---------- SPRITE: thân + đầu + chân (tĩnh) ---------- */
function buildBody(){
 const OX=130,OY=312,w=260,h=324,cv=mkc(w*Q,h*Q),ct=cv.getContext('2d');ct.scale(Q,Q);ct.translate(OX,OY);ct.lineJoin='round';ct.lineCap='round';
 const fillP=(pts,c1,c2,y1,y2,edge)=>{const q=ct.createLinearGradient(0,y1,0,y2);q.addColorStop(0,c1);q.addColorStop(1,c2);poly(ct,pts);ct.fillStyle=q;ct.fill();ct.lineWidth=1.6;ct.strokeStyle=edge||'#07040a';ct.stroke()};
 const rl=(pts,lw,blur)=>{ct.save();glowOn(ct,'#ff5a10',blur||6);ct.strokeStyle='#ff9a3a';ct.lineWidth=lw||1.6;ct.beginPath();pts.forEach((p,i)=>i?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]));ct.stroke();ct.restore()};
 // áo choàng rách
 let q=ct.createLinearGradient(0,-200,0,-8);q.addColorStop(0,'#33201a');q.addColorStop(1,'#0e0709');ct.fillStyle=q;
 ct.beginPath();ct.moveTo(-44,-196);ct.quadraticCurveTo(-80,-120,-72,-30);
 [[-72,-30],[-60,-6],[-47,-34],[-35,-2],[-21,-30],[-8,-5],[6,-32],[18,-1],[32,-30],[46,-7],[58,-34],[72,-28]].forEach(z=>ct.lineTo(z[0],z[1]));
 ct.quadraticCurveTo(80,-120,44,-196);ct.closePath();ct.fill();ct.strokeStyle='#070307';ct.lineWidth=1.5;ct.stroke();
 ct.fillStyle='#ff8a30';{const r=srand(5);for(let i=0;i<14;i++){ct.globalAlpha=.4+r()*.5;ct.beginPath();ct.arc(-66+r()*132,-40+r()*34,.8+r()*1.1,0,TAU);ct.fill()}ct.globalAlpha=1}
 // chân
 for(const sd of[-1,1]){
  fillP([[sd*5,-138],[sd*31,-138],[sd*29,-80],[sd*9,-80]],'#41394d','#1b1522',-138,-80);
  fillP([[sd*28,-94],[sd*50,-80],[sd*28,-66]],'#4a4256','#1b1522',-94,-66);
  fillP([[sd*9,-80],[sd*29,-80],[sd*25,-26],[sd*11,-26]],'#3a3344','#15101c',-80,-26);
  fillP([[sd*8,-30],[sd*28,-30],[sd*31,-12],[sd*22,3],[sd*14,3],[sd*8,-10]],'#2e2738','#120d17',-30,3);
  fillP([[sd*13,0],[sd*18,13],[sd*23,0]],'#2e2738','#0a060d',0,13);
  rl([[sd*19,-76],[sd*18,-34]],1.8);rl([[sd*30,-136],[sd*28,-84]],1.2,4);
  ct.strokeStyle='rgba(150,135,175,.6)';ct.lineWidth=1;ct.beginPath();ct.moveTo(sd*30,-136);ct.lineTo(sd*29,-82);ct.stroke()
 }
 // tay phụ (bên sau) buông xuống + vuốt
 {const sh=[-50,-190],el=[-64,-158],wr=[-60,-124];
  ct.lineCap='round';ct.strokeStyle='#07040a';ct.lineWidth=18;ct.beginPath();ct.moveTo(sh[0],sh[1]);ct.lineTo(el[0],el[1]);ct.lineTo(wr[0],wr[1]);ct.stroke();
  ct.strokeStyle='#2e2838';ct.lineWidth=14;ct.stroke();rl([[sh[0]-1,sh[1]+4],[el[0],el[1]],[wr[0],wr[1]-6]],1.4,4);
  fillP([[-72,-130],[-48,-130],[-46,-108],[-74,-108]],'#40384c','#17121e',-130,-108);
  ct.strokeStyle='#14101a';ct.lineWidth=4.2;[[-70,-108,-76,-88],[-60,-108,-62,-84],[-50,-108,-46,-87]].forEach(c=>{ct.beginPath();ct.moveTo(c[0],c[1]);ct.quadraticCurveTo(c[0]+(c[2]-c[0])*.2,c[1]+14,c[2],c[3]);ct.stroke()})}
 // thân giáp
 fillP([[-46,-200],[46,-200],[40,-166],[28,-138],[-28,-138],[-40,-166]],'#40384c','#17121f',-200,-138);
 poly(ct,[[-17,-200],[17,-200],[0,-168]]);ct.fillStyle='#0b070f';ct.fill();
 ct.strokeStyle='#07040a';ct.lineWidth=2;ct.beginPath();ct.moveTo(0,-168);ct.lineTo(0,-142);ct.stroke();
 ct.strokeStyle='rgba(150,135,175,.5)';ct.lineWidth=1;ct.beginPath();ct.moveTo(-40,-166);ct.lineTo(-18,-186);ct.moveTo(40,-166);ct.lineTo(18,-186);ct.stroke();
 {const gq=ct.createRadialGradient(0,-162,2,0,-162,28);gq.addColorStop(0,'rgba(255,150,50,.65)');gq.addColorStop(1,'rgba(255,100,20,0)');ct.save();ct.globalCompositeOperation='lighter';ct.fillStyle=gq;ct.beginPath();ct.arc(0,-162,28,0,TAU);ct.fill();ct.restore();
  ct.save();glowOn(ct,'#ff5a10',8);ct.strokeStyle='#ffb050';ct.lineWidth=1.8;ct.beginPath();ct.arc(0,-162,9,0,TAU);ct.stroke();rune(ct,0,-162,5.5,7);ct.restore()}
 rl([[-34,-190],[-30,-146]],1.4,4);rl([[34,-190],[30,-146]],1.4,4);
 fillP([[-28,-141],[28,-141],[28,-130],[-28,-130]],'#2a2332','#120d17',-141,-130);
 ct.fillStyle='#7a6a52';ct.beginPath();ct.arc(0,-135.5,7,0,TAU);ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.stroke();ct.fillStyle='#120d17';ct.beginPath();ct.arc(-2.5,-136,1.6,0,TAU);ct.arc(2.5,-136,1.6,0,TAU);ct.fill();
 for(const sd of[-1,1])fillP([[sd*24,-131],[sd*42,-124],[sd*38,-92],[sd*22,-100]],'#363040','#15101b',-131,-92);
 ct.save();ct.strokeStyle='#9a9aa8';ct.lineWidth=2.4;ct.setLineDash([3.4,2.4]);ct.beginPath();ct.moveTo(-40,-194);ct.quadraticCurveTo(-4,-152,32,-138);ct.stroke();ct.restore();
 // giáp vai gai
 for(const sd of[-1,1]){
  fillP([[sd*40,-206],[sd*50,-234],[sd*57,-208]],'#3e3648','#14101a',-234,-206);
  fillP([[sd*55,-208],[sd*76,-228],[sd*72,-200]],'#3e3648','#14101a',-228,-200);
  fillP([[sd*68,-196],[sd*92,-198],[sd*72,-182]],'#3e3648','#14101a',-198,-182);
  ct.beginPath();ct.moveTo(sd*34,-190);ct.quadraticCurveTo(sd*52,-216,sd*72,-190);ct.quadraticCurveTo(sd*52,-178,sd*34,-190);ct.closePath();
  q=ct.createLinearGradient(0,-212,0,-182);q.addColorStop(0,'#4b4358');q.addColorStop(1,'#19131f');ct.fillStyle=q;ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.8;ct.stroke();
  rl([[sd*38,-192],[sd*52,-206],[sd*68,-192]],1.5,5)
 }
 // cổ + đầu
 ct.fillStyle='#2e1d44';ct.fillRect(-9,-214,18,18);
 q=ct.createRadialGradient(0,-232,2,0,-228,26);q.addColorStop(0,'#7a5aa2');q.addColorStop(1,'#2a1940');ct.fillStyle=q;ct.beginPath();ct.ellipse(0,-228,19,23,0,0,TAU);ct.fill();ct.strokeStyle='#0c0614';ct.lineWidth=1.4;ct.stroke();
 poly(ct,[[-14,-216],[0,-201],[14,-216]]);ct.fillStyle='#241538';ct.fill();ct.stroke();
 poly(ct,[[-19,-238],[19,-238],[15,-228],[-15,-228]]);ct.fillStyle='rgba(10,5,20,.55)';ct.fill();
 for(const sd of[-1,1]){
  ct.save();ct.translate(sd*8,-231);ct.rotate(sd*.3);glowOn(ct,'#c060ff',10);ct.fillStyle='#f6d8ff';ct.beginPath();ct.ellipse(0,0,5.2,2.2,0,0,TAU);ct.fill();ct.restore();
  ct.strokeStyle='#ff9a3a';ct.lineWidth=1.2;ct.beginPath();ct.moveTo(sd*15,-226);ct.lineTo(sd*18,-220);ct.stroke()
 }
 ct.strokeStyle='#0c0614';ct.lineWidth=1.6;ct.beginPath();ct.moveTo(-8,-215);ct.lineTo(8,-215);ct.stroke();
 ct.fillStyle='#ddd4e6';[[-5,-215],[5,-215]].forEach(p=>{ct.beginPath();ct.moveTo(p[0]-1.8,p[1]);ct.lineTo(p[0],p[1]+4.5);ct.lineTo(p[0]+1.8,p[1]);ct.fill()});
 for(const sd of[-1,1]){
  ct.beginPath();ct.moveTo(sd*13,-244);ct.bezierCurveTo(sd*40,-252,sd*47,-270,sd*30,-296);ct.bezierCurveTo(sd*32,-270,sd*22,-258,sd*10,-250);ct.closePath();
  q=ct.createLinearGradient(sd*13,-244,sd*34,-296);q.addColorStop(0,'#1a0f26');q.addColorStop(.5,'#4e3e66');q.addColorStop(1,'#120a1c');ct.fillStyle=q;ct.fill();ct.strokeStyle='#08050c';ct.lineWidth=1.3;ct.stroke();
  ct.strokeStyle='rgba(190,150,255,.45)';ct.lineWidth=1;ct.beginPath();ct.moveTo(sd*15,-247);ct.bezierCurveTo(sd*38,-255,sd*43,-270,sd*30,-292);ct.stroke()
 }
 poly(ct,[[-18,-246],[-12,-263],[-6,-250],[0,-272],[6,-250],[12,-263],[18,-246]]);ct.fillStyle='#2c2436';ct.fill();ct.strokeStyle='#08060c';ct.lineWidth=1.4;ct.stroke();
 ct.save();glowOn(ct,'#ff7a20',8);ct.fillStyle='#ffb050';ct.beginPath();ct.arc(0,-251,3,0,TAU);ct.fill();ct.restore();
 return{cv,OX,OY,w,h}
}

/* ---------- SPRITE: kiếm (hướng +x, cán ở gốc) ---------- */
function buildSword(){
 const OX=46,OY=48,w=290,h=96,cv=mkc(w*Q,h*Q),ct=cv.getContext('2d');ct.scale(Q,Q);ct.translate(OX,OY);ct.lineJoin='round';ct.lineCap='round';
 const top=[[8,-15],[40,-23],[50,-17],[78,-26],[92,-19],[122,-25],[136,-17],[166,-19],[188,-12],[226,0]],bot=[[8,15],[36,22],[48,16],[74,24],[88,17],[114,22],[130,15],[160,16],[184,10]];
 const bl=new Path2D();top.forEach((p,i)=>i?bl.lineTo(p[0],p[1]):bl.moveTo(p[0],p[1]));bot.slice().reverse().forEach(p=>bl.lineTo(p[0],p[1]));bl.closePath();
 // cán
 ct.fillStyle='#1b1520';ct.fillRect(-30,-4.5,32,9);ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.strokeRect(-30,-4.5,32,9);ct.strokeStyle='#76644a';ct.lineWidth=1.3;for(let x=-27;x<0;x+=5){ct.beginPath();ct.moveTo(x,-4.5);ct.lineTo(x+3,4.5);ct.stroke()}
 ct.fillStyle='#2c2430';ct.beginPath();ct.arc(-34,0,7,0,TAU);ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.stroke();ct.fillStyle='#ff8a30';ct.beginPath();ct.arc(-34,0,2.4,0,TAU);ct.fill();
 // lưỡi
 let q=ct.createLinearGradient(8,0,226,0);q.addColorStop(0,'#17111e');q.addColorStop(.5,'#34293f');q.addColorStop(1,'#1a1322');ct.fillStyle=q;ct.fill(bl);
 ct.save();glowOn(ct,'#ff5a10',14);ct.strokeStyle='rgba(255,125,45,.85)';ct.lineWidth=2.2;ct.stroke(bl);ct.restore();
 ct.strokeStyle='#07040a';ct.lineWidth=7;ct.beginPath();ct.moveTo(14,0);ct.lineTo(212,0);ct.stroke();
 ct.save();ct.strokeStyle='#ffb050';ct.lineWidth=1.9;glowOn(ct,'#ff6a10',7);for(let i=0;i<8;i++)rune(ct,32+i*24,0,8,i+3);ct.restore();
 ct.strokeStyle='rgba(150,130,175,.55)';ct.lineWidth=1;ct.beginPath();top.forEach((p,i)=>i?ct.lineTo(p[0],p[1]+1.5):ct.moveTo(p[0],p[1]+1.5));ct.stroke();
 // chắn kiếm dạng vuốt
 for(const sd of[-1,1]){poly(ct,[[-2,sd*10],[10,sd*17],[17,sd*37],[6,sd*28],[-1,sd*23],[-8,sd*14]]);ct.fillStyle='#262029';ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.5;ct.stroke();ct.save();glowOn(ct,'#ff5a10',6);ct.strokeStyle='#ff8a30';ct.lineWidth=1.2;ct.beginPath();ct.moveTo(3,sd*12);ct.lineTo(13,sd*30);ct.stroke();ct.restore()}
 q=ct.createRadialGradient(4,0,1,4,0,6);q.addColorStop(0,'#fff0c0');q.addColorStop(.5,'#ff9030');q.addColorStop(1,'#a02000');ct.save();glowOn(ct,'#ff6a10',9);ct.fillStyle=q;ct.beginPath();ct.arc(4,0,5.4,0,TAU);ct.fill();ct.restore();
 return{cv,OX,OY,w,h}
}
let SP=null;const sp=()=>SP||(SP={wing:buildWing(),body:buildBody(),sword:buildSword()});
MT2._sp=sp;

/* ---------- Vòng ma pháp (dùng cho nền + kỹ năng) ---------- */
let CIR=null;
function circleSprite(){
 const R0=256,S=R0*2+40,cO=mkc(S,S),cI=mkc(S,S);
 [[cO,0],[cI,1]].forEach(a=>{const ct=a[0].getContext('2d');ct.translate(S/2,S/2);ct.lineCap='round';ct.strokeStyle=CC1;ct.shadowColor=CC2;ct.shadowBlur=10;
  if(!a[1]){ring(ct,248,2.6);ring(ct,236,1.4);ring(ct,196,2);ring(ct,184,1);
   ct.lineWidth=1.2;for(let i=0;i<96;i++){const an=i/96*TAU,r2=i%4?242:248;ct.beginPath();ct.moveTo(Math.cos(an)*236,Math.sin(an)*236);ct.lineTo(Math.cos(an)*r2,Math.sin(an)*r2);ct.stroke()}
   for(let i=0;i<24;i++){ct.save();ct.rotate(i/24*TAU);ct.translate(0,-215);ct.lineWidth=1.8;rune(ct,0,0,10,i+1);ct.restore()}
  }else{ring(ct,170,2.4);ring(ct,64,1.6);ring(ct,150,1);
   ct.lineWidth=1.8;for(let k=0;k<2;k++){ct.beginPath();for(let i=0;i<3;i++){const an=k*Math.PI/3-Math.PI/2+i*TAU/3,x=Math.cos(an)*150,y=Math.sin(an)*150;i?ct.lineTo(x,y):ct.moveTo(x,y)}ct.closePath();ct.stroke()}
   for(let i=0;i<6;i++){const an=i/6*TAU-Math.PI/2,x=Math.cos(an)*150,y=Math.sin(an)*150;ct.lineWidth=1.6;ct.beginPath();ct.arc(x,y,13,0,TAU);ct.stroke();rune(ct,x,y,6,i+40)}
   ct.lineWidth=2;rune(ct,0,0,28,99);
   for(let i=0;i<3;i++){const an=i/3*TAU+.4,x=Math.cos(an)*108,y=Math.sin(an)*108;const gq=ct.createRadialGradient(x,y,1,x,y,18);gq.addColorStop(0,'rgba(255,255,255,.95)');gq.addColorStop(1,'rgba(150,120,255,0)');ct.fillStyle=gq;ct.beginPath();ct.arc(x,y,18,0,TAU);ct.fill()}}
 });
 return{O:cO,I:cI,S}
}
function drawCircle(x,y,r,al,rot){const C=CIR||(CIR=circleSprite()),sc=r/256;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;g.translate(x,y);
 g.save();g.rotate(rot);g.scale(sc,sc);g.drawImage(C.O,-C.S/2,-C.S/2);g.restore();
 g.save();g.rotate(-rot*1.5);g.scale(sc,sc);g.drawImage(C.I,-C.S/2,-C.S/2);g.restore();g.restore()}

/* ---------- BẢN ĐỒ: Huyết Nguyệt Ma Điện ---------- */
function castle(ct,x0,base,sc,seed,col,lit){
 const r=srand(seed);let x=x0;const n=6+Math.floor(r()*3);
 for(let i=0;i<n;i++){const w=(26+r()*34)*sc,h=(90+r()*200)*sc;ct.fillStyle=col;ct.fillRect(x,base-h,w,h+8*sc);
  ct.beginPath();ct.moveTo(x-3*sc,base-h);ct.lineTo(x+w/2,base-h-w*(1.4+r()*1.1));ct.lineTo(x+w+3*sc,base-h);ct.fill();
  if(r()<.7){ct.fillRect(x+w*.12,base-h-18*sc,3*sc,18*sc);ct.fillRect(x+w*.78,base-h-12*sc,3*sc,12*sc)}
  if(lit){const wn=Math.floor(h/(36*sc));for(let j=0;j<wn;j++)if(r()<.5){const wx=x+w*.5,wy=base-h+18*sc+j*36*sc;ct.fillStyle='rgba('+WINC+',.85)';ct.beginPath();ct.moveTo(wx-3.2*sc,wy+13*sc);ct.lineTo(wx-3.2*sc,wy+4*sc);ct.quadraticCurveTo(wx,wy-5*sc,wx+3.2*sc,wy+4*sc);ct.lineTo(wx+3.2*sc,wy+13*sc);ct.fill()}ct.fillStyle=col}
  x+=w*(.55+r()*.4)}
}
function pillar(ct,x,w,top,bot,seed,u,al){
 ct.save();ct.globalAlpha=al||1;const q=ct.createLinearGradient(x,0,x+w,0);q.addColorStop(0,PILC[0]);q.addColorStop(.45,PILC[1]);q.addColorStop(1,PILC[2]);ct.fillStyle=q;
 ct.beginPath();ct.moveTo(x,bot);ct.lineTo(x+w*.04,top+22*u);ct.lineTo(x+w*.3,top);ct.lineTo(x+w*.5,top+16*u);ct.lineTo(x+w*.8,top-8*u);ct.lineTo(x+w,top+26*u);ct.lineTo(x+w*.96,bot);ct.closePath();ct.fill();
 ct.strokeStyle='#050206';ct.lineWidth=2*u;ct.stroke();
 ct.strokeStyle=RUNC;ct.lineWidth=2*u;glowOn(ct,RUNG,12);const n=Math.floor((bot-top-30*u)/(48*u));for(let i=0;i<n;i++)rune(ct,x+w*.5,top+44*u+i*48*u,14*u,seed*31+i);glowOff(ct);
 ct.strokeStyle='rgba(0,0,0,.55)';ct.lineWidth=1.5*u;const r=srand(seed);for(let i=0;i<4;i++){const yy=top+(bot-top)*r();ct.beginPath();ct.moveTo(x+w*r()*.4,yy);ct.lineTo(x+w*(.5+r()*.5),yy+(r()-.5)*40*u);ct.stroke()}
 ct.restore()
}
function buildBg(gy){
 const D=DPR||1,cv=mkc(W*D,H*D),ct=cv.getContext('2d');ct.scale(D,D);ct.lineJoin='round';ct.lineCap='round';const u=s;
 let q=ct.createLinearGradient(0,0,0,gy);[[0,'#0b020e'],[.28,'#26081a'],[.58,'#561818'],[.84,'#9c3c18'],[1,'#d2702a']].forEach(a=>q.addColorStop(a[0],a[1]));ct.fillStyle=q;ct.fillRect(0,0,W,H);
 const gx=W*.5,gyc=gy*.34;q=ct.createRadialGradient(gx,gyc,10,gx,gyc,Math.max(W,gy)*.5);q.addColorStop(0,'rgba(120,70,220,.55)');q.addColorStop(.35,'rgba(90,40,160,.3)');q.addColorStop(1,'rgba(40,10,70,0)');ct.fillStyle=q;ct.fillRect(0,0,W,gy);
 [[.35,.1,1],[.66,.08,.8],[.58,.2,.5]].forEach(a=>{const x=W*a[0],y=gy*a[1],r=46*u*a[2];ct.save();ct.translate(x,y);ct.rotate(.5);ct.scale(1,.45);const gg=ct.createRadialGradient(0,0,2,0,0,r);gg.addColorStop(0,'rgba(255,240,255,.9)');gg.addColorStop(.25,'rgba(170,150,255,.55)');gg.addColorStop(1,'rgba(80,40,160,0)');ct.fillStyle=gg;ct.beginPath();ct.arc(0,0,r,0,TAU);ct.fill();ct.restore()});
 const r0=srand(3);ct.fillStyle='#fff';for(let i=0;i<110;i++){ct.globalAlpha=.15+r0()*.5;ct.fillRect(r0()*W,r0()*gy*.7,u*(.8+r0()*1.2),u*(.8+r0()*1.2))}ct.globalAlpha=1;
 const mx=W*.25,my=gy*.12,mr=30*u;q=ct.createRadialGradient(mx,my,mr*.8,mx,my,mr*3.2);q.addColorStop(0,'rgba(255,40,40,.5)');q.addColorStop(1,'rgba(160,10,20,0)');ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr*3.2,0,TAU);ct.fill();
 q=ct.createRadialGradient(mx-mr*.3,my-mr*.3,2,mx,my,mr);q.addColorStop(0,'#c8282c');q.addColorStop(1,'#560912');ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr,0,TAU);ct.fill();
 const r1=srand(8);for(let i=0;i<16;i++){const cx0=r1()*W,cy0=gy*(.1+r1()*.7),rx=(90+r1()*200)*u,ry=(14+r1()*26)*u;ct.save();ct.globalAlpha=.35+r1()*.25;ct.fillStyle=i%3?'#2a0c16':'#3a1020';ct.beginPath();ct.ellipse(cx0,cy0,rx,ry,(r1()-.5)*.2,0,TAU);ct.fill();ct.globalAlpha=.4;ct.strokeStyle='rgba(255,110,50,.55)';ct.lineWidth=1.5*u;ct.beginPath();ct.ellipse(cx0,cy0+ry*.15,rx,ry*.85,0,.15*Math.PI,.85*Math.PI);ct.stroke();ct.restore()}
 q=ct.createLinearGradient(0,gy-150*u,0,gy);q.addColorStop(0,'rgba(255,100,30,0)');q.addColorStop(1,'rgba(255,120,40,.5)');ct.fillStyle=q;ct.fillRect(0,gy-150*u,W,150*u);
 // lâu đài gothic
 ct.save();ct.globalAlpha=.75;castle(ct,W*.5,gy-16*u,u*.62,5,'#3a1620',false);ct.restore();
 castle(ct,W*.03,gy-6*u,u*.95,21,'#1a0b13',true);castle(ct,W*.69,gy-6*u,u*.9,37,'#1a0b13',true);
 ct.fillStyle='#12070c';ct.fillRect(0,gy-10*u,W,12*u);
 // cột đá rune
 pillar(ct,W*.17,W*.045,gy-210*u,gy,14,u,.85);pillar(ct,W*.79,W*.045,gy-240*u,gy,19,u,.85);
 pillar(ct,-W*.012,W*.085,-10*u,gy+4*u,23,u,1);pillar(ct,W*.927,W*.088,-10*u,gy+4*u,29,u,1);
 // sàn đá + nứt dung nham
 q=ct.createLinearGradient(0,gy,0,H);q.addColorStop(0,'#2d171b');q.addColorStop(1,'#0a0507');ct.fillStyle=q;ct.fillRect(0,gy,W,H-gy);
 ct.fillStyle='rgba(255,140,60,.22)';ct.fillRect(0,gy,W,3*u);
 ct.strokeStyle='rgba(0,0,0,.45)';ct.lineWidth=1.5;for(let rr=0;rr<7;rr++){const y0=gy+(H-gy)*Math.pow(rr/7,1.5),y1=gy+(H-gy)*Math.pow((rr+1)/7,1.5),ww=(40+rr*18)*u;ct.beginPath();ct.moveTo(0,y0);ct.lineTo(W,y0);for(let x=(rr%2)*ww/2;x<W;x+=ww){ct.moveTo(x,y0);ct.lineTo(x,y1)}ct.stroke()}
 ct.save();ct.strokeStyle='rgba(150,100,255,.3)';ct.lineWidth=2*u;glowOn(ct,'#8a50ff',8);const ecx=W*.5,ecy=gy+(H-gy)*.45;ct.beginPath();ct.ellipse(ecx,ecy,W*.3,(H-gy)*.3,0,0,TAU);ct.stroke();ct.beginPath();ct.ellipse(ecx,ecy,W*.22,(H-gy)*.22,0,0,TAU);ct.stroke();
 ct.lineWidth=1.6*u;for(let i=0;i<20;i++){const an=i/20*TAU;rune(ct,ecx+Math.cos(an)*W*.26,ecy+Math.sin(an)*(H-gy)*.26,6*u,i+60)}ct.restore();
 const r2=srand(44);for(let i=0;i<16;i++){let x=r2()*W,y=gy+(H-gy)*(.1+r2()*.85);const pts=[[x,y]],n=4+Math.floor(r2()*4);for(let j=0;j<n;j++){x+=(r2()-.5)*120*u;y+=(r2()-.4)*26*u;y=Math.min(H-2,Math.max(gy+6*u,y));pts.push([x,y])}
  ct.save();ct.strokeStyle='rgba(255,60,10,.2)';ct.lineWidth=9*u;ct.beginPath();pts.forEach((p,j)=>j?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]));ct.stroke();ct.strokeStyle='rgba(255,150,50,.95)';ct.lineWidth=1.8*u;glowOn(ct,'#ff5a10',10);ct.stroke();ct.restore()}
 // gai đá tiền cảnh (góc dưới)
 const r3=srand(77);[[0,W*.13],[W*.87,W]].forEach((rg,k)=>{const n=7;for(let i=0;i<n;i++){const x=rg[0]+(rg[1]-rg[0])*(i+r3()*.6)/n,w=(20+r3()*30)*u,h=(H-gy)*(.22+r3()*.4);
  poly(ct,[[x-w/2,H+4],[x+(r3()-.5)*w*.5,H-h],[x+w/2,H+4]]);const sq=ct.createLinearGradient(x-w/2,0,x+w/2,0);sq.addColorStop(0,'#150a10');sq.addColorStop(.5,'#2a1620');sq.addColorStop(1,'#0a0508');ct.fillStyle=sq;ct.fill();ct.strokeStyle='#030103';ct.lineWidth=1.5*u;ct.stroke();
  ct.save();glowOn(ct,'#ff2a10',8);ct.strokeStyle='#ff3a1a';ct.lineWidth=1.6*u;rune(ct,x,H-h*.45,Math.min(10*u,h*.2),i+k*9);ct.restore()}});
 q=ct.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.78);q.addColorStop(0,'rgba(8,2,10,0)');q.addColorStop(1,'rgba(8,2,10,.55)');ct.fillStyle=q;ct.fillRect(0,0,W,H);
 return cv
}
let BG=null,BGK='';
function flame(x,y,h,w,seed,t){const sw=Math.sin(t*.22+seed)*w*.5,sw2=Math.sin(t*.31+seed*2)*w*.3;const q=g.createLinearGradient(0,y,0,y-h);q.addColorStop(0,'rgba(255,230,150,.9)');q.addColorStop(.35,'rgba(255,120,30,.75)');q.addColorStop(1,'rgba(255,50,10,0)');g.fillStyle=q;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.9+sw2,y-h*.5,x+sw,y-h);g.quadraticCurveTo(x+w*.9+sw2,y-h*.5,x+w,y);g.closePath();g.fill()}
function mtBg(gy){
 const k=[W,H,s.toFixed(3),gy|0,DPR].join('|');if(k!==BGK||!BG){BG=buildBg(gy);BGK=k}
 g.drawImage(BG,0,0,W,H);
 const t=fr,u=s,cx=W*.5,cy=gy*.36,r=Math.min(W*.3,gy*.52);
 drawCircle(cx,cy,r,.6+.15*Math.sin(t*.05),t*.004);
 g.save();g.globalCompositeOperation='lighter';let q;{g.save();g.translate(cx,gy);g.scale(1,(gy-cy)*1.05/(r*1.25));q=g.createRadialGradient(0,0,0,0,0,r*1.25);q.addColorStop(0,'rgba(170,110,255,.30)');q.addColorStop(.6,'rgba(140,80,240,.12)');q.addColorStop(1,'rgba(120,60,220,0)');g.fillStyle=q;g.beginPath();g.arc(0,0,r*1.25,Math.PI,TAU);g.fill();g.restore()}
 // dải rune xoáy hai bên
 g.lineCap='round';for(let sd=-1;sd<=1;sd+=2){for(let j=0;j<2;j++){g.strokeStyle='rgba(180,150,255,'+(j?.16:.32)+')';g.lineWidth=(j?7:3.5)*u;g.setLineDash(j?[]:[1,13*u]);g.lineDashOffset=-t*1.6*sd;g.beginPath();for(let i=0;i<=40;i++){const f=i/40,x=cx+sd*(W*.46-f*W*.34),y=gy*(.72-f*.3)-Math.sin(f*7-t*.03)*gy*.05*(1-f*.4)-Math.sin(f*3.1)*gy*.08;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}g.setLineDash([]);
 // rune bay
 g.strokeStyle='rgba(255,170,90,.8)';g.lineWidth=1.6*u;for(let i=0;i<8;i++){const f=((i*.37+t*.0007)%1),x=W*(.1+i*.11)+Math.sin(t*.012+i)*16*u,y=gy*(.78-f*.6);g.globalAlpha=Math.sin(f*Math.PI)*.7;rune(g,x,y,7*u,i+20)}g.globalAlpha=1;
 // lửa ở chân cột
 [[.04,.99],[.17,1],[.835,1],[.955,.99]].forEach((a,i)=>{const x=W*a[0],y=gy*a[1];flame(x,y,(60+i%2*24)*u,13*u,i,t);flame(x+16*u,y,(38)*u,9*u,i+4,t);flame(x-14*u,y,(32)*u,8*u,i+7,t)});
 // tia nóng ở sàn
 q=g.createLinearGradient(0,gy,0,gy+36*u);q.addColorStop(0,'rgba(255,100,30,'+(.3+.12*Math.sin(t*.07))+')');q.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=q;g.fillRect(0,gy,W,36*u);
 // tàn lửa
 for(let i=0;i<44;i++){const x=((i*131)+Math.sin(t*.02+i)*30+i*7)%W,y=H-((i*53+t*(.5+(i%5)*.25))%(H*.92)),a=.4+.5*Math.abs(Math.sin(t*.05+i));g.fillStyle=i%4?'rgba(255,150,50,'+a+')':'rgba(255,225,150,'+a+')';g.fillRect(x,y,u*(1+i%3*.7),u*(1+i%3*.7))}
 g.restore()
}

/* ---------- VẬT THỂ KỸ NĂNG: sóng kiếm + vòng cảnh báo ---------- */
const MW=[],MM=[];
function drawWaves(){for(const w of MW){const X=(w.x-cam)*s,Y=GY-70*s,fa=Math.min(1,w.l/18);g.save();g.globalCompositeOperation='lighter';g.translate(X,Y);g.scale(s*w.dir,s);g.globalAlpha=fa;
 const q=g.createRadialGradient(0,0,10,0,0,130);q.addColorStop(0,'rgba(255,150,60,.5)');q.addColorStop(1,'rgba(160,30,200,0)');g.fillStyle=q;g.beginPath();g.arc(-10,0,130,0,TAU);g.fill();
 g.lineCap='round';g.strokeStyle='rgba(180,40,255,.8)';g.lineWidth=36;g.beginPath();g.arc(-52,0,100,-1.05,1.05);g.stroke();g.strokeStyle='rgba(255,120,40,.95)';g.lineWidth=23;g.stroke();g.strokeStyle='#fff3d0';g.lineWidth=8;g.stroke();
 for(let i=0;i<5;i++){g.fillStyle='rgba(255,170,90,'+(.6-i*.1)+')';g.beginPath();g.arc(-60-i*20,(Math.sin(w.i*.5+i*2))*50,5-i*.6,0,TAU);g.fill()}
 g.restore()}}
function drawMarkers(){for(const m of MM){const X=(m.x-cam)*s,p=1-m.t/m.t0;g.save();g.translate(X,GY+4*s);g.scale(s,s*.28);g.globalCompositeOperation='lighter';
 g.fillStyle='rgba(190,60,255,'+(.1+.28*p)+')';g.beginPath();g.arc(0,0,92,0,TAU);g.fill();
 g.strokeStyle='rgba(255,130,60,'+(.55+.45*p)+')';g.lineWidth=5;g.beginPath();g.arc(0,0,92,0,TAU);g.stroke();
 g.strokeStyle='rgba(230,180,255,.9)';g.lineWidth=3;g.beginPath();g.arc(0,0,Math.max(6,92*(1-p)),0,TAU);g.stroke();
 g.strokeStyle='rgba(255,200,130,.9)';g.lineWidth=2.4;for(let i=0;i<8;i++){g.save();g.rotate(i/8*TAU+fr*.05);g.translate(68,0);rune(g,0,0,9,i);g.restore()}
 g.restore()}}
function mtPillar(m){FX.push({x:m.x,l:28,m:28,fn:(f,p,X,gy)=>{g.save();g.globalCompositeOperation='lighter';const wd=(70*(1-p*.55)+10*Math.sin(p*9))*s,hh=520*s*Math.min(1,p*5+.15);
 const q=g.createLinearGradient(0,gy-hh,0,gy);q.addColorStop(0,'rgba(120,40,220,0)');q.addColorStop(.35,'rgba(200,100,255,'+(.7*(1-p))+')');q.addColorStop(1,'rgba(255,150,60,'+(.95*(1-p))+')');
 g.fillStyle=q;g.beginPath();g.moveTo(X-wd,gy);g.lineTo(X-wd*.55,gy-hh);g.lineTo(X+wd*.55,gy-hh);g.lineTo(X+wd,gy);g.fill();
 g.fillStyle='rgba(255,245,220,'+(.9*(1-p))+')';const wc=wd*.33;g.fillRect(X-wc,gy-hh,wc*2,hh);
 g.translate(X,gy-4*s);g.scale(s,s*.25);g.strokeStyle='rgba(255,140,60,'+(1-p)+')';g.lineWidth=12*(1-p)+2;g.beginPath();g.arc(0,0,60+p*140,0,TAU);g.stroke();g.restore()}});
 for(let i=0;i<22;i++)PT.push({x:m.x+(rnd()-.5)*110,y:8,vx:(rnd()-.5)*3,vy:-(2+rnd()*6),l:34,c:rnd()<.5?'#ff9a40':'#d090ff'});dgFl=6}
function mtBoom(e){MW.length=0;MM.length=0;FX.push({x:e.x,l:50,m:50,fn:(f,p,X,gy)=>{g.save();g.globalCompositeOperation='lighter';const y=gy-((e.y||0)+120)*s,r=(40+p*420)*s,q=g.createRadialGradient(X,y,r*.1,X,y,r);q.addColorStop(0,'rgba(255,240,200,'+(.9*(1-p))+')');q.addColorStop(.4,'rgba(255,120,40,'+(.6*(1-p))+')');q.addColorStop(1,'rgba(120,30,200,0)');g.fillStyle=q;g.beginPath();g.arc(X,y,r,0,TAU);g.fill();g.restore()}});
 for(let i=0;i<60;i++)PT.push({x:e.x+(rnd()-.5)*160,y:60+rnd()*160,vx:(rnd()-.5)*8,vy:-rnd()*7,l:50,c:rnd()<.5?'#ff9a40':'#d090ff'});dgFl=14}
function slashFx(e){const sp_=e.sp,fd=e.fd,lo=Math.max(Math.min(sp_.a0,sp_.a1),-1.4),hi=Math.min(Math.max(sp_.a0,sp_.a1),1.9);
 FX.push({x:e.x,l:12,m:12,fn:(f,p,X,gy)=>{g.save();g.globalCompositeOperation='lighter';g.translate(X+fd*20*s,gy-((e.y||0)+155*BK)*s);g.scale(fd*s,s);g.lineCap='round';g.globalAlpha=1-p;const r=sp_.rc*.78;
  g.strokeStyle='rgba(255,130,40,.9)';g.lineWidth=30*(1-p)+4;g.beginPath();g.arc(0,0,r,lo,hi);g.stroke();g.strokeStyle='#fff3d0';g.lineWidth=8*(1-p)+1;g.stroke();g.restore()}});
 for(let i=0;i<8;i++)PT.push({x:e.x+fd*sp_.rc*.8,y:20+rnd()*60,vx:fd*(1+rnd()*4),vy:-rnd()*3,l:24,c:rnd()<.5?'#ffb050':'#fff0c0'});dgFl=3}

/* ---------- VẼ BOSS ---------- */
function mtDraw(e){
 const P_=sp(),u=s,X=(e.x-cam)*u,fd=e.fd||-1,hv=e.y||0,t=fr,en=e.hp<e.max*.5,bob=Math.sin(e.ph*.5)*3,cy=GY-(hv+bob)*u;
 g.save();g.fillStyle='rgba(0,0,0,'+(.4-Math.min(.24,hv/420)).toFixed(2)+')';g.beginPath();g.ellipse(X,GY+2,72*u*BK*(1-Math.min(.4,hv/360)),8*u,0,0,TAU);g.fill();g.restore();
 if(e.qs==4){g.save();g.globalCompositeOperation='lighter';const x0=X,x1=fd>0?W:0,q=g.createLinearGradient(x0,0,x1,0);q.addColorStop(0,'rgba(255,60,40,'+(.12+.1*Math.sin(t*.4))+')');q.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=q;g.fillRect(Math.min(x0,x1),GY-150*u,Math.abs(x1-x0),156*u);g.restore()}
 g.save();g.globalCompositeOperation='lighter';{const R0=170*u*BK,ay=cy-130*u*BK,q=g.createRadialGradient(X,ay,R0*.1,X,ay,R0*1.4);q.addColorStop(0,en?'rgba(255,70,40,.5)':'rgba(190,90,255,.5)');q.addColorStop(.5,en?'rgba(200,40,20,.22)':'rgba(110,40,200,.24)');q.addColorStop(1,'rgba(40,0,60,0)');g.globalAlpha=.75+.25*Math.sin(t*.1);g.fillStyle=q;g.beginPath();g.arc(X,ay,R0*1.4,0,TAU);g.fill()}g.restore();
 if(e.cast>.02)drawCircle(X,cy-150*u*BK,150*u*BK*(.7+.5*e.cast),e.cast*.9,t*.03);
 g.save();g.translate(X,cy);g.scale(u*BK,u*BK);g.scale(fd,1);
 g.translate(0,-135);g.rotate(e.ln||0);g.translate(0,135);
 const amp=e.qs==6?.4:(hv>8?.2:.12),fa=.1+Math.sin(e.ph*(e.qs==6?1.6:.8))*amp,W_=P_.wing;
 for(const sd of[-1,1]){g.save();g.translate(sd*12,-188);if(sd<0){g.scale(-1,1);g.globalAlpha=.92}g.rotate(fa);g.drawImage(W_.cv,-W_.OX,-W_.OY,W_.w,W_.h);g.restore()}
 const B_=P_.body;g.drawImage(B_.cv,-B_.OX,-B_.OY,B_.w,B_.h);
 // tay cầm kiếm (IK 2 khúc)
 const shx=50,shy=-190,a=e.qa,ha=a*.9-.05,rr=58,hx=shx+Math.cos(ha)*rr,hy=shy+Math.sin(ha)*rr,dx=Math.cos(ha),dy=Math.sin(ha),hl=rr/2,hq=Math.sqrt(Math.max(0,1600-hl*hl));let px=-dy,py=dx;if(py<0){px=-px;py=-py}
 const ex=shx+dx*hl+px*hq,ey=shy+dy*hl+py*hq;
 g.lineCap='round';g.lineJoin='round';g.strokeStyle='#07040a';g.lineWidth=18;g.beginPath();g.moveTo(shx,shy);g.lineTo(ex,ey);g.lineTo(hx,hy);g.stroke();g.strokeStyle='#2f2939';g.lineWidth=14;g.stroke();g.strokeStyle='#ff9a3a';g.lineWidth=1.4;g.stroke();
 // vệt chém
 if(e.qtr&&e.qtr.length>1){g.save();g.translate(hx,hy);g.globalCompositeOperation='lighter';g.scale(SK,SK);for(let i=1;i<e.qtr.length;i++){const a0=e.qtr[i-1],a1=e.qtr[i],al=i/e.qtr.length,gr=g.createRadialGradient(0,0,60,0,0,230);gr.addColorStop(0,'rgba(255,170,80,0)');gr.addColorStop(.55,'rgba(255,120,40,'+(.55*al)+')');gr.addColorStop(1,'rgba(255,245,220,'+(.9*al)+')');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.arc(0,0,230,a0,a1,a1<a0);g.closePath();g.fill()}g.restore()}
 // kiếm
 g.save();g.translate(hx,hy);g.rotate(a);g.scale(SK,SK);const S_=P_.sword;g.drawImage(S_.cv,-S_.OX,-S_.OY,S_.w,S_.h);
 if(e.qg>.05){g.globalCompositeOperation='lighter';const q=g.createRadialGradient(115,0,5,115,0,120);q.addColorStop(0,'rgba(255,140,60,'+(.55*e.qg)+')');q.addColorStop(1,'rgba(255,60,20,0)');g.fillStyle=q;g.beginPath();g.arc(115,0,120,0,TAU);g.fill();
  for(let i=0;i<3;i++){const fx=226-i*8+Math.sin(t*.4+i)*4,fy=Math.sin(t*.5+i*2)*5,fr_=(9+i*2)*e.qg+3;const q2=g.createRadialGradient(fx,fy,1,fx,fy,fr_*2);q2.addColorStop(0,'rgba(255,240,170,.9)');q2.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=q2;g.beginPath();g.arc(fx,fy,fr_*2,0,TAU);g.fill()}}
 g.restore();
 // tay nắm
 g.fillStyle='#3d3547';g.strokeStyle='#07040a';g.lineWidth=2;g.beginPath();g.arc(hx,hy,11,0,TAU);g.fill();g.stroke();g.fillStyle='#ff8a30';g.beginPath();g.arc(hx,hy,2.4,0,TAU);g.fill();
 if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.4;g.drawImage(B_.cv,-B_.OX,-B_.OY,B_.w,B_.h)}
 g.restore();
 const by=GY-(hv+bob+312*BK)*u,bw=190*u;g.save();g.font='bold '+(14*u)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';const nm='👹 MA THẦN · Lv'+e.lv;g.strokeText(nm,X,by-6*u);g.fillStyle=en?'#ffb090':'#e0b0ff';g.fillText(nm,X,by-6*u);
 g.fillStyle='#000a';g.fillRect(X-bw/2,by,bw,6*u);g.fillStyle=en?'#ff4030':'#c040ff';g.fillRect(X-bw/2,by,bw*cl(e.hp/e.max,0,1),6*u);g.strokeStyle='#000';g.lineWidth=1;g.strokeRect(X-bw/2,by,bw,6*u);g.restore()
}

/* ---------- AI ---------- */
const SLASH=[{a0:-2.45,a1:1.3,rc:215,mu:1.2},{a0:2.85,a1:.05,rc:240,mu:1.0},{a0:2.1,a1:-1.55,rc:210,mu:1.1}];
function nextSlash(e,en){let k;do{k=Math.floor(rnd()*3)}while(k==e.qi);e.qi=k;e.sp=SLASH[k];e.qs=1;e.qt=0;e.qf=e.qa;e.qW=Math.round((en?13:19)*(e.qc>0&&e.qk?.7:1));e.qS=en?6:8;e.qR=e.qc>0?4:(en?14:20);e.qk=1}
function mtAI(e){
 e.sl--;e.fl--;e.cd--;e.k1--;e.k2--;e.ph+=.3;
 const d=P.x-e.x,ad=Math.abs(d),dr=Math.sign(d)||e.fd||-1,en=e.hp<e.max*.5,sl=e.sl>0?.6:1;e.mv=0;
 if(e.qa==null){e.qa=REST;e.qs=0;e.qt=0;e.fd=-1;e.k1=120;e.k2=260;e.qc=0;e.qtr=[];e.ln=0;e.qg=0;e.cast=0;e.qi=-1}
 if(e.in>0){e.in--;e.x-=Math.min(3.4,Math.max(0,e.x-(vw()-90)));e.mv=1;e.y=58+(e.in/70)*150;e.qa=REST;return}
 let ty=58;e.hh=200;
 if(e.qtr.length&&e.qs!=2&&e.qs!=5)e.qtr.shift();
 switch(e.qs){
 case 0:{e.fd=dr;e.qa+=(REST-e.qa)*.15;e.ln*=.9;e.qg*=.9;
  if(ad>130){e.x+=dr*(en?3.1:2.3)*sl;e.mv=1}else if(ad<75){e.x-=dr*1.5;e.mv=1}
  if(e.cd<=0){const w=rnd();
   if(e.k2<=0&&w<.55){e.qs=6;e.qt=0;e.k2=en?380:520;e.fd=dr;DT.push({x:e.x,y:250,s:'🔥 Ma Phù Hỏa Ngục!',c:'#d070ff',g:1,l:90})}
   else if(e.k1<=0&&(ad>230||w<.5)){e.qs=4;e.qt=0;e.qf=e.qa;e.qn=en?2:1;e.k1=en?210:300;e.qC=en?32:44;e.fd=dr;DT.push({x:e.x,y:240,s:'🌙 Huyết Nguyệt Trảm!',c:'#ff7a50',g:1,l:80})}
   else if(ad<260){e.qc=1+(rnd()<.55?1:0)+(en&&rnd()<.5?1:0);e.qk=0;e.qi=-1;e.qc--;nextSlash(e,en)}}
  break}
 case 1:{e.qt++;const u=e.qt/e.qW;e.fd=dr;e.qa=lerp(e.qf,e.sp.a0,eo(u));e.ln=-.12*eo(u);e.qg=u;if(ad>110)e.x+=dr*2.4*sl;e.mv=ad>110?1:0;
  if(e.qt>=e.qW){e.qs=2;e.qt=0;e.hit=0;e.dv=Math.min(15,Math.max(0,(ad-125)/e.qS));e.qtr=[]}
  break}
 case 2:{e.qt++;const u=e.qt/e.qS;e.qa=e.sp.a0+(e.sp.a1-e.sp.a0)*ei(u);e.x+=e.fd*e.dv;e.ln=-.12+.34*ease(u);e.qg=1;e.qtr.push(e.qa);if(e.qtr.length>8)e.qtr.shift();
  if(!e.hit&&u>=.55){e.hit=1;const dx=(P.x-e.x)*e.fd;if(dx>-45&&dx<e.sp.rc)dgHurt(e,e.sp.mu);slashFx(e)}
  if(e.qt>=e.qS){e.qs=3;e.qt=0;e.qa=e.sp.a1}
  break}
 case 3:{e.qt++;const u=e.qt/e.qR;
  if(e.qc>0){if(e.qt>=e.qR){e.qc--;e.fd=dr;nextSlash(e,en)}}
  else{e.qa=lerp(e.sp.a1,REST,eo(u));e.ln*=.9;e.qg*=.92;if(e.qt>=e.qR){e.qs=0;e.cd=en?14:34}}
  break}
 case 4:{e.qt++;const u=Math.min(1,e.qt/e.qC);e.fd=dr;e.qa=lerp(e.qf,-1.95,eo(u));e.qg=u;ty=58+26*u;e.ln=-.14*u;
  if(e.qt>=e.qC){e.qs=5;e.qt=0;e.hit=0;e.qtr=[]}
  break}
 case 5:{e.qt++;const S1=8;ty=84;
  if(e.qt<=S1){const u=e.qt/S1;e.qa=-1.95+2.5*ei(u);e.ln=-.14+.34*u;e.qtr.push(e.qa);if(e.qtr.length>8)e.qtr.shift();
   if(!e.hit&&e.qt>=5){e.hit=1;MW.push({e,x:e.x+e.fd*60,vx:e.fd*(en?9.5:8),dir:e.fd,l:170,mu:1.3,i:0,h:0});dgFl=4;for(let i=0;i<10;i++)PT.push({x:e.x+e.fd*80,y:30+rnd()*50,vx:e.fd*(2+rnd()*5),vy:-rnd()*3,l:26,c:rnd()<.5?'#ff9a40':'#d090ff'})}}
  else{e.qa+=(REST-e.qa)*.12;e.ln*=.9;e.qg*=.92;
   if(e.qt>=S1+(e.qn>1?8:26)){e.qn--;if(e.qn>0){e.qs=4;e.qt=0;e.qf=e.qa;e.qC=14}else{e.qs=0;e.cd=en?16:44}}}
  break}
 case 6:{e.qt++;const AS=24,n=en?5:3,gap=10,delay=en?44:56;e.fd=dr;e.qa+=(-1.35-e.qa)*.12;e.qg=Math.min(1,e.qt/AS);ty=e.qt<AS?58+e.qt/AS*70:128;e.ln=-.1;e.cast=Math.min(1,e.qt/AS);
  if(e.qt==AS+6){[0,-150,150,-300,300].slice(0,n).forEach((o,i)=>{const x=cl(P.x+o+(i?(rnd()-.5)*50:0),50,vw()-50);MM.push({e,x,t:delay+i*gap,t0:delay+i*gap,mu:1.5})})}
  if(e.qt>AS+6+delay+(n-1)*gap+12){e.qs=7;e.qt=0}
  break}
 case 7:{e.qt++;e.cast=Math.max(0,e.cast-.06);e.qa+=(REST-e.qa)*.1;e.qg*=.9;e.ln*=.9;if(e.qt>26){e.qs=0;e.cd=en?16:40;e.cast=0}
  break}
 }
 e.y+=(ty+Math.sin(e.ph*.5)*0-e.y)*.12;
 e.x=cl(e.x,60,vw()-80)
}
function mtTick(){
 if(!dg||!dg.mt||!E.some(x=>x.mt&&x.hp>0)){MW.length=0;MM.length=0;return}
 if(over||bo||vil||!started)return;
 for(let i=MW.length-1;i>=0;i--){const w=MW[i];w.x+=w.vx;w.l--;w.i++;if(w.i%2==0)PT.push({x:w.x-w.dir*40,y:20+rnd()*90,vx:-w.dir*rnd()*2,vy:-rnd()*2,l:20,c:rnd()<.5?'#ff9a40':'#c070ff'});
  if(!w.h&&Math.abs(P.x-(w.x+w.dir*30))<58){w.h=1;dgHurt(w.e,w.mu);w.l=Math.min(w.l,8)}
  if(w.l<=0||w.x<-120||w.x>vw()+120)MW.splice(i,1)}
 for(let i=MM.length-1;i>=0;i--){const m=MM[i];if(--m.t<=0){mtPillar(m);if(Math.abs(P.x-m.x)<88)dgHurt(m.e,m.mu);MM.splice(i,1)}}
}

/* ---------- Gắn vào game (bọc các hàm cũ) ---------- */
const _mtSpawn=mtSpawn;mtSpawn=function(){_mtSpawn();const e=E.find(x=>x.mt);if(!e)return;e.max=e.hp=Math.round(e.max*MT2.hp);e.df=e.df*MT2.df;MW.length=0;MM.length=0;e.fd=-1;e.y=208;e.qa=REST;e.qs=0;e.qt=0;e.qtr=[];e.qg=0;e.ln=0;e.k1=120;e.k2=260;e.qc=0;e.cast=0;e.qi=-1};
const _dgHurt3=dgHurt;dgHurt=function(e,mu){_dgHurt3(e,e&&e.mt?mu*MT2.atk:mu)};
const _dgAI3=dgAI;dgAI=function(e){if(e.mt&&e.k=='boss')return mtAI(e);_dgAI3(e)};
const _dgFoe3=dgFoe;dgFoe=function(e){if(!e.mt)return _dgFoe3(e);drawMarkers();mtDraw(e);drawWaves()};
const _bgd5=bgd;bgd=function(gy){if(dg&&dg.mt)mtBg(gy);else _bgd5(gy)};
const _stp5=step;step=function(){_stp5();mtTick()};
const _drop5=drop;drop=function(e){if(e&&e.mt)mtBoom(e);return _drop5(e)};
const _dgHud3=dgHud;dgHud=function(){_dgHud3();if(dg&&dg.mt){const b=E.find(e=>e.k=='boss');dgh.innerHTML='<div class="dgt">👹 MA THẦN · Lv'+MT_LV+' · Huyết Nguyệt Ma Điện</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};

/* ==== BẢN ĐỒ LUYỆN CẤP + QUÁI: dựng lại theo phong cách Huyết Nguyệt Ma Điện ====
   5 bản đồ (Sơn Môn · Tuyết Hàn · Xích Viêm · U Minh · Hư Không), mỗi bản đồ có bảng màu, hiệu ứng và bộ quái vẽ canvas riêng */
const LT=[
{n:'Huyết Nguyệt Sơn Môn',sky:['#14040f','#3c0e1e','#7a2418','#c0501c','#f09040'],neb:'170,70,90',moon:['#ff7a50','#7a1410','255,90,60'],far:'#4a1a22',near:'#1e0b12',win:'255,170,70',rune:'#ff6a2a',runeG:'#ff4a10',pil:['#0a0408','#2a1218','#0c0508'],fl:['#3a1c1c','#0c0506'],crack:'255,170,60',crackG:'#ff6a10',circ:'#ffd0b0',circG:'#ff6a40',cgb:'255,120,70',ca:.4,fx:'ember',fc:['rgba(255,230,150,.9)','rgba(255,120,30,.75)','rgba(255,50,10,0)'],
 m:{a1:'#4a3a52',a2:'#150d1a',s1:'#a8483a',s2:'#3a0c14',gl:'#ffa040',gg:'#ff5a10',ey:'#ff4020',e2:'#ffe0a0'}},
{n:'Tuyết Hàn Ma Phong',sky:['#030a1c','#0c2248','#1c4a80','#4a88b8','#a8d8f0'],neb:'60,140,230',moon:['#eaf8ff','#6aa0d0','180,230,255'],far:'#16304e',near:'#0a1a30',win:'150,225,255',rune:'#7ae6ff',runeG:'#2ab8ff',pil:['#040a14','#12304a','#06101c'],fl:['#1c3652','#060e18'],crack:'130,225,255',crackG:'#3ac0ff',circ:'#d0f4ff',circG:'#4aa8ff',cgb:'90,190,255',ca:.45,fx:'snow',fc:['rgba(230,250,255,.9)','rgba(100,200,255,.7)','rgba(60,140,255,0)'],
 m:{a1:'#5a7a9a',a2:'#14243a',s1:'#7ab8e0',s2:'#1c3a5a',gl:'#8ae8ff',gg:'#2ab8ff',ey:'#40d0ff',e2:'#e8ffff'}},
{n:'Xích Viêm Ma Ngục',sky:['#100202','#3a0806','#7a1a08','#c8400c','#ff8a24'],neb:'255,90,20',moon:['#ffae40','#8a2000','255,130,30'],far:'#3a1008',near:'#1a0604',win:'255,190,70',rune:'#ffd24a',runeG:'#ff8a10',pil:['#080202','#2a0e08','#0a0302'],fl:['#2e0f08','#0a0302'],crack:'255,200,60',crackG:'#ff7a10',circ:'#ffe0b0',circG:'#ff6a20',cgb:'255,120,30',ca:.45,fx:'lava',fc:['rgba(255,240,170,.95)','rgba(255,140,30,.8)','rgba(255,60,10,0)'],
 m:{a1:'#4a2a20',a2:'#120604',s1:'#c04a1a',s2:'#3a0c04',gl:'#ffd040',gg:'#ff8a10',ey:'#ffb020',e2:'#fff0a0'}},
{n:'U Minh Ma Cốc',sky:['#02060a','#08242a','#0e4a48','#1a7868','#3ab898'],neb:'40,200,160',moon:['#b8ffe8','#2a806a','120,255,200'],far:'#0c2a2a',near:'#06161a',win:'120,255,190',rune:'#5affc8',runeG:'#10d890',pil:['#03090a','#0e2c2a','#040c0c'],fl:['#0e2c2a','#040c0e'],crack:'90,255,200',crackG:'#20e0a0',circ:'#c8fff0',circG:'#20d8a0',cgb:'40,220,170',ca:.42,fx:'wisp',fc:['rgba(200,255,235,.9)','rgba(60,230,170,.7)','rgba(20,160,120,0)'],
 m:{a1:'#3a5a52',a2:'#0a1a1a',s1:'#6a9a8a',s2:'#14302c',gl:'#6affc8',gg:'#10d890',ey:'#40ffb0',e2:'#e0fff0'}},
{n:'Hư Không Ma Điện',sky:['#04010a','#1a0636','#4a1070','#8a2090','#c040a8'],neb:'170,60,230',moon:['#f070ff','#4a0a70','200,80,255'],far:'#2a1048',near:'#12061f',win:'255,120,230',rune:'#ff64d4',runeG:'#c020a0',pil:['#06020c','#240e3a','#08040e'],fl:['#26123e','#080214'],crack:'225,110,255',crackG:'#c040ff',circ:'#f4d4ff',circG:'#b040ff',cgb:'190,80,255',ca:.55,fx:'void',fc:['rgba(255,220,250,.9)','rgba(230,90,220,.75)','rgba(150,30,200,0)'],
 m:{a1:'#5a3a7a',a2:'#14081f',s1:'#9a4ab8',s2:'#2a0c40',gl:'#ff70dc',gg:'#c020b0',ey:'#ff50d0',e2:'#ffe0ff'}}];
MP[0].n=LT[0].n;MP[2].n=LT[1].n;MP[3].n=LT[2].n;MP[4].n=LT[3].n;
const NMN=[
{gob:'Tiểu Quỷ Huyết',wolf:'Huyết Lang',scorp:'Hỏa Hạt',arch:'Quỷ Xạ Thủ',mage:'Ma Đạo Sĩ',ogre:'Huyết Ma Tướng',golem:'Hắc Thạch Cự Nhân'},
{gob:'Băng Quỷ',wolf:'Tuyết Lang Ma',scorp:'Hàn Băng Hạt',arch:'Băng Cung Quỷ',mage:'Hàn Băng Pháp Sư',ogre:'Băng Ma Tướng',golem:'Băng Giáp Cự Nhân'},
{gob:'Hỏa Quỷ',wolf:'Viêm Lang',scorp:'Dung Nham Hạt',arch:'Hỏa Xạ Quỷ',mage:'Viêm Pháp Sư',ogre:'Viêm Ma Tướng',golem:'Dung Nham Cự Nhân'},
{gob:'U Hồn Quỷ',wolf:'U Minh Lang',scorp:'Cốt Hạt',arch:'Cốt Xạ Thủ',mage:'U Hồn Pháp Sư',ogre:'U Minh Ma Tướng',golem:'Cốt Giáp Cự Nhân'},
{gob:'Hư Không Quỷ',wolf:'Hư Không Lang',scorp:'Hư Không Hạt',arch:'Hư Không Xạ Thủ',mage:'Hư Không Pháp Sư',ogre:'Hư Không Ma Tướng',golem:'Hư Không Cự Nhân'}];
MS.mage.h=92;

/* ---------- nền bản đồ ---------- */
function lvCircle(T){CC1=T.circ;CC2=T.circG;const c=circleSprite();CC1='#d8c2ff';CC2='#8a50ff';return c}
function lvDrawCircle(x,y,r,al,rot,T){const C=T._cs||(T._cs=lvCircle(T)),sc=r/256;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;g.translate(x,y);
 g.save();g.rotate(rot);g.scale(sc,sc);g.drawImage(C.O,-C.S/2,-C.S/2);g.restore();
 if(!(window.QL>=1)){g.save();g.rotate(-rot*1.5);g.scale(sc,sc);g.drawImage(C.I,-C.S/2,-C.S/2);g.restore()}g.restore()}
function lvBuild(gy,T){
 const ix=LT.indexOf(T);WINC=T.win;RUNC=T.rune;RUNG=T.runeG;PILC=T.pil;
 const D=DPR||1,cv=mkc(W*D,H*D),ct=cv.getContext('2d');ct.scale(D,D);ct.lineJoin='round';ct.lineCap='round';const u=s;
 let q=ct.createLinearGradient(0,0,0,gy);[0,.28,.58,.84,1].forEach((p,i)=>q.addColorStop(p,T.sky[i]));ct.fillStyle=q;ct.fillRect(0,0,W,H);
 const gx=W*.5,gyc=gy*.34;q=ct.createRadialGradient(gx,gyc,10,gx,gyc,Math.max(W,gy)*.5);q.addColorStop(0,'rgba('+T.neb+',.5)');q.addColorStop(.4,'rgba('+T.neb+',.2)');q.addColorStop(1,'rgba('+T.neb+',0)');ct.fillStyle=q;ct.fillRect(0,0,W,gy);
 const r0=srand(3+ix*7);ct.fillStyle='#fff';for(let i=0;i<100;i++){ct.globalAlpha=.12+r0()*.5;ct.fillRect(r0()*W,r0()*gy*.7,u*(.8+r0()*1.2),u*(.8+r0()*1.2))}ct.globalAlpha=1;
 const mx=W*(ix%2?.74:.25),my=gy*.13,mr=30*u;
 q=ct.createRadialGradient(mx,my,mr*.8,mx,my,mr*3.4);q.addColorStop(0,'rgba('+T.moon[2]+',.5)');q.addColorStop(1,'rgba('+T.moon[2]+',0)');ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr*3.4,0,TAU);ct.fill();
 q=ct.createRadialGradient(mx-mr*.3,my-mr*.3,2,mx,my,mr);q.addColorStop(0,T.moon[0]);q.addColorStop(1,T.moon[1]);ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr,0,TAU);ct.fill();
 const r1=srand(8+ix);for(let i=0;i<14;i++){const cx0=r1()*W,cy0=gy*(.1+r1()*.7),rx=(90+r1()*200)*u,ry=(14+r1()*26)*u;ct.save();ct.globalAlpha=.3+r1()*.25;ct.fillStyle=T.far;ct.beginPath();ct.ellipse(cx0,cy0,rx,ry,(r1()-.5)*.2,0,TAU);ct.fill();ct.globalAlpha=.35;ct.strokeStyle='rgba('+T.crack+',.5)';ct.lineWidth=1.5*u;ct.beginPath();ct.ellipse(cx0,cy0+ry*.15,rx,ry*.85,0,.15*Math.PI,.85*Math.PI);ct.stroke();ct.restore()}
 q=ct.createLinearGradient(0,gy-150*u,0,gy);q.addColorStop(0,'rgba('+T.crack+',0)');q.addColorStop(1,'rgba('+T.crack+',.4)');ct.fillStyle=q;ct.fillRect(0,gy-150*u,W,150*u);
 ct.save();ct.globalAlpha=.75;castle(ct,W*.5,gy-16*u,u*.62,5+ix,T.far,false);ct.restore();
 castle(ct,W*.03,gy-6*u,u*.95,21+ix*3,T.near,true);castle(ct,W*.69,gy-6*u,u*.9,37+ix*5,T.near,true);
 ct.fillStyle=T.near;ct.fillRect(0,gy-10*u,W,12*u);
 pillar(ct,W*.17,W*.045,gy-(190+ix*12)*u,gy,14+ix,u,.85);pillar(ct,W*.79,W*.045,gy-(250-ix*10)*u,gy,19+ix,u,.85);
 pillar(ct,-W*.012,W*.085,-10*u,gy+4*u,23+ix,u,1);pillar(ct,W*.927,W*.088,-10*u,gy+4*u,29+ix,u,1);
 q=ct.createLinearGradient(0,gy,0,H);q.addColorStop(0,T.fl[0]);q.addColorStop(1,T.fl[1]);ct.fillStyle=q;ct.fillRect(0,gy,W,H-gy);
 ct.fillStyle='rgba('+T.crack+',.22)';ct.fillRect(0,gy,W,3*u);
 ct.strokeStyle='rgba(0,0,0,.45)';ct.lineWidth=1.5;for(let rr=0;rr<7;rr++){const y0=gy+(H-gy)*Math.pow(rr/7,1.5),y1=gy+(H-gy)*Math.pow((rr+1)/7,1.5),ww=(40+rr*18)*u;ct.beginPath();ct.moveTo(0,y0);ct.lineTo(W,y0);for(let x=(rr%2)*ww/2;x<W;x+=ww){ct.moveTo(x,y0);ct.lineTo(x,y1)}ct.stroke()}
 ct.save();ct.strokeStyle='rgba('+T.cgb+',.32)';ct.lineWidth=2*u;glowOn(ct,T.circG,8);const ecx=W*.5,ecy=gy+(H-gy)*.45;ct.beginPath();ct.ellipse(ecx,ecy,W*.3,(H-gy)*.3,0,0,TAU);ct.stroke();ct.beginPath();ct.ellipse(ecx,ecy,W*.22,(H-gy)*.22,0,0,TAU);ct.stroke();
 ct.lineWidth=1.6*u;for(let i=0;i<20;i++){const an=i/20*TAU;rune(ct,ecx+Math.cos(an)*W*.26,ecy+Math.sin(an)*(H-gy)*.26,6*u,i+60)}ct.restore();
 const r2=srand(44+ix*5);for(let i=0;i<14;i++){let x=r2()*W,y=gy+(H-gy)*(.1+r2()*.85);const pts=[[x,y]],n=4+Math.floor(r2()*4);for(let j=0;j<n;j++){x+=(r2()-.5)*120*u;y+=(r2()-.4)*26*u;y=Math.min(H-2,Math.max(gy+6*u,y));pts.push([x,y])}
  ct.save();ct.strokeStyle='rgba('+T.crack+',.2)';ct.lineWidth=9*u;ct.beginPath();pts.forEach((p,j)=>j?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]));ct.stroke();ct.strokeStyle='rgba('+T.crack+',.95)';ct.lineWidth=1.8*u;glowOn(ct,T.crackG,10);ct.stroke();ct.restore()}
 const r3=srand(77+ix);[[0,W*.13],[W*.87,W]].forEach((rg,k)=>{const n=7;for(let i=0;i<n;i++){const x=rg[0]+(rg[1]-rg[0])*(i+r3()*.6)/n,w=(20+r3()*30)*u,h=(H-gy)*(.22+r3()*.4);
  poly(ct,[[x-w/2,H+4],[x+(r3()-.5)*w*.5,H-h],[x+w/2,H+4]]);const sq=ct.createLinearGradient(x-w/2,0,x+w/2,0);sq.addColorStop(0,T.pil[0]);sq.addColorStop(.5,T.pil[1]);sq.addColorStop(1,T.pil[2]);ct.fillStyle=sq;ct.fill();ct.strokeStyle='#030103';ct.lineWidth=1.5*u;ct.stroke();
  ct.save();glowOn(ct,T.runeG,8);ct.strokeStyle=T.rune;ct.lineWidth=1.6*u;rune(ct,x,H-h*.45,Math.min(10*u,h*.2),i+k*9);ct.restore()}});
 q=ct.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.78);q.addColorStop(0,'rgba(8,2,10,0)');q.addColorStop(1,'rgba(8,2,10,.55)');ct.fillStyle=q;ct.fillRect(0,0,W,H);
 WINC='255,140,50';RUNC='#ff3a1a';RUNG='#ff2a10';PILC=['#08040a','#1f1118','#0a0509'];
 return cv}
let LBG=null,LBK='';
function lvFlame(x,y,h,w,seed,t,c){const sw=Math.sin(t*.22+seed)*w*.5,sw2=Math.sin(t*.31+seed*2)*w*.3,q=g.createLinearGradient(0,y,0,y-h);q.addColorStop(0,c[0]);q.addColorStop(.35,c[1]);q.addColorStop(1,c[2]);g.fillStyle=q;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.9+sw2,y-h*.5,x+sw,y-h);g.quadraticCurveTo(x+w*.9+sw2,y-h*.5,x+w,y);g.closePath();g.fill()}
function lvBg(gy){
 const i=cl(mapSel|0,0,4),T=LT[i],k=[W,H,s.toFixed(3),gy|0,DPR,i].join('|');if(k!==LBK||!LBG){LBG=lvBuild(gy,T);LBK=k}
 g.drawImage(LBG,0,0,W,H);
 const t=fr,u=s,cx=W*.5,cy=gy*.36,r=Math.min(W*.3,gy*.52);
 lvDrawCircle(cx,cy,r,T.ca+.12*Math.sin(t*.05),t*.004,T);
 g.save();g.globalCompositeOperation='lighter';
 const big=T.fx=='lava'?1.5:1;
 [[.04,.99],[.17,1],[.835,1],[.955,.99]].forEach((a,j)=>{const x=W*a[0],y=gy*a[1];lvFlame(x,y,(60+j%2*24)*u*big,13*u,j,t,T.fc);lvFlame(x+16*u,y,38*u*big,9*u,j+4,t,T.fc);lvFlame(x-14*u,y,32*u*big,8*u,j+7,t,T.fc)});
 let q=g.createLinearGradient(0,gy,0,gy+36*u);q.addColorStop(0,'rgba('+T.crack+','+(.3+.12*Math.sin(t*.07))+')');q.addColorStop(1,'rgba('+T.crack+',0)');g.fillStyle=q;g.fillRect(0,gy,W,36*u);
 g.lineCap='round';
 if(T.fx=='snow'){
  for(let j=0;j<3;j++){g.strokeStyle='rgba('+(j%2?'120,255,200':'140,200,255')+',.13)';g.lineWidth=(16-j*3)*u;g.beginPath();for(let x=0;x<=W;x+=W/30){const y=gy*(.2+j*.09)+Math.sin(x*.006+t*.012+j*2)*gy*.05;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  g.fillStyle='rgba(255,255,255,.85)';for(let j=0;j<70;j++){const x=(j*97+Math.sin(t*.02+j)*30+t*(.3+j%3*.2))%W,y=(j*53+t*(.8+j%3*.5))%H,z=u*(1+j%3*.6);g.fillRect(x,y,z,z)}
 }else if(T.fx=='wisp'){
  for(let j=0;j<18;j++){const x=((j*173+t*(.2+j%4*.1))%(W+80))-40,y=gy*(.4+.5*((j*37)%100)/100)+Math.sin(t*.03+j)*18*u,rr=(12+j%4*6)*u,a=.25+.2*Math.sin(t*.04+j);q=g.createRadialGradient(x,y,1,x,y,rr);q.addColorStop(0,'rgba(200,255,235,'+a+')');q.addColorStop(.4,'rgba(60,230,170,'+a*.5+')');q.addColorStop(1,'rgba(20,160,120,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,rr,0,TAU);g.fill()}
  g.fillStyle='rgba(150,255,210,.7)';for(let j=0;j<30;j++){const x=(j*131+Math.sin(t*.02+j)*24)%W,y=H-((j*47+t*(.4+j%5*.2))%(H*.9));g.fillRect(x,y,u*1.6,u*1.6)}
 }else if(T.fx=='void'){
  for(let sd=-1;sd<=1;sd+=2){for(let j=0;j<2;j++){g.strokeStyle='rgba(230,150,255,'+(j?.15:.3)+')';g.lineWidth=(j?7:3.5)*u;g.setLineDash(j?[]:[1,13*u]);g.lineDashOffset=-t*1.6*sd;g.beginPath();for(let n=0;n<=40;n++){const f=n/40,x=cx+sd*(W*.46-f*W*.34),y=gy*(.72-f*.3)-Math.sin(f*7-t*.03)*gy*.05*(1-f*.4)-Math.sin(f*3.1)*gy*.08;n?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}g.setLineDash([]);
  g.strokeStyle='rgba(255,170,240,.8)';g.lineWidth=1.6*u;for(let j=0;j<8;j++){const f=((j*.37+t*.0007)%1),x=W*(.1+j*.11)+Math.sin(t*.012+j)*16*u,y=gy*(.78-f*.6);g.globalAlpha=Math.sin(f*Math.PI)*.7;rune(g,x,y,7*u,j+20)}g.globalAlpha=1;
 }else{
  const n=T.fx=='lava'?70:44;for(let j=0;j<n;j++){const x=((j*131)+Math.sin(t*.02+j)*30+j*7)%W,y=H-((j*53+t*(.5+(j%5)*.25))%(H*.92)),a=.4+.5*Math.abs(Math.sin(t*.05+j));g.fillStyle=j%4?'rgba(255,150,50,'+a+')':'rgba(255,225,150,'+a+')';g.fillRect(x,y,u*(1+j%3*.7),u*(1+j%3*.7))}
 }
 g.restore()}

/* ---------- QUÁI vẽ canvas (quay mặt sang phải, chân ở đáy) ---------- */
const hF=(ct,pts,c1,c2,y1,y2,edge)=>{const q=ct.createLinearGradient(0,y1,0,y2);q.addColorStop(0,c1);q.addColorStop(1,c2);poly(ct,pts);ct.fillStyle=q;ct.fill();ct.lineWidth=1.5;ct.strokeStyle=edge||'#07040a';ct.stroke()};
const hL=(ct,pts,T,lw,b)=>{ct.save();glowOn(ct,T.gg,b||6);ct.strokeStyle=T.gl;ct.lineWidth=lw||1.5;ct.beginPath();pts.forEach((p,i)=>i?ct.lineTo(p[0],p[1]):ct.moveTo(p[0],p[1]));ct.stroke();ct.restore()};
const hE=(ct,x,y,r,T)=>{ct.save();glowOn(ct,T.ey,9);ct.fillStyle=T.e2;ct.beginPath();ct.ellipse(x,y,r*1.6,r,-.25,0,TAU);ct.fill();ct.restore()};
const hB=(ct,x,y,rx,ry,c1,c2,rot)=>{const q=ct.createRadialGradient(x-rx*.3,y-ry*.4,1,x,y,Math.max(rx,ry));q.addColorStop(0,c1);q.addColorStop(1,c2);ct.fillStyle=q;ct.beginPath();ct.ellipse(x,y,rx,ry,rot||0,0,TAU);ct.fill();ct.lineWidth=1.5;ct.strokeStyle='#07040a';ct.stroke()};
const hT=(ct,x1,y1,x2,y2,w,c)=>{ct.lineCap='round';ct.strokeStyle='#07040a';ct.lineWidth=w+3;ct.beginPath();ct.moveTo(x1,y1);ct.lineTo(x2,y2);ct.stroke();ct.strokeStyle=c;ct.lineWidth=w;ct.stroke()};
const hH=(ct,x,y,w,c1,c2)=>{ct.save();ct.translate(x,y);ct.rotate(0);hF(ct,[[-w*.5,0],[w*.5,0],[w*.38,w*.7],[-w*.38,w*.7]],c1,c2,0,w*.7);ct.restore()};
const hSp=(ct,x,y,w,h,T)=>hF(ct,[[x-w/2,y],[x,y-h],[x+w/2,y]],T.a1,T.a2,y-h,y);
const MON={
gob(ct,T,W,H){const cx=W/2,fy=H-4;
 ct.strokeStyle='#07040a';ct.lineWidth=7;ct.beginPath();ct.moveTo(cx-20,fy-50);ct.quadraticCurveTo(cx-66,fy-44,cx-60,fy-92);ct.stroke();ct.strokeStyle=T.s2;ct.lineWidth=4;ct.stroke();
 hF(ct,[[cx-70,fy-86],[cx-52,fy-90],[cx-61,fy-112]],T.gl,T.gg,fy-112,fy-86);
 for(const sd of[-1,1]){const x=cx+sd*13;hF(ct,[[x-8,fy-56],[x+8,fy-56],[x+10,fy-18],[x-8,fy-18]],T.s1,T.s2,fy-56,fy-18);hF(ct,[[x-9,fy-20],[x+16,fy-20],[x+22,fy],[x-12,fy]],T.a1,T.a2,fy-20,fy)}
 hT(ct,cx-24,fy-96,cx-42,fy-70,8,T.s1);hT(ct,cx-42,fy-70,cx-34,fy-48,8,T.s1);
 hF(ct,[[cx-28,fy-104],[cx+24,fy-108],[cx+32,fy-74],[cx+18,fy-48],[cx-18,fy-48],[cx-32,fy-76]],T.s1,T.s2,fy-108,fy-48);
 hF(ct,[[cx-20,fy-100],[cx+18,fy-102],[cx+14,fy-70],[cx-16,fy-68]],T.a1,T.a2,fy-102,fy-68);hL(ct,[[cx,fy-100],[cx,fy-72]],T,1.6,6);hL(ct,[[cx-12,fy-88],[cx+12,fy-88]],T,1.2,4);
 hSp(ct,cx+24,fy-104,22,24,T);hSp(ct,cx-26,fy-106,22,18,T);
 hB(ct,cx+4,fy-124,24,22,T.s1,T.s2);
 for(const sd of[-1,1]){ct.beginPath();ct.moveTo(cx+4+sd*14,fy-140);ct.quadraticCurveTo(cx+4+sd*34,fy-150,cx+4+sd*28,fy-170);ct.quadraticCurveTo(cx+4+sd*22,fy-152,cx+4+sd*8,fy-144);ct.closePath();ct.fillStyle=T.a1;ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.stroke()}
 hF(ct,[[cx-16,fy-126],[cx-46,fy-136],[cx-18,fy-114]],T.s1,T.s2,fy-136,fy-114);
 hE(ct,cx+13,fy-128,3.4,T);hE(ct,cx-1,fy-126,2.8,T);
 ct.fillStyle='#e8e0d0';[[cx+8,fy-110],[cx+17,fy-110]].forEach(p=>{ct.beginPath();ct.moveTo(p[0]-2.5,p[1]);ct.lineTo(p[0],p[1]+6);ct.lineTo(p[0]+2.5,p[1]);ct.fill()});
 hT(ct,cx+24,fy-96,cx+46,fy-78,9,T.s1);hT(ct,cx+46,fy-78,cx+60,fy-94,9,T.s1);
 ct.save();glowOn(ct,T.gg,10);ct.fillStyle=T.gl;ct.beginPath();ct.moveTo(cx+58,fy-94);ct.quadraticCurveTo(cx+92,fy-128,cx+76,fy-152);ct.quadraticCurveTo(cx+82,fy-122,cx+54,fy-86);ct.closePath();ct.fill();ct.restore()},
wolf(ct,T,W,H){const fy=H-4,bx=W/2-6;
 hT(ct,bx-62,fy-74,bx-104,fy-80,12,T.s1);hT(ct,bx-104,fy-80,bx-114,fy-50,8,T.s1);
 const leg=(x,o,c1,c2)=>{hF(ct,[[x-10,fy-62],[x+12,fy-62],[x+8+o,fy-24],[x-4+o,fy-24]],c1,c2,fy-62,fy-24);hF(ct,[[x-5+o,fy-26],[x+9+o,fy-26],[x+16+o,fy],[x-10+o,fy]],T.a1,T.a2,fy-26,fy)};
 leg(bx-48,-6,T.s2,T.s2);leg(bx+36,-4,T.s2,T.s2);
 hF(ct,[[bx-70,fy-76],[bx-30,fy-100],[bx+30,fy-102],[bx+66,fy-84],[bx+62,fy-58],[bx+20,fy-44],[bx-40,fy-46],[bx-68,fy-58]],T.s1,T.s2,fy-102,fy-44);
 for(let i=0;i<5;i++){const x=bx-52+i*24;hF(ct,[[x-9,fy-96+i*2],[x+2,fy-114-Math.sin(i*1.7)*6+i*2],[x+11,fy-98+i*2]],T.a1,T.a2,fy-124,fy-92)}
 hL(ct,[[bx-56,fy-80],[bx-10,fy-92],[bx+36,fy-90]],T,1.6,6);
 leg(bx-26,6,T.s1,T.s2);leg(bx+58,4,T.s1,T.s2);
 hF(ct,[[bx+46,fy-96],[bx+78,fy-110],[bx+84,fy-70],[bx+54,fy-58]],T.s1,T.s2,fy-110,fy-58);
 hF(ct,[[bx+66,fy-112],[bx+104,fy-104],[bx+130,fy-84],[bx+126,fy-70],[bx+82,fy-66],[bx+70,fy-80]],T.s1,T.s2,fy-112,fy-66);
 hF(ct,[[bx+86,fy-72],[bx+126,fy-72],[bx+116,fy-58],[bx+88,fy-60]],T.s2,T.a2,fy-72,fy-58);
 ct.fillStyle='#e8e0d0';[0,1,2].forEach(i=>{const x=bx+96+i*10;ct.beginPath();ct.moveTo(x-2.5,fy-72);ct.lineTo(x,fy-63);ct.lineTo(x+2.5,fy-72);ct.fill()});
 hF(ct,[[bx+68,fy-110],[bx+72,fy-138],[bx+86,fy-110]],T.a1,T.a2,fy-138,fy-110);hF(ct,[[bx+84,fy-108],[bx+96,fy-132],[bx+102,fy-104]],T.a1,T.a2,fy-132,fy-104);
 hE(ct,bx+98,fy-92,3.6,T);hL(ct,[[bx+74,fy-104],[bx+96,fy-100],[bx+112,fy-88]],T,1.3,5)},
scorp(ct,T,W,H){const fy=H-4,bx=W/2-6;
 for(let i=0;i<4;i++){const x=bx-40+i*26;hT(ct,x,fy-36,x-12+i*3,fy-58,5,T.a1);hT(ct,x-12+i*3,fy-58,x-20+i*6,fy,5,T.a1)}
 ct.lineCap='round';ct.lineJoin='round';ct.strokeStyle='#07040a';ct.lineWidth=22;ct.beginPath();ct.moveTo(bx-56,fy-44);ct.bezierCurveTo(bx-108,fy-60,bx-112,fy-128,bx-62,fy-136);ct.bezierCurveTo(bx-30,fy-140,bx-14,fy-122,bx-12,fy-108);ct.stroke();
 ct.strokeStyle=T.s1;ct.lineWidth=17;ct.stroke();ct.strokeStyle=T.s2;ct.lineWidth=2;ct.setLineDash([4,12]);ct.stroke();ct.setLineDash([]);
 ct.save();glowOn(ct,T.gg,12);ct.fillStyle=T.gl;ct.beginPath();ct.moveTo(bx-20,fy-118);ct.quadraticCurveTo(bx+8,fy-112,bx+10,fy-92);ct.quadraticCurveTo(bx-6,fy-104,bx-26,fy-100);ct.closePath();ct.fill();ct.restore();
 hB(ct,bx-6,fy-52,62,28,T.s1,T.s2);
 for(let i=0;i<4;i++){const x=bx-38+i*22;hF(ct,[[x-9,fy-74],[x+9,fy-74],[x+7,fy-50],[x-7,fy-50]],T.a1,T.a2,fy-74,fy-50)}hL(ct,[[bx-50,fy-60],[bx+36,fy-60]],T,1.4,5);
 hT(ct,bx+36,fy-54,bx+68,fy-82,10,T.s1);hT(ct,bx+68,fy-82,bx+100,fy-70,10,T.s1);
 hF(ct,[[bx+92,fy-70],[bx+128,fy-84],[bx+112,fy-62],[bx+128,fy-44],[bx+94,fy-56]],T.a1,T.a2,fy-84,fy-44);
 hT(ct,bx+34,fy-40,bx+66,fy-34,9,T.s1);hF(ct,[[bx+60,fy-34],[bx+100,fy-48],[bx+84,fy-28],[bx+98,fy-16],[bx+62,fy-22]],T.a1,T.a2,fy-48,fy-16);
 hB(ct,bx+48,fy-50,20,16,T.s1,T.s2);hE(ct,bx+56,fy-56,3,T);hE(ct,bx+50,fy-48,2.4,T)},
arch(ct,T,W,H){const cx=W/2-14,fy=H-4;
 hF(ct,[[cx-30,fy-176],[cx+16,fy-176],[cx+30,fy-30],[cx-50,fy-24]],T.a2,'#0a0610',fy-176,fy-24);
 for(const sd of[-1,1]){const x=cx+sd*12;hF(ct,[[x-8,fy-100],[x+8,fy-100],[x+8,fy-22],[x-8,fy-22]],T.a1,T.a2,fy-100,fy-22);hF(ct,[[x-10,fy-24],[x+18,fy-24],[x+22,fy],[x-12,fy]],T.a2,'#0a0610',fy-24,fy)}
 hF(ct,[[cx-28,fy-176],[cx+28,fy-176],[cx+22,fy-100],[cx-22,fy-100]],T.a1,T.a2,fy-176,fy-100);hL(ct,[[cx,fy-170],[cx,fy-108]],T,1.6,6);hL(ct,[[cx-16,fy-150],[cx+16,fy-150]],T,1.2,4);
 hF(ct,[[cx-30,fy-102],[cx+30,fy-102],[cx+26,fy-88],[cx-26,fy-88]],T.a2,'#0a0610',fy-102,fy-88);
 hSp(ct,cx+30,fy-174,26,26,T);hSp(ct,cx-30,fy-174,26,22,T);
 hF(ct,[[cx-16,fy-182],[cx+2,fy-222],[cx+24,fy-182],[cx+18,fy-166],[cx-10,fy-166]],T.a2,'#0a0610',fy-222,fy-166);
 hB(ct,cx+6,fy-190,11,14,'#0a0610','#000');hE(ct,cx+11,fy-192,2.8,T);hE(ct,cx+2,fy-191,2.4,T);
 hT(ct,cx+22,fy-164,cx+46,fy-152,10,T.a1);hT(ct,cx+46,fy-152,cx+64,fy-146,9,T.a1);
 const bw=(c,l)=>{ct.strokeStyle=c;ct.lineWidth=l;ct.beginPath();ct.moveTo(cx+66,fy-232);ct.quadraticCurveTo(cx+106,fy-150,cx+66,fy-66);ct.stroke()};
 ct.save();glowOn(ct,T.gg,10);bw('#07040a',9);ct.restore();bw(T.gl,5);bw(T.a1,2);
 ct.strokeStyle='rgba(235,225,210,.9)';ct.lineWidth=1.4;ct.beginPath();ct.moveTo(cx+66,fy-232);ct.lineTo(cx+30,fy-148);ct.lineTo(cx+66,fy-66);ct.stroke();
 ct.strokeStyle='#cfc7b8';ct.lineWidth=2.4;ct.beginPath();ct.moveTo(cx+28,fy-148);ct.lineTo(cx+104,fy-148);ct.stroke();
 ct.save();glowOn(ct,T.gg,8);ct.fillStyle=T.gl;poly(ct,[[cx+102,fy-155],[cx+120,fy-148],[cx+102,fy-141]]);ct.fill();ct.restore();
 hB(ct,cx+28,fy-148,6,6,T.s1,T.s2)},
mage(ct,T,W,H){const cx=W/2-8,fy=H-4;
 ct.save();ct.translate(cx,fy-6);ct.scale(1,.24);glowOn(ct,T.gg,8);ct.strokeStyle=T.gl;ct.lineWidth=2.6;ct.beginPath();ct.arc(0,0,64,0,TAU);ct.stroke();ct.lineWidth=1.4;ct.beginPath();ct.arc(0,0,48,0,TAU);ct.stroke();for(let i=0;i<8;i++){const an=i/8*TAU;rune(ct,Math.cos(an)*56,Math.sin(an)*56,6,i+3)}ct.restore();
 hF(ct,[[cx-30,fy-176],[cx+30,fy-176],[cx+48,fy-20],[cx+32,fy-8],[cx+16,fy-24],[cx,fy-8],[cx-16,fy-24],[cx-32,fy-8],[cx-48,fy-20]],T.a1,T.a2,fy-176,fy-8);
 hL(ct,[[cx-34,fy-30],[cx-17,fy-44],[cx,fy-30],[cx+17,fy-44],[cx+34,fy-30]],T,1.4,5);hL(ct,[[cx,fy-170],[cx,fy-36]],T,1.4,5);
 hF(ct,[[cx-38,fy-170],[cx-10,fy-188],[cx+12,fy-188],[cx+38,fy-170],[cx+32,fy-148],[cx-32,fy-148]],T.a2,'#0a0610',fy-188,fy-148);
 hF(ct,[[cx-24,fy-176],[cx-8,fy-228],[cx+4,fy-250],[cx+18,fy-224],[cx+28,fy-176],[cx+10,fy-160],[cx-14,fy-160]],T.a1,T.a2,fy-250,fy-160);
 hB(ct,cx+6,fy-190,12,15,'#0a0610','#000');hE(ct,cx+12,fy-192,3,T);hE(ct,cx+1,fy-191,2.6,T);
 hT(ct,cx+52,fy-26,cx+56,fy-222,6,'#4a3c38');
 hT(ct,cx+22,fy-160,cx+40,fy-148,10,T.a1);hT(ct,cx+40,fy-148,cx+54,fy-140,9,T.a1);
 ct.save();ct.globalCompositeOperation='lighter';let q=ct.createRadialGradient(cx+56,fy-236,2,cx+56,fy-236,34);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(.3,T.gl);q.addColorStop(1,'rgba(0,0,0,0)');ct.fillStyle=q;ct.beginPath();ct.arc(cx+56,fy-236,34,0,TAU);ct.fill();ct.restore();
 ct.save();glowOn(ct,T.gg,10);ct.strokeStyle=T.gl;ct.lineWidth=2;ct.beginPath();ct.arc(cx+56,fy-236,15,0,TAU);ct.stroke();rune(ct,cx+56,fy-236,7,5);ct.restore();
 ct.fillStyle=T.gl;for(let i=0;i<6;i++){const an=i/6*TAU+.5;ct.globalAlpha=.7;ct.beginPath();ct.arc(cx+56+Math.cos(an)*26,fy-236+Math.sin(an)*22,1.8,0,TAU);ct.fill()}ct.globalAlpha=1},
ogre(ct,T,W,H){const cx=W/2-14,fy=H-4;
 hF(ct,[[cx-60,fy-190],[cx-14,fy-206],[cx+10,fy-92],[cx-58,fy-84]],T.a2,'#0a0610',fy-206,fy-84);
 for(const sd of[-1,1]){const x=cx+sd*24;hF(ct,[[x-18,fy-96],[x+18,fy-96],[x+16,fy-26],[x-16,fy-26]],T.s1,T.s2,fy-96,fy-26);hF(ct,[[x-20,fy-72],[x+20,fy-72],[x+16,fy-30],[x-16,fy-30]],T.a1,T.a2,fy-72,fy-30);hF(ct,[[x-20,fy-28],[x+32,fy-28],[x+38,fy],[x-24,fy]],T.a2,'#0a0610',fy-28,fy)}
 hT(ct,cx-48,fy-176,cx-66,fy-130,18,T.s1);hT(ct,cx-66,fy-130,cx-52,fy-92,16,T.s1);
 hF(ct,[[cx-52,fy-186],[cx+54,fy-190],[cx+60,fy-132],[cx+40,fy-90],[cx-38,fy-90],[cx-58,fy-134]],T.s1,T.s2,fy-190,fy-90);
 hF(ct,[[cx-40,fy-178],[cx+42,fy-182],[cx+44,fy-134],[cx+28,fy-102],[cx-26,fy-102],[cx-44,fy-136]],T.a1,T.a2,fy-182,fy-102);
 hL(ct,[[cx,fy-178],[cx,fy-108]],T,2,7);hL(ct,[[cx-30,fy-146],[cx-6,fy-130]],T,1.4,5);hL(ct,[[cx+30,fy-146],[cx+6,fy-130]],T,1.4,5);
 hF(ct,[[cx-48,fy-110],[cx+46,fy-112],[cx+44,fy-92],[cx-46,fy-90]],T.a2,'#0a0610',fy-112,fy-90);hB(ct,cx,fy-101,8,8,T.gl,T.gg);
 for(const sd of[-1,1]){hF(ct,[[cx+sd*34,fy-186],[cx+sd*64,fy-196],[cx+sd*74,fy-160],[cx+sd*46,fy-150]],T.a1,T.a2,fy-196,fy-150);hSp(ct,cx+sd*58,fy-194,16,32,T);hSp(ct,cx+sd*70,fy-172,14,24,T)}
 hF(ct,[[cx-26,fy-202],[cx+30,fy-204],[cx+34,fy-176],[cx-24,fy-174]],T.a1,T.a2,fy-204,fy-174);
 hF(ct,[[cx-20,fy-200],[cx+24,fy-202],[cx+26,fy-182],[cx-18,fy-180]],T.a2,'#0a0610',fy-202,fy-180);
 for(const sd of[-1,1]){ct.beginPath();ct.moveTo(cx+4+sd*22,fy-198);ct.bezierCurveTo(cx+4+sd*52,fy-206,cx+4+sd*58,fy-236,cx+4+sd*38,fy-262);ct.bezierCurveTo(cx+4+sd*38,fy-232,cx+4+sd*30,fy-214,cx+4+sd*14,fy-206);ct.closePath();ct.fillStyle=T.a1;ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.stroke()}
 hE(ct,cx+14,fy-192,3.8,T);hE(ct,cx-2,fy-191,3.2,T);
 hT(ct,cx+44,fy-170,cx+78,fy-130,18,T.s1);hT(ct,cx+78,fy-130,cx+96,fy-148,16,T.s1);
 hT(ct,cx+90,fy-60,cx+100,fy-232,7,'#4a3c38');
 hF(ct,[[cx+98,fy-232],[cx+148,fy-222],[cx+158,fy-186],[cx+142,fy-152],[cx+98,fy-148]],T.a1,T.a2,fy-232,fy-148);
 ct.save();glowOn(ct,T.gg,12);ct.strokeStyle=T.gl;ct.lineWidth=2.4;ct.beginPath();ct.moveTo(cx+98,fy-232);ct.lineTo(cx+148,fy-222);ct.lineTo(cx+158,fy-186);ct.lineTo(cx+142,fy-152);ct.stroke();ct.restore();hL(ct,[[cx+110,fy-214],[cx+130,fy-196],[cx+114,fy-176]],T,1.3,4);
 hB(ct,cx+92,fy-146,12,12,T.s1,T.s2)},
golem(ct,T,W,H){const cx=W/2,fy=H-4;
 for(const sd of[-1,1]){const x=cx+sd*44;hF(ct,[[x-26,fy-130],[x+26,fy-130],[x+30,fy-30],[x-30,fy-30]],T.a1,T.a2,fy-130,fy-30);hF(ct,[[x-34,fy-34],[x+38,fy-34],[x+44,fy],[x-40,fy]],T.a2,'#0a0610',fy-34,fy);hL(ct,[[x-8,fy-110],[x+4,fy-80],[x-6,fy-52]],T,1.6,6)}
 for(const sd of[-1,1]){hT(ct,cx+sd*84,fy-232,cx+sd*108,fy-160,34,T.a1);hT(ct,cx+sd*108,fy-160,cx+sd*98,fy-86,32,T.a1);hF(ct,[[cx+sd*74,fy-96],[cx+sd*126,fy-96],[cx+sd*132,fy-48],[cx+sd*70,fy-48]],T.a1,T.a2,fy-96,fy-48);hL(ct,[[cx+sd*88,fy-90],[cx+sd*100,fy-70],[cx+sd*94,fy-54]],T,1.6,6)}
 hF(ct,[[cx-92,fy-250],[cx+92,fy-250],[cx+78,fy-150],[cx+46,fy-112],[cx-46,fy-112],[cx-78,fy-150]],T.a1,T.a2,fy-250,fy-112);
 hF(ct,[[cx-60,fy-236],[cx+60,fy-236],[cx+48,fy-150],[cx-48,fy-150]],T.a2,'#0a0610',fy-236,fy-150);
 for(const sd of[-1,1])hF(ct,[[cx+sd*70,fy-262],[cx+sd*112,fy-270],[cx+sd*128,fy-226],[cx+sd*96,fy-212],[cx+sd*66,fy-228]],T.a1,T.a2,fy-270,fy-212);
 ct.save();ct.globalCompositeOperation='lighter';let q=ct.createRadialGradient(cx,fy-190,2,cx,fy-190,56);q.addColorStop(0,T.gl);q.addColorStop(1,'rgba(0,0,0,0)');ct.globalAlpha=.8;ct.fillStyle=q;ct.beginPath();ct.arc(cx,fy-190,56,0,TAU);ct.fill();ct.restore();
 ct.save();glowOn(ct,T.gg,14);ct.strokeStyle=T.gl;ct.lineWidth=3;ct.beginPath();ct.arc(cx,fy-190,22,0,TAU);ct.stroke();rune(ct,cx,fy-190,13,9);ct.restore();
 hL(ct,[[cx-78,fy-240],[cx-56,fy-196],[cx-66,fy-160]],T,1.8,6);hL(ct,[[cx+78,fy-240],[cx+52,fy-200],[cx+62,fy-166]],T,1.8,6);hL(ct,[[cx-30,fy-236],[cx-12,fy-216]],T,1.4,5);
 hF(ct,[[cx-26,fy-278],[cx+26,fy-278],[cx+34,fy-244],[cx-34,fy-244]],T.a1,T.a2,fy-278,fy-244);
 hE(ct,cx+10,fy-262,4.4,T);hE(ct,cx-12,fy-262,4.4,T);hL(ct,[[cx-14,fy-250],[cx+14,fy-250]],T,1.6,5)},
pal(ct,T,W,H){const cx=W/2-16,fy=H-4;
 hF(ct,[[cx-60,fy-250],[cx-10,fy-262],[cx+8,fy-80],[cx-80,fy-46]],T.a2,'#0a0610',fy-262,fy-46);hL(ct,[[cx-62,fy-60],[cx-40,fy-52],[cx-14,fy-62]],T,1.4,5);
 for(const sd of[-1,1]){const x=cx+sd*22;hF(ct,[[x-16,fy-120],[x+16,fy-120],[x+14,fy-30],[x-14,fy-30]],T.a1,T.a2,fy-120,fy-30);hF(ct,[[x-18,fy-34],[x+30,fy-34],[x+36,fy],[x-22,fy]],T.a2,'#0a0610',fy-34,fy);hL(ct,[[x,fy-110],[x,fy-48]],T,1.4,5)}
 hF(ct,[[cx-44,fy-246],[cx+44,fy-248],[cx+40,fy-150],[cx+28,fy-112],[cx-28,fy-112],[cx-42,fy-152]],T.a1,T.a2,fy-248,fy-112);
 hF(ct,[[cx-30,fy-236],[cx+30,fy-238],[cx+26,fy-160],[cx-26,fy-160]],T.a2,'#0a0610',fy-238,fy-160);hL(ct,[[cx,fy-236],[cx,fy-120]],T,2,7);
 ct.save();glowOn(ct,T.gg,10);ct.strokeStyle=T.gl;ct.lineWidth=2;ct.beginPath();ct.arc(cx,fy-196,10,0,TAU);ct.stroke();rune(ct,cx,fy-196,6,4);ct.restore();
 for(const sd of[-1,1]){hF(ct,[[cx+sd*30,fy-250],[cx+sd*62,fy-262],[cx+sd*70,fy-224],[cx+sd*40,fy-212]],T.a1,T.a2,fy-262,fy-212);hSp(ct,cx+sd*54,fy-260,16,34,T)}
 hF(ct,[[cx-22,fy-276],[cx+24,fy-278],[cx+28,fy-250],[cx-20,fy-248]],T.a1,T.a2,fy-278,fy-248);hE(ct,cx+12,fy-262,3.4,T);hE(ct,cx-4,fy-262,3,T);
 for(const sd of[-1,1]){ct.beginPath();ct.moveTo(cx+2+sd*18,fy-272);ct.bezierCurveTo(cx+2+sd*50,fy-282,cx+2+sd*56,fy-312,cx+2+sd*34,fy-336);ct.bezierCurveTo(cx+2+sd*34,fy-308,cx+2+sd*26,fy-286,cx+2+sd*12,fy-278);ct.closePath();ct.fillStyle=T.a1;ct.fill();ct.strokeStyle='#07040a';ct.lineWidth=1.4;ct.stroke()}
 hT(ct,cx+40,fy-216,cx+64,fy-170,16,T.a1);hT(ct,cx+64,fy-170,cx+86,fy-176,14,T.a1);
 const sb=[[cx+84,fy-176],[cx+92,fy-190],[cx+176,fy-186],[cx+212,fy-174],[cx+176,fy-164],[cx+92,fy-160]];hF(ct,sb,T.a1,T.a2,fy-190,fy-160);
 ct.save();glowOn(ct,T.gg,14);ct.strokeStyle=T.gl;ct.lineWidth=2.2;ct.beginPath();ct.moveTo(cx+92,fy-190);ct.lineTo(cx+176,fy-186);ct.lineTo(cx+212,fy-174);ct.lineTo(cx+176,fy-164);ct.stroke();ct.restore();hL(ct,[[cx+100,fy-175],[cx+190,fy-175]],T,1.4,5);
 hF(ct,[[cx+70,fy-186],[cx+84,fy-186],[cx+84,fy-164],[cx+70,fy-164]],T.a2,'#0a0610',fy-186,fy-164);
 hF(ct,[[cx-44,fy-190],[cx-86,fy-196],[cx-92,fy-130],[cx-66,fy-92],[cx-40,fy-130]],T.a1,T.a2,fy-196,fy-92);hL(ct,[[cx-84,fy-180],[cx-70,fy-140],[cx-66,fy-106]],T,1.5,5)}};
const MSZ={gob:[170,170],wolf:[270,150],scorp:[260,150],arch:[210,270],mage:[200,282],ogre:[270,284],golem:[270,320],pal:[310,350]};
const MVC={};
function lvMon(k,i){const key=k+'@'+i;if(MVC[key])return MVC[key];const d=MSZ[k],f=MON[k];if(!d||!f)return null;const cv=mkc(d[0]*Q,d[1]*Q),ct=cv.getContext('2d');ct.scale(Q,Q);ct.lineJoin='round';ct.lineCap='round';f(ct,LT[i].m,d[0],d[1]);cv.naturalWidth=cv.width;cv.naturalHeight=cv.height;return MVC[key]=cv}
window.LVX={lvMon,LT,MSZ,MON};
const _foe6=foe;foe=function(e){if(dg||e.mt||!MON[e.k])return _foe6(e);const mk=e.m==8?1:Math.max(0,MPX.indexOf(e.m)),sp=lvMon(e.k,mk);if(!sp)return _foe6(e);
 const m=MS[e.k],o=MI[e.k],on=m.n,of=m.f;MI[e.k]=sp;m.f=1;m.n=e.k=='pal'?on:((NMN[mk]||{})[e.k]||on);
 try{_foe6(e)}finally{MI[e.k]=o;m.f=of;m.n=on}};
const _bgd7=bgd;bgd=function(gy){if(!dg&&!lg&&!vil)lvBg(gy);else _bgd7(gy)};
})();
