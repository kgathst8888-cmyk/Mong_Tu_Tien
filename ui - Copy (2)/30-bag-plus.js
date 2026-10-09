/* ===================================================================
   TÚI ĐỒ+ : icon trang bị trong túi nhỏ gọn hơn + ghép trang bị ngay trong túi
   - Chỉnh cỡ ô/icon: --bg-cell (px), --bg-ico (% icon trong ô).
   - Ghép: chạm món Sử Thi/Thần Thoại → "Chọn ghép" (hoặc ⚡ Chọn tự động) → "Ghép". Không cần về Làng.
   =================================================================== */
(function(){
if(document.getElementById('bag-plus'))return;
var st=document.createElement('style');st.id='bag-plus';
st.textContent=':root{--bg-cell:46px;--bg-ico:78%}'
+'.gr5{grid-template-columns:repeat(6,var(--bg-cell));justify-content:center;gap:5px}'
+'.gr5 .ce{aspect-ratio:auto;width:var(--bg-cell);height:var(--bg-cell);padding:0}'
+'.gr5 .ce>img{width:var(--bg-ico)!important;height:var(--bg-ico)!important;margin:auto;display:block;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.6))}';
st.textContent+='.ce>i.il{position:absolute;right:2px;bottom:1px;font:bold 10px/1 sans-serif;font-style:normal;color:#fff;text-shadow:0 0 2px #000,0 0 3px #000,1px 1px 1px #000;pointer-events:none;z-index:1}.ce>i.il.no{color:#ff8a7a}.ce.nw>img{opacity:.38;filter:grayscale(.75)}';
document.head.appendChild(st);
window.fuseBar=function(){
  try{
    fz=fz.filter(function(i){var it=BAG[i];return it&&it.r>=3&&it.r<=4});
    var el=0;BAG.forEach(function(it){if(it&&it.r>=3&&it.r<=4)el++});
    if(!fz.length&&el<3)return '';
    var n=fz.length,h='<div class="dt" style="margin:5px 0;min-height:0"><b>🔗 Ghép trang bị</b> <span class="st">'+n+'/3 món đã chọn</span>';
    if(n)h+='<div class="st">'+fz.map(function(i){var it=BAG[i];return '<span style="color:'+RC[it.r]+'">'+SL[it.s][1]+' '+it.n.split(' · ')[0]+'</span>'}).join(' · ')+'</div>';
    h+='<div class="st">Chạm món Sử Thi/Thần Thoại trong túi → <b>Chọn ghép</b>. 3 món cùng phẩm, <b>10%</b> lên 1 phẩm, thất bại mất cả 3.'+(n>=2?' Phí: '+fmtN(fcost(BAG[fz[0]],BAG[fz[1]]))+'💰':'')+'</div>';
    h+='<button '+(n<3?'disabled':'')+' onclick="fuse()">'+(fzc?'⚠ XÁC NHẬN ghép':'🔗 Ghép')+'</button><button onclick="autoFz()">⚡ Chọn tự động</button><button '+(n?'':'disabled')+' onclick="fz.length=0;fzc=0;ui()">Bỏ chọn</button></div>';
    return h;
  }catch(e){return ''}
};
window.autoFz=function(){
  var best=null;
  [3,4].forEach(function(r){var L=[];BAG.forEach(function(it,i){if(it&&it.r==r&&!(it.u>0))L.push(i)});if(L.length>=3&&!best)best=L});
  if(!best){msg='Cần ít nhất 3 món cùng phẩm Sử Thi/Thần Thoại (chưa cường hóa)';ui();return}
  best.sort(function(a,b){return sc(BAG[a])-sc(BAG[b])});
  fz=best.slice(0,3);fzc=0;msg='';ui();
};
})();
