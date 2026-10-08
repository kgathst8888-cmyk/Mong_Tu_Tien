/* ===== 🏮 CHỢ GIAO DỊCH ONLINE · LINH THẠCH =====
 * Dùng chung tài khoản ☁ (KCL.rpc). Cần chạy cho_giao_dich.sql 1 lần trong Supabase.
 * - Linh Thạch (💎) nằm trong ví trên máy chủ, theo tài khoản ☁ (dùng chung mọi nhân vật).
 * - Cách kiếm Linh Thạch: hạ BOSS = 1 viên, tối đa 500 viên/ngày (xem khối KIẾM LINH THẠCH TỪ BOSS cuối file; cần cho_linh_thach_boss.sql).
 *   Vẫn có thể cấp thủ công bằng cho_admin_grant trong SQL Editor.
 * - Đăng bán: đồ rời túi, ký gửi ở máy chủ. Mua/hủy/hết hạn: đồ về HÒM NHẬN, tự vào túi (túi đầy thì giữ lại).
 * - Phí bán 5%. Tối đa 10 món đang bán, hết hạn sau 48 giờ.
 * Chỉnh hằng số ở khối CF. Phụ thuộc: BAG, capN, SL, RC, ev, xHtml, sv, KCL (12-cloud-save).
 * Bản HTML chạy trên Claude không có mạng ngoài: chợ chỉ hiện thông báo cần ☁, game không bị ảnh hưởng. */
