/* ===== 🪨 ĐÁ CƯỜNG HÓA ===== (nạp TRƯỚC 37-cuong-hoa-fx.js để hiệu ứng +7/+10 bọc được en1 mới)
 * Cường hóa +0→+7 (lần thứ 1–7): tốn 💰 + 1 🪨 Đá Cường Hóa. Thất bại từ +5 tụt 1 cấp (như cũ).
 * Từ +7 lên +8 … +15 (giới hạn +15): tốn 💰 + 3 💠 Đá Cường Hóa Cao Cấp (loại đá khác). THẤT BẠI → TRANG BỊ VỀ +0 (có hộp xác nhận).
 * 🔮 Ngọc Định Hồn (it.dh): thất bại khi lên +8…+11 chỉ về +7.  🔮 Đại Định Hồn (it.dh2, chỉ dùng được khi món đã +11): thất bại khi lên +12…+15 chỉ về +11.
 * Tỉ lệ từng cấp nằm ở RT[] (core/01l); bùa tỉ lệ chỉ còn ½ tác dụng khi lên +11…+15 (ui/63); tỉ lệ cộng của nghề Rèn (NGH.rdRate) giữ nguyên.
 * Kho đá lưu theo nhân vật: PS[cur].dch={a,b}. Nguồn: rơi từ quái (bảng trong roll()) + mua ở Thợ Rèn (giá PR). Chỉnh PR/roll() để cân bằng.
 * Giao diện: nút Cường hóa trong bảng đồ ghi loại đá cần dùng + nút mua đá (engine gọi DCH.need / DCH.buyBtn). */
(function(){
'use strict';
if(typeof en1!=='function'||typeof RT==='undefined'||typeof PS==='undefined')return;
var MAXU=15,DH1_TOP=10,DH2_MIN=11,DH2_BACK=11,DH1_BACK=7,
    HI=3, /* số 💠 Đá Cao Cấp cần cho MỖI lần cường hóa +7→+8, +8→+9, +9→+10 (trước là 1) */
    PR={a:2000,b:250000},NAME={a:'🪨 Đá Cường Hóa',b:'💠 Đá Cường Hóa Cao Cấp'};
function D(){var p=PS[cur];if(!p.dch)p.dch={a:0,b:0};return p.dch}
function cur_(){try{return sel&&sel.k==='e'?EQ[sel.i]:BAG[sel.i]}catch(e){return null}}
function say(t,c){try{DT.push({x:P.x,y:170,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function give(k,n){n=Math.floor(n);if(n<=0)return;D()[k]+=n;say('+'+n+' '+NAME[k],k==='b'?'#c8a0ff':'#cfe8ff')}
function f(n){try{return fmtN(n)}catch(e){return String(n)}}
/* cấp trang bị rơi về khi THẤT BẠI ở các cấp >= +7 (đang ở cấp u, thử lên u+1): Đại Định Hồn bảo vệ +12→+15 (về +11); Định Hồn bảo vệ +8→+11 (về +7); không có thì về +0 */
function fallTo(it){var u=it.u|0;if(u>=DH2_MIN)return it.dh2?DH2_BACK:0;if(u>=7&&u<=DH1_TOP)return it.dh?DH1_BACK:0;return 0}
function fallTxt(it){var to=fallTo(it);return to>0?'🔮 '+((it.u|0)>=DH2_MIN?'Đại Định Hồn':'Định Hồn')+': thất bại về +'+to:'⚠ thất bại về +0'}
function doEn(it,asyn){
  if(!it||it.u>=MAXU)return;var hi=it.u>=7,k=hi?'b':'a',c=Math.round(cost(it)*(window.NGH?NGH.rdGold():1)),d=D(),nd=hi?HI:1;
  if(gold<c){msg='Không đủ vàng!';ui();return}
  if(d[k]<nd){msg='Thiếu '+NAME[k]+(hi?' (cần '+nd+', có '+d[k]+'; rơi từ Boss, hoặc mua ở Thợ Rèn)':'');ui();return}
  gold-=c;d[k]-=nd;try{window.NGH&&NGH.xp('rd',8)}catch(e){}
  if(Math.random()*100<RT[it.u]+(window.NGH?NGH.rdRate():0)){it.u++;try{QE('enhok')}catch(e){}msg='✅ Cường hóa thành công! +'+it.u;if(asyn&&(it.u===7||it.u===10||it.u===15)&&window.UFX)UFX.burst(it.u,it)}
  else if(hi){var to=fallTo(it),big=(it.u|0)>=DH2_MIN;it.u=to;msg=to>0?'💥 Thất bại! 🔮 '+(big?'Đại Định Hồn':'Định Hồn')+' giữ trang bị ở +'+to:'💥 Thất bại! Trang bị rơi về +0'}
  else{var dn=it.u>=5;if(dn)it.u--;msg='❌ Thất bại'+(dn?', tụt về +'+it.u:'')}
  P.hp=Math.min(P.hp,mx());ui()}
en1=function(){
  if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}
  var it=cur_();if(!it)return;
  if(it.u>=7&&it.u<MAXU&&D().b>=HI&&gold>=Math.round(cost(it)*(window.NGH?NGH.rdGold():1))){
    var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
    ask('Cường hóa +'+(it.u+1)+' bằng Đá Cao Cấp ('+(RT[it.u]+(window.NGH?NGH.rdRate():0))+'%).\n'+(fallTo(it)>0?'🔮 '+((it.u|0)>=DH2_MIN?'Đại Định Hồn':'Định Hồn')+': thất bại về +'+fallTo(it)+'.':'⚠ THẤT BẠI SẼ VỀ +0!')+'\nTiếp tục?',function(){doEn(it,true)});return}
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
window.DCH={fall:fallTo,max:MAXU,get:D,give:give,price:PR,hi:HI,
  need:function(it){return (it.u>=7?HI:1)+' '+(it.u>=7?NAME.b+(fallTo(it)>0?' · 🔮 bại về +'+fallTo(it):' · ⚠ bại về +0'):NAME.a)+' · '},
  buyBtn:function(it){var k=it.u>=7?'b':'a';return '<button onclick="DCH.buy(\''+k+'\')">🛒 Mua '+NAME[k]+' ('+D()[k]+') · '+f(PR[k])+'💰</button>'},
  buy:function(k){if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}if(gold<PR[k]){msg='Không đủ vàng!';ui();return}gold-=PR[k];D()[k]++;msg='Đã mua 1 '+NAME[k];ui()}};
})();
