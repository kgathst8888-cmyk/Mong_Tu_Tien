/* systems/09-input-guard.js */
/* Chặn chạm của Làng khi đang ở Thành Thị Linh Giới (phải chạy trước script Linh Điền) */
document.addEventListener('pointerdown',e=>{if(e.target!==c)return;if(window.LCT&&LCT.on())LCT.tap(e);else if(window.FSH&&FSH.open()){e.stopImmediatePropagation();e.stopPropagation()}},true);
