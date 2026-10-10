/* ===== 💎 HỆ OPT TRANG BỊ MỚI (giới hạn chỉ số) + KỸ NĂNG +10 CHO VŨ KHÍ =====
 * Khoảng giá trị MỖI dòng opt (không còn tăng theo cấp/phẩm đồ; bậc roll z=0..10 chia đều trong khoảng):
 *   Sát thương 2-10 · Tăng % HP 2-10 · Tăng % mana 2-10 · Sát thương kỹ năng 5-15
 *   Chí mạng / Né tránh / Chính xác / Xuyên giáp / Giảm sát thương / Tỉ lệ gây choáng / Tỉ lệ đóng băng: 2-5
 *   Sát thương kỹ năng THEO THỜI GIAN (độc, bỏng, chảy máu, chập, ma ám…) 10-20 · Sát thương chí mạng 5-15
 *   Tốc độ thi triển kỹ năng (Chiến binh + Cung thủ; nhân luôn cho thần thông) 10-20 · Tốc độ niệm chú (chỉ Pháp sư) 10-20
 *   MỚI: Bỏ qua giảm sát thương 2-5 · Tăng % giáp 5-10      (giữ nguyên: hút máu, hút năng lượng, tăng vàng; kháng hiệu ứng thu về 2-5)
 * Đồ cũ được CHUẨN HOÁ 1 lần (bậc roll cũ → khoảng mới; đổi aspd↔cspd theo lớp nhân vật). Đồ Thánh: 7 dòng, mỗi dòng ở mức TỐI ĐA.
 * Vũ khí cường hoá đến +10: ngẫu nhiên 1 trong 2 kỹ năng (it.sk), chỉ vũ khí:
 *   'mb' Triệt tiêu mana: 10% mỗi lần thi triển kỹ năng, phá 20% năng lượng tối đa của mục tiêu (quái chưa có thanh mana → thanh ảo 100;
 *       cạn mana thì mất lượt đánh ~2,5s rồi hồi đầy)    'hb' Triệt tiêu HP: 5% mỗi lần thi triển, phá 10% HP tối đa của mục tiêu.
 *   Không áp dụng cho Boss (b>0, boss, Ma Thần). Kích hoạt khi tung kỹ năng thường và tiên thuật (thần thông có hàm riêng, chưa gắn).
 * Móc trong engine (patch nhỏ): roll (rollXM bọc ở đây), kxv (rèn lại opt), HL.gen (đồ Thánh), df() (+% giáp), dm() (bỏ qua giảm ST),
 *   cast() (tốc độ thi triển/niệm), đánh thường (bỏ aspd), xHtml (dòng kỹ năng); world/34, 49 (thời gian thi triển thần thông), 50 (dotX ×dotd).
 * Chỉnh số: khối CF. Phụ thuộc: AXN/AXU/AXF/xQ/rollXM/gen/en1/fire/ZS/near/R/SX/EQ/BAGS/EQS/CHR/PS/cur (engine). */
