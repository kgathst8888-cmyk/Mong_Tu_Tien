/* ===== 🏅 CỬA HÀNG CHIẾN CÔNG (world/124-chien-cong-shop.js, Fix368) — nạp SAU world/104 =====
 * Chiến Công (PS[cur].ctm.pts) tích từ Chiến Trường Tiên·Ma (world/104) trước đây chưa có chỗ tiêu. Module này thêm nút
 * "🏅 Cửa Hàng Chiến Công" vào cuối sảnh Chiến Trường (không sửa world/104: theo dõi DOM #ctm-ov rồi chèn nút sau mỗi lần dựng lại sảnh).
 *   • Tiêu Chiến Công để mua: Mảnh Nguyệt Thạch · Mảnh Thánh · gói quặng · 2 loại Rương Chiến Công (ngẫu nhiên, tỉ lệ hiển thị công khai).
 *   • Mỗi món có giới hạn mua MỖI TUẦN (làm mới thứ Hai 00:00 giờ VN), lưu theo từng nhân vật ở PS[cur].ctm.shop = {wk, b:{id:số lượt}}.
 *   • Chạy hoàn toàn ở máy khách (cùng mức tin cậy với bản thân Chiến Công, vốn lưu ở máy khách) → KHÔNG cần SQL. Cố ý không bán vàng / Linh Thạch.
 *   • Rương: kiểm tra túi còn chỗ TRƯỚC khi mua (kết quả có thể là trang bị). Tỉ lệ mỗi rương = 100 → hiển thị %.
 * Chỉnh giá / giới hạn / tỉ lệ: CTS_CF.cat (k: eq = 1 trang bị độ hiếm r · nt = q Mảnh Nguyệt Thạch · sh = q Mảnh Thánh · gold = v vàng).
 * Dùng: HL.addNT / HL.addSH / MN.get() / gen / BAG / capN / gold / sv — đều có try/catch. API: CTS.open() · CTS.cfg · CTS.week()
 * Gỡ <script> → nút biến mất, Chiến Trường vẫn chạy. */
(function(){
'use strict';
if(window.CTS||typeof PS==='undefined'||typeof document==='undefined')return;
var CAT=[
 {id:'nt3',e:'🌙',n:'3 Mảnh Nguyệt Thạch',cost:120,lim:5,give:{k:'nt',q:3}},
 {id:'ore',e:'⛏️',n:'Gói quặng (500 Thiết + 500 Hắc Kim)',cost:200,lim:3,give:{k:'ore',v:500}},
 {id:'ch1',e:'🎁',n:'Rương Chiến Công (ngẫu nhiên)',cost:300,lim:3,
  t:[{p:45,k:'eq',r:3},{p:15,k:'eq',r:4},{p:25,k:'nt',q:3},{p:10,k:'gold',v:2000000},{p:5,k:'sh',q:1}]},
 {id:'sh1',e:'💠',n:'1 Mảnh Thánh',cost:800,lim:1,give:{k:'sh',q:1}},
 {id:'ch2',e:'🎁',n:'Rương Chiến Công Cao Cấp (ngẫu nhiên)',cost:1000,lim:1,
  t:[{p:45,k:'eq',r:4},{p:8,k:'eq',r:5},{p:22,k:'nt',q:6},{p:20,k:'sh',q:1},{p:5,k:'sh',q:2}]}];
var CF=window.CTS_CF={cat:CAT,mapMin:2};
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'];
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';

function nf(n){try{return Math.round(Number(n)||0).toLocaleString('vi-VN')}catch(e){return ''+n}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:140,g:1})}catch(e){}}
function ctm(){try{var o=PS[cur];if(!o)return null;if(!o.ctm)o.ctm={side:'',lock:0,pts:0,w:0,l:0,n:0,rd:'',rn:0,sd:''};return o.ctm}catch(e){return null}}
/* khoá tuần: ngày thứ Hai (giờ VN, UTC+7) của tuần hiện tại */
function week(){var d=new Date(Date.now()+7*3600000);d=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-((d.getUTCDay()+6)%7)));
  return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate()}
function shop(){var o=ctm();if(!o)return null;var w=week();if(!o.shop||o.shop.wk!==w)o.shop={wk:w,b:{}};if(!o.shop.b)o.shop.b={};return o.shop}
function roll(t){var s=0,r,i;t.forEach(function(x){s+=x.p});r=Math.random()*s;for(i=0;i<t.length;i++){if((r-=t[i].p)<0)return t[i]}return t[t.length-1]}
function oLabel(o){return o.k==='eq'?'Trang bị '+RN[o.r]:o.k==='nt'?o.q+' Mảnh Nguyệt Thạch':o.k==='gold'?nf(o.v)+'💰':o.q+' Mảnh Thánh'}
function odds(t){var s=0;t.forEach(function(x){s+=x.p});return t.map(function(o){return '<span'+(o.k==='sh'?' style="color:#ffd96a"':'')+'>'+Math.round(o.p/s*100)+'% '+oLabel(o)+'</span>'}).join(' · ')}
function bagFull(){try{return BAG.length>=capN()}catch(e){return false}}

/* ---------- phát vật phẩm ---------- */
function grant(g){
  if(g.k==='nt'){HL.addNT(g.q);return '🌙 +'+g.q+' Mảnh Nguyệt Thạch'}
  if(g.k==='sh'){HL.addSH(g.q);return '💠 +'+g.q+' Mảnh Thánh'}
  if(g.k==='gold'){gold+=g.v;return '💰 +'+nf(g.v)}
  if(g.k==='ore'){var S=MN.get();S.fe=(S.fe|0)+g.v;S.hk=(S.hk|0)+g.v;return '⛏️ +'+g.v+' Thiết · +'+g.v+' Hắc Kim'}
  if(g.k==='eq'){var it=gen(P.lv,g.r,undefined,Math.max(typeof mapSel==='undefined'?0:mapSel|0,CF.mapMin));BAG.push(it);return '📦 '+esc(it.n)+' ('+RN[it.r]+', cần Lv'+it.l+')'}
  return ''}

