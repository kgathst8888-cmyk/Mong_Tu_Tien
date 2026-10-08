/* ===== ☯ HỢP ĐẠO · ĐẠO CẢNH =====
 * Cửa vào: Thành Thị Linh Giới → cổng 2 "Hợp Đạo Đài" (mảng LCG trong world/10-farming-map.js).
 * Điều kiện: nhân vật Lv100, chưa hợp đạo. Mỗi nhân vật hợp đạo 1 lần. Dữ liệu: PS[cur].hd = {d:1,t,lv0}.
 * Sau khi hợp đạo:
 *  - Tẩy luyện: về Lv1, EXP 0. Điểm tiềm năng (đã cộng + chưa cộng) giữ nguyên.
 *  - Cảnh giới thay bằng Đạo Cảnh Lv1-100 (chính là cấp nhân vật). Hiển thị "Đạo Cảnh". Không đột phá cảnh giới nữa;
 *    dữ liệu cảnh giới cũ (PS[cur].cv) giữ nguyên bên dưới để các Thần Thông (tiên thuật) đã mở vẫn dùng được.
 *  - EXP lên cấp ×CF.xpMul (engine: nx() nhân HDAO.xm()).
 *  - EXP từ quái chỉ nhận ở Linh Giới trở lên (mi()>=CF.mapMin=8). Mặc mọi trang bị không cần cấp (engine: so cấp dùng HDAO.on()).
 *  - Cấp trang bị tối đa CF.itemLv=80 (gen() chặn). Xoá toàn bộ trang bị cũ 1 lần (wipe, cờ CF.wipeId).
 *  - Xoá kỹ năng phàm thể: cast() bị chặn, ẩn nút #sk/#ult. Chỉ còn Thần Thông (#zk) và đánh thường.
 * Chỉnh: khối CF. Phụ thuộc: cast, ZC, PS, cur, P, nx, mx, mm, sv, ui (engine). */
