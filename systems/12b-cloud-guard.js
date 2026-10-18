/* ☁ CLOUD GUARD (Fix293) — nạp NGAY SAU systems/12-cloud-save.js. Không sửa logic game.
 * Vá lỗi "mất dữ liệu liên tục" do đẩy mây dày (mỗi ~1,5s) gây xung đột phiên bản giả:
 *  (1) XẾP HÀNG push_save: chỉ 1 lượt đẩy chạy một lúc (fastPush / flush lúc ẩn tab / saveNow không còn đè nhau cùng 1 rev).
 *  (2) TỰ NỐI REV: lượt sau dùng rev do lượt trước vừa trả về (không dùng rev cũ → không tự "xung đột" với chính mình).
 *  (3) TỰ CHỮA "mất phản hồi": mạng yếu làm lượt đẩy đã lưu trên mây nhưng máy không nhận được → lần sau báo xung đột.
 *      Nay: nếu bản trên mây có chữ ký (h) trùng bản mình đã gửi trong phiên này → coi là của mình, đẩy tiếp, KHÔNG hiện hộp "Chọn bản lưu".
 *  (4) CHẶN GHI ĐÈ BẢN RỖNG: nếu bản sắp đẩy trông như nhân vật mới tinh (lv1, chưa chuyển chức, chưa tu luyện) trong khi bản mây
 *      đang có nhân vật mạnh hơn nhiều → không đẩy, hỏi: tải lại từ mây (khuyên dùng) hoặc vẫn ghi đè.
 *  (5) ĐẨY THEO MỨC QUAN TRỌNG: việc thường (đánh quái, di chuyển) do systems/12 gộp 12s/lần. Việc quan trọng — lên cấp, chuyển chức, đột phá cảnh giới,
 *      đổi trang bị, nhặt đồ Sử Thi trở lên — đẩy NGAY (cách nhau tối thiểu 3s). Sao lưu/lịch sử do máy chủ lo (push_save: 10 phút + 1 giờ).
 *  Lúc đóng tab (keepalive) không xếp hàng, không chặn. */
