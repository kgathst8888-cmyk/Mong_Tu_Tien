/* ===== 🛒 CASH SHOP · CỬA HÀNG LINH VÂN (ui/63-cash-shop.js) =====
 * Nút 🛒 nằm cùng hàng HUD với ⚔️ Đấu trường / 🌱 Linh Điền / 👘 Y Phục (ui/58-hud-tiem-linh-dien.js đặt vị trí; chỉ hiện ở Làng).
 * 2 mục:
 *  💎 SHOP LINH THẠCH (trừ ví tài khoản ☁ qua LT.spend, cần đăng nhập — như đột phá mỏ / vé Thánh Địa):
 *     - Bùa Cường Hóa +10% (100💎) · +15% (200💎) · +20% (500💎): CỘNG THÊM điểm % vào tỉ lệ thành công khi cường hóa (tối đa 100%).
 *       Cách dùng: mở món đồ trong túi → hàng "📜 Bùa" dưới nút Cường hóa → chọn bùa → bấm Cường hóa. Bùa chỉ bị trừ khi lượt cường hóa
 *       thật sự diễn ra (đã trừ vàng) — thành công hay thất bại đều mất 1 bùa. Tỉ lệ gốc đã 100% thì không dùng/không mất bùa.
 *     - Búa Đục Lỗ (100💎) và Bùa Ghép Ngọc +10% (200💎): CẤT KHO. Game CHƯA có hệ thống Ngọc/khảm, nên chưa có công dụng
 *       (API sẵn: CSH.count('ham'|'g10'), CSH.use(k) trả true nếu trừ được 1 cái — hệ Ngọc sau này chỉ cần gọi).
 *  💰 SHOP VÀNG (trừ vàng trong game):
 *     - Rương Trang Bị Ngẫu Nhiên 10.000.000 vàng: ra 1 món từ Thường(trắng) → Thiên Thần, trọng số ở CFG.eqW (chỉnh tại đây).
 *     - Rương Quặng Ngẫu Nhiên 5.000.000 vàng: ngẫu nhiên Quặng Sắt HOẶC Huyền Kim, số lượng 50/100/150/200 (đều nhau).
 * Kho vật phẩm lưu theo nhân vật: PS[cur].csh={b10,b15,b20,ham,g10} (theo PS nên được lưu cùng save/cloud save).
 * Phụ thuộc: PS, cur, gold, BAG, gen, RC/RN, RT, MN.get() (13-mining), LT (32-cho-giao-dich), DCH (38, tuỳ chọn), sv, ui. Thiếu thì tính năng đó tự tắt. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof gen!=='function')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var CFG={
  lt:[ /* shop Linh Thạch */
    {k:'b10',e:'📜',n:'Bùa Cường Hóa +10%',p:100,d:'+10% tỉ lệ thành công khi cường hóa trang bị',bon:10},
    {k:'b15',e:'📜',n:'Bùa Cường Hóa +15%',p:200,d:'+15% tỉ lệ thành công khi cường hóa trang bị',bon:15},
    {k:'b20',e:'📜',n:'Bùa Cường Hóa +20%',p:500,d:'+20% tỉ lệ thành công khi cường hóa trang bị',bon:20},
    {k:'ham',e:'🔨',n:'Búa Đục Lỗ',p:100,d:'Đục lỗ trang bị để khảm Đá (tối đa 2 lỗ: lỗ 1 cần 1 búa, lỗ 2 cần 3 búa)'},
    {k:'g10',e:'📜',n:'Bùa Ghép Ngọc +10%',p:200,d:'+10% tỉ lệ thành công khi ghép Đá Khảm (bật trong bảng 💎 Đá Khảm ở túi đồ)'},
    {k:'dh',e:'🔮',n:'Ngọc Định Hồn',p:10000,d:'Định hồn 1 trang bị VĨNH VIỄN: cường hóa +8→+10 thất bại chỉ về +7 (không về +0)'},
    {k:'vx',e:'📈',n:'Vé Tăng 20% EXP',p:100,d:'Dùng: +20% EXP nhận được trong 2 giờ (dùng khi đang có hiệu lực = cộng dồn thêm 2 giờ)'},
    {k:'vt',e:'🧘',n:'Vé Tăng 20% Tu Vi',p:100,d:'Dùng: +20% Tu Vi nhận được trong 2 giờ (dùng khi đang có hiệu lực = cộng dồn thêm 2 giờ)'},
    {k:'tc',e:'🎯',n:'Vé Tẩy Opt Chọn',p:1000,d:'Đồ Thánh: tự chọn 1 opt đang có và đổi sang 1 opt khác tuỳ ý (mức tối đa). Mỗi món Thánh chỉ được đổi DUY NHẤT 1 opt, 1 lần.'},
    {k:'x5',e:'📈',n:'Bùa EXP +50%',p:200,d:'Dùng: +50% EXP nhận được trong 2 giờ (dùng thêm = cộng dồn 2 giờ). Không cộng dồn % với Vé/Bùa EXP khác: tính mức cao nhất đang chạy'},
    {k:'x7',e:'📈',n:'Bùa EXP +70%',p:300,d:'Dùng: +70% EXP nhận được trong 2 giờ (dùng thêm = cộng dồn 2 giờ). Không cộng dồn % với Vé/Bùa EXP khác: tính mức cao nhất đang chạy'}],
  tkMs:2*3600e3,                   /* thời hạn mỗi vé = 2 giờ (thời gian thật, tính cả lúc offline) */
  tkPct:.2,
  xp:{vx:.2,x5:.5,x7:.7},          /* % EXP của từng loại vé/bùa EXP (lấy mức CAO NHẤT đang còn hạn) */
  chestEq:10000000, chestOre:5000000,
  eqW:[30,25,20,13,8,4],          /* trọng số Thường, Tinh Anh, Hiếm, Sử Thi, Thần Thoại, Thiên Thần (r = 0..5) */
  oreAmt:[50,100,150,200]
};
var TK={vx:'xe',vt:'te',x5:'e5',x7:'e7'}; /* vé → khoá hạn trong PS[cur].csh */
var BON={};CFG.lt.forEach(function(o){if(o.bon)BON[o.k]=o.bon});
var NAMES={};CFG.lt.forEach(function(o){NAMES[o.k]=o.e+' '+o.n});

