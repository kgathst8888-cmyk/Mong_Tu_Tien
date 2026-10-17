/* ===================================================================
   CƠ CHẾ THẦN THÚ NHƯ CHU TƯỚC — áp dụng cho THANH LONG (ô 3) và HUYỀN VŨ (ô 4)
   Giống Chu Tước:
   - 4 cấp tiến hoá, mỗi cấp một hình riêng; bay lượn tự do, vỗ cánh / uốn thân theo cấp.
   - Đánh linh hoạt: bắn liên hoàn (cấp 3 bắn 2, cấp 4 bắn 3 luồng) · bổ nhào từ cấp 2 · kỹ năng riêng xoay vòng.
   - Mỗi lần tiến hoá MỞ THÊM kỹ năng + hiệu ứng; cấp 4 có kỹ năng hồi sinh chủ nhân.
   - Tiến hoá khó dần: cấp thú đủ mức tối đa + cảnh giới tối thiểu + vàng + dược thảo trồng ở Linh Điền.
   - Đòn thú gây trạng thái (băng, bỏng, choáng...) bằng hệ trạng thái có sẵn (combat/11-status-effects.js).
   Chỉnh cân bằng ở khối EVO / SKL / ST_RATE của từng thú bên dưới.
   Điểm móc trong core/01-engine.js: registry window.PETX[k] (step / draw / skill / rebirth / skillsHtml / evoHtml / can / pay).
   =================================================================== */
(function(){
'use strict';
if(typeof pet!=='function'||typeof PT4==='undefined'||typeof DRG==='undefined'||typeof HVI==='undefined'||typeof hvDraw!=='function'||typeof drDraw!=='function'){console.warn('[thần thú] thiếu engine, bỏ qua');return}
window.PETX=window.PETX||{};
const HN={hoa:'🌺 Xích Hỏa Hoa',chi:'🍄 Linh Chi Thảo',sam:'🥕 Thiên Tâm Sâm',truc:'🎋 Tị Lôi Trúc',lien:'❄️ Băng Tâm Liên'};
const hbq=h=>{try{return FM.get().herbs[h]|0}catch(e){return 0}};
const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const stat=(e,k,ch)=>{if(!e||e.hp<=0||Math.random()>=ch)return;try{window.ST&&ST.apply(e,k)}catch(x){}};
const tgs=(x,r)=>E.filter(e=>e.in<=0&&Math.abs(e.x-x)<r).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));
const sX=x=>(x-cam)*s;
const FXD=o=>window.PFH.fx(o);   /* fx nằm trong phạm vi ZS, lấy qua window.PFH */

