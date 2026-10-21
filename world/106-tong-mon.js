/* ===== 🏯 TÔNG MÔN (bang hội) (world/106-tong-mon.js) — Fix347 — nạp SAU world/104 =====
 * Nhà "Tông Môn" ở Làng Tân Thủ 2 (TT2.houses[3], trước là Nhà Bí Ẩn 1). Dữ liệu nằm trên máy chủ → cần chạy tong_mon.sql 1 lần trong Supabase.
 *   • MỖI TÀI KHOẢN ở 1 tông môn (mọi nhân vật dùng chung). Lập tông: CF.create.gold vàng + CF.create.lt 💎 (LT.spend, cần đăng nhập ☁).
 *   • Chức vụ: 👑 Tông Chủ · 🎖 Trưởng Lão (tối đa 3: đuổi đệ tử, sửa thông báo) · 🧑 Đệ Tử. Tông Chủ phong/hạ chức, nhường ngôi, giải tán.
 *   • Cấp tông 1→10 (exp: 3000×L² mỗi cấp) · sĩ số tối đa 20 + cấp. Exp tông đến từ 📜 Điểm danh (1 lần/ngày) và 💰 Quyên góp vàng (10.000 vàng = 1 exp).
 *   • Thưởng điểm danh (vàng): CF.daily.gold + CF.daily.perLv × cấp tông. Quyên góp tối đa 200 triệu vàng/ngày/tài khoản (máy chủ giữ hạn mức).
 *   • Buff theo cấp tông (cộng qua twB → SX, giống danh hiệu): CF.buff (mỗi cấp: HP%, Sát thương%, Vàng rơi%). Cấp tông lưu ở PS[cur].tm.lv, cập nhật mỗi lần mở nhà / đăng nhập / CF.every giây.
 *   • Rời / bị đuổi → chờ 24 giờ mới vào tông khác. Tên người chơi và tên tông luôn được lọc + escape trước khi hiển thị.
 *   • Chưa chạy SQL → nhà báo "chưa kích hoạt", game vẫn chạy bình thường. Gỡ <script> → nhà quay về "Cập nhật sau".
 * Móc: TT2.houses[3] (nhãn + open) · bọc twB (cờ __tm). Dùng: gold · LT.spend / LT.earnKS (hoàn khi lập tông lỗi) · KCL.rpc · sv() — đều có try/catch.
 * Chỉnh cân bằng: CF (đổi cả hằng số trong tong_mon.sql nếu sửa exp/sĩ số/hạn mức). API: TMG.open() · TMG.close() · TMG.lv() · TMG.refresh() */
