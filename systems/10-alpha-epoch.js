/* ALPHA EPOCH — chạy TRƯỚC systems/11-cloud-only.js.
 * Khi máy chủ được reset (epoch tăng), máy người chơi còn bản lưu/phiên đăng nhập cũ sẽ tự xoá dữ liệu game cục bộ
 * để KHÔNG đẩy dữ liệu cũ ngược lên mây. Không gọi được máy chủ → bỏ qua, game chạy như bình thường. */
(function(){
'use strict';
var URL_='https://fdaoswcyhbkzzuwlbrdp.supabase.co',KEY='sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw';
var EK='kthm_alpha_epoch';
var WIPE=['kthm2','kthm_qs','kthm_dg','kthm2_arena_v3','kthm_sig_kthm2','kthm_localbak','kthm_cloud'];
try{
  /* FIX272b: thử tối đa 3 lần (trước đây lỗi mạng 1 lần là bỏ qua → máy giữ bản cũ và đẩy ngược lên mây → tài khoản không bị reset).
   * Máy offline thì bỏ qua ngay; phần còn lại do systems/10b-alpha-epoch-live.js kiểm tra lại liên tục. */
  var x=null;
  if(navigator.onLine===false)return;
  for(var t=0;t<3;t++){
    try{
      x=new XMLHttpRequest();
      x.open('POST',URL_+'/rest/v1/rpc/alpha_epoch_get',false);
      x.timeout=4000;
      x.setRequestHeader('apikey',KEY);x.setRequestHeader('Content-Type','application/json');
      x.send('{}');
      if(x.status===200)break;
    }catch(e){x=null}
    x=null;
  }
  if(!x||x.status!==200)return;
  var srv=JSON.parse(x.responseText),se=srv&&(srv.epoch|0);
  if(!se)return;
  var mine=localStorage.getItem(EK);
  if(mine===null&&se<=1){localStorage.setItem(EK,String(se));return}   /* chưa reset lần nào */
  if(mine!==null&&(mine|0)===se)return;                                  /* cùng mùa */
  WIPE.forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
  for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf('kthm_sig_')===0)try{localStorage.removeItem(k)}catch(e){}}
  localStorage.setItem(EK,String(se));
  window.ALPHA_WIPED=true;
}catch(e){}
})();
