/* ===== ☣ PHỤ BẢN 6 "VẠN ĐỘC CHƯỚNG LÂM" (world/141-van-doc-chuong-lam.js · Fix433) =====
 * Phụ bản của ĐẠO THỂ (HDAO.on()), mở từ bảng 🕳 Phụ Bản (thẻ số 6, world/40-phu-ban-2.js) và có lối tắt "cạnh Linh Giới"
 * (thẻ trong bảng chọn Bản đồ Linh Giới + dòng trong tab 🗺 Bản đồ). Cùng khung với Cửu U Luyện Ngục (world/136): phụ bản dg (cờ dg.vd),
 * dùng dgTick/dgAI/dgFoe/dgHud/drop/bgd của engine, KHÔNG sửa engine, KHÔNG đụng cờ dg.cu của Cửu U.
 * Chủ đề: rừng chướng khí tím xanh. Quái: Nấm Tinh, Nhện Tinh, Rắn Mẹ (tinh anh). Boss cuối: Độc Mẫu Chướng Vương.
 *
 * CƠ CHẾ CHƯỚNG KHÍ
 *  - Thanh ☣ Chướng khí (0-100%) tự dâng theo thời gian. Từ VD.tx.from% trở lên, nhân vật mất máu mỗi khung theo % máu tối đa
 *    (càng cao càng đau; KHÔNG bao giờ tự giết: chỉ trừ xuống VD.tx.floorHp, quái/boss vẫn có thể hạ gục).
 *  - AO GIẢI ĐỘC (VD.pond.n ao rải trong map): đứng trong ao thì chướng khí tụt nhanh + hồi chút máu, nhưng mỗi ao chỉ dùng được VD.pond.cap khung,
 *    cạn thì héo và hồi lại sau VD.pond.regrow khung → phải chạy giữa các ao, không đứng yên một chỗ.
 *  - BÀO TỬ: Nấm Tinh chết nổ đám mây bào tử (Rắn Mẹ chết nổ đám lớn hơn). Đứng trong mây bào tử thì chướng khí dâng nhanh thêm.
 *  - LIỀU ĐỘC ĐỔI EXP: chướng khí càng cao, mỗi quái hạ được cộng thêm Đạo Linh/EXP (VD.risk × % chướng khí). Liều thì ăn nhiều, nhát thì an toàn.
 *  - TIÊN ĐẠO (Ý Cảnh PS[cur].yc.p === 't'): "thanh tâm" — chướng khí dâng chậm hơn (VD.tx.tien) và ao giải độc hiệu quả hơn (VD.tx.pondT).
 * BOSS ĐỘC MẪU CHƯỚNG VƯƠNG: dùng AI boss Hầm Ngục (chém + nhảy) + "Độc Vụ Phun Trào" (cột độc báo trước ~1,1 giây, dưới 50% máu thành 3 cột, mỗi cột
 *   để lại đám mây bào tử) + "Chướng Khí Bùng Phát" ở 70%, 35% và 15% máu (đẩy chướng khí lên ít nhất VD.burst%, thêm mây bào tử, gọi Nấm Tinh + Nhện Tinh); dưới 30% máu chướng khí dâng nhanh hơn (VD.tx.rage).
 * PHẦN THƯỞNG: KHÔNG rơi trang bị. Quái rơi ít vàng; Boss rơi 1 RƯƠNG NGẪU NHIÊN (VD.chest, trọng số = %), thêm VD.lk Linh Thạch KHOÁ (như Cửu U).
 * ĐỘ KHÓ: lấy chỉ số bản đồ Linh Giới 5 (LGMAP.cfg[4]) làm gốc, nhân VD.hpK/atK/dfK theo loại quái.
 * GIỚI HẠN: tối đa VD.daily lượt VÀO mỗi ngày (PS[cur].vd9.day/dn, ngày VN UTC+7 theo Date tin cậy của core/00b) + hồi chiêu VD.cd.
 * THƯỞNG KẾT THÚC: hạ Boss có VD.shP (3%) rơi thêm 1-2 Mảnh Thánh, cộng dồn với rương Boss.
 * Vào: Đạo Thể, Đạo Cảnh Lv VD.req (Tiên Nhân/Chuyển Thế không cần cấp), hồi chiêu VD.cd (30 phút, tính từ lúc VÀO, lưu PS[cur].vd9 = {next,n,k}).
 * Tắt hẳn: bỏ <script> 141 trong index.html (thẻ số 6 tự ẩn). Chỉnh: khối VD bên dưới. */
