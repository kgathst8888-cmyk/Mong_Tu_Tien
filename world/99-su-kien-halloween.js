/* ===== 🎃 SỰ KIỆN HALLOWEEN (world/99-su-kien-halloween.js, Fix261, Fix394: Boss Halloween 30 phút/lần, Fix393: bảng quà dạng thẻ + tab, icon vẽ chi tiết, làng Halloween nhiều chi tiết hơn) =====
 * Thời gian: 18/10/2026 00:00 → hết 31/10/2026 (giờ VN, UTC+7). Hết hạn: trang trí + Sứ Giả Halloween tự biến mất, ngừng rơi đồ. Chỉnh ở CF.start / CF.end.
 * - Làng Tân Thủ: bí ngô + bộ xương Halloween (vẽ bằng canvas) và NPC 🎃 Sứ Giả Halloween (chạm → tự đi tới → mở bảng).
 * - Rơi: mọi quái thường/Tinh Anh: mỗi loại Đường / Bột Mì / Mạch Nha 5% (tung độc lập, rơi 1). Mọi Boss: 5% rơi 1 Bí Ngô.
 * - Ghép kẹo: 5 Đường + 5 Bột Mì + 5 Mạch Nha + 2 Linh Thạch + 50.000 vàng → Kẹo Ngọt 10% / Kẹo Dẻo 20% / Kẹo Thối 70%.
 * - Ghép Bí Ngô Ma Quái: 20 Bí Ngô + 20 Linh Thạch + 5.000.000 vàng. Mở ra quà ngẫu nhiên (bảng RW_GHOST).
 * - Linh Thạch nhận từ sự kiện là KHOÁ (LT.earnKS: không trần ngày). Cần đăng nhập ☁ để ghép / mở (vì có Linh Thạch).
 * - Mảnh Cánh Cấp 4: game chưa có cánh cấp 4 → chỉ cộng vào bộ đếm hw.wf4 (hiện trong bảng), nối vào hệ thống cánh sau.
 * Móc quà (Fix320): đếm tích luỹ đã dùng PS[cur].hw.u1/u2/u3 (mở Kẹo Ngọt/Dẻo/Thối) + upk (Bí Ngô đã dùng ghép); cờ đã nhận hw.cl. Bảng MSQ: mốc 100/500.
 * Dữ liệu theo nhân vật: PS[cur].hw = {sg,fl,ml,pk,gp,c1,c2,c3,wf4,u1,u2,u3,upk,cl}. Chỉnh tỉ lệ/phần thưởng: khối CF, RW_*.
 * Phụ thuộc (gọi lúc chạy): drop, vdraw, vstep, ng, LT, CSH, GEMX, HL, gen, BAG, capN, sell, gold, P, PS, cur. Nạp TRƯỚC world/61-lang-gian-rong.js để vẽ trong camera làng. */
