/* ===================================================================
   THÚ TRIỆU HỒI v2 · Linh Lang (sói) · Thạch Cự (golem) · Cổ Thụ (cây)
   - Thay ảnh tĩnh bằng nhân vật vẽ theo khung xương (IK): chân bước thật theo quãng đường,
     tay vung / giơ / đập, đầu · hàm · tai · đuôi · cành lá chuyển động mượt.
   - Chỉ đổi phần HIỂN THỊ. Logic đánh / hồi chiêu / sát thương vẫn nằm ở combat/18-enemies.js.
   - Muốn chỉnh màu / kích thước: xem bảng LOOK bên dưới. Thú khác (hawk...) vẫn vẽ như cũ.
   =================================================================== */
(function(){
if(typeof g==='undefined'||typeof PETS==='undefined'||typeof window.pets!=='function')return;
const PI=Math.PI,TAU=PI*2,sin=Math.sin,cos=Math.cos,abs=Math.abs;
const c01=(v,a,b)=>v<a?a:v>b?b:v;
const sm=t=>{t=c01(t,0,1);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
const hs=n=>{const x=sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const LOOK={wolf:{col:'#9fe0ff',ring:58,z:1.3},golem:{col:'#ffd070',ring:66,z:1.3},tree:{col:'#7fe85a',ring:58,z:1.08}};   /* z = độ phóng to thú (chỉnh ở đây) */
const RGB=(h,a)=>'rgba('+parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')';

/* ---- save/restore có đếm: nếu lỡ lỗi giữa chừng vẫn trả canvas về trạng thái sạch ---- */
let dep=0;const sv=()=>{g.save();dep++},rs=()=>{g.restore();dep--};

/* ---- công cụ vẽ ---- */
function ik(x0,y0,tx,ty,l1,l2,dir){
 let dx=tx-x0,dy=ty-y0,d=Math.hypot(dx,dy);const mx=l1+l2-.01,mn=abs(l1-l2)+.01;d=c01(d,mn,mx);
 const a=Math.atan2(dy,dx),cc=c01((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),ang=a+Math.acos(cc)*dir;
 return[x0+l1*cos(ang),y0+l1*sin(ang),x0+cos(a)*d,y0+sin(a)*d]}
function cap(ax,ay,bx,by,r0,r1){
 const th=Math.atan2(by-ay,bx-ax),nx=cos(th-PI/2),ny=sin(th-PI/2);
 g.beginPath();g.moveTo(ax+nx*r0,ay+ny*r0);g.lineTo(bx+nx*r1,by+ny*r1);g.arc(bx,by,r1,th-PI/2,th+PI/2);
 g.lineTo(ax-nx*r0,ay-ny*r0);g.arc(ax,ay,r0,th+PI/2,th+PI*1.5);g.closePath()}
function capF(ax,ay,bx,by,r0,r1,fill,stk,lw){cap(ax,ay,bx,by,r0,r1);g.fillStyle=fill;g.fill();if(stk){g.strokeStyle=stk;g.lineWidth=lw||1;g.stroke()}}
function glow(x,y,r,col,a){sv();g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,RGB(col,a));q.addColorStop(1,RGB(col,0));g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();rs()}
function poly(pts,fill,stk,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stk){g.strokeStyle=stk;g.lineWidth=lw||1;g.stroke()}}
function blob(x,y,r,seed,n){n=n||7;g.beginPath();for(let i=0;i<n;i++){const a=i/n*TAU+hs(seed)*.6,rr=r*(.82+hs(seed+i*3.1)*.3);const px=x+cos(a)*rr,py=y+sin(a)*rr*.92;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
function leaf(x,y,a,len,w,col){sv();g.translate(x,y);g.rotate(a);g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-w,len,0);g.quadraticCurveTo(len*.5,w,0,0);g.fill();rs()}
function rockGrad(x0,y0,x1,y1,l,m,d){const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,l);q.addColorStop(.55,m);q.addColorStop(1,d);return q}

/* vòng triệu hồi + bóng dưới chân (toạ độ mặt đất) */
function ground(C,R,t,sh){
 sv();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,1,R*.55*sh,5,0,0,TAU);g.fill();
 g.globalCompositeOperation='lighter';g.scale(1,.3);
 const q=g.createRadialGradient(0,0,R*.15,0,0,R);q.addColorStop(0,RGB(C,0));q.addColorStop(.72,RGB(C,.2));q.addColorStop(1,RGB(C,0));g.fillStyle=q;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();
 g.strokeStyle=RGB(C,.7);g.lineWidth=1.7;g.setLineDash([9,5]);g.lineDashOffset=-t*.5;g.beginPath();g.arc(0,0,R*.9,0,TAU);g.stroke();
 g.setLineDash([]);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*.66,0,TAU);g.stroke();
 g.rotate(t*.012);for(let i=0;i<8;i++){const a=i*TAU/8;g.beginPath();g.moveTo(cos(a)*R*.66,sin(a)*R*.66);g.lineTo(cos(a)*R*.9,sin(a)*R*.9);g.stroke()}
 rs()}

/* chân đi theo chu kỳ: đứng (trượt lùi) → nhấc bước (vòng cung) */
function foot(ph,off,hx,stride,lift){let u=(ph/TAU+off)%1;if(u<0)u+=1;if(u<.5)return[hx+stride*(1-4*u),0];const v=(u-.5)*2;return[hx-stride+2*stride*sm(v),-lift*sin(v*PI)]}

/* ===================================================================
   SÓI LINH LANG — gốc toạ độ ở mặt đất, +x là hướng nhìn
   =================================================================== */
function drawWolf(o){
 const t=o.t,ph=o.ph,st=o.st,fa=o.fa,tm=o.tm,run=c01(o.spd/2.4,0,1);
 const atk=st=='atk',skl=st=='skl';
 const lg=atk?sm(fa/.4)*(1-sm((fa-.55)/.4)):0;
 const cr=atk&&fa<.3?sin(c01(fa/.25,0,1)*PI):0;
 const jo=atk?(fa<.15?0:fa<.5?sm((fa-.15)/.3):c01(1-(fa-.5)/.12,0,1)):(skl&&tm>5&&tm<14?.35:.04+.05*sin(t*.06));
 const ds=skl?(tm<=14?sm(tm/3):c01(1-(tm-14)/10,0,1)):0;
 const breathe=sin(t*.07)*.7,by=-26+breathe+cr*4+ds*4-run*1.3*cos(ph*2)+(1-run)*0;
 const pitch=-lg*.09+cr*.07-ds*.04+run*.015*sin(ph*2);
 const sx=1+ds*.1,sy=1-ds*.05;
 /* điểm gắn chân theo thân (xoay quanh tâm thân) */
 const W=(x,y)=>{const c=cos(pitch),s2=sin(pitch);return[x*sx*c-y*sy*s2,by+x*sx*s2+y*sy*c]};
 const fh=W(13,3),hh=W(-15,3);
 const stride=mix(0,11,run),lift=mix(0,6,run),gp=t*.95;
 const FT=(off,hx,front,gOff)=>{
  let f=foot(ph,off,hx+(front?1:-1),stride,lift);
  if(front){f[0]+=lg*12;f[1]-=lg*7;}
  if(ds>0){const gx=hx+(front?17:-17)+sin(gp+gOff)*6,gy=-7+cos(gp+gOff)*4+(front?0:1);f=[mix(f[0],gx,ds),mix(f[1],gy,ds)]}
  return f};
 const fFL=FT(0,fh[0],1,0),fFR=FT(.5,fh[0]-3,1,.6),fHL=FT(.5,hh[0],0,1.4),fHR=FT(0,hh[0]+3,0,2.1);
 const NEAR='#8d9aab',FAR='#465061',OUT='#242a33';
 const leg=(hp,ft,l1,l2,dir,col,r,hind)=>{
  const j=ik(hp[0],hp[1],ft[0],ft[1],l1,l2,dir);
  if(hind){g.fillStyle=col;g.beginPath();g.ellipse(hp[0]+1,hp[1]+1,7.5,8.5,-.3,0,TAU);g.fill()}
  capF(hp[0],hp[1],j[0],j[1],r+1.6,r,col,OUT,1);capF(j[0],j[1],j[2],j[3],r,r*.62,col,OUT,1);
  g.fillStyle=col;g.beginPath();g.ellipse(j[2]+1.8,j[3]-1,4.6,2.8,0,0,TAU);g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(20,24,30,.55)';g.lineWidth=.8;for(let i=0;i<3;i++){g.beginPath();g.moveTo(j[2]+2.5+i*1.2,j[3]-3);g.lineTo(j[2]+3+i*1.2,j[3]+.6);g.stroke()}};
 /* vệt gió khi lao */
 if(ds>0){sv();g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=-34+i*7+hs(i)*3,l=30+hs(i+5)*28;const q=g.createLinearGradient(-20,y,-20-l,y);q.addColorStop(0,'rgba(159,224,255,'+.5*ds+')');q.addColorStop(1,'rgba(159,224,255,0)');g.strokeStyle=q;g.lineWidth=1.6;g.beginPath();g.moveTo(-20,y);g.lineTo(-20-l,y);g.stroke()}rs()}
 /* chân xa */
 leg(fh,fFR,12,13,1,FAR,3.5,0);leg(hh,fHR,13,13,-1,FAR,3.6,1);
 /* đuôi */
 sv();{const b=W(-21,-3);g.translate(b[0],b[1]);let x=0,y=0,a=PI+.55-ds*.55-lg*.2+sin(t*.03)*.08;
  for(let i=0;i<5;i++){a+=sin(t*.09-i*.7)*(.17+run*.12)+.1+(i>2?.09:0);const nx=x+cos(a)*6.2,ny=y+sin(a)*6.2;capF(x,y,nx,ny,4-i*.6,3.4-i*.62,i>3?'#dfeaf4':NEAR,OUT,.9);x=nx;y=ny}
  glow(x,y,11,'#9fe0ff',.6)}rs();
 /* thân */
 sv();{const b=W(0,0);g.translate(b[0],b[1]);g.rotate(pitch);g.scale(sx,sy);
  const q=g.createLinearGradient(0,-13,0,10);q.addColorStop(0,'#4b5667');q.addColorStop(.5,'#8794a6');q.addColorStop(1,'#d3dde8');
  g.beginPath();g.moveTo(-22,-4);g.bezierCurveTo(-18,-12,-4,-11,6,-12);g.bezierCurveTo(12,-13,17,-12,21,-8);g.bezierCurveTo(24,-2,23,5,17,8);g.bezierCurveTo(8,10,-2,7,-9,8);g.bezierCurveTo(-16,9,-23,6,-22,-4);
  g.fillStyle=q;g.fill();g.strokeStyle=OUT;g.lineWidth=1.3;g.stroke();
  g.fillStyle=NEAR;g.beginPath();g.ellipse(-14,2,7.5,8.5,-.3,0,TAU);g.fill();g.strokeStyle='rgba(30,36,46,.7)';g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(40,48,60,.16)';g.lineWidth=.8;for(let i=0;i<6;i++){g.beginPath();g.moveTo(-18+i*5,-9+Math.abs(i-2.5)*.5);g.quadraticCurveTo(-16+i*5,-3,-19+i*5,3+(i%2)*2);g.stroke()}
  g.fillStyle='#6e7b8d';for(let i=0;i<10;i++){const x=-19+i*3.9,w=sin(t*.08+i*.6)*.9;g.beginPath();g.moveTo(x-2,-11+(i<2?3:0));g.lineTo(x+w,-15.5-hs(i)*2.2);g.lineTo(x+2.2,-11.5);g.fill()}
  g.fillStyle='#e8f1f8';for(let i=0;i<5;i++){const w=sin(t*.07+i)*.8;g.beginPath();g.moveTo(21,-4+i*3);g.lineTo(26+w,-1+i*3.3);g.lineTo(20,-1+i*3);g.fill()}
  glow(2,-1,22,'#9fe0ff',.1+.04*sin(t*.08))}rs();
 /* chân gần */
 leg(hh,fHL,13,13,-1,NEAR,3.7,1);leg(fh,fFL,12,13,1,NEAR,3.6,0);
 /* cổ + đầu */
 sv();{const b=W(0,0);g.translate(b[0],b[1]);g.rotate(pitch);
  const hx=25+lg*6+ds*4-cr*2,hy=-11+cr*3+ds*3+sin(t*.05)*.6,ha=-.05-lg*.22+ds*.14+sin(t*.021)*.07+run*.04*sin(ph*2);
  capF(13,-5,hx,hy,7,5.6,NEAR,OUT,1.1);
  g.fillStyle='#d8e4ef';for(let i=0;i<5;i++){const w=sin(t*.08+i)*.8;g.beginPath();g.moveTo(13+i*2.2,5-i*1.6);g.lineTo(11+i*2.2+w,10.5-i*1.3);g.lineTo(16+i*2.2,5.5-i*1.6);g.fill()}
  g.translate(hx,hy);g.rotate(ha);
  const ear=-.15-lg*.35-ds*.6+sin(t*.17+1)*.05*(run>.3?0:1);
  sv();g.translate(-3,-6);g.rotate(ear-.1);poly([[-4,0],[-3,-10],[3,0]],FAR,OUT,1);rs();
  g.fillStyle='#8b98aa';g.beginPath();g.ellipse(0,0,8,7.2,0,0,TAU);g.fill();g.strokeStyle=OUT;g.lineWidth=1.1;g.stroke();
  g.beginPath();g.moveTo(3,-6);g.bezierCurveTo(8,-7,14,-4,18,-2);g.lineTo(19.5,1);g.bezierCurveTo(15,3,9,4,3,4);g.closePath();
  const hg=g.createLinearGradient(0,-7,0,4);hg.addColorStop(0,'#7f8c9e');hg.addColorStop(1,'#c6d3e0');g.fillStyle=hg;g.fill();g.stroke();
  g.fillStyle='#16191e';g.beginPath();g.ellipse(18.6,-.4,2.3,1.8,0,0,TAU);g.fill();
  sv();g.translate(4,3);g.rotate(jo*.5);
  g.beginPath();g.moveTo(-1,0);g.bezierCurveTo(4,1,9,1,13,0);g.lineTo(12.4,3.4);g.bezierCurveTo(8,4.8,3,4.4,-1,3.8);g.closePath();g.fillStyle='#bccad8';g.fill();g.stroke();
  if(jo>.12){g.fillStyle='#fff';poly([[9,0],[10.3,-3],[11.6,0]],'#fff');poly([[6,.2],[7,-1.8],[8,.2]],'#fff');g.fillStyle='#ff9aaa';g.globalAlpha=.7;g.beginPath();g.ellipse(6,1.6,5,1,0,0,TAU);g.fill()}rs();
  if(jo>.1){poly([[12,1],[13.3,3.8],[14.6,1.2]],'#fff')}
  poly([[-5,3.5],[-1,9],[3,4.5]],'#d4e0ec');poly([[0,5],[5,9],[7,4.5]],'#c4d2e0');
  glow(7.3,-2.3,9,'#7fe6ff',.8);g.fillStyle='#effdff';g.beginPath();g.ellipse(7.3,-2.3,2.7,1.4,-.35,0,TAU);g.fill();g.fillStyle='#0d6a88';g.beginPath();g.ellipse(8,-2.3,.9,1.2,0,0,TAU);g.fill();
  g.strokeStyle='#20262f';g.lineWidth=1.2;g.beginPath();g.moveTo(4.2,-4.6);g.lineTo(10.2,-3.4);g.stroke();
  sv();g.translate(0,-6);g.rotate(ear+.18);poly([[-3,0],[2,-11],[7.5,0]],NEAR,OUT,1);poly([[-.5,-1],[2,-7.5],[4.6,-1]],'#cfe6f6');rs()}rs();
 /* tinh thể băng bay quanh */
 for(let i=0;i<6;i++){const u=((t*.4+hs(i+9)*40)%40)/40;glow(-26+hs(i)*52,-8-u*38-hs(i+3)*6,3+hs(i+7)*2,'#bfeeff',.9*sin(u*PI))}
}

/* ===================================================================
   THẠCH CỰ (golem) — nhìn 3/4 trước, +x là phía tấn công
   =================================================================== */
function rockLimb(ax,ay,bx,by,r0,r1,near,t){
 capF(ax,ay,bx,by,r0,r1,near?rockGrad(ax-r0,ay-r0,bx+r1,by+r1,'#938b7d','#6a6358','#463f37'):'#403a33','#221e18',1.3);
 sv();g.strokeStyle='rgba(255,255,255,.17)';g.lineWidth=1.8;const th=Math.atan2(by-ay,bx-ax),nx=cos(th-PI/2)*r0*.55,ny=sin(th-PI/2)*r0*.55;g.beginPath();g.moveTo(ax+nx,ay+ny);g.lineTo(bx+nx*.8,by+ny*.8);g.stroke();
 g.strokeStyle='rgba(15,12,8,.55)';g.lineWidth=1;for(let i=0;i<2;i++){const u=.3+i*.35,x=mix(ax,bx,u),y=mix(ay,by,u);g.beginPath();g.moveTo(x-2.5,y-2);g.lineTo(x+1,y+1);g.lineTo(x-1,y+3.5);g.stroke()}rs()}
function rockBall(x,y,r,seed,moss){
 blob(x,y,r,seed);const q=g.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r*1.1);q.addColorStop(0,'#a59d8e');q.addColorStop(.6,'#6d665a');q.addColorStop(1,'#3f3932');g.fillStyle=q;g.fill();g.strokeStyle='#201c16';g.lineWidth=1.3;g.stroke();
 if(moss){g.fillStyle='#5f9040';g.beginPath();g.ellipse(x-r*.15,y-r*.7,r*.6,r*.26,-.2,0,TAU);g.fill();g.fillStyle='#86bf58';g.beginPath();g.ellipse(x-r*.3,y-r*.78,r*.3,r*.1,-.2,0,TAU);g.fill()}}
