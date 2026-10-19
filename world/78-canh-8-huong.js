/* ===== 🪽 CÁNH 8 HƯỚNG — Tiên Giới (world/78-canh-8-huong.js) — nạp sau world/74 + world/77 =====
 * CHỈ khi đang ở Thành Tiên Giới (TG.on()) và nhân vật đã chọn môn phái (cùng điều kiện với world/74): cánh quay theo hướng đi 8 hướng.
 *   xuống (S) = cánh xoè 2 bên sau lưng · lên (N) = cánh vẽ ĐÈ LÊN người (nhìn từ phía sau) · trái/phải (E/W) = cánh gập ra sau lưng (nhìn ngang)
 *   4 hướng chéo = 1 cánh xoè rộng, cánh còn lại thu hẹp lại (xoay 3/4). Góc quay mượt theo VPG8.state.ang, hoạt ảnh vỗ cánh dùng lại WS của core/01u.
 * Mọi bản đồ khác KHÔNG đổi (vẫn dùng drawWings gốc). Cánh ngoại trang (tiệm Y Phục) vẫn do module cũ đảm nhiệm.
 * Chỉnh: WG8_CF.enable=false để tắt; WG8_CF.spread (độ xoè chữ V ở mặt trước/sau); WG8_CF.off (lệch gốc cánh ở mặt trước/sau). */
(function(){
'use strict';
if(typeof drawWings!=='function'||typeof WGA==='undefined'||typeof wgSide!=='function'||!window.VPG8||!window.TG||!window.VP)return;
var CF=window.WG8_CF=window.WG8_CF||{};if(CF.enable===undefined)CF.enable=true;if(CF.spread===undefined)CF.spread=.22;if(CF.off===undefined)CF.off=6;
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function act(){
 if(!CF.enable||!window.VPG8.CF.enable||!own()||!window.TG.on())return false;
 var sid='';try{sid=window.VP.get()||''}catch(e){}
 return !!sid;
}
function cosmetic(){try{var e=eqNow(),M=FMAP();return !!(e.w&&M[e.w]&&M[e.w].draw)}catch(x){return false}}
function upSec(){return window.VPG8.state.sec>=5}
if(WS.g8by===undefined){WS.g8by=0;WS.g8th=0}
var _dw=drawWings;
/* Fix345: chất lượng tự thích ứng — đo chi phí vẽ cánh (ms/khung, trung bình trượt); nặng thì giảm số lát cắt, nhẹ kéo dài thì tăng lại.
   Độ mượt chủ yếu nhờ pha/biên độ liên tục (Fix344), nên giảm lát cắt trên máy yếu gần như không thấy giật. WG8_CF.q = ép mức cố định 0|1|2. */
var QL=2,QE=0,QU=0,QN=[[8,12,16],[6,8,12]],QG=[[4,6,8],[3,4,6]],pnow=window.performance&&performance.now?function(){return performance.now()}:null;
function draw8(){
 var t0=pnow?pnow():0;
 try{draw8b()}finally{if(pnow){var c=pnow()-t0;QE+=(c-QE)*.1;
  if(CF.q!==undefined)QL=CF.q;
  else if(QL>0&&QE>(QL==2?1.5:2.6)){QL--;QU=0}
  else if(QL<2&&QE<(QL==0?.7:1.1)){if(++QU>180){QL++;QU=0}}else QU=0}}
}
function draw8b(){
 var l=wl();if(!l)return;var Wg=WGA[l-1];if(!Wg.im.naturalWidth)return;
 var ST=window.VPG8.state,c=Math.cos(ST.ang),ac=Math.abs(c),
  aa=P.atk>0,mv=!!P.mv&&!aa,k=WGH[l-1]/Wg.h,t=fr,col=WGK[l-1],l4=l==4;WS.s4=l4?1:0;
 if(WS.lf!==fr){WS.lf=fr;WS.sp+=((aa?.3:mv?.2:.075)*(l4?.7:1)-WS.sp)*(l4?.035:.05);WS.am+=((aa?.4:mv?.28:.13)*(l4?.9:1)-WS.am)*(l4?.035:.05);WS.ph+=WS.sp;
  /* Fix344: nhấp nhô + độ mở khi đi được làm mượt (trước đây |sin| gấp khúc và nhảy .05 tức thời) */
  WS.g8by+=((mv?Math.sin(t*.15)*1.6:Math.sin(t*(l4?.05:.08))*(l4?1.1:.7))-WS.g8by)*.18;WS.g8th+=((mv?.05:0)-WS.g8th)*.08}
 var f=wgWv(WS.ph),th0=WGB[l-1]+WS.g8th-CF.spread*(1-ac),
  by=WS.g8by,
  sx=1-.1*Math.max(0,-f)*(WS.am/.3+.4),
  /* e = hướng cánh: +1 chìa sang TRÁI màn hình, -1 sang PHẢI; qua 0 là nhìn nghiêng mép */
  eL=c>=0?1:1+2*c, eR=c<=0?-1:-1+2*c,
  ax=(P.x-cam)*s-c*2*s, ay=GY-(52-by)*s,
  pul=(.2+.09*l)*(.75+.25*Math.sin(t*.07)),rr=WGH[l-1]*.62,
  ox=CF.off*(1-ac),
  wings=[{e:eL,ox:-ox,ph:0},{e:eR,ox:ox,ph:.35}];
 /* cánh thu hẹp hơn (xa người xem) vẽ trước, cánh rộng vẽ sau */
 if(Math.abs(wings[0].e)>Math.abs(wings[1].e))wings.reverse();
 g.save();g.translate(ax,ay);g.scale(s,s);
 g.save();g.globalCompositeOperation='lighter';{var q=g.createRadialGradient(0,-4,2,0,-4,rr);q.addColorStop(0,RGBA(col,.22+.07*l));q.addColorStop(1,RGBA(col,0));g.fillStyle=q;g.beginPath();g.arc(0,-4,rr,0,6.2832);g.fill()}g.restore();
 for(var pass=0;pass<2;pass++){
  for(var i=0;i<2;i++){
   var w=wings[i],near=i===1,kk=k*(near?1:.88),th=th0*(near?1:.9),am=WS.am*(near?1:.92);
   g.save();g.translate(w.ox,0);
   if(pass===0)wgSide(Wg,w.e,kk,th,am,w.ph,near?1:.9,'source-over',sx,QN[l==4?0:1][QL]);
   else wgSide(Wg,w.e,kk,th,am,w.ph,pul*(near?1:.8),'lighter',sx,QG[l==4?0:1][QL]);
   g.restore();
  }
 }
 g.restore();
}
drawWings=function(){
 if(!act()||cosmetic())return _dw.apply(this,arguments);
 if(upSec())return; /* hướng lên: vẽ sau khi vẽ người (bọc hero bên dưới) */
 draw8();
};
var _h=hero;
hero=function(){
 _h.apply(this,arguments);
 if(act()&&upSec()&&!cosmetic()){
  /* Fix333: hướng lên vẽ cánh SAU khi vẽ người nhưng world/74 đã nâng người theo độ bay (fo + nhấp nhô) → nâng cánh đúng bằng đó (trước đây cánh tụt xuống ngang mông) */
  var ST=window.VPG8.state,bp=ST.bp||0,up=(ST.fo||0)+(ST.hv||0)*(Math.sin(bp*1.25)*3.2+Math.sin(bp*2.3+1.1)*.9);
  try{g.save();if(up)g.translate(0,-up*s);draw8()}catch(e){}finally{g.restore()}}
};
window.WG8={draw:draw8};
})();
