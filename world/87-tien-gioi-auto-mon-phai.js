/* ===== 🤖 AUTO KỸ NĂNG Ở TIÊN GIỚI (môn phái + ý cảnh + đạo thể + linh căn) (world/87-tien-gioi-auto-mon-phai.js) — nạp sau world/81 + world/79 + world/85 =====
 * Vấn đề: auto của world/72 chỉ chạy qua vòng step()/ZC.zauto của bản đồ thường (tìm địch bằng nearE()) nên ở Thành Tiên Giới (quái nằm trong TGQ.mon) nó không bao giờ tung kỹ năng môn phái.
 * Cách làm: bọc vstep() — khi nút AUTO đang bật, đang bay (có thể giao chiến), có quái Tiên Giới trong tầm → xoay nhân vật về phía quái gần nhất rồi tung kỹ năng môn phái
 *   qua đúng đường nút bấm của world/79 (TG8SK.fire: hiệu ứng + hồi chiêu + sát thương TGQ.cast), thứ tự như world/72: Tuyệt kỹ › 4 › 2 › 3 › 1.
 *   • Tuyệt kỹ chỉ dùng khi có ≥2 quái trong tầm (hoặc quái tinh anh/boss) · kỹ năng hộ thể chỉ khi máu < 80%.
 *   • Hướng đánh dùng đúng góc tới quái (không bị làm tròn 8 hướng) nên không trượt khi quái lệch hướng.
 * Fix182: khi đang bay ngoài thành, AUTO còn TỰ BAY về phía quái gần nhất (TG.autoMove của world/61) và dừng cách quái CF.stop ô để giao chiến; vuốt/phím/chạm của người chơi luôn được ưu tiên; không tự bay vào thành thị.
 * Áp dụng cả ở TIÊN LINH CHIẾN CẢNH (world/84, bản đồ quái theo cấp của Tiên Nhân): quái của map đó nằm trong TGQ.mon nên auto bay tới + tung chiêu như ngoài thành.
 * Fix196: tự tung ĐỦ mọi nút kỹ năng ở cột world/79 — môn phái (s) · ý cảnh (y) · đạo thể (f) · linh căn (l); mỗi nhóm 1 chiêu/lượt, tối đa CF.perTick (mặc định 1) và chỉ tung khi đang có < TG8SK_CF.max (2) hiệu ứng chiêu trên màn hình → không chồng chéo chiêu/lượt; hướng nhân vật quay mượt về phía quái. Chỉnh: TGAUTO_CF.enable=false để tắt · .range (tầm tìm quái, đơn vị ô, mặc định 5) · .every (số khung giữa 2 lần xét, mặc định 10) · .move=false để chỉ tung chiêu không tự bay · .seek (tầm tìm quái để bay tới, mặc định 14 ô) · .stop (khoảng cách dừng, mặc định 2.4 ô). */
