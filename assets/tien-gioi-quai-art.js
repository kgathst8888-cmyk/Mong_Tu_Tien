/* ===== 🎨 12 QUÁI TIÊN GIỚI — bộ vẽ sprite (assets/tien-gioi-quai-art.js) · Fix360 =====
 * Thuần canvas 2D, KHÔNG phụ thuộc game. Vẽ ra nền TRONG SUỐT, nhìn ngang, quay mặt sang PHẢI (game lật trái/phải).
 * Khung 256×256, chân đứng tại (128,238). Mỗi quái 16 khung: 0-3 đứng, 4-9 di chuyển, 10-15 tấn công.
 * Dùng 2 nơi: (1) tools/gen_tg_quai.py xuất PNG sprite-sheet (assets/tien-gioi-quai/*.png);
 *             (2) world/115 vẽ dự phòng ngay trong game nếu PNG không tải được.
 * API: TGMART.SP (danh sách), TGMART.draw(ctx,spIndex,frameIndex), TGMART.FR={n:16,idle:[0,4],move:[4,10],atk:[10,16]} */
(function(){
'use strict';
var TAU=Math.PI*2,PI=Math.PI,OUT='#0b1626';
function lin(c,x0,y0,x1,y1,s){var q=c.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<s.length;i+=2)q.addColorStop(s[i],s[i+1]);return q}
function rad(c,x,y,r,s){var q=c.createRadialGradient(x,y,0,x,y,r);for(var i=0;i<s.length;i+=2)q.addColorStop(s[i],s[i+1]);return q}
function ell(c,x,y,rx,ry,f,o,lw,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU);if(f){c.fillStyle=f;c.fill()}if(o){c.strokeStyle=o;c.lineWidth=lw||2;c.stroke()}}
function pth(c,p,f,o,lw,open){c.beginPath();var n=p.length;if(open){c.moveTo(p[0][0],p[0][1]);for(var i=1;i<n-1;i++)c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);c.lineTo(p[n-1][0],p[n-1][1])}
 else{c.moveTo((p[0][0]+p[n-1][0])/2,(p[0][1]+p[n-1][1])/2);for(var j=0;j<n;j++){var a=p[j],b=p[(j+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath()}
 if(f){c.fillStyle=f;c.fill()}if(o){c.strokeStyle=o;c.lineWidth=lw||2;c.lineJoin='round';c.stroke()}}
function tube(c,p,w0,w1,f,o){var n=p.length-1,i,k;c.lineCap='round';c.lineJoin='round';
 for(k=o?0:1;k<2;k++)for(i=0;i<n;i++){c.beginPath();c.moveTo(p[i][0],p[i][1]);c.lineTo(p[i+1][0],p[i+1][1]);c.lineWidth=w0+(w1-w0)*(i+.5)/n+(k?0:3.2);c.strokeStyle=k?f:o;c.stroke()}}
function glow(c,x,y,r,col,al){c.save();c.globalCompositeOperation='lighter';var q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+col+','+al+')');q.addColorStop(.5,'rgba('+col+','+al*.35+')');q.addColorStop(1,'rgba('+col+',0)');c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function eye(c,x,y,r,col,ang){ell(c,x,y,r,r*.72,'#fff',OUT,1.2,ang||0);ell(c,x+r*.18,y,r*.5,r*.5,col,null);ell(c,x+r*.28,y,r*.2,r*.2,'#050510',null);ell(c,x+r*.1,y-r*.22,r*.16,r*.16,'#fff',null)}
function tri(c,a,b,d,f,o,lw){pth(c,[a,b,d],f,o,lw)}
function zig(c,x0,y0,x1,y1,n,amp,col,w,ph){c.save();c.lineCap='round';c.lineJoin='round';var dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,i;
 c.beginPath();c.moveTo(x0,y0);for(i=1;i<n;i++){var u=i/n,o=((i%2)?1:-1)*amp*(1-Math.abs(u-.5)*.6)*(1+.4*Math.sin(ph*TAU+i));c.lineTo(x0+dx*u+nx*o,y0+dy*u+ny*o)}c.lineTo(x1,y1);
 c.shadowColor=col;c.shadowBlur=10;c.strokeStyle=col;c.lineWidth=w+3;c.globalAlpha=.55;c.stroke();c.globalAlpha=1;c.strokeStyle='#fff';c.lineWidth=w;c.stroke();c.restore()}
function flame(c,x,y,w,h,col1,col2,ph,rot){c.save();c.translate(x,y);c.rotate(rot||0);var s=Math.sin(ph*TAU)*.18;
 pth(c,[[0,0],[w*.55,-h*.35],[w*.2+s*w,-h*.75],[s*w*.5,-h],[-w*.25+s*w,-h*.6],[-w*.55,-h*.3]],lin(c,0,0,0,-h,[0,col1,1,col2]),null);c.restore()}

/* ---------- thân 4 chân dùng chung ---------- */
function quad(c,o,a){
 var mv=a.mv,A=a.A,S=Math.sin(a.ph*TAU),by=-o.h-o.ry+(mv?-Math.abs(Math.sin(a.ph*TAU*2))*4:S*-1.6);
 c.save();c.translate(A*(o.lunge||24),0);
 var hipY=by+o.ry*.55,amp=mv?.55:.06;
 function leg(hx,off,dk){var sw=Math.sin((a.ph+off)*TAU),lift=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*11:0,fx=hx+sw*amp*o.h*.95,fy=-lift,kx=(hx+fx)/2+(o.bend||6),ky=(hipY+fy)/2;
  tube(c,[[hx,hipY],[kx,ky],[fx,fy-2]],o.w*1.3,o.w*.85,dk?o.legD:o.legC,OUT);ell(c,fx+3,fy-1,o.w*.8,o.w*.42,o.hoof,OUT,1.5)}
 leg(-o.len*.62,0,1);leg(o.len*.6,.5,1);
 if(o.pre)o.pre(c,a,by);
 ell(c,0,by,o.len,o.ry,lin(c,0,by-o.ry,0,by+o.ry,o.body),OUT,2.6);
 if(o.mid)o.mid(c,a,by);
 leg(-o.len*.62,.5,0);leg(o.len*.6,0,0);
 o.head(c,o.len*.82,by-o.ry*.45,A,a,by);
 if(o.post)o.post(c,a,by);
 c.restore()}

/* ---------- 1 Thanh Linh Hạc ---------- */
function hac(c,a){var S=Math.sin(a.ph*TAU),A=a.A,mv=a.mv,fl=mv?Math.sin(a.ph*TAU)*.8:Math.sin(a.ph*TAU)*.25+A*1.1,bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*5:S*-2;
 c.save();c.translate(A*8,bob);
 var st=mv?Math.sin(a.ph*TAU)*14:0;
 tube(c,[[-4,-104],[-6+st,-58],[-8+st,-6]],5,3.4,'#2a2f3a',OUT);tube(c,[[8,-104],[10-st,-58],[10-st,-6]],5,3.4,'#454c5c',OUT);
 ell(c,-4+st,-4,11,3.4,'#222',OUT,1.4);ell(c,12-st,-4,11,3.4,'#222',OUT,1.4);
 for(var i=0;i<5;i++){var q=Math.sin(a.ph*TAU+i)*5;pth(c,[[-30,-116+i*3],[-70-i*8,-100+i*10+q],[-108-i*6,-62+i*12+q],[-84-i*6,-84+i*9],[-44,-110+i*3]],lin(c,-30,-116,-108,-60,[0,'#e6fbff',.5,'#5fd0e8',1,'#2a6fd0']),OUT,1.6)}
 wing(c,-6,-124,fl,.8);
 ell(c,0,-112,40,25,lin(c,0,-138,0,-90,[0,'#ffffff',1,'#cfe7f4']),OUT,2.4,-.15);
 var hx=44+A*32,hy=-168+A*40+Math.sin(a.ph*TAU)*(mv?0:1.5);
 tube(c,[[26,-122],[46,-138],[30,-158],[hx-6,hy+8]],11,6.5,'#fff',OUT);
 ell(c,hx,hy,12.5,10.5,'#fff',OUT,2);ell(c,hx-1,hy-9,7.5,4.2,'#e63a3a',null);
 tri(c,[hx+9,hy-3],[hx+52,hy+3+A*4],[hx+9,hy+6],'#f2c65a',OUT,2);
 pth(c,[[hx-6,hy-8],[hx-26,hy-32],[hx-14,hy-10]],'#f6d36a',OUT,1.5);pth(c,[[hx-2,hy-9],[hx-14,hy-40],[hx+2,hy-14]],'#ffe58a',OUT,1.5);
 eye(c,hx+2,hy-2,3.8,'#27c0e0');
 wing(c,10,-128,fl*.85+.1,1);
 glow(c,0,-114,72,'120,230,255',.16);
 c.restore()}
function wing(c,x,y,f,al){c.save();c.translate(x,y);c.scale(-1,1);c.rotate(-.55-f*.85);c.globalAlpha=al;
 for(var i=0;i<7;i++){var L=112-i*7,ang=.18+i*.2;c.save();c.rotate(ang);pth(c,[[0,0],[L*.45,-15-i*1.5],[L,-3],[L*.5,12]],lin(c,0,0,L,0,[0,'#ffffff',.65,'#eef9ff',1,i>3?'#3a8ae8':'#86d4f2']),OUT,1.4);c.restore()}
 pth(c,[[0,4],[26,-22],[56,-28],[60,-6],[24,14]],lin(c,0,0,60,-12,[0,'#fff',1,'#dff3ff']),OUT,1.6);c.restore()}

/* ---------- 2 Ngọc Kỳ Lân ---------- */
function kylan(c,a){quad(c,{len:54,ry:25,h:58,w:9,lunge:12,bend:8,
 body:[0,'#3fd2c6',.5,'#1f98b4',1,'#1c5a86'],legC:'#1f90b4',legD:'#155f86',hoof:'#e9c24f',
 pre:function(c,a,by){var s=Math.sin(a.ph*TAU);
  for(var i=0;i<3;i++)pth(c,[[-50,by-10],[-84-i*7,by-16+i*14+s*6],[-92-i*5,by+14+i*20+s*5],[-70,by+16+i*6],[-48,by+4]],lin(c,-50,by,-100,by+20,[0,'#ffffff',.55,'#fff0a8',1,'#f2b840']),OUT,1.4);
  glow(c,-86,by+10,34,'255,200,80',.35)},
 mid:function(c,a,by){c.save();c.beginPath();c.ellipse(0,by,54,25,0,0,TAU);c.clip();c.strokeStyle='rgba(180,255,240,.3)';c.lineWidth=1.3;for(var r=0;r<4;r++)for(var k=-6;k<7;k++){c.beginPath();c.arc(k*10+(r%2)*5,by-13+r*9,5,0,PI);c.stroke()}
  ell(c,26,by+10,32,14,lin(c,0,by,0,by+24,[0,'#fff',1,'#cdeef5']),null);c.restore();
  for(var i=0;i<5;i++)flame(c,-40+i*18,by-22+Math.sin(i)*3,9,20,'rgba(255,215,90,.95)','rgba(255,255,255,0)',a.ph+i*.17,0)},
 head:function(c,x,y,A,a,by){c.save();
  var hx=x+12+A*10,hy=y-40+A*18;
  /* cổ + bờm trắng */
  tube(c,[[x-18,y+10],[x+2,y-14],[hx-8,hy+8]],30,22,lin(c,0,hy-10,0,y+14,[0,'#3fcac4',1,'#1e86ac']),OUT);
  for(var i=0;i<6;i++){var t=i/5,px=(x-20)+t*(hx-x+10),py=(y-6)+t*(hy-y)-14-Math.sin(t*PI)*6;pth(c,[[px-12,py+8],[px-6,py-14-Math.sin(a.ph*TAU+i)*3],[px+6,py+4]],'#fff',OUT,1.3)}
  c.translate(hx,hy);c.rotate(A*.3+.12);
  pth(c,[[-14,6],[-8,-22],[14,-28],[44,-16],[54,2],[48,14],[22,20],[2,22]],lin(c,0,-28,0,22,[0,'#46d6c8',1,'#1d86a8']),OUT,2.2);
  pth(c,[[40,12],[52,34],[36,24]],'#fff',OUT,1.3);for(var j=0;j<4;j++)pth(c,[[-4+j*3,14],[-14-j*4,30+j*6],[2+j*2,26+j*4]],'#fff',OUT,1);
  pth(c,[[-2,-22],[-22,-48],[-30,-72],[-14,-58],[-18,-84],[-2,-52],[8,-30]],lin(c,0,-84,0,-22,[0,'#fff1a0',1,'#e8a830']),OUT,1.8);
  var o=A*10;pth(c,[[40,6],[54,8+o],[38,14+o*.6]],'#f4b8a8',OUT,1.2);
  eye(c,22,-8,5,'#ffcf3a');ell(c,50,-4,2.2,3,'#0b1626',null);c.restore()},
 post:function(c,a,by){glow(c,0,by,90,'80,230,230',.12)}},
 {ph:a.ph,mv:a.mv,A:a.A})}

/* ---------- 3 Thiên Tinh Hồ / 6 Cửu Vĩ Ma Hồ ---------- */
function fox(c,a,P){var s=Math.sin(a.ph*TAU);quad(c,{len:44,ry:22,h:40,w:6.5,lunge:30,bend:5,body:P.body,legC:P.leg,legD:P.legD,hoof:P.paw,
 pre:function(c,a,by){for(var i=0;i<9;i++){var t=i/8,ang=-2.65+t*1.9+Math.sin(a.ph*TAU+i*.7)*.07,L=78+Math.sin(i*1.7)*10,bx=-40,byy=by-4,ex=bx+Math.cos(ang)*L,ey=byy+Math.sin(ang)*L,mx=bx+Math.cos(ang-.5)*L*.55,my=byy+Math.sin(ang-.5)*L*.55;
   var nx=-Math.sin(ang),ny=Math.cos(ang),wd=15+((i%3)?0:3);
   pth(c,[[bx,byy],[mx+nx*wd,my+ny*wd],[ex+nx*3,ey+ny*3],[ex,ey],[mx-nx*wd,my-ny*wd]],lin(c,bx,byy,ex,ey,[0,P.t0,.6,P.t1,1,P.t2]),OUT,1.6);
   flame(c,ex,ey,12,20,P.fl,'rgba(255,255,255,0)',a.ph+i*.13,ang+PI/2);glow(c,ex,ey,18,P.gl,.4)}},
 mid:function(c,a,by){P.mark&&P.mark(c,by);ell(c,22,by+10,26,13,P.belly,null)},
 head:function(c,x,y,A,a){c.save();c.translate(x,y);c.rotate(A*.3);
  pth(c,[[10,-22],[16,-48],[26,-26]],P.ear,OUT,1.8);pth(c,[[-6,-20],[-8,-46],[8,-26]],P.ear,OUT,1.8);pth(c,[[12,-26],[16,-40],[22,-27]],P.earIn,null);
  pth(c,[[-10,0],[-4,-24],[18,-26],[30,-14],[56,6],[54,12],[30,18],[6,22],[-8,16]],lin(c,0,-26,0,22,[0,P.face0,1,P.face1]),OUT,2.1);
  pth(c,[[30,4],[54,8],[44,18],[22,20]],P.muz,null);P.fm&&P.fm(c);
  ell(c,55,7,3.2,2.6,'#080814',null);var o=A*9;pth(c,[[40,14],[52,15+o],[36,18+o*.6]],'#f08a98',OUT,1);
  eye(c,26,-6,4.2,P.eye);c.restore()},
 post:function(c,a,by){glow(c,0,by,80,P.gl,.1)}},{ph:a.ph,mv:a.mv,A:a.A})}
function hotinh(c,a){fox(c,a,{body:[0,'#ffffff',1,'#cfd9ff'],leg:'#f4f7ff',legD:'#c4cdf0',paw:'#8fa8ff',t0:'#ffffff',t1:'#d8e4ff',t2:'#7a9cff',fl:'rgba(120,170,255,.95)',gl:'120,170,255',belly:'#fff',ear:'#f2f6ff',earIn:'#b8c8ff',face0:'#ffffff',face1:'#dbe4ff',muz:'#fff',eye:'#4a7cff',
 mark:function(c,by){for(var i=0;i<4;i++)pth(c,[[-20+i*14,by-18],[-14+i*14,by-6],[-24+i*14,by-4]],'rgba(110,150,255,.8)',null)},fm:function(c){pth(c,[[18,-22],[26,-12],[14,-10]],'#6f96ff',null)}})}
function mahoo(c,a){fox(c,a,{body:[0,'#3a1c2c',1,'#120810'],leg:'#2a1420',legD:'#1a0c14',paw:'#c01c3c',t0:'#2a1018',t1:'#7a1430',t2:'#e02a52',fl:'rgba(255,60,100,.95)',gl:'255,60,100',belly:'#f4e6ea',ear:'#2a1420',earIn:'#e02a52',face0:'#3a1c2c',face1:'#180a12',muz:'#f6eaee',eye:'#ff4a4a',
 mark:function(c,by){for(var i=0;i<4;i++)pth(c,[[-26+i*15,by-20],[-20+i*15,by-4],[-30+i*15,by-2]],'rgba(255,50,90,.9)',null)},fm:function(c){pth(c,[[18,-22],[26,-12],[14,-10]],'#ff3a5c',null)}})}

/* ---------- 8 Cự Ma ---------- */
function cuma(c,a){quad(c,{len:64,ry:34,h:36,w:13,lunge:26,bend:8,body:[0,'#5a3a96',.5,'#2c1c52',1,'#150c2c'],legC:'#3a2670',legD:'#22143f',hoof:'#7a50d0',
 pre:function(c,a,by){for(var i=0;i<7;i++)flame(c,-56+i*20,by-26,22,56+Math.sin(i*2)*12,'rgba(170,80,255,.95)','rgba(120,40,220,0)',a.ph+i*.14,0);
  for(var j=0;j<6;j++)tri(c,[-48+j*18,by-30],[-40+j*18,by-58],[-34+j*18,by-28],'#8a60e0',OUT,1.4);
  var s=Math.sin(a.ph*TAU);pth(c,[[-56,by-4],[-96,by-30+s*6],[-120,by-8],[-98,by+4],[-60,by+10]],lin(c,-56,by,-120,by,[0,'#2c1c52',1,'#7a50d0']),OUT,2);flame(c,-118,by-8,14,34,'rgba(190,100,255,.95)','rgba(120,40,220,0)',a.ph,-1.2)},
 mid:function(c,a,by){ell(c,22,by+14,38,16,'rgba(150,100,230,.35)',null);for(var i=0;i<3;i++)zig(c,-30+i*26,by-8,-22+i*26,by+14,4,3,'#c890ff',1.6,a.ph);
  ell(c,44,by-14,26,24,lin(c,0,by-38,0,by+10,[0,'#6a46ac',1,'#2c1c52']),OUT,2)},
 head:function(c,x,y,A,a){c.save();c.translate(x+6,y-4);c.rotate(A*.32);
  pth(c,[[-20,8],[-10,-28],[22,-38],[54,-22],[64,6],[44,28],[8,30]],lin(c,0,-38,0,30,[0,'#5c3c9c',1,'#1e1038']),OUT,2.4);
  pth(c,[[-8,-26],[-34,-44],[-62,-40],[-72,-58],[-50,-66],[-30,-60],[0,-40]],lin(c,-70,-60,0,-30,[0,'#c8a8ff',1,'#3a2060']),OUT,2);
  pth(c,[[24,-34],[34,-62],[56,-76],[52,-48],[44,-34]],lin(c,0,-76,0,-34,[0,'#c8a8ff',1,'#3a2060']),OUT,2);
  var o=A*16;pth(c,[[22,12],[62,14+o],[56,26+o],[26,28+o*.5]],'#2a0a1a',OUT,1.6);for(var i=0;i<4;i++)tri(c,[30+i*8,14+o*.5],[34+i*8,26+o*.8],[38+i*8,14+o*.5],'#f4eaff',null);
  pth(c,[[30,-18],[62,-10],[40,-8]],'#1a0c30',null);
  glow(c,-66,-56,16,'200,150,255',.7);glow(c,54,-72,14,'200,150,255',.7);glow(c,36,-10,22,'255,220,60',.55);eye(c,36,-10,5.6,'#ffd62a');
  for(var f=0;f<4;f++)flame(c,-4+f*12,-34,10,30,'rgba(190,100,255,.9)','rgba(120,40,220,0)',a.ph+f*.2,0);c.restore()},
 post:function(c,a,by){glow(c,0,by,100,'170,90,255',.18)}},{ph:a.ph,mv:a.mv,A:a.A})}

/* ---------- 4 Linh Thú Cự Quy ---------- */
function quy(c,a){var S=Math.sin(a.ph*TAU),mv=a.mv,A=a.A,bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*3:S*-1.2;
 c.save();c.translate(-12+A*6,0);c.scale(.92,.92);
 function leg(x,off,dk){var sw=Math.sin((a.ph+off)*TAU)*(mv?12:1.5),lf=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*7:0;ell(c,x+sw,-16-lf,16,17,dk?'#1f6a5a':'#2a8a72',OUT,2.2);ell(c,x+sw+4,-4-lf,14,5,'#d8b050',OUT,1.4)}
 leg(-52,0,1);leg(52,.5,1);
 var hx=84+A*26,hy=-70+bob+A*8;
 tube(c,[[62,-62],[(62+hx)/2,-66],[hx,hy]],20,17,'#2f9a7c',OUT);
 tri(c,[-78,-34],[-104,-26],[-76,-24],'#2a8a72',OUT,1.6);
 /* mai */
 var sy=-72+bob;pth(c,[[-90,-30],[-84,-100],[-40,-136],[10,-142],[58,-122],[88,-80],[92,-30],[0,-22]],lin(c,0,-142,0,-24,[0,'#3fc4a0',.5,'#238a6e',1,'#14584c']),OUT,3);
 c.save();c.clip();c.strokeStyle='rgba(255,230,140,.55)';c.lineWidth=2;for(var r=0;r<3;r++)for(var k=-3;k<4;k++){c.beginPath();c.arc(k*28+(r%2)*14,-110+r*28,16,0,TAU);c.stroke()}c.restore();
 pth(c,[[-92,-30],[-86,-102],[-40,-140],[10,-146],[58,-126],[90,-82],[94,-30]],null,'#e8c050',3.4,true);
 /* tháp nhỏ trên lưng */
 for(var t=0;t<3;t++){var w=34-t*9,y0=-142-t*17;pth(c,[[-w,y0],[-w+4,y0-14],[w-4,y0-14],[w,y0]],lin(c,0,y0-14,0,y0,[0,'#f0d27a',1,'#b88a3a']),OUT,1.6);tri(c,[-w-6,y0-13],[0,y0-26],[w+6,y0-13],'#c0503a',OUT,1.6)}
 /* tinh thể */
 for(var q=0;q<3;q++){var cx=-70+q*14;tri(c,[cx,-112],[cx+6,-140-q*8],[cx+12,-112],'rgba(120,210,255,.95)',OUT,1.2);glow(c,cx+6,-128,16,'120,210,255',.5)}
 glow(c,0,-100,100,'255,220,120',.12);
 /* đầu */
 ell(c,hx,hy,22,17,lin(c,0,hy-17,0,hy+17,[0,'#48b890',1,'#237e62']),OUT,2.2);pth(c,[[hx-14,hy-14],[hx-6,hy-28],[hx+4,hy-16]],'#e8c050',OUT,1.4);
 eye(c,hx+8,hy-3,4.4,'#ffd34a');var o=A*8;pth(c,[[hx+12,hy+6],[hx+24,hy+8+o],[hx+10,hy+12+o*.5]],'#c05a4a',OUT,1);
 leg(-34,.5,0);leg(36,0,0);c.restore()}

/* ---------- 5 Huyền Vũ / 10 Hắc Long : rồng cuộn ---------- */
function coil(c,a,P){var A=a.A,ph=a.ph,N=64,pts=[],i;
 var hxT=P.hx+A*30,hyT=P.hy+A*22+Math.sin(ph*TAU)*(a.mv?2:3);
 for(i=0;i<=N;i++){var s=i/N,x,y,d;
  if(s<.74){var u=s/.74,th=PI*.15+u*PI*P.turns,rx=P.rx*(1-u*.32),ry=P.ry*(1-u*.2),cy=P.cy-u*P.rise;x=P.cx+rx*Math.cos(th);y=cy+ry*Math.sin(th);d=Math.sin(th)}
  else{var v=(s-.74)/.26,th2=PI*.15+PI*P.turns,rx2=P.rx*.68,ry2=P.ry*.8,cy2=P.cy-P.rise,x0=P.cx+rx2*Math.cos(th2),y0=cy2+ry2*Math.sin(th2),e=v*v*(3-2*v);x=x0+(hxT-x0)*e+Math.sin(v*PI)*P.bulge;y=y0+(hyT-y0)*e;d=1}
  var wv=Math.sin(ph*TAU*(a.mv?2:1)-s*7)*(a.mv?4:2.4)*(.4+s);y+=wv*.6;x+=wv*.3;pts.push({x:x,y:y,d:d,s:s,w:P.w0+(P.w1-P.w0)*Math.pow(Math.sin(Math.min(1,s*1.08)*PI*.5),.8)})}
 /* vẽ lưng-trước theo độ sâu */
 if(P.aura)glow(c,P.cx,P.cy-20,110,P.glow,.2);
 function grp(list){var k;c.lineCap='round';
  list.forEach(function(i){var p=pts[i],q=pts[i+1];c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineWidth=(p.w+q.w)/2+3.6;c.strokeStyle=OUT;c.stroke()});
  list.forEach(function(i){var p=pts[i],q=pts[i+1];c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineWidth=(p.w+q.w)/2;c.strokeStyle=P.c1;c.stroke()});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;c.beginPath();c.moveTo(p.x,p.y+w*.2);c.lineTo(q.x,q.y+w*.2);c.lineWidth=w*.5;c.strokeStyle=P.c0;c.globalAlpha=.55;c.stroke();c.globalAlpha=1});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;if(p.s>.66||p.d>.5){c.beginPath();c.moveTo(p.x,p.y+w*.3);c.lineTo(q.x,q.y+w*.3);c.lineWidth=w*.32;c.strokeStyle=P.belly;c.stroke()}});
  list.forEach(function(i){var p=pts[i],q=pts[i+1],w=(p.w+q.w)/2;c.beginPath();c.moveTo(p.x,p.y-w*.22);c.lineTo(q.x,q.y-w*.22);c.lineWidth=w*.22;c.strokeStyle='rgba(255,255,255,.25)';c.stroke()});
  list.forEach(function(i){var p=pts[i];if(i%4===0){c.beginPath();c.arc(p.x,p.y-p.w*.05,Math.max(1,p.w*.1),0,TAU);c.fillStyle=P.sc;c.fill()}})}
 var back=[],front=[];for(i=0;i<N;i++)(pts[i].d>0?front:back).push(i);grp(back);grp(front);
 /* đuôi */
 flame(c,pts[0].x,pts[0].y,16,36,P.fl,'rgba(255,255,255,0)',ph,-.6);
 /* vây lưng */
 for(i=58;i>6;i-=4){var p=pts[i];if(p.d<.2&&i<48)continue;tri(c,[p.x-3,p.y-p.w*.5],[p.x-9,p.y-p.w*.5-11],[p.x+4,p.y-p.w*.5],P.fin,OUT,1)}
 /* đầu */
 var hd=pts[N],nk=pts[N-6],ang=Math.atan2(hd.y-nk.y,hd.x-nk.x)*.35+A*.35-.1;
 c.save();c.translate(hd.x,hd.y);c.rotate(ang);var mo=A*14+(P.roar?6:0);
 pth(c,[[-18,-14],[-6,-24],[24,-20],[56,-12],[62,0],[28,6],[-8,16],[-20,10]],lin(c,0,-24,0,16,[0,P.c1,1,P.c0]),OUT,2.2);
 pth(c,[[26,4],[62,2+mo*.4],[56,12+mo],[22,18+mo*.5],[-6,18+mo*.3]],P.jaw,OUT,1.8);for(i=0;i<4;i++)tri(c,[28+i*8,5],[31+i*8,13+mo*.4],[34+i*8,5],'#fff',null);
 pth(c,[[-6,-20],[-30,-50],[-22,-70],[-10,-40]],lin(c,0,-70,0,-20,[0,'#fff0a0',1,'#e0a028']),OUT,1.6);pth(c,[[8,-22],[-6,-56],[4,-70],[16,-34]],lin(c,0,-70,0,-20,[0,'#fff0a0',1,'#e0a028']),OUT,1.6);
 for(i=0;i<3;i++){var wy=Math.sin(ph*TAU+i)*4;pth(c,[[-10,-6+i*5],[-44-i*10,-14+i*12+wy],[-84-i*8,0+i*16+wy],[-46-i*6,-2+i*11],[-12,-2+i*4]],P.mane,null)}
 pth(c,[[50,-4],[96,-18+Math.sin(ph*TAU)*5],[70,-4],[96,4+Math.sin(ph*TAU+1)*5],[54,4]],null,P.whisk,1.8,true);
 glow(c,24,-8,14,P.eyeg,.5);eye(c,22,-8,5,P.eye);ell(c,58,-6,2,2,'#050510',null);c.restore();
 if(P.drop)for(i=0;i<5;i++){var q=(ph*2+i*.2)%1;ell(c,P.cx-70+i*34,P.cy-20-q*70,3,4,'rgba(200,250,255,'+(1-q)*.8+')',null)}}
