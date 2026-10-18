/* ===== ⚔️ CƠ CHẾ KỸ NĂNG RIÊNG TỪNG MÔN PHÁI (world/99-mon-phai-co-che-rieng.js) =====
 * Trước đây 6 môn phái dùng chung các "kiểu chiêu" (bắn · nổ · lướt · quét · vùng · triệu hồi) và chỉ khác số liệu/hiệu ứng.
 * Nay mỗi môn có BỘ CƠ CHẾ RIÊNG, viết một lần, chạy ở cả hai nơi:
 *   • bản đồ thường (world/72 fire → MPK.run, adapter 1 chiều x) · • Thành/Map Tiên Giới (world/81 doSect → MPK.run, adapter 2.5D).
 * Chỉ các kỹ năng có cờ `mk:1` trong SPEC (world/72) đi qua đây; Huyết Ảnh Truy Hồn · Ma Liêm Đoạt Mệnh · Kim Giáp Cổ giữ nguyên (vốn đã độc nhất).
 *
 *  U MINH MA TÔNG  — HUYẾT · HỒN · SÁT: hút máu, phân thân nổ chậm, bóng ma ám sát, kết liễu.
 *  HUYỀN BĂNG ĐIỆN — HÀN KHÍ → VỠ BĂNG: mỗi chiêu tích Hàn Khí; đủ 5 tầng (hoặc hết đóng băng) thì Vỡ Băng nổ lan.
 *  PHẦN THIÊN CỐC  — THIÊU ĐỐT → DẪN BẠO: tích tầng Thiêu (DoT); Liệt Diễm Bạo Phát kích nổ tầng; phượng hoàng hồi sinh.
 *  THIÊN KIẾM TÔNG — KIẾM Ý: kiếm khí nảy chuyền, phi kiếm tự truy kích, kiếm bộ cộng dồn Kiếm Ý, nhất kiếm diệt đầu não, kiếm trận tăng dần.
 *  VẠN ĐỘC MÔN     — ĐỘC LAN: tầng Độc (DoT), độc châm rải nhiều mục tiêu, kích độc nổ, độc xà săn mồi, độc vực kết thúc bằng Độc Phát.
 *  NGỰ CỔ THÁNH ĐIỆN — CỔ TRÙNG TRIỆU HỒI: cổ bám đổi mục tiêu, cổ độc tăng sát thương nhận, Cổ Vương đập + choáng, triều cổ lan vòng + Cổ Tử nổ.
 *
 * Adapter A (do world/72 và world/81 dựng cho từng lần tung chiêu): k (môn) · now() · tgt() · list({k:'line'|'near'|'cone',…}) · cen(at,D) / here() / ctr(h) / listAt(token,r)
 *   · hit(h,mul,o) · status(h,{sl,stn,frz,brn,psn,prc}) · later(n,fn) · heal(f) · shield(f,s) · dodge(n) · dash(h) · say(t,c) · info(h) · tag(h) · grp(summon) · ur(r).
 * Chỉnh: MPK.CF.enable=false (kỹ năng mk:1 về hiệu ứng "aoe" cũ không gây sát thương — không khuyến nghị). Cân bằng: sửa mul/cd trong SPEC (world/72). */
