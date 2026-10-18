/* ===== 🎟 MÃ QUÀ TẶNG (ui/99-ma-qua.js) =====
 * Nút 🎟 ở hàng icon trái (sau ✨ Sự kiện): bấm → nhập mã → máy chủ kiểm tra → nhận quà.
 *  - Máy chủ (ma_qua.sql, RPC redeem_giftcode) quyết định mã đúng/hết hạn/hết lượt/đã dùng. Mỗi TÀI KHOẢN dùng 1 mã 1 lần.
 *  - Linh Thạch (nếu mã có) được máy chủ cộng thẳng vào ví không khoá.
 *  - Phần quà còn lại (vàng, vật phẩm, quặng, rương trang bị…) gửi về ✉️ Hòm Thư của NHÂN VẬT ĐANG CHƠI qua MAIL.send,
 *    người chơi bấm "Nhận quà" trong thư (túi đầy thì chưa mất, nhận lại sau).
 *  - Sau khi quà đã vào thư và bản lưu đã đẩy lên mây, game gọi gc_confirm. Nếu tắt game giữa chừng, nhập lại mã sẽ giao lại quà
 *    (thư dùng id cố định 'gc_<MÃ>' nên cùng nhân vật không bị nhân đôi).
 * API: GCODE.open() · GCODE.close() · GCODE.redeem(code)
 * Phụ thuộc (thiếu thì nút tự ẩn): KCL (systems/12), MAIL (ui/69), started. Tuỳ chọn: LT (làm mới ví), KTHM_CLOUD (chờ lưu mây), DT. */
