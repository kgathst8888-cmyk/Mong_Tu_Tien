/* ===================================================================
   TỐI ƯU HIỆU NĂNG THÚ NUÔI (Fix424) — nạp SAU pets/33-fx-than-thu.js
   1) Cắt vẽ thú ở ngoài màn hình (Bạch Hổ / Thanh Long / Huyền Vũ — kể cả thú của người chơi khác ở làng).
   2) Tự bật chế độ nhẹ (PETFX_LITE: giảm nửa số hạt hiệu ứng) khi khung hình chậm, tự tắt khi đã mượt lại.
   3) Giới hạn số hiệu ứng kỹ năng thú sống cùng lúc.
   Các tối ưu khác nằm trong core/01d-pet-render.js: lưới biến dạng Huyền Vũ + Rồng vẽ vào ảnh đệm làm mới 30Hz,
   glowDraw bỏ save/restore. Tắt toàn bộ phần ảnh đệm: window.PETPERF_OFF=true. Chu Tước không đụng.
   =================================================================== */
(function(){
'use strict';
const cv=document.getElementById('c');
if(!cv||typeof PETX==='undefined')return;
/* 1) cắt ngoài màn hình */
const offscreen=()=>{try{const cx=(EP.x-cam)*s,m=420*s;return cx<-m||cx>cv.width+m}catch(e){return false}};
[2,3].forEach(k=>{const o=PETX[k]&&PETX[k].draw;if(!o||o.__cull)return;PETX[k].draw=function(){if(!window.PETPERF_OFF&&offscreen())return;return o.apply(this,arguments)};PETX[k].draw.__cull=1});
if(typeof PTG!=='undefined'&&PTG.draw&&!PTG.draw.__cull){const o=PTG.draw;PTG.draw=function(){if(!window.PETPERF_OFF&&offscreen())return;return o.apply(this,arguments)};PTG.draw.__cull=1}
/* 2) tự động chế độ nhẹ theo thời gian khung hình (trung bình trượt) */
let last=performance.now(),avg=16.7,slow=0,fast=0;
(function tick(){const n=performance.now(),d=Math.min(100,n-last);last=n;avg=avg*.92+d*.08;
 if(!document.hidden){if(avg>26){slow++;fast=0}else if(avg<20){fast++;slow=0}else{slow=fast=0}
  if(slow>90&&!window.PETFX_LITE&&!window.PETFX_LITE_USER){window.PETFX_LITE=true;window.PETFX_AUTO=1}
  if(fast>600&&window.PETFX_AUTO){window.PETFX_LITE=false;window.PETFX_AUTO=0}}
 requestAnimationFrame(tick)})();
window.PETPERF={offscreen,avg:()=>avg};
})();
