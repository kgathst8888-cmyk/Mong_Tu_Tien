/* Fix440 — Ác Ma Vương dùng nhân vật Spine (ch35022) thay bộ khung vẽ tay.
 * Spine đã bake sẵn ra sprite sheet webp (tools/bake_spine_boss.py) → không cần runtime Spine.
 * Chỉ thay HÌNH: AI/máu/sát thương/vòng báo trước/thưởng của world/62 giữ nguyên.
 * world/62 gọi ACMA_SPX.draw(g,a,fr,e) trong dgFoe; trả true khi đang tải (không vẽ), false khi ảnh lỗi → tự vẽ bộ khung cũ.
 * Tắt: ACMA_SPX.enable=false · chỉnh cỡ: ACMA_SPX.H (chiều cao thân, đơn vị game). */
(function(){
var M={cell:320,cols:8,ox:170.7,foot:213.0,bodyH:196.5,
 idle:{s:0,n:8},move:{s:8,n:10},attack:{s:18,n:12},skill:{s:30,n:14},hit:{s:44,n:3}};
var X=window.ACMA_SPX={enable:true,H:260,ok:false,img:null,fail:false,last:0,idle:60000};
/* tải lười: chỉ tải ảnh (~20MB giải mã) khi boss thật sự được vẽ; không dùng nữa → tự nhả bộ nhớ */
function load(){if(X.img||X.fail)return;var im=new Image();im.decoding='async';
 im.onload=function(){X.ok=true};im.onerror=function(){X.fail=true;X.img=null;X.ok=false};
 im.src='assets/ac-ma-spine/ac_ma_vuong.webp?v=440';X.img=im}
setInterval(function(){if(X.img&&X.ok&&Date.now()-X.last>X.idle){X.img=null;X.ok=false}},15000);
function cl(v,a,b){return v<a?a:v>b?b:v}
/* t = khung trôi qua, hit = khung ra đòn, dur = tổng khung, ev = mốc ra đòn trong animation (0..1) */
function prog(t,hit,dur,ev){return t<hit?t/hit*ev:ev+(t-hit)/Math.max(1,dur-hit)*(1-ev)}
function pick(a,fr,e){
 var st=a.st,t=a.t||0,A,u;
 if(st==='slash'){A=M.attack;u=prog(t,40,70,.4)}
 else if(st==='thrust'){A=M.attack;u=prog(t,30,62,.4)}
 else if(st==='leap'){A=M.skill;u=t/82}
 else if(st==='cast'){A=M.skill;u=t/96}
 else if(st==='nova'){A=M.skill;u=t/100}
 else if(e&&e.fl>0&&st!=='emerge'){A=M.hit;u=e.fl>4?0:e.fl>2?.5:1;return A.s+Math.round(cl(u,0,1)*(A.n-1))}
 else if(st==='walk'){A=M.move;return A.s+Math.floor((((a.w||0)/6.2832)%1+1)%1*A.n)}
 else{A=M.idle;return A.s+Math.floor(fr/15)%A.n}
 return A.s+Math.round(cl(u,0,1)*(A.n-1))}
X.draw=function(g,a,fr,e){
 if(!X.enable||X.fail||!a)return false;
 X.last=Date.now();if(!X.ok){load();return true}   /* đang tải: không vẽ gì (tránh nháy hình cũ→mới) */
 var i=pick(a,fr,e),k=X.H/M.bodyH,c=M.cell;
 try{g.drawImage(X.img,(i%M.cols)*c,Math.floor(i/M.cols)*c,c,c,-M.ox*k,-M.foot*k,c*k,c*k)}catch(x){return false}
 return true};
})();
