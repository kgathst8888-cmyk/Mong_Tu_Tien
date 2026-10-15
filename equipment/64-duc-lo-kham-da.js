/* ===== 🔨 ĐỤC LỖ TRANG BỊ & 💎 KHẢM ĐÁ (equipment/64-duc-lo-kham-da.js) =====
 * Module riêng, KHÔNG sửa engine. Nạp SAU ui/63-cash-shop.js (cần CSH) và world/62-thanh-dia.js (bọc drop).
 *
 * ĐỤC LỖ (mở món đồ trong túi/đang mặc → khối "💎 Lỗ khảm" dưới nút hành động):
 *   Tối đa 2 lỗ/món. Lỗ 1: 1 🔨 Búa + 10.000.000💰 + 20💎 · Lỗ 2: 3 🔨 Búa + 30.000.000💰 + 60💎 (x3 so với lỗ trước).
 *   Búa Đục Lỗ mua ở 🛒 Shop Linh Thạch (CSH.count/use('ham')). Linh Thạch trừ qua ví ☁ (LT.spend, cần đăng nhập).
 *   Lưu trên món đồ: it.ho (số lỗ) · it.gz[] (đá đã khảm {k,v,lv}) — đi theo món đồ khi cất/lưu/đăng chợ.
 * ĐÁ KHẢM:
 *   Chỉ rơi ở Thánh Địa: mỗi boss chết 10% rơi 1–3 viên Đá cấp 1 CHƯA MÀI. Kho đá riêng PS[cur].gm (KHÔNG nằm trong túi
 *   nên không bao giờ bị tự bán/bán nhanh/dọn túi). Mài đá: 10💎/viên → opt ngẫu nhiên (không có opt "Cấp thần thông" ttl
 *   và kỹ năng vũ khí sk — chúng không thuộc bảng opt thường, CF.excl). Giá trị opt đá cấp 5 = opt trang bị MAX (OPT2.val(k,10));
 *   cấp 4/3/2/1 = 80/60/40/20% của cấp 5 (CF.pct).
 *   Ghép: 3 đá cùng cấp → 1 đá cấp trên (tối đa cấp 5). Tỉ lệ 40/30/20/10%, phí 10/20/30/40💎. Thất bại mất 2 viên nguyên liệu
 *   (giữ lại viên chọn đầu tiên ⭐ — viên này cũng quyết định opt của đá mới). Bùa Ghép Ngọc +10% (CSH 'g10') cộng 10 điểm %.
 *   Đá cấp 5: ngoài opt còn +50 TẤT CẢ điểm thuộc tính (Sức mạnh/Thể lực/Trí tuệ/Nhanh nhẹn) mỗi viên đang khảm trên đồ ĐANG MẶC.
 * Cộng chỉ số: bọc twB (SX cộng twB(k) cho mọi opt) · +50 thuộc tính: getter trên PS[i].al (toJSON giữ nguyên save, không bị cộng dồn).
 * THÁO ĐÁ: nút "Tháo" cạnh từng lỗ → đá về kho (giữ cấp/opt, miễn phí). GHÉP THÀNH CÔNG → đá cấp trên CHƯA MÀI ({id,lv,raw:1}); mài giữ cấp, random opt mới.
 * CHỢ: đá bán được ở Chợ Giao Dịch (patch nhỏ systems/32-cho-giao-dich.js gọi GEMX). Đá đi qua chợ dưới dạng "món" s=10,r=cấp-1,l=1,gm=1
 *   (vừa đủ qua kiểm tra của cho_post; KHÔNG cần sửa SQL) và tự chuyển về kho đá khi về túi (GEMX.back / quét BAG).
 * Bảo vệ: món đã đục lỗ không bị Bán nhanh / Dọn đồ yếu / Hợp hàng loạt / Chọn ghép (bọc sa, bclean, bulkFuse, pk, fzt).
 * Chỉnh số: khối CF. Phụ thuộc: PS, cur, EQ, EQS, BAG, drop, ui, twB, AXN, AXF, OPT2, CSH, LT, gold, gcf, DT, sv. Thiếu → tự tắt phần đó. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof BAG==='undefined'||typeof drop!=='function'||typeof ui!=='function'||typeof AXN==='undefined')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var CF={
  maxHole:2,
  hole:[{ham:1,gold:10000000,lt:20},{ham:3,gold:30000000,lt:60}],   /* lỗ 1, lỗ 2 (lỗ sau x3) */
  drop:{chance:.10,min:1,max:3},                                   /* mỗi boss Thánh Địa chết */
  grind:10,                                                        /* 💎 mỗi viên mài */
  maxLv:5,
  pct:[.2,.4,.6,.8,1],                                             /* giá trị đá cấp 1..5 so với MAX */
  merge:{need:3,lose:2,rate:[40,30,20,10],cost:[10,20,30,40],tal:'g10',talBonus:10},
  lv5:50,                                                          /* +điểm cho CẢ 4 thuộc tính / mỗi đá cấp 5 đang khảm */
  excl:['ttl','sk']                                                /* opt tăng cấp thần thông: không có trong đá */
};
function rnd(){try{return typeof R==='function'?R():Math.random()}catch(e){return Math.random()}}
function nf(n){try{return fmtN(n)}catch(e){return Number(n).toLocaleString('vi-VN')}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#9fd8ff',g:1,l:130})}catch(e){}}
function save(){try{if(typeof sv==='function')sv()}catch(e){}}
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function ltBal(){try{return window.LT&&LT.get?LT.get():0}catch(e){return 0}}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch, thử lại sau'}
function csh(k){try{return window.CSH?CSH.count(k)|0:0}catch(e){return 0}}

/* ---------- dữ liệu đá ---------- */
function store(p){p=p||PS[cur];if(!p)return[];if(!Array.isArray(p.gm))p.gm=[];return p.gm}
function nid(p){p.gmn=(p.gmn|0)+1;return 'g'+p.gmn}
var MX={};
function maxOf(k){
  if(MX[k]!=null)return MX[k];var v=0;
  try{if(window.OPT2&&OPT2.cfg&&OPT2.cfg.R&&OPT2.cfg.R[k])v=OPT2.val(k,10);else if(typeof AXF!=='undefined'&&AXF[k])v=AXF[k][1]}catch(e){}
  return (MX[k]=+v||0)}
function valOf(k,lv){lv=Math.max(1,Math.min(CF.maxLv,lv|0));return Math.round(maxOf(k)*CF.pct[lv-1]*10)/10}
function pool(){
  var c='w',ks;try{c=CHR[cur].t}catch(e){}
  try{ks=window.OPT2&&OPT2.pool?OPT2.pool(c,true):Object.keys(AXN)}catch(e){ks=Object.keys(AXN)}
  return ks.filter(function(k){return CF.excl.indexOf(k)<0&&maxOf(k)>0})}
function gemTxt(g){
  var c='#ccc';try{c=RC[Math.min(6,g.lv|0)]}catch(e){}
  return '<span style="color:'+c+'">💎 Cấp '+g.lv+' · '+esc(AXN[g.k]||g.k)+' +'+valOf(g.k,g.lv)+'%</span>'+(g.lv>=CF.maxLv?'<br><span style="color:#ffd76a;font-size:11px">★ +'+CF.lv5+' tất cả thuộc tính (Sức mạnh · Nhanh nhẹn · Trí tuệ · Thể lực)</span>':'')}
function addRaw(n,p,lv){p=p||PS[cur];lv=Math.max(1,Math.min(CF.maxLv,lv|0||1));var S=store(p);for(var i=0;i<n;i++)S.push({id:nid(p),lv:lv,raw:1})}

/* ---------- cộng chỉ số từ đá đang khảm trên đồ ĐANG MẶC ---------- */
function gemBonus(k){
  var t=0;
  try{for(var i=0;i<EQ.length;i++){var it=EQ[i];if(it&&it.gz)for(var j=0;j<it.gz.length;j++){var g=it.gz[j];if(g&&g.k===k)t+=valOf(g.k,g.lv)}}}catch(e){}
  return t}
if(typeof twB==='function'&&!twB.__gem){var _tw=twB;twB=function(k){return _tw.apply(this,arguments)+gemBonus(k)};twB.__gem=1}
function lv5(i){
  var n=0;
  try{var A=EQS[i];if(A)for(var j=0;j<A.length;j++){var it=A[j];if(it&&it.gz)for(var q=0;q<it.gz.length;q++){var g=it.gz[q];if(g&&(g.lv|0)>=CF.maxLv)n++}}}catch(e){}
  return n*CF.lv5}
/* PS[i].al[0..3] = điểm thuộc tính: đọc = điểm gốc + bonus đá cấp 5; ghi (al[i]++) trừ bonus; toJSON lưu điểm gốc (không cộng dồn vào save). */
function hookAl(i){
  var p=PS[i];if(!p||!Array.isArray(p.al)||p.al.__gm)return;
  var a=p.al,base=[+a[0]||0,+a[1]||0,+a[2]||0,+a[3]||0];
  try{
    [0,1,2,3].forEach(function(k){Object.defineProperty(a,k,{configurable:true,enumerable:true,get:function(){return base[k]+lv5(i)},set:function(v){base[k]=(+v||0)-lv5(i)}})});
    Object.defineProperty(a,'toJSON',{value:function(){return base.slice()},enumerable:false,configurable:true});
    Object.defineProperty(a,'__gm',{value:1,enumerable:false,configurable:true})
  }catch(e){}}
function hookAll(){try{for(var i=0;i<PS.length;i++)hookAl(i)}catch(e){}}
setInterval(hookAll,300);hookAll();

/* ---------- rơi đá ở Thánh Địa ---------- */
var _drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  try{
    if(e&&e.td&&rnd()<CF.drop.chance){
      var n=CF.drop.min+Math.floor(rnd()*(CF.drop.max-CF.drop.min+1));addRaw(n);
      DT.push({x:e.x||P.x,y:170,s:'💎 Rơi '+n+' Đá Khảm (chưa mài)!',c:'#9fd8ff',g:1,l:240});save()}
  }catch(x){}
  return r};

