/* ===== 🎲 TỈ LỆ RƠI THẦN THOẠI / THIÊN THẦN (world/97-drop-than-thoai-thien-than.js, Fix233) =====
 * - MỌI Boss (boss thường b>=2, Boss Phụ bản/Hầm ngục, Tháp Thử Luyện, Ma Thần, Ác Ma, Kiếm Thành): mỗi lần hạ gục
 *   3% rơi 1 món 🟠 Thần Thoại và 1% rơi 1 món 🩷 Thiên Thần (hai lần tung độc lập).
 * - Quái thường và Tinh Anh (b=0,1, quái Phụ bản): KHÔNG rơi Thần Thoại / Thiên Thần.
 * - Cách làm: trong lúc chạy drop() gốc, mọi give() trang bị Thần Thoại/Thiên Thần bị chặn (các công thức cũ rải rác ở
 *   core/01l, 01t, world/07, 47...), sau đó tung công thức mới ở đây. Nhận thưởng hạng Boss ngày (world/27), rương, shop... không bị ảnh hưởng.
 * - Số opt theo phẩm: xem equipment/55-opt-moi.js (OPTN).
 * Chỉnh: CF.mythic / CF.angel. Phải nạp SAU các module có hook drop() (đặt cuối index.html). */
(function(){
'use strict';
if(typeof drop!=='function'||typeof give!=='function'||typeof gen!=='function')return;
var CF={mythic:.03,angel:.01};
var IN=0;
var _give=give;
give=function(it){
  if(IN&&it&&(it.r===4||it.r===5))return;
  return _give.apply(this,arguments)};
function isBoss(e){return !!e&&(e.b>=2||e.k==='boss'||e.tw||e.mt||e.ks||e.am)}
var _drop=drop;
drop=function(e){
  var ret;
  IN++;
  try{ret=_drop.apply(this,arguments)}finally{IN--}
  try{
    if(isBoss(e)&&!e.td){
      var L=e.lv||(typeof P!=='undefined'?P.lv:1);
      if(Math.random()<CF.mythic){
        DT.push({x:e.x,y:230,s:'✨ Rơi Thần Thoại!',c:RC[4],l:150,g:1});_give(gen(L,4),e.x,200)}
      if(Math.random()<CF.angel){
        DT.push({x:e.x,y:270,s:'✨ Rơi Thiên Thần!',c:RC[5],l:200,g:1});_give(gen(L,5),e.x,240)}
    }
  }catch(x){try{console.error('[drop-rare]',x)}catch(y){}}
  return ret};
window.DROP_RARE={cfg:CF};
})();
