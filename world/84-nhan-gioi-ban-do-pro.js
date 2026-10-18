/*==== BẢN ĐỒ NHÂN GIỚI PRO (Fix260) ====
  Vẽ lại 5 bản đồ luyện cấp Nhân Giới bằng canvas, đẹp và tỉ mỉ hơn bản cũ:
  Huyết Nguyệt Sơn Môn · Tuyết Hàn Ma Phong · Xích Viêm Ma Ngục · U Minh Ma Cốc · Hư Không Ma Điện
  - Chỉ thay lớp nền (bgd) khi đang ở Nhân Giới (không phó bản, không làng, không Linh Giới). Quái/rơi đồ/logic giữ nguyên.
  - Dùng bảng màu LVX.LT (world/05-demon-boss.js). Nền dựng 1 lần rồi cache (2 lớp: trời + tiền cảnh), chỉ hiệu ứng động vẽ mỗi khung.
  - Tự giảm hiệu ứng khi window.QL>=1 (máy yếu). Tắt nhanh: window.NGPRO_OFF=1 */
(function(){
'use strict';
if(typeof bgd!=='function'||!window.LVX||!LVX.LT||LVX.LT.length<5)return;
const LT=LVX.LT,TAU=Math.PI*2,PI=Math.PI;
function srand(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const mkc=(w,h)=>{const o=document.createElement('canvas');o.width=Math.max(1,Math.ceil(w));o.height=Math.max(1,Math.ceil(h));return o};
const hex=h=>{h=String(h).replace('#','');if(h.length==3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]};
const rgbs=h=>hex(h).join(',');
const rgba=(h,a)=>'rgba('+rgbs(h)+','+a+')';
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>{const x=Math.round(v+(B[i]-v)*t);return(x<16?'0':'')+x.toString(16)}).join('')};
const rc=(s,a)=>'rgba('+s+','+a+')';
const clp=(v,a,b)=>v<a?a:v>b?b:v;
const poly=(ct,p)=>{ct.beginPath();p.forEach((q,i)=>i?ct.lineTo(q[0],q[1]):ct.moveTo(q[0],q[1]));ct.closePath()};
const glow=(ct,c,b)=>{ct.shadowColor=c;ct.shadowBlur=b},unglow=ct=>{ct.shadowBlur=0};
function mdp(r,n,rough){const a=new Float32Array(n+1);a[0]=r()-.5;a[n]=r()-.5;let st=n,sc=1;while(st>1){const h=st>>1;for(let i=h;i<n;i+=st)a[i]=(a[i-h]+a[i+h])/2+(r()-.5)*sc;sc*=rough;st=h}return a}
function glyph(ct,x,y,sz,seed){const r=srand(seed*977+13);ct.beginPath();ct.moveTo(x,y-sz);ct.lineTo(x,y+sz);const n=1+Math.floor(r()*3);for(let k=0;k<n;k++){const yy=y+(r()*2-1)*sz*.7,d=r()<.5?-1:1,l=sz*(.4+r()*.5);ct.moveTo(x,yy);ct.lineTo(x+d*l,yy+(r()-.5)*sz*.8)}if(r()<.5){ct.moveTo(x-sz*.5,y-sz*.2);ct.lineTo(x+sz*.5,y-sz*.2)}ct.stroke()}
function ridgePts(r,W,base,amp,rough,n){const a=mdp(r,n,rough),p=[];for(let k=0;k<=n;k++)p.push([W*k/n,base-a[k]*amp]);return p}
function fillRidge(ct,p,W,bot,top,c1,c2){const q=ct.createLinearGradient(0,top,0,bot);q.addColorStop(0,c1);q.addColorStop(1,c2);ct.beginPath();ct.moveTo(-2,bot);p.forEach(v=>ct.lineTo(v[0],v[1]));ct.lineTo(W+2,bot);ct.closePath();ct.fillStyle=q;ct.fill()}
function strokePath(ct,p){ct.beginPath();p.forEach((v,i)=>i?ct.lineTo(v[0],v[1]):ct.moveTo(v[0],v[1]));ct.stroke()}
const GS={};
function gsp(rgb,sz){const k=rgb+'|'+sz;if(GS[k])return GS[k];const c=mkc(sz,sz),x=c.getContext('2d'),q=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);q.addColorStop(0,'rgba('+rgb+',1)');q.addColorStop(.22,'rgba('+rgb+',.5)');q.addColorStop(.55,'rgba('+rgb+',.14)');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;x.fillRect(0,0,sz,sz);return GS[k]=c}
function bake(ct,rgb,x,y,r,a){ct.save();ct.globalCompositeOperation='lighter';ct.globalAlpha=a==null?1:a;ct.drawImage(gsp(rgb,64),x-r,y-r,r*2,r*2);ct.restore()}

/* ---------- TRỜI: gradient, tinh vân, sao, trăng, mây, núi xa ---------- */
function clouds(ct,W,gy,u,r,n,col,a0,y0,y1){for(let k=0;k<n;k++){const cx=r()*W,cy=gy*(y0+r()*(y1-y0)),rx=(70+r()*190)*u,ry=(7+r()*16)*u;ct.save();ct.translate(cx,cy);ct.scale(1,ry/rx);const q=ct.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,rgba(col,a0*(.6+r()*.5)));q.addColorStop(1,rgba(col,0));ct.fillStyle=q;ct.beginPath();ct.arc(0,0,rx,0,TAU);ct.fill();ct.restore()}}
function drawMoon(ct,W,gy,u,T,i,r,S){
 const mx=W*[.27,.75,.5,.28,.5][i],my=gy*[.15,.13,.27,.16,.2][i],mr=[30,27,46,28,36][i]*u*clp(W/420,.85,1.5),m2=T.moon[2];S.moon=[mx,my,mr];
 let q=ct.createRadialGradient(mx,my,mr*.7,mx,my,mr*4);q.addColorStop(0,'rgba('+m2+',.55)');q.addColorStop(.4,'rgba('+m2+',.15)');q.addColorStop(1,'rgba('+m2+',0)');ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr*4,0,TAU);ct.fill();
 if(i==2){ct.save();ct.translate(mx,my);for(let k=0;k<28;k++){const a=k/28*TAU,w=.05+(k%3)*.02;ct.fillStyle='rgba('+m2+',.10)';ct.beginPath();ct.moveTo(Math.cos(a-w)*mr,Math.sin(a-w)*mr);ct.lineTo(Math.cos(a)*mr*(2.6+(k%4)*.5),Math.sin(a)*mr*(2.6+(k%4)*.5));ct.lineTo(Math.cos(a+w)*mr,Math.sin(a+w)*mr);ct.fill()}ct.restore()}
 if(i==1){ct.strokeStyle='rgba(190,235,255,.28)';ct.lineWidth=2*u;ct.beginPath();ct.arc(mx,my,mr*2.7,0,TAU);ct.stroke();ct.strokeStyle='rgba(190,235,255,.12)';ct.lineWidth=5*u;ct.beginPath();ct.arc(mx,my,mr*2.95,0,TAU);ct.stroke();[-1,1].forEach(sd=>bake(ct,'200,240,255',mx+sd*mr*2.7,my,mr*.5,.7))}
 if(i==4){ct.save();ct.translate(mx,my);ct.rotate(-.35);ct.scale(1,.28);ct.strokeStyle='rgba(230,130,255,.5)';ct.lineWidth=5*u;ct.beginPath();ct.arc(0,0,mr*2.1,0,TAU);ct.stroke();ct.strokeStyle='rgba(255,200,255,.35)';ct.lineWidth=1.6*u;ct.beginPath();ct.arc(0,0,mr*2.35,0,TAU);ct.stroke();ct.restore()}
 q=ct.createRadialGradient(mx-mr*.3,my-mr*.3,2,mx,my,mr);q.addColorStop(0,i==4?'#12031c':T.moon[0]);q.addColorStop(1,i==4?'#05010a':T.moon[1]);ct.fillStyle=q;ct.beginPath();ct.arc(mx,my,mr,0,TAU);ct.fill();
 ct.save();ct.beginPath();ct.arc(mx,my,mr,0,TAU);ct.clip();
 if(i!=4){for(let k=0;k<8;k++){const a=r()*TAU,d=r()*mr*.75,cr=mr*(.08+r()*.16);ct.fillStyle='rgba(0,0,0,'+(.08+r()*.1)+')';ct.beginPath();ct.arc(mx+Math.cos(a)*d,my+Math.sin(a)*d,cr,0,TAU);ct.fill();ct.strokeStyle='rgba(255,255,255,.07)';ct.lineWidth=1;ct.stroke()}}
 if(i==3){ct.fillStyle='rgba(2,30,24,.5)';[-1,1].forEach(sd=>{ct.beginPath();ct.ellipse(mx+sd*mr*.34,my-mr*.1,mr*.17,mr*.22,0,0,TAU);ct.fill()});ct.beginPath();ct.moveTo(mx,my+mr*.08);ct.lineTo(mx-mr*.09,my+mr*.3);ct.lineTo(mx+mr*.09,my+mr*.3);ct.fill()}
 if(i==2){ct.fillStyle='rgba(30,4,2,.62)';ct.beginPath();ct.arc(mx+mr*.38,my-mr*.12,mr*.95,0,TAU);ct.fill()}
 ct.restore();
 if(i==4){ct.save();glow(ct,'#ff64d4',14*u);ct.strokeStyle=T.moon[0];ct.lineWidth=2.4*u;ct.beginPath();ct.arc(mx,my,mr,0,TAU);ct.stroke();ct.restore()}
 if(i==0){clouds(ct,W,gy,u,r,3,T.far,.55,.09,.22)}
}
function skyLayer(W,H,gy,u,T,i,D,S){
 const cv=mkc(W*D,H*D),ct=cv.getContext('2d');ct.scale(D,D);ct.lineJoin='round';ct.lineCap='round';
 const r=srand(1000+i*77);
 let q=ct.createLinearGradient(0,0,0,gy);[0,.28,.58,.84,1].forEach((p,k)=>q.addColorStop(p,T.sky[k]));ct.fillStyle=q;ct.fillRect(0,0,W,H);
 for(let k=0;k<4;k++){const x=W*(.1+r()*.8),y=gy*(.08+r()*.5),rr=Math.max(W,gy)*(.22+r()*.26);q=ct.createRadialGradient(x,y,0,x,y,rr);q.addColorStop(0,'rgba('+T.neb+','+(.30-k*.05)+')');q.addColorStop(1,'rgba('+T.neb+',0)');ct.fillStyle=q;ct.fillRect(0,0,W,gy)}
 const ns=Math.round(W*gy/2600);S.stars=[];ct.fillStyle='#fff';for(let k=0;k<ns;k++){const x=r()*W,y=r()*gy*.72,z=u*(.6+r()*1.3),a=.15+r()*.6;ct.globalAlpha=a;ct.fillRect(x,y,z,z);if(r()<.1){S.stars.push([x,y,z*1.6]);ct.globalAlpha=a*.5;ct.fillRect(x-z*2.2,y+z*.4,z*5,z*.25);ct.fillRect(x+z*.4-z*.2,y-z*2.2,z*.25,z*5)}}ct.globalAlpha=1;
 drawMoon(ct,W,gy,u,T,i,r,S);
 clouds(ct,W,gy,u,r,9,T.far,.34,.12,.7);clouds(ct,W,gy,u,r,5,mix(T.sky[3],'#ffffff',.3),.16,.45,.85);
 if(i==4){const px=W*.82,py=gy*.46,pr=26*u;q=ct.createRadialGradient(px-pr*.4,py-pr*.4,2,px,py,pr);q.addColorStop(0,'#c070e0');q.addColorStop(1,'#1c0630');ct.fillStyle=q;ct.beginPath();ct.arc(px,py,pr,0,TAU);ct.fill();ct.save();ct.translate(px,py);ct.rotate(-.4);ct.scale(1,.3);ct.strokeStyle='rgba(240,170,255,.55)';ct.lineWidth=3*u;ct.beginPath();ct.arc(0,0,pr*1.8,.05*PI,.95*PI,true);ct.stroke();ct.restore()}
 const sb=T.sky[4],ks=i==1?1.5:i==3?.9:1.15;
 const defs=[[.80,.16,.62,mix(T.far,sb,.38),.55],[.86,.14,.56,mix(T.far,sb,.16),.40],[.92,.12,.5,T.far,.24],[.97,.09,.46,mix(T.far,T.near,.55),.08]];
 defs.forEach((d,k)=>{const amp=gy*d[1]*ks,base=gy*d[0],p=ridgePts(r,W,base,amp,d[2],128);fillRidge(ct,p,W,gy+4,base-amp*1.2,d[3],mix(d[3],sb,d[4]));
  ct.strokeStyle=i==1?rgba('#dff6ff',.16+k*.07):rc(T.crack,.16+k*.07);ct.lineWidth=1.2*u;strokePath(ct,p);
  if(i==1){const thr=base-amp*.18;let run=[];const flush=()=>{if(run.length>2){ct.beginPath();run.forEach((v,j)=>j?ct.lineTo(v[0],v[1]):ct.moveTo(v[0],v[1]));for(let j=run.length-1;j>=0;j--){const dd=(thr-run[j][1])*(.5+r()*.5)+2*u;ct.lineTo(run[j][0],run[j][1]+dd)}ct.closePath();ct.fillStyle='rgba(236,250,255,'+(.35+k*.18)+')';ct.fill()}run=[]};p.forEach(v=>{if(v[1]<thr)run.push(v);else flush()});flush()}
  if(i==2&&k>=1){ct.save();glow(ct,T.crackG,6*u);ct.strokeStyle=rgba('#ffb040',.35+k*.1);ct.lineWidth=1.1*u;for(let n=0;n<5+k*2;n++){let j=Math.floor(r()*120),x=p[j][0],y=p[j][1];ct.beginPath();ct.moveTo(x,y);for(let m=0;m<5;m++){x+=(r()-.5)*14*u;y+=(4+r()*9)*u;ct.lineTo(x,y)}ct.stroke()}ct.restore()}
  if(i==3&&k==2){clouds(ct,W,gy,u,r,6,T.sky[4],.22,.78,.95)}
 });
 return cv}

