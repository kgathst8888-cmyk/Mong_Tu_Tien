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
 * Fix318: vẽ lại nền — trời hoàng hôn/đêm (Nhật Nguyệt đồng huy, cực quang, sao băng), 4 tầng núi tuyết + Kiếm Phong + Thiên Cung + thác, 3 đảo nổi, đàn hạc, đèn trời, đom đóm, tường ngói, tre/đào/ngân hạnh, đường lát bát quái.
 * Fix319: 5 nhà viết lại kiến trúc cổ 2 tầng (bệ đá, bậc thềm, cột, dougong, mái ngói cong, lồng đèn, vật trang trí riêng từng nhà), cache canvas.
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
var GATE_X=function(){return Math.max(42,vw()*.14-Math.min(130,vw()*.16)*.85)},GATE_Y=function(){return GY-(PORT?300:235)*s},GATE_R=function(){return 34*s};
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
/* ---------- Fix318: nền & bầu trời mới (vẽ 1 lần vào canvas đệm) ---------- */
function pk(v){return 1-Math.abs(Math.sin(v))}
function mh(x,f,sd){return pk(x*f+sd)*.55+pk(x*f*2.3+sd*1.7)*.3+pk(x*f*5.1+sd*2.9)*.15}
var SUN={x:0,y:0,r:40},MOON={x:0,y:0,r:30},WF=null,ISL=[];
function pine(q,x,y,h,col){
  q.fillStyle=col;q.fillRect(x-h*.04,y-h*.2,h*.08,h*.2);
  for(var t=0;t<3;t++){var w=h*(.30-t*.07),yy=y-h*.14-t*h*.27;
    q.beginPath();q.moveTo(x-w,yy);q.lineTo(x,yy-h*.42);q.lineTo(x+w,yy);q.closePath();q.fill()}}
function blossom(q,x,gy,h,u,seed){
  q.strokeStyle='#4a2f2a';q.lineCap='round';q.lineWidth=4.5*u;q.beginPath();q.moveTo(x,gy);q.quadraticCurveTo(x-h*.1,gy-h*.35,x+h*.03,gy-h*.62);q.stroke();
  q.lineWidth=2.4*u;q.beginPath();q.moveTo(x+h*.01,gy-h*.45);q.quadraticCurveTo(x+h*.2,gy-h*.55,x+h*.3,gy-h*.8);q.moveTo(x-h*.02,gy-h*.52);q.quadraticCurveTo(x-h*.22,gy-h*.62,x-h*.28,gy-h*.82);q.stroke();q.lineCap='butt';
  var cols=['#ffb3c7','#ff93b0','#ffd0dc','#f77fa0'];
  for(var i=0;i<26;i++){var a=rnd(seed+i)*PI2,r=rnd(seed+i+40)*h*.4,cx=x+Math.cos(a)*r*1.25,cy=gy-h*.78+Math.sin(a)*r*.75;
    q.fillStyle=cols[i%4];q.globalAlpha=.88;q.beginPath();q.arc(cx,cy,h*.07+rnd(seed+i+80)*h*.06,0,PI2);q.fill()}
  q.globalAlpha=1}
function bamboo(q,x,gy,u,seed){
  q.lineCap='round';
  for(var i=0;i<6;i++){var bx2=x+(i-2.5)*5*u+rnd(seed+i)*3*u,h=(60+rnd(seed+i+9)*40)*u,lean=(rnd(seed+i+3)-.5)*8*u,k;
    q.strokeStyle=i%2?'#5f9a4c':'#78b35a';q.lineWidth=2.6*u;q.beginPath();q.moveTo(bx2,gy);q.lineTo(bx2+lean,gy-h);q.stroke();
    q.strokeStyle='#3d6e36';q.lineWidth=1*u;
    for(k=1;k<6;k++){var yk=gy-h*k/6,xk=bx2+lean*k/6;q.beginPath();q.moveTo(xk-1.6*u,yk);q.lineTo(xk+1.6*u,yk);q.stroke()}
    q.fillStyle=i%2?'#5aa04a':'#7cc060';
    for(k=0;k<4;k++){var ly=gy-h*(.55+.12*k),lx=bx2+lean*(.55+.12*k),dir=k%2?1:-1;q.beginPath();q.ellipse(lx+dir*8*u,ly-2*u,9*u,2.2*u,-dir*.5,0,PI2);q.fill()}}
  q.lineCap='butt'}
function hut(q,x,y,z,col){
  q.fillStyle='rgba(60,40,70,.85)';q.fillRect(x-7*z,y-8*z,14*z,8*z);
  q.fillStyle=col;q.beginPath();q.moveTo(x-10*z,y-8*z);q.lineTo(x,y-17*z);q.lineTo(x+10*z,y-8*z);q.closePath();q.fill();
  q.fillStyle='rgba(255,214,120,.95)';q.fillRect(x-2*z,y-6*z,4*z,4*z)}
function mist(q,Wd,y,hh,col,seed){
  var gr=q.createLinearGradient(0,y-hh,0,y+hh);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.5,'rgba('+col+',.34)');gr.addColorStop(1,'rgba('+col+',0)');
  q.fillStyle=gr;q.fillRect(0,y-hh,Wd,hh*2);
  for(var i=0;i<9;i++){q.fillStyle='rgba('+col+',.12)';q.beginPath();q.ellipse(rnd(seed+i)*Wd,y+(rnd(seed+i+20)-.5)*hh*.8,(70+rnd(seed+i+40)*90),hh*.32,0,0,PI2);q.fill()}}
function mountain(q,Wd,o){
  var f=o.cnt*3.1416/Wd,pts=[],n=Math.ceil(Wd/5)+2,i,j,k,x,y,gr;
  for(i=0;i<=n;i++){x=i*5;pts.push([x,o.base-o.amp*mh(x,f,o.seed)])}
  q.beginPath();q.moveTo(-5,o.base+o.amp*3);
  for(i=0;i<=n;i++)q.lineTo(pts[i][0],pts[i][1]);
  q.lineTo(pts[n][0]+5,o.base+o.amp*3);q.closePath();
  gr=q.createLinearGradient(0,o.base-o.amp,0,o.base+o.amp*.5);gr.addColorStop(0,o.top);gr.addColorStop(1,o.bot);
  q.fillStyle=gr;q.fill();
  q.save();q.clip();
  if(o.snow){var sy=o.base-o.amp*o.snow;
    q.fillStyle='rgba(248,242,255,.9)';q.beginPath();q.moveTo(-5,o.base-o.amp-10);
    for(x=-5;x<=Wd+10;x+=6)q.lineTo(x,sy+Math.sin(x*.21)*o.amp*.025+Math.sin(x*.07+o.seed)*o.amp*.04+mh(x,f*7,1.3)*o.amp*.07);
    q.lineTo(Wd+10,o.base-o.amp-10);q.closePath();q.fill()}
  var pks=[];
  for(i=1;i<n;i++)if(pts[i][1]<pts[i-1][1]&&pts[i][1]<=pts[i+1][1]&&o.base-pts[i][1]>o.amp*.34)pks.push(i);
  for(k=0;k<pks.length;k++){i=pks[k];j=i;while(j>0&&pts[j-1][1]>=pts[j][1])j--;
    q.fillStyle=o.shade;q.beginPath();q.moveTo(pts[i][0],pts[i][1]);
    for(x=i-1;x>=j;x--)q.lineTo(pts[x][0],pts[x][1]);
    q.lineTo(pts[j][0],o.base+o.amp);q.lineTo(pts[i][0],o.base+o.amp);q.closePath();q.fill();
    q.strokeStyle=o.spine;q.lineWidth=1;
    for(x=0;x<3;x++){q.beginPath();q.moveTo(pts[i][0]-x*2,pts[i][1]+x*3);q.lineTo(pts[i][0]-(10+x*9),pts[i][1]+(o.base-pts[i][1])*(.4+.13*x));q.stroke()}}
  q.restore();
  q.strokeStyle=o.rim;q.lineWidth=1.3;q.beginPath();
  for(i=0;i<n;i++)if(pts[i+1][1]>pts[i][1]){q.moveTo(pts[i][0],pts[i][1]);q.lineTo(pts[i+1][0],pts[i+1][1])}
  q.stroke();
  if(o.pines){
    q.fillStyle=o.pines;
    for(x=6;x<Wd;x+=7+rnd(x)*9){i=Math.min(n,Math.round(x/5));
      y=Math.max(pts[i][1],o.base-o.amp*o.tl)+rnd(x+3)*o.amp*.3;
      if(y<o.base+o.amp*.15)pine(q,x,y,o.ph*(.7+rnd(x+9)*.6),o.pines)}}
  return pts}