(function(){
'use strict';
if(typeof dgHurt!=='function'||typeof dgAI!=='function'||typeof dgFoe!=='function'||typeof dgTick!=='function'||typeof dgHud!=='function'||typeof drop!=='function'||typeof bgd!=='function'||typeof gcf!=='function'||typeof mtExit!=='function'||typeof LCT==='undefined'||typeof PS==='undefined'||typeof gP!=='function'||typeof mx!=='function')return;

var VD={
 req:71,cd:30*60e3,daily:2,                              /* tối đa số lượt VÀO mỗi ngày (tính theo ngày giờ Việt Nam UTC+7, đồng hồ tin cậy) */
 shP:.03,shMin:1,shMax:2,                                 /* thưởng kết thúc: 3% rơi thêm shMin-shMax Mảnh Thánh (ngoài rương Boss) */
 total:30,cap:7,gap:35,                                   /* tổng quái · số quái sống tối đa · nhịp xuất hiện (khung) */
 seq:['nam','nhen','nam','nhen','ran','nam'],            /* thứ tự quái, lặp lại đến đủ total */
 hpK:{nam:1.6,nhen:1.5,ran:5,chu:60},                       /* × máu quái thường Linh Giới 5 (LGMAP.cfg[4].hpn) */
 atK:{nam:1.3,nhen:1.5,ran:2.1,chu:3},                  /* × sức đánh */
 dfK:{nam:1.4,nhen:1.3,ran:2.4,chu:3.2},                    /* × thủ */
 tx:{up:.05,cloud:.3,tien:.75,from:20,dmg:.0005,floorHp:1,pond:.9,pondT:1.25,heal:.0003,rage:1.4},
 /* up: % chướng khí dâng mỗi khung (≈2,1%/giây → đầy sau ~48 giây) · cloud: dâng thêm khi đứng trong mây bào tử
    from: ngưỡng bắt đầu mất máu · dmg: tỉ lệ máu tối đa mất mỗi khung ở 100% (≈1,8%/giây) · pond: % tụt mỗi khung trong ao */
 pond:{n:3,cap:220,regrow:1200,r:60},
 cloud:{R:90,life:420,max:6,bigK:1.4},
 risk:.8,expMul:.5,tuongK:2,burst:75,
 lk:10,                                                   /* Linh Thạch KHOÁ thưởng khi hạ Boss (LT.earnKS, cần đăng nhập ☁) */
 gold:8,                                                  /* vàng quái = gP(gold × cấp quái) */
 chest:[{w:58,t:'gold',v:400000},{w:33,t:'gold',v:800000},{w:5,t:'ore',v:150},{w:3,t:'ore',v:300},{w:1,t:'sh',v:1}]
};
var NAMES={nam:'Nấm Tinh',nhen:'Nhện Tinh',ran:'Rắn Mẹ',chu:'Độc Mẫu Chướng Vương'};
var SH={nam:96,nhen:90,ran:124,chu:250};   /* chiều cao vẽ (đơn vị) */
var TAU=6.2832;

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return String(n)}}
function say(t,c,l,y){try{DT.push({x:P.x,y:y||200,s:t,c:c||'#b8ff80',g:1,l:l||150})}catch(e){}}
function hdao(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function lite(){return (window.QL|0)>=2}
function rn(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function isTien(){try{var i=window.YCANH&&YCANH.info&&YCANH.info();if(i&&i.path)return i.path==='t'}catch(e){}try{return !!(PS[cur].yc&&PS[cur].yc.p==='t')}catch(e){}return false}
function reqOk(){try{if(window.CTHE&&CTHE.on())return true}catch(e){}return P.lv>=VD.req}
function K(){var p=PS[cur];if(!p)return{next:0,n:0,k:0};if(!p.vd9||typeof p.vd9!=='object')p.vd9={next:0,n:0,k:0};return p.vd9}
function dayNum(){return Math.floor((Date.now()+25200000)/86400000)}
function used(){var k=K();return k.day===dayNum()?(k.dn|0):0}
function todayLeft(){return Math.max(0,VD.daily-used())}
function left(){var k=K(),n=Date.now(),c=+k.next||0;if(c>n+VD.cd){c=n+VD.cd;k.next=c}return Math.max(0,c-n)}
function fmt(ms){var t=Math.ceil(ms/1000),m=Math.floor(t/60);return m+':'+String(t%60).padStart(2,'0')}
function base(){var c=null;try{c=LGMAP.cfg[4]}catch(e){}return c||{m:4.2,hpn:2.4e6,df:3.6,at:40}}
function lvM(){return Math.max(VD.req,Math.min(100,P.lv|0))}
function xpBase(){return Math.round(15*(1+lvM()/5))}
function xk(){var k=3;try{k=HDAO.cfg.killMul}catch(e){}return k*VD.expMul}
function addXp(v){v=Math.round(v);if(!(v>0))return 0;try{if(typeof XR==='function')v=Math.round(XR(v))}catch(e){}P.xp+=v;return v}

/* ---------- thư viện vẽ sprite (gốc toạ độ = giữa chân, y âm = đi lên; sprite quay mặt sang phải) ---------- */
function mk2(w,h,fn){var Z=2,cv=document.createElement('canvas');cv.width=w*Z;cv.height=h*Z;var k=cv.getContext('2d');k.scale(Z,Z);k.translate(w/2,h);fn(k);return cv}
function vg(k,y0,y1,a,b,m){var q=k.createLinearGradient(0,y0,0,y1);q.addColorStop(0,a);if(m)q.addColorStop(.5,m);q.addColorStop(1,b);return q}
function glw(k,x,y,r,rgb,a){k.save();k.globalCompositeOperation='lighter';var q=k.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');k.fillStyle=q;k.beginPath();k.arc(x,y,r,0,TAU);k.fill();k.restore()}
function pl(k,p,f,st,lw){k.beginPath();k.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)k.lineTo(p[i][0],p[i][1]);k.closePath();if(f){k.fillStyle=f;k.fill()}if(st){k.strokeStyle=st;k.lineWidth=lw||1.6;k.lineJoin='round';k.stroke()}}
function eye(k,x,y,r,rgb){glw(k,x,y,r*3.2,rgb,.75);k.fillStyle='rgb('+rgb+')';k.beginPath();k.ellipse(x,y,r*1.3,r*.8,0,0,TAU);k.fill()}
function limb(k,pts,w,col,line){k.save();k.lineCap='round';k.lineJoin='round';for(var pass=0;pass<2;pass++){k.lineWidth=pass?w:w+3;k.strokeStyle=pass?col:line;k.beginPath();k.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)k.lineTo(pts[i][0],pts[i][1]);k.stroke()}k.restore()}
function blob(k,x,y,rx,ry,fill,line,lw){k.beginPath();k.ellipse(x,y,rx,ry,0,0,TAU);k.fillStyle=fill;k.fill();if(line){k.strokeStyle=line;k.lineWidth=lw||1.6;k.stroke()}}
var DK='#050a06';

/* Nấm Tinh: nấm biết đi, mũ xanh lốm đốm sáng, bào tử bay quanh */
function pNam(k){
 glw(k,0,-54,64,'120,255,80',.24);
 [-1,1].forEach(function(d){pl(k,[[d*7,0],[d*23,0],[d*21,-24],[d*9,-24]],vg(k,-24,0,'#d2c394','#5c4a2a'),DK,1.4)});
 pl(k,[[-21,-22],[21,-22],[17,-60],[-17,-60]],vg(k,-60,-22,'#eee2b6','#8a7440'),DK,1.6);
 k.strokeStyle='rgba(90,70,30,.5)';k.lineWidth=1.2;[-8,0,8].forEach(function(x){k.beginPath();k.moveTo(x,-26);k.lineTo(x*.8,-56);k.stroke()});
 k.beginPath();k.moveTo(-52,-58);k.bezierCurveTo(-54,-116,54,-116,52,-58);k.quadraticCurveTo(0,-46,-52,-58);k.closePath();
 k.fillStyle=vg(k,-110,-50,'#7ae84a','#1c5418','#3fae2a');k.fill();k.strokeStyle=DK;k.lineWidth=2.2;k.stroke();
 [[-28,-86,8],[10,-98,6.5],[30,-76,9],[-6,-72,5],[-40,-66,4]].forEach(function(s_){glw(k,s_[0],s_[1],s_[2]*2.2,'200,255,120',.5);blob(k,s_[0],s_[1],s_[2],s_[2]*.8,'rgba(226,255,150,.92)',null)});
 eye(k,-9,-44,2.4,'255,255,120');eye(k,9,-44,2.4,'255,255,120');
 k.strokeStyle='#14240c';k.lineWidth=2;k.beginPath();k.moveTo(-8,-34);k.quadraticCurveTo(0,-29,8,-34);k.stroke();
 k.fillStyle='rgba(190,255,120,.8)';[[-58,-90],[60,-84],[-46,-112],[48,-108]].forEach(function(p){k.beginPath();k.arc(p[0],p[1],2.2,0,TAU);k.fill()})}

/* Nhện Tinh: nhện độc 8 chân, bụng tím có dấu đồng hồ cát xanh lục */
function pNhen(k){
 glw(k,0,-48,72,'150,255,70',.18);
 var bx=[-30,-14,2,16],i;
 for(i=0;i<4;i++){
  limb(k,[[bx[i]+6,-46],[bx[i]-10-i*5,-84+i*4],[bx[i]-30-i*7,-2]],4.4,'#2c1e3c',DK);
  limb(k,[[bx[i]+14,-44],[bx[i]+30+i*5,-86+i*4],[bx[i]+44+i*7,-2]],4.4,'#2c1e3c',DK)}
 blob(k,-16,-46,30,24,vg(k,-70,-22,'#5a3a78','#1a0f28'),DK,2);
 pl(k,[[-26,-58],[-6,-58],[-16,-48],[-6,-36],[-26,-36],[-16,-48]],'rgba(150,255,60,.85)',null);
 glw(k,-16,-48,14,'150,255,60',.5);
 blob(k,20,-42,16,14,vg(k,-58,-28,'#6a4a88','#1e1230'),DK,2);
 eye(k,26,-48,2,'255,60,60');eye(k,22,-52,1.5,'255,60,60');eye(k,29,-42,1.5,'255,60,60');eye(k,24,-44,1.1,'255,120,60');
 pl(k,[[30,-36],[34,-26],[28,-32]],'#efe8d8',DK,1);pl(k,[[26,-34],[27,-24],[22,-31]],'#efe8d8',DK,1);
 k.fillStyle='rgba(150,255,60,.9)';k.beginPath();k.ellipse(34,-22,1.6,3,0,0,TAU);k.fill()}

/* Rắn Mẹ: rắn hổ khổng lồ cuộn khoanh, mang bành, nanh nhỏ độc */
function pRan(k){
 glw(k,0,-60,78,'180,255,60',.22);
 var scale=vg(k,-60,0,'#5aa83a','#143a14','#2e7a28');
 blob(k,0,-14,52,15,scale,DK,2);blob(k,0,-30,42,13,scale,DK,2);blob(k,0,-45,30,11,scale,DK,2);
 k.strokeStyle='rgba(220,230,90,.45)';k.lineWidth=1.4;for(var i=-3;i<=3;i++){k.beginPath();k.arc(i*13,-14,6,.2,2.9);k.stroke()}for(i=-2;i<=2;i++){k.beginPath();k.arc(i*13,-30,5,.2,2.9);k.stroke()}
 limb(k,[[0,-48],[-8,-78],[8,-104],[14,-118]],20,'#3a8a30',DK);
 k.strokeStyle='rgba(230,240,110,.5)';k.lineWidth=2;k.beginPath();k.moveTo(-6,-52);k.quadraticCurveTo(-12,-78,6,-102);k.stroke();
 pl(k,[[2,-116],[-14,-128],[-4,-142],[26,-142],[38,-128],[26,-116]],vg(k,-142,-116,'#4a9a38','#1c4a1a'),DK,2);
 pl(k,[[6,-134],[16,-140],[24,-134],[16,-124]],'rgba(255,230,90,.65)',null);
 eye(k,12,-132,2.4,'255,230,60');eye(k,26,-132,2.4,'255,230,60');
 k.strokeStyle='#e04040';k.lineWidth=1.6;k.beginPath();k.moveTo(36,-124);k.lineTo(46,-122);k.lineTo(50,-126);k.moveTo(46,-122);k.lineTo(50,-118);k.stroke();
 pl(k,[[32,-122],[34,-114],[30,-120]],'#f2ecd8',DK,1);
 k.fillStyle='rgba(170,255,70,.9)';k.beginPath();k.ellipse(33,-110,1.8,3.4,0,0,TAU);k.fill()}

/* Độc Mẫu Chướng Vương: hoa nhện khổng lồ, bụng đầy mụn độc, miệng hoa nanh sắc */
function pChu(k){
 glw(k,0,-70,150,'110,255,60',.3);
 var i;
 for(i=0;i<4;i++){
  limb(k,[[-30+i*14,-110],[-80+i*22-i*4,-190+i*10],[-120+i*34,-2]],12,'#27183a',DK);
  limb(k,[[10+i*14,-114],[60+i*24,-196+i*10],[100+i*30,-2]],12,'#27183a',DK)}
 blob(k,-40,-124,76,66,vg(k,-190,-58,'#4a2c6a','#150a24'),DK,3);
 [[-70,-146,13],[-30,-176,11],[-84,-102,10],[-8,-142,12],[-48,-106,9],[-20,-90,8]].forEach(function(p){glw(k,p[0],p[1],p[2]*2.4,'150,255,60',.55);blob(k,p[0],p[1],p[2],p[2]*.9,'rgba(176,255,90,.92)','#1a3a10',1.4)});
 k.strokeStyle='rgba(150,255,60,.55)';k.lineWidth=2;k.beginPath();k.moveTo(-80,-120);k.quadraticCurveTo(-40,-100,-4,-130);k.stroke();
 blob(k,38,-118,34,32,vg(k,-150,-86,'#3a2456','#120a1e'),DK,2.6);
 var pc=['#d04aa0','#a02a80','#e060b8'];
 for(i=0;i<8;i++){var a=i/8*TAU+.2;k.save();k.translate(62,-150);k.rotate(a);k.beginPath();k.ellipse(34,0,30,12,0,0,TAU);k.fillStyle=pc[i%3];k.fill();k.strokeStyle=DK;k.lineWidth=2;k.stroke();k.restore()}
 blob(k,62,-150,30,30,vg(k,-182,-118,'#2a0a2a','#0a020a'),DK,2.4);
 for(i=0;i<10;i++){var b=i/10*TAU;pl(k,[[62+Math.cos(b-.2)*28,-150+Math.sin(b-.2)*28],[62+Math.cos(b)*14,-150+Math.sin(b)*14],[62+Math.cos(b+.2)*28,-150+Math.sin(b+.2)*28]],'#f0ead8',DK,1)}
 glw(k,62,-150,26,'160,255,70',.5);
 eye(k,36,-130,3.2,'255,70,70');eye(k,48,-120,2.6,'255,70,70');eye(k,26,-112,2.2,'255,110,60');
 k.fillStyle='rgba(170,255,80,.9)';[[62,-110],[70,-104],[54,-106]].forEach(function(p){k.beginPath();k.ellipse(p[0],p[1],2.2,5,0,0,TAU);k.fill()});
 k.fillStyle='rgba(190,255,120,.85)';[[-104,-210],[-20,-226],[30,-214],[100,-206],[-130,-150],[120,-220]].forEach(function(p){k.beginPath();k.arc(p[0],p[1],2.8,0,TAU);k.fill()})}
var PAINT={nam:[110,128,pNam],nhen:[130,100,pNhen],ran:[130,150,pRan],chu:[300,300,pChu]};
function spr(t){var o=PAINT[t];if(!o)return null;if(!o[3]){try{o[3]=mk2(o[0],o[1],o[2])}catch(e){o[3]=document.createElement('canvas')}}return o[3]}

/* ---------- nền: rừng chướng khí (phần tĩnh vẽ 1 lần vào canvas đệm, phần động vẽ mỗi khung) ---------- */
var BG={cv:null,key:'',miss:0,no:0,last:0};
function bgStatic(x,gy){
 var u=s,i,j,q,n,tx,th,tw,ly;
 q=x.createLinearGradient(0,0,0,gy);q.addColorStop(0,'#020a07');q.addColorStop(.5,'#0a2418');q.addColorStop(1,'#1d4a2c');x.fillStyle=q;x.fillRect(0,0,W,gy+2);
 q=x.createRadialGradient(W*.76,gy*.26,4,W*.76,gy*.26,150*u);q.addColorStop(0,'rgba(190,255,130,.35)');q.addColorStop(1,'rgba(120,230,90,0)');x.fillStyle=q;x.fillRect(0,0,W,gy);
 for(ly=0;ly<2;ly++){
  n=Math.max(4,Math.round(W/((ly?96:142)*u)));
  for(i=0;i<n;i++){
   tx=(i+.2+rn(i+ly*50)*.6)*W/n;tw=(ly?15:22)*u*(.8+rn(i+3)*.7);th=gy*(ly?.62:.82)*(.72+rn(i+9)*.4);
   x.fillStyle=ly?'#0d2a1a':'#06180e';
   x.fillRect(tx-tw/2,gy-th,tw,th);
   for(j=0;j<3;j++){var cx=tx+(rn(i*5+j+ly)-.5)*60*u,cy=gy-th+(rn(i*3+j)-.3)*38*u,cr=(46+rn(i+j*7)*34)*u*(ly?.8:1);
    x.beginPath();x.ellipse(cx,cy,cr,cr*.55,0,0,TAU);x.fill()}
   if(rn(i+ly*17)>.4){x.strokeStyle=ly?'rgba(90,200,120,.30)':'rgba(70,170,100,.24)';x.lineWidth=1.4*u;var vx=tx+(rn(i+8)-.5)*50*u,vl=(40+rn(i+13)*80)*u;x.beginPath();x.moveTo(vx,gy-th+10*u);x.quadraticCurveTo(vx+8*u,gy-th+vl*.5,vx-4*u,gy-th+vl);x.stroke()}}}
 q=x.createLinearGradient(0,gy,0,H);q.addColorStop(0,'#27561e');q.addColorStop(.3,'#10300e');q.addColorStop(1,'#050e05');x.fillStyle=q;x.fillRect(0,gy,W,H-gy);
 x.lineCap='round';
 for(i=0;i<10;i++){var px=(i*.099+.02+rn(i)*.05)*W,py=gy+(H-gy)*(.14+rn(i+5)*.78);x.strokeStyle='rgba('+(110+rn(i+2)*60|0)+',255,70,'+(.22+rn(i+9)*.25)+')';x.lineWidth=(1.2+rn(i+4)*1.6)*u;x.beginPath();x.moveTo(px,py);for(j=1;j<5;j++){px+=(rn(i*7+j)-.4)*46*u;py+=(rn(i*3+j)-.5)*14*u;x.lineTo(px,py)}x.stroke()}
 n=Math.max(5,Math.round(W/(90*u)));
 for(i=0;i<n;i++){var mx_=(i+.3+rn(i+60)*.5)*W/n,mr=(5+rn(i+70)*9)*u,my=gy+(2+rn(i+80)*10)*u;
  q=x.createRadialGradient(mx_,my-mr,1,mx_,my-mr,mr*3.4);q.addColorStop(0,'rgba(190,255,120,.5)');q.addColorStop(1,'rgba(120,255,80,0)');x.fillStyle=q;x.fillRect(mx_-mr*3.4,my-mr*4.4,mr*6.8,mr*6.8);
  x.fillStyle='#d9f7a0';x.beginPath();x.ellipse(mx_,my-mr,mr,mr*.7,0,Math.PI,0);x.fill();x.fillStyle='#8a7a50';x.fillRect(mx_-mr*.22,my-mr,mr*.44,mr)}
 q=x.createLinearGradient(0,gy-12*u,0,gy+30*u);q.addColorStop(0,'rgba(140,255,100,0)');q.addColorStop(.35,'rgba(140,255,100,.28)');q.addColorStop(1,'rgba(140,255,100,0)');x.fillStyle=q;x.fillRect(0,gy-12*u,W,42*u)}
function drawHaz(gy){
 var S=dg.cs,i,h,age,x,R0,u,pu;
 for(i=0;i<S.hz.length;i++){
  h=S.hz[i];age=dg.t-h.t0;x=h.x*s;R0=h.R*s;
  g.save();g.globalCompositeOperation='lighter';
  if(age<h.warn){u=age/h.warn;pu=.5+.5*Math.sin(fr*(.22+u*.4));
   g.strokeStyle='rgba(150,255,90,'+(.3+.5*pu)+')';g.lineWidth=2.4*s;g.beginPath();g.ellipse(x,gy,R0,R0*.28,0,0,TAU);g.stroke();
   g.beginPath();g.ellipse(x,gy,R0*(1-u),R0*.28*(1-u),0,0,TAU);g.stroke();
   g.fillStyle='rgba(90,220,50,'+(.08+.2*u)+')';g.beginPath();g.ellipse(x,gy,R0,R0*.28,0,0,TAU);g.fill();
   g.strokeStyle='rgba(190,255,140,'+(.2+.3*u)+')';g.lineWidth=2*s;g.setLineDash([5*s,5*s]);g.beginPath();g.moveTo(x,0);g.lineTo(x,gy);g.stroke();g.setLineDash([])}
  else{u=(age-h.warn)/22;var al=Math.max(0,1-u),q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,'rgba(160,255,90,0)');q.addColorStop(1,'rgba(210,255,160,'+al+')');
   g.fillStyle=q;g.fillRect(x-R0*.3*(1-u*.5),0,R0*.6*(1-u*.5),gy);g.strokeStyle='rgba(210,255,160,'+al+')';g.lineWidth=3*s*al;g.beginPath();g.ellipse(x,gy,R0*(.5+u),R0*.28*(.5+u),0,0,TAU);g.stroke()}
  g.restore()}
}
function drawPonds(gy){
 var S=dg.cs,i,p,x,R0,ratio,t=fr;
 for(i=0;i<S.pd.length;i++){
  p=S.pd[i];x=p.x*s;R0=VD.pond.r*s;ratio=p.cap/VD.pond.cap;
  g.save();
  if(p.cap>0){
   g.fillStyle='rgba(20,90,90,.55)';g.beginPath();g.ellipse(x,gy+6*s,R0,R0*.3,0,0,TAU);g.fill();
   g.globalCompositeOperation='lighter';
   g.fillStyle='rgba(90,255,220,'+(.18+.14*ratio+.05*Math.sin(t*.1+i))+')';g.beginPath();g.ellipse(x,gy+6*s,R0*.92,R0*.26,0,0,TAU);g.fill();
   g.strokeStyle='rgba(160,255,240,'+(.35+.3*Math.sin(t*.08+i*2))+')';g.lineWidth=1.8*s;var rr=((t*.5+i*20)%40)/40;g.beginPath();g.ellipse(x,gy+6*s,R0*(.3+.6*rr),R0*.26*(.3+.6*rr),0,0,TAU);g.stroke();
   g.strokeStyle='rgba(120,255,230,.8)';g.lineWidth=3*s;g.beginPath();g.ellipse(x,gy+6*s,R0,R0*.3,0,-Math.PI/2-TAU*ratio*.5,-Math.PI/2+TAU*ratio*.5);g.stroke();
   g.font='bold '+(11*s)+'px sans-serif';g.textAlign='center';g.fillStyle='rgba(200,255,245,.85)';g.fillText('💧 Ao giải độc',x,gy-R0*.3-6*s)}
  else{
   g.fillStyle='rgba(50,70,40,.55)';g.beginPath();g.ellipse(x,gy+6*s,R0*.9,R0*.26,0,0,TAU);g.fill();
   g.font='bold '+(10*s)+'px sans-serif';g.textAlign='center';g.fillStyle='rgba(190,190,150,.7)';g.fillText('🥀 Héo '+Math.ceil((VD.pond.regrow-(dg.t-p.t0))/60)+'s',x,gy-R0*.3-6*s)}
  g.restore()}
}
function drawClouds(gy){
 var S=dg.cs,i,c_,age,al,x,R0,q;
 for(i=0;i<S.cl.length;i++){
  c_=S.cl[i];age=dg.t-c_.t0;al=Math.min(1,age/40,(c_.life-age)/60);if(al<=0)continue;
  x=c_.x*s;R0=c_.R*s;
  g.save();
  q=g.createRadialGradient(x,gy-R0*.25,R0*.1,x,gy-R0*.25,R0);q.addColorStop(0,'rgba(150,230,70,'+(.5*al)+')');q.addColorStop(.7,'rgba(90,190,50,'+(.28*al)+')');q.addColorStop(1,'rgba(60,150,40,0)');
  g.fillStyle=q;g.beginPath();g.ellipse(x,gy-R0*.25,R0,R0*.62,0,0,TAU);g.fill();
  if(!lite()){g.globalCompositeOperation='lighter';g.fillStyle='rgba(210,255,140,'+(.35*al)+')';
   for(var j=0;j<5;j++){var a=fr*.02+j*1.3+i,rr=R0*(.25+.5*rn(j+i*3));g.beginPath();g.arc(x+Math.cos(a)*rr,gy-R0*.25+Math.sin(a*1.4)*R0*.3,(2+rn(j)*2)*s,0,TAU);g.fill()}}
  g.restore()}
}
function paintBg(gy){
 var dp=(typeof DPR==='number'&&DPR>0)?DPR:1,key=W+'|'+H+'|'+gy+'|'+s+'|'+dp,x,i,t=fr,n,tx=dg&&dg.cs?dg.cs.tx:0;
 if(!BG.no&&(!BG.cv||BG.key!==key)){
  if(t-BG.last>120)BG.miss=0;BG.last=t;
  if(++BG.miss>12){BG.no=1;BG.cv=null}
  else try{if(!BG.cv)BG.cv=document.createElement('canvas');if(BG.cv.width!==c.width)BG.cv.width=c.width;if(BG.cv.height!==c.height)BG.cv.height=c.height;
   x=BG.cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,BG.cv.width,BG.cv.height);x.setTransform(dp,0,0,dp,0,0);bgStatic(x,gy);BG.key=key}catch(e){BG.no=1;BG.cv=null}}
 if(BG.cv&&!BG.no&&BG.key===key){g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(BG.cv,0,0);g.restore()}
 else{try{bgStatic(g,gy)}catch(e){}}
 g.save();g.globalCompositeOperation='lighter';
 g.fillStyle='rgba(120,255,90,'+(.04+.05*(tx/100)+.02*Math.sin(t*.05))+')';g.fillRect(0,0,W,gy+8*s);
 n=lite()?5:11;
 for(i=0;i<n;i++){var fx=((rn(i)*W*1.4)+t*(.25+rn(i+4)*.3)*s)%(W*1.3)-W*.15,fy=gy-(8+rn(i+9)*60)*s;
  var q=g.createRadialGradient(fx,fy,2,fx,fy,(60+rn(i+2)*50)*s);q.addColorStop(0,'rgba(140,255,110,.10)');q.addColorStop(1,'rgba(140,255,110,0)');g.fillStyle=q;g.fillRect(fx-120*s,fy-80*s,240*s,160*s)}
 n=lite()?8:18;
 for(i=0;i<n;i++){var sp=.3+rn(i+3)*.6,y=gy+(H-gy)*.5-((t*sp+rn(i+7)*400)%(gy*1.0)),ex=rn(i)*W+Math.sin(t*.03+i)*14*s;g.fillStyle='rgba('+(150+rn(i+2)*80|0)+',255,'+(80+rn(i+5)*60|0)+','+(.25+.4*rn(i+11))+')';g.fillRect(ex,y,(1.4+rn(i+5)*1.6)*s,(1.4+rn(i+5)*1.6)*s)}
 g.restore();
 try{if(dg&&dg.cs){drawPonds(gy);drawClouds(gy);drawHaz(gy)}}catch(e){}
}
var _bgd=bgd;
bgd=function(gy){if(!(dg&&dg.vd))return _bgd.apply(this,arguments);paintBg(gy)};

