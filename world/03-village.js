/* world/03-village.js */

/*==== THÔN TÂN THỦ v2: THANH VÂN TIÊN THÔN (dựng lại theo ảnh mẫu) ====*/
(function(){
const FV="KTH Serif,Songti SC,STKaiti,KaiTi,serif",FH="Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif";
const LBL=['Rèn Đúc','Tạp Hóa','Hiệu Thuốc','Quán Trọ','Bản Đồ'];
const sr=a=>()=>(a=(a*1664525+1013904223)%4294967296)/4294967296;
const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
const mkc=(w,h)=>{const o=document.createElement('canvas');o.width=w;o.height=h;return o};
function glw(q,x,y,r,a,c){q.save();q.globalCompositeOperation='lighter';const o=q.createRadialGradient(x,y,0,x,y,r);o.addColorStop(0,rgba(c||'#ffc060',a));o.addColorStop(1,rgba(c||'#ffc060',0));q.fillStyle=o;q.fillRect(x-r,y-r,2*r,2*r);q.restore()}
function mistB(q,y,h,a,c){const o=q.createLinearGradient(0,y-h,0,y);o.addColorStop(0,rgba(c||'#e6eef4',0));o.addColorStop(1,rgba(c||'#e6eef4',a));q.fillStyle=o;q.fillRect(0,y-h,W,h)}

/* ---------- mái cong chung ---------- */
function eave(q,cx,y,w,h,rf,lf,c1,c2,trim){
 const L=cx-w,Rr=cx+w,rl=w*rf;
 q.beginPath();q.moveTo(L-lf,y-lf*.9);
 q.quadraticCurveTo(cx-w*(.5+rf*.3),y+h*.05,cx-rl,y-h);q.lineTo(cx+rl,y-h);
 q.quadraticCurveTo(cx+w*(.5+rf*.3),y+h*.05,Rr+lf,y-lf*.9);
 q.quadraticCurveTo(cx,y+h*.13+2,L-lf,y-lf*.9);q.closePath();
 const o=q.createLinearGradient(0,y-h,0,y+h*.2);o.addColorStop(0,c1);o.addColorStop(1,c2);q.fillStyle=o;q.fill();
 q.save();q.clip();q.strokeStyle=rgba(c2,.6);q.lineWidth=Math.max(.6,w*.012);
 for(let j=-7;j<=7;j++){q.beginPath();q.moveTo(cx+j*rl/7,y-h);q.lineTo(cx+j*(w+lf)/7,y+h*.25);q.stroke()}
 q.strokeStyle='rgba(255,255,255,.14)';q.lineWidth=Math.max(.8,w*.02);q.beginPath();q.moveTo(cx-rl,y-h+1.2);q.lineTo(cx+rl,y-h+1.2);q.stroke();q.restore();
 q.strokeStyle=trim||'#e6b84e';q.lineWidth=Math.max(1,h*.09);q.beginPath();q.moveTo(L-lf,y-lf*.9);q.quadraticCurveTo(cx,y+h*.13+2,Rr+lf,y-lf*.9);q.stroke();
 q.fillStyle=trim||'#e6b84e';q.fillRect(cx-rl-1.5,y-h-2.2,2*rl+3,3.4);
 q.beginPath();q.arc(L-lf,y-lf*.9,Math.max(1.4,w*.02),0,6.283);q.arc(Rr+lf,y-lf*.9,Math.max(1.4,w*.02),0,6.283);q.fill()}

/* ---------- núi đá vôi (karst) ---------- */
function karst2(q,cx,base,w,h,c0,c1,veg,rnd){
 const n=16,L=[],Rt=[];
 for(let i=0;i<=n;i++){const t=i/n;let hw=w*.5*(.5+.32*(1-t)+(t<.14?(.14-t)/.14*.55:0))*(.92+rnd()*.16);
  if(t>.86){const f=(t-.86)/.14;hw*=Math.sqrt(Math.max(.015,1-f*f))}
  L.push([cx-hw,base-h*t]);Rt.push([cx+hw*(.94+rnd()*.12),base-h*t])}
 q.beginPath();q.moveTo(L[0][0],L[0][1]);
 for(let i=1;i<=n;i++){const a=L[i-1],b=L[i];q.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}
 q.lineTo(L[n][0],L[n][1]);
 for(let i=n-1;i>=0;i--){const a=Rt[i+1],b=Rt[i];q.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}
 q.closePath();
 let o=q.createLinearGradient(cx-w*.5,0,cx+w*.5,0);o.addColorStop(0,c1);o.addColorStop(1,c0);q.fillStyle=o;q.fill();
 q.save();q.clip();
 o=q.createLinearGradient(cx-w*.1,0,cx+w*.5,0);o.addColorStop(0,'rgba(12,22,44,0)');o.addColorStop(1,'rgba(12,22,44,.34)');q.fillStyle=o;q.fillRect(cx-w,base-h-4,w*2,h+8);
 q.strokeStyle='rgba(10,20,40,.10)';q.lineWidth=Math.max(1,w*.012);
 for(let k=0;k<9;k++){const x=cx+(rnd()-.5)*w*.7,hh=h*(.25+rnd()*.6);q.beginPath();q.moveTo(x,base);q.lineTo(x+(rnd()-.5)*8,base-hh);q.stroke()}
 q.strokeStyle='rgba(255,255,255,.10)';for(let k=0;k<4;k++){const x=cx-w*.3+rnd()*w*.3,hh=h*(.3+rnd()*.5);q.beginPath();q.moveTo(x,base);q.lineTo(x+(rnd()-.5)*6,base-hh);q.stroke()}
 q.restore();
 q.fillStyle=veg;const tw=w*.2;
 for(let j=0;j<9;j++){q.beginPath();q.ellipse(cx+(rnd()-.5)*tw*2,base-h*(.9+rnd()*.08),3+rnd()*w*.05,2+rnd()*w*.03,0,0,6.283);q.fill()}
 for(let j=0;j<5;j++){const t=.25+rnd()*.5;q.beginPath();q.ellipse(cx+(rnd()<.5?-1:1)*w*.3*(.6+(1-t)*.6),base-h*t,3+rnd()*5,2+rnd()*3,0,0,6.283);q.fill()}}

/* ---------- đình viện trên vách núi ---------- */
function pavS(q,x,y,w,h,wall,roof,rnd){q.fillStyle=wall;q.fillRect(x-w/2,y-h,w,h);q.fillStyle='rgba(60,30,20,.55)';q.fillRect(x-w/2,y-h,w*.14,h);q.fillRect(x+w/2-w*.14,y-h,w*.14,h);eave(q,x,y-h+1,w*.78,h*.62,.4,w*.14,roof,rgba(roof,1),'#d9a850')}
function cliffTemple(q,x,y,u,wall,roof){q.fillStyle='#7d889a';q.fillRect(x-70*u,y-5*u,140*u,6*u);
 pavS(q,x-34*u,y-5*u,30*u,22*u,wall,roof);pavS(q,x+30*u,y-5*u,34*u,26*u,wall,roof);pavS(q,x-2*u,y-5*u-14*u,28*u,24*u,wall,roof);
 q.strokeStyle='rgba(60,40,30,.5)';q.lineWidth=Math.max(1,u);q.beginPath();q.moveTo(x-70*u,y-5*u);q.lineTo(x+70*u,y-5*u);q.stroke()}
function smallPagoda(q,x,y,u,c1,c2){let yy=y;for(let i=0;i<4;i++){const w=(14-i*2.2)*u;q.fillStyle='#b0463a';q.fillRect(x-w*.7,yy-9*u,w*1.4,9*u);eave(q,x,yy-8*u,w+4*u,6*u,.5,3*u,c1,c2);yy-=12*u}q.fillStyle='#e6b84e';q.fillRect(x-.8*u,yy-8*u,1.6*u,10*u)}

/* ---------- tháp 9 tầng ---------- */
function pagoda(q,cx,by,u){
 const N=9,T=[];let y=by-14*u,bw=54*u;
 for(let i=0;i<N;i++){const bh=(i==0?34:i==N-1?22:24)*u,rh=(14-i*.4)*u,rw=bw+14*u;T.push({y,bh,rh,bw,rw});y=y-bh+4*u-rh;bw=rw*.62-1.5*u}
 const top=y;
 q.fillStyle='rgba(8,12,24,.28)';q.beginPath();q.ellipse(cx,by+1*u,112*u,10*u,0,0,6.283);q.fill();
 q.fillStyle='#737b8e';q.fillRect(cx-100*u,by-8*u,200*u,8*u);q.fillStyle='#9ea5b6';q.fillRect(cx-100*u,by-8*u,200*u,2.5*u);
 q.fillStyle='#8a92a4';q.fillRect(cx-86*u,by-14*u,172*u,6*u);q.fillStyle='#b4bac8';q.fillRect(cx-86*u,by-14*u,172*u,2*u);
 q.strokeStyle='rgba(20,26,44,.4)';q.lineWidth=Math.max(1,u*.8);for(let k=-4;k<=4;k++){q.beginPath();q.moveTo(cx+k*20*u,by-8*u);q.lineTo(cx+k*20*u,by);q.stroke()}
 for(let st=0;st<4;st++){q.fillStyle=st%2?'#8a92a4':'#a4abba';q.fillRect(cx-(26+st*3)*u,by-(2+st*0)*u,(52+st*6)*u,2.2*u)}
 for(let i=N-1;i>=0;i--){const a=T[i],bx=cx-a.bw,bwid=a.bw*2,ytop=a.y-a.bh;
  let o=q.createLinearGradient(bx,0,bx+bwid,0);o.addColorStop(0,'#cf4f38');o.addColorStop(.5,'#b53a2c');o.addColorStop(1,'#8d281f');q.fillStyle=o;q.fillRect(bx,ytop,bwid,a.bh);
  q.fillStyle='#6c1d16';const np=i==0?6:4;for(let k=0;k<=np;k++){q.fillRect(bx+k*(bwid-3*u)/np,ytop,3*u,a.bh)}
  const sp=(bwid-3*u)/np;
  for(let k=0;k<np;k++){const wx=bx+k*sp+3*u+2*u,ww=sp-3*u-4*u;
   if(i==0&&k==2){q.fillStyle='#2a120c';q.beginPath();q.moveTo(wx,a.y);q.lineTo(wx,ytop+14*u);q.quadraticCurveTo(wx+ww/2,ytop+4*u,wx+ww,ytop+14*u);q.lineTo(wx+ww,a.y);q.fill();q.fillStyle='rgba(255,190,100,.75)';q.fillRect(wx+2*u,ytop+16*u,ww-4*u,a.bh-18*u)}
   else{q.fillStyle='#3a1610';q.fillRect(wx,ytop+5*u,ww,a.bh-12*u);q.fillStyle='rgba(255,196,110,.82)';q.fillRect(wx+1.5*u,ytop+6.5*u,ww-3*u,a.bh-15*u);q.strokeStyle='rgba(90,40,20,.7)';q.lineWidth=Math.max(.7,.8*u);q.beginPath();q.moveTo(wx+ww/2,ytop+6*u);q.lineTo(wx+ww/2,ytop+a.bh-8*u);q.stroke()}}
  q.fillStyle='#d9a63e';q.fillRect(cx-a.bw-3*u,a.y-3.5*u,a.bw*2+6*u,3.5*u);
  q.strokeStyle='#b8862e';q.lineWidth=Math.max(.8,u*.9);q.beginPath();q.moveTo(cx-a.bw-3*u,a.y-9*u);q.lineTo(cx+a.bw+3*u,a.y-9*u);q.stroke();
  for(let b=-a.bw;b<=a.bw;b+=5*u){q.beginPath();q.moveTo(cx+b,a.y-9*u);q.lineTo(cx+b,a.y-3.5*u);q.stroke()}
  q.fillStyle='#7a3a22';q.fillRect(bx,ytop,bwid,4*u);q.fillStyle='#e0b24a';for(let b=0;b<bwid;b+=6*u)q.fillRect(bx+b,ytop+.5*u,3*u,3*u);
  eave(q,cx,ytop+4*u,a.rw,a.rh,.62,7*u,'#f3cd74','#b9802c','#fff0b0')}
 q.fillStyle='#d9a73a';q.fillRect(cx-2.6*u,top-24*u,5.2*u,26*u);
 for(let k=0;k<5;k++){q.fillStyle=k%2?'#f2c860':'#c8962e';q.beginPath();q.ellipse(cx,top-(6+k*4)*u,(8-k*1.2)*u,2.1*u,0,0,6.283);q.fill()}
 q.fillStyle='#f6d57a';q.beginPath();q.arc(cx,top-30*u,5*u,0,6.283);q.fill();q.beginPath();q.moveTo(cx-2.4*u,top-33*u);q.lineTo(cx,top-44*u);q.lineTo(cx+2.4*u,top-33*u);q.fill();
 return{cx,top:top-44*u,w:T[0].rw}}

/* ---------- cây ---------- */
function bigTree(q,x,by,u,d,seed,pink){
 const rnd=sr(seed);q.save();q.lineCap='round';
 q.strokeStyle='#33241d';q.lineWidth=30*u;q.beginPath();q.moveTo(x,by+8*u);q.quadraticCurveTo(x+d*46*u,by-110*u,x-d*14*u,by-215*u);q.stroke();
 q.strokeStyle='#4a3428';q.lineWidth=12*u;q.beginPath();q.moveTo(x+d*8*u,by);q.quadraticCurveTo(x+d*50*u,by-110*u,x-d*8*u,by-205*u);q.stroke();
 q.strokeStyle='#33241d';q.lineWidth=13*u;q.beginPath();q.moveTo(x+d*20*u,by-120*u);q.quadraticCurveTo(x+d*100*u,by-165*u,x+d*170*u,by-150*u);q.stroke();
 q.lineWidth=9*u;q.beginPath();q.moveTo(x-d*6*u,by-170*u);q.quadraticCurveTo(x+d*50*u,by-230*u,x+d*110*u,by-240*u);q.stroke();
 const cols=pink?['#2a5a3a','#3f7a4a','#5a9a58']:['#1c4430','#2c6a40','#4a9255'];
 for(let p=0;p<3;p++){q.fillStyle=cols[p];for(let k=0;k<(p==0?16:p==1?14:9);k++){const a=rnd()*6.283,r=rnd()*(120-p*18)*u,cx=x+d*(60*u)+Math.cos(a)*r*1.25,cy=by-205*u+Math.sin(a)*r*.46-p*6*u;q.beginPath();q.ellipse(cx,cy,(34+rnd()*28)*u,(16+rnd()*14)*u,0,0,6.283);q.fill()}}
 if(pink){const pc=['#f3b4c8','#ffd2de','#e895b0'];for(let k=0;k<46;k++){q.fillStyle=pc[k%3];const a=rnd()*6.283,r=rnd()*118*u;q.beginPath();q.arc(x+d*60*u+Math.cos(a)*r*1.2,by-205*u+Math.sin(a)*r*.46,(3.5+rnd()*5)*u,0,6.283);q.fill()}}
 q.fillStyle='rgba(180,230,140,.28)';for(let k=0;k<14;k++){q.beginPath();q.ellipse(x+d*(20+rnd()*110)*u,by-(215+rnd()*20)*u,(10+rnd()*14)*u,(4+rnd()*5)*u,0,0,6.283);q.fill()}
 q.restore()}
function blossom(q,x,by,u,seed){const rnd=sr(seed);q.lineCap='round';q.strokeStyle='#4a3428';q.lineWidth=7*u;q.beginPath();q.moveTo(x,by);q.quadraticCurveTo(x+8*u,by-30*u,x-4*u,by-58*u);q.stroke();
 const pc=['#f6bccd','#ffd8e2','#ec9db8','#fbe6ec'];for(let k=0;k<54;k++){q.fillStyle=pc[k%4];q.beginPath();q.arc(x+(rnd()-.5)*84*u,by-70*u+(rnd()-.5)*44*u,(4+rnd()*6)*u,0,6.283);q.fill()}}

/* ---------- lớp nền tĩnh (cache) ---------- */
let C1=null,C2=null,CK='',PG=null;
function drawBack(q,gy){
 const u=s,rnd=sr(11);
 let o=q.createLinearGradient(0,0,0,gy);o.addColorStop(0,'#1d3560');o.addColorStop(.35,'#3b5f8e');o.addColorStop(.7,'#86a6c2');o.addColorStop(1,'#d3dcdf');q.fillStyle=o;q.fillRect(0,0,W,H);
 q.fillStyle='rgba(20,36,70,.30)';for(let i=0;i<9;i++){q.beginPath();q.ellipse(rnd()*W,rnd()*gy*.32,(120+rnd()*180)*u,(16+rnd()*22)*u,0,0,6.283);q.fill()}
 glw(q,W*.72,gy*.42,260*u,.30,'#ffe3b0');
 const far=[[.02,.2,330],[.17,.17,270],[.33,.2,390],[.5,.16,300],[.66,.2,360],[.82,.17,280],[.97,.2,340]];
 far.forEach(a=>karst2(q,W*a[0],gy-40*u,a[1]*W*1.5,a[2]*u,'#8ea8c2','#b2c4d6','#6f8e8c',rnd));
 smallPagoda(q,W*.835,gy-40*u-280*u*.9,.8*u,'#c4846a','#8a5a46');
 mistB(q,gy-40*u,170*u,.5);
 const mid=[[.0,.15,250],[.13,.15,310],[.28,.16,230],[.42,.14,300],[.58,.15,240],[.72,.16,320],[.88,.15,260],[1,.13,290]];
 mid.forEach(a=>karst2(q,W*a[0],gy-34*u,a[1]*W*1.6,a[2]*u,'#5d7898','#7d97b3','#3d6a56',rnd));
 cliffTemple(q,W*.14,gy-34*u-304*u*.96,.62*u,'#d8cfbc','#4a587c');
 cliffTemple(q,W*.74,gy-34*u-312*u*.96,.5*u,'#d8cfbc','#4a587c');
 mistB(q,gy-34*u,110*u,.45);
 const near=[[.03,.14,170],[.3,.12,130],[.7,.12,150],[.96,.14,190]];
 near.forEach(a=>karst2(q,W*a[0],gy-26*u,a[1]*W*1.5,a[2]*u,'#3f587a','#5b7491','#2b5444',rnd));
 mistB(q,gy-26*u,80*u,.42)}
function houses(q,y0,u,rnd){
 for(let x=-30*u;x<W+40*u;x+=(52+rnd()*36)*u){const w=(32+rnd()*20)*u,h=(24+rnd()*26)*u,rh=(15+rnd()*10)*u;
  let o=q.createLinearGradient(0,y0-h,0,y0);o.addColorStop(0,'#cfcab8');o.addColorStop(1,'#9d9a90');q.fillStyle=o;q.fillRect(x-w/2,y0-h,w,h);
  q.fillStyle='rgba(50,30,24,.6)';q.fillRect(x-w/2,y0-h,3*u,h);q.fillRect(x+w/2-3*u,y0-h,3*u,h);
  q.fillStyle='rgba(255,196,110,.55)';q.fillRect(x-w*.22,y0-h*.62,w*.44,h*.3);
  eave(q,x,y0-h+3*u,w*.72,rh,.4,5*u,'#56668e','#2e3a5c','#caa24a')}}
function paving(q,y0,u,rnd){
 const N=13,hh=H-y0;let o=q.createLinearGradient(0,y0,0,H);o.addColorStop(0,'#a9b2c2');o.addColorStop(1,'#4a5266');q.fillStyle=o;q.fillRect(0,y0,W,hh);
 for(let r=0;r<N;r++){const ya=y0+hh*Math.pow(r/N,1.7),yb=y0+hh*Math.pow((r+1)/N,1.7),sw=(20+r*13)*u*(.8+rnd()*.5);
  let x=-((r%2)?sw*.5:0)-rnd()*sw*.3;
  while(x<W+sw){const w=sw*(.7+rnd()*.7),tone=(rnd()-.5)*26,f=r/N;
   const R=Math.round(120+f*-34+tone),Gc=Math.round(130+f*-36+tone),B=Math.round(152+f*-38+tone+4);
   q.fillStyle='rgb('+R+','+Gc+','+B+')';q.fillRect(x+.6,ya+.4,w-1.2,yb-ya-.8);
   q.fillStyle='rgba(255,255,255,'+(.10+(1-f)*.10)+')';q.fillRect(x+.6,ya+.4,w-1.2,Math.max(1,(yb-ya)*.12));
   q.fillStyle='rgba(8,12,28,.10)';q.fillRect(x+w*.55,ya+.4,w*.45-.6,yb-ya-.8);
   if(rnd()<.14){q.strokeStyle='rgba(20,24,40,.35)';q.lineWidth=Math.max(.6,u*.8);q.beginPath();let cx=x+rnd()*w,cy=ya+(yb-ya)*.2;q.moveTo(cx,cy);for(let k=0;k<3;k++){cx+=(rnd()-.5)*w*.3;cy+=(yb-ya)*.3;q.lineTo(cx,cy)}q.stroke()}
   if(rnd()<.10){q.fillStyle='rgba(88,128,76,.22)';q.beginPath();q.ellipse(x+rnd()*w,yb-(yb-ya)*.2,w*.18,(yb-ya)*.12,0,0,6.283);q.fill()}
   x+=w}}
 q.strokeStyle='rgba(18,22,40,.4)';q.lineWidth=Math.max(1,u*1.2);for(let r=1;r<N;r++){const yy=y0+hh*Math.pow(r/N,1.7);q.beginPath();q.moveTo(0,yy);q.lineTo(W,yy);q.stroke()}
 o=q.createLinearGradient(0,y0,0,y0+60*u);o.addColorStop(0,'rgba(230,238,244,.5)');o.addColorStop(1,'rgba(230,238,244,0)');q.fillStyle=o;q.fillRect(0,y0,W,60*u);
 o=q.createLinearGradient(0,H-hh*.3,0,H);o.addColorStop(0,'rgba(8,12,28,0)');o.addColorStop(1,'rgba(8,12,28,.4)');q.fillStyle=o;q.fillRect(0,H-hh*.3,W,hh*.3)}
function drawFront(q,gy){
 const u=s,rnd=sr(23),y0=gy-54*u;
 paving(q,y0,u,rnd);
 houses(q,y0,u,rnd);
 mistB(q,y0,70*u,.28);
 PG=window.TWPG=pagoda(q,W*.5,y0+4*u,u*.92);
 blossom(q,W*.405,y0+4*u,u*1.15,5);blossom(q,W*.78,y0+6*u,u,9);
 bigTree(q,W*.035,gy-10*u,u*1.05,1,31,0);
 bigTree(q,W*1.02,gy-4*u,u*.85,-1,47,1)}
function layers(gy){const k=W+'|'+H+'|'+DPR+'|'+gy;if(k===CK)return;CK=k;
 C1=mkc(Math.round(W*DPR),Math.round(H*DPR));C2=mkc(Math.round(W*DPR),Math.round(H*DPR));
 const a=C1.getContext('2d'),b=C2.getContext('2d');a.setTransform(DPR,0,0,DPR,0,0);b.setTransform(DPR,0,0,DPR,0,0);
 drawBack(a,gy);drawFront(b,gy)}

/* ---------- tiên nhân ngự kiếm ---------- */
/* ---------- tiên nhân ngự kiếm (dựng lại: dáng người thật, hán phục, tóc dài, tay áo + dải lụa bay) ---------- */
const imSh=(h,f)=>{const n=parseInt(h.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const m=f<0?0:255,k=Math.abs(f);return'rgb('+Math.round(r+(m-r)*k)+','+Math.round(gg+(m-gg)*k)+','+Math.round(b+(m-b)*k)+')'};
function imBez(q,p){q.beginPath();q.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++){const a=p[i];if(a.length==4)q.quadraticCurveTo(a[0],a[1],a[2],a[3]);else if(a.length==6)q.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);else q.lineTo(a[0],a[1])}q.closePath()}
function immo(x,y,u,dir,kind,c1,c2,al){const A=al==null?1:al;const t=fr,ph=x*.01,w=Math.sin(t*.08+ph),w2=Math.sin(t*.11+ph+1.7),w3=Math.sin(t*.14+ph+3.1);
 const OL='rgba(28,34,66,.62)',SK='#f3d9c4',SKD='#d9b49c',HAIR='#17121f',main=imSh(c2,-.04),mainD=imSh(c2,-.22),mainL=imSh(c2,.45),inner='#fbfdff',accent=imSh(c2,-.5);
 const fill=(p,a,b,y1,y2,ol)=>{const q=g.createLinearGradient(0,y1,0,y2);q.addColorStop(0,a);q.addColorStop(1,b);imBez(g,p);g.fillStyle=q;g.fill();if(ol!==0){g.lineWidth=.9;g.strokeStyle=OL;g.lineJoin='round';g.stroke()}};
 g.save();g.globalAlpha=A;g.translate(x,y);g.scale(u*dir*.8,u*.8);g.translate(0,Math.sin(t*.03+ph)*1.8);g.lineCap='round';g.lineJoin='round';
 // vệt gió + vệt sáng phía sau
 let q=g.createLinearGradient(-150,0,-10,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(1,c1);g.globalAlpha=A*(.5);g.fillStyle=q;g.beginPath();g.moveTo(-150,2);g.quadraticCurveTo(-70,-6,-8,-1);g.lineTo(-8,8);g.quadraticCurveTo(-70,10,-150,5);g.fill();g.globalAlpha=A*(1);
 g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;for(let i=0;i<4;i++){const o=((t*1.5+i*41)%100);g.globalAlpha=A*(.55*(1-o/100));g.beginPath();g.moveTo(-26-o,-6-i*17);g.lineTo(-58-o,-6-i*17+w*2);g.stroke()}g.globalAlpha=A*(1);
 // vật cưỡi: kiếm / mây
 if(kind==0){
  glw(g,6,4,46,.38,'#cfe8ff');
  q=g.createLinearGradient(0,-1,0,9);q.addColorStop(0,'#ffffff');q.addColorStop(.5,'#c4d6ea');q.addColorStop(1,'#7f98b8');
  g.beginPath();g.moveTo(-40,1);g.lineTo(38,0);g.quadraticCurveTo(52,3,62,6);g.quadraticCurveTo(46,9.5,34,9);g.lineTo(-40,8);g.closePath();g.fillStyle=q;g.fill();g.lineWidth=.8;g.strokeStyle=OL;g.stroke();
  g.strokeStyle='rgba(60,90,140,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(-36,4.6);g.lineTo(52,5.4);g.stroke();
  g.fillStyle=c1;for(let i=0;i<5;i++){g.globalAlpha=A*(.5+.5*Math.sin(t*.12+i));g.beginPath();g.arc(-24+i*15,4.6,1.1,0,6.283);g.fill()}g.globalAlpha=A*(1);
  g.fillStyle='#e6b84e';g.fillRect(-42,-2.5,4.4,13.5);g.strokeStyle=OL;g.strokeRect(-42,-2.5,4.4,13.5);
  g.strokeStyle='#d44a3c';g.lineWidth=1.8;g.beginPath();g.moveTo(-44,5);g.quadraticCurveTo(-58,3+w*3,-70,8+w2*5);g.stroke();
 }else{
  g.fillStyle='rgba(255,255,255,.94)';for(const a of[[-14,6,22,7],[10,4,20,6],[-2,10,24,6]]){g.beginPath();g.ellipse(a[0],a[1],a[2],a[3],0,0,6.28);g.fill()}
 }
 // thân nghiêng nhẹ về phía trước
 g.save();g.translate(0,2);g.rotate(.07+w*.012);
 const HX=7,HY=-76;
 // dải lụa phi bạch bay sau lưng
 g.save();g.globalAlpha=A*(.8);for(let k=0;k<2;k++){g.strokeStyle=k?'rgba(255,255,255,.9)':c1;g.lineWidth=k?2:4.2;g.beginPath();g.moveTo(2,-63);g.bezierCurveTo(-22,-56+w*4,-40,-68+w2*7,-66,-56+w3*9);g.bezierCurveTo(-80,-50+w*8,-92,-58+w2*6,-104,-50+w3*5);g.stroke()}g.restore();
 // tóc dài thả sau
 imBez(g,[[HX-3,HY-6],[HX-26,HY-4+w*2,HX-50,HY+10+w2*5],[HX-62+w*4,HY+22+w3*8,HX-72,HY+30+w2*8],[HX-60,HY+30+w*5,HX-34,HY+22+w2*3],[HX-12,HY+12,HX-4,HY+8]]);
 g.fillStyle=HAIR;g.fill();g.lineWidth=.7;g.strokeStyle='rgba(0,0,0,.6)';g.stroke();
 g.strokeStyle='rgba(120,110,160,.55)';g.lineWidth=.7;for(let k=0;k<3;k++){g.beginPath();g.moveTo(HX-6,HY-1+k*3);g.bezierCurveTo(HX-28,HY+3+k*3+w*2,HX-48,HY+13+k*5+w2*4,HX-70+w*3,HY+27+k*3+w3*7);g.stroke()}
 // tay áo sau (tay xa) buông về sau
 fill([[1,-64],[-9,-62,-22,-56+w*2],[-38,-52+w2*3,-50,-44+w3*5],[-34,-38+w*3,-20,-42],[-8,-46,-2,-52]],mainD,imSh(c2,-.5),-64,-40);
 // chân sau + giày
 fill([[-12,-30],[-4,-30],[-5,-6],[-13,-6]],inner,'#c9d4e4',-30,-6);
 fill([[-14,-7],[-3,-7],[0,-1],[-1,2],[-15,2],[-17,-1]],'#2a2432','#15121c',-7,2,0);
 // vạt áo choàng dài bay phấp phới
 fill([[-4,-44],[-8,-24,-12,-6],[-30+w2*4,-3+w*3,-52+w*7,-14+w3*6],[-66+w3*8,-24+w2*5,-80+w*9,-17+w3*7],[-48+w2*5,-31+w*4,-30,-36],[-16,-40,-4,-44]],main,mainD,-44,-4);
 // vạt trước + xẻ tà để lộ áo trong
 fill([[3,-44],[9,-30,14,-8],[7,-5,-1,-4],[-6,-5,-12,-7],[-9,-24,-5,-44]],mainL,main,-44,-4);
 fill([[3,-42],[5,-28,5,-6],[0,-5,-4,-6],[-3,-24,-2,-42]],inner,'#d6e0ee',-42,-6,0);
 g.strokeStyle=accent;g.lineWidth=1.2;g.beginPath();g.moveTo(14,-9);g.quadraticCurveTo(5,-4,-12,-7);g.stroke();
 // thân trên + cổ áo chéo
 fill([[-3,-63],[8,-65],[10,-55,8,-46],[4,-43,-4,-44],[-5,-52,-3,-63]],main,mainD,-65,-43);
 imBez(g,[[3,-67],[8,-66],[10,-58],[6,-48],[3,-49],[6,-58]]);g.fillStyle=inner;g.fill();g.lineWidth=.7;g.strokeStyle=OL;g.stroke();
 g.strokeStyle=accent;g.lineWidth=1.1;g.beginPath();g.moveTo(3,-66);g.quadraticCurveTo(-1,-56,2,-47);g.stroke();
 // đai lưng + ngọc bội + dây lụa đỏ
 fill([[-4,-48],[8,-48],[9,-43],[-4,-43]],accent,imSh(c2,-.7),-48,-43);
 g.fillStyle='#e6b84e';g.fillRect(2.6,-47.6,3.4,4.2);
 g.strokeStyle='#d44a3c';g.lineWidth=1.8;g.beginPath();g.moveTo(-3,-45);g.bezierCurveTo(-18,-44+w*3,-30,-40+w2*5,-44,-36+w3*6);g.stroke();
 g.strokeStyle='#8a7a5a';g.lineWidth=.8;g.beginPath();g.moveTo(8,-43);g.lineTo(9,-36);g.stroke();g.fillStyle='#7fe0b0';g.beginPath();g.ellipse(9,-34,1.8,2.6,0,0,6.283);g.fill();g.strokeStyle=OL;g.lineWidth=.6;g.stroke();
 // chân trước + giày
 fill([[6,-14],[12,-14],[13,-5],[6,-5]],inner,'#c9d4e4',-14,-5,0);
 fill([[5,-7],[16,-7],[19,-3],[21,1],[4,2],[3,-3]],'#2a2432','#15121c',-7,2,0);
 // cổ + đầu
 g.fillStyle=SKD;g.fillRect(4.2,-69,4,5);
 q=g.createRadialGradient(HX+2,HY-2,1,HX,HY,8);q.addColorStop(0,'#fff0e2');q.addColorStop(1,SK);g.fillStyle=q;g.beginPath();g.ellipse(HX,HY,5.4,6.6,.1,0,6.283);g.fill();g.lineWidth=.7;g.strokeStyle='rgba(120,70,60,.55)';g.stroke();
 g.fillStyle=SK;g.beginPath();g.moveTo(HX+4.8,HY);g.lineTo(HX+7,HY+1.8);g.lineTo(HX+4.9,HY+2.6);g.closePath();g.fill();g.stroke();
 g.fillStyle='rgba(255,140,140,.35)';g.beginPath();g.ellipse(HX+2,HY+3.2,2,1.3,0,0,6.283);g.fill();
 g.strokeStyle='#1a1018';g.lineWidth=.9;g.beginPath();g.moveTo(HX+1.2,HY-2.4);g.quadraticCurveTo(HX+3.4,HY-3.6,HX+5.2,HY-2.2);g.stroke();
 g.fillStyle='#120a10';g.beginPath();g.ellipse(HX+3.2,HY-.6,1.1,.8,0,0,6.283);g.fill();g.strokeStyle='#120a10';g.lineWidth=.6;g.beginPath();g.moveTo(HX+1.8,HY-1.2);g.lineTo(HX+4.5,HY-1.4);g.stroke();
 g.strokeStyle='#b0505a';g.lineWidth=.8;g.beginPath();g.moveTo(HX+3,HY+4.2);g.lineTo(HX+4.6,HY+4.1);g.stroke();
 g.fillStyle=SKD;g.beginPath();g.ellipse(HX-1.6,HY+.8,1.2,1.8,0,0,6.283);g.fill();
 // tóc trên đầu + búi + kim quan + dải lụa
 imBez(g,[[HX+5,HY-3.6],[HX+3,HY-8,HX-2,HY-8],[HX-6.4,HY-6,HX-6.6,HY+1],[HX-5,HY+3,HX-3.4,HY+8],[HX-3,HY+2,HX-2.6,HY-2],[HX,HY-4.6,HX+3,HY-4.4]]);g.fillStyle=HAIR;g.fill();g.lineWidth=.7;g.strokeStyle='rgba(0,0,0,.6)';g.stroke();
 g.fillStyle=HAIR;g.beginPath();g.ellipse(HX-2.4,HY-10,3.2,3.6,0,0,6.283);g.fill();g.stroke();
 g.fillStyle='#e6b84e';g.fillRect(HX-4.6,HY-8.2,5,2.4);g.strokeStyle=OL;g.strokeRect(HX-4.6,HY-8.2,5,2.4);
 g.strokeStyle='#e6b84e';g.lineWidth=1;g.beginPath();g.moveTo(HX-6.5,HY-10);g.lineTo(HX+3,HY-9);g.stroke();
 g.strokeStyle=c1;g.lineWidth=1.8;g.globalAlpha=A*(.9);for(let k=0;k<2;k++){g.beginPath();g.moveTo(HX-3,HY-8.6);g.bezierCurveTo(HX-22,HY-8+w*3+k*4,HX-34,HY-2+w2*6+k*5,HX-46,HY+6+w3*7+k*3);g.stroke()}g.globalAlpha=A*(1);
 // tay gần: kiếm quyết, tay áo rộng bay
 fill([[2,-65],[13,-64,24,-64],[30,-63,31,-58],[30,-53,24,-51],[18,-46+w*2,8,-46+w2*3],[-4,-47+w3*4,-18,-50+w*4],[-26,-53+w2*3,-30,-49+w3*4],[-14,-56,-2,-58]],main,mainD,-64,-46);
 fill([[3,-63],[13,-61,22,-61],[26,-60,26,-57],[18,-57,10,-56],[4,-57,3,-63]],mainL,main,-63,-56,0);
 g.strokeStyle=accent;g.lineWidth=1.1;g.beginPath();g.moveTo(31,-62);g.quadraticCurveTo(33,-57,29,-52);g.stroke();
 g.fillStyle=SK;g.beginPath();g.ellipse(33.5,-57.6,3,2.4,.3,0,6.283);g.fill();g.lineWidth=.7;g.strokeStyle='rgba(120,70,60,.6)';g.stroke();
 g.strokeStyle=SK;g.lineWidth=1.7;g.beginPath();g.moveTo(35,-58.6);g.lineTo(43,-62.4);g.moveTo(35,-57.2);g.lineTo(42.4,-59.4);g.stroke();
 glw(g,43,-62,12,.55+.2*Math.sin(t*.15),'#e8ffff');
 g.restore();
 g.restore()}

/* ---------- nền động ---------- */
function vBg(gy){
 layers(gy);const u=s,t=fr;
 g.drawImage(C1,0,0,W,H);
 g.save();g.fillStyle='#fff';
 for(let i=0;i<7;i++){const x=((i*263+t*(.12+i%3*.07))%(W+560))-280,y=gy*(.06+(i*.13)%.5);g.globalAlpha=.11;g.beginPath();g.ellipse(x,y,210*u,19*u,0,0,6.283);g.fill();g.beginPath();g.ellipse(x+70*u,y-10*u,120*u,14*u,0,0,6.283);g.fill()}
 for(let i=0;i<4;i++){const x=((i*397+t*(.25+i*.06))%(W+700))-350,y=gy-(60+i*52)*u;g.globalAlpha=.22;g.beginPath();g.ellipse(x,y,260*u,20*u,0,0,6.283);g.fill();g.beginPath();g.ellipse(x+120*u,y+8*u,180*u,15*u,0,0,6.283);g.fill()}
 g.restore();
 const IMC=[['rgba(150,230,255,.8)','#e8f4ff'],['rgba(255,220,150,.8)','#f6d98a'],['rgba(170,255,210,.8)','#d8f4e0'],['rgba(255,190,220,.8)','#f6d8e6'],['rgba(200,180,255,.8)','#e4daf8']];
  /* [vị trí đầu, độ cao, hướng, vật cưỡi, màu, tỉ lệ, tốc độ, độ mờ xa] — xa → gần */
  [[.08,.3,1,0,0,.2,.14,.5],[.62,.36,-1,0,3,.22,.17,.55],[.35,.46,1,1,4,.25,.12,.6],[.85,.28,-1,0,2,.24,.15,.55],
   [.2,.42,-1,0,1,.34,.26,.8],[.74,.52,1,0,0,.36,.3,.85],[.5,.34,-1,1,3,.33,.22,.8],
   [.42,.5,1,0,0,.5,.45,1],[.9,.58,-1,0,1,.46,.38,1]].forEach((a,i)=>{const L=W+500,o=((a[0]*L+t*a[6])%L),c=IMC[a[4]];immo(a[2]>0?o-250:W+250-o,gy*a[1]+Math.sin(t*.01+i*2)*(4+a[5]*14)*u,a[5]*u,a[2],a[3],c[0],c[1],a[7])});
 g.drawImage(C2,0,0,W,H);
 if(PG){const ox=PG.cx,oy=PG.top-12*u;
  for(let i=0;i<3;i++){const a=t*.025+i*2.09,x=ox+Math.cos(a)*30*u,y=oy+Math.sin(a)*11*u;glw(g,x,y,17*u,.8,'#ffd890');g.fillStyle='#fff4c8';g.beginPath();g.arc(x,y,3.4*u,0,6.283);g.fill()}
  glw(g,ox,PG.top+6*u,38*u,.35+.12*Math.sin(t*.06),'#ffd890')}
}
const _xb=xbg;xbg=function(gy,m){m==-1?vBg(gy):_xb(gy,m)};

/* ---------- đèn lồng ---------- */
function lantern(q,x,y,sc,t,ph){const sw=Math.sin(t*.05+ph)*2.2*sc;q.save();q.translate(x,y);q.strokeStyle='#4a2a14';q.lineWidth=1*sc;q.beginPath();q.moveTo(0,0);q.lineTo(sw*.4,6*sc);q.stroke();q.translate(sw*.4,6*sc);q.rotate(sw*.05);
 const o=q.createRadialGradient(0,7*sc,1,0,7*sc,10*sc);o.addColorStop(0,'#ffc070');o.addColorStop(1,'#c4301e');
 q.fillStyle='#e6b84e';q.fillRect(-3.6*sc,0,7.2*sc,2*sc);q.fillStyle=o;q.beginPath();q.ellipse(0,8*sc,6*sc,7.5*sc,0,0,6.283);q.fill();q.fillStyle='#e6b84e';q.fillRect(-3.6*sc,14.5*sc,7.2*sc,2*sc);
 q.strokeStyle='#e8584a';q.lineWidth=.9*sc;q.beginPath();q.moveTo(0,16.5*sc);q.lineTo(0,23*sc);q.stroke();q.restore();
 glw(q,x+sw*.4,y+14*sc,17*sc,.34+.1*Math.sin(t*.2+ph),'#ff8a40')}

/* ---------- cửa hàng ---------- */
const SH=[{w:'#e1d4b8',f:'#6b2a1c',r1:'#7183ae',r2:'#35416c'},{w:'#e8dcc0',f:'#7a4a22',r1:'#7183ae',r2:'#3a4670'},{w:'#dde5cf',f:'#2d6a58',r1:'#5ec6a8',r2:'#1f7a64'},{w:'#e6d8bf',f:'#5a2a22',r1:'#6c7aa2',r2:'#313c62'}];
function shop(q,i,t){
 const S=SH[i];
 q.fillStyle='#7c8496';q.fillRect(-66,-9,132,9);q.fillStyle='#a9afbe';q.fillRect(-66,-9,132,3);q.fillStyle='#6a7184';q.fillRect(-28,0,56,3);
 q.fillStyle=S.w;q.fillRect(-30,-114,60,56);q.fillStyle=S.f;q.fillRect(-32,-116,5,60);q.fillRect(27,-116,5,60);
 let o=q.createLinearGradient(0,-62,0,-9);o.addColorStop(0,S.w);o.addColorStop(1,'#cfc3a8');q.fillStyle=o;q.fillRect(-50,-62,100,53);
 q.fillStyle=S.f;q.fillRect(-52,-64,7,56);q.fillRect(45,-64,7,56);q.fillRect(-52,-66,104,6);
 if(i==0){
  q.fillStyle='#22140e';q.fillRect(-42,-56,58,47);q.fillStyle='#3a2418';for(let r=0;r<4;r++)q.fillRect(-42,-54+r*11,58,1);
  const f=.78+.22*Math.sin(t*.31)+.08*Math.sin(t*.77);
  q.fillStyle='#4c4c58';q.fillRect(-32,-32,36,23);q.fillStyle='#34343e';q.fillRect(-32,-32,36,3);
  o=q.createLinearGradient(0,-26,0,-14);o.addColorStop(0,'rgba(255,230,120,'+f+')');o.addColorStop(1,'rgba(255,90,20,'+f+')');q.fillStyle=o;q.fillRect(-26,-26,24,12);
  glw(q,-14,-22,54,.5*f,'#ff8a30');glw(q,-14,-20,22,.55*f,'#ffd070');
  q.strokeStyle='#5a4a40';q.lineWidth=1.5;for(let k=0;k<4;k++){q.beginPath();q.moveTo(-36+k*6,-54);q.lineTo(-36+k*6,-46-k%2*5);q.stroke()}
  q.fillStyle='#2e2e3a';q.beginPath();q.moveTo(26,-14);q.lineTo(46,-14);q.lineTo(42,-9);q.lineTo(32,-9);q.fill();q.fillRect(30,-9,8,7);
  q.fillStyle='#ff7a30';for(let k=0;k<3;k++){const p=(t*.9+k*13)%36;q.globalAlpha=1-p/36;q.fillRect(-18+k*7+Math.sin(t*.2+k)*3,-26-p,2,2)}q.globalAlpha=1;
  q.fillStyle=S.w;q.fillRect(22,-54,24,28);q.strokeStyle=S.f;q.lineWidth=1.5;q.strokeRect(22,-54,24,28);q.beginPath();q.moveTo(34,-54);q.lineTo(34,-26);q.moveTo(22,-40);q.lineTo(46,-40);q.stroke()}
 else if(i==1){
  q.fillStyle='#2c1c12';q.fillRect(-42,-56,84,47);q.fillStyle='#4a3020';q.fillRect(-42,-44,84,2);q.fillRect(-42,-32,84,2);
  const jc=['#c8602a','#6aa04a','#d8b84a','#a04a8a','#4a8ac8'];for(let k=0;k<10;k++){q.fillStyle=jc[k%5];q.beginPath();q.arc(-36+k*8.2,-47,3.2,0,6.283);q.fill();q.beginPath();q.arc(-36+k*8.2+(k%2?3:-2),-35,2.8,0,6.283);q.fill()}
  q.fillStyle='#8a5a2e';q.fillRect(-42,-24,84,15);q.fillStyle='#a8743a';q.fillRect(-42,-24,84,3);
  for(let k=0;k<7;k++){q.fillStyle=jc[(k+2)%5];q.beginPath();q.ellipse(-34+k*11,-26,3.6,2.6,0,0,6.283);q.fill()}
  for(let k=0;k<7;k++){q.fillStyle=k%2?'#b8342a':'#eadfc0';q.beginPath();q.moveTo(-50+k*14.3,-62);q.lineTo(-35.7+k*14.3,-62);q.lineTo(-35.7+k*14.3,-52);q.quadraticCurveTo(-42.8+k*14.3,-46,-50+k*14.3,-52);q.fill()}
  q.fillStyle='#e0802a';for(let k=0;k<5;k++){q.beginPath();q.ellipse(-30+k*15,-44+Math.sin(t*.05+k)*.8,2.6,4,0,0,6.283);q.fill()}
  q.fillStyle='#a8743a';q.beginPath();q.ellipse(-60,-8,8,6,0,0,6.283);q.ellipse(-54,-14,7,5,0,0,6.283);q.fill();q.fillStyle='#c89458';q.beginPath();q.ellipse(-62,-12,3,2,0,0,6.283);q.fill();
  q.fillStyle='#8a5a30';q.fillRect(50,-18,13,18);q.strokeStyle='#5a3a1c';q.lineWidth=1;q.strokeRect(50,-18,13,18);q.beginPath();q.moveTo(50,-9);q.lineTo(63,-9);q.stroke()}
 else if(i==2){
  q.fillStyle='#4a2e1c';q.fillRect(-42,-56,84,47);
  for(let r=0;r<4;r++)for(let c=0;c<8;c++){q.fillStyle=(r+c)%2?'#7a4e2c':'#6a4224';q.fillRect(-41+c*10.4,-55+r*9.2,9.8,8.6);q.fillStyle='#e0b24a';q.fillRect(-37+c*10.4,-52+r*9.2,2,2)}
  q.fillStyle='#8a5a2e';q.fillRect(-42,-20,84,11);q.fillStyle='#a8743a';q.fillRect(-42,-20,84,2.5);
  q.fillStyle='#6aa04a';for(let k=0;k<7;k++){q.beginPath();q.ellipse(-40+k*13,-60+Math.sin(t*.06+k)*.7,2.6,7,0,0,6.283);q.fill()}q.fillStyle='#8a6a3a';for(let k=0;k<4;k++)q.fillRect(-34+k*22,-62,2,3);
  q.strokeStyle='#8a6a3a';q.lineWidth=1.2;q.beginPath();q.moveTo(56,-64);q.lineTo(56,-52);q.stroke();q.fillStyle='#e0902a';q.beginPath();q.arc(56,-47,4.4,0,6.283);q.arc(56,-39,6,0,6.283);q.fill();q.fillStyle='#fff';q.fillRect(54,-52,4,2.4);
  q.fillStyle='#8a5a3a';q.fillRect(-72,-14,12,14);q.fillRect(62,-14,12,14);q.fillStyle='#4a9a4a';for(let k=-1;k<=1;k++){q.beginPath();q.ellipse(-66+k*4,-19-Math.abs(k)*-3,3,8,k*.4,0,6.283);q.ellipse(68+k*4,-19-Math.abs(k)*-3,3,8,k*.4,0,6.283);q.fill()}}
 else{
  q.fillStyle='#2a1710';q.fillRect(-20,-54,40,45);q.fillStyle='#4a2a18';q.fillRect(-20,-54,19,45);q.fillRect(1,-54,19,45);q.strokeStyle='#e0b24a';q.lineWidth=1;q.strokeRect(-20,-54,40,45);q.beginPath();q.moveTo(0,-54);q.lineTo(0,-9);q.stroke();
  q.fillStyle='#e0b24a';for(let r=0;r<3;r++)for(let c=0;c<2;c++){q.beginPath();q.arc(-14+c*28-(c?0:0)+(c?-8:0),-46+r*14,1.4,0,6.283);q.arc(-6+c*12,-46+r*14,1.4,0,6.283);q.fill()}
  for(const sx of[-44,26]){q.fillStyle='rgba(255,200,110,.88)';q.fillRect(sx,-52,18,26);q.strokeStyle=S.f;q.lineWidth=1.5;q.strokeRect(sx,-52,18,26);q.beginPath();q.moveTo(sx+9,-52);q.lineTo(sx+9,-26);q.moveTo(sx,-39);q.lineTo(sx+18,-39);q.stroke();glw(q,sx+9,-39,30,.18,'#ffc060')}
  q.fillStyle='#8a5a30';q.beginPath();q.arc(-58,-8,8,0,6.283);q.arc(-47,-6,6,0,6.283);q.fill();q.fillStyle='#5a3a1c';q.fillRect(-62,-18,8,3);q.fillRect(-50,-13,6,2.5);
  q.fillStyle='#4a2a14';q.fillRect(58,-60,2.5,52);q.fillStyle='#b8342a';q.beginPath();q.moveTo(60,-60);q.lineTo(76,-56+Math.sin(t*.1)*1.5);q.lineTo(60,-44);q.fill();q.fillStyle='#ffe9a0';q.fillRect(64,-55,6,5)}
 eave(q,0,-58,72,28,.38,9,S.r1,S.r2);
 if(i==0){q.fillStyle='#6d6a76';q.fillRect(34,-120,13,40);q.fillStyle='#4a4852';q.fillRect(32,-123,17,5);
  for(let j=0;j<5;j++){const p=(t*.45+j*14)%66;q.fillStyle='rgba(200,204,214,'+(.5-p/140)+')';q.beginPath();q.arc(40+Math.sin(t*.04+j)*7+p*.12,-126-p,5+p*.1,0,6.283);q.fill()}}
 q.fillStyle='#3a1f12';q.fillRect(-17,-107,34,19);q.strokeStyle='#e6b84e';q.lineWidth=1.4;q.strokeRect(-17,-107,34,19);
 q.font='bold 17px '+FH;q.textAlign='center';q.textBaseline='middle';q.fillStyle='#ffd76a';q.fillText('鍛貨藥令'[i],0,-97);q.textBaseline='alphabetic';
 eave(q,0,-110,50,22,.35,8,S.r1,S.r2);
 lantern(q,-64,-55,1,t,i);lantern(q,64,-55,1,t,i+1.7);lantern(q,-24,-66,.8,t,i+3);lantern(q,24,-66,.8,t,i+4.4)}

/* ---------- cổng Bản Đồ ---------- */
function portal(q,t){
 q.fillStyle='#69718a';q.beginPath();q.ellipse(0,-4,86,16,0,0,6.283);q.fill();q.fillStyle='#8a92a8';q.beginPath();q.ellipse(0,-9,74,13,0,0,6.283);q.fill();q.fillStyle='#a2aabc';q.beginPath();q.ellipse(0,-13,60,10,0,0,6.283);q.fill();
 q.strokeStyle='rgba(20,26,44,.4)';q.lineWidth=1;for(let k=0;k<12;k++){const a=k/12*6.283;q.beginPath();q.moveTo(Math.cos(a)*60,-13+Math.sin(a)*10);q.lineTo(Math.cos(a)*86,-4+Math.sin(a)*16);q.stroke()}
 q.strokeStyle='#9fe8ff';q.lineWidth=1.6;q.globalAlpha=.55+.3*Math.sin(t*.1);q.beginPath();q.ellipse(0,-11,50,8,0,0,6.283);q.stroke();q.globalAlpha=1;
 glw(q,0,-62,96,.5+.15*Math.sin(t*.1),'#9a60ff');glw(q,0,-12,64,.4,'#7ac8ff');
 q.save();q.beginPath();q.arc(0,-62,40,0,6.283);q.clip();
 let o=q.createRadialGradient(0,-62,2,0,-62,42);o.addColorStop(0,'#f0dcff');o.addColorStop(.28,'#9a5af0');o.addColorStop(.7,'#3a1a80');o.addColorStop(1,'#10062a');q.fillStyle=o;q.fillRect(-44,-106,88,88);
 q.lineCap='round';for(let j=0;j<4;j++){q.strokeStyle='rgba(235,220,255,'+(.55-j*.04)+')';q.lineWidth=2.4-j*.3;q.beginPath();for(let a=0;a<=9.4;a+=.3){const r=a/9.4*40,an=a*1.05+t*.07+j*1.5708;const x=Math.cos(an)*r,y=-62+Math.sin(an)*r;a?q.lineTo(x,y):q.moveTo(x,y)}q.stroke()}
 q.fillStyle='rgba(255,255,255,.9)';for(let k=0;k<10;k++){const an=t*.05+k*.628,r=(k*7+t*.4)%40;q.beginPath();q.arc(Math.cos(an)*r,-62+Math.sin(an)*r,1.3,0,6.283);q.fill()}
 q.restore();
 q.strokeStyle='#8c94aa';q.lineWidth=11;q.beginPath();q.arc(0,-62,46,0,6.283);q.stroke();q.strokeStyle='#b4bccd';q.lineWidth=2.5;q.beginPath();q.arc(0,-62,50.5,.2,3.6);q.stroke();
 q.strokeStyle='#e6b84e';q.lineWidth=1.8;q.beginPath();q.arc(0,-62,41,0,6.283);q.stroke();
 q.fillStyle='#8c94aa';q.fillRect(-52,-70,8,50);q.fillRect(44,-70,8,50);q.fillStyle='#e6b84e';q.fillRect(-54,-72,12,4);q.fillRect(42,-72,12,4);
 for(let k=0;k<12;k++){const a=k*Math.PI/6+t*.012,fl=.5+.5*Math.sin(t*.1+k);q.strokeStyle='rgba(150,235,255,'+(.4+fl*.6)+')';q.lineWidth=2.2;q.beginPath();q.moveTo(Math.cos(a)*43.5,-62+Math.sin(a)*43.5);q.lineTo(Math.cos(a)*49,-62+Math.sin(a)*49);q.stroke()}
 eave(q,0,-104,44,16,.4,7,'#8a6ad0','#4a2a90','#e6b84e');
 lantern(q,-52,-60,.8,t,7);lantern(q,52,-60,.8,t,8.5)}

/* ---------- vẽ toà nhà ---------- */
bld=function(i){
 const t=fr,k=bww()/120,X=bxx(i)*s,Y=GY-12*s;
 g.save();g.translate(X,Y);g.scale(s*k,s*k);
 g.fillStyle='rgba(10,16,34,.34)';g.beginPath();g.ellipse(0,3,80,10,0,0,6.283);g.fill();
 if(i==4)portal(g,t);else shop(g,i,t);
 g.restore();
 const fs=Math.max(11,12.5*s),ty=Y-(i==4?136:156)*s*k;
 g.save();g.font='bold '+fs+'px '+FV;g.textAlign='center';g.lineWidth=3.5;g.strokeStyle='rgba(8,12,28,.85)';g.fillStyle='#fff3d0';g.strokeText(LBL[i],X,ty);g.fillText(LBL[i],X,ty);
 const by=ty+5+Math.sin(t*.12+i)*2;g.fillStyle='#e8c060';g.strokeStyle='rgba(8,12,28,.85)';g.lineWidth=2;g.beginPath();g.moveTo(X-5,by);g.lineTo(X+5,by);g.lineTo(X,by+7);g.closePath();g.stroke();g.fill();g.restore()};

/* ---------- tiền cảnh: trụ đèn, chuông gió, cánh hoa ---------- */
function fgDraw(){
 const gy=GY,u=s,t=fr;g.save();
 const ry=gy+(H-gy)*.24;g.fillStyle='#2a3350';g.beginPath();g.moveTo(-4,ry-18*u);g.quadraticCurveTo(34*u,ry-8*u,60*u,ry+18*u);g.quadraticCurveTo(66*u,ry+22*u,70*u,ry+13*u);g.quadraticCurveTo(58*u,ry+36*u,44*u,ry+40*u);g.lineTo(-4,ry+42*u);g.closePath();g.fill();
 g.strokeStyle='#b9923c';g.lineWidth=Math.max(1.5,2*u);g.beginPath();g.moveTo(-4,ry-18*u);g.quadraticCurveTo(34*u,ry-8*u,60*u,ry+18*u);g.quadraticCurveTo(66*u,ry+22*u,70*u,ry+13*u);g.stroke();
 {const ax=64*u,ay=ry+20*u,sw=Math.sin(t*.045)*.14;g.save();g.translate(ax,ay);g.rotate(sw);g.strokeStyle='#c9b27a';g.lineWidth=Math.max(1,1.2*u);g.beginPath();g.moveTo(0,0);g.lineTo(0,10*u);g.stroke();g.fillStyle='#d8c38a';g.beginPath();g.ellipse(0,11*u,9*u,3*u,0,0,6.283);g.fill();
  for(let k=-2;k<=2;k++){const L=(26-Math.abs(k)*4)*u;g.strokeStyle='#e0cc92';g.lineWidth=Math.max(1.2,2.2*u);g.beginPath();g.moveTo(k*3.6*u,12*u);g.lineTo(k*3.6*u,12*u+L);g.stroke()}
  g.fillStyle='#8a2a22';g.beginPath();g.ellipse(0,12*u+34*u,3*u,4*u,0,0,6.283);g.fill();g.restore()}
 const xP=W*.935,yb=gy+(H-gy)*.6;
 g.fillStyle='rgba(8,12,28,.3)';g.beginPath();g.ellipse(xP,yb+2*u,18*u,5*u,0,0,6.283);g.fill();
 g.fillStyle='#6a7184';g.fillRect(xP-9*u,yb-8*u,18*u,8*u);g.fillStyle='#4a2c1c';g.fillRect(xP-3*u,yb-150*u,6*u,144*u);g.fillRect(xP-34*u,yb-152*u,40*u,4.5*u);g.fillStyle='#e6b84e';g.fillRect(xP-34*u,yb-153*u,40*u,1.5*u);
 {const sw=Math.sin(t*.04)*2*u,lx=xP-30*u+sw;g.strokeStyle='#4a2a14';g.lineWidth=Math.max(1,1.2*u);g.beginPath();g.moveTo(xP-30*u,yb-148*u);g.lineTo(lx,yb-138*u);g.stroke();
  const o=g.createRadialGradient(lx,yb-124*u,1,lx,yb-124*u,14*u);o.addColorStop(0,'#ffd080');o.addColorStop(1,'#c4301e');g.fillStyle='#e6b84e';g.fillRect(lx-6*u,yb-139*u,12*u,3*u);g.fillStyle=o;g.beginPath();g.ellipse(lx,yb-125*u,10*u,13*u,0,0,6.283);g.fill();g.fillStyle='#e6b84e';g.fillRect(lx-6*u,yb-112*u,12*u,3*u);
  glw(g,lx,yb-125*u,58*u,.48+.1*Math.sin(t*.17),'#ff9a40')}
 for(let i=0;i<24;i++){const x=((i*97+t*(.35+(i%4)*.13)+Math.sin(t*.02+i)*30)%(W+80))-40,y=((i*61+t*(.8+(i%3)*.3))%(H+60))-30;g.save();g.translate(x,y);g.rotate(t*.04+i);g.globalAlpha=.85;g.fillStyle=i%3?'#ffc4d4':'#ffe0ea';g.beginPath();g.ellipse(0,0,(3.6+i%3)*u,(1.9+i%2*.5)*u,0,0,6.283);g.fill();g.restore()}
 g.restore()}
const _vd=vdraw;vdraw=function(){_vd();fgDraw()};
})();


