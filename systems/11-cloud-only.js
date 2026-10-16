/* ===== ☁ CHỈ LƯU TRÊN ĐÁM MÂY + ĐỒNG HỒ NỀN (systems/11-cloud-only.js) =====
 * PHẢI nạp ĐẦU TIÊN (ngay sau core/00-error-handler.js), trước mọi script khác.
 *
 * 1) CHỈ LƯU ĐÁM MÂY: các khoá dữ liệu game (kthm2, kthm_qs, kthm_dg, kthm2_arena_v3 + chữ ký kthm_sig_*) KHÔNG còn ghi xuống
 *    localStorage của trình duyệt. Mọi lời gọi localStorage.getItem/setItem/removeItem cho các khoá này được chuyển vào bộ nhớ RAM (MEM),
 *    nên toàn bộ code cũ (sv/ld/qsSave/dgSave/arena…) chạy NGUYÊN, không phải sửa. Dữ liệu chỉ nằm trên Supabase (systems/12-cloud-save.js đẩy lên).
 *    Chỉ còn trên máy: phiên đăng nhập (kthm_cloud), khoá tab, cờ giao diện (hướng dẫn, thông báo đã đọc, mức hiệu năng).
 * 2) NẠP TỪ MÂY LÚC MỞ GAME: nếu máy đã có phiên đăng nhập, gọi ĐỒNG BỘ (XHR sync, ~0,3-1s) RPC pull_save để đổ dữ liệu vào MEM
 *    trước khi các script game đọc (core/01o đọc kthm_qs, core/01t đọc kthm_dg ngay lúc nạp). Chưa đăng nhập → cổng đăng nhập (systems/60)
 *    hiện ra, đăng nhập xong trang tự tải lại và đi vào nhánh này. window.__BOOT_CLOUD = {rev,uid,none?} khi nạp thành công.
 * 3) BẢN LƯU CŨ TRÊN MÁY (người chơi cũ): nếu localStorage còn 'kthm2' → coi là "legacy": đưa vào MEM để systems/12 đối chiếu/đẩy lên mây như cũ,
 *    CHỈ xoá bản cũ khỏi máy sau khi đã đồng bộ xong (CLOUDONLY.purgeLegacy()) → không mất dữ liệu.
 * 4) ĐỒNG HỒ NỀN (window.KTHM_TICK): Web Worker bắn nhịp 16ms (fast) và 1s (slow). Timer của Worker KHÔNG bị trình duyệt hạ tốc khi
 *    thu nhỏ/ẩn tab, nên game vẫn chạy và đồng bộ mây vẫn đều. Dùng bởi core/01v-perf-boot.js (step khi tab ẩn) và systems/12 (đẩy mây).
 *    Không tạo được Worker (một số trình duyệt/chế độ file://) → ok=false, tự rơi về setInterval thường (bị hạ tốc ~1 lần/giây khi ẩn).
 * Hook: CLOUDONLY.onWrite(key) được gọi khi một khoá dữ liệu đổi giá trị (systems/12 dùng để lên lịch đẩy mây nhanh).
 */
