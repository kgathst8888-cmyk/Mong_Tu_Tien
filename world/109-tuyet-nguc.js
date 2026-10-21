/* ===== ❄ TUYẾT NGỤC · PHỤ BẢN LV100 (world/109-tuyet-nguc.js) — Fix351 — nạp SAU world/108 =====
 * Nhà Số 1 ở Làng Tân Thủ 3 (TT3.houses[0], trước là "Tạm khoá"). Cần chạy tuyet_nguc.sql 1 lần trong Supabase.
 *   • Cần Lv100 (vào được Làng 3 là đủ). Boss thật: Tuyết Ngục Quân Chủ, 10 tầng. Muốn vào tầng N phải đã hạ tầng N-1.
 *   • Mỗi lượt vào tốn CF.fee.gold vàng + CF.fee.lt 💎 Linh Thạch (LT.spend, cần đăng nhập ☁). THUA / HẾT GIỜ / RỜI TRẬN = mất phí, không hoàn.
 *   • Tối đa 3 lượt/ngày/tài khoản (giờ VN, máy chủ giữ). Mỗi lượt CF.secs giây. Hạ boss mới nhận thưởng.
 *   • Thưởng: vàng + 3 nguyên liệu KHÓ KIẾM do MÁY CHỦ quay (tỉ lệ thấp, hạn mức theo ngày, có bảo hiểm rơi đồ):
 *       ❄ Tuyết Tinh · 🔷 Hàn Ngọc Tủy (từ tầng 3) · 🌙 Huyết Nguyệt Hạch (từ tầng 7). Kho nằm trên máy chủ (theo tài khoản).
 *     Nguyên liệu dùng cho Nhà Số 2 (Tinh Luyện Pháp Bảo, world/110) và Nhà Số 3 (Đan Phòng Cao Cấp, world/111, dùng ❄ làm chất dẫn). Đọc kho: TNG.mat().
 *   • Chưa chạy SQL → nhà báo "chưa kích hoạt", KHÔNG cho vào (không có chế độ luyện tập, vì phần thưởng nằm trên máy chủ).
 *   • Đổi số ở CF phải đổi cả hằng số trong tuyet_nguc.sql (xác suất / hạn mức / vàng thưởng / số lượt do máy chủ quyết định;
 *     CF chỉ dùng để HIỂN THỊ bảng tỉ lệ và để tính độ khó boss, phí vào).
 * Móc: TT3.houses[0] (nhãn + open) · dgTick/dgExit/init/dgHurt/dgHud/dgFoe/drop/bgd (cùng mẫu Phụ Bản Vàng world/42; chỉ xử lý khi dg.tng,
 *   còn lại chuyển tiếp). Dùng: gold · LT.spend / LT.earnKS (hoàn khi vào lỗi) · KCL.rpc · sv() — đều có try/catch. Gỡ <script> thì nhà quay về "Tạm khoá".
 * API: TNG.open() · TNG.close() · TNG.mat() → {tt,hn,hh} · TNG.refresh() */
