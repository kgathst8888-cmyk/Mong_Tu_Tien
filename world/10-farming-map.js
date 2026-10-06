
/* ===================================================================
   BẢN ĐỒ LINH ĐIỀN ĐỘNG THIÊN
   - Cổng 🌱 trên trời Làng Thanh Vân (chạm → đi tới → vào bản đồ)
   - Trong bản đồ: chạm ô đất để đi tới và gieo / thu hoạch, chạm thanh hạt giống để chọn loại
   - Chỉ trong bản đồ này mới trồng và thu hoạch được (tab 🌱 ở túi chỉ xem cây đang trồng)
   =================================================================== */
(()=>{
const F={go:0,back:0,pend:null,chips:[]};
const FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',COLS=6;
const ex=()=>vw()*(PORT?.2:.79),ey=()=>GY-(PORT?300:235)*s,er=()=>27*s;
const rx=()=>Math.max(56,vw()*.07);
const PX=i=>vw()*(.25+.67*((i%COLS)/(COLS-1)));
const PY=i=>Math.floor(i/COLS)?GY+(PORT?84:16)*s:GY+(PORT?14:-48)*s;
const PW=()=>Math.min(vw()*.115,82)*.92;
const chipBox=i=>{const n=FM.HB.length;
 if(PORT){const cw=Math.min(50*s,52),ch=cw*1.05,x0=8,y0=GY+(H-GY)*.42;return{x:x0+(i%4)*cw,y:y0+Math.floor(i/4)*(ch+4),w:cw,h:ch}}
 const cw=Math.min(56*s,(W-16)/n),ch=Math.min(46*s,60);return{x:(W-cw*n)/2+i*cw,y:H-ch-6*s,w:cw,h:ch}};
const ell=(x,y,a,b)=>{g.beginPath();g.ellipse(x,y,a,b,0,0,6.28);g.fill()};
const glw=(x,y,r,a,c)=>{const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,c.replace('A',a));q.addColorStop(1,c.replace('A',0));g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.28);g.fill();g.restore()};
const txt=(s,x,y,px,fill,bold)=>{g.font=(bold?'bold ':'')+Math.round(px)+'px '+FONT;g.textAlign='center';g.lineWidth=Math.max(3,px*.28);g.strokeStyle='#000c';g.strokeText(s,x,y);g.fillStyle=fill;g.fillText(s,x,y)};

/* ----- Hình vẽ cây & ô đất (vẽ bằng canvas) ----- */
const PI=Math.PI,sm=x=>x*x*(3-2*x);
const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const dot=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,6.28);g.fill()};
const lf=(x,y,L,a,wd,c1,c2)=>{g.save();g.translate(x,y);g.rotate(a);const q=g.createLinearGradient(0,0,L,0);q.addColorStop(0,c1);q.addColorStop(1,c2);g.fillStyle=q;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-wd,L,0);g.quadraticCurveTo(L*.5,wd,0,0);g.fill();g.strokeStyle='rgba(0,40,0,.28)';g.lineWidth=.7;g.beginPath();g.moveTo(0,0);g.lineTo(L*.88,0);g.stroke();g.restore()};
const stm=(tx,h,wd,c)=>{g.strokeStyle=c;g.lineWidth=Math.max(2,wd*1.3);g.lineCap='round';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(tx*.3,-h*.5,tx,-h);g.stroke()};
const GL=['#2f7a2a','#86d050'];
const ART={
chi(u,k,rp,sw,t){[[-.24,.34,.13],[.02,.52,.17],[.25,.3,.11]].forEach(([dx,hh,r],j)=>{const h=hh*u*k,R=r*u*(.5+.5*k),x=dx*u+sw*h*.3;
 g.fillStyle='#efe3c4';rr(x-R*.3,-h,R*.6,h,R*.25);g.fill();
 const q=g.createLinearGradient(0,-h-R,0,-h+R*.2);q.addColorStop(0,rp?'#fff3a8':'#ffd76a');q.addColorStop(1,'#c9822a');g.fillStyle=q;g.beginPath();g.ellipse(x,-h,R,R*.62,0,PI,0);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.8)';dot(x-.4*R,-h-.3*R*.62,R*.12);dot(x+.25*R,-h-.5*R*.62,R*.1);dot(x+.55*R,-h-.12*R*.62,R*.08);
 g.strokeStyle='rgba(90,50,10,.5)';g.lineWidth=1;g.beginPath();g.ellipse(x,-h,R,R*.62,0,0,PI);g.stroke()})},
sam(u,k,rp,sw){const h=.6*u*k,tx=sw*h;stm(tx,h,u*.04,'#8cc060');
 if(k>.5){g.fillStyle='#f3cfa3';g.beginPath();g.ellipse(0,-1,u*.1,u*.05,0,0,6.28);g.fill()}
 g.save();g.translate(tx,-h);[-1.25,-.62,0,.62,1.25].forEach(a=>lf(0,0,u*.36*(.45+.55*k)*(a?1:1.1),-PI/2+a+sw*.8,u*.09,'#3f8a3a','#9ad45a'));
 if(rp){g.fillStyle='#e0314a';dot(-.05*u,-.04*u,u*.035);dot(.04*u,-.06*u,u*.035);dot(0,.02*u,u*.035)}g.restore()},
hoa(u,k,rp,sw,t){const h=.7*u*k,tx=sw*h;stm(tx,h,u*.045,'#4f9a3a');lf(0,-h*.3,u*.3*k,-.5+sw,u*.07,...GL);lf(0,-h*.45,u*.3*k,-PI+.5+sw,u*.07,...GL);
 g.save();g.translate(tx,-h);const R=u*.2*(.35+.65*k);
 if(k<.7){g.fillStyle='#e8503a';g.beginPath();g.ellipse(0,-R*.5,R*.4,R*.7,0,0,6.28);g.fill()}
 else{for(let j=0;j<7;j++){g.save();g.rotate(j*PI*2/7+t*.004);const q=g.createLinearGradient(0,0,0,-R);q.addColorStop(0,'#ffb02a');q.addColorStop(1,'#e8341e');g.fillStyle=q;g.beginPath();g.ellipse(0,-R*.58,R*.3,R*.62,0,0,6.28);g.fill();g.restore()}
  g.fillStyle='#ffe066';dot(0,0,R*.3)}
 g.restore()},
