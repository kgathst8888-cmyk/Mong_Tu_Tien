/* ===== 🏮 THÔN TÂN THỦ — vẽ lại phong cách cổ trang Trung Hoa (world/56-thon-tan-thu.js) =====
 * Thay hình vẽ của làng (xbg(gy,-1) = nền; bld(i) = 5 toà nhà) bằng bản chi tiết hơn. Không đổi logic/toạ độ/tương tác:
 * vị trí & kích thước toà nhà vẫn theo bxx(i)/bww(), mặt đất vẫn ở GY, các cổng/portal/NPC của module khác vẫn vẽ chồng lên như cũ.
 * Cách làm: phần TĨNH (trời, núi mực, đảo, chùa xa, cây, đá lát, cổng, 5 toà nhà) vẽ 1 lần vào canvas đệm theo (W,H,s,DPR) rồi drawImage mỗi khung;
 * phần ĐỘNG vẽ nhẹ trực tiếp: mây, hạc, cánh hoa, đom đóm, khói, thác, đèn lồng, lò rèn, hơi thuốc, cổng truyền tống...
 * Tắt/bật: window.TTT.on=false (quay về hình cũ). Hỏng gì cũng tự quay về hình cũ (try/catch).
 * Phụ thuộc: xbg, bld, bxx, bww, vw, BN, W,H,s,GY,DPR,PORT,fr,g. */
(function(){
'use strict';
if(typeof xbg!=='function'||typeof bld!=='function'||typeof bxx!=='function'||typeof g==='undefined')return;
var TAU=Math.PI*2,_xbg=xbg,_bld=bld,TT={on:true},FONT='Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';
window.TTT=TT;
/* ---------- tiện ích ---------- */
function rng(a){a>>>=0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function lg(q,x0,y0,x1,y1,st){var o=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function rg(q,x,y,r0,r1,st){var o=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function mk(w,h,d){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));var q=c.getContext('2d');q.setTransform(d,0,0,d,0,0);return{c:c,q:q}}
function fontOK(){try{return document.fonts&&document.fonts.check('20px "Ma Shan Zheng"')?1:0}catch(e){return 0}}
function ell(q,x,y,rx,ry,col){q.fillStyle=col;q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.fill()}
function poly(q,p,col){q.fillStyle=col;q.beginPath();q.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)q.lineTo(p[i],p[i+1]);q.closePath();q.fill()}
function glowSpr(c,r){var o=mk(64,64,1),q=o.q;q.fillStyle=rg(q,32,32,1,32,[0,'rgba(255,255,255,1)',.2,c,.55,c.replace(/[\d.]+\)$/,'.25)'),1,c.replace(/[\d.]+\)$/,'0)')]);q.fillRect(0,0,64,64);return o.c}
/* ---------- núi mực (đỉnh nhọn, nét cọ cun, sương) ---------- */
function ridge(q,W,base,amp,seed,c0,c1,u,o){var r=rng(seed),ph=[r()*9,r()*9,r()*9,r()*9],pts=[],n=Math.ceil(W/5)+2,i;
  for(i=0;i<=n;i++){var x=i*5,a=(1-Math.abs(Math.sin(x*.0059/u*1+ph[0])))*.5+(1-Math.abs(Math.sin(x*.0137/u+ph[1])))*.3+(1-Math.abs(Math.sin(x*.029/u+ph[2])))*.14+r()*.03,env=.82+.18*Math.sin(x*.0021/u+ph[3]);pts.push(x,base-amp*Math.pow(a,1.12)*env)}
  q.fillStyle=lg(q,0,base-amp,0,base+10*u,[0,c0,1,c1]);q.beginPath();q.moveTo(0,base+60*u);for(i=0;i<pts.length;i+=2)q.lineTo(pts[i],pts[i+1]);q.lineTo(W,base+60*u);q.closePath();q.fill();
  q.strokeStyle='rgba(30,12,50,.4)';q.lineWidth=1.2*u;q.beginPath();for(i=0;i<pts.length;i+=2)i?q.lineTo(pts[i],pts[i+1]):q.moveTo(pts[i],pts[i+1]);q.stroke();
  q.lineCap='round';for(i=0;i<(o&&o.tx||150);i++){var k=((r()*(pts.length/2-2))|0)*2,x1=pts[k],y1=pts[k+1]+r()*(base-pts[k+1])*.8,L=(6+r()*16)*u,sl=pts[k+3]-pts[k+1],dir=sl>0?1:-1;
    q.strokeStyle=r()<.5?'rgba(20,6,40,'+(.06+r()*.1)+')':'rgba(255,200,170,'+(.05+r()*.07)+')';q.lineWidth=(.8+r()*1.2)*u;q.beginPath();q.moveTo(x1,y1);q.lineTo(x1+dir*L*.35,y1+L);q.stroke()}
  return pts}
function ridgeY(pts,x){var k=Math.max(0,Math.min(pts.length/2-2,Math.floor(x/5)))*2,t=(x-pts[k])/5;return pts[k+1]+(pts[k+3]-pts[k+1])*t}
function peakIn(pts,x0,x1){var bx=x0,by=1e9;for(var i=0;i<pts.length;i+=2)if(pts[i]>=x0&&pts[i]<=x1&&pts[i+1]<by){by=pts[i+1];bx=pts[i]}return bx}
function mist(q,y,W,u,a,h){q.fillStyle=lg(q,0,y-h*u,0,y+h*u,[0,'rgba(255,220,200,0)',.5,'rgba(255,225,215,'+a+')',1,'rgba(255,220,200,0)']);q.fillRect(0,y-h*u,W,h*2*u)}
/* ---------- chùa tháp / đình bóng xa ---------- */
function roofS(q,cx,y,hw,rise,col){q.fillStyle=col;q.beginPath();q.moveTo(cx-hw-hw*.28,y-rise*.45);q.quadraticCurveTo(cx-hw*.8,y+rise*.12,cx-hw*.5,y);q.lineTo(cx+hw*.5,y);q.quadraticCurveTo(cx+hw*.8,y+rise*.12,cx+hw+hw*.28,y-rise*.45);q.quadraticCurveTo(cx+hw*.5,y-rise*.35,cx+hw*.12,y-rise);q.lineTo(cx-hw*.12,y-rise);q.quadraticCurveTo(cx-hw*.5,y-rise*.35,cx-hw-hw*.28,y-rise*.45);q.fill()}
function pagodaS(q,x,y,u,n,col,lit){q.save();q.translate(x,y);q.scale(u,u);for(var i=0;i<n;i++){var w=34-i*4.5,yy=-i*24;q.fillStyle=col;q.fillRect(-w/2,yy-18,w,18);if(lit){q.fillStyle='rgba(255,205,120,.9)';q.fillRect(-2.5,yy-14,5,8)}roofS(q,0,yy-18,w*.62+6,10,col)}
  q.fillStyle=col;q.fillRect(-1,-n*24-14,2,12);q.beginPath();q.arc(0,-n*24-16,2.2,0,TAU);q.fill();q.restore()}
function hallS(q,x,y,u,col){q.save();q.translate(x,y);q.scale(u,u);q.fillStyle=col;q.fillRect(-22,-16,44,16);q.fillStyle='rgba(255,205,120,.85)';q.fillRect(-4,-12,8,10);roofS(q,0,-16,30,13,col);roofS(q,0,-34,20,10,col);q.fillRect(-1,-48,2,6);q.restore()}
/* ---------- cây: đào, liễu, trúc, tùng ---------- */
function peach(q,x,y,u,seed){var r=rng(seed);q.strokeStyle='#4a2a22';q.lineCap='round';q.lineWidth=7*u;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x-10*u,y-34*u,x+6*u,y-62*u);q.stroke();q.lineWidth=3.5*u;q.beginPath();q.moveTo(x+2*u,y-36*u);q.quadraticCurveTo(x+22*u,y-50*u,x+34*u,y-74*u);q.stroke();q.beginPath();q.moveTo(x-4*u,y-44*u);q.quadraticCurveTo(x-24*u,y-58*u,x-34*u,y-70*u);q.stroke();
  var cs=[[x+4*u,y-84*u,34*u],[x+34*u,y-82*u,24*u],[x-32*u,y-80*u,24*u],[x+14*u,y-100*u,20*u]];
  for(var j=0;j<cs.length;j++)for(var i=0;i<46;i++){var a=r()*TAU,d=Math.sqrt(r())*cs[j][2],px=cs[j][0]+Math.cos(a)*d,py=cs[j][1]+Math.sin(a)*d*.72,v=r();q.fillStyle=v<.5?'rgba(255,174,196,.88)':v<.8?'rgba(255,205,220,.9)':v<.93?'rgba(255,240,245,.95)':'rgba(214,100,138,.9)';q.beginPath();q.arc(px,py,(3+r()*4.5)*u,0,TAU);q.fill()}}
function willow(q,x,y,u,seed){var r=rng(seed);q.strokeStyle='#4a3a28';q.lineCap='round';q.lineWidth=6*u;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+8*u,y-30*u,x-2*u,y-58*u);q.stroke();
  for(var i=0;i<34;i++){var sx=x-2*u+(r()-.5)*54*u,sy=y-(56+r()*14)*u,L=(36+r()*34)*u,sw=(r()-.5)*14*u;q.strokeStyle=r()<.5?'rgba(120,170,90,.8)':'rgba(160,200,110,.75)';q.lineWidth=(1.1+r()*1.1)*u;q.beginPath();q.moveTo(sx,sy);q.quadraticCurveTo(sx+sw,sy+L*.5,sx+sw*1.4,sy+L);q.stroke()}
  for(i=0;i<22;i++){q.fillStyle='rgba(110,160,80,.9)';q.beginPath();q.arc(x-2*u+(r()-.5)*44*u,y-(58+r()*12)*u,(4+r()*4)*u,0,TAU);q.fill()}}