(function(){
'use strict';
var K=window.MPK={buff:{},CF:{enable:true}},SKL={};
function H(A,h,m,o){if(!h||h.hp<=0)return;var t=A.tag(h);if(t.vu>A.now())m*=1.2;A.hit(h,m*(A.B||1),o)}
/* tầng DoT chung: key = 'bn' (Thiêu) | 'ps' (Độc) | … ; mỗi nhịp gây per×tầng */
function stack(A,h,key,n,cap,per,every,dur,st){var t=A.tag(h),now=A.now();if((t[key+'u']|0)<now)t[key]=0;t[key]=Math.min(cap,(t[key]|0)+n);t[key+'u']=now+dur;if(st)A.status(h,st);
 if(t[key+'l'])return;t[key+'l']=1;(function tick(){if(h.hp<=0||A.now()>=t[key+'u']||!t[key]){t[key]=0;t[key+'l']=0;return}H(A,h,per*t[key],{dot:1});A.later(every,tick)})()}
function burn(A,h,n){stack(A,h,'bn',n||1,5,.04,30,240,{brn:1})}
function pois(A,h,n){stack(A,h,'ps',n||1,10,.03,30,300,{psn:1})}
function cold(A,h,n){var t=A.tag(h),now=A.now();if((t.cdu|0)<now)t.cd=0;t.cd=(t.cd|0)+n;t.cdu=now+480;if(t.cd>=5){t.cd=0;shatter(A,h,1)}}
function shatter(A,h,k){A.say('❄ Vỡ Băng','#bff4ff');A.listAt(A.ctr(h),95).forEach(function(x){H(A,x,.9*k);A.status(x,{sl:90})})}
function ticks(s,d){return Math.max(1,Math.round((s.dur||d)*60/(s.every||30)))}
function pick(L,i){return L.length?L[i%L.length]:null}
function boss(A,h){try{return !!A.info(h).boss}catch(e){return false}}

/* ============================ U MINH MA TÔNG ============================ */
SKL.umt1=function(A,s){   /* Ảnh Nhận Trảm: 3 nhát huyết liêm, mỗi nhát hút máu */
 for(var q=0;q<3;q++)A.later(q*6,function(){var e=A.tgt();if(!e)return;H(A,e,s.mul/3);A.heal(.012)})};
SKL.umt2=function(A,s){   /* U Minh Độn: lướt xuyên + để lại Ám Ảnh nổ sau 1,3 giây */
 var e=A.tgt();if(!e)return;var home=A.here();A.dodge(s.dodge||120);A.dash(e);H(A,e,s.mul*.55);A.say('💨 Ám Ảnh','#c070ff');
 A.later(78,function(){var L=A.listAt(home,150);L.forEach(function(x){H(A,x,s.mul*.45);A.status(x,{sl:60})});if(L.length)A.heal(.02)})};
SKL.umt5=function(A,s){   /* Cửu U Đoạt Hồn: 3 phân thân/nhịp, mỗi bóng đánh 1 mục tiêu khác nhau; nhịp cuối kết liễu kẻ yếu */
 var n=ticks(s,5),per=s.mul/(n*3);
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||15),function(){A.grp(false);var L=A.list({k:'near',r:A.ur(s.r)});if(!L.length)return;
  for(var c=0;c<3;c++){var e=pick(L,k+c);H(A,e,per);if(c===0&&k%4===0)A.heal(.006)}
  if(k===n)L.forEach(function(e){var i=A.info(e);if(e.hp>0&&e.hp<i.max*.25)H(A,e,s.mul*.1)})})})(k)};
/* ============================ HUYỀN BĂNG ĐIỆN ============================ */
SKL.hbd1=function(A,s){   /* Hàn Băng Chỉ: băng châm tích Hàn Khí; đã ≥3 tầng thì mạnh hơn và đóng băng ngắn */
 var e=A.tgt();if(!e)return;var c=(A.tag(e).cd|0)>=3;H(A,e,s.mul*(c?1.25:1));A.status(e,{sl:s.sl||120});if(c&&!boss(A,e))A.status(e,{stn:45});cold(A,e,1)};
SKL.hbd2=function(A,s){   /* Băng Tinh Phá: 3 đợt gai băng nối nhau, mỗi đợt +1 Hàn Khí */
 var e=A.tgt(),cen=A.cen('tgt',150);
 for(var w=0;w<3;w++)A.later(w*9,function(){A.listAt(cen,s.r||150).forEach(function(x){H(A,x,s.mul/3);A.status(x,{sl:100});cold(A,x,1)})})};
SKL.hbd3=function(A,s){   /* Huyền Băng Lao: giam băng, hết giam thì NỨT VỠ gây sát thương lớn lan sang kẻ gần */
 var e=A.tgt();if(!e)return;var cen=A.ctr(e),b=boss(A,e);H(A,e,s.mul*.1);
 A.listAt(cen,115).forEach(function(x){A.status(x,x===e&&!b?{frz:1,sl:90,stn:96}:{sl:130})});A.say('🥶 Băng Lao','#7fe4ff');
 A.later(96,function(){A.say('❄ Nứt Vỡ','#bff4ff');A.listAt(cen,105).forEach(function(x){H(A,x,x===e?s.mul*.85:s.mul*.3);A.status(x,{sl:80})})})};
SKL.hbd4=function(A,s){   /* Băng Long Xuất Hải: xuyên thẳng + để lại vệt băng lạnh giá làm chậm, gây sát thương 3 nhịp */
 A.list({k:'line',len:560,w:70}).forEach(function(x){H(A,x,s.mul*.75);A.status(x,{sl:150});cold(A,x,1)});
 for(var q=1;q<=3;q++)A.later(q*24,function(){A.list({k:'line',len:560,w:70}).forEach(function(x){H(A,x,s.mul*.083);A.status(x,{sl:120})})})};
