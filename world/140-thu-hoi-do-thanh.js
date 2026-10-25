/* ===== ⚠ THU HỒI TOÀN BỘ ĐỒ THÁNH (world/140-thu-hoi-do-thanh.js · Fix432) =====
 * Máy chủ giữ danh sách nhân vật cần xử lý (bảng thanh_thuhoi, tạo bởi fix432_thu_hoi_do_thanh.sql).
 * Mỗi nhân vật được xử lý 1 LẦN khi đăng nhập:
 *   • gỡ mọi trang bị Bộ Thánh (it.hl) khỏi ô đang mặc + Túi            (CF.items)
 *   • xoá Thánh Khí đã chọn/nâng cấp PS[slot].tkq                        (CF.khi)
 *   • lưu + đẩy lên mây, XONG mới báo máy chủ "đã xử lý" (chưa đẩy được mây thì thử lại, không báo sớm).
 * Không đụng: Mảnh Thánh, Mảnh Thánh Khí, nguyên liệu. Gỡ module = xoá thẻ <script> (không ảnh hưởng game). */
(function(){
'use strict';
var CF={items:1,khi:1,keepTienNhan:0,every:4000,maxFail:5};/* keepTienNhan:1 = KHÔNG gỡ trang bị Bộ Thánh của nhân vật Tiên Nhân (họ chỉ mặc được đồ Thánh) */
var busy=0,fail=0,done={0:0,1:0,2:0},shown=0;
function logged(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}catch(e){return false}}
function holy(it){return !!(it&&typeof it==='object'&&it.hl)}
function toast(t){try{var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);max-width:88vw;z-index:99999;background:#2a0f0f;color:#ffd7c8;border:1px solid #c0603a;border-radius:10px;padding:10px 14px;font:600 13px/1.4 sans-serif;text-align:center;box-shadow:0 4px 18px #000a';document.body.appendChild(d);setTimeout(function(){d.remove()},6500)}catch(e){}}
/* gỡ đồ Thánh của 1 nhân vật; trả về số món đã gỡ */
function strip(sl){var n=0,i,eq=(typeof EQS!=='undefined')&&EQS[sl],bag=(typeof BAGS!=='undefined')&&BAGS[sl],pp=(typeof PS!=='undefined')&&PS[sl];
 if(CF.items&&!(CF.keepTienNhan&&pp&&pp.ct&&pp.ct.d)){
  if(eq)for(i=0;i<eq.length;i++)if(holy(eq[i])){eq[i]=null;n++}
  if(bag)for(i=bag.length-1;i>=0;i--)if(holy(bag[i])){bag.splice(i,1);n++}}
 if(CF.khi&&pp&&pp.tkq){pp.tkq=null;n++}
 return n}
function refresh(sl){try{if(sl===(cur|0)){try{if(typeof P!=='undefined'&&P&&typeof mx==='function')P.hp=Math.min(P.hp,mx())}catch(e){}try{if(window.TKQ&&TKQ.refresh)TKQ.refresh()}catch(e){}try{if(typeof ui==='function')ui()}catch(e){}}}catch(e){}}
async function push(){try{if(typeof sv==='function')sv()}catch(e){}
 try{if(window.KTHM_CLOUD&&KTHM_CLOUD.saveNow)await Promise.race([Promise.resolve(KTHM_CLOUD.saveNow()),new Promise(function(r){setTimeout(r,8000)})])}catch(e){}
 try{return !(window.KTHM_CLOUD&&KTHM_CLOUD.dirty&&KTHM_CLOUD.dirty())}catch(e){return true}}
async function run(){
 if(busy||fail>=CF.maxFail||typeof started==='undefined'||!started||!logged())return;
 busy=1;
 try{for(var sl=0;sl<3;sl++){if(done[sl])continue;
   var r=await KCL.rpc('thanh_thuhoi',{p_slot:sl,p_ack:false});
   if(!r||r.status==='auth')break;
   if(r.status!=='revoke'){done[sl]=1;continue}
   var n=strip(sl);
   if(n>0){refresh(sl);if(!shown){shown=1;toast('⚠ Toàn bộ đồ Thánh (Bộ Thánh + Thánh Khí) đã bị thu hồi theo thông báo của máy chủ.')}
    try{console.info('[THU HỒI] nhân vật '+sl+': đã gỡ '+n+' món Thánh')}catch(e){}}
   if(!(await push())){fail++;break}   /* chưa lưu được lên mây → chưa báo xong, lần sau làm tiếp */
   await KCL.rpc('thanh_thuhoi',{p_slot:sl,p_ack:true});done[sl]=1}}
 catch(e){fail++}
 finally{busy=0}}
setInterval(function(){try{run()}catch(e){}},CF.every);
window.THUHOI={cfg:CF,strip:strip,run:run};
})();
