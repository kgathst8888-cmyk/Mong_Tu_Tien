/* ===== 💬 TÔNG MÔN — XÃ HỘI (world/127-tong-mon-xahoi.js) — Fix380/Fix384 — nạp SAU world/106 =====
 * Cần chạy tong_mon_xahoi.sql (sau tong_mon.sql, tong_mon_boss.sql, tong_mon_shop.sql) 1 lần trong Supabase. Thiếu SQL → tab báo "chưa kích hoạt".
 *   • Tab "💬 Chat" trong Nhà Tông Môn: chat riêng của tông (chỉ thành viên thấy, 200 tin gần nhất, 120 ký tự, 2 giây/tin) + "📜 Nhật ký"
 *     (vào / rời / bị đuổi / phong chức / lên cấp tông / hạ boss / Tông Chiến / kho). Tự cập nhật mỗi CF.poll giây khi tab đang mở (chỉ vẽ lại danh sách,
 *     không đóng bàn phím khi đang gõ).
 *   • TMTAG.get(id): tên Tông Môn của người chơi khác theo mã băm 10 ký tự (cùng mã vp_ping của làng online) → world/41 vẽ "Lv.x [Tông] Tên" và thẻ người chơi
 *     có dòng 🏯 Tông. Gộp truy vấn (tối đa 40 mã mỗi lần, trễ CF.tagDelay ms), nhớ CF.tagTtl giây. Chat thế giới (systems/28) lấy cột tag có sẵn từ chat_recent.
 * Gỡ <script> → mất tab Chat + mất [Tông] ở làng online (chat thế giới vẫn hiện nếu server trả tag). API: TMX.cfg · TMX.html · TMX.act · TMTAG.get */