function bamboo(q,x,y,u,seed,n){var r=rng(seed);for(var i=0;i<n;i++){var bx=x+(i-n/2)*7*u+(r()-.5)*5*u,h=(90+r()*70)*u,lean=(r()-.5)*10*u;q.strokeStyle=lg(q,bx-3*u,0,bx+3*u,0,[0,'#4a7a3a',.5,'#9ac46a',1,'#4a7a3a']);q.lineWidth=(3.2+r()*1.2)*u;q.lineCap='butt';q.beginPath();q.moveTo(bx,y);q.lineTo(bx+lean,y-h);q.stroke();
    q.strokeStyle='rgba(40,70,30,.8)';q.lineWidth=1*u;for(var k=1;k<6;k++){var yy=y-h*k/6,xx=bx+lean*k/6;q.beginPath();q.moveTo(xx-3*u,yy);q.lineTo(xx+3*u,yy);q.stroke()}
    for(k=0;k<9;k++){var ly=y-h*(.45+r()*.55),lx=bx+lean*(1-(y-ly)/h*-0),d=r()<.5?-1:1,L=(14+r()*12)*u;q.fillStyle=r()<.5?'rgba(96,150,70,.92)':'rgba(130,180,90,.9)';q.beginPath();q.moveTo(lx,ly);q.quadraticCurveTo(lx+d*L*.6,ly-L*.28,lx+d*L,ly+L*.22);q.quadraticCurveTo(lx+d*L*.55,ly+L*.06,lx,ly);q.fill()}}}
function pineT(q,x,y,u,seed){var r=rng(seed);q.strokeStyle='#3a2418';q.lineCap='round';q.lineWidth=6*u;q.beginPath();q.moveTo(x,y);q.bezierCurveTo(x-10*u,y-26*u,x+12*u,y-44*u,x-2*u,y-72*u);q.stroke();
  var pads=[[x-2*u,y-76*u,30*u],[x+24*u,y-52*u,24*u],[x-26*u,y-48*u,22*u],[x+8*u,y-34*u,18*u]];
  pads.forEach(function(p){for(var l=0;l<3;l++){q.fillStyle=['#1c4a34','#256040','#2e7a4e'][l];q.beginPath();q.ellipse(p[0],p[1]-l*4*u,p[2]*(1-l*.12),p[2]*.3,0,0,TAU);q.fill()}
    q.strokeStyle='rgba(20,60,40,.6)';q.lineWidth=.9*u;for(var k=0;k<14;k++){var a=r()*TAU;q.beginPath();q.moveTo(p[0],p[1]);q.lineTo(p[0]+Math.cos(a)*p[2],p[1]+Math.sin(a)*p[2]*.3);q.stroke()}})}
function roofRow(q,y,u,W,seed,col,lit,hmin,hmax){var r=rng(seed),x=-30*u;while(x<W+30*u){var w=(30+r()*34)*u,h=(hmin+r()*(hmax-hmin))*u;q.fillStyle=col;q.fillRect(x,y-h,w,h);if(lit&&r()<.6){q.fillStyle='rgba(255,200,120,.75)';q.fillRect(x+w*.3,y-h*.7,w*.14,h*.3);q.fillRect(x+w*.58,y-h*.7,w*.14,h*.3)}roofS(q,x+w/2,y-h,w*.52,10*u,col);x+=w+(r()*14-5)*u}}
/* ---------- đảo bay ---------- */
function island(q,x,y,u,seed){var r=rng(seed);q.save();q.translate(x,y);q.scale(u,u);
  q.fillStyle=rg(q,0,30,2,110,[0,'rgba(190,140,255,.28)',1,'rgba(190,140,255,0)']);q.beginPath();q.arc(0,30,110,0,TAU);q.fill();
  q.fillStyle=lg(q,0,0,0,90,[0,'#7a5a62',.5,'#4a3452',1,'#281a3a']);q.beginPath();q.moveTo(-64,0);for(var i=0;i<7;i++){var k=i/6;q.lineTo(-64+k*128*.5-(i%2?5:0)+k*30,6+Math.sin(k*3)*8+k*42*(1-k)*2.2+(i%2?10:0))}
  q.lineTo(2,92);q.lineTo(-12,58);q.lineTo(-36,40);q.lineTo(-64,0);q.moveTo(64,0);q.lineTo(52,22);q.lineTo(34,38);q.lineTo(14,60);q.lineTo(2,92);q.lineTo(64,0);q.fill();
  q.strokeStyle='rgba(20,8,34,.5)';q.lineWidth=1.2;q.beginPath();for(i=0;i<14;i++){var a=-50+r()*100;q.moveTo(a,6+r()*14);q.lineTo(a*.7,26+r()*38)}q.stroke();
  q.fillStyle=lg(q,0,-12,0,10,[0,'#8ec06a',1,'#4a8a4a']);q.beginPath();q.ellipse(0,0,64,12,0,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.15)';q.beginPath();q.ellipse(0,-3,50,5,0,0,TAU);q.fill();
  q.strokeStyle='rgba(110,170,80,.9)';q.lineWidth=1.6;q.beginPath();for(i=0;i<16;i++){var vx=-56+i*7.4+r()*3;q.moveTo(vx,6);q.lineTo(vx+(r()-.5)*5,10+r()*22)}q.stroke();
  pineT(q,-34,-3,1,seed+1);q.restore();q.save();q.translate(x,y);q.scale(u*.34,u*.34);pineT(q,-40,-6,1,seed+2);pineT(q,70,-8,.8,seed+3);q.restore();hallS(q,x+6*u,y-6*u,u*.62,'#3a1e58');
  q.strokeStyle='rgba(255,255,255,.4)';q.lineWidth=2*u;q.beginPath();q.moveTo(x+30*u,y+30*u);q.lineTo(x+30*u,y+110*u);q.stroke()}
/* ---------- đèn đá & cổng tam quan ---------- */
function stoneLamp(q,x,y,u){q.save();q.translate(x,y);q.scale(u,u);q.fillStyle='rgba(0,0,0,.25)';q.beginPath();q.ellipse(0,1,15,4,0,0,TAU);q.fill();
  q.fillStyle=lg(q,-10,0,10,0,[0,'#a89c84',.5,'#d0c4a8',1,'#8a7e68']);q.fillRect(-10,-8,20,8);q.fillRect(-4,-30,8,22);q.fillRect(-9,-34,18,5);
  q.fillStyle='#2a1a10';q.fillRect(-8,-52,16,18);q.fillStyle='rgba(255,204,110,.95)';q.fillRect(-5,-49,10,12);q.strokeStyle='#5a3a20';q.lineWidth=1;q.strokeRect(-5,-49,10,12);q.beginPath();q.moveTo(0,-49);q.lineTo(0,-37);q.moveTo(-5,-43);q.lineTo(5,-43);q.stroke();
  roofS(q,0,-52,15,9,'#6a5e4c');q.fillStyle='#8a7e68';q.beginPath();q.arc(0,-63,3,0,TAU);q.fill();q.restore()}
function colRed(q,x0,y0,w,h){q.fillStyle=lg(q,x0,0,x0+w,0,[0,'#7a1c18',.35,'#d8402e',.6,'#b02a22',1,'#681410']);q.fillRect(x0,y0,w,h);q.fillStyle='rgba(255,220,160,.22)';q.fillRect(x0+w*.22,y0,w*.12,h)}
function gold(q,x,y,w,h){q.fillStyle=lg(q,x,y,x,y+h,[0,'#fff0a8',.5,'#d9a43a',1,'#8a6420']);q.fillRect(x,y,w,h)}
function brackets(q,x,y,u,col){for(var i=0;i<3;i++){q.fillStyle=i%2?'#2a6a7a':'#b22a22';q.fillRect(x-(5+i*3.5)*u,y-i*5*u,(10+i*7)*u,4.2*u);gold(q,x-(5+i*3.5)*u,y-i*5*u+4.2*u,(10+i*7)*u,1*u)}}
function gate(q,x,gy,u,dir,txt,cp){q.save();q.fillStyle='rgba(0,0,0,.28)';q.beginPath();q.ellipse(x,gy+2*u,24*u,5*u,0,0,TAU);q.fill();
  var top=gy-150*u;colRed(q,x-5*u,top,10*u,150*u);gold(q,x-6*u,gy-118*u,12*u,2.4*u);gold(q,x-6*u,gy-40*u,12*u,2.4*u);
  q.fillStyle=lg(q,x-12*u,0,x+12*u,0,[0,'#8a7e68',.5,'#cfc3a6',1,'#7a6e58']);q.fillRect(x-11*u,gy-18*u,22*u,18*u);q.strokeStyle='rgba(40,28,16,.5)';q.lineWidth=1*u;q.strokeRect(x-11*u,gy-18*u,22*u,18*u);
  q.fillStyle='#b8ac90';q.beginPath();q.arc(x+dir*11*u,gy-10*u,9*u,0,TAU);q.fill();q.strokeStyle='rgba(40,28,16,.55)';q.beginPath();q.arc(x+dir*11*u,gy-10*u,6*u,0,TAU);q.stroke();q.beginPath();q.arc(x+dir*11*u,gy-10*u,2.4*u,0,TAU);q.stroke();
  brackets(q,x,top+2*u,u*1.15);q.fillStyle='#8a1e18';q.fillRect(x-9*u,top-2*u,18*u,5*u);gold(q,x-9*u,top-2*u,18*u,1.4*u);roofS(q,x,top-3*u,24*u,13*u,cp||'#3a4458');gold(q,x-1.2*u,top-17*u,2.4*u,8*u);
  var bl=34*u,bx=dir>0?x+5*u:x-5*u-bl;colRed(q,bx,gy-134*u,bl,8*u);gold(q,bx,gy-134*u,bl,1.6*u);gold(q,bx,gy-127.6*u,bl,1.6*u);for(var i=0;i<4;i++){q.fillStyle=i%2?'#2a7a8a':'#e8c860';q.fillRect(bx+(3+i*8)*u,gy-131.6*u,4*u,3*u)}
  var n=txt[0].length,pw=19*u,ph=(n*15+6)*u,px=dir>0?x+8*u:x-8*u-pw,py=gy-124*u;q.strokeStyle='#8a1e18';q.lineWidth=1.2*u;q.beginPath();q.moveTo(px+3*u,gy-126*u);q.lineTo(px+3*u,py);q.moveTo(px+pw-3*u,gy-126*u);q.lineTo(px+pw-3*u,py);q.stroke();
  q.fillStyle='#2a1810';q.fillRect(px,py,pw,ph);q.strokeStyle='#d9a43a';q.lineWidth=1.5*u;q.strokeRect(px+1.5*u,py+1.5*u,pw-3*u,ph-3*u);q.fillStyle='#ffe28a';q.font='bold '+(13*u)+'px '+FONT;q.textAlign='center';q.textBaseline='middle';for(i=0;i<n;i++)q.fillText(txt[0][i],px+pw/2,py+(3+7.5+i*15)*u);
  var cw=9*u,cx=dir>0?x-5*u-2*u-cw:x+5*u+2*u;q.fillStyle='#b81e1e';q.fillRect(cx,gy-116*u,cw,52*u);q.strokeStyle='#d9a43a';q.lineWidth=.8*u;q.strokeRect(cx+.5*u,gy-115.5*u,cw-1*u,51*u);q.fillStyle='#ffe28a';q.font='bold '+(7.6*u)+'px '+FONT;for(i=0;i<4;i++)q.fillText(txt[1][i],cx+cw/2,gy-109*u+i*11.6*u);q.restore()}
