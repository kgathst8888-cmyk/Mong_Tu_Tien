/* ===== 🛡️ CHỐNG NHÂN BẢN ĐỒ + MỘT TAB DUY NHẤT + TOÀN VẸN DỮ LIỆU (systems/61-chong-dube-bao-mat.js) =====
 * 1) MỘT TAB / TRÌNH DUYỆT: khoá bằng localStorage (kthm_tab_lock, nhịp 1,5s). Mở tab thứ hai → tab mới bị chặn bằng màn hình
 *    "đang mở ở tab khác" (nút "Dùng tab này" chiếm khoá rồi tải lại; tab kia tự bị chặn). Tab bị chặn: game đứng yên, KHÔNG được ghi dữ liệu
 *    (sv() và Storage.setItem cho kthm2/kthm_qs/kthm_dg bị chặn) ⇒ hết kiểu "2 tab cùng giữ đồ, tab này bán/đăng chợ, tab kia lưu đè bản cũ" gây dupe.
 * 2) MÃ ĐỊNH DANH ĐỒ: mọi trang bị có it.uid duy nhất (gen() gán khi tạo; đồ cũ được gán khi quét). Quét mỗi 3s trên túi + đang mặc của cả 3 nhân vật:
 *    trùng uid ⇒ thu hồi bản sao (giữ bản đang mặc / bản đầu tiên) và báo. Chợ (systems/32) kèm uid; máy chủ có sổ cái chống nhân bản (chong_dube.sql).
 * 3) TOÀN VẸN DỮ LIỆU CỤC BỘ: mỗi lần ghi kthm2 (mọi đường ghi) tự ký chữ ký băm (kthm_sig_kthm2). Mở game / mỗi 10s kiểm tra: chữ ký lệch
 *    (ai đó sửa localStorage ngoài game) ⇒ chặn chơi + ghi, buộc xoá dữ liệu cục bộ và tải lại từ đám mây (hoặc tải bản sao lưu trước khi xoá).
 * 4) Chốt chặn bất thường nhẹ: vàng/mảnh âm, NaN, vô hạn hoặc > 1e13 bị đưa về mốc hợp lệ gần nhất.
 * Thành thật về giới hạn: đây là lớp phòng thủ phía trình duyệt (cản sửa dữ liệu thông thường, không cản được người am hiểu tự sửa mã).
 * Lớp quyết định là máy chủ: sổ cái + kiểm tra đồ + giới hạn tần suất (chong_dube.sql) và phiên duy nhất (phien_dang_nhap.sql).
 * Phụ thuộc: sv/gen/step/BAGS/EQS/PS/cur/capN/DT/gold/frag (engine), KCL (tuỳ chọn, để tải lại từ đám mây). Chỉnh số: khối CF. */
