/* ===== 📖 BÍ KÍP LUYỆN THỂ (ui/96-bi-kip-luyen-the.js) — Fix247 — nạp SAU ui/95-trang-suc-mon-phai.js =====
 * 4 bí kíp (Sơ → Đỉnh cấp). Mang vào ô 📖 (bên trái nhân vật, tab 🎒 Túi) → đánh quái nhận 1-3 điểm tu luyện/con
 * (chỉ khi đang mang bí kíp CHƯA luyện thành). Đủ 1000 điểm → bấm 🔥 Luyện: thất bại (phải luyện lại) hoặc ra phẩm Thiên/Địa/Huyền/Hoàng.
 *   Bách Luyện Kỳ Kinh   (Sơ cấp)  : mua ở Tạp Hóa (CF.price 💰)   · +25 tiềm năng
 *   Thiết Ngưu Hộ Thể Công(Trung)  : 3% rơi mọi Boss               · +25 tiềm năng, HP +5%
 *   Kim Cang Bất Hoại Thân(Thượng) : 2% rơi Boss Kiếm Thánh        · +50 tiềm năng, HP/Công/Thủ/MP +5%
 *   Hỗn Mang Bách Diệt Kinh(Đỉnh)  : 1% rơi Ác Ma Thượng Giới      · +100 tiềm năng, HP/Công/Thủ/MP +10%
 * Phẩm: Thiên ×1 · Địa ×1.2 · Huyền ×1.5 · Hoàng ×2 (nhân toàn bộ chỉ số của bí kíp).
 * Nội tại 🛡 Bất Diệt Thân: luôn có khiên = 30% HP tối đa; khiên vỡ → hồi chiêu 15s, hết hồi chiêu tự có khiên lại. Là kỹ năng của Hỗn Mang Bách Diệt Kinh: luyện thành là có (không cần mang vào ô 📖, mọi bản đồ).
 * Lưu: PS[cur].bk = {inv:[{u,k,s,p,q}], eq, col, n}  (theo từng nhân vật; ng() xoá).
 * Móc vào hệ cũ (không sửa core): PS[i].al[0..5] (cộng điểm tiềm năng, bọc getter của equipment/64) · ZC.ph/pa/pd/pm (nhân %) ·
 *   ZC.kill (điểm tu luyện) · drop (rơi bí kíp) · P.hp setter (khiên hấp thụ sát thương) · TSM (ô 📖 ui/95) · ui() (mục bán ở Tạp Hóa).
 * Gỡ = xoá thẻ script trong index.html. API: BK.open() · BK.cfg (CF). */
