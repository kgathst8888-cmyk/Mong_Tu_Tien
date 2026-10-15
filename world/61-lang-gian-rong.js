/* ===================================================================
   LÀNG TÂN THỦ GIÃN RỘNG + CAMERA THEO NHÂN VẬT (như Linh Giới)
   - Thế giới làng rộng tối thiểu WIDE (mặc định 1320 đơn vị), màn hình hẹp chỉ thấy một phần.
   - Camera bám nhân vật (mượt), bị chặn ở hai mép làng.
   - Tái dùng nguyên vẹn code làng cũ: vw() trả bề rộng làng khi đang ở làng thường nên
     nhà, cổng, người chơi online... tự dàn ra; toàn bộ cảnh làng vẽ trong 1 phép dịch camera;
     toạ độ chạm được cộng thêm camera ở pha capture.
   - Chỉ bật ở làng thường: KHÔNG áp dụng khi đang ở Linh Điền/Linh Giới, mỏ, Hồn Phách, tiệm trang phục,
     hầm ngục hay chiến trường (vw() giữ nguyên = bề rộng màn hình).
   Điểm móc nhỏ: core/01c vw(), core/01q (chữ hướng dẫn), world/41 (nhãn người chơi). Đổi WIDE ở dưới để chỉnh độ rộng.
   =================================================================== */
(function(){
'use strict';
var WIDE=1320,begun=false,W0=0,cam0=0,camX=0,wasOn=false;
function g_(n){try{return typeof window[n]!=='undefined'?window[n]:null}catch(e){return null}}
function plain(){
  if(typeof vil==='undefined'||!vil||typeof started==='undefined'||!started||(typeof over!=='undefined'&&over))return false;
  /* FM / MN khai báo bằng const ở phạm vi toàn cục → KHÔNG nằm trên window; phải dùng typeof (g_ trả null → bỏ qua kiểm tra → camera rộng bị bật nhầm ở Linh Điền/Mỏ) */
  try{var a=(typeof FM!=='undefined')?FM:g_('FM');if(a&&a.isOn&&a.isOn())return false}catch(e){}
  try{var b=(typeof MN!=='undefined')?MN:g_('MN');if(b&&b.isOn&&b.isOn())return false}catch(e){}
  try{var l=(typeof LCT!=='undefined')?LCT:null;if(l&&l.on&&l.on())return false}catch(e){}
  try{var h=g_('HONP');if(h&&h.on&&h.on())return false}catch(e){}
  try{var f=g_('FSH');if(f&&f.open&&f.open())return false}catch(e){}
  return true;
}
function realW(){return (begun?W0:W)}
function ww(){return Math.max(realW()/s,WIDE)}
window.VWD={on:plain,ww:ww,cam:function(){return camX},cx:function(){return begun?camX*s+W0/2:W/2}};

/* bắt đầu phép dịch camera đúng lúc vẽ nền làng (xbg(-1)); kết thúc ở lớp vdraw ngoài cùng */
if(typeof xbg==='function'){var _xbg=xbg;xbg=function(gy,m){if(m===-1&&!begun&&plain()){begun=true;W0=W;cam0=cam;g.save();g.translate(-camX*s,0);cam=0;W=ww()*s}return _xbg.apply(this,arguments)}}
if(typeof vdraw==='function'){var _vd=vdraw;vdraw=function(){try{return _vd.apply(this,arguments)}finally{if(begun){begun=false;W=W0;cam=cam0;g.restore()}}}}

/* camera bám nhân vật khi đi trong làng */
function tick(){
  if(plain()){
    var rv=W/s,max=Math.max(0,ww()-rv),tg=Math.max(0,Math.min(max,P.x-rv/2));
    if(!(P.x>=0))return; /* chặn NaN */
    if(!wasOn){wasOn=true;camX=tg}else{
      camX+=(tg-camX)*.16;if(Math.abs(tg-camX)<.2)camX=tg;
      /* không bao giờ để nhân vật ra khỏi dải giữa màn hình (30%-70%) dù camera bị trễ khung/bước */
      camX=Math.max(P.x-rv*.7,Math.min(P.x-rv*.3,camX));camX=Math.max(0,Math.min(max,camX));
    }
    cam=camX;
  }
}
function leave(){wasOn=false;camX=0;cam=0;try{P.x=cl(P.x,40,W/s-40)}catch(e){}}
if(typeof vstep==='function'){var _vs=vstep;vstep=function(){var r=_vs.apply(this,arguments);try{tick()}catch(e){console.error('[lang-gian-rong]',e)}return r}}
if(typeof step==='function'){var _st=step;step=function(){if(wasOn&&!plain()){try{leave()}catch(e){}}return _st.apply(this,arguments)}}

/* toạ độ chạm: cộng camera trước mọi trình xử lý khác trên canvas */
try{
  if(typeof c!=='undefined'&&c&&c.addEventListener){
    c.addEventListener('pointerdown',function(e){
      if(!plain()||camX===0||e.__vwd)return;
      try{Object.defineProperty(e,'offsetX',{value:e.offsetX+camX*s,configurable:true});e.__vwd=1}catch(x){}
    },true);
  }
}catch(e){console.error('[lang-gian-rong] pointer',e)}
})();