function huyenvu(c,a){coil(c,a,{cx:-6,cy:-44,rx:84,ry:30,rise:18,turns:2.15,hx:78,hy:-154,bulge:22,w0:5,w1:26,c0:'#14827e',c1:'#1fb0a4',belly:'#e8f6ee',sc:'rgba(255,255,255,.35)',fin:'#52d8c8',fl:'rgba(120,255,230,.9)',jaw:'#1a9c94',mane:'rgba(70,220,200,.75)',whisk:'#9ff2e8',eye:'#ffe060',eyeg:'255,220,100',glow:'80,240,220',aura:1,drop:1})}
function hacrong(c,a){coil(c,a,{cx:-10,cy:-46,rx:80,ry:30,rise:30,turns:2.3,hx:44,hy:-196,bulge:-26,w0:6,w1:30,c0:'#0c2c52',c1:'#17508a',belly:'#d6eefc',sc:'rgba(120,230,255,.45)',fin:'#35c8ff',fl:'rgba(80,210,255,.95)',jaw:'#143c70',mane:'rgba(60,170,255,.7)',whisk:'#8fe4ff',eye:'#aef4ff',eyeg:'120,230,255',glow:'60,190,255',aura:1,roar:1})}

/* ---------- 7 Thiên Đình Chiến Sĩ ---------- */
function chiensi(c,a){var mv=a.mv,A=a.A,S=Math.sin(a.ph*TAU),bob=mv?-Math.abs(Math.sin(a.ph*TAU*2))*4:S*-1.4,lx=A*Math.sin(A*PI)*0+A*34;
 c.save();c.translate(lx*.8,bob);
 glow(c,4,-168,52,'255,230,140',.35);c.strokeStyle='rgba(255,225,120,.9)';c.lineWidth=3.2;c.beginPath();c.ellipse(4,-170,34,34,0,0,TAU);c.stroke();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.2;c.beginPath();c.ellipse(4,-170,28,28,0,0,TAU);c.stroke();
 function leg(x,off,dk){var sw=Math.sin((a.ph+off)*TAU)*(mv?20:2),lf=mv?Math.max(0,Math.cos((a.ph+off)*TAU))*10:0,fx=x+sw,fy=-lf;tube(c,[[x*.6,-84],[(x*.6+fx)/2+5,-44],[fx,fy-8]],14,10,dk?'#a88a44':'#e8d08a',OUT);pth(c,[[fx-8,fy-4],[fx+16,fy-3],[fx+16,fy+4],[fx-8,fy+4]],'#c8a040',OUT,1.6)}
 leg(-8,0,1);
 /* áo choàng */
 pth(c,[[-14,-148],[-46-Math.sin(a.ph*TAU)*5,-100],[-52,-44],[-20,-54],[-6,-100]],lin(c,-14,-148,-50,-44,[0,'#ffffff',1,'#9fd0ff']),OUT,1.8);
 /* tay sau + giáo */
 tube(c,[[-10,-138],[-22,-116],[-12,-100+A*-8]],9,7,'#d8b858',OUT);
 pth(c,[[-26,-96],[-10,-104],[0,-94],[-20,-84]],'#2a2a3a',null);
 leg(14,.5,0);
 pth(c,[[-20,-148],[-26,-96],[-16,-80],[26,-80],[34,-96],[26,-148],[4,-158]],lin(c,0,-158,0,-78,[0,'#fff6d8',.4,'#f2d070',1,'#b88a30']),OUT,2.4);
 pth(c,[[-8,-146],[4,-120],[18,-146]],'#5ab8f0',OUT,1.2);ell(c,4,-122,7,7,rad(c,4,-122,7,[0,'#fff',1,'#4aa8ff']),OUT,1.4);
 pth(c,[[-26,-150],[-42,-160],[-34,-136]],lin(c,0,0,0,0,[0,'#fff',1,'#fff']),OUT,1.6);pth(c,[[26,-150],[44,-160],[36,-138]],'#f2d070',OUT,1.6);
 ell(c,6,-176,17,18,'#f2d8b8',OUT,2);pth(c,[[-12,-180],[-12,-200],[6,-208],[24,-200],[24,-178],[14,-186],[0,-186]],lin(c,0,-208,0,-176,[0,'#fff3c0',1,'#d4a43c']),OUT,2);
 tri(c,[2,-206],[6,-230],[10,-206],'#e0483c',OUT,1.4);eye(c,12,-176,3.4,'#3aa0e8');
 /* tay trước + giáo */
 var ex=36+A*40,ey=-112+A*8;tube(c,[[20,-138],[30,-122],[ex,ey]],10,8,'#f0d680',OUT);ell(c,ex,ey,6,6,'#fff',OUT,1.2);
 var ang=-.95*(1-A*.92)-.05,Lx=Math.cos(ang),Ly=Math.sin(ang);
 c.save();c.translate(ex,ey);c.rotate(ang);c.strokeStyle=OUT;c.lineWidth=7;c.beginPath();c.moveTo(-70,0);c.lineTo(120,0);c.stroke();c.strokeStyle='#e8c860';c.lineWidth=4;c.beginPath();c.moveTo(-70,0);c.lineTo(120,0);c.stroke();
 pth(c,[[120,-9],[162,0],[120,9],[128,0]],lin(c,120,0,162,0,[0,'#ffffff',1,'#9fe0ff']),OUT,1.6);glow(c,150,0,26,'180,240,255',.7);c.restore();
 c.restore()}