(function(){
'use strict';
if(window.BK||typeof ui!=='function'||typeof drop!=='function'||typeof ZC==='undefined')return;
var CF={
  price:200000,                 /* giá Bách Luyện Kỳ Kinh ở Tạp Hóa (vàng) */
  need:1000,ptMin:1,ptMax:3,    /* điểm tu luyện cần / mỗi quái rơi */
  roll:{fail:50,t:30,d:20,h:10,v:5},  /* trọng số (tự chuẩn hoá về 100%) */
  qm:[1,1.2,1.5,2],
  boss:{tn:.03,kc:.02,hm:.01},  /* tỉ lệ rơi: tn mọi Boss · kc Kiếm Thánh · hm Ác Ma Thượng Giới */
  shield:{pct:.3,cd:15000},
  invMax:60
};
var QN=['Thiên','Địa','Huyền','Hoàng'],QC=['#7fd8ff','#e8c878','#c58bff','#ff9d2e'];
var DEF={
  bl:{n:'Bách Luyện Kỳ Kinh',t:'Sơ cấp',pot:25,hp:0,atk:0,df:0,mp:0,c:'#4fae6a',e:'🌀',d:'Mua ở Tạp Hóa'},
  tn:{n:'Thiết Ngưu Hộ Thể Công',t:'Trung cấp',pot:25,hp:5,atk:0,df:0,mp:0,c:'#c9814a',e:'🐂',d:'Rơi từ Boss (3%)'},
  kc:{n:'Kim Cang Bất Hoại Thân',t:'Thượng cấp',pot:50,hp:5,atk:5,df:5,mp:5,c:'#e8c24a',e:'💎',d:'Rơi từ Boss Kiếm Thánh (2%)'},
  hm:{n:'Hỗn Mang Bách Diệt Kinh',t:'Đỉnh cấp',pot:100,hp:10,atk:10,df:10,mp:10,c:'#b06cff',e:'☯️',d:'Rơi từ Ác Ma Thượng Giới (1%)'}
};
var ORDER=['bl','tn','kc','hm'];
var SH={amt:0,cd:0,cur:-1};
function num(v){return Number.isFinite(+v)?+v:0}
function fmt(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+Math.round(n)}}
/* ---------- biểu tượng bí kíp (SVG nhỏ, không base64 ảnh ngoài) ---------- */
var IC={};
function icon(k){
  if(IC[k])return IC[k];var d=DEF[k];
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+d.c+'"/><stop offset="1" stop-color="#1a0f0a"/></linearGradient></defs>'
   +'<rect x="9" y="5" width="46" height="54" rx="5" fill="url(#g)" stroke="#f1e3c4" stroke-width="2"/><rect x="9" y="5" width="9" height="54" rx="4" fill="#000" fill-opacity=".35"/>'
   +'<rect x="23" y="11" width="26" height="3" rx="1.5" fill="#f1e3c4" fill-opacity=".7"/><rect x="26" y="50" width="20" height="3" rx="1.5" fill="#f1e3c4" fill-opacity=".5"/>'
   +'<circle cx="36" cy="32" r="13" fill="#000" fill-opacity=".35" stroke="#f1e3c4" stroke-opacity=".6"/><text x="36" y="39" font-size="19" text-anchor="middle">'+d.e+'</text></svg>';
  return IC[k]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}
/* ---------- dữ liệu ---------- */
function D(i){
  var p=PS[i==null?cur:i];if(!p)return null;var b=p.bk;
  if(!b||typeof b!=='object'||!Array.isArray(b.inv))b=p.bk={inv:[],eq:0,col:{},n:1};
  if(!b.col||typeof b.col!=='object')b.col={};if(!(b.n>0))b.n=1;return b}
function find(b,u){for(var i=0;i<b.inv.length;i++)if(b.inv[i].u===u)return b.inv[i];return null}
function eqBook(i){var b=D(i);return b&&b.eq?find(b,b.eq):null}
function bonus(i){
  var o={pot:0,hp:0,atk:0,df:0,mp:0},bk=eqBook(i);
  if(!bk||bk.s!==1||!DEF[bk.k])return o;
  var d=DEF[bk.k],m=CF.qm[bk.q|0]||1;
  o.pot=Math.round(d.pot*m);o.hp=d.hp*m/100;o.atk=d.atk*m/100;o.df=d.df*m/100;o.mp=d.mp*m/100;return o}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(s,c,y){try{DT.push({x:P.x,y:y||180,s:s,c:c||'#ffe9a8',l:110,g:1})}catch(e){}}
function addBook(k,tx){
  var b=D();if(!b||!DEF[k])return false;
  if(b.inv.length>=CF.invMax){say('📖 Túi bí kíp đầy','#ff8a8a');return false}
  b.inv.push({u:b.n++,k:k,s:0,p:0,q:-1});b.col[k]=1;
  say('📖 '+(tx||'Nhận')+': '+DEF[k].n+'!','#ffd34a',210);sav();return true}
/* ---------- cộng điểm tiềm năng: bọc getter/setter PS[i].al[k] (sau hook đá khảm của equipment/64) ---------- */
function hookAl(i){
  var p=PS[i];if(!p||!Array.isArray(p.al)||p.al.__bk||!p.al.__gm)return;
  var a=p.al;
  try{
    [0,1,2,3,4,5].forEach(function(k){
      var d=Object.getOwnPropertyDescriptor(a,k);if(!d||!d.get||!d.set)throw 0;
      Object.defineProperty(a,k,{configurable:true,enumerable:true,
        get:function(){return d.get.call(a)+bonus(i).pot},
        set:function(v){d.set.call(a,(+v||0)-bonus(i).pot)}})});
    Object.defineProperty(a,'__bk',{value:1,enumerable:false,configurable:true})
  }catch(e){}}
function hookAll(){try{for(var i=0;i<PS.length;i++)hookAl(i)}catch(e){}}
/* ---------- nhân % HP / Công / Thủ / MP ---------- */
['ph:hp','pa:atk','pd:df','pm:mp'].forEach(function(s){
  var f=s.split(':')[0],key=s.split(':')[1],o=ZC[f];if(typeof o!=='function'||o.__bk)return;
  ZC[f]=function(){var r=o.apply(this,arguments);try{return r*(1+bonus(cur)[key])}catch(e){return r}};ZC[f].__bk=1});
/* ---------- điểm tu luyện: mỗi quái chết 1-3 điểm ---------- */
var cnt=0,_kill=ZC.kill;
ZC.kill=function(){
  var r=_kill.apply(this,arguments);
  try{var bk=eqBook();
    if(bk&&bk.s===0&&bk.p<CF.need){
      var n=CF.ptMin+Math.floor(Math.random()*(CF.ptMax-CF.ptMin+1));bk.p=Math.min(CF.need,bk.p+n);
      DT.push({x:P.x,y:150,s:'+'+n+' 📖',c:'#9fe8c8',l:36});
      if(bk.p>=CF.need){say('📖 '+DEF[bk.k].n+' đủ điểm — mở 📖 để Luyện!','#9fffb0',210);sav();refresh()}
      else if(++cnt%25===0)sav()}
  }catch(e){}
  return r};
/* ---------- rơi bí kíp từ Boss ---------- */
function isBoss(e){return !!e&&(e.b>=2||e.k==='boss'||e.tw||e.mt||e.ks||e.am)}
var _drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  try{if(isBoss(e)){
    if(e.am&&Math.random()<CF.boss.hm)addBook('hm','Rơi');
    if(e.ks&&Math.random()<CF.boss.kc)addBook('kc','Rơi');
    if(Math.random()<CF.boss.tn)addBook('tn','Rơi')}}catch(x){}
  return r};
