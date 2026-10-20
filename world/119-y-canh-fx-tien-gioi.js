/* ===== 🏯 Ý CẢNH TIÊN ĐẠO · KIM QUANG PHỔ CHIẾU — BẢN TIÊN GIỚI 2.5D ISOMETRIC (world/119-y-canh-fx-tien-gioi.js) =====
 * Cùng bộ hiệu ứng với world/118 (pháp trận Thái Cực + Bát Quái + phù văn xoay, bùa phù, tụ lực → bùng nổ, sóng xung kích, cột sáng, hào quang)
 * nhưng vẽ lại theo MẶT ĐẤT ISOMETRIC 2:1 của Thành Tiên Giới (world/61) và Tiên Linh Chiến Cảnh (world/84) — chỗ dùng hệ kỹ năng 8 hướng của world/79.
 * Cách gắn: bọc TG8SK.R.ycB (công thức hiệu ứng của world/79, đã được world/82 + world/88 bọc). CHỈ khi là Tiên Đạo (F.ma=false) mới dùng bản vẽ mới;
 *   Ma Đạo và mọi chiêu khác đi nguyên đường cũ. Công thức gốc vẫn được gọi 1 lần để world/82 giữ đúng màu/kiểu cho hiệu ứng trúng đòn (CUR).
 *   Chỉ chạy khi TG.on() (thành Tiên Giới); ở Map Treo 2D (world/83 cũng gọi R.ycB) và nơi khác vẫn dùng hiệu ứng gốc. Lỗi bất kỳ → trả lại hiệu ứng gốc. Sát thương / MP / hồi chiêu / 8 hướng / AUTO do world/79 + world/81 xử lý, không đụng tới.
 * Đồng bộ: world/81 gây sát thương NGAY lúc bấm → vùng nổ ở p≈0.08 (chỉ ~10 khung tụ lực). Tâm trận = đúng mục tiêu mà doYc chọn (địch gần nhất <600, không có thì 210 phía trước),
 *   bán kính vẽ = 1,2 × bán kính sát thương (r×0,55). Trận NEO THEO THẾ GIỚI: nhân vật đi tiếp thì trận ở yên tại chỗ (không trượt theo nhân vật).
 * Dùng chung texture + chất lượng với world/118 (YCFXP.cfg.q / FXSLOW / TGFX_CF.q). Chỉnh: YCFXTG.cfg = {on:true}. Gỡ lỗi: YCFXTG.test().
 * Phụ thuộc: YCFXP (118), TG8SK (79), TG (61), TGQ (81, tuỳ chọn: không có thì bỏ hiệu ứng nổ trên quái), YCTT (49), g/s/fr (engine). Nạp SAU world/88. */
