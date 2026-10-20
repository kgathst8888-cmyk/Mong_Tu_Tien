/* ===== ⬆ NÂNG CẤP TRANG BỊ HOÀNG KIM (ui/103-nang-cap-hoang-kim.js) — Fix362 — nạp SAU ui/101-trang-bi-hoang-kim.js =====
 * Nâng từng món Hoàng Kim đã chế (cấp 1) lên tối đa cấp 10 (HKG.cfg.maxLv). KHÔNG sửa ui/101: chỉ thêm chỉ số cấp 2→10 vào HKG.cfg.stat,
 * gắn nút "⬆ Nâng cấp" vào cửa sổ thông tin món (chạm ô Hoàng Kim ở tab Túi) và vào Nhà Chế Tạo Trang Sức Hoàng Kim.
 *
 * CHI PHÍ nâng LÊN cấp L (L = 2…10), cấu hình ở window.HKU_CFG:
 *   • Linh Thạch: 2.000 cho cấp 2, mỗi cấp sau +1.000 (cấp 3 = 3.000 … cấp 10 = 10.000). LT.spend: trừ khoá trước, cần đăng nhập ☁.
 *   • Tỉ lệ thành công: 50% cho cấp 2–4; từ cấp 5 giảm 4%/cấp (cấp 5 = 46%, 6 = 42% … 10 = 26%).
 *   • Nguyên liệu phụ bản (rơi từ boss, xem world/117): cấp 2–5 cần 2×L 🪞Tinh Hoa Kính Hồ; cấp 6–10 cần 10 🪞 + (2×L−8) 💀Cốt Long Tủy.
 *   • THẤT BẠI: mất nguyên liệu + Linh Thạch, món giữ nguyên cấp (không tụt cấp).
 * CHỈ SỐ mỗi món theo cấp L: +2L% Công · +2L% Thủ · +2L% Máu · +1000L Năng lượng (cấp 1 giữ nguyên như ui/101). Bộ cùng cấp vẫn do ui/101 tính.
 * Lưu: PS[cur].hkg.mat = {kh:số, ct:số} (theo từng nhân vật, cùng object hkg của ui/101 nên đi theo lưu đám mây).
 * API: HKU.open(slot?) · HKU.addMat('kh'|'ct', n) · HKU.mat(k) · HKU.rate(L) · HKU.cost(L) · HKU.need(L) · HKU.cfg
 * Gỡ = xoá thẻ script trong index.html (món đã nâng sẽ về chỉ số cấp 1 vì ui/101 không có bảng stat cấp cao). */
