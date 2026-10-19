/* ===== ⚔ CHIẾN TRƯỜNG TIÊN · MA (world/104-chien-truong-tien-ma.js) — Fix325 — nạp SAU world/100, world/103 =====
 * Nhà "Chiến Trường Tiên · Ma" ở Làng Tân Thủ 2 (TT2.houses[0]). Bản gọn, chạy offline (không cần SQL mới):
 *   • Chọn PHE: ☯ Tiên Phe hoặc 👹 Ma Phe. Đã chọn thì khoá CF.lockH giờ mới được đổi.
 *   • Vào trận tốn CF.lt 💎 Linh Thạch (qua LT.spend, cần đăng nhập ☁). Trận CF.dur giây trên 1 đường chiến (nhìn ngang).
 *   • Phe mình: BẠN + CF.allies đồng đội + Thủ Tướng. Phe địch: CF.foes cao thủ + Thủ Tướng. Lính nhỏ ra theo đợt mỗi CF.spawnEvery giây.
 *     Chỉ số mọi đơn vị tính theo chỉ số THẬT của bạn (atk()/df()/mx()) nên mọi cảnh giới đều đánh được.
 *   • Điểm phe: hạ cao thủ +ptsFoe, hạ lính +ptsMin. Thắng khi: phe mình đạt winPts điểm TRƯỚC · hạ Thủ Tướng địch · hết giờ mà điểm cao hơn.
 *   • Điều khiển: bạn tự đánh; nút ⚡ Đại Chiêu (AoE, hồi chiêu) · 💚 Hồi Phục (hồi chiêu) · 🏳 Rút lui (mất vé, không thưởng).
 *   • Thưởng: rương ngẫu nhiên, KHÔNG rơi trang bị — thắng 2 rương, thua 1 rương (thua không ra Mảnh Thánh). Tối đa CF.rewardDay trận có thưởng/ngày,
 *     Mảnh Thánh tối đa CF.shDay/ngày. Cộng 🏅 Chiến Công (điểm cá nhân) để làm bảng/cửa hàng sau.
 * Fix326 — PvP NGƯỜI THẬT: sau khi trả vé, máy khách vào hàng chờ (RPC ctm_join/ctm_sync trong chien_truong_tien_ma.sql, chạy 1 lần trong Supabase).
 *   Có CẢ 2 phe (tối đa 5/phe) và đã chờ >=10 giây → trận bắt đầu: mỗi máy tự điều khiển 1 anh hùng, gửi vị trí/HP/sát thương gây ra ~4 lần/giây,
 *   máy đối phương tự trừ máu của mình (như Đấu Trường LIVE). Fix327: dùng CHỈ SỐ THẬT (CTM_CF.pv.norm=false): atk()/df()/mx()/mm() + SX (crit, dred, dodge, hút máu/linh, sdmg, tốc đánh) + kỹ năng đã mở khoá (sát thương, hồi chiêu, linh lực, tầm) → gồm cả trang bị, pháp bảo, hồn phách, ý cảnh qua các hàm tính của game; norm=true để cân bằng chỉ số.
 *   Điểm phe = 3 × số lần ngã của phe địch; thắng khi phe đạt 30 điểm trước hoặc hết 150 giây điểm cao hơn (máy chủ giữ giờ + người thắng).
 *   Thưởng PvP do máy chủ cấp phép (ctm_claim: 1 lần/người/phòng, tối đa 6 trận/ngày): thắng 2 rương, hoà/thua 1 rương. Rời trận sớm = không thưởng.
 *   Không có đối thủ sau CF.pv.waitMax giây, chưa chạy SQL, hay mất kết nối lúc chờ → tự chuyển sang trận luyện tập với máy (bản Fix325), vé không mất.
 * Fix340 — TỐI ƯU + SỬA LỖI: ngừng vẽ thế giới phía dưới khi đang đánh (wrap draw, tự vẽ lại khi thoát) · nền chiến trường vẽ 1 lần rồi cache ·
 *   khung hình tối đa CF.pv.fps, DPR tối đa CF.pv.dpr · đồng bộ 300ms, không cấp phát mảng mỗi khung · bấm "Đánh với máy" lúc đang ghép không còn để lại người ma trong phòng ·
 *   bất tử CF.pv.inv giây sau khi hồi sinh/vào trận (chống bị giữ chân ở căn cứ) · đối thủ hồi sinh không còn "trượt" qua bản đồ · rời/ẩn màn hình > CF.pv.hideS giây → bị loại + báo rời trận ·
 *   nhận thưởng có timeout + tự thử lại 1 lần (máy chủ trả lại đúng kết quả cũ, không thưởng đôi) · kẹt đồng bộ tự gỡ sau 3 giây. SQL: xem chien_truong_tien_ma.sql (chạy lại bản mới).
 * Lưu: PS[cur].ctm = {side,lock,pts(Chiến Công),w,l,n,rd(ngày thưởng),rn(số trận thưởng hôm nay),sd(ngày nhận Mảnh Thánh)} (theo từng nhân vật).
 * Móc: chỉ TT2.houses[0].open (world/100). Dùng: gold · MN.get() (fe/hk quặng) · HL.addSH · LT.spend · sv() — đều có try/catch, gỡ module thì game vẫn chạy.
 * Chỉnh cân bằng: CF. Tắt: bỏ <script> trong index.html. API: CTM.open() · CTM.close() · CTM.reset() (xoá phe/khoá/ngày, để thử nghiệm). */
(function(){
'use strict';
if(window.CTM||typeof PS==='undefined'||typeof document==='undefined')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var CF=window.CTM_CF={
  lt:10,dur:150,winPts:60,lockH:24,rewardDay:5,shDay:1,
  allies:3,foes:4,spawnEvery:9,minionN:2,respawn:4,aggro:200,
  bossK:6,bossAtk:.6,allyK:.42,allyAtk:.32,foeK:.85,foeAtk:.55,minK:.2,minAtk:.14,
  ptsFoe:3,ptsMin:1,winBonus:20,loseBonus:5,
  ultCd:7,ultK:3,ultR:170,healCd:20,healK:.35,
  pv:{dur:150,winPts:30,ptsKill:3,norm:false,hp:5000,atk:420,red:.15,K:1,mpRegen:.05,sync:300,waitMax:24,fps:45,dpr:1.5,inv:2,hideS:4,claimMs:8000},
  chest:[{t:'gold',v:500000,w:42},{t:'gold',v:1000000,w:26},{t:'ore',v:300,w:9},{t:'ore',v:500,w:5},{t:'sh',v:1,w:1.5}]
};
var SIDE={
  tien:{n:'Tiên Phe',e:'☯',col:'#ffd76a',bg:'#3a2e08',g:'🏯',boss:'Tiên Tướng'},
  ma:{n:'Ma Phe',e:'👹',col:'#c05cff',bg:'#2a0a3a',g:'🏰',boss:'Ma Tướng'}
};
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:150})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function D(){try{var o=PS[cur];if(!o)return null;if(!o.ctm)o.ctm={side:'',lock:0,pts:0,w:0,l:0,n:0,rd:'',rn:0,sd:''};return o.ctm}catch(e){return null}}
function sA(){try{return Math.max(10,+atk()||100)}catch(e){return 100}}
function sD(){try{return Math.max(0,+df()||0)}catch(e){return 0}}
function sH(){try{return Math.max(100,+mx()||500)}catch(e){return 500}}
function R(){return Math.random()}
/* ---------- Linh Thạch ---------- */
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch'}