(function(){
'use strict';
if(window.YCFXTG)return;
if(!window.YCFXP||!YCFXP.lib||!window.TG8SK||!TG8SK.R||typeof TG8SK.R.ycB!=='function'||!window.TG||typeof g==='undefined')return;
var CFG={on:true},TAU=Math.PI*2,PI=Math.PI,TILT=.5,L=YCFXP.lib,TX=L.tex;
var COARSE=false;try{COARSE=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)}catch(e){}
function hs(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function easeO(t){t=t<0?0:t>1?1:t;return 1-(1-t)*(1-t)*(1-t)}
function Q(){var c=YCFXP.cfg.q;if(c!=null)return c|0;if(window.FXSLOW===1)return 0;
  try{if(window.TGFX_CF&&TGFX_CF.q<.7)return 1}catch(e){}return COARSE?1:2}
/* Nền Tiên Giới là đá trắng sáng: lớp cộng sáng ('lighter') một mình sẽ bị cháy nhạt → thêm lớp "mực" tím sẫm vẽ thường bên dưới để trận pháp vẫn nổi rõ */
var INK={};
function ink(t,col){var k=col+'|'+(t._yid||(t._yid=Math.random()));var o=INK[k];if(o)return o;o=document.createElement('canvas');o.width=t.width;o.height=t.height;var c=o.getContext('2d');c.drawImage(t,0,0);c.globalCompositeOperation='source-in';c.fillStyle=col;c.fillRect(0,0,o.width,o.height);return INK[k]=o}
/* hình học isometric 2:1 — cùng công thức với world/81: (dx,dy) thế giới → mặt phẳng hiệu ứng (u,v); màn hình = (u, v/2) */
function KK(){return(TG.CF&&TG.CF.heroK)||.6}
function w2fx(dx,dy){var q=46/KK();return[(dx-dy)*q,(dx+dy)*q]}
function alive(){var A=[];try{TGQ.mon.forEach(function(m){if(m.hp>0&&!m.dead&&!m.gone)A.push(m)})}catch(e){}return A}

/* ---------- hình vẽ trong không gian nhân vật (g đã ở chân nhân vật, y xuống, mặt đất dẹt 2:1) ---------- */
function glow(x,y,r,k,a,flat){if(a<=.01||r<1)return;var ga=g.globalAlpha;g.globalAlpha=(a>1?1:a)*ga;
  if(flat){g.save();g.translate(x,y);g.scale(1,TILT);g.drawImage(TX.glow(k),-r,-r,r*2,r*2);g.restore()}
  else g.drawImage(TX.glow(k),x-r,y-r,r*2,r*2);g.globalAlpha=ga}
function layer(t,x,y,rad,rot,a){if(a<=.01||rad<2)return;g.save();g.globalAlpha=a>1?1:a;g.translate(x,y);g.scale(1,TILT);g.rotate(rot);g.drawImage(t,-rad,-rad,rad*2,rad*2);g.restore()}
function layer2(t,x,y,rad,rot,a){if(a<=.01||rad<2)return;g.save();g.globalCompositeOperation='lighter';layer(t,x,y,rad,rot,a);   /* nền tối: phát sáng */
  g.globalCompositeOperation='multiply';layer(t,x,y,rad,rot,a*.9);layer(ink(t,'#7a3ab8'),x,y,rad,rot,a*.3);   /* nền sáng: nét vàng/tím đậm lên */
  g.restore()}
function shock(x,y,R,k,a,col,wd){if(a<=.01||k<=0)return;g.save();g.translate(x,y);g.scale(1,TILT);g.beginPath();g.arc(0,0,R*k,0,TAU);
  g.globalCompositeOperation='lighter';g.globalAlpha=a>1?1:a;g.strokeStyle=col;g.lineWidth=wd;g.stroke();
  g.globalCompositeOperation='source-over';g.globalAlpha=(a>1?1:a)*.4;g.strokeStyle='#7a3ab8';g.lineWidth=Math.max(1.5,wd*.45);g.stroke();g.restore()}
function pillar(x,y,w,h,a){if(a<=.01)return;g.save();g.globalAlpha=a>1?1:a;
  var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,'rgba(255,240,170,0)');q.addColorStop(.55,'rgba(255,226,122,.4)');q.addColorStop(1,'rgba(255,250,225,.7)');
  g.fillStyle=q;g.fillRect(x-w,y-h,w*2,h);
  g.globalCompositeOperation='source-over';g.fillStyle='rgba(122,58,184,.34)';g.fillRect(x-w*1.5,y-h*.8,w*.5,h*.8);g.fillRect(x+w*1.0,y-h*.8,w*.5,h*.8);g.globalCompositeOperation='lighter';
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x-w*.22,y-h*.92,w*.44,h*.92);g.restore();
  glow(x,y,w*2.2,'gold',a*.8,true)}
function hitBurst(sx,gy,zc,u,sd){ /* nổ trên mục tiêu: sao + vòng nền + cột nhỏ */
  if(u>=1||u<0)return;var a=1-u,i;
  glow(sx,zc,28+46*u,'white',a*.9);
  shock(sx,gy,26+64*u,1,a,'rgba(255,214,90,1)',3);
  g.save();g.globalAlpha=a*.5;g.fillStyle='rgba(255,236,160,1)';g.fillRect(sx-5*a,gy-120,10*a,120);
  g.globalAlpha=a;g.strokeStyle='#fff3b0';g.lineWidth=2;g.lineCap='round';
  for(i=0;i<6;i++){var an=i/6*TAU+hs(i+sd)*.6,r1=10+20*u,r2=24+52*u;g.beginPath();g.moveTo(sx+Math.cos(an)*r1,zc+Math.sin(an)*r1*.9);g.lineTo(sx+Math.cos(an)*r2,zc+Math.sin(an)*r2*.9);g.stroke()}
  g.restore();
  g.save();g.globalCompositeOperation='source-over';g.globalAlpha=a*.4;g.strokeStyle='#6a2fb8';g.lineWidth=4;g.lineCap='round';for(i=0;i<6;i++){var an2=i/6*TAU+hs(i+sd)*.6;g.beginPath();g.moveTo(sx+Math.cos(an2)*(10+20*u),zc+Math.sin(an2)*(10+20*u)*.9);g.lineTo(sx+Math.cos(an2)*(24+52*u),zc+Math.sin(an2)*(24+52*u)*.9);g.stroke()}g.restore();
  for(i=0;i<4;i++){var b=hs(i*3.7+sd)*TAU;glow(sx+Math.cos(b)*(18+60*u),zc+Math.sin(b)*(14+46*u)-u*20,5-u*3,i&1?'purple':'gold',a)}}