function D(){var p=PS[cur];if(!p)return{b10:0,b15:0,b20:0,ham:0,g10:0,dh:0,tc:0};if(!p.csh)p.csh={b10:0,b15:0,b20:0,ham:0,g10:0,dh:0,tc:0};if(p.csh.tc==null)p.csh.tc=0;return p.csh}
function cnt(k){return D()[k]|0}
function nf(n){try{return fmtN(n)}catch(e){return String(n)}}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function save(){try{if(typeof sv==='function')sv()}catch(e){}}
function ltLogged(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}

/* ---------- bùa cường hóa: cộng điểm % vào RT[] (cả hiển thị lẫn lúc tung) ---------- */
var armed=null,BASE=[];
function armBonus(){return(armed&&cnt(armed)>0)?(BON[armed]|0):0}
if(typeof RT!=='undefined'&&Array.isArray(RT)&&!RT.__csh){
  RT.__csh=1;BASE=RT.slice();
  RT.slice().forEach(function(base,i){
    try{Object.defineProperty(RT,i,{configurable:true,enumerable:true,get:function(){return Math.min(100,base+(base<100?armBonus():0))},set:function(v){base=v}})}catch(e){}
  });
}
function curItem(){try{return sel&&sel.k==='e'?EQ[sel.i]:BAG[sel.i]}catch(e){return null}}
/* chạy 1 lượt cường hóa; chỉ trừ bùa nếu vàng bị trừ (= lượt thật sự diễn ra) */
function run(fn){
  var it=curItem(),a=armed;
  if(!it||!a||cnt(a)<1||it.u>=10||(BASE[it.u]|0)>=100){return fn()}
  var g0=gold,r=fn();
  if(gold<g0){
    D()[a]--;if(cnt(a)<1)armed=null;
    try{msg=(msg||'')+' · 📜 −1 '+NAMES[a]+' (còn '+cnt(a)+')'}catch(e){}
    save();try{ui()}catch(e){}
  }
  return r}
