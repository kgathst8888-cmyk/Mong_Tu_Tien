/* ===== 🏯 BẢN ĐỒ QUÁI TỪ ẢNH THAM CHIẾU + QUÁI TÁCH TỪ ẢNH, HOẠT ẢNH MƯỢT =====
 * Ảnh người dùng gửi (assets/ban-do-assets.js → window.BDTT_ASSETS) được dùng NGUYÊN BẢN làm nền 5 bản đồ luyện cấp (chỉ số 0-4):
 *   map 0 giữ nguyên màu ảnh · map 1-4 là cùng bức tranh chỉnh màu (tuyết / dung nham / ma cốc / hư không) + hiệu ứng thời tiết riêng.
 *   Ảnh đã xoá quái + bảng tên dán cứng; cổng xoáy đỏ phục hồi bằng phản chiếu.
 * Cách vẽ: cắt ảnh theo "cửa sổ" cover căn hhàng chân quái (FEET) vào đường đất GY; cửa sổ trượt nhẹ theo vị trí nhân vật (parallax).
 *   Hoạt ảnh phủ lên: trời/mây trôi, cây phong đung đưa, cờ bay (kỹ thuật dải ngang lệch pha), lò lửa, cổng xoáy, thác nước, đèn đá nhấp nháy, hạc bay, sương, lá/tuyết/tàn lửa/ma trơi.
 * Quái: sói / lính vệ / boss TÁCH TỪ ẢNH thay cho các hàm vẽ MON của world/05 (qua LVX.MON); 8 loại quái dùng 3 sprite + tông màu riêng từng map & loại.
 *   Hoạt ảnh mượt: bọc foe() — chặn drawImage của sprite quái (cờ canvas._ttm) để thêm tư thế: bước đi (nghiêng/lắc/nảy), dồn lực trước đòn, lao + vòng nhảy
 *   khi đánh (làm mượt cú lao tức thời của engine), giật lùi khi trúng đòn. Không sửa engine/05.
 * NẠP NGAY SAU world/05 (trước 07/13): module 13 (hầm mỏ map 0) bọc bên ngoài nên vẫn vẽ chồng lên nền mới.
 * Hầm mỏ map 0: world/13 (đã vá 2 chỗ nhỏ) KHÔNG vẽ ngọn núi lớn nữa khi nền ảnh chạy; cửa hầm vẽ ở đây (khu chạm vẫn dùng mtHit của 13, thu nhỏ theo hệ số K).
 * Chỉnh: khối GRADE (màu từng map), MAPS (sprite/tỉ lệ từng loại quái), TINT. Tắt: window.BDTT.on=false (quay về nền + quái cũ).
 * Phụ thuộc: bgd, foe, W,H,s,g,fr,cl,P,dg,vil,lg,mapSel,SZ (engine), LVX.MON/LVX.LT (05), BDTT_ASSETS. */
