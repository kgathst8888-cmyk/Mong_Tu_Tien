/* ===================================================================
   THẦN THÚ CHU TƯỚC (thay chim ưng)
   - 4 cấp tiến hoá, mỗi cấp một hình riêng (webp trong suốt đã tối ưu)
   - Vỗ cánh bằng lưới biến dạng (cánh phập phồng, đuôi lượn sóng), bay lượn / lướt gió
   - Đánh linh hoạt: bắn hỏa cầu liên hoàn · lao xuống thiêu đốt · kỹ năng riêng
   - Mỗi lần tiến hoá thêm kỹ năng + hiệu ứng, điều kiện tiến hoá khó dần
   Chỉnh cân bằng ở khối EVO / HH / AL bên dưới.
   =================================================================== */
const PHX=(()=>{
const U=window.PHX_URIS||[];
const IM=U.map(u=>{const i=new Image();i.src=u;return i});
const GXN=18,GRY=22;
const META=[{px:.5,sy:.3,wl:1,wr:1,fl:0},{px:.66,sy:.34,wl:1,wr:.32,fl:0},{px:.53,sy:.3,wl:1,wr:1,fl:0},{px:.5,sy:.33,wl:1,wr:1,fl:1}];
const HH=[76,98,124,150],AL=[56,64,72,80];
const COL=['#ff9a3a','#ff8030','#ffb030','#ffd060'],COL2=['#ffd070','#ffc050','#ffe080','#fff2c0'];
/* điều kiện tiến hoá: vàng + dược thảo từ Linh Điền + cảnh giới tối thiểu (cấp thú vẫn phải đạt mức tối đa) */
const EVO=[
 {g:8000,  hb:{hoa:12,chi:6},               r:1,rn:'Trúc Cơ'},
 {g:60000, hb:{hoa:36,sam:10,chi:20},       r:2,rn:'Kim Đan'},
 {g:300000,hb:{hoa:90,sam:30,truc:20,lien:20},r:3,rn:'Nguyên Anh'}
];
const HN={hoa:'🌺 Xích Hỏa Hoa',chi:'🍄 Linh Chi Thảo',sam:'🥕 Thiên Tâm Sâm',truc:'🎋 Tị Lôi Trúc',lien:'❄️ Băng Tâm Liên'};
const SKL=[
 {ev:0,n:'Hỏa Tiễn',d:'Đòn thường: phun hỏa cầu tầm xa.'},
 {ev:0,n:'Hỏa Vũ',d:'Mưa lửa trút xuống nhiều địch.'},
 {ev:1,n:'Thiêu Đốt',d:'Đòn đánh gây bỏng, mất máu theo thời gian. Thêm +% sát thương chí mạng.'},
 {ev:1,n:'Lao Xuống Thiêu Đốt',d:'Bổ nhào xuyên qua địch rồi vút lên. Thêm Liệt Diễm Phong Bạo: xoáy lửa diện rộng.'},
 {ev:2,n:'Niết Bàn Chi Hỏa',d:'Hồi máu chủ nhân, nổ lửa quanh chủ. Bắn 2 hỏa cầu, thêm vòng Hỏa Ấn: giảm ST nhận.'},
 {ev:3,n:'Thiên Hỏa Phần Thiên',d:'Đại chiêu: thiêu cháy mọi địch trên màn hình. Bắn 3 hỏa cầu.'},
 {ev:3,n:'Niết Bàn Trùng Sinh',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 45% máu (hồi chiêu 90 giây).'}
];
const OCC=[null,null,null,null],EM=[];
const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const hbq=h=>{try{return FM.get().herbs[h]|0}catch(e){return 0}};

function occ(ev){
 if(OCC[ev])return OCC[ev];const im=IM[ev];if(!im.complete||!im.naturalWidth)return null;
 const q=3,cv=document.createElement('canvas');cv.width=GXN*q;cv.height=GRY*q;const x=cv.getContext('2d');x.drawImage(im,0,0,cv.width,cv.height);
 const d=x.getImageData(0,0,cv.width,cv.height).data,o=new Uint8Array(GXN*GRY);
 for(let j=0;j<GRY;j++)for(let i=0;i<GXN;i++){let a=0;for(let v=0;v<q&&!a;v++)for(let u=0;u<q;u++)if(d[(((j*q+v)*cv.width)+i*q+u)*4+3]>10){a=1;break}o[j*GXN+i]=a}
 return OCC[ev]=o;
}
/* vẽ sprite theo lưới: cánh vỗ lên xuống (lan sóng ra đầu cánh), đuôi lượn sóng */
function mesh(ev,ww,hh,fp,fa,gl,sw){
 const im=IM[ev],o=occ(ev);if(!o)return;
 const M=META[ev],iw=im.naturalWidth,ih=im.naturalHeight,cw=iw/GXN,ch=ih/GRY,m=.7,kx=ww/iw,ky=hh/ih;
 for(let j=0;j<GRY;j++){
  const v=(j+.5)/GRY,wv=1-sst(M.sy+.12,M.sy+.44,v),tv=sst(.5,1,v);
  for(let i=0;i<GXN;i++){
   if(!o[j*GXN+i])continue;
   const u0=(i+.5)/GXN,u=(u0-M.px)/(u0<M.px?M.px:1-M.px),au=Math.min(1,Math.abs(u)),wg=(u<0?M.wl:M.wr)*Math.pow(au,1.3)*wv;
   const fl=Math.sin(fp-au);
   let dy=-(fl*fa+gl*.35)*.19*hh*wg,dx=-Math.sign(u)*(.5+.5*fl)*.05*ww*wg*(1-gl*.6);
   if(tv>0){const w=fp*.5-v*5.5;dx+=Math.sin(w)*sw*ww*.085*Math.pow(tv,1.5);dy+=Math.cos(w)*sw*hh*.012*tv}
   const sx0=Math.max(0,i*cw-m),sy0=Math.max(0,j*ch-m),sx1=Math.min(iw,(i+1)*cw+m),sy1=Math.min(ih,(j+1)*ch+m);
   g.drawImage(im,sx0,sy0,sx1-sx0,sy1-sy0,-ww/2+sx0*kx+dx,-hh+sy0*ky+dy,(sx1-sx0)*kx,(sy1-sy0)*ky);
  }
 }
}
function ring(x,y,hh,ev,t){
 const R0=hh*(.5+ev*.04),a0=ev>=3?.7:.5;
 g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.lineWidth=Math.max(1,1.4*s);
 g.save();g.rotate(t*.012);g.strokeStyle='rgba(255,215,120,'+a0+')';
 g.beginPath();g.arc(0,0,R0,0,6.2832);g.stroke();g.beginPath();g.arc(0,0,R0*.88,0,6.2832);g.stroke();
 for(let i=0;i<12;i++){const a=i*.5236,c=Math.cos(a),n=Math.sin(a);g.beginPath();g.moveTo(c*R0*.88,n*R0*.88);g.lineTo(c*R0*.96,n*R0*.96);g.stroke()}
 g.fillStyle='rgba(255,236,160,.8)';
 for(let i=0;i<8;i++){const a=i*.7854+.2;g.save();g.translate(Math.cos(a)*R0*.94,Math.sin(a)*R0*.94);g.rotate(a);g.beginPath();g.moveTo(0,-3*s);g.lineTo(2*s,0);g.lineTo(0,3*s);g.lineTo(-2*s,0);g.closePath();g.fill();g.restore()}
 g.restore();
 if(ev>=3){
  g.save();g.rotate(-t*.007);
  for(let i=0;i<16;i++){const a=i*6.2832/16,c=Math.cos(a),n=Math.sin(a),l=R0*(i%2?1.28:1.55),gr=g.createLinearGradient(c*R0,n*R0,c*l,n*l);gr.addColorStop(0,'rgba(255,220,120,.55)');gr.addColorStop(1,'rgba(255,220,120,0)');g.strokeStyle=gr;g.lineWidth=(i%2?1.4:2.6)*s;g.beginPath();g.moveTo(c*R0,n*R0);g.lineTo(c*l,n*l);g.stroke()}
  g.restore();
 }
 g.restore();
}
function star(x,y,r,a){g.save();g.globalAlpha=a;g.fillStyle='#fff6c0';g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();g.restore()}
function ember(x,y,vx,vy,l,c,r,st){EM.push({x,y,vx,vy,l,l0:l,c,r,st})}

/* ---------- Vẽ ---------- */
function draw(){
 const p=pet();if(!p)return;const ev=p.ev,t=fr,im=IM[ev];if(!im.complete||!im.naturalWidth)return;
 const hh=HH[ev]*s,ww=hh*im.naturalWidth/im.naturalHeight;
 const cx=(EP.x-cam)*s,by=GY-EP.y*s,mvf=Math.min(1,Math.abs(EP.vx)/2.4),atk=EP.at>0,at=atk?1-EP.at/EP.atT:0,col=COL[ev],col2=COL2[ev],sn=atk?Math.sin(at*3.1416):0;
 const mcx=cx,mcy=by-hh*.52,fp=EP.fp||0;
 g.save();
 g.fillStyle='rgba(0,0,0,'+Math.max(.08,.3-EP.y/330).toFixed(3)+')';g.beginPath();g.ellipse(cx,GY+2,ww*.3*(1-Math.min(.5,EP.y/260)),4.5*s,0,0,6.2832);g.fill();
 if(ev>=1){g.save();g.translate(cx,GY+2);g.scale(1,.28);g.rotate(t*.02);g.strokeStyle=RGBA(col,.55);g.lineWidth=1.8*s;g.setLineDash([7*s,5*s]);g.beginPath();g.arc(0,0,ww*.55,0,6.2832);g.stroke();g.restore()}
 glowDraw(mcx,mcy,hh*(.75+ev*.1)+(atk?hh*.35*sn:0),col,.28+ev*.07+(atk?.3*sn:0)+.05*Math.sin(t*.08));
 if(ev>=2)ring(mcx,mcy,hh,ev,t);
 /* bóng mờ khi bay nhanh */
 if(ev>=2&&mvf>.45){EP.tr=EP.tr||[];if(t%3==0){EP.tr.push({x:cx,y:by,d:EP.d});if(EP.tr.length>3)EP.tr.shift()}
  EP.tr.forEach((q,i)=>{g.save();g.globalAlpha=.1+i*.05;g.globalCompositeOperation='lighter';g.translate(q.x,q.y);g.scale(q.d*(META[ev].fl?-1:1),1);g.drawImage(im,-ww/2,-hh,ww,hh);g.restore()})}
 /* tư thế */
 const vy=EP.y-(EP.ly||EP.y);let rot=-vy*.05+Math.sin(t*.03)*.025,sx=1,sy=1;
 if(atk){
  if(EP.mt==1){rot=.5*Math.sin(at*6.2832);sx=1+.06*sn}
  else if(EP.mt==2){rot=-.1*sn;sx=1+.12*sn;sy=1+.05*sn}
  else{rot=-.14*sn;sx=1+.05*sn}
 }
 const eu=EP.evT!==undefined?fr-EP.evT:999,pop=eu>=0&&eu<60?1+.2*Math.sin(eu/60*3.1416):1;
 g.translate(cx,by);const fl=META[ev].fl?-1:1;g.scale(EP.d*fl,1);g.rotate(rot*fl);g.scale(sx*pop,sy*pop);
 mesh(ev,ww,hh,fp,EP.fa||.6,EP.gl||0,EP.sw||.4);
 if(ev>=2){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.12+.08*Math.sin(t*.1)+(atk?.12*sn:0);g.drawImage(im,-ww/2,-hh,ww,hh);g.restore()}
 g.restore();
 /* tàn lửa + sao */
 const every=Math.max(2,7-ev*2);
 if(t%every==0){const n=ev>=3?2:1;for(let i=0;i<n;i++)ember(EP.x+(R()-.5)*ww/s*.8,EP.y+HH[ev]*(.1+R()*.75),(R()-.5)*.5-EP.vx*.12,.35+R()*.9,40+R()*30,[col,col2,'#fff3c0'][(R()*3)|0],(2.2+R()*3)*s)}
 if(ev>=3&&t%16==0)ember(EP.x+(R()-.5)*ww/s*1.2,EP.y+HH[ev]*(.2+R()*.9),0,.2,50,'#fff6c0',(3+R()*3)*s,1);
 if(mvf>.5&&t%2==0)ember(EP.x-EP.d*ww/s*.15,EP.y+HH[ev]*.1,-EP.d*.5,.2,28,col2,(2+R()*2)*s);
 for(let i=EM.length-1;i>=0;i--){const e=EM[i];e.x+=e.vx;e.y+=e.vy;e.vx*=.99;if(--e.l<=0){EM.splice(i,1);continue}const a=e.l/e.l0,X=(e.x-cam)*s,Y=GY-e.y*s;if(e.st)star(X,Y,e.r*(.6+.5*Math.sin(e.l*.3)),a);else glowDraw(X,Y,e.r*(.6+.8*a),e.c,a*.9)}
 if(EM.length>160)EM.splice(0,EM.length-160);
 /* vòng lửa khi dùng kỹ năng */
 if(atk&&EP.kind&&at<.55){const u=at/.55;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col2;g.shadowColor=col;g.shadowBlur=14;g.lineWidth=(3+3*u)*s;g.globalAlpha=.8*(1-u*.4);g.beginPath();g.arc(mcx,mcy,hh*(1.0-u*.55),0,6.2832);g.stroke();g.restore()}
 g.restore();
}

/* ---------- Bỏng ---------- */
function burn(e,t,m){if(!e||e.hp<=0)return;const b=(EP.bn||(EP.bn=[])).find(q=>q.e===e);if(b){b.t=Math.max(b.t,t);b.m=Math.max(b.m,m)}else EP.bn.push({e,t,m})}
function burnHit(e,m){const d=Math.max(1,Math.round(atk()*m*(.9+R()*.2)*100/(100+(e.df||0))));e.hp-=d;e.fl=4;DT.push({x:e.x,y:(e.hh||100)*SZ,s:d,c:'#ff9a3a',l:38})}

/* ---------- Bắn hỏa cầu liên hoàn ---------- */
function volley(e,p,M){
 const ev=p.ev,n=1+(ev>=2?1:0)+(ev>=3?1:0),each=n==1?M:M*.65;
 for(let i=0;i<n;i++){
  EP.q.push({t:4+i*6,f:()=>{if(!E.includes(e)&&e.hp<=0)return;try{ZS.pf.shoot(1,EP.x,e.x,EP.y+HH[ev]*.45)}catch(x){}}});
  EP.q.push({t:12+i*6,f:()=>{if(e.hp>0&&E.includes(e)){dm(e,each);try{ZS.pf.hit(1,ev,e.x,0)}catch(x){}if(ev>=1)burn(e,150+ev*30,M*.2)}}});
 }
}

/* ---------- Bước điều khiển (thay epstep cho Chu Tước) ---------- */
function step(p,T,K,M,e){
 const ev=p.ev;
 if(EP.fp===undefined)Object.assign(EP,{fp:0,fa:.6,gl:0,ly:EP.y||0,mt:0,na:0,si:0,bn:[],rb:EP.rb||0,q:[],sw:.4,skn:0,evo:0});
 if(EP.rb>0)EP.rb--;
 for(let i=EP.q.length-1;i>=0;i--){const q=EP.q[i];if(--q.t<=0){EP.q.splice(i,1);try{q.f()}catch(x){}}}
 for(let i=EP.bn.length-1;i>=0;i--){const b=EP.bn[i];if(b.e.hp<=0||!E.includes(b.e)||--b.t<=0){EP.bn.splice(i,1);continue}
  if(b.t%22==0)burnHit(b.e,b.m);
  if(b.t%4==0)ember(b.e.x+(R()-.5)*26,30+R()*50,(R()-.5)*.3,.5+R()*.5,26,['#ff9a3a','#ffd060'][(R()*2)|0],(2+R()*2)*s)}
 const base0=AL[ev]+Math.sin(EP.t*.03)*7+Math.sin(EP.t*.011+1)*(5+ev*2);
 EP.ly=EP.y;
 /* ---- đang tấn công ---- */
 if(EP.at>0){
  const u=1-EP.at/EP.atT,tg=EP.tg;if(tg&&E.includes(tg))EP.tgx=tg.x;
  const side=EP.ox<EP.tgx?-1:1;
  if(Math.abs(EP.tgx-EP.ox)>1)EP.d=Math.sign(EP.tgx-EP.ox);
  if(EP.mt==1){
   const w=Math.sin(Math.min(1,u)*3.1416),gx=EP.tgx+side*28,ant=u<.2?Math.sin(u/.2*3.1416)*10:0;
   EP.x=EP.ox+(gx-EP.ox)*w*.95;EP.y=base0+8+ant-w*(base0-4);
   EP.gl+=(.9-EP.gl)*.2;EP.fa+=(.15-EP.fa)*.2;if(u>.5){EP.gl+=(0-EP.gl)*.3;EP.fa+=(1.1-EP.fa)*.25}
   if(u>=.5&&!EP.hit){EP.hit=1;if(tg&&E.includes(tg)){dm(tg,M*1.5);burn(tg,200+ev*30,M*.24);try{ZS.pf.hit(1,ev,tg.x,0)}catch(x){}for(let i=0;i<10;i++)ember(tg.x+(R()-.5)*40,20+R()*40,(R()-.5)*2.5,.6+R()*1.2,34,'#ffb040',(2.5+R()*2.5)*s)}}
  }else if(EP.mt==2){
   const w=Math.sin(Math.min(1,u)*3.1416);EP.y=base0+w*28;EP.gl+=(0-EP.gl)*.2;EP.fa+=(1.15-EP.fa)*.2;
   if(u>=.45&&!EP.hit){EP.hit=1;try{ZS.pf.skill(1,ev,EP.x,M,p,EP.skn)}catch(x){}}
  }else{
   const w=Math.sin(Math.min(1,u)*3.1416);EP.y=base0+w*6;EP.gl+=(0-EP.gl)*.2;EP.fa+=(1.0-EP.fa)*.2;
   EP.x-=side*.35*w;
  }
  EP.fp+=EP.mt==1&&u<.5?.05:.34;EP.sw+=(1-EP.sw)*.1;
  EP.at--;if(EP.at<=0){EP.x=EP.mt==1?EP.ox:EP.x;EP.vx=0}
  return;
 }
 /* ---- bay lượn theo chủ ---- */
 let tx=Math.max(40,P.x-(72+ev*8)*P.d+Math.sin(EP.t*.017)*(44+ev*9)),run=1;
 if(e){const s2=EP.x<e.x?-1:1;tx=cl(e.x+s2*K.sd,Math.max(40,P.x-150),P.x+150)}
 if(Math.abs(EP.x-P.x)>480){EP.x=P.x-60*P.d;EP.vx=0}
 const dx=tx-EP.x,far=Math.abs(EP.x-P.x)>220;if(far)run=1.9;
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
 /* ---- quyết định tấn công ---- */
 if(e&&EP.cd<=0&&Math.abs(e.x-EP.x)<T.rg+30){
  const spec=EP.sk<=0,dist=Math.abs(e.x-EP.x);
  let mt=0;if(spec)mt=2;else if(ev>=1&&dist<210&&(EP.na%3==2||R()<.18))mt=1;
  EP.na++;
  EP.ox=EP.x;EP.tg=e;EP.tgx=e.x;EP.hit=0;EP.kind=spec?1:0;EP.mt=mt;
  if(spec){const lst=[0,1,2,3].slice(0,ev+1);let sn=lst[EP.si++%lst.length];if(sn==2&&P.hp>mx()*.9&&lst.length>1)sn=lst[EP.si++%lst.length];EP.skn=sn;EP.sk=Math.round(PSK[1].cd*(1-.06*ev))}
  EP.atT=mt==1?46:mt==2?44:30;EP.at=EP.atT;EP.cd=Math.max(24,T.cd-ev*5);
  if(mt==0)volley(e,p,M);
 }
}

/* ---------- Hồi sinh Niết Bàn (Thượng Cổ Thần Chu Tước) ---------- */
function rebirth(){
 const p=pet();if(!p||p.k!=1||p.ev<3||(EP.rb|0)>0)return false;
 EP.rb=5400;P.hp=Math.max(1,Math.round(mx()*.45));
 DT.push({x:P.x,y:150,s:'🔥 Niết Bàn Trùng Sinh!',c:'#ffd060',g:1,l:130});
 try{ZS.pf.skill(1,3,P.x,pm(p),p,4)}catch(x){}
 return true;
}

/* ---------- Giao diện ---------- */
const img=ev=>U[ev];
function skillsHtml(p){
 return '<br>🌟 <b>Kỹ năng Chu Tước</b>'+SKL.map(k=>{const on=p.ev>=k.ev;return `<br><small style="opacity:${on?1:.45};color:${on?'#ffe9a0':'#aaa'}">${on?'🔥':'🔒'} <b>${k.n}</b>${on?'':' (Tiến hóa '+(k.ev+1)+')'}: ${k.d}</small>`}).join('')+(p.ev>=3?`<br><small>Niết Bàn: ${(EP.rb|0)>0?'hồi chiêu '+Math.ceil(EP.rb/60)+'s':'<b style="color:#7fe08a">sẵn sàng</b>'}</small>`:'');
}
function can(p){
 if(p.ev>=3||p.lv<pcap(p))return false;const r=EVO[p.ev];
 if(gold<r.g||ZC.rI()<r.r)return false;
 return Object.keys(r.hb).every(h=>hbq(h)>=r.hb[h]);
}
function evoHtml(p){
 const r=EVO[p.ev],ok=(b,t)=>`<span style="color:${b?'#7fe08a':'#ff8a7a'}">${t}</span>`;
 return 'Cần: '+ok(p.lv>=pcap(p),'cấp '+p.lv+'/'+pcap(p))+' · '+ok(ZC.rI()>=r.r,'cảnh giới '+r.rn+'+')+' · '+ok(gold>=r.g,fmtN(r.g)+'💰')+'<br>'+Object.keys(r.hb).map(h=>ok(hbq(h)>=r.hb[h],HN[h]+' '+hbq(h)+'/'+r.hb[h])).join(' · ')+'<br><small style="opacity:.75">Dược thảo trồng ở bản đồ Linh Điền (🌱), tiến hóa ở 🏘 Làng.</small>';
}
const gold_=p=>EVO[p.ev].g,pay=p=>{const r=EVO[p.ev];Object.keys(r.hb).forEach(h=>{FM.get().herbs[h]-=r.hb[h]})};
function skill(ev,x,M,p,sn){
 const H=window.PFH;if(!H)return;const {rain,later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal,rune}=H;
 const c1='#ff8a30',c2='#ffd060',c3='#fff3c0',r=190+ev*30,mm=M*PSK[1].m,bn=burn;
 const tgs=()=>E.filter(e=>e.in<=0&&Math.abs(e.x-x)<r+120).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));
 if(sn==0){
  const tg=tgs().slice(0,2+ev),xs=[];tg.forEach(e=>{xs.push(e.x-12,e.x+12)});while(xs.length<6)xs.push(x+P.d*(60+R()*220));
  rain(xs,'arrow',c2,2,12,0);later(7,()=>rain(xs.map(q=>q+(R()-.5)*26),'arrow',c1,2,12,0));gwave(x,c1,170,26);flare(x,70,c2,110+ev*10,20);flash(c3,5);shake(3);
  tg.forEach((e,i)=>later(10+i*3,()=>{dm(e,mm);dm(e,mm*.6);bn(e,150,M*.18);fx({t:'claw',x:e.x,c:c1,l:16});bst(e.x,52,16,c2,6,16,3,{k:'s'})}))
 }else if(sn==1){
  const t0=tgs()[0],cx=t0?t0.x:x+P.d*160;gwave(cx,c1,r+30,34);later(5,()=>gwave(cx,c2,r,28));
  for(let i=0;i<30;i++)later(i%18,()=>fp(cx+(R()*2-1)*(r+10),6+R()*30,{c:i%2?c1:c2,r:9+R()*9,l:70,vy:.5+R()*.9,vx:(R()-.5)*.8,f:1,sh:1}));
  vcol(cx,'rgba(255,138,48,.85)',64,36);flash('#ffb060',6);shake(5);
  E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-cx)<r+10){dm(e,mm*1.5);bn(e,200,M*.24);fx({t:'claw',x:e.x,c:c1,l:16})}})
 }else if(sn==2||sn==4){
  const big=sn==4,h=Math.round(mx()*((big?.2:.06)+.02*ev)*pv(p));P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:130,s:'+'+h,g:1,l:55});
  heal(P.x,c1);fx({t:'dome',r:big?110:90,c:c2,l:90});gwave(P.x,c1,big?300:220,30);later(6,()=>gwave(P.x,c3,big?240:170,26));vcol(P.x,'rgba(255,200,90,.85)',58,34);flare(P.x,60,c2,big?170:130,22);flash(c2,big?14:8);shake(big?8:4);
  E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<(big?340:230)){dm(e,mm*(big?2:1.4));bn(e,180,M*.22);fx({t:'claw',x:e.x,c:c1,l:16})}})
 }else{
  rune(P.x,200,c1,70);flash(c1,40);shake(10);gwave(P.x,c2,520,40);later(5,()=>gwave(P.x,c3,420,34));
  E.forEach((e,i)=>{if(e.in>0)return;later(10+i*3,()=>{fx({t:'pillar',x:e.x,w:80,c:c1,l:28});if(e.hp>0){dm(e,mm*2.4);dm(e,mm*1.2);bn(e,260,M*.3)}bst(e.x,50,22,c1,8,24,5,{g:.1});rg(e.x,120,c2,20)})})
 }
}
return{draw,step,skill,rebirth,burn,img,col:ev=>COL[ev],gold:gold_,pay,skillsHtml,can,evoHtml,U}
})();

/* ---- Thay dữ liệu thú số 1 (chim ưng) bằng Chu Tước, không sửa mảng gốc trong engine ---- */
try{
 Object.assign(PT4[1],{n:['Hoả Điểu Nhỏ','Linh Điểu Trưởng Thành','Thánh Điểu Chu Tước','Thượng Cổ Thần Chu Tước'],e:'🔥',m:.4,cd:42,rg:340,d:'Thần thú bay lượn tầm xa, đốt cháy · +% chí mạng, chính xác · mỗi lần tiến hóa thêm kỹ năng'});
 Object.assign(PK[1],{sp:6.2,sd:175,al:56,at:26,h:44,bc:'#ffb040'});
 Object.assign(PSK[1],{n:'Hỏa Vũ Chu Tước',d:'kỹ năng riêng mở thêm mỗi lần tiến hóa',cd:330,m:1});
 PTU[1]=PHX.U[0];PTI[1]=(()=>{const i=new Image();i.src=PHX.U[0];return i})();
}catch(e){console.error('[Chu Tước] không thể áp dữ liệu thú',e)}