/* ---------- viền chướng khí phủ màn hình (DOM, không bắt chạm) ---------- */
var OV=null;
function ovSet(v){try{if(!OV){OV=document.createElement('div');OV.id='vd-tox';OV.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .4s;background:radial-gradient(ellipse at center,rgba(70,210,40,0) 42%,rgba(70,230,40,.6) 100%)';document.body.appendChild(OV)}OV.style.opacity=String(v)}catch(e){}}
function ovOff(){try{if(OV&&OV.parentNode)OV.parentNode.removeChild(OV)}catch(e){}OV=null}

/* ---------- tạo quái / mây bào tử ---------- */
function mkMon(type,x,hk){
 var B=base(),L=lvM(),boss=type==='chu',hp=B.hpn*VD.hpK[type]*(hk||1),
  df=(8+L*2.2)*(1+B.m*.4)*VD.dfK[type]*B.df,m=((1+.35*B.m)*B.at*VD.atK[type]-1)/.35;
 var e={dg:1,vd:type,k:boss?'boss':'run',sp:boss?'boss':'impA',x:x,y:0,vx:0,vy:0,hp:hp,max:hp,df:df,b:boss?4:0,m:m,lv:L,cd:30+R()*50,sl:0,fl:0,in:boss?70:0,hh:boss?250:90,rg:boss?190:(type==='ran'?70:60),sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:0};
 if(boss){e.nm='☣ '+NAMES.chu;e.big=270;e.gc=['#103a12','#a8ff48']}
 E.push(e);return e}
function addCloud(x,k){
 var S=dg.cs;if(S.cl.length>=VD.cloud.max)S.cl.shift();
 S.cl.push({x:cl(x,60,vw()-60),R:VD.cloud.R*(k||1),t0:dg.t,life:VD.cloud.life})}
function spawnNext(){
 var S=dg.cs,t=VD.seq[S.spawned%VD.seq.length],x=(P.x>vw()*.55?-60:vw()+60)+(R()<.5?-1:1)*R()*50;
 S.spawned++;mkMon(t,x);
 if(t==='ran')say('🐍 Rắn Mẹ xuất hiện!','#c8ff70',110,215)}

/* ---------- AI: boss thêm Độc Vụ Phun Trào + Chướng Khí Bùng Phát ---------- */
function bossSkills(e){
 var S=dg.cs,en=e.hp<e.max*.5,r=e.hp/e.max,xs,i;
 e.ck=(e.ck|0)+1;
 if(e.ck>=(en?180:280)&&S.hz.length<5){e.ck=0;xs=en?[P.x-170,P.x,P.x+170,P.x+(R()<.5?-80:80)]:[P.x,P.x+(R()<.5?-130:130),P.x+(R()<.5?90:-90)];
  xs.forEach(function(x){S.hz.push({x:cl(x,50,vw()-50),t0:dg.t,warn:58,R:90,src:e})});say('☣ Độc Vụ Phun Trào!','#c8ff70',80,260)}
 if(r<.7&&!(e.sm&1)){e.sm=(e.sm|0)|1;burst(e)}
 if(r<.35&&!(e.sm&2)){e.sm=(e.sm|0)|2;burst(e)}
 if(r<.15&&!(e.sm&4)){e.sm=(e.sm|0)|4;burst(e)}}
function burst(e){
 var S=dg.cs,i;S.tx=Math.max(S.tx,VD.burst);
 for(i=-1;i<=1;i++)addCloud(e.x+i*130,1.15);
 for(i=0;i<3;i++)mkMon(i%2?'nhen':'nam',cl(e.x+(i-1)*170,60,vw()-60));
 say('☣ Chướng Khí Bùng Phát! Chạy tới ao giải độc!','#e0ff80',170,250)}
var _ai=dgAI;
dgAI=function(e){
 var r=_ai.apply(this,arguments);
 if(e&&e.vd==='chu'&&e.in<=0&&dg&&dg.vd)bossSkills(e);
 return r};

/* ---------- vòng đời trận ---------- */
function newState(){
 var pd=[],i,n=VD.pond.n,w=vw();
 for(i=0;i<n;i++)pd.push({x:Math.round(w*(.16+.68*i/Math.max(1,n-1))),cap:VD.pond.cap,t0:0});
 return{spawned:0,killed:0,tx:0,acc:0,pd:pd,cl:[],hz:[],boss:0,done:0,out:0}}
function enter(){
 try{if(typeof bo!=='undefined'&&bo&&typeof tg==='function')tg()}catch(e){}
 try{bo=0;bag.style.display='none'}catch(e){}
 try{if(LCT.on())LCT.off()}catch(e){}
 vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 dg={t:0,n:20,kill:20,vd:1,cs:newState()};
 BG.miss=0;BG.no=0;
 say('☣ Vào Vạn Độc Chướng Lâm · chạy tới ao giải độc để hạ chướng khí!','#c8ff70',170)}
function exit(){ovOff();mtExit();try{LCT.enter()}catch(e){}}
function win(){
 var S=dg.cs;S.hz.length=0;
 K().k=(K().k|0)+1;try{QE('boss');QE('dg')}catch(e){}try{sv()}catch(e){}
 try{if(VD.lk>0&&window.LT&&LT.earnKS){LT.earnKS(VD.lk);say('🔒 +'+VD.lk+' 💎 Linh Thạch khoá','#9fd8ff',220,265)}}catch(e){}
 say('🏆 Hạ Độc Mẫu Chướng Vương · Vạn Độc Chướng Lâm!','#e8ffa0',220,230);
 try{if(R()<VD.shP){var n=VD.shMin+Math.floor(R()*(VD.shMax-VD.shMin+1));HL.addSH(n);say('💠 Thưởng kết thúc: +'+n+' Mảnh Thánh!!!','#ff9aff',260,285);sv()}}catch(e){}}
var _tick=dgTick;
dgTick=function(){
 if(!dg||!dg.vd){if(OV)ovOff();return _tick.apply(this,arguments)}
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 var S=dg.cs,i,e,h,age,p,mobs=0,inC=false,onPond=false,rate,d,c_;
 for(i=0;i<E.length;i++){e=E[i];if(e&&e.vd&&e.vd!=='chu')mobs++}
 if(!S.boss&&S.spawned<VD.total&&dg.t>60&&mobs<VD.cap&&dg.t%VD.gap===0)spawnNext();
 /* mây bào tử hết hạn */
 for(i=S.cl.length-1;i>=0;i--){c_=S.cl[i];if(dg.t-c_.t0>=c_.life)S.cl.splice(i,1);else if(!inC&&dg.t-c_.t0>20&&Math.abs(P.x-c_.x)<c_.R&&(P.y||0)<90)inC=true}
 /* ao giải độc */
 for(i=0;i<S.pd.length;i++){p=S.pd[i];
  if(p.cap<=0){if(dg.t-p.t0>=VD.pond.regrow){p.cap=VD.pond.cap;say('💧 Ao giải độc đã hồi!','#9ff0ff',90,215)}continue}
  if(!onPond&&Math.abs(P.x-p.x)<VD.pond.r&&(P.y||0)<70){onPond=true;p.cap--;if(p.cap<=0){p.t0=dg.t;say('🥀 Ao giải độc cạn rồi, chạy sang ao khác!','#ffd98a',110,215)}}}
 /* chướng khí */
 if(!S.done){
  rate=VD.tx.up*(isTien()?VD.tx.tien:1)+(inC?VD.tx.cloud:0);
  e=E.find(function(q){return q&&q.vd==='chu'});if(e&&e.hp<e.max*.3)rate*=VD.tx.rage;
  if(onPond){S.tx-=VD.tx.pond*(isTien()?VD.tx.pondT:1);P.hp=Math.min(mx(),P.hp+mx()*VD.tx.heal)}
  else S.tx+=rate;
  S.tx=cl(S.tx,0,100);
  if(S.tx>=VD.tx.from&&P.hp>VD.tx.floorHp){d=mx()*(S.tx/100)*VD.tx.dmg;P.hp=Math.max(VD.tx.floorHp,P.hp-d);S.acc+=d}
  if(dg.t%60===0&&S.acc>0){DT.push({x:P.x,y:130,s:'☣ -'+nf(S.acc),c:'#b8ff60',g:1,l:40});S.acc=0}
  ovSet(S.tx>=VD.tx.from?(.12+S.tx/100*.55).toFixed(2):0)}
 else ovSet(0);
 /* cột độc của boss */
 for(i=S.hz.length-1;i>=0;i--){h=S.hz[i];age=dg.t-h.t0;
  if(!h.hit&&age>=h.warn){h.hit=1;try{if(Math.abs(P.x-h.x)<h.R&&(P.y||0)<70&&h.src&&h.src.hp>0)dgHurt(h.src,1.1)}catch(x){}try{dgFl=6}catch(x){}addCloud(h.x,1)}
  if(age>h.warn+22)S.hz.splice(i,1)}
 if(!S.boss&&S.spawned>=VD.total&&!mobs&&!E.some(function(q){return q&&q.vd})){S.boss=1;mkMon('chu',vw()+150);say('☣ Độc Mẫu Chướng Vương xuất hiện!','#c8ff70',160,230)}
 else if(S.boss&&!S.done&&!E.some(function(q){return q&&q.vd==='chu'})){S.done=1;S.out=300;S.cl.length=0;win()}
 if(S.done&&--S.out<=0)exit()};

/* ---------- phần thưởng: quái rơi ít vàng + EXP theo chướng khí, Boss rơi rương ngẫu nhiên (KHÔNG trang bị) ---------- */
function pickChest(){var t=0,i,r;for(i=0;i<VD.chest.length;i++)t+=VD.chest[i].w;r=R()*t;for(i=0;i<VD.chest.length;i++){r-=VD.chest[i].w;if(r<0)return VD.chest[i]}return VD.chest[0]}
function openChest(e){
 var c=pickChest(),x=e&&e.x||P.x,L='🎁 Rương Vạn Độc: ',m,col='#ffe27a',ok;
 if(c.t==='gold'){gold+=c.v;m=L+'+'+nf(c.v)+' 💰'}
 else if(c.t==='ore'){ok=false;try{var S=MN.get();S.fe=(S.fe|0)+c.v;S.hk=(S.hk|0)+c.v;ok=true}catch(x2){}
  m=ok?L+'+'+nf(c.v)+' 🔩 Quặng Sắt · +'+nf(c.v)+' 🌑 Huyền Kim':L+'(không nhận được quặng)';col='#bff4ff'}
 else{ok=false;try{HL.addSH(c.v);ok=true}catch(x3){}m=ok?L+'+'+c.v+' 💠 Mảnh Thánh!!!':L+'(không nhận được Mảnh Thánh)';col='#ff9aff'}
 DT.push({x:x,y:150,s:m,c:col,g:1,l:240});try{sv()}catch(x4){}}
var _drop=drop;
drop=function(e){
 if(!e||!e.vd)return _drop.apply(this,arguments);
 if(!dg||!dg.vd)return;
 var S=dg.cs,rk;
 if(e.vd==='chu'){openChest(e);return}
 S.killed++;gold+=gP(VD.gold*e.lv);
 if(e.vd==='ran')addXp(xpBase()*xk()*(VD.tuongK-1));
 rk=VD.risk*S.tx/100;
 if(rk>.01)addXp(xpBase()*xk()*rk*(e.vd==='ran'?VD.tuongK:1));
 if(e.vd==='nam'){addCloud(e.x,1);say('🍄 Bào tử nổ!','#c8ff70',60,190)}
 else if(e.vd==='ran'){addCloud(e.x,VD.cloud.bigK);say('🐍 Rắn Mẹ nổ độc!','#c8ff70',70,190)}};

/* Đạo Thể chỉ nhận Đạo Linh ở bản đồ Đạo Thể: mở cho dg.vd để HDAO.xg() cộng EXP kill như Linh Giới 5 (engine cộng EXP gốc, module cộng phần thêm) */
if(window.LGMAP){var _eo=LGMAP.expOk,_em=LGMAP.expMul;
 LGMAP.expOk=function(){try{if(dg&&dg.vd)return true}catch(e){}return _eo.apply(this,arguments)};
 LGMAP.expMul=function(){try{if(dg&&dg.vd)return VD.expMul}catch(e){}return _em.apply(this,arguments)}}

/* ---------- vẽ quái ---------- */
function pose(e){
 var r={rot:0,sx:1,sy:1,ox:0,oy:0},st=e.st,u,q,f;
 if(e.vd==='chu'){
  if(e.mv&&st==0){r.oy=-Math.abs(Math.sin(e.ph))*6;r.sy=1+.025*Math.sin(e.ph*2);r.rot=-.03*Math.sin(e.ph)}else r.sy=1+.012*Math.sin(fr*.08);
  if(st==1){u=1-e.tm/26;q=1-(1-u)*(1-u);r.rot=.32*q;r.sy=1+.04*q;r.ox=10*q}
  else if(st==2){u=1-e.tm/9;r.rot=.32-.78*u*u;r.ox=10-38*u;r.sy=1-.04*u}
  else if(st==4){u=e.tm/22;r.rot=-.46*u;r.ox=-28*u;r.sy=1-.03*u}
  else if(st==3){u=1-e.tm/44;r.sy=u<.1?.88:1+.1*Math.sin(u*Math.PI);r.rot=-.14*Math.sin(u*Math.PI)}
 }else{f=Math.abs(Math.sin(e.ph));r.rot=(Math.sign(P.x-e.x)||1)*.1;if(st==0){r.oy=-f*(e.vd==='nhen'?4:7);r.sy=1+.04*Math.cos(e.ph*2);if(e.vd==='nam')r.rot=Math.sin(e.ph)*.08}else if(st==1){r.sy=.85;r.sx=1.1}else{r.rot=(Math.sign(P.x-e.x)||1)*(.5-e.vy*.05);r.sy=1.12}}
 return r}
function drawVd(e){
 var T=e.vd,im=spr(T),HH,w,dir,X,po,y,bw,nm,bs=T==='chu';
 if(!im||!im.width)return;
 HH=bs?(e.big||250):SH[T];w=im.width/im.height*HH;dir=Math.sign(P.x-e.x)||1;X=(e.x-cam)*s;po=pose(e);
 g.save();g.globalAlpha=1;
 g.fillStyle='rgba(0,0,0,'+(.35-Math.min(.25,e.y/500)).toFixed(2)+')';g.beginPath();g.ellipse(X,GY+2,w*SZ*s*.3*(1-Math.min(.5,e.y/400)),6*s,0,0,TAU);g.fill();
 if(bs&&e.in>0)g.globalAlpha=cl(1-e.in/80,.15,1);
 g.translate(X+po.ox*s*SZ,GY-e.y*s+po.oy*s);g.scale(s*SZ,s*SZ);g.scale(dir,1);g.rotate(po.rot);g.scale(po.sx,po.sy);
 g.drawImage(im,-w/2,-HH,w,HH);
 if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(im,-w/2,-HH,w,HH)}
 g.restore();
 y=GY-(e.y+HH*SZ+10)*s;
 bw=(bs?110:46)*s;g.save();g.font='bold '+(bs?14:11)*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';
 nm=(window.NHX?NHX.ic(e):'')+(bs?(e.nm||NAMES.chu):(e.nm||NAMES[T]))+' Lv'+e.lv;g.strokeText(nm,X,y-6*s);g.fillStyle=bs?'#c8ff70':T==='ran'?'#e0ff90':'#fff';g.fillText(nm,X,y-6*s);
 g.fillStyle='#000a';g.fillRect(X-bw/2,y,bw,5*s);g.fillStyle=bs?'#6ad030':T==='ran'?'#b8d838':'#e8c040';g.fillRect(X-bw/2,y,bw*cl(e.hp/e.max,0,1),5*s);g.restore()}
var _foeD=dgFoe;
dgFoe=function(e){if(!e||!e.vd)return _foeD.apply(this,arguments);drawVd(e)};

/* ---------- HUD + nút rời trận ---------- */
var _hud=dgHud;
dgHud=function(){
 _hud.apply(this,arguments);
 try{
  if(!(dg&&dg.vd)||!dg.cs)return;
  var S=dg.cs,b=E.find(function(e){return e.vd==='chu'}),h,tx=Math.round(S.tx),col=tx>=75?'#ff8a6a':tx>=VD.tx.from?'#ffe070':'#b8ff80';
  h='<div class="dgt" style="color:#b8ff80">☣ Vạn Độc Chướng Lâm · '+(S.boss?'🌸 Độc Mẫu Chướng Vương':'Quái '+Math.min(S.killed,VD.total)+'/'+VD.total)+(isTien()?' · ☯ Thanh tâm':'')+'</div>';
  h+='<div class="dgt" style="color:'+col+'">☣ Chướng khí '+tx+'%'+(tx>=VD.tx.from?' · đang mất máu, tìm 💧 ao giải độc!':'')+'</div>';
  if(b)h+='<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>';
  dgh.innerHTML=h}catch(e){}};
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){
 if(dg&&dg.vd){ev.stopPropagation();if(!started)return;gcf('Rời Vạn Độc Chướng Lâm?\nLượt này sẽ mất (hồi chiêu vẫn tính).',exit);return}
 return _dp.call(this,ev)}}catch(e){}

