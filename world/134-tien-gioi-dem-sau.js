/* ===== 🌌 TIÊN GIỚI — ĐÊM SÂU (world/134-tien-gioi-dem-sau.js · Fix427) =====
 * Nạp SAU world/133. Chỉ VẼ, không đụng logic / va chạm / vị trí.
 *   • TGD.grade : "chỉnh màu đêm" cho MỌI sprite tĩnh của bản đồ (đảo, cầu, nhà, cây, đá...) ngay lúc dựng sprite
 *                 (hook trong spr() của world/61). Tối + ngả xanh đêm, chân đảo tối hơn để có chiều sâu.
 *                 Nguồn sáng (đèn, nấm, tinh thể, cột đèn) chỉ tối nhẹ để vẫn nổi. Mây tối vừa phải.
 *                 → nền không còn chói, hiệu ứng nhân vật / kỹ năng nổi bật hơn.
 *   • under()   : vũng sáng ấm trên mặt đất quanh đèn + trước cửa nhà · sương mù trôi quanh viền đảo ·
 *                 trăng/sao soi mặt ao · sao băng thỉnh thoảng.
 *   • fx()      : đốm linh khí bay lên · vignette viền màn hình (tập trung mắt vào giữa).
 * Tự giảm theo QL của game: QL0 đầy đủ · QL1 bớt · QL2 chỉ còn chỉnh màu (không vẽ thêm).
 * Chỉnh độ tối: GR (đầu file). Gỡ module = xoá thẻ <script> trong index.html (map vẫn chạy, chỉ còn nền tối của sky). */