/* ---------- bảo vệ món đã đục lỗ khỏi bán nhanh / dọn / hợp ---------- */
function stash(fn){
  return function(){
    var keep=[];
    try{for(var j=BAG.length-1;j>=0;j--)if(BAG[j]&&BAG[j].ho)keep.unshift({i:j,it:BAG.splice(j,1)[0]})}catch(e){}
    try{return fn.apply(this,arguments)}
    finally{try{keep.forEach(function(o){BAG.splice(Math.min(o.i,BAG.length),0,o.it)})}catch(e){}}}}
['sa','bclean','bulkFuse'].forEach(function(n){try{var f=window[n];if(typeof f==='function'&&!f.__gem){var w=stash(f);w.__gem=1;window[n]=w}}catch(e){}});
try{if(typeof pk==='function'&&!pk.__gem){var _pk=pk;pk=function(k,i){
  var it=k=='b'?BAG[i]:null;
  if(it&&it.ho&&typeof qs!=='undefined'&&qs){var q=qs;qs=0;try{return _pk.apply(this,arguments)}finally{qs=q}}
  return _pk.apply(this,arguments)};pk.__gem=1}}catch(e){}
try{if(typeof fzt==='function'&&!fzt.__gem){var _fzt=fzt;fzt=function(i){
  var it=BAG[i];if(it&&it.ho){msg='⛔ Món đã đục lỗ không dùng để ghép được';ui();return}
  return _fzt.apply(this,arguments)};fzt.__gem=1}}catch(e){}

