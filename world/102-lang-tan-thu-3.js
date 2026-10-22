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
  if(!H_.locked&&typeof H_.open==='function'){try{H_.open();return}catch(e){try{console.warn('[Lang 3] mở nhà lỗi',e)}catch(x){}note={s:'⚠ Không mở được '+H_.full+' — thử lại',t:150};return}}
  note={s:'🔒 '+H_.full+' — đang tạm khoá',t:150}}

/* ---------- nền tĩnh (vẽ 1 lần vào canvas đệm) ---------- */
/* ===== Fix389 · THIẾT KẾ LẠI LÀNG TÂN THỦ 3: phong cảnh + kiến trúc riêng từng nhà =====
 * - Nền (BGC, vẽ 1 lần): cực quang, trăng đỏ, núi tuyết có mặt khuất, chùa xa trên núi, sương, 2 lớp rừng thông phủ tuyết,
 *   tường viện có ô cửa trăng, mai nở, đèn đá, đường lát đá có hoạ tiết + viền + sương giá.
 * - Mỗi nhà là 1 "sprite" vẽ sẵn (cache theo kích thước/màu): 0 Tuyết Ngục = pháo đài băng · 1 Tinh Luyện = tháp lò rèn ·
 *   2 Đan Phòng = các đan dược · 3 Cốt Hải = đền xương sa mạc · 4 nhà số 5 = nhà hoang (đổi sang tháp đỏ khi được mở khoá).
 *   Mỗi frame chỉ vẽ thêm ánh sáng/khói/tia lửa (houseDyn). Chỉnh: WIN (ô cửa phát sáng), buildHouse (kiến trúc). */
function hx(c){return /^#[0-9a-f]{6}$/i.test(c||'')?c:'#8a6ae0'}
function mix(c,f){c=hx(c);var n=parseInt(c.slice(1),16),r=n>>16&255,gg=n>>8&255,b=n&255,t=f<0?0:255,a=Math.abs(f);
  return 'rgb('+Math.round(r+(t-r)*a)+','+Math.round(gg+(t-gg)*a)+','+Math.round(b+(t-b)*a)+')'}
function lg(q,x0,y0,x1,y1,st){var gr=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i++)gr.addColorStop(st[i][0],st[i][1]);return gr}
function rrect(q,x,y,w,h,r){r=Math.min(r,w/2,h/2);q.beginPath();q.moveTo(x+r,y);q.arcTo(x+w,y,x+w,y+h,r);q.arcTo(x+w,y+h,x,y+h,r);q.arcTo(x,y+h,x,y,r);q.arcTo(x,y,x+w,y,r);q.closePath()}
function rv(x,seed,f1,f2){return (Math.sin(x*f1+seed)*.55+Math.sin(x*f2+seed*2.1)*.3+Math.sin(x*f1*3.1+seed*3.3)*.15)*.5+.5}
function ridge(q,W,base,amp,col,seed,f1,f2){
  q.fillStyle=col;q.beginPath();q.moveTo(0,base+amp*2);
  for(var x=0;x<=W+8;x+=8)q.lineTo(x,base-amp*rv(x,seed,f1,f2));
  q.lineTo(W,base+amp*2);q.closePath();q.fill()}

/* ---------- phong cảnh ---------- */
function pine(q,x,by,h,col,cap){
  var i,w=h*.33;
  q.fillStyle='#2a1e1a';q.fillRect(x-h*.03,by-h*.12,h*.06,h*.12);
  for(i=0;i<4;i++){var ty=by-h*.08-i*h*.21,tw=w*(1-i*.21),th=h*.34;
    q.fillStyle=col;q.beginPath();q.moveTo(x-tw,ty);q.lineTo(x,ty-th);q.lineTo(x+tw,ty);q.closePath();q.fill();
    q.fillStyle=cap;q.beginPath();q.moveTo(x-tw*.8,ty-th*.2);q.lineTo(x,ty-th);q.lineTo(x+tw*.8,ty-th*.2);
    q.quadraticCurveTo(x+tw*.35,ty-th*.45,x,ty-th*.32);q.quadraticCurveTo(x-tw*.35,ty-th*.45,x-tw*.8,ty-th*.2);q.fill()}}
function farTemple(q,x,y,u){
  var t,c='rgba(24,36,82,.96)';
  q.fillStyle=c;q.fillRect(x-24*u,y-5*u,48*u,5*u);q.fillRect(x-20*u,y-9*u,40*u,4*u);
  for(t=0;t<3;t++){var w=(17-t*4)*u,yy=y-9*u-t*13*u;
    q.fillStyle=c;q.beginPath();q.moveTo(x-w-7*u,yy);q.quadraticCurveTo(x-w*.4,yy-1*u,x,yy-10*u);q.quadraticCurveTo(x+w*.4,yy-1*u,x+w+7*u,yy);q.lineTo(x+w,yy+2*u);q.lineTo(x-w,yy+2*u);q.closePath();q.fill();
    q.fillRect(x-w*.7,yy+2*u,w*1.4,9*u);
    q.fillStyle='#ffcf7a';q.fillRect(x-1.3*u,yy+4*u,2.6*u,4.5*u);q.fillRect(x-w*.5,yy+4.5*u,1.8*u,3.5*u);q.fillRect(x+w*.5-1.8*u,yy+4.5*u,1.8*u,3.5*u)}
  q.fillStyle=c;q.fillRect(x-.8*u,y-9*u-3*13*u-12*u,1.6*u,13*u)}
function aurora(q,Wd,gy){
  var cols=[['rgba(90,255,200,','rgba(60,150,255,'],['rgba(170,120,255,','rgba(90,200,255,'],['rgba(110,255,170,','rgba(130,150,255,']],b,x,gr;
  for(b=0;b<3;b++){var by=gy*(.2+.085*b),amp=gy*.05;
    for(x=0;x<=Wd;x+=8){
      var y0=by+Math.sin(x*.006+b*2)*amp+Math.sin(x*.017+b)*amp*.4,hh=gy*(.15+.07*Math.sin(x*.01+b*3)),a=.1+.07*Math.sin(x*.013+b);
      gr=q.createLinearGradient(0,y0-hh,0,y0+hh*.3);gr.addColorStop(0,cols[b][1]+'0)');gr.addColorStop(.7,cols[b][0]+a.toFixed(3)+')');gr.addColorStop(1,cols[b][0]+'0)');
      q.fillStyle=gr;q.fillRect(x,y0-hh,9,hh*1.3)}}}
function plum(q,x,gy,h,u,seed){
  var i,tx=x+rnd(seed+1)*6*u-3*u,d,y0,ex,ey,cols=['#ffffff','#ffe3ec','#ffc9d8','#eaf3ff'];
  q.strokeStyle='#33252a';q.lineCap='round';q.lineWidth=5*u;q.beginPath();q.moveTo(x,gy);q.quadraticCurveTo(x+rnd(seed)*10*u-5*u,gy-h*.3,tx,gy-h*.58);q.stroke();
  var br=[];
  for(i=0;i<5;i++){d=i%2?1:-1;y0=gy-h*(.3+.1*i);ex=x+d*h*(.2+rnd(seed+i)*.16);ey=y0-h*(.15+rnd(seed+i+9)*.08);
    q.lineWidth=2.4*u;q.beginPath();q.moveTo(x+(tx-x)*(i/5),y0);q.quadraticCurveTo(x+d*h*.08,y0-h*.12,ex,ey);q.stroke();
    q.lineWidth=1.3*u;q.beginPath();q.moveTo(ex,ey);q.lineTo(ex+d*h*.08,ey-h*.05);q.moveTo((x+ex)/2+d*h*.02,(y0+ey)/2);q.lineTo((x+ex)/2+d*h*.07,(y0+ey)/2+h*.06);q.stroke();
    br.push([ex,ey])}
  for(i=0;i<br.length;i++){q.fillStyle='rgba(255,255,255,.96)';q.beginPath();q.ellipse(br[i][0],br[i][1]-1.2*u,5*u,2*u,0,0,PI2);q.fill()}
  for(i=0;i<38;i++){var a=rnd(seed+i)*PI2,r=rnd(seed+i+40)*h*.38;
    q.fillStyle=cols[i%4];q.globalAlpha=.93;q.beginPath();q.arc(x+Math.cos(a)*r*1.15,gy-h*.74+Math.sin(a)*r*.72,h*.04+rnd(seed+i+80)*h*.03,0,PI2);q.fill()}
  q.globalAlpha=1;q.fillStyle='#f5c64a';for(i=0;i<9;i++){q.beginPath();q.arc(x+(rnd(seed+i+120)-.5)*h*.7,gy-h*.74+(rnd(seed+i+140)-.5)*h*.4,h*.012,0,PI2);q.fill()}
  q.fillStyle='rgba(255,255,255,.9)';q.beginPath();q.ellipse(x,gy+1*u,9*u,2.6*u,0,0,PI2);q.fill();
  q.fillStyle='rgba(255,205,222,.85)';for(i=0;i<8;i++){q.beginPath();q.ellipse(x+(rnd(seed+i+160)-.5)*h*.6,gy+(1+rnd(seed+i+170)*5)*u,1.7*u,.8*u,0,0,PI2);q.fill()}}
function lanternBody(q,x,y,u){
  q.fillStyle='rgba(20,30,60,.3)';q.beginPath();q.ellipse(x,y,12*u,3*u,0,0,PI2);q.fill();
  q.fillStyle='#8f897a';q.fillRect(x-7*u,y-5*u,14*u,5*u);q.fillStyle='#a7a090';q.fillRect(x-5*u,y-8*u,10*u,3*u);
  q.fillStyle='#8f897a';q.fillRect(x-3*u,y-22*u,6*u,14*u);q.fillStyle='#a7a090';q.fillRect(x-8*u,y-26*u,16*u,4*u);
  q.fillStyle='#ffd27a';q.fillRect(x-5*u,y-34*u,10*u,8*u);
  q.strokeStyle='#6f695b';q.lineWidth=1.2*u;q.strokeRect(x-5*u,y-34*u,10*u,8*u);q.beginPath();q.moveTo(x,y-34*u);q.lineTo(x,y-26*u);q.stroke();
  q.fillStyle='#8f897a';q.beginPath();q.moveTo(x-12*u,y-34*u);q.quadraticCurveTo(x-5*u,y-36*u,x,y-45*u);q.quadraticCurveTo(x+5*u,y-36*u,x+12*u,y-34*u);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.92)';q.beginPath();q.ellipse(x,y-41.5*u,5.5*u,2*u,0,0,PI2);q.fill();
  q.fillStyle='#a7a090';q.beginPath();q.arc(x,y-46*u,1.8*u,0,PI2);q.fill()}