/* ================= LÕI TRẬN ĐÁNH (không đụng DOM) ================= */
var B=null;
function mk(team,type,x,o){
  var u={team:team,type:type,x:x,hp:o.hp,max:o.hp,atk:o.atk,spd:o.spd||55,rng:o.rng||46,cd:R()*.6,rate:o.rate||.9,r:o.r||13,nm:o.nm||'',g:o.g||'',dead:0,rs:0,fl:0};
  B.u.push(u);return u}
function setup(side){
  var A=sA(),H=sH(),sd=SIDE[side]||SIDE.tien,od=SIDE[side==='tien'?'ma':'tien'],i;
  B={side:side,t:CF.dur,sc:[0,0],u:[],fl:[],ln:[],rg:[],end:0,win:false,wave:3,ult:0,heal:0,me:null,mine:0,kills:0,L:1000,over:0};
  mk(0,'boss',55,{hp:H*CF.bossK,atk:A*CF.bossAtk,rng:125,rate:1.3,r:26,nm:sd.boss,g:sd.g});
  mk(1,'boss',945,{hp:H*CF.bossK,atk:A*CF.bossAtk,rng:125,rate:1.3,r:26,nm:od.boss,g:od.g});
  B.me=mk(0,'me',150,{hp:H,atk:A,spd:72,rng:52,rate:.8,r:16,nm:'Bạn',g:sd.e});
  for(i=0;i<CF.allies;i++)mk(0,'hero',185+i*30,{hp:H*CF.allyK,atk:A*CF.allyK,spd:62,rng:48,rate:.9,r:13,nm:'Đồng đội',g:sd.e});
  for(i=0;i<CF.foes;i++)mk(1,'hero',815-i*30,{hp:H*CF.foeK,atk:A*CF.foeAtk,spd:60,rng:48,rate:.95,r:13,nm:'Địch',g:od.e});
  return B}
function floatTxt(x,s,c){B.fl.push({x:x,y:0,s:s,c:c,l:.9})}
function endMatch(w){var b=B;if(b.end)return;b.end=1;b.win=(w===0);b.over=1.2}
function kill(a,t){
  var b=B,p=0;t.dead=1;t.hp=0;t.rs=CF.respawn;
  if(t.type==='boss'){endMatch(a.team);return}
  p=(t.type==='min')?CF.ptsMin:CF.ptsFoe;
  b.sc[a.team]+=p;
  if(a===b.me){b.mine+=p;b.kills++;floatTxt(t.x,'+'+p,'#ffe27a')}
  if(b.sc[a.team]>=CF.winPts)endMatch(a.team)}
function hit(a,t,mul,sk){
  var b=B,d=a.atk*(mul||1)*(.9+R()*.2);
  if(t.type==='rem'){
    var d0=Math.max(1,Math.round(d)),cr=false,pf=a.pf;
    if(pf){var K=Math.max(100,pf.atk*CF.pv.K);d0=pf.atk*(mul||1)*(.9+R()*.2)*K/(K+(t.df||0));cr=R()<pf.cp;if(cr)d0*=pf.cd;if(sk)d0*=1+pf.sdmg/100;d0=Math.max(1,Math.round(d0));
      if(pf.ls>0)a.hp=Math.min(a.max,a.hp+Math.min(d0*pf.ls/100,a.max*.1));if(pf.ms>0)a.mp=Math.min(a.mpm,a.mp+Math.min(d0*pf.ms/100,a.mpm*.1))}
    b.pv.dm[t.n]=(b.pv.dm[t.n]||0)+d0;t.hp=Math.max(0,t.hp-d0);t.fl=.12;floatTxt(t.x,(cr?'💥':'')+'-'+nf(d0),cr?'#ffe27a':'#ffffff');b.ln.push({a:a.x,b:t.x,l:.1,t:a.team});return}
  if(t===b.me){var A=sA(),Df=sD(),red=Math.min(.5,Df/(Df+A*4));d*=1-red}
  d=Math.max(1,Math.round(d));t.hp-=d;t.fl=.12;
  if(a===b.me||t===b.me)floatTxt(t.x,'-'+nf(d),t===b.me?'#ff8a8a':'#ffffff');
  b.ln.push({a:a.x,b:t.x,l:.1,t:a.team});
  if(t.hp<=0&&!t.dead)kill(a,t)}
function nearest(u){
  var best=null,bd=1e9,i,o,d;
  for(i=0;i<B.u.length;i++){o=B.u[i];if(o.dead||o.team===u.team)continue;d=Math.abs(o.x-u.x);if(d<bd){bd=d;best=o}}
  return best?{o:best,d:bd}:null}
function step(dt){
  var b=B,i,u,n,A,H,dir,k,foeBoss;
  if(!b)return;
  if(b.pv){stepPv(dt);return}
  if(b.end){b.over-=dt;return}
  b.t-=dt;b.ult=Math.max(0,b.ult-dt);b.heal=Math.max(0,b.heal-dt);
  b.wave-=dt;
  if(b.wave<=0){
    b.wave=CF.spawnEvery;A=sA();H=sH();
    for(k=0;k<2;k++)for(i=0;i<CF.minionN;i++)mk(k,'min',k?930-i*14:70+i*14,{hp:H*CF.minK,atk:A*CF.minAtk,spd:50,rng:32,rate:1,r:8,g:'',nm:'Lính'})}
  for(i=0;i<b.u.length;i++){
    u=b.u[i];
    if(u.fl>0)u.fl-=dt;
    if(u.dead){
      if(u.type==='hero'||u.type==='me'){u.rs-=dt;if(u.rs<=0){u.dead=0;u.hp=u.max;u.x=u.team?890:110;u.cd=.5}}
      continue}
    u.cd-=dt;
    n=nearest(u);
    if(n&&n.d<=u.rng){
      if(u.cd<=0){u.cd=u.rate;hit(u,n.o,1);if(b.end)return}
    }else if(u.type!=='boss'){
      dir=u.team?-1:1;
      if(n&&n.d<=CF.aggro)dir=(n.o.x>=u.x)?1:-1;
      u.x+=dir*u.spd*dt;
      if(u.x<20)u.x=20;if(u.x>980)u.x=980}
  }
  if(b.t<=0){b.t=0;endMatch(b.sc[0]>b.sc[1]?0:1)}
  for(i=b.fl.length-1;i>=0;i--){b.fl[i].l-=dt;b.fl[i].y+=dt*38;if(b.fl[i].l<=0)b.fl.splice(i,1)}
  for(i=b.ln.length-1;i>=0;i--){b.ln[i].l-=dt;if(b.ln[i].l<=0)b.ln.splice(i,1)}
  for(i=b.rg.length-1;i>=0;i--){b.rg[i].l-=dt;if(b.rg[i].l<=0)b.rg.splice(i,1)}
  for(i=b.u.length-1;i>=0;i--)if(b.u[i].dead&&b.u[i].type==='min')b.u.splice(i,1)}