if(typeof en1==='function'&&!en1.__csh){
  var _en1=en1,inEn=false;
  en1=function(){inEn=true;try{return run(function(){return _en1.apply(this,arguments)}.bind(this))}finally{inEn=false}};
  en1.__csh=1;
  if(typeof gcf==='function'){
    var _gcf=gcf;
    gcf=function(t,fn){if(inEn&&typeof fn==='function'){var f=fn;fn=function(){return run(f)}}return _gcf.call(this,t,fn)};
  }
}
/* hàng chọn bùa dưới nút Cường hóa trong bảng món đồ (engine gọi DCH.buyBtn(it)) */
if(window.DCH&&!DCH.__csh){
  var _bb=DCH.buyBtn;DCH.__csh=1;
  DCH.buyBtn=function(it){
    var h=_bb?_bb.apply(this,arguments):'',o='';
    CFG.lt.forEach(function(x){if(!BON[x.k]||cnt(x.k)<1)return;
      var on=armed===x.k;
      o+='<button onclick="CSH.arm(\''+x.k+'\')"'+(on?' style="border-color:#7affb0;box-shadow:0 0 6px #7affb0"':'')+'>📜 +'+x.bon+'% ×'+cnt(x.k)+(on?' ✔':'')+'</button>'});
    var x=curItem();
    if(x&&x.dh)o+='<span class="st" style="color:#d9a8ff">🔮 Đã Định Hồn (vĩnh viễn)</span>';
    else if(cnt('dh')>0&&x)o+='<button onclick="CSH.soul()" style="border-color:#d9a8ff">🔮 Định Hồn ×'+cnt('dh')+'</button>';
    return h+o};
}
/* Ngọc Định Hồn: gắn cờ it.dh=1 lên món đồ (lưu cùng món, vĩnh viễn). Hiệu lực xử lý ở world/38-da-cuong-hoa.js (thất bại +8→+10 về +7). */
function soul(){
  var it=curItem();if(!it||it.dh||cnt('dh')<1)return;
  var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
  ask('Dùng 1 🔮 Ngọc Định Hồn lên '+(it.n||'trang bị')+'?\nĐịnh hồn là VĨNH VIỄN và không thể gỡ.',function(){
    var x=curItem();if(!x||x.dh||cnt('dh')<1)return;
    D().dh--;x.dh=1;try{msg='🔮 Định Hồn thành công! Cường hóa +8→+10 thất bại sẽ về +7.'}catch(e){}
    save();try{ui()}catch(e){}if(open)render()})}
/* ---------- 🎯 Vé Tẩy Opt Chọn (chỉ đồ Thánh: it.hl) ----------
 * Đồ Thánh có 7 opt, mỗi opt ở mức TỐI ĐA (xQ=10). Người chơi chọn 1 opt đang có + 1 opt đích (không trùng opt đang có, lấy từ OPT2.cfg.holyKeys);
 * opt mới luôn mức tối đa OPT2.val(k,10). MỖI MÓN chỉ đổi 1 opt, 1 lần duy nhất (it.rc=1). */
function holy(it){return !!(it&&it.hl&&it.x&&typeof it.x==='object')}
function hkeys(){try{return OPT2.cfg.holyKeys.slice()}catch(e){return[]}}
function ovalue(k){try{return OPT2.val(k,10)}catch(e){return null}}
function oname(k){try{return AXN[k]||k}catch(e){return k}}
function swapOpt(it,from,to){ /* giữ nguyên thứ tự dòng opt */
  var nx={},nq={};Object.keys(it.x).forEach(function(k){if(k===from){nx[to]=ovalue(to);nq[to]=10}else{nx[k]=it.x[k];nq[k]=(it.xq&&it.xq[k]!=null)?it.xq[k]:10}});
  it.x=nx;it.xq=nq;it.o2=1}
