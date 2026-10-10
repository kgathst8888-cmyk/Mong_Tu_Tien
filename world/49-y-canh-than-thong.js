/* ===== 📜 THẦN THÔNG Ý CẢNH · TIÊN ĐẠO / MA ĐẠO (world/49-y-canh-than-thong.js) =====
 * Mỗi đạo (world/45-y-canh.js) có 3 thần thông RIÊNG, độc lập với 6 hệ Thần Thông cũ (world/34) — dùng được cả phàm thể lẫn Đạo Thể:
 *   Tiên Đạo (vàng kim · thánh quang, vẽ bằng ánh sáng cộng 'lighter'):  Kim Quang Phổ Chiếu · Vô Ngã Kiếm Vũ · Quy Nhất Thiên Phạt
 *   Ma Đạo (tím đen · đỏ huyết, vẽ chồng tối 'source-over' viền tím/đỏ):  Ma Sát Phệ Hồn · Dục Nương Huyết Chú · Vạn Niệm Câu Hồn
 * Mở khoá theo cảnh giới Ý Cảnh: CF.unlock = [1,3,5] (thần thông 1 có ngay khi chọn đạo). Sát thương nhân (1 + 0,12 × (cảnh giới − 1)).
 * Sát thương đi qua dm() với SKF=1 nên cũng sinh sát thương phụ Ý Cảnh (đen/vàng) như mọi kỹ năng.
 * Nút riêng #yt-bar (3 nút, bên trái cột Thần Thông cũ; tự dịch sang trái thêm 1 cột khi nút Pháp Bảo #fb-bar (world/48) đang hiện để khỏi đè nhau), tự thi triển khi bật AUTO (xen vào vòng chọn chiêu của engine khi nhân vật rảnh). Bảng Ý Cảnh hiển thị danh sách (YCTT.card()).
 * Chỉnh số liệu: khối CF. Phụ thuộc: YCANH (45), dm/SKF/an/P/E/FX/DT/PT/g/s/mx/R/ZC (engine). Hiệu ứng nhẹ: tự rút gọn khi nhiều FX/địch. */
