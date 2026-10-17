/* ===================================================================
   XEM TRƯỚC THÚ NUÔI cho nhân vật dưới Lv20 (chưa chuyển chức)
   - Tab 🐾 Thú hiện danh sách 4 thần thú, hướng tiến hoá và kỹ năng để cân nhắc trước.
   - Chưa chọn / nhận thú được: nút chọn chỉ xuất hiện sau khi chuyển chức lần đầu (Lv20).
   - Từ khi có thú trở đi vẫn dùng petUI gốc trong core/01*.js (engine đã tách, tra SYMBOL_INDEX.md), không đổi.
   =================================================================== */
(function(){
if(typeof petUI!=='function'||typeof PT4==='undefined')return;
const orig=petUI;
/* trạng thái cơ chế từng thú (sửa ở đây khi cập nhật thêm) */
const ST=['<small style="color:#7fe08a">✅ Cơ chế đầy đủ: 4 cấp tiến hoá, kỹ năng mở dần, tiến hoá bằng dược thảo Linh Điền.</small>',
 '<small style="color:#7fe08a">✅ Cơ chế đầy đủ: 4 cấp tiến hoá, kỹ năng mở dần, tiến hoá bằng dược thảo Linh Điền.</small>',
 '<small style="color:#7fe08a">✅ Cơ chế đầy đủ như Chu Tước: 4 cấp tiến hoá, kỹ năng mở dần, tiến hoá bằng dược thảo Linh Điền.</small>',
 '<small style="color:#7fe08a">✅ Cơ chế đầy đủ như Chu Tước: 4 cấp tiến hoá, kỹ năng mở dần, tiến hoá bằng dược thảo Linh Điền.</small>'];
function preview(){
 let h='<div class="dt">🐾 <b>Xem trước thú nuôi</b><br><small>Cả 4 thần thú đều dùng cơ chế như Chu Tước (tiến hoá nhiều cấp, kỹ năng mở dần) và đã hoàn chỉnh. Thú nuôi mở khi chuyển chức lần đầu (Lv20). Bạn chỉ được chọn <b>1 trong 4</b> và <b>không đổi được</b>, nên hãy xem kỹ ngay từ bây giờ.</small></div>';
 h+=PT4.map((T,i)=>{
  const sk=(typeof PSK!=='undefined'&&PSK[i])?PSK[i]:null;
  let extra='';
  if(i==1&&typeof PHX!=='undefined'&&PHX.skillsHtml){try{extra=PHX.skillsHtml({ev:0})}catch(e){}}
  else if(i==0&&typeof PTG!=='undefined'&&PTG.skillsHtml){try{extra=PTG.skillsHtml({ev:0})}catch(e){}}
  else if(i>1&&typeof PETX!=='undefined'&&PETX[i]&&PETX[i].skillsHtml){try{extra=PETX[i].skillsHtml({ev:0})}catch(e){}}
  else if(sk)extra='<small>🌟 Kỹ năng riêng: <b>'+sk.n+'</b> — '+sk.d+'</small>';
  return '<div class="dt"><img src="'+PTU[i]+'" style="width:56px;height:56px;object-fit:contain;vertical-align:middle;margin-right:4px"> <b>'+T.n[0]+'</b><br>'
   +'<small>Tiến hoá: '+T.n.join(' → ')+'</small><br><small>'+T.d+'</small>'+(extra?'<br>'+extra:'')
   +'<br>'+ST[i]+'<br><small style="opacity:.7">🔒 Chọn được sau khi chuyển chức Lv20</small></div>'}).join('');
 return h}
petUI=function(){
 try{if(PS[cur].tier<1)return preview()}catch(e){console.error('[pet preview]',e)}
 return orig.apply(this,arguments)};
})();
