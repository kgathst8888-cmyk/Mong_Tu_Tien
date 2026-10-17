/* ALPHA EPOCH — chạy TRƯỚC systems/11-cloud-only.js.
 * Khi máy chủ được reset (epoch tăng), máy người chơi còn bản lưu/phiên đăng nhập cũ sẽ tự xoá dữ liệu game cục bộ
 * để KHÔNG đẩy dữ liệu cũ ngược lên mây. Không gọi được máy chủ → bỏ qua, game chạy như bình thường. */
(function(){
'use strict';
var URL_='https://fdaoswcyhbkzzuwlbrdp.supabase.co',KEY='sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw';
var EK='kthm_alpha_epoch';
var WIPE=['kthm2','kthm_qs','kthm_dg','kthm2_arena_v3','kthm_sig_kthm2','kthm_localbak','kthm_cloud'];
try{
  var x=new XMLHttpRequest();
  x.open('POST',URL_+'/rest/v1/rpc/alpha_epoch_get',false);
  x.timeout=4000;
  x.setRequestHeader('apikey',KEY);x.setRequestHeader('Content-Type','application/json');
  x.send('{}');
  if(x.status!==200)return;
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
