/* ===================================================================
   THẦN THÚ BẠCH HỔ (thay "Hổ"), cơ chế như Chu Tước
   - 4 cấp tiến hoá, mỗi cấp một hình (assets/bach-ho-assets.js, webp trong suốt):
     Sơ Sinh → Chiến Binh → Cổ Đại Đại Sư (hổ-rồng hợp thể) → Tối Thượng Thần Thú (có cánh)
   - Chạy trên mặt đất: bước chân (lưới biến dạng), đuôi lượn, bờm / đầu rồng đung đưa, cánh vỗ (cấp 4)
   - Đánh: cào liên hoàn · vồ nhảy chảy máu · kỹ năng riêng; mỗi cấp thêm kỹ năng + hiệu ứng
   - Tiến hoá cần vàng + dược thảo Linh Điền + cảnh giới (khối EVO). Chỉnh cân bằng ở EVO / HH / SKL.
   - Móc trong engine: peg, epstep, drawEP, pimg/pcol, ZS.pf.skill, petUI, pev, PB, hồi sinh (typeof PTG!='undefined')
   =================================================================== */
const PTG=(()=>{
const U=window.PTG_URIS||[];
const IM=U.map(u=>{const i=new Image();i.src=u;return i});
const GXN=15,GRY=15,PI=Math.PI;
const HH=[64,86,106,120];                      /* chiều cao hiển thị theo cấp */
const FL=[0,0,1,0];                            /* 1 = hình gốc quay sang trái */
const TL=[{u:.3,a:.45,b:.95},{u:.3,a:.45,b:.95},{u:.2,a:.5,b:.95},{u:.26,a:.5,b:.92}];   /* vùng đuôi trên ảnh */
const COL=['#cfeaff','#a8dcff','#8fd0ff','#ffe9a0'],COL2=['#ffffff','#f0f9ff','#d8efff','#fff6d0'];
const EVO=[
 {g:8000,  hb:{chi:10,thao:8},                  r:1,rn:'Trúc Cơ'},
 {g:60000, hb:{chi:24,sam:12,lien:16},          r:2,rn:'Kim Đan'},
 {g:300000,hb:{sam:30,lien:40,truc:24,dang:14}, r:3,rn:'Nguyên Anh'}
];
const HN={chi:'🍄 Linh Chi Thảo',sam:'🥕 Thiên Tâm Sâm',lien:'❄️ Băng Tâm Liên',truc:'🎋 Tị Lôi Trúc',thao:'🌱 Hồi Sinh Thảo',dang:'🌿 Huyền Quy Đằng'};
const SKL=[
 {ev:0,n:'Hổ Trảo',d:'Đòn thường: lao tới vồ cào cận chiến.'},
 {ev:0,n:'Hổ Khiếu',d:'Gầm vang: sóng âm chấn thương mọi địch quanh thú.'},
 {ev:1,n:'Liệt Trảo',d:'Đòn đánh gây chảy máu theo thời gian. Thêm +% sát thương chí mạng.'},
 {ev:1,n:'Phi Phác Liệt Trảo',d:'Vồ nhảy tới địch. Thêm Kim Phong Bạo: loạt vuốt xé nhiều địch.'},
 {ev:2,n:'Long Hổ Hộ Thể',d:'Hồi máu chủ nhân, nổ sóng băng quanh chủ. Cào 2 nhát liên hoàn, giảm ST nhận.'},
 {ev:3,n:'Thiên Cương Bạch Hổ Trảm',d:'Đại chiêu: chém xuống mọi địch trên màn hình. Cào 3 nhát.'},
 {ev:3,n:'Thần Hổ Thủ Hộ',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 45% máu (hồi chiêu 90 giây).'}
];
const OCC=[null,null,null,null],EM=[];
const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const hbq=h=>{try{return FM.get().herbs[h]|0}catch(e){return 0}};
function occ(ev){
 if(OCC[ev])return OCC[ev];const im=IM[ev];if(!im||!im.complete||!im.naturalWidth)return null;
 const q=3,cv=document.createElement('canvas');cv.width=GXN*q;cv.height=GRY*q;const x=cv.getContext('2d');x.drawImage(im,0,0,cv.width,cv.height);
 const d=x.getImageData(0,0,cv.width,cv.height).data,o=new Uint8Array(GXN*GRY);
 for(let j=0;j<GRY;j++)for(let i=0;i<GXN;i++){let a=0;for(let v=0;v<q&&!a;v++)for(let u=0;u<q;u++)if(d[(((j*q+v)*cv.width)+i*q+u)*4+3]>10){a=1;break}o[j*GXN+i]=a}
 return OCC[ev]=o;
}
/* vẽ sprite theo lưới: chân bước, đuôi lượn, bờm/đầu rồng đung đưa, cánh vỗ (cấp 4) */
function mesh(ev,ww,hh,t,wp,mvf,fp,fa,c){
 const im=IM[ev],o=occ(ev);if(!o)return;
 const iw=im.naturalWidth,ih=im.naturalHeight,cw=iw/GXN,ch=ih/GRY,m=.7,kx=ww/iw,ky=hh/ih,tl=TL[ev];
 for(let j=0;j<GRY;j++){
  const v=(j+.5)/GRY;
  for(let i=0;i<GXN;i++){
   if(!o[j*GXN+i])continue;
   const u=(i+.5)/GXN;let dx=0,dy=0;
   const lv=sst(.7,.98,v);
   if(lv>0&&mvf>.02){const ph=wp+u*10;dx+=Math.sin(ph)*mvf*ww*.022*lv;dy-=Math.max(0,Math.sin(ph+1.4))*mvf*hh*.03*lv}
   const tw=sst(tl.u,0,u)*sst(tl.a-.08,tl.a+.1,v)*(1-sst(tl.b-.06,tl.b+.04,v));
   if(tw>0){const w=t*.09-(tl.u-u)*16;dx+=Math.sin(w)*tw*ww*(.03+.025*mvf);dy+=Math.cos(w)*tw*hh*.012}
   if(ev==2){
    const mw=sst(.45,.1,v)*sst(.05,.25,u)*sst(.8,.55,u);dx+=Math.sin(t*.06-v*9+u*5)*mw*ww*.012;dy+=Math.cos(t*.05-u*7)*mw*hh*.008;
    const hb=sst(.3,.4,v)*(1-sst(.58,.66,v)),hl=sst(.2,.08,u)*hb,hr=sst(.8,.92,u)*hb;
    dx+=Math.sin(t*.07)*(hl-hr)*ww*.02;dy+=Math.sin(t*.07+1.3)*(hl+hr)*hh*.025;
   }
   if(ev==3&&u<.62){
    const au=(.62-u)/.62,wg=Math.pow(au,1.2)*(1-sst(.3,.55,v)),f=Math.sin(fp-au);
    dy+=-(f*fa)*.18*hh*wg;dx+=(.5+.5*f)*.04*ww*wg;
   }
   const sx0=Math.max(0,i*cw-m),sy0=Math.max(0,j*ch-m),sx1=Math.min(iw,(i+1)*cw+m),sy1=Math.min(ih,(j+1)*ch+m);
   c.drawImage(im,sx0,sy0,sx1-sx0,sy1-sy0,-ww/2+sx0*kx+dx,-hh+sy0*ky+dy,(sx1-sx0)*kx,(sy1-sy0)*ky);
  }
 }
}
/* bộ nhớ đệm lưới biến dạng: vẽ lại lưới mỗi 2 khung (30Hz), các khung còn lại chỉ blit 1 ảnh (giảm ~50% chi phí vẽ) */
const MC={cv:null,cx:null,ev:-1,t:-99,w:0,h:0};
function cmesh(ev,ww,hh,fn){
 const W=Math.ceil(ww*1.5),H=Math.ceil(hh*1.45),oy=Math.round(hh*1.3);
 if(!MC.cv){MC.cv=document.createElement('canvas');MC.cx=MC.cv.getContext('2d')}
 if(MC.w!==W||MC.h!==H||MC.ev!==ev){MC.cv.width=W;MC.cv.height=H;MC.w=W;MC.h=H;MC.ev=ev;MC.t=-99}
 if(fr-MC.t>=2||fr<MC.t){const c2=MC.cx;c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,W,H);c2.translate(W/2,oy);fn(c2);MC.t=fr}
 g.drawImage(MC.cv,-W/2,-oy);
}
function ring(x,y,hh,ev,t,k){
 const R0=hh*(.55+(k||0)*.12),a0=ev>=3?.7:.5,gold=ev>=3;
 g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.lineWidth=Math.max(1,1.4*s);
 g.save();g.rotate(t*.012);g.strokeStyle=gold?'rgba(255,225,140,'+a0+')':'rgba(180,225,255,'+a0+')';
 g.beginPath();g.arc(0,0,R0,0,6.2832);g.stroke();g.beginPath();g.arc(0,0,R0*.88,0,6.2832);g.stroke();
 for(let i=0;i<12;i++){const a=i*.5236,c=Math.cos(a),n=Math.sin(a);g.beginPath();g.moveTo(c*R0*.88,n*R0*.88);g.lineTo(c*R0*.96,n*R0*.96);g.stroke()}
 g.restore();g.restore();
}
function star(x,y,r,a){g.save();g.globalAlpha=a;g.fillStyle='#eaf8ff';g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();g.restore()}
function mote(x,y,vx,vy,l,c,r,st){EM.push({x,y,vx,vy,l,l0:l,c,r,st})}

/* ---------- Vẽ ---------- */
function draw(){
 const p=pet();if(!p)return;const ev=p.ev,t=fr,im=IM[ev];if(!im||!im.complete||!im.naturalWidth)return;
 const hh=HH[ev]*s,ww=hh*im.naturalWidth/im.naturalHeight,d=EP.d||1,ey=EP.y||0;
 if((EP.x-cam)*s<-ww*2||(EP.x-cam)*s>c.width+ww*2)return;   /* ngoài màn hình: bỏ qua */
 const cx=(EP.x-cam)*s,by=GY-ey*s,mvf=Math.min(1,Math.abs(EP.vx||0)/3),atk=EP.at>0,at=atk?1-EP.at/EP.atT:0,sn=atk?Math.sin(at*PI):0;
 const col=COL[ev],col2=COL2[ev],mcx=cx,mcy=by-hh*.5;
 g.save();
 g.fillStyle='rgba(0,0,0,'+Math.max(.08,.32-ey/300).toFixed(3)+')';g.beginPath();g.ellipse(cx,GY+2,ww*.36*(1-Math.min(.5,ey/260)),5*s,0,0,6.2832);g.fill();
 if(ev>=1){g.save();g.translate(cx,GY+2);g.scale(1,.28);g.rotate(t*.02);g.strokeStyle=RGBA(col,.55);g.lineWidth=1.8*s;g.setLineDash([7*s,5*s]);g.beginPath();g.arc(0,0,ww*.6,0,6.2832);g.stroke();g.restore()}
 glowDraw(mcx,mcy,hh*(.7+ev*.1)+(atk?hh*.3*sn:0),col,.16+ev*.05+(atk?.25*sn:0)+.04*Math.sin(t*.08));
 if(ev>=2)ring(mcx,mcy,hh,ev,t,ev-2);
 /* bóng mờ khi lao nhanh / vồ */
 if(ev>=1&&(mvf>.6||(atk&&EP.mt==1))){EP.tr=EP.tr||[];if(t%3==0){EP.tr.push({x:cx,y:by,d:d});if(EP.tr.length>3)EP.tr.shift()}
  EP.tr.forEach((q,i)=>{g.save();g.globalAlpha=.1+i*.05;g.globalCompositeOperation='lighter';g.translate(q.x,q.y);g.scale(q.d*(FL[ev]?-1:1),1);g.drawImage(im,-ww/2,-hh,ww,hh);g.restore()})}
 /* tư thế */
 let rot=Math.sin(t*.03)*.012,sx=1,sy=1+Math.sin(t*.07)*.012,bob=mvf*Math.abs(Math.sin((EP.ph||0)*1.25))*2.2*s;
 if(atk){
  if(EP.mt==1){rot=-.34*Math.sin(at*PI*1.1)+.12*sn;sx=1+.1*sn}
  else if(EP.mt==2){rot=.12*sn;sy=1+.06*sn;sx=1-.02*sn;bob-=3*s*sn}
  else{rot=-.14*sn;sx=1+.08*sn}
 }
 const eu=EP.evT!==undefined?fr-EP.evT:999,pop=eu>=0&&eu<60?1+.2*Math.sin(eu/60*PI):1,fl=FL[ev]?-1:1;
 g.translate(cx,by-bob);g.scale(d*fl,1);g.rotate(rot*fl);g.scale(sx*pop,sy*pop);
 cmesh(ev,ww,hh,c2=>mesh(ev,ww,hh,t,(EP.ph||0)*1.25,mvf,EP.fp||0,EP.fa||.6,c2));
 if(ev>=2){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.1+.07*Math.sin(t*.1)+(atk?.12*sn:0);g.drawImage(im,-ww/2,-hh,ww,hh);g.restore()}
 g.restore();
 /* tinh thể băng + sao */
 if(t%Math.max(3,8-ev*2)==0)mote(EP.x+(R()-.5)*ww/s*.8,ey+HH[ev]*(.1+R()*.8),(R()-.5)*.4,.25+R()*.6,40+R()*30,[col,col2,'#ffffff'][(R()*3)|0],(2+R()*2.6)*s);
 if(ev>=3&&t%14==0)mote(EP.x+(R()-.5)*ww/s*1.2,ey+HH[ev]*(.2+R()*.9),0,.2,50,'#fff6c0',(3+R()*3)*s,1);
 if(mvf>.5&&t%2==0)mote(EP.x-d*ww/s*.2,ey+6,-d*.5,.15,26,col2,(1.8+R()*2)*s);
 for(let i=EM.length-1;i>=0;i--){const e=EM[i];e.x+=e.vx;e.y+=e.vy;e.vx*=.99;if(--e.l<=0){EM.splice(i,1);continue}const a=e.l/e.l0,X=(e.x-cam)*s,Y=GY-e.y*s;if(e.st)star(X,Y,e.r*(.6+.5*Math.sin(e.l*.3)),a);else glowDraw(X,Y,e.r*(.6+.8*a),e.c,a*.9)}
 if(EM.length>150)EM.splice(0,EM.length-150);
 /* vòng sáng khi gầm / dùng kỹ năng */
 if(atk&&EP.mt==2&&at<.6){const u=at/.6;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col2;g.shadowColor=col;g.shadowBlur=14;g.lineWidth=(3+3*u)*s;g.globalAlpha=.8*(1-u*.4);g.beginPath();g.arc(mcx,mcy,hh*(.6+u*.9),0,6.2832);g.stroke();g.restore()}
}

/* ---------- Chảy máu ---------- */
function bleed(e,t,m){if(!e||e.hp<=0)return;const b=(EP.bn||(EP.bn=[])).find(q=>q.e===e);if(b){b.t=Math.max(b.t,t);b.m=Math.max(b.m,m)}else EP.bn.push({e,t,m})}
function bleedHit(e,m){let d=Math.max(1,Math.round(atk()*m*(.9+R()*.2)*100/(100+(e.df||0))));d=Math.max(1,Math.round(dotCrit(d)));e.hp-=d;e.fl=4;DT.push({x:e.x,y:(e.hh||100)*SZ,s:d,c:dotCl('#ff6a7a',dotCrit.k),sc:dotSc('#ff6a7a'),l:38,k:dotCrit.k})}
function strike(e,M,p,big){
 if(!e||!E.includes(e))return;const ev=p.ev,H=window.PFH||{};dm(e,M);
 try{H.fx({t:'claw',x:e.x,c:'#bfe6ff',l:16});H.fx({t:'claw',x:e.x+8,c:'#ffffff',l:14})}catch(x){}
 for(let i=0;i<(big?10:5);i++)mote(e.x+(R()-.5)*34,20+R()*40,(R()-.5)*2.2,.5+R()*1.1,30,i%2?'#ffffff':'#bfe6ff',(2+R()*2.4)*s);
 if(ev>=1)bleed(e,150+ev*30,M*.2);
}

/* ---------- Bước điều khiển (thay epstep cho Bạch Hổ) ---------- */
function step(p,T,K,M,e){
 const ev=p.ev;
 if(EP.fp===undefined||EP.fa===undefined||EP.gl===undefined)Object.assign(EP,{fp:0,fa:.6,gl:0,ly:EP.y||0,mt:0,na:0,si:0,bn:[],rb:EP.rb||0,q:[],sw:.4,skn:0,evo:0});
 if(EP.rb>0)EP.rb--;
 for(let i=EP.q.length-1;i>=0;i--){const q=EP.q[i];if(--q.t<=0){EP.q.splice(i,1);try{q.f()}catch(x){}}}
 for(let i=EP.bn.length-1;i>=0;i--){const b=EP.bn[i];if(b.e.hp<=0||!E.includes(b.e)||--b.t<=0){EP.bn.splice(i,1);continue}
  if(b.t%22==0)bleedHit(b.e,b.m)}
 const base=ev>=3?16+Math.sin(EP.t*.05)*4:0;
 EP.ly=EP.y;
 /* ---- đang tấn công ---- */
 if(EP.at>0){
  const u=1-EP.at/EP.atT,tg=EP.tg;if(tg&&E.includes(tg))EP.tgx=tg.x;
  const side=EP.ox<EP.tgx?-1:1,dir=-side;
  if(Math.abs(EP.tgx-EP.ox)>1)EP.d=Math.sign(EP.tgx-EP.ox);
  if(EP.mt==1){        /* vồ nhảy */
   EP.x=EP.ox+(EP.tgx+side*30-EP.ox)*sst(0,.72,u);EP.y=base+(u<.75?Math.sin(u/.75*PI)*50:0);
   if(u>=.72&&!EP.hit){EP.hit=1;if(tg&&E.includes(tg)){strike(tg,M*1.6,p,1);bleed(tg,200+ev*30,M*.24);try{const H=window.PFH;H.gwave(tg.x,'#bfe6ff',70+ev*10,18);H.shake(3)}catch(x){}}}
  }else if(EP.mt==2){  /* gầm / kỹ năng */
   EP.y=base;if(u>=.45&&!EP.hit){EP.hit=1;try{ZS.pf.skill(0,ev,EP.x,M,p,EP.skn)}catch(x){}}
  }else{               /* vồ cào */
   const w=Math.sin(Math.min(1,u)*PI),n=1+(ev>=1?1:0)+(ev>=2?1:0),th=[.35,.55,.75];
   EP.x=EP.ox+dir*(w*20);EP.y=base;
   while(EP.hit<n&&u>=th[EP.hit]){const k=EP.hit++;if(tg&&E.includes(tg))strike(tg,M*(k?.65:1.1),p,0)}
  }
  EP.fp+=.1;EP.at--;if(EP.at<=0){EP.vx=0}
  return;
 }
 /* ---- chạy theo chủ / lao vào địch ---- */
 let tx=Math.max(40,P.x-(60+ev*6)*P.d+Math.sin(EP.t*.017)*(38+ev*8)),run=1;
 if(e){const s2=EP.x<e.x?-1:1;tx=cl(e.x+s2*K.sd,Math.max(40,P.x-300),P.x+300)}
 const FLY_=window.PFLY&&PFLY.on();if(FLY_){tx=PFLY.tx(tx,e,0);run=PFLY.run(run)}else if(Math.abs(EP.x-P.x)>480){EP.x=P.x-60*P.d;EP.vx=0}
 const dx=tx-EP.x,far=!FLY_&&Math.abs(EP.x-P.x)>220;if(far)run=1.9;
 const des=Math.max(-K.sp*run,Math.min(K.sp*run,dx*.08*run));
 EP.vx+=(des-EP.vx)*.14;if(Math.abs(dx)<4&&Math.abs(EP.vx)<.3)EP.vx*=.5;EP.x+=EP.vx;
 if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);else if(e)EP.d=Math.sign(e.x-EP.x)||EP.d;else EP.d=P.d;
 const mvf=Math.min(1,Math.abs(EP.vx)/3);EP.ph+=mvf*.3+.05;
 EP.y+=(base-EP.y)*.12;
 EP.fp+=ev>=3?.14+mvf*.1:0;EP.fa+=(.5-EP.fa)*.08;
 /* ---- quyết định tấn công ---- */
 if(e&&EP.cd<=0){
  const dist=Math.abs(e.x-EP.x),spec=EP.sk<=0&&dist<260;let mt=-1;
  if(spec)mt=2;else if(ev>=1&&dist>=78&&dist<210&&(EP.na%3==2||R()<.22))mt=1;else if(dist<76)mt=0;
  if(mt<0)return;
  EP.na++;EP.ox=EP.x;EP.tg=e;EP.tgx=e.x;EP.hit=0;EP.kind=spec?1:0;EP.mt=mt;
  if(spec){const lst=[0,1,2,3].slice(0,ev+1);let sn=lst[EP.si++%lst.length];if(sn==2&&P.hp>mx()*.9&&lst.length>1)sn=lst[EP.si++%lst.length];EP.skn=sn;EP.sk=Math.round(PSK[0].cd*(1-.06*ev))}
  EP.atT=mt==1?40:mt==2?44:24;EP.at=EP.atT;EP.cd=Math.max(22,T.cd-ev*4);
 }
}

/* ---------- Hồi sinh (Tối Thượng Thần Thú) ---------- */
function rebirth(){
 const p=pet();if(!p||p.k!=0||p.ev<3||(EP.rb|0)>0)return false;
 EP.rb=5400;P.hp=Math.max(1,Math.round(mx()*.45));
 DT.push({x:P.x,y:150,s:'🐯 Thần Hổ Thủ Hộ!',c:'#ffe9a0',g:1,l:130});
 try{ZS.pf.skill(0,3,P.x,pm(p),p,4)}catch(x){}
 return true;
}

/* ---------- Giao diện ---------- */
const img=ev=>U[ev];
function skillsHtml(p){
 return '<br>🌟 <b>Kỹ năng Bạch Hổ</b>'+SKL.map(k=>{const on=p.ev>=k.ev;return `<br><small style="opacity:${on?1:.45};color:${on?'#d8f0ff':'#aaa'}">${on?'❄️':'🔒'} <b>${k.n}</b>${on?'':' (Tiến hóa '+(k.ev+1)+')'}: ${k.d}</small>`}).join('')+(p.ev>=3?`<br><small>Thủ Hộ: ${(EP.rb|0)>0?'hồi chiêu '+Math.ceil(EP.rb/60)+'s':'<b style="color:#7fe08a">sẵn sàng</b>'}</small>`:'');
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

/* ---------- Kỹ năng (gọi từ ZS.pf.skill, k==0) ---------- */
function skill(ev,x,M,p,sn){
 const H=window.PFH;if(!H)return;const {later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal,rune}=H;
 const c1='#bfe6ff',c2='#ffffff',c3='#ffe9a0',r=190+ev*30,mm=M*PSK[0].m;
 const tgs=()=>E.filter(e=>e.in<=0&&Math.abs(e.x-x)<r+120).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));
 if(sn==0){            /* Hổ Khiếu: sóng âm */
  gwave(x,c1,r+60,30);later(4,()=>gwave(x,c2,r,26));later(9,()=>gwave(x,c1,r-40,22));rg(x,r,c1,22);vcol(x,'rgba(190,230,255,.85)',50,26);flare(x,60,c2,120+ev*10,20);bst(x,50,30,c2,8,22,5,{g:.06});flash(c2,6);shake(6);
  tgs().forEach((e,i)=>later(6+i*2,()=>{dm(e,mm*1.25);dm(e,mm*.6);if(ev>=1)bleed(e,150,M*.18);fx({t:'claw',x:e.x,c:c1,l:16});bst(e.x,52,12,c2,6,16,3,{k:'s'})}));
 }else if(sn==1){      /* Kim Phong Bạo: loạt vuốt */
  const tg=tgs().slice(0,3+ev);gwave(x,c1,170,26);flash(c1,5);shake(5);vcol(x,'rgba(220,240,255,.8)',56,30);
  tg.forEach((e,i)=>{for(let k=0;k<3;k++)later(8+i*4+k*4,()=>{if(e.hp>0&&E.includes(e)){dm(e,mm*.7);bleed(e,200,M*.22);fx({t:'claw',x:e.x+(k-1)*10,c:k%2?c2:c1,l:16});bst(e.x,52,8,c2,5,14,3,{k:'s'})}})});
  for(let i=0;i<18;i++)later(i%12,()=>fp(x+(R()*2-1)*r,8+R()*34,{c:i%2?c1:c2,r:7+R()*7,l:60,vy:.4+R()*.8,vx:(R()-.5)*1.6,f:1,sh:1}));
 }else if(sn==2||sn==4){   /* Long Hổ Hộ Thể: hồi máu + sóng băng */
  const big=sn==4,h=Math.round(mx()*((big?.2:.06)+.02*ev)*pv(p));P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:130,s:'+'+h,g:1,l:55});
  heal(P.x,c1);fx({t:'dome',r:big?110:90,c:c1,l:90});gwave(P.x,c1,big?300:220,30);later(6,()=>gwave(P.x,c3,big?240:170,26));vcol(P.x,'rgba(200,235,255,.85)',58,34);flare(P.x,60,c2,big?170:130,22);flash(c1,big?14:8);shake(big?8:4);
  E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<(big?340:230)){dm(e,mm*(big?2:1.4));bleed(e,180,M*.2);fx({t:'claw',x:e.x,c:c1,l:16})}});
 }else{                /* Thiên Cương Bạch Hổ Trảm */
  rune(P.x,200,c3,70);flash(c3,40);shake(10);gwave(P.x,c1,520,40);later(5,()=>gwave(P.x,c2,420,34));
  E.forEach((e,i)=>{if(e.in>0)return;later(10+i*3,()=>{fx({t:'pillar',x:e.x,w:80,c:c1,l:28});for(let k=0;k<3;k++)later(k*4,()=>{if(e.hp>0&&E.includes(e)){dm(e,mm*(k?.8:2.2));fx({t:'claw',x:e.x+(k-1)*12,c:k%2?c3:c1,l:16})}});bleed(e,260,M*.28);bst(e.x,50,22,c1,8,24,5,{g:.1});rg(e.x,120,c3,20)})});
 }
}
return{draw,step,skill,rebirth,bleed,img,col:ev=>COL[ev],gold:gold_,pay,skillsHtml,can,evoHtml,U}
})();

/* ---- Thay dữ liệu thú số 0 (Hổ) bằng Bạch Hổ, không sửa mảng gốc trong engine ---- */
try{
 Object.assign(PT4[0],{n:['Bạch Hổ Sơ Sinh','Bạch Hổ Chiến Binh','Cổ Đại Bạch Hổ Đại Sư','Tối Thượng Bạch Hổ Thần Thú'],e:'🐯',m:.5,cd:38,rg:110,d:'Thần thú cận chiến chạy nhanh, vồ cào gây chảy máu · +% sát thương · mỗi lần tiến hóa thêm kỹ năng'});
 Object.assign(PK[0],{sp:6.4,sd:46,al:0,at:24,h:50,bc:'#bfe6ff'});
 Object.assign(PSK[0],{n:'Hổ Khiếu Bạch Hổ',d:'kỹ năng riêng mở thêm mỗi lần tiến hóa',cd:340,m:1.2});
 PTU[0]=PTG.U[0];PTI[0]=(()=>{const i=new Image();i.src=PTG.U[0];return i})();
}catch(e){console.error('[Bạch Hổ] không thể áp dữ liệu thú',e)}