function motes(sd,X,Y,R,p,A,n,HIT){
  var i,u,k;
  for(i=0;i<n;i++){var a=hs(i*1.7+sd)*TAU,r0=(.35+hs(i+31+sd)*.75)*R,col=i%3===0?'purple':(i%3===1?'gold':'white'),x,y,al,sz;
    if(p<HIT){u=p/HIT;k=1-u;x=X+Math.cos(a+u*2.4)*r0*k;y=Y+Math.sin(a+u*2.4)*r0*k*TILT-u*u*(30+hs(i+5)*70);al=A*Math.min(1,u*3)*(.35+.65*u);sz=3+hs(i)*3}
    else{u=(p-HIT)/(1-HIT);u=u>1?1:u;x=X+Math.cos(a)*(.12+u)*R*(.35+hs(i+9)*.55);y=Y+Math.sin(a)*(.12+u)*R*.55*TILT-u*(110+hs(i+3)*230);al=A*(1-u)*(1-u*.4);sz=(4+hs(i+2)*4)*(1-u*.5)}
    g.save();g.globalCompositeOperation='source-over';g.globalAlpha=Math.min(1,al*.6);g.fillStyle=col==='purple'?'#7a3ad0':'#d89a10';g.beginPath();g.arc(x,y,sz*.5,0,TAU);g.fill();g.restore();
    glow(x,y,sz*2.2,col,al)}}
function banners(sd,X,Y,R,p,A,nb,front){
  var i;
  for(i=0;i<nb;i++){var a=i/nb*TAU+fr*.011,sn=Math.sin(a);if((sn>=0)!==front)continue;
    var rise=easeO((p-.02-i*.006)/.14);if(rise<=0)continue;
    var bx=X+Math.cos(a)*R*.96,by=Y+sn*R*TILT*.96,ps=.8+.2*sn,h=96*ps*rise,w=h*.36,lift=5+Math.sin(fr*.07+i*1.7)*3;
    g.save();g.translate(bx,by);g.rotate(Math.sin(fr*.08+i)*.04);
    g.globalCompositeOperation='lighter';glow(0,-h*.55-lift,h*.55,'gold',.32*A);
    g.globalCompositeOperation='source-over';g.globalAlpha=A*Math.min(1,rise*1.5);g.drawImage(TX.banner(),-w/2,-h-lift,w,h);
    g.restore()}}