(function(){
'use strict';
if(window.HKU||!window.HKG||!HKG.cfg||typeof PS==='undefined'||typeof cur==='undefined')return;
var CF=HKG.cfg;
var U=window.HKU_CFG={lt0:2000,ltStep:1000,rate0:.5,drop:.04,dropFrom:5,minRate:.05,
  mat:{kh:{n:'Tinh Hoa Kính Hồ',e:'🪞',src:'Boss Huyễn Cảnh Kính Hồ · Lv60'},ct:{n:'Cốt Long Tủy',e:'💀',src:'Cốt Long Vương · Cốt Hải Sa Mạc · Lv100'}},
  stat:function(L){return{a:2*L,d:2*L,h:2*L,m:1000*L}}};
function cost(L){return U.lt0+U.ltStep*(L-2)}
function rate(L){return L<U.dropFrom?U.rate0:Math.max(U.minRate,U.rate0-U.drop*(L-U.dropFrom+1))}
function need(L){var o={};if(L<=5)o.kh=2*L;else{o.kh=10;o.ct=2*L-8}return o}
for(var Lx=2;Lx<=CF.maxLv;Lx++)if(!CF.stat[Lx])CF.stat[Lx]=U.stat(Lx);
var GOLD='#f2c14e',busy=false,slot=-1;
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function say(s,c,y){try{DT.push({x:P.x,y:y||180,s:s,c:c||'#ffe9a8',l:110,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function H(){var p=PS[cur];if(!p)return null;var h=p.hkg;
  if(!h||typeof h!=='object'||!Array.isArray(h.s))h=p.hkg={s:[null,null,null,null]};
  while(h.s.length<4)h.s.push(null);
  if(!h.mat||typeof h.mat!=='object')h.mat={kh:0,ct:0};return h}
function mat(k){var h=H();return h?(h.mat[k]|0):0}
function addMat(k,n){var h=H();if(!h||!U.mat[k]||!(n>0))return 0;h.mat[k]=(h.mat[k]|0)+(n|0);sav();return h.mat[k]}
function ltHave(){try{return window.LT&&LT.get?LT.get():0}catch(e){return 0}}
function ov(id){var o=document.getElementById(id);if(o)o.remove();o=document.createElement('div');o.id=id;o.className='tsm-ov';o.style.setProperty('--tc',GOLD);
  o.addEventListener('click',function(e){if(e.target===o)o.remove()});document.body.appendChild(o);return o}
function st(l){var s=CF.stat[l]||CF.stat[1];return '+'+s.a+'% Công · +'+s.d+'% Thủ · +'+s.h+'% Máu · +'+nf(s.m)+' Năng lượng'}
/* ---------- cửa sổ nâng cấp ---------- */
function open(i){
  var h=H();if(!h)return;
  if(typeof i==='number'&&i>=0&&i<4)slot=i;
  if(slot<0||!h.s[slot]){slot=-1;for(var j=0;j<4;j++)if(h.s[j]){slot=j;break}}
  render(ov('hku-ov'))}
function render(o){
  o=o||document.getElementById('hku-ov');if(!o)return;
  var h=H(),S=HKG.slots,k;
  var html='<div class="tsm-bx hkg-bx"><h3>⬆ Nâng Cấp Hoàng Kim</h3><small>Nâng tối đa cấp '+CF.maxLv+'. Thất bại: mất nguyên liệu + Linh Thạch, món giữ nguyên cấp.</small><div class="hkg-rc">';
  S.forEach(function(s,i){var it=h.s[i],im=window.HK&&HK.items&&HK.items[i]&&HK.items[i].ic;
    html+='<div class="hkg-c'+(i===slot?' on':'')+(it?' has':'')+'" onclick="HKU.pick('+i+')">'
      +(it&&im?'<img src="'+im+'">':'<div style="font-size:34px;height:52px;line-height:52px;text-align:center">'+s.e+'</div>')
      +'<b>'+(s.t||s.n)+'</b><em>'+(it?'Cấp '+it.l+'/'+CF.maxLv:'Chưa chế tạo')+'</em></div>'});
  html+='</div><div class="hkg-box"><b style="color:'+GOLD+'">Nguyên liệu phụ bản của bạn</b><br>';
  for(k in U.mat)html+=U.mat[k].e+' '+U.mat[k].n+': <b>'+nf(mat(k))+'</b> <small style="margin:0;opacity:.7">('+U.mat[k].src+')</small><br>';
  html+='<small style="margin:0;opacity:.75">Chọn độ khó cao hơn khi vào phụ bản để boss rơi nhiều hơn.</small></div>';
  var it=slot>=0?h.s[slot]:null,can=false;
  if(!it)html+='<div class="hkg-box hkg-off">Chọn một món đã chế tạo. Món chưa có: chế ở Nhà Trang Sức Hoàng Kim (Làng Tân Thủ 2).</div>';
  else if(it.l>=CF.maxLv)html+='<div class="hkg-box hkg-on">✔ '+(S[slot].n||'Món này')+' đã đạt cấp tối đa ('+CF.maxLv+').</div>';
  else{
    var L=it.l+1,nd=need(L),c=cost(L),r=rate(L),have=ltHave(),ok=true,row=function(good,t){if(!good)ok=false;return '<div class="'+(good?'hkg-on':'')+'" style="'+(good?'':'color:#ff8a8a')+'">'+(good?'✔ ':'✖ ')+t+'</div>'};
    html+='<div class="hkg-box"><b style="color:'+GOLD+'">'+S[slot].n+' · Cấp '+it.l+' → '+L+'</b><br>Cấp '+it.l+': '+st(it.l)+'<br>Cấp '+L+': <b>'+st(L)+'</b>'
      +'<div style="margin-top:6px">'+row(have>=c,'💎 Linh Thạch: '+nf(c)+' <small style="margin:0;opacity:.75">(có '+nf(have)+')</small>');
    for(k in nd)html+=row(mat(k)>=nd[k],U.mat[k].e+' '+U.mat[k].n+': '+nf(nd[k])+' <small style="margin:0;opacity:.75">(có '+nf(mat(k))+')</small>');
    html+='</div>Tỉ lệ thành công: <b>'+Math.round(r*100)+'%</b></div>';
    can=ok&&!busy}
  html+='<div class="hkg-bt"><button class="tsm-x hkg-ok"'+(can?'':' disabled')+' onclick="HKU.up()">⬆ Nâng cấp'+(it&&it.l<CF.maxLv?' ('+Math.round(rate(it.l+1)*100)+'%)':'')+'</button>'
    +'<button class="tsm-x" onclick="document.getElementById(\'hku-ov\').remove()">Đóng</button></div></div>';
  var bx=o.firstElementChild,top=bx?bx.scrollTop:0;o.innerHTML=html;try{o.firstElementChild.scrollTop=top}catch(e){}}
function up(){
  if(busy)return;var h=H(),it=h&&h.s[slot];if(!it||it.l>=CF.maxLv)return;
  var L=it.l+1,nd=need(L),c=cost(L),r=rate(L),k;
  for(k in nd)if((h.mat[k]|0)<nd[k]){say('Thiếu '+U.mat[k].n,'#ff8a8a',160);render();return}
  if(!window.LT||!LT.spend||!LT.logged||!LT.logged()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+nf(c)+'💎)','#ff8a8a',160);return}
  if(!confirm('Nâng '+HKG.slots[slot].n+' lên cấp '+L+'?\nTốn '+nf(c)+' Linh Thạch + nguyên liệu phụ bản.\nTỉ lệ thành công '+Math.round(r*100)+'%, thất bại mất nguyên liệu và Linh Thạch (giữ nguyên cấp '+it.l+').'))return;
  busy=true;var sl=slot,hh=h,from=it.l;
  for(k in nd)hh.mat[k]=(hh.mat[k]|0)-nd[k];     /* lấy nguyên liệu trước; trừ Linh Thạch lỗi thì trả lại */
  var back=function(){for(var q in nd)hh.mat[q]=(hh.mat[q]|0)+nd[q]};
  render();
  LT.spend(c,'hkup'+sl+'_'+L).then(function(res){
    busy=false;
    if(!res||!res.ok){back();
      say(res&&res.err==='poor'?'💎 Không đủ Linh Thạch: cần '+nf(c)+', có '+nf(res.lt):'Không trừ được Linh Thạch ('+((res&&(res.msg||res.err))||'lỗi')+')','#ff8a8a',160);
      render();return}
    var x=hh.s[sl];
    if(!x||x.l!==from){back();say('Trang bị đã thay đổi, huỷ nâng cấp','#ff8a8a',160);render();return}
    if(Math.random()<r){x.l=L;x.t=Date.now();say('👑 Thành công! '+HKG.slots[sl].n+' lên Cấp '+L,'#ffe27a',240)}
    else say('💥 Thất bại — mất nguyên liệu & Linh Thạch (giữ Cấp '+from+')','#ff8a8a',200);
    sav();try{ui()}catch(e){}render()
  }).catch(function(){busy=false;back();say('Lỗi mạng khi trừ Linh Thạch','#ff8a8a',140);render()})}
/* ---------- gắn nút vào giao diện ui/101 (không sửa file đó) ---------- */
function injectInfo(i){
  var o=document.getElementById('hkg-ov');if(!o)return;var h=H();if(!h||!h.s[i])return;
  var bx=o.firstElementChild;if(!bx||bx.querySelector('.hku-ent'))return;
  var s=bx.innerHTML,s2=s.split('Nâng cấp lên cấp 2–10: cập nhật sau.').join('Có thể nâng lên cấp '+CF.maxLv+' (cần nguyên liệu phụ bản).');
  if(s2!==s)bx.innerHTML=s2;
  var bt=bx.querySelector('.hkg-bt');if(!bt)return;
  var b=document.createElement('button');b.className='tsm-x hkg-ok hku-ent';b.textContent='⬆ Nâng cấp';
  b.onclick=function(){o.remove();open(i)};bt.insertBefore(b,bt.firstChild)}
function injectCraft(o){
  var bx=o&&o.firstElementChild;if(!bx||bx.querySelector('.hku-ent'))return;
  var s=bx.innerHTML,s2=s.split(' Hiện chỉ chế được cấp 1.').join(' Nâng cấp lên cấp '+CF.maxLv+' ở nút bên dưới.').split(' Nâng cấp: cập nhật sau.').join('');
  if(s2!==s)bx.innerHTML=s2;
  var bts=bx.querySelectorAll('.hkg-bt'),bt=bts[bts.length-1];if(!bt)return;
  var b=document.createElement('button');b.className='tsm-x hkg-ok hku-ent';b.textContent='⬆ Nâng cấp Hoàng Kim';
  b.onclick=function(){open(-1)};bt.insertBefore(b,bt.firstChild)}
function watch(){
  var o=document.getElementById('hkg-craft');if(!o)return;injectCraft(o);
  if(o._hku)return;o._hku=1;
  try{new MutationObserver(function(){injectCraft(o)}).observe(o,{childList:true})}catch(e){}}
if(window.HK&&typeof HK.open==='function'){var _ho=HK.open;HK.open=function(i){var r=_ho.apply(this,arguments);try{injectInfo(i|0)}catch(e){}return r}}
if(typeof HKG.openCraft==='function'){var _oc=HKG.openCraft;HKG.openCraft=function(){var r=_oc.apply(this,arguments);try{watch()}catch(e){}return r}}
function hook(){try{var h1=window.TT2&&TT2.houses&&TT2.houses[1];
  if(!h1||typeof h1.open!=='function')return false;if(h1._hku)return true;
  var _o=h1.open;h1.open=function(){var r=_o.apply(this,arguments);try{watch()}catch(e){}return r};h1._hku=1;return true}catch(e){return false}}
if(!hook()){var n=0,iv=setInterval(function(){if(hook()||++n>40)clearInterval(iv)},500)}
window.HKU={cfg:U,open:open,pick:function(i){slot=i|0;render()},up:up,addMat:addMat,mat:mat,rate:rate,cost:cost,need:need};
})();
