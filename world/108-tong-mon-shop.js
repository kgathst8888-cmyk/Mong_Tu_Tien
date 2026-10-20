/* ===== 🛒 CỬA HÀNG CỐNG HIẾN TÔNG MÔN (world/108-tong-mon-shop.js) — Fix349 — nạp SAU world/106 =====
 * Thêm tab "🛒 Shop" vào Nhà Tông Môn. Cần chạy tong_mon_shop.sql (sau tong_mon.sql) 1 lần trong Supabase.
 *   • Tiêu CỐNG HIẾN (10.000 vàng quyên = 1 · điểm danh +10) để mua vật phẩm. Số dư khả dụng = tổng cống hiến − đã tiêu.
 *     Rời / bị đuổi khỏi tông thì mất số dư. Mỗi món có giới hạn mua MỖI TUẦN (thứ Hai 00:00 giờ VN) và cấp tông tối thiểu.
 *   • Bảng giá do MÁY CHỦ quyết (tm_shop_cat trong tong_mon_shop.sql); bảng CAT bên dưới chỉ để hiển thị — sửa giá phải sửa cả hai.
 *   • Máy chủ trừ cống hiến trước, máy khách phát vật phẩm sau khi nhận status = ok. Rương ngẫu nhiên (ch3, ch4): kiểm tra túi còn chỗ TRƯỚC khi mua (kết quả có thể là trang bị). Tỉ lệ hiển thị công khai trong tab Shop.
 *   • Cố ý KHÔNG bán vàng / Linh Thạch: 10.000 vàng = 1 cống hiến nên bán vàng sẽ tạo vòng lặp vàng↔cống hiến, còn Linh Thạch là hàng nạp thẻ.
 * Móc: TMG.addTab('shop', ...) (world/106). Dùng: HL.addNT / HL.addSH / gen / BAG / capN — đều có try/catch. API: TMS.cfg · TMS.html · TMS.act
 * Gỡ <script> → tab Shop biến mất, Tông Môn vẫn chạy. */
(function(){
'use strict';
if(window.TMS||!window.TMG||!TMG.addTab||typeof PS==='undefined'||typeof document==='undefined')return;
var CAT=[
  {id:'nt3',e:'🌙',n:'3 Mảnh Nguyệt Thạch',     cost:2000, lim:5,minlv:1},
  {id:'ch3',e:'🎁',n:'Rương Bí Bảo (ngẫu nhiên)',cost:3000, lim:3,minlv:1,
   t:[{p:52,k:'eq',r:3},{p:14,k:'eq',r:4},{p:28,k:'nt',q:3},{p:6,k:'sh',q:1}]},
  {id:'sh1',e:'💠',n:'1 Mảnh Thánh',             cost:8000, lim:2,minlv:3},
  {id:'ch4',e:'🎁',n:'Rương Bí Bảo Cao Cấp (ngẫu nhiên)',cost:12000,lim:1,minlv:5,
   t:[{p:45,k:'eq',r:4},{p:10,k:'eq',r:5},{p:20,k:'nt',q:6},{p:20,k:'sh',q:1},{p:5,k:'sh',q:2}]}];
/* k: eq = 1 trang bị độ hiếm r (0 Thường · 1 Tinh Anh · 2 Hiếm · 3 Sử Thi · 4 Thần Thoại · 5 Thiên Thần) · nt = q Mảnh Nguyệt Thạch · sh = q Mảnh Thánh. p = trọng số (tổng mỗi rương = 100 → %). */
var CF=window.TMS_CF={cat:CAT,mapMin:2};
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'];

function esc(s){return String(s==null?'':s).replace(/[&<>"'`]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]})}
function nf(n){try{return Math.round(Number(n)||0).toLocaleString('vi-VN')}catch(e){return ''+n}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:140,g:1})}catch(e){}}
function online(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess()&&KCL.rpc)}catch(e){return false}}
function rpc(fn,args){
  return new Promise(function(res){
    try{
      if(!online())return res({status:'login'});
      KCL.rpc(fn,args||{}).then(function(r){res(r&&typeof r==='object'?r:{status:'net'})})
        .catch(function(e){res({status:(e&&e.status===404)?'nosql':'net'})});
    }catch(e){res({status:'net'})}})}
function roll(t){var s=0,r,i;t.forEach(function(x){s+=x.p});r=Math.random()*s;for(i=0;i<t.length;i++){if((r-=t[i].p)<0)return t[i]}return t[t.length-1]}
function oLabel(o){return o.k==='eq'?'Trang bị '+RN[o.r]:o.k==='nt'?o.q+' Mảnh Nguyệt Thạch':o.q+' Mảnh Thánh'}
function oOdds(t){var s=0;t.forEach(function(x){s+=x.p});return t.map(function(o){return '<span'+(o.k==='sh'?' style="color:#ffd96a"':'')+'>'+Math.round(o.p/s*100)+'% '+oLabel(o)+'</span>'}).join(' · ')}
function err(r){
  var s=r&&r.status;
  return s==='login'||s==='auth'?'☁ Cần đăng nhập tài khoản':s==='nosql'?'⚠ Cửa hàng chưa kích hoạt trên máy chủ (cần chạy tong_mon_shop.sql)':
    s==='net'?'Lỗi mạng, thử lại sau':s==='none'?'Bạn chưa có tông môn':s==='poor'?'Không đủ cống hiến':
    s==='limit'?'Đã mua hết giới hạn tuần này':s==='lv'?'Cần tông môn cấp '+(r.need|0)+' trở lên':s==='bad'?'Món không tồn tại':'Không thực hiện được'}

