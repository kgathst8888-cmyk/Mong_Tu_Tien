/*==== DƯỢC ĐIẾM: GIÁ THUỐC HP x20 (Fix264) ====
  Giá Thuốc HP ở Dược Điếm (tab Dược, trong làng) nhân x20: (20+Lv*3)*20 vàng/bình. Thuốc MP giữ nguyên.
  Bọc bp() (core/01q-village.js); hiển thị giá ở core/01p-bag-pet-ui.js dùng cùng hệ số.
  Chỉnh: window.DUOC_X.hp (giá HP), window.DUOC_X.mp (giá MP, mặc định 1). Đặt 1 để tắt. */
(function(){
'use strict';
if(typeof bp!=='function')return;
const CFG=window.DUOC_X={hp:20,mp:1};
const _bp=bp;
bp=function(k,n){
 const m=k?CFG.mp:CFG.hp;if(m===1)return _bp.apply(this,arguments);
 const pr=Math.round((20+P.lv*3)*n*m);
 if(gold<pr){msg='Không đủ vàng';ui();return}
 gold-=pr;if(k)mpP+=n;else hpP+=n;msg='Đã mua';ui()};
})();
