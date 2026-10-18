/* ===== 🏯 LÀNG TÂN THỦ 2 (world/100-lang-tan-thu-2.js · Fix303) =====
 * - Cổng truyền tống trên trời Làng Tân Thủ (cùng kiểu cổng Linh Điền / Ma Thần): chạm → đi tới → vào Làng Tân Thủ 2.
 * - Điều kiện vào: Lv60 Phàm Thể trở lên (Đạo Thể / Tiên Nhân đã qua mốc này nên vào được ở mọi cấp). Chưa đủ → hiện thông báo khoá.
 * - Làng Tân Thủ 2 có 5 nhà: ⚔ Chiến Trường Tiên·Ma · 💍 Chế Tạo Trang Sức Hoàng Kim · 🔨 Kỹ Năng Nghề Nghiệp · 2 nhà bí ẩn.
 *   Cả 5 nhà hiện "Cập nhật sau" khi chạm (chưa có chức năng). Sửa HOUSES bên dưới để gắn chức năng: đặt open:function(){...}.
 * - Người chơi gặp nhau ở đây với ĐẦY ĐỦ ngoại hình (trang bị, cánh, hiệu ứng, danh hiệu, thú, pháp bảo...):
 *   dùng chung cơ chế world/77-thanh-online.js, bản đồ số 4 (cần chạy lại thanh_online.sql 1 lần trong Supabase).
 *   Máy chủ chưa cập nhật → làng vẫn đi lại được nhưng không thấy người khác (không lẫn sang bản đồ khác).
 * - Cách móc: bọc vdraw / vstep / step + nút 🏘 (giống Mỏ, Linh Điền). Khi ở làng 2, vẽ nền riêng, bỏ qua cảnh Làng 1.
 *   Chạm trên canvas: bắt ở document (pha capture) khi đang ở làng 2 để các module của Làng 1 không nhận nhầm.
 * Chỉnh: REQ_LV (cấp yêu cầu), HOUSES (tên/màu/chữ), GATE_* (vị trí cổng ở làng 1). Tắt: bỏ <script> trong index.html.
 * Phụ thuộc: vdraw, vstep, step, hero, drawEP, nameTag, bww, vw, cl, g/W/H/s/GY/PORT/fr/P/vt/vgo/mvDir/c/DT, HDAO, CTHE, VWD, VDY, CITYOL (77). */
(function(){
'use strict';
if(typeof vdraw!=='function'||typeof vstep!=='function'||typeof step!=='function'||typeof hero!=='function'||typeof g==='undefined'||typeof c==='undefined')return;

var REQ_LV=60,FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',PI2=6.2832;
var HOUSES=[
 {l1:'Chiến Trường',l2:'Tiên · Ma',  full:'Nhà Chiến Trường Tiên · Ma',        ch:'戰',col:'#a8322a',fx:0},
 {l1:'Trang Sức',   l2:'Hoàng Kim',  full:'Nhà Chế Tạo Trang Sức Hoàng Kim',    ch:'飾',col:'#c9962a',fx:1},
 {l1:'Kỹ Năng',     l2:'Nghề Nghiệp',full:'Nhà Kỹ Năng Nghề Nghiệp',            ch:'技',col:'#2f7f6a',fx:2},
 {l1:'Nhà Bí Ẩn',   l2:'Sắp mở',     full:'Nhà Bí Ẩn (1)',                      ch:'秘',col:'#5a4a8a',fx:3},
 {l1:'Nhà Bí Ẩn',   l2:'Sắp mở',     full:'Nhà Bí Ẩn (2)',                      ch:'秘',col:'#7a4a2a',fx:3}
];
var on=false,go=null,flash=0,note=null,gateGo=0,BGC=null,BGK='';

function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:170})}catch(e){}}
function lite(){return (window.QL|0)>=2}