function drawGolem(o){
 const t=o.t,ph=o.ph,st=o.st,fa=o.fa,tm=o.tm,run=c01(o.spd/1.2,0,1);
 let raise=0,slam=0;
 if(st=='atk'){const w=sm(fa/.55),s2=sm((fa-.55)/.12),r=sm((fa-.78)/.22);raise=w*(1-s2);slam=s2*(1-r)}
 else if(st=='skl'){if(tm<=20)raise=sm(tm/14);else slam=sm((tm-20)/3)*(1-sm((tm-30)/14))}
 const pulse=.5+.5*sin(t*.07),breathe=sin(t*.05);
 const crouch=slam*9+(st=='skl'&&tm>20?6*(1-sm((tm-20)/22)):0),lean=-raise*.11+slam*.2+run*.025*sin(ph),bob=-run*abs(sin(ph))*1.6+breathe*.6;
 const py=-39+crouch+bob,GG=39-crouch-bob;   /* GG: mặt đất theo toạ độ thân */
 const hipX=[-10,10],jump=st=='skl'&&tm<=20?sm(tm/12):0;
 const fts=hipX.map((hx,i)=>{const f=foot(ph,i?0:.5,hx,run*2.5,run*9);return[f[0],f[1]-jump*9+(slam?0:0)]});
 const legf=(i,near)=>{const hx=hipX[i],hy=py+2,f=fts[i],j=ik(hx,hy,f[0],f[1],20,20,i?-1:1);
  rockLimb(hx,hy,j[0],j[1],7.6,6.4,near,t);rockLimb(j[0],j[1],j[2],j[3],6.4,6.8,near,t);
  rockBall(j[0],j[1],6.2,i*5+1,0);
  sv();g.translate(j[2],j[3]);poly([[-8,-6],[8,-6],[10,-1],[9,1],[-9,1],[-10,-1]],rockGrad(-8,-6,8,1,'#8f8779','#5f584d','#3b352e'),'#201c16',1.3);g.strokeStyle='rgba(255,255,255,.15)';g.beginPath();g.moveTo(-8,-5);g.lineTo(8,-5);g.stroke();rs()};
 const arm=(i,near)=>{const side=i?1:-1,sx=side*21,sy=-29;let hx,hy;
  const idleX=side*(28+sin(t*.04+i)*1.8)+run*side*0,idleY=4-run*0;
  const sw=run*sin(ph+(i?0:PI));
  hx=idleX+sw*4*side*0+sw*8;hy=idleY-abs(sw)*3;
  const rx=side*10,ry=-76+sin(t*.2+i)*(raise>.8?1.4:0),sx2=i?44:30,sy2=GG-6;
  const ra=raise,sl=slam,id=1-ra-sl;
  hx=hx*id+rx*ra+sx2*sl;hy=hy*id+ry*ra+sy2*sl;
  const j=ik(sx,sy,hx,hy,21,22,-side);
  rockLimb(sx,sy,j[0],j[1],8,7,near,t);rockLimb(j[0],j[1],j[2],j[3],7,8.4,near,t);rockBall(j[0],j[1],6.4,i*7+3,0);
  rockBall(j[2],j[3]+1,9,i*3+11,0);
  g.fillStyle='#2d2821';for(let k=0;k<3;k++){g.beginPath();g.arc(j[2]-4+k*4,j[3]-3.5,1.6,0,TAU);g.fill()}
  glow(j[0],j[1],8,'#ff9a30',.25*pulse+slam*.3)};
 sv();
 /* lõm/đàn hồi (như bản cũ) */
 let sqy=1;if(st=='skl')sqy=tm<=20?1+.08*sin(tm/20*PI):.9+.1*Math.min(1,(tm-20)/24);g.scale(2-sqy>1.12?1.12:2-sqy,sqy);
 /* chân xa → tay xa → thân → đầu → chân gần → tay gần */
 legf(0,0);arm(0,0);
 sv();g.translate(0,py);g.rotate(lean);
 const T=[[-12,3],[12,3],[11,-6],[17,-12],[19,-26],[13,-34],[-13,-34],[-19,-26],[-17,-12],[-11,-6]];
 poly(T,rockGrad(-19,-34,19,3,'#948c7e','#605a4f','#3a352e'),'#1f1b15',1.5);
 poly([[-16,-30],[-2,-31],[-3,-17],[-15,-14]],'rgba(255,255,255,.08)','rgba(0,0,0,.4)',1);poly([[2,-31],[16,-30],[15,-14],[3,-17]],'rgba(255,255,255,.05)','rgba(0,0,0,.4)',1);
 poly([[-10,-12],[10,-12],[9,-4],[-9,-4]],'rgba(0,0,0,.2)','rgba(0,0,0,.35)',1);
 sv();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,140,40,'+(.45+.35*pulse+slam*.3)+')';g.lineWidth=1.6;g.lineCap='round';
 [[-14,-8,-6,-12,-9,-18],[12,-6,7,-13,10,-24],[0,-34,-3,-29,1,-26],[-17,-22,-11,-24,-8,-29]].forEach(c=>{g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[2],c[3]);g.lineTo(c[4],c[5]);g.stroke()});rs();
 glow(0,-20,15,'#ff8a20',.55+.3*pulse+slam*.3);glow(0,-20,6,'#fff0b0',.8);sv();g.strokeStyle='rgba(255,200,100,.8)';g.lineWidth=1.1;g.beginPath();g.arc(0,-20,6.5,0,TAU);g.stroke();rs();
 g.fillStyle='#5f9040';g.beginPath();g.ellipse(-14,-31,6,2.4,.2,0,TAU);g.fill();g.beginPath();g.ellipse(9,6,5,2,0,0,TAU);g.fill();
 /* hông + vai */
 rockBall(-10,2,6.5,21,0);rockBall(10,2,6.5,22,0);rockBall(-21,-30,10.5,31,1);rockBall(21,-30,10.5,32,0);
 /* đầu */
 sv();const hy0=-47+breathe*.5+raise*-3+slam*5,hx0=3+sin(t*.03)*.8+slam*3;g.translate(hx0-3,hy0+47);g.translate(0,-47);g.rotate(slam*.12-raise*.1);g.scale(1.3,1.3);g.translate(0,47);
 poly([[-8,-39],[8,-39],[10,-45],[8,-53],[-7,-53],[-10,-46]],rockGrad(-10,-53,10,-39,'#9c9486','#6c655a','#453f37'),'#1f1b15',1.4);
 poly([[-9,-48],[10,-48],[9,-52],[-8,-53]],'#3a352d');[[-6,-53,-4,-60,-1,-53],[0,-53,3,-62,6,-53],[-9,-50,-11,-57,-6,-52]].forEach(a=>poly([[a[0],a[1]],[a[2],a[3]],[a[4],a[5]]],'#70685c','#1f1b15',1));
 glow(-3,-45.8,9,'#ffa020',.7);glow(5,-45.8,9,'#ffa020',.7);g.fillStyle='#ffd070';g.fillRect(-6,-47.2,6,2.5);g.fillRect(2,-47.2,6,2.5);g.fillStyle='#fff6d0';g.fillRect(-4.5,-46.6,3,1);g.fillRect(3.5,-46.6,3,1);
 g.strokeStyle='rgba(10,8,5,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(-5,-41);g.lineTo(6,-41);g.moveTo(-1,-41);g.lineTo(-1,-39);g.moveTo(3,-41);g.lineTo(3,-39);g.stroke();rs();
 rs();
 legf(1,1);arm(1,1);
 /* bụi đá khi đập */
 const hit=st=='atk'?22:20,us=(st=='atk'||st=='skl')?(tm-hit)/26:-1;
 if(us>0&&us<1){const X=st=='atk'?70:40;sv();g.translate(X,0);g.scale(1,.3);g.strokeStyle='rgba(210,190,150,'+.55*(1-us)+')';g.lineWidth=3*(1-us)+1;g.beginPath();g.arc(0,0,10+us*(st=='atk'?50:80),0,TAU);g.stroke();rs();
  for(let k=0;k<10;k++){const dir=hs(k)*2-1,vx=dir*(24+hs(k+4)*30),vy=18+hs(k+8)*34,px=X+vx*us,pyy=-(vy*us*1.6-vy*us*us*1.9),r=1.4+hs(k+2)*2.2;if(pyy>0)continue;sv();g.globalAlpha=1-us*.7;poly([[px-r,pyy],[px,pyy-r*1.1],[px+r,pyy-.2*r],[px+.4*r,pyy+r]],'#7b7366','#2a251e',.8);rs()}}
 rs();
}

