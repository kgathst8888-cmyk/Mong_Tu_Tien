/* ===== 🏯 BẾ QUAN ĐÀI — NÂNG CẤP (Fix375) =====
 * Gắn thêm vào world/57-hon-phach.js (load SAU 57 và 59). Dữ liệu lưu trong PS[cur].hpc.bq = {lv,sub,ms,mh,hu,tn,day,seen}.
 * 1) 🧘 NHẬP ĐỊNH NGOẠI TUYẾN: chọn 1/4/8 giờ, thoát game vẫn tích hồn phách; vào lại bấm "Thu hoạch" (tự nạp vào tu vi).
 *    Có trần giờ mỗi ngày (tăng theo cấp Đài). Chống LÙI giờ máy (nhớ mốc giờ lớn nhất đã thấy). CHƯA chống TIẾN giờ máy (cần giờ máy chủ để chặn hẳn).
 * 2) 🌑 TÂM MA KIẾP (Đài cấp 2+): mini-game đấu tâm, 3 lượt/ngày. Thắng → hồn phách + cơ hội Mảnh Đúc Thần Thể. KHÔNG đụng engine chiến đấu.
 * 3) ☯ CỘNG HƯỞNG (Đài cấp 3+): khắc ấn 1 hồn phách phụ (khác hồn phách chính) lên đài → cộng thêm % HP/sát thương/phòng thủ theo cảnh giới
 *    (đồng đạo Phật–Tiên / Yêu–Minh mạnh hơn). Móc vào HONP.sm() nên engine tự nhận.
 * 4) 🏯 ĐÀI TRẬN PHÁP (cấp 0→5, trừ 💎 Linh Thạch qua LT.spend, cần đăng nhập): +25% tốc độ nhập định/cấp, +2 giờ trần/ngày/cấp,
 *    vẽ thêm vòng trận trên đài. Mỗi lần trừ ≤1000💎 (giới hạn máy chủ).
 * Mở từ nút "🏯 Đài Trận Pháp" trong bảng tu luyện của Bế Quan Đài (world/57 renderPanel gọi BQX.btn()). Chỉnh số: khối CF. */
(function(){
'use strict';
if(typeof window.HONP==='undefined'||!HONP.chosen||!HONP.cfg)return;

var CF={
 dai:{max:5,cost:[50,100,200,400,800],rate:500,rateLv:.25,capH:8,capLv:2,hours:[1,4,8]},   /* rate = hồn phách/giờ ở cấp 0 */
 res:{minLv:3,first:300,change:100,co:.025,cross:.015},                                   /* co: đồng đạo, cross: khác đạo — nhân với cảnh giới (tối đa 8) */
 tm:{minLv:2,perDay:3,hearts:3,wins:4,rev0:.30,revLv:.06,rewardPct:.04,shardChance:.2}
};
/* Di trú nhân vật cũ (Fix376): nhân vật chọn hồn phách TRƯỚC mốc cutoff và chưa từng dùng Đài mới sẽ được tính lại cảnh giới
   theo TỔNG tu vi đã tích (tu vi các lần đột phá theo bảng cũ + tu vi đang có) rồi xếp vào bảng ×25 mới → tụt về cảnh giới đúng với tu vi. Chỉ chạy 1 lần (d.mg=1). */
CF.mig={cutoff:1792545365642,cutoff2:1792545720437,old:[200,400,800,1600,3200,6400,12800,25600],x25:[5000,10000,20000,40000,80000,160000,320000,640000]};   /* old = bảng gốc · x25 = Fix375/376 · bảng hiện tại = HONP.cfg.need (cảnh giới 2 trở đi ×3) */
var NIEM=[{e:'🔥',n:'Dục'},{e:'💧',n:'Sân'},{e:'🌑',n:'Si'}];
var COUNTER=[{e:'🧘',n:'Định'},{e:'🪷',n:'Từ Bi'},{e:'📿',n:'Trí Tuệ'}];
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';

function nf(n){return(Number(n)||0).toLocaleString('vi-VN')}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:150})}catch(e){}}
function save(){try{sv()}catch(e){}try{ui()}catch(e){}}
function D(){try{return HONP.chosen()}catch(e){return null}}
function dayKey(){var t=new Date();return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate()}
function B(d){
  var b=d.bq;if(!b||typeof b!=='object')b=d.bq={};
  if(typeof b.lv!=='number')b.lv=0;b.lv=Math.max(0,Math.min(CF.dai.max,b.lv|0));
  if(typeof b.sub!=='number')b.sub=-1;
  b.ms=+b.ms||0;b.mh=+b.mh||0;b.hu=+b.hu||0;b.tn=b.tn|0;b.seen=+b.seen||0;
  if(b.day!==dayKey()){b.day=dayKey();b.hu=0;b.tn=0}
  return b}
