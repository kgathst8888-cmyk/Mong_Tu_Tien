/* ===== 💍 OPT "CẤP THẦN THÔNG" CHO NHẪN =====
 * Thuộc tính mới: it.ttl = 1..3 → tăng cấp TẤT CẢ kỹ năng thần thông thêm ttl cấp (cộng dồn các món đang mặc).
 *  - Chỉ xuất hiện trên NHẪN (loại s=7/8). Nhẫn thường: SIÊU HIẾM, tỉ lệ theo phẩm (CF.chance). Nhẫn Thánh (Bộ Thánh): CHẮC CHẮN có, ngẫu nhiên 1-3.
 *  - Lưu riêng ở it.ttl (không nằm trong it.x nên không bị Rèn lại opt / cường hóa làm mất). Không bị tự bán / bán nhanh / dọn đồ yếu.
 * Tác dụng của mỗi +1 cấp:
 *  - Kỹ năng Linh Căn: tầng +1 (systems/18-linh-can.js: L0() và cast() cộng TTLB.n(); công thức tuyến tính nên >15 vẫn đúng).
 *  - Thần thông (6 hệ × 5) và tiên thuật: sức mạnh +CF.pct (10%) qua lcMul() (nhân sát thương/buff/nội tại).
 * Móc trong engine: gen() bọc ở đây; HL.gen (nhẫn Thánh) gọi TTLB.holyOk/holy; xHtml hiển thị dòng opt; SPK/autoKeep/sa/pk bỏ qua đồ có ttl.
 * Chỉnh: khối CF. holyAll=true nếu muốn MỌI món Thánh (không chỉ nhẫn) đều có opt này. */
(function(){
'use strict';
if(typeof gen!=='function'||typeof EQ==='undefined')return;
var CF={chance:[.001,.001,.002,.004,.008,.015],pct:.10,holyAll:false};
function isRing(it){return it&&(it.s===7||it.s===8)}
function roll(){return 1+Math.floor(Math.random()*3)}
function n(){try{var t=0;EQ.forEach(function(it){if(it&&it.ttl>0)t+=it.ttl|0});return t}catch(e){return 0}}
function m(){return 1+CF.pct*n()}
function maybe(it){
  try{
    if(!it||it.hl||it.ttl||!isRing(it))return it;
    if(Math.random()<(CF.chance[it.r]||0))it.ttl=roll();
  }catch(e){}
  return it;
}
var _gen=gen;
gen=function(){return maybe(_gen.apply(this,arguments))};
/* Nhẫn/đồ Thánh: HL.gen trong engine gọi 2 hàm này */
function holyOk(s){return s===7||s===8||CF.holyAll}
/* Tăng sức mạnh mọi thần thông/tiên thuật */
if(typeof window.lcMul==='function'){
  var _lm=window.lcMul;
  window.lcMul=function(i){return _lm(i)*m()};
}
/* Dòng thông tin ở tab Tu Tiên / Linh Căn */
if(typeof window.lcUI==='function'){
  var _u=window.lcUI;
  window.lcUI=function(){
    var h=_u.apply(this,arguments),k=n();
    if(!k||typeof h!=='string')return h;
    return h+'<div class="dt">💍 Nhẫn Thần Thông: <b style="color:#ffd76a">+'+k+' cấp</b> mọi thần thông — kỹ năng Linh Căn +'+k+' tầng, thần thông/tiên thuật +'+Math.round(CF.pct*k*100)+'% sức mạnh.</div>';
  };
}
window.TTLB={n:n,m:m,holy:roll,holyOk:holyOk,maybe:maybe,cfg:CF};
})();
