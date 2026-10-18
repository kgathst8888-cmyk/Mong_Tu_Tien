/* ===== MỘT NHÂN VẬT DUY NHẤT (systems/93-single-char.js) =====
 * - Tạo nhân vật: chỉ chọn 1 trong 3 lớp + đặt tên (hỏi xác nhận, không đổi được sau khi tạo).
 * - Bỏ thanh chuyển 3 nhân vật (core/01m charUI); chỉ còn nhân vật của mình.
 * - Tài khoản cũ có nhiều nhân vật: khi "Chơi tiếp" tự giữ nhân vật LỰC CHIẾN CAO NHẤT
 *   (công×5 + thủ×3 + HP÷5, cùng công thức bảng xếp hạng), các slot còn lại reset về trống.
 *   Giữ lại .csh/.td (kho Cửa hàng Linh Vân + hồi chiêu Thánh Địa gắn với ví Linh Thạch tài khoản).
 * - Cờ PS[cur].one=1 đánh dấu đã chuyển sang 1 nhân vật (lưu cùng PS nên đồng bộ mây).
 * Nạp CUỐI index.html, không đổi cấu trúc dữ liệu 3 slot cũ. */
(function(){
'use strict';
if(typeof ld!=='function'||typeof ng!=='function'||typeof PS==='undefined')return;
var KEEP={csh:1,td:1};
function powOf(i){var c0=cur,e0=EQ,l0=P.lv,r=0;
  try{cur=i;EQ=EQS[i];P.lv=((i==c0?l0:PS[i].lv)|0)||1;r=Math.max(0,Math.round(atk()*5+df()*3+mx()/5))}catch(e){r=0}
  finally{cur=c0;EQ=e0;P.lv=l0}
  return r}
function wipe(i){var p=PS[i];if(!p)return;
  Object.keys(p).forEach(function(k){if(!KEEP[k])delete p[k]});
  Object.assign(p,{lv:1,xp:0,pts:0,tier:0,br:-1,al:[0,0,0,0],cv:{r:-1,s:0,q:0,f:0},pet:null});
  EQS[i]=Array(NS).fill(null);BAGS[i]=[]}
/* Fix299: BỎ cơ chế tự giữ nhân vật lực chiến cao nhất + xoá (wipe) các slot còn lại.
   Lực chiến đổi theo trang bị đang mặc (tháo đồ → tụt lực chiến) nên có thể xoá nhầm nhân vật cấp cao.
   Nay chỉ đánh dấu cờ one=1 cho nhân vật đang chơi, KHÔNG sw(), KHÔNG wipe() — mọi nhân vật được giữ nguyên. */
function migrate(){
  if(typeof started==='undefined'||!started||!P||!PS[cur]||PS[cur].one)return;
  PS[cur].one=1;
  try{sv()}catch(e){}}
var _ld=ld;
ld=function(){var r=_ld.apply(this,arguments);try{migrate()}catch(e){}return r};
var _ng=ng;
ng=function(){
  var e=document.getElementById('pn');
  if(e){var nm=String(e.value||'').replace(/\s+/g,' ').trim();
    if(!nm){alert('Hãy đặt tên cho nhân vật.');return}
    if(!confirm('Tạo nhân vật "'+nm+'" ('+CHR[pc].n+')?\nChỉ được 1 nhân vật duy nhất, không thể đổi sau khi tạo.'))return}
  var r=_ng.apply(this,arguments);
  try{PS[cur].one=1}catch(x){}
  return r};
if(typeof window!=='undefined'){window.ld=ld;window.ng=ng}
})();
