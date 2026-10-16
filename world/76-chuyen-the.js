/* ===== 🌌 CHUYỂN THẾ ĐÀI · ĐẠO THỂ → TIÊN NHÂN =====
 * Cửa vào: Thành Thị Tiên Giới → "Chuyển Thế Đài" (thay Đan Dược Các, TG.spots id 'rebirth').
 * Điều kiện: đã Hợp Đạo (HDAO.on()), Lv100, chưa chuyển thế. Mỗi nhân vật chuyển 1 lần. Dữ liệu: PS[cur].ct = {d:1,t,lv0}.
 * Phí: 1000 Linh Thạch (☁ cần đăng nhập) · 200.000.000 vàng · 50.000 Quặng Sắt · 50.000 Huyền Kim (kho MN.get().fe/.hk).
 * Sau chuyển thế: Tiên Nhân Lv1, EXP 0, GIỮ nguyên mọi điểm thuộc tính (pts/al). Vẫn theo luật Đạo Cảnh (EXP ×5, đồ ≤ Lv80, không kỹ năng phàm thể).
 * Tỉ lệ thành công 50% (CF.rate0), +10% mỗi lần thất bại (CF.step, lưu PS[cur].cf, tối đa 100%). Thất bại vẫn MẤT toàn bộ phí (CF.loseOnFail).
 * Tiên Nhân: chỉ mặc được trang bị Thánh (r>=6, mọi cấp), vào mọi phụ bản/bản đồ không cần cấp, EXP lên cấp ×20 so với Đạo Thể (HDAO.xm), +20 điểm/cấp (core/01e), thuộc tính gốc Lv1 gấp đôi Đạo Thể Lv1 (ZC.pa/ph/pm/pd).
 * Khoá: Thần Thông Đạo Thể (world/34, on() trả false khi CTHE.on()) — dữ liệu học được vẫn lưu. Thần thông Linh Căn / Tiên Ma / tiên thuật / môn phái giữ nguyên.
 * Mở Vạn Pháp Tháp (world/71 realmOk gọi CTHE.on()).
 * Chỉnh: khối CF. Phụ thuộc: HDAO, TG, ZC, PS, cur, P, gold, MN, LT, sv, ui. Thiếu phụ thuộc thì module tự tắt. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof ZC==='undefined'||!window.HDAO||!window.TG||typeof MN==='undefined')return;
var CF={lv:100,gold:200000000,lt:1000,fe:50000,hk:50000,rate0:.5,step:.1,loseOnFail:true,xpK:20,pts:20,holyR:6};
var ov=null,busy=false;
function st(){try{return PS[cur]&&PS[cur].ct}catch(e){return null}}
function on(){var c=st();return !!(c&&c.d)}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function say(t){try{msg=t;ui()}catch(e){}}
function mat(){try{return MN.get()}catch(e){return null}}
function fails(){try{return PS[cur].cf|0}catch(e){return 0}}
function rate(){return Math.min(1,CF.rate0+CF.step*fails())}
function pct(r){return Math.round(r*100)}

/* EXP lên cấp Tiên Nhân = ×CF.xpK so với Đạo Thể (engine nx() gọi HDAO.xm()) */
var _xm=HDAO.xm;
HDAO.xm=function(){var v=_xm.apply(this,arguments);return on()?v*CF.xpK:v};

/* Thuộc tính gốc Lv1 gấp đôi Đạo Thể Lv1: cộng thêm đúng 1 lần phần gốc Lv1 vào công thức (nhân qua ZC.pa/ph/pm/pd, engine gọi qua ZC) */
function bonus(base,cur_){return cur_>0?1+base/cur_:1}
var _pa=ZC.pa,_ph=ZC.ph,_pm=ZC.pm,_pd=ZC.pd;
ZC.pa=function(){var v=_pa.apply(this,arguments);if(!on())return v;try{return v*bonus(28*CHR[cur].a,(20+P.lv*8)*CHR[cur].a+sm('a')+(TK()=='w'?al(0):TK()=='a'?al(3):al(2))*3)}catch(e){return v}};
ZC.ph=function(){var v=_ph.apply(this,arguments);if(!on())return v;try{return v*bonus(260*CHR[cur].h,(200+P.lv*60)*CHR[cur].h+sm('h'))}catch(e){return v}};
ZC.pm=function(){var v=_pm.apply(this,arguments);if(!on())return v;try{return v*bonus(68*CHR[cur].m,(60+P.lv*8)*CHR[cur].m+al(2)*10)}catch(e){return v}};
ZC.pd=function(){var v=_pd.apply(this,arguments);if(!on())return v;try{return v*bonus(50,P.lv*30+20+sm('d')+alD())}catch(e){return v}};

