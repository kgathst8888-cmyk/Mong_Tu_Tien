/* ===== 🌾 THÔN TÂN THỦ — LỚP CHI TIẾT MẶT ĐẤT & ĐỒ VẬT (world/134-thon-tan-thu-chi-tiet.js · Fix418) =====
 * Chỉ VẼ THÊM lên Thôn Tân Thủ (world/56). Không đổi logic, toạ độ nhà, cổng, va chạm, chạm-để-đi, camera làng rộng (61), VDY (92).
 * Trước: nền đất nâu phẳng, đơn điệu. Nay (lớp tĩnh, vẽ 1 lần vào canvas đệm rồi drawImage):
 *   · Đường lát đá phiến (đá lệch hàng, rêu ở khe, đá viền) chạy ngang làng, đúng hàng nhân vật đi; lối đá dẫn từ cửa mỗi nhà ra đường.
 *   · Bãi cỏ phía trước đường: cỏ nhiều tông, cỏ dại cao, hoa dại (cúc, anh thảo, tím, cam), cỏ ba lá, lá rụng, sỏi, vũng nước phản chiếu trời.
 *   · Vườn rau + bù nhìn giữa nhà 2–3, đống củi + chặt gỗ, ghế gỗ + thùng nước + gùi, bó rơm, biển chỉ đường.
 *   · Màn hình dọc (nhiều chỗ trống phía dưới): thêm ao sen có đá viền, sen, lau sậy.
 * Động (nhẹ, tắt khi window.QL>=2 hoặc TTD.fx=false): 4 con gà mổ thóc, bướm, cá chép + gợn nước trong ao, vài cánh hoa đào rơi, lấp lánh ở vũng nước.
 * Tắt/bật: window.TTD.on=false. Lỗi vẽ 3 lần → tự tắt (làng về hình của world/56). window.TTD.rebuild() dựng lại đệm.
 * Phụ thuộc: world/56 (window.TTT.drawn), xbg, bxx, bww, W,H,s,DPR,PORT,fr,g. Nạp SAU world/61 & world/65. */