/* ---------- đục lỗ ---------- */
var busy=0,note='',tgt=null,pick=[],useTal=false;
function curItem(){try{if(!sel||(sel.k!=='e'&&sel.k!=='b'))return null;var it=sel.k==='e'?EQ[sel.i]:BAG[sel.i];return it&&typeof it==='object'?it:null}catch(e){return null}}
function has(it){try{return BAG.indexOf(it)>=0||EQ.indexOf(it)>=0}catch(e){return false}}
function setMsg(t){try{msg=t}catch(e){}}
function drill(){
  var it=curItem();if(!it||busy)return;
  var n=it.ho|0;if(n>=CF.maxHole){setMsg('Món này đã đục tối đa '+CF.maxHole+' lỗ');ui();return}
  var c=CF.hole[n];
  if(!window.CSH){setMsg('Chưa có Cửa Hàng (ui/63-cash-shop.js)');ui();return}
  if(csh('ham')<c.ham){setMsg('🔨 Thiếu Búa Đục Lỗ (cần '+c.ham+', có '+csh('ham')+') — mua ở 🛒 Shop Linh Thạch');ui();return}
  if(gold<c.gold){setMsg('Không đủ vàng (cần '+nf(c.gold)+'💰)');ui();return}
  if(!ltOk()){setMsg('☁ Cần đăng nhập tài khoản để dùng Linh Thạch');ui();return}
  var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
  ask('Đục lỗ '+(n+1)+' cho '+(it.n||'trang bị')+'?\nTốn: '+c.ham+' 🔨 Búa + '+nf(c.gold)+' 💰 + '+c.lt+' 💎 Linh Thạch.',function(){
    if(busy||!has(it)||(it.ho|0)!==n||gold<c.gold||csh('ham')<c.ham)return;
    busy=1;gold-=c.gold;for(var i=0;i<c.ham;i++)CSH.use('ham');          /* giữ chỗ trước, hoàn lại nếu trừ 💎 lỗi */
    spend(c.lt,'duc_lo_'+(n+1)).then(function(r){
      busy=0;
      if(r&&r.ok){it.ho=n+1;if(!Array.isArray(it.gz))it.gz=[];setMsg('🔨 Đục lỗ '+(n+1)+' thành công! Bấm "Khảm đá" để gắn đá.');say('🔨 Đục lỗ thành công!','#ffe9a0');save()}
      else{gold+=c.gold;try{CSH.give('ham',c.ham)}catch(e){}setMsg(spErr(r)+' (đã hoàn vàng & búa)')}
      try{ui()}catch(e){}})})}