/* ===================================================================
   CỔ THỤ (ent) — cành tay cử động, mặt trên thân, tán lá đung đưa
   =================================================================== */
function drawTree(o){
 const t=o.t,ph=o.ph,st=o.st,fa=o.fa,tm=o.tm,run=c01(o.spd/.9,0,1);
 let raise=0,lash=0,bloom=0;
 if(st=='atk'){raise=sm(fa/.35)*(1-sm((fa-.35)/.12));lash=sm((fa-.35)/.12)*(1-sm((fa-.62)/.38))}
 else if(st=='skl'){raise=sm(tm/10)*(1-sm((tm-34)/10));bloom=sin(c01(tm/44,0,1)*PI)}
 const sw=sin(t*.03)*2+run*sin(ph)*1.5-lash*2+raise*-2,top=(q)=>sw*q*q;
 const cy=q=>mix(-8,-62,q),hw=q=>mix(14,11,q)+1.4*sin(q*PI),cx=q=>top(q);
 const X=(f,q)=>cx(q)+f*hw(q);
 const BARK=rockGrad(-15,0,15,0,'#3f2a18','#7b5836','#3b2716'),OUTB='#24160b';
 /* rễ trải trên đất */
 for(let i=0;i<5;i++){const s2=i<2?-1:1,bx=(i-2)*8,len=14+hs(i)*8;let x=bx,y=-3,a=(s2>0?0:PI)+(i==2?0:0);sv();for(let k=0;k<4;k++){a+=sin(t*.04+i+k)*.16;const nx=x+cos(a)*len/4*(i==2?.3:1),ny=Math.min(-.5,y+sin(a)*3+.6);capF(x,y,nx,ny,3.4-k*.7,2.7-k*.7,'#4b331d',OUTB,.8);x=nx;y=ny}rs()}
 /* chân rễ */
 const hips=[-7,7],legs=hips.map((hx,i)=>foot(ph,i?0:.5,hx,run*6,run*6));
 const legf=i=>{const hx=hips[i]+cx(.06),f=legs[i],j=ik(hx,-15,f[0],f[1],10,10,i?-1:1);capF(hx,-15,j[0],j[1],6.5,5,'#5a3d22',OUTB,1);capF(j[0],j[1],j[2],j[3],5,3.4,'#4b321c',OUTB,1);
  g.strokeStyle='#3a2615';g.lineWidth=2;g.lineCap='round';for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(j[2],j[3]-1);g.quadraticCurveTo(j[2]+k*4,j[3]+1,j[2]+k*7,j[3]);g.stroke()}};
 legf(0);
 const arm=(i,near)=>{const side=i?1:-1,s0=[X(side*.8,.84),cy(.84)],hang=[side*(18+sin(t*.04+i)*3)+sw*.5,-22+sin(t*.05+i*2)*3-run*abs(sin(ph+(i?0:PI)))*5];
  let hx=hang[0]+run*side*0+run*sin(ph+(i?0:PI))*6,hy=hang[1];
  const rx=side*20,ry=-108+sin(t*.12+i)*2,lx=i?60:34,ly=i?-16:-30;
  const id=1-raise-lash;hx=hx*id+rx*raise+(i?lx:hx*0+lx*.6)*lash+0;hy=hy*id+ry*raise+ly*lash;
  const j=ik(s0[0],s0[1],hx,hy,22,22,-side),w=sin(t*.06+i)*.06;
  capF(s0[0],s0[1],j[0],j[1],6,4.4,near?BARK:'#3b2716',OUTB,1.1);capF(j[0],j[1],j[2],j[3],4.4,2.6,near?BARK:'#3b2716',OUTB,1.1);
  leaf(j[0],j[1],-side*.9-1.2+w,9,2.6,'#5fa63e');leaf(j[0],j[1],-side*.4-2.6,7,2,'#4a8a33');
  const fa2=Math.atan2(j[3]-j[1],j[2]-j[0]);for(let k=-1;k<=1;k++){const a=fa2+k*.5+sin(t*.1+k)*.07;g.strokeStyle='#4b321c';g.lineWidth=2.2-abs(k)*.4;g.lineCap='round';g.beginPath();g.moveTo(j[2],j[3]);g.lineTo(j[2]+cos(a)*8,j[3]+sin(a)*8);g.stroke();leaf(j[2]+cos(a)*8,j[3]+sin(a)*8,a,6,2.2,k?'#6dbb48':'#8fd050')}
  glow(j[2],j[3],11,'#9fff7a',.18+.3*(raise+bloom)+lash*.3)};
 arm(0,0);
 /* thân */
 sv();g.beginPath();g.moveTo(X(-1,0),cy(0));
 for(let k=1;k<=10;k++){const q=k/10;g.lineTo(X(-1,q),cy(q))}
 for(let k=10;k>=0;k--){const q=k/10;g.lineTo(X(1,q),cy(q))}
 g.closePath();g.fillStyle=BARK;g.fill();g.strokeStyle=OUTB;g.lineWidth=1.5;g.stroke();g.clip();
 g.strokeStyle='rgba(25,14,6,.5)';g.lineWidth=1.2;for(let f=-.75;f<=.76;f+=.25){g.beginPath();for(let k=0;k<=8;k++){const q=k/8;const w=sin(q*7+f*9)*1.1;k?g.lineTo(X(f,q)+w,cy(q)):g.moveTo(X(f,q)+w,cy(q))}g.stroke()}
 g.strokeStyle='rgba(255,230,180,.12)';g.lineWidth=2;g.beginPath();for(let k=0;k<=8;k++){const q=k/8;k?g.lineTo(X(-.55,q),cy(q)):g.moveTo(X(-.55,q),cy(q))}g.stroke();
 [[.5,.3],[-.4,.55],[.2,.12]].forEach((a,i)=>{g.fillStyle='rgba(20,10,4,.55)';g.beginPath();g.ellipse(X(a[0],a[1]),cy(a[1]),3,2,.4,0,TAU);g.fill()});
 g.fillStyle='rgba(95,160,60,.9)';g.beginPath();g.ellipse(X(-.6,.28),cy(.28),5,2,.2,0,TAU);g.fill();
 rs();
 /* gương mặt */
 {const q=.62,ey=cy(q),e0=X(-.36,q),e1=X(.36,q)+1,gz=1.4+raise*.4+bloom*.8;
  g.fillStyle='#1a0f06';g.beginPath();g.ellipse(e0,ey,4.2,3,0,0,TAU);g.ellipse(e1,ey,4.2,3,0,0,TAU);g.fill();
  glow(e0,ey,10,'#c6ff7a',.8*gz*.7);glow(e1,ey,10,'#c6ff7a',.8*gz*.7);
  g.fillStyle='#e6ffb0';g.beginPath();g.ellipse(e0+1,ey,2.5,1.8,0,0,TAU);g.ellipse(e1+1,ey,2.5,1.8,0,0,TAU);g.fill();g.fillStyle='#1d4a10';g.beginPath();g.arc(e0+1.8,ey,.9,0,TAU);g.arc(e1+1.8,ey,.9,0,TAU);g.fill();
  g.strokeStyle='#24160b';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(e0-5,ey-4.4+raise*-1);g.lineTo(e0+4,ey-2.8);g.moveTo(e1+5,ey-4.4);g.lineTo(e1-4,ey-2.8);g.stroke();
  const nx=X(.02,q)+1.5,ny=ey+4.5;poly([[nx-2,ny-2],[nx+3,ny+.5],[nx-2,ny+3]],'#5e4026','#24160b',1);
  const my=ey+10+(st=='atk'&&fa>.3&&fa<.6?2:0);g.strokeStyle='#1a0f06';g.lineWidth=1.8;g.beginPath();g.moveTo(X(-.22,q),my);g.quadraticCurveTo(X(0,q)+1,my+2.4+bloom*1.5,X(.3,q),my-.4);g.stroke();
  for(let k=0;k<7;k++){const bx=X(-.55+k*.18,q)+.5,by=my+1.5,l=8+hs(k+6)*6+sin(t*.06+k)*1.4;g.strokeStyle=k%2?'#5f9e3e':'#7fc254';g.lineWidth=1.8;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+sin(t*.05+k)*1.8,by+l*.5,bx+sin(t*.05+k)*2.4+(k-3)*.4,by+l);g.stroke()}}
 legf(1);
 /* tán lá */
 {const c0=X(0,1),c1=-82-lash*0+raise*-2;
  const pts=[];for(let i=0;i<18;i++){const a=hs(i)*TAU,r=(.3+hs(i+1)*.7);pts.push([c0+cos(a)*r*30+sin(t*.035+i*1.3)*1.8,c1+sin(a)*r*21*.9-2+cos(t*.03+i)*1.2,11+hs(i+2)*8+bloom*2.5])}
  pts.sort((a,b)=>a[1]-b[1]);
  pts.forEach(p=>{g.fillStyle='#24522a';g.beginPath();g.arc(p[0],p[1],p[2]*1.06,0,TAU);g.fill()});
  pts.forEach(p=>{g.fillStyle='#3d8a36';g.beginPath();g.arc(p[0]-1.2,p[1]-1.5,p[2]*.9,0,TAU);g.fill()});
  pts.forEach(p=>{g.fillStyle='rgba(138,208,76,.85)';g.beginPath();g.arc(p[0]-3,p[1]-4,p[2]*.5,0,TAU);g.fill()});
  for(let i=0;i<24;i++){const a=hs(i+30)*TAU,r=22+hs(i+40)*14,x=c0+cos(a)*r*1.05,y=c1+sin(a)*r*.62-2;leaf(x,y,a+sin(t*.05+i)*.3,7,2.4,i%3?'#5fb040':'#9be05a')}
  if(bloom>.02){glow(c0,c1,58*bloom+8,'#c8ff8a',.35*bloom);for(let i=0;i<11;i++){const a=hs(i+60)*TAU,r=.4+hs(i+70)*.6,x=c0+cos(a)*r*30,y=c1+sin(a)*r*17,sz=3.4*bloom;g.fillStyle='#ffd6e8';for(let k=0;k<5;k++){g.beginPath();g.arc(x+cos(k*1.2566)*sz,y+sin(k*1.2566)*sz,sz*.8,0,TAU);g.fill()}g.fillStyle='#ffe27a';g.beginPath();g.arc(x,y,sz*.7,0,TAU);g.fill()}
   for(let i=0;i<10;i++){const u=((tm*1.3+i*9)%46)/46;glow(c0+(hs(i)*2-1)*40,c1+8-u*50,2.6,'#e6ffb0',.9*sin(u*PI)*bloom)}}}
 arm(1,1);
 /* lá rơi */
 for(let i=0;i<6;i++){const u=((t*.45+hs(i+3)*80)%78)/78,x=X(0,1)+(hs(i)*2-1)*34+sin(t*.05+i*2)*8,y=-78+u*76;sv();g.globalAlpha*=sin(u*PI)*.9;leaf(x,y,t*.06+i*2,6,2,i%2?'#7fc84a':'#b8e068');rs()}
}