function lampXs(){var a=[],i;for(i=0;i<4;i++)a.push(vw()*(.215+.19*i));a.push(vw()*.035);a.push(vw()*.965);return a}
function wallArt(q,Wd,gy,u){
  var h=34*u,top=gy-h,i,x,L=lampXs();
  q.fillStyle=lg(q,0,top,0,gy,[[0,'#dde5f4'],[1,'#a3b0cf']]);q.fillRect(0,top,Wd,h);
  q.fillStyle='#7a849e';q.fillRect(0,gy-7*u,Wd,7*u);q.fillStyle='rgba(255,255,255,.35)';q.fillRect(0,gy-7*u,Wd,1.2*u);
  q.strokeStyle='rgba(40,50,90,.28)';q.lineWidth=1;
  for(x=0;x<Wd;x+=14*u){q.beginPath();q.moveTo(x,gy-7*u);q.lineTo(x,gy);q.stroke()}
  for(x=0;x<Wd;x+=96*u){
    q.fillStyle='#6d4a5a';q.fillRect(x-2.5*u,top,5*u,h-7*u);
    q.strokeStyle='rgba(70,80,120,.6)';q.lineWidth=1;q.strokeRect(x+12*u,top+7*u,72*u,17*u);
    q.save();q.beginPath();q.rect(x+12*u,top+7*u,72*u,17*u);q.clip();q.strokeStyle='rgba(70,80,120,.38)';
    for(i=0;i<14;i++){q.beginPath();q.moveTo(x+12*u+i*12*u,top+7*u);q.lineTo(x+12*u+i*12*u-17*u,top+24*u);q.moveTo(x+12*u+i*12*u-17*u,top+7*u);q.lineTo(x+12*u+i*12*u,top+24*u);q.stroke()}
    q.restore()}
  for(i=0;i<4;i++){var gx=L[i],gyc=gy-16*u;
    q.fillStyle='#1b2244';q.beginPath();q.arc(gx,gyc,14*u,0,PI2);q.fill();
    var gg=q.createRadialGradient(gx,gyc+4*u,1,gx,gyc,14*u);gg.addColorStop(0,'rgba(255,200,120,.55)');gg.addColorStop(1,'rgba(255,200,120,0)');q.fillStyle=gg;q.beginPath();q.arc(gx,gyc,14*u,0,PI2);q.fill();
    q.strokeStyle='#6d7aa0';q.lineWidth=3*u;q.beginPath();q.arc(gx,gyc,14*u,0,PI2);q.stroke();
    q.strokeStyle='rgba(109,122,160,.8)';q.lineWidth=1;q.beginPath();q.moveTo(gx-14*u,gyc);q.lineTo(gx+14*u,gyc);q.moveTo(gx,gyc-14*u);q.lineTo(gx,gyc+14*u);q.stroke()}
  q.fillStyle='#3d4468';q.fillRect(0,top-6*u,Wd,6*u);q.fillStyle='#565f8c';
  for(x=0;x<Wd;x+=8*u){q.beginPath();q.arc(x+4*u,top-6*u,3.6*u,0,Math.PI);q.fill()}
  q.fillStyle='#4d557e';for(x=0;x<Wd;x+=8*u)q.fillRect(x+3.4*u,top-6*u,1.2*u,6*u);
  q.fillStyle='rgba(255,255,255,.94)';q.beginPath();q.moveTo(0,top-5*u);
  for(x=0;x<=Wd+9*u;x+=9*u)q.quadraticCurveTo(x+2*u,top-12*u-rnd(x*.1)*3*u,x+9*u,top-6*u);
  q.lineTo(Wd,top-5*u);q.closePath();q.fill()}
function paintBG(q,Wd,Ht,gy,u){
  var i,x,gr;
  q.fillStyle=lg(q,0,0,0,gy,[[0,'#060b26'],[.4,'#142257'],[.75,'#34478a'],[.93,'#7a92c8'],[1,'#b8cbea']]);q.fillRect(0,0,Wd,Ht);
  for(i=0;i<150;i++){var rz=rnd(i*3+7);q.globalAlpha=.2+.75*rnd(i*3+3);q.fillStyle=i%9?'#fff':'#cfe3ff';var sz=rz>.93?2.4:(rz>.6?1.5:1);q.fillRect(rnd(i*3+1)*Wd,rnd(i*3+2)*gy*.62,sz,sz)}
  q.globalAlpha=1;q.strokeStyle='rgba(235,245,255,.8)';q.lineWidth=1;
  for(i=0;i<7;i++){var sx0=rnd(i+300)*Wd,sy0=rnd(i+320)*gy*.5,sl=(3+rnd(i+340)*3)*u;q.beginPath();q.moveTo(sx0-sl,sy0);q.lineTo(sx0+sl,sy0);q.moveTo(sx0,sy0-sl);q.lineTo(sx0,sy0+sl);q.stroke()}
  aurora(q,Wd,gy);
  var sx=Wd*.72,sy=gy*.34,sr=46*u;
  gr=q.createRadialGradient(sx,sy,sr*.4,sx,sy,sr*4.4);gr.addColorStop(0,'rgba(255,150,130,.55)');gr.addColorStop(.4,'rgba(220,110,130,.22)');gr.addColorStop(1,'rgba(200,100,140,0)');
  q.fillStyle=gr;q.beginPath();q.arc(sx,sy,sr*4.4,0,PI2);q.fill();
  gr=q.createRadialGradient(sx-sr*.3,sy-sr*.3,sr*.1,sx,sy,sr);gr.addColorStop(0,'#ffe0d0');gr.addColorStop(1,'#e0705c');
  q.fillStyle=gr;q.beginPath();q.arc(sx,sy,sr,0,PI2);q.fill();
  q.fillStyle='rgba(150,50,50,.25)';q.beginPath();q.arc(sx-sr*.25,sy+sr*.2,sr*.18,0,PI2);q.fill();q.beginPath();q.arc(sx+sr*.3,sy-sr*.15,sr*.12,0,PI2);q.fill();q.beginPath();q.arc(sx+sr*.05,sy-sr*.5,sr*.08,0,PI2);q.fill();
  q.strokeStyle='rgba(255,200,180,.35)';q.lineWidth=1.5*u;q.beginPath();q.arc(sx,sy,sr+3*u,0,PI2);q.stroke();
  function snowRidge(base,amp,col,cap,seed,f1,f2){
    ridge(q,Wd,base,amp,col,seed,f1,f2);
    for(var x2=0;x2<=Wd;x2+=8){var v=rv(x2,seed,f1,f2);
      if(v>.7){q.fillStyle=cap;q.beginPath();q.moveTo(x2-8,base-amp*.7);q.lineTo(x2,base-amp*v);q.lineTo(x2+8,base-amp*.7);q.closePath();q.fill();
        q.fillStyle='rgba(30,44,100,.28)';q.beginPath();q.moveTo(x2,base-amp*v);q.lineTo(x2+8,base-amp*.7);q.lineTo(x2+1,base-amp*(.55+.1*rnd(x2)));q.closePath();q.fill()}}}
  var b2=gy*.88,a2=gy*.15;
  snowRidge(gy*.80,gy*.22,'rgba(80,96,160,.95)','rgba(235,243,255,.9)',2.2,.006,.013);
  snowRidge(b2,a2,'rgba(64,84,138,1)','rgba(225,236,252,.85)',5.4,.009,.021);
  var tx=Wd*.2;farTemple(q,tx,b2-a2*rv(tx,5.4,.009,.021)+3*u,u*.95);
  ridge(q,Wd,gy*.95,gy*.07,'rgba(48,70,110,1)',8.8,.012,.03);
  gr=lg(q,0,gy*.7,0,gy,[[0,'rgba(180,205,255,0)'],[1,'rgba(180,205,255,.35)']]);q.fillStyle=gr;q.fillRect(0,gy*.7,Wd,gy*.3);
  q.fillStyle='rgba(190,210,245,.13)';for(i=0;i<6;i++){q.beginPath();q.ellipse(rnd(i+500)*Wd,gy*(.82+.1*rnd(i+510)),(90+rnd(i+520)*90)*u,(7+rnd(i+530)*6)*u,0,0,PI2);q.fill()}
  for(x=-8*u;x<Wd+10*u;x+=15*u)pine(q,x+rnd(x)*8*u,gy*.99,(26+rnd(x+3)*16)*u,'#1b2f52','rgba(200,220,248,.8)');
  for(x=-6*u;x<Wd+10*u;x+=24*u)pine(q,x+rnd(x+9)*12*u,gy-3*u,(40+rnd(x+7)*32)*u,'#12263c','rgba(238,246,255,.96)');
  gr=lg(q,0,gy-2*u,0,gy+34*u,[[0,'#f2f7ff'],[1,'#b9c9e6']]);q.fillStyle=gr;q.fillRect(0,gy-2*u,Wd,Ht-gy+2*u);
  wallArt(q,Wd,gy,u);
  q.fillStyle='#f2f7ff';q.fillRect(0,gy-2*u,Wd,6*u);
  var tf=[.025,.215,.405,.595,.785,.975];
  for(i=0;i<tf.length;i++)plum(q,vw()*tf[i]*u,gy-1*u,(80+rnd(i+9)*26)*u,u,i*17+3);
  q.strokeStyle='rgba(150,175,215,.5)';q.lineWidth=1.2;
  for(i=0;i<9;i++){var yy=gy+(1+rnd(i+60)*8)*u,xs=rnd(i+70)*Wd;q.beginPath();q.moveTo(xs,yy);q.quadraticCurveTo(xs+40*u,yy-5*u,xs+90*u,yy);q.stroke()}
  var ry=gy+16*u,rh=Math.max(34*u,(Ht-gy)*.82),yb=ry+rh;
  q.fillStyle='#5a6078';q.fillRect(0,ry-4*u,Wd,4*u);
  q.fillStyle='#c9d2e6';for(x=0;x<Wd;x+=18*u){q.fillRect(x,ry-4*u,16*u,1.6*u)}
  gr=lg(q,0,ry,0,yb,[[0,'#aeb8d0'],[1,'#8c97b4']]);q.fillStyle=gr;q.fillRect(0,ry,Wd,rh);
  q.strokeStyle='rgba(60,68,96,.38)';q.lineWidth=1.2;
  var rows=Math.max(2,Math.round(rh/(20*u)));
  for(i=1;i<rows;i++){var yr=ry+rh*i/rows;q.beginPath();q.moveTo(0,yr);q.lineTo(Wd,yr);q.stroke()}
  for(i=0;i<rows;i++){var y0=ry+rh*i/rows,y1=ry+rh*(i+1)/rows;for(x=(i%2?26:0)*u;x<Wd;x+=52*u){q.beginPath();q.moveTo(x,y0);q.lineTo(x,y1);q.stroke()}}
  var my=ry+rh*.5;q.lineWidth=1.3;
  for(x=70*u;x<Wd;x+=140*u){
    q.strokeStyle='rgba(224,184,74,.42)';q.beginPath();q.moveTo(x-24*u,my);q.lineTo(x,my-Math.min(rh*.3,20*u));q.lineTo(x+24*u,my);q.lineTo(x,my+Math.min(rh*.3,20*u));q.closePath();q.stroke();
    q.beginPath();q.ellipse(x,my,10*u,Math.min(rh*.14,9*u),0,0,PI2);q.stroke();q.fillStyle='rgba(224,184,74,.5)';q.beginPath();q.arc(x,my,2*u,0,PI2);q.fill()}
  q.fillStyle='rgba(215,236,255,.3)';for(i=0;i<10;i++){q.beginPath();q.ellipse(rnd(i+600)*Wd,ry+rh*(.15+.7*rnd(i+610)),(14+rnd(i+620)*18)*u,(3+rnd(i+630)*3)*u,0,0,PI2);q.fill()}
  q.fillStyle='rgba(30,36,60,.3)';q.fillRect(0,yb-3*u,Wd,3*u);
  q.fillStyle='#e8f0ff';q.beginPath();q.moveTo(0,yb);for(x=0;x<=Wd+30*u;x+=30*u)q.quadraticCurveTo(x+15*u,yb-9*u-rnd(x*.07)*6*u,x+30*u,yb);q.lineTo(Wd,yb+8*u);q.lineTo(0,yb+8*u);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.85)';for(i=0;i<46;i++){var px=rnd(i+700)*Wd,py=gy+rnd(i+710)*(yb-gy+10*u);q.fillRect(px,py,1.6,1.6)}
  var L=lampXs();for(i=0;i<L.length;i++)lanternBody(q,L[i]*u,gy+10*u,u)}
