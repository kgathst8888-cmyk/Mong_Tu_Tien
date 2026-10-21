/* ===== 🔥 NHÀ TINH LUYỆN · LUYỆN THÁNH KHÍ (world/130-nha-tinh-luyen-thanh-khi.js) — Fix394 — nạp SAU world/102 (Làng Tân Thủ 3) và ui/105 (Túi nguyên liệu) =====
 * Nhà Số 5 ở Làng Tân Thủ 3 (TT3.houses[4], trước là "Tạm khoá") → thành NHÀ TINH LUYỆN. Hiện có 1 tính năng: ⚒ LUYỆN THÁNH KHÍ (tính năng khác cập nhật sau).
 *   • Bấm tính năng → bảng 4 Ô DUNG HỢP. Mỗi ô 1 loại NGUYÊN LIỆU CHÍNH, cần ×100 mỗi loại (CF.qty). Mỗi lần GHÉP chỉ ra ×1:
 *       ✦ Thánh Tinh Nguyên   ×1 = Huyền Kim 10.000 + Quặng Sắt 10.000                 (khai khoáng)
 *       🔥 Thần Hoả Tinh Phách ×1 = Nghiệp Hoả 10 + Đá Thành Thiết 1.000
 *       🐉 Long Hồn Thần Lân   ×1 = Long Hồn 100 + Vảy Rồng 10.000
 *       📜 Thiên Đạo Phù Văn   ×1 = Thần Văn 100 + Tảo Địa Tinh 10.000
 *     Mỗi lần GHÉP ×1 nguyên liệu chính tốn 💰 1.000.000 vàng (CF.fuseGold) — nút Ghép 1 / Ghép 10 / Ghép tối đa (≤100/lần).
 *   • Dung hợp Thánh Khí: đặt đủ 4 loại (mỗi loại ×100) vào 4 ô → trừ 100 mỗi loại, tốn 💎 2.000 Linh Thạch + 💰 500.000.000 vàng → ra 1 trong 4 món Thánh Khí (ngẫu nhiên).
 *     4 món Thánh Khí: Kiếm · Cung · Khiên · Trượng (chọn/nâng cấp ở world/131) — CF.items.
 *   • Nguồn rơi (nguyên liệu thô):
 *       Nghiệp Hoả      : Boss Phụ Bản 1 · Hầm Ngục, 50% rơi 1 viên           (CF.nghiep)
 *       Long Hồn        : Boss Phụ Bản 2 · Địa Long Điện, ngẫu nhiên 1–5       (CF.longhon)
 *       Thần Văn        : Boss Phụ Bản Ma Thần (dg.pm), ngẫu nhiên 1–10        (CF.thanvan)
 *       Đá Thành Thiết · Vảy Rồng · Tảo Địa Tinh : quái thường (không phải boss) rơi 1 viên/lần hạ (CF.mob.* = tỉ lệ)
 *       Huyền Kim · Quặng Sắt : khai khoáng (có sẵn, MN.get().hk / .fe)
 *   • Dữ liệu: nguyên liệu THÔ nằm trong save: PS[cur].tl = {nh,dt,lh,vr,tv,td} (+ quặng MN.get().fe/hk).
 *     GÓI nguyên liệu chính + THÁNH KHÍ nằm trên MÁY CHỦ (bảng tk_user) → cần chạy thanh_khi.sql 1 lần trong Supabase; không sửa save để có được.
 *     RPC: tk_me · tk_make(kind) · tk_fuse(). Vàng/Linh Thạch/nguyên liệu thô trừ ở máy khách trước, lỗi thì hoàn.
 *   • Nguyên liệu hiện trong Túi 7 ⚗ (ui/105, mục "Thánh Khí") qua NLB.add — không có NLB thì chỉ mất phần hiển thị túi.
 *   • Đổi số: CF. Gỡ <script> thì nhà về "Tạm khoá" (dữ liệu trong save vẫn giữ).
 * Móc: TT3.houses[4] (nhãn + open) · drop (bọc, gọi bản gốc trước) · NLB.add. Có try/catch.
 * Phụ thuộc: PS/cur · gold · MN · LT · KCL · sv · DT. API: TKL.open() · TKL.close() · TKL.cfg · TKL.get() */
