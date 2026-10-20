/* ===== 🎨 12 QUÁI TIÊN GIỚI — bộ vẽ v2 (assets/tien-gioi-quai-art.js) · Fix361 =====
 * TỰ VẼ bằng canvas 2D (không cắt/dán ảnh nào): tô khối + ánh sáng + bóng đổ + vảy/lông/lông vũ + lửa/hào quang, theo bố cục & màu của tranh tham khảo.
 * Nền TRONG SUỐT, nhìn ngang, quay mặt sang PHẢI (game lật trái/phải). Toạ độ logic 256×256, chân đứng tại (128,238); xuất khung FR.size (320px) = siêu lấy mẫu.
 * 16 khung/quái: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công.  API: TGMART.SP, TGMART.FR, TGMART.draw(ctx,spIndex,frameIndex) */
(function(){
'use strict';
var TAU=Math.PI*2,PI=Math.PI,KS=1,SEED=1;
function rnd(){SEED=(SEED*1664525+1013904223)>>>0;return SEED/4294967296}
function lin(c,x0,y0,x1,y1,s){var q=c.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<s.length;i+=2)q.addColorStop(s[i],s[i+1]);return q}
function rad(c,x,y,r,s,x2,y2){var q=c.createRadialGradient(x2===undefined?x:x2,y2===undefined?y:y2,0,x,y,r);for(var i=0;i<s.length;i+=2)q.addColorStop(s[i],s[i+1]);return q}
/* đường cong mượt qua các điểm (chỉ THÊM đường, không beginPath) */
function sm(c,p,open){var n=p.length,i;if(open){c.moveTo(p[0][0],p[0][1]);for(i=1;i<n-1;i++)c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);c.lineTo(p[n-1][0],p[n-1][1])}
 else{c.moveTo((p[0][0]+p[n-1][0])/2,(p[0][1]+p[n-1][1])/2);for(i=0;i<n;i++){var a=p[i],b=p[(i+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath()}}
function SP_(p){return function(c){sm(c,p)}}
function EL(x,y,rx,ry,rot){return function(c){c.moveTo(x+rx*Math.cos(rot||0),y+rx*Math.sin(rot||0));c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU)}}
function shifted(c,P,dx,dy){c.save();c.translate(dx,dy);P(c);c.restore()}
/* tô khối: nền gradient + bóng trong (phải-dưới) + viền sáng (trái-trên) + hoạ tiết + viền mềm */
function paint(c,P,o){
 c.beginPath();P(c);c.fillStyle=o.f;c.fill();
 c.save();c.beginPath();P(c);c.clip();
 if(o.sh!==0){c.save();c.beginPath();c.rect(-400,-400,900,900);shifted(c,P,-(o.sx||2.4),-(o.sy||3.2));c.shadowColor=o.sc||'rgba(4,12,40,.6)';c.shadowBlur=(o.sb||9)*KS;c.fillStyle='#000';c.fill('evenodd');c.restore()}
 if(o.rim!==0){c.save();c.beginPath();c.rect(-400,-400,900,900);shifted(c,P,2,2.4);c.shadowColor=o.rc||'rgba(255,255,255,.7)';c.shadowBlur=3*KS;c.fillStyle=o.rc||'rgba(255,255,255,.7)';c.fill('evenodd');c.restore()}
 if(o.tx)o.tx(c);
 c.restore();
 if(o.ol!==0){c.beginPath();P(c);c.strokeStyle=o.ol||'rgba(6,16,38,.8)';c.lineWidth=o.lw||1.5;c.lineJoin='round';c.stroke()}}
function tube(c,p,w0,w1,f,hi,ol){var n=p.length-1,i,k;c.lineCap='round';c.lineJoin='round';
 for(k=0;k<3;k++)for(i=0;i<n;i++){var w=w0+(w1-w0)*(i+.5)/n,ox=k==2?-w*.16:0,oy=k==2?-w*.2:0;c.beginPath();c.moveTo(p[i][0]+ox,p[i][1]+oy);c.lineTo(p[i+1][0]+ox,p[i+1][1]+oy);
  c.lineWidth=k==0?w+2.6:k==1?w:w*.28;c.strokeStyle=k==0?(ol||'rgba(6,16,38,.85)'):k==1?f:(hi||'rgba(255,255,255,.28)');c.stroke()}}
function glow(c,x,y,r,col,al){c.save();c.globalCompositeOperation='lighter';var q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+col+','+al+')');q.addColorStop(.45,'rgba('+col+','+al*.35+')');q.addColorStop(1,'rgba('+col+',0)');c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function ell(c,x,y,rx,ry,f,o,lw,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU);if(f){c.fillStyle=f;c.fill()}if(o){c.strokeStyle=o;c.lineWidth=lw||1.4;c.stroke()}}
function poly(c,p,f,o,lw,open){c.beginPath();sm(c,p,open);if(f){c.fillStyle=f;c.fill()}if(o){c.strokeStyle=o;c.lineWidth=lw||1.4;c.lineJoin='round';c.stroke()}}
/* mắt có hồn: tròng + đồng tử + 2 điểm sáng */
function eye(c,x,y,r,col,glw){if(glw)glow(c,x,y,r*3.2,glw,.55);poly(c,[[x-r*1.1,y],[x,y-r*.85],[x+r*1.15,y-r*.1],[x,y+r*.8]],'#fdfdf6','rgba(6,16,38,.9)',1);ell(c,x+r*.18,y,r*.62,r*.62,rad(c,x+r*.18,y,r*.62,[0,col,1,'rgba(0,0,0,.9)']),null);ell(c,x+r*.26,y,r*.26,r*.34,'#05050c',null);ell(c,x+r*.02,y-r*.28,r*.2,r*.2,'#fff',null)}
/* hoạ tiết */
function scales(c,x0,y0,x1,y1,r,col,hi){c.save();c.lineWidth=.8;for(var y=y0,row=0;y<y1;y+=r*.78,row++)for(var x=x0+(row%2)*r*.8;x<x1;x+=r*1.6){c.beginPath();c.arc(x,y,r*.8,.1,PI-.1);c.strokeStyle=col;c.stroke();c.beginPath();c.arc(x-r*.2,y-r*.1,r*.45,PI*1.05,PI*1.55);c.strokeStyle=hi||'rgba(255,255,255,.18)';c.stroke()}c.restore()}
function fur(c,x0,y0,x1,y1,n,len,ang,cols,lw){c.save();c.lineCap='round';for(var i=0;i<n;i++){var x=x0+rnd()*(x1-x0),y=y0+rnd()*(y1-y0),a=ang+(rnd()-.5)*.7,l=len*(.5+rnd()*.7);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+2*(rnd()-.5),y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.strokeStyle=cols[(rnd()*cols.length)|0];c.lineWidth=lw||1;c.stroke()}c.restore()}
function flame(c,x,y,w,h,c1,c2,ph,rot,al){c.save();c.translate(x,y);c.rotate(rot||0);c.globalCompositeOperation='lighter';var s=Math.sin(ph*TAU)*.2;
 for(var k=0;k<3;k++){var f=1-k*.3,ww=w*f,hh=h*f;c.beginPath();sm(c,[[0,0],[ww*.6,-hh*.3],[ww*.25+s*ww,-hh*.72],[s*ww*.6,-hh],[-ww*.3+s*ww,-hh*.62],[-ww*.6,-hh*.28]]);c.fillStyle=lin(c,0,0,0,-hh,[0,k==2?'rgba(255,255,255,.9)':c1,1,k==2?'rgba(255,255,255,0)':c2]);c.globalAlpha=(al||1)*(k==0?.7:k==1?.8:.9);c.fill()}c.restore()}
function tri(c,a,b,d,f,o,lw){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();if(f){c.fillStyle=f;c.fill()}if(o){c.strokeStyle=o;c.lineWidth=lw||1.2;c.lineJoin='round';c.stroke()}}
function zig(c,x0,y0,x1,y1,n,amp,col,w,ph){c.save();c.lineCap='round';c.lineJoin='round';var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,i;c.beginPath();c.moveTo(x0,y0);for(i=1;i<n;i++){var u=i/n,o=((i%2)?1:-1)*amp*(1-Math.abs(u-.5)*.6)*(1+.4*Math.sin(ph*TAU+i));c.lineTo(x0+dx*u+nx*o,y0+dy*u+ny*o)}c.lineTo(x1,y1);
 c.shadowColor=col;c.shadowBlur=10*KS;c.strokeStyle=col;c.lineWidth=w+3;c.globalAlpha=.55;c.stroke();c.globalAlpha=1;c.strokeStyle='#fff';c.lineWidth=w;c.stroke();c.restore()}
function horn(c,p,c1,c2,w){poly(c,p,lin(c,p[0][0],p[0][1],p[p.length-1][0],p[p.length-1][1],[0,c1,1,c2]),'rgba(40,20,0,.75)',1.3);}
/* thân 4 chân */
function quad(c,o,a){var mv=a.mv,A=a.A,S=Math.sin(a.ph*TAU),by=-o.h-o.ry+(mv?-Math.abs(Math.sin(a.ph*TAU*2))*4:S*-1.6);
 c.save();c.translate(A*(o.lunge||24),0);var hipY=by+o.ry*.55,amp=mv?.55:.06;
 function leg(hx,off,dk){var sw=Math.sin((a.ph+off)*TAU),lift=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*11:0,fx=hx+sw*amp*o.h*.95,fy=-lift,kx=(hx+fx)/2+(o.bend||6),ky=(hipY+fy)/2;
  tube(c,[[hx,hipY],[kx,ky],[fx,fy-2]],o.w*1.35,o.w*.85,dk?o.legD:o.legC,o.legH,o.ol);paint(c,EL(fx+3,fy-1,o.w*.85,o.w*.45,0),{f:o.hoof,sh:0,rim:0,lw:1.2})}
 leg(-o.len*.62,0,1);leg(o.len*.6,.5,1);
 if(o.pre)o.pre(c,a,by);
 paint(c,EL(0,by,o.len,o.ry,0),{f:lin(c,0,by-o.ry,0,by+o.ry,o.body),tx:function(c){if(o.mid)o.mid(c,a,by)},lw:1.8,ol:o.ol});
 leg(-o.len*.62,.5,0);leg(o.len*.6,0,0);
 o.head(c,o.len*.82,by-o.ry*.45,A,a,by);
 if(o.post)o.post(c,a,by);c.restore()}
function feather(c,x,y,L,W,ang,c1,c2,ol){c.save();c.translate(x,y);c.rotate(ang);var P=SP_([[0,0],[L*.3,-W*.7],[L*.8,-W*.55],[L,0],[L*.8,W*.5],[L*.3,W*.65]]);paint(c,P,{f:lin(c,0,0,L,0,[0,c1,1,c2]),sh:1,sb:4,sx:1,sy:1.4,lw:1,ol:ol||'rgba(10,30,70,.6)'});c.beginPath();c.moveTo(0,0);c.lineTo(L*.95,0);c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=.8;c.stroke();c.restore()}

/* ---------- 1 Thanh Linh Hạc ---------- */
function wingH(c,x,y,f,al){c.save();c.translate(x,y);c.scale(-1,1);c.rotate(-.5-f*.85);c.globalAlpha=al;
 var i;for(i=0;i<8;i++)feather(c,0,i*1.2,118-i*6,17,.12+i*.19,i>4?'#e9f6ff':'#ffffff',i>4?'#2f7fe0':'#8fd6f4');
 for(i=0;i<7;i++)feather(c,6+i*3,-3,82-i*4,15,.02+i*.2,'#ffffff','#cfe9fb');
 for(i=0;i<6;i++)feather(c,8+i*4,-8,48-i*2,12,-.1+i*.22,'#ffffff','#e8f4ff');
 poly(c,[[0,-4],[22,-26],[50,-30],[62,-10],[30,8]],lin(c,0,0,60,-14,[0,'#fff',1,'#cfe6f6']),'rgba(10,30,70,.5)',1);c.restore()}
function hac(c,a){var S=Math.sin(a.ph*TAU),A=a.A,mv=a.mv,fl=mv?Math.sin(a.ph*TAU)*.8:Math.sin(a.ph*TAU)*.25+A*1.1,bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*5:S*-2;
 c.save();c.translate(A*8,bob);var st=mv?Math.sin(a.ph*TAU)*14:0;
 glow(c,0,-118,92,'140,230,255',.2);
 tube(c,[[-4,-104],[-6+st,-58],[-8+st,-6]],4.6,3,'#3a3f4c','rgba(255,220,140,.4)');tube(c,[[8,-104],[10-st,-58],[10-st,-6]],4.6,3,'#575e70','rgba(255,220,140,.4)');
 for(var t=0;t<3;t++){tri(c,[-6+st+t*4,-4],[6+st+t*4,-2],[-2+st+t*4,-9],'#222',null)}ell(c,12-st,-4,11,3.2,'#2a2e3a',null);ell(c,-4+st,-4,11,3.2,'#1f232e',null);
 for(var i=0;i<6;i++){var q=Math.sin(a.ph*TAU+i)*5,ang=3.3-i*.06;feather(c,-34,-116+i*3,90+i*6,12,ang+q*.004+.25,'#e6fbff',i%2?'#2a6fd0':'#35b8e0')}
 wingH(c,-6,-124,fl,.8);
 paint(c,EL(0,-112,41,25,-.15),{f:lin(c,-10,-138,12,-90,[0,'#ffffff',.6,'#eef6fc',1,'#bcd9ee']),tx:function(c){fur(c,-44,-140,44,-86,60,9,.2,['rgba(150,190,230,.5)','rgba(255,255,255,.8)'],1)}});
 var hx=44+A*32,hy=-168+A*40+Math.sin(a.ph*TAU)*(mv?0:1.5);
 tube(c,[[26,-124],[46,-140],[30,-160],[hx-6,hy+8]],11,6.5,'#fff','rgba(120,170,220,.35)','rgba(20,50,90,.7)');
 ell(c,hx,hy,12.5,10.5,lin(c,hx,hy-10,hx,hy+10,[0,'#fff',1,'#d4e6f4']),'rgba(20,50,90,.7)',1.4);paint(c,EL(hx-1,hy-9,7.5,4,0),{f:'#e0342e',sh:0,rim:0,lw:1});
 poly(c,[[hx+9,hy-3],[hx+54,hy+3+A*4],[hx+9,hy+6]],lin(c,hx,hy,hx+54,hy,[0,'#f6d36a',1,'#d89a2a']),'rgba(60,30,0,.7)',1.3);
 poly(c,[[hx-6,hy-8],[hx-28,hy-34],[hx-16,hy-10]],lin(c,hx,hy,hx-28,hy-34,[0,'#fff1b0',1,'#e0a830']),'rgba(60,30,0,.6)',1.2);poly(c,[[hx-2,hy-9],[hx-14,hy-44],[hx+2,hy-14]],lin(c,hx,hy,hx-14,hy-44,[0,'#fff6c8',1,'#e8b840']),'rgba(60,30,0,.6)',1.2);
 eye(c,hx+2,hy-2,3.8,'#22b8e0','120,230,255');
 wingH(c,10,-128,fl*.85+.1,1);
 c.restore()}

/* ---------- 2 Ngọc Kỳ Lân ---------- */
function kylan(c,a){quad(c,{len:54,ry:25,h:58,w:9,lunge:12,bend:8,
 body:[0,'#4fe0d0',.45,'#1fa0b8',1,'#1a5c88'],legC:'#1f98b6',legD:'#14658a',legH:'rgba(200,255,250,.35)',hoof:lin(c,0,-5,0,3,[0,'#ffe58a',1,'#c48a20']),
 pre:function(c,a,by){var s=Math.sin(a.ph*TAU);for(var i=0;i<4;i++)paint(c,SP_([[-50,by-10],[-84-i*7,by-18+i*14+s*6],[-96-i*5,by+14+i*20+s*5],[-70,by+16+i*6],[-48,by+4]]),{f:lin(c,-50,by,-100,by+20,[0,'#ffffff',.5,'#fff0a8',1,'#f2b840']),sh:1,sb:5,lw:1.2,ol:'rgba(120,70,0,.5)'});
  glow(c,-88,by+10,38,'255,205,90',.4);flame(c,-100,by+16,16,40,'rgba(255,200,70,.9)','rgba(255,120,30,0)',a.ph,-1.2)},
 mid:function(c,a,by){scales(c,-60,by-30,60,by+30,5,'rgba(190,255,245,.4)','rgba(255,255,255,.25)');
  paint(c,EL(26,by+10,34,15,0),{f:lin(c,0,by,0,by+26,[0,'#fffbe8',1,'#d6ecee']),sh:0,rim:0,ol:0});
  c.strokeStyle='rgba(255,215,100,.9)';c.lineWidth=2.2;c.beginPath();c.moveTo(-50,by+6);c.quadraticCurveTo(0,by+18,50,by-4);c.stroke();
  for(var i=0;i<5;i++)flame(c,-40+i*18,by-22+Math.sin(i)*3,9,20,'rgba(255,215,90,.9)','rgba(255,255,255,0)',a.ph+i*.17,0,.8)},
 head:function(c,x,y,A,a,by){c.save();var hx=x+12+A*10,hy=y-40+A*18;
  tube(c,[[x-18,y+10],[x+2,y-14],[hx-8,hy+8]],30,22,lin(c,0,hy-10,0,y+14,[0,'#44d2c6',1,'#1e86ac']),'rgba(200,255,250,.3)');
  for(var i=0;i<7;i++){var t=i/6,px=(x-22)+t*(hx-x+12),py=(y-6)+t*(hy-y)-16-Math.sin(t*PI)*6;paint(c,SP_([[px-13,py+10],[px-7,py-16-Math.sin(a.ph*TAU+i)*3],[px+7,py+5]]),{f:lin(c,px,py-16,px,py+10,[0,'#fff',1,'#fff2c0']),sh:1,sb:3,lw:1,ol:'rgba(120,90,30,.45)'})}
  c.translate(hx,hy);c.rotate(A*.3+.12);
  paint(c,SP_([[-14,6],[-8,-22],[14,-28],[44,-16],[54,2],[48,14],[22,20],[2,22]]),{f:lin(c,0,-28,0,22,[0,'#52e2d2',1,'#1d86a8']),tx:function(c){scales(c,-14,-26,50,20,3.4,'rgba(190,255,245,.35)')}});
  poly(c,[[40,12],[52,36],[36,24]],lin(c,40,12,40,36,[0,'#fff',1,'#ffe9a0']),'rgba(120,90,30,.5)',1);for(var j=0;j<4;j++)poly(c,[[-4+j*3,14],[-14-j*4,30+j*6],[2+j*2,26+j*4]],'#fff',null);
  horn(c,[[0,-22],[-16,-42],[-40,-54],[-58,-50],[-38,-42],[-14,-28]],'#fff3b0','#d89a22');horn(c,[[10,-24],[4,-52],[-6,-74],[2,-52],[16,-30]],'#fff3b0','#d89a22');
  var o=A*10;poly(c,[[40,6],[54,8+o],[38,14+o*.6]],'#f4a898','rgba(80,20,20,.6)',1);
  eye(c,22,-8,5,'#ffbb2a','255,200,60');ell(c,50,-4,2.2,3,'#0b1626',null);c.restore()},
 post:function(c,a,by){glow(c,0,by,100,'90,235,230',.14)}},{ph:a.ph,mv:a.mv,A:a.A})}

/* ---------- 3 Thiên Tinh Hồ / 6 Cửu Vĩ Ma Hồ ---------- */
function fox(c,a,P){quad(c,{len:44,ry:22,h:40,w:6.5,lunge:30,bend:5,body:P.body,legC:P.leg,legD:P.legD,legH:P.hi,hoof:P.paw,ol:P.ol,
 pre:function(c,a,by){glow(c,-60,by-30,100,P.gl,.18);for(var i=0;i<9;i++){var t=i/8,ang=-2.65+t*1.9+Math.sin(a.ph*TAU+i*.7)*.07,L=80+Math.sin(i*1.7)*10,bx=-40,byy=by-4,ex=bx+Math.cos(ang)*L,ey=byy+Math.sin(ang)*L,mx=bx+Math.cos(ang-.5)*L*.55,my=byy+Math.sin(ang-.5)*L*.55;
   var nx=-Math.sin(ang),ny=Math.cos(ang),wd=16+((i%3)?0:3);
   paint(c,SP_([[bx,byy],[mx+nx*wd,my+ny*wd],[ex+nx*3,ey+ny*3],[ex,ey],[mx-nx*wd,my-ny*wd]]),{f:lin(c,bx,byy,ex,ey,[0,P.t0,.6,P.t1,1,P.t2]),sb:5,lw:1.3,ol:P.ol,tx:function(c){fur(c,bx-30,byy-90,bx+90,byy+30,34,10,ang,P.furc,.9)}});
   flame(c,ex,ey,13,24,P.fl,'rgba(255,255,255,0)',a.ph+i*.13,ang+PI/2);glow(c,ex,ey,20,P.gl,.45)}},
 mid:function(c,a,by){P.mark&&P.mark(c,by);fur(c,-46,by-24,46,by+22,70,9,.4,P.furc,1);paint(c,EL(22,by+10,26,13,0),{f:P.belly,sh:0,rim:0,ol:0})},
 head:function(c,x,y,A,a){c.save();c.translate(x,y);c.rotate(A*.3);
  paint(c,SP_([[10,-22],[16,-52],[28,-26]]),{f:lin(c,10,-52,20,-22,[0,P.ear,1,P.earD]),sb:3,lw:1.3,ol:P.ol});paint(c,SP_([[-6,-20],[-8,-50],[10,-26]]),{f:lin(c,-8,-50,0,-22,[0,P.ear,1,P.earD]),sb:3,lw:1.3,ol:P.ol});poly(c,[[12,-27],[16,-43],[23,-28]],P.earIn,null);
  paint(c,SP_([[-10,0],[-4,-24],[18,-26],[30,-14],[56,6],[54,12],[30,18],[6,22],[-8,16]]),{f:lin(c,0,-26,0,22,[0,P.face0,1,P.face1]),tx:function(c){fur(c,-10,-26,56,22,36,7,.3,P.furc,.9)},ol:P.ol});
  poly(c,[[30,4],[56,8],[44,18],[22,20]],P.muz,null);P.fm&&P.fm(c);
  ell(c,55,7,3.4,2.7,'#080814',null);var o=A*9;poly(c,[[40,14],[52,15+o],[36,18+o*.6]],'#f08a98','rgba(60,10,20,.6)',1);
  eye(c,26,-6,4.4,P.eye,P.gl);c.restore()},
 post:function(c,a,by){}},{ph:a.ph,mv:a.mv,A:a.A})}
function hotinh(c,a){fox(c,a,{body:[0,'#ffffff',.6,'#e6ecff',1,'#b8c6f4'],leg:'#f2f6ff',legD:'#bcc8ee',hi:'rgba(255,255,255,.7)',paw:'#8fa8ff',t0:'#ffffff',t1:'#dfe8ff',t2:'#6e94ff',fl:'rgba(110,160,255,.95)',gl:'120,170,255',belly:'#fff',ear:'#f6f9ff',earD:'#c8d4f8',earIn:'#a8bcff',face0:'#ffffff',face1:'#d8e2ff',muz:'#fff',eye:'#3a72ff',ol:'rgba(40,60,140,.7)',furc:['rgba(255,255,255,.9)','rgba(170,190,255,.6)','rgba(110,140,230,.4)'],
 mark:function(c,by){for(var i=0;i<4;i++)poly(c,[[-22+i*14,by-18],[-15+i*14,by-4],[-26+i*14,by-3]],'rgba(90,130,255,.85)',null)},fm:function(c){poly(c,[[18,-22],[26,-12],[14,-10]],'#5a88ff',null)}})}
function mahoo(c,a){fox(c,a,{body:[0,'#4a2438',.6,'#24101c',1,'#0c0610'],leg:'#2c1622',legD:'#180a12',hi:'rgba(255,120,150,.4)',paw:'#c01c3c',t0:'#2a1018',t1:'#7a1430',t2:'#ee2c58',fl:'rgba(255,60,100,.95)',gl:'255,60,100',belly:'#f6e8ec',ear:'#2c1622',earD:'#12060c',earIn:'#e02a52',face0:'#4a2438',face1:'#14080e',muz:'#f6eaee',eye:'#ff4040',ol:'rgba(10,0,10,.85)',furc:['rgba(255,70,110,.6)','rgba(120,30,60,.7)','rgba(20,8,14,.7)'],
 mark:function(c,by){for(var i=0;i<4;i++)poly(c,[[-28+i*15,by-20],[-21+i*15,by-4],[-32+i*15,by-2]],'rgba(255,50,90,.9)',null)},fm:function(c){poly(c,[[18,-22],[26,-12],[14,-10]],'#ff3a5c',null)}})}

/* ---------- 8 Cự Ma ---------- */
function cuma(c,a){quad(c,{len:64,ry:34,h:36,w:13,lunge:26,bend:8,body:[0,'#6a46ac',.5,'#2e1c58',1,'#140a2a'],legC:'#3e2874',legD:'#22143f',legH:'rgba(190,150,255,.35)',hoof:lin(c,0,-6,0,4,[0,'#a078f0',1,'#5a34a8']),ol:'rgba(8,0,20,.85)',
 pre:function(c,a,by){glow(c,0,by-20,130,'170,90,255',.2);for(var i=0;i<8;i++)flame(c,-60+i*18,by-26,22,60+Math.sin(i*2)*12,'rgba(170,80,255,.9)','rgba(110,40,220,0)',a.ph+i*.14,0);
  for(var j=0;j<6;j++)paint(c,SP_([[-48+j*18,by-30],[-40+j*18,by-60],[-34+j*18,by-28]]),{f:lin(c,0,by-60,0,by-28,[0,'#c8a8ff',1,'#4a2a90']),sb:3,lw:1,ol:'rgba(10,0,30,.8)'});
  var s=Math.sin(a.ph*TAU);paint(c,SP_([[-56,by-4],[-96,by-30+s*6],[-122,by-8],[-98,by+4],[-60,by+10]]),{f:lin(c,-56,by,-122,by,[0,'#2e1c58',1,'#8a60e0']),sb:5});flame(c,-120,by-8,16,38,'rgba(200,110,255,.95)','rgba(120,40,220,0)',a.ph,-1.2)},
 mid:function(c,a,by){fur(c,-64,by-34,64,by+34,120,12,.5,['rgba(190,140,255,.45)','rgba(20,8,40,.6)','rgba(110,70,190,.5)'],1.1);for(var i=0;i<3;i++)zig(c,-30+i*26,by-8,-22+i*26,by+14,4,3,'#d0a0ff',1.4,a.ph);
  paint(c,EL(46,by-14,27,25,0),{f:lin(c,0,by-40,0,by+10,[0,'#7a54bc',1,'#2c1c52']),lw:1.6,ol:'rgba(8,0,20,.8)'})},
 head:function(c,x,y,A,a){c.save();c.translate(x+6,y-4);c.rotate(A*.32);
  paint(c,SP_([[-20,8],[-10,-28],[22,-38],[54,-22],[64,6],[44,28],[8,30]]),{f:lin(c,0,-38,0,30,[0,'#6a46ac',1,'#1a0e34']),tx:function(c){fur(c,-20,-38,64,30,60,8,.2,['rgba(200,160,255,.4)','rgba(10,0,30,.6)'],1)},lw:1.8,ol:'rgba(8,0,20,.9)'});
  horn(c,[[-8,-26],[-34,-44],[-62,-40],[-72,-58],[-50,-66],[-30,-60],[0,-40]],'#d8b8ff','#3a2060');horn(c,[[24,-34],[34,-62],[58,-78],[52,-48],[44,-34]],'#d8b8ff','#3a2060');
  var o=A*16;poly(c,[[22,12],[62,14+o],[56,26+o],[26,28+o*.5]],'#2a0a1a','rgba(0,0,0,.8)',1.3);for(var i=0;i<4;i++)tri(c,[30+i*8,14+o*.5],[34+i*8,26+o*.8],[38+i*8,14+o*.5],'#f4eaff',null);
  glow(c,-66,-56,16,'200,150,255',.7);glow(c,56,-72,14,'200,150,255',.7);eye(c,36,-10,5.8,'#ffd62a','255,220,60');
  for(var f=0;f<4;f++)flame(c,-4+f*12,-34,10,32,'rgba(190,100,255,.9)','rgba(120,40,220,0)',a.ph+f*.2,0);c.restore()},
 post:function(c,a,by){}},{ph:a.ph,mv:a.mv,A:a.A})}
/* ---------- 4 Linh Thú Cự Quy ---------- */
function quy(c,a){var S=Math.sin(a.ph*TAU),mv=a.mv,A=a.A,bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*3:S*-1.2;
 c.save();c.translate(-12+A*6,0);c.scale(.92,.92);
 function leg(x,off,dk){var sw=Math.sin((a.ph+off)*TAU)*(mv?12:1.5),lf=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*7:0;
  paint(c,EL(x+sw,-16-lf,16,17,0),{f:lin(c,0,-34,0,0,dk?[0,'#2c8a74',1,'#144a40']:[0,'#44b898',1,'#1c6a58']),tx:function(c){scales(c,x+sw-16,-34-lf,x+sw+16,-2,4,'rgba(10,50,40,.5)')}});
  paint(c,EL(x+sw+4,-4-lf,14,5,0),{f:lin(c,0,-9,0,0,[0,'#f2d078',1,'#b88a30']),sh:0,rim:0,lw:1})}
 leg(-52,0,1);leg(52,.5,1);glow(c,0,-90,130,'255,225,130',.15);
 var hx=84+A*26,hy=-70+bob+A*8;
 tube(c,[[62,-62],[(62+hx)/2,-66],[hx,hy]],20,17,lin(c,0,hy-10,0,hy+14,[0,'#4cc6a0',1,'#1e7a62']),'rgba(200,255,230,.35)');
 poly(c,[[-78,-34],[-106,-26],[-76,-24]],lin(c,-106,0,-76,0,[0,'#1c6a58',1,'#3aa888']),'rgba(0,30,20,.7)',1.3);
 /* mai */
 paint(c,SP_([[-90,-30],[-84,-100],[-40,-136],[10,-142],[58,-122],[88,-80],[92,-30],[0,-22]]),{f:lin(c,-40,-142,40,-24,[0,'#58dcb0',.35,'#2fa07e',.75,'#1a6a58',1,'#0e3a34']),sb:14,lw:2.2,ol:'rgba(0,25,20,.9)',
  tx:function(c){c.strokeStyle='rgba(255,230,150,.6)';c.lineWidth=1.6;for(var r=0;r<3;r++)for(var k=-3;k<4;k++){c.beginPath();c.arc(k*28+(r%2)*14,-112+r*28,17,0,TAU);c.stroke();c.beginPath();c.arc(k*28+(r%2)*14-2,-114+r*28,10,0,TAU);c.strokeStyle='rgba(180,255,220,.25)';c.stroke();c.strokeStyle='rgba(255,230,150,.6)'}
   fur(c,-90,-140,90,-24,40,10,1.2,['rgba(30,90,70,.5)'],1.3)}});
 poly(c,[[-92,-30],[-86,-102],[-40,-140],[10,-146],[58,-126],[90,-82],[94,-30]],null,'#f2cf68',3,true);
 for(var t=0;t<3;t++){var w=34-t*9,y0=-142-t*17;paint(c,SP_([[-w,y0],[-w+4,y0-14],[w-4,y0-14],[w,y0]]),{f:lin(c,0,y0-14,0,y0,[0,'#f6dc88',1,'#b0802e']),sh:0,lw:1.2,ol:'rgba(70,40,0,.8)'});tri(c,[-w-6,y0-13],[0,y0-28],[w+6,y0-13],lin(c,0,y0-28,0,y0-13,[0,'#e86a48',1,'#a03020']),'rgba(60,10,0,.8)',1.3)}
 for(var q=0;q<3;q++){var cx=-72+q*14;paint(c,SP_([[cx,-112],[cx+6,-142-q*8],[cx+12,-112]]),{f:lin(c,cx,-140,cx+12,-112,[0,'#d8f6ff',1,'#3a9ae8']),sb:3,lw:1,ol:'rgba(10,40,90,.8)'});glow(c,cx+6,-128,18,'120,210,255',.6)}
 paint(c,EL(hx,hy,22,17,0),{f:lin(c,0,hy-17,0,hy+17,[0,'#58cca6',1,'#1e7a62']),tx:function(c){scales(c,hx-22,hy-17,hx+22,hy+17,3.4,'rgba(0,50,40,.35)')}});
 poly(c,[[hx-14,hy-14],[hx-6,hy-30],[hx+4,hy-16]],lin(c,0,hy-30,0,hy-14,[0,'#fff1a0',1,'#d09a28']),'rgba(70,40,0,.7)',1.2);
 eye(c,hx+8,hy-3,4.6,'#ffc83a','255,210,80');var o=A*8;poly(c,[[hx+12,hy+6],[hx+24,hy+8+o],[hx+10,hy+12+o*.5]],'#d06a58','rgba(60,10,10,.7)',1);
 leg(-34,.5,0);leg(36,0,0);c.restore()}

/* ---------- 5 Huyền Vũ / 10 Hắc Long : rồng cuộn ---------- */
function coil(c,a,P){var A=a.A,ph=a.ph,N=72,pts=[],i;
 var hxT=P.hx+A*30,hyT=P.hy+A*22+Math.sin(ph*TAU)*(a.mv?2:3);
 for(i=0;i<=N;i++){var s=i/N,x,y,d;
  if(s<.74){var u=s/.74,th=PI*.15+u*PI*P.turns,rx=P.rx*(1-u*.32),ry=P.ry*(1-u*.2),cy=P.cy-u*P.rise;x=P.cx+rx*Math.cos(th);y=cy+ry*Math.sin(th);d=Math.sin(th)}
  else{var v=(s-.74)/.26,th2=PI*.15+PI*P.turns,rx2=P.rx*.68,ry2=P.ry*.8,cy2=P.cy-P.rise,x0=P.cx+rx2*Math.cos(th2),y0=cy2+ry2*Math.sin(th2),e=v*v*(3-2*v);x=x0+(hxT-x0)*e+Math.sin(v*PI)*P.bulge;y=y0+(hyT-y0)*e;d=1}
  var wv=Math.sin(ph*TAU*(a.mv?2:1)-s*7)*(a.mv?4:2.4)*(.4+s);y+=wv*.6;x+=wv*.3;pts.push({x:x,y:y,d:d,s:s,w:P.w0+(P.w1-P.w0)*Math.pow(Math.sin(Math.min(1,s*1.08)*PI*.5),.8)})}
 if(P.aura)glow(c,P.cx,P.cy-30,130,P.glow,.24);
 function grp(list){c.lineCap='round';
  list.forEach(function(i){var p=pts[i],q=pts[i+1];c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineWidth=(p.w+q.w)/2+3.4;c.strokeStyle=P.ol;c.stroke()});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineWidth=w;c.strokeStyle=p.d>.3?P.c2:P.c1;c.stroke()});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;c.beginPath();c.moveTo(p.x,p.y+w*.22);c.lineTo(q.x,q.y+w*.22);c.lineWidth=w*.5;c.strokeStyle=P.c0;c.globalAlpha=.6;c.stroke();c.globalAlpha=1});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;if(p.s>.66||p.d>.5){c.beginPath();c.moveTo(p.x,p.y+w*.3);c.lineTo(q.x,q.y+w*.3);c.lineWidth=w*.34;c.strokeStyle=P.belly;c.stroke();if(i%3===0){c.beginPath();c.moveTo(p.x-w*.18,p.y+w*.12);c.lineTo(p.x-w*.18,p.y+w*.46);c.lineWidth=.9;c.strokeStyle='rgba(120,100,70,.35)';c.stroke()}}});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;c.beginPath();c.moveTo(p.x,p.y-w*.24);c.lineTo(q.x,q.y-w*.24);c.lineWidth=w*.22;c.strokeStyle='rgba(255,255,255,.3)';c.stroke()});
  list.forEach(function(i){var p=pts[i];if(i%3===0){c.beginPath();c.arc(p.x,p.y-p.w*.08,Math.max(1,p.w*.14),0,PI);c.strokeStyle=P.sc;c.lineWidth=.9;c.stroke()}})}
 var back=[],front=[];for(i=0;i<N;i++)(pts[i].d>0?front:back).push(i);grp(back);grp(front);
 flame(c,pts[0].x,pts[0].y,18,40,P.fl,'rgba(255,255,255,0)',ph,-.6);
 for(i=62;i>8;i-=3){var p=pts[i];if(p.d<.2&&i<50)continue;paint(c,SP_([[p.x-3,p.y-p.w*.5],[p.x-10,p.y-p.w*.5-13],[p.x+4,p.y-p.w*.5]]),{f:lin(c,p.x,p.y-p.w*.5-13,p.x,p.y-p.w*.5,[0,P.fin,1,P.c1]),sh:0,rim:0,lw:.9,ol:P.ol})}
 var hd=pts[N],nk=pts[N-7],ang=Math.atan2(hd.y-nk.y,hd.x-nk.x)*.35+A*.35-.1;
 c.save();c.translate(hd.x,hd.y);c.rotate(ang);var mo=A*14+(P.roar?6:0);
 for(i=0;i<4;i++){var wy=Math.sin(ph*TAU+i)*4;poly(c,[[-10,-6+i*5],[-44-i*10,-14+i*12+wy],[-88-i*8,0+i*16+wy],[-46-i*6,-2+i*11],[-12,-2+i*4]],P.mane,null)}
 paint(c,SP_([[26,4],[64,2+mo*.4],[58,14+mo],[22,20+mo*.5],[-6,20+mo*.3]]),{f:lin(c,0,0,0,20,[0,P.jaw,1,P.c0]),lw:1.4,ol:P.ol});
 for(i=0;i<5;i++)tri(c,[26+i*7,5],[29+i*7,14+mo*.4],[32+i*7,5],'#fffdf0',null);
 paint(c,SP_([[-18,-14],[-6,-26],[24,-22],[56,-12],[64,0],[28,6],[-8,16],[-20,10]]),{f:lin(c,0,-26,0,16,[0,P.c2,1,P.c1]),tx:function(c){scales(c,-20,-26,62,16,3,P.sc)},lw:1.7,ol:P.ol});
 horn(c,[[-6,-20],[-30,-52],[-22,-74],[-10,-42]],'#fff3b0','#d89420');horn(c,[[8,-22],[-6,-58],[6,-74],[16,-34]],'#fff3b0','#d89420');
 c.beginPath();c.moveTo(50,-4);c.bezierCurveTo(70,-24+Math.sin(ph*TAU)*5,90,-8,104,-20+Math.sin(ph*TAU+1)*6);c.strokeStyle=P.whisk;c.lineWidth=1.8;c.stroke();c.beginPath();c.moveTo(52,4);c.bezierCurveTo(72,16,92,2,106,12+Math.sin(ph*TAU+2)*5);c.stroke();
 eye(c,22,-8,5.2,P.eye,P.eyeg);ell(c,60,-6,2,2,'#050510',null);c.restore();
 if(P.drop)for(i=0;i<6;i++){var q=(ph*2+i*.2)%1;ell(c,P.cx-76+i*30,P.cy-20-q*76,3,4,'rgba(200,250,255,'+(1-q)*.8+')',null)}}
