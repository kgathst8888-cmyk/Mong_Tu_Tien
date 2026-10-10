/* ===== 📜 THẦN THÔNG · ĐẠO CẢNH (6 hệ × 5 thần thông) =====
 * Chỉ nhân vật ĐÃ HỢP ĐẠO (HDAO.on()). Mỗi hệ có 5 thần thông xếp theo ngũ hành tương sinh, bắt đầu từ linh căn sở trường:
 *   ô1 ★ chiến đấu (tự mở khi hợp đạo) · ô2 chiến đấu · ô3 buff · ô4 chiến đấu cực nghĩa · ô5 nội tại.
 * Ô2–ô5 học bằng MẢNH SÁCH THẦN THÔNG (SC[i].sh mảnh cùng linh căn, đúng hệ). Mảnh là vật phẩm trong túi (xếp chồng, c:1, tt:{h,e,q})
 * nên bán được ở Chợ giao dịch. Mảnh chỉ rơi từ boss Kiếm Thánh (cập nhật sau): boss gọi TTHONG.drop() (5–20 mảnh, linh căn ngẫu nhiên).
 * Sát thương/buff/nội tại nhân lcMul(linh căn) (×1,2–1,5) khi trùng linh căn nhân vật. Dữ liệu: PS[cur].tt={on:[5 cờ]}.
 * Nút thần thông riêng #tt-bar (ẩn #zk khi Đạo Cảnh). Chỉnh: SC (số liệu), K (bảng kỹ năng). Test: thêm ?ttest vào URL.
 * Thẻ riêng "Thần thông Linh căn" (tự động thi triển, do systems/18-linh-can.js lo) hiển thị trong bảng, không dùng mảnh.
 * Phụ thuộc: PS, BAG, CHR, cur, P, E, dm, an, ZC, HDAO, lcMul, mx, mm, sv, SUMA(18-enemies). */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof BAG==='undefined'||typeof ZC==='undefined'||!window.HDAO)return;