function ensureBG(){
  var u=s,k=[W,H,Math.round(GY),u.toFixed(3),DPR,vw()|0].join('|');
  if(k===BGK&&BGC)return;BGK=k;
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));
  var q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);
  try{paintBG(q,W,H,GY,u)}catch(e){try{console.warn('[Lang 3] bg',e)}catch(x){}}
  BGC=cv}
function skyFx(t){
  var gy=GY,Wd=W,i;
  if(lite())return;
  g.save();g.globalCompositeOperation='lighter';
  var a=.035+.03*Math.sin(t*.012),gr=g.createLinearGradient(0,gy*.08,0,gy*.55);gr.addColorStop(0,'rgba(80,255,190,0)');gr.addColorStop(.5,'rgba(90,230,200,'+a.toFixed(3)+')');gr.addColorStop(1,'rgba(120,120,255,0)');
  g.fillStyle=gr;g.fillRect(0,gy*.08,Wd,gy*.47);
  for(i=0;i<14;i++){g.globalAlpha=(.25+.75*Math.abs(Math.sin(t*.03*(.6+rnd(i+400))+i)))*.8;g.fillStyle='#fff';g.fillRect(rnd(i+410)*Wd,rnd(i+420)*gy*.55,1.8,1.8)}
  g.globalAlpha=1;
  for(i=0;i<6;i++){var p=((t*.0007*(.6+rnd(i))+rnd(i+9))%1),lx=Wd*(.08+.84*rnd(i+1))+Math.sin(t*.01+i*2)*14,ly=gy*(.92-p*.8),al=Math.sin(p*3.1416);
    g.fillStyle='rgba(255,170,90,'+(.16*al).toFixed(3)+')';g.beginPath();g.arc(lx,ly,13*s,0,PI2);g.fill();g.fillStyle='rgba(255,200,120,'+(.24*al).toFixed(3)+')';g.beginPath();g.arc(lx,ly,7*s,0,PI2);g.fill();
    g.fillStyle='rgba(255,226,160,'+(.9*al).toFixed(3)+')';g.fillRect(lx-2.4*s,ly-3.2*s,4.8*s,6.4*s)}
  g.restore()}

/* ---------- kiến trúc: cấu kiện dùng chung (toạ độ cục bộ: gốc = giữa chân nhà, y âm = lên trên) ---------- */
function podium(q,w,A,B,rail){
  var i,j,wd,yt,wds=[26,22,18];
  q.fillStyle=lg(q,0,-6,0,0,[[0,A],[1,B]]);q.fillRect(-w,-6,w*2,6);q.fillStyle='rgba(255,255,255,.3)';q.fillRect(-w,-6,w*2,1.3);
  q.fillStyle=lg(q,0,-13,0,-6,[[0,A],[1,B]]);q.fillRect(-w+8,-13,w*2-16,7);q.fillStyle='rgba(255,255,255,.34)';q.fillRect(-w+8,-13,w*2-16,1.3);
  q.strokeStyle='rgba(30,30,50,.35)';q.lineWidth=.8;
  for(i=-w+14;i<w-6;i+=14){q.beginPath();q.moveTo(i,-6);q.lineTo(i,0);q.stroke()}
  for(i=-w+14;i<w-24;i+=17){if(Math.abs(i+6)<27)continue;q.strokeRect(i,-11.5,12,4)}
  for(j=0;j<3;j++){wd=wds[j];yt=-4.4*(j+1);q.fillStyle=lg(q,0,yt,0,yt+4.4,[[0,mix(A,.12)],[1,B]]);q.fillRect(-wd,yt,wd*2,4.4)}
  q.fillStyle=mix(B,-.15);q.fillRect(-5.5,-13,11,13);q.strokeStyle='rgba(224,184,74,.85)';q.lineWidth=.9;
  for(j=0;j<3;j++){q.beginPath();q.arc(0,-2.5-j*4.3,2.2,0,PI2);q.stroke()}
  if(rail){for(j=-1;j<=1;j+=2){var xa=j*(w-12),xb=j*30,xl=Math.min(xa,xb),xr=Math.max(xa,xb);
    q.fillStyle=A;q.fillRect(xl,-19,xr-xl,1.8);q.fillStyle='rgba(255,255,255,.9)';q.fillRect(xl,-20.2,xr-xl,1.3);
    for(i=xl;i<=xr+.1;i+=10){q.fillStyle=mix(A,-.12);q.fillRect(i-1.3,-19,2.6,6);q.fillStyle=A;q.beginPath();q.arc(i,-21,1.9,0,PI2);q.fill()}}}}
function pillar(q,x,yb,yt,col){
  q.fillStyle='#8a8474';q.fillRect(x-4.5,yb-3,9,3);
  q.fillStyle=lg(q,x-3,0,x+3,0,[[0,mix(col,-.4)],[.4,mix(col,.15)],[1,mix(col,-.45)]]);q.fillRect(x-3,yt,6,yb-yt-3);
  q.fillStyle=mix(col,-.5);q.fillRect(x-4.2,yt,8.4,2.5)}
function lintel(q,x0,x1,y,h,col){
  q.fillStyle=lg(q,0,y,0,y+h,[[0,mix(col,.2)],[1,mix(col,-.4)]]);q.fillRect(x0,y,x1-x0,h);q.fillStyle='#e0b84a';q.fillRect(x0,y+h-1,x1-x0,1);
  for(var x=x0+6;x<x1-4;x+=9){q.fillStyle='#e8c66a';q.beginPath();q.moveTo(x,y+h/2-2.2);q.lineTo(x+2.2,y+h/2);q.lineTo(x,y+h/2+2.2);q.lineTo(x-2.2,y+h/2);q.closePath();q.fill();q.fillStyle=mix(col,.45);q.fillRect(x+4,y+h/2-.7,1.4,1.4)}}
function bracket(q,x,y,col){q.fillStyle=mix(col,-.3);q.fillRect(x-3,y-3,6,3);q.fillRect(x-5,y-6,10,3);q.fillRect(x-7.5,y-9,15,3);q.fillStyle='#e0b84a';q.fillRect(x-7.5,y-9,15,.9)}
function latWin(q,x,y,w,h,col,boarded){
  var i;q.fillStyle=mix(col,-.25);q.fillRect(x-2,y-2,w+4,h+4);
  q.fillStyle=boarded?'#241d30':'rgba(235,170,80,.62)';q.fillRect(x,y,w,h);
  if(boarded){q.strokeStyle='#5a4632';q.lineWidth=3;q.beginPath();q.moveTo(x-1,y+2);q.lineTo(x+w+1,y+h-2);q.moveTo(x+w+1,y+3);q.lineTo(x-1,y+h-3);q.stroke();q.fillStyle='#7a6244';q.fillRect(x-2,y+h/2-1.2,w+4,2.4)}
  else{q.strokeStyle=mix(col,-.5);q.lineWidth=1.3;q.beginPath();for(i=1;i<3;i++){q.moveTo(x+w*i/3,y);q.lineTo(x+w*i/3,y+h);q.moveTo(x,y+h*i/3);q.lineTo(x+w,y+h*i/3)}q.stroke();
    q.lineWidth=.7;q.beginPath();q.moveTo(x+w/2,y);q.lineTo(x+w,y+h/2);q.lineTo(x+w/2,y+h);q.lineTo(x,y+h/2);q.closePath();q.stroke()}
  q.fillStyle=mix(col,.1);q.fillRect(x-3,y+h+2,w+6,2.2);q.fillStyle='rgba(255,255,255,.85)';q.fillRect(x-3,y+h+1,w+6,1.1)}
function doorArt(q,x,yb,w,h,col,boarded){
  var yt=yb-h,r,c2;
  q.fillStyle=mix(col,-.45);q.fillRect(x-w/2-2,yt-2,w+4,h+2);
  q.fillStyle=lg(q,x-w/2,0,x+w/2,0,[[0,'#4a2a1c'],[.5,'#5e3524'],[1,'#3e2216']]);q.fillRect(x-w/2,yt,w,h);
  q.fillStyle='rgba(0,0,0,.5)';q.fillRect(x-.5,yt,1,h);
  q.fillStyle='#e0b84a';
  for(r=0;r<4;r++)for(c2=-1;c2<=1;c2++){q.beginPath();q.arc(x-w/4+c2*3.2,yt+6+r*8,.9,0,PI2);q.fill();q.beginPath();q.arc(x+w/4+c2*3.2,yt+6+r*8,.9,0,PI2);q.fill()}
  q.strokeStyle='#e0b84a';q.lineWidth=1.2;q.beginPath();q.arc(x-2.6,yb-16,1.8,0,PI2);q.stroke();q.beginPath();q.arc(x+2.6,yb-16,1.8,0,PI2);q.stroke();
  if(boarded){q.strokeStyle='#6a5438';q.lineWidth=3.2;q.beginPath();q.moveTo(x-w/2-2,yt+8);q.lineTo(x+w/2+2,yb-9);q.moveTo(x+w/2+2,yt+9);q.lineTo(x-w/2-2,yb-8);q.stroke()}}
function roofPath(q,cx,y,w,h){
  q.beginPath();q.moveTo(cx-w-16,y-7);q.quadraticCurveTo(cx-w+4,y+3,cx-w*.55,y-h*.42);q.quadraticCurveTo(cx-w*.2,y-h*.92,cx,y-h);
  q.quadraticCurveTo(cx+w*.2,y-h*.92,cx+w*.55,y-h*.42);q.quadraticCurveTo(cx+w-4,y+3,cx+w+16,y-7);q.lineTo(cx+w+9,y+5);q.lineTo(cx-w-9,y+5);q.closePath()}
