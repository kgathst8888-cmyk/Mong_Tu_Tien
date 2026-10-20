/* ===== ✨ KỲ NGỘ TIÊN DUYÊN (world/112-ky-ngo-tien-duyen.js, Fix349, Fix350 thêm Đan Sư) =====
 * Chống nhàm chán giai đoạn đầu: khi hạ quái THƯỜNG ở 2 map đầu (mapSel 0-1, Lv ≤ CF.maxLv) có CF.rate (1,5%) gặp "Kỳ Ngộ".
 * - Kỳ Ngộ hiện ở nút nổi bên trái (📖 → ✨ + đếm ngược CF.life giây). Bỏ lỡ thì tan biến. Cách nhau ít nhất CF.cd ms.
 * - 4 loại (bảng EV, data-driven): 🧓 Lão Ăn Mày · 🐺 Linh Thú Bị Thương · 🕳️ Hang Động Nứt Vỡ · 👻 Cổ Tu Sĩ Tàn Hồn. Mỗi loại chọn A (có giá/rủi ro) hoặc B (bỏ qua).
 * - 📖 Sổ Kỳ Ngộ: mỗi loại gặp lần đầu mở 1 trang; móc quà theo tổng số lần đã trải qua (bảng MS: 5 / 15 / 30).
 * - 💊 Đan Sư Di Thất (Fix350): tặng Phá Quân / Kim Cang / Dưỡng Mệnh / Ngưng Thần Đan để BÙ các ô đan đã bỏ lỡ ở những cảnh giới đã qua
 *   (mỗi cảnh giới tối đa ZC.PLIM viên/loại, dữ liệu PS[cur].cv.pu[cảnh giới][a|d|h|m]). Mỗi lần tặng tối đa CF.danPills viên, bù từ cảnh giới thấp nhất.
 *   Loại này gặp được ở MỌI map thường / mọi Lv (tỉ lệ CF.danRate) miễn còn ô bỏ lỡ; hết ô bỏ lỡ thì không xuất hiện nữa.
 * - Phần thưởng chỉ gồm exp, vàng, mảnh chế tạo, trang bị thường, điểm tiềm năng (tối đa CF.ptsCap/nhân vật). KHÔNG đụng Linh Thạch.
 * Dữ liệu theo nhân vật: PS[cur].ky = {n:{beggar,beast,cave,spirit},cl:{mốc:1},tp:điểm_đã_nhận}. Reset cùng ng().
 * API: window.KYNGO = {open,close,spawn(i),cfg,ev}. Test nhanh: KYNGO.spawn(0..3) rồi bấm nút bên trái.
 * Phụ thuộc (gọi lúc chạy): drop, PS, cur, P, started, lg, vil, mapSel, gold, frag, gP, FB, XR, gen, rr, give, hpP, mpP, DT, sv, fmtN. Không sửa core. */
