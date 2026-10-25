/* ===== 🏮 TIÊN GIỚI — ĐÊM SÂU 2 (world/139-tien-gioi-dem-sau-2.js · Fix431) =====
 * Nạp SAU world/134-tien-gioi-dem-sau.js. Chỉ VẼ, không đụng logic / va chạm / vị trí.
 *   • Pháp trận phát sáng dưới Tinh Hà Truyền Tống (vòng xoay + 8 quẻ + tia sao).
 *   • Đèn lồng đá dọc hai bên cầu, ánh sáng ấm hắt xuống mặt cầu.
 *   • Viền linh khí xanh quanh mép các đảo (nhịp thở nhẹ) → đảo nổi khỏi biển mây tối.
 *   • Sen phát sáng trong ao.
 *   • Đèn trời (Khổng Minh) bay lên chậm, lắc nhẹ.
 * Tự giảm theo QL: QL0 đầy đủ · QL1 bớt · QL2 tắt hết. Gỡ = xoá thẻ <script> trong index.html. */
(function(){
'use strict';
if(!window.TGD||!TGD.demSau)return;
var D=TGD,TAU=Math.PI*2,PX=8.4,PY=37.9;
var BR_POS=[];(function(){var i,y;for(y=18.2;y<=31.8;y+=2.7){BR_POS.push([12.55,y],[15.45,y])}
 for(i=9.4;i<=12;i+=2.6)BR_POS.push([i,22.1],[i,24.1]);for(i=16.2;i<=19.4;i+=2.6)BR_POS.push([i,22.1],[i,24.1])})();

function rune(g,C,t){var a=C.S2(PX,PY);if(a[0]<-260||a[0]>C.W+260||a[1]<-160||a[1]>C.H+160)return;
 g.save();g.translate(a[0],a[1]);g.transform(C.HW,C.HH,-C.HW,C.HH,0,0);g.globalCompositeOperation='lighter';g.lineCap='round';
 var p=.5+.5*Math.sin(t*.05),i;
 g.strokeStyle='rgba(170,140,255,'+(.30+.2*p)+')';g.lineWidth=.06;g.beginPath();g.arc(0,0,2.3,0,TAU);g.stroke();
 g.strokeStyle='rgba(120,200,255,'+(.25+.2*p)+')';g.lineWidth=.04;g.beginPath();g.arc(0,0,1.95,0,TAU);g.stroke();
 g.setLineDash([.32,.26]);g.lineDashOffset=-t*.015;g.strokeStyle='rgba(255,226,150,.4)';g.lineWidth=.05;g.beginPath();g.arc(0,0,1.55,0,TAU);g.stroke();g.setLineDash([]);
 if(C.ql<1){var rot=t*.006;g.strokeStyle='rgba(200,180,255,'+(.3+.2*p)+')';g.lineWidth=.04;
  for(i=0;i<8;i++){var an=rot+i*TAU/8,c=Math.cos(an),s=Math.sin(an);g.beginPath();g.moveTo(c*1.98,s*1.98);g.lineTo(c*2.3,s*2.3);g.stroke();
   g.fillStyle='rgba(255,236,170,'+(.5+.4*Math.sin(t*.07+i))+')';g.beginPath();g.arc(c*1.75,s*1.75,.05,0,TAU);g.fill()}
  g.strokeStyle='rgba(150,190,255,.22)';g.beginPath();for(i=0;i<5;i++){var b=-rot*1.5+i*TAU*2/5;i?g.lineTo(Math.cos(b)*1.5,Math.sin(b)*1.5):g.moveTo(Math.cos(b)*1.5,Math.sin(b)*1.5)}g.closePath();g.stroke()}
 g.restore();C.gl(a[0],a[1],C.HW*2.6,'150,130,255',.12+.08*p)}

function bridge(g,C,t){var s=C.s,HW=C.HW,ZU=C.ZU;
 BR_POS.forEach(function(b,i){var a=C.S2(b[0],b[1]);if(a[0]<-60||a[0]>C.W+60||a[1]<-60||a[1]>C.H+90)return;
  g.save();g.globalCompositeOperation='source-over';g.strokeStyle='rgba(30,26,50,.9)';g.lineWidth=2.4*s;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[0],a[1]-ZU*.62);g.stroke();
  g.fillStyle='#ffb868';g.beginPath();g.arc(a[0],a[1]-ZU*.72,2.8*s,0,TAU);g.fill();g.restore();
  g.save();g.globalCompositeOperation='lighter';C.gl(a[0],a[1]-ZU*.72,17*s,'255,180,96',.34+.08*Math.sin(t*.09+i*1.3));
  g.translate(a[0],a[1]);g.scale(1,.52);C.gl(0,0,HW*.95,'255,176,96',.16);g.restore()})}

function rim(g,C,t){if(C.ql>=1)return;var s=C.s,al=.16+.06*Math.sin(t*.025);
 C.ISL.forEach(function(I){if(!I.poly)return;var c=C.S2(I.cx,I.cy);if(c[0]<-I.rx*C.HW*3||c[0]>C.W+I.rx*C.HW*3||c[1]<-I.ry*C.HW*3||c[1]>C.H+I.ry*C.HW*3)return;
  g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.strokeStyle='rgba(120,230,255,'+al+')';g.lineWidth=3.2*s;g.beginPath();
  I.poly.forEach(function(p,j){var q=C.S2(p[0],p[1]);j?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.closePath();g.stroke();
  g.strokeStyle='rgba(220,250,255,'+al*.8+')';g.lineWidth=1*s;g.stroke();g.restore()})}

function lotus(g,C,t){if(!D.ponds)return;D.ponds.forEach(function(P,ix){var a=C.S2(P.x,P.y);if(a[0]<-120||a[0]>C.W+120||a[1]<-90||a[1]>C.H+90)return;
 for(var k=0;k<3;k++){var q=C.S2(P.x+Math.cos(k*2.1+ix)*P.rx*.5,P.y+Math.sin(k*2.1+ix)*P.ry*.5);C.gl(q[0],q[1]-3*C.s,13*C.s,k%2?'255,170,215':'190,235,255',.2+.12*Math.sin(t*.04+k*2+ix))}})}

var _un=D.under;
D.under=function(t,C){if(_un)_un(t,C);if(C.ql>=2)return;var g=C.g;try{rim(g,C,t);rune(g,C,t);bridge(g,C,t);g.save();g.globalCompositeOperation='lighter';lotus(g,C,t);g.restore()}catch(e){console.error('TGD3',e)}};

function lantern(g,C,x,y,sz,al){g.save();g.globalCompositeOperation='lighter';C.gl(x,y,sz*3.2,'255,170,80',.42*al);g.restore();
 g.save();g.globalAlpha=al;g.fillStyle='#ff9a3c';g.beginPath();g.moveTo(x-sz*.7,y-sz);g.lineTo(x+sz*.7,y-sz);g.lineTo(x+sz*.9,y+sz*.9);g.lineTo(x-sz*.9,y+sz*.9);g.closePath();g.fill();
 g.fillStyle='#ffe2a0';g.beginPath();g.ellipse(x,y+sz*.1,sz*.45,sz*.55,0,0,TAU);g.fill();g.fillStyle='#8a3a1c';g.fillRect(x-sz*.75,y-sz*1.1,sz*1.5,sz*.22);g.restore()}
var _fx=D.fx;
D.fx=function(t,C){if(_fx)_fx(t,C);if(C.ql>=2)return;var n=C.ql<1?9:4,i;
 try{for(i=0;i<n;i++){var sp=.22+(i%4)*.05,cyc=C.H*1.15,py=C.H+20*C.s-((t*sp+i*131)%cyc),x=((i*227.7)%C.W)+Math.sin(t*.01+i*2.4)*16*C.s,
   al=Math.min(1,(C.H-py)/(C.H*.12))*Math.min(1,Math.max(0,py+10)/(C.H*.25));if(al<=0)continue;lantern(C.g,C,x,py,(5+(i%3)*1.4)*C.s,al*.85)}}catch(e){console.error('TGD3',e)}};
})();
