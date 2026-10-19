/* ===== 🧘 BẾ QUAN ĐÀI — BẢN ĐỒ VẼ BẰNG CODE (world/57a-be-quan-dai-art.js, Fix326) =====
 * Thay ảnh nền sáng cũ (HPA.bg) bằng cảnh đêm tu tiên cùng tông với Thành Thị Linh Giới: trời tím sao + trăng ngọc,
 * cực quang nhẹ, núi đá tiên nhiều tầng + đảo nổi có điện các, biển mây, sân đá có lan can + đèn đá,
 * 4 bia đá khắc 佛 妖 仙 冥 (bia của hồn phách đang chọn sáng rực), đài tròn trận pháp ở giữa nơi hồn phách ngồi.
 * Vẽ 3 lớp CACHE (nền trời / núi-mây / sân-đài) + lớp ĐỘNG (sao nháy, sao băng, cực quang, mây trôi, đèn, bia, ấn trận, linh khí).
 * API: BQART.paint(g,W,H,s,GY,t,info) → true nếu vẽ được (info={sel:0..3|-1, col:'#hex', r:cảnh giới}); false → world/57 dùng ảnh cũ.
 * Hệ toạ độ: px CSS (canvas đã setTransform(DPR)). Sàn đi lại = đường ngang y=GY; hồn phách ngồi ở (W/2, GY-2s).
 * Chất lượng: window.QL>=2 tắt cực quang, giảm linh khí/mây. Cache tự dựng lại khi đổi kích thước/xoay màn hình. */
(function(){
'use strict';
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
var PIL=[{c:'#ffd76a',ch:'佛'},{c:'#b9a6ff',ch:'妖'},{c:'#fff3b0',ch:'仙'},{c:'#ff5a5a',ch:'冥'}];
var C=null,KEY='',GS={},CL=null,BAD=false;

/* ---------- tiện ích ---------- */
function R(sd){var a=sd%2147483647;if(a<=0)a+=2147483646;return function(){a=a*16807%2147483647;return(a-1)/2147483646}}
function lg(q,x0,y0,x1,y1,st){var o=q.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function rg(q,x,y,r0,r1,st){var o=q.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)o.addColorStop(st[i],st[i+1]);return o}
function el(q,x,y,rx,ry,rot){q.beginPath();q.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,6.2832)}
function rgb(h){h=String(h||'#9fe0c0');if(h.charAt(0)!=='#'||h.length<7)return'159,224,192';return[1,3,5].map(function(i){return parseInt(h.substr(i,2),16)}).join(',')}
function mkc(w,h){var cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w));cv.height=Math.max(1,Math.ceil(h));return cv}
function glowSpr(c){var k=rgb(c);return GS[k]||(GS[k]=(function(){var cv=mkc(64,64),q=cv.getContext('2d');q.fillStyle=rg(q,32,32,0,32,[0,'rgba('+k+',1)',.3,'rgba('+k+',.45)',1,'rgba('+k+',0)']);q.fillRect(0,0,64,64);return cv})())}
function glow(g,c,x,y,r,a){if(a<=.003)return;g.globalAlpha=Math.min(1,a);g.drawImage(glowSpr(c),x-r,y-r,r*2,r*2)}
function ql(){return window.QL|0}
function geo(W,H,s,GY){var yF=GY-58*s,wh=34*s;return{W:W,H:H,s:s,GY:GY,cx:W/2,yF:yF,wh:wh,wt:yF-wh,R:Math.min(W*.4,205*s)}}

/* ---------- LỚP 1: trời, sao, trăng ---------- */
function sky(q,G,o){
  var W=G.W,yF=G.yF,s=G.s,i,r=R(3);
  q.fillStyle=lg(q,0,0,0,yF,[0,'#05041a',.38,'#110c36',.7,'#2a1a5c',.9,'#5a3282',1,'#8c4c90']);q.fillRect(0,0,W,yF+2);
  q.fillStyle=rg(q,W*.5,yF-24*s,0,W*.8,[0,'rgba(255,175,155,.30)',.45,'rgba(195,105,175,.13)',1,'rgba(90,40,120,0)']);q.fillRect(0,0,W,yF+2);
  var n=Math.round(W*yF/2100);
  for(i=0;i<n;i++){
    var x=r()*W,y=Math.pow(r(),1.35)*yF*.9,sz=.5+r()*1.1,tn=r();
    q.fillStyle=tn<.18?'rgba(255,200,220,':tn<.4?'rgba(190,220,255,':'rgba(255,255,255,';
    q.globalAlpha=.35+r()*.6;q.beginPath();q.arc(x,y,sz,0,6.2832);q.fill();q.globalAlpha=1;
    if(sz>1.25){q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=.6;q.beginPath();q.moveTo(x-sz*3,y);q.lineTo(x+sz*3,y);q.moveTo(x,y-sz*3);q.lineTo(x,y+sz*3);q.stroke();if(o.tw.length<44)o.tw.push([x,y,sz])}
  }
  /* trăng ngọc */
  var mx=W*.74,my=G.wt*.27,mr=Math.max(24,42*s);o.moon={x:mx,y:my,r:mr};
  q.fillStyle=rg(q,mx,my,mr*.8,mr*5.2,[0,'rgba(200,255,235,.36)',.22,'rgba(150,200,255,.16)',1,'rgba(100,120,255,0)']);q.fillRect(mx-mr*6,my-mr*6,mr*12,mr*12);
  q.fillStyle=rg(q,mx-mr*.3,my-mr*.3,mr*.1,mr*1.1,[0,'#fbfffc',.55,'#d2f2e8',1,'#9fcfca']);el(q,mx,my,mr,mr);q.fill();
  q.save();el(q,mx,my,mr,mr);q.clip();
  for(i=0;i<7;i++){q.fillStyle='rgba(110,155,160,'+(.14+r()*.14)+')';el(q,mx+(r()-.5)*mr*1.3,my+(r()-.5)*mr*1.3,mr*(.1+r()*.16),mr*(.08+r()*.12),r());q.fill()}
  q.restore();
  q.strokeStyle='rgba(190,255,230,.26)';q.lineWidth=1;el(q,mx,my,mr*1.55,mr*1.55);q.stroke();
  q.strokeStyle='rgba(170,200,255,.13)';el(q,mx,my,mr*2.2,mr*2.2);q.stroke();
}

