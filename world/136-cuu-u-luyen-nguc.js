/* ===== ⛓ PHỤ BẢN 5 "CỬU U LUYỆN NGỤC" (world/136-cuu-u-luyen-nguc.js · Fix425) =====
 * Phụ bản của ĐẠO THỂ (HDAO.on()), mở từ bảng 🕳 Phụ Bản (thẻ số 5, world/40-phu-ban-2.js) và có lối tắt "cạnh Linh Giới":
 * thẻ trong bảng chọn Bản đồ Linh Giới (cổng 1 Thành Thị Linh Giới) + dòng trong tab 🗺 Bản đồ. Hợp với MA ĐẠO (xem bên dưới).
 * Chủ đề: hầm lửa đen + xích sắt. Quái: Ngục Tốt, Ma Tướng (tinh anh), Ác Linh Bị Giam (bay). Boss cuối: Ngục Chủ.
 * Kiểu trận = phụ bản dg (cờ dg.cu), giống Thánh Địa (world/62): dùng dgTick/dgAI/dgFoe/dgHud/dgHurt/drop/bgd của engine, KHÔNG sửa engine.
 *
 * CƠ CHẾ OÁN HỒN
 *  - Quái chết có xác suất để lại OÁN HỒN (CU.soulP; Ma Tướng luôn để lại, nhiều hồn hơn), bay quanh chỗ quái chết (còn tránh người chơi một chút).
 *  - Mỗi nhóm oán hồn có đồng hồ CU.life khung (300 khung ≈ 5 giây; vòng đếm hiện quanh từng hồn + HUD). Oán hồn 1 máu, không đánh trả.
 *  - Diệt HẾT nhóm trong hạn → "tịnh hóa": nhận thêm Đạo Linh/EXP (CU.clearK × EXP gốc × số hồn).
 *  - Hết hạn mà còn hồn → số hồn còn lại HỢP THỂ thành 1 "Oán Linh Tinh Anh" (máu cao hơn khi nhiều hồn). Tinh Anh chỉ trả EXP bằng Ma Tướng.
 *  - Ngục Chủ triệu hồi nhóm oán hồn ở 70% và 35% máu (cũng phải diệt trong hạn, không thì thành Tinh Anh).
 * MA ĐẠO (PS[cur].yc.p === 'm', Ý Cảnh): "hấp hồn" — hạn thêm CU.maLife khung, EXP tịnh hóa ×CU.maK, mỗi hồn diệt hồi CU.maHeal máu tối đa.
 *   Tiên Đạo vẫn vào được, chỉ không có thưởng thêm này (đặt CU.onlyMa=true nếu muốn chỉ Ma Đạo mới vào).
 * BOSS NGỤC CHỦ: dùng AI boss Hầm Ngục (chém + nhảy) + "Xích Sắt Trấn Hồn" (cột xích báo trước ~1,1 giây, dưới 50% máu thành 3 cột) + triệu oán hồn.
 * PHẦN THƯỞNG: KHÔNG rơi trang bị (để khỏi lệch cân bằng đồ). Quái rơi ít vàng; Boss rơi 1 RƯƠNG NGẪU NHIÊN (CU.chest, trọng số = %):
 *   vàng · Quặng Sắt + Huyền Kim · rất hiếm 1 Mảnh Thánh; thêm CU.lk (10) Linh Thạch KHOÁ khi hạ Ngục Chủ (cùng kiểu Rương Thánh Địa nhưng số lượng thấp hơn). EXP: qua đường kill của engine
 *   (đã mở LGMAP.expOk/expMul cho dg.cu để HDAO.xg() cộng Đạo Linh như bản đồ Linh Giới 5) + phần thưởng thêm ở trên.
 * ĐỘ KHÓ: lấy chỉ số bản đồ Linh Giới 5 "Thiên Hỏa Linh Nguyên" (LGMAP.cfg[4]) làm gốc, nhân CU.hpK/atK/dfK theo loại quái.
 * Vào: Đạo Thể, Đạo Cảnh Lv CU.req (Tiên Nhân/Chuyển Thế không cần cấp), hồi chiêu CU.cd (30 phút, tính từ lúc VÀO, lưu PS[cur].cu9 = {next,n,k}).
 * Phụ thuộc: dgHurt/dgAI/dgFoe/dgTick/dgHud/drop/bgd/gcf/mtExit (engine, 02), LCT (10), LGMAP (36, tuỳ chọn), HDAO (33), YCANH (45, tuỳ chọn),
 *   MN/HL (rương), QE, sv. Thiếu móc cốt lõi thì module tự tắt. Tắt hẳn: bỏ <script> 136 trong index.html (thẻ số 5 trong bảng Phụ Bản tự ẩn).
 * Chỉnh: khối CU bên dưới. */