/* ===================================================================
   Vẽ 1 con thú triệu hồi (giữ nguyên hiệu ứng xuất hiện / mờ dần / toả sáng khi dùng chiêu)
   =================================================================== */
function drawBeast(p){
 const L=LOOK[p.k];if(!L)return;
 dep=0;
 const st=p.st||'idle',fa=st!='idle'?p.tm/p.dur:0,F=p.face<0?-1:1,t=p.t||0;
 if(p._lx===undefined){p._lx=p.x;p._ph=0;p._sp=0}
 const dx=abs(p.x-p._lx);p._lx=p.x;p._sp+=(dx-p._sp)*.35;
 const stepLen=p.k=='wolf'?52:p.k=='golem'?44:36;p._ph+=dx/stepLen*TAU;
 const sc=Math.min(1,.3+t/12)+sin(Math.min(1,t/16)*PI)*.12,al=c01(p.l/30,0,1)*Math.min(1,t/6);
 const o={t,ph:p._ph,spd:p._sp,st,fa,tm:p.tm||0};
 g.save();dep++;
 g.translate((p.x-cam)*s,GY*1);g.scale(s,s);g.globalAlpha=al;
 ground(L.col,L.ring,t,p.k=='golem'?1.15:1);
 g.translate(0,-(p.y||0));
 if(st=='skl'||(p.k=='tree'&&st=='atk')){sv();g.globalCompositeOperation='lighter';const r=80,q=g.createRadialGradient(0,-38,6,0,-38,r);q.addColorStop(0,L.col+'bb');q.addColorStop(1,L.col+'00');g.fillStyle=q;g.globalAlpha=al*.85*sin(Math.min(1,fa)*PI);g.beginPath();g.arc(0,-38,r,0,TAU);g.fill();rs()}
 g.scale(F*sc*L.z,sc*L.z);
 if(p.k=='wolf')drawWolf(o);else if(p.k=='golem')drawGolem(o);else drawTree(o);
 while(dep>0){g.restore();dep--}
}

/* ---- Gắn vào vòng vẽ: thú cũ (hawk...) vẫn do hàm gốc vẽ, 3 thú mới vẽ bằng khung xương ---- */
const orig=window.pets;
window.pets=function(){
 const all=PETS;let rest;
 try{rest=all.filter(p=>!LOOK[p.k])}catch(e){return orig()}
 PETS=rest;try{orig()}finally{PETS=all}
 for(let i=0;i<all.length;i++){const p=all[i];if(!LOOK[p.k])continue;
  try{drawBeast(p)}catch(e){while(dep>0){try{g.restore()}catch(x){}dep--}
   if(!window.__beastErr){window.__beastErr=1;console.error('[Thú triệu hồi v2]',e)}}}
};
window.SUMBEAST={look:LOOK,draw:drawBeast};
})();