(function(){
'use strict';
if(typeof cast!=='function'||typeof ZC==='undefined'||typeof PS==='undefined')return;
var CF={lv:100,xpMul:5,mapMin:8,itemLv:80,wipeId:'w80'};
var ov=null,busy=false;
function st(){try{return PS[cur]&&PS[cur].hd}catch(e){return null}}
function on(){var h=st();return !!(h&&h.d)}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function say(t){try{msg=t;ui()}catch(e){}}

/* --- EXP ×5 (engine gọi HDAO.xm() trong nx) --- */
/* --- Chặn kỹ năng phàm thể --- */
var _cast=cast;cast=function(){if(on())return;return _cast.apply(this,arguments)};

/* --- Hiển thị Đạo Cảnh thay cảnh giới --- */
var o={nm:ZC.nm,rn:ZC.rn,tx:ZC.tx,pg:ZC.pg,col:ZC.col,bt:ZC.bt,ui:ZC.ui};
ZC.nm=function(){return on()?'Đạo Cảnh Lv '+P.lv:o.nm.apply(this,arguments)};
ZC.rn=function(){return on()?'Đạo Cảnh':o.rn.apply(this,arguments)};
var tc={x:-1,n:-1,s:''};
ZC.tx=function(){
  if(!on())return o.tx.apply(this,arguments);
  var x=Math.floor(P.xp),n=nx();
  if(x!==tc.x||n!==tc.n){tc.x=x;tc.n=n;tc.s=nf(x)+'/'+nf(n)}   /* chỉ định dạng lại khi số đổi */
  return tc.s};
ZC.pg=function(){return on()?Math.min(1,P.xp/Math.max(1,nx())):o.pg.apply(this,arguments)};
ZC.col=function(){return on()?'#ffe27a':o.col.apply(this,arguments)};
ZC.bt=function(){if(on()){say('☯ Đã hợp đạo: cảnh giới được thay bằng Đạo Cảnh, không còn đột phá cảnh giới.');return}return o.bt.apply(this,arguments)};
ZC.ui=function(){
  if(!on())return o.ui.apply(this,arguments);
  var need=Math.max(1,nx()),pc=Math.min(100,Math.floor(P.xp/need*100));
  return '<div class="dt">☯ <b style="color:#ffe27a">Đạo Cảnh Lv '+P.lv+'/100</b><br>'+
    'Cảnh giới đã được thay bằng Đạo Cảnh. Đạo Linh (EXP) lên cấp gấp '+CF.xpMul+' lần phàm thể.<br>'+
    '<div style="height:10px;border:1px solid #b8964e;border-radius:6px;margin:6px 0;overflow:hidden;background:#1d1510"><div style="height:100%;width:'+pc+'%;background:linear-gradient(90deg,#b8862a,#ffe27a)"></div></div>'+
    'Đạo Linh: '+nf(P.xp)+' / '+nf(need)+' ('+pc+'%)<br>'+
    '<span style="opacity:.75">Kỹ năng phàm thể đã bị xoá — chỉ dùng Thần Thông (nút tiên thuật bên phải, tự dùng khi bật AUTO).</span></div>';
};

/* --- CSS ẩn nút kỹ năng phàm thể + giao diện Hợp Đạo Đài --- */
var css=document.createElement('style');
css.textContent='body.hd-on #sk,body.hd-on #ult{display:none!important}'+
'#hd-ov{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(80,60,10,.92),rgba(8,5,2,.97));color:#f2e3b3;font-family:system-ui,sans-serif;padding:16px;box-sizing:border-box}'+
'#hd-ov .bx{max-width:420px;width:100%;max-height:92%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(14,10,8,.9);padding:16px;text-align:center}'+
'#hd-ov h2{margin:0 0 6px;color:#ffe27a;font-size:20px}#hd-ov .tai{font-size:48px;line-height:1;margin:4px 0 8px}'+
'#hd-ov ul{text-align:left;font-size:13.5px;line-height:1.5;margin:8px 0;padding-left:20px}#hd-ov li{margin:3px 0}'+
'#hd-ov .rq{font-size:13px;margin:6px 0}#hd-ov .row{display:flex;gap:8px;margin-top:12px}'+
'#hd-ov button{flex:1;padding:11px;border:0;border-radius:9px;font-weight:700;font-size:15px;color:#fff;background:#8a6420}'+
'#hd-ov button.g{background:#3a3a3a}#hd-ov button:disabled{opacity:.4}'+
'@keyframes hdspin{to{transform:rotate(360deg)}}@keyframes hdflash{0%{opacity:0}60%{opacity:.9}100%{opacity:0}}'+
'#hd-ov .spin{animation:hdspin 1.4s linear infinite;will-change:transform;display:inline-block}#hd-fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;will-change:opacity}'+
'@media (prefers-reduced-motion:reduce){#hd-ov .spin{animation:none}#hd-fl{animation-duration:.01s!important}}';
document.head.appendChild(css);

function build(){
  ov=document.createElement('div');ov.id='hd-ov';
  ['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button[data-a]');if(!b||busy)return;
    if(b.dataset.a==='x')close();else if(b.dataset.a==='go')ritual();
  });
  document.body.appendChild(ov);
}
function render(){
  var done=on(),ok=P.lv>=CF.lv;
  var rq=done?'☯ Bạn đã hợp đạo — Đạo Cảnh Lv '+P.lv+'/100.':
    'Điều kiện: Lv '+CF.lv+' · hiện tại <b style="color:'+(ok?'#7be07a':'#ff9a8a')+'">Lv '+P.lv+'</b>'+(ok?' ✔':'');
  ov.innerHTML='<div class="bx"><div class="tai">☯</div><h2>Hợp Đạo Đài</h2>'+
    '<div class="rq">'+rq+'</div>'+
    '<ul><li>Tẩy luyện toàn bộ bản thân: trở về <b>Lv 1</b>, Đạo Linh (EXP) về 0.</li>'+
    '<li><b>Điểm tiềm năng giữ nguyên</b> (cả đã cộng và chưa cộng).</li>'+
    '<li>Cảnh giới được thay bằng <b>Đạo Cảnh Lv 1–100</b>; hiển thị là "Đạo Cảnh".</li>'+
    '<li>Lên Đạo Cảnh cần Đạo Linh <b>gấp '+CF.xpMul+' lần</b> lúc còn phàm thể.</li>'+
    '<li><b>Xoá toàn bộ kỹ năng phàm thể</b> — chỉ dùng được kỹ năng Thần Thông.</li>'+
    '<li style="color:#ff9a8a">Chỉ hợp đạo được 1 lần, không thể hoàn tác.</li></ul>'+
    '<div class="row"><button class="g" data-a="x">Đóng</button>'+(done?'':'<button data-a="go"'+(ok?'':' disabled')+'>☯ Hợp Đạo</button>')+'</div></div>';
}
function open(){
  if(!ov)build();render();ov.style.display='flex';
}
function close(){if(ov)ov.style.display='none'}