/* ---------- điều kiện vào ---------- */
function isDao(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function isTien(){try{return !!(window.CTHE&&CTHE.on())}catch(e){return false}}
function eligible(){return isTien()||isDao()||((P&&P.lv)|0)>=REQ_LV}

/* ---------- vị trí ---------- */
var bx=function(i){return vw()*(.12+.19*i)};
var GATE_X=function(){return vw()*.31},GATE_Y=function(){return GY-(PORT?300:235)*s},GATE_R=function(){return 46*s};
var BACK_X=function(){return vw()*.5},BACK_Y=function(){return GY-(PORT?300:235)*s};
function plainVillage(){
  try{
    if(!vil||!started||bo||on)return false;
    if(window.VWD&&VWD.plain&&!VWD.plain())return false;
    if(window.TG&&TG.on&&TG.on())return false;
    if(window.LCT&&LCT.on&&LCT.on())return false;
    return true}catch(e){return false}}

/* ---------- vào / ra ---------- */
function enter(){
  if(!started||!vil||bo)return;
  if(!eligible()){say('🔒 Cần Lv'+REQ_LV+' Phàm Thể trở lên','#ffb4a0');return}
  on=true;go=null;vt=null;vgo=-1;gateGo=0;flash=34;
  P.x=cl(BACK_X(),40,vw()-40);P.atk=0;P.pe=null;try{EP.x=P.x-50*P.d}catch(e){}
  say('🏯 Làng Tân Thủ 2','#ffe9a0');}
function leave(){
  if(!on)return;
  on=false;go=null;vt=null;vgo=-1;flash=34;
  P.x=cl(GATE_X(),40,vw()-40);P.atk=0;try{EP.x=P.x-50*P.d}catch(e){}
  say('🏘 Trở về Làng Tân Thủ','#ffe9a0')}
function houseAct(i){
  var H_=HOUSES[i];if(!H_)return;
  if(typeof H_.open==='function'){try{H_.open();return}catch(e){}}
  note={s:H_.full+' — Cập nhật sau',t:150}}

/* ---------- nền tĩnh (vẽ 1 lần vào canvas đệm) ---------- */
function ridge(q,W,base,amp,col,seed,f1,f2){
  q.fillStyle=col;q.beginPath();q.moveTo(0,base+amp*2);
  for(var x=0;x<=W+8;x+=8){var v=(Math.sin(x*f1+seed)*.55+Math.sin(x*f2+seed*2.1)*.3+Math.sin(x*f1*3.1+seed*3.3)*.15)*.5+.5;q.lineTo(x,base-amp*v)}
  q.lineTo(W,base+amp*2);q.closePath();q.fill()}
function tower(q,x,y,u,col){
  q.fillStyle=col;
  for(var t=0;t<5;t++){var w=(34-t*5.5)*u,yy=y-t*17*u;
    q.beginPath();q.moveTo(x-w-7*u,yy);q.quadraticCurveTo(x-w*.5,yy-2*u,x,yy-13*u);q.quadraticCurveTo(x+w*.5,yy-2*u,x+w+7*u,yy);q.lineTo(x+w,yy+3*u);q.lineTo(x-w,yy+3*u);q.closePath();q.fill();
    q.fillRect(x-w*.62,yy+3*u,w*1.24,10*u)}
  q.fillRect(x-1.2*u,y-5*17*u-14*u,2.4*u,16*u)}
function ginkgo(q,x,gy,h,u,seed){
  q.fillStyle='#5a3f26';q.beginPath();q.moveTo(x-4*u,gy);q.lineTo(x-2.4*u,gy-h*.62);q.lineTo(x+2.4*u,gy-h*.62);q.lineTo(x+4*u,gy);q.closePath();q.fill();
  q.strokeStyle='#5a3f26';q.lineWidth=2.2*u;q.beginPath();q.moveTo(x,gy-h*.5);q.lineTo(x-h*.2,gy-h*.78);q.moveTo(x,gy-h*.55);q.lineTo(x+h*.22,gy-h*.8);q.stroke();
  var cols=['#e9a92a','#f3c13a','#ffd966','#d98f1f'];
  for(var i=0;i<16;i++){var a=rnd(seed+i)*PI2,r=rnd(seed+i+40)*h*.34,cx=x+Math.cos(a)*r*1.15,cy=gy-h*.82+Math.sin(a)*r*.8;
    q.fillStyle=cols[i%4];q.globalAlpha=.9;q.beginPath();q.arc(cx,cy,(h*.13+rnd(seed+i+80)*h*.07),0,PI2);q.fill()}
  q.globalAlpha=1}
function lanternBody(q,x,y,u){
  q.fillStyle='#8f897a';q.fillRect(x-5*u,y-6*u,10*u,6*u);q.fillRect(x-3*u,y-22*u,6*u,16*u);
  q.fillStyle='#a7a090';q.fillRect(x-8*u,y-30*u,16*u,8*u);
  q.fillStyle='#ffd27a';q.fillRect(x-5*u,y-29*u,10*u,6*u);
  q.fillStyle='#8f897a';q.beginPath();q.moveTo(x-11*u,y-30*u);q.lineTo(x,y-40*u);q.lineTo(x+11*u,y-30*u);q.closePath();q.fill()}
function lampXs(){var a=[],i;for(i=0;i<4;i++)a.push(vw()*(.215+.19*i));a.push(vw()*.035);a.push(vw()*.965);return a}
function paintBG(q,Wd,Ht,gy,u){
  var i,x,gr;
  gr=q.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#1d3560');gr.addColorStop(.36,'#5b76ab');gr.addColorStop(.7,'#f0a878');gr.addColorStop(1,'#ffdca4');
  q.fillStyle=gr;q.fillRect(0,0,Wd,Ht);
  for(i=0;i<46;i++){q.globalAlpha=.2+.6*rnd(i*3+3);q.fillStyle='#fff';q.fillRect(rnd(i*3+1)*Wd,rnd(i*3+2)*gy*.42,1.3,1.3)}q.globalAlpha=1;
  var sx=Wd*.74,sy=gy*.66,sr=40*u;
  gr=q.createRadialGradient(sx,sy,sr*.3,sx,sy,sr*4.2);gr.addColorStop(0,'rgba(255,238,180,.85)');gr.addColorStop(.35,'rgba(255,200,130,.38)');gr.addColorStop(1,'rgba(255,190,120,0)');
  q.fillStyle=gr;q.beginPath();q.arc(sx,sy,sr*4.2,0,PI2);q.fill();
  q.fillStyle='#fff3c8';q.beginPath();q.arc(sx,sy,sr,0,PI2);q.fill();
  ridge(q,Wd,gy*.80,gy*.20,'rgba(122,128,184,.9)',1.3,.006,.013);
  tower(q,Wd*.2,gy*.78,u*.85,'rgba(78,70,128,.72)');
  ridge(q,Wd,gy*.88,gy*.14,'rgba(90,118,160,.95)',4.1,.009,.021);
  ridge(q,Wd,gy*.95,gy*.07,'rgba(84,128,96,1)',7.7,.012,.03);
  gr=q.createLinearGradient(0,gy*.7,0,gy);gr.addColorStop(0,'rgba(255,225,175,0)');gr.addColorStop(1,'rgba(255,225,175,.4)');q.fillStyle=gr;q.fillRect(0,gy*.7,Wd,gy*.3);
  /* mặt đất */
  gr=q.createLinearGradient(0,gy-2*u,0,gy+34*u);gr.addColorStop(0,'#8fb461');gr.addColorStop(1,'#587f4a');q.fillStyle=gr;q.fillRect(0,gy-2*u,Wd,Ht-gy+2*u);
  /* cây ngân hạnh vàng sau nhà */
  var tf=[.025,.215,.405,.595,.785,.975];
  for(i=0;i<tf.length;i++)ginkgo(q,vw()*tf[i]*u,gy-1*u,(86+rnd(i+9)*26)*u,u,i*17+3);
  /* đường lát đá */
  var ry=gy+16*u,rh=Math.max(34*u,(Ht-gy)*.82),yb=ry+rh;
  q.fillStyle='#6f6552';q.fillRect(0,ry-3*u,Wd,3*u);
  gr=q.createLinearGradient(0,ry,0,yb);gr.addColorStop(0,'#d3c7a8');gr.addColorStop(1,'#b3a687');q.fillStyle=gr;q.fillRect(0,ry,Wd,rh);
  q.strokeStyle='rgba(95,84,62,.35)';q.lineWidth=1.2;
  var rows=Math.max(2,Math.round(rh/(20*u)));
  for(i=1;i<rows;i++){var yy=ry+rh*i/rows;q.beginPath();q.moveTo(0,yy);q.lineTo(Wd,yy);q.stroke()}
  for(i=0;i<rows;i++){var y0=ry+rh*i/rows,y1=ry+rh*(i+1)/rows;for(x=(i%2?26:0)*u;x<Wd;x+=52*u){q.beginPath();q.moveTo(x,y0);q.lineTo(x,y1);q.stroke()}}
  q.fillStyle='rgba(60,50,35,.3)';q.fillRect(0,yb-3*u,Wd,3*u);
  /* đèn đá (thân) */
  var L=lampXs();for(i=0;i<L.length;i++)lanternBody(q,L[i]*u,gy+10*u,u)}
function ensureBG(){
  var u=s,k=[W,H,Math.round(GY),u.toFixed(3),DPR,vw()|0].join('|');
  if(k===BGK&&BGC)return;BGK=k;
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));
  var q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);
  try{paintBG(q,W,H,GY,u)}catch(e){try{console.warn('[Lang 2] bg',e)}catch(x){}}
  BGC=cv}

