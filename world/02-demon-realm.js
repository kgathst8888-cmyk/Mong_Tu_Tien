
/*==== MA THẦN + LINH GIỚI ====*/
// Chỉnh độ khó Ma Thần tại đây (so với Boss Thế Giới Lv100):
const MT_LV=100,MT_HP=10,MT_ATK=10,MT_DEF=3;
const lgReq=()=>{const p=PS[cur],c=p.cv||{r:-1,s:0};return p.tier>=3&&(c.r>=5||(c.r==4&&c.s>=9))};
const lgDone=()=>(PS[cur].lg|0)>=1;
function mtStats(){const L=MT_LV,hm=MS.pal.hm;return{hp:3*(60+L*25)*(1+7*.5)*hm*40*MT_HP,df:(8+L*2.2)*(1+7*.4)*2.5*MT_DEF}}
function mtSpawn(){dgSp('boss');const e=E[E.length-1],st=mtStats();e.mt=1;e.lv=MT_LV;e.m=7;e.hp=e.max=st.hp;e.df=st.df;DT.push({x:P.x,y:220,s:'👹 MA THẦN giáng thế!',c:'#d070ff',g:1,l:170})}
function mtEnter(){if(!started||!lgReq()||lgDone())return;if(bo)tg();vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:20,kill:20,mt:1};DT.push({x:P.x,y:200,s:'👹 Khiêu chiến Ma Thần!',c:'#d070ff',g:1,l:130})}
function mtAsk(){if(!vil){msg='Hãy về 🏘 Làng để khiêu chiến Ma Thần';ui();return}gcf('Khiêu chiến MA THẦN (Lv'+MT_LV+', mạnh gấp '+MT_HP+' lần Boss Thế Giới)?\nThất bại sẽ phải hồi sinh, có thể thử lại bất cứ lúc nào.',mtEnter)}
function mtExit(){dg=null;E=[];PETS=[];PJ=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;P.atk=0;P.x=cl(P.x,40,vw()-40);P.hp=mx();P.mp=mm();vil=1;vt=null;vgo=-1;dgHud()}
function lgEnter(){if(!started||!lgDone())return;lg=1;mapSel=4;vil=0;E=[];PETS=[];PJ=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;P.atk=0;P.x=120;lm=mi();DT.push({x:P.x,y:190,s:'🌀 Đến Linh Giới',c:'#8fe8ff',g:1,l:130});if(bo)tg();sv()}
function lgUI(){const p=PS[cur];if(lgDone())return'<div class="st" style="margin:4px 0"><button style="width:100%;text-align:left;'+(lg?'background:#8a6420':'')+'" onclick="lgEnter()">🌀 Linh Giới · quái Lv80-100 mạnh hơn · tu vi ×'+LGX+' · đột phá Luyện Hư → Hợp Thể → Đại Thừa'+(lg?' (đang ở đây)':'')+'</button></div>';
 if(lgReq())return'<div class="dt">👹 <b>Ma Thần</b> đang phong ấn trên không của Thanh Vân Tiên Thôn.<br>'+(vil?'<button onclick="mtAsk()">⚔️ Khiêu chiến Ma Thần</button>':'Về 🏘 Làng rồi chạm vào Phong Ấn để khiêu chiến.')+'</div>';
 return'<div class="st" style="opacity:.6">🔒 Linh Giới: cần Hoá Thần tầng 9 + chuyển chức 3, sau đó hạ Ma Thần ở Làng.</div>'}

