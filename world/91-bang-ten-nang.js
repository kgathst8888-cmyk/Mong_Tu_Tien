/* ===== 🏷 NÂNG THANH MÁU / MANA / TÊN TRÊN ĐẦU NHÂN VẬT (world/91-bang-ten-nang.js) — Fix196, nạp sau world/87 =====
 * Lỗi: nameTag() (core/01q) vẽ 2 thanh máu/mana + tên ở độ cao CỐ ĐỊNH 80 đơn vị trên chân. Nhân vật Tiên Nhân bay lơ lửng (cách đất CF.hoverH, nhấp nhô) +
 *   tóc/mũ/cánh cao hơn nên các thanh đè lên đầu/thân nhân vật. Cách sửa: bọc nameTag ở lớp ngoài cùng, tạm nâng GY lên đúng bằng độ bay thực tế + chừa thêm khoảng hở.
 * Độ bay lấy từ world/74 (Thành Tiên Giới: VPG8.state.fo + hv·nhấp nhô) hoặc world/73 (bản đồ 2D: VPG.state.hv·(hoverH + nhấp nhô)). Không bay → nâng nhẹ CF.pad.
 * Chỉnh: TAGUP_CF.enable=false tắt · .pad (khoảng hở thêm, đơn vị thế giới, mặc định 10) · .padTG (riêng Tiên Giới, mặc định 14). */
(function(){
'use strict';
if(typeof nameTag!=='function'||typeof GY==='undefined'||typeof s==='undefined')return;
var CF=window.TAGUP_CF=window.TAGUP_CF||{};if(CF.enable===undefined)CF.enable=true;if(CF.pad===undefined)CF.pad=10;if(CF.padTG===undefined)CF.padTG=14;
function up(){
 var tg=false;try{tg=!!(window.TG&&TG.on&&TG.on())}catch(e){}
 try{
  if(tg&&window.VPG8&&VPG8.state&&VPG8.CF&&VPG8.CF.enable){var a=VPG8.state;return (a.fo||0)+(a.hv||0)*Math.sin((a.bp||0)*1.25)*3.2+CF.padTG}
  if(!tg&&window.VPG&&VPG.state&&VPG.CF&&VPG.CF.enable){var b=VPG.state,hh=VPG.CF.hoverH||22;return (b.hv||0)*(hh+Math.sin((b.bp||0)*1.25)*3.2)+CF.pad}
 }catch(e){}
 return tg?CF.padTG:CF.pad
}
var _nt=nameTag;
nameTag=function(){
 if(!CF.enable)return _nt.apply(this,arguments);
 var og=GY,r;
 try{GY=og-up()*s;r=_nt.apply(this,arguments)}finally{GY=og}
 return r};
window.TAGUP={up:up,CF:CF};
})();
