/* ===== 🌌 Ý CẢNH TIÊN ĐẠO · THƯ VIỆN HIỆU ỨNG 2.5D (world/118-y-canh-fx-pro.js) =====
 * GIAI ĐOẠN 1 (thử nghiệm): làm lại HOÀN CHỈNH hiệu ứng của 1 kỹ năng — Tiên Đạo #1 "Kim Quang Phổ Chiếu" — theo phong cách MMORPG tiên hiệp 2.5D
 * (pháp trận Thái Cực + Bát Quái + phù văn xoay dưới đất, bùa phù mọc quanh trận, tụ linh lực → bùng nổ, sóng xung kích, cột sáng giáng xuống, hào quang).
 * Cách gắn: bọc YCTOC.fire (world/53). Chỉ THÊM lớp hiệu ứng rồi gọi lại hàm gốc → sát thương, MP, hồi chiêu, STLAST, trạng thái (world/50), AUTO,
 *   thời điểm trúng (khung 19) và hình thiên thần chém của world/53 giữ NGUYÊN. Lỗi bất kỳ trong module này đều bị nuốt (try/catch) — không ảnh hưởng chiến đấu.
 * Thư viện dùng lại được cho các kỹ năng sau: YCFXP.lib = {layer, glow, shock, pillar, burst, motes, banners, foot, tex}; đăng ký chiêu mới qua YCFXP.reg(path,j,fn).
 * Tối ưu: texture vẽ sẵn 1 lần (không tạo gradient/mảng mỗi khung cho phần nặng), hạt tính theo công thức (không cấp phát), 3 mức chất lượng
 *   (0 thấp · 1 vừa · 2 cao) tự hạ khi máy đuối (window.FXSLOW của world/53) hoặc đông FX/địch; giới hạn số hiệu ứng chạy cùng lúc; FX tự bị engine gỡ khi hết life.
 * Chỉnh: YCFXP.cfg = {on:true, q:null|0|1|2}. Gỡ lỗi: YCFXP.test() tung thử hiệu ứng trước mặt nhân vật. Phụ thuộc: YCTOC (53), FX/g/s/GY/cam/fr/P/E (engine). */
