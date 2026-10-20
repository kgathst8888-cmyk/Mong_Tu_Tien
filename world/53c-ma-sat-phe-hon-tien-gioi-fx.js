/* ===== 🖐️ MA SÁT PHỆ HỒN · BẢN VẼ CHO TIÊN GIỚI 2.5D (world/53c-ma-sat-phe-hon-tien-gioi-fx.js) — nạp SAU world/88 =====
 * Thành Thị Tiên Giới (world/61, mặt đất isometric 2:1) dùng hệ thi triển riêng của world/79: bấm nút → fire(it) → recipe R.ycL(F) vẽ + TGQ.cast gây sát thương.
 * Module này CHỈ thay phần vẽ của R.ycL cho Ma Đạo (F.ma): vẽ theo toạ độ chéo, bám đúng vị trí quái Tiên Giới (TGQ.mon) và đúng vùng đánh của world/81
 * (hành lang phía trước nhân vật: D∈(-40,560), |L|<104). KHÔNG đụng sát thương / MP / hồi chiêu / TGQ.cast / trạng thái world/50.
 * Các lớp (≈3 giây, 18 nhịp × 10 khung như bản 2D):
 *   LỚP MẶT ĐẤT (vẽ sau nền thành thị, dưới lớp bàn tay): tối nhẹ màn hình · dải hành lang tím-đỏ báo vùng đánh · nứt đất đỏ · pháp trận 2 vành + phù văn + bát quái + Thái Cực xoay · oán hồn bay lên
 *   LỚP TRÊN: khói đen · bùa chú đỏ lơ lửng · bàn tay quỷ mọc quanh từng quái trong vùng + rải trong hành lang (xếp theo độ sâu) · tia ma khí từ nhân vật tới quái
 *                            · sét tím · dấu trúng đòn lên quái (loé tím-đỏ, gai, vòng đất) · dòng hút máu quái → nhân vật
 * Nhánh Map Treo / bản đồ 2D: R.ycL của Ma Đạo trả bản vẽ rỗng (world/53b đã vẽ), tránh vẽ chồng 3 vệt vuốt cũ lên hiệu ứng mới. Tiên Đạo giữ nguyên.
 * Chỉnh: MDTG.cfg.q (0.35–1) · MDTG.cfg.enable=false → hiệu ứng cũ (R.ycL gốc). Máy yếu tự giảm (L.slow()). Phụ thuộc: world/53 (YCFXLIB), 53b (MDFX.H), 79 (TG8SK.R), 81 (TGQ.mon), 61 (TG.S2/hero/on). Thiếu → không làm gì. */