(function(){
'use strict';
if(typeof PS==='undefined'||!window.YCANH||typeof dm!=='function'||typeof an!=='function'||typeof ZC==='undefined')return;
var CF={unlock:[1,3,5],scale:.12,sk:{
 t:[{n:'Kim Quang Phổ Chiếu',i:'☀️',k:'B',mul:4.2,r:300,cd:12,mp:40,heal:.02,d:'Trụ kim quang giáng xuống quanh địch gần nhất, diện rộng, hồi 2% máu. Choáng 30% · xuyên giáp 35% · bạo kích +30%.'},
    {n:'Vô Ngã Kiếm Vũ',i:'🗡️',k:'M',h:5,mul:7.5,cd:20,mp:70,d:'5 đạo kim kiếm từ trời truy đuổi địch gần nhất. Choáng 20% · xuyên giáp 60% · bạo kích +40%.'},
    {n:'Quy Nhất Thiên Phạt',i:'⚡',k:'S',mul:16,cd:40,mp:130,d:'Thiên lôi kim sắc giáng xuống toàn bộ địch trên màn hình. Choáng 60% · xuyên giáp 60% · bạo kích +55%.'}],
 m:[{n:'Ma Sát Phệ Hồn',i:'🌑',k:'L',mul:4.5,r:560,cd:12,mp:40,heal:.02,d:'Ma trảo đen xuyên cả hàng địch phía trước, hút 2% máu. Hấp huyết 12% · trúng độc 60% · chảy máu 50%.'},
    {n:'Dục Nương Huyết Chú',i:'🩸',k:'M',h:5,mul:7.5,cd:20,mp:70,sl:1,d:'5 huyết chú ma khí đeo bám địch gần nhất, làm chậm. Chảy máu 80% · thiêu đốt 35% · quỷ ám 35% · hấp huyết 8%.'},
    {n:'Vạn Niệm Câu Hồn',i:'🌀',k:'S',mul:16,cd:40,mp:130,sl:1,d:'Vòng xoáy ma niệm hút hồn toàn bộ địch, làm chậm. Làm chập 50% · đóng băng 30% · trúng độc 40% · thiêu đốt 30% · quỷ ám 60% · hấp huyết 5%.'}]}};
var PAL={t:{col:'#ffd84a',lite:'#fff3b0',rgb:'255,226,122',bd:'#ffd84a',bg:'radial-gradient(circle at 50% 35%,#fff6cf,#b8862a 70%,#3a2a08)'},
         m:{col:'#c070ff',lite:'#ff2a6a',rgb:'160,80,255',bd:'#a050ff',bg:'radial-gradient(circle at 50% 35%,#6a2a9a,#1a0828 70%,#050208)'}};
var cd=[0,0,0],pend=-1,pendT=0;
function okJ(j,inf){return window.YCTOC?YCTOC.ok(j,inf):inf.realm>=CF.unlock[j]}

/* ---------- tiện ích ---------- */
function G(n){try{return(0,eval)('typeof '+n+'==="function"?'+n+':null')}catch(e){return null}}
var fl=null,sk=null,lt=null;
function later(n,f){lt=lt||G('later');if(lt)lt(n,f);else setTimeout(f,n*16)}
function say(t,c){try{DT.push({x:P.x,y:175,s:t,c:c||'#ffe27a',g:1,l:120})}catch(e){}}
function info(){return window.YCANH&&YCANH.info()}
function alive(){return E.filter(function(e){return e.in<=0&&e.hp>0})}
function nearE(r){return alive().filter(function(e){return Math.abs(e.x-P.x)<(r||640)}).sort(function(a,b){return Math.abs(a.x-P.x)-Math.abs(b.x-P.x)})}
function light(){return FX.length>50||E.length>10}
function screenFlash(c,l){try{fl=fl||G('flash');if(fl)fl(c,l)}catch(e){}}
function shake(n){try{sk=sk||G('shake');if(sk)sk(n)}catch(e){}}

/* ---------- hiệu ứng: TIÊN = ánh sáng vàng cộng ('lighter'); MA = khối tối chồng + viền tím/đỏ ---------- */
function ring(wx,rad,life,fill,stroke,add){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var k=.25+.75*Math.min(1,p*1.6);g.save();if(add)g.globalCompositeOperation='lighter';g.translate(X,gy-3*s);g.scale(1,.28);g.globalAlpha=1-p;if(fill){g.fillStyle=fill;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.fill()}g.strokeStyle=stroke;g.lineWidth=5*s;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.stroke();g.restore()}})}
function pillarT(wx,w,life){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var a=1-p,k=1-p*.35;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,gy-470*s,0,gy);q.addColorStop(0,'rgba(255,240,170,0)');q.addColorStop(.7,'rgba(255,226,122,'+.55*a+')');q.addColorStop(1,'rgba(255,255,235,'+a+')');g.fillStyle=q;g.fillRect(X-w*s*k,gy-470*s,2*w*s*k,470*s);g.restore()}})}
function bolt(wx,life){var pts=[];for(var i=0;i<=7;i++)pts.push([i&&i<7?(Math.random()-.5)*56:0,i/7]);FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var a=1-p;g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';[['#ffcf3a',8*s,.55*a],['#fffbe0',2.6*s,a]].forEach(function(o){g.strokeStyle=o[0];g.lineWidth=o[1];g.globalAlpha=o[2];g.beginPath();pts.forEach(function(q,i){var x=X+q[0]*s,y=q[1]*(gy-6*s);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()});g.restore()}})}
function swordT(wx,life){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var a=1-p,y=gy-(30+190*(1-Math.min(1,p*2.2)))*s;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.strokeStyle='rgba(255,226,122,.9)';g.lineWidth=7*s;g.lineCap='round';g.beginPath();g.moveTo(X-26*s,y-90*s);g.lineTo(X,y);g.stroke();g.strokeStyle='#fffbe0';g.lineWidth=2.4*s;g.beginPath();g.moveTo(X-26*s,y-90*s);g.lineTo(X,y);g.stroke();g.restore()}})}
function burstM(wx,life,rad){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var k=.3+.7*Math.min(1,p*1.8);g.save();g.globalAlpha=1-p;g.fillStyle='rgba(16,4,28,.85)';g.beginPath();g.arc(X,gy-46*s,rad*s*k,0,6.283);g.fill();g.strokeStyle='#a050ff';g.lineWidth=3*s;g.stroke();g.strokeStyle='#ff2a6a';g.lineWidth=1.4*s;g.beginPath();g.arc(X,gy-46*s,rad*s*k*.7,p*6,p*6+4.2);g.stroke();g.restore()}})}
function claw(px,dd,len,life){FX.push({x:px,l:life,m:life,fn:function(f,p,X,gy){var e=Math.min(1,p*3),L=dd*len*s*e;g.save();g.globalAlpha=1-p;g.fillStyle='rgba(14,3,26,.9)';g.beginPath();g.moveTo(X,gy-72*s);g.quadraticCurveTo(X+L*.5,gy-130*s,X+L,gy-40*s);g.quadraticCurveTo(X+L*.5,gy-58*s,X,gy-32*s);g.closePath();g.fill();g.strokeStyle='#c040ff';g.lineWidth=3*s;g.stroke();g.strokeStyle='#ff2a6a';g.lineWidth=1.6*s;for(var i=0;i<3;i++){g.beginPath();g.moveTo(X+L*.1,gy-(104-i*18)*s);g.lineTo(X+L,gy-(70-i*14)*s);g.stroke()}g.restore()}})}
function curse(wx,life){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){g.save();g.globalAlpha=1-p;g.translate(X,gy-48*s);g.rotate(p*5);g.strokeStyle='#ff2a6a';g.lineWidth=3*s;g.fillStyle='rgba(20,4,30,.8)';g.beginPath();g.arc(0,0,40*s,0,6.283);g.fill();g.stroke();g.strokeStyle='#c070ff';for(var i=0;i<3;i++){g.rotate(2.0944);g.beginPath();g.moveTo(0,-40*s);g.lineTo(0,-14*s);g.stroke()}g.restore()}})}
function vortex(wx,rad,life){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var a=p<.8?1:(1-p)*5;g.save();g.globalAlpha=.28*a;g.fillStyle='#0a0014';g.fillRect(0,0,W,H);g.globalAlpha=.7*a;g.translate(X,gy-3*s);g.scale(1,.3);g.fillStyle='rgba(18,4,32,.9)';g.beginPath();g.arc(0,0,rad*s,0,6.283);g.fill();g.strokeStyle='#a050ff';g.lineWidth=5*s;g.stroke();g.strokeStyle='#ff2a6a';g.lineWidth=3*s;for(var i=0;i<3;i++){g.beginPath();g.arc(0,0,rad*s*(.35+i*.22),p*9+i*2,p*9+i*2+3.6);g.stroke()}g.restore()}})}
function sparks(x,cols,n){for(var i=0;i<n;i++)PT.push({x:x,y:60,vx:(R()-.5)*4,vy:R()*-4,l:26,c:cols[i%cols.length]})}

