/* ===== 🎃 SỰ KIỆN HALLOWEEN (world/99-su-kien-halloween.js, Fix261) =====
 * Thời gian: 18/10/2026 00:00 → hết 31/10/2026 (giờ VN, UTC+7). Hết hạn: trang trí + Sứ Giả Halloween tự biến mất, ngừng rơi đồ. Chỉnh ở CF.start / CF.end.
 * - Làng Tân Thủ: bí ngô + bộ xương Halloween (vẽ bằng canvas) và NPC 🎃 Sứ Giả Halloween (chạm → tự đi tới → mở bảng).
 * - Rơi: mọi quái thường/Tinh Anh: mỗi loại Đường / Bột Mì / Mạch Nha 5% (tung độc lập, rơi 1). Mọi Boss: 5% rơi 1 Bí Ngô.
 * - Ghép kẹo: 5 Đường + 5 Bột Mì + 5 Mạch Nha + 2 Linh Thạch + 50.000 vàng → Kẹo Ngọt 10% / Kẹo Dẻo 20% / Kẹo Thối 70%.
 * - Ghép Bí Ngô Ma Quái: 20 Bí Ngô + 20 Linh Thạch + 5.000.000 vàng. Mở ra quà ngẫu nhiên (bảng RW_GHOST).
 * - Linh Thạch nhận từ sự kiện là KHOÁ (LT.earnKS: không trần ngày). Cần đăng nhập ☁ để ghép / mở (vì có Linh Thạch).
 * - Mảnh Cánh Cấp 4: game chưa có cánh cấp 4 → chỉ cộng vào bộ đếm hw.wf4 (hiện trong bảng), nối vào hệ thống cánh sau.
 * Dữ liệu theo nhân vật: PS[cur].hw = {sg,fl,ml,pk,gp,c1,c2,c3,wf4}. Chỉnh tỉ lệ/phần thưởng: khối CF, RW_*.
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
var MATS=[{k:'sg',n:'Đường',e:'🍚'},{k:'fl',n:'Bột Mì',e:'🌾'},{k:'ml',n:'Mạch Nha',e:'🍯'}];

function active(){var t=Date.now();return t>=CF.start&&t<CF.end}
function H(){var p=PS[cur];if(!p)return{sg:0,fl:0,ml:0,pk:0,gp:0,c1:0,c2:0,c3:0,wf4:0};
  if(!p.hw)p.hw={sg:0,fl:0,ml:0,pk:0,gp:0,c1:0,c2:0,c3:0,wf4:0};
  ['sg','fl','ml','pk','gp','c1','c2','c3','wf4'].forEach(function(k){if(p.hw[k]==null)p.hw[k]=0});return p.hw}
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
    case'wf4':H().wf4+=v;return'🪽 Mảnh Cánh Cấp 4 ×'+v+' (chờ cập nhật)'}
  return''}
function needLogin(){if(!logged()||!window.LT||!LT.spend){msg('☁ Cần đăng nhập để dùng chức năng có Linh Thạch.');return true}return false}

var el=null,mg='',busy=false,go=0,on=false;
function msg(t){mg=t;if(on)render()}

function openCandy(i,all){
  var h=H(),d=CANDY[i],n=all?h[d.k]:Math.min(1,h[d.k]);
  if(n<=0){msg('Không có '+d.n);return}
  if(needLogin())return;
  var tot={},exp=0,j,lines=[];
  h[d.k]-=n;
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
    h.pk-=CF.needPump;gold-=CF.ghostGold;h.gp++;save();
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
  el.innerHTML=o}
function mk(){
  if(el)return;
  el=document.createElement('div');el.id='hwp';
  el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,400px);max-height:86vh;overflow:auto;background:#1a0b24f2;color:#f3e6ff;border:2px solid #ff9a2e;border-radius:10px;padding:10px;z-index:99999;display:none;font-family:KTH Serif,Songti SC,STKaiti,KaiTi,serif';
  ['pointerdown','touchstart','keydown','keyup','keypress','click'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})});
  document.body.appendChild(el)}
function open(){if(!active()||!started||on)return;mk();on=true;mg='';vt=null;vgo=-1;render();el.style.display='block'}
function close(){on=false;if(el)el.style.display='none'}

/* ---------- vẽ: bí ngô, bộ xương, NPC ---------- */
var SP={};
function spr(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c}
function pumpkinFace(q,cx,cy,k){q.fillStyle='#ffd23f';q.beginPath();q.moveTo(cx-18*k,cy-6*k);q.lineTo(cx-8*k,cy-6*k);q.lineTo(cx-13*k,cy-16*k);q.fill();q.beginPath();q.moveTo(cx+18*k,cy-6*k);q.lineTo(cx+8*k,cy-6*k);q.lineTo(cx+13*k,cy-16*k);q.fill();
  q.beginPath();q.moveTo(cx-16*k,cy+4*k);q.lineTo(cx-8*k,cy+12*k);q.lineTo(cx-3*k,cy+6*k);q.lineTo(cx+3*k,cy+12*k);q.lineTo(cx+8*k,cy+6*k);q.lineTo(cx+16*k,cy+4*k);q.lineTo(cx+10*k,cy+18*k);q.lineTo(cx-10*k,cy+18*k);q.fill()}
