/* ===== 🛡 TRANG ADMIN (ui/70-admin-panel.js, nạp sau ui/69) =====
 * Nút tròn 🛡 Admin nằm cạnh ✉️ Thư (left:192px, top:132px). CHỈ HIỆN với tài khoản có trong bảng Supabase `kthm_admin`
 * (game gọi RPC admin_is sau khi đăng nhập). Người chơi thường không thấy nút, và có tự gọi RPC cũng bị máy chủ từ chối (NOT_ADMIN).
 * Bảng có 4 tab:
 *   👤 Tài khoản : tìm theo email/UUID · xem online · cộng/trừ Linh Thạch · đá khỏi game · khoá đăng nhập · cấm chat
 *   🎁 Gửi quà   : gửi thư kèm quà (vàng, vật phẩm Cash Shop, quặng, rương trang bị) cho TẤT CẢ hoặc 1 tài khoản
 *   📢 Thông báo : đăng thông báo toàn game (hiện ở mục 📢 Thông báo của người chơi) + đặt hạn + xoá
 *   ✉️ Đã gửi    : danh sách thư đã gửi + 🗑 thu hồi thư CHƯA nhận
 *   📜 Nhật ký   : 40 thao tác admin gần nhất
 *   🧪 Test      : chỉnh nhân vật ĐANG CHƠI (cộng tu vi, đặt cảnh giới + tầng, ☯ Đạo Linh (EXP), cấp độ Phàm Thể, cấp độ Đạo Thể, cấp độ Tiên Nhân, ♻ reset nhân vật, 💰 vàng/mảnh/điểm, 🛡 bất tử, ☠ diệt quái, 🎒 tạo trang bị) — chỉ trên máy, bỏ qua điều kiện đột phá
 * Máy chủ: chạy admin.sql 1 lần trong Supabase → SQL Editor, rồi tự cấp quyền admin cho email của bạn (câu lệnh ở cuối đầu file admin.sql).
 * Không sửa module cũ; chỉ dùng KCL.rpc (systems/12-cloud-save.js). Quà trong thư dùng đúng định dạng của ui/69-thong-bao-thu.js. */