// Cổng / Phong ấn trong làng
const gateX=()=>vw()*(PORT?.705:.69),gateY=()=>GY-(PORT?330:300)*s;
function gateDraw(){const ready=lgReq(),done=lgDone(),x=gateX()*s,y=gateY(),t=fr,r=54*s,st=done?2:ready?1:0;
 const C=[{ed:'#8a78b0',rgb:'130,110,180',core:['#1a1030','#2e2250','#0e0818']},{ed:'#ff6ad0',rgb:'255,80,200',core:['#fff2fb','#d02aa8','#2a0630']},{ed:'#7af0ff',rgb:'120,240,255',core:['#e8ffff','#3ab8e8','#0a3a6a']}][st],pu=.5+.5*Math.sin(t*.08),rx=r*.62;
 g.save();g.globalCompositeOperation='lighter';
 let q=g.createRadialGradient(x,y,r*.2,x,y,r*(st==1?2.6:2.1));q.addColorStop(0,'rgba('+C.rgb+','+(st==0?.28:st==1?.35+.2*pu:.5)+')');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r*(st==1?2.6:2.1),0,6.283);g.fill();
 if(st==1){
  const bw=(.5+.5*pu)*r*.5+r*.18;q=g.createLinearGradient(0,y-r*3.4,0,y+r*3.4);q.addColorStop(0,'rgba(255,200,120,0)');q.addColorStop(.5,'rgba(255,120,220,.55)');q.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=q;g.fillRect(x-bw,y-r*3.4,bw*2,r*6.8);
  for(let k=0;k<3;k++){const p=((t*.011)+k/3)%1;g.strokeStyle='rgba(255,170,230,'+(.6*(1-p))+')';g.lineWidth=(3-p*2)*s;g.beginPath();g.ellipse(x,y,rx*(1+p*1.9),r*(1+p*1.9),0,0,6.283);g.stroke()}}
 g.restore();
 g.save();g.translate(x,y);
 if(st==0){g.save();g.strokeStyle='rgba(150,130,200,.45)';g.lineWidth=2*s;g.setLineDash([7*s,9*s]);g.lineDashOffset=-t*.15;g.beginPath();g.ellipse(0,0,rx*1.28,r*1.28,0,0,6.283);g.stroke();g.restore()}
 g.beginPath();g.ellipse(0,0,rx,r,0,0,6.283);q=g.createRadialGradient(0,0,2,0,0,r);q.addColorStop(0,C.core[0]);q.addColorStop(.6,C.core[1]);q.addColorStop(1,C.core[2]);g.fillStyle=q;g.fill();
 g.lineWidth=(st==1?5:4)*s;g.strokeStyle=C.ed;g.shadowColor=C.ed;g.shadowBlur=st==0?6:st==1?10+12*pu:14;g.stroke();g.shadowBlur=0;
 g.strokeStyle='rgba(255,255,255,'+(st==0?.28:.55)+')';g.lineWidth=1.6*s;const n=st==1?5:3,sp=st==1?.09:.04;for(let j=0;j<n;j++){g.beginPath();g.ellipse(0,0,r*(.15+j*(st==1?.11:.15))*.62/.62,r*(.25+j*(st==1?.16:.25)),t*sp*(j%2?1:-1)+j,0,4.2);g.stroke()}
 if(st==1){
  g.save();g.globalCompositeOperation='lighter';
  for(let k=0;k<12;k++){const a=k/12*6.283+t*.022,ex=Math.cos(a)*rx*1.38,ey=Math.sin(a)*r*1.38,ex2=Math.cos(a)*rx*1.52,ey2=Math.sin(a)*r*1.52,al=.5+.5*Math.sin(t*.1+k);g.strokeStyle='rgba(255,208,112,'+(.35+.6*al)+')';g.lineWidth=2.2*s;g.beginPath();g.moveTo(ex,ey);g.lineTo(ex2,ey2);g.stroke();g.beginPath();g.moveTo((ex+ex2)/2-Math.sin(a)*3*s,(ey+ey2)/2+Math.cos(a)*3*s);g.lineTo((ex+ex2)/2+Math.sin(a)*3*s,(ey+ey2)/2-Math.cos(a)*3*s);g.stroke()}
  for(let k=0;k<3;k++){const a=t*.045+k*2.094,ox=Math.cos(a)*rx*1.6,oy=Math.sin(a)*r*1.6;q=g.createRadialGradient(ox,oy,1,ox,oy,10*s);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(.4,'rgba(255,170,240,.8)');q.addColorStop(1,'rgba(255,60,200,0)');g.fillStyle=q;g.beginPath();g.arc(ox,oy,10*s,0,6.283);g.fill()}
  for(let k=0;k<18;k++){const p=((t*.012)+k*.0556)%1,a=k*2.4+p*5,rr=(1-p)*r*1.9;g.fillStyle='rgba(255,'+(170+k*3)+',235,'+(.8*Math.sin(p*3.14))+')';g.beginPath();g.arc(Math.cos(a)*rr*.62,Math.sin(a)*rr,(1.2+(k%3)*.5)*s,0,6.283);g.fill()}
  g.restore()}
 g.restore();
 g.save();g.font='bold '+Math.max(12,15*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';const a=done?'🌀 Cổng Linh Giới':'👹 Cổng Ma Thần',b=done?'chạm để bước vào':ready?'chạm để khiêu chiến':'chưa đủ điều kiện',by=y+r+18*s+Math.sin(t*.1)*3;g.strokeText(a,x,y-r-14*s);g.fillStyle=ready||done?'#ffe9a0':'#cdbfe6';g.fillText(a,x,y-r-14*s);
 g.font=Math.max(10,12*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.strokeText(b,x,by);g.fillStyle=done?'#bff4ff':ready?'#ffc0ec':'#a898c4';g.fillText(b,x,by);g.restore()}
const _vdraw=vdraw;vdraw=function(){_vdraw();gateDraw()};
let gateGo=0;
c.addEventListener('pointerdown',e=>{gateGo=0;if(!vil||bo||!started)return;const x=e.offsetX/s,y=e.offsetY;if(Math.abs(x-gateX())<56&&Math.abs(y-gateY())<85*s){vt=cl(gateX(),40,vw()-40);vgo=-1;gateGo=1}});
function gateAct(){if(lgDone())lgEnter();else if(!lgReq()){DT.push({x:P.x,y:200,s:'🔒 Cần Hoá Thần tầng 9 + chuyển chức 3 để khiêu chiến Ma Thần',c:'#e0b0ff',g:1,l:170})}else mtAsk()}
const _vstep=vstep;vstep=function(){_vstep();if(gateGo){if(mvDir)gateGo=0;else if(vt==null){gateGo=0;if(Math.abs(P.x-cl(gateX(),40,vw()-40))<10)gateAct()}}};

// Trận Ma Thần
const _dgHurt=dgHurt;dgHurt=function(e,mu){_dgHurt(e,e&&e.mt?mu*MT_ATK*2:mu)};
const _dgAI=dgAI;dgAI=function(e){_dgAI(e);if(!e.mt||e.in>0)return;e.mc=(e.mc|0)+1;const en=e.hp<e.max*.5;
 if(e.mc>=(en?300:480)){e.mc=0;e.mw=60;e.mxp=P.x;DT.push({x:e.x,y:230,s:'👹 Ma Khí Bạo!',c:'#d070ff',g:1,l:70});
  FX.push({x:e.mxp,l:60,m:60,fn:(f,p,X,gy)=>{g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);g.fillStyle='rgba(180,60,255,'+(.1+.3*p)+')';g.strokeStyle='#d070ff';g.lineWidth=6;g.beginPath();g.arc(0,0,170,0,6.283);g.fill();g.stroke();g.restore()}})}
 if(e.mw>0&&--e.mw==0){const X0=e.mxp;FX.push({x:X0,l:24,m:24,fn:(f,p,X,gy)=>{g.save();g.globalCompositeOperation='lighter';const q=g.createLinearGradient(0,gy-400*s,0,gy);q.addColorStop(0,'rgba(190,80,255,0)');q.addColorStop(1,'rgba(220,140,255,'+(1-p)+')');g.fillStyle=q;g.fillRect(X-90*s*(1-p*.4),gy-400*s,180*s*(1-p*.4),400*s);g.restore()}});dgFl=6;if(Math.abs(P.x-X0)<170)dgHurt(e,1.1)}};