/* ---------- thi triển ---------- */
function mulOf(s,inf){return s.mul*(1+CF.scale*(inf.realm-1))}
function fire(j,s,inf){
  try{window.STLAST=[s.n,fr]}catch(e){}  /* ghi tên chiêu để combat/11 + world/50 áp trạng thái */
  var T=inf.path,px=P.x,dd=P.d||1,mul=mulOf(s,inf),lg=light(),
    P_=T==='t'?['#fff3b0','#ffd84a']:['#7a40c0','#ff2a6a'];
  function hit(e,k){var f=typeof SKF!=='undefined';if(f)SKF=1;try{dm(e,mul*(k||1),s.sl?1:0)}finally{if(f)SKF=0}}
  var es=alive(),near=es.slice().sort(function(a,b){return Math.abs(a.x-px)-Math.abs(b.x-px)})[0];
  if(window.YCTOC&&YCTOC.fire(j,s,inf,hit,es,near,mul))return;
  if(s.k==='B'){var cx=near?near.x:px+dd*140;
    ring(cx,s.r,24,'rgba(255,226,122,.25)','#fff3b0',true);pillarT(cx,70,22);if(!lg)ring(cx,s.r*.6,18,null,'#fffbe0',true);
    es.forEach(function(e){if(Math.abs(e.x-cx)<s.r){hit(e);sparks(e.x,P_,3)}});
    if(s.heal)P.hp=Math.min(mx(),P.hp+mx()*s.heal);if(!lg)screenFlash('#ffe27a',5);shake(3)}
  else if(s.k==='L'){claw(px,dd,s.r,22);if(!lg)burstM(px+dd*60,14,40);
    es.forEach(function(e){if((e.x-px)*dd>-40&&Math.abs(e.x-px)<s.r){hit(e);burstM(e.x,16,50);sparks(e.x,P_,3)}});
    if(s.heal)P.hp=Math.min(mx(),P.hp+mx()*s.heal);shake(3)}
  else if(s.k==='M'){for(var q=0;q<s.h;q++)(function(q){later(q*7,function(){var t=nearE()[0];if(!t)return;
      if(T==='t'){if(!lg||q%2===0)swordT(t.x,16);ring(t.x,60,14,null,'#fff3b0',true)}else{if(!lg||q%2===0)curse(t.x,22);burstM(t.x,14,36)}
      hit(t,1.2/s.h);sparks(t.x,P_,2)})})(q);
    if(T==='t'&&!lg)ring(px,90,18,null,'#ffd84a',true);if(T==='m'&&!lg)ring(px,90,18,'rgba(16,4,28,.5)','#a050ff',false)}
  else if(s.k==='S'){
    if(T==='t'){screenFlash('#ffe27a',10);shake(6)}else{vortex(px,520,48);shake(5)}
    es.forEach(function(e,i){later(Math.min(i,8)*3,function(){if(e.hp<=0)return;if(T==='t'){bolt(e.x,14);ring(e.x,70,16,null,'#fffbe0',true)}else{burstM(e.x,18,52);if(!lg)sparks(e.x,['#d0a0ff','#ff2a6a'],4)}hit(e,.8)})})}
}
function castY(j,buf){
  var inf=info();if(!inf||typeof started==='undefined'||!started||over||vil)return false;
  var s=CF.sk[inf.path][j];if(!s)return false;
  if(!okJ(j,inf)){if(buf)say('🔒 '+s.n+': '+(window.YCTOC?YCTOC.lockMsg(j,inf):'mở ở cảnh giới '+CF.unlock[j]+' Ý Cảnh'),'#ff9a8a');return false}
  if(P.pe||P.act){if(buf&&cd[j]<=Date.now()&&P.mp>=s.mp){pend=j;pendT=Date.now()+450}return false}
  var t=Date.now();if(cd[j]>t||P.mp<s.mp)return false;
  var tg=nearE()[0];if(!tg&&!(s.k==='S'&&alive().length))return false;
  P.mp-=s.mp;cd[j]=t+s.cd*1000;
  if(tg)P.d=tg.x>=P.x?1:-1;
  var w=Math.max(6,Math.round([11,14,18][j]/(window.OPT2?OPT2.cs():1)));try{an(w);P.atk=P.atkT=w+7}catch(e){}P.ln=s.n;
  P.pe={l:w,t:j===2?5:2,n:s.n,f:function(){try{fire(j,s,inf)}catch(e){}}};
  if(j===2)say(s.i+' '+s.n,PAL[inf.path].col);
  return true}
