/* ===== 🖐️ MA SÁT PHỆ HỒN · HIỆU ỨNG MMORPG 2.5D (world/53b-ma-sat-phe-hon-fx.js) =====
 * CHỈ VẼ — không đổi sát thương / MP / hồi chiêu / trạng thái / mục tiêu. Gọi từ world/53 (fire, thần thông Ma Tộc số 1) qua MDFX.start (lúc tung chiêu) và MDFX.tick (mỗi nhịp sát thương, 18 nhịp × 10 khung ≈ 3 giây).
 * Các lớp (đều là FX của engine nên tự hết hạn và tự dọn khi đổi map / chết / thoát):
 *   1) Pháp trận dưới đất: 2 vành ngược chiều xoay + phù văn + bát quái + Thái Cực Âm Dương, nứt đất ánh đỏ-tím, quầng sáng, oán hồn bay lên, tối nhẹ màn hình
 *   2) Sóng xung kích lan ra đúng bán kính vùng tác động của chiêu (S_.r)
 *   3) Bùa chú đỏ bay lơ lửng (phù văn) 4) Bàn tay quỷ mọc từ lòng đất (dùng lại handFx của world/53) — ở chỗ từng địch trúng đòn + rải rác trong vùng
 *   5) Sét tím đánh xuống 6) Dấu trúng đòn lên địch 7) Dòng hút máu từ địch về người chơi (tượng trưng cho hồi 2% máu)
 * Máy yếu: mật độ tự giảm theo FXSLOW/light() của world/53; chỉnh tay: MDFX.cfg.q (0.35–1), MDFX.cfg.enable=false → quay về hiệu ứng cũ.
 * Phụ thuộc: world/53 (window.YCFXLIB), engine g/s/fr/W/H/FX/P/PT/R. Thiếu → không làm gì (chiêu vẫn chạy bằng hiệu ứng cũ). */