/* ---------- khảm đá ---------- */
function pickSlot(i){
  var it=curItem();if(!it||i>=(it.ho|0))return;
  tgt={it:it,i:i};pick=[];note='';
  try{sel=null;ui()}catch(e){}
  show()}
function cancelPick(){tgt=null;render()}
function socket(id){
  var it=tgt&&tgt.it;
  if(!it||!has(it)||tgt.i>=(it.ho|0)){note='Không tìm thấy lỗ khảm này';tgt=null;render();return}
  var S=store(),ix=-1;for(var i=0;i<S.length;i++)if(S[i].id===id&&!S[i].raw){ix=i;break}
  if(ix<0)return;
  var slot=tgt.i,old=it.gz&&it.gz[slot];
  function go(){
    var j=-1;for(var q=0;q<S.length;q++)if(S[q].id===id&&!S[q].raw){j=q;break}
    if(j<0||!has(it))return;
    var g=S.splice(j,1)[0];if(!Array.isArray(it.gz))it.gz=[];
    it.gz[slot]={k:g.k,v:valOf(g.k,g.lv),lv:g.lv};
    setMsg('💎 Đã khảm đá cấp '+g.lv+': '+(AXN[g.k]||g.k)+' +'+valOf(g.k,g.lv)+'%'+(g.lv>=CF.maxLv?' · +'+CF.lv5+' tất cả thuộc tính':''));
    say('💎 Khảm đá thành công!','#9fd8ff');tgt=null;pick=[];save();close();try{ui()}catch(e){}}
  if(old){var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};ask('Thay đá ở lỗ '+(slot+1)+'?\nĐá cũ sẽ MẤT vĩnh viễn.',go)}
  else go()}

/* ---------- tháo đá (đá về kho, KHÔNG mất, giữ nguyên cấp & opt) ---------- */
function unsocket(i){
  var it=curItem();if(!it||busy)return;
  var g=it.gz&&it.gz[i];if(!g||i>=(it.ho|0))return;
  var lv=Math.max(1,Math.min(CF.maxLv,g.lv|0||1));
  if(!g.k||maxOf(g.k)<=0||CF.excl.indexOf(g.k)>=0){addRaw(1,null,lv)}      /* dữ liệu lạ → trả về đá chưa mài, tránh mất đồ */
  else store().push({id:nid(PS[cur]),lv:lv,k:g.k,v:valOf(g.k,lv)});
  it.gz[i]=null;
  setMsg('💎 Đã tháo đá cấp '+lv+' khỏi lỗ '+(i+1)+' — đá về kho Đá Khảm.');say('💎 Tháo đá thành công!','#9fd8ff');save();
  try{if(isOpen)render();ui()}catch(e){}}

/* ---------- mài đá ---------- */
function grind(all){
  var who=PS[cur],S=store(who),raw=S.filter(function(g){return g.raw});
  if(busy||!raw.length)return;
  var n=all?raw.length:1,cost=n*CF.grind;
  if(!ltOk()){note='☁ Cần đăng nhập tài khoản để dùng Linh Thạch';render();return}
  busy=1;note='⏳ Đang mài...';render();
  spend(cost,'mai_da').then(function(r){
    busy=0;
    if(r&&r.ok){
      var ks=pool(),got=[],done=0;
      for(var i=0;i<S.length&&done<n;i++){var g=S[i];if(!g.raw)continue;
        delete g.raw;g.lv=Math.max(1,Math.min(CF.maxLv,g.lv|0||1));g.k=ks[Math.floor(rnd()*ks.length)];g.v=valOf(g.k,g.lv);done++;got.push(g)}
      var sm={};got.forEach(function(g){var t='C'+g.lv+' '+(AXN[g.k]||g.k);sm[t]=(sm[t]|0)+1});
      note='✅ Mài '+done+' đá (−'+cost+'💎): '+Object.keys(sm).map(function(t){return t+(sm[t]>1?' ×'+sm[t]:'')}).join(', ');save()}
    else note=spErr(r);
    render()})}

