/* ===== 🔐 BẮT BUỘC ĐĂNG NHẬP + PHIÊN CHƠI DUY NHẤT (systems/60-dang-nhap-bat-buoc.js) =====
 * Luồng:
 *  1) Mở game → cổng đăng nhập phủ kín màn hình. Nhập email + mật khẩu → Supabase Auth (KCL.signIn / KCL.signUp của systems/12).
 *  2) Ngay sau khi đăng nhập, gọi RPC kthm_claim_session(sid mới): máy chủ ghi phiên chơi này làm phiên DUY NHẤT của tài khoản
 *     (chính sách: đăng nhập máy mới → phiên cũ bị thay thế) và báo "replaced" nếu đang có phiên ở máy khác.
 *  3) Mọi yêu cầu có đăng nhập tới máy chủ (tải/lưu tiến trình, chợ, chat, xếp hạng…) đều kèm header x-session-id; máy chủ
 *     (kthm_check_session, chạy trước mọi request) CHỈ cho phép khi sid khớp phiên đang hiệu lực, ngược lại trả 409 SESSION_INVALID.
 *  4) Máy cũ: bất kỳ request nào bị từ chối, hoặc nhịp kiểm tra mỗi 40s / khi quay lại tab → KTHM_GATE.kick(): lưu cục bộ, xoá phiên,
 *     đóng băng game và hiện cổng đăng nhập với thông báo "đã đăng nhập ở máy khác". Phải đăng nhập lại mới chơi tiếp.
 * Khi cổng đang hiện: window.__GATE=1 và vòng lặp step() của engine bị bỏ qua (game đứng yên, không thể thao tác).
 * Không có mạng / máy chủ chưa cấu hình → không vào được game (bắt buộc đăng nhập). Phụ thuộc: KCL (systems/12), step (engine).
 * SQL máy chủ: phien_dang_nhap.sql (chạy 1 lần trong Supabase SQL Editor). */
(function(){
'use strict';
var K=window.KCL;
if(!K)return;
var HB=40000,ov=null,box=null,state={busy:false,msg:'',kind:'info',view:'in',em:'',pw:''},hb=0,shown=false;

function genSid(){
  try{var a=new Uint8Array(16);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
  catch(e){return(Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).slice(0,32).padEnd(16,'0')}}
function dev(){try{return(navigator.userAgentData&&navigator.userAgentData.platform||'')+' '+(navigator.userAgent||'').slice(0,60)}catch(e){return''}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- giao diện cổng ---------- */
function css(){
  var c=document.createElement('style');
  c.textContent='#kg{position:fixed;inset:0;z-index:99990;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:radial-gradient(circle at 50% 30%,#2a1c10,#0b0705 70%);font-family:"KTH Serif","Songti SC",STKaiti,serif;color:#f2e3b3;-webkit-user-select:none;user-select:none}'+
  '#kg .bx{width:min(380px,100%);border:2px solid #b8964e;border-radius:16px;background:rgba(20,13,8,.96);padding:20px 18px;box-shadow:0 10px 40px #000}'+
  '#kg h1{margin:0 0 4px;font-size:21px;text-align:center;color:#ffd76a}#kg .sub{text-align:center;font-size:12.5px;opacity:.75;margin-bottom:12px}'+
  '#kg input{width:100%;box-sizing:border-box;padding:11px 12px;margin:5px 0;border:1px solid #6a5434;border-radius:9px;background:#150e09;color:#f2e3b3;font-size:15px;-webkit-user-select:text;user-select:text}'+
  '#kg button{width:100%;padding:12px;margin-top:8px;border:0;border-radius:9px;background:#8a6420;color:#fff;font-weight:700;font-size:15px}#kg button.g{background:#2a2118;border:1px solid #6a5434}#kg button:disabled{opacity:.5}'+
  '#kg .ms{min-height:34px;margin-top:10px;font-size:13px;line-height:1.4;text-align:center}#kg .ms.err{color:#ff9a8a}#kg .ms.ok{color:#9fe39f}'+
  '#kg .lk{display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:12.5px}#kg .lk a{color:#d9b866;text-decoration:underline;cursor:pointer}';
  document.head.appendChild(c)}
function build(){
  css();ov=document.createElement('div');ov.id='kg';
  ['pointerdown','pointerup','touchstart','touchend','keydown','keyup','keypress','click','contextmenu','wheel'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()},false)});
  ov.addEventListener('click',onClick);ov.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.target.tagName==='INPUT'))submit()});
  document.body.appendChild(ov)}
