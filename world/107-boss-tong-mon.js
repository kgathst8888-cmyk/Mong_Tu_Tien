/* ===== 🐉 BOSS TÔNG MÔN HẰNG TUẦN (world/107-boss-tong-mon.js) — Fix348 — nạp SAU world/106 (Tông Môn) và world/27 (Boss Bất Tử) =====
 * Thêm tab "🐉 Boss" vào Nhà Tông Môn. Cần chạy tong_mon_boss.sql (sau tong_mon.sql) 1 lần trong Supabase.
 *   • Mỗi TUẦN (thứ Hai 00:00 giờ VN) mỗi tông có 1 boss (xoay vòng 8 boss) với MỘT THANH MÁU CHUNG do máy chủ giữ.
 *   • Mỗi thành viên đánh tối đa 2 lượt/ngày (tài khoản). Mỗi lượt 60 giây (hoặc tới khi gục) — giống Boss Bất Tử: sát thương của bạn
 *     được cộng vào máu chung của tông. Mỗi lượt nhận vàng: CF.gold + CF.goldPerLv × cấp tông. Bỏ dở / thoát giữa chừng vẫn mất lượt.
 *   • MÁU BOSS tự co giãn theo sức mạnh thật: 8 × tổng "lượt sát thương cao nhất" của các thành viên (chốt ở lượt đầu của tuần).
 *     Cả tông cần khoảng một nửa số lượt tối đa để hạ boss → tông đông và chăm đánh thì hạ được, ở mọi giai đoạn của game.
 *   • Hạ boss: tông +500 exp (mỗi lượt đánh +20 exp). Thưởng theo HẠNG sát thương trong tông (CF.rw): trang bị, Mảnh Nguyệt Thạch,
 *     Mảnh Thánh, vàng, Linh Thạch khoá. Điều kiện nhận: đóng góp >= 0,2% máu boss. Nhận trong 28 ngày, mỗi tuần 1 lần (máy chủ giữ).
 *   • Bảng "đua hạ boss": tông nào hạ boss tuần này sớm nhất (tính từ thứ Hai 00:00).
 *   • Trận đánh dùng engine hầm ngục như Boss Bất Tử nhưng cờ riêng dg.tb / e.tb (không đụng dg.bi). Boss không chết trong 60 giây
 *     (máu ảo, hồi đầy mỗi nhịp, chỉ đo sát thương). Vào trận sẽ thoát Làng Tân Thủ 2 (TT2.leave) và quay về cổng Làng Tân Thủ khi xong.
 * Chỉnh cân bằng: window.TMB_CF (thời lượng, vàng, hệ số boss, bảng thưởng). Hệ số máu (8), 2 lượt/ngày, 0,2% nằm trong SQL.
 * Gỡ <script> → tab Boss biến mất, các phần còn lại không ảnh hưởng. API: TMB.html · TMB.act · TMB.cfg */
