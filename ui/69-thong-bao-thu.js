/* ===== 📢✉️ THÔNG BÁO + THƯ (ui/69-thong-bao-thu.js) =====
 * 2 nút tròn ở hàng trái màn hình chính, ngay sau 💬 Chat và 🏮 Chợ online: [📢 Thông báo] [✉️ Thư]. Chấm đỏ = số mục chưa đọc / chưa nhận quà.
 * Bấm nút → mở bảng có 2 tab (Thông báo / Thư), chuyển qua lại được.
 *
 * 📢 THÔNG BÁO (chung mọi nhân vật; trạng thái đã đọc lưu localStorage 'ktb_read'):
 *    - Nguồn 1: mảng NOTICES bên dưới (sửa tay khi ra bản mới: thêm 1 dòng, id không được trùng).
 *    - Nguồn 2 (tuỳ chọn): bảng Supabase `thong_bao` (loai='tb') qua RPC lay_thong_bao — chạy thong_bao_thu.sql 1 lần. Thiếu thì bỏ qua, không báo lỗi.
 * ✉️ THƯ (theo từng nhân vật, lưu trong PS[cur].mail nên đi cùng save / cloud save):
 *    - Thư có thể đính kèm quà: vàng · vật phẩm Cash Shop (bùa, vé, búa, ngọc) · quặng sắt/huyền kim · rương trang bị. Bấm "Nhận quà" mới cộng.
 *    - Túi đầy thì chưa cho nhận quà trang bị (không mất thư). Thư đã đọc + đã nhận quà tự xoá sau 30 ngày; tối đa 60 thư.
 *    - Thư hệ thống từ máy chủ: bảng `thong_bao` (loai='thu', cột qua = jsonb) — mỗi nhân vật nhận 1 lần/thư (PS[cur].mailIds).
 * API cho module khác:
 *    MAIL.send({id?, from, title, body, q:{gold, csh:{b10:1,vx:2}, fe, hk, eq:{r:3,n:1}, it:{nt:5,dtc:2}}})  (it = vật phẩm mới, khoá trong bảng ITM bên dưới, xuất ra MAIL.IT) → true nếu thêm được (id trùng = bỏ qua, trả false)
 *    MAIL.unread() · MAIL.open('mail'|'noti') · MAIL.close()
 *    NOTI.push({id,t,b}) thêm thông báo tạm trong phiên (không lưu) · NOTI.unread()
 * Quà "Linh Thạch" KHÔNG có trong thư (ví nằm trên máy chủ, chỉ cộng qua SQL cho_admin_grant).
 * Phụ thuộc (thiếu thì tính năng tương ứng tự tắt): PS, cur, BAG, gold, gen, capN, P, RC, RN, CSH (63), MN (13), KCL (12), sv, ui, DT. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof BAG==='undefined')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',DAY=864e5,MAX_MAIL=60,KEEP_DAYS=30;

/* ---------- THÔNG BÁO CÓ SẴN (thêm dòng mới lên ĐẦU mảng) ---------- */
var NOTICES=[
  {id:'n002',ts:Date.parse('2026-10-16T08:00:00+07:00'),t:'✉️ Hòm thư đã mở',
   b:'Từ nay đạo hữu có <b>Hòm Thư</b> (nút ✉️ bên trái màn hình). Quà tặng, phần thưởng sự kiện sẽ gửi về đây — bấm <b>Nhận quà</b> để cộng vào nhân vật.\nThư đã đọc và đã nhận quà sẽ tự xoá sau 30 ngày.'},
  {id:'n001',ts:Date.parse('2026-10-16T07:00:00+07:00'),t:'📢 Chào mừng đến Mộng Tu Tiên',
   b:'Đây là mục <b>Thông báo</b>: tin cập nhật, sự kiện, bảo trì sẽ hiện ở đây. Chấm đỏ trên nút 📢 báo có tin mới chưa đọc.'}
];

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function rich(s){return esc(s).replace(/&lt;b&gt;/g,'<b>').replace(/&lt;\/b&gt;/g,'</b>').replace(/\n/g,'<br>')}
function fmtT(ts){try{var d=new Date(ts);return d.toLocaleDateString('vi-VN')+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}catch(e){return''}}
function sv_(){try{sv()}catch(e){}}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function started_(){try{return !!started}catch(e){return false}}
function me(){try{return PS[cur]||null}catch(e){return null}}