(function(){
'use strict';
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'];
function itM(){try{return window.MAIL&&window.MAIL.IT||{}}catch(e){return{}}}
function itl(){var m=itM(),o=[];Object.keys(m).forEach(function(k){o.push([k,m[k].e+' '+m[k].n,m[k].max])});return o}
var CSHL=[['b10','📜 Bùa Cường Hóa +10%'],['b15','📜 Bùa Cường Hóa +15%'],['b20','📜 Bùa Cường Hóa +20%'],['ham','🔨 Búa Đục Lỗ'],
  ['g10','📜 Bùa Ghép Ngọc +10%'],['dh','🔮 Ngọc Định Hồn'],['vx','📈 Vé Tăng 20% EXP'],['vt','🧘 Vé Tăng 20% Tu Vi'],['tc','🎯 Vé Tẩy Opt Chọn'],['x5','📈 Bùa EXP +50%'],['x7','📈 Bùa EXP +70%']];
var DUR=[[1,'1 giờ'],[24,'1 ngày'],[72,'3 ngày'],[168,'7 ngày'],[720,'30 ngày'],[876000,'Vĩnh viễn']];
var ACTL={lt:'💎 Linh Thạch',mail:'🎁 Gửi thư',mail_del:'🗑 Thu hồi thư',kick:'⏏ Đá khỏi game',notice:'📢 Đăng thông báo',notice_del:'🗑 Xoá thông báo',ban:'🔒 Khoá tài khoản',unban:'🔓 Mở khoá',chat_ban:'🤐 Cấm chat',chat_unban:'🔊 Gỡ cấm chat'};

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function fmtT(ts){try{var d=new Date(ts);if(isNaN(d))return'—';return d.toLocaleDateString('vi-VN')+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}catch(e){return'—'}}
function started_(){try{return !!started}catch(e){return false}}
function logged(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}catch(e){return false}}
function myUid(){try{var s=KCL.sess();return s&&s.user&&s.user.id||''}catch(e){return''}}
function call(fn,args){try{return Promise.resolve(KCL.rpc(fn,args||{}))}catch(e){return Promise.reject(e)}}
function parse(r){if(typeof r==='string'){try{return JSON.parse(r)}catch(e){}}return r}
function errMsg(e){
  var m=String((e&&(e.message||e.msg||e.error_description))||e||''),c=String((e&&e.code)||'');
  if(m.indexOf('NOT_ADMIN')>=0)return'Tài khoản này không có quyền admin.';
  if(m.indexOf('NO_USER')>=0)return'Không tìm thấy tài khoản.';
  if(m.indexOf('AMOUNT_TOO_BIG')>=0)return'Số lượng quá lớn (tối đa 100.000.000).';
  if(m.indexOf('CANNOT_TARGET_ADMIN')>=0)return'Không thể khoá tài khoản admin.';
  if(m.indexOf('NO_TITLE')>=0)return'Thiếu tiêu đề thư.';
  if(m.indexOf('SESSION_INVALID')>=0)return'Phiên đăng nhập không còn hiệu lực, hãy đăng nhập lại.';
  if(c==='PGRST202'||(e&&e.status===404))return'Máy chủ chưa có hàm admin — hãy chạy admin.sql trong Supabase SQL Editor.';
  return m||'Lỗi không xác định';
}

/* ---------- trạng thái ---------- */
var isAdmin=false,checkedFor='',checking=false,el=null,btn=null,open=false;
function defF(){return{title:'Quà từ Hệ Thống',body:'',gold:'',fe:'',hk:'',eqr:'3',eqn:'',days:'14',c:{},it:{}}}
var S={notes:null,nf:{title:'',body:'',days:'7'},tab:'acc',q:'',lastQ:'',list:null,sel:'',selU:null,busy:false,note:'',mails:null,logs:null,to:'all',f:defF(),reset:0};

function val(id){var n=document.getElementById(id);return n?n.value:''}
function isBanned(u){return !!(u&&u.banned_until&&Date.parse(u.banned_until)>Date.now())}
function qs(q){
  if(!q||typeof q!=='object')return'';
  var t=[];
  if(q.gold)t.push('💰 '+nf(q.gold)+' vàng');
  if(q.csh)CSHL.forEach(function(x){if(q.csh[x[0]])t.push(x[1]+' ×'+q.csh[x[0]])});
  if(q.fe)t.push('⛏ '+nf(q.fe)+' sắt');
  if(q.hk)t.push('⛏ '+nf(q.hk)+' huyền kim');
  if(q.eq)t.push('🎁 Rương trang bị '+(RN[q.eq.r]||q.eq.r)+' ×'+q.eq.n);
  if(q.it){var M=itM();Object.keys(q.it).forEach(function(k){t.push((M[k]?M[k].e+' '+M[k].n:k)+' ×'+nf(q.it[k]))})}
  return t.join(' · ');
}
function buildQ(f){
  var q={},n;
  if((n=Math.floor(+f.gold))>0)q.gold=Math.min(n,2e9);
  var c={};CSHL.forEach(function(x){var v=Math.floor(+(f.c||{})[x[0]]);if(v>0)c[x[0]]=Math.min(v,1000)});
  if(Object.keys(c).length)q.csh=c;
  if((n=Math.floor(+f.fe))>0)q.fe=Math.min(n,1e6);
  if((n=Math.floor(+f.hk))>0)q.hk=Math.min(n,1e6);
  var r=Math.floor(+f.eqr),k=Math.floor(+f.eqn);
  if(k>0&&r>=0&&r<=5)q.eq={r:r,n:Math.min(k,20)};
  var it={};itl().forEach(function(x){var v=Math.floor(+(f.it||{})[x[0]]);if(v>0)it[x[0]]=Math.min(v,x[2])});
  if(Object.keys(it).length)q.it=it;
  return Object.keys(q).length?{qua:q,txt:qs(q)}:{qua:null,txt:''};
}
function saveForm(){
  if(el&&S.tab==='note'){Array.prototype.forEach.call(el.querySelectorAll('[data-n]'),function(n){S.nf[n.getAttribute('data-n')]=n.value});return}
  if(!el||S.tab!=='gift')return;
  var f=S.f;
  Array.prototype.forEach.call(el.querySelectorAll('[data-f]'),function(n){
    var k=n.getAttribute('data-f');
    if(k.indexOf('c_')===0){f.c=f.c||{};f.c[k.slice(2)]=n.value}else if(k.indexOf('i_')===0){f.it=f.it||{};f.it[k.slice(2)]=n.value}else f[k]=n.value;
  });
}

/* ---------- giao diện ---------- */
function build(){
  var st=document.createElement('style');
  st.textContent=
  '#adm-b{position:fixed;top:calc(132px + env(safe-area-inset-top,0px));left:192px;width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;padding:0;box-shadow:0 2px 8px #0008}'
  +'#adm-b::after{content:"Admin";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 9px/10px '+FONT+';color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}'
  +'#adm{display:none;position:fixed;z-index:13;background:linear-gradient(#2a2118,#0e0a08);color:#f2e3b3;font-family:'+FONT+';box-sizing:border-box;flex-direction:column;padding-bottom:env(safe-area-inset-bottom,0px)}'
  +'#adm.pt{left:0;right:0;bottom:0;top:12%;border-top:2px solid #b8964e}#adm.ls{top:0;bottom:0;right:0;width:min(460px,100%);border-left:2px solid #b8964e}'
  +'#adm .ah{display:flex;align-items:center;padding:8px 12px;font-weight:700;font-size:16px;border-bottom:1px solid #4a3a2a}#adm .ah span{flex:1}'
  +'#adm .ah button{background:none;border:0;color:#f2e3b3;font-size:22px}'
  +'#adm .at{display:flex;border-bottom:1px solid #4a3a2a;overflow-x:auto;-webkit-overflow-scrolling:touch}#adm .at button{flex:1 0 auto;padding:9px 10px;background:none;border:0;color:#b9a77a;font:700 12px '+FONT+';white-space:nowrap}'
  +'#adm .at button.on{color:#ffd76a;border-bottom:2px solid #ffd76a}'
  +'#adm .an{padding:5px 12px;font-size:12px;color:#ffd98a;border-bottom:1px dashed #4a3a2a}'
  +'#adm .al{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 10px}'
  +'#adm .ae{text-align:center;opacity:.6;padding:26px 10px;font-size:13px}'
  +'#adm .ar{display:flex;gap:6px;margin:0 0 6px;align-items:center;flex-wrap:wrap}#adm .ar>input,#adm .ar>select{flex:1;min-width:0}'
  +'#adm input,#adm textarea,#adm select{font:16px '+FONT+';color:#f2e3b3;background:#0e0a08;border:1px solid #4a3a2a;border-radius:6px;padding:6px 8px;box-sizing:border-box;max-width:100%}'
  +'#adm textarea{width:100%;min-height:64px;resize:vertical}'
  +'#adm button.bt{font:inherit;font-size:12px;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:7px 10px}'
  +'#adm button.bt.dg{background:linear-gradient(#6a2222,#401212);border-color:#b86a6a}#adm button.bt.gr{background:linear-gradient(#245a2c,#12401a);border-color:#6ab87a}'
  +'#adm button.bt[disabled]{opacity:.5}'
  +'#adm .ai{border:1px solid #4a3a2a;border-radius:8px;margin:0 0 6px;background:#1d1510;overflow:hidden}#adm .ai.sl{border-color:#c9a24f;background:#2a1f14}'
  +'#adm .ar2{display:flex;align-items:center;gap:6px;padding:8px 10px;flex-wrap:wrap}#adm .ar2 .tc{flex:1;min-width:0}'
  +'#adm .ar2 b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#adm small{opacity:.7;font-size:11px;display:block}'
  +'#adm .tg{font:700 10px/14px sans-serif;padding:0 6px;border-radius:7px;background:#555;color:#fff;white-space:nowrap}'
  +'#adm .tg.ad{background:#8a6420}#adm .tg.on{background:#2a8a3a}#adm .tg.bn{background:#c33}#adm .tg.cb{background:#a5601a}'
  +'#adm .ac{padding:4px 10px 10px;border-top:1px dashed #4a3a2a;font-size:13px}#adm .ac h4{margin:10px 0 4px;font-size:13px;color:#ffd76a}'
  +'#adm .gr2{display:grid;grid-template-columns:1fr 84px;gap:4px 8px;align-items:center;margin:4px 0}#adm .gr2 input{width:100%}'
  +'#adm .tq{margin:6px 0;padding:6px 8px;border:1px dashed #c9a24f;border-radius:8px;background:#0008;font-size:12px}'
  +'#adm .lg{padding:6px 8px;border-bottom:1px solid #3a2c20;font-size:12px;line-height:1.4}#adm .lg b{color:#ffd76a}';
  document.head.appendChild(st);
  btn=document.createElement('button');btn.id='adm-b';btn.type='button';btn.title='Quản trị';btn.textContent='🛡';
  btn.onpointerdown=function(e){e.stopPropagation()};
  btn.onclick=function(e){e.stopPropagation();show()};
  document.body.appendChild(btn);
  el=document.createElement('div');el.id='adm';
  ['pointerdown','keydown','keyup','keypress'].forEach(function(t){el.addEventListener(t,function(e){
    e.stopPropagation();
    if(t==='keydown'&&e.key==='Enter'&&e.target&&e.target.id==='adm-q'){e.preventDefault();doFind(val('adm-q').trim())}
  })});
  el.addEventListener('click',onClick);
  document.body.appendChild(el);
  setInterval(tick,1000);
}
function show(){if(!isAdmin||!el)return;open=true;el.style.display='flex';S.reset=1;draw()}
function close(){open=false;if(el)el.style.display='none'}
function tabBtn(k,t){return'<button data-a="tab" data-v="'+k+'" class="'+(S.tab===k?'on':'')+'">'+t+'</button>'}
function durSel(id,def){return'<select id="'+id+'">'+DUR.map(function(d){return'<option value="'+d[0]+'"'+(d[0]===def?' selected':'')+'>'+d[1]+'</option>'}).join('')+'</select>'}

function draw(){
  if(!el||!open)return;
  try{el.className=PORT?'pt':'ls'}catch(e){el.className='pt'}
  var l0=el.querySelector('.al'),keep=(l0&&!S.reset)?l0.scrollTop:0;S.reset=0;
  var h='<div class="ah"><span>🛡 Quản trị <small style="opacity:.6;font-weight:normal">· bản Fix174</small></span><button data-a="x">✕</button></div>';
  h+='<div class="at">'+tabBtn('acc','👤 Tài khoản')+tabBtn('gift','🎁 Gửi quà')+tabBtn('note','📢 Thông báo')+tabBtn('mail','✉️ Đã gửi')+tabBtn('log','📜 Nhật ký')+tabBtn('test','🧪 Test')+'</div>';
  if(S.note)h+='<div class="an">'+esc(S.note)+'</div>';
  h+='<div class="al">'+(S.tab==='acc'?vAcc():S.tab==='gift'?vGift():S.tab==='note'?vNote():S.tab==='mail'?vMail():S.tab==='test'?vTest():vLog())+'</div>';
  el.innerHTML=h;
  var l1=el.querySelector('.al');if(l1)l1.scrollTop=keep;
}

function vAcc(){
  var h='<div class="ar"><input id="adm-q" type="text" placeholder="Email hoặc UUID…" value="'+esc(S.q)+'" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><button class="bt" data-a="find">🔍 Tìm</button></div>';
  h+='<div class="ar"><button class="bt" data-a="online">🟢 Đang online</button><button class="bt" data-a="recent">🕒 Mới đăng nhập</button></div>';
  if(S.list===null)h+='<div class="ae">Nhập email rồi bấm Tìm, hoặc xem danh sách đang online.</div>';
  else if(!S.list.length)h+='<div class="ae">Không có tài khoản nào khớp.</div>';
  else S.list.forEach(function(u){h+=vUser(u)});
  return h;
}
function vUser(u){
  var sel=S.sel===u.id,b='';
  if(u.is_admin)b+='<span class="tg ad">ADMIN</span>';
  if(u.online)b+='<span class="tg on">ONLINE</span>';
  if(isBanned(u))b+='<span class="tg bn">KHOÁ</span>';
  if(u.chat_ban)b+='<span class="tg cb">CẤM CHAT</span>';
  var h='<div class="ai'+(sel?' sl':'')+'"><div class="ar2" data-a="pick" data-id="'+esc(u.id)+'"><div class="tc"><b>'+esc(u.email||'(không có email)')+'</b>'
    +'<small>💎 '+nf(u.lt)+' LT'+(u.lk?' · 🔒 '+(u.lks||[]).map(nf).join('/'):'')+' · đăng nhập gần nhất: '+(u.last_sign_in_at?fmtT(u.last_sign_in_at):'—')+'</small></div>'+b+'<span>'+(sel?'▴':'▾')+'</span></div>';
  if(sel){
    h+='<div class="ac"><small>UUID: '+esc(u.id)+'</small>';
    if(isBanned(u))h+='<small>Khoá đến: '+fmtT(u.banned_until)+'</small>';
    if(u.online&&u.device)h+='<small>Thiết bị: '+esc(u.device)+'</small>';
    h+='<h4>💎 Linh Thạch KHÔNG KHOÁ (hiện có '+nf(u.lt)+(u.lk?' · khoá NV1/2/3: '+(u.lks||[]).map(nf).join('/'):'')+') — cộng ở đây = tiền nạp</h4><div class="ar"><input id="adm-lt" type="number" inputmode="numeric" min="1" placeholder="Số lượng"><button class="bt gr" data-a="ltadd">➕ Cộng</button><button class="bt dg" data-a="ltsub">➖ Trừ</button></div>';
    h+='<h4>🎁 Quà</h4><div class="ar"><button class="bt" data-a="giftto">Gửi thư quà cho người này</button></div>';
    h+='<h4>🔒 Khoá đăng nhập</h4><div class="ar">'+durSel('adm-bh',24)+'<button class="bt dg" data-a="ban">Khoá</button><button class="bt gr" data-a="unban">Mở khoá</button></div>';
    h+='<h4>🤐 Cấm chat</h4><div class="ar">'+durSel('adm-ch',24)+'<button class="bt dg" data-a="cban">Cấm</button><button class="bt gr" data-a="cunban">Gỡ cấm</button></div>';
    h+='<h4>⏏ Phiên chơi</h4><div class="ar"><button class="bt dg" data-a="kick">Đá khỏi game</button></div>';
    h+='</div>';
  }
  return h+'</div>';
}

function vGift(){
  var f=S.f,u=S.selU,h='';
  h+='<div class="ar"><button class="bt'+(S.to==='all'?' gr':'')+'" data-a="toall">'+(S.to==='all'?'✔ ':'')+'Tất cả người chơi</button>'
    +'<button class="bt'+(S.to==='sel'?' gr':'')+'" data-a="tosel">'+(S.to==='sel'?'✔ ':'')+(u?esc(u.email):'Người đã chọn (chưa chọn)')+'</button></div>';
  if(S.to==='all')h+='<small>Thư chung: mỗi nhân vật nhận 1 lần, người chơi nhận khi mở game (cập nhật mỗi ~2 phút).</small>';
  h+='<div class="ar" style="margin-top:8px"><input data-f="title" type="text" maxlength="80" placeholder="Tiêu đề thư" value="'+esc(f.title)+'"></div>';
  h+='<textarea data-f="body" maxlength="2000" placeholder="Nội dung thư (tuỳ chọn)">'+esc(f.body)+'</textarea>';
  h+='<div class="gr2"><span>💰 Vàng</span><input data-f="gold" type="number" inputmode="numeric" min="0" value="'+esc(f.gold)+'">'
    +'<span>⛏ Quặng sắt</span><input data-f="fe" type="number" inputmode="numeric" min="0" value="'+esc(f.fe)+'">'
    +'<span>⛏ Quặng huyền kim</span><input data-f="hk" type="number" inputmode="numeric" min="0" value="'+esc(f.hk)+'"></div>';
  h+='<div class="gr2">';
  CSHL.forEach(function(x){h+='<span>'+x[1]+'</span><input data-f="c_'+x[0]+'" type="number" inputmode="numeric" min="0" max="1000" value="'+esc((f.c||{})[x[0]]||'')+'">'});
  h+='</div>';
  h+='<h4 style="margin:10px 0 2px;font-size:13px;color:#ffd76a">🆕 Vật phẩm mới</h4><div class="gr2">';
  itl().forEach(function(x){h+='<span>'+x[1]+'</span><input data-f="i_'+x[0]+'" type="number" inputmode="numeric" min="0" max="'+x[2]+'" value="'+esc((f.it||{})[x[0]]||'')+'">'});
  h+='</div>';
  h+='<div class="ar"><span>🎁 Rương trang bị</span><select data-f="eqr">'+RN.map(function(n,i){return'<option value="'+i+'"'+(String(f.eqr)===String(i)?' selected':'')+'>'+n+'</option>'}).join('')+'</select>'
    +'<input data-f="eqn" type="number" inputmode="numeric" min="0" max="20" placeholder="SL" value="'+esc(f.eqn)+'" style="max-width:70px"></div>';
  h+='<div class="ar"><span>⏳ Hạn nhận</span><select data-f="days">'+[1,3,7,14].map(function(d){return'<option value="'+d+'"'+(String(f.days)===String(d)?' selected':'')+'>'+d+' ngày</option>'}).join('')+'</select></div>';
  h+='<div class="tq">Giới hạn mỗi thư: vàng ≤ 2 tỉ · mỗi loại vật phẩm Cash Shop ≤ 1000 · quặng ≤ 1 triệu · rương ≤ 20 · vật phẩm mới có mức tối đa ghi ở ô nhập (tuỳ loại). Hồn Phách chỉ nhận được khi người chơi đã chọn hồn phách. Linh Thạch gửi ở tab 👤 Tài khoản (không đi qua thư).</div>';
  h+='<div class="ar"><button class="bt gr" data-a="send">📨 Gửi thư</button><button class="bt" data-a="clear">Xoá form</button></div>';
  return h;
}

function vNote(){
  var f=S.nf,h='';
  h+='<div class="ar"><input data-n="title" type="text" maxlength="80" placeholder="Tiêu đề thông báo" value="'+esc(f.title)+'"></div>';
  h+='<textarea data-n="body" maxlength="3000" placeholder="Nội dung thông báo…" style="min-height:96px">'+esc(f.body)+'</textarea>';
  h+='<div class="ar"><span>⏳ Hiển thị</span><select data-n="days">'+[[1,'1 ngày'],[3,'3 ngày'],[7,'7 ngày'],[30,'30 ngày'],[0,'Không hết hạn']].map(function(d){return'<option value="'+d[0]+'"'+(String(f.days)===String(d[0])?' selected':'')+'>'+d[1]+'</option>'}).join('')+'</select></div>';
  h+='<div class="tq">Thông báo hiện cho TẤT CẢ người chơi ở mục 📢 Thông báo (game cập nhật khoảng 2 phút một lần). Xoá thông báo ở danh sách bên dưới nếu cần gỡ sớm.</div>';
  h+='<div class="ar"><button class="bt gr" data-a="sendnote">📢 Đăng thông báo</button><button class="bt" data-a="clearnote">Xoá form</button></div>';
  h+='<h4 style="margin:12px 0 6px;font-size:13px;color:#ffd76a">Đã đăng</h4>';
  if(S.notes===null)return h+'<div class="ae">Đang tải…</div>';
  if(!S.notes.length)return h+'<div class="ae">Chưa có thông báo nào.</div>';
  S.notes.forEach(function(m){
    h+='<div class="ai"><div class="ar2"><div class="tc"><b>'+esc(m.tieu_de)+'</b><small>'+fmtT(m.tao_luc)+(m.expired?' · ĐÃ HẾT HẠN':(m.het_han?' · hạn '+fmtT(m.het_han):' · không hết hạn'))+'</small>'
      +'<small>'+esc(String(m.noi_dung||'').slice(0,120))+'</small></div>'
      +'<button class="bt dg" data-a="delnote" data-id="'+esc(m.id)+'">🗑 Xoá</button></div></div>';
  });
  return h;
}

function vMail(){
  var h='<div class="ar"><button class="bt" data-a="reload">⟳ Tải lại</button></div>';
  h+='<div class="tq">Thu hồi chỉ xoá thư khỏi máy chủ nên người CHƯA nhận sẽ không thấy nữa. Quà người chơi đã nhận rồi nằm trong nhân vật của họ và không thu lại được từ đây (riêng Linh Thạch thì trừ được ở tab Tài khoản).</div>';
  if(S.mails===null)return h+'<div class="ae">Đang tải…</div>';
  if(!S.mails.length)return h+'<div class="ae">Chưa có thư nào.</div>';
  S.mails.forEach(function(m){
    h+='<div class="ai"><div class="ar2"><div class="tc"><b>'+esc(m.tieu_de)+'</b><small>'+(m.uid?'→ '+esc(m.email||m.uid):'→ Tất cả người chơi')+' · '+fmtT(m.tao_luc)+(m.expired?' · ĐÃ HẾT HẠN':' · hạn '+(m.het_han?fmtT(m.het_han):'—'))+'</small>'
      +(m.qua?'<small>'+esc(qs(m.qua))+'</small>':'<small>(không kèm quà)</small>')+'</div>'
      +'<button class="bt dg" data-a="delmail" data-id="'+esc(m.id)+'">🗑 Thu hồi</button></div></div>';
  });
  return h;
}

function vLog(){
  var h='<div class="ar"><button class="bt" data-a="reload">⟳ Tải lại</button></div>';
  if(S.logs===null)return h+'<div class="ae">Đang tải…</div>';
  if(!S.logs.length)return h+'<div class="ae">Chưa có thao tác nào.</div>';
  S.logs.forEach(function(l){
    var d=l.detail||{},x='';
    if(l.act==='lt')x=(d.amt>0?'+':'')+nf(d.amt)+' LT → còn '+nf(d.after);
    else if(l.act==='mail')x='"'+(d.title||'')+'" '+qs(d.qua);
    else if(l.act==='mail_del')x='thư #'+d.id;
    else if(l.act==='notice')x='"'+(d.title||'')+'" '+(d.days>0?d.days+' ngày':'không hết hạn');
    else if(l.act==='notice_del')x='thông báo #'+d.id;
    else if(l.act==='ban')x='đến '+(d.until?fmtT(d.until):'?');
    else if(l.act==='chat_ban')x=(d.hours||'?')+' giờ';
    h+='<div class="lg"><b>'+(ACTL[l.act]||esc(l.act))+'</b> · '+fmtT(l.at)+'<br>'+esc(l.admin_email||'?')+(l.target_email?' → '+esc(l.target_email):(l.act==='mail'?' → tất cả/—':''))+(x?'<br>'+esc(x):'')+'</div>';
  });
  return h;
}

/* ---------- thao tác ---------- */
function run(label,fn){
  if(S.busy)return;
  S.busy=true;S.note='⏳ '+label;draw();
  var done=function(){S.busy=false;draw()},p;
  try{p=fn()}catch(e){S.note='⚠ '+errMsg(e);return done()}
  Promise.resolve(p).then(function(){if(S.note.indexOf('⏳')===0)S.note=''},function(e){S.note='⚠ '+errMsg(e)}).then(done);
}
function query(){
  return call('admin_find',{p_q:S.lastQ}).then(function(r){
    S.list=parse(r)||[];var f=null;
    S.list.forEach(function(x){if(x.id===S.sel)f=x});
    S.selU=f;if(!f)S.sel='';
  });
}
function doFind(q){S.q=(q===':online')?S.q:q;S.lastQ=q;S.sel='';S.selU=null;run('Đang tìm…',query)}
function loadMails(){S.mails=null;run('Đang tải thư…',function(){return call('admin_list_mail').then(function(r){S.mails=parse(r)||[]})})}
function loadNotes(){S.notes=null;run('Đang tải thông báo…',function(){return call('admin_list_notice').then(function(r){S.notes=parse(r)||[]})})}
function loadLogs(){S.logs=null;run('Đang tải nhật ký…',function(){return call('admin_logs').then(function(r){S.logs=parse(r)||[]})})}
function needSel(){if(S.selU)return S.selU;S.note='⚠ Chưa chọn tài khoản.';draw();return null}

function onClick(e){
  var t=e.target.closest?e.target.closest('[data-a]'):null;if(!t||!el.contains(t))return;
  var a=t.getAttribute('data-a'),id=t.getAttribute('data-id'),u;
  if(a==='x'){saveForm();close();return}
  if(a==='tab'){saveForm();S.tab=t.getAttribute('data-v');S.note='';S.reset=1;
    if(S.tab==='mail')loadMails();else if(S.tab==='log')loadLogs();else if(S.tab==='note')loadNotes();else draw();return}
  if(a.indexOf('t_')===0){S.tvf=t.getAttribute('data-v');testAct(a);return}
  if(S.busy)return;
  if(a==='find'){doFind(val('adm-q').trim());return}
  if(a==='online'){doFind(':online');return}
  if(a==='recent'){S.q='';doFind('');return}
  if(a==='pick'){
    if(S.sel===id){S.sel='';S.selU=null}
    else{S.sel=id;S.selU=null;(S.list||[]).forEach(function(x){if(x.id===id)S.selU=x})}
    S.note='';draw();return}
  if(a==='giftto'){if(!needSel())return;S.to='sel';S.tab='gift';S.note='';S.reset=1;draw();return}
  if(a==='toall'){saveForm();S.to='all';draw();return}
  if(a==='tosel'){saveForm();if(!S.selU){S.note='⚠ Chưa chọn tài khoản — vào tab 👤 Tài khoản, mở một tài khoản rồi quay lại.';draw();return}S.to='sel';S.note='';draw();return}
  if(a==='clear'){S.f=defF();draw();return}
  if(a==='clearnote'){S.nf={title:'',body:'',days:'7'};draw();return}
  if(a==='sendnote'){sendNotice();return}
  if(a==='delnote'){
    if(!confirm('Xoá thông báo #'+id+'? Người chơi sẽ không còn thấy nó (sau lần cập nhật kế tiếp).'))return;
    run('Đang xoá…',function(){return call('admin_del_notice',{p_id:Number(id)}).then(function(r){S.note=r?'✅ Đã xoá thông báo #'+id:'⚠ Thông báo không còn tồn tại';return call('admin_list_notice')}).then(function(r){S.notes=parse(r)||[]})});
    return}
  if(a==='reload'){if(S.tab==='mail')loadMails();else if(S.tab==='note')loadNotes();else loadLogs();return}
  if(a==='send'){sendGift();return}
  if(a==='delmail'){
    if(!confirm('Thu hồi (xoá) thư #'+id+'? Người chưa nhận sẽ không còn thấy thư này.'))return;
    run('Đang thu hồi…',function(){return call('admin_del_mail',{p_id:Number(id)}).then(function(r){S.note=r?'✅ Đã thu hồi thư #'+id:'⚠ Thư không còn tồn tại';return call('admin_list_mail')}).then(function(r){S.mails=parse(r)||[]})});
    return}
  if(!(u=needSel()))return;
  var em=u.email||u.id,n;
  if(a==='ltadd'||a==='ltsub'){
    n=Math.floor(+val('adm-lt'));
    if(!(n>0)){S.note='⚠ Nhập số Linh Thạch lớn hơn 0.';draw();return}
    var sg=a==='ltadd'?1:-1;
    if(!confirm((sg>0?'CỘNG ':'TRỪ ')+nf(n)+' Linh Thạch '+(sg>0?'cho ':'của ')+em+'?'))return;
    run('Đang xử lý…',function(){return call('admin_grant_lt',{p_uid:u.id,p_amt:sg*n}).then(function(r){S.note='✅ '+em+' còn '+nf(r)+' Linh Thạch';return query()})});return}
  if(a==='kick'){
    if(!confirm('Đá '+em+' khỏi game? (họ phải đăng nhập lại)'))return;
    run('Đang xử lý…',function(){return call('admin_kick',{p_uid:u.id}).then(function(r){S.note=r?'✅ Đã đá '+em+' khỏi game':'ℹ Người này không có phiên đang chơi';return query()})});return}
  if(a==='ban'||a==='unban'){
    n=a==='ban'?Math.floor(+val('adm-bh')):0;
    if(a==='ban'&&!confirm('KHOÁ đăng nhập '+em+' ('+(n>=876000?'vĩnh viễn':n+' giờ')+')? Họ sẽ bị đá khỏi game ngay.'))return;
    run('Đang xử lý…',function(){return call('admin_ban',{p_uid:u.id,p_hours:n}).then(function(){S.note=a==='ban'?'✅ Đã khoá '+em:'✅ Đã mở khoá '+em;return query()})});return}
  if(a==='cban'||a==='cunban'){
    n=a==='cban'?Math.floor(+val('adm-ch')):0;
    if(a==='cban'&&!confirm('CẤM CHAT '+em+' ('+(n>=876000?'vĩnh viễn':n+' giờ')+')?'))return;
    run('Đang xử lý…',function(){return call('admin_chat_ban',{p_uid:u.id,p_hours:n,p_note:null}).then(function(){S.note=a==='cban'?'✅ Đã cấm chat '+em:'✅ Đã gỡ cấm chat '+em;return query()})});return}
}

/* ---------- 🧪 Test: chỉnh tu vi / cảnh giới nhân vật ĐANG CHƠI (chỉ admin thấy; không đụng máy chủ) ---------- */
var CGN=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
function cvNow(){try{return(typeof ZC!=='undefined'&&started_()&&PS[cur].cv)||null}catch(e){return null}}
function vTest(){
  var c=cvNow();
  if(!c)return'<div class="ae">Hãy vào game (đã chọn nhân vật) rồi mở lại tab này.</div>';
  var i=ZC.tvInfo(),h='<div class="tq">Chỉ tác động nhân vật đang chơi, bỏ qua mọi điều kiện đột phá (vàng, đan, lôi kiếp…).<br>Hiện tại: <b>'+esc(ZC.nm())+'</b> · tu vi '+nf(Math.floor(c.q))+'/'+nf(i.need)+'</div>';
  h+='<h4 style="margin:10px 0 4px;font-size:13px;color:#ffd76a">🧘 Tu vi</h4><div class="ar"><input id="adm-tv" type="number" inputmode="numeric" min="1" placeholder="Số tu vi"><button class="bt gr" data-a="t_tvadd">➕ Cộng</button></div>';
  h+='<div class="ar"><button class="bt" data-a="t_tvp" data-v="0.1">+10%</button><button class="bt" data-a="t_tvp" data-v="0.5">+50%</button><button class="bt gr" data-a="t_tvp" data-v="1">⚡ Đầy tu vi</button></div>';
  h+='<h4 style="margin:10px 0 4px;font-size:13px;color:#ffd76a">🌟 Cảnh giới</h4><div class="ar"><select id="adm-cr">'+CGN.map(function(n,k){return'<option value="'+(k-1)+'"'+(k-1===c.r?' selected':'')+'>'+n+'</option>'}).join('')+'</select>'
    +'<select id="adm-cs">'+[1,2,3,4,5,6,7,8,9].map(function(t){return'<option value="'+t+'"'+(t===(c.s||1)?' selected':'')+'>Tầng '+t+'</option>'}).join('')+'</select></div>';
  h+='<div class="ar"><button class="bt gr" data-a="t_cgset">✅ Đặt cảnh giới</button><button class="bt" data-a="t_cgup">⬆ +1 tầng</button><button class="bt dg" data-a="t_cgdn">⬇ −1 tầng</button><button class="bt" data-a="t_cgmax">👑 Đại Thừa 9</button></div>';
  var H4='<h4 style="margin:12px 0 4px;font-size:13px;color:#ffd76a">',nxv=1;try{nxv=nx()}catch(e){}
  h+=H4+'☯ Đạo Linh (EXP) — '+nf(Math.floor(P.xp))+'/'+nf(nxv)+'</h4><div class="ar"><input id="adm-xp" type="number" inputmode="numeric" min="1" placeholder="Số Đạo Linh"><button class="bt gr" data-a="t_xpadd">➕ Cộng</button></div>';
  h+='<div class="ar"><button class="bt" data-a="t_xpp" data-v="0.1">+10%</button><button class="bt" data-a="t_xpp" data-v="0.5">+50%</button><button class="bt gr" data-a="t_xpp" data-v="1">⚡ Đầy (lên cấp)</button></div>';
  h+=secLv('p','🧑 Cấp độ Phàm Thể','adm-lvp')+secLv('d','☯ Cấp độ Đạo Thể','adm-lvd')+secLv('t','✨ Cấp độ Tiên Nhân','adm-lvt');
  h+=H4+'💰 Vàng · 💠 Mảnh · 📊 Điểm tiềm năng — '+nf(Math.floor(gold))+' vàng · '+nf(frag|0)+' mảnh · '+nf(PS[cur].pts|0)+' điểm</h4>'
    +'<div class="ar"><input id="adm-gold" type="number" inputmode="numeric" min="1" placeholder="Số vàng"><button class="bt gr" data-a="t_gold">➕ Vàng</button></div>'
    +'<div class="ar"><button class="bt" data-a="t_goldp" data-v="1e7">+10 triệu</button><button class="bt" data-a="t_goldp" data-v="1e9">+1 tỷ</button><button class="bt" data-a="t_goldp" data-v="1e11">+100 tỷ</button></div>'
    +'<div class="ar"><input id="adm-frag" type="number" inputmode="numeric" min="1" placeholder="Số mảnh"><button class="bt gr" data-a="t_frag">➕ Mảnh</button></div>'
    +'<div class="ar"><input id="adm-pts" type="number" inputmode="numeric" min="1" placeholder="Điểm tiềm năng"><button class="bt gr" data-a="t_pts">➕ Điểm</button></div>';
  h+=H4+'⚔ Chiến đấu</h4><div class="ar"><button class="bt gr" data-a="t_heal">❤ Hồi đầy HP/MP</button><button class="bt'+(GOD?' gr':'')+'" data-a="t_god">🛡 Bất tử: '+(GOD?'BẬT':'TẮT')+'</button><button class="bt dg" data-a="t_kill">☠ Diệt hết quái</button></div>';
  h+=H4+'🎒 Tạo trang bị / túi đồ — '+(BAG?BAG.length:0)+' món</h4><div class="ar"><select id="adm-gr">'+RN.map(function(n,k){return'<option value="'+k+'"'+(k===5?' selected':'')+'>'+n+'</option>'}).join('')+'</select>'
    +'<select id="adm-gs"><option value="-1">Ô ngẫu nhiên</option>'+slotOpts()+'</select></div>'
    +'<div class="ar"><input id="adm-gl" type="number" inputmode="numeric" min="1" max="80" placeholder="Cấp (mặc định = cấp nhân vật)"><input id="adm-gn" type="number" inputmode="numeric" min="1" max="30" placeholder="Số lượng (1)"></div>'
    +'<div class="ar"><button class="bt gr" data-a="t_gear">🎁 Tạo vào túi</button><button class="bt dg" data-a="t_clrbag">🗑 Dọn sạch túi</button></div>';
  h+=H4+'♻ Reset nhân vật</h4><div class="tq">Đưa nhân vật ĐANG CHƠI về như mới tạo (Lv1): xoá cấp, tu vi, điểm, trang bị đang mặc, túi đồ, thú, Hợp Đạo/Chuyển Thế và mọi dữ liệu hệ thống của riêng nhân vật. Xoá TOÀN BỘ: Linh Căn, Tháp, Cash Shop, vàng (về 100), nhiệm vụ, Linh Điền, Mỏ, Huyền Tinh, thư đã nhận… Chỉ giữ tên và lớp. Linh Thạch trên máy chủ không đổi.</div>'
    +'<div class="ar"><button class="bt dg" data-a="t_reset">♻ Reset nhân vật</button></div>';
  return h;
}
var GOD=false,godT=0;
function slotOpts(){try{var t=CHR[cur].t,L=SLS[t]||[];return TY.map(function(k){return'<option value="'+k+'">'+esc((L[k]&&L[k][0])||('Ô '+k))+'</option>'}).join('')}catch(e){return''}}
function setGod(on){GOD=!!on;if(godT){clearInterval(godT);godT=0}if(GOD)godT=setInterval(function(){try{if(started_()){P.hp=mx();if(P.mp<mm()*.5)P.mp=mm()}}catch(e){}},120)}
function bagRoom(){try{return Math.max(0,capN()-BAG.length)}catch(e){return 999}}
function lvMode(){try{if(window.CTHE&&CTHE.on())return't';if(window.HDAO&&HDAO.on())return'd'}catch(e){}return'p'}
function lvName(m){return m==='t'?'Tiên Nhân':m==='d'?'Đạo Thể':'Phàm Thể'}
function ptsPer(m){try{return m==='t'?CTHE.cfg.pts:m==='d'?10:5}catch(e){return 5}}
function lvCap(){try{return LC(PS[cur].tier)}catch(e){return 100}}
function secLv(m,title,inId){
  var h='<h4 style="margin:12px 0 4px;font-size:13px;color:#ffd76a">'+title+' — Lv '+P.lv+'/'+lvCap()+'</h4>';
  if(lvMode()!==m)return h+'<div class="tq">Nhân vật đang chơi là <b>'+lvName(lvMode())+'</b> nên mục này chưa áp dụng.</div>';
  h+='<div class="ar"><input id="'+inId+'" type="number" inputmode="numeric" min="1" max="100" placeholder="Cấp độ"><button class="bt gr" data-a="t_lv'+m+'_set">✅ Đặt cấp</button></div>';
  h+='<div class="ar"><button class="bt" data-a="t_lv'+m+'_up1">⬆ +1</button><button class="bt" data-a="t_lv'+m+'_up10">⬆ +10</button><button class="bt dg" data-a="t_lv'+m+'_dn1">⬇ −1</button><button class="bt gr" data-a="t_lv'+m+'_max">👑 Tối đa</button></div>';
  return h+'<small>Tăng cấp được cộng '+ptsPer(m)+' điểm tiềm năng/cấp; EXP về 0.</small>';
}
function setLv(L,m){
  var p=PS[cur],d;L=Math.max(1,Math.min(lvCap(),L|0));d=L-P.lv;
  if(d>0)p.pts=(p.pts|0)+d*ptsPer(m);
  P.lv=L;p.lv=L;P.xp=0;p.xp=0;
  try{P.hp=mx();P.mp=mm()}catch(e){}
  return L;
}
function addXp(n){
  try{if(window.TGQ&&TGQ.addXp){TGQ.addXp(n);return}}catch(e){}
  P.xp+=n;
}
/* reset RIÊNG nhân vật đang chơi (khác ng() của game: ng() xoá cả 3 nhân vật + vàng) */
function resetChar(){
  var p=PS[cur];if(!p)return false;
  var BASE={lv:1,xp:1,pts:1,tier:1,br:1,al:1,cv:1,pet:1,lc:1,wg:1,lg:1,nm:1,rc:1},KEEP={},nm=p.nm; /* chỉ giữ sổ thư đã nhận (tránh nhận lại thư cũ); kho Cash Shop .csh và .td nay cũng bị xoá */
  Object.keys(p).forEach(function(k){if(!BASE[k]&&!KEEP[k])delete p[k]});
  p.lv=1;p.xp=0;p.pts=0;p.tier=0;p.br=-1;p.al=[0,0,0,0];p.cv={r:-1,s:0,q:0,f:0};p.pet=null;p.lc=null;p.wg=0;p.lg=0;p.nm=nm;p.rc=0;
  /* Linh căn: gốc nằm ở Tháp Thí Luyện (PS.tw.root) + cấp kỹ năng (PS.lc) → đặt lại tường minh về chưa có linh căn */
  p.tw={p:0,fg:0,fz:0,pill:0,root:-1};p.lc={root:-1,lv:[1,1,1,1,1]};
  EQS[cur]=Array(NS).fill(null);BAGS[cur]=[];
  lg=0;
  /* biến toàn cục của riêng nhân vật mà ng() cũng dọn (nhiệm vụ chuyển chức, tự đánh, ô kỹ năng…) */
  /* XOÁ TOÀN BỘ dữ liệu dùng chung tài khoản như ng(): vàng, mảnh, nhiệm vụ, Linh Điền, Mỏ, Huyền Tinh, Thánh, Vòng Quay, Hầm Ngục */
  try{gold=100;frag=0;KT=0;hpP=3;mpP=3}catch(e){}
  try{HL.reset()}catch(e){}
  try{LW.reset()}catch(e){}
  try{FM.reset()}catch(e){}
  try{MN.reset()}catch(e){}
  try{FSH.load(null)}catch(e){}
  try{QS=qsNew();QS.dk=0;QS.wk=0;qsSave()}catch(e){}
  try{dgU=-1;wfr=0;wf2=0;wf3=0;dgSave()}catch(e){}
  try{if(window.LCT&&LCT.off)LCT.off()}catch(e){}
  try{cq=null}catch(e){}
  try{NK=0;pq=[0,0];fz=[]}catch(e){}
  try{AUTOF={on:0,q:[0,0,0,0,0],a:{}}}catch(e){}
  try{dg=null}catch(e){}
  rf();
  P.lv=1;P.xp=0;
  try{init()}catch(e){}
  try{vil=1;cam=0;pp.x=0}catch(e){}
  /* Lưu bản sạch rồi NẠP LẠI qua ld(): mọi module (trang phục Y Phục, Ý Cảnh, Thần Thông, Hợp Đạo…) đọc lại từ dữ liệu mới
     và xoá bộ nhớ đệm cũ. Chỉ nạp lại khi bản lưu đã thật sự sạch (tránh nạp nhầm bản cũ nếu lưu bị chặn). */
  try{
    sv();
    var d=JSON.parse(localStorage.getItem('kthm2')),q=d&&d.PS&&d.PS[cur];
    if(q&&q.lv===1&&!q.fa&&!q.yc&&!q.tt&&!q.hd&&!q.ct&&!q.csh&&(!q.tw||q.tw.root<0)&&typeof ld==='function'){
      ld();
    }
  }catch(e){}
  try{if(window.TT&&TT.rebuild)TT.rebuild()}catch(e){}
  try{if(window.RK&&RK.refresh)RK.refresh()}catch(e){}
  try{setSK()}catch(e){}
  return true;
}
function testDone(msg){
  try{ZC.refresh()}catch(e){}
  try{if(typeof ui==='function')ui()}catch(e){}
  try{if(typeof sv==='function')sv()}catch(e){}
  S.note=msg;draw();
}
function setCv(r,s){
  var c=cvNow();if(!c)return false;
  r=Math.max(-1,Math.min(7,r|0));s=r<0?0:Math.max(1,Math.min(9,s|0));
  c.r=r;c.s=s;c.q=0;c.f=0;c.td=0;return true;
}
function testAct(a){
  var c=cvNow();
  if(!c){S.note='⚠ Chưa vào game / chưa có nhân vật.';draw();return}
  var n;
  if(a==='t_tvadd'){
    n=Math.floor(+val('adm-tv'));
    if(!(n>0)){S.note='⚠ Nhập số tu vi lớn hơn 0.';draw();return}
    ZC.gain(n);testDone('✅ Đã cộng '+nf(n)+' tu vi → '+ZC.nm());return}
  var mL=/^t_lv([pdt])_(.+)$/.exec(a);
  if(a==='t_xpadd'||a==='t_xpp'){
    n=a==='t_xpadd'?Math.floor(+val('adm-xp')):Math.max(1,Math.ceil(nx()*(+S.tvf||0)));
    if(!(n>0)){S.note='⚠ Nhập số Đạo Linh lớn hơn 0.';draw();return}
    addXp(n);testDone('✅ Đã cộng '+nf(n)+' Đạo Linh (EXP) — đang lên cấp nếu đủ');return}
  if(mL){
    var md=mL[1],op=mL[2],L=P.lv;
    if(lvMode()!==md){S.note='⚠ Nhân vật đang chơi là '+lvName(lvMode())+', không phải '+lvName(md)+'.';draw();return}
    if(op==='up1')L+=1;else if(op==='up10')L+=10;else if(op==='dn1')L-=1;else if(op==='max')L=lvCap();
    else if(op==='set')L=Math.floor(+val('adm-lv'+md));
    if(!(L>=1)){S.note='⚠ Nhập cấp độ từ 1 trở lên.';draw();return}
    L=setLv(L,md);testDone('✅ '+lvName(md)+' đã đặt Lv '+L+(L>=lvCap()?' (tối đa)':''));return}
  if(a==='t_reset'){
    if(!confirm('RESET nhân vật đang chơi ('+ZC.nm()+') về Lv1 như mới tạo?\nXoá cấp, tu vi, Linh Căn, trang bị, túi đồ, thú, kho Cash Shop, vàng, nhiệm vụ, Hợp Đạo/Chuyển Thế…'))return;
    if(!confirm('Chắc chắn? Thao tác này KHÔNG hoàn tác được.'))return;
    resetChar();testDone('✅ Đã reset nhân vật về Lv1');
    /* Làm sạch hoàn toàn: đẩy bản sạch lên mây rồi TẢI LẠI trang để mọi module (trang phục, kỹ năng, hiệu ứng…) bỏ hết bộ nhớ cũ.
       Chỉ tải lại khi đã đăng nhập mây VÀ đẩy xong (chế độ cloud-only: tải lại mà chưa đẩy sẽ mất dữ liệu). */
    try{
      if(window.KCL&&KCL.sess&&KCL.sess()&&window.KTHM_CLOUD){
        S.note='⏳ Đang lưu bản sạch lên mây rồi tải lại game…';draw();
        var tries=0;Promise.resolve(KTHM_CLOUD.saveNow()).catch(function(){}).then(function(){
          var iv=setInterval(function(){
            tries++;
            if(!KTHM_CLOUD.dirty()&&KTHM_CLOUD.status()!=='err'){clearInterval(iv);try{sessionStorage.setItem('kthm_resume','1')}catch(e){}location.reload()}
            else if(tries>30){clearInterval(iv);S.note='⚠ Đã reset nhưng chưa đẩy được lên mây — hãy thử lại nút reset hoặc tự tải lại trang sau khi trạng thái ☁ báo đã lưu.';draw()}
          },300)})}
    }catch(e){}
    return}
  if(a==='t_tvp'){
    n=Math.max(1,Math.ceil(ZC.tvInfo().need*(+S.tvf||0)));
    ZC.gain(n);testDone('✅ Đã cộng '+nf(n)+' tu vi → '+ZC.nm());return}
  if(a==='t_gold'||a==='t_goldp'){
    n=a==='t_gold'?Math.floor(+val('adm-gold')):Math.floor(+S.tvf);
    if(!(n>0)){S.note='⚠ Nhập số vàng lớn hơn 0.';draw();return}
    gold=Math.min(1e15,gold+n);testDone('✅ Đã cộng '+nf(n)+' vàng');return}
  if(a==='t_frag'){n=Math.floor(+val('adm-frag'));if(!(n>0)){S.note='⚠ Nhập số mảnh lớn hơn 0.';draw();return}
    frag=(frag|0)+n;testDone('✅ Đã cộng '+nf(n)+' mảnh');return}
  if(a==='t_pts'){n=Math.floor(+val('adm-pts'));if(!(n>0)){S.note='⚠ Nhập số điểm lớn hơn 0.';draw();return}
    PS[cur].pts=(PS[cur].pts|0)+n;testDone('✅ Đã cộng '+nf(n)+' điểm tiềm năng');return}
  if(a==='t_heal'){try{P.hp=mx();P.mp=mm()}catch(e){}testDone('✅ Đã hồi đầy HP/MP');return}
  if(a==='t_god'){setGod(!GOD);testDone(GOD?'🛡 Bất tử BẬT (tự hồi máu liên tục, tắt khi tải lại trang)':'🛡 Bất tử TẮT');return}
  if(a==='t_kill'){var k=0;try{E.forEach(function(e){if(e&&e.hp>0){e.hp=0;k++}})}catch(e){}testDone('☠ Đã hạ '+k+' quái trên màn hình');return}
  if(a==='t_clrbag'){if(!confirm('Xoá SẠCH túi đồ của nhân vật đang chơi?'))return;var n0=BAG.length;BAG.length=0;testDone('🗑 Đã dọn '+n0+' món khỏi túi');return}
  if(a==='t_gear'){
    var r=Math.max(0,Math.min(5,+val('adm-gr')|0)),sl=+val('adm-gs'),lv=Math.floor(+val('adm-gl'))||P.lv,cnt=Math.floor(+val('adm-gn'))||1;
    lv=Math.max(1,Math.min(80,lv));cnt=Math.max(1,Math.min(30,cnt));
    var room=bagRoom(),made=0;if(!room){S.note='⚠ Túi đồ đầy, hãy dọn bớt.';draw();return}
    for(var i=0;i<cnt&&made<room;i++){try{BAG.push(sl>=0?gen(lv,r,sl):gen(lv,r));made++}catch(e){break}}
    testDone('✅ Đã tạo '+made+' trang bị '+RN[r]+' Lv'+lv+(made<cnt?' (túi hết chỗ)':''));return}
  var q=c.r<0?0:c.r*9+c.s;
  if(a==='t_cgset'){setCv(+val('adm-cr'),+val('adm-cs'));testDone('✅ Đã đặt: '+ZC.nm());return}
  if(a==='t_cgup'||a==='t_cgdn'){
    q=Math.max(0,Math.min(72,q+(a==='t_cgup'?1:-1)));
    if(q===0)setCv(-1,0);else{var r=Math.floor((q-1)/9);setCv(r,q-r*9)}
    testDone('✅ Đã chuyển: '+ZC.nm());return}
  if(a==='t_cgmax'){setCv(7,9);testDone('✅ Đã đặt: '+ZC.nm());return}
}

function sendNotice(){
  saveForm();
  var f=S.nf,t=String(f.title||'').trim(),d=Math.floor(+f.days);
  if(!t){S.note='⚠ Nhập tiêu đề thông báo.';draw();return}
  if(!(d>0))d=0;
  if(!confirm('Đăng thông báo "'+t+'" cho TẤT CẢ người chơi?\nHiển thị: '+(d?d+' ngày':'không hết hạn')+'.'))return;
  run('Đang đăng…',function(){
    return call('admin_send_notice',{p_title:t,p_body:String(f.body||''),p_days:d}).then(function(){
      S.note='✅ Đã đăng thông báo';S.nf={title:'',body:'',days:String(d)};return call('admin_list_notice')}).then(function(r){S.notes=parse(r)||[]});
  });
}

function sendGift(){
  saveForm();
  var f=S.f,t=String(f.title||'').trim(),tgt=null,who='TẤT CẢ người chơi';
  if(!t){S.note='⚠ Nhập tiêu đề thư.';draw();return}
  if(S.to==='sel'){
    if(!S.selU){S.note='⚠ Chưa chọn tài khoản nhận.';draw();return}
    tgt=S.selU.id;who=S.selU.email||S.selU.id;
  }
  var Q=buildQ(f),days=Math.min(14,Math.max(1,Math.floor(+f.days)||14));
  if(!confirm('Gửi thư "'+t+'" tới '+who+'?\n'+(Q.txt||'(không kèm quà)')+'\nHạn nhận: '+days+' ngày.'))return;
  run('Đang gửi thư…',function(){
    return call('admin_send_mail',{p_uid:tgt,p_title:t,p_body:String(f.body||''),p_qua:Q.qua,p_days:days}).then(function(){
      S.note='✅ Đã gửi thư tới '+who;S.f=defF();S.mails=null});
  });
}

/* ---------- nút + kiểm tra quyền ---------- */
function tick(){
  try{
    var on=false;
    if(logged()&&started_()){
      var uid=myUid();
      if(uid&&uid!==checkedFor&&!checking){
        checking=true;
        call('admin_is').then(function(r){r=parse(r);isAdmin=(r===true||r==='true'||r===1);checkedFor=uid},function(){isAdmin=false;checkedFor=uid}).then(function(){checking=false});
      }
    }else if(!logged()){isAdmin=false;checkedFor=''}
    var ar=document.getElementById('arena-scene');
    on=isAdmin&&started_()&&!(ar&&ar.classList.contains('on'));
    if(btn)btn.style.display=on?'flex':'none';
    if(!on&&open)close();
  }catch(e){}
}

window.ADMIN={open:show,close:close,isAdmin:function(){return isAdmin}};
if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
})();
