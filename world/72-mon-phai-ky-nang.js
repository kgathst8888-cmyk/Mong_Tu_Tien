/* ===== ⚔️ KỸ NĂNG MÔN PHÁI (world/72-mon-phai-ky-nang.js) — chạy sau world/71-van-phap-mon-phai.js =====
 * Sau khi chọn môn ở Vạn Pháp Tháp: kỹ năng 1 mở ngay; kỹ năng 2..6 mở theo cấp nhân vật (CF.unlock, đã mở thì giữ mãi).
 * Cấp kỹ năng 1..CF.lvMax(10) tăng theo SỐ LẦN DÙNG (bị động: số lần kích hoạt). Lên cấp L→L+1 cần CF.useBase×L lần. Mỗi cấp +CF.lvScale sát thương.
 * Dữ liệu lưu: PS[cur].vp = {id: môn đang chọn, u: {id môn: [6 số lần dùng]}, mx: cấp nhân vật cao nhất đã đạt}  (PS được lưu sẵn cùng save game).
 * Nút: cột #sp-bar (5 nút: kỹ năng 1-4 + tuyệt kỹ; bị động tự chạy) — nằm trong khung #sk-side (world/52). Tự dùng khi bật AUTO.
 * Sát thương đi qua dm() (SKF=1) nên cộng dồn với chí mạng, Ý Cảnh... như mọi kỹ năng. Trạng thái dùng ST.apply (combat/11).
 * Xấp xỉ so với mô tả: "tăng tốc di chuyển" (U Minh Độn) chưa có; "né tránh" = 35% bỏ qua sát thương trúng mình trong thời gian hiệu lực; lá chắn = hấp thụ sát thương;
 *   "giảm 10% công kích kẻ địch" (Vạn Độc Mê Vụ) chưa có (chỉ gây độc); "giảm 10% phòng thủ" (Phệ Linh Cổ Quần) = xuyên giáp 10%.
 * Chỉnh số liệu: CF và bảng SPEC. API: VPD.sect/setSect/info/lvOf/cast. */