/* ---------- THÔNG BÁO ---------- */
var remoteN=[],tmpN=[];
try{remoteN=JSON.parse(localStorage.getItem('ktb_cache')||'[]')||[]}catch(e){remoteN=[]}
function rdRead(){try{return JSON.parse(localStorage.getItem('ktb_read')||'{}')||{}}catch(e){return{}}}
function wrRead(o){try{localStorage.setItem('ktb_read',JSON.stringify(o))}catch(e){}}
function allN(){
  var seen={},out=[];
  tmpN.concat(remoteN,NOTICES).forEach(function(n){if(n&&n.id&&!seen[n.id]){seen[n.id]=1;out.push(n)}});
  out.sort(function(a,b){return (b.ts||0)-(a.ts||0)});
  return out;
}
function unreadN(){var r=rdRead();return allN().filter(function(n){return !r[n.id]}).length}

/* ---------- THƯ ---------- */
function mails(){var p=me();if(!p)return[];if(!Array.isArray(p.mail))p.mail=[];return p.mail}
function ids(){var p=me();if(!p)return{};if(!p.mailIds||typeof p.mailIds!=='object')p.mailIds={};return p.mailIds}
var CSHK={b10:1,b15:1,b20:1,ham:1,g10:1,dh:1,vx:1,vt:1,tc:1,x5:1,x7:1};
/* Vật phẩm mới gửi qua thư: q.it={khoá:số lượng}. t = cách cộng vào kho (xem giveIt). max = tối đa mỗi thư. */
var ITM={
  nt:{t:'nt',e:'🌙',n:'Mảnh Nguyệt Thạch',max:1000},
  sh:{t:'sh',e:'✨',n:'Mảnh Thánh',max:1000},
  kt:{t:'kt',e:'💎',n:'Mảnh Kim Tinh',max:100000},
  fr:{t:'fr',e:'🔹',n:'Mảnh Chế Tạo',max:1000000},
  hp:{t:'hp',e:'🔮',n:'Hồn Phách',max:10000},
  pts:{t:'pts',e:'📊',n:'Điểm Tiềm Năng',max:1000},
  hb:{t:'hb',e:'🧪',n:'Bình Máu',max:1000},
  mb:{t:'mb',e:'💧',n:'Bình Mana',max:1000},
  dtc:{t:'pill',e:'🟡',n:'Trúc Cơ Đan',max:100},
  dkd:{t:'pill',e:'🟠',n:'Kim Đan Đan',max:100},
  dna:{t:'pill',e:'🟣',n:'Nguyên Anh Đan',max:100},
  dht:{t:'pill',e:'🔴',n:'Hoá Thần Đan',max:100},
  dlh:{t:'pill',e:'🔵',n:'Luyện Hư Đan',max:100},
  mtc:{t:'herb',e:'🪷',n:'NL Trúc Cơ Đan',max:1000},
  mkd:{t:'herb',e:'🔸',n:'NL Kim Đan',max:1000},
  mna:{t:'herb',e:'🔮',n:'NL Nguyên Anh Đan',max:1000},
  mht:{t:'herb',e:'🌠',n:'NL Hoá Thần Đan',max:1000},
  mlh:{t:'herb',e:'🌀',n:'NL Luyện Hư Đan',max:1000},
  mdna:{t:'herb',e:'🧿',n:'NL Đúc Nguyên Anh',max:1000},
  tt:{t:'pill',e:'⚪',n:'Tôi Thể Đan',max:1000},        /* Fix195: chuyển cấp Phàm Nhân → Đạo Thể (cần 100) — khoá 'tt' trùng id đan trong Luyện Đan */
  cot:{t:'herb',e:'🦴',n:'Cốt Linh Thảo',max:1000}
};
function normQ(q){
  if(!q||typeof q!=='object')return null;
  var o={},n;
  if((n=Math.floor(+q.gold))>0)o.gold=Math.min(n,2e9);
  if(q.csh&&typeof q.csh==='object'){var c={};Object.keys(q.csh).forEach(function(k){var v=Math.floor(+q.csh[k]);if(CSHK[k]&&v>0&&v<=1000)c[k]=v});if(Object.keys(c).length)o.csh=c}
  if((n=Math.floor(+q.fe))>0)o.fe=Math.min(n,1e6);
  if((n=Math.floor(+q.hk))>0)o.hk=Math.min(n,1e6);
  if(q.eq&&typeof q.eq==='object'){var r=Math.floor(+q.eq.r),k=Math.floor(+q.eq.n);if(r>=0&&r<=5&&k>0&&k<=20)o.eq={r:r,n:k}}
  if(q.it&&typeof q.it==='object'){var t={};Object.keys(q.it).forEach(function(k){var v=Math.floor(+q.it[k]);if(ITM[k]&&v>0&&v<=ITM[k].max)t[k]=v});if(Object.keys(t).length)o.it=t}
  return Object.keys(o).length?o:null;
}
function hasAtt(m){return !!(m&&m.q&&!m.c)}
function unreadM(){return mails().filter(function(m){return !m.r||hasAtt(m)}).length}
function purge(){
  var l=mails(),now=Date.now(),keep=l.filter(function(m){return !(m.r&&!hasAtt(m)&&now-m.ts>KEEP_DAYS*DAY)});
  if(keep.length!==l.length){me().mail=keep;sv_()}
}
function send(o){
  var p=me();if(!p||!o)return false;
  var id=o.id?String(o.id):'';
  if(id){var d=ids();if(d[id]||mails().some(function(m){return m.id===id}))return false;d[id]=1}
  else id='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  var l=mails();
  l.unshift({id:id,f:String(o.from||'Hệ Thống').slice(0,40),t:String(o.title||'Thư mới').slice(0,80),b:String(o.body||'').slice(0,2000),ts:+o.ts||Date.now(),r:0,c:0,q:normQ(o.q)});
  while(l.length>MAX_MAIL){
    var i=-1,k;for(k=l.length-1;k>=0;k--){if(l[k].r&&!hasAtt(l[k])){i=k;break}}
    if(i<0)i=l.length-1;l.splice(i,1);
  }
  sv_();say('✉️ Có thư mới: '+String(o.title||'').slice(0,24),'#9fe8ff');
  if(open)draw();
  return true;
}
function qLines(q){
  if(!q)return[];var a=[];
  if(q.gold)a.push('💰 '+nf(q.gold)+' vàng');
  if(q.csh)Object.keys(q.csh).forEach(function(k){
    var nm=k;try{var c=CSH.cfg.lt.filter(function(x){return x.k===k})[0];if(c)nm=c.e+' '+c.n}catch(e){}
    a.push(nm+' ×'+q.csh[k])});
  if(q.fe)a.push('🔩 Quặng Sắt ×'+nf(q.fe));
  if(q.hk)a.push('🌑 Huyền Kim ×'+nf(q.hk));
  if(q.eq){var rn='';try{rn=RN[q.eq.r]}catch(e){}a.push('🎁 '+q.eq.n+' trang bị '+rn)}
  if(q.it)Object.keys(q.it).forEach(function(k){var d=ITM[k];a.push((d?d.e+' '+d.n:k)+' ×'+nf(q.it[k]))});
  return a;
}
function itErr(it){
  var ks=Object.keys(it),i,d;
  for(i=0;i<ks.length;i++){d=ITM[ks[i]];if(!d)continue;
    if((d.t==='nt'||d.t==='sh')&&!(typeof HL!=='undefined'&&HL.addNT&&HL.addSH))return'Chưa có kho '+d.n+'.';
    if((d.t==='pill'||d.t==='herb')&&!(typeof FM!=='undefined'&&FM.get))return'Chưa có Linh Điền / Luyện Đan để nhận '+d.n+'.';
    if(d.t==='hp'&&!(window.HONP&&HONP.chosen&&HONP.chosen()))return'🔮 Hãy chọn Hồn Phách (tab 🧘 Tu tiên trong túi) rồi nhận lại thư.';
  }
  return'';
}
function giveIt(k,n){
  var d=ITM[k],p=me(),s;if(!d||!(n>0))return;
  if(d.t==='nt')HL.addNT(n);
  else if(d.t==='sh')HL.addSH(n);
  else if(d.t==='kt')KT+=n;
  else if(d.t==='fr')frag+=n;
  else if(d.t==='hp')HONP.collect(n);
  else if(d.t==='pts')p.pts=(p.pts|0)+n;
  else if(d.t==='hb')hpP+=n;
  else if(d.t==='mb')mpP+=n;
  else if(d.t==='pill'){s=FM.get();if(!s.pills)s.pills={};s.pills[k]=(s.pills[k]|0)+n}
  else if(d.t==='herb'){s=FM.get();if(!s.herbs)s.herbs={};s.herbs[k]=(s.herbs[k]|0)+n}
}
/* trả về chuỗi lỗi nếu chưa nhận được, '' nếu thành công */
function claimOne(m){
  if(!hasAtt(m))return'';
  var q=m.q,p=me();if(!p)return'Chưa chọn nhân vật.';
  if(q.csh&&!window.CSH)return'Chưa có Cash Shop để nhận vật phẩm.';
  if((q.fe||q.hk)&&!(typeof MN!=='undefined'&&MN.get))return'Chưa có kho quặng để nhận quặng.';
  if(q.it){var ie=itErr(q.it);if(ie)return ie}
  if(q.eq){
    var cap=90;try{cap=capN()}catch(e){}
    if(BAG.length+q.eq.n>cap)return'🎒 Túi không đủ chỗ cho '+q.eq.n+' trang bị — dọn túi rồi nhận lại.';
    if(typeof gen!=='function')return'Chưa nhận được trang bị.';
  }
  try{
    if(q.gold)gold+=q.gold;
    if(q.csh){var d=p.csh||(p.csh={});Object.keys(q.csh).forEach(function(k){d[k]=(d[k]|0)+q.csh[k]})}
    if(q.fe)MN.get().fe+=q.fe;
    if(q.hk)MN.get().hk+=q.hk;
    if(q.it)Object.keys(q.it).forEach(function(k){giveIt(k,q.it[k])});
    if(q.eq)for(var i=0;i<q.eq.n;i++)BAG.push(gen(P.lv,q.eq.r));
  }catch(e){return'Lỗi khi nhận quà, thử lại.'}
  m.c=1;m.r=1;sv_();try{ui()}catch(e){}
  say('🎁 Đã nhận quà thư','#ffe9a0');
  return'';
}

