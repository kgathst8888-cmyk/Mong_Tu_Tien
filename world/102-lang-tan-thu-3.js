/* ===== ❄ LÀNG TÂN THỦ 3 (world/102-lang-tan-thu-3.js · Fix305) =====
 * - Cổng truyền tống trên trời Làng Tân Thủ (giữa làng, cùng kiểu cổng Làng 2): chạm → đi tới → vào Làng Tân Thủ 3.
 * - Điều kiện vào: Lv100 trở lên (REQ_LV). Chưa đủ → cổng xám 🔒 + thông báo.
 * - Làng Tân Thủ 3: cảnh đêm tuyết, trăng đỏ, mai trắng. Có 5 nhà, TẠM KHOÁ (xích + ổ khoá + dấu niêm đỏ): chạm → "Tạm khoá".
 *   Mở nhà sau này: sửa HOUSES, bỏ locked:1 và đặt open:function(){...} cho nhà đó.
 * - Chưa có người chơi online ở bản đồ này (chưa dùng thanh_online.sql); world/41 + world/77 được bảo đừng ping khi TT3.on().
 * - Cách móc: bọc vdraw / vstep / step + nút 🏘 (giống Làng 2). Chạm canvas: bắt ở window (pha capture) nên không module nào khác nhận nhầm.
 * Chỉnh: REQ_LV, HOUSES, GATE_*. Tắt: bỏ <script> trong index.html.
 * Phụ thuộc: vdraw, vstep, step, hero, drawEP, nameTag, bww, vw, cl, g/W/H/s/GY/PORT/fr/P/vt/vgo/mvDir/c/DT, VWD, VDY. */
(function(){
'use strict';
if(typeof vdraw!=='function'||typeof vstep!=='function'||typeof step!=='function'||typeof hero!=='function'||typeof g==='undefined'||typeof c==='undefined')return;

var REQ_LV=100,FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',PI2=6.2832;
var HOUSES=[
 {l1:'Nhà Số 1',l2:'🔒 Tạm khoá',full:'Nhà Số 1',ch:'一',col:'#4a7ab8',fx:0},
 {l1:'Nhà Số 2',l2:'🔒 Tạm khoá',full:'Nhà Số 2',ch:'二',col:'#6a5ab0',fx:1},
 {l1:'Nhà Số 3',l2:'🔒 Tạm khoá',full:'Nhà Số 3',ch:'三',col:'#3a8a98',fx:2},
 {l1:'Nhà Số 4',l2:'🔒 Tạm khoá',full:'Nhà Số 4',ch:'四',col:'#8a4a78',fx:3},
 {l1:'Nhà Số 5',l2:'🔒 Tạm khoá',full:'Nhà Số 5',ch:'五',col:'#a8483a',fx:4}
];
var on=false,go=null,flash=0,note=null,gateGo=0,BGC=null,BGK='';

function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:170})}catch(e){}}
function lite(){return (window.QL|0)>=2}

/* ---------- điều kiện vào ---------- */
function eligible(){return ((P&&P.lv)|0)>=REQ_LV}

/* ---------- vị trí ---------- */
var bx=function(i){return vw()*(.12+.19*i)};
var GATE_X=function(){return Math.min(vw()-42,vw()*.86+Math.min(130,vw()*.16)*.85)},GATE_Y=function(){return GY-(PORT?300:235)*s},GATE_R=function(){return 34*s};
var BACK_X=function(){return vw()*.5},BACK_Y=function(){return GY-(PORT?300:235)*s};
function plainVillage(){
  try{
    if(!vil||!started||bo||on)return false;
    if(window.VWD&&VWD.plain&&!VWD.plain())return false;
    if(window.TG&&TG.on&&TG.on())return false;
    if(window.TT2&&TT2.on&&TT2.on())return false;
    if(window.LCT&&LCT.on&&LCT.on())return false;
    return true}catch(e){return false}}