/* ---------- vào phụ bản ---------- */
function status(){
 if(!hdao())return{txt:'☯ Chỉ nhân vật Đạo Thể mới được vào',col:'#ff9a9a'};
 if(!reqOk())return{txt:'🔒 Cần Đạo Cảnh Lv'+VD.req+' (hiện Lv'+P.lv+')',col:'#ff9a9a'};
 if(todayLeft()<=0)return{txt:'🚫 Hết '+VD.daily+' lượt hôm nay (làm mới 00:00)',col:'#ff9a9a'};
 if(left()>0)return{txt:'⏳ Vào lại sau '+fmt(left())+' · còn '+todayLeft()+'/'+VD.daily+' lượt',col:'#ffd98a'};
 return{txt:'✅ Sẵn sàng · còn '+todayLeft()+'/'+VD.daily+' lượt hôm nay'+(isTien()?' · ☯ Thanh tâm':''),col:'#9dffa0'}}
function canEnter(){
 if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return'Không thể vào lúc này';
 if(!hdao())return'☯ Vạn Độc Chướng Lâm chỉ dành cho nhân vật Đạo Thể (đã Hợp Đạo)';
 if(!reqOk())return'🔒 Cần Đạo Cảnh Lv'+VD.req+' để vào Vạn Độc Chướng Lâm (hiện Lv'+P.lv+')';
 if(todayLeft()<=0)return'🚫 Hôm nay đã hết '+VD.daily+' lượt Vạn Độc Chướng Lâm (làm mới 00:00)';
 if(left()>0)return'⏳ Vạn Độc Chướng Lâm hồi chiêu '+fmt(left());
 return true}