(function(){
'use strict';
var nf=window.fetch;if(typeof nf!=='function')return;
var URLP='/rest/v1/rpc/';
var sent=[],curRev=null,baseline=null,blocked=false,chain=Promise.resolve();

function parse(o){try{return o&&typeof o.body==='string'?JSON.parse(o.body):null}catch(e){return null}}
function best(k2){var b=null;((k2&&k2.PS)||[]).forEach(function(p,i){if(!p)return;var cv=p.cv||{},cr=typeof cv.r=='number'?cv.r:-1,cs=cv.s|0,lv=(p.lv|0)||1,t=p.tier|0,pw=t*1e6+lv*1e3+((cr+1)*10+cs);if(!b||pw>b.pw)b={lv:lv,tier:t,cr:cr,pw:pw}});return b}
function fresh(b){return !b||(b.lv<=1&&b.tier===0&&b.cr<0)}
function strong(b){return !!b&&(b.lv>=10||b.tier>0||b.cr>=0)}
function remember(h){sent.push(h);if(sent.length>40)sent.shift()}

/* baseline = nhân vật mạnh nhất của bản vừa nạp từ mây lúc mở trang (systems/11 đã đổ vào RAM) */
try{if(window.__BOOT_CLOUD&&!window.__BOOT_CLOUD.none){var raw=localStorage.getItem('kthm2');if(raw)baseline=best(JSON.parse(raw));curRev=window.__BOOT_CLOUD.rev|0}}catch(e){}

function doOne(u,o,body){
  /* tự nối rev */
  if(!body.p_force&&curRev!==null&&(body.p_base_rev|0)<curRev&&curRev>0)body.p_base_rev=curRev;
  /* (4) chặn ghi đè bản rỗng */
  var nb=best(body.p_data&&body.p_data.k2);
  if(!body.p_force&&!body.p_backup&&fresh(nb)&&strong(baseline)){
    if(blocked)return Promise.resolve(new Response(JSON.stringify({message:'GUARD_BLOCK'}),{status:409,headers:{'Content-Type':'application/json'}}));
    blocked=true;
    var go=false;try{go=confirm('⚠ Bản lưu trên máy trông như nhân vật mới tinh, trong khi bản trên mây đang có nhân vật mạnh hơn nhiều (có thể do lỗi tải dữ liệu).\n\nOK = TẢI LẠI TỪ MÂY (khuyên dùng, giữ nguyên tiến trình cũ)\nHuỷ = vẫn ghi đè bản mây bằng bản hiện tại')}catch(e){go=true}
    if(go){try{window.addEventListener('beforeunload',function(e){e.stopImmediatePropagation()},true)}catch(e){}setTimeout(function(){location.reload()},50);return new Promise(function(){})}
    blocked=false;baseline=nb}
  var h=body.p_data&&body.p_data.h;if(h)remember(h);
  var o2=Object.assign({},o,{body:JSON.stringify(body)});
  return nf.call(window,u,o2).then(function(r){
    return r.clone().json().then(function(j){
      if(j&&j.status==='ok'){curRev=j.rev|0;if(nb&&!fresh(nb))baseline=nb;return r}
      if(body.p_force)return r;
      /* (3) không ok → kiểm tra có phải bản của chính mình bị mất phản hồi */
      return nf.call(window,u.replace('push_save','pull_save'),Object.assign({},o,{body:JSON.stringify({p_meta_only:true})})).then(function(m){return m.json()}).then(function(cl){
        if(cl&&cl.exists&&cl.h&&sent.indexOf(cl.h)>=0&&(cl.rev|0)>(body.p_base_rev|0)){
          curRev=cl.rev|0;body.p_base_rev=curRev;
          return nf.call(window,u,Object.assign({},o,{body:JSON.stringify(body)})).then(function(r2){return r2.clone().json().then(function(j2){if(j2&&j2.status==='ok'){curRev=j2.rev|0;if(nb&&!fresh(nb))baseline=nb}return r2},function(){return r2})})}
        return r},function(){return r})
    },function(){return r})
  })}

window.fetch=function(u,o){
  var s=typeof u==='string'?u:(u&&u.url)||'';
  if(s.indexOf(URLP+'push_save')<0)return nf.apply(this,arguments);
  var body=parse(o);if(!body||!body.p_data)return nf.apply(this,arguments);
  if(o.keepalive){                               /* đóng tab / ẩn tab: gửi ngay, chỉ nối rev */
    if(!body.p_force&&curRev!==null&&(body.p_base_rev|0)<curRev&&curRev>0)body.p_base_rev=curRev;
    if(body.p_data.h)remember(body.p_data.h);
    return nf.call(window,u,Object.assign({},o,{body:JSON.stringify(body)})).then(function(r){try{r.clone().json().then(function(j){if(j&&j.status==='ok')curRev=j.rev|0})}catch(e){}return r})}
  var p=chain.then(function(){return doOne(u,o,body)});
  chain=p.then(function(){},function(){});
  return p};
/* (5) đẩy ngay khi có việc quan trọng */
function h32(t){var h=5381;for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return h>>>0}
function sigOf(raw){try{var d=JSON.parse(raw),a=[],rare=0;
  (d.PS||[]).forEach(function(p){if(!p)return;var c=p.cv||{};a.push((p.lv|0)+':'+(p.tier|0)+':'+(p.br|0)+':'+(typeof c.r=='number'?c.r:-1)+':'+(c.s|0))});
  (d.BAGS||[]).forEach(function(b){(b||[]).forEach(function(it){if(it&&(it.r|0)>=3)rare++})});
  return a.join('|')+'#'+rare+'#'+h32(JSON.stringify(d.EQS||''))}catch(e){return null}}
var lastSig=null,lastImp=0;
function watch(){try{var C=window.KTHM_CLOUD;if(!C||typeof started=='undefined'||!started)return;
  var raw=localStorage.getItem('kthm2');if(!raw)return;var sg=sigOf(raw);if(sg===null)return;
  if(lastSig!==null&&sg!==lastSig&&Date.now()-lastImp>=3000){var st=C.status();if(st!=='conf'&&st!=='out'&&st!=='off'){lastImp=Date.now();C.saveNow()}}
  lastSig=sg}catch(e){}}
try{if(window.KTHM_TICK&&KTHM_TICK.ok)KTHM_TICK.slow(watch);else setInterval(watch,1000)}catch(e){setInterval(watch,1000)}
window.CLOUD_GUARD={rev:function(){return curRev},baseline:function(){return baseline},sent:function(){return sent.length}};
})();