/* ---------- LỚP 2: núi đá tiên, đảo nổi, biển mây ---------- */
function layer(G,fn,fog,fa,hTop,hBot){   /* vẽ vào canvas tạm rồi phủ sương CHỈ lên phần núi (source-atop) */
  var cv=mkc(G.W*G.D,G.H*G.D),q=cv.getContext('2d');q.scale(G.D,G.D);fn(q);
  q.globalCompositeOperation='source-atop';q.fillStyle=lg(q,0,hTop,0,hBot,[0,'rgba('+fog+',0)',.55,'rgba('+fog+','+(fa*.5)+')',1,'rgba('+fog+','+fa+')']);q.fillRect(0,0,G.W,G.H);
  return cv}
function spire(q,x,by,w,h,c1,c2,lean,r,mx){
  var n=9,L=[],Rr=[],i,t,hw,ph=r()*6;
  for(i=0;i<=n;i++){t=i/n;hw=w/2*(1-.34*t)*(1+.2*Math.sin(t*7+ph))*(1+(r()-.5)*.08)+(i===0?w*.16:0);L.push([x-hw+lean*t*t,by-h*t]);Rr.push([x+hw+lean*t*t,by-h*t])}
  q.beginPath();q.moveTo(L[0][0],by+10);for(i=0;i<=n;i++)q.lineTo(L[i][0],L[i][1]);
  q.quadraticCurveTo((L[n][0]+Rr[n][0])/2+lean*.2,by-h-w*.34,Rr[n][0],Rr[n][1]);
  for(i=n-1;i>=0;i--)q.lineTo(Rr[i][0],Rr[i][1]);q.lineTo(Rr[0][0],by+10);q.closePath();
  var lit=x<mx?1:0;   /* bên hướng trăng sáng hơn */
  q.fillStyle=lg(q,x-w/2,0,x+w/2,0,lit?[0,c2,.55,c1,1,'#6f70bc']:[0,'#6f70bc',.45,c1,1,c2]);q.fill();
  q.save();q.clip();
  for(i=0;i<9;i++){var yy=by-h*(i+.5+(r()-.5)*.6)/9;q.strokeStyle='rgba(8,4,40,'+(.1+r()*.12)+')';q.lineWidth=.6+r()*1.3;q.beginPath();q.moveTo(x-w,yy);q.quadraticCurveTo(x,yy+(r()-.5)*7,x+w,yy+(r()-.5)*5);q.stroke()}
  for(i=0;i<4;i++){var cx2=x+(r()-.5)*w*.7;q.strokeStyle='rgba(8,4,40,.18)';q.lineWidth=.8;q.beginPath();q.moveTo(cx2,by-h*(.2+r()*.5));q.lineTo(cx2+(r()-.5)*6,by-h*(.05+r()*.2));q.stroke()}
  q.restore();
  q.strokeStyle='rgba(185,255,230,.22)';q.lineWidth=1;q.beginPath();var side=lit?Rr:L;side.forEach(function(p,j){j?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1])});q.stroke();
  /* tán tùng mềm trên đỉnh + vài bụi bám vách */
  for(i=0;i<5;i++){var tx=x+lean+(r()-.5)*w*.62,ty=by-h-w*.04+(r()-.5)*w*.1,tr=w*(.1+r()*.1);q.fillStyle=rg(q,tx-tr*.3,ty-tr*.3,0,tr*1.2,[0,'#2f7f78',1,'#173f52']);q.globalAlpha=.92;q.beginPath();q.arc(tx,ty,tr,0,6.2832);q.fill()}
  for(i=0;i<3;i++){var ei=Math.min(n,2+(r()*(n-3)|0)),pt=r()<.5?L[ei]:Rr[ei],br=w*(.06+r()*.05);q.fillStyle='#1d5560';q.globalAlpha=.85;q.beginPath();q.arc(pt[0],pt[1],br,0,6.2832);q.fill()}
  q.globalAlpha=1}