const _dgTick=dgTick;dgTick=function(){if(!dg||!dg.mt)return _dgTick();if(over||bo||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;mtSpawn()}
 else if(dg.bs&&!E.some(e=>e.k=='boss')&&!dg.done){dg.done=1;dg.out=300;PS[cur].lg=1;QE('mt');QE('boss');sv();DT.push({x:P.x,y:220,s:'🏆 Hạ Ma Thần! Cổng Linh Giới đã mở!',c:'#8fe8ff',g:1,l:220})}
 if(dg.done&&--dg.out<=0)mtExit()};
const _drop2=drop;drop=function(e){if(!e.mt)return _drop2(e);const L=MT_LV;gold+=gP(3000*L);const f=30+Math.floor(R()*10);frag+=f;DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:140});for(let i=0;i<3;i++)give(gen(L,4),e.x+(i-1)*40,150+i*34);try{ZC.gain(5000)}catch(x){}};
const _dgHud=dgHud;dgHud=function(){_dgHud();if(dg&&dg.mt){const b=E.find(e=>e.k=='boss');dgh.innerHTML='<div class="dgt">👹 MA THẦN · Lv'+MT_LV+' · ×'+MT_HP+'</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};
const _dgFoe=dgFoe;dgFoe=function(e){if(!e.mt)return _dgFoe(e);const X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=150*s;
 g.save();g.globalCompositeOperation='lighter';const q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,'rgba(190,80,255,.55)');q.addColorStop(.5,'rgba(110,30,200,.28)');q.addColorStop(1,'rgba(40,0,80,0)');g.globalAlpha=.8+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
 _dgFoe(e)};
const _bgd2=bgd;bgd=function(gy){if(dg&&dg.mt){xbg(gy,7);g.save();g.fillStyle='rgba(60,0,90,.35)';g.fillRect(0,0,W,H);g.restore()}else _bgd2(gy)};
const _stp2=step;step=function(){if(lg&&(PS[cur].lg|0)<1)lg=0;_stp2()};
