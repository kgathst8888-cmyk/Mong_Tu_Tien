
/* ===================================================================
   KHAI KHOÁNG: Mỏ Vàng · Quặng Sắt · Huyền Kim
   - Ngọn núi ở bản đồ tân thủ (Thanh Vân Sơn Môn): chạm vào để vào hầm mỏ
   - Trong hầm: chạm mạch khoáng để đi tới và đào (vàng cộng thẳng vào 💰)
   - Quặng Sắt, Huyền Kim: chỉ lưu kho, công dụng sẽ cập nhật sau
   - Từ cảnh giới Nguyên Anh: Nguyên Anh tự động thu thập 1 trong 3 loại (kể cả khi thoát game)
   Chỉnh cân bằng ở khối CFG / VN bên dưới.
   =================================================================== */
const MN=(()=>{
const FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',PI=Math.PI,ORD=['au','fe','hk'];
const CFG={
 capMs:8*3600e3,                 /* tối đa 8 giờ thu thập khi vắng mặt */
 goldMul:12,                     /* nhân lượng vàng mỗi nhát cuốc */
 rate:{au:300,fe:2,hk:.5},         /* tốc độ tự động mỗi phút, nhân (cảnh giới − Nguyên Anh + 1) */
 swing:36                         /* số khung hình mỗi nhát cuốc */
};
const VN={
 au:{n:'Mỏ Vàng',   e:'🪙',c:'#ffd24a',hits:8, resp:45e3},
 fe:{n:'Quặng Sắt', e:'🔩',c:'#cfc4b8',hits:8, resp:60e3},
 hk:{n:'Huyền Kim', e:'🌑',c:'#a58bff',hits:12,resp:120e3}
};
const fresh=()=>({fe:0,hk:0,gm:0,auto:null,last:Date.now(),acc:{au:0,fe:0,hk:0},at:{au:0,fe:0,hk:0}});
let broken=false;
let S=fresh(),on=false,NT={s:'',c:'#ffe9a0',t:0},pend=null,back=0,mine=null,chips=[];
const dur={au:VN.au.hits,fe:VN.fe.hits,hk:VN.hk.hits},until={au:0,fe:0,hk:0},PR=[],PU=[];
const tier=()=>{try{return ZC.rI()+1}catch(e){return 0}};
const canAuto=()=>{try{return ZC.rI()>=3}catch(e){return false}};
const rk=()=>Math.max(1,ZC.rI()-2);
const note=(m,c)=>{NT={s:String(m).replace(/<[^>]+>/g,''),c:c||'#ffe9a0',t:170}};
const rt=x=>x<10?String(+x.toFixed(1)).replace('.',','):fmtN(x);
const give=(k,n)=>{if(k=='au'){gold+=n;S.gm+=n}else S[k]+=n};

/* ---------- Nguyên Anh tự động thu thập ---------- */
function tick(){
 const now=Date.now();
 if(!S.auto||!canAuto()){S.last=now;return}
 const raw=now-S.last;if(raw<1000)return;
 const dt=Math.min(raw,CFG.capMs);S.last=now;
 const k=S.auto;S.acc[k]+=CFG.rate[k]*rk()*dt/60000;
 const n=Math.floor(S.acc[k]);
 if(n>=1){S.acc[k]-=n;give(k,n);S.at[k]+=n;
  if(raw>180000){const m='🧿 Nguyên Anh đã thu thập '+fmtN(n)+' '+VN[k].n+' khi bạn vắng mặt';note(m,VN[k].c);if(!on)try{DT.push({x:P.x,y:190,s:m,c:VN[k].c,g:1,l:220})}catch(e){}}}
}
function setAuto(k){
 if(!canAuto()){msg='Cần đạt cảnh giới Nguyên Anh để mở thu thập tự động';ui();return}
 tick();S.auto=(k&&VN[k]&&S.auto!=k)?k:null;S.last=Date.now();
 const m=S.auto?'🧿 Nguyên Anh bắt đầu thu thập '+VN[S.auto].n:'🧿 Nguyên Anh dừng thu thập';
 msg=m;note(m,S.auto?VN[S.auto].c:'#ccc');try{sv()}catch(e){}ui();
}

/* ---------- Hình học ---------- */
const VX=i=>vw()*[.3,.5,.7][i];
const RV=()=>Math.max(40*s,Math.min(vw()*.1,72)*s);
const rx=()=>Math.max(56,vw()*.07);
const sm=x=>x*x*(3-2*x);
const chipBox=i=>{const n=4;
 if(PORT){const cw=Math.min(50*s,52),ch=cw*1.05;return{x:8+i*cw,y:GY+(H-GY)*.42,w:cw,h:ch}}
 const cw=Math.min(58*s,(W-16)/n),ch=Math.min(46*s,60);return{x:(W-cw*n)/2+i*cw,y:H-ch-6*s,w:cw,h:ch}};
const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const dot=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,6.28);g.fill()};
const glw=(x,y,r,a,c)=>{const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,c.replace('A',a));q.addColorStop(1,c.replace('A',0));g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.28);g.fill();g.restore()};
const txt=(m,x,y,px,fill,bold)=>{g.font=(bold?'bold ':'')+Math.round(px)+'px '+FONT;g.textAlign='center';g.lineWidth=Math.max(3,px*.28);g.strokeStyle='#000c';g.strokeText(m,x,y);g.fillStyle=fill;g.fillText(m,x,y)};
const pill=(m,x,y,px,bg,fg)=>{g.font='bold '+Math.round(px)+'px '+FONT;const tw=g.measureText(m).width+px*.9;g.fillStyle=bg;rr(x-tw/2,y-px*.95,tw,px*1.35,px*.6);g.fill();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1;g.stroke();g.fillStyle=fg;g.textAlign='center';g.fillText(m,x,y)};
const ft=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};