(function(){
'use strict';
if(typeof drop!=='function'||typeof vdraw!=='function'||typeof vstep!=='function'||typeof PS==='undefined')return;

var CF={
  start:Date.UTC(2026,9,18)-7*3600e3,          /* 18/10/2026 00:00 giờ VN */
  end:Date.UTC(2026,10,1)-7*3600e3,            /* hết ngày 31/10/2026 (loại trừ 01/11 00:00 VN) */
  matRate:.05,                                  /* mỗi loại nguyên liệu, mỗi quái thường/tinh anh */
  pumpRate:.05,                                 /* bí ngô, mỗi Boss */
  needMat:5,craftLT:2,craftGold:50000,
  candyP:[.10,.20,.70],                         /* ngọt, dẻo, thối */
  needPump:20,ghostLT:20,ghostGold:5000000,
  npcX:.59                                      /* vị trí NPC = vw()*npcX */
};
/* phần thưởng: [trọng số %, loại, giá trị] — loại: g vàng · lt Linh Thạch khoá · sh Mảnh Thánh · gem Ngọc(Đá Khảm) chưa mài [cấp] · eq trang bị · ham Búa Đục Lỗ · dh Ngọc Định Hồn · wf4 Mảnh Cánh Cấp 4 */
var RW_SWEET={exp:50000,t:[[2,'sh',1],[5,'lt',50],[55,'g',100000],[28,'g',200000],[10,'g',500000]]};
var RW_CHEW={exp:30000,t:[[5,'lt',20],[5,'gem',1],[50,'g',50000],[30,'g',100000],[10,'g',200000]]};
var RW_ROT={exp:15000,t:[[5,'lt',5],[30,'g',50000],[20,'g',100000],[45,'eq',0]]};
var RW_GHOST=[[.2,'dh',1],[10,'wf4',1],[20,'lt',50],[10,'ham',1],[5,'gem',2],[5,'sh',2],[24.9,'g',10000000],[24.9,'g',20000000]];
var EQ_W=[[50,0],[28,1],[15,2],[7,3]];          /* trang bị từ Thường (trắng) tới Sử Thi */
var CANDY=[{k:'c1',n:'Kẹo Ngọt',e:'🍭',c:'#ff9ad5',R:RW_SWEET},{k:'c2',n:'Kẹo Dẻo',e:'🍬',c:'#9fe0ff',R:RW_CHEW},{k:'c3',n:'Kẹo Thối',e:'🤢',c:'#b6d86a',R:RW_ROT}];
/* móc quà tích luỹ: k = bộ đếm đã dùng (u1 Ngọt · u2 Dẻo · u3 Thối · upk Bí Ngô đã dùng để ghép), m = [mốc, loại, số lượng] (loại như applyR; lt luôn là Linh Thạch KHOÁ) */
var MSQ=[
  {k:'u3',n:'Kẹo Thối',e:'🤢',c:'#b6d86a',m:[[100,'lt',100],[500,'sh',5]]},
  {k:'u2',n:'Kẹo Dẻo',e:'🍬',c:'#9fe0ff',m:[[100,'lt',300],[500,'sh',10]]},
  {k:'u1',n:'Kẹo Ngọt',e:'🍭',c:'#ff9ad5',m:[[100,'lt',500],[500,'sh',20]]},
  {k:'upk',n:'Bí Ngô',e:'🎃',c:'#ff9a2e',m:[[100,'lt',1000],[500,'dh',1]]}
];
var MATS=[{k:'sg',n:'Đường',e:'🍚'},{k:'fl',n:'Bột Mì',e:'🌾'},{k:'ml',n:'Mạch Nha',e:'🍯'}];

function active(){var t=Date.now();return t>=CF.start&&t<CF.end}
function H(){var p=PS[cur];if(!p)return{sg:0,fl:0,ml:0,pk:0,gp:0,c1:0,c2:0,c3:0,wf4:0,u1:0,u2:0,u3:0,upk:0,cl:{}};
  if(!p.hw)p.hw={sg:0,fl:0,ml:0,pk:0,gp:0,c1:0,c2:0,c3:0,wf4:0,u1:0,u2:0,u3:0,upk:0,cl:{}};
  ['sg','fl','ml','pk','gp','c1','c2','c3','wf4','u1','u2','u3','upk'].forEach(function(k){if(p.hw[k]==null)p.hw[k]=0});if(!p.hw.cl||typeof p.hw.cl!=='object')p.hw.cl={};if(p.hw.wf4>0&&typeof WFA==='function'){WFA(3,p.hw.wf4);p.hw.wf4=0;try{dgSave()}catch(e){}}return p.hw}
function nf(n){try{return fmtN(n)}catch(e){return String(n)}}
function save(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffb347',g:1,l:130})}catch(e){}}
function logged(){try{return !!(window.LT&&LT.logged&&LT.logged())}catch(e){return false}}
function pick(tbl){var s=0,i;for(i=0;i<tbl.length;i++)s+=tbl[i][0];var r=Math.random()*s;for(i=0;i<tbl.length;i++){r-=tbl[i][0];if(r<0)return tbl[i]}return tbl[tbl.length-1]}
function isBoss(e){return !!e&&(e.b>=2||e.k==='boss'||e.tw||e.mt||e.ks||e.am)}

/* ---------- rơi đồ ---------- */
var _drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  try{
    if(active()&&e&&!e.td){
      var h=H(),x=e.x||P.x;
      if(e.hwb){}else if(isBoss(e)){if(Math.random()<CF.pumpRate){h.pk++;DT.push({x:x,y:250,s:'🎃 +1 Bí Ngô',c:'#ff9a2e',g:1,l:170});save()}}
      else{var got=0;MATS.forEach(function(m,i){if(Math.random()<CF.matRate){h[m.k]++;got=1;DT.push({x:x,y:200+i*22,s:m.e+' +1 '+m.n,c:'#ffd27a',g:1,l:150})}});if(got)save()}
    }
  }catch(x){try{console.error('[halloween-drop]',x)}catch(y){}}
  return r};

/* ---------- thưởng ---------- */
function giveEq(){
  var rr=pick(EQ_W)[1],it=gen(P.lv,rr),nm;
  if(BAG.length<capN()){BAG.push(it);nm='🎁 '+(it.n||'Trang bị')}else{var v=sell(it);gold+=v;nm='💰 '+nf(v)+' (túi đầy, tự bán trang bị)'}
  return nm}
function applyR(it){
  var k=it[1],v=it[2];
  switch(k){
    case'g':gold+=v;return'💰 '+nf(v)+' vàng';
    case'lt':LT.earnKS(v);return'🔒 '+v+' Linh Thạch khoá';
    case'sh':HL.addSH(v);return'💠 '+v+' Mảnh Thánh';
    case'gem':GEMX.add(1,v);return'🪨 Ngọc (Đá Khảm) cấp '+v+' chưa mài';
    case'eq':return giveEq();
    case'ham':CSH.give('ham',v);return'🔨 Búa Đục Lỗ ×'+v;
    case'dh':CSH.give('dh',v);return'🔮 Ngọc Định Hồn ×'+v;
    case'wf4':if(typeof WFA==='function'){WFA(3,v);try{dgSave()}catch(e){}}else H().wf4+=v;return'🪽 Mảnh Cánh Cấp 4 ×'+v}
  return''}
function needLogin(){if(!logged()||!window.LT||!LT.spend){msg('☁ Cần đăng nhập để dùng chức năng có Linh Thạch.');return true}return false}

function msKey(d,i){return d.k+'_'+d.m[i][0]}
function msText(r){return applyR([0,r[1],r[2]])}
function claimMs(di,mi){
  var d=MSQ[di],r=d&&d.m[mi];if(!r)return;
  var h=H(),key=msKey(d,mi);
  if(h.cl[key]){msg('Mốc này đã nhận rồi.');return}
  if(h[d.k]<r[0]){msg('Chưa đủ mốc: '+d.n+' '+h[d.k]+'/'+r[0]+'.');return}
  if(r[1]==='lt'&&needLogin())return;
  h.cl[key]=1;
  var t=msText(r);save();
  msg('🎁 Móc quà '+d.e+' '+d.n+' ('+r[0]+'): '+t);say('🎁 Móc quà '+d.n+' '+r[0]+' · '+t,d.c)}
function claimAll(){
  var h=H(),n=0,out=[],hasLt=false,di,mi;
  for(di=0;di<MSQ.length;di++)for(mi=0;mi<MSQ[di].m.length;mi++){var r=MSQ[di].m[mi];if(!h.cl[msKey(MSQ[di],mi)]&&h[MSQ[di].k]>=r[0]&&r[1]==='lt')hasLt=true}
  if(hasLt&&needLogin())return;
  for(di=0;di<MSQ.length;di++)for(mi=0;mi<MSQ[di].m.length;mi++){
    var d=MSQ[di],rr=d.m[mi],key=msKey(d,mi);
    if(!h.cl[key]&&h[d.k]>=rr[0]){h.cl[key]=1;n++;out.push(d.e+rr[0]+': '+msText(rr))}}
  if(!n){msg('Chưa có mốc nào đủ điều kiện để nhận.');return}
  save();msg('🎁 Nhận '+n+' móc quà · '+out.join(' · '));say('🎁 Nhận '+n+' móc quà Halloween','#ffd76a')}

var el=null,mg='',busy=false,go=0,on=false;
function msg(t){mg=t;if(on)render()}

function openCandy(i,all){
  var h=H(),d=CANDY[i],n=all?h[d.k]:Math.min(1,h[d.k]);
  if(n<=0){msg('Không có '+d.n);return}
  if(needLogin())return;
  var tot={},exp=0,j,lines=[];
  h[d.k]-=n;h['u'+d.k.charAt(1)]+=n;
  for(j=0;j<n;j++){exp+=d.R.exp;var r=pick(d.R.t),s=applyR(r);tot[s]=(tot[s]||0)+1}
  P.xp+=exp;
  Object.keys(tot).forEach(function(s){lines.push(s+(tot[s]>1?' ×'+tot[s]:''))});
  save();
  msg(d.e+' Mở '+n+' '+d.n+': ✨ +'+nf(exp)+' EXP · '+lines.join(' · '));
  say(d.e+' '+d.n+' ×'+n+' · +'+nf(exp)+' EXP',d.c)}

function maxCandy(h){return Math.max(0,Math.min(Math.floor(h.sg/CF.needMat),Math.floor(h.fl/CF.needMat),Math.floor(h.ml/CF.needMat),Math.floor(gold/CF.craftGold)))}
async function craftCandy(all){
  if(busy)return;var h=H();
  if(h.sg<CF.needMat||h.fl<CF.needMat||h.ml<CF.needMat){msg('Thiếu nguyên liệu (cần '+CF.needMat+' mỗi loại).');return}
  if(gold<CF.craftGold){msg('Thiếu vàng (cần '+nf(CF.craftGold)+').');return}
  if(needLogin())return;
  var n=all===true?maxCandy(h):1;if(n<1)return;
  busy=true;
  try{
    var r=await LT.spend(CF.craftLT*n,'halloween-keo');
    if(!r||!r.ok){msg(r&&r.err==='poor'?'Thiếu Linh Thạch (cần '+(CF.craftLT*n)+' để ghép '+n+' lần).':'Không trừ được Linh Thạch, thử lại.');busy=false;return}
    h=H();
    if(n>maxCandy(h)){msg('Nguyên liệu/vàng đã thay đổi, thử lại.');busy=false;return}
    h.sg-=CF.needMat*n;h.fl-=CF.needMat*n;h.ml-=CF.needMat*n;gold-=CF.craftGold*n;
    var got=[0,0,0],k,rn,i;
    for(k=0;k<n;k++){rn=Math.random();i=rn<CF.candyP[0]?0:rn<CF.candyP[0]+CF.candyP[1]?1:2;got[i]++;h[CANDY[i].k]++}
    save();
    var tx=CANDY.map(function(d,j){return got[j]?d.e+' '+d.n+' ×'+got[j]:''}).filter(Boolean).join(' · ');
    msg('Ghép thành công '+n+' lần! Nhận '+tx+' (đã trừ '+(CF.craftLT*n)+' Linh Thạch + '+nf(CF.craftGold*n)+' vàng).');
    var f=got.indexOf(1);
    say(n>1?'🍬 Ghép ×'+n+' kẹo!':CANDY[f].e+' Ghép được '+CANDY[f].n+'!',n>1?'#ffb347':CANDY[f].c)
  }catch(e){msg('Lỗi mạng, thử lại.')}
  busy=false;if(on)render()}

function maxGhost(h){return Math.max(0,Math.min(Math.floor(h.pk/CF.needPump),Math.floor(gold/CF.ghostGold)))}
async function craftGhost(all){
  if(busy)return;var h=H();
  if(h.pk<CF.needPump){msg('Thiếu Bí Ngô (cần '+CF.needPump+').');return}
  if(gold<CF.ghostGold){msg('Thiếu vàng (cần '+nf(CF.ghostGold)+').');return}
  if(needLogin())return;
  var n=all===true?maxGhost(h):1;if(n<1)return;
  busy=true;
  try{
    var r=await LT.spend(CF.ghostLT*n,'halloween-bi-ngo');
    if(!r||!r.ok){msg(r&&r.err==='poor'?'Thiếu Linh Thạch (cần '+(CF.ghostLT*n)+' để ghép '+n+' lần).':'Không trừ được Linh Thạch, thử lại.');busy=false;return}
    h=H();
    if(n>maxGhost(h)){msg('Bí Ngô/vàng đã thay đổi, thử lại.');busy=false;return}
    h.pk-=CF.needPump*n;h.upk+=CF.needPump*n;gold-=CF.ghostGold*n;h.gp+=n;save();
    msg('👻 Ghép thành công '+n+' Bí Ngô Ma Quái! (đã trừ '+(CF.ghostLT*n)+' Linh Thạch + '+nf(CF.ghostGold*n)+' vàng)');say('👻 Bí Ngô Ma Quái ×'+n,'#d9a8ff')
  }catch(e){msg('Lỗi mạng, thử lại.')}
  busy=false;if(on)render()}

function openGhost(all){
  var h=H(),n=all?h.gp:Math.min(1,h.gp);
  if(n<=0){msg('Không có Bí Ngô Ma Quái');return}
  if(needLogin())return;
  var tot={},j,lines=[];h.gp-=n;
  for(j=0;j<n;j++){var s=applyR(pick(RW_GHOST));tot[s]=(tot[s]||0)+1}
  Object.keys(tot).forEach(function(s){lines.push(s+(tot[s]>1?' ×'+tot[s]:''))});
  save();msg('👻 Mở '+n+' Bí Ngô Ma Quái: '+lines.join(' · '));say('👻 Mở Bí Ngô Ma Quái ×'+n,'#d9a8ff')}

/* ---------- bảng giao diện ---------- */
function daysLeft(){return Math.max(0,Math.ceil((CF.end-Date.now())/864e5))}
var CSS_ON=0,tab=0;
function css(){if(CSS_ON)return;CSS_ON=1;var s2=document.createElement('style');s2.textContent=[
'#hwp{background:linear-gradient(180deg,#22102f,#12061c)!important;box-shadow:0 0 0 1px #000,0 8px 30px #000b,0 0 28px #ff9a2e33}',
'#hwp .hh{display:flex;justify-content:space-between;align-items:center;gap:8px}',
'#hwp .hd{font-size:11px;color:#ffcf8a;background:#ff9a2e22;border:1px solid #ff9a2e66;border-radius:10px;padding:1px 8px;white-space:nowrap}',
'#hwp .tb{display:flex;gap:4px;margin:8px 0 4px}',
'#hwp .tb button{flex:1;padding:7px 2px;border-radius:8px;border:1px solid #ff9a2e44;background:#2a1238;color:#d9c3ee;font-size:12.5px;position:relative}',
'#hwp .tb button.on{background:linear-gradient(180deg,#ffb347,#c85a0a);color:#2a0d00;font-weight:bold;border-color:#ffd27a}',
'#hwp .tb i{position:absolute;top:-6px;right:-3px;background:#ff3b5c;color:#fff;border-radius:9px;font-style:normal;font-size:10px;padding:0 5px;line-height:15px}',
'#hwp .cd{background:#ffffff0d;border:1px solid #ffffff1a;border-radius:10px;padding:8px;margin:6px 0}',
'#hwp .rw{display:flex;align-items:center;gap:9px}',
'#hwp .rw img{width:40px;height:40px;flex:none;filter:drop-shadow(0 2px 3px #000a)}',
'#hwp .rw .nm{flex:1;min-width:0;font-size:13px;line-height:1.25}',
'#hwp .rw .nm small{display:block;opacity:.7;font-size:11px}',
'#hwp .hb{height:6px;border-radius:4px;background:#00000077;overflow:hidden;margin-top:3px}',
'#hwp .hb i{display:block;height:100%;border-radius:4px;transition:width .3s}',
'#hwp .ch{display:inline-block;font-size:11px;border-radius:9px;padding:1px 8px;margin:3px 4px 0 0;background:#00000055;border:1px solid #ffffff22}',
'#hwp .bt{display:flex;gap:6px;margin-top:8px}',
'#hwp .bt button{flex:1;padding:8px 4px;border-radius:8px;border:1px solid #ffd27a88;background:linear-gradient(180deg,#8a3fc4,#4a1a78);color:#fff;font-size:12.5px}',
'#hwp .bt button.hot{background:linear-gradient(180deg,#ffb347,#c85a0a);color:#2a0d00;font-weight:bold}',
'#hwp .sm{padding:4px 10px;border-radius:7px;border:1px solid #ffd27a88;background:#4a1a78;color:#fff;font-size:12px}',
'#hwp button:disabled{opacity:.4}',
'#hwp .ms{background:#2a1236;border:1px solid #ff9a2e;border-radius:8px;padding:6px 8px;margin:6px 0 0;font-size:12px;color:#ffe9a0;line-height:1.35}',
'#hwp .tk{position:relative;height:8px;border-radius:5px;background:#000a;margin:14px 8px 8px}',
'#hwp .tk i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#ff9a2e,#ffd76a)}',
'#hwp .tk b{position:absolute;top:-5px;width:18px;height:18px;border-radius:50%;margin-left:-9px;border:2px solid #666;background:#222;box-sizing:border-box}',
'#hwp .tk b.ok{border-color:#ffd27a;background:#ff9a2e;box-shadow:0 0 8px #ff9a2e}',
'#hwp .gr{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
'#hwp .gc{border-radius:8px;padding:6px;font-size:11.5px;background:#0006;border:1px solid #ffffff1a;text-align:center;line-height:1.3}',
'#hwp .gc.rd{border-color:#ffd27a;background:#ff9a2e22;box-shadow:0 0 10px #ff9a2e55}',
'#hwp .gc.dn{opacity:.5}',
'#hwp .gc button{margin-top:5px;width:100%;padding:4px;border-radius:6px;border:1px solid #ffd27a;background:#ff9a2e;color:#2a0d00;font-weight:bold}'
].join('');document.head.appendChild(s2)}
function bar(v,max,c){var p=Math.max(0,Math.min(1,v/max))*100;return '<div class="hb"><i style="width:'+p+'%;background:'+c+'"></i></div>'}
function im(k){return '<img alt="" src="'+ico(k)+'">'}
function chips(a){return a.map(function(x){return '<span class="ch">'+x+'</span>'}).join('')}
function rwLabel(r){return r[1]==='lt'?'🔒 '+nf(r[2])+' LT khoá':r[1]==='sh'?'💠 '+r[2]+' Mảnh Thánh':'🔮 Ngọc Định Hồn'+(r[2]>1?' ×'+r[2]:'')}
function readyN(h){var n=0;MSQ.forEach(function(d){d.m.forEach(function(r,mi){if(!h.cl[msKey(d,mi)]&&h[d.k]>=r[0])n++})});return n}
function setTab(i){tab=i;render()}
function render(){
  if(!el)return;css();var h=H(),o='',rn=readyN(h);
  o+='<div class="hh"><b style="font-size:16px;color:#ffb347">🎃 Sứ Giả Halloween</b><span class="hd">còn '+daysLeft()+' ngày</span><button onclick="HALW.close()" style="padding:2px 10px">✕</button></div>';
  o+='<div class="tb">'+['🍬 Làm kẹo','🎁 Mở quà','🏆 Móc quà'].map(function(t,i){return '<button class="'+(tab===i?'on':'')+'" onclick="HALW.tab('+i+')">'+t+(i===2&&rn?'<i>'+rn+'</i>':'')+'</button>'}).join('')+'</div>';
  if(mg)o+='<div class="ms">'+mg+'</div>';
  if(tab===0){
    o+='<div class="cd">'+MATS.map(function(m){var v=h[m.k],ok=v>=CF.needMat;return '<div class="rw" style="margin-bottom:7px">'+im(m.k)+'<div class="nm"><b>'+m.n+'</b> <span style="float:right;color:'+(ok?'#7fe08a':'#ff9a8a')+'">'+v+' / '+CF.needMat+'</span>'+bar(v,CF.needMat,ok?'#7fe08a':'#ff9a2e')+'</div></div>'}).join('')
     +'<div style="font-size:11px;opacity:.7;margin-top:2px">Chi phí mỗi lần</div>'+chips(['💎 '+CF.craftLT+' Linh Thạch','🪙 '+nf(CF.craftGold)+' vàng'])
     +'<div style="font-size:11px;opacity:.7;margin-top:4px">Tỉ lệ ra</div>'+chips(CANDY.map(function(d,i){return '<span style="color:'+d.c+'">'+d.e+' '+d.n+' '+Math.round(CF.candyP[i]*100)+'%</span>'}))
     +'<div class="bt"><button class="hot" onclick="HALW.craft()">Ghép 1</button><button onclick="HALW.craft(true)">Ghép tối đa ×'+maxCandy(h)+'</button></div></div>';
  }else if(tab===1){
    o+='<div class="cd">'+CANDY.map(function(d,i){return '<div class="rw" style="margin-bottom:'+(i<2?7:0)+'px">'+im(d.k)+'<div class="nm"><b style="color:'+d.c+'">'+d.n+'</b><small>đang có ×'+h[d.k]+'</small></div><button class="sm" '+(h[d.k]?'':'disabled ')+'onclick="HALW.eat('+i+',0)">Mở 1</button><button class="sm" '+(h[d.k]?'':'disabled ')+'onclick="HALW.eat('+i+',1)">Hết</button></div>'}).join('')+'</div>';
    o+='<div class="cd"><div class="rw">'+im('pk')+'<div class="nm"><b style="color:#ff9a2e">Bí Ngô</b> <span style="float:right;color:'+(h.pk>=CF.needPump?'#7fe08a':'#ff9a8a')+'">'+h.pk+' / '+CF.needPump+'</span>'+bar(h.pk,CF.needPump,h.pk>=CF.needPump?'#7fe08a':'#ff9a2e')+'<small>Boss rơi 5%</small></div></div>'
     +chips(['💎 '+CF.ghostLT+' Linh Thạch','🪙 '+nf(CF.ghostGold)+' vàng','→ 👻 Bí Ngô Ma Quái'])
     +'<div class="bt"><button class="hot" onclick="HALW.ghost()">Ghép 1</button><button onclick="HALW.ghost(true)">Ghép tối đa ×'+maxGhost(h)+'</button></div>'
     +'<div class="rw" style="margin-top:9px;padding-top:8px;border-top:1px dashed #ffffff22">'+im('gp')+'<div class="nm"><b style="color:#d9a8ff">Bí Ngô Ma Quái</b><small>đang có ×'+h.gp+'</small></div><button class="sm" '+(h.gp?'':'disabled ')+'onclick="HALW.openG(0)">Mở 1</button><button class="sm" '+(h.gp?'':'disabled ')+'onclick="HALW.openG(1)">Hết</button></div>'
     +(h.wf4?'<div style="font-size:11.5px;margin-top:6px">🪽 Mảnh Cánh Cấp 4: <b>'+h.wf4+'</b></div>':'')+'</div>';
  }else{
    o+='<div style="font-size:11px;opacity:.75;margin:2px 2px 0">Tính theo số đã dùng. Linh Thạch là 🔒 khoá.</div>';
    MSQ.forEach(function(d,di){
      var mx=d.m[d.m.length-1][0],key=d.k==='upk'?'pk':'c'+d.k.charAt(1);
      o+='<div class="cd"><div class="rw">'+im(key)+'<div class="nm"><b style="color:'+d.c+'">'+d.n+'</b><small>đã dùng '+h[d.k]+' / '+mx+'</small></div></div>'
       +'<div class="tk"><i style="width:'+Math.min(100,h[d.k]/mx*100)+'%"></i>'+d.m.map(function(r){return '<b class="'+(h[d.k]>=r[0]?'ok':'')+'" style="left:'+(r[0]/mx*100)+'%"></b>'}).join('')+'</div>'
       +'<div class="gr">'+d.m.map(function(r,mi){var got=!!h.cl[msKey(d,mi)],ok=h[d.k]>=r[0];
          return '<div class="gc'+(got?' dn':ok?' rd':'')+'"><b>Mốc '+r[0]+'</b><br>'+rwLabel(r)+'<br>'+(got?'✔ Đã nhận':ok?'<button onclick="HALW.claim('+di+','+mi+')">Nhận</button>':'<span style="opacity:.6">'+Math.min(h[d.k],r[0])+'/'+r[0]+'</span>')+'</div>'}).join('')+'</div></div>'});
    o+='<div class="bt"><button class="hot" '+(rn?'':'disabled ')+'onclick="HALW.claimAll()">🎁 Nhận tất cả'+(rn?' ('+rn+')':'')+'</button></div>';
  }
  el.innerHTML=o}
function mk(){
  if(el)return;
  el=document.createElement('div');el.id='hwp';
  el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,400px);max-height:86vh;overflow:auto;background:#1a0b24f2;color:#f3e6ff;border:2px solid #ff9a2e;border-radius:10px;padding:10px;z-index:99999;display:none;font-family:KTH Serif,Songti SC,STKaiti,KaiTi,serif';
  ['pointerdown','touchstart','keydown','keyup','keypress','click'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})});
  document.body.appendChild(el)}
