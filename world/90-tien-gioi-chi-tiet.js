/* ===== 🏡 TIÊN GIỚI CHI TIẾT — nhà, đường đi, cây cối, ao sen (world/90-tien-gioi-chi-tiet.js) =====
 * Nạp SAU world/61-tien-gioi-thanh.js (móc TGD.* do world/61 gọi lúc vẽ: ground / build / dec / under / fx / blk / avoid). Không đụng logic game.
 *   • ground(): vẽ lại mặt đảo trong sprite đảo (dựng 1 lần): gạch lát, đường đá cuội/đá phiến, thảm đỏ, ao sen, hoa cỏ, sân trước cửa.
 *   • build():  thêm vật thể xếp theo chiều sâu (nhà tiên gia, cây, đèn, hàng rào, giếng, hạc...). Nhà/ao chặn đường đi qua TGD.blk (world/61 blocked()).
 *   • dec():    sprite chi tiết cho mọi loại cây (thay pine/sak cũ + thêm liễu, trúc, đào tiên, phong, bạch quả, linh thụ...).
 *   • under()/fx(): hiệu ứng động nhẹ (sóng ao, khói bếp, đom đóm, hạt linh khí) — tự bỏ ở QL cao.
 * Chỉnh bố cục: LAY (đường, ao, nhà, cây) ngay dưới. Gỡ module = xoá thẻ script, map quay về như cũ. */
