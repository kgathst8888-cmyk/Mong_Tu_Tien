/* ===== 🏡 THÔN TÂN THỦ — vẽ lại theo hướng mộc mạc, chân thực (world/56-thon-tan-thu.js) =====
 * Chỉ thay HÌNH VẼ của làng; không đổi logic, toạ độ, tương tác:
 *   xbg(gy,-1) = nền · bld(i) = 5 toà nhà (vị trí/kích thước vẫn theo bxx(i)/bww()) · window.TWPG = tháp Thí Luyện (module 07 dùng để vẽ nhãn + nhận chạm).
 * Phong cách: làng núi buổi sớm. Vách trát vôi + khung gỗ + mái ngói xám, nền đá, đường đất; cây cối, núi có phối cảnh khí quyển.
 * Đã BỎ so với bản cũ: đảo bay, hạc, thác, tia nắng quạt, dây đèn lồng, cổng đỏ-vàng, cánh hoa, đom đóm, đèn đá, chữ vàng, đấu củng nhiều màu.
 * Chuyển động (chỉ những thứ có thật ngoài đời): mây trôi, vài con chim, khói lò rèn / hơi nước đỉnh thuốc / khói bếp xa, lửa lò rèn, cờ lệnh, cổng truyền tống.
 * Hiệu năng: phần tĩnh vẽ 1 lần vào canvas đệm theo (W,H,s,DPR,font) rồi drawImage; toà nhà cũng có đệm riêng.
 * Tắt/bật: window.TTT.on=false (về hình cũ). Lỗi vẽ 3 lần → tự quay về hình cũ. window.TTT.rebuild() dựng lại đệm.
 * Bản cũ: _audit/56-thon-tan-thu.PHONG_CU.js.bak (đổi tên về .js để quay lại).
 * Phụ thuộc: xbg, bld, bxx, bww, BN, W,H,s,GY,DPR,PORT,fr,g, twS (tuỳ chọn). */
(function(){
'use strict';
if(typeof xbg!=='function'||typeof bld!=='function'||typeof bxx!=='function'||typeof g==='undefined')return;
var TAU=Math.PI*2,_xbg=xbg,_bld=bld,TT={on:true},FONT='Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif',LBLF='bold 15px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
window.TTT=TT;
/* ---------- tiện ích ---------- */
function rng(a){a>>>=0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function lg(q,x0,y0,x1,y1,st){var o=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function rg(q,x,y,r0,r1,st){var o=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function mk(w,h,d){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));var q=c.getContext('2d');q.setTransform(d,0,0,d,0,0);return{c:c,q:q}}
function fontOK(){try{return document.fonts&&document.fonts.check('20px "Ma Shan Zheng"')?1:0}catch(e){return 0}}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function hx(r,g2,b){return'#'+('000000'+((Math.round(r)<<16)|(Math.round(g2)<<8)|Math.round(b)).toString(16)).slice(-6)}
function mix(a,b,t){var A=rgb(a),B=rgb(b);return hx(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function ra(h,a){var A=rgb(h);return'rgba('+A[0]+','+A[1]+','+A[2]+','+a+')'}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function ell(q,x,y,rx,ry,c,rot){q.fillStyle=c;q.beginPath();q.ellipse(x,y,rx,ry,rot||0,0,TAU);q.fill()}
function poly(q,p,c){q.fillStyle=c;q.beginPath();q.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)q.lineTo(p[i],p[i+1]);q.closePath();q.fill()}
function line(q,x0,y0,x1,y1,c,w){q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x0,y0);q.lineTo(x1,y1);q.stroke()}
function shadow(q,x,y,rx,ry,a){q.save();q.translate(x,y);q.scale(1,ry/rx);q.fillStyle=rg(q,0,0,0,rx,[0,'rgba(18,22,12,'+a+')',.6,'rgba(18,22,12,'+a*.55+')',1,'rgba(18,22,12,0)']);q.beginPath();q.arc(0,0,rx,0,TAU);q.fill();q.restore()}
function noise(seed){var R=rng(seed),v=[],i;for(i=0;i<256;i++)v.push(R());return function(x){var i0=Math.floor(x),f=x-i0,t=f*f*(3-2*f),a=v[i0&255],b=v[(i0+1)&255];return a+(b-a)*t}}
function fbm(n,x,o){var s=0,a=.5,f=1,tt=0,i;for(i=0;i<o;i++){s+=a*n(x*f+i*13.7);tt+=a;a*=.5;f*=2}return s/tt}
function glowSpr(c){var o=mk(64,64,1),q=o.q;q.fillStyle=rg(q,32,32,1,32,[0,'rgba(255,255,255,1)',.2,c,.55,c.replace(/[\d.]+\)$/,'.25)'),1,c.replace(/[\d.]+\)$/,'0)')]);q.fillRect(0,0,64,64);return o.c}

/* ---------- núi xa: phối cảnh khí quyển, sườn sáng/tối theo hướng mặt trời (bên phải) ---------- */
function ridge(q,W,gy,u,L){var n=noise(L.seed),n2=noise(L.seed+77),n3=noise(L.seed+31),pts=[],st=4,N=Math.ceil(W/st)+2,base=gy-L.base*u,amp=L.amp*u,i,j,x,m,env,d2;
  for(i=0;i<=N;i++){x=i*st;m=fbm(n,x/(L.sc*u),L.oct||4);m=L.sharp?Math.pow(clamp(1-Math.abs(2*m-1)*1.5,0,1),L.sharp):clamp((m-.3)*2,0,1);
    d2=1-Math.abs(2*fbm(n3,x/(L.sc*.5*u),3)-1);m=clamp(m+(d2-.6)*.2,0,1);env=.6+.4*n2(x/(640*u));pts.push(x,base-amp*m*env)}
  q.fillStyle=lg(q,0,base-amp,0,base+10*u,L.cs||[0,L.c0,1,L.c1]);q.beginPath();q.moveTo(0,base+80*u);for(i=0;i<pts.length;i+=2)q.lineTo(pts[i],pts[i+1]);q.lineTo(W,base+80*u);q.closePath();q.fill();
  q.save();q.clip();
  var sm=[],nn=pts.length/2-1,ss,cc;for(i=0;i<nn;i++){ss=0;cc=0;for(j=-6;j<=6;j++){var ix=i+j;if(ix>=0&&ix<nn){ss+=(pts[ix*2+3]-pts[ix*2+1])/st;cc++}}sm.push(ss/cc)}
  for(i=0;i<nn;i++){var sl=sm[i],d=clamp(sl*.5,-1,1)*(L.sa||1),dep=(34+Math.abs(sl)*50)*u;
    q.fillStyle=lg(q,0,pts[i*2+1],0,pts[i*2+1]+dep,[0,d>0?'rgba(255,240,212,'+(.04+d*.15).toFixed(3)+')':'rgba(26,44,74,'+(.03-d*.16).toFixed(3)+')',1,'rgba(0,0,0,0)']);q.fillRect(pts[i*2]-.4,pts[i*2+1],st+1.2,dep)}
  var R=rng(L.seed+5),peaks=[],last=-1e9,py0,px0;
  for(i=3;i<nn-3;i++){py0=pts[i*2+1];if(py0<pts[i*2-5]&&py0<pts[i*2+7]&&py0<pts[i*2-1]&&py0<pts[i*2+3]&&py0<base-amp*.3&&pts[i*2]-last>(L.gap||70)*u){peaks.push(i);last=pts[i*2]}}
  for(i=0;i<peaks.length;i++){px0=pts[peaks[i]*2];py0=pts[peaks[i]*2+1];
    for(j=0;j<(L.spur||4);j++){var dr=j%2?1:-1,len=Math.min((50+R()*90)*u,base+60*u-py0),w0=(3+R()*5)*u,drift=dr*(18+R()*40)*u,wob=(R()-.5)*14*u,col=dr<0?'24,42,72':'255,240,212',al=dr<0?(.08+R()*.08):(.06+R()*.07),k,tt,xx,yy,ww;
      q.fillStyle=lg(q,0,py0,0,py0+len,[0,'rgba('+col+','+al.toFixed(3)+')',1,'rgba('+col+',0)']);q.beginPath();q.moveTo(px0,py0);
      for(k=1;k<=8;k++){tt=k/8;xx=px0+drift*tt+Math.sin(tt*5+j)*wob;yy=py0+len*tt;ww=w0*(1+tt*2.4);q.lineTo(xx-ww*(dr<0?.9:.3),yy)}
      for(k=8;k>=1;k--){tt=k/8;xx=px0+drift*tt+Math.sin(tt*5+j)*wob;yy=py0+len*tt;ww=w0*(1+tt*2.4);q.lineTo(xx+ww*(dr<0?.3:.9),yy)}
      q.closePath();q.fill()}}
  q.lineCap='round';for(i=0;i<(L.str||0);i++){var kk=((R()*(nn-3))|0)*2,sx=pts[kk],sy=pts[kk+1]+R()*R()*amp*.7,sl2=sm[kk/2]||0,ln=(5+R()*12)*u,dx=(sl2>0?1:-1)*ln*.3;
    q.strokeStyle=sl2>0?'rgba(255,238,205,'+(.05+R()*.07).toFixed(3)+')':'rgba(20,36,64,'+(.05+R()*.08).toFixed(3)+')';q.lineWidth=(.8+R()*1.1)*u;q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+dx,sy+ln);q.stroke()}
  q.restore();
  q.strokeStyle='rgba(255,242,218,.18)';q.lineWidth=1.1*u;q.beginPath();for(i=0;i<pts.length;i+=2)i?q.lineTo(pts[i],pts[i+1]):q.moveTo(pts[i],pts[i+1]);q.stroke();
  if(L.forest){var F=rng(L.seed+11),cnt=Math.round(W/u*(L.fn||.9)),T=[],pal=L.fpal,f;
    for(i=0;i<cnt;i++){x=F()*W;k=Math.min(pts.length-2,((x/st)|0)*2);T.push([x,pts[k+1]+Math.pow(F(),1.3)*L.fd*u,F(),F()])}
    T.sort(function(a,b){return a[1]-b[1]});
    for(i=0;i<T.length;i++){f=T[i];var h=(6+f[2]*9)*u*(L.fs||1),ww2=h*.5,lt=clamp((f[3]*.7+(f[1]<base-amp*.2?.1:0)),0,.999);
      q.fillStyle=pal[(lt*pal.length)|0];q.beginPath();q.moveTo(f[0],f[1]-h);q.lineTo(f[0]+ww2,f[1]);q.lineTo(f[0]-ww2,f[1]);q.closePath();q.fill();
      q.fillStyle='rgba(255,240,205,.10)';q.beginPath();q.moveTo(f[0],f[1]-h);q.lineTo(f[0]+ww2,f[1]);q.lineTo(f[0]+ww2*.1,f[1]);q.closePath();q.fill()}}
  return pts}
function ridgeY(pts,x){var k=Math.max(0,Math.min(pts.length/2-2,Math.floor(x/4)))*2,t=(x-pts[k])/4;return pts[k+1]+(pts[k+3]-pts[k+1])*t}
function mist(q,y,W,u,a,h){q.fillStyle=lg(q,0,y-h*u,0,y+h*u,[0,'rgba(244,232,210,0)',.5,'rgba(244,232,210,'+a+')',1,'rgba(244,232,210,0)']);q.fillRect(0,y-h*u,W,h*2*u)}

