/* ===== 🌟 Ô LINH CĂN (ui/97-o-linh-can.js) — Fix251 — nạp SAU ui/96-bi-kip-luyen-the.js =====
 * Trong tab 🎒 Túi, cột ô BÊN TRÁI nhân vật (.tsm-l), ngay dưới ô 📖 Bí kíp luyện thể:
 *   thêm 1 ô Linh Căn. Linh căn chọn ở Tháp Thí Luyện (9 tầng) sẽ hiện ở đây (PS[cur].tw.root: 0 Kim · 1 Mộc · 2 Thủy · 3 Hỏa · 4 Thổ).
 *   Chưa chọn: ô mờ 🔒. Chạm vào ô: bảng tên linh căn, chỉ số cộng thêm từ Tháp, kỹ năng linh căn + tầng đang luyện.
 * Hấp thụ nguyên tố (Fix252): có linh căn → đánh quái +1-3, Boss +5 điểm nguyên tố (tối đa 20.000). Đủ điểm → 🔮 Đột phá thành DỊ LINH CĂN
 *   (tốn 500 💎 Linh Thạch + 100 triệu 💰 vàng, ngẫu nhiên 1 trong 2 dị theo hệ):
 *   Kim→Phong/Lôi · Mộc→Độc/Huyết · Thủy→Băng/Âm · Hỏa→Dương/Ma Hỏa · Thổ→Nham/Trọng Lực. Không đổi lại được.
 *   Lưu: PS[cur].lcx = {p:điểm, d:id dị 0..1 (trong CF.di[hệ])}  (theo nhân vật; ng() xoá). Hook: ZC.kill(e) (móc như ui/96).
 *   Chỉ số/kỹ năng riêng của dị linh căn: CẬP NHẬT SAU (hiện chỉ hiển thị + khoá vĩnh viễn kết quả).
 * Fix254: mỗi cấp dị cần ĐỦ ĐIỂM rồi bấm 🔮 Đột phá: 200 💎 + 1 🔮 Viên Thức Tỉnh Linh Căn + 100 triệu 💰 (không còn tự lên cấp). Viên rơi từ Ác Ma Thượng Giới (CF.vt.rate), lưu PS[cur].lcx.vt.
 * Fix253: DỊ LINH CĂN có 5 cấp, hấp thụ nguyên tố để lên cấp (cấp 1 cần 200.000, mỗi cấp gấp đôi: 200k/400k/800k/1,6tr/3,2tr), tự lên cấp; hoạt động mọi bản đồ + Tiên Giới + map treo (online/offline). Lưu thêm x.dl (cấp) / x.dp (điểm). Kỹ năng linh căn gốc giữ nguyên.
 * Không sửa core: chỉ ĐỌC PS[cur].tw và PS[cur].lc, bọc window.ui() để chèn ô, bọc ZC.kill để cộng điểm.
 * Dùng lại CSS của ui/95 (.tsm-s .tsm-ov .tsm-bx .tsm-it .tsm-x). Gỡ = xoá thẻ script trong index.html. API: LCS.open() · LCS.close() */
