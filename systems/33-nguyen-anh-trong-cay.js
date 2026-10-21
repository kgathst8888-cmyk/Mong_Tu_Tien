/* ===================================================================
   NGUYÊN ANH TỰ TRỒNG CÂY (Fix242 · nâng cấp Fix374: nút Tắt/Bật + auto thông minh)
   - Từ cảnh giới Nguyên Anh trở lên: thuê Nguyên Anh xuất khiếu chăm Linh Điền, phí 10💎 Linh Thạch / ngày (24 giờ thật, mua cộng dồn).
   - Trong thời gian thuê, Nguyên Anh tự THU HOẠCH cây chín (đúng lúc chín, không héo) và GIEO LẠI:
       ô vừa thu → đúng loại hạt cũ · ô trống → loại hạt đang chọn · hết hạt thì để trống.
   - Chạy bù cả lúc offline (lõi FM.naRun trong systems/08-farming-alchemy.js).
   - Trừ Linh Thạch qua LT.spend (khoá của nhân vật trước, hết mới trừ không khoá), cần đăng nhập ☁.
   Fix374: nút ⏸ Tắt / ▶ Bật (tắt = tạm dừng, thời gian thuê còn lại được giữ) · chế độ gieo 🧠 Thông minh (ưu tiên dược thảo đang thiếu cho luyện đan, tự đổi loại khi hết hạt) / 📌 Giữ loại cũ.
   Chỉnh phí / cảnh giới tối thiểu ở CF bên dưới. UI hiện ở đầu tab 🌱 Linh Điền trong túi.
   =================================================================== */
