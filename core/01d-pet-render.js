/* core/01d-pet-render.js — glowSpr/glowDraw, pm, vẽ Huyền Vũ/Rồng, epstep, drawEP (vòng thú nuôi gốc)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
function glowSpr(c){let o=GLC[c];if(!o){o=document.createElement('canvas');o.width=o.height=96;const q=o.getContext('2d'),r=q.createRadialGradient(48,48,0,48,48,48);r.addColorStop(0,RGBA(c,.9));r.addColorStop(.35,RGBA(c,.38));r.addColorStop(1,RGBA(c,0));q.fillStyle=r;q.fillRect(0,0,96,96);GLC[c]=o}return o}
/* Fix424: bỏ save/restore, bỏ qua quầng quá mờ / quá nhỏ (quầng cộng sáng là phần tốn fill-rate nhất khi vẽ thú) */
function glowDraw(x,y,r,c,a){if(!(a>.012)||!(r>.6))return;const o=g.globalCompositeOperation,oa=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSpr(c),x-r,y-r,r*2,r*2);g.globalCompositeOperation=o;g.globalAlpha=oa}
function pm(p){return PT4[p.k].m*(1+.06*(p.lv-1))*(1+.35*p.ev)}

/* ===== Huyền Vũ: tư thế cắn / gồng khiên + vẽ lát cắt (rắn uốn lượn) ===== */
const sm3=x=>x*x*(3-2*x);
function hvW(u,kind){if(kind)return 0;if(u<.3)return -.22*Math.sin(u/.3*1.5708);if(u<.5)return -.22+1.22*sm3((u-.3)/.2);return 1-sm3((u-.5)/.5)}
function hvY(u,kind){if(kind)return u<.5?Math.sin(u/.5*1.5708)*10:Math.cos((u-.5)/.5*1.5708)*10;const v=(u-.28)/.34;return v>0&&v<1?Math.sin(v*3.1416)*8:0}
/* Fix286 — hoạt ảnh Huyền Vũ: lưới 14×14 mảnh, mỗi mảnh dịch theo bước chân / đầu gật / rắn đung đưa / tư thế đánh.
   Ảnh luôn quay mặt sang PHẢI (+x). Gốc toạ độ = giữa đáy chân. at = tiến độ đòn 0..1; EP.mt: 0 bắn · 1 bổ nhào · 2 kỹ năng. */
const HV_HEAD=[[.62,.78,.35,.62],[.60,.76,.42,.66],[.66,.80,.50,.72],[.70,.84,.55,.78]];
function hvOcc(im,C,R){if(im.__occ)return im.__occ;const iw=im.naturalWidth,ih=im.naturalHeight,o=new Uint8Array(C*R).fill(1);
 try{const cv=document.createElement('canvas');cv.width=iw;cv.height=ih;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,iw,ih).data;
  for(let j=0;j<R;j++)for(let i=0;i<C;i++){let a=0;const x0=Math.floor(i*iw/C),x1=Math.floor((i+1)*iw/C),y0=Math.floor(j*ih/R),y1=Math.floor((j+1)*ih/R);
   for(let yy=y0;yy<y1&&!a;yy+=2)for(let xx=x0;xx<x1;xx+=2)if(d[(yy*iw+xx)*4+3]>8){a=1;break}o[j*C+i]=a}}catch(e){}
 return im.__occ=o}
function hvDust(u,ww,n,big){const H=window.PFH;if(!H||!H.fp)return;const d=EP.d||1;
 for(let i=0;i<n;i++)H.fp(EP.x+(u-.5)*ww/s*d+(Math.random()-.5)*6,1+Math.random()*2,{c:'rgba(214,230,238,.75)',r:(big?3:2)+Math.random()*2,l:(big?22:15)+(Math.random()*8|0),vx:-d*(.2+Math.random()*.35)*(big?2:1)+(Math.random()-.5)*.5,vy:.25+Math.random()*(big?.7:.35),f:.93})}
