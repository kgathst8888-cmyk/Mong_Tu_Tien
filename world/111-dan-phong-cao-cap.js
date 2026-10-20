/* ===== 🧪 ĐAN PHÒNG CAO CẤP (world/111-dan-phong-cao-cap.js) — Fix353 — nạp SAU world/109 (Tuyết Ngục) và systems/08 (Linh Điền) =====
 * Nhà Số 3 ở Làng Tân Thủ 3 (TT3.houses[2], trước là "Tạm khoá"). Cần chạy dan_phong_cao_cap.sql 1 lần (sau tuyet_nguc.sql).
 *   • Luyện 3 loại ĐAN BUFF THỜI GIAN (không vĩnh viễn, không đụng giới hạn đan của Linh Điền). Mỗi viên dùng = +60 phút (cộng dồn, tối đa 3 giờ):
 *       🧊 Hàn Băng Đan        : +12% sát thương
 *       🛡 Ngọc Tủy Hộ Thể Đan : +15% máu · −6% sát thương nhận
 *       🌙 Nguyệt Hạch Bạo Đan : +20% sát thương chí mạng
 *     3 loại cộng được cùng lúc. Thời gian tính theo ĐỒNG HỒ THẬT (kể cả lúc offline).
 *   • Công thức mỗi viên: dược thảo Linh Điền (FM.get().herbs, có sẵn) + ❄ Tuyết Tinh làm chất dẫn (máy chủ trừ, tn_brew) + vàng + 💎 Linh Thạch.
 *     Cố ý dùng ít ❄ (1–2 viên) để không tranh nguyên liệu với Tinh Luyện Pháp Bảo (world/110), còn dược thảo dư của Linh Điền có chỗ tiêu.
 *   • Luồng: kiểm tra → trừ 💎 + vàng → máy chủ trừ ❄ → trừ dược thảo, +1 đan (lỗi bất kỳ thì hoàn vàng + 💎). Đan lưu PS[cur].dp = {n:{id:số viên}, u:{id:mốc hết hạn ms}}.
 *   • Đan nằm trong save người chơi (như đan Linh Điền): nguyên liệu quý (❄) do máy chủ giữ nên không thể tạo đan miễn phí qua luồng luyện.
 *   • Đổi số: CF (dược thảo/vàng/💎/hiệu lực/thời gian); chất dẫn ❄ phải khớp dan_phong_cao_cap.sql (tn_brew).
 * Móc: TT3.houses[2] (nhãn + open) · twB (cộng chỉ số qua SX). Có try/catch; gỡ <script> thì nhà về "Tạm khoá" (đan và thời gian còn lại vẫn giữ trong save).
 * Phụ thuộc: FM (systems/08, const toàn cục) · LT · KCL · gold · sv. API: DPC.open() · DPC.close() · DPC.left(id) (ms còn lại) · DPC.cfg */