function render(){
  if(!ov)return;
  var up=state.view==='up';
  ov.innerHTML='<div class="bx"><h1>⚔️ Mộng Tu Tiên</h1><div class="sub">'+(up?'Tạo tài khoản mới':'Đăng nhập để chơi')+' · mỗi tài khoản chỉ chơi được trên 1 máy</div>'+
   '<input id="kg-em" type="email" autocomplete="username" placeholder="Tài khoản (email)" value="'+esc(state.em)+'"'+(state.busy?' disabled':'')+'>'+
   '<input id="kg-pw" type="password" autocomplete="'+(up?'new-password':'current-password')+'" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value="'+esc(state.pw)+'"'+(state.busy?' disabled':'')+'>'+
   '<button data-a="go"'+(state.busy?' disabled':'')+'>'+(state.busy?'Đang xử lý…':up?'Đăng ký':'Đăng nhập')+'</button>'+
   '<div class="lk"><a data-a="sw">'+(up?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký')+'</a>'+(up?'':'<a data-a="rc">Quên mật khẩu?</a>')+'</div>'+
   (state.retry?'<button class="g" data-a="rt">Thử lại</button>':'')+
   '<div class="ms '+state.kind+'">'+esc(state.msg)+'</div></div>'}
function keep(){var e=document.getElementById('kg-em'),p=document.getElementById('kg-pw');if(e)state.em=e.value;if(p)state.pw=p.value}
function show(msg,kind,retry){
  if(!ov)build();keep();state.msg=msg||'';state.kind=kind||'info';state.retry=!!retry;state.busy=false;
  shown=true;window.__GATE=1;ov.style.display='flex';render()}
function hide(){shown=false;window.__GATE=0;if(ov)ov.style.display='none';state.pw=''}
function busy(on,msg,kind){keep();state.busy=on;if(msg!=null){state.msg=msg;state.kind=kind||'info'}render()}
function onClick(e){
  var a=e.target.closest&&e.target.closest('[data-a]');if(!a)return;var k=a.dataset.a;
  if(k==='go')submit();else if(k==='sw'){keep();state.view=state.view==='up'?'in':'up';state.msg='';state.kind='info';render()}
  else if(k==='rc')recover();else if(k==='rt'){state.retry=false;verify()}}

/* ---------- luồng đăng nhập + nhận phiên ---------- */
async function claim(){
  var sid=genSid();K.setSid(sid);
  var r=await K.rpc('kthm_claim_session',{p_sid:sid,p_device:dev()});
  if(!r||r.status!=='ok'){K.setSid(null);throw new Error('Không nhận được phiên chơi từ máy chủ')}
  return r}
async function enter(r){
  /* Cloud-only: dữ liệu game chỉ nằm trên mây và được nạp vào bộ nhớ LÚC MỞ TRANG (systems/11). Đăng nhập xong → tải lại trang để nạp đúng tiến trình. */
  try{sessionStorage.removeItem('kthm_rl')}catch(e){}
  busy(true,'Đang tải tiến trình từ mây…');
  location.reload()}
async function submit(){
  keep();var em=(state.em||'').trim(),pw=state.pw||'';
  if(!em){show2('Nhập tài khoản (email).');return}
  if(pw.length<6){show2('Mật khẩu cần từ 6 ký tự.');return}
  busy(true,'Đang xử lý…');
  try{
    if(state.view==='up'){
      var r0=await K.signUp(em,pw);
      if(r0==='confirm'){state.view='in';state.pw='';show('Đã gửi thư xác nhận tới '+em+'. Mở thư, bấm liên kết xác nhận rồi quay lại đăng nhập.','ok');return}
    }else await K.signIn(em,pw);
    busy(true,'Đang kiểm tra phiên chơi…');
    var r=await claim();await enter(r);
  }catch(e){var m=viErr(e);show(m,'err')}}
function show2(m){keep();state.msg=m;state.kind='err';render()}
function viErr(e){try{return K.vi(e)}catch(x){return String(e&&e.message||e)}}
async function recover(){
  keep();var em=(state.em||'').trim();if(!em){show2('Nhập email trước rồi bấm “Quên mật khẩu?”.');return}
  try{await K.http('/auth/v1/recover',{method:'POST',body:{email:em}});show('Nếu email này đã đăng ký, thư đặt lại mật khẩu đã được gửi.','ok')}catch(e){show(viErr(e),'err')}}

/* ---------- kiểm tra phiên khi mở game + nhịp định kỳ ---------- */
async function verify(){
  if(!K.OK){show('Chưa cấu hình máy chủ đăng nhập — không thể chơi.','err');return}
  if(!K.sess()){show('Hãy đăng nhập để chơi.','info');return}
  busy(true,'Đang kiểm tra phiên chơi…');
  try{
    if(!K.sid()){var r=await claim();await enter(r);return}          /* đã có đăng nhập từ trước nhưng chưa có phiên → nhận phiên mới */
    var s=await K.rpc('kthm_session_status',{p_sid:K.sid()});
    if(s&&s.valid){
      /* phiên hợp lệ nhưng tiến trình chưa được nạp từ mây (mất mạng lúc mở trang…) → tải lại để nạp; tối đa 2 lần để không lặp vô tận */
      if(!window.__BOOT_CLOUD&&!(window.CLOUDONLY&&CLOUDONLY.legacy)){
        var n=0;try{n=+sessionStorage.getItem('kthm_rl')||0}catch(x){}
        if(n<2){try{sessionStorage.setItem('kthm_rl',String(n+1))}catch(x){}busy(true,'Đang tải tiến trình từ mây…');location.reload();return}
        try{sessionStorage.removeItem('kthm_rl')}catch(x){}
        show('Không tải được tiến trình từ máy chủ. Kiểm tra mạng rồi bấm Thử lại.','err',true);return}
      try{sessionStorage.removeItem('kthm_rl')}catch(x){}
      hide();startHb();return}
    kick()
  }catch(e){
    if(e&&e.net){show('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.','err',true);return}
    if(e&&e.kick){return}
    if(!K.sess()){show('Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.','err');return}
    show(viErr(e),'err',true)}}
function startHb(){if(hb)return;hb=setInterval(beat,HB);document.addEventListener('visibilitychange',function(){if(!document.hidden)beat()})}
async function beat(){
  if(shown||!K.sess()||!K.sid()||document.hidden&&false)return;
  try{var s=await K.rpc('kthm_session_status',{p_sid:K.sid()});if(s&&!s.valid)kick()}catch(e){if(e&&e.kick)return}}
/* bị thay phiên: lưu cục bộ, xoá phiên, đóng băng game, bắt đăng nhập lại */
function kick(){
  if(shown&&state.kind==='err'&&/máy khác/.test(state.msg))return;
  try{if(typeof started!=='undefined'&&started&&typeof sv==='function')sv()}catch(e){}
  try{K.out('')}catch(e){}
  show('Tài khoản đã đăng nhập ở máy khác nên phiên chơi này bị đăng xuất. Hãy đăng nhập lại để tiếp tục.','err')}
function toast(t){try{if(typeof DT!=='undefined'&&typeof P!=='undefined')DT.push({x:P.x,y:200,s:t,c:'#9fe39f',g:1,l:150})}catch(e){}}

/* ---------- đóng băng game khi cổng hiện ---------- */
if(typeof step==='function'){var _step=step;step=function(){if(window.__GATE)return;return _step.apply(this,arguments)}}
window.KTHM_GATE={on:function(){return !!window.__GATE},kick:kick,show:show,verify:verify,beat:beat};

function boot(){build();window.__GATE=1;ov.style.display='flex';render();verify()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
