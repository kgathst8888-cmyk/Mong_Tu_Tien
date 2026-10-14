/* core/01g-hero-draw.js — RGBA, armXY, dArm/dLeg, hero(), heroSpark, foe()
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
const RGC={},RGBA=(h,a)=>{let o=RGC[h];if(!o){let q=h;if(q.length==4)q='#'+q[1]+q[1]+q[2]+q[2]+q[3]+q[3];o=RGC[h]=[parseInt(q.slice(1,3),16),parseInt(q.slice(3,5),16),parseInt(q.slice(5,7),16)]}return'rgba('+o[0]+','+o[1]+','+o[2]+','+a+')'};
const rot2=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)],sg=(p,a,b)=>p<=a?0:p>=b?1:(p-a)/(b-a),es=u=>u*u*(3-2*u),ei=u=>u*u*u,eo=u=>1-Math.pow(1-u,3),lp=(a,b,u)=>a+(b-a)*u,
skCol=(n,d)=>!n?d:/Hỏa/.test(n)?'#ff8a3a':/Băng|Bão Tuyết/.test(n)?'#9fe0ff':/Sét|Lôi/.test(n)?'#cfe8ff':/Huyết|Ảnh|Ám Sát|Phi Đao|Ẩn Thân/.test(n)?'#e060a0':/Độc/.test(n)?'#7fe85a':/Tử Thần/.test(n)?'#c070ff':/Linh|Điều Tức/.test(n)?'#8fffb0':/Xuyên/.test(n)?'#9fe0ff':d;
function armXY(S,E,H,au,af){const e=rot2(E[0]-S[0],E[1]-S[1],au),f=rot2(H[0]-E[0],H[1]-E[1],au+af);return[S[0]+e[0]+f[0],S[1]+e[1]+f[1]]}
function dPc(p){if(!p)return;let c=p.im;try{const m=g.getTransform();c=CR(p.im,p.h*Math.hypot(m.a,m.b),.42)}catch(e){}g.drawImage(c,p.x,p.y,p.w,p.h)}
function dArm(R,k,au,af){const u=R[k+'u'],l=R[k+'l'],S=R[k+'_S'],E=R[k+'_E'];if(!S)return;g.save();g.translate(S[0],S[1]);g.rotate(au);g.translate(-S[0],-S[1]);dPc(u);g.translate(E[0],E[1]);g.rotate(af);g.translate(-E[0],-E[1]);dPc(l);g.restore()}
function dLeg(p,pv,a,lf){if(!p)return;g.save();g.translate(pv[0],pv[1]-lf);g.rotate(a);g.translate(-pv[0],-pv[1]);dPc(p);g.restore()}
function star(n,r1,r2,rot){g.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,r=i%2?r2:r1;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
function glowAt(x,y,r,c,a){glowDraw(x,y,r*1.15,c,Math.min(1,a));if(a>.5)glowDraw(x,y,r*.5,'#ffffff',a*.5)}
/* DÁNG ĐI v3 (mượt) — pha tích lũy theo từng P; chân: đạp lùi tuyến tính rồi vung Hermite liền vận tốc (không gãy khúc),
   nhấc chân theo sin², tay đánh sin thuần, khuỷu dùng max mềm, nhún 2 nhịp/chu kỳ. Chỉ tính toán; hero() trộn theo WG.k (đã ease). */