(function(){
'use strict';
if(typeof PS==='undefined'||!window.VP||typeof dm!=='function'||typeof an!=='function'||typeof ZC==='undefined'||typeof E==='undefined')return;
var CF={unlock:[0,10,20,30,40,50],useBase:12,lvMax:10,lvScale:.08,passScale:.10,mp:[18,28,38,55,0,110],range:640};
var SLOT=[0,1,2,3,5];
function A(i,t,o){o=o||{};o.i=i;o.t=t;return o}
var PAS={p:1,i:'🔰'};
var SPEC={
umt:[A('🗡️','multi',{h:3,mul:1.8,cd:4}),A('💨','dash',{mul:1.2,cd:8,dodge:120}),A('🩸','mark',{dur:5,mul:1.0,cd:12}),A('🌙','exec',{mul:2.8,cd:18}),PAS,A('👥','dot',{dur:5,every:15,mul:8.5,cap:12,r:520,where:'self',cd:60,ult:1})],
hbd:[A('❄️','proj',{mul:1.3,cd:3,st:{sl:120}}),A('🧊','aoe',{mul:2.0,r:150,cd:8}),A('🥶','freeze',{mul:.3,cd:14}),A('🐲','sweep',{mul:3.0,r:560,cd:18,st:{sl:150}}),PAS,A('🌨️','dot',{dur:6,every:30,mul:7.5,r:440,where:'self',cd:60,ult:1,st:{sl:150}})],
ptc:[A('🔥','proj',{mul:1.4,cd:3,st:{brn:1}}),A('💥','aoe',{mul:2.2,r:150,cd:8,st:{brn:1}}),A('🔴','dot',{dur:5,every:60,mul:3.0,r:130,where:'tgt',cd:12,st:{brn:1}}),A('🦅','sweep',{mul:3.2,r:560,cd:20,st:{brn:1}}),PAS,A('☄️','dot',{dur:6,every:20,mul:9.0,cap:14,r:520,where:'self',cd:60,ult:1,st:{brn:1}})],
tkt:[A('🌙','proj',{mul:1.5,cd:3}),A('🗡️','multi',{h:5,mul:2.75,cd:8}),A('⚡','dash',{mul:1.8,cd:10,dodge:120}),A('🌠','charge',{mul:4.0,r:130,cd:18,wait:40}),PAS,A('⚔️','dot',{dur:5,every:15,mul:8.0,cap:12,r:480,where:'self',cd:60,ult:1})],
vdm:[A('🪡','proj',{mul:1.3,cd:3,st:{psn:1}}),A('🟢','dot',{dur:5,every:60,mul:4.0,r:160,where:'tgt',cd:10,st:{psn:1}}),A('🧪','burst',{mul:1.8,cd:8,st:{psn:1}}),A('🐍','dot',{dur:6,every:30,mul:4.5,r:110,where:'tgt',cd:18,st:{psn:1}}),PAS,A('☠️','dot',{dur:6,every:20,mul:8.0,cap:14,r:480,where:'self',cd:60,ult:1,st:{psn:1}})],
ngc:[A('🐛','multi',{h:4,mul:1.5,cd:5,bug:1}),A('🛡️','shield',{pct:.12,dur:6,cd:12}),A('🪲','dot',{dur:5,every:60,mul:2.5,r:130,where:'tgt',cd:10,st:{prc:.1,psn:1}}),A('🦂','dot',{dur:8,every:30,mul:6.0,r:440,where:'self',cd:20,summon:1}),PAS,A('🦗','dot',{dur:6,every:20,mul:7.5,cap:14,r:560,where:'self',cd:60,ult:1,summon:1})]};
var COL={umt:['#c070ff','#ff2a6a'],hbd:['#bff4ff','#4ab8ff'],ptc:['#ffd070','#ff5a1a'],tkt:['#fff3b0','#ffd84a'],vdm:['#9aff7a','#2aa84a'],ngc:['#ffc8ff','#c050d0']};
var SECT_N={umt:'U Minh Ma Tông',hbd:'Huyền Băng Điện',ptc:'Phần Thiên Cốc',tkt:'Thiên Kiếm Tông',vdm:'Vạn Độc Môn',ngc:'Ngự Cổ Thánh Điện'};

/* ---------- dữ liệu + cấp ---------- */
function G(n){try{return(0,eval)('typeof '+n+'===\"function\"?'+n+':null')}catch(e){return null}}
var lt=null;function later(n,f){lt=lt||G('later');if(lt)lt(n,f);else setTimeout(f,n*16)}
function say(t,c){try{DT.push({x:P.x,y:175,s:t,c:c||'#ffe27a',g:1,l:110})}catch(e){}}
var dirty=0;
function V(){var p=PS[cur];if(!p)return{id:'',u:{},mx:1};var v=p.vp;if(!v||typeof v!=='object'){v=p.vp={id:'',u:{},mx:1};try{var o=FM.get().sect;if(o&&SPEC[o])v.id=o}catch(e){}}if(!v.u)v.u={};if(!v.mx)v.mx=1;return v}
function sect(){var v=V();return SPEC[v.id]?v.id:''}
function setSect(id){var v=V();if(id&&!SPEC[id])return false;v.id=id||'';cd=[0,0,0,0,0];try{FM.get().sect=v.id}catch(e){}if(id&&!v.u[id])v.u[id]=[0,0,0,0,0,0];dirty=1;try{sv()}catch(e){}return true}
function U(id){var v=V();var a=v.u[id];if(!a||a.length<6){a=v.u[id]=[0,0,0,0,0,0].map(function(_,i){return a&&a[i]|0})}return a}
function lvOf(n){var L=1,r=n|0;while(L<CF.lvMax&&r>=CF.useBase*L){r-=CF.useBase*L;L++}return L}
function prog(n){var L=1,r=n|0;while(L<CF.lvMax&&r>=CF.useBase*L){r-=CF.useBase*L;L++}return L>=CF.lvMax?null:[r,CF.useBase*L]}
function curLv(){var v=V(),l=(typeof P!=='undefined'&&P&&P.lv)|0;if(l>v.mx){v.mx=l;dirty=1}return v.mx}
function unl(i){return i===0||curLv()>=CF.unlock[i]}
function slv(id,i){return lvOf(U(id)[i])}
function lvF(L){return 1+CF.lvScale*(L-1)}
function addUse(id,i){var u=U(id),L0=lvOf(u[i]);u[i]++;dirty=1;var L1=lvOf(u[i]);if(L1>L0){say('⬆ Kỹ năng Lv '+L1+(L1>=CF.lvMax?' (tối đa)':''),COL[id][0]);try{sv()}catch(e){}}}
function info(id,i){var u=U(id)[i],un=unl(i),pg=prog(u);return{unl:un,lv:lvOf(u),uses:u,prog:pg,need:CF.unlock[i],max:CF.lvMax}}
setInterval(function(){if(dirty){dirty=0;try{if(typeof started!=='undefined'&&started)sv()}catch(e){}}},15000);

/* ---------- tiện ích chiến đấu ---------- */
function alive(){return E.filter(function(e){return e.in<=0&&e.hp>0})}
function nearE(r){return alive().filter(function(e){return Math.abs(e.x-P.x)<(r||CF.range)}).sort(function(a,b){return Math.abs(a.x-P.x)-Math.abs(b.x-P.x)})}
function light(){return FX.length>50||E.length>10}
function mxh(){try{return mx()}catch(e){return P.hp}}
function stat(e,st){if(!st||!e||e.hp<=0)return;try{if(st.sl)e.sl=Math.max(e.sl||0,st.sl);if(window.ST&&ST.apply){if(st.brn)ST.apply(e,'brn');if(st.psn)ST.apply(e,'psn');if(st.frz)ST.apply(e,'frz');if(st.stn)ST.apply(e,'stn');if(st.prc)ST.apply(e,'prc',st.prc)}}catch(x){}}
function sparks(x,id,n){var c=COL[id];for(var i=0;i<n;i++)try{PT.push({x:x,y:60,vx:(R()-.5)*4,vy:R()*-4,l:26,c:c[i%2]})}catch(e){}}
function ring(wx,rad,life,col,fill){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var k=.25+.75*Math.min(1,p*1.6);g.save();g.globalCompositeOperation='lighter';g.translate(X,gy-3*s);g.scale(1,.28);g.globalAlpha=1-p;if(fill){g.fillStyle=fill;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.fill()}g.strokeStyle=col;g.lineWidth=5*s;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.stroke();g.restore()}})}
function pillar(wx,w,life,col){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var a=1-p;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,gy-420*s,0,gy);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(1,col);g.globalAlpha=.65*a;g.fillStyle=q;g.fillRect(X-w*s,gy-420*s,2*w*s,420*s);g.restore()}})}
function beam(x0,x1,life,col){FX.push({x:x0,l:life,m:life,fn:function(f,p,X,gy){var a=1-p,Xe=X+(x1-x0)*s*Math.min(1,p*3+.3);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=9*s;g.beginPath();g.moveTo(X,gy-60*s);g.lineTo(Xe,gy-60*s);g.stroke();g.strokeStyle='#fff';g.lineWidth=3*s;g.stroke();g.restore()}})}
function slash(wx,life,col){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=1-p;g.strokeStyle=col;g.lineWidth=6*s;g.lineCap='round';g.beginPath();g.moveTo(X-40*s,gy-110*s);g.lineTo(X+40*s,gy-30*s);g.stroke();g.restore()}})}

