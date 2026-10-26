/* ===== 🐉 BOSS TÔNG MÔN + ⚔ TÔNG CHIẾN (world/107-boss-tong-mon.js) — Fix348 / Fix383 (Tông Chiến) / Fix385 (rương ngẫu nhiên, cống hiến) — nạp SAU world/106 (Tông Môn) và world/27 (Boss Bất Tử) =====
 * Thêm 2 tab vào Nhà Tông Môn: "🐉 Boss" (cần tong_mon_boss.sql) và "⚔ Chiến" (cần tong_mon_chien.sql). Mỗi tab báo "chưa kích hoạt" riêng nếu thiếu SQL.
 *
 * 🐉 BOSS TUẦN
 *   • Mỗi TUẦN (thứ Hai 00:00 giờ VN) mỗi tông có 1 boss xoay vòng 8 boss với MỘT THANH MÁU CHUNG do máy chủ giữ.
 *   • Mỗi thành viên đánh tối đa 2 lượt/ngày (tài khoản). Mỗi lượt 60 giây (hoặc tới khi gục): sát thương cộng vào máu chung. Mỗi lượt:
 *     vàng (CF.gold + CF.goldPerLv × cấp tông), tông +20 exp, +30 cống hiến. Vào trận là mất lượt (thoát giữa chừng vẫn mất).
 *   • MÁU BOSS tự co giãn: 8 × tổng "lượt sát thương cao nhất" của các thành viên (chốt ở lượt đầu tuần) → cân bằng ở mọi giai đoạn.
 *   • Hạ boss: tông +500 exp. Thưởng theo HẠNG sát thương trong tông (CF.rw): vàng, Mảnh Nguyệt Thạch, Mảnh Thánh, Linh Thạch khoá và
 *     1 🎁 RƯƠNG NGẪU NHIÊN (trang bị / Nguyệt Thạch / Mảnh Thánh — tỉ lệ hiện công khai). Điều kiện: đóng góp >= 0,2% máu boss;
 *     nhận trong 28 ngày, mỗi tuần 1 lần; +80…+500 cống hiến theo hạng. Bảng "đua hạ boss": tông nào hạ sớm nhất.
 *
 * ⚔ TÔNG CHIẾN
 *   • Tông có >= 5 thành viên được ghép với 1 tông có SỨC MẠNH gần nhất mỗi tuần (ghép lười: tông vào xem trước chờ tông vào sau).
 *   • Mỗi tài khoản 2 lượt/ngày (đếm RIÊNG với boss): đánh "Hộ Pháp" của tông địch 60 giây, sát thương cộng vào ĐIỂM tông. Hết tuần: điểm cao hơn thắng.
 *     Mỗi lượt: vàng (CF.war.gold + CF.war.goldPerLv × cấp tông), tông +15 exp, +20 cống hiến.
 *   • Nhận thưởng sau khi tuần kết thúc (28 ngày), cần >= 2 lượt: thắng / hoà / thua / bye (CF.war.rw). Thắng có thêm 🎁 rương ngẫu nhiên.
 *     Lần nhận đầu của tông chốt kết quả: thắng +400 exp tông, hoà +250, thua +150, bye +100.
 *
 * Trận đánh dùng engine hầm ngục như Boss Bất Tử nhưng cờ riêng dg.tb / e.tb (không đụng dg.bi). Boss không chết trong 60 giây (máu ảo, hồi đầy mỗi nhịp,
 * chỉ đo sát thương). Vào trận sẽ thoát Làng Tân Thủ 2 (TT2.leave) và quay về cổng Làng Tân Thủ khi xong, bảng mở lại đúng tab.
 * Chỉnh cân bằng: window.TMB_CF. Hệ số máu (8), lượt/ngày (2), ngưỡng 0,2%, 5 thành viên nằm trong SQL. Gỡ <script> → 2 tab biến mất.
 * API: TMB.html · TMB.act · TMB.cfg */