(function(){
'use strict';
if(window.TNG||typeof PS==='undefined'||typeof document==='undefined')return;
if(typeof dgTick!=='function'||typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof dgExit!=='function'||typeof dgHud!=='function'||typeof dgFoe!=='function'||typeof init!=='function'||typeof drop!=='function')return;

var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',COL='#9fdcff';
var CF=window.TNG_CF={
  lv:100,tries:3,secs:240,maxTang:10,
  fee:{gold:5000000,lt:20},                              /* mỗi lượt vào */
  hpMul:function(t){return 8*Math.pow(1.2,t-1)},         /* máu boss so với Trùm Hầm Ngục (đã gồm BOSSUP): tầng 1 ×8 → tầng 10 ×41 */
  atkMul:function(t){return 6+.7*(t-1)},                 /* sát thương boss gây ra: tầng 1 ×6 → tầng 10 ×12,3 */
  rage:.3,rageMul:1.25,                                  /* dưới 30% máu: sát thương ×1,25 */
  gold:function(t){return 2000000+1000000*t},firstGold:5000000,
  /* chỉ để HIỂN THỊ — máy chủ mới là nơi quay thật (phải khớp tuyet_nguc.sql) */
  tt:{c0:.22,cs:.04,max:.6,two:.25,twoFrom:6,cap:4},
  hn:{c0:.06,cs:.015,from:3,pity:20,cap:2},
  hh:{c0:.015,cs:.005,from:7,pity:40,cap:1},
  first:{tt:2,hn5:1,hh10:1}
};
var MAT={tt:{e:'❄',n:'Tuyết Tinh',c:'#bfe6ff'},hn:{e:'🔷',n:'Hàn Ngọc Tủy',c:'#7fb8ff'},hh:{e:'🌙',n:'Huyết Nguyệt Hạch',c:'#ff9ab0'}};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function pc(x){x=Math.round(x*1000)/10;return String(x).replace('.',',')+'%'}
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
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Tuyết Ngục chưa kích hoạt trên máy chủ (cần chạy tuyet_nguc.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='limit'?'Hôm nay bạn đã hết '+CF.tries+' lượt':s==='locked'?'Phải hạ tầng '+((r.best|0))+' trước (tầng '+((r.best|0)+1)+' mới mở)':
    s==='bad'?'Tầng không hợp lệ':s==='norun'?'Không có lượt chơi đang mở':s==='expired'?'Lượt chơi đã quá hạn nên không nhận được thưởng':'Không thực hiện được'}

/* ---------- trạng thái bảng ---------- */
var S={me:null,tang:1,busy:false,note:''};
function best(){return S.me&&S.me.status==='ok'?(S.me.best|0):0}
function maxPick(){return Math.min(CF.maxTang,best()+1)}
function clampTang(){S.tang=Math.max(1,Math.min(maxPick(),S.tang|0||1))}
function applyMe(m){if(m&&m.status==='ok'){S.me=m;clampTang()}else S.me=m||{status:'net'}}
function refresh(){return rpc('tn_me').then(function(m){applyMe(m);render();return m})}

/* ---------- bảng chọn tầng ---------- */
var ov=null,ovR=null;
var BASE='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(4,8,16,.86);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#dcecff';
var BOX='max-width:400px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #6fa8d8;border-radius:14px;background:rgba(10,16,28,.98);padding:14px';
function guard(el){['pointerdown','touchstart','keydown','keyup'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function dropRows(t){
  var a=CF.tt,b=CF.hn,c=CF.hh,r='';
  r+='<div>'+MAT.tt.e+' <b style="color:'+MAT.tt.c+'">Tuyết Tinh</b>: '+pc(Math.min(a.max,a.c0+a.cs*(t-1)))+(t>=a.twoFrom?' (25% ra 2)':'')+' · tối đa '+a.cap+'/ngày</div>';
  r+='<div>'+MAT.hn.e+' <b style="color:'+MAT.hn.c+'">Hàn Ngọc Tủy</b>: '+(t>=b.from?pc(b.c0+b.cs*(t-b.from))+' · tối đa '+b.cap+'/ngày · bảo hiểm '+b.pity+' lần':'<span style="opacity:.6">mở từ tầng '+b.from+'</span>')+'</div>';
  r+='<div>'+MAT.hh.e+' <b style="color:'+MAT.hh.c+'">Huyết Nguyệt Hạch</b>: '+(t>=c.from?pc(c.c0+c.cs*(t-c.from))+' · tối đa '+c.cap+'/ngày · bảo hiểm '+c.pity+' lần':'<span style="opacity:.6">mở từ tầng '+c.from+'</span>')+'</div>';
  return r}
function firstTx(t){
  var f=CF.first,s='+'+nf(CF.firstGold)+'💰 · +'+f.tt+' '+MAT.tt.e;
  if(t===5)s+=' · +'+f.hn5+' '+MAT.hn.e;if(t===CF.maxTang)s+=' · +'+f.hh10+' '+MAT.hh.e;return s}
function html(){
  var m=S.me,ok=m&&m.status==='ok',t=S.tang,h='';
  h+='<h2 style="margin:0 0 4px;color:'+COL+';font-size:19px">❄ Tuyết Ngục · Phụ Bản Lv'+CF.lv+'</h2>';
  h+='<div style="font-size:12.5px;opacity:.85;line-height:1.5">Hạ <b>Tuyết Ngục Quân Chủ</b> trong <b>'+CF.secs+' giây</b> mới nhận thưởng. Hạ tầng này mới mở tầng kế. Mỗi ngày <b>'+CF.tries+' lượt</b> (đổi lúc 00:00).</div>';
  if(!m){h+='<div style="margin:10px 0;font-size:13px;opacity:.8">⏳ Đang tải...</div>'}
  else if(!ok){h+='<div style="margin:10px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">'+errTx(m)+'</div>'}
  else{
    var first=t>best();
    h+='<div style="display:flex;gap:6px;margin:10px 0 6px;font-size:12.5px"><div style="flex:1;border:1px solid #33506e;border-radius:9px;padding:6px;text-align:center">Lượt hôm nay<br><b style="font-size:16px;color:'+(m.left>0?'#9dffa0':'#ff9a9a')+'">'+(m.left|0)+'/'+CF.tries+'</b></div>'
      +'<div style="flex:1;border:1px solid #33506e;border-radius:9px;padding:6px;text-align:center">Tầng cao nhất đã hạ<br><b style="font-size:16px;color:#ffe9a0">'+best()+'/'+CF.maxTang+'</b></div></div>';
    h+='<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:6px 0">'
      +'<button data-tn="dn" '+(t<=1?'disabled':'')+' style="width:42px;padding:8px;border-radius:8px;border:1px solid #6fa8d8;background:#1d3550;color:#fff;font-size:16px'+(t<=1?';opacity:.4':'')+'">◀</button>'
      +'<div style="min-width:120px;text-align:center"><b style="font-size:20px;color:'+COL+'">Tầng '+t+'</b><br><small style="opacity:.75">'+(first?'chưa hạ · lần đầu có thưởng':'đã hạ · đánh lại để kiếm nguyên liệu')+'</small></div>'
      +'<button data-tn="up" '+(t>=maxPick()?'disabled':'')+' style="width:42px;padding:8px;border-radius:8px;border:1px solid #6fa8d8;background:#1d3550;color:#fff;font-size:16px'+(t>=maxPick()?';opacity:.4':'')+'">▶</button></div>';
    h+='<div style="font-size:12.5px;line-height:1.6;border:1px solid #33506e;border-radius:10px;padding:8px;background:#0b121e">'
      +'👹 Máu boss <b>×'+(Math.round(CF.hpMul(t)*10)/10)+'</b> Trùm Hầm Ngục · sát thương <b>×'+(Math.round(CF.atkMul(t)*10)/10)+'</b> · dưới 30% máu nổi giận<br>'
      +'💰 Hạ boss: <b>+'+nf(CF.gold(t))+'</b> vàng'+(first?' (lần đầu: '+firstTx(t)+')':'')+'</div>';
    h+='<div style="font-size:12.5px;line-height:1.6;margin-top:6px;padding:8px;border:1px solid #33506e;border-radius:10px;background:#0b121e"><div style="opacity:.8;margin-bottom:2px">Nguyên liệu rơi mỗi lần hạ (máy chủ quay):</div>'+dropRows(t)+'</div>';
    h+='<div style="font-size:12.5px;margin-top:6px;padding:8px;border:1px solid #33506e;border-radius:10px;background:#0b121e">🎒 Kho: '
      +MAT.tt.e+' <b>'+nf(m.tt|0)+'</b> · '+MAT.hn.e+' <b>'+nf(m.hn|0)+'</b> · '+MAT.hh.e+' <b>'+nf(m.hh|0)+'</b><br>'
      +'<small style="opacity:.75">Hôm nay đã nhận: '+MAT.tt.e+' '+(m.dtt|0)+'/'+CF.tt.cap+' · '+MAT.hn.e+' '+(m.dhn|0)+'/'+CF.hn.cap+' · '+MAT.hh.e+' '+(m.dhh|0)+'/'+CF.hh.cap+'</small></div>';
    h+='<div style="font-size:13px;margin-top:8px;text-align:center">Phí mỗi lượt: <b style="color:#ffe9a0">'+nf(CF.fee.gold)+'💰 + '+CF.fee.lt+'💎</b><br><small style="color:#ffb4a8">Thua, hết giờ hoặc rời trận: mất phí, không hoàn.</small></div>';
  }
  h+='<div id="tn-msg" style="min-height:18px;font-size:13px;color:#ffd98a;text-align:center;margin-top:6px">'+(S.note||'')+'</div>';
  var can=ok&&!S.busy&&(m.left|0)>0;
  h+='<button data-tn="go" '+(can?'':'disabled')+' style="width:100%;margin-top:6px;background:#2b6aa8;color:#fff;border:1px solid #9fdcff;border-radius:8px;padding:10px;font-weight:bold'+(can?'':';opacity:.45')+'">'+(S.busy?'⏳ Đang xử lý...':'⚔ Vào Tuyết Ngục · Tầng '+t)+'</button>'
    +'<button data-tn="x" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>';
  return h}
function render(){if(!ov||ov.style.display==='none')return;ov.firstChild.innerHTML=html()}
function open(){
  if(typeof started==='undefined'||!started)return;
  if((P.lv|0)<CF.lv){say('🔒 Cần Lv'+CF.lv+' để vào Tuyết Ngục','#ffb4a0');return}
  if(!ov){
    ov=document.createElement('div');ov.id='tn-ov';ov.style.cssText=BASE;guard(ov);
    ov.innerHTML='<div style="'+BOX+'"></div>';
    ov.addEventListener('click',function(e){
      var t=e.target,a=t.closest&&t.closest('[data-tn]');
      if(!a){if(t===ov)close();return}
      var k=a.dataset.tn;
      if(k==='x')close();
      else if(k==='up'){S.tang++;clampTang();S.note='';render()}
      else if(k==='dn'){S.tang--;clampTang();S.note='';render()}
      else if(k==='go')start()});
    document.body.appendChild(ov)}
  S.note='';ov.style.display='flex';render();refresh()}
function close(){if(ov)ov.style.display='none'}

/* ---------- vào trận: kiểm tra → trừ phí → mở lượt (lỗi thì hoàn) ---------- */
function start(){
  if(S.busy)return;
  var m=S.me,t=S.tang;
  if(!m||m.status!=='ok'){S.note=errTx(m);render();return}
  if(typeof dg!=='undefined'&&dg)return;
  if((m.left|0)<=0){S.note=errTx({status:'limit'});render();return}
  if(G()<CF.fee.gold){S.note='Không đủ vàng: cần '+nf(CF.fee.gold)+'💰';render();return}
  if(!ltOk()){S.note=spErr({err:'login'});render();return}
  S.busy=true;S.note='⏳ Đang kiểm tra...';render();
  rpc('tn_precheck',{p_tang:t}).then(function(p){
    if(!p||p.status!=='ok'){S.busy=false;S.note=errTx(p);refresh();return}
    S.note='⏳ Đang trừ phí...';render();
    spend(CF.fee.lt,'tuyet_nguc').then(function(r){
      if(!(r&&r.ok)){S.busy=false;S.note=spErr(r);render();return}
      if(G()<CF.fee.gold){S.busy=false;S.note='Vàng không còn đủ — đã trừ '+CF.fee.lt+'💎, hoàn lại (Linh Thạch khoá)';try{LT.earnKS(CF.fee.lt)}catch(e){}render();return}
      addG(-CF.fee.gold);
      rpc('tn_enter',{p_tang:t}).then(function(c){
        S.busy=false;
        if(c&&c.status==='ok'){
          S.me.left=c.left|0;sav();
          if(begin(t)){close();return}
          /* không vào được (ví dụ đang ở trạng thái khác): lượt đã trừ ở máy chủ → đóng lượt, hoàn phí */
          rpc('tn_fail',{});addG(CF.fee.gold);try{LT.earnKS(CF.fee.lt)}catch(e){}sav();
          S.note='Không vào được lúc này — đã hoàn vàng và '+CF.fee.lt+'💎 (Linh Thạch khoá)';refresh();return}
        addG(CF.fee.gold);try{LT.earnKS(CF.fee.lt)}catch(e){}sav();
        S.note='Không vào được: '+errTx(c)+' — đã hoàn vàng và '+CF.fee.lt+'💎 (Linh Thạch khoá)';refresh()})})})}

/* ---------- trận đấu ---------- */
function begin(t){
  if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return false;
  var l0=lg,v0=vil,t3=false;
  try{t3=!!(window.TT3&&TT3.on&&TT3.on())}catch(e){}
  try{if(t3)TT3.leave()}catch(e){}
  bo=0;try{bag.style.display='none'}catch(e){}
  lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
  try{if(typeof LCT!=='undefined'&&LCT.on())LCT.off()}catch(e){}
  dg={t:0,n:20,kill:20,tng:t,bt:0,tt:CF.secs*60,fin:0,out:0,res:null,lg0:l0,v0:v0,t3:t3};
  say('❄ Tuyết Ngục · Tầng '+t+' · hạ boss trong '+CF.secs+' giây!',COL,200);
  return true}
function spawnBoss(){
  var t=dg.tng;dgSp('boss');var e=E[E.length-1];if(!e||!e.dg)return false;
  var m=CF.hpMul(t);e.hp*=m;e.max*=m;e.tng=t;
  say('❄ Tuyết Ngục Quân Chủ xuất hiện!',COL,220);return true}

/* Fix370: chỉ coi là trận/boss Tuyết Ngục khi KHÔNG phải trận/boss Tháp (cờ tw) — tránh Tuyết Ngục chiếm nhầm boss tháp */
function isTN(o){return !!(o&&o.tng&&!o.tw)}
var RES=null;
function claim(w){
  rpc('tn_claim',{}).then(function(r){
    var res;
    if(r&&r.status==='ok'){
      addG(r.gold|0);sav();
      if(S.me&&S.me.status==='ok'){S.me.best=r.best|0;S.me.left=r.left|0;if(r.tot){S.me.tt=r.tot.tt;S.me.hn=r.tot.hn;S.me.hh=r.tot.hh}}
      res={win:1,tang:w.tng,gold:r.gold|0,first:!!r.first,g:r.g||{tt:0,hn:0,hh:0},left:r.left|0,best:r.best|0};
      say('💰 +'+nf(r.gold|0)+' vàng',COL,240);
      ['tt','hn','hh'].forEach(function(k,i){var n=(r.g&&r.g[k])|0;if(n>0)say(MAT[k].e+' +'+n+' '+MAT[k].n,MAT[k].c,270+i*32)})}
    else res={win:1,tang:w.tng,err:errTx(r)};
    w.res=res;RES=res;w.out=120;
    if(ovR&&ovR.style.display!=='none')renderRes()})}
function finish(w,why){
  if(w.fin)return;w.fin=1;w.why=why;
  if(why==='win'){
    w.out=99999;                                   /* giữ trận mở tới khi máy chủ trả thưởng */
    say('🏆 Hạ Tuyết Ngục Quân Chủ! Đang nhận thưởng...','#ffe08a',200);
    claim(w)}
  else{
    rpc('tn_fail',{});w.out=150;w.res={win:0,why:why,tang:w.tng};
    say(why==='error'?'⚠ Lỗi tạo boss — lượt đã trừ, hãy báo admin':(why==='dead'?'💀 Gục ngã! ':why==='leave'?'🚪 Rời trận! ':'⏱ Hết giờ! ')+'Mất phí, không có thưởng','#ffb4a8',200)}}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();try{dgHud()}catch(e){}
  if(w.t3){try{TT3.enter()}catch(e){}}}

/* ---------- bảng kết quả ---------- */
function renderRes(){
  var r=RES,h='',m=S.me,left=m&&m.status==='ok'?(m.left|0):0;
  if(!r||r.pending){h='<h2 style="margin:0 0 8px;color:'+COL+';font-size:19px">❄ Tuyết Ngục</h2><div style="margin:12px 0;font-size:13.5px">⏳ Đang nhận thưởng từ máy chủ...</div>'}
  else if(r.win&&r.err){h='<h2 style="margin:0 0 8px;color:#ffb4a8;font-size:19px">❄ Đã hạ boss nhưng chưa nhận được thưởng</h2><div style="margin:10px 0;font-size:13.5px;color:#ffd98a">'+r.err+'</div>'}
  else if(r.win){
    h='<h2 style="margin:0 0 8px;color:#9dffa0;font-size:19px">🏆 Hạ Quân Chủ · Tầng '+r.tang+'</h2>'
     +'<div style="margin:10px 0;padding:10px;border:1px solid #33506e;border-radius:10px;background:#0b121e;line-height:1.8;font-size:13.5px">💰 Vàng: <b style="color:#ffe9a0">+'+nf(r.gold)+'</b>'+(r.first?' <small>(gồm thưởng lần đầu)</small>':'')+'<br>';
    var any=0;['tt','hn','hh'].forEach(function(k){var n=(r.g&&r.g[k])|0;if(n>0){any=1;h+=MAT[k].e+' <b style="color:'+MAT[k].c+'">'+MAT[k].n+' +'+n+'</b><br>'}});
    if(!any)h+='<span style="opacity:.8">Lần này không rơi nguyên liệu.</span><br>';
    h+='<small style="opacity:.75">Kho: '+MAT.tt.e+' '+nf(m&&m.tt|0)+' · '+MAT.hn.e+' '+nf(m&&m.hn|0)+' · '+MAT.hh.e+' '+nf(m&&m.hh|0)+'</small></div>'}
  else{
    h='<h2 style="margin:0 0 8px;color:#ffb4a8;font-size:19px">❄ Thất bại · Tầng '+r.tang+'</h2>'
     +'<div style="margin:10px 0;font-size:13.5px;line-height:1.6">'+(r.why==='error'?'⚠ Không tạo được boss — hãy báo admin (lượt đã trừ)':r.why==='dead'?'💀 Bạn đã gục ngã':r.why==='leave'?'🚪 Bạn rời trận sớm':'⏱ Hết '+CF.secs+' giây')+'.<br><span style="color:#ffb4a8">Phí đã mất, không có thưởng.</span></div>'}
  h+='<div style="font-size:12.5px;opacity:.85;margin-bottom:6px">Còn <b>'+left+'/'+CF.tries+'</b> lượt hôm nay</div>'
    +'<button data-tn="again" style="width:100%;background:#2b6aa8;color:#fff;border:1px solid #9fdcff;border-radius:8px;padding:9px;font-weight:bold">Mở bảng Tuyết Ngục</button>'
    +'<button data-tn="x" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>';
  ovR.firstChild.innerHTML=h}
function showRes(r){
  if(typeof started==='undefined'||!started)return;
  RES=r||{pending:1};
  if(!ovR){
    ovR=document.createElement('div');ovR.id='tn-res';ovR.style.cssText=BASE;guard(ovR);
    ovR.innerHTML='<div style="'+BOX+'"></div>';
    ovR.addEventListener('click',function(e){
      var t=e.target,a=t.closest&&t.closest('[data-tn]');
      if(!a){if(t===ovR)ovR.style.display='none';return}
      ovR.style.display='none';
      if(a.dataset.tn==='again')open()});
    document.body.appendChild(ovR)}
  renderRes();ovR.style.display='flex';
  refresh()}

/* ---------- móc vào engine (chỉ xử lý khi dg.tng, còn lại chuyển tiếp) ---------- */
var _tick=dgTick;dgTick=function(){
  if(!isTN(dg))return _tick.apply(this,arguments);
  if(over||vil||!started)return;
  SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
  if(!dg.bs&&dg.t>45){dg.bs=1;dg.sp=spawnBoss()?1:0}
  if(dg.bs&&!dg.sp&&!dg.fin)finish(dg,'error');
  if(dg.bs&&dg.sp&&!dg.fin){
    var b=E.find(function(e){return isTN(e)});
    if(!b)finish(dg,'win');
    else if(++dg.bt>=dg.tt)finish(dg,'time')}
  if(dg.fin&&--dg.out<=0)dgExit()};
var _exit=dgExit;dgExit=function(){var w=isTN(dg)?dg:null;if(w&&!w.fin)finish(w,'leave');_exit.apply(this,arguments);if(w){back(w);showRes(w.res)}};
var _init=init;init=function(){var w=isTN(dg)?dg:null;if(w&&!w.fin)finish(w,'dead');_init.apply(this,arguments);if(w){back(w);showRes(w.res)}};
var _hurt=dgHurt;dgHurt=function(e,mu){
  if(isTN(e))mu*=CF.atkMul(e.tng)*(e.hp<e.max*CF.rage?CF.rageMul:1);
  return _hurt.call(this,e,mu)};
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);
  try{if(isTN(dg)){
    var b=E.find(function(e){return isTN(e)}),sec=Math.max(0,Math.ceil((dg.tt-dg.bt)/60)),pct=b?Math.max(0,Math.min(100,b.hp/b.max*100)):0;
    dgh.innerHTML='<div class="dgt" style="color:'+COL+'">❄ Tuyết Ngục · Tầng '+dg.tng+(dg.bs&&!dg.fin?' · ⏱ '+sec+'s':'')+'</div>'+(b?'<div class="dgp"><i style="width:'+pct+'%"></i></div>':'')}}catch(x){}};
var _drop=drop;drop=function(e){if(isTN(e))return;return _drop.apply(this,arguments)};   /* boss Tuyết Ngục KHÔNG rơi đồ Hầm Ngục — thưởng do máy chủ cấp */
var _foe=dgFoe;dgFoe=function(e){
  if(!isTN(e))return _foe.apply(this,arguments);
  var X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
  g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,'rgba(140,210,255,.6)');q.addColorStop(.5,'rgba(90,160,255,.27)');q.addColorStop(1,'rgba(60,120,255,0)');
  g.globalAlpha=.75+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
  g.save();try{if((window.QL|0)===0&&'filter' in g)g.filter='hue-rotate(160deg) saturate(1.1) brightness(1.1)'}catch(x){}_foe.apply(this,arguments);g.restore();
  g.save();g.font='bold '+Math.max(12,14*s)+'px '+FONT;g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
  var ty=GY-((e.y||0)+268)*s,tx='Tuyết Ngục Quân Chủ · Tầng '+e.tng;g.strokeText(tx,X,ty);g.fillStyle=COL;g.fillText(tx,X,ty);g.restore()};
