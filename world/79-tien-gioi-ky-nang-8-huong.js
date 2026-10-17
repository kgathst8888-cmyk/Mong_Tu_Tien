/* ===== ✨ KỸ NĂNG 8 HƯỚNG — Tiên Giới (world/79-tien-gioi-ky-nang-8-huong.js) — nạp sau world/78 =====
 * Thành Tiên Giới là bản đồ thành thị (vil, không có quái) nên 4 hệ kỹ năng gốc bị ẩn. Module này thêm bảng nút riêng #tg8-sk CHỈ khi TG.on():
 *   • 5 kỹ năng môn phái (world/72) · 3 thần thông Ý Cảnh (world/49+53) · Pháp Bảo Bổn Mệnh (world/48) · Linh Căn đang chọn (systems/18).
 * Bấm nút → ra HIỆU ỨNG theo 8 hướng nhân vật đang quay mặt (cùng góc với world/74: E,SE,S,SW,W,NW,N,NE; vẽ theo mặt đất isometric 2:1).
 * Fix152: ngoài hiệu ứng, kỹ năng GÂY SÁT THƯƠNG lên quái Tiên Giới qua móc TGQ.pre(it) / TGQ.cast(it,sector,angle) của world/81-tien-gioi-quai.js (không có module đó → vẫn chỉ là hiệu ứng như cũ). Không tăng số lần dùng/cấp kỹ năng. Chỉ hiện nút của kỹ năng nhân vật đã có; chưa mở khoá → bấm báo khoá.
 * Hiệu ứng là bản vẽ riêng cho Tiên Giới (theo loại chiêu + màu hệ), không phải bản sao 1:1 hiệu ứng ở bản đồ đánh quái.
 * Chỉnh: TG8SK_CF.enable=false để tắt · TG8SK_CF.cd (giây tối đa hồi chiêu, mặc định 5) · TG8SK_CF.max (số hiệu ứng cùng lúc, mặc định 10). */