function huyenvu(c,a){coil(c,a,{cx:-4,cy:-40,rx:70,ry:34,rise:46,turns:2.3,hx:70,hy:-156,bulge:26,w0:5,w1:30,c0:'#0c5c60',c1:'#17958e',c2:'#2ec6b8',belly:'#f0f8ea',sc:'rgba(200,255,245,.4)',fin:'#5aeadc',fl:'rgba(120,255,230,.9)',jaw:'#1a9c94',mane:'rgba(70,230,205,.75)',whisk:'#a8f6ee',eye:'#ffd23a',eyeg:'255,210,80',glow:'80,240,220',aura:1,drop:1,ol:'rgba(0,30,34,.85)'})}
function hacrong(c,a){coil(c,a,{cx:-8,cy:-42,rx:72,ry:34,rise:52,turns:2.4,hx:40,hy:-178,bulge:-30,w0:6,w1:34,c0:'#061c3a',c1:'#103e74',c2:'#2468b0',belly:'#d8eefc',sc:'rgba(120,230,255,.5)',fin:'#3ad0ff',fl:'rgba(80,210,255,.95)',jaw:'#143c70',mane:'rgba(60,175,255,.7)',whisk:'#8fe4ff',eye:'#b8f6ff',eyeg:'120,230,255',glow:'60,190,255',aura:1,roar:1,ol:'rgba(0,10,30,.9)'})}

