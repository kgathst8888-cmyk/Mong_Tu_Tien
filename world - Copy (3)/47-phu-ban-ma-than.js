/* ===== 👹 PHỤ BẢN 4 "MA THẦN" =====
 * Mở từ bảng 🕳 Phụ Bản (world/40-phu-ban-2.js, thẻ số 4). Module riêng, tái dùng NGUYÊN Boss Ma Thần + bản đồ Huyết Nguyệt Ma Điện
 * của world/02-demon-realm.js + world/05-demon-boss.js (mtSpawn / mtAI / mtDraw / mtBg / mtBoom / dgHud): trận dùng cờ dg.mt=1
 * cộng cờ riêng dg.pm=1 để tách phần thưởng / thoát trận khỏi lần hạ Ma Thần đầu tiên (không đụng cờ mở Linh Giới PS[cur].lg).
 *  - CHỈ MỞ sau khi đã hạ được Ma Thần lần đầu (lgDone(): PS[cur].lg >= 1). Chưa hạ → thẻ hiện khoá.
 *  - Hồi chiêu CF.cd = 1 giờ, tính từ lúc VÀO (lưu theo nhân vật), giống Phụ Bản Vàng.
 *  - Hạ Ma Thần rơi NGUYÊN LIỆU "Ma Thần Tinh Huyết" (CF.mat 5–10) để nâng tu vi Ý Cảnh MA ĐẠO (YCANH.up(1) mỗi lần, world/45-y-canh.js).
 *      Giá lên tiểu cảnh kế = CF.base + CF.step × (cấp Ý Cảnh hiện tại − 1). Chỉ nhân vật đã chọn Ma Đạo mới dùng được; Tiên Đạo vẫn tích luỹ được.
 *  - Thưởng thêm như Ma Thần: vàng, mảnh chế tạo, tu vi. Trang bị Thần Thoại mặc định KHÔNG rơi ở phụ bản (CF.gear = 0; đặt 3 để giống lần hạ đầu).
 *  - Dữ liệu: PS[cur].pmt = {cd: mốc ms được vào lại, n: số lượt, k: số lần hạ, m: Tinh Huyết đang có, u: số lần đã nâng}.
 * Phụ thuộc: mtSpawn/mtExit/mtBoom/MT_LV/lgDone/gP (02,05), dgTick/dgHud/dgSp/init (engine), YCANH (45, tuỳ chọn), PS/cur/P/E/DT/dg/gold/frag/sv. */
