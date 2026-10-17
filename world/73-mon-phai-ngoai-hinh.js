/* ===== 🎭 NGOẠI HÌNH MÔN PHÁI + GIỚI TÍNH (world/73-mon-phai-ngoai-hinh.js) — nạp sau world/72, sau assets/mon-phai-sprites.js =====
 * Chọn môn phái ở Vạn Pháp Tháp (kèm chọn Nam/Nữ) → nhân vật CỦA MÌNH đổi sang hình môn phái đó (6 môn × Nam/Nữ, ảnh MPS trong assets/mon-phai-sprites.js).
 * Cách làm: bọc hero() ở lớp ngoài cùng (giống equipment/51-dao-the-outfit.js). Không sửa engine. Chưa chọn môn / ảnh chưa tải / có lỗi → vẽ như cũ.
 * Chuyển động kiểu 2.5D trên tranh đứng: nhún theo nhịp bước, nghiêng người về hướng chạy, vạt áo/tóc chia dải bay ngược chiều chạy (gấu bay nhiều hơn thân),
 *   bóng dưới chân + vòng sáng màu môn phái, vệt tàn ảnh khi chạy, lao tới khi đánh; chiều sâu theo s/GY của bản đồ (Thành Tiên Giới thu nhỏ/phóng to tự theo).
 * Giới tính lưu ở PS[cur].vp.g ('m'|'f', mặc định 'm') — mỗi nhân vật riêng. API: VPG.gender()/setGender(g)/preview(môn,g)/CF.
 * Chỉnh: CF.h (chiều cao vẽ, đơn vị thế giới), CF.enable=false để tắt. */
(function(){
'use strict';
if(typeof hero!=='function'||typeof PS==='undefined'||typeof CHR==='undefined'||!window.MPS||!window.VP)return;
var CF=window.VPG_CF=window.VPG_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.h)CF.h=76;if(!CF.strips)CF.strips=26;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var IM={};
function img(id,gk){var k=id+gk;if(IM[k])return IM[k];var d=MPS[id]&&MPS[id][gk];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2]}}
function V(){var p=PS[cur];if(!p)return null;var v=p.vp;if(!v||typeof v!=='object')v=p.vp={id:'',u:{},mx:1};return v}
function gender(){var v=V();return v&&v.g==='f'?'f':'m'}
function setGender(g){var v=V();if(!v||(g!=='m'&&g!=='f'))return false;v.g=g;try{if(typeof sv==='function')sv()}catch(e){}return true}
function sect(){try{return window.VP.get()||''}catch(e){return ''}}
function preview(id,g){var d=MPS[id]&&MPS[id][g==='f'?'f':'m'];return d?d[0]:''}
window.VPG={gender:gender,setGender:setGender,preview:preview,CF:CF};
/* chỉ nhân vật của mình (người khác ở Làng Online / đối thủ Đấu Trường mượn bản sao P) */
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
var ST={f:-1,k:0,bp:0,wp:0};
function tick(){if(ST.f===fr)return;ST.f=fr;var mv=P.mv&&!(P.atk>0)?1:0;ST.k+=(mv-ST.k)*(mv?.2:.16);if(ST.k<.002)ST.k=0;ST.bp+=.05;ST.wp+=.3*ST.k}
function ease(x){return x*x*(3-2*x)}
function drawSect(o,sid){
 var jy=(!vil&&P.jy)||0,t=fr;
 if(jy){g.save();g.translate(0,-jy*s)}
 try{if(typeof drawWings==='function')drawWings()}catch(e){}
 if(jy)g.restore();
 tick();
 var k=ST.k,wp=ST.wp,bp=ST.bp,aa=P.atk>0,at=aa&&P.atkT?1-P.atk/P.atkT:0,lunge=aa?Math.sin(Math.min(1,Math.max(0,at))*3.14159):0,
  JK=Math.max(.5,1-jy/420),HH=CF.h,sc=HH/o.h,w=o.w*sc,col=COL[sid]||'#fff',d=P.d||1;
 g.save();
 try{
  g.translate((P.x-cam)*s,GY-jy*s);g.scale(s,s);
  /* bóng + vòng môn phái dưới chân */
  g.fillStyle='rgba(0,0,0,'+(.38*Math.max(.3,1-jy/320))+')';g.beginPath();g.ellipse(0,2+jy,27*JK,6.2*JK,0,0,6.2832);g.fill();
  g.save();g.translate(0,1+jy);g.scale(1,.24);g.globalCompositeOperation='lighter';g.strokeStyle=col;g.globalAlpha=.28+.1*Math.sin(bp*1.6)+.18*k;g.lineWidth=2.2;g.beginPath();g.arc(0,0,23+2*Math.sin(bp*1.6),0,6.2832);g.stroke();g.restore();
  if(!vil&&P.jr){g.translate(0,-50);g.rotate(P.jr*d);g.translate(0,50)}
  g.scale(d,1);
  /* nghiêng người quanh gót chân: chạy ngả về trước, đánh lao tới */
  var bob=-(k*Math.abs(Math.sin(wp))*2.6)+Math.sin(bp)*.7,
   rot=k*.06+Math.sin(wp)*.028*k+lunge*.12,
   sy=1+Math.sin(bp)*.006+Math.cos(wp*2)*.014*k,sx=1/sy;
  g.translate(lunge*8,bob);g.rotate(rot);g.scale(sx,sy);
  var N=CF.strips,ih=o.im.naturalHeight,iw=o.im.naturalWidth,sh=ih/N,dh=HH/N,im=o.im;
  try{if(window.VPW)VPW.draw(sid,'back',{kind:'front',w:w,HH:HH,k:k,bp:bp,wp:wp,at:-1})}catch(e){}
  /* tàn ảnh khi chạy */
  if(k>.45){var ga=(k-.45)*.55;for(var q=2;q>=1;q--){g.globalAlpha=ga*(.55/q);g.drawImage(im,-w/2-q*9*k,-HH,w,HH)}g.globalAlpha=1}
  /* vẽ theo dải ngang: đầu đứng yên, gấu áo/tóc bay ngược chiều chạy */
  for(var j=0;j<N;j++){
   var u=(j+.5)/N,uu=Math.pow(Math.max(0,u-.12)/.88,1.55),
    dx=uu*(Math.sin(bp*1.3-u*2.6)*1.5+k*(-5.2+Math.sin(wp*2-u*3.4)*2.6))+Math.sin(wp+1.2)*k*u*u*1.8;
   g.drawImage(im,0,j*sh,iw,sh+.6,-w/2+dx,-HH+j*dh,w,dh+.6)}
  try{if(window.VPW)VPW.draw(sid,'front',{kind:'front',w:w,HH:HH,k:k,bp:bp,wp:wp,at:aa?Math.max(0,Math.min(1,at)):-1})}catch(e){}
 }finally{g.restore()}
}
var _hero=hero;
hero=function(){
 if(!CF.enable||!own())return _hero.apply(this,arguments);
 var sid=sect();if(!sid)return _hero.apply(this,arguments);
 var o=img(sid,gender());
 if(!o||!o.im.complete||!o.im.naturalWidth)return _hero.apply(this,arguments);
 try{drawSect(o,sid)}catch(e){return _hero.apply(this,arguments)}
};
})();
