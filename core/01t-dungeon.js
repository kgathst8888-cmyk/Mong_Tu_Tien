/* core/01t-dungeon.js — Hầm ngục (dg*)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
/*==== HẦM NGỤC + CÁNH ====*/
const DGI={};{const S={boss:ASSET_PAYLOAD("p001"),impA:ASSET_PAYLOAD("p002"),impB:ASSET_PAYLOAD("p003")};for(const k in S){const i=new Image();i.src='data:image/webp;base64,'+S[k];DGI[k]=i}}
let dg=null,dgU=-1,wfr=0,wf2=0,wf3=0,dgFl=0;
try{const d=JSON.parse(localStorage.getItem('kthm_dg'));if(d){dgU=d.u;wfr=d.w|0;wf2=d.w2|0;wf3=d.w3|0}}catch(e){}
const dgSave=()=>{try{localStorage.setItem('kthm_dg',JSON.stringify({u:dgU,w:wfr,w2:wf2,w3:wf3}))}catch(e){}},SLOT=3e5,dgSlot=()=>Math.floor(Date.now()/SLOT),dgOpen=()=>dgSlot()!==dgU,
WGR=.1,BOSSMY=.3,dgM=()=>Math.min(4,Math.floor((P.lv-1)/20)),
wl=()=>PS[cur].tier>=2?(PS[cur].wg|0):0,WB=k=>wl()*({dmgp:8,hpp:8,dodge:4}[k]||0);
const dgh=document.getElementById('dgh'),dgb=document.getElementById('dgb');
function dgBtn(){const o=dgOpen(),q=Math.ceil((SLOT-Date.now()%SLOT)/1e3);dgb.className='sb'+(o&&!dg?' dgo':'');dgb.innerHTML=dg?'🚪<small>Thoát</small>':'🕳<small>'+(o?'Phụ bản':Math.floor(q/60)+':'+String(q%60).padStart(2,'0'))+'</small>'}
function dgHud(){if(!dg){if(dgh.innerHTML)dgh.innerHTML='';return}const b=E.find(e=>e.k=='boss');dgh.innerHTML='<div class="dgt">🕳 Hầm Ngục · Lv'+P.lv+' · '+(dg.bs?'👹 Trùm Thần Thoại':'Quái '+Math.min(20,dg.kill)+'/20')+'</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}
function dgEnter(){bo=0;bag.style.display='none';vil=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:0,kill:0};dgU=dgSlot();dgSave();DT.push({x:P.x,y:200,s:'🕳 Vào Hầm Ngục: 20 quái + Trùm!',c:'#ff9a70',g:1,l:130})}
function dgExit(){dg=null;E=[];PETS=[];PJ=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;P.x=120;dgHud()}
function gcf(msg,yes){if(document.getElementById('gcf'))return;const o=document.createElement('div');o.id='gcf';o.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center';const bx=document.createElement('div');bx.style.cssText='background:linear-gradient(#3a2618,#150d09);border:2px solid #b8964e;border-radius:14px;padding:16px 18px;max-width:82vw;color:#f2e3b3;text-align:center;font-size:15px;line-height:1.5;box-shadow:0 8px 30px #000';const t=document.createElement('div');t.style.cssText='white-space:pre-line;margin-bottom:14px';t.textContent=msg;bx.appendChild(t);const mk=(n,f)=>{const b=document.createElement('button');b.textContent=n;b.style.cssText='margin:0 6px;padding:9px 20px;font-size:15px;border-radius:9px;border:1px solid #b8964e;background:#5a3a22;color:#fff;cursor:pointer';b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();o.remove();if(f)f()};return b};bx.appendChild(mk('Rời đi',yes));bx.appendChild(mk('Ở lại',null));o.appendChild(bx);['pointerdown','pointerup','click','touchstart','touchend'].forEach(ev=>o.addEventListener(ev,e=>e.stopPropagation()));document.body.appendChild(o)}
dgb.onpointerdown=e=>{e.stopPropagation();if(!started)return;if(dg){if(dg.mt)gcf('Rời trận Ma Thần?\nBạn sẽ về Làng, có thể khiêu chiến lại bất cứ lúc nào.',mtExit);else gcf('Rời Hầm Ngục? Lượt này sẽ mất.',dgExit);return}if(!dgOpen()){DT.push({x:P.x,y:190,s:'Hầm Ngục chưa mở, chờ đếm ngược',c:'#ccc',l:70});return}dgEnter()};
function dgSp(k){const bs=k=='boss',L=P.lv+(bs?5:Math.floor(R()*3)-1),m=dgM(),base=3*(60+L*25)*(1+m*.5),side=R()<.5?-1:1,x=bs?vw()+150:(P.x>vw()*.55?-60:vw()+60)+side*R()*50;
E.push({dg:1,k,sp:bs?'boss':R()<.5?'impA':'impB',x,y:k=='fly'?140+R()*70:0,vx:0,vy:0,hp:base*(bs?60:k=='run'?.9:1.1),max:base*(bs?60:k=='run'?.9:1.1),df:(8+L*2.2)*(1+m*.4)*(bs?2.6:1),b:bs?4:0,m,lv:L,cd:bs?70:30+R()*50,sl:0,fl:0,in:bs?70:0,hh:bs?200:90,rg:bs?190:60,sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:0});
for(let j=0;j<10;j++)PT.push({x,y:30,vx:(R()-.5)*3,vy:-R()*3,l:30,c:'#ff6a40'})}
function dgHurt(e,mu){const q=Math.max(1,Math.round(.65*(8+e.lv*3)*(1+e.m*.35)*mu-P.lv-Math.floor((sm('d')+alD())*ZC.pd()*HL.df()/5)));if(R()<Math.min(.4,SX('dodge')/100)+ZC.dg()){DT.push({x:P.x,y:100,s:'Né',c:'#7fe0ff',l:40});return}const q2=Math.max(1,Math.round(q*(1-Math.min(.5,SX('dred')/100))*ZC.shd()));P.hp-=q2;DT.push({x:P.x,y:100,s:q2,r:1,l:45});dgFl=7}
function dgRing(e,sm_){FX.push({x:e.x,l:24,m:24,fn:(f,p,X,gy)=>{g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);g.strokeStyle='#ff8a40';g.shadowColor='#ff5020';g.shadowBlur=18;g.lineWidth=14*(1-p)+2;g.globalAlpha=1-p;g.beginPath();g.arc(0,0,40+p*(sm_?190:250),0,6.283);g.stroke();g.restore()}});for(let i=0;i<14;i++)PT.push({x:e.x+(R()-.5)*120,y:6,vx:(R()-.5)*6,vy:-R()*4,l:30,c:'#b08a60'});dgFl=6}
function dgAxe(e,dr){FX.push({x:e.x+dr*30,l:18,m:18,fn:(f,p,X,gy)=>{g.save();g.translate(X,gy-80*s);g.scale(s*dr,s);g.rotate(-.7+p*1.3);g.lineCap='round';g.shadowColor='#ff5020';g.shadowBlur=24;g.globalAlpha=1-p*.8;g.strokeStyle='#ffb060';g.lineWidth=28*(1-p);g.beginPath();g.arc(0,0,125,-1.1,1.1);g.stroke();g.strokeStyle='#fff';g.lineWidth=7*(1-p);g.stroke();g.restore()}});dgRing(e,1)}
function dgBoss(e,d,ad,dr){const en=e.hp<e.max*.5,sp=(en?2.1:1.5)*(e.sl>0?.6:1);
if(e.in>0){e.in--;e.x-=2.4;e.mv=1;return}
if(e.st==0){if(ad>105){e.x+=dr*sp;e.mv=1}if(e.cd<=0&&ad<200){if(R()<.35){e.st=3;e.tm=44;e.tx=P.x;e.x0=e.x}else{e.st=1;e.tm=26}}}
else if(e.st==1){e.tm--;if(e.tm<=0){e.st=2;e.tm=9;e.hit=0}}
else if(e.st==2){e.tm--;if(!e.hit&&e.tm<=4){e.hit=1;e.x+=dr*22;if(Math.abs(P.x-e.x)<200)dgHurt(e,1);dgAxe(e,dr)}if(e.tm<=0){e.st=4;e.tm=22}}
else if(e.st==3){e.tm--;const u=1-e.tm/44;e.x=e.x0+(e.tx-e.x0)*u;e.y=Math.sin(u*Math.PI)*170;if(e.tm<=0){e.y=0;if(Math.abs(P.x-e.x)<220)dgHurt(e,1.3);dgRing(e);e.st=4;e.tm=26}}
else{e.tm--;if(e.tm<=0){e.st=0;e.cd=en?55:90}}
e.x=cl(e.x,30,vw()+160)}
function dgAI(e){e.sl--;e.fl--;e.cd--;e.ph+=.3;const d=P.x-e.x,ad=Math.abs(d),dr=Math.sign(d)||1,sl=e.sl>0?.45:1;e.mv=0;if(e.k=='boss')return dgBoss(e,d,ad,dr);
if(e.k=='fly'){
if(e.st==0){const tx=P.x+(e.o<.5?-1:1)*(90+e.o*160),ty=90+e.o*70+Math.sin(e.ph*.5)*14;e.vx+=(cl((tx-e.x)*.05,-3.2,3.2)*sl-e.vx)*.1;e.vy+=(cl((ty-e.y)*.06,-2.5,2.5)-e.vy)*.1;if(e.cd<=0&&ad<320){e.st=1;e.tm=16}}
else if(e.st==1){e.vx*=.8;e.vy+=(2.2-e.vy)*.2;if(--e.tm<=0){e.st=2;e.tm=45}}
else if(e.st==2){const dx=P.x-e.x,dy=34-e.y,dd=Math.hypot(dx,dy)||1;e.vx=dx/dd*9*sl;e.vy=dy/dd*9*sl;e.tm--;if(dd<32){dgHurt(e,1.1);e.st=3;e.tm=26;e.cd=95+R()*60;e.vx=-dr*5;e.vy=6}else if(e.tm<=0){e.st=3;e.tm=26;e.cd=60}}
else{e.vx*=.94;e.vy+=(3-e.vy)*.08;if(--e.tm<=0)e.st=0}
e.x+=e.vx;e.y=Math.max(10,e.y+e.vy);e.mv=1}
else{
if(e.st==0){e.y=0;if(ad>46){e.vx+=(dr*3.6*sl-e.vx)*.12}else e.vx*=.7;e.mv=1;if(e.cd<=0&&ad<150){e.st=1;e.tm=10}}
else if(e.st==1){e.vx*=.7;if(--e.tm<=0){e.st=2;e.vy=8.5;e.vx=dr*Math.min(7,ad*.1+3)}}
else{e.vy-=.55;e.y+=e.vy;if(e.y<=0){e.y=0;e.vy=0;e.vx*=.3;if(Math.abs(P.x-e.x)<60)dgHurt(e,1.1);e.st=0;e.cd=80+R()*50}}
e.x+=e.vx}
e.x=cl(e.x,-90,vw()+90);e.hh=e.y+70}
function dgTick(){if(!dg||over||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;const a=E.filter(e=>e.dg&&e.k!='boss').length;
if(dg.n<20){if(dg.t>60&&a<8&&dg.t%38==0){const q=dg.n%10;dgSp(q==2||q==5||q==8?'run':'fly');dg.n++}}
else if(!dg.bs&&!a){dg.bs=1;dgSp('boss');DT.push({x:P.x,y:210,s:'👹 Trùm Thần Thoại xuất hiện!',c:'#ff8a50',g:1,l:150})}
else if(dg.bs&&!E.some(e=>e.k=='boss')&&!dg.done){dg.done=1;dg.out=260;QE('dg');DT.push({x:P.x,y:200,s:'🏆 Hoàn thành Hầm Ngục!',c:'#ffe08a',g:1,l:200})}
if(dg.done&&--dg.out<=0)dgExit()}
const _drop=drop;drop=function(e){if(!e.dg)return _drop(e);const L=e.lv;if(e.k!='boss'){dg.kill++;gold+=gP(6*L);if(R()<.3*EQD.mob)give(gen(L,rr(0)),e.x,90);if(R()<.01*EQD.rare)give(gen(L,4),e.x,150);return}
gold+=gP(400*L);const f=FB(8+Math.floor(R()*6));frag+=f;DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:120});
for(let i=0;i<3;i++){const x=R();if(R()>=EQD.boss)continue;give(gen(L,x<.15?3:x<.6?2:1),e.x+(i-1)*40,150+i*34)}
if(R()<BOSSMY*EQD.rare){DT.push({x:e.x,y:260,s:'✨ Trang bị Thần Thoại!',c:RC[4],l:150,g:1});give(gen(L,4),e.x,230)}
{const wv=wl(),nl=Math.min(2,wv);if(wv<3&&R()<WGD[nl]){WFA(nl,1);dgSave();DT.push({x:e.x,y:300,s:'🪽 +1 Mảnh Cánh Cấp '+(nl+1),c:['#fff3c0','#8fdcff','#ffc070'][nl],l:170,g:1})}}}
const _fire=fire;fire=function(i){const n0=PJ.length;SKF=1;try{_fire(i)}finally{SKF=0}for(let j=n0;j<PJ.length;j++)PJ[j].sk=1};
const _foe=foe;foe=function(e){e.dg?dgFoe(e):_foe(e)};
const _stp=step;step=function(){if(started&&fr%30==0)dgBtn();if(fr%6==0)dgHud();dgTick();_stp()};
const _init=init;init=function(){dg=null;_init()};
const _bgd=bgd;bgd=function(gy){if(dg){xbg(gy,3);g.save();g.fillStyle='rgba(50,0,0,.3)';g.fillRect(0,0,W,H);g.restore()}else _bgd(gy)};
const _draw=draw;draw=function(){_draw();if(dgFl>0){g.save();g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='rgba(255,40,20,'+dgFl*.03+')';g.fillRect(0,0,W,H);g.restore();dgFl--}};
function dgFoe(e){const im=DGI[e.sp];if(!im||!im.naturalWidth)return;const bs=e.k=='boss',HH=bs?(e.mt?300:e.big||230):96,w=im.naturalWidth/im.naturalHeight*HH,dir=Math.sign(P.x-e.x)||1,X=(e.x-cam)*s;
g.save();g.globalAlpha=1;g.fillStyle='rgba(0,0,0,'+(.35-Math.min(.25,e.y/500)).toFixed(2)+')';g.beginPath();g.ellipse(X,GY+2,w*SZ*s*.32*(1-Math.min(.5,e.y/400)),6*s,0,0,6.28);g.fill();
let rot=0,sx=1,sy=1,ox=0,oy=0;
if(bs){const st=e.st;if(e.mv&&st==0){oy=-Math.abs(Math.sin(e.ph))*6;sy=1+.025*Math.sin(e.ph*2);rot=-.03*Math.sin(e.ph)}else sy=1+.012*Math.sin(fr*.08);
if(st==1){const u=1-e.tm/26,q=1-(1-u)*(1-u);rot=.32*q;sy=1+.04*q;ox=10*q}
else if(st==2){const u=1-e.tm/9;rot=.32-.78*u*u;ox=10-38*u;sy=1-.04*u}
else if(st==4){const u=e.tm/22;rot=-.46*u;ox=-28*u;sy=1-.03*u}
else if(st==3){const u=1-e.tm/44;sy=u<.1?.88:1+.1*Math.sin(u*Math.PI);rot=-.14*Math.sin(u*Math.PI)}
if(e.in>0)g.globalAlpha=cl(1-e.in/80,.15,1)}
else if(e.k=='fly'){const f=Math.sin(e.ph*1.7);sx=1+.11*f;sy=1-.05*f;rot=cl(e.vx*.05,-.45,.45);oy=Math.sin(e.ph*1.2)*3;if(e.st==2)rot=cl(e.vx*.07,-.7,.7)}
else{const f=Math.abs(Math.sin(e.ph));rot=dir*.16;if(e.st==0){oy=-f*7;sy=1+.04*Math.cos(e.ph*2)}else if(e.st==1){sy=.85;sx=1.1}else{rot=dir*(.5-e.vy*.05);sy=1.12}}
g.translate(X+ox*s*SZ,GY-e.y*s+oy*s);g.scale(s*SZ,s*SZ);g.scale(bs?-dir:1,1);g.rotate(rot*(bs?1:1));g.scale(sx,sy);
if(bs){g.shadowColor=e.gc?e.gc[e.st==1||e.st==2?1:0]:(e.st==1||e.st==2?'#ff7030':'#a01810');g.shadowBlur=18+(e.st==1?14:0)}
g.drawImage(im,-w/2,-HH,w,HH);if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(im,-w/2,-HH,w,HH)}
g.restore();
const y=GY-(e.y+HH*SZ+10)*s,bw=(bs?110:46)*s;g.save();g.font='bold '+(bs?14:11)*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';const nm=(bs?(e.nm||'👹 Ma Vương Huyết Phủ (Thần Thoại)'):e.k=='fly'?'Tiểu Quỷ Dơi':'Tiểu Quỷ Chạy')+' Lv'+e.lv;g.strokeText(nm,X,y-6*s);g.fillStyle=bs?'#ffb070':'#fff';g.fillText(nm,X,y-6*s);g.fillStyle='#000a';g.fillRect(X-bw/2,y,bw,5*s);g.fillStyle=bs?'#e03030':'#e8c040';g.fillRect(X-bw/2,y,bw*cl(e.hp/e.max,0,1),5*s);g.restore()}