(function(){
'use strict';
if(window.TMB||!window.TMG||!TMG.addTab||typeof PS==='undefined'||typeof document==='undefined')return;
var need=['dgTick','dgSp','dgHurt','init','dgExit','dgHud','dgFoe'],i0;
for(i0=0;i0<need.length;i0++){try{if(typeof eval(need[i0])!=='function'){console.warn('[TMB] thiếu '+need[i0]);return}}catch(e){console.warn('[TMB] thiếu '+need[i0]);return}}

/* c = bảng rương ngẫu nhiên (p = trọng số, tổng = 100): k eq = 1 trang bị độ hiếm r · nt = q Mảnh Nguyệt Thạch · sh = q Mảnh Thánh */
var CF=window.TMB_CF={
  secs:60,           /* thời lượng mỗi lượt (giây) */
  gold:500000,       /* vàng mỗi lượt đánh boss */
  goldPerLv:100000,  /* + vàng mỗi cấp tông */
  hp:1e13,           /* máu "ảo" của boss trong trận (hồi đầy mỗi nhịp, chỉ để đo sát thương) */
  lvAdd:6,           /* cấp boss = cấp người chơi + lvAdd */
  atk:1.7,           /* nhân sát thương boss gây ra (như Boss Bất Tử) */
  mapMin:2,          /* trang bị thưởng tính theo bản đồ >= mốc này (0..4) */
  rw:[
    {t:'Hạng 1',    a:1, b:1,  sh:3,nt:10,lt:12,g:20000000,c:[{p:5,k:'eq',r:5},{p:10,k:'eq',r:4},{p:55,k:'eq',r:3},{p:20,k:'nt',q:5},{p:10,k:'sh',q:1}]},
    {t:'Hạng 2-3',  a:2, b:3,  sh:1,nt:8, lt:8, g:12000000,c:[{p:2,k:'eq',r:5},{p:8,k:'eq',r:4},{p:62,k:'eq',r:3},{p:20,k:'nt',q:4},{p:8,k:'sh',q:1}]},
    {t:'Hạng 4-10', a:4, b:10, sh:0,nt:5, lt:5, g:8000000, c:[{p:1,k:'eq',r:5},{p:6,k:'eq',r:4},{p:55,k:'eq',r:3},{p:15,k:'eq',r:2},{p:18,k:'nt',q:3},{p:5,k:'sh',q:1}]},
    {t:'Còn lại',   a:11,b:9e9, sh:0,nt:3, lt:3, g:5000000, c:[{p:4,k:'eq',r:4},{p:36,k:'eq',r:3},{p:30,k:'eq',r:2},{p:14,k:'eq',r:1},{p:12,k:'nt',q:3},{p:4,k:'sh',q:1}]}],
  war:{
    gold:300000,goldPerLv:80000,   /* vàng mỗi lượt Tông Chiến */
    rw:{
      win: {t:'🏆 Thắng',g:15000000,nt:6,lt:6,c:[{p:3,k:'eq',r:5},{p:12,k:'eq',r:4},{p:45,k:'eq',r:3},{p:25,k:'nt',q:4},{p:15,k:'sh',q:1}]},
      draw:{t:'🤝 Hoà', g:9000000, nt:4,lt:4},
      lose:{t:'💢 Thua', g:5000000, nt:2,lt:2},
      bye: {t:'🚶 Không có đối thủ',g:3000000,nt:1,lt:0}}},
  /* 8 boss xoay vòng theo tuần: [tên, màu, hue-rotate] */
  bosses:[['Thiên Kiếp Ma Quân','#ff5ad0',300],['Huyền Băng Cổ Long','#9fe8ff',170],['Xích Diễm Hỏa Vương','#ff7a3a',-20],
          ['U Minh Quỷ Mẫu','#b070ff',250],['Cửu Độc Yêu Hoàng','#7be07a',90],['Kim Thân La Hán','#ffd860',40],
          ['Hư Không Ma Tôn','#c8c8ff',200],['Thần Thú Phản Thể','#ff9a5a',20]]
};
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'];

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
function err(r,what){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ '+(what||'Tính năng')+' chưa kích hoạt trên máy chủ (cần chạy file SQL tương ứng)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='none'?'Không có lượt hợp lệ / bạn chưa có tông môn':s==='no_tries'?'Hôm nay bạn đã hết lượt':
    s==='killed'?'Boss tuần này đã bị hạ rồi 🎉':s==='low'?'Đóng góp chưa đủ 0,2% máu boss nên không nhận được thưởng':
    s==='small'?'Tông cần ít nhất 5 thành viên để tham gia Tông Chiến':
    s==='old'?'Quá hạn nhận thưởng (28 ngày) hoặc tuần chưa kết thúc':s==='moved'?'Bạn đã đổi tông giữa chừng — lượt không được tính':
    s==='expired'?'Lượt đánh đã quá hạn':'Không thực hiện được'}
function info(i){return CF.bosses[((i|0)%CF.bosses.length+CF.bosses.length)%CF.bosses.length]}
function tierOf(r){for(var i=0;i<CF.rw.length;i++){if(r>=CF.rw[i].a&&r<=CF.rw[i].b)return CF.rw[i]}return CF.rw[CF.rw.length-1]}
function roll(t){var s=0,r,i;t.forEach(function(x){s+=x.p});r=Math.random()*s;for(i=0;i<t.length;i++){if((r-=t[i].p)<0)return t[i]}return t[t.length-1]}
function oLabel(o){return o.k==='eq'?'Trang bị '+RN[o.r]:o.k==='nt'?o.q+' Mảnh Nguyệt Thạch':o.q+' Mảnh Thánh'}
function oOdds(t){var s=0;t.forEach(function(x){s+=x.p});return t.map(function(o){return '<span'+(o.k==='sh'?' style="color:#ffd96a"':'')+'>'+Math.round(o.p/s*100)+'% '+oLabel(o)+'</span>'}).join(' · ')}
function rwText(T){
  var a=['💰 '+nf(T.g)];
  if(T.sh)a.push('💠 '+T.sh+' Mảnh Thánh');if(T.nt)a.push('🌙 '+T.nt+' Mảnh Nguyệt Thạch');if(T.lt)a.push('💎 '+T.lt+' Linh Thạch khoá');
  if(T.c)a.push('🎁 1 Rương ngẫu nhiên: '+oOdds(T.c));
  return a.join('<br>')}
/* phát phần thưởng theo bảng T (g vàng, nt, sh, lt + rương ngẫu nhiên c). Trả chuỗi mô tả. */
function grant(T){
  var out=[],o,it;
  try{gold+=T.g;out.push('💰 '+nf(T.g))}catch(e){}
  try{if(T.nt){HL.addNT(T.nt);out.push('🌙 '+T.nt)}}catch(e){}
  try{if(T.sh&&typeof HL.addSH==='function'){HL.addSH(T.sh);out.push('💠 '+T.sh)}}catch(e){}
  try{if(T.lt&&window.LT&&LT.earnKS){LT.earnKS(T.lt);out.push('💎 '+T.lt)}}catch(e){}
  try{
    if(T.c){o=roll(T.c);
      if(o.k==='nt'){HL.addNT(o.q);out.push('🎁 Rương: 🌙 '+o.q+' Mảnh Nguyệt Thạch')}
      else if(o.k==='sh'){HL.addSH(o.q);out.push('🎁 Rương: 💠 <b>'+o.q+' Mảnh Thánh</b>!')}
      else{it=gen(P.lv,o.r,undefined,Math.max(typeof mapSel==='undefined'?0:mapSel|0,CF.mapMin));BAG.push(it);out.push('🎁 Rương: 📦 '+esc(it.n)+' ('+RN[it.r]+', cần Lv'+it.l+')')}}
  }catch(e){out.push('⚠ Lỗi phát rương — báo quản trị viên')}
  sav();return out.join(' · ')}
function bagFull(){try{return BAG.length>=capN()}catch(e){return false}}

/* ---------- 🐉 BOSS: trạng thái + giao diện ---------- */
var B={st:null,busy:false,loading:false,note:'',res:null};
function load(){
  if(B.loading)return;B.loading=true;
  rpc('tm_boss_status').then(function(r){B.loading=false;B.st=r;if(TMG.isOpen())TMG.render()})}
function bt(label,tab,a,b,cls,dis,busy){
  return '<button class="tmg-bt'+(cls?' '+cls:'')+'" '+(dis||busy?'disabled ':'')+'onclick="TMG.act(\'ext\',\''+tab+'\',\''+a+(b?':'+b:'')+'\')">'+label+'</button>'}
function html(g){
  var st=B.st,h='';
  if(!st){if(!B.loading)load();return '<div class="tmg-cd">⏳ Đang tải boss tuần này...</div>'}
  if(st.status!=='ok')return '<div class="tmg-cd">'+esc(err(st,'Boss Tông Môn'))+'</div><div class="tmg-row">'+bt('Thử lại','boss','reload')+'</div>';
  var bi=info(st.boss),pool=st.pool,dmg=Number(st.dmg)||0,killed=!!st.killed,left=Math.max(0,st.left|0);
  var pct=pool?Math.max(0,Math.min(100,Math.round((1-dmg/pool)*100))):100;
  h+='<div class="tmg-nt">'+B.note+'</div>';
  h+='<div class="tmg-cd" style="border-color:'+bi[1]+'88"><b style="color:'+bi[1]+'">🐉 '+esc(bi[0])+'</b> <small>Tuần từ '+esc(st.wk)+'</small>'
    +'<div class="tmg-bar"><i style="width:'+(killed?0:pct)+'%;background:linear-gradient(90deg,#8a1a1a,'+bi[1]+')"></i></div>'
    +'<small>'+(killed?'✅ <b>Đã bị hạ</b> — cả tông chờ nhận thưởng!':pool?'Máu còn '+big(Math.max(0,pool-dmg))+' / '+big(pool)+' ('+pct+'%)':'Máu boss sẽ được chốt sau lượt đánh đầu tiên của tuần (theo sức mạnh cả tông)')+'</small>'
    +'<small>Bạn đã gây: <b>'+big(st.my)+'</b> ('+(st.tries|0)+' lượt tuần này) · Lượt còn lại hôm nay: <b style="color:'+(left&&!killed?'#7fe08a':'#ff7a7a')+'">'+left+'/2</b></small>'
    +'<small>Mỗi lượt '+CF.secs+' giây · +'+nf(CF.gold+CF.goldPerLv*(g.lv|0))+'💰 · +30 cống hiến · tông +20 exp. Hạ boss: tông +500 exp.</small>'
    +'<div class="tmg-row">'+bt('⚔ Khiêu chiến ('+left+' lượt)','boss','go','','',left<=0||killed||typeof started==='undefined'||!started,B.busy)+bt('↻','boss','reload','','sm','',B.busy)+'</div></div>';
  if(B.res){var r=B.res;
    h+='<div class="tmg-cd"><b>⚔ Lượt vừa rồi</b><small>Sát thương: <b>'+big(r.dmg)+'</b> · 💰 +'+nf(r.gold)+'</small>'
      +(r.r?'<small>Hạng trong tông: <b>#'+r.r.rank+'</b>'+(r.r.kill_now?' · 🎉 <b>BẠN VỪA GIÁNG ĐÒN HẠ BOSS!</b>':'')+'</small>':r.err?'<small style="color:#ff9a7a">Chưa ghi được lên máy chủ: '+esc(r.err)+'</small>':'<small>Đang gửi lên máy chủ…</small>')+'</div>'}
  (st.pending||[]).forEach(function(p){
    var T=tierOf(p.rank|0);
    h+='<div class="tmg-cd" style="border-color:#ffd54a"><b>🎁 Thưởng tuần '+esc(p.wk)+'</b> · '+esc(p.guild)+'<small>Hạng <b>#'+(p.rank|0)+'</b>/'+(p.cnt|0)+' ('+T.t+') · '+big(p.dmg)+' sát thương</small>'
      +(p.ok?'<small>'+rwText(T)+'</small><div class="tmg-row">'+bt('Nhận thưởng','boss','claim',esc(p.wk),'on','',B.busy)+'</div>'
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
function act(a){
  var q=String(a||'').split(':'),k=q[0],v=q[1];
  if(k==='reload'){B.st=null;B.note='';load();TMG.render()}
  else if(k==='go')start('boss');
  else if(k==='claim')claim(v)}

function claim(wk){
  if(B.busy)return;
  if(bagFull()){B.note='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi nhận thưởng (rương có thể ra trang bị).';TMG.render();return}
  B.busy=true;B.note='⏳ Đang nhận thưởng...';TMG.render();
  rpc('tm_boss_claim',{p_wk:String(wk)}).then(function(r){
    B.busy=false;
    if(!r||r.status!=='ok'){B.note=esc(err(r,'Boss Tông Môn'));B.st=null;load();TMG.render();return}
    var T=tierOf(r.rank|0);
    say('🎁 Nhận thưởng Boss Tông Môn!','#ffd96a');
    B.note='🎉 Hạng #'+(r.rank|0)+'/'+(r.cnt|0)+': '+grant(T)+(r.ct?' · +'+r.ct+' cống hiến':'');
    B.st=null;load();try{TMG.refresh()}catch(e){}TMG.render()})}

/* ---------- ⚔ TÔNG CHIẾN: trạng thái + giao diện ---------- */
var W={st:null,busy:false,loading:false,note:'',res:null};
function wload(){
  if(W.loading)return;W.loading=true;
  rpc('tm_war_status').then(function(r){W.loading=false;W.st=r;if(TMG.isOpen())TMG.render()})}
var RES={win:'🏆 THẮNG',lose:'💢 Thua',draw:'🤝 Hoà',bye:'🚶 Không có đối thủ'};
function whtml(g){
  var st=W.st,h='';
  if(!st){if(!W.loading)wload();return '<div class="tmg-cd">⏳ Đang tải Tông Chiến...</div>'}
  if(st.status!=='ok')return '<div class="tmg-cd">'+esc(err(st,'Tông Chiến'))+'</div><div class="tmg-row">'+bt('Thử lại','war','reload')+'</div>';
  var left=Math.max(0,st.left|0);
  h+='<div class="tmg-nt">'+W.note+'</div>';
  (st.pending||[]).forEach(function(p){
    var T=CF.war.rw[p.res]||CF.war.rw.bye;
    h+='<div class="tmg-cd" style="border-color:#ffd54a"><b>🎁 Tông Chiến tuần '+esc(p.wk)+'</b> · '+esc(p.guild)
      +'<small>'+RES[p.res]+(p.oppname?' trước '+esc(p.oppname):'')+' · '+big(p.my)+' – '+big(p.opp)+'</small>'
      +'<small>'+rwText(T)+'</small><div class="tmg-row">'+bt('Nhận thưởng','war','claim',esc(p.wk),'on','',W.busy)+'</div></div>'});
  if(st.small){
    return h+'<div class="tmg-cd"><b>⚔ Tông Chiến</b><small>Tông cần ít nhất <b>5 thành viên</b> để được ghép đấu (hiện '+(st.cnt|0)+'). Hãy mở cửa nhận thêm người!</small></div>'}
  var opp=st.opp,sc=Number(st.score)||0,os=opp?Number(opp.score)||0:0,tot=sc+os,pc=tot?Math.round(sc/tot*100):50;
  h+='<div class="tmg-cd" style="border-color:#c0504d88"><b>⚔ Tông Chiến tuần '+esc(st.wk)+'</b>'
    +(opp?'<small>Đối thủ: <b style="color:#ff9a7a">'+esc(opp.name)+'</b> (ghép theo sức mạnh gần nhất)</small>'
          +'<div class="tmg-bar"><i style="width:'+pc+'%;background:linear-gradient(90deg,#3a8f4a,#7be07a)"></i></div>'
          +'<small>Tông bạn <b>'+big(sc)+'</b> — <b>'+big(os)+'</b> '+esc(opp.name)+' · '+(sc>os?'<span style="color:#7fe08a">đang dẫn</span>':sc<os?'<span style="color:#ff7a7a">đang thua</span>':'hoà')+'</small>'
        :'<small>⏳ Chưa có đối thủ — sẽ được ghép khi có tông khác vào Tông Chiến (cuối tuần chưa có = không có đối thủ). Bạn vẫn đánh được, điểm giữ nguyên.</small>')
    +'<small>Bạn đã gây: <b>'+big(st.my)+'</b> · Lượt còn lại hôm nay: <b style="color:'+(left?'#7fe08a':'#ff7a7a')+'">'+left+'/2</b></small>'
    +'<small>Mỗi lượt '+CF.secs+' giây · +'+nf(CF.war.gold+CF.war.goldPerLv*(g.lv|0))+'💰 · +20 cống hiến · tông +15 exp. Kết thúc thứ Hai 00:00 (giờ VN).</small>'
    +'<div class="tmg-row">'+bt('⚔ Khiêu chiến ('+left+' lượt)','war','go','','',left<=0||typeof started==='undefined'||!started,W.busy)+bt('↻','war','reload','','sm','',W.busy)+'</div></div>';
  if(W.res){var r=W.res;
    h+='<div class="tmg-cd"><b>⚔ Lượt vừa rồi</b><small>Sát thương: <b>'+big(r.dmg)+'</b> · 💰 +'+nf(r.gold)+'</small>'
      +(r.r?'<small>Điểm tông hiện tại: <b>'+big(r.r.score)+'</b></small>':r.err?'<small style="color:#ff9a7a">Chưa ghi được lên máy chủ: '+esc(r.err)+'</small>':'<small>Đang gửi lên máy chủ…</small>')+'</div>'}
  var top=st.top||[];
  h+='<div class="tmg-cd"><b>🏆 Sát thương trong tông (tuần này)</b>';
  if(!top.length)h+='<small>Chưa ai đánh.</small>';
  else h+='<table style="width:100%;font-size:12.5px;border-collapse:collapse">'+top.map(function(x,i){
    return '<tr style="'+(x.me?'background:#4a3410;font-weight:bold':'')+'"><td style="width:26px;text-align:center;color:#ffd54a">'+(i+1)+'</td><td>'+esc(x.name||'?')+' <small style="display:inline">· '+(x.tries|0)+' lượt</small></td><td style="text-align:right;white-space:nowrap">'+big(x.dmg)+'</td></tr>'}).join('')+'</table>';
  h+='</div>';
  h+='<details class="tmg-cd"><summary>🎁 Bảng thưởng Tông Chiến</summary>'+['win','draw','lose','bye'].map(function(k){var T=CF.war.rw[k];return '<div class="tmg-cd"><b>'+T.t+'</b><small>'+rwText(T)+'</small></div>'}).join('')+'<small>Cần ≥ 2 lượt trong tuần. Kèm +80 cống hiến (thắng +200).</small></details>';
  return h}
function wact(a){
  var q=String(a||'').split(':'),k=q[0],v=q[1];
  if(k==='reload'){W.st=null;W.note='';wload();TMG.render()}
  else if(k==='go')start('war');
  else if(k==='claim')wclaim(v)}
function wclaim(wk){
  if(W.busy)return;
  if(bagFull()){W.note='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi nhận thưởng (rương có thể ra trang bị).';TMG.render();return}
  W.busy=true;W.note='⏳ Đang nhận thưởng...';TMG.render();
  rpc('tm_war_claim',{p_wk:String(wk)}).then(function(r){
    W.busy=false;
    if(!r||r.status!=='ok'){W.note=esc(err(r,'Tông Chiến'));W.st=null;wload();TMG.render();return}
    var T=CF.war.rw[r.res]||CF.war.rw.bye;
    say('🎁 Nhận thưởng Tông Chiến!','#ffd96a');
    W.note=RES[r.res]+' ('+big(r.my)+' – '+big(r.opp)+'): '+grant(T)+(r.ct?' · +'+r.ct+' cống hiến':'');
    W.st=null;wload();try{TMG.refresh()}catch(e){}TMG.render()})}

/* ---------- vào trận (dùng chung cho Boss và Tông Chiến, cờ riêng dg.tb / e.tb) ---------- */
function start(kind){
  var X=kind==='war'?W:B;
  if(X.busy||typeof started==='undefined'||!started||dg||over)return;
  X.busy=true;X.note='⏳ Đang vào trận...';TMG.render();
  rpc(kind==='war'?'tm_war_begin':'tm_boss_begin').then(function(r){
    X.busy=false;
    if(!r||r.status!=='ok'){X.note=esc(err(r,kind==='war'?'Tông Chiến':'Boss Tông Môn'));X.st=null;(kind==='war'?wload:load)();TMG.render();return}
    go(r,kind)})}
function go(r,kind){
  var X=kind==='war'?W:B,nm,bi;
  try{if(window.TT2&&TT2.on&&TT2.on()&&TT2.leave)TT2.leave()}catch(e){}
  if(kind==='war'){bi=info(r.opp|0);nm='Hộ Pháp '+((X.st&&X.st.opp&&X.st.opp.name)||'Tông Địch')}
  else{bi=info(r.boss);nm=bi[0]}
  TMG.close();X.res=null;X.note='';bo=0;try{bag.style.display='none'}catch(e){}
  var l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
  dg={t:0,n:20,kill:20,tb:1,bt:0,tt:CF.secs*60,dmg:0,lg0:l0,v0:v0,fin:0,out:0,kind:kind,nm:nm,col:bi[1],hue:bi[2],glv:r.glv|0};
  DT.push({x:P.x,y:200,s:(kind==='war'?'⚔ ':'🐉 ')+nm+' · đánh '+CF.secs+' giây!',c:bi[1],g:1,l:150})}
function spawnBoss(){
  dgSp('boss');var e=E[E.length-1];
  e.max=e.hp=CF.hp;e.lv=P.lv+CF.lvAdd;e.tb=1;e.tbN=dg.nm;e.tbC=dg.col;e.tbH=dg.hue;e.tbA=CF.atk;e.tbS=dg.kind==='war'?'TÔNG CHIẾN':'TÔNG MÔN';
  e.hn8=0;e._bup=1;   /* tắt x6,4 sát thương của boss Hầm Ngục thường (world/89) và tăng máu (systems/67): đây là trận đo sát thương */
  DT.push({x:P.x,y:220,s:(dg.kind==='war'?'⚔ ':'🐉 ')+dg.nm+' xuất hiện!',c:dg.col,g:1,l:170})}
function finish(w,why){
  if(w.fin)return;w.fin=1;w.out=150;
  var war=w.kind==='war',X=war?W:B,dmg=Math.max(0,Math.round(w.dmg)),
      gd=war?CF.war.gold+CF.war.goldPerLv*(w.glv|0):CF.gold+CF.goldPerLv*(w.glv|0);
  E=E.filter(function(e){return !e.tb});PJ=[];
  try{gold+=gd}catch(e){}sav();
  var res={dmg:dmg,gold:gd,err:'',r:null};X.res=res;X.st=null;
  DT.push({x:P.x,y:200,s:(why==='dead'?'💀 Gục ngã! ':'⏱ Hết giờ! ')+'Sát thương: '+nf(dmg),c:'#ffe08a',g:1,l:190});
  rpc(war?'tm_war_end':'tm_boss_end',{p_dmg:dmg}).then(function(r){
    if(r&&r.status==='ok'){res.r=r;if(r.kill_now)say('🎉 TÔNG MÔN HẠ BOSS!','#ffd96a')}else res.err=err(r,war?'Tông Chiến':'Boss Tông Môn');
    X.st=null;if(TMG.isOpen()){(war?wload:load)();TMG.render()}})}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();dgHud()}
function reopen(w){(w&&w.kind==='war'?W:B).st=null;try{TMG.reopen(w&&w.kind==='war'?'war':'boss')}catch(e){}}

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
  _exit();if(w){back(w);reopen(w)}};
var _init=init;init=function(){
  var w=dg&&dg.tb?dg:null;if(w&&!w.fin)finish(w,'dead');
  _init();if(w){back(w);reopen(w)}};
var _hurt=dgHurt;dgHurt=function(e,mu){_hurt(e,e&&e.tb?mu*e.tbA:mu)};
var _hud=dgHud;dgHud=function(){
  _hud();
  if(dg&&dg.tb){var sec=Math.max(0,Math.ceil((dg.tt-dg.bt)/60));
    dgh.innerHTML='<div class="dgt" style="color:'+dg.col+'">'+(dg.kind==='war'?'⚔ ':'🐉 ')+esc(dg.nm)+(dg.bs&&!dg.fin?' · ⏱ '+sec+'s':'')+'</div><div class="dgt">⚔ Sát thương: '+nf(dg.dmg)+'</div>'}};
window.BGLOW=window.BGLOW||function(col){var C=BGLOW.c=BGLOW.c||{},c=C[col];if(!c){c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),r=q.createRadialGradient(64,64,64*.1/1.5,64,64,64);r.addColorStop(0,col+'88');r.addColorStop(.5,col+'44');r.addColorStop(1,col+'00');q.fillStyle=r;q.beginPath();q.arc(64,64,64,0,6.283);q.fill();C[col]=c}return c};/* Fix431: quầng sáng boss vẽ sẵn 1 lần/màu thay vì tạo gradient mỗi khung */
var _foe=dgFoe;dgFoe=function(e){
  if(!e.tb)return _foe(e);
  var col=e.tbC,X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
  g.save();g.globalCompositeOperation='lighter';
  g.globalAlpha=.75+.2*Math.sin(fr*.1);g.drawImage(BGLOW(col),X-R0*1.5,Y-R0*1.5,R0*3,R0*3);g.restore();
  g.save();try{if((window.QL|0)===0&&'filter' in g)g.filter='hue-rotate('+e.tbH+'deg)'}catch(x){}_foe(e);g.restore();
  g.save();g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
  var ty=GY-((e.y||0)+268)*s,tx=e.tbN+' · '+(e.tbS||'TÔNG MÔN');g.strokeText(tx,X,ty);g.fillStyle=col;g.fillText(tx,X,ty);g.restore()};

TMG.addTab('boss','🐉 Boss',html,act);
TMG.addTab('war','⚔ Chiến',whtml,wact);
window.TMB={cfg:CF,html:html,act:act};
})();