/* ---------- vào / ra ---------- */
function enter(){
  if(!started||!vil||bo)return;
  if(!eligible()){say('🔒 Cần Lv'+REQ_LV+' để vào Làng Tân Thủ 3','#ffb4a0');return}
  on=true;go=null;vt=null;vgo=-1;gateGo=0;flash=34;
  P.x=cl(BACK_X(),40,vw()-40);P.atk=0;P.pe=null;try{EP.x=P.x-50*P.d}catch(e){}
  say('❄ Làng Tân Thủ 3','#cfe9ff');}
function leave(){
  if(!on)return;
  on=false;go=null;vt=null;vgo=-1;flash=34;
  P.x=cl(GATE_X(),40,vw()-40);P.atk=0;try{EP.x=P.x-50*P.d}catch(e){}
  say('🏘 Trở về Làng Tân Thủ','#ffe9a0')}
function houseAct(i){
  var H_=HOUSES[i];if(!H_)return;
  if(!H_.locked&&typeof H_.open==='function'){try{H_.open();return}catch(e){}}
  note={s:'🔒 '+H_.full+' — đang tạm khoá',t:150}}

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
function plum(q,x,gy,h,u,seed){
  q.strokeStyle='#3a2a2a';q.lineCap='round';q.lineWidth=4*u;q.beginPath();q.moveTo(x,gy);q.lineTo(x+rnd(seed)*6*u-3*u,gy-h*.55);q.stroke();
  q.lineWidth=2*u;
  for(var i=0;i<4;i++){var d=i%2?1:-1,y0=gy-h*(.35+.13*i);q.beginPath();q.moveTo(x,y0);q.lineTo(x+d*h*(.18+rnd(seed+i)*.12),y0-h*.2);q.stroke()}
  var cols=['#ffffff','#ffe3ec','#ffc9d8','#eaf3ff'];
  for(i=0;i<22;i++){var a=rnd(seed+i)*PI2,r=rnd(seed+i+40)*h*.36;
    q.fillStyle=cols[i%4];q.globalAlpha=.92;q.beginPath();q.arc(x+Math.cos(a)*r*1.1,gy-h*.72+Math.sin(a)*r*.7,h*.045+rnd(seed+i+80)*h*.03,0,PI2);q.fill()}
  q.globalAlpha=1;q.fillStyle='rgba(255,255,255,.9)';q.beginPath();q.ellipse(x,gy+1*u,7*u,2.4*u,0,0,PI2);q.fill()}
function lanternBody(q,x,y,u){
  q.fillStyle='#8f897a';q.fillRect(x-5*u,y-6*u,10*u,6*u);q.fillRect(x-3*u,y-22*u,6*u,16*u);
  q.fillStyle='#a7a090';q.fillRect(x-8*u,y-30*u,16*u,8*u);
  q.fillStyle='#ffd27a';q.fillRect(x-5*u,y-29*u,10*u,6*u);
  q.fillStyle='#8f897a';q.beginPath();q.moveTo(x-11*u,y-30*u);q.lineTo(x,y-40*u);q.lineTo(x+11*u,y-30*u);q.closePath();q.fill()}
