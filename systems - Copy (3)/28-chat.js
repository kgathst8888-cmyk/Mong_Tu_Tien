/* ===== 💬 CHAT THẾ GIỚI =====
 * Dùng chung tài khoản ☁ (KCL.rpc). Cần chạy chat.sql 1 lần trong Supabase.
 * Một kênh chung, hỏi máy chủ (polling) nên không cần bật Realtime.
 */
(function(){
'use strict';
var MAXLEN=120,GAP=2000,POLL_OPEN=3000,POLL_BG=5000,KEEP=80;
var BAD=['địt','lồn','cặc','đcm','dcm','vcl','đụ má','đéo'];
var lastId=0,unread=0,open=false,busy=false,lastSend=0,seen={},timer=0,errMsg='';
var btn,pn,list,inp,badge,note,peek,peekT=0;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clean(t){var o=t;BAD.forEach(function(w){o=o.replace(new RegExp(w,'gi'),'***')});return o}
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function nice(e){var m=String(e&&e.message||e);return /chat_|function|schema|404/i.test(m)?'Máy chủ chưa cài chat (chạy file chat.sql trong Supabase).':(e&&e.net?'Mất kết nối mạng.':m)}

function build(){
  var st=document.createElement('style');
  st.textContent='#chat-btn{position:fixed;left:8px;top:calc(132px + env(safe-area-inset-top,0px));width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;cursor:pointer}'+
  '#chat-btn i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#e33;color:#fff;font:700 10px/16px sans-serif;text-align:center;font-style:normal;display:none;padding:0 3px}'+
  '#chat-peek{position:fixed;left:8px;top:calc(178px + env(safe-area-inset-top,0px));max-width:min(190px,56vw);padding:5px 9px;border-radius:10px;background:rgba(14,10,8,.88);border:1px solid #b8964e;color:#f2e3b3;font:12px/1.35 system-ui,sans-serif;z-index:3;display:none;cursor:pointer;word-break:break-word;box-shadow:0 2px 8px #0008}'+
  '#chat-peek b{color:#ffd76a}#chat-peek span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
  '#chat-pn{position:fixed;left:0;right:0;bottom:0;height:56%;max-height:460px;background:rgba(14,10,8,.97);border-top:2px solid #b8964e;z-index:10;display:none;flex-direction:column;color:#f2e3b3;font-family:system-ui,sans-serif;padding-bottom:env(safe-area-inset-bottom,0px)}'+
  '#chat-pn .ch{display:flex;align-items:center;padding:8px 12px;font-weight:700;border-bottom:1px solid #4a3a2a}#chat-pn .ch span{flex:1}'+
  '#chat-pn .ch button{background:none;border:0;color:#f2e3b3;font-size:20px}'+
  '#chat-list{flex:1;overflow-y:auto;padding:8px 12px;font-size:14px;line-height:1.4;-webkit-overflow-scrolling:touch}'+
  '#chat-list div{margin:3px 0;word-break:break-word}#chat-list b{color:#ffd76a}#chat-list .me b{color:#7be07a}#chat-list small{opacity:.5;margin-left:4px}'+
  '#chat-list a{color:#c66;text-decoration:none;margin-left:6px;font-size:12px;opacity:.55}'+
  '#chat-note{padding:4px 12px;font-size:12px;color:#ff9a8a;display:none}'+
  '#chat-pn .cf{display:flex;gap:6px;padding:8px 10px;border-top:1px solid #4a3a2a}'+
  '#chat-pn input{flex:1;min-width:0;background:#1d1510;border:1px solid #6a5434;border-radius:8px;color:#fff;padding:9px;font-size:15px}'+
  '#chat-pn .cf button{background:#8a6420;border:0;border-radius:8px;color:#fff;padding:0 16px;font-weight:700}';
  document.head.appendChild(st);
  btn=document.createElement('div');btn.id='chat-btn';btn.innerHTML='💬<i></i>';badge=btn.querySelector('i');
  btn.onpointerdown=function(e){e.stopPropagation();toggle()};
  document.body.appendChild(btn);
  peek=document.createElement('div');peek.id='chat-peek';
  peek.onpointerdown=function(e){e.stopPropagation();hidePeek();toggle(true)};
  document.body.appendChild(peek);
  pn=document.createElement('div');pn.id='chat-pn';
  pn.innerHTML='<div class="ch"><span>💬 Chat Thế Giới</span><button id="chat-x">✕</button></div><div id="chat-list"></div><div id="chat-note"></div>'+
    '<div class="cf"><input id="chat-in" maxlength="'+MAXLEN+'" placeholder="Nhập tin nhắn…" autocomplete="off"><button id="chat-go">Gửi</button></div>';
  document.body.appendChild(pn);
  list=pn.querySelector('#chat-list');inp=pn.querySelector('#chat-in');note=pn.querySelector('#chat-note');
  pn.querySelector('#chat-x').onclick=function(){toggle(false)};
  pn.querySelector('#chat-go').onclick=send;
  ['keydown','keyup','keypress'].forEach(function(t){inp.addEventListener(t,function(e){e.stopPropagation();if(t=='keydown'&&e.key=='Enter')send()})});
  ['pointerdown','touchstart'].forEach(function(t){pn.addEventListener(t,function(e){e.stopPropagation()})});
}
function hidePeek(){clearTimeout(peekT);if(peek)peek.style.display='none'}
function showPeek(m){
  if(open||!peek)return;
  peek.innerHTML='<b>'+esc(m.name)+'</b>: <span>'+esc(m.msg)+'</span>';
  peek.style.display='block';clearTimeout(peekT);peekT=setTimeout(hidePeek,6000);
}
function setNote(t){errMsg=t||'';note.style.display=t?'block':'none';note.textContent=t||''}
function sys(t){var d=document.createElement('div');d.style.opacity='.6';d.textContent=t;list.appendChild(d)}

function add(m){
  if(seen[m.id])return;seen[m.id]=1;if(m.id>lastId)lastId=m.id;
  var near=list.scrollHeight-list.scrollTop-list.clientHeight<60;
  var d=document.createElement('div');if(m.me)d.className='me';
  var t=new Date(m.ts*1000),hm=('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2);
  d.innerHTML='<b>'+esc(m.name)+'</b>: '+esc(m.msg)+'<small>'+hm+'</small>'+(m.me?'':'<a href="#" data-id="'+m.id+'" title="Báo cáo">⚑</a>');
  list.appendChild(d);
  while(list.children.length>KEEP)list.removeChild(list.firstChild);
  if(open&&near)list.scrollTop=list.scrollHeight;
}
function render(msgs,first){
  var fresh=0,lastOther=null;
  msgs.forEach(function(m){if(!seen[m.id]){add(m);if(!m.me){fresh++;lastOther=m}}});
  if(!first&&lastOther&&!open)showPeek(lastOther);
  if(first)unread=0;else if(!open)unread+=fresh;
  badge.style.display=unread>0?'block':'none';badge.textContent=unread>9?'9+':unread;
  if(open&&first)list.scrollTop=list.scrollHeight;
}
async function poll(){
  if(busy||!logged()||typeof started=='undefined'||!started)return;busy=true;
  try{
    var first=lastId===0,r=await KCL.rpc('chat_recent',{p_after:lastId,p_limit:first?40:60});
    if(r&&r.status==='ok'){setNote('');render(r.msgs||[],first)}
  }catch(e){setNote(nice(e))}
  busy=false;
}
async function send(){
  var raw=(inp.value||'').trim();if(!raw)return;
  if(!logged()){setNote('Cần đăng nhập ☁ (menu chính) để chat.');return}
  if(Date.now()-lastSend<GAP){setNote('Gửi chậm lại một chút…');return}
  lastSend=Date.now();inp.value='';
  try{
    var r=await KCL.rpc('chat_send',{p_name:myName(),p_text:clean(raw).slice(0,MAXLEN)});
    if(r&&r.status==='ok')setNote('');
    else setNote(r&&r.status=='slow'?'Gửi chậm lại một chút…':r&&r.status=='banned'?'Bạn đã bị cấm chat.':'Không gửi được.');
    poll();
  }catch(e){setNote(nice(e))}
}
function toggle(v){
  open=v===undefined?!open:v;pn.style.display=open?'flex':'none';
  if(open){hidePeek();unread=0;badge.style.display='none';
    if(!logged())setNote('Cần đăng nhập ☁ (menu chính) để xem và gửi tin.');else setNote('');
    poll();setTimeout(function(){list.scrollTop=list.scrollHeight},50)}
}
function loop(){clearTimeout(timer);poll();timer=setTimeout(loop,open?POLL_OPEN:POLL_BG)}
function boot(){
  build();
  list.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[data-id]');if(!a)return;e.preventDefault();
    if(!confirm('Báo cáo tin nhắn này?'))return;
    KCL.rpc('chat_report',{p_id:+a.dataset.id}).then(function(){a.remove();setNote('Đã gửi báo cáo.')}).catch(function(e){setNote(nice(e))});
  });
  setInterval(function(){
    try{
      var ar=document.getElementById('arena-scene'),on=typeof started!='undefined'&&started&&!(ar&&ar.classList.contains('on'));
      btn.style.display=on?'flex':'none';
      if(!on){hidePeek();if(open)toggle(false)}
    }catch(e){}
  },400);
  loop();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KTHM_CHAT={open:function(){toggle(true)},close:function(){toggle(false)}};
})();
