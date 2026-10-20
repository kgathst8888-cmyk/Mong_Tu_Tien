/* ===== 🔮 THỨC TỈNH PHÁP BẢO BỔN MỆNH (world/123-phap-bao-thuc-tinh.js, Fix367) =====
 * Cộng thêm vào KỸ NĂNG CHỦ ĐỘNG của Pháp Bảo Bổn Mệnh (world/48) theo số ★ Tinh Luyện (world/110, TLP.star()).
 *   ★3 "Thức Tỉnh"  — mỗi lần tung chủ động có thêm một đợt hiệu ứng.
 *   ★5 "Đại Thành"  — hiệu ứng ★3 mạnh hơn và có thêm hiệu ứng thứ hai (chi tiết từng pháp bảo ngay dưới).
 *   🗡️ Kiếm Linh   ★3 Kiếm Vũ Tam Điệp: 3 nhát phi kiếm bồi thêm lên địch ngẫu nhiên · ★5 Vạn Kiếm Quy Tông: 6 nhát + 6 giây +20% sát thương.
 *   🏺 Hồ Lô       ★3 Dưỡng Linh Hồi Xuân: hồi 5% sinh lực + 3% MP · ★5 Vạn Quỷ Triều: 3 đợt sóng quỷ quanh người (đánh + làm chậm).
 *   🚩 Hồn Phiên   ★3 Hồn Phệ: 5 địch gần nhất bị nhiễm độc + hồi 6% MP · ★5 U Minh Bạo Hồn: sau 6 giây, kẻ bị nhiễm còn sống nổ lan.
 *   🪓 Cự Phủ      ★3 Chấn Địa Dư Chấn: thêm 1 chấn động 0,6 giây sau · ★5 Khai Thiên Tam Chấn: thêm chấn động thứ 3 + hồi 5% sinh lực.
 * Không đổi cách tung chiêu của world/48 (không sửa engine, không lưu dữ liệu, không SQL): module theo dõi bộ đếm số lần tung (FABAO.data().c[loại]),
 * phát hiện lần tung mới rồi cộng hiệu ứng riêng bằng dm()/ST.apply(). ★ lấy từ TLP.star() nên chưa Tinh Luyện = không đổi gì.
 * Chỉnh cân bằng: FBA.CF. Tắt: bỏ <script> trong index.html (hoặc FBA.CF.enable=false). API: FBA.info() */
