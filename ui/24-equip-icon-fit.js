/* ===================================================================
   THU NHỎ ICON TRANG BỊ (ô trang bị đang mặc + khung mô tả)
   - Ảnh icon trang bị trong túi đồ giữ nguyên (đẹp, chi tiết); chỉ thu hình trong các ô đang mặc
     để icon không còn tràn khít ô quá to.
   - Chỉnh 2 biến CSS bên dưới: --eq-cell = cỡ ô (px), --eq-ico = tỉ lệ icon trong ô.
   =================================================================== */
(function(){
if(document.getElementById('eq-icon-fit'))return;
const st=document.createElement('style');st.id='eq-icon-fit';
st.textContent=':root{--eq-cell:46px;--eq-ico:74%;--eq-tip:22px}'
+'div.eqd{grid-template-columns:var(--eq-cell) 1fr var(--eq-cell);grid-template-rows:repeat(5,var(--eq-cell));gap:5px}'
+'div.eqd .ce{width:var(--eq-cell)!important;height:var(--eq-cell)!important}'
+'div.eqd .ce>img{width:var(--eq-ico)!important;height:var(--eq-ico)!important;margin:auto;display:block;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.6))}'
+'div.eqd .ce>img[style*="grayscale"]{filter:grayscale(.7)}'
+'.dt b>img{width:var(--eq-tip)!important;height:var(--eq-tip)!important}';
document.head.appendChild(st);
})();