/* ---------- cây cối: vẽ theo từng mảng lá, sáng ở phía mặt trời ---------- */
function trunk(q,x,y,h,w0,w1,c,lean,seed){var R=rng(seed),tx=x+lean,i,f;
  q.fillStyle=lg(q,x-w0,0,x+w0,0,[0,mix(c,'#000000',.3),.55,c,1,mix(c,'#fff0d0',.28)]);
  q.beginPath();q.moveTo(x-w0*1.7,y+2);q.quadraticCurveTo(x-w0*1.2,y,x-w0,y-4);q.quadraticCurveTo(x-w0*.6+lean*.2,y-h*.5,tx-w1,y-h);q.lineTo(tx+w1,y-h);q.quadraticCurveTo(x+w0*.6+lean*.2,y-h*.5,x+w0,y-4);q.quadraticCurveTo(x+w0*1.2,y,x+w0*1.7,y+2);q.closePath();q.fill();
  q.strokeStyle='rgba(20,12,8,.28)';q.lineWidth=.8;for(i=0;i<5;i++){f=R()*1.6-.8;q.beginPath();q.moveTo(x+f*w0,y-2);q.quadraticCurveTo(x+f*w0*.8+lean*.2,y-h*.5,tx+f*w1,y-h+2);q.stroke()}}
function lobe(q,cx,cy,rx,ry,n,r,R,pal){ell(q,cx,cy,rx,ry,pal[0]);
  for(var i=0;i<n;i++){var a=R()*TAU,d=Math.sqrt(R()),x=cx+Math.cos(a)*d*rx*.96,y=cy+Math.sin(a)*d*ry*.96,L=clamp((((x-cx)/rx)*.5-((y-cy)/ry)*.75)*.5+.5+(R()-.5)*.4,0,.999);
    ell(q,x,y,r*(.8+R()*.5),r*(.55+R()*.35),pal[(L*pal.length)|0],R()*3)}}
var PAL={leaf:['#243f2a','#2f5230','#42713a','#5f9044','#86b255'],leafD:['#1f3a2a','#2a4a30','#385f38','#4f7c43','#76a050'],blossom:['#9c5a6a','#c47a8c','#e29aae','#f2bccb','#fde0e6'],pine:['#17352a','#22493a','#2f6046','#44784f','#6c9a5c'],far:['#2f4a3a','#3a5a44','#476b4c','#5a7e56','#74935f']};
function tBroad(q,x,y,u,seed,o){o=o||{};var R=rng(seed),sz=o.sz||1,pal=o.pal||PAL.leaf,wd=o.w||1,bark=o.bark||'#4d3b2d';q.save();q.translate(x,y);q.scale(u*sz,u*sz);
  shadow(q,-8,1,40*wd,6,.3);trunk(q,0,0,52,6,3.2,bark,(R()-.5)*6,seed);
  q.strokeStyle=bark;q.lineCap='round';q.lineWidth=2.6;q.beginPath();q.moveTo(0,-38);q.quadraticCurveTo(-14*wd,-52,-26*wd,-66);q.moveTo(1,-42);q.quadraticCurveTo(14*wd,-56,26*wd,-68);q.stroke();
  [[-34,-54,17,12],[36,-56,17,12],[-24,-70,25,19],[24,-72,25,19],[-3,-62,29,16],[0,-90,31,22]].forEach(function(l){lobe(q,l[0]*wd,l[1],l[2]*wd,l[3],64,3.3,R,pal)});q.restore()}
function needles(q,cx,cy,rx,ry,n,R,pal){ell(q,cx,cy,rx,ry,pal[0]);q.lineCap='round';
  for(var i=0;i<n;i++){var a=R()*TAU,d=Math.sqrt(R()),x=cx+Math.cos(a)*d*rx,y=cy+Math.sin(a)*d*ry,L=clamp((((x-cx)/rx)*.45-((y-cy)/ry)*.9)*.5+.5+(R()-.5)*.35,0,.999);
    q.strokeStyle=pal[(L*pal.length)|0];q.lineWidth=1.15;q.beginPath();q.moveTo(x,y);q.lineTo(x+(R()-.5)*7,y-(1+R()*4));q.stroke()}}
function tPine(q,x,y,u,seed,o){o=o||{};var R=rng(seed),sz=o.sz||1;q.save();q.translate(x,y);q.scale(u*sz,u*sz);shadow(q,-6,1,34,5,.3);
  q.strokeStyle='#5a3e2c';q.lineCap='round';q.lineWidth=7;q.beginPath();q.moveTo(0,0);q.bezierCurveTo(-8,-26,10,-46,-2,-80);q.stroke();q.strokeStyle='rgba(255,230,190,.2)';q.lineWidth=2;q.beginPath();q.moveTo(3,0);q.bezierCurveTo(-4,-26,13,-46,1,-80);q.stroke();
  q.strokeStyle='#4c3626';q.lineWidth=3;q.beginPath();q.moveTo(-1,-44);q.quadraticCurveTo(-16,-50,-24,-54);q.moveTo(3,-58);q.quadraticCurveTo(16,-62,26,-66);q.moveTo(0,-30);q.quadraticCurveTo(14,-34,22,-40);q.stroke();
  [[-24,-56,22,7],[26,-68,22,7],[22,-42,18,6],[-2,-84,24,8],[-8,-66,16,5]].forEach(function(c){needles(q,c[0],c[1],c[2],c[3],110,R,PAL.pine)});q.restore()}
function tBamboo(q,x,y,u,seed,n){var R=rng(seed),i,k,bx,h,ln;q.save();q.translate(x,y);q.scale(u,u);shadow(q,0,1,n*5+8,4,.22);
  for(i=0;i<n;i++){bx=(i-n/2)*6+(R()-.5)*4;h=72+R()*52;ln=(R()-.5)*9;
    line(q,bx,0,bx+ln,-h,'#6f8e45',2.9);line(q,bx+.9,0,bx+ln+.9,-h,'rgba(255,248,200,.3)',.9);
    for(k=1;k<7;k++){var yy=-h*k/7;line(q,bx-2.2+ln*k/7,yy,bx+2.2+ln*k/7,yy,'#43592a',1)}
    for(k=0;k<9;k++){var ly=-h*(.5+R()*.5),lx=bx+ln*(-ly/h),d=R()<.5?-1:1,L=13+R()*11;q.fillStyle=R()<.5?'#5f8a3c':'#86ad52';q.beginPath();q.moveTo(lx,ly);q.quadraticCurveTo(lx+d*L*.55,ly-L*.24,lx+d*L,ly+L*.3);q.quadraticCurveTo(lx+d*L*.5,ly+L*.08,lx,ly);q.fill()}}
  q.restore()}
function rock(q,x,y,w,h,seed){var R=rng(seed),p=[],n=9,i,a;shadow(q,x-2,y+1,w*1.15,h*.5,.28);
  for(i=0;i<=n;i++){a=Math.PI+i/n*Math.PI;p.push(x+Math.cos(a)*w*(.86+R()*.24),y+Math.sin(a)*h*(.78+R()*.3))}
  q.fillStyle=lg(q,x-w,0,x+w,0,[0,'#6a665c',.55,'#948e80',1,'#b4ae9c']);q.beginPath();q.moveTo(x-w,y+1);for(i=0;i<p.length;i+=2)q.lineTo(p[i],p[i+1]);q.lineTo(x+w,y+1);q.closePath();q.fill();
  q.fillStyle='rgba(255,246,220,.14)';q.beginPath();q.ellipse(x+w*.25,y-h*.62,w*.45,h*.22,-.2,0,TAU);q.fill();q.fillStyle='rgba(78,108,60,.35)';q.beginPath();q.ellipse(x-w*.35,y-h*.2,w*.35,h*.14,0,0,TAU);q.fill()}
function tufts(q,x0,x1,y,u,n,seed){var R=rng(seed),i,x,h,d;q.lineCap='round';for(i=0;i<n;i++){x=x0+R()*(x1-x0);h=(4+R()*8)*u;d=(R()-.5)*3*u;q.strokeStyle=R()<.5?'rgba(96,140,62,.85)':'rgba(132,170,78,.8)';q.lineWidth=(.9+R()*.7)*u;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+d*.3,y-h*.6,x+d,y-h);q.stroke()}}

/* ---------- vật liệu & chi tiết nhà (toạ độ cục bộ: gốc giữa chân nhà, y âm là hướng lên) ---------- */
function roof(q,cx,yE,hw,rise,over,tc,o){o=o||{};var xL=cx-hw-over,xR=cx+hw+over,rl=o.rl!=null?o.rl:hw*.55,yT=yE-rise,tip=o.tip==null?7:o.tip,ax=xL+over*.8,bx=xR-over*.8,j,t,x;
  function P(){q.beginPath();q.moveTo(xL,yE-tip);q.quadraticCurveTo(xL+over*.35,yE+3,ax,yE+4);q.lineTo(bx,yE+4);q.quadraticCurveTo(xR-over*.35,yE+3,xR,yE-tip);q.quadraticCurveTo(cx+hw*.98,yE-rise*.4,cx+rl,yT);q.lineTo(cx-rl,yT);q.quadraticCurveTo(cx-hw*.98,yE-rise*.4,xL,yE-tip);q.closePath()}
  q.save();P();q.clip();q.fillStyle=lg(q,0,yT,0,yE+4,[0,tc[0],1,tc[1]]);q.fillRect(xL,yT-4,xR-xL,rise+14);
  var nC=Math.max(8,Math.round((xR-xL)/5.2));for(j=0;j<=nC;j++){t=j/nC;var xt=cx-rl+2*rl*t,xb=ax+(bx-ax)*t;q.strokeStyle='rgba(10,14,18,.27)';q.lineWidth=.8;q.beginPath();q.moveTo(xt,yT);q.quadraticCurveTo((xt+xb)/2+(xb-xt)*.05,yE-rise*.34,xb,yE+4);q.stroke()}
  var rows=Math.max(4,Math.round(rise/5));for(j=1;j<rows;j++){var yy=yT+(yE+4-yT)*(j/rows);q.strokeStyle='rgba(8,10,14,'+(.12+.06*j/rows).toFixed(3)+')';q.lineWidth=.9;q.beginPath();q.moveTo(xL,yy+2);q.lineTo(xR,yy+2);q.stroke();q.strokeStyle='rgba(255,255,255,.045)';q.beginPath();q.moveTo(xL,yy+3);q.lineTo(xR,yy+3);q.stroke()}
  q.fillStyle=lg(q,xL,0,xR,0,[0,'rgba(0,0,0,.22)',.5,'rgba(0,0,0,0)',1,'rgba(255,240,215,.15)']);q.fillRect(xL,yT-4,xR-xL,rise+14);q.restore();
  P();q.strokeStyle='rgba(18,12,10,.55)';q.lineWidth=1.1;q.stroke();
  for(x=ax+4;x<=bx-4;x+=5.2){ell(q,x,yE+4.6,2.4,2.1,mix(tc[1],'#000000',.35));ell(q,x,yE+3.9,1.8,1.1,mix(tc[0],'#ffffff',.12))}
  q.fillStyle='#34291f';q.fillRect(ax,yE+6.4,bx-ax,2.4);q.fillStyle='rgba(255,230,190,.14)';q.fillRect(ax,yE+6.4,bx-ax,.8);
  q.fillStyle=lg(q,0,yT-4,0,yT+2,[0,mix(tc[0],'#ffffff',.2),1,tc[1]]);q.beginPath();q.rect(cx-rl-3,yT-3.6,rl*2+6,5.6);q.fill();
  [-1,1].forEach(function(d){var ex=cx+d*(rl+3);q.fillStyle=mix(tc[1],'#000000',.15);q.beginPath();q.moveTo(ex,yT+2);q.quadraticCurveTo(ex+d*6,yT+1,ex+d*6,yT-7);q.quadraticCurveTo(ex+d*2.5,yT-3,ex,yT-3.6);q.closePath();q.fill()})}