/* ---------- giao diện ---------- */
var ov=null,note='';
function css(){if(document.getElementById('cts-css'))return;var st=document.createElement('style');st.id='cts-css';
  st.textContent='#cts-ov{z-index:100020!important}.cts-bx{max-width:390px!important;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:'+FONT+'}'
   +'.cts-cd{border:2px solid #4a3b3b;border-radius:10px;background:#1a1010;padding:8px 10px;margin:8px 0}.cts-cd small{display:block;opacity:.85;margin-top:2px;line-height:1.4}'
   +'.cts-bt{margin-top:6px;padding:7px 13px;border-radius:8px;border:1px solid #ffd76a;background:#3a2a10;color:#fff3d0;font-size:14px;font-family:inherit}.cts-bt[disabled]{opacity:.45}.cts-bt.fg{border-color:#a05a5a;background:#321a1a}'
   +'.cts-nt{min-height:18px;color:#ffe9a8;font-size:12px;margin:6px 0}'}
function render(){
  if(!ov)return;var o=ctm(),S=shop(),h='<div class="tsm-bx cts-bx"><h3>🏅 Cửa Hàng Chiến Công</h3>';
  if(!o||!S){ov.innerHTML=h+'<small>Chưa có nhân vật.</small><button class="cts-bt fg" onclick="CTS.close()">Đóng</button></div>';return}
  var bal=o.pts|0;
  h+='<div class="cts-nt">'+note+'</div><div class="cts-cd"><small>🏅 Chiến Công hiện có: <b style="color:#ffe9a8">'+nf(bal)+'</b></small>'
    +'<small>Giới hạn mua làm mới thứ Hai 00:00 (giờ VN). Thắng Chiến Trường để tích thêm Chiến Công.</small></div>';
  CAT.forEach(function(c){
    var n=S.b[c.id]|0,left=Math.max(0,c.lim-n),why=left<=0?'Hết lượt tuần này':bal<c.cost?'Thiếu '+nf(c.cost-bal):'';
    h+='<div class="cts-cd"><b>'+c.e+' '+esc(c.n)+'</b>'+(c.t?'<small>Ngẫu nhiên: '+odds(c.t)+'</small>':'')
      +'<small>Giá <b>'+nf(c.cost)+'</b> Chiến Công · còn <b>'+left+'/'+c.lim+'</b> lượt tuần này</small>'
      +'<button class="cts-bt" '+(why?'disabled ':'')+'onclick="CTS.buy(\''+c.id+'\')">'+(why?esc(why):'Mua')+'</button></div>'});
  ov.innerHTML=h+'<button class="cts-bt fg" onclick="CTS.close()">Đóng</button></div>'}
function open(){
  css();close(true);ov=document.createElement('div');ov.id='cts-ov';ov.className='tsm-ov';ov.style.setProperty('--tc','#ffd76a');
  ov.addEventListener('click',function(e){if(e.target===ov)close()});
  ['pointerdown','touchstart','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  document.body.appendChild(ov);note='';render()}
function close(silent){if(ov){ov.remove();ov=null}
  if(!silent){try{var l=document.getElementById('ctm-ov');if(l&&window.CTM&&CTM.open)CTM.open()}catch(e){}}}   /* dựng lại sảnh để cập nhật số Chiến Công */

function buy(id){
  var c=null;CAT.forEach(function(x){if(x.id===id)c=x});if(!c)return;
  var o=ctm(),S=shop();if(!o||!S)return;
  if((S.b[id]|0)>=c.lim){note='Đã hết lượt mua tuần này.';render();return}
  if((o.pts|0)<c.cost){note='Không đủ Chiến Công.';render();return}
  if((c.t||(c.give&&c.give.k==='eq'))&&bagFull()){note='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi mua.';render();return}
  var g=c.give||roll(c.t),msg='';
  try{msg=grant(g)}catch(e){note='⚠ Lỗi phát vật phẩm, chưa trừ Chiến Công. Thử lại.';render();return}   /* phát được rồi mới trừ → lỗi thì không mất Chiến Công */
  o.pts=(o.pts|0)-c.cost;S.b[id]=(S.b[id]|0)+1;sav();say('🏅 Mua '+c.n,'#ffd96a');
  note='✅ '+(c.t?'Trúng: ':'Đã mua: ')+msg+' · còn '+nf(o.pts)+' Chiến Công';render()}

/* ---------- chèn nút vào sảnh Chiến Trường (world/104 dựng lại bằng innerHTML mỗi lần) ---------- */
function inject(lobby){
  try{var bx=lobby.querySelector('.ctm-bx');if(!bx||bx.querySelector('#cts-bt'))return;
    var b=document.createElement('button');b.id='cts-bt';b.className='ctm-bt';b.style.cssText='display:block;margin-top:8px';b.textContent='🏅 Cửa Hàng Chiến Công';
    b.addEventListener('click',open);bx.appendChild(b)}catch(e){}}
var watching=null;
function watch(){
  try{var l=document.getElementById('ctm-ov');if(!l||watching===l)return;watching=l;inject(l);
    new MutationObserver(function(){if(document.body.contains(l))inject(l)}).observe(l,{childList:true})}catch(e){}}
try{new MutationObserver(watch).observe(document.body,{childList:true});watch()}catch(e){}

window.CTS={cfg:CF,open:open,close:close,buy:buy,week:week,render:render};
})();