/* Chỉ mặc được trang bị Thánh (mọi cấp). Đồ khác bị chặn; đồ đang mặc được tháo về túi */
function holy(it){return !!it&&(it.r|0)>=CF.holyR}
var _eqp=eqp;
eqp=function(it){if(on()&&it&&!holy(it)){msg='⛔ Tiên Nhân chỉ mặc được trang bị Thánh';try{ui()}catch(e){}return}return _eqp.apply(this,arguments)};
function strip(){
  if(!on())return 0;var n=0;
  try{for(var i=0;i<EQ.length;i++){var it=EQ[i];if(it&&!holy(it)){BAG.push(it);EQ[i]=null;n++}}}catch(e){}
  if(n){try{DT.push({x:P.x,y:150,s:'🧚 Đã tháo '+n+' trang bị không phải Thánh',g:1,l:150})}catch(e){}try{P.hp=Math.min(P.hp,mx());sv();ui()}catch(e){}}
  return n;
}
setInterval(function(){if(document.hidden)return;try{if(started)strip()}catch(e){}},2000);

/* thẻ trong bảng nhân vật: Đạo Cảnh → Tiên Nhân */
var _ui=ZC.ui;
ZC.ui=function(){
  var h=_ui.apply(this,arguments);
  if(!on())return h;
  return h.replace('☯ <b style="color:#ffe27a">Đạo Cảnh Lv','🧚 <b style="color:#9fe8ff">Tiên Nhân Lv');
};

var css=document.createElement('style');
css.textContent='#ct-ov{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(40,30,90,.93),rgba(6,4,20,.97));color:#e8e2ff;font-family:system-ui,sans-serif;padding:16px;box-sizing:border-box}'+
'#ct-ov .bx{max-width:420px;width:100%;max-height:92%;overflow-y:auto;border:2px solid #9a86e8;border-radius:14px;background:rgba(12,9,30,.92);padding:16px;text-align:center}'+
'#ct-ov h2{margin:0 0 6px;color:#c8b8ff;font-size:20px}#ct-ov .tai{font-size:48px;line-height:1;margin:4px 0 8px}'+
'#ct-ov ul{text-align:left;font-size:13.5px;line-height:1.5;margin:8px 0;padding-left:20px}#ct-ov li{margin:3px 0}'+
'#ct-ov .rq{font-size:13px;margin:6px 0}#ct-ov .row{display:flex;gap:8px;margin-top:12px}'+
'#ct-ov button{flex:1;padding:11px;border:0;border-radius:9px;font-weight:700;font-size:15px;color:#fff;background:#5a44b8}'+
'#ct-ov button.g{background:#3a3a3a}#ct-ov button:disabled{opacity:.4}'+
'@keyframes ctspin{to{transform:rotate(360deg)}}@keyframes ctflash{0%{opacity:0}60%{opacity:.9}100%{opacity:0}}'+
'#ct-ov .spin{animation:ctspin 1.4s linear infinite;will-change:transform;display:inline-block}#ct-fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;will-change:opacity}'+
'@media (prefers-reduced-motion:reduce){#ct-ov .spin{animation:none}#ct-fl{animation-duration:.01s!important}}';
document.head.appendChild(css);