(function(){
'use strict';
if(typeof bgd!=='function'||typeof foe!=='function'||typeof g==='undefined'||typeof cl!=='function'||!window.BDTT_ASSETS||!window.LVX||!LVX.MON||!LVX.LT)return;
var A=window.BDTT_ASSETS,IMW=1293,IMH=725,FEET=478,TAU=Math.PI*2,MON=LVX.MON,LT=LVX.LT,_oldBgd=bgd,_oldFoe=foe;
var API={on:true,ready:false},BG=null,GR={},SP={},PEND=[],pan=.5;

/* ---------- nạp ảnh ---------- */
function load(src,cb){var im=new Image();im.onload=function(){cb(im)};im.src=src}
load(A.bg,function(im){BG=im;API.ready=true});
Object.keys(A.spr).forEach(function(k){load(A.spr[k].src,function(im){SP[k]=im;var q=PEND;PEND=[];q.forEach(redraw)})});

/* ---------- chỉnh màu 4 map còn lại từ cùng một bức tranh ---------- */
var GRADE=[null,
 {sat:.5,mul:'rgb(188,216,255)',scr:'rgba(120,160,225,.20)'},
 {sat:.15,mul:'rgb(255,170,120)',ovl:'rgba(255,80,10,.38)',dark:.16},
 {sat:.55,mul:'rgb(150,230,205)',dark:.3},
 {sat:.2,mul:'rgb(205,150,255)',ovl:'rgba(120,40,200,.4)',dark:.4}];
function grade(i){
  if(i===0||!GRADE[i])return BG;
  if(GR[i])return GR[i];
  var c=document.createElement('canvas');c.width=IMW;c.height=IMH;var x=c.getContext('2d'),G=GRADE[i];x.drawImage(BG,0,0);
  if(G.sat!=null){x.globalCompositeOperation='saturation';x.fillStyle='rgba(128,128,128,'+(1-G.sat)+')';x.fillRect(0,0,IMW,IMH)}
  x.globalCompositeOperation='multiply';x.fillStyle=G.mul;x.fillRect(0,0,IMW,IMH);
  if(G.ovl){x.globalCompositeOperation='overlay';x.fillStyle=G.ovl;x.fillRect(0,0,IMW,IMH)}
  if(G.scr){x.globalCompositeOperation='screen';x.fillStyle=G.scr;x.fillRect(0,0,IMW,IMH)}
  if(G.dark){x.globalCompositeOperation='source-over';x.fillStyle='rgba(0,0,12,'+G.dark+')';x.fillRect(0,0,IMW,IMH)}
  x.globalCompositeOperation='source-over';GR[i]=c;return c}

/* ---------- toạ độ ảnh → màn hình ---------- */
var V={si:1,sx:0,sy:0};
function X(x){return(x-V.sx)*V.si}
function Y(y){return(y-V.sy)*V.si}
function seen(x,y,w,h){var a=X(x),b=Y(y);return a<W&&b<H&&a+w*V.si>0&&b+h*V.si>0}

/* dải ngang lệch pha: lay động vùng (x,y,w,h) của ảnh; offFn(f,i) = độ lệch ngang (px ảnh) theo vị trí f∈[0,1] từ trên xuống */
function warp(im,x,y,w,h,rows,offFn){
  if(!seen(x,y,w,h))return;
  var rh=h/rows,i;
  for(i=0;i<rows;i++){var sy=y+i*rh,off=offFn(i/(rows-1||1),i);
    g.drawImage(im,x,sy,w,rh+.7,X(x+off),Y(sy),w*V.si,(rh+.7)*V.si)}}

/* ---------- hiệu ứng nhỏ ---------- */
function flame(x,y,k,t,ph){
  var f=1+.12*Math.sin(t*.3+ph);g.save();g.globalCompositeOperation='lighter';
  [['rgba(255,110,20,.26)',1,15],['rgba(255,180,60,.34)',.7,11],['rgba(255,240,170,.42)',.4,7]].forEach(function(a){
    var hh=a[2]*k*f*(.9+.2*Math.sin(t*.4+ph+a[1]*3)),ww=a[1]*7*k;
    g.fillStyle=a[0];g.beginPath();g.moveTo(x-ww,y);g.quadraticCurveTo(x-ww*1.1,y-hh*.6,x+Math.sin(t*.2+ph)*ww*.6,y-hh);g.quadraticCurveTo(x+ww*1.1,y-hh*.6,x+ww,y);g.closePath();g.fill()});
  g.restore()}
function glow(x,y,r,rgb,a){var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)}
var SW={};
function swirl(r){var k=Math.round(r),o=SW[k];if(o)return o;o=document.createElement('canvas');o.width=o.height=k*2;var c=o.getContext('2d');c.translate(k,k);c.lineCap='round';
  for(var a=0;a<4;a++){c.strokeStyle='rgba(255,150,130,.9)';c.lineWidth=k*.06;c.beginPath();for(var q=0;q<=40;q++){var f=q/40,ang=a*Math.PI/2+f*5,rr=k*f;q?c.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr):c.moveTo(0,0)}c.stroke()}
  return SW[k]=o}
function crane(x,y,sz,t){var fl=Math.sin(t*.12)*.8;g.save();g.translate(x,y);g.scale(sz,sz);g.fillStyle='rgba(255,255,255,.92)';
  g.beginPath();g.ellipse(0,0,7,2.2,0,0,TAU);g.fill();g.beginPath();g.moveTo(6,-.5);g.quadraticCurveTo(11,-2,13,-.6);g.lineTo(13,.2);g.quadraticCurveTo(10,-.3,6,1);g.fill();
  g.beginPath();g.moveTo(-1,-1);g.quadraticCurveTo(-3,-9*(.5+fl*.5)-3,-12,-8-fl*5);g.quadraticCurveTo(-6,-4,2,-.4);g.fill();
  g.beginPath();g.moveTo(1,.6);g.quadraticCurveTo(-1,7+fl*3,-9,9+fl*6);g.quadraticCurveTo(-4,4,3,1.2);g.fill();g.restore()}