function nowT(b){var n=Date.now();if(n<b.seen-60000)return b.seen;if(n>b.seen)b.seen=n;return n}   /* lùi giờ máy → đứng yên */
function capH(b){return CF.dai.capH+CF.dai.capLv*b.lv}
function rate(b){return CF.dai.rate*(1+CF.dai.rateLv*b.lv)}
function maxed(d){return(d.r|0)>=8}
function fmt(ms){ms=Math.max(0,Math.ceil(ms/1000));var h=Math.floor(ms/3600),m=Math.floor(ms%3600/60),s=ms%60;return(h?h+':':'')+(h&&m<10?'0':'')+m+':'+(s<10?'0':'')+s}

/* ---------- Cộng hưởng: cộng vào HONP.sm() (engine nhân vào atk/mx/df) ---------- */
function resBonus(){
  var d=D();if(!d)return 0;var b=d.bq;
  if(!b||(b.lv|0)<CF.res.minLv||typeof b.sub!=='number'||b.sub<0||b.sub>3||b.sub===d.t)return 0;
  var same=(d.t%2===b.sub%2);                       /* 0 Phật,2 Tiên · 1 Yêu,3 Minh → cùng tính chẵn/lẻ = đồng đạo */
  return(same?CF.res.co:CF.res.cross)*Math.min(8,d.r|0)}
function migrate(d){
  var mg=d.mg|0;if(mg>=2)return;d.mg=2;
  if(d.ts>=CF.mig.cutoff2)return;                          /* nhân vật tạo sau bản này → giữ nguyên */
  /* bảng nguồn = bảng nhân vật đã chơi: mg=1 hoặc có d.bq hoặc tạo sau cutoff → ×25; còn lại → bảng gốc */
  var src=(mg===1||d.bq||d.ts>=CF.mig.cutoff)?CF.mig.x25:CF.mig.old;
  var r0=Math.min(8,d.r|0),x0=Math.max(0,d.x|0),tot=x0,i,nd=HONP.cfg.need||[];
  for(i=0;i<r0;i++)tot+=src[i]||0;
  var r=0;while(r<8&&nd[r]>0&&tot>=nd[r]){tot-=nd[r];r++}
  if(!d.mo)d.mo={r:r0,x:x0};                               /* lưu cảnh giới/tu vi trước lần cân bằng đầu */
  if(r!==r0||tot!==x0){d.r=r;d.x=tot;save();
    say('⚖ Tu vi hồn phách cân bằng lại: cảnh giới '+HONP.realms[r0]+' → '+HONP.realms[r]+' (giữ '+nf(tot)+' tu vi)','#ffd76a')}
  else save()}
var _ch=HONP.chosen;
HONP.chosen=function(){var d=_ch.apply(this,arguments);if(d&&(d.mg|0)<2){try{migrate(d)}catch(e){}}return d};
var _sm=HONP.sm;
HONP.sm=function(){D();return _sm.apply(this,arguments)};   /* D() kích hoạt di trú trước; cộng hưởng đã nằm trong sm() của world/57 */