/* ---------- KIẾN TRÚC / ĐỊA HÌNH TRUNG CẢNH (lớp tiền cảnh, trong suốt phía trên đường chân trời) ---------- */
function cliff(ct,x0,dir,w,h,gy,u,T,r,rimA){const n=44,a=mdp(r,64,.55),p=[[x0,gy+3]];for(let k=0;k<=n;k++){const t=k/n,env=Math.pow(1-t,.85);p.push([x0+dir*w*t,gy-h*env*clp(.78+.45*a[k],.25,1.2)])}p.push([x0+dir*w,gy+3]);
 const q=ct.createLinearGradient(0,gy-h,0,gy);q.addColorStop(0,mix(T.near,T.fl[0],.45));q.addColorStop(1,T.near);ct.beginPath();p.forEach((v,j)=>j?ct.lineTo(v[0],v[1]):ct.moveTo(v[0],v[1]));ct.closePath();ct.fillStyle=q;ct.fill();
 ct.strokeStyle=rc(T.crack,rimA||.38);ct.lineWidth=1.3*u;strokePath(ct,p.slice(1,-1));
 ct.strokeStyle='rgba(0,0,0,.35)';ct.lineWidth=1*u;for(let k=0;k<9;k++){const j=1+Math.floor(r()*(p.length-3)),v=p[j];ct.beginPath();ct.moveTo(v[0],v[1]+2*u);ct.lineTo(v[0]+(r()-.5)*14*u,v[1]+(14+r()*30)*u);ct.stroke()}
 return p}
function yAt(p,x){let b=p[1];for(const v of p)if(Math.abs(v[0]-x)<Math.abs(b[0]-x))b=v;return b[1]}
function roof(ct,cx,y,w,h,curl,fill,rim){ct.beginPath();ct.moveTo(cx-w*.2,y-h);ct.quadraticCurveTo(cx-w*.34,y-h*.2,cx-w*.5,y-curl*.2);ct.quadraticCurveTo(cx-w*.5-curl*.5,y-curl*.2,cx-w*.5-curl,y-curl*1.5);ct.quadraticCurveTo(cx-w*.34,y+h*.06,cx,y+h*.12);ct.quadraticCurveTo(cx+w*.34,y+h*.06,cx+w*.5+curl,y-curl*1.5);ct.quadraticCurveTo(cx+w*.5+curl*.5,y-curl*.2,cx+w*.5,y-curl*.2);ct.quadraticCurveTo(cx+w*.34,y-h*.2,cx+w*.2,y-h);ct.closePath();ct.fillStyle=fill;ct.fill();if(rim){ct.strokeStyle=rim;ct.lineWidth=1.2;ct.stroke()}}
function pagoda(ct,cx,base,w,tiers,u,T,S,col,lampRgb){
 const rim=rc(T.crack,.5);let y=base;
 for(let t=0;t<tiers;t++){const rw=w*(1-t*.5/tiers),bw=rw*.62,bh=w*.3*(1-t*.1),rh=w*.17,curl=rw*.07;
  ct.fillStyle=col;ct.fillRect(cx-bw/2,y-bh,bw,bh+1);ct.fillStyle='rgba(255,255,255,.04)';ct.fillRect(cx-bw/2,y-bh,bw*.12,bh);
  const nw=Math.max(2,Math.round(bw/(15*u)));
  for(let j=0;j<nw;j++){const wx=cx-bw/2+bw*(j+.5)/nw,ww=bw/nw*.38,wy=y-bh*.78,wh=bh*.56;ct.save();glow(ct,rc(T.win,.9),7*u);ct.fillStyle=rc(T.win,.92);ct.beginPath();ct.moveTo(wx-ww/2,wy+wh);ct.lineTo(wx-ww/2,wy+wh*.3);ct.quadraticCurveTo(wx,wy-wh*.15,wx+ww/2,wy+wh*.3);ct.lineTo(wx+ww/2,wy+wh);ct.fill();ct.restore()}
  ct.fillStyle='rgba(0,0,0,.45)';for(let j=0;j<=nw;j++)ct.fillRect(cx-bw/2+bw*j/nw-1*u,y-bh,2*u,bh);
  y-=bh;roof(ct,cx,y,rw,rh,curl,col,rim);
  ct.fillStyle=rc(T.crack,.5);for(const sd of[-1,1]){ct.beginPath();ct.arc(cx+sd*(rw*.5+curl),y-curl*1.5,1.6*u,0,TAU);ct.fill()}
  if(lampRgb)S.lamps.push({x:cx-rw*.5-curl,y:y-curl*1.1+5*u,r:9*u,rgb:lampRgb,ph:t},{x:cx+rw*.5+curl,y:y-curl*1.1+5*u,r:9*u,rgb:lampRgb,ph:t+2});
  y-=rh*.78}
 ct.fillStyle=col;ct.beginPath();ct.moveTo(cx-3*u,y+4*u);ct.lineTo(cx,y-w*.34);ct.lineTo(cx+3*u,y+4*u);ct.fill();ct.strokeStyle=rim;ct.lineWidth=1.1;ct.stroke();
 for(let k=0;k<3;k++){ct.beginPath();ct.ellipse(cx,y-w*.07-k*w*.07,3.4*u,1.6*u,0,0,TAU);ct.fill();ct.stroke()}
 bake(ct,rgbs(T.rune),cx,y-w*.34,10*u,.8);S.sparks.push([cx,y-w*.34,5*u])}