(function(){
if(typeof FM==='undefined'||!FM.naRun||!FM.na)return;
var CF={cost:10,tick:5000,minRealm:4/* 4 = Nguyên Anh (RN trong ZC) */,day:86400000};
var busy=false,txt='',tc='#c090ff';
function realmOk(){try{return ZC.rI()>=CF.minRealm}catch(e){return false}}
function logged(){try{return !!(window.LT&&LT.spend&&LT.logged&&LT.logged())}catch(e){return false}}
function active(){var n=FM.na();return !!(n&&n.on&&Date.now()<n.until)}
function paused(){var n=FM.na();return !!(n&&n.pz&&n.left>0)}
function leftMs(){var n=FM.na();return n&&n.on?Math.max(0,n.until-Date.now()):(n&&n.pz?n.left||0:0)}
function fl(ms){var m=Math.floor(ms/60000),h=Math.floor(m/60);return h+' giờ '+(m%60)+' phút'}
function say(s,c){txt=s||'';tc=c||'#c090ff';try{ui()}catch(e){}}
function dt(s,c){try{DT.push({x:P.x,y:200,s:s,c:c||'#d8b8ff',g:1,l:150})}catch(e){}}

function buy(){
 if(busy)return;
 if(!realmOk()){say('Cần đạt cảnh giới Nguyên Anh trở lên để Nguyên Anh xuất khiếu trồng cây','#ffb0b0');return}
 if(!logged()){say('🔒 Cần đăng nhập tài khoản ☁ để trả Linh Thạch','#ffb0b0');return}
 busy=true;say('Đang xử lý…','#ffe9a0');
 var fail=function(m){busy=false;say(m,'#ffb0b0')};
 try{
  LT.spend(CF.cost,'na_trong_cay').then(function(r){
   busy=false;
   if(r&&r.ok){
    var n=FM.na(),now=Date.now();
    if(n.pz&&n.left>0){n.until=now+n.left;n.pz=0;n.left=0;n.last=now}   /* đang tạm dừng: cộng thêm rồi chạy lại */
    else if(!n.on||!(n.until>now)){n.last=now;n.until=now}   /* đã hết hạn: tính từ bây giờ */
    n.until+=CF.day;n.on=1;n.pz=0;
    try{sv()}catch(e){}
    run();
    say('✅ Nguyên Anh sẽ trồng cây cho bạn tới '+new Date(n.until).toLocaleString('vi-VN')+' (−'+CF.cost+'💎)','#9dffa0');
   }else if(r&&r.err==='poor')say('Không đủ Linh Thạch (cần '+CF.cost+'💎)','#ffb0b0');
   else if(r&&r.err==='login')say('🔒 Cần đăng nhập để thuê','#ffb0b0');
   else say('Thuê thất bại, thử lại sau','#ffb0b0');
  },function(){fail('Lỗi mạng, thử lại sau')});
 }catch(e){fail('Lỗi: không thuê được')}
}

function toggle(){
 var n=FM.na();
 if(!realmOk()&&!n.on&&!n.pz){say('Cần đạt cảnh giới Nguyên Anh trở lên','#ffb0b0');return}
 var r=FM.naToggle();
 if(r=='off')say('⏸ Đã tắt Nguyên Anh trồng cây — thời gian còn lại được giữ ('+fl(leftMs())+'). Cây đang trồng vẫn lớn, nhớ tự thu hoạch kẻo héo.','#ffe9a0');
 else if(r=='on'){say('▶ Đã bật lại — Nguyên Anh tiếp tục chăm Linh Điền','#9dffa0');run()}
 else say('Chưa thuê hoặc đã hết hạn — hãy thuê thêm để bật','#ffb0b0');
 try{ui()}catch(e){}
}
function mode(m){FM.naMode(m);say(m=='keep'?'📌 Gieo lại đúng loại cũ':'🧠 Gieo thông minh: ưu tiên dược thảo đang thiếu','#c090ff');try{ui()}catch(e){}}

/* chạy bù + báo kết quả */
function run(){
 var r;try{r=FM.naRun()}catch(e){return}
 if(!r)return;
 if(r.c||r.pl){
  var s='👶 Nguyên Anh: thu hoạch '+r.c+' ô, gieo lại '+r.pl+' ô'+(r.out?' · ⚠ hết hạt ở '+r.out+' ô':'');
  dt(s);try{if(FM.isOn())FM.note(s,'#d8b8ff')}catch(e){}
  try{if(typeof tab!='undefined'&&tab==12&&typeof bo!='undefined'&&bo)ui()}catch(e){}
 }
 if(r.exp){dt('👶 Nguyên Anh đã hết hạn chăm Linh Điền — thuê thêm để tiếp tục','#ffb0b0');try{ui()}catch(e){}}
}
setInterval(function(){
 try{
  if(typeof started!='undefined'&&!started)return;
  var n=FM.na();if(!n||!n.on)return;
  run();
  var e=document.querySelector('[data-natl]');if(e)e.textContent=fl(leftMs());
 }catch(x){}
},CF.tick);

/* khối giao diện đặt đầu tab Linh Điền */
function block(){
 var n=FM.na()||{},on=active(),ok=realmOk(),lg=logged();
 var pz=paused(),sm=(n.mode!='keep');
 var h='<div class="dt" style="border:1px solid #c090ff66;border-radius:8px">👶 <b>Nguyên Anh trồng cây</b><br><small>Nguyên Anh xuất khiếu tự <b>thu hoạch</b> cây chín và <b>gieo lại</b>, kể cả khi bạn thoát game. Phí <b>'+CF.cost+'💎 / ngày</b>, mua cộng dồn. Có thể <b>tắt/bật</b> bất cứ lúc nào: khi tắt, thời gian thuê còn lại được giữ nguyên. Cần có hạt giống, hết hạt thì ô để trống.</small>';
 if(!ok)h+='<div class="st" style="color:#ffb070">🔒 Cần đạt cảnh giới <b>Nguyên Anh</b> trở lên.</div>';
 else if(on)h+='<div class="st" style="color:#9dffa0">✅ Đang chăm Linh Điền · còn <b data-natl>'+fl(leftMs())+'</b></div>';
 else if(pz)h+='<div class="st" style="color:#ffe9a0">⏸ Đang tắt · còn giữ <b>'+fl(leftMs())+'</b> (không bị trừ)</div>';
 else h+='<div class="st" style="opacity:.8">'+(n.until&&n.until<=Date.now()?'Đã hết hạn.':'Chưa thuê.')+'</div>';
 if(txt)h+='<div class="st" style="color:'+tc+'">'+txt+'</div>';
 h+='<div class="fmb">';
 if(ok&&(on||pz))h+='<button onclick="NATC.toggle()">'+(on?'⏸ Tắt':'▶ Bật')+'</button>';
 h+='<button '+(busy||!ok?'disabled':'')+' onclick="NATC.buy()">👶 '+((on||pz)?'Gia hạn thêm 1 ngày':'Thuê 1 ngày')+' ('+CF.cost+'💎)</button></div>';
 if(ok){
  h+='<div class="st">Chế độ gieo: <b style="color:#c090ff">'+(sm?'🧠 Thông minh':'📌 Giữ loại cũ')+'</b><br><small>'+(sm?'Ưu tiên loại dược thảo đang thiếu so với nhu cầu luyện đan (trừ kho và cây đang trồng), hoà thì chọn loại chín nhanh; hết hạt tự đổi sang loại khác còn hạt.':'Ô vừa thu gieo lại đúng loại cũ; ô trống gieo loại hạt đang chọn.')+'</small></div>';
  h+='<div class="fmb"><button '+(sm?'disabled':'')+' onclick="NATC.mode(\'smart\')">🧠 Thông minh</button><button '+(sm?'':'disabled')+' onclick="NATC.mode(\'keep\')">📌 Giữ loại cũ</button></div>';
 }
 if(ok&&!lg)h+='<div class="st" style="color:#ffb070">Cần đăng nhập ☁ để trả Linh Thạch.</div>';
 return h+'</div>';
}
var _f=FM.farmUI;FM.farmUI=function(){return block()+_f()};
window.NATC={buy:buy,toggle:toggle,mode:mode,paused:paused,run:run,cfg:CF,active:active,left:leftMs};
})();