(function(){
'use strict';
if(window.YCFXP)return;
if(typeof FX==='undefined'||typeof g==='undefined'||!window.YCTOC||typeof YCTOC.fire!=='function')return;
var CFG={on:true,q:null},TAU=Math.PI*2,PI=Math.PI,TILT=.36;
var lt=null;
function later(n,f){try{lt=lt||(0,eval)('typeof later==="function"?later:null')}catch(e){}if(lt)lt(n,f);else setTimeout(f,n*16)}
function hs(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function easeO(t){t=t<0?0:t>1?1:t;return 1-(1-t)*(1-t)*(1-t)}
function mk(w,h){var o=document.createElement('canvas');o.width=w;o.height=h;return o}
var COARSE=false;try{COARSE=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)}catch(e){}

/* ---------- chất lượng: 0 thấp · 1 vừa · 2 cao ---------- */
function Q(){
  if(CFG.q!=null)return CFG.q|0;
  if(window.FXSLOW===1)return 0;
  if(FX.length>50||E.length>10)return 1;
  return COARSE?1:2}
function tagged(){var n=0;for(var i=0;i<FX.length;i++)if(FX[i].yc)n++;return n}
function put(wx,life,fn){var o={x:wx,l:life,m:life,fn:fn,yc:1};FX.push(o);return o}

/* ---------- texture vẽ sẵn (1 lần) ---------- */
var TX={};
function circ(c,r){c.beginPath();c.arc(0,0,r,0,TAU);c.stroke()}
function seg(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function glyph(c,i){ /* phù văn giả chữ Hán: vài nét ngẫu nhiên cố định, không phụ thuộc font */
  var k,n=3+(hs(i*5.1)*3|0);c.beginPath();
  for(k=0;k<n;k++){var a=hs(i*7.7+k*3.3),b=hs(i*2.9+k*6.1),t=k%3;
    if(t===0){c.moveTo(-5,-9+a*18);c.lineTo(5,-9+b*18)}
    else if(t===1){c.moveTo(-4+a*8,-10);c.lineTo(-4+b*8,10)}
    else{c.moveTo(-5+a*3,-8+b*4);c.lineTo(5-b*3,8-a*4)}}
  c.stroke()}
function texRing(){return TX.ring||(TX.ring=(function(){
  var o=mk(256,256),c=o.getContext('2d'),i;c.translate(128,128);c.lineCap='round';c.shadowColor='#ffb820';c.shadowBlur=2.5;
  c.strokeStyle='#f0d070';c.lineWidth=2.4;circ(c,122);
  c.strokeStyle='#fff3b0';c.lineWidth=1.2;circ(c,117);
  c.strokeStyle='rgba(176,110,255,.95)';c.lineWidth=2.4;circ(c,106);circ(c,86);
  c.strokeStyle='#ffe27a';c.lineWidth=1.3;
  for(i=0;i<72;i++){var a=i/72*TAU,l=i%6===0?10:4;seg(c,Math.cos(a)*117,Math.sin(a)*117,Math.cos(a)*(117-l),Math.sin(a)*(117-l))}
  c.strokeStyle='rgba(255,226,122,.45)';c.lineWidth=.7;for(i=0;i<144;i++){var a2=i/144*TAU;seg(c,Math.cos(a2)*122,Math.sin(a2)*122,Math.cos(a2)*125,Math.sin(a2)*125)}
  c.fillStyle='rgba(255,243,176,.8)';for(i=0;i<36;i++){var a3=i/36*TAU;c.beginPath();c.arc(Math.cos(a3)*76,Math.sin(a3)*76,1.1,0,TAU);c.fill()}
  c.strokeStyle='#fff3b0';c.lineWidth=1.5;c.shadowColor='#c080ff';
  for(i=0;i<24;i++){c.save();c.rotate(i/24*TAU);c.translate(0,-96);glyph(c,i);c.restore()}
  c.strokeStyle='rgba(255,226,122,.9)';c.lineWidth=1.8;c.shadowColor='#ffb820';
  for(var t=0;t<2;t++){c.beginPath();for(i=0;i<=3;i++){var q=(i%3)/3*TAU+t*PI/3*1+(-PI/2);i?c.lineTo(Math.cos(q)*82,Math.sin(q)*82):c.moveTo(Math.cos(q)*82,Math.sin(q)*82)}c.closePath();c.stroke()}
  return o})())}
function texBagua(){return TX.bagua||(TX.bagua=(function(){
  var o=mk(256,256),c=o.getContext('2d'),i,j;c.translate(128,128);c.lineCap='butt';c.shadowColor='#9a50ff';c.shadowBlur=2.5;
  c.strokeStyle='rgba(190,130,255,.95)';c.lineWidth=2.6;circ(c,120);circ(c,70);
  c.strokeStyle='#ffd84a';c.lineWidth=1.4;circ(c,113);circ(c,62);
  var T=[7,6,5,1,3,2,4,0];  /* càn đoài ly chấn tốn khảm cấn khôn */
  for(i=0;i<8;i++){c.save();c.rotate(i/8*TAU);
    for(j=0;j<3;j++){var y=-100+j*9,yang=(T[i]>>j)&1;c.fillStyle='#ffe27a';
      if(yang)c.fillRect(-15,y,30,4.2);else{c.fillRect(-15,y,12,4.2);c.fillRect(3,y,12,4.2)}}
    c.restore();
    c.save();c.rotate((i+.5)/8*TAU);c.fillStyle='#fff3b0';c.beginPath();c.arc(0,-92,2.4,0,TAU);c.fill();c.restore()}
  c.strokeStyle='rgba(255,226,122,.55)';c.lineWidth=1;for(i=0;i<8;i++){var a=(i+.5)/8*TAU;seg(c,Math.cos(a)*62,Math.sin(a)*62,Math.cos(a)*70,Math.sin(a)*70)}
  return o})())}
function texTaiji(){return TX.taiji||(TX.taiji=(function(){
  var o=mk(256,256),c=o.getContext('2d'),R=100;c.translate(128,128);c.shadowColor='#c080ff';c.shadowBlur=4;
  c.fillStyle='#7a3ad0';c.beginPath();c.arc(0,0,R,PI/2,PI*1.5);c.fill();
  c.fillStyle='#fff6cf';c.beginPath();c.arc(0,0,R,-PI/2,PI/2);c.fill();
  c.fillStyle='#7a3ad0';c.beginPath();c.arc(0,-R/2,R/2,0,TAU);c.fill();
  c.fillStyle='#fff6cf';c.beginPath();c.arc(0,R/2,R/2,0,TAU);c.fill();
  c.fillStyle='#fff6cf';c.beginPath();c.arc(0,-R/2,R/8,0,TAU);c.fill();
  c.fillStyle='#7a3ad0';c.beginPath();c.arc(0,R/2,R/8,0,TAU);c.fill();
  c.shadowBlur=3;c.shadowColor='#ffb820';c.strokeStyle='#f0d070';c.lineWidth=2.2;circ(c,R+4);
  c.strokeStyle='rgba(255,243,176,.8)';c.lineWidth=1.2;circ(c,R+10);
  return o})())}
var GLC={gold:'255,214,90',white:'255,250,225',purple:'170,95,255',jade:'90,240,200'};
function texGlow(k){return TX['g'+k]||(TX['g'+k]=(function(){
  var o=mk(64,64),c=o.getContext('2d'),q=c.createRadialGradient(32,32,0,32,32,32),rgb=GLC[k]||GLC.gold;
  q.addColorStop(0,'rgba('+rgb+',1)');q.addColorStop(.35,'rgba('+rgb+',.45)');q.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=q;c.fillRect(0,0,64,64);return o})())}
function texBanner(){return TX.banner||(TX.banner=(function(){
  var o=mk(48,132),c=o.getContext('2d'),i;
  c.fillStyle='#6a4a10';c.fillRect(2,2,44,5);c.fillStyle='#ffd84a';c.fillRect(2,2,44,2);
  c.fillStyle='#ffe27a';c.beginPath();c.arc(2,4,3.5,0,TAU);c.arc(46,4,3.5,0,TAU);c.fill();
  var q=c.createLinearGradient(0,8,0,124);q.addColorStop(0,'rgba(255,236,150,.96)');q.addColorStop(1,'rgba(255,176,48,.9)');
  c.fillStyle=q;c.beginPath();c.moveTo(5,7);c.lineTo(43,7);c.lineTo(43,108);c.lineTo(24,126);c.lineTo(5,108);c.closePath();c.fill();
  c.strokeStyle='#fff6cf';c.lineWidth=2;c.stroke();
  c.strokeStyle='rgba(122,58,208,.9)';c.lineWidth=1.4;c.beginPath();c.moveTo(9,12);c.lineTo(39,12);c.lineTo(39,104);c.lineTo(24,118);c.lineTo(9,104);c.closePath();c.stroke();
  c.strokeStyle='#6a2fb8';c.lineWidth=2.2;c.lineCap='round';
  for(i=0;i<3;i++){c.save();c.translate(24,30+i*27);c.scale(1.05,1.05);glyph(c,i+40);c.restore()}
  return o})())}

/* ---------- thành phần dùng lại ---------- */
function layer(t,X,cy,rad,rot,a){if(a<=.01||rad<2)return;g.save();g.globalAlpha=a>1?1:a;g.translate(X,cy);g.scale(1,TILT);g.rotate(rot);g.drawImage(t,-rad,-rad,rad*2,rad*2);g.restore()}
function glow(X,Y,r,k,a,flat){if(a<=.01||r<1)return;var ga=g.globalAlpha;g.globalAlpha=(a>1?1:a)*ga;
  if(flat){g.save();g.translate(X,Y);g.scale(1,TILT);g.drawImage(texGlow(k),-r,-r,r*2,r*2);g.restore()}
  else g.drawImage(texGlow(k),X-r,Y-r,r*2,r*2);g.globalAlpha=ga}
function shock(X,cy,Rw,k,a,col,wd){if(a<=.01||k<=0)return;g.save();g.globalAlpha=a>1?1:a;g.translate(X,cy);g.scale(1,TILT);g.strokeStyle=col;g.lineWidth=wd;g.beginPath();g.arc(0,0,Rw*k,0,TAU);g.stroke();g.restore()}
function pillar(X,cy,w,h,a,q){if(a<=.01)return;g.save();g.globalAlpha=a>1?1:a;
  var gr=g.createLinearGradient(0,cy-h,0,cy);gr.addColorStop(0,'rgba(255,240,170,0)');gr.addColorStop(.55,'rgba(255,226,122,.4)');gr.addColorStop(1,'rgba(255,250,225,.7)');
  g.fillStyle=gr;g.fillRect(X-w,cy-h,w*2,h);
  g.fillStyle='rgba(176,110,255,.30)';g.fillRect(X-w*1.45,cy-h*.8,w*.42,h*.8);g.fillRect(X+w*1.03,cy-h*.8,w*.42,h*.8);
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(X-w*.22,cy-h*.92,w*.56,h*.92);g.restore()}
function burst(X,gy,u,s_){ /* hiệu ứng đánh trúng mục tiêu: sao nổ + vòng + cột nhỏ */
  if(u>=1||u<0)return;var a=1-u,i;
  glow(X,gy-52*s,(26+46*u)*s,'white',a*.9);
  shock(X,gy-6*s,(26+64*u)*s,1,a,'rgba(255,214,90,1)',3.2*s);
  g.save();g.globalAlpha=a*.55;g.fillStyle='rgba(255,236,160,1)';g.fillRect(X-5*s*a,gy-130*s,10*s*a,130*s);g.restore();
  g.save();g.globalAlpha=a;g.strokeStyle='#fff3b0';g.lineWidth=2*s;g.lineCap='round';
  for(i=0;i<6;i++){var an=i/6*TAU+hs(i+(s_||0))*.6,r1=(10+20*u)*s,r2=(24+52*u)*s;g.beginPath();g.moveTo(X+Math.cos(an)*r1,gy-52*s+Math.sin(an)*r1*.9);g.lineTo(X+Math.cos(an)*r2,gy-52*s+Math.sin(an)*r2*.9);g.stroke()}
  g.restore();
  for(i=0;i<4;i++){var b=hs(i*3.7+(s_||0))*TAU;glow(X+Math.cos(b)*(18+60*u)*s,gy-52*s+Math.sin(b)*(14+46*u)*s-u*20*s,(5-u*3)*s,i&1?'purple':'gold',a)}}
function motes(f,X,cy,Rw,p,A,n,HIT){ /* hạt linh lực: tụ vào tâm trước khi nổ, bắn lên sau khi nổ — tính bằng công thức, không cấp phát */
  var i,sd=f.sd||0,u,k;
  for(i=0;i<n;i++){var a=hs(i*1.7+sd)*TAU,r0=(.35+hs(i+31+sd)*.75)*Rw,col=i%3===0?'purple':(i%3===1?'gold':'white'),x,y,al,sz;
    if(p<HIT){u=p/HIT;k=1-u;x=X+Math.cos(a+u*2.4)*r0*k;y=cy+Math.sin(a+u*2.4)*r0*k*TILT-u*u*(30+hs(i+5)*70)*s;al=A*Math.min(1,u*3)*(.35+.65*u);sz=(3+hs(i)*3)*s}
    else{u=(p-HIT)/(1-HIT);x=X+Math.cos(a)*(.12+u)*Rw*(.35+hs(i+9)*.55);y=cy+Math.sin(a)*(.12+u)*Rw*.55*TILT-u*(110+hs(i+3)*230)*s;al=A*(1-u)*(1-u*.4);sz=(4+hs(i+2)*4)*s*(1-u*.5)}
    glow(x,y,sz*2.2,col,al)}}
function banners(f,X,cy,Rw,p,A,nb,front){ /* bùa phù dựng quanh trận (đứng thẳng, trước/sau theo chiều sâu) */
  var i;
  for(i=0;i<nb;i++){var a=i/nb*TAU+fr*.011,sn=Math.sin(a);if((sn>=0)!==front)continue;
    var rise=easeO((p-.05-i*.012)/.26);if(rise<=0)continue;
    var bx=X+Math.cos(a)*Rw*.96,by=cy+sn*Rw*TILT*.96,ps=.8+.2*sn,h=96*s*ps*rise,w=h*.36,lift=(5+Math.sin(fr*.07+i*1.7)*3)*s;
    g.save();g.translate(bx,by);g.rotate(Math.sin(fr*.08+i)*.04);
    g.globalCompositeOperation='lighter';glow(0,-h*.55-lift,h*.55,'gold',.32*A);
    g.globalCompositeOperation='source-over';g.globalAlpha=A*Math.min(1,rise*1.5);g.drawImage(texBanner(),-w/2,-h-lift,w,h);
    g.restore()}}
function foot(life){ /* vòng pháp trận xoay dưới chân nhân vật khi thi triển */
  return put(P.x,life||46,function(f,p,X,gy){X=(P.x-cam)*s;var a=p<.15?p/.15:p>.7?(1-p)/.3:1,gr=easeO(p/.25),R_=92*s*gr,cy=gy-3*s;
    g.globalCompositeOperation='lighter';
    glow(X,cy,R_*1.05,'gold',a*.5,true);
    layer(texRing(),X,cy,R_,fr*.05,a*.95);layer(texBagua(),X,cy,R_*.72,-fr*.07,a*.85);layer(texTaiji(),X,cy,R_*.33,fr*.045,a*.95)})}

/* ---------- KIM QUANG PHỔ CHIẾU ---------- */
function kimQuang(cx,r,es){
  var q=Q(),L=52,HIT=19/52,nb=q===0?4:q===1?6:8,nm=q===0?8:q===1?16:28,cap=q===0?3:q===1?6:12;
  foot(40);
  if(tagged()>=(q===2?4:3))return;   /* chống chồng chéo: đủ số trận đang chạy thì chỉ giữ vòng chân */
  put(cx,L,function(f,p,X,gy){
    var Rw=r*s*.82,fade=p<.8?1:Math.max(0,(1-p)/.2),A=fade*Math.min(1,p/.1),gr=easeO(p/.32),ang=fr*.022,cy=gy-4*s,hp=p>=HIT,bk=hp?(p-HIT)/(1-HIT):0,i;
    if(f.sd==null)f.sd=Math.random()*100;
    if(hp&&!f.h){f.h=1;f.t=[];for(i=0;i<E.length&&f.t.length<cap;i++){var e=E[i];if(e&&e.in<=0&&e.hp>0&&Math.abs(e.x-cx)<r)f.t.push(e)}}  /* chỉ để vẽ — sát thương do world/53 xử lý */
    g.globalCompositeOperation='lighter';
    var flare=hp?Math.max(0,1-bk*2.4):0;
    glow(X,cy,Rw*(.5+.5*gr),'gold',A*(.34+.5*flare),true);if(q>0)glow(X,cy,Rw*.5*gr,'purple',A*.35,true);
    banners(f,X,cy,Rw,p,A,nb,false);
    layer(texRing(),X,cy,Rw*gr,ang,A*.95);
    if(q>0)layer(texBagua(),X,cy,Rw*.72*gr,-ang*1.5,A*.9);
    layer(texTaiji(),X,cy,Rw*.4*gr,ang*.8,A);
    if(!hp){var u=p/HIT;glow(X,cy-6*s,(20+40*u)*s*(1+Math.sin(fr*.5)*.1),'white',.55*u*A)}   /* tụ lực ở tâm */
    if(hp){
      if(q===2&&bk<.55){var rA=.11*(1-bk/.55),N=14,ry=cy-30*s;g.fillStyle='rgba(255,226,122,1)';g.globalAlpha=rA*A;
        for(i=0;i<N;i++){var a0=PI+.18+i/N*(PI-.36)+Math.sin(fr*.03+i)*.03,w0=.05+hs(i)*.04;g.beginPath();g.moveTo(X,ry);g.lineTo(X+Math.cos(a0-w0)*Rw*1.15,ry+Math.sin(a0-w0)*Rw*1.15);g.lineTo(X+Math.cos(a0+w0)*Rw*1.15,ry+Math.sin(a0+w0)*Rw*1.15);g.fill()}g.globalAlpha=1}
      var pa=bk<.7?1-bk/.7:0;
      if(pa>0){pillar(X,cy,(26*(1-bk*.45)+8)*s,430*s,pa*A*.8,q);
        if(q===2)for(i=0;i<5;i++){var pa2=hs(i+f.sd)*TAU,px2=X+Math.cos(pa2)*Rw*.62,py2=cy+Math.sin(pa2)*Rw*.62*TILT,dl=Math.max(0,bk-i*.04);if(dl<.62)pillar(px2,py2,(9+hs(i+4)*5)*s,(240+hs(i+8)*140)*s,(1-dl/.62)*A*.5,q)}}
      var k1=Math.min(1,bk/.3);shock(X,cy,Rw*1.15,.2+.8*easeO(k1),(1-bk*1.5)*A,'rgba(255,248,215,1)',5*s);shock(X,cy,Rw*1.15,.2+.8*easeO(k1),(1-bk*1.5)*A*.5,'rgba(255,200,60,1)',14*s);
      if(q>0){var k2=Math.min(1,Math.max(0,(bk-.1)/.4));shock(X,cy,Rw*1.3,.15+.85*easeO(k2),(1-k2)*A*.9,'rgba(170,95,255,1)',7*s)}
      if(f.t)for(i=0;i<f.t.length;i++){var e2=f.t[i];burst((e2.x-cam)*s,gy,Math.min(1,bk*2.6),i)}
    }
    motes(f,X,cy,Rw,p,A,nm,HIT);
    banners(f,X,cy,Rw,p,A,nb,true);
    if(!hp&&p>.12){var u2=(p-.12)/(HIT-.12);glow(X,cy-40*s*easeO(u2),(10+34*u2)*s,'white',.5*u2*A)}
  });
}

/* ---------- đăng ký + bọc YCTOC.fire ---------- */
var REG={};
function reg(path,j,fn){REG[path+j]=fn}
reg('t',0,function(j,S_,inf,es,near){var px=P.x,dd=P.d||1,cx=near?near.x:px+dd*140;kimQuang(cx,S_.r||300,es)});
var _fire=YCTOC.fire;
YCTOC.fire=function(j,S_,inf){
  try{if(CFG.on&&inf&&REG[inf.path+j]&&!(typeof vil!=='undefined'&&vil))REG[inf.path+j].apply(null,arguments)}catch(e){}
  return _fire.apply(this,arguments)};
window.YCFXP={cfg:CFG,reg:reg,q:Q,
  lib:{layer:layer,glow:glow,shock:shock,pillar:pillar,burst:burst,motes:motes,banners:banners,foot:foot,tex:{ring:texRing,bagua:texBagua,taiji:texTaiji,glow:texGlow,banner:texBanner}},
  clear:function(){FX=FX.filter(function(f){return!f.yc})},
  test:function(){var d=P.d||1;kimQuang(P.x+d*160,300,E)}};
})();
