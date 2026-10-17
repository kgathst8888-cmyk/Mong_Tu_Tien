/* ===== ☁️ THÀNH THỊ TIÊN GIỚI — bản đồ 2.5D (world/61-tien-gioi-thanh.js) =====
 * Cổng vào: ô cổng "Hư Không Truyền Tống" (đang tạm khoá) của Thành Thị Linh Giới được mở thành "Tiên Giới Thiên Môn" (patch LCT.gates). Nếu bản không có ô này → dùng cổng "Thiên Môn" nổi trên trời thành thị (chạm → đi tới dưới cổng → vào).
 * Góc nhìn 2.5D (isometric): thế giới là các đảo lơ lửng trên biển mây nối bằng cầu đá lớn. Nhân vật đi tự do theo 2 chiều (chạm để đi, phím mũi tên/WASD),
 *   tự tìm đường qua cầu; vẽ nhân vật/thú cưng bằng hero()/drawEP() sẵn có (tạm đổi P.x/GY/cam khi vẽ), sắp xếp chiều sâu với công trình.
 * Mục TẠM KHOÁ (SPOTS, open:0): Thiên Cung Điện, Tiên Giới Đấu Trường, Linh Mạch Động Phủ, Đan Dược Các, Thiên Binh Các, Tiên Thú Viên, Vạn Pháp Tháp, Tiên Thị.
 *   Chạm công trình → nhân vật đi tới cửa → hiện thẻ "🔒 Tạm khoá — sắp mở". Mở sau này: đặt SPOTS[i].open=1 và gán SPOTS[i].go=function(){...}.
 *   "Tinh Hà Truyền Tống" (open:1) = cổng quay về Thành Thị Linh Giới (nút 🏘 Làng ở thanh dưới cũng quay về Linh Giới).
 * Cách làm: bọc vdraw / vstep / ng / step, nút #vl; bắt pointerdown ở window (pha capture, chạy trước mọi handler) để chặn chạm của Làng/Linh Giới khi ở Tiên Giới.
 *   Tên bản đồ trên HUD (engine) đổi bằng cách bọc g.fillText. Phần tĩnh (đảo, cầu, công trình) vẽ 1 lần vào sprite theo (s,DPR,font); phần động vẽ trực tiếp.
 * Vuốt: chạm giữ + kéo = đi theo hướng ngón tay (cần vuốt nổi, SWT/SWR chỉnh ngưỡng/bán kính); chạm nhanh không kéo = chạm-để-đi.
 * Chỉnh: CF (needDao, tốc độ), SPOTS (thêm/bớt mục), TG.on / TG.enter() / TG.leave() / TG.spots. */