(function(){
'use strict';
if(typeof xbg!=='function'||typeof g==='undefined'||typeof bxx!=='function'||!window.TTT)return;
var TAU=Math.PI*2,D={on:true,fx:true},_xbg=xbg,fails=0;window.TTD=D;
/* ---------- tiện ích ---------- */
function rng(a){a>>>=0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function lg(q,x0,y0,x1,y1,st){var o=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function rg(q,x,y,r0,r1,st){var o=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function mk(w,h,d){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));var q=c.getContext('2d');q.setTransform(d,0,0,d,0,0);return{c:c,q:q}}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function hx(r,g2,b){return'#'+('000000'+((Math.round(r)<<16)|(Math.round(g2)<<8)|Math.round(b)).toString(16)).slice(-6)}
function mix(a,b,t){var A=rgb(a),B=rgb(b);return hx(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function ell(q,x,y,rx,ry,c,rot){q.fillStyle=c;q.beginPath();q.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,TAU);q.fill()}
function poly(q,p,c){q.fillStyle=c;q.beginPath();q.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)q.lineTo(p[i],p[i+1]);q.closePath();q.fill()}
function line(q,x0,y0,x1,y1,c,w){q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x0,y0);q.lineTo(x1,y1);q.stroke()}
function noise(seed){var R=rng(seed),v=[],i;for(i=0;i<256;i++)v.push(R());return function(x){var i0=Math.floor(x),f=x-i0,t=f*f*(3-2*f),a=v[i0&255],b=v[(i0+1)&255];return a+(b-a)*t}}
function fbm(n,x,o){var s2=0,a=.5,f=1,tt=0,i;for(i=0;i<o;i++){s2+=a*n(x*f+i*13.7);tt+=a;a*=.5;f*=2}return s2/tt}
function shadow(q,x,y,rx,ry,a){q.save();q.translate(x,y);q.scale(1,ry/rx);q.fillStyle=rg(q,0,0,0,rx,[0,'rgba(18,22,12,'+a+')',.6,'rgba(18,22,12,'+a*.5+')',1,'rgba(18,22,12,0)']);q.beginPath();q.arc(0,0,rx,0,TAU);q.fill();q.restore()}
function lite(){return (window.QL|0)>=2}

/* ---------- cỏ, hoa, lá ---------- */
var GR=['#3f6a2c','#4d7a35','#5b8a3c','#6f9a45','#86ac55','#a2bf6a'];
function blades(q,x,y,sc,n,cols,R,tall){var i,a,l,bd;q.lineCap='round';
  for(i=0;i<n;i++){a=-Math.PI/2+(R()-.5)*1.6;l=(7+R()*(tall||12))*sc;bd=(R()-.5)*l*.5;
    q.strokeStyle=cols[(R()*cols.length)|0];q.lineWidth=Math.max(.6,(.9+R()*.7)*sc*.55);
    q.beginPath();q.moveTo(x+(R()-.5)*5*sc,y);q.quadraticCurveTo(x+Math.cos(a)*l*.5+bd*.5,y+Math.sin(a)*l*.55,x+Math.cos(a)*l+bd,y+Math.sin(a)*l);q.stroke()}}
function flower(q,x,y,sc,col,cen,R){var h=(5+R()*7)*sc,tx=x+(R()-.5)*3*sc,ty=y-h,i,r=(1.3+R()*1)*sc;
  q.strokeStyle='#4d7a36';q.lineWidth=Math.max(.6,.7*sc);q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+(R()-.5)*2*sc,y-h*.5,tx,ty);q.stroke();
  ell(q,x+sc*1.6,y-h*.4,1.8*sc,.8*sc,'#5e8f3d',.5);
  for(i=0;i<5;i++){var a=i/5*TAU+R();ell(q,tx+Math.cos(a)*r*.85,ty+Math.sin(a)*r*.85,r*.75,r*.55,col,a)}
  ell(q,tx,ty,r*.55,r*.55,cen)}
var FL=[['#fbf7ea','#f2c231'],['#f4a7bd','#fff0a0'],['#a98fe0','#fbeaa0'],['#f09a42','#fff2b0'],['#e65a4a','#3a2a1a'],['#8fbdf2','#fff2b0'],['#fde36a','#c8841c']];
function patch(q,x,y,sc,R,k){var pal=FL[k!=null?k:(R()*FL.length)|0],n=7+(R()*9|0),i,rad=(11+R()*12)*sc;
  blades(q,x,y,sc*.9,6,GR,R,7);
  for(i=0;i<n;i++){var a=R()*TAU,r=Math.sqrt(R())*rad;flower(q,x+Math.cos(a)*r,y+Math.sin(a)*r*.35,sc*.9,R()<.18?FL[(R()*FL.length)|0][0]:pal[0],pal[1],R)}}
function leaf(q,x,y,sc,R){var c=['#c7792b','#d9a13a','#a35a24','#b88a3a','#8c6a2c','#d98a3c'][(R()*6)|0];ell(q,x,y,(2+R()*1.6)*sc,(1+R()*.7)*sc,c,R()*3)}
function rockS(q,x,y,w,h,R,c){var p=[],i,a,n=8;shadow(q,x-w*.2,y+h*.15,w*1.1,h*.45,.3);
  for(i=0;i<n;i++){a=i/n*TAU;p.push(x+Math.cos(a)*w*(.8+R()*.25),y-h*.5+Math.sin(a)*h*(.5+R()*.2)*(Math.sin(a)>0?.6:1))}
  c=c||'#9a9382';poly(q,p,c);poly(q,[p[0],p[1],p[2],p[3],p[4],p[5],x,y-h*.5],'rgba(255,244,214,.22)');
  ell(q,x+w*.15,y-h*.62,w*.38,h*.18,'rgba(255,248,226,.22)')}

/* ---------- đồ vật ---------- */
function scarecrow(q,x,y,u,R){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-6,1,16,3,.3);
  line(q,0,0,0,-34,'#5a4331',2.2);line(q,-15,-24,15,-24,'#5a4331',2);
  poly(q,[-9,-26,9,-26,7,-12,-7,-12],'#8e5d3a');poly(q,[-9,-26,-3,-26,-4,-12,-7,-12],'rgba(255,230,190,.16)');
  q.fillStyle='#c9ab5e';[[-15,-24],[15,-24],[-5,-12],[5,-12]].forEach(function(p){for(var k=0;k<4;k++)line(q,p[0],p[1],p[0]+(k-1.5)*2.2,p[1]+5+R()*2,'#c9ab5e',.9)});
  ell(q,0,-33,5.4,5.8,'#d7bf84');line(q,-2,-33,-1,-33,'#3a2a1a',1);line(q,2,-33,3,-33,'#3a2a1a',1);line(q,-2,-30.5,2,-30.5,'#3a2a1a',.8);
  ell(q,0,-37.5,10,2.2,'#a8823c');poly(q,[-5.5,-37.5,0,-47,5.5,-37.5],'#b9923f');poly(q,[0,-47,5.5,-37.5,1,-37.5],'rgba(0,0,0,.14)');line(q,-5,-39.5,5,-39.5,'#7a3b2a',1.2);
  poly(q,[-3,-17,-1,-17,-2,-12],'#6a8aa6');q.restore()}
function bedRow(q,x0,x1,y,u,R,kind){var w=x1-x0,i,n=Math.round(w/(8*u)),px;
  poly(q,[x0,y,x1,y,x1+2*u,y+7*u,x0-2*u,y+7*u],lg(q,0,y,0,y+7*u,[0,'#6a4a30',1,'#4e3522']));
  poly(q,[x0,y,x1,y,x1+.4*u,y+1.6*u,x0-.4*u,y+1.6*u],'rgba(255,226,180,.25)');
  q.fillStyle='rgba(30,18,10,.18)';for(i=0;i<9;i++)q.fillRect(x0+R()*w,y+2*u+R()*4*u,2*u,.8*u);
  for(i=0;i<n;i++){px=x0+(i+.5)*w/n+(R()-.5)*u;
    if(kind==0){var cc=R()<.5?'#6fa05a':'#7db06a';ell(q,px,y+1.5*u,4.2*u,3.4*u,mix(cc,'#000000',.25));ell(q,px,y+1*u,3.6*u,3*u,cc);ell(q,px-.6*u,y+.2*u,2.4*u,1.8*u,mix(cc,'#ffffff',.25));q.strokeStyle='rgba(235,245,210,.55)';q.lineWidth=.6*u;q.beginPath();q.arc(px,y+1.2*u,1.6*u,3.4,5.6);q.stroke()}
    else if(kind==1){blades(q,px,y+2*u,u*.8,7,['#4d8a3a','#5fa046','#74b455'],R,5)}
    else{line(q,px,y+3*u,px,y-6*u,'#8a6a40',.9*u);blades(q,px,y-2*u,u*.7,5,['#4d8a3a','#6aa84a'],R,4);ell(q,px+1*u,y-1*u,1.1*u,1.1*u,'#d9452f');ell(q,px-1*u,y-3.5*u,1*u,1*u,'#e2563a')}}}