dang(u,k,rp,sw,t){const h=.76*u*k;g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(1.5,u*.035);g.beginPath();g.moveTo(0,0);g.lineTo(0,-.8*u);g.stroke();
 g.strokeStyle='#5fa23c';g.lineWidth=Math.max(1.6,u*.04);g.beginPath();for(let y=0;y<=h;y+=2){const x=Math.sin(y/u*9)*u*.1;y?g.lineTo(x,-y):g.moveTo(x,0)}g.stroke();
 for(let y=u*.14,j=0;y<h;y+=u*.16,j++)lf(Math.sin(y/u*9)*u*.1,-y,u*.17,(j%2?-.35:-PI+.35)+sw*.5,u*.05,...GL);
 if(k>.75){g.save();g.translate(u*.2,-h*.42);g.fillStyle='#7a6a34';g.beginPath();for(let a=0;a<6;a++)g.lineTo(Math.cos(a*PI/3)*u*.1,Math.sin(a*PI/3)*u*.08);g.closePath();g.fill();g.strokeStyle='#d0bc6a';g.lineWidth=1;g.stroke();g.beginPath();g.moveTo(-u*.05,0);g.lineTo(u*.05,0);g.moveTo(0,-u*.07);g.lineTo(0,u*.07);g.stroke();g.restore()}},
thao(u,k,rp,sw,t){[[-.2,0,.9],[.18,-.05,.85],[0,-.14,1],[-.04,.0,.7]].forEach(([dx,dy,sc],j)=>{const x=dx*u,y=-u*.22*k+dy*u*k,s=u*.13*sc*(.4+.6*k);g.strokeStyle='#4f9a3a';g.lineWidth=Math.max(1.2,u*.025);g.beginPath();g.moveTo(x*.3,0);g.lineTo(x,y);g.stroke();
 g.save();g.translate(x,y);g.rotate(sw+Math.sin(t*.03+j)*.06);for(let a=0;a<4;a++){g.save();g.rotate(a*PI/2+PI/4);g.fillStyle=a%2?'#4aa84a':'#6cc85a';dot(s*.62,0,s*.62);g.restore()}g.restore()});
 if(rp){g.fillStyle='#fff';for(let j=0;j<3;j++)dot((j-1)*u*.14,-u*.44-Math.abs(j-1)*u*.04,u*.035)}},
lien(u,k,rp,sw,t){g.fillStyle='#2e8a6a';[[-.2,.0],[.22,.03]].forEach(([dx,dy])=>{g.beginPath();g.ellipse(dx*u,dy*u-u*.03,u*.2*k,u*.07*k,0,0,6.28);g.fill()});
 const h=.5*u*k,R=u*.25*(.3+.7*k),tx=sw*h;stm(tx,h,u*.035,'#4aa88a');g.save();g.translate(tx,-h);
 for(let j=0;j<7;j++){g.save();g.rotate((j-3)*.42);const q=g.createLinearGradient(0,0,0,-R);q.addColorStop(0,'#f2fdff');q.addColorStop(1,'#6fc8ff');g.fillStyle=q;g.beginPath();g.ellipse(0,-R*.55,R*.2,R*.58,0,0,6.28);g.fill();g.restore()}
 for(let j=0;j<5;j++){g.save();g.rotate((j-2)*.5);g.fillStyle='#d4f2ff';g.beginPath();g.ellipse(0,-R*.3,R*.15,R*.34,0,0,6.28);g.fill();g.restore()}
 g.fillStyle='#fff3a0';dot(0,-R*.1,R*.1);g.restore()},
truc(u,k,rp,sw,t){[[-.2,.66],[0,.92],[.2,.58]].forEach(([dx,hh],j)=>{const x=dx*u,h=hh*u*k,w=Math.max(2.6,u*.06),q=g.createLinearGradient(x-w,0,x+w,0);q.addColorStop(0,'#7a58c8');q.addColorStop(.5,'#c4a6f4');q.addColorStop(1,'#6a48b8');g.fillStyle=q;g.fillRect(x-w/2,-h,w,h);
 g.fillStyle='rgba(50,20,100,.55)';for(let y=u*.2;y<h;y+=u*.2)g.fillRect(x-w/2-1,-y,w+2,1.6);
 [-.9,.1,1.0].forEach(a=>lf(x,-h+u*.04,u*.2*k,-PI/2+a+sw,u*.04,'#3f8a4a','#9ad87a'))});
 if(rp&&(t%46<7)){g.strokeStyle='#fff27a';g.lineWidth=Math.max(1.5,u*.03);g.beginPath();g.moveTo(u*.3,-u*.95);g.lineTo(u*.22,-u*.75);g.lineTo(u*.31,-u*.72);g.lineTo(u*.2,-u*.5);g.stroke()}}
};
const seedling=(u,sw)=>{stm(sw*u*.1,u*.16,u*.03,'#7cc050');lf(0,-u*.14,u*.15,-PI/2-.95+sw,u*.05,...GL);lf(0,-u*.14,u*.15,-PI/2+.95+sw,u*.05,...GL)};
function plantArt(id,u,pc,t,i){
 const rp=pc>=1,sw=Math.sin(t*.035+i*1.7)*(rp?.07:.05);
 if(pc<.2)return seedling(u,sw);
 const k=.32+.68*sm(Math.min(1,(pc-.2)/.8));
 ART[id](u,k,rp,sw,t);
}
function bed(X,Y,w,wet,i){
 const bw=w*1.32,bh=w*.46;
 g.fillStyle='rgba(0,0,0,.3)';ell(X,Y+bh*.52,bw*.58,bh*.3);
 let q=g.createLinearGradient(0,Y,0,Y+bh*.6);q.addColorStop(0,'#a8763e');q.addColorStop(1,'#5a381a');g.fillStyle=q;rr(X-bw/2,Y-2,bw,bh*.6,3*s);g.fill();
 g.strokeStyle='rgba(40,20,5,.5)';g.lineWidth=1;g.stroke();
 g.strokeStyle='rgba(60,30,10,.35)';for(let j=1;j<3;j++){g.beginPath();g.moveTo(X-bw/2+4,Y-2+bh*.2*j);g.lineTo(X+bw/2-4,Y-2+bh*.2*j+((i+j)%2?1:-1));g.stroke()}
 g.fillStyle='#caa468';dot(X-bw/2+5*s,Y+bh*.2,1.6*s);dot(X+bw/2-5*s,Y+bh*.2,1.6*s);
 q=g.createLinearGradient(0,Y-bh*.7,0,Y);q.addColorStop(0,wet?'#563520':'#6e472a');q.addColorStop(1,wet?'#2e1a0c':'#3e2614');g.fillStyle=q;rr(X-bw/2+2,Y-bh*.72,bw-4,bh*.78,bh*.3);g.fill();
 g.strokeStyle='#c19559';g.lineWidth=Math.max(1.5,2*s);rr(X-bw/2+2,Y-bh*.72,bw-4,bh*.78,bh*.3);g.stroke();
 g.strokeStyle='rgba(20,10,0,.45)';g.lineWidth=1.2;for(let j=-1;j<=1;j++){const yy=Y-bh*.3+j*bh*.17;g.beginPath();g.moveTo(X-bw*.38,yy);g.quadraticCurveTo(X,yy+bh*.07,X+bw*.38,yy);g.stroke()}
 g.fillStyle='rgba(190,170,140,.55)';dot(X-bw*.3,Y-bh*.5,1.5*s);dot(X+bw*.33,Y-bh*.18,1.8*s);dot(X+bw*.12,Y-bh*.55,1.2*s);
}
function spark(x,y,r,a){g.save();g.globalAlpha=a;g.fillStyle='#fff6b0';g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();g.restore()}
function pill(txt,x,y,px,bg,fg){g.font='bold '+Math.round(px)+'px '+FONT;const tw=g.measureText(txt).width+px*.9;g.fillStyle=bg;rr(x-tw/2,y-px*.95,tw,px*1.35,px*.6);g.fill();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.stroke();g.fillStyle=fg;g.textAlign='center';g.fillText(txt,x,y)}
/* cỏ, hoa, bướm */
const TUFT=Array.from({length:46},(_,i)=>({x:(i*97%100)/100,y:(i*53%100)/100,f:i%5==0?i%3:-1}));
function ambient(gy,t){
 TUFT.forEach((p,i)=>{const x=p.x*W,y=gy-10*s+p.y*(H-gy)*.85,h=(9+(i%4)*3)*s,sw=Math.sin(t*.03+i)*2*s;
  g.lineWidth=Math.max(1,1.4*s);g.lineCap='round';
  [-1,0,1].forEach((d,j)=>{g.strokeStyle=j==1?'#7ab83e':'#4c8a2c';g.beginPath();g.moveTo(x+d*2*s,y);g.quadraticCurveTo(x+d*3*s+sw*.5,y-h*.6,x+d*5*s+sw,y-h);g.stroke()});
  if(p.f>=0){g.fillStyle=['#fff','#ffd84a','#ff9ac8'][p.f];dot(x+sw,y-h-1*s,2*s)}});
 for(let i=0;i<3;i++){const x=W*(.2+.3*i)+Math.sin(t*.011+i*2)*W*.18,y=gy-(70+i*28)*s+Math.sin(t*.03+i)*18*s,f=Math.abs(Math.sin(t*.25+i)),c=['#ffb0d8','#ffe27a','#9ad8ff'][i];
  g.fillStyle=c;g.save();g.translate(x,y);g.beginPath();g.ellipse(-3*s,0,3.5*s*f+.8,4.5*s,-.4,0,6.28);g.fill();g.beginPath();g.ellipse(3*s,0,3.5*s*f+.8,4.5*s,.4,0,6.28);g.fill();g.fillStyle='#4a2a1a';g.fillRect(-.7*s,-3*s,1.4*s,6*s);g.restore()}
}