/* ---------- vẽ nền ---------- */
function frame(i,gy){
  var im=grade(i),fh=H-gy,si=Math.max(W/IMW,gy/FEET,fh/(IMH-FEET)),visW=W/si,visH=H/si,t=fr,u=s;
  pan+=(cl(P.x*s/W,0,1)-pan)*.04;
  var sx=Math.max(0,IMW-visW)*pan,sy=Math.max(0,FEET-gy/si);
  V.si=si;V.sx=sx;V.sy=sy;
  g.drawImage(im,sx,sy,visW,visH,0,0,W,H);
  /* trời + mây trôi, cây phong đung đưa, cờ bay, sương */
  warp(im,0,0,IMW,250,34,function(f){return(2.6*Math.sin(f*7+t*.006)+1.8*Math.sin(f*3.1+t*.0035))*(1-f)});
  warp(im,0,0,205,262,24,function(f){return 2.4*Math.pow(1-f,1.6)*Math.sin(t*.017+f*2)+.8*Math.sin(t*.041+f*5)*(1-f)});
  warp(im,40,520,150,90,10,function(f){return 1.5*(1-f)*Math.sin(t*.02+1)});
  warp(im,1130,560,163,165,14,function(f){return 1.7*(1-f)*Math.sin(t*.018+2)});
  [[904,260,30,82,0],[1171,260,30,78,1.7],[207,262,34,88,3.1],[1255,38,38,172,4.4],[800,309,20,40,2.2]].forEach(function(b){
    warp(im,b[0],b[1],b[2],b[3],10,function(f){return 2.4*f*Math.sin(t*.07+b[4]+f*3)})});
  warp(im,0,625,150,100,10,function(f){return 7*Math.sin(t*.008+f*2)});
  warp(im,270,665,260,60,8,function(f){return 6*Math.sin(t*.01+1+f)});
  /* lò lửa + đèn đá */
  [[20,392,1],[754,392,1],[919,396,1],[1170,396,1],[322,342,.6]].forEach(function(a,k){if(seen(a[0]-20,a[1]-45,40,50))flame(X(a[0]),Y(a[1]),1.45*si*a[2],t,k*1.7)});
  g.save();g.globalCompositeOperation='lighter';
  [[167,451],[475,448],[607,455],[656,470],[1111,478]].forEach(function(a,k){if(seen(a[0]-20,a[1]-20,40,40)){var fl=.65+.35*Math.sin(t*.09+k*2)+.1*Math.sin(t*.23+k);g.globalAlpha=.55*fl;glow(X(a[0]),Y(a[1]),15*si,'255,200,110',.9)}});
  g.restore();
  /* cổng xoáy đỏ + thác nước */
  if(seen(980,250,180,180)){var pr=88*si,pw=swirl(pr);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.3+.1*Math.sin(t*.05);g.translate(X(1070),Y(335));g.rotate(t*.011);g.drawImage(pw,-pw.width/2,-pw.height/2);g.restore();
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.4+.2*Math.sin(t*.04);glow(X(1070),Y(335),pr*1.1,'255,60,90',.5);g.restore()}
  g.save();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,1.2*si);
  [[565,198,600,268],[418,226,442,300],[205,548,228,600],[412,598,450,690]].forEach(function(f,k){if(!seen(f[0],f[1],f[2]-f[0],f[3]-f[1]))return;
    for(var j=0;j<3;j++){var fx=f[0]+(f[2]-f[0])*(.25+j*.25),fy=f[1]+((t*1.4+j*41+k*17)%(f[3]-f[1]));g.beginPath();g.moveTo(X(fx),Y(fy));g.lineTo(X(fx),Y(Math.min(f[3],fy+10)));g.stroke()}});
  g.restore();
  /* hạc bay */
  for(var c=0;c<2;c++){var x3=((c*W*.4+t*(.22+c*.07))%(W+120))-60;crane(x3,H*(.1+c*.07)+Math.sin(t*.02+c*2)*6*u,u*(.9-c*.15),t+c*9)}
  weather(i,t,u)}


