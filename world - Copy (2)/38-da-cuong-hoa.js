/* ===== 🪨 ĐÁ CƯỜNG HÓA ===== (nạp TRƯỚC 37-cuong-hoa-fx.js để hiệu ứng +7/+10 bọc được en1 mới)
 * Cường hóa +0→+7 (lần thứ 1–7): tốn 💰 + 1 🪨 Đá Cường Hóa. Thất bại từ +5 tụt 1 cấp (như cũ).
 * Từ +7 lên +8, +9, +10: tốn 💰 + 1 💠 Đá Cường Hóa Cao Cấp (loại đá khác). THẤT BẠI → TRANG BỊ VỀ +0 (có hộp xác nhận).
 * Kho đá lưu theo nhân vật: PS[cur].dch={a,b}. Nguồn: rơi từ quái (bảng trong roll()) + mua ở Thợ Rèn (giá PR). Chỉnh PR/roll() để cân bằng.
 * Giao diện: nút Cường hóa trong bảng đồ ghi loại đá cần dùng + nút mua đá (engine gọi DCH.need / DCH.buyBtn). */
(function(){
'use strict';
if(typeof en1!=='function'||typeof RT==='undefined'||typeof PS==='undefined')return;
var PR={a:2000,b:250000},NAME={a:'🪨 Đá Cường Hóa',b:'💠 Đá Cường Hóa Cao Cấp'};
function D(){var p=PS[cur];if(!p.dch)p.dch={a:0,b:0};return p.dch}
function cur_(){try{return sel&&sel.k==='e'?EQ[sel.i]:BAG[sel.i]}catch(e){return null}}
function say(t,c){try{DT.push({x:P.x,y:170,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function give(k,n){n=Math.floor(n);if(n<=0)return;D()[k]+=n;say('+'+n+' '+NAME[k],k==='b'?'#c8a0ff':'#cfe8ff')}
function f(n){try{return fmtN(n)}catch(e){return String(n)}}
function doEn(it,asyn){
  if(!it||it.u>=10)return;var hi=it.u>=7,k=hi?'b':'a',c=cost(it),d=D();
  if(gold<c){msg='Không đủ vàng!';ui();return}
  if(d[k]<1){msg='Thiếu '+NAME[k]+(hi?' (rơi từ Boss, hoặc mua ở Thợ Rèn)':'');ui();return}
  gold-=c;d[k]--;
  if(Math.random()*100<RT[it.u]){it.u++;try{QE('enhok')}catch(e){}msg='✅ Cường hóa thành công! +'+it.u;if(asyn&&(it.u===7||it.u===10)&&window.UFX)UFX.burst(it.u,it)}
  else if(hi){it.u=0;msg='💥 Thất bại! Trang bị rơi về +0'}
  else{var dn=it.u>=5;if(dn)it.u--;msg='❌ Thất bại'+(dn?', tụt về +'+it.u:'')}
  P.hp=Math.min(P.hp,mx());ui()}
en1=function(){
  if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}
  var it=cur_();if(!it)return;
  if(it.u>=7&&it.u<10&&D().b>=1&&gold>=cost(it)){
    var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
    ask('Cường hóa +'+(it.u+1)+' bằng Đá Cao Cấp ('+RT[it.u]+'%).\n⚠ THẤT BẠI SẼ VỀ +0!\nTiếp tục?',function(){doEn(it,true)});return}
  doEn(it,false)};
/* rơi đá từ quái: Boss/Ma Thần/Kiếm Thánh rơi đá cao cấp */
function roll(e){var b=e.b|0,a=0,h=0,r=Math.random;
  if(e.ks){h=8+Math.floor(r()*5);a=15}else if(e.mt){h=3+Math.floor(r()*3);a=10}
  else if(b===2||e.k==='pal'){h=1+Math.floor(r()*2);a=8+Math.floor(r()*8)}
  else if(b===3){a=4+Math.floor(r()*5);if(r()<.35)h=1}
  else if(b===1){if(r()<.6)a=2+Math.floor(r()*3);if(r()<.08)h=1}
  else if(r()<.04)a=1;
  if(e.lgi!=null){a*=2;if(h&&r()<.5)h++}
  give('a',a);give('b',h)}
if(typeof drop==='function'){var _drop=drop;drop=function(e){var r=_drop.apply(this,arguments);try{if(e)roll(e)}catch(x){}return r}}
window.DCH={get:D,give:give,price:PR,
  need:function(it){return '1 '+(it.u>=7?NAME.b+' · ⚠ bại về +0':NAME.a)+' · '},
  buyBtn:function(it){var k=it.u>=7?'b':'a';return '<button onclick="DCH.buy(\''+k+'\')">🛒 Mua '+NAME[k]+' ('+D()[k]+') · '+f(PR[k])+'💰</button>'},
  buy:function(k){if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}if(gold<PR[k]){msg='Không đủ vàng!';ui();return}gold-=PR[k];D()[k]++;msg='Đã mua 1 '+NAME[k];ui()}};
})();