/* ---------- nhà ---------- */
function roof(w,y,col){
  g.fillStyle=col;g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.quadraticCurveTo(w-4,y+2,w+20,y-4);g.lineTo(w+6,y+8);g.lineTo(-w-6,y+8);g.fill();
  g.fillStyle='rgba(255,255,255,.1)';g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.lineTo(0,y-22);g.quadraticCurveTo(-w+10,y+6,-w-14,y+2);g.fill();
  g.fillStyle='#e0b84a';g.fillRect(-w-6,y+6,w*2+12,3)}
function houseFx(i,H_,t){
  var f=H_.fx;
  if(f===0){ /* cờ chiến đỏ phấp phới */
    for(var sd=-1;sd<=1;sd+=2){var px=sd*58;g.fillStyle='#5a3f26';g.fillRect(px-1,-112,2,104);
      g.fillStyle='#c62f27';g.beginPath();g.moveTo(px,-110);
      for(var k=0;k<=6;k++)g.lineTo(px+sd*k*5,-110+Math.sin(t*.12+k*.8+sd)*2.4+k*.6);
      for(k=6;k>=0;k--)g.lineTo(px+sd*k*5,-94+Math.sin(t*.12+k*.8+sd)*2.4+k*.6);
      g.closePath();g.fill();g.fillStyle='#ffd45a';g.fillRect(px+sd*10-1,-104,3,3)}
  }else if(f===1){ /* ánh vàng lấp lánh */
    g.save();g.globalCompositeOperation='lighter';
    for(var j=0;j<5;j++){var ph=(t*.02+j*.2)%1,sx=(rnd(i*9+j)-.5)*110,sy=-70-rnd(i*9+j+5)*70,a=Math.sin(ph*3.1416);
      g.fillStyle='rgba(255,226,120,'+(.9*a)+')';var r=2+2.4*a;g.beginPath();g.moveTo(sx,sy-r*1.8);g.lineTo(sx+r*.5,sy);g.lineTo(sx,sy+r*1.8);g.lineTo(sx-r*.5,sy);g.closePath();g.fill();
      g.beginPath();g.moveTo(sx-r*1.8,sy);g.lineTo(sx,sy+r*.5);g.lineTo(sx+r*1.8,sy);g.lineTo(sx,sy-r*.5);g.closePath();g.fill()}
    g.restore();
  }else if(f===2){ /* cuộn trục ngọc bích toả sáng */
    g.save();g.globalCompositeOperation='lighter';var pu=.5+.5*Math.sin(t*.07);
    var q=g.createRadialGradient(0,-124,2,0,-124,36);q.addColorStop(0,'rgba(120,255,200,'+(.35+.2*pu)+')');q.addColorStop(1,'rgba(120,255,200,0)');g.fillStyle=q;g.beginPath();g.arc(0,-124,36,0,PI2);g.fill();g.restore();
  }else{ /* sương tím huyền bí */
    g.save();for(var m=0;m<4;m++){var p2=((t*.007)+m*.25)%1;g.fillStyle='rgba(190,160,255,'+(.32*(1-p2))+')';g.beginPath();g.arc(Math.sin(t*.03+m*2)*10+(m-1.5)*8,-120-p2*50,6+p2*8,0,PI2);g.fill()}g.restore()}}