(function(){
'use strict';
var L=window.YCFXLIB,M=window.MDFX;
if(!L||!M||!M.H||!window.TG8SK||!TG8SK.R||!TG8SK.R.ycL||!window.TG||!TG.S2||!window.TGQ||typeof hero!=='function'||typeof g==='undefined'||typeof cam==='undefined')return;
var R=TG8SK.R,orig=R.ycL,H=M.H,blob=L.blob,hs=L.hs,easeO=L.easeO,rnd=L.rnd,PI=Math.PI,TAU=PI*2;
var CFG={enable:true,q:1},LIFE=205,EF=[],RG={d0:-40,d1:560,l:104},gF=-1,tF=-1,K={};   /* K: bộ vẽ của các loại hiệu ứng khác (world/53e: 'dn','vn') — e.K chọn bộ vẽ, không có K → Ma Sát Phệ Hồn */
function Q(){return Math.max(.35,Math.min(1,CFG.q*(L.slow()?.5:1)))}
function tgOn(){try{return !!TG.on()}catch(e){return false}}
function org(){return[(P.x-cam)*s,GY]}
function mons(){try{return TGQ.mon.filter(function(m){return m.hp>0&&!m.dead&&!m.gone})}catch(e){return[]}}
function off(e,D,Lt){var u=D*e.c-Lt*e.sn,v=D*e.sn+Lt*e.c;return[u*s,.5*v*s]}
function mrel(e,m){var h=TG.hero(),a=TG.S2(m.x,m.y),b=TG.S2(h[0],h[1]),dx=a[0]-b[0],dy=a[1]-b[1],u=dx/s,v=2*dy/s;return{D:u*e.c+v*e.sn,L:-u*e.sn+v*e.c,dx:dx,dy:dy}}
function inR(r){return r.D>RG.d0&&r.D<RG.d1&&Math.abs(r.L)<RG.l}
function mpos(e,m){var r=mrel(e,m),o=org();return[o[0]+r.dx,o[1]+r.dy]}
function chest(m,pos){return pos[1]-((m.z||0)+(m.hh||60)*.35)*s}

/* ---------- tạo hiệu ứng ---------- */
function mkCracks(e){var n=Math.round(14*Q()),out=[],i,k;
 for(i=0;i<n;i++){var a=(hs(i*3.1+e.t0)-.5)*1.5,len=200+hs(i+7)*340,pts=[[hs(i)*60,(hs(i+2)-.5)*50]];
  for(k=1;k<=7;k++){var u=k/7;pts.push([pts[0][0]+Math.cos(a)*len*u+(hs(i*9+k)-.5)*26,pts[0][1]+Math.sin(a)*len*u*.9+(hs(i*5+k)-.5)*26])}out.push(pts)}
 for(i=0;i<6;i++){var b=i/6*TAU,ln=110+hs(i+40)*70,p2=[[0,0]];for(k=1;k<=5;k++)p2.push([Math.cos(b)*ln*k/5+(hs(i*7+k)-.5)*14,Math.sin(b)*ln*k/5+(hs(i*3+k)-.5)*14]);out.push(p2)}
 return out}
function start(F){
 while(EF.length>=2)EF.shift();
 var e={t0:fr,A:F.f.A,c:F.f.c,sn:F.f.sn,hands:[],hits:[],rays:[],bolts:[],drains:[],lastW:-1,tal:[],gF:-1,tF:-1};
 e.cr=mkCracks(e);
 var N=Math.round(9*Q()),i;for(i=0;i<N;i++)e.tal.push({D:60+hs(i*3.1+1)*460,L:(hs(i*2.3+9)<.5?-1:1)*(40+hs(i+5)*90),h:60+hs(i+2)*130,d:hs(i+5)*.1});
 EF.push(e);try{L.flash('#7a40c0',4)}catch(x){}}

/* ---------- mỗi nhịp 10 khung (18 nhịp) ---------- */
function addHand(e,o){var cap=Math.round(12*Q());e.hands=e.hands.filter(function(h){return fr-h.t0<h.life});if(e.hands.length>=cap)return;
 o.t0=fr;o.life=58;o.fn=L.handDraw(o.sc,Math.floor(rnd(0,1000)));if(o.fn)e.hands.push(o)}
function wave(e,w){
 var Qn=Q(),ms=mons().map(function(m){return{m:m,r:mrel(e,m)}}).filter(function(x){return inR(x.r)}),i;
 ms.slice(0,Math.max(1,Math.round(3*Qn))).forEach(function(x){
  addHand(e,{m:x.m,jx:rnd(-24,24),jy:rnd(-8,8),sc:rnd(.8,1.25)});
  if(w%2===0)e.hits.push({m:x.m,t0:fr,sd:x.m.id||w})});
 var n=Math.max(1,Math.round(2*Qn));for(i=0;i<n;i++)addHand(e,{D:rnd(30,520),Lt:rnd(-100,100),sc:rnd(.55,1.1)});
 if(w%2===0&&ms.length)e.rays.push({m:ms[(w/2)%ms.length|0].m,t0:fr,sd:w});
 if(w%3===1&&Qn>=.6){var pts=[],k;for(k=0;k<=8;k++)pts.push([k&&k<8?(rnd(-.5,.5))*60:0,k/8]);e.bolts.push({D:rnd(60,500),Lt:rnd(-90,90),t0:fr,pts:pts,br:2+Math.floor(rnd(0,3)),bs:(rnd(0,1)<.5?-1:1)*rnd(40,90)})}
 if(w%4===1&&ms.length)e.drains.push({m:ms[0].m,t0:fr})}

/* ---------- lớp MẶT ĐẤT ---------- */
function ground(e){
 var t=fr-e.t0,p=t/LIFE,a=p<.05?p/.05:p>.9?(1-p)/.1:1,gr=easeO(p/.1),o=org(),X=o[0],Y=o[1],pul=.65+.35*Math.sin(fr*.22),i,k,j;
 g.save();
 g.globalCompositeOperation='source-over';g.globalAlpha=.3*a;g.fillStyle='#12031f';g.fillRect(0,0,W,H);g.globalAlpha=1;
 g.globalCompositeOperation='lighter';
 /* dải hành lang = vùng đánh thật */
 var d0=RG.d0+40,c0=off(e,d0,-RG.l),c1=off(e,RG.d1,-RG.l),c2=off(e,RG.d1,RG.l),c3=off(e,d0,RG.l),far=off(e,RG.d1,0),rv=Math.min(1,p/.12);
 /* nền thành thị rất sáng → trải lớp tím sẫm (source-over) bên dưới để ánh sáng cộng nổi lên */
 g.globalCompositeOperation='source-over';
 var dk=g.createLinearGradient(X,Y,X+far[0]*rv,Y+far[1]*rv);dk.addColorStop(0,'rgba(34,8,64,'+.62*a+')');dk.addColorStop(1,'rgba(60,10,50,0)');
 g.fillStyle=dk;g.beginPath();g.moveTo(X+c0[0],Y+c0[1]);g.lineTo(X+c0[0]+(c1[0]-c0[0])*rv,Y+c0[1]+(c1[1]-c0[1])*rv);g.lineTo(X+c3[0]+(c2[0]-c3[0])*rv,Y+c3[1]+(c2[1]-c3[1])*rv);g.lineTo(X+c3[0],Y+c3[1]);g.closePath();g.fill();
 g.beginPath();g.ellipse(X,Y-3*s,190*s*gr,95*s*gr,0,0,TAU);g.fillStyle='rgba(26,6,52,'+.45*a+')';g.fill();
 g.globalCompositeOperation='lighter';
 var lg=g.createLinearGradient(X,Y,X+far[0]*rv,Y+far[1]*rv);lg.addColorStop(0,'rgba(170,70,255,'+.34*a+')');lg.addColorStop(1,'rgba(255,40,100,'+.06*a+')');
 g.fillStyle=lg;g.beginPath();g.moveTo(X+c0[0],Y+c0[1]);g.lineTo(X+c0[0]+(c1[0]-c0[0])*rv,Y+c0[1]+(c1[1]-c0[1])*rv);g.lineTo(X+c3[0]+(c2[0]-c3[0])*rv,Y+c3[1]+(c2[1]-c3[1])*rv);g.lineTo(X+c3[0],Y+c3[1]);g.closePath();g.fill();
 g.strokeStyle='rgba(255,60,120,'+.5*a*pul+')';g.lineWidth=2*s;g.setLineDash([14*s,10*s]);g.lineDashOffset=-fr*.6;
 g.beginPath();g.moveTo(X+c0[0],Y+c0[1]);g.lineTo(X+c0[0]+(c1[0]-c0[0])*rv,Y+c0[1]+(c1[1]-c0[1])*rv);g.moveTo(X+c3[0],Y+c3[1]);g.lineTo(X+c3[0]+(c2[0]-c3[0])*rv,Y+c3[1]+(c2[1]-c3[1])*rv);g.stroke();g.setLineDash([]);
 blob(X,Y-4*s,230*s,'120,40,220',.34*a);blob(X,Y-4*s,120*s,'255,40,100',.26*a*pul);
 for(i=1;i<=4;i++){var mp=off(e,RG.d1*i/5*rv,0);blob(X+mp[0],Y+mp[1],110*s,'140,50,230',.2*a)}
 /* nứt đất */
 var crv=Math.min(1,p/.2),ck=.55+.45*Math.sin(fr*.3);g.lineCap='round';g.lineJoin='round';
 for(i=0;i<e.cr.length;i++){var pts=e.cr[i],n=Math.max(2,Math.round(pts.length*crv)),pass;
  for(pass=0;pass<2;pass++){g.strokeStyle=pass?'rgba(255,170,200,'+.8*a*ck+')':'rgba(255,30,90,'+.5*a+')';g.lineWidth=(pass?1.4:5)*s;g.beginPath();
   for(k=0;k<n;k++){var q=off(e,pts[k][0],pts[k][1]);k?g.lineTo(X+q[0],Y+q[1]):g.moveTo(X+q[0],Y+q[1])}g.stroke()}}
 /* pháp trận dưới chân */
 g.translate(X,Y-3*s);g.scale(1,.5);
 var Ro=170*s*gr,Rm=124*s*gr,Ri=62*s*gr;
 g.save();g.rotate(fr*.011);H.ring(Ro,6*s,'#9a50ff',.85*a);H.ring(Ro*1.045,2*s,'#ff2a6a',.7*a);H.ring(Ro*.93,2*s,'#e8c8ff',.55*a);
 g.strokeStyle='#f0d8ff';g.lineWidth=1.8*s;g.globalAlpha=.85*a*pul;
 for(i=0;i<24;i++){g.save();g.rotate(i/24*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);H.glyph(i*3.7,13*s);g.restore()}g.restore();
 g.save();g.rotate(-fr*.016);H.ring(Rm,4.5*s,'#c070ff',.8*a);H.ring(Rm*.88,1.6*s,'#ff5a8a',.6*a);
 g.strokeStyle='#ffd0e8';g.lineWidth=3*s;g.globalAlpha=.9*a;
 for(i=0;i<8;i++){g.save();g.rotate(i/8*TAU);for(j=0;j<3;j++){var rr=Rm*(.64+j*.08),br=hs(i*3+j)>.5;g.beginPath();
   if(br){g.arc(0,0,rr,-.2,-.05);g.moveTo(Math.cos(.05)*rr,Math.sin(.05)*rr);g.arc(0,0,rr,.05,.2)}else g.arc(0,0,rr,-.2,.2);g.stroke()}g.restore()}g.restore();
 g.save();g.rotate(fr*.02);g.strokeStyle='#d8a8ff';g.lineWidth=2.2*s;g.globalAlpha=.7*a;g.beginPath();
 for(i=0;i<=8;i++){var an=i*(TAU/8)*3%TAU,xx=Math.cos(an)*Ri*1.35,yy=Math.sin(an)*Ri*1.35;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke();g.restore();
 H.ring(Ri*1.2,3.6*s,'#ff2a6a',.65*a*pul);
 g.globalCompositeOperation='source-over';H.yinyang(Ri,fr*.03,.62*a);
 g.restore()}

/* ---------- lớp TRÊN ---------- */
function talis(e,a,p){var o=org(),i;
 for(i=0;i<e.tal.length;i++){var T=e.tal[i],rs=easeO((p-T.d)/.1);if(rs<=0)continue;
  var q=off(e,T.D,T.L),x=o[0]+q[0]+Math.sin(fr*.03+i*2)*8*s,y=o[1]+q[1]-(T.h*rs+Math.sin(fr*.04+i)*7)*s,w=14*s,h=44*s;
  g.save();g.translate(x,y);g.rotate(Math.sin(fr*.035+i)*.14);
  g.globalCompositeOperation='lighter';blob(0,0,32*s,'255,40,90',.4*a);
  g.globalCompositeOperation='source-over';g.globalAlpha=a;
  var gd=g.createLinearGradient(0,-h/2,0,h/2);gd.addColorStop(0,'#e82848');gd.addColorStop(1,'#6e0a1e');g.fillStyle=gd;g.fillRect(-w/2,-h/2,w,h);
  g.fillStyle='#ffcc66';g.fillRect(-w/2,-h/2,w,3*s);g.fillRect(-w/2,h/2-3*s,w,3*s);g.strokeStyle='#ffd8e0';g.lineWidth=s;g.strokeRect(-w/2,-h/2,w,h);
  g.strokeStyle='#2a0410';g.lineWidth=1.7*s;g.save();g.translate(0,-9*s);H.glyph(i*5.3,9*s);g.restore();g.save();g.translate(0,8*s);H.glyph(i*7.9+3,9*s);g.restore();
  g.restore()}}
function smoke(e,a){var o=org(),n=Math.round(8*Q()),i;g.save();g.globalCompositeOperation='source-over';
 for(i=0;i<n;i++){var u=(fr*.011*(.7+hs(i)*.6)+hs(i+3))%1,q=off(e,40+hs(i+9)*480,(hs(i+1)-.5)*190),al=Math.sin(u*PI)*.5*a;
  blob(o[0]+q[0]+Math.sin(fr*.04+i)*10*s,o[1]+q[1]-u*90*s,(22+30*u)*s,'10,4,22',al)}g.restore()}
function ray(e,r){var p=(fr-r.t0)/24;if(p>=1)return false;var o=org(),A=[o[0],o[1]-60*s],mp=mpos(e,r.m),B=[mp[0],chest(r.m,mp)],a=p<.7?1:(1-p)/.3,gr=Math.min(1,p*3),
  bx=(A[0]+B[0])/2+Math.sin(r.sd*1.3)*50*s,by=(A[1]+B[1])/2-34*s,pts=[],i,N=14;
 for(i=0;i<=N;i++){var u=i/N*gr,v=1-u,px=v*v*A[0]+2*v*u*bx+u*u*B[0],py=v*v*A[1]+2*v*u*by+u*u*B[1],w=Math.sin(i*1.4+fr*.5+r.sd)*5*s*Math.sin(i/N*PI);pts.push([px,py+w])}
 g.save();g.lineCap='round';g.lineJoin='round';
 g.globalCompositeOperation='lighter';g.globalAlpha=a*.4;g.strokeStyle='#8a40ff';for(i=1;i<=N;i++){g.lineWidth=(20-i*.8)*s;g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.globalCompositeOperation='source-over';g.globalAlpha=a*.95;g.strokeStyle='#07030d';for(i=1;i<=N;i++){g.lineWidth=(10-i*.4)*s;g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.globalCompositeOperation='lighter';g.globalAlpha=a*.8;g.strokeStyle='#e0b8ff';for(i=1;i<=N;i++){g.lineWidth=(2.2-i*.08)*s;g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.restore();return true}
function bolt(e,b){var p=(fr-b.t0)/9;if(p>=1)return false;var o=org(),q=off(e,b.D,b.Lt),X=o[0]+q[0],Y=o[1]+q[1],top=Math.max(10*s,Y-330*s),a=1-p;
 g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
 [['#7a30e0',9*s,.5*a],['#d8a8ff',3.4*s,.9*a],['#ffffff',1.4*s,a]].forEach(function(c){g.globalAlpha=c[2];g.strokeStyle=c[0];g.lineWidth=c[1];g.beginPath();
  b.pts.forEach(function(pt,k){var x=X+pt[0]*s,y=top+pt[1]*(Y-top-4*s);k?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();
  var q0=b.pts[b.br],x0=X+q0[0]*s,y0=top+q0[1]*(Y-top);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+b.bs*s,y0+40*s);g.lineTo(x0+b.bs*1.5*s,y0+85*s);g.stroke()});
 blob(X,Y-4*s,60*s*(1-p*.4),'200,130,255',.7*a);g.restore();return true}
function hit(e,h){var p=(fr-h.t0)/18;if(p>=1||h.m.gone)return false;var mp=mpos(e,h.m),X=mp[0],Y=mp[1],cy=chest(h.m,mp),a=1-p,i;
 g.save();
 g.globalCompositeOperation='lighter';
 g.globalAlpha=a*.6;g.strokeStyle='#ff2a6a';g.lineWidth=3*s;g.beginPath();g.ellipse(X,Y,(16+60*p)*s,(8+30*p)*s,0,0,TAU);g.stroke();
 blob(X,cy,(30+34*p)*s,'190,100,255',.7*a);blob(X,cy,(16+12*p)*s,'255,120,170',.5*a);
 g.strokeStyle='#e8c8ff';g.lineWidth=2.2*s;g.globalAlpha=a;g.lineCap='round';g.beginPath();
 for(i=0;i<6;i++){var an=hs(h.sd*1.7+i)*TAU,r0=(10+14*p)*s,r1=(26+40*hs(h.sd+i+3))*s*Math.min(1,p*2.5+.2);g.moveTo(X+Math.cos(an)*r0,cy+Math.sin(an)*r0);g.lineTo(X+Math.cos(an)*r1,cy+Math.sin(an)*r1)}g.stroke();
 g.restore();return true}
function drain(e,d){var p=(fr-d.t0)/28;if(p>=1||d.m.gone)return false;var o=org(),mp=mpos(e,d.m),x0=mp[0],y0=chest(d.m,mp),x1=o[0],y1=o[1]-60*s,k;
 g.save();g.globalCompositeOperation='lighter';
 for(k=0;k<5;k++){var u=Math.max(0,Math.min(1,p*1.5-k*.1));if(u<=0||u>=1)continue;var x=x0+(x1-x0)*u,y=y0+(y1-y0)*u-Math.sin(u*PI)*46*s+Math.sin(u*9+k)*5*s,al=Math.sin(u*PI);
  blob(x,y,(12-5*u)*s,'255,40,100',.8*al);blob(x,y,(6-2*u)*s,'255,200,230',.8*al)}
 g.restore();return true}
function top(e){
 var t=fr-e.t0,p=t/LIFE,a=p<.04?p/.04:p>.88?(1-p)/.12:1,o=org(),w=Math.min(17,Math.floor(t/10));
 while(e.lastW<w&&e.lastW<17&&t<=185){e.lastW++;try{wave(e,e.lastW)}catch(x){}}
 smoke(e,a);talis(e,a,p);
 var hs_=e.hands.filter(function(h){return fr-h.t0<h.life}).map(function(h){var X,Y;if(h.m){var mp=mpos(e,h.m);X=mp[0]+h.jx*s;Y=mp[1]+h.jy*s}else{var q=off(e,h.D,h.Lt);X=o[0]+q[0];Y=o[1]+q[1]}return{h:h,X:X,Y:Y}}).sort(function(a1,b1){return a1.Y-b1.Y});
 e.hands=hs_.map(function(x){return x.h});
 hs_.forEach(function(x){var pp=(fr-x.h.t0)/x.h.life;g.save();g.globalCompositeOperation='lighter';try{x.h.fn(null,pp,x.X,x.Y)}finally{g.restore()}});
 e.rays=e.rays.filter(function(r){return ray(e,r)});
 e.bolts=e.bolts.filter(function(b){return bolt(e,b)});
 e.hits=e.hits.filter(function(h){return hit(e,h)});
 e.drains=e.drains.filter(function(d){return drain(e,d)})}

/* ---------- móc vào hero() và R.ycL ---------- */
var _h=hero;
hero=function(){
 var on=CFG.enable&&EF.length&&tgOn();
 if(EF.length&&(!CFG.enable||!tgOn()))EF.length=0;
 if(on)EF=EF.filter(function(e){return fr-e.t0<(e.life||LIFE)});
 var r=_h.apply(this,arguments);   /* nền thành thị được vẽ BÊN TRONG chuỗi hero() → lớp mặt đất phải vẽ sau chuỗi, bên dưới lớp bàn tay */
 if(on&&tF!==fr){tF=fr;EF.forEach(function(e){try{(e.K?K[e.K].ground:ground)(e)}catch(x){}});EF.forEach(function(e){try{(e.K?K[e.K].top:top)(e)}catch(x){}})}
 return r};
R.ycL=function(F){
 if(!F||!F.ma)return orig.apply(this,arguments);
 if(CFG.enable&&tgOn()){start(F);return{life:2,draw:function(){}}}
 if(window.MDFX&&MDFX.on&&MDFX.on()&&MDFX.cfg.enable)return{life:1,draw:function(){}};
 return orig.apply(this,arguments)};
window.MDTG={cfg:CFG,live:function(){return EF.length},fx:EF,K:K,X:{org:org,off:off,mons:mons,mrel:mrel,mpos:mpos,chest:chest,Q:Q,tgOn:tgOn,push:function(e){while(EF.length>=3)EF.shift();EF.push(e)}}};
})();