/* ---------- NỀN TĨNH ---------- */
function paintBG(q,W,H,gy,u,port){var r=rng(5),meta={},i;
  q.fillStyle=lg(q,0,0,0,gy,[0,'#201858',.28,'#5a2f86',.5,'#c04f7c',.72,'#f08a6c',.9,'#ffc88a',1,'#ffe8b8']);q.fillRect(0,0,W,H);
  for(i=0;i<46;i++){q.fillStyle='rgba(255,240,230,'+(.15+r()*.5)+')';q.beginPath();q.arc(r()*W,r()*gy*.34,(.5+r()*.9)*u,0,TAU);q.fill()}
  var sx=W*(port?.7:.82),sy=gy*.34;meta.sun={x:sx,y:sy};
  q.globalCompositeOperation='lighter';q.fillStyle=rg(q,sx,sy,4*u,230*u,[0,'rgba(255,238,200,.95)',.12,'rgba(255,204,140,.55)',.45,'rgba(255,140,110,.16)',1,'rgba(255,120,100,0)']);q.beginPath();q.arc(sx,sy,230*u,0,TAU);q.fill();
  for(i=0;i<26;i++){var a=i/26*TAU+.07,w=.022+(i%3)*.01,ex=sx+Math.cos(a)*560*u,ey=sy+Math.sin(a)*560*u;q.fillStyle=lg(q,sx,sy,ex,ey,[0,'rgba(255,214,150,.13)',.55,'rgba(255,190,140,.05)',1,'rgba(255,170,130,0)']);q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+Math.cos(a-w)*560*u,sy+Math.sin(a-w)*560*u);q.lineTo(sx+Math.cos(a+w)*560*u,sy+Math.sin(a+w)*560*u);q.fill()}
  q.globalCompositeOperation='source-over';q.fillStyle=lg(q,sx,sy-26*u,sx,sy+26*u,[0,'#fffbe8',1,'#ffcf80']);q.beginPath();q.arc(sx,sy,26*u,0,TAU);q.fill();[[36,.4],[48,.26],[64,.14]].forEach(function(k){q.strokeStyle='rgba(255,226,160,'+k[1]+')';q.lineWidth=1.4*u;q.beginPath();q.arc(sx,sy,k[0]*u,0,TAU);q.stroke()});
  for(i=0;i<5;i++){q.fillStyle='rgba(255,160,150,'+(.16+i*.02)+')';q.beginPath();q.ellipse(W*(.1+i*.22),gy*(.52+(i%3)*.07),W*.2,(6+i%2*4)*u,0,0,TAU);q.fill()}
  var p1=ridge(q,W,gy-165*u,170*u,11,'#8a5aa6','#e08a7c',u,{tx:130});mist(q,gy-150*u,W,u,.5,26);
  pagodaS(q,peakIn(p1,W*.36,W*.52),0,u*.6,3,'#4a2a6a',true);
  var p2=ridge(q,W,gy-128*u,142*u,23,'#5c3a82','#a85a88',u,{tx:150});
  var qx=peakIn(p2,W*.14,W*.3);pagodaS(q,qx,ridgeY(p2,qx)+3*u,u*.95,5,'#2a1650',true);qx=peakIn(p2,W*.56,W*.72);hallS(q,qx,ridgeY(p2,qx)+2*u,u*.85,'#2a1650');qx=peakIn(p2,W*.84,W*.97);pagodaS(q,qx,ridgeY(p2,qx)+3*u,u*.62,3,'#2a1650',true);
  var wx=peakIn(p2,W*.36,W*.5)+10*u,wy0=ridgeY(p2,wx)+10*u,wy1=gy-112*u;q.fillStyle=lg(q,0,wy0,0,wy1,[0,'rgba(255,255,255,.95)',1,'rgba(255,240,240,.3)']);q.beginPath();q.moveTo(wx-4*u,wy0);q.lineTo(wx+4*u,wy0);q.lineTo(wx+7*u,wy1);q.lineTo(wx-7*u,wy1);q.fill();meta.wf={x:wx,y0:wy0,y1:wy1,w:6*u};
  q.fillStyle='rgba(255,240,240,.45)';q.beginPath();q.ellipse(wx,wy1,26*u,7*u,0,0,TAU);q.fill();mist(q,gy-112*u,W,u,.45,22);
  [[.1,.26,.9,31],[.5,.1,.7,37],[.96,.36,.55,41]].forEach(function(a){island(q,W*a[0],gy*a[1],u*a[2],a[3])});
  var p3=ridge(q,W,gy-96*u,92*u,37,'#3e2c62','#74467a',u,{tx:100});mist(q,gy-82*u,W,u,.4,18);
  for(i=0;i<22;i++){var px=r()*W;pineT(q,px,ridgeY(p3,px)+3*u,u*.26,60+i)}
  roofRow(q,gy-8*u,u*.9,W,101,'#52305e',true,14,24);mist(q,gy-6*u,W,u,.32,14);roofRow(q,gy-1*u,u,W,202,'#30203f',true,18,30);
  [[.23,'pine'],[.41,'bam'],[.59,'peach'],[.77,'wil']].forEach(function(t){var x=W*t[0],y=gy-2*u;if(t[1]=='pine')pineT(q,x,y,u*1.6,71);else if(t[1]=='bam')bamboo(q,x,y,u*1.25,72,6);else if(t[1]=='peach')peach(q,x,y,u*1.25,73);else willow(q,x,y,u*1.5,74)});
  peach(q,W*.045,gy-2*u,u*1.7,75);peach(q,W*.955,gy-2*u,u*1.55,76);bamboo(q,W*.1,gy-2*u,u*1.1,77,4);bamboo(q,W*.9,gy-2*u,u*1.1,78,4);
  /* mặt đất */
  q.fillStyle=lg(q,0,gy-16*u,0,gy,[0,'#6a8c4a',1,'#3a5a30']);q.fillRect(0,gy-16*u,W,17*u);q.strokeStyle='rgba(120,170,80,.85)';q.lineWidth=1.2*u;q.beginPath();for(i=0;i<W/4;i++){var gx=i*4+r()*3;q.moveTo(gx,gy);q.lineTo(gx+(r()-.5)*3*u,gy-(4+r()*8)*u)}q.stroke();
  for(i=0;i<46;i++){var fx=r()*W,fy=gy-r()*8*u,cl=['#ff8aa8','#ffd25a','#fff0f5','#ff6a6a'][(r()*4)|0];q.fillStyle=cl;q.beginPath();q.arc(fx,fy,1.6*u,0,TAU);q.fill()}
  var top=gy+9*u;q.fillStyle='#5a4c3c';q.fillRect(0,gy,W,H-gy);
  q.fillStyle=lg(q,0,gy,0,top,[0,'#d4c8a6',1,'#a49676']);q.fillRect(0,gy,W,9*u);q.strokeStyle='rgba(50,36,20,.45)';q.lineWidth=1*u;for(i=0;i<W/(34*u);i++){q.beginPath();q.moveTo(i*34*u,gy);q.lineTo(i*34*u,top);q.stroke()}q.fillStyle='rgba(255,255,255,.22)';q.fillRect(0,gy,W,1.6*u);q.fillStyle='rgba(30,16,6,.45)';q.fillRect(0,top-1.6*u,W,1.6*u);
  var r2=rng(777),rows=Math.max(7,Math.round((H-gy)/(34*u))),tones=['#b8a884','#ad9d7c','#a2926f','#bfae8a','#948565'];
  for(var rr=0;rr<rows;rr++){var y0=top+(H-top)*Math.pow(rr/rows,1.5),y1=top+(H-top)*Math.pow((rr+1)/rows,1.5),w=(30+rr*15)*u,x=-(rr%2)*w/2,hh=y1-y0;
    while(x<W){var sw=w*(.8+r2()*.4),c=tones[(r2()*5)|0],xa=x+1.2,ya=y0+1.2,wa=sw-2.4,ha=hh-2.4,rd=Math.min(6*u,ha*.4);
      q.fillStyle=lg(q,0,ya,0,ya+ha,[0,c,1,'#6e604a']);q.beginPath();q.moveTo(xa+rd,ya);q.lineTo(xa+wa-rd,ya);q.quadraticCurveTo(xa+wa,ya,xa+wa,ya+rd);q.lineTo(xa+wa,ya+ha-rd);q.quadraticCurveTo(xa+wa,ya+ha,xa+wa-rd,ya+ha);q.lineTo(xa+rd,ya+ha);q.quadraticCurveTo(xa,ya+ha,xa,ya+ha-rd);q.lineTo(xa,ya+rd);q.quadraticCurveTo(xa,ya,xa+rd,ya);q.fill();
      q.fillStyle='rgba(255,255,255,.16)';q.fillRect(xa+rd,ya+.6,wa-2*rd,1.4*u);var v=r2();if(v<.15){q.fillStyle='rgba(90,140,60,.42)';q.beginPath();q.ellipse(xa+wa*(.2+r2()*.6),ya+ha*.9,wa*.22,ha*.14,0,0,TAU);q.fill()}else if(v<.24){q.strokeStyle='rgba(40,26,12,.45)';q.lineWidth=.9*u;q.beginPath();q.moveTo(xa+wa*.3,ya+ha*.2);q.lineTo(xa+wa*.5,ya+ha*.5);q.lineTo(xa+wa*.45,ya+ha*.85);q.stroke()}
      x+=sw}}
  q.fillStyle=lg(q,0,top,0,H,[0,'rgba(255,200,150,.12)',.5,'rgba(30,14,8,.1)',1,'rgba(20,8,4,.5)']);q.fillRect(0,top,W,H-top);
  for(i=0;i<46;i++){q.fillStyle=r2()<.5?'rgba(255,180,200,.8)':'rgba(255,240,245,.8)';q.beginPath();q.ellipse(r2()*W,top+r2()*(H-top),2.6*u,1.3*u,r2()*3,0,TAU);q.fill()}
  meta.lamps=[];for(i=0;i<4;i++){var lx=W*(.23+.18*i);stoneLamp(q,lx,gy+8*u,u*1.15);meta.lamps.push({x:lx,y:gy+8*u-44*u*1.15})}
  gate(q,26*u,gy,u*1.15,1,['新手村','修身養性'],'#3a4458');gate(q,W-26*u,gy,u*1.15,-1,['仙緣','問道長生'],'#3a4458');
  var ax=26*u,ay=gy-150*u*1.15+2*u,bx=W-26*u,sag=20*u;meta.rope={ax:ax,ay:ay,cx:W/2,cy:ay+sag*2,bx:bx,by:ay};
  q.strokeStyle='#5a3a20';q.lineWidth=2*u;q.beginPath();q.moveTo(ax,ay);q.quadraticCurveTo(W/2,ay+sag*2,bx,ay);q.stroke();
  for(i=1;i<42;i++){var t=i/42;if(Math.abs((t*9+.5)%1-.5)<.1)continue;var rx=(1-t)*(1-t)*ax+2*(1-t)*t*W/2+t*t*bx,ry=(1-t)*(1-t)*ay+2*(1-t)*t*meta.rope.cy+t*t*ay;poly(q,[rx-4*u,ry,rx+4*u,ry,rx,ry+12*u],i%2?'#d22a2a':'#e8b83a')}
  bush(q,W*.02,H-4*u,u*1.4,91);bush(q,W*.985,H-4*u,u*1.3,92);return meta}