/* ----- Cổng vào ở Làng (vẽ đè lên cảnh làng) ----- */
function gateDraw(){
 const x=ex()*s,y=ey(),t=fr,r=er();
 g.save();
 const q=g.createRadialGradient(x,y,3,x,y,r*1.1);q.addColorStop(0,'#f2ffd8');q.addColorStop(.5,'#4aa84c');q.addColorStop(1,'#0e3a1c');
 g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.28);g.fill();
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;
 for(let j=0;j<3;j++){g.beginPath();g.ellipse(x,y,r*(.28+j*.22),r*(.5+j*.16),t*.035*(j%2?1:-1)+j,0,4);g.stroke()}
 g.strokeStyle='#8a8f78';g.lineWidth=Math.max(4,6*s);g.beginPath();g.arc(x,y,r+3*s,0,6.28);g.stroke();
 g.strokeStyle='#9be07a';g.lineWidth=2;g.stroke();
 glw(x,y,r*1.7,.3+.18*Math.sin(t*.1),'rgba(120,255,120,A)');
 g.font=Math.round(r*.9)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('🌱',x,y+Math.sin(t*.06)*1.5);g.textBaseline='alphabetic';
 txt('🌱 Linh Điền',x,y-r-17*s,Math.max(11,13*s),'#d8ffb8',1);
 txt('chạm để vào',x,y-r-4*s,Math.max(9,10*s),'#bff4ff');
 g.restore();
}

/* ----- Vào / ra ----- */
function enter(){
 if(!started||!vil)return;
 FM.setOn(true);P.x=cl(rx()+70,40,vw()-40);vt=null;vgo=-1;F.go=F.back=0;F.pend=null;cam=0;P.atk=0;P.pe=null;
 FM.note('🌱 Vào Linh Điền Động Thiên · chạm ô đất để gieo / thu hoạch','#b8ff9a');
}
function leave(){FM.setOn(false);vt=null;vgo=-1;F.pend=null;F.back=0;F.go=0;P.x=cl(ex(),40,vw()-40)}