function hvDraw(im,ww,hh,ev,at,atk,kind,mvf,t){
 const iw=im.naturalWidth,ih=im.naturalHeight;if(!iw||!ih)return;
 const C=20,R=16,PI=Math.PI,ss=(a,b,x)=>{const q=Math.max(0,Math.min(1,(x-a)/(b-a)));return q*q*(3-2*q)},bp=(c,w)=>{const q=(at-c)/w;return Math.exp(-q*q)};
 const mt=atk?(EP.mt!==undefined?EP.mt:(kind?2:0)):-1,ph=(EP.ph||0)*1.1,mv=Math.min(1,mvf||0),fv=(EP.vx||0)*(EP.d||1),n=1+(ev>=2?1:0)+(ev>=3?1:0);
 let rt=0,lg=0,cr=0,jp=0,ip=0,rs=0,sl=0;
 if(mt==0){rt=bp(.05,.06);for(let i=0;i<n;i++)lg+=bp(.15+i*.2,.055)}
 else if(mt==1){cr=ss(0,.16,at)*(1-ss(.18,.36,at));jp=bp(.34,.09);lg=bp(.45,.08);ip=bp(.53,.05)}
 else if(mt==2){rs=ss(0,.38,at)*(1-ss(.46,.58,at));sl=bp(.55,.05)}
 /* bụi theo bước chân / va đất */
 if(mv>.45){const k0=Math.floor((ph-PI/2)/(2*PI)),k1=Math.floor((ph+PI/2)/(2*PI));
  if(EP.hvK0!==undefined){if(k0!==EP.hvK0)hvDust(.72,ww,2);if(k1!==EP.hvK1)hvDust(.28,ww,2)}EP.hvK0=k0;EP.hvK1=k1}else EP.hvK0=undefined;
 if(mt==1||mt==2){if(at>=(mt==1?.5:.52)&&!EP.hvI){EP.hvI=1;hvDust(.7,ww,mt==1?5:8,1);hvDust(.3,ww,3,1)}}if(!atk||at<.2)EP.hvI=0;
 /* tư thế toàn thân (xoay/co giãn quanh giữa đáy chân) */
 const br=Math.sin(t*.05)*(1-mv);
 let rot=Math.sin(ph)*.032*mv+Math.sin(t*.03)*.008*(1-mv)-.05*rt+.025*lg-.05*cr+.1*lg*(mt==1?1:0)-.17*rs+.07*sl,
     sy=1+.009*br-.045*rt+.02*lg*(mt==0?1:0)-.09*cr+.05*jp-.07*ip-.07*sl+.03*rs,
     sx=1-.004*br+.045*lg*(mt==0?1:0)-.02*rt+.07*cr-.03*jp+.07*ip+.06*sl-.02*rs,
     tx=Math.sin(ph)*hh*.012*mv-lg*hh*.012*(mt==0?1:0),ty=-Math.cos(ph*2)*hh*.007*mv;
 const kx=ww/iw,ky=hh/ih,stride=hh*.05,lift=hh*.04,amp=(1.1+ev*.55+mv*1.6)*s,HD=HV_HEAD[ev]||HV_HEAD[0],occ=hvOcc(im,C,R);
 const pass=(al,comp,G)=>{G.save();if(comp)G.globalCompositeOperation=comp;if(al<1)G.globalAlpha=al;
  for(let j=0;j<R;j++){const y0=Math.floor(j*ih/R),y1=j==R-1?ih:Math.min(ih,Math.floor((j+1)*ih/R)+1),v=(y0+y1)/2/ih,vh=1-v,lw=ss(.58,.92,v),
    up=ev>=1?ss(0,1,Math.max(0,(.5-v)/.5)):0,up2=up*up,hv=1-ss(HD[2],HD[3],v);
   for(let i=0;i<C;i++){if(!occ[j*C+i])continue;const x0=Math.floor(i*iw/C),x1=i==C-1?iw:Math.min(iw,Math.floor((i+1)*iw/C)+1),u=(x0+x1)/2/iw;let dx=0,dy=0;
    if(lw>0){const fG=ss(.34,.5,u),sw=Math.sin(ph+PI)*(1-fG)+Math.sin(ph)*fG,lf=Math.max(0,Math.cos(ph+PI))*(1-fG)+Math.max(0,Math.cos(ph))*fG;
     dx+=sw*stride*lw*mv;dy-=lf*lift*lw*mv;
     dy-=lw*fG*hh*(.05*jp+.075*rs);dy-=lw*(1-fG)*hh*.02*jp}
    const hw=ss(HD[0]-.1,HD[1]+.08,u)*hv;
    if(hw>0){dy+=Math.sin(ph*2+1.1)*hh*.012*mv*hw+Math.sin(t*.04)*hh*.006*(1-mv)*hw;dx+=Math.sin(ph)*hh*.018*mv*hw+hh*(.09*lg-.05*rt)*hw*(mt==1?1.3:1);dy+=hh*(.02*rt-.03*lg*(mt==0?1:0)-.05*rs+.03*cr)*hw}
    if(up2>0){dx+=Math.sin(t*.075-vh*4.2+ph*.6)*amp*up2*1.6+Math.sin(t*.11+vh*2)*.55*s*up-fv*.9*s*up2;
     dx+=hh*up2*(.1*lg-.06*rt+.03*rs);dy-=hh*up2*.05*rs}
    if(ev>=1&&u<.3&&v>.6)dy+=Math.sin(t*.09+ph)*hh*.006*(1-u/.3);
    G.drawImage(im,x0,y0,x1-x0,y1-y0,-ww/2+x0*kx+dx,-hh+y0*ky+dy,(x1-x0)*kx+1,(y1-y0)*ky+1)}}
  G.restore()};
 g.save();g.translate(tx,ty);g.rotate(rot);g.scale(sx,sy);
 /* Fix424: lưới biến dạng vẽ vào ảnh đệm, làm mới 30Hz (khung xen kẽ chỉ dán 1 ảnh) — tắt: window.PETPERF_OFF=true */
 if(window.PETPERF_OFF)pass(1,null,g);else{const hc=EP.__hvc||(EP.__hvc={cv:document.createElement('canvas'),t:-99,w:0,h:0,ev:-1}),W=Math.ceil(ww*1.7),H=Math.ceil(hh*1.5),oy=Math.round(hh*1.2);
  if(hc.w!==W||hc.h!==H||hc.ev!==ev){hc.cv.width=W;hc.cv.height=H;hc.w=W;hc.h=H;hc.ev=ev;hc.t=-99}
  if(fr-hc.t>=2||fr<hc.t){const c2=hc.cv.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,W,H);c2.translate(W/2,oy);pass(1,null,c2);hc.t=fr}
  g.drawImage(hc.cv,-W/2,-oy)}
 const gl=.3*(rs+sl*1.4)+.18*ip;if(gl>.02){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(.5,gl);g.drawImage(im,-ww/2,-hh,ww,hh);g.restore()}
 g.restore()}