function garden(q,cx,y,u,R){var hw=30*u;
  q.fillStyle='rgba(40,28,16,.18)';q.beginPath();q.ellipse(cx,y+14*u,hw+8*u,15*u,0,0,TAU);q.fill();
  bedRow(q,cx-hw,cx+hw,y,u,R,0);bedRow(q,cx-hw-1*u,cx+hw+1*u,y+10*u,u,R,1);bedRow(q,cx-hw-2*u,cx+hw+2*u,y+20*u,u,R,2);
  var p=[cx-hw-8*u,y-2*u,cx-hw-8*u,y+26*u,cx+hw+8*u,y+26*u,cx+hw+8*u,y-2*u],i;
  for(i=0;i<p.length;i+=2){line(q,p[i],p[i+1],p[i],p[i+1]-9*u,'#6a4d36',1.8*u);ell(q,p[i],p[i+1]-9*u,1*u,.8*u,'#8a6a4c')}
  line(q,p[0],p[1]-6*u,p[6],p[7]-6*u,'#7a5a3e',1*u);line(q,p[2],p[3]-6*u,p[4],p[5]-6*u,'#7a5a3e',1*u)}
function woodpile(q,x,y,u,R){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-4,1,30,4,.3);var r,c;
  for(r=0;r<4;r++)for(c=0;c<6-r;c++){var lx=-18+c*7.4+r*3.7,ly=-3.6-r*6.3;ell(q,lx,ly,3.7,3.7,'#6a4a2e');ell(q,lx,ly,3,3,'#c59a64');ell(q,lx,ly,1.8,1.8,'#d9b27c');q.strokeStyle='rgba(110,70,34,.5)';q.lineWidth=.5;q.beginPath();q.arc(lx,ly,2.2,0,TAU);q.stroke()}
  ell(q,26,-5,6,5,'#6a4a2e');ell(q,26,-8,6,3,'#c59a64');line(q,22,-11,34,-24,'#6a4a2e',1.8);poly(q,[32,-27,38,-23,34,-21,31,-23],'#9aa2a8');q.restore()}
function bench(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-3,1,22,3.4,.3);
  line(q,-14,-2,-14,-9,'#5a4331',2);line(q,14,-2,14,-9,'#5a4331',2);q.fillStyle=lg(q,0,-12,0,-8,[0,'#a98458',1,'#7a5a3a']);q.fillRect(-18,-12,36,4);line(q,-18,-12,18,-12,'rgba(255,236,200,.4)',.8);
  line(q,-14,-9,-14,-18,'#5a4331',1.8);line(q,14,-9,14,-18,'#5a4331',1.8);q.fillStyle='#8e6a44';q.fillRect(-16,-19,32,3);q.restore()}
function bucket(q,x,y,u,wat){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-2,1,8,2,.3);q.fillStyle=lg(q,-5,0,5,0,[0,'#6a4a30',.5,'#8a6342',1,'#a07a52']);q.beginPath();q.moveTo(-4.4,0);q.lineTo(-5.4,-9);q.lineTo(5.4,-9);q.lineTo(4.4,0);q.closePath();q.fill();
  line(q,-5,-5,5,-5,'#4a3a2a',.8);line(q,-4.8,-2.4,4.8,-2.4,'#4a3a2a',.8);if(wat)ell(q,0,-9,5.4,1.4,'#6aa4c0');q.strokeStyle='#3a2c20';q.lineWidth=.8;q.beginPath();q.arc(0,-9,5.2,3.4,6.0);q.stroke();q.restore()}
function basket(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-2,1,9,2,.3);q.fillStyle=lg(q,-6,0,6,0,[0,'#a88a50',.5,'#c8a868',1,'#d8bc7c']);q.beginPath();q.moveTo(-5,0);q.lineTo(-7,-13);q.lineTo(7,-13);q.lineTo(5,0);q.closePath();q.fill();
  q.strokeStyle='rgba(90,60,24,.45)';q.lineWidth=.7;for(var k=0;k<5;k++){q.beginPath();q.moveTo(-6.5+k*0,-2.5-k*2.4);q.lineTo(6.5,-2.5-k*2.4);q.stroke()}
  [['#d9452f',-2.5],['#e08a2c',1],['#7ab04a',3.6]].forEach(function(f){ell(q,f[1],-14.5,2.4,2.2,f[0])});q.restore()}
function hay(q,x,y,u,R){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-4,1,22,3.5,.3);
  q.fillStyle=lg(q,-14,0,14,0,[0,'#b89a48',.55,'#dcc070',1,'#ecd88c']);q.beginPath();q.moveTo(-14,0);q.quadraticCurveTo(-16,-14,-8,-18);q.quadraticCurveTo(0,-23,8,-18);q.quadraticCurveTo(16,-14,14,0);q.closePath();q.fill();
  for(var i=0;i<26;i++){var a=-14+R()*28,b=-R()*18;line(q,a,b,a+(R()-.5)*5,b+3+R()*3,R()<.5?'rgba(120,88,30,.4)':'rgba(255,240,170,.4)',.7)}
  line(q,-14,-7,14,-7,'#8a6a2a',1);line(q,-14,-13,14,-13,'#8a6a2a',.9);q.restore()}