function free(it){return hkeys().filter(function(k){return it.x[k]==null&&ovalue(k)!=null})}
/* 🎯 bảng chọn opt */
var pk={it:null,from:null,to:null},pel=null;
function pickClose(){pk.it=null;if(pel)pel.style.display='none'}
function pickRender(){
  if(!pel){pel=document.createElement('div');pel.id='cshq';
    pel.style.cssText='display:none;position:fixed;left:0;right:0;top:0;bottom:0;z-index:14;background:#000b;overflow-y:auto;font-family:'+FONT+';color:#f0e4c8';
    pel.addEventListener('pointerdown',function(e){e.stopPropagation()});document.body.appendChild(pel)}
  var it=pk.it;if(!holy(it)){pickClose();return}
  var cur_=Object.keys(it.x),fr=free(it);
  function bt(k,sel,fn,locked){return '<button '+(locked?'disabled ':'')+'onclick="CSH.'+fn+'(\''+k+'\')" style="display:block;width:100%;margin:3px 0;padding:8px;font:inherit;border-radius:6px;border:1px solid '+(sel?'#7affb0':'#c9a24f')+';background:'+(sel?'#1f5a3a':'linear-gradient(#8a6420,#5a3e12)')+';color:#ffe9a0;opacity:'+(locked?.5:1)+'">'+(sel?'✔ ':'')+oname(k)+' '+(it.x[k]!=null?it.x[k]:ovalue(k))+(locked?' 🔒':'')+'</button>'}
  var ok=pk.from&&pk.to;
  var h='<div style="max-width:420px;margin:0 auto;padding:12px"><div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;margin-bottom:6px"><span>🎯 Tẩy Opt Chọn · '+(it.n||'')+'</span><button onclick="CSH.pickClose()" style="font:inherit;color:#ffe9a0;background:#5a3e12;border:1px solid #c9a24f;border-radius:6px;padding:3px 9px">✕</button></div>'
   +'<div style="font-size:12px;color:#ffd98a;margin:4px 0">⚠ Mỗi món Thánh chỉ được đổi DUY NHẤT 1 opt, 1 lần, không thể hoàn tác. Opt mới ở mức tối đa.</div>'
   +'<div style="margin:8px 0 2px;font-size:13px">1) Chọn opt muốn tẩy:</div>'+cur_.map(function(k){return bt(k,pk.from===k,'pickFrom')}).join('')
   +'<div style="margin:10px 0 2px;font-size:13px">2) Chọn opt mới:</div>'+fr.map(function(k){return bt(k,pk.to===k,'pickTo')}).join('')
   +'<button '+(ok?'':'disabled ')+'onclick="CSH.pickOk()" style="width:100%;margin-top:12px;padding:10px;font:inherit;border-radius:6px;border:1px solid #8fd0ff;background:linear-gradient(#2e6fb8,#1b4478);color:#fff;opacity:'+(ok?1:.5)+'">Xác nhận tẩy (−1 vé 🎯 · còn '+cnt('tc')+')</button></div>';
  pel.innerHTML=h;pel.style.display='block'}
function useChoose(){
  var it=curItem();if(!holy(it)){note='🎯 Chỉ dùng cho đồ Thánh.';render();return}
  if(it.rc){try{msg='🎯 Món này đã dùng Vé Tẩy Opt Chọn rồi (mỗi món chỉ 1 lần).';ui()}catch(e){}return}
  if(cnt('tc')<1)return;
  pk={it:it,from:null,to:null};pickRender()}
function pickFrom(k){if(pk.it){pk.from=pk.from===k?null:k;pickRender()}}
function pickTo(k){if(pk.it){pk.to=pk.to===k?null:k;pickRender()}}
function pickOk(){
  var it=pk.it,a=pk.from,b=pk.to;if(!holy(it)||!a||!b||it.x[a]==null||it.x[b]!=null||it.rc||cnt('tc')<1||ovalue(b)==null)return;
  D().tc--;swapOpt(it,a,b);it.rc=1;
  try{msg='🎯 Đã đổi opt: '+oname(a)+' → '+oname(b)+' '+ovalue(b)}catch(e){}
  say('🎯 '+oname(a)+' → '+oname(b),'#7affb0');pickClose();save();try{ui()}catch(e){}if(open)render()}
/* nút dưới bảng món đồ (engine gọi CSH.holyBtn(it) — core/01p-bag-pet-ui.js, hiện cả khi món đã +10) */
function holyBtn(it){
  if(!holy(it))return '';var o='';
  if(it.rc)o+='<span class="st" style="color:#7affb0">🎯 Đã đổi opt chọn (1/1)</span>';
  else if(cnt('tc')>0)o+='<button onclick="CSH.useChoose()" style="border-color:#7affb0">🎯 Tẩy opt chọn ×'+cnt('tc')+'</button>';
  return o}
/* ---------- vé tăng EXP / Tu Vi (2 giờ) ---------- */
function left(k){var e=+D()[TK[k]]||0;return Math.max(0,e-Date.now())}
function clk(ms){var t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),c=t%60;return h+':'+String(m).padStart(2,'0')+':'+String(c).padStart(2,'0')}
function useTicket(k){
  if(!TK[k]||cnt(k)<1)return;
  var d=D();d[k]--;d[TK[k]]=Math.max(Date.now(),+d[TK[k]]||0)+CFG.tkMs;
  note='✅ Đã dùng '+NAMES[k]+' — còn '+clk(left(k));say(NAMES[k],'#9fffb0');save();render()}