function doUlt(){
  var b=B,i,u,us;if(!b||b.end||b.ult>0||b.me.dead)return;
  us=b.me.pf&&b.me.pf.ult;
  if(us){if(b.me.mp<us.m)return;castSk(us,null);b.ult=us.cdm;us.cd=us.cdm;return}
  b.ult=CF.ultCd;b.rg.push({x:b.me.x,r:CF.ultR,l:.5,m:.5});
  for(i=0;i<b.u.length;i++){u=b.u[i];if(u.dead||u.team===b.me.team)continue;if(Math.abs(u.x-b.me.x)<=CF.ultR){hit(b.me,u,CF.ultK);if(b.end)return}}}
function doHeal(){
  var b=B,m;if(!b||b.end||b.heal>0||b.me.dead)return;
  m=b.me;b.heal=CF.healCd;m.hp=Math.min(m.max,m.hp+m.max*CF.healK);floatTxt(m.x,'+'+nf(Math.round(m.max*CF.healK)),'#8affb0')}

/* ================= THƯỞNG ================= */
function pickChest(win,canSH){
  var list=CF.chest.filter(function(c){return c.t!=='sh'||(win&&canSH)}),t=0,i,r;
  for(i=0;i<list.length;i++)t+=list[i].w;
  r=R()*t;
  for(i=0;i<list.length;i++){r-=list[i].w;if(r<0)return list[i]}
  return list[0]}
function openChest(c){
  if(c.t==='gold'){gold+=c.v;return{m:'+'+nf(c.v)+' 💰'}}
  if(c.t==='ore'){var ok=false;try{var S=MN.get();S.fe=(S.fe|0)+c.v;S.hk=(S.hk|0)+c.v;ok=true}catch(e){}
    return{m:ok?'+'+nf(c.v)+' 🔩 Quặng Sắt · +'+nf(c.v)+' 🌑 Huyền Kim':'(không nhận được quặng)'}}
  var ok2=false;try{HL.addSH(c.v);ok2=true}catch(e2){}
  return{m:ok2?'+'+c.v+' 💠 Mảnh Thánh!!!':'(không nhận được Mảnh Thánh)',sh:ok2}}
function reward(win){
  var o=D(),out={rows:[],cc:0,capped:false},today=dayKey(),n,i,c,r;
  if(!o)return out;
  if(o.rd!==today){o.rd=today;o.rn=0}
  o.n=(o.n|0)+1;if(win)o.w=(o.w|0)+1;else o.l=(o.l|0)+1;
  out.cc=B.mine+(win?CF.winBonus:CF.loseBonus);
  o.pts=(o.pts|0)+out.cc;
  if(o.rn>=CF.rewardDay){out.capped=true}
  else{
    o.rn++;n=win?2:1;
    for(i=0;i<n;i++){
      c=pickChest(win,o.sd!==today);r=openChest(c);
      if(c.t==='sh'&&r.sh)o.sd=today;
      out.rows.push('🎁 Rương: '+r.m)}}
  sav();return out}

/* ================= GIAO DIỆN ================= */
var ORD=[],bgC=null,bgK='',lastD=0,worldHide=0,hidT=0,pvTimer=0,wTimer=0,ovW=null,skipFn=null,ovL=null,ovB=null,cv=null,cx=null,raf=0,lastT=0,busy=false,note='',res=null,btUlt=null,btHeal=null,W=0,H=0,dpr=1;
(function css(){var st=document.createElement('style');st.id='ctm-css';
 st.textContent='.ctm-bx{max-width:390px!important;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:'+FONT+'}'
 +'.ctm-cd{border:2px solid #4a3b3b;border-radius:10px;background:#1a1010;padding:8px 10px;margin:8px 0}'
 +'.ctm-cd.on{border-color:var(--c,#ffd76a);box-shadow:0 0 10px var(--c,#ffd76a)55}'
 +'.ctm-cd small{display:block;opacity:.85;margin-top:2px;line-height:1.4}'
 +'.ctm-bt{margin-top:6px;padding:7px 13px;border-radius:8px;border:1px solid #ffd76a;background:#3a2a10;color:#fff3d0;font-size:14px;font-family:inherit}'
 +'.ctm-bt.ma{border-color:#c05cff;background:#2a1040;color:#f0dcff}.ctm-bt.fg{border-color:#a05a5a;background:#321a1a}.ctm-bt[disabled]{opacity:.45}'
 +'.ctm-nt{min-height:18px;color:#ffe9a8;font-size:12px;margin:6px 0}'
 +'#ctm-bt{position:fixed;inset:0;z-index:100010;background:#05030a;font-family:'+FONT+';touch-action:none;user-select:none;-webkit-user-select:none}'
 +'#ctm-bt canvas{position:absolute;inset:0;width:100%;height:100%}'
 +'#ctm-bar{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;gap:10px;justify-content:center;padding:0 10px}'
 +'#ctm-bar button{flex:1;max-width:150px;padding:13px 6px;border-radius:12px;border:2px solid #ffd76a;background:#2a1c08ee;color:#fff3d0;font-size:15px;font-family:inherit}'
 +'#ctm-bar button[disabled]{opacity:.5}'
 +'#ctm-res{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000b;padding:16px}'
 +'#ctm-res>div{max-width:360px;width:100%;background:#1a1010;border:2px solid #ffd76a;border-radius:14px;padding:16px;color:#fff3d0;text-align:center}';
 document.head.appendChild(st)})();

