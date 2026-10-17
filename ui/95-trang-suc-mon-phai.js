/* ===== 💍 Ô TRANG SỨC MÔN PHÁI + 📖 BÍ KÍP LUYỆN THỂ (ui/95-trang-suc-mon-phai.js) — Fix245 — nạp sau world/98 =====
 * Trong tab 🎒 Túi, khung nhân vật (.eqd .chp):
 *   • BÊN PHẢI nhân vật: 4 ô trang sức môn phái (chỉ mở khi đã chọn môn phái ở Vạn Pháp Tháp – Tiên Giới; chưa chọn thì khoá 🔒).
 *     Chạm vào ô → hiện bảng bộ trang sức 4 món của môn phái (nội dung món/chỉ số: CẬP NHẬT SAU).
 *   • BÊN TRÁI nhân vật: 1 ô 📖 Bí kíp luyện thể (CẬP NHẬT SAU, hiện đang khoá).
 * Không đụng core: bọc window.ui(), sau khi vẽ túi thì chèn ô vào .chp. Gỡ = xoá thẻ script trong index.html.
 * Móc cập nhật sau:
 *   TSM.items[idMon] = [4 món]  (mỗi món {n:'Tên', ic:'emoji|url ảnh', d:'mô tả'}) → bảng sẽ tự hiện món thật.
 *   TSM.bikip = {n,ic,d} → ô bí kíp hết khoá và hiện bí kíp.  TSM.setBonus[idMon] = 'mô tả hiệu ứng đủ 4 món'.
 * Chỉnh: TSM.cell (cỡ ô px). API: TSM.sect() · TSM.open('jw'|'bk') · TSM.close().
 */