/* Hook tại chỗ ghi: mọi lần P.xp / cv.q TĂNG đều được cộng thêm 20% khi vé còn hiệu lực (giảm/lên cấp đi qua nguyên vẹn).
   P và PS[i].cv bị thay đối tượng ở vài nơi (init, ng, tải save, đấu trường) nên cài lại định kỳ. */
function expPct(){var m=0;['vx','x5','x7'].forEach(function(k){if(left(k)>0&&CFG.xp[k]>m)m=CFG.xp[k]});return m}
function tuPct(){return left('vt')>0?CFG.tkPct:0}
function hook(o,key,pf){
  if(!o)return;var ds=Object.getOwnPropertyDescriptor(o,key);if(ds&&ds.get&&ds.get.__csh)return;
  var val=+o[key]||0,carry=0;
  var g=function(){return val};g.__csh=1;
  try{Object.defineProperty(o,key,{configurable:true,enumerable:true,get:g,set:function(v){
    v=+v;if(v>val){var pc=0;try{pc=pf()}catch(e){}if(pc>0){carry+=(v-val)*pc;var b=Math.floor(carry);carry-=b;v+=b}}
    val=v}})}catch(e){}}
setInterval(function(){try{if(typeof started==='undefined'||!started)return;
  if(typeof P!=='undefined'&&P)hook(P,'xp',expPct);
  var c=PS[cur]&&PS[cur].cv;if(c)hook(c,'q',tuPct)}catch(e){}},100);
function arm(k){
  if(!BON[k])return;
  if(cnt(k)<1){armed=null}else armed=(armed===k?null:k);
  try{ui()}catch(e){}
}