/* ---------- Núi + cửa hầm ở bản đồ tân thủ ---------- */
function mtGeo(gy){const bw=Math.min(310*s,W*(PORT?.62:.46)),hm=bw*.58,cx=W*(PORT?.42:.34);return{bw,hm,cx,ax:cx+bw*.1}}
function mtHit(px,py,gy){const o=mtGeo(gy);if(py>gy+8*s||py<gy-o.hm)return false;return Math.abs(px-o.cx)<(1-(gy-py)/o.hm)*o.bw/2+14*s}
function mtDraw(gy){
 const o=mtGeo(gy),t=fr,u=s,{bw,hm,cx,ax}=o,p=XP[0];
 const PT=[[-1,0],[-.88,.2],[-.66,.46],[-.46,.6],[-.26,.86],[-.08,1],[.14,.88],[.36,.62],[.58,.44],[.8,.2],[1,0]];
 g.save();
 g.beginPath();g.moveTo(cx-bw/2,gy+4*u);PT.forEach(a=>g.lineTo(cx+a[0]*bw/2,gy-a[1]*hm));g.lineTo(cx+bw/2,gy+4*u);g.closePath();
 g.fillStyle='#4a2a36';g.fill();
 let q=g.createLinearGradient(0,gy-hm,0,gy);q.addColorStop(0,'rgba(255,170,130,.32)');q.addColorStop(.5,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(10,0,10,.5)');g.fillStyle=q;g.fill();
 g.clip();
 /* sườn tối bên phải + nứt đá */
 g.fillStyle='rgba(20,5,25,.3)';g.beginPath();g.moveTo(cx-bw*.08,gy-hm);g.lineTo(cx+bw/2,gy);g.lineTo(cx+bw*.1,gy);g.closePath();g.fill();
 g.strokeStyle='rgba(20,5,25,.4)';g.lineWidth=Math.max(1,1.4*u);
 [[-.3,.7,-.45,.3],[.1,.8,.22,.35],[-.1,.5,-.18,.15],[.4,.45,.5,.12]].forEach(a=>{g.beginPath();g.moveTo(cx+a[0]*bw/2,gy-a[1]*hm);g.lineTo(cx+(a[0]+a[2])/2*bw/2+4*u,gy-(a[1]+a[3])/2*hm);g.lineTo(cx+a[2]*bw/2,gy-a[3]*hm);g.stroke()});
 g.restore();
 g.strokeStyle='rgba(255,170,120,.45)';g.lineWidth=Math.max(1.2,1.6*u);g.beginPath();PT.slice(0,6).forEach((a,i)=>i?g.lineTo(cx+a[0]*bw/2,gy-a[1]*hm):g.moveTo(cx+a[0]*bw/2,gy-a[1]*hm));g.stroke();
 /* cửa hầm */
 const aw=Math.max(34*u,bw*.13),ah=aw*1.25;
 glw(ax,gy-ah*.4,aw*2.4,.18+.1*Math.sin(t*.07),'rgba(255,190,90,A)');
 g.fillStyle='#07040a';g.beginPath();g.moveTo(ax-aw/2,gy+2*u);g.lineTo(ax-aw/2,gy-ah*.62);g.quadraticCurveTo(ax,gy-ah*1.12,ax+aw/2,gy-ah*.62);g.lineTo(ax+aw/2,gy+2*u);g.closePath();g.fill();
 q=g.createRadialGradient(ax,gy-ah*.2,2,ax,gy-ah*.2,aw*.7);q.addColorStop(0,'rgba(255,170,70,.55)');q.addColorStop(1,'rgba(255,170,70,0)');g.fillStyle=q;g.fill();
 g.fillStyle='#7a4a22';g.fillRect(ax-aw/2-5*u,gy-ah*.66,5*u,ah*.7);g.fillRect(ax+aw/2,gy-ah*.66,5*u,ah*.7);g.fillRect(ax-aw/2-8*u,gy-ah*.7,aw+16*u,6*u);
 g.fillStyle='#a8743a';g.fillRect(ax-aw/2-8*u,gy-ah*.7,aw+16*u,2*u);
 /* ray + xe goòng */
 g.strokeStyle='#5a5048';g.lineWidth=Math.max(1.5,2*u);[-.28,.28].forEach(d=>{g.beginPath();g.moveTo(ax+d*aw,gy-1*u);g.lineTo(ax+d*aw*2.4,gy+16*u);g.stroke()});
 g.fillStyle='#4a3a2a';for(let i=0;i<4;i++){const y=gy+3*u+i*4*u;g.fillRect(ax-aw*(.4+i*.3),y,aw*(.8+i*.6),1.6*u)}
 const cx2=ax+aw*1.1,cy2=gy+9*u;g.fillStyle='#5a4a3a';g.beginPath();g.moveTo(cx2-12*u,cy2-9*u);g.lineTo(cx2+12*u,cy2-9*u);g.lineTo(cx2+9*u,cy2+3*u);g.lineTo(cx2-9*u,cy2+3*u);g.closePath();g.fill();g.strokeStyle='#2a2018';g.lineWidth=1;g.stroke();
 g.fillStyle='#ffd24a';dot(cx2-5*u,cy2-10*u,3*u);dot(cx2+1*u,cy2-11*u,3.4*u);g.fillStyle='#cfc4b8';dot(cx2+6*u,cy2-10*u,2.8*u);g.fillStyle='#111';dot(cx2-6*u,cy2+4*u,2.4*u);dot(cx2+6*u,cy2+4*u,2.4*u);
 /* biển hiệu + gợi ý */
 const sy=gy-ah*1.22,bob=Math.sin(t*.1)*2*u;
 g.strokeStyle='#3a2a18';g.lineWidth=Math.max(1,1.4*u);g.beginPath();g.moveTo(ax-26*u,sy-2*u);g.lineTo(ax-18*u,sy-12*u);g.moveTo(ax+26*u,sy-2*u);g.lineTo(ax+18*u,sy-12*u);g.stroke();
 pill('⛏ Mỏ Khoáng',ax,sy+8*u,Math.max(11,13*u),'rgba(70,42,18,.92)','#ffe9a0');
 txt('▼ chạm để vào',ax,sy-16*u+bob,Math.max(9,10*u),'#fff2c0',1);
 /* khoáng lấp lánh */
 [[-.3,.5,'#ffd24a'],[.05,.78,'#cfc4b8'],[.38,.42,'#a58bff'],[-.5,.22,'#ffd24a'],[.62,.2,'#a58bff']].forEach((a,i)=>{const ph=(Math.sin(t*.06+i*1.9)+1)/2;g.save();g.globalAlpha=.3+.7*ph;g.fillStyle=a[2];const x=cx+a[0]*bw/2,y=gy-a[1]*hm,r=(1.5+2*ph)*u;g.beginPath();g.moveTo(x,y-r*2);g.lineTo(x+r*.6,y);g.lineTo(x,y+r*2);g.lineTo(x-r*.6,y);g.closePath();g.fill();g.beginPath();g.moveTo(x-r*2,y);g.lineTo(x,y+r*.6);g.lineTo(x+r*2,y);g.lineTo(x,y-r*.6);g.closePath();g.fill();g.restore()});
}

/* Nếu phần vẽ hầm mỏ gặp lỗi: tự thoát ra bản đồ và tắt tính năng, game không bị đen màn hình */
function fail(e){
 broken=true;on=false;mine=null;pend=null;back=0;try{vil=false}catch(x){}
 try{console.error('[Khai khoáng]',e)}catch(x){}
 try{window.__showErr&&window.__showErr('Khai khoáng: '+(e&&e.message||e))}catch(x){}
}

/* ---------- Vào / ra hầm mỏ ---------- */
function enter(){
 if(!started||vil||dg||lg||over)return;
 on=true;vil=true;P.hp=mx();P.mp=mm();P.atk=0;P.pe=null;vt=null;vgo=-1;pend=null;back=0;mine=null;cam=0;
 P.x=cl(rx()+80,40,vw()-40);try{if(bo)tg()}catch(e){}
 note('⛏ Vào hầm mỏ · chạm mạch khoáng để đào','#ffe9a0');
}
function go(){
 if(!started)return;
 if(dg||over){try{DT.push({x:P.x,y:200,s:'Hãy thoát Hầm Ngục / chờ hồi sinh rồi vào mỏ',c:'#ffd0a0',g:1,l:130})}catch(e){}return}
 try{if(bo)tg()}catch(e){}
 if(on)return;
 try{if(lg||vil||mi()!==0)gm(0)}catch(e){}
 setTimeout(()=>{try{enter()}catch(e){fail(e)}},0)
}
function leave(){
 on=false;vil=false;vt=null;vgo=-1;pend=null;back=0;mine=null;
 try{P.x=cl(mtGeo(GY).ax/s,40,vw()-40)}catch(e){P.x=120}
 try{DT.push({x:P.x,y:190,s:'Trở ra '+MP[0].n,g:1,l:90})}catch(e){}
}

/* ---------- Đào ---------- */
function burst(x,y,k,n){const c={au:['#ffd24a','#fff0a0','#b8860b'],fe:['#cfc4b8','#a0502a','#6a6258'],hk:['#a58bff','#4a2a9a','#e0d8ff']}[k];for(let i=0;i<n;i++)PR.push({x,y,vx:(R()-.5)*5*s,vy:-(1.5+R()*4)*s,l:30+R()*20,c:c[i%3],z:(1.5+R()*2.5)*s})}
function popup(m,x,y,c){PU.push({m,x,y,l:70,c})}
function hit(k){
 const i=ORD.indexOf(k),X=VX(i)*s,Y=GY-RV()*.7,t=tier();let m='';
 burst(X,Y,k,10);
 if(k=='au'){const n=Math.round((6+R()*5)*CFG.goldMul*(1+.5*t)*(1+Math.min(P.lv,100)/40));give('au',n);m='+'+n+' 🪙'}
 else if(k=='fe'){const n=1+(R()<.4?1:0)+(t>=3?1:0);S.fe+=n;m='+'+n+' 🔩'}
 else{if(R()<.45){const n=1+(R()<.2?1:0);S.hk+=n;m='+'+n+' 🌑'}}
 if(m)popup(m,X+(R()-.5)*30*s,Y-RV()*.6,VN[k].c);
 if(--dur[k]<=0){dur[k]=VN[k].hits;/* khai thác vô hạn: hết chu kỳ thì thưởng thêm, mạch không cạn */
  if(k=='hk'){S.hk+=2;popup('+2 🌑 (thưởng chu kỳ)',X,Y-RV()*.9,VN[k].c)}
  burst(X,Y,k,22)}
}
function startMine(i){
 const k=ORD[i];
 if(dur[k]<=0)dur[k]=VN[k].hits;
 mine={k,t:0,i};
}

/* ---------- Vẽ hầm mỏ ---------- */
function veinDraw(i,now){
 const k=ORD[i],X=VX(i)*s,r=RV(),Y=GY-r*.15,seed=i*3.1,d=dur[k],t=fr;
 const act=mine&&mine.k==k,ph=act?mine.t%CFG.swing:0,fl=act&&ph>=18&&ph<24,sx=fl?(R()-.5)*3*s:0;
 g.save();g.translate(sx,0);
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,GY+2*s,r*1.1,r*.2,0,0,6.28);g.fill();
 const live=d>0;
 const rad=live?r:r*.55;
 if(live)glw(X,Y-r*.5,r*1.7,.18+.1*Math.sin(t*.06+i),'rgba('+{au:'255,200,60',fe:'220,150,100',hk:'150,110,255'}[k]+',A)');
 g.beginPath();for(let j=0;j<=12;j++){const a=PI+j*PI/12,q=1+.12*Math.sin(j*2.7+seed),w=.92+.14*Math.sin(j*1.9+seed);g.lineTo(X+Math.cos(a)*rad*1.05*q,Y+Math.sin(a)*rad*w)}g.lineTo(X+rad*1.05,Y+r*.15);g.lineTo(X-rad*1.05,Y+r*.15);g.closePath();
 let q=g.createRadialGradient(X-rad*.3,Y-rad*.7,2,X,Y-rad*.3,rad*1.3);q.addColorStop(0,'#8a7b6c');q.addColorStop(1,'#2e2620');g.fillStyle=q;g.fill();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=Math.max(1.5,2*s);g.stroke();
 if(live){
  const pts=[[-.55,-.35,.2],[-.15,-.7,.26],[.3,-.5,.22],[.55,-.2,.16],[-.35,-.1,.15],[.08,-.25,.18]];
  pts.forEach((a,j)=>{const x=X+a[0]*r,y=Y+a[1]*r,z=a[2]*r*(1+.06*Math.sin(t*.07+j));
   if(k=='au'){const gr=g.createRadialGradient(x-z*.3,y-z*.3,1,x,y,z);gr.addColorStop(0,'#fff6b0');gr.addColorStop(.5,'#ffcf3a');gr.addColorStop(1,'#a8740a');g.fillStyle=gr;g.beginPath();for(let m=0;m<7;m++){const aa=m*PI*2/7,rr2=z*(.8+.25*Math.sin(m*2.3+j));g.lineTo(x+Math.cos(aa)*rr2,y+Math.sin(aa)*rr2*.8)}g.closePath();g.fill();g.strokeStyle='rgba(90,50,0,.5)';g.lineWidth=1;g.stroke()}
   else if(k=='fe'){g.fillStyle=j%2?'#b9b2aa':'#8e8780';g.beginPath();g.moveTo(x-z,y+z*.4);g.lineTo(x-z*.4,y-z);g.lineTo(x+z*.8,y-z*.5);g.lineTo(x+z,y+z*.5);g.closePath();g.fill();g.fillStyle='rgba(170,80,40,.7)';g.beginPath();g.moveTo(x-z*.5,y+z*.2);g.lineTo(x-z*.1,y-z*.6);g.lineTo(x+z*.3,y+z*.1);g.closePath();g.fill();g.strokeStyle='rgba(30,20,15,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x-z,y+z*.4);g.lineTo(x-z*.4,y-z);g.lineTo(x+z*.8,y-z*.5);g.lineTo(x+z,y+z*.5);g.closePath();g.stroke()}
   else{const gr=g.createLinearGradient(x,y-z*1.3,x,y+z);gr.addColorStop(0,'#c0b0ff');gr.addColorStop(.45,'#4a2a9a');gr.addColorStop(1,'#140a2a');g.fillStyle=gr;g.beginPath();g.moveTo(x,y-z*1.5);g.lineTo(x+z*.6,y-z*.2);g.lineTo(x+z*.35,y+z*.7);g.lineTo(x-z*.35,y+z*.7);g.lineTo(x-z*.6,y-z*.2);g.closePath();g.fill();g.strokeStyle='rgba(180,220,255,.8)';g.lineWidth=1.2;g.stroke();g.beginPath();g.moveTo(x-z*.15,y-z*1);g.lineTo(x-z*.12,y+z*.3);g.strokeStyle='rgba(255,255,255,.5)';g.stroke()}
  });
  /* lấp lánh */
  const ph2=(Math.sin(t*.08+i*2)+1)/2,c=VN[k].c;g.save();g.globalAlpha=.4+.6*ph2;g.fillStyle=c;const sx2=X+Math.cos(t*.03+i)*r*.5,sy2=Y-r*.5+Math.sin(t*.04+i)*r*.3,zz=(2+3*ph2)*s;g.beginPath();g.moveTo(sx2,sy2-zz);g.lineTo(sx2+zz*.3,sy2);g.lineTo(sx2,sy2+zz);g.lineTo(sx2-zz*.3,sy2);g.closePath();g.fill();g.restore();
  if(fl){g.fillStyle='rgba(255,255,255,.35)';g.fill()}
 }else{g.fillStyle='#5a5048';[[-.5,.0,.18],[-.1,-.2,.22],[.35,.0,.16],[.1,.05,.12]].forEach(a=>{g.beginPath();g.ellipse(X+a[0]*r,Y+a[1]*r,a[2]*r*1.2,a[2]*r*.8,0,0,6.28);g.fill()})}
 g.restore();
 /* nhãn + độ bền */
 if(live){const n=VN[k].hits,pw=Math.min(9*s,r*1.6/n),w0=pw*n;for(let j=0;j<n;j++){g.fillStyle=j<d?VN[k].c:'rgba(0,0,0,.55)';g.fillRect(X-w0/2+j*pw+1,Y-r*1.12,pw-2,4*s)}
  txt(VN[k].e+' '+VN[k].n,X,Y-r*1.22,Math.max(10,12*s),VN[k].c,1)}
 else{const rem=until[k]-now;if(rem<=0)dur[k]=VN[k].hits;else pill('⏳ '+ft(rem),X,Y-r*.7,Math.max(10,12*s),'rgba(10,30,50,.7)','#bff4ff')}
}
function cave(gy){
 const t=fr,u=s;
 let q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,'#0d0a08');q.addColorStop(.55,'#241a12');q.addColorStop(1,'#3a2a1c');g.fillStyle=q;g.fillRect(0,0,W,H);
 /* vách đá nhiều lớp */
 for(let l=0;l<3;l++){g.fillStyle=['rgba(70,52,38,.55)','rgba(52,38,28,.6)','rgba(38,28,20,.7)'][l];g.beginPath();g.moveTo(0,gy);for(let x=0;x<=W+10;x+=10)g.lineTo(x,gy-(90+l*34+30*Math.sin(x*.012+l*2)+18*Math.sin(x*.031+l))*u);g.lineTo(W,gy);g.fill()}
 g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(let i=0;i<14;i++){const x=(i*173)%W,y=(i*59)%(gy*.8);g.beginPath();g.moveTo(x,y);g.lineTo(x+18*u,y+30*u);g.lineTo(x+8*u,y+62*u);g.stroke()}
 /* nhũ đá */
 g.fillStyle='#17110c';for(let x=-10;x<W+20;x+=34*u){const h=(26+((x/u*7)%40))*u;g.beginPath();g.moveTo(x,0);g.lineTo(x+30*u,0);g.lineTo(x+15*u,h);g.closePath();g.fill()}
 /* xà gỗ + đèn lồng */
 [.22,.5,.78].forEach((a,i)=>{const x=vw()*a*u;g.fillStyle='#4a3018';g.fillRect(x-4*u,gy-190*u,8*u,190*u);g.fillRect(x-60*u,gy-196*u,120*u,8*u);g.fillStyle='#6a4a28';g.fillRect(x-60*u,gy-196*u,120*u,2.5*u);
  const ly=gy-150*u,fl=.8+.2*Math.sin(t*.12+i*3);glw(x,ly,95*u,.4*fl,'rgba(255,170,70,A)');g.fillStyle='#c0501c';g.beginPath();g.ellipse(x,ly,8*u,10*u,0,0,6.28);g.fill();g.fillStyle='#ffd280';g.beginPath();g.ellipse(x,ly,4*u,6*u,0,0,6.28);g.fill();g.strokeStyle='#2a1a0a';g.lineWidth=1.4;g.beginPath();g.moveTo(x,gy-194*u);g.lineTo(x,ly-10*u);g.stroke()});
 /* nền hầm + ray */
 q=g.createLinearGradient(0,gy,0,H);q.addColorStop(0,'#4a3a2a');q.addColorStop(1,'#16100a');g.fillStyle=q;g.fillRect(0,gy,W,H-gy);
 g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,gy,W,3*u);
 g.strokeStyle='#6a6058';g.lineWidth=Math.max(1.5,2.2*u);const ry=gy+(H-gy)*.2;g.beginPath();g.moveTo(0,ry);g.lineTo(W,ry);g.moveTo(0,ry+7*u);g.lineTo(W,ry+7*u);g.stroke();
 g.fillStyle='#3a2a1a';for(let x=0;x<W;x+=26*u)g.fillRect(x,ry-2*u,7*u,12*u);
 /* bụi lơ lửng */
 for(let i=0;i<24;i++){const x=(i*113+t*.15*(1+i%3))%W,y=(i*47+Math.sin(t*.02+i)*20)%gy;g.fillStyle='rgba(255,220,160,'+(.12+.1*Math.sin(t*.05+i))+')';dot(x,y,(1+i%3*.6)*u)}
 q=g.createRadialGradient(W/2,H*.5,Math.min(W,H)*.3,W/2,H*.5,Math.max(W,H)*.75);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=q;g.fillRect(0,0,W,H);
}
function pick(){
 if(!mine)return;
 const px=P.x*s,py=GY-44*s,ph=(mine.t%CFG.swing)/CFG.swing,dir=VX(mine.i)>=P.x?1:-1;
 const a=-2.2+2.5*sm(Math.min(1,ph*1.5));
 g.save();g.translate(px+dir*12*s,py);g.scale(dir,1);g.rotate(a);
 g.strokeStyle='#7a5228';g.lineWidth=Math.max(3,4*s);g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(34*s,0);g.stroke();
 g.strokeStyle='#cfd6dc';g.lineWidth=Math.max(3,4.5*s);g.beginPath();g.arc(34*s,0,12*s,-1.15,1.15);g.stroke();g.strokeStyle='#fff';g.lineWidth=1;g.stroke();
 g.restore();
}
function ny(){
 if(!S.auto||!canAuto()||!NYI.naturalWidth)return;
 const i=ORD.indexOf(S.auto),X=VX(i)*s+RV()*1.05,Y=GY-RV()*1.2+Math.sin(fr*.05)*5*s,h=56*s,w=NYI.naturalWidth/NYI.naturalHeight*h,c=VN[S.auto].c;
 glw(X,Y,h*.9,.45,'rgba(180,140,255,A)');
 g.save();g.globalAlpha=.9;g.drawImage(NYI,X-w/2,Y-h/2,w,h);g.restore();
 if(fr%70<8)burst(VX(i)*s,GY-RV()*.7,S.auto,2);
 txt('🧿 Nguyên Anh',X,Y-h*.6,Math.max(9,10*s),'#e0d0ff',1);
}
function mdraw(){
 const gy=GY,now=Date.now(),u=s;
 cave(gy);
 /* cửa ra */
 {const x=rx()*u,t=fr;g.save();const ax=x,aw=44*u,ah=96*u;g.fillStyle='#3a2616';g.fillRect(ax-aw/2-6*u,gy-ah-4*u,6*u,ah+4*u);g.fillRect(ax+aw/2,gy-ah-4*u,6*u,ah+4*u);g.fillRect(ax-aw/2-8*u,gy-ah-10*u,aw+16*u,8*u);
  const q=g.createLinearGradient(0,gy-ah,0,gy);q.addColorStop(0,'rgba(190,230,255,.95)');q.addColorStop(1,'rgba(255,245,200,.7)');g.fillStyle=q;g.fillRect(ax-aw/2,gy-ah,aw,ah);glw(ax,gy-ah*.5,90*u,.35+.1*Math.sin(t*.08),'rgba(200,235,255,A)');
  txt('🌄 Ra ngoài',ax,gy-ah-18*u,Math.max(11,13*u),'#d8f4ff',1);txt('▼',ax,gy-ah-6*u+Math.sin(t*.12)*3,Math.max(10,12*u),'#ffd54a',1);g.restore()}
 [0,1,2].forEach(i=>veinDraw(i,now));
 ny();drawEP();hero();nameTag();pick();
 /* hạt, chữ bay */
 for(let i=PR.length-1;i>=0;i--){const p=PR[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.35*s;if(--p.l<=0||p.y>GY+30*s){PR.splice(i,1);continue}g.globalAlpha=Math.min(1,p.l/20);g.fillStyle=p.c;g.save();g.translate(p.x,p.y);g.rotate(p.l*.3);g.fillRect(-p.z/2,-p.z/2,p.z,p.z);g.restore();g.globalAlpha=1}
 for(let i=PU.length-1;i>=0;i--){const p=PU[i];p.y-=.8*s;if(--p.l<=0){PU.splice(i,1);continue}g.save();g.globalAlpha=Math.min(1,p.l/25);txt(p.m,p.x,p.y,Math.max(12,15*s),p.c,1);g.restore()}
 /* thông tin kho + thu thập tự động */
 const ay=gy-(PORT?190:176)*u;
 pill('🔩 Sắt '+fmtN(S.fe)+'  ·  🌑 Huyền Kim '+fmtN(S.hk),W/2,ay,Math.max(11,13*u),'rgba(20,12,6,.75)','#ffe9a0');
 chips=[];
 const ok=canAuto(),keys=['au','fe','hk',null];let top=H;
 keys.forEach((k,i)=>{
  const B=chipBox(i),sel=k?S.auto==k:!S.auto;top=Math.min(top,B.y);chips.push({x:B.x,y:B.y,w:B.w,h:B.h,k});
  g.globalAlpha=ok?1:.45;g.fillStyle=sel&&ok?'rgba(60,45,20,.92)':'rgba(15,10,6,.78)';g.fillRect(B.x+1,B.y,B.w-2,B.h);
  g.strokeStyle=sel&&ok?(k?VN[k].c:'#ddd'):'#5f4a2c';g.lineWidth=sel&&ok?2.5:1;g.strokeRect(B.x+1,B.y,B.w-2,B.h);
  g.font=Math.round(B.h*.46)+'px '+FONT;g.textAlign='center';g.fillStyle='#fff';g.fillText(k?VN[k].e:'⏹',B.x+B.w/2,B.y+B.h*.52);
  g.font='bold '+Math.round(Math.max(9,B.h*.22))+'px '+FONT;g.fillStyle=ok?'#ffe9a0':'#999';g.fillText(k?['Vàng','Sắt','Huyền'][i]:'Dừng',B.x+B.w/2,B.y+B.h*.9);g.globalAlpha=1;
 });
 const lab=ok?(S.auto?'🧿 Nguyên Anh đang thu thập: '+VN[S.auto].n+' (+'+rt(CFG.rate[S.auto]*rk())+'/phút)':'🧿 Chọn loại để Nguyên Anh tự động thu thập'):'🧿 Đạt Nguyên Anh để mở thu thập tự động';
 txt(lab,PORT?Math.max(8+(()=>{g.font='bold '+Math.round(Math.max(11,13*u))+'px '+FONT;return g.measureText(lab).width/2})(),0):W/2,top-8*u,Math.max(11,13*u),ok?'#e0d0ff':'#aaa',1);
 const nt=NT;if(nt.t>0){NT.t--;g.save();g.globalAlpha=Math.min(1,nt.t/30);txt(nt.s,W/2,ay-26*u,Math.max(12,14*u),nt.c,1);g.restore()}
}

/* ---------- Chạm trong hầm ---------- */
function fhit(px,py){
 for(const c of chips)if(px>=c.x&&px<=c.x+c.w&&py>=c.y&&py<=c.y+c.h){
  if(!canAuto()){note('Cần đạt cảnh giới Nguyên Anh để mở thu thập tự động','#ffb070');return}
  setAuto(c.k);return}
 if(Math.abs(px-rx()*s)<46*s&&py>GY-150*s&&py<GY+30*s){vt=cl(rx(),40,vw()-40);vgo=-1;back=1;pend=null;mine=null;return}
 for(let i=0;i<3;i++){
  if(Math.abs(px-VX(i)*s)<RV()*1.15&&py>GY-RV()*2&&py<GY+20*s){vt=cl(VX(i)-(VX(i)>P.x?RV()/s*.35:-RV()/s*.35),40,vw()-40);vgo=-1;pend=i;back=0;mine=null;return}
 }
 vt=cl(px/s,40,vw()-40);vgo=-1;pend=null;back=0;mine=null;
}
document.addEventListener('pointerdown',e=>{
 if(e.target!==c||bo||!started)return;
 const px=e.offsetX,py=e.offsetY;
 try{
 if(on){e.stopPropagation();fhit(px,py);return}
 if(!broken&&!vil&&!dg&&!lg&&!over&&mi()===0&&mtHit(px,py,GYH())){e.stopPropagation();enter()}
 }catch(x){fail(x)}
},true);
const GYH=()=>{try{return GY}catch(e){return H*.7}};

/* ---------- Nối vào vòng lặp ---------- */
const _vstep=vstep;vstep=function(){
 _vstep();
 if(!on)return;
 try{
 if(mvDir){pend=null;back=0;mine=null}
 else if(vt==null){
  if(back){back=0;if(Math.abs(P.x-cl(rx(),40,vw()-40))<14)leave()}
  else if(pend!=null){const i=pend;pend=null;startMine(i)}
 }
 if(mine&&vt==null){mine.t++;if(mine.t%CFG.swing==18)hit(mine.k)}
 }catch(x){fail(x)}
};
const _vdraw=vdraw;vdraw=function(){if(on){try{mdraw()}catch(x){fail(x)}if(!on)_vdraw();return}_vdraw()};
const _bgd=bgd;bgd=function(gy){_bgd(gy);if(!broken&&!vil&&!dg&&!lg&&mi()===0&&started){try{mtDraw(gy)}catch(x){g.restore&&0;fail(x)}}};
const _step=step;step=function(){
 if(on&&!vil){on=false;pend=null;mine=null;back=0}
 if(started&&fr%60==0){try{tick()}catch(e){}}
 if(tab==14&&bo&&fr%120==0){try{ui()}catch(e){}}
 _step();
};
const vlb=document.getElementById('vl'),_vl=vlb.onpointerdown;
vlb.onpointerdown=e=>{if(on){e.stopPropagation();leave();return}_vl(e)};

/* ---------- Giao diện tab ⛏ Khai khoáng trong túi ---------- */
function ui_(){
 const ok=canAuto(),k=rk();
 let h='<div class="dt">⛏ <b>Khai Khoáng</b><br><small>Bấm nút <b>Vào hầm mỏ</b> bên dưới, hoặc chạm vào <b>ngọn núi</b> ở bản đồ đầu tiên (<b>'+MP[0].n+'</b>) để vào hầm mỏ và tự tay đào. Từ cảnh giới <b>Nguyên Anh</b>, Nguyên Anh có thể tự động thu thập <b>1 trong 3 loại</b>, kể cả khi bạn thoát game (tối đa 8 giờ).</small></div>';
 h+='<div class="dt"><div class="fmb"><button onclick="MN.go()" style="flex:1;padding:12px;font-size:16px;font-weight:bold">⛏ Vào hầm mỏ ngay</button></div></div>';
 h+=`<div class="dt"><div class="fmh">📦 <b>Kho khoáng sản</b></div>
 <div class="st">🪙 Vàng đã khai thác: <b>${fmtN(S.gm)}</b> <span style="opacity:.7">(đã cộng vào 💰)</span></div>
 <div class="st">🔩 Quặng Sắt: <b>${fmtN(S.fe)}</b> <span style="opacity:.7">· công dụng cập nhật sau</span></div>
 <div class="st">🌑 Huyền Kim: <b>${fmtN(S.hk)}</b> <span style="opacity:.7">· công dụng cập nhật sau</span></div></div>`;
 h+='<div class="dt fmpl"><div class="fmh">🧿 <b>Nguyên Anh thu thập tự động</b>'+(S.auto?'<span class="fmc">'+VN[S.auto].e+' '+VN[S.auto].n+'</span>':'')+'</div>';
 if(!ok)h+='<div class="st">🔒 Đạt cảnh giới <b>Nguyên Anh</b> để mở. Quặng sắt và Huyền Kim nhận được sẽ dùng cho các tính năng cập nhật sau.</div></div>';
 else{
  h+='<div class="st">Chọn 1 loại. Tốc độ phụ thuộc cảnh giới hiện tại.</div><div class="fmb">'+ORD.map(x=>`<button${S.auto==x?' style="border-color:'+VN[x].c+';box-shadow:0 0 6px '+VN[x].c+'"':''} onclick="MN.setAuto('${x}')">${VN[x].e} ${VN[x].n}<br><small>+${rt(CFG.rate[x]*k)}/phút</small></button>`).join('')+`<button onclick="MN.setAuto(null)" ${S.auto?'':'disabled'}>⏹ Dừng</button></div>`;
  h+='<div class="st">Đã thu thập: 🪙 '+fmtN(S.at.au)+' · 🔩 '+fmtN(S.at.fe)+' · 🌑 '+fmtN(S.at.hk)+'</div></div>';
 }
 return h;
}

/* ---------- Lưu / tải ---------- */
function ld(o){S=fresh();on=false;pend=null;mine=null;
 if(o&&typeof o=='object'){S.fe=o.fe|0;S.hk=o.hk|0;S.gm=o.gm|0;S.auto=VN[o.auto]?o.auto:null;S.last=+o.last||Date.now();
  ['au','fe','hk'].forEach(k=>{S.acc[k]=+(o.acc&&o.acc[k])||0;S.at[k]=(o.at&&o.at[k])|0})}
 ORD.forEach(k=>{dur[k]=VN[k].hits;until[k]=0});
}
const save=()=>JSON.parse(JSON.stringify(S));
return{isOn:()=>on,ui:ui_,go,setAuto,tick,save,load:ld,reset:()=>ld(null),get:()=>S,VN}
})();
(()=>{const _n=ng;ng=function(){try{MN.reset()}catch(x){}_n()}})();