SKL.hbd5=function(A,s){   /* Băng Phong Vạn Lý: bão tuyết làm chậm mạnh; kết thúc VỠ BĂNG hàng loạt lên kẻ ≥3 tầng */
 var n=ticks(s,6),per=s.mul*.88/n,cen=A.here(),R=A.ur(s.r);
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||30),function(){A.grp(false);A.listAt(cen,R).forEach(function(x){H(A,x,per);A.status(x,{sl:160});cold(A,x,1)})})})(k);
 A.later(n*(s.every||30)+4,function(){A.say('🌨 Tuyết Băng Bạo','#bff4ff');A.listAt(cen,R).forEach(function(x){var c=A.tag(x).cd|0;if(c>=3){A.tag(x).cd=0;H(A,x,s.mul*.04*c);shatter(A,x,1.1)}})})};
/* ============================ PHẦN THIÊN CỐC ============================ */
SKL.ptc1=function(A,s){   /* Viêm Hỏa Chú: hoả cầu lan nhẹ, mỗi mục tiêu trúng +1 tầng Thiêu */
 var e=A.tgt();if(!e)return;H(A,e,s.mul*.85);burn(A,e,1);A.listAt(A.ctr(e),75).forEach(function(x){if(x!==e){H(A,x,s.mul*.4);burn(A,x,1)}})};
SKL.ptc2=function(A,s){   /* Liệt Diễm Bạo Phát: KÍCH NỔ tầng Thiêu — mỗi tầng +40% sát thương, xoá tầng */
 var e=A.tgt(),cen=A.cen('tgt',140),hit=0;
 A.listAt(cen,s.r||150).forEach(function(x){var t=A.tag(x),n=t.bn|0;H(A,x,s.mul*(1+.4*n));if(n){t.bn=0;hit++}});if(hit)A.say('💥 Dẫn Bạo ×'+hit,'#ffb070')};
SKL.ptc3=function(A,s){   /* Hỏa Liên Trận: trận lửa mỗi giây +1 tầng Thiêu cho mọi kẻ trong trận */
 var n=ticks(s,5),cen=A.cen('tgt',170);if(!A.tgt())return;
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||60),function(){A.grp(false);A.listAt(cen,s.r||130).forEach(function(x){H(A,x,s.mul*.7/n);burn(A,x,1)})})})(k)};
SKL.ptc4=function(A,s){   /* Phượng Hoàng Niết Bàn: xuyên thẳng + hồi sinh 6% sinh lực + nổ ở cuối đường bay */
 A.heal(.06);A.say('🔥 Niết Bàn','#ff9a4a');
 A.list({k:'line',len:560,w:80}).forEach(function(x){H(A,x,s.mul*.72);burn(A,x,2)});
 A.later(14,function(){A.listAt(A.cen('fwd',420),140).forEach(function(x){H(A,x,s.mul*.22);burn(A,x,1)})})};
SKL.ptc5=function(A,s){   /* Cửu Dương Phần Thiên: 9 mặt trời — mỗi nhịp 1 thiên thạch rơi xuống 1 kẻ địch NGẪU NHIÊN, +2 tầng Thiêu; cuối cùng dẫn bạo */
 var n=Math.min(ticks(s,6),s.cap||14),R=A.ur(s.r),cen=A.here(),per=s.mul*.65/n;
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||20),function(){A.grp(false);var L=A.listAt(cen,R);if(!L.length)return;var e=L[Math.floor(Math.random()*L.length)],c=A.ctr(e);
  A.later(12,function(){A.listAt(c,95).forEach(function(x){H(A,x,per);burn(A,x,2)})})})})(k);
 A.later(n*(s.every||20)+18,function(){A.listAt(cen,R).forEach(function(x){var t=A.tag(x),b=t.bn|0;if(b){t.bn=0;H(A,x,s.mul*.08*b)}})})};
/* ============================ THIÊN KIẾM TÔNG ============================ */
SKL.tkt1=function(A,s){   /* Kiếm Khí Trảm: kiếm khí NẢY CHUYỀN qua tối đa 4 mục tiêu, giảm dần */
 var cur=A.tgt(),m=s.mul*.8,seen=[],hops=4;
 (function hop(){if(!cur||hops--<=0||cur.hp<=0&&seen.length>=4)return;if(cur.hp>0){H(A,cur,m);m*=.7}seen.push(cur);
  var nx=A.listAt(A.ctr(cur),210).filter(function(x){return seen.indexOf(x)<0&&x.hp>0})[0];cur=nx;if(cur)A.later(5,hop)})()};