(function(){
'use strict';
if(typeof hero!=='function'||typeof PS==='undefined'||typeof RGBA!=='function'||!window.TG||!window.VP)return;
var CF=window.TG8SK_CF=window.TG8SK_CF||{};if(CF.enable===undefined)CF.enable=true;if(!CF.cd)CF.cd=5;if(!CF.max)CF.max=2;if(!CF.slow)CF.slow=2.2;
var PI=Math.PI,FXS=[],CD={},FA=PI/2,lastF=-1;
var SCOL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var FBT=[{n:'Kiếm Linh',i:'🗡️',c:'#6fd0ff'},{n:'Hồ Lô Dưỡng Linh',i:'🏺',c:'#ffb84a'},{n:'Hồn Phiên',i:'🚩',c:'#b585ff'},{n:'Cự Phủ',i:'🪓',c:'#ff8a3a'}];
var LCT=[{n:'Thiên Liệt Hỏa',i:'☄️',c:'#ff6a3a'},{n:'Triệu Hoá Ma Thần',i:'👹',c:'#5adf7a'},{n:'Hô Phong Hoán Vũ',i:'🌧️',c:'#5ab8ff'},{n:'Canh Kim Chỉ Lộ',i:'🗡️',c:'#ffd76a'},{n:'Địa Long Phiên Thần',i:'🐉',c:'#c89a5a'}];
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function tgOn(){try{return !!window.TG.on()}catch(e){return false}}
function sectId(){try{return window.VP.get()||''}catch(e){return ''}}
function ea(p){return 1-(1-p)*(1-p)}
function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
/* ----- hướng đang quay mặt (0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE) ----- */
function sector(){
 if(window.VPG8&&window.VPG8.CF.enable&&sectId()&&window.VPG8.state)return window.VPG8.state.sec;
 return ((Math.round(FA/(PI/4))%8)+8)%8;
}
function track(){
 if(lastF===fr)return;lastF=fr;
 var v=window.TGV;if(P.mv&&v&&(v.sx||v.sy))FA=Math.atan2(v.sy*2,v.sx);
}
/* ----- toạ độ: D phía trước, L bên phải, H cao; trả [x,y] trên màn hình (mặt đất dẹt 2:1) ----- */
function pt(f,D,L,H){return[D*f.c-L*f.sn,.5*(D*f.sn+L*f.c)-(H||0)]}
function rot(f,da){var a=f.A+da;return{A:a,c:Math.cos(a),sn:Math.sin(a)}}
/* ----- hình vẽ cơ bản (g đã ở toạ độ chân nhân vật, y xuống) ----- */
function orb(x,y,r,col,al){if(r<.5)return;g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,RGBA('#ffffff',Math.min(1,al)));q.addColorStop(.35,RGBA(col,al*.85));q.addColorStop(1,RGBA(col,0));g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();g.restore()}
function ring(x,y,rx,col,al,lw,dash){if(rx<1||al<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al);g.strokeStyle=col;g.lineWidth=lw||3;if(dash)g.setLineDash(dash);g.beginPath();g.ellipse(x,y,rx,rx*.5,0,0,6.2832);g.stroke();g.restore()}
function disc(x,y,rx,col,al){if(rx<1||al<=0)return;g.save();g.globalAlpha=Math.min(1,al);g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,rx*.5,0,0,6.2832);g.fill();g.restore()}
function pil(x,y,w,h,col,al){if(h<1||al<=0)return;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,y-h,0,y);q.addColorStop(0,RGBA(col,0));q.addColorStop(.6,RGBA(col,al*.7));q.addColorStop(1,RGBA('#ffffff',al));g.fillStyle=q;g.fillRect(x-w/2,y-h,w,h);g.restore();orb(x,y,w*.9,col,al*.8)}
function ico(x,y,sz,ch,al,rt){if(al<=0)return;g.save();g.globalAlpha=Math.min(1,al);g.translate(x,y);if(rt)g.rotate(rt);g.font=Math.round(sz)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,0,0);g.restore()}
function line(x1,y1,x2,y2,col,w,al,add){g.save();if(add)g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al);g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore()}
function fade(p,a){return p>a?Math.max(0,(1-p)/(1-a)):1}
/* ----- công thức hiệu ứng: R.xxx(F) → {life, draw(p)} ; F={f,col,ic,sp} ----- */
var R={};
R.proj=function(F){var f=F.f,c=F.col;return{life:28,draw:function(p){
 for(var i=5;i>=0;i--){var q=Math.max(0,p-i*.03),a=pt(f,40+380*ea(q),0,36);orb(a[0],a[1],11-i*1.5,c,.85-i*.12)}
 var h=pt(f,40+380*ea(p),0,36);ico(h[0],h[1],18,F.ic,fade(p,.8));
 if(p>.82){var e=pt(f,420,0,0),k=(p-.82)/.18;ring(e[0],e[1],70*k,c,1-k,3);orb(e[0],e[1]-20,34*(1-k*.5),c,1-k)}}}};
R.multi=function(F){var n=Math.min(6,F.sp.h||3),c=F.col;return{life:36,draw:function(p){
 for(var k=0;k<n;k++){var q=(p-k*.07)/.7;if(q<=0||q>=1)continue;var r=rot(F.f,(k-(n-1)/2)*.26),a=pt(r,30+340*ea(q),0,34),b=pt(r,10+340*ea(Math.max(0,q-.12)),0,34);
  line(b[0],b[1],a[0],a[1],c,5,.8*(1-q*.5),1);orb(a[0],a[1],9,c,.9*(1-q*.4));ico(a[0],a[1],15,F.ic,1-q*.6,r.A)}}}};
R.dash=function(F){var f=F.f,c=F.col;return{life:24,draw:function(p){
 var e=ea(p),a=pt(f,-30,0,30),b=pt(f,300*e,0,30);line(a[0],a[1],b[0],b[1],c,16*(1-p),.5*(1-p),1);line(a[0],a[1],b[0],b[1],'#fff',4*(1-p),.7*(1-p),1);
 for(var i=1;i<=3;i++){var q=pt(f,300*Math.max(0,e-i*.12),0,0);disc(q[0],q[1],26,c,.22*(1-p)/i);orb(q[0],q[1]-34,24,c,.35*(1-p)/i)}
 if(p<.4)ring(0,0,60*p/.4,c,1-p/.4,3);var h=pt(f,300*e,0,40);ico(h[0],h[1],20,F.ic,1-p*.6)}}};
R.mark=function(F){var c=F.col;return{life:70,draw:function(p){var e=pt(F.f,200,0,0),a=fade(p,.7),t=fr*.06;
 ring(e[0],e[1],70,c,a,3,[10,8]);ring(e[0],e[1],42+5*Math.sin(t*3),c,a,2);orb(e[0],e[1]-6,30,c,.4*a);
 ico(e[0],e[1]-64+Math.sin(t*2)*5,28,F.ic,a);line(e[0]-84,e[1],e[0]+84,e[1],c,2,.5*a,1)}}};