function signpost(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-3,1,10,2.4,.3);
  line(q,0,0,0,-44,'#5a4331',2.6);line(q,.9,0,.9,-44,'rgba(255,230,190,.2)',.8);
  [[-34,1],[-25,-1]].forEach(function(a){var yy=a[0],d=a[1];poly(q,d>0?[-2,yy-5,13,yy-5,18,yy,13,yy+5,-2,yy+5]:[2,yy-5,-13,yy-5,-18,yy,-13,yy+5,2,yy+5],lg(q,0,yy-5,0,yy+5,[0,'#b08a5a',1,'#8e6a42']));
    line(q,d>0?-1:1,yy-4.4,d>0?13:-13,yy-4.4,'rgba(255,236,200,.4)',.7);line(q,d>0?1:-1,yy,d>0?10:-10,yy,'rgba(60,36,20,.5)',1.2)});
  ell(q,0,-44.4,2.6,1.4,'#8a6a42');q.restore()}
function lampPost(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-3,1,10,2.4,.3);
  line(q,0,0,0,-52,'#4e3a2a',2.8);line(q,0,-50,13,-50,'#4e3a2a',2);line(q,13,-50,13,-46,'#2a1c12',.8);
  poly(q,[10.5,-46,15.5,-46,16.4,-40,9.6,-40],'#c8432e');poly(q,[11,-46,13,-46,13.4,-40,10.4,-40],'rgba(255,214,120,.55)');ell(q,13,-46,3,1,'#2a1c12');ell(q,13,-39.6,2.6,.9,'#2a1c12');
  poly(q,[-3,-3,3,-3,2,-12,-2,-12],'#7a7a6e');q.restore()}
function stepStones(q,x,y0,y1,u,R,base){var y=y0,i=0,w;
  while(y<y1){w=(15+R()*7-i*.6)*u;var xx=x+(R()-.5)*3*u,h=(5+R()*1.6)*u;
    ell(q,xx+1*u,y+h*.7,w*.52,h*.5,'rgba(30,22,12,.3)');ell(q,xx,y+h*.45,w*.52,h*.5,mix(base,'#000000',.35));
    ell(q,xx,y+h*.3,w*.5,h*.46,mix(base,R()<.5?'#ffffff':'#8a8470',.15+R()*.15));ell(q,xx-w*.1,y+h*.15,w*.3,h*.16,'rgba(255,248,226,.28)');y+=h+1.6*u;i++}}

/* ---------- ao sen (màn hình dọc, còn chỗ trống phía dưới) ---------- */
function pond(q,x,y,rx,ry,u,R){var i,a;
  shadow(q,x-6*u,y+ry*.75,rx*1.15,ry*.7,.3);
  ell(q,x,y,rx+7*u,ry+5.5*u,'#6a6552');ell(q,x,y+1*u,rx+5*u,ry+4*u,'#8e8774');
  for(i=0;i<34;i++){a=i/34*TAU;var px=x+Math.cos(a)*(rx+4*u),py=y+Math.sin(a)*(ry+3.2*u),w=(6+R()*4)*u;
    ell(q,px,py+1*u,w,w*.52,mix('#8a8470',R()<.5?'#ffffff':'#000000',.08+R()*.14));ell(q,px-w*.15,py-.2*u,w*.6,w*.22,'rgba(255,248,226,.2)')}
  q.save();q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.clip();
  q.fillStyle=lg(q,0,y-ry,0,y+ry,[0,'#9ec6d6',.45,'#5f98ac',1,'#2f6478']);q.fillRect(x-rx,y-ry,rx*2,ry*2);
  ell(q,x+rx*.2,y-ry*.35,rx*.5,ry*.16,'rgba(255,250,232,.32)');ell(q,x-rx*.4,y-ry*.15,rx*.3,ry*.1,'rgba(255,255,255,.18)');
  q.strokeStyle='rgba(255,255,255,.14)';q.lineWidth=.8*u;for(i=0;i<7;i++){var ly=y-ry*.7+i*ry*.22;q.beginPath();q.moveTo(x-rx*.8*(1-Math.abs(i-3)*.1),ly);q.lineTo(x+rx*.8*(1-Math.abs(i-3)*.1),ly+(R()-.5)*u);q.stroke()}
  ell(q,x-rx*.25,y+ry*.2,rx*.55,ry*.3,'rgba(20,50,40,.12)');
  for(i=0;i<9;i++){var lx=x+(R()-.5)*rx*1.5,ly2=y+(R()-.5)*ry*1.3,lr=(5+R()*4)*u;ell(q,lx+1*u,ly2+1*u,lr,lr*.5,'rgba(10,40,30,.35)');ell(q,lx,ly2,lr,lr*.5,i%2?'#5b9a46':'#6faa52');
    q.fillStyle='#9ec6d6';q.beginPath();q.moveTo(lx,ly2);q.lineTo(lx+lr*.9,ly2-lr*.15);q.lineTo(lx+lr*.9,ly2+lr*.12);q.closePath();q.fill();line(q,lx-lr*.6,ly2,lx+lr*.5,ly2,'rgba(220,240,180,.4)',.5*u)}
  q.restore();
  [[-.5,-.1],[.35,.12],[.05,-.35]].forEach(function(f,k){var fx=x+f[0]*rx,fy=y+f[1]*ry,r=(3.4-k*.4)*u,j;for(j=0;j<8;j++){var aa=j/8*TAU;ell(q,fx+Math.cos(aa)*r*.8,fy-2*u+Math.sin(aa)*r*.4,r*.62,r*.34,j%2?'#f6bccb':'#fbd6e0',aa)}ell(q,fx,fy-2*u,r*.5,r*.3,'#f2c231')});
  for(i=0;i<9;i++){var ax=x-rx*.95+i*rx*.12,ay=y+ry*.6+(R()-.5)*3*u;blades(q,ax,ay+ry*.4,u*1.1,5,['#587f3a','#6a9448','#7fa857'],R,16)}
  rockS(q,x+rx*.9,y+ry*.5,7*u,5*u,R);rockS(q,x-rx*.85,y+ry*.62,6*u,4.4*u,R,'#8f8878')}