(function(){
'use strict';
if(window.LCS||typeof ui!='function')return;
var LCS=window.LCS={};
var CF=LCS.cfg={need:20000,ptMin:1,ptMax:3,boss:5,lt:500,gold:100000000,dl:{max:5,base:200000,mul:2},lv:{lt:200,gold:100000000,vt:1},vt:{rate:.03},offAvg:2};
/* thứ tự theo Tháp: Kim, Mộc, Thủy, Hỏa, Thổ */
var R=[
 {n:'Kim',e:'⚔️',c:'#ffe08a',sk:'Canh Kim Chỉ Lộ',si:'🗡️',li:3,di:[{n:'Phong',e:'🌪️',c:'#b8f0e0'},{n:'Lôi',e:'⚡',c:'#ffe85a'}]},
 {n:'Mộc',e:'🌿',c:'#7be07a',sk:'Triệu Hoá Ma Thần',si:'👹',li:1,di:[{n:'Độc',e:'☠️',c:'#9be84a'},{n:'Huyết',e:'🩸',c:'#ff5a6c'}]},
 {n:'Thủy',e:'💧',c:'#6fc8ff',sk:'Hô Phong Hoán Vũ',si:'🌧️',li:2,di:[{n:'Băng',e:'❄️',c:'#bfeaff'},{n:'Âm',e:'🌙',c:'#b8a8ff'}]},
 {n:'Hỏa',e:'🔥',c:'#ff7a3a',sk:'Thiên Liệt Hỏa',si:'☄️',li:0,di:[{n:'Dương',e:'☀️',c:'#ffd24a'},{n:'Ma Hỏa',e:'👿',c:'#c25cff'}]},
 {n:'Thổ',e:'⛰️',c:'#d0a060',sk:'Địa Long Phiên Thần',si:'🐉',li:4,di:[{n:'Nham',e:'🪨',c:'#d8884a'},{n:'Trọng Lực',e:'🌀',c:'#a89aff'}]}];
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+Math.round(n)}}
function say(t,c,l){try{DT.push({x:P.x,y:230,s:t,c:c||'#ffd76a',l:l||90,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function root(){try{var t=PS[cur].tw;return t&&t.root>=0&&t.root<5?t.root:-1}catch(e){return -1}}
function X(){var p=PS[cur];if(!p.lcx||typeof p.lcx!=='object')p.lcx={p:0,d:-1};var x=p.lcx;x.p=Math.max(0,Math.min(CF.need,+x.p||0));if(x.d!==0&&x.d!==1)x.d=-1;x.dl=Math.max(0,Math.min(CF.dl.max,x.dl|0));x.dp=Math.max(0,+x.dp||0);x.vt=Math.max(0,x.vt|0);return x}
function dNeed(l){return CF.dl.base*Math.pow(CF.dl.mul,l)}   /* điểm cần để lên cấp dị l+1 (cấp 0→1: 200k, 1→2: 400k, …) */
function di(r){var x=X();return x.d>=0?R[r].di[x.d]:null}
function lvl(r){try{var l=PS[cur].lc;return l&&l.lv?(l.lv[R[r].li]||1):1}catch(e){return 1}}
function stat(r){try{if(typeof TW_ROOTS!='undefined'&&typeof twDesc=='function')return twDesc(TW_ROOTS[r])}catch(e){}return''}
function isBoss(e){return !!e&&(!!e.b||!!e.tw||!!e.mt||!!e.ks||!!e.am)}
function inject(){
  var col=document.querySelector('#bag .eqd .chp .tsm-l');if(!col||col.querySelector('.lcs-s'))return;
  var r=root(),on=r>=0,x=on?(di(r)||R[r]):null;
  col.insertAdjacentHTML('beforeend','<div class="tsm-s lcs-s '+(on?'on':'lk')+'" style="--tc:'+(on?x.c:'#b8964e')+'" onclick="LCS.open()" title="Linh căn">'
    +(on?x.e:'🌟')+(on?(X().d>=0?'<i>'+X().dl+'</i>':''):'<i>🔒</i>')+'</div>');
}
function refresh(){try{var c=document.querySelector('#bag .eqd .chp .lcs-s');if(c)c.remove();inject()}catch(e){}if(document.getElementById('lcs-ov'))open()}
function close(){var o=document.getElementById('lcs-ov');if(o)o.remove()}
function open(){
  close();var r=root(),on=r>=0,x=on?R[r]:null,d=on?di(r):null,h;
  if(on){
    var st=X(),full=st.p>=CF.need,pc=Math.floor(st.p/CF.need*100);
    var ti=d?d.e+' '+d.n+' Linh Căn <small style="display:inline;opacity:.75">(dị từ '+x.n+')</small>':x.e+' '+x.n+' Linh Căn';
    h='<h3>'+ti+'</h3><small>'+(d?'Linh căn đã biến dị, không thể đổi lại.':'Linh căn đã chọn ở Tháp Thí Luyện, không thể đổi lại.')+'</small>'
     +'<div class="tsm-g" style="grid-template-columns:1fr">'
     +'<div class="tsm-it on"><div class="ic">🔷</div><b>Chỉ số từ Tháp</b><em style="opacity:.9">'+(stat(r)||'—')+'</em></div>'
     +'<div class="tsm-it on"><div class="ic">'+x.si+'</div><b>'+x.sk+'</b><em style="opacity:.9">Tầng '+lvl(r)+' · mở tab ☯ Tu tiên → 🌟 Linh Căn để nâng tầng</em></div>';
    if(d){
      var mx=st.dl>=CF.dl.max,nd=dNeed(st.dl),ok=!mx&&st.dp>=nd;
      h+='<div class="tsm-it on" style="text-align:left"><b style="color:'+d.c+'">'+d.e+' Dị linh căn · '+d.n+' — Cấp '+st.dl+'/'+CF.dl.max+'</b>'
       +(mx?'<em style="opacity:.9">✨ Đã đạt cấp tối đa.</em>'
          :'<div style="height:12px;border:1px solid #5a4630;border-radius:7px;background:#120b08;margin:6px 0 4px;overflow:hidden"><div style="width:'+Math.min(100,st.dp/nd*100)+'%;height:100%;background:linear-gradient(90deg,'+d.c+'99,'+d.c+')"></div></div>'
           +'<em style="opacity:.9">Hấp thụ '+nf(Math.min(st.dp,nd))+' / '+nf(nd)+' → cấp '+(st.dl+1)+' (mỗi cấp gấp đôi điểm)</em>'
           +'<em style="opacity:.9">Quái +'+CF.ptMin+'-'+CF.ptMax+' · Boss +'+CF.boss+(ok?' · <b>đã đủ điểm, có thể đột phá</b>':'')+'</em>'
           +'<em style="opacity:.9">Đột phá 1 cấp: '+nf(CF.lv.lt)+' 💎 + '+CF.lv.vt+' 🔮 Viên Thức Tỉnh Linh Căn (bạn có '+st.vt+') + '+nf(CF.lv.gold)+' 💰</em>'
           +'<em style="opacity:.9">Viên Thức Tỉnh: Ác Ma Thượng Giới rơi (tỉ lệ thấp)</em>')
       +'<em style="opacity:.9">Nội tại '+d.n+': sẽ cập nhật sau. Kỹ năng '+x.sk+' giữ nguyên.</em></div>';
    }
    h+='</div>'+(d?(st.dl<CF.dl.max?'<button class="tsm-x" style="margin:0 0 8px auto;'+(st.dp>=dNeed(st.dl)?'':'opacity:.5')+'" '+(st.dp>=dNeed(st.dl)?'':'disabled ')+'onclick="LCS.lv()">🔮 Đột phá cấp '+(st.dl+1)+'</button>':''):'<button class="tsm-x" style="margin:0 0 8px auto;'+(full?'':'opacity:.5')+'" '+(full?'':'disabled ')+'onclick="LCS.up()">🔮 Đột phá dị linh căn</button>');
  }else{
    h='<h3>🌟 Linh Căn</h3><small>🔒 Chưa chọn linh căn. Hãy lên <b>Tháp Thí Luyện</b> (tháp 9 tầng ở Thanh Vân Tiên Thôn), dùng <b>Viên Linh Căn</b> để chọn 1 trong 5 linh căn: Kim, Mộc, Thủy, Hỏa, Thổ. Linh căn sẽ hiện ở ô này.</small>'
     +'<div class="tsm-g" style="grid-template-columns:1fr"><div class="tsm-it"><div class="ic">🔒</div><b>Chưa chọn</b></div></div>';
  }
  var o=document.createElement('div');o.id='lcs-ov';o.className='tsm-ov';o.style.setProperty('--tc',on?(d||x).c:'#b8964e');
  o.innerHTML='<div class="tsm-bx" style="max-height:92vh;overflow:auto">'+h+'<button class="tsm-x" onclick="LCS.close()">Đóng</button></div>';
  o.addEventListener('click',function(e){if(e.target===o)close()});document.body.appendChild(o);
}
var busy=false;
function up(){
  var r=root();if(busy||r<0)return;var st=X();if(st.d>=0||st.p<CF.need)return;
  if(gold<CF.gold){say('💰 Thiếu vàng: cần '+nf(CF.gold),'#ff8a8a',140);return}
  if(!window.LT||!LT.spend||!LT.logged||!LT.logged()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+nf(CF.lt)+'💎)','#ff8a8a',160);return}
  if(!confirm('Đột phá '+R[r].n+' Linh Căn thành DỊ LINH CĂN ('+R[r].di[0].n+' hoặc '+R[r].di[1].n+', ngẫu nhiên)?\nTốn '+nf(CF.lt)+' Linh Thạch + '+nf(CF.gold)+' vàng.\nKhông thể đổi lại.'))return;
  busy=true;
  LT.spend(CF.lt,'dilinhcan').then(function(res){
    busy=false;
    if(!res||!res.ok){say(res&&res.err==='poor'?'💎 Không đủ Linh Thạch: cần '+nf(CF.lt)+', có '+nf(res.lt)+'':'Không trừ được Linh Thạch ('+((res&&(res.msg||res.err))||'lỗi')+')','#ff8a8a',160);return}
    if(root()!==r||X().d>=0)return;
    gold=Math.max(0,gold-CF.gold);
    var k=Math.random()<.5?0:1,x=X();x.d=k;x.p=CF.need;x.dl=0;x.dp=0;
    var d=R[r].di[k];say('🌟 Đột phá! '+d.e+' '+d.n+' Linh Căn','#ffe27a',260);
    sav();refresh();try{if(typeof ui==='function')ui()}catch(e){}
  }).catch(function(){busy=false;say('Lỗi mạng khi trừ Linh Thạch','#ff8a8a',140)});
}
/* điểm nguyên tố: mỗi quái chết 1-3, Boss 5. Chưa biến dị → thanh 20.000 (đột phá); đã biến dị → hấp thụ lên cấp dị 1..5 (tự lên cấp). Dùng cho mọi bản đồ + Tiên Giới (ZC.kill) + map treo offline (LCS.off). */
var cnt=0;
function absorb(n){
  var r=root();if(r<0)return;var x=X();
  if(x.d<0){if(x.p>=CF.need)return;x.p=Math.min(CF.need,x.p+n);
    if(x.p>=CF.need){say('🌟 Nguyên tố '+R[r].n+' đã đủ — mở ô Linh Căn để đột phá!','#ffe27a',240);sav();refresh();return true}return}
  if(x.dl>=CF.dl.max)return;
  var nd=dNeed(x.dl);if(x.dp>=nd)return;
  x.dp=Math.min(nd,x.dp+n);
  if(x.dp>=nd){var d=R[r].di[x.d];say('🌟 '+d.e+' '+d.n+' đủ nguyên tố — mở ô Linh Căn để đột phá cấp '+(x.dl+1)+'!','#ffe27a',240);sav();refresh();return true}}
if(typeof ZC!=='undefined'&&typeof ZC.kill==='function'){var _kill=ZC.kill;
ZC.kill=function(e){
  var r=_kill.apply(this,arguments);
  try{var rt=root();if(rt>=0){
    var n=isBoss(e)?CF.boss:CF.ptMin+Math.floor(Math.random()*(CF.ptMax-CF.ptMin+1));
    var x0=X(),d0=x0.d>=0?R[rt].di[x0.d]:null;
    if((x0.d<0&&x0.p<CF.need)||(x0.d>=0&&x0.dl<CF.dl.max&&x0.dp<dNeed(x0.dl))){
      try{DT.push({x:P.x,y:170,s:'+'+n+' '+(d0||R[rt]).e,c:(d0||R[rt]).c,l:32})}catch(z){}
      if(!absorb(n)&&++cnt%25===0)sav()}}}catch(z){}
  return r}}
/* map treo offline: n quái × trung bình CF.offAvg điểm (gọi 1 dòng từ world/80-map-treo.js offline()) */
LCS.off=function(n){try{if(root()<0||!(n>0))return;absorb(Math.round(n*CF.offAvg));sav();refresh()}catch(e){}};
/* đột phá 1 cấp dị linh căn: đủ điểm + CF.lv.lt 💎 + CF.lv.vt Viên Thức Tỉnh + CF.lv.gold 💰 */
function lv(){
  var r=root();if(busy||r<0)return;var st=X();if(st.d<0||st.dl>=CF.dl.max||st.dp<dNeed(st.dl))return;
  if(gold<CF.lv.gold){say('💰 Thiếu vàng: cần '+nf(CF.lv.gold),'#ff8a8a',140);return}
  if(st.vt<CF.lv.vt){say('🔮 Thiếu Viên Thức Tỉnh Linh Căn (cần '+CF.lv.vt+', có '+st.vt+')','#ff8a8a',160);return}
  if(!window.LT||!LT.spend||!LT.logged||!LT.logged()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+nf(CF.lv.lt)+'💎)','#ff8a8a',160);return}
  var d=R[r].di[st.d];
  if(!confirm('Đột phá '+d.n+' Linh Căn lên cấp '+(st.dl+1)+'?\nTốn '+nf(CF.lv.lt)+' Linh Thạch + '+CF.lv.vt+' Viên Thức Tỉnh Linh Căn + '+nf(CF.lv.gold)+' vàng.'))return;
  busy=true;
  LT.spend(CF.lv.lt,'dilinhcan_cap').then(function(res){
    busy=false;
    if(!res||!res.ok){say(res&&res.err==='poor'?'💎 Không đủ Linh Thạch: cần '+nf(CF.lv.lt)+', có '+nf(res.lt):'Không trừ được Linh Thạch ('+((res&&(res.msg||res.err))||'lỗi')+')','#ff8a8a',160);return}
    var x=X();if(root()!==r||x.d<0||x.dl>=CF.dl.max||x.dp<dNeed(x.dl))return;
    gold=Math.max(0,gold-CF.lv.gold);x.vt=Math.max(0,x.vt-CF.lv.vt);x.dp-=dNeed(x.dl);x.dl++;if(x.dl>=CF.dl.max)x.dp=0;
    say('🌟 '+d.e+' '+d.n+' Linh Căn lên cấp '+x.dl+'!','#ffe27a',260);
    sav();refresh();try{if(typeof ui==='function')ui()}catch(e){}
  }).catch(function(){busy=false;say('Lỗi mạng khi trừ Linh Thạch','#ff8a8a',140)});
}
/* Viên Thức Tỉnh Linh Căn: Ác Ma Thượng Giới (e.am) rơi với tỉ lệ CF.vt.rate (cộng thẳng vào PS[cur].lcx.vt, theo nhân vật) */
if(typeof drop==='function'){var _drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  try{if(e&&e.am&&root()>=0&&X().d>=0&&Math.random()<CF.vt.rate){X().vt++;say('🔮 Nhận Viên Thức Tỉnh Linh Căn!','#e8b8ff',240);sav();refresh()}}catch(z){}
  return r}}
LCS.lv=lv;LCS.up=up;
LCS.open=open;LCS.close=close;
var _ui=window.ui;
window.ui=function(){var a=_ui.apply(this,arguments);try{inject()}catch(e){console.warn('LCS',e)}return a};
try{if(typeof bo!='undefined'&&bo)window.ui()}catch(e){}
})();