(function(){
'use strict';
if(typeof rollXM!=='function'||typeof AXN==='undefined'||typeof gen!=='function')return;
var CF={
 /* key:[min,max] */
 R:{dmgp:[2,10],hpp:[2,10],mpp:[2,10],sdmg:[5,15],crit:[2,5],dodge:[2,5],acc:[2,5],prc:[2,5],dred:[2,5],stnc:[2,5],frzc:[2,5],
    dotd:[10,20],cdmg:[5,15],aspd:[10,20],cspd:[10,20],ndr:[2,5],defp:[5,10],eres:[2,5]},
 holyKeys:['dmgp','hpp','mpp','sdmg','crit','dodge','acc','prc','dred','stnc','frzc','dotd','cdmg','ndr','defp'],
 weapon:0,                         /* it.s của vũ khí */
 sk:{mb:{chance:.10,cut:.20,name:'Triệt tiêu mana',d:'10% mỗi lần thi triển kỹ năng: phá huỷ 20% năng lượng tối đa của mục tiêu (không áp dụng Boss)'},
     hb:{chance:.05,cut:.10,name:'Triệt tiêu HP',d:'5% mỗi lần thi triển kỹ năng: phá huỷ 10% HP tối đa của mục tiêu (không áp dụng Boss)'}},
 lvSk:10,                          /* cấp cường hoá nhận kỹ năng */
 silence:150,                      /* khung hình mất lượt đánh khi cạn mana */
 capCast:1                         /* trần cộng dồn tốc độ thi triển/niệm (1 = +100%) */
};
/* ---- nhãn mới (AXN là const nhưng thuộc tính sửa được; engine/giao diện đọc lại mỗi lần vẽ) ---- */
Object.assign(AXN,{dmgp:'Sát thương',hpp:'Tăng % HP',mpp:'Tăng % mana',sdmg:'Sát thương kỹ năng',crit:'Chí mạng',dodge:'Né tránh',acc:'Chính xác',
  prc:'Xuyên giáp',dred:'Giảm sát thương',stnc:'Tỉ lệ gây choáng',frzc:'Tỉ lệ đóng băng',dotd:'Sát thương kỹ năng theo thời gian',cdmg:'Sát thương chí mạng',
  aspd:'Tốc độ thi triển kỹ năng',cspd:'Tốc độ niệm chú',ndr:'Bỏ qua giảm sát thương',defp:'Tăng % giáp',eres:'Kháng hiệu ứng'});
AXU.ndr=1;AXU.defp=1;                       /* tránh NaN khi xQ suy bậc cho đồ không có xq */

function cls(i){try{return CHR[i===undefined?cur:i].t}catch(e){return 'w'}}
function round1(v){return Math.round(v*10)/10}
function val(k,z){var r=CF.R[k];return r?round1(r[0]+(r[1]-r[0])*z/10):null}
function poolFor(c,weapon){
  var ks=Object.keys(CF.R).filter(function(k){return !(k==='cspd'&&c!=='m')&&!(k==='aspd'&&c==='m')});
  ks.push('goldp');if(weapon)ks=ks.concat(['ls','ms']);return ks}
function shuffle(a){return a.sort(function(){return R()-.5})}

/* ---- roll mới thay rollXM ---- */
rollXM=function(r,l,mp,s){
  var n=r>=6?7:1+Math.floor(R()*6),ks=shuffle(poolFor(cls(),s===CF.weapon)).slice(0,n),x={},q={};
  ks.forEach(function(k){var z=Math.floor(R()*11);q[k]=z;
    x[k]=AXF[k]?round1(AXF[k][0]+(AXF[k][1]-AXF[k][0])*z/10):val(k,z)});
  return{x:x,q:q}};
/* gen(): đánh dấu đồ mới đã đúng thang (o2) */
var _gen=gen;gen=function(){var it=_gen.apply(this,arguments);if(it&&typeof it==='object')it.o2=1;return it};

/* ---- Rèn lại opt (kxv) + đồ Thánh ---- */
function kxv(i,k,z){var v=val(k,z);if(v!=null)return v;if(AXF[k])return round1(AXF[k][0]+(AXF[k][1]-AXF[k][0])*z/10);return i.x[k]}
function holyX(){var x={};shuffle(CF.holyKeys.filter(function(k){return !(k==='cspd'&&cls()!=='m')&&!(k==='aspd'&&cls()==='m')}).slice()).slice(0,7).forEach(function(k){x[k]=val(k,10)});return x}

/* ---- chuẩn hoá đồ cũ (idempotent) ---- */
function norm(it,c){
  if(!it||typeof it!=='object'||!it.x||it.o2)return 0;
  var x={},nq={},ch=0;
  Object.keys(it.x).forEach(function(k){
    var z;try{z=xQ(it,k)}catch(e){z=5}
    var nk=k;
    if(k==='aspd'&&c==='m')nk='cspd';else if(k==='cspd'&&c!=='m')nk='aspd';
    var v=val(nk,z);if(v==null)v=it.x[k];
    if(x[nk]==null||z>nq[nk]){x[nk]=v;nq[nk]=z}
    if(nk!==k||v!==it.x[k])ch=1});
  it.x=x;it.xq=nq;it.o2=1;return ch}
function sweep(){
  try{
    if(typeof started==='undefined'||!started)return;
    for(var i=0;i<3;i++){
      var c=cls(i);
      [BAGS[i],EQS[i]].forEach(function(A){(A||[]).forEach(function(it){
        if(!it)return;norm(it,c);
        if(it.s===CF.weapon&&(it.u|0)>=CF.lvSk&&!it.sk)it.sk=R()<.5?'mb':'hb'})})}
  }catch(e){}}
setInterval(sweep,2000);

/* ---- Cường hoá +10: vũ khí nhận ngẫu nhiên 1 trong 2 kỹ năng ---- */
if(typeof en1==='function'){
  var _en=en1;en1=function(){
    var it=null;try{it=sel&&(sel.k=='e'?EQ[sel.i]:BAG[sel.i])}catch(e){}
    var r=_en.apply(this,arguments);
    try{if(it&&it.s===CF.weapon&&(it.u|0)>=CF.lvSk&&!it.sk){it.sk=R()<.5?'mb':'hb';msg='✅ +'+it.u+' · Vũ khí thức tỉnh kỹ năng: '+CF.sk[it.sk].name+'!';ui()}}catch(e){}
    return r};
}

/* ---- tốc độ thi triển (dùng cho thần thông: world/34, 49) ---- */
function cs(){try{return 1+Math.min(CF.capCast,SX(TK()==='m'?'cspd':'aspd')/100)}catch(e){return 1}}

/* ---- kỹ năng vũ khí: Triệt tiêu mana / HP ---- */
function isBoss(e){return !!e&&(e.b>0||e.k==='boss'||e.mt||e.ks)}
function nearest(){try{return near(1400)||E.filter(function(e){return e.hp>0&&e.in<=0})[0]}catch(e){return null}}
function proc(){
  try{
    var w=EQ[CF.weapon];if(!w||!w.sk||!CF.sk[w.sk])return;
    var e=nearest();if(!e||e.hp<=0||isBoss(e))return;
    var s=CF.sk[w.sk];if(R()>=s.chance)return;
    if(w.sk==='hb'){
      var d=Math.max(1,Math.round((e.max||e.hp)*s.cut));e.hp-=d;
      DT.push({x:e.x,y:(e.hh||100)*SZ+14,s:'💀 Triệt tiêu HP −'+d,c:'#ff5a7a',g:1,l:60});
    }else{
      if(e.mmp==null){e.mmp=100;e.mp=100}
      e.mp=Math.max(0,e.mp-e.mmp*s.cut);
      DT.push({x:e.x,y:(e.hh||100)*SZ+14,s:'🔋 Triệt tiêu mana −'+Math.round(s.cut*100)+'%',c:'#7fd0ff',g:1,l:60});
      if(e.mp<=0){e.cd=Math.max(e.cd||0,CF.silence);e.mp=e.mmp;DT.push({x:e.x,y:(e.hh||100)*SZ+34,s:'Cạn năng lượng!',c:'#cfeaff',l:60})}
    }
  }catch(x){}}
if(typeof fire==='function'){var _fire=fire;fire=function(){var r=_fire.apply(this,arguments);proc();return r}}
try{if(typeof ZS!=='undefined'&&ZS.zf&&!ZS.__opt2){var _zf=ZS.zf;ZS.zf=function(){var r=_zf.apply(this,arguments);proc();return r};ZS.__opt2=1}}catch(e){}

window.OPT2={cfg:CF,cs:cs,kxv:kxv,holyX:holyX,norm:norm,sweep:sweep,val:val,proc:proc,pool:poolFor};
})();