(function(){
'use strict';
if(window.TMG||typeof PS==='undefined'||typeof document==='undefined')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',COL='#e0b04a';
var CF=window.TMG_CF={
  create:{gold:20000000,lt:50},
  daily:{gold:200000,perLv:100000},
  donate:{presets:[1000000,10000000,50000000],min:100000,max:100000000},
  buff:{hpp:.5,dmgp:.5,goldp:1},          /* mỗi cấp tông */
  every:600                                /* tự cập nhật cấp tông (giây) */
};
var ROLE={chu:{n:'Tông Chủ',e:'👑',c:'#ffd96a'},lao:{n:'Trưởng Lão',e:'🎖',c:'#8fd0ff'},de:{n:'Đệ Tử',e:'🧑',c:'#cfd8d4'}};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function esc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]})}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:140,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function G(){try{return typeof gold==='number'?gold:0}catch(e){return 0}}
function addG(n){try{gold+=n}catch(e){}}
function pname(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!=='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function D(){try{var p=PS[cur];if(!p)return null;var o=p.tm;if(!o||typeof o!=='object')o=p.tm={lv:0};return o}catch(e){return null}}
function lv(){var o=D();return o?Math.max(0,Math.min(10,o.lv|0)):0}
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch'}
function hms(s){s=Math.max(0,s|0);var h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>0?h+' giờ '+m+' phút':m+' phút'}
function errTx(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Tông Môn chưa kích hoạt trên máy chủ (cần chạy tong_mon.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='in'?'Bạn đã ở trong một tông môn':s==='none'?'Bạn chưa có tông môn':
    s==='closed'?'Tông môn đang đóng cửa, không nhận người mới':s==='cool'?'Chờ '+hms(r.secs)+' nữa mới vào tông môn khác':s==='dup'?'Tên tông môn đã có người dùng':
    s==='bad'?'Dữ liệu không hợp lệ (tên 2–12 ký tự, không dùng < > & " \' ` \\ / { } [ ] %)':s==='full'?'Đã đầy':
    s==='gone'?'Không còn tồn tại':s==='perm'?'Bạn không đủ quyền':s==='self'?'Không thể làm với chính mình':
    s==='leader'?'Tông Chủ phải nhường ngôi trước khi rời (hoặc giải tán)':s==='cap'?'Vượt hạn mức quyên góp hôm nay (còn '+nf(r.left||0)+'💰)':
    'Không thực hiện được'}

/* ---------- buff theo cấp tông (cộng qua twB → SX) ---------- */
function buff(k){var l=lv();return l>0&&CF.buff[k]?CF.buff[k]*l:0}
function hookTw(){
  try{
    if(typeof twB==='function'&&!twB.__tm){
      var _tw=twB;
      twB=function(k){var v=_tw.apply(this,arguments);try{if(k==='hpp'||k==='dmgp'||k==='goldp')v+=buff(k)}catch(e){}return v};
      twB.__tm=1}
  }catch(e){}}
hookTw();

/* ---------- trạng thái ---------- */
var EXT=[];function extOf(id){for(var i=0;i<EXT.length;i++)if(EXT[i].id===id)return EXT[i];return null}
var S={tab:'main',me:null,list:null,off:0,q:'',busy:false,note:'',loading:false,view:'find',apps:null,appsLoading:false};
var isOpen=false,ovEl=null;
function setLv(n){var o=D();if(!o)return;n=Math.max(0,Math.min(10,n|0));if((o.lv|0)!==n){o.lv=n;sav()}}
function refresh(cb){
  if(!online()){if(cb)cb({status:'login'});return}
  rpc('tm_me',{p_name:pname()}).then(function(r){
    if(r&&r.status==='ok'){S.me=r;setLv(r.guild?r.guild.lv:0)}
    else if(!S.me&&r)S.me=r;   /* lỗi: chỉ hiện khi chưa có dữ liệu cũ (không xoá dữ liệu tốt vì lỗi mạng thoáng qua) */
    if(cb)cb(r);if(isOpen)render()})}
function loadList(off){
  S.off=Math.max(0,off|0);S.loading=true;render();
  rpc('tm_list',{p_q:S.q,p_off:S.off}).then(function(r){S.loading=false;S.list=r;render()})}

/* ---------- hành động ---------- */
function done(msg){S.busy=false;S.note=msg||'';refresh(function(){render()})}
function create(){
  if(S.busy)return;
  var el=document.getElementById('tmg-name'),nm=el?String(el.value||'').trim():'';
  if(nm.length<2||nm.length>12){S.note='Tên tông môn 2–12 ký tự';render();return}
  if(G()<CF.create.gold){S.note='Không đủ vàng: cần '+nf(CF.create.gold)+'💰';render();return}
  if(!ltOk()){S.note=spErr({err:'login'});render();return}
  S.busy=true;S.note='⏳ Đang kiểm tra...';render();
  rpc('tm_precheck',{p_name:nm}).then(function(p){
    if(!p||p.status!=='ok'){S.busy=false;S.note=errTx(p);render();return}
    S.note='⏳ Đang lập tông môn...';render();
    spend(CF.create.lt,'lap_tong_mon').then(function(r){
      if(!(r&&r.ok)){S.busy=false;S.note=spErr(r);render();return}
      if(G()<CF.create.gold){S.busy=false;S.note='Vàng không còn đủ — đã trừ '+CF.create.lt+'💎, hoàn lại Linh Thạch khoá';try{LT.earnKS(CF.create.lt)}catch(e){}render();return}
      addG(-CF.create.gold);
      rpc('tm_create',{p_name:nm,p_pname:pname()}).then(function(c){
        if(c&&c.status==='ok'){sav();say('🏯 Lập tông môn '+nm+'!',COL);S.tab='main';done('✅ Đã lập tông môn '+nm+'!');return}
        addG(CF.create.gold);try{LT.earnKS(CF.create.lt)}catch(e){}sav();
        done('Lập thất bại: '+errTx(c)+' — đã hoàn vàng và '+CF.create.lt+'💎 (Linh Thạch khoá)')})})})}
function join(id){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang gia nhập...';render();
  rpc('tm_join',{p_gid:id|0,p_pname:pname()}).then(function(r){
    if(r&&r.status==='ok'){say('🏯 Gia nhập tông môn!',COL);S.tab='main';done('✅ Đã gia nhập tông môn!')}
    else if(r&&r.status==='applied'){S.list=null;done('📨 Đã gửi đơn xin vào '+r.guild+'. Chờ Tông Chủ / Trưởng Lão duyệt (tối đa 3 ngày).')}
    else done(errTx(r))})}
function loadApps(){
  if(S.appsLoading)return;S.appsLoading=true;
  rpc('tm_apps').then(function(r){S.appsLoading=false;S.apps=r;render()})}
function appDo(aid,ok){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang xử lý...';render();
  rpc('tm_app_do',{p_aid:aid|0,p_ok:!!ok}).then(function(r){
    S.apps=null;
    if(r&&r.status==='ok')done(r.res==='yes'?'✅ Đã duyệt vào tông':'Đã từ chối đơn');else done(errTx(r))})}
function setMode(m){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang đổi...';render();
  rpc('tm_mode',{p_mode:m}).then(function(r){
    if(r&&r.status==='ok')done('✅ Chế độ vào tông: '+(m==='open'?'Mở cửa':m==='apply'?'Xin vào (duyệt)':'Đóng cửa'));else done(errTx(r))})}
function cancelApp(){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang huỷ...';render();
  rpc('tm_apply_cancel').then(function(r){done(r&&r.status==='ok'?'Đã huỷ đơn xin vào':errTx(r))})}
function checkin(){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang điểm danh...';render();
  rpc('tm_checkin').then(function(r){
    if(r&&r.status==='ok'){
      var g=CF.daily.gold+CF.daily.perLv*(r.lv|0);addG(g);sav();say('📜 Điểm danh +'+nf(g)+'💰',COL);
      done('✅ Điểm danh: +'+nf(g)+'💰 · +10 cống hiến · +60 exp tông')}
    else done(r&&r.status==='done'?'Hôm nay bạn đã điểm danh rồi':errTx(r))})}
function donate(n){
  if(S.busy)return;
  if(n==null){var el=document.getElementById('tmg-don');n=el?parseInt(String(el.value).replace(/[^\d]/g,''),10):0}
  n=Math.floor(n||0);
  if(n<CF.donate.min||n>CF.donate.max){S.note='Mỗi lượt quyên '+nf(CF.donate.min)+' – '+nf(CF.donate.max)+'💰';render();return}
  if(G()<n){S.note='Không đủ vàng';render();return}
  S.busy=true;S.note='⏳ Đang quyên góp...';render();
  addG(-n);
  rpc('tm_donate',{p_gold:n}).then(function(r){
    if(r&&r.status==='ok'){sav();say('💰 Quyên góp +'+nf(r.pts)+' exp tông',COL);done('✅ Quyên '+nf(n)+'💰 → +'+nf(r.pts)+' exp tông & cống hiến')}
    else{addG(n);sav();done(errTx(r))}})}
function simple(fn,args,okMsg){
  if(S.busy)return;S.busy=true;S.note='⏳ Đang xử lý...';render();
  rpc(fn,args).then(function(r){
    if(r&&r.status==='ok'){if(fn==='tm_leave'||fn==='tm_disband')setLv(0);done(okMsg||'✅ Xong')}
    else done(errTx(r))})}
function ask(t,fn){var a=typeof gcf==='function'?gcf:function(x,f){if(confirm(x))f()};try{a(t,fn)}catch(e){}}
function leave(){
  var g=S.me&&S.me.guild;if(!g)return;
  ask('Rời tông môn '+g.name+'? Bạn phải chờ 24 giờ mới vào tông khác.',function(){simple('tm_leave',{},'Đã rời tông môn')})}
function disband(){
  var g=S.me&&S.me.guild;if(!g)return;
  ask('GIẢI TÁN tông môn '+g.name+'? Toàn bộ thành viên bị loại, không thể hoàn tác.',function(){simple('tm_disband',{},'Đã giải tán tông môn')})}
function kick(mid){ask('Đuổi thành viên này khỏi tông môn?',function(){simple('tm_kick',{p_mid:mid|0},'Đã đuổi thành viên')})}
function role(mid,r){
  var tx=r==='chu'?'NHƯỜNG NGÔI Tông Chủ cho thành viên này? Bạn sẽ thành Trưởng Lão.':null;
  if(tx)ask(tx,function(){simple('tm_role',{p_mid:mid|0,p_role:r},'Đã nhường ngôi')});
  else simple('tm_role',{p_mid:mid|0,p_role:r},r==='lao'?'Đã phong Trưởng Lão':'Đã hạ xuống Đệ Tử')}
function saveNotice(){
  var el=document.getElementById('tmg-nt');if(!el)return;
  simple('tm_notice',{p_text:String(el.value||'').slice(0,80)},'Đã cập nhật thông báo')}
function search(){var el=document.getElementById('tmg-q');S.q=el?String(el.value||'').trim():'';loadList(0)}

/* ---------- giao diện ---------- */
(function css(){var st=document.createElement('style');st.id='tmg-css';
 st.textContent='.tmg-ov{position:fixed;inset:0;z-index:99999;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px}'
 +'.tmg-bx{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#15110a;border:2px solid '+COL+';border-radius:14px;padding:12px 14px;color:#f3ead2;font-family:'+FONT+';box-shadow:0 0 24px #e0b04a44}'
 +'.tmg-bx h3{margin:0 0 4px;font-size:18px;color:#ffe9a8}.tmg-bx small{display:block;opacity:.85;line-height:1.4}'
 +'.tmg-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.tmg-tabs button{flex:1 1 22%;min-width:0;padding:6px 2px;font-size:12px}'
 +'.tmg-bt{padding:6px 10px;border-radius:8px;border:1px solid '+COL+';background:#2a2110;color:#fff2c9;font-size:13px;font-family:inherit}'
 +'.tmg-bt.on{background:#6a4d12}.tmg-bt.dn{border-color:#a05a5a;background:#321a1a}.tmg-bt.sm{padding:3px 7px;font-size:12px}.tmg-bt[disabled]{opacity:.45}'
 +'.tmg-cd{border:1px solid #5a4a22;border-radius:10px;background:#1e180d;padding:8px 10px;margin:7px 0}'
 +'.tmg-cd b{font-size:14px}.tmg-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}'
 +'.tmg-bar{height:8px;border-radius:4px;background:#2c2412;margin:6px 0 2px;overflow:hidden}.tmg-bar i{display:block;height:100%;background:linear-gradient(90deg,#c98f1a,#ffd96a)}'
 +'.tmg-in{flex:1;min-width:0;padding:6px 8px;border-radius:8px;border:1px solid #6a5a2c;background:#0e0b05;color:#fff2c9;font-size:14px;font-family:inherit}'
 +'.tmg-nt{min-height:18px;color:#ffe9a8;font-size:12px;margin:6px 0}';
 document.head.appendChild(st)})();
function bt(label,act,cls,dis){return '<button class="tmg-bt'+(cls?' '+cls:'')+'" '+(dis||S.busy?'disabled ':'')+'onclick="TMG.act('+act+')">'+label+'</button>'}
function tabs(g){
  var T=g?[['main','🏯 Tông'],['mem','👥 Người']].concat(EXT.map(function(x){return [x.id,x.label]}),[['top','🏆 Hạng']]):[['find','🔎 Tìm Tông'],['new','➕ Lập Tông'],['top','🏆 Xếp Hạng']];
  return '<div class="tmg-tabs">'+T.map(function(t){return '<button class="tmg-bt'+(S.tab===t[0]?' on':'')+'" onclick="TMG.act(\'tab\',\''+t[0]+'\')">'+t[1]+'</button>'}).join('')+'</div>'}
function buffTx(l){return 'HP +'+(CF.buff.hpp*l)+'% · Sát thương +'+(CF.buff.dmgp*l)+'% · Vàng rơi +'+(CF.buff.goldp*l)+'%'}
function listHtml(canJoin){
  var L=S.list,h='';
  h+='<div class="tmg-row"><input id="tmg-q" class="tmg-in" maxlength="12" placeholder="Tìm theo tên tông..." value="'+esc(S.q)+'">'+bt('Tìm','\'search\'')+'</div>';
  if(S.loading)return h+'<div class="tmg-cd">⏳ Đang tải...</div>';
  if(!L)return h;
  if(L.status!=='ok')return h+'<div class="tmg-cd">'+esc(errTx(L))+'</div>';
  var a=L.list||[],more=a.length>15;if(more)a=a.slice(0,15);
  if(!a.length)h+='<div class="tmg-cd">Chưa có tông môn nào'+(S.q?' khớp tên này':'')+'.</div>';
  a.forEach(function(x,i){
    h+='<div class="tmg-cd"><b>#'+(S.off+i+1)+' '+esc(x.name)+'</b> · Lv.'+(x.lv|0)+' · '+(x.cnt|0)+'/'+(x.max|0)
      +'<small>Tông Chủ: '+esc(x.leader||'?')+(x.notice?' — '+esc(x.notice):'')+'</small>'
      +'<small>'+(x.mode==='apply'?'📨 Xin vào (cần duyệt)':x.mode==='closed'?'🔒 Đóng cửa':'🟢 Mở cửa')+'</small>'
      +(canJoin?'<div class="tmg-row">'+bt(x.mode==='apply'?'Xin vào':x.mode==='closed'?'Đóng cửa':'Gia nhập','\'join\','+(x.id|0),'',(x.cnt|0)>=(x.max|0)||x.mode==='closed')+'</div>':'')+'</div>'});
  h+='<div class="tmg-row">'+bt('◀ Trước','\'page\',-1','',S.off<=0)+bt('Sau ▶','\'page\',1','',!more)+'</div>';
  return h}
function render(){
  if(!ovEl||!document.body.contains(ovEl))return;
  var M=S.me,g=M&&M.guild,h='<div class="tmg-bx"><h3>🏯 Nhà Tông Môn</h3>';
  if(!online()){
    h+='<div class="tmg-cd">☁ Cần đăng nhập tài khoản để dùng Tông Môn.</div>'+bt('Đóng','\'close\'')+'</div>';ovEl.innerHTML=h;return}
  if(!M){h+='<div class="tmg-cd">⏳ Đang tải...</div>'+bt('Đóng','\'close\'')+'</div>';ovEl.innerHTML=h;return}
  if(M.status!=='ok'){h+='<div class="tmg-cd">'+esc(errTx(M))+'</div><div class="tmg-row">'+bt('Thử lại','\'reload\'')+bt('Đóng','\'close\'')+'</div></div>';ovEl.innerHTML=h;return}
  if(g){
    var pct=g.lv>=10?100:Math.min(100,Math.round(g.exp/g.need*100)),R=ROLE[g.role]||ROLE.de,mng=g.role==='chu'||g.role==='lao';
    h+='<small>'+esc(g.name)+' · Lv.'+g.lv+' · '+g.cnt+'/'+g.max+' thành viên</small>'+tabs(true)+'<div class="tmg-nt">'+esc(S.note)+'</div>';
    if(S.tab==='main'){
      h+='<div class="tmg-cd"><b>'+esc(g.name)+' · Cấp '+g.lv+(g.lv>=10?' (MAX)':'')+'</b>'
        +'<div class="tmg-bar"><i style="width:'+pct+'%"></i></div><small>EXP '+(g.lv>=10?'đã đầy':nf(g.exp)+' / '+nf(g.need))+'</small>'
        +'<small>Chức của bạn: '+R.e+' '+R.n+' · Cống hiến: '+nf(g.ct)+(g.bal!=null?' (khả dụng '+nf(g.bal)+')':'')+'</small>'
        +'<small>✨ Buff hiện tại: '+buffTx(g.lv)+'</small>'
        +((g.role==='chu'||g.role==='lao')&&g.apps>0?'<small style="color:#ffd96a">📨 '+g.apps+' đơn xin vào đang chờ — vào tab Người để duyệt</small>':'')
        +(g.lv<10?'<small>Cấp '+(g.lv+1)+': '+buffTx(g.lv+1)+'</small>':'')+'</div>';
      h+='<div class="tmg-cd"><b>📜 Điểm danh</b><small>+'+nf(CF.daily.gold+CF.daily.perLv*g.lv)+'💰 · +10 cống hiến · +60 exp tông (1 lần/ngày, giờ VN)</small>'
        +'<div class="tmg-row">'+bt(g.ck?'✔ Đã điểm danh':'Điểm danh','\'checkin\'','',g.ck)+'</div></div>';
      h+='<div class="tmg-cd"><b>💰 Quyên góp vàng</b><small>10.000💰 = 1 exp tông + 1 cống hiến · hôm nay còn '+nf(g.dleft)+'💰 · bạn có '+nf(G())+'💰</small><div class="tmg-row">'
        +CF.donate.presets.map(function(n){return bt(nf(n/1000000)+'tr','\'donate\','+n,'',n>g.dleft||n>G())}).join('')+'</div>'
        +'<div class="tmg-row"><input id="tmg-don" class="tmg-in" inputmode="numeric" placeholder="Số vàng khác...">'+bt('Quyên','\'donate\'')+'</div></div>';
      h+='<div class="tmg-cd"><b>📢 Thông báo</b><small>'+(g.notice?esc(g.notice):'(chưa có)')+'</small>'
        +(mng?'<div class="tmg-row"><input id="tmg-nt" class="tmg-in" maxlength="80" placeholder="Nội dung (tối đa 80 ký tự)" value="'+esc(g.notice)+'">'+bt('Lưu','\'notice\'')+'</div>':'')+'</div>';
      h+='<div class="tmg-row">'+(g.role==='chu'?bt('Giải tán','\'disband\'','dn'):bt('Rời tông','\'leave\'','dn'))+bt('Đóng','\'close\'')+'</div>';
    }else if(S.tab==='mem'){
      if(g.role==='chu'){
        h+='<div class="tmg-cd"><b>🚪 Chế độ vào tông</b><div class="tmg-row">'
          +[['open','🟢 Mở cửa'],['apply','📨 Duyệt'],['closed','🔒 Đóng']].map(function(o){return bt(o[1],'\'mode\',\''+o[0]+'\'',g.mode===o[0]?'on':'',g.mode===o[0])}).join('')+'</div></div>'}
      if(mng){
        if(!S.apps&&!S.appsLoading)loadApps();
        var A=S.apps&&S.apps.status==='ok'?S.apps.list||[]:[];
        h+='<div class="tmg-cd"><b>📨 Đơn xin vào ('+A.length+')</b>'+(S.appsLoading&&!S.apps?'<small>⏳ Đang tải...</small>':'')
          +(A.length?A.map(function(a){return '<div class="tmg-row"><span style="flex:1">'+esc(a.name)+' <small style="display:inline">· '+(a.ago|0)+' giờ trước</small></span>'+bt('✔','\'appdo\','+(a.aid|0)+',1','sm on')+bt('✖','\'appdo\','+(a.aid|0)+',0','sm dn')+'</div>'}).join(''):(S.apps?'<small>Không có đơn nào.</small>':''))+'</div>'}
      (M.members||[]).forEach(function(m){
        var r=ROLE[m.role]||ROLE.de,mine=m.mid===g.me,on=(m.ago|0)<=5;
        h+='<div class="tmg-cd"><b style="color:'+r.c+'">'+r.e+' '+esc(m.name||'?')+(mine?' (bạn)':'')+'</b> · '+r.n
          +'<small>Cống hiến '+nf(m.ct)+' · '+(on?'🟢 mới online':'⚪ '+hms((m.ago|0)*60)+' trước')+'</small>';
        if(!mine){
          var b='';
          if(g.role==='chu'){
            b+=(m.role==='lao'?bt('Hạ Đệ Tử','\'role\','+m.mid+',\'de\'','sm'):bt('Phong Trưởng Lão','\'role\','+m.mid+',\'lao\'','sm'))
              +bt('Nhường ngôi','\'role\','+m.mid+',\'chu\'','sm')+bt('Đuổi','\'kick\','+m.mid,'sm dn')}
          else if(g.role==='lao'&&m.role==='de')b+=bt('Đuổi','\'kick\','+m.mid,'sm dn');
          if(b)h+='<div class="tmg-row">'+b+'</div>'}
        h+='</div>'});
      h+=bt('Đóng','\'close\'');
    }else if(extOf(S.tab)){
      h+=extOf(S.tab).html(g)+'<div class="tmg-row">'+bt('Đóng','\'close\'')+'</div>';
    }else{
      if(!S.list&&!S.loading)loadList(0);
      h+=listHtml(false)+'<div class="tmg-row">'+bt('Đóng','\'close\'')+'</div>'}
  }else{
    h+='<small>Chưa có tông môn. Gia nhập một tông hoặc tự lập để nhận buff HP / sát thương / vàng rơi.</small>'+tabs(false)
      +'<div class="tmg-nt">'+esc(S.note)+(M.cool>0?' ⏳ Chờ '+hms(M.cool)+' nữa mới vào tông khác.':'')+'</div>'
      +(M.applied?'<div class="tmg-cd"><b>📨 Đang chờ duyệt</b><small>Đơn xin vào <b>'+esc(M.applied)+'</b> — tối đa 3 ngày.</small><div class="tmg-row">'+bt('Huỷ đơn','\'cancelapp\'','dn')+'</div></div>':'');
    if(S.tab==='new'){
      h+='<div class="tmg-cd"><b>➕ Lập tông môn</b><small>Phí: '+nf(CF.create.gold)+'💰 + '+CF.create.lt+'💎 (bạn có '+nf(G())+'💰). Tên 2–12 ký tự, không trùng.</small>'
        +'<div class="tmg-row"><input id="tmg-name" class="tmg-in" maxlength="12" placeholder="Tên tông môn">'+bt('Lập','\'create\'')+'</div></div>'}
    else{
      if(S.tab!=='top'&&S.tab!=='find')S.tab='find';
      if(!S.list&&!S.loading)loadList(0);
      h+=listHtml(S.tab==='find')}
    h+='<div class="tmg-row">'+bt('Đóng','\'close\'')+'</div>'}
  h+='</div>';
  var keep=null;try{var a=document.activeElement;if(a&&a.id&&ovEl.contains(a))keep={id:a.id,v:a.value}}catch(e){}
  ovEl.innerHTML=h;
  if(keep){try{var e2=document.getElementById(keep.id);if(e2){e2.value=keep.v}}catch(e){}}}
function open(tab){
  var old=document.getElementById('tmg-ov');if(old)old.remove();
  ovEl=document.createElement('div');ovEl.id='tmg-ov';ovEl.className='tmg-ov';
  ovEl.addEventListener('click',function(e){if(e.target===ovEl)close()});
  document.body.appendChild(ovEl);isOpen=true;
  S.me=null;S.list=null;S.note='';S.busy=false;S.q='';S.off=0;S.tab='main';S.loading=false;
  render();
  if(!online())return;
  refresh(function(r){if(r&&r.status==='ok'){S.tab=r.guild?(typeof tab==='string'?tab:'main'):'find';if(!r.guild){S.list=null}}render()})}
function close(){isOpen=false;if(ovEl){ovEl.remove();ovEl=null}}
function act(a,x,y){
  switch(a){
    case 'tab':S.tab=x;S.note='';if(x==='top'||x==='find'){S.q='';S.list=null}render();break;
    case 'search':search();break;
    case 'page':loadList(S.off+x*15);break;
    case 'create':create();break;
    case 'join':join(x);break;
    case 'checkin':checkin();break;
    case 'donate':donate(x);break;
    case 'notice':saveNotice();break;
    case 'leave':leave();break;
    case 'disband':disband();break;
    case 'kick':kick(x);break;
    case 'role':role(x,y);break;
    case 'reload':S.me=null;render();refresh();break;
    case 'ext':{var X=extOf(x);if(X)X.act(y)}break;
    case 'appdo':appDo(x,y);break;
    case 'mode':setMode(x);break;
    case 'cancelapp':cancelApp();break;
    case 'close':close();break;
  }}

/* ---------- gắn vào Nhà Bí Ẩn (1) = TT2.houses[3] ---------- */
function hook(){
  try{
    if(window.TT2&&TT2.houses&&TT2.houses[3]){
      var H=TT2.houses[3];H.l1='Tông Môn';H.l2='Bang Hội';H.full='Nhà Tông Môn';H.ch='宗';H.col='#b8872a';
      H.open=function(){open()};return true}
  }catch(e){}return false}
if(!hook()){var n=0,iv=setInterval(function(){if(hook()||++n>40)clearInterval(iv)},500)}

/* ---------- cập nhật cấp tông nền (để buff đúng dù chưa mở nhà) ---------- */
setTimeout(function(){try{if(online())refresh()}catch(e){}},6000);
setInterval(function(){try{if(online()&&!document.hidden)refresh()}catch(e){}},Math.max(60,CF.every)*1000);

window.TMG={cfg:CF,open:open,close:close,lv:lv,buff:buff,refresh:function(){refresh()},act:act,
  addTab:function(id,label,html,act){if(!extOf(id))EXT.push({id:id,label:label,html:html,act:act})},
  tab:function(){return S.tab},members:function(){return (S.me&&S.me.members)||[]},render:function(){render()},reopen:function(t){open(t)},isOpen:function(){return isOpen}};
})();