function hvFx(cx,by,hh,ww,col,bc,k,atk,at,t){
 if(k==3&&atk&&EP.kind){g.save();g.globalCompositeOperation='lighter';g.fillStyle=bc;for(let i=0;i<14;i++){const a=t*.22+i*.45,u2=((i/14)+at*1.2)%1,r=ww*(.75-.45*u2);g.globalAlpha=.7*Math.sin(u2*3.14);g.beginPath();g.arc(cx+Math.cos(a)*r,by-u2*hh*1.1,(1.6+(i%3))*s,0,6.2832);g.fill()}g.restore()}
 if(EP.evT!==undefined&&fr-EP.evT<130&&fr-EP.evT>=0){const u=(fr-EP.evT)/130;g.save();g.globalCompositeOperation='lighter';
  const q=g.createLinearGradient(0,by-hh*3.2,0,by);q.addColorStop(0,RGBA(col,0));q.addColorStop(.7,RGBA(col,.55*(1-u)));q.addColorStop(1,RGBA(col,.15*(1-u)));g.fillStyle=q;const pw=ww*(.5+.5*Math.sin(Math.min(1,u*1.4)*3.14));g.fillRect(cx-pw/2,by-hh*3.2,pw,hh*3.2);
  g.strokeStyle=col;g.lineWidth=2.4*s;for(let j=0;j<3;j++){const p2=(u*1.5+j*.28)%1;g.globalAlpha=(1-p2)*(1-u*.6);g.beginPath();g.ellipse(cx,by-4*s,ww*(.3+p2*1.5),ww*(.3+p2*1.5)*.28,0,0,6.2832);g.stroke()}
  g.fillStyle='#fff';g.globalAlpha=1-u;for(let i=0;i<16;i++){const a=i*.39+u*3,r=ww*(.2+u*1.1),yy=by-hh*(.2+((i*.37+u*1.6)%1)*1.5);g.beginPath();g.arc(cx+Math.cos(a)*r,yy,(1.2+(i%3)*.8)*s,0,6.2832);g.fill()}g.restore()}}
