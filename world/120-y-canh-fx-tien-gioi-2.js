/* ===== 🐉☄️ Ý CẢNH TIÊN ĐẠO · VÔ NGÃ KIẾM VŨ + QUY NHẤT THIÊN PHẠT — BẢN TIÊN GIỚI 2.5D ISOMETRIC (world/120-y-canh-fx-tien-gioi-2.js) =====
 * Hai chiêu còn lại của Tiên Đạo (Kim Quang Phổ Chiếu đã ở world/119). Cùng cách gắn: bọc TG8SK.R.ycM / TG8SK.R.ycS (world/79, đã bọc bởi 82 + 88),
 * CHỈ khi Tiên Đạo (F.ma=false) VÀ đang ở thành Tiên Giới (TG.on()); Ma Đạo / Map Treo 2D / tắt cfg / lỗi → hiệu ứng gốc. Công thức gốc vẫn được gọi 1 lần (world/82 giữ CUR cho hiệu ứng trúng đòn).
 * Không đụng sát thương / MP / hồi chiêu. Nhịp hiệu ứng canh theo ĐÚNG cách world/81 doYc gây sát thương (tính theo KHUNG, không phụ thuộc TG8SK_CF.slow):
 *   • Vô Ngã Kiếm Vũ (ycM): h đòn (mặc định 5) vào địch GẦN NHẤT (<600) mỗi 7 khung → 2 rồng vàng lao tới (đường xoắn kép), rồi cuộn quanh mục tiêu; mỗi đòn có 1 nhát kiếm khí + nổ trúng đích.
 *   • Quy Nhất Thiên Phạt (ycS): MỌI địch trong 900, địch thứ i trúng ở khung 3×min(i,8) → khe nứt hư không mở trên trời, thiên thạch rơi đúng từng địch (đúng khung gây sát thương), cột sáng giữa, sóng xung kích, nứt đất.
 * Dùng chung hàm vẽ + chất lượng với world/119 (YCFXTG.lib). Nền Tiên Giới sáng → mọi nét vẽ 2 lượt (cộng sáng + nét tím đậm vẽ thường). Chỉnh: YCFXTG2.cfg={on:true}. Gỡ lỗi: YCFXTG.test('y1'|'y2').
 * Phụ thuộc: YCFXTG (119), TG8SK (79), TG (61), TGQ (81), YCTT (49), g/s/fr (engine). Nạp SAU world/119. */