/* ---------- hiệu ứng dùng chung ---------- */
function zig(x,yTop,yEnd,col,l,w){
 FXD({x,l,fn:(f,p,X,gy)=>{const a=1-p*p,n=Math.floor(p*9);g.save();g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=10;g.lineWidth=(w||2.4)*s;g.globalAlpha=a;g.lineJoin='round';
  for(let b=0;b<2;b++){g.beginPath();g.moveTo(sX(x),gy-yTop*s);for(let j=1;j<=8;j++){const q=Math.sin((n+b*5+j)*91.7)*43758.5,rr=q-Math.floor(q);g.lineTo(sX(x)+(rr-.5)*34*s*(j<8?1:0),gy-(yTop+(yEnd-yTop)*j/8)*s)}g.stroke()}
  g.restore()}});
}
/* quạt hơi thở từ miệng thú tới địch. kind: frost | fire | thunder | star | water */
function cone(x,y0,d,L,kind,c1,c2,l){
 FXD({x,l,fn:(f,p,X,gy)=>{const a=p<.15?p/.15:p>.7?(1-p)/.3:1,N=54,len=L*Math.min(1,p*3.2)*s,Y0=gy-y0*s;
  const bm=g.createLinearGradient(X,0,X+d*len,0);bm.addColorStop(0,RGBA(c2,.55*a));bm.addColorStop(1,RGBA(c1,0));
  g.save();g.strokeStyle=bm;g.lineCap='round';g.lineWidth=(10+(kind=='star'?9:kind=='thunder'?6:3))*s;g.beginPath();g.moveTo(X,Y0);g.lineTo(X+d*len,gy-52*s);g.stroke();g.restore();
  for(let i=0;i<N;i++){const u=((p*1.8+i/N)%1),sd=Math.sin(i*12.9898)*43758.5453,rn=sd-Math.floor(sd),lat=(rn-.5)*2*u*52*s,xx=X+d*u*len,yy=Y0+(gy-52*s-Y0)*u+lat,al=a*(1-u*.5);
   if(kind=='frost'){glowDraw(xx,yy,(6+u*14)*s,c1,.34*al);if(i%3==0){g.save();g.translate(xx,yy);g.rotate(i+p*6);g.fillStyle=c2;star(6,4.4*s,1.7*s,0);g.fill();g.restore()}}
   else if(kind=='fire'){glowDraw(xx,yy-u*10*s,(7+u*16)*s,i%2?c1:c2,.42*al);if(i%4==0)glowDraw(xx,yy-u*30*s,3*s,'#fff',.7*al)}
   else if(kind=='thunder'){glowDraw(xx,yy,(5+u*12)*s,i%2?c1:c2,.38*al)}
   else if(kind=='water'){glowDraw(xx,yy,(5+u*13)*s,i%2?c1:c2,.34*al);if(i%3==0){g.save();g.globalAlpha=.55*al;g.strokeStyle=c2;g.lineWidth=1.3*s;g.beginPath();g.arc(xx,yy-u*8*s,(2+u*5)*s,0,6.2832);g.stroke();g.restore()}}
   else{glowDraw(xx,yy,(5+u*13)*s,i%2?c1:'#5a64ff',.34*al);if(i%3==0){g.save();g.translate(xx,yy);g.rotate(p*3+i);g.globalAlpha=.4+.6*Math.abs(Math.sin(p*8+i));g.fillStyle=c2;star(4,6*s,1.4*s,0);g.fill();g.restore()}}}
  if(kind=='thunder'){g.save();g.strokeStyle=c2;g.shadowColor=c1;g.shadowBlur=10;g.lineWidth=2*s;g.globalAlpha=a;const sd=Math.floor(p*14);for(let b=0;b<2;b++){g.beginPath();g.moveTo(X,Y0);for(let j=1;j<=9;j++){const q=Math.sin((sd+b*7+j)*91.7)*43758.5,rr=q-Math.floor(q);g.lineTo(X+d*len*j/9,Y0+(gy-52*s-Y0)*j/9+(rr-.5)*34*s*(j<9?1:0))}g.stroke()}g.restore()}
 }});
}
/* một luồng bắn tới địch */
function bolt(x0,x1,y0,kind,c1,c2){
 FXD({x:x0,l:16,fn:(f,p,X,gy)=>{const u=Math.min(1,p*1.15),pos=v=>[sX(x0+(x1-x0)*v),gy-(y0+(52-y0)*v+Math.sin(v*12)*2.5*(1-v))*s];
  for(let i=0;i<10;i++){const q=pos(Math.max(0,u-i*.04));glowDraw(q[0],q[1],(11-i*.8)*s,i%2?c2:c1,.8-i*.07)}
  const h=pos(u);glowDraw(h[0],h[1],15*s,'#fff',.85);g.save();g.translate(h[0],h[1]);g.rotate(p*9);g.fillStyle=c2;g.shadowColor=c1;g.shadowBlur=10;
  if(kind=='frost')star(6,9*s,3.6*s,0);else if(kind=='fire')star(3,10*s,4*s,-1.57);else if(kind=='thunder')star(8,10*s,2.6*s,0);else if(kind=='water'){g.beginPath();g.arc(0,0,6*s,0,6.2832)}else star(4,11*s,2.4*s,0);
  g.fill();g.restore()}});
}