function lockLeft(o){return Math.max(0,(o.lock|0)-Date.now())}
function fmtH(ms){var m=Math.ceil(ms/60000),h=Math.floor(m/60);return h>0?h+' giờ '+(m%60)+' phút':m+' phút'}
function renderLobby(){
  if(!ovL||!document.body.contains(ovL))return;
  var o=D(),h='<div class="tsm-bx ctm-bx"><h3>⚔ Nhà Chiến Trường Tiên · Ma</h3>',today=dayKey(),left,sd,k;
  if(!o){ovL.innerHTML=h+'<small>Chưa có nhân vật.</small><button class="ctm-bt" onclick="CTM.close()">Đóng</button></div>';return}
  left=lockLeft(o);sd=SIDE[o.side];
  h+='<small>Trận '+CF.dur+' giây · phe mình đạt '+CF.winPts+' điểm trước, hoặc hạ Thủ Tướng địch, hoặc hết giờ mà điểm cao hơn là THẮNG. Vé vào: '+CF.lt+'💎.</small><small>Có người thật cùng vào thì đấu PvP bằng '+(CF.pv.norm?'chỉ số cân bằng':'CHỈ SỐ THẬT (kỹ năng, trang bị, pháp bảo)')+', tối đa 5 người mỗi phe; không ai cùng vào trong '+CF.pv.waitMax+' giây thì luyện tập với máy.</small>';
  h+='<div class="ctm-nt">'+(note||'')+'</div>';
  if(sd&&left>0){
    h+='<div class="ctm-cd on" style="--c:'+sd.col+'"><b>'+sd.e+' Bạn đang ở '+sd.n+'</b><small>Đổi phe sau '+fmtH(left)+'.</small></div>'}
  else{
    h+='<div class="ctm-cd"><b>Chọn phe (khoá '+CF.lockH+' giờ)</b>'
      +'<button class="ctm-bt" '+(busy?'disabled ':'')+'onclick="CTM.pick(\'tien\')">☯ Tiên Phe</button> '
      +'<button class="ctm-bt ma" '+(busy?'disabled ':'')+'onclick="CTM.pick(\'ma\')">👹 Ma Phe</button></div>'}
  h+='<div class="ctm-cd"><small>🏅 Chiến Công: <b>'+nf(o.pts)+'</b> · Thắng '+nf(o.w)+' · Thua '+nf(o.l)+' · Tổng '+nf(o.n)+' trận</small>'
    +'<small>🎁 Trận có thưởng hôm nay: '+(o.rd===today?o.rn|0:0)+'/'+CF.rewardDay+' (thắng 2 rương, thua 1 rương, không rơi trang bị)</small></div>';
  h+='<button class="ctm-bt" '+(busy||!SIDE[o.side]?'disabled ':'')+'onclick="CTM.start()">⚔ Vào Chiến Trường ('+CF.lt+'💎)</button> '
    +'<button class="ctm-bt fg" onclick="CTM.close()">Đóng</button></div>';
  ovL.innerHTML=h}
function open(){
  closeBattle(true);
  var old=document.getElementById('ctm-ov');if(old)old.remove();
  ovL=document.createElement('div');ovL.id='ctm-ov';ovL.className='tsm-ov';ovL.style.setProperty('--tc','#ffd76a');
  ovL.addEventListener('click',function(e){if(e.target===ovL)close()});
  document.body.appendChild(ovL);note='';renderLobby()}
function close(){if(ovL){ovL.remove();ovL=null}}
function pick(side){
  var o=D();if(!o||busy||!SIDE[side])return;
  if(lockLeft(o)>0&&SIDE[o.side]){note='Phe đang bị khoá, chưa đổi được.';renderLobby();return}
  o.side=side;o.lock=Date.now()+CF.lockH*3600000;sav();
  note='✅ Đã gia nhập '+SIDE[side].n+'!';say(SIDE[side].e+' Gia nhập '+SIDE[side].n,SIDE[side].col);renderLobby()}

/* ---------- vào trận ---------- */
function start(){
  var o=D();if(!o||busy||B&&!B.end&&ovB)return;
  if(!SIDE[o.side]){note='Hãy chọn phe trước.';renderLobby();return}
  if(!ltOk()){note=spErr({err:'login'});renderLobby();return}
  busy=true;note='⏳ Đang vào chiến trường...';renderLobby();
  spend(CF.lt,'chien_truong_tien_ma').then(function(r){
    busy=false;
    if(!(r&&r.ok)){note=spErr(r);renderLobby();return}
    close();queue(o.side)})}
function beginBattle(side){setup(side);mkUi()}
function mkUi(){
  res=null;
  ovB=document.createElement('div');ovB.id='ctm-bt';
  cv=document.createElement('canvas');ovB.appendChild(cv);cx=cv.getContext('2d');
  var bar=document.createElement('div');bar.id='ctm-bar';
  btUlt=document.createElement('button');btHeal=document.createElement('button');
  var bq=document.createElement('button');bq.textContent='🏳 Rút lui';
  btUlt.addEventListener('click',doUlt);btHeal.addEventListener('click',doHeal);
  bq.addEventListener('click',function(){
    var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
    ask('Rút lui khỏi chiến trường? Vé đã dùng sẽ không được hoàn và không có thưởng.',function(){closeBattle(true);open()})});
  bar.appendChild(btUlt);bar.appendChild(btHeal);bar.appendChild(bq);ovB.appendChild(bar);
  ['pointerdown','touchstart','click'].forEach(function(ev){ovB.addEventListener(ev,function(e){e.stopPropagation()})});
  document.body.appendChild(ovB);
  worldHide=1;lastD=0;bgC=null;
  resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',onVis);
  lastT=performance.now();raf=requestAnimationFrame(loop)}
function onVis(){
  if(document.hidden){if(hidT)clearTimeout(hidT);hidT=setTimeout(function(){hidT=0;if(document.hidden&&B&&B.pv&&!B.end)abortPv('Bạn đã rời màn hình trận đấu nên bị loại khỏi trận.')},CF.pv.hideS*1000)}
  else{if(hidT){clearTimeout(hidT);hidT=0}lastT=performance.now()}}
function closeBattle(silent){
  if(raf)cancelAnimationFrame(raf);raf=0;
  if(pvTimer){clearInterval(pvTimer);pvTimer=0}
  if(B&&B.pv&&!B.end){try{KCL.rpc('ctm_leave',{p_room:B.pv.room}).catch(function(){})}catch(e){}}
  stopWait();
  window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);
  if(hidT){clearTimeout(hidT);hidT=0}
  worldHide=0;bgC=null;
  if(ovB){ovB.remove();ovB=null}
  cv=null;cx=null;B=null;res=null}