function range(q,G,o,cfg){
  var pt=G.H>G.W*1.05,r=R(cfg.sd),W=G.W,s=G.s,n=Math.ceil(W/(cfg.sp*(pt?.74:1)*s)),i,by=G.yF-cfg.by*s,top=G.wt*(cfg.cap-(pt?.15:0)),hm=pt?1.35:1;
  for(i=0;i<n;i++){
    if(r()<cfg.skip)continue;
    var x=(i+.5+(r()-.5)*.9)*W/n,h=Math.min((cfg.h0+r()*(cfg.h1-cfg.h0))*s*hm,by-top),w=(cfg.w0+r()*(cfg.w1-cfg.w0))*s;
    if(h<28*s)continue;
    spire(q,x,by,w,h,cfg.c1,cfg.c2,(r()-.5)*w*.5,r,o.moon.x)}
}
function islet(q,x,y,w,r){
  var h=w*.58;q.save();
  q.beginPath();q.moveTo(x-w/2,y);q.quadraticCurveTo(x-w*.44,y+h*.5,x-w*.12,y+h*.82);q.lineTo(x+w*.02,y+h);q.lineTo(x+w*.12,y+h*.78);q.quadraticCurveTo(x+w*.42,y+h*.42,x+w/2,y);q.closePath();
  q.fillStyle=lg(q,0,y,0,y+h,[0,'#54479a',1,'#1a1448']);q.fill();
  q.strokeStyle='rgba(185,255,230,.2)';q.lineWidth=1;q.stroke();
  q.fillStyle=lg(q,0,y-w*.05,0,y+w*.07,[0,'#5ac3a6',1,'#2a7a7c']);el(q,x,y,w/2,w*.07);q.fill();
  /* điện các nhỏ */
  var px=x+w*.04,py=y-w*.02,pw=w*.2;
  q.fillStyle='#1e1650';q.fillRect(px-pw*.34,py-pw*.5,pw*.68,pw*.5);
  q.fillStyle='#ffd98a';q.fillRect(px-pw*.08,py-pw*.38,pw*.16,pw*.22);
  [[.95,.62],[.6,.4]].forEach(function(a,k){var rw=pw*a[0]*.8,ry=py-pw*(k?.98:.5);q.fillStyle='#2a1f66';q.beginPath();q.moveTo(px-rw,ry);q.quadraticCurveTo(px-rw*.5,ry-pw*.04,px,ry-pw*a[1]*.56);q.quadraticCurveTo(px+rw*.5,ry-pw*.04,px+rw,ry);q.quadraticCurveTo(px,ry+pw*.07,px-rw,ry);q.fill()});
  /* thác sáng mảnh + pha lê treo */
  q.strokeStyle='rgba(170,235,255,.5)';q.lineWidth=1.2;q.beginPath();q.moveTo(x-w*.22,y+h*.35);q.lineTo(x-w*.22,y+h*1.25);q.stroke();
  q.restore()}
function cloudSpr(w,h,rgbc,top,r){
  var cv=mkc(w,h),q=cv.getContext('2d'),i;
  for(i=0;i<11;i++){var cx=w*(.12+.76*r()),cy=h*(.6+.12*(r()-.5)),rr=h*(.28+.34*r());
    q.fillStyle=rg(q,cx,cy,0,rr,[0,'rgba('+rgbc+',.9)',.6,'rgba('+rgbc+',.42)',1,'rgba('+rgbc+',0)']);q.beginPath();q.arc(cx,cy,rr,0,6.2832);q.fill()}
  q.globalCompositeOperation='source-atop';q.fillStyle=lg(q,0,0,0,h,[0,top,.55,'rgba(255,255,255,0)',1,'rgba(30,10,70,.25)']);q.fillRect(0,0,w,h);
  return cv}
function cloudBand(q,G,base,rgbc,top,al,sd,wMul){
  var r=R(sd),s=G.s,W=G.W,x=-60*s;
  while(x<W+60*s){var w=(150+r()*120)*s*(wMul||1),h=(62+r()*44)*s,sp=cloudSpr(w,h,rgbc,top,r);
    q.globalAlpha=al*(.8+r()*.2);q.drawImage(sp,x,base-h*.62+(r()-.5)*14*s,w,h);x+=w*(.42+r()*.2)}
  q.globalAlpha=1}
function mountains(q,G,o){
  var s=G.s,W=G.W;
  q.drawImage(layer(G,function(p){range(p,G,o,{sd:21,sp:104,by:78,h0:130,h1:240,w0:26,w1:42,c1:'#46408e',c2:'#2a2466',cap:.56,skip:.18})},'140,105,190',.6,G.yF-260*s,G.yF-70*s),0,0,W,G.H);
  islet(q,W*.17,G.wt*.30,74*s,R(5));islet(q,W*.91,G.wt*.46,48*s,R(6));
  cloudBand(q,G,G.yF-70*s,'150,120,205','rgba(230,215,255,.45)',.5,31);
  q.drawImage(layer(G,function(p){range(p,G,o,{sd:22,sp:132,by:56,h0:100,h1:190,w0:28,w1:50,c1:'#332a7a',c2:'#1c1650',cap:.62,skip:.22})},'118,84,170',.5,G.yF-200*s,G.yF-52*s),0,0,W,G.H);
  cloudBand(q,G,G.yF-46*s,'175,140,220','rgba(240,225,255,.5)',.55,32);
  q.drawImage(layer(G,function(p){range(p,G,o,{sd:23,sp:190,by:36,h0:70,h1:140,w0:34,w1:58,c1:'#241d5a',c2:'#110e36',cap:.68,skip:.25})},'100,70,150',.42,G.yF-150*s,G.yF-34*s),0,0,W,G.H);
  cloudBand(q,G,G.yF-18*s,'210,185,240','rgba(255,245,255,.5)',.62,33,1.25);
  q.fillStyle=lg(q,0,G.yF-34*s,0,G.yF,[0,'rgba(190,150,225,0)',1,'rgba(200,160,230,.26)']);q.fillRect(0,G.yF-34*s,W,34*s);
}