/* ---------- bộ máy dùng chung (cùng khung với Chu Tước) ---------- */
function make(c){
 const HH=c.HH,AL=c.AL,EM=[];
 function ember(x,y,vx,vy,l,col,r,st){EM.push({x,y,vx,vy,l,l0:l,c:col,r,st})}
 function spark(x,y,r,a,col){g.save();g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();g.restore()}
 function ring(x,y,hh,ev,t){
  const R0=hh*(.5+ev*.04),a0=ev>=3?.7:.5,col=c.COL2[ev];
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.lineWidth=Math.max(1,1.4*s);
  g.save();g.rotate(t*.012);g.strokeStyle=RGBA(col,a0);g.beginPath();g.arc(0,0,R0,0,6.2832);g.stroke();g.beginPath();g.arc(0,0,R0*.88,0,6.2832);g.stroke();
  for(let i=0;i<12;i++){const a=i*.5236,cc=Math.cos(a),n=Math.sin(a);g.beginPath();g.moveTo(cc*R0*.88,n*R0*.88);g.lineTo(cc*R0*.96,n*R0*.96);g.stroke()}
  g.fillStyle=RGBA(col,.8);for(let i=0;i<8;i++){const a=i*.7854+.2;g.save();g.translate(Math.cos(a)*R0*.94,Math.sin(a)*R0*.94);g.rotate(a);g.beginPath();g.moveTo(0,-3*s);g.lineTo(2*s,0);g.lineTo(0,3*s);g.lineTo(-2*s,0);g.closePath();g.fill();g.restore()}
  g.restore();
  if(ev>=3){g.save();g.rotate(-t*.007);for(let i=0;i<16;i++){const a=i*6.2832/16,cc=Math.cos(a),n=Math.sin(a),l=R0*(i%2?1.28:1.55),gr=g.createLinearGradient(cc*R0,n*R0,cc*l,n*l);gr.addColorStop(0,RGBA(col,.55));gr.addColorStop(1,RGBA(col,0));g.strokeStyle=gr;g.lineWidth=(i%2?1.4:2.6)*s;g.beginPath();g.moveTo(cc*R0,n*R0);g.lineTo(cc*l,n*l);g.stroke()}g.restore()}
  g.restore();
 }
 function draw(){
  const p=pet();if(!p)return;const ev=p.ev,t=fr,Z=c.size(ev);if(!Z||!Z.w)return;
  const hh=HH[ev]*s,ww=hh*Z.w/Z.h,cx=sX(EP.x),by=GY-EP.y*s,mvf=Math.min(1,Math.abs(EP.vx||0)/2.4),atk=EP.at>0,at=atk?1-EP.at/EP.atT:0,col=c.COL[ev],col2=c.COL2[ev],sn=atk?Math.sin(at*3.1416):0;
  const mcx=cx,mcy=by-hh*.52;
  g.save();
  g.fillStyle='rgba(0,0,0,'+Math.max(.08,.3-EP.y/330).toFixed(3)+')';g.beginPath();g.ellipse(cx,GY+2,ww*.3*(1-Math.min(.5,EP.y/260)),4.5*s,0,0,6.2832);g.fill();
  if(ev>=1){g.save();g.translate(cx,GY+2);g.scale(1,.28);g.rotate(t*.02);g.strokeStyle=RGBA(col,.55);g.lineWidth=1.8*s;g.setLineDash([7*s,5*s]);g.beginPath();g.arc(0,0,ww*.55,0,6.2832);g.stroke();g.restore()}
  glowDraw(mcx,mcy,hh*(.75+ev*.1)+(atk?hh*.35*sn:0),col,.26+ev*.06+(atk?.3*sn:0)+.05*Math.sin(t*.08));
  if(ev>=2)ring(mcx,mcy,hh,ev,t);
  const vy=EP.y-(EP.ly||EP.y);let rot=-vy*.05+Math.sin(t*.03)*.025,sx=1,sy=1;
  if(atk){if(EP.mt==1){rot=.5*Math.sin(at*6.2832);sx=1+.06*sn}else if(EP.mt==2){rot=-.1*sn;sx=1+.12*sn;sy=1+.05*sn}else{rot=-.14*sn;sx=1+.05*sn}}
  const eu=EP.evT!==undefined?fr-EP.evT:999,pop=eu>=0&&eu<60?1+.2*Math.sin(eu/60*3.1416):1;
  g.translate(cx,by);g.scale(EP.d,1);g.rotate(rot);g.scale(sx*pop,sy*pop);
  c.body(ev,ww,hh,mvf,atk,at,t);
  g.restore();
  const every=Math.max(2,7-ev*2);
  if(t%every==0){const n=ev>=3?2:1;for(let i=0;i<n;i++)ember(EP.x+(R()-.5)*ww/s*.8,EP.y+HH[ev]*(.1+R()*.75),(R()-.5)*.5-EP.vx*.12,.35+R()*.9,40+R()*30,[col,col2,'#ffffff'][(R()*3)|0],(2.2+R()*3)*s)}
  if(ev>=3&&t%16==0)ember(EP.x+(R()-.5)*ww/s*1.2,EP.y+HH[ev]*(.2+R()*.9),0,.2,50,'#ffffff',(3+R()*3)*s,1);
  if(mvf>.5&&t%2==0)ember(EP.x-EP.d*ww/s*.15,EP.y+HH[ev]*.1,-EP.d*.5,.2,28,col2,(2+R()*2)*s);
  for(let i=EM.length-1;i>=0;i--){const e=EM[i];e.x+=e.vx;e.y+=e.vy;e.vx*=.99;if(--e.l<=0){EM.splice(i,1);continue}const a=e.l/e.l0,X=sX(e.x),Y=GY-e.y*s;if(e.st)spark(X,Y,e.r*(.6+.5*Math.sin(e.l*.3)),a,'#ffffff');else glowDraw(X,Y,e.r*(.6+.8*a),e.c,a*.9)}
  if(EM.length>160)EM.splice(0,EM.length-160);
  if(atk&&EP.kind&&at<.55){const u=at/.55;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col2;g.shadowColor=col;g.shadowBlur=14;g.lineWidth=(3+3*u)*s;g.globalAlpha=.8*(1-u*.4);g.beginPath();g.arc(mcx,mcy,hh*(1.0-u*.55),0,6.2832);g.stroke();g.restore()}
  g.restore();
 }
 function volley(e,p,M){
  const ev=p.ev,n=1+(ev>=2?1:0)+(ev>=3?1:0),each=n==1?M:M*.65;
  for(let i=0;i<n;i++){
   EP.q.push({t:4+i*6,f:()=>{if(!E.includes(e)&&e.hp<=0)return;try{c.shoot(ev,EP.x,e.x,EP.y+HH[ev]*.45)}catch(x){}}});
   EP.q.push({t:12+i*6,f:()=>{if(e.hp>0&&E.includes(e)){dm(e,each);try{c.hit(ev,e.x)}catch(x){}c.onHit(e,ev,M,0)}}});
  }
 }
 function step(p,T,K,M,e){
  const ev=p.ev;
  if(EP.fp===undefined||EP.kk!==c.k)Object.assign(EP,{fp:0,fa:.6,gl:0,ly:EP.y||0,mt:0,na:0,si:0,rb:EP.rb||0,q:[],sw:.4,skn:0,kk:c.k});
  if(EP.rb>0)EP.rb--;
  for(let i=EP.q.length-1;i>=0;i--){const q=EP.q[i];if(--q.t<=0){EP.q.splice(i,1);try{q.f()}catch(x){}}}
  const base0=AL[ev]+Math.sin(EP.t*.03)*7+Math.sin(EP.t*.011+1)*(5+ev*2);
  EP.ly=EP.y;
  if(EP.at>0){
   const u=1-EP.at/EP.atT,tg=EP.tg;if(tg&&E.includes(tg))EP.tgx=tg.x;
   const side=EP.ox<EP.tgx?-1:1;
   if(Math.abs(EP.tgx-EP.ox)>1)EP.d=Math.sign(EP.tgx-EP.ox);
   if(EP.mt==1){
    const w=Math.sin(Math.min(1,u)*3.1416),gx=EP.tgx+side*28,ant=u<.2?Math.sin(u/.2*3.1416)*10:0;
    EP.x=EP.ox+(gx-EP.ox)*w*.95;EP.y=base0+8+ant-w*(base0-4);
    EP.gl+=(.9-EP.gl)*.2;EP.fa+=(.15-EP.fa)*.2;if(u>.5){EP.gl+=(0-EP.gl)*.3;EP.fa+=(1.1-EP.fa)*.25}
    if(u>=.5&&!EP.hit){EP.hit=1;if(tg&&E.includes(tg)){dm(tg,M*1.5);c.onHit(tg,ev,M,2);try{c.hit(ev,tg.x)}catch(x){}try{c.dive(ev,tg.x)}catch(x){}}}
   }else if(EP.mt==2){
    const w=Math.sin(Math.min(1,u)*3.1416);EP.y=base0+w*28;EP.gl+=(0-EP.gl)*.2;EP.fa+=(1.15-EP.fa)*.2;
    if(u>=.45&&!EP.hit){EP.hit=1;try{c.skill(ev,EP.x,M,p,EP.skn)}catch(x){console.error('[thần thú] skill',x)}}
   }else{
    const w=Math.sin(Math.min(1,u)*3.1416);EP.y=base0+w*6;EP.gl+=(0-EP.gl)*.2;EP.fa+=(1.0-EP.fa)*.2;
    EP.x-=side*.35*w;
   }
   EP.fp+=EP.mt==1&&u<.5?.05:.34;EP.sw+=(1-EP.sw)*.1;
   EP.at--;if(EP.at<=0){EP.x=EP.mt==1?EP.ox:EP.x;EP.vx=0}
   return;
  }
  let tx=Math.max(40,P.x-(72+ev*8)*P.d+Math.sin(EP.t*.017)*(44+ev*9)),run=1;
  if(e){const s2=EP.x<e.x?-1:1;tx=cl(e.x+s2*K.sd,Math.max(40,P.x-150),P.x+150)}
  const FLY_=window.PFLY&&PFLY.on();if(FLY_){tx=PFLY.tx(tx,e,c.k);run=PFLY.run(run)}else if(Math.abs(EP.x-P.x)>480){EP.x=P.x-60*P.d;EP.vx=0}
  const dx=tx-EP.x,far=!FLY_&&Math.abs(EP.x-P.x)>220;if(far)run=1.9;
  const des=Math.max(-K.sp*run,Math.min(K.sp*run,dx*.06*run));
  EP.vx+=(des-EP.vx)*.12;if(Math.abs(dx)<4&&Math.abs(EP.vx)<.3)EP.vx*=.5;EP.x+=EP.vx;
  if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);else if(e)EP.d=Math.sign(e.x-EP.x)||EP.d;else EP.d=P.d;
  const mvf=Math.min(1,Math.abs(EP.vx)/2.4);EP.ph+=mvf*.3+.05;
  const base=base0+(e?8:0)+mvf*Math.sin(EP.ph*2)*3;
  EP.y+=(base-EP.y)*.07;
  const climb=EP.y-EP.ly>.22;
  const glT=(mvf>.5&&!climb&&Math.sin(EP.t*.021)>.15)?1:0;EP.gl+=(glT-EP.gl)*.05;
  EP.fp+=(.2+mvf*.1+(climb?.12:0)+(far?.06:0))*(1-.8*EP.gl);
  EP.fa+=(((.5+.3*mvf+(climb?.25:0))*(1-.6*EP.gl))-EP.fa)*.08;
  EP.sw+=((mvf*.9+.35)-EP.sw)*.06;
  if(e&&EP.cd<=0&&Math.abs(e.x-EP.x)<T.rg+30){
   const spec=EP.sk<=0,dist=Math.abs(e.x-EP.x);
   let mt=0;if(spec)mt=2;else if(ev>=1&&dist<210&&(EP.na%3==2||R()<.18))mt=1;
   EP.na++;
   EP.ox=EP.x;EP.tg=e;EP.tgx=e.x;EP.hit=0;EP.kind=spec?1:0;EP.mt=mt;
   if(spec){const lst=[0,1,2,3].slice(0,ev+1);let sn=lst[EP.si++%lst.length];for(let g2=0;g2<4&&c.heal.includes(sn)&&P.hp>mx()*.9&&lst.length>1;g2++)sn=lst[EP.si++%lst.length];EP.skn=sn;EP.sk=Math.round(PSK[c.k].cd*(1-.06*ev))}
   EP.atT=mt==1?46:mt==2?44:30;EP.at=EP.atT;EP.cd=Math.max(24,T.cd-ev*5);
   if(mt==0)volley(e,p,M);
  }
 }
 function rebirth(){
  const p=pet();if(!p||p.k!=c.k||p.ev<3||(EP.rb|0)>0)return false;
  EP.rb=c.reb.cd;P.hp=Math.max(1,Math.round(mx()*c.reb.hp));
  DT.push({x:P.x,y:150,s:c.reb.txt,c:c.COL2[3],g:1,l:130});
  try{c.skill(3,P.x,pm(p),p,4)}catch(x){}
  return true;
 }
 function skillsHtml(p){
  return '<br>🌟 <b>Kỹ năng '+c.title+'</b>'+c.SKL.map(k=>{const on=p.ev>=k.ev;return `<br><small style="opacity:${on?1:.45};color:${on?c.hi:'#aaa'}">${on?c.ic:'🔒'} <b>${k.n}</b>${on?'':' (Tiến hóa '+(k.ev+1)+')'}: ${k.d}</small>`}).join('')+(p.ev>=3?`<br><small>${c.reb.short}: ${(EP.rb|0)>0?'hồi chiêu '+Math.ceil(EP.rb/60)+'s':'<b style="color:#7fe08a">sẵn sàng</b>'}</small>`:'');
 }
 function can(p){
  if(p.ev>=3||p.lv<pcap(p))return false;const r=c.EVO[p.ev];
  if(gold<r.g||ZC.rI()<r.r)return false;
  return Object.keys(r.hb).every(h=>hbq(h)>=r.hb[h]);
 }
 function evoHtml(p){
  const r=c.EVO[p.ev],ok=(b,t)=>`<span style="color:${b?'#7fe08a':'#ff8a7a'}">${t}</span>`;
  return 'Cần: '+ok(p.lv>=pcap(p),'cấp '+p.lv+'/'+pcap(p))+' · '+ok(ZC.rI()>=r.r,'cảnh giới '+r.rn+'+')+' · '+ok(gold>=r.g,fmtN(r.g)+'💰')+'<br>'+Object.keys(r.hb).map(h=>ok(hbq(h)>=r.hb[h],HN[h]+' '+hbq(h)+'/'+r.hb[h])).join(' · ')+'<br><small style="opacity:.75">Dược thảo trồng ở bản đồ Linh Điền (🌱), tiến hóa ở 🏘 Làng.</small>';
 }
 const pay=p=>{const r=c.EVO[p.ev];Object.keys(r.hb).forEach(h=>{FM.get().herbs[h]-=r.hb[h]})};
 return{draw,step,skill:(ev,x,M,p,sn)=>c.skill(ev,x,M,p,sn),rebirth,img:ev=>c.icon(ev),col:ev=>c.COL[ev],pay,skillsHtml,can,evoHtml};
}

