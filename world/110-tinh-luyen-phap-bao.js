/* ===== 🔮 TINH LUYỆN PHÁP BẢO (world/110-tinh-luyen-phap-bao.js) — Fix352 — nạp SAU world/109 (Tuyết Ngục) và world/48 (Pháp Bảo) =====
 * Nhà Số 2 ở Làng Tân Thủ 3 (TT3.houses[1], trước là "Tạm khoá"). Cần chạy tinh_luyen_phap_bao.sql 1 lần (sau tuyet_nguc.sql).
 *   • Dùng nguyên liệu Tuyết Ngục (❄ Tuyết Tinh · 🔷 Hàn Ngọc Tủy · 🌙 Huyết Nguyệt Hạch) + vàng + 💎 Linh Thạch để lên ★1…★5
 *     cho Pháp Bảo Bổn Mệnh đang đeo (world/48). Mỗi ★ cộng thuộc tính RIÊNG của pháp bảo, bằng CF.unit (0,8) cấp pháp bảo:
 *       🗡️ Kiếm Linh +sát thương · 🏺 Hồ Lô +sức mạnh quái/thú triệu hồi · 🚩 Hồn Phiên +DoT/choáng/băng · 🪓 Cự Phủ +bạo kích.
 *     (Hồn Phiên: "+% thời gian hiệu ứng" của world/48 nằm trong bản thân module 48 nên Tinh Luyện không cộng được.)
 *   • ★ là của TÀI KHOẢN, nằm trên máy chủ (tn_user.star); nguyên liệu trừ nguyên tử ở máy chủ (tn_refine). PS[cur].tl chỉ là bản nhớ đệm
 *     để chỉ số đúng ngay lúc vào game (trước khi tải xong); khi máy chủ trả lời thì máy chủ thắng.
 *   • Yêu cầu: có Pháp Bảo Bổn Mệnh (Đạo Thể) và cấp pháp bảo ≥ CF.cost[★].lv; đăng nhập ☁ (Linh Thạch).
 *   • Đổi số: CF (chi phí vàng/💎/cấp, hệ số) ở đây; chi phí NGUYÊN LIỆU phải khớp tinh_luyen_phap_bao.sql (tn_refine).
 * Móc: TT3.houses[1] (nhãn + open) · twB (cộng chỉ số qua SX) · dm + pstep (tăng sức mạnh thú triệu hồi cho Hồ Lô, cùng cách world/48) ·
 *   ZC.ui (1 dòng ★ dưới thẻ Pháp Bảo). Tất cả có try/catch; gỡ <script> thì nhà về "Tạm khoá" và chỉ số ★ mất (★ vẫn giữ trên máy chủ).
 * API: TLP.open() · TLP.close() · TLP.star() · TLP.cfg */
