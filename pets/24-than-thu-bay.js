/* ===== 🕊 THẦN THÚ BAY TỰ DO =====
 * Cả 4 thần thú (Hổ, Chu Tước, Rồng, Hồn Khuyển/Huyền Vũ) bay lượn khắp bản đồ, không còn bị buộc quanh nhân vật:
 *  - Khi không có địch: lượn tới các điểm ngẫu nhiên trên toàn chiều ngang bản đồ ở nhiều độ cao, đôi lúc ghé lại gần chủ.
 *  - Có địch: bay tới địch ở bất kỳ đâu trên bản đồ (engine cũ chỉ tìm địch trong tầm ~T.rg+170 quanh thú).
 *  - Không bị kéo về khi ở xa chủ (bỏ dịch chuyển >480px), hoạt động ở mọi bản đồ chiến đấu (kể cả bản đồ đầu và Linh Giới).
 *  - Ở Làng / Thành Thị Linh Giới / Khai Mỏ / Linh Điền (không có vòng lặp thú của engine): module tự lượn bằng idle().
 * Bật/tắt: nút "🕊 Bay tự do" trong tab 🐾 Thú (PS[cur].thb: 0 = tắt, còn lại = bật; mặc định BẬT). Tắt là về hành vi cũ.
 * Điểm móc trong engine: epstep (3 chỗ), vstep (1 chỗ), pets/22-chu-tuoc.js step (1 chỗ) gọi PFLY.on/tx/run.
 * Chỉnh: khối CF. API: window.PFLY. (Không đặt tên HD/THB... để tránh trùng biến có sẵn trong engine.) */