function peaksOf(pts){
  var hi=[],i;for(i=1;i<pts.length-1;i++)if(pts[i][1]<pts[i-1][1]&&pts[i][1]<=pts[i+1][1])hi.push(i);
  hi.sort(function(a,b){return pts[a][1]-pts[b][1]});return hi}
function giantSword(q,x,y,u){
  var gr;
  q.save();q.globalCompositeOperation='lighter';
  gr=q.createRadialGradient(x,y-52*u,2,x,y-52*u,70*u);gr.addColorStop(0,'rgba(150,230,255,.42)');gr.addColorStop(1,'rgba(150,230,255,0)');
  q.fillStyle=gr;q.beginPath();q.arc(x,y-52*u,70*u,0,PI2);q.fill();q.restore();
  gr=q.createLinearGradient(x-5*u,0,x+5*u,0);gr.addColorStop(0,'#f2f7ff');gr.addColorStop(.5,'#c4d6f4');gr.addColorStop(1,'#8aa0cc');
  q.fillStyle=gr;q.beginPath();q.moveTo(x-5*u,y-76*u);q.lineTo(x+5*u,y-76*u);q.lineTo(x+3*u,y-2*u);q.lineTo(x-3*u,y-2*u);q.closePath();q.fill();
  q.strokeStyle='rgba(90,110,160,.7)';q.lineWidth=1*u;q.beginPath();q.moveTo(x,y-74*u);q.lineTo(x,y-6*u);q.stroke();
  q.fillStyle='#d9b04a';q.beginPath();q.moveTo(x-16*u,y-77*u);q.quadraticCurveTo(x,y-70*u,x+16*u,y-77*u);q.lineTo(x+14*u,y-83*u);q.quadraticCurveTo(x,y-77*u,x-14*u,y-83*u);q.closePath();q.fill();
  q.fillStyle='#8a1f1a';q.fillRect(x-2.2*u,y-100*u,4.4*u,17*u);
  q.fillStyle='#e8c25a';q.beginPath();q.arc(x,y-103*u,3.6*u,0,PI2);q.fill();
  q.fillStyle='rgba(255,236,150,.9)';q.fillRect(x-1*u,y-66*u,2*u,5*u);q.fillRect(x-1*u,y-52*u,2*u,5*u);q.fillRect(x-1*u,y-38*u,2*u,5*u)}
function wall(q,Wd,gy,u){
  var wy=gy-30*u,i,x,j,gr;
  gr=q.createLinearGradient(0,wy,0,gy+3*u);gr.addColorStop(0,'#f6ebd0');gr.addColorStop(1,'#d8c9a4');q.fillStyle=gr;q.fillRect(0,wy,Wd,33*u);
  q.fillStyle='#6a6070';q.fillRect(0,gy-5*u,Wd,8*u);q.fillStyle='#8a8090';q.fillRect(0,gy-5*u,Wd,2*u);
  q.fillStyle='#39405c';q.fillRect(0,wy-7*u,Wd,8*u);
  q.fillStyle='#4b5578';for(x=0;x<Wd;x+=9*u){q.beginPath();q.arc(x+4.5*u,wy+1*u,4.6*u,0,3.1416);q.fill()}
  q.fillStyle='#2b3048';q.fillRect(0,wy-8*u,Wd,2*u);
  for(x=0;x<Wd;x+=90*u){
    q.fillStyle='#a8322a';q.fillRect(x,wy+1*u,5*u,26*u);
    var cx=x+47*u,cy=wy+14*u;
    q.strokeStyle='#a8322a';q.lineWidth=2.2*u;q.fillStyle='rgba(255,214,130,.55)';q.beginPath();q.arc(cx,cy,8.5*u,0,PI2);q.fill();q.stroke();
    q.lineWidth=1*u;q.beginPath();for(j=0;j<3;j++){var a=j*1.0472;q.moveTo(cx-Math.cos(a)*8.5*u,cy-Math.sin(a)*8.5*u);q.lineTo(cx+Math.cos(a)*8.5*u,cy+Math.sin(a)*8.5*u)}q.stroke()}}
function taiji(q,x,y,r){
  q.save();q.strokeStyle='#7b6e50';q.fillStyle='#7b6e50';q.globalAlpha=.4;q.lineWidth=1.6;
  q.beginPath();q.arc(x,y,r,0,PI2);q.stroke();q.beginPath();q.arc(x,y,r*.78,0,PI2);q.stroke();
  for(var i=0;i<8;i++){var a=i*.7854+.39;q.beginPath();q.moveTo(x+Math.cos(a)*r*1.08,y+Math.sin(a)*r*1.08);q.lineTo(x+Math.cos(a)*r*1.34,y+Math.sin(a)*r*1.34);q.stroke()}
  var R=r*.6;q.beginPath();q.arc(x,y,R,-1.5708,1.5708,false);q.arc(x,y+R/2,R/2,1.5708,-1.5708,true);q.arc(x,y-R/2,R/2,1.5708,4.7124,false);q.fill();
  q.beginPath();q.arc(x,y-R/2,R*.12,0,PI2);q.fill();q.globalAlpha=.7;q.fillStyle='#d9ccaa';q.beginPath();q.arc(x,y+R/2,R*.12,0,PI2);q.fill();q.restore()}