function open(){if(!active()||!started||on)return;mk();on=true;mg='';vt=null;vgo=-1;render();el.style.display='block'}
function close(){on=false;if(el)el.style.display='none'}

/* ---------- vẽ: LÀNG ĐÊM HALLOWEEN ----------
 * Pha 1 (xbg): phủ bầu trời tím đêm + quầng cam chân trời + sao nhấp nháy + trăng + dơi (sau nhà, trước toà nhà).
 * Pha 2 (drawEP, ngay trước hero): phủ tím nhẹ lên cảnh, ánh đèn bí ngô, bí ngô/xương/bia mộ/NPC, sương, ma, đom đóm.
 * Mọi hình dựng 1 lần vào canvas đệm (độ phân giải ×2) nên mỗi khung hình chỉ drawImage. */
var SP={},STARS=[],K=2;
function spr(w,h,fn){var cv=document.createElement('canvas');cv.width=w*K;cv.height=h*K;var q=cv.getContext('2d');q.scale(K,K);fn(q,w,h);cv.lw=w;cv.lh=h;return cv}
function glowSpr(r,rgb,a){return spr(r*2,r*2,function(q){var gr=q.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,'rgba('+rgb+','+a+')');gr.addColorStop(.4,'rgba('+rgb+','+(a*.35)+')');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,r*2,r*2)})}
function tri(q,a,b,c,d,e,f){q.beginPath();q.moveTo(a,b);q.lineTo(c,d);q.lineTo(e,f);q.closePath();q.fill()}
function carve(q,cx,cy,k,v){
  if(v===1)return carve2(q,cx,cy,k);if(v===2)return carve3(q,cx,cy,k);
  q.save();q.shadowColor='#ff9a1a';q.shadowBlur=9;q.fillStyle='#ffe27a';
  tri(q,cx-20*k,cy-4*k,cx-6*k,cy-4*k,cx-13*k,cy-17*k);tri(q,cx+20*k,cy-4*k,cx+6*k,cy-4*k,cx+13*k,cy-17*k);
  q.beginPath();q.moveTo(cx-20*k,cy+5*k);q.lineTo(cx-11*k,cy+14*k);q.lineTo(cx-5*k,cy+8*k);q.lineTo(cx,cy+15*k);q.lineTo(cx+5*k,cy+8*k);q.lineTo(cx+11*k,cy+14*k);q.lineTo(cx+20*k,cy+5*k);q.lineTo(cx+14*k,cy+20*k);q.lineTo(cx-14*k,cy+20*k);q.closePath();q.fill();
  q.fillStyle='#fff8d0';tri(q,cx-14*k,cy-6*k,cx-9*k,cy-6*k,cx-11.5*k,cy-11*k);tri(q,cx+14*k,cy-6*k,cx+9*k,cy-6*k,cx+11.5*k,cy-11*k);q.restore()}
function pumpBody(q,cx,cy,rx,ry){
  q.fillStyle='#b8480a';q.beginPath();q.ellipse(cx,cy,rx,ry,0,0,6.3);q.fill();
  [[-.62,.42,.86],[.62,.42,.86],[-.3,.5,.96],[.3,.5,.96],[0,.54,1]].forEach(function(l){
    var x=cx+l[0]*rx,w=rx*l[1],h=ry*l[2],gr=q.createRadialGradient(x-w*.25,cy-h*.35,2,x,cy,Math.max(w,h));
    gr.addColorStop(0,'#ffc062');gr.addColorStop(.55,'#f07a14');gr.addColorStop(1,'#a63e06');
    q.fillStyle=gr;q.strokeStyle='#7a2a03';q.lineWidth=1.2;q.beginPath();q.ellipse(x,cy,w,h,0,0,6.3);q.fill();q.stroke()});
  q.fillStyle='rgba(255,255,255,.16)';q.beginPath();q.ellipse(cx-rx*.35,cy-ry*.45,rx*.28,ry*.16,-.4,0,6.3);q.fill()}
function mkPumpkin(v){return spr(100,90,function(q){
  q.fillStyle='rgba(0,0,0,.4)';q.beginPath();q.ellipse(50,84,40,6,0,0,6.3);q.fill();
  pumpBody(q,50,52,42,32);
  q.fillStyle='#4a7a22';q.beginPath();q.moveTo(44,22);q.quadraticCurveTo(46,8,56,6);q.lineTo(58,12);q.quadraticCurveTo(52,14,53,22);q.closePath();q.fill();
  q.strokeStyle='#6fa83a';q.lineWidth=2;q.beginPath();q.moveTo(57,10);q.quadraticCurveTo(70,4,68,14);q.quadraticCurveTo(66,18,62,14);q.stroke();
  carve(q,50,52,1,v)})}