/* ===================================================================
   THANH LONG (ô 3) — 4 cấp theo 4 hình: Sương Giá → Liệt Hỏa → Lôi Thủy → Tinh Hà
   =================================================================== */
const TLK=['frost','fire','thunder','star'],TL_C1=['#bfe3ff','#ff5a3a','#4fe0e8','#8a96ff'],TL_C2=['#f2fbff','#ffd070','#ffd870','#e8dcff'];
const TL_RATE=[{frz:.14},{brn:.32},{stn:.16},{frz:.18,brn:.18}];   /* tỉ lệ gây trạng thái của đòn thú theo cấp (đòn thường); bổ nhào ×1.8 */
const TL=make({
 k:2,title:'Thanh Long',ic:'🐉',hi:'#bfe9ff',
 HH:DRH.slice(),AL:[56,64,72,80],COL:TL_C1,COL2:TL_C2,
 EVO:[{g:9000,  hb:{truc:12,chi:6},                    r:1,rn:'Trúc Cơ'},
      {g:60000, hb:{truc:36,sam:10,chi:20},            r:2,rn:'Kim Đan'},
      {g:300000,hb:{truc:90,sam:30,hoa:20,lien:20},    r:3,rn:'Nguyên Anh'}],
 SKL:[{ev:0,n:'Long Tức Sương Giá',d:'Đòn thường: phun hơi thở rồng băng tầm xa, làm chậm địch.'},
      {ev:0,n:'Phong Hàn Tức',d:'Hơi thở sương giá quét một dải, có thể đóng băng địch.'},
      {ev:1,n:'Liệt Hỏa Long Tức',d:'Đòn đánh gây bỏng. Thêm Long Vĩ Quét: bổ nhào quét đuôi lửa, bỏng diện rộng.'},
      {ev:2,n:'Lôi Thủy Long Hống',d:'Sấm sét và sóng nước giáng xuống, có thể gây choáng; hồi máu chủ nhân. Bắn 2 luồng long tức, thêm vòng Thanh Ấn.'},
      {ev:3,n:'Tinh Hà Long Vương Giáng',d:'Đại chiêu: mưa sao băng nối chòm sao đánh mọi địch, có thể đóng băng. Bắn 3 luồng long tức.'},
      {ev:3,n:'Long Hồn Hộ Thể',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 35% máu (hồi chiêu 120 giây).'}],
 heal:[2],reb:{cd:7200,hp:.35,txt:'🐉 Long Hồn Hộ Thể!',short:'Long Hồn Hộ Thể'},
 size:ev=>({w:DRZ[ev][0],h:DRZ[ev][1]}),icon:ev=>DRU[ev],
 body:(ev,ww,hh,mvf,atk,at,t)=>drDraw(ev,ww,hh,mvf,atk,at,t),
 shoot:(ev,x0,x1,y0)=>{const d=DRG[ev],mo=(d.face>0?d.mx-.5:.5-d.mx)*DRH[ev]*d.w/d.h;bolt(x0+EP.d*mo,x1,y0+DRH[ev]*.1,TLK[ev],TL_C1[ev],TL_C2[ev])},
 hit:(ev,x)=>{const c1=TL_C1[ev],c2=TL_C2[ev],h=window.PFH;h.flare(x,52,c1,95+ev*18,16);
  if(ev==0){h.bst(x,52,16,'#e8f6ff',6,22,3,{k:'s',g:.05});h.rg(x,70,c1,16)}
  else if(ev==1){h.bst(x,40,16,'#ffb060',5,24,4,{f:.94});for(let i=0;i<6;i++)h.fp(x+(R()-.5)*26,10+R()*20,{c:i%2?c1:c2,r:5+R()*4,l:26,vy:1.2+R(),f:.97,sh:1})}
  else if(ev==2){zig(x,300,52,c2,12);h.rg(x,80,c1,18);h.bst(x,50,12,'#fff3b0',7,16,3,{k:'s'})}
  else{h.bst(x,56,18,c2,7,24,3,{k:'s'});h.rg(x,90,c1,20)}},
 dive:(ev,x)=>{const h=window.PFH,c1=TL_C1[ev];h.gwave(x,c1,90+ev*14,22);h.shake(3+ev)},
 onHit:(e,ev,M,m)=>{const r=TL_RATE[ev],f=m==2?1.8:1;if(r.frz)stat(e,'frz',r.frz*f);if(r.brn)stat(e,'brn',r.brn*f);if(r.stn)stat(e,'stn',r.stn*f)},
 skill:(ev,x,M,p,sn)=>{
  const h=window.PFH;if(!h)return;const {later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal,rain}=h;
  const d=EP.d||1,mm=M*PSK[2].m,c1=TL_C1[sn==4?3:sn],c2=TL_C2[sn==4?3:sn],r=210+ev*30;
  const my=(EP.y||0)+DRH[ev]*.55;
  if(sn==0){            /* Phong Hàn Tức: quạt băng, làm chậm + đóng băng */
   cone(x,my,d,r+120,'frost',c1,c2,36);
   tgs(x,r+160).filter(e=>(e.x-x)*d>-30).forEach(e=>later(6+Math.round(Math.abs(e.x-x)/(r+120)*10),()=>{if(!E.includes(e))return;dm(e,mm,true);gwave(e.x,c1,110,26);vcol(e.x,'rgba(191,227,255,.75)',44,22);bst(e.x,52,14,'#e8f6ff',6,20,3,{k:'s'});stat(e,'frz',.5)}));
   flash(c1,6);shake(3)
  }else if(sn==1){      /* Liệt Hỏa Long Tức + xoáy lửa quanh mục tiêu */
   cone(x,my,d,r+120,'fire',c1,c2,36);
   tgs(x,r+160).filter(e=>(e.x-x)*d>-30).forEach(e=>later(6+Math.round(Math.abs(e.x-x)/(r+120)*10),()=>{if(!E.includes(e))return;dm(e,mm*1.2);gwave(e.x,c1,120,26);vcol(e.x,'rgba(255,110,50,.85)',54,30);for(let i=0;i<10;i++)fp(e.x+(R()-.5)*50,6+R()*30,{c:i%2?c1:c2,r:7+R()*7,l:50,vy:.6+R()*.8,f:1,sh:1});stat(e,'brn',1)}));
   flash('#ffb060',8);shake(5)
  }else if(sn==2){      /* Lôi Thủy Long Hống: sét + sóng nước, hồi máu chủ */
   const hl=Math.round(mx()*(.06+.02*ev)*pv(p));P.hp=Math.min(mx(),P.hp+hl);DT.push({x:P.x,y:130,s:'+'+hl,g:1,l:55});heal(P.x,c1);fx({t:'dome',r:90,c:c2,l:90});gwave(P.x,c1,230,30);
   cone(x,my,d,r+100,'thunder',c1,c2,34);
   tgs(x,r+160).slice(0,6).forEach((e,i)=>later(8+i*3,()=>{if(!E.includes(e))return;zig(e.x,320,52,c2,14,3);dm(e,mm*1.3);gwave(e.x,c1,130,28);rg(e.x,90,c1,18);stat(e,'stn',.45)}));
   flash(c1,8);shake(5)
  }else if(sn==3){      /* Tinh Hà Long Vương Giáng: mưa sao băng + chòm sao */
   const t4=tgs(x,r+260);flash(c1,18);shake(8);gwave(x,c2,420,34);later(5,()=>gwave(x,c1,320,30));
   cone(x,my,d,r+140,'star',c1,c2,36);
   if(t4.length){const xs=t4.slice(0,6).map(e=>e.x);
    fx({x:xs[0],l:56,fn:(f,pp,X,gy)=>{const a=pp<.2?pp/.2:pp>.7?(1-pp)/.3:1,pts=xs.map((q,i)=>[sX(q),gy-(90+Math.sin(i*2.7)*30)*s]);g.save();g.strokeStyle=c2;g.shadowColor=c1;g.shadowBlur=10;g.lineWidth=1.6*s;g.globalAlpha=a*.8;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();g.restore();pts.forEach((q,i)=>{glowDraw(q[0],q[1],(12+Math.sin(pp*14+i)*4)*s,c2,.8*a);g.save();g.translate(q[0],q[1]);g.rotate(pp*2+i);g.fillStyle='#fff';g.globalAlpha=a;star(4,8*s,1.8*s,0);g.fill();g.restore()})}});
    rain(xs.map(q=>q+(R()-.5)*30),'meteor',c1,3,12,1)}
   t4.forEach((e,i)=>later(10+i*2,()=>{if(!E.includes(e))return;dm(e,mm*1.4);dm(e,mm*.7);gwave(e.x,c1,140,30);bst(e.x,56,16,c2,7,22,3,{k:'s'});stat(e,'frz',.4)}))
  }else{                /* sn==4: Long Hồn Hộ Thể — bùng nổ sao quanh chủ nhân khi hồi sinh */
   flash(c2,22);shake(9);heal(P.x,c1);fx({t:'dome',r:120,c:c2,l:110});gwave(P.x,c1,380,34);later(5,()=>gwave(P.x,c2,300,30));vcol(P.x,'rgba(138,150,255,.85)',64,36);
   E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<360){dm(e,mm*1.6);stat(e,'frz',.5);bst(e.x,52,16,c2,7,22,3,{k:'s'})}})
  }
 }
});
window.PETX[2]=TL;