function build(){
  ov=document.createElement('div');ov.id='ct-ov';
  ['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button[data-a]');if(!b||busy)return;
    if(b.dataset.a==='x')close();else if(b.dataset.a==='go')ritual();
  });
  document.body.appendChild(ov);
}
function render(){
  var done=on(),dao=window.HDAO&&HDAO.on(),lvOk=!!dao&&P.lv>=CF.lv,gOk=gold>=CF.gold,m=mat()||{},fe=m.fe|0,hk=m.hk|0,fOk=fe>=CF.fe,kOk=hk>=CF.hk;
  var lgd=!!(window.LT&&LT.logged&&LT.logged()),lt=lgd?LT.get():0,lOk=lgd&&lt>=CF.lt;
  var ok=!done&&lvOk&&gOk&&fOk&&kOk&&lOk;
  function rr(t,v,c){return '<div class="rq">'+t+' <b style="color:'+(v?'#7be07a':'#ff9a8a')+'">'+c+'</b>'+(v?' ✔':'')+'</div>'}
  var rq=done?'🧚 Bạn đã là Tiên Nhân — Lv '+P.lv+'.':
    '<b style="color:#c8b8ff">Chuyển thế: Đạo Thể → Tiên Nhân</b>'+
    rr('Đạo Thể Lv '+CF.lv+':',lvOk,dao?'Lv '+P.lv:'chưa Hợp Đạo')+
    rr('Vàng '+nf(CF.gold)+'💰:',gOk,nf(gold))+
    rr('Linh Thạch '+nf(CF.lt)+'💎:',lOk,lgd?nf(lt):'cần đăng nhập ☁')+
    rr('Quặng Sắt '+nf(CF.fe)+'🔩:',fOk,nf(fe))+
    rr('Huyền Kim '+nf(CF.hk)+'🌑:',kOk,nf(hk))+
    '<div class="rq">Tỉ lệ thành công: <b style="color:#ffe27a">'+pct(rate())+'%</b>'+(fails()?' (đã thất bại '+fails()+' lần, +'+pct(CF.step)+'% mỗi lần)':'')+'</div>';
  ov.innerHTML='<div class="bx"><div class="tai">🌌</div><h2>Chuyển Thế Đài</h2><div class="rq">'+rq+'</div>'+
    '<ul><li>Phí: <b>'+nf(CF.gold)+'💰</b>, <b>'+nf(CF.lt)+'💎</b>, <b>'+nf(CF.fe)+' Quặng Sắt</b>, <b>'+nf(CF.hk)+' Huyền Kim</b>.</li>'+
    '<li style="color:#ff9a8a">Có thể <b>thất bại</b>: tỉ lệ '+pct(CF.rate0)+'%, mỗi lần thất bại +'+pct(CF.step)+'%. Thất bại vẫn mất toàn bộ phí.</li>'+
    '<li>Chuyển thế xong thành <b>Tiên Nhân Lv 1</b>, EXP về 0. Thuộc tính gốc Lv1 gấp đôi Đạo Thể, +'+CF.pts+' điểm mỗi cấp, EXP lên cấp gấp '+CF.xpK+' lần Đạo Thể.</li>'+
    '<li><b>Chỉ mặc được trang bị Thánh</b> (Lv1 cũng mặc được). Đồ khác bị tháo về túi. Vào mọi phụ bản, boss, bản đồ không cần cấp.</li>'+
    '<li><b>Giữ nguyên toàn bộ điểm thuộc tính</b> (đã cộng và chưa cộng).</li>'+
    '<li><b>Khoá Thần Thông của Đạo Thể</b>. Thần thông Linh Căn, Tiên Ma… vẫn dùng được.</li>'+
    '<li>Đến <b>Vạn Pháp Tháp</b> ở Tiên Giới để chọn môn phái.</li>'+
    '<li style="color:#ff9a8a">Chỉ chuyển thế được 1 lần, không thể hoàn tác.</li></ul>'+
    '<div class="row"><button class="g" data-a="x">Đóng</button>'+(done?'':'<button data-a="go"'+(ok?'':' disabled')+'>🌌 Chuyển Thế</button>')+'</div></div>';
}
function open(){
  if(!ov)build();render();ov.style.display='flex';
  try{LT.sync().then(function(){if(ov&&ov.style.display==='flex'&&!busy)render()})}catch(e){}
}
function close(){if(ov)ov.style.display='none'}