/* ---------- 7 Thiên Đình Chiến Sĩ ---------- */
function chiensi(c,a){var mv=a.mv,A=a.A,S=Math.sin(a.ph*TAU),bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*4:S*-1.4;
 c.save();c.translate(A*27,bob);
 glow(c,4,-168,60,'255,230,140',.4);glow(c,0,-100,110,'255,230,150',.14);c.strokeStyle='rgba(255,226,120,.95)';c.lineWidth=3.2;c.beginPath();c.ellipse(4,-170,34,34,0,0,TAU);c.stroke();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.2;c.beginPath();c.ellipse(4,-170,28,28,0,0,TAU);c.stroke();
 for(var h=0;h<8;h++){var ha=h*TAU/8;tri(c,[4+Math.cos(ha)*34,-170+Math.sin(ha)*34],[4+Math.cos(ha)*44,-170+Math.sin(ha)*44],[4+Math.cos(ha+.12)*34,-170+Math.sin(ha+.12)*34],'rgba(255,235,150,.9)',null)}
 function leg(x,off,dk){var sw=Math.sin((a.ph+off)*TAU)*(mv?20:2),lf=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*10:0,fx=x+sw,fy=-lf;tube(c,[[x*.6,-84],[(x*.6+fx)/2+5,-44],[fx,fy-8]],14,10,dk?lin(c,0,-84,0,0,[0,'#c8aa5a',1,'#6a5224']):lin(c,0,-84,0,0,[0,'#fff0c0',1,'#c09a3c']),'rgba(255,255,255,.4)');paint(c,SP_([[fx-8,fy-4],[fx+16,fy-3],[fx+16,fy+4],[fx-8,fy+4]]),{f:lin(c,0,fy-4,0,fy+4,[0,'#f0d070',1,'#9a7420']),sh:0,lw:1.2})}
 leg(-8,0,1);
 paint(c,SP_([[-14,-148],[-46-Math.sin(a.ph*TAU)*5,-100],[-54,-42],[-20,-54],[-6,-100]]),{f:lin(c,-14,-148,-50,-44,[0,'#ffffff',.5,'#cfe6ff',1,'#6fa8e8']),sb:8,lw:1.4,ol:'rgba(20,50,100,.7)'});
 tube(c,[[-10,-138],[-22,-116],[-12,-100+A*-8]],9,7,lin(c,0,-138,0,-100,[0,'#f0d684',1,'#a07a28']),'rgba(255,255,255,.4)');
 leg(14,.5,0);
 paint(c,SP_([[-20,-148],[-26,-96],[-16,-80],[26,-80],[34,-96],[26,-148],[4,-158]]),{f:lin(c,-20,-158,30,-78,[0,'#fffbe8',.35,'#f4d878',.7,'#c49a38',1,'#8a6420']),sb:7,lw:2,ol:'rgba(60,40,0,.85)',tx:function(c){c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;for(var i=0;i<5;i++){c.beginPath();c.moveTo(-18,-140+i*12);c.quadraticCurveTo(4,-132+i*12,28,-140+i*12);c.stroke()}}});
 poly(c,[[-8,-146],[4,-118],[18,-146]],lin(c,0,-146,0,-118,[0,'#8ad0ff',1,'#2a78d0']),'rgba(10,40,100,.8)',1.2);ell(c,4,-124,7,7,rad(c,4,-124,7,[0,'#fff',1,'#3a98ff']),'rgba(10,40,100,.8)',1.3);glow(c,4,-124,16,'120,200,255',.7);
 paint(c,SP_([[-26,-150],[-44,-162],[-34,-136]]),{f:lin(c,-44,-160,-26,-140,[0,'#fff',1,'#e8c860']),sb:3,lw:1.2,ol:'rgba(60,40,0,.8)'});paint(c,SP_([[26,-150],[46,-162],[36,-138]]),{f:lin(c,26,-160,46,-140,[0,'#fff6c8',1,'#c89a38']),sb:3,lw:1.2,ol:'rgba(60,40,0,.8)'});
 paint(c,SP_([[-14,-178],[-12,-200],[6,-212],[24,-200],[26,-176],[20,-158],[4,-154],[-8,-160]]),{f:lin(c,-14,-212,26,-154,[0,'#fffbe0',.4,'#f0cc60',1,'#8a6420']),lw:1.8,ol:'rgba(60,40,0,.85)'});
 poly(c,[[-6,-178],[22,-180],[22,-168],[-4,-166]],'rgba(10,24,60,.92)','rgba(255,230,140,.8)',1);glow(c,8,-173,14,'120,210,255',.7);ell(c,2,-173,2.6,1.6,'#aee8ff',null);ell(c,13,-173,2.6,1.6,'#aee8ff',null);
 poly(c,[[2,-206],[6,-238],[10,-206]],lin(c,0,-238,0,-206,[0,'#ff7a5a',1,'#b02818']),'rgba(60,0,0,.8)',1.2);poly(c,[[-14,-190],[-30,-196],[-18,-178]],'#f0d070','rgba(60,40,0,.8)',1);poly(c,[[26,-190],[42,-196],[30,-178]],'#e0b850','rgba(60,40,0,.8)',1);
 var ex=36+A*40,ey=-112+A*8;tube(c,[[20,-138],[30,-122],[ex,ey]],10,8,lin(c,0,-138,0,-110,[0,'#fff0b0',1,'#b8902c']),'rgba(255,255,255,.4)');ell(c,ex,ey,6,6,'#fff',null);
 var ang=-.95*(1-A*.92)-.05;c.save();c.translate(ex,ey);c.rotate(ang);c.strokeStyle='rgba(40,25,0,.85)';c.lineWidth=7;c.beginPath();c.moveTo(-70,0);c.lineTo(120,0);c.stroke();c.strokeStyle=lin(c,-70,0,120,0,[0,'#a07a28',.5,'#f4d878',1,'#c89a38']);c.lineWidth=4.4;c.stroke();
 poly(c,[[120,-10],[166,0],[120,10],[130,0]],lin(c,120,0,166,0,[0,'#ffffff',1,'#7fd8ff']),'rgba(10,50,100,.85)',1.4);glow(c,152,0,30,'180,240,255',.8);c.restore();
 c.restore()}