function diamond(q,x,y,w,h,col){q.fillStyle=col;q.beginPath();q.moveTo(x,y-h);q.lineTo(x+w,y);q.lineTo(x,y+h*.6);q.lineTo(x-w,y);q.closePath();q.fill()}
function makeIsland(w,h,tp,kind,seed,u){
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w*u*DPR));cv.height=Math.max(1,Math.round(h*u*DPR));
  var q=cv.getContext('2d');q.setTransform(DPR*u,0,0,DPR*u,0,0);
  var ty=h*tp,i,gr,N=9,pts=[];
  function surf(x){var d=(x-w/2)/(w/2);return ty+1-4.5*(1-d*d)}
  gr=q.createRadialGradient(w/2,ty+h*.18,4,w/2,ty+h*.18,w*.5);gr.addColorStop(0,'rgba(190,170,255,.28)');gr.addColorStop(1,'rgba(190,170,255,0)');q.fillStyle=gr;q.fillRect(0,0,w,h);
  for(i=0;i<=N;i++){var tt=i/N,dep=(h-ty-6)*(1-Math.pow(Math.abs(tt*2-1),1.5))*(i%2?.8:1)*(.82+rnd(seed+i)*.18);pts.push([w*(.03+.94*tt),ty+3+dep])}
  gr=q.createLinearGradient(0,ty,0,h);gr.addColorStop(0,'#94767a');gr.addColorStop(.5,'#5a4660');gr.addColorStop(1,'#2e2442');
  q.fillStyle=gr;q.beginPath();q.moveTo(w*.03,ty);for(i=0;i<=N;i++)q.lineTo(pts[i][0],pts[i][1]);q.lineTo(w*.97,ty);q.closePath();q.fill();
  q.strokeStyle='rgba(20,10,30,.35)';q.lineWidth=1;for(i=1;i<N;i++){q.beginPath();q.moveTo(pts[i][0],ty+4);q.lineTo(pts[i][0],pts[i][1]);q.stroke()}
  q.fillStyle='rgba(255,210,170,.16)';q.beginPath();q.moveTo(w*.62,ty);for(i=6;i<=N;i++)q.lineTo(pts[i][0],pts[i][1]);q.lineTo(w*.97,ty);q.closePath();q.fill();
  q.strokeStyle='#4a3a2a';q.lineWidth=1.3;for(i=0;i<5;i++){var rx=w*(.15+.17*i),ry=ty+4;q.beginPath();q.moveTo(rx,ry);q.quadraticCurveTo(rx+(i%2?4:-4),ry+8,rx+(i%2?2:-2),ry+10+rnd(seed+i+30)*12);q.stroke()}
  diamond(q,w*.5,pts[4][1]-6,3.4,8,'rgba(140,235,255,.95)');diamond(q,w*.36,pts[3][1]-3,2.4,5.5,'rgba(190,160,255,.95)');diamond(q,w*.64,pts[5][1]-3,2.4,5.5,'rgba(255,200,140,.95)');
  gr=q.createLinearGradient(0,ty-6,0,ty+8);gr.addColorStop(0,'#a6d86c');gr.addColorStop(1,'#4d8a46');
  q.fillStyle=gr;q.beginPath();q.moveTo(0,ty+2);q.quadraticCurveTo(w*.5,ty-9,w,ty+2);q.quadraticCurveTo(w*.5,ty+13,0,ty+2);q.fill();
  q.strokeStyle='rgba(235,255,200,.5)';q.lineWidth=1;q.beginPath();q.moveTo(w*.06,ty);q.quadraticCurveTo(w*.5,ty-9,w*.94,ty);q.stroke();
  if(kind==='palace'){
    q.fillStyle='#bfb49c';for(i=0;i<4;i++)q.fillRect(w*.5-(16-i*3),surf(w*.5)-1-i*2.2,(16-i*3)*2,2.4);
    tower(q,w*.5,surf(w*.5)-8,.78,'#8e2f3a');
    q.fillStyle='rgba(255,226,140,.95)';for(i=0;i<4;i++)q.fillRect(w*.5-2.6,surf(w*.5)-8-i*13.2-8.5,5.2,5);
    q.fillStyle='#e8c25a';q.beginPath();q.arc(w*.5,surf(w*.5)-8-5*13.3-13,2.4,0,PI2);q.fill();
    ginkgo(q,w*.18,surf(w*.18),34,1,seed+3);blossom(q,w*.82,surf(w*.82),34,1,seed+5);pine(q,w*.3,surf(w*.3),26,'#3f7a52');pine(q,w*.7,surf(w*.7),22,'#3f7a52');
  }else if(kind==='pavilion'){
    var px=w*.5,py=surf(px);
    q.fillStyle='#b9ae96';q.fillRect(px-26,py-3,52,4);
    q.fillStyle='#9a3a2c';[-22,-8,8,22].forEach(function(dx){q.fillRect(px+dx-1.6,py-34,3.2,31)});
    q.fillStyle='rgba(255,214,130,.55)';q.fillRect(px-20,py-30,40,24);
    q.fillStyle='#8e2f3a';q.beginPath();q.moveTo(px-36,py-30);q.quadraticCurveTo(px-24,py-31,px,py-52);q.quadraticCurveTo(px+24,py-31,px+36,py-30);q.lineTo(px+28,py-26);q.lineTo(px-28,py-26);q.closePath();q.fill();
    q.fillStyle='#e0b84a';q.fillRect(px-28,py-27,56,2.2);q.beginPath();q.arc(px,py-54,2.2,0,PI2);q.fill();
    blossom(q,w*.16,surf(w*.16),36,1,seed+2);ginkgo(q,w*.86,surf(w*.86),30,1,seed+7);
  }else{
    lanternBody(q,w*.3,surf(w*.3),.8);
    blossom(q,w*.64,surf(w*.64),38,1,seed+4);pine(q,w*.84,surf(w*.84),24,'#3f7a52');
    diamond(q,w*.46,surf(w*.46)-5,3,8,'rgba(140,235,255,.95)');diamond(q,w*.52,surf(w*.52)-3,2,5,'rgba(255,200,140,.95)')}
  return {cv:cv,wx:w*.84,wy:ty+3}}