(function(){
'use strict';
if(typeof drop!=='function'||typeof PS==='undefined')return;

var CF={rate:.015,cd:25000,life:30000,maxMap:1,maxLv:60,ptsCap:10,danRate:.012,danPills:2};

function nf(n){try{return fmtN(n)}catch(e){return String(n)}}
function save(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe27a',g:1,l:150})}catch(e){}}
function lv(){return Math.max(1,(P&&P.lv)|0)}
function Y(){var p=PS[cur];if(!p)return null;var k=p.ky;if(!k||typeof k!=='object')k=p.ky={n:{},cl:{},tp:0};
  if(!k.n)k.n={};if(!k.cl)k.cl={};if(k.tp==null)k.tp=0;return k}
function total(){var k=Y(),s=0,i;if(!k)return 0;for(i in k.n)s+=k.n[i]|0;return s}

/* ---------- phần thưởng (mỗi hàm trả chuỗi mô tả, hoặc null nếu không nhận được) ---------- */
function gExp(m){var v=Math.round(15*(1+lv()/5)*m);try{if(typeof XR==='function')v=XR(v)}catch(e){}P.xp+=v;return '✨ '+nf(v)+' exp'}
function gGold(m){var v=Math.round(m*lv());try{if(typeof gP==='function')v=gP(v)}catch(e){}gold+=v;return '💰 '+nf(v)+' vàng'}
function gFrag(n){var v=n;try{if(typeof FB==='function')v=FB(n)}catch(e){}frag+=v;return '🔹 '+nf(v)+' mảnh chế tạo'}
function gPts(n){var k=Y(),add=Math.max(0,Math.min(n,CF.ptsCap-k.tp));if(add<=0)return null;k.tp+=add;PS[cur].pts=(PS[cur].pts|0)+add;return '⭐ +'+add+' điểm tiềm năng'}
function gItem(){try{var it=gen(lv(),rr(0));give(it,P.x,190);return '🎁 '+(it.n||'trang bị')}catch(e){return null}}
function pr(){var a=[],i,x;for(i=0;i<arguments.length;i++){x=arguments[i];if(x)a.push(x)}return a.join(' · ')}

/* ---------- đan bỏ lỡ theo cảnh giới ---------- */
var RNM=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
var PIL={a:['🟠','Phá Quân Đan','Công'],d:['🟤','Kim Cang Đan','Thủ'],h:['🟢','Dưỡng Mệnh Đan','HP'],m:['🔵','Ngưng Thần Đan','MP']};
var PK=['a','d','h','m'];
function rname(r){return r<0?'Phàm Nhân':(RNM[r]||('Cảnh giới '+r))}
function plim(){try{return (ZC.PLIM|0)||8}catch(e){return 8}}
function cvOf(){var p=PS[cur];return p&&p.cv&&typeof p.cv==='object'?p.cv:null}
/* danh sách ô bỏ lỡ ở các cảnh giới ĐÃ QUA (r' < cảnh giới hiện tại), từ thấp lên cao: [{r,k,miss}] */
function missed(){
  var c=cvOf(),o=[],r,i,u,m,L=plim();if(!c||c.r==null||c.r<=-1)return o;
  for(r=-1;r<c.r;r++){u=c.pu&&c.pu[r];for(i=0;i<4;i++){m=L-(u?(u[PK[i]]|0):0);if(m>0)o.push({r:r,k:PK[i],miss:m})}}
  return o}
function missTotal(){var a=missed(),s=0,i;for(i=0;i<a.length;i++)s+=a[i].miss;return s}
function gDan(n){
  var c=cvOf(),got={},cnt=0,a,r0,pool,x,key,out=[],sp,d;if(!c)return null;
  if(!c.pu||typeof c.pu!=='object')c.pu={};
  while(cnt<n){
    a=missed();if(!a.length)break;r0=a[0].r;pool=a.filter(function(z){return z.r===r0});
    x=pool[Math.floor(Math.random()*pool.length)];
    if(!c.pu[x.r])c.pu[x.r]={};c.pu[x.r][x.k]=(c.pu[x.r][x.k]|0)+1;cnt++;
    key=x.r+'|'+x.k;got[key]=(got[key]|0)+1}
  for(key in got){sp=key.split('|');d=PIL[sp[1]];out.push(d[0]+' '+d[1]+' ×'+got[key]+' (bù '+rname(+sp[0])+')')}
  return out.length?out.join(' · '):null}

/* ---------- loại kỳ ngộ ---------- */
var EV=[
 {k:'beggar',e:'🧓',n:'Lão Ăn Mày Bí Ẩn',tx:'Một lão ăn mày rách rưới chặn đường, xin chút vàng lót dạ. Đôi mắt lão sáng lạ thường…',
  lore:'Người cho lão ăn thường nhận được cơ duyên bất ngờ.',
  a:function(){return 'Cho lão 💰'+nf(this.cost())},cost:function(){return 100+40*lv()},
  can:function(){return gold>=this.cost()?'':'Không đủ vàng ('+nf(this.cost())+')'},
  go:function(){gold-=this.cost();var big=Math.random()<.1,o=[gExp(big?100:25)];if(Math.random()<.35)o.push(gItem());
    return (big?'Lão cười lớn, truyền cho ngươi một đạo linh khí! ':'Lão gật đầu cảm tạ và để lại chút quà. ')+pr.apply(0,o)},
  b:'Mặc kệ',bgo:function(){return 'Lão thở dài rồi biến mất vào sương.'}},
 {k:'beast',e:'🐺',n:'Linh Thú Bị Thương',tx:'Một con linh thú nhỏ nằm rên rỉ bên đường, chân bị thương nặng, ánh mắt van xin.',
  lore:'Linh thú được cứu sẽ báo đáp bằng vật quý.',
  a:function(){return 'Băng bó (-1 🧪 bình HP)'},can:function(){return (hpP|0)>=1?'':'Hết bình HP'},
  go:function(){hpP-=1;return 'Linh thú liếm tay ngươi rồi tha về một món quà. '+pr(gGold(120),gFrag(12+Math.floor(Math.random()*9)),Math.random()<.2?gExp(20):null)},
  b:'Đi tiếp',bgo:function(){return 'Ngươi bước qua. Tiếng rên rỉ xa dần…'}},
 {k:'cave',e:'🕳️',n:'Hang Động Nứt Vỡ',tx:'Mặt đất nứt toác, lộ ra một hang động toả linh khí. Bên trong có thứ gì đó lấp lánh…',
  lore:'Thăm dò hang động: may thì được rương báu, rủi thì chỉ còn chút kinh nghiệm.',
  a:function(){return 'Vào thăm dò (60% thắng)'},can:function(){return ''},
  go:function(){if(Math.random()<.6)return '🎉 Tìm thấy rương báu! '+pr(gGold(250),gFrag(15+Math.floor(Math.random()*11)),Math.random()<.4?gItem():null);
    return 'Gặp ổ độc, phải chạy ra. Chỉ kịp nhặt chút kinh nghiệm: '+gExp(5)},
  b:'Bỏ qua',bgo:function(){return 'Hang động từ từ khép lại.'}},
 {k:'spirit',e:'👻',n:'Cổ Tu Sĩ Tàn Hồn',tx:'Một bóng hồn mờ ảo hiện ra: "Thiếu niên, ta còn một chút truyền thừa… ngươi có muốn nhận?"',
  lore:'Truyền thừa tăng điểm tiềm năng vĩnh viễn (tối đa '+CF.ptsCap+' điểm / nhân vật).',
  a:function(){return 'Nhận truyền thừa (-1 💧 bình MP)'},can:function(){return (mpP|0)>=1?'':'Hết bình MP'},
  go:function(){mpP-=1;var p=gPts(1);return p?'Dòng linh lực chảy vào kinh mạch! '+p:'Truyền thừa của ngươi đã đầy, hồn thể tặng quà thay: '+pr(gExp(30),gGold(150))},
  b:'Từ chối',bgo:function(){return 'Bóng hồn tan đi cùng một tiếng thở dài.'}},
 {k:'dan',e:'💊',n:'Đan Sư Di Thất',dan:1,tx:'Một lão đan sư tóc bạc mỉm cười: "Trên đường tu luyện, ngươi đã bỏ lỡ không ít đan dược tăng căn cơ. Lão phu luyện sẵn, tặng ngươi bù lại."',
  lore:'Tặng Phá Quân / Kim Cang / Dưỡng Mệnh / Ngưng Thần Đan, bù các ô đan đã bỏ lỡ ở cảnh giới đã qua (tăng vĩnh viễn).',
  a:function(){return 'Nhận đan (tặng, tối đa '+CF.danPills+' viên)'},can:function(){return ''},
  go:function(){var g=gDan(CF.danPills);return g?'Đan Sư gật đầu: "Căn cơ vững hơn rồi." Nhận: '+g:'Đan Sư xem mạch rồi cười: "Căn cơ ngươi đã đủ đầy, không cần bù thêm."'},
  b:'Từ chối',bgo:function(){return 'Đan Sư lắc đầu, lẳng lặng thu đan rồi biến mất.'}}
];

/* ---------- móc quà Sổ Kỳ Ngộ (theo tổng số lần đã trải qua) ---------- */
var MS=[
 {at:5,t:'💰 vàng + ✨ exp',go:function(){return pr(gGold(500),gExp(60))}},
 {at:15,t:'🔹 mảnh chế tạo + ⭐ 1 điểm',go:function(){return pr(gFrag(40),gPts(1))}},
 {at:30,t:'⭐ 2 điểm + 🎁 trang bị',go:function(){return pr(gPts(2),gItem(),gGold(1500))}}
];

/* ---------- trạng thái ---------- */
var ev=null,nextAt=0,on=false,view='book',msg='',pill=null,pan=null;

function normalMob(e){
  if(!e||!started||lg||vil)return false;
  return !(e.b>=2||e.k==='boss'||e.tw||e.mt||e.ks||e.am||e.dg||e.td||e.tn)}
function eligible(e){return normalMob(e)&&mapSel<=CF.maxMap&&lv()<=CF.maxLv}   /* kỳ ngộ đầu game: map 1-2, Lv ≤ maxLv */
function danIdx(){for(var i=0;i<EV.length;i++)if(EV[i].dan)return i;return -1}
function spawn(i){
  if(ev||!started||!PS[cur])return false;
  if(i==null){var pl=[],j;for(j=0;j<EV.length;j++)if(!EV[j].dan||missTotal()>0)pl.push(j);i=pl[Math.floor(Math.random()*pl.length)]}
  else i=((i%EV.length)+EV.length)%EV.length;
  ev={i:i,at:Date.now()};say('✨ Kỳ Ngộ xuất hiện! Chạm nút bên trái','#ffe27a');paint();return true}

/* ---------- hành động ---------- */
function choose(side){
  if(!ev)return;var d=EV[ev.i],k=Y();
  if(!k){ev=null;return}
  if(side==='a'){var er=d.can();if(er){msg='⚠ '+er;render();return}msg='✅ '+d.go()}
  else msg='🚶 '+d.bgo();
  k.n[d.k]=(k.n[d.k]|0)+1;ev=null;view='res';save();paint();render()}
function claim(i){
  var m=MS[i],k=Y();if(!m||!k||k.cl[m.at]||total()<m.at)return;
  k.cl[m.at]=1;msg='🎁 Móc quà '+m.at+' lần: '+m.go();save();say('🎁 Nhận móc quà Kỳ Ngộ','#ffd76a');render()}

/* ---------- giao diện ---------- */
function css(){
  if(document.getElementById('kngcss'))return;
  var s=document.createElement('style');s.id='kngcss';
  s.textContent='@keyframes kngp{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}#kng-pill.kng-on{animation:kngp 1.4s ease-in-out infinite;will-change:transform;box-shadow:0 0 12px #ffd76a}@media (prefers-reduced-motion:reduce){#kng-pill.kng-on{animation:none}}';
  document.head.appendChild(s)}
function stop(el){['pointerdown','touchstart','keydown','keyup','keypress','click'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function mkPill(){
  if(pill||!document.body)return;css();
  pill=document.createElement('button');pill.id='kng-pill';
  pill.style.cssText='position:fixed;left:6px;top:38%;z-index:9990;padding:6px 9px;border-radius:18px;border:1.5px solid #c9a24e;background:#1c1208e6;color:#ffe9a0;font:bold 13px KTH Serif,Songti SC,STKaiti,KaiTi,serif;opacity:.88;display:none;touch-action:manipulation;contain:layout style';
  pill.onclick=function(){open()};stop(pill);document.body.appendChild(pill)}
function mkPan(){
  if(pan||!document.body)return;
  pan=document.createElement('div');pan.id='kng-pan';
  pan.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,380px);max-height:84vh;overflow:auto;background:#1a1208f5;color:#f6ead0;border:2px solid #c9a24e;border-radius:10px;padding:10px;z-index:99998;display:none;font-family:KTH Serif,Songti SC,STKaiti,KaiTi,serif';
  stop(pan);document.body.appendChild(pan)}
var pk='';   /* khoá trạng thái đã vẽ: không đổi thì không đụng DOM (tránh layout/paint thừa trên điện thoại) */
function paint(){
  mkPill();if(!pill)return;
  var key;
  if(!started)key='x';
  else if(ev)key='e'+EV[ev.i].k+Math.max(0,Math.ceil((CF.life-(Date.now()-ev.at))/1000));
  else key='b';
  if(key===pk)return;pk=key;
  if(key==='x'){pill.style.display='none';return}
  pill.style.display='block';
  if(ev){pill.textContent='✨ Kỳ Ngộ '+key.replace(/^e[a-z]+/,'')+'s';pill.classList.add('kng-on');pill.style.borderColor='#ffe27a'}
  else{pill.textContent='📖 Kỳ Ngộ';pill.classList.remove('kng-on');pill.style.borderColor='#c9a24e'}}
function btn(label,fn,dis){return '<button '+(dis?'disabled ':'')+'onclick="KYNGO.'+fn+'" style="width:100%;margin-top:5px;padding:7px;font-size:13px">'+label+'</button>'}
function render(){
  if(!pan)return;var k=Y(),o='',d;
  o+='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px;color:#ffe27a">'+(view==='book'?'📖 Sổ Kỳ Ngộ':'✨ Kỳ Ngộ Tiên Duyên')+'</b><button onclick="KYNGO.close()" style="padding:2px 10px">✕</button></div>';
  if(msg)o+='<div style="background:#2d2210;border:1px solid #c9a24e;border-radius:6px;padding:6px;margin:6px 0;font-size:12px;color:#ffe9a0">'+msg+'</div>';
  if(view==='ev'&&ev){
    d=EV[ev.i];
    o+='<div style="text-align:center;font-size:42px;margin:6px 0 0">'+d.e+'</div><div style="text-align:center;font-weight:bold;color:#ffd76a">'+d.n+'</div>'
     +'<div style="font-size:13px;margin:6px 0;line-height:1.4">'+d.tx+'</div>'
     +btn('🅰 '+d.a(),'pick(\'a\')',false)+btn('🅱 '+d.b,'pick(\'b\')',false)}
  else if(view==='res'){o+=btn('📖 Xem Sổ Kỳ Ngộ','book()',false)}
  else{
    o+='<div style="font-size:11px;opacity:.8;margin:3px 0 6px">Hạ quái ở 2 map đầu (Lv ≤ '+CF.maxLv+') có thể gặp kỳ ngộ; Đan Sư Di Thất gặp ở mọi map nếu còn đan bỏ lỡ. Đã trải qua: <b>'+total()+'</b> lần.</div>';
    EV.forEach(function(x){var n=k?(k.n[x.k]|0):0;
      o+='<div style="display:flex;gap:8px;align-items:center;margin:4px 0;padding:5px;border:1px dashed '+(n?'#c9a24e':'#555')+';border-radius:6px;opacity:'+(n?1:.55)+'"><span style="font-size:24px">'+(n?x.e:'❔')+'</span>'
       +'<span style="flex:1;font-size:12px"><b>'+(n?x.n:'Trang chưa mở')+'</b>'+(n?' · đã gặp '+n+' lần<br><span style="opacity:.75">'+x.lore+'</span>':'<br><span style="opacity:.75">Hãy tiếp tục săn quái để gặp.</span>')+'</span></div>'});
    var ms=missed();
    if(ms.length){var byR={};ms.forEach(function(z){(byR[z.r]=byR[z.r]||[]).push(z)});
      o+='<div style="margin-top:8px;border-top:1px dashed #c9a24e88;padding-top:6px"><b>💊 Đan đã bỏ lỡ</b> <span style="font-size:11px;opacity:.75">(Đan Sư sẽ bù dần, từ cảnh giới thấp)</span>';
      for(var r in byR){o+='<div style="font-size:12px;margin-top:3px"><b style="color:#ffd76a">'+rname(+r)+'</b>: '+byR[r].map(function(z){return PIL[z.k][0]+' '+PIL[z.k][2]+' −'+z.miss}).join(' · ')+'</div>'}
      o+='</div>'}
    o+='<div style="margin-top:8px;border-top:1px dashed #c9a24e88;padding-top:6px"><b>🎁 Móc quà</b>';
    MS.forEach(function(m,i){var got=k&&k.cl[m.at],ok=total()>=m.at;
      o+='<div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px"><span style="flex:1;opacity:'+(got?.55:1)+'">'+m.at+' lần → '+m.t+' <span style="opacity:.7">('+Math.min(total(),m.at)+'/'+m.at+')</span></span>'
       +(got?'<button disabled style="padding:2px 8px">✔ Đã nhận</button>':'<button '+(ok?'':'disabled ')+'onclick="KYNGO.claim('+i+')" style="padding:2px 8px">Nhận</button>')+'</div>'});
    o+='</div>'}
  pan.innerHTML=o}
function open(){
  if(!started||!PS[cur])return;mkPan();if(!pan)return;
  on=true;if(ev){view='ev';msg=''}else if(view!=='res')view='book';
  render();pan.style.display='block'}
function close(){on=false;if(pan)pan.style.display='none';if(view==='res'){view='book';msg=''}}

/* ---------- móc vào lúc hạ quái (module riêng, không sửa core) ---------- */
var _drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  try{
    if(!ev&&Date.now()>=nextAt){
      if(eligible(e)&&Math.random()<CF.rate){nextAt=Date.now()+CF.cd+CF.life;spawn()}
      else if(normalMob(e)&&Math.random()<CF.danRate&&missTotal()>0){nextAt=Date.now()+CF.cd+CF.life;spawn(danIdx())}   /* đan bỏ lỡ: mọi map/Lv */
    }
  }catch(x){try{console.error('[ky-ngo]',x)}catch(y){}}
  return r};

/* hết giờ / cập nhật nút (không đụng vòng step) */
var tk=0;
setInterval(function(){
  try{
    if(document.hidden)return;                         /* tab ẩn / app nền: không làm gì */
    if(!ev&&pill&&(++tk%4))return;                           /* không có kỳ ngộ: chỉ kiểm tra mỗi ~2 giây */
    if(ev&&Date.now()-ev.at>CF.life&&!(on&&view==='ev')){ev=null;say('✨ Kỳ Ngộ đã tan biến…','#bbb')}
    paint()}catch(x){}
},500);

/* reset khi tạo lại nhân vật / máy chủ reset */
try{var _ng=ng;ng=function(){close();ev=null;PS.forEach(function(x){delete x.ky});return _ng.apply(this,arguments)}}catch(e){}

window.KYNGO={open:open,close:close,spawn:spawn,cfg:CF,ev:EV,pick:choose,claim:claim,book:function(){view='book';msg='';render()},data:Y,missed:missed,gDan:gDan};
})();