var _bg=bgd;bgd=function(gy){
  if(isTN(dg)){try{
    xbg(gy,3);g.save();g.fillStyle='rgba(18,44,90,.46)';g.fillRect(0,0,W,H);
    if((window.QL|0)<2){g.fillStyle='rgba(235,245,255,.75)';
      for(var i=0;i<34;i++){var x=((i*97.3+fr*(.35+(i%5)*.12))%(W+40))-20,y=((i*61.7+fr*(.9+(i%4)*.35))%(H+20))-10,r=(1+(i%3))*Math.max(.7,s*.9);g.fillRect(x,y,r,r)}}
    g.restore();return}catch(e){}}
  return _bg.apply(this,arguments)};

/* ---------- gắn vào Nhà Số 1 Làng Tân Thủ 3 (TT3.houses[0]) ---------- */
function hook(){
  try{
    if(window.TT3&&TT3.houses&&TT3.houses[0]){
      var H=TT3.houses[0];H.l1='Tuyết Ngục';H.l2='Phụ Bản Lv'+CF.lv;H.full='Nhà Tuyết Ngục';H.ch='雪';H.col='#5aa8e8';H.locked=0;H.open=function(){open()};return true}
  }catch(e){}
  return false}
if(!hook()){var tries=0,iv=setInterval(function(){if(hook()||++tries>40)clearInterval(iv)},500)}

window.TNG={cfg:CF,open:open,close:close,refresh:refresh,me:function(){return S.me},mat:function(){var m=S.me;return m&&m.status==='ok'?{tt:m.tt|0,hn:m.hn|0,hh:m.hh|0}:{tt:0,hn:0,hh:0}}};
})();