function stones(q,x0,y0,x1,y1,base,seed,rh){var R=rng(seed),y=y0,row=0,x,w,h,xa,xb,c;q.fillStyle=mix(base,'#000000',.45);q.fillRect(x0,y0,x1-x0,y1-y0);
  while(y<y1-.5){h=Math.min(rh*(.85+R()*.3),y1-y);x=x0-(row%2?R()*12:0);
    while(x<x1){w=11+R()*15;xa=Math.max(x,x0);xb=Math.min(x+w,x1);
      if(xb-xa>1.5){c=mix(base,R()<.5?'#ffffff':'#000000',.04+R()*.1);q.fillStyle=lg(q,0,y,0,y+h,[0,mix(c,'#ffffff',.08),1,mix(c,'#000000',.12)]);q.fillRect(xa+.6,y+.6,xb-xa-1.2,h-1.2)}
      x+=w}
    y+=h;row++}}
function plaster(q,x0,x1,yT,yB,c,seed){var R=rng(seed),i;q.fillStyle=lg(q,0,yT,0,yB,[0,c,1,mix(c,'#8a7a62',.2)]);q.fillRect(x0,yT,x1-x0,yB-yT);
  for(i=0;i<22;i++){q.fillStyle='rgba(110,92,70,'+(.03+R()*.05).toFixed(3)+')';q.fillRect(x0+R()*(x1-x0),yT,1+R()*3,(yB-yT)*(.3+R()*.7))}
  q.fillStyle=lg(q,0,yB-16,0,yB,[0,'rgba(90,76,58,0)',1,'rgba(90,76,58,.3)']);q.fillRect(x0,yB-16,x1-x0,16);
  q.fillStyle=lg(q,x0,0,x1,0,[0,'rgba(0,0,0,.10)',.5,'rgba(0,0,0,0)',1,'rgba(255,244,220,.10)']);q.fillRect(x0,yT,x1-x0,yB-yT)}
function timber(q,x,y,w,h,c,hor){q.fillStyle=hor?lg(q,0,y,0,y+h,[0,mix(c,'#fff2d8',.22),.4,c,1,mix(c,'#000000',.3)]):lg(q,x,0,x+w,0,[0,mix(c,'#000000',.28),.6,c,1,mix(c,'#fff2d8',.24)]);q.fillRect(x,y,w,h);
  q.fillStyle='rgba(0,0,0,.18)';if(hor){q.fillRect(x,y+h*.45,w,.7)}else{q.fillRect(x+w*.4,y,.7,h)}}
function plinth(q,hw){stones(q,-hw,-9,hw,0,'#8d877a',7,4.6);q.fillStyle='rgba(255,244,214,.32)';q.fillRect(-hw,-9,hw*2,1.2);q.fillStyle='rgba(0,0,0,.2)';q.fillRect(-hw,-1.2,hw*2,1.2)}
function steps(q,hw,n){for(var k=0;k<n;k++){var w=hw-k*3,y=-3*(k+1);q.fillStyle=lg(q,0,y,0,y+3,[0,'#c4bca8',1,'#8e8774']);q.fillRect(-w,y,w*2,3.2);q.fillStyle='rgba(255,246,222,.4)';q.fillRect(-w,y,w*2,.9);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(-w,y+2.6,w*2,.7)}}
function hangSign(q,x,ch){line(q,x-5,-78,x-5,-70,'#2a1c12',.9);line(q,x+5,-78,x+5,-70,'#2a1c12',.9);q.fillStyle='#2b2018';q.fillRect(x-8,-70,16,25);q.strokeStyle='#a1824e';q.lineWidth=.9;q.strokeRect(x-6.6,-68.6,13.2,22.2);q.fillStyle='rgba(255,236,200,.10)';q.fillRect(x+6,-70,2,25);
  q.fillStyle='#f0e2b8';q.font='bold 13px '+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText(ch,x,-57.5);q.textBaseline='alphabetic'}
function barrel(q,x,y,w,h,c){c=c||'#8a6342';var hw=w/2;q.fillStyle=lg(q,x-hw,0,x+hw,0,[0,mix(c,'#000000',.35),.5,c,1,mix(c,'#fff0d0',.2)]);q.beginPath();q.moveTo(x-hw*.86,y-h);q.quadraticCurveTo(x-hw*1.14,y-h/2,x-hw*.86,y);q.lineTo(x+hw*.86,y);q.quadraticCurveTo(x+hw*1.14,y-h/2,x+hw*.86,y-h);q.closePath();q.fill();
  q.strokeStyle='rgba(30,20,12,.35)';q.lineWidth=.7;for(var i=1;i<5;i++){q.beginPath();q.moveTo(x-hw+i*w/5,y-h+1);q.lineTo(x-hw+i*w/5,y-1);q.stroke()}
  [.22,.78].forEach(function(f){q.strokeStyle='#2c2824';q.lineWidth=1.6;q.beginPath();q.moveTo(x-hw*(1.02+.1*Math.sin(f*3.14)),y-h*f);q.lineTo(x+hw*(1.02+.1*Math.sin(f*3.14)),y-h*f);q.stroke()});ell(q,x,y-h,hw*.86,2.4,mix(c,'#ffffff',.12))}
function jarS(q,x,y,s,c){q.fillStyle=lg(q,x-9*s,0,x+9*s,0,[0,c[0],.45,c[1],1,c[0]]);q.beginPath();q.moveTo(x-3.4*s,y-15*s);q.quadraticCurveTo(x-9*s,y-8*s,x-7*s,y-2*s);q.quadraticCurveTo(x-6*s,y,x-3.5*s,y);q.lineTo(x+3.5*s,y);q.quadraticCurveTo(x+6*s,y,x+7*s,y-2*s);q.quadraticCurveTo(x+9*s,y-8*s,x+3.4*s,y-15*s);q.closePath();q.fill();
  q.fillStyle=mix(c[0],'#000000',.35);q.fillRect(x-3.9*s,y-17*s,7.8*s,2.6*s);ell(q,x+2.4*s,y-8*s,1.4*s,3.4*s,'rgba(255,255,255,.2)')}
function sack(q,x,y,s,c){q.fillStyle=lg(q,x-9*s,0,x+9*s,0,[0,mix(c,'#000000',.2),.55,c,1,mix(c,'#ffffff',.18)]);q.beginPath();q.moveTo(x-6*s,y);q.quadraticCurveTo(x-11*s,y-9*s,x-4*s,y-17*s);q.lineTo(x+4*s,y-17*s);q.quadraticCurveTo(x+11*s,y-9*s,x+6*s,y);q.closePath();q.fill();ell(q,x,y-17*s,4.8*s,2*s,mix(c,'#000000',.25));line(q,x-4*s,y-15*s,x+4*s,y-15*s,'rgba(60,40,20,.7)',1)}
function lattice(q,x,y,w,h,paper){q.fillStyle='#35261b';q.fillRect(x-1.6,y-1.6,w+3.2,h+3.2);q.fillStyle=lg(q,0,y,0,y+h,[0,mix(paper,'#ffffff',.15),1,paper]);q.fillRect(x,y,w,h);q.strokeStyle='#5a4230';q.lineWidth=1;q.beginPath();for(var i=1;i<3;i++){q.moveTo(x+w*i/3,y);q.lineTo(x+w*i/3,y+h);q.moveTo(x,y+h*i/3);q.lineTo(x+w,y+h*i/3)}q.stroke();q.fillStyle='rgba(255,255,255,.12)';q.fillRect(x,y,w,2)}
function logs(q,x,y,n){var r=0,c,k;for(r=0;r<n;r++)for(c=0;c<n-r;c++){var lx=x+c*7.4+r*3.7,ly=y-3.7-r*6.4;ell(q,lx,ly,3.8,3.8,'#6a4a2e');ell(q,lx,ly,3.1,3.1,'#c29862');q.strokeStyle='rgba(110,70,36,.7)';q.lineWidth=.6;q.beginPath();q.arc(lx,ly,1.8,0,TAU);q.stroke();q.beginPath();q.arc(lx,ly,.7,0,TAU);q.stroke()}}
var TH=[{wall:'#dcd2bb',t:['#6f7c84','#434e57']},{wall:'#ece3cc',t:['#6b7a7c','#3e4b50']},{wall:'#e4dcc2',t:['#76808a','#48525c']},{wall:'#e8dfc6',t:['#6a727e','#3f4752']},{wall:'#e4dac2',t:['#6f7c84','#434e57']}],TIM='#4a382b';
function eaveShade(q,x0,x1,yE){q.fillStyle=lg(q,0,yE+2,0,yE+24,[0,'rgba(24,14,8,.42)',1,'rgba(24,14,8,0)']);q.fillRect(x0,yE+2,x1-x0,22)}
function frame(q,th,seed){plaster(q,-54,54,-78,-9,th.wall,seed);timber(q,-57,-82,6,73,TIM);timber(q,51,-82,6,73,TIM);timber(q,-57,-82,114,5,TIM,1)}
/* --- 1. Thợ Rèn: tường đá, lò, đe, giá binh khí, ống khói --- */
function bForge(q,th){var i;stones(q,-54,-78,54,-9,'#948d80',11,9);timber(q,-57,-82,6,73,TIM);timber(q,51,-82,6,73,TIM);timber(q,-57,-82,114,5,TIM,1);
  q.fillStyle=lg(q,0,-64,0,-9,[0,'#110b09',1,'#2a1a12']);q.fillRect(-26,-64,52,55);
  stones(q,-24,-40,0,-9,'#6a645a',12,6);poly(q,[-26,-40,2,-40,-4,-64,-22,-64],'#241c17');
  q.fillStyle=lg(q,0,-30,0,-12,[0,'#ffb552',.5,'#e5601c',1,'#7a2410']);q.beginPath();q.moveTo(-19,-12);q.lineTo(-19,-24);q.quadraticCurveTo(-12,-33,-5,-24);q.lineTo(-5,-12);q.closePath();q.fill();
  q.fillStyle='#5a3e2a';q.beginPath();q.moveTo(12,-14);q.lineTo(26,-12);q.lineTo(26,-24);q.lineTo(12,-22);q.closePath();q.fill();ell(q,22,-14,3,2.2,'#2a1c12');ell(q,22,-23,3,2.2,'#3a2a1c');
  q.fillStyle='#6a4a2e';q.fillRect(7,-21,14,12);ell(q,14,-21,7,2.2,'#8a6a44');
  poly(q,[2,-30,22,-30,19,-26,15,-26,16,-22,10,-22,11,-26,7,-26],'#34373f');poly(q,[2,-30,-4,-29,2,-27],'#34373f');q.fillStyle='#6d7280';q.fillRect(2,-30.4,20,1.2);q.fillStyle='#ff8a30';q.fillRect(8,-32,9,1.8);
  timber(q,-31,-66,5,57,TIM);timber(q,26,-66,5,57,TIM);timber(q,-32,-69,64,5,TIM,1);
  q.fillStyle='#5a4332';q.fillRect(-52,-62,19,38);q.strokeStyle='#7a5a3c';q.lineWidth=1;q.strokeRect(-51.5,-61.5,18,37);
  [-47,-41].forEach(function(x){poly(q,[x-1.2,-58,x+1.2,-58,x+1.2,-36,x,-33,x-1.2,-36],'#cfd6de');q.fillStyle='#8a6a3a';q.fillRect(x-3.4,-36,6.8,2);line(q,x,-34,x,-29,'#3a2a1c',2)});
  line(q,-35.5,-58,-35.5,-30,'#6a4a2c',1.8);poly(q,[-35.5,-58,-30.5,-56,-30.5,-48,-35.5,-46],'#b8bec8');
  barrel(q,41,-9,18,24,'#7a5a3a');
  q.fillStyle=lg(q,0,-82,0,-62,[0,'rgba(24,14,8,.4)',1,'rgba(24,14,8,0)']);q.fillRect(-54,-78,108,16);
  logs(q,-70,-9,3);
  roof(q,0,-78,58,40,13,th.t,{rl:30});
  stones(q,34,-152,46,-92,'#8e877b',17,7);q.fillStyle='rgba(255,244,214,.18)';q.fillRect(43,-152,3,60);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(34,-152,3,60);q.fillStyle='#6e675c';q.fillRect(32,-155,16,5);q.fillStyle='#2a2520';q.fillRect(35,-152,10,3);q.fillStyle='rgba(0,0,0,.3)';q.fillRect(34,-96,12,4);
  hangSign(q,47,'鍛')}
