/* ===== 🕰 ĐỒNG HỒ TIN CẬY (core/00b-dong-ho-tin-cay.js, Fix379) — nạp NGAY SAU core/00-error-handler.js =====
 * Lỗi cũ: mọi giới hạn theo ngày/tuần/giờ (điểm danh, quà online, nhiệm vụ ngày/tuần, vòng quay miễn phí, Chiến Trường, Cửa Hàng Chiến Công,
 *         Bế Quan Đài: nhập định/Tâm Ma, quà sự kiện…) đều đọc giờ MÁY NGƯỜI CHƠI (Date.now / new Date). Chỉnh giờ máy TIẾN là
 *         làm mới giới hạn vô hạn lần, nhận quà vô hạn, nhập định xong tức thì.
 * Cách vá (không sửa từng module): thay Date toàn cục bằng bản "tin cậy": Date.now() và new Date() (không tham số) trả giờ MÁY CHỦ
 *         = giờ máy + độ lệch đã đo. Độ lệch đo từ tiêu đề `Date` của mọi phản hồi Supabase (miễn phí, không cần SQL); nếu trình duyệt không
 *         đọc được tiêu đề đó (CORS) thì gọi RPC kthm_now (xem dong_ho_may_chu.sql, tuỳ chọn). Lệch < 2 phút bỏ qua (tránh nhiễu).
 *         Chưa đo được lần nào (offline hoàn toàn) → giữ giờ máy như cũ. new Date(x), Date.UTC, Date.parse… giữ nguyên.
 * API: KTHM_CLOCK.off() độ lệch ms đang áp · .synced() đã đo được chưa · .raw() giờ máy thật · .sync() ép đo lại. */
(function(){
'use strict';
if(window.KTHM_CLOCK)return;
var RD=Date,RN=RD.now.bind(RD),TOL=120000,MAXOFF=3*86400000*365;   /* bỏ qua lệch < 2 phút; > 3 năm coi là rác */
var off=0,ok=false,rpcTry=0,rpcAt=0,rawF=window.fetch;
function adj(){return off}
function setOff(srv,t0){
  if(!isFinite(srv))return;
  var o=srv-t0;if(Math.abs(o)>MAXOFF)return;
  ok=true;off=Math.abs(o)<TOL?0:o}
var P=new Proxy(RD,{
  construct:function(t,a,nt){return a.length===0?new t(RN()+adj()):Reflect.construct(t,a,nt)},
  apply:function(t){return new t(RN()+adj()).toString()},
  get:function(t,k){if(k==='now')return function(){return RN()+adj()};return Reflect.get(t,k,t)}
});
try{window.Date=P}catch(e){}

/* 1) đo từ tiêu đề Date của phản hồi Supabase */
function fromHeader(r,t0){
  try{var h=r&&r.headers&&r.headers.get&&r.headers.get('date');if(!h)return false;
    var s=RD.parse(h);if(!isFinite(s))return false;
    setOff(s+(RN()-t0)/2,RN());return true}catch(e){return false}}
if(typeof rawF==='function'){
  window.fetch=function(u,o){
    var s=typeof u==='string'?u:(u&&u.url)||'',t0=RN(),p=rawF.apply(this,arguments);
    if(s.indexOf('.supabase.co')>=0){try{p.then(function(r){if(!fromHeader(r,t0)&&!ok)lazyRpc()},function(){})}catch(e){}}
    return p}}

/* 2) dự phòng: RPC kthm_now (trả mili-giây epoch). Thất bại im lặng (chưa chạy SQL → vẫn ổn nếu tiêu đề Date đọc được). */
function lazyRpc(){
  if(ok||rpcTry>=3||RN()-rpcAt<20000)return;
  try{var K=window.KCL;if(!K||!K.rpc||!K.sess||!K.sess())return}catch(e){return}
  rpcTry++;rpcAt=RN();var t0=RN();
  try{Promise.resolve(window.KCL.rpc('kthm_now',{})).then(function(r){
    var v=(r&&typeof r==='object'&&!Array.isArray(r))?(r.ms!=null?r.ms:r.now):r;v=+v;
    if(v>1e12)setOff(v+(RN()-t0)/2,RN())},function(){})}catch(e){}}
setInterval(function(){lazyRpc()},15000);
/* đo lại định kỳ (người chơi chỉnh giờ máy giữa chừng): ping nhẹ 1 lần/5 phút nếu có phiên */
setInterval(function(){try{var K=window.KCL;if(K&&K.rpc&&K.sess&&K.sess()){ok=false;rpcTry=0;lazyRpc()}}catch(e){}},300000);

window.KTHM_CLOCK={off:function(){return off},synced:function(){return ok},raw:RN,sync:function(){ok=false;rpcTry=0;rpcAt=0;lazyRpc()}};
})();