function epstep(){const p=pet();if(!p)return;const T=PT4[p.k],K=PK[p.k],ev=p.ev,k=p.k;
if(EP.t===undefined)Object.assign(EP,{t:0,y:K.al,vx:0,d:1,at:0,atT:1,ox:EP.x,tgx:EP.x,tg:null,kind:0,sk:180,ph:0,hit:0,ps:-1});
if(EP.ps!==k){EP.ps=k;EP.y=K.al;EP.at=0;EP.vx=0;EP.sk=180}
if(!(window.PFLY&&PFLY.on())&&Math.abs(EP.x-P.x)>480){EP.x=P.x-60*P.d;EP.vx=0;EP.at=0}
EP.t++;EP.cd--;EP.sk--;
let e=null,bd=1e9;E.forEach(q=>{if(q.in<=0){const d=Math.abs(q.x-EP.x);if(d<(window.PFLY&&PFLY.on()?9999:T.rg+170)&&d<bd){bd=d;e=q}}});
const M=pm(p);
if(k==1&&typeof PHX!='undefined'){PHX.step(p,T,K,M,e);return}
if(k==0&&typeof PTG!='undefined'){PTG.step(p,T,K,M,e);return}if(k>1&&typeof PETX!='undefined'&&PETX[k]){PETX[k].step(p,T,K,M,e);return}
if(EP.at>0){const u=1-EP.at/EP.atT,w=Math.sin(Math.min(1,u)*3.1416),tg=EP.tg;
 if(tg&&E.includes(tg))EP.tgx=tg.x;
 const side=EP.ox<EP.tgx?-1:1,reach=[.92,.84,.12,.8][k],gx=EP.tgx+side*[34,70,0,30][k];
 EP.x=EP.ox+(gx-EP.ox)*(k==3?hvW(u,EP.kind):w)*reach;if(Math.abs(EP.tgx-EP.ox)>1)EP.d=Math.sign(EP.tgx-EP.ox);
 EP.y=k==0?w*(EP.kind?58:40):k==1?K.al+ev*8-w*(K.al+ev*8-16):k==3?hvY(u,EP.kind):k==2?K.al+ev*6+w*12:0;
 if(u>=.5&&!EP.hit){EP.hit=1;
  if(EP.kind==0){if(tg&&E.includes(tg)){dm(tg,M,k==2);ZS.pf.hit(k,ev,tg.x,0);if(k==3){const h=Math.round(mx()*.012*pv(p));P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:120,s:'+'+h,g:1,l:40})}}}
  else ZS.pf.skill(k,ev,EP.x,M,p)}
 EP.at--;if(EP.at<=0){EP.x=EP.ox;EP.vx=0}
 return}