(function(){
'use strict';
var L=window.YCFXLIB;
if(!L||typeof FX==='undefined'||typeof g==='undefined')return;
var CFG={enable:true,q:1};
var PI=Math.PI,TAU=PI*2,fx=L.fx,blob=L.blob,hs=L.hs,easeO=L.easeO;
var LIFE=205,hands=[];
function on(){return CFG.enable&&typeof P!=='undefined'}
function Q(){return Math.max(.35,Math.min(1,CFG.q*(L.slow()?.5:1)*(L.light()?.75:1)))}
function reach(r){return Math.min(r||560,430)}

/* phù văn: 3 nét ngẫu nhiên theo hạt giống, kích thước sz */
function glyph(seed,sz){g.beginPath();for(var i=0;i<3;i++){var x0=(hs(seed+i)-.5)*sz,y0=(hs(seed+i+7)-.5)*sz,x1=(hs(seed+i+13)-.5)*sz,y1=(hs(seed+i+19)-.5)*sz;g.moveTo(x0,y0);g.lineTo(x1,y0);g.lineTo(x1,y1)}g.stroke()}
function ring(R,w,col,al){g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke()}
function yinyang(r,rot,al){
 g.save();g.rotate(rot);g.globalAlpha=al;
 var lg=g.createRadialGradient(0,0,r*.1,0,0,r);lg.addColorStop(0,'#fff0ff');lg.addColorStop(1,'#b070ff');
 g.fillStyle=lg;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
 g.fillStyle='#090214';g.beginPath();g.moveTo(0,-r);g.arc(0,0,r,-PI/2,PI/2,true);g.arc(0,r/2,r/2,PI/2,-PI/2,false);g.arc(0,-r/2,r/2,PI/2,-PI/2,true);g.closePath();g.fill();
 g.fillStyle='#090214';g.beginPath();g.arc(0,-r/2,r/7,0,TAU);g.fill();
 g.fillStyle='#f4e0ff';g.beginPath();g.arc(0,r/2,r/7,0,TAU);g.fill();
 g.strokeStyle='#ff2a6a';g.lineWidth=r*.06;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
 g.restore()}

/* vết nứt đất: tạo 1 lần cho mỗi lần cast */
function mkCracks(n,seed,Lm){var c=[];for(var i=0;i<n;i++){var a=(i/n)*TAU+hs(seed+i)*.5,len=Lm*(.45+hs(seed+i+5)*.55),pts=[[0,0]],k;
  for(k=1;k<=7;k++){var u=k/7;pts.push([Math.cos(a)*len*u+(hs(seed+i*9+k)-.5)*26,Math.sin(a)*len*u+(hs(seed+i*5+k)-.5)*26])}c.push(pts)}return c}

/* 1) PHÁP TRẬN + NỨT ĐẤT + QUẦNG SÁNG + OÁN HỒN */
function groundFx(px,r,q){
 var Wd=reach(r),cr=mkCracks(Math.round(16*q),px*.7+fr,Wd),nw=Math.round(11*q),i,k,j;
 fx(px,LIFE,function(f,p,X,gy){
  var a=p<.05?p/.05:p>.9?(1-p)/.1:1,gr=easeO(p/.1),t=fr,pul=.65+.35*Math.sin(t*.22);
  g.save();
  g.globalCompositeOperation='source-over';g.globalAlpha=.24*a;g.fillStyle='#12031f';g.fillRect(0,0,W,H);g.globalAlpha=1;   /* trả alpha về 1: nếu không, quầng sáng/nứt đất phía sau bị mờ theo alpha của lớp tối */
  g.globalCompositeOperation='lighter';
  blob(X,gy-4*s,Wd*s*1.05,'120,40,220',.33*a);blob(X,gy-4*s,Wd*s*.55,'255,40,100',.26*a*pul);blob(X,gy-6*s,130*s,'210,140,255',.3*a*pul);
  /* nứt đất: lan dần ra, đỏ viền tím */
  var rv=Math.min(1,p/.2),ck=.55+.45*Math.sin(t*.3);
  g.lineCap='round';g.lineJoin='round';
  for(i=0;i<cr.length;i++){var pts=cr[i],n=Math.max(2,Math.round(pts.length*rv)),pass;
   for(pass=0;pass<2;pass++){g.strokeStyle=pass?'rgba(255,170,200,'+.8*a*ck+')':'rgba(255,30,90,'+.5*a+')';g.lineWidth=(pass?1.4:5)*s;g.beginPath();
    for(k=0;k<n;k++){var x=X+pts[k][0]*s,y=gy-2*s+pts[k][1]*s*.2;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}
  /* pháp trận trên mặt đất (vẽ trong không gian ellipse) */
  g.translate(X,gy-3*s);g.scale(1,.3);
  var Ro=235*s*gr,Rm=172*s*gr,Ri=84*s*gr;
  /* vành ngoài: xoay thuận + phù văn */
  g.save();g.rotate(t*.011);ring(Ro,7*s,'#9a50ff',.85*a);ring(Ro*1.045,2*s,'#ff2a6a',.7*a);ring(Ro*.93,2*s,'#e8c8ff',.55*a);
  g.strokeStyle='#f0d8ff';g.lineWidth=2*s;g.globalAlpha=.85*a*pul;
  for(i=0;i<28;i++){g.save();g.rotate(i/28*TAU);g.translate(Ro*.975,0);g.rotate(PI/2);glyph(i*3.7,15*s);g.restore()}g.restore();
  /* vành giữa: xoay nghịch + bát quái (3 vạch, vạch đứt) */
  g.save();g.rotate(-t*.016);ring(Rm,5*s,'#c070ff',.8*a);ring(Rm*.88,1.8*s,'#ff5a8a',.6*a);
  g.strokeStyle='#ffd0e8';g.lineWidth=3.2*s;g.globalAlpha=.9*a;
  for(i=0;i<8;i++){g.save();g.rotate(i/8*TAU);for(j=0;j<3;j++){var rr=Rm*(.64+j*.08),broken=hs(i*3+j)>.5;g.beginPath();
    if(broken){g.arc(0,0,rr,-.16,-.04);g.moveTo(Math.cos(.04)*rr,Math.sin(.04)*rr);g.arc(0,0,rr,.04,.16)}else g.arc(0,0,rr,-.16,.16);g.stroke()}g.restore()}g.restore();
  /* sao + Thái Cực */
  g.save();g.rotate(t*.02);g.strokeStyle='#d8a8ff';g.lineWidth=2.4*s;g.globalAlpha=.7*a;g.beginPath();
  for(i=0;i<=8;i++){var an=i*(TAU/8)*3%TAU,xx=Math.cos(an)*Ri*1.35,yy=Math.sin(an)*Ri*1.35;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke();g.restore();
  ring(Ri*1.2,4*s,'#ff2a6a',.65*a*pul);
  g.globalCompositeOperation='source-over';yinyang(Ri,t*.03,.95*a);
  g.restore();
  /* oán hồn bay lên */
  g.globalCompositeOperation='lighter';
  for(i=0;i<nw;i++){var u=(t*.0085*(.7+hs(i)*.6)+hs(i+3))%1,wx=X+(hs(i+9)-.5)*2*Wd*s+Math.sin(t*.05+i)*14*s,wy=gy-(8+u*210)*s,al=Math.sin(u*PI)*.75*a;
   g.globalAlpha=al;g.strokeStyle='rgba(200,140,255,.8)';g.lineWidth=2.4*s;g.beginPath();g.moveTo(wx,wy);
   for(j=1;j<=4;j++)g.lineTo(wx-Math.sin(t*.05+i+j)*6*s*j*.5,wy+j*7*s);g.stroke();
   blob(wx,wy,(13+hs(i)*8)*s,'200,140,255',.55*al/Math.max(.01,a));blob(wx,wy-2*s,5*s,'255,255,255',.5*al/Math.max(.01,a))}
  g.restore()})}

/* 2) SÓNG XUNG KÍCH ra tới mép vùng tác động */
function shockFx(px,r){
 var Rr=reach(r);
 [0,7].forEach(function(dl,idx){fx(px,34,function(f,p,X,gy){
  var pp=Math.max(0,(p*34-dl)/(34-dl)),e=easeO(pp);if(pp<=0)return;
  g.save();g.globalCompositeOperation='lighter';g.translate(X,gy-3*s);g.scale(1,.26);
  g.globalAlpha=(1-pp)*.8;g.strokeStyle=idx?'#ff2a6a':'#c070ff';g.lineWidth=(16-12*pp)*s;g.beginPath();g.arc(0,0,Rr*s*e,0,TAU);g.stroke();
  if(!idx){g.globalAlpha=(1-pp)*.5;g.strokeStyle='#fff0ff';g.lineWidth=3*s;g.beginPath();g.arc(0,0,Rr*s*e*.985,0,TAU);g.stroke();g.globalAlpha=(1-pp)*.18;g.fillStyle='#7a30d0';g.beginPath();g.arc(0,0,Rr*s*e,0,TAU);g.fill()}
  g.restore()})})}

/* 3) BÙA CHÚ ĐỎ LƠ LỬNG */
function talisFx(px,r,q){
 var N=Math.round(9*q),Wd=reach(r);
 fx(px,LIFE,function(f,p,X,gy){
  var a=p<.04?p/.04:p>.88?(1-p)/.12:1,t=fr,i;
  g.save();
  for(i=0;i<N;i++){var d=hs(i+5)*.1,rs=easeO((p-d)/.1);if(rs<=0)continue;
   var ox=(hs(i*3.1)-.5)*2*Wd*s,hy=(60+hs(i+2)*140)*s*rs+Math.sin(t*.04+i)*7*s,x=X+ox+Math.sin(t*.03+i*2)*8*s,y=gy-hy,w=15*s,h=46*s;
   g.save();g.translate(x,y);g.rotate(Math.sin(t*.035+i)*.14);
   g.globalCompositeOperation='lighter';blob(0,0,34*s,'255,40,90',.4*a);
   g.globalCompositeOperation='source-over';g.globalAlpha=a;
   var gd=g.createLinearGradient(0,-h/2,0,h/2);gd.addColorStop(0,'#e82848');gd.addColorStop(1,'#6e0a1e');g.fillStyle=gd;g.fillRect(-w/2,-h/2,w,h);
   g.fillStyle='#ffcc66';g.fillRect(-w/2,-h/2,w,3*s);g.fillRect(-w/2,h/2-3*s,w,3*s);
   g.strokeStyle='#ffd8e0';g.lineWidth=1*s;g.strokeRect(-w/2,-h/2,w,h);
   g.strokeStyle='#2a0410';g.lineWidth=1.8*s;g.save();g.translate(0,-9*s);glyph(i*5.3,9*s);g.restore();g.save();g.translate(0,8*s);glyph(i*7.9+3,9*s);g.restore();
   g.restore()}
  g.restore()})}

/* 5) SÉT TÍM */
function boltFx(wx){
 var pts=[],i,br=[];for(i=0;i<=8;i++)pts.push([i&&i<8?(R()-.5)*60:0,i/8]);
 var b0=2+Math.floor(R()*3);br=[b0,(R()<.5?-1:1)*(40+R()*50)];
 fx(wx,9,function(f,p,X,gy){
  var a=1-p;g.save();g.lineJoin='round';g.lineCap='round';
  var top=Math.max(20*s,gy-360*s);
  [['#7a30e0',9*s,.5*a],['#d8a8ff',3.4*s,.9*a],['#ffffff',1.4*s,a]].forEach(function(o){g.globalAlpha=o[2];g.strokeStyle=o[0];g.lineWidth=o[1];g.beginPath();
   pts.forEach(function(q,k){var x=X+q[0]*s,y=top+q[1]*(gy-top-4*s);k?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();
   var q0=pts[br[0]],x0=X+q0[0]*s,y0=top+q0[1]*(gy-top);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+br[1]*s,y0+40*s);g.lineTo(x0+br[1]*1.5*s,y0+85*s);g.stroke()});
  blob(X,gy-4*s,60*s*(1-p*.4),'200,130,255',.7*a);
  g.restore()})}

/* 6) DẤU TRÚNG ĐÒN */
function hitFx(e){
 var sd=e.x*.31;
 fx(e.x,16,function(f,p,X,gy){
  var a=1-p,cy=gy-((e.hh||90)*(typeof SZ!=='undefined'?SZ:1)*.5)*s,i;
  g.save();blob(X,cy,(26+30*p)*s,'190,100,255',.7*a);
  g.strokeStyle='#e8c8ff';g.lineWidth=2.2*s;g.globalAlpha=a;g.lineCap='round';g.beginPath();
  for(i=0;i<6;i++){var an=hs(sd+i)*TAU,r0=(10+14*p)*s,r1=(26+40*hs(sd+i+3))*s*Math.min(1,p*2.5+.2);g.moveTo(X+Math.cos(an)*r0,cy+Math.sin(an)*r0);g.lineTo(X+Math.cos(an)*r1,cy+Math.sin(an)*r1)}g.stroke();
  g.strokeStyle='#ff2a6a';g.lineWidth=1.6*s;g.beginPath();g.ellipse(X,cy,(14+36*p)*s,(8+20*p)*s,0,0,TAU);g.stroke();
  g.restore()})}

/* 7) DÒNG HÚT MÁU: địch → người chơi */
function drainFx(e){
 fx(e.x,28,function(f,p,X,gy){
  var dx=(P.x-e.x)*s,y0=gy-70*s,y1=gy-80*s,k;
  g.save();
  for(k=0;k<5;k++){var u=Math.max(0,Math.min(1,p*1.5-k*.1));if(u<=0||u>=1)continue;
   var x=X+dx*u,y=y0+(y1-y0)*u-Math.sin(u*PI)*46*s+Math.sin(u*9+k)*5*s,al=Math.sin(u*PI);
   blob(x,y,(12-5*u)*s,'255,40,100',.8*al);blob(x,y,(6-2*u)*s,'255,200,230',.8*al)}
  g.restore()})}

/* bụi đá + hạt tím khi tay mọc */
function dust(wx){try{for(var i=0;i<3;i++)PT.push({x:wx,y:20+R()*20,vx:(R()-.5)*3,vy:-R()*3,l:22,c:i%2?'#c070ff':'#ff2a6a'})}catch(e){}}

/* ---------- API cho world/53 ---------- */
function start(px,dd,r,lg){
 var q=Q();
 groundFx(px,r,q);shockFx(px,r);talisFx(px,r,q);
 try{L.flash('#7a40c0',4)}catch(e){}
 hands=[]}
function tick(w,A,px,dd,r){
 var q=Q(),cap=Math.round(14*q),Wd=reach(r),i,n;
 hands=hands.filter(function(t){return t>fr});
 function hand(wx,sc){if(hands.length>=cap||FX.length>90)return;hands.push(fr+58);L.handFx(wx,58,sc);dust(wx)}
 n=Math.max(1,Math.round(3*q));
 A.slice(0,n).forEach(function(e){hand(e.x+L.rnd(-26,26),L.rnd(.8,1.3));if(w%2===0&&FX.length<80)hitFx(e)});
 n=Math.max(1,Math.round(2*q));
 for(i=0;i<n;i++)hand(px+(R()*2-1)*Wd,L.rnd(.55,1.15));
 if(w%3===1&&q>=.6&&FX.length<80)boltFx(px+(R()*2-1)*Wd);
 if(w%4===1&&A.length&&FX.length<80)drainFx(A[Math.floor(R()*A.length)])}

window.MDFX={on:on,start:start,tick:tick,cfg:CFG,H:{glyph:glyph,ring:ring,yinyang:yinyang,mkCracks:mkCracks,boltFx:boltFx},live:function(){hands=hands.filter(function(t){return t>fr});return hands.length}};
})();