(function(){
'use strict';
var CF={tab:{key:'kthm_tab_lock',ttl:6000,beat:1500},sweep:3000,verify:10000,keys:['kthm2'],salt:'kthm.mtt.v1',guard:['kthm2','kthm_qs','kthm_dg'],maxGold:1e13};
var ST=Storage.prototype,rawSet=ST.setItem,rawGet=ST.getItem,rawDel=ST.removeItem;
function rnd(n){try{var a=new Uint8Array(n);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(x){return('0'+x.toString(16)).slice(-2)}).join('').slice(0,n)}catch(e){var s='';while(s.length<n)s+=Math.floor(Math.random()*16).toString(16);return s}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k){try{return rawGet.call(localStorage,k)}catch(e){return null}}
function lset(k,v){try{rawSet.call(localStorage,k,v)}catch(e){}}

/* ---------- 3) chữ ký toàn vẹn (cyrb53 trộn muối) ---------- */
function h53(str,seed){var h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(var i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return(4294967296*(2097151&h2)+(h1>>>0)).toString(16)}
function sign(k,v){return h53(k+'|'+CF.salt+'|'+v,7)+h53(String(v.length)+CF.salt+k,11)}
var tamper=false,tabBlocked=false;
ST.setItem=function(k,v){
  if(this===localStorage&&(window.__TABLOCK)&&CF.guard.indexOf(k)>=0)return;                  /* tab bị chặn không được ghi dữ liệu game */
  if(this===localStorage&&window.__TAMPER&&CF.guard.indexOf(k)>=0&&!window.__ALLOWWRITE)return;
  var r=rawSet.apply(this,arguments);
  if(this===localStorage&&CF.keys.indexOf(k)>=0){try{rawSet.call(this,'kthm_sig_'+k,sign(k,String(v)))}catch(e){}}
  return r};
ST.removeItem=function(k){var r=rawDel.apply(this,arguments);if(this===localStorage&&CF.keys.indexOf(k)>=0){try{rawDel.call(this,'kthm_sig_'+k)}catch(e){}}return r};
function resign(k){if(CF.keys.indexOf(k)<0)return;var v=ls(k);if(v==null)try{rawDel.call(localStorage,'kthm_sig_'+k)}catch(e){}else lset('kthm_sig_'+k,sign(k,v))}   /* ký lại sau khi module khác ghi bằng hàm gốc (systems/12) */
function verifyKey(k){var v=ls(k);if(v==null)return'none';var s=ls('kthm_sig_'+k);if(s==null)return'unsigned';return sign(k,v)===s?'ok':'bad'}
function verifyAll(){var bad=false;CF.keys.forEach(function(k){var r=verifyKey(k);if(r==='unsigned')lset('kthm_sig_'+k,sign(k,ls(k)));else if(r==='bad')bad=true});return !bad}

/* ---------- giao diện chặn (tab / dữ liệu) ---------- */
var ov=null;
function overlay(html){
  if(!ov){var c=document.createElement('style');c.textContent='#kgb{position:fixed;inset:0;z-index:99995;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:rgba(6,4,3,.97);font-family:"KTH Serif","Songti SC",STKaiti,serif;color:#f2e3b3}'+
    '#kgb .bx{width:min(400px,100%);border:2px solid #b8964e;border-radius:16px;background:#150e09;padding:20px 18px;box-shadow:0 10px 40px #000;text-align:center}#kgb h2{margin:0 0 8px;color:#ffd76a;font-size:19px}#kgb p{font-size:13.5px;line-height:1.5;opacity:.9;margin:6px 0}'+
    '#kgb button{width:100%;padding:12px;margin-top:8px;border:0;border-radius:9px;background:#8a6420;color:#fff;font-weight:700;font-size:14.5px}#kgb button.g{background:#2a2118;border:1px solid #6a5434}';document.head.appendChild(c);
    ov=document.createElement('div');ov.id='kgb';['pointerdown','pointerup','touchstart','touchend','keydown','keyup','click'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()},false)});document.body.appendChild(ov)}
  ov.innerHTML='<div class="bx">'+html+'</div>';ov.style.display='flex'}
function ovHide(){if(ov)ov.style.display='none'}

/* ---------- 1) một tab duy nhất ---------- */
var tabId=rnd(12),beat=0;
function lockRead(){try{return JSON.parse(ls(CF.tab.key)||'null')}catch(e){return null}}
function lockWrite(){lset(CF.tab.key,JSON.stringify({id:tabId,t:Date.now()}))}
function blockTab(){
  if(tabBlocked)return;tabBlocked=true;window.__TABLOCK=1;
  overlay('<h2>🔒 Game đang mở ở tab khác</h2><p>Mỗi trình duyệt chỉ được chơi trên <b>một tab</b> để bảo vệ dữ liệu và tránh nhân bản đồ.</p><p>Hãy quay lại tab đang chơi, hoặc bấm nút dưới để chuyển việc chơi sang tab này (tab kia sẽ bị khoá).</p><button id="kgb-take">Dùng tab này</button>');
  var b=document.getElementById('kgb-take');if(b)b.onclick=function(){lockWrite();window.__TABLOCK=0;location.reload()}}
function tabCheck(){
  var l=lockRead(),n=Date.now();
  if(tabBlocked){if(!l||n-l.t>CF.tab.ttl){location.reload()}return}                   /* tab chủ đã đóng → tự nhận lại (tải dữ liệu mới) */
  if(l&&l.id!==tabId&&n-l.t<=CF.tab.ttl)blockTab();else lockWrite()}
(function bootTab(){var l=lockRead(),n=Date.now();if(l&&l.id!==tabId&&n-l.t<=CF.tab.ttl){window.__TABLOCK=1;tabBlocked=false;document.addEventListener('DOMContentLoaded',function(){tabBlocked=false;blockTab()});if(document.readyState!=='loading'){tabBlocked=false;blockTab()}}else lockWrite()})();
beat=setInterval(tabCheck,CF.tab.beat);
window.addEventListener('storage',function(e){if(e.key===CF.tab.key)tabCheck()});
document.addEventListener('visibilitychange',function(){if(!document.hidden)tabCheck()});
function release(){try{var l=lockRead();if(l&&l.id===tabId)lset(CF.tab.key,JSON.stringify({id:'',t:0}))}catch(e){}}
window.addEventListener('pagehide',release);window.addEventListener('beforeunload',release);