(function(){
'use strict';
if(typeof mtSpawn!=='function'||typeof mtExit!=='function'||typeof dgTick!=='function'||typeof dgHud!=='function'||typeof init!=='function'||typeof PS==='undefined')return;

var CF={
 cd:3600000,          /* hồi chiêu sau mỗi lần VÀO (ms): 3.600.000 = 1 giờ */
 mat:[5,10],          /* số Ma Thần Tinh Huyết rơi mỗi lần hạ */
 base:10,step:5,      /* giá nâng Ý Cảnh: base + step × (cấp hiện tại − 1) */
 gear:0,              /* số trang bị Thần Thoại rơi mỗi lần (0 = không) */
 col:'#d070ff',name:'Ma Thần Tinh Huyết',ic:'🩸'
};

/* ---------- tiện ích + dữ liệu ---------- */
function nf(n){return(Number(n)||0).toLocaleString('vi-VN')}
function D(){var p=PS[cur];if(!p)return{cd:0,n:0,k:0,m:0,u:0};if(!p.pmt||typeof p.pmt!=='object')p.pmt={cd:0,n:0,k:0,m:0,u:0};return p.pmt}
function unlocked(){try{return lgDone()}catch(e){return false}}
function left(){var s=D(),n=Date.now(),c=+s.cd||0;if(c>n+CF.cd){c=n+CF.cd;s.cd=c}return Math.max(0,c-n)}
function fmt(ms){var t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0')}
function status(){
 if(!unlocked())return{txt:'🔒 Hạ Ma Thần ở Làng để mở phụ bản này',col:'#ff9a9a'};
 if(left()>0)return{txt:'⏳ Vào lại sau '+fmt(left()),col:'#ffd98a'};
 return{txt:'✅ Sẵn sàng · chạm để vào',col:'#9dffa0'}}
function canEnter(){
 if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return'Không thể vào lúc này';
 if(!unlocked())return'🔒 Phụ Bản Ma Thần chỉ mở sau khi bạn hạ được Ma Thần';
 if(left()>0)return'⏳ Phụ Bản Ma Thần hồi chiêu '+fmt(left());
 return true}

/* ---------- Ý Cảnh Ma Đạo ---------- */
function yinfo(){try{return window.YCANH&&YCANH.info?YCANH.info():null}catch(e){return null}}
function cost(){var i=yinfo();return(i&&i.path==='m'&&i.level<15)?CF.base+CF.step*(i.level-1):0}
function say(t){try{var el=document.getElementById('pm-msg');if(el)el.textContent=t}catch(e){}try{DT.push({x:P.x,y:190,s:t,c:'#ffd98a',l:90})}catch(e){}}
function upgrade(){
 var i=yinfo(),d=D();
 if(!window.YCANH||!i){say('Chưa chọn Ý Cảnh (vào Hợp Đạo Đài ở Thành Thị Linh Giới)');return}
 if(i.path!=='m'){say('Tinh Huyết chỉ dùng cho Ý Cảnh Ma Đạo');return}
 if(i.level>=15){say('Ý Cảnh Ma Đạo đã viên mãn');return}
 var c=cost();
 if((d.m|0)<c){say('Thiếu '+CF.name+': '+(d.m|0)+'/'+c);return}
 d.m-=c;d.u=(d.u|0)+1;
 if(!YCANH.up(1)){d.m+=c;d.u--;say('Không nâng được lúc này');return}
 try{sv()}catch(e){}
 var j=yinfo();say('🌑 Ý Cảnh Ma Đạo lên cấp '+(j?j.level:'?')+'/15!');refresh()}

/* ---------- vào / ra trận ---------- */
function enter(){
 var r=canEnter();if(r!==true)return r;
 var q=D();q.cd=Date.now()+CF.cd;q.n=(q.n|0)+1;try{sv()}catch(e){}
 bo=0;try{bag.style.display='none'}catch(e){}
 var l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 try{if(typeof LCT!=='undefined'&&LCT.on())LCT.off()}catch(e){}
 dg={t:0,n:20,kill:20,mt:1,pm:1,lg0:l0,v0:v0};
 DT.push({x:P.x,y:200,s:'👹 Phụ Bản Ma Thần!',c:CF.col,g:1,l:140});
 return true}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();try{dgHud()}catch(e){}}

/* thắng: cộng nguyên liệu (boss chết → drop() bên dưới) rồi thoát sau ~5 giây */
function win(){
 var d=D();d.k=(d.k|0)+1;try{sv()}catch(e){}
 DT.push({x:P.x,y:220,s:'🏆 Hạ Ma Thần! (Phụ Bản)',c:'#8fe8ff',g:1,l:200})}

/* ---------- móc vào engine / Ma Thần (cùng mẫu Phụ Bản Vàng; chỉ xử lý khi dg.pm, còn lại chuyển tiếp nguyên) ---------- */
var _tick=dgTick;dgTick=function(){
 if(!dg||!dg.pm)return _tick.apply(this,arguments);
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;mtSpawn()}
 else if(dg.bs&&!E.some(function(e){return e.k=='boss'})&&!dg.done){dg.done=1;dg.out=300;win()}
 if(dg.done&&--dg.out<=0)mtExit()};
var _drop=drop;drop=function(e){
 if(!(dg&&dg.pm&&e&&e.mt))return _drop.apply(this,arguments);
 try{if(typeof mtBoom==='function')mtBoom(e)}catch(x){}
 var L=MT_LV;gold+=gP(3000*L);var f=30+Math.floor(R()*10);frag+=f;
 DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:140});
 var n=CF.mat[0]+Math.floor(R()*(CF.mat[1]-CF.mat[0]+1)),d=D();d.m=(d.m|0)+n;
 DT.push({x:e.x,y:160,s:CF.ic+' +'+n+' '+CF.name,c:CF.col,g:1,l:200});
 for(var i=0;i<CF.gear;i++)give(gen(L,4),e.x+(i-1)*40,150+i*34);
 try{ZC.gain(5000)}catch(x){}
 try{sv()}catch(x){}};