/* ---------- nội tại (bị động) + gây sát thương ---------- */
var st_={hbd:0,tkt:0,ngc:0,armed:0,hits:0,grp:0,grpS:0,gb:1,vdc:0,healT:0,summ:0};
function newGrp(summon){st_.grp++;st_.grpS=0;st_.gb=1;var id=sect();if(!id)return;var pl=lvOf(U(id)[4]);
  if(st_.armed&&(id!=='ngc'||summon)){st_.gb=1.2+CF.passScale*.2*(pl-1);st_.armed=0;addUse(id,4)}}
function passiveHit(e,m,summon){var id=sect(),pl=lvOf(U(id)[4]),now=Date.now();
  if(id==='umt'){if(R()<.05+.004*(pl-1)){m*=1.8;addUse(id,4);if(now>st_.healT){st_.healT=now+1500;P.hp=Math.min(mxh(),P.hp+mxh()*(.015+.001*pl))}}}
  else if(id==='hbd'){if(!st_.grpS){st_.grpS=1;st_.hbd++;if(st_.hbd>=5){st_.hbd=0;st_.armed=1}}}
  else if(id==='ptc'){if(e.stt&&e.stt.brn>0){m*=1.08+.01*(pl-1);if(st_.grpS!==2){st_.grpS=2;addUse(id,4)}}}
  else if(id==='tkt'){st_.hits++;if(st_.hits>=5){st_.hits=0;st_.tkt++;if(st_.tkt>=5){st_.tkt=0;st_.armed=1}}}
  else if(id==='vdm'){if(e.stt&&e.stt.psn>0){m*=1.08+.01*(pl-1);if(e.stt.ps>=5&&now>st_.vdc){st_.vdc=now+4000;m*=1.2+.02*(pl-1);addUse(id,4)}}}
  else if(id==='ngc'){if(summon&&!st_.grpS){st_.grpS=1;st_.ngc++;if(st_.ngc>=5){st_.ngc=0;st_.armed=1}}}
  return m}