(function(){
'use strict';
if(typeof LCT==='undefined'||typeof vdraw!=='function'||typeof vstep!=='function'||typeof hero!=='function'||typeof drawEP!=='function'||typeof nameTag!=='function'||typeof g==='undefined'||typeof PS==='undefined')return;
var TAU=Math.PI*2,FONT='Ma Shan Zheng,KTH Serif,Songti SC,STKaiti,KaiTi,serif',CF={needDao:false,speed:.042,heroK:.6,gateName:'Thiên Môn Tiên Giới'};
function rng(a){a>>>=0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function lg(q,x0,y0,x1,y1,st){var o=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function rg(q,x,y,r0,r1,st){var o=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function fontOK(){try{return document.fonts&&document.fonts.check('20px "Ma Shan Zheng"')?1:0}catch(e){return 0}}
/* ---------- trạng thái ---------- */
var AM=null,on=false,hx=14,hy=37.4,ccx=14,ccy=34,path=[],pend=-1,mark=null,keys={},card=null,moving=0,LASTT=0;
var HW=46,HH=23,ZU=36,OX=0,OY=0;
/* ---------- thế giới: đảo, cầu, công trình ---------- */
function blob(cx,cy,rx,ry,seed,n,amp){var r=rng(seed),a=[];for(var i=0;i<n;i++){var t=i/n*TAU,k=1+(r()-.5)*amp;a.push([cx+Math.cos(t)*rx*k,cy+Math.sin(t)*ry*k])}return a}
function inPoly(p,x,y){var c=false;for(var i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>y)!=(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c}return c}
var ISL=[{id:'arr',cx:14,cy:37,rx:7.4,ry:5.8,seed:3,k:'plaza'},{id:'wst',cx:4.6,cy:24,rx:5,ry:4.6,seed:5,k:'garden'},{id:'est',cx:23.8,cy:22,rx:5,ry:4.8,seed:7,k:'garden'},{id:'pal',cx:14,cy:8.5,rx:9.8,ry:8.8,seed:9,k:'terrace'},
 {id:'nw',cx:-5,cy:10,rx:3.4,ry:3.2,seed:11,k:'deco',pg:1},{id:'ne',cx:31.5,cy:8,rx:3.6,ry:3.4,seed:13,k:'deco',pg:1},{id:'fe',cx:28,cy:37,rx:3.2,ry:3,seed:15,k:'deco'},{id:'fw',cx:-1,cy:39,rx:3,ry:2.8,seed:17,k:'deco'},{id:'nn',cx:14,cy:-6,rx:3.2,ry:3,seed:19,k:'deco',pg:1},
 {id:'war',cx:62,cy:22,rx:10.5,ry:9.5,seed:23,k:'war'}/* Fix163: đảo Tiên Linh Chiến Cảnh (xa thành thị, chỉ tới bằng cổng) */];
ISL.forEach(function(i){i.poly=blob(i.cx,i.cy,i.rx,i.ry,i.seed,30,.1);i.wp=blob(i.cx,i.cy,i.rx*.93,i.ry*.93,i.seed,30,.1)});
var BRG=[{x0:12.4,x1:15.6,y0:17.2,y1:32.2,main:1},{x0:8.8,x1:12.4,y0:22,y1:24.2},{x0:15.6,x1:19.8,y0:22,y1:24.2},{x0:12.4,x1:15.6,y0:22,y1:24.2,patch:1}];
/* Fix190: ngã tư cầu — hai nhánh Tây/Đông cùng một dải y (22–24.2) thẳng hàng, nối đúng mép cầu chính; ô giao nhau là 1 mảnh mặt cầu liền (patch) */
var CR=[22,24.2];
function bridgeGrad(q){var A=ip(12.4,17.2,0),B=ip(15.6,32.2,0);return lg(q,A[0],A[1],B[0],B[1],[0,'#d8d0ba',1,'#b0a890'])}
function bridgeLines(q,b){q.strokeStyle='rgba(60,50,40,.35)';q.lineWidth=.02;for(var xx=Math.ceil(b.x0-1e-6);xx<=b.x1+.01;xx+=1){q.beginPath();q.moveTo(xx-b.x0,0);q.lineTo(xx-b.x0,b.y1-b.y0);q.stroke()}for(var yy=17.2+1.2*Math.ceil((b.y0-17.2-1e-6)/1.2);yy<=b.y1+.01;yy+=1.2){q.beginPath();q.moveTo(0,yy-b.y0);q.lineTo(b.x1-b.x0,yy-b.y0);q.stroke()}}
function patchSpr(b,bi){var p=[ip(b.x0,b.y0,0),ip(b.x1,b.y0,0),ip(b.x1,b.y1,0),ip(b.x0,b.y1,0)],mn=1e9,mx2=-1e9,mny=1e9,mxy=-1e9,M=12;p.forEach(function(a){mn=Math.min(mn,a[0]);mx2=Math.max(mx2,a[0]);mny=Math.min(mny,a[1]);mxy=Math.max(mxy,a[1])});var O=p[0];
  return spr('b'+bi,mx2-mn+2*M,mxy-mny+2*M,O[0]-mn+M,O[1]-mny+M,function(q){q.translate(-O[0],-O[1]);fq(q,p,bridgeGrad(q),'rgba(255,255,255,.3)');q.save();q.beginPath();p.forEach(function(a,i){i?q.lineTo(a[0],a[1]):q.moveTo(a[0],a[1])});q.closePath();q.clip();
    q.save();q.transform(HW,HH,-HW,HH,p[0][0],p[0][1]);bridgeLines(q,b);var cx=(b.x1-b.x0)/2,cy=(b.y1-b.y0)/2,i;
    q.fillStyle='rgba(40,30,70,.22)';q.beginPath();q.arc(cx+.03,cy+.05,.86,0,TAU);q.fill();q.fillStyle='#e8c25a';q.beginPath();q.arc(cx,cy,.8,0,TAU);q.fill();q.fillStyle='#2a2a64';q.beginPath();q.arc(cx,cy,.68,0,TAU);q.fill();q.strokeStyle='#e8c25a';q.lineWidth=.03;q.beginPath();q.arc(cx,cy,.55,0,TAU);q.stroke();
    for(i=0;i<8;i++){var a=i/8*TAU;q.save();q.translate(cx,cy);q.rotate(a);q.fillStyle=i%2?'#ffe9a8':'#f8c8da';q.beginPath();q.ellipse(.3,0,.24,.085,0,0,TAU);q.fill();q.restore()}q.fillStyle='#ffe27a';q.beginPath();q.arc(cx,cy,.1,0,TAU);q.fill();
    q.restore();q.restore()},dG())}
var SPOTS=[
 {id:'palace',n:'Thiên Cung Điện',e:'🏯',c:'#ffe27a',x:14,y:4.4,w:6.6,d:4.4,k:'palace',z:9,door:[14,9.4],sub:'Trung tâm Tiên Giới',desc:'Điện thờ tối cao của Tiên Giới, nơi các Tiên Quân nghị sự. Nội dung đang được xây dựng.'},
 {id:'arena',n:'Tiên Giới Đấu Trường',e:'⚔️',c:'#ff9a8a',x:7.4,y:10.6,w:2.6,d:2.6,k:'pavilion',z:4,door:[7.4,13.2],sub:'Quyết đấu Tiên Nhân',desc:'Đấu trường trên mây — nơi Tiên Nhân luận võ. Sắp mở.'},
 {id:'cave',n:'Linh Mạch Động Phủ',e:'💎',c:'#7ff0ff',x:20.6,y:10.6,w:2.6,d:2.6,k:'pavilion',z:4,door:[20.6,13.2],sub:'Tu luyện linh mạch',desc:'Động phủ hấp thụ linh khí từ mạch trời. Sắp mở.'},
 {id:'rebirth',n:'Chuyển Thế Đài',e:'🌌',c:'#c8b8ff',x:3.4,y:21.6,w:2.8,d:2.8,k:'hall2',z:6,door:[3.4,24.4],sub:'Chuyển thế · Đạo Thể → Tiên Nhân',desc:'Đài chuyển thế: Đạo Thể Lv100 chuyển thành Tiên Nhân.'},
 {id:'forge',n:'Thiên Binh Các',e:'🗡️',c:'#ffd0a0',x:4.8,y:26.3,w:2.4,d:2.2,k:'hall',z:5,door:[4.8,28.2],sub:'Rèn tiên khí',desc:'Nơi rèn tiên khí thượng phẩm. Sắp mở.'},
 {id:'beast',n:'Tiên Thú Viên',e:'🐉',c:'#ffb0ff',x:24.8,y:19.4,w:3,d:2.6,k:'hall2',z:6,door:[24.8,22.4],sub:'Tiên thú · linh thú',desc:'Vườn nuôi tiên thú. Sắp mở.'},
 {id:'pagoda',n:'Vạn Pháp Tháp',e:'🗼',c:'#ffe27a',x:25,y:23.2,w:2.2,d:2.2,k:'pagoda',z:10,door:[25,25.7],sub:'Thí luyện vạn pháp',desc:'Tháp thí luyện của Tiên Giới, 9 tầng pháp. Sắp mở.'},
 {id:'market',n:'Tiên Thị',e:'🏮',c:'#ffc87a',x:19.6,y:36.2,w:3,d:2.2,k:'market',z:4,door:[19.6,38.6],sub:'Chợ Tiên Giới',desc:'Phiên chợ trên mây. Sắp mở.'},
 {id:'portal',n:'Tinh Hà Truyền Tống',e:'🌌',c:'#c8a0ff',x:8.4,y:36.6,w:2.6,d:1.4,k:'portal',z:5,door:[8.4,38.6],open:1,sub:'Về Thành Thị Linh Giới',desc:'Cổng sao trở về Thành Thị Linh Giới.'},
 {id:'warp',n:'Tiên Linh Chiến Cảnh',e:'⚔️',c:'#ff9a7a',x:14,y:39.2,w:2.6,d:1.4,k:'wargate',z:5,door:[14,41.3],open:0,sub:'Bản đồ quái theo cấp · chỉ Tiên Nhân',desc:'Cổng dẫn tới chiến trường 2.5D của Tiên Nhân: quái theo cấp nhân vật, mạnh gấp 50 lần quái Đạo Thể, EXP gấp 5 lần.',sub2:'chạm để vào',lock2:'🔒 Chỉ Tiên Nhân',lockMsg:'🔒 <b>Chỉ Tiên Nhân</b> (đã chuyển thế) mới vào được',rgb:'255,120,90',fx:['rgba(255,210,180,.7)','rgba(255,70,50,0)'],pal:{pil:['#6a4a52','#2e1a24','#4a2e38'],core:['#ff6a4a','#7a1a2a','#1a0410']}},
 {id:'warpback',n:'Tinh Hà Hồi Thành',e:'🌌',c:'#9fe8ff',x:62,y:14.6,w:2.6,d:1.4,k:'wargate',z:5,door:[62,16.8],open:1,sub:'Về Thành Thị Tiên Giới',desc:'Cổng sao đưa về Thành Thị Tiên Giới.',sub2:'chạm để về thành thị',rgb:'120,200,255',fx:['rgba(200,250,255,.7)','rgba(60,170,255,0)'],pal:{pil:['#bcd0e0','#5a7898','#8aa8c4'],core:['#6af0ff','#1a5a8a','#04122a']}}];
SPOTS.forEach(function(p){p.rect=[p.x-p.w/2,p.y-p.d/2,p.x+p.w/2,p.y+p.d/2]});
function blocked(x,y){for(var i=0;i<SPOTS.length;i++){var r=SPOTS[i].rect;if(x>r[0]-.25&&x<r[2]+.25&&y>r[1]-.25&&y<r[3]+.25)return true}if(window.TGD&&TGD.blk&&TGD.blk(x,y))return true;return false}
function ground(x,y){var i;for(i=0;i<BRG.length;i++){var b=BRG[i],ex=b.main?0:.9,ey=b.main?.9:0;/* Fix131: cầu kéo dài chồng vào đảo/cầu chính (trước đây hở 0.3-0.6 ô nên không đi tiếp được) */if(x>=b.x0+.25-ex&&x<=b.x1-.25+ex&&y>=b.y0-ey&&y<=b.y1)return true}for(i=0;i<ISL.length;i++)if(!ISL[i].k||ISL[i].k!=='deco')if(inPoly(ISL[i].wp,x,y))return true;return false}
function walk(x,y){return ground(x,y)&&!blocked(x,y)}
/* Fix152: Tiên Nhân bay ra ngoài thành thị — module world/81 đăng ký TG.flyHook(canFly, lift). wk() = đi bộ được HOẶC bay được (không xuyên công trình). */
var FLYF=null,LFTF=null;
function wk(x,y){if(walk(x,y))return true;try{return !!(FLYF&&!blocked(x,y)&&FLYF(x,y))}catch(e){return false}}
function LFT(){try{return LFTF?(LFTF()||0):0}catch(e){return 0}}
function seg(ax,ay,bx,by){var n=Math.ceil(Math.hypot(bx-ax,by-ay)/.3);for(var i=1;i<=n;i++){var t=i/n;if(!walk(ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true}
var NODES=[[14,36],[14,30],[14,24],[14,22],[14,18.8],[14,13.6],[5.4,24],[23.4,22],[9.4,12.6],[18.6,12.6],[9,36.4],[19.4,34.2],[14,10.6],[5,29.6],[23,28.2],[9,21],[19.8,24],[3.8,23],[11.6,38.2],[11.2,40.6],[16.8,40.6],[14,41.3],[59.2,16.2],[64.8,16.2],[62,17.4],[56,22],[68,22],[62,27]].filter(function(n){return walk(n[0],n[1])});
function nearest(x,y){if(walk(x,y))return[x,y];var best=null,bd=1e9;for(var r=.4;r<8&&!best;r+=.4)for(var a=0;a<24;a++){var px=x+Math.cos(a/24*TAU)*r,py=y+Math.sin(a/24*TAU)*r;if(walk(px,py)){var d=r;if(d<bd){bd=d;best=[px,py]}}}return best}
function route(ax,ay,bx,by){if(seg(ax,ay,bx,by))return[[bx,by]];var P=[[ax,ay]].concat(NODES).concat([[bx,by]]),n=P.length,D=[],pr=[],dn=[],i,j;for(i=0;i<n;i++){D[i]=1e9;pr[i]=-1;dn[i]=0}D[0]=0;
  for(var it=0;it<n;it++){var u=-1,m=1e9;for(i=0;i<n;i++)if(!dn[i]&&D[i]<m){m=D[i];u=i}if(u<0)break;dn[u]=1;if(u==n-1)break;for(j=0;j<n;j++)if(!dn[j]){var d=Math.hypot(P[u][0]-P[j][0],P[u][1]-P[j][1]);if(d<16&&D[u]+d<D[j]&&seg(P[u][0],P[u][1],P[j][0],P[j][1])){D[j]=D[u]+d;pr[j]=u}}}
  if(pr[n-1]<0)return null;var out=[],k=n-1;while(k>0){out.unshift([P[k][0],P[k][1]]);k=pr[k]}return out}
/* ---------- chiếu isometric + sprite ---------- */
function ip(x,y,z){return[(x-y)*HW,(x+y)*HH-(z||0)*ZU]}
function S2(x,y){return[(x-y)*HW+OX,(x+y)*HH+OY]}
function W2(sx,sy){var a=(sx-OX)/HW,b=(sy-OY)/HH;return[(a+b)/2,(b-a)/2]}
var SC={},SK='';
function mkc(w,h,d){d=d||DPR;var c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*d));c.height=Math.max(1,Math.ceil(h*d));var q=c.getContext('2d');q.setTransform(d,0,0,d,0,0);return{c:c,q:q}}
function dG(){return Math.min(DPR,1.15)}
var FQ=null;function force(c){try{if(!FQ)FQ=mkc(1,1,1).q;FQ.drawImage(c,0,0,1,1)}catch(e){}}
function spr(name,w,h,ax,ay,fn,d){var v=SC[name];if(v)return v;var o=mkc(w,h,d);o.q.translate(ax,ay);fn(o.q);force(o.c);return SC[name]={c:o.c,ax:ax,ay:ay,w:w,h:h}}
function blit(v,x,y){g.drawImage(v.c,x-v.ax,y-v.ay,v.w,v.h)}
function glw(x,y,r,rgb,a){var q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
var GSP={};function gs(rgb){return GSP[rgb]||(GSP[rgb]=(function(){var o=mkc(64,64);var q=o.q,r=q.createRadialGradient(32,32,1,32,32,32);r.addColorStop(0,'rgba('+rgb+',1)');r.addColorStop(.35,'rgba('+rgb+',.4)');r.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=r;q.fillRect(0,0,64,64);return o.c})())}
function gl(x,y,r,rgb,a){g.globalAlpha=a;g.drawImage(gs(rgb),x-r,y-r,r*2,r*2);g.globalAlpha=1}
function fq(q,p,fill,stroke){q.beginPath();q.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)q.lineTo(p[i][0],p[i][1]);q.closePath();q.fillStyle=fill;q.fill();if(stroke){q.strokeStyle=stroke;q.lineWidth=1;q.stroke()}}
function box(q,x0,y0,x1,y1,z0,z1,cT,cR,cL){fq(q,[ip(x0,y1,z0),ip(x1,y1,z0),ip(x1,y1,z1),ip(x0,y1,z1)],cL,'rgba(0,0,20,.3)');fq(q,[ip(x1,y0,z0),ip(x1,y1,z0),ip(x1,y1,z1),ip(x1,y0,z1)],cR,'rgba(0,0,20,.3)');fq(q,[ip(x0,y0,z1),ip(x1,y0,z1),ip(x1,y1,z1),ip(x0,y1,z1)],cT,'rgba(255,255,255,.2)')}
/* vẽ phẳng 2D lên mặt tường: FY = mặt y=y1 (hướng trái-xuống), FX = mặt x=x1 (hướng phải-xuống); u dọc theo cạnh (đơn vị ô), v hướng lên (đơn vị z) */
function FY(q,x0,y1,z0,fn){var p=ip(x0,y1,z0);q.save();q.transform(HW,HH,0,-ZU,p[0],p[1]);fn(q);q.restore()}
function FX(q,x1,y0,z0,fn){var p=ip(x1,y0,z0);q.save();q.transform(-HW,HH,0,-ZU,p[0],p[1]);fn(q);q.restore()}
function GR(q,x0,y0,z,fn){var p=ip(x0,y0,z);q.save();q.transform(HW,HH,-HW,HH,p[0],p[1]);fn(q);q.restore()}
function mixc(a,b,t){var A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return'rgb('+(((A>>16)*(1-t)+(B>>16)*t)|0)+','+(((A>>8&255)*(1-t)+(B>>8&255)*t)|0)+','+(((A&255)*(1-t)+(B&255)*t)|0)+')'}
/* mái ngói cong (hip), sống mái theo cạnh dài */
function roof(q,x0,y0,x1,y1,z,rise,ov,c1,c2){var cx=(x0+x1)/2,cy=(y0+y1)/2,w=x1-x0,d=y1-y0,u=.36,xa=x0-ov,xb=x1+ov,ya=y0-ov,yb=y1+ov,zc=z+u,sg=ZU*.3,i,t;
  var A=ip(xa,ya,zc),B=ip(xb,ya,zc),C=ip(xb,yb,zc),D=ip(xa,yb,zc),aY=d>=w,r0,r1;
  if(aY){var n1=Math.max(.12,(w+2*ov)/2*.92);r0=ip(cx,ya+n1,z+rise);r1=ip(cx,yb-n1,z+rise)}else{var n2=Math.max(.12,(d+2*ov)/2*.92);r0=ip(xa+n2,cy,z+rise);r1=ip(xb-n2,cy,z+rise)}
  var gr=lg(q,0,Math.min(r0[1],r1[1]),0,Math.max(C[1],D[1]),[0,c1,1,c2]),ed='rgba(10,8,24,.65)';
  function tri(P,Q,R,curve){q.beginPath();q.moveTo(P[0],P[1]);if(curve)q.quadraticCurveTo((P[0]+Q[0])/2,(P[1]+Q[1])/2+sg,Q[0],Q[1]);else q.lineTo(Q[0],Q[1]);q.lineTo(R[0],R[1]);q.closePath();q.fillStyle=gr;q.fill();q.strokeStyle=ed;q.lineWidth=1;q.stroke()}
  function quad(P,Q,R,S,curve){q.beginPath();q.moveTo(P[0],P[1]);if(curve)q.quadraticCurveTo((P[0]+Q[0])/2,(P[1]+Q[1])/2+sg,Q[0],Q[1]);else q.lineTo(Q[0],Q[1]);q.lineTo(R[0],R[1]);q.lineTo(S[0],S[1]);q.closePath();q.fillStyle=gr;q.fill();q.strokeStyle=ed;q.lineWidth=1;q.stroke()}
  function shade(){q.fillStyle='rgba(10,20,50,.22)';q.fill()}
  var fL,fR;
  if(aY){quad(A,D,r1,r0,0);shade();tri(A,B,r0,0);shade();tri(D,C,r1,1);quad(B,C,r1,r0,1);shade();fL=[D,C,r1];fR=[B,C,r1,r0]}
  else{quad(A,B,r1,r0,0);shade();tri(A,D,r0,0);shade();tri(B,C,r1,1);quad(D,C,r1,r0,1);fL=[D,C,r1,r0];fR=[B,C,r1];shade();}
  q.strokeStyle='rgba(0,10,30,.32)';q.lineWidth=1;
  function ribs(P,Q,R,S,n){for(i=1;i<n;i++){t=i/n;q.beginPath();q.moveTo(R[0]+(S[0]-R[0])*t,R[1]+(S[1]-R[1])*t);q.lineTo(P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t+sg*4*t*(1-t));q.stroke()}}
  if(aY){ribs(B,C,r0,r1,Math.max(3,Math.round(d*2)));ribs(D,C,{0:D[0],1:D[1]},r1,1)}else{ribs(D,C,r0,r1,Math.max(3,Math.round(w*2)))}
  q.strokeStyle='rgba(255,255,255,.12)';for(i=1;i<4;i++){t=i/4;var pa=aY?B:D,pb=C,ra=aY?r0:r0,rb=r1;q.beginPath();q.moveTo(pa[0]+(ra[0]-pa[0])*t,pa[1]+(ra[1]-pa[1])*t);q.lineTo(pb[0]+(rb[0]-pb[0])*t,pb[1]+(rb[1]-pb[1])*t);q.stroke()}
  var eA=aY?B:D,eB=C,nn=Math.max(4,Math.round(Math.hypot(eB[0]-eA[0],eB[1]-eA[1])/7));for(i=0;i<=nn;i++){t=i/nn;var ex=eA[0]+(eB[0]-eA[0])*t,ey=eA[1]+(eB[1]-eA[1])*t+sg*2*t*(1-t)*1.0;q.fillStyle='#e8c050';q.beginPath();q.arc(ex,ey,Math.max(1.2,HW*.035),0,TAU);q.fill()}
  q.strokeStyle=lg(q,r0[0],r0[1],r1[0],r1[1],[0,'#fff0a8',1,'#d8a838']);q.lineWidth=Math.max(2,HW*.06);q.lineCap='round';q.beginPath();q.moveTo(r0[0],r0[1]);q.lineTo(r1[0],r1[1]);q.stroke();
  [r0,r1].forEach(function(p){q.fillStyle='#ffe28a';q.beginPath();q.arc(p[0],p[1]-2,Math.max(2,HW*.05),0,TAU);q.fill()});
  [A,B,C,D].forEach(function(p){q.fillStyle='#f0c040';q.beginPath();q.arc(p[0],p[1],Math.max(1.6,HW*.045),0,TAU);q.fill()})}
/* tường có cột sơn son, cửa sổ lưới sáng đèn, cửa chính */
function walls(q,x0,y0,x1,y1,z0,h,o){box(q,x0,y0,x1,y1,z0,z0+h,o.top||'#cfc7b4',mixc(o.wall,'#2a2a50',.45),o.wall);
  function face(w,isL){var n=Math.max(2,Math.round(w/.85)),ci=Math.floor(n/2);return function(q){var gp=lg(q,0,0,0,h,[0,'rgba(255,255,255,.1)',1,'rgba(0,0,40,.22)']);q.fillStyle=gp;q.fillRect(0,0,w,h);
    for(var i=0;i<n;i++){var a=i*w/n+.13,ww=w/n-.26;if(o.door&&isL&&i==ci){q.fillStyle='#4a1410';q.beginPath();q.moveTo(a,0);q.lineTo(a,h*.5);q.quadraticCurveTo(a+ww/2,h*.78,a+ww,h*.5);q.lineTo(a+ww,0);q.fill();q.fillStyle='#e8c050';q.fillRect(a+ww/2-.012,0,.024,h*.55);for(var k=0;k<3;k++)for(var m=0;m<2;m++){q.beginPath();q.arc(a+ww*(m?.72:.28),h*(.12+k*.12),.018,0,TAU);q.fill()}continue}
      var wg=lg(q,0,h*.3,0,h*.82,[0,'rgba(255,214,128,.95)',1,'rgba(255,170,80,.9)']);q.fillStyle='#3a1610';q.fillRect(a-.03,h*.27,ww+.06,h*.58);q.fillStyle=wg;q.fillRect(a,h*.3,ww,h*.52);q.strokeStyle='rgba(120,48,24,.8)';q.lineWidth=.02;q.beginPath();q.moveTo(a+ww/2,h*.3);q.lineTo(a+ww/2,h*.82);q.moveTo(a,h*.56);q.lineTo(a+ww,h*.56);q.stroke()}
    for(i=0;i<=n;i++){q.fillStyle=o.pil||'#b82a22';q.fillRect(i*w/n-.055,0,.11,h);q.fillStyle='rgba(255,230,170,.25)';q.fillRect(i*w/n-.035,0,.025,h)}
    q.fillStyle='#7a2a1a';q.fillRect(0,h-.13,w,.13);q.fillStyle='#e8c050';q.fillRect(0,h-.13,w,.025)}}
  FY(q,x0,y1,z0,face(x1-x0,1));FX(q,x1,y0,z0,face(y1-y0,0))}
function hallB(q,cx,cy,w,d,o){var x0=cx-w/2,x1=cx+w/2,y0=cy-d/2,y1=cy+d/2,z=o.z0||0;
  if(!o.nobase){box(q,x0-.25,y0-.25,x1+.25,y1+.25,z,z+.32,'#d7dde8','#7c829c','#b0b8ca');z+=.32}
  for(var f=0;f<o.floors;f++){var ins=f*.34;walls(q,x0+ins,y0+ins,x1-ins,y1-ins,z,o.h,{wall:o.wall||'#eadfc4',pil:o.pil,door:f==0&&o.door!==0});z+=o.h;roof(q,x0+ins,y0+ins,x1-ins,y1-ins,z,o.rise*(f?1.25:.8),o.ov,o.r1,o.r2);z+=o.rise*.55}return z}
function pavB(q,cx,cy,w,d,o){var x0=cx-w/2,x1=cx+w/2,y0=cy-d/2,y1=cy+d/2;box(q,x0-.25,y0-.25,x1+.25,y1+.25,0,.36,'#d7dde8','#7c829c','#b0b8ca');var z0=.36,H=2.3;
  FY(q,x0,y1,z0,function(q){q.fillStyle=lg(q,0,0,0,H,[0,'rgba(255,200,120,.22)',1,'rgba(255,170,90,.5)']);q.fillRect(0,0,w,H)});
  function pil(x,y){box(q,x-.1,y-.1,x+.1,y+.1,z0,z0+H,'#d24a3a','#7a1c18','#b02a22')}
  pil(x0+.12,y0+.12);pil(x1-.12,y0+.12);pil(x0+.12,y1-.12);
  FY(q,x0,y1-.12,z0+.5,function(q){q.strokeStyle='#e8c050';q.lineWidth=.04;q.beginPath();q.moveTo(0,0);q.lineTo(w,0);q.stroke();for(var i=0;i<=8;i++){q.fillStyle='#e8c050';q.fillRect(i*w/8-.02,-.22,.04,.22)}});
  pil(x1-.12,y1-.12);roof(q,x0,y0,x1,y1,z0+H,o.rise,o.ov,o.r1,o.r2)}
function pagB(q,cx,cy,w,n,o){var z=0,i;box(q,cx-w/2-.5,cy-w/2-.5,cx+w/2+.5,cy+w/2+.5,0,.42,'#d7dde8','#7c829c','#b0b8ca');z=.42;
  for(i=0;i<n;i++){var ww=w*(1-.095*i),h=.9;walls(q,cx-ww/2,cy-ww/2,cx+ww/2,cy+ww/2,z,h,{wall:'#eadfc4',door:i==0});z+=h;roof(q,cx-ww/2,cy-ww/2,cx+ww/2,cy+ww/2,z,.4,.34,o.r1,o.r2);z+=.26}
  var a=ip(cx,cy,z),b=ip(cx,cy,z+1.9);q.strokeStyle='#e8c050';q.lineWidth=Math.max(2,HW*.05);q.beginPath();q.moveTo(a[0],a[1]);q.lineTo(b[0],b[1]);q.stroke();for(i=0;i<5;i++){var p=ip(cx,cy,z+.3+i*.28);q.fillStyle=i%2?'#f6d472':'#c8962e';q.beginPath();q.ellipse(p[0],p[1],HW*(.17-i*.02),HW*.05,0,0,TAU);q.fill()}q.fillStyle='#fff0a8';q.beginPath();q.arc(b[0],b[1]-3,HW*.05,0,TAU);q.fill();return z+1.9}
function marketB(q,cx,cy,w,d){box(q,cx-w/2-.2,cy-d/2-.2,cx+w/2+.2,cy+d/2+.2,0,.22,'#cfd5e0','#7c829c','#aeb6c8');var cols=['#d83a3a','#f0c040','#3a8ad8'];
  for(var k=0;k<3;k++){var sx=cx-w/2+.15+k*(w/3),sw=w/3-.1,y0=cy-d/2+.2,y1=cy+d/2-.2;
    box(q,sx+.05,y0+.35,sx+sw-.05,y1-.1,.22,.85,'#8a5a30','#5a3a1c','#7a4a28');
    for(var m=0;m<4;m++){var gx=sx+.15+m*(sw-.3)/3,p=ip(gx,y1-.2,.95);q.fillStyle=['#e84a4a','#ffd24a','#6ad07a','#7ab0ff'][(k+m)%4];q.beginPath();q.arc(p[0],p[1],HW*.06,0,TAU);q.fill()}
    [[sx+.06,y1-.06],[sx+sw-.06,y1-.06],[sx+.06,y0+.06],[sx+sw-.06,y0+.06]].forEach(function(p){box(q,p[0]-.04,p[1]-.04,p[0]+.04,p[1]+.04,.22,1.9,'#e0b24a','#8a6420','#c8962e')});
    var n=6,aw=[ip(sx,y1+.15,1.45),ip(sx+sw,y1+.15,1.45),ip(sx+sw,y0-.1,1.95),ip(sx,y0-.1,1.95)];
    for(var i=0;i<n;i++){var t0=i/n,t1=(i+1)/n,P=function(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]};fq(q,[P(aw[0],aw[1],t0),P(aw[0],aw[1],t1),P(aw[3],aw[2],t1),P(aw[3],aw[2],t0)],i%2?'#fff4e0':cols[k],'rgba(0,0,0,.25)')}
    var lp=ip(sx+sw/2,y1+.1,1.4);q.strokeStyle='#5a3a1c';q.lineWidth=1;q.beginPath();q.moveTo(lp[0],lp[1]-HW*.18);q.lineTo(lp[0],lp[1]);q.stroke();q.fillStyle='#e03a2a';q.beginPath();q.ellipse(lp[0],lp[1]+HW*.08,HW*.07,HW*.09,0,0,TAU);q.fill()}}
function portB(q,cx,cy,w,pal){var PL=(pal&&pal.pil)||['#c8cede','#6c7290','#a4acc2'],CR=(pal&&pal.core)||['#6a4ad0','#2a1a70','#0a0630'],x0=cx-w/2,x1=cx+w/2,y1=cy+.5,i;box(q,x0-.3,cy-.5,x1+.3,y1,0,.34,'#d7dde8','#7c829c','#b0b8ca');
  [x0,x1-.45].forEach(function(px){box(q,px,cy-.2,px+.45,y1-.08,.34,4.3,PL[0],PL[1],PL[2]);FY(q,px,y1-.08,.34,function(q){q.strokeStyle='#e8c050';q.lineWidth=.05;for(var k=0;k<7;k++){q.beginPath();q.moveTo(0,.4+k*.55);q.lineTo(.45,.4+k*.55);q.stroke()}q.strokeStyle='rgba(127,240,255,.8)';q.lineWidth=.04;q.beginPath();q.moveTo(.22,.2);q.lineTo(.22,3.9);q.stroke()})});
  FY(q,x0,y1-.08,.34,function(q){var rx=w/2-.45,rz=1.7,cu=w/2,cz=2.2;q.fillStyle=rg(q,cu,cz,.1,rz*1.2,[0,CR[0],.6,CR[1],1,CR[2]]);q.beginPath();q.ellipse(cu,cz,rx,rz,0,0,TAU);q.fill();q.lineWidth=.16;q.strokeStyle=lg(q,0,0,0,4.4,[0,'#fff0c0',1,'#c8962e']);q.beginPath();q.ellipse(cu,cz,rx+.04,rz+.04,0,0,TAU);q.stroke();q.lineWidth=.045;q.strokeStyle='rgba(127,240,255,.9)';q.beginPath();q.ellipse(cu,cz,rx-.12,rz-.12,0,0,TAU);q.stroke();
    for(i=0;i<14;i++){var an=i/14*TAU;q.fillStyle='#ffe28a';q.beginPath();q.arc(cu+Math.cos(an)*(rx+.2),cz+Math.sin(an)*(rz+.2),.05,0,TAU);q.fill()}
    q.fillStyle=lg(q,0,3.9,0,4.9,[0,'#fff0a8',1,'#d8a838']);q.beginPath();q.arc(cu,4.55,.55,Math.PI*.15,Math.PI*.85,true);q.arc(cu,4.7,.42,Math.PI*.85,Math.PI*.15,false);q.fill()});
  beamPortal(q,x0,x1,y1)}
function beamPortal(q,x0,x1,y1){box(q,x0-.15,y1-.6,x1+.15,y1-.15,4.3,4.6,'#d24a3a','#7a1c18','#b02a22')}
/* cung điện: bệ 3 bậc + điện chính 2 tầng + điện đỉnh + 2 sảnh bên */
function palaceB(q,cx,cy,w,d){var T={r1:'#4fc0b0',r2:'#1c6a68'},i;box(q,cx-w/2-1.1,cy-d/2-1.1,cx+w/2+1.1,cy+d/2+1.1,0,.5,'#d4dae6','#7c829c','#b0b8ca');box(q,cx-w/2-.5,cy-d/2-.5,cx+w/2+.5,cy+d/2+.5,.5,.95,'#dde2ec','#8288a2','#b8c0d0');
  FY(q,cx-w/2-1.1,cy+d/2+1.1,0,function(q){q.strokeStyle='rgba(40,50,90,.35)';q.lineWidth=.02;for(var k=1;k<8;k++){q.beginPath();q.moveTo(k*(w+2.2)/8,0);q.lineTo(k*(w+2.2)/8,.5);q.stroke()}});
  FY(q,cx-1.1,cy+d/2+.5,.5,function(q){for(var s=0;s<4;s++){q.fillStyle=lg(q,0,s*.12,0,s*.12+.12,[0,'#e6ebf4',1,'#9aa2ba']);q.fillRect(0,s*.115,2.2,.12)}q.fillStyle='rgba(180,40,40,.85)';q.fillRect(.7,0,.8,.46)});
  [-1,1].forEach(function(sd){hallB(q,cx+sd*(w/2+.1),cy+.5,1.9,1.7,{floors:1,h:1.2,rise:.8,ov:.5,r1:T.r1,r2:T.r2,nobase:1,z0:.95})});
  var z=hallB(q,cx,cy+.2,w-1.2,d-1,{floors:2,h:1.35,rise:1.05,ov:.8,r1:T.r1,r2:T.r2,nobase:1,z0:.95});
  hallB(q,cx,cy,2.5,1.7,{floors:1,h:1.05,rise:1.5,ov:.65,r1:'#f0d070',r2:'#a8741c',nobase:1,z0:z-.2,door:0})}
/* ---------- cây, đèn đá, đá, pha lê (vẽ phẳng, đặt theo chiều sâu) ---------- */
function pineT(q,x,y,u,seed){var r=rng(seed);q.strokeStyle='#3a2418';q.lineCap='round';q.lineWidth=6*u;q.beginPath();q.moveTo(x,y);q.bezierCurveTo(x-10*u,y-26*u,x+12*u,y-44*u,x-2*u,y-72*u);q.stroke();
  [[x-2*u,y-76*u,30*u],[x+24*u,y-52*u,24*u],[x-26*u,y-48*u,22*u],[x+8*u,y-34*u,18*u]].forEach(function(p){for(var l=0;l<3;l++){q.fillStyle=['#1c4a44','#256a58','#3a9a72'][l];q.beginPath();q.ellipse(p[0],p[1]-l*4*u,p[2]*(1-l*.12),p[2]*.3,0,0,TAU);q.fill()}})}
function sakura(q,x,y,u,seed){var r=rng(seed);q.strokeStyle='#4a2a3a';q.lineCap='round';q.lineWidth=6*u;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x-8*u,y-30*u,x+4*u,y-56*u);q.stroke();q.lineWidth=3*u;q.beginPath();q.moveTo(x+2*u,y-34*u);q.quadraticCurveTo(x+22*u,y-46*u,x+30*u,y-68*u);q.stroke();
  [[x+4*u,y-78*u,30*u],[x+30*u,y-74*u,20*u],[x-26*u,y-70*u,22*u]].forEach(function(c){for(var i=0;i<42;i++){var a=r()*TAU,d=Math.sqrt(r())*c[2],v=r();q.fillStyle=v<.5?'rgba(255,174,200,.9)':v<.8?'rgba(255,208,224,.92)':'rgba(255,244,248,.95)';q.beginPath();q.arc(c[0]+Math.cos(a)*d,c[1]+Math.sin(a)*d*.72,(3+r()*4)*u,0,TAU);q.fill()}})}
function lampB(q,u){q.fillStyle='rgba(0,0,0,.25)';q.beginPath();q.ellipse(0,0,13*u,4*u,0,0,TAU);q.fill();q.fillStyle=lg(q,-9*u,0,9*u,0,[0,'#a8aec4',.5,'#dce2f0',1,'#8a90a8']);q.fillRect(-9*u,-7*u,18*u,7*u);q.fillRect(-3.4*u,-28*u,6.8*u,22*u);q.fillRect(-8*u,-32*u,16*u,5*u);q.fillStyle='#2a1a30';q.fillRect(-7*u,-48*u,14*u,17*u);q.fillStyle='rgba(255,210,130,.95)';q.fillRect(-4.6*u,-45.4*u,9.2*u,11.4*u);q.strokeStyle='#5a3a30';q.lineWidth=u;q.strokeRect(-4.6*u,-45.4*u,9.2*u,11.4*u);q.fillStyle='#8a90a8';q.beginPath();q.moveTo(-13*u,-48*u);q.lineTo(0,-60*u);q.lineTo(13*u,-48*u);q.closePath();q.fill();q.fillStyle='#dce2f0';q.beginPath();q.arc(0,-62*u,2.6*u,0,TAU);q.fill()}
function postB(q,u){q.fillStyle='rgba(0,0,0,.22)';q.beginPath();q.ellipse(0,0,8*u,3*u,0,0,TAU);q.fill();q.fillStyle=lg(q,-5*u,0,5*u,0,[0,'#9aa0b8',.5,'#d8deec',1,'#80869e']);q.fillRect(-5*u,-8*u,10*u,8*u);q.fillRect(-3.2*u,-30*u,6.4*u,23*u);q.fillRect(-5.2*u,-33*u,10.4*u,4*u);q.fillStyle='#d8deec';q.beginPath();q.arc(0,-36*u,3.6*u,0,TAU);q.fill();q.fillStyle='#e8c050';q.fillRect(-3.6*u,-20*u,7.2*u,1.6*u)}
function rockB(q,u,seed){var r=rng(seed);for(var i=0;i<4;i++){var x=(r()-.5)*22*u,w=(6+r()*9)*u,h=(5+r()*9)*u;q.fillStyle=lg(q,x-w,-h,x+w,0,[0,'#9a9ab8',1,'#4a4a6a']);q.beginPath();q.moveTo(x-w,0);q.lineTo(x-w*.7,-h*.7);q.lineTo(x-w*.1,-h);q.lineTo(x+w*.6,-h*.6);q.lineTo(x+w,0);q.closePath();q.fill();q.fillStyle='rgba(255,255,255,.18)';q.beginPath();q.moveTo(x-w*.7,-h*.7);q.lineTo(x-w*.1,-h);q.lineTo(x-w*.2,-h*.55);q.closePath();q.fill()}}
function cryB(q,u,seed){var r=rng(seed);for(var i=0;i<4;i++){var x=(i-1.5)*6*u+(r()-.5)*3*u,h=(14+r()*16)*u,w=(3.5+r()*2)*u;q.fillStyle=lg(q,x,-h,x,0,[0,'#e8ffff',1,'#2a9ac8']);q.beginPath();q.moveTo(x-w,0);q.lineTo(x-w*.7,-h*.7);q.lineTo(x,-h);q.lineTo(x+w*.8,-h*.6);q.lineTo(x+w,0);q.closePath();q.fill();q.fillStyle='rgba(255,255,255,.4)';q.beginPath();q.moveTo(x-w*.7,-h*.7);q.lineTo(x,-h);q.lineTo(x-w*.2,-h*.4);q.closePath();q.fill()}}
/* ---------- nền trời đêm + núi xa (cache theo màn hình) ---------- */
var SKY=null,SKYK='';
function skyCache(){var k=W+'|'+H+'|'+DPR;if(SKY&&SKYK===k)return SKY;SKYK=k;var w=Math.ceil(W*1.3),h=Math.ceil(H*1.12),o=mkc(w,h,dG()),q=o.q,r=rng(77),i;
  q.fillStyle=lg(q,0,0,0,h,[0,'#070a2a',.3,'#14185c',.55,'#3a2a82',.78,'#8a5aa8',1,'#d8a0c0']);q.fillRect(0,0,w,h);
  q.globalCompositeOperation='lighter';[[.7,.2,'90,60,200',.32,.34],[.18,.3,'40,160,200',.2,.26],[.5,.1,'200,90,200',.18,.22]].forEach(function(n){q.fillStyle=rg(q,w*n[0],h*n[1],4,w*n[3]*1.3,[0,'rgba('+n[2]+','+n[4]+')',1,'rgba('+n[2]+',0)']);q.beginPath();q.arc(w*n[0],h*n[1],w*n[3]*1.3,0,TAU);q.fill()});
  var gx=w*.74,gy=h*.2;q.save();q.translate(gx,gy);q.rotate(-.35);for(i=0;i<3;i++){q.fillStyle=rg(q,0,0,2,w*(.2-i*.045),[0,'rgba(255,236,200,'+(.55-i*.12)+')',.4,'rgba(255,170,230,'+(.3-i*.07)+')',1,'rgba(120,80,220,0)']);q.beginPath();q.ellipse(0,0,w*(.2-i*.04),h*(.05-i*.01),0,0,TAU);q.fill()}for(i=0;i<260;i++){var a=r()*TAU,d=Math.pow(r(),1.4)*w*.2,xx=Math.cos(a)*d,yy=Math.sin(a)*d*.26+Math.sin(d*.02+a)*h*.012;q.fillStyle='rgba(255,'+(200+r()*55|0)+',255,'+(.25+r()*.6)+')';q.beginPath();q.arc(xx,yy,.5+r()*1.1,0,TAU);q.fill()}q.restore();
  for(i=0;i<320;i++){var sx=r()*w,sy=Math.pow(r(),1.3)*h*.7;q.fillStyle='rgba(255,'+(235+r()*20|0)+',255,'+(.2+r()*.75)+')';var sr=.4+r()*1.3;q.beginPath();q.arc(sx,sy,sr,0,TAU);q.fill()}q.globalCompositeOperation='source-over';
  var mx=w*.26,my=h*.13;q.fillStyle=rg(q,mx,my,4,60,[0,'rgba(255,248,220,.5)',1,'rgba(255,248,220,0)']);q.beginPath();q.arc(mx,my,60,0,TAU);q.fill();q.fillStyle='#fff4d0';q.beginPath();q.arc(mx,my,17,0,TAU);q.fill();q.fillStyle='#14185c';q.beginPath();q.arc(mx+7,my-3,15,0,TAU);q.fill();
  var base=[h*.7,h*.78],cols=[['#2a2a6a','#4a3a8a'],['#201e58','#38307a']],L;
  for(L=0;L<2;L++){var by=base[L];for(i=0;i<16;i++){var px=(i+r())*w/15,pw=(26+r()*40)*(1+L*.3),ph=(70+r()*150)*(1-L*.2);q.fillStyle=lg(q,0,by-ph,0,by,[0,cols[L][1],1,cols[L][0]]);q.beginPath();q.moveTo(px-pw,by+10);q.quadraticCurveTo(px-pw*.7,by-ph*.55,px-pw*.18,by-ph*.92);q.quadraticCurveTo(px,by-ph*1.04,px+pw*.2,by-ph*.9);q.quadraticCurveTo(px+pw*.7,by-ph*.5,px+pw,by+10);q.fill();
      if(r()<.35&&L==0){var hx2=px,hy2=by-ph;pagodaSil(q,hx2,hy2+4,.5+r()*.3)}}
    q.fillStyle=lg(q,0,by-30,0,by+40,[0,'rgba(200,170,240,0)',.6,'rgba(210,180,245,.35)',1,'rgba(210,180,245,0)']);q.fillRect(0,by-30,w,70)}
  force(o.c);SKY={c:o.c,w:w,h:h};return SKY}
function pagodaSil(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);for(var i=0;i<4;i++){var ww=26-i*4,yy=-i*18;q.fillStyle='#1a1850';q.fillRect(-ww/2,yy-14,ww,14);q.fillStyle='rgba(255,210,130,.9)';q.fillRect(-2,yy-10,4,6);q.fillStyle='#1a1850';q.beginPath();q.moveTo(-ww*.9,yy-14);q.quadraticCurveTo(0,yy-24,ww*.9,yy-14);q.lineTo(ww*.55,yy-12);q.lineTo(-ww*.55,yy-12);q.fill()}q.restore()}
/* ---------- đảo lơ lửng ---------- */
/* Fix163: nền Tiên Linh Chiến Cảnh (đảo 'war'): đá tím nứt + 3 vòng rune + 8 nan hoa (ứng 8 hướng) + ấn sao 8 cánh ở tâm */
function warGround(q,I,rr){var k,i,a,t;
  q.lineWidth=.03;q.strokeStyle='rgba(20,8,48,.38)';for(a=-14;a<=14;a++){q.beginPath();q.moveTo(a,-14);q.lineTo(a,14);q.moveTo(-14,a);q.lineTo(14,a);q.stroke()}
  q.strokeStyle='rgba(255,190,255,.2)';q.lineWidth=.05;for(i=0;i<24;i++){var cx=(rr()-.5)*I.rx*1.7,cy=(rr()-.5)*I.ry*1.7,ln=.8+rr()*1.8,an=rr()*6.28;q.beginPath();q.moveTo(cx,cy);q.lineTo(cx+Math.cos(an)*ln*.5,cy+Math.sin(an)*ln*.5);q.lineTo(cx+Math.cos(an+.5)*ln,cy+Math.sin(an+.5)*ln);q.stroke()}
  [.3,.58,.84].forEach(function(f,j){q.strokeStyle=j==1?'rgba(255,214,120,.75)':'rgba(190,140,255,.6)';q.lineWidth=j==1?.07:.045;q.beginPath();q.ellipse(0,0,I.rx*f,I.ry*f,0,0,TAU);q.stroke();
    var n=8*(j+1);for(var m=0;m<n;m++){var tt=m/n*TAU;q.fillStyle=j==1?'rgba(255,224,150,.9)':'rgba(214,170,255,.8)';q.beginPath();q.arc(Math.cos(tt)*I.rx*f,Math.sin(tt)*I.ry*f,.07,0,TAU);q.fill()}});
  q.strokeStyle='rgba(255,190,255,.42)';q.lineWidth=.06;for(k=0;k<8;k++){t=k*Math.PI/4;q.beginPath();q.moveTo(Math.cos(t)*I.rx*.3,Math.sin(t)*I.ry*.3);q.lineTo(Math.cos(t)*I.rx*.9,Math.sin(t)*I.ry*.9);q.stroke()}
  q.fillStyle=rg(q,0,0,.1,I.rx*.3,[0,'rgba(255,230,190,.85)',.5,'rgba(190,120,255,.45)',1,'rgba(90,40,170,0)']);q.beginPath();q.ellipse(0,0,I.rx*.3,I.ry*.3,0,0,TAU);q.fill();
  q.strokeStyle='rgba(255,236,170,.95)';q.lineWidth=.06;q.beginPath();for(k=0;k<=8;k++){t=k*3*Math.PI/4;var px=Math.cos(t)*I.rx*.22,py=Math.sin(t)*I.ry*.22;k?q.lineTo(px,py):q.moveTo(px,py)}q.stroke()}
function islSpr(I){var D=(I.rx+I.ry)*HH*.62,pts=I.poly.map(function(p){return ip(p[0]-I.cx,p[1]-I.cy,0)}),mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9,M=36;pts.forEach(function(p){mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mny=Math.min(mny,p[1]);mxy=Math.max(mxy,p[1])});
  return spr('i'+I.id,mxx-mnx+2*M,mxy-mny+D*1.65+2*M,-mnx+M,-mny+M,function(q){var r=rng(I.seed*31),n=pts.length,iL=0,iR=0,i;for(i=0;i<n;i++){if(pts[i][0]<pts[iL][0])iL=i;if(pts[i][0]>pts[iR][0])iR=i}
    function chain(a,b){var o=[],k=a;while(true){o.push(pts[k]);if(k==b)break;k=(k+1)%n}return o}var c1=chain(iL,iR),c2=chain(iR,iL),av=function(c){return c.reduce(function(s,p){return s+p[1]},0)/c.length},low=av(c1)>av(c2)?c1:c2;low.sort(function(a,b){return a[0]-b[0]});
    var bot=low.map(function(p,j){var t=(p[0]-mnx)/(mxx-mnx),dep=D*Math.pow(Math.sin(Math.PI*Math.min(.98,Math.max(.02,t))),.8)*(.7+.5*r());if(Math.abs(t-.5)<.12)dep+=D*.42;return[p[0],p[1]+dep]});
    q.fillStyle=lg(q,0,(mny+mxy)/2,0,mxy+D*1.3,[0,'#8a82ae',.35,'#5a5284',1,'#1c1840']);q.beginPath();q.moveTo(low[0][0],low[0][1]);low.forEach(function(p){q.lineTo(p[0],p[1])});for(i=bot.length-1;i>=0;i--)q.lineTo(bot[i][0],bot[i][1]);q.closePath();q.fill();
    q.fillStyle=lg(q,mnx,0,mxx,0,[0,'rgba(255,255,255,.14)',.5,'rgba(255,255,255,0)',1,'rgba(0,0,30,.28)']);q.fill();
    q.save();q.clip();q.lineCap='round';for(i=0;i<46;i++){var j=(r()*(low.length-1))|0,x=low[j][0]+(r()-.5)*12,y=low[j][1]+r()*D*.6,ln=(10+r()*28);q.strokeStyle=r()<.6?'rgba(14,10,40,'+(.18+r()*.2)+')':'rgba(220,210,255,'+(.06+r()*.08)+')';q.lineWidth=1+r()*1.6;q.beginPath();q.moveTo(x,y);q.lineTo(x+(r()-.5)*8,y+ln);q.stroke()}q.restore();
    q.strokeStyle=I.k==='war'?'#8a5ad8':'#4aa070';q.lineWidth=Math.max(4,HW*.11);q.lineJoin='round';q.beginPath();low.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.stroke();q.strokeStyle='rgba(150,230,150,.55)';q.lineWidth=Math.max(2,HW*.04);q.stroke();
    q.strokeStyle='rgba(80,160,90,.85)';q.lineWidth=1.3;for(i=0;i<20;i++){var j2=(r()*(low.length-1))|0,vx=low[j2][0],vy=low[j2][1];q.beginPath();q.moveTo(vx,vy);q.quadraticCurveTo(vx+(r()-.5)*6,vy+12,vx+(r()-.5)*5,vy+(14+r()*30));q.stroke()}
    for(i=0;i<5;i++){var j3=(2+r()*(bot.length-4))|0,cx2=bot[j3][0],cy2=bot[j3][1]-D*.15,hh=(18+r()*22)*HW/46,ww=hh*.28;q.save();q.globalCompositeOperation='lighter';q.fillStyle=rg(q,cx2,cy2,1,hh*1.4,[0,'rgba(120,255,240,.4)',1,'rgba(120,255,240,0)']);q.beginPath();q.arc(cx2,cy2,hh*1.4,0,TAU);q.fill();q.restore();q.fillStyle=lg(q,cx2,cy2-hh,cx2,cy2,[0,'#e8ffff',1,'#2ab8c8']);q.beginPath();q.moveTo(cx2-ww,cy2);q.lineTo(cx2-ww*.5,cy2-hh*.7);q.lineTo(cx2,cy2-hh);q.lineTo(cx2+ww*.7,cy2-hh*.6);q.lineTo(cx2+ww,cy2);q.closePath();q.fill()}
    if(I.k!=='deco'||I.pg){var wj=(low.length*.22)|0,wx=low[wj][0],wy=low[wj][1];q.fillStyle=lg(q,0,wy,0,wy+D*1.5,[0,'rgba(255,255,255,.9)',1,'rgba(235,245,255,.15)']);q.beginPath();q.moveTo(wx-HW*.1,wy-2);q.lineTo(wx+HW*.1,wy-2);q.lineTo(wx+HW*.13,wy+D*1.5);q.lineTo(wx-HW*.13,wy+D*1.5);q.fill()}
    q.beginPath();pts.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();q.save();q.clip();
    var kind=I.k;q.fillStyle=kind==='war'?rg(q,0,0,2,(mxx-mnx)/2,[0,'#7a5ac0',.5,'#44287c',1,'#1c1040']):kind==='plaza'||kind==='terrace'?lg(q,0,mny,0,mxy,[0,'#eef2fa',1,'#aab4cc']):rg(q,0,0,2,(mxx-mnx)/2,[0,'#7cc08a',.7,'#4a9a6c',1,'#357a58']);q.fillRect(mnx,mny,mxx-mnx,mxy-mny);
    GR(q,0,0,0,function(q){q.lineWidth=.025;var rr=rng(I.seed*7);
      if(kind==='war'){warGround(q,I,rr)}else if(kind==='plaza'||kind==='terrace'){q.strokeStyle='rgba(60,70,110,.22)';for(var a=-12;a<=12;a++){q.beginPath();q.moveTo(a,-12);q.lineTo(a,12);q.moveTo(-12,a);q.lineTo(12,a);q.stroke()}
        q.strokeStyle='rgba(200,150,40,.7)';q.lineWidth=.07;q.beginPath();q.ellipse(0,0,I.rx*.62,I.ry*.62,0,0,TAU);q.stroke();q.lineWidth=.04;q.strokeStyle='rgba(80,150,220,.55)';q.beginPath();q.ellipse(0,0,I.rx*.5,I.ry*.5,0,0,TAU);q.stroke();
        for(var m=0;m<16;m++){var an=m/16*TAU;q.fillStyle='rgba(220,170,60,.8)';q.beginPath();q.arc(Math.cos(an)*I.rx*.56,Math.sin(an)*I.ry*.56,.09,0,TAU);q.fill()}
        if(kind==='terrace'){q.fillStyle='rgba(170,36,36,.85)';q.fillRect(-.9,.8,1.8,I.ry*1.05);q.fillStyle='rgba(232,192,80,.9)';q.fillRect(-.95,.8,.07,I.ry*1.05);q.fillRect(.88,.8,.07,I.ry*1.05)}}
      else{for(var m2=0;m2<26;m2++){q.fillStyle='rgba('+(rr()<.5?'40,110,70':'130,200,120')+','+(.2+rr()*.2)+')';q.beginPath();q.ellipse((rr()-.5)*I.rx*1.8,(rr()-.5)*I.ry*1.8,.4+rr()*.9,.3+rr()*.6,rr()*3,0,TAU);q.fill()}
        q.fillStyle='rgba(214,206,186,.9)';q.fillRect(-.7,-I.ry,1.4,I.ry*2);q.fillRect(-I.rx,-.7,I.rx*2,1.4);q.strokeStyle='rgba(120,110,90,.5)';q.lineWidth=.03;q.strokeRect(-.7,-I.ry,1.4,I.ry*2);
        for(var f=0;f<40;f++){q.fillStyle=['#ff9ab8','#ffe27a','#fff','#c8a0ff'][(rr()*4)|0];q.beginPath();q.arc((rr()-.5)*I.rx*1.7,(rr()-.5)*I.ry*1.7,.06,0,TAU);q.fill()}}});
    try{if(window.TGD&&TGD.ground)TGD.ground(q,I,kind,CTX())}catch(e){console.error('TGD',e)}/* world/90: chi tiết mặt đảo */
    q.restore();q.beginPath();pts.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.closePath();q.strokeStyle='rgba(255,255,255,.5)';q.lineWidth=1.4;q.stroke()},dG())}
/* ---------- cầu đá vòm ---------- */
function brgSpr(b,bi){if(b.patch)return patchSpr(b,bi);var aY=b.main||(b.y1-b.y0)>(b.x1-b.x0),T=1.25,p=[ip(b.x0,b.y0,0),ip(b.x1,b.y0,0),ip(b.x1,b.y1,0),ip(b.x0,b.y1,0),ip(b.x1,b.y1,-T),ip(b.x0,b.y1,-T),ip(b.x1,b.y0,-T)],mn=1e9,mx2=-1e9,mny=1e9,mxy=-1e9,M=24;p.forEach(function(a){mn=Math.min(mn,a[0]);mx2=Math.max(mx2,a[0]);mny=Math.min(mny,a[1]);mxy=Math.max(mxy,a[1])});var O=p[0];
  return spr('b'+bi,mx2-mn+2*M,mxy-mny+2*M,O[0]-mn+M,O[1]-mny+M,function(q){q.translate(-O[0],-O[1]);
    function arches(len,n,draw){for(var k=0;k<n;k++){draw(len*(k+.5)/n,len/n*.7)}}
    FX(q,b.x1,b.y0,-T,function(q){var L=b.y1-b.y0;q.save();if(b.main){q.beginPath();q.rect(0,0,CR[0]-b.y0,T);q.rect(CR[1]-b.y0,0,L-(CR[1]-b.y0),T);q.clip()}q.fillStyle=lg(q,0,0,0,T,[0,'#6a6a88',1,'#9a9ab8']);q.fillRect(0,0,L,T);q.strokeStyle='rgba(20,20,50,.4)';q.lineWidth=.02;for(var yy=.25;yy<T;yy+=.25){q.beginPath();q.moveTo(0,yy);q.lineTo(L,yy);q.stroke()}
      if(aY){var n=Math.max(2,Math.floor(L/3.2));arches(L,n,function(c,w){q.fillStyle=lg(q,0,0,0,T,[0,'#14143a',1,'#8aa0d8']);q.beginPath();q.moveTo(c-w/2,0);q.lineTo(c-w/2,T*.3);q.arc(c,T*.3,w/2,Math.PI,0);q.lineTo(c+w/2,0);q.fill();q.strokeStyle='#d8b050';q.lineWidth=.05;q.beginPath();q.arc(c,T*.3,w/2+.06,Math.PI,0);q.stroke()})}q.restore()});
    FY(q,b.x0,b.y1,-T,function(q){var L=b.x1-b.x0;q.fillStyle=lg(q,0,0,0,T,[0,'#7a7a98',1,'#aaaac8']);q.fillRect(0,0,L,T);q.strokeStyle='rgba(20,20,50,.4)';q.lineWidth=.02;for(var yy=.25;yy<T;yy+=.25){q.beginPath();q.moveTo(0,yy);q.lineTo(L,yy);q.stroke()}
      if(!aY){var n=Math.max(2,Math.floor(L/3.2));arches(L,n,function(c,w){q.fillStyle=lg(q,0,0,0,T,[0,'#14143a',1,'#8aa0d8']);q.beginPath();q.moveTo(c-w/2,0);q.lineTo(c-w/2,T*.3);q.arc(c,T*.3,w/2,Math.PI,0);q.lineTo(c+w/2,0);q.fill();q.strokeStyle='#d8b050';q.lineWidth=.05;q.beginPath();q.arc(c,T*.3,w/2+.06,Math.PI,0);q.stroke()})}});
    fq(q,[p[0],p[1],p[2],p[3]],bridgeGrad(q),'rgba(255,255,255,.3)');
    q.save();q.beginPath();q.moveTo(p[0][0],p[0][1]);q.lineTo(p[1][0],p[1][1]);q.lineTo(p[2][0],p[2][1]);q.lineTo(p[3][0],p[3][1]);q.closePath();q.clip();
    q.save();q.transform(HW,HH,-HW,HH,p[0][0],p[0][1]);bridgeLines(q,b);
    q.fillStyle='rgba(150,120,70,.22)';if(aY){if(b.main){q.fillRect((b.x1-b.x0)/2-.25,0,.5,CR[0]-b.y0);q.fillRect((b.x1-b.x0)/2-.25,CR[1]-b.y0,.5,b.y1-CR[1])}else q.fillRect((b.x1-b.x0)/2-.25,0,.5,b.y1-b.y0)}else q.fillRect(0,(b.y1-b.y0)/2-.25,b.x1-b.x0,.5);q.restore();q.restore()},dG())}
/* ---------- vật thể tĩnh sắp theo chiều sâu ---------- */
var DR=[],GD=[],CL=[],TOAST=null,SPN={};
var COL={palace:['#4fc0b0','#1c6a68'],arena:['#f0704a','#8a2a20'],cave:['#5ad0f0','#1c5a78'],alch:['#6ad898','#1f6a4a'],rebirth:['#a48aff','#3a2a8a'],forge:['#e89a48','#7a3a1c'],beast:['#b880e8','#4a2a7a'],pagoda:['#f0d070','#a8741c'],market:['#fff','#ccc'],portal:['#6a8af0','#2a3a9a']};
var DECB=[];
function bSpr(k,sp){var key='s'+k;if(SC[key])return SC[key];var w=sp.w,d=sp.d,hw=(w+d)*HW/2+HW*2.8,up=(sp.z||6)*ZU+ZU*2.6,dn=(w+d)*HH/2+HH*2.4;
  return spr(key,hw*2,up+dn,hw,up,function(q){GR(q,0,0,0,function(q){q.fillStyle='rgba(0,0,30,.2)';q.beginPath();q.ellipse(0,0,w*.62+.3,d*.62+.3,0,0,TAU);q.fill()});var c=COL[sp.id]||['#4fc0b0','#1c6a68'];
    if(sp.k==='palace')palaceB(q,0,0,w,d);else if(sp.k==='pavilion')pavB(q,0,0,w,d,{rise:1.1,ov:.55,r1:c[0],r2:c[1]});else if(sp.k==='hall')hallB(q,0,0,w,d,{floors:1,h:1.7,rise:1.1,ov:.55,r1:c[0],r2:c[1]});else if(sp.k==='hall2')hallB(q,0,0,w,d,{floors:2,h:1.35,rise:.9,ov:.5,r1:c[0],r2:c[1]});
    else if(sp.k==='pagoda')pagB(q,0,0,w*.9,sp.tiers||7,{r1:c[0],r2:c[1]});else if(sp.k==='market')marketB(q,0,0,w,d);else if(sp.k==='portal'||sp.k==='wargate')portB(q,0,0,w,sp.pal)})}
function near2(x,y,list,r){for(var i=0;i<list.length;i++)if(Math.hypot(list[i][0]-x,list[i][1]-y)<r)return true;return false}
function buildDraw(){DR=[];GD=[];var doors=SPOTS.map(function(p){return p.door}),r;
  BRG.forEach(function(b,bi){GD.push({k:'brg',i:bi,d:b.patch?200:(b.x0+b.x1)/2+(b.y0+b.y1)/2});if(b.patch)return;var aY=b.main||(b.y1-b.y0)>(b.x1-b.x0),st=1.6,lists=[],cor=[],A,B,v;
    /* Fix190: cột lan can dừng sát ô giao nhau, 4 cột góc có đèn; lan can chỉ nối trong cùng một đoạn */
    if(b.main){A=[];B=[];for(v=b.y0+.35;v<=b.y1-.3;v+=st){if(v<CR[0]-.55)A.push(v);else if(v>CR[1]+.55)B.push(v)}A.push(CR[0]-.15);B.unshift(CR[1]+.15);cor=[CR[0]-.15,CR[1]+.15];lists=[A,B]}
    else if(b.x1<=14){A=[];for(v=b.x0+.35;v<=b.x1-.55;v+=st)A.push(v);A.push(b.x1-.15);cor=[b.x1-.15];lists=[A]}
    else{A=[b.x0+.15];for(v=b.x0+.15+st;v<=b.x1-.3;v+=st)A.push(v);cor=[b.x0+.15];lists=[A]}
    lists.forEach(function(Ls){Ls.forEach(function(v,li){(aY?[b.x0+.2,b.x1-.2]:[b.y0+.2,b.y1-.2]).forEach(function(sd,si){var x=aY?sd:v,y=aY?v:sd;DR.push({k:'post',x:x,y:y,d:x+y,lamp:cor.indexOf(v)>=0||Math.round((v-(aY?b.y0:b.x0))/st)%2==0,aY:aY?1:0,si:si,pv:li>0?(aY?[x,Ls[li-1]]:[Ls[li-1],y]):null})})})})});
  ISL.forEach(function(I,ii){GD.push({k:'isl',i:ii,d:I.cx+I.cy});r=rng(I.seed*13);
    function put(kind,x,y,v){DR.push({k:kind,x:x,y:y,d:x+y,v:v})}
    function sc(n,fn){var c=0,tr=0;while(c<n&&tr<500){tr++;var a=r()*TAU,dd=Math.sqrt(r())*.84,x=I.cx+Math.cos(a)*I.rx*dd,y=I.cy+Math.sin(a)*I.ry*dd;if(!inPoly(I.wp,x,y))continue;var bad=false;SPOTS.forEach(function(p){var rc=p.rect;if(x>rc[0]-1.1&&x<rc[2]+1.1&&y>rc[1]-1.1&&y<rc[3]+1.1)bad=true});if(bad||near2(x,y,doors,1.7)||(window.TGD&&TGD.avoid&&TGD.avoid(x,y,I)))continue;
        if(I.k==='garden'&&(Math.abs(x-I.cx)<1.2||Math.abs(y-I.cy)<1.2))continue;if(I.k==='terrace'&&Math.abs(x-14)<1.8)continue;if(I.k==='plaza'&&Math.abs(x-14)<1.6&&y<35)continue;
        BRG.forEach(function(b){if(x>b.x0-1.4&&x<b.x1+1.4&&y>b.y0-1.4&&y<b.y1+1.4)bad=true});if(bad)continue;fn(x,y,r());c++}}
    if(I.k==='plaza'){sc(2,function(x,y,v){put('sak',x,y,(v*99)|0)});sc(3,function(x,y,v){put('pine',x,y,(v*99)|0)});for(var a=0;a<8;a++){var an=a/8*TAU+.4,x=I.cx+Math.cos(an)*I.rx*.82,y=I.cy+Math.sin(an)*I.ry*.82;if(walk(x,y)||inPoly(I.wp,x,y)){if(!near2(x,y,doors,2.2)&&!(Math.abs(x-14)<2&&y<34))put('lamp',x,y,0)}}}
    else if(I.k==='garden'){sc(3,function(x,y,v){put(v<.5?'pine':'sak',x,y,(v*99)|0)});sc(3,function(x,y,v){put('rock',x,y,(v*99)|0)});sc(2,function(x,y,v){put('cry',x,y,(v*99)|0)});sc(2,function(x,y){put('lamp',x,y,0)})}
    else if(I.k==='terrace'){sc(7,function(x,y,v){put(v<.5?'pine':'sak',x,y,(v*99)|0)});sc(3,function(x,y,v){put('rock',x,y,(v*99)|0)});for(var yy=11.2;yy<17;yy+=2.4)[12.2,15.8].forEach(function(x){put('lamp',x,yy,0)})}
    else if(I.k==='war'){for(var wi=0;wi<16;wi++){var wa=wi/16*TAU+.2,wx=I.cx+Math.cos(wa)*I.rx*.8,wy=I.cy+Math.sin(wa)*I.ry*.8;if(!inPoly(I.wp,wx,wy)||near2(wx,wy,doors,2.4))continue;put(wi%3==0?'cry':'rock',wx,wy,wi*7)}
      for(var wl=0;wl<8;wl++){var wb=wl*Math.PI/4,lx=I.cx+Math.cos(wb)*I.rx*.88,ly=I.cy+Math.sin(wb)*I.ry*.88;if(inPoly(I.wp,lx,ly)&&!near2(lx,ly,doors,2))put('lamp',lx,ly,0)}}
    else if(I.k==='deco'){sc(3,function(x,y,v){put(v<.5?'pine':'sak',x,y,(v*99)|0)});sc(2,function(x,y,v){put('cry',x,y,(v*99)|0)});if(I.pg)DECB.push({x:I.cx,y:I.cy,w:1.8,d:1.8,k:ii%2?'pagoda':'pavilion',z:ii%2?8:4,tiers:5,id:'d'+ii})}});
  try{if(window.TGD&&TGD.build)TGD.build(DR,DECB,CTX())}catch(e){console.error('TGD',e)}/* world/90: nhà, cây, vật trang trí */
  DECB.forEach(function(p,i){p.sid='deco'+i;DR.push({k:'deco',i:i,x:p.x,y:p.y,d:p.x+p.y})});
  SPOTS.forEach(function(p,i){DR.push({k:'spot',i:i,x:p.x,y:p.y,d:p.x+p.y+(p.w+p.d)*.2})});
  GD.sort(function(a,b){return a.d-b.d});DR.sort(function(a,b){return a.d-b.d});
  CL=[];var rc=rng(555);for(var i=0;i<86;i++)CL.push({x:-14+rc()*56,y:-18+rc()*66,z:-3.2-rc()*3.2,s:.55+rc()*.55,p:rc()*6,f:rc()<.28,v:(rc()*3)|0});var rc2=rng(556);for(i=0;i<36;i++)CL.push({x:48+rc2()*30,y:4+rc2()*38,z:-3.2-rc2()*3.2,s:.55+rc2()*.55,p:rc2()*6,f:rc2()<.28,v:(rc2()*3)|0})}
function decSpr(k,v){var U=HW/46,key='d'+k+v;if(SC[key])return SC[key];try{var _X=window.TGD&&TGD.dec&&TGD.dec(k,v,CTX());if(_X)return _X}catch(e){console.error('TGD',e)}
  if(k==='pine')return spr(key,150*U,150*U,75*U,134*U,function(q){pineT(q,0,0,.8*U,v+1)});if(k==='sak')return spr(key,170*U,150*U,85*U,134*U,function(q){sakura(q,0,0,.8*U,v+3)});
  if(k==='lamp')return spr(key,50*U,86*U,25*U,74*U,function(q){lampB(q,.95*U)});if(k==='post')return spr(key,36*U,60*U,18*U,48*U,function(q){postB(q,U)});
  if(k==='rock')return spr(key,50*U,34*U,25*U,28*U,function(q){rockB(q,U,v+5)});return spr(key,44*U,50*U,22*U,44*U,function(q){cryB(q,U,v+9)})}
function cloudSpr(v){var U=HW/46;return spr('cl'+v,380*U,150*U,190*U,75*U,function(q){var r=rng(300+v*17);for(var i=0;i<26;i++){var x=(r()-.5)*260*U,y=(r()-.5)*44*U,rx=(34+r()*54)*U,ry=(14+r()*22)*U;q.fillStyle=rg(q,x,y,1,rx,[0,'rgba(210,220,255,.34)',.6,'rgba(170,185,240,.16)',1,'rgba(150,170,230,0)']);q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.fill()}},dG())}
/* ---------- camera, đi lại ---------- */
function camUpd(){ccx+=(hx-ccx)*.1;ccy+=(hy-ccy)*.1;OX=W/2-(ccx-ccy)*HW;OY=H*.6-(ccx+ccy)*HH}
function toast(t){TOAST={t:t,e:fr+150}}
var face=1,TGV=window.TGV={sx:0,sy:1};
function arrive(){if(pend>=0){var i=pend;pend=-1;act(i)}}
function act(i){var p=SPOTS[i];if(p.open&&typeof p.go==='function'){p.go();return}if(p.open&&p.id==='portal'){leave();return}showCard(i)}
/* ---------- vuốt để điều khiển (kéo ngón tay = đi theo hướng kéo; chạm nhanh = chạm-để-đi như cũ) ---------- */
var sw=null,SWT=10,SWR=56;
function swVec(){if(!sw||!sw.on)return null;var vx=sw.cx-sw.ax,vy=sw.cy-sw.ay,m=Math.hypot(vx,vy);if(m<8)return null;var wx=(vx/HW+vy/HH)/2,wy=(vy/HH-vx/HW)/2,L=Math.hypot(wx,wy)||1;return[wx/L,wy/L,Math.max(.4,Math.min(1,(m-8)/30))]}
function swDown(e){if(sw)return;sw={id:e.pointerId,x0:e.clientX,y0:e.clientY,ax:e.clientX,ay:e.clientY,cx:e.clientX,cy:e.clientY,on:0,ox:e.offsetX,oy:e.offsetY};try{c.setPointerCapture(e.pointerId)}catch(x){}}
function swMove(e){if(!sw||e.pointerId!==sw.id)return;if(!on){sw=null;return}sw.cx=e.clientX;sw.cy=e.clientY;
  if(!sw.on&&Math.hypot(sw.cx-sw.x0,sw.cy-sw.y0)>SWT){sw.on=1;path=[];pend=-1;mark=null;hideCard()}
  if(sw.on){var vx=sw.cx-sw.ax,vy=sw.cy-sw.ay,m=Math.hypot(vx,vy);if(m>SWR){sw.ax+=vx*(m-SWR)/m;sw.ay+=vy*(m-SWR)/m}try{e.preventDefault()}catch(x){}}}
function swUp(e){if(!sw||e.pointerId!==sw.id)return;var o=sw;sw=null;try{c.releasePointerCapture(e.pointerId)}catch(x){}if(on&&!o.on&&e.type==='pointerup')onTap({offsetX:o.ox,offsetY:o.oy})}
function swDraw(){if(!sw||!sw.on)return;var r=c.getBoundingClientRect(),ax=sw.ax-r.left,ay=sw.ay-r.top,vx=sw.cx-sw.ax,vy=sw.cy-sw.ay,m=Math.hypot(vx,vy)||1,k=Math.min(1,SWR/m),kx=ax+vx*k,ky=ay+vy*k;
  g.save();g.globalAlpha=.55;g.lineWidth=2;g.strokeStyle='rgba(190,230,255,.9)';g.fillStyle='rgba(120,160,255,.14)';g.beginPath();g.arc(ax,ay,SWR,0,TAU);g.fill();g.stroke();
  g.globalAlpha=.8;g.fillStyle='rgba(235,245,255,.85)';g.strokeStyle='rgba(120,160,255,.9)';g.beginPath();g.arc(kx,ky,17,0,TAU);g.fill();g.stroke();g.restore()}
function stepTG(){var kx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),ky=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),dx=0,dy=0,sp=CF.speed*(HW/46>.6?1:.8);
  var swv=swVec();if(swv)sp*=swv[2];
  if(swv){path=[];pend=-1;dx=swv[0];dy=swv[1]}
  else if(kx||ky){path=[];pend=-1;dx=kx+ky;dy=-kx+ky;var L=Math.hypot(dx,dy);dx/=L;dy/=L}
  else if(path.length){var T=path[0],ax=T[0]-hx,ay=T[1]-hy,d=Math.hypot(ax,ay);if(d<sp*1.3){hx=T[0];hy=T[1];path.shift();if(!path.length){moving=0;arrive()}}else{dx=ax/d;dy=ay/d}}
  else if(AM){dx=AM[0];dy=AM[1]}   /* Fix182: world/87 (auto) tự bay về phía quái; vuốt/phím/chạm vẫn ưu tiên hơn */
  if(dx||dy){var nx=hx+dx*sp,ny=hy+dy*sp;if(wk(nx,ny)){hx=nx;hy=ny}else if(wk(nx,hy))hx=nx;else if(wk(hx,ny))hy=ny;else{path=[];dx=dy=0}moving=(dx||dy)?1:0;if(moving){TGV.sx=(dx-dy)*2;TGV.sy=dx+dy}var sd=dx-dy;if(Math.abs(sd)>.05)face=sd>0?1:-1}else if(!path.length)moving=0;
  try{P.mv=moving;P.d=face}catch(e){}}
function onTap(e){var px=e.offsetX,py=e.offsetY;hideCard();var ord=SPOTS.map(function(p,i){return i}).sort(function(a,b){return SPOTS[b].x+SPOTS[b].y-SPOTS[a].x-SPOTS[a].y});
  for(var j=0;j<ord.length;j++){var k=ord[j],p=SPOTS[k],a=S2(p.x,p.y),v=bSpr(k,p),bx=a[0]-v.ax+v.w*.16,by=a[1]-v.ay+v.h*.1,bw=v.w*.68,bh=v.h*.84;if(px>=bx&&px<=bx+bw&&py>=by&&py<=by+bh){goSpot(k);return}}
  var w=W2(px,py),tp=nearest(w[0],w[1]);if(!tp)return;var r=route(hx,hy,tp[0],tp[1]);if(r){path=r;pend=-1;mark={x:tp[0],y:tp[1],t:fr}}}
function goSpot(k){var p=SPOTS[k],d=p.door,tp=nearest(d[0],d[1])||d;mark={x:tp[0],y:tp[1],t:fr};if(Math.hypot(hx-tp[0],hy-tp[1])<.7){act(k);return}var r=route(hx,hy,tp[0],tp[1]);if(r){path=r;pend=k}}
/* ---------- thẻ "tạm khoá" ---------- */
function hideCard(){if(card)card.style.display='none'}
function showCard(i){var p=SPOTS[i];if(!card){card=document.createElement('div');card.id='tg-card';card.style.cssText='position:fixed;left:50%;bottom:92px;transform:translateX(-50%);width:min(380px,88vw);box-sizing:border-box;background:linear-gradient(#1e1a48,#0c0a24);border:2px solid #b8a4ff;border-radius:14px;padding:12px 14px;color:#f2eaff;font:14px/1.5 KTH Serif,Songti SC,serif;z-index:28;box-shadow:0 8px 30px #000a,0 0 24px #8a6aff55;text-align:center;display:none';document.body.appendChild(card);card.addEventListener('pointerdown',function(e){e.stopPropagation()});card.addEventListener('click',function(e){if(e.target&&e.target.getAttribute('data-x'))hideCard()})}
  card.innerHTML='<div style="font-size:22px">'+p.e+' <b style="color:'+p.c+'">'+p.n+'</b></div><div style="opacity:.85;margin:2px 0 6px">'+p.sub+'</div><div>'+p.desc+'</div><div style="margin:9px 0;padding:6px 8px;border-radius:9px;background:rgba(150,120,255,.2);color:#ffe9a0">'+(p.lockMsg||'🔒 <b>Tạm khoá</b> — sắp mở trong các bản cập nhật tới')+'</div><button data-x="1" style="background:#5a3a9a;color:#fff;border:1px solid #c8b4ff;border-radius:8px;padding:5px 22px;font:inherit">Đóng</button>';card.style.display='block'}
/* ---------- vẽ ---------- */
var WARM=[];
function warmList(){WARM=[];var jobs=[];function add(d,f){jobs.push([d,f])}ISL.forEach(function(I){add(Math.hypot(I.cx-hx,I.cy-hy)-6,function(){islSpr(I)})});BRG.forEach(function(b,i){add(Math.hypot((b.x0+b.x1)/2-hx,(b.y0+b.y1)/2-hy)-3,function(){brgSpr(b,i)})});
  SPOTS.forEach(function(p,i){add(Math.hypot(p.x-hx,p.y-hy),function(){bSpr(i,p)})});DECB.forEach(function(p){add(Math.hypot(p.x-hx,p.y-hy),function(){bSpr(p.sid,p)})});
  var seen={};DR.forEach(function(o){if(o.k==='spot'||o.k==='deco')return;var key=o.k+(o.v||0);if(seen[key])return;seen[key]=1;add(Math.hypot(o.x-hx,o.y-hy)+4,function(){decSpr(o.k,o.v||0)})});[0,1,2].forEach(function(v){add(30,function(){cloudSpr(v)})});add(2,function(){skyCache()});
  jobs.sort(function(a,b){return a[0]-b[0]});WARM=jobs.map(function(j){return j[1]})}
function warmStep(){if(!WARM.length)return;var t0=performance.now();do{try{WARM.shift()()}catch(e){}}while(WARM.length&&performance.now()-t0<4)}
function ensure(){var k=[s.toFixed(3),DPR,W,H].join('|');if(k!==SK){SK=k;SC={};HW=46*s;HH=23*s;ZU=36*s;DECB=[];buildDraw();warmList()}}
function heroDraw(){var a=S2(hx,hy),ox=P.x,oc=cam,og=GY,os=s,K=CF.heroK;g.save();g.fillStyle='rgba(0,0,30,.4)';g.beginPath();g.ellipse(a[0],a[1],22*s*K,9*s*K,0,0,TAU);g.fill();g.restore();
  try{s=os*K;P.x=a[0]/s;cam=0;GY=a[1]-LFT()*s;try{if(typeof EP!=='undefined'&&EP){EP.x=P.x-50*(P.d||1)}try{window.TGCH&&TGCH.pet()}catch(e){}drawEP()}catch(e){}try{window.TGCH&&TGCH.pre()}catch(e){}hero();nameTag()}finally{s=os;P.x=ox;cam=oc;GY=og}}
function lines(x0,y0,x1,y1,z,k){var a=S2(x0,y0),b=S2(x1,y1);g.beginPath();g.moveTo(a[0],a[1]-z*ZU);g.lineTo(b[0],b[1]-z*ZU);g.stroke()}
function drawTG(){ensure();var t=fr,i,j,sk=skyCache(),ql=(typeof QL!=='undefined'?QL:0)|0,cb=[22,9,3][Math.min(2,ql)],cf=[8,3,0][Math.min(2,ql)],nb=0,nf=0;camUpd();
  g.drawImage(sk.c,-(sk.w-W)/2-(ccx-ccy)*HW*.012,-(sk.h-H)*.35-(ccx+ccy)*HH*.008,sk.w,sk.h);
  if(ql<1){g.save();g.globalCompositeOperation='lighter';for(i=0;i<26;i++){var tx=(i*173.3)%W,ty=(i*97.7)%(H*.55);g.globalAlpha=.25+.35*Math.sin(t*.04+i*2.1);g.fillStyle='#fff';g.beginPath();g.arc(tx,ty,1.3,0,TAU);g.fill()}g.restore();
  ribbons(t)}
  var cl0=cloudSpr(0),cls=[cloudSpr(0),cloudSpr(1),cloudSpr(2)];
  for(i=0;i<CL.length&&nb<cb;i++){var c=CL[i];if(c.f)continue;var a=S2(c.x+Math.sin(t*.004+c.p)*1.2,c.y),sp=cls[c.v];var cy0=a[1]-c.z*ZU;if(a[0]+sp.w*c.s*.5<0||a[0]-sp.w*c.s*.5>W||cy0+sp.h*c.s*.5<0||cy0-sp.h*c.s*.5>H)continue;nb++;g.globalAlpha=.8;g.save();g.translate(a[0],a[1]-c.z*ZU);g.scale(c.s,c.s);g.drawImage(sp.c,-sp.ax,-sp.ay,sp.w,sp.h);g.restore()}g.globalAlpha=1;
  for(j=0;j<GD.length;j++){var it=GD[j],q0;if(it.k==='isl'){var I=ISL[it.i],v=islSpr(I),ap=S2(I.cx,I.cy);if(ap[0]+v.w<0||ap[0]-v.ax>W||ap[1]-v.ay>H+400||ap[1]+v.h<-300)continue;blit(v,ap[0],ap[1])}else{var b=BRG[it.i],v2=brgSpr(b,it.i),ap2=S2(b.x0,b.y0);blit(v2,ap2[0],ap2[1])}}
  try{if(window.TGD&&TGD.under)TGD.under(fr,CTX())}catch(e){console.error('TGD',e)}
  var hd=hx+hy,drawn=false,OT=(window.CITYOL&&CITYOL.tgList)?CITYOL.tgList():null,oi=0;
  function fl(lim){while(OT&&oi<OT.length&&OT[oi].d<lim)CITYOL.tgDraw(OT[oi++],S2,s,CF.heroK)}
  g.save();g.lineCap='round';g.lineWidth=Math.max(2.4,HW*.07);
  for(j=0;j<DR.length;j++){var o=DR[j];fl(drawn?o.d:Math.min(o.d,hd));if(!drawn&&o.d>hd){heroDraw();drawn=true}var a3=S2(o.x,o.y);if(a3[0]<-260||a3[0]>W+260||a3[1]<-260||a3[1]>H+300)continue;
    if(o.k==='post'){var vp=decSpr('post',0);g.strokeStyle='rgba(222,228,244,.95)';if(o.pv){var nb=S2(o.pv[0],o.pv[1]);g.beginPath();g.moveTo(a3[0],a3[1]-.8*ZU);g.lineTo(nb[0],nb[1]-.8*ZU);g.moveTo(a3[0],a3[1]-.45*ZU);g.lineTo(nb[0],nb[1]-.45*ZU);g.stroke()}blit(vp,a3[0],a3[1])}
    else if(o.k==='spot'){var p=SPOTS[o.i],vs=bSpr(o.i,p),fd=false;/* Fix163: nhân vật đứng sau cổng chiến cảnh → cổng mờ đi để vẫn thấy nhân vật */if(drawn&&p.k==='wargate'){var ha=S2(hx,hy),lx=ha[0]-(a3[0]-vs.ax),ly=ha[1]-(a3[1]-vs.ay);fd=lx>vs.w*.1&&lx<vs.w*.9&&ly>0&&ly<vs.h}if(fd)g.globalAlpha=.4;blit(vs,a3[0],a3[1]);if(fd)g.globalAlpha=1}else if(o.k==='deco'){var dp=DECB[o.i];blit(bSpr(dp.sid,dp),a3[0],a3[1])}else blit(decSpr(o.k,o.v||0),a3[0],a3[1])}
  g.restore();if(!drawn){fl(hd);heroDraw()}fl(1e9);
  fxPass(t);try{if(window.TGD&&TGD.fx)TGD.fx(t,CTX())}catch(e){console.error('TGD',e)}
  g.globalAlpha=.55;for(i=0;i<CL.length&&nf<cf;i++){var c2=CL[i];if(!c2.f)continue;var a4=S2(c2.x+Math.sin(t*.005+c2.p)*1.6,c2.y),sp2=cls[c2.v];if(a4[0]+sp2.w*c2.s*.7<0||a4[0]-sp2.w*c2.s*.7>W||a4[1]+ZU*1.6+sp2.h*c2.s*.5<0||a4[1]+ZU*1.6-sp2.h*c2.s*.5>H)continue;nf++;g.save();g.translate(a4[0],a4[1]+ZU*1.6);g.scale(c2.s*1.2,c2.s*.8);g.drawImage(sp2.c,-sp2.ax,-sp2.ay,sp2.w,sp2.h);g.restore()}g.globalAlpha=1;
  if(mark&&fr-mark.t<40){var m=S2(mark.x,mark.y),u=(fr-mark.t)/40;g.save();g.strokeStyle='rgba(180,255,255,'+(1-u)+')';g.lineWidth=2;g.beginPath();g.ellipse(m[0],m[1],(10+26*u)*s,(5+13*u)*s,0,0,TAU);g.stroke();g.restore()}
  if(TOAST&&fr<TOAST.e){var al=Math.min(1,(TOAST.e-fr)/30);g.save();g.globalAlpha=al;g.font='bold '+(16*s)+'px '+FONT;g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000b';g.fillStyle='#fff0b8';g.strokeText(TOAST.t,W/2,H*.2);g.fillText(TOAST.t,W/2,H*.2);g.restore()}
  swDraw();warmStep()}
function walkish(x,y){return BRG.some(function(b){return x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1})}
function ribbons(t){g.save();g.globalCompositeOperation='lighter';g.lineCap='round';[[.2,'200,140,255'],[.6,'255,210,150']].forEach(function(r,k){var y0=H*r[0]+Math.sin(t*.01+k)*14*s;g.strokeStyle='rgba('+r[1]+',.35)';g.lineWidth=3*s;g.beginPath();for(var i=0;i<=24;i++){var x=(i/24)*W*1.1-W*.05+((t*.15*(k?-1:1))%40),y=y0+Math.sin(i*.5+t*.02+k*2)*22*s+i*3*s*(k?-1:1);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()});g.restore()}
function fxPass(t){var i;g.save();g.globalCompositeOperation='lighter';
  DR.forEach(function(o){if(o.k!=='lamp'&&!(o.k==='post'&&o.lamp))return;var a=S2(o.x,o.y);if(a[0]<-80||a[0]>W+80||a[1]<-80||a[1]>H+120)return;var yy=o.k==='lamp'?a[1]-40*(HW/46):a[1]-34*(HW/46);gl(a[0],yy,(o.k==='lamp'?46:34)*(HW/46),'255,190,100',.38+.1*Math.sin(t*.1+o.x))});
  SPOTS.forEach(function(p,k){var a=S2(p.x,p.y);if(a[0]<-300||a[0]>W+300||a[1]<-300||a[1]>H+300)return;if(p.id!=='portal')gl(a[0],a[1]-p.z*ZU*.38,(p.w+p.d)*HW*.62,p.open?(p.rgb||'160,130,255'):'255,190,110',.12+.05*Math.sin(t*.06+k));
    if(!p.open){g.save();g.translate(a[0],a[1]);g.transform(HW,HH,-HW,HH,0,0);var rr=Math.max(p.w,p.d)/2+.75;g.strokeStyle='rgba(140,200,255,'+(.45+.2*Math.sin(t*.07+k))+')';g.lineWidth=.07;g.setLineDash([.35,.28]);g.lineDashOffset=-t*.02;g.beginPath();g.ellipse(0,0,rr*(p.w/Math.max(p.w,p.d)*.5+.55),rr*(p.d/Math.max(p.w,p.d)*.5+.55),0,0,TAU);g.stroke();g.setLineDash([]);g.restore()}
    else if(p.id==='portal'||p.k==='wargate')portalFx(p,a,t)});
  g.restore();
  SPOTS.forEach(function(p,k){var a=S2(p.x,p.y);if(a[0]<-120||a[0]>W+120||a[1]-(p.z||6)*ZU*.55<-40||a[1]-(p.z||6)*ZU*.55>H+40)return;var ty=a[1]-(p.z||6)*ZU-ZU*.6+Math.sin(t*.05+k)*3*s;g.save();g.textAlign='center';g.textBaseline='alphabetic';g.font='bold '+(13*s)+'px '+FONT;g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle=p.c;g.strokeText(p.e+' '+p.n,a[0],ty);g.fillText(p.e+' '+p.n,a[0],ty);
    g.font='bold '+(11*s)+'px '+FONT;g.fillStyle=p.open?'#9ff0b0':'#ffe9a0';var sub=p.open?(p.sub2||'chạm để về Linh Giới'):(p.lock2||'🔒 Tạm khoá');g.strokeText(sub,a[0],ty+14*s);g.fillText(sub,a[0],ty+14*s);g.restore()});
  g.save();g.globalCompositeOperation='lighter';for(i=0;i<[18,7,0][Math.min(2,(typeof QL!=='undefined'?QL:0)|0)];i++){var px=((i*131+t*(.5+i%3*.3))%(W+60))-30,py=((i*71+t*(.7+i%4*.2))%(H+40))-20;g.globalAlpha=.7;g.fillStyle=i%2?'#ffc0d8':'#fff0f8';g.beginPath();g.ellipse(px,py,3.4*s,1.8*s,t*.04+i,0,TAU);g.fill()}g.restore()}
function portalFx(p,a,t){var w=p.w,x0=-w/2,y1=p.d/2+.45,pp=ip(x0,y1,.34),cu=w/2,cz=2.45;g.save();g.translate(a[0],a[1]);g.transform(HW,HH,0,-ZU,pp[0],pp[1]);g.beginPath();g.ellipse(cu,cz,w*.4,1.5,0,0,TAU);g.clip();
  for(var j=0;j<6;j++){g.strokeStyle='rgba(255,255,255,'+(.18+.08*(j%3))+')';g.lineWidth=.06;g.beginPath();g.ellipse(cu,cz,.15+j*.14,.3+j*.2,t*.03*(j%2?1:-1)+j,0,4.4);g.stroke()}
  g.fillStyle=rg(g,cu,cz,.05,1.4,[0,(p.fx&&p.fx[0])||'rgba(220,200,255,.65)',1,(p.fx&&p.fx[1])||'rgba(120,80,255,0)']);g.fillRect(cu-2,cz-2,4,4);for(j=0;j<10;j++){var an=t*.03+j*.63,rr=.2+(j*.11%1.2);g.fillStyle='rgba(200,230,255,.85)';g.beginPath();g.arc(cu+Math.cos(an*(j%2?1:-1))*rr*.9,cz+Math.sin(an*(j%2?1:-1))*rr*1.1,.035,0,TAU);g.fill()}g.restore()}
/* ---------- cổng Thiên Môn trong Thành Thị Linh Giới ---------- */
var pendGate=0;
function cityGate(){var r=36*s,y=Math.max(r*2.5,GY-(typeof PORT!=='undefined'&&PORT?410:296)*s);return{x:W*.5,y:y,r:r}}
function drawCityGate(){var G=cityGate(),t=fr,x=G.x,y=G.y,r=G.r;g.save();g.translate(x,y);
  g.globalCompositeOperation='lighter';gl(0,0,r*3.4,'150,180,255',.34+.1*Math.sin(t*.05));g.globalCompositeOperation='source-over';
  for(var k=0;k<5;k++){var cx2=Math.sin(t*.012+k*1.7)*r*1.4,cy2=r*.95+k%2*10*s;g.fillStyle='rgba(215,225,255,.5)';g.beginPath();g.ellipse(cx2,cy2,r*(1.1-k*.08),r*.2,0,0,TAU);g.fill()}
  [-1,1].forEach(function(d){g.fillStyle=lg(g,d*r,-r*1.2,d*r,r*.9,[0,'#fff6d0',.5,'#e8d8a0',1,'#a08850']);g.fillRect(d*r*1.02-r*.1,-r*1.2,r*.2,r*2.05);g.fillStyle='#ffe28a';g.fillRect(d*r*1.02-r*.16,-r*1.26,r*.32,r*.1);g.beginPath();g.moveTo(d*r*1.02-r*.2,-r*1.26);g.quadraticCurveTo(d*r*1.02,-r*1.58,d*r*1.02+r*.2,-r*1.26);g.fill()});
  g.fillStyle='#e8c050';g.fillRect(-r*1.22,-r*1.2,r*2.44,r*.14);g.fillStyle='#8a1e18';g.fillRect(-r*1.18,-r*1.06,r*2.36,r*.08);
  g.beginPath();g.ellipse(0,-r*.2,r*.92,r*1.0,0,0,TAU);g.save();g.clip();g.fillStyle=rg(g,0,-r*.2,2,r,[0,'#e8e0ff',.4,'#7a5ae8',.85,'#241a78',1,'#0c0a30']);g.fillRect(-r,-r*1.3,r*2,r*2.2);
  for(var j=0;j<6;j++){g.strokeStyle='rgba(255,255,255,'+(.2+.08*(j%3))+')';g.lineWidth=2*s;g.beginPath();g.ellipse(0,-r*.2,r*(.12+j*.14),r*(.2+j*.15),t*.03*(j%2?1:-1)+j,0,4.4);g.stroke()}g.restore();
  g.strokeStyle='#ffe28a';g.lineWidth=3*s;g.beginPath();g.ellipse(0,-r*.2,r*.92,r*1.0,0,0,TAU);g.stroke();g.strokeStyle='rgba(150,240,255,.8)';g.lineWidth=1.4*s;g.beginPath();g.ellipse(0,-r*.2,r*.82,r*.9,0,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';for(j=0;j<8;j++){var an=t*.02+j*.78;g.fillStyle='rgba(200,230,255,.9)';g.beginPath();g.arc(Math.cos(an)*r*1.12,-r*.2+Math.sin(an)*r*1.2,2.2*s,0,TAU);g.fill()}g.globalCompositeOperation='source-over';
  g.textAlign='center';g.font='bold '+(15*s)+'px '+FONT;g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle='#d8e8ff';g.strokeText('☁️ '+CF.gateName,0,-r*1.74-14*s);g.fillText('☁️ '+CF.gateName,0,-r*1.74-14*s);g.font='bold '+(11*s)+'px '+FONT;g.fillStyle='#ffe9a0';g.strokeText('chạm để vào',0,-r*1.74);g.fillText('chạm để vào',0,-r*1.74);g.restore()}
/* ---------- vào / ra ---------- */
function enter(){if(!started||!vil||on)return;if(CF.needDao&&!(window.HDAO&&HDAO.on())){try{DT.push({x:P.x,y:200,s:'🔒 Cần Đạo Thể',g:1,l:120})}catch(e){}return}
  try{if(LCT.on())LCT.leave()}catch(e){}try{if(bo)tg()}catch(e){}sw=null;on=true;hx=14;hy=37.8;ccx=14;ccy=35;path=[];pend=-1;face=-1;moving=0;TGV.sx=0;TGV.sy=1;try{vt=null;vgo=-1;mvDir=0;P.atk=0;P.pe=null;P.hp=mx();P.mp=mm()}catch(e){}toast('☁️ Đến Thành Thị Tiên Giới · vuốt để di chuyển')}
function leave(){if(!on)return;on=false;sw=null;path=[];pend=-1;hideCard();try{LCT.enter()}catch(e){}}
/* ---------- ô cổng trong Thành Thị Linh Giới: dùng ô "Hư Không Truyền Tống" (đang tạm khoá) làm lối vào Tiên Giới ---------- */
var GT=null;try{(LCT.gates||[]).forEach(function(gt){if(!GT&&!gt.open&&/Hư Không/.test((gt.n||'')+(gt.sn||'')))GT=gt});if(GT){GT.sn='Tiên Giới';GT.n='Tiên Giới Thiên Môn';GT.e='☁️';GT.c='#bfe4ff';GT.rgb='150,200,255';GT.sub='Thành Thị Tiên Giới · chạm để vào';GT.open=1;GT.go=function(){enter()}}}catch(e){GT=null}
/* ---------- hook ---------- */
var _vd=vdraw,_vs=vstep,_st=step;
vdraw=function(){if(on){drawTG();return}var r=_vd.apply(this,arguments);try{if(!GT&&started&&LCT.on()&&!bo)drawCityGate()}catch(e){}return r};
vstep=function(){if(on){stepTG();return}var r=_vs.apply(this,arguments);try{if(pendGate){if(!LCT.on())pendGate=0;else if(typeof mvDir!=='undefined'&&mvDir)pendGate=0;else if(vt==null){pendGate=0;var G=cityGate();if(Math.abs(P.x*s-G.x)<30*s)enter()}}}catch(e){}return r};
step=function(){if(on&&(!vil||!started||(typeof bo!=='undefined'&&bo)))on=false;return _st.apply(this,arguments)};
if(typeof ng==='function'){var _ng=ng;ng=function(){on=false;sw=null;pendGate=0;hideCard();return _ng.apply(this,arguments)}}
window.addEventListener('pointerdown',function(e){try{if(e.target!==c)return;if(on){e.stopImmediatePropagation();e.stopPropagation();if(window.CITYOL&&CITYOL.tap&&CITYOL.tap(e.offsetX,e.offsetY))return;swDown(e);return}
  if(!GT&&started&&vil&&!bo&&LCT.on()){var G=cityGate();if(Math.abs(e.offsetX-G.x)<G.r*1.25&&e.offsetY>G.y-G.r*1.7&&e.offsetY<G.y+G.r*2){e.stopImmediatePropagation();e.stopPropagation();pendGate=1;vt=cl(G.x/s,40,vw()-40);vgo=-1;gateGo=0;return}pendGate=0}}catch(x){}},true);
window.addEventListener('pointermove',swMove,true);window.addEventListener('pointerup',swUp,true);window.addEventListener('pointercancel',swUp,true);
window.addEventListener('keydown',function(e){if(!on)return;var tg0=e.target&&e.target.tagName;if(tg0==='INPUT'||tg0==='TEXTAREA')return;var k=(e.key||'').toLowerCase();if('wasd'.indexOf(k)>=0&&k.length==1||k.indexOf('arrow')==0){keys[k]=1;if(k.indexOf('arrow')==0)e.preventDefault()}},true);
window.addEventListener('keyup',function(e){var k=(e.key||'').toLowerCase();delete keys[k]},true);
try{var vlb=document.getElementById('vl'),_ov=vlb&&vlb.onpointerdown;if(vlb)vlb.onpointerdown=function(e){if(on){e.stopPropagation();if(started)leave();return}return _ov&&_ov.call(this,e)}}catch(e){}
try{var _ft=g.fillText,_stk=g.strokeText;g.fillText=function(a,x,y,m){if(on&&a==='Thanh Vân Tiên Thôn')a='Thành Thị Tiên Giới';return _ft.call(this,a,x,y,m)};g.strokeText=function(a,x,y,m){if(on&&a==='Thanh Vân Tiên Thôn')a='Thành Thị Tiên Giới';return _stk.call(this,a,x,y,m)}}catch(e){}
function CTX(){return{HW:HW,HH:HH,ZU:ZU,s:s,TAU:TAU,rng:rng,lg:lg,rg:rg,ip:ip,GR:GR,FY:FY,FX:FX,box:box,fq:fq,mixc:mixc,roof:roof,walls:walls,hallB:hallB,spr:spr,mkc:mkc,dG:dG,S2:S2,W2:W2,gl:gl,g:g,ISL:ISL,BRG:BRG,SPOTS:SPOTS,ground:ground,walk:walk,inPoly:inPoly,near2:near2,SC:SC,W:W,H:H,fr:fr,on:on,hx:hx,hy:hy,ql:(typeof QL!=='undefined'?QL:0)|0}}
window.TG={ctx:CTX,autoMove:function(v){AM=v&&v.length?v:null},ground:ground,blocked:blocked,S2:S2,flyHook:function(f,l){FLYF=f;LFTF=l},gateSlot:function(){return GT},pos:function(k){var a=S2(SPOTS[k].x,SPOTS[k].y);return[a[0],a[1],SPOTS[k].z*ZU]},hero:function(){return[hx,hy]},card:function(){return card&&card.style.display==='block'},dbg:function(k){ensure();var v=bSpr(k,SPOTS[k]);return v.c.toDataURL('image/png')},on:function(){return on},enter:enter,leave:leave,spots:SPOTS,CF:CF,set:function(x,y){hx=x;hy=y;ccx=x;ccy=y},gate:cityGate};
})();