function bush(q,x,y,u,seed){var r=rng(seed);for(var i=0;i<26;i++){q.fillStyle=['#2f6a3e','#3a8048','#245a34'][(r()*3)|0];q.beginPath();q.arc(x+(r()-.5)*54*u,y-r()*22*u,(6+r()*7)*u,0,TAU);q.fill()}
  for(i=0;i<16;i++){var fx=x+(r()-.5)*56*u,fy=y-r()*28*u,c=r()<.5?'#ff6a8a':'#ffd25a';q.fillStyle=c;q.beginPath();q.arc(fx,fy,2.6*u,0,TAU);q.fill();q.fillStyle='rgba(255,255,255,.7)';q.beginPath();q.arc(fx,fy,1*u,0,TAU);q.fill()}}
/* ---------- TOÀ NHÀ (toạ độ cục bộ: gốc ở giữa chân nhà; nhà rộng ±64, cao ~150) ---------- */
function roofHip(q,cx,yE,hw,rise,over,c1,c2,rows){var xL=cx-hw-over,xR=cx+hw+over,yT=yE-9,rl=hw*.6,j,t;
  var path=function(){q.beginPath();q.moveTo(xL,yT);q.quadraticCurveTo(xL+over*.55,yE+4,xL+over+8,yE+4);q.lineTo(xR-over-8,yE+4);q.quadraticCurveTo(xR-over*.55,yE+4,xR,yT);q.quadraticCurveTo(cx+hw+2,yE-rise*.55,cx+rl,yE-rise);q.lineTo(cx-rl,yE-rise);q.quadraticCurveTo(cx-hw-2,yE-rise*.55,xL,yT);q.closePath()};
  path();q.fillStyle=lg(q,0,yE-rise,0,yE+4,[0,c1,1,c2]);q.fill();q.save();path();q.clip();
  for(j=0;j<=rows;j++){t=j/rows;var xt=cx-rl+2*rl*t,xb=cx-(hw+over-6)+2*(hw+over-6)*t;q.strokeStyle='rgba(0,0,0,.3)';q.lineWidth=1;q.beginPath();q.moveTo(xt,yE-rise);q.quadraticCurveTo((xt+xb)/2+(xb-xt)*.05,yE-rise*.38,xb,yE+4);q.stroke();q.strokeStyle='rgba(255,255,255,.14)';q.beginPath();q.moveTo(xt+1.2,yE-rise);q.quadraticCurveTo((xt+xb)/2+(xb-xt)*.05+1.2,yE-rise*.38,xb+1.2,yE+4);q.stroke()}
  for(j=1;j<5;j++){var yy=yE-rise+(rise+4)*j/5;q.strokeStyle='rgba(0,0,0,'+(.1+j*.02)+')';q.beginPath();q.moveTo(xL,yy+3);q.lineTo(xR,yy+3);q.stroke()}
  q.fillStyle='rgba(255,255,255,.12)';q.fillRect(xL,yE-rise,xR-xL,rise*.18);q.restore();path();q.strokeStyle='rgba(24,10,12,.6)';q.lineWidth=1.3;q.stroke();
  for(var x=xL+over+9;x<=xR-over-9;x+=6.4){ell(q,x,yE+4.4,2.7,2.3,'#2a1a1a');ell(q,x,yE+4.4,1.2,1,'#e8c050')}
  q.fillStyle='#8a1e18';q.fillRect(xL+over*.5+4,yE+6.4,xR-xL-over-8,2.6);gold(q,xL+over*.5+4,yE+8.6,xR-xL-over-8,.9);
  q.strokeStyle=lg(q,0,yE-rise-3,0,yE-rise+2,[0,'#fff0a8',1,'#c8962e']);q.lineWidth=3.6;q.lineCap='round';q.beginPath();q.moveTo(cx-rl,yE-rise);q.lineTo(cx+rl,yE-rise);q.stroke();
  [-1,1].forEach(function(d){var ex=cx+d*rl;q.fillStyle='#d8a838';q.beginPath();q.moveTo(ex,yE-rise+2);q.quadraticCurveTo(ex+d*9,yE-rise+1,ex+d*8,yE-rise-12);q.quadraticCurveTo(ex+d*3,yE-rise-5,ex-d*2,yE-rise-4);q.fill();q.fillStyle='#8a1e18';q.beginPath();q.arc(ex+d*6.5,yE-rise-8,1.4,0,TAU);q.fill()})}
function platform(q,hw,steps){q.fillStyle='rgba(0,0,0,.3)';q.beginPath();q.ellipse(0,2,hw+10,9,0,0,TAU);q.fill();
  q.fillStyle=lg(q,0,-14,0,0,[0,'#e6dabc',.12,'#cdbf9f',1,'#8e8268']);q.fillRect(-hw,-13,hw*2,13);q.fillStyle='#eee2c4';q.fillRect(-hw-3,-15,hw*2+6,3);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(-hw-3,-12,hw*2+6,1);
  q.strokeStyle='rgba(60,44,24,.4)';q.lineWidth=.8;for(var x=-hw+14;x<hw;x+=14){q.beginPath();q.moveTo(x,-12);q.lineTo(x,0);q.stroke()}
  if(steps){for(var j=0;j<3;j++){var w=22+j*5;q.fillStyle=lg(q,0,-12+j*4,0,-8+j*4,[0,'#e2d6b8',1,'#a89c80']);q.fillRect(-w,-12+j*4,w*2,4);q.fillStyle='rgba(60,30,20,.3)';q.fillRect(-w,-9+j*4,w*2,1)}q.fillStyle='rgba(176,30,30,.85)';q.fillRect(-9,-12,18,12);q.fillStyle='rgba(255,210,120,.7)';q.fillRect(-9,-12,2,12);q.fillRect(7,-12,2,12)}}
function beam(q,hw,y){colRed(q,-hw,y,hw*2,8);gold(q,-hw,y,hw*2,1.4);gold(q,-hw,y+6.6,hw*2,1.4);for(var i=0;i<Math.floor(hw*2/8);i++){q.fillStyle=i%3==0?'#2a8a9a':i%3==1?'#f0d070':'#e8e0d0';q.fillRect(-hw+3+i*8,y+2.6,4.4,2.8)}}
function lattice(q,x,y,w,h,warm){q.fillStyle='#3a1a10';q.fillRect(x-1.6,y-1.6,w+3.2,h+3.2);q.fillStyle=warm||'rgba(255,214,140,.92)';q.fillRect(x,y,w,h);q.strokeStyle='#6a2a18';q.lineWidth=1;q.beginPath();for(var i=1;i<5;i++){q.moveTo(x+w*i/5,y);q.lineTo(x+w*i/5,y+h);q.moveTo(x,y+h*i/5);q.lineTo(x+w,y+h*i/5)}q.stroke();q.strokeStyle='rgba(106,42,24,.55)';q.beginPath();q.moveTo(x,y);q.lineTo(x+w,y+h);q.moveTo(x+w,y);q.lineTo(x,y+h);q.stroke()}
function plaque(q,x,y,w,h,ch,fs){q.fillStyle='#2a1810';q.fillRect(x-w/2,y,w,h);q.strokeStyle='#d9a43a';q.lineWidth=1.5;q.strokeRect(x-w/2+1.5,y+1.5,w-3,h-3);q.fillStyle='#ffe28a';q.font='bold '+fs+'px '+FONT;q.textAlign='center';q.textBaseline='middle';q.fillText(ch,x,y+h/2+.5);gold(q,x-w/2-2,y-1.5,w+4,2);
  q.strokeStyle='#8a1e18';q.lineWidth=1;q.beginPath();q.moveTo(x-w/2+5,y-1.5);q.lineTo(x-w/2+5,y-8);q.moveTo(x+w/2-5,y-1.5);q.lineTo(x+w/2-5,y-8);q.stroke()}
