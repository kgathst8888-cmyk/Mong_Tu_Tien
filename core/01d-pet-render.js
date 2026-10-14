/* core/01d-pet-render.js — glowSpr/glowDraw, pm, vẽ Huyền Vũ/Rồng, epstep, drawEP (vòng thú nuôi gốc)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
function glowSpr(c){let o=GLC[c];if(!o){o=document.createElement('canvas');o.width=o.height=96;const q=o.getContext('2d'),r=q.createRadialGradient(48,48,0,48,48,48);r.addColorStop(0,RGBA(c,.9));r.addColorStop(.35,RGBA(c,.38));r.addColorStop(1,RGBA(c,0));q.fillStyle=r;q.fillRect(0,0,96,96);GLC[c]=o}return o}
function glowDraw(x,y,r,c,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSpr(c),x-r,y-r,r*2,r*2);g.restore()}
function pm(p){return PT4[p.k].m*(1+.06*(p.lv-1))*(1+.35*p.ev)}

/* ===== Huyền Vũ: tư thế cắn / gồng khiên + vẽ lát cắt (rắn uốn lượn) ===== */
const sm3=x=>x*x*(3-2*x);
function hvW(u,kind){if(kind)return 0;if(u<.3)return -.22*Math.sin(u/.3*1.5708);if(u<.5)return -.22+1.22*sm3((u-.3)/.2);return 1-sm3((u-.5)/.5)}
function hvY(u,kind){if(kind)return u<.5?Math.sin(u/.5*1.5708)*10:Math.cos((u-.5)/.5*1.5708)*10;const v=(u-.28)/.34;return v>0&&v<1?Math.sin(v*3.1416)*8:0}
function hvDraw(im,ww,hh,ev,at,atk,kind,mvf,t){const N=28,iw=im.naturalWidth,ih=im.naturalHeight,amp=(1.1+ev*.55+mvf*1.6)*s,w0=atk&&!kind?hvW(at,0):0,sa=atk&&kind?Math.sin(at*3.14):0;
 for(let i=0;i<N;i++){const v=1-(i+.5)/N,up=Math.max(0,(v-.3)/.7),up2=up*up;let off=0;
  if(ev>=1)off+=Math.sin(t*.075-v*4.2+EP.ph*.6)*amp*up2*1.6;
  off+=Math.sin(t*.11+v*2)*.55*s*up;
  off+=w0*(6+ev*2.5)*s*v*v*1.3;
  if(sa)off+=Math.sin(t*.35+v*5)*1.6*s*up2*sa;
  const y0=Math.floor(i*ih/N);g.drawImage(im,0,y0,iw,Math.min(Math.ceil(ih/N)+1,ih-y0),-ww/2+off,-hh+i*hh/N,ww,hh/N+.9)}}
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
function drDraw(ev,ww,hh,mvf,atk,at,t){
 const M=DRG[ev],D=DRI[ev];if(!D.b.naturalWidth)return;
 const kk=hh/M.h;g.save();g.translate(-ww/2,-hh);g.scale(kk,kk);
 if(M.face<0){g.translate(M.w,0);g.scale(-1,1)}
 const dt=Math.max(0,Math.min(4,fr-(EP.lw==null?fr:EP.lw)));EP.lw=fr;
 EP.wp=(EP.wp||0)+dt*(.115+mvf*.05+(atk?.07:0));
 const ph=EP.wp,aw=atk?Math.sin(at*3.1416):0,amp=.36+ev*.025+mvf*.1;
 const up=.12+amp*(Math.sin(ph)+.3*Math.sin(2*ph-.9))+aw*.28,lag=.5*amp*Math.sin(ph-1.15);
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 M.wings.forEach((w,j)=>{const img=D.w[j];if(!img||!img.naturalWidth)return;
  const sg=Math.cos(w.ph)>=0?-1:1,N=Math.max(8,Math.round(w.len/4.5)),iw=img.naturalWidth,ih=img.naturalHeight,sw=(iw-w.wx)/N;
  g.save();g.translate(w.hx,w.hy);
  if(w.wx>.5){g.save();g.rotate(w.ph+sg*up*.55);g.drawImage(img,0,0,w.wx,ih,-w.wx,-w.wy,w.wx+.6,ih);g.restore()}
  let px=0,py=0;
  for(let i=0;i<N;i++){const u=(i+.5)/N,a=w.ph+sg*(up*(.55+.45*u)+lag*u*u*1.4);
   g.save();g.translate(px,py);g.rotate(a);g.drawImage(img,w.wx+i*sw,0,sw+.8,ih,0,-w.wy,sw+.8,ih);g.restore();
   px+=Math.cos(a)*sw;py+=Math.sin(a)*sw}
  g.restore()});
 const NB=16,iw=D.b.naturalWidth,ih=D.b.naturalHeight,am2=1.2+mvf*2.2+(atk?1.5:0);
 for(let i=0;i<NB;i++){const v=(i+.5)/NB,wv=Math.sin(ph*.8-v*4.5)*am2*Math.pow(Math.max(0,(v-.5)/.5),1.2)*1.4,y0=Math.floor(i*ih/NB);
  g.drawImage(D.b,0,y0,iw,Math.min(Math.ceil(ih/NB)+1,ih-y0),wv,y0*(M.h/ih),M.w,M.h/NB+1)}
 g.restore()}
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