function bone(q,pts,w){q.lineCap='round';q.lineJoin='round';
  q.strokeStyle='#2b1a3a';q.lineWidth=w+3;q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)q.lineTo(pts[i][0],pts[i][1]);q.stroke();
  q.strokeStyle='#efe9d6';q.lineWidth=w;q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(i=1;i<pts.length;i++)q.lineTo(pts[i][0],pts[i][1]);q.stroke()}
function joint(q,x,y,r){q.fillStyle='#2b1a3a';q.beginPath();q.arc(x,y,r+1.5,0,6.3);q.fill();q.fillStyle='#f6f0de';q.beginPath();q.arc(x,y,r,0,6.3);q.fill()}
function mkSkeleton(wave,hat){return spr(92,170,function(q){
  q.fillStyle='rgba(0,0,0,.35)';q.beginPath();q.ellipse(46,164,26,5,0,0,6.3);q.fill();
  q.translate(0,20);
  bone(q,[[40,94],[33,120],[31,142]],5);bone(q,[[52,94],[59,120],[61,142]],5);
  bone(q,[[31,142],[22,144]],5);bone(q,[[61,142],[70,144]],5);joint(q,33,120,3.6);joint(q,59,120,3.6);
  bone(q,[[46,46],[46,94]],4);for(var i=0;i<6;i++)joint(q,46,50+i*8,2.2);
  for(i=0;i<4;i++){var y=54+i*8;bone(q,[[46,y],[34,y-2],[31,y+5]],3);bone(q,[[46,y],[58,y-2],[61,y+5]],3)}
  bone(q,[[33,92],[46,99],[59,92]],5);
  bone(q,[[46,50],[30,68],[24,92]],4);joint(q,30,68,3.2);
  if(wave){bone(q,[[46,50],[64,36],[72,14]],4);joint(q,64,36,3.2);joint(q,72,14,3.6)}
  else{bone(q,[[46,50],[62,68],[68,92]],4);joint(q,62,68,3.2);joint(q,68,92,3.4)}
  joint(q,24,92,3.4);
  q.fillStyle='#2b1a3a';q.beginPath();q.ellipse(46,26,19,18,0,0,6.3);q.fill();
  var gr=q.createRadialGradient(40,20,2,46,26,18);gr.addColorStop(0,'#fffdf2');gr.addColorStop(1,'#e4dcc4');q.fillStyle=gr;q.beginPath();q.ellipse(46,26,17.5,16.5,0,0,6.3);q.fill();
  q.fillStyle='#2b1a3a';q.beginPath();q.roundRect?q.roundRect(36,38,20,10,3):q.rect(36,38,20,10);q.fill();
  q.fillStyle='#efe9d6';q.beginPath();q.roundRect?q.roundRect(37.5,38,17,7.5,2):q.rect(37.5,38,17,7.5);q.fill();
  q.strokeStyle='#2b1a3a';q.lineWidth=1.2;for(i=0;i<4;i++){q.beginPath();q.moveTo(40+i*4,38);q.lineTo(40+i*4,45);q.stroke()}
  q.fillStyle='#1b0f24';q.beginPath();q.ellipse(39,26,5.5,6.5,0,0,6.3);q.ellipse(53,26,5.5,6.5,0,0,6.3);q.fill();tri(q,46,30,43,36,49,36);
  q.save();q.shadowColor='#ff9a1a';q.shadowBlur=6;q.fillStyle='#ffb347';q.beginPath();q.arc(39,27,2,0,6.3);q.arc(53,27,2,0,6.3);q.fill();q.restore();
  if(hat){q.fillStyle='#1b0f24';tri(q,28,12,64,12,50,-14);q.fillStyle='#3a1458';tri(q,32,12,60,12,50,-12);q.fillStyle='#ff9a2e';q.fillRect(31,6,30,5);q.fillStyle='#1b0f24';q.beginPath();q.ellipse(46,12,24,4,0,0,6.3);q.fill()}
})}
function mkTomb(){return spr(76,98,function(q){
  q.fillStyle='rgba(0,0,0,.4)';q.beginPath();q.ellipse(38,92,34,5,0,0,6.3);q.fill();
  var gr=q.createLinearGradient(0,10,0,92);gr.addColorStop(0,'#a9aec4');gr.addColorStop(1,'#5c6178');
  q.fillStyle=gr;q.strokeStyle='#26253a';q.lineWidth=3;q.beginPath();q.moveTo(10,90);q.lineTo(10,38);q.quadraticCurveTo(10,8,38,8);q.quadraticCurveTo(66,8,66,38);q.lineTo(66,90);q.closePath();q.fill();q.stroke();
  q.strokeStyle='rgba(255,255,255,.22)';q.lineWidth=2;q.beginPath();q.moveTo(16,86);q.lineTo(16,40);q.quadraticCurveTo(16,15,38,14);q.stroke();
  q.fillStyle='#2b2a40';q.font='bold 17px serif';q.textAlign='center';q.fillText('R.I.P',38,48);
  q.strokeStyle='#2b2a40';q.lineWidth=1.5;q.beginPath();q.moveTo(26,58);q.lineTo(30,66);q.lineTo(26,74);q.moveTo(48,62);q.lineTo(52,70);q.stroke();
  q.fillStyle='rgba(80,140,60,.55)';q.beginPath();q.ellipse(22,88,14,6,0,0,6.3);q.ellipse(56,89,10,5,0,0,6.3);q.fill()})}
function mkGhost(){return spr(64,78,function(q){
  var gr=q.createLinearGradient(0,6,0,74);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(205,190,255,.7)');
  q.fillStyle=gr;q.beginPath();q.moveTo(8,40);q.quadraticCurveTo(8,6,32,6);q.quadraticCurveTo(56,6,56,40);q.lineTo(56,70);q.quadraticCurveTo(50,60,44,70);q.quadraticCurveTo(38,60,32,70);q.quadraticCurveTo(26,60,20,70);q.quadraticCurveTo(14,60,8,70);q.closePath();q.fill();
  q.fillStyle='#1b0f24';q.beginPath();q.ellipse(24,32,4.5,6.5,0,0,6.3);q.ellipse(40,32,4.5,6.5,0,0,6.3);q.ellipse(32,47,4,5.5,0,0,6.3);q.fill();
  q.fillStyle='rgba(255,130,170,.5)';q.beginPath();q.ellipse(16,42,4,2.5,0,0,6.3);q.ellipse(48,42,4,2.5,0,0,6.3);q.fill()})}
function mkNpc(){return spr(150,214,function(q){
  q.translate(0,22);
  var cg=q.createLinearGradient(0,70,0,190);cg.addColorStop(0,'#6a30a8');cg.addColorStop(1,'#25093f');
  q.fillStyle=cg;q.strokeStyle='#14061f';q.lineWidth=2.5;q.beginPath();q.moveTo(75,72);q.quadraticCurveTo(44,112,26,184);q.quadraticCurveTo(46,172,57,186);q.quadraticCurveTo(66,172,75,188);q.quadraticCurveTo(84,172,93,186);q.quadraticCurveTo(104,172,124,184);q.quadraticCurveTo(106,112,75,72);q.closePath();q.fill();q.stroke();
  q.fillStyle='rgba(20,6,40,.55)';q.beginPath();q.moveTo(75,78);q.quadraticCurveTo(64,120,62,184);q.lineTo(88,184);q.quadraticCurveTo(86,120,75,78);q.fill();
  q.fillStyle='#ffd23f';[[50,128],[98,140],[60,160],[90,166],[70,112],[108,118]].forEach(function(p){tri(q,p[0],p[1]-4,p[0]-3.5,p[1]+3,p[0]+3.5,p[1]+3)});
  q.strokeStyle='#ff9a2e';q.lineWidth=3;q.beginPath();q.moveTo(52,86);q.quadraticCurveTo(75,98,98,86);q.stroke();
  q.strokeStyle='#14061f';q.lineWidth=7;q.lineCap='round';q.beginPath();q.moveTo(100,90);q.lineTo(122,112);q.stroke();q.strokeStyle='#5a2a8f';q.lineWidth=4;q.beginPath();q.moveTo(100,90);q.lineTo(122,112);q.stroke();
  q.strokeStyle='#e9e0c8';q.lineWidth=3;q.beginPath();q.moveTo(122,112);q.lineTo(126,150);q.stroke();
  q.fillStyle='#ff6fb5';q.strokeStyle='#14061f';q.lineWidth=1.5;q.beginPath();q.arc(121,100,14,0,6.3);q.fill();q.stroke();
  q.strokeStyle='#fff';q.lineWidth=2.4;q.beginPath();for(var a=0;a<12.5;a+=.2){var r=1+a*.95;q.lineTo(121+Math.cos(a)*r*.9,100+Math.sin(a)*r*.9)}q.stroke();
  q.strokeStyle='#14061f';q.lineWidth=7;q.beginPath();q.moveTo(50,90);q.lineTo(30,116);q.stroke();q.strokeStyle='#5a2a8f';q.lineWidth=4;q.beginPath();q.moveTo(50,90);q.lineTo(30,116);q.stroke();
  q.strokeStyle='#14061f';q.lineWidth=1.5;q.beginPath();q.moveTo(26,116);q.lineTo(26,104);q.stroke();
  q.fillStyle='#14061f';q.fillRect(16,118,20,26);q.fillStyle='#ffc247';q.fillRect(19,121,14,20);q.fillStyle='#fff3b0';q.fillRect(23,126,6,10);q.fillStyle='#14061f';q.fillRect(14,115,24,4);q.fillRect(14,143,24,4);
  pumpBody(q,75,64,30,24);
  q.fillStyle='#4a7a22';q.beginPath();q.moveTo(71,42);q.quadraticCurveTo(73,34,80,33);q.lineTo(82,37);q.quadraticCurveTo(77,39,78,43);q.closePath();q.fill();
  carve(q,75,64,.82);
  q.fillStyle='#14061f';q.beginPath();q.ellipse(75,44,44,9,0,0,6.3);q.fill();
  var hg=q.createLinearGradient(0,-10,0,44);hg.addColorStop(0,'#3a1a66');hg.addColorStop(1,'#1f0b3a');q.fillStyle=hg;q.beginPath();q.moveTo(48,42);q.quadraticCurveTo(62,36,68,12);q.quadraticCurveTo(74,-6,96,-12);q.quadraticCurveTo(88,8,102,42);q.closePath();q.fill();q.strokeStyle='#14061f';q.lineWidth=2;q.stroke();
  q.fillStyle='#ff9a2e';q.beginPath();q.moveTo(50,38);q.quadraticCurveTo(75,30,100,38);q.lineTo(101,43);q.quadraticCurveTo(75,36,49,43);q.closePath();q.fill();
  q.fillStyle='#ffd23f';q.fillRect(69,32,12,9);q.fillStyle='#14061f';q.fillRect(72,35,6,4)})}
/* ---------- Fix393: sprite chi tiết hơn (icon quà, đèn lồng, quạ, nến, vạc, cây khô) ---------- */
function carve2(q,cx,cy,k){q.save();q.shadowColor='#ff9a1a';q.shadowBlur=9;q.fillStyle='#ffe27a';
  q.beginPath();q.ellipse(cx-11*k,cy-8*k,5.5*k,7*k,0,0,6.3);q.fill();q.beginPath();q.ellipse(cx+11*k,cy-8*k,5.5*k,7*k,0,0,6.3);q.fill();
  tri(q,cx-3.5*k,cy+1*k,cx+3.5*k,cy+1*k,cx,cy-4*k);
  q.beginPath();q.moveTo(cx-19*k,cy+5*k);q.quadraticCurveTo(cx,cy+28*k,cx+19*k,cy+5*k);q.quadraticCurveTo(cx,cy+13*k,cx-19*k,cy+5*k);q.closePath();q.fill();
  q.fillStyle='#d9701a';q.fillRect(cx-4*k,cy+11*k,5*k,5*k);q.restore()}