function ritual(){
  if(busy||on()||!HDAO.on()||P.lv<CF.lv)return;
  var m=mat();if(!m)return;
  if(gold<CF.gold){say('Thiếu vàng: cần '+nf(CF.gold)+'💰');return}
  if((m.fe|0)<CF.fe){say('Thiếu Quặng Sắt: cần '+nf(CF.fe));return}
  if((m.hk|0)<CF.hk){say('Thiếu Huyền Kim: cần '+nf(CF.hk));return}
  if(!window.LT||!LT.spend||!LT.logged()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+nf(CF.lt)+'💎)');return}
  if(!confirm('Chuyển thế Đạo Thể → Tiên Nhân (tỉ lệ thành công '+pct(rate())+'%) sẽ tiêu '+nf(CF.gold)+'💰, '+nf(CF.lt)+'💎, '+nf(CF.fe)+' Quặng Sắt, '+nf(CF.hk)+' Huyền Kim.\nThất bại vẫn mất toàn bộ phí.\nThành công: Tiên Nhân Lv 1, giữ nguyên điểm thuộc tính, khoá Thần Thông Đạo Thể, chỉ mặc được trang bị Thánh.\nKhông thể hoàn tác. Tiếp tục?'))return;
  busy=true;
  ov.querySelector('.bx').innerHTML='<div class="tai spin">🌌</div><h2>Đang chuyển thế…</h2><div class="rq">Trừ Linh Thạch…</div>';
  LT.spend(CF.lt,'chuyenthe').then(function(r){
    if(!r||!r.ok){busy=false;say(r&&r.err==='poor'?'Không đủ Linh Thạch: cần '+nf(CF.lt)+'💎, bạn có '+nf(r.lt)+'💎':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+')');render();return}
    try{gold=Math.max(0,gold-CF.gold);var m2=mat();m2.fe=Math.max(0,(m2.fe|0)-CF.fe);m2.hk=Math.max(0,(m2.hk|0)-CF.hk)}catch(e){}
    ritualGo();
  });
}
function ritualGo(){
  var bx=ov.querySelector('.bx');
  bx.innerHTML='<div class="tai spin">🌌</div><h2>Đang chuyển thế…</h2><div class="rq">Phá bỏ xác phàm, hoá thân Tiên Nhân.</div>';
  var fl=document.createElement('div');fl.id='ct-fl';ov.appendChild(fl);
  setTimeout(function(){fl.style.animation='ctflash 1.2s ease-in-out'},1500);
  setTimeout(function(){var ok=false;try{ok=roll()}catch(e){}busy=false;fl.remove();render();if(!ok)say('💥 Chuyển thế thất bại! Tỉ lệ lần sau: '+pct(rate())+'%')},2400);
}
function roll(){
  if(on())return true;
  if(Math.random()<rate()){apply();return on()}
  var p=PS[cur];p.cf=fails()+1;
  try{DT.push({x:P.x,y:170,s:'💥 Chuyển thế thất bại! Lần sau '+pct(rate())+'%',g:1,l:150})}catch(e){}
  try{sv()}catch(e){}try{ui()}catch(e){}
  return false;
}
function apply(){
  if(on()||P.lv<CF.lv)return;
  var p=PS[cur];
  p.ct={d:1,t:Date.now(),lv0:P.lv};            /* điểm thuộc tính p.pts / p.al giữ nguyên */
  P.lv=1;P.xp=0;p.lv=1;p.xp=0;
  try{P.hp=mx();P.mp=mm()}catch(e){}
  try{DT.push({x:P.x,y:170,s:'🧚 Chuyển thế thành công — Tiên Nhân Lv 1!',g:1,l:150})}catch(e){}
  strip();
  try{sv()}catch(e){}try{ui()}catch(e){}
}

/* Gắn vào ô Tiên Giới: Chuyển Thế Đài (thay Đan Dược Các) */
function sync(){
  try{TG.spots.forEach(function(p){
    if(p.id!=='rebirth')return;
    if(!p.open){p.open=1;p.go=open}
  })}catch(e){}
}
sync();
window.CTHE={on:on,open:open,close:close,cfg:CF,rate:rate,pts:function(){return on()?CF.pts:0}};
})();