/* ---------- công thức Kim Quang Phổ Chiếu cho Tiên Giới ---------- */
function kimQuang(F){
  var S_=null;try{S_=YCTT.cfg.sk.t[0]}catch(e){}
  var rD=((S_&&S_.r)||300)*.55,R=rD*1.2,f=F.f,h0=TG.hero(),i;
  /* tâm = đúng mục tiêu doYc (world/81) chọn: địch gần nhất trong 600, không có thì 210 phía trước */
  var cu=210*f.c,cv=210*f.sn,best=600,mons=alive();
  for(i=0;i<mons.length;i++){var uv=w2fx(mons[i].x-h0[0],mons[i].y-h0[1]),d=Math.hypot(uv[0],uv[1]);if(d<best){best=d;cu=uv[0];cv=uv[1]}}
  var tg=[];for(i=0;i<mons.length&&tg.length<14;i++){var u2=w2fx(mons[i].x-h0[0],mons[i].y-h0[1]);if(Math.hypot(u2[0]-cu,u2[1]-cv)<rD+24)tg.push(mons[i])}
  var sd=Math.random()*100,HIT=.08;
  return{life:56,tg:tg.length,draw:function(p){
    var q=Q(),nb=q===0?4:q===1?6:8,nm=q===0?8:q===1?16:28,cap=q===0?3:q===1?6:12;
    var hn=TG.hero(),ds=w2fx(h0[0]-hn[0],h0[1]-hn[1]);              /* neo vào thế giới: bù phần nhân vật đã đi sau lúc bấm */
    var X=cu+ds[0],Y=.5*(cv+ds[1]),fade=p<.78?1:Math.max(0,(1-p)/.22),A=fade*Math.min(1,p/.03),gr=easeO(p/.14),ang=fr*.022,hp=p>=HIT,bk=hp?(p-HIT)/(1-HIT):0,flare=hp?Math.max(0,1-bk*5):0;
    g.save();g.globalCompositeOperation='lighter';
    /* vòng pháp trận dưới chân nhân vật khi thi triển */
    var fa=p<.04?p/.04:p>.4?Math.max(0,1-(p-.4)/.2):1,fr0=70*easeO(p/.07);
    if(fa>0){glow(0,0,fr0*1.05,'gold',fa*.45,true);layer2(TX.ring(),0,0,fr0,fr*.05,fa*.8);layer2(TX.bagua(),0,0,fr0*.72,-fr*.07,fa*.7);layer2(TX.taiji(),0,0,fr0*.33,fr*.045,fa*.8)}
    g.save();g.globalCompositeOperation='source-over';glow(X,Y,R*(.6+.4*gr),'gold',A*.3,true);g.restore();
    glow(X,Y,R*(.5+.5*gr),'gold',A*(.34+.5*flare),true);if(q>0)glow(X,Y,R*.5*gr,'purple',A*.35,true);
    banners(sd,X,Y,R,p,A,nb,false);
    layer2(TX.ring(),X,Y,R*gr,ang,A*.95);
    if(q>0)layer2(TX.bagua(),X,Y,R*.72*gr,-ang*1.5,A*.9);
    layer2(TX.taiji(),X,Y,R*.4*gr,ang*.8,A);
    if(!hp){var u=p/HIT;glow(X,Y-6,20+40*u,'white',.55*u*A)}
    if(hp){
      if(q===2&&bk<.3){var rA=.11*(1-bk/.3),N=14,ry=Y-30;g.fillStyle='rgba(255,226,122,1)';g.globalAlpha=rA*A;
        for(i=0;i<N;i++){var a0=PI+.18+i/N*(PI-.36)+Math.sin(fr*.03+i)*.03,w0=.05+hs(i)*.04;g.beginPath();g.moveTo(X,ry);g.lineTo(X+Math.cos(a0-w0)*R*1.15,ry+Math.sin(a0-w0)*R*1.15);g.lineTo(X+Math.cos(a0+w0)*R*1.15,ry+Math.sin(a0+w0)*R*1.15);g.fill()}g.globalAlpha=1}
      var pa=bk<.4?1-bk/.4:0;
      if(pa>0){pillar(X,Y,26*(1-bk*.8)+8,400,pa*A*.8);
        if(q===2)for(i=0;i<5;i++){var pa2=hs(i+sd)*TAU,dl=Math.max(0,bk-i*.025);if(dl<.34)pillar(X+Math.cos(pa2)*R*.62,Y+Math.sin(pa2)*R*.62*TILT,9+hs(i+4)*5,230+hs(i+8)*130,(1-dl/.34)*A*.5)}}
      var k1=Math.min(1,bk/.14);shock(X,Y,R*1.15,.2+.8*easeO(k1),(1-bk*3)*A,'rgba(255,248,215,1)',5);shock(X,Y,R*1.15,.2+.8*easeO(k1),(1-bk*3)*A*.5,'rgba(255,200,60,1)',14);
      if(q>0){var k2=Math.min(1,Math.max(0,(bk-.05)/.22));shock(X,Y,R*1.3,.15+.85*easeO(k2),(1-k2)*A*.9,'rgba(170,95,255,1)',7)}
      var bu=Math.min(1,bk*5.5);
      if(bu<1)for(i=0;i<tg.length&&i<cap;i++){var m=tg[i];if(m.hp<=0&&m.dead)continue;var dm=w2fx(m.x-hn[0],m.y-hn[1]);hitBurst(dm[0],.5*dm[1],.5*dm[1]-(m.z||40),bu,i)}
    }
    motes(sd,X,Y,R,p,A,nm,HIT);
    banners(sd,X,Y,R,p,A,nb,true);
    g.restore()}}}

/* ---------- gắn vào world/79 ---------- */
var orig=TG8SK.R.ycB;
TG8SK.R.ycB=function(F){
  var o=orig.apply(this,arguments);                      /* gọi gốc: world/82 đặt CUR để hiệu ứng trúng đòn đúng kiểu/màu */
  if(CFG.on&&F&&!F.ma&&F.f&&TG.on()){try{var m=kimQuang(F);if(m)return m}catch(e){}}
  return o};
window.YCFXTG={cfg:CFG,
  lib:{tex:TX,hs:hs,easeO:easeO,Q:Q,w2fx:w2fx,alive:alive,glow:glow,layer:layer,layer2:layer2,shock:shock,pillar:pillar,hitBurst:hitBurst,motes:motes,banners:banners,ink:ink},   /* dùng chung cho world/120 */
  test:function(k){k=k||'y0';var it=TG8SK.list().filter(function(i){return i.k===k})[0];return it?TG8SK.fire(it):false}};
})();