(function(){
'use strict';
if(window.TKL||typeof PS==='undefined'||typeof document==='undefined')return;

var COL='#ffb36a',FONT='system-ui,sans-serif';
var CF=window.TKL_CF={
  qty:100,                          /* số lượng MỖI nguyên liệu chính cần để dung hợp 1 Thánh Khí — khớp thanh_khi.sql (tk_fuse) */
  fuseGold:1000000,                 /* mỗi lần ghép 1 nguyên liệu chính */
  forgeGold:500000000,forgeLt:2000, /* dung hợp 1 Thánh Khí */
  nghiep:{rate:.5,min:1,max:1},     /* Boss Hầm Ngục: 50% rơi 1 */
  longhon:{rate:1,min:1,max:5},     /* Boss Địa Long Điện */
  thanvan:{rate:1,min:1,max:10},    /* Boss Phụ Bản Ma Thần */
  mob:{dt:1,vr:1,td:1},             /* quái thường: tỉ lệ rơi 1 viên mỗi lần hạ */
  raw:{
    nh:{e:'🔥',n:'Nghiệp Hoả',c:'#ff8a4a'},
    dt:{e:'🪨',n:'Đá Thành Thiết',c:'#b8b8c8'},
    lh:{e:'🐲',n:'Long Hồn',c:'#7dffc0'},
    vr:{e:'🐉',n:'Vảy Rồng',c:'#5ad08a'},
    tv:{e:'📖',n:'Thần Văn',c:'#d0a0ff'},
    td:{e:'🌿',n:'Tảo Địa Tinh',c:'#9fd070'},
    fe:{e:'🔩',n:'Quặng Sắt',c:'#c8c8d0'},
    hk:{e:'🌑',n:'Huyền Kim',c:'#9a8ac8'}},
  mats:[
    {id:'tinh',e:'✦',n:'Thánh Tinh Nguyên',c:'#ffe27a',need:{hk:10000,fe:10000}},
    {id:'hoa', e:'🔥',n:'Thần Hoả Tinh Phách',c:'#ff8a4a',need:{nh:10,dt:1000}},
    {id:'long',e:'🐉',n:'Long Hồn Thần Lân',c:'#7dffc0',need:{lh:100,vr:10000}},
    {id:'van', e:'📜',n:'Thiên Đạo Phù Văn',c:'#d0a0ff',need:{tv:100,td:10000}}],
  items:[ /* 4 món Thánh Khí (Fix395: chọn/nâng cấp ở ô ✨ Thánh Khí trong Túi — world/131; thứ tự khớp cột k1..k4 của tk_user) */
    {e:'⚔️',n:'Thánh Kiếm',c:'#ffd27a'},{e:'🏹',n:'Thánh Cung',c:'#ffe27a'},
    {e:'🛡️',n:'Thánh Khiên',c:'#ffcf6a'},{e:'🪄',n:'Thánh Trượng (Gậy phép)',c:'#ffd98a'}]
};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function say(s,c,y){try{DT.push({x:P.x,y:y||200,s:s,c:c||COL,l:150,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function G(){try{return typeof gold==='number'?gold:0}catch(e){return 0}}
function addG(n){try{gold+=n}catch(e){}}
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch'}

/* ---------- dữ liệu ---------- */
function D(){
  var p=PS[cur];if(!p)return null;
  var t=p.tl;if(!t||typeof t!=='object')t=p.tl={};
  ['nh','dt','lh','vr','tv','td'].forEach(function(k){t[k]=t[k]|0});
  return t}
/* ---------- kho trên máy chủ (gói + Thánh Khí) ---------- */
var ME=null;
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function errTx(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Nhà Tinh Luyện chưa kích hoạt trên máy chủ (cần chạy thanh_khi.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='poor'?'Máy chủ báo không đủ nguyên liệu chính':s==='bad'?'Yêu cầu không hợp lệ':'Không thực hiện được'}
function okMe(){return !!(ME&&ME.status==='ok')}
function PK(i){return okMe()?(ME.p[i]|0):0}
function KK(i){return okMe()?(ME.k[i]|0):0}
function setMe(r){if(r&&r.status==='ok'&&r.p&&r.k)ME=r}
function fetchMe(){return rpc('tk_me').then(function(m){if(m&&m.status==='ok')ME=m;else if(!okMe())ME=m;return m})}
function ore(k){try{return MN.get()[k]|0}catch(e){return 0}}
function have(k){return (k==='fe'||k==='hk')?ore(k):(D()?D()[k]|0:0)}
function take(k,n){
  if(k==='fe'||k==='hk'){var S=MN.get();S[k]=Math.max(0,(S[k]|0)-n)}
  else{var d=D();d[k]=Math.max(0,(d[k]|0)-n)}}
function maxMake(m){var n=1e9;for(var k in m.need)n=Math.min(n,Math.floor(have(k)/m.need[k]));n=Math.min(n,Math.floor(G()/CF.fuseGold),CF.qty);return Math.max(0,n)}
function canMake(m){for(var k in m.need)if(have(k)<m.need[k])return false;return true}

/* ---------- rơi nguyên liệu ---------- */
function rint(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function plainDg(){
  try{return !!dg&&!(dg.d2||dg.mt||dg.tw||dg.ks||dg.am||dg.td||dg.pv||dg.pm||dg.bi||dg.tb||dg.tng||dg.wb)}catch(e){return false}}
function roll(e){
  if(!e)return;
  var d=D();if(!d)return;
  var boss=e.k==='boss';
  if(boss){
    if(e.d2){                                                 /* Địa Long Điện */
      if(Math.random()<CF.longhon.rate){var a=rint(CF.longhon.min,CF.longhon.max);d.lh+=a;
        DT.push({x:e.x,y:300,s:CF.raw.lh.e+' +'+a+' '+CF.raw.lh.n,c:CF.raw.lh.c,l:190,g:1});sav()}
    }else if(e.mt&&dg&&dg.pm){                                /* Phụ Bản Ma Thần */
      if(Math.random()<CF.thanvan.rate){var b=rint(CF.thanvan.min,CF.thanvan.max);d.tv+=b;
        DT.push({x:e.x,y:300,s:CF.raw.tv.e+' +'+b+' '+CF.raw.tv.n,c:CF.raw.tv.c,l:190,g:1});sav()}
    }else if(e.dg&&plainDg()){                                /* Hầm Ngục */
      if(Math.random()<CF.nghiep.rate){var c=rint(CF.nghiep.min,CF.nghiep.max);d.nh+=c;
        DT.push({x:e.x,y:300,s:CF.raw.nh.e+' +'+c+' '+CF.raw.nh.n,c:CF.raw.nh.c,l:190,g:1});sav()}
    }
    return}
  if(e.b>=1)return;                                           /* chỉ quái thường; không báo chữ để đỡ rối/lag, tự lưu ở lần lưu kế */
  if(Math.random()<CF.mob.dt)d.dt++;
  if(Math.random()<CF.mob.vr)d.vr++;
  if(Math.random()<CF.mob.td)d.td++}
if(typeof drop==='function'&&!drop.__tkl){
  var _drop=drop;
  drop=function(e){var r=_drop.apply(this,arguments);try{roll(e)}catch(x){}return r};
  drop.__tkl=1}

/* ---------- bảng ---------- */
var S={v:'menu',slot:[0,0,0,0],busy:false,note:'',cf:0};
var ov=null;
var BASE='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(14,6,2,.88);padding:12px;box-sizing:border-box;font-family:'+FONT+';color:#ffe9d2';
var BOX='max-width:420px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #c0602a;border-radius:14px;background:rgba(26,12,6,.98);padding:14px';
function guard(el){['pointerdown','touchstart','keydown','keyup'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function need(k,n){var h=have(k),ok=h>=n;return '<span style="white-space:nowrap;margin-right:8px">'+CF.raw[k].e+' '+CF.raw[k].n+' <b style="color:'+(ok?'#9dffa0':'#ff9a9a')+'">'+nf(h)+'/'+nf(n)+'</b></span> '}
function btn(k,t,bg,bd,on,extra){return '<button data-tk="'+k+'" '+(extra||'')+' '+(on?'':'disabled')+' style="background:'+bg+';color:#fff;border:1px solid '+bd+';border-radius:8px;padding:9px;font-weight:bold;width:100%;'+(on?'':'opacity:.45;')+'">'+t+'</button>'}
function slotsReady(){return okMe()&&S.slot.every(function(x,i){return x&&PK(i)>=CF.qty})}

function viewMenu(){
  return '<h2 style="margin:0 0 4px;color:'+COL+';font-size:19px">🔥 Nhà Tinh Luyện</h2>'
    +'<div style="font-size:12.5px;opacity:.85;line-height:1.5;margin-bottom:8px">Nơi tinh luyện các vật phẩm tối thượng.</div>'
    +'<button data-tk="forge" style="width:100%;text-align:left;background:#7a3a14;color:#fff;border:1px solid #ffb36a;border-radius:10px;padding:12px;font-size:15px;font-weight:bold">⚒ Luyện Thánh Khí<br><small style="font-weight:normal;opacity:.85">Dung hợp 4 nguyên liệu → Thánh Khí</small></button>'
    +'<button disabled style="width:100%;text-align:left;margin-top:8px;background:#2a2a2a;color:#aaa;border:1px dashed #666;border-radius:10px;padding:12px;font-size:14px;opacity:.7">🔒 Tính năng khác — cập nhật sau</button>'
    +'<button data-tk="x" style="width:100%;margin-top:10px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>'}

function viewForge(){
  var h='';
  h+='<h2 style="margin:0 0 4px;color:'+COL+';font-size:19px">⚒ Luyện Thánh Khí</h2>';
  if(!ME)h+='<div style="margin:8px 0;font-size:13px;opacity:.8">⏳ Đang tải kho...</div>';
  else if(!okMe())h+='<div style="margin:8px 0;padding:9px;border:1px solid #7a4a4a;border-radius:10px;background:#1c1014;color:#ffb4a8;font-size:13px">'+errTx(ME)+'</div>';
  h+='<div style="font-size:12.5px;opacity:.85;line-height:1.5">Chạm từng ô để đặt nguyên liệu chính vào ô dung hợp. Cần đủ <b>4 loại</b>, mỗi loại <b>×'+CF.qty+'</b>.</div>';
  /* 4 ô dung hợp */
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0 6px">';
  CF.mats.forEach(function(m,i){
    var n=PK(i),on=S.slot[i]&&n>=CF.qty;
    h+='<div data-tk="slot" data-i="'+i+'" style="text-align:center;padding:8px 2px;border-radius:10px;border:2px '+(on?'solid '+m.c:'dashed #7a5a3a')+';background:'+(on?'rgba(255,180,100,.14)':'#1a0e08')+';'+(on?'box-shadow:0 0 10px '+m.c+';':'')+'min-height:74px;box-sizing:border-box">'
      +'<div style="font-size:26px;line-height:1.1;'+(on?'':'opacity:.35')+'">'+m.e+'</div>'
      +'<div style="font-size:10.5px;line-height:1.2;margin-top:2px;color:'+(on?m.c:'#a08a70')+'">'+m.n+'</div>'
      +'<div style="font-size:10.5px;margin-top:2px;color:'+(n>=CF.qty?'#9dffa0':'#ff9a9a')+'">'+(on?'✔ đã đặt ':'')+n+'/'+CF.qty+'</div></div>'});
  h+='</div>';
  var rdy=slotsReady(),gOk=G()>=CF.forgeGold;
  h+='<div style="font-size:12.5px;text-align:center;margin:4px 0">💰 <b style="color:'+(gOk?'#9dffa0':'#ff9a9a')+'">'+nf(CF.forgeGold)+'</b> · 💎 <b>'+nf(CF.forgeLt)+'</b> Linh Thạch</div>';
  h+='<button data-tk="fuse" '+((rdy&&!S.busy)?'':'disabled')+' style="width:100%;background:'+(S.cf?'#b02a1a':'#a8483a')+';color:#fff;border:1px solid #ffb36a;border-radius:10px;padding:11px;font-size:15px;font-weight:bold;'+((rdy&&!S.busy)?'':'opacity:.45;')+'">'+(S.cf?'⚠ Bấm lần nữa để XÁC NHẬN dung hợp':'🔥 Dung hợp Thánh Khí')+'</button>';
  /* ghép nguyên liệu chính */
  h+='<div style="margin:12px 0 4px;font-weight:bold;color:'+COL+'">🧱 Ghép nguyên liệu chính <small style="font-weight:normal;opacity:.8">(mỗi lần ×1 · 💰 '+nf(CF.fuseGold)+')</small></div>';
  CF.mats.forEach(function(m,mi){
    var ok=okMe()&&canMake(m)&&G()>=CF.fuseGold&&!S.busy,r='';
    for(var k in m.need)r+=need(k,m.need[k]);
    h+='<div style="margin-top:6px;padding:9px;border:1px solid '+(canMake(m)?m.c:'#5a3a24')+';border-radius:10px;background:#1e1008">'
      +'<div style="display:flex;justify-content:space-between;align-items:center"><b style="color:'+m.c+';font-size:14px">'+m.e+' '+m.n+'</b><span style="font-size:12.5px">Có <b>'+PK(mi)+'</b>/'+CF.qty+'</span></div>'
      +'<div style="font-size:12px;line-height:1.7;margin:2px 0 5px">'+r+'</div>'
      +'<div style="display:flex;gap:6px">'
      +'<div style="flex:1">'+btn('make','Ghép 1','#1f6a5c','#7fe3d0',ok,'data-id="'+m.id+'" data-n="1"')+'</div>'
      +'<div style="flex:1">'+btn('make','Ghép 10','#1f6a5c','#7fe3d0',ok&&maxMake(m)>=10,'data-id="'+m.id+'" data-n="10"')+'</div>'
      +'<div style="flex:1.4">'+btn('make','Tối đa ('+maxMake(m)+')','#2a7a6c','#9ff3e0',ok&&maxMake(m)>=1,'data-id="'+m.id+'" data-n="max"')+'</div></div></div>'});
  /* thánh khí đã có */
  h+='<div style="margin:12px 0 4px;font-weight:bold;color:'+COL+'">🏆 Thánh Khí đã luyện</div><div style="font-size:12.5px;line-height:1.7">';
  CF.items.forEach(function(it,i){h+='<span style="margin-right:10px;white-space:nowrap">'+(it.ic?'<img src="'+it.ic+'" style="width:22px;height:22px;vertical-align:middle">':it.e)+' <span style="color:'+it.c+'">'+it.n+'</span> <b>×'+KK(i)+'</b></span> '});
  h+='</div><div style="font-size:11.5px;opacity:.7;margin-top:2px">Mở ô ✨ Thánh Khí trong Túi (cột trái nhân vật) để chọn 1 món cho nhân vật và nâng cấp tối đa 10 cấp.</div>';
  /* nguồn nguyên liệu thô */
  h+='<div style="font-size:11.5px;opacity:.75;margin-top:8px;line-height:1.55">Nguồn: 🔥 Nghiệp Hoả — Boss Hầm Ngục (50%) · 🐲 Long Hồn — Boss Địa Long Điện (1–5) · 📖 Thần Văn — Boss Phụ Bản Ma Thần (1–10) · 🪨 Đá Thành Thiết, 🐉 Vảy Rồng, 🌿 Tảo Địa Tinh — quái thường · 🔩 Quặng Sắt, 🌑 Huyền Kim — khai khoáng.</div>';
  h+='<div style="min-height:18px;font-size:13px;color:#ffd98a;text-align:center;margin-top:6px">'+(S.note||'')+'</div>'
    +'<div style="display:flex;gap:6px;margin-top:6px"><button data-tk="back" style="flex:1;background:#4a3a2a;color:#fff;border:1px solid #997;border-radius:8px;padding:8px">← Quay lại</button>'
    +'<button data-tk="x" style="flex:1;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button></div>';
  return h}

function html(){return S.v==='forge'?viewForge():viewMenu()}
function render(){if(!ov||ov.style.display==='none')return;var bx=ov.firstChild,st=bx.scrollTop;bx.innerHTML=html();try{bx.scrollTop=st}catch(e){}}
function open(){
  if(typeof started==='undefined'||!started)return;
  if(!ov){
    ov=document.createElement('div');ov.id='tkl-ov';ov.style.cssText=BASE;guard(ov);
    ov.innerHTML='<div style="'+BOX+'"></div>';
    ov.addEventListener('click',function(e){
      var t=e.target,a=t.closest&&t.closest('[data-tk]');
      if(!a){if(t===ov)close();return}
      if(a.disabled)return;
      var k=a.dataset.tk;
      if(k==='x')close();
      else if(k==='forge'){S.v='forge';S.note='';S.cf=0;render()}
      else if(k==='back'){S.v='menu';S.note='';S.cf=0;render()}
      else if(k==='slot'){var i=+a.dataset.i;
        if(S.slot[i])S.slot[i]=0;else if(PK(i)>=CF.qty)S.slot[i]=1;else S.note='Chưa đủ '+CF.qty+' '+CF.mats[i].n+' — hãy ghép ở phần bên dưới';
        S.cf=0;render()}
      else if(k==='make')make(a.dataset.id,a.dataset.n);
      else if(k==='fuse')fuse()});
    document.body.appendChild(ov)}
  S.v='menu';S.note='';S.cf=0;S.slot=[0,0,0,0];ov.style.display='flex';render();fetchMe().then(function(){render()})}
function close(){if(ov)ov.style.display='none'}

/* ---------- ghép ×n nguyên liệu chính: trừ thô + vàng ở máy khách → máy chủ +n (lỗi thì hoàn) ---------- */
function make(id,cnt){
  if(S.busy)return;
  var m=null,mi=-1;CF.mats.forEach(function(x,i){if(x.id===id){m=x;mi=i}});if(!m)return;
  function msg(s){S.note=s;render()}
  if(!okMe())return msg(errTx(ME));
  var n=cnt==='max'?maxMake(m):Math.floor(+cnt)||1;
  if(n<1||n>CF.qty)n=Math.max(1,Math.min(n,CF.qty));
  for(var k in m.need)if(have(k)<m.need[k]*n)return msg('Thiếu '+CF.raw[k].n+': cần '+nf(m.need[k]*n)+' (có '+nf(have(k))+')');
  if(G()<CF.fuseGold*n)return msg('Không đủ vàng: cần '+nf(CF.fuseGold*n)+'💰');
  for(var q in m.need)take(q,m.need[q]*n);
  addG(-CF.fuseGold*n);sav();
  S.busy=true;S.cf=0;S.note='⏳ Đang ghép...';render();
  rpc('tk_make',{p_kind:mi+1,p_n:n}).then(function(res){
    S.busy=false;
    if(res&&res.status==='ok'){
      setMe(res);sav();say('✨ Ghép thành '+n+' '+m.n,m.c,200);
      return msg('✨ Ghép thành '+n+' '+m.n+' (có '+PK(mi)+'/'+CF.qty+')')}
    for(var q2 in m.need){var back=m.need[q2]*n;if(q2==='fe'||q2==='hk'){var M=MN.get();M[q2]=(M[q2]|0)+back}else{var d=D();d[q2]=(d[q2]|0)+back}}
    addG(CF.fuseGold*n);sav();
    msg(errTx(res)+' — đã hoàn nguyên liệu và vàng')})}

/* ---------- dung hợp Thánh Khí: trừ 💎 → trừ vàng → máy chủ trừ 4×100 gói + quay món (lỗi thì hoàn vàng + 💎) ---------- */
function fuse(){
  if(S.busy)return;
  function msg(s){S.note=s;S.cf=0;render()}
  if(!slotsReady())return msg('Cần đặt đủ 4 loại nguyên liệu vào 4 ô');
  if(G()<CF.forgeGold)return msg('Không đủ vàng: cần '+nf(CF.forgeGold)+'💰');
  if(!ltOk())return msg(spErr({err:'login'}));
  if(!S.cf){S.cf=1;S.note='Sẽ tốn '+nf(CF.forgeGold)+'💰 + '+nf(CF.forgeLt)+'💎 và 4×'+CF.qty+' nguyên liệu chính.';render();return}
  S.cf=0;S.busy=true;S.note='⏳ Đang trừ phí...';render();
  spend(CF.forgeLt,'thanh_khi').then(function(r){
    if(!(r&&r.ok)){S.busy=false;return msg(spErr(r))}
    if(G()<CF.forgeGold){S.busy=false;try{LT.earnKS(CF.forgeLt)}catch(e){}return msg('Vàng không còn đủ — đã hoàn '+nf(CF.forgeLt)+'💎 (Linh Thạch khoá)')}
    addG(-CF.forgeGold);
    rpc('tk_fuse').then(function(res){
      S.busy=false;
      if(res&&res.status==='ok'){
        setMe(res);S.slot=[0,0,0,0];
        var it=CF.items[res.idx|0]||CF.items[0];
        sav();say('🔥 Luyện thành '+it.n+'!',it.c,200);
        return msg('🔥 Luyện thành '+it.e+' '+it.n+'! Mở ô ✨ Thánh Khí trong Túi để chọn cho nhân vật.')}
      addG(CF.forgeGold);try{LT.earnKS(CF.forgeLt)}catch(e){}sav();
      setMe(res);
      msg(errTx(res)+' — đã hoàn vàng và '+nf(CF.forgeLt)+'💎 (Linh Thạch khoá)');
      fetchMe().then(function(){render()})})})}

/* ---------- hiện trong Túi 7 ⚗ ---------- */
function bagHook(){
  try{
    if(!(window.NLB&&NLB.add))return false;
    var cat='🔥 Thánh Khí';
    [['nh','Nghiệp Hoả','Rơi ở Boss Hầm Ngục. Ghép Thần Hoả Tinh Phách ở Nhà Tinh Luyện.'],
     ['dt','Đá Thành Thiết','Quái thường rơi. Ghép Thần Hoả Tinh Phách.'],
     ['lh','Long Hồn','Boss Địa Long Điện rơi. Ghép Long Hồn Thần Lân.'],
     ['vr','Vảy Rồng','Quái thường rơi. Ghép Long Hồn Thần Lân.'],
     ['tv','Thần Văn','Boss Phụ Bản Ma Thần rơi. Ghép Thiên Đạo Phù Văn.'],
     ['td','Tảo Địa Tinh','Quái thường rơi. Ghép Thiên Đạo Phù Văn.']].forEach(function(a){
      var r=CF.raw[a[0]];NLB.add(6,cat,'tk_'+a[0],r.e,a[1],a[2],function(){return D()?D()[a[0]]|0:0})});
    CF.mats.forEach(function(m,mi){
      NLB.add(6,cat,'tkp_'+m.id,m.e,m.n,'Nguyên liệu chính — cần ×'+CF.qty+' mỗi loại để dung hợp Thánh Khí ở Nhà Tinh Luyện.',function(){return PK(mi)})});
    CF.items.forEach(function(it,i){
      NLB.add(6,'🏆 Thánh Khí','tkk_'+i,it.e,it.n,'Thánh Khí — mở ô ✨ Thánh Khí trong Túi để chọn cho nhân vật và nâng tối đa 10 cấp.',function(){return KK(i)})});
    return true}catch(e){}
  return false}
(function(){var n=0,t=setInterval(function(){if(online()){clearInterval(t);fetchMe()}else if(++n>30)clearInterval(t)},2000)})();
if(!bagHook()){var bt=0,bi=setInterval(function(){if(bagHook()||++bt>40)clearInterval(bi)},500)}

/* ---------- gắn vào Nhà Số 5 Làng Tân Thủ 3 (TT3.houses[4]) ---------- */
function hook(){
  try{
    if(window.TT3&&TT3.houses&&TT3.houses[4]){
      var H=TT3.houses[4];H.l1='Tinh Luyện';H.l2='Thánh Khí';H.full='Nhà Tinh Luyện';H.ch='鍛';H.col='#e0803a';H.locked=0;H.open=function(){open()};return true}
  }catch(e){}
  return false}
if(!hook()){var tries=0,iv=setInterval(function(){if(hook()||++tries>40)clearInterval(iv)},500)}

window.TKL={cfg:CF,open:open,close:close,get:D};
})();
