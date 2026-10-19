/* ===== 🎃 SỰ KIỆN HALLOWEEN (world/99-su-kien-halloween.js, Fix261) =====
 * Thời gian: 18/10/2026 00:00 → hết 31/10/2026 (giờ VN, UTC+7). Hết hạn: trang trí + Sứ Giả Halloween tự biến mất, ngừng rơi đồ. Chỉnh ở CF.start / CF.end.
 * - Làng Tân Thủ: bí ngô + bộ xương Halloween (vẽ bằng canvas) và NPC 🎃 Sứ Giả Halloween (chạm → tự đi tới → mở bảng).
 * - Rơi: mọi quái thường/Tinh Anh: mỗi loại Đường / Bột Mì / Mạch Nha 5% (tung độc lập, rơi 1). Mọi Boss: 5% rơi 1 Bí Ngô.
 * - Ghép kẹo: 5 Đường + 5 Bột Mì + 5 Mạch Nha + 2 Linh Thạch + 50.000 vàng → Kẹo Ngọt 10% / Kẹo Dẻo 20% / Kẹo Thối 70%.
 * - Ghép Bí Ngô Ma Quái: 20 Bí Ngô + 20 Linh Thạch + 5.000.000 vàng. Mở ra quà ngẫu nhiên (bảng RW_GHOST).
 * - Linh Thạch nhận từ sự kiện là KHOÁ (LT.earnKS: không trần ngày). Cần đăng nhập ☁ để ghép / mở (vì có Linh Thạch).
 * - Mảnh Cánh Cấp 4: game chưa có cánh cấp 4 → chỉ cộng vào bộ đếm hw.wf4 (hiện trong bảng), nối vào hệ thống cánh sau.
 * Móc quà (Fix320): đếm tích luỹ đã dùng PS[cur].hw.u1/u2/u3 (mở Kẹo Ngọt/Dẻo/Thối) + upk (Bí Ngô đã dùng ghép); cờ đã nhận hw.cl. Bảng MS: mốc 100/500.
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
var MS=[
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
      if(isBoss(e)){if(Math.random()<CF.pumpRate){h.pk++;DT.push({x:x,y:250,s:'🎃 +1 Bí Ngô',c:'#ff9a2e',g:1,l:170});save()}}
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
  var d=MS[di],r=d&&d.m[mi];if(!r)return;
  var h=H(),key=msKey(d,mi);
  if(h.cl[key]){msg('Mốc này đã nhận rồi.');return}
  if(h[d.k]<r[0]){msg('Chưa đủ mốc: '+d.n+' '+h[d.k]+'/'+r[0]+'.');return}
  if(r[1]==='lt'&&needLogin())return;
  h.cl[key]=1;
  var t=msText(r);save();
  msg('🎁 Móc quà '+d.e+' '+d.n+' ('+r[0]+'): '+t);say('🎁 Móc quà '+d.n+' '+r[0]+' · '+t,d.c)}
function claimAll(){
  var h=H(),n=0,out=[],hasLt=false,di,mi;
  for(di=0;di<MS.length;di++)for(mi=0;mi<MS[di].m.length;mi++){var r=MS[di].m[mi];if(!h.cl[msKey(MS[di],mi)]&&h[MS[di].k]>=r[0]&&r[1]==='lt')hasLt=true}
  if(hasLt&&needLogin())return;
  for(di=0;di<MS.length;di++)for(mi=0;mi<MS[di].m.length;mi++){
    var d=MS[di],rr=d.m[mi],key=msKey(d,mi);
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

async function craftCandy(){
  if(busy)return;var h=H();
  if(h.sg<CF.needMat||h.fl<CF.needMat||h.ml<CF.needMat){msg('Thiếu nguyên liệu (cần '+CF.needMat+' mỗi loại).');return}
  if(gold<CF.craftGold){msg('Thiếu vàng (cần '+nf(CF.craftGold)+').');return}
  if(needLogin())return;
  busy=true;
  try{
    var r=await LT.spend(CF.craftLT,'halloween-keo');
    if(!r||!r.ok){msg(r&&r.err==='poor'?'Thiếu Linh Thạch (cần '+CF.craftLT+').':'Không trừ được Linh Thạch, thử lại.');busy=false;return}
    h=H();
    if(h.sg<CF.needMat||h.fl<CF.needMat||h.ml<CF.needMat||gold<CF.craftGold){msg('Nguyên liệu/vàng đã thay đổi, thử lại.');busy=false;return}
    h.sg-=CF.needMat;h.fl-=CF.needMat;h.ml-=CF.needMat;gold-=CF.craftGold;
    var rn=Math.random(),i=rn<CF.candyP[0]?0:rn<CF.candyP[0]+CF.candyP[1]?1:2;
    h[CANDY[i].k]++;save();
    msg('Ghép thành công! Nhận '+CANDY[i].e+' '+CANDY[i].n+' (đã trừ '+CF.craftLT+' Linh Thạch + '+nf(CF.craftGold)+' vàng).');
    say(CANDY[i].e+' Ghép được '+CANDY[i].n+'!',CANDY[i].c)
  }catch(e){msg('Lỗi mạng, thử lại.')}
  busy=false;if(on)render()}

async function craftGhost(){
  if(busy)return;var h=H();
  if(h.pk<CF.needPump){msg('Thiếu Bí Ngô (cần '+CF.needPump+').');return}
  if(gold<CF.ghostGold){msg('Thiếu vàng (cần '+nf(CF.ghostGold)+').');return}
  if(needLogin())return;
  busy=true;
  try{
    var r=await LT.spend(CF.ghostLT,'halloween-bi-ngo');
    if(!r||!r.ok){msg(r&&r.err==='poor'?'Thiếu Linh Thạch (cần '+CF.ghostLT+').':'Không trừ được Linh Thạch, thử lại.');busy=false;return}
    h=H();
    if(h.pk<CF.needPump||gold<CF.ghostGold){msg('Bí Ngô/vàng đã thay đổi, thử lại.');busy=false;return}
    h.pk-=CF.needPump;h.upk+=CF.needPump;gold-=CF.ghostGold;h.gp++;save();
    msg('👻 Ghép thành công 1 Bí Ngô Ma Quái!');say('👻 Bí Ngô Ma Quái!','#d9a8ff')
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
function render(){
  if(!el)return;var h=H(),o='';
  o+='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px;color:#ffb347">🎃 Sứ Giả Halloween</b><button onclick="HALW.close()" style="padding:2px 10px">✕</button></div>';
  o+='<div style="font-size:11px;opacity:.8;margin:2px 0 6px">Sự kiện còn '+daysLeft()+' ngày (đến hết 31/10). Linh Thạch từ sự kiện là 🔒 khoá.</div>';
  if(mg)o+='<div style="background:#2a1236;border:1px solid #ff9a2e;border-radius:6px;padding:6px;margin:4px 0;font-size:12px;color:#ffe9a0">'+mg+'</div>';
  o+='<div style="margin:6px 0"><b>① Làm kẹo</b><div style="font-size:12px">'+MATS.map(function(m){return m.e+' '+m.n+': <b style="color:'+(h[m.k]>=CF.needMat?'#7fe08a':'#ff7a7a')+'">'+h[m.k]+'</b>/'+CF.needMat}).join(' · ')+'</div>'
   +'<div style="font-size:11px;opacity:.8">+ '+CF.craftLT+' 💎 Linh Thạch + '+nf(CF.craftGold)+' vàng · ra: 🍭 Ngọt 10% · 🍬 Dẻo 20% · 🤢 Thối 70%</div>'
   +'<button onclick="HALW.craft()" style="width:100%;margin-top:4px;padding:6px">🍬 Ghép kẹo</button></div>';
  o+='<div style="margin:6px 0"><b>② Kẹo đang có</b>'+CANDY.map(function(d,i){return '<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:3px"><span style="flex:1;color:'+d.c+'">'+d.e+' '+d.n+' ×'+h[d.k]+'</span><button onclick="HALW.eat('+i+',0)">Mở 1</button><button onclick="HALW.eat('+i+',1)">Mở hết</button></div>'}).join('')+'</div>';
  o+='<div style="margin:6px 0"><b>③ Bí ngô</b><div style="font-size:12px">🎃 Bí Ngô: <b style="color:'+(h.pk>=CF.needPump?'#7fe08a':'#ff7a7a')+'">'+h.pk+'</b>/'+CF.needPump+' (Boss rơi 5%)</div>'
   +'<div style="font-size:11px;opacity:.8">+ '+CF.ghostLT+' 💎 Linh Thạch + '+nf(CF.ghostGold)+' vàng → 👻 Bí Ngô Ma Quái</div>'
   +'<button onclick="HALW.ghost()" style="width:100%;margin-top:4px;padding:6px">👻 Ghép Bí Ngô Ma Quái</button>'
   +'<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:4px"><span style="flex:1;color:#d9a8ff">👻 Bí Ngô Ma Quái ×'+h.gp+'</span><button onclick="HALW.openG(0)">Mở 1</button><button onclick="HALW.openG(1)">Mở hết</button></div>'
   +(h.wf4?'<div style="font-size:12px;margin-top:4px">🪽 Mảnh Cánh Cấp 4: <b>'+h.wf4+'</b> (chờ cập nhật)</div>':'')+'</div>';
  o+='<div style="margin:8px 0;border-top:1px dashed #ff9a2e88;padding-top:6px"><b>④ 🎁 Móc quà sự kiện</b><div style="font-size:11px;opacity:.8">Tính theo số lượng ĐÃ DÙNG (mở kẹo / Bí Ngô đã dùng để ghép). Linh Thạch là 🔒 khoá.</div>';
  MS.forEach(function(d,di){
    o+='<div style="margin-top:5px;font-size:12px"><span style="color:'+d.c+'">'+d.e+' '+d.n+' đã dùng: <b>'+h[d.k]+'</b></span>';
    d.m.forEach(function(r,mi){
      var got=!!h.cl[msKey(d,mi)],ok=h[d.k]>=r[0],rt=r[1]==='lt'?'🔒 '+nf(r[2])+' Linh Thạch khoá':r[1]==='sh'?'💠 '+r[2]+' Mảnh Thánh':'🔮 Ngọc Định Hồn ×'+r[2];
      o+='<div style="display:flex;align-items:center;gap:6px;margin-top:2px"><span style="flex:1;opacity:'+(got?.55:1)+'">'+r[0]+' → '+rt+' <span style="opacity:.7">('+Math.min(h[d.k],r[0])+'/'+r[0]+')</span></span>'
        +(got?'<button disabled style="padding:2px 8px">✔ Đã nhận</button>':'<button '+(ok?'':'disabled ')+'onclick="HALW.claim('+di+','+mi+')" style="padding:2px 8px">Nhận</button>')+'</div>'});
    o+='</div>'});
  o+='<button onclick="HALW.claimAll()" style="width:100%;margin-top:6px;padding:6px">🎁 Nhận tất cả móc quà đủ điều kiện</button></div>';
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
function carve(q,cx,cy,k){
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
function mkPumpkin(){return spr(100,90,function(q){
  q.fillStyle='rgba(0,0,0,.4)';q.beginPath();q.ellipse(50,84,40,6,0,0,6.3);q.fill();
  pumpBody(q,50,52,42,32);
  q.fillStyle='#4a7a22';q.beginPath();q.moveTo(44,22);q.quadraticCurveTo(46,8,56,6);q.lineTo(58,12);q.quadraticCurveTo(52,14,53,22);q.closePath();q.fill();
  q.strokeStyle='#6fa83a';q.lineWidth=2;q.beginPath();q.moveTo(57,10);q.quadraticCurveTo(70,4,68,14);q.quadraticCurveTo(66,18,62,14);q.stroke();
  carve(q,50,52,1)})}
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
function sprites(){if(SP.p)return;
  SP.p=mkPumpkin();SP.k0=mkSkeleton(0,0);SP.k1=mkSkeleton(1,1);SP.t=mkTomb();SP.gh=mkGhost();SP.n=mkNpc();
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
function drawAll(){
  sprites();var y=GY+14*s,t=fr,i,d,sp,k,w,h2,x,a;
  g.fillStyle='rgba(46,18,86,.24)';g.fillRect(0,0,W,y+400*s);
  for(i=0;i<DEC.length;i++){d=DEC[i];sp=SP[d[0]];k=d[2]*s*(d[0]==='p'?.95:d[0]==='t'?.9:.8);w=sp.lw*k;h2=sp.lh*k;x=vw()*d[1]*s;
    if(d[0]==='p'){a=.5+.14*Math.sin(t*.12+i*1.7);g.globalAlpha=a;g.drawImage(SP.gl,x-w*.95,y-h2*.62-w*.7,w*1.9,w*1.9);g.globalAlpha=1}
    if(d[3]){g.save();g.translate(x,y);g.rotate(d[3]);g.drawImage(sp,-w/2,-h2,w,h2);g.restore()}else g.drawImage(sp,x-w/2,y-h2,w,h2)}
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
var _st=step;step=function(){if(on&&(!active()||!vil))close();_st()};
try{var _ng=ng;ng=function(){close();PS.forEach(function(x){delete x.hw});_ng()}}catch(e){}

window.HALW={on:active,cfg:CF,open:open,close:close,craft:craftCandy,ghost:craftGhost,eat:openCandy,openG:openGhost,claim:claimMs,claimAll:claimAll,ms:MS,data:H};
})();
