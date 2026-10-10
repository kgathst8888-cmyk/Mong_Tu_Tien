/* ===== 🧩 SẮP XẾP CÁC Ô KỸ NĂNG BÊN PHẢI MÀN HÌNH (world/52-skill-layout.js) =====
 * Lỗi: 3 module cùng đặt nút kỹ năng ở cùng một chỗ (right≈60-62px, top≈124px) nên khi hiện cùng lúc chúng CHỒNG LÊN NHAU:
 *   - #lc-btn  (systems/18-linh-can.js)       kỹ năng Linh Căn
 *   - #fb-bar  (world/48-phap-bao-bon-menh.js) kỹ năng Pháp Bảo Bổn Mệnh (+ nút 🔮)
 *   - #yt-bar  (world/49-y-canh-than-thong.js) 3 thần thông Ý Cảnh
 * Cách sửa (không đụng logic 3 module trên): gom 3 phần tử vào MỘT khung #sk-side (flex ngang, cột nào ẩn thì không chiếm chỗ),
 * xếp từ phải sang trái: Linh Căn → Pháp Bảo → Ý Cảnh, ngay bên trái cột Thần Thông (#zk / #tt-bar, right:8px).
 * Nút giữ nguyên id, sự kiện, trạng thái hiện/ẩn của từng module; chỉ đổi cách định vị (position:static trong khung).
 * Khung không chặn chạm (pointer-events:none), chỉ các nút bên trong nhận chạm. */
(function(){
'use strict';
var IDS=['lc-btn','fb-bar','yt-bar'];   /* thứ tự từ PHẢI sang TRÁI */
var wrap=null;
function css(){
 var c=document.createElement('style');
 c.textContent='#sk-side{position:fixed;right:62px;top:calc(124px + env(safe-area-inset-top,0px));display:flex;flex-direction:row-reverse;align-items:flex-start;gap:6px;z-index:2;pointer-events:none}'
 +'@media (min-width:641px){#sk-side{top:calc(128px + env(safe-area-inset-top,0px))}}'
 +'#sk-side>*{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;margin:0!important;flex:none;pointer-events:auto}';
 (document.head||document.documentElement).appendChild(c)}
function ensure(){
 if(wrap)return wrap;
 if(!document.body)return null;
 css();wrap=document.createElement('div');wrap.id='sk-side';document.body.appendChild(wrap);return wrap}
function adopt(){
 var w=ensure();if(!w)return;
 var els=[],i,el;
 for(i=0;i<IDS.length;i++){el=document.getElementById(IDS[i]);if(el)els.push(el)}
 if(!els.length)return;
 /* chỉ chạm DOM khi thiếu phần tử hoặc sai thứ tự (tránh lặp vô hạn với MutationObserver) */
 var ok=els.length===w.children.length;
 for(i=0;ok&&i<els.length;i++)if(w.children[i]!==els[i])ok=false;
 if(ok)return;
 for(i=0;i<els.length;i++)w.appendChild(els[i])}
function start(){
 adopt();
 try{new MutationObserver(adopt).observe(document.body,{childList:true})}catch(e){setInterval(adopt,1000)}
}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
window.SKLAY={adopt:adopt,ids:IDS};
})();
