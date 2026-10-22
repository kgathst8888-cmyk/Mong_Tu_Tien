/*==== GIẢM QUÁI PHÀM THỂ LV1-20 (Fix411) ====
  Quái ở bản đồ Phàm Thể Lv1-20 (mapSel=0) yếu đi 50% để người chơi mới dễ lên Lv21:
  máu x0.5, thủ x0.5, sức đánh x0.5 (qua e.rm, core/01e-step-loop.js đã nhân vào sát thương quái).
  Áp cho quái thường + Tinh Anh + Boss Sử Thi (trừ 'pal' boss thế giới). Không đụng Nhân Giới/Linh Giới/Tiên Giới/phụ bản/làng.
  Chỉ áp khi quái Lv<=20 (map treo của nhân vật cấp cao dùng map 0 sẽ không bị giảm).
  Chỉnh hệ số: window.QPT_GIAM.mul=0.5 (đặt 1 để tắt). */
(function(){
'use strict';
if(typeof spawn!=='function'||typeof E==='undefined')return;
const CFG=window.QPT_GIAM={mul:0.5,map:0,maxLv:20};
const _spawn=spawn;
spawn=function(i){
 const n0=E.length;_spawn.apply(this,arguments);
 try{
  if(E.length===n0||typeof lg==='undefined'||lg||dg||vil)return;
  const m=CFG.mul;if(!(m>0)||m===1||(mapSel|0)!==CFG.map)return;
  const e=E[E.length-1];if(!e||e.k==='pal'||e.tg12||e.qptG||(e.lv|0)>CFG.maxLv)return;
  e.qptG=1;e.hp*=m;e.max*=m;e.df*=m;e.rm=(e.rm||1)*m;
 }catch(x){}
};
})();