function mkPumpkin(){return spr(80,70,function(q){
  var g2=q.createRadialGradient(40,38,6,40,40,38);g2.addColorStop(0,'#ffb347');g2.addColorStop(1,'#d9600f');
  q.fillStyle='#8a3b08';q.beginPath();q.ellipse(40,40,38,28,0,0,6.3);q.fill();
  q.fillStyle=g2;[-20,0,20].forEach(function(dx){q.beginPath();q.ellipse(40+dx,40,18,27,0,0,6.3);q.fill()});
  q.fillStyle='#3d6b1e';q.fillRect(36,6,8,12);q.fillStyle='#2a4d12';q.fillRect(40,6,4,12);
  pumpkinFace(q,40,40,1)})}
function mkSkeleton(wave){return spr(70,130,function(q){
  q.strokeStyle='#ece6d2';q.fillStyle='#ece6d2';q.lineWidth=4;q.lineCap='round';
  q.beginPath();q.arc(35,20,15,0,6.3);q.fill();q.fillRect(26,28,18,10);
  q.fillStyle='#1b0f24';q.beginPath();q.arc(29,19,4,0,6.3);q.arc(41,19,4,0,6.3);q.fill();q.beginPath();q.moveTo(35,23);q.lineTo(32,29);q.lineTo(38,29);q.fill();
  q.strokeStyle='#1b0f24';q.lineWidth=1.5;for(var i=0;i<4;i++){q.beginPath();q.moveTo(28+i*4.5,33);q.lineTo(28+i*4.5,38);q.stroke()}
  q.strokeStyle='#ece6d2';q.lineWidth=4;
  q.beginPath();q.moveTo(35,38);q.lineTo(35,82);q.stroke();
  q.lineWidth=3;for(i=0;i<4;i++){q.beginPath();q.moveTo(35,46+i*8);q.quadraticCurveTo(22,44+i*8,20,48+i*8);q.moveTo(35,46+i*8);q.quadraticCurveTo(48,44+i*8,50,48+i*8);q.stroke()}
  q.lineWidth=4;q.beginPath();q.moveTo(35,44);q.lineTo(18,66);q.lineTo(14,86);q.stroke();
  q.beginPath();q.moveTo(35,44);q.lineTo(wave?58:52,wave?22:66);q.lineTo(wave?64:56,wave?8:86);q.stroke();
  q.beginPath();q.moveTo(35,82);q.lineTo(24,102);q.lineTo(22,126);q.moveTo(35,82);q.lineTo(46,102);q.lineTo(48,126);q.stroke();
  q.beginPath();q.moveTo(24,84);q.lineTo(46,84);q.stroke()})}
