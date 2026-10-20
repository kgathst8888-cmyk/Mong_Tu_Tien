/* ===================================================================
   THỨC TỈNH THẦN THÚ — MỐC MỞ TIẾN HOÁ CẤP 4 (hình cuối) CHO CẢ 4 THÚ NUÔI (Fix367)
   - Trước đây file này khoá cứng tiến hoá 3 → 4 (LOCK_EV4). Cả 4 thú đã có cơ chế đầy đủ nên nay MỞ THEO MỐC.
   - Ngoài điều kiện sẵn có của từng thú (cấp thú, cảnh giới/dược thảo/vàng, Đan Đột Phá của Thanh Long…), cần thêm:
       ① Cảnh giới ≥ CF.realm (mặc định 4 = Hoá Thần, cùng thang với ZC.rI() trong bảng EVO của pets/31)
       ② Linh Căn đã chọn (Tháp) và đạt tầng ≥ CF.lcLv (mặc định 8)
       ③ Phí Thức Tỉnh CF.gold vàng (trừ thêm sau khi tiến hoá thành công; chỉ thu khi tiến hoá thật sự xảy ra)
   - Thú đã ở cấp 4 từ trước giữ nguyên. Không lưu thêm dữ liệu, không cần SQL.
   - Chỉnh: PETEV4_CF. Khoá lại như cũ: PETEV4_CF.lock=true (hoặc đặt window.PETEV4_CF={lock:true} trước khi nạp file).
   - Gỡ: xoá thẻ script → tiến hoá cấp 4 theo luật gốc (không cần mốc).
   API: PETEV4.check() · PETEV4.cfg
   =================================================================== */
(function(){
'use strict';
var CF=window.PETEV4_CF=Object.assign({on:true,lock:false,realm:4,lcLv:8,gold:20000000},window.PETEV4_CF||{});
if(!CF.on||typeof pev!=='function'||typeof petUI!=='function')return;
var MAPTW=[3,1,2,0,4];   /* Tháp (Kim,Mộc,Thủy,Hỏa,Thổ) → thứ tự Linh Căn (Hỏa,Mộc,Thủy,Kim,Thổ) */
var RN=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
function nf(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function realm(){try{return ZC.rI()|0}catch(e){return 0}}
function lcLv(){try{var p=PS[cur],t=p.tw;if(!t||t.root<0||t.root>4)return -1;var c=p.lc;var v=(c&&c.lv?c.lv[MAPTW[t.root]]:1)|0;return Math.max(1,v)+(window.TTLB&&TTLB.n?(TTLB.n()|0):0)}catch(e){return -1}}
function realmName(r){return RN[Math.min(RN.length-1,Math.max(0,r+1))]}   /* cùng quy ước nhãn với EVO: r=1 ↔ Trúc Cơ */
function check(){var r=realm(),l=lcLv(),g=0;try{g=gold}catch(e){}
  return{lock:!!CF.lock,realm:r,okR:r>=CF.realm,lc:l,okL:l>=CF.lcLv,gold:g,okMilestone:!CF.lock&&r>=CF.realm&&l>=CF.lcLv}}
function ok(b,t){return '<span style="color:'+(b?'#7fe08a':'#ff8a7a')+'">'+(b?'✔ ':'✘ ')+t+'</span>'}
function panel(c){
  if(CF.lock)return '<div class="dt"><small style="color:#ffcf8a">🔒 Tiến hoá cấp 4 (hình cuối) tạm khoá.</small></div>';
  return '<div class="dt" style="margin-top:4px"><small>🌟 <b>Mốc Thức Tỉnh Thần Thú</b> (để tiến hoá hình cuối)<br>'
    +ok(c.okR,'Cảnh giới '+realmName(CF.realm)+'+ (hiện tại '+realmName(c.realm)+')')+'<br>'
    +ok(c.okL,'Linh Căn tầng '+CF.lcLv+'+ '+(c.lc<0?'(chưa chọn Linh Căn ở Tháp)':'(hiện tại '+c.lc+')'))+'<br>'
    +'<span style="opacity:.85">Phí Thức Tỉnh: '+nf(CF.gold)+'💰 (ngoài phí tiến hoá gốc)</span></small></div>'}
function noteOf(c){
  if(CF.lock)return '🔒 Tiến hoá cấp 4 (hình cuối) tạm khoá.';
  var m=[];if(!c.okR)m.push('cảnh giới '+realmName(CF.realm)+'+');if(!c.okL)m.push('Linh Căn tầng '+CF.lcLv+'+');
  return '🔒 Chưa đủ mốc Thức Tỉnh Thần Thú: cần '+m.join(' và ')+'.'}

var oPev=pev,oUI=petUI;
pev=function(){
  var p=null;try{p=pet()}catch(e){}
  var last=!!(p&&p.ev===2&&p.lv>=pcap(p)&&vil);        /* chỉ chặn ở bước 3 → 4, khi đã đủ cấp thú và đang ở Làng (gốc tự báo các trường hợp còn lại) */
  if(last){
    var c=check();
    if(!c.okMilestone){msg=noteOf(c);ui();return}
    var base=0;try{base=typeof peg==='function'?peg(p):0}catch(e){}
    if(gold<base+CF.gold){msg='Thiếu vàng: cần '+nf(base+CF.gold)+'💰 (gồm '+nf(CF.gold)+'💰 phí Thức Tỉnh)';ui();return}}
  var before=p?p.ev:-1,r=oPev.apply(this,arguments);
  try{if(last&&p&&before===2&&p.ev===3){gold=Math.max(0,gold-CF.gold);msg=(msg||'')+' · −'+nf(CF.gold)+'💰 phí Thức Tỉnh';try{sv()}catch(e){}ui()}}catch(e){}
  return r};
petUI=function(){
  var h=oUI.apply(this,arguments);var p=null;try{p=pet()}catch(e){}
  if(!p||p.ev!==2||typeof h!=='string')return h;
  var c=check();
  if(!c.okMilestone)h=h.replace(/<button[^>]*onclick="pev\(\)">[^<]*<\/button>/,'<button disabled>🔒 Tiến hóa cấp 4</button>');
  return h+panel(c)};
window.PETEV4={cfg:CF,check:check};
})();
