/* ===== 💰 BÁN NHANH · CHỌN TỪNG MÓN (dưới Thần Thoại) =====
 * Nút "💰 Bán nhanh < Thần Thoại" trong túi mở bảng này (engine: onclick="window.BNC?BNC.open():sa(4)").
 * Liệt kê đồ Thường → Sử Thi trong túi; tick/bỏ tick từng món, hoặc bật/tắt cả một phẩm; bấm Bán để bán các món đã chọn.
 * Giữ nguyên quy tắc bảo vệ của sa(): không liệt kê đồ chế tác (c), đã cường hóa (u>0), nhẫn Cấp Thần Thông (ttl), đồ Thánh (hl).
 * Tái dùng: BAG, sell(i), gold, msg, sel (engine, chỉ đặt lại sau khi bán), ui(), RC, SL, ev(). Không sửa dữ liệu nào khác ngoài BAG/gold. Nếu module không tải, nút tự quay về sa(4).
 * Chỉnh: CF.maxR (phẩm tối đa được bán nhanh: 3 = Sử Thi). */
(function(){
'use strict';
if(typeof BAG==='undefined'||typeof sell!=='function')return;
var CF={maxR:3};
var RN=['Thường','Tinh Anh','Hiếm','Sử Thi'];
var ov=null,pick=new Set(),note='';
function ok(i){return !!i&&typeof i==='object'&&i.r<=CF.maxR&&!i.c&&!(i.u>0)&&!i.ttl&&!i.hl}
function list(){var a=[];for(var j=0;j<BAG.length;j++)if(ok(BAG[j]))a.push(BAG[j]);return a.sort(function(x,y){return (y.r-x.r)||(x.s-y.s)||(y.l-x.l)})}
function nf(n){try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function col(r){try{return RC[r]||'#ccc'}catch(e){return '#ccc'}}
function stat(i,k){try{return typeof ev==='function'?ev(i,k):i[k]}catch(e){return i[k]}}
function value(i){try{return sell(i)|0}catch(e){return 0}}

function css(){
  var st=document.createElement('style');
  st.textContent='#bnc{position:fixed;inset:0;z-index:12;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);font-family:system-ui,sans-serif;color:#f2e3b3}'+
  '#bnc .bx{width:min(440px,96%);max-height:88%;display:flex;flex-direction:column;border:2px solid #b8964e;border-radius:14px;background:#1a110c;box-shadow:0 8px 30px #000}'+
  '#bnc .hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #4a3a2a;font-weight:700}#bnc .hd span{flex:1}'+
  '#bnc .hd button{background:none;border:0;color:#f2e3b3;font-size:20px}'+
  '#bnc .ch{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 2px}'+
  '#bnc .ch button,#bnc .ft button{border:1px solid #6a5434;background:#2a1d14;color:#f2e3b3;border-radius:16px;padding:5px 10px;font-size:12.5px;font-weight:700}'+
  '#bnc .ch button.on{background:#8a6420;border-color:#ffd76a}'+
  '#bnc .ls{flex:1;overflow-y:auto;padding:6px 12px;-webkit-overflow-scrolling:touch}'+
  '#bnc .rw{display:flex;align-items:center;gap:8px;padding:6px 8px;margin:4px 0;border:1px solid #3a2c20;border-radius:8px;background:#21160f}'+
  '#bnc .rw.on{border-color:#b8964e;background:#2e2014}'+
  '#bnc .rw .bx2{width:20px;height:20px;border:2px solid #8a7440;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#1a110c;flex:none}'+
  '#bnc .rw.on .bx2{background:#ffd76a;border-color:#ffd76a}'+
  '#bnc .rw .ic{font-size:20px;width:26px;text-align:center}#bnc .rw .in{flex:1;min-width:0;font-size:13px}'+
  '#bnc .rw .nm{font-weight:700;word-break:break-word}#bnc .rw small{opacity:.7;display:block}'+
  '#bnc .rw .pr{color:#ffd76a;font-weight:700;white-space:nowrap;font-size:13px}'+
  '#bnc .ft{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid #4a3a2a}'+
  '#bnc .ft .sm{flex:1;font-size:13px}#bnc .ft button.sl{background:#8a6420;border-radius:9px;padding:9px 16px;font-size:14px}'+
  '#bnc .ft button.sl:disabled{opacity:.4}#bnc .nt{padding:2px 12px;font-size:12px;color:#9fe39f;min-height:0}';
  document.head.appendChild(st);
}
function build(){
  css();
  ov=document.createElement('div');ov.id='bnc';
  ['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',onClick);
  document.body.appendChild(ov);
}
function render(){
  var L=list(),tot=0,cnt=0;
  pick.forEach(function(i){if(L.indexOf(i)<0)pick.delete(i)});
  L.forEach(function(i){if(pick.has(i)){cnt++;tot+=value(i)}});
  var chips=RN.slice(0,CF.maxR+1).map(function(n,r){
    var rs=L.filter(function(i){return i.r===r});if(!rs.length)return '';
    var all=rs.every(function(i){return pick.has(i)});
    return '<button data-a="r" data-r="'+r+'" class="'+(all?'on':'')+'" style="color:'+col(r)+'">'+n+' ('+rs.length+')</button>';
  }).join('');
  var rows=L.map(function(i,k){
    var s=(typeof SL!=='undefined'&&SL[i.s])||['?','🎁'],o=Object.keys(i.x||{}).length,on=pick.has(i);
    var st='';try{st=(i.a?'Công '+nf(stat(i,'a'))+' ':'')+(i.d?'Thủ '+nf(stat(i,'d'))+' ':'')+(i.h?'HP '+nf(stat(i,'h')):'')}catch(e){}
    return '<div class="rw'+(on?' on':'')+'" data-a="t" data-k="'+k+'"><div class="bx2">'+(on?'✓':'')+'</div><div class="ic">'+s[1]+'</div>'+
      '<div class="in"><div class="nm" style="color:'+col(i.r)+'">'+esc(i.n||s[0])+'</div><small>Lv '+(i.l|0)+' · '+RN[i.r]+(o?' · '+o+' opt':'')+(st?' · '+st:'')+'</small></div>'+
      '<div class="pr">💰 '+nf(value(i))+'</div></div>';
  }).join('');
  ov._L=L;
  ov.innerHTML='<div class="bx"><div class="hd"><span>💰 Bán nhanh · chọn món</span><button data-a="x">✕</button></div>'+
    (L.length?'<div class="ch"><button data-a="all">Chọn hết</button><button data-a="none">Bỏ hết</button>'+chips+'</div>':'')+
    '<div class="nt">'+esc(note)+'</div>'+
    '<div class="ls">'+(rows||'<div style="opacity:.7;padding:20px 0;text-align:center">Túi không có đồ nào dưới Thần Thoại để bán.<br><small>Đồ chế tác, đã cường hóa, nhẫn Cấp Thần Thông được giữ lại.</small></div>')+'</div>'+
    '<div class="ft"><div class="sm">Đã chọn <b>'+cnt+'</b>/'+L.length+' món<br>Nhận <b style="color:#ffd76a">💰 '+nf(tot)+'</b></div><button data-a="x">Đóng</button><button class="sl" data-a="sell"'+(cnt?'':' disabled')+'>Bán ('+cnt+')</button></div></div>';
}
function onClick(e){
  var a=e.target.closest&&e.target.closest('[data-a]');
  if(!a){if(e.target===ov)close();return}
  var act=a.dataset.a,L=ov._L||[];
  if(act==='x')return close();
  if(act==='all'){L.forEach(function(i){pick.add(i)});note=''}
  else if(act==='none'){pick.clear();note=''}
  else if(act==='r'){var r=+a.dataset.r,rs=L.filter(function(i){return i.r===r}),all=rs.every(function(i){return pick.has(i)});rs.forEach(function(i){all?pick.delete(i):pick.add(i)});note=''}
  else if(act==='t'){var it=L[+a.dataset.k];if(it){pick.has(it)?pick.delete(it):pick.add(it)}note=''}
  else if(act==='sell')return doSell();
  render();
}
function doSell(){
  var t=0,k=0;
  for(var j=BAG.length-1;j>=0;j--){
    var i=BAG[j];
    if(pick.has(i)&&ok(i)){t+=sell(i);k++;BAG.splice(j,1)}   /* kiểm tra lại điều kiện lúc bán */
  }
  if(k)gold+=t;
  pick=new Set();
  try{sel=null}catch(e){}                                      /* bỏ chọn món trong túi của engine (chỉ số đã đổi) */
  try{if(typeof fz!=='undefined'&&fz&&fz.length)fz.length=0}catch(e){}
  note=k?('💰 Đã bán '+k+' món, +'+nf(t)):'Không có món nào để bán.';
  try{msg=note}catch(e){}
  try{ui()}catch(e){}
  render();
}
function open(){
  if(!ov)build();
  pick=new Set();note='';
  render();ov.style.display='flex';
}
function close(){if(ov)ov.style.display='none';try{ui()}catch(e){}}
window.BNC={open:open,close:close,cfg:CF};
})();
