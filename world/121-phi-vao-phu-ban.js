/* ===== 🎟 PHÍ VÀO + THƯỞNG MẢNH THÁNH CHO 3 PHỤ BẢN (world/121-phi-vao-phu-ban.js · Fix365) =====
 * Áp cho: ⚡ Thiên Lôi Cổ Địa (114) · 🪞 Huyễn Cảnh Kính Hồ (115) · 💀 Cốt Hải Sa Mạc (116). Nạp SAU world/117. Không sửa core/engine.
 *  - Phí mỗi lần vào: CF.gold vàng (10.000.000) + CF.lt Linh Thạch (20💎, LT.spend, cần đăng nhập). Trừ vàng trước, trừ Linh Thạch sau;
 *    Linh Thạch lỗi/không đủ thì hoàn lại vàng → không bao giờ mất vàng mà không vào được.
 *  - Hồi chiêu CF.cd = 1 giờ, tính từ lúc trả phí thành công; lưu theo nhân vật: PS[cur].pbf = {tlc, kinhho, cothai} (mốc ms được vào lại).
 *    Mỗi phụ bản có hồi chiêu RIÊNG. Muốn 3 phụ bản dùng chung 1 hồi chiêu: CF.shared = true.
 *  - Thưởng: mỗi lần hạ Boss Sử Thi của phụ bản, tỉ lệ CF.shRate (5%) rơi CF.shQty (2) 🔱 MẢNH THÁNH KHÍ — vật phẩm RIÊNG để chế tạo Thánh Khí
 *    (cập nhật sau). KHÔNG phải "Mảnh Thánh" của Lò Luyện đồ Thánh (HL.addSH) — hai loại tách biệt hoàn toàn.
 *    Lưu theo nhân vật: PS[cur].mtk (số nguyên). API cho bản cập nhật Thánh Khí: MTK.get() · MTK.add(n) · MTK.spend(n) → true/false.
 *    Không nhân theo độ khó/Lời Nguyền (117). Đồ rơi thường giữ nguyên như các phụ bản khác.
 *  - Bảng chọn độ khó của 117 có thêm dòng phí vào (PBF.line). Kính Hồ/Cốt Hải: kiểm tra phí TRƯỚC khi hiện bảng, trừ phí SAU khi bấm "Vào phụ bản".
 * Phụ thuộc: started, P, PS, cur, DT, gold, sv, drop, LT (systems/32), PBC (114a), TLC (114) — thiếu cái nào thì phần đó tự tắt.
 * Gỡ: xoá thẻ <script> 121 trong index.html (phụ bản trở lại miễn phí). */