/* ---------- 9 Lôi Điện Thần Sứ ---------- */
function loidien(c,a){var A=a.A,mv=a.mv,hv=Math.sin(a.ph*TAU)*(mv?5:4)-24,sw=Math.sin(a.ph*TAU)*(mv?8:3);
 c.save();c.translate(A*8,hv);
 ell(c,0,-hv*0+26,44,8,'rgba(0,0,0,.22)',null);
 glow(c,4,-130,90,'90,170,255',.28);glow(c,6,-188,40,'200,235,255',.5);c.strokeStyle='rgba(170,220,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(6,-190,30,30,0,0,TAU);c.stroke();
 for(var i=0;i<3;i++){var q=a.ph*TAU+i*2.1,cx=Math.cos(q)*66,cy=-116+Math.sin(q)*24;if(Math.sin(q)<0)zig(c,cx,cy,cx+Math.cos(q+1)*30,cy-26,5,5,'#8ad0ff',1.6,a.ph+i*.2)}
 pth(c,[[-8,-160],[-52-sw,-60],[-62-sw,6],[-14,-4],[44+sw,8],[56+sw,-56],[18,-160]],lin(c,0,-160,0,8,[0,'#6aa8f0',.5,'#3a64c4',1,'#1c2c78']),OUT,2.6);
 pth(c,[[-30,-70],[-20,-4],[-2,-70]],'rgba(255,255,255,.18)',null);for(var k=0;k<4;k++)pth(c,[[-40+k*22,-40],[-34+k*22,-10],[-44+k*22,-8]],'rgba(255,230,150,.55)',null);
 pth(c,[[-12,-156],[30,-156],[28,-146],[-10,-146]],'#e8c860',OUT,1.6);
 tube(c,[[-18,-144],[-56,-120+Math.sin(a.ph*TAU)*3],[-78,-98]],14,22,'#3c6ad0',OUT);
 var ax=48+A*46,ay=-128-A*34;
 tube(c,[[20,-146],[36,-132],[ax,ay]],14,18,'#4a7ae0',OUT);ell(c,ax+6,ay,7,7,'#f0d8c0',OUT,1.3);
 pth(c,[[-8,-186],[-18,-204],[6,-216],[28,-206],[22,-182],[24,-160],[-4,-160]],'#f4f8ff',OUT,2);ell(c,6,-184,16,19,'#f0dcc8',OUT,2);
 pth(c,[[-10,-190],[2,-210],[22,-200],[24,-188],[10,-196]],'#e8f2ff',OUT,1.4);eye(c,12,-184,3.6,'#46b8ff');tri(c,[3,-198],[7,-188],[11,-198],'#4aa8ff',null);
 for(var j=0;j<2;j++){var yy=-96+j*38;pth(c,[[-52,yy],[-70-Math.sin(a.ph*TAU+j)*6,yy+14],[-52,yy+22]],'rgba(120,200,255,.8)',null);zig(c,-52,yy+8,-84,yy+30,6,5,'#9fd8ff',1.4,a.ph+j*.3)}
 if(A>.15){var f=Math.sin(A*PI);zig(c,ax+10,ay,ax+110*f+30,ay+70,7,14,'#bfe6ff',3,A);zig(c,ax+10,ay,ax+90*f+30,ay+20,6,10,'#fff',2,A+.3);glow(c,ax+90*f,ay+40,44,'170,225,255',.7*f)}
 glow(c,ax+6,ay,16,'170,225,255',.5+A*.4);
 c.restore()}