/* ---------- LỚP 3: tùng, pha lê, lan can, sân đá, bia, đài ---------- */
function pine(q,x,by,h,lean,r,s){
  q.lineCap='round';q.strokeStyle='#26183a';
  for(var k=0;k<3;k++){q.lineWidth=(8-k*2.4)*s;q.beginPath();q.moveTo(x,by);q.bezierCurveTo(x+lean*.2,by-h*.35,x-lean*.15,by-h*.6,x+lean*(.5+k*.08),by-h*(.7+k*.1));q.stroke()}
  var pads=[[.38,-1,.7],[.55,1,.8],[.7,-1,.6],[.85,1,.9],[1,0,1]];
  pads.forEach(function(p,i){var px=x+lean*p[0]*.7+p[1]*h*.2,py=by-h*p[0]*.95,sc=p[2];
    q.strokeStyle='#26183a';q.lineWidth=3*s;q.beginPath();q.moveTo(x+lean*p[0]*.45,py+h*.04);q.quadraticCurveTo((px+x)/2,py+h*.02,px,py);q.stroke();
    for(var j=0;j<4;j++){var ex=px+(j-1.5)*h*.07*sc,ey=py-Math.abs(j-1.5)*h*.012-h*.012*(j%2);
      q.fillStyle=lg(q,0,ey-h*.07,0,ey+h*.05,[0,'#4aa890',.5,'#2a7468',1,'#143c48']);el(q,ex,ey,h*.15*sc*(.8+r()*.3),h*.055*sc);q.fill();
      q.fillStyle='rgba(190,255,230,.22)';el(q,ex+h*.02,ey-h*.022*sc,h*.09*sc,h*.02*sc);q.fill()}})}
function crystal(q,x,y,w,h,c1,c2){
  q.fillStyle=lg(q,x,y-h,x,y,[0,c1,1,c2]);q.beginPath();q.moveTo(x-w*.5,y);q.lineTo(x-w*.32,y-h*.62);q.lineTo(x+w*.03,y-h);q.lineTo(x+w*.4,y-h*.58);q.lineTo(x+w*.5,y);q.closePath();q.fill();
  q.fillStyle='rgba(255,255,255,.5)';q.beginPath();q.moveTo(x-w*.32,y-h*.62);q.lineTo(x+w*.03,y-h);q.lineTo(x-w*.06,y-h*.34);q.closePath();q.fill()}
function baluster(q,x,yb,yt,w){
  var h=yb-yt;q.beginPath();q.moveTo(x-w*.5,yb);q.lineTo(x-w*.5,yb-h*.12);q.quadraticCurveTo(x-w*.18,yb-h*.2,x-w*.2,yb-h*.38);
  q.quadraticCurveTo(x-w*.78,yb-h*.5,x-w*.2,yb-h*.64);q.lineTo(x-w*.22,yt);q.lineTo(x+w*.22,yt);q.lineTo(x+w*.2,yb-h*.64);
  q.quadraticCurveTo(x+w*.78,yb-h*.5,x+w*.2,yb-h*.38);q.quadraticCurveTo(x+w*.18,yb-h*.2,x+w*.5,yb-h*.12);q.lineTo(x+w*.5,yb);q.closePath();
  q.fillStyle=lg(q,x-w*.6,0,x+w*.6,0,[0,'#4a4578',.5,'#8f89c0',1,'#403b6c']);q.fill()}