function roofArt(q,cx,y,w,h,col,nosnow){
  var dk=mix(col,-.38),lt=mix(col,.28),i,x;
  roofPath(q,cx,y,w,h);q.fillStyle=lg(q,0,y-h,0,y+5,[[0,lt],[.5,col],[1,dk]]);q.fill();
  q.save();roofPath(q,cx,y,w,h);q.clip();
  q.strokeStyle='rgba(0,0,0,.24)';q.lineWidth=.9;
  for(i=-9;i<=9;i++){q.beginPath();q.moveTo(cx+i*w*.012,y-h+2);q.lineTo(cx+i*(w+10)/9,y+5);q.stroke()}
  q.strokeStyle='rgba(0,0,0,.14)';for(i=1;i<4;i++){var yj=y-h+h*i*.26;q.beginPath();q.moveTo(cx-w-20,yj);q.lineTo(cx+w+20,yj);q.stroke()}
  q.fillStyle='rgba(255,255,255,.08)';q.fillRect(cx-w-20,y-h,w+20,h+10);q.restore();
  roofPath(q,cx,y,w,h);q.strokeStyle=dk;q.lineWidth=1.5;q.stroke();
  q.fillStyle='#e0b84a';q.fillRect(cx-w-9,y+3.6,w*2+18,1.3);
  for(x=-w-8;x<=w+8;x+=6.5){q.fillStyle=dk;q.beginPath();q.arc(cx+x,y+5,2.8,0,PI2);q.fill();q.fillStyle='#e0b84a';q.beginPath();q.arc(cx+x,y+5,1,0,PI2);q.fill()}
  q.fillStyle='#e0b84a';q.beginPath();q.arc(cx-w-15,y-8,1.9,0,PI2);q.fill();q.beginPath();q.arc(cx+w+15,y-8,1.9,0,PI2);q.fill();
  if(!nosnow){
    q.lineCap='round';q.strokeStyle='rgba(250,252,255,.97)';q.lineWidth=7;q.beginPath();q.moveTo(cx-w*.5,y-h*.46);q.quadraticCurveTo(cx-w*.2,y-h*.9,cx,y-h-.5);q.quadraticCurveTo(cx+w*.2,y-h*.9,cx+w*.5,y-h*.46);q.stroke();
    q.strokeStyle='rgba(185,210,248,.75)';q.lineWidth=1.8;q.beginPath();q.moveTo(cx-w*.46,y-h*.38);q.quadraticCurveTo(cx-w*.2,y-h*.82,cx,y-h+4);q.quadraticCurveTo(cx+w*.2,y-h*.82,cx+w*.46,y-h*.38);q.stroke();
    q.fillStyle='rgba(250,252,255,.95)';q.beginPath();q.ellipse(cx-w-8,y-5,5.5,2.4,-.3,0,PI2);q.fill();q.beginPath();q.ellipse(cx+w+8,y-5,5.5,2.4,.3,0,PI2);q.fill();
    for(x=-w+3;x<=w-2;x+=8){var len=3+rnd(x*3.1+y)*9;q.fillStyle='rgba(205,230,255,.92)';q.beginPath();q.moveTo(cx+x-1.5,y+7);q.lineTo(cx+x+1.5,y+7);q.lineTo(cx+x,y+7+len);q.closePath();q.fill()}}}
function finial(q,x,y){
  q.fillStyle='#e0b84a';q.beginPath();q.arc(x,y-3,3.2,0,PI2);q.fill();q.fillRect(x-.8,y-12,1.6,9);
  for(var j=0;j<3;j++)q.fillRect(x-2.4,y-11+j*2.6,4.8,1.1);
  q.fillStyle='rgba(255,255,255,.95)';q.beginPath();q.ellipse(x,y-5.6,2.6,1,0,0,PI2);q.fill()}
function plaque(q,x,y,w,h,ch,col,round){
  q.fillStyle='#24160f';
  if(round){q.beginPath();q.arc(x,y+h/2,h/2+1,0,PI2);q.fill();q.strokeStyle='#e0b84a';q.lineWidth=1.6;q.stroke()}
  else{q.fillRect(x-w/2,y,w,h);q.strokeStyle='#e0b84a';q.lineWidth=1.4;q.strokeRect(x-w/2+.7,y+.7,w-1.4,h-1.4)}
  q.fillStyle=mix(col,.5);q.font='bold '+Math.round(h*.72)+'px Ma Shan Zheng,'+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText(ch||'',x,y+h/2+.6);q.textBaseline='alphabetic'}
function archPath(q,x0,x1,yb,yt){q.beginPath();q.moveTo(x0,yb);q.lineTo(x0,yt+10);q.quadraticCurveTo((x0+x1)/2,yt-6,x1,yt+10);q.lineTo(x1,yb);q.closePath()}
function crystal(q,x,y,h,w,tilt,C){
  q.beginPath();q.moveTo(x-w/2,y);q.lineTo(x-w*.36,y-h*.7);q.lineTo(x+tilt,y-h);q.lineTo(x+w*.4,y-h*.66);q.lineTo(x+w/2,y);q.closePath();
  q.fillStyle=lg(q,0,y-h,0,y,[[0,'#f0faff'],[.5,'#9fd0f5'],[1,mix(C,-.1)]]);q.fill();
  q.fillStyle='rgba(20,70,150,.28)';q.beginPath();q.moveTo(x+tilt,y-h);q.lineTo(x+w*.05,y);q.lineTo(x-w/2,y);q.lineTo(x-w*.36,y-h*.7);q.closePath();q.fill();
  q.strokeStyle='rgba(235,248,255,.9)';q.lineWidth=.8;q.beginPath();q.moveTo(x-w/2,y);q.lineTo(x-w*.36,y-h*.7);q.lineTo(x+tilt,y-h);q.lineTo(x+w*.4,y-h*.66);q.lineTo(x+w/2,y);q.stroke()}

/* ---------- 5 kiểu nhà ---------- */
function pagoda(q,o){
  var C=o.col,wall=o.wall,i;
  podium(q,66,'#9d9886','#6a6656',!o.noRail);
  q.fillStyle=lg(q,0,-56,0,-13,[[0,mix(wall,.1)],[1,mix(wall,-.16)]]);q.fillRect(-46,-56,92,43);
  q.fillStyle=mix(wall,-.3);q.fillRect(-46,-20,92,1.6);
  q.strokeStyle='rgba(60,50,40,.13)';q.lineWidth=.8;for(i=-42;i<46;i+=10){q.beginPath();q.moveTo(i,-55);q.lineTo(i,-21);q.stroke()}
  latWin(q,-41,-48,22,18,C,o.boarded);
  if(o.furnace)furnaceMouth(q);else latWin(q,19,-48,22,18,C,o.boarded);
  doorArt(q,0,-13,22,36,C,o.boarded);
  q.fillStyle=o.boarded?'#241d30':'rgba(235,170,80,.55)';q.fillRect(-11,-55,22,5);
  [-46,-14,14,46].forEach(function(x){pillar(q,x,-13,-56,C)});
  lintel(q,-50,50,-62,6,C);
  [-46,-30,-14,0,14,30,46].forEach(function(x){bracket(q,x,-62,C)});
  roofArt(q,0,-72,60,24,o.roof,o.nosnow);
  q.fillStyle=lg(q,0,-98,0,-74,[[0,mix(wall,.1)],[1,mix(wall,-.16)]]);q.fillRect(-29,-98,58,24);
  plaque(q,0,-94,18,18,o.ch,C,o.round);
  latWin(q,-25,-94,9,14,C,o.boarded);latWin(q,16,-94,9,14,C,o.boarded);
  [-29,-12,12,29].forEach(function(x){pillar(q,x,-74,-98,C)});
  if(o.mid)o.mid(q);
  lintel(q,-33,33,-104,6,C);
  [-29,-15,0,15,29].forEach(function(x){bracket(q,x,-104,C)});
  roofArt(q,0,-111,42,24,o.roof,o.nosnow);
  finial(q,0,-135)}
function furnaceMouth(q){
  var r,x;
  q.fillStyle='#5b4a46';q.fillRect(18,-54,26,41);
  q.strokeStyle='rgba(20,10,10,.45)';q.lineWidth=.8;
  for(r=0;r<7;r++){var yy=-54+r*5.9;q.beginPath();q.moveTo(18,yy);q.lineTo(44,yy);q.stroke();for(x=18+(r%2?4:0);x<44;x+=8){q.beginPath();q.moveTo(x,yy);q.lineTo(x,yy+5.9);q.stroke()}}
  archPath(q,23,39,-13,-44);q.fillStyle='#160a0a';q.fill();
  var gr=q.createRadialGradient(31,-22,1,31,-22,18);gr.addColorStop(0,'#fff4b8');gr.addColorStop(.35,'#ff9a30');gr.addColorStop(.75,'#8a2410');gr.addColorStop(1,'rgba(20,5,5,.9)');
  archPath(q,23,39,-13,-44);q.fillStyle=gr;q.fill();q.strokeStyle='#2a1a16';q.lineWidth=2.4;q.stroke();
  q.fillStyle='#e0b84a';q.fillRect(21,-13,20,2)}
function anvil(q,x,yb){
  q.fillStyle='#4a3a30';q.fillRect(x-5,yb-8,10,8);q.fillStyle='#3a3f4c';q.beginPath();q.moveTo(x-9,yb-16);q.lineTo(x+9,yb-16);q.lineTo(x+14,yb-13.5);q.lineTo(x+7,yb-12);q.lineTo(x+5,yb-8);q.lineTo(x-5,yb-8);q.lineTo(x-7,yb-12);q.lineTo(x-9,yb-12);q.closePath();q.fill();
  q.fillStyle='#8a92a8';q.fillRect(x-9,yb-16,18,1.4);q.fillStyle='rgba(255,255,255,.9)';q.fillRect(x-7,yb-17.3,12,1.4);
  q.strokeStyle='#6a4a30';q.lineWidth=1.8;q.beginPath();q.moveTo(x+11,yb);q.lineTo(x+16,yb-14);q.stroke();q.fillStyle='#4a4f5c';q.fillRect(x+13,yb-18,7,4)}
function cauldron(q,x,yb){
  q.strokeStyle='#2a2430';q.lineWidth=2;q.beginPath();q.moveTo(x-7,yb-6);q.lineTo(x-9,yb);q.moveTo(x+7,yb-6);q.lineTo(x+9,yb);q.stroke();
  q.fillStyle='#2a2430';q.beginPath();q.arc(x,yb-11,10,0,Math.PI);q.fill();q.fillStyle='#4a4455';q.beginPath();q.ellipse(x,yb-11,11,3,0,0,PI2);q.fill();
  q.fillStyle='#ff8a2a';q.beginPath();q.ellipse(x,yb-11.4,8.6,2.1,0,0,PI2);q.fill();q.fillStyle='#ffe07a';q.beginPath();q.ellipse(x,yb-11.6,4.5,1,0,0,PI2);q.fill();
  q.strokeStyle='#4a4455';q.lineWidth=1.6;q.beginPath();q.arc(x-11,yb-11,2,Math.PI*.5,Math.PI*1.5);q.stroke();q.beginPath();q.arc(x+11,yb-11,2,-Math.PI*.5,Math.PI*.5);q.stroke()}
function ding(q,x,yb){
  var j;
  q.fillStyle='#ff9a30';for(j=-1;j<=1;j++){q.beginPath();q.moveTo(x+j*5-2,yb);q.lineTo(x+j*5,yb-7);q.lineTo(x+j*5+2,yb);q.fill()}
  q.fillStyle='#6a4a2a';q.fillRect(x-8,yb-1,16,1.6);
  q.fillStyle='#8a6a34';q.fillRect(x-7,yb-9,3,8);q.fillRect(x+4,yb-9,3,8);q.fillRect(x-1.5,yb-9,3,8);
  q.fillStyle=lg(q,x-9,0,x+9,0,[[0,'#6a4a22'],[.4,'#c9a24a'],[1,'#5a3e1c']]);
  q.beginPath();q.moveTo(x-8,yb-26);q.quadraticCurveTo(x-11,yb-17,x-7,yb-9);q.lineTo(x+7,yb-9);q.quadraticCurveTo(x+11,yb-17,x+8,yb-26);q.closePath();q.fill();
  q.strokeStyle='#5a3e1c';q.lineWidth=1.8;q.beginPath();q.arc(x-9,yb-26,2.4,Math.PI*.2,Math.PI*1.5);q.stroke();q.beginPath();q.arc(x+9,yb-26,2.4,-Math.PI*.5,Math.PI*.8);q.stroke();
  q.fillStyle='#e8c66a';q.beginPath();q.ellipse(x,yb-26,8.4,2.4,0,0,PI2);q.fill();q.fillStyle='#4ad38a';q.beginPath();q.ellipse(x,yb-26.4,6.4,1.5,0,0,PI2);q.fill();
  q.strokeStyle='rgba(30,20,10,.5)';q.lineWidth=.8;for(j=0;j<4;j++){q.beginPath();q.arc(x-6+j*4,yb-17,1.3,0,PI2);q.stroke()}}