function walkGait(on){
 if(P._wf!==fr){P._wf=fr;const k0=P._wk||0,k=on?Math.min(1,k0+.09):Math.max(0,k0-.11);P._wk=k;if(on||k>0)P._wp=(P._wp||0)+(vil?.25:.15)*(on?1:es(k))}
 const k=P._wk||0;if(k<=.001)return{k:0};
 const u=((P._wp||0)/6.2832)%1,Af=.3,Ab=.34,SN=.6,vs=(Ab+Af)/SN*(1-SN),
 pose=v=>{v=((v%1)+1)%1;if(v<SN)return[lp(-Af,Ab,v/SN),0];const s=(v-SN)/(1-SN),s2=s*s,s3=s2*s,
  y=(2*s3-3*s2+1)*Ab+(s3-2*s2+s)*vs+(-2*s3+3*s2)*-Af+(s3-s2)*vs,w=Math.sin(Math.PI*s);return[y,w*w*15]},
 L=pose(u),R=pose(u+.5),h=.5-.5*Math.cos(12.5664*u),ca=Math.cos(6.2832*u),
 sm=x=>(x+Math.sqrt(x*x+.004))/2;
 return{k:k,lL:L[0],lR:R[0],fL:L[1],fR:R[1],aU:-.27*ca+.02,bU:.27*ca+.02,aF:-.2-sm(.27*ca)*1.2,bF:-.2-sm(-.27*ca)*1.2,
  brot:.04+.012*Math.sin(6.2832*u),bx:1.5+.8*Math.sin(12.5664*u+1),bob:-Math.pow(h,.8)*5.2}}
