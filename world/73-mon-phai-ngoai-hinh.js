/* ===== 🎭 NGOẠI HÌNH MÔN PHÁI + GIỚI TÍNH (world/73-mon-phai-ngoai-hinh.js) — nạp sau world/72, sau assets/mon-phai-8h.js =====
 * Fix204: ảnh mới 8 hướng (MP8). Bản đồ 2D dùng khung 3/4 'Trước-Phải' / 'Trước-Trái' theo hướng đi (không còn lật ảnh mặt trước); đổi hướng thì QUAY MƯỢT qua khung 'Trước' (hoà trộn ~8 khung). Lớp vũ khí cũ tắt mặc định (VPG_CF.weapon=true để bật lại).
 * Chọn môn phái ở Vạn Pháp Tháp (kèm chọn Nam/Nữ) → nhân vật CỦA MÌNH đổi sang hình môn phái đó (6 môn × Nam/Nữ, ảnh MPS trong assets/mon-phai-sprites.js).
 * Cách làm: bọc hero() ở lớp ngoài cùng (giống equipment/51-dao-the-outfit.js). Không sửa engine. Chưa chọn môn / ảnh chưa tải / có lỗi → vẽ như cũ.
 * Chuyển động kiểu 2.5D trên tranh đứng: nhún theo nhịp bước, nghiêng người về hướng chạy, vạt áo/tóc chia dải bay ngược chiều chạy (gấu bay nhiều hơn thân),
 *   bóng dưới chân + vòng sáng màu môn phái, vệt tàn ảnh khi chạy, lao tới khi đánh; chiều sâu theo s/GY của bản đồ (Thành Tiên Giới thu nhỏ/phóng to tự theo).
 * Giới tính lưu ở PS[cur].vp.g ('m'|'f', mặc định 'm') — mỗi nhân vật riêng. API: VPG.gender()/setGender(g)/preview(môn,g)/CF.
 * Chỉnh: CF.h (chiều cao vẽ, đơn vị thế giới), CF.enable=false để tắt. */
