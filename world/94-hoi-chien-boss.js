/* ===== ⚔ HỘI CHIẾN BOSS · CỔNG MỚI Ở THÔN TÂN THỦ (world/94-hoi-chien-boss.js) =====
 * Cổng mới đặt NGAY BÊN TRÁI Cổng Ma Thần (CF.gx). Chạm cổng → đi tới → mở bảng → "Vào Hội Chiến" → bản đồ boss chung.
 *
 * LỊCH (giờ Việt Nam, theo đồng hồ MÁY CHỦ): 00:00 · 03:00 · 06:00 … 21:00. Mỗi lần tồn tại 20 phút:
 *   0–5 phút   TẬP TRUNG (vào bản đồ chờ, chưa có boss)
 *   5–20 phút  BOSS xuất hiện (Ma Thần Huyết Ảnh) — nhiều người đánh CHUNG 1 thanh máu
 * KẾT QUẢ
 *   • Boss không bị hạ trong 15 phút → người có đóng góp nhận 3.000.000 vàng + 5 Linh Thạch khoá.
 *   • Boss bị hạ → 20 rương rơi trên đất (chạm để mở, 120 giây): mỗi người mở 1 rương = 1 trang bị THIÊN THẦN ngẫu nhiên.
 *       người kết liễu +20 Linh Thạch khoá · người sát thương cao nhất +20 Linh Thạch khoá.
 *     (Người đóng góp mà không mở được rương vẫn nhận phần "tham gia" như trên.)
 *
 * CÁCH HOẠT ĐỘNG (cần chạy hoi_chien_boss.sql 1 lần trong Supabase)
 *   - MỘT BOSS CHUNG: boss đứng cố định, đòn đánh (cột Ma Khí) sinh từ hạt giống + đồng hồ máy chủ nên mọi máy thấy cùng vị trí/đòn/thời điểm (xem wbAI).
 *   - Mỗi máy vẫn là 1 thực thể boss cục bộ để nhận sát thương, nhưng MÁU là chung:
 *     máy báo cho máy chủ phần máu boss mình vừa trừ (hcb_ping, ~2 giây/lần), máy chủ cộng dồn của mọi người và trả lại
 *     tổng máu còn lại → thanh máu giống nhau ở mọi máy. Máu boss dày hơn khi đông người (hệ số m do máy chủ chốt lúc boss ra).
 *   - Sát thương mỗi hit lên boss vẫn bị chặn như mọi boss (systems/67: tối đa 3% máu/hit); phần trừ vào máu chung = sát thương thật ÷ m.
 *   - Người chơi khác trong bản đồ được vẽ bằng hero() như Làng Online (tối đa 8 người gần nhất vẽ đầy đủ).
  *   - CHẾT → HỒI SINH NGAY TẠI BẢN ĐỒ: tối đa CF.rsMax (3) lần mỗi trận, đầy máu, về mép trái, bất tử 3 giây. Chết lần thứ 4 → về Làng Tân Thủ,
 *     không vào lại được trận đó (máy chủ đếm: cột deaths, hàm hcb_die / hcb_deaths). Chỉnh CF.rsMax + hcb_k('respawns') + rsHp / rsInv / rsX.
*   - Thưởng do máy chủ cấp 1 lần (hcb_claim): Linh Thạch khoá cộng thẳng vào cho_lock của nhân vật; vàng/trang bị cộng ở máy.
 *
 * Móc vào: gateDraw (vẽ cổng) · vstep (đi tới cổng) · dgTick/drop/dm/dgHud/mtExit/init (chỉ khi dg.wb) · pets/draw (vẽ người khác, rương).
 * Không sửa engine/Ma Thần: dùng lại NGUYÊN boss + bản đồ Ma Thần (mtSpawn/mtAI/mtBoom, cờ dg.mt) và thêm cờ riêng dg.wb / e.wb.
 * PHẢI nạp SAU world/97 (drop Thần Thoại) và systems/67 (tăng máu boss). Tắt: bỏ <script> trong index.html. API: window.HCB. */
