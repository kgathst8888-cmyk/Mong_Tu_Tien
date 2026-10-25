/* ===== CHẶN F12 / DÁN MÃ VÀO CONSOLE (systems/63-chan-devtools.js) =====
 * Nạp SỚM (ngay sau core/00-error-handler.js). Không đổi logic game.
 * 1) Chặn phím tắt: F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U, Ctrl/Cmd+S (xem/lưu nguồn) và chuột phải.
 * 2) Phát hiện DevTools đang mở (đo thời gian lệnh debugger — chỉ chậm khi DevTools mở): phủ màn hình chặn chơi cho tới khi đóng.
 * 3) Cảnh báo Self-XSS trong console (chống bị lừa dán mã lạ).
 * Chạy trên localhost / file:// thì TẮT để dev còn sửa lỗi; thêm ?dev=1 không có tác dụng trên máy chủ thật.
 * Thành thật về giới hạn: đây là lớp cản người chơi thường, KHÔNG cản được người am hiểu (tắt breakpoint, sửa mã, dùng tool khác).
 * Lớp quyết định vẫn là máy chủ (push_save, sổ cái, kthm_report_cheat…). */
(function(){
'use strict';
var h=location.hostname,p=location.protocol;
if(p==='file:'||h==='localhost'||h==='127.0.0.1'||h==='')return;
function stop(e){try{e.preventDefault();e.stopPropagation()}catch(x){}return false}
addEventListener('keydown',function(e){
  var k=(e.key||'').toLowerCase(),c=e.ctrlKey||e.metaKey;
  if(e.keyCode===123||k==='f12')return stop(e);
  if(c&&e.shiftKey&&(k==='i'||k==='j'||k==='c'||k==='k'))return stop(e);
  if(c&&(k==='u'||k==='s'))return stop(e);
  if(e.metaKey&&e.altKey&&(k==='i'||k==='j'||k==='c'||k==='u'))return stop(e);
},true);
addEventListener('contextmenu',function(e){
  var t=e.target&&e.target.tagName;
  if(t==='INPUT'||t==='TEXTAREA')return;
  return stop(e);
},true);
try{
  var st='color:#e33;font-size:26px;font-weight:bold',st2='font-size:14px';
  console.log('%cDỪNG LẠI!',st);
  console.log('%cĐây là công cụ dành cho nhà phát triển. Nếu ai bảo bạn dán mã vào đây để "có đồ / có Linh Thạch", đó là lừa đảo và có thể làm bạn mất tài khoản. Sửa dữ liệu ngoài game sẽ bị máy chủ phát hiện và khoá tài khoản.',st2);
}catch(e){}
var ov=null,open=false;
function show(){
  if(ov)return;
  ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0b0b10;color:#eee;display:flex;align-items:center;justify-content:center;text-align:center;font:16px/1.6 sans-serif;padding:24px';
  ov.innerHTML='<div><div style="font-size:42px">🛡️</div><div style="font-size:20px;font-weight:bold;margin:8px 0">Phát hiện công cụ nhà phát triển (F12)</div><div>Hãy đóng DevTools để tiếp tục chơi.<br>Can thiệp dữ liệu ngoài game sẽ bị khoá tài khoản.</div></div>';
  (document.body||document.documentElement).appendChild(ov);
}
function hide(){if(ov){try{ov.remove()}catch(e){}ov=null}}
function check(){
  var t=performance.now();
  (function(){debugger})();
  var slow=performance.now()-t>120;
  if(slow&&!open){open=true;window.__DEVTOOLS=1;show()}
  else if(!slow&&open){open=false;window.__DEVTOOLS=0;hide()}
}
setInterval(check,1500);
setTimeout(check,300);
})();