(function(){
'use strict';
if(typeof dgHurt!=='function'||typeof dgAI!=='function'||typeof dgFoe!=='function'||typeof dgTick!=='function'||typeof dgHud!=='function'||typeof drop!=='function'||typeof bgd!=='function'||typeof gcf!=='function'||typeof mtExit!=='function'||typeof LCT==='undefined'||typeof PS==='undefined'||typeof dgb==='undefined'||typeof dgh==='undefined')return;

var CU={
 req:61,cd:30*60e3,onlyMa:false,
 total:24,cap:5,gap:45,                                   /* tổng quái · số quái sống tối đa · nhịp xuất hiện (khung) */
 seq:['tot','tot','linh','tot','tuong','linh'],          /* thứ tự quái, lặp lại đến đủ total */
 hpK:{tot:1,linh:.8,tuong:3,elite:3,chu:20},             /* × máu quái thường Linh Giới 5 (LGMAP.cfg[4].hpn) */
 atK:{tot:1,linh:.9,tuong:1.5,elite:1.6,chu:2},          /* × sức đánh */
 dfK:{tot:1,linh:.8,tuong:1.8,elite:1.8,chu:2.3},        /* × thủ */
 soulP:{tot:.35,linh:.45,tuong:1},soulN:{tot:1,linh:2,tuong:3},soulCap:10,eliteCap:3,
 life:300,maLife:120,                                     /* hạn diệt oán hồn (khung ≈ 60/giây) · Ma Đạo cộng thêm */
 expMul:.5,clearK:2.5,tuongK:2,eliteK:2,maK:1.5,maHeal:.015,
 lk:10,                                                   /* Linh Thạch KHOÁ thưởng khi hạ Ngục Chủ (LT.earnKS, cần đăng nhập ☁) */
 gold:8,                                                  /* vàng quái = gP(gold × cấp quái) */
 chest:[{w:58,t:'gold',v:400000},{w:33,t:'gold',v:800000},{w:5,t:'ore',v:150},{w:3,t:'ore',v:300},{w:1,t:'sh',v:1}]
};
var NAMES={tot:'Ngục Tốt',tuong:'Ma Tướng',linh:'Ác Linh Bị Giam',soul:'Oán Hồn',elite:'Oán Linh Tinh Anh',chu:'Ngục Chủ'};
var SH={tot:104,tuong:134,linh:100,soul:46,elite:124,chu:250};   /* chiều cao vẽ (đơn vị) */
var TAU=6.2832;

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return String(n)}}
function say(t,c,l,y){try{DT.push({x:P.x,y:y||200,s:t,c:c||'#ffb070',g:1,l:l||150})}catch(e){}}
function hdao(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function lite(){return (window.QL|0)>=2}
function rn(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function isMa(){try{var i=window.YCANH&&YCANH.info&&YCANH.info();if(i&&i.path)return i.path==='m'}catch(e){}try{return !!(PS[cur].yc&&PS[cur].yc.p==='m')}catch(e){}return false}
function reqOk(){try{if(window.CTHE&&CTHE.on())return true}catch(e){}return P.lv>=CU.req}
function K(){var p=PS[cur];if(!p)return{next:0,n:0,k:0};if(!p.cu9||typeof p.cu9!=='object')p.cu9={next:0,n:0,k:0};return p.cu9}
function left(){var k=K(),n=Date.now(),c=+k.next||0;if(c>n+CU.cd){c=n+CU.cd;k.next=c}return Math.max(0,c-n)}
function fmt(ms){var t=Math.ceil(ms/1000),m=Math.floor(t/60);return m+':'+String(t%60).padStart(2,'0')}
function base(){var c=null;try{c=LGMAP.cfg[4]}catch(e){}return c||{m:4.2,hpn:2.4e6,df:3.6,at:40}}
function lvM(){return Math.max(61,Math.min(100,P.lv|0))}
function xpBase(){return Math.round(15*(1+lvM()/5))}
function xk(){var k=3;try{k=HDAO.cfg.killMul}catch(e){}return k*CU.expMul}
function addXp(v){v=Math.round(v);if(!(v>0))return 0;try{if(typeof XR==='function')v=Math.round(XR(v))}catch(e){}P.xp+=v;return v}

/* ---------- thư viện vẽ sprite (gốc toạ độ = giữa chân, y âm = đi lên) ---------- */
function mk2(w,h,fn){var Z=2,cv=document.createElement('canvas');cv.width=w*Z;cv.height=h*Z;var k=cv.getContext('2d');k.scale(Z,Z);k.translate(w/2,h);fn(k);return cv}
function vg(k,y0,y1,a,b,m){var q=k.createLinearGradient(0,y0,0,y1);q.addColorStop(0,a);if(m)q.addColorStop(.5,m);q.addColorStop(1,b);return q}
function glw(k,x,y,r,rgb,a){k.save();k.globalCompositeOperation='lighter';var q=k.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');k.fillStyle=q;k.beginPath();k.arc(x,y,r,0,TAU);k.fill();k.restore()}
function pl(k,p,f,st,lw){k.beginPath();k.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)k.lineTo(p[i][0],p[i][1]);k.closePath();if(f){k.fillStyle=f;k.fill()}if(st){k.strokeStyle=st;k.lineWidth=lw||1.6;k.lineJoin='round';k.stroke()}}
function chn(k,x1,y1,x2,y2,sag,n,col,lw){k.save();k.strokeStyle=col||'#8a8693';k.lineWidth=lw||1.6;for(var i=0;i<=n;i++){var t=i/n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t+sag*Math.sin(t*Math.PI);k.beginPath();if(i%2)k.ellipse(x,y,1.6,3.3,0,0,TAU);else k.ellipse(x,y,3.3,1.9,0,0,TAU);k.stroke()}k.restore()}
function eye(k,x,y,r,rgb){glw(k,x,y,r*3.2,rgb,.75);k.fillStyle='rgb('+rgb+')';k.beginPath();k.ellipse(x,y,r*1.3,r*.7,0,0,TAU);k.fill()}
function limb(k,pts,w,col,line){k.save();k.lineCap='round';k.lineJoin='round';for(var pass=0;pass<2;pass++){k.lineWidth=pass?w:w+3;k.strokeStyle=pass?col:line;k.beginPath();k.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)k.lineTo(pts[i][0],pts[i][1]);k.stroke()}k.restore()}
function spikes(k,x,y,n,len,sp,col,ang){for(var i=0;i<n;i++){var a=ang+(i-(n-1)/2)*sp,x2=x+Math.sin(a)*len,y2=y-Math.cos(a)*len;pl(k,[[x-3,y],[x2,y2],[x+3,y]],col,'#0a0608',1)}}
var DK='#0b090d';

/* Ngục Tốt: lính canh sắt, giáo rìu + xích bên hông */
function pTot(k){
 var iron=vg(k,-100,-40,'#5b5764','#17151b');
 glw(k,0,-60,62,'255,100,30',.2);
 pl(k,[[-22,0],[-6,0],[-8,-44],[-22,-44]],vg(k,-44,0,'#3a3640','#121014'),DK,1.6);
 pl(k,[[6,0],[24,0],[22,-44],[8,-44]],vg(k,-44,0,'#3a3640','#121014'),DK,1.6);
 pl(k,[[-26,-52],[26,-52],[32,-26],[22,-33],[12,-22],[2,-34],[-8,-23],[-18,-33],[-32,-26]],vg(k,-52,-22,'#5a1818','#1a0607'),DK,1.4);
 chn(k,-22,-48,-40,-26,7,6,'#7a7682');
 pl(k,[[-24,-50],[24,-50],[30,-94],[-30,-94]],iron,DK,1.8);
 k.strokeStyle='rgba(255,140,70,.4)';k.lineWidth=1.2;k.beginPath();k.moveTo(0,-54);k.lineTo(0,-92);k.moveTo(-16,-70);k.lineTo(16,-70);k.stroke();
 k.fillStyle='#9a96a4';[[-20,-60],[20,-60],[-22,-84],[22,-84]].forEach(function(p){k.beginPath();k.arc(p[0],p[1],1.6,0,TAU);k.fill()});
 pl(k,[[-26,-54],[26,-54],[26,-46],[-26,-46]],'#2a1a12',DK,1.2);glw(k,0,-50,8,'255,150,40',.7);
 limb(k,[[-36,-90],[-48,-68],[-40,-52]],8,'#4a4652',DK);
 limb(k,[[36,-90],[46,-72],[43,-58]],8,'#4a4652',DK);
 k.strokeStyle='#3a2a20';k.lineWidth=4;k.beginPath();k.moveTo(44,-14);k.lineTo(47,-126);k.stroke();
 pl(k,[[47,-128],[70,-124],[76,-108],[62,-100],[48,-108]],vg(k,-128,-100,'#d4d0dc','#6a6672'),DK,1.5);
 glw(k,66,-112,12,'255,120,50',.35);
 [-1,1].forEach(function(d){k.fillStyle=vg(k,-106,-86,'#6a6672','#201d25');k.beginPath();k.ellipse(d*34,-94,13,9,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=1.6;k.stroke();pl(k,[[d*30,-100],[d*35,-120],[d*40,-99]],'#8a8794',DK,1.2)});
 k.fillStyle=vg(k,-126,-90,'#6b6774','#1c1a20');k.beginPath();k.ellipse(0,-108,15,17,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=1.8;k.stroke();
 pl(k,[[-3,-124],[0,-140],[3,-124]],'#8a8794',DK,1.2);
 k.fillStyle='#050305';k.fillRect(-11,-111,22,5);eye(k,-5,-108.5,1.6,'255,140,40');eye(k,5,-108.5,1.6,'255,140,40')}

/* Ma Tướng: tướng quỷ sừng, áo choàng đỏ, trọng kiếm dung nham */
function pTuong(k){
 glw(k,0,-80,86,'255,60,30',.26);
 pl(k,[[-36,-110],[36,-110],[58,-6],[20,-22],[0,-8],[-20,-22],[-58,-6]],vg(k,-110,0,'#6a1018','#1a0408'),DK,1.8);
 [-1,1].forEach(function(d){pl(k,[[d*8,0],[d*30,0],[d*27,-18],[d*26,-56],[d*10,-56]],vg(k,-56,0,'#4a2428','#120608'),DK,1.8);pl(k,[[d*20,-40],[d*34,-48],[d*30,-30]],'#a8a0a8',DK,1.2)});
 pl(k,[[-30,-58],[30,-58],[40,-112],[26,-124],[-26,-124],[-40,-112]],vg(k,-124,-58,'#7a1c24','#240a10'),DK,2);
 pl(k,[[-30,-58],[30,-58],[30,-66],[-30,-66]],'#2a1410',DK,1.4);glw(k,0,-62,10,'255,170,60',.8);
 k.strokeStyle='rgba(255,170,80,.5)';k.lineWidth=1.6;k.beginPath();k.moveTo(-14,-80);k.lineTo(-4,-94);k.lineTo(-10,-108);k.moveTo(14,-80);k.lineTo(6,-96);k.lineTo(14,-110);k.stroke();
 [-1,1].forEach(function(d){k.fillStyle=vg(k,-134,-108,'#8a3038','#2a0c12');k.beginPath();k.ellipse(d*42,-118,17,12,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=1.8;k.stroke();spikes(k,d*42,-126,3,16,.5,'#b8b0b6',d*.4)});
 limb(k,[[-44,-116],[-60,-90],[-52,-66]],10,'#5a2028',DK);
 limb(k,[[44,-116],[58,-96],[56,-74]],10,'#5a2028',DK);
 k.save();k.translate(58,-72);k.rotate(-.5);
 pl(k,[[-3,6],[-3,-96],[0,-110],[3,-96],[3,6]],vg(k,-110,6,'#ffd070','#7a2010'),DK,1.4);glw(k,0,-60,22,'255,110,30',.5);
 pl(k,[[-10,-8],[10,-8],[8,-2],[-8,-2]],'#2a1a14',DK,1.2);k.restore();
 k.fillStyle=vg(k,-152,-118,'#8a3038','#2a0c12');k.beginPath();k.ellipse(0,-132,19,21,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=2;k.stroke();
 [-1,1].forEach(function(d){k.fillStyle='#d8d0c8';k.beginPath();k.moveTo(d*14,-146);k.quadraticCurveTo(d*38,-150,d*34,-182);k.quadraticCurveTo(d*24,-160,d*10,-152);k.closePath();k.fill();k.strokeStyle=DK;k.lineWidth=1.2;k.stroke()});
 pl(k,[[-12,-124],[12,-124],[8,-116],[-8,-116]],'#17090c',DK,1);k.fillStyle='#e8e0d0';[-6,-2,2,6].forEach(function(x){pl(k,[[x-1.4,-124],[x,-119],[x+1.4,-124]],'#e8e0d0',null)});
 eye(k,-7,-134,2.2,'255,230,120');eye(k,7,-134,2.2,'255,230,120')}

/* Ác Linh Bị Giam: hồn ma quấn xích, khoá sắt trước ngực */
function pLinh(k){
 glw(k,0,-70,70,'120,230,255',.28);
 k.save();k.beginPath();k.moveTo(-22,-92);k.bezierCurveTo(-30,-60,-26,-30,-14,-12);k.bezierCurveTo(-10,-4,-4,-14,0,-6);k.bezierCurveTo(6,-14,12,-2,16,-12);k.bezierCurveTo(28,-32,30,-62,22,-92);k.bezierCurveTo(14,-112,-14,-112,-22,-92);k.closePath();
 var q=k.createLinearGradient(0,-112,0,-4);q.addColorStop(0,'rgba(220,250,255,.95)');q.addColorStop(.6,'rgba(120,200,230,.7)');q.addColorStop(1,'rgba(60,120,200,0)');k.fillStyle=q;k.fill();k.strokeStyle='rgba(180,240,255,.8)';k.lineWidth=1.4;k.stroke();k.restore();
 limb(k,[[-20,-82],[-40,-72],[-48,-88]],6,'rgba(190,235,250,.9)','rgba(80,150,190,.8)');
 limb(k,[[20,-82],[40,-70],[46,-86]],6,'rgba(190,235,250,.9)','rgba(80,150,190,.8)');
 [[-48,-88],[46,-86]].forEach(function(p){k.strokeStyle='#6a6672';k.lineWidth=3;k.beginPath();k.arc(p[0],p[1],4,0,TAU);k.stroke()});
 chn(k,-48,-88,-60,-112,-6,5,'#8a8693');chn(k,46,-86,58,-112,6,5,'#8a8693');
 k.strokeStyle='#5a5662';k.lineWidth=4.5;k.beginPath();k.ellipse(0,-62,24,6,0,0,TAU);k.stroke();k.beginPath();k.ellipse(0,-44,20,5,0,0,TAU);k.stroke();
 pl(k,[[-8,-58],[8,-58],[8,-46],[-8,-46]],vg(k,-58,-46,'#c8b070','#6a5420'),DK,1.2);k.strokeStyle='#8a8693';k.lineWidth=2.2;k.beginPath();k.arc(0,-58,5,Math.PI,0);k.stroke();
 k.fillStyle='#050a14';k.beginPath();k.ellipse(-8,-94,5,7,.15,0,TAU);k.fill();k.beginPath();k.ellipse(8,-94,5,7,-.15,0,TAU);k.fill();glw(k,-8,-93,7,'160,240,255',.5);glw(k,8,-93,7,'160,240,255',.5);
 k.beginPath();k.ellipse(0,-78,5,8,0,0,TAU);k.fill()}

/* Oán Hồn: đốm hồn nhỏ khóc than */
function pSoul(k){
 glw(k,0,-34,32,'170,150,255',.55);
 k.beginPath();k.moveTo(0,-54);k.bezierCurveTo(-16,-54,-16,-30,-9,-18);k.bezierCurveTo(-6,-10,-2,-14,2,-4);k.bezierCurveTo(4,-12,10,-8,10,-18);k.bezierCurveTo(16,-30,16,-54,0,-54);k.closePath();
 var q=k.createLinearGradient(0,-54,0,-2);q.addColorStop(0,'rgba(230,250,255,.98)');q.addColorStop(.55,'rgba(150,170,255,.85)');q.addColorStop(1,'rgba(110,60,200,.1)');k.fillStyle=q;k.fill();
 k.fillStyle='#120a30';k.beginPath();k.ellipse(-5,-40,2.8,4,.2,0,TAU);k.fill();k.beginPath();k.ellipse(5,-40,2.8,4,-.2,0,TAU);k.fill();k.beginPath();k.ellipse(0,-30,3,4.5,0,0,TAU);k.fill()}

/* Oán Linh Tinh Anh: nhiều oán hồn dồn lại thành một khối oán khí */
function pElite(k){
 glw(k,0,-84,100,'200,60,255',.36);
 [[-46,-30,-.5],[-26,-8,-.2],[0,-4,0],[26,-8,.2],[46,-30,.5]].forEach(function(t){k.strokeStyle='rgba(150,60,210,.75)';k.lineWidth=9;k.lineCap='round';k.beginPath();k.moveTo(t[0]*.4,-66);k.quadraticCurveTo(t[0],-40,t[0]+t[2]*40,t[1]);k.stroke()});
 var q=k.createRadialGradient(0,-92,6,0,-92,56);q.addColorStop(0,'#f0c8ff');q.addColorStop(.55,'#9040c8');q.addColorStop(1,'#2a0a48');k.fillStyle=q;k.beginPath();k.ellipse(0,-92,48,54,0,0,TAU);k.fill();k.strokeStyle='#14061e';k.lineWidth=2.4;k.stroke();
 [[-44,-124,10],[46,-118,9],[-52,-70,8],[52,-66,8]].forEach(function(f){k.fillStyle='rgba(220,200,255,.9)';k.beginPath();k.arc(f[0],f[1],f[2],0,TAU);k.fill();k.fillStyle='#1a0830';k.beginPath();k.arc(f[0]-2.4,f[1]-1,1.8,0,TAU);k.fill();k.beginPath();k.arc(f[0]+2.4,f[1]-1,1.8,0,TAU);k.fill();k.beginPath();k.ellipse(f[0],f[1]+4,2,2.8,0,0,TAU);k.fill()});
 k.fillStyle='#0c0414';k.beginPath();k.moveTo(-30,-104);k.lineTo(-8,-96);k.lineTo(-30,-92);k.closePath();k.fill();k.beginPath();k.moveTo(30,-104);k.lineTo(8,-96);k.lineTo(30,-92);k.closePath();k.fill();
 eye(k,-20,-97,3.2,'255,70,70');eye(k,20,-97,3.2,'255,70,70');
 k.fillStyle='#0c0414';k.beginPath();k.moveTo(-22,-74);for(var i=0;i<=8;i++)k.lineTo(-22+i*5.5,-74+(i%2?-7:5));k.lineTo(22,-72);k.quadraticCurveTo(0,-56,-22,-72);k.closePath();k.fill();
 chn(k,-48,-118,-62,-86,-5,5,'#8a8693');chn(k,48,-118,62,-84,5,5,'#8a8693')}

/* Ngục Chủ: ngục trưởng khổng lồ, mũ sừng, ngực nứt dung nham, chuỳ gai */
function pChu(k){
 glw(k,0,-8,130,'255,80,20',.34);
 pl(k,[[-62,-190],[62,-190],[108,-8],[44,-28],[0,-10],[-44,-28],[-108,-8]],vg(k,-190,0,'#3a0c10','#0a0204'),DK,2);
 [-1,1].forEach(function(d){pl(k,[[d*12,0],[d*56,0],[d*53,-26],[d*48,-96],[d*14,-96]],vg(k,-96,0,'#4a4652','#141217'),DK,2.4);pl(k,[[d*32,-80],[d*56,-92],[d*52,-64]],'#8d8996',DK,1.4);k.fillStyle='#1a1418';k.fillRect(d>0?10:-60,-8,50,8)});
 pl(k,[[-54,-92],[54,-92],[68,-178],[42,-198],[-42,-198],[-68,-178]],vg(k,-198,-92,'#5a5662','#17141a'),DK,2.6);
 k.save();k.lineCap='round';k.strokeStyle='#ff7a20';k.lineWidth=2.4;k.beginPath();k.moveTo(-34,-184);k.lineTo(-24,-160);k.lineTo(-36,-140);k.lineTo(-22,-118);k.moveTo(34,-184);k.lineTo(24,-162);k.lineTo(38,-142);k.lineTo(24,-120);k.stroke();k.restore();
 glw(k,-28,-150,26,'255,110,30',.4);glw(k,30,-152,26,'255,110,30',.4);
 k.fillStyle='#d8d0c4';k.beginPath();k.arc(0,-150,14,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=1.6;k.stroke();k.fillStyle='#14080a';k.beginPath();k.arc(-5,-152,3.4,0,TAU);k.arc(5,-152,3.4,0,TAU);k.fill();k.fillRect(-4,-143,8,5);
 pl(k,[[-56,-106],[56,-106],[56,-90],[-56,-90]],'#2a1a14',DK,1.8);glw(k,0,-98,14,'255,150,40',.6);
 chn(k,-30,-98,-46,-60,10,8,'#9a96a2',2);chn(k,30,-98,48,-56,10,8,'#9a96a2',2);
 [[-48,-70],[48,-66]].forEach(function(p){pl(k,[[p[0]-4,p[1]],[p[0]+4,p[1]],[p[0]+3,p[1]+22],[p[0]-3,p[1]+22]],'#c8b070',DK,1)});
 [-1,1].forEach(function(d){k.fillStyle=vg(k,-214,-170,'#6a6672','#1c1a20');k.beginPath();k.ellipse(d*74,-188,36,24,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=2.2;k.stroke();spikes(k,d*74,-205,4,26,.5,'#a8a4b0',d*.3);chn(k,d*74,-172,d*44,-112,26,10,'#8a8693',2)});
 limb(k,[[-80,-176],[-106,-134],[-98,-92]],17,'#4a4652',DK);k.strokeStyle='#8a8693';k.lineWidth=4;k.beginPath();k.arc(-98,-90,8,0,TAU);k.stroke();chn(k,-98,-84,-104,-40,8,8,'#8a8693',2);
 limb(k,[[80,-176],[108,-154],[114,-128]],17,'#4a4652',DK);
 k.strokeStyle='#2a1c14';k.lineWidth=9;k.lineCap='round';k.beginPath();k.moveTo(114,-92);k.lineTo(118,-250);k.stroke();k.strokeStyle='#5a4030';k.lineWidth=5;k.beginPath();k.moveTo(114,-92);k.lineTo(118,-250);k.stroke();
 glw(k,119,-268,48,'255,100,30',.5);k.fillStyle=vg(k,-296,-240,'#8a8693','#2a2630');k.beginPath();k.arc(119,-268,26,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=2.4;k.stroke();
 for(var a=0;a<10;a++){var an=a/10*TAU;pl(k,[[119+Math.cos(an-.16)*24,-268+Math.sin(an-.16)*24],[119+Math.cos(an)*40,-268+Math.sin(an)*40],[119+Math.cos(an+.16)*24,-268+Math.sin(an+.16)*24]],'#b8b4c0',DK,1.2)}
 k.strokeStyle='#ff7a20';k.lineWidth=2;k.beginPath();k.moveTo(106,-276);k.lineTo(116,-266);k.lineTo(110,-254);k.moveTo(132,-278);k.lineTo(124,-266);k.lineTo(130,-256);k.stroke();
 [-1,1].forEach(function(d){k.strokeStyle='#d8d0c4';k.lineWidth=7;k.lineCap='round';k.beginPath();k.moveTo(d*22,-232);k.quadraticCurveTo(d*60,-246,d*56,-292);k.stroke();k.strokeStyle='#8a8070';k.lineWidth=2;k.beginPath();k.moveTo(d*24,-234);k.quadraticCurveTo(d*58,-246,d*54,-288);k.stroke()});
 k.fillStyle=vg(k,-252,-190,'#6a6672','#17141a');k.beginPath();k.ellipse(0,-222,32,34,0,0,TAU);k.fill();k.strokeStyle=DK;k.lineWidth=2.6;k.stroke();
 pl(k,[[-22,-232],[22,-232],[18,-214],[0,-210],[-18,-214]],'#0a0406',DK,1.2);
 eye(k,-11,-224,3.6,'255,120,40');eye(k,11,-224,3.6,'255,120,40');
 [-1,1].forEach(function(d){pl(k,[[d*12,-206],[d*18,-196],[d*8,-198]],'#e0d8cc',DK,1)});
 k.strokeStyle='rgba(255,140,60,.55)';k.lineWidth=1.4;k.beginPath();k.moveTo(0,-250);k.lineTo(0,-238);k.stroke()}
var PAINT={tot:[100,130,pTot],tuong:[130,176,pTuong],linh:[100,130,pLinh],soul:[50,64,pSoul],elite:[150,170,pElite],chu:[260,300,pChu]};
function spr(t){var o=PAINT[t];if(!o)return null;if(!o[3]){try{o[3]=mk2(o[0],o[1],o[2])}catch(e){o[3]=document.createElement('canvas')}}return o[3]}

/* ---------- nền: hầm lửa đen + xích sắt (phần tĩnh vẽ 1 lần vào canvas đệm, phần động vẽ mỗi khung) ---------- */
var BG={cv:null,key:'',miss:0,no:0,last:0};
function bgStatic(x,gy){
 var u=s,i,q,n,cw,ch,cx,j,bh=26*u,bw=64*u,r=0,xx,yy;
 q=x.createLinearGradient(0,0,0,gy);q.addColorStop(0,'#030103');q.addColorStop(.6,'#12040a');q.addColorStop(1,'#2c0b08');x.fillStyle=q;x.fillRect(0,0,W,gy+2);
 x.strokeStyle='rgba(96,36,28,.26)';x.lineWidth=1;
 for(yy=0;yy<gy;yy+=bh,r++){x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke();for(xx=(r%2)*bw/2;xx<W;xx+=bw){x.beginPath();x.moveTo(xx,yy);x.lineTo(xx,yy+bh);x.stroke()}}
 n=Math.max(2,Math.round(W/(215*u)));cw=112*u;ch=gy*.66;
 for(i=0;i<n;i++){
  cx=(i+.5)*W/n;
  x.save();x.beginPath();x.moveTo(cx-cw/2,gy);x.lineTo(cx-cw/2,gy-ch+cw/2);x.arc(cx,gy-ch+cw/2,cw/2,Math.PI,0);x.lineTo(cx+cw/2,gy);x.closePath();
  q=x.createRadialGradient(cx,gy,4,cx,gy-ch*.4,ch*.8);q.addColorStop(0,'rgba(255,90,24,.40)');q.addColorStop(1,'rgba(20,3,4,.92)');x.fillStyle=q;x.fill();x.clip();
  x.strokeStyle='#1c1418';x.lineWidth=3*u;
  for(j=1;j<5;j++){x.beginPath();x.moveTo(cx-cw/2+j*cw/5,gy-ch);x.lineTo(cx-cw/2+j*cw/5,gy);x.stroke()}
  x.beginPath();x.moveTo(cx-cw/2,gy-ch*.55);x.lineTo(cx+cw/2,gy-ch*.55);x.stroke();
  x.restore();
  x.strokeStyle='#241a1c';x.lineWidth=5*u;x.beginPath();x.moveTo(cx-cw/2,gy);x.lineTo(cx-cw/2,gy-ch+cw/2);x.arc(cx,gy-ch+cw/2,cw/2,Math.PI,0);x.lineTo(cx+cw/2,gy);x.stroke()}
 q=x.createLinearGradient(0,gy,0,H);q.addColorStop(0,'#2e0e08');q.addColorStop(.25,'#150608');q.addColorStop(1,'#060203');x.fillStyle=q;x.fillRect(0,gy,W,H-gy);
 x.lineCap='round';
 for(i=0;i<11;i++){var px=(i*.093+.03+rn(i)*.04)*W,py=gy+(H-gy)*(.14+rn(i+5)*.78);x.strokeStyle='rgba(255,'+(70+rn(i+2)*60|0)+',20,'+(.3+rn(i+9)*.3)+')';x.lineWidth=(1.4+rn(i+4)*1.8)*u;x.beginPath();x.moveTo(px,py);for(j=1;j<5;j++){px+=(rn(i*7+j)-.4)*46*u;py+=(rn(i*3+j)-.5)*14*u;x.lineTo(px,py)}x.stroke()}
 q=x.createLinearGradient(0,gy-8*u,0,gy+34*u);q.addColorStop(0,'rgba(255,90,20,0)');q.addColorStop(.3,'rgba(255,100,30,.42)');q.addColorStop(1,'rgba(255,60,10,0)');x.fillStyle=q;x.fillRect(0,gy-8*u,W,42*u);
 n=Math.max(3,Math.round(W/(130*u)));
 for(i=0;i<n;i++){var hx=(i+.3+rn(i+20)*.5)*W/n,len=(40+rn(i+30)*90)*u,m=Math.round(len/(7*u)),sg=(rn(i+40)-.5)*10*u;x.strokeStyle='#4a444e';x.lineWidth=1.8*u;for(j=0;j<=m;j++){var tt=j/m,lx=hx+sg*Math.sin(tt*Math.PI),ly=tt*len;x.beginPath();if(j%2)x.ellipse(lx,ly,1.7*u,3.4*u,0,0,TAU);else x.ellipse(lx,ly,3.4*u,2*u,0,0,TAU);x.stroke()}}
}
function drawHaz(gy){
 var S=dg.cs,i,h,age,x,R0,u,pu;
 for(i=0;i<S.hz.length;i++){
  h=S.hz[i];age=dg.t-h.t0;x=h.x*s;R0=h.R*s;
  g.save();g.globalCompositeOperation='lighter';
  if(age<h.warn){u=age/h.warn;pu=.5+.5*Math.sin(fr*(.22+u*.4));
   g.strokeStyle='rgba(255,170,90,'+(.3+.5*pu)+')';g.lineWidth=2.4*s;g.beginPath();g.ellipse(x,gy,R0,R0*.28,0,0,TAU);g.stroke();
   g.beginPath();g.ellipse(x,gy,R0*(1-u),R0*.28*(1-u),0,0,TAU);g.stroke();
   g.fillStyle='rgba(255,90,30,'+(.08+.2*u)+')';g.beginPath();g.ellipse(x,gy,R0,R0*.28,0,0,TAU);g.fill();
   g.strokeStyle='rgba(190,180,200,'+(.2+.3*u)+')';g.lineWidth=2*s;g.setLineDash([5*s,5*s]);g.beginPath();g.moveTo(x,0);g.lineTo(x,gy);g.stroke();g.setLineDash([])}
  else{u=(age-h.warn)/22;var al=Math.max(0,1-u),q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,'rgba(255,200,120,0)');q.addColorStop(1,'rgba(255,230,190,'+al+')');
   g.fillStyle=q;g.fillRect(x-R0*.3*(1-u*.5),0,R0*.6*(1-u*.5),gy);g.strokeStyle='rgba(255,230,190,'+al+')';g.lineWidth=3*s*al;g.beginPath();g.ellipse(x,gy,R0*(.5+u),R0*.28*(.5+u),0,0,TAU);g.stroke()}
  g.restore()}
}
function paintBg(gy){
 var dp=(typeof DPR==='number'&&DPR>0)?DPR:1,key=W+'|'+H+'|'+gy+'|'+s+'|'+dp,x,i,t=fr,n;
 if(!BG.no&&(!BG.cv||BG.key!==key)){
  if(t-BG.last>120)BG.miss=0;BG.last=t;
  if(++BG.miss>12){BG.no=1;BG.cv=null}
  else try{if(!BG.cv)BG.cv=document.createElement('canvas');if(BG.cv.width!==c.width)BG.cv.width=c.width;if(BG.cv.height!==c.height)BG.cv.height=c.height;
   x=BG.cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,BG.cv.width,BG.cv.height);x.setTransform(dp,0,0,dp,0,0);bgStatic(x,gy);BG.key=key}catch(e){BG.no=1;BG.cv=null}}
 if(BG.cv&&!BG.no&&BG.key===key){g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(BG.cv,0,0);g.restore()}
 else{try{bgStatic(g,gy)}catch(e){}}
 g.save();g.globalCompositeOperation='lighter';
 g.fillStyle='rgba(255,90,24,'+(.07+.04*Math.sin(t*.07))+')';g.fillRect(0,gy-4*s,W,22*s);
 n=lite()?10:22;
 for(i=0;i<n;i++){var sp=.4+rn(i+3)*.7,y=gy+(H-gy)*.6-((t*sp+rn(i+7)*400)%(gy*1.1)),ex=rn(i)*W+Math.sin(t*.03+i)*12*s;g.fillStyle='rgba(255,'+(110+rn(i+2)*90|0)+',50,'+(.25+.45*rn(i+11))+')';g.fillRect(ex,y,(1.6+rn(i+5)*1.6)*s,(1.6+rn(i+5)*1.6)*s)}
 g.restore();
 try{drawHaz(gy)}catch(e){}
}
var _bgd=bgd;
bgd=function(gy){if(!(dg&&dg.cu))return _bgd.apply(this,arguments);paintBg(gy)};

/* ---------- tạo quái / oán hồn ---------- */
function mkMon(type,x,hk){
 var B=base(),L=lvM(),boss=type==='chu',fly=type==='linh'||type==='elite',hp=B.hpn*CU.hpK[type]*(hk||1),
  df=(8+L*2.2)*(1+B.m*.4)*CU.dfK[type]*B.df,m=((1+.35*B.m)*B.at*CU.atK[type]-1)/.35;
 var e={dg:1,cu:type,k:boss?'boss':fly?'fly':'run',sp:boss?'boss':'impA',x:x,y:fly?120+R()*60:0,vx:0,vy:0,hp:hp,max:hp,df:df,b:boss?4:0,m:m,lv:L,cd:30+R()*50,sl:0,fl:0,in:boss?70:0,hh:boss?250:90,rg:boss?190:60,sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:0};
 if(boss){e.nm='⛓ Ngục Chủ';e.big=270;e.gc=['#5a0c08','#ff6a20']}
 E.push(e);return e}
function mkSoul(x,gid,i,n){
 var a=i/n*TAU;
 E.push({dg:1,cu:'soul',k:'fly',sp:'impA',g:gid,x:x,y:80,vx:0,vy:0,hp:1,max:1,df:0,b:0,m:0,lv:1,cd:9999,sl:0,fl:0,in:0,hh:90,rg:0,sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:1,
  ax:cl(x,60,vw()-60),ar:46+R()*44,aw:(R()<.5?-1:1)*(.03+R()*.03),aa:a})}
function newGroup(x,n,boss){
 var S=dg.cs,ma=isMa(),G={id:++S.sid,t0:dg.t,life:CU.life+(ma?CU.maLife:0),n0:n,x:x,ma:ma},i;
 S.groups.push(G);S.gm[G.id]=G;for(i=0;i<n;i++)mkSoul(x,G.id,i,n);
 if(dg.t-(S.lastSay||-999)>150){S.lastSay=dg.t;say('👻 Oán hồn! Diệt hết trong '+Math.round(G.life/60)+' giây'+(ma?' (🌑 hấp hồn)':''),'#c8e8ff',110,215)}
 return G}
function ringFx(x,rgb,big){FX.push({x:x,l:26,m:26,fn:function(f,p,X,gy){g.save();g.translate(X,gy-30*s);g.scale(s,s*.55);g.strokeStyle='rgba('+rgb+','+(1-p)+')';g.lineWidth=5*(1-p)+1;g.beginPath();g.arc(0,0,(big?70:40)+p*(big?150:90),0,TAU);g.stroke();g.restore()}});
 for(var i=0;i<12;i++)PT.push({x:x+(R()-.5)*40,y:40+R()*60,vx:(R()-.5)*5,vy:-R()*3,l:32,c:'rgb('+rgb+')'})}
function clearGroup(G){
 var S=dg.cs,v=xpBase()*xk()*CU.clearK*G.n0*(G.ma?CU.maK:1),got=addXp(v);
 S.cleared++;delete S.gm[G.id];
 say('✨ Tịnh hóa '+G.n0+' oán hồn · +'+nf(got)+' Đạo Linh'+(G.ma?' 🌑':''),G.ma?'#e0a0ff':'#9ff0ff',170,235);
 ringFx(G.x,G.ma?'210,140,255':'140,230,255',false)}
function mergeGroup(G){
 var S=dg.cs,i,e,n=0,sx=0;delete S.gm[G.id];
 for(i=E.length-1;i>=0;i--){e=E[i];if(e&&e.cu==='soul'&&e.g===G.id){n++;sx+=e.x;E.splice(i,1)}}
 if(!n)return;
 var t=mkMon('elite',cl(sx/n,60,vw()-60),1+.4*(n-1));t.nm=NAMES.elite;t.y=100;S.merged++;
 say('💀 Oán hồn hợp thể thành TINH ANH!','#ff9aff',170,235);ringFx(t.x,'230,90,255',true)}
function spawnNext(){
 var S=dg.cs,t=CU.seq[S.spawned%CU.seq.length],x=(P.x>vw()*.55?-60:vw()+60)+(R()<.5?-1:1)*R()*50;
 S.spawned++;mkMon(t,x);
 if(t==='tuong')say('⚔️ Ma Tướng xuất hiện!','#ff9a70',110,215)}
function summon(e){newGroup(cl(e.x,90,vw()-90),5,true);say('👻 Ngục Chủ triệu oán hồn!','#d0b0ff',140,250);ringFx(e.x,'200,150,255',true)}

/* ---------- AI: oán hồn bay vòng; boss thêm Xích Sắt Trấn Hồn + triệu hồn ---------- */
function soulAI(e){
 e.ph+=.3;e.aa+=e.aw;
 if(Math.abs(P.x-e.ax)<110)e.ax=cl(e.ax+Math.sign(e.ax-P.x||1)*.9,60,vw()-60);
 var tx=e.ax+Math.cos(e.aa)*e.ar,ty=70+Math.sin(e.aa*1.3)*34+e.o*20;
 e.x+=(tx-e.x)*.12;e.y+=(ty-e.y)*.12;e.hh=e.y+70;e.mv=1;e.sl=e.fl=0}
function bossSkills(e){
 var S=dg.cs,en=e.hp<e.max*.5,r=e.hp/e.max,xs;
 e.ck=(e.ck|0)+1;
 if(e.ck>=(en?250:380)&&S.hz.length<4){e.ck=0;xs=en?[P.x-150,P.x,P.x+150]:[P.x,P.x+(R()<.5?-130:130)];
  xs.forEach(function(x){S.hz.push({x:cl(x,50,vw()-50),t0:dg.t,warn:66,R:78,src:e})});say('⛓ Xích Sắt Trấn Hồn!','#ffb070',80,260)}
 if(r<.7&&!(e.sm&1)){e.sm=(e.sm|0)|1;summon(e)}
 if(r<.35&&!(e.sm&2)){e.sm=(e.sm|0)|2;summon(e)}}
var _ai=dgAI;
dgAI=function(e){
 if(e&&e.cu==='soul'){soulAI(e);return}
 var r=_ai.apply(this,arguments);
 if(e&&e.cu==='chu'&&e.in<=0&&dg&&dg.cu)bossSkills(e);
 return r};

/* ---------- vòng đời trận ---------- */
function newState(){return{spawned:0,killed:0,sid:0,groups:[],gm:{},pend:[],hz:[],souls:0,elites:0,cleared:0,merged:0,boss:0,done:0,out:0}}
function enter(){
 try{if(typeof bo!=='undefined'&&bo&&typeof tg==='function')tg()}catch(e){}
 try{bo=0;bag.style.display='none'}catch(e){}
 try{if(LCT.on())LCT.off()}catch(e){}
 vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 dg={t:0,n:20,kill:20,cu:1,cs:newState()};
 BG.miss=0;BG.no=0;
 say('⛓ Vào Cửu U Luyện Ngục · diệt oán hồn trong 5 giây!','#ffb070',170)}
function exit(){mtExit();try{LCT.enter()}catch(e){}}
function win(){
 var S=dg.cs,i;S.hz.length=0;S.groups.length=0;S.gm={};
 for(i=E.length-1;i>=0;i--)if(E[i]&&E[i].cu==='soul')E.splice(i,1);
 K().k=(K().k|0)+1;try{QE('boss');QE('dg')}catch(e){}try{sv()}catch(e){}
 try{if(CU.lk>0&&window.LT&&LT.earnKS){LT.earnKS(CU.lk);say('🔒 +'+CU.lk+' 💎 Linh Thạch khoá','#9fd8ff',220,265)}}catch(e){}
 say('🏆 Hạ Ngục Chủ · Cửu U Luyện Ngục!','#ffd890',220,230)}
var _tick=dgTick;
dgTick=function(){
 if(!dg||!dg.cu)return _tick.apply(this,arguments);
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 var S=dg.cs,i,e,h,age,mobs=0,elites=0,souls=0,cnt={},G,n;
 while(S.pend.length){h=S.pend.shift();newGroup(h.x,h.n,false)}
 for(i=0;i<E.length;i++){e=E[i];if(!e||!e.cu)continue;
  if(e.cu==='soul'){souls++;cnt[e.g]=(cnt[e.g]|0)+1}else if(e.cu!=='chu'){mobs++;if(e.cu==='elite')elites++}}
 S.souls=souls;S.elites=elites;
 if(!S.boss&&S.spawned<CU.total&&dg.t>60&&mobs<CU.cap&&dg.t%CU.gap===0)spawnNext();
 for(i=S.groups.length-1;i>=0;i--){G=S.groups[i];n=cnt[G.id]|0;
  if(!n){S.groups.splice(i,1);if(!S.done)clearGroup(G)}
  else if(dg.t-G.t0>=G.life){S.groups.splice(i,1);if(!S.done)mergeGroup(G)}}
 for(i=S.hz.length-1;i>=0;i--){h=S.hz[i];age=dg.t-h.t0;
  if(!h.hit&&age>=h.warn){h.hit=1;try{if(Math.abs(P.x-h.x)<h.R&&(P.y||0)<70&&h.src&&h.src.hp>0)dgHurt(h.src,1.15)}catch(x){}try{dgFl=6}catch(x){}}
  if(age>h.warn+22)S.hz.splice(i,1)}
 if(!S.boss&&S.spawned>=CU.total&&!mobs&&!souls&&!S.pend.length){S.boss=1;mkMon('chu',vw()+150);say('👹 Ngục Chủ xuất hiện!','#ff8a50',160,230)}
 else if(S.boss&&!S.done&&!E.some(function(q){return q.cu==='chu'})){S.done=1;S.out=300;win()}
 if(S.done&&--S.out<=0)exit()};

/* ---------- phần thưởng: quái rơi ít vàng + EXP thêm, Boss rơi rương ngẫu nhiên (KHÔNG trang bị) ---------- */
function pickChest(){var t=0,i,r;for(i=0;i<CU.chest.length;i++)t+=CU.chest[i].w;r=R()*t;for(i=0;i<CU.chest.length;i++){r-=CU.chest[i].w;if(r<0)return CU.chest[i]}return CU.chest[0]}
function openChest(e){
 var c=pickChest(),x=e&&e.x||P.x,L='🎁 Rương Cửu U: ',m,col='#ffe27a',ok;
 if(c.t==='gold'){gold+=c.v;m=L+'+'+nf(c.v)+' 💰'}
 else if(c.t==='ore'){ok=false;try{var S=MN.get();S.fe=(S.fe|0)+c.v;S.hk=(S.hk|0)+c.v;ok=true}catch(x2){}
  m=ok?L+'+'+nf(c.v)+' 🔩 Quặng Sắt · +'+nf(c.v)+' 🌑 Huyền Kim':L+'(không nhận được quặng)';col='#bff4ff'}
 else{ok=false;try{HL.addSH(c.v);ok=true}catch(x3){}m=ok?L+'+'+c.v+' 💠 Mảnh Thánh!!!':L+'(không nhận được Mảnh Thánh)';col='#ff9aff'}
 DT.push({x:x,y:150,s:m,c:col,g:1,l:240});try{sv()}catch(x4){}}
var _drop=drop;
drop=function(e){
 if(!e||!e.cu)return _drop.apply(this,arguments);
 if(!dg||!dg.cu)return;
 var S=dg.cs,p;
 if(e.cu==='soul'){if(isMa()){P.hp=Math.min(mx(),P.hp+mx()*CU.maHeal);ringFx(e.x,'190,120,255',false)}return}
 if(e.cu==='chu'){openChest(e);return}
 S.killed++;gold+=gP(CU.gold*e.lv);
 if(e.cu==='tuong')addXp(xpBase()*xk()*(CU.tuongK-1));
 else if(e.cu==='elite')addXp(xpBase()*xk()*(CU.eliteK-1));
 p=CU.soulP[e.cu];
 if(p&&R()<p&&S.souls+S.pend.length*2<CU.soulCap&&S.elites<CU.eliteCap&&!S.boss)S.pend.push({x:e.x,n:CU.soulN[e.cu]||1})};

/* Đạo Thể chỉ nhận Đạo Linh ở bản đồ Đạo Thể: mở cho dg.cu để HDAO.xg() cộng EXP kill như Linh Giới 5 (không nhân đôi: engine cộng EXP gốc, module cộng phần thêm) */
if(window.LGMAP){var _eo=LGMAP.expOk,_em=LGMAP.expMul;
 LGMAP.expOk=function(){try{if(dg&&dg.cu)return true}catch(e){}return _eo.apply(this,arguments)};
 LGMAP.expMul=function(){try{if(dg&&dg.cu)return CU.expMul}catch(e){}return _em.apply(this,arguments)}}

/* ---------- vẽ quái ---------- */
function pose(e){
 var r={rot:0,sx:1,sy:1,ox:0,oy:0},st=e.st,u,q,f;
 if(e.cu==='chu'){
  if(e.mv&&st==0){r.oy=-Math.abs(Math.sin(e.ph))*6;r.sy=1+.025*Math.sin(e.ph*2);r.rot=-.03*Math.sin(e.ph)}else r.sy=1+.012*Math.sin(fr*.08);
  if(st==1){u=1-e.tm/26;q=1-(1-u)*(1-u);r.rot=.32*q;r.sy=1+.04*q;r.ox=10*q}
  else if(st==2){u=1-e.tm/9;r.rot=.32-.78*u*u;r.ox=10-38*u;r.sy=1-.04*u}
  else if(st==4){u=e.tm/22;r.rot=-.46*u;r.ox=-28*u;r.sy=1-.03*u}
  else if(st==3){u=1-e.tm/44;r.sy=u<.1?.88:1+.1*Math.sin(u*Math.PI);r.rot=-.14*Math.sin(u*Math.PI)}
 }else if(e.cu==='soul'){r.sx=1+.08*Math.sin(e.ph*1.6);r.sy=1-.05*Math.sin(e.ph*1.6);r.rot=Math.sin(e.aa*2)*.12}
 else if(e.k==='fly'){f=Math.sin(e.ph*1.7);r.sx=1+.09*f;r.sy=1-.05*f;r.rot=cl(e.vx*.05,-.45,.45);r.oy=Math.sin(e.ph*1.2)*3;if(e.st==2)r.rot=cl(e.vx*.07,-.7,.7)}
 else{f=Math.abs(Math.sin(e.ph));r.rot=(Math.sign(P.x-e.x)||1)*.12;if(st==0){r.oy=-f*7;r.sy=1+.04*Math.cos(e.ph*2)}else if(st==1){r.sy=.85;r.sx=1.1}else{r.rot=(Math.sign(P.x-e.x)||1)*(.5-e.vy*.05);r.sy=1.12}}
 return r}
function drawCu(e){
 var T=e.cu,im=spr(T),HH,w,dir,X,po,y,bw,nm,bs=T==='chu',S=dg&&dg.cs,G;
 if(!im||!im.width)return;
 HH=bs?(e.big||250):SH[T];w=im.width/im.height*HH;dir=Math.sign(P.x-e.x)||1;X=(e.x-cam)*s;po=pose(e);
 g.save();g.globalAlpha=1;
 if(T!=='soul'){g.fillStyle='rgba(0,0,0,'+(.35-Math.min(.25,e.y/500)).toFixed(2)+')';g.beginPath();g.ellipse(X,GY+2,w*SZ*s*.3*(1-Math.min(.5,e.y/400)),6*s,0,0,TAU);g.fill()}
 if(bs&&e.in>0)g.globalAlpha=cl(1-e.in/80,.15,1);
 g.translate(X+po.ox*s*SZ,GY-e.y*s+po.oy*s);g.scale(s*SZ,s*SZ);if(T!=='soul')g.scale(dir,1);g.rotate(po.rot);g.scale(po.sx,po.sy);
 g.drawImage(im,-w/2,-HH,w,HH);
 if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(im,-w/2,-HH,w,HH)}
 g.restore();
 y=GY-(e.y+HH*SZ+10)*s;
 if(T==='soul'){
  G=S&&S.gm[e.g];
  if(G){var fr_=cl(1-(dg.t-G.t0)/G.life,0,1),cx=X,cy=GY-(e.y+30)*s;g.save();g.lineCap='round';g.lineWidth=3*s;g.strokeStyle='rgba(0,0,0,.55)';g.beginPath();g.arc(cx,cy,17*s,0,TAU);g.stroke();
   g.strokeStyle=fr_>.4?(G.ma?'#e0a0ff':'#9ff0ff'):'#ff7a6a';g.beginPath();g.arc(cx,cy,17*s,-Math.PI/2,-Math.PI/2+TAU*fr_);g.stroke();g.restore()}
  return}
 bw=(bs?110:46)*s;g.save();g.font='bold '+(bs?14:11)*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';
 nm=(window.NHX?NHX.ic(e):'')+(bs?(e.nm||NAMES.chu):(e.nm||NAMES[T]))+' Lv'+e.lv;g.strokeText(nm,X,y-6*s);g.fillStyle=bs?'#ffb070':T==='elite'?'#f0b0ff':T==='tuong'?'#ffb8a0':'#fff';g.fillText(nm,X,y-6*s);
 g.fillStyle='#000a';g.fillRect(X-bw/2,y,bw,5*s);g.fillStyle=bs?'#e03030':T==='elite'?'#b050e0':'#e8c040';g.fillRect(X-bw/2,y,bw*cl(e.hp/e.max,0,1),5*s);g.restore()}
var _foeD=dgFoe;
dgFoe=function(e){if(!e||!e.cu)return _foeD.apply(this,arguments);drawCu(e)};

/* ---------- HUD + nút rời trận ---------- */
var _hud=dgHud;
dgHud=function(){
 _hud.apply(this,arguments);
 try{
  if(!(dg&&dg.cu)||!dg.cs)return;
  var S=dg.cs,b=E.find(function(e){return e.cu==='chu'}),h,best=null,i,G,rem,sec;
  h='<div class="dgt" style="color:#ffa060">⛓ Cửu U Luyện Ngục · '+(S.boss?'👹 Ngục Chủ':'Quái '+Math.min(S.killed,CU.total)+'/'+CU.total)+(isMa()?' · 🌑 Ma Đạo':'')+'</div>';
  for(i=0;i<S.groups.length;i++){G=S.groups[i];rem=G.life-(dg.t-G.t0);if(!best||rem<best.rem)best={G:G,rem:rem}}
  if(best){sec=Math.max(0,best.rem/60);h+='<div class="dgt" style="color:'+(sec>2?'#bfe8ff':'#ff8a7a')+'">👻 Oán hồn · ⏳ '+sec.toFixed(1)+'s</div>'}
  if(b)h+='<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>';
  dgh.innerHTML=h}catch(e){}};
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){
 if(dg&&dg.cu){ev.stopPropagation();if(!started)return;gcf('Rời Cửu U Luyện Ngục?\nLượt này sẽ mất (hồi chiêu vẫn tính).',exit);return}
 return _dp.call(this,ev)}}catch(e){}

/* ---------- vào phụ bản ---------- */
function status(){
 if(!hdao())return{txt:'☯ Chỉ nhân vật Đạo Thể mới được vào',col:'#ff9a9a'};
 if(CU.onlyMa&&!isMa())return{txt:'🌑 Chỉ Đạo Thể theo Ma Đạo (Ý Cảnh) mới được vào',col:'#ff9a9a'};
 if(!reqOk())return{txt:'🔒 Cần Đạo Cảnh Lv'+CU.req+' (hiện Lv'+P.lv+')',col:'#ff9a9a'};
 if(left()>0)return{txt:'⏳ Vào lại sau '+fmt(left()),col:'#ffd98a'};
 return{txt:'✅ Sẵn sàng · chạm để vào'+(isMa()?' · 🌑 Ma Đạo hấp hồn':''),col:'#9dffa0'}}
function canEnter(){
 if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return'Không thể vào lúc này';
 if(!hdao())return'☯ Cửu U Luyện Ngục chỉ dành cho nhân vật Đạo Thể (đã Hợp Đạo)';
 if(CU.onlyMa&&!isMa())return'🌑 Cửu U Luyện Ngục chỉ dành cho Đạo Thể theo Ma Đạo';
 if(!reqOk())return'🔒 Cần Đạo Cảnh Lv'+CU.req+' để vào Cửu U Luyện Ngục (hiện Lv'+P.lv+')';
 if(left()>0)return'⏳ Cửu U Luyện Ngục hồi chiêu '+fmt(left());
 return true}
function go(){var k=K();k.next=Date.now()+CU.cd;k.n=(k.n|0)+1;try{sv()}catch(e){}enter()}
function ask(){
 var r=canEnter();if(r!==true){say(r,'#ffd98a',160);return}
 gcf('Vào CỬU U LUYỆN NGỤC?\nQuái chết có thể để lại oán hồn: diệt hết trong '+Math.round(CU.life/60)+' giây để nhận thêm Đạo Linh, bỏ mặc thì hợp thể thành Tinh Anh.'+(isMa()?'\n🌑 Ma Đạo: hấp hồn (thêm thời gian, thêm Đạo Linh, hồi máu).':'')+'\nBoss cuối Ngục Chủ rơi Rương ngẫu nhiên (không rơi trang bị). Hồi chiêu '+Math.round(CU.cd/60000)+' phút.',go)}
function html(card){
 return card(5,'#ff7a3a','⛓','5. Cửu U Luyện Ngục','<b>Chỉ Đạo Thể</b> (Đạo Cảnh Lv'+CU.req+') · hầm lửa đen &amp; xích sắt: Ngục Tốt, Ma Tướng, Ác Linh Bị Giam · quái chết để lại <b>oán hồn</b>: diệt hết trong <b>'+Math.round(CU.life/60)+' giây</b> để nhận thêm <b>Đạo Linh</b>, bỏ mặc thì hợp thể thành <b>Tinh Anh</b> · hợp <b>Ma Đạo</b> (hấp hồn) · Boss <b>Ngục Chủ</b> rơi <b>Rương ngẫu nhiên</b> (không rơi trang bị) · vào lại sau '+Math.round(CU.cd/60000)+' phút')}

/* ---------- lối tắt "cạnh Linh Giới": thẻ trong bảng Bản đồ Linh Giới + dòng trong tab 🗺 Bản đồ ---------- */
function inject(){
 try{
  var ov=document.getElementById('lgm-ov');if(!ov||ov.style.display==='none'||ov.querySelector('#cu-card'))return;
  var btn=ov.querySelector('[data-x]');if(!btn||!btn.parentNode)return;
  var st=status(),d=document.createElement('div');d.id='cu-card';
  d.style.cssText='display:flex;gap:10px;align-items:center;border:2px solid #ff7a3a;border-radius:12px;padding:9px;margin:7px 0;background:#140d0a;cursor:pointer';
  d.innerHTML='<div style="font-size:30px;width:38px;text-align:center">⛓</div><div style="flex:1"><b style="color:#ff8a4a">Cửu U Luyện Ngục</b><div style="font-size:12px;opacity:.85">Phụ bản Đạo Thể · oán hồn · Boss Ngục Chủ · rơi Rương (không trang bị)</div><div style="font-size:12.5px;margin-top:3px;font-weight:bold;color:'+st.col+'">'+st.txt+'</div></div>';
  d.addEventListener('click',function(){try{LGMAP.close()}catch(e){}ask()});
  btn.parentNode.insertBefore(d,btn)}catch(e){}}
try{var g0=LCT.gates&&LCT.gates[0];if(g0&&typeof g0.go==='function'){var _g0=g0.go;g0.go=function(){var r=_g0.apply(this,arguments);inject();return r}}}catch(e){}
try{if(window.LGMAP&&typeof LGMAP.open==='function'){var _lo=LGMAP.open;LGMAP.open=function(){var r=_lo.apply(this,arguments);inject();return r}}}catch(e){}
try{if(typeof lgUI==='function'){var _lu=lgUI;lgUI=function(){var h=_lu.apply(this,arguments);
 try{if(!hdao()||typeof h!=='string')return h;return h+'<div class="st" style="margin:6px 0 4px"><button style="width:100%;text-align:left" onclick="CUNGUC.ask()">⛓ Cửu U Luyện Ngục · phụ bản Đạo Thể · '+status().txt+'</button></div>'}catch(e){return h}}}}catch(e){}

window.CUNGUC={cfg:CU,ask:ask,enter:enter,exit:exit,status:status,canEnter:canEnter,html:html,left:left,isMa:isMa,spr:spr,data:K};
})();