/* ---------- vẽ nền tĩnh ---------- */
var BC=null,BK='',MT=null;
function paint(q,W,H,gy,u,port,top){
  var R=rng(4242),n1=noise(31),n2=noise(47),i,k,x,y,room=(H-gy)/u,CY=gy+56*u;
  var yt=function(x){return gy+(34+(fbm(n1,x/(150*u),3)-.5)*18)*u};
  var yb=function(x){return Math.min(H+4,gy+(88+(fbm(n2,x/(120*u),3)-.5)*22)*u)};
  q.save();q.translate(0,-top);
  /* 1) dải đất sát nhà (trên đường): đất nén sáng, có vết bánh xe + sỏi + cỏ lưa thưa */
  q.fillStyle=lg(q,0,gy,0,gy+40*u,[0,'rgba(200,180,138,.0)',.5,'rgba(204,184,142,.34)',1,'rgba(170,150,112,.14)']);q.fillRect(0,gy,W,44*u);
  for(i=0;i<2;i++){var ry0=gy+(20+i*10)*u;q.strokeStyle=i?'rgba(60,44,26,.1)':'rgba(255,240,206,.12)';q.lineWidth=2.4*u;q.beginPath();for(x=0;x<=W;x+=14)q.lineTo(x,ry0+Math.sin(x/(90*u)+i*2)*1.6*u);q.stroke()}
  /* 2) bãi cỏ phía trước đường */
  q.beginPath();q.moveTo(0,H+6);for(x=0;x<=W+6;x+=6)q.lineTo(x,yb(x)-2*u);q.lineTo(W,H+6);q.closePath();
  q.fillStyle=lg(q,0,gy+80*u,0,H,[0,'#7d9f52',.3,'#6c8e46',1,'#4d6e36']);q.fill();
  q.save();q.clip();
  for(i=0;i<Math.round(W/u*room/60);i++){y=gy+80*u+R()*Math.max(1,H-gy-80*u);ell(q,R()*W,y,(14+R()*40)*u,(2.4+R()*5)*u,R()<.5?'rgba(205,224,140,.1)':'rgba(30,60,28,.13)')}
  for(i=0;i<Math.round(W/u*room/22);i++){y=gy+86*u+R()*Math.max(1,H-gy-86*u);var dd=clamp((y-gy)/(H-gy),0,1);blades(q,R()*W,y,(.8+dd*1.7)*u,5,GR,R,9)}
  q.restore();
  /* 3) đường đá phiến */
  q.save();q.beginPath();q.moveTo(0,yt(0));for(x=6;x<=W+6;x+=6)q.lineTo(x,yt(x));for(x=W+6;x>=0;x-=6)q.lineTo(x,yb(x));q.closePath();
  q.fillStyle='#6a604c';q.fill();q.clip();
  var rows=[],yy=gy+26*u,rh,dep;
  while(yy<gy+100*u){dep=clamp((yy-gy)/(H-gy),0,1);rh=(8.5+dep*5)*u;rows.push([yy,rh,dep]);yy+=rh}
  var SC=['#c3b8a0','#b5aa92','#cbc0a8','#a99f88','#b9ae96','#c8bda4','#a49a82'];
  rows.forEach(function(r,ri){var xs=-R()*20*u,yr=r[0],h=r[1],w;
    while(xs<W){w=(15+R()*20)*u*(1+r[2]*.45);var j=function(){return(R()-.5)*h*.2},c=SC[(R()*SC.length)|0],a=xs+.9*u,b=xs+w-.9*u,t0=yr+.8*u+(R()-.5)*h*.22,b0=yr+h-.9*u+(R()-.5)*h*.22;
      var P=[a+j(),t0+j(),b+j(),t0+j(),b+j(),b0+j(),a+j(),b0+j()];
      q.fillStyle=lg(q,0,t0,0,b0,[0,mix(c,'#fff4d8',.18),.55,c,1,mix(c,'#3a3020',.22)]);q.beginPath();q.moveTo(P[0]+h*.3,P[1]);q.lineTo(P[2]-h*.3,P[3]);q.quadraticCurveTo(P[2]+.5*u,P[3],P[4],P[5]-h*.3);q.lineTo(P[4],P[5]-h*.3);q.quadraticCurveTo(P[4],P[5],P[4]-h*.3,P[5]);q.lineTo(P[6]+h*.3,P[7]);q.quadraticCurveTo(P[6],P[7],P[6],P[7]-h*.3);q.lineTo(P[0],P[1]+h*.3);q.quadraticCurveTo(P[0],P[1],P[0]+h*.3,P[1]);q.fill();
      line(q,P[0]+h*.35,P[1]+.4*u,P[2]-h*.35,P[3]+.4*u,'rgba(255,246,220,.4)',.9*u);line(q,P[6]+h*.35,P[7]-.2*u,P[4]-h*.35,P[5]-.2*u,'rgba(46,36,22,.3)',.9*u);
      if(R()<.5){ell(q,a+R()*(b-a),t0+R()*(b0-t0),(1+R()*3)*u,(.6+R()*1.2)*u,R()<.5?'rgba(255,246,220,.12)':'rgba(60,46,28,.12)',R()*3)}
      if(R()<.2){line(q,a+R()*(b-a)*.5,t0+h*.3,a+(b-a)*(.4+R()*.5),b0-h*.2,'rgba(50,40,26,.3)',.5*u)}
      if(R()<.16){ell(q,a+R()*(b-a),yr+h-.5*u,(2+R()*4)*u,(.8+R()*.9)*u,'rgba(84,124,52,.5)')}
      if(R()<.07){ell(q,a+R()*(b-a),t0+R()*(b0-t0),(2.4+R()*2)*u,(1.2+R())*u,'rgba(96,136,60,.42)')}
      xs+=w}});
  var tn=noise(63);for(x=0;x<W;x+=24*u){var tv=fbm(tn,x/(260*u),3);q.fillStyle=tv>.5?'rgba(255,236,196,'+((tv-.5)*.5).toFixed(3)+')':'rgba(70,84,60,'+((.5-tv)*.45).toFixed(3)+')';q.fillRect(x,gy+28*u,24*u+1,76*u)}
  for(i=0;i<Math.round(W/u/38);i++){x=R()*W;y=CY-24*u+R()*48*u;ell(q,x,y,(10+R()*22)*u,(3+R()*4)*u,R()<.6?'rgba(150,124,84,.42)':'rgba(96,130,62,.38)',(R()-.5)*.2);if(R()<.6)blades(q,x+(R()-.5)*10*u,y,u*.9,4,GR,R,7)}
  q.fillStyle=lg(q,0,gy+30*u,0,gy+46*u,[0,'rgba(34,24,12,.3)',1,'rgba(34,24,12,0)']);q.fillRect(0,gy+30*u,W,16*u);
  for(i=0;i<Math.round(W/u/70);i++){x=R()*W;y=CY-18*u+R()*36*u;ell(q,x,y,(18+R()*26)*u,(3+R()*3)*u,'rgba(255,250,226,.1)',-.04)}
  q.restore();
  /* đá viền + cỏ mép đường */
  for(k=0;k<2;k++){for(x=0;x<W;){var cw=(9+R()*9)*u,ey=k?yb(x)-1*u:yt(x)+1*u;
      ell(q,x+cw/2,ey+1.2*u,cw*.55,3.6*u,'rgba(30,24,14,.32)');ell(q,x+cw/2,ey,cw*.5,3.4*u,mix('#a69e8a',R()<.5?'#ffffff':'#000000',.08+R()*.1));ell(q,x+cw*.4,ey-1.1*u,cw*.32,1.2*u,'rgba(255,248,226,.3)');
      if(R()<.5)blades(q,x+R()*cw,ey+(k?1.4:-.6)*u,u*.9,3,GR,R,7);x+=cw*.9}}
  /* lối đá từ cửa mỗi nhà ra đường */
  for(i=0;i<5;i++){x=bxx(i)*s;stepStones(q,x,gy+16*u,yt(x)+2*u,u,R,'#b3a98f')}
  /* 4) hoa dại, cỏ cao, lá rụng, sỏi, vũng nước */
  var nf=Math.round(W/u/26);
  for(i=0;i<nf;i++){x=R()*W;y=yb(x)+(3+Math.pow(R(),1.2)*Math.max(2,room-90))*u;if(y>H-1)continue;patch(q,x,y,(.8+clamp((y-gy)/(H-gy),0,1)*1.5)*u,R)}
  for(i=0;i<Math.round(W/u/9);i++){x=R()*W;y=yt(x)-(1+R()*3)*u;blades(q,x,y+gy*0,u*.8,3,GR,R,6)}
  for(i=0;i<Math.round(W/u/14);i++){x=R()*W;y=gy+(8+R()*22)*u;if(R()<.5)patch(q,x,y,u*.7,R,R()<.5?0:1);else blades(q,x,y,u*.8,4,GR,R,6)}
  for(i=0;i<Math.round(W/u/7);i++){x=R()*W;y=gy+(8+R()*88)*u;var dd2=clamp((y-gy)/(H-gy),0,1);if(R()<.7)leaf(q,x,y,(.8+dd2)*u,R);else ell(q,x,y,(1+R()*1.6)*u,(.6+R()*.8)*u,['#a09a88','#8a8472','#b4ad9a'][(R()*3)|0])}
  for(i=0;i<Math.round(W/u/70);i++){x=R()*W;y=yb(x)+(6+R()*Math.max(1,room-96))*u;if(y>H-3)continue;ell(q,x,y,(5+R()*5)*u,(1.3+R()*1.4)*u,'rgba(30,60,34,.16)');var ccx=x;for(k=0;k<9;k++)ell(q,ccx+(R()-.5)*16*u,y+(R()-.5)*3*u,(1.5+R()*1.2)*u,(1.2+R()*.8)*u,R()<.5?'#6aa04c':'#5a8e40')}
  [[.21,.27],[.57,.7],[.86,.4]].forEach(function(p,j){x=W*p[0];y=gy+(40+p[1]*45)*u;if(y>H-8*u)return;var rx=(11+j*3)*u,ry=(2.6+j*.5)*u;
    ell(q,x,y,rx+1.4*u,ry+1*u,'rgba(60,50,34,.45)');ell(q,x,y,rx,ry,lg(q,0,y-ry,0,y+ry,[0,'rgba(170,205,222,.9)',1,'rgba(120,160,182,.9)']));ell(q,x+rx*.2,y-ry*.35,rx*.5,ry*.22,'rgba(255,252,238,.5)');ell(q,x-rx*.35,y+ry*.1,rx*.3,ry*.2,'rgba(60,90,70,.25)')});
  /* 5) đồ vật */
  var f=function(a){return W*a};
  MT={pond:null,hens:[],cx:f(.41)};
  garden(q,f(.41),gy+14*u,u,R);scarecrow(q,f(.41)+8*u,gy+17*u,u*1.05,R);
  woodpile(q,f(.2)-4*u,gy+26*u,u*.95,R);hay(q,f(.262),gy+25*u,u*.9,R);hay(q,f(.268)+22*u,gy+27*u,u*.7,R);
  bench(q,f(.565),gy+26*u,u*.95);bucket(q,f(.565)+26*u,gy+27*u,u*.9,1);basket(q,f(.565)-24*u,gy+27*u,u*.9);bucket(q,f(.618),gy+27*u,u*.85,0);
  signpost(q,f(.06)+24*u,gy+30*u,u);lampPost(q,f(.755),gy+30*u,u);lampPost(q,f(.945),gy+30*u,u);
  rockS(q,f(.125),gy+32*u,9*u,6*u,R);rockS(q,f(.83),gy+33*u,8*u,5.4*u,R);
  if(room>=165){var px=f(port?.5:.62),py=gy+(100+(room-100)*.44)*u,prx=clamp(W*.07,48*u,80*u),pry=prx*.27;pond(q,px,py,prx,pry,u,R);MT.pond={x:px,y:py,rx:prx,ry:pry}}
  for(i=0;i<Math.round(W/u/55);i++){x=R()*W;y=H-(2+R()*Math.min(30,room*.2))*u;var d3=clamp((y-gy)/(H-gy),0,1);blades(q,x,y,(1+d3*1.1)*u,6,['#3c6a2a','#4b7a34','#5a8a3e','#6f9a48'],R,clamp((room-92)*.6,3,16))}
  for(i=0;i<Math.round(W/u/110);i++){x=R()*W;y=H-(4+R()*Math.min(40,Math.max(3,(room-92)*.5)))*u;patch(q,x,y,(1.1+clamp((y-gy)/(H-gy),0,1)*.6)*u,R)}
  var vg=lg(q,0,H-70*u,0,H,[0,'rgba(24,36,16,0)',1,'rgba(24,36,16,.3)']);q.fillStyle=vg;q.fillRect(0,H-70*u,W,72*u);
  q.restore();return MT}