var _mx=mtExit;mtExit=function(){var w=dg&&dg.pm?dg:null;_mx.apply(this,arguments);if(w)back(w)};
var _init=init;init=function(){var w=dg&&dg.pm?dg:null;_init.apply(this,arguments);if(w)back(w)};
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);
 try{if(dg&&dg.pm&&typeof dgh!=='undefined')dgh.innerHTML+='<div class="dgt" style="color:'+CF.col+'">🕳 Phụ Bản Ma Thần · '+CF.ic+' '+nf(D().m|0)+'</div>'}catch(x){}};

/* ---------- giao diện trong bảng Phụ Bản (world/40 gọi html/refresh/canEnter/enter) ---------- */
function html(card){
 return card(4,CF.col,'👹','4. Phụ Bản Ma Thần','Đánh lại <b>Boss Ma Thần</b> trên bản đồ Huyết Nguyệt Ma Điện · <b>chỉ mở sau khi hạ Ma Thần</b> · vào lại sau <b>'+Math.round(CF.cd/60000)+' phút</b> · rơi <b>'+CF.name+'</b> ('+CF.mat[0]+'–'+CF.mat[1]+'/lần) nâng <b>Ý Cảnh Ma Đạo</b>')
 +'<div style="border:1px solid #6a4a8a;border-radius:10px;padding:8px;margin:8px 0;background:#150d1c"><div style="font-size:13.5px">'+CF.ic+' <b>'+CF.name+'</b> · đang có: <b id="pm-m" style="color:'+CF.col+'">0</b></div>'
 +'<div id="pm-y" style="font-size:12.5px;margin-top:4px"></div>'
 +'<button id="pm-b" onclick="PBMT.up()" style="width:100%;margin-top:6px;background:#4a2a6a;color:#fff;border:1px solid #b070ff;border-radius:8px;padding:8px">🌑 Nâng Ý Cảnh Ma Đạo</button>'
 +'<div id="pm-msg" style="font-size:12px;color:#ffd98a;margin-top:4px;min-height:15px"></div></div>'}
function refresh(){
 try{
  var m=document.getElementById('pm-m'),y=document.getElementById('pm-y'),b=document.getElementById('pm-b'),d=D(),i=yinfo(),c=cost();
  if(m)m.textContent=nf(d.m|0);
  if(y){y.textContent=!window.YCANH||!i?'Ý Cảnh: chưa chọn (Hợp Đạo Đài · Thành Thị Linh Giới)':i.path!=='m'?'Ý Cảnh '+(i.name||'Tiên Đạo')+' · Tinh Huyết chỉ dùng cho Ma Đạo':'🌑 Ma Đạo · cấp '+i.level+'/15 · '+i.name+(i.level>=15?' (viên mãn)':' · nâng cần '+c+' '+CF.ic)}
  if(b){var can=!!i&&i.path==='m'&&i.level<15&&(d.m|0)>=c;b.disabled=!can;b.style.opacity=can?1:.5;b.textContent=!i||i.path!=='m'?'🌑 Chỉ dành cho Ý Cảnh Ma Đạo':i.level>=15?'🌑 Ý Cảnh Ma Đạo viên mãn':'🌑 Nâng Ý Cảnh Ma Đạo ('+c+' '+CF.ic+')'}
 }catch(e){}}

window.PBMT={cfg:CF,canEnter:canEnter,enter:enter,status:status,html:html,refresh:refresh,up:upgrade,data:D,left:left,unlocked:unlocked,cost:cost};
})();