function herbRack(q,x,yb){
  var j,cs=['#4a8a4a','#7a9a3a','#8a5a3a','#3a7a5a','#a07a3a'];
  q.strokeStyle='#6a4a2a';q.lineWidth=2;q.beginPath();q.moveTo(x-6,yb);q.lineTo(x-6,yb-30);q.moveTo(x+6,yb);q.lineTo(x+6,yb-30);q.moveTo(x-8,yb-28);q.lineTo(x+8,yb-28);q.stroke();
  for(j=0;j<5;j++){var hx2=x-5+j*2.6;q.strokeStyle='#5a4a30';q.lineWidth=.7;q.beginPath();q.moveTo(hx2,yb-28);q.lineTo(hx2,yb-24);q.stroke();q.fillStyle=cs[j];q.beginPath();q.ellipse(hx2,yb-21.5,1.5,3.6,0,0,PI2);q.fill()}
  q.fillStyle='rgba(255,255,255,.9)';q.fillRect(x-8,yb-29.2,16,1.4)}
function gourd(q,x,y){q.strokeStyle='#5a4a30';q.lineWidth=.8;q.beginPath();q.moveTo(x,y-5);q.lineTo(x,y);q.stroke();q.fillStyle='#c9a24a';q.beginPath();q.arc(x,y+2.4,2.4,0,PI2);q.fill();q.beginPath();q.arc(x,y+7,3.3,0,PI2);q.fill();q.fillStyle='#e0b84a';q.fillRect(x-1.2,y-.4,2.4,1.2)}
function fort(q,C){
  var stone='#7b8aa4',i,r,cx;
  q.fillStyle=lg(q,0,-8,0,0,[[0,'#8a97b0'],[1,'#566178']]);q.fillRect(-66,-8,132,8);q.fillStyle='rgba(255,255,255,.3)';q.fillRect(-66,-8,132,1.3);
  q.fillStyle=lg(q,0,-60,0,-8,[[0,mix(stone,.12)],[1,mix(stone,-.18)]]);q.fillRect(-42,-60,84,52);
  q.strokeStyle='rgba(20,28,50,.38)';q.lineWidth=.9;
  for(r=0;r<6;r++){var yy=-8-r*8.7;q.beginPath();q.moveTo(-42,yy);q.lineTo(42,yy);q.stroke();for(i=-42+(r%2?7:0);i<42;i+=14){q.beginPath();q.moveTo(i,yy);q.lineTo(i,yy-8.7);q.stroke()}}
  q.fillStyle='rgba(220,238,255,.4)';q.fillRect(-42,-14,84,6);
  for(i=-42;i<42;i+=14){q.fillStyle=mix(stone,.1);q.fillRect(i+1,-68,10,8);q.fillStyle='rgba(255,255,255,.95)';rrect(q,i,-70,12,3.2,1.5);q.fill()}
  q.fillStyle='#3a4560';q.fillRect(-42,-60,84,1.6);
  for(i=-40;i<42;i+=6){var ln2=3+rnd(i*1.7)*10;q.fillStyle='rgba(210,235,255,.9)';q.beginPath();q.moveTo(i-1.5,-58.5);q.lineTo(i+1.5,-58.5);q.lineTo(i,-58.5+ln2);q.closePath();q.fill()}
  /* keep */
  q.fillStyle=lg(q,-22,0,22,0,[[0,mix(stone,-.2)],[.5,mix(stone,.18)],[1,mix(stone,-.28)]]);q.fillRect(-22,-108,44,42);
  q.strokeStyle='rgba(20,28,50,.34)';q.lineWidth=.8;for(r=0;r<5;r++){var y2=-66-r*8.4;q.beginPath();q.moveTo(-22,y2);q.lineTo(22,y2);q.stroke();for(i=-22+(r%2?6:0);i<22;i+=12){q.beginPath();q.moveTo(i,y2);q.lineTo(i,y2-8.4);q.stroke()}}
  plaque(q,0,-100,16,18,'雪',C,0);
  for(i=-1;i<=1;i+=2){q.fillStyle='#0b1020';archPath(q,i*14-3,i*14+3,-84,-102);q.fill();q.fillStyle='rgba(255,215,140,.6)';archPath(q,i*14-3,i*14+3,-84,-102);q.fill();q.strokeStyle='#aebad0';q.lineWidth=1.2;archPath(q,i*14-3,i*14+3,-84,-102);q.stroke()}
  roofArt(q,0,-110,30,20,mix(C,-.15));
  /* cổng + chấn song */
  q.beginPath();q.moveTo(-11,-8);q.lineTo(-11,-30);q.quadraticCurveTo(-11,-44,0,-52);q.quadraticCurveTo(11,-44,11,-30);q.lineTo(11,-8);q.closePath();
  q.fillStyle='#090d1c';q.fill();
  q.save();q.beginPath();q.moveTo(-11,-8);q.lineTo(-11,-30);q.quadraticCurveTo(-11,-44,0,-52);q.quadraticCurveTo(11,-44,11,-30);q.lineTo(11,-8);q.closePath();q.clip();
  q.fillStyle=lg(q,0,-30,0,-8,[[0,'rgba(120,190,255,0)'],[1,'rgba(120,190,255,.4)']]);q.fillRect(-12,-52,24,44);
  q.strokeStyle='#8c9ab4';q.lineWidth=1.4;for(i=-9;i<=9;i+=4.5){q.beginPath();q.moveTo(i,-52);q.lineTo(i,-14);q.stroke()}
  for(r=0;r<3;r++){q.beginPath();q.moveTo(-12,-22-r*11);q.lineTo(12,-22-r*11);q.stroke()}
  q.fillStyle='#8c9ab4';for(i=-9;i<=9;i+=4.5){q.beginPath();q.moveTo(i-1.2,-14);q.lineTo(i+1.2,-14);q.lineTo(i,-9.5);q.closePath();q.fill()}
  q.restore();
  q.beginPath();q.moveTo(-11,-8);q.lineTo(-11,-30);q.quadraticCurveTo(-11,-44,0,-52);q.quadraticCurveTo(11,-44,11,-30);q.lineTo(11,-8);q.strokeStyle='#b3bfd4';q.lineWidth=3;q.stroke();
  q.fillStyle='#8fd0ff';q.fillRect(-3,-54,6,5);q.strokeStyle='#e6f6ff';q.lineWidth=.8;q.strokeRect(-3,-54,6,5);
  for(i=-1;i<=1;i+=2){var tx=i*20;q.fillStyle='#5a4632';q.fillRect(tx-1,-36,2,8);q.fillStyle='#ff9a30';q.beginPath();q.moveTo(tx-3,-36);q.quadraticCurveTo(tx-3.5,-42,tx,-46);q.quadraticCurveTo(tx+3.5,-42,tx+3,-36);q.closePath();q.fill();q.fillStyle='#ffe07a';q.beginPath();q.ellipse(tx,-38,1.4,2.4,0,0,PI2);q.fill()}
  /* 2 tháp tròn */
  for(i=-1;i<=1;i+=2){cx=i*53;
    q.fillStyle=lg(q,cx-12,0,cx+12,0,[[0,mix(stone,-.3)],[.35,mix(stone,.15)],[1,mix(stone,-.4)]]);q.fillRect(cx-12,-96,24,96);
    q.strokeStyle='rgba(20,28,50,.34)';q.lineWidth=.8;for(r=0;r<11;r++){q.beginPath();q.moveTo(cx-12,-8.7*r-8);q.lineTo(cx+12,-8.7*r-8);q.stroke()}
    q.fillStyle='#0b1020';q.fillRect(cx-1.5,-30,3,10);q.fillRect(cx-1.5,-60,3,10);q.fillRect(cx-1.5,-82,3,9);
    q.fillStyle=mix(stone,-.35);q.fillRect(cx-15,-100,30,5);q.fillStyle=mix(stone,.2);q.fillRect(cx-15,-100,30,1.3);
    q.beginPath();q.moveTo(cx-17,-100);q.quadraticCurveTo(cx-6,-107,cx,-128);q.quadraticCurveTo(cx+6,-107,cx+17,-100);q.quadraticCurveTo(cx,-96,cx-17,-100);q.closePath();
    q.fillStyle=lg(q,cx-17,0,cx+17,0,[[0,mix(C,-.2)],[.5,mix(C,.35)],[1,mix(C,-.4)]]);q.fill();
    q.strokeStyle='rgba(0,0,40,.25)';q.lineWidth=.8;for(r=1;r<4;r++){q.beginPath();q.moveTo(cx-17+r*2,-100-r*6.5);q.lineTo(cx+17-r*2,-100-r*6.5);q.stroke()}
    q.strokeStyle='rgba(250,252,255,.95)';q.lineWidth=3;q.lineCap='round';q.beginPath();q.moveTo(cx-17,-100.5);q.quadraticCurveTo(cx,-96.5,cx+17,-100.5);q.stroke();
    q.strokeStyle='#cdd8ee';q.lineWidth=1;q.beginPath();q.moveTo(cx,-128);q.lineTo(cx,-139);q.stroke();q.fillStyle=mix(C,.1);q.beginPath();q.moveTo(cx,-139);q.lineTo(cx+(i<0?-8:8),-136);q.lineTo(cx,-133);q.closePath();q.fill()}
  crystal(q,0,-130,15,8,2,C);crystal(q,-60,2,22,9,2,C);crystal(q,-52,3,13,7,-2,C);crystal(q,60,2,20,9,-2,C);crystal(q,53,3,12,7,2,C)}
