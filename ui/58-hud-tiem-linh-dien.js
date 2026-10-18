/* ===== 👘🌱 ICON TIỆM Y PHỤC + LINH ĐIỀN lên HÀNG HUD cùng 🏆 Xếp hạng (ui/58-hud-tiem-linh-dien.js) =====
 * Trước: 2 icon nổi lơ lửng trong cảnh Làng (vẽ canvas). Nay: 2 nút nhỏ (26px) cùng hàng với 🏆 (#rkb), nằm bên trái nút ⚔️ Đấu trường.
 * Cách làm (patch nhỏ, không đổi logic cũ):
 *  - equipment/14-cosmetics-shop.js: banner() và click canvas bị tắt khi HUDX.on; mỗi khung "có thể hiện icon" ghi HUDX.shop=fr.
 *  - world/10-farming-map.js: gateDraw() và click canvas bị tắt khi HUDX.on; ghi HUDX.gate=fr; thêm window.FGATE={enter,leave}.
 *  - Nút chỉ hiện khi 🏆 hiện VÀ icon cũ lẽ ra được vẽ ở khung hình gần đây (nghĩa là đang ở Làng, không boss/hầm ngục/phụ bản khác).
 *  - Bấm 👘 → FSH.show() (mở tiệm); bấm 🌱 → FGATE.enter() (vào Linh Điền); bấm 🛒 → CSH.show() (Cash Shop, ui/63-cash-shop.js; nằm ngoài cùng bên trái hàng); 🎫 Vé (mọi nơi có HUD, kể cả ngoài Làng) → CSH.show('kho'). Tắt tính năng: HUDX.on=false (icon cũ trở lại).
 * Vị trí: theo #rkb (x,y do ui/17 đặt): hàng [👘][🌱][⛏ Mỏ][⚔️ x-96][💀 x-52][🏆 x]. Màn hẹp (không đủ chỗ) → xuống hàng dưới 🏆/💀. */
(function(){
'use strict';
window.HUDX=window.HUDX||{on:true,shop:-99,gate:-99};
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',SZ=26,PITCH=40;
var st=document.createElement('style');st.textContent='.hxb{position:fixed;z-index:2;width:'+SZ+'px;height:'+SZ+'px;box-sizing:border-box;border-radius:50%;border:2px solid #c9a24f;background:radial-gradient(circle at 50% 30%,#4b3a2c,#120b08 78%);box-shadow:0 2px 6px #000b,inset 0 0 6px #000;color:#ffe27a;font-size:13px;line-height:21px;text-align:center;padding:0;display:none;cursor:pointer;touch-action:manipulation}.hxb::after{content:attr(data-lb);position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 8px/9px '+FONT+';color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}.hxb:active{transform:scale(.92)}';document.head.appendChild(st);
function mk(id,ic,lb,tt,fn){var b=document.createElement('button');b.id=id;b.type='button';b.className='hxb';b.textContent=ic;b.title=tt;b.setAttribute('data-lb',lb);b.onpointerdown=function(e){e.stopPropagation()};b.onclick=function(e){e.stopPropagation();try{fn()}catch(x){}};document.body.appendChild(b);return b}
var bs=mk('hx-shop','👘','Y Phục','Tiệm Y Phục Linh Vân',function(){if(window.FSH)FSH.show()}),
    bf=mk('hx-farm','🌱','Linh Điền','Linh Điền Động Thiên',function(){if(window.FGATE)FGATE.enter()}),
    bc=mk('hx-cash','🛒','Shop','Cửa Hàng Linh Vân (Linh Thạch · Vàng)',function(){if(window.CSH)CSH.show()}),
    bm=mk('hx-mine','⛏','Mỏ','Hầm mỏ: Vàng · Quặng Sắt · Huyền Kim',function(){if(typeof MN!=='undefined'&&!MN.isBroken())MN.go()}),
    bt=mk('hx-tk','🎫','Vé','Kho vật phẩm Cash Shop: dùng Vé EXP / Tu Vi ở mọi nơi',function(){if(window.CSH)CSH.show('kho')});
var last='';
function place(){
  var rk=document.getElementById('rkb'),ok=false;
  try{ok=!!(rk&&rk.style.display==='block'&&started&&HUDX.on)}catch(e){}
  var on=[];
  if(ok){var f=fr;if(f-HUDX.shop<=3)on.push(bs);if(f-HUDX.gate<=3)on.push(bf);if(on.length&&window.CSH)on.push(bc);if(window.CSH)on.push(bt);try{if(typeof MN!=='undefined'&&!MN.isBroken())on.unshift(bm)}catch(e){}}
  var k=on.map(function(b){return b.id}).join('|')+'|'+(ok?rk.style.left+','+rk.style.top:'');
  if(k===last)return;last=k;
  [bm,bs,bf,bc,bt].forEach(function(b){if(on.indexOf(b)<0&&b.style.display!=='none')b.style.display='none'});
  if(!on.length)return;
  var x0=parseFloat(rk.style.left)||0,y0=parseFloat(rk.style.top)||0,base=x0-96,n=on.length,left=base-16-(n-1)*PITCH-SZ,row2=left<150;
  on.forEach(function(b,i){var x=row2?x0+4-i*PITCH:base-16-SZ-i*PITCH,y=row2?y0+34+12:y0+4;b.style.left=Math.round(x)+'px';b.style.top=Math.round(y)+'px';b.style.display='block'})}
setInterval(function(){try{place()}catch(e){}},150);
})();