function resize(){
  if(!cv)return;
  dpr=Math.min(CF.pv.dpr,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cx.setTransform(dpr,0,0,dpr,0,0);bgC=null}
function loop(t){
  if(!ovB||!B)return;
  var dt=Math.min(.05,(t-lastT)/1000||0);lastT=t;
  step(dt);
  if(t-lastD>=1000/CF.pv.fps-2){lastD=t;drawB();hud()}
  if(B.end&&B.over<=0&&!res){showResult();return}
  raf=requestAnimationFrame(loop)}
function hud(){
  if(!btUlt||!B)return;
  var us=B.me.pf&&B.me.pf.ult;
  btUlt.textContent=B.ult>0?'⚡ '+Math.ceil(B.ult)+'s':'⚡ '+(us?us.n.slice(0,8):'Đại Chiêu');btUlt.disabled=B.ult>0||B.end||B.me.dead||(us&&B.me.mp<us.m);
  btHeal.textContent=B.heal>0?'💚 '+Math.ceil(B.heal)+'s':'💚 Hồi Phục';btHeal.disabled=B.heal>0||B.end||B.me.dead}
function showResult(){
  if(B.pv){showResultPv();return}
  var w=B.win,r=reward(w),sd=SIDE[B.side],h='<div><h2 style="margin:0 0 6px">'+(w?'🏆 CHIẾN THẮNG':'💀 THẤT BẠI')+'</h2>'
    +'<div style="font-size:13px;opacity:.9">Điểm phe: '+B.sc[0]+' – '+B.sc[1]+' · Bạn hạ '+B.kills+' · 🏅 +'+r.cc+' Chiến Công</div><div style="margin:10px 0;font-size:14px;line-height:1.7">';
  if(r.capped)h+='Hôm nay đã hết lượt nhận thưởng ('+CF.rewardDay+' trận).';
  else r.rows.forEach(function(x){h+=x+'<br>'});
  h+='</div><button class="ctm-bt" id="ctm-again">Quay lại nhà</button></div>';
  res=document.createElement('div');res.id='ctm-res';res.innerHTML=h;ovB.appendChild(res);
  if(btUlt)btUlt.parentNode.style.display='none';
  say((w?'🏆 Thắng ':'💀 Thua ')+'Chiến Trường Tiên·Ma',w?sd.col:'#ff9a9a');
  document.getElementById('ctm-again').onclick=function(){closeBattle(true);open()}}


/* ================= PvP NGƯỜI THẬT (cần chien_truong_tien_ma.sql; thiếu máy chủ thì tự luyện tập với máy) ================= */
function pvOk(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function showWait(t){
  stopWait();ovW=document.createElement('div');ovW.id='ctm-wait';ovW.className='tsm-ov';ovW.style.setProperty('--tc','#ffd76a');
  ovW.innerHTML='<div class="tsm-bx ctm-bx"><h3>⚔ Chiến Trường Tiên · Ma</h3><div class="ctm-nt" id="ctm-wt">'+t+'</div>'
    +'<small>Đang ghép với người chơi thật. Quá '+CF.pv.waitMax+' giây không có đối thủ sẽ tự đánh luyện tập với máy (vé không mất).</small><br>'
    +'<button class="ctm-bt" onclick="CTM.skip()">🤖 Đánh với máy ngay</button></div>';
  document.body.appendChild(ovW)}
function updWait(t){var e=document.getElementById('ctm-wt');if(e)e.textContent=t}
function stopWait(){if(wTimer){clearInterval(wTimer);wTimer=0}if(ovW){ovW.remove();ovW=null}}
function queue(side){
  if(!pvOk()){beginBattle(side);return}
  var nm='Đạo Hữu',t0=Date.now(),room=0,n=0,fin=false;
  try{nm=(PS[cur]&&PS[cur].nm)||(typeof pn!=='undefined'&&pn)||'Đạo Hữu'}catch(e){}
  function fallback(why){
    if(fin)return;fin=true;stopWait();skipFn=null;
    if(room){try{KCL.rpc('ctm_leave',{p_room:room}).catch(function(){})}catch(e){}}
    say(why||'🤖 Không có đối thủ — luyện tập với máy','#ffe9a0');beginBattle(side)}
  skipFn=function(){fallback('🤖 Luyện tập với máy')};
  showWait('⏳ Đang tìm đối thủ...');
  try{
    KCL.rpc('ctm_join',{p_slot:(typeof cur==='number'?cur:0),p_side:side,p_name:nm}).then(function(r){
      if(fin){if(r&&r.status==='ok'){try{KCL.rpc('ctm_leave',{p_room:r.room}).catch(function(){})}catch(e){}}return}
      if(!r||r.status!=='ok'){fallback('🤖 Chưa có máy chủ Chiến Trường — luyện tập với máy');return}
      room=r.room;n=r.n;
      wTimer=setInterval(function(){
        if(fin)return;
        KCL.rpc('ctm_sync',{p_room:room,p_state:null}).then(function(x){
          if(fin)return;
          if(!x||x.status!=='ok'){fallback();return}
          if(x.st==='active'){fin=true;skipFn=null;stopWait();beginPvp(x,side,n,room);return}
          if(x.st==='expired'||Date.now()-t0>CF.pv.waitMax*1000){fallback();return}
          updWait('⏳ Đang tìm đối thủ... '+Math.round((Date.now()-t0)/1000)+'s · ☯ '+(x.nt|0)+' · 👹 '+(x.nm|0))
        }).catch(function(){if(!fin)fallback()})},1000)
    }).catch(function(){fallback('🤖 Chưa có máy chủ Chiến Trường — luyện tập với máy')})
  }catch(e){fallback()}}

/* ---------- HỒ SƠ THẬT (chỉ số + kỹ năng + trang bị + pháp bảo; dùng đúng các hàm tính của game như Đấu Trường) ---------- */
function pvProfile(){
  var pf={atk:sA(),df:sD(),hp:sH(),mp:0,cp:.2,cd:1.8,dodge:0,dred:0,ls:0,ms:0,sdmg:0,asp:0,T:'w',rng:52,sk:[],ult:null},tier=0,i,q,t,ks;
  try{pf.mp=Math.max(0,+mm()||0)}catch(e){}
  try{pf.cp=Math.min(.85,.15+(typeof ZC!=='undefined'&&ZC.crit?ZC.crit():0)+(typeof setOn==='function'&&setOn()?.1:0)+SX('crit')/100+(typeof HL!=='undefined'&&HL.crit?HL.crit():0))}catch(e){}
  try{pf.cd=1.8+SX('cdmg')/100+(typeof HL!=='undefined'&&HL.cdmg?HL.cdmg():0)}catch(e){}
  try{pf.dodge=SX('dodge')||0;pf.dred=SX('dred')||0;pf.ls=SX('ls')||0;pf.ms=SX('ms')||0;pf.sdmg=SX('sdmg')||0}catch(e){}
  try{pf.T=TK();pf.rng=Math.max(52,Math.round((RG[pf.T]||210)*.25));pf.asp=SX(pf.T==='m'?'cspd':'aspd')||0}catch(e){}
  try{tier=PS[cur].tier|0}catch(e){}
  try{
    ks=sks();
    for(i=0;i<ks.length;i++){
      q=ks[i];if(!q||!(i<2||(i<4&&tier>=1)||(i===4&&tier>=2)||(i===5&&tier>=3)))continue;
      t=q[4]|0;
      pf.sk.push({i:i,n:String(q[0]||'Kỹ năng'),m:+q[2]||0,cdm:Math.max(1.5,(+q[3]||60)*1.6/60),t:t,mult:Math.max(.1,+q[5]||1),
        rng:t===1?Math.max(60,Math.min(200,Math.round((+q[6]||200)*.3))):(t===13||t===16||t===17)?180:Math.max(90,pf.rng),
        heal:(t===3||t===10),skip:(t===5||t===6),cd:0})}
  }catch(e){}
  for(i=0;i<pf.sk.length;i++){q=pf.sk[i];if(!q.heal&&!q.skip&&(!pf.ult||q.mult>pf.ult.mult))pf.ult=q}
  if(pf.ult)pf.ult.ultS=1;
  return pf}
function castSk(s,tg){
  var b=B,me=b.me,pf=me.pf,i,u,h;
  me.mp-=s.m;s.cd=s.cdm;
  if(s.heal){h=Math.round(me.max*.1*Math.max(1,s.mult));me.hp=Math.min(me.max,me.hp+h);floatTxt(me.x,'+'+nf(h),'#8affb0');return}
  floatTxt(me.x,'✨'+s.n,'#8fe8ff');
  if(s.t===1||s.ultS){
    var rad=s.ultS?Math.max(s.rng,CF.ultR):s.rng;b.rg.push({x:me.x,r:rad,l:.45,m:.45});
    for(i=0;i<b.u.length;i++){u=b.u[i];if(u.type!=='rem'||u.dead||u.team===me.team)continue;if(Math.abs(u.x-me.x)<=rad)hit(me,u,s.mult,1)}
  }else hit(me,tg,s.mult,1)}
function realAct(n){
  var b=B,me=b.me,pf=me.pf,i,s,low=me.hp<me.max*.5;
  for(i=pf.sk.length-1;i>=0;i--){
    s=pf.sk[i];if(s.skip||s.ultS||s.cd>0||me.mp<s.m)continue;
    if(s.heal){if(!low)continue;castSk(s,n.o);return}
    if(n.d<=s.rng){castSk(s,n.o);return}}
  hit(me,n.o,1,0)}
function setupPv(side,n,room){
  var sd=SIDE[side]||SIDE.tien,t=side==='tien'?0:1,A=CF.pv.norm?CF.pv.atk:sA(),Hh=CF.pv.norm?CF.pv.hp:sH();
  B={side:side,t:CF.pv.dur,sc:[0,0],u:[],fl:[],ln:[],rg:[],end:0,win:false,draw:false,wave:0,ult:0,heal:0,me:null,mine:0,kills:0,L:1000,over:0,
     pv:{room:room,n:n,mem:{},dm:{},kb:{},dth:0,last:0,miss:0,busy:false,kills:0}};
  B.me=mk(t,'me',t?880:120,{hp:Hh,atk:A,spd:72,rng:52,rate:.8,r:16,nm:'Bạn',g:sd.e});B.me.inv=CF.pv.inv;
  if(!CF.pv.norm){
    var pf=pvProfile(),me=B.me;
    me.pf=pf;me.atk=pf.atk;me.max=me.hp=pf.hp;me.mpm=me.mp=pf.mp;me.rng=pf.rng;me.rate=.8/(1+Math.min(1,pf.asp/100));
    B.ultS=pf.ult}
  return B}
function beginPvp(x,side,n,room){
  setupPv(side,n,room);mkUi();applyPv(x);
  pvTimer=setInterval(syncPv,CF.pv.sync);
  say('⚔ Vào Chiến Trường PvP — '+(SIDE[side]||SIDE.tien).n,(SIDE[side]||SIDE.tien).col)}
function decay(dt){
  var b=B,i;
  for(i=b.fl.length-1;i>=0;i--){b.fl[i].l-=dt;b.fl[i].y+=dt*38;if(b.fl[i].l<=0)b.fl.splice(i,1)}
  for(i=b.ln.length-1;i>=0;i--){b.ln[i].l-=dt;if(b.ln[i].l<=0)b.ln.splice(i,1)}
  for(i=b.rg.length-1;i>=0;i--){b.rg[i].l-=dt;if(b.rg[i].l<=0)b.rg.splice(i,1)}}
function stepPv(dt){
  var b=B,me=b.me,i,u,n,dir;
  if(b.end){b.over-=dt;decay(dt);return}
  b.t=Math.max(0,b.t-dt);b.ult=Math.max(0,b.ult-dt);b.heal=Math.max(0,b.heal-dt);
  if(me.fl>0)me.fl-=dt;
  if(me.inv>0)me.inv-=dt;
  if(me.pf){var pk;me.mp=Math.min(me.mpm,me.mp+me.mpm*CF.pv.mpRegen*dt);for(pk=0;pk<me.pf.sk.length;pk++)if(me.pf.sk[pk].cd>0)me.pf.sk[pk].cd-=dt}
  if(me.dead){me.rs-=dt;if(me.rs<=0){me.dead=0;me.hp=me.max;if(me.pf)me.mp=me.mpm;me.x=me.team?940:60;me.cd=.5;me.inv=CF.pv.inv}}
  else{
    me.cd-=dt;n=nearest(me);
    if(n&&n.d<=me.rng){if(me.cd<=0){me.cd=me.rate;if(me.pf)realAct(n);else hit(me,n.o,1)}}
    else{
      if(n&&n.d<=CF.aggro)dir=(n.o.x>=me.x)?1:-1;
      else if(n)dir=me.team?-1:1;
      else dir=Math.abs(me.x-500)<8?0:(me.x<500?1:-1);
      me.x+=dir*me.spd*dt;if(me.x<20)me.x=20;if(me.x>980)me.x=980}}
  for(i=0;i<b.u.length;i++){u=b.u[i];if(u.type!=='rem')continue;if(u.fl>0)u.fl-=dt;if(u.tx!=null){if(Math.abs(u.tx-u.x)>260)u.x=u.tx;else u.x+=(u.tx-u.x)*Math.min(1,dt*8)}}
  decay(dt)}
function takePv(inc,u){
  var b=B,pv=b.pv,me=b.me,pf=me.pf,red=pf?Math.min(.45,pf.dred/100):CF.pv.red,dg=pf?Math.min(.22,pf.dodge/100):0,d=Math.max(1,Math.round(inc*(1-red)*(1-dg)));
  me.hp-=d;me.fl=.12;pv.last=u.n;floatTxt(me.x,'-'+nf(d),'#ff8a8a');b.ln.push({a:u.x,b:me.x,l:.1,t:u.team});
  if(me.hp<=0&&!me.dead){me.hp=0;me.dead=1;me.rs=CF.respawn;pv.dth++;pv.kb[pv.last]=(pv.kb[pv.last]|0)+1}}
function applyPv(r){
  var b=B,pv=b.pv,i,m,u,st,k,inc,kills=0;
  pv.miss=0;
  if(r.st==='expired'){abortPv('Trận không còn tồn tại.');return}
  if(r.left!=null&&!b.end)b.t=r.left;
  b.sc=[r.sc_tien|0,r.sc_ma|0];
  var ms=r.members||[];
  for(i=0;i<ms.length;i++){
    m=ms[i];if(m.n===pv.n)continue;
    u=pv.mem[m.n];
    if(!u){u=pv.mem[m.n]=mk(m.side==='tien'?0:1,'rem',m.side==='tien'?100:900,{hp:CF.pv.hp,atk:0,r:13,nm:m.name||'Người chơi',g:(SIDE[m.side]||SIDE.tien).e});u.n=m.n;u.ap=0;u.tx=u.x}
    st=m.state||{};
    if((m.age|0)>6000||st.left){u.dead=1;continue}
    if(st.x!=null)u.tx=+st.x;
    if(+st.mx>0)u.max=+st.mx;
    u.df=Math.max(0,+st.df||0);
    if(st.hp!=null)u.hp=Math.max(0,+st.hp);
    u.dead=st.dd?1:0;
    k=(st.dm&&st.dm[pv.n])||0;inc=k-(u.ap||0);
    if(inc>0){u.ap=k;if(!b.me.dead&&!b.end&&!(b.me.inv>0))takePv(inc,u)}
    if(st.kb&&st.kb[pv.n])kills+=(st.kb[pv.n]|0)}
  pv.kills=kills;b.kills=kills;b.mine=kills*CF.pv.ptsKill;
  if(r.st==='done'&&!b.end){b.end=1;b.win=(r.winner===b.side);b.draw=(r.winner==='draw');b.over=1.2}}
function abortPv(msg){
  closeBattle(true);open();note=msg||'Mất kết nối trận đấu.';renderLobby()}
function syncPv(){
  var b=B,pv,me,st;
  if(!b||!b.pv||b.end)return;
  pv=b.pv;if(pv.busy){if(Date.now()-pv.busyT>3000)pv.busy=false;else return}
  me=b.me;pv.busy=true;pv.busyT=Date.now();
  st={x:Math.round(me.x),hp:Math.round(me.hp),mx:Math.round(me.max),dd:me.dead?1:0,dth:pv.dth,kb:pv.kb,dm:pv.dm,df:me.pf?Math.round(me.pf.df):0};
  try{
    KCL.rpc('ctm_sync',{p_room:pv.room,p_state:st}).then(function(r){
      pv.busy=false;if(B!==b)return;
      if(!r||r.status!=='ok'){if(r&&r.status==='gone'){abortPv('Trận không còn tồn tại.');return}if(++pv.miss>16)abortPv('Mất kết nối trận đấu.');return}
      applyPv(r)}).catch(function(){pv.busy=false;if(B===b&&++pv.miss>16)abortPv('Mất kết nối trận đấu.')})
  }catch(e){pv.busy=false;if(++pv.miss>16)abortPv('Mất kết nối trận đấu.')}}
function rewardPv(c,w){
  var o=D(),out={rows:[],cc:0,msg:''},today=dayKey(),i,ch,r;
  if(!c||c.status!=='ok'){out.msg=c&&c.status==='afk'?'Bạn đã rời trận quá lâu nên không có thưởng.':c&&c.status==='dup'?'Phần thưởng trận này đã nhận.':'Không nhận được thưởng (lỗi mạng).';return out}
  if(!o)return out;
  o.n=(o.n|0)+1;if(w)o.w=(o.w|0)+1;else o.l=(o.l|0)+1;
  out.cc=B.mine+(w?CF.winBonus:CF.loseBonus);o.pts=(o.pts|0)+out.cc;
  if(c.capped){out.msg='Hôm nay đã hết lượt nhận thưởng PvP.'}
  else{
    for(i=0;i<(c.chests|0);i++){
      ch=pickChest(w,o.sd!==today);r=openChest(ch);
      if(ch.t==='sh'&&r.sh)o.sd=today;
      out.rows.push('🎁 Rương: '+r.m)}}
  sav();return out}
function showResultPv(){
  var b=B,pv=b.pv,w=!!b.win,sd=SIDE[b.side]||SIDE.tien;
  if(pvTimer){clearInterval(pvTimer);pvTimer=0}
  res=document.createElement('div');res.id='ctm-res';res.innerHTML='<div><h2 style="margin:0">⏳ Đang tính thưởng...</h2></div>';ovB.appendChild(res);
  if(btUlt)btUlt.parentNode.style.display='none';
  function done(c){
    if(!ovB||B!==b)return;
    var out=rewardPv(c,w),h='<div><h2 style="margin:0 0 6px">'+(w?'🏆 CHIẾN THẮNG':(b.draw?'🤝 HOÀ':'💀 THẤT BẠI'))+'</h2>'
      +'<div style="font-size:13px;opacity:.9">Điểm phe: ☯ '+b.sc[0]+' – '+b.sc[1]+' 👹 · Bạn hạ '+b.kills+(out.cc?' · 🏅 +'+out.cc+' Chiến Công':'')+'</div><div style="margin:10px 0;font-size:14px;line-height:1.7">';
    if(out.msg)h+=out.msg+'<br>';
    out.rows.forEach(function(x){h+=x+'<br>'});
    h+='</div><button class="ctm-bt" id="ctm-again">Quay lại nhà</button></div>';
    res.innerHTML=h;
    say((w?'🏆 Thắng ':'💀 Thua ')+'Chiến Trường PvP',w?sd.col:'#ff9a9a');
    document.getElementById('ctm-again').onclick=function(){closeBattle(true);open()}}
  var fin2=false;
  function fin(c){if(fin2)return;fin2=true;done(c)}
  function attempt(n){
    var ok=false,tm=setTimeout(function(){if(!ok&&!fin2){ok=true;n<1?attempt(n+1):fin({status:'net'})}},CF.pv.claimMs);
    try{KCL.rpc('ctm_claim',{p_room:pv.room}).then(function(c){if(ok)return;ok=true;clearTimeout(tm);fin(c)}).catch(function(){if(ok)return;ok=true;clearTimeout(tm);n<1?attempt(n+1):fin({status:'net'})})}
    catch(e){if(!ok){ok=true;clearTimeout(tm);n<1?attempt(n+1):fin({status:'net'})}}}
  attempt(0)}

/* ---------- vẽ ---------- */
function cmpX(p,q){return p.x-q.x}
function X(x){return 22+x/B.L*(W-44)}
function drawB(){
  var b=B,i,u,gy=H*.56,sd=b.pv?SIDE.tien:SIDE[b.side],od=b.pv?SIDE.ma:SIDE[b.side==='tien'?'ma':'tien'],wp=b.pv?CF.pv.winPts:CF.winPts,fs=Math.max(12,Math.min(18,W*.035)),g=cx,k,y;
  var bk=sd.col+od.col+W+'x'+H+'@'+dpr;
  if(!bgC||bgK!==bk){bgK=bk;bgC=document.createElement('canvas');bgC.width=cv.width;bgC.height=cv.height;
    var bg=bgC.getContext('2d');bg.setTransform(dpr,0,0,dpr,0,0);
    var sk=bg.createLinearGradient(0,0,0,gy);sk.addColorStop(0,'#05030f');sk.addColorStop(1,'#241038');
    bg.fillStyle=sk;bg.fillRect(0,0,W,H);
    var gl=bg.createRadialGradient(X(60),gy-30,10,X(60),gy-30,W*.5);gl.addColorStop(0,sd.col+'66');gl.addColorStop(1,'#0000');bg.fillStyle=gl;bg.fillRect(0,0,W,H);
    gl=bg.createRadialGradient(X(940),gy-30,10,X(940),gy-30,W*.5);gl.addColorStop(0,od.col+'66');gl.addColorStop(1,'#0000');bg.fillStyle=gl;bg.fillRect(0,0,W,H);
    bg.fillStyle='#fff8';for(i=0;i<40;i++){bg.fillRect((i*97.3)%W,(i*53.7)%(gy*.8),1.5,1.5)}
    var gr=bg.createLinearGradient(0,gy,0,H);gr.addColorStop(0,'#2b2433');gr.addColorStop(1,'#0c0814');bg.fillStyle=gr;bg.fillRect(0,gy,W,H-gy);
    bg.strokeStyle='#ffffff22';bg.lineWidth=2;bg.beginPath();bg.moveTo(0,gy+4);bg.lineTo(W,gy+4);bg.stroke()}
  g.drawImage(bgC,0,0,W,H);
  /* vòng đại chiêu */
  for(i=0;i<b.rg.length;i++){var q=b.rg[i],a=q.l/q.m;g.strokeStyle='rgba(255,230,140,'+a+')';g.lineWidth=4;g.beginPath();g.ellipse(X(q.x),gy+12,(1-a*.4)*q.r/b.L*(W-44),18,0,0,6.283);g.stroke()}
  /* đơn vị */
  var order=ORD;order.length=0;for(i=0;i<b.u.length;i++)if(!b.u[i].dead)order.push(b.u[i]);order.sort(cmpX);
  for(i=0;i<order.length;i++){u=order[i];if(u.dead)continue;
    var px=X(u.x),col=u.team===0?sd.col:od.col,rr=u.r*Math.max(.7,Math.min(1.25,W/420));
    if(u.type==='boss'){g.font=(rr*2.4)+'px serif';g.textAlign='center';g.textBaseline='bottom';g.fillText(u.g,px,gy+6);y=gy-rr*2.5-8}
    else if(u.type==='min'){g.fillStyle=u.fl>0?'#fff':col;g.beginPath();g.arc(px,gy-rr,rr,0,6.283);g.fill();y=gy-rr*2-6}
    else{if(u.inv>0)g.globalAlpha=.5;g.fillStyle=u.fl>0?'#fff':col+'cc';g.beginPath();g.arc(px,gy-rr,rr,0,6.283);g.fill();
      if(u.type==='me'){g.strokeStyle='#fff';g.lineWidth=2;g.stroke()}
      g.font=(rr*1.3)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#000';g.fillText(u.g,px,gy-rr+1);g.globalAlpha=1;y=gy-rr*2-6}
    var bw=Math.max(26,rr*2.4);g.fillStyle='#000a';g.fillRect(px-bw/2,y-5,bw,5);g.fillStyle=u.team===b.me.team?'#6aff9a':'#ff6a6a';g.fillRect(px-bw/2,y-5,bw*Math.max(0,u.hp/u.max),5);
    if(u.type==='me'||u.type==='boss'||u.type==='rem'){g.font=(fs*.8)+'px '+FONT;g.fillStyle='#fff';g.textBaseline='bottom';g.textAlign='center';g.fillText(u.nm,px,y-7)}}
  /* tia đánh */
  for(i=0;i<b.ln.length;i++){var l=b.ln[i];g.strokeStyle=(l.t===0?sd.col:od.col)+'cc';g.lineWidth=2;g.beginPath();g.moveTo(X(l.a),gy-14);g.lineTo(X(l.b),gy-14);g.stroke()}
  /* số nổi */
  g.font='bold '+fs+'px '+FONT;g.textAlign='center';g.textBaseline='middle';
  for(i=0;i<b.fl.length;i++){var f=b.fl[i];g.globalAlpha=Math.min(1,f.l*1.6);g.fillStyle=f.c;g.fillText(f.s,X(f.x),gy-60-f.y);g.globalAlpha=1}
  /* HUD trên */
  var bw2=(W-44)/2-30,y0=Math.max(14,18),mn=Math.floor(b.t/60),sc=Math.floor(b.t%60);
  g.fillStyle='#000a';g.fillRect(22,y0,bw2,16);g.fillRect(W-22-bw2,y0,bw2,16);
  g.fillStyle=sd.col;g.fillRect(22,y0,bw2*Math.min(1,b.sc[0]/wp),16);
  g.fillStyle=od.col;var w1=bw2*Math.min(1,b.sc[1]/wp);g.fillRect(W-22-w1,y0,w1,16);
  g.font='bold '+fs+'px '+FONT;g.fillStyle='#fff';g.textAlign='center';g.textBaseline='top';g.fillText(mn+':'+(sc<10?'0':'')+sc,W/2,y0-1);
  g.font=(fs*.85)+'px '+FONT;g.textAlign='left';g.fillText(sd.e+' '+b.sc[0]+'/'+wp,26,y0+20);g.textAlign='right';g.fillText(b.sc[1]+'/'+wp+' '+od.e,W-26,y0+20);
  g.textAlign='center';g.fillStyle='#ffe9a8';g.fillText(b.pv?'⚔ PvP người thật · hạ đối thủ +'+CF.pv.ptsKill+' điểm · '+(CF.pv.norm?'chỉ số cân bằng':'chỉ số thật'):'Hạ cao thủ +'+CF.ptsFoe+' · Hạ lính +'+CF.ptsMin+' · Phá Thủ Tướng = thắng',W/2,y0+44);
  if(b.me.pf){g.font=(fs*.8)+'px '+FONT;g.fillStyle='#8fe8ff';g.textAlign='center';g.textBaseline='top';g.fillText('✨ Linh lực '+nf(Math.round(b.me.mp))+'/'+nf(Math.round(b.me.mpm)),W/2,y0+62)}
  if(b.me.dead){g.font='bold '+(fs*1.3)+'px '+FONT;g.fillStyle='#ff9a9a';g.textBaseline='middle';g.fillText('Bạn đã ngã xuống... hồi sinh sau '+Math.ceil(b.me.rs)+'s',W/2,H*.3)}}

/* ---------- khi đang đánh: không vẽ thế giới phía dưới (tiết kiệm CPU/GPU; vẽ lại ngay khi thoát trận) ---------- */
try{if(typeof window.draw==='function'&&!window.__ctmDrawWrap){var _dr0=window.draw;window.draw=function(){if(worldHide)return;return _dr0.apply(this,arguments)};window.__ctmDrawWrap=1}}catch(e){}
/* ---------- gắn vào Nhà Chiến Trường Tiên·Ma (TT2.houses[0]) ---------- */
function hook(){try{if(window.TT2&&TT2.houses&&TT2.houses[0]){TT2.houses[0].open=function(){open()};return true}}catch(e){}return false}
if(!hook()){var hn=0,iv=setInterval(function(){if(hook()||++hn>40)clearInterval(iv)},500)}
window.CTM={cfg:CF,open:open,close:close,pick:pick,start:start,skip:function(){if(skipFn)skipFn()},
  reset:function(){var o=D();if(o){o.side='';o.lock=0;o.rd='';o.rn=0;o.sd='';sav();renderLobby()}},
  _sim:{closeBattle:closeBattle,onVis:onVis,pv:{setup:setupPv,step:stepPv,apply:applyPv,sync:syncPv},setup:setup,step:step,ult:doUlt,heal:doHeal,state:function(){return B},reward:reward}};
})();