/* ---------- Luyện (tung phẩm) ---------- */
function train(){
  var bk=eqBook();if(!bk||bk.s!==0||bk.p<CF.need)return;
  var w=CF.roll,tot=w.fail+w.t+w.d+w.h+w.v,r=Math.random()*tot;
  if(r<w.fail){bk.p=0;say('❌ Luyện thất bại — phải luyện lại','#ff8a8a',210)}
  else{r-=w.fail;var q=r<w.t?0:r<w.t+w.d?1:r<w.t+w.d+w.h?2:3;
    bk.s=1;bk.q=q;say('✨ Luyện thành '+DEF[bk.k].n+' — phẩm '+QN[q]+'!',QC[q],210)}
  sav();refresh();render()}
function equip(u){var b=D();if(!b||!find(b,u))return;b.eq=u;sav();refresh();render()}
function unequip(){var b=D();if(!b)return;b.eq=0;sav();refresh();render()}
function buy(k){
  if(k!=='bl')return;
  if(gold<CF.price){say('💰 Không đủ vàng ('+fmt(CF.price)+')','#ff8a8a');return}
  if(!addBook('bl','Mua'))return;gold-=CF.price;sav();refresh()}
/* ---------- Bất Diệt Thân ---------- */
function unlocked(){var b=D();if(!b)return false;for(var i=0;i<b.inv.length;i++)if(b.inv[i].k==='hm'&&b.inv[i].s===1)return true;return false}
function cast(){
  try{
    if(!started||!unlocked()||SH.amt>0||Date.now()<SH.cd)return;
    SH.amt=Math.round(mx()*CF.shield.pct);hookP();
    say('🛡 Bất Diệt Thân: khiên '+fmt(SH.amt),'#9fe8ff',200);
  }catch(e){}}