var EL=['Hỏa','Mộc','Thủy','Kim','Thổ'],ELC=['#ff6a3a','#5adf7a','#5ab8ff','#ffd76a','#c89a5a'],ELI=['🔥','🌿','💧','🪙','⛰️'];
var HN=['Kiếm Khách','Thương Thủ','Triệu Hồi Sư','Ma Thuật Sư','Xạ Thủ','Thích Khách'],TYN={c:'Chiến đấu',b:'Buff',p:'Nội tại'},TY=['c','c','b','c','p'];
var SC=[{m:3.5,cd:10,mp:30,sh:0},{m:6,cd:16,mp:50,sh:10},{cd:30,mp:60,sh:20,du:12},{m:14,cd:36,mp:110,sh:35},{sh:60}];
/* e: 0 Hỏa 1 Mộc 2 Thủy 3 Kim 4 Thổ (khớp lcMul). s: X hai phía · L đường thẳng · B nổ quanh mục tiêu · M nhiều đòn · S toàn màn · U triệu hồi */
var K=[
[{n:'Canh Kim Trảm',i:'⚔️',e:3,s:'X',r:430,d:'Kiếm khí chữ thập quét hai phía'},{n:'Thủy Nguyệt Kiếm Vũ',i:'🌊',e:2,s:'M',k:3,sl:1,d:'Ba đợt kiếm sóng, làm chậm'},{n:'Thanh Mộc Dưỡng Kiếm',i:'🌿',e:1,b:{dmg:.25,hps:.01},d:'12 giây: +25% sát thương, hồi 1% máu mỗi giây'},{n:'Xích Viêm Phá Thiên Kiếm',i:'🔥',e:0,s:'B',r:270,d:'Kiếm lửa chém xuống rồi nổ lan'},{n:'Hoàng Sơn Bất Động',i:'⛰️',e:4,p:{red:.08},d:'Giảm 8% sát thương nhận'}],
[{n:'Địa Long Xuyên Thương',i:'🐉',e:4,s:'L',r:540,d:'Phóng thương hình long xuyên cả hàng địch'},{n:'Bạch Kim Cuồng Thương',i:'🔱',e:3,s:'M',k:5,d:'Năm đòn đâm liên hoàn'},{n:'Hàn Giang Hộ Thương',i:'🛡️',e:2,b:{red:.3},d:'12 giây: giảm 30% sát thương nhận'},{n:'Thanh Đằng Quấn Thương',i:'🌱',e:1,s:'B',r:250,sl:1,heal:.03,d:'Trói địch (làm chậm) và hồi 3% máu'},{n:'Phượng Hoàng Chiến Ý',i:'🔥',e:0,p:{dmg:.1,crit:.05},d:'+10% sát thương, +5% chí mạng'}],
[{n:'Mộc Linh Vương',i:'🌳',e:1,s:'U',u:['tree',1],d:'Triệu người cây lớn: trói địch, hồi máu'},{n:'Hỏa Phượng Ấn',i:'🦅',e:0,s:'U',u:['hawk',1.4],d:'Triệu chim lửa tự tấn công'},{n:'Địa Linh Hộ Pháp',i:'🗿',e:4,b:{red:.2,pet:.4},d:'12 giây: thú triệu hồi +40% sát thương, bản thân giảm 20% sát thương nhận'},{n:'Kim Cang Linh Sư',i:'🦁',e:3,s:'L',r:600,u:['wolf',1.4],d:'Linh thú vàng lao xuyên đội hình địch'},{n:'Huyền Vũ Linh Tâm',i:'🐢',e:2,p:{pet:.3,hps:.002},d:'Thú triệu hồi tồn tại lâu hơn 30%, hồi 1% máu mỗi 5 giây'}],
[{n:'Xích Diệm Hỏa Cầu',i:'☄️',e:0,s:'B',r:290,d:'Hỏa cầu nổ diện rộng'},{n:'Thạch Trận Địa Chấn',i:'🪨',e:4,s:'B',r:340,sl:1,d:'Trận đá địa chấn, làm chậm'},{n:'Kim Quang Hộ Pháp',i:'✨',e:3,b:{red:.25,cdr:.2},d:'12 giây: giảm 25% sát thương nhận, giảm 20% hồi chiêu thần thông'},{n:'Băng Hà Cực Lạc',i:'❄️',e:2,s:'S',sl:1,d:'Bão băng toàn màn hình, làm chậm'},{n:'Cổ Thụ Hồi Nguyên',i:'🌲',e:1,p:{mps:.0067,hps:.005},d:'Hồi 2% MP mỗi 3 giây, hồi 0,5% máu mỗi giây'}],
[{n:'Hàn Băng Tiễn',i:'🏹',e:2,s:'L',r:720,sl:1,d:'Mũi tên băng xuyên thấu, làm chậm'},{n:'Phong Mộc Liên Tiễn',i:'🍃',e:1,s:'M',k:5,d:'Năm mũi tên mộc truy đuổi'},{n:'Liệt Hỏa Tụ Lực',i:'🔥',e:0,b:{dmg:.3},d:'12 giây: +30% sát thương'},{n:'Cự Thạch Phá Giáp Tiễn',i:'💥',e:4,s:'B',r:320,sl:1,d:'Tên đá nổ diện rộng, làm chậm'},{n:'Thiên Kim Ưng Nhãn',i:'👁️',e:3,p:{crit:.1,dmg:.08},d:'+10% chí mạng, +8% sát thương'}],
[{n:'Ám Kim Phi Nhận',i:'🗡️',e:3,s:'L',r:580,d:'Phi đao xoay xuyên qua địch'},{n:'Ảnh Thủy Ẩn Sát',i:'🌑',e:2,s:'M',k:3,d:'Ẩn thân, dịch chuyển chém liên tiếp'},{n:'Độc Mộc Ẩn Tức',i:'☠️',e:1,b:{dodge:.4,dmg:.1},d:'12 giây: +40% né, +10% sát thương'},{n:'Huyết Viêm Liên Trảm',i:'🩸',e:0,s:'M',k:6,d:'Chuỗi 6 lần chớp chém'},{n:'Minh Thổ Ảnh Tâm',i:'👤',e:4,p:{dodge:.06,killcd:1},d:'Hạ gục địch giảm 1 giây hồi chiêu mọi thần thông, +6% né'}]
];
/* Chất lượng hiệu ứng thích ứng: đo thời gian khung hình (EMA); máy yếu tự giảm bớt hiệu ứng phụ, sát thương không đổi. fps.q: 0 đủ · 1 vừa · 2 tối thiểu */
var fps={ms:16.7,q:0,t:0,h:0};
(function loop(t){var d=t-fps.t;fps.t=t;if(d>0&&d<250){fps.ms+=(d-fps.ms)*.04;var n=fps.ms>27?2:fps.ms>21?1:0;if(n>fps.q){fps.q=n;fps.h=0}else if(n<fps.q&&++fps.h>150){fps.q--;fps.h=0}}flush();requestAnimationFrame(loop)})(typeof performance!=='undefined'?performance.now():0);
var B={t:0,dmg:0,red:0,dodge:0,hps:0,cdr:0,pet:0},cd=[0,0,0,0],TEST=/[?&]ttest/.test(location.search||'');
function on(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function hid(){try{return ({w:0,m:2,a:4})[CHR[cur].t]+(PS[cur].br?1:0)}catch(e){return 0}}
function D(){var p=PS[cur];if(!p.tt||!p.tt.on)p.tt={on:[0,0,0,0,0]};return p.tt}
function lc(e){try{return typeof lcMul==='function'?lcMul(e):1}catch(x){return 1}}
function say(t){try{DT.push({x:P.x,y:170,s:t,g:1,l:120})}catch(e){}}
function save(){try{sv()}catch(e){}try{if(typeof bo!=='undefined'&&bo&&typeof ui==='function')ui()}catch(e){}}
function V(n){try{return(0,eval)('typeof '+n+'==="function"?'+n+':null')}catch(e){return null}}
var FC={};function F(n){return function(){var f=FC[n]===undefined?(FC[n]=V(n)):FC[n];if(f)try{return f.apply(null,arguments)}catch(e){}}}
function rgba(h,a){var n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function later(n,f){var l=FC.later===undefined?(FC.later=V('later')):FC.later;if(l)l(n,f);else setTimeout(f,n*16)}

/* ---------- Mảnh sách (vật phẩm trong túi, xếp chồng) ---------- */
function isS(it){return !!(it&&it.tt&&typeof it.tt.q==='number')}
function stacks(h,e){return BAG.filter(function(it){return isS(it)&&it.tt.h===h&&(e==null||it.tt.e===e)})}
function cnt(h,e){return stacks(h,e).reduce(function(a,it){return a+it.tt.q},0)}
function lab(it){var t=it.tt;it.n='📜 Mảnh Sách '+EL[t.e]+' · '+HN[t.h]+' ×'+t.q}
function give(h,e,q){q=Math.max(0,Math.floor(q));if(!q)return;var s=BAG.filter(function(it){return isS(it)&&it.tt.h===h&&it.tt.e===e&&!it.tt.k})[0];
  if(s){s.tt.q+=q;lab(s)}else{var it={s:5,r:4,l:1,u:0,c:1,a:0,h:0,d:0,tt:{h:h,e:e,q:q}};lab(it);BAG.push(it)}save()}
function take(h,e,q){var L=stacks(h,e).sort(function(a,b){return a.tt.q-b.tt.q});for(var i=0;i<L.length&&q>0;i++){var t=Math.min(q,L[i].tt.q);L[i].tt.q-=t;q-=t;if(L[i].tt.q<=0)BAG.splice(BAG.indexOf(L[i]),1);else lab(L[i])}}
function drop(){var h=hid(),e=Math.floor(Math.random()*5),q=5+Math.floor(Math.random()*16);give(h,e,q);say('📜 +'+q+' Mảnh Sách '+EL[e]);return{e:e,q:q}}
function split(i){var it=BAG[i];if(!isS(it)||it.tt.q<2)return;var v=prompt('Tách bao nhiêu mảnh thành một chồng riêng để đăng bán ở Chợ? (1–'+(it.tt.q-1)+')','');var n=Math.floor(Number(v));if(!(n>=1&&n<it.tt.q))return;
  it.tt.q-=n;lab(it);var s={s:5,r:4,l:1,u:0,c:1,a:0,h:0,d:0,tt:{h:it.tt.h,e:it.tt.e,q:n,k:1}};lab(s);BAG.push(s);save();render()}
function conv(e){var h=hid(),o=[0,1,2,3,4].filter(function(x){return x!==e}),tot=o.reduce(function(a,x){return a+cnt(h,x)},0);if(tot<5){say('Cần 5 mảnh loại khác');return}
  var need=5;o.sort(function(a,b){return cnt(h,b)-cnt(h,a)});for(var i=0;i<o.length&&need>0;i++){var t=Math.min(need,cnt(h,o[i]));if(t>0){take(h,o[i],t);need-=t}}give(h,e,1);render()}
function learn(i){if(!on()){say('Cần hợp đạo');return}var h=hid(),s=K[h][i],d=D();if(d.on[i])return;var n=SC[i].sh;if(cnt(h,s.e)<n){say('Chưa đủ mảnh '+EL[s.e]+' ('+cnt(h,s.e)+'/'+n+')');return}
  take(h,s.e,n);d.on[i]=1;PC=null;say('📜 Đã học '+s.n);save();render()}

/* ---------- Hiệu ứng (nội tại + buff) ---------- */
var ZERO={red:0,dmg:0,crit:0,dodge:0,hps:0,mps:0,pet:0,killcd:0},PC=null,PT=0;
function pass(){if(!on())return ZERO;var t=Date.now();if(PC&&t-PT<200)return PC;var o={red:0,dmg:0,crit:0,dodge:0,hps:0,mps:0,pet:0,killcd:0},h=hid(),s=K[h][4];if(D().on[4]){var m=lc(s.e);for(var k in s.p)o[k]=s.p[k]*(k==='killcd'?1:m)}PC=o;PT=t;return o}
function bOn(){return B.t>Date.now()}
var _dm=typeof dm==='function'?dm:null;
if(_dm){dm=function(e,m,sl){if(on()){var o=pass(),k=1+o.dmg+(bOn()?B.dmg:0);if(o.crit&&Math.random()<o.crit)k*=1.6;m*=k}return _dm.call(this,e,m,sl)}}
var z0={shd:ZC.shd,dg:ZC.dg,kill:ZC.kill,zauto:ZC.zauto,zcast:ZC.zcast,ui:ZC.ui};
ZC.shd=function(){var v=z0.shd.apply(this,arguments);if(on()){var r=pass().red+(bOn()?B.red:0);if(r)v*=Math.max(.2,1-r)}return v};
ZC.dg=function(){var v=z0.dg.apply(this,arguments);if(on())v+=pass().dodge+(bOn()?B.dodge:0);return v};
ZC.kill=function(){var r=z0.kill.apply(this,arguments);try{if(on()&&pass().killcd)for(var i=0;i<4;i++)cd[i]=Math.max(0,cd[i]-1000)}catch(e){}return r};
ZC.zauto=function(){if(on()){if(started)auto();return}return z0.zauto.apply(this,arguments)};
ZC.zcast=function(i){if(on()){if(i<4)castTT(i,true);return}return z0.zcast.apply(this,arguments)};
ZC.ui=function(){var h=z0.ui.apply(this,arguments);if(on())h+='<div class="dt">📜 <b>Thần Thông · '+HN[hid()]+'</b><br>5 thần thông theo linh căn: 3 chiến đấu, 1 buff, 1 nội tại. Mảnh sách học ô 2–5.<br><button onclick="TTHONG.open()">Mở bảng Thần Thông</button></div>';return h};

/* ---------- Thi triển ---------- */
function nearE(r){return E.filter(function(e){return e.in<=0&&e.hp>0&&Math.abs(e.x-P.x)<(r||640)})}
/* Hoạt ảnh tung chiêu: thời gian dựng chiêu (khung hình) theo ô: ★ 11 · ô2 14 · buff 8 · cực nghĩa 18 (cũ: 18 cho tất cả); hồi thế ngắn 7 khung.
   Bấm khi đang tung chiêu khác → lệnh được ĐỆM 0,45s và tung ngay khi xong (không bị nuốt). Tự quay mặt về địch gần nhất trước khi đánh. */
var WU=[11,14,8,18],pend=-1,pendT=0;
function ready(j){return on()&&started&&!over&&!vil&&D().on[j]&&cd[j]<=Date.now()&&P.mp>=SC[j].mp}
function castTT(j,buf){
  if(!on()||!started||over||vil)return false;
  var h=hid(),s=K[h][j],d=D();if(!d.on[j]){if(buf)open();return false}
  if(P.pe||P.act){if(buf&&ready(j)){pend=j;pendT=Date.now()+450}return false}
  var t=Date.now(),sc=SC[j];if(cd[j]>t||P.mp<sc.mp)return false;
  var tg=null;if(!s.b){tg=nearE()[0];if(!tg)return false}
  P.mp-=sc.mp;cd[j]=t+sc.cd*1000*(1-(bOn()?B.cdr:0));
  if(tg){var near=nearE().sort(function(a,b){return Math.abs(a.x-P.x)-Math.abs(b.x-P.x)})[0];P.d=near.x>=P.x?1:-1}
  var w=Math.max(6,Math.round(WU[j]/(window.OPT2?OPT2.cs():1)));try{an(w);P.atk=P.atkT=w+7}catch(e){}P.ln=s.n;
  P.pe={l:w,t:j===3?5:2,n:s.n,f:function(){try{fire(j,s)}catch(e){}}};
  if(j===3)say(s.i+' '+s.n);return true}
function flush(){if(pend<0)return;if(Date.now()>pendT){pend=-1;return}if(!P.pe&&!P.act){var j=pend;pend=-1;castTT(j)}}
function auto(){if(!nearE().length)return;if(D().on[2]&&!bOn())castTT(2);[3,1,0].forEach(function(j){castTT(j)})}
function petBuff(on_){PETS&&PETS.forEach(function(p){if(on_&&!p._tb){p._tb=p.m;p.m*=1+B.pet}else if(!on_&&p._tb){p.m=p._tb;p._tb=0}})}
function fire(j,s){
  var col=ELC[s.e],px=P.x,dd=P.d||1,lcm=lc(s.e),mul=(SC[j].m||0)*lcm,Q=fps.q,heavy=Q>=1||(typeof FX!=='undefined'&&FX.length>50),vmax=Q>=2?2:Q>=1?4:6,tn=Q>=2?4:Q>=1?7:10,vi=0,
    gw=F('gwave'),sg=F('sigil'),vc=F('vcol'),tr=F('shTrail'),sl=F('slashXX'),fl=F('flash'),sk=F('shake'),
    vis=function(){return vi++<vmax},al=function(){return E.filter(function(e){return e.in<=0&&e.hp>0})};
  function hit(e,k){var f=typeof SKF!=='undefined';if(f)SKF=1;try{dm(e,mul*(k||1),s.sl?1:0)}finally{if(f)SKF=0}}
  if(s.b){B.t=Date.now()+SC[2].du*1000;B.dmg=(s.b.dmg||0)*lcm;B.red=(s.b.red||0)*lcm;B.dodge=(s.b.dodge||0)*lcm;B.hps=(s.b.hps||0)*lcm;B.cdr=(s.b.cdr||0)*lcm;B.pet=(s.b.pet||0)*lcm;
    petBuff(false);if(B.pet)petBuff(true);if(Q<2)sg(px,col,110,36,'#fff');if(!heavy)gw(px,col,150,26);if(!Q)fl(col,6);say('✨ '+s.n+' · 12 giây');return}
  var es=al(),sh=s.s,near=es.slice().sort(function(a,b){return Math.abs(a.x-px)-Math.abs(b.x-px)})[0];
  if(sh==='X'){if(!heavy)gw(px,col,s.r*.7,24);tr(px-s.r,px+s.r,col,14,tn);es.forEach(function(e){if(Math.abs(e.x-px)<s.r){hit(e);if(vis())sl(e.x,48,col,70,12)}});if(!Q)sk(4)}
  else if(sh==='L'){tr(px,px+dd*s.r,col,14,tn);es.forEach(function(e){if((e.x-px)*dd>-40&&Math.abs(e.x-px)<s.r){hit(e);if(vis()){sl(e.x,48,col,70,12);if(!heavy)vc(e.x,rgba(col,.7),40,20)}}})}
  else if(sh==='B'){var cx=near?near.x:px+dd*140;if(Q<2)sg(cx,col,s.r*.7,28,'#fff');gw(cx,col,s.r,26);if(!heavy)vc(cx,rgba(col,.75),60,22);es.forEach(function(e){if(Math.abs(e.x-cx)<s.r)hit(e)});if(!Q)sk(5);if(s.heal){var q=Math.round(mx()*s.heal);P.hp=Math.min(mx(),P.hp+q)}}
  else if(sh==='M'){for(var k=0;k<s.k;k++)(function(k){later(k*7,function(){var t=al().filter(function(e){return Math.abs(e.x-P.x)<640}).sort(function(a,b){return Math.abs(a.x-P.x)-Math.abs(b.x-P.x)})[0];if(!t)return;if(Q<2||k%2===0)tr(P.x,t.x,col,8,Math.max(3,tn-3));if(Q<1||k%2===0)sl(t.x,46,col,64,10);hit(t,1.2/s.k)})})(k);if(!heavy)gw(px,col,90,20)}
  else if(sh==='S'){if(!Q){fl(col,10);sk(6)}es.forEach(function(e,i){later(Math.min(i,8)*3,function(){if(vis())vc(e.x,rgba(col,.75),50,22);if(e.hp>0)hit(e,.8)})})}
  if(s.u&&window.SUMA)SUMA(s.u[0],s.u[1]*lcm);
  if(sh==='U'){if(Q<2)sg(px,col,100,32,'#fff');if(!heavy)gw(px,col,140,24)}}

/* ---------- Giao diện ---------- */
var bar,ov,btn=[];
function css(){var c=document.createElement('style');c.textContent='body.hd-on #zk{display:none!important}#tt-bar{position:fixed;right:8px;top:calc(8px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;z-index:2}@media (max-width:640px){#tt-bar{top:calc(124px + env(safe-area-inset-top,0px))}}@media (min-width:641px){#tt-bar{top:calc(128px + env(safe-area-inset-top,0px))}}'+
'#tt-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid #b8964e;background:#1d1510;color:#fff;font-size:19px;line-height:1;padding:0;overflow:hidden}#tt-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#ffe9a0}#tt-bar button.lk{opacity:.45}#tt-bar button.cd{opacity:.6}#tt-bar{contain:layout style}#tt-bar button{touch-action:manipulation}#tt-bar button.p{width:30px;height:30px;font-size:14px;align-self:center}'+
'#tt-ov{position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3}#tt-ov .bx{max-width:460px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px}'+
'#tt-ov h2{margin:0 0 4px;color:#ffe27a;font-size:19px}#tt-ov .sm{font-size:12.5px;opacity:.8;line-height:1.5}#tt-ov .ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}#tt-ov .ch span{border:1px solid #6a5030;border-radius:14px;padding:2px 8px;font-size:13px;background:#241811}#tt-ov .ch b{cursor:pointer;margin-left:4px;color:#ffe27a}'+
'#tt-ov .cd{display:flex;gap:10px;align-items:flex-start;border:1px solid #4a3828;border-radius:10px;padding:8px;margin:7px 0;background:#140d0a}#tt-ov .cd .ic{font-size:28px;width:36px;text-align:center}#tt-ov .cd.on{border-color:#ffe27a}#tt-ov .cd .t{font-size:12px;opacity:.85;line-height:1.45}#tt-ov .cd button,#tt-ov .row button{background:#8a6420;color:#fff;border:1px solid #ffe27a;border-radius:7px;padding:4px 10px;font-size:13px}#tt-ov .cd button:disabled{opacity:.4}#tt-ov .row{display:flex;gap:8px;margin-top:10px}#tt-ov .row button.g{background:#3a3a3a;border-color:#777}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='tt-bar';
  for(var j=0;j<4;j++)(function(j){var b=document.createElement('button');b.onpointerdown=function(e){e.stopPropagation();e.preventDefault();castTT(j,true)};b.addEventListener('click',function(e){e.stopPropagation()});btn.push(b);bar.appendChild(b)})(j);
  var p=document.createElement('button');p.className='p';p.textContent='📜';p.onpointerdown=function(e){e.stopPropagation();e.preventDefault();open()};bar.appendChild(p);document.body.appendChild(bar);
  ov=document.createElement('div');ov.id='tt-ov';['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(!b){if(e.target===ov)close();return}var a=b.dataset.a,i=+b.dataset.i;if(a==='x')close();else if(a==='l')learn(i);else if(a==='c')conv(i);else if(a==='s')split(i);else if(a==='t'){drop();render()}});document.body.appendChild(ov)}
function root(){for(var e=0;e<5;e++)if(lc(e)>1)return e;return -1}
var LCS=[['Thiên Liệt Hỏa','☄️','Mưa cột lửa giáng xuống diệt địch, thiêu đốt kéo dài.'],['Triệu Hoá Ma Thần','👹','Triệu Ma Thần tự dùng 3 kỹ năng, tầng càng cao càng mạnh và tồn tại lâu.'],['Hô Phong Hoán Vũ','🌧️','Gọi mưa gió: đánh lùi, làm chậm địch, hồi máu và năng lượng cho bản thân.'],['Canh Kim Chỉ Lộ','🗡️','Hai đạo kim quang quét sạch lối đi, sau đó tăng sát thương trong thời gian ngắn.'],['Địa Long Phiên Thần','🐉','Địa long trồi lên càn quét, làm choáng địch và phủ giáp đất.']];
function lcCard(){var p=PS[cur],r=(p.lc&&p.lc.root>=0)?p.lc.root:-1;
  if(r<0)return'<div class="cd"><div class="ic">🔒</div><div style="flex:1"><b>Thần thông Linh căn</b> <span class="sm">· tự động thi triển</span><div class="t">Chọn linh căn ở Tháp Thí Luyện để nhận thần thông đi kèm. Không dùng mảnh sách.</div></div></div>';
  var L=(p.lc.lv&&p.lc.lv[r])||1;
  return'<div class="cd on"><div class="ic">'+LCS[r][1]+'</div><div style="flex:1"><b style="color:'+ELC[r]+'">'+LCS[r][0]+'</b> <span class="sm">· '+EL[r]+' · Linh căn · Tầng '+L+'/15 · <b style="color:#7be07a">Tự động thi triển</b></span><div class="t">'+LCS[r][2]+'<br>Luôn tự thi triển khi có địch trong tầm: không có nút, không dùng mảnh sách, hợp đạo không xóa.</div></div></div>'}
function render(){if(!ov||ov.style.display==='none')return;var h=hid(),d=D(),r=root(),o='<div class="bx"><h2>📜 Thần Thông · '+HN[h]+'</h2><div class="sm">'+(r>=0?'Linh căn của bạn: <b style="color:'+ELC[r]+'">'+EL[r]+'</b>. Thần thông cùng linh căn mạnh ×'+lc(r).toFixed(2)+'.':'Bạn chưa chọn linh căn (Tháp Thí Luyện). Chọn linh căn để thần thông cùng hệ mạnh thêm.')+' Chỉ hệ '+HN[h]+' học được các thần thông này.</div><div class="ch">';
  for(var e=0;e<5;e++)o+='<span style="color:'+ELC[e]+'">'+ELI[e]+' '+EL[e]+' <b style="color:#fff">'+cnt(h,e)+'</b><b data-a="c" data-i="'+e+'" title="Đổi 5 mảnh loại khác → 1 mảnh '+EL[e]+'">⇄</b></span>';
  o+='</div>';
  for(var i=0;i<5;i++){var s=K[h][i],sc=SC[i],has=d.on[i],n=cnt(h,s.e),lcm=r===s.e?' · <b style="color:#7be07a">hợp linh căn</b>':'';
    o+='<div class="cd'+(has?' on':'')+'"><div class="ic">'+s.i+'</div><div style="flex:1"><b style="color:'+ELC[s.e]+'">'+s.n+'</b> <span class="sm">· '+EL[s.e]+' · '+TYN[TY[i]]+(i===0?' · ★ Khai Đạo':'')+lcm+'</span><div class="t">'+s.d+'<br>'+(TY[i]==='c'?'×'+sc.m+' sát thương · ':'')+(TY[i]==='p'?'Luôn bật':'Hồi '+sc.cd+'s · '+sc.mp+' MP')+'</div></div><div>'+
      (has?'<span class="sm">Đã học</span>':'<button data-a="l" data-i="'+i+'"'+(n>=sc.sh?'':' disabled')+'>Học '+n+'/'+sc.sh+'</button>')+'</div></div>'}
  o+=lcCard();
  var st=BAG.map(function(it,i){return isS(it)&&it.tt.h===h?'<div class="sm">'+it.n+' <button data-a="s" data-i="'+i+'" style="font-size:11px;padding:1px 6px">Tách</button></div>':''}).join('');
  o+=(st?'<div style="margin-top:8px"><b class="sm">Mảnh trong túi (bán ở 🏮 Chợ giao dịch)</b>'+st+'</div>':'<div class="sm" style="margin-top:8px">Mảnh sách chỉ rơi từ boss Kiếm Thánh (sắp ra mắt). Mảnh bán/mua được ở 🏮 Chợ giao dịch.</div>')+
    '<div class="row">'+(TEST?'<button data-a="t">🧪 Nhặt thử</button>':'')+'<button class="g" data-a="x" style="flex:1">Đóng</button></div></div>';ov.innerHTML=o}
function open(){if(!on()){say('Chỉ Đạo Cảnh (đã hợp đạo) mới có Thần Thông');return}if(!ov)build();ov.style.display='flex';render()}
function close(){if(ov)ov.style.display='none'}

/* ---------- Vòng cập nhật ---------- */
var last=Date.now();
setInterval(function(){
  if(document.hidden)return;var t=Date.now(),dt=Math.min(1,(t-last)/1000);last=t;
  try{
    if(!bar&&document.body)build();if(!bar)return;
    var act=on()&&typeof started!=='undefined'&&started;bar.style.display=act&&!(typeof vil!=='undefined'&&vil&&false)?'flex':'none';
    if(!act)return;
    var h=hid(),d=D();if(!d.on[0]){d.on[0]=1;say('📜 Khai Đạo: '+K[h][0].n);save()}
    for(var j=0;j<4;j++){var s=K[h][j],b=btn[j],has=d.on[j],rem=Math.max(0,Math.ceil((cd[j]-t)/1000));var key=(has?1:0)+'|'+rem+'|'+h;if(b._k!==key){b._k=key;b.className=(has?'':'lk')+(rem?' cd':'');b.style.borderColor=ELC[s.e];b.innerHTML=has?s.i+(rem?'<small>'+rem+'s</small>':''):'🔒'}}
    var o=pass();
    if(!over&&dt){var hp=o.hps+(bOn()?B.hps:0);if(hp&&P.hp>0)P.hp=Math.min(mx(),P.hp+mx()*hp*dt);if(o.mps)P.mp=Math.min(mm(),P.mp+mm()*o.mps*dt)}
    if(B.t&&!bOn()){B.t=0;petBuff(false)}
    if(o.pet)PETS.forEach(function(p){if(p._ls===undefined||p.l>p._ls+2)p.l=Math.round(p.l*(1+o.pet));p._ls=p.l});else PETS.forEach(function(p){p._ls=p.l});
  }catch(e){}
},250);

/* ---------- Mảnh sách trong túi: chạm = mở bảng, không mặc/bán/hợp nhầm ---------- */
if(typeof pk==='function'){var _pk=pk;pk=function(k,i){var it=k=='b'?BAG[i]:null;if(isS(it)){if(on())open();else say('Mảnh sách: dùng khi đã hợp đạo, hoặc đăng bán ở Chợ');return}return _pk.apply(this,arguments)}}
if(typeof fzt==='function'){var _fzt=fzt;fzt=function(i){if(isS(BAG[i]))return;return _fzt.apply(this,arguments)}}
var sk=0,obs=null;function skin(){sk=0;try{var bg=document.getElementById('bag');if(!bg)return;BAG.forEach(function(it,i){if(!isS(it))return;var c=bg.querySelector('[onclick="pk(\'b\','+i+')"]');if(!c||c.dataset.tt)return;c.dataset.tt=1;c.style.borderColor=ELC[it.tt.e];c.style.display='flex';c.style.flexDirection='column';c.style.alignItems='center';c.style.justifyContent='center';c.innerHTML='<div style="font-size:22px;line-height:1">📜</div><div style="font-size:10px;font-weight:700;color:'+ELC[it.tt.e]+'">'+EL[it.tt.e]+' ×'+it.tt.q+'</div>'});if(obs)obs.takeRecords()}catch(e){}}
try{var bgE=document.getElementById('bag');if(bgE&&window.MutationObserver)(obs=new MutationObserver(function(){if(!sk)sk=requestAnimationFrame(skin)})).observe(bgE,{childList:true,subtree:true})}catch(e){}
window.TTHONG={drop:drop,give:give,open:open,close:close,on:on,hid:hid,cnt:cnt,cfg:SC,data:K};
})();