function hero(){const T=CHR[cur].t,R=RIGI[cur],bs=R&&R.base;if(!bs||!bs.im.naturalWidth)return;
const t=fr,HH=150,k=HH/R.H,w=R.W*k,aa=P.atk>0,at=aa?1-P.atk/P.atkT:0,rl=aa?(P.atkT-12)/P.atkT:1,cc=CHR[cur].c,tr=PS[cur].tier,br=PS[cur].br,AS=T=='a'&&br==1,mv0=P.mv,WG=walkGait(mv0&&!aa&&T!='m'),sk=aa&&!!P.ln,col=skCol(aa?P.ln:'',cc),I=sk?1:.55,
 ph=t*.3,sa=Math.sin(ph),sw=aa?Math.sin(Math.min(1,at)*3.14):0,bob=T=='m'?-(18+Math.sin(t*.07)*3.6+(mv0?Math.sin(t*.28)*.9:0)):lp(Math.sin(t*.08)*1.4,WG.bob||0,es(WG.k));
let aU=.05+Math.sin(t*.05)*.025,aF=-.14,bU=-.05-Math.sin(t*.05)*.025,bF=-.1,lL=Math.sin(t*.03)*.012,lR=-lL,fL=0,fR=0,wA=.2,th=0,bx=0,by=0,brot=0;
const K=(a,b,c,d)=>at<rl*.42?lp(a,b,es(sg(at,0,rl*.42))):at<rl?lp(b,c,ei(sg(at,rl*.42,rl))):lp(c,d,es(sg(at,rl,1)));
if(WG.k>.001){const q=es(WG.k);lL=lp(lL,WG.lL,q);lR=lp(lR,WG.lR,q);fL=WG.fL*q;fR=WG.fR*q;aU=lp(aU,WG.aU,q);aF=lp(aF,WG.aF,q);bU=lp(bU,WG.bU,q);bF=lp(bF,WG.bF,q);brot=lp(brot,WG.brot,q);bx=lp(bx,WG.bx,q)}
if(mv0&&!aa&&T=='m'){aU=.08+Math.sin(ph)*.05;aF=-.2;brot=.075;wA=.06+Math.sin(ph)*.05}
if(aa&&(T=='w'||AS)){const sp=T=='w'&&br==1;
 if(!sp){aU=K(.05,-2.45,-.45,.05);aF=K(-.14,-.95,.05,-.14);wA=K(.2,-.75,1.85,.2);bU=K(-.05,.8,-.4,-.05);bF=K(-.1,-.25,-.5,-.1);lR=K(0,.14,-.4,0);lL=K(0,-.1,.32,0);bx=K(0,-6,13,0);brot=K(0,-.05,.08,0);by=K(0,-1,2,0)}
 else{aU=K(.05,-1.28,-1.5,.05);aF=K(-.14,1.15,-.1,-.14);wA=K(.1,1.5,1.5,.1);th=K(0,-8,16,0);bU=K(-.05,.55,-.25,-.05);bF=K(-.1,-.3,-.3,-.1);lR=K(0,.12,-.42,0);lL=K(0,-.08,.34,0);bx=K(0,-5,11,0);brot=K(0,-.04,.07,0)}}
let rel=0,a2=0;
if(aa&&T=='a'&&!AS){const a1=es(sg(at,0,rl*.25));a2=es(sg(at,rl*.25,rl*.98));rel=at>=rl?es(sg(at,rl,rl+.09)):0;const rc=es(sg(at,rl+.05,1));
 aU=at<rl?lp(.05,-1.5,a1):lp(-1.5,.05,rc);aF=at<rl?lp(-.14,-.04,a1):lp(-.04,-.14,rc);
 bU=at<rl?lp(-.05,-1.4,a1)+.18*a2:lp(-1.22,-.05,rc);
 bF=at<rl?lp(-.1,.1,a1)+3.05*a2:lp(lp(3.15,.45,rel),-.1,rc);
 lL=lp(0,.17,at<rl?a1:1-rc);lR=lp(0,-.15,at<rl?a1:1-rc);brot=at<rl?-.05*a2:lp(.04,0,rc);bx=at<rl?-5*a2:lp(4,0,rc)}
if(aa&&T=='m'){const m1=es(sg(at,0,rl*.55)),mt=at>=rl?eo(sg(at,rl,rl+.12)):0,mr=es(sg(at,rl+.1,1));
 aU=at<rl?lp(.06,-.95,m1):at<rl+.1?lp(-.95,-.35,mt):lp(-.35,.06,mr);aF=at<rl?lp(-.18,-1.25,m1)+Math.sin(t*.9)*.05*m1:at<rl+.1?lp(-1.25,-.55,mt):lp(-.55,-.18,mr);
 wA=at<rl?lp(.04,-.16,m1):at<rl+.1?lp(-.16,.8,mt):lp(.8,.04,mr);by=-(at<rl?8*m1:lp(8,0,mr));brot=at<rl?-.04*m1:lp(.07,0,mr);bx=at<rl?-3*m1:lp(5,0,mr)}
const pa=armXY(R.A_S,R.A_E,R.A_H,aU,aF),pb=R.B_S?armXY(R.B_S,R.B_E,R.B_H,bU,bF):null,hxA=-w/2+pa[0]*k,hyA=-HH+pa[1]*k;
const JY=vil?0:(P.jy||0),JK=Math.max(.5,1-JY/420);g.save();g.translate((P.x-cam)*s,GY-JY*s);g.scale(s,s);const MHV=T=='m'?.72+Math.sin(t*.07)*.05:1;g.fillStyle='rgba(0,0,0,'+(.35*Math.max(.3,1-JY/320)*(T=='m'?.7:1))+')';g.beginPath();g.ellipse(0,2+JY,36*SZ*JK*MHV,8*SZ*JK*MHV,0,0,6.28);g.fill();
{const ar=48+tr*6+(aa?14:0),ga=.11+tr*.045+(aa?.16:0)+Math.sin(t*.06)*.025;glowDraw(0,-36,ar,col,Math.min(1,ga*1.6))}
if(!vil&&P.jr){g.translate(0,-50);g.rotate(P.jr*P.d);g.translate(0,50)}g.scale(P.d*.7*SZ,.7*SZ);
if(T=='m'){const hp=Math.sin(t*.07);g.save();g.globalCompositeOperation='lighter';
g.save();g.translate(0,-2);g.scale(1,.26);const hq=g.createRadialGradient(0,0,2,0,0,48);hq.addColorStop(0,RGBA(cc,.6));hq.addColorStop(.6,RGBA(cc,.2));hq.addColorStop(1,RGBA(cc,0));g.globalAlpha=.65+hp*.1;g.fillStyle=hq;g.beginPath();g.arc(0,0,48,0,6.28);g.fill();g.strokeStyle=cc;g.lineWidth=1.8;g.globalAlpha=.5;g.beginPath();g.arc(0,0,22+hp*2,0,6.28);g.stroke();g.rotate(t*.04);g.setLineDash([5,7]);g.globalAlpha=.4;g.beginPath();g.arc(0,0,35,0,6.28);g.stroke();g.restore();
for(let i=0;i<6;i++){const u=(t*.028+i/6)%1,a=i*1.9+t*.03;g.globalAlpha=(1-u)*.85;g.fillStyle=i%2?'#fff':cc;g.beginPath();g.arc(Math.cos(a)*(8+u*12),-20+u*20,1.6+(1-u)*1.6,0,6.28);g.fill()}
g.restore()}
if(aa&&T=='m'){const cp=sg(at,0,rl),fa=at<rl?1:1-sg(at,rl,1),rr=(24+60*es(cp))*(.7+.5*I);g.save();g.globalCompositeOperation='lighter';g.translate(0,-2);g.scale(1,.3);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=16;g.globalAlpha=(.3+.6*cp)*fa;g.lineWidth=3.5;g.beginPath();g.arc(0,0,rr,0,6.28);g.stroke();g.lineWidth=1.8;g.beginPath();g.arc(0,0,rr*.72,0,6.28);g.stroke();g.save();g.rotate(t*.05);star(6,rr*.95,rr*.5,0);g.stroke();g.restore();g.save();g.rotate(-t*.07);star(3,rr*.7,rr*.34,.3);g.stroke();g.restore();g.globalAlpha=(.15+.25*cp)*fa;g.fillStyle=col;g.beginPath();g.arc(0,0,rr*.9,0,6.28);g.fill();g.restore();
 if(sk){const q=g.createLinearGradient(0,-260,0,0);q.addColorStop(0,RGBA(col,0));q.addColorStop(1,RGBA(col,.5*cp*fa));g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.fillRect(-26*cp-8,-260,(26*cp+8)*2,260);g.restore()}}
if(aa&&T=='a'&&!AS){const cp=sg(at,0,rl),fa=at<rl?1:1-sg(at,rl,1);g.save();g.globalCompositeOperation='lighter';g.translate(0,-2);g.scale(1,.3);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=12;g.globalAlpha=(.25+.6*cp)*fa*I;g.lineWidth=3;const r2=20+44*es(cp);g.beginPath();g.arc(0,0,r2,0,6.28);g.stroke();g.rotate(t*.06);for(let i=0;i<4;i++){g.rotate(1.5708);g.beginPath();g.moveTo(r2*.7,0);g.lineTo(r2*1.25,0);g.stroke()}g.restore()}
g.save();g.translate(bx,by+bob);g.rotate(brot+Math.sin(t*.045)*.008);g.scale(1,1+Math.sin(t*.07)*.012+(mv0?Math.sin(t*.3)*.01:0));
g.save();g.translate(-w/2,-HH);g.scale(k,k);
if(R.LL){dLeg(R.LL,R.pivL,lL,fL);dLeg(R.LR,R.pivR,lR,fR)}
if(T=='m'){const pbs=bs,N=28,sh=pbs.im.naturalHeight/N,MC=(()=>{try{return CR(pbs.im,pbs.h*Math.hypot(g.getTransform().a,g.getTransform().b),.42)}catch(e){return pbs.im}})(),MR=MC.height/pbs.im.naturalHeight,amp=6.5*(1+(mv0?.8:0)+(aa?.6:0))/k;for(let i=0;i<N;i++){const v=(pbs.y+(i+.5)*pbs.h/N)/R.H,f=Math.max(0,(v-.74)/.26),ox=Math.sin(t*.07-v*5)*amp*.35*f*f*f+(mv0?-(2.4+Math.sin(t*.18-v*3)*.8)*f/k:0);g.drawImage(MC,0,Math.floor(i*sh*MR),MC.width,Math.ceil(sh*MR),pbs.x+ox,pbs.y+i*pbs.h/N,pbs.w,pbs.h/N+.8)}}else dPc(bs);
if(R.B_S)dArm(R,'B',bU,bF);
dArm(R,'A',aU,aF);dPc(R.sh);g.restore();
if(T=='w'){const ln=br==1?1:0,img=WPI[ln*4+tr];if(img.naturalWidth){g.save();
 if(ln==0){const L=82,ww=img.naturalWidth/img.naturalHeight*L;g.translate(hxA,hyA);g.rotate(wA);WD(img,-ww/2,-L*.86,ww,L,tr,'#ffd890');
  if(aa&&at>rl*.42&&at<rl+.1){g.globalCompositeOperation='lighter';const u=sg(at,rl*.42,rl+.1);g.globalAlpha=(1-u)*.9;g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=14;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-L*.86);g.lineTo(0,-L*.15);g.stroke()}}
 else{const L=96,ww=img.naturalWidth/img.naturalHeight*L;g.translate(hxA,hyA);g.rotate(wA);g.translate(0,-th*0);const gr=g.createLinearGradient(-3,0,3,0);gr.addColorStop(0,'#2e1c10');gr.addColorStop(.5,'#9a6a3e');gr.addColorStop(1,'#2e1c10');g.fillStyle=gr;g.fillRect(-2.6,-8+th*.15,5.2,70);g.fillStyle='#c9a24f';g.fillRect(-3.4,54+th*.15,6.8,4);g.fillRect(-3.2,14+th*.15,6.4,2);WD(img,-ww/2,-L-4-th*.3,ww,L,tr,'#ffd890');}
 g.restore()}
 if(aa&&at>rl*.42&&at<rl+.14){const u=sg(at,rl*.42,rl+.14);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=16;g.globalAlpha=(1-u)*.9;g.lineCap='round';if(ln==1){g.lineWidth=9;g.beginPath();g.moveTo(hxA+10,hyA-4);g.lineTo(hxA+20+130*u,hyA-4);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.moveTo(hxA+30,hyA-4);g.lineTo(hxA+30+130*u,hyA-4);g.stroke()}else{g.lineWidth=10;g.beginPath();g.arc(hxA-30,hyA+8,86,-2.2,-2.2+u*3.5);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.arc(hxA-30,hyA+8,86,-2.0,-2.2+u*3.5);g.stroke()}g.restore()}}