/* --- 2. Tạp Hóa: quầy, mái vải, hũ chum --- */
function bShop(q,th){var i,R=rng(22);frame(q,th,21);
  q.fillStyle=lg(q,0,-62,0,-9,[0,'#24170f',1,'#4a3322']);q.fillRect(-40,-62,80,53);
  [-50,-40].forEach(function(y){q.fillStyle='#6a4a32';q.fillRect(-39,y,78,2.6);q.fillStyle='rgba(0,0,0,.35)';q.fillRect(-39,y+2.6,78,2)});
  [-50,-40].forEach(function(y,r){for(i=0;i<7;i++)jarS(q,-33+i*11+(r?4:0),y,.5+R()*.12,R()<.5?['#7a4a24','#c08a4a']:['#59673f','#9aae66'])});
  timber(q,-43,-65,4,56,TIM);timber(q,39,-65,4,56,TIM);
  q.fillStyle=lg(q,0,-31,0,-9,[0,'#94694a',1,'#6a4630']);q.fillRect(-42,-31,84,22);q.strokeStyle='rgba(30,16,6,.5)';q.lineWidth=.8;for(i=1;i<14;i++){q.beginPath();q.moveTo(-42+i*6,-31);q.lineTo(-42+i*6,-9);q.stroke()}
  q.fillStyle='#b07f52';q.fillRect(-44,-34,88,4);q.fillStyle='rgba(255,236,200,.3)';q.fillRect(-44,-34,88,1);
  ell(q,-30,-35,5,1.8,'#d9cfb4');ell(q,-30,-38,4.4,1.7,'#cbbf9e');q.fillStyle='#b58a4a';q.beginPath();q.ellipse(-8,-37,9,5,0,0,Math.PI);q.fill();ell(q,-8,-37,9,2.2,'#8f6a34');[[-12,-39.5,'#b8372a'],[-8,-40.4,'#d9a233'],[-4,-39.5,'#b8372a'],[-9,-38.6,'#6b9a3a']].forEach(function(f){ell(q,f[0],f[1],2.4,2.2,f[2])});
  jarS(q,14,-34,.9,['#6a3a1a','#c98a4a']);jarS(q,27,-34,.75,['#4a5a3a','#98ac64']);
  q.fillStyle='rgba(24,14,8,.35)';q.fillRect(-40,-62,80,8);
  var AW=['#a4503a','#e0d1ac'],k;for(k=0;k<10;k++){var xt0=-46+k*9.2,xt1=xt0+9.2,xb0=-52+k*10.4,xb1=xb0+10.4;q.fillStyle=AW[k%2];q.beginPath();q.moveTo(xt0,-71);q.lineTo(xt1,-71);q.lineTo(xb1,-57);q.arc((xb0+xb1)/2,-57,5.2,0,Math.PI);q.closePath();q.fill()}
  q.fillStyle=lg(q,0,-71,0,-52,[0,'rgba(255,240,210,.18)',.6,'rgba(0,0,0,0)',1,'rgba(0,0,0,.28)']);q.beginPath();q.moveTo(-46,-71);q.lineTo(46,-71);q.lineTo(52,-57);q.lineTo(-52,-57);q.closePath();q.fill();
  barrel(q,-51,-9,15,21,'#86603f');sack(q,50,-9,.95,'#cdbf98');sack(q,58,-9,.8,'#b9a87c');
  eaveShade(q,-54,54,-78);roof(q,0,-78,58,40,13,th.t,{rl:30});
  line(q,54,-72,70,-72,'#3e2c1e',2.2);line(q,54,-60,63,-72,'#3e2c1e',1.6);line(q,66,-72,66,-66,'#2a1c12',.9);q.fillStyle='#2b2018';q.fillRect(58,-66,16,25);q.strokeStyle='#a1824e';q.lineWidth=.9;q.strokeRect(59.4,-64.6,13.2,22.2);q.fillStyle='#f0e2b8';q.font='bold 13px '+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText('貨',66,-53.5);q.textBaseline='alphabetic'}
/* --- 3. Hồi Phục: tủ thuốc, lò sắc thuốc, cửa sổ giấy --- */
function bHerb(q,th){var i,j,R=rng(33);frame(q,th,31);
  q.fillStyle='#3b2a1e';q.fillRect(-22,-62,44,53);
  for(j=0;j<6;j++)for(i=0;i<5;i++){var dx=-20+i*8,dy=-60+j*5.8;q.fillStyle='#7a5636';q.fillRect(dx,dy,7.2,5);q.fillStyle='#9a7448';q.fillRect(dx,dy,7.2,.9);q.fillStyle='#d6b25a';q.fillRect(dx+3,dy+2.2,1.3,1.1)}
  timber(q,-25,-65,4,56,TIM);timber(q,21,-65,4,56,TIM);q.fillStyle=lg(q,0,-27,0,-9,[0,'#8c6240',1,'#5f3f2a']);q.fillRect(-24,-27,48,18);q.fillStyle='#a47a50';q.fillRect(-26,-30,52,4);
  ell(q,-12,-31,4.6,1.6,'#d9cfb4');[0,1,2].forEach(function(k){q.fillStyle='#efe6cc';q.fillRect(4+k*4.6,-34.6,4,4.6);q.fillStyle='rgba(120,70,30,.5)';q.fillRect(5+k*4.6,-33,2,.7)});
  [[-14,'#6a8a3a'],[-5,'#b08a3a'],[5,'#7a9a4a'],[14,'#a8562a']].forEach(function(h){line(q,h[0],-66,h[0],-61,'#5a4228',.9);q.fillStyle=h[1];q.beginPath();q.ellipse(h[0],-56,3.4,6.8,0,0,TAU);q.fill();q.fillStyle='rgba(0,0,0,.2)';q.beginPath();q.ellipse(h[0]+1,-55,1.6,5,0,0,TAU);q.fill()});
  lattice(q,-51,-46,19,22,'#ecd7a2');q.fillStyle='#5a4331';q.fillRect(-53,-24,23,3);
  stones(q,30,-26,52,-9,'#7d776b',32,6);q.fillStyle='#17110d';q.beginPath();q.moveTo(37,-9);q.lineTo(37,-17);q.quadraticCurveTo(41,-22,45,-17);q.lineTo(45,-9);q.closePath();q.fill();q.fillStyle='rgba(255,130,40,.8)';q.beginPath();q.moveTo(38.5,-9);q.lineTo(38.5,-14);q.quadraticCurveTo(41,-17,43.5,-14);q.lineTo(43.5,-9);q.closePath();q.fill();
  q.fillStyle=lg(q,30,0,52,0,[0,'#2a2724',.5,'#55504a',1,'#7a746c']);q.beginPath();q.ellipse(41,-33,11,9,0,0,TAU);q.fill();ell(q,41,-39,10,3,'#16110e');ell(q,41,-39,8.4,2.2,'#5e4220');q.strokeStyle='#2a2724';q.lineWidth=1.6;q.beginPath();q.arc(41,-39,10.2,Math.PI*.1,Math.PI*.9,true);q.stroke();
  [[50,'#a0623a'],[59,'#8e5430']].forEach(function(p){q.fillStyle=p[1];q.beginPath();q.moveTo(p[0]-4,-17);q.lineTo(p[0]+4,-17);q.lineTo(p[0]+3,-9);q.lineTo(p[0]-3,-9);q.closePath();q.fill();for(var k=0;k<5;k++){var a=-1.2+k*.6;q.fillStyle=k%2?'#5f8a3c':'#7aa04a';q.beginPath();q.ellipse(p[0]+Math.sin(a)*4,-21-Math.cos(a)*4,1.6,5,a,0,TAU);q.fill()}});
  eaveShade(q,-54,54,-78);roof(q,0,-78,58,40,13,th.t,{rl:30});hangSign(q,-47,'藥');
  line(q,-47,-45,-47,-41,'#5a4228',.9);q.fillStyle='#c8913a';q.beginPath();q.arc(-47,-37.4,3.2,0,TAU);q.arc(-47,-31.2,4.6,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.25)';q.beginPath();q.arc(-48.4,-32.4,1.2,0,TAU);q.fill()}
/* --- 4. Nhiệm Vụ: sảnh có cửa gỗ, bảng cáo thị, cột cờ lệnh --- */
function bHall(q,th){var i,k;frame(q,th,41);stones(q,-54,-24,54,-9,'#9a9484',42,7);
  q.fillStyle='#35261b';q.fillRect(-21,-68,42,59);
  [-1,1].forEach(function(d){var x0=d>0?0:-19.5;q.fillStyle=lg(q,x0,0,x0+19.5,0,[0,d>0?'#7a2e22':'#8a3a2c',.5,'#8e3a2c',1,d>0?'#a34a38':'#6a281e']);q.fillRect(x0,-65,19.5,56);q.strokeStyle='rgba(30,10,6,.35)';q.lineWidth=.8;for(i=1;i<5;i++){q.beginPath();q.moveTo(x0+i*3.9,-65);q.lineTo(x0+i*3.9,-9);q.stroke()}
    for(i=0;i<3;i++)for(k=0;k<3;k++)ell(q,x0+4+k*5.6,-56+i*11,1.3,1.3,'#b8924a');q.strokeStyle='#b8924a';q.lineWidth=1;q.beginPath();q.arc(d*3.4,-38,2.2,0,TAU);q.stroke()});
  line(q,0,-65,0,-9,'#2a0f0a',1.2);timber(q,-24,-68,4,59,TIM);timber(q,20,-68,4,59,TIM);timber(q,-24,-71,48,5,TIM,1);
  q.fillStyle='#2b2018';q.fillRect(-13,-76,26,7);q.strokeStyle='#a1824e';q.lineWidth=.8;q.strokeRect(-12.4,-75.4,24.8,5.8);q.fillStyle='#f0e2b8';q.font='bold 7px '+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText('令',0,-72.2);q.textBaseline='alphabetic';
  timber(q,-50,-26,3,17,'#5a4331');timber(q,-33,-26,3,17,'#5a4331');q.fillStyle='#4f3a28';q.fillRect(-53,-66,26,41);q.fillStyle='#8e6c48';q.fillRect(-51.5,-64.5,23,38);
  [[-49,-62,10,13,-.05],[-38,-63,11,14,.04],[-49,-47,11,14,.03],[-38,-46,10,13,-.04]].forEach(function(p){q.save();q.translate(p[0]+p[2]/2,p[1]+p[3]/2);q.rotate(p[4]);q.fillStyle='#efe6c8';q.fillRect(-p[2]/2,-p[3]/2,p[2],p[3]);q.fillStyle='rgba(60,40,24,.5)';for(var l=0;l<3;l++)q.fillRect(-p[2]/2+1.5,-p[3]/2+2.5+l*3.6,p[2]-3.5,.8);q.restore()});ell(q,-44,-47,1.4,1.4,'#a83a2a');
  roof(q,-40,-66,13,7,4,th.t,{rl:6,tip:3});steps(q,28,3);line(q,56,-9,56,-142,'#5a4331',2.6);ell(q,56,-143.5,2.4,2.4,'#b8964a');timber(q,52,-14,9,5,'#8a8272');
  eaveShade(q,-54,54,-78);roof(q,0,-78,58,44,15,th.t,{rl:34});
  q.fillStyle=mix(th.t[1],'#000000',.1);poly(q,[-5,-122,5,-122,3,-127,-3,-127],q.fillStyle)}
/* --- 5. Bản Đồ: cổng trăng trong tường vôi, cổng truyền tống --- */
function bPortal(q,th){var i,a;plaster(q,-62,62,-92,-9,th.wall,51);plinth(q,64);
  q.fillStyle=rg(q,0,-50,0,34,[0,'#d4eef4',.35,'#7bb9d4',.72,'#2c5686',1,'#101f3e']);q.beginPath();q.arc(0,-50,33,0,TAU);q.fill();
  q.fillStyle=lg(q,-40,-90,40,-10,[0,'#d2cab5',.5,'#a8a18d',1,'#7d7766']);q.beginPath();q.arc(0,-50,41,0,TAU);q.moveTo(33,-50);q.arc(0,-50,33,0,TAU,true);q.fill();
  q.strokeStyle='rgba(40,34,24,.55)';q.lineWidth=.9;for(i=0;i<22;i++){a=i/22*TAU;q.beginPath();q.moveTo(Math.cos(a)*33,-50+Math.sin(a)*33);q.lineTo(Math.cos(a)*41,-50+Math.sin(a)*41);q.stroke()}
  q.strokeStyle='rgba(30,24,16,.5)';q.lineWidth=1.1;q.beginPath();q.arc(0,-50,41,0,TAU);q.stroke();q.beginPath();q.arc(0,-50,33,0,TAU);q.stroke();
  q.fillStyle='rgba(255,246,222,.12)';q.beginPath();q.arc(0,-50,41,-1.3,-.2);q.arc(0,-50,37,-.2,-1.3,true);q.fill();
  timber(q,-64,-96,6,87,'#6a5a48');timber(q,58,-96,6,87,'#6a5a48');
  eaveShade(q,-62,62,-92);roof(q,0,-92,62,16,9,th.t,{rl:48,tip:5});steps(q,34,3)}
function paintBuilding(q,i){var th=TH[i];if(i==4){bPortal(q,th);return}plinth(q,60);[bForge,bShop,bHerb,bHall][i](q,th)}

/* ---------- đồ vật ngoài trời ---------- */
function rr(q,x,y,w,h,r){q.beginPath();q.moveTo(x+r,y);q.lineTo(x+w-r,y);q.quadraticCurveTo(x+w,y,x+w,y+r);q.lineTo(x+w,y+h-r);q.quadraticCurveTo(x+w,y+h,x+w-r,y+h);q.lineTo(x+r,y+h);q.quadraticCurveTo(x,y+h,x,y+h-r);q.lineTo(x,y+r);q.quadraticCurveTo(x,y,x+r,y);q.closePath()}
function bush(q,x,y,u,seed,sz){var R=rng(seed);q.save();q.translate(x,y);q.scale(u*(sz||1),u*(sz||1));shadow(q,-3,1,22,3.5,.25);[[-10,-8,11,8],[9,-8,12,9],[0,-13,12,9]].forEach(function(l){lobe(q,l[0],l[1],l[2],l[3],34,2.6,R,PAL.leafD)});q.restore()}
function well(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,-4,2,36,5,.3);
  q.fillStyle=lg(q,-22,0,22,0,[0,'#6e685c',.55,'#a19a8a',1,'#bdb6a4']);q.beginPath();q.moveTo(-22,-24);q.lineTo(-22,0);q.quadraticCurveTo(0,7,22,0);q.lineTo(22,-24);q.closePath();q.fill();
  q.strokeStyle='rgba(40,36,28,.45)';q.lineWidth=.9;[-16,-8].forEach(function(yy){q.beginPath();q.moveTo(-22,yy);q.quadraticCurveTo(0,yy+7,22,yy);q.stroke()});for(var i=0;i<6;i++){var vx=-18+i*7.4;q.beginPath();q.moveTo(vx,-23+(i%2)*8);q.lineTo(vx,-16+(i%2)*8);q.stroke()}
  ell(q,0,-24,22,6.5,'#8e8878');ell(q,0,-24,17,4.6,'#16191d');ell(q,0,-23,15,3.4,'#243a4a');
  timber(q,-22,-68,4,44,'#5a4331');timber(q,18,-68,4,44,'#5a4331');timber(q,-24,-70,48,4,'#4a362a',1);
  roof(q,0,-70,19,12,7,['#76808a','#48525c'],{rl:8,tip:4});line(q,0,-66,0,-42,'#8a7550',1);
  q.fillStyle='#7a5a3a';q.beginPath();q.moveTo(-4,-41);q.lineTo(4,-41);q.lineTo(3,-33);q.lineTo(-3,-33);q.closePath();q.fill();line(q,-3.6,-38,3.6,-38,'#2c2824',1);q.restore()}