function paintBG(q,Wd,Ht,gy,u){
  var i,x,y,gr,pts,hi,t;
  /* ===== bầu trời hoàng hôn · đêm ===== */
  gr=q.createLinearGradient(0,0,0,gy);
  gr.addColorStop(0,'#0b1538');gr.addColorStop(.2,'#1f2f6e');gr.addColorStop(.42,'#5c4f98');gr.addColorStop(.6,'#c9728f');gr.addColorStop(.78,'#f59f6e');gr.addColorStop(1,'#ffd9a0');
  q.fillStyle=gr;q.fillRect(0,0,Wd,Ht);
  for(i=0;i<90;i++){q.globalAlpha=.15+.6*rnd(i*3+3);q.fillStyle=i%7?'#fff':'#bfe0ff';var r_=rnd(i*3+9)>.9?1.8:1.2;q.fillRect(rnd(i*3+1)*Wd,Math.pow(rnd(i*3+2),1.4)*gy*.5,r_,r_)}q.globalAlpha=1;
  q.save();q.globalCompositeOperation='lighter';
  for(i=0;i<3;i++){var ay=gy*(.14+.07*i),ac=['90,255,210','150,120,255','90,190,255'][i];
    gr=q.createLinearGradient(0,ay-gy*.12,0,ay+gy*.1);gr.addColorStop(0,'rgba('+ac+',0)');gr.addColorStop(.5,'rgba('+ac+',.09)');gr.addColorStop(1,'rgba('+ac+',0)');
    q.fillStyle=gr;q.beginPath();q.moveTo(0,ay+gy*.1);
    for(x=0;x<=Wd;x+=10)q.lineTo(x,ay+Math.sin(x*.004+i*2.1)*gy*.05+Math.sin(x*.011+i)*gy*.02);
    for(x=Wd;x>=0;x-=10)q.lineTo(x,ay-gy*.12+Math.sin(x*.005+i*1.3)*gy*.04);
    q.closePath();q.fill()}
  q.restore();
  /* trăng (Nhật Nguyệt đồng huy) */
  var mr=Math.min(30*u,Wd*.07),mx=Wd*.3,my=gy*.2;MOON.x=mx;MOON.y=my;MOON.r=mr;
  gr=q.createRadialGradient(mx,my,mr*.6,mx,my,mr*3.2);gr.addColorStop(0,'rgba(200,215,255,.45)');gr.addColorStop(1,'rgba(200,215,255,0)');q.fillStyle=gr;q.beginPath();q.arc(mx,my,mr*3.2,0,PI2);q.fill();
  gr=q.createRadialGradient(mx-mr*.3,my-mr*.3,mr*.1,mx,my,mr);gr.addColorStop(0,'#fffdf4');gr.addColorStop(1,'#d9defa');q.fillStyle=gr;q.beginPath();q.arc(mx,my,mr,0,PI2);q.fill();
  q.fillStyle='rgba(150,155,200,.35)';[[.3,-.2,.2],[-.35,.25,.26],[.1,.4,.13],[-.1,-.4,.1]].forEach(function(c_){q.beginPath();q.arc(mx+c_[0]*mr,my+c_[1]*mr,c_[2]*mr,0,PI2);q.fill()});
  /* mặt trời lặn trong thung lũng dãy núi xa */
  var F={base:gy*.64,amp:gy*.40,cnt:2.3,seed:1.7},f0=F.cnt*3.1416/Wd,bx_=Wd*.7,by_=-1;
  for(x=Wd*.55;x<=Wd*.9;x+=5){var yy=F.base-F.amp*mh(x,f0,F.seed);if(yy>by_){by_=yy;bx_=x}}
  var sr=Math.min(42*u,Wd*.1);SUN.x=bx_;SUN.y=by_-sr*.25;SUN.r=sr;
  gr=q.createRadialGradient(SUN.x,SUN.y,sr*.3,SUN.x,SUN.y,sr*5);gr.addColorStop(0,'rgba(255,238,180,.7)');gr.addColorStop(.3,'rgba(255,196,130,.26)');gr.addColorStop(1,'rgba(255,190,120,0)');
  q.fillStyle=gr;q.beginPath();q.arc(SUN.x,SUN.y,sr*5,0,PI2);q.fill();
  gr=q.createRadialGradient(SUN.x,SUN.y,sr*.2,SUN.x,SUN.y,sr);gr.addColorStop(0,'#fffbe0');gr.addColorStop(1,'#ffdf8f');q.fillStyle=gr;q.beginPath();q.arc(SUN.x,SUN.y,sr,0,PI2);q.fill();
  /* dải mây hồng ngang chân trời */
  for(i=0;i<7;i++){q.fillStyle='rgba(255,170,160,'+(.12+.06*(i%3))+')';q.beginPath();q.ellipse(rnd(i+200)*Wd,gy*(.5+.07*i),(120+rnd(i+210)*180)*u,(4+rnd(i+220)*5)*u,0,0,PI2);q.fill()}
  /* ===== núi non 4 tầng ===== */
  pts=mountain(q,Wd,{base:F.base,amp:F.amp,cnt:F.cnt,seed:F.seed,top:'rgb(150,136,206)',bot:'rgb(240,176,176)',snow:.7,shade:'rgba(60,40,120,.2)',spine:'rgba(60,40,120,.22)',rim:'rgba(255,226,190,.8)'});
  hi=peaksOf(pts);
  if(hi.length){var p1=hi[0],p2=-1;for(i=1;i<hi.length;i++)if(Math.abs(pts[hi[i]][0]-pts[p1][0])>Wd*.18){p2=hi[i];break}
    var su=Math.max(.35,Math.min(u,pts[p1][1]/118));giantSword(q,pts[p1][0],pts[p1][1]+2*u,su);
    if(p2>=0){var tx=pts[p2][0],ty2=pts[p2][1]+3*u;
      tower(q,tx,ty2,u*.55,'rgba(96,74,150,.9)');tower(q,tx-30*u,ty2+10*u,u*.32,'rgba(96,74,150,.85)');tower(q,tx+28*u,ty2+12*u,u*.3,'rgba(96,74,150,.85)');
      q.fillStyle='rgba(255,226,150,.9)';for(i=0;i<3;i++)q.fillRect(tx-1.4*u,ty2-i*9.4*u-7*u,2.8*u,3*u)}}
  mist(q,Wd,gy*.66,gy*.06,'255,214,224',11);
  pts=mountain(q,Wd,{base:gy*.76,amp:gy*.32,cnt:3.7,seed:4.4,top:'rgb(92,96,164)',bot:'rgb(214,150,170)',snow:0,shade:'rgba(30,26,80,.24)',spine:'rgba(30,26,80,.2)',rim:'rgba(255,214,170,.75)',pines:'rgba(70,72,128,.92)',tl:.5,ph:15*u});
  hi=peaksOf(pts);WF=null;
  if(hi.length){var wp=hi[0],wx_=pts[wp][0]-5*u,wy0=pts[wp][1]+gy*.05,wy1=gy*.86;
    gr=q.createLinearGradient(0,wy0,0,wy1);gr.addColorStop(0,'rgba(235,250,255,.85)');gr.addColorStop(1,'rgba(235,250,255,.15)');
    q.fillStyle=gr;q.beginPath();q.moveTo(wx_-2*u,wy0);q.lineTo(wx_+2*u,wy0);q.lineTo(wx_+4.5*u,wy1);q.lineTo(wx_-4.5*u,wy1);q.closePath();q.fill();
    q.fillStyle='rgba(90,80,140,.5)';q.fillRect(wx_-6*u,wy0+(wy1-wy0)*.35,12*u,3*u);
    WF={x:wx_,y0:wy0,y1:wy1,w:4*u}}
  mist(q,Wd,gy*.78,gy*.06,'255,208,214',31);
  pts=mountain(q,Wd,{base:gy*.88,amp:gy*.22,cnt:5.2,seed:7.1,top:'rgb(54,86,130)',bot:'rgb(138,150,160)',snow:0,shade:'rgba(10,20,60,.28)',spine:'rgba(10,20,60,.22)',rim:'rgba(255,208,160,.7)',pines:'rgba(36,74,86,.95)',tl:.45,ph:17*u});
  mist(q,Wd,gy*.89,gy*.05,'255,224,200',51);
  /* đồi gần + thôn nhỏ phía xa */
  var hb=gy*.965,ha=gy*.075,hf1=.012,hf2=.03,hs=7.7;
  ridge(q,Wd,hb,ha,'rgb(76,128,92)',hs,hf1,hf2);
  function hy(xx){var v=(Math.sin(xx*hf1+hs)*.55+Math.sin(xx*hf2+hs*2.1)*.3+Math.sin(xx*hf1*3.1+hs*3.3)*.15)*.5+.5;return hb-ha*v}
  for(i=0;i<7;i++){x=Wd*(.06+.14*i+rnd(i+300)*.05);hut(q,x,hy(x)+3*u,u*(.8+rnd(i+310)*.4),i%2?'#8e3a34':'#a24a36')}
  for(x=10;x<Wd;x+=14+rnd(x)*18){q.fillStyle=rnd(x+5)>.5?'#3f7a52':'#4d8e5a';q.beginPath();q.arc(x,hy(x)+2*u,(5+rnd(x+7)*5)*u,0,PI2);q.fill()}
  gr=q.createLinearGradient(0,gy*.7,0,gy);gr.addColorStop(0,'rgba(255,225,175,0)');gr.addColorStop(1,'rgba(255,225,175,.4)');q.fillStyle=gr;q.fillRect(0,gy*.7,Wd,gy*.3);
  /* ===== mặt đất ===== */
  gr=q.createLinearGradient(0,gy-2*u,0,gy+34*u);gr.addColorStop(0,'#8fb461');gr.addColorStop(1,'#587f4a');q.fillStyle=gr;q.fillRect(0,gy-2*u,Wd,Ht-gy+2*u);
  wall(q,Wd,gy,u);
  var tf=[.025,.215,.405,.595,.785,.975];
  for(i=0;i<tf.length;i++)bamboo(q,vw()*(tf[i]-.04)*u,gy-1*u,u,i*13+5);
  for(i=0;i<tf.length;i++){var tx2=vw()*tf[i]*u,th=(86+rnd(i+9)*26)*u;
    if(i%2)blossom(q,tx2,gy-1*u,th,u,i*17+3);else ginkgo(q,tx2,gy-1*u,th,u,i*17+3)}
  /* cỏ hoa viền đường */
  for(x=0;x<Wd;x+=11*u){var gx=x+rnd(x)*8*u;q.strokeStyle=rnd(x+2)>.5?'#6c9f4a':'#7fb255';q.lineWidth=1.2*u;q.beginPath();q.moveTo(gx,gy+14*u);q.lineTo(gx-2*u,gy+8*u);q.moveTo(gx+2*u,gy+14*u);q.lineTo(gx+3*u,gy+7*u);q.stroke();
    if(rnd(x+4)>.72){q.fillStyle=['#ffd5e0','#fff1a8','#ffffff','#d6c4ff'][Math.floor(rnd(x+8)*4)];q.beginPath();q.arc(gx+1*u,gy+7*u,1.8*u,0,PI2);q.fill()}}
  /* đường lát đá */
  var ry=gy+16*u,rh=Math.max(34*u,(Ht-gy)*.82),yb=ry+rh;
  q.fillStyle='#6f6552';q.fillRect(0,ry-3*u,Wd,3*u);
  gr=q.createLinearGradient(0,ry,0,yb);gr.addColorStop(0,'#d3c7a8');gr.addColorStop(1,'#b3a687');q.fillStyle=gr;q.fillRect(0,ry,Wd,rh);
  q.strokeStyle='rgba(95,84,62,.35)';q.lineWidth=1.2;
  var rows=Math.max(2,Math.round(rh/(20*u)));
  for(i=1;i<rows;i++){var yy2=ry+rh*i/rows;q.beginPath();q.moveTo(0,yy2);q.lineTo(Wd,yy2);q.stroke()}
  for(i=0;i<rows;i++){var y0=ry+rh*i/rows,y1=ry+rh*(i+1)/rows;for(x=(i%2?26:0)*u;x<Wd;x+=52*u){q.beginPath();q.moveTo(x,y0);q.lineTo(x,y1);q.stroke()}}
  for(i=0;i<34;i++){q.fillStyle='rgba(88,140,84,'+(.1+.1*rnd(i+400))+')';q.beginPath();q.ellipse(rnd(i+401)*Wd,ry+rnd(i+402)*rh,(8+rnd(i+403)*14)*u,(2+rnd(i+404)*3)*u,0,0,PI2);q.fill()}
  for(x=210*u;x<Wd;x+=420*u)taiji(q,x,ry+rh*.5,Math.min(rh*.36,28*u));
  for(i=0;i<30;i++){q.fillStyle='rgba(255,170,190,.6)';q.beginPath();q.ellipse(rnd(i+500)*Wd,ry+rnd(i+501)*rh,2.4*u,1.2*u,rnd(i+502)*3,0,PI2);q.fill()}
  q.fillStyle='rgba(60,50,35,.3)';q.fillRect(0,yb-3*u,Wd,3*u);
  q.strokeStyle='rgba(95,84,62,.45)';q.lineWidth=1.3;for(x=0;x<Wd;x+=16*u){q.beginPath();q.arc(x+8*u,yb-3*u,7*u,3.1416,6.2832);q.stroke()}
  var L=lampXs();for(i=0;i<L.length;i++)lanternBody(q,L[i]*u,gy+10*u,u)}
