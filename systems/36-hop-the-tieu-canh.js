/* ===== 💎 ĐỘT PHÁ TIỂU CẢNH GIỚI TỪ HỢP THỂ =====
 * Từ Hợp Thể, mỗi lần lên 1 tầng (tiểu cảnh giới) phải đột phá thủ công và tốn Linh Thạch:
 *   tầng 1→2: 10💎 · 2→3: 20💎 · … · 8→9: 80💎 (mỗi tầng +10).
 * Engine (ZC.bt) gọi htStep() khi tu vi đã đầy ở Hợp Thể tầng 1-8. Trừ Linh Thạch qua ví tài khoản ☁ (LT.spend).
 */
(function(){
'use strict';
var busy=0;
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
window.htCost=function(s){return 10*s};
window.htStep=function(){
  if(busy)return;
  var c=PS[cur]&&PS[cur].cv;if(!c||c.r<6||c.s>=9)return;
  var s0=c.s,cost=10*s0;
  if(!window.LT||!LT.spend){msg='Chưa có ví Linh Thạch (cần module Chợ Giao Dịch)';ui();return}
  if(!LT.logged()){msg='☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+cost+'💎)';ui();return}
  busy=1;
  LT.spend(cost,'hopthe_tc').then(function(r){
    busy=0;var c2=PS[cur]&&PS[cur].cv;
    if(r.ok){
      if(c2&&c2.r>=6&&c2.s<9){
        var nd=0;try{nd=ZC.tvInfo().need}catch(e){}
        c2.q=Math.max(0,c2.q-nd);c2.s++;
        try{if(!vil){ZS.cult(RCL[c2.r+1],false);DT.push({x:P.x,y:190,s:'Đột phá tiểu cảnh: '+ZC.nm(),g:1,l:110})}}catch(e){}
        msg='✨ Đột phá '+ZC.nm()+' (−'+cost+'💎)';
        try{sv()}catch(e){}
      }
    }else{
      msg=r.err==='poor'?'Không đủ Linh Thạch: cần '+cost+'💎, bạn có '+nf(r.lt)+'💎':'Không trừ được Linh Thạch ('+(r.msg||r.err)+')';
    }
    ui();
  });
};
})();