function jar(q,x,y,s,c){q.fillStyle=lg(q,x-9*s,0,x+9*s,0,[0,c[0],.45,c[1],1,c[0]]);q.beginPath();q.moveTo(x-4*s,y-18*s);q.quadraticCurveTo(x-11*s,y-10*s,x-9*s,y-3*s);q.quadraticCurveTo(x-7*s,y,x-4*s,y);q.lineTo(x+4*s,y);q.quadraticCurveTo(x+7*s,y,x+9*s,y-3*s);q.quadraticCurveTo(x+11*s,y-10*s,x+4*s,y-18*s);q.fill();q.fillStyle='#b81e1e';q.fillRect(x-5*s,y-22*s,10*s,5*s);q.fillStyle='#e8c050';q.fillRect(x-5*s,y-18.6*s,10*s,1.2*s)}
function shell(q,th,hw){platform(q,70,true);q.fillStyle=lg(q,0,-84,0,-12,[0,th.wall,1,mixc(th.wall,'#8a7a60',.35)]);q.fillRect(-hw,-84,hw*2,72);q.strokeStyle='rgba(80,60,40,.14)';q.lineWidth=.8;for(var y=-72;y<-12;y+=9){q.beginPath();q.moveTo(-hw,y);q.lineTo(hw,y);q.stroke()}}
function mixc(a,b,t){var A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),r=((A>>16)*(1-t)+(B>>16)*t)|0,g2=((A>>8&255)*(1-t)+(B>>8&255)*t)|0,bl=((A&255)*(1-t)+(B&255)*t)|0;return'rgb('+r+','+g2+','+bl+')'}
function pillars(q){[-54,-18,18,54].forEach(function(x){colRed(q,x-3.6,-84,7.2,72);q.fillStyle='#8a7e68';q.fillRect(x-5.2,-15,10.4,4);gold(q,x-4,-30,8,1.6);gold(q,x-4,-70,8,1.6)})}
function eaves(q,hw){beam(q,hw+4,-84);[-54,-18,18,54].forEach(function(x){brackets(q,x,-88,.85)});for(var x=-36;x<=36;x+=36){q.fillStyle='#b22a22';q.fillRect(x-7,-91,14,3);gold(q,x-7,-88,14,.8)}}
function attic(q,th,ch,fs){q.fillStyle=lg(q,0,-130,0,-112,[0,th.wall,1,mixc(th.wall,'#8a7a60',.3)]);q.fillRect(-34,-130,68,20);colRed(q,-36,-130,6,20);colRed(q,30,-130,6,20);lattice(q,-26,-126,12,12);lattice(q,14,-126,12,12);plaque(q,0,-129,30,15,ch,12);beam(q,38,-132);roofHip(q,0,-140,36,22,13,th.r1,th.r2,10)}
/* các gian */
function forgeBays(q){
  q.fillStyle='#3a2216';q.fillRect(-51,-76,30,60);q.strokeStyle='rgba(0,0,0,.4)';q.lineWidth=1;for(var y=-72;y<-16;y+=8){q.beginPath();q.moveTo(-51,y);q.lineTo(-21,y);q.stroke()}
  [[-44,-30,-.5],[-34,-28,.5]].forEach(function(a){q.save();q.translate(a[0]+8,-46);q.rotate(a[2]);q.fillStyle='#d8dce8';q.fillRect(-1.6,-24,3.2,34);q.fillStyle='#e8c050';q.fillRect(-5,10,10,2.4);q.fillStyle='#5a2a1a';q.fillRect(-1.6,12.4,3.2,10);q.restore()});
  q.strokeStyle='#8a6a40';q.lineWidth=2;q.beginPath();q.moveTo(-40,-66);q.lineTo(-28,-20);q.moveTo(-26,-66);q.lineTo(-38,-20);q.stroke();poly(q,[-41,-70,-39,-66,-37,-70,-39,-76],'#cfd6e4');poly(q,[-27,-70,-25,-66,-23,-70,-25,-76],'#cfd6e4');ell(q,-32,-32,9,9,'#8a3a22');ell(q,-32,-32,6,6,'#d9a43a');ell(q,-32,-32,2.4,2.4,'#6a2a1a');
  q.fillStyle=lg(q,0,-76,0,-12,[0,'#140806',1,'#3a1a10']);q.fillRect(-14,-76,28,64);q.fillStyle='#6a4a3a';q.fillRect(-16,-64,32,6);
  q.fillStyle=lg(q,0,-60,0,-12,[0,'#5a2a1e',1,'#2a120c']);q.beginPath();q.moveTo(-14,-12);q.lineTo(-14,-46);q.quadraticCurveTo(0,-64,14,-46);q.lineTo(14,-12);q.fill();q.strokeStyle='rgba(0,0,0,.45)';q.lineWidth=.9;for(var yy=-52;yy<-14;yy+=6){q.beginPath();q.moveTo(-14,yy);q.lineTo(14,yy);q.stroke()}
  q.fillStyle=lg(q,0,-40,0,-14,[0,'#ff9a30',.5,'#e0501a',1,'#6a1a0a']);q.beginPath();q.moveTo(-8,-14);q.lineTo(-8,-32);q.quadraticCurveTo(0,-44,8,-32);q.lineTo(8,-14);q.fill();
  q.fillStyle='#2a2e3a';q.beginPath();q.moveTo(-8,-20);q.lineTo(8,-20);q.lineTo(6,-17);q.lineTo(-6,-17);q.closePath();q.fill();q.fillStyle='#4a4e5a';q.fillRect(-9,-23,5,3);q.fillStyle='#3a2216';q.fillRect(-5,-17,10,5);
  q.fillStyle='#2a2e3a';q.fillRect(22,-34,22,22);q.strokeStyle='#8a8e9a';q.lineWidth=1;for(var j=0;j<3;j++){q.beginPath();q.arc(33,-34+j*0,0,0,0);q.stroke()}
  q.fillStyle='#5a4a3a';q.fillRect(24,-34,18,22);q.fillStyle=lg(q,0,-34,0,-12,[0,'#4a7aa8',1,'#2a4a6a']);q.fillRect(26,-30,14,16);q.fillStyle='#8a8e9a';q.fillRect(24,-36,18,3);
  [[44,-12,9,5],[51,-12,7,4],[38,-12,6,3.4]].forEach(function(a){q.fillStyle=lg(q,0,-12-a[3]*1.6,0,-12,[0,'#4a4a56',1,'#14141a']);q.beginPath();q.ellipse(a[0],-12,a[2],a[3]*1.7,0,Math.PI,TAU);q.fill();q.fillStyle='rgba(255,140,60,.55)';q.beginPath();q.arc(a[0]-a[2]*.2,-12-a[3]*.9,1,0,TAU);q.arc(a[0]+a[2]*.3,-12-a[3]*.5,.8,0,TAU);q.fill()});
  q.strokeStyle='#8a8e9a';q.lineWidth=1.4;q.beginPath();q.moveTo(46,-76);q.lineTo(46,-60);q.moveTo(50,-76);q.lineTo(50,-58);q.stroke();q.fillStyle='#6a3a22';q.fillRect(44,-64,8,5)}
function shopBays(q){
  jar(q,-44,-12,1.1,['#6a3a1a','#c0763a']);jar(q,-30,-12,.9,['#4a5a3a','#8aa05a']);jar(q,-38,-30,.8,['#6a3a1a','#d09a52']);jar(q,-26,-12,.001,['#000','#000']);q.fillStyle='#8a5a30';q.fillRect(-52,-34,32,3);
  q.fillStyle='#e0d2b0';q.fillRect(-14,-76,28,64);q.fillStyle='#5a3a22';q.fillRect(-14,-60,28,3);q.fillRect(-14,-46,28,3);[[-12,-72],[-2,-72],[8,-72]].forEach(function(a,i){jar(q,a[0]+3,a[1]+12,.5,['#7a3a1a','#e0a050'])});
  for(var i=0;i<4;i++){jar(q,-9+i*6,-46,.42,['#5a6a3a','#a0b46a'])}
  q.fillStyle=lg(q,0,-30,0,-12,[0,'#8a5a30',1,'#5a3a1c']);q.fillRect(-18,-30,36,18);q.strokeStyle='rgba(30,16,6,.55)';q.lineWidth=.9;q.strokeRect(-16,-28,32,14);q.beginPath();q.moveTo(0,-28);q.lineTo(0,-14);q.stroke();gold(q,-18,-32,36,2.4);
  [['#c8322a',-11],['#3a7ac8',-4],['#e8c050',3],['#4aa86a',10]].forEach(function(a){ell(q,a[1],-37,3.6,4.4,a[0]);ell(q,a[1],-37,1.4,2,'rgba(255,255,255,.5)')});
  q.strokeStyle='#8a1e18';q.lineWidth=1.2;for(i=0;i<5;i++){q.beginPath();q.moveTo(-40+i*0,-76);q.lineTo(-40,-76);q.stroke()}
  q.fillStyle='#d8c898';for(i=0;i<5;i++)ell(q,22+i*6.4,-62,2.8,4,i%2?'#c8402a':'#e8b83a');q.strokeStyle='#5a3a22';q.lineWidth=1;q.beginPath();q.moveTo(20,-76);q.lineTo(52,-76);q.stroke();for(i=0;i<5;i++){q.beginPath();q.moveTo(22+i*6.4,-76);q.lineTo(22+i*6.4,-66);q.stroke()}
  q.fillStyle='#8a5a30';q.beginPath();q.ellipse(36,-24,11,12,0,0,TAU);q.fill();q.strokeStyle='#d9a43a';q.lineWidth=1.4;q.beginPath();q.ellipse(36,-24,11,3.4,0,0,TAU);q.stroke();q.beginPath();q.moveTo(26,-30);q.quadraticCurveTo(36,-34,46,-30);q.stroke();
  q.strokeStyle='#5a3a22';q.lineWidth=3;q.beginPath();q.moveTo(66,-12);q.lineTo(66,-134);q.stroke();q.lineWidth=2.2;q.beginPath();q.moveTo(66,-130);q.lineTo(46,-130);q.stroke();q.fillStyle='#d9a43a';q.beginPath();q.arc(66,-136,3,0,TAU);q.fill();q.beginPath();q.arc(46,-130,2,0,TAU);q.fill()}