function catenary(ct,x1,y1,x2,y2,sag,n,u,T,S,rgb){ct.strokeStyle='rgba(0,0,0,.55)';ct.lineWidth=1*u;ct.beginPath();const P=[];for(let k=0;k<=n*4;k++){const t=k/(n*4),x=x1+(x2-x1)*t,y=y1+(y2-y1)*t+Math.sin(t*PI)*sag;P.push([x,y]);k?ct.lineTo(x,y):ct.moveTo(x,y)}ct.stroke();
 for(let k=1;k<n;k++){const v=P[k*4];ct.save();glow(ct,'rgb('+rgb+')',8*u);ct.fillStyle='rgb('+rgb+')';ct.beginPath();ct.ellipse(v[0],v[1]+4*u,2.6*u,3.6*u,0,0,TAU);ct.fill();ct.restore();ct.fillStyle='rgba(0,0,0,.5)';ct.fillRect(v[0]-1.4*u,v[1]+7.4*u,2.8*u,1.4*u);S.lamps.push({x:v[0],y:v[1]+4*u,r:11*u,rgb,ph:k*1.7})}}
function land0(ct,W,gy,u,T,r,S){
 const cx=W/2,col=mix(T.near,'#2a0c10',.35),H0=gy*.62,w=Math.min(H0/2.5,W*.36);
 const cl=cliff(ct,0,1,W*.34,gy*.38,gy,u,T,r),cr=cliff(ct,W,-1,W*.34,gy*.34,gy,u,T,r);
 const sw=Math.min(W*.15,70*u);pagoda(ct,W*.13,yAt(cl,W*.13)+3*u,sw,3,u,T,S,col,'255,150,60');pagoda(ct,W*.87,yAt(cr,W*.87)+3*u,sw*.9,3,u,T,S,col,'255,150,60');
 const pw=Math.min(W*.58,330*u);
 for(let k=0;k<3;k++){const ww=pw*(1-k*.2),h=10*u,y=gy-k*h;ct.fillStyle=mix(col,'#5a1a1c',.1+k*.06);ct.fillRect(cx-ww/2,y-h,ww,h+1);ct.fillStyle=rc(T.crack,.28);ct.fillRect(cx-ww/2,y-h,ww,1.3*u);ct.fillStyle='rgba(0,0,0,.4)';for(let b=0;b<ww/(8*u);b++)ct.fillRect(cx-ww/2+b*8*u+2*u,y-h*.85,2.2*u,h*.7)}
 const sy=gy-30*u;for(let k=0;k<10;k++){const ww=pw*.26*(1-k*.02),y=gy-k*3*u;ct.fillStyle=k%2?'rgba(255,170,100,.16)':'rgba(0,0,0,.35)';ct.fillRect(cx-ww/2,y-3*u,ww,3*u)}
 pagoda(ct,cx,sy,w,5,u,T,S,col,'255,140,50');
 catenary(ct,W*.13+sw*.5,gy*.45,cx-w*.5,gy*.52,12*u,Math.max(3,Math.round(W/70)),u,T,S,'255,80,50');catenary(ct,cx+w*.5,gy*.52,W*.87-sw*.45,gy*.46,12*u,Math.max(3,Math.round(W/70)),u,T,S,'255,80,50');
 [-1,1].forEach(sd=>{const x=cx+sd*pw*.34;ct.fillStyle=col;ct.fillRect(x-3*u,gy-70*u,6*u,70*u);ct.fillStyle='#a8322c';ct.fillRect(x-9*u,gy-66*u,18*u,40*u);ct.fillStyle=rc(T.crack,.5);ct.fillRect(x-9*u,gy-66*u,18*u,1.4*u);ct.save();ct.strokeStyle='#ffd08a';ct.lineWidth=1.6*u;glow(ct,'#ff7a30',5*u);glyph(ct,x,gy-46*u,7*u,sd+4);ct.restore()})}
function mountain(ct,x,top,bw,gy,u,T,r){const L=[],R=[];for(let k=0;k<=7;k++){const t=k/7,y=gy-(gy-top)*Math.pow(t,.85);L.push([x-bw/2*(1-t)+(r()-.5)*bw*.04*(1-t),y+(r()-.5)*(gy-top)*.03]);R.push([x+bw/2*(1-t)+(r()-.5)*bw*.04*(1-t),y+(r()-.5)*(gy-top)*.03])}
 const mid=[];for(let k=0;k<=7;k++){const t=k/7;mid.push([x+(r()-.5)*bw*.06*t,top+(gy-top)*t])}
 poly(ct,[...L,...R.slice().reverse()]);ct.fillStyle=mix(T.near,T.sky[2],.35);ct.fill();
 const q=ct.createLinearGradient(x-bw/2,0,x,0);q.addColorStop(0,mix(T.sky[3],'#ffffff',.3));q.addColorStop(1,mix(T.sky[2],'#ffffff',.5));poly(ct,[...L,...mid.slice().reverse()]);ct.fillStyle=q;ct.globalAlpha=.9;ct.fill();ct.globalAlpha=1;
 ct.strokeStyle='rgba(255,255,255,.35)';ct.lineWidth=1*u;for(let k=0;k<7;k++){const a=L[1+Math.floor(r()*6)],b=mid[2+Math.floor(r()*5)];ct.beginPath();ct.moveTo(a[0],a[1]);ct.lineTo(b[0]+(r()-.5)*8*u,b[1]);ct.stroke()}
 ct.beginPath();ct.moveTo(L[6][0],L[6][1]);for(let k=0;k<5;k++){ct.lineTo(L[6][0]+(R[6][0]-L[6][0])*(k+.5)/5,L[6][1]+(k%2?14:3)*u+(r()*8)*u)}ct.lineTo(R[6][0],R[6][1]);ct.lineTo(x,top-1);ct.closePath();ct.fillStyle='rgba(240,252,255,.92)';ct.fill()}
function spire(ct,x,base,w,h,u,T,S){const y1=base-h*.8,y2=base-h,L=x-w/2,R=x+w/2;
 let q=ct.createLinearGradient(L,0,x,0);q.addColorStop(0,mix(T.neb.split(',').reduce((a,v,i)=>a+(+v<16?'0':'')+(+v).toString(16),'#'),'#ffffff',.55));q.addColorStop(1,'#4a8cc8');poly(ct,[[L,base],[L,y1],[x,y2],[x,base]]);ct.fillStyle=q;ct.globalAlpha=.92;ct.fill();
 q=ct.createLinearGradient(x,0,R,0);q.addColorStop(0,'#2c68a8');q.addColorStop(1,'#0c2a50');poly(ct,[[x,base],[x,y2],[R,y1],[R,base]]);ct.fillStyle=q;ct.fill();ct.globalAlpha=1;
 ct.strokeStyle='rgba(225,248,255,.75)';ct.lineWidth=1.1*u;ct.beginPath();ct.moveTo(x,y2);ct.lineTo(x,base);ct.moveTo(L,y1);ct.lineTo(x,y2);ct.lineTo(R,y1);ct.stroke();
 ct.fillStyle='rgba(255,255,255,.28)';ct.fillRect(L+w*.12,y1+h*.08,w*.06,h*.55);bake(ct,'120,220,255',x,base-h*.45,w*.9,.35);S.sparks.push([x,y2,4*u])}
function pine(ct,x,base,h,u,col){ct.fillStyle=col;for(let k=0;k<5;k++){const t=k/5,y=base-h*(.12+t*.72),ww=h*.36*(1-t*.8);poly(ct,[[x-ww,y+h*.16],[x,y-h*.1],[x+ww,y+h*.16]]);ct.fill();ct.fillStyle='rgba(235,248,255,.8)';poly(ct,[[x-ww*.8,y+h*.1],[x,y-h*.1],[x+ww*.8,y+h*.1],[x+ww*.3,y+h*.03],[x,y+h*.08],[x-ww*.4,y+h*.02]]);ct.fill();ct.fillStyle=col}ct.fillRect(x-1.2*u,base-h*.1,2.4*u,h*.12)}
function land1(ct,W,gy,u,T,r,S){
 const cx=W/2;mountain(ct,W*.5,gy*.28,W*.9,gy,u,T,r);mountain(ct,W*.12,gy*.5,W*.55,gy,u,T,r);mountain(ct,W*.9,gy*.46,W*.55,gy,u,T,r);
 const hh=Math.min(gy*.5,W*1.0);[[0,1],[-.075,.7],[.075,.76],[-.15,.48],[.155,.52],[-.22,.3],[.23,.33]].forEach((s,k)=>spire(ct,cx+s[0]*W*(W<500?1.05:.8),gy-2*u,Math.min(W*.06,34*u)*(1.1-k*.04),hh*s[1],u,T,S));
 ct.fillStyle=mix(T.near,'#1c4a80',.5);ct.fillRect(cx-W*.2,gy-gy*.08,W*.4,gy*.08+1);for(let k=0;k<12;k++){ct.fillRect(cx-W*.2+k*W*.4/12+2*u,gy-gy*.08-4*u,W*.4/12-4*u,4*u)}
 for(let k=0;k<5;k++){const x=cx-W*.16+k*W*.08;ct.save();glow(ct,'rgba(120,230,255,.9)',6*u);ct.fillStyle='rgba(150,235,255,.9)';ct.beginPath();ct.moveTo(x-2.6*u,gy-3*u);ct.lineTo(x-2.6*u,gy-gy*.045);ct.quadraticCurveTo(x,gy-gy*.065,x+2.6*u,gy-gy*.045);ct.lineTo(x+2.6*u,gy-3*u);ct.fill();ct.restore()}
 const cl=cliff(ct,0,1,W*.3,gy*.3,gy,u,T,r,.5),cr=cliff(ct,W,-1,W*.3,gy*.26,gy,u,T,r,.5);
 for(let k=0;k<7;k++){const x=W*.06+k*W*.012+r()*8*u,y0=yAt(cl,x);const q=ct.createLinearGradient(0,y0,0,gy);q.addColorStop(0,'rgba(220,248,255,.85)');q.addColorStop(1,'rgba(120,200,255,.25)');ct.strokeStyle=q;ct.lineWidth=(1.6+r()*3)*u;ct.beginPath();ct.moveTo(x,y0+4*u);ct.lineTo(x+(r()-.5)*2*u,gy);ct.stroke()}
 bake(ct,'150,230,255',W*.09,gy-4*u,26*u,.5);
 [[.05,.2],[.2,.15],[.8,.17],[.95,.22]].forEach((a,k)=>pine(ct,W*a[0],gy+2*u,gy*a[1]*(1+(k%2)*.4),u,mix(T.near,'#0a2848',.5)));
 const q=ct.createLinearGradient(0,gy-30*u,0,gy);q.addColorStop(0,'rgba(190,235,255,0)');q.addColorStop(1,'rgba(190,235,255,.28)');ct.fillStyle=q;ct.fillRect(0,gy-30*u,W,30*u)}