function hit(e,mul,idx,summon){if(!e||e.hp<=0||e.in>0)return;var id=sect();if(!id)return;
  var m=mul*lvF(slv(id,idx))*st_.gb;m=passiveHit(e,m,summon);
  var f=typeof SKF!=='undefined';if(f)SKF=1;try{dm(e,m,0)}finally{if(f)SKF=0}}

/* dấu Huyết Ảnh Truy Hồn: đòn kế tiếp lên mục tiêu bị đánh dấu gây thêm sát thương */
var _dm2=dm,mkG=0;
dm=function(e,m,sl){var mk=e&&e.vpMk&&typeof fr!=='undefined'&&fr<e.vpMk.u&&!mkG;var r=_dm2.apply(this,arguments);if(mk&&e.vpMk){var x=e.vpMk.m;e.vpMk=null;if(e.hp>0){mkG=1;try{_dm2(e,x,0)}finally{mkG=0}}try{DT.push({x:e.x,y:(e.hh||100)*(typeof SZ!=='undefined'?SZ:1)+30,s:'🩸 Truy Hồn',c:'#ff2a6a',l:45})}catch(z){}}return r};

/* lá chắn + né tránh: hấp thụ phần máu mất sau mỗi vòng step() */
var SH={a:0,u:0},DOD=0,hp0=0;
if(typeof step==='function'){var _st=step;step=function(){hp0=P.hp;var r=_st.apply(this,arguments);try{if(P.hp<hp0&&typeof fr!=='undefined'){var lost=hp0-P.hp;
  if(DOD>fr&&R()<.35){P.hp=Math.min(mxh(),P.hp+lost);lost=0}
  if(lost>0&&SH.a>0&&SH.u>fr){var ab=Math.min(lost,SH.a);SH.a-=ab;P.hp=Math.min(mxh(),P.hp+ab)}}}catch(e){}return r}}