/* (đã gỡ cửa hầm/ngọn núi ở map 0 — vào mỏ bằng nút ⛏ trên HUD, cạnh 🏆 Xếp hạng & ⚔️ Đấu trường) */

/* thời tiết riêng từng map */
function weather(i,t,u){
  var j,x,y,z;g.save();
  if(i===0){var cols=['rgba(236,96,116,.85)','rgba(240,140,60,.8)','rgba(214,50,50,.8)'];
    for(j=0;j<16;j++){x=((j*151+t*(.4+j%4*.2)+Math.sin(t*.02+j)*26)%(W+60))-30;y=(j*67+t*(.55+j%3*.25))%(H*1.02);g.save();g.translate(x,y);g.rotate(t*.03+j);g.fillStyle=cols[j%3];g.beginPath();g.ellipse(0,0,3.4*u,1.8*u,0,0,TAU);g.fill();g.restore()}}
  else if(i===1){g.fillStyle='rgba(255,255,255,.9)';for(j=0;j<60;j++){x=((j*97+Math.sin(t*.02+j)*30+t*(.3+j%3*.2))%(W+20))-10;y=(j*53+t*(.8+j%3*.5))%H;z=u*(1+j%3*.6);g.fillRect(x,y,z,z)}}
  else if(i===2){g.globalCompositeOperation='lighter';for(j=0;j<56;j++){x=(j*131+Math.sin(t*.02+j)*30+j*7)%W;y=H-((j*53+t*(.5+j%5*.25))%(H*.92));g.fillStyle=(j%4?'rgba(255,150,50,':'rgba(255,225,150,')+(.4+.5*Math.abs(Math.sin(t*.05+j)))+')';z=u*(1+j%3*.7);g.fillRect(x,y,z,z)}}
  else if(i===3){g.globalCompositeOperation='lighter';
    for(j=0;j<12;j++){x=((j*173+t*(.2+j%4*.1))%(W+80))-40;y=H*(.35+.4*((j*37)%100)/100)+Math.sin(t*.03+j)*18*u;var r=(12+j%4*6)*u,a=.25+.2*Math.sin(t*.04+j);glow(x,y,r,'80,240,190',a)}
    g.fillStyle='rgba(180,255,150,.85)';for(j=0;j<26;j++){x=(j*131+Math.sin(t*.02+j)*28)%W;y=H*.5+((j*47+Math.sin(t*.015+j*2)*40)%(H*.5));g.globalAlpha=.3+.6*Math.max(0,Math.sin(t*.05+j));g.fillRect(x,y,u*1.8,u*1.8)}}
  else if(i===4){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,190,250,.9)';
    for(j=0;j<46;j++){x=(j*131+Math.sin(t*.02+j)*24)%W;y=H-((j*47+t*(.4+j%5*.2))%(H*.9));g.globalAlpha=.3+.6*Math.abs(Math.sin(t*.05+j));z=u*(1+j%3*.6);g.fillRect(x,y,z,z)}
    var sp=(t*.004)%1;if(sp<.12){var k=sp/.12;g.globalAlpha=1-k;g.strokeStyle='#fff';g.lineWidth=1.6*u;g.beginPath();g.moveTo(W*(.9-k*.5),H*(.1+k*.3));g.lineTo(W*(.9-k*.5)+36*u,H*(.1+k*.3)-14*u);g.stroke()}}
  g.restore()}

bgd=function(gy){
  if(API.on&&API.ready&&!dg&&!vil&&!lg){
    try{frame(cl(mapSel|0,0,4),gy);return}catch(e){API.on=false;try{console.warn('BDTT',e)}catch(x){}}
  }
  return _oldBgd.apply(this,arguments)};

/* ---------- QUÁI: sprite tách từ ảnh thay cho hàm vẽ MON ---------- */
var MAPS={ /* loại : [sprite, tỉ lệ, tông riêng loại] */
 wolf:['wolf',1,null],scorp:['wolf2',.88,'rgba(60,200,150,.20)'],gob:['guard',.74,'rgba(235,200,60,.18)'],arch:['guard',.92,'rgba(80,140,255,.2)'],
 mage:['guard2',.97,'rgba(180,90,255,.24)'],ogre:['guard2',1,null],golem:['boss',.98,'rgba(120,130,150,.3)'],pal:['boss',1.04,null]};
