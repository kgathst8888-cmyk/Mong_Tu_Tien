/* ===== 🎉💳🪪 SỰ KIỆN · BẢNG GIÁ NẠP · THẺ TRƯỞNG THÀNH (ui/82-su-kien-nap-the.js) =====
 * 1 nút tròn 🎉 "Sự kiện" ở hàng trái màn hình (left:238px, sau 🛡 Admin) → mở bảng có 3 tab:
 *  🎉 SỰ KIỆN
 *     - 📅 Điểm Danh 7 Ngày: mỗi ngày (giờ VN) nhận 1 phần, đủ 7 ngày thì quay lại ngày 1. CFG.ck.
 *     - ⏱ Quà Online: cộng dồn phút online trong ngày (reset 0h VN), đạt mốc nào nhận mốc đó. CFG.ol.
 *     - Sự kiện giới hạn thời gian: thêm 1 dòng vào CFG.events (from/to = ngày VN, mỗi nhân vật nhận 1 lần). Hết hạn tự khoá.
 *  💳 BẢNG GIÁ NẠP: 20.000đ = 200💎 KHÔNG KHOÁ, tuyến tính (100đ = 1💎, không tặng thêm) đến 1.000.000đ = 10.000💎; hướng dẫn nạp + bảng "💎 mua được gì" lấy từ Cash Shop.
 *     💎 KHÔNG KHOÁ (nạp) dùng được ở Chợ Online; 🔒 Linh Thạch KHOÁ (kiếm từ đánh Boss) thì không (xem linh_thach_khoa.sql).
 *     Game KHÔNG có cổng thanh toán: người chơi chuyển khoản → admin cộng 💎 bằng 🛡 Admin → 👤 Tài khoản → Cộng Linh Thạch (= không khoá).
 *     Điền thông tin nhận tiền vào CFG.pay (để trống thì bảng hiện "liên hệ Admin").
 *  🪪 THẺ TRƯỞNG THÀNH: mốc cấp độ 10→100. Đường THƯỜNG miễn phí; mua 🪪 Thẻ bằng 2.000💎 KHÔNG KHOÁ (LT.spend {unlocked:true}, không dùng Linh Thạch khoá) để mở thêm đường THẺ
 *     (quà to hơn). Đủ cấp nhân vật là nhận được — nhận trực tiếp vào túi/ví/kho Cash Shop, không qua thư. CFG.gc.
 * Trạng thái lưu theo nhân vật: PS[cur].evt = {ck:{n,d}, ol:{d,s,c:[]}, one:{id:1}, gc:{on,f:{lv:1},c:{lv:1}}} (đi cùng save / cloud save).
 * Quà hỗ trợ: gold · csh:{b10,b15,b20,ham,g10,dh,vx,vt,x5,x7,tc} · fe · hk · eq:{r:0-5,n} · gm:{cấp:số viên} (🪨 Đá Khảm CHƯA MÀI vào kho đá, equipment/64). KHÔNG có Linh Thạch (ví nằm trên máy chủ, chỉ admin cộng được).
 * Quà Thẻ hiện KHÔNG có trang bị: mỗi mốc đường Thẻ tặng 1 Đá Khảm chưa mài (Lv10-30 cấp 1 · Lv40-70 cấp 2 · Lv80-100 cấp 3).
 * Lưu ý: ngày/giờ lấy từ đồng hồ máy người chơi (game chạy phía máy) — như các module khác, không chống chỉnh giờ.
 * API: EVT.show(tab) · EVT.close() · EVT.badge() (số mục đang nhận được) · EVT.cfg
 * Phụ thuộc (thiếu thì mục đó tự tắt): PS, cur, BAG, gold, gen, capN, P, RC, RN, CSH (63), MN (13), LT (32), sv, ui, DT. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof BAG==='undefined'||typeof gen!=='function')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';

/* ====================== CẤU HÌNH (chỉnh ở đây) ====================== */
var CFG={
  /* 📅 Điểm danh: 7 phần quà theo thứ tự ngày 1..7 */
  ck:[
    {gold:200000},
    {gold:300000,csh:{b10:1}},
    {gold:400000,fe:20},
    {gold:500000,csh:{vx:1}},
    {gold:600000,csh:{vt:1},hk:20},
    {gold:800000,csh:{b15:1}},
    {gold:1500000,csh:{b10:2,vx:1,vt:1},eq:{r:2,n:1}}],
  /* ⏱ Quà online (m = số phút online trong ngày) */
  ol:[
    {m:15,q:{gold:100000}},
    {m:30,q:{gold:200000,fe:10}},
    {m:60,q:{gold:400000,csh:{b10:1}}},
    {m:120,q:{gold:800000,csh:{vx:1,vt:1}}}],
  /* 🎊 Sự kiện giới hạn thời gian. id KHÔNG được trùng. from/to dạng 'YYYY-MM-DD' (giờ VN, to = hết ngày đó). Thêm dòng mới lên ĐẦU mảng. */
  events:[
    {id:'ev_khai_mo',ico:'🎊',n:'Mừng Server Khai Mở',from:'2026-10-17',to:'2026-11-17',
     d:'Quà tri ân đạo hữu đồng hành từ những ngày đầu. Mỗi nhân vật nhận 1 lần.',
     q:{gold:5000000,csh:{b10:3,vx:2,vt:2},eq:{r:2,n:1}}},
    {id:'ev_dai_hoi',ico:'🏮',n:'Đại Hội Linh Vân',from:'2026-11-18',to:'2026-11-30',
     d:'Sắp diễn ra — quà sẽ mở nhận khi đến ngày.',
     q:{gold:8000000,csh:{b15:2,ham:3},eq:{r:3,n:1}}}],
  /* 💳 Bảng giá nạp: vnd = số tiền · lt = 💎 KHÔNG KHOÁ nhận được. Tỉ lệ 20.000đ = 200💎 (100đ = 1💎), nhân lên đến 1.000.000đ. */
  pk:[
    {vnd:20000,lt:200},
    {vnd:50000,lt:500},
    {vnd:100000,lt:1000},
    {vnd:200000,lt:2000},
    {vnd:500000,lt:5000},
    {vnd:1000000,lt:10000}],
  /* Thông tin nhận tiền — ĐIỀN VÀO, để '' thì bảng hiện "liên hệ Admin" */
  pay:{bank:'',acc:'',name:'',contact:'',note:'Nội dung chuyển khoản: email đăng nhập game của bạn + tên nhân vật.'},
  /* 🪪 Thẻ Trưởng Thành */
  gc:{
    price:2000,            /* 💎 KHÔNG KHOÁ mua thẻ (không trừ Linh Thạch khoá) */
    name:'Thẻ Trưởng Thành',
    tiers:[                /* lv = cấp nhân vật cần đạt · f = quà đường THƯỜNG (miễn phí) · c = quà đường THẺ · gm:{cấp:số viên} = Đá Khảm chưa mài */
      {lv:10, f:{gold:100000},                 c:{gold:500000,csh:{b10:3},gm:{1:1}}},
      {lv:20, f:{gold:300000},                 c:{gold:2000000,csh:{b10:5,vx:2},gm:{1:1}}},
      {lv:30, f:{gold:500000},                 c:{gold:3000000,csh:{vt:2},gm:{1:1}}},
      {lv:40, f:{gold:800000,csh:{b10:1}},     c:{gold:5000000,csh:{b15:3,ham:3},gm:{2:1}}},
      {lv:50, f:{gold:1200000},                c:{gold:8000000,csh:{vx:3,vt:3},gm:{2:1}}},
      {lv:60, f:{gold:1800000,fe:30},          c:{gold:12000000,csh:{b20:2,g10:3},fe:100,gm:{2:1}}},
      {lv:70, f:{gold:2500000},                c:{gold:15000000,hk:100,gm:{2:1}}},
      {lv:80, f:{gold:3500000,csh:{b10:2}},    c:{gold:20000000,csh:{b20:3},gm:{3:1}}},
      {lv:90, f:{gold:5000000},                c:{gold:30000000,csh:{b20:5,vx:5,vt:5},gm:{3:1}}},
      {lv:100,f:{gold:8000000,csh:{b10:3}},    c:{gold:50000000,csh:{x7:10},gm:{3:1}}}]
  }
};