function ritual(){
  if(busy||on()||P.lv<CF.lv)return;
  if(!confirm('Hợp Đạo sẽ đưa nhân vật về Lv 1, xoá kỹ năng phàm thể, Đạo Linh lên cấp ×'+CF.xpMul+'.\nĐiểm tiềm năng được giữ nguyên.\nKhông thể hoàn tác. Tiếp tục?'))return;
  busy=true;
  var bx=ov.querySelector('.bx');
  bx.innerHTML='<div class="tai spin">☯</div><h2>Đang hợp đạo…</h2><div class="rq">Tẩy luyện thân tâm, dung hợp đại đạo.</div>';
  var fl=document.createElement('div');fl.id='hd-fl';ov.appendChild(fl);
  setTimeout(function(){fl.style.animation='hdflash 1.2s ease-in-out'},1500);
  setTimeout(function(){
    try{apply()}catch(e){}
    busy=false;fl.remove();render();
  },2400);
}
function apply(){
  if(on()||P.lv<CF.lv)return;
  var p=PS[cur];
  p.hd={d:1,t:Date.now(),lv0:P.lv};             /* điểm tiềm năng p.pts / p.al giữ nguyên */
  P.lv=1;P.xp=0;p.lv=1;p.xp=0;
  try{P.hp=mx();P.mp=mm()}catch(e){}
  try{DT.push({x:P.x,y:170,s:'☯ Hợp Đạo thành công!',g:1,l:150})}catch(e){}
  sync();try{sv()}catch(e){}try{ui()}catch(e){}
}
var lastOn=null;
function sync(){try{var v=on();if(v!==lastOn){lastOn=v;document.body.classList.toggle('hd-on',v)}}catch(e){}}
/* 1 timer duy nhất (1s): đồng bộ class + đợt xoá đồ cũ; bỏ qua khi tab ẩn */
setInterval(function(){if(document.hidden)return;sync();try{if(started)wipe()}catch(e){}},1000);sync();

/* EXP từ quái: chỉ nhận khi Đạo Cảnh đánh ở Linh Giới trở lên (mi()>=CF.mapMin). Chưa hợp đạo: luôn 1. */
var lastHint=0;
function xg(){
  if(!on())return 1;
  var ok=false;try{ok=typeof mi==='function'&&mi()>=CF.mapMin}catch(e){}
  if(ok)return 1;
  if(Date.now()-lastHint>8000){lastHint=Date.now();try{DT.push({x:P.x,y:150,s:'☯ Đạo Linh chỉ tăng khi đánh ở Linh Giới',g:1,l:90})}catch(e){}}
  return 0;
}
/* Đợt xoá trang bị cũ (1 lần / nhân vật, cờ PS[i].wp = CF.wipeId): xoá toàn bộ trang bị trong túi + đang mặc để nhận đồ mới
   (cấp tối đa 80). Chỉ xoá trang bị; vàng, nguyên liệu, thú, cánh... giữ nguyên. Muốn xoá lại đợt sau: đổi CF.wipeId. */
function wipe(){
  try{
    if(!PS||!PS.some(function(q){return q&&q.wp!==CF.wipeId}))return false;
    var n=0;
    PS.forEach(function(q,i){
      if(!q||q.wp===CF.wipeId)return;
      var lv=(i===cur&&P)?P.lv:q.lv;
      if(lv>1||q.hd){                     /* nhân vật mới tạo (Lv1, chưa hợp đạo) giữ đồ khởi đầu */
        var bg=BAGS&&BAGS[i],eq=EQS&&EQS[i];
        if(bg){n+=bg.filter(Boolean).length;bg.length=0}
        if(eq){n+=eq.filter(Boolean).length;for(var k=0;k<eq.length;k++)eq[k]=null}
      }
      q.wp=CF.wipeId;
    });
    if(n){try{DT.push({x:P.x,y:150,s:'🧹 Đã xoá '+n+' trang bị cũ — nhận đồ mới (tối đa Lv80)',g:1,l:200})}catch(e){}}
    try{sv()}catch(e){}try{ui()}catch(e){}
    return n;
  }catch(e){return false}
}
window.HDAO={on:on,xm:function(){return on()?CF.xpMul:1},xg:xg,wipe:wipe,open:open,cfg:CF};
})();