function tower(ct,x,base,w,h,u,T,col,horn){ct.fillStyle=col;ct.fillRect(x-w/2,base-h,w,h+1);ct.fillRect(x-w*.62,base-h-6*u,w*1.24,6*u);for(let k=0;k<5;k++)ct.fillRect(x-w*.62+k*w*1.24/5,base-h-12*u,w*1.24/5*.6,6*u);
 ct.strokeStyle=col;ct.lineWidth=3.2*u;for(const sd of[-1,1]){ct.beginPath();ct.moveTo(x+sd*w*.5,base-h-6*u);ct.quadraticCurveTo(x+sd*(w*.5+horn*.6),base-h-horn*.2,x+sd*(w*.35+horn*.5),base-h-horn*1.2);ct.stroke()}
 ct.save();glow(ct,'#ff8a10',8*u);ct.fillStyle='#ffb040';ct.beginPath();ct.moveTo(x-w*.14,base-h*.5);ct.lineTo(x-w*.14,base-h*.7);ct.quadraticCurveTo(x,base-h*.82,x+w*.14,base-h*.7);ct.lineTo(x+w*.14,base-h*.5);ct.fill();ct.restore();
 ct.strokeStyle=rc(T.crack,.4);ct.lineWidth=1.1;ct.beginPath();ct.moveTo(x-w/2,base);ct.lineTo(x-w/2,base-h);ct.stroke()}
function land2(ct,W,gy,u,T,r,S){
 const vx=W*.5,vt=gy*.3,vb=Math.min(W*.5,330*u),col=mix(T.near,'#000000',.2);
 clouds(ct,W,gy,u,r,5,'#1a0604',.8,.05,.28);bake(ct,'255,110,30',vx,vt,vb*.5,.7);
 const L=[],R=[];for(let k=0;k<=9;k++){const t=k/9;L.push([vx-vb*(.12+.88*t)+(r()-.5)*vb*.05,vt+(gy-vt)*Math.pow(t,.75)]);R.push([vx+vb*(.12+.88*t)+(r()-.5)*vb*.05,vt+(gy-vt)*Math.pow(t,.75)])}
 const q=ct.createLinearGradient(0,vt,0,gy);q.addColorStop(0,'#3a140c');q.addColorStop(.5,'#1c0806');q.addColorStop(1,'#0e0403');poly(ct,[...L,...R.slice().reverse()]);ct.fillStyle=q;ct.fill();
 ct.strokeStyle=rc(T.crack,.55);ct.lineWidth=1.4*u;strokePath(ct,L);strokePath(ct,R);
 ct.save();glow(ct,'#ff6a10',10*u);const rv=[[-.06,.1,-.22],[.05,.12,.18],[-.01,.1,.02],[.08,.1,.34]];
 rv.forEach((a,k)=>{let x=vx+a[0]*vb,y=vt+4*u;const P=[[x,y]];for(let m=0;m<9;m++){x+=a[2]*vb*.1+(r()-.5)*vb*.06;y+=(gy-vt)*.105;P.push([x,y])}[[9*u,'rgba(255,90,10,.22)'],[4*u,'rgba(255,140,30,.8)'],[1.6*u,'#ffe6a0']].forEach(l=>{ct.strokeStyle=l[1];ct.lineWidth=l[0]*(.6+k%2*.3);ct.lineJoin='round';strokePath(ct,P)});S.lava.push(P[P.length-1])});ct.restore();
 ct.fillStyle='#ffc060';ct.save();glow(ct,'#ff8a10',16*u);ct.beginPath();ct.ellipse(vx,vt+2*u,vb*.14,5*u,0,0,TAU);ct.fill();ct.restore();
 tower(ct,W*.1,gy,Math.min(W*.1,48*u),gy*.34,u,T,col,16*u);tower(ct,W*.2,gy,Math.min(W*.07,34*u),gy*.22,u,T,col,12*u);tower(ct,W*.9,gy,Math.min(W*.1,48*u),gy*.3,u,T,col,16*u);tower(ct,W*.8,gy,Math.min(W*.07,34*u),gy*.2,u,T,col,12*u);
 ct.fillStyle=col;ct.fillRect(W*.1,gy-gy*.1,W*.1,gy*.1);ct.fillRect(W*.8,gy-gy*.09,W*.1,gy*.09);
 for(let g0=0;g0<2;g0++){for(let k=0;k<7;k++){const x=(g0?W*.62:W*.26)+k*10*u,h=(30+r()*34)*u;const qq=ct.createLinearGradient(x,0,x+8*u,0);qq.addColorStop(0,'#2a0e08');qq.addColorStop(1,'#0c0302');poly(ct,[[x,gy+2],[x,gy-h],[x+4*u,gy-h-3*u],[x+8*u,gy-h],[x+8*u,gy+2]]);ct.fillStyle=qq;ct.fill();ct.strokeStyle=rc(T.crack,.4);ct.lineWidth=1;ct.stroke()}}
 const ly=gy-16*u,lq=ct.createLinearGradient(0,ly,0,gy);lq.addColorStop(0,'rgba(255,120,20,.0)');lq.addColorStop(.35,'rgba(255,150,40,.85)');lq.addColorStop(1,'rgba(255,70,10,.95)');ct.fillStyle=lq;ct.fillRect(0,ly,W,16*u+1);ct.strokeStyle='rgba(255,230,150,.7)';ct.lineWidth=1.2*u;for(let k=0;k<30;k++){const x=r()*W,y=ly+(4+r()*11)*u;ct.beginPath();ct.moveTo(x,y);ct.lineTo(x+(10+r()*26)*u,y);ct.stroke()}}
function skull(ct,x,y,sz,u,T,S,bone){const q=ct.createLinearGradient(0,y-sz*.5,0,y+sz*.6);q.addColorStop(0,mix(bone,'#ffffff',.2));q.addColorStop(1,mix(bone,'#10241e',.45));ct.fillStyle=q;ct.beginPath();ct.ellipse(x,y,sz*.5,sz*.46,0,0,TAU);ct.fill();poly(ct,[[x-sz*.3,y+sz*.25],[x+sz*.3,y+sz*.25],[x+sz*.24,y+sz*.62],[x-sz*.24,y+sz*.62]]);ct.fill();
 ct.fillStyle='#021410';[-1,1].forEach(sd=>{ct.beginPath();ct.ellipse(x+sd*sz*.2,y+sz*.04,sz*.13,sz*.15,sd*.2,0,TAU);ct.fill();S.lamps.push({x:x+sd*sz*.2,y:y+sz*.05,r:sz*.2,rgb:'60,255,190',ph:sd+2});bake(ct,'60,255,190',x+sd*sz*.2,y+sz*.05,sz*.2,.9)});
 ct.beginPath();ct.moveTo(x,y+sz*.2);ct.lineTo(x-sz*.06,y+sz*.34);ct.lineTo(x+sz*.06,y+sz*.34);ct.fill();ct.fillStyle='#04180f';for(let k=-3;k<=3;k++)ct.fillRect(x+k*sz*.07-sz*.012,y+sz*.46,sz*.025,sz*.16);ct.strokeStyle='rgba(0,0,0,.4)';ct.lineWidth=1*u;ct.beginPath();ct.moveTo(x+sz*.12,y-sz*.45);ct.lineTo(x+sz*.04,y-sz*.2);ct.lineTo(x+sz*.1,y-sz*.1);ct.stroke()}
