/*==== BOSS HẦM NGỤC x8 SÁT THƯƠNG + ĐỊA LONG ĐIỆN x3 CHỈ SỐ (Fix279) ====
  1) Boss Hầm Ngục (Phụ bản 1, dg thường, không cờ d2/mt/tw/ks/am/td/pv/pm): sát thương gây lên người chơi nhân thêm x8 (bọc dgHurt).
  2) Địa Long Điện (Phụ bản 2, e.d2): quái + Boss Ngục Long Vương nhân thêm x3 máu, thủ, sát thương (cộng dồn lên hệ số sẵn có của world/40).
  Chỉnh: window.HNG_X8.mul (1 = tắt) · window.DLD_X3.mul (1 = tắt). Nạp sau world/40-phu-ban-2.js. */
(function(){
'use strict';
if(typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof E==='undefined')return;
const H=window.HNG_X8={mul:6.4},D=window.DLD_X3={mul:3};
const _sp=dgSp;
dgSp=function(k){
 const n0=E.length;_sp.apply(this,arguments);
 try{
  if(E.length===n0||!dg)return;
  const e=E[E.length-1];if(!e||!e.dg)return;
  if(dg.d2){
   if(e.d2x3)return;e.d2x3=1;const m=D.mul;
   if(m>0&&m!==1){e.hp*=m;e.max*=m;e.df*=m}
  }else if(k==='boss'&&!(dg.mt||dg.tw||dg.ks||dg.am||dg.td||dg.pv||dg.pm)&&!(e.d2||e.pv||e.mt||e.tw||e.bi||e.ks||e.am||e.td)){
   e.hn8=1;
  }
 }catch(x){}
};
const _hurt=dgHurt;
dgHurt=function(e,mu){
 if(e){
  if(e.hn8&&H.mul>0)mu*=H.mul;
  else if(e.d2x3&&D.mul>0)mu*=D.mul;
 }
 return _hurt.call(this,e,mu);
};
})();