(function(){
'use strict';
var CFG={url:'https://fdaoswcyhbkzzuwlbrdp.supabase.co',key:'sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw'}; /* trùng với systems/12 (khoá publishable, công khai) */
var GK=['kthm2','kthm_qs','kthm_dg','kthm2_arena_v3'],SIG='kthm_sig_',OLD=['kthm_localbak'];
var MAPK=[['kthm2','k2'],['kthm_qs','qs'],['kthm_dg','dg'],['kthm2_arena_v3','ar']];
var ST=Storage.prototype,rg=ST.getItem,rs=ST.setItem,rr=ST.removeItem;
var MEM=Object.create(null);
var C=window.CLOUDONLY={legacy:false,onWrite:null,hydrated:false,keys:GK.slice(),map:MAPK.slice()};
function isG(k){k=String(k);return GK.indexOf(k)>=0||k.indexOf(SIG)===0}
function isD(k){return GK.indexOf(String(k))>=0}

/* ---------- 1) chuyển hướng localStorage → RAM cho các khoá dữ liệu game ---------- */
ST.getItem=function(k){if(this===localStorage&&isG(k)){k=String(k);return k in MEM?MEM[k]:null}return rg.apply(this,arguments)};
ST.setItem=function(k,v){
  if(this===localStorage&&isG(k)){k=String(k);v=String(v);var ch=MEM[k]!==v;MEM[k]=v;if(ch&&isD(k)&&typeof C.onWrite==='function'){try{C.onWrite(k)}catch(e){}}return}
  return rs.apply(this,arguments)};
ST.removeItem=function(k){if(this===localStorage&&isG(k)){delete MEM[String(k)];return}return rr.apply(this,arguments)};

/* ---------- 3) bản lưu cũ trên máy (legacy) ---------- */
function rawDelAll(){try{GK.forEach(function(k){try{rr.call(localStorage,k)}catch(e){}});rr.call(localStorage,SIG+'kthm2');OLD.forEach(function(k){try{rr.call(localStorage,k)}catch(e){}})}catch(e){}}
C.purgeLegacy=function(){if(!C.legacy&&!C._stray)return;rawDelAll();C.legacy=false;C._stray=false};
try{
  var hasOld=rg.call(localStorage,'kthm2')!=null;
  if(hasOld){C.legacy=true;GK.forEach(function(k){var v=rg.call(localStorage,k);if(v!=null)MEM[k]=v})}
  else rawDelAll();   /* không có bản chính → dọn mọi mảnh dữ liệu game còn sót trên máy */
}catch(e){}

/* ---------- 2) nạp tiến trình từ mây (đồng bộ, trước khi game nạp) ---------- */
function xhr(path,body,auth,sid){var x=new XMLHttpRequest();x.open('POST',CFG.url+path,false);x.setRequestHeader('apikey',CFG.key);x.setRequestHeader('Content-Type','application/json');if(auth)x.setRequestHeader('Authorization','Bearer '+auth);if(sid)x.setRequestHeader('x-session-id',sid);x.send(JSON.stringify(body));return x}
function hydrate(){
  if(C.legacy)return;                                   /* người chơi cũ: để systems/12 đối chiếu bản máy ↔ mây */
  var raw=rg.call(localStorage,'kthm_cloud');if(!raw)return;
  var d;try{d=JSON.parse(raw)}catch(e){return}
  var sess=d&&d.sess;if(!sess||!sess.access_token||!sess.user)return;
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return;
  try{
    if(sess.expires_at*1000-Date.now()<60000){
      var xr=xhr('/auth/v1/token?grant_type=refresh_token',{refresh_token:sess.refresh_token});
      if(xr.status!==200)return;
      var j0=JSON.parse(xr.responseText),u0=j0.user||{};
      sess={access_token:j0.access_token,refresh_token:j0.refresh_token,expires_at:j0.expires_at||(Date.now()/1000+(j0.expires_in||3600)),user:{id:u0.id||sess.user.id,email:u0.email||sess.user.email}};
      d.sess=sess;rs.call(localStorage,'kthm_cloud',JSON.stringify(d))}
    var r=xhr('/rest/v1/rpc/pull_save',{p_meta_only:false},sess.access_token,d.sid);
    if(r.status!==200)return;
    var j=JSON.parse(r.responseText);if(!j)return;
    if(j.exists&&j.data){MAPK.forEach(function(m){var v=j.data[m[1]];if(v!=null)MEM[m[0]]=JSON.stringify(v)});window.__BOOT_CLOUD={rev:j.rev|0,uid:sess.user.id,at:j.updated_at}}
    else if(j.exists===false)window.__BOOT_CLOUD={rev:0,none:1,uid:sess.user.id};
    C.hydrated=!!window.__BOOT_CLOUD;
  }catch(e){}
}
hydrate();

/* ---------- 4) đồng hồ nền bằng Web Worker ---------- */
(function(){
  var fast=[],slow=[],w=null;
  function run(l){for(var i=0;i<l.length;i++){try{l[i]()}catch(e){}}}
  try{
    var src='setInterval(function(){postMessage(1)},16);setInterval(function(){postMessage(2)},1000);';
    var url=URL.createObjectURL(new Blob([src],{type:'application/javascript'}));
    w=new Worker(url);
    w.onmessage=function(e){run(e.data===1?fast:slow)};
    w.onerror=function(){try{w.terminate()}catch(x){}w=null;window.KTHM_TICK.ok=false};
  }catch(e){w=null}
  window.KTHM_TICK={ok:!!w,fast:function(f){fast.push(f)},slow:function(f){slow.push(f)}};
  try{if(navigator.locks&&navigator.locks.request)navigator.locks.request('kthm-alive',function(){return new Promise(function(){})})}catch(e){}  /* giữ trang "đang bận": hạn chế bị trình duyệt đóng băng khi ẩn */
})();
})();
