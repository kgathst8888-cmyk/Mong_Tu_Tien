/* ===== 🧭 MÔN PHÁI 8 HƯỚNG — 2.5D Tiên Giới (world/74-mon-phai-8-huong.js) — nạp sau world/73 + assets/mon-phai-sprites2.js =====
 * CHỈ khi đang ở Thành Tiên Giới (TG.on()): nhân vật của mình (đã chọn môn phái ở Vạn Pháp Tháp) vẽ theo HƯỚNG ĐI trên màn hình:
 *   xuống (S) = mặt trước · lên (N) = MẶT SAU · trái/phải (E/W) = tư thế CHẠY ngang (lật theo hướng) · 4 hướng chéo = mặt trước/sau xoay 3/4 + nghiêng người.
 *   Đứng yên giữ nguyên hướng cuối cùng. Đổi tư thế có hoà mờ ngắn; hướng được làm mượt + có độ trễ chống giật ở ranh giới.
 * Mọi bản đồ khác (Làng, Linh Giới, hang, phụ bản…) KHÔNG đổi: vẫn gọi hero() của world/73 như cũ.
 * Hướng đi lấy từ window.TGV = {sx,sy} (vector đi trên MÀN HÌNH) do world/61-tien-gioi-thanh.js ghi mỗi bước.
 * Góc hướng tính sau khi bù độ dẹt isometric 2:1 (sy×2) → đi dọc trục bản đồ = chéo 45° trên màn hình, đi thẳng lên/xuống/ngang = N/S/E/W.
 * Ảnh: MPS2[môn].bm/bf (mặt sau nam/nữ), .run (chạy ngang, dùng chung nam/nữ) — cắt từ ảnh mẫu. Mặt trước lấy từ MPS (world/73).
 * Chỉnh: VPG8_CF.enable=false để tắt; VPG8_CF.fade (số khung hoà mờ); VPG8_CF.runH (tỉ lệ chiều cao tư thế chạy so với VPG_CF.h). */