function ensureBG(){
  var u=s,k=[W,H,Math.round(GY),u.toFixed(3),DPR,vw()|0].join('|');
  if(k===BGK&&BGC)return;BGK=k;
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(W*DPR));cv.height=Math.max(1,Math.round(H*DPR));
  var q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);
  try{paintBG(q,W,H,GY,u)}catch(e){try{console.warn('[Lang 2] bg',e)}catch(x){}}
  BGC=cv;ISL=[];
  try{
    var defs=[{fx:.1,fy:.17,w:130,h:120,tp:.52,kind:'pavilion',sd:11},{fx:.88,fy:.09,w:140,h:150,tp:.58,kind:'palace',sd:23},{fx:.64,fy:.27,w:92,h:92,tp:.5,kind:'garden',sd:37}];
    for(var i=0;i<defs.length;i++){var d=defs[i],ui=Math.min(u,GY*.34/d.h,W*.26/d.w),o=makeIsland(d.w,d.h,d.tp,d.kind,d.sd,ui);
      o.ui=ui;o.pw=d.w*ui;o.ph=d.h*ui;o.x=d.fx*W-o.pw/2;o.y=GY*d.fy;ISL.push(o)}
  }catch(e){ISL=[];try{console.warn('[Lang 2] đảo',e)}catch(x){}}}
/* ---------- Fix318: hiệu ứng động (bầu trời · đảo nổi · thác · hạc · đèn trời · đom đóm) ---------- */
function wfall(x,y0,len,t,w){
  var gr=g.createLinearGradient(0,y0,0,y0+len);gr.addColorStop(0,'rgba(225,246,255,.8)');gr.addColorStop(1,'rgba(225,246,255,0)');
  g.fillStyle=gr;g.fillRect(x-w/2,y0,w,len);
  g.save();g.globalCompositeOperation='lighter';
  for(var j=0;j<5;j++){var p=((t*.018+j*.2)%1);g.fillStyle='rgba(255,255,255,'+(.55*(1-p))+')';g.fillRect(x-w*.35,y0+p*len,w*.7,Math.max(3,len*.08))}
  g.restore()}
function crane(x,y,z,ph){
  var fl=Math.sin(ph)*.9;
  g.strokeStyle='rgba(255,247,238,.95)';g.lineWidth=Math.max(1.2,1.5*z);g.lineCap='round';
  g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-7*z,y-(5+6*fl)*z,x-15*z,y-(1+9*fl)*z);g.moveTo(x,y);g.quadraticCurveTo(x+7*z,y-(5+6*fl)*z,x+15*z,y-(1+9*fl)*z);
  g.moveTo(x-3*z,y+.5*z);g.lineTo(x-9*z,y+2*z);g.moveTo(x+3*z,y+1*z);g.lineTo(x+11*z,y+2.5*z);g.stroke();g.lineCap='butt';
  g.fillStyle='#fff6ec';g.beginPath();g.ellipse(x,y+.5*z,4*z,1.5*z,0,0,PI2);g.fill()}
function skyFx(t){
  var Wd=W,gy=GY,i,k;
  g.save();g.beginPath();g.rect(0,0,Wd,gy+4);g.clip();
  /* tia nắng từ mặt trời */
  if(!lite()){g.globalCompositeOperation='lighter';
    for(i=0;i<8;i++){var a=-2.9+i*.36+Math.sin(t*.004+i)*.05,R=Math.max(Wd,gy)*1.3,al=.035*(.55+.45*Math.sin(t*.02+i*1.7));
      g.fillStyle='rgba(255,214,150,'+al+')';g.beginPath();g.moveTo(SUN.x,SUN.y);g.lineTo(SUN.x+Math.cos(a-.05)*R,SUN.y+Math.sin(a-.05)*R);g.lineTo(SUN.x+Math.cos(a+.05)*R,SUN.y+Math.sin(a+.05)*R);g.closePath();g.fill()}
    g.globalCompositeOperation='source-over'}
  /* sao nhấp nháy + sao băng */
  g.globalCompositeOperation='lighter';
  for(i=0;i<22;i++){var sx=rnd(i*5+101)*Wd,sy=rnd(i*5+102)*gy*.42,tw=.5+.5*Math.sin(t*.06+i*1.9),rr=(1+1.4*tw)*s;
    g.fillStyle='rgba(255,255,255,'+(.25+.6*tw)+')';g.fillRect(sx-rr,sy-.5,rr*2,1);g.fillRect(sx-.5,sy-rr,1,rr*2)}
  var cyc=900,ph=(t%cyc)/cyc,sd=Math.floor(t/cyc);
  if(ph<.05){var p=ph/.05,x0=Wd*(.25+rnd(sd+5)*.6),y0=gy*(.04+rnd(sd+9)*.16),dx=-170*s,dy=70*s,al2=Math.sin(p*3.1416);
    for(k=0;k<9;k++){var pp=Math.max(0,p-k*.03);g.fillStyle='rgba(255,246,220,'+(al2*(1-k/9)*.9)+')';g.beginPath();g.arc(x0+dx*pp,y0+dy*pp,(2.2-k*.2)*s,0,PI2);g.fill()}}
  g.globalCompositeOperation='source-over';
  /* mây tầng xa */
  for(i=0;i<3;i++){var cy0=gy*(.34+.1*i),cx0=((t*(.05+.02*i)+rnd(i+30)*Wd)%(Wd+600))-300;
    g.fillStyle='rgba(255,196,190,.14)';g.beginPath();g.ellipse(cx0,cy0,260*s,9*s,0,0,PI2);g.fill();g.beginPath();g.ellipse(cx0+90*s,cy0+8*s,190*s,6*s,0,0,PI2);g.fill()}
  /* mây gần: đáy hồng + tường vân */
  for(i=0;i<4;i++){var cx=((t*(.12+rnd(i)*.1)+rnd(i+3)*(Wd+420))%(Wd+420))-210,cy=gy*(.14+.1*i);
    for(var pass=0;pass<2;pass++){
      g.fillStyle=pass?'rgba(255,238,220,'+(.34+.08*(i%2))+')':'rgba(214,150,190,.26)';
      for(k=0;k<5;k++){g.beginPath();g.ellipse(cx+(k-2)*26*s,cy+(pass?0:4*s)+Math.sin(k*1.7)*5*s,(30+rnd(i*9+k)*16)*s,(11+rnd(i*5+k)*5)*s,0,0,PI2);g.fill()}}
    if(i%2===0){g.strokeStyle='rgba(255,246,236,.5)';g.lineWidth=1.6*s;g.beginPath();g.arc(cx+66*s,cy+2*s,7*s,3.4,8.2);g.stroke();g.beginPath();g.arc(cx+66*s,cy+2*s,3.4*s,3.4,7.6);g.stroke()}}
  /* đảo nổi + thác nước */
  for(i=0;i<ISL.length;i++){var o=ISL[i],bob=Math.sin(t*.016+i*2.3)*4*s,X=o.x,Y=o.y+bob;
    g.drawImage(o.cv,X,Y,o.pw,o.ph);wfall(X+o.wx*o.ui,Y+o.wy*o.ui,64*s,t+i*17,2.6*s)}
  /* thác nước trên núi */
  if(WF)wfall(WF.x,WF.y0,WF.y1-WF.y0,t,WF.w);
  /* đàn hạc bay */
  if(!lite()){var Fx=Wd+60-((t*.4)%(Wd+300)),Fy=gy*.24+Math.sin(t*.005)*8*s;
    for(i=0;i<5;i++){var row=Math.ceil(i/2),sg=i%2?1:-1;crane(Fx+row*17*s,Fy+sg*row*9*s+Math.sin(t*.02+i)*2*s,.9*s,t*.15+i)}}
  /* sương trôi giữa các tầng núi */
  for(i=0;i<3;i++){g.fillStyle='rgba(255,224,214,.1)';var mx=((t*(.1+i*.04)+i*300)%(Wd+500))-250;g.beginPath();g.ellipse(mx,gy*(.86+.06*i),150*s,13*s,0,0,PI2);g.fill()}
  g.restore()}