function house(i,t){
  var H_=HOUSES[i],k=bww()/120,C=H_.col,gl=.55+.45*Math.sin(t*.06+i*1.7);
  g.save();g.translate(bx(i)*s,GY);g.scale(s*k,s*k);
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,2,68,9,0,0,PI2);g.fill();
  g.fillStyle='#8a8372';g.fillRect(-62,-8,124,8);g.fillStyle='#a8a18e';g.fillRect(-62,-8,124,2.5);g.fillStyle='#7a7364';g.fillRect(-16,-3,32,3);
  g.fillStyle='#f0e3c2';g.fillRect(-48,-70,96,62);
  g.fillStyle=C;g.fillRect(-50,-72,9,66);g.fillRect(41,-72,9,66);g.fillRect(-50,-72,100,5);
  for(var sd=-1;sd<=1;sd+=2){var wx=sd<0?-38:18;
    g.fillStyle='rgba(255,205,110,'+(.55+.3*gl)+')';g.fillRect(wx,-58,20,22);g.strokeStyle=C;g.lineWidth=2;g.strokeRect(wx,-58,20,22);
    g.beginPath();g.moveTo(wx+10,-58);g.lineTo(wx+10,-36);g.moveTo(wx,-47);g.lineTo(wx+20,-47);g.stroke()}
  g.fillStyle='#3a1a10';g.fillRect(-12,-54,24,46);g.fillStyle='#5a2a18';g.fillRect(-12,-54,12,46);
  g.fillStyle='#d9b04a';g.fillRect(-4,-34,2.6,5);g.fillRect(1.6,-34,2.6,5);
  g.fillStyle='#8a1f1a';g.fillRect(-9,-52,18,5);               /* dải "niêm phong" đỏ trên cửa */
  roof(58,-72,C);
  g.fillStyle='#f0e3c2';g.fillRect(-28,-104,56,30);g.fillStyle=C;g.fillRect(-30,-104,5,30);g.fillRect(25,-104,5,30);
  g.fillStyle='rgba(255,200,100,.18)';g.fillRect(-20,-100,40,22);
  roof(42,-104,C);
  g.fillStyle='#ffd45a';g.beginPath();g.arc(0,-136,3.2,0,PI2);g.fill();
  g.font='bold 22px Ma Shan Zheng,'+FONT;g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle=C;g.fillText(H_.ch,0,-82);
  if(typeof ln==='function'){try{ln(-52,-58,.8,t);ln(52,-58,.8,t)}catch(e){}}
  houseFx(i,H_,t);
  g.restore()}
