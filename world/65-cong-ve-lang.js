/* ===== 🏘 CỔNG VỀ THÔN TÂN THỦ · Thành Thị Linh Giới (world/65-cong-ve-lang.js) =====
 * Thêm cổng thứ 6 (chỉ số cuối của LCT.gates) đặt đúng ở cột sáng phía trái bản đồ thành thị (vị trí khoanh đỏ).
 * Chạm cổng (hoặc đi tới) → LCT.leave(): giống nút 🏘 Làng, quay về Làng/Thôn Tân Thủ.
 * Không sửa world/10 hay world/58: chỉ bọc LGART.gx (toạ độ cổng) và LGART.gate (vẽ cổng) cho riêng cổng mới.
 * Chỉnh: PX/PY (vị trí cột sáng, px ảnh gốc 1320×743 của world/58), LB (độ cao nhãn), G (tên/màu). Tắt: bỏ <script> trong index.html. */
(function(){
'use strict';
if(typeof LCT==='undefined'||!LCT.gates||!window.LGART||typeof LGART.gate!=='function'||typeof LGART.gx!=='function'||typeof LGART.ok!=='function'||typeof g==='undefined')return;
var PX=110,PY=592,IW=1320,LB=392;
var G={sn:'Về Làng',n:'Về Thôn Tân Thủ',e:'🏘',c:'#5fe0a8',rgb:'70,225,165',sub:'Chạm để về Làng',open:1,go:function(){try{LCT.leave()}catch(e){}}};
var IDX=-1,k;for(k=0;k<LCT.gates.length;k++)if(LCT.gates[k]&&LCT.gates[k].n===G.n){IDX=k;break}
if(IDX<0)IDX=LCT.gates.push(G)-1;

var _gx=LGART.gx;LGART.gx=function(i){return i===IDX?PX/IW*LGART.ww():_gx.apply(this,arguments)};

function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function glowEl(x,y,rx,ry,rgb,a){g.save();g.translate(x,y);g.scale(1,ry/rx);var q=g.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'rgba('+rgb+','+a+')');q.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=q;g.beginPath();g.arc(0,0,rx,0,6.2832);g.fill();g.restore()}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function banner(x,y,fs){
  var F='KTH Serif,Georgia,serif',nm=G.n,sub=G.sub;g.save();g.textBaseline='middle';
  g.font='700 '+fs+'px '+F;var w1=g.measureText(nm).width;g.font='600 '+(fs*.76)+'px '+F;var w2=g.measureText(sub).width;
  var ic=fs*1.18,bw=Math.max(w1,w2)+ic*2+fs*1.3,bh=fs*2.7,bx=Math.max(4,x-bw/2),by=y-bh/2;
  g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=8;g.fillStyle='rgba(16,22,42,.88)';rr(bx,by,bw,bh,bh*.32);g.fill();g.shadowBlur=0;
  g.lineWidth=1.2;g.strokeStyle='rgba(140,235,190,.85)';g.stroke();
  g.beginPath();g.arc(bx+ic+fs*.2,y,ic*.78,0,6.2832);g.fillStyle='rgba(10,14,30,.95)';g.fill();g.strokeStyle=G.c;g.lineWidth=1.4;g.stroke();
  g.textAlign='center';g.font=(fs*1.05)+'px sans-serif';g.fillStyle='#fff';g.fillText(G.e,bx+ic+fs*.2,y+fs*.06);
  g.textAlign='left';var tx=bx+ic*2+fs*.55;
  g.font='700 '+fs+'px '+F;g.fillStyle='#e8fff4';g.fillText(nm,tx,y-fs*.52);
  g.font='600 '+(fs*.76)+'px '+F;g.fillStyle='#b8ffe0';g.fillText(sub,tx,y+fs*.66);
  g.restore();return bx+bw/2}

var _gate=LGART.gate;
LGART.gate=function(Gt,i,x,t,tgt){
  if(i!==IDX)return _gate.apply(this,arguments);
  var L=LGART.L;if(!LGART.ok()||!L)return true;
  if(x<-260||x>L.W+260)return true;
  var sw=L.sw,by=L.dy+PY*sw,rx=50*sw,ry=14*sw,pu=.5+.5*Math.sin(t*.07),rgb=G.rgb,j,lite=(window.QL|0)>=2;
  var pcy=by-66*sw,prx=30*sw,pry=58*sw;                       /* xoáy cổng đứng trên cột sáng */
  /* 1) trận pháp dưới chân + hào quang (cộng sáng) */
  g.save();g.globalCompositeOperation='lighter';
  glowEl(x,by-2*sw,rx*1.8,ry*2,rgb,.36+.12*pu);glowEl(x,pcy,pry*1.5,pry*1.7,rgb,.2+.08*pu);
  g.lineWidth=Math.max(1.5,2.2*sw);g.strokeStyle='rgba('+rgb+',.9)';g.beginPath();g.ellipse(x,by,rx,ry,0,0,6.2832);g.stroke();
  g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(220,255,240,.55)';g.beginPath();g.ellipse(x,by,rx*.62,ry*.62,0,0,6.2832);g.stroke();
  for(j=0;j<12;j++){var ar=t*.012+j*.5236,c1=Math.cos(ar),s1=Math.sin(ar);g.strokeStyle='rgba(170,255,215,'+(j%2?.35:.7)+')';g.beginPath();g.moveTo(x+c1*rx*.62,by+s1*ry*.62);g.lineTo(x+c1*rx*(j%2?.78:.92),by+s1*ry*(j%2?.78:.92));g.stroke()}
  g.setLineDash([6*sw,8*sw]);g.lineDashOffset=-t*.4;g.strokeStyle='rgba(220,255,240,.7)';g.beginPath();g.ellipse(x,by,rx*.8,ry*.8,0,0,6.2832);g.stroke();g.setLineDash([]);
  g.restore();
  /* 2) xoáy cổng: lõi trắng-vàng, vòng xoắn quay, chữ 歸 */
  g.save();g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,6.2832);
  var pg=g.createRadialGradient(x,pcy,2,x,pcy,pry);pg.addColorStop(0,'rgba(255,255,255,.96)');pg.addColorStop(.35,'rgba(200,255,228,.85)');pg.addColorStop(.75,'rgba('+rgb+',.5)');pg.addColorStop(1,'rgba('+rgb+',.15)');
  g.fillStyle=pg;g.fill();g.clip();
  g.lineCap='round';g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=Math.max(1,1.5*sw);
  for(j=0;j<5;j++){var a0=t*.04*(j%2?-1:1)+j*1.3,k2=.2+j*.17;g.beginPath();g.ellipse(x,pcy,prx*k2,pry*k2,a0,0,3.8);g.stroke()}
  if(!lite)for(j=0;j<10;j++){var q2=((t*.012)+j*.1)%1,an=j*2.4+q2*5,r2=(1-q2)*pry;g.fillStyle='rgba(255,255,255,'+(.8*Math.sin(q2*3.1416))+')';g.beginPath();g.arc(x+Math.cos(an)*r2*.52,pcy+Math.sin(an)*r2,Math.max(.8,(1+(j%3)*.5)*sw),0,6.2832);g.fill()}
  g.font='bold '+Math.round(26*sw)+'px KTH Serif,Songti SC,serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(10,110,80,'+(.5+.25*pu)+')';g.fillText('歸',x,pcy+1*sw);
  g.restore();
  /* 3) khung cổng vàng + 4 ngọc + đỉnh */
  g.save();g.lineWidth=Math.max(2,3.4*sw);g.strokeStyle=G.c;if(!lite){g.shadowColor=G.c;g.shadowBlur=8+6*pu}
  g.beginPath();g.ellipse(x,pcy,prx,pry,0,0,6.2832);g.stroke();g.shadowBlur=0;
  g.lineWidth=Math.max(1,1.2*sw);g.strokeStyle='rgba(235,255,247,.9)';g.beginPath();g.ellipse(x,pcy,prx*1.12,pry*1.06,0,0,6.2832);g.stroke();
  [[0,-pry*1.06],[0,pry*1.06],[-prx*1.12,0],[prx*1.12,0]].forEach(function(o,n){var jr=Math.max(2.2,3.6*sw);var jg=g.createRadialGradient(x+o[0],pcy+o[1],0,x+o[0],pcy+o[1],jr*2);jg.addColorStop(0,'#fff');jg.addColorStop(.4,n?'#8affc8':'#d8fff0');jg.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=jg;g.beginPath();g.arc(x+o[0],pcy+o[1],jr*2,0,6.2832);g.fill()});
  g.restore();
  /* 4) đốm sáng + cánh hoa bay lên quanh cổng */
  if(!lite){g.save();g.globalCompositeOperation='lighter';for(j=0;j<10;j++){var u=((t*.006+rnd(j+5))%1);g.fillStyle='rgba(210,255,235,'+(.9*Math.sin(u*3.1416))+')';g.beginPath();g.arc(x+(rnd(j+11)-.5)*rx*1.5+Math.sin(u*6+j)*4*sw,by-u*150*sw,Math.max(.8,1.8*sw*(1-u*.5)),0,6.2832);g.fill()}g.restore()}
  var fs=Math.max(11,Math.min(16,10*s)),ly=L.dy+LB*sw,cx=banner(x,ly,fs);
  g.save();g.fillStyle='#7af0b8';g.font='bold '+fs+'px sans-serif';g.textAlign='center';g.fillText('▼',cx,ly+fs*2.2+Math.sin(t*.12+i)*3);g.restore();
  return true};
})();