/* ---------- giao diện cửa hàng ---------- */
var el=null,open=false,tab='lt',busy=false,note='',last='';
function mkEl(){
  var st=document.createElement('style');
  st.textContent='#cshp{display:none;position:fixed;z-index:12;background:linear-gradient(#1e2a38,#0c1119);color:#f0e4c8;font-family:'+FONT+';overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:8px 10px 14px}'
  +'#cshp.pt{left:0;right:0;bottom:0;top:38%;border-top:2px solid #5aa8ff}#cshp.ls{top:0;bottom:0;right:0;width:min(400px,100%);border-left:2px solid #5aa8ff}'
  +'#cshp button{font:inherit;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:5px 9px;cursor:pointer}#cshp button:disabled{opacity:.45}'
  +'#cshp .ch{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:bold;margin-bottom:6px}'
  +'#cshp .ct{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:6px}#cshp .ct button.on{background:linear-gradient(#2e6fb8,#1b4478);border-color:#8fd0ff;color:#fff}'
  +'#cshp .cb{font-size:12px;margin:3px 0 6px;color:#9fd8ff}'
  +'#cshp .cr{display:flex;align-items:center;gap:8px;border:1px solid #3d5470;border-radius:8px;padding:7px 8px;margin-bottom:5px;background:#0006}'
  +'#cshp .cr .ci{font-size:22px;width:28px;text-align:center}#cshp .cr .cx{flex:1;min-width:0;font-size:13px}#cshp .cr .cx small{display:block;opacity:.75;font-size:11px;line-height:1.25}#cshp .cr button{white-space:nowrap;font-size:12px}'
  +'#cshp .cn{font-size:12px;color:#ffd98a;margin:4px 0}#cshp .cres{border:1px dashed #c9a24f;border-radius:8px;padding:6px 8px;margin:6px 0;font-size:13px;background:#0008}';
  document.head.appendChild(st);
  el=document.createElement('div');el.id='cshp';
  el.addEventListener('pointerdown',function(e){e.stopPropagation()});
  document.body.appendChild(el);
}
function row(o,right){return '<div class="cr"><div class="ci">'+o.e+'</div><div class="cx"><b>'+o.n+'</b>'+(o.own!=null?' <span style="color:#7affb0">(có '+o.own+')</span>':'')+'<small>'+o.d+'</small></div>'+right+'</div>'}
function render(){
  if(!el)mkEl();
  try{el.className=PORT?'pt':'ls';if(PORT)el.style.width=''}catch(e){el.className='pt'}
  var lt=0;try{lt=LT.get()}catch(e){}
  var tkS=['vx','x5','x7'].filter(function(k){return left(k)>0}).map(function(k){return '📈 EXP +'+Math.round(CFG.xp[k]*100)+'%: <b data-tk="'+k+'">'+clk(left(k))+'</b>'}).join(' ')+(left('vt')>0?' 🧘 Tu Vi +20%: <b data-tk="vt">'+clk(left('vt'))+'</b>':'');
  var h='<div class="ch"><span>🛒 Cửa Hàng Linh Vân</span><button onclick="CSH.close()">✕</button></div>'
   +'<div class="cb">💎 '+nf(ltLogged()?lt:0)+' Linh Thạch'+(ltLogged()&&LT.locked&&LT.locked()>0?' <small>(🔒 khoá của nhân vật này: '+nf(LT.locked())+' · dùng khoá trước)</small>':'')+' · 💰 '+nf(Math.floor(gold))+' vàng</div>'
   +(tkS?'<div class="cb" style="color:#9fffb0">'+tkS+'</div>':'')+'<div class="ct"><button class="'+(tab==='lt'?'on':'')+'" onclick="CSH.tab(\'lt\')">💎 Linh Thạch</button><button class="'+(tab==='gold'?'on':'')+'" onclick="CSH.tab(\'gold\')">💰 Vàng</button><button class="'+(tab==='kho'?'on':'')+'" onclick="CSH.tab(\'kho\')">🎒 Kho</button></div>';
  if(tab==='kho'){
    var any=0;
    h+='<div class="cn">Kho riêng của Cash Shop — không chiếm ô túi đồ / ô trang bị. Mỗi lần cường hóa chỉ dùng được 1 loại bùa. 🔮 Ngọc Định Hồn dùng ở bảng món đồ trong túi.</div>';
    CFG.lt.forEach(function(o){var n=cnt(o.k);if(n<1)return;any=1;
      var b=TK[o.k]?'<button onclick="CSH.ticket(\''+o.k+'\')">Dùng</button>':(o.k==='dh'||o.k==='tc')?'<span style="opacity:.7;font-size:11px">dùng trong túi</span>':BON[o.k]?'<button onclick="CSH.arm(\''+o.k+'\');CSH.tab(\'kho\')"'+(armed===o.k?' style="border-color:#7affb0"':'')+'>'+(armed===o.k?'✔ Đang chọn':'Chọn dùng')+'</button>':'<span style="opacity:.7;font-size:11px">dùng ở túi đồ → 💎 Đá Khảm</span>';
      h+=row({e:o.e,n:o.n,d:o.d,own:n},b)});
    if(!any)h+='<div class="cn">Kho trống. Mua vật phẩm ở tab 💎 Linh Thạch.</div>';
  }else if(tab==='lt'){
    if(!ltLogged())h+='<div class="cn">☁ Cần đăng nhập tài khoản để dùng Linh Thạch.</div>';
    CFG.lt.forEach(function(o){
      h+=row({e:o.e,n:o.n,d:o.d,own:cnt(o.k)},'<button '+(busy||!ltLogged()||lt<o.p?'disabled ':'')+'onclick="CSH.buy(\''+o.k+'\')">'+o.p+'💎<br>Mua</button>')});
    h+='<div class="cn">📜 Bùa Cường Hóa: mở món đồ trong túi → chọn bùa dưới nút ⚒ Cường hóa. Bùa chỉ mất khi lượt cường hóa thực sự diễn ra.</div>';
  }else{
    var tot=CFG.eqW.reduce(function(a,b){return a+b},0);
    var odds=CFG.eqW.map(function(w,i){return '<span style="color:'+RC[i]+'">'+RN[i]+' '+Math.round(w/tot*100)+'%</span>'}).join(' · ');
    h+=row({e:'🎁',n:'Rương Trang Bị Ngẫu Nhiên',d:'1 món từ Thường (trắng) đến Thiên Thần.<br>'+odds},'<button '+(gold<CFG.chestEq?'disabled ':'')+'onclick="CSH.chest(\'eq\')">'+nf(CFG.chestEq)+'💰<br>Mua</button>');
    h+=row({e:'📦',n:'Rương Quặng Ngẫu Nhiên',d:'Ngẫu nhiên 🔩 Quặng Sắt hoặc 🌑 Huyền Kim: '+CFG.oreAmt.join(' / ')+' (mỗi mức đều nhau).'},'<button '+(gold<CFG.chestOre?'disabled ':'')+'onclick="CSH.chest(\'ore\')">'+nf(CFG.chestOre)+'💰<br>Mua</button>');
    if(last)h+='<div class="cres">'+last+'</div>';
  }
  if(note)h+='<div class="cn">'+note+'</div>';
  el.innerHTML=h;
}
function show(t){if(!el)mkEl();open=true;note='';if(t==='kho'||t==='lt'||t==='gold')tab=t;el.style.display='block';render();try{if(window.LT&&LT.sync)LT.sync().then(function(){if(open)render()})}catch(e){}}
function close(){open=false;if(el)el.style.display='none'}
function setTab(t){tab=t;note='';render()}