/* Tự thi triển khi bật AUTO. Engine tự tung kỹ năng thường liên tục và chiếm P.pe NGAY khi chiêu trước vừa xong, nên không bao giờ có khung hình rảnh
   để chen vào từ ZC.tick/ZC.zauto. Cách làm: bọc step() để biết đang ở trong vòng lặp game, rồi bọc cast() của engine — trong vòng AUTO, nếu nhân vật
   đang rảnh mà có thần thông Ý Cảnh sẵn sàng thì tung nó TRƯỚC (người chơi tự bấm kỹ năng ngoài vòng step() không bị đổi). ZC.zauto giữ làm dự phòng. */
var inStep=0;
function autoY(){if(P.pe||P.act)return false;var inf=info();if(!inf)return false;var n=nearE().length;if(!n)return false;var boss=E.some(function(e){return e.b&&e.hp>0}),did=false;
  [2,1,0].forEach(function(j){if(did||(j===2&&n<2&&!boss))return;if(castY(j))did=true});return did}
if(typeof step==='function'){var _step=step;step=function(){inStep=1;try{return _step.apply(this,arguments)}finally{inStep=0}}}
if(typeof cast==='function'){var _cast=cast;cast=function(i){if(inStep&&typeof auto!=='undefined'&&auto&&!P.pe&&!P.act&&autoY())return false;return _cast.apply(this,arguments)}}
var _za=ZC.zauto;ZC.zauto=function(){var r=_za.apply(this,arguments);try{if(typeof auto!=='undefined'&&auto)autoY()}catch(e){}return r};
setInterval(function(){if(pend<0)return;if(Date.now()>pendT){pend=-1;return}if(!P.pe&&!P.act){var j=pend;pend=-1;castY(j)}},60);