/* ---------- 11 Thanh Trùng ---------- */
function thanhtrung(c,a){var A=a.A,ph=a.ph,mv=a.mv,hv=-98+Math.sin(ph*TAU)*(mv?6:4),fl=Math.sin(ph*TAU*(mv?2:1.4)),ow=A*26;
 c.save();c.translate(ow*.6,hv);ell(c,-ow*.6,-hv-4,50,7,'rgba(0,0,0,.2)',null);
 glow(c,0,0,110,'150,130,255',.24);
 function wg(len,ang,base,f,sy){c.save();c.translate(-4,-14);c.rotate(ang);c.scale(1,(sy||1)*(.45+.55*Math.abs(Math.cos(f*1.2))));
  pth(c,[[0,0],[len*.2,-len*.62],[len*.62,-len*.98],[len*.98,-len*.62],[len*.86,-len*.12],[len*.4,len*.06]],lin(c,0,0,len,-len*.6,[0,base[0],.5,base[1],1,base[2]]),'rgba(50,40,130,.8)',1.6);
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;for(var k=1;k<6;k++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.3*k/3,-len*.7,len*(.25+k*.14),-len*(.98-k*.15));c.stroke()}
  ell(c,len*.62,-len*.62,len*.1,len*.1,'rgba(255,255,255,.55)','rgba(80,60,200,.6)',1.2);c.restore()}
 wg(98,-.55+fl*.25,['rgba(255,255,255,.8)','rgba(160,205,255,.7)','rgba(150,90,240,.6)'],fl,1);
 var sp=[];for(var i=0;i<=22;i++){var s=i/22;sp.push([-78+s*118+Math.sin(ph*TAU-s*5)*3,10+Math.sin(s*PI*1.4+ph*TAU)*10-s*14+(1-s)*30])}
 tube(c,sp,5,26,'#3a68c8',OUT);for(var j=2;j<22;j+=2)ell(c,sp[j][0],sp[j][1]+3,4,3.4,'#cfeaff',null);
 for(var q=0;q<5;q++){var p=sp[3+q*4];tri(c,[p[0]-3,p[1]-8],[p[0]-8,p[1]-18],[p[0]+3,p[1]-8],'#7ad8ff',OUT,1)}
 flame(c,sp[0][0],sp[0][1],14,30,'rgba(140,200,255,.9)','rgba(255,255,255,0)',ph,-1.3);
 var hx=sp[22][0],hy=sp[22][1];c.save();c.translate(hx+6,hy-4);c.rotate(.1+A*.3);
 pth(c,[[-14,-12],[8,-18],[34,-8],[40,6],[8,14],[-12,8]],lin(c,0,-18,0,14,[0,'#5a8ae8',1,'#2a48a8']),OUT,2);pth(c,[[8,0],[40,3],[36,12+A*10],[6,12+A*6]],'#2a3c8a',OUT,1.4);
 pth(c,[[-6,-14],[-26,-44],[-16,-62],[-8,-40],[-2,-56],[4,-36]],'#d8f0ff',OUT,1.4);pth(c,[[8,-16],[16,-46],[30,-56],[24,-34]],'#b8d8ff',OUT,1.4);
 glow(c,10,-6,12,'200,255,255',.5);eye(c,10,-6,4,'#9affff');c.restore();
 wg(112,-1.05+fl*.3,['rgba(255,255,255,.7)','rgba(190,170,255,.65)','rgba(120,80,230,.6)'],-fl,1);wg(76,-.1+fl*.2,['rgba(255,235,255,.7)','rgba(180,160,255,.6)','rgba(100,90,230,.55)'],fl*.8,1);
 if(A>.2)for(var m=0;m<6;m++){var z=(A*2+m*.17)%1;glow(c,hx+40+z*80,hy+z*20+Math.sin(m*3)*12,9,'190,150,255',.9*(1-z))}
 c.restore()}