/* ---------- ghép đá ---------- */
function find(S,id){for(var i=0;i<S.length;i++)if(S[i].id===id)return S[i];return null}
function tog(id){
  var S=store(),g=find(S,id);if(!g||g.raw)return;
  var k=pick.indexOf(id);
  if(k>=0){pick.splice(k,1)}
  else{
    var f=pick.length?find(S,pick[0]):null;
    if(f&&f.lv!==g.lv)pick=[id];
    else if(pick.length<CF.merge.need)pick.push(id);
    else note='Đã chọn đủ '+CF.merge.need+' viên — bỏ chọn bớt để đổi viên khác'}
  render()}
function chance(lv){var b=CF.merge.rate[lv-1]||0;return Math.min(100,b+(useTal&&csh(CF.merge.tal)>0?CF.merge.talBonus:0))}
function merge(){
  var who=PS[cur],S=store(who),sel3=pick.map(function(id){return find(S,id)}).filter(function(g){return g&&!g.raw});
  if(busy||sel3.length!==CF.merge.need)return;
  var lv=sel3[0].lv;
  if(sel3.some(function(g){return g.lv!==lv})||lv>=CF.maxLv){note='Cần 3 đá cùng cấp (dưới cấp '+CF.maxLv+')';render();return}
  var cost=CF.merge.cost[lv-1];
  if(!ltOk()){note='☁ Cần đăng nhập tài khoản để dùng Linh Thạch';render();return}
  var ids=sel3.map(function(g){return g.id});
  busy=1;note='⏳ Đang ghép...';render();
  spend(cost,'ghep_da').then(function(r){
    busy=0;
    if(!(r&&r.ok)){note=spErr(r);render();return}
    var all=ids.map(function(id){return find(S,id)});
    if(all.some(function(g){return !g})){note='Đá nguyên liệu đã thay đổi — ghép bị hủy (đã trừ '+cost+'💎)';pick=[];render();return}
    var rate=CF.merge.rate[lv-1],tal=false;
    if(useTal&&csh(CF.merge.tal)>0){try{tal=CSH.use(CF.merge.tal)}catch(e){}}
    var pc=Math.min(100,rate+(tal?CF.merge.talBonus:0)),ok=rnd()*100<pc,first=all[0];
    if(ok){
      S=who.gm=S.filter(function(g){return ids.indexOf(g.id)<0});
      var ng={id:nid(who),lv:lv+1,raw:1};S.push(ng);          /* đá mới CHƯA MÀI: phải mài lại để ra opt ngẫu nhiên */
      note='🌟 Ghép THÀNH CÔNG ('+pc+'%)! Nhận 🪨 đá cấp '+ng.lv+' CHƯA MÀI — hãy mài để ra opt mới'+(ng.lv>=CF.maxLv?' (cấp '+CF.maxLv+': +'+CF.lv5+' tất cả thuộc tính khi khảm)':'')+'.';
      say('🌟 Ghép đá thành công! Cấp '+ng.lv,'#ffd76a');pick=[]}
    else{
      var lose=[all[1].id,all[2].id];
      who.gm=S.filter(function(g){return lose.indexOf(g.id)<0});
      note='💥 Ghép THẤT BẠI ('+pc+'%) — mất '+CF.merge.lose+' viên nguyên liệu, giữ lại viên ⭐.';pick=[first.id]}
    save();render()})}