function bone(q,C,ch){
  var sand='#c9a468',bn='#efe5cc',i,j;
  [[66,0,-9],[58,-9,-18],[50,-18,-27]].forEach(function(t){
    q.fillStyle=lg(q,0,t[2],0,t[1],[[0,mix(sand,.15)],[1,mix(sand,-.28)]]);q.fillRect(-t[0],t[2],t[0]*2,t[1]-t[2]);
    q.fillStyle='rgba(255,255,255,.3)';q.fillRect(-t[0],t[2],t[0]*2,1.2);q.fillStyle='rgba(70,40,20,.5)';
    for(var x=-t[0]+5;x<t[0]-3;x+=9)q.fillRect(x,(t[1]+t[2])/2-1,3,2)});
  q.beginPath();q.moveTo(-42,-27);q.lineTo(-34,-80);q.lineTo(34,-80);q.lineTo(42,-27);q.closePath();
  q.fillStyle=lg(q,-42,0,42,0,[[0,mix(sand,-.18)],[.45,mix(sand,.12)],[1,mix(sand,-.3)]]);q.fill();
  q.strokeStyle='rgba(90,55,25,.3)';q.lineWidth=.9;
  for(j=0;j<7;j++){var yy=-33-j*7,tt=(-27-yy)/53,ww=42-8*tt;q.beginPath();q.moveTo(-ww,yy);q.lineTo(ww,yy);q.stroke()}
  q.beginPath();q.moveTo(-30,-62);q.lineTo(-27,-54);q.lineTo(-31,-48);q.lineTo(-28,-40);q.moveTo(26,-66);q.lineTo(29,-58);q.lineTo(25,-52);q.stroke();
  q.fillStyle='rgba(60,32,16,.55)';q.fillRect(-36,-78,72,7);q.strokeStyle=bn;q.lineWidth=1.2;q.beginPath();q.moveTo(-34,-72);
  for(i=-34;i<34;i+=6){q.lineTo(i+3,-77);q.lineTo(i+6,-72)}q.stroke();
  for(i=-1;i<=1;i+=2){q.fillStyle='#4a2a14';q.fillRect(i*27-6,-56,12,12);q.strokeStyle=bn;q.lineWidth=1;q.strokeRect(i*27-5,-55,10,10);q.fillStyle=bn;q.font='bold 10.5px Ma Shan Zheng,'+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText('骨',i*27,-49.6);q.textBaseline='alphabetic'}
  q.beginPath();q.moveTo(-14,-27);q.lineTo(-14,-42);q.quadraticCurveTo(-14,-56,0,-56);q.quadraticCurveTo(14,-56,14,-42);q.lineTo(14,-27);q.closePath();
  q.fillStyle='#220e06';q.fill();q.fillStyle=lg(q,0,-56,0,-27,[[0,'rgba(120,40,10,0)'],[1,'rgba(255,120,40,.5)']]);q.fill();
  for(i=0;i<4;i++){var rx=17+3.6*i,ry=32+4.5*i;
    q.strokeStyle='#5a3a1e';q.lineWidth=4.6;q.beginPath();q.ellipse(0,-27,rx,ry,0,Math.PI,Math.PI*2);q.stroke();
    q.strokeStyle=bn;q.lineWidth=3;q.beginPath();q.ellipse(0,-27,rx,ry,0,Math.PI,Math.PI*2);q.stroke();
    q.fillStyle=bn;q.beginPath();q.arc(-rx,-27,2.4,0,PI2);q.fill();q.beginPath();q.arc(rx,-27,2.4,0,PI2);q.fill()}
  q.fillStyle=mix(sand,-.35);q.fillRect(-38,-84,76,5);q.fillStyle='rgba(255,255,255,.4)';q.fillRect(-38,-84,76,1.2);
  for(i=-1;i<=1;i+=2){var px=i*37;q.fillStyle=lg(q,px-3,0,px+3,0,[[0,'#cfc5ac'],[.5,bn],[1,'#bfb59c']]);q.fillRect(px-3,-114,6,30);
    q.fillStyle=bn;q.beginPath();q.arc(px,-115,3.8,0,PI2);q.fill();q.beginPath();q.moveTo(px-2.4,-117);q.lineTo(px,-125);q.lineTo(px+2.4,-117);q.closePath();q.fill();
    q.strokeStyle='#6a4a2a';q.lineWidth=1.4;q.beginPath();q.moveTo(px+i*1,-110);q.lineTo(px+i*10,-110);q.stroke();
    var bx2=px+i*10;q.fillStyle='#7a2424';q.beginPath();q.moveTo(bx2-4,-110);q.lineTo(bx2+4,-110);q.lineTo(bx2+4,-88);q.lineTo(bx2+2,-91);q.lineTo(bx2,-88);q.lineTo(bx2-2,-91);q.lineTo(bx2-4,-88);q.closePath();q.fill();
    q.strokeStyle='#e0b84a';q.lineWidth=.9;q.beginPath();q.moveTo(bx2,-106);q.lineTo(bx2,-95);q.moveTo(bx2-2,-102);q.lineTo(bx2+2,-102);q.stroke()}
  q.fillStyle=bn;q.beginPath();q.arc(0,-97,10.5,Math.PI*.95,Math.PI*2.05);q.lineTo(7,-89);q.lineTo(-7,-89);q.closePath();q.fill();
  q.fillStyle='#d9ceb4';rrect(q,-6,-90,12,6,1.6);q.fill();
  q.fillStyle='#180805';q.beginPath();q.arc(-4.5,-97,3,0,PI2);q.fill();q.beginPath();q.arc(4.5,-97,3,0,PI2);q.fill();q.beginPath();q.moveTo(0,-94.5);q.lineTo(-1.7,-91.5);q.lineTo(1.7,-91.5);q.closePath();q.fill();
  q.strokeStyle='#8a7a5a';q.lineWidth=.7;for(i=-4;i<=4;i+=2){q.beginPath();q.moveTo(i,-89.5);q.lineTo(i,-85.5);q.stroke()}
  for(i=-1;i<=1;i+=2){q.fillStyle=bn;q.beginPath();q.moveTo(i*8,-103);q.quadraticCurveTo(i*18,-108,i*20,-122);q.lineTo(i*17,-121);q.quadraticCurveTo(i*15,-110,i*6,-105);q.closePath();q.fill()}
  q.fillStyle='rgba(255,255,255,.95)';q.beginPath();q.ellipse(0,-106.5,5,1.6,0,0,PI2);q.fill();
  for(i=-1;i<=1;i+=2){q.fillStyle=lg(q,0,-12,0,0,[[0,mix(sand,.2)],[1,mix(sand,-.2)]]);q.beginPath();q.ellipse(i*58,0,12,6,0,Math.PI,Math.PI*2);q.fill();q.fillStyle='rgba(255,255,255,.9)';q.beginPath();q.ellipse(i*58,-3.5,6,1.8,0,0,PI2);q.fill()}
  q.strokeStyle=bn;q.lineWidth=2;q.lineCap='round';q.beginPath();q.moveTo(54,-2);q.lineTo(64,-4);q.moveTo(56,-5);q.lineTo(63,-1);q.stroke();q.fillStyle=bn;q.beginPath();q.arc(54,-2,1.6,0,PI2);q.fill();q.beginPath();q.arc(64,-4,1.6,0,PI2);q.fill()}
function mansion(q,C,ch,opened){
  var i;
  if(opened){pagoda(q,{col:'#a8483a',wall:'#efe0c0',roof:'#a8483a',ch:ch,noRail:0});return}
  pagoda(q,{col:mix(C,-.45),wall:'#8a8296',roof:'#4d3d58',ch:ch,boarded:1,nosnow:0});
  q.fillStyle='rgba(8,6,14,.72)';
  [[[-40,-78],[-33,-85],[-27,-79],[-34,-75]],[[28,-85],[36,-81],[32,-76],[25,-80]],[[-27,-123],[-20,-125],[-18,-118],[-25,-116]]].forEach(function(p){q.beginPath();q.moveTo(p[0][0],p[0][1]);for(var k=1;k<p.length;k++)q.lineTo(p[k][0],p[k][1]);q.closePath();q.fill()});
  q.strokeStyle='#2a3626';q.lineWidth=1.6;q.lineCap='round';
  for(i=-1;i<=1;i+=2){q.beginPath();q.moveTo(i*46,-13);q.quadraticCurveTo(i*52,-30,i*44,-44);q.quadraticCurveTo(i*40,-52,i*46,-60);q.stroke();q.fillStyle='#3a4a30';for(var k2=0;k2<5;k2++){q.beginPath();q.ellipse(i*(46+(k2%2?3:-3)),-20-k2*8,2.6,1.2,.6,0,PI2);q.fill()}}
  q.strokeStyle='rgba(235,235,245,.5)';q.lineWidth=.7;
  for(i=1;i<5;i++){q.beginPath();q.moveTo(-46,-56);q.lineTo(-46+i*3.6,-56+(5-i)*3.4);q.moveTo(46,-56);q.lineTo(46-i*3.6,-56+(5-i)*3.4);q.stroke()}
  q.globalCompositeOperation='source-atop';q.fillStyle='rgba(24,18,44,.26)';q.fillRect(-90,-170,180,200);q.globalCompositeOperation='source-over'}