function label(i,t){
  var H_=HOUSES[i],k=bww()/120,X=bx(i)*s,fs=Math.max(10,11.5*s),pad=fs*.55,
      hh=fs*2.3+pad,bot=GY-158*k*s,top=bot-hh;
  g.save();g.textAlign='center';g.textBaseline='alphabetic';
  g.font='bold '+fs+'px '+FONT;var w1=g.measureText(H_.l1).width;g.font='600 '+(fs*.88)+'px '+FONT;var w2=g.measureText(H_.l2).width;
  var bw=Math.max(w1,w2)+pad*2,bxl=X-bw/2;
  g.fillStyle='rgba(18,14,28,.78)';g.beginPath();var r=hh*.28;
  g.moveTo(bxl+r,top);g.arcTo(bxl+bw,top,bxl+bw,top+hh,r);g.arcTo(bxl+bw,top+hh,bxl,top+hh,r);g.arcTo(bxl,top+hh,bxl,top,r);g.arcTo(bxl,top,bxl+bw,top,r);g.closePath();g.fill();
  g.lineWidth=1.4;g.strokeStyle=H_.col;g.stroke();
  g.font='bold '+fs+'px '+FONT;g.fillStyle='#ffe9a0';g.fillText(H_.l1,X,top+pad*.5+fs*.95);
  g.font='600 '+(fs*.88)+'px '+FONT;g.fillStyle=i<3?'#bfe6ff':'#c9b8f0';g.fillText(H_.l2,X,top+pad*.5+fs*.95+fs*1.12);
  g.fillStyle='#ffd54a';g.font='bold '+fs+'px sans-serif';g.fillText('▼',X,bot+fs*.95+Math.sin(t*.12+i)*3);
  g.restore()}

