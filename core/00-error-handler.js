/* core/00-error-handler.js */
/* ===== BỘ BẮT LỖI AN TOÀN / CROSS-BROWSER =====
   - Không che lỗi thật.
   - Không hiện "Script error." mơ hồ do script/resource khác origin.
   - Nếu có lỗi JS thật, hiển thị file + dòng + stack ngắn để sửa được ngay.
*/
(function(){
'use strict';
var box=null,tm=0,lastKey='',lastAt=0;
function textOf(e){
  var m=(e&&e.message)||e||'Lỗi không xác định';
  var src=e&&e.filename?String(e.filename).split('/').pop():'';
  var ln=e&&e.lineno?e.lineno:'';
  var col=e&&e.colno?e.colno:'';
  var st=e&&e.error&&e.error.stack?String(e.error.stack).split('\n').slice(0,3).join(' ← '):'';
  if(src)m+=' @ '+src+(ln?':'+ln:'')+(col?':'+col:'');
  else if(st)m+=' · '+st;
  return String(m);
}
function show(m){
  try{
    m=String(m||'Lỗi không xác định');
    var now=Date.now(),key=m;
    if(key===lastKey&&now-lastAt<1500)return;
    lastKey=key;lastAt=now;
    if(!box){
      box=document.createElement('div');
      box.id='game-error-box';
      box.style.cssText='position:fixed;left:6px;right:6px;top:6px;z-index:2147483647;background:rgba(120,0,0,.94);color:#fff;font:12px/1.35 sans-serif;padding:7px 9px;border-radius:6px;pointer-events:auto;word-break:break-word;box-shadow:0 2px 10px #0008';
      box.onclick=function(){box.style.display='none'};
      (document.body||document.documentElement).appendChild(box);
    }
    box.style.display='block';
    box.textContent='⚠ Lỗi game: '+m+' (chạm để ẩn)';
    clearTimeout(tm);tm=setTimeout(function(){if(box)box.style.display='none'},12000);
    try{console.error('[Mong Tu Tien]',m)}catch(e){}
  }catch(e){}
}
window.__showErr=show;
window.__gameErrors=[];
window.addEventListener('error',function(e){
  /* Safari/WebKit có thể báo lỗi script khác origin chỉ bằng "Script error.".
     Không đủ dữ kiện để coi đó là lỗi của game, nên bỏ qua banner mơ hồ. */
  if(e&&e.message==='Script error.'&&!e.filename&&!e.error)return;
  var m=textOf(e);window.__gameErrors.push(m);show(m);
});
window.addEventListener('unhandledrejection',function(e){
  var r=e&&e.reason,m=r&&r.message?r.message:r;
  var m2='Promise: '+String(m||'Lỗi Promise không xác định');
  window.__gameErrors.push(m2);show(m2);
});
})();