/* ---------- GIAO DIỆN ---------- */
var el=null,open=false,tab='mail',cur_id='',note='';
function build(){
  var st=document.createElement('style');
  st.textContent=
  '.tbt-b{position:fixed;top:calc(132px + env(safe-area-inset-top,0px));width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;padding:0;box-shadow:0 2px 8px #0008}'
  +'#tbt-n{left:100px}#tbt-m{left:146px}'
  +'.tbt-b::after{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 9px/10px '+FONT+';color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}'
  +'#tbt-n::after{content:"Thông báo"}#tbt-m::after{content:"Thư"}'
  +'.tbt-b i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#e33;color:#fff;font:700 10px/16px sans-serif;text-align:center;font-style:normal;display:none;padding:0 3px;box-sizing:border-box}'
  +'#tbt{display:none;position:fixed;z-index:12;background:linear-gradient(#2a2118,#0e0a08);color:#f2e3b3;font-family:'+FONT+';box-sizing:border-box;flex-direction:column;padding-bottom:env(safe-area-inset-bottom,0px)}'
  +'#tbt.pt{left:0;right:0;bottom:0;top:30%;border-top:2px solid #b8964e}#tbt.ls{top:0;bottom:0;right:0;width:min(420px,100%);border-left:2px solid #b8964e}'
  +'#tbt .th{display:flex;align-items:center;padding:8px 12px;font-weight:700;font-size:16px;border-bottom:1px solid #4a3a2a}#tbt .th span{flex:1}'
  +'#tbt .th button{background:none;border:0;color:#f2e3b3;font-size:22px}'
  +'#tbt .tt{display:flex;border-bottom:1px solid #4a3a2a}#tbt .tt button{flex:1;padding:9px 2px;background:none;border:0;color:#b9a77a;font:700 13px '+FONT+'}'
  +'#tbt .tt button.on{color:#ffd76a;border-bottom:2px solid #ffd76a}#tbt .tt i{background:#e33;color:#fff;border-radius:8px;font:700 10px/14px sans-serif;padding:0 4px;margin-left:4px;font-style:normal}'
  +'#tbt .tn{padding:4px 12px;font-size:12px;color:#ffd98a}'
  +'#tbt .tl{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 10px}'
  +'#tbt .ti{border:1px solid #4a3a2a;border-radius:8px;margin:0 0 6px;background:#1d1510;overflow:hidden}#tbt .ti.nw{border-color:#c9a24f;background:#2a1f14}'
  +'#tbt .tr{display:flex;align-items:center;gap:8px;padding:8px 10px}#tbt .tr .tc{flex:1;min-width:0}'
  +'#tbt .tr b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tbt .tr small{opacity:.7;font-size:11px}'
  +'#tbt .tg{font:700 10px/14px sans-serif;padding:0 6px;border-radius:7px;background:#e33;color:#fff;white-space:nowrap}#tbt .tg.gf{background:#c98a1a}'
  +'#tbt .td{padding:2px 12px 10px;font-size:13px;line-height:1.5;border-top:1px dashed #4a3a2a}'
  +'#tbt .tq{margin:8px 0;padding:6px 8px;border:1px dashed #c9a24f;border-radius:8px;background:#0008;font-size:13px}#tbt .tq.dn{opacity:.55}'
  +'#tbt .ta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}'
  +'#tbt button.bt{font:inherit;font-size:12px;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:6px 10px}#tbt button.bt.dg{background:linear-gradient(#6a2222,#401212);border-color:#b86a6a}'
  +'#tbt .tf{display:flex;gap:6px;padding:8px 10px;border-top:1px solid #4a3a2a}'
  +'#tbt .te{text-align:center;opacity:.6;padding:30px 10px;font-size:13px}';
  document.head.appendChild(st);
  var bn=mkBtn('tbt-n','📢','Thông báo','noti'),bm=mkBtn('tbt-m','✉️','Hòm thư','mail');
  el=document.createElement('div');el.id='tbt';
  el.addEventListener('pointerdown',function(e){e.stopPropagation()});
  el.addEventListener('click',onClick);
  document.body.appendChild(el);
  setInterval(function(){
    try{
      var ar=document.getElementById('arena-scene'),on=started_()&&!(ar&&ar.classList.contains('on'));
      bn.style.display=bm.style.display=on?'flex':'none';
      if(!on){if(open)close();return}
      if(me())purge();
      badge(bn,unreadN());badge(bm,unreadM());
    }catch(e){}
  },500);
}
function mkBtn(id,ic,tt,mode){
  var b=document.createElement('button');b.id=id;b.type='button';b.className='tbt-b';b.title=tt;
  b.innerHTML=ic+'<i></i>';
  b.onpointerdown=function(e){e.stopPropagation()};
  b.onclick=function(e){e.stopPropagation();show(mode)};
  document.body.appendChild(b);return b;
}
function badge(b,n){var i=b.querySelector('i');if(!i)return;var t=n>9?'9+':String(n);if(i.textContent!==t)i.textContent=t;i.style.display=n>0?'block':'none'}