function parapet(q,G,o){
  var s=G.s,W=G.W,yF=G.yF,wt=G.wt,cx=G.cx,x,k;
  /* cây tùng + pha lê mọc ngoài lan can */
  var r=R(41);pine(q,W*.06,yF-12*s,Math.min(150*s,(yF-12*s)-wt*.2),30*s,r,s);
  o.cry=[];[[.93,34,70],[.965,22,46],[.895,18,36]].forEach(function(a){var cx2=W*a[0],h=a[2]*s,w=a[1]*s;crystal(q,cx2,yF-8*s,w,h,'#e9fffb','#3fc7c0');o.cry.push([cx2,yF-8*s-h*.55,h])});
  /* chân lan can + con tiện + thanh ngang */
  var sp=15*s;
  for(x=-sp;x<W+sp;x+=sp)baluster(q,x,yF-6*s,wt+8*s,5.4*s);
  q.fillStyle=lg(q,0,yF-8*s,0,yF,[0,'#7b75a8',1,'#33305a']);q.fillRect(0,yF-8*s,W,8*s);
  q.fillStyle='rgba(255,255,255,.22)';q.fillRect(0,yF-8*s,W,1.2);
  q.fillStyle=lg(q,0,wt,0,wt+8*s,[0,'#a29cc8',.5,'#6f6aa0',1,'#47436f']);q.fillRect(0,wt,W,8*s);
  q.fillStyle='rgba(255,255,255,.38)';q.fillRect(0,wt,W,1.4);
  q.fillStyle='rgba(10,6,40,.38)';q.fillRect(0,wt+8*s,W,3*s);
  /* trụ + đèn đá */
  o.lamps=[];
  for(k=-14;k<=13;k++){x=cx+(k+.5)*130*s;if(x<-30*s||x>W+30*s)continue;
    var pw=16*s,top=wt-9*s;
    q.fillStyle=lg(q,x-pw/2,0,x+pw/2,0,[0,'#4a4578',.45,'#9690c4',1,'#3c3868']);q.fillRect(x-pw/2,top,pw,yF-top);
    q.fillStyle='rgba(255,255,255,.3)';q.fillRect(x-pw/2,top,pw,1.3);
    q.fillStyle='rgba(15,8,50,.4)';q.fillRect(x-pw/2,wt+11*s,pw,2.2*s);
    q.fillStyle=lg(q,x-pw*.65,0,x+pw*.65,0,[0,'#524c80',.5,'#a8a2d0',1,'#413d6e']);q.fillRect(x-pw*.62,top-6*s,pw*1.24,6*s);
    var bw=11*s,by0=top-6*s-10*s;
    q.fillStyle='#6a649a';q.fillRect(x-2.4*s,top-6*s-5*s,4.8*s,5*s);
    q.fillStyle='#2a2150';q.fillRect(x-bw/2,by0-9*s,bw,13*s);
    q.fillStyle='#ffe2a0';q.fillRect(x-bw*.32,by0-6.5*s,bw*.64,8*s);
    q.strokeStyle='#8a84b8';q.lineWidth=1;q.strokeRect(x-bw/2,by0-9*s,bw,13*s);
    q.fillStyle='#4a4478';q.beginPath();q.moveTo(x-bw*.95,by0-9*s);q.quadraticCurveTo(x-bw*.4,by0-11*s,x,by0-19*s);q.quadraticCurveTo(x+bw*.4,by0-11*s,x+bw*.95,by0-9*s);q.quadraticCurveTo(x,by0-7.5*s,x-bw*.95,by0-9*s);q.fill();
    q.fillStyle='rgba(255,255,255,.28)';q.fillRect(x-bw*.9,by0-9.6*s,bw*1.8,1);
    o.lamps.push({x:x,y:by0-2.5*s,r:bw})}
}
function floor(q,G){
  var s=G.s,W=G.W,H=G.H,yF=G.yF,cx=G.cx,vpY=yF-170*s,N=14,k,j,r=R(11),dpG=G.GY-vpY;
  q.fillStyle=lg(q,0,yF,0,H,[0,'#6a6496',.1,'#4e4880',.5,'#302a58',1,'#171231']);q.fillRect(0,yF,W,H-yF);
  for(k=0;k<N;k++){
    var y0=yF+(H-yF)*Math.pow(k/N,1.55),y1=yF+(H-yF)*Math.pow((k+1)/N,1.55),d0=(y0-vpY)/dpG,d1=(y1-vpY)/dpG,s0=78*s*d0,s1=78*s*d1,off=(k%2)*.5;
    var j0=-Math.ceil(cx/s0)-3,j1=Math.ceil((W-cx)/s0)+3;
    for(j=j0;j<=j1;j++){
      var a0=cx+(j+off)*s0,b0=cx+(j+1+off)*s0,a1=cx+(j+off)*s1,b1=cx+(j+1+off)*s1;
      if(b0<-6&&b1<-6)continue;if(a0>W+6&&a1>W+6)continue;
      q.beginPath();q.moveTo(a0,y0);q.lineTo(b0,y0);q.lineTo(b1,y1);q.lineTo(a1,y1);q.closePath();
      q.fillStyle=r()<.5?'rgba(255,240,255,'+(.015+r()*.07)+')':'rgba(5,0,30,'+(.04+r()*.11)+')';q.fill();
      q.strokeStyle='rgba(8,4,34,.5)';q.lineWidth=Math.max(.6,1.1*d1);q.stroke();
      q.strokeStyle='rgba(205,195,255,.10)';q.lineWidth=1;q.beginPath();q.moveTo(a0+1,y0+.8);q.lineTo(b0-1,y0+.8);q.stroke()}}
  /* vết nứt + rêu + cỏ linh */
  for(k=0;k<30;k++){var px=r()*W,py=yF+8*s+Math.pow(r(),.9)*(H-yF),sg=3+(r()*3|0);q.strokeStyle='rgba(5,0,25,.34)';q.lineWidth=.7+r()*.8;q.beginPath();q.moveTo(px,py);for(j=0;j<sg;j++){px+=(r()-.5)*16*s;py+=(r()*.5)*8*s;q.lineTo(px,py)}q.stroke()}
  for(k=0;k<22;k++){var mx2=r()*W,my2=yF+4*s+Math.pow(r(),1.6)*(H-yF)*.7;q.fillStyle='rgba(70,195,150,'+(.1+r()*.14)+')';el(q,mx2,my2,(10+r()*22)*s,(2+r()*3)*s);q.fill()}
  for(k=0;k<70;k++){var gx=r()*W,gy=yF+(r()*6)*s;q.strokeStyle='rgba(90,215,165,'+(.35+r()*.4)+')';q.lineWidth=1;q.beginPath();q.moveTo(gx,gy);q.lineTo(gx+(r()-.5)*3*s,gy-(3+r()*5)*s);q.stroke()}
  /* vòng ấn khắc quanh đài (nền sân) */
  var cyR=G.GY,RR=G.R;q.save();q.lineCap='round';
  [1.5,1.64].forEach(function(f,i){q.strokeStyle='rgba('+(i?'175,150,255':'120,235,205')+','+(i?.2:.28)+')';q.lineWidth=(i?1.2:2)*s;if(i)q.setLineDash([6*s,9*s]);el(q,G.cx,cyR,RR*f,RR*f*.16);q.stroke();q.setLineDash([])});
  for(k=0;k<16;k++){var an=k*Math.PI/8,cs=Math.cos(an),sn2=Math.sin(an);q.strokeStyle='rgba(120,235,205,.26)';q.lineWidth=1.6*s;q.beginPath();q.moveTo(G.cx+cs*RR*1.5,cyR+sn2*RR*.16*1.5);q.lineTo(G.cx+cs*RR*1.64,cyR+sn2*RR*.16*1.64);q.stroke();
    if(k%2===0){q.fillStyle='rgba(120,235,205,.3)';q.beginPath();q.arc(G.cx+cs*RR*1.57,cyR+sn2*RR*.16*1.57,1.7*s,0,6.2832);q.fill()}}
  q.restore();
  /* ánh trăng đổ xuống sân + bóng lan can + tối dần phía trước */
  q.fillStyle=rg(q,cx,G.GY,0,Math.max(W*.62,260*s),[0,'rgba(190,205,255,.22)',.5,'rgba(150,140,235,.08)',1,'rgba(100,80,200,0)']);q.fillRect(0,yF,W,H-yF);
  q.fillStyle=lg(q,0,yF,0,yF+16*s,[0,'rgba(8,4,34,.5)',1,'rgba(8,4,34,0)']);q.fillRect(0,yF,W,16*s);
  q.fillStyle=lg(q,0,G.GY+(H-G.GY)*.35,0,H,[0,'rgba(5,2,20,0)',1,'rgba(5,2,20,.55)']);q.fillRect(0,G.GY,W,H-G.GY);
}
function pillar(q,x,by,w,h,lit){
  var top=by-h;q.save();
  q.fillStyle='rgba(6,3,28,.4)';el(q,x+w*.1,by+1.5,w*.78,w*.17);q.fill();     /* bóng đổ */
  q.fillStyle=lg(q,x-w*.7,0,x+w*.7,0,[0,'#322d5e',.5,'#4a4478',1,'#2a2552']);q.fillRect(x-w*.62,by-w*.2,w*1.24,w*.2);   /* đế */
  q.beginPath();q.moveTo(x-w/2,by-w*.2);q.lineTo(x-w*.47,top+h*.08);q.quadraticCurveTo(x-w*.4,top-w*.05,x,top-w*.12);q.quadraticCurveTo(x+w*.42,top-w*.05,x+w*.47,top+h*.08);q.lineTo(x+w/2,by-w*.2);q.closePath();
  q.fillStyle=lg(q,x-w/2,0,x+w/2,0,lit>0?[0,'#2a2552',.5,'#4c4680',1,'#8a86c2']:[0,'#8a86c2',.5,'#4c4680',1,'#2a2552']);q.fill();
  q.strokeStyle='rgba(205,200,255,.32)';q.lineWidth=1;q.stroke();
  q.save();q.clip();
  var r=R(Math.round(x*7+h));for(var i=0;i<7;i++){var yy=top+h*(.1+.8*r());q.strokeStyle='rgba(8,4,40,.2)';q.lineWidth=.7+r();q.beginPath();q.moveTo(x-w,yy);q.lineTo(x+w,yy+(r()-.5)*5);q.stroke()}
  q.restore();
  var pw=w*.62,ph=w*.72,py=top+h*.3;
  q.fillStyle='#0f0a2a';q.beginPath();if(q.roundRect)q.roundRect(x-pw/2,py,pw,ph,pw*.28);else q.rect(x-pw/2,py,pw,ph);q.fill();
  q.strokeStyle='rgba(175,165,235,.55)';q.lineWidth=1.2;q.stroke();
  q.fillStyle='rgba(70,195,150,.5)';el(q,x,by-w*.2,w*.5,w*.1);q.fill();       /* rêu chân bia */
  q.restore();
  return{x:x,y:py+ph*.5,r:pw*.5}}