function carve3(q,cx,cy,k){q.save();q.shadowColor='#ff7a1a';q.shadowBlur=10;q.fillStyle='#ffd45a';
  tri(q,cx-22*k,cy-14*k,cx-5*k,cy-3*k,cx-20*k,cy-1*k);tri(q,cx+22*k,cy-14*k,cx+5*k,cy-3*k,cx+20*k,cy-1*k);
  tri(q,cx-3*k,cy+1*k,cx+3*k,cy+1*k,cx,cy-5*k);
  var T=[[-23,7],[-15,12],[-9,6],[-4,13],[3,6],[8,13],[15,6],[23,8],[19,19],[11,15],[4,22],[-4,15],[-10,22],[-18,17]];
  q.beginPath();T.forEach(function(p,i){i?q.lineTo(cx+p[0]*k,cy+p[1]*k):q.moveTo(cx+p[0]*k,cy+p[1]*k)});q.closePath();q.fill();q.restore()}
function wrapC(q,c1,c2,c3){ /* kẹo bọc giấy xoắn hai đầu */
  q.strokeStyle='#2b1a3a';q.lineWidth=1.6;q.fillStyle=c3;
  q.beginPath();q.moveTo(17,32);q.lineTo(5,22);q.lineTo(8,32);q.lineTo(5,42);q.closePath();q.fill();q.stroke();
  q.beginPath();q.moveTo(47,32);q.lineTo(59,22);q.lineTo(56,32);q.lineTo(59,42);q.closePath();q.fill();q.stroke();
  var gr=q.createLinearGradient(0,22,0,42);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  q.fillStyle=gr;q.beginPath();q.ellipse(32,32,16,11,0,0,6.3);q.fill();q.stroke();
  q.strokeStyle='rgba(255,255,255,.55)';q.lineWidth=2.4;q.beginPath();q.moveTo(24,24);q.quadraticCurveTo(22,32,26,40);q.moveTo(36,22.5);q.quadraticCurveTo(34,32,38,41.5);q.stroke();
  q.fillStyle='rgba(255,255,255,.5)';q.beginPath();q.ellipse(26,27,5,2.2,-.5,0,6.3);q.fill()}
function mkIcon(k){return spr(64,64,function(q){
  q.lineJoin='round';q.lineCap='round';var gr,i;
  q.fillStyle='rgba(0,0,0,.28)';q.beginPath();q.ellipse(32,58,20,4,0,0,6.3);q.fill();
  if(k==='sg'){
    gr=q.createLinearGradient(0,14,0,56);gr.addColorStop(0,'#fffaf0');gr.addColorStop(1,'#d3c6aa');
    q.fillStyle=gr;q.strokeStyle='#4a3a2a';q.lineWidth=2;q.beginPath();q.moveTo(18,22);q.quadraticCurveTo(9,40,14,54);q.quadraticCurveTo(32,60,50,54);q.quadraticCurveTo(55,40,46,22);q.quadraticCurveTo(32,28,18,22);q.closePath();q.fill();q.stroke();
    q.fillStyle='#eadfc6';q.beginPath();q.moveTo(21,23);q.lineTo(18,11);q.lineTo(28,16);q.lineTo(32,7);q.lineTo(36,16);q.lineTo(46,11);q.lineTo(43,23);q.closePath();q.fill();q.stroke();
    q.strokeStyle='#ff7a1a';q.lineWidth=4;q.beginPath();q.moveTo(20,25);q.quadraticCurveTo(32,31,44,25);q.stroke();
    q.fillStyle='#fff';q.strokeStyle='#8a7a66';q.lineWidth=1.2;[[23,38],[33,41],[27,48],[38,49]].forEach(function(p){q.fillRect(p[0],p[1],7,7);q.strokeRect(p[0],p[1],7,7)});
    q.fillStyle='#fff6c0';[[12,18],[52,26],[48,10]].forEach(function(p){tri(q,p[0],p[1]-4,p[0]-1.6,p[1],p[0]+1.6,p[1]);tri(q,p[0],p[1]+4,p[0]-1.6,p[1],p[0]+1.6,p[1])})}
  else if(k==='fl'){
    gr=q.createLinearGradient(0,14,0,56);gr.addColorStop(0,'#e9c98f');gr.addColorStop(1,'#b98a4a');
    q.fillStyle=gr;q.strokeStyle='#4a2f12';q.lineWidth=2;q.beginPath();q.moveTo(17,22);q.quadraticCurveTo(8,40,13,54);q.quadraticCurveTo(32,60,51,54);q.quadraticCurveTo(56,40,47,22);q.quadraticCurveTo(32,28,17,22);q.closePath();q.fill();q.stroke();
    q.fillStyle='#d9b576';q.beginPath();q.moveTo(20,23);q.lineTo(17,12);q.lineTo(27,17);q.lineTo(32,9);q.lineTo(37,17);q.lineTo(47,12);q.lineTo(44,23);q.closePath();q.fill();q.stroke();
    q.strokeStyle='#6b4a1e';q.lineWidth=3;q.beginPath();q.moveTo(19,25);q.quadraticCurveTo(32,31,45,25);q.stroke();
    q.strokeStyle='#5a3a12';q.lineWidth=1.8;q.beginPath();q.moveTo(32,52);q.lineTo(32,36);q.stroke();q.fillStyle='#f6d36a';
    for(i=0;i<4;i++){q.beginPath();q.ellipse(28,38+i*3.6,2.2,3.4,-.6,0,6.3);q.fill();q.beginPath();q.ellipse(36,38+i*3.6,2.2,3.4,.6,0,6.3);q.fill()}
    q.fillStyle='rgba(255,255,255,.7)';[[14,50],[50,48],[24,56],[42,57]].forEach(function(p){q.beginPath();q.arc(p[0],p[1],1.6,0,6.3);q.fill()})}
  else if(k==='ml'){
    gr=q.createLinearGradient(0,18,0,56);gr.addColorStop(0,'#ffd36a');gr.addColorStop(1,'#b8650a');
    q.fillStyle='rgba(200,230,255,.25)';q.strokeStyle='#e9f4ff';q.lineWidth=2;q.beginPath();q.moveTo(18,22);q.quadraticCurveTo(10,28,12,40);q.lineTo(12,52);q.quadraticCurveTo(12,57,18,57);q.lineTo(46,57);q.quadraticCurveTo(52,57,52,52);q.lineTo(52,40);q.quadraticCurveTo(54,28,46,22);q.closePath();q.fill();q.stroke();
    q.fillStyle=gr;q.beginPath();q.moveTo(14,34);q.quadraticCurveTo(32,38,50,34);q.lineTo(50,52);q.quadraticCurveTo(50,55,46,55);q.lineTo(18,55);q.quadraticCurveTo(14,55,14,52);q.closePath();q.fill();
    q.fillStyle='#8a3fc4';q.strokeStyle='#2b1a3a';q.lineWidth=1.6;q.beginPath();q.moveTo(15,23);q.lineTo(17,12);q.lineTo(47,12);q.lineTo(49,23);q.closePath();q.fill();q.stroke();
    q.fillStyle='#ff9a2e';q.fillRect(16,19,32,4);
    q.fillStyle='#fff3c8';q.beginPath();q.roundRect?q.roundRect(21,40,22,11,3):q.rect(21,40,22,11);q.fill();q.fillStyle='#9a5a10';q.font='bold 8px serif';q.textAlign='center';q.fillText('MẠCH',32,48.5);
    q.fillStyle='rgba(255,255,255,.55)';q.beginPath();q.ellipse(17,42,1.8,9,0,0,6.3);q.fill()}
  else if(k==='c1'){
    q.strokeStyle='#2b1a3a';q.lineWidth=5.5;q.beginPath();q.moveTo(33,38);q.lineTo(45,60);q.stroke();q.strokeStyle='#fff';q.lineWidth=3;q.beginPath();q.moveTo(33,38);q.lineTo(45,60);q.stroke();
    gr=q.createRadialGradient(26,20,3,31,26,20);gr.addColorStop(0,'#ffd0ea');gr.addColorStop(1,'#ff5fae');
    q.fillStyle=gr;q.strokeStyle='#2b1a3a';q.lineWidth=2;q.beginPath();q.arc(31,26,19,0,6.3);q.fill();q.stroke();
    q.strokeStyle='#fff';q.lineWidth=3.2;q.beginPath();for(var a=0;a<15;a+=.25){var r=1+a*1.15;q.lineTo(31+Math.cos(a)*r,26+Math.sin(a)*r)}q.stroke();
    q.fillStyle='rgba(255,255,255,.65)';q.beginPath();q.ellipse(22,15,6,3,-.7,0,6.3);q.fill();
    q.fillStyle='#ff9a2e';tri(q,36,43,31,38,41,38);tri(q,36,39,29,43,43,43)}
  else if(k==='c2'){wrapC(q,'#bfeaff','#3b8fe0','#8fd0ff')}
  else if(k==='c3'){
    wrapC(q,'#c9e87a','#5f8a1a','#8fb34a');
    q.fillStyle='#4a6a12';[[26,30,2.4],[38,35,2],[33,27,1.6]].forEach(function(p){q.beginPath();q.arc(p[0],p[1],p[2],0,6.3);q.fill()});
    q.strokeStyle='#2b1a3a';q.lineWidth=1.4;q.beginPath();q.moveTo(27,32);q.lineTo(30,35);q.moveTo(30,32);q.lineTo(27,35);q.moveTo(36,32);q.lineTo(39,35);q.moveTo(39,32);q.lineTo(36,35);q.stroke();
    q.strokeStyle='#8fd05a';q.lineWidth=2;for(i=0;i<3;i++){q.beginPath();q.moveTo(22+i*10,18);q.quadraticCurveTo(18+i*10,13,22+i*10,9);q.quadraticCurveTo(26+i*10,5,22+i*10,1);q.stroke()}
    q.fillStyle='#14061f';[[12,12],[52,14]].forEach(function(p){q.beginPath();q.arc(p[0],p[1],1.8,0,6.3);q.fill()})}
  else if(k==='pk'||k==='gp'){
    var gp=k==='gp';
    if(gp){gr=q.createRadialGradient(32,34,4,32,34,32);gr.addColorStop(0,'rgba(190,130,255,.75)');gr.addColorStop(1,'rgba(190,130,255,0)');q.fillStyle=gr;q.fillRect(0,0,64,64)}
    pumpBody(q,32,38,26,20);
    if(gp){q.globalCompositeOperation='source-atop';q.fillStyle='rgba(110,50,190,.55)';q.fillRect(0,0,64,64);q.globalCompositeOperation='source-over'}
    q.fillStyle='#4a7a22';q.beginPath();q.moveTo(28,19);q.quadraticCurveTo(29,9,36,8);q.lineTo(38,12);q.quadraticCurveTo(34,13,35,19);q.closePath();q.fill();
    if(gp){q.save();q.shadowColor='#c9a0ff';q.shadowBlur=8;q.fillStyle='#f1e2ff';q.beginPath();q.ellipse(24,34,3.4,5,0,0,6.3);q.fill();q.beginPath();q.ellipse(40,34,3.4,5,0,0,6.3);q.fill();q.beginPath();q.ellipse(32,46,4,5,0,0,6.3);q.fill();q.restore()}
    else carve(q,32,38,.62)}
})}
function mkLantern(){return spr(44,84,function(q){
  q.strokeStyle='#1b0f24';q.lineWidth=1.6;q.beginPath();q.moveTo(22,0);q.lineTo(22,30);q.stroke();
  q.fillStyle='#1b0f24';q.fillRect(17,26,10,5);
  pumpBody(q,22,56,19,16);q.fillStyle='#4a7a22';q.fillRect(20,38,4,5);carve2(q,22,56,.5)})}