/* ----- Cảnh bản đồ ----- */
function fdraw(){
 const gy=GY,S=FM.get(),now=Date.now();
 {const t=fr;let q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,'#3f86b4');q.addColorStop(.55,'#9fd4c4');q.addColorStop(1,'#f4f8c8');g.fillStyle=q;g.fillRect(0,0,W,H);
  glw(W*.42,gy*.42,gy*.5,.4,'rgba(255,248,200,A)');
  [['#86bda4',.72,.0042,.012,120,50],['#5e9f74',.9,.0065,.017,70,34]].forEach(([c,a,k1,k2,h0,h1],li)=>{g.fillStyle=c;g.globalAlpha=a;g.beginPath();g.moveTo(0,gy);for(let x=0;x<=W+8;x+=8)g.lineTo(x,gy-(h0+h1*Math.sin(x*k1+li*2+1)+h1*.5*Math.sin(x*k2+li))*s);g.lineTo(W,gy);g.closePath();g.fill();g.globalAlpha=1});
  q=g.createLinearGradient(0,gy-20*s,0,H);q.addColorStop(0,'#7db04a');q.addColorStop(.35,'#4f8a38');q.addColorStop(1,'#1f3a18');g.fillStyle=q;g.fillRect(0,gy-20*s,W,H-gy+20*s);
  for(let i=0;i<16;i++){const x=(i*157+t*.25*(1+i%3))%W,y=gy-30*s-((i*61+t*(.25+.1*(i%4)))%170)*s;glw(x,y,(5+i%3*2)*s,.55+.3*Math.sin(t*.07+i),'rgba(220,255,140,A)')}}
 /* cây cảnh + hàng rào */
 g.textAlign='center';g.font=Math.round(64*s)+'px '+FONT;
 [.1,.451,.719,.97].forEach((k,i)=>g.fillText(i%2?'🌲':'🌳',vw()*k*s,gy-26*s));
 g.fillStyle='#7a5a34';for(let x=0;x<W;x+=34*s)g.fillRect(x,gy-14*s,5*s,20*s);g.fillRect(0,gy-9*s,W,4*s);
 /* cổng về làng */
 {const x=rx()*s,t=fr;g.save();g.fillStyle='#6a4a2a';g.fillRect(x-34*s,gy-96*s,9*s,100*s);g.fillRect(x+25*s,gy-96*s,9*s,100*s);g.fillRect(x-42*s,gy-104*s,84*s,10*s);
  const a=g.createLinearGradient(0,gy-92*s,0,gy);a.addColorStop(0,'rgba(255,224,150,.55)');a.addColorStop(1,'rgba(255,224,150,.1)');g.fillStyle=a;g.fillRect(x-25*s,gy-92*s,50*s,92*s);
  glw(x,gy-48*s,60*s,.2+.1*Math.sin(t*.1),'rgba(255,210,120,A)');
  txt('🏘 Về Làng',x,gy-114*s,Math.max(12,14*s),'#ffe9a0',1);txt('▼',x,gy-100*s+Math.sin(t*.12)*3,Math.max(11,13*s),'#ffd54a',1);g.restore()}
 /* ô đất */
 ambient(gy,fr);
 const w=PW()*s;
 S.plots.forEach((p,i)=>{
  const X=PX(i)*s,Y=PY(i),oy=Y-w*.12;
  bed(X,Y,w,!!p,i);
  if(!p){g.save();g.globalAlpha=.5+.2*Math.sin(fr*.06+i);g.strokeStyle='#e8f0b8';g.lineWidth=1.5;g.setLineDash([4,4]);g.beginPath();g.ellipse(X,oy,w*.2,w*.08,0,0,6.28);g.stroke();g.setLineDash([]);g.restore();return}
  const b=FM.HM[p.id],tot=b.g*1000,el=now-p.t0,pc=Math.min(1,el/tot),rd=pc>=1;
  if(rd)glw(X,oy-w*.4,w*.95,.4+.2*Math.sin(fr*.15+i),'rgba(255,230,120,A)');
  g.save();g.translate(X,oy);const bo=rd?Math.sin(fr*.1+i)*1.2*s:0;g.translate(0,bo);plantArt(p.id,w,pc,fr,i);g.restore();
  if(rd){for(let j=0;j<3;j++){const ph=((fr*.02+j/3+i*.13)%1);spark(X+Math.sin(j*2.4+i)*w*.4,oy-w*(.2+.9*ph),(3+j)*s,1-ph)}
   pill('✨ Chín!',X,oy-w*1.18,Math.max(10,w*.19),'rgba(120,80,0,.85)','#fff2a0')}
  else{
   const rem=(tot-el)/1000,top=oy-w*(.35+.75*pc)-w*.12;
   pill(FM.ft(rem),X,top,Math.max(10,w*.17),'rgba(10,30,50,.7)','#bff4ff');
   const bw=w*1.1,by=Y+w*.18;g.fillStyle='rgba(0,0,0,.55)';rr(X-bw/2,by,bw,4*s,2*s);g.fill();g.fillStyle=b.c;rr(X-bw/2,by,Math.max(2*s,bw*pc),4*s,2*s);g.fill();
  }
 });
 drawEP();hero();nameTag();
 /* thanh chọn hạt giống */
 F.chips=[];let top=H;
 FM.HB.forEach((b,i)=>{
  const B=chipBox(i),x=B.x,y0=B.y,cw=B.w,ch=B.h,on=S.sel==b.id,c=S.seeds[b.id]|0;top=Math.min(top,y0);F.chips.push({x,y:y0,w:cw,h:ch,id:b.id});
  g.fillStyle=on?'rgba(60,45,20,.92)':'rgba(15,10,6,.78)';g.fillRect(x+1,y0,cw-2,ch);
  g.strokeStyle=on?b.c:'#5f4a2c';g.lineWidth=on?2.5:1;g.strokeRect(x+1,y0,cw-2,ch);
  g.font=Math.round(ch*.46)+'px '+FONT;g.textAlign='center';g.fillStyle='#fff';g.globalAlpha=c?1:.4;g.fillText(b.e,x+cw/2,y0+ch*.5);
  g.font='bold '+Math.round(Math.max(10,ch*.26))+'px '+FONT;g.fillStyle=c?'#ffe9a0':'#999';g.fillText('×'+c,x+cw/2,y0+ch*.88);g.globalAlpha=1;
 });
 const sb=FM.HM[S.sel];
 {const lab='Hạt đang chọn: '+sb.e+' '+sb.n,px=Math.max(11,13*s);g.font='bold '+Math.round(px)+'px '+FONT;const tw=g.measureText(lab).width;txt(lab,PORT?Math.max(8+tw/2,0):W/2,top-8*s,px,sb.c,1)}
 /* thông báo */
 const nt=FM.nt();if(nt.t>0){const a=Math.min(1,nt.t/30);g.save();g.globalAlpha=a;txt(nt.s,W/2,gy-150*s,Math.max(12,15*s),nt.c,1);g.restore()}
}

/* ----- Chạm trong bản đồ ----- */
function fhit(px,py){
 for(const c of F.chips)if(px>=c.x&&px<=c.x+c.w&&py>=c.y&&py<=c.y+c.h){FM.sel(c.id);return}
 const S=FM.get();
 if(Math.abs(px-rx()*s)<48*s&&py>GY-130*s&&py<GY+30*s){vt=cl(rx(),40,vw()-40);vgo=-1;F.back=1;F.pend=null;return}
 const w=PW()*s;
 for(let i=0;i<S.plots.length;i++){
  if(Math.abs(px-PX(i)*s)<w*.62&&Math.abs(py-PY(i)+w*.35)<w*.75){vt=cl(PX(i),40,vw()-40);vgo=-1;F.pend=i;F.back=0;return}
 }
 vt=cl(px/s,40,vw()-40);vgo=-1;F.pend=null;F.back=0;
}
document.addEventListener('pointerdown',e=>{
 if(e.target!==c||!vil||bo||!started||(typeof MN!='undefined'&&MN.isOn()))return;
 const px=e.offsetX,py=e.offsetY;
 if(FM.isOn()){e.stopPropagation();fhit(px,py);return}
 if(Math.abs(px-ex()*s)<Math.max(er()*1.4,34)&&Math.abs(py-ey())<Math.max(er()*1.6,40)){e.stopPropagation();vt=cl(ex(),40,vw()-40);vgo=-1;gateGo=0;twGoF=0;F.go=1}
},true);

/* ----- Nối vào vòng lặp game ----- */
const _vstep=vstep;vstep=function(){
 _vstep();
 if(F.go){if(mvDir)F.go=0;else if(vt==null){F.go=0;if(Math.abs(P.x-cl(ex(),40,vw()-40))<14)enter()}}
 if(FM.isOn()){
  if(mvDir){F.pend=null;F.back=0}
  else if(vt==null){
   if(F.back){F.back=0;if(Math.abs(P.x-cl(rx(),40,vw()-40))<14){leave();FM.note('🏘 Trở về Làng Thanh Vân','#ffe9a0')}}
   else if(F.pend!=null){const i=F.pend;F.pend=null;FM.tap(i)}
  }
 }
};
const _vdraw=vdraw;vdraw=function(){
 if(FM.isOn()){fdraw();return}
 _vdraw();
 if(!bo&&started)gateDraw();
};
const _step=step;step=function(){if(FM.isOn()&&!vil){FM.setOn(false);F.go=F.back=0;F.pend=null}FM.tickNote();_step()};
const vlb=document.getElementById('vl'),_vl=vlb.onpointerdown;
vlb.onpointerdown=e=>{if(FM.isOn()){e.stopPropagation();leave();FM.note('🏘 Trở về Làng Thanh Vân','#ffe9a0');return}_vl(e)};
})();
/*==== THÀNH THỊ LINH GIỚI ====
  Hạ Ma Thần -> bước qua Cổng Linh Giới ở Làng -> vào Thành Thị (không có quái).
  Thành thị có 4 cổng dịch chuyển. Cổng 1 dẫn tới chiến trường Linh Giới cũ; cổng 2-4 chờ thêm nội dung.
  Muốn thêm nội dung cho cổng: sửa mảng LCG bên dưới (đặt open:1 và viết hàm go).
  Nút "Làng" ở thanh dưới: từ Thành Thị về Làng Thanh Vân. */
