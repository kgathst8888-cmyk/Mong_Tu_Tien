/* ===== FIX: NHÂN VẬT MỚI TẠO (ng) BỊ GIỮ KỸ NĂNG CẤP CAO (systems/68-ng-reset-du-lieu-module.js) =====
 * Lỗi: ng() (core/01s) chỉ reset các trường gốc của PS[i] (lv,xp,pts,tier,br,al,cv,pet,lc,wg,lg,nm,rc). Các module thêm
 * trường riêng vào PS[i] (Ý Cảnh .yc gồm cấp + điểm ngộ đạo/ma khí → kỹ năng Tiên/Ma cấp cao; Thần Thông .tt/.tsh; Hợp Đạo/Đạo Thể .hd;
 * đá khảm .gm; phụ bản .dan/.pmt/.pv…) KHÔNG bị xoá → nhân vật mới Lv1 vẫn có kỹ năng cấp cao.
 * Cách vá: bọc ng(), TRƯỚC khi chạy ng gốc xoá mọi trường PS[i] không thuộc danh sách gốc.
 * Giữ lại 2 trường mua/mở bằng Linh Thạch của tài khoản ☁ (ví không bị reset khi chơi mới): .csh (kho Cửa hàng Linh Vân), .td (hồi chiêu Thánh Địa).
 * Không đổi module cũ. Nạp CUỐI index.html. */
(function(){
'use strict';
if(typeof ng!=='function'||typeof PS==='undefined')return;
var BASE={lv:1,xp:1,pts:1,tier:1,br:1,al:1,cv:1,pet:1,lc:1,wg:1,lg:1,nm:1,rc:1};   /* trường gốc: ng() tự reset */
var KEEP={csh:1,td:1};                                                               /* giữ lại (gắn với ví Linh Thạch tài khoản) */
var _ng=ng;
ng=function(){
  try{PS.forEach(function(p){if(!p)return;Object.keys(p).forEach(function(k){if(!BASE[k]&&!KEEP[k])delete p[k]})})}catch(e){}
  return _ng.apply(this,arguments)};
if(typeof window!=='undefined')window.ng=ng;
})();