/* ====================== TIỆN ÍCH ====================== */
var DAYMS=864e5;
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function vnDay(){return new Date(Date.now()+25200000).toISOString().slice(0,10)}
function vnStart(s){return Date.parse(s+'T00:00:00+07:00')}
function vnEnd(s){return Date.parse(s+'T00:00:00+07:00')+DAYMS-1}
function me(){try{return PS[cur]||null}catch(e){return null}}
function started_(){try{return !!started}catch(e){return false}}
function lv(){try{return P.lv|0}catch(e){return 0}}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function save(){try{sv()}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ltLogged(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function unl(){try{return LT.unlocked?LT.unlocked():LT.get()}catch(e){return 0}}
function lkd(){try{return LT.locked?LT.locked():0}catch(e){return 0}}
function E(){
  var p=me();if(!p)return null;
  var e=p.evt||(p.evt={});
  if(!e.ck)e.ck={n:0,d:''};
  if(!e.ol)e.ol={d:'',s:0,c:[]};
  if(!e.one)e.one={};
  if(!e.gc)e.gc={on:0,f:{},c:{}};
  return e}
function nm(k){try{var o=CSH.cfg.lt.filter(function(x){return x.k===k})[0];if(o)return o.e+' '+o.n}catch(e){}return k}
function desc(q){
  var a=[];
  if(q.gold)a.push('💰 '+nf(q.gold));
  if(q.csh)Object.keys(q.csh).forEach(function(k){a.push(nm(k)+' ×'+q.csh[k])});
  if(q.fe)a.push('🔩 Quặng Sắt ×'+q.fe);
  if(q.hk)a.push('🌑 Huyền Kim ×'+q.hk);
  if(q.gm)Object.keys(q.gm).forEach(function(l){a.push('🪨 Đá Khảm cấp '+l+' chưa mài ×'+q.gm[l])});
  if(q.eq){var r=q.eq.r|0,c='#ffe9a0',n='';try{c=RC[r];n=RN[r]}catch(e){}a.push('🎁 Trang bị <span style="color:'+c+'">'+esc(n)+'</span> ×'+q.eq.n)}
  return a.join(' · ')}
function merge(list){
  var o={gold:0,csh:{},fe:0,hk:0,eq:{},gm:{}};
  list.forEach(function(q){
    o.gold+=q.gold|0;o.fe+=q.fe|0;o.hk+=q.hk|0;
    if(q.csh)Object.keys(q.csh).forEach(function(k){o.csh[k]=(o.csh[k]|0)+q.csh[k]});
    if(q.gm)Object.keys(q.gm).forEach(function(l){o.gm[l]=(o.gm[l]|0)+q.gm[l]});
    if(q.eq){var r=q.eq.r|0;o.eq[r]=(o.eq[r]|0)+q.eq.n}});
  return o}
/* cộng quà (đã gộp) — trả '' nếu OK, hoặc câu báo lỗi (chưa cộng gì) */
function grant(list){
  var p=me();if(!p)return'Chưa chọn nhân vật.';
  var m=merge(list),eqN=0;
  Object.keys(m.eq).forEach(function(r){eqN+=m.eq[r]});
  if(Object.keys(m.csh).length&&!window.CSH)return'Chưa có Cash Shop để nhận vật phẩm.';
  if((m.fe||m.hk)&&!(typeof MN!=='undefined'&&MN.get))return'Chưa có kho quặng để nhận quặng.';
  if(Object.keys(m.gm).length&&!(window.GEMX&&GEMX.add))return'Chưa có kho Đá Khảm để nhận đá.';
  if(eqN){
    var cap=90;try{cap=capN()}catch(e){}
    if(BAG.length+eqN>cap)return'🎒 Túi không đủ chỗ cho '+eqN+' trang bị — dọn túi rồi nhận lại.'}
  try{
    if(m.gold)gold+=m.gold;
    if(Object.keys(m.csh).length){var d=p.csh||(p.csh={});Object.keys(m.csh).forEach(function(k){d[k]=(d[k]|0)+m.csh[k]})}
    if(m.fe)MN.get().fe+=m.fe;
    if(m.hk)MN.get().hk+=m.hk;
    Object.keys(m.gm).forEach(function(l){GEMX.add(m.gm[l],+l)});
    Object.keys(m.eq).forEach(function(r){for(var i=0;i<m.eq[r];i++)BAG.push(gen(lv(),+r))})
  }catch(e){return'Lỗi khi nhận quà, thử lại.'}
  return''}

/* ====================== TRẠNG THÁI SỰ KIỆN ====================== */
function ckState(){var e=E();if(!e)return{can:false,n:0};return{can:e.ck.d!==vnDay(),n:e.ck.n|0}}
function olSecs(){var e=E();if(!e)return 0;if(e.ol.d!==vnDay())return 0;return e.ol.s|0}
function olReady(i){var e=E();if(!e)return false;var t=CFG.ol[i];return olSecs()>=t.m*60&&!(e.ol.d===vnDay()&&e.ol.c.indexOf(i)>=0)}
function olDone(i){var e=E();return !!(e&&e.ol.d===vnDay()&&e.ol.c.indexOf(i)>=0)}
function evSt(ev){var now=Date.now();return now<vnStart(ev.from)?'soon':now>vnEnd(ev.to)?'end':'on'}
function badge(){
  var e=E();if(!e)return 0;var n=0;
  if(ckState().can)n++;
  CFG.ol.forEach(function(t,i){if(olReady(i))n++});
  CFG.events.forEach(function(ev){if(evSt(ev)==='on'&&!e.one[ev.id])n++});
  CFG.gc.tiers.forEach(function(t){
    if(lv()>=t.lv){if(!e.gc.f[t.lv])n++;if(e.gc.on&&!e.gc.c[t.lv])n++}});
  return n}

/* đếm phút online (tính cả khi chuyển cảnh; dừng khi tab ẩn) */
var lastTick=Date.now(),lastSave=Date.now();
setInterval(function(){try{
  var now=Date.now(),dt=Math.min(30,Math.max(0,(now-lastTick)/1000));lastTick=now;
  if(!started_()||document.hidden)return;
  var e=E();if(!e)return;
  var d=vnDay();if(e.ol.d!==d){e.ol.d=d;e.ol.s=0;e.ol.c=[]}
  e.ol.s+=dt;
  if(now-lastSave>60000){lastSave=now;save()}
}catch(x){}},5000);

/* ====================== NHẬN QUÀ ====================== */
var note='',tab='sk',busy=false,open=false,el=null;
function claimCk(){
  var e=E(),s=ckState();if(!e||!s.can)return;
  var q=CFG.ck[s.n%CFG.ck.length],err=grant([q]);
  if(err){note=err;render();return}
  e.ck.d=vnDay();e.ck.n=(s.n+1)>=CFG.ck.length?0:s.n+1;
  note='✅ Điểm danh ngày '+(s.n+1)+': '+desc(q);say('📅 Điểm danh +','#9fffb0');save();try{ui()}catch(x){}render()}
function claimOl(i){
  var e=E();if(!e||!olReady(i))return;
  var q=CFG.ol[i].q,err=grant([q]);
  if(err){note=err;render();return}
  e.ol.c.push(i);
  note='✅ Quà online '+CFG.ol[i].m+' phút: '+desc(q);say('⏱ Quà online','#9fffb0');save();try{ui()}catch(x){}render()}
function claimEv(id){
  var e=E(),ev=CFG.events.filter(function(x){return x.id===id})[0];
  if(!e||!ev||evSt(ev)!=='on'||e.one[id])return;
  var err=grant([ev.q]);
  if(err){note=err;render();return}
  e.one[id]=1;note='✅ '+ev.n+': '+desc(ev.q);say(ev.ico+' '+ev.n,'#ffe9a0');save();try{ui()}catch(x){}render()}

/* ====================== THẺ TRƯỞNG THÀNH ====================== */
function gcClaim(track,l){
  var e=E(),t=CFG.gc.tiers.filter(function(x){return x.lv===l})[0];
  if(!e||!t||lv()<l)return;
  var key=track==='c'?'c':'f';
  if(key==='c'&&!e.gc.on)return;
  if(e.gc[key][l])return;
  var q=t[key],err=grant([q]);
  if(err){note=err;render();return}
  e.gc[key][l]=1;note='✅ '+(key==='c'?'🪪 Thẻ':'Thường')+' Lv'+l+': '+desc(q);say('🪪 Lv'+l,'#9fe8ff');save();try{ui()}catch(x){}render()}
function gcAll(){
  var e=E();if(!e)return;
  var list=[],keys=[];
  CFG.gc.tiers.forEach(function(t){
    if(lv()<t.lv)return;
    if(!e.gc.f[t.lv]){list.push(t.f);keys.push(['f',t.lv])}
    if(e.gc.on&&!e.gc.c[t.lv]){list.push(t.c);keys.push(['c',t.lv])}});
  if(!list.length){note='Chưa có mốc nào để nhận.';render();return}
  var err=grant(list);
  if(err){note=err;render();return}
  keys.forEach(function(k){e.gc[k[0]][k[1]]=1});
  note='✅ Đã nhận '+list.length+' phần quà Thẻ Trưởng Thành.';say('🪪 Nhận tất cả','#9fe8ff');save();try{ui()}catch(x){}render()}
function gcBuy(){
  var e=E();if(!e||e.gc.on||busy)return;
  if(!ltLogged()){note='☁ Cần đăng nhập tài khoản để dùng Linh Thạch.';render();return}
  var who=me(),pr=CFG.gc.price;
  busy=true;note='Đang trừ '+nf(pr)+'💎 không khoá…';render();
  LT.spend(pr,'gcard',{unlocked:true}).then(function(r){
    busy=false;
    if(!r||!r.ok){note=r&&r.err==='poor'?'Không đủ 💎 KHÔNG KHOÁ: cần '+nf(pr)+'💎, bạn có '+nf(r.lt|0)+'💎 không khoá. (Linh Thạch 🔒 khoá kiếm từ Boss không dùng để mua thẻ.)':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+')';render();return}
    if(who&&who.evt&&who.evt.gc)who.evt.gc.on=1;
    note='✅ Đã mở '+CFG.gc.name+' (−'+nf(pr)+'💎 không khoá). Các mốc đã đạt nhận được ngay!';say('🪪 Mở Thẻ','#9fe8ff');save();try{ui()}catch(x){}render()
  }).catch(function(){busy=false;note='Không trừ được Linh Thạch (lỗi mạng)';render()})}

/* ====================== GIAO DIỆN ====================== */
function mk(){
  var st=document.createElement('style');
  st.textContent=
  '#evt-b{position:fixed;top:calc(132px + env(safe-area-inset-top,0px));left:238px;width:40px;height:40px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);color:#fff;font-size:18px;display:none;align-items:center;justify-content:center;z-index:3;padding:0;box-shadow:0 2px 8px #0008}'
  +'#evt-b::after{content:"Sự kiện";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 9px/10px '+FONT+';color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}'
  +'#evt-b i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#e33;color:#fff;font:700 10px/16px sans-serif;text-align:center;font-style:normal;display:none;padding:0 3px;box-sizing:border-box}'
  +'#evt{display:none;position:fixed;z-index:12;background:linear-gradient(#2a2118,#0e0a08);color:#f2e3b3;font-family:'+FONT+';box-sizing:border-box;flex-direction:column;padding-bottom:env(safe-area-inset-bottom,0px)}'
  +'#evt.pt{left:0;right:0;bottom:0;top:18%;border-top:2px solid #b8964e}#evt.ls{top:0;bottom:0;right:0;width:min(440px,100%);border-left:2px solid #b8964e}'
  +'#evt .eh{display:flex;justify-content:space-between;align-items:center;padding:8px 10px 4px;font-size:16px;font-weight:bold}'
  +'#evt .et{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:0 10px 6px}'
  +'#evt button{font:inherit;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:5px 9px;cursor:pointer;touch-action:manipulation}#evt button:disabled{opacity:.45}'
  +'#evt .et button{font-size:12px;padding:6px 2px}#evt .et button.on{background:linear-gradient(#2e6fb8,#1b4478);border-color:#8fd0ff;color:#fff}#evt .et i{background:#e33;color:#fff;border-radius:8px;font:700 10px/14px sans-serif;padding:0 4px;margin-left:3px;font-style:normal}'
  +'#evt .eb{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:2px 10px 14px}'
  +'#evt .es{font-size:13px;font-weight:bold;color:#ffd76a;margin:8px 0 4px}'
  +'#evt .er{display:flex;align-items:center;gap:8px;border:1px solid #5a4a30;border-radius:8px;padding:7px 8px;margin-bottom:5px;background:#0006}'
  +'#evt .er.ok{border-color:#7affb0}#evt .er.dn{opacity:.55}'
  +'#evt .ei{font-size:22px;width:28px;text-align:center}#evt .ex{flex:1;min-width:0;font-size:13px}#evt .ex small{display:block;opacity:.8;font-size:11px;line-height:1.3}#evt .er button{white-space:nowrap;font-size:12px}'
  +'#evt .en{font-size:12px;color:#ffd98a;margin:6px 0;line-height:1.4}#evt .nt{border:1px dashed #c9a24f;border-radius:8px;padding:6px 8px;margin:6px 0;font-size:12px;background:#0008;line-height:1.45}'
  +'#evt .ck{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:6px}'
  +'#evt .ck div{border:1px solid #5a4a30;border-radius:6px;text-align:center;font-size:10px;padding:4px 1px;background:#0006;line-height:1.3}#evt .ck div.dn{opacity:.5;border-color:#3a6a48}#evt .ck div.nx{border-color:#7affb0;box-shadow:0 0 6px #7affb0}'
  +'#evt table{width:100%;border-collapse:collapse;font-size:12px}#evt th,#evt td{border:1px solid #4a3c28;padding:5px 4px;text-align:center}#evt th{background:#3a2c18;color:#ffd76a}#evt td.l{text-align:left}'
  +'#evt .gt{display:grid;grid-template-columns:40px 1fr 1fr;gap:4px;margin-bottom:4px;align-items:stretch}'
  +'#evt .gt>div{border:1px solid #4a3c28;border-radius:6px;padding:4px 5px;font-size:11px;line-height:1.35;background:#0006;display:flex;flex-direction:column;justify-content:space-between;gap:3px}'
  +'#evt .gt .lv{align-items:center;justify-content:center;font-weight:bold;color:#ffd76a;font-size:13px}#evt .gt .cd{border-color:#6aa8ff}#evt .gt .dn{opacity:.5}#evt .gt button{font-size:11px;padding:3px 4px}';
  document.head.appendChild(st);
  var b=document.createElement('button');b.id='evt-b';b.type='button';b.textContent='🎉';b.title='Sự kiện · Bảng giá nạp · Thẻ Trưởng Thành';
  b.innerHTML='🎉<i></i>';
  b.onpointerdown=function(e){e.stopPropagation()};
  b.onclick=function(e){e.stopPropagation();show()};
  document.body.appendChild(b);
  el=document.createElement('div');el.id='evt';
  el.addEventListener('pointerdown',function(e){e.stopPropagation()});
  document.body.appendChild(el)}

function secTxt(s){var m=Math.floor(s/60);return m+' phút'}
function tabSk(){
  var e=E(),h='',s=ckState(),i;
  h+='<div class="es">📅 Điểm Danh 7 Ngày</div><div class="ck">';
  for(i=0;i<CFG.ck.length;i++){
    var done=i<s.n||(i===s.n&&!s.can&&false),nx=i===s.n&&s.can;
    h+='<div class="'+(i<s.n?'dn':nx?'nx':'')+'">Ngày '+(i+1)+'<br>'+(i<s.n?'✔':'🎁')+'</div>'}
  h+='</div>';
  var q=CFG.ck[s.n%CFG.ck.length];
  h+='<div class="er'+(s.can?' ok':'')+'"><div class="ei">📅</div><div class="ex"><b>Ngày '+(s.n+1)+'</b><small>'+desc(q)+'</small></div><button '+(s.can?'':'disabled ')+'onclick="EVT.ck()">'+(s.can?'Điểm danh':'Đã nhận hôm nay')+'</button></div>';
  h+='<div class="es">⏱ Quà Online hôm nay <span style="font-weight:normal;color:#9fd8ff">('+secTxt(olSecs())+')</span></div>';
  CFG.ol.forEach(function(t,i){
    var rd=olReady(i),dn=olDone(i);
    h+='<div class="er'+(rd?' ok':dn?' dn':'')+'"><div class="ei">⏱</div><div class="ex"><b>Online '+t.m+' phút</b><small>'+desc(t.q)+'</small></div><button '+(rd?'':'disabled ')+'onclick="EVT.ol('+i+')">'+(dn?'Đã nhận':rd?'Nhận':Math.max(0,t.m-Math.floor(olSecs()/60))+'p nữa')+'</button></div>'});
  h+='<div class="es">🎊 Sự kiện giới hạn</div>';
  if(!CFG.events.length)h+='<div class="en">Chưa có sự kiện nào.</div>';
  CFG.events.forEach(function(ev){
    var st=evSt(ev),got=e&&e.one[ev.id],lb=st==='soon'?'Từ '+ev.from.split('-').reverse().join('/'):st==='end'?'Đã kết thúc':got?'Đã nhận':'Nhận quà';
    h+='<div class="er'+(st==='on'&&!got?' ok':' dn')+'"><div class="ei">'+ev.ico+'</div><div class="ex"><b>'+esc(ev.n)+'</b><small>'+esc(ev.d)+'<br>🕒 '+ev.from.split('-').reverse().join('/')+' → '+ev.to.split('-').reverse().join('/')+'<br>'+desc(ev.q)+'</small></div><button '+(st==='on'&&!got?'':'disabled ')+'onclick="EVT.ev(\''+ev.id+'\')">'+lb+'</button></div>'});
  h+='<div class="en">Điểm danh và quà online reset lúc 0h (giờ Việt Nam). Quà trang bị cần chỗ trống trong túi.</div>';
  return h}
function tabNap(){
  var h='<div class="es">💳 Bảng giá nạp Linh Thạch</div><table><tr><th>Gói</th><th>Số tiền</th><th>💎 Không khoá</th></tr>';
  CFG.pk.forEach(function(p,i){
    h+='<tr><td>'+(i+1)+'</td><td><b>'+nf(p.vnd)+'đ</b></td><td>💎 '+nf(p.lt)+'</td></tr>'});
  h+='</table><div class="en">Tỉ lệ cố định: 100đ = 1💎 (20.000đ = 200💎).</div>'
   +'<div class="nt">💎 <b>Không khoá</b> (nạp tiền, tiền bán đồ ở Chợ): dùng được ở <b>Chợ Online</b>, mua Thẻ Trưởng Thành và mọi Shop.<br>🔒 <b>Khoá</b> (kiếm từ đánh Boss): <b>riêng từng nhân vật</b> — nhân vật nào kiếm thì nhân vật đó dùng; chỉ mua đồ trong game (Shop, đột phá…), <b>không dùng ở Chợ Online</b>, không mua được Thẻ. Khi mua đồ, trừ Linh Thạch khoá của nhân vật đó trước.<br>💎 <b>Không khoá</b>: <b>dùng chung</b> cả 3 nhân vật của tài khoản.</div>';
  var py=CFG.pay,has=py.bank||py.acc||py.contact;
  h+='<div class="es">📝 Cách nạp</div><div class="nt">1) Chuyển khoản đúng số tiền của gói.<br>2) '+esc(py.note||'Ghi rõ email đăng nhập + tên nhân vật.')+'<br>3) Admin kiểm tra và cộng 💎 KHÔNG KHOÁ vào ví tài khoản ☁ (thường trong ít phút). Mở 🎉 hoặc 🛒 Shop để xem số dư.</div>';
  if(has){
    h+='<div class="nt">'+(py.bank?'🏦 <b>'+esc(py.bank)+'</b><br>':'')+(py.acc?'Số TK: <b>'+esc(py.acc)+'</b><br>':'')+(py.name?'Chủ TK: <b>'+esc(py.name)+'</b><br>':'')+(py.contact?'💬 Liên hệ: <b>'+esc(py.contact)+'</b>':'')+'</div>'}
  else h+='<div class="nt" style="border-color:#ff9a6a">⚠ Chưa cấu hình thông tin nhận tiền — hãy liên hệ Admin để nạp.</div>';
  h+='<div class="es">💎 Linh Thạch dùng để làm gì?</div>';
  var rows=[];try{rows=CSH.cfg.lt}catch(e){}
  rows.forEach(function(o){h+='<div class="er"><div class="ei">'+o.e+'</div><div class="ex"><b>'+esc(o.n)+'</b><small>'+esc(o.d)+'</small></div><b style="white-space:nowrap">'+nf(o.p)+'💎</b></div>'});
  h+='<div class="er"><div class="ei">🪪</div><div class="ex"><b>'+esc(CFG.gc.name)+'</b><small>Mở đường quà THẺ ở 10 mốc cấp độ (tab 🪪)</small></div><b style="white-space:nowrap">'+nf(CFG.gc.price)+'💎<br><small>không khoá</small></b></div>';
  h+='<div class="en">Linh Thạch gắn với tài khoản ☁, không chuyển nhượng ngoài game. Nạp xong không hoàn lại.</div>';
  return h}
function tabThe(){
  var e=E(),g=e.gc,L=lv(),n=0,h='';
  CFG.gc.tiers.forEach(function(t){if(L>=t.lv){if(!g.f[t.lv])n++;if(g.on&&!g.c[t.lv])n++}});
  h+='<div class="er'+(g.on?' ok':'')+'"><div class="ei">🪪</div><div class="ex"><b>'+esc(CFG.gc.name)+'</b> '+(g.on?'<span style="color:#7affb0">(đã mở)</span>':'')+'<small>Cấp hiện tại: <b>Lv'+L+'</b>. Đạt mốc cấp độ → nhận quà. Đường 🪪 THẺ có quà lớn hơn nhiều so với đường Thường.</small></div>'
   +(g.on?'':'<button '+(busy||!ltLogged()||unl()<CFG.gc.price?'disabled ':'')+'onclick="EVT.buy()">'+nf(CFG.gc.price)+'💎<br>Mở thẻ</button>')+'</div>';
  if(!g.on)h+='<div class="en">'+(ltLogged()?'Thẻ cần '+nf(CFG.gc.price)+'💎 <b>KHÔNG KHOÁ</b> (bạn có '+nf(unl())+'💎). Linh Thạch 🔒 khoá kiếm từ Boss không dùng để mua thẻ.':'☁ Cần đăng nhập tài khoản để mua thẻ bằng Linh Thạch.')+'</div>';
  h+='<div style="margin:4px 0 6px"><button '+(n?'':'disabled ')+'onclick="EVT.all()">🎁 Nhận tất cả ('+n+')</button></div>';
  h+='<div class="gt" style="font-size:11px;font-weight:bold;color:#ffd76a"><div style="border:0;background:none">Cấp</div><div style="border:0;background:none">Thường (miễn phí)</div><div style="border:0;background:none">🪪 Thẻ</div></div>';
  CFG.gc.tiers.forEach(function(t){
    var ok=L>=t.lv,fd=g.f[t.lv],cd=g.c[t.lv];
    h+='<div class="gt"><div class="lv">Lv<br>'+t.lv+'</div>'
     +'<div class="'+(fd?'dn':'')+'"><span>'+desc(t.f)+'</span><button '+(ok&&!fd?'':'disabled ')+'onclick="EVT.gc(\'f\','+t.lv+')">'+(fd?'Đã nhận':ok?'Nhận':'Chưa đủ cấp')+'</button></div>'
     +'<div class="cd '+(cd?'dn':'')+'"><span>'+desc(t.c)+'</span><button '+(ok&&g.on&&!cd?'':'disabled ')+'onclick="EVT.gc(\'c\','+t.lv+')">'+(cd?'Đã nhận':!g.on?'🔒 Cần thẻ':ok?'Nhận':'Chưa đủ cấp')+'</button></div></div>'});
  h+='<div class="en">Thẻ gắn với từng nhân vật. Mốc Lv40/60/100 cần chuyển chức để đạt được cấp đó. Mua thẻ khi đã vượt mốc vẫn nhận bù được.</div>';
  return h}
function render(){
  if(!el)return;
  try{el.className=PORT?'pt':'ls'}catch(e){el.className='pt'}
  var b=badge(),bb=function(t,n){return n>0?'<i>'+n+'</i>':''};
  var e=E(),skN=0,thN=0;
  if(e){if(ckState().can)skN++;CFG.ol.forEach(function(t,i){if(olReady(i))skN++});CFG.events.forEach(function(ev){if(evSt(ev)==='on'&&!e.one[ev.id])skN++});
    CFG.gc.tiers.forEach(function(t){if(lv()>=t.lv){if(!e.gc.f[t.lv])thN++;if(e.gc.on&&!e.gc.c[t.lv])thN++}})}
  var lt=ltLogged()?unl():0,lk=ltLogged()?lkd():0;
  var h='<div class="eh"><span>🎉 Sự Kiện & Nạp Thẻ</span><button onclick="EVT.close()">✕</button></div>'
   +'<div class="en" style="margin:0 10px 4px">💎 '+nf(lt)+' không khoá (dùng chung) · 🔒 '+nf(lk)+' khoá (nhân vật này) · 💰 '+nf(Math.floor(gold))+' vàng</div>'
   +'<div class="et"><button class="'+(tab==='sk'?'on':'')+'" onclick="EVT.tab(\'sk\')">🎉 Sự kiện'+bb('',skN)+'</button><button class="'+(tab==='nap'?'on':'')+'" onclick="EVT.tab(\'nap\')">💳 Bảng giá nạp</button><button class="'+(tab==='the'?'on':'')+'" onclick="EVT.tab(\'the\')">🪪 Thẻ'+bb('',thN)+'</button></div>'
   +'<div class="eb">'+(note?'<div class="nt">'+note+'</div>':'')+(!e?'<div class="en">Chưa chọn nhân vật.</div>':tab==='sk'?tabSk():tab==='nap'?tabNap():tabThe())+'</div>';
  el.innerHTML=h}
function show(t){
  if(!el)mk();
  open=true;note='';if(t==='sk'||t==='nap'||t==='the')tab=t;
  el.style.display='flex';render();
  try{if(window.LT&&LT.sync)LT.sync().then(function(){if(open)render()})}catch(x){}}
function close(){open=false;note='';if(el)el.style.display='none'}
function setTab(t){tab=t;note='';render();var b=el&&el.querySelector('.eb');if(b)b.scrollTop=0}

/* hiện nút + chấm đỏ */
mk();
setInterval(function(){try{
  var b=document.getElementById('evt-b');if(!b)return;
  var ar=document.getElementById('arena-scene'),on=started_()&&!(ar&&ar.classList.contains('on'));
  b.style.display=on?'flex':'none';
  if(!on&&open)close();
  if(on){var n=badge(),i=b.querySelector('i'),t=n>9?'9+':String(n);if(i){if(i.textContent!==t)i.textContent=t;i.style.display=n>0?'block':'none'}}
  if(open&&tab==='sk'&&Date.now()%15000<1000)render()
}catch(x){}},1000);

window.EVT={show:show,close:close,tab:setTab,ck:claimCk,ol:claimOl,ev:claimEv,gc:gcClaim,all:gcAll,buy:gcBuy,badge:badge,cfg:CFG};
})();