function ensure(gy){var u=s,top=gy-4*u,k=[W,H,Math.round(gy),u.toFixed(3),DPR,PORT].join('|');if(BC&&k===BK)return top;BK=k;
  var o=mk(W,Math.max(8,H-top),DPR);MT=paint(o.q,W,H,gy,u,PORT,top);BC=o.c;D.top=top;return top}

/* ---------- lớp động (nhẹ) ---------- */
function hen(x,y,sc,dir,pk,col,rooster){g.save();g.translate(x,y);g.scale(dir*sc,sc);
  ell(g,-1,1,8,1.8,'rgba(20,16,8,.26)');line(g,-1,-2,-1,.5,'#d9a23a',.9);line(g,2,-2,2,.5,'#d9a23a',.9);
  g.fillStyle=col[0];g.beginPath();g.moveTo(-7,-4);g.quadraticCurveTo(-10,rooster?-14:-10,-6,rooster?-17:-11);g.quadraticCurveTo(-4,-8,-3,-4);g.fill();
  ell(g,0,-5.4,6.2,4.4,col[0],-.1);ell(g,.6,-6.2,4.2,2.6,col[1],-.2);ell(g,-4.2,-6.4,2.6,2,col[1],.5);
  var hy=-10.4+pk*7.2,hxp=5.2+pk*2.4;line(g,3,-8,hxp-1,hy+1,col[0],2);ell(g,hxp,hy,2.2,2.2,col[0]);poly(g,[hxp+1.6,hy-.4,hxp+4,hy+.6+pk*.8,hxp+1.6,hy+1.2],'#e6a431');ell(g,hxp-.2,hy-2.2,1.2,1,'#d63a2c');if(rooster)ell(g,hxp+.8,hy-2.8,1.6,1.2,'#d63a2c');ell(g,hxp+.4,hy-.5,.45,.45,'#1a1208');g.restore()}