/* ---------- thi triển ---------- */
function fire(b,id,idx,s){
  try{window.STLAST=[SECT_N[id]+':'+idx,fr]}catch(e){}
  var c=COL[id],px=P.x,dd=P.d||1,lg=light(),tg=nearE()[0],t=s.t;
  newGrp(!!s.summon);
  function fxHit(e){sparks(e.x,id,2);slash(e.x,12,c[0])}
  if(t==='multi'){for(var q=0;q<s.h;q++)(function(q){later(q*6,function(){var e=nearE()[0];if(!e)return;hit(e,s.mul/s.h,idx);if(s.bug)sparks(e.x,id,3);if(!lg||q%2===0)slash(e.x,10,c[0]);if(q===s.h-1)st_.grpS=0})})(q)}
  else if(t==='proj'){if(tg){beam(px,tg.x,14,c[1]);hit(tg,s.mul,idx);stat(tg,s.st);fxHit(tg)}}
  else if(t==='aoe'){var cx=tg?tg.x:px+dd*140;ring(cx,s.r,22,c[1],'rgba(255,255,255,.08)');pillar(cx,50,18,c[1]);alive().forEach(function(e){if(Math.abs(e.x-cx)<s.r){hit(e,s.mul,idx);stat(e,s.st);sparks(e.x,id,2)}})}
  else if(t==='exec'){if(tg){var fr_=1-Math.max(0,Math.min(1,tg.hp/(tg.max||tg.hp)));slash(tg.x,16,c[0]);hit(tg,s.mul*(1+.8*fr_),idx);sparks(tg.x,id,4)}}
  else if(t==='dash'){if(tg){P.x=Math.max(40,tg.x-dd*60);DOD=fr+s.dodge;ring(px,60,14,c[0]);hit(tg,s.mul,idx);fxHit(tg)}}
  else if(t==='mark'){if(tg){tg.vpMk={u:fr+s.dur*60,m:s.mul*lvF(slv(id,idx))};ring(tg.x,70,26,c[1],'rgba(255,40,100,.2)');say('🩸 Đánh dấu',c[0])}}
  else if(t==='freeze'){if(tg){var boss=tg.b>=2||tg.k==='boss';hit(tg,s.mul,idx);ring(tg.x,90,24,c[1],'rgba(160,230,255,.25)');if(boss)tg.sl=Math.max(tg.sl||0,180);else stat(tg,{frz:1,sl:90})}}
  else if(t==='sweep'){beam(px,px+dd*s.r,24,c[1]);ring(px+dd*s.r*.5,s.r*.5,20,c[0]);alive().forEach(function(e){if((e.x-px)*dd>-40&&Math.abs(e.x-px)<s.r){hit(e,s.mul,idx);stat(e,s.st);sparks(e.x,id,2)}})}
  else if(t==='burst'){if(tg){var ps=(tg.stt&&tg.stt.ps)|0;hit(tg,s.mul,idx);if(ps)hit(tg,.25*ps,idx);stat(tg,s.st);ring(tg.x,80,20,c[1]);sparks(tg.x,id,4)}}
  else if(t==='charge'){var cx2=tg?tg.x:px+dd*160;ring(cx2,s.r,s.wait,c[0],'rgba(255,255,255,.1)');later(s.wait,function(){if(over||vil)return;newGrp(false);pillar(cx2,60,20,c[0]);ring(cx2,s.r,18,c[1]);alive().forEach(function(e){if(Math.abs(e.x-cx2)<s.r)hit(e,s.mul,idx)});shakeIt(5)})}
  else if(t==='shield'){SH.a=mxh()*s.pct*lvF(slv(id,idx));SH.u=fr+s.dur*60;ring(px,70,24,c[0],'rgba(255,200,255,.2)');say('🛡️ +'+Math.round(SH.a),c[0])}
  else if(t==='dot'){var n=Math.max(1,Math.round(s.dur*60/s.every)),per=s.mul/Math.min(n,s.cap||n),cx3=s.where==='tgt'?(tg?tg.x:px+dd*140):px,cnt={},ids=0;
    if(s.where==='tgt'&&!tg)return;
    if(s.prc&&tg)stat(tg,{prc:s.prc});
    ring(cx3,s.r,s.ult?40:24,c[1],'rgba(255,255,255,.06)');
    for(var k=1;k<=n;k++)(function(k){later(k*s.every,function(){if(over||vil)return;newGrp(!!s.summon);var X=s.where==='tgt'?cx3:P.x;
      if(!lg||k%2===0)ring(X+(R()-.5)*s.r,40,10,c[k%2]);
      alive().forEach(function(e){if(Math.abs(e.x-X)<s.r){var key=e.sn!=null?e.sn:E.indexOf(e);cnt[key]=(cnt[key]|0)+1;if(s.cap&&cnt[key]>s.cap)return;hit(e,per,idx,!!s.summon);stat(e,s.st);if(!lg)sparks(e.x,id,1)}})})})(k)}
}
function shakeIt(n){try{var f=G('shake');if(f)f(n)}catch(e){}}

/* ---------- bấm / auto ---------- */
var cd=[0,0,0,0,0],pend=-1,pendT=0;
function needTarget(s){return s.t!=='shield'}
function castS(b,buf){var id=sect();if(!id||typeof started==='undefined'||!started||over||vil)return false;
  var idx=SLOT[b],s=SPEC[id][idx];if(!s)return false;
  if(!unl(idx)){if(buf)say('🔒 Mở ở Lv '+CF.unlock[idx],'#ff9a8a');return false}
  var mp=CF.mp[idx];
  if(P.pe||P.act){if(buf&&cd[b]<=Date.now()&&P.mp>=mp){pend=b;pendT=Date.now()+450}return false}
  var t=Date.now();if(cd[b]>t||P.mp<mp)return false;
  var tg=nearE()[0];if(needTarget(s)&&!tg)return false;
  P.mp-=mp;cd[b]=t+s.cd*1000;addUse(id,idx);
  if(tg)P.d=tg.x>=P.x?1:-1;
  var w=Math.max(6,Math.round([11,14,16,18,20][b]/(window.OPT2?OPT2.cs():1)));try{an(w);P.atk=P.atkT=w+7}catch(e){}
  P.pe={l:w,t:s.ult?5:2,n:SECT_N[id],f:function(){try{fire(b,id,idx,s)}catch(e){}}};
  if(s.ult)say(s.i+' Tuyệt kỹ',COL[id][0]);
  return true}