/* ---------- trừ Linh Thạch ---------- */
var busy=false,msg='',bqPend=null;
setInterval(function(){try{if(bqPend&&cur===bqPend.who){var q=bqPend;bqPend=null;q.done()}}catch(e){bqPend=null}},1000);
function pay(amount,key,done){
  if(busy)return;
  if(!(window.LT&&LT.logged&&LT.logged()&&LT.spend)){msg='☁ Cần đăng nhập tài khoản để dùng 💎 Linh Thạch.';render();return}
  var who=cur;busy=true;msg='Đang trừ '+nf(amount)+'💎…';render();
  LT.spend(amount,key).then(function(r){
    busy=false;
    if(!r||!r.ok){msg=(r&&r.err==='poor')?'Không đủ 💎: cần '+nf(amount)+'💎, bạn có '+nf(r.lt|0)+'💎.':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+')';render();return}
    if(cur!==who){bqPend={who:who,done:done};msg='⚠ Bạn đã đổi nhân vật khi đang trừ 💎 — quyền lợi sẽ được cộng khi quay lại nhân vật cũ.';render();return}   /* Fix379: trước đây trừ 💎 xong mà mất quyền lợi */
    done()}).catch(function(){busy=false;msg='Không trừ được Linh Thạch (lỗi mạng).';render()})}

/* ---------- 4) nâng cấp Đài ---------- */
function upgrade(){
  var d=D();if(!d)return;var b=B(d);if(b.lv>=CF.dai.max)return;var c=CF.dai.cost[b.lv];
  pay(c,'bq_dai',function(){var d2=D();if(!d2)return;var b2=B(d2);b2.lv=Math.min(CF.dai.max,b2.lv+1);save();
    msg='🏯 Đài Trận Pháp lên cấp '+b2.lv+' (−'+nf(c)+'💎)';say('🏯 Đài Trận Pháp cấp '+b2.lv,'#9fe0c0');render()})}

/* ---------- 3) cộng hưởng ---------- */
function setSub(i){
  var d=D();if(!d)return;var b=B(d);
  if(b.lv<CF.res.minLv||i===d.t||i===b.sub||i<0||i>3)return;
  var c=b.sub<0?CF.res.first:CF.res.change;
  pay(c,'bq_an',function(){var d2=D();if(!d2)return;var b2=B(d2);b2.sub=i;save();
    msg='☯ Đã khắc ấn '+HONP.souls[i].n+' (−'+nf(c)+'💎) — cộng hưởng +'+Math.round(resBonus()*100)+'%';say('☯ Cộng hưởng '+HONP.souls[i].n,HONP.souls[i].c);render()})}

/* ---------- 1) nhập định ngoại tuyến ---------- */
function elapsed(b){if(!(b.ms>0))return 0;return Math.max(0,Math.min(nowT(b)-b.ms,b.mh*3600000))}
function startMed(h){
  var d=D();if(!d)return;var b=B(d);
  if(b.ms>0||maxed(d))return;
  if(h>capH(b)-b.hu+1e-9){msg='Hôm nay không còn đủ giờ nhập định.';render();return}
  b.ms=nowT(b);b.mh=h;save();say('🧘 Bắt đầu nhập định '+h+' giờ','#c8f0d8');render()}
function claimMed(){
  var d=D();if(!d)return;var b=B(d);if(!(b.ms>0))return;
  var el=elapsed(b),hrs=el/3600000,gain=Math.floor(hrs*rate(b));
  b.hu+=hrs;b.ms=0;b.mh=0;save();
  if(gain>0){HONP.collect(gain);if(!maxed(d))HONP.deposit()}
  msg=gain>0?'🎁 Xuất quan: +'+nf(gain)+' hồn phách → tu vi':'Xuất quan quá sớm, chưa tích được hồn phách.';render()}