function go(){var k=K(),d=dayNum();if(k.day!==d){k.day=d;k.dn=0}k.dn=(k.dn|0)+1;k.next=Date.now()+VD.cd;k.n=(k.n|0)+1;try{sv()}catch(e){}enter()}
function ask(){
 var r=canEnter();if(r!==true){say(r,'#ffd98a',160);return}
 gcf('Vào VẠN ĐỘC CHƯỚNG LÂM?\nChướng khí tự dâng, quá '+VD.tx.from+'% sẽ mất máu dần (không tự chết). Chạy tới 💧 ao giải độc để hạ chướng khí; ao dùng lâu sẽ cạn. Chướng khí càng cao, quái hạ được càng nhiều Đạo Linh.'+(isTien()?'\n☯ Tiên Đạo: thanh tâm (chướng khí dâng chậm, ao hiệu quả hơn).':'')+'\nBoss cuối Độc Mẫu Chướng Vương rơi Rương ngẫu nhiên (không rơi trang bị). Hồi chiêu '+Math.round(VD.cd/60000)+' phút · tối đa '+VD.daily+' lượt/ngày (còn '+todayLeft()+').\nHạ Boss có '+Math.round(VD.shP*100)+'% rơi thêm '+VD.shMin+'-'+VD.shMax+' 💠 Mảnh Thánh.',go)}