function hookP(){
  try{
    if(typeof P==='undefined'||!P||P.__bkh)return;
    var v=P.hp;
    Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get:function(){return v},
      set:function(n){n=+n;
        if(SH.amt>0&&n<v){var dm=v-n,ab=Math.min(SH.amt,dm);SH.amt-=ab;n=v-(dm-ab);
          if(SH.amt<=0){SH.amt=0;SH.cd=Date.now()+CF.shield.cd;say('💥 Khiên Bất Diệt Thân vỡ — hồi chiêu '+CF.shield.cd/1000+'s','#ffb36b',190)}}
        v=n}});
    Object.defineProperty(P,'__bkh',{value:1,enumerable:false,configurable:true})
  }catch(e){}}
var st=document.createElement('style');st.id='bk-css';
st.textContent='#bk-sh{position:fixed;z-index:3;width:46px;height:46px;border-radius:50%;border:2px solid #7fd8ff;background:radial-gradient(circle at 50% 30%,#2b4a66,#0a1118 78%);color:#dff6ff;font-size:19px;line-height:1;padding:0;display:none;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 8px #000b}'
+'#bk-sh small{display:block;font-size:10px;margin-top:1px}#bk-sh.cd{filter:grayscale(.7);opacity:.75}#bk-sh.on{box-shadow:0 0 12px #7fd8ff,0 2px 8px #000b}'
+'.bk-ov{position:fixed;inset:0;z-index:99999;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px}'
+'.bk-bx{width:100%;max-width:360px;max-height:92vh;overflow:auto;background:#2a1b12;border:2px solid #b8964e;border-radius:12px;padding:12px;color:#f1e3c4;font-size:13px;box-shadow:0 0 18px #000}'
+'.bk-bx h3{margin:0 0 8px;font-size:16px;color:#e8c878}.bk-tabs{display:flex;gap:6px;margin-bottom:8px}'
+'.bk-tabs button,.bk-bx .bt{padding:6px 10px;border:1px solid #b8964e;border-radius:8px;background:#3a2718;color:#f1e3c4;font-size:13px}.bk-tabs button.on{background:#7a5a2a;box-shadow:0 0 6px #b8964e}'
+'.bk-card{display:flex;gap:8px;align-items:center;border:2px solid #5a4630;border-radius:9px;background:#1a110c;padding:7px;margin:6px 0}.bk-card.eq{border-color:#e8c878;box-shadow:0 0 8px #e8c87866}'
+'.bk-card img{width:46px;height:46px;flex:none}.bk-card .tx{flex:1;min-width:0}.bk-card b{display:block;font-size:13px}.bk-card em{display:block;font-style:normal;font-size:11px;opacity:.8;margin-top:2px;line-height:1.35}'
+'.bk-bar{height:8px;border-radius:5px;background:#000;border:1px solid #5a4630;margin-top:4px;overflow:hidden}.bk-bar i{display:block;height:100%;background:linear-gradient(90deg,#4fae6a,#e8c878)}'
+'.bk-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bk-it{border:2px solid #5a4630;border-radius:9px;background:#1a110c;padding:8px 4px;text-align:center}.bk-it img{width:64px;height:64px}.bk-it b{display:block;font-size:12px;margin-top:3px}.bk-it.lk img{filter:brightness(0) opacity(.45)}.bk-it.lk b{opacity:.6}.bk-it.ok{border-color:var(--c)}'
+'.bk-sh{margin-top:8px;padding:6px;border:1px dashed #b8964e;border-radius:8px;font-size:12px}.bk-sh button{margin-top:4px;padding:5px 8px;border:1px solid #b8964e;border-radius:8px;background:#3a2718;color:#f1e3c4;font-size:12px}'
+'.bk-note{font-size:11px;opacity:.75;line-height:1.4;margin:6px 0}';
document.head.appendChild(st);
/* ---------- bảng 📖 ---------- */
var tab='inv';
function bonusTx(d,m){
  var a=['+'+Math.round(d.pot*m)+' tất cả điểm tiềm năng'];
  [['hp','HP'],['atk','Tấn công'],['df','Phòng thủ'],['mp','Năng lượng']].forEach(function(x){if(d[x[0]])a.push(x[1]+' +'+(+(d[x[0]]*m).toFixed(1))+'%')});
  return a.join(' · ')}
