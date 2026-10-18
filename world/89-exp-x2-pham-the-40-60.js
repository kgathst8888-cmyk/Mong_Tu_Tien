/*==== EXP x2 CHO PHÀM THỂ LV40 → LV60 (Fix280) ====
  Nhân vật Phàm Thể (không phải Đạo Thể HDAO, không phải Tiên Nhân CTHE) ở cấp 40-60: EXP nhận từ quái x2.
  Engine cộng EXP ngay trước drop(e) (core/01e-step-loop.js) nên bọc drop() và cộng thêm đúng phần vừa cộng
  (cùng công thức engine; nếu quái thuộc map đang bị giảm EXP bởi Fix262 thì nhân thêm hệ số giảm đó cho khớp).
  Chỉnh: window.EXP_PHAM.mul (2 mặc định, 1 = tắt), .lo/.hi = khoảng cấp. */
(function(){
'use strict';
if(typeof drop!=='function'||typeof P==='undefined')return;
const CFG=window.EXP_PHAM={mul:2,lo:40,hi:60};
function pham(){
 try{if(window.HDAO&&HDAO.on&&HDAO.on())return false}catch(x){}
 try{if(window.CTHE&&CTHE.on&&CTHE.on())return false}catch(x){}
 return true}
const _drop=drop;
drop=function(e){
 try{
  const L=P.lv|0;
  if(e&&CFG.mul>1&&L>=CFG.lo&&L<=CFG.hi&&pham()){
   let base=(window.HDAO?HDAO.xg():1)*Math.round((e.dg?(e.b?150:12):e.b==3?200:e.b?80:15)*(1+e.lv/5));
   let g0=typeof XR==='function'?XR(base):Math.round(base);
   const G=window.GEXP_MAP;
   if(G&&G.mul<1&&!e.dg&&e.k!=='pal'&&!lg&&!dg&&!vil&&G.maps.indexOf(mapSel|0)>=0)g0=Math.round(g0*G.mul);
   const add=Math.round(g0*(CFG.mul-1));
   if(add>0){P.xp+=add;try{DT.push({x:P.x,y:150,s:'+'+add+' EXP x'+CFG.mul,c:'#9be8ff',l:40})}catch(x){}}
  }
 }catch(x){}
 return _drop.apply(this,arguments)};
})();