function mkCrow(){return spr(44,40,function(q){
  q.fillStyle='#14101e';q.strokeStyle='#3a2a5a';q.lineWidth=1.2;
  q.beginPath();q.moveTo(11,25);q.lineTo(0,33);q.lineTo(5,27);q.lineTo(0,24);q.lineTo(12,22);q.closePath();q.fill();
  q.beginPath();q.ellipse(21,23,13,8.5,-.25,0,6.3);q.fill();q.stroke();q.beginPath();q.arc(32,14,6.5,0,6.3);q.fill();
  q.fillStyle='#ff9a2e';tri(q,36,12,43,15,36,18);
  q.strokeStyle='#4a3a6a';q.lineWidth=1.5;q.beginPath();q.moveTo(12,22);q.quadraticCurveTo(21,29,29,21);q.stroke();
  q.strokeStyle='#14101e';q.lineWidth=1.8;q.beginPath();q.moveTo(19,31);q.lineTo(19,38);q.moveTo(24,31);q.lineTo(24,38);q.stroke();
  q.save();q.shadowColor='#ff9a2e';q.shadowBlur=5;q.fillStyle='#ffb347';q.beginPath();q.arc(33,13,1.5,0,6.3);q.fill();q.restore()})}
function mkCandles(){return spr(40,46,function(q){
  [[7,24,12,22],[17,14,12,32],[28,26,10,20]].forEach(function(c,i){
    var gr=q.createLinearGradient(c[0],0,c[0]+c[2],0);gr.addColorStop(0,'#fff4d6');gr.addColorStop(1,'#d9c08a');
    q.fillStyle=gr;q.strokeStyle='#5a4420';q.lineWidth=1.2;q.fillRect(c[0],c[1],c[2]-2,c[3]);q.strokeRect(c[0],c[1],c[2]-2,c[3]);
    q.fillStyle='#fff4d6';q.beginPath();q.ellipse(c[0]+(c[2]-2)/2,c[1]+1,(c[2]-2)/2+1,2.4,0,0,6.3);q.fill();
    q.beginPath();q.moveTo(c[0]+2,c[1]+2);q.lineTo(c[0]+2,c[1]+9);q.quadraticCurveTo(c[0]+3.5,c[1]+11,c[0]+5,c[1]+9);q.lineTo(c[0]+5,c[1]+2);q.fill();
    q.strokeStyle='#2b1a3a';q.lineWidth=1;q.beginPath();q.moveTo(c[0]+(c[2]-2)/2,c[1]);q.lineTo(c[0]+(c[2]-2)/2,c[1]-3);q.stroke();
    q.save();q.shadowColor='#ffb347';q.shadowBlur=6;q.fillStyle='#ffd36a';q.beginPath();q.moveTo(c[0]+(c[2]-2)/2,c[1]-10);q.quadraticCurveTo(c[0]+(c[2]-2)/2+4,c[1]-4,c[0]+(c[2]-2)/2,c[1]-2);q.quadraticCurveTo(c[0]+(c[2]-2)/2-4,c[1]-4,c[0]+(c[2]-2)/2,c[1]-10);q.fill();q.restore()});
  q.fillStyle='#3a2a2a';q.beginPath();q.ellipse(20,44,19,2.5,0,0,6.3);q.fill()})}
function mkCauldron(){return spr(96,84,function(q){
  q.fillStyle='rgba(0,0,0,.4)';q.beginPath();q.ellipse(48,80,38,5,0,0,6.3);q.fill();
  q.strokeStyle='#14061f';q.lineWidth=5;q.beginPath();q.moveTo(22,66);q.lineTo(16,78);q.moveTo(74,66);q.lineTo(80,78);q.stroke();
  q.lineWidth=3;q.beginPath();q.arc(10,36,10,Math.PI*.35,Math.PI*1.4);q.stroke();q.beginPath();q.arc(86,36,10,-Math.PI*.4,Math.PI*.65);q.stroke();
  var gr=q.createRadialGradient(36,38,4,48,50,44);gr.addColorStop(0,'#4a4a62');gr.addColorStop(1,'#14111f');
  q.fillStyle=gr;q.strokeStyle='#08040f';q.lineWidth=2.5;q.beginPath();q.moveTo(10,32);q.quadraticCurveTo(2,68,26,72);q.lineTo(70,72);q.quadraticCurveTo(94,68,86,32);q.closePath();q.fill();q.stroke();
  q.fillStyle='#22202e';q.beginPath();q.ellipse(48,32,40,9,0,0,6.3);q.fill();q.stroke();
  gr=q.createRadialGradient(48,32,2,48,32,36);gr.addColorStop(0,'#d6ff7a');gr.addColorStop(1,'#3fa02a');q.fillStyle=gr;q.beginPath();q.ellipse(48,32,34,6.5,0,0,6.3);q.fill();
  q.fillStyle='rgba(255,255,255,.2)';q.beginPath();q.ellipse(30,56,4,10,.3,0,6.3);q.fill();
  q.fillStyle='#e9e0c8';q.beginPath();q.arc(48,56,7,0,6.3);q.fill();q.fillStyle='#14061f';q.beginPath();q.arc(45.5,55,1.8,0,6.3);q.arc(50.5,55,1.8,0,6.3);q.fill();q.fillRect(46,60,4,3)})}
function mkTree(){return spr(150,240,function(q){
  q.lineCap='round';q.lineJoin='round';
  function br(w,pts){q.lineWidth=w;q.beginPath();q.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=4)q.quadraticCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3]);q.stroke()}
  q.strokeStyle='#0d0716';
  br(15,[72,236,66,190,74,150]);br(9,[74,150,58,118,40,86]);br(9,[74,150,92,112,112,70]);br(6,[58,118,36,110,18,92]);br(6,[92,112,120,104,134,84]);
  br(5,[40,86,34,60,44,30]);br(4,[40,86,22,66,8,60]);br(5,[112,70,106,44,96,18]);br(4,[112,70,130,52,142,48]);br(3,[44,30,52,22,50,10]);br(3,[96,18,86,14,82,4]);
  q.strokeStyle='#2a1a44';q.lineWidth=1.5;q.beginPath();q.moveTo(69,230);q.quadraticCurveTo(64,190,72,150);q.stroke();
  q.fillStyle='#0d0716';q.beginPath();q.ellipse(72,236,22,5,0,0,6.3);q.fill()})}
var IC={};function ico(k){if(!IC[k]){try{IC[k]=mkIcon(k).toDataURL()}catch(e){IC[k]=''}}return IC[k]}
function sprites(){if(SP.p)return;
  SP.p=mkPumpkin(0);SP.q=mkPumpkin(1);SP.r=mkPumpkin(2);SP.la=mkLantern();SP.cr=mkCrow();SP.cd=mkCandles();SP.cl=mkCauldron();SP.tr=mkTree();SP.g1=glowSpr(14,'255,150,40',1);SP.g2=glowSpr(14,'190,120,255',1);SP.g3=glowSpr(14,'140,230,90',1);SP.fl=glowSpr(20,'255,190,80',1);SP.k0=mkSkeleton(0,0);SP.k1=mkSkeleton(1,1);SP.t=mkTomb();SP.gh=mkGhost();SP.n=mkNpc();
  SP.gl=glowSpr(64,'255,150,40',.85);SP.fg=glowSpr(24,'255,214,110',1);SP.ms=glowSpr(80,'200,170,255',.5);
  SP.moon=spr(240,240,function(q){
    var gr=q.createRadialGradient(120,120,20,120,120,120);gr.addColorStop(0,'rgba(255,228,160,.6)');gr.addColorStop(.35,'rgba(255,200,120,.2)');gr.addColorStop(1,'rgba(255,190,100,0)');q.fillStyle=gr;q.fillRect(0,0,240,240);
    var d=q.createRadialGradient(108,108,4,120,120,46);d.addColorStop(0,'#fffbe0');d.addColorStop(.6,'#ffe9a8');d.addColorStop(1,'#e9bf6c');q.fillStyle=d;q.beginPath();q.arc(120,120,44,0,6.3);q.fill();
    q.fillStyle='rgba(150,105,55,.26)';[[106,114,9,8],[134,104,6,5],[126,136,11,9],[102,138,5,4],[140,124,4,3]].forEach(function(c){q.beginPath();q.ellipse(c[0],c[1],c[2],c[3],0,0,6.3);q.fill()})});
  var sd=7,i;for(i=0;i<80;i++){sd=(sd*1103515245+12345)&0x7fffffff;var a=sd/0x7fffffff;sd=(sd*1103515245+12345)&0x7fffffff;var b=sd/0x7fffffff;sd=(sd*1103515245+12345)&0x7fffffff;STARS.push([a,b,1+(sd%3==0?1:0),i*1.7])}}
var DEC=[['t',.04,.9,-.07],['k1',.085,1],['p',.13,.8],['p',.17,.55],['t',.215,.85,.06],['p',.265,.95],['k0',.34,.95],['p',.385,.7],['p',.455,.6],['k0',.5,.9],['p',.545,.65],['p',.635,.75],['t',.69,.85,-.05],['p',.74,.95],['p',.775,.6],['k1',.82,1],['p',.875,.8],['t',.925,.9,.07],['p',.965,.9]];
function busyMap(){return (window.LCT&&LCT.on())||(typeof FM!=='undefined'&&FM.isOn())||(typeof MN!=='undefined'&&MN.isOn())}
function inVillage(){return typeof vil!=='undefined'&&vil&&started&&!bo&&active()&&!busyMap()&&(!window.VWD||!VWD.plain||VWD.plain())}
function npcX(){return vw()*CF.npcX}
function bat(x,y,k,f){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-9*k,y-8*k-f*6*k,x-18*k,y-2*k-f*9*k);g.quadraticCurveTo(x-12*k,y+1*k,x-9*k,y+5*k);g.quadraticCurveTo(x-5*k,y+2*k,x,y+6*k);g.quadraticCurveTo(x+5*k,y+2*k,x+9*k,y+5*k);g.quadraticCurveTo(x+12*k,y+1*k,x+18*k,y-2*k-f*9*k);g.quadraticCurveTo(x+9*k,y-8*k-f*6*k,x,y);g.fill();g.beginPath();g.arc(x,y+1*k,3.2*k,0,6.3);g.fill()}
function sky(gy){
  sprites();var t=fr,i,p,x,y,port=(typeof PORT!=='undefined'&&PORT);
  var gr=g.createLinearGradient(0,0,0,gy*1.3);
  gr.addColorStop(0,'rgba(8,4,38,.9)');gr.addColorStop(.35,'rgba(28,12,66,.78)');gr.addColorStop(.62,'rgba(66,22,82,.56)');gr.addColorStop(1,'rgba(28,10,48,.5)');
  g.fillStyle=gr;g.fillRect(0,0,W,gy*3);
  var hg=g.createLinearGradient(0,gy*.3,0,gy*.92);hg.addColorStop(0,'rgba(255,120,30,0)');hg.addColorStop(.6,'rgba(255,110,30,.3)');hg.addColorStop(1,'rgba(255,90,20,0)');
  g.fillStyle=hg;g.fillRect(0,gy*.3,W,gy*.62);
  g.fillStyle='#fff6d8';
  for(i=0;i<STARS.length;i++){p=STARS[i];g.globalAlpha=.25+.75*Math.abs(Math.sin(t*.025+p[3]));g.fillRect(p[0]*W,p[1]*gy*.5,p[2]*Math.max(1,s),p[2]*Math.max(1,s))}
  g.globalAlpha=1;
  var mx=W*(port?.72:.8),my=gy*.4,ms=(port?.85:1.15)*s;
  g.drawImage(SP.moon,mx-120*ms,my-120*ms,240*ms,240*ms);
  g.fillStyle='#0c0618';
  for(i=0;i<7;i++){x=((t*(.55+i*.09)+i*(W/7))%(W+160))-80;y=gy*(.1+(i%4)*.06)+Math.sin(t*.03+i*2)*16*s;bat(x,y,(.9+(i%3)*.25)*s,Math.sin(t*.35+i))}
  bat(mx-60*ms,my-30*ms+Math.sin(t*.04)*6*s,1.05*s,Math.sin(t*.3))}