function html(card){
 return card(6,'#7cff5a','☣','6. Vạn Độc Chướng Lâm','<b>Chỉ Đạo Thể</b> (Đạo Cảnh Lv'+VD.req+') · rừng chướng khí: Nấm Tinh, Nhện Tinh, Rắn Mẹ · <b>chướng khí</b> tự dâng, trên '+VD.tx.from+'% mất máu, chạy tới <b>ao giải độc</b> để hạ độc · liều độc cao ăn thêm <b>Đạo Linh</b> · hợp <b>Tiên Đạo</b> (thanh tâm) · Boss <b>Độc Mẫu Chướng Vương</b> rơi <b>Rương ngẫu nhiên</b> (không rơi trang bị) · hạ Boss có <b>'+Math.round(VD.shP*100)+'%</b> rơi thêm <b>'+VD.shMin+'-'+VD.shMax+' Mảnh Thánh</b> · tối đa <b>'+VD.daily+' lượt/ngày</b> · vào lại sau '+Math.round(VD.cd/60000)+' phút')}

/* ---------- lối tắt "cạnh Linh Giới": thẻ trong bảng Bản đồ Linh Giới + dòng trong tab 🗺 Bản đồ ---------- */
function inject(){
 try{
  var ov=document.getElementById('lgm-ov');if(!ov||ov.style.display==='none'||ov.querySelector('#vd-card'))return;
  var btn=ov.querySelector('[data-x]');if(!btn||!btn.parentNode)return;
  var st=status(),d=document.createElement('div');d.id='vd-card';
  d.style.cssText='display:flex;gap:10px;align-items:center;border:2px solid #7cff5a;border-radius:12px;padding:9px;margin:7px 0;background:#0c140a;cursor:pointer';
  d.innerHTML='<div style="font-size:30px;width:38px;text-align:center">☣</div><div style="flex:1"><b style="color:#9cff7a">Vạn Độc Chướng Lâm</b><div style="font-size:12px;opacity:.85">Phụ bản Đạo Thể · chướng khí · ao giải độc · Boss Độc Mẫu · rơi Rương (không trang bị)</div><div style="font-size:12.5px;margin-top:3px;font-weight:bold;color:'+st.col+'">'+st.txt+'</div></div>';
  d.addEventListener('click',function(){try{LGMAP.close()}catch(e){}ask()});
  btn.parentNode.insertBefore(d,btn)}catch(e){}}
try{var g0=LCT.gates&&LCT.gates[0];if(g0&&typeof g0.go==='function'){var _g0=g0.go;g0.go=function(){var r=_g0.apply(this,arguments);inject();return r}}}catch(e){}
try{if(window.LGMAP&&typeof LGMAP.open==='function'){var _lo=LGMAP.open;LGMAP.open=function(){var r=_lo.apply(this,arguments);inject();return r}}}catch(e){}
try{if(typeof lgUI==='function'){var _lu=lgUI;lgUI=function(){var h=_lu.apply(this,arguments);
 try{if(!hdao()||typeof h!=='string')return h;return h+'<div class="st" style="margin:6px 0 4px"><button style="width:100%;text-align:left" onclick="VDCL.ask()">☣ Vạn Độc Chướng Lâm · phụ bản Đạo Thể · '+status().txt+'</button></div>'}catch(e){return h}}}}catch(e){}

window.VDCL={cfg:VD,ask:ask,enter:enter,exit:exit,status:status,canEnter:canEnter,html:html,left:left,isTien:isTien,spr:spr,data:K};
})();
