/* ===== 🔥 THÚ CƯỠI — Tiên Thú Viên · Thực Hỏa Điểu (world/96-thu-cuoi.js) — nạp SAU world/74 + 78 + 89 + assets/thuc-hoa-dieu-assets.js =====
 * • Mở khoá "Tiên Thú Viên" (TG.spots id 'beast') ở Thành Thị Tiên Giới: chạm → bảng Thú Cưỡi.
 * • Thú cưỡi đầu tiên: THỰC HỎA ĐIỂU. Điều kiện cưỡi: đã chuyển thế Tiên Nhân (CTHE.on()) VÀ Lv ≥ CF.lv (50).
 * • Khi cưỡi (chỉ vẽ ở Thành Thị Tiên Giới): chim bay 8 hướng theo hướng đi (5 tư thế cắt từ GIF + 3 hướng lật gương, hoà trộn mượt theo VPG8.state.ang),
 *   vỗ cánh bằng lưới cột (đầu cánh nhấp nhô), đuôi lửa/đốm lửa bay theo; nhân vật NGỒI KHOANH CHÂN trên lưng chim (thân trên vẽ bằng hero() gốc, cắt ngang hông + vẽ hai chân khoanh).
 * • Tư thế ngồi: dùng ảnh ngồi thiền 8 hướng của từng môn phái (assets/ngoi-thien-assets.js, STH_ASSETS[môn][0..7]); không có ảnh (chưa chọn môn phái) → quay về cách cũ: hero() gốc cắt ngang hông + vẽ chân khoanh.
 * • Dữ liệu lưu: PS[cur].mt = {own:{thd:1}, on:0|1}. Không đụng logic game; gỡ module = xoá 2 thẻ script (assets + module).
 * Chỉnh: THUCUOI_CF {lv, hb (cao chim), sh (cao người ngồi), up (độ bay), enable}. API: THUCUOI.on() · .toggle() · .open() */
(function(){
'use strict';
if(typeof hero!=='function'||typeof nameTag!=='function'||typeof g==='undefined'||typeof PS==='undefined'||!window.TG||!TG.spots||!window.VPG8||!window.VP||!window.THD_ASSETS)return;
var CF=window.THUCUOI_CF=window.THUCUOI_CF||{};
if(CF.enable===undefined)CF.enable=true;if(!CF.lv)CF.lv=50;if(!CF.hb)CF.hb=112;if(!CF.sh)CF.sh=54;if(CF.up===undefined)CF.up=16;
var PI=Math.PI,TAU=PI*2;
/* ---------- ảnh chim: 5 tư thế gốc, 3 hướng còn lại lật gương ----------
 * chỉ số khung theo world/74: 0 S · 1 SE · 2 E · 3 NE · 4 N · 5 NW · 6 W · 7 SW. [sprite, lật, seat x, seat y] (seat = điểm ngồi trên thân chim, tỉ lệ ảnh) */
var POSE=[['p1',0,.50,.42],['p6',1,.50,.44],['p2',0,.45,.44],['p7',0,.50,.46],['p3',0,.50,.40],['p7',1,.50,.46],['p2',1,.45,.44],['p6',0,.50,.44]];
var IM={};
function img(k){var o=IM[k];if(o)return o;var d=THD_ASSETS[k];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2]}}
function ready(o){return o&&o.im.complete&&o.im.naturalWidth>0}
Object.keys(THD_ASSETS).forEach(img);
/* ---------- dữ liệu ---------- */
function rec(){try{var p=PS[cur];if(!p)return null;if(!p.mt||typeof p.mt!=='object')p.mt={own:{},on:0};if(!p.mt.own)p.mt.own={};return p.mt}catch(e){return null}}
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function isTien(){try{return !!(window.CTHE&&CTHE.on())}catch(e){return false}}
function lvOk(){try{return (P.lv|0)>=CF.lv}catch(e){return false}}
function canRide(){return isTien()&&lvOk()}
function mounted(){var m=rec();return !!(m&&m.on&&m.own.thd)}
function active(){return CF.enable&&mounted()&&own()&&canRide()&&window.TG.on()}
function save(){try{sv()}catch(e){}try{ui()}catch(e){}}
/* ---------- bảng Tiên Thú Viên ---------- */
var box=null,HOVH0=null;
function say(t){try{DT.push({x:P.x,y:150,s:t,g:1,l:150})}catch(e){}}
function ensureBox(){if(box)return box;box=document.createElement('div');box.id='thd-panel';
 box.style.cssText='position:fixed;left:50%;bottom:92px;transform:translateX(-50%);width:min(390px,90vw);box-sizing:border-box;background:linear-gradient(#2a1630,#100818);border:2px solid #ffb27a;border-radius:14px;padding:12px 14px;color:#fff0e2;font:14px/1.5 KTH Serif,Songti SC,serif;z-index:29;box-shadow:0 8px 30px #000a,0 0 26px #ff8a4a55;text-align:center;display:none';
 document.body.appendChild(box);
 box.addEventListener('pointerdown',function(e){e.stopPropagation()});
 box.addEventListener('click',function(e){var a=e.target&&e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
  if(a==='x'){box.style.display='none';return}
  if(a==='ride')toggle();
  render()});
 return box}