function mkNpc(){return spr(120,170,function(q){
  q.fillStyle='#3a1458';q.beginPath();q.moveTo(60,60);q.lineTo(100,165);q.lineTo(20,165);q.fill();
  q.fillStyle='#5a2a82';q.beginPath();q.moveTo(60,60);q.lineTo(78,165);q.lineTo(42,165);q.fill();
  q.fillStyle='#ff9a2e';q.beginPath();q.ellipse(60,58,26,22,0,0,6.3);q.fill();
  q.fillStyle='#3d6b1e';q.fillRect(56,32,8,8);
  pumpkinFace(q,60,58,.7);
  q.fillStyle='#1b0f24';q.beginPath();q.moveTo(28,42);q.lineTo(92,42);q.lineTo(80,34);q.lineTo(68,6);q.lineTo(52,6);q.lineTo(40,34);q.closePath();q.fill();
  q.fillStyle='#ff9a2e';q.fillRect(50,28,20,6);
  q.fillStyle='#ff7ac8';q.beginPath();q.arc(96,100,8,0,6.3);q.fill();q.fillStyle='#fff';q.fillRect(94,106,4,16)})}
function sprites(){if(SP.p)return;SP.p=mkPumpkin();SP.s1=mkSkeleton(0);SP.s2=mkSkeleton(1);SP.n=mkNpc()}
var DEC=[[.05,'p',.7],[.09,'s2',1],[.2,'p',.55],[.26,'p',.8],[.37,'s1',.95],[.45,'p',.6],[.55,'p',.75],[.64,'p',.5],[.72,'s1',1],[.76,'p',.8],[.83,'p',.6],[.9,'s2',.95],[.95,'p',.7]];
function busyMap(){return (window.LCT&&LCT.on())||(typeof FM!=='undefined'&&FM.isOn())||(typeof MN!=='undefined'&&MN.isOn())}
function inVillage(){return typeof vil!=='undefined'&&vil&&started&&!bo&&active()&&!busyMap()&&(!window.VWD||!VWD.plain||VWD.plain())}
function npcX(){return vw()*CF.npcX}
function drawAll(){
  sprites();var y=GY+14*s,i,d,sp,k,w,h2;
  for(i=0;i<DEC.length;i++){d=DEC[i];sp=SP[d[1]];k=d[2]*s*(d[1]==='p'?.9:.85);w=sp.width*k;h2=sp.height*k;g.drawImage(sp,vw()*d[0]*s-w/2,y-h2,w,h2)}
  var nx=npcX()*s,nk=.72*s,bob=Math.sin(fr*.05)*2*s;
  g.drawImage(SP.n,nx-60*nk,y-170*nk+bob,120*nk,170*nk);
  g.save();g.textAlign='center';g.font='bold '+Math.max(12,13*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
  g.fillStyle='#000a';var tw=g.measureText('🎃 Sứ Giả Halloween').width;g.fillRect(nx-tw/2-8,y-170*nk-22*s,tw+16,20*Math.max(.8,s));
  g.fillStyle='#ffb347';g.fillText('🎃 Sứ Giả Halloween',nx,y-170*nk-7*s);g.restore()}
var _vd=vdraw;vdraw=function(){_vd.apply(this,arguments);try{if(!on&&inVillage())drawAll()}catch(e){}};
var _vs=vstep;vstep=function(){_vs.apply(this,arguments);try{if(go){if(mvDir)go=0;else if(vt==null){go=0;if(Math.abs(P.x-cl(npcX(),40,vw()-40))<14)open()}}}catch(e){}};
c.addEventListener('pointerdown',function(e){
  go=0;if(on||!inVillage()||(window.HUDX&&HUDX.on))return;
  var px=e.offsetX,py=e.offsetY,u=s,nx=npcX()*s;
  if(Math.abs(px-nx)<32*u&&py>GY-130*u&&py<GY+36*u){vt=cl(npcX(),40,vw()-40);vgo=-1;go=1;try{gateGo=0;twGoF=0}catch(x){}}});
var _st=step;step=function(){if(on&&(!active()||!vil))close();_st()};
try{var _ng=ng;ng=function(){close();PS.forEach(function(x){delete x.hw});_ng()}}catch(e){}

window.HALW={on:active,cfg:CF,open:open,close:close,craft:craftCandy,ghost:craftGhost,eat:openCandy,openG:openGhost,data:H};
})();
