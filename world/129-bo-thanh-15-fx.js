/* ✨ HIỆU ỨNG BỘ THÁNH +15 · 2 VỆT SÁNG QUAY NGƯỢC CHIỀU (world/129-bo-thanh-15-fx.js) — Fix389
 * Điều kiện: đủ 10 món Bộ Thánh (it.hl) ở 10 ô trang bị đầu, MÀN NÀO cũng +15.
 * Hiệu ứng: vệt sáng VÀNG quay thuận, vệt sáng XANH quay ngược, vòng quanh người (nghiêng như quỹ đạo 3D:
 *   nửa sau vẽ SAU lưng nhân vật, nửa trước vẽ TRƯỚC). Mỗi lần hiện: mờ vào → quay mềm (nhanh dần rồi chậm dần)
 *   → mờ ra; nghỉ 2–3 giây rồi hiện lại.
 * Chỉ VẼ, không đổi chỉ số. Tắt ở chất lượng thấp (QL>=2). Chỉnh bằng window.BT15 (xem CF bên dưới).
 * Phụ thuộc: hero, EQ, g, P, cam, s, GY (+JY nếu có), assets/vet-sang-bo-thanh.js. Nạp CUỐI để bọc ngoài cùng. */
(function(){
'use strict';
if(typeof hero!=='function'||typeof EQ==='undefined'||!window.BT15_IMG)return;
var CF=window.BT15={
  enable:true,
  need:15,            /* cấp cường hoá tối thiểu của MỖI món */
  pieces:10,          /* số ô trang bị phải là đồ Thánh */
  showMs:1800,        /* mỗi lần hiện kéo dài (ms) */
  gapMin:2000,gapMax:3000, /* nghỉ giữa 2 lần hiện (ms) */
  gold:{R:66,cy:-56,cy2:-86,tilt:.30,roll:-.10,dir:1,turns:1.2,a:1},
  blue:{R:60,cy:-90,cy2:-58,tilt:.27,roll:.10,dir:-1,turns:1.2,a:1}
};
var IM={},ok=0;
['vang','xanh'].forEach(function(k){var m=new Image();m.onload=function(){ok++};m.src=window.BT15_IMG[k];IM[k]=m});
function spr(c1){var cv=document.createElement('canvas');cv.width=cv.height=32;var x=cv.getContext('2d'),q=x.createRadialGradient(16,16,0,16,16,16);
  q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.25,c1);q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,32,32);
  x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,255,255,.9)';x.fillRect(15,2,2,28);x.fillRect(2,15,28,2);return cv}
var SP={gold:spr('rgba(255,214,110,.85)'),blue:spr('rgba(140,205,255,.85)')};

/* ---- đủ bộ Thánh +15? (cache 30 khung hình) ---- */
var ref=null,cnt=0,good=false;
function full(){
  if(EQ!==ref||--cnt<=0){ref=EQ;cnt=30;good=true;
    for(var i=0;i<CF.pieces;i++){var q=EQ[i];if(!q||!q.hl||(q.u|0)<CF.need){good=false;break}}}
  return good}

/* ---- nhịp hiện / nghỉ ---- */
var st={on:0,t0:0,next:0,a0:[0,0]};
function sm(a,b,x){x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
function ease(p){return .5-.5*Math.cos(Math.PI*p)}
function tick(now){
  if(!full()){st.on=0;st.next=0;return -1}
  if(!st.on){
    if(st.next&&now<st.next)return -1;
    st.on=1;st.t0=now;st.a0=[Math.random()*6.283,Math.random()*6.283]}
  var p=(now-st.t0)/CF.showMs;
  if(p>=1){st.on=0;st.next=now+CF.gapMin+Math.random()*(CF.gapMax-CF.gapMin);return -1}
  return p}

/* ---- vẽ 1 vệt (nửa sau: front=0, nửa trước: front=1) ---- */
function ring(c,k,key,p,front,now,X,Y){
  var env=sm(0,.2,p)*(1-sm(.72,1,p));if(env<=.01)return;
  var e=ease(p),ang=c.dir*(st.a0[k]+6.2832*c.turns*e),
      sc=.8+.22*(1-Math.pow(1-Math.min(1,p*1.5),3)),R=c.R*sc,cy=c.cy+(c.cy2-c.cy)*e,im=IM[key],lq=(window.QL|0)>=1;
  g.save();g.translate(X,Y);g.scale(s,s);g.translate(0,cy);g.rotate(c.roll);
  g.beginPath();g.rect(-R*2.2,front?0:-R*2.2,R*4.4,R*2.2);g.clip();
  g.save();g.scale(1,c.tilt);g.rotate(ang);
  g.globalAlpha=env*c.a;g.drawImage(im,-R*1.07,-R*1.07,R*2.14,R*2.14); /* lớp chính: màu thật, nhìn rõ cả trên nền sáng */
  if(!lq){g.globalCompositeOperation='lighter';g.globalAlpha=env*c.a*.28;g.drawImage(im,-R*1.18,-R*1.18,R*2.36,R*2.36)} /* quầng sáng phụ */
  g.restore();
  g.globalCompositeOperation='lighter';
  /* tia lấp lánh chạy dọc vòng */
  var sp=SP[c===CF.gold?'gold':'blue'],n=lq?3:5;
  for(var j=0;j<n;j++){
    var th=ang*1.35+j*6.2832/n,x=Math.cos(th)*R*.97,y=Math.sin(th)*R*.97*c.tilt,
        tw=.5+.5*Math.sin(now*.011+j*1.9),z=(3+3*tw)*(.7+.3*env);
    g.globalAlpha=env*(.25+.6*tw);g.drawImage(sp,x-z,y-z,z*2,z*2)}
  g.restore()}

function draw(p,front){
  var now=performance.now(),X=(P.x-cam)*s,Y=GY-(typeof JY!=='undefined'?JY:0)*s;
  ring(CF.gold,0,'vang',p,front,now,X,Y);
  ring(CF.blue,1,'xanh',p,front,now,X,Y)}

/* Fix390: khi hiệu ứng này đang áp dụng (đủ bộ Thánh +15, bật, chất lượng cao) thì TẮT lấp lánh trang bị (heroSpark) và hào quang +7/+10 (world/37) để không chồng chéo. */
function active(){return !!(CF.enable&&ok>=2&&(window.QL|0)<2&&full())}
CF.on=active;
if(typeof heroSpark==='function'){var _hs=heroSpark;heroSpark=function(){try{if(active())return}catch(e){}return _hs.apply(this,arguments)}}

var _hero=hero;
hero=function(){
  var p=-1;
  try{if(CF.enable&&ok>=2&&(window.QL|0)<2)p=tick(performance.now())}catch(e){p=-1}
  if(p>=0){try{draw(p,0)}catch(e){}}
  var r=_hero.apply(this,arguments);
  if(p>=0){try{draw(p,1)}catch(e){}}
  return r};
})();