SKL.tkt2=function(A,s){   /* Ngự Kiếm Quyết: 5 phi kiếm ở lại 2,5 giây, TỰ truy kích kẻ gần nhất (đổi mục tiêu khi mục tiêu chết) */
 var n=8;for(var k=0;k<n;k++)A.later(8+k*17,function(){var e=A.list({k:'near',r:560})[0];if(e)H(A,e,s.mul/n)})};
SKL.tkt3=function(A,s){   /* Kiếm Bộ Vô Ảnh: lướt xuyên mọi kẻ trên đường + tích KIẾM Ý: chiêu kế tiếp trong 5 giây +30% */
 var e=A.tgt(),L=A.list({k:'line',len:330,w:75});A.dodge(s.dodge||120);if(e)A.dash(e);L.forEach(function(x){H(A,x,s.mul*.9)});K.buff.tkt=A.now()+300;A.say('⚔ Kiếm Ý +30%','#9fc8ff')};
SKL.tkt4=function(A,s){   /* Trảm Thiên Nhất Kiếm: tích lực rồi chém THỦ LĨNH (kẻ nhiều máu nhất), boss chịu thêm */
 A.later(s.wait||40,function(){var L=A.list({k:'near',r:640});if(!L.length)return;L.sort(function(a,b){return A.info(b).hp-A.info(a).hp});var e=L[0],c=A.ctr(e);
  H(A,e,s.mul*.85*(boss(A,e)?1.3:1));A.listAt(c,105).forEach(function(x){if(x!==e)H(A,x,s.mul*.15)});A.say('🌠 Nhất Kiếm','#ffe27a')})};
SKL.tkt5=function(A,s){   /* Vạn Kiếm Quy Tông: kiếm trận TĂNG DẦN sức mạnh theo từng nhịp, nhịp cuối quy tông toàn trận */
 var n=ticks(s,5),sum=0,k;for(k=1;k<=n;k++)sum+=1+.04*k;var per=s.mul*.9/(sum*2),R=A.ur(s.r);
 for(k=1;k<=n;k++)(function(k){A.later(k*(s.every||15),function(){A.grp(false);var L=A.list({k:'near',r:R});if(!L.length)return;for(var c=0;c<2;c++)H(A,pick(L,k*2+c+Math.floor(Math.random()*3)),per*(1+.04*k))})})(k);
 A.later(n*(s.every||15)+6,function(){A.say('⚔ Quy Tông','#ffe27a');A.list({k:'near',r:R}).forEach(function(x){H(A,x,s.mul*.1)})})};
/* ============================ VẠN ĐỘC MÔN ============================ */
SKL.vdm1=function(A,s){   /* Độc Châm Xuyên Tâm: 3 độc châm RẢI 3 mục tiêu khác nhau, mỗi châm +1 tầng Độc */
 var L=A.list({k:'near',r:640}).slice(0,3);if(!L.length)return;for(var i=0;i<3;i++){var e=L[i%L.length];H(A,e,s.mul*.8/3);pois(A,e,1)}};
SKL.vdm2=function(A,s){   /* Vạn Độc Mê Vụ: sương độc, mỗi nhịp +1 tầng Độc cho mọi kẻ trong sương + làm chậm nhẹ */
 var n=ticks(s,5),cen=A.cen('tgt',170);if(!A.tgt())return;
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||60),function(){A.grp(false);A.listAt(cen,s.r||160).forEach(function(x){H(A,x,s.mul*.7/n);pois(A,x,1);A.status(x,{sl:70})})})})(k)};
SKL.vdm3=function(A,s){   /* Phệ Tâm Độc Chú: KÍCH ĐỘC — mỗi tầng +22% sát thương, giữ lại nửa tầng; mục tiêu chết thì độc LAN sang 2 kẻ gần */
 var e=A.tgt();if(!e)return;var t=A.tag(e),n=t.ps|0;H(A,e,s.mul+.22*n);t.ps=Math.floor(n/2);pois(A,e,1);
 if(e.hp<=0){var c=A.ctr(e);A.listAt(c,280).filter(function(x){return x!==e&&x.hp>0}).slice(0,2).forEach(function(x){pois(A,x,Math.max(2,n));A.say('☠ Độc Lan','#7cf08a')})}};
SKL.vdm4=function(A,s){   /* Bích Lân Độc Xà: độc xà SĂN MỒI — mỗi lần cắn chọn kẻ ít tầng Độc nhất, +2 tầng */
 var n=Math.round((s.dur||6)*60/45),per=s.mul*.8/n;
 for(var k=0;k<n;k++)A.later(12+k*45,function(){var L=A.list({k:'near',r:480});if(!L.length)return;L.sort(function(a,b){return(A.tag(a).ps|0)-(A.tag(b).ps|0)});H(A,L[0],per);pois(A,L[0],1)})};