function draw(){
  if(!el)return;
  try{el.className=PORT?'pt':'ls'}catch(e){el.className='pt'}
  var keep=0,l0=el.querySelector('.tl');if(l0)keep=l0.scrollTop;
  var nN=unreadN(),nM=unreadM(),h='';
  h+='<div class="th"><span>'+(tab==='noti'?'📢 Thông báo':'✉️ Hòm thư')+'</span><button data-a="x">✕</button></div>';
  h+='<div class="tt"><button data-a="tab" data-v="noti" class="'+(tab==='noti'?'on':'')+'">📢 Thông báo'+(nN?'<i>'+nN+'</i>':'')+'</button><button data-a="tab" data-v="mail" class="'+(tab==='mail'?'on':'')+'">✉️ Thư'+(nM?'<i>'+nM+'</i>':'')+'</button></div>';
  if(note)h+='<div class="tn">'+esc(note)+'</div>';
  h+='<div class="tl">';
  if(tab==='noti'){
    var rd=rdRead(),L=allN();
    if(!L.length)h+='<div class="te">Chưa có thông báo nào.</div>';
    L.forEach(function(n){
      var nw=!rd[n.id],ex=cur_id===n.id;
      h+='<div class="ti'+(nw?' nw':'')+'"><div class="tr" data-a="no" data-id="'+esc(n.id)+'"><div class="tc"><b>'+esc(n.t)+'</b><small>'+(n.ts?fmtT(n.ts):'')+'</small></div>'+(nw?'<span class="tg">MỚI</span>':'')+'<span>'+(ex?'▴':'▾')+'</span></div>'
        +(ex?'<div class="td">'+rich(n.b)+'</div>':'')+'</div>';
    });
    h+='</div><div class="tf"><button class="bt" data-a="readall">✔ Đánh dấu đã đọc hết</button></div>';
  }else{
    var M=mails();
    if(!M.length)h+='<div class="te">Hòm thư trống.</div>';
    M.forEach(function(m){
      var nw=!m.r,ga=hasAtt(m),ex=cur_id===m.id;
      h+='<div class="ti'+((nw||ga)?' nw':'')+'"><div class="tr" data-a="mo" data-id="'+esc(m.id)+'"><div class="tc"><b>'+esc(m.t)+'</b><small>'+esc(m.f)+' · '+fmtT(m.ts)+'</small></div>'
        +(ga?'<span class="tg gf">🎁 Quà</span>':nw?'<span class="tg">MỚI</span>':'')+'<span>'+(ex?'▴':'▾')+'</span></div>';
      if(ex){
        h+='<div class="td">'+rich(m.b);
        if(m.q){h+='<div class="tq'+(m.c?' dn':'')+'"><b>🎁 Quà đính kèm'+(m.c?' (đã nhận)':'')+':</b><br>'+qLines(m.q).map(esc).join('<br>')+'</div>'}
        h+='<div class="ta">'+(ga?'<button class="bt" data-a="claim" data-id="'+esc(m.id)+'">🎁 Nhận quà</button>':'')+'<button class="bt dg" data-a="del" data-id="'+esc(m.id)+'">🗑 Xoá thư</button></div></div>';
      }
      h+='</div>';
    });
    var anyG=M.some(hasAtt);
    h+='</div><div class="tf"><button class="bt" data-a="claimall"'+(anyG?'':' disabled style="opacity:.45"')+'>🎁 Nhận tất cả quà</button><button class="bt dg" data-a="delread">🗑 Xoá thư đã xử lý</button></div>';
  }
  el.innerHTML=h;
  var l1=el.querySelector('.tl');if(l1)l1.scrollTop=keep;
}
function onClick(e){
  var t=e.target;while(t&&t!==el&&!(t.dataset&&t.dataset.a))t=t.parentNode;
  if(!t||t===el||!t.dataset)return;
  var a=t.dataset.a,id=t.dataset.id;
  e.stopPropagation();
  if(a==='x'){close();return}
  if(a==='tab'){tab=t.dataset.v;cur_id='';note='';draw();return}
  if(a==='no'){
    cur_id=cur_id===id?'':id;note='';
    if(cur_id){var r=rdRead();r[id]=1;wrRead(r)}
    draw();return}
  if(a==='readall'){var r2=rdRead();allN().forEach(function(n){r2[n.id]=1});wrRead(r2);note='';draw();return}
  if(a==='mo'){
    cur_id=cur_id===id?'':id;note='';
    if(cur_id){var m=find(id);if(m&&!m.r){m.r=1;sv_()}}
    draw();return}
  if(a==='claim'){var m1=find(id);note=m1?claimOne(m1):'';draw();return}
  if(a==='claimall'){
    var err='',n=0;
    mails().forEach(function(m){if(!err&&hasAtt(m)){err=claimOne(m);if(!err)n++}});
    note=err||(n?'✅ Đã nhận quà từ '+n+' thư.':'Không có quà để nhận.');draw();return}
  if(a==='del'){
    var m2=find(id);
    if(m2&&hasAtt(m2)){note='Hãy nhận quà trước khi xoá thư.';draw();return}
    me().mail=mails().filter(function(x){return x.id!==id});cur_id='';note='';sv_();draw();return}
  if(a==='delread'){
    var b0=mails().length;
    me().mail=mails().filter(function(x){return !(x.r&&!hasAtt(x))});
    var d0=b0-me().mail.length;cur_id='';note=d0?'🗑 Đã xoá '+d0+' thư.':'Không có thư nào để xoá.';sv_();draw()}
}
function find(id){var l=mails();for(var i=0;i<l.length;i++)if(l[i].id===id)return l[i];return null}
function show(t){
  if(!el)return;tab=t==='noti'?'noti':'mail';cur_id='';note='';open=true;
  if(!me()&&tab==='mail'){tab='noti'}
  el.style.display='flex';draw();pull();
}
function close(){open=false;cur_id='';if(el)el.style.display='none'}