function deadTree(ct,x,y,len,ang,d,u,col,S,r){if(d<0||len<3*u)return;const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;ct.strokeStyle=col;ct.lineWidth=Math.max(1,d*1.5*u);ct.beginPath();ct.moveTo(x,y);ct.quadraticCurveTo((x+x2)/2+(r()-.5)*len*.3,(y+y2)/2,x2,y2);ct.stroke();
 if(d<2&&r()<.5){ct.strokeStyle='rgba(120,255,200,.4)';ct.lineWidth=.8*u;ct.beginPath();ct.moveTo(x2,y2);ct.lineTo(x2,y2+(10+r()*16)*u);ct.stroke()}
 if(d==2&&r()<.5)S.lamps.push({x:x2,y:y2+8*u,r:10*u,rgb:'80,255,200',ph:r()*6});
 const n=d>1?2:1+(r()<.4?1:0);for(let k=0;k<n;k++)deadTree(ct,x2,y2,len*(.66+r()*.12),ang+(k?1:-1)*(.4+r()*.5)+(r()-.5)*.3,d-1,u,col,S,r)}
function land3(ct,W,gy,u,T,r,S){
 const cx=W/2,bone=mix('#b8d0c0',T.far,.4),col=T.near;
 const p=ridgePts(r,W,gy*.9,gy*.1,.5,64);ct.beginPath();ct.moveTo(0,gy+3);ct.lineTo(W*.22,gy+3);const hw=Math.min(W*.4,230*u),ht=gy*.5;ct.lineTo(cx-hw,gy*.9);ct.bezierCurveTo(cx-hw*.9,gy-ht,cx-hw*.4,gy-ht*1.18,cx,gy-ht*1.2);ct.bezierCurveTo(cx+hw*.4,gy-ht*1.18,cx+hw*.9,gy-ht,cx+hw,gy*.9);ct.lineTo(W*.78,gy+3);ct.closePath();
 let q=ct.createLinearGradient(0,gy-ht*1.2,0,gy);q.addColorStop(0,mix(T.near,T.sky[2],.4));q.addColorStop(1,T.near);ct.fillStyle=q;ct.fill();ct.strokeStyle=rc(T.crack,.4);ct.lineWidth=1.4*u;ct.stroke();
 skull(ct,cx,gy-ht*.62,Math.min(hw*.95,ht*.95),u,T,S,bone);
 [-1,1].forEach(sd=>{for(let k=0;k<5;k++){const x=cx+sd*(W*.2+k*22*u),h=gy*(.3-k*.025);ct.strokeStyle='rgba(0,0,0,.6)';ct.lineWidth=8*u;ct.beginPath();ct.moveTo(x,gy+2);ct.bezierCurveTo(x-sd*h*.1,gy-h*.9,x-sd*h*.3,gy-h*1.05,x-sd*h*.6,gy-h*.75);ct.stroke();ct.strokeStyle=bone;ct.lineWidth=5*u;ct.stroke();ct.strokeStyle='rgba(255,255,255,.3)';ct.lineWidth=1.3*u;ct.stroke()}});
 [[.06,1],[.94,-1],[.33,1],[.7,-1]].forEach((a,k)=>{deadTree(ct,W*a[0],gy+2*u,gy*(.1+(k<2?.05:0)),-PI/2+a[1]*.15,4,u,k<2?'#040c0b':mix(T.near,'#04100e',.6),S,r)});
 for(let k=0;k<14;k++){const x=W*(.04+r()*.92),h=(10+r()*14)*u,w=h*.6;ct.fillStyle=mix(T.near,'#2a4a42',.3);ct.beginPath();ct.moveTo(x-w/2,gy+2);ct.lineTo(x-w/2,gy-h*.7);ct.quadraticCurveTo(x,gy-h*1.2,x+w/2,gy-h*.7);ct.lineTo(x+w/2,gy+2);ct.fill();ct.strokeStyle=rc(T.crack,.35);ct.lineWidth=1;ct.stroke()}
 q=ct.createLinearGradient(0,gy-40*u,0,gy+2);q.addColorStop(0,'rgba(120,255,210,0)');q.addColorStop(1,'rgba(120,255,210,.3)');ct.fillStyle=q;ct.fillRect(0,gy-40*u,W,42*u)}
function land4(ct,W,gy,u,T,r,S){
 const cx=W/2,rx=Math.min(W*.13,70*u),ry=Math.min(gy*.32,rx*2.6),py=gy-ry*.96;
 bake(ct,'200,80,255',cx,py,ry*2.3,.7);
 for(let k=0;k<16;k++){const a=k/16*TAU+r()*.2,l1=ry*(1.1+r()*.9);ct.strokeStyle='rgba(255,150,240,'+(.18+r()*.2)+')';ct.lineWidth=(.8+r()*1.4)*u;ct.beginPath();let x=cx+Math.cos(a)*rx*.9,y=py+Math.sin(a)*ry*.9;ct.moveTo(x,y);for(let m=0;m<4;m++){x+=Math.cos(a)*l1*.22+(r()-.5)*9*u;y+=Math.sin(a)*l1*.22+(r()-.5)*9*u;ct.lineTo(x,y)}ct.stroke()}
 let q=ct.createRadialGradient(cx,py,0,cx,py,ry);q.addColorStop(0,'#fff0ff');q.addColorStop(.25,'#ff80e0');q.addColorStop(.6,'#7a1aa8');q.addColorStop(1,'#14031e');ct.save();ct.beginPath();ct.ellipse(cx,py,rx,ry,0,0,TAU);ct.clip();ct.fillStyle=q;ct.fillRect(cx-rx,py-ry,rx*2,ry*2);ct.fillStyle='#fff';for(let k=0;k<40;k++){ct.globalAlpha=.3+r()*.6;ct.fillRect(cx+(r()-.5)*rx*1.8,py+(r()-.5)*ry*1.8,u*1.1,u*1.1)}ct.globalAlpha=1;ct.restore();
 ct.save();glow(ct,'#ff64d4',16*u);ct.strokeStyle='#ffc8f4';ct.lineWidth=2.2*u;ct.beginPath();ct.ellipse(cx,py,rx,ry,0,0,TAU);ct.stroke();ct.strokeStyle='rgba(255,100,220,.6)';ct.lineWidth=5*u;ct.beginPath();ct.ellipse(cx,py,rx*1.1,ry*1.06,0,0,TAU);ct.stroke();ct.restore();S.portal=[cx,py,rx,ry];
 const col=mix(T.near,'#06020c',.4);[[.08,.36],[.2,.2],[.8,.24],[.93,.4],[.34,.12],[.66,.14]].forEach((a,k)=>{const x=W*a[0],h=gy*a[1],w=Math.min(W*.05,26*u)*(1+(k%2)*.3);const qq=ct.createLinearGradient(x-w/2,0,x+w/2,0);qq.addColorStop(0,'#2a1248');qq.addColorStop(.5,'#12061f');qq.addColorStop(1,'#08030f');ct.beginPath();ct.moveTo(x-w/2,gy+2);ct.lineTo(x-w/2,gy-h*.8);ct.lineTo(x-w*.2,gy-h*.86);ct.lineTo(x+w*.1,gy-h*.78);ct.lineTo(x+w*.5,gy-h);ct.lineTo(x+w/2,gy-h*.7);ct.lineTo(x+w/2,gy+2);ct.closePath();ct.fillStyle=qq;ct.fill();ct.strokeStyle='rgba(225,110,255,.55)';ct.lineWidth=1.2*u;ct.stroke();ct.save();ct.strokeStyle=T.rune;glow(ct,T.runeG,6*u);ct.lineWidth=1.2*u;for(let m=0;m<Math.floor(h/(26*u));m++)glyph(ct,x,gy-h*.7+m*24*u,5*u,k*7+m);ct.restore()});
 for(let k=0;k<4;k++){const x=cx+(k-1.5)*W*.1,w=14*u,h=(20+r()*20)*u;ct.fillStyle=col;ct.fillRect(x-w/2,gy-h,w,h+2);ct.strokeStyle='rgba(225,110,255,.4)';ct.lineWidth=1;ct.strokeRect(x-w/2,gy-h,w,h+2)}
 S.islands=[];[[.2,.34,.26],[.8,.3,.22],[.66,.58,.16],[.34,.6,.14]].forEach((a,k)=>{const w=Math.min(W*a[2],130*u),cv=mkc(w*1.4+20,w*1.1+30),c2=cv.getContext('2d');const rr=srand(40+k),ox=cv.width/2,oy=22;
  c2.lineJoin='round';poly(c2,[[ox-w*.5,oy],[ox+w*.5,oy],[ox+w*.4,oy+w*.12]]);const top=[[ox-w*.5,oy],[ox-w*.3,oy-4*u],[ox+w*.1,oy-3*u],[ox+w*.5,oy]],und=[[ox+w*.5,oy],[ox+w*.36,oy+w*.14]];let pts=[...top];for(let m=1;m<6;m++)pts.push([ox+w*(.5-m*.17)*(1-m*.05)+(rr()-.5)*w*.06,oy+w*(.14+Math.sin(m/6*PI)*.3)*(.8+rr()*.4)]);pts.push([ox,oy+w*.62],[ox-w*.5,oy]);
  const gq=c2.createLinearGradient(0,oy,0,oy+w*.65);gq.addColorStop(0,'#3a1c58');gq.addColorStop(1,'#0c0416');poly(c2,[[ox-w*.5,oy],[ox-w*.38,oy+w*.14],[ox-w*.24,oy+w*.3],[ox-w*.1,oy+w*.5],[ox,oy+w*.64],[ox+w*.12,oy+w*.48],[ox+w*.26,oy+w*.3],[ox+w*.4,oy+w*.14],[ox+w*.5,oy]]);c2.fillStyle=gq;c2.fill();c2.strokeStyle='rgba(225,110,255,.6)';c2.lineWidth=1.2*u;c2.stroke();
  c2.fillStyle='#2a1442';poly(c2,[[ox-w*.5,oy],[ox-w*.45,oy-5*u],[ox+w*.45,oy-5*u],[ox+w*.5,oy]]);c2.fill();c2.strokeStyle='rgba(255,170,255,.5)';c2.stroke();
  const pc='#120620';for(let m=0;m<3;m++){const x=ox-w*.22+m*w*.2,h=(14+rr()*20)*u;c2.fillStyle=pc;c2.fillRect(x-2.5*u,oy-5*u-h,5*u,h);c2.strokeStyle='rgba(255,130,230,.5)';c2.strokeRect(x-2.5*u,oy-5*u-h,5*u,h)}
  c2.fillStyle=pc;roof(c2,ox+w*.2,oy-5*u-12*u,w*.22,8*u,3*u,pc,'rgba(255,130,230,.6)');
  for(let m=0;m<3;m++){const x=ox-w*.25+m*w*.2;c2.strokeStyle='rgba(255,140,240,.8)';c2.lineWidth=1.2*u;c2.beginPath();c2.moveTo(x,oy+w*.2+m*8*u);c2.lineTo(x+1.5*u,oy+w*.2+m*8*u+10*u);c2.stroke()}
  const gl=c2.createRadialGradient(ox,oy+w*.3,0,ox,oy+w*.3,w*.5);gl.addColorStop(0,'rgba(220,90,255,.4)');gl.addColorStop(1,'rgba(220,90,255,0)');c2.fillStyle=gl;c2.fillRect(0,0,cv.width,cv.height);
  S.islands.push({cv,x:W*a[0],y:gy*a[1],ph:k*1.9,w:cv.width,h:cv.height})})}