function status(bk){
  var d=DEF[bk.k];
  if(bk.s===1)return '<span style="color:'+QC[bk.q]+'">✔ Đã luyện thành · phẩm '+QN[bk.q]+' (×'+CF.qm[bk.q]+')</span><br>'+bonusTx(d,CF.qm[bk.q]);
  return 'Chưa luyện thành · '+bk.p+'/'+CF.need+' điểm<div class="bk-bar"><i style="width:'+Math.min(100,bk.p/CF.need*100)+'%"></i></div>'}
function render(){
  var o=document.getElementById('bk-ov');if(!o)return;var b=D(),h='';
  var eb=b&&b.eq?find(b,b.eq):null;
  h+='<h3>📖 Bí Kíp Luyện Thể</h3><div class="bk-tabs"><button class="'+(tab=='inv'?'on':'')+'" onclick="BK.tab(\'inv\')">Hành trang</button><button class="'+(tab=='col'?'on':'')+'" onclick="BK.tab(\'col\')">Thu thập</button></div>';
  if(tab==='col'){
    h+='<div class="bk-g">';
    ORDER.forEach(function(k){var d=DEF[k],ok=b&&b.col[k];
      h+='<div class="bk-it '+(ok?'ok':'lk')+'" style="--c:'+d.c+'"><img src="'+icon(k)+'"><b>'+(ok?d.n:'???')+'</b></div>'});
    h+='</div><div class="bk-note">Bí kíp đã từng xuất hiện sẽ hiện tên và hình ảnh. Các tính năng khác sẽ cập nhật sau.</div>'}
  else{
    if(eb){var d=DEF[eb.k];
      h+='<div class="bk-card eq"><img src="'+icon(eb.k)+'"><div class="tx"><b>'+d.n+' <small style="opacity:.7">('+d.t+') · đang mang</small></b><em>'+status(eb)+'</em></div></div>';
      h+='<div style="display:flex;gap:6px;flex-wrap:wrap">'
        +(eb.s===0&&eb.p>=CF.need?'<button class="bt" onclick="BK.train()">🔥 Luyện</button>':'')
        +'<button class="bt" onclick="BK.un()">Tháo ra</button></div>';
      if(eb.s===0&&eb.p<CF.need)h+='<div class="bk-note">Đánh quái để nhận 1-3 điểm tu luyện mỗi con. Đủ '+CF.need+' điểm mới Luyện được.</div>'}
    else h+='<div class="bk-note">Chưa mang bí kíp. Mang bí kíp <b>chưa luyện</b> để đánh quái nhận điểm tu luyện.</div>';
    var rest=(b?b.inv:[]).filter(function(x){return !b.eq||x.u!==b.eq});
    h+='<div class="bk-note" style="margin-top:10px"><b>Bí kíp đang có ('+rest.length+')</b></div>';
    if(!rest.length)h+='<div class="bk-note">Trống. Mua Bách Luyện Kỳ Kinh ở 🛒 Tạp Hóa (trong Làng).</div>';
    rest.forEach(function(bk){var d=DEF[bk.k];
      h+='<div class="bk-card"><img src="'+icon(bk.k)+'"><div class="tx"><b>'+d.n+' <small style="opacity:.7">('+d.t+')</small></b><em>'+status(bk)+'</em></div><button class="bt" onclick="BK.eq('+bk.u+')">Mang</button></div>'});
    h+='<div class="bk-sh"><b>🛡 Bất Diệt Thân (nội tại)</b> — luôn có khiên bằng '+Math.round(CF.shield.pct*100)+'% HP tối đa; khiên vỡ thì hồi chiêu '+CF.shield.cd/1000+'s rồi tự có lại.<br>'
      +(unlocked()?'<span style="color:#9fffb0">Đã học · tự động có khiên, mọi bản đồ (kể cả Tiên Giới).</span>':'<span style="opacity:.8">Kỹ năng của Hỗn Mang Bách Diệt Kinh — luyện thành là học được.</span>')+'</div>';
    h+='<div class="bk-note">Luyện: '+Math.round(CF.roll.fail/(CF.roll.fail+CF.roll.t+CF.roll.d+CF.roll.h+CF.roll.v)*100)+'% thất bại · phẩm Thiên ×1, Địa ×1.2, Huyền ×1.5, Hoàng ×2.</div>'}
  h+='<button class="bt" style="display:block;margin:10px 0 0 auto" onclick="BK.close()">Đóng</button>';
  o.firstChild.innerHTML=h}