/* ---------- THƯ/THÔNG BÁO TỪ MÁY CHỦ (tuỳ chọn) ---------- */
var fails=0,pulling=false;
function logged(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}catch(e){return false}}
function pull(){
  if(pulling||fails>=3||!logged()||!started_())return;
  pulling=true;
  var go;try{go=KCL.rpc('lay_thong_bao',{})}catch(e){pulling=false;fails++;return}
  Promise.resolve(go).then(function(r){
    pulling=false;fails=0;
    if(typeof r==='string'){try{r=JSON.parse(r)}catch(e){r=null}}
    if(!Array.isArray(r))return;
    var nn=[],now=Date.now();
    r.forEach(function(x){
      if(!x||x.id==null)return;
      var ts=Date.parse(x.tao_luc)||now,id='sv'+x.id;
      if(x.loai==='thu'){if(now-ts<=14*DAY&&me())send({id:id,from:'Hệ Thống',title:x.tieu_de,body:x.noi_dung,ts:ts,q:x.qua})}
      else nn.push({id:id,ts:ts,t:'📢 '+String(x.tieu_de||'').slice(0,80),b:String(x.noi_dung||'').slice(0,3000)});
    });
    remoteN=nn;try{localStorage.setItem('ktb_cache',JSON.stringify(nn))}catch(e){}
    if(open)draw();
  }).catch(function(){pulling=false;fails++});
}

