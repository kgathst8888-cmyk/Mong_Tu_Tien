/* ===== ⚔️ HIỆU ỨNG KỸ NĂNG PHÀM THỂ PRO (world/105-pham-the-fx-pro.js) — Fix346 =====
 * Vẽ lại TOÀN BỘ hiệu ứng: (1) kỹ năng cơ bản (bảng SFX) của 3 hệ Kiếm/Pháp/Cung + 6 nhánh (Kiếm Khách, Thương Thủ,
 * Triệu Hồi Sư, Ma Thuật Sư, Xạ Thủ, Thích Khách); (2) 30 kỹ năng tu tiên (ZFC: Luyện Khí → Hoá Thần); (3) đòn trúng.
 * Chỉ VẼ — không đổi sát thương / hồi chiêu / logic. Logic gốc vẫn chạy nhưng bị "mute" phần vẽ cũ (ZS.X.mute),
 * hiệu ứng mới thay thế hẳn nên không bị chồng chéo → rõ nét hơn, nhẹ hơn.
 * Kỹ thuật: lưỡi trảm hình trăng khuyết 3 lớp (quầng/thân/lõi trắng), trận pháp elip có chữ, tia 3 lớp, sét 3 lớp,
 * vũ khí vẽ chi tiết (kiếm/thương/tên) — KHÔNG dùng shadowBlur (nặng trên điện thoại), dùng glowDraw có cache.
 * Chỉnh: PTXU_CF.enable=false (tắt, về hiệu ứng cũ) · PTXU_CF.q (0.4–1.5, mật độ hạt) · PTXU_CF.maxFx (trần số lớp vẽ). */