let tx=Math.max(40,P.x-[52,80,68,40][k]*P.d),run=1;
if(e){const s2=EP.x<e.x?-1:1;tx=e.x+s2*K.sd;tx=k==0?cl(tx,Math.max(40,P.x-90),P.x+300):cl(tx,Math.max(40,P.x-95),P.x+30)}
const FLY_=window.PFLY&&PFLY.on();if(FLY_){tx=PFLY.tx(tx,e,k);run=PFLY.run(run)}const dx=tx-EP.x,far=!FLY_&&Math.abs(EP.x-P.x)>200;if(far)run=1.9;
const des=Math.max(-K.sp*run,Math.min(K.sp*run,dx*.07*run));
EP.vx+=(des-EP.vx)*.16;if(Math.abs(dx)<4&&Math.abs(EP.vx)<.3)EP.vx*=.5;EP.x+=EP.vx;
if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);else if(e)EP.d=Math.sign(e.x-EP.x)||EP.d;else EP.d=P.d;
const mvf=Math.min(1,Math.abs(EP.vx)/2.2);EP.ph+=mvf*.3+.05;
const bob=Math.sin(EP.t*.07);if(k==3&&mvf>.45&&EP.t%7==0)PT.push({x:EP.x-EP.d*10+R()*6,y:2,vx:-EP.d*(.3+R()*.4),vy:.4+R()*.8,l:22,c:ev>=3?'#ffe9a0':'#bfe8ff'});
if(k==0){const hp=Math.abs(Math.sin(EP.ph*1.05))*(12+ev*3)*mvf;EP.y+=(hp-EP.y)*.5;if(mvf>.6&&EP.y<1.5&&EP.lastY>3&&EP.t%2==0){for(let i=0;i<3;i++)PT.push({x:EP.x-EP.d*8,y:2,vx:(R()-.5)*1.4-EP.d*.6,vy:.8+R()*1.6,l:20,c:'#c9a878'})}EP.lastY=EP.y}
else if(k==1)EP.y+=(K.al+ev*8+bob*8+mvf*Math.sin(EP.ph*2)*5-EP.y)*.12;
else if(k==2)EP.y+=(K.al+ev*6+bob*7+mvf*Math.sin(EP.ph*2)*4-EP.y)*.1;
else EP.y+=(Math.abs(Math.sin(EP.ph*1.1))*2.2*mvf-EP.y)*.4;
if(k==1&&mvf>.5&&EP.t%5==0)PT.push({x:EP.x-EP.d*14,y:EP.y+6,vx:-EP.d*.6,vy:.2,l:30,c:'#fff3c0'});
if(e&&EP.cd<=0&&EP.at<=0&&Math.abs(e.x-EP.x)<T.rg+30){
 const spec=EP.sk<=0;
 if(k==3&&!spec&&0){}
 EP.ox=EP.x;EP.tg=e;EP.tgx=e.x;EP.hit=0;EP.kind=spec?1:0;if(!spec&&(k==1||k==2))ZS.pf.shoot(k,EP.x,e.x,EP.y+20);EP.atT=spec?(k==3?54:36):K.at;EP.at=EP.atT;EP.cd=T.cd;if(spec)EP.sk=Math.round(PSK[k].cd*(1-.05*ev))}
else if(k==3&&EP.sk<=0&&EP.at<=0&&(P.hp<mx()*.85||E.length)){EP.ox=EP.x;EP.tg=null;EP.tgx=EP.x;EP.hit=0;EP.kind=1;EP.atT=54;EP.at=54;EP.sk=Math.round(PSK[3].cd*(1-.05*ev))}}

/* ---- Rồng: vẽ thân + cánh vỗ uyển chuyển ---- */
function drDrawBody(G,ev,ww,hh,mvf,atk,at,t){
 const M=DRG[ev],D=DRI[ev];if(!D.b.naturalWidth)return;
 const kk=hh/M.h;G.save();G.translate(-ww/2,-hh);G.scale(kk,kk);
 if(M.face<0){G.translate(M.w,0);G.scale(-1,1)}
 const dt=Math.max(0,Math.min(4,fr-(EP.lw==null?fr:EP.lw)));EP.lw=fr;
 EP.wp=(EP.wp||0)+dt*(.115+mvf*.05+(atk?.07:0));
 const ph=EP.wp,aw=atk?Math.sin(at*3.1416):0,amp=.36+ev*.025+mvf*.1;
 const up=.12+amp*(Math.sin(ph)+.3*Math.sin(2*ph-.9))+aw*.28,lag=.5*amp*Math.sin(ph-1.15);
 G.imageSmoothingEnabled=true;G.imageSmoothingQuality='high';
 M.wings.forEach((w,j)=>{const img=D.w[j];if(!img||!img.naturalWidth)return;
  const sg=Math.cos(w.ph)>=0?-1:1,N=Math.max(8,Math.round(w.len/4.5)),iw=img.naturalWidth,ih=img.naturalHeight,sw=(iw-w.wx)/N;
  G.save();G.translate(w.hx,w.hy);
  if(w.wx>.5){G.save();G.rotate(w.ph+sg*up*.55);G.drawImage(img,0,0,w.wx,ih,-w.wx,-w.wy,w.wx+.6,ih);G.restore()}
  let px=0,py=0;
  for(let i=0;i<N;i++){const u=(i+.5)/N,a=w.ph+sg*(up*(.55+.45*u)+lag*u*u*1.4);
   G.save();G.translate(px,py);G.rotate(a);G.drawImage(img,w.wx+i*sw,0,sw+.8,ih,0,-w.wy,sw+.8,ih);G.restore();
   px+=Math.cos(a)*sw;py+=Math.sin(a)*sw}
  G.restore()});
 const NB=16,iw=D.b.naturalWidth,ih=D.b.naturalHeight,am2=1.2+mvf*2.2+(atk?1.5:0);
 for(let i=0;i<NB;i++){const v=(i+.5)/NB,wv=Math.sin(ph*.8-v*4.5)*am2*Math.pow(Math.max(0,(v-.5)/.5),1.2)*1.4,y0=Math.floor(i*ih/NB);
  G.drawImage(D.b,0,y0,iw,Math.min(Math.ceil(ih/NB)+1,ih-y0),wv,y0*(M.h/ih),M.w,M.h/NB+1)}
 G.restore()}
