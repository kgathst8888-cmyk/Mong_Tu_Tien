/* combat/18-enemies.js */

(function(){
const U={tree:{d:ASSET_PAYLOAD("p007"),w:84,ay:0.84},golem:{d:ASSET_PAYLOAD("p008"),w:100,ay:0.76},wolf:{d:ASSET_PAYLOAD("p009"),w:92,ay:0.8}},SUMI={};for(const k in U){const i=new Image();i.src='data:image/webp;base64,'+U[k].d;SUMI[k]=i}
const CFG={wolf:{sp:3.6,rg:70,cd:46,col:'#9fe0ff',sd:420,sr:440},golem:{sp:1.5,rg:80,cd:90,col:'#ffd070',sd:520,sr:270},tree:{sp:1.1,rg:0,cd:80,col:'#7fe85a',sd:560,sr:300}};
const sgn=v=>v<0?-1:1;let uid=0;
window.SUMA=function(k,m){let p=PETS.find(q=>q.k==k);const L=k=='tree'?1500:1200;
 if(p){p.l=L;p.m=Math.max(p.m,m)}else{if(PETS.length>=3)PETS.shift();p={x:P.x-40,k,m,l:L,cd:30,sk:k=='golem'?150:k=='tree'?100:80,t:0,st:'idle',face:P.d||1,y:0,vx:0,tm:0,dur:1,id:++uid};PETS.push(p)}
 if(window.PFX)PFX.spawn(k,p.x);return p};
window.SUMC=function(k){SUMA(k[6],k[5]);if(k[6]=='tree'){const q=Math.round(mx()*.2);P.hp=Math.min(mx(),P.hp+q);DT.push({x:P.x,y:120,s:'+'+q,g:1,l:55})}DT.push({x:P.x,y:140,s:'Triệu hồi '+k[0],g:1,l:60})};
const act=p=>E.filter(q=>q.in<=0&&q.hp>0);
function begin(p,st,dur,e){p.st=st;p.tm=0;p.dur=dur;p.tgt=e;if(e)p.face=sgn(e.x-p.x)}
function run(p,C){p.tm++;const u=p.tm/p.dur,e=p.tgt,k=p.k;
 if(p.st=='atk'){
  if(k=='wolf'){p.x+=p.face*(u<.5?3.4:-.9);if(p.tm==9&&e&&e.hp>0){dm(e,p.m*.55);PFX.bite(e.x)}}
  else if(k=='golem'){if(p.tm==22){const X=p.x+p.face*70;E.forEach(q=>{if(q.in<=0&&q.hp>0&&Math.abs(q.x-X)<125)dm(q,p.m*.5)});PFX.slam(X,130,0)}}
  else if(p.tm==14&&e&&e.hp>0){dm(e,p.m*.5);PFX.vine(e.x)}
 }else{
  if(k=='wolf'){if(p.tm==1){p.x0=p.x;p.x1=cl((e?e.x:p.x)+p.face*110,20,vw()-20);PFX.dash(p.x0,p.x1)}
   if(p.tm<=14){const v=p.tm/14;p.x=p.x0+(p.x1-p.x0)*(v*v*(3-2*v))}
   if(p.tm==7)E.forEach(q=>{if(q.in<=0&&q.hp>0&&q.x>=Math.min(p.x0,p.x1)-40&&q.x<=Math.max(p.x0,p.x1)+40){dm(q,p.m*1.5,1);PFX.bite(q.x)}})}
  else if(k=='golem'){p.y=p.tm<=20?Math.sin(p.tm/20*Math.PI)*70:0;if(p.tm==20){const X=p.x+p.face*40;E.forEach(q=>{if(q.in<=0&&q.hp>0&&Math.abs(q.x-X)<230)dm(q,p.m*1.0,1)});PFX.slam(X,230,1)}}
  else{if(p.tm==10){const h=Math.round(mx()*.07);P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:130,s:'+'+h,g:1,l:55});PFX.bloom(p.x);E.forEach(q=>{if(q.in<=0&&q.hp>0&&Math.abs(q.x-p.x)<260){dm(q,p.m*.6,1);PFX.vine(q.x)}})}}
 }
 if(p.tm>=p.dur){p.st='idle';p.tm=0;p.y=0}}