const LAND=[land0,land1,land2,land3,land4];

/* ---------- MẶT ĐẤT: gạch phối cảnh, vết nứt phát sáng, trận pháp, vật trang trí, trụ đá hai bên ---------- */
function floorLayer(ct,W,H,gy,u,T,i,r,S){
 const cx=W/2,fh=H-gy;let q=ct.createLinearGradient(0,gy,0,H);q.addColorStop(0,mix(T.fl[0],T.sky[4],.12));q.addColorStop(.25,T.fl[0]);q.addColorStop(1,T.fl[1]);ct.fillStyle=q;ct.fillRect(0,gy,W,fh+1);
 const R=11,vpx=cx,ys=[];for(let k=0;k<=R;k++)ys.push(gy+fh*Math.pow(k/R,1.75));
 const seam=i==2?'rgba(255,110,20,.38)':i==4?'rgba(210,100,255,.24)':i==3?'rgba(80,255,190,.16)':i==1?'rgba(210,240,255,.2)':'rgba(0,0,0,.5)';
 for(let k=0;k<R;k++){const y0=ys[k],y1=ys[k+1],t0=(y0-gy)/fh,t1=(y1-gy)/fh,sp0=lerp(14*u,150*u,t0),sp1=lerp(14*u,150*u,t1),J=Math.ceil(W/2/sp1)+2;
  for(let j=-J;j<J;j++){const a=r();ct.fillStyle=a<.35?'rgba(0,0,0,'+(.04+r()*.14)+')':a<.55?(i==1?'rgba(220,245,255,':'rgba(255,230,200,')+(.02+r()*.06)+')':'rgba(0,0,0,0)';if(a<.55){poly(ct,[[vpx+j*sp0,y0],[vpx+(j+1)*sp0,y0],[vpx+(j+1)*sp1,y1],[vpx+j*sp1,y1]]);ct.fill()}}}
 ct.lineWidth=1.3*u;ct.strokeStyle=seam;if(i==2||i==4){ct.save();glow(ct,i==2?'#ff6a10':'#c040ff',3*u)}
 for(let k=0;k<=R;k++){ct.beginPath();ct.moveTo(0,ys[k]);ct.lineTo(W,ys[k]);ct.stroke()}
 for(let j=-18;j<=18;j++){ct.beginPath();ct.moveTo(vpx+j*14*u,gy);ct.lineTo(vpx+j*150*u,H);ct.stroke()}
 if(i==2||i==4)ct.restore();
 ct.strokeStyle=i==1?'rgba(255,255,255,.1)':'rgba(255,255,255,.05)';ct.lineWidth=1;for(let k=1;k<=R;k++){ct.beginPath();ct.moveTo(0,ys[k]+1.5);ct.lineTo(W,ys[k]+1.5);ct.stroke()}
 if(i==1){for(let k=0;k<5;k++){const x=r()*W,y=gy+fh*(.2+r()*.7),w=(60+r()*120)*u;const g2=ct.createLinearGradient(x-w,y,x+w,y);g2.addColorStop(0,'rgba(200,240,255,0)');g2.addColorStop(.5,'rgba(220,248,255,.22)');g2.addColorStop(1,'rgba(200,240,255,0)');ct.fillStyle=g2;ct.beginPath();ct.ellipse(x,y,w,9*u,0,0,TAU);ct.fill()}}
 if(i==0){for(let k=0;k<6;k++){const x=r()*W,y=gy+fh*(.25+r()*.7),w=(24+r()*50)*u;const g2=ct.createRadialGradient(x,y,0,x,y,w);g2.addColorStop(0,'rgba(120,10,20,.55)');g2.addColorStop(1,'rgba(120,10,20,0)');ct.fillStyle=g2;ct.beginPath();ct.ellipse(x,y,w,w*.28,0,0,TAU);ct.fill()}}
 const nc=i==2?12:i==4?10:8;ct.lineJoin='round';
 for(let k=0;k<nc;k++){let x=r()*W,y=gy+fh*(.08+r()*.9);const P=[[x,y]],n=4+Math.floor(r()*4);for(let m=0;m<n;m++){x+=(r()-.5)*130*u;y=clp(y+(r()-.4)*26*u,gy+6*u,H-2);P.push([x,y])}
  ct.save();ct.strokeStyle=rc(T.crack,.2);ct.lineWidth=9*u;strokePath(ct,P);ct.strokeStyle=rc(T.crack,.95);ct.lineWidth=1.8*u;glow(ct,T.crackG,10*u);strokePath(ct,P);ct.strokeStyle='rgba(255,255,255,.55)';ct.lineWidth=.7*u;strokePath(ct,P);ct.restore();
  for(let m=1;m<P.length-1;m++)if(r()<.5){ct.strokeStyle=rc(T.crack,.7);ct.lineWidth=1*u;ct.beginPath();ct.moveTo(P[m][0],P[m][1]);ct.lineTo(P[m][0]+(r()-.5)*40*u,P[m][1]+(r()-.2)*14*u);ct.stroke()}
  if(i==2)S.lava.push(P[Math.floor(P.length/2)])}
 const ecx=cx,ecy=gy+fh*.5,erx=Math.min(W*.34,300*u),ery=Math.min(fh*.34,erx*.34);
 ct.save();ct.strokeStyle=rc(T.cgb,.4);glow(ct,T.circG,9*u);[[1,2.2],[.93,1.1],[.7,1.4],[.5,1]].forEach(a=>{ct.lineWidth=a[1]*u;ct.beginPath();ct.ellipse(ecx,ecy,erx*a[0],ery*a[0],0,0,TAU);ct.stroke()});
 ct.strokeStyle=rc(T.cgb,.34);ct.lineWidth=1.3*u;const pt=[];for(let k=0;k<5;k++){const a=-PI/2+k*TAU*2/5;pt.push([ecx+Math.cos(a)*erx*.93,ecy+Math.sin(a)*ery*.93])}ct.beginPath();ct.moveTo(pt[0][0],pt[0][1]);[2,4,1,3,0].forEach(k=>ct.lineTo(pt[k][0],pt[k][1]));ct.stroke();
 ct.strokeStyle=rc(T.cgb,.55);ct.lineWidth=1.4*u;for(let k=0;k<28;k++){const a=k/28*TAU;ct.beginPath();ct.moveTo(ecx+Math.cos(a)*erx*.86,ecy+Math.sin(a)*ery*.86);ct.lineTo(ecx+Math.cos(a)*erx*.93,ecy+Math.sin(a)*ery*.93);ct.stroke()}
 ct.strokeStyle=T.rune;ct.lineWidth=1.5*u;for(let k=0;k<20;k++){const a=k/20*TAU+.1;glyph(ct,ecx+Math.cos(a)*erx*.8,ecy+Math.sin(a)*ery*.8,Math.min(5*u,ery*.12),k+60)}ct.restore();
 ct.save();ct.globalAlpha=.35;bake(ct,T.cgb,ecx,ecy,erx*.5,.5);ct.restore();
 for(let k=0;k<26;k++){const x=r()*W,y=gy+fh*(.12+r()*.85),s2=(3+r()*7)*u*(.5+(y-gy)/fh);
  if(i==0||i==3){ct.fillStyle=i==3?'#8aa89a':'#6a5a58';ct.beginPath();ct.ellipse(x,y,s2,s2*.55,0,0,TAU);ct.fill();ct.fillStyle='rgba(0,0,0,.4)';ct.beginPath();ct.ellipse(x-s2*.3,y-s2*.1,s2*.28,s2*.2,0,0,TAU);ct.ellipse(x+s2*.3,y-s2*.1,s2*.28,s2*.2,0,0,TAU);ct.fill()}
  else if(i==1){ct.fillStyle='rgba(210,240,255,.7)';poly(ct,[[x-s2*.5,y],[x,y-s2*2],[x+s2*.5,y]]);ct.fill();ct.strokeStyle='rgba(255,255,255,.8)';ct.lineWidth=.8;ct.stroke()}
  else if(i==2){ct.fillStyle='#120504';ct.beginPath();ct.ellipse(x,y,s2*1.1,s2*.6,0,0,TAU);ct.fill();ct.strokeStyle='rgba(255,140,40,.6)';ct.lineWidth=1;ct.stroke()}
  else{ct.fillStyle='rgba(225,120,255,.7)';poly(ct,[[x,y-s2],[x+s2*.5,y],[x,y+s2*.6],[x-s2*.5,y]]);ct.fill();bake(ct,'220,100,255',x,y,s2*2,.4)}}
 const gq=ct.createLinearGradient(0,gy,0,gy+18*u);gq.addColorStop(0,rc(T.crack,.45));gq.addColorStop(1,rc(T.crack,0));ct.fillStyle=gq;ct.fillRect(0,gy,W,18*u)}