/* ===================================================================
   HUYỀN VŨ (ô 4) — rùa-rắn thủy băng: Băng Thủy → Hàn Băng → Quy Giáp → Trấn Thiên
   =================================================================== */
const HV_C1=['#9fe0ff','#6fe0c8','#59a0ff','#ffd36a'],HV_C2=['#e6f7ff','#d8fff4','#cfe4ff','#fff0b8'];
const HV_RATE=[{slow:1},{frz:.18},{frz:.2,stn:.1},{frz:.24,stn:.14}];
const HV=make({
 k:3,title:'Huyền Vũ',ic:'💧',hi:'#bfeeff',
 HH:HVH.map(v=>v*1.25),AL:[44,50,56,62],COL:HV_C1,COL2:HV_C2,
 EVO:[{g:8000,  hb:{lien:12,chi:6},                    r:1,rn:'Trúc Cơ'},
      {g:60000, hb:{lien:36,sam:10,chi:20},            r:2,rn:'Kim Đan'},
      {g:300000,hb:{lien:90,sam:30,truc:20,hoa:20},    r:3,rn:'Nguyên Anh'}],
 SKL:[{ev:0,n:'Băng Thủy Đạn',d:'Đòn thường: bắn đạn nước băng tầm xa, làm chậm địch.'},
      {ev:0,n:'Huyền Thủy Hộ Thân',d:'Hồi máu chủ nhân, dựng màn nước bao quanh.'},
      {ev:1,n:'Hàn Băng Lao',d:'Đòn đánh có thể đóng băng. Thêm bổ nhào đâm băng và Băng Lao: cột băng trồi lên dưới chân địch.'},
      {ev:2,n:'Quy Giáp Bất Hoại',d:'Khiên rùa bao chủ nhân: hồi máu, hất lùi và làm choáng địch gần. Bắn 2 đạn băng, thêm vòng Huyền Ấn.'},
      {ev:3,n:'Huyền Vũ Trấn Thiên',d:'Đại chiêu: sóng lớn và băng giá trấn áp mọi địch, đóng băng diện rộng. Bắn 3 đạn băng.'},
      {ev:3,n:'Huyền Vũ Bất Diệt',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 40% máu kèm sóng băng (hồi chiêu 120 giây).'}],
 heal:[0,2],reb:{cd:7200,hp:.4,txt:'💧 Huyền Vũ Bất Diệt!',short:'Huyền Vũ Bất Diệt'},
 size:ev=>({w:HVZ[ev][0],h:HVZ[ev][1]}),icon:ev=>HVU[ev],
 body:(ev,ww,hh,mvf,atk,at,t)=>hvDraw(HVI[ev],ww,hh,ev,at,atk,EP.kind,mvf,t),
 shoot:(ev,x0,x1,y0)=>bolt(x0+EP.d*(HVH[ev]*.45),x1,y0,'water',HV_C1[ev],HV_C2[ev]),
 hit:(ev,x)=>{const c1=HV_C1[ev],c2=HV_C2[ev],h=window.PFH;h.flare(x,52,c1,90+ev*18,16);h.rg(x,70+ev*8,c1,16);h.bst(x,46,12+ev*3,c2,5,18,3,{k:'s'});if(ev>=2)h.gwave(x,c1,50+ev*12,22)},
 dive:(ev,x)=>{const h=window.PFH,c1=HV_C1[ev];for(let i=0;i<3;i++)h.later(i*3,()=>h.fx({t:'claw',x:x+(i-1)*22,c:c1,l:14}));h.gwave(x,c1,100+ev*14,24);h.shake(3+ev)},
 onHit:(e,ev,M,m)=>{const r=HV_RATE[ev],f=m==2?1.8:1;if(r.slow)e.sl=Math.max(e.sl||0,90);if(r.frz)stat(e,'frz',r.frz*f);if(r.stn)stat(e,'stn',r.stn*f)},
 skill:(ev,x,M,p,sn)=>{
  const h=window.PFH;if(!h)return;const {later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal,rain}=h;
  const d=EP.d||1,mm=M*PSK[3].m,c1=HV_C1[sn==4?3:sn],c2=HV_C2[sn==4?3:sn],r=190+ev*28;
  const hp0=Math.round(mx()*(.05+.015*ev)*pv(p));
  if(sn==0){            /* Huyền Thủy Hộ Thân */
   P.hp=Math.min(mx(),P.hp+hp0);DT.push({x:P.x,y:130,s:'+'+hp0,g:1,l:55});heal(P.x,c1);fx({t:'dome',r:78+ev*10,c:c2,l:70+ev*10});gwave(P.x,c1,150,28);later(5,()=>gwave(P.x,c2,120,26));vcol(P.x,'rgba(127,216,255,.8)',50,34);
   for(let i=0;i<22;i++)later(i%12,()=>fp(P.x+(R()-.5)*90,10+R()*60,{c:i%2?c1:c2,r:3+R()*3,l:36,vy:.5+R()*.7,sh:1}))
  }else if(sn==1){      /* Băng Lao: cột băng trồi dưới chân địch */
   tgs(x,r+160).slice(0,2+ev*2).forEach((e,i)=>later(4+i*3,()=>{if(!E.includes(e))return;fx({t:'pillar',x:e.x,w:44,c:c1,l:30});dm(e,mm*1.4);gwave(e.x,c1,100,26);bst(e.x,50,16,c2,6,22,3,{k:'s'});stat(e,'frz',.55)}));
   flash(c1,6);shake(4)
  }else if(sn==2){      /* Quy Giáp Bất Hoại: khiên rùa */
   P.hp=Math.min(mx(),P.hp+Math.round(hp0*1.3));DT.push({x:P.x,y:130,s:'+'+Math.round(hp0*1.3),g:1,l:55});heal(P.x,c1);fx({t:'dome',r:105,c:c2,l:120});gwave(P.x,c1,260,30);later(6,()=>gwave(P.x,c2,200,26));vcol(P.x,'rgba(89,160,255,.85)',58,34);
   E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<240){dm(e,mm*1.3);e.x+=(e.x<P.x?-1:1)*40;stat(e,'stn',.4);bst(e.x,52,14,c2,6,20,3,{k:'s'})}});
   flash(c1,8);shake(6)
  }else if(sn==3){      /* Trấn Thiên: sóng lớn + băng giá toàn màn */
   flash(c1,18);shake(9);gwave(x,c2,520,40);later(5,()=>gwave(x,c1,420,34));later(10,()=>gwave(x,c2,320,30));
   const mx2=E.filter(e=>e.in<=0);
   mx2.forEach((e,i)=>later(8+i*3,()=>{if(!E.includes(e))return;fx({t:'pillar',x:e.x,w:70,c:c1,l:30});dm(e,mm*2);dm(e,mm*.9);gwave(e.x,c1,140,30);rg(e.x,110,c2,20);stat(e,'frz',.6)}))
  }else{                /* sn==4: Bất Diệt — sóng băng hồi sinh */
   flash(c2,22);shake(9);heal(P.x,c1);fx({t:'dome',r:120,c:c2,l:110});gwave(P.x,c1,400,34);later(5,()=>gwave(P.x,c2,320,30));vcol(P.x,'rgba(255,211,106,.85)',64,36);
   E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<380){dm(e,mm*1.6);stat(e,'frz',.5);bst(e.x,52,16,c2,7,22,3,{k:'s'})}})
  }
 }
});
window.PETX[3]=HV;