(function(){
'use strict';
if(typeof vstep!=='function'||!window.TG||!window.TG8SK||!window.TGQ||!TG8SK.list||!TG8SK.fire)return;
var CF=window.TGAUTO_CF=window.TGAUTO_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.range)CF.range=5;if(CF.move===undefined)CF.move=true;if(!CF.seek)CF.seek=14;if(!CF.stop)CF.stop=2.4;if(!CF.every)CF.every=10;if(!CF.perTick)CF.perTick=1;
var PI=Math.PI,last=0,nt={},AA=null,hooked=false,GRP=[{c:'s',o:[4,3,1,2,0]},{c:'y'},{c:'f'},{c:'l'}];
function on(){try{return typeof auto!=='undefined'&&!!auto}catch(e){return false}}
/* ép hướng tung chiêu = góc thật tới quái (world/79 chỉ cho 8 hướng) */
function hook(){
 if(hooked||!window.TGQ||!TGQ.cast)return;hooked=true;
 var _c=TGQ.cast;TGQ.cast=function(it,sc,A){var a=AA===null?A:AA;try{var S=window.VPG8&&VPG8.state;if(S){S.ca=a;S.cf=fr+30}}catch(e){}return _c.call(this,it,sc,a)}   /* Fix198: mọi chiêu (tay hoặc auto) → nhân vật quay mượt về hướng chiêu */
}
var mvOn=false;
function axOn(){try{return !!(window.TGQA&&TGQA.on&&TGQA.on())}catch(e){return false}}
function setGo(v){if(!window.TG||!TG.autoMove)return;if(v){TG.autoMove(v);mvOn=true}else if(mvOn){TG.autoMove(null);mvOn=false}}
/* mỗi khung: bay về phía quái gần nhất trong CF.seek, dừng khi tới CF.stop; không bay xuống thành thị (mặt đất) */
function move(){
 var go=null;
 try{
  if(CF.enable&&CF.move&&on()&&TG.on()&&typeof P==='object'&&P&&P.hp>0&&window.TGQ_CF&&TGQ_CF.enable&&TGQ.flying&&TGQ.flying()){
   var h=TG.hero(),hx=h[0],hy=h[1],best=null,bd=1e9,i,m,d;
   for(i=0;i<TGQ.mon.length;i++){m=TGQ.mon[i];if(!m||m.hp<=0||m.dead||m.gone)continue;d=Math.hypot(m.x-hx,m.y-hy);if(d<bd){bd=d;best=m}}
   if(best&&bd<=CF.seek&&bd>CF.stop){
    var ux=(best.x-hx)/bd,uy=(best.y-hy)/bd;
    if(axOn()||!TG.ground(hx+ux*.12,hy+uy*.12))go=[ux,uy]   /* Tiên Linh Chiến Cảnh (world/84): cả đảo là mặt đất nên không chặn theo mặt đất */
   }
  }
 }catch(e){go=null}
 setGo(go);
}
function step(){
 if(!CF.enable||!on())return;
 if(fr-last<CF.every)return;last=fr;
 if(!TG.on()||typeof P!=='object'||!P||P.hp<=0||P.pe||P.act)return;
 if(!(window.TGQ_CF&&TGQ_CF.enable)||!TGQ.flying||!TGQ.flying())return;
 var h=TG.hero(),hx=h[0],hy=h[1],near=[],i,m,d;
 for(i=0;i<TGQ.mon.length;i++){m=TGQ.mon[i];if(!m||m.hp<=0||m.dead||m.gone)continue;d=Math.hypot(m.x-hx,m.y-hy);if(d<=CF.range)near.push({m:m,d:d})}
 if(!near.length)return;
 near.sort(function(a,b){return a.d-b.d});
 var tg=near[0].m,boss=near.some(function(o){return o.m.b||o.m.boss||o.m.elite}),
  /* góc tới quái trên màn hình (cùng hệ toạ độ với world/79: x ngang, y đã nhân đôi độ dẹt) */
  a0=TG.S2(tg.x,tg.y),a1=TG.S2(hx,hy),A=Math.atan2((a0[1]-a1[1])*2,a0[0]-a1[0]);
 var L=TG8SK.list(),hp=1;try{hp=P.hp/mx()}catch(e){}
 /* Fix196: tung đủ MỌI nhóm kỹ năng của cột nút world/79 (s = môn phái · y = ý cảnh · f = đạo thể · l = linh căn), mỗi nhóm tối đa 1 chiêu/lượt, tối đa CF.perTick chiêu/lượt */
 try{if(TG8SK.fx&&TG8SK_CF&&TG8SK.fx.length>=TG8SK_CF.max)return}catch(e){}   /* Fix201: đủ 1-2 hiệu ứng đang chạy → chờ hết rồi mới tung chiêu tiếp */
 var now=fr,fired=0,sw=null,ST=null;
 try{ST=window.VPG8&&VPG8.state;if(ST)sw=[ST.sec,ST.ang,ST.tg]}catch(e){ST=null}
 /* ép hướng tung chiêu = góc thật tới quái, xong trả lại hướng cũ để hình nhân vật quay MƯỢT (không giật hướng) */
 if(ST){try{ST.sec=((Math.round(A/(PI/4))%8)+8)%8;ST.ang=A;ST.tg=A}catch(e){}}
 GRP.forEach(function(gp){
  if(fired>=CF.perTick)return;
  var cand=[],j;for(j=0;j<L.length;j++)if(L[j].k.charAt(0)===gp.c)cand.push(L[j]);
  if(gp.c==='s')cand.sort(function(a,b){return gp.o.indexOf(+a.k.slice(1))-gp.o.indexOf(+b.k.slice(1))});
  else if(gp.c==='y')cand.sort(function(a,b){return +b.k.slice(1)-+a.k.slice(1)});
  for(j=0;j<cand.length;j++){
   var it=cand[j];
   if(!it.ok)continue;
   if((nt[it.k]||0)>now)continue;
   var sp=it.sp||{};
   if(sp.ult&&near.length<2&&!boss)continue;
   if(sp.t==='shield'&&hp>.8)continue;
   AA=A;var ok=false;try{ok=TG8SK.fire(it)}catch(e){ok=false}AA=null;
   if(ok){fired++;break}else nt[it.k]=now+90;   /* chưa hồi chiêu/thiếu nội lực → thử lại sau 1,5 giây, tránh báo lặp */
  }
 });
 if(ST&&sw){try{ST.sec=sw[0];ST.ang=sw[1];ST.tg=A}catch(e){}}
}
hook();
var _v=vstep;vstep=function(){var r=_v.apply(this,arguments);try{move()}catch(e){}try{step()}catch(e){}return r};
window.TGAUTO={step:step,CF:CF};
})();