if(T=='m'){g.save();g.translate(hxA,hyA);g.rotate(wA);const WS=WPNIMG(),SUMB=PS[cur].br==0;if(WS&&WS.naturalWidth){if(SUMB){g.save();g.translate(0,-64+Math.sin(t*.07)*3);g.rotate(-wA*.4);const Lh=38,ww=WS.naturalWidth/WS.naturalHeight*Lh;WD(WS,-ww/2,-Lh/2,ww,Lh,PS[cur].tier,'#c9a0ff');g.restore()}else{const Ls=120,ww=WS.naturalWidth/WS.naturalHeight*Ls;WD(WS,-ww/2,-Ls*.62,ww,Ls,PS[cur].tier,'#c9a0ff')}}else{const gr=g.createLinearGradient(-3,0,3,0);gr.addColorStop(0,'#33200f');gr.addColorStop(.5,'#9b6b3c');gr.addColorStop(1,'#33200f');g.fillStyle=gr;g.fillRect(-2.4,-118,4.8,192);g.fillStyle='#c9a24f';g.fillRect(-3.2,-12,6.4,3);g.fillRect(-3.2,26,6.4,3);g.strokeStyle='#c9a24f';g.lineWidth=2.4;g.beginPath();g.moveTo(-3,-116);g.quadraticCurveTo(-13,-134,-6,-146);g.moveTo(3,-116);g.quadraticCurveTo(13,-134,6,-146);g.stroke();}
 const cy2=SUMB?-64:-71,cpp=aa?sg(at,0,rl):0,pu=aa?(at<rl?1+cpp*1.6:1+(1-sg(at,rl,1))*1.2):1+Math.sin(t*.1)*.08;
 g.save();g.globalCompositeOperation='lighter';glowAt(0,cy2,(26+(aa?30*cpp*I:0))*pu,col,.9);if(aa){g.save();g.translate(0,cy2);g.rotate(t*.08);g.fillStyle=RGBA(col,.85*(.4+cpp*.6));star(4,(40+60*cpp*I)*(at<rl?1:1-sg(at,rl,1)),4,0);g.fill();g.rotate(.785);star(4,(26+36*cpp*I),3,0);g.fill();g.restore();
  for(let i=0;i<(sk?12:6);i++){const u=((t*.035+i/(sk?12:6))%1),a=i*2.4+t*.04,r0=(1-u)*(46+46*cpp);g.fillStyle=RGBA(col,.9*u);g.beginPath();g.arc(Math.cos(a)*r0,cy2+Math.sin(a)*r0*.8,2+u*2.4,0,6.28);g.fill()}
  if(at>=rl&&at<rl+.2){const u=sg(at,rl,rl+.2);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=20;g.lineWidth=7*(1-u);g.globalAlpha=1-u;g.beginPath();g.arc(0,cy2,18+130*eo(u)*(.7+.5*I),0,6.28);g.stroke();g.lineWidth=3*(1-u);g.strokeStyle='#fff';g.beginPath();g.arc(0,cy2,10+90*eo(u)*(.7+.5*I),0,6.28);g.stroke()}}
 g.restore();if(!(WS&&WS.naturalWidth)){g.fillStyle=col;g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.moveTo(0,cy2-13*pu);g.lineTo(7*pu,cy2);g.lineTo(0,cy2+13*pu);g.lineTo(-7*pu,cy2);g.closePath();g.fill();g.stroke();}
 g.fillStyle='#fff';for(let i=0;i<tr;i++){const a=t*.05+i*2.1;g.beginPath();g.arc(Math.cos(a)*18,cy2+Math.sin(a)*7,2.2,0,6.28);g.fill()}g.restore()}