function fence(q,x0,x1,y,u,seed){var n=Math.max(2,Math.round((x1-x0)/(17*u))),i,R=rng(seed),px;
  [14,26].forEach(function(h){q.fillStyle=lg(q,0,y-h*u,0,y-h*u+3*u,[0,'#8a6a46',1,'#5a4330']);q.fillRect(x0,y-h*u,x1-x0,3*u)});
  for(i=0;i<=n;i++){px=x0+(x1-x0)*i/n;timber(q,px-2*u,y-34*u+R()*2*u,4*u,34*u,'#6a4e36')}}
function cart(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);shadow(q,0,1,38,5,.3);line(q,10,-18,42,-3,'#5a4331',2.8);
  q.fillStyle=lg(q,0,-30,0,-16,[0,'#9a7048',1,'#6a4a30']);q.beginPath();q.moveTo(-28,-30);q.lineTo(26,-30);q.lineTo(21,-15);q.lineTo(-23,-15);q.closePath();q.fill();q.strokeStyle='rgba(30,16,6,.45)';q.lineWidth=.8;for(var i=1;i<7;i++){q.beginPath();q.moveTo(-28+i*8,-30);q.lineTo(-23+i*6.6,-15);q.stroke()}
  sack(q,-12,-29,.95,'#cdbf98');sack(q,5,-29,.85,'#b9a87c');
  q.strokeStyle='#4a3626';q.lineWidth=3.2;q.beginPath();q.arc(0,-15,14,0,TAU);q.stroke();q.lineWidth=1.2;for(i=0;i<8;i++){var a=i/8*TAU;q.beginPath();q.moveTo(0,-15);q.lineTo(Math.cos(a)*14,-15+Math.sin(a)*14);q.stroke()}ell(q,0,-15,3,3,'#2e2218');q.restore()}
function paving(q,x0,x1,gy,u,seed){var R=rng(seed),x,row,y0,h,w,c;
  for(row=0;row<2;row++){y0=gy+(row?8.8:1)*u;h=7*u;x=x0-(row?7*u:0);
    while(x<x1){w=(13+R()*10)*u;if(R()<.1||x+w<x0){x+=w;continue}c=mix('#b8ae96',R()<.5?'#ffffff':'#000000',.04+R()*.1);
      q.fillStyle='rgba(50,40,26,.35)';rr(q,x+.2*u,y0+.4*u,w-.4*u,h,2*u);q.fill();q.fillStyle=lg(q,0,y0,0,y0+h,[0,mix(c,'#ffffff',.12),1,mix(c,'#000000',.16)]);rr(q,x+.9*u,y0+.4*u,w-1.8*u,h-1.2*u,2*u);q.fill();x+=w}}}
function gate(q,x,gy,u,txt){q.save();q.translate(x,gy);q.scale(u,u);shadow(q,-6,2,54,5,.3);
  [-30,30].forEach(function(px){stones(q,px-8,-9,px+8,0,'#8d877a',px+9,4.5);q.fillStyle='rgba(255,244,214,.3)';q.fillRect(px-8,-9,16,1.1);timber(q,px-4,-102,8,94,'#4f3a2b')});
  timber(q,-38,-103,76,7,'#46342a',1);q.fillStyle='#2b2018';q.fillRect(-19,-96,38,15);q.strokeStyle='#a1824e';q.lineWidth=.9;q.strokeRect(-18.2,-95.2,36.4,13.4);
  q.fillStyle='#f0e2b8';q.font='bold 11px '+FONT;q.textAlign='center';q.textBaseline='middle';for(var i=0;i<3;i++)q.fillText(txt.charAt(i),-11+i*11,-88.5);q.textBaseline='alphabetic';
  q.fillStyle=lg(q,0,-103,0,-96,[0,'rgba(24,14,8,.4)',1,'rgba(24,14,8,0)']);q.fillRect(-38,-96,76,6);
  roof(q,0,-106,34,17,13,['#707d85','#434e57'],{rl:15,tip:6});q.restore()}
function farHouse(q,x,y,w,h,u,seed){var R=rng(seed),hz='#c3c9c6',wl=mix('#e2dac6',hz,.4),rf=mix('#59636b',hz,.3);q.save();q.translate(x,y);q.scale(u,u);
  q.fillStyle=wl;q.fillRect(-w/2,-h,w,h);q.fillStyle='rgba(50,60,80,.16)';q.fillRect(-w/2,-h,w*.3,h);
  q.fillStyle=rf;q.beginPath();q.moveTo(-w/2-5,-h+1);q.quadraticCurveTo(-w/2+2,-h-1,-w/2+5,-h-h*.7);q.lineTo(w/2-5,-h-h*.7);q.quadraticCurveTo(w/2-2,-h-1,w/2+5,-h+1);q.closePath();q.fill();
  q.fillStyle='rgba(255,240,210,.16)';q.fillRect(w*.05,-h-h*.7,w*.4,1.5);q.fillStyle='rgba(20,24,30,.2)';q.fillRect(-w/2,-h+1,w,2);
  q.fillStyle=mix('#4a3a2e',hz,.35);q.fillRect(-2,-h*.55,4,h*.55);if(R()<.6)q.fillRect(w*.22,-h*.72,3.4,3);q.restore()}