window.pstep=function(){epstep();PETS=PETS.filter(p=>--p.l>0);
 PETS.forEach((p,i)=>{const C=CFG[p.k];
  if(!C){let e=null;E.forEach(q=>{if(q.in<=0&&Math.abs(q.x-p.x)<300&&(!e||Math.abs(q.x-p.x)<Math.abs(e.x-p.x)))e=q});const tx=e?e.x-(p.x<e.x?55:-55):P.x-60-i*38;p.x+=(tx-p.x)*.06;p.cd--;if(e&&p.cd<=0&&Math.abs(e.x-p.x)<(p.k=='hawk'?260:110)){p.cd=75;dm(e,p.m*.7);FX.push({t:'sl',x:e.x,br:0,c:'#fff',l:10,m:10})}return}
  p.t++;p.cd--;p.sk--;
  if(p.st=='atk'||p.st=='skl'){run(p,C);p.x=cl(p.x,10,vw()-10);return}
  let e=null;act().forEach(q=>{const d=Math.abs(q.x-p.x);if(d<(p.k=='tree'?340:520)&&(!e||d<Math.abs(e.x-p.x)))e=q});
  let tx=P.x-(p.k=='tree'?78:60)*(P.d||1)-i*30*(P.d||1),sp=C.sp*.8;
  if(p.k=='tree'){
   if(p.sk<=0&&(e||P.hp<mx()*.88)){p.sk=C.sd;begin(p,'skl',44,e);return}
   if(e&&p.cd<=0&&Math.abs(e.x-p.x)<C.sr-40){p.cd=C.cd;begin(p,'atk',30,e);return}
  }else if(e){const d=Math.abs(e.x-p.x);
   if(p.sk<=0&&d<C.sr){p.sk=C.sd;begin(p,'skl',p.k=='wolf'?24:44,e);return}
   if(d<=C.rg+12&&p.cd<=0){p.cd=C.cd;begin(p,'atk',p.k=='wolf'?20:36,e);return}
   tx=e.x-sgn(e.x-p.x)*C.rg*.8;sp=C.sp}
  const want=cl((tx-p.x)*.08,-sp,sp);p.vx+=(want-p.vx)*.25;p.x=cl(p.x+p.vx,10,vw()-10);
  if(Math.abs(p.vx)>.35)p.face=sgn(p.vx);else if(e)p.face=sgn(e.x-p.x);else p.face=P.d||p.face})};
window.pets=function(){drawEP();PETS.forEach(p=>{const im=SUMI[p.k],U0=U[p.k],C=CFG[p.k];
  if(!U0||!C||!im.complete||!im.naturalWidth){const j=p.k=='hawk'?42+Math.sin(fr*.1)*8:Math.abs(Math.sin(fr*.2))*6;g.save();g.translate((p.x-cam)*s,GY-j*s);g.scale(s,s);g.font=(p.k=='hawk'?30:34)+'px Ma Shan Zheng,KTH Serif,serif';g.textAlign='center';g.globalAlpha=cl(p.l/30,0,1);g.fillText({wolf:'🐺',golem:'🗿',hawk:'🦅',tree:'🌳'}[p.k]||'🐾',0,-4);g.restore();return}
  const W0=U0.w,h=im.naturalHeight/im.naturalWidth*W0,t=p.t,PI=Math.PI,fa=p.st!='idle'?p.tm/p.dur:0,F=p.face<0?-1:1;
  const mv=Math.abs(p.vx)>.5&&p.st=='idle';let bob=0,rot=0,sx=1,sy=1;
  const sc=Math.min(1,.3+t/12)+Math.sin(Math.min(1,t/16)*PI)*.12,al=cl(p.l/30,0,1)*Math.min(1,t/6);
  if(p.k=='wolf'){if(mv){const q=Math.sin(t*.45);bob=Math.abs(q)*8;rot=F*.05*q;sx=1+.05*Math.sin(t*.9);sy=1-.05*Math.sin(t*.9)}else if(p.st=='idle'){bob=Math.sin(t*.08)*1.5;sy=1+Math.sin(t*.08)*.015}
   else if(p.st=='atk'){rot=F*.3*Math.sin(fa*PI);sx=1+.12*Math.sin(fa*PI)}else{sx=1.22;sy=.86}}
  else if(p.k=='golem'){if(mv){bob=Math.abs(Math.sin(t*.22))*4;rot=Math.sin(t*.22)*.05}else if(p.st=='idle'){sy=1+Math.sin(t*.07)*.02}
   else if(p.st=='atk'){if(fa<.6){rot=-F*.16*(fa/.6);sy=1+.07*(fa/.6)}else{rot=F*.14*(1-(fa-.6)/.4);sy=.9+.1*((fa-.6)/.4)}}
   else{sy=p.tm<=20?1+.1*Math.sin(p.tm/20*PI):.88+.12*Math.min(1,(p.tm-20)/24);sx=2-sy}}
  else{if(mv)bob=Math.abs(Math.sin(t*.2))*3;rot=Math.sin(t*.05)*.03;sy=1+Math.sin(t*.06)*.015;if(p.st!='idle'){rot=Math.sin(t*.4)*.06;sy=1+.09*Math.sin(fa*PI);sx=1+.04*Math.sin(fa*PI)}}
  g.save();g.translate((p.x-cam)*s,GY-(p.y+bob)*s);g.scale(s,s);
  if(p.st=='skl'||(p.k=='tree'&&p.st=='atk')){g.save();g.globalCompositeOperation='lighter';const r=72,gr=g.createRadialGradient(0,-34,6,0,-34,r);gr.addColorStop(0,C.col+'bb');gr.addColorStop(1,C.col+'00');g.fillStyle=gr;g.globalAlpha=.85*Math.sin(Math.min(1,fa)*PI);g.beginPath();g.arc(0,-34,r,0,PI*2);g.fill();g.restore()}
  g.globalAlpha=al;g.rotate(rot);g.scale(F*sx*sc,sy*sc);g.drawImage(im,-W0/2,-U0.ay*h,W0,h);g.restore()})};
})();