/* ---------- nút bấm #yt-bar ---------- */
var bar=null,btn=[];
function css(){var c=document.createElement('style');c.textContent='#yt-bar{position:fixed;right:62px;top:calc(124px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;z-index:2;contain:layout style}@media (min-width:641px){#yt-bar{top:calc(128px + env(safe-area-inset-top,0px))}}#yt-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid;color:#fff;font-size:20px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}#yt-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#fff}#yt-bar button.lk{opacity:.45}#yt-bar button.cd{opacity:.6}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='yt-bar';
  for(var j=0;j<3;j++)(function(j){var b=document.createElement('button');b.onpointerdown=function(e){e.stopPropagation();e.preventDefault();castY(j,true)};b.addEventListener('click',function(e){e.stopPropagation()});btn.push(b);bar.appendChild(b)})(j);
  document.body.appendChild(bar)}
setInterval(function(){if(document.hidden)return;try{
  if(!bar&&document.body)build();if(!bar)return;
  var inf=info(),act=!!inf&&typeof started!=='undefined'&&started&&!(typeof vil!=='undefined'&&vil);bar.style.display=act?'flex':'none';if(!act)return;
  var fb=document.getElementById('fb-bar'),ro=(fb&&fb.style.display&&fb.style.display!=='none')?'110px':'62px';if(bar._ro!==ro){bar._ro=ro;bar.style.right=ro}
  var t=Date.now(),pl=PAL[inf.path],S=CF.sk[inf.path];
  for(var j=0;j<3;j++){var b=btn[j],s=S[j],ok=okJ(j,inf),rem=Math.max(0,Math.ceil((cd[j]-t)/1000)),key=inf.path+'|'+(ok?1:0)+'|'+rem;
    if(b._k!==key){b._k=key;b.className=(ok?'':'lk')+(rem?' cd':'');b.style.borderColor=pl.bd;b.style.background=pl.bg;b.style.boxShadow='0 0 8px '+pl.bd;b.innerHTML=ok?s.i+(rem?'<small>'+rem+'s</small>':''):'🔒<small>'+(window.YCTOC?YCTOC.lockShort(j,inf):'CG'+CF.unlock[j])+'</small>'}}
}catch(e){}},250);

/* ---------- thẻ trong bảng Ý Cảnh ---------- */
function card(){var inf=info();if(!inf)return'';var pl=PAL[inf.path],S=CF.sk[inf.path];
  return'<div style="margin-top:10px;font-size:13px"><b style="color:'+pl.col+'">📜 Thần Thông Ý Cảnh</b><div style="font-size:11.5px;opacity:.7">Nút riêng bên trái cột Thần Thông · tự dùng khi bật AUTO.</div>'+S.map(function(s,j){var ok=okJ(j,inf);
    return'<div style="display:flex;gap:8px;align-items:flex-start;border:1px solid '+(ok?pl.bd:'#4a3a60')+';border-radius:9px;padding:6px;margin:5px 0;opacity:'+(ok?1:.6)+'"><div style="font-size:24px;width:30px;text-align:center">'+(ok?s.i:'🔒')+'</div><div style="flex:1"><b style="color:'+pl.col+'">'+s.n+'</b> <span style="opacity:.75">· '+(ok?'đã mở':(window.YCTOC?YCTOC.lockMsg(j,inf):'mở ở cảnh giới '+CF.unlock[j]))+'</span><div style="font-size:12px;opacity:.85;line-height:1.4">'+s.d+'<br>×'+mulOf(s,inf).toFixed(1)+(s.k==='M'?' tổng':s.k==='S'?' mỗi địch':'')+' sát thương · hồi '+s.cd+'s · '+s.mp+' MP</div></div></div>'}).join('')+(window.YCTOC?YCTOC.card(inf):'')+'</div>'}

window.YCTT={cast:castY,card:card,cfg:CF,cd:cd};
})();