/* Nhận diện đúng nhà theo chữ trên biển do từng phụ bản đặt (109 雪 · 110 煉 · 111 丹 · 116 骨); nhà chưa gắn phụ bản = nhà hoang bị khoá */
var STY={'雪':0,'煉':1,'丹':2,'骨':3,'鍛':5};
function styleOf(H_){var v=STY[H_&&H_.ch];return v===undefined?4:v}
function smithy(q,C){
  var i,r,k;
  podium(q,66,'#6f6b78','#3e3a46',0);
  for(i=-1;i<=1;i+=2){var cx=i*38;q.fillStyle='#3e3646';q.fillRect(cx-4.5,-112,9,40);q.fillStyle='#2a2430';q.fillRect(cx-6.5,-115,13,4);q.fillStyle='#e0803a';q.fillRect(cx-6.5,-115,13,1);q.fillStyle='rgba(255,255,255,.95)';q.fillRect(cx-6,-116.4,12,1.6)}
  q.fillStyle=lg(q,0,-72,0,-13,[[0,'#5a5568'],[1,'#2a2634']]);q.fillRect(-48,-72,96,59);
  q.strokeStyle='rgba(10,8,16,.42)';q.lineWidth=.8;
  for(r=0;r<7;r++){var yy=-13-r*8.4;q.beginPath();q.moveTo(-48,yy);q.lineTo(48,yy);q.stroke();for(i=-48+(r%2?6:0);i<48;i+=12){q.beginPath();q.moveTo(i,yy);q.lineTo(i,yy-8.4);q.stroke()}}
  [-48,-36,36,48].forEach(function(x){q.fillStyle='#1f1c27';q.fillRect(x-2.5,-72,5,59);q.fillStyle='#e0803a';q.fillRect(x-.5,-70,1,55);q.fillStyle='#8a8494';for(k=0;k<6;k++){q.beginPath();q.arc(x,-66+k*9.5,.9,0,PI2);q.fill()}});
  /* ô tường: giá vũ khí (trái) + giá giáp thánh khí (phải) */
  q.fillStyle='#16131d';q.fillRect(-33,-58,16,34);q.fillRect(17,-58,16,34);q.strokeStyle='#e0803a';q.lineWidth=1;q.strokeRect(-33,-58,16,34);q.strokeRect(17,-58,16,34);
  q.fillStyle='#3a2a20';q.fillRect(-31,-54,12,2.4);q.fillRect(-31,-34,12,2.4);
  for(i=0;i<3;i++){var bx3=-29+i*4.6;q.fillStyle='#c4cee2';q.fillRect(bx3-.8,-53,1.6,22);q.beginPath();q.moveTo(bx3-.8,-53);q.lineTo(bx3,-56);q.lineTo(bx3+.8,-53);q.closePath();q.fill();q.fillStyle='#e0803a';q.fillRect(bx3-2.2,-31,4.4,1.3);q.fillStyle='#6a4a30';q.fillRect(bx3-.6,-29.7,1.2,4)}
  q.strokeStyle='#5a4a3a';q.lineWidth=1.6;q.beginPath();q.moveTo(25,-27);q.lineTo(25,-26);q.moveTo(21,-24.5);q.lineTo(29,-24.5);q.stroke();
  q.fillStyle=lg(q,20,0,31,0,[[0,'#b88a2a'],[.5,'#ffe07a'],[1,'#a87a20']]);q.beginPath();q.moveTo(20,-46);q.lineTo(31,-46);q.lineTo(29,-30);q.lineTo(22,-30);q.closePath();q.fill();
  q.beginPath();q.arc(19.5,-46,2.8,0,PI2);q.fill();q.beginPath();q.arc(31.5,-46,2.8,0,PI2);q.fill();q.beginPath();q.arc(25.5,-52,4.2,0,PI2);q.fill();
  q.fillStyle='#16131d';q.fillRect(23.6,-53,3.8,2.4);q.fillStyle='#e0803a';q.fillRect(22,-39,7,1.4);
  /* miệng lò */
  archPath(q,-14,14,-13,-50);q.fillStyle='#120a0a';q.fill();
  var gr=q.createRadialGradient(0,-24,1,0,-24,26);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.3,'#ffb040');gr.addColorStop(.7,'#b02c10');gr.addColorStop(1,'rgba(30,6,4,.95)');
  archPath(q,-14,14,-13,-50);q.fillStyle=gr;q.fill();
  q.strokeStyle='#1f1c27';q.lineWidth=4;archPath(q,-14,14,-13,-50);q.stroke();q.strokeStyle='#e0803a';q.lineWidth=1;archPath(q,-12,12,-13,-47);q.stroke();
  /* mái dốc đá phiến + hàng hiên */
  q.fillStyle='#1f1c27';q.fillRect(-58,-72,116,5);q.fillStyle='#e0803a';for(i=-54;i<=54;i+=9){q.beginPath();q.arc(i,-69.5,1,0,PI2);q.fill()}
  q.beginPath();q.moveTo(-60,-72);q.lineTo(0,-100);q.lineTo(60,-72);q.closePath();
  q.fillStyle=lg(q,0,-100,0,-72,[[0,'#4a4458'],[1,'#26222e']]);q.fill();
  q.save();q.beginPath();q.moveTo(-60,-72);q.lineTo(0,-100);q.lineTo(60,-72);q.closePath();q.clip();q.strokeStyle='rgba(0,0,0,.3)';q.lineWidth=.9;
  for(r=1;r<5;r++){q.beginPath();q.moveTo(-60,-72-r*5.6);q.lineTo(60,-72-r*5.6);q.stroke()}
  for(i=-60;i<60;i+=10){q.beginPath();q.moveTo(i,-72);q.lineTo(i+(i<0?5:-5)*0+0,-100);q.stroke()}
  q.restore();
  q.strokeStyle='#e0803a';q.lineWidth=1.8;q.beginPath();q.moveTo(-60,-72);q.lineTo(0,-100);q.lineTo(60,-72);q.stroke();
  q.lineCap='round';q.strokeStyle='rgba(250,252,255,.96)';q.lineWidth=6;q.beginPath();q.moveTo(-26,-85.5);q.lineTo(0,-98);q.lineTo(26,-85.5);q.stroke();
  q.fillStyle='rgba(250,252,255,.95)';q.beginPath();q.ellipse(-52,-72.5,6,2.2,-.3,0,PI2);q.fill();q.beginPath();q.ellipse(52,-72.5,6,2.2,.3,0,PI2);q.fill();
  /* ống khói giữa */
  q.fillStyle=lg(q,-9,0,9,0,[[0,'#2e2832'],[.5,'#4e4658'],[1,'#26202a']]);q.fillRect(-9,-128,18,34);
  q.strokeStyle='rgba(0,0,0,.35)';q.lineWidth=.8;for(r=0;r<6;r++){q.beginPath();q.moveTo(-9,-125+r*5.6);q.lineTo(9,-125+r*5.6);q.stroke()}
  q.fillStyle='#2a2430';q.beginPath();q.moveTo(-13,-128);q.lineTo(13,-128);q.lineTo(10,-134);q.lineTo(-10,-134);q.closePath();q.fill();q.fillStyle='#e0803a';q.fillRect(-13,-128.8,26,1.3);
  q.fillStyle='rgba(255,255,255,.95)';q.fillRect(-10,-135.4,20,1.8);
  /* bánh răng + biển */
  q.save();q.translate(0,-60);q.fillStyle='#2a2630';for(k=0;k<10;k++){q.rotate(PI2/10);q.fillRect(-1.6,-10,3.2,3.4)}q.restore();
  q.fillStyle='#2a2630';q.beginPath();q.arc(0,-60,7.8,0,PI2);q.fill();q.strokeStyle='#e0803a';q.lineWidth=1.4;q.stroke();
  q.fillStyle='#ffd8a0';q.font='bold 10px Ma Shan Zheng,'+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText('鍛',0,-59.6);q.textBaseline='alphabetic';
  /* dòng kim loại nóng chảy chảy xuống bậc thang */
  q.fillStyle=lg(q,0,-13,0,0,[[0,'#ffe07a'],[.5,'#ff8a2a'],[1,'#c03a14']]);q.beginPath();q.moveTo(-4.5,-13);q.lineTo(4.5,-13);q.lineTo(6.5,0);q.lineTo(-6.5,0);q.closePath();q.fill();
  q.strokeStyle='rgba(30,10,6,.55)';q.lineWidth=.8;q.stroke()}
function buildHouse(q,i0,H_){
  var i=styleOf(H_),C=hx(H_.col),opened=typeof H_.open==='function'&&!H_.locked;
  q.fillStyle='rgba(15,22,60,.3)';q.beginPath();q.ellipse(0,2,72,8,0,0,PI2);q.fill();
  if(i===0)fort(q,C);
  else if(i===1){pagoda(q,{col:C,wall:'#e9ddc8',roof:mix(C,-.12),ch:H_.ch,noRail:1,furnace:1,
    mid:function(q2){q2.fillStyle=lg(q2,36,0,46,0,[[0,'#6a5048'],[.5,'#8a6a5c'],[1,'#5a4038']]);q2.fillRect(36,-126,10,44);q2.strokeStyle='rgba(20,10,10,.4)';q2.lineWidth=.7;for(var r=0;r<8;r++){q2.beginPath();q2.moveTo(36,-124+r*5.4);q2.lineTo(46,-124+r*5.4);q2.stroke()}q2.fillStyle='#4a3830';q2.fillRect(34,-130,14,5);q2.fillStyle='rgba(255,255,255,.95)';q2.fillRect(34,-131.4,14,1.8)}});
    anvil(q,-52,-13);cauldron(q,54,-13)}
  else if(i===2){pagoda(q,{col:C,wall:'#efe7d4',roof:mix(C,-.1),ch:H_.ch,noRail:1,round:1});herbRack(q,-54,-13);ding(q,54,-13);gourd(q,-36,-66);gourd(q,36,-66)}
  else if(i===3)bone(q,C,H_.ch);
  else if(i===5)smithy(q,C);
  else mansion(q,C,H_.ch,opened);
  q.fillStyle='rgba(240,247,255,.95)';
  [-1,1].forEach(function(d){q.beginPath();q.ellipse(d*62,0,12,3.4,0,0,PI2);q.fill()});
  q.fillStyle='rgba(205,222,248,.9)';[-1,1].forEach(function(d){q.beginPath();q.ellipse(d*66,1,6,1.8,0,0,PI2);q.fill()})}
var SPR={},SW=164,SH=170,SX=82,SY=154;
try{if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){SPR={}})}catch(e){}
function spriteOf(i){
  var H_=HOUSES[i],k=bww()/120,ps=Math.min(3,Math.max(.6,s*k*DPR)),
      key=[ps.toFixed(2),H_.col,H_.ch,H_.locked?1:0,typeof H_.open==='function'?1:0].join('|'),e=SPR[i];
  if(e&&e.key===key)return e.cv;
  var cv=document.createElement('canvas');cv.width=Math.ceil(SW*ps);cv.height=Math.ceil(SH*ps);
  var q=cv.getContext('2d');q.setTransform(ps,0,0,ps,SX*ps,SY*ps);
  try{buildHouse(q,i,H_)}catch(x){try{console.warn('[Lang 3] nhà',i,x)}catch(y){}}
  SPR[i]={key:key,cv:cv};return cv}
/* ô phát sáng theo từng nhà (toạ độ cục bộ) */
var WIN=[
 [{x:11,y:-100,w:6,h:16},{x:-17,y:-100,w:6,h:16},{x:51.5,y:-60,w:3,h:10},{x:-54.5,y:-60,w:3,h:10}],
 [{x:-41,y:-48,w:22,h:18},{x:-25,y:-94,w:9,h:14},{x:16,y:-94,w:9,h:14}],
 [{x:-41,y:-48,w:22,h:18},{x:19,y:-48,w:22,h:18},{x:-25,y:-94,w:9,h:14},{x:16,y:-94,w:9,h:14}],
 [{x:-14,y:-56,w:28,h:29}],
 []];