function herbBays(q){
  q.fillStyle='#5a3a22';q.fillRect(-14,-76,28,62);q.fillStyle='#8a5a34';for(var r=0;r<7;r++)for(var c=0;c<5;c++){var dx=-12+c*5.2,dy=-74+r*8.6;q.fillRect(dx,dy,4.6,7.6);q.fillStyle='#e8c060';q.fillRect(dx+1.7,dy+1.4,1.2,1.2);q.fillStyle='#c0c8a0';q.fillRect(dx+.8,dy+4.4,3,1.6);q.fillStyle='#8a5a34'}
  q.fillStyle=lg(q,0,-24,0,-12,[0,'#9a6a3a',1,'#5a3a1c']);q.fillRect(-18,-24,36,12);gold(q,-18,-26,36,2);q.fillStyle='#d8c898';q.fillRect(-4,-30,8,6);q.strokeStyle='#8a6a30';q.lineWidth=1;q.beginPath();q.moveTo(-9,-30);q.lineTo(9,-30);q.moveTo(0,-30);q.lineTo(0,-36);q.stroke();ell(q,-12,-28,3,2,'#6aa84a');ell(q,12,-28,3,2,'#c8a050');
  q.fillStyle='#4a3a2a';[-1,1].forEach(function(d){q.fillRect(-36+d*7-1.5,-30,3,18)});q.fillStyle='#8a5a22';q.beginPath();q.ellipse(-36,-34,12,9,0,0,TAU);q.fill();q.fillStyle=lg(q,0,-42,0,-26,[0,'#e0a050',1,'#8a5a22']);q.beginPath();q.moveTo(-46,-36);q.quadraticCurveTo(-48,-24,-36,-22);q.quadraticCurveTo(-24,-24,-26,-36);q.closePath();q.fill();q.strokeStyle='#d9a43a';q.lineWidth=1.4;q.beginPath();q.ellipse(-36,-36,10,3,0,0,TAU);q.stroke();q.fillStyle='#e8c050';q.fillRect(-48,-38,3,4);q.fillRect(-27,-38,3,4);
  q.fillStyle='#ff7a20';q.beginPath();q.moveTo(-44,-12);q.quadraticCurveTo(-40,-24,-36,-14);q.quadraticCurveTo(-32,-26,-28,-12);q.fill();q.fillStyle='#ffd060';q.beginPath();q.moveTo(-40,-12);q.quadraticCurveTo(-36,-20,-32,-12);q.fill();
  q.strokeStyle='#6a4a22';q.lineWidth=1.6;q.beginPath();q.moveTo(36,-76);q.lineTo(36,-70);q.stroke();q.fillStyle=lg(q,0,-70,0,-40,[0,'#ffc060',1,'#c8742a']);q.beginPath();q.arc(36,-48,7.5,0,TAU);q.arc(36,-61,5.2,0,TAU);q.fill();q.fillRect(34,-70,4,5);q.strokeStyle='#e8c050';q.lineWidth=1.2;q.beginPath();q.moveTo(31,-55);q.lineTo(41,-55);q.stroke();q.strokeStyle='#c8322a';q.lineWidth=1.6;q.beginPath();q.moveTo(36,-40);q.lineTo(36,-34);q.stroke();
  [[26,-62],[46,-64],[26,-48]].forEach(function(a,i){q.strokeStyle='#8a6a3a';q.lineWidth=1;q.beginPath();q.moveTo(a[0],-76);q.lineTo(a[0],a[1]);q.stroke();ell(q,a[0],a[1]+5,2.4,6,i?'#7aa84a':'#b88a3a');q.strokeStyle='#4a7a2a';q.lineWidth=1;q.beginPath();q.moveTo(a[0]-2,a[1]+10);q.lineTo(a[0]-3,a[1]+14);q.moveTo(a[0]+2,a[1]+10);q.lineTo(a[0]+3,a[1]+14);q.stroke()});
  q.fillStyle='#5a3a22';q.fillRect(30,-24,14,12);q.fillStyle='#4a8a3a';[[34,-26,9],[40,-28,11],[37,-24,7]].forEach(function(a){q.beginPath();q.ellipse(a[0],a[1]-a[2]/2,2.6,a[2]/2,0,0,TAU);q.fill()});
  q.fillStyle='#f4f0e0';q.beginPath();q.arc(0,-82,7.4,0,TAU);q.fill();q.fillStyle='#1a1a1a';q.beginPath();q.arc(0,-82,7.4,-1.57,1.57);q.arc(0,-78.3,3.7,1.57,-1.57,true);q.arc(0,-85.7,3.7,1.57,-1.57,false);q.fill();q.beginPath();q.arc(0,-85.7,1.1,0,TAU);q.fillStyle='#fff';q.fill();q.beginPath();q.arc(0,-78.3,1.1,0,TAU);q.fillStyle='#1a1a1a';q.fill()}
function questBays(q){
  q.fillStyle='#3a2216';q.fillRect(-51,-72,30,50);q.strokeStyle='#8a6a40';q.lineWidth=2;q.strokeRect(-49,-70,26,46);[[-47,-66,10,13,'#f4ecd0'],[-35,-67,10,15,'#e8d8a8'],[-47,-50,11,15,'#efe6c4'],[-35,-49,11,13,'#f4ecd0']].forEach(function(a,i){q.fillStyle=a[4];q.fillRect(a[0],a[1],a[2],a[3]);q.strokeStyle='rgba(60,30,20,.55)';q.lineWidth=.8;for(var l=0;l<3;l++){q.beginPath();q.moveTo(a[0]+1.4,a[1]+3+l*3.6);q.lineTo(a[0]+a[2]-1.4,a[1]+3+l*3.6);q.stroke()}ell(q,a[0]+a[2]-2.6,a[1]+a[3]-3,1.8,1.8,'#c8322a');ell(q,a[0]+a[2]/2,a[1]-.6,1,1,'#2a1a10')});q.fillStyle='#3a2216';q.fillRect(-40,-22,6,10);
  colRed(q,-16,-76,32,64);q.fillStyle='#8a1e18';q.fillRect(-.8,-76,1.6,64);for(var r=0;r<5;r++)for(var c=0;c<3;c++){[-1,1].forEach(function(d){ell(q,d*(4+c*4.4),-70+r*10.4,1.5,1.5,'#f0cc60')})}
  [-1,1].forEach(function(d){ell(q,d*5,-42,2.6,2.6,'#d9a43a');q.strokeStyle='#d9a43a';q.lineWidth=1;q.beginPath();q.arc(d*5,-39,2.4,0,TAU);q.stroke()});gold(q,-16,-78,32,2.4);
  q.fillStyle='#4a3a2a';q.fillRect(26,-30,3,18);q.fillRect(44,-30,3,18);q.fillStyle=lg(q,0,-48,0,-26,[0,'#e24a38',.5,'#b82a22',1,'#7a1814']);q.beginPath();q.ellipse(36.5,-38,15,11,0,0,TAU);q.fill();q.strokeStyle='#e8c050';q.lineWidth=1.6;q.beginPath();q.ellipse(36.5,-38,15,11,0,0,TAU);q.stroke();for(var k=0;k<10;k++){var a=k/10*TAU;ell(q,36.5+Math.cos(a)*13,-38+Math.sin(a)*9.4,1.1,1.1,'#f0cc60')}q.fillStyle='#e8c050';q.beginPath();q.arc(36.5,-38,2.2,0,TAU);q.fill();
  [-58,58].forEach(function(x,i){var d=i?-1:1;q.fillStyle='#a89c84';q.fillRect(x-8,-24,16,10);q.fillStyle='#c8bca2';q.fillRect(x-9,-26,18,3);q.fillStyle=lg(q,x-9,0,x+9,0,[0,'#cfc4aa',1,'#8a7e68']);q.beginPath();q.moveTo(x-6*d,-26);q.quadraticCurveTo(x-8*d,-42,x-3*d,-50);q.quadraticCurveTo(x+1*d,-58,x+6*d,-52);q.quadraticCurveTo(x+9*d,-46,x+5*d,-42);q.quadraticCurveTo(x+9*d,-34,x+7*d,-26);q.closePath();q.fill();ell(q,x+d*3,-50,1.5,1.5,'#2a1a10');q.strokeStyle='rgba(60,44,30,.6)';q.lineWidth=.9;q.beginPath();q.arc(x-d*3,-38,4,0,TAU);q.stroke();ell(q,x+d*6,-46,2.2,2,'#e8c050')});
  [-72,72].forEach(function(x,i){q.strokeStyle='#5a3a22';q.lineWidth=2.2;q.beginPath();q.moveTo(x,-12);q.lineTo(x,-120);q.stroke();q.fillStyle='#d9a43a';q.beginPath();q.arc(x,-122,2.6,0,TAU);q.fill()})}