function pillars(q,G,o){
  var s=G.s,W=G.W,cx=G.cx,yF=G.yF,mx=o.moon.x;o.pil=[];
  [[0,-.43,24,100,10],[1,-.30,30,128,24],[2,.30,30,128,24],[3,.43,24,100,10]].forEach(function(a){
    var x=cx+a[1]*W,p=pillar(q,x,yF+a[4]*s,a[2]*s,a[3]*s,x<mx?1:-1);p.i=a[0];o.pil.push(p)})}
function dais(q,G){
  var s=G.s,cx=G.cx,cy=G.GY,R_=G.R,k;
  function drum(y,rx,t,c1,c2,s1,s2){
    var ry=rx*.16;
    q.beginPath();q.moveTo(cx-rx,y);q.lineTo(cx-rx,y+t);q.ellipse(cx,y+t,rx,ry,0,Math.PI,0,true);q.lineTo(cx+rx,y);q.closePath();
    q.fillStyle=lg(q,cx-rx,0,cx+rx,0,[0,s1,.3,s2,.62,'#4a4580',1,s1]);q.fill();
    for(var i=1;i<14;i++){var ax=cx-rx+rx*2*i/14;q.strokeStyle='rgba(10,6,40,.16)';q.lineWidth=1;q.beginPath();q.moveTo(ax,y+ry*Math.sqrt(Math.max(0,1-Math.pow((ax-cx)/rx,2))));q.lineTo(ax,y+t+ry*Math.sqrt(Math.max(0,1-Math.pow((ax-cx)/rx,2))));q.stroke()}
    el(q,cx,y,rx,ry);q.fillStyle=lg(q,0,y-ry,0,y+ry,[0,c1,1,c2]);q.fill();
    q.strokeStyle='rgba(225,220,255,.4)';q.lineWidth=1.2;q.stroke()}
  q.fillStyle=rg(q,cx,cy+14*s,R_*.3,R_*1.45,[0,'rgba(4,2,20,.5)',1,'rgba(4,2,20,0)']);el(q,cx,cy+14*s,R_*1.45,R_*.3);q.fill();
  drum(cy+8*s,R_*1.18,11*s,'#8a84b8','#5e5990','#2a2552','#4f4a86');
  drum(cy,R_,9*s,'#a29cce','#6f6aa4','#2e2858','#58528e');
  var ry=R_*.16;
  /* rãnh vòng + 8 dấu bát quái trên mặt đài */
  [.93,.86,.74].forEach(function(f,i){q.strokeStyle='rgba(16,10,48,.5)';q.lineWidth=(1.6-i*.2)*s+.4;el(q,cx,cy,R_*f,ry*f);q.stroke();q.strokeStyle='rgba(225,218,255,.22)';q.lineWidth=1;el(q,cx,cy+1.2,R_*f,ry*f);q.stroke()});
  for(k=0;k<8;k++){var a=k*Math.PI/4+Math.PI/8,c=Math.cos(a),sn=Math.sin(a);
    q.strokeStyle='rgba(236,230,255,.5)';q.lineWidth=2.2*s+.3;q.lineCap='round';q.beginPath();q.moveTo(cx+c*R_*.78,cy+sn*ry*.78);q.lineTo(cx+c*R_*.9,cy+sn*ry*.9);q.stroke();
    q.fillStyle='rgba(20,12,56,.55)';q.beginPath();q.arc(cx+c*R_*.82,cy+sn*ry*.82+.8,1.2*s+.4,0,6.2832);q.fill()}
  /* đài giữa nâng cao + hoa sen trận pháp */
  drum(cy-3*s,R_*.62,6*s,'#aaa4d4','#7a74ae','#34305e','#5c5694');
  q.save();q.translate(cx,cy-3*s);q.scale(1,.16);
  q.strokeStyle='rgba(20,12,56,.45)';q.lineWidth=1.6;[.5,.34].forEach(function(f){q.beginPath();q.arc(0,0,R_*.62*f*1.4,0,6.2832);q.stroke()});
  for(k=0;k<8;k++){q.save();q.rotate(k*Math.PI/4);q.fillStyle='rgba(165,255,225,.14)';q.strokeStyle='rgba(185,255,232,.4)';q.lineWidth=1.2;q.beginPath();q.ellipse(R_*.3,0,R_*.17,R_*.06,0,0,6.2832);q.fill();q.stroke();q.restore()}
  q.strokeStyle='rgba(215,205,255,.35)';q.lineWidth=1.2;q.beginPath();for(k=0;k<8;k++){var a2=k*Math.PI/4+Math.PI/8;q[k?'lineTo':'moveTo'](Math.cos(a2)*R_*.5,Math.sin(a2)*R_*.5)}q.closePath();q.stroke();
  q.restore();
}