function houseDyn(i0,t){
  var H_=HOUSES[i0],i=styleOf(H_),W_=WIN[i]||[],m,w,j,p,gl=.55+.45*Math.sin(t*.06+i*1.7),fl=.6+.4*Math.sin(t*.21)*Math.sin(t*.13+1);
  if(i===4&&!(typeof H_.open==='function'&&!H_.locked))return;
  g.fillStyle=i===3?'rgba(255,120,50,'+(.1+.14*gl)+')':'rgba(255,214,140,'+(.1+.16*gl)+')';
  for(m=0;m<W_.length;m++){w=W_[m];g.fillRect(w.x,w.y,w.w,w.h)}
  if(lite())return;
  g.save();g.globalCompositeOperation='lighter';
  if(i===0){
    var cr=[[0,-142],[-60,-12],[60,-10],[-52,-10]];
    for(j=0;j<cr.length;j++){var a=Math.sin(t*.05+j*1.7);if(a>.4){var al=(a-.4)/.6,sz=3+al*3;g.strokeStyle='rgba(255,255,255,'+al.toFixed(2)+')';g.lineWidth=1;g.beginPath();g.moveTo(cr[j][0]-sz,cr[j][1]);g.lineTo(cr[j][0]+sz,cr[j][1]);g.moveTo(cr[j][0],cr[j][1]-sz);g.lineTo(cr[j][0],cr[j][1]+sz);g.stroke()}}
    for(j=0;j<3;j++){p=((t*.005)+j/3)%1;g.fillStyle='rgba(170,215,255,'+(.2*(1-p)).toFixed(3)+')';g.beginPath();g.ellipse(Math.sin(t*.03+j*2)*5,-14-p*18,7+p*6,3+p*3,0,0,PI2);g.fill()}
  }else if(i===1){
    var gr=g.createRadialGradient(31,-26,1,31,-26,28);gr.addColorStop(0,'rgba(255,160,60,'+(.55*fl).toFixed(3)+')');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.beginPath();g.arc(31,-26,28,0,PI2);g.fill();
    gr=g.createRadialGradient(54,-24,1,54,-24,16);gr.addColorStop(0,'rgba(255,150,50,'+(.4*fl).toFixed(3)+')');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.beginPath();g.arc(54,-24,16,0,PI2);g.fill();
    for(j=0;j<5;j++){p=((t*.02)+j*.2)%1;g.fillStyle='rgba(255,200,90,'+(1-p).toFixed(2)+')';g.beginPath();g.arc(31+Math.sin(j*3+t*.05)*7,-32-p*38,1.1,0,PI2);g.fill()}
  }else if(i===2){
    var gr2=g.createRadialGradient(54,-33,1,54,-33,22);gr2.addColorStop(0,'rgba(140,255,170,'+(.42*gl).toFixed(3)+')');gr2.addColorStop(1,'rgba(100,255,160,0)');g.fillStyle=gr2;g.beginPath();g.arc(54,-33,22,0,PI2);g.fill();
    gr2=g.createRadialGradient(0,-86,1,0,-86,15);gr2.addColorStop(0,'rgba(255,240,170,'+(.3+.15*gl).toFixed(3)+')');gr2.addColorStop(1,'rgba(255,230,150,0)');g.fillStyle=gr2;g.beginPath();g.arc(0,-86,15,0,PI2);g.fill();
  }else if(i===3){
    var gr3=g.createRadialGradient(0,-36,1,0,-36,26);gr3.addColorStop(0,'rgba(255,110,40,'+(.3*gl).toFixed(3)+')');gr3.addColorStop(1,'rgba(255,90,30,0)');g.fillStyle=gr3;g.beginPath();g.arc(0,-36,26,0,PI2);g.fill();
    for(j=-1;j<=1;j+=2){gr3=g.createRadialGradient(j*4.5,-97,.5,j*4.5,-97,8);gr3.addColorStop(0,'rgba(255,90,40,'+(.85*gl).toFixed(3)+')');gr3.addColorStop(1,'rgba(255,60,20,0)');g.fillStyle=gr3;g.beginPath();g.arc(j*4.5,-97,8,0,PI2);g.fill()}
    for(j=0;j<7;j++){var sp=.5+rnd(j+30)*.8,sx3=((t*.35*sp+j*23)%140)-70;g.fillStyle='rgba(235,200,140,.55)';g.fillRect(sx3,-3-rnd(j+50)*9,1.5,1.5)}
  }else if(i===5){
    var g5=g.createRadialGradient(0,-28,1,0,-28,44);g5.addColorStop(0,'rgba(255,150,50,'+(.5*fl).toFixed(3)+')');g5.addColorStop(1,'rgba(255,110,30,0)');g.fillStyle=g5;g.beginPath();g.arc(0,-28,44,0,PI2);g.fill();
    g5=g.createRadialGradient(0,-5,1,0,-5,18);g5.addColorStop(0,'rgba(255,170,60,'+(.45*fl).toFixed(3)+')');g5.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=g5;g.beginPath();g.arc(0,-5,18,0,PI2);g.fill();
    g5=g.createRadialGradient(25.5,-40,1,25.5,-40,16);g5.addColorStop(0,'rgba(255,225,120,'+(.3*gl).toFixed(3)+')');g5.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=g5;g.beginPath();g.arc(25.5,-40,16,0,PI2);g.fill();
    for(j=0;j<7;j++){p=((t*.024)+j*.143)%1;g.fillStyle='rgba(255,200,90,'+(1-p).toFixed(2)+')';g.beginPath();g.arc(Math.sin(j*2.3+t*.04)*9+(j%2?1:-1)*p*14,-26-p*34,1.1,0,PI2);g.fill()}
    for(j=0;j<4;j++){p=((t*.012)+j*.25)%1;g.fillStyle='rgba(255,140,40,'+(.9*(1-p)).toFixed(2)+')';g.beginPath();g.arc(Math.sin(j*3+t*.03)*5,-136-p*30,1.2,0,PI2);g.fill()}
  }
  g.restore();
  if(i===5){var sm=[[0,-138],[-38,-120],[38,-120]];for(m=0;m<sm.length;m++)for(j=0;j<3;j++){p=((t*.004)+j/3+m*.2)%1;g.fillStyle='rgba(60,56,70,'+(.4*(1-p)).toFixed(3)+')';g.beginPath();g.ellipse(sm[m][0]+Math.sin(t*.02+j*1.7+m)*5+p*12,sm[m][1]-p*46,4+p*10,3+p*8,0,0,PI2);g.fill()}}
  if(i===1||i===2){for(j=0;j<4;j++){p=((t*.004)+j*.25)%1;var sx2=i===1?41:54,sy2=i===1?-132:-40;
    g.fillStyle=i===1?'rgba(205,210,230,'+(.34*(1-p)).toFixed(3)+')':'rgba(190,240,210,'+(.3*(1-p)).toFixed(3)+')';
    g.beginPath();g.ellipse(sx2+Math.sin(t*.02+j*1.7)*5+p*(i===1?14:3),sy2-p*(i===1?44:30),3.5+p*8,2.8+p*6,0,0,PI2);g.fill()}}}
function houseFx(i,H_,t){
  if(lite())return;
  g.save();g.globalCompositeOperation='lighter';
  for(var m=0;m<4;m++){var p2=((t*.006)+m*.25+i*.13)%1;g.fillStyle='rgba(180,210,255,'+(.26*(1-p2))+')';g.beginPath();g.arc(Math.sin(t*.03+m*2+i)*12+(m-1.5)*9,-146-p2*38,5+p2*7,0,PI2);g.fill()}
  g.restore()}
function lockFx(t){
  g.fillStyle='rgba(10,14,34,.34)';g.fillRect(-50,-72,100,66);
  g.save();g.strokeStyle='#9aa3b8';g.lineWidth=3.2;g.setLineDash([6,3]);
  g.beginPath();g.moveTo(-48,-66);g.lineTo(48,-12);g.moveTo(48,-66);g.lineTo(-48,-12);g.stroke();
  g.setLineDash([]);g.strokeStyle='#5a6176';g.lineWidth=1;g.beginPath();g.moveTo(-48,-66);g.lineTo(48,-12);g.moveTo(48,-66);g.lineTo(-48,-12);g.stroke();g.restore();
  var sw=Math.sin(t*.05)*1.2;
  g.fillStyle='#d9b04a';g.fillRect(-9,-44+sw,18,15);g.strokeStyle='#d9b04a';g.lineWidth=3;g.beginPath();g.arc(0,-45+sw,6,Math.PI,0);g.stroke();
  g.fillStyle='#5a3f10';g.beginPath();g.arc(0,-38+sw,2.2,0,PI2);g.fill();g.fillRect(-.8,-38+sw,1.6,5);
  g.fillStyle='#b01f1a';g.fillRect(-14,-62,28,9);g.fillStyle='#ffd8c8';g.font='bold 8px '+FONT;g.textAlign='center';g.fillText('封',0,-55)}
function house(i,t){
  var H_=HOUSES[i],k=bww()/120;
  g.save();g.translate(bx(i)*s,GY);g.scale(s*k,s*k);
  g.drawImage(spriteOf(i),-SX,-SY,SW,SH);
  try{houseDyn(i,t)}catch(e){}
  if((styleOf(H_)===1||styleOf(H_)===2)&&typeof ln==='function'){try{ln(-54,-50,.8,t);ln(54,-50,.8,t)}catch(e){}}
  houseFx(i,H_,t);if(typeof H_.open!=='function'||H_.locked)lockFx(t);
  g.restore()}
/* ===== hết Fix389 ===== */

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
  var py=y-r-14*s+Math.sin(t*.1)*2;if(py<20*s+8)py=y+r+22*s;/* Fix400: màn thấp thì để tên cổng dưới cổng, không bị cắt mép trên */
  plate(x,py,'🏘 Về Làng Tân Thủ','chạm để quay về','#d9ffe9','#b8ffe0')}

/* ---------- cảnh Làng Tân Thủ 3 ---------- */
function scene(t){
  ensureBG();g.drawImage(BGC,0,0,W,H);skyFx(t);
  var i,Wd=W,gy=GY;
  /* mây trôi */
  g.save();for(i=0;i<4;i++){var cx=((t*(.12+rnd(i)*.1)+rnd(i+3)*(Wd+420))%(Wd+420))-210,cy=gy*(.14+.1*i);
    g.fillStyle='rgba(255,236,214,'+(.30+.08*(i%2))+')';
    for(var k=0;k<5;k++){g.beginPath();g.ellipse(cx+(k-2)*26*s,cy+Math.sin(k*1.7)*5*s,(30+rnd(i*9+k)*16)*s,(11+rnd(i*5+k)*5)*s,0,0,PI2);g.fill()}}g.restore();
  /* nhà */
  for(i=0;i<5;i++)house(i,t);
  /* ánh đèn đá */
  var L=lampXs();g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<L.length;i++){var lx=L[i]*s,ly=gy+10*s-30*s,gp=.7+.3*Math.sin(t*.07+i*2.1),q=g.createRadialGradient(lx,ly,1,lx,ly,34*s);q.addColorStop(0,'rgba(255,214,130,'+(.55*gp)+')');q.addColorStop(1,'rgba(255,190,100,0)');g.fillStyle=q;g.beginPath();g.arc(lx,ly,34*s,0,PI2);g.fill()}
  g.restore();
  backDraw(t);
  /* tuyết rơi */
  if(!lite()){g.save();var yM=gy+(H-gy)*.8;for(i=0;i<40;i++){
    var sp=.5+rnd(i+20)*.7,lxp=((rnd(i)*Wd+t*.3*sp+Math.sin(t*.02+i)*26)%(Wd+40))-20,lyp=((rnd(i+50)*yM+t*.55*sp)%yM);
    g.fillStyle=i%3?'#ffffff':'#d6e8ff';g.globalAlpha=.9;g.beginPath();g.arc(lxp,lyp,2.6*s,0,PI2);g.fill()}g.restore()}
  /* điểm chạm đi tới */
  if(vt!=null){var a=(fr%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s+(window.VDY?VDY.dy():0),(10+a*22)*s,(4+a*8)*s,0,0,PI2);g.stroke()}
  /* thú + nhân vật */
  drawEP();hero();nameTag();
  /* nhãn nhà vẽ SAU người chơi để luôn đọc được */
  for(i=0;i<5;i++)label(i,t);
  /* chữ hướng dẫn + trạng thái online */
  var fs=Math.max(12,14*s),ty=gy+(H-gy)*.55,cx2=(window.VWD&&VWD.cx)?VWD.cx():W/2;
  g.save();g.font='bold '+fs+'px '+FONT;g.textAlign='center';
  var tx='❄ Làng Tân Thủ 3 · chạm để đi · bản 400',tw=g.measureText(tx).width;
  g.fillStyle='#000b';g.fillRect(cx2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#d6ecff';g.fillText(tx,cx2,ty);
  var nLk=HOUSES.filter(function(h){return typeof h.open!=='function'||h.locked}).length,on2=nLk?'🔒 '+nLk+' nhà đang tạm khoá':'';
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
  if(on){try{scene(t)}catch(e){try{console.warn('[Lang 3] vẽ lỗi, về Làng 1',e)}catch(x){}on=false;go=null;vt=null;try{P.x=cl(GATE_X(),40,vw()-40)}catch(y){}}flashFx();if(on)return}
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
      var bd=1e9;for(var i=0;i<5;i++){var dx=Math.abs(x-bx(i));if(dx<bww()/2+12&&dx<bd&&py>GY-170*k*s&&py<GY+50*s){bd=dx;hit=i}}
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
