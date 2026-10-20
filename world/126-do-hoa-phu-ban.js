/* ===== 🎨 NÂNG CẤP ĐỒ HOẠ 3 PHỤ BẢN (world/126-do-hoa-phu-ban.js · Fix369) =====
 * Chỉ thay phần HÌNH VẼ của ⚡ Thiên Lôi Cổ Địa (114), 🪞 Huyễn Cảnh Kính Hồ (115), 💀 Cốt Hải Sa Mạc (116). Không đổi chỉ số, cơ chế, độ khó, thưởng.
 *  - Nền: phần TĨNH (trời, núi, tháp, đảo, hồ, xương rồng, cồn cát...) vẽ 1 lần vào canvas đệm (đúng cơ chế Fix364); phần ĐỘNG rất rẻ, tự giảm theo QL (0 Cao · 1 Cân bằng · 2 Tiết kiệm).
 *  - Vòng cảnh báo / đòn đánh (sét, sóng hồ, gai xương) vẽ lại: vòng rune xoay, tia sét phân nhánh, tia lửa, nứt đất, bụi cát.
 *  - Hình boss: giữ hình cũ rồi vẽ thêm lớp SAU (cánh, hào quang, vòng mảnh) và lớp TRƯỚC (gân sáng, lấp lánh, lửa mắt) — không làm mất hình gốc.
 *  - Quái thường: hào quang/bóng đổ/hạt bay theo chủ đề từng phụ bản (vẫn dùng sprite gốc).
 * Kết nối: Thiên Lôi qua TLC.setPro() (114 có móc PRO); Kính Hồ/Cốt Hải thay cfg.bgS/bg/drawHazard/foeAfter/boss.paint trong PBC.maps.
 * Tắt nhanh: PBG.off() (về hình cũ) / PBG.on(). Tắt hẳn: bỏ <script> 126 trong index.html. Phụ thuộc: world/114, 114a, 115, 116. */
