/*==== GIẢM EXP QUÁI Huyết Nguyệt Sơn Môn + Tuyết Hàn Ma Phong (Fix262) ====
  Nhân Giới, mapSel=0 (Huyết Nguyệt) và mapSel=1 (Tuyết Hàn): EXP nhận từ quái còn 30%.
  Engine cộng EXP ngay trước khi gọi drop(e) (core/01e-step-loop.js), nên bọc drop() và trừ lại 70% phần vừa cộng
  (tính đúng công thức engine: XR(HDAO.xg() × round((boss3?200:boss?80:15) × (1+Lv/5)))).
  Không áp cho phó bản/boss đặc biệt (e.dg), Linh Giới, làng. Chỉnh: window.GEXP_MAP.mul (1 = tắt). */
(function(){
'use strict';
if(typeof drop!=='function'||typeof P==='undefined')return;
const CFG=window.GEXP_MAP={mul:.3,maps:[0,1]};
const _drop=drop;
drop=function(e){
 try{
  if(e&&!e.dg&&e.k!=='pal'&&!lg&&!dg&&!vil&&CFG.mul<1&&CFG.maps.indexOf(mapSel|0)>=0){
   const base=(window.HDAO?HDAO.xg():1)*Math.round((e.b==3?200:e.b?80:15)*(1+e.lv/5)),g0=typeof XR==='function'?XR(base):Math.round(base),cut=Math.round(g0*(1-CFG.mul));
   if(cut>0)P.xp=Math.max(0,P.xp-cut)}
 }catch(x){}
 return _drop.apply(this,arguments)};
})();