/* ---------- 9 Lôi Điện Thần Sứ ---------- */
function loidien(c,a){var A=a.A,mv=a.mv,hv=Math.sin(a.ph*TAU)*(mv?5:4)-24,sw=Math.sin(a.ph*TAU)*(mv?8:3);
 c.save();c.translate(A*8,hv);ell(c,0,26,44,8,'rgba(0,0,0,.2)',null);
 glow(c,4,-130,100,'90,170,255',.3);glow(c,6,-190,44,'200,235,255',.55);c.strokeStyle='rgba(180,225,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(6,-190,30,30,0,0,TAU);c.stroke();
 for(var i=0;i<3;i++){var q=a.ph*TAU+i*2.1,cx=Math.cos(q)*70,cy=-116+Math.sin(q)*26;if(Math.sin(q)<0)zig(c,cx,cy,cx+Math.cos(q+1)*30,cy-26,5,5,'#8ad0ff',1.6,a.ph+i*.2)}
 paint(c,SP_([[-8,-160],[-52-sw,-60],[-64-sw,6],[-14,-4],[44+sw,8],[58+sw,-56],[18,-160]]),{f:lin(c,-30,-160,40,8,[0,'#7ab6ff',.45,'#3a64c4',1,'#141c60']),sb:12,lw:2,ol:'rgba(4,10,50,.9)',
  tx:function(c){c.strokeStyle='rgba(180,220,255,.35)';c.lineWidth=1.2;for(var k=0;k<9;k++){c.beginPath();c.moveTo(-6+k*3,-156);c.quadraticCurveTo(-30+k*9-sw,-70,-56+k*13-sw*.8,4);c.stroke()}c.strokeStyle='rgba(255,225,130,.7)';c.lineWidth=2;c.beginPath();c.moveTo(-50-sw,-30);c.quadraticCurveTo(0,-14,52+sw,-30);c.stroke()}});
 for(var k=0;k<4;k++)poly(c,[[-40+k*22,-40],[-34+k*22,-10],[-44+k*22,-8]],'rgba(255,230,150,.6)',null);
 paint(c,SP_([[-12,-158],[30,-158],[28,-146],[-10,-146]]),{f:lin(c,0,-158,0,-146,[0,'#fff0b0',1,'#b8902c']),sh:0,lw:1.2,ol:'rgba(60,40,0,.8)'});
 tube(c,[[-18,-144],[-56,-120+Math.sin(a.ph*TAU)*3],[-78,-98]],14,24,lin(c,0,-144,0,-98,[0,'#5a88e8',1,'#1c2e8a']),'rgba(190,225,255,.4)');
 var ax=48+A*46,ay=-128-A*34;tube(c,[[20,-146],[36,-132],[ax,ay]],14,18,lin(c,0,-146,0,-110,[0,'#6a98f0',1,'#2640a8']),'rgba(190,225,255,.4)');ell(c,ax+6,ay,7,7,'#f4dcc4','rgba(60,30,10,.7)',1.2);
 paint(c,SP_([[-8,-186],[-20,-206],[6,-220],[30,-208],[22,-182],[24,-160],[-4,-160]]),{f:lin(c,-10,-220,26,-160,[0,'#ffffff',1,'#b8d0f0']),sb:5,lw:1.4,ol:'rgba(20,40,90,.7)'});
 ell(c,6,-184,16,19,lin(c,0,-203,0,-165,[0,'#f8e8d6',1,'#d8b8a0']),'rgba(60,30,10,.65)',1.3);
 paint(c,SP_([[-12,-190],[2,-212],[22,-202],[24,-188],[10,-198]]),{f:'#f0f6ff',sh:0,lw:1,ol:'rgba(20,40,90,.6)'});eye(c,12,-184,3.8,'#40b0ff','120,210,255');tri(c,[3,-198],[7,-188],[11,-198],'#4aa8ff',null);
 for(var j=0;j<2;j++){var yy=-96+j*38;zig(c,-52,yy+8,-86,yy+30,6,5,'#9fd8ff',1.4,a.ph+j*.3)}
 if(A>.15){var f=Math.sin(A*PI);zig(c,ax+10,ay,ax+110*f+30,ay+70,7,14,'#bfe6ff',3,A);zig(c,ax+10,ay,ax+90*f+30,ay+20,6,10,'#fff',2,A+.3);glow(c,ax+90*f,ay+40,50,'170,225,255',.75*f)}
 glow(c,ax+6,ay,18,'170,225,255',.55+A*.4);c.restore()}