function fly(x,y,sc,ph,t,c){var w=Math.abs(Math.sin(t*.4+ph));g.save();g.translate(x,y);g.scale(sc,sc);g.fillStyle=c[0];g.beginPath();g.ellipse(-1.6,-1,2.8*(.25+w*.75),2.2,-.5,0,TAU);g.fill();g.beginPath();g.ellipse(1.6,-1,2.8*(.25+w*.75),2.2,.5,0,TAU);g.fill();g.fillStyle=c[1];g.beginPath();g.ellipse(-1.4,1,1.8*(.25+w*.75),1.4,-.3,0,TAU);g.fill();g.beginPath();g.ellipse(1.4,1,1.8*(.25+w*.75),1.4,.3,0,TAU);g.fill();line(g,0,-2.2,0,2.4,'#3a2a1a',.9);g.restore()}
function koi(x,y,sc,a,c){g.save();g.translate(x,y);g.rotate(a);g.scale(sc,sc);var sw=Math.sin(fr*.09+x);
  g.fillStyle=c[1];g.beginPath();g.moveTo(-6,0);g.quadraticCurveTo(-11,-3+sw*2,-13,sw*3);g.quadraticCurveTo(-11,3+sw*2,-6,0);g.fill();ell(g,0,0,7,2.6,c[0]);ell(g,1.5,-.2,2.6,1.2,c[2]);ell(g,6,0,2.4,2,c[0]);g.restore()}