/* ---------- THÁP THÍ LUYỆN 9 TẦNG (đăng ký window.TWPG để module 07 vẽ nhãn + bấm vào tháp) ---------- */
function tower9(q,cx,by,u){var N=9,T=[],y=-15,i,k,bw,bh,rh,hz='#d8d2c0';
  for(i=0;i<N;i++){bw=31-i*1.45;bh=i?24:32;rh=10-i*.2;T.push({y:y,bw:bw,bh:bh,rh:rh});y=y-bh-rh+3}
  var top=y,tw=Math.round(170*u),th=Math.round((-top+70)*u),o=mk(tw,th,DPR),p=o.q;p.translate(tw/2,th-4*u);p.scale(u,u);
  shadow(p,-8,1,66,8,.3);stones(p,-48,-7,48,0,'#8d877a',3,4.5);p.fillStyle='rgba(255,244,214,.3)';p.fillRect(-48,-7,96,1.1);stones(p,-40,-15,40,-7,'#98927f',4,4.2);p.fillStyle='rgba(255,244,214,.34)';p.fillRect(-40,-15,80,1.1);steps(p,16,2);
  for(i=0;i<N;i++){var a=T[i],yb=a.y,yt=yb-a.bh,np=i==0?6:4,bay=(a.bw*2-3.4)/np;bw=a.bw;
    p.fillStyle=lg(p,-bw,0,bw,0,[0,'#c6bca3',.55,'#e4dac2',1,'#efe7d1']);p.fillRect(-bw,yt,bw*2,a.bh);
    for(k=0;k<np;k++){var wx=-bw+k*bay+3.4+1.6,ww=bay-3.4-3.2;
      if(i==0&&k==np/2-1+0&&false){}
      if(i==0&&(k==np/2||k==np/2-1)){if(k==np/2-1){p.fillStyle='#2a1a10';p.fillRect(wx,yb-a.bh+8,bay*2-3,a.bh-8);p.fillStyle='rgba(255,196,110,.55)';p.fillRect(wx+1.5,yb-a.bh+10,bay*2-6,a.bh-12);p.strokeStyle='#4a3626';p.lineWidth=.8;p.beginPath();p.moveTo(wx+bay-1.5,yb-a.bh+8);p.lineTo(wx+bay-1.5,yb);p.stroke()}continue}
      p.fillStyle='#33241a';p.fillRect(wx-1,yt+5,ww+2,a.bh-11);p.fillStyle=lg(p,0,yt+6,0,yb-7,[0,'rgba(255,224,160,.92)',1,'rgba(240,190,120,.9)']);p.fillRect(wx,yt+6,ww,a.bh-13);p.strokeStyle='rgba(90,60,34,.8)';p.lineWidth=.7;p.beginPath();p.moveTo(wx+ww/2,yt+6);p.lineTo(wx+ww/2,yb-7);p.moveTo(wx,yt+a.bh/2);p.lineTo(wx+ww,yt+a.bh/2);p.stroke()}
    for(k=0;k<=np;k++)timber(p,-bw+k*bay,yt,3.4,a.bh,TIM);timber(p,-bw,yt,bw*2,3.2,TIM,1);
    p.fillStyle='#3a2c22';p.fillRect(-bw-3,yb-2.2,bw*2+6,2.4);p.strokeStyle='rgba(50,34,24,.85)';p.lineWidth=.8;p.beginPath();p.moveTo(-bw-3,yb-7);p.lineTo(bw+3,yb-7);for(var b=-bw-3;b<=bw+3;b+=4.4){p.moveTo(b,yb-2);p.lineTo(b,yb-7)}p.stroke();
    p.fillStyle=lg(p,0,yt,0,yt+10,[0,'rgba(24,14,8,.35)',1,'rgba(24,14,8,0)']);p.fillRect(-bw,yt+3,bw*2,10);
    roof(p,0,yt+2,bw+2,a.rh+2,9-i*.25,['#6b7880','#3f4a53'],{rl:i<N-1?T[i+1].bw+.5:bw*.4,tip:4})}
  var y0=top;line(p,0,y0+2,0,y0-34,'#46342a',2.2);for(k=0;k<6;k++)ell(p,0,y0-6-k*4.6,6.8-k*.9,1.9,k%2?'#a08a56':'#8a7646');ell(p,0,y0-36,2.2,2.2,'#b09a5c');
  p.globalCompositeOperation='source-atop';p.fillStyle='rgba(214,214,208,.2)';p.fillRect(0,0,tw,th);
  q.drawImage(o.c,cx-tw/2,by-th+4*u,tw,th);
  return{cx:cx,w:T[0].bw*u*1.6,top:by+(top-40)*u,tiers:T.map(function(a){return{x:cx,y:by+(a.y-a.bh*.5)*u}}),u:u,by:by}}

/* ---------- NỀN TĨNH ---------- */
function paintBG(q,W,H,gy,u,port){var r=rng(5),M={},i,k,x,sx=W*(port?.72:.8),sy=gy*.4,pal=PAL.far;
  q.fillStyle=lg(q,0,0,0,gy,[0,'#5b88b8',.3,'#8cb3d3',.62,'#cfd9d2',.85,'#efe0bf',1,'#f6e7c6']);q.fillRect(0,0,W,H);
  for(i=0;i<5;i++)ell(q,W*(.08+i*.2)+r()*60,gy*(.1+r()*.22),(120+r()*160)*u,(2.5+r()*3)*u,'rgba(255,255,255,'+(.1+r()*.08).toFixed(2)+')',-.03);
  q.fillStyle=rg(q,sx,sy,0,330*u,[0,'rgba(255,250,230,.95)',.05,'rgba(255,242,208,.75)',.22,'rgba(255,228,176,.3)',.6,'rgba(255,220,160,.09)',1,'rgba(255,214,150,0)']);q.fillRect(0,0,W,gy+10);
  q.fillStyle='rgba(255,253,244,.97)';q.beginPath();q.arc(sx,sy,14*u,0,TAU);q.fill();M.sun={x:sx,y:sy};
  ridge(q,W,gy,u,{base:226,amp:170,seed:5,sc:320,sharp:1.5,sa:.4,cs:[0,'#eef2f7',.22,'#c4d2e0',.6,'#aebfd2',1,'#d8e0e3'],spur:5,str:140,gap:90});mist(q,gy-214*u,W,u,.3,46);
  ridge(q,W,gy,u,{base:176,amp:150,seed:11,sc:230,sharp:1.2,sa:.5,cs:[0,'#c9d5e0',.4,'#9bb0c3',1,'#c8d4d6'],spur:4,str:180,gap:70});mist(q,gy-168*u,W,u,.34,38);
  ridge(q,W,gy,u,{base:128,amp:108,seed:23,sc:190,sharp:1.0,cs:[0,'#92a9b8',.5,'#7993a6',1,'#a9bbbd'],spur:4,str:220,gap:60,forest:1,fd:40,fs:.7,fn:.45,fpal:['#587562','#62806c','#729078','#86a48a']});mist(q,gy-118*u,W,u,.34,30);
  ridge(q,W,gy,u,{base:82,amp:62,seed:37,sc:150,cs:[0,'#587a62',1,'#869b7a'],spur:3,str:120,gap:50,forest:1,fd:46,fs:1,fn:1.1,fpal:pal});mist(q,gy-70*u,W,u,.26,20);
  var ln=noise(91),pts=[];q.fillStyle=lg(q,0,gy-60*u,0,gy,[0,'#7f9b63',.5,'#6c8a52',1,'#587a44']);q.beginPath();q.moveTo(0,gy+2);
  for(x=0;x<=W+8;x+=8){q.lineTo(x,gy-54*u+(fbm(ln,x/(90*u),3)-.5)*22*u)}q.lineTo(W,gy+2);q.closePath();q.fill();
  [[.095,26,12],[.215,32,14],[.335,26,12],[.665,28,13],[.715,32,14],[.885,26,12]].forEach(function(h,j){farHouse(q,W*h[0],gy-(30-(j%3)*5)*u,h[1],h[2],u*.9,60+j)});
  M.smk=[{x:W*.215+8*u,y:gy-58*u},{x:W*.715+8*u,y:gy-58*u}];
  [[.04,'b',.8],[.12,'p',.72],[.26,'b',.78],[.76,'b',.8],[.9,'p',.74],[.975,'b',.8]].forEach(function(t,j){if(t[1]=='b')tBroad(q,W*t[0],gy-8*u,u,70+j,{sz:t[2],pal:PAL.leafD});else tPine(q,W*t[0],gy-8*u,u,80+j,{sz:t[2]})});
  M.tw=tower9(q,(bxx(1)+bxx(2))/2*s,gy-60*u,u*.95);mist(q,gy-52*u,W,u,.22,14);bush(q,M.tw.cx-52*u,gy-56*u,u,115,.8);bush(q,M.tw.cx+54*u,gy-57*u,u,116,.7);
  /* đường đất */
  q.fillStyle=lg(q,0,gy,0,H,[0,'#b09870',.3,'#9d8660',1,'#715f44']);q.fillRect(0,gy,W,H-gy);
  for(i=0;i<90;i++)ell(q,r()*W,gy+Math.pow(r(),1.3)*(H-gy),(20+r()*60)*u,(3+r()*8)*u,r()<.5?'rgba(255,238,200,.07)':'rgba(60,44,28,.08)');
  [.3,.66].forEach(function(f){var y=gy+(H-gy)*f;q.fillStyle=lg(q,0,y-7*u,0,y+7*u,[0,'rgba(58,42,26,0)',.5,'rgba(58,42,26,.2)',1,'rgba(58,42,26,0)']);q.fillRect(0,y-7*u,W,14*u)});
  var np=Math.round(W*(H-gy)/(700*u*u)),pc=['#a08e6e','#ab9a78','#8a7a5e','#b5a584','#9a8868'],py,sc;
  for(i=0;i<np;i++){py=gy+Math.pow(r(),1.15)*(H-gy);sc=(.8+(py-gy)/(H-gy)*1.8)*u;ell(q,r()*W,py,(.8+r()*1.6)*sc,(.55+r()*.8)*sc,pc[(r()*5)|0],r()*3)}
  for(x=0;x<W;){var kw=(8+r()*10)*u;ell(q,x+kw/2,gy+.8*u,kw/2,3.4*u,mix('#a69e8a',r()<.5?'#ffffff':'#000000',.08+r()*.08));x+=kw}
  q.fillStyle=lg(q,0,gy,0,gy+5*u,[0,'rgba(40,30,16,.28)',1,'rgba(40,30,16,0)']);q.fillRect(0,gy+2*u,W,5*u);
  for(i=0;i<5;i++){var bxp=bxx(i)*s,aw=bww()*s*(i==4?1.08:1);shadow(q,bxp-12*u,gy+3*u,aw*.7,6*u,.34);paving(q,bxp-aw*.52,bxp+aw*.52,gy,u,300+i)}
  /* cây + đồ vật giữa các toà nhà */
  var f=function(a){return W*a};
  tBroad(q,f(.078),gy-3*u,u,101,{sz:1.1,pal:PAL.blossom,bark:'#4a3328'});
  tPine(q,f(.23),gy-2*u,u,102,{sz:1.2});bush(q,f(.255),gy,u,111,1);
  tBamboo(q,f(.595)+34*u,gy-3*u,u,103,6);well(q,f(.59),gy+2*u,u);rock(q,f(.59)-38*u,gy+1*u,11*u,8*u,121);
  bush(q,f(.375),gy,u,114,.9);rock(q,f(.445),gy+1*u,9*u,6*u,122);
  fence(q,f(.745),f(.765)+26*u,gy+1*u,u,7);cart(q,f(.775),gy+1*u,u);bush(q,f(.805),gy,u,112,.9);
  tBroad(q,f(.935),gy-3*u,u,105,{sz:1.05});bush(q,f(.905),gy,u,113,.9);
  tufts(q,0,W,gy+1*u,u,Math.round(W/u*.7),9);
  gate(q,44*u,gy,u,'新手村');gate(q,W-44*u,gy,u,'青雲村');
  return M}
/* ---------- bộ nhớ đệm ---------- */
var BGC=null,BGK='',META=null,BC={},CLD=[],GSP={};
function gs(c){return GSP[c]||(GSP[c]=glowSpr(c))}
function gl(x,y,r,c,a){g.globalAlpha=a;g.drawImage(gs(c),x-r,y-r,r*2,r*2);g.globalAlpha=1}
function cloudSpr(seed,u,sc){var w=340*u*sc,h=96*u*sc,o=mk(w,h,DPR),q=o.q,R=rng(seed),i,n=16,x,y,rx,ry;
  for(i=0;i<n;i++){x=w*(.14+R()*.72);y=h*(.6+(R()-.5)*.16);rx=(24+R()*38)*u*sc;ry=(13+R()*15)*u*sc;q.fillStyle=rg(q,x,y,1,rx,[0,'rgba(190,202,220,.8)',1,'rgba(190,202,220,0)']);q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.fill()}
  for(i=0;i<n+4;i++){x=w*(.14+R()*.72)+6*u*sc;y=h*(.46+(R()-.5)*.2);rx=(22+R()*34)*u*sc;ry=(12+R()*14)*u*sc;q.fillStyle=rg(q,x,y,1,rx,[0,'rgba(255,255,252,.92)',.6,'rgba(255,250,244,.5)',1,'rgba(255,250,244,0)']);q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.fill()}
  q.globalCompositeOperation='destination-in';q.fillStyle=lg(q,0,0,0,h,[0,'rgba(0,0,0,1)',.62,'rgba(0,0,0,1)',.8,'rgba(0,0,0,0)']);q.fillRect(0,0,w,h);q.fillStyle=lg(q,0,0,w,0,[0,'rgba(0,0,0,0)',.14,'rgba(0,0,0,1)',.86,'rgba(0,0,0,1)',1,'rgba(0,0,0,0)']);q.fillRect(0,0,w,h);
  return{c:o.c,w:w,h:h}}