function groundFx(t){
  if(lite())return;
  var Wd=W,gy=GY,i,yM=gy+(H-gy)*.55,q;
  g.save();g.globalCompositeOperation='lighter';
  /* đèn trời */
  for(i=0;i<8;i++){
    var p=((t*.0012*(.7+rnd(i+60)*.6)+rnd(i+61))%1),lx=(.06+rnd(i+62)*.88)*Wd+Math.sin(t*.012+i*1.7)*12*s,ly=yM-p*(yM-gy*.12),al=Math.pow(Math.sin(p*3.1416),.6),sz=(6+rnd(i+63)*4)*s;
    q=g.createRadialGradient(lx,ly,1,lx,ly,sz*3.4);q.addColorStop(0,'rgba(255,186,96,'+(.5*al)+')');q.addColorStop(1,'rgba(255,150,70,0)');
    g.fillStyle=q;g.beginPath();g.arc(lx,ly,sz*3.4,0,PI2);g.fill();
    g.fillStyle='rgba(255,120,70,'+(.9*al)+')';g.fillRect(lx-sz*.5,ly-sz*.6,sz,sz*1.2);
    g.fillStyle='rgba(255,230,150,'+(.8*al)+')';g.fillRect(lx-sz*.28,ly-sz*.35,sz*.56,sz*.8)}
  /* đom đóm */
  for(i=0;i<16;i++){
    var fx=rnd(i+70)*Wd+Math.sin(t*.011+i*2.3)*20*s,fy=gy+(rnd(i+71)*.9-.15)*(H-gy)*.7+Math.cos(t*.013+i)*10*s,fl=.5+.5*Math.sin(t*.07+i*3.1);
    q=g.createRadialGradient(fx,fy,0,fx,fy,7*s);q.addColorStop(0,'rgba(210,255,150,'+(.85*fl)+')');q.addColorStop(1,'rgba(160,255,120,0)');
    g.fillStyle=q;g.beginPath();g.arc(fx,fy,7*s,0,PI2);g.fill()}
  g.restore();
  /* cánh hoa đào rơi */
  g.save();var yR=gy+(H-gy)*.8;
  for(i=0;i<10;i++){var sp=.5+rnd(i+90)*.6,hx=((rnd(i+91)*Wd+t*.25*sp+Math.sin(t*.025+i)*20)%(Wd+40))-20,hy2=((rnd(i+92)*yR+t*.45*sp)%yR);
    g.save();g.translate(hx,hy2);g.rotate(t*.05*sp+i);g.fillStyle=i%2?'#ffb3c7':'#ffd0dc';g.globalAlpha=.85;g.beginPath();g.ellipse(0,0,3.6*s,2*s,0,0,PI2);g.fill();g.restore()}
  g.restore()}

/* ---------- nhà ---------- */
function roof(w,y,col){
  g.fillStyle=col;g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.quadraticCurveTo(w-4,y+2,w+20,y-4);g.lineTo(w+6,y+8);g.lineTo(-w-6,y+8);g.fill();
  g.fillStyle='rgba(255,255,255,.1)';g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.lineTo(0,y-22);g.quadraticCurveTo(-w+10,y+6,-w-14,y+2);g.fill();
  g.fillStyle='#e0b84a';g.fillRect(-w-6,y+6,w*2+12,3)}