(function(){
'use strict';
if(typeof g==='undefined'||typeof c==='undefined')return;
var T=6.283185,PI=Math.PI;
function rnd(a){var x=Math.sin(a*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function lite(){return (window.QL|0)>=2}
function mid(){return (window.QL|0)>=1}

/* ---------- tiện ích vẽ ---------- */
function glow(x,cx,cy,r,rgb,a0){var q=x.createRadialGradient(cx,cy,0,cx,cy,r);q.addColorStop(0,'rgba('+rgb+','+a0+')');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;x.beginPath();x.arc(cx,cy,r,0,T);x.fill()}
function eglow(x,cx,cy,rx,ry,rgb,a0){var q=x.createRadialGradient(cx,cy,0,cx,cy,rx);q.addColorStop(0,'rgba('+rgb+','+a0+')');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,T);x.fill()}
function ringE(x,cx,cy,R,k){x.beginPath();x.ellipse(cx,cy,R,R*k,0,0,T);x.stroke()}
function strokePts(x,pts){x.beginPath();for(var j=0;j<pts.length;j++){j?x.lineTo(pts[j][0],pts[j][1]):x.moveTo(pts[j][0],pts[j][1])}x.stroke()}
function poly(x,pts,fill,stroke,lw){var i;x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw||1.5;x.stroke()}}
function zig(x,x0,y0,x1,y1,n,amp,seed){var i,u;x.beginPath();x.moveTo(x0,y0);for(i=1;i<n;i++){u=i/n;x.lineTo(x0+(x1-x0)*u+(rnd(seed+i)-.5)*amp,y0+(y1-y0)*u+(rnd(seed+i+40)-.5)*amp)}x.lineTo(x1,y1);x.stroke()}
function ridge(x,gy,j,col,amp,hb,rim){
  var n=48,i,xx,yy,pts=[];
  x.beginPath();x.moveTo(0,gy);
  for(i=0;i<=n;i++){xx=W*i/n;yy=gy-hb*s-Math.abs(Math.sin(i*.55+j*2.1))*amp*s-rnd(i*3+j*17)*amp*.5*s;pts.push([xx,yy]);x.lineTo(xx,yy)}
  x.lineTo(W,gy);x.closePath();x.fillStyle=col;x.fill();
  if(rim){x.strokeStyle=rim;x.lineWidth=1.2*s;strokePts(x,pts)}
}
/* canvas đệm cho nền tĩnh (dùng cho Thiên Lôi; Kính Hồ/Cốt Hải dùng bộ đệm của PBC) */
function cached(S,tk,gy,paint){
  var dp=(typeof DPR==='number'&&DPR>0)?DPR:1,key=W+'|'+H+'|'+gy+'|'+s+'|'+dp,cv=S.cv,x;
  if(!S.no&&(!cv||S.key!==key)){
    if(tk-S.last>120)S.miss=0;S.last=tk;
    if(++S.miss>12){S.no=1;S.cv=null;cv=null}
    else{
      try{
        if(!cv)cv=S.cv=document.createElement('canvas');
        if(cv.width!==c.width)cv.width=c.width;if(cv.height!==c.height)cv.height=c.height;
        x=cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(dp,0,0,dp,0,0);
        paint(x,gy);S.key=key;
      }catch(e){S.no=1;S.cv=null;cv=null}
    }
  }
  if(S.cv&&!S.no&&S.key===key){g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(S.cv,0,0);g.restore()}
  else paint(g,gy);
}
function boltGeo(bx,gy,seed){
  var pts=[[bx,-10]],n=11,i,y,br=[],b,k,p,dir,seg,j;
  for(i=1;i<n;i++){y=-10+(gy+10)*i/n;pts.push([bx+(rnd(seed+i)-.5)*54*s,y])}
  pts.push([bx,gy]);
  for(b=0;b<3;b++){
    k=2+((rnd(seed+b*7)*7)|0);p=pts[k];dir=rnd(seed+b*3+1)<.5?-1:1;seg=[[p[0],p[1]]];
    for(j=1;j<4;j++)seg.push([p[0]+dir*j*(16+rnd(seed+b+j)*14)*s,p[1]+j*(18+rnd(seed+j+b*2)*16)*s]);
    br.push(seg);
  }
  return {m:pts,b:br};
}

/* =====================================================================
 *  ⚡ THIÊN LÔI CỔ ĐỊA
 * ===================================================================== */
var TA=['143,216,255','169,200,255','255,143,232'];
var TL={S:{cv:null,key:'',miss:0,last:0,no:0},cr:[],farAt:0,farX:.5,farFl:0,base:null};

function isle(x,cx,cy,k){
  var q=x.createLinearGradient(0,cy-10*k,0,cy+60*k);q.addColorStop(0,'#2a2f6a');q.addColorStop(1,'#0b0d26');
  x.beginPath();x.moveTo(cx-70*k,cy);x.quadraticCurveTo(cx,cy-16*k,cx+70*k,cy);
  x.lineTo(cx+46*k,cy+22*k);x.lineTo(cx+22*k,cy+34*k);x.lineTo(cx+8*k,cy+62*k);x.lineTo(cx-10*k,cy+36*k);x.lineTo(cx-34*k,cy+28*k);x.lineTo(cx-52*k,cy+18*k);x.closePath();
  x.fillStyle=q;x.fill();x.strokeStyle='rgba(150,185,255,.5)';x.lineWidth=1.4*s;x.stroke();
  x.fillStyle='rgba(190,225,255,.88)';x.beginPath();x.moveTo(cx,cy-46*k);x.lineTo(cx+9*k,cy-8*k);x.lineTo(cx,cy-2*k);x.lineTo(cx-9*k,cy-8*k);x.closePath();x.fill();
  glow(x,cx,cy-24*k,34*k,'140,190,255',.5);
}
function spire(x,bx,gy,h){
  var w=h*.11,q=x.createLinearGradient(bx-w,0,bx+w,0),i,yy;
  q.addColorStop(0,'#3a4080');q.addColorStop(.5,'#1a1d4c');q.addColorStop(1,'#0a0b22');
  x.beginPath();x.moveTo(bx-w*1.4,gy);x.lineTo(bx-w*.9,gy-h*.85);x.lineTo(bx,gy-h);x.lineTo(bx+w*.9,gy-h*.85);x.lineTo(bx+w*1.4,gy);x.closePath();
  x.fillStyle=q;x.fill();x.strokeStyle='rgba(150,185,255,.55)';x.lineWidth=1.3*s;x.stroke();
  x.strokeStyle='rgba(120,160,255,.45)';
  for(i=1;i<4;i++){yy=gy-h*i*.22;x.beginPath();x.moveTo(bx-w*1.1,yy);x.lineTo(bx+w*1.1,yy);x.stroke()}
  glow(x,bx,gy-h,h*.42,'150,200,255',.45);
  x.fillStyle='rgba(235,245,255,.95)';x.beginPath();x.arc(bx,gy-h,3*s,0,T);x.fill();
}
function tlStatic(x,gy){
  var i,j,q,px,py,a,m,L,yy;
  q=x.createLinearGradient(0,0,0,gy);q.addColorStop(0,'rgba(5,6,26,.66)');q.addColorStop(.6,'rgba(24,26,78,.42)');q.addColorStop(1,'rgba(74,70,150,.30)');
  x.fillStyle=q;x.fillRect(0,0,W,gy);
  q=x.createLinearGradient(0,gy*.68,0,gy);q.addColorStop(0,'rgba(120,140,255,0)');q.addColorStop(1,'rgba(130,150,255,.26)');
  x.fillStyle=q;x.fillRect(0,gy*.68,W,gy*.32);
  ridge(x,gy,0,'rgba(54,60,120,.85)',46,40,'rgba(150,180,255,.30)');
  ridge(x,gy,1,'rgba(30,34,84,.92)',38,16,'rgba(140,170,255,.38)');
  [[.16,.30,1],[.5,.19,1.25],[.83,.36,.85]].forEach(function(p){isle(x,W*p[0],gy*p[1],p[2]*s)});
  [.07,.31,.68,.94].forEach(function(u,k){spire(x,W*u,gy,(96+k%2*38)*s)});
  ridge(x,gy,2,'rgba(14,16,40,.96)',20,0,'rgba(120,150,240,.30)');
  q=x.createLinearGradient(0,gy,0,H);q.addColorStop(0,'rgba(18,20,52,.78)');q.addColorStop(1,'rgba(8,10,28,.62)');
  x.fillStyle=q;x.fillRect(0,gy,W,H-gy);
  x.strokeStyle='rgba(120,150,255,.14)';x.lineWidth=1*s;
  for(i=1;i<=3;i++){yy=gy+(H-gy)*(i*i/9+.03);x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
  for(i=-8;i<=8;i++){x.beginPath();x.moveTo(W*.5+i*W*.045,gy);x.lineTo(W*.5+i*W*.2,H);x.stroke()}
  TL.cr=[];x.lineJoin='round';
  for(i=0;i<16;i++){
    px=rnd(i*5+1)*W;py=gy+(H-gy)*(.1+rnd(i*5+2)*.85);L=[[px,py]];a=rnd(i*5+3)*T;m=3+((rnd(i*5+4)*4)|0);
    for(j=0;j<m;j++){a+=(rnd(i*9+j)-.5)*1.6;px+=Math.cos(a)*(14+rnd(i*7+j)*22)*s;py+=Math.sin(a)*(5+rnd(i*3+j)*8)*s;L.push([px,py])}
    TL.cr.push(L);
  }
  x.globalCompositeOperation='lighter';
  TL.cr.forEach(function(L){x.strokeStyle='rgba(90,140,255,.20)';x.lineWidth=5*s;strokePts(x,L);x.strokeStyle='rgba(190,220,255,.55)';x.lineWidth=1.4*s;strokePts(x,L)});
  x.globalCompositeOperation='source-over';
}
function tlBolts(gy,st){
  var tk=st.tk,bs=st.bolts,i,j,b,age,x,R=st.R*s,W0=st.warn,u,pu,rot,an,k,al,p,cg,rr,cx;
  if(!bs||!bs.length)return;
  g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
  for(i=0;i<bs.length;i++){
    b=bs[i];age=tk-b.t0;x=b.x*s;
    if(age<W0){
      u=age/W0;pu=.5+.5*Math.sin(tk*(.25+u*.5));rot=tk*.04;
      eglow(g,x,gy,R*1.15,R*.34,'140,190,255',.12+.3*u);
      g.strokeStyle='rgba(220,238,255,'+(.4+.5*pu)+')';g.lineWidth=2*s;ringE(g,x,gy,R,.28);
      g.lineWidth=1.4*s;g.beginPath();
      for(j=0;j<12;j++){an=rot+j*T/12;g.moveTo(x+Math.cos(an)*R*.88,gy+Math.sin(an)*R*.88*.28);g.lineTo(x+Math.cos(an)*R*1.08,gy+Math.sin(an)*R*1.08*.28)}
      g.stroke();
      g.strokeStyle='rgba(170,210,255,'+(.25+.4*u)+')';rr=R*.72*(1-u*.25);
      for(k=0;k<2;k++){g.beginPath();for(j=0;j<=3;j++){an=-rot+j*T/3+k*PI/3;cx=x+Math.cos(an)*rr;p=gy+Math.sin(an)*rr*.28;j?g.lineTo(cx,p):g.moveTo(cx,p)}g.stroke()}
      g.strokeStyle='rgba(220,238,255,'+(.35+.5*pu)+')';ringE(g,x,gy,R*(1-u),.28);
    }else{
      k=(age-W0)/18;al=Math.max(0,1-k);
      if(!b._p)b._p=boltGeo(x,gy,b.seed);
      p=b._p;
      cg=g.createLinearGradient(0,0,0,gy);cg.addColorStop(0,'rgba(140,180,255,0)');cg.addColorStop(1,'rgba(150,190,255,'+(.3*al)+')');
      g.fillStyle=cg;g.fillRect(x-R*.55,0,R*1.1,gy);
      g.strokeStyle='rgba(110,160,255,'+(.4*al)+')';g.lineWidth=14*s;strokePts(g,p.m);
      g.strokeStyle='rgba(170,210,255,'+(.85*al)+')';g.lineWidth=5*s;strokePts(g,p.m);
      g.lineWidth=2.4*s;for(j=0;j<p.b.length;j++)strokePts(g,p.b[j]);
      g.strokeStyle='rgba(255,255,255,'+al+')';g.lineWidth=2.4*s;strokePts(g,p.m);
      eglow(g,x,gy,R*(1.2+k*.6),R*.4*(1+k*.6),'190,225,255',.7*al);
      rr=R*(.5+k*1.1);g.strokeStyle='rgba(210,230,255,'+(.9*al)+')';g.lineWidth=3*s*al;ringE(g,x,gy,rr,.28);
      g.strokeStyle='rgba(170,210,255,'+(.6*al)+')';ringE(g,x,gy,rr*.6,.28);
      if(!lite()){
        g.fillStyle='rgba(235,245,255,'+al+')';
        for(j=0;j<9;j++){
          an=rnd(b.seed+j)*PI;rr=k*(26+rnd(b.seed+j+9)*54)*s;
          g.fillRect(x+(rnd(b.seed+j+3)-.5)*2*rr,gy-Math.abs(Math.sin(an))*rr*.9+k*k*26*s,2.6*s,2.6*s);
        }
      }
    }
  }
  g.restore();
}
function tlBg(gy,st){
  var tk=st.tk,i,j,L=lite(),cn=L?3:6,fl=(st.flash||0)+TL.farFl*.4,cxx,cyy,rw,q,n,u,pts,Lc;
  cached(TL.S,tk,gy,tlStatic);
  if(tk>=TL.farAt){TL.farAt=tk+200+Math.random()*260;TL.farX=.1+Math.random()*.8;TL.farFl=12}
  if(TL.farFl>0)TL.farFl--;
  g.save();
  for(i=0;i<cn;i++){
    cxx=((i*W/cn*1.15+tk*(.12+i*.03))%(W*1.3))-W*.15;cyy=gy*(.1+(i%3)*.1);rw=W*(.16+(i%4)*.05);
    q=g.createRadialGradient(cxx,cyy,2,cxx,cyy,rw);q.addColorStop(0,'rgba(48,54,96,.5)');q.addColorStop(1,'rgba(48,54,96,0)');
    g.fillStyle=q;g.beginPath();g.ellipse(cxx,cyy,rw,rw*.32,0,0,T);g.fill();
  }
  g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
  if(TL.farFl>0){
    pts=boltGeo(TL.farX*W,gy*.78,(TL.farX*1000)|0);u=TL.farFl/12;
    g.strokeStyle='rgba(150,190,255,'+(.35*u)+')';g.lineWidth=7*s;strokePts(g,pts.m);
    g.strokeStyle='rgba(235,245,255,'+(.9*u)+')';g.lineWidth=1.8*s;strokePts(g,pts.m);
    for(j=0;j<pts.b.length;j++)strokePts(g,pts.b[j]);
  }
  if(fl>0){g.fillStyle='rgba(170,200,255,'+Math.min(.34,fl*.034)+')';g.fillRect(0,0,W,gy)}
  if(!L){
    for(i=0;i<TL.cr.length;i+=2){Lc=TL.cr[i];g.strokeStyle='rgba(150,200,255,'+(.14+.14*Math.sin(tk*.045+i))+')';g.lineWidth=3*s;strokePts(g,Lc)}
    n=mid()?12:24;g.strokeStyle='rgba(170,200,255,.22)';g.lineWidth=1*s;g.beginPath();
    for(i=0;i<n;i++){var rx=(rnd(i)*W*1.2+tk*(5+rnd(i+4)*3))%(W*1.2)-W*.1,ry=((rnd(i+8)*H+tk*(14+rnd(i+2)*8))%H);g.moveTo(rx,ry);g.lineTo(rx-5*s,ry+16*s)}
    g.stroke();
  }
  n=L?4:10;
  for(i=0;i<n;i++){u=((tk*(.0035+rnd(i)*.003)+rnd(i+3))%1);g.fillStyle='rgba(170,210,255,'+(.7*(1-u))+')';g.fillRect(rnd(i+6)*W+Math.sin(tk*.03+i)*14*s,H-(H-gy*.55)*u,2.4*s,2.4*s)}
  g.restore();
  tlBolts(gy,st);
}
function tlIdle(){var S=TL.S;S.cv=null;S.key='';S.miss=0;S.no=0}
function tlArcs(e,m,tk){
  var HH=m.h*(typeof BZ!=='undefined'?(BZ[e.b|0]||1):1)*SZ*s,x=e.x*s,cy=GY-HH*.5,rx=HH*.45,ry=HH*.55,boss=e.b===3,
      al=Math.max(.05,Math.min(1,1-e.in/30)),ph=Math.floor(tk/6),i,j,no=lite()?1:(boss?6:e.b===1?4:3),a0,a1,u,aa,jit,nb,oa;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;g.lineJoin='round';
  eglow(g,x,GY,HH*.5,HH*.12,'120,170,255',boss?.5:.32);
  if(!lite()){
    glow(g,x,cy,HH*.75,'110,160,255',boss?.28:.16);
    nb=boss?4:2;
    for(i=0;i<nb;i++){oa=tk*.05+i*T/nb;glow(g,x+Math.cos(oa)*HH*.5,cy+Math.sin(oa)*HH*.18-HH*.1,6*s*(boss?1.4:1),'190,225,255',.9)}
  }
  g.strokeStyle='rgba(215,235,255,.9)';g.lineWidth=Math.max(1,(boss?2:1.3)*s);
  for(i=0;i<no;i++){
    a0=rnd(ph*7+i*3+e.sn)*T;a1=a0+1.1+rnd(ph*5+i+e.sn)*1.4;
    g.beginPath();g.moveTo(x+Math.cos(a0)*rx,cy+Math.sin(a0)*ry);
    for(j=1;j<4;j++){u=j/4;aa=a0+(a1-a0)*u;jit=(rnd(ph*11+i*5+j+e.sn)-.5)*HH*.22;g.lineTo(x+Math.cos(aa)*(rx+jit),cy+Math.sin(aa)*(ry+jit))}
    g.lineTo(x+Math.cos(a1)*rx,cy+Math.sin(a1)*ry);g.stroke();
  }
  g.restore();
}
function tlBoss(cv,ph,t){
  TL.base(cv,ph,t);
  var c2=cv.getContext('2d'),K=TA[ph]||TA[0],i,q,sd=Math.floor(t/4),side;
  c2.save();c2.lineJoin='round';c2.lineCap='round';
  c2.globalCompositeOperation='lighter';
  c2.strokeStyle='rgba('+K+',.65)';c2.lineWidth=1.8;
  zig(c2,128,160,98,134,4,8,sd);zig(c2,128,160,158,134,4,8,sd+9);zig(c2,128,160,112,208,4,8,sd+17);zig(c2,128,160,144,208,4,8,sd+23);
  c2.strokeStyle='rgba('+K+',.4)';c2.lineWidth=1.4;
  for(i=0;i<3;i++){zig(c2,70+i*6,200+i*28,40+i*10,250+i*10,4,8,sd+i*5);zig(c2,186-i*6,200+i*28,216-i*10,250+i*10,4,8,sd+i*5+50)}
  glow(c2,111,92,9,K,.7);glow(c2,145,92,9,K,.7);
  c2.globalCompositeOperation='destination-over';
  for(side=-1;side<=1;side+=2){
    q=c2.createLinearGradient(128,120,128+side*120,40);q.addColorStop(0,'rgba(64,74,176,.7)');q.addColorStop(1,'rgba(20,24,80,0)');
    c2.beginPath();c2.moveTo(128+side*40,120);c2.lineTo(128+side*118,70);c2.lineTo(128+side*100,104);c2.lineTo(128+side*124,128);c2.lineTo(128+side*94,146);c2.lineTo(128+side*110,176);c2.lineTo(128+side*60,170);c2.closePath();
    c2.fillStyle=q;c2.fill();c2.strokeStyle='rgba('+K+',.55)';c2.lineWidth=2;c2.stroke();
    c2.strokeStyle='rgba(200,225,255,.4)';c2.lineWidth=1.4;
    zig(c2,128+side*50,124,128+side*112,76,4,9,sd+side*3+60);zig(c2,128+side*56,138,128+side*118,126,4,9,sd+side*3+70);zig(c2,128+side*58,152,128+side*104,172,4,9,sd+side*3+80);
  }
  c2.strokeStyle='rgba('+K+',.28)';c2.lineWidth=2;c2.beginPath();c2.ellipse(128,170,110,34,0,0,T);c2.stroke();
  c2.restore();
}

/* =====================================================================
 *  🪞 HUYỄN CẢNH KÍNH HỒ
 * ===================================================================== */
var KH={st:[]};
function crys(x,bx,gy,h,flip,k){
  var d=flip?-1:1,w=h*.16,o=(k%2?1:-1)*w*1.4;
  poly(x,[[bx-w,gy],[bx-w*.7,gy-h*.8*d],[bx,gy-h*d],[bx,gy]],'rgba(150,220,255,.78)','rgba(220,245,255,.6)',1.1*s);
  poly(x,[[bx,gy],[bx,gy-h*d],[bx+w*.7,gy-h*.8*d],[bx+w,gy]],'rgba(80,110,225,.78)','rgba(170,200,255,.5)',1.1*s);
  poly(x,[[bx+o-w*.5,gy],[bx+o,gy-h*.55*d],[bx+o+w*.5,gy]],'rgba(130,190,250,.7)','rgba(200,230,255,.5)',1*s);
  if(!flip)glow(x,bx,gy-h,h*.38,'160,225,255',.35);
}
function lotus(x,cx,cy,r){
  var i,a=[-.9,-.45,0,.45,.9];
  x.fillStyle='rgba(30,110,110,.55)';x.beginPath();x.ellipse(cx,cy+r*.2,r*1.6,r*.38,0,0,T);x.fill();
  glow(x,cx,cy-r*.3,r*1.8,'255,170,230',.3);
  for(i=0;i<5;i++){x.save();x.translate(cx,cy);x.rotate(a[i]);x.fillStyle='rgba(255,205,242,.82)';x.beginPath();x.ellipse(0,-r*.5,r*.26,r*.55,0,0,T);x.fill();x.restore()}
  x.fillStyle='rgba(255,240,190,.9)';x.beginPath();x.arc(cx,cy-r*.2,r*.2,0,T);x.fill();
}
function khStatic(gy,a,x){
  var i,j,q,mx_=W*.78,my=gy*.27,sp=[[.06,110],[.2,70],[.4,90],[.62,60],[.9,120]],y0,hh,sy2,ww,n=lite()?40:90;
  q=x.createLinearGradient(0,0,0,gy);q.addColorStop(0,'rgba(6,5,34,.66)');q.addColorStop(.6,'rgba(24,18,76,.42)');q.addColorStop(1,'rgba(40,110,140,.32)');
  x.fillStyle=q;x.fillRect(0,0,W,gy);
  KH.st=[];
  for(i=0;i<n;i++){
    var sx=rnd(i*3+1)*W,sy=rnd(i*3+2)*gy*.78,sr=(.5+rnd(i*3+3)*1.1)*s;
    x.fillStyle='rgba(235,242,255,'+(.35+rnd(i)*.55)+')';x.beginPath();x.arc(sx,sy,sr,0,T);x.fill();
    if(i%11===0)KH.st.push([sx,sy,sr]);
  }
  x.globalCompositeOperation='lighter';
  for(j=0;j<3;j++){
    y0=gy*(.14+j*.09);hh=gy*.2;
    q=x.createLinearGradient(0,y0-hh*.2,0,y0+hh);q.addColorStop(0,'rgba(120,255,225,0)');q.addColorStop(.35,'rgba('+(j===1?'180,140,255':'110,240,220')+',.17)');q.addColorStop(1,'rgba(100,160,255,0)');
    x.fillStyle=q;x.beginPath();x.moveTo(0,y0+hh);
    for(i=0;i<=24;i++)x.lineTo(W*i/24,y0+Math.sin(i*.5+j*1.7)*gy*.045+Math.sin(i*1.3+j)*gy*.02);
    x.lineTo(W,y0+hh);x.closePath();x.fill();
  }
  x.globalCompositeOperation='source-over';
  glow(x,mx_,my,gy*.55,'160,180,255',.40);
  x.fillStyle='rgba(246,250,255,.95)';x.beginPath();x.arc(mx_,my,gy*.07,0,T);x.fill();
  x.fillStyle='rgba(185,200,235,.45)';
  [[-.3,-.2,.2],[.25,.1,.25],[-.05,.35,.15]].forEach(function(p){x.beginPath();x.arc(mx_+p[0]*gy*.07,my+p[1]*gy*.07,p[2]*gy*.07,0,T);x.fill()});
  x.strokeStyle='rgba(200,215,255,.25)';x.lineWidth=1.2*s;ringE(x,mx_,my,gy*.12,1);ringE(x,mx_,my,gy*.19,1);
  ridge(x,gy,3,'rgba(26,22,84,.8)',30,10,'rgba(160,190,255,.25)');
  sp.forEach(function(p,k){crys(x,W*p[0],gy,p[1]*s,0,k)});
  q=x.createLinearGradient(0,gy,0,H);q.addColorStop(0,'rgba(80,170,215,.38)');q.addColorStop(1,'rgba(30,30,100,.34)');
  x.fillStyle=q;x.fillRect(0,gy,W,H-gy);
  x.save();x.beginPath();x.rect(0,gy,W,H-gy);x.clip();x.globalAlpha=.22;
  sp.forEach(function(p,k){crys(x,W*p[0],gy,p[1]*s,1,k)});x.restore();
  x.fillStyle='rgba(235,245,255,.20)';
  for(i=0;i<14;i++){sy2=gy+(H-gy)*(.04+i*.065);ww=(30-i*1.6)*s;x.fillRect(mx_-ww/2+Math.sin(i*2.1)*6*s,sy2,ww,2*s)}
  for(i=0;i<6;i++)lotus(x,W*(.08+rnd(i+30)*.84),gy+(H-gy)*(.3+rnd(i+40)*.6),(10+rnd(i+50)*8)*s);
  crys(x,W*.015,gy,70*s,0,1);crys(x,W*.045,gy,46*s,0,2);crys(x,W*.985,gy,64*s,0,3);crys(x,W*.955,gy,40*s,0,4);
}
function khBg(gy,a){
  var tk=a.tick(),i,L=a.lite(),mx_=W*.78,n,rx,ry,rw,fx,fy,al,sx,sy,rot,sy2;
  g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<KH.st.length;i++){al=.4+.5*Math.sin(tk*.06+i*1.7);if(al>0){g.fillStyle='rgba(255,255,255,'+al+')';g.fillRect(KH.st[i][0]-KH.st[i][2]*2.4,KH.st[i][1]-.4*s,KH.st[i][2]*4.8,.8*s);g.fillRect(KH.st[i][0]-.4*s,KH.st[i][1]-KH.st[i][2]*2.4,.8*s,KH.st[i][2]*4.8)}}
  g.lineWidth=2*s;n=L?5:9;
  for(i=0;i<n;i++){
    rx=((i*.113+.05+tk*.0006*(1+i%3*.3))%1)*W;ry=gy+(H-gy)*(.15+(i%5)*.17);rw=40*s+i%4*26*s;
    g.strokeStyle='rgba(180,225,255,'+(.10+.08*Math.sin(tk*.05+i))+')';g.beginPath();g.ellipse(rx,ry,rw,rw*.18,0,0,T);g.stroke();
  }
  g.fillStyle='rgba(235,245,255,.20)';
  for(i=0;i<7;i++){sy2=gy+(H-gy)*(.08+i*.13);g.fillRect(mx_-(18-i*1.5)*s+Math.sin(tk*.06+i)*5*s,sy2,(36-i*3)*s,2.2*s)}
  for(i=0;i<3;i++){rx=((i*.4+tk*.0004*(1+i*.4))%1.4-.2)*W;eglow(g,rx,gy,W*.28,gy*.06,'180,215,255',.07)}
  n=L?5:12;
  for(i=0;i<n;i++){
    fx=rnd(i)*W+Math.sin(tk*.011+i*1.9)*46*s;fy=gy*(.62+rnd(i+7)*.4)+Math.cos(tk*.014+i)*10*s;
    al=.35+.5*Math.sin(tk*.05+i*2.3);if(al>0)glow(g,fx,fy,7*s,'170,255,230',al);
  }
  if(!L){
    g.lineWidth=1.2*s;
    for(i=0;i<4;i++){
      sx=W*(.15+i*.22)+Math.sin(tk*.01+i)*18*s;sy=gy*(.3+(i%2)*.18)+Math.cos(tk*.013+i*2)*10*s;rot=tk*.01+i;
      g.strokeStyle='rgba(200,235,255,.6)';g.fillStyle='rgba(150,200,255,.14)';
      g.beginPath();for(n=0;n<4;n++){var ra=rot+n*PI/2,rr=(n%2?5:9)*s;n?g.lineTo(sx+Math.cos(ra)*rr,sy+Math.sin(ra)*rr):g.moveTo(sx+Math.cos(ra)*rr,sy+Math.sin(ra)*rr)}
      g.closePath();g.fill();g.stroke();
      if(Math.sin(tk*.04+i*1.9)>.9)glow(g,sx,sy,12*s,'230,250,255',.8);
    }
  }
  g.restore();
}
function khHazard(h,age,gy,a){
  var x=h.x*s,R=h.R*s,t=a.tick(),i,j,u,pu,q,k,al,an,rot,rr;
  g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';
  if(age<h.warn){
    u=age/h.warn;pu=.5+.5*Math.sin(t*(.22+u*.4));rot=t*.035;
    if(h.real){
      eglow(g,x,gy,R*1.15,R*.34,'150,235,255',.15+.32*u);
      g.strokeStyle='rgba(215,248,255,'+(.4+.5*pu)+')';g.lineWidth=2.4*s;ringE(g,x,gy,R,.28);ringE(g,x,gy,R*.8,.28);
      g.lineWidth=1.4*s;g.beginPath();
      for(j=0;j<6;j++){an=rot+j*T/6;g.moveTo(x+Math.cos(an)*R*.8,gy+Math.sin(an)*R*.8*.28);g.lineTo(x+Math.cos(an)*R*1.12,gy+Math.sin(an)*R*1.12*.28)}
      g.stroke();
      g.fillStyle='rgba(230,250,255,'+(.35+.4*pu)+')';
      for(j=0;j<6;j++){an=-rot+j*T/6;rr=R*.6;g.beginPath();g.moveTo(x+Math.cos(an)*rr,gy+Math.sin(an)*rr*.28-7*s);g.lineTo(x+Math.cos(an)*rr+3*s,gy+Math.sin(an)*rr*.28);g.lineTo(x+Math.cos(an)*rr-3*s,gy+Math.sin(an)*rr*.28);g.closePath();g.fill()}
      g.strokeStyle='rgba(215,248,255,'+(.4+.5*pu)+')';g.lineWidth=2.2*s;ringE(g,x,gy,R*(1-u),.28);
    }else{
      g.setLineDash([7*s,6*s]);g.lineDashOffset=-t*.3;g.strokeStyle='rgba(200,180,255,'+(.22+.16*pu)+')';g.lineWidth=2*s;ringE(g,x,gy,R,.28);
      g.setLineDash([3*s,5*s]);ringE(g,x,gy,R*.6,.28);g.setLineDash([]);
      g.fillStyle='rgba(215,195,255,'+(.08+.1*pu)+')';g.beginPath();g.ellipse(x,gy,R*.9,R*.25,0,0,T);g.fill();
    }
  }else if(h.real){
    k=(age-h.warn)/h.life;al=Math.max(0,1-k);
    q=g.createLinearGradient(0,gy-150*s,0,gy);q.addColorStop(0,'rgba(170,230,255,0)');q.addColorStop(1,'rgba(190,240,255,'+(.8*al)+')');
    g.fillStyle=q;g.fillRect(x-R*.45*(1-k*.4),gy-150*s,R*.9*(1-k*.4),150*s);
    g.fillStyle='rgba(240,252,255,'+(.7*al)+')';g.fillRect(x-R*.12,gy-150*s,R*.24,150*s);
    eglow(g,x,gy,R*(1+k*.5),R*.34,'200,245,255',.55*al);
    g.strokeStyle='rgba(230,250,255,'+al+')';g.lineWidth=3*s*al;rr=R*(.5+k*.9);ringE(g,x,gy,rr,.28);ringE(g,x,gy,rr*.62,.28);
    g.lineWidth=1.6*s;g.beginPath();
    for(j=0;j<6;j++){an=j*T/6+.3;g.moveTo(x+Math.cos(an)*R*.2,gy+Math.sin(an)*R*.06);g.lineTo(x+Math.cos(an)*rr*1.1,gy+Math.sin(an)*rr*1.1*.28)}
    g.stroke();
    if(!lite()){
      g.fillStyle='rgba(235,250,255,'+al+')';
      for(j=0;j<7;j++){var px=x+(rnd(h.seed+j)-.5)*R*1.6*k*2,py=gy-k*(30+rnd(h.seed+j+4)*90)*s+k*k*40*s;
        g.beginPath();g.moveTo(px,py-5*s);g.lineTo(px+2.4*s,py);g.lineTo(px,py+5*s);g.lineTo(px-2.4*s,py);g.closePath();g.fill()}
    }
  }
  g.restore();
}
function khFoeAfter(e,m,a){
  if(lite())return;
  var HH=m.h*(typeof BZ!=='undefined'?(BZ[e.b|0]||1):1)*SZ*s,x=e.x*s,t=a.tick(),al=Math.max(.05,Math.min(1,1-e.in/30)),i,oa,cy=GY-HH*.5;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al*.8;
  eglow(g,x,GY,HH*.5,HH*.11,'150,220,255',.3);
  for(i=0;i<2;i++){oa=t*.04+i*PI;var sx=x+Math.cos(oa)*HH*.46,sy=cy+Math.sin(oa)*HH*.2-HH*.1;
    g.fillStyle='rgba(215,240,255,.75)';g.beginPath();g.moveTo(sx,sy-4*s);g.lineTo(sx+2*s,sy);g.lineTo(sx,sy+4*s);g.lineTo(sx-2*s,sy);g.closePath();g.fill()}
  g.restore();
}
function khBoss(cv,e,t){
  var c2=cv.getContext('2d'),f=(e.fm|0)===1?1:0,K=f?'205,155,255':'130,235,235',i,side,ang,bx,by,L,px,py,pu=.5+.5*Math.sin(t*.12),q;
  c2.save();c2.lineJoin='round';
  c2.globalCompositeOperation='lighter';
  [[128,26],[110,40],[146,40],[96,58],[160,58]].forEach(function(p,k){glow(c2,p[0],p[1],8+4*Math.sin(t*.1+k*1.3),'255,255,255',.5)});
  for(i=0;i<5;i++){glow(c2,90-i*8+Math.sin(t*.05+i)*6,120+i*30,4,K,.6)}
  q=c2.createLinearGradient(80+((t*1.4)%160),150,120+((t*1.4)%160),310);q.addColorStop(0,'rgba('+K+',0)');q.addColorStop(.5,'rgba(255,255,255,.18)');q.addColorStop(1,'rgba('+K+',0)');
  c2.fillStyle=q;c2.beginPath();c2.moveTo(106,130);c2.lineTo(150,130);c2.quadraticCurveTo(190,210,226,296);c2.lineTo(70,296);c2.quadraticCurveTo(66,210,106,130);c2.fill();
  c2.globalCompositeOperation='destination-over';
  for(side=-1;side<=1;side+=2){
    for(i=0;i<6;i++){
      ang=-(.18+i*.3);bx=128+side*14;by=132;L=64+(i%3)*14;
      px=bx+Math.cos(side>0?ang:PI-ang)*L;py=by+Math.sin(side>0?ang:PI-ang)*L;
      var nx=-Math.sin(side>0?ang:PI-ang)*5,ny=Math.cos(side>0?ang:PI-ang)*5;
      q=c2.createLinearGradient(bx,by,px,py);q.addColorStop(0,'rgba('+K+',.5)');q.addColorStop(1,'rgba(255,255,255,.12)');
      c2.beginPath();c2.moveTo(bx+nx,by+ny);c2.lineTo(px,py);c2.lineTo(bx-nx,by-ny);c2.closePath();c2.fillStyle=q;c2.fill();
      c2.strokeStyle='rgba('+K+',.75)';c2.lineWidth=1.4;c2.stroke();
    }
  }
  for(i=0;i<8;i++){
    ang=t*.012+i*T/8;px=128+Math.cos(ang)*84;py=88+Math.sin(ang)*60;
    c2.fillStyle='rgba('+K+','+(.3+.25*pu)+')';c2.beginPath();c2.moveTo(px,py-9);c2.lineTo(px+4,py);c2.lineTo(px,py+9);c2.lineTo(px-4,py);c2.closePath();c2.fill();
  }
  glow(c2,128,160,120,K,.2);
  c2.restore();
}

/* =====================================================================
 *  💀 CỐT HẢI SA MẠC
 * ===================================================================== */
var CH={w:[]};
function dune(x,gy,j,col,amp,hb){
  var i;x.beginPath();x.moveTo(0,gy);
  for(i=0;i<=40;i++)x.lineTo(W*i/40,gy-hb*s-(Math.sin(i*.35+j*2)*.5+.5)*amp*s-Math.sin(i*.9+j)*amp*.2*s);
  x.lineTo(W,gy);x.closePath();x.fillStyle=col;x.fill();
}
function ribs(x,bx,gy,k,al){
  var i,rx,hh,lean;x.lineCap='round';
  for(i=0;i<7;i++){
    rx=bx+i*24*s*k;hh=(70-Math.abs(i-3)*9+rnd(i)*8)*s*k;lean=(i-3)*3*s;
    x.strokeStyle='rgba(40,24,14,'+al+')';x.lineWidth=9*s*k;x.beginPath();x.moveTo(rx,gy);x.quadraticCurveTo(rx+lean-14*s*k,gy-hh*1.15,rx+lean+20*s*k,gy-hh);x.stroke();
    x.strokeStyle='rgba(232,220,190,'+al+')';x.lineWidth=5.5*s*k;x.beginPath();x.moveTo(rx,gy);x.quadraticCurveTo(rx+lean-14*s*k,gy-hh*1.15,rx+lean+20*s*k,gy-hh);x.stroke();
    if(i===1||i===4)CH.w.push([rx+lean+20*s*k,gy-hh]);
  }
  for(i=0;i<9;i++){x.fillStyle='rgba(215,200,168,'+al+')';x.strokeStyle='rgba(40,24,14,'+al+')';x.lineWidth=1.2*s;x.beginPath();x.arc(bx-20*s*k+i*21*s*k,gy-2*s,6*s*k,0,T);x.fill();x.stroke()}
}
function skull(x,cx,cy,k,al){
  var i;
  x.fillStyle='rgba(232,220,190,'+al+')';x.strokeStyle='rgba(40,24,14,'+al+')';x.lineWidth=1.6*s;
  x.beginPath();x.moveTo(cx-30*k,cy);x.bezierCurveTo(cx-28*k,cy-26*k,cx+6*k,cy-30*k,cx+18*k,cy-16*k);x.lineTo(cx+54*k,cy-10*k);x.lineTo(cx+52*k,cy+2*k);x.lineTo(cx+10*k,cy+4*k);x.closePath();x.fill();x.stroke();
  x.beginPath();x.moveTo(cx,cy+4*k);x.lineTo(cx+48*k,cy+6*k);x.lineTo(cx+36*k,cy+16*k);x.lineTo(cx+2*k,cy+12*k);x.closePath();x.fill();x.stroke();
  x.beginPath();x.moveTo(cx-20*k,cy-20*k);x.quadraticCurveTo(cx-40*k,cy-40*k,cx-52*k,cy-62*k);x.lineTo(cx-34*k,cy-30*k);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(255,246,222,'+al+')';
  for(i=0;i<5;i++){x.beginPath();x.moveTo(cx+18*k+i*7*k,cy+3*k);x.lineTo(cx+21*k+i*7*k,cy+10*k);x.lineTo(cx+24*k+i*7*k,cy+3*k);x.closePath();x.fill()}
  x.fillStyle='rgba(20,10,6,'+al+')';x.beginPath();x.ellipse(cx+8*k,cy-12*k,7*k,5*k,-.3,0,T);x.fill();
}
function smallSkull(x,cx,cy,r){
  x.fillStyle='rgba(228,216,186,.85)';x.strokeStyle='rgba(40,24,14,.8)';x.lineWidth=1.2*s;
  x.beginPath();x.arc(cx,cy-r*.3,r,PI,0);x.lineTo(cx+r*.6,cy+r*.6);x.lineTo(cx-r*.6,cy+r*.6);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(20,10,6,.9)';x.beginPath();x.arc(cx-r*.38,cy-r*.2,r*.22,0,T);x.arc(cx+r*.38,cy-r*.2,r*.22,0,T);x.fill();
}
function branch(x,px,py,a,len,w,d,sd){
  var nx=px+Math.cos(a)*len,ny=py+Math.sin(a)*len;
  x.lineWidth=w;x.beginPath();x.moveTo(px,py);x.lineTo(nx,ny);x.stroke();
  if(d>0){branch(x,nx,ny,a-.5-rnd(sd)*.3,len*.7,w*.7,d-1,sd+1);branch(x,nx,ny,a+.45+rnd(sd+5)*.3,len*.68,w*.7,d-1,sd+2)}
}
function chStatic(gy,a,x){
  var i,r,q,sx=W*.22,sy=gy*.4,yy,y2;
  CH.w=[];
  q=x.createLinearGradient(0,0,0,gy);q.addColorStop(0,'rgba(34,10,40,.58)');q.addColorStop(.55,'rgba(120,48,30,.38)');q.addColorStop(1,'rgba(240,150,60,.32)');
  x.fillStyle=q;x.fillRect(0,0,W,gy);
  glow(x,sx,sy,gy*.7,'255,170,80',.5);
  x.fillStyle='rgba(255,236,190,.92)';x.beginPath();x.arc(sx,sy,gy*.075,0,T);x.fill();
  x.fillStyle='rgba(120,40,30,.35)';for(i=0;i<4;i++)x.fillRect(sx-gy*.1,sy-gy*.03+i*gy*.022,gy*.2,gy*.006);
  dune(x,gy,0,'rgba(190,110,70,.55)',34,64);
  dune(x,gy,1,'rgba(150,80,48,.7)',30,40);
  ribs(x,W*.58,gy-30*s,.8,.55);
  skull(x,W*.1,gy-26*s,.8,.7);CH.w.push([W*.1+10*s,gy-40*s]);
  dune(x,gy,2,'rgba(110,62,34,.82)',24,16);
  x.strokeStyle='rgba(36,20,14,.8)';x.lineCap='round';
  branch(x,W*.36,gy-4*s,-PI/2,34*s,6*s,3,3);branch(x,W*.83,gy-4*s,-PI/2-.15,28*s,5*s,3,11);
  q=x.createLinearGradient(0,gy-120*s,0,gy);q.addColorStop(0,'#5a3c24');q.addColorStop(1,'#2a190d');
  poly(x,[[W*.92-14*s,gy],[W*.92-12*s,gy-96*s],[W*.92-3*s,gy-110*s],[W*.92+4*s,gy-100*s],[W*.92+13*s,gy-104*s],[W*.92+15*s,gy]],q,'rgba(20,12,6,.8)',1.4*s);
  x.fillStyle='rgba(255,190,90,.75)';for(i=0;i<4;i++)x.fillRect(W*.92-3*s,gy-82*s+i*18*s,6*s,3*s);
  CH.w.push([W*.92,gy-112*s]);
  q=x.createLinearGradient(0,gy,0,H);q.addColorStop(0,'rgba(196,150,86,.30)');q.addColorStop(1,'rgba(120,80,40,.34)');
  x.fillStyle=q;x.fillRect(0,gy,W,H-gy);
  for(r=1;r<8;r++){
    yy=gy+(H-gy)*(r/8);x.strokeStyle=r%2?'rgba(70,40,20,.14)':'rgba(255,220,160,.12)';x.lineWidth=1.4*s;x.beginPath();
    for(i=0;i<=30;i++){y2=yy+Math.sin(i*.6+r*1.7)*3*s;i?x.lineTo(W*i/30,y2):x.moveTo(0,y2)}x.stroke();
  }
  [[.1,.2],[.38,.5],[.74,.15]].forEach(function(p){smallSkull(x,W*p[0],gy+(H-gy)*p[1]+8*s,7*s)});
  x.strokeStyle='rgba(225,212,180,.7)';x.lineCap='round';
  for(i=0;i<7;i++){var bx=rnd(i+60)*W,by=gy+(H-gy)*(.2+rnd(i+70)*.7),bl=(10+rnd(i+80)*12)*s,ba=rnd(i+90)*PI;
    x.lineWidth=2.4*s;x.beginPath();x.moveTo(bx,by);x.lineTo(bx+Math.cos(ba)*bl,by+Math.sin(ba)*bl*.3);x.stroke()}
}
function chBg(gy,a){
  var tk=a.tick(),i,n,L=a.lite(),yy,x0,fl,fx,fy,vx,vy,flap;
  g.save();g.globalCompositeOperation='lighter';
  for(i=0;i<2;i++)eglow(g,((tk*.25*(1+i*.5)+i*W*.5)%(W*1.4))-W*.2,gy-(8+i*18)*s,W*.3,gy*.06,'230,170,100',.10);
  if(!L){
    g.strokeStyle='rgba(255,220,160,.10)';g.lineWidth=1.4*s;
    for(i=0;i<6;i++){yy=gy-(2+i*5)*s;g.beginPath();for(x0=0;x0<=W;x0+=24*s)g.lineTo(x0,yy+Math.sin(x0*.03+tk*.06+i)*1.8*s);g.stroke()}
  }
  n=L?6:16;g.fillStyle='rgba(235,200,150,.3)';
  for(i=0;i<n;i++)g.fillRect(((rnd(i)*W*1.3+tk*(1.4+rnd(i+4)*1.8))%(W*1.3))-W*.15,gy*(.5+rnd(i+7)*.5)+(H-gy)*rnd(i+11)*.5,2*s,1.2*s);
  for(i=0;i<CH.w.length;i++){fl=.5+.5*Math.sin(tk*.1+i*2);fx=CH.w[i][0];fy=CH.w[i][1];glow(g,fx,fy-4*s,(10+4*fl)*s,'255,170,60',.18+.2*fl)}
  if(!L){
    g.globalCompositeOperation='source-over';g.lineWidth=2*s;g.strokeStyle='rgba(30,16,10,.7)';g.lineCap='round';
    for(i=0;i<2;i++){
      vx=((tk*(.5+i*.2)+i*W*.55)%(W*1.2))-W*.1;vy=gy*(.2+i*.1)+Math.sin(tk*.02+i)*8*s;flap=Math.sin(tk*.08+i*3);
      g.beginPath();g.moveTo(vx-14*s,vy+flap*5*s);g.quadraticCurveTo(vx-6*s,vy-6*s,vx,vy);g.quadraticCurveTo(vx+6*s,vy-6*s,vx+14*s,vy+flap*5*s);g.stroke();
    }
  }
  g.restore();
}
function chHazard(h,age,gy,a){
  var x=h.x*s,R=h.R*s,t=a.tick(),i,j,u,pu,k,al,an,rr,sx,sh,lean,bw,pd,px,py;
  g.save();g.lineJoin='round';
  if(age<h.warn){
    u=age/h.warn;pu=.5+.5*Math.sin(t*(.22+u*.4));
    eglow(g,x,gy,R*1.15,R*.34,'190,120,50',.2+.34*u);
    g.strokeStyle='rgba(60,32,14,'+(.35+.4*u)+')';g.lineWidth=2*s;g.beginPath();
    for(i=0;i<8;i++){an=i*T/8+.2;rr=R*(.4+.6*u);g.moveTo(x+Math.cos(an)*R*.15,gy+Math.sin(an)*R*.04);g.lineTo(x+Math.cos(an)*rr,gy+Math.sin(an)*rr*.28)}
    g.stroke();
    g.strokeStyle='rgba(245,205,140,'+(.45+.45*pu)+')';g.lineWidth=2.4*s;ringE(g,x,gy,R,.28);
    g.setLineDash([6*s,6*s]);g.lineDashOffset=-t*.5;ringE(g,x,gy,R*.7,.28);g.setLineDash([]);
    ringE(g,x,gy,R*(1-u),.28);
    g.fillStyle='rgba(245,225,185,'+(.25+.35*pu)+')';g.beginPath();g.ellipse(x,gy-2*s,6*s,5*s,0,0,T);g.fill();
    g.fillStyle='rgba(60,32,14,.8)';g.beginPath();g.arc(x-2.2*s,gy-2.6*s,1.3*s,0,T);g.arc(x+2.2*s,gy-2.6*s,1.3*s,0,T);g.fill();
  }else{
    k=(age-h.warn)/h.life;al=Math.max(0,1-k*.7);
    var hh=(h.R*1.9)*s*Math.min(1,k*3)*(1-Math.max(0,k-.6)*1.4);
    g.fillStyle='rgba(205,160,96,'+Math.max(0,.6-k*.5)+')';g.beginPath();g.ellipse(x,gy,R*(.8+k*.5),R*.22,0,0,T);g.fill();
    for(i=-3;i<=3;i++){
      sx=x+i*R*.28;sh=hh*(1-Math.abs(i)*.14)*(.92+rnd(h.seed+i)*.16);lean=i*3.2*s;bw=10*s;
      g.fillStyle='rgba(150,130,98,'+al+')';g.beginPath();g.moveTo(sx-bw,gy);g.quadraticCurveTo(sx-bw*.5,gy-sh*.55,sx+lean,gy-sh);g.lineTo(sx,gy);g.closePath();g.fill();
      g.fillStyle='rgba(240,230,205,'+al+')';g.beginPath();g.moveTo(sx,gy);g.lineTo(sx+lean,gy-sh);g.quadraticCurveTo(sx+bw*.5,gy-sh*.55,sx+bw,gy);g.closePath();g.fill();
      g.strokeStyle='rgba(46,35,20,'+(.8*al)+')';g.lineWidth=1.3*s;g.beginPath();g.moveTo(sx-bw,gy);g.quadraticCurveTo(sx-bw*.5,gy-sh*.55,sx+lean,gy-sh);g.quadraticCurveTo(sx+bw*.5,gy-sh*.55,sx+bw,gy);g.stroke();
    }
    if(!lite()){
      g.fillStyle='rgba(222,180,116,'+(.8*(1-k))+')';
      for(j=0;j<12;j++){pd=k*(18+rnd(h.seed+j+5)*50)*s;px=x+(rnd(h.seed+j)-.5)*2*pd;py=gy-Math.abs(Math.sin(rnd(h.seed+j+3)*PI))*pd*.8+k*k*30*s;g.fillRect(px,py,3*s,3*s)}
    }
  }
  g.restore();
}
function chFoeAfter(e,m,a){
  if(lite())return;
  var HH=m.h*(typeof BZ!=='undefined'?(BZ[e.b|0]||1):1)*SZ*s,x=e.x*s,t=a.tick(),al=Math.max(.05,Math.min(1,1-e.in/30)),i,u;
  g.save();g.globalAlpha=al*.7;
  eglow(g,x,GY,HH*.5,HH*.1,'150,100,50',.4);
  g.fillStyle='rgba(235,205,150,.5)';
  for(i=0;i<3;i++){u=((t*.012+i*.33+rnd(e.sn+i))%1);g.fillRect(x+(i-1)*HH*.3+Math.sin(t*.05+i)*4*s,GY-u*HH*.5,2*s,2*s)}
  g.restore();
}
function chAlt(e,m,a){
  var x=e.x*s,t=a.tick(),i,u,bob;
  g.save();
  eglow(g,x,GY,84*s,26*s,'60,34,16',.55);
  g.fillStyle='rgba(190,142,80,.95)';g.beginPath();g.ellipse(x,GY,64*s,20*s,0,0,T);g.fill();
  g.fillStyle='rgba(222,180,116,.9)';g.beginPath();g.ellipse(x,GY-6*s,42*s,13*s,0,0,T);g.fill();
  g.strokeStyle='rgba(60,34,16,.7)';g.lineWidth=1.6*s;g.beginPath();
  for(i=0;i<7;i++){var an=i*T/7+.3;g.moveTo(x+Math.cos(an)*14*s,GY+Math.sin(an)*4*s);g.lineTo(x+Math.cos(an)*68*s,GY+Math.sin(an)*21*s)}
  g.stroke();
  for(i=-1;i<=1;i+=2){bob=(Math.sin(t*.1+i)*.5+.5)*6*s;
    g.fillStyle='rgba(236,226,200,.95)';g.strokeStyle='rgba(46,35,20,.8)';g.lineWidth=1.2*s;
    g.beginPath();g.moveTo(x+i*20*s-6*s,GY-4*s);g.lineTo(x+i*24*s,GY-26*s-bob);g.lineTo(x+i*20*s+6*s,GY-4*s);g.closePath();g.fill();g.stroke()}
  for(i=0;i<8;i++){u=((t*.02+i*.17)%1);g.fillStyle='rgba(225,190,130,'+(.55*(1-u))+')';g.beginPath();g.arc(x+(rnd(i)-.5)*70*s,GY-u*60*s,(3+rnd(i+3)*3)*s,0,T);g.fill()}
  g.font=Math.max(9,Math.round(11*s))+'px sans-serif';g.textAlign='center';g.fillStyle='rgba(255,226,170,.9)';
  g.fillText('Cốt Long Vương · đang ẩn',x,GY-40*s);
  g.restore();
}
function chBoss(cv,e,t){
  var c2=cv.getContext('2d'),i,a,ex,ey,u,q,pu=.5+.5*Math.sin(t*.1);
  c2.save();c2.lineCap='round';
  c2.globalCompositeOperation='lighter';
  c2.strokeStyle='rgba(255,170,60,'+(.35+.2*pu)+')';c2.lineWidth=2;
  for(i=0;i<6;i++){var rx=82+i*7;c2.beginPath();c2.moveTo(rx,158);c2.bezierCurveTo(rx-30,170+i*2,rx-28,208+i*2,rx+10,226-i*2);c2.stroke()}
  for(i=0;i<3;i++){ex=186+(i-1)*4;u=((t*.05+i*.33)%1);
    q=c2.createRadialGradient(ex,64-u*26,1,ex,64-u*26,8);q.addColorStop(0,'rgba(255,230,140,'+(.8*(1-u))+')');q.addColorStop(1,'rgba(255,110,20,0)');
    c2.fillStyle=q;c2.beginPath();c2.arc(ex,64-u*26,8,0,T);c2.fill()}
  glow(c2,186,68,14,'255,180,50',.5+.3*pu);
  for(i=0;i<10;i++){u=((t*.012+rnd(i)*.9)%1);c2.fillStyle='rgba(255,'+(150+((rnd(i+3)*80)|0))+',60,'+(.8*(1-u))+')';c2.fillRect(70+rnd(i+6)*130+Math.sin(t*.06+i)*6,230-u*190,2.4,2.4)}
  c2.globalCompositeOperation='destination-over';
  glow(c2,128,200,130,'200,140,70',.25);
  c2.strokeStyle='rgba(222,180,116,.35)';c2.lineWidth=3;
  for(i=0;i<3;i++){c2.beginPath();c2.ellipse(128,250,70+i*20,18+i*5,t*.002*(i%2?1:-1)+i,.3,4.8);c2.stroke()}
  c2.restore();
}

/* ---------- kết nối ---------- */
var HOOK=[];
function wrapPBC(){
  if(!window.PBC||!PBC.maps)return;
  PBC.maps.forEach(function(M){
    var cf=M.cfg,o,ob,ofa;
    if(cf._pbg||(cf.id!=='kinhho'&&cf.id!=='cothai'))return;
    cf._pbg=1;o={bgS:cf.bgS,bg:cf.bg,dh:cf.drawHazard,fa:cf.foeAfter,alt:cf.foeAlt,bp:cf.boss&&cf.boss.paint};
    M._pbgO=o;
    if(cf.id==='kinhho'){
      cf.bgS=khStatic;cf.bg=khBg;cf.drawHazard=khHazard;
      ofa=o.fa;cf.foeAfter=function(e,m,a){if(ofa)ofa(e,m,a);khFoeAfter(e,m,a)};
      if(cf.boss&&o.bp)cf.boss.paint=function(cv,e,t){o.bp(cv,e,t);try{khBoss(cv,e,t)}catch(x){}};
    }else{
      cf.bgS=chStatic;cf.bg=chBg;cf.drawHazard=chHazard;cf.foeAfter=chFoeAfter;cf.foeAlt=chAlt;
      if(cf.boss&&o.bp)cf.boss.paint=function(cv,e,t){o.bp(cv,e,t);try{chBoss(cv,e,t)}catch(x){}};
    }
    M.bgKey='';M.bgC=null;M.bgNo=0;M.bgMiss=0;M.bcKey='';
    HOOK.push(M);
  });
}
function setupTL(){
  if(!window.TLC||typeof TLC.setPro!=='function'||TLC._pbg)return;
  TLC._pbg=1;TL.base=TLC.paintBoss;
  TLC.setPro({bg:tlBg,paintBoss:tlBoss,arcs:tlArcs,idle:tlIdle});
}
function off(){
  try{if(window.TLC&&TLC.setPro)TLC.setPro(null);if(window.TLC)TLC._pbg=0}catch(e){}
  HOOK.forEach(function(M){
    var cf=M.cfg,o=M._pbgO;if(!o)return;
    cf.bgS=o.bgS;cf.bg=o.bg;cf.drawHazard=o.dh;cf.foeAfter=o.fa;cf.foeAlt=o.alt;if(cf.boss&&o.bp)cf.boss.paint=o.bp;
    cf._pbg=0;M.bgKey='';M.bgC=null;M.bgNo=0;M.bgMiss=0;M.bcKey='';
  });
  HOOK.length=0;
}
function on(){setupTL();wrapPBC()}
on();
window.PBG={on:on,off:off,_t:{tlStatic:tlStatic,tlBg:tlBg,tlBoss:tlBoss,tlArcs:tlArcs,khStatic:khStatic,khBg:khBg,khHazard:khHazard,khBoss:khBoss,khFoeAfter:khFoeAfter,chStatic:chStatic,chBg:chBg,chHazard:chHazard,chBoss:chBoss,chAlt:chAlt,chFoeAfter:chFoeAfter,TL:TL}};
})();