function ensureBG(gy){var u=s,k=[W,H,Math.round(gy),u.toFixed(3),DPR,PORT,fontOK()].join('|');if(k===BGK&&BGC)return;BGK=k;var o=mk(W,H,DPR);META=paintBG(o.q,W,H,gy,u,PORT);BGC=o.c;if(META.tw)window.TWPG={cx:META.tw.cx,w:META.tw.w,top:META.tw.top};CLD=[cloudSpr(3,u,1),cloudSpr(8,u,.8),cloudSpr(15,u,1.15)]}
function bCache(i,k){var key=[s.toFixed(3),k.toFixed(3),DPR,fontOK()].join('|'),b=BC[i];if(b&&b.k===key)return b.c;var sc=s*k,o=mk(184*sc,190*sc,DPR);o.q.setTransform(sc*DPR,0,0,sc*DPR,92*sc*DPR,176*sc*DPR);paintBuilding(o.q,i);BC[i]={k:key,c:o.c};return o.c}
/* ---------- chuyển động nhẹ ---------- */
function puffs(x,y,n,t,h,dr,r0,r1,rgbs,al,spd){for(var j=0;j<n;j++){var p=(t*(spd||.006)+j/n)%1;g.fillStyle='rgba('+rgbs+','+(al*Math.sin(p*Math.PI)).toFixed(3)+')';g.beginPath();g.arc(x+Math.sin(t*.03+j*2)*dr*.4*p+dr*p,y-p*h,r0+p*(r1-r0),0,TAU);g.fill()}}
function crane(x,y,sc,ph,t,dir,al){var f=Math.sin(t*.085+ph),f2=Math.sin(t*.085+ph-.7);g.save();g.translate(x,y+Math.sin(t*.04+ph)*1.5*sc);g.scale(dir*sc,sc);g.globalAlpha=al;
  function wing(w,sh){var tipx=-5-(1-Math.abs(w))*5,tipy=-w*17,mx=-1,my=-w*8;g.fillStyle=sh?'#c9ccd2':'#f6f4ef';g.beginPath();g.moveTo(3,-1);g.quadraticCurveTo(mx+2,my-3,tipx,tipy);g.quadraticCurveTo(mx-4,my+6,-8,.5);g.closePath();g.fill();g.fillStyle='#2a2c34';g.beginPath();g.moveTo(tipx,tipy);g.quadraticCurveTo(mx-2.6,my+.5+(w>0?-2:2),tipx+2.4,tipy+(w>0?5:-5));g.closePath();g.fill()}
  wing(f2*.85,1);g.strokeStyle='#3a3c44';g.lineWidth=.9;g.lineCap='round';g.beginPath();g.moveTo(-5,1.6);g.lineTo(-19,3.8+f*.8);g.moveTo(-4,2);g.lineTo(-18,5+f*.8);g.stroke();
  g.fillStyle='#f6f4ef';g.beginPath();g.ellipse(0,0,9.5,3.1,-.06,0,TAU);g.fill();g.fillStyle='#2a2c34';g.beginPath();g.moveTo(-8,-.4);g.lineTo(-12,.4);g.lineTo(-8,1.6);g.closePath();g.fill();
  g.strokeStyle='#f1efe9';g.lineWidth=1.9;g.beginPath();g.moveTo(8,-.7);g.quadraticCurveTo(13,-1,14.6,-4.4);g.stroke();g.fillStyle='#f6f4ef';g.beginPath();g.arc(15.4,-5,1.5,0,TAU);g.fill();g.fillStyle='#b8312a';g.beginPath();g.arc(15.5,-6,.8,0,TAU);g.fill();g.strokeStyle='#3a3228';g.lineWidth=.8;g.beginPath();g.moveTo(16.6,-5);g.lineTo(20.4,-4.2);g.stroke();
  wing(f,0);g.restore()}
function hawk(x,y,sc,t,dir){var fl=Math.sin(t*.03)*.5+.5,wv=Math.sin(t*.12)*.12*(fl>.82?1:.15);g.save();g.translate(x,y);g.scale(dir*sc,sc);g.fillStyle='rgba(52,44,38,.88)';
  [-1,1].forEach(function(s2){g.beginPath();g.moveTo(1,-1);g.quadraticCurveTo(8*s2,-5-wv*30,s2*17,-2-wv*24);g.lineTo(s2*18,1-wv*20);g.quadraticCurveTo(s2*10,-1.4,s2*4,2.4);g.closePath();g.fill();for(var k=0;k<4;k++){g.beginPath();g.moveTo(s2*(13+k*1.6),-1-wv*22);g.lineTo(s2*(16+k*1.6),2.6-wv*18);g.lineTo(s2*(14+k*1.6),-.4-wv*20);g.closePath();g.fill()}});
  g.beginPath();g.ellipse(0,0,3,6.4,Math.PI/2,0,TAU);g.fill();g.beginPath();g.moveTo(-6,.4);g.lineTo(-12,-1);g.lineTo(-12,2.4);g.closePath();g.fill();g.beginPath();g.arc(6.2,-.2,1.7,0,TAU);g.fill();g.restore()}