(function(){
'use strict';
var need=['dgTick','mtSpawn','mtExit','init','gateDraw','gateX','gateY','vstep','dgHud','dgAI','dgHurt','draw','pets','dm','drop','gen','gcf','step'],i0;
for(i0=0;i0<need.length;i0++){try{if(typeof eval(need[i0])!=='function'){console.warn('[HCB] thiếu '+need[i0]);return}}catch(e){console.warn('[HCB] thiếu '+need[i0]);return}}
if(typeof PS==='undefined'||typeof g==='undefined'||typeof c==='undefined'||typeof E==='undefined')return;

var CF={
  gx:-150,                 /* lệch ngang so với Cổng Ma Thần (đơn vị làng) */
  gy:-6,                   /* lệch dọc (bội của s) */
  poll:2000,               /* nhịp báo máy chủ khi đang trong bản đồ (ms) */
  pollV:20000,             /* nhịp hỏi trạng thái khi ở Làng (ms) */
  chests:20,               /* khớp hcb_k('chests') */
  gold:3000000,ltC:5,ltK:20,ltT:20,   /* CHỈ để hiển thị mô tả; số thật do máy chủ trả (hoi_chien_boss.sql) */
  showMax:8,               /* số người chơi khác vẽ đầy đủ */
  rsMax:3,                 /* số lần hồi sinh tối đa mỗi trận (khớp hcb_k('respawns')); chết lần thứ rsMax+1 → về Làng */
  rsHp:1,                  /* hồi sinh với bao nhiêu % máu (1 = đầy) */
  rsInv:180,               /* bất tử sau khi hồi sinh (frame, 60 frame = 1 giây) */
  perP:2,                  /* Fix388: số rương mỗi người được mở (khớp hcb_k('per_p')) */
  rsX:120                  /* vị trí hồi sinh (mép trái bản đồ, xa boss) */
};
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var S={off:0,st:null,stAt:0,busy:false,nextAt:0,fail:0,err:'',acc:0,boss:null,hooked:false,lastHp:0,walk:-1,opening:false,
       oth:{},mine:{},myN:0,kc:0,claimBusy:false,vClaim:0,entering:false,note:'',noteT:0,evSeen:-1};
var gGo=0,ov=null,box=null,tmr=0,resEl=null;

/* ---------- tiện ích ---------- */
function nf(n){return(Math.round(Number(n))||0).toLocaleString('vi-VN')}
function clampN(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!=='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function inMap(){return !!(dg&&dg.wb)}
function say(t,col,y){try{DT.push({x:P.x,y:y||200,s:t,c:col||'#ffd98a',g:1,l:130})}catch(e){}}
function fmt(sec){sec=Math.max(0,Math.floor(sec));var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),q=sec%60;return(h?h+':'+(m<10?'0':''):'')+m+':'+(q<10?'0':'')+q}
function nowS(){return(Date.now()+S.off)/1000}
/* Fix388: lịch cố định 12:00 · 15:00 · 20:00 (giờ VN). ev = floor(giây-VN-bắt-đầu-lượt / 10800) → vẫn tăng dần, khớp SQL hcb_cur() */
var SCH=[43200,54000,72000];
function slotInfo(){var e=nowS()+25200,d=Math.floor(e/86400),sd=e-d*86400,i=2;
  if(sd<SCH[0])return{ev:Math.floor(((d-1)*86400+SCH[2])/10800),t:sd+86400-SCH[2],nx:SCH[0]-sd};
  while(sd<SCH[i])i--;
  return{ev:Math.floor((d*86400+SCH[i])/10800),t:sd-SCH[i],nx:(i===2?86400+SCH[0]:SCH[i+1])-sd}}
function slotT(){return Math.floor(slotInfo().t)}
function curEv(){return slotInfo().ev}
/* pha hiện tại suy từ đồng hồ (đã hiệu chỉnh theo máy chủ) + trạng thái boss đã biết */
function phase(){
  var t=slotT(),st=S.st;
  if(st&&st.ev===curEv()&&st.killed){var l=(st.left||0)-(Date.now()-S.stAt)/1000;return st.phase==='chest'&&l>0?'chest':'closed'}
  return t<300?'gather':t<1200?'boss':'closed'}
function leftIn(ph){var t=slotT();
  if(ph==='gather')return 300-t;if(ph==='boss')return 1200-t;
  if(ph==='chest'&&S.st)return(S.st.left||0)-(Date.now()-S.stAt)/1000;
  return slotInfo().nx}
function stateText(ph){
  ph=ph||phase();
  if(ph==='gather')return{a:'Tập trung · còn '+fmt(leftIn(ph)),b:'chạm để vào'};
  if(ph==='boss')return{a:'Boss xuất hiện! · còn '+fmt(leftIn(ph)),b:'chạm để vào'};
  if(ph==='chest')return{a:'Boss đã bị hạ · mở rương '+fmt(leftIn(ph)),b:'chạm để xem'};
  return{a:'Mở sau '+fmt(leftIn(ph)),b:'chạm để xem lịch'}}

/* ---------- gọi máy chủ ---------- */
function applyState(r){
  var prev=S.st;S.st=r;S.stAt=Date.now();
  if(r.sv)S.off=r.sv*1000-Date.now();
  /* người chơi khác */
  var seen={},w=vw();
  (r.oth||[]).forEach(function(o){
    var e=S.oth[o.id];seen[o.id]=1;
    if(!e){e=S.oth[o.id]={id:o.id,lx:o.x*w,tx:o.x*w,d:1,mv:0}}
    e.name=String(o.name||'Đạo Hữu');e.ci=o.ci|0;e.br=o.br|0;e.tier=o.tier|0;e.lv=o.lv|0;e.fx=clampN(+o.x||0,0,1)});
  for(var k in S.oth)if(!seen[k])delete S.oth[k];
  if(r.my){S.mine={};(r.my.mine||[]).forEach(function(q){S.mine[q]=1});S.myN=r.my.opened|0}
  /* đồng bộ boss cục bộ */
  if(inMap()&&S.boss&&S.hooked){
    track();
    if(r.killed)killBoss(S.boss);
    else{var e2=S.boss;setRaw(e2,Math.max(e2.max*(1-(r.dmg||0)/1e6)-S.acc*e2.max/1e6,1));S.lastHp=e2.hp}
  }
  if(r.killed&&r.joined&&!S.kc&&r.ev===S.evSeen){S.kc=1;claim().then(function(x){if(x)showResult(x)})}
}
async function ping(join){
  if(S.busy)return null;S.busy=true;
  var d=Math.floor(S.acc);S.acc-=d;var r=null;
  try{
    var ps=PS[cur]||{};
    r=await KCL.rpc('hcb_ping',{p_slot:cur|0,p_name:myName(),p_ci:cur|0,p_br:((ps.br==null?-1:ps.br)|0),p_tier:(ps.tier|0),
      p_lv:((P&&P.lv)|0)||1,p_x:inMap()?clampN(P.x/vw(),0,1):.5,p_dmg:d,p_join:!!join});
    if(r&&r.status==='ok'){S.fail=0;S.err='';applyState(r)}
    else{S.acc+=d;if(r&&r.status==='auth')S.err='Hết phiên đăng nhập ☁';r=null}
  }catch(e){
    S.acc+=d;S.fail++;r=null;var m=String(e&&e.message||e);
    S.err=/hcb_|function|schema|404/i.test(m)?'Máy chủ chưa cài Hội Chiến (chạy hoi_chien_boss.sql).':(e&&e.net?'Mất kết nối mạng.':'Hội Chiến: '+m.slice(0,60))}
  S.busy=false;
  S.nextAt=Date.now()+(inMap()?CF.poll:CF.pollV)*(1+Math.min(S.fail,5)*(/chưa cài/.test(S.err)?6:1));
  return r}
async function idle(){var n=0;while(S.busy&&n++<30)await new Promise(function(ok){setTimeout(ok,100)})}
async function claim(){
  if(!logged()||S.claimBusy)return null;S.claimBusy=true;var out=null;
  try{
    var r=await KCL.rpc('hcb_claim',{p_slot:cur|0});
    if(r&&r.status==='ok'){
      if((r.gold|0)>0){gold+=r.gold}
      if((r.lt|0)>0){try{window.LT&&LT.refresh&&LT.refresh()}catch(e){}}
      if((r.gold|0)>0||(r.lt|0)>0){try{sv()}catch(e){}out=r}}
  }catch(e){}
  S.claimBusy=false;return out}
function showResult(r){
  if(!r)return;
  var L=[];
  if((r.k|0)>0)L.push('🏆 Kết liễu Boss: <b>+'+(r.ltk!=null?r.ltk:CF.ltK*r.k)+'</b> 🔒 Linh Thạch khoá');
  if((r.t|0)>0)L.push('🥇 Sát thương cao nhất: <b>+'+(r.ltt!=null?r.ltt:CF.ltT*r.t)+'</b> 🔒 Linh Thạch khoá');
  if((r.c|0)>0)L.push('🎁 Phần thưởng tham gia: <b>+'+nf(r.gold)+'</b> 💰 · <b>+'+(r.ltc!=null?r.ltc:CF.ltC*r.c)+'</b> 🔒 Linh Thạch khoá');
  if(!L.length)return;
  try{if(resEl)resEl.remove()}catch(e){}
  resEl=document.createElement('div');
  resEl.style.cssText='position:fixed;left:50%;top:calc(90px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:99990;max-width:min(340px,92vw);background:linear-gradient(#2a1a3a,#150c20);border:2px solid #d8b25a;border-radius:12px;padding:10px 14px;color:#ffe9b8;font:13.5px/1.55 '+FONT+';text-align:center;box-shadow:0 6px 24px #000a';
  resEl.innerHTML='<div style="font-size:15px;color:#ffd36a;margin-bottom:4px">⚔ Hội Chiến Boss — Phần thưởng</div>'+L.join('<br>')+'<div style="opacity:.6;font-size:11px;margin-top:4px">chạm để đóng</div>';
  resEl.onpointerdown=function(e){e.stopPropagation();try{resEl.remove()}catch(x){}};
  document.body.appendChild(resEl);
  var el=resEl;setTimeout(function(){try{el.remove()}catch(e){}},12000)}

/* ---------- boss: máu chung ---------- */
function setRaw(e,v){e._raw=1;try{e.hp=v}finally{e._raw=0}}
function track(){var e=S.boss;if(!e||!S.hooked||e._dead)return;var h=e.hp;if(h<S.lastHp&&e.max>0)S.acc+=(S.lastHp-h)/e.max*1e6;S.lastHp=h;
  /* Fix388: máu cục bộ bị chặn ở 1 nên phần sát thương cuối (<1 đơn vị) không bao giờ được báo → máy chủ kẹt ở 99,99x% và boss không chết.
     Khi máu cục bộ đã chạm đáy, báo nốt toàn bộ phần máu còn lại theo máy chủ (máy chủ tự chặn trần & chỉ trừ tối đa phần còn lại). */
  if(h<=1.5&&e.max>0&&S.st){var need=1e6-(+S.st.dmg||0)+2;if(need>S.acc)S.acc=need}}
function hookBoss(e){
  var M=Math.max(1,+(S.st&&S.st.m)||1),h=e.hp;
  e._M=M;e._raw=0;e._dead=0;
  Object.defineProperty(e,'hp',{configurable:true,enumerable:true,
    get:function(){return h},
    set:function(v){v=+v;if(v!==v)return;
      if(v<h&&!e._raw)v=h-(h-v)/e._M;          /* mọi đòn trừ máu bị chia cho m: máu boss "dày" gấp m lần */
      if(v<1&&!e._dead)v=1;                     /* chỉ máy chủ mới quyết định boss chết */
      h=v}});
  S.hooked=true;
  var st=S.st;setRaw(e,Math.max(e.max*(1-((st&&st.dmg)||0)/1e6),1));S.lastHp=e.hp}
function killBoss(e){if(!e||e._dead)return;e._dead=1;e._raw=1;try{e.hp=0}finally{e._raw=0}}

var _dm=dm;dm=function(e,m,sl){
  if(!e||!e.wb||!e._M)return _dm.apply(this,arguments);
  var h0=e.hp,r;e._raw=1;
  try{r=_dm.apply(this,arguments)}finally{e._raw=0}   /* để systems/67 áp trần 3%/hit trên máu THẬT */
  var dealt=h0-e.hp;if(dealt>0&&!e._dead)setRaw(e,h0-dealt/e._M);
  return r};
var _drop=drop;drop=function(e){
  if(e&&e.wb){try{if(typeof mtBoom==='function')mtBoom(e)}catch(x){}return}        /* không rơi đồ/thưởng riêng: thưởng do máy chủ cấp */
  return _drop.apply(this,arguments)};


/* ---------- MỘT BOSS CHUNG: AI theo đồng hồ máy chủ (mọi máy thấy cùng vị trí, cùng đòn, cùng lúc) ----------
 * Boss đứng yên ở mép phải; mỗi chu kỳ (6 giây, sau 8 phút "cuồng nộ" còn 4,2 giây) giáng các cột Ma Khí xuống những điểm
 * LẤY TỪ HẠT GIỐNG (ev + số chu kỳ) → mọi người chơi thấy vòng cảnh báo và cột sét ở cùng 1 chỗ (theo tỉ lệ bề ngang), cùng thời điểm.
 * Ai đứng trong vòng khi cột giáng xuống thì mất máu (tính ở máy người đó). Chỉnh: CY. */
var CY={p:6,pe:4.2,enrage:480,warn:1.4,rad:140,mu:1,n:3,ne:5,step:.55};
function rngS(a){a>>>=0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function bossX(){return vw()-110}
function bossT(){return slotInfo().t-300}            /* giây kể từ lúc boss xuất hiện */
function cycOf(T){return T<CY.enrage?{n:Math.floor(T/CY.p),a:Math.floor(T/CY.p)*CY.p,k:CY.n}:{n:80+Math.floor((T-CY.enrage)/CY.pe),a:CY.enrage+Math.floor((T-CY.enrage)/CY.pe)*CY.pe,k:CY.ne}}
function cycAt(n){return n<80?{n:n,a:n*CY.p,k:CY.n}:{n:n,a:CY.enrage+(n-80)*CY.pe,k:CY.ne}}
function pillarsOf(n){var c=cycAt(n),r=rngS((S.evSeen|0)*7919+n*104729+17),L=[],j,f;
  for(j=0;j<c.k;j++){f=.1+.72*r();L.push({f:f,t:c.a+CY.warn+.2+j*CY.step})}return L}
function warnFx(X0,L){FX.push({x:X0,l:L,m:L,fn:function(f,p,X,gy){g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);
  g.fillStyle='rgba(255,70,200,'+(.08+.28*p).toFixed(3)+')';g.strokeStyle='rgba(255,140,230,'+(.5+.5*p).toFixed(3)+')';g.lineWidth=5;
  g.beginPath();g.arc(0,0,CY.rad*(.55+.45*p),0,6.283);g.fill();g.stroke();g.beginPath();g.arc(0,0,CY.rad,0,6.283);g.setLineDash([14,10]);g.stroke();g.restore()}})}
function strikeFx(X0){FX.push({x:X0,l:26,m:26,fn:function(f,p,X,gy){g.save();g.globalCompositeOperation='lighter';
  var q=g.createLinearGradient(0,gy-420*s,0,gy);q.addColorStop(0,'rgba(190,80,255,0)');q.addColorStop(1,'rgba(235,150,255,'+(1-p).toFixed(3)+')');
  g.fillStyle=q;var w=CY.rad*.62*s*(1-p*.4);g.fillRect(X-w,gy-420*s,w*2,420*s);g.restore()}})}
function wbAI(e){
  if(e.qa==null){e.qa=.75;e.qs=0;e.qt=0;e.fd=-1;e.k1=0;e.k2=0;e.qc=0;e.qtr=[];e.ln=0;e.qg=0;e.cast=0;e.qi=-1}
  if(!e._w){e._w={};e._s={}}
  e.in=0;e.y=58;e.sl=0;e.fl=0;e.cd=99;e.ph+=.3;e.mv=0;e.fd=-1;e.qs=0;e.hh=200;
  e.x=bossX();e.qa+=(.75-e.qa)*.15;e.ln*=.9;e.qg*=.9;
  if(!S.st||!S.st.joined||e._dead)return;
  var T=bossT(),c=cycOf(T),w=vw(),cast=0;
  for(var n=Math.max(0,c.n-1);n<=c.n;n++){
    pillarsOf(n).forEach(function(q,j){
      var key=n+':'+j,X0=clampN(q.f*w,60,w-60);
      if(!e._w[key]&&T>=q.t-CY.warn&&T<q.t){e._w[key]=1;warnFx(X0,Math.max(6,Math.round((q.t-T)*60)))}
      if(T<q.t&&T>=q.t-CY.warn)cast=Math.max(cast,.5+.5*(1-(q.t-T)/CY.warn));
      if(!e._s[key]&&T>=q.t){e._s[key]=1;
        if(T-q.t<.6){strikeFx(X0);try{dgFl=Math.max(dgFl,4)}catch(x){}
          if(Math.abs(P.x-X0)<CY.rad)dgHurt(e,CY.mu)}}})}
  e.cast=cast}
var _dgAI=dgAI;dgAI=function(e){if(e&&e.wb)return wbAI(e);return _dgAI.apply(this,arguments)};

/* ---------- vào / ra bản đồ ---------- */
async function enter(){
  if(S.entering)return;S.entering=true;
  try{
    if(!started||dg||over){S.note='Không thể vào lúc này';return}
    if(!logged()){S.note='Cần đăng nhập ☁ để vào Hội Chiến';return}
    await idle();
    var r=await ping(true);
    if(!r){S.note=S.err||'Không kết nối được máy chủ';return}
    if((r.phase!=='gather'&&r.phase!=='boss')||!r.joined){S.note=r.phase==='chest'?'Boss đã bị hạ, không thể vào thêm':'Hội Chiến chưa mở hoặc đã kết thúc';return}
    try{var dr=await KCL.rpc('hcb_deaths',{p_slot:cur|0});
      if(dr&&dr.status==='ok'){if(dr.out){S.note='Bạn đã hết '+CF.rsMax+' lượt hồi sinh ở trận này';return}S.rsN=dr.deaths|0}else S.rsN=0}
    catch(e){S.rsN=0}                                  /* máy chủ chưa cài hcb_deaths → không giới hạn kiểu cũ */
    closePanel();
    bo=0;try{bag.style.display='none'}catch(e){}
    var l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
    try{if(typeof LCT!=='undefined'&&LCT.on())LCT.off()}catch(e){}
    S.boss=null;S.hooked=false;S.acc=0;S.walk=-1;S.kc=0;S.mine={};((r.my&&r.my.mine)||[]).forEach(function(q){S.mine[q]=1});S.myN=(r.my&&r.my.opened)|0;S.evSeen=r.ev;S.oth={};
    dg={t:0,n:20,kill:20,mt:1,wb:1,lg0:l0,v0:v0,ev:r.ev};
    S.nextAt=Date.now()+CF.poll;
    DT.push({x:P.x,y:200,s:'⚔ Vào Hội Chiến Boss!',c:'#ffd36a',g:1,l:140});
  }finally{S.entering=false}}
function back(w){
  lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;
  try{P.x=cl(gx(),40,vw()-40)}catch(e){}
  try{P.hp=mx();P.mp=mm()}catch(e){}
  S.boss=null;S.hooked=false;S.acc=0;S.walk=-1;S.oth={};
  try{if(logged())KCL.rpc('hcb_leave',{p_slot:cur|0}).catch(function(){})}catch(e){}
  try{dgHud()}catch(e){}
  if(S.elim){S.elim=0;say('☠ Hết '+CF.rsMax+' lần hồi sinh — về Làng Tân Thủ','#ffb0a0',210)}}
var _mx=mtExit;mtExit=function(){var w=dg&&dg.wb?dg:null;_mx.apply(this,arguments);if(w)back(w)};
var _init=init;init=function(){var w=dg&&dg.wb?dg:null;_init.apply(this,arguments);if(w)back(w)};
async function finish(){
  var r=await claim();
  if(inMap())mtExit();
  if(r)showResult(r);
  else if(S.st&&S.st.my&&S.st.my.dmg>0&&!S.st.my.ok)say('Đóng góp chưa đủ để nhận thưởng tham gia','#ffb0a0');
  ping(false)}

/* ---------- CHẾT → HỒI SINH NGAY TẠI BẢN ĐỒ ĐỂ ĐÁNH TIẾP ----------
 * Engine khi nhân vật chết: over=120, E=[] (xoá luôn boss), PETS=[], rồi init() → bị đưa về Làng.
 * Ở Hội Chiến ta chặn việc đó ngay trong frame chết: khôi phục E/PETS, huỷ over, hồi máu, đặt về mép trái,
 * bất tử vài giây (CF.rsInv). Sát thương đã gây vẫn được máy chủ giữ nguyên, boss và thanh máu chung không đổi. */
S.inv=0;S.rsN=0;S.elim=0;
var _dhurt=dgHurt;dgHurt=function(){if(dg&&dg.wb&&S.inv>0)return;return _dhurt.apply(this,arguments)};
function respawn(pE,pPt,pPe){
  over=0;E=pE;PETS=pPt;P.pe=pPe;
  try{if(P.act)actEnd()}catch(e){}
  P.hp=Math.max(1,Math.round(mx()*CF.rsHp));P.mp=mm();P.x=CF.rsX;P.atk=0;P.mv=0;
  S.inv=CF.rsInv;
  say('✨ Hồi sinh! Còn '+Math.max(0,CF.rsMax-S.rsN)+'/'+CF.rsMax+' lần · bất tử '+Math.round(CF.rsInv/60)+' giây','#9fffd0',210)}
/* gọi khi vừa chết: đếm +1 (máy chủ ghi nhận); còn lượt → hồi sinh, hết lượt → để engine đưa về Làng */
function onDeath(pE,pPt,pPe){
  S.rsN++;
  try{if(logged())KCL.rpc('hcb_die',{p_slot:cur|0}).catch(function(){})}catch(e){}
  if(S.rsN<=CF.rsMax)respawn(pE,pPt,pPe);
  else S.elim=1}                                       /* over/init chạy như thường → back(w) đưa về Làng */
var _stepH=step;step=function(){
  if(!dg||!dg.wb)return _stepH.apply(this,arguments);
  var pE=E,pPt=PETS,pPe=P.pe,pO=over,r;
  if(S.inv>0)S.inv--;
  r=_stepH.apply(this,arguments);
  try{if(dg&&dg.wb&&!pO&&over>0&&P.hp<=1)onDeath(pE,pPt,pPe)}catch(x){try{console.error('[HCB respawn]',x)}catch(y){}}
  return r};

/* ---------- vòng cập nhật khi đang trong bản đồ ---------- */
function chestX(i){var n=CF.chests,w=vw();return 60+(w-120)*(n<2?.5:i/(n-1))}
function chestDY(i){return(i%2?16:0)}
var _tick=dgTick;dgTick=function(){
  if(!dg||!dg.wb)return _tick.apply(this,arguments);
  if(over||vil||!started)return;
  SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
  try{mapTick()}catch(x){try{console.error('[HCB]',x)}catch(y){}}};
function mapTick(){
  var now=Date.now(),st=S.st;
  track();
  if(!S.busy&&now>=S.nextAt)ping(true);
  /* boss xuất hiện */
  if(st&&st.joined&&st.phase==='boss'&&!dg.bs&&!st.killed&&!dg.done){
    dg.bs=1;mtSpawn();var e=E[E.length-1];if(e){e.wb=1;e.in=0;e.y=58;e.x=bossX();S.boss=e;S.hooked=false}}
  if(S.boss&&!S.hooked&&(S.boss._bup||!window.BOSSUP))hookBoss(S.boss);
  if(dg.bs&&!dg.done&&!E.some(function(q){return q.k=='boss'})){dg.done=1;if(st&&st.killed)say('🏆 Boss đã bị hạ! Chạm rương để mở','#ffe27a',230)}
  /* đi tới rương đã chạm */
  if(S.walk>=0&&st&&st.phase==='chest'){
    var tx=chestX(S.walk),dx=tx-P.x;
    if(Math.abs(dx)>10){var sp=Math.min(Math.abs(dx),6);P.x+=Math.sign(dx)*sp;P.d=Math.sign(dx);P.mv=1}
    else{P.mv=0;openChest(S.walk);S.walk=-1}}
  /* hết giờ → nhận thưởng, về làng (dự phòng theo đồng hồ nếu mất mạng) */
  if(!dg.fin){
    var end=(st&&st.ev===dg.ev&&st.phase==='closed')||(slotT()>=1200&&!(st&&st.killed))||curEv()!==dg.ev;
    if(end){dg.fin=1;finish()}}
}
var _hud=dgHud;dgHud=function(){
  if(!dg||!dg.wb)return _hud.apply(this,arguments);
  try{
    var st=S.st,ph=st?(slotT()<300&&!st.killed?'gather':st.phase):phase(),b=E.find(function(q){return q.k=='boss'});
    var h='<div class="dgt" style="color:#ffd36a">⚔ HỘI CHIẾN · MA THẦN HUYẾT ẢNH</div>';
    if(b&&b.max>0)h+='<div class="dgp"><i style="width:'+clampN(b.hp/b.max*100,0,100)+'%"></i></div>';
    var l=[];
    if(ph==='gather')l.push('⏳ Boss xuất hiện sau '+fmt(300-slotT()));
    else if(ph==='boss')l.push('⏳ Còn '+fmt(1200-slotT())+(st?' · 👥 '+(st.n|0):''));
    else if(ph==='chest')l.push('🎁 Rương còn '+fmt(leftIn('chest')));
    if(st&&st.my&&st.my.dmg>0)l.push('⚔ Bạn '+(st.my.dmg/1e4).toFixed(2)+'%'+(st.my.rank?' · hạng #'+st.my.rank:''));
    if(st&&st.top&&st.top.length&&!(st.my&&st.my.rank===1))l.push('🥇 '+esc(st.top[0].name)+' '+(st.top[0].dmg/1e4).toFixed(2)+'%');
    if(S.err)l.push('<span style="color:#ff9a8a">'+esc(S.err)+'</span>');
    h+='<div style="font:12px/1.4 '+FONT+';color:#ffe9b8;text-shadow:0 0 4px #000,0 0 4px #000">'+l.join('<br>')+'</div>';
    dgh.innerHTML=h}catch(x){}};

/* ---------- vẽ: người chơi khác + rương + chữ lớn ---------- */
function rdy(ci){var Rg=RIGI[ci];return !!(CHR[ci]&&Rg&&Rg.base&&Rg.base.im&&Rg.base.im.naturalWidth)}
function drawOther(e,full){
  var ci=e.ci;if(!CHR[ci]||!PS[ci])return;
  var dx=e.tx-e.lx;
  if(Math.abs(dx)>420)e.lx=e.tx;else if(Math.abs(dx)>.6){e.lx+=(dx<0?-1:1)*Math.min(Math.abs(dx),2.4);e.d=dx<0?-1:1;e.mv=1}else e.mv=0;
  var X=(e.lx-cam)*s;
  if(full&&rdy(ci)){
    var oP=P,oC=cur,oE=EQ,ps=PS[ci],oB=ps.br,oT=ps.tier;
    try{ps.br=e.br;ps.tier=e.tier;
      P=Object.assign({},oP,{x:e.lx,d:e.d,mv:e.mv,atk:0,atkT:1,pe:null,act:null,jy:0,jr:0,ln:'',hp:1,mp:1});
      cur=ci;EQ=EQS[ci]||[];hero()}catch(x){}finally{ps.br=oB;ps.tier=oT;P=oP;cur=oC;EQ=oE}
  }else{
    g.save();g.fillStyle='rgba(8,12,28,.3)';g.beginPath();g.ellipse(X,GY+2*s,14*s,4*s,0,0,6.283);g.fill();
    g.fillStyle=(CHR[ci].c||'#9ab')+'';g.globalAlpha=.7;g.beginPath();g.ellipse(X,GY-40*s,12*s,38*s,0,0,6.283);g.fill();g.restore()}
  var T=CHR[ci].t,ty=GY-(T=='m'?205:178)*s-(e.ly||0)*s,fs=Math.max(10,12*s);
  g.save();g.globalAlpha=1;g.font='bold '+fs+'px '+FONT;g.textAlign='center';g.textBaseline='alphabetic';
  g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';var tx='Lv.'+e.lv+' '+e.name;g.strokeText(tx,X,ty);g.fillStyle='#bfe6ff';g.fillText(tx,X,ty);g.restore()}
function drawOthers(){
  var all=Object.keys(S.oth).map(function(k){return S.oth[k]}),w=vw(),i;
  all.forEach(function(e){e.tx=clampN(e.fx*w,40,w-40);if(e.lx==null||isNaN(e.lx))e.lx=e.tx});
  all.sort(function(a,b){return a.lx-b.lx});
  for(i=0;i<all.length;i++)all[i].ly=(i%3)*14;
  var near=all.slice().sort(function(a,b){return Math.abs(a.lx-P.x)-Math.abs(b.lx-P.x)}),full={};
  for(i=0;i<near.length&&i<CF.showMax;i++)full[near[i].id]=1;
  all.forEach(function(e){drawOther(e,!!full[e.id])})}
function chestTaken(i){return !!(S.st&&S.st.chests&&S.st.chests.indexOf(i)>=0)}
function drawChest(i){
  var X=chestX(i)*s,Y=GY+chestDY(i)*s,mine=!!(S.mine&&S.mine[i]),tk=chestTaken(i)||mine,w=26*s,h=18*s,t=fr;
  g.save();g.translate(X,Y);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,2*s,w*.62,4*s,0,0,6.283);g.fill();
  if(!tk){g.globalCompositeOperation='lighter';var q=g.createRadialGradient(0,-h*.6,2,0,-h*.6,w*1.1);q.addColorStop(0,'rgba(255,220,120,'+(.45+.2*Math.sin(t*.08+i)).toFixed(2)+')');q.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=q;g.beginPath();g.arc(0,-h*.6,w*1.1,0,6.283);g.fill();g.globalCompositeOperation='source-over'}
  g.globalAlpha=tk?.55:1;
  g.fillStyle=tk?'#4a4440':'#8a5424';g.fillRect(-w/2,-h,w,h);
  g.fillStyle=tk?'#5a544e':'#a8692c';g.fillRect(-w/2,-h,w,h*.42);
  g.fillStyle=tk?'#6a6055':'#e8c35a';g.fillRect(-w/2-1*s,-h*.62,w+2*s,3*s);g.fillRect(-2*s,-h,4*s,h);
  if(tk){g.fillStyle='#17110c';g.fillRect(-w/2+2*s,-h-4*s,w-4*s,5*s)}
  else{g.fillStyle='#ffe27a';g.fillRect(-2.5*s,-h*.55,5*s,5*s);
    var sp=(t*.05+i*.7)%1;g.fillStyle='rgba(255,240,170,'+(1-sp).toFixed(2)+')';g.beginPath();g.arc((i%3-1)*8*s,-h-sp*22*s,1.6*s,0,6.283);g.fill()}
  g.globalAlpha=1;
  g.font='bold '+Math.max(9,10*s)+'px '+FONT;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';
  var lb=mine?'Của bạn':tk?'Đã mở':'🎁';g.strokeText(lb,0,-h-8*s);g.fillStyle=mine?'#9dffa0':tk?'#a8a090':'#ffe9a0';g.fillText(lb,0,-h-8*s);
  g.restore()}
function chestAt(px,py){
  for(var i=0;i<CF.chests;i++){var X=chestX(i)*s,Y=GY+chestDY(i)*s;if(Math.abs(px-X)<20*s&&py>Y-46*s&&py<Y+12*s)return i}
  return -1}
var _pets=pets;pets=function(){
  if(dg&&dg.wb){try{drawOthers();if(S.st&&S.st.phase==='chest')for(var i=0;i<CF.chests;i++)drawChest(i)}catch(x){try{console.error('[HCB draw]',x)}catch(y){}}}
  return _pets.apply(this,arguments)};
var _draw=draw;draw=function(){
  _draw.apply(this,arguments);
  try{
    if(dg&&dg.wb){
      var st=S.st,ph=st?(slotT()<300&&!st.killed?'gather':st.phase):phase(),tx='';
      if(ph==='gather')tx='⏳ Tập trung — Boss xuất hiện sau '+fmt(300-slotT());
      else if(ph==='chest'&&(S.myN|0)<CF.perP)tx='🎁 Chạm rương để mở ('+(S.myN|0)+'/'+CF.perP+') · còn '+fmt(leftIn('chest'));
      else if(ph==='chest')tx='🎁 Bạn đã mở đủ '+CF.perP+' rương · còn '+fmt(leftIn('chest'));
      if(tx){g.save();g.setTransform(DPR,0,0,DPR,0,0);g.font='bold '+Math.max(14,17*s)+'px '+FONT;g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.85)';
        var cx=W/2,cy=GY-(PORT?170:140)*s;g.strokeText(tx,cx,cy);g.fillStyle='#ffe27a';g.fillText(tx,cx,cy);g.restore()}}
  }catch(x){}};
c.addEventListener('pointerdown',function(e){
  if(!dg||!dg.wb||!S.st||S.st.phase!=='chest')return;
  var i=chestAt(e.offsetX,e.offsetY);
  if(i>=0){S.walk=i;e.stopPropagation()}},true);

/* Fix388: áp phần thưởng ngẫu nhiên do máy chủ tung (LT khoá đã được máy chủ cộng sẵn) */
function applyRw(L){
  var p=PS[cur],o=[];if(!p||!L)return;
  L.forEach(function(w,k){try{
    if(w.t==='lt'){o.push('🔒 +'+w.n+' Linh Thạch khoá');try{window.LT&&LT.refresh&&LT.refresh()}catch(e){}}
    else if(w.t==='da'){var kk=w.k==='b'?'b':'a';try{if(window.DCH){var dd=DCH.get();dd[kk]=(dd[kk]|0)+w.n}}catch(e){}o.push((kk==='b'?'💠 Đá Cường Hóa Cấp 2':'🪨 Đá Cường Hóa Cấp 1')+' ×'+w.n)}
    else if(w.t==='g'){gold+=w.n;o.push('💰 +'+nf(w.n)+' vàng')}
    else if(w.t==='mc'){if(typeof WFA==='function'){WFA(3,w.n|0||1);try{dgSave()}catch(e){}}o.push('🪽 Mảnh Cánh Cấp 4 ×'+(w.n|0||1))}
    else if(w.t==='lv'){if((p.wg|0)<4){p.wg=4;o.push('🪽 Long Vũ Thiên Thần Dực!')}else{gold+=10000000;o.push('🪽 Đã có Long Vũ → đổi 💰 +10.000.000')}}
    else if(w.t==='bua'){if(!p.csh)p.csh={b10:0,b15:0,b20:0,ham:0,g10:0,dh:0,dh2:0,tc:0};p.csh.bcr=(p.csh.bcr|0)+1;o.push('🛡 Bùa Chống Rơi ×1')}
  }catch(e){try{console.error('[HCB rw]',e)}catch(x){}}});
  o.forEach(function(t,k){say(t,'#ffe27a',266+k*22)});
  try{sv()}catch(e){}}
async function openChest(i){
  if(S.opening)return;S.opening=true;
  try{
    var st=S.st;
    if((S.myN|0)>=CF.perP){say('Bạn đã mở đủ '+CF.perP+' rương','#ffb0a0');return}
    if(chestTaken(i)){say('Rương này đã có người mở','#ffb0a0');return}
    if(!(st&&st.my&&st.my.ok)){say('Cần đóng góp đủ sát thương mới được mở rương','#ffb0a0');return}
    if(BAG.length>=capN()){say('🎒 Túi đầy! Dọn túi rồi chạm rương lại','#ffb0a0');return}
    var r=await KCL.rpc('hcb_chest',{p_slot:cur|0,p_idx:i});
    var s2=r&&r.status;
    if(s2==='ok'){
      S.mine[i]=1;S.myN=(r.opened|0)||((S.myN|0)+1);if(S.st){S.st.chests=(S.st.chests||[]).concat([i])}
      var it=gen(P.lv,5,undefined,4);
      if(BAG.length<capN()){BAG.push(it)}else{gold+=sell(it)}
      try{DT.push({x:chestX(i),y:200,s:'✨ '+SL[it.s][1]+' '+it.n,c:RC[5],l:200,g:1})}catch(e){}
      say('🎁 Mở rương: trang bị Thiên Thần!','#ff9ae8',240);
      applyRw(r.rw);
      try{sv()}catch(e){}
    }else if(s2==='taken'){if(S.st)S.st.chests=(S.st.chests||[]).concat([i]);say('Rương này vừa có người mở','#ffb0a0')}
    else if(s2==='had'){S.myN=CF.perP;say('Bạn đã mở đủ '+CF.perP+' rương','#ffb0a0')}
    else if(s2==='no_part')say('Cần đóng góp đủ sát thương mới được mở rương','#ffb0a0');
    else if(s2==='closed'||s2==='no_boss')say('Rương đã đóng','#ffb0a0');
    else say('Không mở được rương, thử lại','#ffb0a0');
  }catch(e){say('Mất kết nối, thử lại','#ffb0a0')}
  finally{S.opening=false}}

/* ---------- cổng ở Làng ---------- */
function gx(){return gateX()+CF.gx}
function gyy(){return gateY()+CF.gy*s}
function plainVil(){try{return !window.VWD||(VWD.plain?VWD.plain():true)}catch(e){return true}}
function drawMyGate(){
  if(!started||dg||!vil)return;
  var ph=phase(),x=gx()*s,y=gyy(),t=fr,RR=54*s*(2/3),RX=RR*.62,pu=.5+.5*Math.sin(t*.08),k=ph==='closed'?0:ph==='gather'?1:ph==='boss'?2:3;
  var col=['120,150,205','255,205,100','255,70,55','255,225,130'][k],ed=['#7f93b8','#ffd36a','#ff5a46','#ffe27a'][k],c2=[['#10162a','#1c2850','#070a16'],['#fff4d0','#d08a1a','#2a1604'],['#ffe6d0','#d02a1c','#2a0606'],['#fffbe0','#e0b030','#2a1c04']][k],i,a;
  g.save();g.globalCompositeOperation='lighter';
  var q=g.createRadialGradient(x,y,RR*.2,x,y,RR*(k?2.4:1.9));q.addColorStop(0,'rgba('+col+','+(k?.3+.25*pu:.2)+')');q.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=q;g.beginPath();g.arc(x,y,RR*(k?2.4:1.9),0,6.283);g.fill();
  if(k===2){var bw=(.5+.5*pu)*RR*.4+RR*.15;q=g.createLinearGradient(0,y-RR*3,0,y+RR*3);q.addColorStop(0,'rgba(255,120,80,0)');q.addColorStop(.5,'rgba(255,90,60,.5)');q.addColorStop(1,'rgba(255,120,80,0)');g.fillStyle=q;g.fillRect(x-bw,y-RR*3,bw*2,RR*6)}
  g.restore();
  g.save();g.translate(x,y);
  g.beginPath();g.ellipse(0,0,RX,RR,0,0,6.283);q=g.createRadialGradient(0,0,2,0,0,RR);q.addColorStop(0,c2[0]);q.addColorStop(.6,c2[1]);q.addColorStop(1,c2[2]);g.fillStyle=q;g.fill();
  g.lineWidth=5*s;g.strokeStyle=ed;g.shadowColor=ed;g.shadowBlur=k?8+10*pu:4;g.stroke();g.shadowBlur=0;
  g.strokeStyle='rgba(255,255,255,'+(k?.5:.25)+')';g.lineWidth=1.5*s;
  for(i=0;i<3;i++){g.beginPath();g.ellipse(0,0,RX*(.3+i*.22),RR*(.3+i*.22),t*(k?.06:.025)*(i%2?1:-1)+i,0,4.2);g.stroke()}
  for(i=0;i<12;i++){a=i/12*6.283+t*(k?.02:.008);var ex=Math.cos(a)*RX*1.22,ey=Math.sin(a)*RR*1.22,ex2=Math.cos(a)*RX*1.36,ey2=Math.sin(a)*RR*1.36;
    g.strokeStyle='rgba('+col+','+(.35+.5*(.5+.5*Math.sin(t*.1+i))).toFixed(2)+')';g.lineWidth=2*s;g.beginPath();g.moveTo(ex,ey);g.lineTo(ex2,ey2);g.stroke()}
  g.font=Math.round(RR*.62)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=k?1:.6;g.fillStyle='#fff';g.fillText('⚔',0,2*s);g.globalAlpha=1;
  g.restore();
  var tt=stateText(ph);
  g.save();g.font='bold '+Math.max(12,15*s)+'px '+FONT;g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
  g.strokeText('⚔ Hội Chiến',x,y-RR-14*s);g.fillStyle=k?'#ffe9a0':'#cfd8ee';g.fillText('⚔ Hội Chiến',x,y-RR-14*s);
  g.font=Math.max(10,12*s)+'px '+FONT;var by=y+RR+18*s+Math.sin(t*.1)*3;
  g.strokeText(tt.a,x,by);g.fillStyle=k===2?'#ffb0a0':k?'#fff0b8':'#a8b4d0';g.fillText(tt.a,x,by);
  g.restore()}
var _gd=gateDraw;gateDraw=function(){_gd.apply(this,arguments);try{drawMyGate()}catch(x){}};
c.addEventListener('pointerdown',function(e){
  gGo=0;if(!vil||bo||!started||dg||!plainVil())return;
  var px=e.offsetX/s,py=e.offsetY;
  if(Math.abs(px-gx())<38&&Math.abs(py-gyy())<57*s){vt=cl(gx(),40,vw()-40);vgo=-1;gGo=1}});
var _vs=vstep;vstep=function(){
  _vs.apply(this,arguments);
  if(gGo){if(mvDir)gGo=0;else if(vt==null){gGo=0;if(Math.abs(P.x-cl(gx(),40,vw()-40))<16)openPanel()}}
  /* hỏi trạng thái định kỳ khi ở Làng */
  if(vil&&started&&!dg&&plainVil()&&logged()&&!S.busy&&Date.now()>=S.nextAt)ping(false);
  /* lần đầu về Làng: nhận thưởng còn treo (nếu lần trước thoát giữa chừng) */
  if(vil&&started&&!dg&&logged()&&!S.vClaim){S.vClaim=Date.now()+6000}
  if(S.vClaim>1&&Date.now()>S.vClaim&&!S.claimBusy){S.vClaim=1;claim().then(function(r){if(r)showResult(r)})}};

/* ---------- bảng thông tin ---------- */
function closePanel(){clearInterval(tmr);tmr=0;if(ov)ov.style.display='none'}
function build(){
  if(ov)return;
  ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99980;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;padding:10px;box-sizing:border-box';
  ov.onpointerdown=function(e){if(e.target===ov){e.stopPropagation();closePanel()}};
  box=document.createElement('div');
  box.style.cssText='width:min(380px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(#2c1c3e,#140c1e);border:2px solid #d8b25a;border-radius:14px;padding:12px 14px;color:#f1e4c8;font:13.5px/1.55 '+FONT+';box-shadow:0 8px 30px #000b';
  box.onpointerdown=function(e){e.stopPropagation()};
  ov.appendChild(box);document.body.appendChild(ov)}
function panelHtml(){
  var ph=phase(),tt=stateText(ph),st=S.st,on=(ph==='gather'||ph==='boss');
  var col=ph==='boss'?'#ff9a8a':ph==='gather'||ph==='chest'?'#ffe27a':'#aab6d6';
  var h='<div style="text-align:center;font-size:18px;color:#ffd36a;letter-spacing:1px">⚔ HỘI CHIẾN BOSS</div>'
   +'<div style="text-align:center;font-size:12px;opacity:.75;margin-bottom:6px">Nhiều người chơi cùng đánh 1 Boss · mở 3 lần mỗi ngày</div>'
   +'<div style="text-align:center;border:1px solid #6a5a3a;border-radius:10px;padding:8px;margin:6px 0;background:#0e0a14"><div id="hcb-st" style="font-size:16px;color:'+col+'">'+esc(tt.a)+'</div>'
   +(st&&st.ev===curEv()&&(ph==='gather'||ph==='boss')?'<div style="font-size:12px;opacity:.8;margin-top:2px">👥 '+(st.n|0)+' người đang trong bản đồ · Boss còn '+clampN(100-(st.dmg||0)/1e4,0,100).toFixed(1)+'% máu</div>':'')
   +'</div>'
   +'<div style="font-size:12.5px;margin:6px 0"><b style="color:#ffd36a">📅 Lịch</b>: <b>12:00 · 15:00 · 20:00</b> (giờ VN).<br>Mỗi lần 20 phút: <b>5 phút tập trung</b> → <b>15 phút Boss xuất hiện</b>.</div>'
   +'<div style="font-size:12.5px;margin:6px 0"><b style="color:#ffd36a">🎁 Phần thưởng</b><br>'
   +'• Không hạ được Boss: <b>'+nf(CF.gold)+' 💰</b> + <b>'+CF.ltC+' 🔒 Linh Thạch khoá</b> (cho người có đóng góp).<br>'
   +'• Hạ được Boss: <b>'+CF.chests+' rương</b> rơi trên đất — chạm để mở, mỗi người mở được <b>'+CF.perP+' rương</b>. Mỗi rương = 1 trang bị <b style="color:#ff7ae0">Thiên Thần</b> + 2 phần thưởng ngẫu nhiên (🔒 Linh Thạch khoá 10–50 · 🪨 Đá cấp 1–2 · 💰 2–10 triệu · 🪽 Mảnh Cánh 4 5% · 🪽 Long Vũ Thiên Dực 5% · 🛡 Bùa Chống Rơi 2%).<br>'
   +'• Người <b>kết liễu</b> Boss: <b>+'+CF.ltK+' 🔒</b> · người <b>sát thương cao nhất</b>: <b>+'+CF.ltT+' 🔒</b> Linh Thạch khoá.</div>'
   +'<div id="hcb-msg" style="font-size:12.5px;color:#ffb0a0;min-height:16px;text-align:center">'+esc(S.note||'')+'</div>'
   +'<div style="display:flex;gap:8px;margin-top:8px"><button id="hcb-go" style="flex:1;padding:10px;border-radius:10px;border:1px solid #d8b25a;font:bold 14px '+FONT+';'
   +(on?'background:linear-gradient(#b8641c,#7a3a0c);color:#fff;cursor:pointer':'background:#2a2a34;color:#8a8a98')+'">'+(on?'⚔ Vào Hội Chiến':'⏳ Chưa mở')+'</button>'
   +'<button id="hcb-x" style="padding:10px 16px;border-radius:10px;border:1px solid #6a5a3a;background:#1c1424;color:#f1e4c8;font:14px '+FONT+'">Đóng</button></div>';
  return h}
function paint(){
  if(!box||!ov||ov.style.display==='none')return;
  var go=document.getElementById('hcb-go');
  /* chỉ làm mới các số đếm ngược mỗi giây; dựng lại cả bảng khi pha đổi */
  var sig=phase();
  if(box.__sig!==sig||!go){box.innerHTML=panelHtml();box.__sig=sig;bind()}
  else{var t=document.getElementById('hcb-st');if(t)t.textContent=stateText(sig).a}
}
function setMsg(t){S.note=t||'';var m=document.getElementById('hcb-msg');if(m)m.textContent=S.note}
function bind(){
  var go=document.getElementById('hcb-go'),x=document.getElementById('hcb-x');
  if(x)x.onclick=closePanel;
  if(go)go.onclick=async function(){
    var ph=phase();setMsg('');
    if(ph!=='gather'&&ph!=='boss'){setMsg('Chưa đến giờ mở Hội Chiến');return}
    go.disabled=true;S.note='';await enter();go.disabled=false;setMsg(S.note)}}
async function openPanel(){
  if(!started||dg||!vil)return;
  build();S.note='';
  if(!logged())S.note='Cần đăng nhập ☁ để tham gia';
  ov.style.display='flex';box.__sig=null;paint();
  clearInterval(tmr);tmr=setInterval(paint,1000);
  if(logged()){await idle();await ping(false);paint();claim().then(function(r){if(r)showResult(r)})}}

/* ---------- Fix326: thông báo trên màn hình HUD khi Hội Chiến Boss mở ----------
 * Hết 5 phút tập trung → boss ra: khi đến giờ mở, hiện bảng lớn giữa trên màn hình 12 giây, sau đó thu thành chip nhỏ (✕ để ẩn tới lần sau).
 * Hiện ở mọi nơi (Làng, map treo, phó bản...) trừ trong bản đồ Hội Chiến (đã có HUD riêng). Chạm để mở bảng cổng (đang ở Làng) hoặc nhắc đường đi. */
var an={el:null,ev:-1,hideAt:0,minEv:-1};
function anBuild(){
  if(an.el||!document.body)return;
  an.el=document.createElement('div');an.el.id='hcb-announce';
  an.el.style.cssText='position:fixed;top:calc(50px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:9991;max-width:92vw;box-sizing:border-box;border-radius:12px;border:2px solid #d8b25a;background:linear-gradient(#3a1c0c,#140806);color:#ffe9b0;font:600 12px/1.4 system-ui,sans-serif;text-align:center;box-shadow:0 4px 16px #000a;display:none;cursor:pointer;padding:7px 14px';
  an.el.addEventListener('click',function(e){
    var a=e.target&&e.target.getAttribute&&e.target.getAttribute('data-a');
    e.stopPropagation();
    if(a==='x'){an.minEv=curEv();anPaint();return}
    if(started&&!dg&&vil)openPanel();else say('Về Làng Tân Thủ — cổng Hội Chiến ở bên trái Cổng Ma Thần','#ffe27a',200)});
  document.body.appendChild(an.el)}
function anPaint(){
  var ok=false,ph='closed';
  try{ok=!!started&&logged()&&!inMap();if(ok)ph=phase()}catch(e){}
  if(!ok||(ph!=='gather'&&ph!=='boss')||an.minEv===curEv()){if(an.el)an.el.style.display='none';return}
  anBuild();if(!an.el)return;
  var tt=ph==='gather'?'Tập trung, còn '+fmt(leftIn(ph)):'Boss đã xuất hiện, còn '+fmt(leftIn(ph));
  an.el.style.display='block';
  if(Date.now()<an.hideAt)
    an.el.innerHTML='<div style="font-size:14px;color:#ffd36a">⚔️ HỘI CHIẾN BOSS ĐÃ MỞ!</div><div>'+tt+'</div><div style="font-weight:400;opacity:.85;font-size:11px">Chạm để xem · cổng ở Làng Tân Thủ</div>';
  else
    an.el.innerHTML='<span>⚔️ Hội Chiến · '+tt+'</span> <span data-a="x" style="padding:2px 6px;opacity:.7">✕</span>'}
function anTick(){
  try{
    if(started&&logged()&&!inMap()){
      var ph=phase();
      if((ph==='gather'||ph==='boss')&&an.ev!==curEv()){
        an.ev=curEv();an.hideAt=Date.now()+12000;
        if(ph==='gather')say('⚔️ Hội Chiến Boss đã mở!','#ffd36a',230)}}
    anPaint()}catch(e){}}
setInterval(anTick,1000);

window.HCB={pillars:pillarsOf,bossT:bossT,cfg:CF,state:function(){return S},phase:phase,open:openPanel,enter:enter,inMap:inMap,claim:claim,ping:ping};
})();
