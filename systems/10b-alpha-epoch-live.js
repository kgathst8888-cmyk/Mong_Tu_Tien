/* ALPHA EPOCH LIVE (FIX272b) — nạp NGAY SAU systems/11-cloud-only.js.
 * Lỗi cũ: systems/10-alpha-epoch.js chỉ kiểm tra "mùa" (epoch) MỘT LẦN lúc mở trang, và lỗi mạng thì bỏ qua. Hậu quả khi reset máy chủ:
 *   (1) tab game đang mở / tab chạy nền từ trước lúc reset vẫn giữ dữ liệu cũ trong RAM, đồng hồ nền (Web Worker) vẫn đẩy lên mây
 *       → mây đã xoá nhưng bị ghi lại → tài khoản đó "không reset";
 *   (2) lúc mở trang bị lỗi mạng/timeout → không xoá bản cũ → reconcile() đẩy bản cũ lên mây.
 * Cách vá (không sửa systems/12, 11):
 *   - Kiểm tra epoch lại ngay khi nạp, mỗi 30 giây (kể cả tab ẩn), khi tab hiện lại / focus / có mạng lại.
 *   - Epoch đổi → khoá ghi dữ liệu game, xoá RAM + máy, xoá phiên đăng nhập cũ, ghi mùa mới, tải lại trang.
 *   - Cổng chặn push_save: nếu lần kiểm tra gần nhất > 20s thì kiểm tra epoch trước khi đẩy; mùa đã đổi → huỷ lần đẩy (không ghi lên mây).
 *     Lúc đóng tab (keepalive) không chặn để không mất dữ liệu người chơi bình thường. Không gọi được máy chủ → cho đẩy như cũ. */
(function(){
'use strict';
var URL_='https://fdaoswcyhbkzzuwlbrdp.supabase.co',KEY='sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw';
var EK='kthm_alpha_epoch';
var WIPE=['kthm2','kthm_qs','kthm_dg','kthm2_arena_v3','kthm_sig_kthm2','kthm_localbak','kthm_cloud'];
var nf=window.fetch,lastOK=0,resetting=false,chk=null,ticks=0;
if(typeof nf!=='function')return;

function isW(k){k=String(k);return WIPE.indexOf(k)>=0||k.indexOf('kthm_sig_')===0}

/* khi đang reset: không cho ghi lại các khoá dữ liệu/phiên */
var ST=Storage.prototype,_si=ST.setItem;
ST.setItem=function(k,v){if(resetting&&this===localStorage&&isW(k))return;return _si.apply(this,arguments)};

function banner(){
  try{
    if(document.getElementById('alpha-reset-live')||!document.body)return;
    var d=document.createElement('div');d.id='alpha-reset-live';
    d.style.cssText='position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:99999;max-width:92vw;padding:8px 14px;border-radius:12px;border:2px solid #b8964e;background:#140d0a;color:#f2e3b3;font:600 13px/1.35 system-ui,sans-serif;text-align:center';
    d.textContent='🔄 Máy chủ vừa reset ALPHA TEST — đang tải lại…';
    document.body.appendChild(d);
  }catch(e){}
}

function wipeNow(se){
  if(resetting)return;resetting=true;window.ALPHA_WIPED=true;
  try{window.sv=function(){}}catch(e){}                                   /* game không tự lưu lại nữa */
  try{if(window.CLOUDONLY){CLOUDONLY.legacy=true;CLOUDONLY.purgeLegacy()}}catch(e){}  /* xoá luôn bản cũ thật trên máy (nếu có) */
  WIPE.forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
  try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&isW(k)){try{delete localStorage[k]}catch(e){}}}}catch(e){}
  try{_si.call(localStorage,EK,String(se))}catch(e){}
  try{sessionStorage.removeItem('kthm_resume')}catch(e){}
  banner();
  setTimeout(function(){try{location.reload()}catch(e){}},700);
}

function getEpoch(){
  var ctl=typeof AbortController!=='undefined'?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},6000);
  return nf.call(window,URL_+'/rest/v1/rpc/alpha_epoch_get',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:ctl?ctl.signal:undefined})
    .then(function(r){clearTimeout(to);return r.ok?r.json():null},function(){clearTimeout(to);return null})
    .then(function(j){var se=j&&(j.epoch|0);return se>0?se:0});
}

function check(){
  if(resetting)return Promise.resolve();
  if(chk)return chk;
  chk=getEpoch().then(function(se){
    chk=null;
    if(!se)return;                                   /* không gọi được máy chủ → bỏ qua */
    lastOK=Date.now();
    var mine=null;try{mine=localStorage.getItem(EK)}catch(e){}
    if(mine===null&&se<=1){try{_si.call(localStorage,EK,String(se))}catch(e){}return}
    if(mine!==null&&(mine|0)===se)return;
    wipeNow(se);
  },function(){chk=null});
  return chk;
}

/* cổng chặn push_save */
window.fetch=function(u,o){
  var s=typeof u==='string'?u:(u&&u.url)||'';
  if(s.indexOf('/rest/v1/rpc/push_save')<0)return nf.apply(this,arguments);
  if(resetting)return Promise.reject(new TypeError('alpha reset'));
  if((o&&o.keepalive)||Date.now()-lastOK<20000)return nf.apply(this,arguments);
  var self=this,a=arguments;
  return check().then(function(){return resetting?Promise.reject(new TypeError('alpha reset')):nf.apply(self,a)});
};

/* kiểm tra định kỳ + khi quay lại tab */
function every30(){if(++ticks>=30){ticks=0;check()}}
try{if(window.KTHM_TICK&&KTHM_TICK.ok)KTHM_TICK.slow(every30);else setInterval(function(){check()},30000)}catch(e){setInterval(function(){check()},30000)}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check()});
window.addEventListener('focus',function(){check()});
window.addEventListener('online',function(){check()});
check();
window.ALPHA_EPOCH_LIVE={check:check};
})();