/* ---------- cổng truyền tống (dùng cho cả cổng vào ở Làng 1 và cổng về ở Làng 2) ---------- */
function portal(x,y,rgb,core,t,locked){
  var r=GATE_R(),rx=r*.62,pu=.5+.5*Math.sin(t*.08),j;
  g.save();g.globalCompositeOperation='lighter';
  var q=g.createRadialGradient(x,y,r*.2,x,y,r*2.2);q.addColorStop(0,'rgba('+rgb+','+(locked?.2:.34+.18*pu)+')');q.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=q;g.beginPath();g.arc(x,y,r*2.2,0,PI2);g.fill();
  if(!locked){for(j=0;j<3;j++){var p=((t*.011)+j/3)%1;g.strokeStyle='rgba('+rgb+','+(.6*(1-p))+')';g.lineWidth=(3-p*2)*s;g.beginPath();g.ellipse(x,y,rx*(1+p*1.8),r*(1+p*1.8),0,0,PI2);g.stroke()}}
  g.restore();
  g.save();g.translate(x,y);g.beginPath();g.ellipse(0,0,rx,r,0,0,PI2);
  q=g.createRadialGradient(0,0,2,0,0,r);q.addColorStop(0,core[0]);q.addColorStop(.6,core[1]);q.addColorStop(1,core[2]);g.fillStyle=q;g.fill();
  g.lineWidth=4*s;g.strokeStyle=locked?'#7d7390':'rgb('+rgb+')';g.stroke();
  g.strokeStyle='rgba(255,255,255,'+(locked?.25:.55)+')';g.lineWidth=1.5*s;
  for(j=0;j<4;j++){g.beginPath();g.ellipse(0,0,rx*(.2+j*.22),r*(.28+j*.22),t*.05*(j%2?1:-1)*(locked?.3:1)+j,0,4.2);g.stroke()}
  if(!locked&&!lite()){g.globalCompositeOperation='lighter';
    for(j=0;j<12;j++){var u=((t*.012)+j*.083)%1,a=j*2.4+u*5,rr=(1-u)*r*1.6;g.fillStyle='rgba(255,236,170,'+(.8*Math.sin(u*3.1416))+')';g.beginPath();g.arc(Math.cos(a)*rr*.62,Math.sin(a)*rr,(1.1+(j%3)*.5)*s,0,PI2);g.fill()}}
  g.restore()}
function plate(x,y,a,b,colA,colB){
  var fs=Math.max(11,13*s);g.save();g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.8)';
  g.font='bold '+fs+'px '+FONT;g.strokeText(a,x,y);g.fillStyle=colA;g.fillText(a,x,y);
  g.font=Math.max(10,11.5*s)+'px '+FONT;g.strokeText(b,x,y+fs*1.25);g.fillStyle=colB;g.fillText(b,x,y+fs*1.25);g.restore()}
function gateDraw(t){
  var ok=eligible(),x=GATE_X()*s,y=GATE_Y(),r=GATE_R();
  portal(x,y,ok?'255,205,90':'150,140,170',ok?['#fffbe6','#e8b23a','#3a2208']:['#201a2e','#3a3052','#120e1c'],t,!ok);
  plate(x,y-r-14*s+Math.sin(t*.1)*2,'🏯 Làng Tân Thủ 2',ok?'chạm để bước vào':'🔒 Cần Lv'+REQ_LV+' Phàm Thể',ok?'#ffe9a0':'#cdbfe8',ok?'#fff0b8':'#ff9a8a')}
function backDraw(t){
  var x=BACK_X()*s,y=BACK_Y(),r=GATE_R();
  portal(x,y,'110,235,170',['#f2fff8','#45c98c','#0b3a2a'],t,false);
  plate(x,y-r-14*s+Math.sin(t*.1)*2,'🏘 Về Làng Tân Thủ','chạm để quay về','#d9ffe9','#b8ffe0')}