(function(){
'use strict';
if(window.TSM||typeof ui!='function')return;
var TSM=window.TSM={cell:34,items:{},bikip:null,setBonus:{}};
var SLOT_IC=['📿','💍','🔱','🏵'],SLOT_NM=['Ngọc bội','Nhẫn','Hộ phù','Huy hiệu'];
function sect(){try{if(window.VPD&&VPD.sect)return VPD.sect()||''}catch(e){}try{if(window.VP&&VP.get)return VP.get()||''}catch(e){}return''}
function info(id){try{var a=VP.SECTS;for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i]}catch(e){}return null}
TSM.sect=sect;
var st=document.createElement('style');st.id='tsm-css';
st.textContent='.chp .tsm-c{position:absolute;display:flex;flex-direction:column;gap:4px;z-index:3}'
+'.chp .tsm-l{left:4px;top:6px}.chp .tsm-r{right:4px;top:6px}'
+'.tsm-s{width:var(--tsm,34px);height:var(--tsm,34px);box-sizing:border-box;border:2px solid #5a4630;border-radius:7px;background:#1a110c;display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent}'
+'.tsm-s.lk{opacity:.55;filter:grayscale(.6)}.tsm-s.on{background:radial-gradient(#4a3426,#140d0a);box-shadow:0 0 6px var(--tc,#b8964e)}'
+'.tsm-s img{width:80%;height:80%;object-fit:contain}'
+'.tsm-s i{position:absolute;right:-3px;bottom:-3px;font-size:10px;font-style:normal;background:#000b;border-radius:6px;padding:0 2px}'
+'.tsm-ov{position:fixed;inset:0;z-index:99999;background:#000a;display:flex;align-items:center;justify-content:center;padding:16px}'
+'.tsm-bx{width:100%;max-width:340px;background:#2a1b12;border:2px solid var(--tc,#b8964e);border-radius:12px;padding:14px;color:#f1e3c4;font-size:14px;box-shadow:0 0 18px #000}'
+'.tsm-bx h3{margin:0 0 4px;font-size:16px;color:var(--tc,#e8c878)}.tsm-bx small{opacity:.8;display:block;margin-bottom:8px;line-height:1.35}'
+'.tsm-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}'
+'.tsm-it{border:2px solid #5a4630;border-radius:8px;background:#1a110c;padding:8px 6px;text-align:center;min-height:76px}.tsm-it.on{border-color:var(--tc,#b8964e)}'
+'.tsm-it b{display:block;font-size:12px;margin-top:3px}.tsm-it em{display:block;font-size:11px;opacity:.65;font-style:normal;margin-top:2px}.tsm-it .ic{font-size:26px;line-height:1.1}.tsm-it .ic img{width:34px;height:34px;object-fit:contain}'
+'.tsm-x{display:block;margin:8px 0 0 auto;padding:6px 16px;border:1px solid #b8964e;border-radius:8px;background:#3a2718;color:#f1e3c4;font-size:14px}';
document.head.appendChild(st);
function ico(v){return /^(data:|https?:|assets\/|\.\/)/.test(v||'')?'<img src="'+v+'">':(v||'❔')}
function inject(){
  var chp=document.querySelector('#bag .eqd .chp');if(!chp||chp.querySelector('.tsm-c'))return;
  chp.parentNode.style.setProperty('--tsm',TSM.cell+'px');
  var id=sect(),S=id?info(id):null,col=S?S.c:'#b8964e',on=!!S,bk=TSM.bikip;
  var R='<div class="tsm-c tsm-r">';
  for(var i=0;i<4;i++){var it=(TSM.items[id]||[])[i];
    R+='<div class="tsm-s '+(on?'on':'lk')+'" style="--tc:'+col+'" onclick="TSM.open(\'jw\')" title="Trang sức môn phái">'+(on?(it?ico(it.ic):SLOT_IC[i]):'🔒')+'</div>'}
  R+='</div>';
  var L='<div class="tsm-c tsm-l"><div class="tsm-s '+(bk?'on':'lk')+'" onclick="TSM.open(\'bk\')" title="Bí kíp luyện thể">'+(bk?ico(bk.ic):'📖')+(bk?'':'<i>🔒</i>')+'</div></div>';
  chp.insertAdjacentHTML('beforeend',L+R);
}
function close(){var o=document.getElementById('tsm-ov');if(o)o.remove()}
function open(k){
  close();var id=sect(),S=id?info(id):null,col=S?S.c:'#b8964e',h;
  if(k=='bk'){
    var b=TSM.bikip;
    h=b?'<h3>'+ico(b.ic)+' '+b.n+'</h3><small>'+(b.d||'')+'</small>'
      :'<h3>📖 Bí kíp luyện thể</h3><small>Bí kíp rèn luyện thân thể cho nhân vật. <b>Sắp ra mắt</b> — sẽ được cập nhật sau.</small><div class="tsm-g" style="grid-template-columns:1fr"><div class="tsm-it"><div class="ic">🔒</div><b>Chưa mở</b></div></div>';
  }else{
    var arr=TSM.items[id]||[],g='';
    for(var i=0;i<4;i++){var it=arr[i];
      g+='<div class="tsm-it'+(it&&S?' on':'')+'"><div class="ic">'+(!S?'🔒':it?ico(it.ic):SLOT_IC[i])+'</div><b>'+(!S?'???':it?it.n:SLOT_NM[i]+(S?' '+S.n:''))+'</b><em>'+(!S?'Khoá':it?(it.d||''):'Sắp ra mắt')+'</em></div>'}
    h='<h3>'+(S?S.e+' Trang sức '+S.n:'💍 Trang sức môn phái')+'</h3>'
     +'<small>'+(S?'Bộ trang sức 4 món của môn phái. Đủ 4 món sẽ kích hoạt hiệu ứng bộ.<br>'+(TSM.setBonus[id]?'<b>Hiệu ứng bộ:</b> '+TSM.setBonus[id]:'<b>Hiệu ứng bộ & chỉ số:</b> sẽ cập nhật sau.')
        :'🔒 Chỉ mở khi đã <b>chọn môn phái</b> tại <b>Vạn Pháp Tháp</b> ở Tiên Giới. Bộ trang sức sẽ tương ứng với môn phái bạn chọn.')+'</small><div class="tsm-g">'+g+'</div>';
  }
  var o=document.createElement('div');o.id='tsm-ov';o.className='tsm-ov';o.style.setProperty('--tc',col);
  o.innerHTML='<div class="tsm-bx">'+h+'<button class="tsm-x" onclick="TSM.close()">Đóng</button></div>';
  o.addEventListener('click',function(e){if(e.target===o)close()});document.body.appendChild(o);
}
TSM.open=open;TSM.close=close;
var _ui=window.ui;
window.ui=function(){var r=_ui.apply(this,arguments);try{inject()}catch(e){console.warn('TSM',e)}return r};
try{if(typeof bo!='undefined'&&bo)window.ui()}catch(e){}
})();