function lampXs(){var a=[],i;for(i=0;i<4;i++)a.push(vw()*(.215+.19*i));a.push(vw()*.035);a.push(vw()*.965);return a}
function paintBG(q,Wd,Ht,gy,u){
  var i,x,gr;
  gr=q.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#0a1230');gr.addColorStop(.45,'#1c2c5c');gr.addColorStop(.8,'#4a5f98');gr.addColorStop(1,'#9fb4dc');
  q.fillStyle=gr;q.fillRect(0,0,Wd,Ht);
  for(i=0;i<90;i++){q.globalAlpha=.25+.7*rnd(i*3+3);q.fillStyle='#fff';var sz=rnd(i*3+7)>.9?2.2:1.3;q.fillRect(rnd(i*3+1)*Wd,rnd(i*3+2)*gy*.6,sz,sz)}q.globalAlpha=1;
  /* trăng đỏ lớn */
  var sx=Wd*.72,sy=gy*.34,sr=46*u;
  gr=q.createRadialGradient(sx,sy,sr*.4,sx,sy,sr*4.4);gr.addColorStop(0,'rgba(255,150,130,.55)');gr.addColorStop(.4,'rgba(220,110,130,.22)');gr.addColorStop(1,'rgba(200,100,140,0)');
  q.fillStyle=gr;q.beginPath();q.arc(sx,sy,sr*4.4,0,PI2);q.fill();
  gr=q.createRadialGradient(sx-sr*.3,sy-sr*.3,sr*.1,sx,sy,sr);gr.addColorStop(0,'#ffe0d0');gr.addColorStop(1,'#e0705c');
  q.fillStyle=gr;q.beginPath();q.arc(sx,sy,sr,0,PI2);q.fill();
  q.fillStyle='rgba(150,50,50,.25)';q.beginPath();q.arc(sx-sr*.25,sy+sr*.2,sr*.18,0,PI2);q.fill();q.beginPath();q.arc(sx+sr*.3,sy-sr*.15,sr*.12,0,PI2);q.fill();
  /* núi tuyết 3 lớp */
  function snowRidge(base,amp,col,cap,seed,f1,f2){
    ridge(q,Wd,base,amp,col,seed,f1,f2);
    q.fillStyle=cap;
    for(var x2=0;x2<=Wd;x2+=8){var v=(Math.sin(x2*f1+seed)*.55+Math.sin(x2*f2+seed*2.1)*.3+Math.sin(x2*f1*3.1+seed*3.3)*.15)*.5+.5;
      if(v>.72){q.beginPath();q.moveTo(x2-8,base-amp*(.72)+amp*.0);q.lineTo(x2,base-amp*v);q.lineTo(x2+8,base-amp*.72);q.closePath();q.fill()}}}
  snowRidge(gy*.80,gy*.22,'rgba(80,96,160,.95)','rgba(235,243,255,.9)',2.2,.006,.013);
  snowRidge(gy*.88,gy*.15,'rgba(64,84,138,1)','rgba(225,236,252,.85)',5.4,.009,.021);
  ridge(q,Wd,gy*.95,gy*.07,'rgba(48,70,110,1)',8.8,.012,.03);
  gr=q.createLinearGradient(0,gy*.7,0,gy);gr.addColorStop(0,'rgba(180,205,255,0)');gr.addColorStop(1,'rgba(180,205,255,.35)');q.fillStyle=gr;q.fillRect(0,gy*.7,Wd,gy*.3);
  /* mặt đất phủ tuyết */
  gr=q.createLinearGradient(0,gy-2*u,0,gy+34*u);gr.addColorStop(0,'#f2f7ff');gr.addColorStop(1,'#b9c9e6');q.fillStyle=gr;q.fillRect(0,gy-2*u,Wd,Ht-gy+2*u);
  var tf=[.025,.215,.405,.595,.785,.975];
  for(i=0;i<tf.length;i++)plum(q,vw()*tf[i]*u,gy-1*u,(80+rnd(i+9)*26)*u,u,i*17+3);
  /* đường lát đá phủ sương */
  var ry=gy+16*u,rh=Math.max(34*u,(Ht-gy)*.82),yb=ry+rh;
  q.fillStyle='#5a6078';q.fillRect(0,ry-3*u,Wd,3*u);
  gr=q.createLinearGradient(0,ry,0,yb);gr.addColorStop(0,'#aeb8d0');gr.addColorStop(1,'#8c97b4');q.fillStyle=gr;q.fillRect(0,ry,Wd,rh);
  q.strokeStyle='rgba(60,68,96,.38)';q.lineWidth=1.2;
  var rows=Math.max(2,Math.round(rh/(20*u)));
  for(i=1;i<rows;i++){var yy=ry+rh*i/rows;q.beginPath();q.moveTo(0,yy);q.lineTo(Wd,yy);q.stroke()}
  for(i=0;i<rows;i++){var y0=ry+rh*i/rows,y1=ry+rh*(i+1)/rows;for(x=(i%2?26:0)*u;x<Wd;x+=52*u){q.beginPath();q.moveTo(x,y0);q.lineTo(x,y1);q.stroke()}}
  q.fillStyle='rgba(30,36,60,.3)';q.fillRect(0,yb-3*u,Wd,3*u);
  var L=lampXs();for(i=0;i<L.length;i++)lanternBody(q,L[i]*u,gy+10*u,u)}
