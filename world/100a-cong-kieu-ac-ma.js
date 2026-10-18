/* ===== 🌀 CỔNG KIỂU ÁC MA CHO LÀNG TÂN THỦ 2 / 3 (world/100a-cong-kieu-ac-ma.js) — Fix312 — nạp TRƯỚC world/100 =====
 * Vẽ lại cổng truyền tống (cổng vào ở Làng 1 + cổng "Về Làng" trong Làng 2/3) theo kiểu cổng Ác Ma Thượng Giới của Linh Giới (world/62):
 *   trận pháp elip dưới chân + hào quang · xoáy cổng nhỏ (lõi tối, vòng xoắn quay) · khung elip + 4 ngọc · bảng tên dạng viên thuốc (icon + tên + dòng phụ).
 * Nhỏ hơn cổng cũ nhiều (K=.5) nên nhìn như cổng ở xa, gọn mắt. Chỉnh cỡ: GTK.K. API: GTK.portal(...) · GTK.plate(...)
 * Dùng bởi portal()/plate() trong world/100 và world/102 (nếu thiếu module này, 2 file đó vẽ bằng hàm cũ). Gỡ = xoá thẻ script. */
(function(){
'use strict';
if(window.GTK||typeof g==='undefined')return;
var GTK=window.GTK={K:.5},PI2=6.2832,F='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
function lite(){return (window.QL|0)>=2}
function glow(x,y,rx,ry,rgb,a){g.save();g.translate(x,y);g.scale(1,ry/rx);var q=g.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.beginPath();g.arc(0,0,rx,0,PI2);g.fill();g.restore()}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
/* x,y = tâm xoáy cổng (px màn hình); sw = hệ số s của game; rgb 'r,g,b'; core = [sáng, giữa, tối] */
GTK.portal=function(x,y,sw,rgb,core,t,locked){
  var K=GTK.K,pcy=y,by=y+66*K*sw,rx=50*K*sw,ry=14*K*sw,prx=30*K*sw,pry=58*K*sw,pu=.5+.5*Math.sin(t*.07),j,lt=lite(),sp=locked?.3:1;
  g.save();g.globalCompositeOperation='lighter';
  glow(x,by-2*sw,rx*1.8,ry*2,rgb,locked?.12:.26+.08*pu);glow(x,pcy,pry*1.5,pry*1.7,rgb,locked?.08:.18+.06*pu);
  g.lineWidth=Math.max(1.2,2.2*sw*K*1.6);g.strokeStyle='rgba('+rgb+','+(locked?.5:.95)+')';g.beginPath();g.ellipse(x,by,rx,ry,0,0,PI2);g.stroke();
  g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(255,235,210,'+(locked?.25:.55)+')';g.beginPath();g.ellipse(x,by,rx*.62,ry*.62,0,0,PI2);g.stroke();
  for(j=0;j<12;j+=2){var ar=-t*.012*sp+j*.5236,c1=Math.cos(ar),s1=Math.sin(ar);g.strokeStyle='rgba('+rgb+','+(locked?.25:(j%2?.35:.75))+')';g.beginPath();g.moveTo(x+c1*rx*.62,by+s1*ry*.62);g.lineTo(x+c1*rx*(j%2?.78:.92),by+s1*ry*(j%2?.78:.92));g.stroke()}
  g.setLineDash([6*sw*K*1.6,8*sw*K*1.6]);g.lineDashOffset=t*.4*sp;g.strokeStyle='rgba(255,240,220,'+(locked?.3:.7)+')';g.beginPath();g.ellipse(x,by,rx*.8,ry*.8,0,0,PI2);g.stroke();g.setLineDash([]);
  g.restore();
  g.save();g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,PI2);
  var pg=g.createRadialGradient(x,pcy,2,x,pcy,pry);pg.addColorStop(0,core[2]);pg.addColorStop(.45,core[1]);pg.addColorStop(.85,'rgba('+rgb+',.55)');pg.addColorStop(1,'rgba('+rgb+',.2)');
  g.fillStyle=pg;g.fill();g.clip();
  g.lineCap='round';g.strokeStyle='rgba('+(locked?'200,190,225':'255,245,225')+',.55)';g.lineWidth=Math.max(1,1.4*sw);
  for(j=0;j<4;j++){var a0=-t*.05*sp*(j%2?-1:1)+j*1.3,k2=.2+j*.17;g.beginPath();g.ellipse(x,pcy,prx*k2,pry*k2,a0,0,3.8);g.stroke()}
  if(!lt&&!locked)for(j=0;j<5;j++){var q2=((t*.014)+j*.1)%1,an=j*2.4-q2*5,r2=(1-q2)*pry;g.fillStyle='rgba(255,236,170,'+(.85*Math.sin(q2*3.1416))+')';g.beginPath();g.arc(x+Math.cos(an)*r2*.52,pcy+Math.sin(an)*r2,Math.max(.8,(1+(j%3)*.5)*sw),0,PI2);g.fill()}
  g.restore();
  g.save();var fc=locked?'#7d7390':'rgb('+rgb+')',lw=Math.max(2,3.4*sw*K*1.6);g.lineWidth=lw;g.strokeStyle=fc;
  if(!lt&&!locked){g.globalAlpha=.2+.07*pu;g.lineWidth=lw*2.6;g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,PI2);g.stroke();g.globalAlpha=1;g.lineWidth=lw}
  g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,PI2);g.stroke();
  g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(255,240,225,'+(locked?.4:.9)+')';g.beginPath();g.ellipse(x,pcy,prx*1.12,pry*1.06,0,0,PI2);g.stroke();
  [[0,-pry*1.06],[0,pry*1.06],[-prx*1.12,0],[prx*1.12,0]].forEach(function(o,n){var jr=Math.max(2.2,3.6*sw*K*1.6),jg=g.createRadialGradient(x+o[0],pcy+o[1],0,x+o[0],pcy+o[1],jr*2);
    jg.addColorStop(0,'#fff');jg.addColorStop(.4,locked?'#b8aed0':(n?'rgb('+rgb+')':'#fff3dc'));jg.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=jg;g.beginPath();g.arc(x+o[0],pcy+o[1],jr*2,0,PI2);g.fill()});
  g.restore();
  return pry;
};
/* bảng tên viên thuốc: a = '🏯 Tên' (emoji đầu tách ra làm icon) · b = dòng phụ · yc = tâm bảng · rgb viền */
GTK.plate=function(x,yc,sw,a,b,colA,colB,rgb){
  var m=/^(\S+)\s+(.*)$/.exec(a||''),ic=m?m[1]:'',nm=m?m[2]:a,fs=Math.max(11,12*sw);
  g.save();g.textBaseline='middle';
  g.font='700 '+fs+'px '+F;var w1=g.measureText(nm).width;g.font='600 '+(fs*.78)+'px '+F;var w2=g.measureText(b).width;
  var icw=fs*1.18,bw=Math.max(w1,w2)+icw*2+fs*1.3,bh=fs*2.7,bx=x-bw/2,by=yc-bh/2;
  g.fillStyle='rgba(0,0,0,.34)';rr(bx,by+2,bw,bh,bh*.32);g.fill();g.fillStyle='rgba(18,12,22,.88)';rr(bx,by,bw,bh,bh*.32);g.fill();
  g.lineWidth=1.2;g.strokeStyle='rgba('+rgb+',.9)';g.stroke();
  g.beginPath();g.arc(bx+icw+fs*.2,yc,icw*.78,0,PI2);g.fillStyle='rgba(12,8,16,.95)';g.fill();g.strokeStyle='rgb('+rgb+')';g.lineWidth=1.4;g.stroke();
  g.textAlign='center';g.font=(fs*1.05)+'px sans-serif';g.fillStyle='#fff';g.fillText(ic,bx+icw+fs*.2,yc+fs*.06);
  g.textAlign='left';var tx=bx+icw*2+fs*.55;
  g.font='700 '+fs+'px '+F;g.fillStyle=colA;g.fillText(nm,tx,yc-fs*.52);
  g.font='600 '+(fs*.78)+'px '+F;g.fillStyle=colB;g.fillText(b,tx,yc+fs*.66);
  g.restore()};
})();