function dyn(gy,u,t){var M=MT,i,W2=W,hx=function(a){return W2*a};
  if(!D.fx||lite())return;
  var hp=[[.215,24,0,['#e8dcc0','#c9b890'],0],[.235,36,1.7,['#a8582c','#7a3c1c'],0],[.255,22,3.1,['#e8dcc0','#b09060'],0],[.745,30,2.4,['#3a2a22','#b8661f'],1]];
  hp.forEach(function(h,j){var cyc=(t*.011+h[2])%TAU,mv=Math.sin(cyc),dir=Math.cos(cyc)>0?1:-1,x=hx(h[0])+Math.sin(t*.0042+h[2])*12*u,pk=Math.max(0,Math.sin(t*(.09+j*.015)+h[2]*3))>.55?1:0;
    hen(x,gy+(h[1]+Math.sin(h[2])*2)*u,u*(h[4]?1.15:.95),Math.cos(t*.0042+h[2])>0?1:-1,pk,h[3],h[4])});
  for(i=0;i<3;i++){var bx=hx(.29+i*.22)+Math.sin(t*.011+i*2)*50*u+Math.cos(t*.017+i)*18*u,by=gy+(46+i*14)*u+Math.sin(t*.021+i*1.7)*10*u-Math.abs(Math.sin(t*.03+i))*10*u;fly(bx,by,u*.9,i*1.3,t,i==0?['#f7d94a','#e9a32a']:i==1?['#f4f4ee','#cfd6dc']:['#8fb4f0','#5a7cc8'])}
  for(i=0;i<5;i++){var p=(t*.0028+i/5)%1,px=hx(.078)+Math.sin(p*7+i)*26*u+p*30*u,py=gy-130*u+p*128*u;g.fillStyle='rgba(247,196,210,'+(.85*Math.sin(p*Math.PI)).toFixed(2)+')';g.save();g.translate(px,py);g.rotate(p*9+i);g.beginPath();g.ellipse(0,0,2.2*u,1.2*u,0,0,TAU);g.fill();g.restore()}
  if(M&&M.pond){var P=M.pond,cols=[['#f0eee6','#e8a43a','#e86a3a'],['#e8602c','#f4c8a0','#ffffff'],['#f2b24a','#e4803a','#ffffff']];
    for(i=0;i<3;i++){var a=t*.012*(i%2?-1:1)+i*2.1,kx=P.x+Math.cos(a)*P.rx*(.52+i*.1),ky=P.y+Math.sin(a)*P.ry*(.52+i*.1),ang=Math.atan2(Math.cos(a)*P.ry*.6*(i%2?-1:1),-Math.sin(a)*P.rx*.6*(i%2?-1:1));koi(kx,ky,u*.95,ang,cols[i])}
    for(i=0;i<2;i++){var p2=(t*.007+i*.5)%1,rx2=P.x+Math.cos(i*3.1+1)*P.rx*.4,ry2=P.y+Math.sin(i*3.1+1)*P.ry*.4;g.strokeStyle='rgba(235,248,250,'+(.5*(1-p2)).toFixed(2)+')';g.lineWidth=.8*u;g.beginPath();g.ellipse(rx2,ry2,(2+p2*14)*u,(.6+p2*3.8)*u,0,0,TAU);g.stroke()}}
  var gl=Math.floor(t/22)%3,pp=[[.21,.27],[.57,.7],[.86,.4]][gl];if(pp){var gx=hx(pp[0])+(Math.sin(t*.2)*3)*u,gy2=gy+(40+pp[1]*45)*u;g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,250,230,'+(.4+.3*Math.sin(t*.25)).toFixed(2)+')';g.beginPath();g.ellipse(gx,gy2,2.4*u,.7*u,0,0,TAU);g.fill();g.restore()}}

/* ---------- gắn vào game ---------- */
function bad(e){D.err=e;if(++fails>=3)D.on=false;try{console.warn('[Thôn Tân Thủ chi tiết]',e)}catch(x){}}
function draw(gy){var top=ensure(gy);g.drawImage(BC,0,top,W,H-top);dyn(gy,s,fr)}
xbg=function(gy,m){var r=_xbg.apply(this,arguments);
  if(m===-1&&D.on&&window.TTT&&window.TTT.on&&window.TTT.drawn===fr&&g){try{draw(gy)}catch(e){bad(e)}}
  return r};
D.rebuild=function(){BK='';BC=null};
})();