/* ---------- 2) tâm ma kiếp ---------- */
var T=null;
function hearts(d){return CF.tm.hearts+((d.r|0)>=4?1:0)+((d.r|0)>=8?1:0)}
function round(b){T.nie=Math.floor(Math.random()*3);T.rev=Math.random()<Math.min(.9,CF.tm.rev0+CF.tm.revLv*b.lv)}
function startTm(){
  var d=D();if(!d||T)return;var b=B(d);
  if(b.lv<CF.tm.minLv||b.tn>=CF.tm.perDay)return;
  b.tn++;save();T={h:hearts(d),w:0,r:0,end:null,who:cur};round(b);render()}
function pickTm(k){
  var d=D();if(!d||!T||T.end)return;var b=B(d),ok=(k===T.nie);
  T.last=(ok?'✅ ':'❌ ')+'Tâm ma hiện '+NIEM[T.nie].e+' '+NIEM[T.nie].n+' — bạn dùng '+COUNTER[k].e+' '+COUNTER[k].n;
  if(ok)T.w++;else T.h--;T.r++;
  if(T.w>=CF.tm.wins){
    var nd=(HONP.cfg.need||[])[d.r|0]||0,g=maxed(d)?0:Math.round(nd*CF.tm.rewardPct),sh=(maxed(d)||Math.random()<CF.tm.shardChance)?1:0;
    if(g>0){HONP.collect(g);HONP.deposit()}if(sh)HONP.shard(1);save();
    T.end={win:1,txt:'🌟 Trảm tâm ma thành công!'+(g?' +'+nf(g)+' hồn phách':'')+(sh?' · +1 🧩 Mảnh Đúc Thần Thể':'')};
    say('🌟 Trảm tâm ma!','#d9b8ff')}
  else if(T.h<=0)T.end={win:0,txt:'💀 Tâm ma bất diệt — đạo tâm tan vỡ. Hãy thử lại.'};
  else round(b);
  render()}