function houseFx(i,H_,t){
  var f=H_.fx;
  if(f===0){ /* cờ chiến đỏ phấp phới */
    for(var sd=-1;sd<=1;sd+=2){var px=sd*84;g.fillStyle='#5a3f26';g.fillRect(px-1,-112,2,104);
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
/* ---------- Fix319: nhà kiến trúc cổ (vẽ 1 lần/nhà vào canvas đệm, chỉ ánh đèn + hiệu ứng vẽ động) ---------- */
var HK={},HKK={};
var THEME=[
 {t1:'#a8433a',t2:'#5e1f22',ed:'#e8c04e'},
 {t1:'#f2c64c',t2:'#b8821c',ed:'#fff2b8'},
 {t1:'#43b494',t2:'#1f6a58',ed:'#e6f4b8'},
 {t1:'#8a6cca',t2:'#47306f',ed:'#eed8ff'},
 {t1:'#b8804a',t2:'#6a4026',ed:'#ffdc98'}];
function shade(q,x,y,w,h,c1,c2,vert){var gr=vert?q.createLinearGradient(0,y,0,y+h):q.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);q.fillStyle=gr;q.fillRect(x,y,w,h)}
function pillar(q,x,yb,h,C){
  q.fillStyle='#8f887a';q.fillRect(x-4.6,yb-3,9.2,3);q.fillStyle='#b3ac9a';q.fillRect(x-4.6,yb-3,9.2,1);
  q.fillStyle=C;q.fillRect(x-3.1,yb-h,6.2,h-3);
  var gr=q.createLinearGradient(x-3.1,0,x+3.1,0);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.5,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.4)');
  q.fillStyle=gr;q.fillRect(x-3.1,yb-h,6.2,h-3)}
function latWin(q,x,y,w,h,C){
  q.fillStyle='#ffcf7a';q.fillRect(x,y,w,h);
  q.save();q.beginPath();q.rect(x,y,w,h);q.clip();q.strokeStyle='rgba(120,44,22,.9)';q.lineWidth=.9;q.beginPath();
  for(var k=-h;k<w+h;k+=5){q.moveTo(x+k,y);q.lineTo(x+k+h,y+h);q.moveTo(x+k,y+h);q.lineTo(x+k+h,y)}q.stroke();q.restore();
  q.strokeStyle=C;q.lineWidth=2.2;q.strokeRect(x,y,w,h);q.fillStyle='#a9a291';q.fillRect(x-2,y+h+1,w+4,2.4)}
function doorP(q,cx,yb,h,C){
  q.fillStyle=C;q.fillRect(cx-15,yb-h-3,30,h+3);
  q.fillStyle='#3a1a10';q.fillRect(cx-13,yb-h,12.4,h);q.fillStyle='#4a2414';q.fillRect(cx+.6,yb-h,12.4,h);
  q.strokeStyle='rgba(0,0,0,.35)';q.lineWidth=.7;for(var p=-9;p<=9;p+=4.3){q.beginPath();q.moveTo(cx+p,yb-h);q.lineTo(cx+p,yb);q.stroke()}
  q.fillStyle='#e2b94a';for(var r=0;r<3;r++)for(var c2=0;c2<3;c2++){q.beginPath();q.arc(cx-10.2+c2*3.4,yb-h+6+r*8,.95,0,PI2);q.fill();q.beginPath();q.arc(cx+3.4+c2*3.4,yb-h+6+r*8,.95,0,PI2);q.fill()}
  q.strokeStyle='#e2b94a';q.lineWidth=1.1;q.beginPath();q.arc(cx-2.6,yb-h*.45,1.8,0,PI2);q.stroke();q.beginPath();q.arc(cx+2.6,yb-h*.45,1.8,0,PI2);q.stroke()}
function dougong(q,w,y){
  q.fillStyle='#4a2a1a';q.fillRect(-w,y-8,w*2,8);
  for(var x=-w+5;x<=w-4;x+=11){q.fillStyle='#c58d3e';q.fillRect(x-4,y-3,8,3);q.fillRect(x-6,y-6,12,3);q.fillRect(x-7.5,y-8,15,2);
    q.strokeStyle='rgba(60,30,10,.6)';q.lineWidth=.6;q.strokeRect(x-4,y-3,8,3);q.strokeRect(x-6,y-6,12,3)}}
function tileRoof(q,w,y,tip,c1,c2,ed){
  var L0=-w-tip,L1=y-9,rt=w*.34,ry=y-33,i,t;
  function lx(t){return (1-t)*(1-t)*L0+2*(1-t)*t*(-w+2)+t*t*(-rt)}
  function ly(t){return (1-t)*(1-t)*L1+2*(1-t)*t*(y+3)+t*t*ry}
  function rp(){q.beginPath();q.moveTo(L0,L1);for(t=.05;t<=1.001;t+=.05)q.lineTo(lx(t),ly(t));for(t=1;t>=-.001;t-=.05)q.lineTo(-lx(t),ly(t));q.lineTo(w+5,y+8);q.quadraticCurveTo(0,y+2,-w-5,y+8);q.closePath()}
  var gr=q.createLinearGradient(0,ry,0,y+8);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  rp();q.fillStyle=gr;q.fill();
  q.save();rp();q.clip();
  q.strokeStyle='rgba(0,0,0,.24)';q.lineWidth=.8;
  for(i=0;i<=16;i++){var a=i/16;q.beginPath();q.moveTo(-rt+a*rt*2,ry);q.lineTo(-w-5+a*(w*2+10),y+8);q.stroke()}
  for(t=.12;t<1;t+=.09){q.beginPath();q.moveTo(lx(t),ly(t));q.quadraticCurveTo(0,ly(t)+3,-lx(t),ly(t));q.stroke()}
  q.fillStyle='rgba(255,255,255,.14)';q.beginPath();q.moveTo(L0,L1);for(t=.05;t<=1.001;t+=.05)q.lineTo(lx(t),ly(t));q.lineTo(0,ry);q.lineTo(-w*.3,y+8);q.lineTo(-w-5,y+8);q.closePath();q.fill();
  q.restore();
  q.strokeStyle='rgba(30,12,12,.75)';q.lineWidth=1.3;rp();q.stroke();
  q.fillStyle='#2a1a1a';q.beginPath();q.moveTo(w+5,y+8);q.quadraticCurveTo(0,y+2,-w-5,y+8);q.lineTo(-w-5,y+12);q.quadraticCurveTo(0,y+6,w+5,y+12);q.closePath();q.fill();
  q.fillStyle=ed;for(var x=-w+1;x<=w-1;x+=6){var yy=y+8+(1-Math.pow(x/(w+5),2))*-0+0;q.beginPath();q.arc(x,y+8.6-(1-Math.pow(x/(w+5),2))*2.6,2.5,0,3.1416);q.fill()}
  q.strokeStyle=ed;q.lineWidth=3.2;q.lineCap='round';q.beginPath();q.moveTo(-rt-3,ry+1);q.lineTo(rt+3,ry+1);q.stroke();q.lineCap='butt';
  for(var sd=-1;sd<=1;sd+=2){q.fillStyle=ed;q.beginPath();q.moveTo(sd*(rt+2),ry+4);q.quadraticCurveTo(sd*(rt+11),ry-1,sd*(rt+6),ry-10);q.quadraticCurveTo(sd*(rt+4),ry-4,sd*rt,ry-3);q.closePath();q.fill();
    q.beginPath();q.arc(sd*(L0*-1-0),L1+7,0,0,0);q.fillStyle=ed;q.beginPath();q.arc(sd*(w+tip),L1+8,1.8,0,PI2);q.fill()}}
function paintHouse(q,i){
  var H_=HOUSES[i],C=H_.col,T=THEME[i]||THEME[4],x,k;
  q.fillStyle='rgba(0,0,0,.3)';q.beginPath();q.ellipse(0,2,84,9,0,0,PI2);q.fill();
  /* bệ đá 2 tầng + bậc thềm + lan can */
  q.fillStyle='#b3ad9b';q.fillRect(-72,-5,144,5);q.fillStyle='#cfc8b4';q.fillRect(-72,-5,144,1.4);
  q.fillStyle='#c9c2ae';q.fillRect(-62,-10,124,5);q.fillStyle='#e0dac6';q.fillRect(-62,-10,124,1.4);
  q.strokeStyle='rgba(60,55,45,.32)';q.lineWidth=.7;for(x=-68;x<=68;x+=12){q.beginPath();q.moveTo(x,-5);q.lineTo(x,0);q.stroke()}for(x=-56;x<=56;x+=12){q.beginPath();q.moveTo(x,-10);q.lineTo(x,-5);q.stroke()}
  for(k=0;k<3;k++){var sw=24-k*3.5;q.fillStyle=k%2?'#dcd5c1':'#c8c1ad';q.fillRect(-sw,-3.4*(k+1),sw*2,3.4);q.fillStyle='rgba(255,255,255,.3)';q.fillRect(-sw,-3.4*(k+1),sw*2,.9)}
  [-58,-50,50,58].forEach(function(px){q.fillStyle='#d8d1bd';q.fillRect(px-1.4,-17,2.8,7);q.beginPath();q.arc(px,-18,1.9,0,PI2);q.fill()});
  q.fillStyle='#cfc8b4';q.fillRect(-58,-15,8,1.8);q.fillRect(50,-15,8,1.8);
  /* gian chính */
  shade(q,-46,-57,92,47,'#f6ebd0','#e4d3a8',true);
  q.strokeStyle='rgba(120,100,60,.12)';q.lineWidth=.7;for(k=-50;k<-12;k+=7){q.beginPath();q.moveTo(-46,k);q.lineTo(46,k);q.stroke()}
  q.fillStyle='#9a8f7a';q.fillRect(-46,-16,92,6);
  latWin(q,25,-46,18,24,C);latWin(q,-43,-46,18,24,C);doorP(q,0,-10,36,C);
  [-46,-22.5,22.5,46].forEach(function(px){pillar(q,px,-10,47,C)});
  shade(q,-51,-62,102,6,C,'rgba(40,10,10,1)',true);
  q.fillStyle=T.ed;for(x=-44;x<=44;x+=8){q.beginPath();q.moveTo(x,-61.5);q.lineTo(x+2.2,-59);q.lineTo(x,-56.5);q.lineTo(x-2.2,-59);q.closePath();q.fill()}
  dougong(q,52,-62);
  tileRoof(q,60,-78,18,T.t1,T.t2,T.ed);
  /* gian trên */
  q.fillStyle='#8f887a';q.fillRect(-28,-97,56,4);
  shade(q,-24,-112,48,16,'#f6ebd0','#e4d3a8',true);
  latWin(q,12,-109,9,11,C);latWin(q,-21,-109,9,11,C);
  [-24,-9,9,24].forEach(function(px){pillar(q,px,-94,18,C)});
  q.fillStyle='#3a1410';q.beginPath();q.arc(0,-103,8,0,PI2);q.fill();q.strokeStyle=T.ed;q.lineWidth=1.8;q.stroke();
  q.font='bold 11px Ma Shan Zheng,'+FONT;q.textAlign='center';q.textBaseline='middle';q.fillStyle=T.ed;q.fillText(H_.ch,0,-102.5);q.textBaseline='alphabetic';
  shade(q,-29,-117,58,5,C,'rgba(40,10,10,1)',true);dougong(q,22,-117);
  tileRoof(q,36,-131,14,T.t1,T.t2,T.ed);
  q.fillStyle=T.ed;q.fillRect(-.9,-176,1.8,12);q.beginPath();q.arc(0,-172,3.2,0,PI2);q.fill();q.beginPath();q.arc(0,-177,2.2,0,PI2);q.fill();q.beginPath();q.moveTo(-1.4,-178);q.lineTo(0,-185);q.lineTo(1.4,-178);q.closePath();q.fill();
  /* vật trang trí riêng từng nhà */
  if(i===0){
    q.fillStyle='#5a3a22';q.fillRect(-82,-36,2.4,36);q.fillRect(-66,-36,2.4,36);q.fillRect(-83,-36,19,2.4);q.fillRect(-83,-22,19,2);
    [-79,-74.5,-70].forEach(function(sx,j){q.strokeStyle='#cdbba0';q.lineWidth=1.2;q.beginPath();q.moveTo(sx,-2);q.lineTo(sx,-46-j);q.stroke();q.fillStyle='#e2e9f4';q.beginPath();q.moveTo(sx,-52-j);q.lineTo(sx-2,-45-j);q.lineTo(sx+2,-45-j);q.closePath();q.fill();q.fillStyle='#c62f27';q.beginPath();q.arc(sx,-44-j,1.6,0,PI2);q.fill()});
    q.fillStyle='#4a2a1a';q.fillRect(70,-6,3,6);q.fillRect(83,-6,3,6);q.fillStyle='#a8322a';q.beginPath();q.ellipse(78,-20,10,13,0,0,PI2);q.fill();q.strokeStyle='#e2b94a';q.lineWidth=1.6;q.stroke();q.fillStyle='#e8c58a';q.beginPath();q.ellipse(78,-20,4.5,7,0,0,PI2);q.fill();q.fillStyle='#e2b94a';for(k=0;k<8;k++){var a=k*.785;q.beginPath();q.arc(78+Math.cos(a)*8.4,-20+Math.sin(a)*11,.9,0,PI2);q.fill()}
  }else if(i===1){
    q.fillStyle='#7a4a2a';q.fillRect(-86,-18,20,3);q.fillRect(-85,-15,2,15);q.fillRect(-69,-15,2,15);
    q.fillStyle='#e8c24a';[-82,-77,-72].forEach(function(gx){q.beginPath();q.arc(gx,-21,2.3,0,PI2);q.fill()});q.fillStyle='#7fe0ff';q.beginPath();q.moveTo(-79.5,-27);q.lineTo(-77,-23.5);q.lineTo(-79.5,-21.5);q.lineTo(-82,-23.5);q.closePath();q.fill();q.fillStyle='#ff7fa8';q.beginPath();q.arc(-70,-20.5,1.5,0,PI2);q.fill();
    q.fillStyle='#6a4a2a';q.fillRect(77,-52,2.2,52);q.fillRect(69,-52,10,2);q.strokeStyle='#e8c24a';q.lineWidth=3;q.beginPath();q.arc(69,-42,7,0,PI2);q.stroke();q.lineWidth=1;q.strokeRect(66.5,-44.5,5,5);q.fillStyle='#c62f27';q.fillRect(68.2,-34,1.6,8);
  }else if(i===2){
    q.fillStyle='#2f6f8f';q.beginPath();q.moveTo(-84,-12);q.lineTo(-68,-12);q.lineTo(-71,0);q.lineTo(-81,0);q.closePath();q.fill();q.fillStyle='#e8d38a';q.fillRect(-84,-12,16,2);
    q.lineCap='round';for(k=0;k<3;k++){q.strokeStyle='#5aa04a';q.lineWidth=2;q.beginPath();q.moveTo(-79+k*4,-12);q.lineTo(-81+k*5,-44-k*3);q.stroke()}q.lineCap='butt';q.fillStyle='#7cc060';[[-83,-36],[-76,-40],[-72,-34],[-80,-44]].forEach(function(l_){q.beginPath();q.ellipse(l_[0],l_[1],5,1.6,-.5,0,PI2);q.fill()});
    q.fillStyle='#6a4a2a';q.fillRect(66,-36,22,36);q.fillStyle='#4a3020';q.fillRect(68,-34,18,15);q.fillRect(68,-17,18,15);
    for(k=0;k<3;k++){q.fillStyle='#f2e6c0';q.fillRect(69+k*5.6,-33,4.4,6);q.fillRect(69+k*5.6,-26,4.4,6);q.fillRect(69+k*5.6,-16,4.4,6);q.fillStyle='#c62f27';q.fillRect(69+k*5.6,-33,4.4,1.2)}
  }else if(i===3){
    q.fillStyle='#8a6a3a';q.beginPath();q.ellipse(-76,-15,9,6,0,0,PI2);q.fill();q.fillStyle='#5a4220';q.fillRect(-85,-17,18,2);q.strokeStyle='#8a6a3a';q.lineWidth=2;q.beginPath();q.moveTo(-82,-10);q.lineTo(-84,0);q.moveTo(-70,-10);q.lineTo(-68,0);q.moveTo(-76,-9);q.lineTo(-76,0);q.stroke();
    q.fillStyle='#ff6a3a';q.beginPath();q.arc(-79,-19,1.2,0,PI2);q.fill();q.beginPath();q.arc(-73,-19,1.2,0,PI2);q.fill();
    q.fillStyle='#7b7a85';q.fillRect(70,-38,12,38);q.fillStyle='#9a99a5';q.fillRect(70,-38,12,2.5);
    for(k=0;k<3;k++){q.fillStyle='#b8261c';q.fillRect(71.4+k*3.6,-34,2.8,12);q.fillStyle='#ffd45a';q.fillRect(72.2+k*3.6,-31,1.2,1.2);q.fillRect(72.2+k*3.6,-27,1.2,1.2)}
  }else{
    q.fillStyle='#6f6b7a';q.beginPath();q.moveTo(-86,0);q.lineTo(-84,-14);q.lineTo(-78,-24);q.lineTo(-70,-20);q.lineTo(-66,-8);q.lineTo(-67,0);q.closePath();q.fill();
    q.fillStyle='rgba(255,255,255,.12)';q.beginPath();q.moveTo(-84,-14);q.lineTo(-78,-24);q.lineTo(-76,-12);q.closePath();q.fill();
    q.strokeStyle='rgba(190,150,255,.95)';q.lineWidth=1.3;q.beginPath();q.moveTo(-79,-18);q.lineTo(-76,-12);q.lineTo(-79,-7);q.moveTo(-73,-16);q.lineTo(-73,-6);q.moveTo(-77,-12);q.lineTo(-71,-12);q.stroke();
    lanternBody(q,78,0,.95)}
}
function ensureHouse(i,sc){
  var key=sc.toFixed(3)+'|'+DPR;if(HK[i]&&HKK[i]===key)return;HKK[i]=key;
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(240*sc*DPR));cv.height=Math.max(1,Math.ceil(206*sc*DPR));
  var q=cv.getContext('2d');q.setTransform(cv.width/240,0,0,cv.height/206,0,0);q.translate(120,196);
  try{paintHouse(q,i)}catch(e){try{console.warn('[Lang 2] nhà',e)}catch(x){}}
  HK[i]=cv}