R.exec=function(F){var c=F.col;return{life:38,draw:function(p){var e=pt(F.f,190,0,0),k=ea(Math.min(1,p/.4));
 pil(e[0],e[1],34*(1-p*.5),230*k,c,fade(p,.5));
 if(p>.35){var q=(p-.35)/.65,r=90*ea(q);line(e[0]-r,e[1]-r*.5-30,e[0]+r,e[1]+r*.5-30,'#fff',5*(1-q),1-q,1);line(e[0]+r,e[1]-r*.5-30,e[0]-r,e[1]+r*.5-30,c,8*(1-q),1-q,1);ring(e[0],e[1],110*q,c,1-q,4)}
 ico(e[0],e[1]-70,30,F.ic,fade(p,.6))}}};
R.aoe=function(F){var c=F.col,Rr=Math.max(70,Math.min(F.sp.r||150,170));return{life:38,draw:function(p){var e=pt(F.f,190,0,0),k=ea(p);
 disc(e[0],e[1],Rr*k,c,.2*(1-p));ring(e[0],e[1],Rr*k,c,1-p,4);ring(e[0],e[1],Rr*k*.6,'#fff',.8*(1-p),2);
 for(var i=0;i<8;i++){var a=i*PI/4+.3,rr=Rr*k;orb(e[0]+Math.cos(a)*rr,e[1]+Math.sin(a)*rr*.5-6,10,c,.8*(1-p))}
 pil(e[0],e[1],40*(1-p),120*Math.sin(Math.min(1,p*1.6)*PI*.5),c,.9*(1-p));ico(e[0],e[1]-60*k,28,F.ic,1-p)}}};
R.burst=function(F){var c=F.col;return{life:44,draw:function(p){var e=pt(F.f,180,0,0),k=ea(p);
 for(var i=0;i<12;i++){var a=rnd(i)*6.28,r=rnd(i+9)*120*k;orb(e[0]+Math.cos(a)*r,e[1]+Math.sin(a)*r*.5-10-30*k*rnd(i+3),22+14*rnd(i+5),c,.5*(1-p))}
 ring(e[0],e[1],130*k,c,1-p,3);ico(e[0],e[1]-40,26,F.ic,1-p)}}};
R.freeze=function(F){var c=F.col;return{life:54,draw:function(p){var e=pt(F.f,190,0,0),k=ea(Math.min(1,p/.3)),a=fade(p,.7);
 ring(e[0],e[1],110*k,c,a,3);disc(e[0],e[1],100*k,c,.15*a);
 for(var i=0;i<7;i++){var an=i*6.28/7+.4,x=e[0]+Math.cos(an)*70*k,y=e[1]+Math.sin(an)*35*k,h=(40+26*rnd(i))*k;
  g.save();g.globalAlpha=.85*a;g.fillStyle=RGBA(c,.9);g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+9,y-h*.35);g.lineTo(x,y);g.lineTo(x-9,y-h*.35);g.closePath();g.fill();g.stroke();g.restore()}
 ico(e[0],e[1]-60,28,F.ic,a)}}};
R.sweep=function(F){var c=F.col,Rr=250;return{life:38,draw:function(p){var f=F.f,k=ea(Math.min(1,p/.7)),a0=f.A-1.1,al=fade(p,.6);
 for(var j=0;j<14;j++){var u=j/14,th=a0+2.2*Math.max(0,k-(1-u)*.5)*1,th2=a0+2.2*k*u;if(th2<=a0)continue;
  var x1=Rr*Math.cos(a0+2.2*k*(u-1/14)),y1=Rr*.5*Math.sin(a0+2.2*k*(u-1/14))-30,x2=Rr*Math.cos(th2),y2=Rr*.5*Math.sin(th2)-30;line(x1,y1,x2,y2,c,6+22*u,al*u*.8,1);line(x1,y1,x2,y2,'#fff',2+5*u,al*u*.9,1)}
 var h=a0+2.2*k;ico(Rr*Math.cos(h),Rr*.5*Math.sin(h)-30,34,F.ic,al,h)}}};