(function(){
'use strict';
if(window.PBF)return;
if(typeof started==='undefined'||typeof P==='undefined'||typeof PS==='undefined'||typeof DT==='undefined')return;

var CF={gold:10000000,lt:20,cd:3600000,shared:false,shRate:.05,shQty:2,shName:'🔱 Mảnh Thánh Khí',
  names:{tlc:'⚡ Thiên Lôi Cổ Địa',kinhho:'🪞 Huyễn Cảnh Kính Hồ',cothai:'💀 Cốt Hải Sa Mạc'},
  houses:{kinhho:['TT2',3],cothai:['TT3',0]}};
var busy=0;

/* Mảnh Thánh Khí: kho riêng theo nhân vật, tách khỏi Mảnh Thánh (HL.sh) của Lò Luyện */
function mget(){var p=PS[cur];return p?(p.mtk|0):0}
function madd(n){var p=PS[cur];if(!p)return 0;n=n|0;if(n<=0)return p.mtk|0;p.mtk=(p.mtk|0)+n;return p.mtk}
function mspend(n){var p=PS[cur];n=n|0;if(!p||n<=0||(p.mtk|0)<n)return false;p.mtk=(p.mtk|0)-n;try{sv()}catch(e){}return true}
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffd98a',g:1,l:160})}catch(e){}}
function fmt(ms){var t=Math.ceil(ms/1000),m=Math.floor(t/60);return m+':'+String(t%60).padStart(2,'0')}
function key(id){return CF.shared?'all':id}
function K(who){var p=who||PS[cur];if(!p)return null;if(!p.pbf||typeof p.pbf!=='object')p.pbf={};return p.pbf}
function left(id){
  var k=K(),n,v;if(!k)return 0;v=+k[key(id)]||0;n=v-Date.now();
  if(n>CF.cd){k[key(id)]=Date.now()+CF.cd;n=CF.cd}      /* chống chỉnh đồng hồ / dữ liệu lệch */
  return Math.max(0,n)}
function ltOk(){try{return !!(window.LT&&LT.spend&&LT.logged&&LT.logged())}catch(e){return false}}
function ask(t,fn){var a=typeof gcf==='function'?gcf:function(x,f){if(confirm(x))f()};try{a(t,fn)}catch(e){}}

/* kiểm tra điều kiện (không trừ gì) → true hoặc câu báo lỗi */
function pre(id){
  if(typeof started==='undefined'||!started)return 'Không thể vào lúc này';
  if(busy)return '⏳ Đang xử lý phí vào, chờ chút…';
  var l=left(id);if(l>0)return '⏳ '+CF.names[id]+' mở lại sau '+fmt(l)+' (1 giờ vào 1 lần)';
  if(gold<CF.gold)return '💰 Không đủ vàng: cần '+nf(CF.gold)+' (hiện '+nf(gold)+')';
  if(!ltOk())return '☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+CF.lt+'💎)';
  try{var b=LT.get();if(typeof b==='number'&&b<CF.lt)return '💎 Không đủ Linh Thạch: cần '+CF.lt+' (hiện '+nf(b)+')'}catch(e){}
  return true}

/* trả phí rồi chạy go(): vàng trừ trước → Linh Thạch → lỗi thì hoàn vàng */
function pay(id,go){
  var r=pre(id);if(r!==true){say(r);return}
  busy=1;var who=PS[cur];gold-=CF.gold;
  function refund(msg){gold+=CF.gold;busy=0;say(msg)}
  var pr;try{pr=LT.spend(CF.lt,'pb_'+id)}catch(e){refund('Không trừ được Linh Thạch, đã hoàn vàng');return}
  Promise.resolve(pr).then(function(res){
    if(!res||!res.ok){
      refund(res&&res.err==='poor'?'💎 Không đủ Linh Thạch (cần '+CF.lt+') · đã hoàn vàng':'Không trừ được Linh Thạch · đã hoàn vàng');return}
    busy=0;var k=K(who);if(k)k[key(id)]=Date.now()+CF.cd;
    try{sv()}catch(e){}
    say('🎟 −'+nf(CF.gold)+' vàng · −'+CF.lt+'💎','#ffe9a0');
    try{go()}catch(e){}
  },function(){refund('Lỗi mạng, chưa trừ phí (đã hoàn vàng)')})}

function feeTxt(id){return 'Phí vào '+CF.names[id]+': '+nf(CF.gold)+' vàng + '+CF.lt+'💎 Linh Thạch · 1 giờ vào 1 lần.\nBoss Sử Thi: '+Math.round(CF.shRate*100)+'% rơi '+CF.shQty+' '+CF.shName+' (chế tạo Thánh Khí).'}
/* dòng hiện trong bảng chọn độ khó của 117 */
function line(id){
  if(!CF.names[id])return '';
  var l=left(id);
  return '<br>🎟 Phí vào: <b style="color:#ffd870">'+nf(CF.gold)+' vàng + '+CF.lt+'💎</b> · 1 giờ/lần · '
    +(l>0?'<span style="color:#ff9a8a">⏳ mở lại sau '+fmt(l)+'</span>':'<span style="color:#8ef0a8">✅ sẵn sàng</span>')
    +'<br>'+CF.shName+': Boss Sử Thi <b style="color:#8ef0a8">'+Math.round(CF.shRate*100)+'%</b> rơi <b style="color:#8ef0a8">'+CF.shQty+'</b> · bạn có <b>'+mget()+'</b>'}

/* ---------- ⚡ Thiên Lôi: bọc TLC.enter (nút trong 🗺 Bản đồ gọi TLC.enter() lúc bấm) ---------- */
try{
  if(window.TLC&&typeof TLC.enter==='function'&&!TLC._pbf){
    TLC._pbf=1;var _te=TLC.enter;
    TLC.enter=function(){
      var self=this;
      if(!started||!TLC.eligible())return _te.apply(self,arguments);     /* chưa đủ Lv: 114 tự báo */
      if(TLC.on()){say('Bạn đang ở trong '+CF.names.tlc,'#bfe0ff');return}
      var r=pre('tlc');if(r!==true){say(r);return}
      ask(feeTxt('tlc')+'\nVào?',function(){pay('tlc',function(){_te.call(TLC)})})}}
}catch(e){}

/* ---------- 🪞 Kính Hồ / 💀 Cốt Hải: bọc api.enter (sau bảng độ khó 117) + house.open (kiểm tra trước) ---------- */
try{
  if(window.PBC&&PBC.maps)PBC.maps.forEach(function(M){
    var id=M.cfg&&M.cfg.id;if(!id||!CF.names[id]||!M.api||M._pbf)return;M._pbf=1;
    var api=M.api,_e=api.enter;
    api.enter=function(){
      if(M._pbfGo){M._pbfGo=0;return _e.apply(this,arguments)}           /* đã trả phí → vào thật */
      if(!started||!api.eligible())return _e.apply(this,arguments);       /* PBC tự báo "Cần LvXX" */
      if(api.active()){say('Bạn đang ở trong '+CF.names[id],'#bfe0ff');return}
      var self=this;
      pay(id,function(){M._pbfGo=1;M._dkGo=1;try{_e.call(self)}finally{M._pbfGo=0;M._dkGo=0}})};
    var hc=CF.houses[id],T=hc&&window[hc[0]],H=T&&T.houses&&T.houses[hc[1]];
    if(H&&typeof H.open==='function'&&!H._pbf){
      var _o=H.open;H._pbf=1;
      H.open=function(){
        if(!started||!api.eligible()||api.active())return _o.apply(this,arguments);
        var r=pre(id);if(r!==true){say(r);return}
        return _o.apply(this,arguments)}}});
}catch(e){}

/* ---------- thưởng Mảnh Thánh khi hạ Boss Sử Thi trong 3 phụ bản ---------- */
function curId(){
  try{if(window.TLC&&TLC.on&&TLC.on())return 'tlc'}catch(e){}
  try{if(window.PBC&&PBC.maps)for(var i=0;i<PBC.maps.length;i++){var M=PBC.maps[i];if(M.api&&M.api.active())return M.cfg.id}}catch(e){}
  return ''}
if(typeof drop==='function'){
  var _drop=drop;
  drop=function(e){
    var r=_drop.apply(this,arguments);
    try{
      if(e&&e.b===3&&e.k!=='pal'&&!e.dg&&!e._pbfS){
        var id=curId();
        if(id&&CF.names[id]){
          e._pbfS=1;
          if(Math.random()<CF.shRate){
            var tot=madd(CF.shQty);try{sv()}catch(x){}
            DT.push({x:e.x,y:300,s:CF.shName+' +'+CF.shQty+' (có '+tot+')',c:'#ffd870',l:180,g:1})}}}
    }catch(x){}
    return r}}

window.MTK={get:mget,add:function(n){var r=madd(n);try{sv()}catch(e){}return r},spend:mspend};
window.PBF={cfg:CF,left:left,pre:pre,line:line,
  clear:function(){var k=K();if(k)for(var a in k)k[a]=0}};   /* PBF.clear() = xoá hồi chiêu (dùng khi thử) */
})();