(function(){
'use strict';
var TAU=Math.PI*2,C0=null;
/* ---------- bố cục (toạ độ thế giới của world/61) ---------- */
var HOUSES=[
 {id:'h_wst',x:7.0,y:22.2,w:1.9,d:1.5,f:'y',wall:'#f4ead2',rf:['#6fd0b8','#2a7a74'],wd:'#6a3a22',v:0},
 {id:'h_est',x:21.7,y:19.9,w:1.8,d:1.4,f:'y',wall:'#f2e4cc',rf:['#e8a05c','#8a4422'],wd:'#5a3420',v:1},
 {id:'h_esh',x:27.3,y:22.0,w:1.3,d:1.3,f:'x',wall:'#ead8b8',rf:['#c88a5a','#6a3a22'],wd:'#4a2c1a',v:2,hut:1},
 {id:'h_pw',x:6.8,y:7.6,w:2.2,d:1.7,f:'y',wall:'#f6efe0',rf:['#78c8e8','#2c6a98'],wd:'#7a2a24',v:3},
 {id:'h_pe',x:21.2,y:7.6,w:2.2,d:1.7,f:'y',wall:'#f6efe0',rf:['#f0b0c8','#a2486a'],wd:'#7a2a24',v:4}];
HOUSES.forEach(function(h){h.rect=[h.x-h.w/2,h.y-h.d/2,h.x+h.w/2,h.y+h.d/2]});
var PONDS=[
 {id:'p_wst',isl:'wst',x:1.9,y:26.3,rx:1.05,ry:.8,seed:21},
 {id:'p_pw',isl:'pal',x:10.2,y:15.1,rx:1.3,ry:.85,seed:23},
 {id:'p_pe',isl:'pal',x:17.8,y:15.1,rx:1.3,ry:.85,seed:25}];
/* đường: [rộng, kiểu, [điểm...]] — 'cob' đá cuội (vườn), 'sl' đá phiến (quảng trường), 'car' thảm đỏ */
var ROADS={
 arr:[[3.1,'sl',[[14,38.4],[14,35.5],[14,31.2]]],[1.9,'sl',[[14,38.4],[11.2,39.2],[8.5,38.8]]],[1.9,'sl',[[14,38.4],[16.8,39.2],[19.5,38.8]]]],
 wst:[[1.5,'cob',[[9.6,23.1],[8.2,23.5],[6.8,23.9],[5.6,24.1],[3.4,24.0]]],[1.2,'cob',[[6.2,24.1],[6.8,25.8],[6.7,27.4],[5.4,28.0]]],[1.0,'cob',[[6.4,24.1],[6.9,23.1]]]],
 est:[[1.6,'cob',[[19.6,23.1],[20.8,22.6],[22.2,22.0],[23.4,21.5],[24.8,21.3]]],[1.3,'cob',[[22.5,22.1],[22.7,24.0],[23.6,25.3],[25.0,25.6]]],[1.0,'cob',[[22.0,22.1],[21.8,21.2]]],[1.0,'cob',[[24.6,21.5],[26.4,21.8],[27.2,22.9]]]],
 pal:[[3.8,'sl',[[14,17.4],[14,13],[14,9.2]]],[1.9,'sl',[[12.2,13.1],[9.9,13.2],[7.4,12.9]]],[1.9,'sl',[[15.8,13.1],[18.1,13.2],[20.6,12.9]]],[1.4,'cob',[[11.4,9.0],[9.2,8.9],[6.9,8.9]]],[1.4,'cob',[[16.6,9.0],[18.8,8.9],[21.1,8.9]]]]};
var CARPET=[14,17.2,14,8.7,1.8];
var MED={arr:[14,37.6,3.0],pal:[14,9.2,2.8]};
var BEDS={arr:[[11.9,41.2,1.15,.62],[16.1,41.2,1.15,.62]],pal:[[10.4,10.9,1.0,.65],[17.6,10.9,1.0,.65]]};
var RINGS={arr:[[10.6,34.2,.7],[17.4,34.2,.7]],pal:[[8.6,5.4,.65],[19.4,5.4,.65]]};
/* chặn đi: nhà + ao (+ lề vành lan can sân thượng, bật trong blk) */
function blk(x,y){var i,h,p,dx,dy;for(i=0;i<HOUSES.length;i++){h=HOUSES[i].rect;if(x>h[0]-.25&&x<h[2]+.25&&y>h[1]-.25&&y<h[3]+.25)return true}
 for(i=0;i<PONDS.length;i++){p=PONDS[i];dx=(x-p.x)/(p.rx+.2);dy=(y-p.y)/(p.ry+.2);if(dx*dx+dy*dy<1)return true}return false}
/* chặn cây rải ngẫu nhiên cũ: world/90 tự bố trí toàn bộ cây */
function avoid(){return true}
/* ---------- tiện ích vẽ ---------- */
function L(I,p){return[p[0]-I.cx,p[1]-I.cy]}
function spline(P,n){if(P.length<3)return P.slice();var out=[],i,t;for(i=0;i<P.length-1;i++){var a=P[Math.max(0,i-1)],b=P[i],c=P[i+1],d=P[Math.min(P.length-1,i+2)];for(t=0;t<n;t++){var u=t/n,u2=u*u,u3=u2*u;out.push([.5*(2*b[0]+(-a[0]+c[0])*u+(2*a[0]-5*b[0]+4*c[0]-d[0])*u2+(-a[0]+3*b[0]-3*c[0]+d[0])*u3),.5*(2*b[1]+(-a[1]+c[1])*u+(2*a[1]-5*b[1]+4*c[1]-d[1])*u2+(-a[1]+3*b[1]-3*c[1]+d[1])*u3)])}}out.push(P[P.length-1]);return out}
function resample(poly,step){var out=[],i,acc=0,a,b,d,ang,t;if(poly.length<2)return out;a=poly[0];b=poly[1];out.push([a[0],a[1],Math.atan2(b[1]-a[1],b[0]-a[0])]);var need=step;
 for(i=0;i<poly.length-1;i++){a=poly[i];b=poly[i+1];d=Math.hypot(b[0]-a[0],b[1]-a[1]);ang=Math.atan2(b[1]-a[1],b[0]-a[0]);t=need;while(t<=d){out.push([a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d,ang]);t+=step}need=t-d}
 return out}
function pstroke(q,poly,wd,col,cap){q.lineWidth=wd;q.strokeStyle=col;q.lineCap=cap||'round';q.lineJoin='round';q.beginPath();poly.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.stroke()}
function blob(q,cx,cy,rx,ry,seed,n,amp){var r=C0.rng(seed),i,pts=[];for(i=0;i<n;i++){var t=i/n*TAU,k=1+(r()-.5)*amp;pts.push([cx+Math.cos(t)*rx*k,cy+Math.sin(t)*ry*k])}q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(i=1;i<n;i++){var m=[(pts[i][0]+pts[i-1][0])/2,(pts[i][1]+pts[i-1][1])/2];q.quadraticCurveTo(pts[i-1][0],pts[i-1][1],m[0],m[1])}q.closePath();return pts}
function stone(q,x,y,a,b,ang,rr,fill,edge){var i,n=5+((rr()*2)|0);q.beginPath();for(i=0;i<n;i++){var t=i/n*TAU+ang,k=.78+rr()*.3;var px=x+Math.cos(t)*a*k,py=y+Math.sin(t)*b*k;i?q.lineTo(px,py):q.moveTo(px,py)}q.closePath();q.fillStyle=fill;q.fill();q.lineWidth=.016;q.strokeStyle=edge||'rgba(50,40,36,.55)';q.stroke();q.fillStyle='rgba(255,255,255,.22)';q.beginPath();q.ellipse(x-a*.25,y-b*.28,a*.45,b*.35,0,0,TAU);q.fill()}
/* ---------- nền: cỏ vườn / gạch lát ---------- */
function grass(q,I,rr){var i,R=Math.max(I.rx,I.ry)+1.5;q.fillStyle=C0.rg(q,0,0,.5,R,[0,'#93d49a',.55,'#62b27c',1,'#3b8662']);q.fillRect(-R,-R,R*2,R*2);
 for(i=0;i<120;i++){var x=(rr()-.5)*I.rx*2.1,y=(rr()-.5)*I.ry*2.1,r1=.5+rr()*1.4;q.fillStyle=rr()<.5?'rgba(40,120,80,'+(.1+rr()*.14)+')':'rgba(170,236,150,'+(.08+rr()*.12)+')';q.beginPath();q.ellipse(x,y,r1,r1*(.5+rr()*.4),rr()*3,0,TAU);q.fill()}
 q.lineCap='round';for(i=0;i<900;i++){var gx=(rr()-.5)*I.rx*2.1,gy=(rr()-.5)*I.ry*2.1,t=.09+rr()*.09,lx=(rr()-.5)*.05;q.strokeStyle=rr()<.55?'rgba(190,240,170,'+(.35+rr()*.3)+')':'rgba(36,110,72,'+(.35+rr()*.3)+')';q.lineWidth=.014+rr()*.01;q.beginPath();q.moveTo(gx,gy);q.quadraticCurveTo(gx-t*.5+lx,gy-t*.5-lx,gx-t,gy-t);q.stroke()}
 var pal=['#ff9ab8','#ffe27a','#ffffff','#c8a0ff','#9ee0ff'];for(i=0;i<70;i++){var fx=(rr()-.5)*I.rx*1.9,fy=(rr()-.5)*I.ry*1.9,c=pal[(rr()*pal.length)|0];q.fillStyle=c;q.beginPath();q.arc(fx,fy,.034+rr()*.02,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.7)';q.beginPath();q.arc(fx-.01,fy-.012,.012,0,TAU);q.fill()}}
function tiles(q,I,c1,c2,sz,rr){var R=Math.max(I.rx,I.ry)+2,a,b,k=0;q.fillStyle=C0.lg(q,0,-R,0,R,[0,'#f6f7fd',1,'#c9d0e6']);q.fillRect(-R,-R,R*2,R*2);
 for(a=-R;a<R;a+=sz)for(b=-R;b<R;b+=sz){k=((Math.round(a/sz)+Math.round(b/sz))&1);var j=(rr()-.5)*.05;q.fillStyle=k?c1:c2;q.globalAlpha=.9+j;q.fillRect(a,b,sz,sz);if(rr()<.12){q.globalAlpha=.1;q.fillStyle='#5a6aa8';q.fillRect(a+rr()*sz*.5,b+rr()*sz*.5,sz*.4,sz*.4)}}q.globalAlpha=1;
 q.strokeStyle='rgba(70,82,128,.3)';q.lineWidth=.02;for(a=-R;a<=R;a+=sz){q.beginPath();q.moveTo(a,-R);q.lineTo(a,R);q.moveTo(-R,a);q.lineTo(R,a);q.stroke()}}
function rim(q,I,garden){var P=I.poly.map(function(p){return L(I,p)}),W=I.wp.map(function(p){return L(I,p)});
 function path(A){q.beginPath();A.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath()}
 if(garden){path(P);q.lineWidth=.9;q.strokeStyle='rgba(30,90,60,.5)';q.stroke();path(P);q.lineWidth=.45;q.strokeStyle='rgba(120,90,70,.55)';q.stroke();path(W);q.lineWidth=.05;q.strokeStyle='rgba(190,240,170,.35)';q.stroke()}
 else{path(P);q.lineWidth=.8;q.strokeStyle='#aab2d0';q.stroke();path(P);q.lineWidth=.42;q.strokeStyle='#c9cfe6';q.stroke();path(W);q.lineWidth=.07;q.strokeStyle='#e0bc62';q.stroke();path(W);q.lineWidth=.025;q.strokeStyle='rgba(60,60,110,.5)';q.stroke();
  var rr=C0.rng(I.seed*3+1),n=I.wp.length*3;for(var i=0;i<n;i++){var t=i/n*I.wp.length,j=Math.floor(t),f=t-j,a=P[j%P.length],b=P[(j+1)%P.length],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;var c=W[j%W.length],d=W[(j+1)%W.length],x2=c[0]+(d[0]-c[0])*f,y2=c[1]+(d[1]-c[1])*f;q.strokeStyle='rgba(70,76,120,.28)';q.lineWidth=.022;q.beginPath();q.moveTo(x,y);q.lineTo(x2,y2);q.stroke()}}}
/* ---------- đường đi ---------- */
function road(q,R,I,seed){var wd=R[0],st=R[1],P=R[2].map(function(p){return L(I,p)}),poly=spline(P,10),rr=C0.rng(seed),k,S;
 if(st==='cob'){pstroke(q,poly,wd+.62,'rgba(30,80,50,.2)');pstroke(q,poly,wd+.34,'rgba(40,70,40,.28)');pstroke(q,poly,wd+.13,'#665c4c');pstroke(q,poly,wd,'#b4a688');
  S=resample(poly,.33);var lat=Math.max(1,Math.round(wd/.36)),pal=['#e4d8ba','#d8caa6','#cdbf9e','#dccfb2'];
  S.forEach(function(s){var nx=-Math.sin(s[2]),ny=Math.cos(s[2]);for(k=0;k<lat;k++){var o=((k+.5)/lat-.5)*wd+(rr()-.5)*.07;stone(q,s[0]+nx*o+(rr()-.5)*.05,s[1]+ny*o+(rr()-.5)*.05,.2+rr()*.05,.15+rr()*.05,s[2]+(rr()-.5)*.7,rr,pal[(rr()*4)|0])}});
  S.forEach(function(s,ix){if(ix%2)return;[-1,1].forEach(function(sd){var o=sd*(wd/2+.05+rr()*.1);q.fillStyle=rr()<.5?'rgba(116,170,92,.85)':'rgba(122,114,102,.9)';q.beginPath();q.ellipse(s[0]-Math.sin(s[2])*o,s[1]+Math.cos(s[2])*o,.06+rr()*.05,.045+rr()*.04,rr()*3,0,TAU);q.fill()})})}
 else{pstroke(q,poly,wd+.34,'#7a82a8');pstroke(q,poly,wd+.2,'#e0ba58');pstroke(q,poly,wd+.08,'#98a0c4');pstroke(q,poly,wd,'#b9c1de');
  var rows=Math.max(2,Math.round(wd/.62)),tn=['#fbfcff','#f0f3fc','#e6eaf8'];S=resample(poly,.8);
  S.forEach(function(s,ix){var nx=-Math.sin(s[2]),ny=Math.cos(s[2]),cs=Math.cos(s[2]),sn=Math.sin(s[2]);for(k=0;k<rows;k++){var o=((k+.5)/rows-.5)*wd,of=((ix+k)&1)?.4:0,sw=wd/rows;q.save();q.translate(s[0]+nx*o+cs*of,s[1]+ny*o+sn*of);q.rotate(s[2]);q.fillStyle=tn[(rr()*3)|0];q.fillRect(-.38,-sw/2+.02,.76,sw-.04);q.strokeStyle='rgba(80,92,140,.38)';q.lineWidth=.018;q.strokeRect(-.38,-sw/2+.02,.76,sw-.04);q.restore()}});
  [-1,1].forEach(function(sd){pstroke(q,resample(poly,.3).map(function(s){return[s[0]-Math.sin(s[2])*sd*(wd/2-.1),s[1]+Math.cos(s[2])*sd*(wd/2-.1)]}),.04,'rgba(224,188,90,.9)','butt')})}}
function carpet(q,I){var a=L(I,[CARPET[0],CARPET[1]]),b=L(I,[CARPET[2],CARPET[3]]),w=CARPET[4],x0=a[0]-w/2,y0=b[1],h=a[1]-b[1],cx=a[0],y;
 q.fillStyle='rgba(30,0,10,.35)';q.fillRect(x0-.14,y0-.04,w+.28,h+.14);q.fillStyle='#8c1c26';q.fillRect(x0-.06,y0,w+.12,h);q.fillStyle='#b02a32';q.fillRect(x0,y0,w,h);q.fillStyle='#c23a3c';q.fillRect(x0+.3,y0,w-.6,h);
 q.fillStyle='#e6bc58';q.fillRect(x0+.07,y0,.05,h);q.fillRect(x0+w-.12,y0,.05,h);q.fillRect(x0+.24,y0,.025,h);q.fillRect(x0+w-.265,y0,.025,h);
 for(y=a[1]-.8;y>y0+.3;y-=1.3){q.beginPath();q.moveTo(cx,y-.3);q.lineTo(cx+.3,y);q.lineTo(cx,y+.3);q.lineTo(cx-.3,y);q.closePath();q.fillStyle='#ecc760';q.fill();q.lineWidth=.025;q.strokeStyle='#8a5a14';q.stroke();q.fillStyle='#b02a32';q.beginPath();q.arc(cx,y,.09,0,TAU);q.fill();
  q.strokeStyle='rgba(236,199,96,.85)';q.lineWidth=.03;[-1,1].forEach(function(sd){q.beginPath();q.arc(cx+sd*.55,y,.17,sd>0?Math.PI*.5:-Math.PI*.5,sd>0?Math.PI*1.5:Math.PI*.5,sd<0);q.stroke();q.beginPath();q.arc(cx+sd*.55,y,.08,0,TAU);q.stroke()})}
 q.strokeStyle='#e6bc58';q.lineWidth=.025;for(var i=0;i<=16;i++){var fx=x0+i*w/16;q.beginPath();q.moveTo(fx,a[1]);q.lineTo(fx,a[1]+.16);q.stroke()}}
/* ---------- hoa văn quảng trường ---------- */
function medal(q,I,M){var c=L(I,[M[0],M[1]]),R=M[2],x=c[0],y=c[1],i,j;
 q.fillStyle='rgba(50,50,110,.22)';q.beginPath();q.arc(x,y,R+.16,0,TAU);q.fill();
 q.fillStyle=C0.rg(q,x,y,.2,R,[0,'#fffdf4',1,'#e6dfc8']);q.beginPath();q.arc(x,y,R,0,TAU);q.fill();
 q.lineWidth=.11;q.strokeStyle='#d6ac4c';q.beginPath();q.arc(x,y,R,0,TAU);q.stroke();q.lineWidth=.025;q.strokeStyle='#7a5a20';q.beginPath();q.arc(x,y,R+.06,0,TAU);q.stroke();q.beginPath();q.arc(x,y,R-.07,0,TAU);q.stroke();
 q.lineWidth=.04;q.strokeStyle='#5878d6';q.beginPath();q.arc(x,y,R*.8,0,TAU);q.stroke();q.lineWidth=.025;q.strokeStyle='#e0b850';q.beginPath();q.arc(x,y,R*.74,0,TAU);q.stroke();q.beginPath();q.arc(x,y,R*.5,0,TAU);q.stroke();
 var bg=[7,6,5,4,3,2,1,0];q.lineCap='butt';for(i=0;i<8;i++){var a=i/8*TAU-Math.PI/2,bits=bg[i];for(j=0;j<3;j++){var r=R*(.55+j*.07),d=.2,on=(bits>>j)&1;q.strokeStyle='#2a2a64';q.lineWidth=.035;if(on){q.beginPath();q.arc(x,y,r,a-d,a+d);q.stroke()}else{q.beginPath();q.arc(x,y,r,a-d,a-.04);q.stroke();q.beginPath();q.arc(x,y,r,a+.04,a+d);q.stroke()}}}
 q.beginPath();for(i=0;i<16;i++){var aa=i/16*TAU,rr2=i%2?R*.2:R*.46;q.lineTo(x+Math.cos(aa)*rr2,y+Math.sin(aa)*rr2)}q.closePath();q.fillStyle='rgba(88,120,214,.32)';q.fill();
 for(i=0;i<8;i++){var pa=i/8*TAU;q.save();q.translate(x+Math.cos(pa)*R*.27,y+Math.sin(pa)*R*.27);q.rotate(pa);q.fillStyle='#f8c8da';q.strokeStyle='#cc7898';q.lineWidth=.02;q.beginPath();q.ellipse(0,0,R*.17,R*.075,0,0,TAU);q.fill();q.stroke();q.restore()}
 for(i=0;i<8;i++){var pb=(i+.5)/8*TAU;q.save();q.translate(x+Math.cos(pb)*R*.2,y+Math.sin(pb)*R*.2);q.rotate(pb);q.fillStyle='#fff2f6';q.beginPath();q.ellipse(0,0,R*.11,R*.05,0,0,TAU);q.fill();q.restore()}
 q.fillStyle='#ffe27a';q.beginPath();q.arc(x,y,R*.11,0,TAU);q.fill();q.lineWidth=.02;q.strokeStyle='#b08420';q.stroke();
 for(i=0;i<16;i++){var da=i/16*TAU;q.fillStyle='#dcae48';q.beginPath();q.arc(x+Math.cos(da)*R*.9,y+Math.sin(da)*R*.9,.045,0,TAU);q.fill()}}
function ring(q,I,T){var c=L(I,[T[0],T[1]]),r=T[2],i,rr=C0.rng((T[0]*91+T[1]*17)|0);
 q.fillStyle='rgba(0,0,40,.25)';q.beginPath();q.ellipse(c[0]+.04,c[1]+.06,r+.2,r+.2,0,0,TAU);q.fill();
 for(i=0;i<16;i++){var t=i/16*TAU;stone(q,c[0]+Math.cos(t)*(r+.04),c[1]+Math.sin(t)*(r+.04),.17,.13,t+Math.PI/2,rr,['#c8cee2','#b5bcd4','#d4d9ea'][i%3])}
 q.fillStyle=C0.rg(q,c[0],c[1],.05,r,[0,'#6a5240',1,'#4a382c']);q.beginPath();q.arc(c[0],c[1],r-.05,0,TAU);q.fill();
 for(i=0;i<14;i++){q.fillStyle='rgba(30,20,14,.35)';q.beginPath();q.arc(c[0]+(rr()-.5)*r*1.5,c[1]+(rr()-.5)*r*1.5,.03+rr()*.03,0,TAU);q.fill()}}
function bed(q,I,B,seed){var c=L(I,[B[0],B[1]]),rx=B[2],ry=B[3],rr=C0.rng(seed),i,t;
 q.fillStyle='rgba(0,0,40,.22)';q.beginPath();q.ellipse(c[0]+.04,c[1]+.07,rx+.24,ry+.24,0,0,TAU);q.fill();
 for(i=0;i<20;i++){t=i/20*TAU;stone(q,c[0]+Math.cos(t)*(rx+.08),c[1]+Math.sin(t)*(ry+.08),.19,.14,t+Math.PI/2,rr,['#c8cee2','#b5bcd4','#d4d9ea'][i%3])}
 q.fillStyle=C0.rg(q,c[0],c[1],.05,rx,[0,'#5e4838',1,'#3e3026']);q.beginPath();q.ellipse(c[0],c[1],rx,ry,0,0,TAU);q.fill();
 var cs=['#ff8fb4','#ffd86a','#ffffff','#b890ff','#ff7a6a','#8ad8ff'];for(i=0;i<46;i++){var a=rr()*TAU,d=Math.sqrt(rr()),x=c[0]+Math.cos(a)*rx*.88*d,y=c[1]+Math.sin(a)*ry*.88*d;q.strokeStyle='#3a8a4c';q.lineWidth=.02;q.beginPath();q.moveTo(x,y);q.lineTo(x-.07,y-.07);q.stroke();var col=cs[(rr()*cs.length)|0];q.fillStyle=col;for(var p=0;p<5;p++){var pa=p/5*TAU;q.beginPath();q.arc(x-.07+Math.cos(pa)*.032,y-.07+Math.sin(pa)*.032,.024,0,TAU);q.fill()}q.fillStyle='#fff3b0';q.beginPath();q.arc(x-.07,y-.07,.016,0,TAU);q.fill()}}
/* ---------- ao sen ---------- */
function pond(q,I,P){var c=L(I,[P.x,P.y]),rr=C0.rng(P.seed),rx=P.rx,ry=P.ry,i,x=c[0],y=c[1];
 q.fillStyle='rgba(0,0,40,.25)';blob(q,x+.05,y+.08,rx+.42,ry+.38,P.seed,16,.1);q.fill();
 blob(q,x,y,rx+.3,ry+.26,P.seed,16,.1);q.fillStyle='#7c84a6';q.fill();
 for(i=0;i<26;i++){var t=i/26*TAU;stone(q,x+Math.cos(t)*(rx+.2),y+Math.sin(t)*(ry+.17),.19,.14,t+Math.PI/2,rr,['#cdd3e6','#b9c0d8','#dadff0'][i%3])}
 blob(q,x,y,rx,ry,P.seed+1,16,.08);q.fillStyle=C0.rg(q,x-rx*.25,y-ry*.3,.1,rx*1.2,[0,'#58cce6',.45,'#2f86c0',1,'#18407a']);q.fill();
 q.save();q.clip();q.fillStyle='rgba(255,255,255,.3)';q.beginPath();q.ellipse(x-rx*.35,y-ry*.35,rx*.28,ry*.16,-.3,0,TAU);q.fill();q.strokeStyle='rgba(255,255,255,.28)';q.lineWidth=.02;for(i=0;i<6;i++){q.beginPath();q.ellipse(x+(rr()-.5)*rx,y+(rr()-.5)*ry,rx*(.15+rr()*.15),ry*(.08+rr()*.08),0,.2,Math.PI*.8);q.stroke()}
 q.fillStyle='rgba(40,10,90,.18)';q.beginPath();q.ellipse(x+rx*.45,y+ry*.5,rx*.7,ry*.4,0,0,TAU);q.fill();
 for(i=0;i<2;i++){var kx=x+(rr()-.5)*rx*.9,ky=y+(rr()-.5)*ry*.8,ka=rr()*TAU;q.save();q.translate(kx,ky);q.rotate(ka);q.fillStyle='rgba(255,130,70,.92)';q.beginPath();q.ellipse(0,0,.2,.065,0,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.85)';q.beginPath();q.ellipse(-.03,0,.07,.04,0,0,TAU);q.fill();q.fillStyle='rgba(255,130,70,.92)';q.beginPath();q.moveTo(-.18,0);q.lineTo(-.3,-.07);q.lineTo(-.3,.07);q.closePath();q.fill();q.restore()}
 var np=Math.round(rx*rx*1.6+3);for(i=0;i<np;i++){var pa=rr()*TAU,pd=Math.sqrt(rr())*.82,px=x+Math.cos(pa)*rx*pd,py=y+Math.sin(pa)*ry*pd,pr=.15+rr()*.1,nt=rr()*TAU;q.fillStyle='rgba(20,60,50,.35)';q.beginPath();q.ellipse(px+.02,py+.03,pr,pr,0,0,TAU);q.fill();q.fillStyle=rr()<.5?'#3f9e5c':'#56b46a';q.beginPath();q.moveTo(px,py);q.arc(px,py,pr,nt+.35,nt+TAU-.35);q.closePath();q.fill();q.strokeStyle='rgba(20,80,50,.55)';q.lineWidth=.014;q.stroke()}
 q.restore();
 var nl=Math.max(2,Math.round(rx*1.4));for(i=0;i<nl;i++){var la=rr()*TAU,ld=.25+rr()*.5,lx=x+Math.cos(la)*rx*ld,ly=y+Math.sin(la)*ry*ld;for(var p=0;p<7;p++){var an=p/7*TAU+i;q.save();q.translate(lx,ly);q.rotate(an);q.fillStyle=p%2?'#ffd2e2':'#f8a4c4';q.strokeStyle='rgba(180,70,110,.6)';q.lineWidth=.012;q.beginPath();q.ellipse(.08,0,.1,.04,0,0,TAU);q.fill();q.stroke();q.restore()}q.fillStyle='#ffe27a';q.beginPath();q.arc(lx,ly,.04,0,TAU);q.fill()}}
function yard(q,I,h,gd){var c=L(I,[h.x,h.y]),m=.55,w=h.w+m*2,d=h.d+m*2,rr=C0.rng((h.x*13+h.y*7)|0),i;
 q.fillStyle=gd?'rgba(30,70,40,.25)':'rgba(60,64,110,.16)';q.beginPath();q.ellipse(c[0],c[1],w*.72,d*.72,0,0,TAU);q.fill();
 q.save();q.translate(c[0],c[1]+.18);for(i=0;i<(w*d*3)|0;i++){stone(q,(rr()-.5)*w*.95,(rr()-.5)*d*.95,.2+rr()*.06,.15+rr()*.05,rr()*3,rr,['#d9cdb0','#cdbf9e','#e1d6bb'][(rr()*3)|0])}q.restore()}
/* ---------- đảo phụ (không đi được): sân đá quanh đình, bậc đá ---------- */
function decoGround(q,I,rr){var i;if(I.pg){q.lineWidth=.9;q.strokeStyle='rgba(60,50,40,.3)';q.beginPath();q.ellipse(0,0,1.55,1.55,0,0,TAU);q.stroke();for(i=0;i<22;i++){var t=i/22*TAU;stone(q,Math.cos(t)*1.45,Math.sin(t)*1.45,.24,.17,t+Math.PI/2,rr,['#e2d6b8','#d6c8a4','#cabc9c'][i%3])}
  var P=[[0,1.4],[.3,2.0],[.1,2.8]];P.forEach(function(p,ix){stone(q,p[0],p[1],.26,.18,rr()*3,rr,'#dccfb2')})}
 else{for(i=0;i<5;i++)stone(q,-.9+i*.45,.35+Math.sin(i*1.3)*.25,.22,.16,rr()*3,rr,'#dccfb2')}}
var MANAGED={arr:1,wst:1,est:1,pal:1,nw:1,ne:1,fe:1,fw:1,nn:1};
function ground(q,I,kind,C){if(!MANAGED[I.id])return;C0=C;var rr=C.rng(I.seed*101+7),plaza=(kind==='plaza'||kind==='terrace'),i;
 C.GR(q,0,0,0,function(q){
  if(plaza)tiles(q,I,kind==='plaza'?'#eff2fc':'#f8f3e6',kind==='plaza'?'#cfd6ec':'#ddd3b8',1,rr);else grass(q,I,rr);
  rim(q,I,!plaza);
  HOUSES.forEach(function(h){if(C.inPoly(I.poly,h.x,h.y))yard(q,I,h,!plaza)});
  (ROADS[I.id]||[]).forEach(function(R,ix){road(q,R,I,I.seed*17+ix)});
  if(I.id==='pal')carpet(q,I);
  if(MED[I.id])medal(q,I,MED[I.id]);
  (RINGS[I.id]||[]).forEach(function(T){ring(q,I,T)});
  (BEDS[I.id]||[]).forEach(function(B,ix){bed(q,I,B,I.seed*5+ix)});
  PONDS.forEach(function(P){if(P.isl===I.id)pond(q,I,P)});
  if(kind==='deco')decoGround(q,I,rr)})}
/* ---------- cây cối & thảm thực vật (sprite dựng 1 lần, ánh trăng từ trên-trái) ---------- */
function hsh(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function SP(C,name,w,h,ax,ay,fn){var U=C.HW/46;return C.spr('x'+name,w*U,h*U,ax*U,ay*U,function(q){q.scale(U,U);fn(q,C.rng(hsh(name)),C)},C.dG())}
function shadow(q,rx,ry,dx){q.fillStyle='rgba(0,0,34,.3)';q.beginPath();q.ellipse(dx||6,2,rx,ry,0,0,TAU);q.fill();q.fillStyle='rgba(0,0,34,.18)';q.beginPath();q.ellipse(dx||6,2,rx*1.3,ry*1.3,0,0,TAU);q.fill()}
function cluster(q,x,y,r,pal,rr,n,leaf,shape){var i;q.fillStyle=pal[0];q.beginPath();q.ellipse(x,y,r,r*.82,0,0,TAU);q.fill();q.fillStyle=pal[1];q.beginPath();q.ellipse(x-r*.08,y-r*.12,r*.88,r*.7,0,0,TAU);q.fill();q.fillStyle=pal[2];q.beginPath();q.ellipse(x-r*.3,y-r*.3,r*.55,r*.38,-.35,0,TAU);q.fill();
 for(i=0;i<n;i++){var a=rr()*TAU,d=Math.sqrt(rr())*r*.95,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.8,t=(-(px-x)-(py-y)*1.3)/(r*1.6)+(rr()-.5)*.5,col=t>.28?pal[2]:t>-.15?pal[1]:pal[0];q.fillStyle=col;q.globalAlpha=.9;var sz=leaf*(.6+rr()*.7);if(shape==='dia'){q.beginPath();q.moveTo(px,py-sz);q.lineTo(px+sz*.6,py);q.lineTo(px,py+sz);q.lineTo(px-sz*.6,py);q.closePath();q.fill()}else{q.beginPath();q.arc(px,py,sz,0,TAU);q.fill()}}
 q.globalAlpha=1;q.strokeStyle=pal[3];q.lineWidth=1.3;q.globalAlpha=.55;q.beginPath();q.arc(x,y,r*.97,Math.PI*.92,Math.PI*1.5);q.stroke();q.globalAlpha=1}
function trunk(q,x0,y0,x1,y1,w0,w1,cx,cy,c1,c2){var n=14,i,L=[],R=[];for(i=0;i<=n;i++){var t=i/n,u=1-t,px=u*u*x0+2*u*t*cx+t*t*x1,py=u*u*y0+2*u*t*cy+t*t*y1,dx=2*u*(cx-x0)+2*t*(x1-cx),dy=2*u*(cy-y0)+2*t*(y1-cy),l=Math.hypot(dx,dy)||1,w=(w0+(w1-w0)*t)/2;L.push([px-dy/l*w,py+dx/l*w]);R.push([px+dy/l*w,py-dx/l*w])}
 q.beginPath();L.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});for(i=n;i>=0;i--)q.lineTo(R[i][0],R[i][1]);q.closePath();q.fillStyle=c1;q.fill();q.beginPath();L.forEach(function(p,i){i?q.lineTo(p[0]+(R[i][0]-p[0])*.45,p[1]+(R[i][1]-p[1])*.45):q.moveTo(p[0]+(R[0][0]-p[0])*.45,p[1]+(R[0][1]-p[1])*.45)});for(i=n;i>=0;i--)q.lineTo(L[i][0],L[i][1]);q.closePath();q.fillStyle=c2;q.globalAlpha=.55;q.fill();q.globalAlpha=1;q.strokeStyle='rgba(0,0,0,.35)';q.lineWidth=.8;q.beginPath();L.forEach(function(p,i){i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.stroke()}
function bark(q,x,y,h,rr,n){q.strokeStyle='rgba(20,10,10,.4)';q.lineWidth=.9;for(var i=0;i<n;i++){var yy=y-rr()*h;q.beginPath();q.moveTo(x+(rr()-.5)*3,yy);q.lineTo(x+(rr()-.5)*3,yy-3-rr()*4);q.stroke()}}
function pad(q,x,y,r,rr,cs){var k,i;for(k=0;k<3;k++){q.fillStyle=cs[k];q.beginPath();q.ellipse(x,y-k*3.4,r*(1-k*.1),r*.32*(1-k*.04),0,0,TAU);q.fill()}
 q.fillStyle='rgba(180,255,210,.28)';q.beginPath();q.ellipse(x-r*.25,y-8,r*.5,r*.14,-.2,0,TAU);q.fill();
 for(i=0;i<34;i++){var a=rr()*TAU,d=.7+rr()*.3,px=x+Math.cos(a)*r*d,py=y-3+Math.sin(a)*r*.3*d,l=3+rr()*4;q.strokeStyle=rr()<.5?cs[0]:cs[3];q.lineWidth=.9;q.beginPath();q.moveTo(px,py);q.lineTo(px+Math.cos(a)*l*.5,py+2+rr()*3);q.stroke()}}
function drawPine(q,rr,v){var lean=(v%3-1)*5,sc=.92+(v%4)*.05;q.save();q.scale(sc,sc);shadow(q,30,9);
 q.fillStyle='#3a2418';q.beginPath();q.moveTo(-9,0);q.quadraticCurveTo(-4,-4,-3,-9);q.lineTo(3,-9);q.quadraticCurveTo(5,-4,10,0);q.closePath();q.fill();
 trunk(q,0,-4,lean*.4,-78,9,4,-11+lean,-34,'#3e281c','#7a5a40');bark(q,0,-10,64,rr,12);
 q.strokeStyle='#3a2418';q.lineCap='round';q.lineWidth=3.4;q.beginPath();q.moveTo(lean*.2,-44);q.quadraticCurveTo(14,-50,25,-56);q.stroke();q.beginPath();q.moveTo(-1,-34);q.quadraticCurveTo(-14,-42,-25,-50);q.stroke();
 var cs=['#143a3a','#1f5c4c','#34906a','#0c2a2c'];pad(q,-24,-50,23,rr,cs);pad(q,24,-56,25,rr,cs);pad(q,lean*.3,-39,19,rr,cs);pad(q,lean*.4-2,-82,31,rr,['#143a3a','#236a56','#42a478','#0c2a2c']);q.restore()}
function blossomTree(q,rr,v,pal,fruit){var lean=(v%3-1)*4;shadow(q,32,10);
 q.fillStyle='#3a2230';q.beginPath();q.moveTo(-10,0);q.quadraticCurveTo(-4,-5,-3,-10);q.lineTo(4,-10);q.quadraticCurveTo(6,-5,11,0);q.closePath();q.fill();
 trunk(q,0,-4,lean,-50,10,5,-9+lean,-24,'#4a2a3a','#8a5a68');bark(q,0,-8,40,rr,9);
 q.strokeStyle='#4a2a3a';q.lineCap='round';q.lineWidth=3.4;q.beginPath();q.moveTo(lean,-36);q.quadraticCurveTo(18,-46,30,-62);q.stroke();q.lineWidth=3;q.beginPath();q.moveTo(lean-1,-30);q.quadraticCurveTo(-16,-42,-30,-56);q.stroke();q.lineWidth=2.4;q.beginPath();q.moveTo(lean,-48);q.quadraticCurveTo(2,-62,6,-78);q.stroke();
 cluster(q,-28,-66,22,pal,rr,34,3.2);cluster(q,30,-68,21,pal,rr,34,3.2);cluster(q,lean+2,-86,29,pal,rr,50,3.4);cluster(q,-6,-58,22,pal,rr,30,3.2);
 var cs=['#ffd0e0','#ffffff','#ff9ab8'];for(var i=0;i<26;i++){q.fillStyle=cs[(rr()*3)|0];q.beginPath();q.arc((rr()-.5)*80,-60-rr()*50,1.6,0,TAU);q.fill()}
 if(fruit){for(i=0;i<7;i++){var fx=(rr()-.5)*66,fy=-52-rr()*40;q.fillStyle='rgba(255,220,120,.35)';q.beginPath();q.arc(fx,fy,6,0,TAU);q.fill();q.fillStyle=C0.rg(q,fx-1,fy-1,.5,4,[0,'#fff0a0',1,'#ffb050']);q.beginPath();q.arc(fx,fy,3.4,0,TAU);q.fill();q.fillStyle='#e8704a';q.beginPath();q.arc(fx+1.2,fy+1,1.8,0,TAU);q.fill();q.fillStyle='#4a9a4a';q.beginPath();q.ellipse(fx+1,fy-3.6,2.2,1,.5,0,TAU);q.fill()}}
 for(i=0;i<22;i++){q.fillStyle=pal[2];q.globalAlpha=.75;q.beginPath();q.ellipse((rr()-.5)*70,-2+rr()*7,1.6,.9,rr()*3,0,TAU);q.fill()}q.globalAlpha=1}
function drawLeafy(q,rr,v,pal,shape,leaf,h){var lean=(v%3-1)*4;shadow(q,32,10);
 q.fillStyle='#3a2a20';q.beginPath();q.moveTo(-10,0);q.quadraticCurveTo(-4,-5,-3,-10);q.lineTo(4,-10);q.quadraticCurveTo(6,-5,11,0);q.closePath();q.fill();
 trunk(q,0,-4,lean,-48,11,6,-6+lean,-22,'#4a3424','#8a6a4c');bark(q,0,-8,38,rr,9);
 cluster(q,-26,-62,24,pal,rr,38,leaf,shape);cluster(q,27,-64,23,pal,rr,38,leaf,shape);cluster(q,lean,-78,32,pal,rr,56,leaf,shape);cluster(q,-5,-52,24,pal,rr,34,leaf,shape)}
function drawWillow(q,rr,v){var lean=(v%3-1)*5;shadow(q,34,10);q.fillStyle='#3a2a20';q.beginPath();q.moveTo(-11,0);q.quadraticCurveTo(-4,-5,-3,-10);q.lineTo(4,-10);q.quadraticCurveTo(6,-5,12,0);q.closePath();q.fill();
 trunk(q,0,-4,lean,-62,13,6,-10+lean,-30,'#4a3828','#8a7050');bark(q,0,-8,50,rr,11);
 var pal=['#2a6a46','#4a9a5c','#8ad080','#d8f6b8'];cluster(q,lean-6,-76,32,pal,rr,40,3.4);cluster(q,lean+18,-70,22,pal,rr,26,3.2);cluster(q,lean-26,-68,20,pal,rr,24,3.2);
 var i;for(i=0;i<58;i++){var a=Math.PI*(.04+rr()*.92),bx=lean-6+Math.cos(a+Math.PI)*34*(.55+rr()*.45),by=-70+Math.sin(a)*13,len=36+rr()*40,sw=(rr()-.5)*10;q.strokeStyle=rr()<.5?'rgba(86,160,86,.9)':'rgba(150,214,120,.9)';q.lineWidth=1+rr()*.7;q.beginPath();q.moveTo(bx,by);q.bezierCurveTo(bx+sw,by+len*.3,bx+sw*1.6,by+len*.7,bx+sw*1.2,by+len);q.stroke();for(var k=1;k<5;k++){q.fillStyle=k%2?'#a8e08a':'#6ab864';q.beginPath();q.ellipse(bx+sw*1.6*(k/5),by+len*k/5.2,1.5,.8,.8,0,TAU);q.fill()}}}
function drawBamboo(q,rr,v){shadow(q,26,8);var n=6+(v%3),i;for(i=0;i<n;i++){var x=(i-n/2)*5.4+(rr()-.5)*3,h=118+rr()*60,lean=(rr()-.5)*12,seg=20+rr()*6;
  var g=q.createLinearGradient(x-2.4,0,x+2.4,0);g.addColorStop(0,'#1c6a46');g.addColorStop(.35,'#5ac084');g.addColorStop(1,'#1a5a3c');q.strokeStyle=g;q.lineWidth=4.4;q.lineCap='butt';q.beginPath();q.moveTo(x,0);q.quadraticCurveTo(x+lean*.2,-h*.5,x+lean,-h);q.stroke();
  for(var yy=seg*.6;yy<h;yy+=seg){var tt=yy/h,nx=x+lean*(2*tt*(1-tt)*.2+tt*tt);q.strokeStyle='#d8f0b8';q.lineWidth=1.3;q.beginPath();q.moveTo(nx-2.6,-yy);q.lineTo(nx+2.6,-yy);q.stroke();q.strokeStyle='rgba(0,40,20,.45)';q.lineWidth=.8;q.beginPath();q.moveTo(nx-2.4,-yy+1.1);q.lineTo(nx+2.4,-yy+1.1);q.stroke()}
  for(var j=0;j<5;j++){var ly=h*(.55+.1*j)+rr()*4,tt2=ly/h,lx=x+lean*(2*tt2*(1-tt2)*.2+tt2*tt2),dir=j%2?1:-1;for(var k=0;k<3;k++){var ang=dir*(.5+k*.34)+(rr()-.5)*.2-Math.PI/2,ll=20+rr()*12;q.save();q.translate(lx,-ly);q.rotate(ang);q.fillStyle=['#2a8a50','#52b86c','#86dc8a'][(rr()*3)|0];q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(ll*.5,-3.2,ll,0);q.quadraticCurveTo(ll*.5,1.4,0,0);q.fill();q.restore()}}}}
function drawSpirit(q,rr,v){var i;q.save();q.globalCompositeOperation='lighter';var g=C0.rg(q,0,-78,2,70,[0,'rgba(140,255,240,.38)',.55,'rgba(150,170,255,.16)',1,'rgba(150,170,255,0)']);q.fillStyle=g;q.beginPath();q.arc(0,-78,70,0,TAU);q.fill();q.restore();
 shadow(q,24,7);trunk(q,0,-3,(v%3-1)*4,-64,9,3.6,-8,-30,'#cfe4ee','#ffffff');q.strokeStyle='rgba(120,230,240,.8)';q.lineWidth=1.1;q.beginPath();q.moveTo(0,-3);q.quadraticCurveTo(-8,-30,(v%3-1)*4,-64);q.stroke();
 q.strokeStyle='#cfe4ee';q.lineCap='round';q.lineWidth=2.6;[[-26,-86],[28,-92],[-10,-104],[12,-78]].forEach(function(b){q.beginPath();q.moveTo((v%3-1)*3,-54);q.quadraticCurveTo(b[0]*.3,b[1]*.5-20,b[0],b[1]);q.stroke()});
 for(i=0;i<46;i++){var a=rr()*TAU,d=Math.sqrt(rr())*40,x=Math.cos(a)*d*1.1,y=-82+Math.sin(a)*d*.8,s=3+rr()*4.6,t=(-(x)-(y+82))/60,cc=t>.2?['#f0ffff','#9ae8ff']:t>-.2?['#a8e8ff','#6a9aff']:['#7aa0ff','#8a6ae0'];q.save();q.translate(x,y);q.rotate((rr()-.5)*1.2);var lg=q.createLinearGradient(0,-s,0,s);lg.addColorStop(0,cc[0]);lg.addColorStop(1,cc[1]);q.fillStyle=lg;q.beginPath();q.moveTo(0,-s*1.5);q.lineTo(s*.7,0);q.lineTo(0,s*1.2);q.lineTo(-s*.7,0);q.closePath();q.fill();q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=.6;q.stroke();q.restore()}
 q.save();q.globalCompositeOperation='lighter';for(i=0;i<8;i++){q.fillStyle='rgba(200,255,255,.85)';q.beginPath();q.arc((rr()-.5)*90,-30-rr()*90,1.2+rr()*1.2,0,TAU);q.fill()}q.restore()}
function drawBush(q,rr,v){var pal=[['#1f5a44','#3a8a5c','#6ac888','#c8f4c0'],['#2a6a48','#4a9a60','#86d890','#d8f8c8'],['#265a5a','#3a8a84','#6ad0c0','#c8fff0']][v%3],fl=[['#ff9ab8','#ffd0e0'],['#ffe27a','#fff6c0'],['#c8a0ff','#eadcff'],['#ffffff','#ffd8e8']][(v>>1)%4],i;
 shadow(q,22,6);cluster(q,-9,-9,10,pal,rr,14,2);cluster(q,9,-9,10,pal,rr,14,2);cluster(q,0,-15,12,pal,rr,18,2.2);for(i=0;i<16;i++){var a=rr()*TAU,d=Math.sqrt(rr())*16,x=Math.cos(a)*d*1.2,y=-12+Math.sin(a)*d*.7;q.fillStyle=fl[0];for(var p=0;p<5;p++){var pa=p/5*TAU;q.beginPath();q.arc(x+Math.cos(pa)*1.7,y+Math.sin(pa)*1.7,1.3,0,TAU);q.fill()}q.fillStyle=fl[1];q.beginPath();q.arc(x,y,1,0,TAU);q.fill()}}
function drawFlowers(q,rr,v){var cs=[['#ff8fb4','#ffd0e0'],['#ffd86a','#fff4b0'],['#b890ff','#e4d4ff'],['#8ad8ff','#d8f4ff'],['#ff7a6a','#ffc0b0'],['#ffffff','#ffe8f2']],i;q.fillStyle='rgba(0,30,10,.22)';q.beginPath();q.ellipse(0,1,15,5,0,0,TAU);q.fill();
 for(i=0;i<16;i++){var x=(rr()-.5)*26,y=-(rr()*9),h=8+rr()*9,c=cs[(v+((rr()*3)|0))%cs.length];q.strokeStyle='#3a8a4c';q.lineWidth=1.1;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+(rr()-.5)*3,y-h*.5,x,y-h);q.stroke();q.fillStyle='#4aa05a';q.beginPath();q.ellipse(x+2,y-h*.35,2.6,.9,-.6,0,TAU);q.fill();for(var p=0;p<5;p++){var pa=p/5*TAU;q.fillStyle=c[0];q.beginPath();q.arc(x+Math.cos(pa)*2,y-h+Math.sin(pa)*2,1.6,0,TAU);q.fill()}q.fillStyle=c[1];q.beginPath();q.arc(x,y-h,1.1,0,TAU);q.fill()}}
function drawTuft(q,rr,v){var i;q.fillStyle='rgba(0,30,10,.18)';q.beginPath();q.ellipse(0,1,9,3,0,0,TAU);q.fill();for(i=0;i<11;i++){var a=(i/10-.5)*1.5,h=8+rr()*9;q.strokeStyle=['#2f7a52','#4aa86a','#8ad88a'][i%3];q.lineWidth=1.3;q.lineCap='round';q.beginPath();q.moveTo((rr()-.5)*4,0);q.quadraticCurveTo(Math.sin(a)*h*.5,-h*.6,Math.sin(a)*h*.9,-h*Math.cos(a));q.stroke()}}
function drawShroom(q,rr,v){var i,cs=[['#7af0e8','#2a9aa8'],['#c8a0ff','#6a48b8'],['#ff9ae0','#a8488a']][v%3];q.save();q.globalCompositeOperation='lighter';q.fillStyle=C0.rg(q,0,-6,1,22,[0,'rgba(140,255,240,.35)',1,'rgba(140,255,240,0)']);q.beginPath();q.arc(0,-6,22,0,TAU);q.fill();q.restore();
 q.fillStyle='rgba(0,0,30,.25)';q.beginPath();q.ellipse(1,1,11,3.4,0,0,TAU);q.fill();[[-6,0,5.5],[5,1,7],[0,-2,4]].forEach(function(m,ix){var x=m[0],y=m[1],r=m[2];q.fillStyle='#e8f2ee';q.fillRect(x-1.2,y-r*.8,2.4,r*.8);q.fillStyle=cs[1];q.beginPath();q.ellipse(x,y-r*.8,r,r*.62,0,Math.PI,0);q.fill();q.fillStyle=cs[0];q.beginPath();q.ellipse(x-r*.15,y-r*.9,r*.8,r*.4,0,Math.PI,0);q.fill();q.fillStyle='rgba(255,255,255,.9)';q.beginPath();q.arc(x-r*.3,y-r*1.1,.9,0,TAU);q.arc(x+r*.25,y-r*.95,.7,0,TAU);q.fill()})}
function drawRockM(q,rr,v){var i;shadow(q,22,6);for(i=0;i<3;i++){var x=(i-1)*10+(rr()-.5)*4,w=7+rr()*7,h=6+rr()*9;q.fillStyle=C0.lg(q,x-w,-h,x+w,0,[0,'#a8a8c4',1,'#4a4a6a']);q.beginPath();q.moveTo(x-w,0);q.lineTo(x-w*.7,-h*.7);q.lineTo(x-w*.1,-h);q.lineTo(x+w*.6,-h*.6);q.lineTo(x+w,0);q.closePath();q.fill();q.fillStyle='rgba(255,255,255,.2)';q.beginPath();q.moveTo(x-w*.7,-h*.7);q.lineTo(x-w*.1,-h);q.lineTo(x-w*.2,-h*.55);q.closePath();q.fill();q.fillStyle='rgba(90,170,100,.85)';q.beginPath();q.ellipse(x-w*.15,-h*.92,w*.55,h*.14,-.1,0,TAU);q.fill();q.fillStyle='rgba(150,220,140,.8)';q.beginPath();q.ellipse(x-w*.3,-h*.95,w*.25,h*.07,-.1,0,TAU);q.fill()}}
var TREEK={pine:function(q,rr,v){drawPine(q,rr,v)},sak:function(q,rr,v){blossomTree(q,rr,v,['#c25c84','#ee8cae','#ffc4d8','#fff0f6'],0)},dao:function(q,rr,v){blossomTree(q,rr,v,['#c0405e','#ea6a86','#ffa6b4','#ffe0e4'],1)},
 phong:function(q,rr,v){drawLeafy(q,rr,v,['#7e2216','#cc4420','#ff983a','#ffd070'],'dia',3.4,1)},hanh:function(q,rr,v){drawLeafy(q,rr,v,['#a07210','#e0b020','#ffe466','#fff6b0'],'dia',3.2,1)},
 lieu:drawWillow,truc:drawBamboo,linh:drawSpirit,bui:drawBush,hoa:drawFlowers,co:drawTuft,nam:drawShroom,da:drawRockM};
var TREEDIM={pine:[150,150,75,134],sak:[150,150,75,134],dao:[150,150,75,134],phong:[150,150,75,134],hanh:[150,150,75,134],lieu:[170,170,85,150],truc:[130,230,65,214],linh:[170,190,85,170],bui:[70,60,35,50],hoa:[60,50,30,40],co:[40,32,20,26],nam:[60,50,30,40],da:[70,50,35,40]};
function dec(k,v,C){var f=TREEK[k];if(!f)return null;C0=C;var d=TREEDIM[k];return SP(C,k+v,d[0],d[1],d[2],d[3],function(q,rr){f(q,rr,v)})}
/* ---------- nhà tiên gia ---------- */
function cottage(q,C,h){var w=h.w,d=h.d,x0=-w/2,x1=w/2,y0=-d/2,y1=d/2,ip=C.ip,box=C.box,FY=C.FY,FX=C.FX,fq=C.fq,HW=C.HW,i;
 var wallH=1.25,z0=.3,wallC=h.wall,dark=h.wd;
 GRs(q,C,function(q){q.fillStyle='rgba(0,0,30,.22)';q.beginPath();q.ellipse(0,0,w*.78,d*.78,0,0,TAU);q.fill()});
 box(q,x0-.18,y0-.18,x1+.18,y1+.18,0,z0,'#d3d9e6','#7c829c','#aeb6c8');
 box(q,x0,y0,x1,y1,z0,z0+wallH,'#e8dfc8',C.mixc(wallC,'#2a2a50',.5),wallC);
 function face(u,isY){var n=Math.max(2,Math.round(u/.9)),k;return function(q){var g=C.lg(q,0,0,0,wallH,[0,'rgba(255,255,255,.12)',1,'rgba(0,0,50,.28)']);q.fillStyle=g;q.fillRect(0,0,u,wallH);
   q.strokeStyle='rgba(120,100,70,.18)';q.lineWidth=.014;for(var yy=.12;yy<wallH;yy+=.14){q.beginPath();q.moveTo(0,yy);q.lineTo(u,yy);q.stroke()}
   for(k=0;k<=n;k++){q.fillStyle=dark;q.fillRect(k*u/n-.045,0,.09,wallH)}q.fillStyle=dark;q.fillRect(0,wallH-.08,u,.08);q.fillRect(0,.34,u,.05);q.fillRect(0,wallH*.5,u,.035);
   var door=(isY?h.f==='y':h.f==='x'),dk=Math.floor(n/2);
   for(k=0;k<n;k++){var a=k*u/n+.15,ww=u/n-.3;if(door&&k===dk){q.fillStyle='#2a1208';q.beginPath();q.moveTo(a,0);q.lineTo(a,.62);q.quadraticCurveTo(a+ww/2,.84,a+ww,.62);q.lineTo(a+ww,0);q.fill();q.fillStyle='#7a3a22';q.beginPath();q.moveTo(a+.03,0);q.lineTo(a+.03,.6);q.quadraticCurveTo(a+ww/2,.78,a+ww-.03,.6);q.lineTo(a+ww-.03,0);q.fill();q.strokeStyle='rgba(30,10,4,.7)';q.lineWidth=.014;q.beginPath();q.moveTo(a+ww/2,0);q.lineTo(a+ww/2,.74);q.stroke();q.fillStyle='#e8c050';q.beginPath();q.arc(a+ww*.36,.36,.022,0,TAU);q.arc(a+ww*.64,.36,.022,0,TAU);q.fill()}
    else if(h.hut&&k===0){continue}
    else{var wy=.5,wh=.52;q.fillStyle='#3a2014';q.fillRect(a-.03,wy-.03,ww+.06,wh+.06);q.fillStyle=C.lg(q,0,wy,0,wy+wh,[0,'rgba(255,224,150,.98)',1,'rgba(255,166,80,.95)']);q.fillRect(a,wy,ww,wh);q.strokeStyle='rgba(110,44,20,.85)';q.lineWidth=.022;q.beginPath();q.moveTo(a+ww/2,wy);q.lineTo(a+ww/2,wy+wh);q.moveTo(a,wy+wh/2);q.lineTo(a+ww,wy+wh/2);q.stroke();q.fillStyle='#6a3a22';q.fillRect(a-.05,wy-.07,ww+.1,.05);q.fillStyle=h.v%2?'#e8708a':'#f0c050';for(var f=0;f<4;f++){q.beginPath();q.arc(a+.05+f*(ww-.1)/3,wy-.1,.04,0,TAU);q.fill()}q.fillStyle='#4a2a18';q.fillRect(a-.04,wy+wh,ww+.08,.07)}}}}
 FY(q,x0,y1,z0,face(w,1));FX(q,x1,y0,z0,face(d,0));
 var tc=h.hut?'#caa86a':'#d8c690';/* nền móng đá */
 C.roof(q,x0,y0,x1,y1,z0+wallH,.62+(h.hut?.12:.18),.42,h.rf[0],h.rf[1]);
 /* ống khói */
 if(!h.hut){var cx=h.f==='y'?x1-.5:x0+.45,cy=y0+.38;box(q,cx-.16,cy-.16,cx+.16,cy+.16,z0+wallH+.3,z0+wallH+1.25,'#d8d2c6','#6a6258','#a49c90');box(q,cx-.2,cy-.2,cx+.2,cy+.2,z0+wallH+1.25,z0+wallH+1.38,'#b8b0a2','#5a5248','#8c8478')}
 /* đèn lồng treo cửa */
 var lp=h.f==='y'?ip(-.0,y1+.02,z0+wallH*.78):ip(x1+.02,0,z0+wallH*.78);if(!h.hut){q.strokeStyle='#5a3a22';q.lineWidth=1;q.beginPath();q.moveTo(lp[0],lp[1]-HW*.16);q.lineTo(lp[0],lp[1]);q.stroke();q.fillStyle='#e03a2a';q.beginPath();q.ellipse(lp[0],lp[1]+HW*.07,HW*.07,HW*.09,0,0,TAU);q.fill();q.fillStyle='#ffd070';q.beginPath();q.ellipse(lp[0]-1,lp[1]+HW*.05,HW*.025,HW*.04,0,0,TAU);q.fill()}}
function GRs(q,C,fn){C.GR(q,0,0,0,fn)}
function cotSpr(C,v){var h=HOUSES[v],U=C.HW/46,hw=(h.w+h.d)*C.HW/2+C.HW*2.2,up=C.ZU*(3.4),dn=(h.w+h.d)*C.HH/2+C.HH*2.2;return C.spr('xcot'+v,hw*2,up+dn,hw,up,function(q){C0=C;cottage(q,C,h)},C.dG())}
/* ---------- vật trang trí cỡ nhỏ ---------- */
function wellB(q,rr,v,C){var U=1;shadow(q,20,7);q.fillStyle='#8a90ac';q.beginPath();q.ellipse(0,-6,15,8,0,0,TAU);q.fill();var g=C.lg(q,-15,0,15,0,[0,'#b0b8d2',.5,'#e0e5f2',1,'#8088a6']);q.fillStyle=g;q.beginPath();q.moveTo(-15,-6);q.lineTo(-15,-14);q.ellipse(0,-14,15,8,0,Math.PI,0,true);q.lineTo(15,-6);q.ellipse(0,-6,15,8,0,0,Math.PI);q.closePath();q.fill();q.fillStyle='#22406a';q.beginPath();q.ellipse(0,-14,11,5.6,0,0,TAU);q.fill();q.fillStyle='rgba(180,230,255,.5)';q.beginPath();q.ellipse(-3,-15,5,1.8,0,0,TAU);q.fill();q.strokeStyle='rgba(50,56,100,.5)';q.lineWidth=.8;for(var i=0;i<4;i++){q.beginPath();q.moveTo(-12+i*8,-8);q.lineTo(-12+i*8,-13);q.stroke()}
 q.fillStyle='#7a4a2c';q.fillRect(-14,-40,3.4,28);q.fillRect(10.6,-40,3.4,28);q.fillStyle='#6a3a22';q.fillRect(-14,-42,28,3.6);q.fillStyle='#e8a050';q.beginPath();q.moveTo(-20,-40);q.lineTo(0,-54);q.lineTo(20,-40);q.quadraticCurveTo(0,-44,-20,-40);q.fill();q.fillStyle='#9a4a22';q.beginPath();q.moveTo(-20,-40);q.quadraticCurveTo(0,-44,20,-40);q.lineTo(16,-38);q.quadraticCurveTo(0,-42,-16,-38);q.fill();q.strokeStyle='#e8d8b0';q.lineWidth=.9;q.beginPath();q.moveTo(0,-41);q.lineTo(0,-24);q.stroke();q.fillStyle='#8a5a30';q.fillRect(-3,-25,6,5)}
function benchB(q,rr,v,C){shadow(q,18,5);q.fillStyle='#8a90ac';q.fillRect(-14,-6,5,6);q.fillRect(9,-6,5,6);q.fillStyle=C.lg(q,0,-12,0,-6,[0,'#e6eaf6',1,'#a6aec8']);q.fillRect(-17,-11,34,6);q.fillStyle='rgba(255,255,255,.4)';q.fillRect(-17,-11,34,1.4);q.strokeStyle='rgba(50,56,100,.4)';q.lineWidth=.7;q.strokeRect(-17,-11,34,6)}
function lionB(q,rr,v,C){shadow(q,18,6);q.fillStyle=C.lg(q,-12,0,12,0,[0,'#c8cee2',.5,'#f2f4fb',1,'#9aa2c0']);q.fillRect(-12,-8,24,8);q.fillStyle='rgba(60,70,120,.35)';q.fillRect(-12,-8,24,1);var fl=v%2?-1:1;q.save();q.scale(fl,1);q.fillStyle=C.lg(q,-10,-34,10,-8,[0,'#f4f6fc',1,'#a6aec8']);q.beginPath();q.moveTo(-9,-8);q.quadraticCurveTo(-11,-22,-5,-30);q.quadraticCurveTo(-3,-38,4,-36);q.quadraticCurveTo(10,-34,9,-26);q.quadraticCurveTo(12,-18,10,-8);q.closePath();q.fill();q.strokeStyle='rgba(50,56,110,.5)';q.lineWidth=.8;q.stroke();q.fillStyle='#e8c050';q.beginPath();q.arc(1,-31,1.2,0,TAU);q.arc(6,-31,1.2,0,TAU);q.fill();q.strokeStyle='rgba(60,70,130,.6)';q.lineWidth=1;for(var i=0;i<4;i++){q.beginPath();q.arc(-3,-30+i*0,3+i*1.6,Math.PI*.9,Math.PI*1.7);q.stroke()}q.fillStyle='#dfe3f2';q.beginPath();q.arc(-4,-26,3.4,0,TAU);q.fill();q.restore()}
function cenB(q,rr,v,C){shadow(q,16,5);q.fillStyle=C.lg(q,-10,0,10,0,[0,'#c8a050',.5,'#fff0a8',1,'#8a6a20']);q.fillRect(-11,-4,22,4);q.beginPath();q.moveTo(-10,-4);q.lineTo(-7,-22);q.lineTo(7,-22);q.lineTo(10,-4);q.closePath();q.fill();q.strokeStyle='#6a4a10';q.lineWidth=.8;q.stroke();q.fillStyle='#8a6218';q.fillRect(-12,-27,24,5);q.fillStyle='#e8c050';q.fillRect(-9,-31,18,4);[[-8,0],[8,0]].forEach(function(l){q.fillStyle='#a07a20';q.fillRect(l[0]-1.4,-5,2.8,5)});q.fillStyle='#4a3a18';q.beginPath();q.ellipse(0,-31,7,2,0,0,TAU);q.fill()}
function stoneLampB(q,rr,v,C){shadow(q,12,4);q.fillStyle=C.lg(q,-8,0,8,0,[0,'#a8aec4',.5,'#dce2f0',1,'#8a90a8']);q.fillRect(-8,-6,16,6);q.fillRect(-3,-22,6,17);q.fillRect(-7,-26,14,4);q.fillStyle='#2a1a30';q.fillRect(-6,-38,12,12);q.fillStyle='rgba(255,210,130,.96)';q.fillRect(-3.8,-35.6,7.6,8);q.fillStyle='#8a90a8';q.beginPath();q.moveTo(-11,-38);q.lineTo(0,-48);q.lineTo(11,-38);q.closePath();q.fill();q.fillStyle='#dce2f0';q.beginPath();q.arc(0,-49.6,2.2,0,TAU);q.fill()}
function crateB(q,rr,v,C){shadow(q,16,5);var i;[[-8,0,13],[7,1,12]].forEach(function(b,ix){var x=b[0],y=b[1],s=b[2];q.fillStyle=ix?'#8a5a30':'#9a6a3a';q.fillRect(x-s/2,y-s,s,s);q.fillStyle='#b8844c';q.fillRect(x-s/2,y-s,s,2.4);q.strokeStyle='#4a2c18';q.lineWidth=.8;q.strokeRect(x-s/2,y-s,s,s);q.beginPath();q.moveTo(x-s/2,y-s);q.lineTo(x+s/2,y);q.stroke()});
 q.fillStyle='#d8a040';q.beginPath();q.ellipse(0,-17,9,3.4,0,0,TAU);q.fill();q.fillStyle='#8a5a30';q.beginPath();q.moveTo(-9,-17);q.lineTo(-8,-9);q.lineTo(8,-9);q.lineTo(9,-17);q.closePath();q.fill();var cs=['#ff6a5a','#ffd24a','#8ae06a','#ff9a4a'];for(i=0;i<5;i++){q.fillStyle=cs[i%4];q.beginPath();q.arc(-6+i*3,-18.4,2.4,0,TAU);q.fill()}}
function fenceB(q,rr,v,C){/* v=0: dọc trục x (dài 1.2 ô); v=1: dọc trục y */var HW=C.HW,HH=C.HH,ZU=C.ZU,U=HW/46,a=C.ip(0,0,0),b=v?C.ip(0,1.2,0):C.ip(1.2,0,0);var dx=(b[0]-a[0])/U,dy=(b[1]-a[1])/U,i;q.save();
 for(i=0;i<=1;i++){var px=dx*i,py=dy*i;q.fillStyle='#7a4a2a';q.fillRect(px-1.8,py-20,3.6,20);q.fillStyle='#a8703e';q.fillRect(px-1.8,py-20,1.4,20);q.fillStyle='#e8d8a8';q.beginPath();q.moveTo(px-2.4,py-20);q.lineTo(px,py-24);q.lineTo(px+2.4,py-20);q.fill()}
 [-7,-14].forEach(function(h){q.strokeStyle='#6a3a1e';q.lineWidth=2.6;q.lineCap='butt';q.beginPath();q.moveTo(0,h);q.lineTo(dx,dy+h);q.stroke();q.strokeStyle='#b8844c';q.lineWidth=1;q.beginPath();q.moveTo(0,h-.8);q.lineTo(dx,dy+h-.8);q.stroke()});q.restore()}
function hayB(q,rr,v,C){shadow(q,16,5);q.fillStyle='#d8b04a';q.beginPath();q.ellipse(0,-6,13,7,0,0,TAU);q.fill();q.fillStyle='#e8c866';q.fillRect(-13,-14,26,8);q.beginPath();q.ellipse(0,-14,13,7,0,0,TAU);q.fill();q.fillStyle='#f4dc88';q.beginPath();q.ellipse(-2,-15,9,4,0,0,TAU);q.fill();q.strokeStyle='#a87a24';q.lineWidth=.8;for(var i=0;i<8;i++){q.beginPath();q.moveTo(-12+i*3.4,-13);q.lineTo(-12+i*3.4+(rr()-.5)*2,-7);q.stroke()}q.strokeStyle='#8a5a2c';q.lineWidth=1.4;q.beginPath();q.moveTo(-13,-10);q.lineTo(13,-10);q.stroke()}
function craneB(q,rr,v,C){shadow(q,12,4);var up=v%2===0;q.strokeStyle='#d8a07a';q.lineWidth=1.3;q.lineCap='round';[[-2,0],[3,0]].forEach(function(l){q.beginPath();q.moveTo(l[0],-14);q.lineTo(l[0]+(l[0]<0?-1:1),-1);q.stroke()});
 q.fillStyle=C.lg(q,-12,-26,12,-10,[0,'#ffffff',1,'#c8d2ee']);q.beginPath();q.moveTo(-12,-18);q.quadraticCurveTo(-10,-28,0,-28);q.quadraticCurveTo(10,-26,9,-17);q.quadraticCurveTo(0,-11,-12,-18);q.fill();q.fillStyle='#2a2a40';q.beginPath();q.moveTo(-3,-14);q.quadraticCurveTo(5,-19,12,-16);q.quadraticCurveTo(6,-12,-3,-14);q.fill();
 q.strokeStyle='#f6f8ff';q.lineWidth=2.4;q.beginPath();q.moveTo(7,-26);q.quadraticCurveTo(up?13:11,up?-38:-33,up?10:15,up?-46:-22);q.stroke();var hx=up?10:15,hy=up?-46:-22;q.fillStyle='#f6f8ff';q.beginPath();q.arc(hx,hy,2.4,0,TAU);q.fill();q.fillStyle='#d8283a';q.beginPath();q.arc(hx,hy-1.6,1.4,0,Math.PI,true);q.fill();q.strokeStyle='#e8b050';q.lineWidth=1;q.beginPath();q.moveTo(hx+2,hy);q.lineTo(hx+7,hy+(up?1.4:3));q.stroke()}
function banB(q,rr,v,C){shadow(q,8,3);q.fillStyle='#7a4a2c';q.fillRect(-1.6,-64,3.2,64);q.fillStyle='#e8c050';q.beginPath();q.arc(0,-66,3,0,TAU);q.fill();var cs=[['#d83a3a','#8a1c22'],['#3a8ad8','#1c3a8a'],['#f0c040','#a8741c']][v%3];var g=C.lg(q,0,-60,26,-30,[0,cs[0],1,cs[1]]);q.fillStyle=g;q.beginPath();q.moveTo(1.6,-62);q.quadraticCurveTo(14,-58,26,-60);q.lineTo(26,-38);q.quadraticCurveTo(14,-36,1.6,-40);q.closePath();q.fill();q.strokeStyle='#e8c050';q.lineWidth=1;q.stroke();q.fillStyle='#ffe28a';q.beginPath();q.arc(14,-49,4,0,TAU);q.fill();q.strokeStyle=cs[1];q.lineWidth=.9;q.beginPath();q.arc(14,-49,2.2,0,TAU);q.stroke()}
function stoneB(q,rr,v,C){shadow(q,12,4);q.fillStyle=C.lg(q,-9,0,9,0,[0,'#a8aec4',1,'#7a82a0']);q.fillRect(-10,-4,20,4);q.fillStyle=C.lg(q,-8,-40,8,0,[0,'#eef0fa',1,'#a6aec8']);q.beginPath();q.moveTo(-8,-4);q.lineTo(-8,-34);q.quadraticCurveTo(0,-42,8,-34);q.lineTo(8,-4);q.closePath();q.fill();q.strokeStyle='rgba(50,56,110,.5)';q.lineWidth=.8;q.stroke();q.strokeStyle='rgba(70,90,200,.85)';q.lineWidth=1;for(var i=0;i<4;i++){q.beginPath();q.moveTo(-4,-28+i*6);q.lineTo(4,-28+i*6);if(i%2)q.moveTo(0,-28+i*6),q.lineTo(0,-23+i*6);q.stroke()}}
function balB(q,rr,v,C){shadow(q,7,3);q.fillStyle=C.lg(q,-4,0,4,0,[0,'#f4f6fc',1,'#a6aec8']);q.fillRect(-4,-14,8,14);q.fillRect(-5.4,-16,10.8,3);q.fillStyle='#e0bc62';q.beginPath();q.arc(0,-19,2.8,0,TAU);q.fill()}
var PROPK={well:[wellB,60,70,30,56],bnc:[benchB,50,30,25,22],lion:[lionB,50,60,25,50],cen:[cenB,50,60,25,50],slamp:[stoneLampB,40,70,20,60],crt:[crateB,50,40,25,32],hay:[hayB,48,40,24,32],crane:[craneB,50,70,25,50],ban:[banB,50,90,20,76],bia:[stoneB,40,60,20,50],bal:[balB,30,36,15,22]};
function dec2(k,v,C){var P=PROPK[k];if(P){C0=C;return SP(C,k+v,P[1],P[2],P[3],P[4],function(q,rr){P[0](q,rr,v,C)})}if(k==='fnc'){C0=C;return SP(C,'fnc'+v,120,70,18,50,function(q,rr){fenceB(q,rr,v,C)})}if(k==='cot')return cotSpr(C,v);return null}
/* ---------- bố trí vật thể: [loại, x, y, biến thể] (toạ độ thế giới) ---------- */
var PL=[
 /* quảng trường đến */
 ['sak',10.6,34.2,0],['dao',17.4,34.2,1],['linh',8.3,34.8,0],['nam',9.0,41.0,0],['lamp',11.5,35.1],['lamp',16.5,35.1],['lamp',11.5,40.4],['lamp',16.5,40.4],['crt',17.3,36.3,0],['bui',14.0,41.9,0],
 /* vườn Tây (Chuyển Thế Đài · Thiên Binh Các) */
 ['cot',7.0,22.2,0],['lieu',0.9,24.6,0],['dao',1.3,22.2,0],['truc',8.0,26.4,0],['truc',8.5,25.6,1],['lamp',8.4,24.7],['lamp',2.6,24.9],['da',0.7,23.6,0],
 /* vườn Đông (Tiên Thú Viên · Vạn Pháp Tháp) */
 ['cot',21.7,19.9,1],['cot',27.3,22.0,2],['dao',22.7,18.3,0],['truc',27.0,19.2,0],['truc',26.9,20.2,1],['linh',19.8,23.7,0],['bui',27.1,24.6,1],['lamp',20.9,21.3],['crane',20.4,21.2,0],['hay',21.2,24.7,0],['crane',21.4,24.5,1],
 ['fnc',20.6,24.1,0],['fnc',20.6,24.1,1],['fnc',20.6,25.2,0],['hoa',22.9,25.7,0],['bui',21.0,18.7,1],
 /* sân thượng Thiên Cung */
 ['cot',6.8,7.6,3],['cot',21.2,7.6,4],['well',9.0,7.2,0],['well',19.0,7.2,0],['lion',12.05,14.8,0],['lion',15.95,14.8,1],['lion',12.05,9.9,0],['lion',15.95,9.9,1],['ban',10.4,8.6,0],['ban',17.6,8.6,1],
 ['sak',8.6,5.4,0],['dao',19.4,5.4,1],['pine',7.4,3.4,0],['pine',20.6,3.4,1],['phong',5.4,9.6,0],['phong',22.6,9.6,1],['bia',10.6,3.4,0],['bia',17.4,3.4,0]];
var AROUND={nw:[['sak',200,.72,0],['cry',40,.7,0],['truc',120,.68,0],['hoa',280,.6,1]],ne:[['hanh',30,.72,0],['lieu',150,.7,0],['cry',250,.66,1],['bui',330,.6,1]],nn:[['dao',20,.72,1],['pine',160,.72,1],['cry',250,.66,2],['hoa',310,.6,0]],
 fe:[['truc',200,.72,0],['truc',215,.8,1],['lieu',320,.7,1],['nam',100,.62,1],['hoa',60,.6,2]],fw:[['da',40,.65,1],['nam',150,.7,0],['hoa',90,.6,3],['cry',200,.7,3],['linh',270,.55,1]]};
HOUSES.push({id:'h_fe',x:28.0,y:37.0,w:1.4,d:1.3,f:'y',wall:'#ead8b8',rf:['#c88a5a','#6a3a22'],wd:'#4a2c1a',v:5,hut:1});HOUSES[5].rect=[28.0-.7,37.0-.65,28.0+.7,37.0+.65];
var LIGHTS=[],DROP=[];
function dsort(k,x,y){return x+y+(k==='cot'?(HOUSES[0].w+HOUSES[0].d)*.2:k==='fnc'?.6:0)}
function build(DR,DECB,C){C0=C;var i,I,placed=[];LIGHTS=[];DROP=[];
 /* bỏ đèn cũ quanh quảng trường (đã bố trí lại) */
 for(i=DR.length-1;i>=0;i--){var o=DR[i];if(o.k==='lamp'){var dx=(o.x-14)/8,dy=(o.y-37)/6.4;if(dx*dx+dy*dy<1)DR.splice(i,1)}}
 function add(k,x,y,v){var ok=false,j;for(j=0;j<C.ISL.length;j++)if(C.inPoly(C.ISL[j].wp,x,y)||(k!=='lamp'&&C.ISL[j].k==='deco'&&C.inPoly(C.ISL[j].poly,x,y)))ok=true;if(!ok){DROP.push([k,x,y]);return}
  var d=k==='cot'?x+y+(HOUSES[v].w+HOUSES[v].d)*.2:k==='fnc'?x+y+.6:x+y;DR.push({k:k,x:x,y:y,d:d,v:v||0});if(k==='lamp'||k==='slamp')LIGHTS.push([x,y,1])}
 PL.forEach(function(p){add(p[0],p[1],p[2],p[3])});
 C.ISL.forEach(function(I){var A=AROUND[I.id];if(!A)return;A.forEach(function(a){var an=a[1]*Math.PI/180;add(a[0],I.cx+Math.cos(an)*I.rx*a[2],I.cy+Math.sin(an)*I.ry*a[2],a[3])});HOUSES.forEach(function(h){if(h.id==='h_fe'&&I.id==='fe')add('cot',h.x,h.y,h.v)})})}
function decAll(k,v,C){return dec(k,v,C)||dec2(k,v,C)}
/* ---------- hiệu ứng động ---------- */
function under(t,C){if(C.ql>=2)return;var g=C.g,HW=C.HW,HH=C.HH,i;
 PONDS.forEach(function(P,ix){var a=C.S2(P.x,P.y);if(a[0]<-160||a[0]>C.W+160||a[1]<-120||a[1]>C.H+120)return;g.save();g.translate(a[0],a[1]);g.transform(HW,HH,-HW,HH,0,0);g.lineWidth=.03;for(i=0;i<2;i++){var ph=((t*.008+ix*.37+i*.5)%1),r=ph*P.rx*.8;g.strokeStyle='rgba(230,250,255,'+(.5*(1-ph))+')';g.beginPath();g.ellipse(Math.sin(ix*3+i)*P.rx*.3,Math.cos(ix*2+i)*P.ry*.3,r,r*(P.ry/P.rx),0,0,TAU);g.stroke()}g.restore()})}
var FF=[];for(var fi=0;fi<18;fi++)FF.push([Math.sin(fi*12.9898)*.5+.5,Math.sin(fi*78.233)*.5+.5,fi]);
var FFC=[[6.8,25.6,3.2],[24.8,22.0,3.4],[14.0,12.5,4.5],[14.0,38.0,3.6]];
function fx(t,C){if(C.ql>=2)return;var g=C.g,HW=C.HW,ZU=C.ZU,s=C.s,i,k;g.save();g.globalCompositeOperation='lighter';
 HOUSES.forEach(function(h,ix){var a=C.S2(h.x,h.y);if(a[0]<-200||a[0]>C.W+200||a[1]<-200||a[1]>C.H+240)return;C.gl(a[0],a[1]-ZU*.9,(h.w+h.d)*HW*.62,'255,184,104',.14+.04*Math.sin(t*.05+ix));
  if(!h.hut&&C.ql<1){var cx=h.f==='y'?h.w/2-.5:-h.w/2+.45,cy=-h.d/2+.38,b=C.S2(h.x+cx,h.y+cy);g.globalCompositeOperation='source-over';for(k=0;k<5;k++){var ph=((t*.006+ix*.23+k/5)%1);g.globalAlpha=.34*(1-ph);g.fillStyle='#e8ecf8';g.beginPath();g.arc(b[0]+ph*18*s+Math.sin(ph*6+ix)*3*s,b[1]-2.95*ZU-ph*52*s,(2.4+ph*7)*s,0,TAU);g.fill()}g.globalAlpha=1;g.globalCompositeOperation='lighter'}});
 LIGHTS.forEach(function(l){var a=C.S2(l[0],l[1]);if(a[0]<-80||a[0]>C.W+80||a[1]<-80||a[1]>C.H+120)return;C.gl(a[0],a[1]-40*(HW/46),40*(HW/46),'255,190,100',.3)});
 if(C.ql<1){for(i=0;i<FF.length;i++){var c=FFC[i%FFC.length],f=FF[i],wx=c[0]+Math.sin(t*.011+f[2]*1.7)*c[2]*.7+(f[0]-.5)*c[2],wy=c[1]+Math.cos(t*.009+f[2]*2.3)*c[2]*.5+(f[1]-.5)*c[2]*.6,a=C.S2(wx,wy);if(a[0]<-20||a[0]>C.W+20||a[1]<-20||a[1]>C.H+20)continue;var z=(.5+.4*Math.sin(t*.02+f[2]))*ZU*1.3;C.gl(a[0],a[1]-z,5*s,'220,255,150',.45+.45*Math.sin(t*.07+f[2]*3));C.gl(a[0],a[1]-z,1.6*s,'255,255,220',.95)}}
 g.restore()}
window.TGD={ground:ground,blk:blk,avoid:avoid,dec:decAll,build:build,under:under,fx:fx,dropped:function(){return DROP},houses:HOUSES,ponds:PONDS,lights:LIGHTS,dbg:function(k,v){var C=TG&&TG._C;return null}};
})();
