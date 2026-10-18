/* ===== 👑 4 Ô TRANG BỊ HOÀNG KIM (ui/100-o-hoang-kim.js) — Fix311 — nạp SAU ui/99-ma-qua.js =====
 * Tab 🎒 Túi, hàng dưới cùng của khung nhân vật (.eqd): 2 ô BÊN TRÁI + 2 ô BÊN PHẢI ô thú nuôi = 4 ô Hoàng Kim.
 * Hiện tại chưa có trang bị Hoàng Kim → 4 ô đang trống (khoá mờ). Chạm 1 ô → bảng giới thiệu → nút "Đến Nhà Trang Sức Hoàng Kim":
 *   đóng túi, dịch chuyển tới Làng Tân Thủ 2 (BDT.go('l2') — luật Lv60 giữ nguyên) rồi tự đi bộ tới
 *   🏠 Nhà Chế Tạo Trang Sức Hoàng Kim (TT2.goHouse(1)). Chức năng chế tác trong nhà: CẬP NHẬT SAU (nhà hiện "Cập nhật sau").
 * Móc cập nhật sau:
 *   HK.slots[i] = {n:'Tên ô', e:'emoji'}  (đổi tên/biểu tượng 4 ô)
 *   HK.items[i] = {n,ic,d}  (ic: emoji hoặc url ảnh) → ô hiện món đã mặc; chạm vào hiện mô tả.
 * Không sửa core: bọc window.ui() để chèn ô. Gỡ = xoá thẻ script trong index.html.
 * Phụ thuộc (đều kiểm tra tồn tại): BDT (world/101), TT2 (world/100), CSS .tsm-ov/.tsm-bx/.tsm-x của ui/95. API: HK.open(i) · HK.close() · HK.go() */
(function(){
'use strict';
if(window.HK||typeof ui!=='function')return;
var HK=window.HK={slots:[{n:'Ô Hoàng Kim 1',e:'👑'},{n:'Ô Hoàng Kim 2',e:'⚜️'},{n:'Ô Hoàng Kim 3',e:'🪙'},{n:'Ô Hoàng Kim 4',e:'💠'}],items:[null,null,null,null]};
var GOLD='#f2c14e';
var st=document.createElement('style');st.id='hk-css';
st.textContent='.hk-row{grid-column:2;grid-row:5;display:flex;justify-content:space-between;align-items:center;pointer-events:none;position:relative;z-index:4;min-width:0}'
+'.hk-g{flex:1 1 0;min-width:0;display:flex;justify-content:center;gap:3px;padding:0 2px}'
+'.hk-s{pointer-events:auto;flex:1 1 0;min-width:0;max-width:var(--eq-cell,46px);aspect-ratio:1/1;box-sizing:border-box;border:2px solid #8a6a20;border-radius:7px;'
+'background:radial-gradient(circle at 50% 35%,#4a3818,#140d0a);display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent;'
+'box-shadow:inset 0 0 6px #f2c14e55,0 0 5px #f2c14e44}'
+'.hk-s.em{opacity:.75}.hk-s.em>b{opacity:.55;filter:grayscale(.4)}.hk-s.on{border-color:#ffd870;box-shadow:inset 0 0 8px #f2c14e99,0 0 8px #f2c14e88}'
+'.hk-s>b{font-weight:normal}.hk-s img{width:80%;height:80%;object-fit:contain}'
+'.hk-s::after{content:"+";position:absolute;right:2px;bottom:0;font-size:11px;color:#ffd870;font-weight:bold;opacity:.9}.hk-s.on::after{content:""}';
document.head.appendChild(st);
function ico(v){return /^(data:|https?:|assets\/|\.\/)/.test(v||'')?'<img src="'+v+'">':(v||'❔')}
function inject(){
  var eqd=document.querySelector('#bag .eqd');if(!eqd||eqd.querySelector('.hk-row'))return;
  var h='<div class="hk-row"><div class="hk-g">';
  for(var i=0;i<4;i++){
    var it=HK.items[i],sl=HK.slots[i];
    if(i===2)h+='</div><div style="width:56px;flex:none"></div><div class="hk-g">';
    h+='<div class="hk-s '+(it?'on':'em')+'" onclick="HK.open('+i+')" title="'+sl.n+'"><b>'+(it?ico(it.ic):sl.e)+'</b></div>';
  }
  eqd.insertAdjacentHTML('beforeend',h+'</div></div>');
}
function close(){var o=document.getElementById('hk-ov');if(o)o.remove()}
function open(i){
  close();var it=HK.items[i],sl=HK.slots[i]||HK.slots[0],h;
  h='<h3>👑 '+sl.n+'</h3>'
   +(it?'<small>'+(it.d||'')+'</small><div class="tsm-g" style="grid-template-columns:1fr"><div class="tsm-it on"><div class="ic">'+ico(it.ic)+'</div><b>'+it.n+'</b></div></div>'
       :'<small>Ô dành cho <b style="color:'+GOLD+'">Trang Bị Hoàng Kim</b>. Hiện đang trống.<br>Trang bị Hoàng Kim được chế tác tại <b>🏯 Làng Tân Thủ 2 → Nhà Chế Tạo Trang Sức Hoàng Kim</b>.</small>'
        +'<div class="tsm-g" style="grid-template-columns:1fr"><div class="tsm-it"><div class="ic">'+sl.e+'</div><b>Chưa có trang bị</b><em>Chức năng chế tác: sắp ra mắt</em></div></div>')
   +'<div style="display:flex;gap:8px;justify-content:flex-end"><button class="tsm-x" style="margin:8px 0 0;background:#6a4a14;border-color:#ffd870" onclick="HK.go()">🏯 Đến Nhà Trang Sức</button>'
   +'<button class="tsm-x" style="margin:8px 0 0" onclick="HK.close()">Đóng</button></div>';
  var o=document.createElement('div');o.id='hk-ov';o.className='tsm-ov';o.style.setProperty('--tc',GOLD);
  o.innerHTML='<div class="tsm-bx">'+h+'</div>';
  o.addEventListener('click',function(e){if(e.target===o)close()});document.body.appendChild(o);
}
/* đi tới Làng Tân Thủ 2 rồi tự đi bộ tới nhà Trang Sức Hoàng Kim (HOUSES[1] của world/100) */
function go(){
  close();
  try{
    if(window.BDT&&BDT.go)BDT.go('l2');
    else if(window.TT2&&TT2.enter){if(typeof bo!=='undefined'&&bo&&typeof tg==='function')tg();TT2.enter()}
    if(window.TT2&&TT2.on&&TT2.on()&&TT2.goHouse)TT2.goHouse(1);
  }catch(e){try{console.warn('HK',e)}catch(x){}}
}
HK.open=open;HK.close=close;HK.go=go;
var _ui=window.ui;
window.ui=function(){var a=_ui.apply(this,arguments);try{inject()}catch(e){console.warn('HK',e)}return a};
try{if(typeof bo!='undefined'&&bo)window.ui()}catch(e){}
})();
