/* ===== ⚔ TĂNG CHỈ SỐ BOSS (module riêng, nạp CUỐI) =====
 * BOSSUP.hp  = nhân MÁU boss (mọi loại boss: ngoài map b>=2, Hầm Ngục, Ma Thần, Kiếm Thánh, Tháp, Phụ Bản 2, Thánh Địa).
 *              Không nhân cho Boss Bất Tử hằng ngày (bi) và Phụ Bản Vàng (pv) vì đó là trận tính sát thương, không phải đánh chết.
 * BOSSUP.atk = nhân SỨC ĐÁNH boss: trong trận dg qua dgHurt (Hầm Ngục, Ma Thần, Kiếm Thánh, Tháp, Bất Tử, Phụ Bản, Thánh Địa);
 *              ngoài map qua core/01e-step-loop.js (đọc BOSSUP.atk cho boss b>=2).
 * Quái Đạo Thể (Linh Giới bản đồ 2–5): chỉnh trực tiếp bảng LGS trong world/36-linh-gioi-maps.js (hpn ×3 · df ×1,5 · at ×2).
 * Muốn mạnh/yếu hơn: đổi số ở dòng BOSSUP dưới đây. */
(function(){'use strict';
var TB=window.BOSSUP={hp:3,atk:2,vs:.7,cap:.03};
function isBoss(e){return !!e&&(e.k==='boss'||e.mt||e.ks||e.td||e.b>=2)}
function up(e){
  if(!e||e._bup||!(e.max>0)||!isBoss(e))return;
  e._bup=1;
  if(e.bi||e.pv)return;
  e.hp*=TB.hp;e.max*=TB.hp}
function sweep(){try{if(typeof E!=='undefined')E.forEach(up)}catch(x){}}
try{if(typeof dgHurt==='function'){var _h=dgHurt;dgHurt=function(e,mu){return _h.call(this,e,isBoss(e)?mu*TB.atk:mu)}}}catch(x){}
try{if(typeof dgTick==='function'){var _t=dgTick;dgTick=function(){sweep();return _t.apply(this,arguments)}}}catch(x){}
try{if(typeof step==='function'){var _s=step;step=function(){sweep();return _s.apply(this,arguments)}}}catch(x){}
/* Giới hạn SÁT THƯƠNG NHÂN VẬT lên boss (đánh qua dm(), nạp cuối nên bọc ngoài cùng):
 *  BOSSUP.vs  = nhân sát thương nhân vật gây ra cho boss (0,7 = còn 70%)
 *  BOSSUP.cap = mỗi đòn tối đa bao nhiêu % MÁU TỐI ĐA của boss (0,03 = 3%) → không thể "một phát chết boss"
 *  Không áp cho Boss Bất Tử hằng ngày (bi) và Phụ Bản Vàng (pv) vì đó là trận tính tổng sát thương. */
try{if(typeof dm==='function'){var _d=dm;dm=function(e,m,sl){
  if(!e||!isBoss(e)||e.bi||e.pv||!(e.max>0))return _d.apply(this,arguments);
  var a=Array.prototype.slice.call(arguments);if(typeof a[1]==='number')a[1]*=TB.vs;
  var h0=e.hp,n0=(typeof DT!=='undefined')?DT.length:0,r=_d.apply(this,a),dealt=h0-e.hp,lim=e.max*TB.cap;
  if(dealt>lim&&lim>0){e.hp=h0-lim;
    try{var k=lim/dealt;for(var i=n0;i<DT.length;i++){var q=DT[i];if(q&&typeof q.s==='number')q.s=Math.max(1,Math.round(q.s*k))}}catch(x){}}
  return r}}}catch(x){}
})();