/* ---------- dữ liệu bị sửa ---------- */
function onTamper(){
  if(tamper)return;tamper=true;window.__TAMPER=1;
  overlay('<h2>⚠️ Dữ liệu cục bộ bị chỉnh sửa</h2><p>Phát hiện dữ liệu lưu trên máy này đã bị thay đổi ngoài game. Để bảo vệ tài khoản, dữ liệu cục bộ phải được xoá và tải lại từ đám mây.</p><button id="kgb-dl" class="g">Tải bản sao lưu (JSON) trước khi xoá</button><button id="kgb-rs">Xoá dữ liệu cục bộ và tải lại từ đám mây</button>');
  var d=document.getElementById('kgb-dl'),r=document.getElementById('kgb-rs');
  if(d)d.onclick=function(){try{var b=new Blob([ls('kthm2')||''],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kthm2_sao_luu.json';a.click()}catch(e){}};
  if(r)r.onclick=function(){window.__ALLOWWRITE=1;['kthm2','kthm_qs','kthm_dg'].forEach(function(k){try{rawDel.call(localStorage,k)}catch(e){}});['kthm_sig_kthm2','kthm_cloud_rev'].forEach(function(k){try{rawDel.call(localStorage,k)}catch(e){}});location.reload()}}
if(!verifyAll())onTamper();
setInterval(function(){if(!tamper&&!tabBlocked&&!verifyAll())onTamper()},CF.verify);

/* ---------- 2) mã định danh đồ + quét trùng ---------- */
function newUid(){return rnd(20)}
function uidOf(it){if(it&&typeof it==='object'&&!it.uid)it.uid=newUid();return it&&it.uid}
function allItems(){var out=[];try{for(var i=0;i<3;i++){[EQS&&EQS[i],BAGS&&BAGS[i]].forEach(function(A,ai){if(A)for(var j=0;j<A.length;j++){var it=A[j];if(it&&typeof it==='object')out.push({it:it,A:A,j:j,eq:ai===0})}})}}catch(e){}return out}
function has(item){var u=item&&item.uid;if(!u)return false;return allItems().some(function(x){return x.it.uid===u})}
function scan(){
  var seen=Object.create(null),dupes=0,list=allItems();
  list.forEach(function(x){uidOf(x.it)});
  list.forEach(function(x){var u=x.it.uid;if(seen[u]){dupes++;x.dead=true}else seen[u]=1});
  if(dupes){
    list.forEach(function(x){if(x.dead){if(x.eq)x.A[x.j]=null;else x.A[x.j]=undefined}});
    try{BAGS.forEach(function(B){for(var k=B.length-1;k>=0;k--)if(B[k]===undefined)B.splice(k,1)})}catch(e){}
    try{var s=PS[cur];if(s){s.sec=s.sec||{};s.sec.dup=(s.sec.dup|0)+dupes;s.sec.last=Date.now()}}catch(e){}
    try{console.warn('[KTHM] Thu hồi '+dupes+' vật phẩm trùng mã (nhân bản)')}catch(e){}
    try{DT.push({x:P.x,y:200,s:'⚠ Phát hiện '+dupes+' vật phẩm nhân bản — đã thu hồi bản sao',c:'#ff8a7a',g:1,l:200})}catch(e){}
    try{sv()}catch(e){}try{ui()}catch(e){}}
  return dupes}
if(typeof gen==='function'){var _gen=gen;gen=function(){var it=_gen.apply(this,arguments);if(it&&typeof it==='object'&&!it.uid)it.uid=newUid();return it}}
setInterval(function(){try{if(typeof started!=='undefined'&&started&&!window.__TABLOCK&&!tamper)scan()}catch(e){}},CF.sweep);

/* ---------- 4) chốt chặn bất thường nhẹ ---------- */
var lastGold=0,lastFrag=0;
setInterval(function(){try{
  if(typeof started==='undefined'||!started)return;
  if(typeof gold==='number'){if(!isFinite(gold)||gold<0||gold>CF.maxGold){gold=lastGold;try{DT.push({x:P.x,y:180,s:'⚠ Vàng bất thường — đã khôi phục',c:'#ff8a7a',l:120})}catch(e){}}else lastGold=gold}
  if(typeof frag==='number'){if(!isFinite(frag)||frag<0||frag>CF.maxGold){frag=lastFrag}else lastFrag=frag}
}catch(e){}},2000);

/* ---------- đóng băng khi bị chặn / chặn ghi ---------- */
if(typeof step==='function'){var _step=step;step=function(){if(window.__TABLOCK||window.__TAMPER)return;return _step.apply(this,arguments)}}
if(typeof sv==='function'){var _sv=sv;sv=function(){if(window.__TABLOCK||window.__TAMPER)return;return _sv.apply(this,arguments)}}

window.ANTIDUPE={resign:resign,uid:uidOf,has:has,scan:scan,items:allItems,verify:verifyAll,tabId:function(){return tabId},cfg:CF,_raw:{set:function(k,v){rawSet.call(localStorage,k,v)}}};
})();
