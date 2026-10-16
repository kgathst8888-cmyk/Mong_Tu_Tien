/* ===== ⚔ VŨ KHÍ MÔN PHÁI (world/75-mon-phai-vu-khi.js) — nạp sau world/74 + assets/mon-phai-vukhi.js =====
 * Vẽ vũ khí (ảnh MPW, cắt từ ô "Vũ khí" của ảnh mẫu) lên nhân vật môn phái. Được gọi từ world/73 (bản đồ thường) và world/74 (Tiên Giới 8 hướng):
 *   VPW.draw(sid,'back',P)  — TRƯỚC khi vẽ thân: pháp bảo lơ lửng (Huyền Châu / Viêm Luân / Cổ Ấn …) sau lưng
 *   VPW.draw(sid,'front',P) — SAU khi vẽ thân: vũ khí tay gần (tay xa vẽ ở lượt 'back', sau thân) (đã nằm trong hệ toạ độ thân: nhún/nghiêng theo nhân vật)
 *   P = {kind:'front'|'frontd'|'side'|'run'|'back'|'backd', w, HH, k, bp, wp, at}  (w = bề rộng thân vẽ, HH = chiều cao, k = độ chạy 0..1, at = tiến độ chiêu đánh 0..1 hoặc -1)
 * Vũ khí: U Minh = song đao (2 tay) · Huyền Băng = băng kiếm + huyền châu · Phần Thiên = hoả trượng + viêm luân (xoay) · Thiên Kiếm = phi kiếm + cổ kiếm ·
 *   Vạn Độc = độc trượng + độc phiến (tay kia) · Ngự Cổ = cổ ấn trượng + linh trùng (lơ lửng).
 * Chỉnh: SPEC (len = độ dài so với chiều cao thân, grip = vị trí nắm tính từ đỉnh ảnh), ANCH (toạ độ bàn tay theo tư thế), VPW_CF.enable=false để tắt. */
(function(){
'use strict';
if(typeof g==='undefined'||!window.MPW)return;
var CF=window.VPW_CF=window.VPW_CF||{};if(CF.enable===undefined)CF.enable=true;
var PI=Math.PI,R=PI/180;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
/* role: main = tay thuận · off = tay kia · float = lơ lửng sau lưng;  len: độ dài (×HH);  grip: điểm nắm (0 đỉnh … 1 đáy ảnh);  spin: xoay vòng */
var SPEC={
 umt:[{role:'main',len:.60,grip:.90},{role:'off',len:.60,grip:.90}],
 hbd:[{role:'main',len:.66,grip:.90},{role:'float',len:.36}],
 ptc:[{role:'main',len:1.0,grip:.58},{role:'float',len:.40,spin:1}],
 tkt:[{role:'main',len:.66,grip:.90},{role:'float',len:.36}],
 vdm:[{role:'main',len:1.0,grip:.58},{role:'off',len:.58,grip:.90}],
 ngc:[{role:'main',len:1.0,grip:.58},{role:'float',len:.36}]
};
/* toạ độ bàn tay theo 6 tư thế (đơn vị: ×w ngang, ×HH cao từ chân lên), a = góc nghiêng vũ khí (độ, + = cùng chiều kim đồng hồ), ly = lớp vẽ:
 *  'f' = trước thân (tay gần người xem) · 'b' = sau thân (tay xa người xem, bị thân che bớt). Toạ độ cho hướng gốc; hướng đối xứng được lật theo thân (fl).
 *  front = S · frontd = SE/SW · side = E/W đứng yên · run = E/W đang chạy · back = N · backd = NE/NW
 *  Tay thuận (main) luôn là tay GẦN người xem khi nhìn nghiêng; fl = toạ độ pháp bảo lơ lửng. */
var ANCH={
 front:{main:{x:-.27,y:.45,a:-10,ly:'f'},off:{x:.27,y:.45,a:10,ly:'f'},fl:{x:.50,y:.80}},
 frontd:{main:{x:-.25,y:.45,a:-10,ly:'f'},off:{x:.24,y:.46,a:16,ly:'b'},fl:{x:.52,y:.80}},
 side:{main:{x:.10,y:.45,a:6,ly:'f'},off:{x:-.12,y:.46,a:-8,ly:'b'},fl:{x:-.45,y:.80}},
 run:{main:{x:.30,y:.62,a:-75,ly:'f'},off:{x:.02,y:.50,a:-82,ly:'b'},fl:{x:-.50,y:.70}},
 back:{main:{x:.27,y:.45,a:10,ly:'f'},off:{x:-.27,y:.45,a:-10,ly:'f'},fl:{x:-.50,y:.80}},
 backd:{main:{x:.26,y:.45,a:10,ly:'f'},off:{x:-.22,y:.46,a:-14,ly:'b'},fl:{x:-.48,y:.80}}
};
var IM={};
function img(id,i){var k=id+i;if(IM[k])return IM[k];var d=MPW[id]&&MPW[id][i];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2],t:d[3]}}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function ease(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function held(o,sp,an,P){
 var HH=P.HH,dh=sp.len*HH,dw=dh*o.w/o.h,ang=an.a*R;
 if(P.at>=0&&P.kind==='front'){ /* chiêu đánh: vung từ sau lưng ra trước */
  var e=ease(P.at);ang=(sp.role==='main'?-70+200*e:-40+150*e)*R}
 else{ang+=Math.sin(P.bp*1.1+(sp.role==='off'?1.7:0))*.03+(P.k?Math.sin(P.wp+(sp.role==='off'?PI:0))*.12*P.k:0)}
 g.save();
 try{g.translate(an.x*P.w,-an.y*HH);g.rotate(ang);g.drawImage(o.im,-dw/2,-sp.grip*dh,dw,dh)}finally{g.restore()}
}
function floaty(o,sp,an,P,sid){
 var HH=P.HH,dh=sp.len*HH,dw=dh*o.w/o.h,t=P.bp,
  x=an.x*P.w+Math.sin(t*.8)*1.8,y=-an.y*HH+Math.sin(t*1.3)*2.4-(P.k?Math.abs(Math.sin(P.wp))*1.5:0),col=COL[sid]||'#fff';
 g.save();
 try{
  g.translate(x,y);
  g.save();g.globalCompositeOperation='lighter';var rg=g.createRadialGradient(0,0,1,0,0,dh*.62);rg.addColorStop(0,col);rg.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.30+.10*Math.sin(t*1.7);g.fillStyle=rg;g.beginPath();g.arc(0,0,dh*.62,0,6.2832);g.fill();g.restore();
  g.rotate(sp.spin?t*.9:Math.sin(t*.9)*.12);
  g.drawImage(o.im,-dw/2,-dh/2,dw,dh)}
 finally{g.restore()}
}
function draw(sid,phase,P){
 if(!CF.enable||!P)return;var L=SPEC[sid];if(!L)return;var A=ANCH[P.kind]||ANCH.front;
 for(var i=0;i<L.length;i++){
  var sp=L[i],o=img(sid,i);if(!ok(o))continue;
  if(sp.role==='float'){if(phase==='back')floaty(o,sp,A.fl,P,sid)}
  else{var an=A[sp.role];if(an&&an.ly===(phase==='back'?'b':'f'))held(o,sp,an,P)}}
}
window.VPW={draw:draw,SPEC:SPEC,ANCH:ANCH,CF:CF};
})();