(function(){
'use strict';
if(window.TMX||!window.TMG||!TMG.addTab||typeof document==='undefined')return;
var CF=window.TMX_CF={poll:6,tagDelay:1500,tagTtl:300};

function esc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]})}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function pad(n){return n<10?'0'+n:''+n}
function hm(ts){var d=new Date(ts*1000);return pad(d.getHours())+':'+pad(d.getMinutes())}
function dm(ts){var d=new Date(ts*1000);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes())}
function err(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Chat tông chưa kích hoạt trên máy chủ (cần chạy tong_mon_xahoi.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='none'?'Bạn chưa có tông môn':s==='slow'?'Gửi chậm lại một chút (2 giây / tin)':s==='empty'?'Hãy nhập nội dung':'Không thực hiện được'}

/* ---------- 💬 CHAT + 📜 NHẬT KÝ ---------- */
var C={view:'chat',msgs:[],last:0,log:null,st:null,loading:false,busy:false,note:'',loaded:false};
function paint(){
  var el=document.getElementById('tmx-list');if(!el)return;
  var h;
  if(C.view==='log'){
    h=!C.log?'<small>⏳ Đang tải...</small>':C.log.status!=='ok'?'<small>'+esc(err(C.log))+'</small>':
      (C.log.log.length?C.log.log.map(function(x){return '<div class="tmx-l"><small style="display:inline;color:#9a8a5a">'+dm(x.ts)+'</small> '+esc(x.txt)+'</div>'}).join(''):'<small>Chưa có hoạt động nào.</small>')}
  else{
    h=C.st&&C.st.status!=='ok'?'<small>'+esc(err(C.st))+'</small>':
      (C.msgs.length?C.msgs.map(function(m){return '<div class="tmx-m'+(m.me?' me':'')+'"><b>'+esc(m.name||'?')+'</b>: '+esc(m.msg)+' <small style="display:inline;color:#8a7a50">'+hm(m.ts)+'</small></div>'}).join(''):
        (C.loaded?'<small>Chưa có tin nhắn. Hãy chào cả tông!</small>':'<small>⏳ Đang tải...</small>'))}
  var stick=el.scrollHeight-el.scrollTop-el.clientHeight<40;
  el.innerHTML=h;if(stick||C.view==='chat')el.scrollTop=el.scrollHeight}
function pull(first){
  if(C.loading||!online())return;C.loading=true;
  rpc('tm_chat_recent',{p_after:first?0:C.last}).then(function(r){
    C.loading=false;C.st=r;
    if(r&&r.status==='ok'){
      if(first){C.msgs=[];}
      (r.msgs||[]).forEach(function(m){if(m.id>C.last){C.msgs.push(m);C.last=m.id}});
      if(C.msgs.length>80)C.msgs=C.msgs.slice(-80);
      C.loaded=true}
    paint()})}
function pullLog(){
  rpc('tm_log_recent').then(function(r){C.log=r;paint()})}
function html(g){
  if(C.gid!==g.id){C.gid=g.id;C.loaded=false;C.msgs=[];C.last=0;C.log=null}   /* đổi tông / nhân vật → tải lại từ đầu */
  if(!C.loaded&&!C.loading){C.msgs=[];C.last=0;pull(true)}
  if(C.view==='log'&&!C.log)pullLog();
  var h='<div class="tmg-nt">'+esc(C.note)+'</div>'
   +'<div class="tmg-row" style="margin-top:0">'
   +'<button class="tmg-bt'+(C.view==='chat'?' on':'')+'" onclick="TMG.act(\'ext\',\'chat\',\'view:chat\')">💬 Chat tông</button>'
   +'<button class="tmg-bt'+(C.view==='log'?' on':'')+'" onclick="TMG.act(\'ext\',\'chat\',\'view:log\')">📜 Nhật ký</button></div>'
   +'<style>.tmx-l,.tmx-m{padding:3px 0;border-bottom:1px solid #2a2210;font-size:13px;line-height:1.35;word-break:break-word}.tmx-m.me{background:#2a2110}</style>'
   +'<div id="tmx-list" class="tmg-cd" style="height:230px;overflow-y:auto;-webkit-overflow-scrolling:touch"><small>⏳ Đang tải...</small></div>';
  if(C.view==='chat')
    h+='<div class="tmg-row"><input id="tmx-in" class="tmg-in" maxlength="120" placeholder="Nhắn cho cả tông..." onkeydown="if(event.key===\'Enter\')TMG.act(\'ext\',\'chat\',\'send\')">'
      +'<button class="tmg-bt on" onclick="TMG.act(\'ext\',\'chat\',\'send\')">Gửi</button></div>';
  setTimeout(paint,0);
  return h}
function act(a){
  var q=String(a||'').split(':'),k=q[0],v=q[1];
  if(k==='view'){C.view=v==='log'?'log':'chat';C.note='';if(C.view==='log')C.log=null;TMG.render()}
  else if(k==='send')send()}
function send(){
  if(C.busy)return;
  var el=document.getElementById('tmx-in'),t=el?String(el.value||'').trim():'';
  if(!t)return;
  C.busy=true;
  rpc('tm_chat_send',{p_text:t}).then(function(r){
    C.busy=false;
    if(r&&r.status==='ok'){var e2=document.getElementById('tmx-in');if(e2)e2.value='';C.note='';pull(false)}
    else{C.note=err(r);TMG.render()}})}
setInterval(function(){
  try{if(!document.hidden&&TMG.isOpen()&&TMG.tab()==='chat'){if(C.view==='chat')pull(false);else pullLog()}}catch(e){}
},Math.max(3,CF.poll)*1000);

/* ---------- 🏯 TÊN TÔNG CỦA NGƯỜI CHƠI KHÁC (làng online) ---------- */
var TG={c:{},q:{},t:0};
function flush(){
  TG.t=0;
  var ids=Object.keys(TG.q).slice(0,40);if(!ids.length)return;
  ids.forEach(function(i){delete TG.q[i]});
  rpc('tm_tags',{p_ids:ids}).then(function(r){
    var now=Date.now(),m=(r&&r.status==='ok'&&r.tags)||{};
    ids.forEach(function(i){TG.c[i]={tag:m[i]||'',exp:now+(r&&r.status==='ok'?CF.tagTtl:30)*1000}});
    if(Object.keys(TG.q).length&&!TG.t)TG.t=setTimeout(flush,CF.tagDelay)})}
window.TMTAG={get:function(id){
  if(!id||!online())return '';
  var e=TG.c[id],now=Date.now();
  if(!e||e.exp<=now){
    if(!TG.q[id]){TG.q[id]=1;if(!TG.t)TG.t=setTimeout(flush,CF.tagDelay)}
    if(!e)TG.c[id]={tag:'',exp:now+30000};     /* tránh hỏi lại liên tục khi đang chờ */
  }
  return e?e.tag:''}};

TMG.addTab('chat','💬 Chat',html,act);
window.TMX={cfg:CF,html:html,act:act};
})();