/* ---------- giao diện bảng Đá Khảm ---------- */
var el=null,isOpen=false;
function mkEl(){
  var st=document.createElement('style');
  st.textContent='#gmxp{display:none;position:fixed;z-index:22;left:0;right:0;bottom:0;top:12%;background:linear-gradient(#1b2a3a,#0b1119);border-top:2px solid #5aa8ff;color:#f0e4c8;font-family:'+FONT+';overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:8px 10px calc(14px + env(safe-area-inset-bottom,0px))}'
  +'@media (min-width:700px){#gmxp{left:auto;top:0;width:420px;border-left:2px solid #5aa8ff;border-top:0}}'
  +'#gmxp button{font:inherit;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:12px}#gmxp button:disabled{opacity:.45}'
  +'#gmxp .gh{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:bold;margin-bottom:6px}#gmxp .gh span:first-child{flex:1}#gmxp .gl{font-size:13px;color:#7fe0ff}'
  +'#gmxp .gn{font-size:12px;color:#ffd98a;margin:4px 0;line-height:1.4}#gmxp .pk{border:1px dashed #7affb0;border-radius:8px;padding:6px 8px;background:#0a2a1a;color:#9fffb0}'
  +'#gmxp .gs{font-size:13px;font-weight:bold;color:#9fd8ff;margin:10px 0 4px}#gmxp .gd{font-size:11.5px;opacity:.8;line-height:1.4;margin:2px 0 4px}'
  +'#gmxp .gr{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}'
  +'#gmxp .gm{display:flex;align-items:center;gap:8px;border:1px solid #3d5470;border-radius:8px;padding:6px 8px;margin-bottom:4px;background:#0006;font-size:13px}#gmxp .gm.on{border-color:#ffd76a;background:#3a2c10aa}'
  +'#gmxp .gm .gx{flex:1;min-width:0}#gmxp .gb{border:1px solid #c9a24f;border-radius:8px;padding:7px 9px;margin:8px 0;background:#0008;font-size:12.5px;line-height:1.45}';
  document.head.appendChild(st);
  el=document.createElement('div');el.id='gmxp';
  ['pointerdown','touchstart','mousedown'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
  document.body.appendChild(el)}
function render(){
  if(!el||!isOpen)return;
  var S=store(),raw=S.filter(function(g){return g.raw}),ref=S.filter(function(g){return !g.raw}).sort(function(a,b){return b.lv-a.lv||(a.k<b.k?-1:a.k>b.k?1:0)});
  var h='<div class="gh"><span>💎 Đá Khảm</span><span class="gl">'+(ltOk()?'💎 '+nf(ltBal()):'☁ chưa đăng nhập')+'</span><button onclick="GEMX.close()">✕</button></div>';
  if(tgt&&tgt.it)h+='<div class="gn pk">Chọn 1 viên đá bên dưới để khảm vào <b>Lỗ '+(tgt.i+1)+'</b> của <b>'+esc(tgt.it.n||'trang bị')+'</b> · <button onclick="GEMX.cancelPick()">Hủy</button></div>';
  if(note)h+='<div class="gn">'+note+'</div>';
  h+='<div class="gs">🪨 Đá chưa mài ×'+raw.length+'</div>';
  var rl=raw.filter(function(g){return (g.lv|0)>1});
  if(rl.length)h+='<div class="gd">'+rl.map(function(g){return '🪨 Cấp '+g.lv+' chưa mài'}).join(' · ')+'</div>';
  if(raw.length)h+='<div class="gr"><button '+(busy?'disabled ':'')+'onclick="GEMX.grind(0)">Mài 1 ('+CF.grind+'💎)</button>'+(raw.length>1?'<button '+(busy?'disabled ':'')+'onclick="GEMX.grind(1)">Mài hết ×'+raw.length+' ('+raw.length*CF.grind+'💎)</button>':'')+'</div><div class="gd">Mài ra 1 opt ngẫu nhiên (cấp 1 = '+Math.round(CF.pct[0]*100)+'% chỉ số MAX; đá ghép lên cấp giữ nguyên cấp, mài xong mới có opt).</div>';
  else h+='<div class="gd">Chỉ rơi ở bản đồ Thánh Địa: mỗi boss hạ được '+Math.round(CF.drop.chance*100)+'% rơi '+CF.drop.min+'–'+CF.drop.max+' viên (không bao giờ bị tự bán).</div>';
  h+='<div class="gs">💎 Đá đã mài ×'+ref.length+'</div>';
  if(!ref.length)h+='<div class="gd">Chưa có đá đã mài.</div>';
  ref.forEach(function(g){
    var on=pick.indexOf(g.id)>=0,star=pick[0]===g.id;
    h+='<div class="gm'+(on?' on':'')+'" onclick="GEMX.tog(\''+g.id+'\')"><span class="gx">'+(star?'⭐ ':on?'✔ ':'')+gemTxt(g)+'</span>'+(tgt?'<button onclick="event.stopPropagation();GEMX.socket(\''+g.id+'\')">Khảm</button>':'')+'</div>'});
  var s3=pick.map(function(id){return find(S,id)}).filter(Boolean),lv=s3.length?s3[0].lv:0,ready=s3.length===CF.merge.need&&lv<CF.maxLv;
  h+='<div class="gb"><b>🔗 Ghép đá</b> · chạm để chọn '+CF.merge.need+' viên CÙNG cấp. Ghép thành công → đá cấp trên <b>chưa mài</b> (mài lại ra opt ngẫu nhiên).<br>'
   +'Tỉ lệ cấp 1→5: '+CF.merge.rate.map(function(r,i){return (i+1)+'→'+(i+2)+': '+r+'% ('+CF.merge.cost[i]+'💎)'}).join(' · ')+'<br>'
   +'Thất bại: mất '+CF.merge.lose+' viên nguyên liệu (giữ viên ⭐ đầu tiên).<br>'
   +(s3.length?'Đã chọn '+s3.length+'/'+CF.merge.need+(lv>=CF.maxLv?' · đá cấp '+CF.maxLv+' là tối đa':' · cấp '+lv+'→'+(lv+1)+' · tỉ lệ <b>'+chance(lv)+'%</b> · phí <b>'+CF.merge.cost[lv-1]+'💎</b>'):'Chưa chọn viên nào.')
   +'<div class="gr" style="margin-top:6px"><button '+(csh(CF.merge.tal)<1?'disabled ':'')+'onclick="GEMX.tal()"'+(useTal&&csh(CF.merge.tal)>0?' style="border-color:#7affb0;box-shadow:0 0 6px #7affb0"':'')+'>📜 Bùa Ghép +'+CF.merge.talBonus+'% ×'+csh(CF.merge.tal)+(useTal&&csh(CF.merge.tal)>0?' ✔':'')+'</button>'
   +'<button '+(!ready||busy?'disabled ':'')+'onclick="GEMX.merge()">🔗 Ghép'+(ready?' ('+CF.merge.cost[lv-1]+'💎)':'')+'</button>'
   +(pick.length?'<button onclick="GEMX.clr()">Bỏ chọn</button>':'')+'</div>'
   +(csh(CF.merge.tal)<1?'<div class="gd">Bùa Ghép Ngọc mua ở 🛒 Shop Linh Thạch (200💎).</div>':'')+'</div>';
  h+='<div class="gd">Khảm: mở món đồ (túi hoặc đang mặc) → khối "💎 Lỗ khảm" → Khảm đá. Bán đá: Chợ giao dịch → tab 📦 Đăng bán.</div>';
  el.innerHTML=h}
function show(){if(!el)mkEl();isOpen=true;el.style.display='block';render()}
function close(){isOpen=false;tgt=null;if(el)el.style.display='none'}
function openMain(){tgt=null;pick=[];note='';try{sel=null;ui()}catch(e){}show()}

/* ---------- gắn vào bảng món đồ & túi (bọc ui, không sửa engine) ---------- */
function itemHtml(it){
  var ho=it.ho|0,h='<div class="gmx" style="margin-top:8px;padding-top:8px;border-top:1px dashed #6a4e2a;text-align:left">'
   +'<div style="font-weight:bold;color:#9fd8ff">💎 Lỗ khảm '+ho+'/'+CF.maxHole+'</div>';
  for(var i=0;i<ho;i++){
    var g=it.gz&&it.gz[i];
    h+='<div style="display:flex;gap:6px;align-items:center;margin:4px 0"><span style="flex:1;font-size:12.5px">'+(g?gemTxt(g):'<span style="opacity:.7">◯ Lỗ '+(i+1)+': trống</span>')+'</span><button onclick="GEMX.pick('+i+')" style="margin:0;padding:6px 10px;font-size:12px">'+(g?'Thay đá':'Khảm đá')+'</button>'+(g?'<button onclick="GEMX.unsocket('+i+')" style="margin:0;padding:6px 10px;font-size:12px">Tháo</button>':'')+'</div>'}
  if(ho<CF.maxHole){
    var c=CF.hole[ho],okh=csh('ham')>=c.ham;
    h+='<button onclick="GEMX.drill()" style="margin:4px 0 0;padding:7px 10px;font-size:12px;width:100%'+(okh?'':';opacity:.7')+'">🔨 Đục lỗ '+(ho+1)+' · '+c.ham+' búa (có '+csh('ham')+') · '+nf(c.gold)+'💰 · '+c.lt+'💎</button>'}
  return h+'</div>'}
function inject(){
  var b=document.getElementById('bag');if(!b)return;
  var ipp=b.querySelector('.ipp');
  if(ipp&&!ipp.querySelector('.gmx')){var it=curItem();if(it&&typeof it.s==='number'){var d=document.createElement('div');d.innerHTML=itemHtml(it);ipp.appendChild(d.firstChild)}}
  var gr=b.querySelector('.gr5');
  if(gr&&!b.querySelector('.gmb')){
    var raw=0,ref=0;store().forEach(function(g){if(g.raw)raw++;else ref++});
    var d2=document.createElement('div');d2.className='gmb';d2.style.cssText='margin:4px 0';
    d2.innerHTML='<button onclick="GEMX.open()" style="width:100%;padding:6px 0;border-color:#5aa8ff">💎 Đá Khảm · '+ref+' đã mài'+(raw?' · '+raw+' chưa mài':'')+'</button>';
    gr.parentNode.insertBefore(d2,gr)}}
var _ui=ui;
ui=function(){scanBag();var r=_ui.apply(this,arguments);try{inject()}catch(e){}return r};

/* ---------- Chợ giao dịch: đá ↔ "món" tạm (xem patch systems/32-cho-giao-dich.js) ---------- */
function toMk(g){
  var lv=Math.max(1,g.lv|0||1);
  return{gm:1,gid:g.id,s:10,r:Math.max(0,Math.min(4,lv-1)),l:1,lv:lv,raw:g.raw?1:0,k:g.k||'',
    n:g.raw?'🪨 Đá Khảm cấp '+lv+' chưa mài':'💎 Đá Khảm Cấp '+lv+' · '+(AXN[g.k]||g.k)}}
function mkList(){return store().map(toMk).sort(function(a,b){return b.lv-a.lv||(a.raw-b.raw)})}
function mkPeek(id){var g=find(store(),id);return g?toMk(g):null}
function mkTake(id){var S=store(),g=find(S,id);if(!g)return null;S.splice(S.indexOf(g),1);save();return g}
function mkBack(it){                       /* đá từ chợ về: dựng lại từ lv/k, GIÁ TRỊ tính lại theo bảng (không tin số trong JSON) */
  if(!it||!it.gm)return false;
  var p=PS[cur],lv=Math.max(1,Math.min(CF.maxLv,it.lv|0));
  if(it.raw){addRaw(1,p,lv)}
  else if(maxOf(it.k)>0&&CF.excl.indexOf(it.k)<0){store(p).push({id:nid(p),lv:lv,k:it.k,v:valOf(it.k,lv)})}
  else addRaw(1,p,lv);                     /* dữ liệu lạ → coi như đá chưa mài, tránh mất đồ */
  save();try{if(isOpen)render();ui()}catch(e){}return true}
function mkTxt(it){
  var lv=it.lv|0;
  if(it.raw)return 'Đá Khảm cấp '+Math.max(1,lv)+' chưa mài — mài ra opt ngẫu nhiên (10💎).';
  return gemTxt({k:it.k,lv:lv})}
function mkCol(it){try{return RC[Math.min(6,(it.lv|0))]}catch(e){return '#9fd8ff'}}
function scanBag(){                        /* phòng hờ: đá lọt vào túi (hòm nhận chợ...) → chuyển về kho đá */
  try{for(var i=BAG.length-1;i>=0;i--){var it=BAG[i];if(it&&it.gm){BAG.splice(i,1);mkBack(it)}}}catch(e){}}
setInterval(scanBag,700);

window.GEMX={cfg:CF,open:openMain,close:close,pick:pickSlot,cancelPick:cancelPick,socket:socket,drill:drill,grind:grind,unsocket:unsocket,tog:tog,merge:merge,
  tal:function(){useTal=!useTal;render()},clr:function(){pick=[];render()},
  add:function(n){addRaw(n|0||1);save();if(isOpen)render()},         /* tiện test: GEMX.add(3) */
  count:function(){var r=0,f=0;store().forEach(function(g){g.raw?r++:f++});return{raw:r,ground:f}},
  valOf:valOf,pool:pool,lv5:lv5,bonus:gemBonus,
  list:mkList,peek:mkPeek,take:mkTake,back:mkBack,txt:mkTxt,col:mkCol};
})();