function row(ok,t,v){return '<div style="text-align:left;margin:2px 0;color:'+(ok?'#9dffb0':'#ff9a8a')+'">'+(ok?'✅':'❌')+' '+t+' <b>'+v+'</b></div>'}
function render(){var b=ensureBox(),m=rec(),d=THD_ASSETS.p3,tien=isTien(),lvv=lvOk(),ok=tien&&lvv,on=mounted();
 if(m&&!m.own.thd){m.own.thd=1;save()}
 b.innerHTML='<div style="font-size:22px">🐉 <b style="color:#ffb0ff">Tiên Thú Viên</b></div><div style="opacity:.85;margin:2px 0 6px">Thú cưỡi · linh điểu Tiên Giới</div>'+
  '<div style="display:flex;gap:10px;align-items:center;background:rgba(255,140,80,.13);border:1px solid #ff9a5a88;border-radius:10px;padding:8px"><img src="'+d[0]+'" style="width:96px;height:auto;filter:drop-shadow(0 0 8px #ff8a3a)" alt="">'+
  '<div style="text-align:left;flex:1"><div style="font-size:16px"><b style="color:#ffb070">Thực Hỏa Điểu</b></div><div style="font-size:12.5px;opacity:.9">Linh điểu hoả hệ bay 8 hướng, ngồi khoanh chân trên lưng chim. Thú cưỡi đầu tiên của Tiên Nhân.</div></div></div>'+
  '<div style="margin:8px 0 4px">'+row(tien,'Cảnh giới Tiên Nhân',tien?'đã chuyển thế':'chưa chuyển thế')+row(lvv,'Cấp Tiên Nhân ≥ '+CF.lv,'Lv '+(P.lv|0))+'</div>'+
  '<div style="margin:8px 0"><button data-a="ride" '+(ok?'':'disabled ')+'style="background:'+(ok?(on?'#7a3a3a':'#c0521e'):'#444')+';color:#fff;border:1px solid #ffc89a;border-radius:8px;padding:6px 22px;font:inherit;opacity:'+(ok?1:.55)+'">'+(ok?(on?'⬇ Xuống thú':'🔥 Cưỡi Thực Hỏa Điểu'):'🔒 Chưa đủ điều kiện')+'</button> '+
  '<button data-a="x" style="background:#5a3a9a;color:#fff;border:1px solid #c8b4ff;border-radius:8px;padding:6px 18px;font:inherit">Đóng</button></div>'+
  '<div style="font-size:12px;opacity:.75">Cưỡi thú chỉ hiển thị ở Thành Thị Tiên Giới.</div>';
 b.style.display='block'}
function open(){render()}
function toggle(){var m=rec();if(!m)return;if(!canRide()){say('🔒 Cần Tiên Nhân Lv '+CF.lv+' mới cưỡi được');return}
 m.own.thd=1;m.on=m.on?0:1;save();say(m.on?'🔥 Đã cưỡi Thực Hỏa Điểu':'⬇ Đã xuống thú')}