R.charge=function(F){var c=F.col;return{life:56,draw:function(p){var e=pt(F.f,200,0,0);
 if(p<.5){var k=p/.5;ring(e[0],e[1],110*(1-k*.4),c,.8,3,[8,8]);ico(e[0],e[1]-170*(1-ea(k)),30,F.ic,.9)}
 else{var q=(p-.5)/.5;pil(e[0],e[1],50*(1-q),200*(1-q*.4),c,1-q);ring(e[0],e[1],130*ea(q),c,1-q,5);orb(e[0],e[1]-10,60*(1-q),'#fff',.6*(1-q))}}}};
R.shield=function(F){var c=F.col;return{life:76,draw:function(p){var a=fade(p,.75),t=fr*.08;
 g.save();g.globalAlpha=.16*a;g.fillStyle=c;g.beginPath();g.ellipse(0,-36,64,74,0,0,6.2832);g.fill();g.restore();
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.85;g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.ellipse(0,-36,64,74,0,0,6.2832);g.stroke();g.restore();ring(0,0,64,c,a,3);
 for(var i=0;i<3;i++){var an=t+i*2.094;ico(Math.cos(an)*60,-36+Math.sin(an)*18,22,F.ic,a)}}}};
R.dotT=function(F){var c=F.col,Rr=Math.max(70,Math.min(F.sp.r||150,170));return{life:66,draw:function(p){var e=pt(F.f,170,0,0),a=fade(p,.7),k=ea(Math.min(1,p/.2));
 disc(e[0],e[1],Rr*k,c,.18*a);ring(e[0],e[1],Rr*k,c,a,3,[12,6]);ring(e[0],e[1],(Rr*.5+Rr*.4*((p*3)%1))*k,c,a*.7,2);
 for(var i=0;i<6;i++){var u=((p*1.6+i/6)%1),an=i*1.047;ico(e[0]+Math.cos(an)*Rr*.6*k,e[1]+Math.sin(an)*Rr*.3*k-u*90,20,F.ic,a*(1-u))}}}};
R.dotS=function(F){var c=F.col;return{life:56,draw:function(p){var a=fade(p,.7);
 for(var k=0;k<5;k++){var q=(p-k*.05)/.8;if(q<=0||q>=1)continue;var r=rot(F.f,(k-2)*.3),e=pt(r,40+320*ea(q),0,0);
  disc(e[0],e[1],18,c,.25*a);ico(e[0],e[1]-12-Math.abs(Math.sin(q*14))*10,26,F.ic,a);orb(e[0],e[1]-8,16,c,.4*a)}
 ring(0,0,50+90*ea(p),c,.8*(1-p),3)}}};
R.dotU=function(F){var c=F.col,Rr=Math.max(190,Math.min((F.sp.r||500)*.55,300));return{life:96,draw:function(p){var m=pt(F.f,Math.min(160,Rr*.5),0,0),a=fade(p,.75),k=ea(Math.min(1,p/.15));
 disc(m[0],m[1],Rr*k,c,.16*a);ring(m[0],m[1],Rr*k,c,a,4,[14,8]);ring(m[0],m[1],Rr*.55*k,c,a*.8,2);ring(m[0],m[1],Rr*((p*2.4)%1),c,a*.7,3);
 for(var i=0;i<16;i++){var u=((p*1.4+rnd(i+1))%1),an=rnd(i)*6.28,rr=Math.sqrt(rnd(i+7))*Rr*k;ico(m[0]+Math.cos(an)*rr,m[1]+Math.sin(an)*rr*.5-300*(1-u),22,F.ic,a*Math.min(1,u*4));
  if(u>.9)ring(m[0]+Math.cos(an)*rr,m[1]+Math.sin(an)*rr*.5,26*(u-.9)*10,c,1-(u-.9)*10,2)}
 ico(m[0],m[1]-70,40,F.ic,a)}}};
/* Ý Cảnh */
R.ycB=function(F){var c=F.col,ma=F.ma;return{life:56,draw:function(p){var e=pt(F.f,210,0,0),k=ea(Math.min(1,p/.3)),a=fade(p,.6);
 if(ma){disc(e[0],e[1],150*k,'#0c0614',.55*a);ring(e[0],e[1],150*k,c,a,4);ring(e[0],e[1],95*k,'#ff2a6a',a*.8,2)}else{disc(e[0],e[1],150*k,'#ffe27a',.2*a);ring(e[0],e[1],150*k,c,a,4)}
 pil(e[0],e[1],ma?80:100,320*k,c,a);for(var i=0;i<6;i++){var an=i*1.047+p,x=e[0]+Math.cos(an)*100*k,y=e[1]+Math.sin(an)*50*k;pil(x,y,22,150*k*(.6+.4*rnd(i)),c,a*.8)}
 ico(e[0],e[1]-130*k,38,F.ic,a)}}};