/* ---------- 11 Thanh Trùng ---------- */
function thanhtrung(c,a){var A=a.A,ph=a.ph,mv=a.mv,hv=-98+Math.sin(ph*TAU)*(mv?6:4),fl=Math.sin(ph*TAU*(mv?2:1.4)),ow=A*26;
 c.save();c.translate(ow*.6,hv);ell(c,-ow*.6,-hv-4,50,7,'rgba(0,0,0,.2)',null);glow(c,0,0,120,'150,130,255',.28);
 function wg(len,ang,base,f){c.save();c.translate(-4,-14);c.rotate(ang);c.scale(1,.45+.55*Math.abs(Math.cos(f*1.2)));
  paint(c,SP_([[0,0],[len*.2,-len*.62],[len*.62,-len*.98],[len*.98,-len*.62],[len*.86,-len*.12],[len*.4,len*.06]]),{f:lin(c,0,0,len,-len*.6,[0,base[0],.5,base[1],1,base[2]]),sb:10,lw:1.4,ol:'rgba(50,40,130,.8)',
   tx:function(c){c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1;for(var k=1;k<7;k++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.3*k/3,-len*.7,len*(.2+k*.12),-len*(1-k*.11));c.stroke()}c.strokeStyle='rgba(120,90,230,.35)';for(var k2=1;k2<5;k2++){c.beginPath();c.arc(len*.62,-len*.62,len*.1*k2,0,TAU);c.stroke()}}});
  ell(c,len*.62,-len*.62,len*.1,len*.1,'rgba(255,255,255,.6)','rgba(80,60,200,.6)',1.1);c.restore()}
 wg(98,-.55+fl*.25,['rgba(255,255,255,.85)','rgba(160,205,255,.75)','rgba(150,90,240,.65)'],fl);
 var sp=[];for(var i=0;i<=22;i++){var s=i/22;sp.push([-78+s*118+Math.sin(ph*TAU-s*5)*3,10+Math.sin(s*PI*1.4+ph*TAU)*10-s*14+(1-s)*30])}
 tube(c,sp,5,26,lin(c,0,-20,0,40,[0,'#5a8ae8',1,'#1c3a9a']),'rgba(200,230,255,.45)');for(var j=2;j<22;j+=2){ell(c,sp[j][0],sp[j][1]+3,4,3.4,'#d8f0ff',null);paint(c,SP_([[sp[j][0]-3,sp[j][1]-8],[sp[j][0]-9,sp[j][1]-19],[sp[j][0]+3,sp[j][1]-8]]),{f:'#8ae0ff',sh:0,rim:0,lw:.9})}
 flame(c,sp[0][0],sp[0][1],16,34,'rgba(140,200,255,.9)','rgba(255,255,255,0)',ph,-1.3);
 var hx=sp[22][0],hy=sp[22][1];c.save();c.translate(hx+6,hy-4);c.rotate(.1+A*.3);
 paint(c,SP_([[-14,-12],[8,-18],[34,-8],[40,6],[8,14],[-12,8]]),{f:lin(c,0,-18,0,14,[0,'#6a98f0',1,'#24409a']),lw:1.4,ol:'rgba(10,20,80,.85)'});poly(c,[[8,0],[40,3],[36,12+A*10],[6,12+A*6]],'#24388a','rgba(0,0,40,.8)',1.2);
 horn(c,[[-6,-14],[-26,-44],[-16,-64],[-8,-40],[-2,-58],[4,-36]],'#f0fbff','#8ab4e8');horn(c,[[8,-16],[16,-46],[32,-58],[24,-34]],'#e0f0ff','#7aa8e0');
 eye(c,10,-6,4.2,'#a0ffff','200,255,255');c.restore();
 wg(112,-1.05+fl*.3,['rgba(255,255,255,.75)','rgba(190,170,255,.7)','rgba(120,80,230,.65)'],-fl);wg(76,-.1+fl*.2,['rgba(255,235,255,.75)','rgba(180,160,255,.65)','rgba(100,90,230,.6)'],fl*.8);
 if(A>.2)for(var m=0;m<6;m++){var z=(A*2+m*.17)%1;glow(c,hx+40+z*80,hy+z*20+Math.sin(m*3)*12,10,'190,150,255',.9*(1-z))}
 c.restore()}