SKL.vdm5=function(A,s){   /* Vạn Độc Phệ Thiên: độc vực +1 tầng/nhịp; kết thúc ĐỘC PHÁT — mọi tầng Độc nổ cùng lúc */
 var n=ticks(s,6),per=s.mul*.7/n,cen=A.here(),R=A.ur(s.r);
 for(var k=1;k<=n;k++)(function(k){A.later(k*(s.every||20),function(){A.grp(false);A.listAt(cen,R).forEach(function(x){H(A,x,per);pois(A,x,1)})})})(k);
 A.later(n*(s.every||20)+5,function(){A.say('☠ Độc Phát','#7cf08a');A.listAt(cen,R).forEach(function(x){var t=A.tag(x),p=t.ps|0;if(p){t.ps=0;H(A,x,s.mul*.1*p/3)}})})};
/* ============================ NGỰ CỔ THÁNH ĐIỆN ============================ */
SKL.ngc1=function(A,s){   /* Linh Cổ Xuất Khiếu: 4 con cổ BÁM mục tiêu, mục tiêu chết thì chuyển sang kẻ gần nhất */
 var cur=A.tgt();if(!cur)return;var bugs=4,tk=9,per=s.mul/(bugs*tk);
 for(var b=0;b<bugs;b++)for(var k=0;k<tk;k++)A.later(8+k*20+b*3,function(){if(!cur||cur.hp<=0)cur=A.list({k:'near',r:520})[0];if(cur)H(A,cur,per,{summon:s.summon})})};
SKL.ngc3=function(A,s){   /* Phệ Linh Cổ Quần: bầy cổ gặm 3 kẻ — kẻ bị gặm NHẬN +20% sát thương kỹ năng phái trong 5 giây */
 var L=A.list({k:'near',r:560}).slice(0,3);if(!L.length)return;
 L.forEach(function(e){A.tag(e).vu=A.now()+300;A.status(e,{prc:.1});for(var k=1;k<=5;k++)A.later(k*60,function(){H(A,e,s.mul/(5*L.length))})});A.say('🪲 Cổ Độc','#ffd890')};
SKL.ngc4=function(A,s){   /* Thiên Túc Cổ Vương: Cổ Vương bò đến kẻ địch đập liên tục; mỗi nhịp thứ 4 giậm đất CHOÁNG diện rộng */
 var n=Math.round((s.dur||8)*60/40),per=s.mul/n;
 for(var k=1;k<=n;k++)(function(k){A.later(k*40,function(){A.grp(true);var e=A.list({k:'near',r:480})[0];if(!e)return;var c=A.ctr(e);
  A.listAt(c,115).forEach(function(x){H(A,x,per,{summon:true})});
  if(k%4===0)A.listAt(c,200).forEach(function(x){A.status(x,boss(A,x)?{sl:90}:{stn:48})})})})(k)};
SKL.ngc5=function(A,s){   /* Vạn Cổ Triều Tông: 6 đợt triều cổ lan VÒNG từ người ra ngoài; kẻ chết bởi triều nổ thành Cổ Tử */
 var pulses=Math.round((s.dur||6)*60/(s.every||60)),per=s.mul/pulses,R=A.ur(s.r),cen=A.here();
 for(var p=1;p<=pulses;p++)(function(p){A.later(p*(s.every||60)-30,function(){A.grp(true);var seen=[];
  for(var w=1;w<=3;w++)(function(w){A.later(w*9,function(){A.listAt(cen,R*w/3).forEach(function(x){if(seen.indexOf(x)>=0)return;seen.push(x);H(A,x,per,{summon:true});
   if(x.hp<=0)A.listAt(A.ctr(x),130).forEach(function(y){if(y!==x)H(A,y,per*.5)})})})})(w)})})(p)};

K.has=function(s){return !!(s&&s.mk&&K.CF.enable&&SKL[s.t])};
K.run=function(A,s){var f=SKL[s.t];if(!f||!K.CF.enable)return false;A.B=1;
 if(A.k==='tkt'&&s.t!=='tkt3'&&(K.buff.tkt|0)>A.now()){A.B=1.3;K.buff.tkt=0;A.say('⚔ Kiếm Ý','#9fc8ff')}
 try{f(A,s)}catch(e){}return true};
/* neo tâm hiệu ứng khi nhắm vào mục tiêu (world/83) */
window.MPTT_AN={hbd2:190,hbd3:190,ptc2:190,ptc3:170,tkt4:200,vdm2:170,vdm3:180,vdm4:170,ngc3:170};
})();