(function(){
'use strict';
if(typeof ZS==='undefined'||!ZS.X||typeof g==='undefined'||typeof glowDraw!=='function'||typeof RGBA!=='function')return;
var X=ZS.X,CF=window.PTXU_CF=window.PTXU_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(!CF.q)CF.q=(window.TGFX&&window.TGFX.CF&&window.TGFX.CF.q)||1;
if(!CF.maxFx)CF.maxFx=90;
if(!CF.enable)return;
var PI=Math.PI,TAU=PI*2,sin=Math.sin,cos=Math.cos,R=Math.random,later=X.later,bst=X.bst,fp=X.fp,SFX=X.SFX,ZFC=X.ZFC;
var FONT="bold 22px 'Ma Shan Zheng',KTH Serif,STKaiti,KaiTi,serif";
function Q(n){return Math.max(1,Math.round(n*CF.q))}
function F(x,l,fn){if(FX.length>CF.maxFx)return;X.fx({x:x,l:l,fn:fn})}
function env(p,a,b){return p<a?p/a:p>1-b?Math.max(0,(1-p)/b):1}
function glw(x,y,r,c,a){if(r>.5&&a>.02)glowDraw(x,y,r,c,Math.min(1,a))}
function foes(r){return E.filter(function(e){return e.in<=0&&(r==null||Math.abs(e.x-P.x)<r)})}
function hash(i){var v=sin(i*12.9898)*43758.5453;return v-Math.floor(v)}
function ease(p){return 1-(1-p)*(1-p)}

/* trăng khuyết: cung ngoài bán kính Rr từ a0→a1, bụng trong dày th */
function lune(cx,cy,Rr,a0,a1,th,c,al){
 if(al<=.01||a1-a0<.02)return;var m=(a0+a1)/2;
 g.beginPath();g.arc(cx,cy,Rr,a0,a1);
 g.quadraticCurveTo(cx+cos(m)*(Rr-th*2),cy+sin(m)*(Rr-th*2),cx+cos(a0)*Rr,cy+sin(a0)*Rr);
 g.closePath();g.globalAlpha=al;g.fillStyle=c;g.fill();g.globalAlpha=1}

/* lưỡi trảm: tâm đánh (x,y), bán kính len, nghiêng ang, mirror d */
function slash(x,y,len,ang,c,l,d,w){d=d||1;w=w||1;
 F(x,l,function(o,p,X0,gy){
  var Rr=len*s,e=Math.min(1,p*2.4),tl=Math.max(0,(p-.3)*1.1),h=-1.15+2.3*e,t=-1.15+2.3*tl*e,al=1-Math.max(0,(p-.45)*1.8);
  if(al<=0)return;
  g.save();g.translate(X0,gy-y*s);g.scale(d,1);g.rotate(ang);g.translate(-Rr,0);
  lune(0,0,Rr,t,h,17*s*w,RGBA(c,1),.3*al);
  lune(0,0,Rr,t,h,11*s*w,RGBA(c,1),.85*al);
  lune(0,0,Rr,t+.05,h,4.4*s*w,'#ffffff',al);
  g.restore();
  var hx=X0+d*(cos(ang)*(cos(h)*Rr-Rr)-sin(ang)*sin(h)*Rr),hy=gy-y*s+(sin(ang)*(cos(h)*Rr-Rr)+cos(ang)*sin(h)*Rr);
  glw(hx,hy,22*s*w,'#ffffff',al*.9);glw(hx,hy,40*s*w,c,al*.6)})}

/* vòng sóng sát đất */
function ring(x,r,c,l,w){w=w||1;
 F(x,l,function(o,p,X0,gy){
  var r0=r*s*ease(p),al=1-p;g.save();g.translate(X0,gy-4*s);g.scale(1,.26);
  g.lineWidth=(12*(1-p)+3)*s*w;g.strokeStyle=RGBA(c,.26*al);g.beginPath();g.arc(0,0,r0,0,TAU);g.stroke();
  g.lineWidth=(4*(1-p)+1)*s*w;g.strokeStyle=RGBA('#ffffff',.9*al);g.beginPath();g.arc(0,0,r0,0,TAU);g.stroke();
  g.lineWidth=2*s;g.strokeStyle=RGBA(c,.8*al);g.beginPath();g.arc(0,0,r0*.82,0,TAU);g.stroke();
  g.restore()})}

/* trận pháp elip: 2 vòng + đa giác sao + chữ quay */
function circle(x,Rr,c,l,txt,c2,n){c2=c2||'#ffffff';n=n||6;
 F(x,l,function(o,p,X0,gy){
  var a=env(p,.15,.3),r=Rr*s*Math.min(1,.55+p*2.2),rot=fr*.035,i,k;
  if(a<=0)return;
  g.save();g.translate(X0,gy-4*s);g.scale(1,.28);g.lineJoin='round';
  g.lineWidth=3.2*s;g.strokeStyle=RGBA(c,.9*a);g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.lineWidth=1.6*s;g.beginPath();g.arc(0,0,r*.87,0,TAU);g.stroke();
  g.strokeStyle=RGBA(c2,.75*a);g.lineWidth=1.8*s;g.beginPath();
  for(i=0;i<=n;i++){k=(i*2%n);var an=-rot*1.4+k*TAU/n;i?g.lineTo(cos(an)*r*.8,sin(an)*r*.8):g.moveTo(cos(an)*r*.8,sin(an)*r*.8)}
  g.stroke();
  for(i=0;i<24;i++){var a2=rot+i*TAU/24;g.beginPath();g.moveTo(cos(a2)*r*.9,sin(a2)*r*.9);g.lineTo(cos(a2)*r*(i%2?.96:1),sin(a2)*r*(i%2?.96:1));g.stroke()}
  if(txt){g.font=(Math.max(10,r/s*.16))*s+"px 'Ma Shan Zheng',KTH Serif,STKaiti,KaiTi,serif";g.textAlign='center';g.textBaseline='middle';g.fillStyle=RGBA(c2,.95*a);
   for(i=0;i<txt.length;i++){var a3=-rot+i*TAU/txt.length;g.save();g.translate(cos(a3)*r*.93,sin(a3)*r*.93);g.fillText(txt.charAt(i),0,0);g.restore()}}
  g.restore();glw(X0,gy-6*s,r*.55,c,a*.3)})}

/* cột sáng + hạt bay lên */
function pillar(x,w,c,l,h){h=h||320;
 F(x,l,function(o,p,X0,gy){
  var a=env(p,.2,.5),ww=w*s*(1-p*.4),H=h*s,q=g.createLinearGradient(0,gy,0,gy-H),i;
  if(a<=0)return;
  q.addColorStop(0,RGBA(c,.9*a));q.addColorStop(.55,RGBA(c,.35*a));q.addColorStop(1,RGBA(c,0));
  g.fillStyle=q;g.fillRect(X0-ww,gy-H,ww*2,H);
  q=g.createLinearGradient(0,gy,0,gy-H);q.addColorStop(0,'rgba(255,255,255,'+.95*a+')');q.addColorStop(.7,'rgba(255,255,255,'+.25*a+')');q.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=q;g.fillRect(X0-ww*.32,gy-H,ww*.64,H);
  for(i=0;i<7;i++){var u=(p*1.6+i/7)%1;glw(X0+(hash(i)-.5)*ww*1.6,gy-u*H*.9,(5+hash(i+9)*6)*s,i%2?'#ffffff':c,a*(1-u)*.9)}
  glw(X0,gy-4*s,ww*2.2,c,a*.7)})}

/* tia ngang 3 lớp + ánh chạy */
function beam(x1,x2,y,w,c,l){
 F(x1,l,function(o,p,X0,gy){
  var Xa=(x1-cam)*s,Xb=(x2-cam)*s,a=env(p,.12,.55),Y=gy-y*s,ww=w*s*(1-p*.3),q,i;
  if(a<=0)return;var L=Xb-Xa,x0=Math.min(Xa,Xb),len=Math.abs(L);
  q=g.createLinearGradient(0,Y-ww,0,Y+ww);q.addColorStop(0,RGBA(c,0));q.addColorStop(.3,RGBA(c,.55*a));q.addColorStop(.5,'rgba(255,255,255,'+a+')');q.addColorStop(.7,RGBA(c,.55*a));q.addColorStop(1,RGBA(c,0));
  g.fillStyle=q;g.fillRect(x0,Y-ww,len,ww*2);
  g.strokeStyle='rgba(255,255,255,'+.8*a+')';g.lineWidth=Math.max(1,ww*.12);
  for(i=0;i<4;i++){var u=((p*2.5+i/4)%1),xx=Xa+L*u,yy=Y+(hash(i+3)-.5)*ww*1.2;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx-Math.sign(L)*ww*1.6,yy);g.stroke()}
  glw(Xa,Y,ww*2.4,c,a*.9);glw(Xb,Y,ww*2,'#ffffff',a*.6)})}

/* sét 3 lớp từ trời xuống */
function bolt(x,c,l,sc){sc=sc||1;var seg=X.mkbolt();
 F(x,l,function(o,p,X0,gy){
  var a=(p<.15?p/.15:1-p)*(R()<.25?.55:1),k,pass;
  g.save();g.translate(X0,gy);g.scale(s*sc,s*sc);g.lineJoin='round';g.lineCap='round';
  for(pass=0;pass<3;pass++){g.lineWidth=[11,5,1.8][pass];g.strokeStyle=pass==2?'rgba(255,255,255,'+a+')':RGBA(c,(pass?.8:.25)*a);
   seg.forEach(function(sg){g.beginPath();sg.forEach(function(pt,j){j?g.lineTo(pt[0],-pt[1]):g.moveTo(pt[0],-pt[1])});g.stroke()})}
  g.restore();glw(X0,gy-30*s,60*s*sc,c,a*.8);glw(X0,gy-24*s,26*s,'#ffffff',a)})}

/* sao nổ va chạm */
function burst(x,y,r,c,l,n){n=n||8;
 F(x,l,function(o,p,X0,gy){
  var a=1-p,e=ease(p),Y=gy-y*s,i;
  glw(X0,Y,r*s*(.6+e*.7),c,a*.85);glw(X0,Y,r*s*.45*(1-p*.6),'#ffffff',a);
  g.lineCap='round';
  for(i=0;i<n;i++){var an=i*TAU/n+hash(i)*.3,L=r*s*(i%2?.55:1)*(.35+e*.9);
   g.strokeStyle=i%2?RGBA(c,a):'rgba(255,255,255,'+a+')';g.lineWidth=(i%2?2:3.4)*s*(1-p*.6);
   g.beginPath();g.moveTo(X0+cos(an)*L*.25,Y+sin(an)*L*.25*.8);g.lineTo(X0+cos(an)*L,Y+sin(an)*L*.8);g.stroke()}})}
function hitBurst(x,y,c,big){burst(x,y,big?90:58,c,big?18:14,big?12:8);bst(x,y,Q(big?18:10),c,big?7:5,18,3,{k:'s'});bst(x,y,Q(5),'#ffffff',4,14,3,{k:'d'})}

/* vũ khí vẽ chi tiết (mũi hướng theo ang, toạ độ màn hình) */
function sword(x,y,L,ang,c,al){g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=al;
 g.fillStyle=RGBA(c,1);g.beginPath();g.moveTo(L,0);g.lineTo(L*.12,-L*.07);g.lineTo(-L*.04,-L*.05);g.lineTo(-L*.04,L*.05);g.lineTo(L*.12,L*.07);g.closePath();g.fill();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(L,0);g.lineTo(L*.14,-L*.022);g.lineTo(-L*.02,0);g.lineTo(L*.14,L*.022);g.closePath();g.fill();
 g.fillStyle=RGBA(c,1);g.fillRect(-L*.1,-L*.15,L*.06,L*.3);g.fillStyle='#ffe9a0';g.fillRect(-L*.1,-L*.15,L*.06,L*.05);
 g.fillStyle=RGBA(c,.9);g.fillRect(-L*.3,-L*.025,L*.2,L*.05);g.restore();
 glw(x+cos(ang)*L,y+sin(ang)*L,L*.28,c,al*.7);glw(x,y,L*.5,c,al*.25)}
function spear(x,y,L,ang,c,al){g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=al;
 g.strokeStyle=RGBA(c,.9);g.lineWidth=Math.max(1.5,L*.025);g.beginPath();g.moveTo(-L*.6,0);g.lineTo(L*.7,0);g.stroke();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(L,0);g.lineTo(L*.7,-L*.06);g.lineTo(L*.76,0);g.lineTo(L*.7,L*.06);g.closePath();g.fill();
 g.fillStyle=RGBA('#ff4040',.9);g.fillRect(L*.62,-L*.035,L*.05,L*.07);g.restore();glw(x+cos(ang)*L,y+sin(ang)*L,L*.22,c,al*.7)}
function arrow(x,y,L,ang,c,al){g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=al;
 g.strokeStyle=RGBA(c,.95);g.lineWidth=Math.max(1.4,L*.04);g.beginPath();g.moveTo(-L,0);g.lineTo(0,0);g.stroke();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(L*.28,0);g.lineTo(-L*.04,-L*.1);g.lineTo(-L*.04,L*.1);g.closePath();g.fill();
 g.fillStyle=RGBA(c,.9);g.beginPath();g.moveTo(-L,0);g.lineTo(-L*.82,-L*.11);g.lineTo(-L*.74,0);g.lineTo(-L*.82,L*.11);g.closePath();g.fill();g.restore();
 glw(x,y,L*.35,c,al*.6)}
function crystal(x,y,r,rot,c,al){g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=al;
 g.fillStyle=RGBA(c,.55);g.strokeStyle='#ffffff';g.lineWidth=Math.max(1,r*.07);g.beginPath();
 g.moveTo(0,-r);g.lineTo(r*.32,-r*.25);g.lineTo(r*.3,r*.5);g.lineTo(0,r*.7);g.lineTo(-r*.3,r*.5);g.lineTo(-r*.32,-r*.25);g.closePath();g.fill();g.stroke();
 g.globalAlpha=al*.7;g.beginPath();g.moveTo(0,-r);g.lineTo(0,r*.7);g.moveTo(-r*.32,-r*.25);g.lineTo(r*.3,r*.5);g.stroke();g.restore();glw(x,y,r*1.2,c,al*.35)}
function glyph(x,y,txt,sz,c,al,rot){g.save();g.translate(x,y);if(rot)g.rotate(rot);g.font=sz+"px 'Ma Shan Zheng',KTH Serif,STKaiti,KaiTi,serif";g.textAlign='center';g.textBaseline='middle';
 g.globalAlpha=al*.5;g.fillStyle=RGBA(c,1);g.fillText(txt,0,0);g.globalAlpha=al*.9;g.fillText(txt,0,0);g.fillStyle='#ffffff';g.globalAlpha=al*.55;g.fillText(txt,0,0);g.restore();glw(x,y,sz*.9,c,al*.35)}

/* vật thể rơi / bay (kiếm, tên, thương, sao băng) — 1 lớp vẽ nhiều vật + nổ tuỳ điểm rơi */
function fall(xs,kind,c,gap,dur,imp,fromX){
 var n=xs.length,tot=n*gap+dur+4,H=330;
 xs.forEach(function(x,i){if(imp)later(i*gap+dur,function(){imp(x,i)})});
 F(P.x,tot,function(o,p,X0,gy){
  var fr0=p*tot,i;
  for(i=0;i<n;i++){var u=(fr0-i*gap)/dur;if(u<0||u>1)continue;
   var tx=(xs[i]-cam)*s,sx0=((fromX!=null?fromX:xs[i]-70)-cam)*s+(hash(i)-.5)*40*s,e=u*u,px_=sx0+(tx-sx0)*e,py=gy-(H-(H-18)*e)*s,ang=Math.atan2(gy-18*s-(gy-H*s),tx-sx0);
   if(kind=='sword'){sword(px_,py,56*s,ang,c,1);g.strokeStyle=RGBA(c,.45);g.lineWidth=3*s;g.beginPath();g.moveTo(px_,py);g.lineTo(px_-cos(ang)*120*s,py-sin(ang)*120*s);g.stroke()}
   else if(kind=='spear'){spear(px_,py,64*s,ang,c,1);g.strokeStyle=RGBA(c,.4);g.lineWidth=3*s;g.beginPath();g.moveTo(px_,py);g.lineTo(px_-cos(ang)*130*s,py-sin(ang)*130*s);g.stroke()}
   else if(kind=='arrow'){arrow(px_,py,46*s,ang,c,1)}
   else if(kind=='meteor'){var rr=22*s;g.fillStyle=RGBA(c,.45);g.beginPath();g.moveTo(px_-sin(ang)*rr,py+cos(ang)*rr);g.lineTo(px_-cos(ang)*190*s,py-sin(ang)*190*s);g.lineTo(px_+sin(ang)*rr,py-cos(ang)*rr);g.closePath();g.fill();
    glw(px_,py,rr*2.8,c,.9);glw(px_,py,rr*1.5,'#ffffff',1);for(var k=0;k<3;k++)glw(px_-cos(ang)*(30+k*34)*s,py-sin(ang)*(30+k*34)*s,rr*(1.5-k*.35),'#ffd060',.7)}
   else{glw(px_,py,20*s,c,.9);glw(px_,py,9*s,'#ffffff',1);glw(px_-cos(ang)*40*s,py-sin(ang)*40*s,15*s,c,.5)}}})}

/* xoáy thăng (helix) bao quanh vị trí */
function helix(x,r,H,c,l,n){n=n||3;
 F(x,l,function(o,p,X0,gy){
  var a=env(p,.15,.35),k,j;if(a<=0)return;
  for(k=0;k<n;k++){for(j=0;j<14;j++){var u=j/13,ang=p*9+k*TAU/n+u*7,rr=r*s*(.55+.45*sin(u*PI)),yy=gy-(u*H+6)*s;
    glw(X0+cos(ang)*rr,yy+sin(ang)*rr*.22,(5+u*3)*s,j%3?c:'#ffffff',a*(sin(ang)>0?.9:.45)*(1-u*.4))}}})}

/* khói / bụi */
function smoke(x,n,c,l,spread){
 var pts=[];for(var i=0;i<n;i++)pts.push([(hash(i)-.5)*spread,hash(i+5)*30,10+hash(i+9)*14]);
 F(x,l,function(o,p,X0,gy){var a=(1-p)*.8;pts.forEach(function(q,i){var gx=X0+q[0]*s*(1+p),gyy=gy-(q[1]+p*40)*s;g.globalCompositeOperation='source-over';g.globalAlpha=a*.5;g.fillStyle=c;g.beginPath();g.arc(gx,gyy,q[2]*s*(1+p*1.4),0,TAU);g.fill()});g.globalAlpha=1})}

/* tối màn hình */
function dim(c,l,a0){F(P.x,l,function(o,p){var a=env(p,.2,.3)*(a0||.4);g.globalCompositeOperation='source-over';g.globalAlpha=a;g.fillStyle=c;g.fillRect(0,0,W,H);g.globalAlpha=1})}
function sk(c){return c||'#ffffff'}
window.__PTX={Q:Q,F:F,env:env,glw:glw,foes:foes,hash:hash,lune:lune,slash:slash,ring:ring,circle:circle,pillar:pillar,beam:beam,bolt:bolt,burst:burst,hitBurst:hitBurst,sword:sword,spear:spear,arrow:arrow,crystal:crystal,glyph:glyph,fall:fall,helix:helix,smoke:smoke,dim:dim};
})();