/* Fix393: trang trí làng chi tiết hơn — cây khô, quạ trên bia, nến, dây đèn bí ngô + nhện, vạc phù thuỷ, lá rụng. Tất cả dựng sẵn từ sprite → chỉ drawImage mỗi khung. */
function trees(y){var k=1.05*s,i,x;g.globalAlpha=.92;[.1,.47,.8].forEach(function(p){x=vw()*p*s;g.drawImage(SP.tr,x-75*k,y-240*k,150*k,240*k)});g.globalAlpha=1}
function tombExtra(i,x,y,w,h2,t){var cw,ch,kw,kh,cx;
  if(i%2===0){cw=44*.7*s;ch=40*.7*s;g.drawImage(SP.cr,x-cw*.15,y-h2-ch*.6,cw,ch)}
  else{kw=40*.8*s;kh=46*.8*s;cx=x+w*.66;g.drawImage(SP.cd,cx-kw/2,y-kh+2*s,kw,kh);
    g.globalAlpha=.5+.25*Math.sin(t*.2+i*3)+.1*Math.sin(t*.47+i);g.drawImage(SP.fl,cx-24*s,y-kh*.82-24*s,48*s,48*s);g.globalAlpha=1}}
function extras(y,t){
  var ww=vw(),gw=ww*s,gy0=y-250*s,N=7,sg=26*s,j,b,l,tt,x0,x1,xm,yc,px,py,L,sx,sy,nx=npcX()*s;
  g.strokeStyle='#1b0f24';g.lineWidth=Math.max(1.5,2*s);g.beginPath();
  for(j=0;j<N;j++){x0=gw*j/N;x1=gw*(j+1)/N;g.moveTo(x0,gy0);g.quadraticCurveTo((x0+x1)/2,gy0+sg*2,x1,gy0)}g.stroke();
  for(j=0;j<N;j++){x0=gw*j/N;x1=gw*(j+1)/N;xm=(x0+x1)/2;yc=gy0+sg*2;
    for(b=1;b<=5;b++){if(b===3)continue;tt=b/6;px=(1-tt)*(1-tt)*x0+2*(1-tt)*tt*xm+tt*tt*x1;py=(1-tt)*(1-tt)*gy0+2*(1-tt)*tt*yc+tt*tt*gy0;
      g.globalAlpha=.55+.4*Math.abs(Math.sin(t*.07+j*2+b*1.3));g.drawImage(SP['g'+(1+(j+b)%3)],px-11*s,py-11*s,22*s,22*s)}
    g.globalAlpha=1;
    if(j%2===0){g.save();g.translate(xm,gy0+sg-2*s);g.rotate(.07*Math.sin(t*.025+j));g.drawImage(SP.la,-18*s,0,36*s,70*s);g.restore();
      g.globalAlpha=.45+.2*Math.sin(t*.1+j);g.drawImage(SP.gl,xm-40*s,gy0+sg+14*s,80*s,80*s);g.globalAlpha=1}
    else{L=34*s+10*s*Math.sin(t*.02+j);sx=xm;sy=gy0+sg+L;
      g.strokeStyle='rgba(230,230,240,.55)';g.lineWidth=1;g.beginPath();g.moveTo(sx,gy0+sg);g.lineTo(sx,sy);g.stroke();
      g.fillStyle='#120a1c';g.beginPath();g.ellipse(sx,sy+5*s,5*s,6*s,0,0,6.3);g.fill();g.beginPath();g.arc(sx,sy-1*s,3.4*s,0,6.3);g.fill();
      g.strokeStyle='#120a1c';g.lineWidth=Math.max(1,1.2*s);g.beginPath();
      for(b=-1;b<=1;b+=2){for(l=0;l<4;l++){g.moveTo(sx,sy+(2+l*2)*s);g.lineTo(sx+b*(8+l)*s,sy+(l*2-2+Math.sin(t*.1+l)*1.5)*s)}}g.stroke();
      g.fillStyle='#ff4040';g.fillRect(sx-2*s,sy-2*s,1.5*s,1.5*s);g.fillRect(sx+.5*s,sy-2*s,1.5*s,1.5*s)}}
  var cw=96*.62*s,ch=84*.62*s,cx=nx-100*s;
  g.globalAlpha=.4+.12*Math.sin(t*.1);g.drawImage(SP.g3,cx-60*s,y-ch-34*s,120*s,120*s);g.globalAlpha=1;
  g.drawImage(SP.cl,cx-cw/2,y-ch,cw,ch);
  for(b=0;b<5;b++){var ph=(t*.02+b*.2)%1;g.globalAlpha=(1-ph)*.85;g.fillStyle=b%2?'#c9ff7a':'#8fe05a';g.beginPath();g.arc(cx+(b-2)*7*s+Math.sin(t*.1+b)*3*s,y-ch*.7-ph*46*s,(2.5+b%3)*s*(1-ph*.4),0,6.3);g.fill()}
  g.globalAlpha=.8;
  for(j=0;j<12;j++){px=gw*((j*.1731+.07)%1)+Math.sin(t*.02+j)*28*s;py=((t*.55*(.6+(j%4)*.22)+j*97)%(y+30*s))-10*s;
    g.fillStyle=['#d9731a','#b4400f','#e8a33a'][j%3];g.beginPath();g.ellipse(px,py,5*s,2.6*s,t*.04+j,0,6.3);g.fill()}
  g.globalAlpha=1}
function drawAll(){
  sprites();var y=GY+14*s,t=fr,i,d,sp,k,w,h2,x,a;
  g.fillStyle='rgba(46,18,86,.24)';g.fillRect(0,0,W,y+400*s);
  trees(y);
  for(i=0;i<DEC.length;i++){d=DEC[i];sp=SP[d[0]==='p'?['p','q','r'][i%3]:d[0]];k=d[2]*s*(d[0]==='p'?.95:d[0]==='t'?.9:.8);w=sp.lw*k;h2=sp.lh*k;x=vw()*d[1]*s;
    if(d[0]==='p'){a=.5+.14*Math.sin(t*.12+i*1.7);g.globalAlpha=a;g.drawImage(SP.gl,x-w*.95,y-h2*.62-w*.7,w*1.9,w*1.9);g.globalAlpha=1}
    if(d[3]){g.save();g.translate(x,y);g.rotate(d[3]);g.drawImage(sp,-w/2,-h2,w,h2);g.restore()}else g.drawImage(sp,x-w/2,y-h2,w,h2);
    if(d[0]==='t')tombExtra(i,x,y,w,h2,t)}
  extras(y,t);
  var nx=npcX()*s,nk=.74*s,bob=Math.sin(t*.05)*3*s,nw=SP.n.lw*nk,nh=SP.n.lh*nk;
  g.globalAlpha=.55+.12*Math.sin(t*.1);g.drawImage(SP.gl,nx-nw*.9,y-nh*.5-nw*.55+bob,nw*1.8,nw*1.8);g.globalAlpha=1;
  g.drawImage(SP.n,nx-nw/2,y-nh+bob,nw,nh);
  g.save();g.textAlign='center';g.textBaseline='middle';var fs=Math.max(12,13*s);g.font='bold '+fs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
  var lb='🎃 Sứ Giả Halloween',tw=g.measureText(lb).width+18,th=fs+10,lx=nx-tw/2,ly=y-nh-6*s+bob-th;
  g.fillStyle='rgba(24,8,40,.82)';g.strokeStyle='#ff9a2e';g.lineWidth=1.5;g.beginPath();g.moveTo(lx+6,ly);g.lineTo(lx+tw-6,ly);g.quadraticCurveTo(lx+tw,ly,lx+tw,ly+6);g.lineTo(lx+tw,ly+th-6);g.quadraticCurveTo(lx+tw,ly+th,lx+tw-6,ly+th);g.lineTo(lx+6,ly+th);g.quadraticCurveTo(lx,ly+th,lx,ly+th-6);g.lineTo(lx,ly+6);g.quadraticCurveTo(lx,ly,lx+6,ly);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ffc247';g.fillText(lb,nx,ly+th/2+1);g.restore();
  var ww=vw();
  g.globalAlpha=.17;for(i=0;i<5;i++){x=((t*.2*(1+i*.25)+i*ww*s*.23)%(ww*s+500*s))-250*s;g.drawImage(SP.ms,x-260*s,y-70*s,520*s,150*s)}g.globalAlpha=1;
  for(i=0;i<3;i++){x=(ww*(.18+i*.3)+Math.sin(t*.012+i*2)*70)*s;a=y-(300+i*26)*s+Math.sin(t*.03+i*1.3)*14*s;g.globalAlpha=.5;g.drawImage(SP.gh,x-26*s,a-32*s,52*s,63*s);g.globalAlpha=1}
  for(i=0;i<18;i++){x=(ww*((i*.1371+.03)%1)+Math.sin(t*.011+i)*24)*s;a=y-(26+(i*47)%150)*s+Math.sin(t*.021+i*2)*10*s;g.globalAlpha=.45+.45*Math.sin(t*.06+i*1.9)*Math.sin(t*.06+i*1.9);g.drawImage(SP.fg,x-9*s,a-9*s,18*s,18*s)}
  g.globalAlpha=1}
