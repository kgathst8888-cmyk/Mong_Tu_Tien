/* ĐẾM NGƯỢC RESET ALPHA — hiện băng nhỏ giữa trên màn hình tới 12:00 18/10/2026 (giờ VN = 05:00 UTC).
 * Đến giờ: báo máy chủ đang reset + nút tải lại. Quá 13:00 (giờ VN) tự ẩn hẳn. Bấm ✕ để thu gọn thành chấm nhỏ. */
(function(){
'use strict';
var T=Date.UTC(2026,9,18,5,0,0),END=T+3600000;
if(Date.now()>=END)return;
var el,min=false,iv;
function p2(n){return n<10?'0'+n:''+n}
function build(){
  if(el||!document.body)return;
  el=document.createElement('div');el.id='alpha-cd';
  el.style.cssText='position:fixed;top:calc(6px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:9990;max-width:92vw;box-sizing:border-box;padding:6px 12px;border-radius:12px;border:2px solid #b8964e;background:linear-gradient(#2a2118,#0e0a08);color:#f2e3b3;font:600 12px/1.35 system-ui,sans-serif;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.6);display:flex;align-items:center;gap:8px;pointer-events:auto';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){
    var a=e.target&&e.target.getAttribute&&e.target.getAttribute('data-a');
    if(a==='x'){min=true;draw();e.stopPropagation()}
    else if(a==='o'){min=false;draw();e.stopPropagation()}
    else if(a==='r'){location.reload()}
  });
}
function draw(){
  var now=Date.now(),d=T-now;
  if(now>=END){clearInterval(iv);if(el&&el.parentNode)el.parentNode.removeChild(el);el=null;return}
  build();if(!el)return;
  if(min){
    el.style.padding='4px 8px';
    el.innerHTML='<span data-a="o" style="cursor:pointer">⏳ '+(d>0?fmt(d):'RESET')+'</span>';
    return;
  }
  el.style.padding='6px 12px';
  if(d>0){
    el.innerHTML='<div>⚠ <b>RESET MÁY CHỦ – ALPHA TEST</b><br>12:00 18/10/2026 · còn <b style="color:#ffd76a;font-size:14px">'+fmt(d)+'</b><br><span style="font-weight:400;opacity:.85">Toàn bộ nhân vật, túi đồ, Chợ sẽ về như mới</span></div><span data-a="x" style="cursor:pointer;padding:2px 6px;font-size:14px">✕</span>';
  }else{
    el.innerHTML='<div>🔄 <b>Máy chủ đang reset</b><br><span style="font-weight:400">Hãy tải lại trang để vào ALPHA TEST</span></div><button data-a="r" style="cursor:pointer;border:1px solid #b8964e;background:#5a3f1a;color:#ffe9a8;border-radius:8px;padding:5px 10px;font:700 12px system-ui">Tải lại</button>';
  }
}
function fmt(ms){
  var s=Math.floor(ms/1000),dd=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  return (dd?dd+'n ':'')+p2(h)+':'+p2(m)+':'+p2(ss);
}
function start(){draw();iv=setInterval(draw,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