/* ---------- Cập nhật dữ liệu thú (không sửa mảng gốc trong engine) ---------- */
try{
 Object.assign(PT4[2],{e:'🐉',m:.4,cd:42,rg:340,d:'Thần thú bay lượn, vỗ cánh phun long tức tầm xa · +% chí mạng, giảm hồi chiêu · mỗi lần tiến hóa thêm kỹ năng'});
 Object.assign(PK[2],{sp:6.2,sd:175,al:56,at:26,h:44,bc:'#bfe3ff'});
 Object.assign(PSK[2],{n:'Long Tức Thanh Long',d:'kỹ năng riêng mở thêm mỗi lần tiến hóa',cd:330,m:1});
 Object.assign(PT4[3],{e:'💧',m:.4,cd:44,rg:320,d:'Thần thú bay lượn, bắn đạn băng thủy · +% giảm ST nhận, máu · mỗi lần tiến hóa thêm kỹ năng'});
 Object.assign(PK[3],{sp:5.6,sd:165,al:44,at:26,h:44,bc:'#6fe0c8'});
 Object.assign(PSK[3],{n:'Huyền Thủy Huyền Vũ',d:'kỹ năng riêng mở thêm mỗi lần tiến hóa',cd:330,m:1});
}catch(e){console.error('[thần thú] không thể áp dữ liệu thú',e)}
})();
