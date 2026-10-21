/* ===== 📦 KHO TÔNG MÔN (world/128-tong-mon-kho.js) — Fix382 — nạp SAU world/106 =====
 * Cần chạy tong_mon_kho.sql (sau tong_mon_xahoi.sql) 1 lần trong Supabase. Thiếu SQL → tab báo "chưa kích hoạt".
 *   • Kho chung của tông chỉ chứa 🌙 Mảnh Nguyệt Thạch và 💠 Mảnh Thánh (không chứa trang bị để máy khách không bơm vật phẩm giả lên máy chủ).
 *   • Mọi thành viên QUYÊN mảnh của mình vào kho (game trừ mảnh trước, máy chủ cộng kho; lỗi → hoàn lại). Quyên KHÔNG cộng cống hiến (tránh tự quyên rồi tự nhận để đúc cống hiến).
 *   • Tông Chủ PHÁT (≤500/lần) hoặc Trưởng Lão (≤5/lần, không phát cho chính mình) mảnh trong kho cho 1 thành viên → thành "quà", người nhận tự bấm NHẬN
 *     (máy chủ đánh dấu 1 lần rồi game mới cộng mảnh). Quà giữ nguyên dù người nhận đã rời tông. Mọi thao tác ghi vào 📜 Nhật ký tông.
 * Dùng: HL.S.nt / HL.S.sh (số dư) · HL.addNT / HL.addSH (cộng / trừ bằng số âm) — đều có try/catch. API: TMK.cfg · TMK.html · TMK.act
 * Gỡ <script> → tab Kho biến mất. */