const lerp=(a,b,t)=>a+(b-a)*t;
function sidePillars(ct,W,H,gy,u,T,i,r,S){
 [[-.012,.085,-1,1],[.927,.088,1,1],[.17,.045,0,.62],[.79,.045,0,.5]].forEach((a,k)=>{const x=W*a[0],w=W*a[1],top=k<2?-10*u:gy-(k==2?200+i*12:250-i*10)*u*.8,bot=gy+4*u+(k<2?0:0);
  const n=14,pts=[[x,bot]];for(let m=0;m<=n;m++){const t=m/n;pts.push([x+w*(.04+(r()-.5)*.08)+(k<2?0:w*(1-Math.abs(t-.5)*0)*0),bot-(bot-top)*t])}
  const L=[],Rr=[];for(let m=0;m<=n;m++){const y=bot-(bot-top)*m/n;L.push([x+w*(.02+(r()-.5)*.1),y]);Rr.push([x+w*(.98+(r()-.5)*.1),y])}
  Rr[n][1]+=0;const tp=[[x+w*.3,top],[x+w*.5,top+16*u],[x+w*.8,top-8*u]];
  poly(ct,[...L,...tp,...Rr.slice().reverse()]);const q=ct.createLinearGradient(x,0,x+w,0);q.addColorStop(0,T.pil[0]);q.addColorStop(.45,T.pil[1]);q.addColorStop(1,T.pil[2]);ct.globalAlpha=a[3];ct.fillStyle=q;ct.fill();ct.strokeStyle='#050206';ct.lineWidth=2*u;ct.stroke();
  ct.strokeStyle=rc(T.crack,.4);ct.lineWidth=1.3*u;strokePath(ct,L.slice(0,-1));
  ct.save();glow(ct,T.runeG,10*u);ct.strokeStyle=T.rune;ct.lineWidth=1.8*u;const nn=Math.floor((bot-top-30*u)/(46*u));for(let m=0;m<nn;m++)glyph(ct,x+w*.5,top+40*u+m*46*u,Math.min(13*u,w*.18),k*31+m+i*5);ct.restore();
  ct.strokeStyle='rgba(0,0,0,.5)';ct.lineWidth=1.4*u;for(let m=0;m<5;m++){const yy=top+(bot-top)*r();ct.beginPath();ct.moveTo(x+w*r()*.4,yy);ct.lineTo(x+w*(.5+r()*.5),yy+(r()-.5)*40*u);ct.stroke()}ct.globalAlpha=1});
 [.04,.17,.835,.955].forEach((a,k)=>{const x=W*a,bw=(16+(k%2)*4)*u;ct.fillStyle=mix(T.near,T.pil[1],.5);poly(ct,[[x-bw,gy-7*u],[x+bw,gy-7*u],[x+bw*.6,gy+3*u],[x-bw*.6,gy+3*u]]);ct.fill();ct.strokeStyle=rc(T.crack,.55);ct.lineWidth=1.2*u;ct.stroke();S.flames.push({x,y:gy-6*u,h:(i==2?96:62+k%2*22)*u,w:13*u,k})})}

/* ---------- ĐỘNG: vòng pháp trận trên trời, lửa, đèn lồng, hạt, sương ---------- */
function circleSprite(T){const S0=512,mk=()=>{const c=mkc(S0,S0),x=c.getContext('2d');x.translate(S0/2,S0/2);x.lineCap='round';return[c,x]};
 const[O,xo]=mk(),[I,xi]=mk(),col=T.circ,gl=T.circG;
 xo.strokeStyle=col;xo.shadowColor=gl;xo.shadowBlur=10;[[250,3],[236,1.4],[196,2],[188,1]].forEach(a=>{xo.lineWidth=a[1];xo.beginPath();xo.arc(0,0,a[0],0,TAU);xo.stroke()});
 xo.lineWidth=1.6;for(let k=0;k<72;k++){const a=k/72*TAU,l=k%6?8:18;xo.beginPath();xo.moveTo(Math.cos(a)*236,Math.sin(a)*236);xo.lineTo(Math.cos(a)*(236-l),Math.sin(a)*(236-l));xo.stroke()}
 for(let k=0;k<24;k++){const a=k/24*TAU;xo.save();xo.translate(Math.cos(a)*216,Math.sin(a)*216);xo.rotate(a+PI/2);xo.lineWidth=1.8;glyph(xo,0,0,9,k+3);xo.restore()}
 xi.strokeStyle=col;xi.shadowColor=gl;xi.shadowBlur=9;xi.lineWidth=2;xi.beginPath();xi.arc(0,0,170,0,TAU);xi.stroke();xi.lineWidth=1.2;xi.beginPath();xi.arc(0,0,120,0,TAU);xi.stroke();
 for(let n=0;n<2;n++){xi.beginPath();for(let k=0;k<3;k++){const a=-PI/2+k*TAU/3+n*PI/3;k?xi.lineTo(Math.cos(a)*170,Math.sin(a)*170):xi.moveTo(Math.cos(a)*170,Math.sin(a)*170)}xi.closePath();xi.stroke()}
 for(let k=0;k<8;k++){const a=k/8*TAU;xi.save();xi.translate(Math.cos(a)*145,Math.sin(a)*145);xi.rotate(a+PI/2);glyph(xi,0,0,8,k+30);xi.restore()}
 return{O,I,S:S0}}
function flame(x,y,h,w,seed,t,c){const sw=Math.sin(t*.22+seed)*w*.5,sw2=Math.sin(t*.31+seed*2)*w*.3,q=g.createLinearGradient(0,y,0,y-h);q.addColorStop(0,c[0]);q.addColorStop(.35,c[1]);q.addColorStop(1,c[2]);g.fillStyle=q;g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w*1.1,y-h*.4,x-w*.3+sw,y-h*.7,x+sw2,y-h);g.bezierCurveTo(x+w*.3+sw,y-h*.7,x+w*1.1,y-h*.4,x+w,y);g.closePath();g.fill()}
const FOG={};function fogSp(W,u,rgb){const k=W+'|'+u+rgb;if(FOG[k])return FOG[k];const c=mkc(W,70*u),x=c.getContext('2d'),r=srand(5);for(let n=0;n<14;n++){const cx=r()*W,rx=(60+r()*120)*u,ry=(10+r()*14)*u,cy=c.height*(.35+r()*.4);x.save();x.translate(cx,cy);x.scale(1,ry/rx);const q=x.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'rgba('+rgb+',.22)');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;[0,-W,W].forEach(o=>{x.save();x.translate(o,0);x.beginPath();x.arc(0,0,rx,0,TAU);x.fill();x.restore()});x.restore()}return FOG[k]=c}
const C={k:'',B:null};
function build(gy,i){const D=Math.min(DPR||1,2),T=LT[i],u=s,S={lamps:[],sparks:[],lava:[],flames:[],stars:[],islands:[]};
 const sky=skyLayer(W,H,gy,u,T,i,D,S);const fg=mkc(W*D,H*D),ct=fg.getContext('2d');ct.scale(D,D);ct.lineJoin='round';ct.lineCap='round';const r=srand(2000+i*91);
 LAND[i](ct,W,gy,u,T,r,S);floorLayer(ct,W,H,gy,u,T,i,r,S);sidePillars(ct,W,H,gy,u,T,i,r,S);
 const q=ct.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.78);q.addColorStop(0,'rgba(8,2,10,0)');q.addColorStop(1,'rgba(8,2,10,.55)');ct.fillStyle=q;ct.fillRect(0,0,W,H);
 S.circ=circleSprite(T);return{sky,fg,S,T}}