/* Fix334: world/77 vẽ NGƯỜI CHƠI KHÁC bằng cách gọi drawEP() cho từng người → drawAll() bị gọi lặp (N+1 lần/khung) làm bí ngô/bộ xương/Sứ Giả xếp chồng. Chỉ vẽ 1 lần/khung, và chỉ ở lượt của nhân vật mình. */
var inVd=0,drew=0,ownP=null,_vd=vdraw;vdraw=function(){inVd=1;drew=0;ownP=(typeof P!=='undefined')?P:null;try{return _vd.apply(this,arguments)}finally{inVd=0}};
var _xb=(typeof xbg==='function')?xbg:null;
if(_xb)xbg=function(gy,m){var r=_xb.apply(this,arguments);try{if(m===-1&&inVd&&inVillage())sky(gy)}catch(e){}return r};
var _dep=(typeof drawEP==='function')?drawEP:null;
if(_dep)drawEP=function(){try{if(inVd&&!drew&&inVillage()&&(ownP===null||P===ownP)){drew=1;drawAll()}}catch(e){}return _dep.apply(this,arguments)};
var _vs=vstep;vstep=function(){_vs.apply(this,arguments);try{if(go){if(mvDir)go=0;else if(vt==null){go=0;if(Math.abs(P.x-cl(npcX(),40,vw()-40))<14)open()}}}catch(e){}};
c.addEventListener('pointerdown',function(e){
  go=0;if(on||!inVillage())return;
  var px=e.offsetX,py=e.offsetY,u=s,nx=npcX()*s;
  if(Math.abs(px-nx)<32*u&&py>GY-130*u&&py<GY+36*u){vt=cl(npcX(),40,vw()-40);vgo=-1;go=1;try{gateGo=0;twGoF=0}catch(x){}}});
var _st=step;step=function(){if(on&&(!active()||!vil))close();_st();try{bossTick()}catch(e){}};
try{var _ng=ng;ng=function(){close();PS.forEach(function(x){delete x.hw});_ng()}}catch(e){}

/* ---------- 👑 BOSS HALLOWEEN NGẪU NHIÊN (Fix394) ----------
 * Cứ 30 phút (giờ thật, tính theo nhân vật) có 1 Boss "Vua Bí Ngô" xuất hiện ngẫu nhiên ở bản đồ quái (mảng E: map thường + Linh Giới).
 * Chỉ xuất hiện khi người chơi đang đứng ở bản đồ quái (không phải làng/phụ bản/Tiên Giới/map treo); tới giờ mà chưa ở map quái thì chờ,
 * vào map quái là xuất hiện. Boss biến mất mà chưa bị hạ (đổi map) → xuất hiện lại sau ~3s, không tính vào chu kỳ 30 phút.
 * Hạ boss: +1 Bí Ngô Ma Quái (mở được ngay ở Sứ Giả), +5 Kẹo (mỗi viên tung ngẫu nhiên Ngọt/Dẻo/Thối theo CF.candyP, y như ghép kẹo). Chỉnh ở khối BO. Dữ liệu: PS[cur].hw.bn (mốc giờ xuất hiện kế tiếp). */
var BO={every:30*60e3,pump:1,candy:5,slot:4,hpMul:1.6,dfMul:1.15,retry:3000};
var bossImg=null,bossRef=null;
function bossSprite(){
  if(bossImg)return bossImg;
  var cv=document.createElement('canvas');cv.width=240;cv.height=356;var g=cv.getContext('2d'),i;g.translate(0,26);
  /* hào quang */
  var rg=g.createRadialGradient(120,150,10,120,150,120);rg.addColorStop(0,'rgba(255,154,46,.45)');rg.addColorStop(1,'rgba(255,154,46,0)');g.fillStyle=rg;g.fillRect(0,-26,240,356);
  /* lưỡi hái */
  g.strokeStyle='#4a3320';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(206,326);g.lineTo(196,60);g.stroke();
  g.fillStyle='#cfd6e6';g.beginPath();g.moveTo(196,58);g.quadraticCurveTo(150,26,112,64);g.quadraticCurveTo(152,48,194,74);g.closePath();g.fill();
  /* áo choàng */
  var cg=g.createLinearGradient(0,130,0,326);cg.addColorStop(0,'#3a1a5e');cg.addColorStop(1,'#12061c');g.fillStyle=cg;
  g.beginPath();g.moveTo(70,135);g.quadraticCurveTo(30,230,18,322);
  for(i=0;i<6;i++)g.lineTo(18+i*34+17,i%2?322:304);
  g.lineTo(222,322);g.quadraticCurveTo(210,230,170,135);g.closePath();g.fill();
  g.strokeStyle='#ff9a2e';g.lineWidth=2;g.stroke();
  /* tay vuốt */
  g.fillStyle='#2a1238';g.beginPath();g.ellipse(176,196,16,22,-.3,0,6.3);g.fill();
  g.fillStyle='#d9ffb0';for(i=0;i<3;i++){g.beginPath();g.moveTo(170+i*8,212);g.lineTo(172+i*8,230);g.lineTo(177+i*8,212);g.fill()}
  /* đầu bí ngô */
  var hg=g.createRadialGradient(112,92,8,120,100,86);hg.addColorStop(0,'#ffcf6a');hg.addColorStop(.55,'#ff8a1e');hg.addColorStop(1,'#b34a06');
  g.fillStyle=hg;g.strokeStyle='#5a2400';g.lineWidth=3;
  [-52,-26,0,26,52].forEach(function(o){g.beginPath();g.ellipse(120+o*.55,100,Math.abs(60-Math.abs(o)*.55),66,0,0,6.3);if(o===0){g.fill()}else{g.globalAlpha=.9;g.fill();g.globalAlpha=1}g.stroke()});
  g.beginPath();g.ellipse(120,100,60,66,0,0,6.3);g.fill();g.stroke();
  g.strokeStyle='rgba(90,36,0,.5)';g.lineWidth=2;[-32,-14,14,32].forEach(function(o){g.beginPath();g.ellipse(120+o*.6,100,Math.abs(54-Math.abs(o)*.8),64,0,-1.2,1.2);g.stroke()});
  /* cuống */
  g.fillStyle='#3d7a22';g.beginPath();g.moveTo(112,36);g.quadraticCurveTo(114,14,134,8);g.lineTo(138,18);g.quadraticCurveTo(124,24,126,38);g.closePath();g.fill();
  /* mắt + miệng phát sáng */
  g.shadowColor='#ffe45a';g.shadowBlur=16;g.fillStyle='#ffee66';
  g.beginPath();g.moveTo(80,86);g.lineTo(104,78);g.lineTo(98,106);g.closePath();g.fill();
  g.beginPath();g.moveTo(160,86);g.lineTo(136,78);g.lineTo(142,106);g.closePath();g.fill();
  g.beginPath();g.moveTo(86,124);g.quadraticCurveTo(120,160,154,124);
  for(i=0;i<5;i++)g.lineTo(148-i*14,i%2?126:138);g.closePath();g.fill();
  g.shadowBlur=0;g.fillStyle='#7a1a00';g.beginPath();g.arc(94,95,4,0,6.3);g.arc(146,95,4,0,6.3);g.fill();
  /* mũ phù thuỷ */
  g.fillStyle='#1c0b2c';g.strokeStyle='#ff9a2e';g.lineWidth=2;
  g.beginPath();g.ellipse(120,44,70,13,0,0,6.3);g.fill();g.stroke();
  g.beginPath();g.moveTo(84,42);g.quadraticCurveTo(110,-4,150,-6);g.quadraticCurveTo(138,20,156,42);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ff9a2e';g.fillRect(90,32,62,7);
  var im=new Image();im.src=cv.toDataURL('image/png');bossImg=im;return im}
function bossReady(){
  try{if(!MS.hwboss)MS.hwboss={n:'🎃 Vua Bí Ngô',h:210,f:1,hm:1,rg:110};MI.hwboss=bossSprite();return true}catch(e){return false}}
function inHuntMap(){
  try{return typeof vil!=='undefined'&&!vil&&started&&!(typeof over!=='undefined'&&over)&&!(typeof dg!=='undefined'&&dg)&&!busyMap()&&Array.isArray(E)&&!E.some(function(e){return e.dg})}catch(e){return false}}
function spawnBoss(){
  if(!bossReady())return false;
  var L=cl(P.lv+Math.floor(Math.random()*5)-2+3,LR[mapSel][0],LR[mapSel][1]),m=MS.hwboss,
    h=3*(60+L*25)*(1+mi()*.5)*m.hm*(8+mi()*1.5)*(typeof lg!=='undefined'&&lg?2.2:1)*cqM()*BO.hpMul,
    df=(8+L*2.2)*(1+mi()*.4)*1.8*(typeof lg!=='undefined'&&lg?1.35:1)*(1+(cqM()-1)/2)*BO.dfMul,
    sxx=P.x>vw()*.55?-80:vw()+80,sn=BO.slot;
  E=E.filter(function(e){return e.sn!==sn});
  var e={k:'hwboss',sn:sn,x:sxx,hp:h,max:h,df:df,b:3,m:mi(),lv:L,cd:30,sl:0,fl:0,in:6,hh:m.h,rg:m.rg,hwb:1};
  E.push(e);bossRef=e;
  try{SLT[sn]=540}catch(x){}
  DT.push({x:P.x,y:230,s:'🎃 Vua Bí Ngô Halloween xuất hiện!',c:'#ff9a2e',l:200});
  for(var j=0;j<14;j++)PT.push({x:sxx,y:30,vx:(Math.random()-.5)*3,vy:-Math.random()*3,l:30,c:'#ff9a2e'});
  return true}
function bossReward(e){
  var h=H(),x=e.x||P.x,i,got=[0,0,0],r,idx;
  h.gp+=BO.pump;                                           /* Bí Ngô Ma Quái (h.gp), KHÔNG phải Bí Ngô thường (h.pk) */
  for(i=0;i<BO.candy;i++){r=Math.random();idx=r<CF.candyP[0]?0:r<CF.candyP[0]+CF.candyP[1]?1:2;got[idx]++;h[CANDY[idx].k]++}
  DT.push({x:x,y:260,s:'👻 +'+BO.pump+' Bí Ngô Ma Quái',c:'#d9a8ff',g:1,l:190});
  DT.push({x:x,y:232,s:'🍬 +'+BO.candy+' Kẹo · '+CANDY.map(function(d,j){return got[j]?d.e+got[j]:''}).filter(Boolean).join(' '),c:'#ffd76a',g:1,l:190});
  save()}
function bossTick(){
  if(!active())return;
  var now=Date.now();
  if(bossRef){
    if(E.indexOf(bossRef)>=0)return;                       /* còn sống */
    if(bossRef.hp>0){bossRef=null;H().bn=now+BO.retry;save()}   /* biến mất mà chưa chết (đổi map) → xuất hiện lại sau ~3s, không tính vào chu kỳ 30 phút */
    else bossRef=null;
    return}
  if(!inHuntMap())return;
  var h=H();
  if(!h.bn||h.bn>now+BO.every)h.bn=now;                    /* lần đầu / đồng hồ lệch → xuất hiện ngay khi vào map quái */
  if(now<h.bn)return;
  if(spawnBoss()){h.bn=now+BO.every;save()}}
var _dropB=drop;
drop=function(e){
  var r=_dropB.apply(this,arguments);
  try{if(e&&e.hwb&&!e.hwd&&active()){e.hwd=1;bossReward(e)}}catch(x){try{console.error('[halloween-boss]',x)}catch(y){}}
  return r};

window.HALW={tab:setTab,on:active,cfg:CF,open:open,close:close,craft:craftCandy,ghost:craftGhost,eat:openCandy,openG:openGhost,claim:claimMs,claimAll:claimAll,ms:MSQ,data:H,boss:spawnBoss,bossCfg:BO};
})();