if(T=='a'&&!AS){const BT=bowTips(WPNIMG(),hxA-11.48,hyA-4),r=46,cx=hxA-r+6,cy=hyA-2,ex=BT?BT.mx:cx+r*Math.cos(1),ey=r*Math.sin(1),dr=aa&&at<rl,hb=pb?[-w/2+pb[0]*k,-HH+pb[1]*k]:[ex,cy],sx=dr?Math.min(ex,hb[0]+4):ex,sy=dr?hb[1]:(BT?BT.my:cy),pl=aa?(at<rl?a2:1-rel):0;g.save();g.lineCap='round';
 if(aa){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=16;g.lineWidth=7+6*pl*I;g.globalAlpha=(.35+.5*pl)*I;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.restore()}
 const WB=WPNIMG();if(WB&&WB.naturalWidth){g.save();g.translate(cx+r*.62,cy-2);g.rotate(-.54);const Lb=104,ww=WB.naturalWidth/WB.naturalHeight*Lb;WD(WB,-ww/2,-Lb/2,ww,Lb,PS[cur].tier,'#8fe9ff');g.restore()}else{g.strokeStyle='#3d2210';g.lineWidth=6;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.strokeStyle='#d8a868';g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.fillStyle='#c9a24f';g.fillRect(cx+r-3,cy-9,5,18);}
 if(tr>=1&&!(WB&&WB.naturalWidth)){g.strokeStyle=cc;g.globalAlpha=.45+.3*Math.sin(t*.1);g.lineWidth=1.8;g.beginPath();g.arc(cx,cy,r+4,-.95,.95);g.stroke();g.globalAlpha=1}
 if(BT)bowStr(BT,sx,sy,aa,at,rl,dr,PS[cur].tier|0,'#8fe9ff');else{g.strokeStyle='#fff';g.lineWidth=1.4;g.beginPath();g.moveTo(ex,cy-ey);g.lineTo(sx,sy);g.lineTo(ex,cy+ey);g.stroke()}
 if(dr){const L=96;g.strokeStyle='#ffe9a0';g.lineWidth=3.2;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex+34,sy);g.stroke();g.fillStyle='#fff';g.beginPath();g.moveTo(ex+46,sy);g.lineTo(ex+30,sy-6);g.lineTo(ex+30,sy+6);g.fill();g.strokeStyle='#ffd070';g.lineWidth=1.6;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-6,sy-7);g.moveTo(sx,sy);g.lineTo(sx-6,sy+7);g.stroke();
  g.save();g.globalCompositeOperation='lighter';glowAt(ex+40,sy,(10+34*a2)*(.7+.5*I),col,.5+.5*a2);glowAt(sx,sy,6+14*a2,'#fff',.6);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=12;g.globalAlpha=.4+.5*a2;g.lineWidth=2;for(let h=0;h<2;h++){g.beginPath();for(let q=0;q<=20;q++){const u=q/20,xx=sx+(ex+40-sx)*u,yy=sy+Math.sin(u*14-t*.6+h*3.14)*(5+8*a2)*u;q?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
  if(sk){g.globalAlpha=.55*a2;g.lineWidth=2.4;g.beginPath();g.ellipse(ex+52,sy,10+10*a2,22+14*a2,0,0,6.28);g.stroke();g.beginPath();g.ellipse(ex+70,sy,7+8*a2,17+12*a2,0,0,6.28);g.stroke()}g.restore()}
 if(aa&&at>=rl&&at<rl+.18){const u=sg(at,rl,rl+.18);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=18;for(let i=0;i<(sk?9:5);i++){const yy=(i-(sk?4:2))*(sk?7:9);g.globalAlpha=(1-u)*.9;g.lineWidth=2.6-.2*Math.abs(i-(sk?4:2));g.beginPath();g.moveTo(ex+30+u*60,cy+yy);g.lineTo(ex+30+u*60+90*(1-u*.5),cy+yy*(1+u));g.stroke()}g.globalAlpha=(1-u);glowAt(ex+20,cy,50*(1-u*.5)*(.8+.4*I),col,.9);g.restore()}
 g.restore()}