/* ---------- cực quang: rèm tia đứng mềm, tuần hoàn theo chiều ngang để trượt không đứt ---------- */
function aurora(G,o){
  var W=G.W,hh=Math.ceil(G.wt*.78),s=G.s,TP=6.2832;o.au=[];o.auH=hh;
  [['110,255,200',.26,.34,1,2,.9],['165,125,255',.20,.30,2,1,.7],['90,205,255',.34,.26,1,3,.6]].forEach(function(b,j){
    var cv=mkc(W*G.D,hh*G.D),q=cv.getContext('2d'),x,r=R(60+j);q.scale(G.D,G.D);
    for(x=0;x<W;x+=4){
      var u=x/W*TP,y0=hh*b[1]+Math.sin(u*b[3]+j)*24*s+Math.sin(u*(b[3]+2)+j*2)*10*s,len=hh*b[2]*(.55+.45*Math.sin(u*b[4]+j*1.7))*(.8+r()*.4);
      q.fillStyle=lg(q,0,y0,0,y0+len,[0,'rgba('+b[0]+',0)',.18,'rgba('+b[0]+','+(b[5]*.5)+')',.5,'rgba('+b[0]+','+(b[5]*.22)+')',1,'rgba('+b[0]+',0)']);
      q.fillRect(x,y0,5,len)}
    o.au.push(cv)})}

/* ---------- dựng cache ---------- */
function build(G){
  var o={tw:[],moon:null,lamps:[],pil:[],cry:[]},mk=function(){var cv=mkc(G.W*G.D,G.H*G.D),q=cv.getContext('2d');q.scale(G.D,G.D);return{cv:cv,q:q}};
  var a=mk(),b=mk(),c=mk();
  sky(a.q,G,o);mountains(b.q,G,o);parapet(c.q,G,o);floor(c.q,G);pillars(c.q,G,o);dais(c.q,G);
  o.back=a.cv;o.mid=b.cv;o.front=c.cv;aurora(G,o);
  var r=R(77),s=G.s;o.cl=[];
  for(var i=0;i<6;i++){var w=(170+r()*110)*s,h=(58+r()*34)*s;o.cl.push({sp:cloudSpr(w,h,i%2?'205,175,235':'225,200,245','rgba(255,248,255,.5)',r),w:w,h:h,y:G.yF-(14+r()*72)*s,v:.07+r()*.11,p:r()*2000,a:.28+r()*.2})}
  return o}