var inStep=0;
function autoS(){if(P.pe||P.act)return false;var id=sect();if(!id)return false;var n=nearE().length;if(!n)return false;var boss=E.some(function(e){return e.b&&e.hp>0}),did=false;
  [4,3,1,2,0].forEach(function(b){if(did)return;var s=SPEC[id][SLOT[b]];if(s.ult&&n<2&&!boss)return;if(s.t==='shield'&&P.hp>mxh()*.8)return;if(castS(b))did=true});return did}
if(typeof step==='function'){var _st2=step;step=function(){inStep=1;try{return _st2.apply(this,arguments)}finally{inStep=0}}}
if(typeof cast==='function'){var _cast=cast;cast=function(i){if(inStep&&typeof auto!=='undefined'&&auto&&!P.pe&&!P.act&&autoS())return false;return _cast.apply(this,arguments)}}
var _za=ZC.zauto;ZC.zauto=function(){var r=_za.apply(this,arguments);try{if(typeof auto!=='undefined'&&auto)autoS()}catch(e){}return r};
setInterval(function(){if(pend<0)return;if(Date.now()>pendT){pend=-1;return}if(!P.pe&&!P.act){var b=pend;pend=-1;castS(b)}},60);

/* ---------- nút #sp-bar ---------- */
var bar=null,btn=[];
function css(){var c=document.createElement('style');c.textContent='#sp-bar{position:fixed;right:62px;top:calc(124px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;z-index:2;contain:layout style}#sp-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid;color:#fff;font-size:20px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}#sp-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#fff;text-shadow:0 0 3px #000}#sp-bar button.lk{opacity:.45}#sp-bar button.cd{opacity:.6}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='sp-bar';
  for(var b=0;b<5;b++)(function(b){var e=document.createElement('button');e.onpointerdown=function(ev){ev.stopPropagation();ev.preventDefault();castS(b,true)};e.addEventListener('click',function(ev){ev.stopPropagation()});btn.push(e);bar.appendChild(e)})(b);
  document.body.appendChild(bar);try{if(window.SKLAY&&SKLAY.ids&&SKLAY.ids.indexOf('sp-bar')<0){SKLAY.ids.push('sp-bar');SKLAY.adopt()}}catch(e){}}
setInterval(function(){if(document.hidden)return;try{
  if(!bar&&document.body)build();if(!bar)return;
  var id=sect(),on=!!id&&typeof started!=='undefined'&&started&&!(typeof vil!=='undefined'&&vil);bar.style.display=on?'flex':'none';if(!on)return;
  var t=Date.now(),c=COL[id];
  for(var b=0;b<5;b++){var e=btn[b],idx=SLOT[b],s=SPEC[id][idx],ok=unl(idx),rem=Math.max(0,Math.ceil((cd[b]-t)/1000)),L=slv(id,idx),key=id+'|'+(ok?1:0)+'|'+rem+'|'+L;
    if(e._k!==key){e._k=key;e.className=(ok?'':'lk')+(rem?' cd':'');e.style.borderColor=c[0];e.style.background='radial-gradient(circle at 50% 35%,'+c[1]+'88,#0a0818 75%)';e.style.boxShadow='0 0 8px '+c[0];e.innerHTML=ok?s.i+'<small>'+(rem?rem+'s':'Lv'+L)+'</small>':'🔒<small>Lv'+CF.unlock[idx]+'</small>'}}
}catch(e){}},250);

window.VPD={sect:sect,setSect:setSect,info:info,lvOf:lvOf,cast:castS,cfg:CF,spec:SPEC,use:function(id){return U(id)}};
})();