(function(){
'use strict';
if(!window.TGD)return;
var D=window.TGD,TAU=Math.PI*2;

/* ---- độ tối (0..1): càng lớn càng tối ---- */
var GR={base:.47,spot:.42,cloud:.36,light:.12,tint:'8,12,46'};
var LIGHT_RE=/^[dx](s?lamp|nam|cry|post)/;

D.grade=function(q,c,name){
 if(!name||!c.width)return;
 var cloud=name.charAt(0)==='c'&&name.charAt(1)==='l',
     light=LIGHT_RE.test(name),
     a=cloud?GR.cloud:light?GR.light:(name.charAt(0)==='s'||name.indexOf('xcp')===0)?GR.spot:GR.base,
     w=c.width,h=c.height,t=GR.tint;
 q.save();q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-atop';
 if(cloud||light)q.fillStyle='rgba('+t+','+a+')';
 else{ /* 1 lượt tô duy nhất: tối đều + ánh trăng nhẹ ở đỉnh + chân sprite tối hơn (Fix427b: gộp 2 lượt → 1 để dựng sprite nhanh hơn) */
  var g=q.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'rgba(24,36,96,'+a+')');g.addColorStop(.5,'rgba('+t+','+a+')');g.addColorStop(1,'rgba(0,0,26,'+Math.min(.85,a+.2)+')');
  q.fillStyle=g}
 q.fillRect(0,0,w,h);q.restore()};

/* ---- vũng sáng trên mặt đất ---- */
function pool(g,C,x,y,r,rgb,a){var p=C.S2(x,y);if(p[0]<-r*C.HW*2||p[0]>C.W+r*C.HW*2||p[1]<-r*C.HH*2||p[1]>C.H+r*C.HH*2)return;
 g.save();g.translate(p[0],p[1]);g.scale(1,.52);C.gl(0,0,r*C.HW*1.25,rgb,a);g.restore()}

/* ---- sương mù quanh viền đảo ---- */
function mist(g,C,t){if(C.ql>=2)return;var n=C.ql<1?6:3,HW=C.HW,ZU=C.ZU;
 C.ISL.forEach(function(I,ix){if(I.id==='war'&&C.ql>=1)return;
  var c=C.S2(I.cx,I.cy);if(c[0]<-I.rx*HW*3||c[0]>C.W+I.rx*HW*3||c[1]<-I.ry*HW*3||c[1]>C.H+I.ry*HW*3)return;
  for(var k=0;k<n;k++){var an=(-.5+k*(2.3/n)+ix*.37)+Math.sin(t*.004+k+ix)*.06,
    x=I.cx+Math.cos(an)*I.rx*.98,y=I.cy+Math.sin(an)*I.ry*.98,p=C.S2(x,y),
    dr=Math.sin(t*.006+k*1.7+ix)*HW*.5,w=(1.5+I.rx*.18)*HW;
   g.save();g.translate(p[0]+dr,p[1]+ZU*.22);g.scale(1,.27);
   C.gl(0,0,w,'150,172,255',.13+.05*Math.sin(t*.01+k*2+ix));g.restore()}})}

/* ---- trăng + sao phản chiếu mặt ao ---- */
function ponds(g,C,t){if(C.ql>=2||!D.ponds)return;var HW=C.HW,HH=C.HH;
 D.ponds.forEach(function(P,ix){var a=C.S2(P.x,P.y);if(a[0]<-160||a[0]>C.W+160||a[1]<-120||a[1]>C.H+120)return;
  g.save();g.translate(a[0],a[1]);g.transform(HW,HH,-HW,HH,0,0);
  g.fillStyle='rgba(190,215,255,'+(.10+.05*Math.sin(t*.03+ix))+')';g.beginPath();g.ellipse(-P.rx*.25,-P.ry*.2,P.rx*.34,P.ry*.2,0,0,TAU);g.fill();
  if(C.ql<1)for(var i=0;i<5;i++){var al=.3+.5*Math.sin(t*.06+i*2.3+ix*1.1);if(al<.25)continue;
   g.fillStyle='rgba(235,245,255,'+al+')';g.beginPath();g.arc(Math.sin(i*5.1+ix)*P.rx*.6,Math.cos(i*3.7+ix)*P.ry*.6,.035,0,TAU);g.fill()}
  g.restore()})}

/* ---- sao băng ---- */
function shoot(g,C,t){if(C.ql>=1)return;var K=Math.floor(t/520),ph=(t%520)/46;if(ph>1)return;
 var h=Math.sin(K*91.7)*.5+.5,h2=Math.sin(K*37.3)*.5+.5,x=C.W*(.15+.7*h)-ph*C.W*.16,y=C.H*(.04+.22*h2)+ph*C.H*.1,al=Math.sin(ph*Math.PI);
 g.save();g.globalCompositeOperation='lighter';var gr=g.createLinearGradient(x,y,x+C.W*.09,y-C.H*.055);
 gr.addColorStop(0,'rgba(255,255,255,'+al+')');gr.addColorStop(1,'rgba(160,190,255,0)');
 g.strokeStyle=gr;g.lineWidth=2*C.s;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(x+C.W*.09,y-C.H*.055);g.stroke();g.restore()}

var _un=D.under;
D.under=function(t,C){if(_un)_un(t,C);if(C.ql>=2)return;var g=C.g;
 g.save();g.globalCompositeOperation='lighter';
 /* vũng sáng đèn */
 (D.lights||[]).forEach(function(l,i){pool(g,C,l[0],l[1],2.3,'255,190,100',.2+.05*Math.sin(t*.08+i*1.9))});
 /* vũng sáng trước cửa nhà tiên gia */
 (D.houses||[]).forEach(function(h,i){if(h.hut)return;var fx=h.f==='y'?h.x:h.x+h.w/2+.7,fy=h.f==='y'?h.y+h.d/2+.7:h.y;
  pool(g,C,fx,fy,2,'255,176,96',.17+.04*Math.sin(t*.05+i))});
 ponds(g,C,t);
 g.restore();
 mist(g,C,t);shoot(g,C,t)};

/* ---- đốm linh khí + vignette ---- */
var VG=null,VK='';
function vig(C){var k=C.W+'|'+C.H;if(VG&&VK===k)return VG;VK=k;var w=Math.max(8,C.W>>2),h=Math.max(8,C.H>>2),o=C.mkc(w,h,1),q=o.q,
 r=q.createRadialGradient(w/2,h*.55,Math.min(w,h)*.3,w/2,h*.55,Math.max(w,h)*.78);
 r.addColorStop(0,'rgba(0,0,22,0)');r.addColorStop(.62,'rgba(0,0,22,.10)');r.addColorStop(1,'rgba(0,0,16,.5)');
 q.fillStyle=r;q.fillRect(0,0,w,h);return VG=o.c}

var _fx=D.fx;
D.fx=function(t,C){if(_fx)_fx(t,C);var g=C.g,i;
 if(C.ql<2){var n=C.ql<1?24:9,s=C.s;g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<n;i++){var sp=.28+(i%5)*.07,py=C.H-((t*sp+i*97)%(C.H*.95)),px=((i*151.3)%C.W)+Math.sin(t*.012+i*1.9)*18*s,
    al=Math.min(1,(C.H-py)/(C.H*.2))*Math.min(1,py/(C.H*.25))*.5;
   C.gl(px,py,(3+(i%3))*s,i%3?'150,200,255':'255,222,150',al)}
  g.restore()}
 if(C.ql<2)try{C.g.drawImage(vig(C),0,0,C.W,C.H)}catch(e){}};

D.demSau=1;
})();