var S={info:null,busy:false,loading:false,note:''};
function load(){
  if(S.loading)return;S.loading=true;
  rpc('tm_shop_info').then(function(r){S.loading=false;S.info=r;if(TMG.isOpen())TMG.render()})}
function bt(label,a,cls,dis){
  return '<button class="tmg-bt'+(cls?' '+cls:'')+'" '+(dis||S.busy?'disabled ':'')+'onclick="TMG.act(\'ext\',\'shop\',\''+a+'\')">'+label+'</button>'}

function html(g){
  var I=S.info;
  if(!I){if(!S.loading)load();return '<div class="tmg-cd">⏳ Đang tải cửa hàng...</div>'}
  if(I.status!=='ok')return '<div class="tmg-cd">'+esc(err(I))+'</div><div class="tmg-row">'+bt('Thử lại','reload')+'</div>';
  var bal=Number(I.bal)||0,glv=I.glv|0,buys=I.buys||{},h='';
  h+='<div class="tmg-nt">'+S.note+'</div>';
  h+='<div class="tmg-cd"><b>🛒 Cửa Hàng Cống Hiến</b>'
    +'<small>Số dư khả dụng: <b style="color:#ffe9a8">'+nf(bal)+'</b> cống hiến · Tông Lv.'+glv+'</small>'
    +'<small>Cống hiến: quyên 10.000💰 = 1, điểm danh +10. Rời / bị đuổi khỏi tông thì mất số dư. Giới hạn mua làm mới thứ Hai 00:00.</small></div>';
  CAT.forEach(function(c){
    var n=buys[c.id]|0,left=Math.max(0,c.lim-n),lock=glv<c.minlv,poor=bal<c.cost;
    var why=lock?'Cần tông Lv.'+c.minlv:left<=0?'Hết lượt tuần này':poor?'Thiếu '+nf(c.cost-bal):'';
    h+='<div class="tmg-cd"><b>'+c.e+' '+esc(c.n)+'</b>'+(c.t?'<small>Ngẫu nhiên: '+oOdds(c.t)+'</small>':'')
      +'<small>Giá <b>'+nf(c.cost)+'</b> cống hiến · còn <b>'+left+'/'+c.lim+'</b> lượt tuần này'+(c.minlv>1?' · yêu cầu tông Lv.'+c.minlv:'')+'</small>'
      +'<div class="tmg-row">'+bt(why?esc(why):'Mua','buy:'+c.id,why?'':'on',!!why)+'</div></div>'});
  h+='<div class="tmg-row">'+bt('↻ Làm mới','reload','sm')+'</div>';
  return h}

function act(a){
  if(a==='reload'){S.info=null;S.note='';load();TMG.render()}
  else if(a&&a.indexOf('buy:')===0)buy(a.slice(4))}

function buy(id){
  if(S.busy)return;
  var c=null;CAT.forEach(function(x){if(x.id===id)c=x});if(!c)return;
  if(c.t){try{if(BAG.length>=capN()){S.note='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi mua.';TMG.render();return}}catch(e){}}
  S.busy=true;S.note='⏳ Đang mua...';TMG.render();
  rpc('tm_shop_buy',{p_item:id}).then(function(r){
    S.busy=false;
    if(!r||r.status!=='ok'){S.note=esc(err(r));S.info=null;load();TMG.render();return}
    var msg='';
    try{
      if(id==='nt3'){HL.addNT(3);msg='🌙 +3 Mảnh Nguyệt Thạch'}
      else if(id==='sh1'){HL.addSH(1);msg='💠 +1 Mảnh Thánh'}
      else if(c.t){
        var o=roll(c.t);
        if(o.k==='nt'){HL.addNT(o.q);msg='🎁 Trúng 🌙 <b>'+o.q+' Mảnh Nguyệt Thạch</b>'}
        else if(o.k==='sh'){HL.addSH(o.q);msg='🎁 Trúng 💠 <b>'+o.q+' Mảnh Thánh</b>!'}
        else{var it=gen(P.lv,o.r,undefined,Math.max(typeof mapSel==='undefined'?0:mapSel|0,CF.mapMin));BAG.push(it);
          msg='🎁 Trúng 📦 <b>'+esc(it.n)+'</b> ('+RN[it.r]+', cần Lv'+it.l+')'}}
    }catch(e){msg='⚠ Đã trừ cống hiến nhưng phát vật phẩm lỗi — báo quản trị viên'}
    sav();say('🛒 Mua '+c.n,'#ffd96a');
    S.note='✅ Đã mua: '+msg+' · còn '+nf(r.bal)+' cống hiến';
    S.info=null;load();try{TMG.refresh()}catch(e){}TMG.render()})}

TMG.addTab('shop','🛒 Shop',html,act);
window.TMS={cfg:CF,html:html,act:act};
})();