if(AS){const dgR=WXI.dagR[tr],dgL=WXI.dagL[tr],fl=0,L=36,hb=pb?[-w/2+pb[0]*k,-HH+pb[1]*k]:[hxA-18,hyA+8],dd=(im,x,y,rot)=>{if(!im||!im.naturalWidth)return;const ww=im.naturalWidth/im.naturalHeight*L,oy=-L*(fl?.2:.8);g.save();g.translate(x,y);g.rotate(rot+(fl?Math.PI:0));WD(im,-ww/2,oy,ww,L,tr,'#ff9ab0');g.restore()};dd(dgL,hb[0],hb[1],.1+wA*.7);dd(dgR,hxA,hyA,wA);if(aa&&at>rl*.42&&at<rl+.14){const u=sg(at,rl*.42,rl+.14);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=16;g.globalAlpha=(1-u)*.9;g.lineCap='round';g.lineWidth=8;g.beginPath();g.arc(hxA-30,hyA+8,80,-2.2,-2.2+u*3.5);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.arc(hxA-30,hyA+8,80,-2.0,-2.2+u*3.5);g.stroke();g.restore()}}
g.restore();heroSpark();g.restore()}
function heroSpark(){const n=EQ.reduce((a,i)=>a+(i&&i.r>=4?2:i&&i.c?1:0),0);if(!n)return;const my=EQ.some(q=>q&&q.r>=4);for(let i=0;i<Math.min(n*2,16);i++){const tw=(Math.sin(fr*.12+i*1.9)+1)/2,x=Math.sin(fr*.026+i*3.1)*44,y=-14-((fr*.5+i*37)%140),r=1.5+tw*4.5,gd=my&&i%2==0;g.save();g.translate(x,y);g.globalAlpha=tw*.9;g.fillStyle=gd?'#ffe08a':'#9ff';g.shadowColor=gd?'#ffa733':'#4ff';g.shadowBlur=8;g.beginPath();g.moveTo(0,-r*2);g.lineTo(r*.5,-r*.5);g.lineTo(r*2,0);g.lineTo(r*.5,r*.5);g.lineTo(0,r*2);g.lineTo(-r*.5,r*.5);g.lineTo(-r*2,0);g.lineTo(-r*.5,-r*.5);g.closePath();g.fill();g.restore()}}