(function(){
'use strict';
if(window.TLP||typeof PS==='undefined'||typeof document==='undefined')return;

var COL='#d7c4ff',FONT='system-ui,sans-serif';
var CF=window.TLP_CF={
  max:5,unit:.8,
  /* mỗi ★: nguyên liệu (khớp SQL) · lt 💎 · gold 💰 · lv = cấp pháp bảo tối thiểu */
  cost:[null,
    {tt:10,hn:0, hh:0,lt:30, gold:10000000, lv:1},
    {tt:20,hn:5, hh:0,lt:60, gold:20000000, lv:2},
    {tt:30,hn:5, hh:0,lt:100,gold:40000000, lv:3},
    {tt:40,hn:10,hh:5,lt:150,gold:80000000, lv:4},
    {tt:50,hn:10,hh:5,lt:200,gold:150000000,lv:5}]
};
/* thuộc tính mỗi 1 cấp pháp bảo (giống stat() trong world/48) */
var U=[{dmgp:4},{pet:6},{dotd:8,stnc:1.5,frzc:1.5},{cdmg:6}];
var MAT={tt:{e:'❄',n:'Tuyết Tinh',c:'#bfe6ff'},hn:{e:'🔷',n:'Hàn Ngọc Tủy',c:'#7fb8ff'},hh:{e:'🌙',n:'Huyết Nguyệt Hạch',c:'#ff9ab0'}};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function f1(x){return String(Math.round(x*10)/10).replace('.',',')}
function say(s,c,y){try{DT.push({x:P.x,y:y||200,s:s,c:c||COL,l:150,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function G(){try{return typeof gold==='number'?gold:0}catch(e){return 0}}
function addG(n){try{gold+=n}catch(e){}}
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch'}
function errTx(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Tinh Luyện chưa kích hoạt trên máy chủ (cần chạy tinh_luyen_phap_bao.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='poor'?'Kho không đủ nguyên liệu':s==='max'?'Đã đạt ★'+CF.max:s==='bad'?'Yêu cầu không hợp lệ (dữ liệu ★ đã đổi, hãy mở lại)':'Không thực hiện được'}
function FB(){return window.FABAO||null}
function pbType(){try{var F=FB();return F&&F.type?F.type():-1}catch(e){return -1}}
function pbLv(){try{var F=FB();return F&&F.level?(F.level()|0):0}catch(e){return 0}}

/* ---------- ★ (máy chủ giữ; PS[cur].tl chỉ là bản nhớ đệm) ---------- */
var S={me:null,srv:null,busy:false,note:''};
function star(){
  if(S.srv!=null)return S.srv;
  try{var v=PS[cur].tl|0;return v<0?0:v>CF.max?CF.max:v}catch(e){return 0}}
function setSrv(n){
  n=Math.max(0,Math.min(CF.max,n|0));S.srv=n;
  try{if((PS[cur].tl|0)!==n){PS[cur].tl=n;sav()}}catch(e){}}
function fetchMe(){
  return rpc('tn_me').then(function(m){
    if(m&&m.status==='ok'){S.me=m;if(typeof m.star==='number')setSrv(m.star)}
    else if(!S.me)S.me=m;
    return m})}
/* tải ★ ngay khi vào game (không cần mở nhà): thử đến khi được */
(function(){var n=0,iv=setInterval(function(){
  try{if(typeof started!=='undefined'&&started&&online()){clearInterval(iv);fetchMe();return}}catch(e){}
  if(++n>150)clearInterval(iv)},2000)})();

/* ---------- cộng chỉ số ---------- */
function bon(k){
  var st=star();if(!st)return 0;
  var t=pbType();if(t<0)return 0;
  var u=U[t][k];return u?u*CF.unit*st:0}
if(typeof twB==='function'&&!twB.__tlp){
  var _tw=twB;
  twB=function(k){var v=_tw.apply(this,arguments);try{if(k==='dmgp'||k==='cdmg'||k==='dotd'||k==='stnc'||k==='frzc')v+=bon(k)}catch(e){}return v};
  twB.__tlp=1}
/* Hồ Lô: tăng sức mạnh quái/thú triệu hồi (chỉ trong pstep, cùng cách world/48) */
var PM=0;
if(typeof dm==='function'&&!dm.__tlp){
  var _dm=dm;
  dm=function(e,m,sl){try{if(PM&&pbType()===1){var st=star();if(st)m*=1+U[1].pet*CF.unit*st/100}}catch(x){}return _dm.call(this,e,m,sl)};
  dm.__tlp=1}
if(typeof window.pstep==='function'&&!window.pstep.__tlp){
  var _ps=window.pstep;
  window.pstep=function(){PM=1;try{return _ps.apply(this,arguments)}finally{PM=0}};
  window.pstep.__tlp=1}
/* dòng ★ dưới thẻ Pháp Bảo ở ô nhân vật */
try{
  if(window.ZC&&typeof ZC.ui==='function'&&!ZC.ui.__tlp){
    var _zu=ZC.ui;
    ZC.ui=function(){var h=_zu.apply(this,arguments);try{var st=star();if(st>0&&pbType()>=0&&typeof h==='string')h+='<div class="dt" style="margin-top:2px;color:'+COL+'">🔮 Tinh Luyện <b>'+new Array(st+1).join('★')+new Array(CF.max-st+1).join('☆')+'</b></div>'}catch(e){}return h};
    ZC.ui.__tlp=1}
}catch(e){}

function statTx(t,mult){
  return t===0?'+'+f1(U[0].dmgp*mult)+'% sát thương'
    :t===1?'+'+f1(U[1].pet*mult)+'% sức mạnh quái/thú triệu hồi'
    :t===2?'+'+f1(U[2].dotd*mult)+'% sát thương DoT · +'+f1(U[2].stnc*mult)+'% choáng · +'+f1(U[2].frzc*mult)+'% đóng băng'
    :t===3?'+'+f1(U[3].cdmg*mult)+'% sát thương bạo kích':'—'}
function stars(n){return new Array(n+1).join('★')+new Array(CF.max-n+1).join('☆')}

/* ---------- bảng Tinh Luyện ---------- */
var ov=null;
var BASE='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,4,16,.86);padding:12px;box-sizing:border-box;font-family:'+FONT+';color:#ece4ff';
var BOX='max-width:400px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #8a6ae0;border-radius:14px;background:rgba(16,10,30,.98);padding:14px';
function guard(el){['pointerdown','touchstart','keydown','keyup'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function need(have,n,e,nm,c){
  if(!n)return '';
  var ok=have>=n;
  return '<div style="display:flex;justify-content:space-between"><span>'+e+' <span style="color:'+c+'">'+nm+'</span></span><b style="color:'+(ok?'#9dffa0':'#ff9a9a')+'">'+nf(have)+' / '+n+'</b></div>'}
function html(){
  var m=S.me,ok=m&&m.status==='ok',st=star(),t=pbType(),l=pbLv(),F=FB(),def=(F&&F.defs&&t>=0)?F.defs[t]:null,h='';
  h+='<h2 style="margin:0 0 4px;color:'+COL+';font-size:19px">🔮 Tinh Luyện Pháp Bảo</h2>';
  h+='<div style="font-size:12.5px;opacity:.85;line-height:1.5">Dùng nguyên liệu <b>Tuyết Ngục</b> để tinh luyện Pháp Bảo Bổn Mệnh. Mỗi <b>★</b> cộng thuộc tính riêng của pháp bảo, tương đương <b>+'+f1(CF.unit)+' cấp</b>. Tối đa ★'+CF.max+'.</div>';
  if(!def){
    h+='<div style="margin:10px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">Cần có <b>Pháp Bảo Bổn Mệnh</b> (chỉ Đạo Thể — đã hợp đạo — mới có). Hãy chọn và luyện pháp bảo ở ô nhân vật trước.</div>'}
  else{
    h+='<div style="margin:10px 0 6px;padding:8px;border:1px solid #4a3a78;border-radius:10px;background:#120c22;font-size:13px;line-height:1.6"><span style="font-size:18px">'+def.i+'</span> <b style="color:'+def.col+'">'+def.n+'</b> · Cấp '+l+'/10<br>'
      +'<span style="font-size:17px;color:'+COL+'">'+stars(st)+'</span>'+(st?'<br><small style="opacity:.85">Đang cộng thêm: '+statTx(t,CF.unit*st)+'</small>':'<br><small style="opacity:.7">Chưa tinh luyện</small>')+'</div>'}
  if(!m){h+='<div style="margin:8px 0;font-size:13px;opacity:.8">⏳ Đang tải kho nguyên liệu...</div>'}
  else if(!ok){h+='<div style="margin:8px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">'+errTx(m)+'</div>'}
  if(ok&&st<CF.max){
    var k=st+1,c=CF.cost[k];
    h+='<div style="font-size:13px;margin-top:6px;padding:9px;border:1px solid #4a3a78;border-radius:10px;background:#0f0a1d;line-height:1.7"><div style="opacity:.85;margin-bottom:2px">Lên <b style="color:'+COL+'">★'+k+'</b>'+(def?' → thêm '+statTx(t,CF.unit):'')+'</div>'
      +need(m.tt|0,c.tt,MAT.tt.e,MAT.tt.n,MAT.tt.c)+need(m.hn|0,c.hn,MAT.hn.e,MAT.hn.n,MAT.hn.c)+need(m.hh|0,c.hh,MAT.hh.e,MAT.hh.n,MAT.hh.c)
      +'<div style="display:flex;justify-content:space-between"><span>💰 Vàng</span><b style="color:'+(G()>=c.gold?'#9dffa0':'#ff9a9a')+'">'+nf(c.gold)+'</b></div>'
      +'<div style="display:flex;justify-content:space-between"><span>💎 Linh Thạch</span><b>'+c.lt+'</b></div>'
      +'<div style="display:flex;justify-content:space-between"><span>Pháp bảo cấp tối thiểu</span><b style="color:'+(l>=c.lv?'#9dffa0':'#ff9a9a')+'">'+c.lv+' (hiện '+l+')</b></div></div>';
  }else if(ok&&st>=CF.max){h+='<div style="margin:8px 0;padding:9px;border:1px solid #6a5a2a;border-radius:10px;background:#1c180c;color:#ffe9a0;font-size:13px;text-align:center">✨ Pháp bảo đã đạt <b>★'+CF.max+'</b> — tinh luyện viên mãn</div>'}
  if(ok)h+='<div style="font-size:12.5px;margin-top:6px;padding:8px;border:1px solid #4a3a78;border-radius:10px;background:#0f0a1d">🎒 Kho: '+MAT.tt.e+' <b>'+nf(m.tt|0)+'</b> · '+MAT.hn.e+' <b>'+nf(m.hn|0)+'</b> · '+MAT.hh.e+' <b>'+nf(m.hh|0)+'</b><br><small style="opacity:.75">Nguyên liệu kiếm ở Tuyết Ngục (Nhà Số 1). ★ gắn với tài khoản.</small></div>';
  h+='<div id="tl-msg" style="min-height:18px;font-size:13px;color:#ffd98a;text-align:center;margin-top:6px">'+(S.note||'')+'</div>';
  var can=ok&&def&&st<CF.max&&!S.busy;
  h+='<button data-tl="go" '+(can?'':'disabled')+' style="width:100%;margin-top:6px;background:#6a46c8;color:#fff;border:1px solid #d7c4ff;border-radius:8px;padding:10px;font-weight:bold'+(can?'':';opacity:.45')+'">'+(S.busy?'⏳ Đang tinh luyện...':st>=CF.max?'Đã viên mãn':'🔮 Tinh Luyện ★'+(st+1))+'</button>'
    +'<button data-tl="x" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>';
  return h}
function render(){if(!ov||ov.style.display==='none')return;ov.firstChild.innerHTML=html()}
function open(){
  if(typeof started==='undefined'||!started)return;
  if(!ov){
    ov=document.createElement('div');ov.id='tl-ov';ov.style.cssText=BASE;guard(ov);
    ov.innerHTML='<div style="'+BOX+'"></div>';
    ov.addEventListener('click',function(e){
      var t=e.target,a=t.closest&&t.closest('[data-tl]');
      if(!a){if(t===ov)close();return}
      var k=a.dataset.tl;
      if(k==='x')close();else if(k==='go')go()});
    document.body.appendChild(ov)}
  S.note='';ov.style.display='flex';render();
  fetchMe().then(function(){render()})}
function close(){if(ov)ov.style.display='none'}

/* ---------- tinh luyện: kiểm tra → trừ 💎 + vàng → máy chủ trừ nguyên liệu & lên ★ (lỗi thì hoàn) ---------- */
function go(){
  if(S.busy)return;
  var m=S.me,st=star(),k=st+1;
  function msg(s){S.note=s;render()}
  if(!m||m.status!=='ok')return msg(errTx(m));
  if(k>CF.max)return;
  var c=CF.cost[k],t=pbType(),l=pbLv();
  if(t<0)return msg('Cần có Pháp Bảo Bổn Mệnh');
  if(l<c.lv)return msg('Pháp bảo cần đạt cấp '+c.lv+' (hiện cấp '+l+')');
  if((m.tt|0)<c.tt||(m.hn|0)<c.hn||(m.hh|0)<c.hh)return msg('Chưa đủ nguyên liệu — hãy hạ Tuyết Ngục để kiếm thêm');
  if(G()<c.gold)return msg('Không đủ vàng: cần '+nf(c.gold)+'💰');
  if(!ltOk())return msg(spErr({err:'login'}));
  S.busy=true;S.note='⏳ Đang trừ phí...';render();
  spend(c.lt,'tinh_luyen').then(function(r){
    if(!(r&&r.ok)){S.busy=false;return msg(spErr(r))}
    if(G()<c.gold){S.busy=false;try{LT.earnKS(c.lt)}catch(e){}return msg('Vàng không còn đủ — đã hoàn '+c.lt+'💎 (Linh Thạch khoá)')}
    addG(-c.gold);
    rpc('tn_refine',{p_to:k}).then(function(res){
      S.busy=false;
      if(res&&res.status==='ok'){
        setSrv(res.star|0);
        if(S.me&&S.me.status==='ok'&&res.tot){S.me.tt=res.tot.tt;S.me.hn=res.tot.hn;S.me.hh=res.tot.hh;S.me.star=res.star|0}
        sav();
        say('🔮 Tinh Luyện thành công! ★'+(res.star|0),COL,200);
        say(statTx(t,CF.unit*(res.star|0)),'#9dffa0',232);
        S.note='✨ Thành công! Pháp bảo đạt ★'+(res.star|0);render();return}
      addG(c.gold);try{LT.earnKS(c.lt)}catch(e){}sav();
      S.note=errTx(res)+' — đã hoàn vàng và '+c.lt+'💎 (Linh Thạch khoá)';
      fetchMe().then(function(){render()})})})}

/* ---------- gắn vào Nhà Số 2 Làng Tân Thủ 3 (TT3.houses[1]) ---------- */
function hook(){
  try{
    if(window.TT3&&TT3.houses&&TT3.houses[1]){
      var H=TT3.houses[1];H.l1='Tinh Luyện';H.l2='Pháp Bảo';H.full='Nhà Tinh Luyện Pháp Bảo';H.ch='煉';H.col='#8a6ae0';H.locked=0;H.open=function(){open()};return true}
  }catch(e){}
  return false}
if(!hook()){var tries=0,iv=setInterval(function(){if(hook()||++tries>40)clearInterval(iv)},500)}

window.TLP={cfg:CF,open:open,close:close,star:star};
})();