/* ---------- cảnh Làng Tân Thủ 2 ---------- */
function scene(t){
  ensureBG();g.drawImage(BGC,0,0,W,H);
  var i,Wd=W,gy=GY;
  /* mây trôi */
  g.save();for(i=0;i<4;i++){var cx=((t*(.12+rnd(i)*.1)+rnd(i+3)*(Wd+420))%(Wd+420))-210,cy=gy*(.14+.1*i);
    g.fillStyle='rgba(255,236,214,'+(.30+.08*(i%2))+')';
    for(var k=0;k<5;k++){g.beginPath();g.ellipse(cx+(k-2)*26*s,cy+Math.sin(k*1.7)*5*s,(30+rnd(i*9+k)*16)*s,(11+rnd(i*5+k)*5)*s,0,0,PI2);g.fill()}}g.restore();
  /* nhà */
  for(i=0;i<5;i++)house(i,t);
  /* ánh đèn đá */
  var L=lampXs();g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<L.length;i++){var lx=L[i]*s,ly=gy+10*s-26*s,gp=.7+.3*Math.sin(t*.07+i*2.1),q=g.createRadialGradient(lx,ly,1,lx,ly,34*s);q.addColorStop(0,'rgba(255,214,130,'+(.55*gp)+')');q.addColorStop(1,'rgba(255,190,100,0)');g.fillStyle=q;g.beginPath();g.arc(lx,ly,34*s,0,PI2);g.fill()}
  g.restore();
  backDraw(t);
  /* lá ngân hạnh rơi */
  if(!lite()){g.save();var yM=gy+(H-gy)*.8;for(i=0;i<14;i++){
    var sp=.5+rnd(i+20)*.7,lxp=((rnd(i)*Wd+t*.3*sp+Math.sin(t*.02+i)*26)%(Wd+40))-20,lyp=((rnd(i+50)*yM+t*.55*sp)%yM);
    g.save();g.translate(lxp,lyp);g.rotate(t*.04*sp+i);g.fillStyle=i%3?'#f4c542':'#ffe28a';g.globalAlpha=.85;g.beginPath();g.ellipse(0,0,4*s,2.4*s,0,0,PI2);g.fill();g.restore()}g.restore()}
  /* điểm chạm đi tới */
  if(vt!=null){var a=(fr%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s+(window.VDY?VDY.dy():0),(10+a*22)*s,(4+a*8)*s,0,0,PI2);g.stroke()}
  /* thú + nhân vật */
  drawEP();hero();nameTag();
  /* người chơi khác (đầy đủ ngoại hình): giống cách world/41 vẽ ở Làng 1 */
  var dy=0;try{dy=window.VDY?VDY.dy():0}catch(x){}
  if(dy){g.save();g.translate(0,dy);try{VDY.skip=1}catch(x){}}
  try{if(window.CITYOL&&CITYOL.vDraw)CITYOL.vDraw(dy)}catch(e){try{console.warn('[Lang 2] online',e)}catch(x){}}
  finally{if(dy){try{VDY.skip=0}catch(x){}g.restore()}}
  /* nhãn nhà vẽ SAU người chơi để luôn đọc được */
  for(i=0;i<5;i++)label(i,t);
  /* chữ hướng dẫn + trạng thái online */
  var fs=Math.max(12,14*s),ty=gy+(H-gy)*.55,cx2=(window.VWD&&VWD.cx)?VWD.cx():W/2;
  g.save();g.font='bold '+fs+'px '+FONT;g.textAlign='center';
  var tx='🏯 Làng Tân Thủ 2 · chạm để đi · chạm nhà để vào',tw=g.measureText(tx).width;
  g.fillStyle='#000b';g.fillRect(cx2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#ffe9a0';g.fillText(tx,cx2,ty);
  var on2='';try{
    if(!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()))on2='Đăng nhập ☁ để gặp người chơi khác';
    else if(window.CITYOL&&CITYOL.v2ok&&CITYOL.v2ok()===false)on2='Máy chủ chưa cập nhật (chạy lại thanh_online.sql)';
    else if(window.CITYOL&&CITYOL.err&&CITYOL.err())on2=CITYOL.err();
    else on2='🏮 Làng Tân Thủ 2 online: '+((window.CITYOL&&CITYOL.n?CITYOL.n():0)+1)+' người'}catch(e){}
  if(on2){var fs2=Math.max(10,12*s),ty2=ty+34*Math.max(.8,s);g.font='bold '+fs2+'px '+FONT;g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(on2,cx2,ty2);g.fillStyle=/chưa|Mất|Hết/.test(on2)?'#ff9a8a':'#cfe9ff';g.fillText(on2,cx2,ty2)}
  /* thông báo "Cập nhật sau" */
  if(note&&note.t>0){note.t--;var nf=Math.max(13,16*s),ny=gy+44*s+nf*2.4;g.globalAlpha=Math.min(1,note.t/30);g.font='bold '+nf+'px '+FONT;
    var nw=g.measureText(note.s).width;if(nw>W-48){nf=Math.max(9,nf*(W-48)/nw);g.font='bold '+nf+'px '+FONT;nw=g.measureText(note.s).width}g.fillStyle='rgba(20,14,34,.88)';g.fillRect(cx2-nw/2-14,ny-nf*1.15,nw+28,nf*1.8);g.strokeStyle='#e0b84a';g.lineWidth=1.5;g.strokeRect(cx2-nw/2-14,ny-nf*1.15,nw+28,nf*1.8);
    g.fillStyle='#ffe9a0';g.fillText(note.s,cx2,ny);g.globalAlpha=1}
  g.restore()}