var TINT=[null,'rgba(110,190,255,.26)','rgba(255,120,30,.22)','rgba(60,230,170,.24)','rgba(170,80,255,.28)'];
var ORIG={};
function redraw(p){p.ct.clearRect(0,0,p.W+2,p.H+2);paint(p.ct,p.k,p.i,p.W,p.H,p)}
function paint(ct,k,i,W_,H_,pend){
  var d=MAPS[k],im=SP[d[0]];
  if(!im){if(!pend)PEND.push({ct:ct,k:k,i:i,W:W_,H:H_});return}
  var a=A.spr[d[0]],f=Math.min(W_*.96/a.w,H_*.96/a.h)*d[1],dw=a.w*f,dh=a.h*f;
  ct.drawImage(im,(W_-dw)/2,H_-dh,dw,dh);
  var tints=[TINT[i],d[2]];ct.save();ct.globalCompositeOperation='source-atop';
  tints.forEach(function(c){if(c){ct.fillStyle=c;ct.fillRect(0,0,W_,H_)}});ct.restore()}
Object.keys(MAPS).forEach(function(k){
  if(!MON[k])return;ORIG[k]=MON[k];
  MON[k]=function(ct,T,W_,H_){
    var i=-1,n;for(n=0;n<LT.length;n++){if(LT[n]&&LT[n].m===T){i=n;break}}
    if(!API.on||i<0||i>4)return ORIG[k].apply(this,arguments);   /* Linh Giới (map 5-8) giữ quái cũ */
    ct.canvas._ttm=k;paint(ct,k,i,W_,H_)}});

/* ---------- hoạt ảnh mượt: tư thế thêm vào sprite quái ---------- */
var curE=null;
function sstep(v){v=cl(v,0,1);return v*v*(3-2*v)}
function pose(e){
  var ph=fr*.25+(e.sn||0),mv=e.mv?1:0,cd=e.cd||0,rg=e.rg||0,melee=rg<200,
    atk=cd>48,age=atk?Math.max(0,90-cd):99,o={rot:0,shx:0,sx:1,sy:1,fx:0,hop:0};
  if(mv&&!atk){o.rot+=.03+.03*Math.sin(ph);o.shx+=.06*Math.sin(ph+1.3);o.sy+=.025*Math.sin(ph*2);o.sx-=.012*Math.sin(ph*2)}
  var wind=(!mv&&cd>0&&cd<=18&&Math.abs(P.x-e.x)<rg+50)?sstep(1-cd/18):0;           /* dồn lực trước đòn */
  if(wind>0){o.rot-=wind*.14;o.sy-=wind*.08;o.sx+=wind*.05;o.fx-=wind*5}
  if(atk){
    var ease=sstep(age/7);
    if(melee){o.fx-=(cd-48)*1.3/SZ*(1-ease);                                           /* làm mượt cú lao tức thời của engine */
      o.hop=-Math.sin(Math.PI*cl(age/40,0,1))*11;o.rot+=.17*Math.sin(Math.PI*cl(age/26,0,1));o.sx+=.06*Math.sin(Math.PI*cl(age/20,0,1))}
    else{o.sy+=.05*Math.sin(Math.PI*cl(age/24,0,1));o.rot-=.05*Math.sin(Math.PI*cl(age/24,0,1))}}
  if(e.fl>0){var h=cl(e.fl/10,0,1);o.rot-=.07*h;o.fx-=4*h}                              /* giật lùi khi trúng đòn */
  return o}
foe=function(e){
  if(!API.on||dg||e.mt||!MON[e.k]||!ORIG[e.k])return _oldFoe(e);
  var og=g.drawImage;curE=e;
  g.drawImage=function(im){
    if(im&&im._ttm&&curE){var p=pose(curE);g.save();g.translate(p.fx,p.hop);g.transform(1,0,p.shx,1,0,0);g.rotate(p.rot);g.scale(p.sx,p.sy);og.apply(g,arguments);g.restore()}
    else og.apply(g,arguments)};
  try{return _oldFoe(e)}finally{delete g.drawImage;curE=null}};

window.BDTT=API;
})();
