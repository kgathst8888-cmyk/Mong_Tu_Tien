/* ===================================================================
   KHOÁ TIẾN HOÁ CẤP 4 (hình cuối) CHO CẢ 4 THÚ NUÔI
   - Chặn tiến hoá từ cấp 3 → cấp 4 cho tới khi cả 4 thú được cập nhật đầy đủ.
   - Thú đã ở cấp 4 từ trước giữ nguyên, không bị thu hồi.
   - Khi cập nhật xong: đổi LOCK_EV4 thành false (hoặc xoá file này + dòng nạp ở index.html).
   =================================================================== */
(function(){
const LOCK_EV4=true;
if(!LOCK_EV4||typeof pev!=='function'||typeof petUI!=='function')return;
const NOTE='🔒 Tiến hoá cấp 4 (hình cuối) tạm khoá — mở khi cả 4 thần thú được cập nhật đầy đủ.';
const oPev=pev,oUI=petUI;
pev=function(){
 let p=null;try{p=pet()}catch(e){}
 if(p&&p.ev>=2&&p.ev<3){msg=NOTE;ui();return}
 return oPev.apply(this,arguments)};
petUI=function(){
 const h=oUI.apply(this,arguments);let p=null;try{p=pet()}catch(e){}
 if(!p||p.ev!==2||typeof h!=='string')return h;
 return h.replace(/<button[^>]*onclick="pev\(\)">[^<]*<\/button>/,'<button disabled>🔒 Tiến hóa cấp 4</button><br><small style="color:#ffcf8a">'+NOTE+'</small>')};
})();
