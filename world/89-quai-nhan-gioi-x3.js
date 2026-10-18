/*==== QUÁI NHÂN GIỚI x3 (Fix261) ====
  Quái ở 3 bản đồ Nhân Giới: Xích Viêm Ma Ngục (mapSel=2), U Minh Ma Cốc (3), Hư Không Ma Điện (4) mạnh gấp 3 lần hiện tại:
  máu x3, thủ x3, sức đánh x3 (qua e.rm, nhân vào công thức sát thương quái ở 01e-step-loop.js).
  Áp cho quái thường + Tinh Anh + Boss Sử Thi (trừ 'pal' boss thế giới). Không đụng Linh Giới/phó bản/làng.
  Chỉnh hệ số: window.QNG_X3.mul=3 (đặt 1 để tắt). */
(function(){
'use strict';
if(typeof spawn!=='function'||typeof E==='undefined')return;
const CFG=window.QNG_X3={mul:2.4,maps:[2,3,4]};
const _spawn=spawn;
spawn=function(i){
 const n0=E.length;_spawn.apply(this,arguments);
 try{
  if(E.length===n0||typeof lg==='undefined'||lg||dg||vil)return;
  const m=CFG.mul;if(!(m>0)||m===1||CFG.maps.indexOf(mapSel|0)<0)return;
  const e=E[E.length-1];if(!e||e.k==='pal'||e.x3)return;
  e.x3=1;e.hp*=m;e.max*=m;e.df*=m;e.rm=(e.rm||1)*m;
 }catch(x){}
};
})();