/* ---------- mở khoá Tiên Thú Viên ---------- */
function sync(){TG.spots.forEach(function(p){if(p.id!=='beast')return;if(!p.open||p.go!==open){p.open=1;p.go=open;p.sub='Thú cưỡi · Thực Hỏa Điểu';p.desc='Vườn nuôi tiên thú. Tiên Nhân Lv '+CF.lv+' có thể nhận và cưỡi Thực Hỏa Điểu.'}})}
sync();setInterval(sync,2000);
/* ---------- vẽ chim cưỡi ---------- */
var FL={f:-1,ph:0,k:0};
function fstep(ST){var f=typeof fr==='number'?fr:0;if(FL.f===f)return;FL.f=f;var mv=ST.k>.05?1:0;FL.k+=(mv-FL.k)*.1;FL.ph+=.15+.22*FL.k}
function ease2(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function seatYof(up){return -(up+36)}
/* vẽ 1 tư thế chim, điểm ngồi nằm ở (0,sy). Lưới cột: đầu cánh nhấp nhô theo nhịp vỗ */
function pose(idx,alpha,sy,hb,amp){var P0=POSE[idx],o=img(P0[0]);if(!ready(o))return;
 var h=hb*(P0[0]==='p2'?.96:1),w=h*o.w/o.h,bx=-w*P0[2],by=sy-h*P0[3],N=20,iw=o.im.naturalWidth,ih=o.im.naturalHeight,cw=iw/N,dw=w/N;
 g.save();g.globalAlpha=alpha;if(P0[1])g.scale(-1,1);
 try{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high'}catch(e){}
 for(var j=0;j<N;j++){var xn=((j+.5)/N-P0[2]);var wing=Math.pow(Math.min(1,Math.abs(xn)*2.1),1.35);
  var dy=Math.sin(FL.ph-Math.abs(xn)*1.4)*amp*wing;
  g.drawImage(o.im,j*cw,0,cw+.6,ih,bx+j*dw,by+dy,dw+.7,h)}
 g.restore()}
function drawBird(){var ST=VPG8.state;fstep(ST);var bp=ST.bp||0,k=FL.k,
  up=(CF.up||0)+Math.sin(bp*1.25)*3.2+Math.sin(bp*2.3+1.1)*1.1,sy=seatYof(up),hb=CF.hb,amp=hb*.075*(.55+.6*k),
  u=(PI/2-ST.ang)/(PI/4);u=((u%8)+8)%8;var i0=Math.floor(u),t=u-i0,i1=(i0+1)%8,wB=t<.35?0:(t>.65?1:ease2((t-.35)/.3)),
  hx=Math.cos(ST.ang)*k,col='255,140,60';
 g.save();g.translate((P.x-cam)*s,GY);g.scale(s,s);
 /* bóng đất + quầng lửa */
 g.fillStyle='rgba(0,0,30,'+(.34-.1*Math.min(1,up/30)).toFixed(3)+')';g.beginPath();g.ellipse(0,2,30,7,0,0,TAU);g.fill();
 g.save();g.globalCompositeOperation='lighter';
 var q=g.createRadialGradient(0,sy,4,0,sy,hb*.8);q.addColorStop(0,'rgba('+col+',.30)');q.addColorStop(1,'rgba('+col+',0)');g.fillStyle=q;g.beginPath();g.arc(0,sy,hb*.8,0,TAU);g.fill();
 /* đốm lửa bay theo sau */
 var bxv=-Math.cos(ST.ang),byv=-Math.sin(ST.ang)*.5,f=typeof fr==='number'?fr:0,i,ph,r;
 for(i=0;i<9;i++){ph=(f*.018+i/9)%1;r=(1-ph)*3.4+.6;g.globalAlpha=(1-ph)*(.35+.4*k);g.fillStyle=i%3?'rgba(255,170,70,1)':'rgba(255,230,140,1)';
  g.beginPath();g.arc(Math.sin(i*2.7+bp*.6)*14+bxv*ph*(20+30*k),sy+hb*.16+byv*ph*(14+14*k)+ph*18,r,0,TAU);g.fill()}
 g.restore();
 g.save();g.rotate(hx*.05+Math.sin(bp*.9)*.012);
 if(wB<=.002)pose(i0,1,sy,hb,amp);else if(wB>=.998)pose(i1,1,sy,hb,amp);else{pose(i0,1,sy,hb,amp);pose(i1,wB,sy,hb,amp)}
 g.restore();g.restore();return sy}
/* hai chân khoanh + váy, vẽ đè lên chỗ cắt hông */
var ROBE={umt:'#8a5ad8',hbd:'#4ab8d8',ptc:'#e8803a',tkt:'#5a8ae0',vdm:'#4cc86a',ngc:'#e8c060'};
function mix(h,t){var n=parseInt(h.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255;return 'rgb('+Math.round(r+(255-r)*t)+','+Math.round(gg+(255-gg)*t)+','+Math.round(b+(255-b)*t)+')'}
function legs(sy){var ST=VPG8.state,sid='';try{sid=VP.get()||''}catch(e){}var c=ROBE[sid]||'#d8a060',
  fx=Math.cos(ST.ang),fy=Math.sin(ST.ang)*.5;
 g.save();g.translate((P.x-cam)*s,GY+sy*s);g.scale(s,s);
 var lg=g.createLinearGradient(0,-4,0,12);lg.addColorStop(0,mix(c,.35));lg.addColorStop(1,mix(c,-0));
 g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,9,22,6,0,0,TAU);g.fill();
 g.fillStyle=lg;g.strokeStyle='rgba(40,20,20,.55)';g.lineWidth=.9;
 g.beginPath();g.ellipse(0,3,20,8,0,0,TAU);g.fill();g.stroke();
 /* hai đầu gối */
 g.beginPath();g.ellipse(-16,5,8,4.4,-.12,0,TAU);g.fill();g.stroke();
 g.beginPath();g.ellipse(16,5,8,4.4,.12,0,TAU);g.fill();g.stroke();
 /* hai bàn chân bắt chéo phía trước (theo hướng mặt) */
 g.fillStyle='#f4ead6';var ox=fx*7,oy=fy*5+7;
 g.beginPath();g.ellipse(ox-5,oy+.5,5.2,2.8,.25,0,TAU);g.fill();g.stroke();
 g.beginPath();g.ellipse(ox+5,oy-.5,5.2,2.8,-.25,0,TAU);g.fill();g.stroke();
 g.restore()}
/* ---------- ngồi thiền bằng ảnh theo môn phái ---------- */
var SI={};
function sitImg(sid,i){var k=sid+i;if(SI[k])return SI[k];var A=window.STH_ASSETS&&STH_ASSETS[sid],d=A&&A[i];if(!d)return null;var im=new Image();im.src=d[0];return SI[k]={im:im,w:d[1],h:d[2]}}
function sitOK(sid){if(!sid||!window.STH_ASSETS||!STH_ASSETS[sid])return false;for(var i=0;i<8;i++){var o=sitImg(sid,i);if(!ready(o))return false}return true}
function sitPose(o,alpha,sy,SHh,bp,k){var h=SHh,w=h*o.w/o.h,N=22,ih=o.im.naturalHeight,iw=o.im.naturalWidth,sh=ih/N,dh=h/N,
  bob=Math.sin(FL.ph)*1.1*(.5+k),y0=sy+7-h+bob;
 g.save();g.globalAlpha=alpha;try{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high'}catch(e){}
 for(var j=0;j<N;j++){var u=(j+.5)/N,uu=Math.pow(Math.max(0,u-.1)/.9,1.5),dx=uu*(Math.sin(bp*1.2-u*2.6)*1.3+k*Math.sin(FL.ph*.8-u*3)*1.8);
  g.drawImage(o.im,0,j*sh,iw,sh+.5,-w/2+dx,y0+j*dh,w,dh+.8)}
 g.restore()}
function drawSit(sid,sy){var ST=VPG8.state,bp=ST.bp||0,k=FL.k,SHh=CF.sh||54,u=(PI/2-ST.ang)/(PI/4);u=((u%8)+8)%8;
 var i0=Math.floor(u),t=u-i0,i1=(i0+1)%8,wB=t<.35?0:(t>.65?1:ease2((t-.35)/.3)),A=sitImg(sid,i0),B=sitImg(sid,i1);
 g.save();g.translate((P.x-cam)*s,GY);g.scale(s,s);
 if(wB<=.002)sitPose(A,1,sy,SHh,bp,k);else if(wB>=.998)sitPose(B,1,sy,SHh,bp,k);else{sitPose(A,1,sy,SHh,bp,k);sitPose(B,wB,sy,SHh,bp,k)}
 g.restore()}
/* ---------- móc vào hero() / nameTag() ---------- */
var _h=hero,SY=0,RISE=0;
function riderOff(sy){var HH=(window.VPG_CF&&VPG_CF.h)||76;return sy+.40*HH}
hero=function(){
 if(!active())return _h.apply(this,arguments);
 var h0=window.VPG8_CF;if(h0&&HOVH0===null){HOVH0=h0.hoverH;h0.hoverH=0}
 var sy=SY;try{sy=drawBird()}catch(e){sy=SY;console.error('THUCUOI',e)}SY=sy;
 var sid='';try{sid=VP.get()||''}catch(e){}
 if(sitOK(sid)){try{drawSit(sid,sy);RISE=sy+((window.VPG_CF&&VPG_CF.h)||76)-(CF.sh||54)+4;return}catch(e){console.error('THUCUOI sit',e)}}
 var og=GY,ro=riderOff(sy);RISE=ro;
 g.save();g.beginPath();g.rect(-20000,-20000,40000,20000+og+(sy+4)*s);g.clip();
 GY=og+ro*s;
 try{_h.apply(this,arguments)}finally{GY=og;g.restore()}
 try{legs(sy)}catch(e){}
};
var _nt=nameTag;
nameTag=function(){
 if(!active()||!RISE)return _nt.apply(this,arguments);
 var og=GY;GY=og+RISE*s;try{_nt.apply(this,arguments)}finally{GY=og}
};
/* khi không còn cưỡi → trả lại độ lơ lửng cũ của Tiên Nhân */
setInterval(function(){if(HOVH0!==null&&!active()){try{VPG8_CF.hoverH=HOVH0}catch(e){}HOVH0=null}},400);
window.THUCUOI={on:mounted,toggle:toggle,open:open,cfg:CF,can:canRide};
})();