function portalBase(q,th){platform(q,74,true);q.fillStyle=lg(q,0,-92,0,-12,[0,'#f0e4c8',1,'#c4b698']);q.fillRect(-66,-90,132,78);q.strokeStyle='rgba(80,60,40,.22)';q.lineWidth=.8;for(var x=-60;x<66;x+=12){q.beginPath();q.moveTo(x,-90);q.lineTo(x,-12);q.stroke()}for(var y=-78;y<-12;y+=12){q.beginPath();q.moveTo(-66,y);q.lineTo(66,y);q.stroke()}
  q.fillStyle='#3a4458';q.fillRect(-70,-96,140,7);gold(q,-70,-90,140,1.6);for(x=-66;x<68;x+=7){ell(q,x,-95,2.6,3,'#2a3446');ell(q,x,-95,1,1.2,'#e8c050')}
  [-66,66].forEach(function(x){colRed(q,x-5,-92,10,80);gold(q,x-6,-60,12,2);gold(q,x-6,-84,12,2)});
  q.fillStyle=rg(q,0,-56,2,46,[0,'#e8c8ff',.5,'#5a2ac0',1,'#12062a']);q.beginPath();q.arc(0,-56,38,0,TAU);q.fill();
  q.fillStyle=lg(q,-46,-100,46,-12,[0,'#d8ccb0',.5,'#a89c84',1,'#7a6e58']);q.beginPath();q.arc(0,-56,46,0,TAU);q.arc(0,-56,37,0,TAU,true);q.fill();q.strokeStyle='rgba(40,28,16,.5)';q.lineWidth=1;for(var a=0;a<18;a++){var an=a/18*TAU;q.beginPath();q.moveTo(Math.cos(an)*37,-56+Math.sin(an)*37);q.lineTo(Math.cos(an)*46,-56+Math.sin(an)*46);q.stroke()}
  q.strokeStyle='rgba(232,192,80,.9)';q.lineWidth=1.6;q.beginPath();q.arc(0,-56,37,0,TAU);q.stroke();q.beginPath();q.arc(0,-56,46,0,TAU);q.stroke();
  q.fillStyle='#4a3a2a';[-1,1].forEach(function(d){q.fillRect(d*58-5,-46,10,34);q.fillStyle='#8a5a30';q.beginPath();q.ellipse(d*58,-50,10,6,0,0,TAU);q.fill();q.fillStyle='#d9a43a';q.fillRect(d*58-1.2,-64,2.4,14);ell(q,d*58,-66,2.4,2.4,'#d9a43a');q.fillStyle='#4a3a2a'});
  [-1,1].forEach(function(d){q.lineCap='round';q.lineJoin='round';var path=function(){q.beginPath();for(var j=0;j<=26;j++){var yy=-82+j*2.7,xx=d*66+Math.sin(j*.75)*7.5*d;j?q.lineTo(xx,yy):q.moveTo(xx,yy)}};path();q.strokeStyle='#14403a';q.lineWidth=6.4;q.stroke();path();q.strokeStyle=lg(q,0,-84,0,-14,[0,'#e8c050',1,'#3aa89a']);q.lineWidth=4.2;q.stroke();path();q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=1;q.setLineDash([2,4]);q.stroke();q.setLineDash([]);
    q.fillStyle='#e8c050';q.beginPath();q.ellipse(d*66,-88,5.6,4.2,0,0,TAU);q.fill();q.fillStyle='#14403a';q.beginPath();q.arc(d*66+d*1.6,-89,1.1,0,TAU);q.fill();q.strokeStyle='#e8c050';q.lineWidth=1.4;q.beginPath();q.moveTo(d*66-d*2,-91);q.quadraticCurveTo(d*66-d*7,-96,d*66-d*8,-100);q.moveTo(d*66+d*1,-92);q.quadraticCurveTo(d*66+d*3,-98,d*66+d*7,-99);q.stroke();q.beginPath();q.moveTo(d*66+d*5,-87);q.lineTo(d*66+d*10,-85);q.stroke()});
  plaque(q,0,-118,30,15,'傳',12);beam(q,52,-100);roofHip(q,0,-108,48,18,14,th.r1,th.r2,10)}
var TH=[{wall:'#d0c4aa',r1:'#6a7690',r2:'#2c3448'},{wall:'#efe3c6',r1:'#42a888',r2:'#1c5a48'},{wall:'#f0e6ce',r1:'#4cb092',r2:'#1f6a56'},{wall:'#f0e2c4',r1:'#8a58aa',r2:'#3e1e5e'},{wall:'#f0e4c8',r1:'#5a7ac8',r2:'#22306a'}];
function paintBuilding(q,i){var th=TH[i];
  if(i==4){portalBase(q,th);return}
  shell(q,th,56);pillars(q);[forgeBays,shopBays,herbBays,questBays][i](q);
  if(i==0){q.fillStyle='#6a6a76';q.fillRect(34,-152,13,52);q.fillStyle='#8a8a96';q.fillRect(32,-156,17,6);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(34,-152,3,52)}
  eaves(q,56);roofHip(q,0,-94,60,20,17,th.r1,th.r2,14);attic(q,th,'鍛貨藥令'[i],12)}
/* ---------- bộ nhớ đệm ---------- */
var BGC=null,BGK='',META=null,BC={},CLD=[],GSP={};
function gs(c){return GSP[c]||(GSP[c]=glowSpr(c))}
function gl(x,y,r,c,a){g.globalAlpha=a;g.drawImage(gs(c),x-r,y-r,r*2,r*2);g.globalAlpha=1}
function fadeEdges(q,w,h){q.globalCompositeOperation='destination-in';q.fillStyle=lg(q,0,0,w,0,[0,'rgba(0,0,0,0)',.18,'rgba(0,0,0,1)',.82,'rgba(0,0,0,1)',1,'rgba(0,0,0,0)']);q.fillRect(0,0,w,h);q.fillStyle=lg(q,0,0,0,h,[0,'rgba(0,0,0,0)',.3,'rgba(0,0,0,1)',.7,'rgba(0,0,0,1)',1,'rgba(0,0,0,0)']);q.fillRect(0,0,w,h);q.globalCompositeOperation='source-over'}
function cloudSpr(seed,u){var w=300*u,h=84*u,o=mk(w,h,DPR),q=o.q,r=rng(seed);for(var i=0;i<22;i++){var x=w*.1+r()*w*.8,y=h*.55+(r()-.5)*h*.3,rx=(26+r()*40)*u,ry=(10+r()*16)*u;q.fillStyle=rg(q,x,y,1,rx,[0,'rgba(255,238,232,.55)',1,'rgba(255,200,200,0)']);q.beginPath();q.ellipse(x,y,rx,ry,0,0,TAU);q.fill()}
  q.strokeStyle='rgba(255,246,240,.75)';q.lineWidth=1.8*u;q.lineCap='round';for(i=0;i<3;i++){var cx=w*(.22+i*.28),cy=h*.5;q.beginPath();for(var a=0;a<9;a+=.3){var rr=(2+a*1.25)*u;a?q.lineTo(cx+Math.cos(a)*rr,cy-Math.sin(a)*rr*.7):q.moveTo(cx,cy)}q.stroke()}fadeEdges(q,w,h);return o.c}
function ensureBG(gy){var u=s,k=[W,H,Math.round(gy),u.toFixed(3),DPR,PORT,fontOK()].join('|');if(k===BGK&&BGC)return;BGK=k;var o=mk(W,H,DPR);META=paintBG(o.q,W,H,gy,u,PORT);BGC=o.c;CLD=[cloudSpr(3,u),cloudSpr(8,u),cloudSpr(15,u)]}
function bCache(i,k){var key=[s.toFixed(3),k.toFixed(3),DPR,fontOK()].join('|'),b=BC[i];if(b&&b.k===key)return b.c;var sc=s*k,o=mk(184*sc,190*sc,DPR);o.q.setTransform(sc*DPR,0,0,sc*DPR,92*sc*DPR,176*sc*DPR);paintBuilding(o.q,i);BC[i]={k:key,c:o.c};return b?b.c=o.c:o.c}
/* ---------- đèn lồng (động) ---------- */
var LSP=null;
function lantSpr(){var o=mk(30,40,3),q=o.q;q.translate(15,0);q.strokeStyle='#3a2010';q.lineWidth=1.2;q.beginPath();q.moveTo(0,0);q.lineTo(0,6);q.stroke();q.fillStyle='#d9a43a';q.fillRect(-4.6,5,9.2,2.4);
  q.fillStyle=rg(q,0,13,1,10,[0,'#ff8a5a',.55,'#e03a2a',1,'#a01818']);q.beginPath();q.ellipse(0,13.6,8.6,8.2,0,0,TAU);q.fill();q.strokeStyle='rgba(120,20,16,.7)';q.lineWidth=.8;for(var j=-1;j<=1;j++){q.beginPath();q.ellipse(0,13.6,8.6*Math.abs(j)*.62+.01,8.2,0,0,TAU);q.stroke()}
  q.fillStyle='#d9a43a';q.fillRect(-4.4,21,8.8,2.2);q.strokeStyle='#e8c050';q.lineWidth=.9;for(j=-2;j<=2;j++){q.beginPath();q.moveTo(j*1.7,23);q.quadraticCurveTo(j*1.9,28,j*2.2,31);q.stroke()}return o.c}