/* ---------- mua bằng Linh Thạch ---------- */
function buy(k){
  var o=CFG.lt.filter(function(x){return x.k===k})[0];if(!o||busy)return;
  if(!ltLogged()){note='☁ Cần đăng nhập tài khoản để dùng Linh Thạch.';render();return}
  busy=true;note='Đang trừ '+o.p+'💎…';render();
  var who=PS[cur];
  LT.spend(o.p,'csh_'+k).then(function(r){
    busy=false;
    if(!r||!r.ok){note=r&&r.err==='bad'&&o.p>1000?'Máy chủ chưa cho trừ trên 1000💎/lần — chạy lại cho_linh_thach_spend.sql trong Supabase.':r&&r.err==='poor'?'Không đủ Linh Thạch: cần '+o.p+'💎, bạn có '+nf(r.lt|0)+'💎':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+')';render();return}
    var d=who.csh||(who.csh={b10:0,b15:0,b20:0,ham:0,g10:0,dh:0,tc:0});d[k]=(d[k]|0)+1;
    note='✅ Đã mua '+o.e+' '+o.n+' (−'+o.p+'💎)';say('+1 '+o.e+' '+o.n,'#9fe8ff');save();render();
  }).catch(function(){busy=false;note='Không trừ được Linh Thạch (lỗi mạng)';render()});
}

/* ---------- rương bằng vàng ---------- */
function pickRar(){var tot=0,i;CFG.eqW.forEach(function(w){tot+=w});var x=Math.random()*tot;for(i=0;i<CFG.eqW.length;i++){x-=CFG.eqW[i];if(x<0)return i}return CFG.eqW.length-1}
function chest(t){
  if(t==='eq'){
    if(gold<CFG.chestEq){note='Không đủ vàng!';render();return}
    var cap=90;try{cap=capN()}catch(e){}
    if(BAG.length>=cap){note='🎒 Túi đã đầy — dọn túi rồi mở rương (chưa bị trừ vàng).';render();return}
    var r=pickRar(),it=gen(P.lv,r);
    gold-=CFG.chestEq;BAG.push(it);
    last='🎁 Mở rương: <b style="color:'+RC[it.r]+'">'+it.n+'</b> · '+RN[it.r]+' (đã vào túi)';
    say('🎁 '+it.n,RC[it.r]);
  }else{
    if(gold<CFG.chestOre){note='Không đủ vàng!';render();return}
    if(typeof MN==='undefined'||!MN.get){note='Chưa có kho quặng.';render();return}
    var k=Math.random()<.5?'fe':'hk',n=CFG.oreAmt[Math.floor(Math.random()*CFG.oreAmt.length)];
    gold-=CFG.chestOre;MN.get()[k]+=n;
    last='📦 Mở rương: <b>+'+n+' '+(k==='fe'?'🔩 Quặng Sắt':'🌑 Huyền Kim')+'</b>';
    say('+'+n+' '+(k==='fe'?'🔩':'🌑'),k==='fe'?'#cfc4b8':'#a58bff');
  }
  note='';save();render();try{ui()}catch(e){}
}

setInterval(function(){try{if(!open)return;var need=false;[].forEach.call(el.querySelectorAll('[data-tk]'),function(b){var l=left(b.getAttribute('data-tk'));b.textContent=clk(l);if(l<=0)need=true});if(need)render()}catch(e){}},1000);
window.CSH={useChoose:useChoose,pickFrom:pickFrom,pickTo:pickTo,pickOk:pickOk,pickClose:pickClose,holyBtn:holyBtn,ticket:useTicket,left:left,soul:soul,show:show,close:close,tab:setTab,buy:buy,chest:chest,arm:arm,cfg:CFG,
  count:cnt,
  use:function(k){if(cnt(k)<1)return false;D()[k]--;save();return true},
  give:function(k,n){n=n|0;if(n>0&&k in D()){D()[k]+=n;save()}}};
})();