(function(){
'use strict';
if(window.FBA||typeof PS==='undefined'||!window.FABAO||typeof dm!=='function'||typeof step!=='function')return;

var CF=window.FBA_CF={enable:true,
  sw:{n3:3,n5:6,base:.45,lv:.05,gap:12,buff:.20,buffSec:6,range:700},
  mn:{heal3:.05,mp3:.03,waves:3,gap:30,base:.5,lv:.05,r:260,slow:80},
  gh:{n:5,mp:.06,delay:360,base:.9,lv:.08,r:140,splash:.4},
  ax:{gap:36,k:.5,r:330,heal5:.05}};
var NAME=['Kiếm Linh','Hồ Lô Dưỡng Linh','Hồn Phiên','Cự Phủ'],ICON=['🗡️','🏺','🚩','🪓'],COL=['#6fd0ff','#ffb84a','#b585ff','#ff8a3a'];
var T3=['Kiếm Vũ Tam Điệp','Dưỡng Linh Hồi Xuân','Hồn Phệ','Chấn Địa Dư Chấn'],T5=['Vạn Kiếm Quy Tông','Vạn Quỷ Triều','U Minh Bạo Hồn','Khai Thiên Tam Chấn'];

/* ---------- đọc dữ liệu ---------- */
function star(){try{return window.TLP&&TLP.star?(TLP.star()|0):0}catch(e){return 0}}
function typ(){try{return FABAO.type()}catch(e){return -1}}
function lv(){try{return Math.max(1,FABAO.level()|0)}catch(e){return 1}}
function foes(r,c){var x=(c==null)?P.x:c;try{return E.filter(function(e){return e&&e.hp>0&&!(e.in>0)&&Math.abs(e.x-x)<r}).sort(function(a,b){return Math.abs(a.x-x)-Math.abs(b.x-x)})}catch(e){return []}}
function say(t,c){try{DT.push({x:P.x,y:236,s:t,c:c,l:70,g:1})}catch(e){}}
function slash(h,c){try{FX.push({t:'sl',x:h.x,br:0,c:c,l:10,m:10})}catch(e){}}
function dmg(e,m){try{if(e&&e.hp>0)dm(e,m)}catch(x){}}
function slowed(e,n){try{e.sl=Math.max(e.sl||0,n)}catch(x){}}
function stun(e){try{if(window.ST&&ST.apply)ST.apply(e,'stn');else e.sl=Math.max(e.sl||0,150)}catch(x){}}
function heal(f){try{P.hp=Math.min(mx(),P.hp+mx()*f)}catch(e){}}
function mana(f){try{P.mp=Math.min(mm(),P.mp+mm()*f)}catch(e){}}

/* ---------- hàng đợi theo khung hình ---------- */
var Q=[],buffUntil=0;
function later(n,f){Q.push({t:fr+Math.max(1,n|0),f:f})}
function runQ(){if(!Q.length)return;var keep=[];for(var i=0;i<Q.length;i++){var q=Q[i];if(fr>=q.t){try{q.f()}catch(e){}}else keep.push(q)}Q=keep}

/* ---------- từng pháp bảo ---------- */
function onCast(t,st,L){
  var k5=st>=5;
  if(t===0){                                  /* Kiếm Linh */
    var n=k5?CF.sw.n5:CF.sw.n3,mul=CF.sw.base+CF.sw.lv*L;
    for(var i=0;i<n;i++)(function(i){later(14+i*CF.sw.gap,function(){var a=foes(CF.sw.range);if(!a.length)return;var h=a[Math.floor(Math.random()*Math.min(4,a.length))];slash(h,COL[0]);dmg(h,mul)})})(i);
    if(k5)buffUntil=fr+CF.sw.buffSec*60;
    say(ICON[0]+' '+(k5?T5[0]:T3[0]),COL[0])}
  else if(t===1){                             /* Hồ Lô */
    heal(CF.mn.heal3*(k5?1.5:1));mana(CF.mn.mp3);
    if(k5){var w=CF.mn.base+CF.mn.lv*L;
      for(var j=1;j<=CF.mn.waves;j++)later(j*CF.mn.gap,function(){foes(CF.mn.r).forEach(function(e){dmg(e,w);slowed(e,CF.mn.slow)});try{FX.push({t:'ring',x:P.x,r:CF.mn.r,c:COL[1],l:20,m:20})}catch(x){}})}
    say(ICON[1]+' '+(k5?T5[1]:T3[1]),COL[1])}
  else if(t===2){                             /* Hồn Phiên */
    var a=foes(760).slice(0,CF.gh.n);
    a.forEach(function(e){try{if(window.ST&&ST.apply)ST.apply(e,'psn')}catch(x){}});mana(CF.gh.mp);
    if(k5&&a.length)later(CF.gh.delay,function(){var m=CF.gh.base+CF.gh.lv*L;
      a.forEach(function(e){if(!e||e.hp<=0)return;dmg(e,m);slash(e,COL[2]);
        foes(CF.gh.r,e.x).forEach(function(q){if(q!==e)dmg(q,m*CF.gh.splash)})});say('💥 U Minh Bạo Hồn',COL[2])});
    say(ICON[2]+' '+(k5?T5[2]:T3[2]),COL[2])}
  else if(t===3){                             /* Cự Phủ */
    var tg=foes(640)[0],cx=tg?tg.x:P.x,base=(5+.5*L)*CF.ax.k;
    var quake=function(){foes(CF.ax.r,cx).forEach(function(e){dmg(e,base);stun(e)});try{FX.push({t:'ring',x:cx,r:CF.ax.r,c:COL[3],l:24,m:24})}catch(x){}};
    later(CF.ax.gap,quake);if(k5){later(CF.ax.gap*2,quake);heal(CF.ax.heal5)}
    say(ICON[3]+' '+(k5?T5[3]:T3[3]),COL[3])}}

/* ---------- theo dõi lần tung (bộ đếm c[loại] của world/48 tăng 1 mỗi lần tung thành công) ---------- */
var seenT=-2,seenC=0;
function poll(){
  if(!CF.enable)return;
  if(vil||!started||over){if(Q.length)Q=[];seenT=-2;return}
  var t=typ();if(t<0){seenT=-2;Q=[];return}
  var d=FABAO.data(),c=(d&&d.c?d.c[t]:0)|0;
  if(seenT!==t){seenT=t;seenC=c;Q=[];return}
  if(c>seenC){seenC=c;var st=star();if(st>=3)onCast(t,st,lv())}
  else if(c<seenC)seenC=c;
  runQ()}
var _step=step;
step=function(){var r=_step.apply(this,arguments);try{poll()}catch(e){}return r};
if(typeof init==='function'){var _init=init;init=function(){Q=[];seenT=-2;buffUntil=0;return _init.apply(this,arguments)}}

/* ★5 Kiếm: +% sát thương trong thời gian buff (cộng qua twB → SX như pháp bảo/danh hiệu) */
if(typeof twB==='function'&&!twB.__fba){
  var _tw=twB;
  twB=function(k){var v=_tw.apply(this,arguments);try{if(k==='dmgp'&&buffUntil>fr)v+=CF.sw.buff*100}catch(e){}return v};
  twB.__fba=1}

/* ---------- dòng mô tả dưới thẻ Pháp Bảo ở ô nhân vật ---------- */
function infoLine(){var t=typ();if(t<0)return '';var st=star();
  return '<div class="dt" style="margin-top:2px;color:'+COL[t]+'"><small>✨ Thức Tỉnh '+NAME[t]+': '
    +(st>=3?'✔':'🔒')+' ★3 '+T3[t]+' · '+(st>=5?'✔':'🔒')+' ★5 '+T5[t]+'</small></div>'}
try{
  if(window.ZC&&typeof ZC.ui==='function'&&!ZC.ui.__fba){
    var _zu=ZC.ui;
    ZC.ui=function(){var h=_zu.apply(this,arguments);try{if(typeof h==='string'&&typ()>=0)h+=infoLine()}catch(e){}return h};
    ZC.ui.__fba=1}
}catch(e){}

window.FBA={CF:CF,info:function(){var t=typ(),st=star();return{type:t,name:t>=0?NAME[t]:'',star:st,t3:t>=0?T3[t]:'',t5:t>=0?T5[t]:'',awake3:st>=3,awake5:st>=5}}};
})();
