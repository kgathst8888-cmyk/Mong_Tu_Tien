/* systems/20-quest-hud.js */
/* Bấm vào dòng nhiệm vụ 📜 trên màn hình chính để mở bảng nhiệm vụ chi tiết */
(function(){
var cv=document.getElementById('c');if(!cv)return;
cv.addEventListener('pointerdown',function(e){
  try{
    if(!started)return;
    var ar=document.getElementById('arena-scene');if(ar&&ar.classList.contains('on'))return;
    var x=e.offsetX,y=e.offsetY;
    if(y<84||y>106||x>Math.max(120,W-150))return;
    mvDir=0;e.stopPropagation();
    if(!bo){tab=5;sel=null;msg='';tg()}else tb(5);
  }catch(err){console.warn('[quest hud]',err)}
});
})();