function ensureBG(){
  var u=s,k=[W,H,Math.round(GY),u.toFixed(3),DPR,vw()|0].join('|');
  if(k===BGK&&BGC)return;BGK=k;
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));
  var q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);
  try{paintBG(q,W,H,GY,u)}catch(e){try{console.warn('[Lang 3] bg',e)}catch(x){}}
  BGC=cv}

/* ---------- nhà ---------- */
function roof(w,y,col){
  g.fillStyle=col;g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.quadraticCurveTo(w-4,y+2,w+20,y-4);g.lineTo(w+6,y+8);g.lineTo(-w-6,y+8);g.fill();
  g.fillStyle='rgba(255,255,255,.1)';g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.lineTo(0,y-22);g.quadraticCurveTo(-w+10,y+6,-w-14,y+2);g.fill();
  g.fillStyle='#e0b84a';g.fillRect(-w-6,y+6,w*2+12,3)}
function houseFx(i,H_,t){
  /* sương lạnh + bông tuyết quanh mái, mỗi nhà lệch pha */
  g.save();g.globalCompositeOperation='lighter';
  for(var m=0;m<4;m++){var p2=((t*.006)+m*.25+i*.13)%1;g.fillStyle='rgba(180,210,255,'+(.3*(1-p2))+')';g.beginPath();g.arc(Math.sin(t*.03+m*2+i)*12+(m-1.5)*9,-118-p2*46,5+p2*7,0,PI2);g.fill()}
  g.restore()}
function lockFx(t){
  /* phủ tối nhẹ + xích chéo + ổ khoá + dấu niêm đỏ trên cửa */
  g.fillStyle='rgba(10,14,34,.34)';g.fillRect(-50,-72,100,66);
  g.save();g.strokeStyle='#9aa3b8';g.lineWidth=3.2;g.setLineDash([6,3]);
  g.beginPath();g.moveTo(-48,-66);g.lineTo(48,-12);g.moveTo(48,-66);g.lineTo(-48,-12);g.stroke();
  g.setLineDash([]);g.strokeStyle='#5a6176';g.lineWidth=1;g.beginPath();g.moveTo(-48,-66);g.lineTo(48,-12);g.moveTo(48,-66);g.lineTo(-48,-12);g.stroke();g.restore();
  var sw=Math.sin(t*.05)*1.2;
  g.fillStyle='#d9b04a';g.fillRect(-9,-44+sw,18,15);g.strokeStyle='#d9b04a';g.lineWidth=3;g.beginPath();g.arc(0,-45+sw,6,Math.PI,0);g.stroke();
  g.fillStyle='#5a3f10';g.beginPath();g.arc(0,-38+sw,2.2,0,PI2);g.fill();g.fillRect(-.8,-38+sw,1.6,5);
  g.fillStyle='#b01f1a';g.fillRect(-14,-62,28,9);g.fillStyle='#ffd8c8';g.font='bold 8px '+FONT;g.textAlign='center';g.fillText('封',0,-55)}
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
  houseFx(i,H_,t);lockFx(t);
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
  g.font='600 '+(fs*.88)+'px '+FONT;g.fillStyle='#ffb4a8';g.fillText(H_.l2,X,top+pad*.5+fs*.95+fs*1.12);
  g.fillStyle='#ffd54a';g.font='bold '+fs+'px sans-serif';g.fillText('▼',X,bot+fs*.95+Math.sin(t*.12+i)*3);
  g.restore()}

