/* ===== 🛡️ BẢO VỆ TÚI ĐỒ: KHÔNG TỰ MẶC · KHÔNG TỰ BÁN MẢNH Ý CẢNH (ui/45-bao-ve-tui-do.js) =====
 * 1) KHÔNG TỰ MẶC trang bị mạnh hơn: engine (core/01-engine.js, hàm give(), nhánh "🔄 Tự mặc") chỉ chạy khi window.AUTOEQ===1.
 *    Mặc định AUTOEQ=0 → đồ rơi vào túi (hoặc theo bộ lọc tự bán của bạn), người chơi tự bấm Mặc. Bật lại: BAOVE.autoEquip(true).
 * 2) KHÔNG TỰ BÁN mảnh Ý Cảnh: mọi vật phẩm có cờ it.yc hoặc tên chứa "Ý Cảnh" được gắn it.c=1 (cờ "đồ chế tác" mà engine đã dùng để
 *    bỏ qua) ngay khi rơi (bọc give) và khi quét túi → được giữ khỏi: tự bán khi nhặt (autoKeep), Bán nhanh (sa), Dọn đồ yếu (bclean),
 *    bán 1 chạm (pk khi bật qs). Hiện nguyên liệu Ý Cảnh (Tinh Huyết, Ngộ Đạo, Ma Khí) là bộ đếm trong PS nên vốn không bán được;
 *    lớp này chặn sẵn cho các vật phẩm Ý Cảnh dạng đồ trong túi (đặt yc:1 khi tạo vật phẩm).
 * Không sửa dữ liệu lưu; chỉ thêm cờ c vào đúng vật phẩm Ý Cảnh. Phụ thuộc: BAG, give, ui (engine). */
(function(){
'use strict';
if(typeof BAG==='undefined'||typeof give!=='function')return;
if(window.AUTOEQ!==1)window.AUTOEQ=0;
function isYC(it){return !!(it&&(it.yc||/Ý Cảnh/i.test(it.n||'')))}
function guard(it){if(isYC(it)&&!it.c)it.c=1;return it}
var _give=give;give=function(it,x,y){return _give.call(this,guard(it),x,y)};
function scan(){try{for(var i=0;i<BAG.length;i++)guard(BAG[i])}catch(e){}}
if(typeof ui==='function'){var _ui=ui;ui=function(){scan();return _ui.apply(this,arguments)}}
setInterval(scan,3000);scan();
window.BAOVE={isYC:isYC,guard:guard,autoEquip:function(on){window.AUTOEQ=on?1:0}};
})();