function open(){
  close();var o=document.createElement('div');o.id='bk-ov';o.className='bk-ov';o.innerHTML='<div class="bk-bx"></div>';
  o.addEventListener('click',function(e){if(e.target===o)close()});document.body.appendChild(o);render()}
function close(){var o=document.getElementById('bk-ov');if(o)o.remove()}
function refresh(){
  try{var n=document.querySelectorAll('#bag .eqd .chp .tsm-c');for(var i=0;i<n.length;i++)n[i].remove();
    if(typeof bo!=='undefined'&&bo&&typeof ui==='function')ui()}catch(e){}}
/* ---------- ô 📖 của ui/95 + mục bán ở Tạp Hóa ---------- */
try{
  if(window.TSM){
    Object.defineProperty(TSM,'bikip',{configurable:true,enumerable:true,
      get:function(){var bk=eqBook();return{n:'Bí kíp luyện thể',ic:bk?icon(bk.k):'📖',d:''}},set:function(){}});
    var _o=TSM.open;TSM.open=function(k){if(k==='bk')return open();return _o.apply(this,arguments)}}
}catch(e){}
var _ui=window.ui;
window.ui=function(){
  var r=_ui.apply(this,arguments);
  try{var ds=document.querySelectorAll('#bag .dt');
    for(var i=0;i<ds.length;i++){var el=ds[i];
      if(el.textContent.indexOf('🛒 Tạp Hóa')>=0&&!el.querySelector('.bk-shop')){
        el.insertAdjacentHTML('beforeend','<div class="bk-shop" style="margin-top:8px"><b>📖 Bí kíp luyện thể</b><br><button onclick="BK.buy(\'bl\')">'+DEF.bl.n+' · '+fmt(CF.price)+'💰</button></div>');break}}
  }catch(e){}
  return r};
/* ---------- vòng lặp nhẹ: hook P.hp, hook al, nút 🛡 ---------- */
setInterval(function(){
  try{
    if(SH.cur!==cur){SH.cur=cur;SH.amt=0;SH.cd=0}
    hookAll();hookP();
    if(!unlocked())SH.amt=0;else if(SH.amt<=0&&Date.now()>=SH.cd)cast();
  }catch(e){}},250);
/* ---------- chơi mới: xoá dữ liệu bí kíp ---------- */
if(typeof ng==='function'){var _ng=ng;ng=function(){var r=_ng.apply(this,arguments);try{PS.forEach(function(x){if(x)delete x.bk});SH.amt=0;SH.cd=0}catch(e){}return r}}
window.BK={cfg:CF,open:open,close:close,tab:function(t){tab=t;render()},eq:equip,un:unequip,train:train,buy:buy,cast:cast,give:addBook,space:function(){var b=D();return b?CF.invMax-b.inv.length:0},bonus:function(){return bonus(cur)}};
hookAll();refresh();
})();