window.LCT=(()=>{
const FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
const LCG=[
 {sn:'Chiến Trường',n:'Chiến Trường Linh Giới',e:'⚔️',c:'#5ff0ff',rgb:'80,240,255',sub:'Quái Lv80-100 · chạm để vào',open:1,go:()=>{on=false;lgEnter()}},
 {sn:'Bí Cảnh',n:'Linh Mạch Bí Cảnh',e:'💎',c:'#7dffb0',rgb:'120,255,170',sub:'Sắp mở',open:0},
 {sn:'Thí Luyện',n:'Thiên Giới Thí Luyện',e:'🏯',c:'#ffd870',rgb:'255,210,110',sub:'Sắp mở',open:0},
 {sn:'Truyền Tống',n:'Hư Không Truyền Tống',e:'🌌',c:'#d890ff',rgb:'210,140,255',sub:'Sắp mở',open:0}];
const GX=i=>vw()*(PORT?[.14,.34,.54,.74][i]:[.27,.45,.63,.81][i]);
const GA=()=>Math.min(44,vw()*.058);
let on=false,tgt=-1,cv=null,ck='',WF=[],CR=[];
const rgbm=(a,b,t)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const txt=(t,x,y,px,fill,bold)=>{g.font=(bold?'bold ':'')+Math.round(px)+'px '+FONT;g.textAlign='center';g.lineWidth=Math.max(3,px*.28);g.strokeStyle='#000c';g.strokeText(t,x,y);g.fillStyle=fill;g.fillText(t,x,y)};
const glw=(x,y,r,a,rgb)=>{const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.restore()};

/* ---------- vẽ tĩnh (cache) ---------- */
function crystal(q,x,y,w,h,c1,c2){const gr=q.createLinearGradient(x,y-h,x,y);gr.addColorStop(0,c1);gr.addColorStop(1,c2);q.fillStyle=gr;q.beginPath();q.moveTo(x-w*.5,y);q.lineTo(x-w*.32,y-h*.62);q.lineTo(x+w*.04,y-h);q.lineTo(x+w*.4,y-h*.55);q.lineTo(x+w*.5,y);q.closePath();q.fill();q.fillStyle='rgba(255,255,255,.35)';q.beginPath();q.moveTo(x-w*.32,y-h*.62);q.lineTo(x+w*.04,y-h);q.lineTo(x-w*.05,y-h*.4);q.closePath();q.fill()}
function isl(q,cx,ty,w,h,k,o){o=o||{};const u=s,rock=hx('#6a6488'),haze=hx('#b8a8e0'),gr0=hx('#5aa860');
 const L=cx-w/2,R=cx+w/2,pts=[[L,ty],[L+w*.1,ty+h*.38],[L+w*.26,ty+h*.58],[L+w*.4,ty+h*.9],[cx+w*.02,ty+h],[cx+w*.16,ty+h*.66],[cx+w*.3,ty+h*.5],[R-w*.08,ty+h*.3],[R,ty]];
 const gr=q.createLinearGradient(0,ty,0,ty+h);gr.addColorStop(0,rgbm(rock,haze,k*.8));gr.addColorStop(1,rgbm(hx('#2a2848'),haze,k*.9));
 if(o.wf){const wx=cx+w*(o.wf>0?.2:-.2);WF.push({x:wx,y:ty+h*.45,w:Math.max(2,w*.045),k:k});}
 q.fillStyle=gr;q.beginPath();pts.forEach((p,i)=>i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1]));q.closePath();q.fill();
 q.fillStyle=rgbm(gr0,haze,k*.75);q.beginPath();q.ellipse(cx,ty,w/2,Math.max(3,h*.09),0,Math.PI,0);q.lineTo(R,ty+Math.max(3,h*.05));q.lineTo(L,ty+Math.max(3,h*.05));q.closePath();q.fill();
 q.fillStyle=rgbm(hx('#8fd070'),haze,k*.75);q.beginPath();q.ellipse(cx,ty,w/2,Math.max(2,h*.07),0,Math.PI,0);q.fill();
 for(let i=0;i<(o.cr|0);i++){const x=cx+(i-(o.cr-1)/2)*w*.13,hh=h*(.35+.25*((i*37)%5)/5),ww=w*.055;crystal(q,x,ty+h*.03,ww,hh,rgbm(hx('#d8f8ff'),haze,k*.5),rgbm(hx('#4a9ad8'),haze,k*.5))}
 if(o.pg){const px=cx+w*.05,hc=rgbm(hx('#3a3a66'),haze,k*.7),rc=rgbm(hx('#2a6a8a'),haze,k*.6);for(let i=0;i<3;i++){const bw=w*(.2-.045*i),bh=h*.2,y0=ty-i*bh*1.25-bh*.2;q.fillStyle=hc;q.fillRect(px-bw*.4,y0-bh,bw*.8,bh);q.fillStyle=rc;q.beginPath();q.moveTo(px-bw*.7,y0-bh);q.quadraticCurveTo(px,y0-bh*1.5,px+bw*.7,y0-bh);q.lineTo(px+bw*.5,y0-bh*.78);q.lineTo(px-bw*.5,y0-bh*.78);q.closePath();q.fill();q.fillStyle='rgba(255,220,130,.8)';q.fillRect(px-bw*.08,y0-bh*.7,bw*.16,bh*.4)}}}
