/* ===== 🔽 THU GỌN / MỞ CÁC Ô KỸ NĂNG Ở HUD (world/85-skill-fold.js) =====
 * Thêm 1 nút nhỏ ngay trên cột kỹ năng bên phải màn hình. Bấm để cuộn gọn toàn bộ icon kỹ năng, bấm lại để mở.
 * Các cột bị ẩn: #sk-side (Linh Căn / Pháp Bảo / Ý Cảnh / Môn Phái / Hồn Phách — world/52), #tt-bar (Thần Thông — world/34),
 * #tg8-sk (Tiên Giới 8 hướng — world/79).
 * Cách làm KHÔNG đụng logic các module trên: chỉ thêm class body.skf-off + CSS visibility:hidden (không đổi display nên
 * trạng thái hiện/ẩn, hồi chiêu, sự kiện của từng module vẫn chạy bình thường; khi gọn thì không chạm được các nút).
 * Nút chỉ hiện khi có ít nhất 1 cột kỹ năng đang hiển thị. Trạng thái gọn/mở được nhớ bằng localStorage. */
(function(){
'use strict';
var KEY='mtt_skill_fold',IDS=['sk-side','tt-bar','tg8-sk','zk','sk'];
var btn=null,off=false;
try{off=localStorage.getItem(KEY)==='1'}catch(e){}
function css(){
 var c=document.createElement('style');
 c.textContent='body.skf-off #sk-side,body.skf-off #tt-bar,body.skf-off #tg8-sk{visibility:hidden!important;pointer-events:none!important}'
  +'#skf-btn{position:fixed;right:8px;top:calc(98px + env(safe-area-inset-top,0px));width:26px;height:22px;border-radius:11px;border:1px solid #b8964e;background:rgba(29,21,16,.82);color:#f3dfa8;font-size:12px;line-height:1;padding:0;display:none;align-items:center;justify-content:center;z-index:4;touch-action:manipulation;cursor:pointer}'
  +'@media (min-width:641px){#skf-btn{top:calc(102px + env(safe-area-inset-top,0px))}}'
  +'#skf-btn.on{display:flex}';
 (document.head||document.documentElement).appendChild(c)}
function visible(el){
 if(!el)return false;
 var s=getComputedStyle(el);if(s.display==='none')return false;
 if(el.id==='sk-side'){
  for(var i=0;i<el.children.length;i++)if(getComputedStyle(el.children[i]).display!=='none')return true;
  return false}
 return true}
function paint(){
 document.body.classList.toggle('skf-off',off);
 if(btn)btn.textContent=off?'⚔️':'▴'}
function refresh(){
 if(!btn)return;
 var any=false,i;
 for(i=0;i<IDS.length&&!any;i++)any=visible(document.getElementById(IDS[i]));
 btn.classList.toggle('on',any)}
function build(){
 css();
 btn=document.createElement('button');btn.id='skf-btn';btn.type='button';btn.title='Thu gọn / mở kỹ năng';
 btn.addEventListener('click',function(e){
  e.stopPropagation();off=!off;
  try{localStorage.setItem(KEY,off?'1':'0')}catch(er){}
  paint()});
 document.body.appendChild(btn);paint();refresh();
 setInterval(function(){if(!document.hidden)refresh()},1000)}
function start(){build()}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
window.SKFOLD={toggle:function(){if(btn)btn.click()},isOff:function(){return off}};
})();