(function(){
'use strict';
if(window.TMB||!window.TMG||typeof PS==='undefined'||typeof document==='undefined')return;
var need=['dgTick','dgSp','dgHurt','init','dgExit','dgHud','dgFoe'],i0;
for(i0=0;i0<need.length;i0++){try{if(typeof eval(need[i0])!=='function'){console.warn('[TMB] thiếu '+need[i0]);return}}catch(e){console.warn('[TMB] thiếu '+need[i0]);return}}

var CF=window.TMB_CF={
  secs:60,           /* thời lượng mỗi lượt (giây) */
  gold:500000,       /* vàng mỗi lượt tham gia */
  goldPerLv:100000,  /* + vàng mỗi cấp tông */
  hp:1e13,           /* máu "ảo" của boss trong trận (hồi đầy mỗi nhịp, chỉ để đo sát thương) */
  lvAdd:6,           /* cấp boss = cấp người chơi + lvAdd */
  atk:1.7,           /* nhân sát thương boss gây ra (như Boss Bất Tử) */
  mapMin:2,          /* trang bị thưởng tính theo bản đồ >= mốc này (0..4) */
  /* Thưởng theo hạng sát thương trong tông. w = tỉ lệ độ hiếm trang bị: 0 Thường · 1 Tinh Anh · 2 Hiếm · 3 Sử Thi · 4 Thần Thoại · 5 Thiên Thần */
  rw:[
    {t:'Hạng 1',    a:1, b:1,  sh:3,nt:10,lt:12,g:20000000,w:[[5,5],[4,10],[3,85]]},
    {t:'Hạng 2-3',  a:2, b:3,  sh:1,nt:8, lt:8, g:12000000,w:[[5,2],[4,8],[3,90]]},
    {t:'Hạng 4-10', a:4, b:10, sh:0,nt:5, lt:5, g:8000000, w:[[5,1],[4,6],[3,78],[2,15]]},
    {t:'Còn lại',   a:11,b:9e9, sh:0,nt:3, lt:3, g:5000000, w:[[4,4],[3,40],[2,36],[1,20]]}],
  /* 8 boss xoay vòng theo tuần: [tên, màu, hue-rotate] */
  bosses:[['Thiên Kiếp Ma Quân','#ff5ad0',300],['Huyền Băng Cổ Long','#9fe8ff',170],['Xích Diễm Hỏa Vương','#ff7a3a',-20],
          ['U Minh Quỷ Mẫu','#b070ff',250],['Cửu Độc Yêu Hoàng','#7be07a',90],['Kim Thân La Hán','#ffd860',40],
          ['Hư Không Ma Tôn','#c8c8ff',200],['Thần Thú Phản Thể','#ff9a5a',20]]
};
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'],RC=['#cccccc','#6fdc6f','#5aa8ff','#c070ff','#ffa733','#ff5ad0'];

/* ---------- tiện ích ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]})}
function nf(n){try{return Math.round(Number(n)||0).toLocaleString('vi-VN')}catch(e){return ''+n}}
function big(n){n=Number(n)||0;return n>=1e12?(n/1e12).toFixed(2)+' nghìn tỷ':n>=1e9?(n/1e9).toFixed(2)+' tỷ':n>=1e6?(n/1e6).toFixed(2)+' triệu':nf(n)}
function dhm(s){s=Math.max(0,s|0);var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return (d?d+' ngày ':'')+(h?h+' giờ ':'')+m+' phút'}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:140,g:1})}catch(e){}}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function err(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Boss Tông Môn chưa kích hoạt trên máy chủ (cần chạy tong_mon_boss.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='none'?'Không có lượt hợp lệ / bạn chưa có tông môn':s==='no_tries'?'Hôm nay bạn đã hết lượt':
    s==='killed'?'Boss tuần này đã bị hạ rồi 🎉':s==='low'?'Đóng góp chưa đủ 0,2% máu boss nên không nhận được thưởng':
    s==='old'?'Quá hạn nhận thưởng (28 ngày)':s==='moved'?'Bạn đã đổi tông giữa chừng — lượt không được tính':
    s==='expired'?'Lượt đánh đã quá hạn':'Không thực hiện được'}
function info(i){return CF.bosses[((i|0)%CF.bosses.length+CF.bosses.length)%CF.bosses.length]}
function tierOf(r){for(var i=0;i<CF.rw.length;i++){if(r>=CF.rw[i].a&&r<=CF.rw[i].b)return CF.rw[i]}return CF.rw[CF.rw.length-1]}
function pickW(w){var t=0,r,i;w.forEach(function(x){t+=x[1]});r=Math.random()*t;for(i=0;i<w.length;i++){if((r-=w[i][1])<0)return w[i][0]}return w[w.length-1][0]}
function rwText(T){
  var a=[],t=0;T.w.forEach(function(x){t+=x[1]});
  a.push('💰 '+nf(T.g));if(T.sh)a.push('💠 '+T.sh+' Mảnh Thánh');if(T.nt)a.push('🌙 '+T.nt+' Mảnh Nguyệt Thạch');if(T.lt)a.push('💎 '+T.lt+' Linh Thạch khoá');
  a.push('📦 1 Rương trang bị ('+T.w.map(function(x){return '<span style="color:'+RC[x[0]]+'">'+Math.round(x[1]/t*100)+'% '+RN[x[0]]+'</span>'}).join(' · ')+')');
  return a.join('<br>')}

/* ---------- trạng thái + giao diện (vẽ bên trong overlay của Tông Môn) ---------- */
var B={st:null,busy:false,loading:false,note:'',res:null};
function load(){
  if(B.loading)return;B.loading=true;
  rpc('tm_boss_status').then(function(r){B.loading=false;B.st=r;if(window.TMG&&TMG.isOpen())TMG.render()})}
function bt(label,a,b,cls,dis){
  return '<button class="tmg-bt'+(cls?' '+cls:'')+'" '+(dis||B.busy?'disabled ':'')+'onclick="TMG.act(\'boss\',\''+a+'\''+(b?',\''+b+'\'':'')+')">'+label+'</button>'}
function html(g){
  var st=B.st,h='';
  if(!st){if(!B.loading)load();return '<div class="tmg-cd">⏳ Đang tải boss tuần này...</div>'}
  if(st.status!=='ok')return '<div class="tmg-cd">'+esc(err(st))+'</div><div class="tmg-row">'+bt('Thử lại','reload')+'</div>';
  var bi=info(st.boss),pool=st.pool,dmg=Number(st.dmg)||0,killed=!!st.killed,left=Math.max(0,st.left|0);
  var pct=pool?Math.max(0,Math.min(100,Math.round((1-dmg/pool)*100))):100;
  h+='<div class="tmg-nt">'+esc(B.note)+'</div>';
  h+='<div class="tmg-cd" style="border-color:'+bi[1]+'88"><b style="color:'+bi[1]+'">🐉 '+esc(bi[0])+'</b> <small>Tuần từ '+esc(st.wk)+'</small>'
    +'<div class="tmg-bar"><i style="width:'+(killed?0:pct)+'%;background:linear-gradient(90deg,#8a1a1a,'+bi[1]+')"></i></div>'
    +'<small>'+(killed?'✅ <b>Đã bị hạ</b> — cả tông chờ nhận thưởng!':pool?'Máu còn '+big(Math.max(0,pool-dmg))+' / '+big(pool)+' ('+pct+'%)':'Máu boss sẽ được chốt sau lượt đánh đầu tiên của tuần (theo sức mạnh cả tông)')+'</small>'
    +'<small>Bạn đã gây: <b>'+big(st.my)+'</b> ('+(st.tries|0)+' lượt tuần này) · Lượt còn lại hôm nay: <b style="color:'+(left&&!killed?'#7fe08a':'#ff7a7a')+'">'+left+'/2</b></small>'
    +'<small>Mỗi lượt '+CF.secs+' giây · +'+nf(CF.gold+CF.goldPerLv*(g.lv|0))+'💰 · tông +20 exp. Hạ boss: tông +500 exp.</small>'
    +'<div class="tmg-row">'+bt('⚔ Khiêu chiến ('+left+' lượt)','go','','',left<=0||killed||typeof started==='undefined'||!started)+bt('↻','reload','','sm')+'</div></div>';
  if(B.res){var r=B.res;
    h+='<div class="tmg-cd"><b>⚔ Lượt vừa rồi</b><small>Sát thương: <b>'+big(r.dmg)+'</b> · 💰 +'+nf(r.gold)+'</small>'
      +(r.r?'<small>Hạng trong tông: <b>#'+r.r.rank+'</b>'+(r.r.kill_now?' · 🎉 <b>BẠN VỪA GIÁNG ĐÒN HẠ BOSS!</b>':'')+'</small>':r.err?'<small style="color:#ff9a7a">Chưa ghi được lên máy chủ: '+esc(r.err)+'</small>':'<small>Đang gửi lên máy chủ…</small>')+'</div>'}
  (st.pending||[]).forEach(function(p){
    var T=tierOf(p.rank|0);
    h+='<div class="tmg-cd" style="border-color:#ffd54a"><b>🎁 Thưởng tuần '+esc(p.wk)+'</b> · '+esc(p.guild)+'<small>Hạng <b>#'+(p.rank|0)+'</b>/'+(p.cnt|0)+' ('+T.t+') · '+big(p.dmg)+' sát thương</small>'
      +(p.ok?'<small>'+rwText(T)+'</small><div class="tmg-row">'+bt('Nhận thưởng','claim',esc(p.wk),'on')+'</div>'
            :'<small style="color:#ff9a7a">Đóng góp chưa đủ 0,2% máu boss nên không nhận được thưởng.</small>')+'</div>'});
  var top=st.top||[];
  h+='<div class="tmg-cd"><b>🏆 Sát thương trong tông (tuần này)</b>';
  if(!top.length)h+='<small>Chưa ai đánh. Hãy là người đầu tiên!</small>';
  else h+='<table style="width:100%;font-size:12.5px;border-collapse:collapse">'+top.map(function(x,i){
    return '<tr style="'+(x.me?'background:#4a3410;font-weight:bold':'')+'"><td style="width:26px;text-align:center;color:#ffd54a">'+(i+1)+'</td><td>'+esc(x.name||'?')+' <small style="display:inline">· '+(x.tries|0)+' lượt</small></td><td style="text-align:right;white-space:nowrap">'+big(x.dmg)+'</td></tr>'}).join('')+'</table>';
  h+='</div>';
  var race=st.race||[];
  h+='<div class="tmg-cd"><b>⏱ Đua hạ boss (tuần này)</b>';
  if(!race.length)h+='<small>Chưa tông nào hạ được boss.</small>';
  else h+='<table style="width:100%;font-size:12.5px;border-collapse:collapse">'+race.map(function(x,i){
    return '<tr><td style="width:26px;text-align:center;color:#ffd54a">'+(i+1)+'</td><td>'+esc(x.name)+' <small style="display:inline">Lv.'+(x.lv|0)+'</small></td><td style="text-align:right;white-space:nowrap">'+dhm(x.secs)+'</td></tr>'}).join('')+'</table>';
  h+='</div>';
  h+='<details class="tmg-cd"><summary>🎁 Bảng thưởng theo hạng</summary>'+CF.rw.map(function(T){return '<div class="tmg-cd"><b>'+T.t+'</b><small>'+rwText(T)+'</small></div>'}).join('')+'</details>';
  return h}

function act(a,x){
  if(a==='reload'){B.st=null;B.note='';load();TMG.render()}
  else if(a==='go')start();
  else if(a==='claim')claim(x)}

/* ---------- nhận thưởng ---------- */
function claim(wk){
  if(B.busy)return;
  try{if(BAG.length>=capN()){B.note='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi nhận thưởng.';TMG.render();return}}catch(e){}
  B.busy=true;B.note='⏳ Đang nhận thưởng...';TMG.render();
  rpc('tm_boss_claim',{p_wk:String(wk)}).then(function(r){
    B.busy=false;
    if(!r||r.status!=='ok'){B.note=err(r);B.st=null;load();TMG.render();return}
    var T=tierOf(r.rank|0),it=null,out=[];
    try{gold+=T.g;out.push('💰 '+nf(T.g))}catch(e){}
    try{it=gen(P.lv,pickW(T.w),undefined,Math.max(typeof mapSel==='undefined'?0:mapSel|0,CF.mapMin));BAG.push(it)}catch(e){}
    try{if(T.nt){HL.addNT(T.nt);out.push('🌙 '+T.nt)}}catch(e){}
    try{if(T.sh&&typeof HL.addSH==='function'){HL.addSH(T.sh);out.push('💠 '+T.sh)}}catch(e){}
    try{if(T.lt&&window.LT&&LT.earnKS){LT.earnKS(T.lt);out.push('💎 '+T.lt)}}catch(e){}
    sav();say('🎁 Nhận thưởng Boss Tông Môn!','#ffd96a');
    B.note='🎉 Hạng #'+(r.rank|0)+'/'+(r.cnt|0)+': '+out.join(' · ')+(it?' · 📦 '+esc(it.n)+' ('+RN[it.r]+', cần Lv'+it.l+')':'');
    B.st=null;load();TMG.render()})}

/* ---------- vào trận (cùng khung với Boss Bất Tử, cờ riêng dg.tb / e.tb) ---------- */
function start(){
  if(B.busy||typeof started==='undefined'||!started||dg||over)return;
  B.busy=true;B.note='⏳ Đang vào trận...';TMG.render();
  rpc('tm_boss_begin').then(function(r){
    B.busy=false;
    if(!r||r.status!=='ok'){B.note=err(r);B.st=null;load();TMG.render();return}
    go(r)})}
function go(r){
  try{if(window.TT2&&TT2.on&&TT2.on()&&TT2.leave)TT2.leave()}catch(e){}
  TMG.close();B.res=null;B.note='';bo=0;try{bag.style.display='none'}catch(e){}
  var l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
  var bi=info(r.boss);
  dg={t:0,n:20,kill:20,tb:1,bt:0,tt:CF.secs*60,dmg:0,lg0:l0,v0:v0,fin:0,out:0,idx:r.boss|0,glv:r.glv|0};
  DT.push({x:P.x,y:200,s:'🐉 '+bi[0]+' · đánh '+CF.secs+' giây!',c:bi[1],g:1,l:150})}
function spawnBoss(){
  dgSp('boss');var e=E[E.length-1],bi=info(dg.idx);
  e.max=e.hp=CF.hp;e.lv=P.lv+CF.lvAdd;e.tb=1;e.tbN=bi[0];e.tbC=bi[1];e.tbH=bi[2];e.tbA=CF.atk;
  e.hn8=0;e._bup=1;   /* tắt x6,4 sát thương của boss Hầm Ngục thường (world/89) và tăng máu (systems/67): đây là trận đo sát thương */
  DT.push({x:P.x,y:220,s:'🐉 '+bi[0]+' xuất hiện!',c:bi[1],g:1,l:170})}
function finish(w,why){
  if(w.fin)return;w.fin=1;w.out=150;
  var dmg=Math.max(0,Math.round(w.dmg)),gd=CF.gold+CF.goldPerLv*(w.glv|0);
  E=E.filter(function(e){return !e.tb});PJ=[];
  try{gold+=gd}catch(e){}sav();
  var res={dmg:dmg,gold:gd,err:'',r:null};B.res=res;B.st=null;
  DT.push({x:P.x,y:200,s:(why==='dead'?'💀 Gục ngã! ':'⏱ Hết giờ! ')+'Sát thương: '+nf(dmg),c:'#ffe08a',g:1,l:190});
  rpc('tm_boss_end',{p_dmg:dmg}).then(function(r){
    if(r&&r.status==='ok'){res.r=r;if(r.kill_now)say('🎉 TÔNG MÔN HẠ BOSS!','#ffd96a')}else res.err=err(r);
    B.st=null;if(window.TMG&&TMG.isOpen()){load();TMG.render()}})}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();dgHud()}
function reopen(){B.st=null;try{TMG.reopen('boss')}catch(e){}}

/* ---------- móc vào engine (cùng cách Boss Bất Tử) ---------- */
var _tick=dgTick;dgTick=function(){
  if(!dg||!dg.tb)return _tick();
  if(over||vil||!started)return;
  SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
  if(!dg.bs&&dg.t>45){dg.bs=1;spawnBoss()}
  var b=E.find(function(e){return e.tb});
  if(b&&!dg.fin){
    var d=b.max-b.hp;if(d>0){dg.dmg+=d;b.hp=b.max}      /* đo sát thương rồi hồi đầy máu */
    if(++dg.bt>=dg.tt)finish(dg,'time')}
  if(dg.fin&&--dg.out<=0)dgExit()};
var _exit=dgExit;dgExit=function(){
  var w=dg&&dg.tb?dg:null;if(w&&!w.fin)finish(w,'leave');
  _exit();if(w){back(w);reopen()}};
var _init=init;init=function(){
  var w=dg&&dg.tb?dg:null;if(w&&!w.fin)finish(w,'dead');
  _init();if(w){back(w);reopen()}};
var _hurt=dgHurt;dgHurt=function(e,mu){_hurt(e,e&&e.tb?mu*e.tbA:mu)};
var _hud=dgHud;dgHud=function(){
  _hud();
  if(dg&&dg.tb){var bi=info(dg.idx),sec=Math.max(0,Math.ceil((dg.tt-dg.bt)/60));
    dgh.innerHTML='<div class="dgt" style="color:'+bi[1]+'">🐉 '+esc(bi[0])+(dg.bs&&!dg.fin?' · ⏱ '+sec+'s':'')+'</div><div class="dgt">⚔ Sát thương: '+nf(dg.dmg)+'</div>'}};
var _foe=dgFoe;dgFoe=function(e){
  if(!e.tb)return _foe(e);
  var col=e.tbC,X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
  g.save();g.globalCompositeOperation='lighter';
  var q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,col+'88');q.addColorStop(.5,col+'44');q.addColorStop(1,col+'00');
  g.globalAlpha=.75+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
  g.save();try{if('filter' in g)g.filter='hue-rotate('+e.tbH+'deg)'}catch(x){}_foe(e);g.restore();
  g.save();g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
  var ty=GY-((e.y||0)+268)*s;g.strokeText(e.tbN+' · TÔNG MÔN',X,ty);g.fillStyle=col;g.fillText(e.tbN+' · TÔNG MÔN',X,ty);g.restore()};

window.TMB={cfg:CF,html:html,act:act};
})();