function drDraw(ev,ww,hh,mvf,atk,at,t){
 if(window.PETPERF_OFF||!DRI[ev].b.naturalWidth)return drDrawBody(g,ev,ww,hh,mvf,atk,at,t);
 /* Fix424: cánh + thân biến dạng vẽ vào ảnh đệm, làm mới 30Hz */
 const dc=EP.__drc||(EP.__drc={cv:document.createElement('canvas'),t:-99,w:0,h:0,ev:-1}),W=Math.ceil(ww*3),H=Math.ceil(hh*2.4),oy=Math.round(hh*1.8);
 if(dc.w!==W||dc.h!==H||dc.ev!==ev){dc.cv.width=W;dc.cv.height=H;dc.w=W;dc.h=H;dc.ev=ev;dc.t=-99}
 if(fr-dc.t>=2||fr<dc.t){const c2=dc.cv.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,W,H);c2.translate(W/2,oy);drDrawBody(c2,ev,ww,hh,mvf,atk,at,t);dc.t=fr}
 g.drawImage(dc.cv,-W/2,-oy)}
function drawEP(){const p=pet();if(!p||EP.t===undefined||EP.ps!==p.k)return;const k=p.k,ev=p.ev,K=PK[k],im=k==3?HVI[ev]:k==2?DRI[ev].b:PTI[k],sz=k==3?HVZ[ev]:k==2?DRZ[ev]:PSZ[k],col=pcol(k,ev),bc=K.bc,t=fr;if(!im.naturalWidth)return;if(k==1&&typeof PHX!='undefined'){PHX.draw();return}if(k==0&&typeof PTG!='undefined'){PTG.draw();return}if(k>1&&typeof PETX!='undefined'&&PETX[k]){PETX[k].draw();return}
const hh=(k==3?HVH[ev]:k==2?DRH[ev]:(K.h+ev*7)*PSC)*s,ww=hh*sz[0]/sz[1],at=EP.at>0?1-EP.at/EP.atT:0,cx=(EP.x-cam)*s,by=GY-EP.y*s,mvf=Math.min(1,Math.abs(EP.vx)/2.2),atk=EP.at>0;
g.save();
g.fillStyle='rgba(0,0,0,'+(.3-Math.min(.2,EP.y/260)).toFixed(3)+')';g.beginPath();g.ellipse(cx,GY+2,ww*.36*(1-Math.min(.45,EP.y/180)),4.5*s,0,0,6.2832);g.fill();
glowDraw(cx,by-hh*.5,hh*(.85+ev*.1)+(atk?hh*.4*Math.sin(at*3.14):0),atk&&EP.kind?bc:col,.38+ev*.08+(atk?.35*Math.sin(at*3.14):0));
if(ev>=1){g.save();g.translate(cx,GY+2);g.scale(1,.28);g.rotate(t*.02);g.strokeStyle=RGBA(col,.7);g.lineWidth=1.8*s;g.setLineDash([7*s,5*s]);g.beginPath();g.arc(0,0,ww*.62,0,6.2832);g.stroke();if(ev>=3){g.rotate(-t*.04);g.beginPath();g.arc(0,0,ww*.85,0,6.2832);g.stroke()}g.restore()}
g.translate(cx,by);g.scale(EP.d,1);
let sx=1,sy=1,rot=0,ox=0,oy=0;
if(k==0){const hp=Math.abs(Math.sin(EP.ph*1.05));sy=1+(.07*(1-hp)-.05*hp)*mvf;sx=1/sy;rot=EP.vx?.09*mvf*Math.sign(EP.d):0;if(atk){const w=Math.sin(at*3.14);rot=-.18+.5*w*(at>.5?1:-.3);sx=1+.1*w;sy=1-.06*w}else{sy+=Math.sin(t*.06)*.012}}
else if(k==1){rot=.1*mvf-(atk?.55*Math.sin(at*3.14):0)+Math.sin(t*.07)*.03;oy=-Math.sin(t*.4)*2*s;sy=1+Math.sin(EP.ph*2)*.025;if(atk&&EP.kind)sx=1+.12*Math.sin(at*3.14)}
else if(k==2){rot=.07*mvf;if(atk){const w=Math.sin(at*3.14);rot=-.16*w*(at<.5?1:-.6);sy=1+.04*w}else{sy=1+Math.sin(t*.07)*.012}}
else if(k==3){const stp=Math.sin(EP.ph*1.1);rot=stp*.045*mvf;sy=1-Math.abs(stp)*.04*mvf+Math.sin(t*.06)*.012*(1-mvf);sx=1/sy;if(atk){const w=Math.sin(at*3.14);if(EP.kind){sy=1+.13*w;sx=1-.05*w;rot=-.04*w}else{const hw=hvW(at,0),f=Math.max(0,hw),bk=Math.max(0,-hw)/.22;rot=.13*hw;sx=1+.09*f+.05*bk;sy=1-.08*bk+.04*f}}}
else{rot=Math.sin(t*.04)*.06+(atk?.2*Math.sin(at*3.14):0);sx=1+Math.sin(t*.05)*.015;sy=1/sx;if(atk&&EP.kind){const w=Math.sin(at*3.14);sx=1+.1*w;sy=1+.1*w}}
g.translate(ox,oy);g.rotate(rot);g.scale(sx,sy);
if(k==1){const fl=Math.sin(EP.ph*2.1+(atk?t*.3:0)),a=.85-fl*.95,wl=ww*(.62+ev*.07);g.save();for(let sd=-1;sd<=1;sd+=2){g.save();g.translate(sd*ww*.12,-hh*.52);g.scale(sd,1);g.rotate(-a-.15);const gr=g.createLinearGradient(0,0,wl,-wl*.2);gr.addColorStop(0,'#fff6d8');gr.addColorStop(.6,'#ffe9a0');gr.addColorStop(1,RGBA(col,.55));g.globalAlpha=.88;g.fillStyle=gr;g.beginPath();g.moveTo(0,0);for(let i=0;i<5;i++){const u=i/4,ang=-.5+u*.9,len=wl*(.78+.22*Math.sin(u*3.14));g.lineTo(Math.cos(ang)*len+ww*.02*u,Math.sin(ang)*len*.62-wl*.12*(1-u))}g.lineTo(wl*.45,wl*.2);g.lineTo(0,wl*.08);g.closePath();g.fill();g.globalAlpha=.7;g.strokeStyle='#fff';g.lineWidth=1.1*s;g.stroke();g.restore()}g.restore()}
if(k==2)drDraw(ev,ww,hh,mvf,atk,at,t);
else if(k==3)hvDraw(im,ww,hh,ev,at,atk,EP.kind,mvf,t);else g.drawImage(im,-ww/2,-hh,ww,hh);
if(ev>=2&&k!=2){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.16+.08*Math.sin(t*.1);g.drawImage(im,-ww/2*1.05,-hh*1.04,ww*1.05,hh*1.05);g.restore()}
g.restore();
g.save();g.globalCompositeOperation='lighter';g.fillStyle=col;for(let i=0;i<ev*2;i++){const a=t*.03+i*6.2832/(ev*2),rr=ww*.6,tw=(Math.sin(t*.1+i)+1)/2;g.globalAlpha=.4+tw*.5;g.beginPath();g.arc(cx+Math.cos(a)*rr,by-hh*.5+Math.sin(a)*rr*.55,(1.4+tw*1.6)*s,0,6.2832);g.fill()}g.restore();
if(atk&&EP.kind&&at<.5){const u=at/.5;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=bc;g.shadowColor=bc;g.shadowBlur=14;g.lineWidth=(3+3*u)*s;g.globalAlpha=.8*u;g.beginPath();g.arc(cx,by-hh*.5,hh*(1.1-u*.7),0,6.2832);g.stroke();g.restore()}hvFx(cx,by,hh,ww,col,bc,k,atk,at,t)}