(function(){
'use strict';
if(typeof hero!=='function'||typeof PS==='undefined'||typeof CHR==='undefined'||!window.MPS||!window.MPS2||!window.VP||!window.VPG||!window.TG)return;
var CF=window.VPG8_CF=window.VPG8_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.fade)CF.fade=6;if(!CF.runH)CF.runH=.98;
var COL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var PI=Math.PI,IM={};
function ld(key,d){if(!d)return null;if(IM[key])return IM[key];var im=new Image();im.src=d[0];return IM[key]={im:im,w:d[1],h:d[2]}}
function front(id,g){return ld('f'+id+g,MPS[id]&&MPS[id][g])}
function back(id,g){return ld('b'+id+g,MPS2[id]&&MPS2[id][g==='f'?'bf':'bm'])}
function run(id){return ld('r'+id,MPS2[id]&&MPS2[id].run)}
function ok(o){return o&&o.im.complete&&o.im.naturalWidth>0}
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function wrap(a){while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a}
/* ----- trạng thái hướng/nhịp (cập nhật 1 lần/khung) ----- */
var ST={f:-1,ang:PI/2,tg:PI/2,sec:2,k:0,bp:0,wp:0,key:'',prev:null,fade:0,fl:1};
function tick(){
 if(ST.f===fr)return;ST.f=fr;
 var mv=P.mv?1:0;ST.k+=(mv-ST.k)*(mv?.22:.16);if(ST.k<.002)ST.k=0;
 var v=window.TGV;if(mv&&v&&(v.sx||v.sy))ST.tg=Math.atan2(v.sy*2,v.sx);
 ST.ang=wrap(ST.ang+wrap(ST.tg-ST.ang)*.3);
 var raw=((Math.round(ST.ang/(PI/4))%8)+8)%8;
 if(raw!==ST.sec&&Math.abs(wrap(ST.ang-ST.sec*PI/4))>PI/8+.14)ST.sec=raw;
 ST.bp+=.05;ST.wp+=.3*ST.k;if(ST.fade>0)ST.fade-=1/CF.fade;
}
/* sec: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE (góc màn hình, y hướng xuống) */
var CX=[1,.7071,0,-.7071,-1,-.7071,0,.7071];
function pick(sid,gen,sec,mv){
 var c=CX[sec],sg=c>.01?1:(c<-.01?-1:ST.fl),side=sec===0||sec===4,up=sec>=5,diag=sec===1||sec===3||sec===5||sec===7,HH=(window.VPG_CF&&VPG_CF.h)||76,o,sq=1,fw=0,fl=1,kind;
 if(c)ST.fl=sg;
 if(side&&mv){o=run(sid);kind='run';fl=sg;fw=1;HH*=CF.runH;if(!ok(o)){o=null}}
 if(!o){
  if(side){o=front(sid,gen);kind='side';fl=sg;sq=.8}
  else if(up){o=back(sid,gen);kind='back'+(diag?'d':'');fl=diag?sg:1;sq=diag?.9:1;fw=diag?.55:0}
  else{o=front(sid,gen);kind='front'+(diag?'d':'');fl=diag?sg:1;sq=diag?.9:1;fw=diag?.55:0}
  if(!ok(o)){o=front(sid,gen);kind='front';fl=1;sq=1;fw=0}
 }
 if(!ok(o))return null;
 return{o:o,fl:fl,sq:sq,fw:fw,HH:HH,c:c,run:kind==='run',kind:kind,key:kind+fl}
}
/* ----- vẽ 1 tư thế (dải ngang: đầu đứng yên, gấu áo/tóc bay) ----- */
function drawPose(p,alpha,col,sid){
 var k=ST.k,wp=ST.wp,bp=ST.bp,HH=p.HH,o=p.o,im=o.im,w=HH*o.w/o.h*p.sq,
  bob=-(k*Math.abs(Math.sin(wp))*2.6)+Math.sin(bp)*.7,
  rot=p.c*k*(p.run?.015:.06)+Math.sin(wp)*(p.run?.012:.028)*k,
  sy=1+Math.sin(bp)*.006+Math.cos(wp*2)*.014*k,sx=1/sy,
  N=p.run?20:26,ih=im.naturalHeight,iw=im.naturalWidth,sh=ih/N,dh=HH/N;
 g.save();
 try{
  g.globalAlpha=alpha;g.scale(p.fl,1);g.translate(0,bob);g.rotate(rot);g.scale(sx,sy);
  var wk={kind:p.kind==='side'||p.kind==='run'||p.kind.indexOf('back')===0||p.kind.indexOf('front')===0?p.kind:'front',w:w,HH:HH,k:k,bp:bp,wp:wp,at:-1};
  if(alpha>.5)try{if(window.VPW)VPW.draw(sid,'back',wk)}catch(e){}
  if(k>.45&&p.fw>.3){var ga=(k-.45)*.5*alpha;for(var q=2;q>=1;q--){g.globalAlpha=ga*(.5/q);g.drawImage(im,-w/2-q*9*k*p.fw,-HH,w,HH)}g.globalAlpha=alpha}
  for(var j=0;j<N;j++){
   var u=(j+.5)/N,uu=Math.pow(Math.max(0,u-.12)/.88,1.55),
    dx=uu*(Math.sin(bp*1.3-u*2.6)*1.5+k*(-5.2*p.fw+Math.sin(wp*2-u*3.4)*(2.6+1.4*(1-p.fw))))+Math.sin(wp+1.2)*k*u*u*1.6;
   g.drawImage(im,0,j*sh,iw,sh+.5,-w/2+dx,-HH+j*dh,w,dh+.9)}
  if(alpha>.5)try{if(window.VPW)VPW.draw(sid,'front',wk)}catch(e){}
 }finally{g.restore()}
}
function draw8(sid){
 var gen=window.VPG.gender();tick();
 var p=pick(sid,gen,ST.sec,P.mv?1:0);if(!p)return false;
 if(p.key!==ST.key){if(ST.key&&ST.cur){ST.prev=ST.cur;ST.fade=1}ST.key=p.key}
 ST.cur=p;
 var col=COL[sid]||'#fff',k=ST.k,bp=ST.bp;
 try{if(typeof drawWings==='function')drawWings()}catch(e){}
 g.save();
 try{
  g.translate((P.x-cam)*s,GY);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(0,2,27,6.2,0,0,6.2832);g.fill();
  g.save();g.translate(0,1);g.scale(1,.24);g.globalCompositeOperation='lighter';g.strokeStyle=col;g.globalAlpha=.28+.1*Math.sin(bp*1.6)+.18*k;g.lineWidth=2.2;g.beginPath();g.arc(0,0,23+2*Math.sin(bp*1.6),0,6.2832);g.stroke();g.restore();
  if(ST.fade>0&&ST.prev){drawPose(ST.prev,Math.max(0,ST.fade),col,sid);drawPose(p,1-Math.max(0,ST.fade)*.6,col,sid)}
  else drawPose(p,1,col,sid);
 }finally{g.restore()}
 return true;
}
window.VPG8={state:ST,CF:CF,sector:function(){return ST.sec}};
var _hero=hero;
hero=function(){
 if(!CF.enable||!own()||!window.TG.on())return _hero.apply(this,arguments);
 var sid='';try{sid=window.VP.get()||''}catch(e){}
 if(!sid)return _hero.apply(this,arguments);
 var done=false;
 try{done=draw8(sid)}catch(e){done=false}
 if(!done)return _hero.apply(this,arguments);
};
})();