(function(){
'use strict';
if(window.TMK||!window.TMG||!TMG.addTab||!TMG.members||typeof document==='undefined')return;
var CF=window.TMK_CF={donate:{nt:[1,10,50],sh:[1,5]},max:{chu:500,lao:5}};
var KN={nt:'🌙 Mảnh Nguyệt Thạch',sh:'💠 Mảnh Thánh'};

function esc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]})}
function nf(n){try{return Math.round(Number(n)||0).toLocaleString('vi-VN')}catch(e){return ''+n}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:140,g:1})}catch(e){}}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function have(k){try{return Math.max(0,HL.S[k]|0)}catch(e){return 0}}
function add(k,n){try{if(k==='nt')HL.addNT(n);else HL.addSH(n);return true}catch(e){return false}}
function err(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Kho tông chưa kích hoạt trên máy chủ (cần chạy tong_mon_kho.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='none'?'Bạn chưa có tông môn':s==='perm'?'Chỉ Tông Chủ / Trưởng Lão mới phát được':
    s==='poor'?'Kho không đủ':s==='max'?'Mỗi lần phát tối đa '+(r.max|0):s==='self'?'Trưởng Lão không phát cho chính mình':
    s==='gone'?'Không còn tồn tại':s==='bad'?'Dữ liệu không hợp lệ':'Không thực hiện được'}

var S={info:null,busy:false,loading:false,note:''};
function load(){
  if(S.loading)return;S.loading=true;
  rpc('tm_depot_info').then(function(r){S.loading=false;S.info=r;if(TMG.isOpen())TMG.render()})}
function bt(label,a,cls,dis){
  return '<button class="tmg-bt'+(cls?' '+cls:'')+'" '+(dis||S.busy?'disabled ':'')+'onclick="TMG.act(\'ext\',\'kho\',\''+a+'\')">'+label+'</button>'}
function html(g){
  var I=S.info;
  if(!I){if(!S.loading)load();return '<div class="tmg-cd">⏳ Đang tải kho...</div>'}
  if(I.status!=='ok')return '<div class="tmg-cd">'+esc(err(I))+'</div><div class="tmg-row">'+bt('Thử lại','reload')+'</div>';
  var h='<div class="tmg-nt">'+S.note+'</div>',mng=I.role==='chu'||I.role==='lao';
  (I.gifts||[]).forEach(function(x){
    h+='<div class="tmg-cd" style="border-color:#ffd54a"><b>🎁 Quà từ '+esc(x.frm||'Tông môn')+'</b><small>'+x.qty+' '+KN[x.kind]+'</small>'
      +'<div class="tmg-row">'+bt('Nhận','claim:'+(x.id|0),'on')+'</div></div>'});
  h+='<div class="tmg-cd"><b>📦 Kho chung của tông</b>'
    +'<small>'+KN.nt+': <b style="color:#ffe9a8">'+nf(I.nt)+'</b> · '+KN.sh+': <b style="color:#ffd96a">'+nf(I.sh)+'</b></small>'
    +'<small>Quyên không cộng cống hiến. Tông Chủ phát tối đa '+CF.max.chu+'/lần, Trưởng Lão '+CF.max.lao+'/lần.</small></div>';
  h+='<div class="tmg-cd"><b>🤲 Quyên vào kho</b>';
  ['nt','sh'].forEach(function(k){
    h+='<small>'+KN[k]+' (bạn có <b>'+nf(have(k))+'</b>)</small><div class="tmg-row">'
      +CF.donate[k].map(function(q){return bt('+'+q,'don:'+k+':'+q,'',have(k)<q)}).join('')
      +bt('Tất cả','don:'+k+':all','',have(k)<1)+'</div>'});
  h+='</div>';
  if(mng){
    var mem=TMG.members(),opts=mem.map(function(m){return '<option value="'+(m.mid|0)+'">'+esc(m.name||'?')+(m.role==='chu'?' 👑':m.role==='lao'?' 🎖':'')+'</option>'}).join('');
    h+='<div class="tmg-cd"><b>🎁 Phát cho thành viên</b>'
      +'<div class="tmg-row"><select id="tmk-to" class="tmg-in">'+opts+'</select></div>'
      +'<div class="tmg-row"><select id="tmk-kind" class="tmg-in"><option value="nt">'+KN.nt+'</option><option value="sh">'+KN.sh+'</option></select>'
      +'<input id="tmk-qty" class="tmg-in" inputmode="numeric" maxlength="3" value="1" style="max-width:70px">'
      +bt('Phát','give','on')+'</div></div>'}
  h+='<div class="tmg-row">'+bt('↻ Làm mới','reload','sm')+'</div>';
  return h}
function act(a){
  var q=String(a||'').split(':'),k=q[0];
  if(k==='reload'){S.info=null;S.note='';load();TMG.render()}
  else if(k==='don')donate(q[1],q[2]);
  else if(k==='give')give();
  else if(k==='claim')claim(q[1])}
function donate(kind,q){
  if(S.busy||(kind!=='nt'&&kind!=='sh'))return;
  var n=q==='all'?Math.min(have(kind),500):(q|0);
  if(n<1||have(kind)<n){S.note='Không đủ mảnh';TMG.render();return}
  S.busy=true;S.note='⏳ Đang quyên...';
  if(!add(kind,-n)){S.busy=false;S.note='Không trừ được mảnh';TMG.render();return}
  TMG.render();
  rpc('tm_depot_donate',{p_kind:kind,p_qty:n}).then(function(r){
    S.busy=false;
    if(r&&r.status==='ok'){sav();say('📦 Quyên '+n+' '+(kind==='nt'?'Nguyệt Thạch':'Mảnh Thánh'),'#ffd96a');S.note='✅ Đã quyên '+n+' '+KN[kind]+' vào kho'}
    else{add(kind,n);sav();S.note=esc(err(r))}
    S.info=null;load();TMG.render()})}
function give(){
  if(S.busy)return;
  var to=document.getElementById('tmk-to'),kd=document.getElementById('tmk-kind'),qt=document.getElementById('tmk-qty');
  var mid=to?parseInt(to.value,10):0,kind=kd?kd.value:'nt',n=qt?parseInt(String(qt.value).replace(/[^\d]/g,''),10):0;
  if(!mid||!(n>=1)){S.note='Chọn người nhận và số lượng';TMG.render();return}
  S.busy=true;S.note='⏳ Đang phát...';TMG.render();
  rpc('tm_depot_give',{p_mid:mid,p_kind:kind,p_qty:n}).then(function(r){
    S.busy=false;
    S.note=r&&r.status==='ok'?'✅ Đã phát '+n+' '+KN[kind]+' — người nhận sẽ thấy quà trong tab Kho':esc(err(r));
    S.info=null;load();TMG.render()})}
function claim(id){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang nhận...';TMG.render();
  rpc('tm_gift_claim',{p_id:id|0}).then(function(r){
    S.busy=false;
    if(r&&r.status==='ok'&&(r.kind==='nt'||r.kind==='sh')){
      if(add(r.kind,r.qty|0)){sav();say('🎁 Nhận '+r.qty+' '+(r.kind==='nt'?'Nguyệt Thạch':'Mảnh Thánh'),'#ffd96a');S.note='✅ Đã nhận '+r.qty+' '+KN[r.kind]}
      else S.note='⚠ Đã đánh dấu nhận nhưng cộng mảnh lỗi — báo quản trị viên'}
    else S.note=esc(err(r));
    S.info=null;load();TMG.render()})}

TMG.addTab('kho','📦 Kho',html,act);
window.TMK={cfg:CF,html:html,act:act};
})();