(function(){
'use strict';
if(window.GCODE)return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var btn=null,box=null,inp=null,msgEl=null,go=null,open=false,busy=false,last=null;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function started_(){try{return !!started}catch(e){return false}}
function logged(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}catch(e){return false}}
function hasChar(){try{return !!PS[cur]}catch(e){return false}}
function parse(r){if(typeof r==='string'){try{return JSON.parse(r)}catch(e){}}return r}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function norm(s){return String(s||'').replace(/\s+/g,'').toUpperCase().slice(0,40)}

var ERR={
  NOT_LOGGED_IN:'Hãy đăng nhập tài khoản trước.',
  BAD_CODE:'Mã không hợp lệ (3–40 ký tự).',
  INVALID_CODE:'Mã không tồn tại. Kiểm tra lại từng ký tự.',
  TOO_MANY:'Nhập sai quá nhiều lần. Hãy đợi khoảng 10 phút rồi thử lại.',
  DISABLED:'Mã này đã bị vô hiệu hoá.',
  NOT_STARTED:'Mã này chưa đến thời gian sử dụng.',
  EXPIRED:'Mã này đã hết hạn.',
  SOLD_OUT:'Mã này đã hết lượt sử dụng.',
  ALREADY_USED:'Tài khoản của đạo hữu đã dùng mã này rồi.'
};
function rpcErr(e){
  var m=String((e&&(e.message||e.msg||e.error_description))||e||''),c=String((e&&e.code)||'');
  if(c==='PGRST202'||(e&&e.status===404)||m.indexOf('redeem_giftcode')>=0&&m.indexOf('not find')>=0)return'Máy chủ chưa bật tính năng Mã Quà (cần chạy ma_qua.sql).';
  if(m.indexOf('SESSION_INVALID')>=0)return'Phiên đăng nhập không còn hiệu lực, hãy đăng nhập lại.';
  if(/failed to fetch|network|timeout/i.test(m))return'Mất kết nối máy chủ, thử lại sau.';
  return m||'Lỗi không xác định, thử lại sau.';
}

/* ---------- giao diện ---------- */
function build(){
  var st=document.createElement('style');
  st.textContent=
  '#gc-b{position:fixed;top:calc(132px + env(safe-area-inset-top,0px));left:284px;width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;padding:0;box-shadow:0 2px 6px #000a;touch-action:manipulation;cursor:pointer}'
  +'#gc-b::after{content:"Mã quà";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 9px/10px '+FONT+';color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}'
  +'#gc-w{display:none;position:fixed;left:0;top:0;right:0;bottom:0;z-index:13;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:12px;box-sizing:border-box}'
  +'#gc-p{width:min(380px,100%);max-height:100%;overflow-y:auto;border:2px solid #b8964e;border-radius:12px;background:linear-gradient(#2a2118,#0e0a08);color:#f2e3b3;font-family:'+FONT+';box-sizing:border-box;box-shadow:0 6px 24px #000c}'
  +'#gc-p .gh{display:flex;align-items:center;padding:10px 14px;font-weight:700;font-size:16px;border-bottom:1px solid #4a3a2a}#gc-p .gh span{flex:1}'
  +'#gc-p .gh button{background:none;border:0;color:#f2e3b3;font-size:22px;cursor:pointer}'
  +'#gc-p .gb{padding:12px 14px 14px}#gc-p .gb p{margin:0 0 8px;font-size:13px;line-height:1.5;color:#d9c89a}'
  +'#gc-p input{width:100%;box-sizing:border-box;padding:11px 10px;border:1px solid #6b5636;border-radius:8px;background:#140d0a;color:#ffe9a0;font:700 17px/1.2 '+FONT+';letter-spacing:2px;text-align:center;text-transform:uppercase;outline:none}'
  +'#gc-p input:focus{border-color:#ffd76a}'
  +'#gc-p .gr{display:flex;gap:8px;margin-top:10px}#gc-p .gr button{flex:1;padding:10px 6px;border-radius:8px;border:1px solid #b8964e;background:#3a2a1a;color:#ffe9b0;font:700 14px '+FONT+';cursor:pointer}'
  +'#gc-p .gr button.pr{background:linear-gradient(#c98a1a,#8a5a0c);color:#fff}#gc-p .gr button:disabled{opacity:.5}'
  +'#gc-p .gm{margin-top:10px;padding:8px 10px;border-radius:8px;font-size:13px;line-height:1.55;display:none}'
  +'#gc-p .gm.i{display:block;background:#241b12;border:1px solid #4a3a2a;color:#d9c89a}'
  +'#gc-p .gm.e{display:block;background:#3a1612;border:1px solid #8a2a22;color:#ffb4a8}'
  +'#gc-p .gm.o{display:block;background:#172a14;border:1px solid #3f7a35;color:#c4f0b4}'
  +'#gc-p .gm b{color:#ffe9a0}';
  (document.head||document.documentElement).appendChild(st);

  btn=document.createElement('button');btn.id='gc-b';btn.type='button';btn.textContent='🎟';btn.title='Nhập mã quà tặng';
  btn.addEventListener('click',function(e){e.stopPropagation();openP()});
  document.body.appendChild(btn);

  box=document.createElement('div');box.id='gc-w';
  box.innerHTML='<div id="gc-p"><div class="gh"><span>🎟 Mã Quà Tặng</span><button type="button" data-x="1">✕</button></div>'
    +'<div class="gb"><p>Nhập mã quà do Ban Quản Trị phát hành. Mỗi tài khoản dùng mỗi mã <b>một lần</b>. Vật phẩm sẽ gửi về <b>✉️ Hòm Thư</b> của nhân vật đang chơi; Linh Thạch cộng thẳng vào ví.</p>'
    +'<input id="gc-i" type="text" maxlength="40" placeholder="NHẬP MÃ QUÀ" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false">'
    +'<div class="gr"><button type="button" class="pr" id="gc-go">🎁 Nhận quà</button></div>'
    +'<div class="gm" id="gc-m"></div></div></div>';
  document.body.appendChild(box);
  inp=box.querySelector('#gc-i');msgEl=box.querySelector('#gc-m');go=box.querySelector('#gc-go');

  box.addEventListener('click',function(e){
    var t=e.target;
    if(t===box||(t.getAttribute&&t.getAttribute('data-x'))){closeP();return}
    var m=t.closest?t.closest('[data-mail]'):null;
    if(m){closeP();try{MAIL.open('mail')}catch(er){}}
  });
  go.addEventListener('click',function(){redeem(inp.value)});
  inp.addEventListener('input',function(){var p=inp.selectionStart;inp.value=inp.value.toUpperCase().replace(/\s+/g,'');try{inp.setSelectionRange(p,p)}catch(e){}});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();redeem(inp.value)}e.stopPropagation()});
  inp.addEventListener('keyup',function(e){e.stopPropagation()});
  setInterval(tick,1000);tick();
}
function msg(h,k){if(!msgEl)return;msgEl.className='gm '+(k||'i');msgEl.innerHTML=h}
function openP(){
  if(!box)return;
  if(!logged()||!started_()){return}
  open=true;box.style.display='flex';msgEl.className='gm';msgEl.innerHTML='';
  setTimeout(function(){try{inp.focus()}catch(e){}},50);
}
function closeP(){open=false;if(box)box.style.display='none'}
function tick(){
  try{
    var ar=document.getElementById('arena-scene');
    var on=logged()&&started_()&&!!(window.MAIL&&MAIL.send)&&!(ar&&ar.classList.contains('on'));
    if(btn)btn.style.display=on?'flex':'none';
    if(!on&&open)closeP();
  }catch(e){}
}