/* ---------- cổng truyền tống (dùng cho cả cổng vào ở Làng 1 và cổng về ở Làng 2) ---------- */
var PLRGB='255,205,90';
function portal(x,y,rgb,core,t,locked){
  PLRGB=locked?'150,140,170':rgb;
  if(window.GTK){GTK.portal(x,y,s,rgb,core,t,locked);return}
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
var PK=1;/* Fix316: hệ số thu nhỏ tên cổng (chỉ gateDraw đặt <1) */
function plate(x,y,a,b,colA,colB){
  if(window.GTK){GTK.plate(x,y-Math.max(11,12*s)*.2,s*PK,a,b,colA,colB,PLRGB);return}
  var fs=Math.max(9,13*s*PK);g.save();g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.8)';
  g.font='bold '+fs+'px '+FONT;g.strokeText(a,x,y);g.fillStyle=colA;g.fillText(a,x,y);
  g.font=Math.max(8,11.5*s*PK)+'px '+FONT;g.strokeText(b,x,y+fs*1.25);g.fillStyle=colB;g.fillText(b,x,y+fs*1.25);g.restore()}
function gateDraw(t){
  var ok=eligible(),x=GATE_X()*s,y=GATE_Y(),r=GATE_R();
  portal(x,y,ok?'140,200,255':'150,140,170',ok?['#f2fbff','#5aa8e8','#0a1a3a']:['#201a2e','#3a3052','#120e1c'],t,!ok);
  PK=.7;plate(x,y-r-10*s+Math.sin(t*.1)*2,'❄ Làng Tân Thủ 3',ok?'chạm để bước vào':'🔒 Cần Lv'+REQ_LV,ok?'#d6ecff':'#cdbfe8',ok?'#eaf6ff':'#ff9a8a');PK=1}
function backDraw(t){
  var x=BACK_X()*s,y=BACK_Y(),r=GATE_R();
  portal(x,y,'110,235,170',['#f2fff8','#45c98c','#0b3a2a'],t,false);
  plate(x,y-r-14*s+Math.sin(t*.1)*2,'🏘 Về Làng Tân Thủ','chạm để quay về','#d9ffe9','#b8ffe0')}

/* ---------- cảnh Làng Tân Thủ 3 ---------- */
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
  /* tuyết rơi */
  if(!lite()){g.save();var yM=gy+(H-gy)*.8;for(i=0;i<40;i++){
    var sp=.5+rnd(i+20)*.7,lxp=((rnd(i)*Wd+t*.3*sp+Math.sin(t*.02+i)*26)%(Wd+40))-20,lyp=((rnd(i+50)*yM+t*.55*sp)%yM);
    g.save();g.translate(lxp,lyp);g.rotate(t*.04*sp+i);g.fillStyle=i%3?'#ffffff':'#d6e8ff';g.globalAlpha=.9;g.beginPath();g.ellipse(0,0,2.6*s,2.6*s,0,0,PI2);g.fill();g.restore()}g.restore()}
  /* điểm chạm đi tới */
  if(vt!=null){var a=(fr%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s+(window.VDY?VDY.dy():0),(10+a*22)*s,(4+a*8)*s,0,0,PI2);g.stroke()}
  /* thú + nhân vật */
  drawEP();hero();nameTag();
  /* nhãn nhà vẽ SAU người chơi để luôn đọc được */
  for(i=0;i<5;i++)label(i,t);
  /* chữ hướng dẫn + trạng thái online */
  var fs=Math.max(12,14*s),ty=gy+(H-gy)*.55,cx2=(window.VWD&&VWD.cx)?VWD.cx():W/2;
  g.save();g.font='bold '+fs+'px '+FONT;g.textAlign='center';
  var tx='❄ Làng Tân Thủ 3 · chạm để đi',tw=g.measureText(tx).width;
  g.fillStyle='#000b';g.fillRect(cx2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#d6ecff';g.fillText(tx,cx2,ty);
  var on2='🔒 5 nhà đang tạm khoá';
  if(on2){var fs2=Math.max(10,12*s),ty2=ty+34*Math.max(.8,s);g.font='bold '+fs2+'px '+FONT;g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(on2,cx2,ty2);g.fillStyle='#ffb4a8';g.fillText(on2,cx2,ty2)}
  /* thông báo "Cập nhật sau" */
  if(note&&note.t>0){note.t--;var nf=Math.max(13,16*s),ny=gy+44*s+nf*2.4;g.globalAlpha=Math.min(1,note.t/30);g.font='bold '+nf+'px '+FONT;
    var nw=g.measureText(note.s).width;if(nw>W-48){nf=Math.max(9,nf*(W-48)/nw);g.font='bold '+nf+'px '+FONT;nw=g.measureText(note.s).width}g.fillStyle='rgba(20,14,34,.88)';g.fillRect(cx2-nw/2-14,ny-nf*1.15,nw+28,nf*1.8);g.strokeStyle='#e0b84a';g.lineWidth=1.5;g.strokeRect(cx2-nw/2-14,ny-nf*1.15,nw+28,nf*1.8);
    g.fillStyle='#ffe9a0';g.fillText(note.s,cx2,ny);g.globalAlpha=1}
  g.restore()}
