/* ===== CHỐNG HACK + BÁO CÁO CAN THIỆP (Fix428) — systems/62-chong-hack-khoa-tk.js =====
 * Nạp SAU systems/61-chong-dube-bao-mat.js và systems/12-cloud-save.js. Không đổi logic game.
 * Việc của module này: khi máy phát hiện dữ liệu bị can thiệp ngoài game (chữ ký localStorage lệch — window.__TAMPER do module 61 đặt,
 * hoặc vàng/mảnh ngoài khoảng) thì báo lên máy chủ qua RPC kthm_report_cheat. MÁY CHỦ mới là nơi cộng điểm và khoá tài khoản
 * (chong_hack_khoa_tk.sql); client chỉ là cảm biến — kẻ gian sửa client sẽ không tự báo, nên máy chủ còn tự quét gói lưu (trigger).
 * Mỗi loại chỉ báo 1 lần/phiên trang; chưa đăng nhập thì thử lại sau. */
(function(){
'use strict';
var done={},MAXG=1e13,MAXF=1e12;
function ready(){try{return !!(window.KCL&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function report(kind,detail){
  if(done[kind]||!ready())return;
  done[kind]=1;
  try{KCL.rpc('kthm_report_cheat',{p_kind:kind,p_detail:detail||null}).catch(function(){done[kind]=0})}catch(e){done[kind]=0}}
function rangeBad(){
  try{
    var g=typeof gold!=='undefined'?gold:0,f=typeof frag!=='undefined'?frag:0;
    return !isFinite(g)||g<0||g>MAXG||!isFinite(f)||f<0||f>MAXF}catch(e){return false}}
function tick(){
  if(window.__TAMPER)report('LOCAL_TAMPER',{ua:(navigator.userAgent||'').slice(0,120)});
  if(rangeBad())report('LOCAL_RANGE',{});
}
setInterval(tick,5000);
})();
