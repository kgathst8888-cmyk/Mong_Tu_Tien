/*==== BOSS THÁP THÍ LUYỆN x10 TẤN CÔNG (Fix263) ====
  Boss Tháp (e.tw, world/07-trial-tower.js): sát thương gây lên người chơi nhân thêm x10 (bọc dgHurt, cùng cách các module khác).
  Chỉnh: window.BTHAP_X10.mul (1 = tắt). */
(function(){
'use strict';
if(typeof dgHurt!=='function')return;
const CFG=window.BTHAP_X10={mul:10};
const _hurt=dgHurt;
dgHurt=function(e,mu){return _hurt.call(this,e,e&&e.tw?mu*CFG.mul:mu)};
})();