/* thư chào mừng cho nhân vật chưa có thư nào (1 lần) */
function welcome(){
  var p=me();if(!p||p.mailWelcome)return;
  p.mailWelcome=1;
  send({id:'welcome',from:'Mộng Tu Tiên',title:'✉️ Chào mừng đạo hữu',body:'Đây là Hòm Thư của nhân vật. Quà tặng, phần thưởng sự kiện và thư hệ thống sẽ gửi về đây.\nThư có quà thì bấm <b>Nhận quà</b> để cộng vào nhân vật. Chúc đạo hữu tu tiên thuận lợi!'});
  sv_();
}
function boot(){
  build();
  var lastCur=null;
  setInterval(function(){try{if(started_()&&me()&&lastCur!==cur){lastCur=cur;welcome();setTimeout(pull,4000)}}catch(e){}},1000);
  setInterval(function(){try{if(started_())pull()}catch(e){}},120000);
}
window.MAIL={send:send,unread:unreadM,open:show,close:close,list:mails,IT:ITM};
window.NOTI={push:function(n){if(n&&n.id){tmpN.unshift({id:String(n.id),t:String(n.t||''),b:String(n.b||''),ts:Date.now()});if(open)draw()}},unread:unreadN};
if(document.body)boot();else document.addEventListener('DOMContentLoaded',boot);
})();