(function(){
'use strict';
if(typeof hero!=='function'||typeof PS==='undefined'||typeof CHR==='undefined'||!window.MPS||!window.MP8||!window.VP)return;
var CF=window.VPG_CF=window.VPG_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.h)CF.h=76;if(!CF.strips)CF.strips=26;if(CF.hover===undefined)CF.hover=true;if(CF.weapon===undefined)CF.weapon=false;if(!CF.hoverH)CF.hoverH=22;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var IM={};
function img(id,gk){var k=id+gk;if(IM[k])return IM[k];var d=MPS[id]&&MPS[id][gk];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2]}}
function fimg(id,g,i){var k='8'+id+g+i;if(IM[k])return IM[k];var d=window.MP8&&MP8[id]&&MP8[id][g]&&MP8[id][g][i];if(!d)return null;var im=new Image();im.src=d[0];return IM[k]={im:im,w:d[1],h:d[2]}}
function fok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function V(){var p=PS[cur];if(!p)return null;var v=p.vp;if(!v||typeof v!=='object')v=p.vp={id:'',u:{},mx:1};return v}
function gender(){var v=V();return v&&v.g==='f'?'f':'m'}
function setGender(g){var v=V();if(!v||(g!=='m'&&g!=='f'))return false;v.g=g;try{if(typeof sv==='function')sv()}catch(e){}return true}
function sect(){try{return window.VP.get()||''}catch(e){return ''}}
function preview(id,g){var d=MPS[id]&&MPS[id][g==='f'?'f':'m'];return d?d[0]:''}
window.VPG={get state(){return ST},gender:gender,setGender:setGender,preview:preview,CF:CF};
/* chỉ nhân vật của mình (người khác ở Làng Online / đối thủ Đấu Trường mượn bản sao P) */
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
var ST={f:-1,k:0,bp:0,wp:0,hv:0,fc:1};
/* Fix179: Tiên Nhân (CTHE.on()) bay lơ lửng ở mọi bản đồ 2D (Map Treo, thành 2D, làng…): không bước chân, người nhấp nhô cách đất CF.hoverH, vòng + hạt linh khí. Tắt: VPG_CF.hover=false */
function hovOn(){try{return !!(CF.hover&&window.CTHE&&CTHE.on&&CTHE.on())}catch(e){return false}}
function tick(){if(ST.f===fr)return;ST.f=fr;var mv=P.mv&&!(P.atk>0)?1:0;ST.k+=(mv-ST.k)*(mv?.2:.16);if(ST.k<.002)ST.k=0;ST.hv+=((hovOn()?1:0)-ST.hv)*.08;if(ST.hv<.004)ST.hv=0;ST.bp+=.05;ST.wp+=.3*ST.k;var dd=P.d||1,df=dd-ST.fc;ST.fc=Math.abs(df)<.02?dd:ST.fc+df*.15}
function ease(x){return x*x*(3-2*x)}
function hovFx(col,k,bp){
 if(window.HOVFX&&HOVFX.draw&&HOVFX.CF.enable){g.save();g.translate(0,2);HOVFX.draw(g,col,k,bp,ST.hv,-1,.15);g.restore();return}
 var hv=ST.hv,a=hv*(.3+.1*Math.sin(bp*1.8)),i,q,ph;
 g.save();g.globalCompositeOperation='lighter';g.translate(0,2);
 g.save();g.scale(1,.26);g.strokeStyle=col;g.lineWidth=2;g.globalAlpha=a+.12*k;g.beginPath();g.arc(0,0,17+2*Math.sin(bp*1.8),0,6.2832);g.stroke();g.lineWidth=1.2;g.globalAlpha=a*.6;g.beginPath();g.arc(0,0,11-1.5*Math.sin(bp*1.8),0,6.2832);g.stroke();g.restore();
 g.fillStyle=col;
 for(i=0;i<5;i++){ph=(bp*.35+i/5)%1;g.globalAlpha=hv*(1-ph)*.55;g.beginPath();g.arc(Math.sin(i*2.4+bp*.5)*13-ph*k*16,ph*12,2.2*(1-ph)+.5,0,6.2832);g.fill()}
 if(k>.08)for(q=1;q<=3;q++){g.globalAlpha=.13*k*hv/q;g.beginPath();g.arc(-q*9*k,-34,10-2*q,0,6.2832);g.fill()}
 g.restore();
}
function drawSect(o,sid){
 var jy=(!vil&&P.jy)||0,t=fr,hv=ST.hv,up=hv*(CF.hoverH+Math.sin(ST.bp*1.25)*3.2);
 if(jy||up){g.save();g.translate(0,-(jy+up)*s)}
 try{if(typeof drawWings==='function')drawWings()}catch(e){}
 if(jy||up)g.restore();
 tick();
 var gen=gender(),fc=ST.fc,A=fimg(sid,gen,0),B=fimg(sid,gen,fc>=0?1:7),wB=ease(Math.min(1,Math.abs(fc)));
 if(!fok(A)||!fok(B)){if(!fok(A)&&!fok(B))return false;if(!fok(A))A=B;if(!fok(B))B=A}
 var k=ST.k,wp=ST.wp,bp=ST.bp,aa=P.atk>0,at=aa&&P.atkT?1-P.atk/P.atkT:0,lunge=aa?Math.sin(Math.min(1,Math.max(0,at))*3.14159):0,
  JK=Math.max(.5,1-jy/420),HH=CF.h,col=COL[sid]||'#fff',d=P.d||1;
 g.save();
 try{
  g.translate((P.x-cam)*s,GY-jy*s);g.scale(s,s);
  /* bóng + vòng môn phái dưới chân */
  g.fillStyle='rgba(0,0,0,'+(.38*Math.max(.3,1-jy/320)*(1-.3*hv))+')';g.beginPath();g.ellipse(0,2+jy,27*JK*(1-.3*hv),6.2*JK*(1-.3*hv),0,0,6.2832);g.fill();
  g.save();g.translate(0,1+jy);g.scale(1,.24);g.globalCompositeOperation='lighter';g.strokeStyle=col;g.globalAlpha=(.28+.1*Math.sin(bp*1.6)+.18*k)*(1-.65*hv);g.lineWidth=2.2;g.beginPath();g.arc(0,0,23+2*Math.sin(bp*1.6),0,6.2832);g.stroke();g.restore();
  if(!vil&&P.jr){g.translate(0,-50);g.rotate(P.jr*d);g.translate(0,50)}
  g.scale(d,1);
  if(hv>.02){g.save();g.translate(0,-up+jy*0);hovFx(col,k,bp);g.restore()}
  if(up)g.translate(0,-up);
  /* nghiêng người quanh gót chân: chạy ngả về trước, đánh lao tới */
  var bob=-(k*Math.abs(Math.sin(wp))*2.6*(1-hv))+Math.sin(bp)*.7+hv*Math.sin(bp*2.1+.8)*.5,
   rot=(k*.06*(1+hv*1.3)+Math.sin(wp)*.028*k*(1-hv)+hv*Math.sin(bp*.9)*.022+lunge*.12)*(1-hv),
   sy=1+Math.sin(bp)*.006+Math.cos(wp*2)*.014*k*(1-hv),sx=1/sy;
  g.translate(lunge*8*(1-hv),bob+HH*.012);g.rotate(rot);g.scale(sx,sy);
  g.scale(d,1); /* huỷ lật: khung ảnh đã đúng hướng; dx/tàn ảnh nhân d để vẫn trôi ngược chiều đi */
  g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
  var pass=[[A,1]];if(wB>.998)pass=[[B,1]];else if(wB>.002)pass.push([B,wB]);
  for(var pi=0;pi<pass.length;pi++){
   var o2=pass[pi][0],al=pass[pi][1],im=o2.im,w=HH*o2.w/o2.h,N=CF.strips,ih=im.naturalHeight,iw=im.naturalWidth,sh=ih/N,dh=HH/N;
   g.globalAlpha=al;
   if(k>.45&&hv<.5&&al>.5){var ga=(k-.45)*.55*(1-.5*hv);for(var q=2;q>=1;q--){g.globalAlpha=ga*(.55/q);g.drawImage(im,-w/2-d*q*9*k,-HH,w,HH)}g.globalAlpha=al}
   for(var j=0;j<N;j++){
    var u=(j+.5)/N,uu=Math.pow(Math.max(0,u-.12)/.88,1.55),
     dx=(1-hv)*uu*(Math.sin(bp*1.3-u*2.6)*1.5+hv*Math.sin(bp*1.6-u*3)*uu*2.2+k*(1+hv*.6)*(-5.2+Math.sin(wp*2-u*3.4)*2.6))+Math.sin(wp+1.2)*k*u*u*1.8,
     dxs=hv*uu*(Math.sin(bp*1.1-u*2.4)*2.1+Math.sin(bp*.7-u*3.1+1)*1.1-d*2.8*k);
    g.drawImage(im,0,j*sh,iw,sh+.6,-w/2+dx*d+dxs,-HH+j*dh,w,dh+.6)}
  }
  g.globalAlpha=1;
  if(CF.weapon){try{if(window.VPW){var wk={kind:'front',dir:d,w:HH*A.w/A.h,HH:HH,k:k,bp:bp,wp:wp,at:aa?Math.max(0,Math.min(1,at)):-1};VPW.draw(sid,'back',wk);VPW.draw(sid,'front',wk)}}catch(e){}}
 }finally{g.restore()}
 return true;
}
var _hero=hero;
hero=function(){
 if(!CF.enable||!own())return _hero.apply(this,arguments);
 var sid=sect();if(!sid)return _hero.apply(this,arguments);
 var o=fimg(sid,gender(),0);
 if(!o||!o.im.complete||!o.im.naturalWidth)return _hero.apply(this,arguments);
 var done=false;try{done=drawSect(o,sid)}catch(e){done=false}
 if(!done)return _hero.apply(this,arguments);
};
})();