function house(i,t){
  var H_=HOUSES[i],k=bww()/120,sc=s*k*.95,gl=.55+.45*Math.sin(t*.06+i*1.7);
  ensureHouse(i,sc);
  g.save();g.translate(bx(i)*s,GY);g.scale(sc,sc);
  g.drawImage(HK[i],-120,-196,240,206);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,176,80,'+(.1+.12*gl)+')';
  [[25,-46,18,24],[-43,-46,18,24],[12,-109,9,11],[-21,-109,9,11]].forEach(function(r){g.fillRect(r[0],r[1],r[2],r[3])});
  g.restore();
  if(typeof ln==='function'){try{ln(-62,-66,.8,t);ln(62,-66,.8,t)}catch(e){}}
  houseFx(i,H_,t);
  g.restore()}
function label(i,t){
  var H_=HOUSES[i],k=bww()/120,X=bx(i)*s,fs=Math.max(10,11.5*s),pad=fs*.55,
      hh=fs*2.3+pad,bot=GY-184*k*s,top=bot-hh;
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
  portal(x,y,ok?'255,205,90':'150,140,170',ok?['#fffbe6','#e8b23a','#3a2208']:['#201a2e','#3a3052','#120e1c'],t,!ok);
  PK=.7;plate(x,y-r-10*s+Math.sin(t*.1)*2,'🏯 Làng Tân Thủ 2',ok?'chạm để bước vào':'🔒 Cần Lv'+REQ_LV+' Phàm Thể',ok?'#ffe9a0':'#cdbfe8',ok?'#fff0b8':'#ff9a8a');PK=1}
function backDraw(t){
  var x=BACK_X()*s,y=BACK_Y(),r=GATE_R();
  portal(x,y,'110,235,170',['#f2fff8','#45c98c','#0b3a2a'],t,false);
  plate(x,y-r-14*s+Math.sin(t*.1)*2,'🏘 Về Làng Tân Thủ','chạm để quay về','#d9ffe9','#b8ffe0')}

/* ---------- cảnh Làng Tân Thủ 2 ---------- */
function scene(t){
  ensureBG();g.drawImage(BGC,0,0,W,H);
  var i,Wd=W,gy=GY;
  try{skyFx(t)}catch(e){try{g.restore()}catch(x){}try{console.warn("[Lang 2] sky",e)}catch(x){}}
  /* nhà */
  for(i=0;i<5;i++)house(i,t);
  /* ánh đèn đá */
  var L=lampXs();g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<L.length;i++){var lx=L[i]*s,ly=gy+10*s-26*s,gp=.7+.3*Math.sin(t*.07+i*2.1),q=g.createRadialGradient(lx,ly,1,lx,ly,34*s);q.addColorStop(0,'rgba(255,214,130,'+(.55*gp)+')');q.addColorStop(1,'rgba(255,190,100,0)');g.fillStyle=q;g.beginPath();g.arc(lx,ly,34*s,0,PI2);g.fill()}
  g.restore();
  try{groundFx(t)}catch(e){try{g.restore()}catch(x){}}
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
      for(var i=0;i<5;i++)if(Math.abs(x-bx(i))<bww()/2+12&&py>GY-195*k*s&&py<GY+50*s)hit=i;
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