R.ycM=function(F){var c=F.col,ma=F.ma;return{life:56,draw:function(p){var a=fade(p,.75);
 for(var k=0;k<5;k++){var q=(p-k*.08)/.6;if(q<=0||q>=1)continue;
  if(!ma){var e=pt(F.f,120+60*k,(k-2)*38,0),h=300*(1-ea(q));line(e[0],e[1]-h-70,e[0],e[1]-h,c,6,.8,1);ico(e[0],e[1]-h-8,26,F.ic,1,PI);if(q>.9)ring(e[0],e[1],40,c,1,3);if(h<30)ring(e[0],e[1],50*q,c,.8*a,3)}
  else{var w=Math.sin(q*9+k)*40,e2=pt(F.f,40+380*ea(q),w,34);orb(e2[0],e2[1],14,c,.9*a);orb(e2[0],e2[1],24,'#ff2a6a',.4*a);ico(e2[0],e2[1],20,F.ic,a)}}}}};
R.ycS=function(F){var c=F.col,ma=F.ma;return{life:70,draw:function(p){var a=fade(p,.7);
 if(!ma){var fl=p<.15?(1-p/.15):0;if(fl>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.25*fl;g.fillStyle=c;g.fillRect(-900,-900,1800,1800);g.restore()}
  for(var i=0;i<7;i++){var q=(p-i*.07)/.4;if(q<=0||q>=1)continue;var e=pt(F.f,70+rnd(i)*330,(rnd(i+4)-.5)*320,0),x=e[0],y=e[1]-340;
   g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#fff';g.lineWidth=5*(1-q);g.shadowColor=c;g.shadowBlur=14;g.globalAlpha=1-q;g.beginPath();g.moveTo(x,y);for(var j=1;j<=7;j++)g.lineTo(x+(rnd(i*9+j)-.5)*56,y+j*(340/7));g.lineTo(e[0],e[1]);g.stroke();g.restore();ring(e[0],e[1],70*q,c,1-q,3);orb(e[0],e[1],40*(1-q),c,.8)}}
 else{var m=pt(F.f,170,0,0),k=ea(Math.min(1,p/.2));disc(m[0],m[1],200*k,'#0c0614',.5*a);ring(m[0],m[1],200*k,c,a,4);
  for(var n=0;n<26;n++){var u=n/26,an=u*18.8+fr*.08,rr=(1-((p*1.5+u)%1))*190*k;orb(m[0]+Math.cos(an)*rr,m[1]+Math.sin(an)*rr*.5-10,10,n%3?c:'#ff2a6a',a*.9)}
  ico(m[0],m[1]-50,44,F.ic,a,fr*.1)}}}};
R.ycL=function(F){var c=F.col;return{life:40,draw:function(p){var f=F.f,k=ea(p),a=fade(p,.6);
 for(var i=0;i<3;i++){var L=(i-1)*34,s0=pt(f,40+520*Math.max(0,k-i*.04)-80,L,60),s1=pt(f,40+520*Math.max(0,k-i*.04),L+20,10);line(s0[0],s0[1],s1[0],s1[1],'#0c0614',16,a*.9);line(s0[0],s0[1],s1[0],s1[1],c,5,a,1)}
 var h=pt(f,40+520*k,0,40);ico(h[0],h[1],40,F.ic,a);orb(h[0],h[1],40,c,.5*a)}}};
/* Pháp bảo */
R.fb0=function(F){var c=F.col;return{life:60,draw:function(p){var f=F.f;
 for(var k=0;k<8;k++){var an=k*PI/4,o=Math.min(1,p/.4),x0=Math.cos(an)*60*o,y0=-40+Math.sin(an)*20*o,x,y,rt;
  if(p<.45){x=x0;y=y0;rt=an}else{var q=ea((p-.45)/.55),e=pt(f,60+340*q,(k-3.5)*10,40);x=x0+(e[0]-x0)*q;y=y0+(e[1]-y0)*q;rt=f.A;line(x,y,x-f.c*30*q,y-f.sn*15*q,c,4,.7*(1-q),1)}
  orb(x,y,13,c,.8*fade(p,.8));ico(x,y,18,'🗡️',fade(p,.8),rt+PI/4)}}}};
R.fb1=function(F){var c=F.col;return{life:66,draw:function(p){
 for(var k=0;k<4;k++){var q=(p-k*.06)/.8;if(q<=0||q>=1)continue;var e=pt(F.f,30+330*ea(q),(k-1.5)*46,0),b=Math.abs(Math.sin(q*16))*14;
  disc(e[0],e[1],18,'#000',.25*(1-q));ico(e[0],e[1]-18-b,30,'👹',fade(q,.7));orb(e[0],e[1]-6,20,c,.3*(1-q))}}}};
R.fb2=function(F){var c=F.col;return{life:70,draw:function(p){
 for(var k=0;k<5;k++){var q=(p-k*.05)/.75;if(q<=0||q>=1)continue;var r=rot(F.f,(k-2)*.34),e=pt(r,40+330*ea(q),Math.sin(q*8+k)*16,50+Math.sin(q*6+k)*10);
  orb(e[0],e[1],22,c,.5*fade(q,.6));ico(e[0],e[1],28,'👻',fade(q,.6));line(e[0],e[1],e[0]-r.c*28,e[1]-r.sn*14,c,5,.5*fade(q,.6),1)}}}};
R.fb3=function(F){var c=F.col;return{life:60,draw:function(p){var e=pt(F.f,220,0,0);
 if(p<.4){var q=ea(p/.4);ico(e[0],e[1]-420*(1-q)-30,120+40*q,'🪓',1,(1-q)*3)}
 else{var q=(p-.4)/.6;ico(e[0],e[1]-48,140,'🪓',fade(q,.5));ring(e[0],e[1],200*ea(q),c,1-q,6);ring(e[0],e[1],120*ea(q),'#fff',.8*(1-q),3);disc(e[0],e[1],160*ea(q),c,.25*(1-q));
  for(var i=0;i<10;i++){var an=i*.628,rr=140*ea(q);orb(e[0]+Math.cos(an)*rr,e[1]+Math.sin(an)*rr*.5-20*q,12,c,.6*(1-q))}}}}};
/* Linh căn */
R.lc0=function(F){var c=F.col;return{life:62,draw:function(p){
 for(var k=0;k<5;k++){var q=(p-k*.1)/.5;if(q<=0||q>=1)continue;var e=pt(F.f,110+80*k,0,0),h=170*Math.sin(Math.min(1,q*1.4)*PI*.5),a=fade(q,.5);
  disc(e[0],e[1],34*Math.min(1,q*3),'#ff3a1a',.3*a);pil(e[0],e[1],42*(1-q*.4),h,c,a);ico(e[0],e[1]-h,26,'🔥',a);if(q<.3)ring(e[0],e[1],50*q/.3,c,1-q/.3,3)}}}};
R.lc1=function(F){var c=F.col;return{life:66,draw:function(p){var a=fade(p,.7);
 for(var v=0;v<3;v++){var r=rot(F.f,(v-1)*.4),k=ea(Math.min(1,p/.55)),prev=null;
  for(var i=0;i<=14;i++){var u=i/14*k,e=pt(r,30+330*u,Math.sin(u*9+v)*16,Math.abs(Math.sin(u*5))*10);if(prev)line(prev[0],prev[1],e[0],e[1],'#2f9a45',6*(1-u*.6),a);if(prev)line(prev[0],prev[1],e[0],e[1],c,2.5,a*.9,1);prev=e}
  if(prev)ico(prev[0],prev[1]-8,24,'🌿',a)}
 var m=pt(F.f,360,0,0);if(p>.5)ico(m[0],m[1]-24*ea((p-.5)*2),44*ea((p-.5)*2),'👹',a);ring(m[0],m[1],70*ea(p),c,.8*a,3)}}};
R.lc2=function(F){var c=F.col;return{life:76,draw:function(p){var m=pt(F.f,150,0,0),a=fade(p,.75),k=ea(Math.min(1,p/.2));
 disc(m[0],m[1],240*k,c,.12*a);
 for(var i=0;i<34;i++){var u=((p*2.2+rnd(i))%1),an=rnd(i+3)*6.28,rr=Math.sqrt(rnd(i+8))*230*k,x=m[0]+Math.cos(an)*rr,y=m[1]+Math.sin(an)*rr*.5;line(x,y-260*(1-u),x-3,y-260*(1-u)+20,'#bfe8ff',2,a*.8,1);if(u>.92)ring(x,y,16*(u-.92)*12,c,1-(u-.92)*12,2)}
 ring(m[0],m[1],240*k,c,a,3,[10,6]);ico(m[0],m[1]-80,36,'💧',a)}}};
R.lc3=function(F){var c=F.col;return{life:46,draw:function(p){var a=fade(p,.6);
 for(var b=0;b<2;b++){var q=ea(Math.max(0,Math.min(1,(p-b*.22)/.6))),L=b?-30:30,s0=pt(F.f,20,L,40),s1=pt(F.f,20+520*q,L,40);
  line(s0[0],s0[1],s1[0],s1[1],c,16,.35*a,1);line(s0[0],s0[1],s1[0],s1[1],'#fff',5,.9*a,1);orb(s1[0],s1[1],26,c,a);ico(s1[0],s1[1],26,'🗡️',a,F.f.A+PI/4);
  for(var i=0;i<6;i++){var e=pt(F.f,20+520*q*rnd(i+b*7),L+(rnd(i+3)-.5)*30,40+(rnd(i+5)-.5)*40);orb(e[0],e[1],6,'#fff',.7*a)}}}}};
R.lc4=function(F){var c=F.col;return{life:68,draw:function(p){var a=fade(p,.7);
 for(var k=0;k<6;k++){var q=(p-k*.08)/.45;if(q<=0||q>=1)continue;var e=pt(F.f,60+68*k,Math.sin(k*1.3)*10,0),h=Math.sin(q*PI)*(40+k*8);
  disc(e[0],e[1],30,'#6b4a22',.45*a);ring(e[0],e[1],40*q,c,1-q,3);ico(e[0],e[1]-h,k===5?60:34,k===5?'🐉':'⛰️',a)}}}};
function recipe(it){
 var s=it.sp||{},t=s.t;
 if(it.rc)return R[it.rc];
 if(t==='dot')return s.ult?R.dotU:s.where==='tgt'?R.dotT:R.dotS;
 return R[t]||R.aoe;
}
/* ----- danh sách kỹ năng nhân vật có ----- */
function list(){
 var out=[],p=PS[cur];if(!p)return out;
 try{var id=window.VPD&&VPD.sect();if(id){var SL=[0,1,2,3,5],sp=VPD.spec[id];for(var b=0;b<5;b++){var s=sp[SL[b]];if(!s)continue;var inf=VPD.info(id,SL[b]);out.push({k:'s'+b,ic:s.i,col:SCOL[id]||'#fff',sp:s,cd:s.cd||4,ok:!!inf.unl,lock:'🔒 Mở ở Lv '+inf.need})}}}catch(e){}
 try{var y=window.YCANH&&YCANH.info();if(y&&window.YCTT){var ma=y.path==='m',K=['B','M','S'];for(var j=0;j<3;j++){var d=YCTT.cfg.sk[y.path][j];if(!d)continue;var ok=true,lk='🔒 '+d.n;try{ok=window.YCTOC?!!YCTOC.ok(j,y):y.realm>=YCTT.cfg.unlock[j];if(!ok&&window.YCTOC)lk='🔒 '+d.n+': '+YCTOC.lockMsg(j,y)}catch(e){}
  var rc=d.k==='L'?'ycL':d.k==='B'?'ycB':d.k==='M'?'ycM':'ycS';out.push({k:'y'+j,ic:d.i,col:ma?'#c070ff':'#ffd84a',rc:rc,ma:ma,sp:{},cd:d.cd||12,ok:ok,lock:lk})}}}catch(e){}
 try{var fb=p.fb,on=window.HDAO&&HDAO.on();if(on&&fb&&fb.t>=0&&((fb.lv&&fb.lv[fb.t])|0)>0){var T=FBT[fb.t];out.push({k:'f'+fb.t,ic:T.i,col:T.c,rc:'fb'+fb.t,sp:{},cd:14,ok:true})}}catch(e){}
 try{var lc=p.lc;if(lc&&lc.root>=0&&LCT[lc.root]){var L=LCT[lc.root];out.push({k:'l'+lc.root,ic:L.i,col:L.c,rc:'lc'+lc.root,sp:{},cd:12,ok:true})}}catch(e){}
 return out;
}
/* ----- thi triển ----- */
function msg(t){try{if(typeof toast==='function')toast(t)}catch(e){}}
function fire(it){
 if(!CF.enable||!tgOn()||!own())return false;
 var now=Date.now();
 if(!it.ok){msg(it.lock||'🔒 Chưa mở khoá');return false}
 if((CD[it.k]||0)>now)return false;
 try{if(window.TGQ&&TGQ.pre&&TGQ.pre(it)===false)return false}catch(e){}
 var sc=sector(),A=sc*PI/4,F={f:{A:A,c:Math.cos(A),sn:Math.sin(A)},col:it.col,ic:it.ic,sp:it.sp||{},ma:it.ma},r=recipe(it)(F);
 CD[it.k]=now+Math.min(it.cd,CF.cd)*1000;
 while(FXS.length>=CF.max)FXS.shift();
 FXS.push({t0:fr,life:Math.round(r.life*(CF.slow||1)),draw:r.draw});   /* Fix200: CF.slow = hệ số làm chậm hiệu ứng kỹ năng (1 = gốc) */
 try{P.atk=Math.max(P.atk|0,16)}catch(e){}
 try{if(window.TGQ&&TGQ.cast)TGQ.cast(it,sc,A)}catch(e){}
 return true;
}
/* ----- bảng nút ----- */
var bar=null,sig='',items=[];
function css(){var c=document.createElement('style');c.textContent='#tg8-sk{position:fixed;right:8px;top:calc(124px + env(safe-area-inset-top,0px));display:none;flex-direction:column;flex-wrap:wrap-reverse;gap:6px;max-height:min(300px,52vh);z-index:3;contain:layout style}#tg8-sk button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid #fff;background:radial-gradient(circle at 50% 35%,rgba(60,50,90,.95),rgba(10,8,24,.95));color:#fff;font-size:20px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}#tg8-sk button small{position:absolute;left:0;right:0;bottom:1px;font-size:10px;color:#fff;text-shadow:0 0 3px #000}#tg8-sk button.lk{opacity:.45}#tg8-sk button.cd{opacity:.6}';document.head.appendChild(c)}
function stop(e){e.stopPropagation();e.preventDefault()}
function rebuild(){
 bar.innerHTML='';
 items.forEach(function(it){var b=document.createElement('button');b.textContent=it.ic;b.style.borderColor=it.col;b.style.boxShadow='0 0 8px '+it.col;if(!it.ok)b.className='lk';var sm=document.createElement('small');b.appendChild(sm);it.el=b;it.sm=sm;
  b.onpointerdown=function(e){stop(e);fire(it)};b.onclick=stop;b.ontouchstart=function(e){e.stopPropagation()};b.onmousedown=function(e){e.stopPropagation()};bar.appendChild(b)});
}
function upd(){
 try{
  if(!bar){css();bar=document.createElement('div');bar.id='tg8-sk';document.body.appendChild(bar)}
  var on=CF.enable&&tgOn()&&own()&&typeof started!=='undefined'&&started;
  if(!on){bar.style.display='none';return}
  var L=list(),s=L.map(function(i){return i.k+(i.ok?1:0)+i.ic}).join('|');
  if(s!==sig){sig=s;items=L;rebuild()}else L.forEach(function(n,i){items[i].ok=n.ok;items[i].lock=n.lock});
  bar.style.display=items.length?'flex':'none';
  var now=Date.now();items.forEach(function(it){if(!it.el)return;var r=(CD[it.k]||0)-now;it.el.className=!it.ok?'lk':r>0?'cd':'';it.sm.textContent=r>0?Math.ceil(r/1000):''});
 }catch(e){}
}
setInterval(upd,250);
/* ----- vẽ (bọc hero ngoài cùng) ----- */
var _h=hero;
hero=function(){
 _h.apply(this,arguments);
 if(!CF.enable||!tgOn()||!own())return;
 try{track()}catch(e){}
 if(!FXS.length)return;
 g.save();
 try{
  g.translate((P.x-cam)*s,GY);g.scale(s,s);
  for(var i=FXS.length-1;i>=0;i--){var x=FXS[i],p=(fr-x.t0)/x.life;if(p>=1||p<0){FXS.splice(i,1);continue}
   g.save();try{x.draw(p)}catch(e){}g.restore()}
 }finally{g.restore()}
};
window.TG8SK={fire:fire,list:list,R:R,fx:FXS,sector:sector};
})();