/* ---------- vẽ mỗi khung ---------- */
function paint(g,W,H,s,GY,t,inf){
  if(BAD)return false;
  try{
    var D=(typeof DPR!=='undefined'&&DPR>0)?DPR:1,k=W+'x'+H+'x'+Math.round(GY)+'x'+D+'x'+s.toFixed(3);
    if(!C||k!==KEY){C=null;var G=geo(W,H,s,GY);G.D=D;C=build(G);C.G=G;KEY=k}
    var G2=C.G,o=C,i,lite=ql()>=2,sel=inf&&inf.sel>=0?inf.sel:-1,scol=(inf&&inf.col)||'#9fe0c0',cx=G2.cx,cy=GY;
    g.save();
    g.drawImage(o.back,0,0,W,H);
    /* sao nháy */
    g.fillStyle='#fff';for(i=0;i<o.tw.length;i++){var st=o.tw[i];g.globalAlpha=.25+.7*Math.abs(Math.sin(t*.03+i*1.7));g.beginPath();g.arc(st[0],st[1],st[2]*1.15,0,6.2832);g.fill()}
    g.globalAlpha=1;
    /* sao băng (mỗi ~12 giây) */
    var per=720,ph=(t%per)/44;if(ph<1){var rr=R(Math.floor(t/per)+9),sx=W*(.15+.6*rr()),sy=G2.wt*(.05+.25*rr()),ln=90*s*(.7+rr()*.6),p=ph;
      var hx=sx+p*ln*2.2,hy=sy+p*ln*.9;g.globalCompositeOperation='lighter';g.strokeStyle=lg(g,hx-ln,hy-ln*.41,hx,hy,[0,'rgba(255,255,255,0)',1,'rgba(220,245,255,'+(1-p)*.9+')']);g.lineWidth=1.8;g.beginPath();g.moveTo(hx-ln,hy-ln*.41);g.lineTo(hx,hy);g.stroke();g.globalCompositeOperation='source-over'}
    /* cực quang (rèm dựng sẵn, trượt ngang + nhấp nháy; nằm sau núi) */
    if(!lite&&o.au){g.globalCompositeOperation='lighter';var sh=(t*.18)%W;
      for(i=0;i<3;i++){g.globalAlpha=.55+.35*Math.sin(t*.017+i*2.1);var ox=(i===1?-1:1)*sh*(i?.6:1);ox=((ox%W)+W)%W;g.drawImage(o.au[i],ox-W,0,W,o.auH);g.drawImage(o.au[i],ox,0,W,o.auH)}
      g.globalAlpha=1;g.globalCompositeOperation='source-over'}
    g.drawImage(o.mid,0,0,W,H);
    /* mây trôi */
    var nc=lite?3:o.cl.length;for(i=0;i<nc;i++){var c=o.cl[i],cxp=((c.p+t*c.v*(i%2?-1:1))%(W+2*c.w)+(W+2*c.w))%(W+2*c.w)-c.w;g.globalAlpha=c.a;g.drawImage(c.sp,cxp,c.y,c.w,c.h)}
    g.globalAlpha=1;
    /* ánh sáng pha lê */
    g.globalCompositeOperation='lighter';
    for(i=0;i<o.cry.length;i++){var cr=o.cry[i];glow(g,'#7af0e0',cr[0],cr[1],cr[2]*.9,.32+.16*Math.sin(t*.05+i*2))}
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.drawImage(o.front,0,0,W,H);
    /* đèn đá + bia + ấn trận: cộng sáng */
    g.globalCompositeOperation='lighter';
    for(i=0;i<o.lamps.length;i++){var lp=o.lamps[i];glow(g,'#ffc870',lp.x,lp.y,lp.r*3.4,.42+.2*Math.sin(t*.11+i*2.3)+.07*Math.sin(t*.37+i))}
    var pf=FONT;
    for(i=0;i<o.pil.length;i++){var pl=o.pil[i],on=pl.i===sel,pc=PIL[pl.i].c,al=on?.62+.28*Math.sin(t*.07):.2+.06*Math.sin(t*.04+pl.i);
      glow(g,pc,pl.x,pl.y,pl.r*(on?7:3.2),al*(on?1:.45));
      if(on){glow(g,pc,pl.x,pl.y-pl.r*2,pl.r*11,.2+.07*Math.sin(t*.05));
        var bk=rgb(pc),b0=pl.y-pl.r*1.6,bl=Math.min(b0-4,200*s);g.globalAlpha=.8+.2*Math.sin(t*.06);g.fillStyle=lg(g,0,b0,0,b0-bl,[0,'rgba('+bk+',.30)',.6,'rgba('+bk+',.10)',1,'rgba('+bk+',0)']);g.fillRect(pl.x-pl.r*.85,b0-bl,pl.r*1.7,bl)}}
    g.globalCompositeOperation='source-over';
    g.textAlign='center';g.textBaseline='middle';
    for(i=0;i<o.pil.length;i++){var p2=o.pil[i],on2=p2.i===sel;g.font='bold '+Math.round(p2.r*1.7)+'px '+pf;g.globalAlpha=on2?.95:.38;g.fillStyle=on2?'#fffaf0':PIL[p2.i].c;g.shadowColor=PIL[p2.i].c;g.shadowBlur=on2?10:3;g.fillText(PIL[p2.i].ch,p2.x,p2.y+1)}
    g.shadowBlur=0;g.globalAlpha=1;g.textBaseline='alphabetic';
    /* ấn trận quanh đài: dải sáng chạy vòng + dải đứt đoạn xoay + tâm toả sáng */
    var R_=G2.R,ry=R_*.16;
    g.globalCompositeOperation='lighter';
    glow(g,scol,cx,cy-3*s,R_*.75,.20+.07*Math.sin(t*.05));
    for(i=0;i<8;i++){var a=i*Math.PI/4+Math.PI/8,ac=Math.max(0,Math.sin(t*.05-i*.8));glow(g,'#9fffd8',cx+Math.cos(a)*R_*.86,cy+Math.sin(a)*ry*.86,10*s,.12+.55*ac)}
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.save();g.translate(cx,cy);g.scale(1,.16);g.lineCap='round';g.strokeStyle='rgba(170,255,225,.45)';g.lineWidth=2.2*s;g.setLineDash([12*s,16*s]);g.lineDashOffset=-t*.4;g.beginPath();g.arc(0,0,R_*.99,0,6.2832);g.stroke();
    g.setLineDash([5*s,12*s]);g.lineDashOffset=t*.55;g.strokeStyle='rgba(215,200,255,.4)';g.lineWidth=1.8*s;g.beginPath();g.arc(0,0,R_*.7,0,6.2832);g.stroke();g.restore();
    /* linh khí bay lên từ đài */
    g.globalCompositeOperation='lighter';var nm=lite?7:16;
    for(i=0;i<nm;i++){var pp=((t*.0035)+i/nm)%1,mx=cx+Math.sin(i*5.1+t*.01)*R_*.82,my=cy-4*s-pp*150*s;glow(g,i%3?'#9fffd8':'#d8c4ff',mx,my,(2.4+(i%3))*s*2.2,Math.sin(pp*3.1416)*.75)}
    g.restore();
    return true
  }catch(e){BAD=true;C=null;if(window.console)console.error('BQART',e);return false}
}
window.BQART={paint:paint,reset:function(){C=null;KEY='';BAD=false}};
})();