/* ---------- 12 Tiên Linh ---------- */
function tienlinh(c,a){var A=a.A,ph=a.ph,mv=a.mv,hv=-52+Math.sin(ph*TAU)*(mv?5:4);
 c.save();c.translate(A*10,hv);ell(c,-A*10,-hv-2,30,6,'rgba(0,0,0,.18)',null);glow(c,0,-30,100,'160,215,255',.32);
 for(var i=0;i<3;i++){var sw=Math.sin(ph*TAU+i*1.2)*6;(function(){var P=[],k;for(k=0;k<=14;k++){var u=k/14;P.push([-24-u*(88+i*8),-18-u*(34+i*10)-Math.sin(u*PI)*12+sw*u])}tube(c,P,13-i,3,'rgba(200,236,255,.9)','rgba(255,255,255,.6)','rgba(70,120,210,.55)');glow(c,P[14][0],P[14][1],20,'160,215,255',.55)})()}
 var eo=Math.sin(ph*TAU)*.07;
 for(var e=0;e<2;e++){c.save();c.translate(2+e*16,-72);c.rotate(-.35+e*.45+eo);paint(c,SP_([[-9,0],[-12,-36],[-3,-66],[7,-36],[9,0]]),{f:lin(c,0,-66,0,0,[0,'#ffffff',1,'#d4e4ff']),tx:function(c){fur(c,-10,-60,10,-2,14,6,1.5,['rgba(160,190,240,.6)'],.9)},ol:'rgba(50,80,150,.7)'});poly(c,[[-4,-4],[-5,-32],[0,-54],[4,-32],[4,-4]],lin(c,0,-54,0,-4,[0,'#f9a8cc',1,'#fce0ee']),null);c.restore()}
 paint(c,EL(0,-14,30,26,0),{f:lin(c,0,-40,0,12,[0,'#ffffff',.6,'#eef3ff',1,'#b8ccf4']),tx:function(c){fur(c,-30,-40,30,12,40,7,1.5,['rgba(255,255,255,.9)','rgba(150,180,240,.5)'],1)},ol:'rgba(50,80,150,.7)'});
 var hx=24+A*8,hy=-44;paint(c,EL(hx,hy,24,21,0),{f:lin(c,0,hy-20,0,hy+20,[0,'#fff',1,'#d4e2ff']),tx:function(c){fur(c,hx-24,hy-21,hx+24,hy+21,30,6,1.3,['rgba(255,255,255,.9)','rgba(150,180,240,.4)'],.9)},ol:'rgba(50,80,150,.7)'});
 poly(c,[[hx-2,hy-18],[hx+4,hy-30],[hx+10,hy-18],[hx+4,hy-12]],lin(c,0,hy-30,0,hy-12,[0,'#a8d8ff',1,'#3a88ff']),'rgba(20,50,140,.8)',1.1);glow(c,hx+4,hy-20,14,'120,200,255',.7);
 eye(c,hx+10,hy-2,7.5,'#2a98ff','120,200,255');ell(c,hx+24,hy+6,2.8,2.2,'#e07a98',null);ell(c,hx+4,hy+8,4.4,2.8,'rgba(255,150,170,.5)',null);
 for(var l=0;l<2;l++)paint(c,EL(-8+l*20+(mv?Math.sin(ph*TAU+l*3)*3:0),14,8.5,5.4,0),{f:'#fff',sh:1,sb:3,lw:1.2,ol:'rgba(50,80,150,.7)'});
 if(A>0){var f=Math.sin(A*PI);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(170,225,255,'+f+')';c.lineWidth=4;c.beginPath();c.ellipse(20,-26,30+A*80,22+A*60,0,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(20,-26,18+A*56,12+A*40,0,0,TAU);c.stroke();c.restore();for(var s=0;s<8;s++){var z=(A+s*.12)%1;glow(c,20+Math.cos(s)*z*90,-26+Math.sin(s)*z*60,9,'200,240,255',.9*(1-z))}}
 for(var p=0;p<5;p++){var z2=(ph*.7+p*.2)%1;glow(c,-30+p*24,-10-z2*80,5.5,'200,235,255',.9*(1-z2))}
 c.restore()}

var SP=[
 {id:'hac',name:'Thanh Linh Hạc',h:122,rg:1,col:'#7fe8ff',fn:hac},
 {id:'kylan',name:'Ngọc Kỳ Lân',h:114,rg:0,col:'#ffd86a',fn:kylan},
 {id:'hotinh',name:'Thiên Tinh Hồ',h:94,rg:0,col:'#9ab8ff',fn:hotinh},
 {id:'quy',name:'Linh Thú Cự Quy',h:106,rg:0,col:'#8affc8',fn:quy},
 {id:'huyenvu',name:'Huyền Vũ',h:128,rg:0,col:'#5fe8d8',fn:huyenvu},
 {id:'mahoo',name:'Cửu Vĩ Ma Hồ',h:98,rg:0,col:'#ff5a7a',fn:mahoo},
 {id:'chiensi',name:'Thiên Đình Chiến Sĩ',h:128,rg:0,col:'#ffe08a',fn:chiensi},
 {id:'cuma',name:'Cự Ma',h:114,rg:0,col:'#b070ff',fn:cuma},
 {id:'loidien',name:'Lôi Điện Thần Sứ',h:130,rg:1,col:'#7ab8ff',fn:loidien},
 {id:'hacrong',name:'Hắc Long',h:150,rg:0,col:'#4ac8ff',fn:hacrong},
 {id:'thanhtrung',name:'Thanh Trùng',h:112,rg:1,col:'#c0a0ff',fn:thanhtrung},
 {id:'tienlinh',name:'Tiên Linh',h:88,rg:1,col:'#bfe8ff',fn:tienlinh}];
var FR={n:16,idle:[0,4],move:[4,10],atk:[10,16],size:320,cols:4,ox:160,oy:297.5,logic:256};
function params(f){if(f<4)return{ph:f/4,mv:0,A:0};if(f<10)return{ph:(f-4)/6,mv:1,A:0};var t=(f-10)/5;return{ph:(f-10)/6,mv:0,A:t<.4?t/.4:1-(t-.4)/.6*.85}}
function draw(c,i,f){var k=FR.size/FR.logic;KS=k;SEED=1234+i*77;c.save();c.scale(k,k);c.translate(128,238);c.lineJoin='round';c.lineCap='round';SP[i].fn(c,params(f));c.restore()}
window.TGMART={SP:SP,FR:FR,draw:draw,params:params};
})();