/* ---------- 12 Tiên Linh ---------- */
function tienlinh(c,a){var A=a.A,ph=a.ph,mv=a.mv,hv=-52+Math.sin(ph*TAU)*(mv?5:4);
 c.save();c.translate(A*10,hv);ell(c,-A*10,-hv-2,30,6,'rgba(0,0,0,.18)',null);
 glow(c,0,-30,90,'160,215,255',.28);
 for(var i=0;i<3;i++){var sw=Math.sin(ph*TAU+i*1.2)*6;(function(){var P=[],k;for(k=0;k<=14;k++){var u=k/14;P.push([-24-u*(88+i*8),-18-u*(34+i*10)-Math.sin(u*PI)*12+sw*u])}tube(c,P,12-i,3,'rgba(190,230,255,.85)','rgba(60,110,200,.7)')})();glow(c,-112-i*6,-52-i*20+sw,16,'160,215,255',.5)}
 var eo=Math.sin(ph*TAU)*.07;
 for(var e=0;e<2;e++){c.save();c.translate(2+e*16,-72);c.rotate(-.35+e*.45+eo);pth(c,[[-9,0],[-12,-34],[-3,-62],[7,-34],[9,0]],'#fff',OUT,2);pth(c,[[-4,-4],[-5,-32],[0,-52],[4,-32],[4,-4]],'#f6b8d4',null);c.restore()}
 ell(c,0,-14,30,26,lin(c,0,-40,0,12,[0,'#ffffff',1,'#c8dcff']),OUT,2.4);
 var hx=24+A*8,hy=-44;ell(c,hx,hy,24,21,lin(c,0,hy-20,0,hy+20,[0,'#fff',1,'#dfeaff']),OUT,2.4);
 pth(c,[[hx-2,hy-18],[hx+4,hy-28],[hx+10,hy-18],[hx+4,hy-12]],'#6ab4ff',OUT,1.2);glow(c,hx+4,hy-20,12,'120,200,255',.6);
 eye(c,hx+10,hy-2,7,'#38a8ff');ell(c,hx+24,hy+6,2.8,2.2,'#e07a98',null);ell(c,hx+4,hy+8,4,2.6,'rgba(255,150,170,.55)',null);
 for(var l=0;l<2;l++)ell(c,-8+l*20+(mv?Math.sin(ph*TAU+l*3)*3:0),14,8,5,'#fff',OUT,1.4);
 pth(c,[[-26,-2],[-40,-18],[-30,-4]],'#9fd0ff',null);
 if(A>0){var f=Math.sin(A*PI);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(170,225,255,'+f+')';c.lineWidth=4;c.beginPath();c.ellipse(20,-26,30+A*80,22+A*60,0,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(20,-26,18+A*56,12+A*40,0,0,TAU);c.stroke();c.restore();for(var s=0;s<8;s++){var z=(A+s*.12)%1;glow(c,20+Math.cos(s)*z*90,-26+Math.sin(s)*z*60,8,'200,240,255',.9*(1-z))}}
 for(var p=0;p<5;p++){var z2=(ph*.7+p*.2)%1;glow(c,-30+p*24,-10-z2*80,5,'200,235,255',.9*(1-z2))}
 c.restore()}

var SP=[
 {id:'hac',name:'Thanh Linh Hạc',h:122,rg:1,col:'#7fe8ff',fn:hac},
 {id:'kylan',name:'Ngọc Kỳ Lân',h:112,rg:0,col:'#ffd86a',fn:kylan},
 {id:'hotinh',name:'Thiên Tinh Hồ',h:92,rg:0,col:'#9ab8ff',fn:hotinh},
 {id:'quy',name:'Linh Thú Cự Quy',h:104,rg:0,col:'#8affc8',fn:quy},
 {id:'huyenvu',name:'Huyền Vũ',h:126,rg:0,col:'#5fe8d8',fn:huyenvu},
 {id:'mahoo',name:'Cửu Vĩ Ma Hồ',h:96,rg:0,col:'#ff5a7a',fn:mahoo},
 {id:'chiensi',name:'Thiên Đình Chiến Sĩ',h:128,rg:0,col:'#ffe08a',fn:chiensi},
 {id:'cuma',name:'Cự Ma',h:112,rg:0,col:'#b070ff',fn:cuma},
 {id:'loidien',name:'Lôi Điện Thần Sứ',h:130,rg:1,col:'#7ab8ff',fn:loidien},
 {id:'hacrong',name:'Hắc Long',h:150,rg:0,col:'#4ac8ff',fn:hacrong},
 {id:'thanhtrung',name:'Thanh Trùng',h:112,rg:1,col:'#c0a0ff',fn:thanhtrung},
 {id:'tienlinh',name:'Tiên Linh',h:86,rg:1,col:'#bfe8ff',fn:tienlinh}];
var FR={n:16,idle:[0,4],move:[4,10],atk:[10,16],size:256,cols:4,ox:128,oy:238};
function params(f){if(f<4)return{ph:f/4,mv:0,A:0};if(f<10)return{ph:(f-4)/6,mv:1,A:0};return{ph:(f-10)/6,mv:0,A:(f-10)/5<0?0:Math.sin(((f-10)/5)*PI*.5+0)*0+(function(t){return t<.4?t/.4:1-(t-.4)/.6*.85})((f-10)/5)}}
function draw(c,i,f){var p=params(f);c.save();c.translate(FR.ox,FR.oy);c.lineJoin='round';c.lineCap='round';SP[i].fn(c,p);c.restore()}
window.TGMART={SP:SP,FR:FR,draw:draw,params:params};
})();