function stat(q){const u=s,gy=GY;WF=[];CR=[];let a=11;const rnd=()=>(a=(a*16807)%2147483647)/2147483647;
 let gr=q.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060933');gr.addColorStop(.26,'#1b1a6c');gr.addColorStop(.46,'#4f3a9c');gr.addColorStop(.62,'#b878b4');gr.addColorStop(.76,'#f2b6a2');gr.addColorStop(1,'#a8d4f0');q.fillStyle=gr;q.fillRect(0,0,W,H);
 for(let i=0;i<150;i++){const x=rnd()*W,y=rnd()*gy*.78,r=(.5+rnd()*1.3)*Math.max(.8,u);q.fillStyle='rgba(255,255,255,'+(.25+.7*rnd())+')';q.fillRect(x,y,r,r)}
 q.save();q.globalCompositeOperation='lighter';[[.55,.26,'60,220,200',.3],[.18,.14,'150,90,255',.28],[.86,.34,'255,120,200',.22]].forEach(([fx,fy,c,al])=>{const r=gy*.7,g2=q.createRadialGradient(W*fx,gy*fy,2,W*fx,gy*fy,r);g2.addColorStop(0,'rgba('+c+','+al+')');g2.addColorStop(1,'rgba('+c+',0)');q.fillStyle=g2;q.fillRect(0,0,W,gy)});q.restore();
 /* đảo xa (mờ) -> đảo gần */
 [[.1,.2,.13,.12,.72,{pg:1,cr:2}],[.31,.13,.07,.08,.78,{cr:2}],[.47,.27,.06,.06,.8,{}],[.9,.24,.11,.1,.66,{cr:4,wf:-1}],[.7,.16,.15,.17,.56,{cr:5,wf:1}],[.5,.4,.3,.2,.34,{cr:7,wf:1,pg:1}],[.2,.43,.16,.12,.4,{cr:3}],[.84,.46,.14,.12,.38,{cr:3,wf:-1}]].forEach(([fx,fy,fw,fh,k,o])=>isl(q,W*fx,gy*fy*1.05,W*fw,gy*fh,k,o));
 /* sàn thành thị nổi trên mây */
 const top=gy-12*u,rim=gy+34*u,bot=Math.min(H+6,rim+Math.max(46*u,(H-rim)*.7));
 const cl=q.createLinearGradient(0,rim,0,bot);cl.addColorStop(0,'#6d7390');cl.addColorStop(1,'#25243f');q.fillStyle=cl;q.beginPath();q.moveTo(0,rim);for(let x=0;x<=W+30;x+=W/16)q.lineTo(x,rim+(8+rnd()*(bot-rim-8)));q.lineTo(W,rim);q.closePath();q.fill();
 for(let i=0;i<26;i++){const x=rnd()*W;q.strokeStyle='rgba(10,8,30,.28)';q.lineWidth=1.2*u;q.beginPath();q.moveTo(x,rim);q.lineTo(x+(rnd()-.5)*18*u,rim+(8+rnd()*(bot-rim-8))*.7);q.stroke()}
 const fl=q.createLinearGradient(0,top,0,rim);fl.addColorStop(0,'#c9d2e6');fl.addColorStop(.5,'#97a3bf');fl.addColorStop(1,'#6f7a98');q.fillStyle=fl;q.fillRect(0,top,W,rim-top);
 q.fillStyle='#4f9a56';q.fillRect(0,top-3*u,W,7*u);q.fillStyle='#86d070';q.fillRect(0,top-3*u,W,2.5*u);for(let x=0;x<W;x+=6*u){q.fillStyle=rnd()>.5?'#5fb060':'#3e8a4c';q.fillRect(x,top+2*u,2*u,(2+rnd()*4)*u)}
 q.strokeStyle='rgba(30,40,70,.28)';q.lineWidth=Math.max(1,u);for(let i=0;i<5;i++){const y=top+7*u+(rim-top-7*u)*i/4;q.beginPath();q.moveTo(0,y);q.lineTo(W,y);q.stroke()}
 for(let x=-W;x<W*2;x+=34*u){q.beginPath();q.moveTo(x,top+7*u);q.lineTo(W/2+(x-W/2)*1.5,rim);q.stroke()}
 q.fillStyle='#5a6482';q.fillRect(0,rim-4*u,W,5*u);q.fillStyle='rgba(180,240,255,.5)';q.fillRect(0,rim-4*u,W,1.5*u);
 /* tre + tinh thể trang trí */
 for(let i=0;i<7;i++){const x=W*.015+i*10*u,h=(110+rnd()*70)*u;q.fillStyle=i%2?'#3f8a45':'#2f7a3c';q.fillRect(x,top-h,4.5*u,h);q.fillStyle='#8fd070';for(let j=1;j<5;j++)q.fillRect(x-.6*u,top-h*j/5,5.7*u,1.4*u);q.fillStyle='#4aa850';for(let j=0;j<4;j++){q.beginPath();q.ellipse(x+3*u+(j%2?7:-7)*u,top-h*(.35+j*.17),9*u,2.8*u,j%2?-.5:.5,0,6.283);q.fill()}}
 const cs=[.06,.28,.5,.72,.94];cs.forEach((f,ci)=>{const x=W*f,n=ci%4==0?4:3;for(let i=0;i<n;i++){const hh=(24+((i*53+ci*31)%7)*8)*u*(ci%4==0?1.5:1),xx=x+(i-(n-1)/2)*11*u;crystal(q,xx,top+1*u,11*u,hh,i%2?'#e0f8ff':'#c8d8ff',i%2?'#3a8ad8':'#7a5ad8')}CR.push({x:x,y:top-30*u})});
 const vg=q.createRadialGradient(W/2,H*.5,H*.4,W/2,H*.5,H*1.05);vg.addColorStop(0,'rgba(0,0,10,0)');vg.addColorStop(1,'rgba(0,0,20,.4)');q.fillStyle=vg;q.fillRect(0,0,W,H)}

