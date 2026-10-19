/* world/105b-pham-the-fx-recipes.js — công thức hiệu ứng từng kỹ năng phàm thể (dùng primitives của world/105). Chỉ vẽ. */
(function(){
'use strict';
var T=window.__PTX,CF=window.PTXU_CF;
if(!T||!CF||!CF.enable||typeof ZS==='undefined'||!ZS.X)return;
var X=ZS.X,SFX=X.SFX,ZFC=X.ZFC,later=X.later,bst=X.bst,fp=X.fp,shake=X.shake,flash=X.flash,PI=Math.PI,TAU=PI*2,R=Math.random;
var Q=T.Q,slash=T.slash,ring=T.ring,circle=T.circle,pillar=T.pillar,beam=T.beam,bolt=T.bolt,burst=T.burst,hit=T.hitBurst,glyph=T.glyph,fall=T.fall,helix=T.helix,smoke=T.smoke,dim=T.dim,F=T.F,glw=T.glw,env=T.env,hash=T.hash,foes=T.foes,sword=T.sword,spear=T.spear,arrow=T.arrow,crystal=T.crystal;
function dome(x,r,c,l){F(x,l,function(o,p,X0,gy){var a=env(p,.2,.4),rr=r*s,i;if(a<=0)return;
 var q=g.createRadialGradient(X0,gy-rr*.35,rr*.3,X0,gy-rr*.35,rr);q.addColorStop(0,RGBA(c,0));q.addColorStop(.85,RGBA(c,.28*a));q.addColorStop(1,RGBA(c,.7*a));
 g.fillStyle=q;g.beginPath();g.ellipse(X0,gy-rr*.1,rr*.95,rr*1.05,0,PI,TAU);g.fill();
 g.strokeStyle=RGBA('#ffffff',.85*a);g.lineWidth=2*s;g.beginPath();g.ellipse(X0,gy-rr*.1,rr*.95,rr*1.05,0,PI,TAU);g.stroke();
 g.strokeStyle=RGBA(c,.55*a);g.lineWidth=1.3*s;for(i=1;i<5;i++){g.beginPath();g.ellipse(X0,gy-rr*.1,rr*.95*(i/5)+0,rr*1.05,0,PI,TAU);g.stroke()}
 for(i=1;i<4;i++){g.beginPath();g.ellipse(X0,gy-rr*.1,rr*.95,rr*1.05*(i/4),0,PI,TAU);g.stroke()}
 glw(X0,gy-rr*.4,rr*.8,c,a*.25)})}
function orbit(x,n,r,y,c,l,kind){F(x,l,function(o,p,X0,gy){var a=env(p,.15,.3),i;if(a<=0)return;
 for(i=0;i<n;i++){var an=p*8+i*TAU/n,ox=X0+Math.cos(an)*r*s,oy=gy-y*s+Math.sin(an)*r*s*.3,z=Math.sin(an)>0?1:.55;
  if(kind=='sword')sword(ox,oy,34*s,an+PI/2,c,a*z);else if(kind=='spear')spear(ox,oy,38*s,an+PI/2,c,a*z);else if(kind=='crystal')crystal(ox,oy,15*s,an,c,a*z);else glw(ox,oy,14*s,c,a*z)}})}
function sil(x,y,c,al){var X0=(x-cam)*s,Y0=GY-y*s;glw(X0,Y0,34*s,c,al*.35);g.save();g.globalAlpha=al*.8;g.fillStyle=RGBA(c,1);g.beginPath();g.arc(X0,Y0-30*s,8*s,0,TAU);g.fill();g.beginPath();g.moveTo(X0-9*s,Y0-20*s);g.lineTo(X0+9*s,Y0-20*s);g.lineTo(X0+6*s,Y0+14*s);g.lineTo(X0-6*s,Y0+14*s);g.closePath();g.fill();g.restore()}
function clones(px,xs,c,l){F(px,l,function(o,p,X0,gy){var a=env(p,.2,.4);xs.forEach(function(x,i){sil(x,50,c,a*(.5+hash(i)*.4))})})}
function X2(x,y,len,c,l){slash(x,y,len,-.7,c,l,1,.9);slash(x,y,len*.9,.7,'#ffffff',l,-1,.8)}
function groundSpike(x,h,c,l,kind){F(x,l,function(o,p,X0,gy){var u=Math.min(1,p*4),a=1-Math.max(0,(p-.6)/.4),H=h*s*u;if(a<=0)return;
 g.globalAlpha=a;g.fillStyle=RGBA(c,.8);g.beginPath();g.moveTo(X0-9*s,gy);g.lineTo(X0,gy-H);g.lineTo(X0+9*s,gy);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(X0-2*s,gy);g.lineTo(X0,gy-H);g.lineTo(X0+3*s,gy);g.closePath();g.fill();g.globalAlpha=1;glw(X0,gy-H*.5,22*s,c,a*.5)})}

/* ================= KỸ NĂNG CƠ BẢN ================= */
function def(n,f){SFX[n]=f}
/* ---- Kiếm Sĩ ---- */
def('Chém Mạnh',function(a){var d=a.d,tx=a.tx,c=a.c;slash(tx-6*d,58,125,-.6,c,18,d,1.3);later(4,function(){slash(tx,48,108,.62,'#ffffff',16,d,1.05)});
 later(3,function(){hit(tx,50,'#ffe9a0',1)});ring(tx,95,c,18);if(a.e){bst(tx,28,Q(8),c,4,22,4,{g:.2})}shake(4)});
def('Xung Phong',function(a){var d=a.d,px=a.px,c=a.c;
 for(let i=0;i<Q(12);i++)fp(px-d*(10+i*13),14+R()*52,{k:'s',c:'#fff3c0',vx:-d*(6+R()*5),l:14,r:3,f:.9});
 smoke(px,Q(6),'rgba(201,168,120,1)',22,60);circle(px,a.rr*.55,c,26,'衝鋒破陣',null,4);
 [0,1,2].forEach(function(i){later(i*3,function(){slash(px+d*(20+i*40),44+i*10,95+i*16,-.5+i*.5,i==1?'#ffffff':c,14,d,1)})});ring(px,a.rr,c,24);ring(px,a.rr*.6,'#ffffff',18);shake(4)});
def('Liên Hoàn Trảm',function(a){var d=a.d,px=a.px,c=a.c;[0,3,6].forEach(function(q,i){later(q,function(){var x=px+(i-1)*72;slash(x,54,112,(i-1)*.7,i==1?'#ffffff':c,15,i%2?-1:1,1.1);hit(x,50,'#ffe9a0');shake(2)})});
 later(8,function(){ring(px,a.rr,c,22);X2(px,52,90,c,14)});helix(px,40,90,c,22,2)});
def('Hộ Thể',function(a){var px=a.px;dome(px,82,'#ffd76a',50);circle(px,78,'#ffd76a',46,'金剛不壞護體',null,4);pillar(px,34,'#ffe9a0',32,240);
 for(let i=0;i<Q(16);i++)later(i,function(){fp(px+Math.cos(i*.9)*34,4,{c:'#8fff9f',r:3,l:34,vy:2.2,vx:Math.cos(i*.9+1.6)*.6,k:'d'})});ring(px,96,'#8fff9f',24)});
def('Phong Ma Trảm',function(a){var d=a.d,px=a.px;slash(px+d*50,54,150,-.3,'#9fe0ff',20,d,1.4);slash(px-d*50,54,150,-.3,'#cfeaff',20,-d,1.4);
 ring(px,a.rr,'#9fe0ff',26);circle(px,a.rr*.6,'#9fe0ff',26,'封魔冰刃',null,6);
 for(let i=0;i<Q(8);i++){(function(i){later(i%5,function(){var x=px+(i%2?1:-1)*(50+hash(i)*a.rr*.8)})})(i)}
 bst(px,50,Q(26),'#e8f8ff',7,26,3,{k:'s',g:-.02});shake(4)});
def('Vạn Kiếm Quy Tông',function(a){var px=a.px,c='#ffe9a0',xs=[];foes().forEach(function(e){xs.push(e.x-14,e.x+14)});while(xs.length<Q(14))xs.push(px+P.d*R()*vw()*.8);
 circle(px,150,c,50,'萬劍歸宗',null,8);dim('#1a1000',46,.35);fall(xs,'sword',c,2,12,function(x){hit(x,22,'#ffe9a0');ring(x,40,c,12)});flash(c,40);shake(7)});
/* ---- Thương Thủ ---- */
def('Liên Thích',function(a){var d=a.d,px=a.px,X1=(a.e?a.e.x:px+d*150)+d*12;[0,1,2].forEach(function(i){later(i*4,function(){var y=40+(i-1)*9;beam(px+d*24,X1,y,13,a.c,10);if(a.e)hit(a.e.x,y+4,'#ffffff')})});helix(px+d*60,24,80,a.c,16,2)});
def('Lưu Tinh Đột',function(a){var d=a.d,px=a.px,c=a.c;circle(px,60,c,18,'流星',null,5);for(let i=0;i<Q(12);i++)fp(px-d*i*12,20+R()*50,{k:'s',c:'#fff3c0',vx:-d*(7+R()*5),l:14,r:3,f:.9});});
def('Xuyên Tâm Thương',function(a){var d=a.d,px=a.px,r=a.rr||230;beam(px+d*20,px+d*r,48,24,a.c,18);helix(px+d*r/2,30,70,a.c,18,3);
 for(let i=0;i<4;i++)(function(i){later(i*2,function(){ring(px+d*(40+i*r/4),50,i%2?'#ffffff':a.c,12,.6)})})(i);hit(px+d*r,48,a.c,1)});
def('Thương Vũ',function(a){var px=a.px,c=a.c;orbit(px,6,70,52,c,26,'spear');ring(px,a.rr,c,18);[0,8,16].forEach(function(q){later(q,function(){slash(px,52,110,q/8*1.1,'#ffffff',12,q?-1:1,1);slash(px,52,110,PI+q/8,c,12,1,1)})});helix(px,58,100,c,26,3)});
def('Địa Chấn',function(a){var px=a.px,c=a.c;circle(px,120,c,34,'地震崩裂',null,6);for(let i=0;i<Q(10);i++)later(i,function(){fp(px+(R()-.5)*60,4,{c:'#a07850',r:5,l:30,vy:2+R()*3,g:.15,k:'d'})})});
def('Long Đảm Phá',function(a){var px=a.px,c=a.c;circle(px,150,c,40,'龍膽破陣',null,8);dim('#140800',38,.3);pillar(px,30,'#ffd070',34,300);helix(px,50,160,'#ffb040',34,4)});
/* ---- Pháp Sư ---- */
function fireCast(px,d,c1,big){var x=px+d*38;F(x,big?22:16,function(o,p,X0,gy){var a=1-p,Y=gy-56*s,i;for(i=0;i<5;i++){var an=-PI/2+(i-2)*.5+Math.sin(fr*.4+i)*.12,L=(big?42:28)*s*(1-p*.4);g.fillStyle=RGBA(i%2?'#ffd060':c1,.8*a);g.beginPath();g.moveTo(X0-5*s,Y);g.quadraticCurveTo(X0+Math.cos(an)*L*.7,Y+Math.sin(an)*L*.5,X0+Math.cos(an)*L,Y+Math.sin(an)*L);g.quadraticCurveTo(X0+Math.cos(an)*L*.5+5*s,Y+Math.sin(an)*L*.5,X0+5*s,Y);g.fill()}
 glw(X0,Y,(big?60:40)*s,c1,a);glw(X0,Y,(big?26:16)*s,'#ffffff',a)})}
def('Hỏa Cầu',function(a){fireCast(a.px,a.d,'#ff8a30',0);circle(a.px+a.d*30,46,'#ff8a30',16,'火',null,3);bst(a.px+a.d*40,60,Q(14),'#ffb060',6,20,4,{g:.08})});
def('Hỏa Long Cầu',function(a){var px=a.px,d=a.d;fireCast(px,d,'#ff6a20',1);circle(px+d*20,90,'#ff7a20',26,'火龍',null,6);ring(px,110,'#ff8a30',20);helix(px+d*36,26,110,'#ffd060',24,3);bst(px+d*40,60,Q(24),'#ffb060',7,24,5,{g:.08})});
def('Sét Đánh',function(a){var tx=a.tx,px=a.px,d=a.d;bolt(px+d*34,'#cfe8ff',10,.4);later(2,function(){bolt(tx-14,'#88ccff',10,.7)});later(4,function(){bolt(tx,'#ffffff',12,1)});
 later(5,function(){hit(tx,36,'#cfe8ff',1);ring(tx,100,'#88ccff',18)});if(a.e)bst(tx,40,Q(14),'#fff7a0',7,14,3,{k:'s'});flash('#cfe8ff',6);shake(3)});
/* ---- Triệu Hồi Sư ---- */
def('Linh Hồn Cầu',function(a){var x=a.px+a.d*36;helix(x,20,80,'#8fffb0',20,2);burst(x,62,52,'#8fffb0',14,6);bst(x+8*a.d,60,Q(10),'#d8fff4',5,16,3,{k:'s'})});
def('Hấp Hồn Ấn',function(a){var px=a.px;circle(px,a.rr,'#8fffb0',34,'吸魂攝魄',null,6);ring(px,a.rr,'#c8ffd8',26);foes(a.rr).forEach(function(e,i){later(i*2,function(){X.wisp(e.x,60,px,60,'#bfffe8',20,50,14)})});helix(px,40,100,'#8fffb0',30,3)});
def('Triệu Linh Lang',function(a){var x=a.px-40;circle(x,110,'#9fe0ff',36,'靈狼降世',null,6);pillar(x,40,'#9fe0ff',34,260);helix(x,36,130,'#d8f6ff',34,3);F(x,34,function(o,p,X0,gy){glyph(X0,gy-110*s*Math.min(1,p*3),'狼',60*s,'#9fe0ff',env(p,.2,.4),0)})});
def('Triệu Mộc Linh',function(a){var x=a.px;circle(x,90,'#8fffb0',36,'木靈復生',null,5);pillar(x,34,'#8fffb0',34,220);F(x,36,function(o,p,X0,gy){var i,a2=env(p,.2,.4);for(i=0;i<5;i++){var h=(40+hash(i)*60)*s*Math.min(1,p*2.5),dx=(i-2)*14*s;g.strokeStyle=RGBA('#4fd070',.9*a2);g.lineWidth=3*s;g.beginPath();g.moveTo(X0+dx,gy);g.quadraticCurveTo(X0+dx+Math.sin(p*6+i)*16*s,gy-h*.5,X0+dx*1.6,gy-h);g.stroke();glw(X0+dx*1.6,gy-h,9*s,'#c8ffd8',a2)}});
 for(let i=0;i<Q(14);i++)later(i,function(){fp(x+(R()-.5)*60,10+R()*40,{c:'#c8ffd8',r:3,l:40,vy:1.2,vx:(R()-.5)*1.5,k:'d',f:1})})});
def('Triệu Cự Thạch',function(a){var x=a.px-40;circle(x,130,'#e0b070',38,'巨石鎮地',null,6);smoke(x,Q(7),'rgba(160,120,70,1)',26,80);
 for(let i=0;i<4;i++)(function(i){F(x,34,function(o,p,X0,gy){var u=Math.min(1,p*3),a2=1-Math.max(0,(p-.7)/.3),dx=(i-1.5)*26*s,H=(40+hash(i)*40)*s*u;g.globalAlpha=a2;g.fillStyle=RGBA('#a07040',1);g.beginPath();g.moveTo(X0+dx-12*s,gy);g.lineTo(X0+dx-7*s,gy-H);g.lineTo(X0+dx+6*s,gy-H*.9);g.lineTo(X0+dx+12*s,gy);g.fill();g.fillStyle='rgba(255,230,170,.7)';g.beginPath();g.moveTo(X0+dx-7*s,gy-H);g.lineTo(X0+dx+6*s,gy-H*.9);g.lineTo(X0+dx,gy-H*.6);g.fill();g.globalAlpha=1})})(i);shake(4)});
def('Vạn Linh Giáng Thế',function(a){var px=a.px;circle(px,300,'#bfffe8',50,'萬靈降世',null,8);later(8,function(){circle(px,200,'#8fffb0',40,null,null,5)});dim('#001a14',50,.4);
 var xs=[];foes().forEach(function(e){xs.push(e.x)});while(xs.length<Q(12))xs.push(px+P.d*R()*vw()*.7);fall(xs,'soul','#bfffe8',2,16,function(x){hit(x,30,'#bfffe8');ring(x,70,'#8fffb0',16)});pillar(px,70,'#bfffe8',44,340);flash('#bfffe8',16);shake(5)});
/* ---- Ma Thuật Sư ---- */
def('Lôi Liên Chuỗi',function(a){var px=a.px,L=foes().sort(function(p,q){return Math.abs(p.x-px)-Math.abs(q.x-px)}).slice(0,6),prev=px+a.d*30;burst(prev,98,46,'#cfe8ff',12);
 L.forEach(function(e,i){later(2+i*2,function(){var x0=prev,x1=e.x;F(x0,10,function(o,p,X0,gy){var al=1-p,pass,k,xa=(x0-cam)*s,xb=(x1-cam)*s,ya=gy-(i?44:98)*s,yb=gy-46*s;
  for(pass=0;pass<3;pass++){g.lineWidth=[9,4,1.6][pass]*s;g.strokeStyle=pass==2?'rgba(255,255,255,'+al+')':RGBA('#9fd0ff',(pass?.8:.25)*al);g.beginPath();g.moveTo(xa,ya);for(k=1;k<8;k++){var u=k/8;g.lineTo(xa+(xb-xa)*u+(hash(k+i*3+Math.floor(fr/2))-.5)*26*s,ya+(yb-ya)*u+(hash(k+7+i)-.5)*26*s)}g.lineTo(xb,yb);g.stroke()}});hit(e.x,46,'#cfe8ff');prev=x1})});shake(2)});
def('Băng Giáp',function(a){var px=a.px;dome(px,78,'#9fe0ff',54);orbit(px,6,60,55,'#cfeaff',56,'crystal');circle(px,90,'#9fe0ff',40,'玄冰護甲',null,6);ring(px,92,'#9fe0ff',24);bst(px,60,Q(26),'#e8f8ff',6,30,4,{k:'s',g:-.02})});
def('Bão Tuyết',function(a){var px=a.px,rr=a.rr||340;circle(px,rr,'#9fe0ff',40,'冰封萬里',null,6);ring(px,rr,'#9fe0ff',28);later(6,function(){ring(px,rr*.7,'#ffffff',24)});helix(px,rr*.35,150,'#e8f6ff',40,4);
 foes(rr).forEach(function(e,i){later(4+i*3,function(){groundSpike(e.x,90,'#9fe0ff',30);hit(e.x,40,'#cfeaff')})});for(let i=0;i<Q(30);i++)fp(px+(R()-.5)*rr*2,170+R()*50,{c:'#e8f6ff',r:2+R()*2.5,l:48,vx:P.d*(2+R()*3),vy:-2.5-R()*2,f:1});flash('#cfeaff',6)});
def('Thiên Hỏa Giáng',function(a){var px=a.px,xs=[];foes().forEach(function(e){xs.push(e.x)});while(xs.length<Q(12))xs.push(px+P.d*R()*vw()*.8);dim('#1a0600',50,.4);circle(px,200,'#ff7a20',40,'天火降世',null,6);
 fall(xs,'meteor','#ff8a30',3,14,function(x){hit(x,30,'#ffb060',1);ring(x,90,'#ff7a20',18);bst(x,20,Q(14),'#ff9a3a',6,24,5,{g:.15,f:.93})});flash('#ff7a20',44);shake(8)});
/* ---- Cung Thủ ---- */
function muzzle(px,d,c,big){var x=px+d*42;burst(x,56,big?64:44,c,12,6);for(let i=0;i<Q(big?12:8);i++)fp(x,56+(R()-.5)*8,{k:'s',c:'#fff3c0',vx:d*(8+R()*8),vy:(R()-.5)*3,l:12,r:3,f:.9});ring(x,big?60:40,c,12,.7)}
def('Tên Nhanh',function(a){muzzle(a.px,a.d,'#ffd86a',0)});
def('Mưa Tên',function(a){var px=a.px,rr=a.rr||300,xs=[];for(let i=0;i<Q(22);i++)xs.push(px+(R()*2-1)*rr);circle(px,rr*.55,'#ffd86a',40,'箭雨',null,6);fall(xs,'arrow','#ffe9a0',1,12,function(x,i){if(i%2)burst(x,18,30,'#ffe9a0',10,6)});ring(px,rr,'#ffd86a',24)});
def('Xạ Kích',function(a){var d=a.d,px=a.px,tx=a.tx;muzzle(px,d,'#ffd070',1);beam(px+d*30,tx,46,18,'#fff3c0',16);F(tx,20,function(o,p,X0,gy){var al=env(p,.2,.5),r=(46-p*14)*s,Y=gy-46*s;g.strokeStyle=RGBA('#ff5040',al);g.lineWidth=2.4*s;g.beginPath();g.arc(X0,Y,r,0,TAU);g.stroke();g.beginPath();g.moveTo(X0-r*1.4,Y);g.lineTo(X0+r*1.4,Y);g.moveTo(X0,Y-r*1.4);g.lineTo(X0,Y+r*1.4);g.stroke()});
 later(4,function(){hit(tx,46,'#ffd070',1);ring(tx,80,'#ffd070',16)})});
def('Điều Tức',function(a){var px=a.px;helix(px,36,110,'#a8f07a',32,3);circle(px,100,'#a8f07a',34,'調息養氣',null,5);pillar(px,30,'#d8ffb0',30,220);ring(px,100,'#a8f07a',24);for(let i=0;i<Q(14);i++)later(i,function(){fp(px-70+R()*50,20+R()*60,{k:'d',c:'#c8ff9a',r:4,l:40,vx:3+R()*2,vy:(R()-.5)*1.5,f:1})})});
def('Tên Xuyên Giáp',function(a){var d=a.d,px=a.px,x2=px+d*vw()*.95;muzzle(px,d,'#9fe0ff',1);beam(px+d*30,x2,46,24,'#9fe0ff',18);helix(px+d*vw()*.45,40,70,'#bfe8ff',20,3);
 for(let i=0;i<5;i++)(function(i){later(i*2,function(){ring(px+d*(60+i*vw()*.18),44,'#cfeaff',12,.6)})})(i);shake(2)});
def('Tử Thần Tiễn',function(a){var d=a.d,px=a.px,x2=px+d*vw()*.95;muzzle(px,d,'#d090ff',1);dim('#0c0018',30,.35);beam(px+d*30,x2,46,44,'#b050ff',28);later(3,function(){beam(px+d*30,x2,46,16,'#ffffff',22)});
 circle(px,80,'#b050ff',30,'死神',null,5);foes().forEach(function(e,i){later(4+i,function(){F(e.x,40,function(o,p,X0,gy){glyph(X0,gy-(80+p*20)*s,'☠',44*s,'#d090ff',env(p,.2,.4),0)});slash(e.x,60,90,-.4,'#d090ff',16,P.d,1.1);hit(e.x,50,'#d090ff')})});shake(4)});
/* ---- Thích Khách ---- */
function shTrail(x0,x1,c,l){F(x0,l,function(o,p,X0,gy){var a=env(p,.1,.6),i,N=5;for(i=0;i<N;i++){var u=i/(N-1),xx=(x0+(x1-x0)*u-cam)*s;sil(x0+(x1-x0)*u,50,c,a*.5*(1-Math.abs(p*1.3-u)))}})}
def('Ảnh Kích',function(a){var x=a.e?a.e.x:a.px+a.d*70;shTrail(a.px,x,'#e060a0',14);X2(x,50,80,'#ff6080',12);hit(x,50,'#ff9aa8')});
def('Phi Đao Toàn Phong',function(a){var px=a.px,rr=a.rr||230;orbit(px,8,rr*.5,50,'#e8f4ff',26,'sword');ring(px,rr,'#e8f4ff',22);ring(px,rr*.6,'#9fe0ff',18);helix(px,rr*.3,90,'#e8f4ff',26,3);[0,6,12].forEach(function(q){later(q,function(){slash(px,50,rr*.55,q*.5,'#ffffff',12,q%12?1:-1,.9)})})});
def('Ám Sát Liên Hoàn',function(a){var x=a.e?a.e.x:a.px+a.d*70;shTrail(a.px,x,'#d060ff',16);for(let j=0;j<4;j++)(function(j){later(j*4,function(){slash(x+(R()-.5)*24,38+R()*26,80+R()*24,(R()-.5)*2.4,j%2?'#ffffff':'#d060ff',12,j%2?1:-1,.95);bst(x,50,Q(6),'#ff4060',6,14,3,{k:'s'})})})(j);hit(x,50,'#ff4060',1)});
def('Ẩn Thân Bộ',function(a){var px=a.px;smoke(px,Q(10),'rgba(70,40,110,1)',34,90);circle(px,90,'#6a4a9a',36,'隱',null,5);helix(px,30,100,'#a070ff',30,3);dim('#10001c',34,.35);ring(px,100,'#a070ff',22)});
def('Huyết Ảnh Trảm',function(a){var px=a.px,d=a.d,rr=a.rr||280;slash(px+d*30,60,rr*.6,-.2,'#ff4060',24,d,1.6);foes(rr).forEach(function(e,i){later(4+i*2,function(){X2(e.x,50,70,'#ff4060',14);hit(e.x,50,'#ff4060');for(let k=0;k<Q(6);k++)fp(e.x,40,{c:'#c01030',r:3+R()*2,l:30,vx:(R()-.5)*6,vy:2+R()*4,g:.3,f:.98})})});ring(px,rr,'#ff4060',26);shake(4)});
def('Vạn Ảnh Sát Vực',function(a){var px=a.px;circle(px,320,'#d060ff',50,'萬影殺域',null,8);later(6,function(){circle(px,200,'#ff4060',44,null,null,5)});dim('#12001e',52,.55);
 foes().forEach(function(e,i){for(let j=0;j<3;j++)later(8+i*2+j*3,function(){slash(e.x+(R()-.5)*30,30+R()*50,70+R()*40,(R()-.5)*2.6,j%2?'#ffffff':'#ff4060',12,R()<.5?1:-1,1)})});ring(px,420,'#d060ff',34);flash('#d060ff',16);shake(6)});

/* ================= KỸ NĂNG TU TIÊN ================= */
var M={};
function tg(n,r){return foes(r).slice(0,n)}
function core(px,c,l){F(px,l,function(o,p,X0,gy){var a=env(p,.3,.3),r=(14+10*Math.sin(fr*.5))*s;glw(X0,gy-60*s,r*3,c,a*.8);glw(X0,gy-60*s,r*1.3,'#ffffff',a)})}
/* Kiếm Khách */
M.w=[
function(f,c){var d=P.d,px=P.x;circle(px,100,c,26,'御劍',null,4);slash(px+d*52,58,140,-.4,c,18,d,1.3);later(3,function(){slash(px+d*52,52,128,.4,'#ffffff',16,d,1.1)});slash(px-d*50,56,120,-.4,c,18,-d,1.1);ring(px,130,c,22);tg(8,440).forEach(function(e,i){later(5+i,function(){hit(e.x,50,'#ffe9a0')})});shake(3)},
function(f,c){var px=P.x;dome(px,90,'#ffd76a',70);circle(px,90,'#ffd76a',64,'金剛不壞',null,4);pillar(px,40,'#ffe9a0',44,300);orbit(px,6,70,60,'#ffe9a0',70,'sword');ring(px,110,'#ffd76a',28);flash('#ffd76a',8)},
function(f,c){var px=P.x;circle(px,440,c,56,'破天劍域',null,8);later(6,function(){circle(px,300,'#ffffff',46,null,null,6)});tg(12,440).forEach(function(e,i){later(10+i*2,function(){F(e.x,30,function(o,p,X0,gy){var u=Math.min(1,p*4),a=1-Math.max(0,(p-.6)/.4);sword(X0,gy-(90*u-60)*s,70*s,-PI/2,c,a*(u>0?1:0))});hit(e.x,30,c);ring(e.x,70,c,16)})});ring(px,440,c,30);flash(c,10);shake(5)},
function(f,c){var px=P.x,xs=[];tg(8).forEach(function(e){xs.push(e.x-12,e.x+12)});while(xs.length<Q(14))xs.push(px+P.d*R()*vw()*.8);circle(px,200,c,60,'萬劍朝宗',null,8);
 F(px,40,function(o,p,X0,gy){var a=env(p,.2,.3),i;for(i=0;i<12;i++){var an=-PI+i*PI/11;sword(X0+Math.cos(an)*110*s,gy-(190+Math.sin(an)*-30)*s,30*s,PI/2,'#ffe9a0',a)}});
 fall(xs,'sword','#ffe9a0',2,12,function(x){hit(x,22,'#ffe9a0');ring(x,44,c,12)});flash(c,20);shake(5)},
function(f,c){var px=P.x,d=P.d,bx=px+d*120;circle(px,260,c,70,'天劍斬地',null,8);dim('#1a1000',60,.45);
 F(bx,50,function(o,p,X0,gy){var e=Math.min(1,p/.5),tip=gy-(1-e*e)*(gy+60);if(p<.55){sword(X0,tip-240*s,240*s,PI/2,'#fff3c0',1)}});
 later(26,function(){ring(bx,520,c,40);ring(bx,300,'#ffffff',28);pillar(bx,60,'#ffe9a0',30,420);flash(c,44);shake(14);tg(8).forEach(function(e,i){later(i,function(){bolt(e.x,'#ffe9a0',12);hit(e.x,40,c,1)})})})}];
/* Ma Thuật Sư */
M.m=[
function(f,c){var px=P.x;circle(px,130,'#ff8a30',34,'五行火印',null,5);orbit(px,5,70,60,'#ffd76a',34);later(8,function(){ring(px,420,'#ff8a30',26);tg(8,420).forEach(function(e,i){later(i,function(){pillar(e.x,40,'#ff8a30',26,220);hit(e.x,40,'#ff9a3a',1)})})});shake(3)},
function(f,c){var px=P.x;circle(px,100,'#7ab8ff',50,'靈泉',null,6);pillar(px,44,'#7ab8ff',46,300);helix(px,40,150,'#bfe8ff',46,3);ring(px,120,'#7ab8ff',28);later(8,function(){ring(px,80,'#a8f07a',26)});for(let i=0;i<Q(18);i++)later(i*2,function(){fp(px+(R()-.5)*50,4,{c:'#bfe8ff',r:3,l:40,vy:2.4,vx:(R()-.5)*.6,k:'d',f:.99})})},
function(f,c){var px=P.x;circle(px,430,'#9fe0ff',60,'冰封萬里',null,6);ring(px,430,'#9fe0ff',28);helix(px,150,200,'#e8f6ff',50,4);tg(8,430).forEach(function(e,i){later(4+i*2,function(){groundSpike(e.x,110,'#9fe0ff',34);hit(e.x,40,'#cfeaff')})});flash('#cfeaff',10);shake(5)},
function(f,c){var px=P.x;dim('#06081a',52,.5);circle(px,200,'#cfe8ff',50,'雷劫天罰',null,8);tg(8).forEach(function(e,i){later(6+i*4,function(){bolt(e.x-8,'#88ccff',12,.8);bolt(e.x+8,'#ffffff',12,1);hit(e.x,40,'#cfe8ff',1);ring(e.x,80,'#88ccff',16)})});flash('#cfe8ff',14);shake(6)},
function(f,c){var px=P.x,xs=[];foes().forEach(function(e){xs.push(e.x)});while(xs.length<Q(14))xs.push(px+P.d*R()*vw()*.8);dim('#02020c',70,.55);circle(px,240,c,60,'星辰滅世',null,8);
 fall(xs,'meteor','#ffd060',2,16,function(x){hit(x,30,'#ffd060',1);ring(x,110,'#ff9a3a',20);bst(x,20,Q(16),'#ffb060',7,26,5,{g:.15,f:.93})});flash(c,30);shake(10)}];
/* Xạ Thủ */
M.a=[
function(f,c){var px=P.x,xs=[];foes().forEach(function(e){xs.push(e.x-10,e.x+10)});while(xs.length<Q(10))xs.push(px+P.d*R()*vw()*.6);circle(px,110,'#ffe9a0',32,'追魂',null,5);fall(xs,'arrow','#ffe9a0',1,12,function(x,i){burst(x,18,32,'#ffe9a0',10,6)});later(12,function(){tg(8,460).forEach(function(e){hit(e.x,46,'#ffe9a0')})})},
function(f,c){var px=P.x;helix(px,40,120,'#a8f07a',46,3);circle(px,100,'#a8f07a',46,'風行',null,5);pillar(px,34,'#d8ffb0',40,240);ring(px,110,'#a8f07a',26);for(let i=0;i<Q(16);i++)later(i*2,function(){fp(px-60+R()*40,20+R()*60,{k:'d',c:'#c8ff9a',r:4,l:40,vx:3+R()*2,vy:(R()-.5)*1.5,f:1})})},
function(f,c){var d=P.d,px=P.x,x2=px+d*vw()*.9;circle(px,90,c,24,'穿心',null,5);beam(px+d*30,x2,46,50,c,24);later(2,function(){beam(px+d*30,x2,46,16,'#ffffff',20)});helix(px+d*vw()*.45,50,80,c,24,3);for(let i=0;i<5;i++)(function(i){later(i*2,function(){ring(px+d*(60+i*vw()*.16),46,'#cfeaff',12,.6)})})(i);
 tg(10,vw()*.9).forEach(function(e,i){later(3+i,function(){hit(e.x,48,'#ffffff',1)})});flash(c,8);shake(5)},
function(f,c){var px=P.x,d=P.d,L=tg(8),xs=[px-d*130,px-d*65,px+d*70,px+d*135];circle(px,150,c,50,'幻影',null,6);clones(px,xs,c,46);xs.forEach(function(x,i){L.forEach(function(e,j){if(j%4==i%4)later(8+j*3,function(){beam(x,e.x,50,10,c,10);hit(e.x,50,'#ffe9a0')})})});flash(c,10)},
function(f,c){var d=P.d,px=P.x;dim('#02020e',60,.5);F(px,56,function(o,p,X0,gy){var a=env(p,.2,.4);glw(W*.75-d*0,gy*.3,150*s,'#fff3c0',a*.6);glw(W*.75,gy*.3,95*s,'#ffffff',a*.9);glyph(X0+d*(p*vw()*.7*s-60*s),gy-60*s,'狼',(110+p*60)*s,'#cfeaff',a*.9,0)});
 circle(px,260,c,56,'天狼噬月',null,8);tg(8).forEach(function(e,i){later(14+i*2,function(){X2(e.x,52,100,'#ff4060',14);hit(e.x,50,'#cfeaff',1)})});later(18,function(){ring(px,560,c,36)});flash(c,18);shake(9)}];
/* Thương Thủ */
M.w1=[
function(f,c){var d=P.d,px=P.x,L=foes(440),far=L.length?Math.abs(L[L.length-1].x-px)+80:230,x1=px+d*Math.min(far,440);circle(px,90,c,22,'龍膽',null,5);beam(px+d*20,x1,50,34,c,20);helix(px+(x1-px)/2,34,80,c,20,3);for(let i=0;i<6;i++)(function(i){later(i*2,function(){ring(px+(x1-px)*(i/6),50,'#ffffff',12,.6)})})(i);L.forEach(function(e,i){later(3+i*2,function(){hit(e.x,48,'#ffe9a0',1)})})},
function(f,c){var px=P.x;dome(px,96,c,70);circle(px,100,c,64,'不動',null,6);orbit(px,8,80,55,c,70,'spear');pillar(px,38,'#ffe9a0',44,280);ring(px,120,c,26)},
function(f,c){var px=P.x;circle(px,440,c,56,'地龍破',null,8);later(8,function(){ring(px,440,c,26);ring(px,300,'#ffffff',20);smoke(px,Q(10),'rgba(160,120,70,1)',30,300);tg(8,440).forEach(function(e,i){later(i,function(){groundSpike(e.x,100,'#e0b070',30);hit(e.x,40,'#ffcf90')})})});shake(8)},
function(f,c){var px=P.x,L=tg(8),xs=L.map(function(e){return e.x});while(xs.length<Q(10))xs.push(px+P.d*R()*vw()*.6);circle(px,160,c,50,'萬槍',null,6);fall(xs,'spear',c,2,12,function(x){hit(x,22,'#ffe9a0');ring(x,46,c,12)});L.forEach(function(e,i){later(10+i*3,function(){X2(e.x,50,80,c,12)})});flash(c,12)},
function(f,c){var px=P.x;circle(px,260,c,70,'九天降槍',null,8);dim('#0c0814',66,.5);core(px,c,30);later(36,function(){flash(c,40);shake(16);ring(px,520,c,40);ring(px,300,'#ffffff',26);pillar(px,70,'#ffe9a0',30,440);tg(8).forEach(function(e,i){later(i,function(){bolt(e.x,'#ffe9a0',12);F(e.x,26,function(o,p,X0,gy){var a=1-p,u=Math.min(1,p*4);spear(X0,gy-(260*(1-u))*s-20*s,110*s,PI/2,c,a)});hit(e.x,40,c,1)})})})}];
/* Triệu Hồi Sư */
M.m0=[
function(f,c){var px=P.x,L=tg(5,480);circle(px,100,c,40,'五鬼',null,5);L.forEach(function(e,i){later(4+i*3,function(){X.wisp(px,110,e.x,46,'#d8fff4',18,60,16);later(16,function(){F(e.x,30,function(o,p,X0,gy){glyph(X0,gy-(60+p*20)*s,'☠',40*s,c,env(p,.2,.4),0)});hit(e.x,50,c)})})})},
function(f,c){var px=P.x;dome(px,86,'#8fffb0',60);circle(px,100,'#8fffb0',56,'靈體護主',null,6);helix(px,36,130,'#d8ffe8',56,3);pillar(px,34,'#8fffb0',44,260);ring(px,110,'#8fffb0',26)},
function(f,c){var px=P.x;dim('#0e0018',60,.45);circle(px,440,'#8a40d0',60,'九幽冥界',null,8);later(6,function(){circle(px,300,c,50,null,null,6)});ring(px,440,'#8a40d0',30);tg(8,440).forEach(function(e,i){later(8+i*2,function(){pillar(e.x,40,'#8a40d0',30,240);hit(e.x,40,'#d8b0ff')})});shake(5)},
function(f,c){var px=P.x,dr=P.d;dim('#0a0014',56,.4);circle(px,180,'#8a40d0',50,'萬鬼',null,6);for(let i=0;i<Q(16);i++)later(6+i,function(){X.wisp(px-dr*(80+R()*60),60+R()*90,px+dr*(120+R()*500),50,i%2?'#d8b0ff':'#8fffb0',22,40,14)});tg(8).forEach(function(e,i){later(14+i*3,function(){F(e.x,30,function(o,p,X0,gy){glyph(X0,gy-(60+p*20)*s,'☠',42*s,'#d8b0ff',env(p,.2,.4),0)});hit(e.x,46,'#8a40d0')})})},
function(f,c){var px=P.x;dim('#00140e',64,.5);circle(px,520,c,70,'眾生召天',null,8);later(6,function(){circle(px,360,'#bfffe8',60,null,null,6)});F(px,64,function(o,p,X0,gy){glyph(W/2,gy*.22,'龍',(90+p*30)*s,'#bfffe8',env(p,.2,.4),0)});
 for(let i=0;i<Q(24);i++)later(8+i,function(){X.wisp(px,60,px+(R()*2-1)*vw()*.6,40,'#bfffe8',22,70,14)});tg(8).forEach(function(e,i){later(14+i*2,function(){pillar(e.x,50,'#bfffe8',30,300);hit(e.x,40,'#bfffe8',1)})});flash(c,26);shake(10)}];
/* Thích Khách */
M.a1=[
function(f,c){var d=P.d,px=P.x,x1=px+d*vw()*.7;shTrail(px,x1,c,22);tg(10,vw()*.7).forEach(function(e,i){later(Math.round(Math.abs(e.x-px)/(vw()*.7)*14)+2,function(){X2(e.x,50,80,c,12);hit(e.x,50,'#ff9aa8')})});circle(px,70,c,16,'影',null,4)},
function(f,c){var px=P.x;smoke(px,Q(12),'rgba(60,30,100,1)',50,100);circle(px,100,c,50,'隱匿',null,5);helix(px,30,110,'#a070ff',46,3);dim('#10001c',46,.35);ring(px,110,c,24);clones(px,[px-70,px+70],c,46)},
function(f,c){var px=P.x,d=P.d;dim('#06000c',48,.5);F(px,34,function(o,p,X0,gy){var a=env(p,.2,.4);glw(X0+d*80*s,gy-90*s,110*s,'#2a0a4a',a);glw(X0+d*80*s,gy-90*s,80*s,'#d060ff',a*.5)});slash(px+d*80,90,200,-.2,c,34,d,1.7);later(5,function(){slash(px-d*60,70,160,-.2,'#ffffff',28,-d,1.4)});tg(8,440).forEach(function(e,i){later(8+i*2,function(){slash(e.x,50,80,.5,c,12,1);hit(e.x,50,'#d060ff')})});ring(px,440,c,28);shake(5)},
function(f,c){var px=P.x,d=P.d,L=tg(8),xs=[px-d*130,px-d*65,px+d*70,px+d*135];circle(px,150,c,50,'萬影',null,6);clones(px,xs,c,46);L.forEach(function(e,i){later(8+i*3,function(){shTrail(e.x-70,e.x+70,'#d060ff',16);X2(e.x,50,70,c,12);hit(e.x,50,'#ff9aa8')})});flash(c,10)},
function(f,c){var px=P.x;dim('#0c0014',60,.6);circle(px,520,c,64,'天地無影',null,8);later(6,function(){circle(px,360,'#ff4060',54,null,null,6)});
 for(let i=0;i<Q(22);i++)later(6+i,function(){slash(px+(R()*2-1)*vw()*.6,30+R()*80,70+R()*60,(R()-.5)*2.8,i%3?'#ff4060':'#ffffff',12,R()<.5?1:-1,1)});
 tg(8).forEach(function(e,i){later(14+i*2,function(){X2(e.x,50,100,'#ff4060',14);hit(e.x,50,'#ffffff',1)})});later(26,function(){flash('#ffffff',16);ring(px,560,c,36)});shake(9)}];

/* thay công thức tu tiên: chạy logic gốc với phần vẽ bị tắt, rồi vẽ hiệu ứng mới */
Object.keys(M).forEach(function(t){if(!ZFC[t])return;M[t].forEach(function(mine,i){var old=ZFC[t][i];if(!old)return;
 ZFC[t][i]=function(f,c){X.mute(function(){old(f,c)});try{mine(f,c)}catch(e){if(window.console)console.warn('PTX',t,i,e)}}})});

/* móc từ ACT (Địa Chấn, Long Đảm Phá) + đòn trúng */
window.PTX={on:function(n,o){if(n=='quake'){circle(o.x,o.r*.7,o.c,34,'地裂',null,6);smoke(o.x,Q(8),'rgba(160,120,70,1)',28,o.r*.6);groundSpike(o.x-70,70,'#e0b070',24);groundSpike(o.x+70,70,'#e0b070',24)}
 else if(n=='dragon'){circle(o.x,o.r*.5,'#ffb040',44,'龍',null,8);pillar(o.x,60,'#ffd070',40,420);ring(o.x,o.r*.9,'#ffffff',30)}}};
var oh=ZS.hit;ZS.hit=function(p,e){oh(p,e);try{var n=p.n||p.k,col=/Hỏa/.test(n)?'#ffb060':/Xuyên/.test(n)?'#9fe0ff':p.k=='a'?'#ffe9a0':CHR[cur].c;hit(e.x,50,col,p.big)}catch(x){}};
})();