(function(){
'use strict';
if(typeof epstep!=='function'||typeof pet!=='function'||typeof EP==='undefined'||typeof PK==='undefined')return;
var CF={altMin:46,altMax:170,near:.3,pauseMin:40,pauseMax:120,wanderMin:260,wanderMax:520,far:300};
var S={wx:null,wy:70,wt:0,pz:0,r:1.1,ch:false,last:0};
/* Fix270: CHỈ Chu Tước (k=1) và Thanh Long (k=2) bay. Bạch Hổ (k=0) và Huyền Vũ (k=3) chỉ đi trên mặt đất, luôn chạy theo chủ như cũ. */
function canFly(p){return !!p&&(p.k===1||p.k===2)}
function on(){try{var p=pet();return canFly(p)&&PS[cur].thb!==0}catch(e){return false}}
function rnd(a,b){return a+Math.random()*(b-a)}
function lim(v,a,b){return Math.max(a,Math.min(b,v))}
function ymax(){try{return Math.max(CF.altMin+20,Math.min(CF.altMax,GY/s-120))}catch(e){return CF.altMax}}
function pick(){
  var w=vw(),lo=40,hi=Math.max(lo+1,w-40),x;
  if(Math.random()<CF.near)x=lim(P.x+rnd(-140,140),lo,hi);
  else{for(var i=0;i<4;i++){x=rnd(lo,hi);if(Math.abs(x-EP.x)>w*.22)break}}
  S.wx=x;S.wy=rnd(CF.altMin,ymax());S.wt=(rnd(CF.wanderMin,CF.wanderMax))|0;S.pz=0;
}
/* Điểm đến (x) của thú trong khung này. e = địch gần nhất (hoặc null). */
function tx(tx0,e,k){
  var w=vw(),K=PK[k];
  if(e){
    S.ch=true;S.wx=null;S.r=1.35;S.wy=CF.altMin+14;
    var s2=EP.x<e.x?-1:1;
    return lim(e.x+s2*K.sd,40,Math.max(41,w-40));
  }
  S.ch=false;
  if(S.wx==null||--S.wt<=0)pick();
  if(Math.abs(S.wx-EP.x)<26){                    /* tới nơi: lơ lửng một lúc rồi chọn điểm mới */
    if(S.pz===0)S.pz=(rnd(CF.pauseMin,CF.pauseMax))|0;
    if(--S.pz<=0)pick();
    S.r=1;return EP.x;
  }
  S.r=Math.abs(S.wx-EP.x)>CF.far?1.65:1.1;
  return S.wx;
}
function run(r0){return S.r||r0}
/* Giữ độ cao bay (không áp dụng khi đang tung đòn: engine tự điều khiển y lúc tấn công) */
function hover(){
  var p=pet();if(!p||EP.at>0||!canFly(p))return;
  var ty=(S.wy||70)+Math.sin(EP.t*.045)*7+Math.sin(EP.t*.017)*4+p.ev*4;
  EP.y+=(ty-EP.y)*.06;
  if(p.k!==1&&Math.abs(EP.vx)>1.2&&EP.t%6===0&&PT.length<120){      /* vệt gió cho thú không có cánh */
    try{PT.push({x:EP.x-EP.d*10,y:EP.y+8,vx:-EP.d*.5,vy:.15,l:24,c:'#dfeaff'})}catch(e){}
  }
}
/* Bọc epstep: engine chạy bước thú cũ (tấn công, kỹ năng, chọn địch), rồi module chỉnh độ cao bay */
/* Fix194: ở Làng / Thành Thị Linh Giới / Mỏ / Linh Điền, step() thoát ngay sau vstep() nên mảng hạt PT KHÔNG được cập nhật (l không giảm, không bị xoá)
   trong khi draw() vẫn vẽ PT → vệt gió của thú bay đứng yên thành "chấm chấm" khắp bản đồ. Nay vstep tự làm già hạt (cùng công thức với step) + giới hạn số lượng. */
function ageFx(){
  try{
    if(!Array.isArray(PT)||!PT.length)return;
    if(PT.length>160)PT=PT.slice(-160);
    for(var i=0;i<PT.length;i++){var q=PT[i];q.x+=q.vx||0;q.y-=q.vy||0;q.vy=(q.vy||0)+.2;q.l--}
    PT=PT.filter(function(q){return q.l>0});
  }catch(e){PT=[]}
}
if(typeof vstep==='function'){var _vsF=vstep;vstep=function(){var r=_vsF.apply(this,arguments);ageFx();return r}}
var _ep=epstep;
epstep=function(){
  var r=_ep.apply(this,arguments);
  S.last=performance.now();
  try{if(on())hover()}catch(e){}
  return r;
};
/* Bản đồ không có vòng lặp thú của engine (Làng, Thành Thị, Mỏ, Linh Điền): tự lượn */
/* Thú đi bộ (Bạch Hổ, Huyền Vũ) ở bản đồ không có vòng lặp thú của engine: vstep đã kéo thú theo chủ; ở đây chỉ hạ về mặt đất + cho chân chạy theo quãng đường thực */
function idleGround(p){
  var k=p.k,K=PK[k];
  if(EP.t===undefined)Object.assign(EP,{t:0,y:0,vx:0,d:1,at:0,atT:1,ox:EP.x,tgx:EP.x,tg:null,kind:0,sk:180,ph:0,hit:0,ps:-1});
  if(EP.ps!==k){EP.ps=k;EP.y=0;EP.vx=0;EP.sk=180}
  if((k===1||k===0)&&EP.fp===undefined)Object.assign(EP,{fp:0,fa:.6,gl:0,ly:EP.y||0,mt:0,na:0,si:0,bn:[],rb:EP.rb||0,q:[],sw:.4,skn:0,evo:0});
  EP.at=0;EP.t++;
  var px=(EP._gx===undefined||!isFinite(EP._gx))?EP.x:EP._gx,mv=EP.x-px;EP._gx=EP.x;
  EP.vx+=(Math.max(-K.sp,Math.min(K.sp,mv))-EP.vx)*.35;
  if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);else EP.d=P.d||EP.d||1;
  var mvf=Math.min(1,Math.abs(EP.vx)/2.4);
  EP.ph+=mvf*.3+.05;
  EP.ly=EP.y;EP.y+=(0-EP.y)*.3;if(EP.y<.05)EP.y=0
}
function idle(){
  if(typeof started==='undefined'||!started)return;
  if(performance.now()-S.last<90)return;           /* đang ở bản đồ chiến đấu: engine lo */
  var p0=pet();if(!p0)return;
  if(!canFly(p0)){idleGround(p0);return}
  if(!on())return;
  var p=pet(),k=p.k,K=PK[k];
  if(EP.t===undefined)Object.assign(EP,{t:0,y:K.al,vx:0,d:1,at:0,atT:1,ox:EP.x,tgx:EP.x,tg:null,kind:0,sk:180,ph:0,hit:0,ps:-1});
  if(EP.ps!==k){EP.ps=k;EP.y=K.al;EP.vx=0;EP.sk=180}
  if((k===1||k===0)&&EP.fp===undefined)Object.assign(EP,{fp:0,fa:.6,gl:0,ly:EP.y||0,mt:0,na:0,si:0,bn:[],rb:EP.rb||0,q:[],sw:.4,skn:0,evo:0});
  EP.at=0;EP.t++;
  var w=vw();
  if(!isFinite(EP.x)||EP.x<=0||EP.x>w+200)EP.x=lim(P.x-50*P.d,40,w-40);
  var t=tx(0,null,k),dx=t-EP.x,sp=K.sp*S.r;
  EP.vx+=(lim(dx*.07*S.r,-sp,sp)-EP.vx)*.16;
  if(Math.abs(dx)<4&&Math.abs(EP.vx)<.3)EP.vx*=.5;
  EP.x=lim(EP.x+EP.vx,30,Math.max(31,w-30));
  if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);
  var mvf=Math.min(1,Math.abs(EP.vx)/2.4);
  EP.ph+=mvf*.3+.05;
  if(k===1){EP.ly=EP.y;EP.fp+=.2+mvf*.1;EP.fa+=((.5+.3*mvf)-EP.fa)*.08;EP.sw+=((mvf*.9+.35)-EP.sw)*.06}
  hover();
}
(function loop(t){if(!document.hidden&&!(t-(loop.l||0)<15)){loop.l=t;try{idle()}catch(e){}}requestAnimationFrame(loop)})();
/* Nút bật/tắt trong tab 🐾 Thú */
function tg(){try{PS[cur].thb=on()?0:1;try{sv()}catch(e){}ui()}catch(e){}}
if(typeof petUI==='function'){
  var _ui=petUI;
  petUI=function(){
    var h=_ui.apply(this,arguments);
    if(typeof h!=='string'||!pet())return h;
    if(!canFly(pet()))return h+'<div class="dt"><small>🐾 '+(pet().k===0?'Bạch Hổ':'Huyền Vũ')+' chỉ đi trên mặt đất. Chỉ <b>Chu Tước</b> và <b>Thanh Long</b> mới bay lượn tự do.</small></div>';
    return h+'<div class="dt"><button onclick="PFLY.tg()" style="'+(on()?'background:#8a6420':'')+'">🕊 Bay tự do: '+(on()?'BẬT':'TẮT')+'</button><br><small>Chu Tước và Thanh Long bay lượn khắp bản đồ (kể cả Làng, Linh Giới) và lao tới địch ở bất cứ đâu. Tắt để thú chỉ đi quanh nhân vật như cũ. (Bạch Hổ và Huyền Vũ luôn đi trên mặt đất.)</small></div>';
  };
}
window.PFLY={canFly:canFly,on:on,tx:tx,run:run,tg:tg,idle:idle,cfg:CF};
})();