/* ---------- vẽ động ---------- */
function aurora(t){const gy=GY;g.save();g.globalCompositeOperation='lighter';[['80,255,200',.2,.06],['120,190,255',.3,.045],['190,120,255',.38,.04]].forEach(([c,o,al],k)=>{const gr=g.createLinearGradient(0,gy*(o-.12),0,gy*(o+.32));gr.addColorStop(0,'rgba('+c+',0)');gr.addColorStop(.35,'rgba('+c+','+(al*3.2)+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.beginPath();const ya=x=>gy*o+Math.sin(x*.0055+t*.011+k*2.1)*gy*.09+Math.sin(x*.013-t*.017+k)*gy*.03;g.moveTo(0,ya(0));for(let x=0;x<=W+14;x+=14)g.lineTo(x,ya(x));for(let x=W+14;x>=0;x-=14)g.lineTo(x,ya(x)+gy*(.2+.06*Math.sin(x*.01+t*.02+k)));g.closePath();g.fill()});g.restore()}
function sparkles(t){const gy=GY,u=s;g.save();g.fillStyle='#fff';for(let i=0;i<24;i++){const x=(i*127.3)%W,y=((i*71.9)%(gy*.7));g.globalAlpha=.25+.6*Math.abs(Math.sin(t*.03+i*1.7));g.fillRect(x-.8*u,y,2.6*u,.8*u);g.fillRect(x,y-.8*u,.8*u,2.6*u)}g.restore()}
function falls(t){const u=s;g.save();WF.forEach((f,i)=>{const w=f.w,gr=g.createLinearGradient(0,f.y,0,H);gr.addColorStop(0,'rgba(220,250,255,'+(.55-f.k*.3)+')');gr.addColorStop(1,'rgba(220,250,255,0)');g.fillStyle=gr;g.fillRect(f.x-w/2,f.y,w,Math.min(H-f.y,GY*.6));g.fillStyle='rgba(255,255,255,.5)';for(let j=0;j<5;j++){const y=f.y+((t*1.2+j*40+i*17)%(GY*.5));g.fillRect(f.x-w*.3,y,w*.6,5*u)}});g.restore()}
function lanterns(t){const gy=GY,u=s;for(let i=0;i<8;i++){const x=(i*211+t*.1*(1+i%3))%(W+40)-20,y=gy*.95-((t*.17*(.5+(i%3)*.3)+i*101)%(gy*.9)),sw=Math.sin(t*.03+i)*4*u;glw(x+sw,y,16*u,.5,'255,170,70');g.fillStyle='#ffb34a';g.fillRect(x+sw-3*u,y-4*u,6*u,8*u);g.fillStyle='#fff0b0';g.fillRect(x+sw-1.6*u,y-2*u,3.2*u,4*u);g.fillStyle='#7a3a12';g.fillRect(x+sw-3.4*u,y-5*u,6.8*u,1.4*u)}}
function sprite(x,y,t,ph,c){const u=s,b=Math.sin(t*.05+ph)*4*u;glw(x,y+b,22*u,.55,c);g.save();g.translate(x,y+b);g.fillStyle='rgba(235,255,255,.95)';g.beginPath();g.ellipse(0,0,6*u,5*u,0,0,6.283);g.fill();g.beginPath();g.moveTo(-3*u,-3*u);g.lineTo(-6*u,-10*u);g.lineTo(-.5*u,-4*u);g.moveTo(3*u,-3*u);g.lineTo(6*u,-10*u);g.lineTo(.5*u,-4*u);g.fill();g.strokeStyle='rgba(200,250,255,.8)';g.lineWidth=2.2*u;g.lineCap='round';g.beginPath();g.moveTo(5*u,1*u);g.quadraticCurveTo(14*u,Math.sin(t*.08+ph)*6*u,20*u,-3*u);g.stroke();g.fillStyle='#3a5a7a';g.fillRect(-2.6*u,-1.2*u,1.6*u,1.6*u);g.fillRect(1*u,-1.2*u,1.6*u,1.6*u);g.restore()}
function gate(i,t){const G=LCG[i],a=GA()*s,x=GX(i)*s,base=GY-2*s,h=a*3.5,cy=base-h*.47,rx=a*.62,ry=a*1.33,op=G.open,pu=.5+.5*Math.sin(t*.07+i);
 g.save();
 g.save();g.translate(x,base+5*s);g.scale(1,.22);g.strokeStyle='rgba('+G.rgb+','+(op?.75:.4)+')';g.lineWidth=2.2*s/.22*.5;g.beginPath();g.arc(0,0,a*1.2,0,6.283);g.stroke();g.setLineDash([6*s,8*s]);g.lineDashOffset=-t*.3;g.beginPath();g.arc(0,0,a*.82,0,6.283);g.stroke();g.restore();
 glw(x,cy,a*3.1,(op?.28:.16)+.1*pu,G.rgb);
 [-1,1].forEach(d=>{const gr=g.createLinearGradient(x+d*a*.95-a*.16,0,x+d*a*.95+a*.16,0);gr.addColorStop(0,'#8e9bb6');gr.addColorStop(.45,'#f2f6ff');gr.addColorStop(1,'#7f8eac');g.fillStyle=gr;g.fillRect(x+d*a*.95-a*.16,base-h*.8,a*.32,h*.8);g.fillStyle='#b9c6dd';g.fillRect(x+d*a*.95-a*.22,base-h*.8,a*.44,a*.14);g.fillRect(x+d*a*.95-a*.22,base-a*.14,a*.44,a*.14);g.fillStyle='rgba('+G.rgb+','+(.5+.3*pu)+')';g.fillRect(x+d*a*.95-a*.025,base-h*.74,a*.05,h*.62)});
 const gr2=g.createLinearGradient(0,base-h,0,base-h*.7);gr2.addColorStop(0,'#f2f6ff');gr2.addColorStop(1,'#8e9bb6');g.fillStyle=gr2;g.beginPath();g.moveTo(x-a*1.18,base-h*.78);g.quadraticCurveTo(x-a*1.05,base-h*1.02,x,base-h*1.0);g.quadraticCurveTo(x+a*1.05,base-h*1.02,x+a*1.18,base-h*.78);g.lineTo(x+a*.72,base-h*.78);g.quadraticCurveTo(x,base-h*.9,x-a*.72,base-h*.78);g.closePath();g.fill();g.strokeStyle='rgba('+G.rgb+',.9)';g.lineWidth=Math.max(1.5,1.8*s);g.stroke();
 [-1,1].forEach(d=>{g.fillStyle='#dfe8f8';g.beginPath();g.moveTo(x+d*a*.3,base-h*.98);g.quadraticCurveTo(x+d*a*.9,base-h*1.3,x+d*a*1.15,base-h*1.1);g.quadraticCurveTo(x+d*a*.75,base-h*1.12,x+d*a*.2,base-h*.99);g.closePath();g.fill();g.strokeStyle='rgba('+G.rgb+',.8)';g.lineWidth=Math.max(1,1.3*s);g.stroke()});
 g.beginPath();g.ellipse(x,cy,rx,ry,0,0,6.283);const pg=g.createRadialGradient(x,cy,2,x,cy,ry);if(op){pg.addColorStop(0,'#ffffff');pg.addColorStop(.35,'rgba('+G.rgb+',.9)');pg.addColorStop(1,'rgba('+G.rgb+',.25)')}else{pg.addColorStop(0,'rgba('+G.rgb+',.5)');pg.addColorStop(1,'rgba(20,16,50,.9)')}g.fillStyle=pg;g.fill();g.lineWidth=Math.max(2,3*s);g.strokeStyle=G.c;g.shadowColor=G.c;g.shadowBlur=op?10+8*pu:5;g.stroke();g.shadowBlur=0;
 g.save();g.beginPath();g.ellipse(x,cy,rx,ry,0,0,6.283);g.clip();g.strokeStyle='rgba(255,255,255,'+(op?.6:.25)+')';g.lineWidth=Math.max(1,1.4*s);for(let j=0;j<4;j++){g.beginPath();g.ellipse(x,cy,rx*(.22+j*.2),ry*(.3+j*.2),t*.03*(j%2?1:-1)+j,0,4.4);g.stroke()}if(op){for(let k=0;k<10;k++){const p=((t*.012)+k*.1)%1,an=k*2.4+p*5,rr=(1-p)*ry;g.fillStyle='rgba(255,255,255,'+(.8*Math.sin(p*3.14))+')';g.beginPath();g.arc(x+Math.cos(an)*rr*.62,cy+Math.sin(an)*rr,(1.1+(k%3)*.5)*s,0,6.283);g.fill()}}g.restore();
 const jy=base-h*1.04,jg=g.createRadialGradient(x,jy,1,x,jy,a*.2);jg.addColorStop(0,'#fff');jg.addColorStop(.5,G.c);jg.addColorStop(1,'rgba('+G.rgb+',0)');g.fillStyle=jg;g.beginPath();g.arc(x,jy,a*.2,0,6.283);g.fill();
 [-1,1].forEach((d,j)=>{[[1.35,.62,.2],[1.15,.4,.14]].forEach(([dx,hh,ww],m)=>{g.save();const gr=g.createLinearGradient(0,base-a*hh*2.2,0,base);gr.addColorStop(0,'#f2ffff');gr.addColorStop(1,G.c);g.fillStyle=gr;const X=x+d*a*dx,Y=base+1*s,W2=a*ww,H2=a*hh*2.2;g.globalAlpha=.95;g.beginPath();g.moveTo(X-W2,Y);g.lineTo(X-W2*.6,Y-H2*.6);g.lineTo(X+d*W2*.1,Y-H2);g.lineTo(X+W2*.7,Y-H2*.55);g.lineTo(X+W2,Y);g.closePath();g.fill();g.restore()});glw(x+d*a*1.3,base-a*.5,a*.9,.22+.1*pu,G.rgb)});
 const ty=base-h*1.36-(PORT&&i%2?34*s:0);txt(G.e+' '+(PORT?G.sn:G.n),x,ty,Math.max(PORT?9.5:11,(PORT?11:13)*s),op?'#fff2c0':'#d8d0f0',1);txt(op?G.sub:'🔒 '+G.sub,x,ty+Math.max(13,14*s),Math.max(9,10.5*s),op?'#bff4ff':'#b8a8d8');
 if(tgt==i||op){g.fillStyle='#ffd54a';g.font='bold '+Math.max(12,14*s)+'px '+FONT;g.textAlign='center';g.fillText('▼',x,ty+Math.max(26,30*s)+Math.sin(t*.12)*3)}
 g.restore()}
function draw(){const t=fr,gy=GY,k=W+'|'+H+'|'+DPR+'|'+gy+'|'+(PORT?1:0);
 if(ck!==k){ck=k;cv=document.createElement('canvas');cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);const q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);stat(q)}
 g.drawImage(cv,0,0,W,H);aurora(t);sparkles(t);falls(t);CR.forEach((c,i)=>glw(c.x,c.y,50*s,.16+.1*Math.sin(t*.05+i),i%2?'140,200,255':'180,150,255'));
 /* mây trôi dưới sàn */
 g.save();for(let i=0;i<7;i++){const x=((i*173+t*(.15+(i%3)*.08))%(W+260))-130,y=gy+(34+(i%3)*14)*s+(H-gy)*.12*(i%2),w=(120+(i%4)*40)*s;g.fillStyle='rgba(255,236,236,'+(.5+.12*(i%3))+')';g.beginPath();g.ellipse(x,y,w*.5,16*s,0,0,6.283);g.ellipse(x-w*.28,y+4*s,w*.3,12*s,0,0,6.283);g.ellipse(x+w*.3,y+5*s,w*.32,11*s,0,0,6.283);g.fill()}g.restore();
 lanterns(t);sprite(W*.3+Math.sin(t*.012)*W*.07,gy*.58,t,0,'120,255,255');sprite(W*.74+Math.sin(t*.01+2)*W*.06,gy*.5,t,2,'255,170,240');
 for(let i=0;i<4;i++)gate(i,t);
 if(vt!=null){const a=(t%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s,(10+a*22)*s,(4+a*8)*s,0,0,6.28);g.stroke()}
 drawEP();hero();nameTag();
 const tx=PORT?'Chạm cổng để dịch chuyển':'Chạm cổng để dịch chuyển · nút 🏘 Làng để về Làng',ty=gy+(H-gy)*.55;g.font='bold '+Math.max(12,14*s)+'px '+FONT;g.textAlign='center';const tw=g.measureText(tx).width;g.fillStyle='#000b';g.fillRect(W/2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#ffe9a0';g.fillText(tx,W/2,ty)}

/* ---------- vào / ra / chạm ---------- */
function enter(){if(!started||!vil)return;on=true;tgt=-1;vt=null;vgo=-1;gateGo=0;try{twGoF=0}catch(e){}if(bo)tg();cam=0;P.atk=0;P.pe=null;P.x=cl(vw()*.06,40,vw()-40);P.hp=mx();P.mp=mm();DT.push({x:P.x,y:200,s:'🌀 Đến Thành Thị Linh Giới',c:'#8fe8ff',g:1,l:150})}
function leave(){on=false;tgt=-1;vt=null;vgo=-1;gateGo=0;P.x=cl(gateX(),40,vw()-40);P.atk=0;P.pe=null;DT.push({x:P.x,y:200,s:'🏘 Về Làng Thanh Vân',c:'#ffe9a0',g:1,l:110})}
function act(i){const G=LCG[i];if(G.go)G.go();else DT.push({x:P.x,y:200,s:'🔒 '+G.n+' — sắp mở, nội dung sẽ thêm sau',c:'#e0b0ff',g:1,l:150})}
function tap(e){if(!on||!vil||bo||!started)return;e.stopImmediatePropagation();e.stopPropagation();const px=e.offsetX,py=e.offsetY,a=GA()*s,gy=GY;tgt=-1;vgo=-1;
 for(let i=0;i<4;i++)if(Math.abs(px-GX(i)*s)<a*1.5&&py>gy-a*5.2&&py<gy+44*s){tgt=i;vt=cl(GX(i),40,vw()-40);return}
 vt=cl(px/s,40,vw()-40)}
return{on:()=>on,enter,leave,draw,tap,gates:LCG,
 step:()=>{if(!on)return;vgo=-1;gateGo=0;try{twGoF=0}catch(e){}},
 post:()=>{if(!on||tgt<0)return;if(mvDir)tgt=-1;else if(vt==null){const i=tgt;tgt=-1;if(Math.abs(P.x-cl(GX(i),40,vw()-40))<14)act(i)}},
 off:()=>{on=false;tgt=-1}}})();

(()=>{
const _ga=gateAct;gateAct=function(){if(lgDone()&&!LCT.on()){LCT.enter();return}_ga()};
const _vd=vdraw;vdraw=function(){if(LCT.on()){LCT.draw();return}_vd()};
const _vs=vstep;vstep=function(){LCT.step();_vs();LCT.post()};
const _st=step;step=function(){if(LCT.on()&&!vil)LCT.off();_st()};
const _ng=ng;ng=function(){LCT.off();_ng()};
const vlb=document.getElementById('vl'),_vl=vlb.onpointerdown;
vlb.onpointerdown=e=>{if(LCT.on()){e.stopPropagation();if(started)LCT.leave();return}_vl(e)};
})();