(function(){
'use strict';
if(window.YCFXTG2)return;
if(!window.YCFXTG||!YCFXTG.lib||!window.TG8SK||!TG8SK.R||typeof TG8SK.R.ycM!=='function'||typeof TG8SK.R.ycS!=='function'||!window.TG||typeof g==='undefined')return;
var CFG={on:true},TAU=Math.PI*2,PI=Math.PI,TILT=.5,LB=YCFXTG.lib,TX=LB.tex,hs=LB.hs,easeO=LB.easeO,Q=LB.Q,w2fx=LB.w2fx,alive=LB.alive,glow=LB.glow,layer2=LB.layer2,shock=LB.shock,pillar=LB.pillar,hitBurst=LB.hitBurst,banners=LB.banners;
function slow(){return(window.TG8SK_CF&&TG8SK_CF.slow)||1}
function cl(t){return t<0?0:t>1?1:t}
function ease2(t){t=cl(t);return t*t*(3-2*t)}
function topY(){try{var m=g.getTransform();return m.d?-m.f/m.d:-400}catch(e){return-400}}   /* mép trên màn hình, theo toạ độ nhân vật */
function plan(TOT){var sl=slow(),life=Math.max(8,Math.ceil(TOT/sl));return{life:life,LF:Math.round(life*sl)}}
function nearest(mons,h0,maxD){var best=maxD,r=null,i;for(i=0;i<mons.length;i++){var uv=w2fx(mons[i].x-h0[0],mons[i].y-h0[1]),d=Math.hypot(uv[0],uv[1]);if(d<best){best=d;r={m:mons[i],u:uv[0],v:uv[1],d:d}}}return r}
function seg(a,b,w,col,al){g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}

/* ---------- đầu rồng + thân rồng ---------- */
function headDraw(x,y,ang,sc,A,t,k){
  g.save();g.translate(x,y);g.rotate(ang);g.scale(sc,sc);
  g.globalCompositeOperation='lighter';glow(0,0,34,'gold',.8*A);glow(4,0,18,'white',.55*A);
  g.globalCompositeOperation='source-over';g.globalAlpha=A;
  g.strokeStyle='#7a3ab8';g.lineWidth=3;g.lineCap='round';             /* sừng */
  g.beginPath();g.moveTo(-4,-7);g.quadraticCurveTo(-16,-12,-26,-24);g.moveTo(-4,7);g.quadraticCurveTo(-16,12,-26,24);g.stroke();
  g.strokeStyle='#fff3b0';g.lineWidth=1.4;g.beginPath();g.moveTo(-16,-12);g.lineTo(-26,-24);g.moveTo(-16,12);g.lineTo(-26,24);g.stroke();
  g.fillStyle='#ffd84a';g.strokeStyle='#fff6cf';g.lineWidth=1.6;                 /* sọ + mõm */
  g.beginPath();g.moveTo(-10,-8);g.quadraticCurveTo(0,-14,14,-7);g.lineTo(30,-3);g.quadraticCurveTo(35,0,30,3);g.lineTo(14,7);g.quadraticCurveTo(0,12,-10,8);g.closePath();g.fill();g.stroke();
  g.fillStyle='#7a3ab8';g.beginPath();g.moveTo(14,-1);g.lineTo(31,-1);g.lineTo(31,1);g.lineTo(14,2);g.closePath();g.fill();   /* khe miệng */
  g.fillStyle='#fff';g.beginPath();g.arc(8,-3.5,2.6,0,TAU);g.fill();g.fillStyle='#4a1d8a';g.beginPath();g.arc(8.6,-3.5,1.2,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.lineWidth=2;g.lineCap='round';          /* râu bay */
  for(var w=0;w<2;w++){var sg=w?1:-1;g.strokeStyle=w?'rgba(255,250,225,.8)':'rgba(255,226,122,.85)';g.globalAlpha=A*.85;g.beginPath();g.moveTo(28,sg*2);
    g.bezierCurveTo(44,sg*(8+Math.sin(t*.4+k)*5),52,sg*(-4+Math.cos(t*.35+k)*6),70,sg*(10+Math.sin(t*.3+k)*8));g.stroke()}
  g.restore()}
function dragon(posAt,k,t,ds,A,q){
  var n=q===0?10:q===1?16:22,dtf=.5,pts=[],i,wmax=q===0?20:26;
  for(i=0;i<=n;i++){var P_=posAt(t-i*dtf,k),x=P_[0]+ds[0],yg=.5*(P_[1]+ds[1]);pts.push([x,yg-P_[2],x,yg])}
  g.save();g.lineCap='round';g.lineJoin='round';
  g.globalCompositeOperation='source-over';                                       /* bóng đổ xuống đất (chiều sâu) */
  g.fillStyle='rgba(50,24,100,.22)';g.globalAlpha=A;
  for(i=0;i<=n;i+=3){var wd=wmax*Math.pow(1-i/(n+1),.75)+2;g.beginPath();g.ellipse(pts[i][2],pts[i][3],wd*1.1,wd*.5,0,0,TAU);g.fill()}
  for(i=n;i>=1;i--)seg(pts[i],pts[i-1],wmax*Math.pow(1-i/(n+1),.75)+6,'#5a2398',.6*A);    /* viền tím đậm */
  for(i=n;i>=1;i--)seg(pts[i],pts[i-1],wmax*Math.pow(1-i/(n+1),.75)+1.5,'#f2b21c',.97*A);   /* thân vàng hổ phách đặc (không bị cháy trắng trên nền sáng) */
  g.globalCompositeOperation='lighter';
  for(i=n;i>=1;i--)seg(pts[i],pts[i-1],(wmax*Math.pow(1-i/(n+1),.75)+1.5)*.32,'#fff6cf',.85*A);   /* lõi sáng */
  for(i=2;i<n;i+=3)glow(pts[i][0],pts[i][1],7+(n-i)*.25,i%2?'purple':'gold',.55*A);   /* vảy sáng */
  var dx=pts[0][0]-pts[1][0],dy=pts[0][1]-pts[1][1];
  headDraw(pts[0][0],pts[0][1],(dx||dy)?Math.atan2(dy,dx):0,q===0?1.35:1.85,A,t,k);
  g.restore()}
function crescent(x,y,r,rot,a,wd){   /* lưỡi kiếm khí ánh sáng */
  if(a<=.01)return;g.save();g.translate(x,y);g.rotate(rot);g.lineCap='round';
  g.globalCompositeOperation='source-over';g.globalAlpha=a*.35;g.strokeStyle='#6a2fb8';g.lineWidth=wd+4;g.beginPath();g.arc(0,0,r,-1.15,1.15);g.stroke();
  g.globalCompositeOperation='lighter';g.globalAlpha=a;g.strokeStyle='#ffd84a';g.lineWidth=wd;g.beginPath();g.arc(0,0,r,-1.15,1.15);g.stroke();
  g.strokeStyle='#fff';g.lineWidth=Math.max(1,wd*.35);g.beginPath();g.arc(0,0,r,-.9,.9);g.stroke();g.restore()}

/* ---------- VÔ NGÃ KIẾM VŨ ---------- */
function vnkv(F){
  var S_=null;try{S_=YCTT.cfg.sk.t[1]}catch(e){}
  var nh=((S_&&S_.h)|0)||5,f=F.f,h0=TG.hero(),mons=alive(),T=nearest(mons,h0,600),tu=T?T.u:420*f.c,tv=T?T.v:420*f.sn,tm=T?T.m:null,sd=Math.random()*100;
  var Lp=Math.hypot(tu,tv)||1,pu=-tv/Lp,pv=tu/Lp,TD=9,TOT=60,PL=plan(TOT);
  function track(){if(tm&&!(tm.hp<=0&&tm.dead)){var uv=w2fx(tm.x-h0[0],tm.y-h0[1]);tu=uv[0];tv=uv[1];Lp=Math.hypot(tu,tv)||1;pu=-tv/Lp;pv=tu/Lp}}   /* mục tiêu di chuyển → rồng + vòng xoáy bám theo */
  function posAt(t,k){var ph=k*PI;
    if(t<=0)return[0,0,64];
    if(t<TD){var a=ease2(t/TD),rho=82*Math.sin(a*PI)*(1-.3*a),an=a*TAU*1.2+ph;return[tu*a+pu*rho*Math.sin(an),tv*a+pv*rho*Math.sin(an),64+rho*.8*Math.cos(an)+26*a]}
    var tau=t-TD,rr=(150-62*cl(tau/26))*easeO(tau/3),an2=ph+.42*tau+.8;
    return[tu+Math.cos(an2)*rr,tv+Math.sin(an2)*rr,84+38*Math.sin(tau*.55+ph)+tau*.7]}
  return{life:PL.life,tg:1,draw:function(p){
    track();var t=p*PL.LF,q=Q(),hn=TG.hero(),ds=w2fx(h0[0]-hn[0],h0[1]-hn[1]),A=t<TOT-14?1:Math.max(0,(TOT-t)/14),X=tu+ds[0],Y=.5*(tv+ds[1]),i,j;
    g.save();g.globalCompositeOperation='lighter';
    if(t<10){glow(0,-40,60*(1-t/10)+10,'white',(1-t/10)*.8)}                                      /* loé sáng lúc thi triển */
    if(q>0&&t<30){var ca=(1-t/30)*A;for(i=0;i<3;i++){var an=t*.36+i*TAU/3,r0=100+i*18;g.save();g.scale(1,TILT);g.lineCap='round';
      g.globalAlpha=ca*.35;g.strokeStyle='#6a2fb8';g.lineWidth=9;g.beginPath();g.arc(0,0,r0,an,an+1.1);g.stroke();
      g.globalCompositeOperation='lighter';g.globalAlpha=ca;g.strokeStyle='#ffd84a';g.lineWidth=4;g.beginPath();g.arc(0,0,r0,an,an+1.1);g.stroke();g.restore()}}   /* vòng gió kiếm quanh chân */
    var va=cl((t-6)/6)*A;                                                                          /* pháp trận xoáy dưới mục tiêu */
    if(va>0){glow(X,Y,140*easeO((t-6)/8),'gold',va*.4,true);layer2(TX.ring(),X,Y,132*easeO((t-6)/8),t*.06,va*.9);if(q>0)layer2(TX.bagua(),X,Y,94*easeO((t-6)/8),-t*.09,va*.8);layer2(TX.taiji(),X,Y,42*easeO((t-6)/8),t*.05,va*.9)}
    for(j=0;j<nh;j++){var th=1+7*j,u=(t-th-2)/16;                                                  /* mỗi đòn: kiếm khí + nổ trúng */
      if(u>=0&&u<1){var sx=X,gy=Y,zc=Y-40;if(tm&&!(tm.hp<=0&&tm.dead)){var dm=w2fx(tm.x-hn[0],tm.y-hn[1]);sx=dm[0];gy=.5*dm[1];zc=gy-(tm.z||40)}
        hitBurst(sx,gy,zc,u,j+sd);crescent(sx,zc,30+36*u,j*1.9+sd,(1-u),7);crescent(sx,zc,22+26*u,j*1.9+sd+PI,(1-u)*.8,4);if(j===nh-1&&u<.5)shock(sx,gy,40+120*u*2,1,(1-u*2),'rgba(255,248,215,1)',4)}}
    if(A>0){dragon(posAt,0,t,ds,A,q);dragon(posAt,1,t,ds,A,q)}
    g.restore()}}}

/* ---------- QUY NHẤT THIÊN PHẠT ---------- */
function rift(cx,cy,w,open,A,sd){
  if(open<=.02||A<=.01)return;var wd=w*open,n=14,i,pts=[];
  g.save();g.globalCompositeOperation='source-over';g.globalAlpha=.78*A;g.fillStyle='#160a30';g.beginPath();g.ellipse(cx,cy,wd,12*open+3,-.08,0,TAU);g.fill();   /* khoảng hư không */
  g.globalCompositeOperation='lighter';glow(cx,cy,wd*1.6,'purple',.65*A);glow(cx,cy,wd*1.05,'gold',.5*A);
  for(i=0;i<=n;i++)pts.push([cx-wd+i/n*2*wd,cy+(hs(i*3+sd)-.5)*18*open+(i-n/2)*.9]);
  g.lineJoin='round';g.lineCap='round';
  [['rgba(176,110,255,.55)',10],['#ffd84a',5],['#ffffff',2]].forEach(function(o){g.globalAlpha=A;g.strokeStyle=o[0];g.lineWidth=o[1];g.beginPath();pts.forEach(function(p,k){k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()});
  g.restore()}
function rock(x,y,sz,rot,sd){
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';glow(0,0,sz*2.9,'gold',.85);glow(0,0,sz*1.6,'white',.5);
  g.globalCompositeOperation='source-over';g.fillStyle='#3b2a66';g.strokeStyle='#ffd84a';g.lineWidth=2;g.beginPath();
  for(var i=0;i<7;i++){var a=i/7*TAU,r=sz*(.7+.5*hs(i*2.3+sd));i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
  g.closePath();g.fill();g.stroke();g.globalCompositeOperation='lighter';glow(-sz*.2,-sz*.2,sz*.7,'white',.6);g.restore()}
function crack(x,y,u,sd){   /* nứt đất trên mặt đất isometric */
  if(u>=1)return;var a=1-u,i,j;g.save();g.translate(x,y);g.scale(1,TILT);g.lineCap='round';g.lineJoin='round';
  for(i=0;i<5;i++){var an=i/5*TAU+hs(i+sd)*.8,len=34+hs(i*4+sd)*40,px=0,py=0,pts=[[0,0]];
    for(j=1;j<=4;j++){var aa=an+(hs(i*9+j+sd)-.5)*.7;px+=Math.cos(aa)*len/4;py+=Math.sin(aa)*len/4;pts.push([px,py])}
    [['#6a2fb8',5,.35],['#ffd84a',3,.95]].forEach(function(o){g.globalCompositeOperation=o[1]===5?'source-over':'lighter';g.globalAlpha=a*o[2];g.strokeStyle=o[0];g.lineWidth=o[1];g.beginPath();pts.forEach(function(p,k){k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()})}
  g.restore()}
function qntp(F){
  var f=F.f,h0=TG.hero(),mons=alive(),tg=[],i,cu=260*f.c,cv=260*f.sn;
  for(i=0;i<mons.length;i++){var uv=w2fx(mons[i].x-h0[0],mons[i].y-h0[1]),d=Math.hypot(uv[0],uv[1]);if(d<900)tg.push({m:mons[i],d:d,u:uv[0],v:uv[1]})}
  tg.sort(function(a,b){return a.d-b.d});
  if(tg.length){var n0=Math.min(tg.length,8);cu=0;cv=0;for(i=0;i<n0;i++){cu+=tg[i].u/n0;cv+=tg[i].v/n0}}
  var sd=Math.random()*100,TOT=76,PL=plan(TOT),rocks=[],q0=Q(),capT=q0===0?6:q0===1?10:16,nx=q0===0?6:q0===1?12:22;
  for(i=0;i<tg.length&&i<capT;i++)rocks.push({m:tg[i].m,ti:5+3*Math.min(i,8),sx:(hs(i*5+sd)-.5)*230,sz:26+hs(i*2+sd)*14,i:i});
  for(i=0;i<nx;i++){var an=hs(i*7.1+sd)*TAU,rd=Math.sqrt(hs(i*3.3+sd))*280;rocks.push({u:cu+Math.cos(an)*rd,v:cv+Math.sin(an)*rd*1,ti:8+Math.round(hs(i*5.9+sd)*26),sx:(hs(i*4+sd)-.5)*230,sz:18+hs(i*6+sd)*14,i:100+i})}
  return{life:PL.life,tg:tg.length,draw:function(p){
    var t=p*PL.LF,q=Q(),hn=TG.hero(),ds=w2fx(h0[0]-hn[0],h0[1]-hn[1]),X0=ds[0],Y0=.5*ds[1],top=topY(),ry=Math.max(top+34,-330),
      A=t<TOT-18?1:Math.max(0,(TOT-t)/18),CX=cu+ds[0],CY=.5*(cv+ds[1]),k,j;
    g.save();g.globalCompositeOperation='lighter';
    /* trận pháp dưới chân nhân vật */
    var aa=t<8?t/8:t<54?1:Math.max(0,1-(t-54)/18),R0=118*easeO(t/10);
    if(aa>0){glow(X0,Y0,R0*1.05,'gold',aa*.42,true);layer2(TX.ring(),X0,Y0,R0,t*.03,aa*.9);if(q>0)layer2(TX.bagua(),X0,Y0,R0*.72,-t*.045,aa*.85);layer2(TX.taiji(),X0,Y0,R0*.36,t*.025,aa*.9);
      var nb=q===0?4:q===1?6:8;banners(sd,X0,Y0,R0,.2,aa,nb,false);banners(sd,X0,Y0,R0,.2,aa,nb,true)}
    /* khe nứt hư không */
    var ro=ease2(t/7)*(t<46?1:Math.max(0,1-(t-46)/14));rift(X0,ry,190,ro,A,sd);
    /* thiên thạch */
    for(k=0;k<rocks.length;k++){var r_=rocks[k],fall=Math.min(7,r_.ti),t0=r_.ti-fall;if(t<t0)continue;
      var ex,ey,gy,zc;
      if(r_.m){if(r_.m.hp<=0&&r_.m.dead&&t<r_.ti)continue;var dm=w2fx(r_.m.x-hn[0],r_.m.y-hn[1]);ex=dm[0];gy=.5*dm[1];zc=gy-(r_.m.z||40);ey=zc+10}
      else{ex=r_.u+ds[0];gy=.5*(r_.v+ds[1]);zc=gy-8;ey=gy}
      var sx=X0+r_.sx;
      if(t<=r_.ti){var kk=(t-t0)/fall,e1=Math.pow(kk,1.7),e0=Math.pow(Math.max(0,kk-.3),1.7),hx=sx+(ex-sx)*e1,hy=ry+(ey-ry)*e1,tx=sx+(ex-sx)*e0,ty=ry+(ey-ry)*e0;
        g.save();g.lineCap='round';g.globalCompositeOperation='source-over';seg([tx,ty],[hx,hy],r_.sz*1.25,'#6a2fb8',.32);
        g.globalCompositeOperation='lighter';seg([tx,ty],[hx,hy],r_.sz*.85,'#ffc83a',.9);seg([tx,ty],[hx,hy],r_.sz*.32,'#ffffff',.95);g.restore();
        rock(hx,hy,r_.sz*(.6+.4*kk),kk*5+r_.i,r_.i)}
      else{var u=(t-r_.ti)/20;if(u<1){crack(ex,gy,u,r_.i);shock(ex,gy,16+60*u,1,(1-u)*A,'rgba(255,214,90,1)',3);
        if(r_.m)hitBurst(ex,gy,zc,Math.min(1,u*1.3),r_.i);
        else{var sg=glow;for(j=0;j<3;j++){var b=hs(j*3.1+r_.i)*TAU;sg(ex+Math.cos(b)*(10+34*u),gy-6+Math.sin(b)*(6+16*u)-u*28,5-u*3,j&1?'purple':'gold',1-u)}}}}}
    /* cột sáng giữa + sóng xung kích */
    if(t>=26){var pk=t-26,pa=pk<5?pk/5:Math.max(0,1-(pk-5)/30);
      if(pa>0){pillar(CX,CY,30*(1-pk*.012)+10,CY-top+30,pa*A*.85);
        if(q===2)for(j=0;j<4;j++){var pj=hs(j+sd)*TAU,dl=Math.max(0,pk-j*2);if(dl<26)pillar(CX+Math.cos(pj)*120,CY+Math.sin(pj)*60,8+hs(j+4)*5,(CY-top)*(.6+.3*hs(j+8)),(1-dl/26)*A*.5)}}
      var sk=cl(pk/14);shock(CX,CY,250,.15+.85*easeO(sk),(1-sk)*A,'rgba(255,248,215,1)',6);if(q>0){var s2=cl((pk-3)/16);shock(CX,CY,300,.15+.85*easeO(s2),(1-s2)*A*.9,'rgba(170,95,255,1)',8)}}
    g.restore()}}}

/* ---------- gắn vào world/79 ---------- */
function hook(name,fn){var orig=TG8SK.R[name];TG8SK.R[name]=function(F){var o=orig.apply(this,arguments);if(CFG.on&&F&&!F.ma&&F.f&&TG.on()){try{var m=fn(F);if(m)return m}catch(e){}}return o}}
hook('ycM',vnkv);hook('ycS',qntp);
window.YCFXTG2={cfg:CFG};
})();