(function(){
'use strict';
if(window.DPC||typeof PS==='undefined'||typeof document==='undefined')return;

var COL='#7fe3d0',FONT='system-ui,sans-serif';
var CF=window.DPC_CF={
  dur:60*60000,max:180*60000,                    /* mỗi viên +60 phút, tối đa 3 giờ */
  pills:[
    {id:'p1',e:'🧊',n:'Hàn Băng Đan',       c:'#9fdcff',b:{dmgp:12},        tx:'+12% sát thương',                  herbs:{hoa:12,chi:6}, tt:1,gold:3000000,lt:5},
    {id:'p2',e:'🛡',n:'Ngọc Tủy Hộ Thể Đan',c:'#7fb8ff',b:{hpp:15,dred:6},  tx:'+15% máu · −6% sát thương nhận',  herbs:{thao:12,dang:6},tt:1,gold:3000000,lt:5},
    {id:'p3',e:'🌙',n:'Nguyệt Hạch Bạo Đan',c:'#ff9ab0',b:{cdmg:20},        tx:'+20% sát thương chí mạng',        herbs:{sam:8,lien:12},tt:2,gold:5000000,lt:8}]
};
var MAT={tt:{e:'❄',n:'Tuyết Tinh',c:'#bfe6ff'}};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
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
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Đan Phòng chưa kích hoạt trên máy chủ (cần chạy dan_phong_cao_cap.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='poor'?'Kho không đủ Tuyết Tinh':s==='bad'?'Yêu cầu không hợp lệ':'Không thực hiện được'}
function fm(){try{return typeof FM!=='undefined'&&FM&&FM.get?FM:null}catch(e){return null}}
function herbs(){var f=fm();return f?(f.get().herbs||(f.get().herbs={})):null}
function hb(id){try{return fm().HM[id]||{n:id,e:'🌿',c:'#9fd070'}}catch(e){return {n:id,e:'🌿',c:'#9fd070'}}}

/* ---------- dữ liệu đan / thời gian ---------- */
function D(){var p=PS[cur];if(!p.dp||typeof p.dp!=='object')p.dp={n:{},u:{}};if(!p.dp.n)p.dp.n={};if(!p.dp.u)p.dp.u={};return p.dp}
function cnt(id){try{return D().n[id]|0}catch(e){return 0}}
function left(id){try{var u=+D().u[id]||0,l=u-Date.now();return l>0?l:0}catch(e){return 0}}
function mmss(ms){var s=Math.ceil(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}

/* ---------- cộng chỉ số (qua twB → SX) ---------- */
function bon(k){
  var t=0;
  for(var i=0;i<CF.pills.length;i++){var p=CF.pills[i];if(p.b[k]&&left(p.id)>0)t+=p.b[k]}
  return t}
if(typeof twB==='function'&&!twB.__dpc){
  var _tw=twB;
  twB=function(k){var v=_tw.apply(this,arguments);try{if(k==='dmgp'||k==='hpp'||k==='dred'||k==='cdmg')v+=bon(k)}catch(e){}return v};
  twB.__dpc=1}

/* ---------- bảng Đan Phòng ---------- */
var S={me:null,busy:false,note:''};
var ov=null;
var BASE='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(2,10,12,.86);padding:12px;box-sizing:border-box;font-family:'+FONT+';color:#dcf6f1';
var BOX='max-width:400px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #3a9a8c;border-radius:14px;background:rgba(8,20,22,.98);padding:14px';
function guard(el){['pointerdown','touchstart','keydown','keyup'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function ttHave(){return S.me&&S.me.status==='ok'?(S.me.tt|0):0}
function recipe(p){
  var H=herbs(),h='';
  Object.keys(p.herbs).forEach(function(id){var b=hb(id),n=p.herbs[id],have=H?(H[id]|0):0;
    h+='<span style="white-space:nowrap;margin-right:8px">'+b.e+' '+b.n+' <b style="color:'+(have>=n?'#9dffa0':'#ff9a9a')+'">'+have+'/'+n+'</b></span> '});
  h+='<span style="white-space:nowrap;margin-right:8px">'+MAT.tt.e+' '+MAT.tt.n+' <b style="color:'+(ttHave()>=p.tt?'#9dffa0':'#ff9a9a')+'">'+ttHave()+'/'+p.tt+'</b></span> ';
  h+='<span style="white-space:nowrap;margin-right:8px">💰 <b style="color:'+(G()>=p.gold?'#9dffa0':'#ff9a9a')+'">'+nf(p.gold)+'</b></span> <span style="white-space:nowrap">💎 <b>'+p.lt+'</b></span>';
  return h}
function html(){
  var m=S.me,ok=m&&m.status==='ok',h='';
  h+='<h2 style="margin:0 0 4px;color:'+COL+';font-size:19px">🧪 Đan Phòng Cao Cấp</h2>';
  h+='<div style="font-size:12.5px;opacity:.85;line-height:1.5">Luyện đan buff từ <b>dược thảo Linh Điền</b> + <b>Tuyết Tinh</b> làm chất dẫn. Mỗi viên dùng = <b>+'+(CF.dur/60000)+' phút</b> (cộng dồn tối đa '+(CF.max/3600000)+' giờ, tính theo giờ thật kể cả offline). 3 loại cộng được cùng lúc.</div>';
  if(!fm())h+='<div style="margin:10px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">Chưa có hệ Linh Điền nên không có dược thảo.</div>';
  if(!m)h+='<div style="margin:8px 0;font-size:13px;opacity:.8">⏳ Đang tải kho Tuyết Tinh...</div>';
  else if(!ok)h+='<div style="margin:8px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">'+errTx(m)+'</div>';
  CF.pills.forEach(function(p){
    var l=left(p.id),n=cnt(p.id);
    h+='<div style="margin-top:8px;padding:9px;border:1px solid '+(l>0?p.c:'#2f5a54')+';border-radius:10px;background:#0b1a1c">'
      +'<div style="display:flex;justify-content:space-between;align-items:center"><b style="color:'+p.c+';font-size:14.5px">'+p.e+' '+p.n+'</b><span style="font-size:12.5px">Có <b>'+n+'</b> viên</span></div>'
      +'<div style="font-size:12.5px;margin:2px 0">'+p.tx+(l>0?' · <b style="color:#9dffa0">còn '+mmss(l)+'</b>':' · <span style="opacity:.6">chưa có hiệu lực</span>')+'</div>'
      +'<div style="font-size:12px;line-height:1.7;opacity:.95">'+recipe(p)+'</div>'
      +'<div style="display:flex;gap:6px;margin-top:6px"><button data-dp="b" data-id="'+p.id+'" '+(S.busy?'disabled':'')+' style="flex:1;background:#1f7a6c;color:#fff;border:1px solid #7fe3d0;border-radius:8px;padding:8px;font-weight:bold'+(S.busy?';opacity:.45':'')+'">⚗ Luyện 1 viên</button>'
      +'<button data-dp="u" data-id="'+p.id+'" '+(n>0&&!S.busy?'':'disabled')+' style="flex:1;background:#7a5a1f;color:#fff;border:1px solid #ffd98a;border-radius:8px;padding:8px;font-weight:bold'+(n>0&&!S.busy?'':';opacity:.45')+'">💊 Dùng 1 viên</button></div></div>'});
  h+='<div style="font-size:12px;margin-top:8px;opacity:.8">🎒 Kho: '+MAT.tt.e+' <b>'+nf(ttHave())+'</b> '+MAT.tt.n+' · Tuyết Tinh kiếm ở Tuyết Ngục (Nhà Số 1).</div>';
  h+='<div style="min-height:18px;font-size:13px;color:#ffd98a;text-align:center;margin-top:6px">'+(S.note||'')+'</div>'
    +'<button data-dp="x" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>';
  return h}
function render(){if(!ov||ov.style.display==='none')return;var bx=ov.firstChild,st=bx.scrollTop;bx.innerHTML=html();try{bx.scrollTop=st}catch(e){}}   /* giữ vị trí cuộn khi đồng hồ cập nhật mỗi giây */
function pill(id){for(var i=0;i<CF.pills.length;i++)if(CF.pills[i].id===id)return CF.pills[i];return null}
function fetchMe(){
  return rpc('tn_me').then(function(m){
    if(m&&m.status==='ok')S.me=m;else if(!S.me||S.me.status!=='ok')S.me=m;
    return m})}
function open(){
  if(typeof started==='undefined'||!started)return;
  if(!ov){
    ov=document.createElement('div');ov.id='dp-ov';ov.style.cssText=BASE;guard(ov);
    ov.innerHTML='<div style="'+BOX+'"></div>';
    ov.addEventListener('click',function(e){
      var t=e.target,a=t.closest&&t.closest('[data-dp]');
      if(!a){if(t===ov)close();return}
      var k=a.dataset.dp,id=a.dataset.id;
      if(k==='x')close();else if(k==='b')brew(id);else if(k==='u')useOne(id)});
    document.body.appendChild(ov);
    setInterval(function(){if(ov&&ov.style.display!=='none'&&!S.busy)render()},1000)}
  S.note='';ov.style.display='flex';render();
  fetchMe().then(function(){render()})}
function close(){if(ov)ov.style.display='none'}

/* ---------- luyện đan: kiểm tra → trừ 💎 + vàng → máy chủ trừ ❄ → trừ dược thảo, +1 đan (lỗi thì hoàn) ---------- */
function brew(id){
  if(S.busy)return;
  var p=pill(id),m=S.me;
  function msg(s){S.note=s;render()}
  if(!p)return;
  if(!fm())return msg('Chưa có hệ Linh Điền');
  if(!m||m.status!=='ok')return msg(errTx(m));
  var H=herbs();
  for(var h in p.herbs)if((H[h]|0)<p.herbs[h])return msg('Thiếu dược thảo: cần '+p.herbs[h]+' '+hb(h).n+' (có '+(H[h]|0)+')');
  if((m.tt|0)<p.tt)return msg('Thiếu Tuyết Tinh: cần '+p.tt+' ❄ — hãy hạ Tuyết Ngục');
  if(G()<p.gold)return msg('Không đủ vàng: cần '+nf(p.gold)+'💰');
  if(!ltOk())return msg(spErr({err:'login'}));
  S.busy=true;S.note='⏳ Đang trừ phí...';render();
  spend(p.lt,'dan_phong').then(function(r){
    if(!(r&&r.ok)){S.busy=false;return msg(spErr(r))}
    if(G()<p.gold){S.busy=false;try{LT.earnKS(p.lt)}catch(e){}return msg('Vàng không còn đủ — đã hoàn '+p.lt+'💎 (Linh Thạch khoá)')}
    addG(-p.gold);
    var kind=CF.pills.indexOf(p)+1;
    rpc('tn_brew',{p_kind:kind}).then(function(res){
      S.busy=false;
      if(res&&res.status==='ok'){
        var H2=herbs();
        if(H2){for(var h2 in p.herbs)H2[h2]=Math.max(0,(H2[h2]|0)-p.herbs[h2])}
        D().n[p.id]=cnt(p.id)+1;
        if(S.me&&S.me.status==='ok'&&res.tot){S.me.tt=res.tot.tt;S.me.hn=res.tot.hn;S.me.hh=res.tot.hh}
        sav();say('⚗ Luyện thành '+p.n+'!',p.c,200);
        S.note='✨ Luyện thành 1 '+p.n;render();return}
      addG(p.gold);try{LT.earnKS(p.lt)}catch(e){}sav();
      S.note=errTx(res)+' — đã hoàn vàng và '+p.lt+'💎 (Linh Thạch khoá)';
      fetchMe().then(function(){render()})})})}

/* ---------- dùng đan: +dur, tối đa max ---------- */
function useOne(id){
  var p=pill(id);if(!p||S.busy)return;
  if(cnt(id)<=0){S.note='Hết '+p.n;render();return}
  var l=left(id);
  if(l>=CF.max-1000){S.note='Thời gian đã đầy ('+(CF.max/3600000)+' giờ), chờ bớt rồi dùng tiếp';render();return}
  var d=D();d.n[id]=cnt(id)-1;
  d.u[id]=Math.min(Date.now()+CF.max,Date.now()+l+CF.dur);
  sav();say('💊 '+p.n+' · '+p.tx,p.c,200);
  S.note='💊 Đã dùng '+p.n+' — còn '+mmss(left(id));render()}

/* ---------- gắn vào Nhà Số 3 Làng Tân Thủ 3 (TT3.houses[2]) ---------- */
function hook(){
  try{
    if(window.TT3&&TT3.houses&&TT3.houses[2]){
      var H=TT3.houses[2];H.l1='Đan Phòng';H.l2='Cao Cấp';H.full='Nhà Đan Phòng Cao Cấp';H.ch='丹';H.col='#3a9a8c';H.locked=0;H.open=function(){open()};return true}
  }catch(e){}
  return false}
if(!hook()){var tries=0,iv=setInterval(function(){if(hook()||++tries>40)clearInterval(iv)},500)}

window.DPC={cfg:CF,open:open,close:close,left:left};
})();