function flashFx(){
  if(flash<=0)return;var a=flash/34;
  g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(W/2,H*.5,10,W/2,H*.5,Math.max(W,H)*.75);
  q.addColorStop(0,'rgba(255,240,190,'+(.9*a)+')');q.addColorStop(1,'rgba(255,200,110,'+(.55*a)+')');g.fillStyle=q;g.fillRect(0,0,W,H);g.restore();flash--}

/* ---------- nối vào vòng lặp ---------- */
var _vd=vdraw;
vdraw=function(){
  var t=fr;
  if(on){try{scene(t)}catch(e){try{console.warn('[Lang 2] vẽ lỗi, về Làng 1',e)}catch(x){}on=false}flashFx();if(on)return}
  var r=_vd.apply(this,arguments);
  try{if(plainVillage())gateDraw(t)}catch(e){}
  flashFx();return r};
var _vs=vstep;
vstep=function(){
  var r=_vs.apply(this,arguments);
  try{
    if(on){
      P.x=cl(P.x,40,vw()-40);
      if(go){if(mvDir)go=null;else if(vt==null){var q=go;go=null;
        if(q.k==='h'){if(Math.abs(P.x-cl(bx(q.i),40,vw()-40))<16)houseAct(q.i)}
        else if(q.k==='b'){if(Math.abs(P.x-cl(BACK_X(),40,vw()-40))<16)leave()}}}
    }else if(gateGo){
      if(mvDir)gateGo=0;else if(vt==null){gateGo=0;if(plainVillage()&&Math.abs(P.x-cl(GATE_X(),40,vw()-40))<16)enter()}}
  }catch(e){try{console.warn('[Lang 2] vstep',e)}catch(x){}}
  return r};
var _st=step;
step=function(){if(on&&(!vil||!started)){on=false;go=null}return _st.apply(this,arguments)};

/* ---------- chạm ---------- */
document.addEventListener('pointerdown',function(e){
  if(e.target!==c||!started)return;
  try{
    if(bo)return;
    var px=e.offsetX,py=e.offsetY,x=px/s;
    if(on){
      e.stopPropagation();
      if(window.CITYOL&&CITYOL.tap&&CITYOL.tap(px,py))return;           /* chạm người chơi khác → thẻ hồ sơ */
      var k=bww()/120,hit=-1;
      for(var i=0;i<5;i++)if(Math.abs(x-bx(i))<bww()/2+12&&py>GY-170*k*s&&py<GY+50*s)hit=i;
      if(hit>=0){vt=cl(bx(hit),40,vw()-40);vgo=-1;go={k:'h',i:hit};return}
      if(Math.abs(px-BACK_X()*s)<GATE_R()*1.3&&Math.abs(py-BACK_Y())<GATE_R()*1.5){vt=cl(BACK_X(),40,vw()-40);vgo=-1;go={k:'b'};return}
      vt=cl(x,40,vw()-40);vgo=-1;go=null;return}
    gateGo=0;
    if(plainVillage()&&Math.abs(px-GATE_X()*s)<GATE_R()*1.3&&Math.abs(py-GATE_Y())<GATE_R()*1.5){
      e.stopPropagation();vt=cl(GATE_X(),40,vw()-40);vgo=-1;gateGo=1}
  }catch(x){try{console.warn('[Lang 2] chạm',x)}catch(y){}}
},true);

/* nút 🏘 trên HUD: đang ở Làng 2 → về Làng 1 */
try{var vlb=document.getElementById('vl'),_vl=vlb.onpointerdown;
  vlb.onpointerdown=function(e){if(on){e.stopPropagation();leave();return}return _vl&&_vl.call(this,e)}}catch(e){}

window.TT2={gate:function(){return[GATE_X()*s,GATE_Y()]},on:function(){return on},enter:enter,leave:leave,eligible:eligible,req:REQ_LV,houses:HOUSES,goHouse:function(i){if(!on||!HOUSES[i])return;vt=cl(bx(i),40,vw()-40);vgo=-1;go={k:'h',i:i}}};
})();
