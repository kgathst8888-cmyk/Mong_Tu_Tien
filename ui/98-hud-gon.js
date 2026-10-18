/* ===== 🧹 HUD GỌN (ui/98-hud-gon.js) =====
 * 1) Nút ▾/☰ nhỏ ở cạnh trái (dưới hàng icon) để THU GỌN / MỞ các icon "thư mục": Chat, Chợ, Thông báo, Thư, Admin, Sự kiện,
 *    Đấu trường, Boss Bất Tử, Xếp hạng, Mỏ, Y Phục, Linh Điền, Cửa hàng... (chỉ visibility:hidden — không đổi display/logic module gốc).
 * 2) Thu nhỏ icon hàng 2 (40px -> 34px) cho gọn.
 * 3) Nối vào nút thu gọn kỹ năng có sẵn (world/85-skill-fold.js, class body.skf-off): thu gọn luôn các ô kỹ năng dưới (#sk, #ult)
 *    và cột nút phải (#zk).
 * Trạng thái nhớ bằng localStorage (mtt_menu_fold). */
(function(){
'use strict';
var KEY='mtt_menu_fold',off=false,btn=null;
var IDS=['rkb','bsw','arena-btn','hx-shop','hx-farm','hx-cash','hx-mine','hx-tk','chat-btn','cho-btn','tbt-n','tbt-m','adm-b','evt-b'];
try{off=localStorage.getItem(KEY)==='1'}catch(e){}
function sel(p){return IDS.map(function(i){return p+'#'+i}).join(',')}
function css(){
 var c=document.createElement('style');
 c.textContent=sel('body.mnf-off ')+'{visibility:hidden!important;pointer-events:none!important}'
  +'body.skf-off #sk,body.skf-off #ult,body.skf-off #zk{visibility:hidden!important;pointer-events:none!important}'
  +'#chat-btn,#cho-btn,#tbt-n,#tbt-m,#adm-b,#evt-b{width:34px!important;height:34px!important;font-size:16px!important}'
  +'#mnf-btn{position:fixed;left:8px;top:calc(182px + env(safe-area-inset-top,0px));width:30px;height:22px;border-radius:11px;border:1px solid #b8964e;background:rgba(29,21,16,.82);color:#f3dfa8;font-size:12px;line-height:1;padding:0;display:flex;align-items:center;justify-content:center;z-index:4;touch-action:manipulation;cursor:pointer}';
 (document.head||document.documentElement).appendChild(c)}
function paint(){document.body.classList.toggle('mnf-off',off);if(btn)btn.textContent=off?'☰':'▾'}
function build(){
 css();
 btn=document.createElement('button');btn.id='mnf-btn';btn.type='button';btn.title='Thu gọn / mở các mục';
 btn.addEventListener('click',function(e){e.stopPropagation();off=!off;try{localStorage.setItem(KEY,off?'1':'0')}catch(er){}paint()});
 document.body.appendChild(btn);paint()}
if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
window.MNFOLD={toggle:function(){if(btn)btn.click()},isOff:function(){return off}};
})();