/* ---------- giao diện ---------- */
var ov=null,iv=0,fin=false;
function stop(o){['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){o.addEventListener(t,function(e){e.stopPropagation()})});return o}
function bar(p,c){return '<div style="height:8px;border:1px solid #8a7440;border-radius:6px;overflow:hidden;background:#1d1510;margin:4px 0"><div id="bq-b" style="height:100%;width:'+Math.max(0,Math.min(100,p))+'%;background:'+c+'"></div></div>'}
function bt(label,key,val,on,col){
  return '<button '+(on?'data-b="'+key+'" data-v="'+(val===undefined?'':val)+'"':'disabled')+' style="flex:1;min-width:0;padding:9px 4px;border:0;border-radius:9px;background:'+(on?(col||'#5a3a8a'):'#333')+';color:#fff;font-size:12.5px;opacity:'+(on?1:.55)+'">'+label+'</button>'}
function box(t,body,c){return '<div style="border:1px solid '+(c||'#6a5a8a')+';border-radius:10px;padding:8px;margin:7px 0;background:#160f20"><div style="font-size:14px;margin-bottom:3px"><b>'+t+'</b></div>'+body+'</div>'}
function render(){
  var d=D();if(!d||!ov)return;
  if(T&&T.who!==cur)T=null;
  var b=B(d),S=HONP.souls[d.t],lv=b.lv,h='';
  /* Đài */
  var dh='<div style="font-size:12.5px">Cấp <b>'+lv+' / '+CF.dai.max+'</b> · Tốc độ nhập định <b>×'+(1+CF.dai.rateLv*lv).toFixed(2)+'</b> · Trần <b>'+capH(b)+'h</b>/ngày</div>'+
    '<div style="font-size:11.5px;opacity:.75">Cấp 2: mở Tâm Ma Kiếp · Cấp 3: mở Cộng Hưởng</div>'+
    (lv<CF.dai.max?'<div style="display:flex;margin-top:6px">'+bt('⬆ Nâng Đài lên cấp '+(lv+1)+' — '+nf(CF.dai.cost[lv])+'💎','up','',!busy,'#7a4ad0')+'</div>':'<div style="font-size:12px;color:#9fe0c0;margin-top:4px">Đài đã đạt cấp tối đa.</div>');
  h+=box('🏯 Đài Trận Pháp',dh,'#9fe0c0');
  /* Nhập định */
  var rem=Math.max(0,capH(b)-b.hu),mh='';
  if(b.ms>0){
    var el=elapsed(b),tot=b.mh*3600000,done=el>=tot;
    mh='<div style="font-size:12.5px">Đang nhập định <b>'+b.mh+' giờ</b> · <span id="bq-t">'+(done?'✅ Đã xong':'còn '+fmt(tot-el))+'</span></div>'+bar(el/tot*100,'linear-gradient(90deg,#3f9a7a,'+S.c+')')+
      '<div style="font-size:12px;opacity:.85">Dự kiến: <b id="bq-g">+'+nf(Math.floor(el/3600000*rate(b)))+'</b> hồn phách (thoát game vẫn chạy)</div>'+
      '<div style="display:flex;margin-top:6px">'+bt(done?'🎁 Thu hoạch':'🚪 Xuất quan sớm','claim','',true,done?'#2f8a5a':'#8a5a2a')+'</div>'}
  else if(maxed(d))mh='<div style="font-size:12.5px;opacity:.8">Hồn phách đã viên mãn — không cần nhập định thêm.</div>';
  else mh='<div style="font-size:12px;opacity:.85">Tốc độ: <b>'+nf(Math.round(rate(b)))+'</b> hồn phách/giờ · Hôm nay còn <b>'+(Math.floor(rem*10)/10)+'h</b></div><div style="display:flex;gap:6px;margin-top:6px">'+
    CF.dai.hours.map(function(x){return bt(x+' giờ<br><small>+'+nf(Math.round(x*rate(b)))+'</small>','med',x,x<=rem+1e-9)}).join('')+'</div>';
  h+=box('🧘 Nhập định ngoại tuyến',mh);
  /* Cộng hưởng */
  var rh='';
  if(lv<CF.res.minLv)rh='<div style="font-size:12px;opacity:.7">🔒 Cần Đài cấp '+CF.res.minLv+'.</div>';
  else{
    rh='<div style="font-size:12px;opacity:.85">Khắc ấn 1 hồn phách phụ: cộng thêm <b>% HP/sát thương/phòng thủ</b> theo cảnh giới (đồng đạo <b>'+(CF.res.co*100)+'%</b>/cảnh, khác đạo <b>'+(CF.res.cross*100)+'%</b>/cảnh). Hiện: <b>+'+(resBonus()*100).toFixed(1)+'%</b></div><div style="display:flex;gap:5px;margin-top:6px">'+
      HONP.souls.map(function(s,i){var on=(i!==d.t&&i!==b.sub&&!busy),cur_=(i===b.sub);
        return i===d.t?'<button disabled style="flex:1;padding:8px 2px;border:1px solid '+s.c+';border-radius:9px;background:#222;color:'+s.c+';font-size:11.5px">'+s.e+'<br>Chính</button>':
          '<button '+(on?'data-b="sub" data-v="'+i+'"':'disabled')+' style="flex:1;padding:8px 2px;border:1px solid '+(cur_?s.c:'#4a3a2a')+';border-radius:9px;background:'+(cur_?'#3a2a50':'#1a1210')+';color:#fff;font-size:11.5px">'+s.e+'<br>'+s.n+'<br><small>'+(cur_?'đang khắc':nf(b.sub<0?CF.res.first:CF.res.change)+'💎')+'</small></button>'}).join('')+'</div>'}
  h+=box('☯ Cộng hưởng hồn phách',rh);
  /* Tâm ma */
  var th='';
  if(lv<CF.tm.minLv)th='<div style="font-size:12px;opacity:.7">🔒 Cần Đài cấp '+CF.tm.minLv+'.</div>';
  else if(!T)th='<div style="font-size:12px;opacity:.85">Đấu tâm: đoán đúng niệm của tâm ma để khắc chế. Thắng <b>'+CF.tm.wins+'</b> lượt trước khi cạn đạo tâm. Dục→Định · Sân→Từ Bi · Si→Trí Tuệ. Đài càng cao, tâm ma càng dễ lộ niệm. Còn <b>'+Math.max(0,CF.tm.perDay-b.tn)+'/'+CF.tm.perDay+'</b> lượt hôm nay.</div><div style="display:flex;margin-top:6px">'+bt('🌑 Vào Tâm Ma Kiếp','tm','',b.tn<CF.tm.perDay,'#6a2a6a')+'</div>';
  else{
    th='<div style="font-size:13px">❤ Đạo tâm: <b>'+Math.max(0,T.h)+'</b> · Thắng: <b>'+T.w+'/'+CF.tm.wins+'</b></div>'+(T.last?'<div style="font-size:12px;opacity:.85;margin:3px 0">'+T.last+'</div>':'');
    if(T.end)th+='<div style="font-size:13px;margin:6px 0;color:'+(T.end.win?'#ffe9a0':'#ff9a9a')+'">'+T.end.txt+'</div><div style="display:flex">'+bt('Đóng','tmx','',true,'#444')+'</div>';
    else th+='<div style="font-size:14px;margin:6px 0;text-align:center">'+(T.rev?'Tâm ma hiện niệm: <b style="font-size:20px">'+NIEM[T.nie].e+' '+NIEM[T.nie].n+'</b>':'<b style="font-size:16px">❓ Tâm ma ẩn mình — hãy đoán!</b>')+'</div><div style="display:flex;gap:6px">'+COUNTER.map(function(c,i){return bt(c.e+'<br>'+c.n,'pk',i,true,'#4a3a8a')}).join('')+'</div>'}
  h+=box('🌑 Tâm Ma Kiếp',th,'#8a4a8a');
  ov.innerHTML='<div style="width:min(460px,100%);max-height:96%;overflow-y:auto;border:2px solid '+S.c+';border-radius:14px;background:#120c1c;padding:12px 14px"><div style="display:flex;align-items:center"><b style="flex:1;font-size:16px;color:'+S.c+'">🏯 Đài Trận Pháp · Bế Quan</b><button data-b="x" style="background:none;border:0;color:#f2e3b3;font-size:20px">✕</button></div>'+
    (msg?'<div style="font-size:12.5px;margin:4px 0;color:#ffe9a0">'+msg+'</div>':'')+h+'</div>';
}
function tick(){
  var d=D();if(!d||!ov||ov.style.display==='none'){clearInterval(iv);iv=0;return}
  var b=B(d);if(!(b.ms>0))return;var el=elapsed(b),tot=b.mh*3600000;
  if(el>=tot){if(!fin){fin=true;render()}return}   /* chỉ dựng lại 1 lần khi xong (tránh nuốt chạm) */
  fin=false;
  var t=document.getElementById('bq-t'),g=document.getElementById('bq-g'),p=document.getElementById('bq-b');
  if(t)t.textContent='còn '+fmt(tot-el);if(g)g.textContent='+'+nf(Math.floor(el/3600000*rate(b)));if(p)p.style.width=(el/tot*100)+'%'}
function open(){
  if(!D())return;
  if(!ov){ov=document.createElement('div');ov.id='bq-ov';document.body.appendChild(stop(ov));
    ov.onclick=function(e){
      var a=e.target.closest&&e.target.closest('[data-b]');
      if(!a){if(e.target===ov)close();return}
      var k=a.dataset.b,v=a.dataset.v;msg='';
      if(k==='x')close();else if(k==='up')upgrade();else if(k==='med')startMed(+v);else if(k==='claim')claimMed();
      else if(k==='sub')setSub(+v);else if(k==='tm')startTm();else if(k==='pk')pickTm(+v);else if(k==='tmx'){T=null;render()}}}
  ov.style.cssText='position:fixed;inset:0;z-index:14;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);font-family:system-ui,sans-serif;color:#f2e3b3;padding:10px;box-sizing:border-box';
  msg='';fin=false;render();if(!iv)iv=setInterval(tick,1000)}
function close(){if(ov)ov.style.display='none';clearInterval(iv);iv=0;try{if(window.HONP&&HONP.on()&&HONP.open)HONP.open()}catch(e){}}

/* nút trong bảng tu luyện (world/57 renderPanel) */
function btn(){
  var d=D();if(!d)return'';var b=B(d),st='';
  if(b.ms>0)st=elapsed(b)>=b.mh*3600000?' · 🎁 đã xong, thu hoạch!':' · đang nhập định';
  return '<button onclick="BQX.open()" style="width:100%;margin-top:6px;padding:10px;border:1px solid #9fe0c0;border-radius:9px;background:#10281f;color:#d8ffee;font-weight:700">🏯 Đài Trận Pháp · Nhập định · Tâm ma (cấp '+b.lv+'/'+CF.dai.max+')'+st+'</button>'}

/* vòng trận phụ vẽ trên đài theo cấp (gọi từ world/57 draw, trước hồn phách) */
function deco(g,W,H,s,gy,t,d){
  if(!d)return;var b=B(d),lv=b.lv,S=HONP.souls[d.t],x=W/2,feet=gy-2*s;
  if(lv>0){g.save();g.translate(x,feet);g.scale(1,.2);g.lineCap='round';
    for(var i=0;i<lv;i++){g.setLineDash([(7+i)*s,(11+i*2)*s]);g.lineDashOffset=(i%2?-1:1)*t*.35;g.strokeStyle=S.c;g.globalAlpha=.22+.1*Math.sin(t*.03+i);g.lineWidth=(2.2-i*.2)*s;g.beginPath();g.arc(0,0,(150+i*30)*s,0,6.283);g.stroke()}
    g.restore()}
  if(b.ms>0){g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(x,feet-60*s,4,x,feet-60*s,190*s);q.addColorStop(0,S.c+'55');q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55+.2*Math.sin(t*.05);g.fillStyle=q;g.beginPath();g.arc(x,feet-60*s,190*s,0,6.283);g.fill();g.restore();
    var el=elapsed(b),tot=b.mh*3600000,tx=el>=tot?'🎁 Nhập định xong — chạm hồn phách để thu hoạch':'🧘 Nhập định · còn '+fmt(tot-el);
    g.save();g.font='bold '+Math.max(11,12*s)+'px '+FONT;g.textAlign='center';g.fillStyle='#e8fff2';g.strokeStyle='#000b';g.lineWidth=3;g.strokeText(tx,x,feet+22*s);g.fillText(tx,x,feet+22*s);g.restore()}
  if(resBonus()>0){var U=HONP.souls[b.sub];g.save();g.globalCompositeOperation='lighter';var gx=x+210*s,gyy=feet-50*s,q2=g.createRadialGradient(gx,gyy,2,gx,gyy,34*s);q2.addColorStop(0,U.c+'88');q2.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.7+.2*Math.sin(t*.06);g.fillStyle=q2;g.beginPath();g.arc(gx,gyy,34*s,0,6.283);g.fill();g.restore();
    g.save();g.font=Math.max(16,22*s)+'px sans-serif';g.textAlign='center';g.fillText(U.e,gx,gyy+8*s);g.restore()}
}

window.BQX={migrate:migrate,open:open,close:close,btn:btn,deco:deco,cfg:CF,resBonus:resBonus,upgrade:upgrade,startMed:startMed,claim:claimMed,get:function(){var d=D();return d?B(d):null}};
})();
