/* core/00-khoa-zoom-mobile.js — Fix255: khoá zoom trên trình duyệt điện thoại.
   Nguyên nhân màn hình bị phóng to khi vào game: iOS Safari tự zoom khi focus ô nhập có chữ < 16px (ô đăng nhập 15px),
   sau khi ẩn bàn phím trang vẫn giữ mức zoom nên HUD bị tràn mép phải.
   Cách xử lý: (1) viewport khoá scale, (2) ô nhập >= 16px trên thiết bị cảm ứng, (3) chặn pinch/gesture/Ctrl+lăn chuột,
   (4) tự trả về scale 1 khi thoát ô nhập hoặc khi phát hiện bị zoom. Không đụng tới logic game. */
(function(){
 if(window.__khoaZoom)return;window.__khoaZoom=1;
 var VP='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
 function meta(){var m=document.querySelector('meta[name="viewport"]');if(!m){m=document.createElement('meta');m.name='viewport';(document.head||document.documentElement).appendChild(m)}return m}
 function lock(){try{meta().setAttribute('content',VP)}catch(e){}}
 lock();
 /* CSS */
 try{var st=document.createElement('style');st.id='khoa-zoom-css';
  st.textContent='html,body{touch-action:pan-x pan-y;-webkit-text-size-adjust:100%;text-size-adjust:100%}canvas{touch-action:none}'
   +'@media (pointer:coarse){input,select,textarea{font-size:16px!important}}';
  (document.head||document.documentElement).appendChild(st)}catch(e){}
 /* Chặn pinch / gesture (iOS Safari bỏ qua user-scalable=no) */
 ['gesturestart','gesturechange','gestureend'].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()},{passive:false})});
 document.addEventListener('touchmove',function(e){try{if((e.touches&&e.touches.length>1)||(e.scale&&e.scale!==1))e.preventDefault()}catch(_){}},{passive:false,capture:true});
 /* Chặn Ctrl + lăn chuột / Ctrl +,-,0 (khi chơi bằng trình duyệt máy tính) */
 addEventListener('wheel',function(e){if(e.ctrlKey)e.preventDefault()},{passive:false});
 addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&(e.key==='+'||e.key==='-'||e.key==='='||e.key==='0'||e.key==='_'))e.preventDefault()});
 /* Tự trả về scale 1 nếu trang bị phóng to */
 var busy=0;
 function reset(){
  try{
   var vv=window.visualViewport;
   if(!vv||vv.scale<=1.001)return;
   if(busy)return;busy=1;
   var m=meta();m.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes');
   try{scrollTo(0,0)}catch(e){}
   setTimeout(function(){lock();try{scrollTo(0,0)}catch(e){}busy=0},60);
  }catch(e){busy=0}
 }
 function later(){[0,120,350,800].forEach(function(d){setTimeout(reset,d)})}
 document.addEventListener('focusout',later,true);
 addEventListener('pageshow',later);
 addEventListener('orientationchange',later);
 try{if(window.visualViewport)visualViewport.addEventListener('resize',reset)}catch(e){}
 /* Vài giây đầu sau khi tải: kiểm tra liên tục để bắt zoom lúc vào game */
 var n=0,iv=setInterval(function(){reset();if(++n>20)clearInterval(iv)},300);
})();
