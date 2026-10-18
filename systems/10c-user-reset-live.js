/* USER RESET LIVE (Fix303) — nạp NGAY SAU systems/12-cloud-save.js (cần KCL).
 * Khi admin bấm ♻ Reset tài khoản (admin_reset_account), máy chủ xoá bản lưu + đá phiên + tăng "mùa reset riêng" của tài khoản.
 * Máy người chơi có thể còn dữ liệu cũ trong RAM/localStorage → nếu để yên, lần đồng bộ kế tiếp sẽ ĐẨY LẠI bản cũ lên mây.
 * Module này (không sửa systems/12, 11, 10b):
 *   - Hỏi user_reset_get() khi nạp, mỗi 30 giây, khi tab hiện lại / focus / có mạng lại.
 *   - Mùa trên máy chủ > mùa đã ghi trên máy → khoá ghi dữ liệu, xoá RAM + localStorage game, ghi mùa mới, tải lại trang.
 *   - Cổng chặn push_save: nếu lần kiểm tra gần nhất > 6 giây thì kiểm tra trước khi đẩy; mùa đã đổi → huỷ lần đẩy.
 *     Lúc đóng tab (keepalive) không chặn. Không gọi được máy chủ → cho đẩy như cũ.
 * Tài khoản chưa từng bị reset: mùa = 0, lần đầu chỉ ghi nhận, không xoá gì. */
(function(){
'use strict';
var WIPE=['kthm2','kthm_qs','kthm_dg','kthm2_arena_v3','kthm_sig_kthm2','kthm_localbak','kthm_cloud'];
var URL_='https://fdaoswcyhbkzzuwlbrdp.supabase.co',KEY='sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw';
var nf=window.fetch,resetting=false,chk=null,lastOK=0,ticks=0,lastUid='';
if(typeof nf!=='function'||!window.KCL||!KCL.OK)return;
var ST=Storage.prototype,_si=ST.setItem;

function isW(k){k=String(k);return WIPE.indexOf(k)>=0||k.indexOf('kthm_sig_')===0}
ST.setItem=function(k,v){if(resetting&&this===localStorage&&isW(k))return;return _si.apply(this,arguments)};

function ek(uid){return 'kthm_user_reset_'+uid}
function banner(){
  try{
    if(document.getElementById('user-reset-live')||!document.body)return;
    var d=document.createElement('div');d.id='user-reset-live';
    d.style.cssText='position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:99999;max-width:92vw;padding:8px 14px;border-radius:12px;border:2px solid #b8964e;background:#140d0a;color:#f2e3b3;font:600 13px/1.35 system-ui,sans-serif;text-align:center';
    d.textContent='♻ Tài khoản vừa được admin reset — đang tải lại…';
    document.body.appendChild(d);
  }catch(e){}
}
function wipeNow(uid,n){
  if(resetting)return;resetting=true;window.USER_RESET_WIPED=true;
  try{window.sv=function(){}}catch(e){}
  try{if(window.CLOUDONLY){CLOUDONLY.legacy=true;CLOUDONLY.purgeLegacy()}}catch(e){}
  WIPE.forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
  try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&isW(k)){try{delete localStorage[k]}catch(e){}}}}catch(e){}
  try{_si.call(localStorage,ek(uid),String(n))}catch(e){}
  try{sessionStorage.removeItem('kthm_resume')}catch(e){}
  banner();
  setTimeout(function(){try{location.reload()}catch(e){}},700);
}

function getN(){
  var s=null;try{s=KCL.sess()}catch(e){}
  if(!s||!s.access_token||!s.user||!s.user.id)return Promise.resolve(null);
  var uid=s.user.id,h={apikey:KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'};
  try{var sid=KCL.sid();if(sid)h['x-session-id']=sid}catch(e){}
  var ctl=typeof AbortController!=='undefined'?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},6000);
  return nf.call(window,URL_+'/rest/v1/rpc/user_reset_get',{method:'POST',headers:h,body:'{}',cache:'no-store',signal:ctl?ctl.signal:undefined})
    .then(function(r){clearTimeout(to);return r.ok?r.json():null},function(){clearTimeout(to);return null})
    .then(function(j){return j&&typeof j.n==='number'?{uid:uid,n:j.n|0}:null});
}

function check(){
  if(resetting)return Promise.resolve();
  if(chk)return chk;
  chk=getN().then(function(r){
    chk=null;
    if(!r)return;                                   /* chưa đăng nhập / chưa chạy SQL / lỗi mạng → bỏ qua */
    lastOK=Date.now();lastUid=r.uid;
    var mine=null;try{mine=localStorage.getItem(ek(r.uid))}catch(e){}
    if(mine===null){try{_si.call(localStorage,ek(r.uid),String(r.n))}catch(e){}return}   /* lần đầu thấy: ghi nhận, không xoá */
    if((mine|0)>=r.n)return;
    wipeNow(r.uid,r.n);
  },function(){chk=null});
  return chk;
}

/* cổng chặn push_save */
window.fetch=function(u,o){
  var s=typeof u==='string'?u:(u&&u.url)||'';
  if(s.indexOf('/rest/v1/rpc/push_save')<0)return nf.apply(this,arguments);
  if(resetting)return Promise.reject(new TypeError('user reset'));
  if((o&&o.keepalive)||Date.now()-lastOK<6000)return nf.apply(this,arguments);
  var self=this,a=arguments;
  return check().then(function(){return resetting?Promise.reject(new TypeError('user reset')):nf.apply(self,a)});
};

function every30(){if(++ticks>=30){ticks=0;check()}}
try{if(window.KTHM_TICK&&KTHM_TICK.ok)KTHM_TICK.slow(every30);else setInterval(function(){check()},30000)}catch(e){setInterval(function(){check()},30000)}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check()});
window.addEventListener('focus',function(){check()});
window.addEventListener('online',function(){check()});
setTimeout(check,1500);
window.USER_RESET_LIVE={check:check};
})();