function drawGlowSp(rgb,x,y,r,a){g.globalAlpha=a;g.drawImage(gsp(rgb,64),x-r,y-r,r*2,r*2)}
function draw(gy){
 const i=clp(mapSel|0,0,4),T=LT[i],key=[W,H,s.toFixed(3),gy|0,DPR,i].join('|');
 if(C.k!==key||!C.B){C.B=build(gy,i);C.k=key}
 const B=C.B,S=B.S,t=fr|0,u=s,cx=W*.5,QL=window.QL|0,fx=T.fx;
 g.drawImage(B.sky,0,0,W,H);
 g.save();g.globalCompositeOperation='lighter';
 S.stars.forEach((v,j)=>drawGlowSp('255,255,255',v[0],v[1],v[2]*3,.3+.35*Math.sin(t*.06+j*1.7)));
 if(S.moon)drawGlowSp(T.moon[2],S.moon[0],S.moon[1],S.moon[2]*3.2,.2+.1*Math.sin(t*.03));
 if(i==1){const st=QL?12:6;for(let b=0;b<3;b++){g.strokeStyle=b==1?'rgba(120,255,200,.07)':'rgba(120,180,255,.07)';g.lineWidth=st+2;g.beginPath();for(let x=0;x<=W;x+=st){const y0=gy*(.2+b*.07)+Math.sin(x*.012+t*.012+b*2)*gy*.04,h=gy*.17*(.55+.45*Math.sin(x*.02+t*.02+b));g.moveTo(x,y0);g.lineTo(x+Math.sin(t*.01+b)*6,y0+h)}g.stroke()}}
 if(i==4){for(let k=0;k<2;k++){g.globalAlpha=.07;g.fillStyle=k?'#ff60d0':'#8040ff';g.beginPath();g.ellipse(cx,gy*(.3+k*.12),W*.4,gy*.1,Math.sin(t*.004+k)*.1,0,TAU);g.fill()}}
 else{const cy=gy*.36,r=Math.min(W*.3,gy*.52),sc=r/256,C0=S.circ;g.save();g.globalAlpha=T.ca+.12*Math.sin(t*.05);g.translate(cx,cy);g.save();g.rotate(t*.004);g.scale(sc,sc);g.drawImage(C0.O,-C0.S/2,-C0.S/2);g.restore();if(!QL){g.save();g.rotate(-t*.006);g.scale(sc,sc);g.drawImage(C0.I,-C0.S/2,-C0.S/2);g.restore()}g.restore()}
 g.restore();
 S.islands.forEach(v=>{const y=v.y+Math.sin(t*.02+v.ph)*5*u;g.drawImage(v.cv,v.x-v.w/2,y)});
 g.drawImage(B.fg,0,0,W,H);
 g.save();g.globalCompositeOperation='lighter';
 S.lamps.forEach(l=>{drawGlowSp(l.rgb,l.x,l.y,l.r*(1+.15*Math.sin(t*.07+l.ph)),.5+.25*Math.sin(t*.09+l.ph*1.3))});
 S.sparks.forEach((v,j)=>{const a=.5+.5*Math.sin(t*.08+j*2.1);g.globalAlpha=a*.9;g.fillStyle='#fff';const z=v[2];g.fillRect(v[0]-z*2.2,v[1]-.5*u,z*4.4,u);g.fillRect(v[0]-.5*u,v[1]-z*2.2,u,z*4.4);drawGlowSp('255,255,255',v[0],v[1],z*2,a*.5)});
 g.globalAlpha=1;
 const big=fx=='lava'?1.5:1;S.flames.forEach((f,j)=>{drawGlowSp(T.cgb,f.x,f.y-f.h*.4,f.h*.9,.35+.12*Math.sin(t*.2+j));g.globalAlpha=1;flame(f.x,f.y,f.h*big*.8,f.w,j,t,T.fc);flame(f.x+f.w*.9,f.y,f.h*.5,f.w*.65,j+4,t,T.fc);flame(f.x-f.w*.8,f.y,f.h*.42,f.w*.6,j+7,t,T.fc)});g.globalAlpha=1;
 if(fx=='ember'){const n=QL?24:46;for(let j=0;j<n;j++){const x=((j*131)+Math.sin(t*.02+j)*30+j*7)%W,y=H-((j*53+t*(.5+(j%5)*.25))%(H*.92)),a=.4+.5*Math.abs(Math.sin(t*.05+j));g.fillStyle=j%4?'rgba(255,150,50,'+a+')':'rgba(255,225,150,'+a+')';g.fillRect(x,y,u*(1+j%3*.6),u*(1+j%3*.6));if(j%6==0)drawGlowSp('255,140,60',x,y,5*u,a*.6)}
  g.fillStyle='rgba(255,110,130,.7)';for(let j=0;j<(QL?6:14);j++){const x=((j*97)+t*(.3+j%3*.15)+Math.sin(t*.03+j)*20)%(W+40)-20,y=((j*61)+t*(.4+j%4*.15))%(gy*1.1);g.save();g.translate(x,y);g.rotate(t*.04+j);g.beginPath();g.ellipse(0,0,2.6*u,1.2*u,0,0,TAU);g.fill();g.restore()}}
 else if(fx=='snow'){const n=QL?40:86;g.fillStyle='#fff';for(let j=0;j<n;j++){const z=u*(.8+j%3*.7),x=(j*97+Math.sin(t*.02+j)*30+t*(.3+j%3*.2))%W,y=(j*53+t*(.7+j%3*.5))%H;g.globalAlpha=.55+.3*(j%3)/2;g.fillRect(x,y,z,z)}g.globalAlpha=1;const fq=fogSp(Math.ceil(W),u,'190,230,255');const o=-(t*.25)%W;g.globalAlpha=.9;g.drawImage(fq,o,gy-40*u);g.drawImage(fq,o+W,gy-40*u);g.globalAlpha=1}
 else if(fx=='lava'){const pl=.55+.2*Math.sin(t*.06);const q=g.createLinearGradient(0,gy-30*u,0,gy+30*u);q.addColorStop(0,'rgba(255,100,20,0)');q.addColorStop(.5,'rgba(255,120,30,'+pl*.35+')');q.addColorStop(1,'rgba(255,100,20,0)');g.fillStyle=q;g.fillRect(0,gy-30*u,W,60*u);
  S.lava.forEach((v,j)=>{const p=((t*.018+j*.37)%1);g.strokeStyle='rgba(255,190,80,'+(1-p)*.8+')';g.lineWidth=1.4*u;g.beginPath();g.ellipse(v[0],v[1],(2+p*12)*u,(1+p*4)*u,0,0,TAU);g.stroke()});
  const n=QL?36:72;for(let j=0;j<n;j++){const x=((j*131)+Math.sin(t*.02+j)*30+j*7)%W,y=H-((j*53+t*(.5+(j%5)*.25))%(H*.92)),a=.4+.5*Math.abs(Math.sin(t*.05+j));g.fillStyle=j%4?'rgba(255,150,50,'+a+')':'rgba(255,225,150,'+a+')';g.fillRect(x,y,u*(1+j%3*.7),u*(1+j%3*.7))}
  g.fillStyle='rgba(255,150,60,.06)';for(let k=0;k<3;k++){g.beginPath();g.ellipse(W*(.3+k*.2),gy*.28+Math.sin(t*.01+k)*8*u,W*.2,gy*.06,0,0,TAU);g.fill()}}
 else if(fx=='wisp'){const fq=fogSp(Math.ceil(W),u,'120,255,210');[[0,.2,1],[.5,.15,-1]].forEach(a=>{const o=((t*a[1]*a[2])%W+W)%W;g.globalAlpha=.9;g.drawImage(fq,-o,gy-34*u+a[0]*30*u);g.drawImage(fq,W-o,gy-34*u+a[0]*30*u)});
  const n=QL?9:18;for(let j=0;j<n;j++){const x=((j*173+t*(.2+j%4*.1))%(W+80))-40,y=gy*(.4+.5*((j*37)%100)/100)+Math.sin(t*.03+j)*18*u,rr=(12+j%4*6)*u,a=.35+.25*Math.sin(t*.04+j);for(let m=0;m<3;m++)drawGlowSp('120,255,200',x-m*7*u,y+Math.sin(t*.03+j-m*.3)*2*u,rr*(1-m*.25),a*(1-m*.3))}
  g.globalAlpha=1;g.fillStyle='rgba(150,255,210,.7)';for(let j=0;j<(QL?14:30);j++){const x=(j*131+Math.sin(t*.02+j)*24)%W,y=H-((j*47+t*(.4+j%5*.2))%(H*.9));g.fillRect(x,y,u*1.6,u*1.6)}}
 else if(fx=='void'&&S.portal){const[px,py,rx,ry]=S.portal;g.save();g.translate(px,py);for(let k=0;k<3;k++){g.save();g.rotate(t*.01*(k%2?-1:1)+k);g.strokeStyle='rgba(255,170,240,'+(.45-k*.1)+')';g.lineWidth=(2.2-k*.5)*u;g.setLineDash([2*u,10*u]);g.lineDashOffset=-t*(1+k);g.beginPath();g.ellipse(0,0,rx*(1.05+k*.12),ry*(1.03+k*.1),0,0,TAU);g.stroke();g.restore()}g.setLineDash([]);g.restore();
  drawGlowSp('255,120,230',px,py,ry*(1.5+.12*Math.sin(t*.07)),.5);
  const n=QL?20:44;for(let j=0;j<n;j++){const p=((t*.004+j*.137)%1),a=j*2.4+p*5,d=(1-p)*Math.max(W*.45,ry*2),x=px+Math.cos(a)*d,y=py+Math.sin(a)*d*.55;g.globalAlpha=Math.sin(p*PI)*.8;g.fillStyle=j%3?'#ff90e8':'#d8b0ff';g.fillRect(x,y,u*1.5,u*1.5)}g.globalAlpha=1;
  if(t%120<5){g.strokeStyle='rgba(255,210,255,.85)';g.lineWidth=1.6*u;g.shadowColor='#ff64d4';g.shadowBlur=10*u;let x=px,y=py;g.beginPath();g.moveTo(x,y);const sd=((t/120|0)%2)?1:-1;for(let m=0;m<7;m++){x+=sd*W*.07+(Math.sin(t+m*3)*8)*u;y+=(gy*.05)*(m%2?-.4:1);g.lineTo(x,y)}g.stroke()}}
 g.restore()}

const _prev=bgd;
bgd=function(gy){
 try{if(!window.NGPRO_OFF&&!dg&&!vil&&!lg&&window.LGI==null){draw(gy);return}}catch(e){if(!window.__ngproErr){window.__ngproErr=1;console.error('NGPRO',e)}window.NGPRO_OFF=1}
 _prev(gy)};
window.NGPRO={rebuild(){C.k='';C.B=null}};
})();