/* ---------- nhận mã ---------- */
function setBusy(b){busy=b;if(go){go.disabled=b}if(inp){inp.disabled=b}}
function redeem(raw){
  if(busy)return;
  var code=norm(raw);
  if(code.length<3){msg('⚠ Hãy nhập mã quà.','e');return}
  if(!logged()||!started_()||!hasChar()){msg('⚠ Hãy đăng nhập và vào game bằng một nhân vật trước.','e');return}
  if(!(window.MAIL&&MAIL.send)){msg('⚠ Chưa có Hòm Thư để nhận quà.','e');return}
  setBusy(true);msg('⏳ Đang kiểm tra mã…','i');
  var p;
  try{p=Promise.resolve(KCL.rpc('redeem_giftcode',{p_code:code}))}catch(e){p=Promise.reject(e)}
  p.then(function(r){
    r=parse(r);
    if(!r||typeof r!=='object'){msg('⚠ Máy chủ trả về dữ liệu lạ, thử lại sau.','e');return}
    if(!r.ok){msg('⚠ '+esc(ERR[r.err]||('Không dùng được mã ('+r.err+')')),'e');return}
    return deliver(r);
  },function(e){msg('⚠ '+esc(rpcErr(e)),'e')}).then(function(){setBusy(false)},function(){setBusy(false)});
}
/* đưa quà vào thư của nhân vật đang chơi → chờ bản lưu lên mây → xác nhận với máy chủ */
function deliver(r){
  var q=(r.qua&&typeof r.qua==='object'&&Object.keys(r.qua).length)?r.qua:null,lt=Math.floor(+r.lt)||0,mailed=false;
  if(q){
    var ok=false;
    try{ok=MAIL.send({id:'gc_'+r.code,from:'Mã Quà Tặng',title:'🎟 '+String(r.title||'Quà Mã Quà Tặng'),
      body:'Quà từ mã <b>'+r.code+'</b>.\nBấm <b>Nhận quà</b> để cộng vào nhân vật.',q:q})}catch(e){ok=false}
    mailed=true;
    if(!ok&&!(PS[cur]&&PS[cur].mailIds&&PS[cur].mailIds['gc_'+r.code])){
      msg('⚠ Chưa đưa được quà vào Hòm Thư. Hãy nhập lại mã để nhận lại.','e');return;
    }
  }
  if(lt>0){try{LT.refresh()}catch(e){}}
  msg('⏳ Đang lưu…','i');
  return saved().then(function(okSave){
    if(!okSave){msg('⚠ Quà đã vào Hòm Thư nhưng chưa lưu lên máy chủ được. Hãy nhập lại mã sau ít giây để hoàn tất (không bị nhận đôi).','e');return}
    var c;try{c=Promise.resolve(KCL.rpc('gc_confirm',{p_code:r.code}))}catch(e){c=Promise.resolve()}
    return c.then(null,function(){}).then(function(){
      var l=[];
      if(lt>0)l.push('💎 <b>+'+nf(lt)+' Linh Thạch</b> đã cộng vào ví');
      if(mailed)l.push('🎁 Quà đã gửi vào <b>✉️ Hòm Thư</b> — <a href="#" data-mail="1" style="color:#ffd76a">mở thư để Nhận quà</a>');
      if(!l.length)l.push('Mã không có quà nào để nhận.');
      msg('✅ Nhập mã <b>'+esc(r.code)+'</b> thành công!<br>'+l.join('<br>'),'o');
      say('🎟 Nhập mã quà thành công','#ffe9a0');
      last=r.code;if(inp)inp.value='';
    });
  });
}
function saved(){
  return new Promise(function(res){
    var C=window.KTHM_CLOUD;
    if(!C||!C.saveNow){res(true);return}
    try{Promise.resolve(C.saveNow()).catch(function(){})}catch(e){}
    var n=0,iv=setInterval(function(){
      n++;var d=false,bad=false;
      try{d=!C.dirty();bad=C.status&&C.status()==='err'}catch(e){d=true}
      if(d&&!bad){clearInterval(iv);res(true)}
      else if(n>=20){clearInterval(iv);res(false)}   /* ~6 giây */
    },300);
  });
}

window.GCODE={open:openP,close:closeP,redeem:redeem,last:function(){return last}};
if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
})();