(function(){
'use strict';
if(typeof BAG==='undefined'||typeof capN!=='function'||typeof SL==='undefined')return;
var CF={fee:5,max:10,hours:48,minP:1,maxP:1000000000,poll:20000};
var RAR=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần','Thánh'];
var pending='',tab='shop',slot='',sort='new',off=0,lt=null,rows=[],mine=[],busy=false,open=false,note='',openId=0,gap=0;
var btn,pnl,body,nt,ltEl,timer=0;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function nice(e){var m=String(e&&e.message||e);return /cho_|function|schema|404/i.test(m)?'Máy chủ chưa cài chợ (chạy file cho_giao_dich.sql trong Supabase).':(e&&e.net?'Mất kết nối mạng.':m)}
function col(r){try{return RC[r]||'#ccc'}catch(e){return '#ccc'}}
function stat(it,k){try{return typeof ev==='function'?ev(it,k):it[k]}catch(e){return it[k]}}
function sv_(){try{sv()}catch(e){}}
function uiRefresh(){try{if(typeof bo!=='undefined'&&bo&&typeof ui==='function')ui()}catch(e){}}
function call(fn,a){return KCL.rpc(fn,a||{})}

function build(){
  var st=document.createElement('style');
  st.textContent='#cho-btn{position:fixed;left:54px;top:calc(132px + env(safe-area-inset-top,0px));width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;cursor:pointer}'+
  '#cho-btn i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#e33;color:#fff;font:700 10px/16px sans-serif;text-align:center;font-style:normal;display:none;padding:0 3px}'+
  '#cho-pnl{position:fixed;left:0;right:0;bottom:0;height:78%;max-height:600px;background:rgba(14,10,8,.97);border-top:2px solid #b8964e;z-index:11;display:none;flex-direction:column;color:#f2e3b3;font-family:system-ui,sans-serif;padding-bottom:env(safe-area-inset-bottom,0px)}'+
  '#cho-pnl .ch{display:flex;align-items:center;gap:8px;padding:8px 12px;font-weight:700;border-bottom:1px solid #4a3a2a}#cho-pnl .ch span{flex:1}'+
  '#cho-pnl .ch b{color:#7fe0ff;font-size:14px}#cho-pnl .ch button{background:none;border:0;color:#f2e3b3;font-size:20px}'+
  '#cho-tabs{display:flex;border-bottom:1px solid #4a3a2a}#cho-tabs button{flex:1;padding:8px 2px;background:none;border:0;color:#b9a77a;font-size:13px;font-weight:700;position:relative}'+
  '#cho-tabs button.on{color:#ffd76a;border-bottom:2px solid #ffd76a}#cho-tabs i{background:#e33;color:#fff;border-radius:8px;font:700 10px/14px sans-serif;padding:0 4px;margin-left:3px;font-style:normal}'+
  '#cho-bd{flex:1;overflow-y:auto;padding:8px 10px;font-size:13px;-webkit-overflow-scrolling:touch}'+
  '#cho-nt{padding:4px 12px;font-size:12px;color:#ff9a8a;display:none}'+
  '#cho-bd .it{display:flex;align-items:center;gap:8px;padding:7px;margin:5px 0;border:1px solid #4a3a2a;border-radius:8px;background:#1d1510}'+
  '#cho-bd .it .ic{font-size:22px;width:30px;text-align:center}#cho-bd .it .in{flex:1;min-width:0}'+
  '#cho-bd .it .nm{font-weight:700;word-break:break-word}#cho-bd .it small{opacity:.7;display:block}'+
  '#cho-bd .it .dt{margin-top:4px;font-size:12px;line-height:1.4}'+
  '#cho-bd .pr{color:#7fe0ff;font-weight:700;white-space:nowrap}'+
  '#cho-bd button.b,#cho-bd select{background:#8a6420;border:0;border-radius:7px;color:#fff;padding:7px 11px;font-weight:700;font-size:13px}'+
  '#cho-bd button.b.g{background:#3a3a3a}#cho-bd button.b.r{background:#7a2a2a}'+
  '#cho-bd select{background:#1d1510;border:1px solid #6a5434;margin-right:6px}'+
  '#cho-bd .bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:4px}#cho-bd .hint{opacity:.65;font-size:12px;margin:6px 0}';
  document.head.appendChild(st);
  btn=document.createElement('div');btn.id='cho-btn';btn.innerHTML='🏮<i></i>';btn.title='Chợ giao dịch';
  btn.onpointerdown=function(e){e.stopPropagation();toggle()};
  document.body.appendChild(btn);
  pnl=document.createElement('div');pnl.id='cho-pnl';
  pnl.innerHTML='<div class="ch"><span>🏮 Chợ Giao Dịch</span><b id="cho-lt">💎 …</b><button id="cho-x">✕</button></div>'+
    '<div id="cho-tabs"></div><div id="cho-nt"></div><div id="cho-bd"></div>';
  document.body.appendChild(pnl);
  body=pnl.querySelector('#cho-bd');nt=pnl.querySelector('#cho-nt');ltEl=pnl.querySelector('#cho-lt');
  pnl.querySelector('#cho-x').onclick=function(){toggle(false)};
  ['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){pnl.addEventListener(t,function(e){e.stopPropagation()})});
  pnl.querySelector('#cho-tabs').onclick=function(e){var b=e.target.closest('button[data-t]');if(!b)return;tab=b.dataset.t;openId=0;off=0;draw();load()};
  body.addEventListener('click',onClick);
  body.addEventListener('change',function(e){
    if(e.target.id==='cho-slot'){slot=e.target.value;off=0;load()}
    if(e.target.id==='cho-sort'){sort=e.target.value;off=0;load()}
  });
}
function say(t){setNote(t);pending=t}
function setNote(t){note=t||'';nt.style.display=t?'block':'none';nt.textContent=t||''}

function detail(it){
  var h='';
  try{h=(it.a?'Công +'+nf(stat(it,'a'))+' ':'')+(it.d?'Thủ +'+nf(stat(it,'d'))+' ':'')+(it.h?'HP +'+nf(stat(it,'h')):'')}catch(e){}
  try{if(it.x&&typeof xHtml==='function')h+='<br>'+xHtml(it)}catch(e){}
  return h;
}
function itemRow(it,right,extra,id){
  var s=SL[it.s]||['?','🎁'];
  var o=Object.keys(it.x||{}).length;
  return '<div class="it" data-open="'+id+'"><div class="ic">'+s[1]+'</div><div class="in"><div class="nm" style="color:'+col(it.r)+'">'+esc(it.n||s[0])+'</div>'+
    '<small>Lv '+(it.l|0)+' · '+(RAR[it.r]||'')+(o?' · '+o+' opt':'')+(extra?' · '+extra:'')+'</small>'+
    (openId===id?'<div class="dt">'+detail(it)+'</div>':'')+'</div>'+right+'</div>';
}

function tabsHtml(){
  var inb=lastInbox>0?'<i>'+lastInbox+'</i>':'';
  var t=[['shop','🛒 Chợ'],['sell','📦 Đăng bán'],['mine','📜 Của tôi'+(mine.length?' ('+mine.length+')':'')+inb]];
  return t.map(function(x){return '<button data-t="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'">'+x[1]+'</button>'}).join('');
}
function draw(){
  pnl.querySelector('#cho-tabs').innerHTML=tabsHtml();
  ltEl.innerHTML='💎 '+(lt==null?'…':nf(lt))+(lt==null?'':' <small style="opacity:.75" title="Linh Thạch kiếm từ Boss hôm nay">(+'+earned+'/'+EMAX+')</small>');
  if(!logged()){body.innerHTML='<div class="hint">Chợ giao dịch cần đăng nhập ☁ (menu chính) và kết nối mạng.<br>Bản chạy trong Claude không có mạng ngoài nên chợ không dùng được ở đó — game vẫn chơi bình thường.</div>';return}
  var h='';
  if(tab==='shop'){
    h+='<div class="bar"><select id="cho-slot"><option value="">Mọi loại</option>'+SL.map(function(s,i){return '<option value="'+i+'"'+(slot===String(i)?' selected':'')+'>'+s[1]+' '+s[0]+'</option>'}).join('')+'</select>'+
      '<select id="cho-sort"><option value="new"'+(sort==='new'?' selected':'')+'>Mới nhất</option><option value="asc"'+(sort==='asc'?' selected':'')+'>Giá thấp</option><option value="desc"'+(sort==='desc'?' selected':'')+'>Giá cao</option></select>'+
      '<button class="b g" data-a="ref">↻</button></div>';
    if(!rows.length)h+='<div class="hint">Chưa có món nào đang bán.</div>';
    rows.forEach(function(r){
      var right=r.mine?'<span class="pr">💎 '+nf(r.price)+'<small>của bạn</small></span>':'<div style="text-align:right"><div class="pr">💎 '+nf(r.price)+'</div><button class="b" data-a="buy" data-id="'+r.id+'">Mua</button></div>';
      h+=itemRow(r.item,right,esc(r.sname),'s'+r.id);
    });
    h+='<div class="bar" style="justify-content:center;margin-top:8px">'+(off>0?'<button class="b g" data-a="prev">‹ Trước</button>':'')+(rows.length>=20?'<button class="b g" data-a="next">Sau ›</button>':'')+'</div>';
  }else if(tab==='sell'){
    h+='<div class="hint">Chọn trang bị trong túi để đăng bán. Phí '+CF.fee+'% khi bán được, tối đa '+CF.max+' món, hết hạn sau '+CF.hours+' giờ. Đồ đăng bán rời khỏi túi và về lại qua hòm nhận nếu hủy/hết hạn.</div>';
    var n=0;BAG.forEach(function(it,i){if(!it||typeof it!=='object')return;n++;h+=itemRow(it,'<button class="b" data-a="post" data-i="'+i+'">Bán</button>','','b'+i)});
    if(!n)h+='<div class="hint">Túi không có trang bị nào.</div>';
  }else{
    h+='<div class="hint">Món đang bán · Đồ về túi tự động (hòm nhận).</div>';
    if(!mine.length)h+='<div class="hint">Bạn chưa đăng bán món nào.</div>';
    mine.forEach(function(r){
      var left=Math.max(0,Math.round((r.exp*1000-Date.now())/3600000));
      h+=itemRow(r.item,'<div style="text-align:right"><div class="pr">💎 '+nf(r.price)+'</div><button class="b r" data-a="cancel" data-id="'+r.id+'">Hủy</button></div>','còn ~'+left+'g','m'+r.id);
    });
  }
  body.innerHTML=h;
}

var lastInbox=0;
async function load(){
  if(!logged()||busy){draw();return}
  busy=true;var keep=pending;pending='';setNote('');
  try{
    var me=await call('cho_me');
    if(me&&me.status==='ok'){lt=+me.lt||0;if(me.earned!=null){earned=+me.earned||0;eDay=vnDay()}mine=me.mine||[];await claim(me.inbox||[]);
      (me.sold||[]).forEach(function(s){setNote('💰 Đã bán '+(s.item&&s.item.n||'1 món')+' · +'+nf(s.net)+' 💎')})}
    if(tab==='shop'){
      var r=await call('cho_list',{p_slot:slot===''?null:+slot,p_sort:sort,p_off:off});
      if(r&&r.status==='ok'){rows=r.rows||[]}
    }
    if(!note&&keep)setNote(keep);
  }catch(e){setNote(nice(e))}
  busy=false;draw();updBadge();
}
async function claim(inbox){
  var ids=[],left=0;
  inbox.forEach(function(q){
    if(BAG.length<capN()&&q.item&&typeof q.item==='object'){var it=q.item;delete it._mk;BAG.push(it);ids.push(q.id)}else left++;
  });
  lastInbox=left;
  if(ids.length){
    sv_();uiRefresh();
    try{await call('cho_ack',{p_ids:ids})}catch(e){}
    setNote('📬 Nhận '+ids.length+' món vào túi.');
  }
  if(left)setNote('Túi đầy — còn '+left+' món trong hòm nhận, dọn túi rồi mở lại chợ.');
}
function updBadge(){var n=lastInbox;var b=btn.querySelector('i');b.style.display=n>0?'block':'none';b.textContent=n>9?'9+':n}

async function onClick(e){
  var a=e.target.closest('[data-a]');
  if(!a){var o=e.target.closest('[data-open]');if(o){var id=o.dataset.open;openId=openId===id?0:id;draw()}return}
  var act=a.dataset.a;e.stopPropagation();
  if(!logged()){setNote('Cần đăng nhập ☁ để dùng chợ.');return}
  if(Date.now()-gap<700)return;gap=Date.now();
  if(act==='ref')return load();
  if(act==='prev'){off=Math.max(0,off-20);return load()}
  if(act==='next'){off+=20;return load()}
  try{
    if(act==='buy'){
      var r0=rows.filter(function(r){return String(r.id)===a.dataset.id})[0];if(!r0)return;
      if(BAG.length>=capN()){say('Túi đầy — dọn túi trước khi mua.');return}
      if(!confirm('Mua '+(r0.item.n||'món này')+' với '+nf(r0.price)+' 💎?'))return;
      var r=await call('cho_buy',{p_id:+a.dataset.id});
      say(r.status==='ok'?'✅ Đã mua! Đồ sẽ vào túi.':r.status==='poor'?'Không đủ Linh Thạch.':r.status==='own'?'Đây là món của bạn.':'Món này đã bán / hết hạn.');
      return load();
    }
    if(act==='cancel'){
      var c=await call('cho_cancel',{p_id:+a.dataset.id});
      say(c.status==='ok'?'Đã hủy bán, đồ về túi.':'Không hủy được (đã bán?).');
      return load();
    }
    if(act==='post')return post(+a.dataset.i);
  }catch(er){setNote(nice(er));load()}
}
async function post(i){
  var it=BAG[i];if(!it)return;
  if(mine.length>=CF.max){say('Đã đạt tối đa '+CF.max+' món đang bán.');return}
  var v=prompt('Giá bán '+(it.n||'món này')+' (💎 Linh Thạch, '+nf(CF.minP)+' – '+nf(CF.maxP)+'). Phí '+CF.fee+'% khi bán được:','');
  if(v==null)return;
  var price=Math.floor(Number(String(v).replace(/[.,\s]/g,'')));
  if(!(price>=CF.minP&&price<=CF.maxP)){say('Giá không hợp lệ.');return}
  var mk=Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  it._mk=mk;BAG.splice(i,1);sv_();uiRefresh();            /* rời túi trước, tránh nhân bản */
  var ok=false;
  try{var r=await call('cho_post',{p_item:it,p_price:price,p_name:myName().slice(0,16)});ok=r&&r.status==='ok';
    if(!ok)say(r&&r.status==='full'?'Đã đạt tối đa món đang bán.':'Không đăng được món này.')}
  catch(e){
    setNote(nice(e));
    try{var me=await call('cho_me');ok=!!(me&&me.mine||[]).filter(function(m){return m.item&&m.item._mk===mk}).length}catch(e2){ok=null}
  }
  if(ok===true){say('✅ Đã đăng bán '+(it.n||'món')+' giá '+nf(price)+' 💎')}
  else if(ok===false){delete it._mk;BAG.push(it);sv_();uiRefresh()}   /* chắc chắn chưa đăng → trả lại túi */
  else say('Mất mạng khi đăng — kiểm tra tab "Của tôi"; nếu không thấy, đồ sẽ ở hòm nhận.');
  load();
}
function toggle(v){
  open=v===undefined?!open:v;pnl.style.display=open?'flex':'none';
  if(open){tab=tab||'shop';setNote(logged()?'':'Cần đăng nhập ☁ để dùng chợ.');draw();load()}
}
function boot(){
  build();
  setInterval(function(){
    try{
      var ar=document.getElementById('arena-scene'),on=typeof started!=='undefined'&&started&&!(ar&&ar.classList.contains('on'));
      btn.style.display=on?'flex':'none';
      if(!on&&open)toggle(false);
    }catch(e){}
  },400);
  /* kiểm tra hòm nhận / thông báo bán ngầm (nhẹ, chỉ khi đã đăng nhập) */
  timer=setInterval(function(){if(!open&&logged()&&typeof started!=='undefined'&&started)load()},CF.poll);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

/* API cho các hệ thống khác. get() = số dư gần nhất. Cách kiếm Linh Thạch sẽ thêm sau (RPC riêng phía máy chủ). */
/* ===== 💎 KIẾM LINH THẠCH TỪ BOSS =====
 * Mỗi boss hạ được = 1 viên (boss thường/siêu boss ngoài map, boss Hầm Ngục, Tháp, Ma Thần, Boss Bất Tử mỗi lượt).
 * Tối đa EMAX viên/ngày/tài khoản ☁ — MÁY CHỦ tự cắt trần (cho_linh_thach_boss.sql), ngày tính theo giờ VN.
 * Client gom lô gửi cho_earn; chưa đăng nhập ☁ thì không nhận được. API: LT.earn(n), LT.today(). */
var EMAX=500,earned=0,eDay='',eQ=0,eT=0,eBusy=false,eErr=false,eHint=false,eCapDay='';
function vnDay(){return new Date(Date.now()+25200000).toISOString().slice(0,10)}
function eSay(t,c){try{if(typeof DT!=='undefined'&&typeof P!=='undefined')DT.push({x:P.x,y:215,s:t,c:c||'#8fe9ff',g:1,l:100})}catch(e){}}
function earn(n){
  n=n|0;if(n<=0)return;
  if(!logged()){if(!eHint){eHint=true;eSay('💎 Đăng nhập ☁ để nhận Linh Thạch từ Boss','#ffd98a')}return}
  var d=vnDay();if(eDay!==d){eDay=d;earned=0}
  if(earned+eQ>=EMAX){if(eCapDay!==d){eCapDay=d;eSay('💎 Hôm nay đã đủ '+EMAX+' Linh Thạch','#ffd98a')}return}
  eQ+=n;eSay('💎 +'+n+' Linh Thạch');
  if(eQ>=10)flushE();else{clearTimeout(eT);eT=setTimeout(flushE,4000)}
}
async function flushE(){
  clearTimeout(eT);
  if(eBusy||eQ<=0||!logged())return;
  eBusy=true;eErr=false;var n=Math.min(eQ,50);eQ-=n;
  try{
    var r=await call('cho_earn',{p_n:n});
    if(r&&(r.status==='ok'||r.status==='cap')){earned=+r.today||0;eDay=vnDay();if(r.lt!=null)lt=+r.lt;if(open)draw()}
  }catch(e){eErr=true;eQ=Math.min(eQ+n,100)}
  eBusy=false;
  if(eQ>0)eT=setTimeout(flushE,eErr?15000:(eQ>=10?200:4000));
}
document.addEventListener('visibilitychange',function(){if(document.hidden)flushE()});
try{if(typeof ZC!=='undefined'&&ZC&&typeof ZC.kill==='function'&&!ZC.__ltk){var _zk=ZC.kill;ZC.kill=function(e){try{if(e&&e.b>=2)earn(1)}catch(x){}return _zk.apply(this,arguments)};ZC.__ltk=1}}catch(e){}
/* ===== TIÊU / ĐỌC SỐ DƯ LINH THẠCH (cho các hệ thống khác, vd. đột phá Linh Căn) ===== */
async function spend(n,why){
  n=n|0;if(n<=0)return{ok:true,lt:lt};
  if(!logged())return{ok:false,err:'login'};
  try{
    var r=await call('cho_spend',{p_n:n,p_why:why||''});
    if(r&&r.status==='ok'){lt=+r.lt||0;if(open)draw();return{ok:true,lt:lt}}
    if(r&&r.status==='poor'){if(r.lt!=null)lt=+r.lt||0;return{ok:false,err:'poor',lt:lt}}
    return{ok:false,err:(r&&r.status)||'fail'};
  }catch(e){return{ok:false,err:'net',msg:nice(e)}}
}
async function sync(){
  if(!logged())return;
  try{var r=await call('cho_bal');if(r&&r.status==='ok'){lt=+r.lt||0;if(r.earned!=null){earned=+r.earned||0;eDay=vnDay()}if(open)draw()}}catch(e){}
}
/* Linh Thạch từ boss Kiếm Thánh: KHÔNG giới hạn ngày (RPC cho_earn_ks, file cho_kiem_thanh.sql) */
var ksQ=0,ksBusy=false,ksT=0;
async function flushKS(){
  clearTimeout(ksT);
  if(ksBusy||ksQ<=0||!logged())return;
  ksBusy=true;var n=Math.min(ksQ,20);ksQ-=n;
  try{var r=await call('cho_earn_ks',{p_n:n});if(r&&r.status==='ok'&&r.lt!=null){lt=+r.lt;if(open)draw()}}
  catch(e){ksQ=Math.min(ksQ+n,100)}
  ksBusy=false;
  if(ksQ>0)ksT=setTimeout(flushKS,3000);
}
function earnKS(n){
  n=n|0;if(n<=0)return;
  if(!logged()){eSay('💎 Đăng nhập ☁ để nhận Linh Thạch từ Kiếm Thánh','#ffd98a');return}
  ksQ+=n;eSay('💎 +'+n+' Linh Thạch (Kiếm Thánh)');flushKS();
}
window.LT={earnKS:earnKS,get:function(){return lt==null?0:lt},refresh:load,open:function(){toggle(true)},close:function(){toggle(false)},earn:earn,today:function(){return earned},logged:logged,spend:spend,sync:sync};
})();