function flashFx(){
  if(flash<=0)return;var a=flash/34;
  g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(W/2,H*.5,10,W/2,H*.5,Math.max(W,H)*.75);
  q.addColorStop(0,'rgba(225,240,255,'+(.9*a)+')');q.addColorStop(1,'rgba(150,190,255,'+(.55*a)+')');g.fillStyle=q;g.fillRect(0,0,W,H);g.restore();flash--}

/* ---------- nối vào vòng lặp ---------- */
var _vd=vdraw;
vdraw=function(){
  var t=fr;
  if(on){try{scene(t)}catch(e){try{console.warn('[Lang 3] vẽ lỗi, về Làng 1',e)}catch(x){}on=false}flashFx();if(on)return}
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
  }catch(e){try{console.warn('[Lang 3] vstep',e)}catch(x){}}
  return r};
var _st=step;
step=function(){if(on&&(!vil||!started)){on=false;go=null}return _st.apply(this,arguments)};

/* ---------- chạm ---------- */
window.addEventListener('pointerdown',function(e){
  if(e.target!==c||!started)return;
  try{
    if(bo)return;
    var px=e.offsetX,py=e.offsetY,x=px/s;
    if(on){
      e.stopPropagation();
      var k=bww()/120,hit=-1;
      for(var i=0;i<5;i++)if(Math.abs(x-bx(i))<bww()/2+12&&py>GY-170*k*s&&py<GY+50*s)hit=i;
      if(hit>=0){vt=cl(bx(hit),40,vw()-40);vgo=-1;go={k:'h',i:hit};return}
      if(Math.abs(px-BACK_X()*s)<GATE_R()*1.3&&Math.abs(py-BACK_Y())<GATE_R()*1.5){vt=cl(BACK_X(),40,vw()-40);vgo=-1;go={k:'b'};return}
      vt=cl(x,40,vw()-40);vgo=-1;go=null;return}
    gateGo=0;
    if(plainVillage()&&Math.abs(px-GATE_X()*s)<GATE_R()*1.3&&Math.abs(py-GATE_Y())<GATE_R()*1.5){
      e.stopPropagation();vt=cl(GATE_X(),40,vw()-40);vgo=-1;gateGo=1}
  }catch(x){try{console.warn('[Lang 3] chạm',x)}catch(y){}}
},true);

/* nút 🏘 trên HUD: đang ở Làng 2 → về Làng 1 */
try{var vlb=document.getElementById('vl'),_vl=vlb.onpointerdown;
  vlb.onpointerdown=function(e){if(on){e.stopPropagation();leave();return}return _vl&&_vl.call(this,e)}}catch(e){}

window.TT3={locked:true,gate:function(){return[GATE_X()*s,GATE_Y()]},on:function(){return on},enter:enter,leave:leave,eligible:eligible,req:REQ_LV,houses:HOUSES};
})();
