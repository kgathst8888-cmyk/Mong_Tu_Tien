/* ===== world/92-dung-tren-dat.js (Fix193) =====
 * Thôn Tân Thủ: nhân vật (+ thú cưng, thanh tên/HP, người chơi online) đứng trên LỀ ĐƯỜNG LÁT ĐÁ phía trước nhà,
 * không còn đứng ngay chân tường như thể đứng trên nhà. Chỉ dịch toạ độ vẽ theo trục dọc (không đổi logic/va chạm).
 * Chỉnh: VDY.k (px mỗi đơn vị s; 0 = như cũ). Fix218: k 16→44 để nhà lùi ra sau, nhân vật đứng rộng rãi hơn trên nền đất phía trước. Fix219: riêng Thành Thị Linh Giới dùng VDY.kc (=16). Không áp dụng ở Linh Điền/Mỏ/Tiên Giới/hầm ngục/chiến trường. */
(function(){
'use strict';
var D=window.VDY={k:44,kc:16,skip:0,dy:function(){try{return on()?D.k*s:(city()?D.kc*s:0)}catch(e){return 0}}};
/* Fix219: Thành Thị Linh Giới — hạ thêm nhân vật xuống (kc px mỗi đơn vị s) để cổng lùi ra sau, sàn đá phía trước rộng rãi */
function city(){
  if(typeof vil==='undefined'||!vil||typeof started==='undefined'||!started||(typeof bo!=='undefined'&&bo))return false;
  try{if(window.TG&&TG.on&&TG.on())return false}catch(e){}
  return !!(window.LCT&&LCT.on&&LCT.on())}
function on(){
  if(typeof vil==='undefined'||!vil||typeof started==='undefined'||!started||(typeof bo!=='undefined'&&bo))return false;
  if(window.VWD&&VWD.plain&&!VWD.plain())return false;
  try{if(window.TG&&TG.on&&TG.on())return false}catch(e){}
  return true}
function wrap(n){
  var f;try{f=eval('typeof '+n+'==="function"?'+n+':null')}catch(e){f=null}
  if(!f)return;
  var w=function(){var d=D.skip?0:D.dy();if(!d)return f.apply(this,arguments);g.save();g.translate(0,d);try{return f.apply(this,arguments)}finally{g.restore()}};
  try{eval(n+'=w')}catch(e){console.error('[dung-tren-dat]',n,e)}}
wrap('hero');wrap('drawEP');wrap('nameTag');
})();
