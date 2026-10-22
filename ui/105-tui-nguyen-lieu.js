/* ui/105-tui-nguyen-lieu.js — Fix375: TÚI 6 & TÚI 7 (túi nguyên liệu, xếp chồng)
   - Túi 6 🧱: nguyên liệu cường hoá · nguyên liệu up cánh · rương thưởng (👝 Túi Vàng 1/2/3 Triệu do Nguyên Anh đào khoáng nhặt được).
   - Túi 7 ⚗: nguyên liệu luyện đan (hạt giống, dược thảo) · khoáng sản (Quặng Sắt, Huyền Kim).
   - Mỗi loại nguyên liệu = 1 ô, số lượng hiện ×N (xếp chồng, không giới hạn). Dữ liệu đọc/ghi thẳng vào kho gốc của từng hệ thống
     (DCH, PS[cur].csh, wfr…lvu, FM.get(), MN.get()) nên KHÔNG đổi save và không đụng logic cũ.
   - Thêm nguyên liệu mới: thêm 1 dòng vào DEF bên dưới (bag 5 = Túi 6, bag 6 = Túi 7). */
(function(){
'use strict';
var sel=null;
var n=function(x){try{return fmtN(x)}catch(e){return String(x)}};
var csh=function(k){try{return (PS[cur].csh&&PS[cur].csh[k])|0}catch(e){return 0}};
var dch=function(k){try{return (window.DCH&&DCH.get()[k])|0}catch(e){return 0}};
var WG=[function(){return wfr},function(){return wf2},function(){return wf3},function(){return wf4},function(){return wf5}];
var DEF=[];
function add(bag,cat,id,e,name,desc,get,act){DEF.push({bag:bag,cat:cat,id:id,e:e,n:name,d:desc,get:get,act:act})}
/* ===== Túi 6 ===== */
add(5,'🔨 Cường hoá','da_a','🪨','Đá Cường Hóa','Cường hóa +0→+7 (1 viên/lần).',function(){return dch('a')});
add(5,'🔨 Cường hoá','da_b','💠','Đá Cường Hóa Cao Cấp','Cường hóa +7→+15 (3 viên/lần).',function(){return dch('b')});
[['b10','📜','Bùa Cường Hóa +10%'],['b15','📜','Bùa Cường Hóa +15%'],['b20','📜','Bùa Cường Hóa +20%'],['bcr','🛡','Bùa Chống Rơi'],['dh','🔮','Ngọc Định Hồn'],['dh2','🔮','Đại Định Hồn'],['ham','🔨','Búa Đục Lỗ'],['g10','📜','Bùa Ghép Ngọc +10%'],['v11','🎟','Vé Cường Hóa +11'],['v15','🎫','Vé Cường Hóa +15']].forEach(function(a){
  add(5,'🔨 Cường hoá','c_'+a[0],a[1],a[2],'Dùng ở bảng món đồ (Cường hóa) / Cửa hàng Linh Vân.',function(){return csh(a[0])})});
for(var i=0;i<5;i++)(function(i){add(5,'🪽 Cánh','w'+i,'🪽','Mảnh Cánh Cấp '+(i+1),'Hợp thành Cánh cấp '+(i+1)+' ở tab 🪽 Cánh.',WG[i])})(i);
add(5,'🪽 Cánh','lvu','🐉','Mảnh Long Vũ Thiên Thần','Dùng để hợp Cánh Cấp 4.',function(){return lvu});
var GBN=['1 Triệu','2 Triệu','3 Triệu'];
for(var t=0;t<3;t++)(function(t){add(5,'🎁 Rương thưởng','gb'+t,'👝','Túi Vàng '+GBN[t],'Nguyên Anh đào khoáng nhặt được (0,3%/phút). Mở để chuyển thành 💰 '+GBN[t]+' vàng.',
  function(){try{return MN.get().gb[t]|0}catch(e){return 0}},
  function(all){var g=MN.openGb(t,all);if(g)return '👝 Đã chuyển '+n(g)+' vàng vào rương nhân vật 💰';return ''})})(t);
/* ===== Túi 7 ===== */
try{FM.HB.forEach(function(b){
  add(6,'🌱 Hạt giống','s_'+b.id,'🌱','Hạt '+b.n,'Gieo ở tab 🌱 Linh Điền.',function(){return FM.get().seeds[b.id]|0});
  add(6,'⚗ Dược thảo','h_'+b.id,b.e,b.n,'Dùng luyện đan: '+b.u,function(){return FM.get().herbs[b.id]|0})})}catch(e){}
add(6,'⛏ Khoáng sản','fe','🔩','Quặng Sắt','Khai khoáng · công dụng cập nhật sau.',function(){try{return MN.get().fe|0}catch(e){return 0}});
add(6,'⛏ Khoáng sản','hk','🌑','Huyền Kim','Khai khoáng · công dụng cập nhật sau.',function(){try{return MN.get().hk|0}catch(e){return 0}});
function list(bag){var o=[];DEF.forEach(function(d){if(d.bag===bag){var c=0;try{c=d.get()|0}catch(e){}if(c>0||d.keep)o.push({d:d,c:c})}});return o}
function stacks(bag){return list(bag).length}
function grid(bag){
  var L=list(bag),h='',cats={};
  if(!L.length)return '<div class="st" style="text-align:center;opacity:.7;margin:10px 0">Túi trống. '+(bag===5?'Đá cường hóa, mảnh cánh, Túi Vàng… sẽ tự xếp chồng vào đây.':'Hạt giống, dược thảo, khoáng sản sẽ tự xếp chồng vào đây.')+'</div>';
  L.forEach(function(x){(cats[x.d.cat]=cats[x.d.cat]||[]).push(x)});
  Object.keys(cats).forEach(function(c){
    h+='<div class="st" style="margin:6px 0 2px;opacity:.85">'+c+'</div><div class="gr5">'+cats[c].map(function(x){
      var on=sel===x.d.id;
      return '<div class="ce" onclick="NLB.pick(\''+x.d.id+'\')" style="position:relative;border-color:'+(on?'#fff':'#a08a5a')+';'+(on?'box-shadow:0 0 8px #fff;':'')+'display:flex;align-items:center;justify-content:center;font-size:26px">'+x.d.e+'<i style="position:absolute;right:2px;bottom:0;font-size:11px;font-style:normal;font-weight:bold;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000">×'+(x.c>=1e5?n(x.c/1e3)+'k':n(x.c))+'</i></div>'}).join('')+'</div>'});
  var d=null;DEF.forEach(function(q){if(q.id===sel&&q.bag===bag)d=q});
  if(d){var c=0;try{c=d.get()|0}catch(e){}
    h+='<div class="dt"><b>'+d.e+' '+d.n+'</b> ×'+n(c)+'<br><small>'+d.d+'</small>'+(d.act&&c>0?'<div class="fmb" style="margin-top:6px"><button onclick="NLB.act(\''+d.id+'\',0)">Mở 1</button><button onclick="NLB.act(\''+d.id+'\',1)">Mở hết (×'+n(c)+')</button></div>':'')+'</div>'}
  else h+='<div class="st" style="text-align:center;opacity:.7;margin-top:6px">Chạm vào một ô để xem chi tiết</div>';
  return h}
window.NLB={grid:grid,stacks:stacks,
  pick:function(id){sel=sel===id?null:id;try{ui()}catch(e){}},
  act:function(id,all){DEF.forEach(function(d){if(d.id===id&&d.act){var m=d.act(all);if(m){try{msg=m}catch(e){}try{sv()}catch(e){}}}});try{ui()}catch(e){}},
  add:add};
})();