function vnFlag(x,y,w,h,t){var n=20,i,amp=h*.15,k=function(xx){return Math.sin(xx*.21-t*.11)*amp*(.12+.88*xx/w)},dd=function(xx){return Math.cos(xx*.21-t*.11)*amp*.21*(.12+.88*xx/w)};
  g.save();g.translate(x,y);g.fillStyle='#da251d';g.beginPath();g.moveTo(0,0);for(i=0;i<=n;i++)g.lineTo(w*i/n,k(w*i/n));for(i=n;i>=0;i--)g.lineTo(w*i/n,h+k(w*i/n));g.closePath();g.fill();
  for(i=0;i<n;i++){var x0=w*i/n,x1=w*(i+1)/n,d=dd((x0+x1)/2);g.fillStyle=d<0?'rgba(40,0,0,'+Math.min(.3,-d*.9).toFixed(3)+')':'rgba(255,235,220,'+Math.min(.22,d*.7).toFixed(3)+')';g.beginPath();g.moveTo(x0,k(x0));g.lineTo(x1+.4,k(x1));g.lineTo(x1+.4,h+k(x1));g.lineTo(x0,h+k(x0));g.closePath();g.fill()}
  var cx=w/2,cy=h/2,R=h/3,r=R*.382;g.fillStyle='#ffff00';g.beginPath();for(i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr+k(px);i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.fill();
  g.strokeStyle='rgba(60,0,0,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(0,0);for(i=0;i<=n;i++)g.lineTo(w*i/n,k(w*i/n));g.stroke();g.restore()}
/* ---------- CỔNG MA THẦN (phong ấn trên không, vẽ lại cho hợp làng: vòng đá cổ + thừng + bùa; logic/toạ độ/chạm giữ nguyên ở world/02) ---------- */
var _gateDraw=(typeof gateDraw==='function')?gateDraw:null,GC={};
function gateSpr(st,u){var key=st+'|'+u.toFixed(3)+'|'+DPR,hit=GC[key];if(hit)return hit;
  var R=54*u,RX=R*.62,pad=24*u,w=2*(RX+pad),h=2*(R+pad),o=mk(w,h,DPR),q=o.q,cx=w/2,cy=h/2,i,Rn=rng(40+st),N=24,ro=9*u,
    P=[{s:'#6f6a76',rune:'rgba(196,176,230,.42)',core:['#130f1e','#1e1832','#07050d']},{s:'#5e5159',rune:'rgba(255,128,96,.9)',core:['#3c0e1c','#681832','#0c0207']},{s:'#84ad9d',rune:'rgba(240,255,250,.75)',core:['#e4faf4','#5abdb7','#0b3c48']}][st];
  function pt(a,k){return[cx+Math.cos(a)*(RX+k*RX/R),cy+Math.sin(a)*(R+k)]}
  q.save();q.translate(cx,cy);q.scale(.62,1);q.fillStyle=rg(q,0,0,2,R,[0,P.core[0],.6,P.core[1],1,P.core[2]]);q.beginPath();q.arc(0,0,R,0,TAU);q.fill();q.restore();
  for(i=0;i<N;i++){var a0=i/N*TAU,a1=(i+1)/N*TAU-.016,am=(a0+a1)/2,L=Math.cos(am+.9),k=ro*(.86+Rn()*.28),A=pt(a0,0),B=pt(a1,0),C=pt(a1,k),D=pt(a0,k);
    q.fillStyle=mix(P.s,L>0?'#ffffff':'#000000',Math.abs(L)*.2+Rn()*.07);q.beginPath();q.moveTo(A[0],A[1]);q.lineTo(B[0],B[1]);q.lineTo(C[0],C[1]);q.lineTo(D[0],D[1]);q.closePath();q.fill();
    q.strokeStyle='rgba(10,8,12,.55)';q.lineWidth=.9*u;q.beginPath();q.moveTo(A[0],A[1]);q.lineTo(D[0],D[1]);q.stroke();
    var M=pt(am,k*.5),nx=Math.cos(am),ny=Math.sin(am);q.strokeStyle=P.rune;q.lineWidth=1.1*u;q.lineCap='round';q.beginPath();q.moveTo(M[0]-ny*2.4*u,M[1]+nx*2.4*u);q.lineTo(M[0]+ny*2.4*u,M[1]-nx*2.4*u);q.moveTo(M[0]-nx*1.8*u,M[1]-ny*1.8*u);q.lineTo(M[0]+nx*1.8*u,M[1]+ny*1.8*u);q.stroke();
    if(Rn()<.5&&Math.sin(am)>.2&&Math.cos(am)<.3){q.fillStyle='rgba(84,122,64,'+(.3+Rn()*.25).toFixed(2)+')';var mm=pt(am,k*.3);q.beginPath();q.ellipse(mm[0],mm[1],3.4*u,2.2*u,am,0,TAU);q.fill()}}
  q.strokeStyle='rgba(8,6,10,.6)';q.lineWidth=1.3*u;q.beginPath();for(i=0;i<=60;i++){var aa=i/60*TAU,pp=pt(aa,0);i?q.lineTo(pp[0],pp[1]):q.moveTo(pp[0],pp[1])}q.stroke();q.beginPath();for(i=0;i<=60;i++){var ab=i/60*TAU,pq=pt(ab,ro);i?q.lineTo(pq[0],pq[1]):q.moveTo(pq[0],pq[1])}q.stroke();
  for(i=0;i<4;i++){var ac=Rn()*TAU,c0=pt(ac,Rn()*ro*.4);q.strokeStyle='rgba(8,6,10,.5)';q.lineWidth=.9*u;q.beginPath();q.moveTo(c0[0],c0[1]);q.lineTo(c0[0]+(Rn()-.5)*9*u,c0[1]+(Rn()-.5)*9*u);q.lineTo(c0[0]+(Rn()-.5)*14*u,c0[1]+(Rn()-.5)*12*u);q.stroke()}
  if(st<2){var a2=st?-2.9:-.2,a3=-.25;q.lineCap='round';q.strokeStyle='#a38a58';q.lineWidth=3.4*u;q.beginPath();for(i=0;i<=40;i++){var ar=-3.05+i/40*(st?1.0:2.9),pr=pt(ar,ro*.5);i?q.lineTo(pr[0],pr[1]):q.moveTo(pr[0],pr[1])}q.stroke();
    q.strokeStyle='rgba(60,44,22,.7)';q.lineWidth=3.4*u;q.setLineDash([2.2*u,2.8*u]);q.stroke();q.setLineDash([])}
  var o2={c:o.c,w:w,h:h};GC[key]=o2;return o2}
function drawGate(){var ready=lgReq(),done=lgDone(),x=gateX()*s,y=gateY(),t=fr,u=s,R=54*u,RX=R*.62,st=done?2:ready?1:0,pu=.5+.5*Math.sin(t*.08),sp=gateSpr(st,u),i,m,a;
  g.save();g.globalCompositeOperation='lighter';var gc=['120,100,170','255,70,90','110,230,235'][st],ga=[.13,.2+.12*pu,.3][st];g.fillStyle=rg(g,x,y,R*.3,R*2.1,[0,'rgba('+gc+','+ga+')',1,'rgba('+gc+',0)']);g.beginPath();g.arc(x,y,R*2.1,0,TAU);g.fill();g.restore();
  g.drawImage(sp.c,x-sp.w/2,y-sp.h/2,sp.w,sp.h);
  g.save();g.beginPath();g.ellipse(x,y,RX,R,0,0,TAU);g.clip();g.translate(x,y);g.scale(.62,1);
  var sc=['160,140,215','255,130,150','236,255,250'][st],sa=[.22,.34,.5][st],sv=st==1?.034:.018;
  for(m=0;m<3;m++){g.strokeStyle='rgba('+sc+','+(sa-m*.04)+')';g.lineWidth=(2.8-m*.4)*u;g.beginPath();for(a=0;a<4.6;a+=.16){var an=a*1.1+m*TAU/3+t*sv,rr=2*u+a*R/5;a?g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):g.moveTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.stroke()}
  g.globalCompositeOperation='lighter';g.fillStyle=rg(g,0,0,1,R*.5,[0,'rgba('+sc+','+(.18+.1*pu)+')',1,'rgba('+sc+',0)']);g.beginPath();g.arc(0,0,R*.5,0,TAU);g.fill();
  if(st==1)for(i=0;i<9;i++){var p=(t*.008+i/9)%1,ex=Math.sin(i*2.3)*R*.7,ey=R*.8-p*R*1.7;g.fillStyle='rgba(255,'+(150+i*8)+',90,'+(.8*Math.sin(p*Math.PI)).toFixed(2)+')';g.beginPath();g.arc(ex,ey,(1+i%3*.5)*u,0,TAU);g.fill()}
  g.restore();
  if(st<2)for(i=0;i<5;i++){var ta=-2.55+i*.5,tx=x+Math.cos(ta)*(RX+4.5*u),ty=y+Math.sin(ta)*(R+4.5*u);g.save();g.translate(tx,ty);g.rotate(Math.sin(t*.04+i*1.3)*.1);g.fillStyle='#4a3a28';g.fillRect(-1.8*u,-1.2*u,3.6*u,2.4*u);
    g.fillStyle=st?'#d9a66c':'#e8d68e';g.beginPath();g.moveTo(-2.7*u,0);g.lineTo(2.7*u,0);g.lineTo(2.7*u,(st?11:15)*u);if(st){g.lineTo(1*u,(13)*u);g.lineTo(-.4*u,10.5*u);g.lineTo(-2.7*u,14*u)}else g.lineTo(-2.7*u,15*u);g.closePath();g.fill();
    g.fillStyle='#a8322a';g.fillRect(-.7*u,2*u,1.4*u,3.2*u);g.fillRect(-1.7*u,6.6*u,3.4*u,1.1*u);if(!st)g.fillRect(-.7*u,9*u,1.4*u,3.2*u);
    if(st){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,140,50,'+(.5+.3*Math.sin(t*.2+i)).toFixed(2)+')';g.beginPath();g.arc(0,12*u,2.4*u,0,TAU);g.fill()}g.restore()}
  g.save();g.font='bold '+Math.max(12,15*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineJoin='round';g.lineWidth=4;g.strokeStyle='rgba(20,14,8,.85)';
  var l1=done?'🌀 Cổng Linh Giới':'👹 Cổng Ma Thần',l2=done?'chạm để bước vào':ready?'chạm để khiêu chiến':'chưa đủ điều kiện',by=y+R+22*s+Math.sin(t*.1)*3,ty=y-R-16*s;
  g.strokeText(l1,x,ty);g.fillStyle=ready||done?'#fff4d8':'#d6d0e2';g.fillText(l1,x,ty);g.font=Math.max(10,12*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.lineWidth=3.2;g.strokeText(l2,x,by);g.fillStyle=done?'#c8f4ee':ready?'#ffc9b8':'#b0a8c2';g.fillText(l2,x,by);g.restore()}
function drawBld(i){var t=fr,k=bww()/120,sc=s*k,j;g.save();g.translate(bxx(i)*s,GY);g.scale(sc,sc);g.drawImage(bCache(i,k),-92,-176,184,190);
  if(i==0){g.save();g.globalCompositeOperation='lighter';gl(-12,-19,32,'rgba(255,128,40,1)',.42+.14*Math.sin(t*.13)+.07*Math.sin(t*.31));gl(-12,-17,14,'rgba(255,190,90,1)',.4+.12*Math.sin(t*.2));g.restore();
    for(j=0;j<3;j++){var fh=7+4*Math.sin(t*.21+j*2.1),fx=-16+j*5.6;g.fillStyle='rgba(255,'+(196-j*20)+',90,.85)';g.beginPath();g.moveTo(fx-2.4,-13);g.quadraticCurveTo(fx-1,-13-fh*.6,fx+Math.sin(t*.17+j)*1.2,-13-fh);g.quadraticCurveTo(fx+1.4,-13-fh*.5,fx+2.4,-13);g.closePath();g.fill()}
    var ph=t%80;if(ph<16){var pp=ph/16;for(j=0;j<5;j++){var aa=-.4-j*.55,rd=pp*(8+j*2);g.fillStyle='rgba(255,'+(210-j*12)+',110,'+(1-pp).toFixed(2)+')';g.beginPath();g.arc(14+Math.cos(aa)*rd,-31+Math.sin(aa)*rd+pp*pp*9,1.1,0,TAU);g.fill()}}
    puffs(40,-156,7,t,52,10,3,11,'214,214,218',.3,.0042)}
  else if(i==2){g.save();g.globalCompositeOperation='lighter';gl(41,-13,13,'rgba(255,120,40,1)',.3+.12*Math.sin(t*.17));g.restore();puffs(41,-43,6,t,36,8,3,8,'250,250,252',.34,.007)}
  else if(i==3){vnFlag(57.5,-139,34,23,t)}
  else if(i==4){var cx=0,cy=-50,R=32.5,a,m,rr2;g.save();g.beginPath();g.arc(cx,cy,R,0,TAU);g.clip();
    for(m=0;m<3;m++){g.strokeStyle='rgba(236,250,255,'+(.3-m*.04)+')';g.lineWidth=2.6-m*.3;g.beginPath();for(a=0;a<4.6;a+=.16){rr2=2+a*6.6;var an=a*1.15+m*TAU/3+t*.03;a?g.lineTo(cx+Math.cos(an)*rr2,cy+Math.sin(an)*rr2):g.moveTo(cx+Math.cos(an)*rr2,cy+Math.sin(an)*rr2)}g.stroke()}
    g.globalCompositeOperation='lighter';gl(cx,cy,30,'rgba(210,240,255,1)',.34+.1*Math.sin(t*.08));for(j=0;j<7;j++){var p2=(t*.008+j/7)%1,an2=j*.9+p2*5,r3=R*(1-p2);g.fillStyle='rgba(220,244,255,'+(.8*Math.sin(p2*Math.PI)).toFixed(2)+')';g.beginPath();g.arc(cx+Math.cos(an2)*r3,cy+Math.sin(an2)*r3,1.2,0,TAU);g.fill()}g.restore();
    g.save();g.globalCompositeOperation='lighter';gl(cx,cy,62,'rgba(120,190,255,1)',.16+.07*Math.sin(t*.07));g.restore()}
  g.font=LBLF;g.textAlign='center';g.textBaseline='alphabetic';g.lineJoin='round';g.lineWidth=4;g.strokeStyle='rgba(20,14,8,.85)';g.fillStyle='#fff4d8';var ly=i==4?-122:-148;g.strokeText(BN[i],0,ly);g.fillText(BN[i],0,ly);g.restore()}
function towerFx(t,M){var T=M.tw,u=T.u,cur=-1;try{if(typeof twS==='function'){var st=twS();cur=st.p>=90?8:(st.p/10|0)}}catch(e){}
  if(cur>=0){var q=T.tiers[Math.min(8,cur)];g.save();g.globalCompositeOperation='lighter';gl(q.x,q.y,34*u,'rgba(130,225,255,1)',.24+.1*Math.sin(t*.1));g.restore()}}
function drawBG(gy){ensureBG(gy);var t=fr,u=s,M=META,i,c;TT.drawn=fr;g.drawImage(BGC,0,0,W,H);
  for(i=0;i<3;i++){c=CLD[i];var x=((t*(.09+i*.045)*u+i*W*.43)%(W+c.w*2))-c.w;g.globalAlpha=[.8,.6,.7][i];g.drawImage(c.c,x,gy*(.07+i*.075),c.w,c.h);g.globalAlpha=1}
  for(i=0;i<M.smk.length;i++)puffs(M.smk[i].x,M.smk[i].y,5,t+i*40,24*u,6*u,1.5*u,5*u,'236,232,224',.22,.003);
  if(M.tw)towerFx(t,M);
  var sp=W+360*u,fx=((t*.22*u+W*.18)%sp)-180*u,k;for(k=0;k<5;k++){var o=k==0?0:Math.ceil(k/2)*(k%2?1:-1);crane(fx-Math.abs(o)*24*u,gy*.27+o*14*u+Math.sin(t*.012)*5*u,1.05*u,k*1.3,t,1,1)}
  var fx2=W-(((t*.13*u+W*.55)%sp)-180*u);for(k=0;k<3;k++){crane(fx2+k*22*u,gy*.19+k*7*u,.62*u,k*2.1+1,t,-1,.62)}
  hawk(W*.34+Math.cos(t*.004)*W*.12,gy*.32+Math.sin(t*.008)*gy*.05,1.15*u,t,Math.sin(t*.004)>0?-1:1)}
/* ---------- gắn vào game (an toàn: lỗi → quay về hình cũ) ---------- */
var fails=0;function bad(e){TT.err=e;if(++fails>=3)TT.on=false;try{console.warn('[Thôn Tân Thủ]',e)}catch(x){}}
xbg=function(gy,m){if(m===-1&&TT.on&&g){try{drawBG(gy);return}catch(e){bad(e)}}return _xbg.apply(this,arguments)};
bld=function(i){if(TT.on){try{drawBld(i);return}catch(e){bad(e)}}return _bld.apply(this,arguments)};
if(_gateDraw){gateDraw=function(){if(TT.on){try{drawGate();return}catch(e){bad(e)}}return _gateDraw.apply(this,arguments)}}
TT.rebuild=function(){BGK='';BC={};GC={}};
})();