function lant(x,y,sc,t,ph,col){if(!LSP)LSP=lantSpr();g.save();g.translate(x,y);g.rotate(Math.sin(t*.04+ph)*.09);var fl=.45+.12*Math.sin(t*.11+ph*3);g.globalCompositeOperation='lighter';gl(0,13*sc,26*sc,col||'rgba(255,150,70,1)',fl);g.globalCompositeOperation='source-over';g.drawImage(LSP,-15*sc,0,30*sc,40*sc);g.restore()}
function puffs(x,y,n,t,h,dr,r0,r1,rgb,al,spd){for(var j=0;j<n;j++){var p=(t*(spd||.006)+j/n)%1;g.fillStyle='rgba('+rgb+','+(al*(1-p)).toFixed(3)+')';g.beginPath();g.arc(x+Math.sin(t*.03+j*2)*dr*p+dr*.5*p,y-p*h,r0+p*(r1-r0),0,TAU);g.fill()}}
function flagW(x,y,w,h,t,ph,c1,ch){g.save();g.translate(x,y);g.fillStyle=c1;g.beginPath();var st=5,i,p=[];for(i=0;i<=h/st;i++){var yy=i*st,xx=w+Math.sin(t*.08+yy*.12+ph)*3.2*(yy/h+.15);p.push([xx,yy])}g.moveTo(0,0);for(i=0;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.lineTo(0,h);g.closePath();g.fill();g.strokeStyle='#e8c050';g.lineWidth=1;g.stroke();
  g.fillStyle='#ffe28a';g.font='bold 10px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(ch,w/2+Math.sin(t*.08+ph+h*.03)*1.2,h*.45);g.restore()}
/* ---------- toà nhà: vẽ + hiệu ứng động ---------- */
function drawBld(i){var t=fr,k=bww()/120,sc=s*k;g.save();g.translate(bxx(i)*s,GY);g.scale(sc,sc);g.drawImage(bCache(i,k),-92,-176,184,190);
  var tl=i==4?-100:-88,tx=i==4?56:62;lant(-tx,tl,.95,t,i*1.3);lant(tx,tl,.95,t,i*1.3+2);
  [-1,1].forEach(function(d){var bx=d*(i==4?62:77),by=i==4?-117:-102;g.save();g.translate(bx,by);g.rotate(Math.sin(t*.05+d+i)*.14);g.fillStyle='#e8c050';g.beginPath();g.moveTo(-3,0);g.quadraticCurveTo(-4,6,-5,8);g.lineTo(5,8);g.quadraticCurveTo(4,6,3,0);g.fill();g.fillStyle='#8a5a1a';g.fillRect(-.7,8,1.4,2.4);g.restore()});
  if(i==0){g.globalCompositeOperation='lighter';gl(0,-28,36,'rgba(255,140,50,1)',.5+.2*Math.sin(t*.13)+.1*Math.sin(t*.31));gl(-33,-32,16,'rgba(255,110,40,1)',.3+.1*Math.sin(t*.2));g.globalCompositeOperation='source-over';
    for(var j=0;j<7;j++){var p=(t*.035+j*.143)%1;g.fillStyle='rgba(255,'+(190-p*80|0)+',90,'+(1-p).toFixed(2)+')';g.beginPath();g.arc(-6+j*2+Math.sin(j*7+t*.09)*7*p,-22-p*36,1.5*(1-p*.5),0,TAU);g.fill()}puffs(40,-157,6,t,70,12,4,12,'210,206,218',.32,.005)}
  else if(i==1){flagW(46,-128,15,48,t,0,'#c8322a','貨');g.strokeStyle='#8a5a22';g.lineWidth=1;for(j=0;j<4;j++){var sw=Math.sin(t*.05+j)*1.2;g.beginPath();g.moveTo(22+j*6.4,-66);g.lineTo(22+j*6.4+sw,-62);g.stroke()}}
  else if(i==2){g.globalCompositeOperation='lighter';gl(-36,-20,18,'rgba(255,120,40,1)',.4+.15*Math.sin(t*.17));g.globalCompositeOperation='source-over';puffs(-36,-46,6,t,48,10,3,9,'250,250,252',.42,.007)}
  else if(i==3){flagW(72,-118,16,46,t,1,'#b81e1e','令');flagW(-88,-118,16,46,t,2.4,'#b81e1e','令')}
  else{var cx=0,cy=-56;g.save();g.beginPath();g.arc(cx,cy,37,0,TAU);g.clip();var pr=rg(g,cx,cy,2,40,[0,'#f2dcff',.35,'#8a46e8',.8,'#2a0e6a',1,'#12062a']);g.fillStyle=pr;g.fillRect(-40,-96,80,80);
    for(j=0;j<6;j++){g.strokeStyle='rgba(255,255,255,'+(.2+.08*(j%3))+')';g.lineWidth=1.8;g.beginPath();g.ellipse(cx,cy,7+j*5.4,15+j*3.4,t*.03*(j%2?1:-1)+j,0,4.4);g.stroke()}
    g.globalCompositeOperation='lighter';for(j=0;j<10;j++){var a=t*.03+j*.63,rr=(j*11%34)+3;g.fillStyle='rgba(200,230,255,.8)';g.beginPath();g.arc(cx+Math.cos(a*(j%2?1:-1))*rr,cy+Math.sin(a*(j%2?1:-1))*rr,1.2,0,TAU);g.fill()}g.restore();
    g.globalCompositeOperation='lighter';gl(cx,cy,78,'rgba(140,90,255,1)',.34+.18*Math.sin(t*.1));g.globalCompositeOperation='source-over';
    g.save();g.translate(cx,cy);g.rotate(t*.012);g.strokeStyle='rgba(255,220,120,.7)';g.lineWidth=1.4;g.setLineDash([5,5]);g.beginPath();g.arc(0,0,53,0,TAU);g.stroke();g.setLineDash([]);for(j=0;j<8;j++){var aa=j/8*TAU;g.fillStyle='rgba(255,230,150,.9)';g.beginPath();g.arc(Math.cos(aa)*53,Math.sin(aa)*53,1.8,0,TAU);g.fill()}g.restore();
    g.save();g.translate(0,-4);g.scale(1,.16);g.rotate(t*.015);g.strokeStyle='rgba(150,220,255,.55)';g.lineWidth=2.4;g.setLineDash([8,6]);g.beginPath();g.arc(0,0,50,0,TAU);g.stroke();g.restore()}
  g.font='bold 15px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle='#ffe9a0';g.strokeText(BN[i],0,-170);g.fillText(BN[i],0,-170);g.fillStyle='#ffd54a';g.fillText('▼',0,-154+Math.sin(t*.12+i)*4);g.restore()}
/* ---------- nền: tĩnh (đệm) + động ---------- */
function drawBG(gy){ensureBG(gy);var t=fr,u=s,M=META,i;TT.drawn=fr;g.drawImage(BGC,0,0,W,H);
  g.save();g.globalCompositeOperation='lighter';gl(M.sun.x,M.sun.y,150*u,'rgba(255,200,130,1)',.22+.1*Math.sin(t*.03));
  for(i=0;i<M.lamps.length;i++)gl(M.lamps[i].x,M.lamps[i].y+8*u,40*u,'rgba(255,170,80,1)',.4+.1*Math.sin(t*.09+i*2));g.restore();
  for(i=0;i<3;i++){var cw=300*u,x=((t*(.12+i*.07)*u+i*W*.37)%(W+cw*2))-cw;g.globalAlpha=.62;g.drawImage(CLD[i],x,gy*(.1+i*.085),cw,84*u);g.globalAlpha=1}
  for(i=0;i<2;i++){var mw=W*1.6,mx=((t*(.05+i*.03)*u+i*W*.5)%(mw+W))-mw;g.globalAlpha=.2;g.drawImage(CLD[i+1],mx,gy-(72-i*30)*u,mw,40*u);g.globalAlpha=1}
  for(i=0;i<4;i++){var fx=((t*(.5+i*.08)*u+i*W*.31)%(W+220))-110,fy=gy*(.2+.07*i)+Math.sin(t*.02+i*2)*8*u,wf=Math.sin(t*.12+i*1.7),sc=u*(.9+i*.08);
    g.save();g.translate(fx,fy);g.scale(sc,sc);g.fillStyle='#f6f2ee';g.beginPath();g.ellipse(0,0,8,2.8,0,0,TAU);g.fill();g.strokeStyle='#f6f2ee';g.lineWidth=1.3;g.beginPath();g.moveTo(7,-.5);g.quadraticCurveTo(13,-3,15,-5);g.stroke();g.fillStyle='#c8322a';g.beginPath();g.arc(15,-5.4,1.1,0,TAU);g.fill();g.strokeStyle='#2a2a30';g.lineWidth=1;g.beginPath();g.moveTo(-7,.5);g.lineTo(-17,2);g.stroke();
    g.fillStyle='#f6f2ee';[1,-1].forEach(function(d){g.beginPath();g.moveTo(-2,0);g.quadraticCurveTo(-4,-12*wf*d-2,-14,-10*wf*d);g.quadraticCurveTo(-8,-3*wf*d,4,0);g.fill();g.fillStyle='#2a2a30';g.beginPath();g.moveTo(-14,-10*wf*d);g.lineTo(-10,-8*wf*d);g.lineTo(-11,-4*wf*d);g.fill();g.fillStyle='#f6f2ee'});g.restore()}
  var W2=M.wf;g.save();g.lineCap='round';for(i=0;i<9;i++){var yy=W2.y0+((t*1.5+i*(W2.y1-W2.y0)/9)%(W2.y1-W2.y0));g.strokeStyle='rgba(255,255,255,'+(.3+.3*Math.sin(i*2+t*.1)).toFixed(2)+')';g.lineWidth=1.2*u;g.beginPath();g.moveTo(W2.x+(i%3-1)*2.4*u,yy);g.lineTo(W2.x+(i%3-1)*2.8*u,yy+9*u);g.stroke()}g.restore();
  var R=M.rope;for(i=0;i<9;i++){var tt=(i+.5)/9,rx=(1-tt)*(1-tt)*R.ax+2*(1-tt)*tt*R.cx+tt*tt*R.bx,ry=(1-tt)*(1-tt)*R.ay+2*(1-tt)*tt*R.cy+tt*tt*R.by;lant(rx,ry,1.15*u,t,i*1.9)}
  [[1,26*u],[-1,W-26*u]].forEach(function(a,gi){var uu=u*1.15,lx=a[1]+a[0]*(5+34)*uu;lant(lx,GY-126*uu,.95*u,t,gi*3+.5)})}
function drawFront(){var t=fr,u=s,i;g.save();for(i=0;i<16;i++){var x=(i*97+Math.sin(t*.02+i)*40*u+t*(.4+i%3*.25)*u)%(W+40)-20,y=(i*61+t*(.7+i%4*.22)*u)%(H+20)-10;g.fillStyle=i%2?'rgba(255,184,204,.9)':'rgba(255,244,248,.9)';g.beginPath();g.ellipse(x,y,4*u,2*u,t*.05+i,0,TAU);g.fill()}
  g.globalCompositeOperation='lighter';for(i=0;i<12;i++){var fx=W*((i*.083+.04)%1)+Math.sin(t*.013+i*3)*34*u,fy=GY+(H-GY)*(.1+((i*37)%70)/100)+Math.sin(t*.021+i)*10*u,a=.5+.5*Math.sin(t*.05+i*1.7);gl(fx,fy,7*u,'rgba(220,255,140,1)',.25+.5*a)}g.restore()}
/* ---------- gắn vào game (an toàn: lỗi → quay về hình cũ) ---------- */
var fails=0;function bad(e){TT.err=e;if(++fails>=3)TT.on=false;try{console.warn('[Thôn Tân Thủ]',e)}catch(x){}}
xbg=function(gy,m){if(m===-1&&TT.on&&g){try{drawBG(gy);return}catch(e){bad(e)}}return _xbg.apply(this,arguments)};
bld=function(i){if(TT.on){try{drawBld(i);return}catch(e){bad(e)}}return _bld.apply(this,arguments)};
if(typeof vdraw==='function'){var _vd=vdraw;vdraw=function(){var r=_vd.apply(this,arguments);try{if(TT.on&&TT.drawn===fr)drawFront()}catch(e){bad(e)}return r}}
TT.rebuild=function(){BGK='';BC={}};
})();
