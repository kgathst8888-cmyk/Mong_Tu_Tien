/* ===== ✨ HIỆU ỨNG CƯỜNG HÓA +7 / +10 =====
 * Chỉ số trang bị theo cấp cường hóa: UM(u) trong core/01-engine.js (bảng hệ số: +10 = ×10; mốc +7 và +10 nhảy mạnh). Module này chỉ lo hiệu ứng:
 *  - Ô trang bị trong túi/đang mặc: huy hiệu +N; +7 viền ánh sáng xanh quay + nhịp sáng; +10 viền vàng-lửa quay nhanh + nhịp mạnh
 *  - Cường hóa lên đúng +7 / +10: bùng nổ toàn màn hình (vòng sóng, tia lửa, chữ) + chữ nổi trong game
 *  - Nhân vật mặc đồ +7 trở lên: hào quang nhẹ quanh người (xanh) / +10 (vàng-lửa) mạnh hơn theo số món
 * Phụ thuộc: EQ, BAG, sel, en1, hero (bọc), g, s, cam, GY, fr, P, DT. */
(function(){
'use strict';
if(typeof EQ==='undefined'||typeof BAG==='undefined')return;
var CSS='.ce{position:relative}.ce .ufb{position:absolute;right:1px;top:0;z-index:4;font:700 10px/1 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.65);border-radius:4px;padding:1px 3px;pointer-events:none}'+
'.ce.u7{box-shadow:0 0 7px 2px #5fe0ff,inset 0 0 9px #5fe0ff99;animation:ufx7 1.5s ease-in-out infinite}.ce.u7 .ufb{background:#0a5a78;color:#bff6ff}'+
'.ce.u10{box-shadow:0 0 10px 3px #ffb030,inset 0 0 12px #ff6a20aa;animation:ufx10 .9s ease-in-out infinite}.ce.u10 .ufb{background:#8a2a08;color:#ffe9a0}'+
'.ce .ufr{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;border-radius:inherit}.ce .ufr::before{content:"";position:absolute;inset:-60%;background:linear-gradient(115deg,transparent 40%,rgba(170,250,255,.75) 50%,transparent 60%);animation:shn 2.2s linear infinite}'+
'.ce.u10 .ufr::before{background:linear-gradient(115deg,transparent 40%,rgba(255,200,90,.85) 50%,transparent 60%);animation-duration:1.3s}html[data-ql="2"] .ce .ufr::before{display:none}'+
'@keyframes ufx7{50%{box-shadow:0 0 12px 4px #8ff0ff,inset 0 0 12px #8ff0ffcc}}@keyframes ufx10{50%{box-shadow:0 0 18px 6px #ffd060,inset 0 0 16px #ff8a30}}'+
'#ufx{position:fixed;inset:0;z-index:45;pointer-events:none;overflow:hidden}#ufx .fl{position:absolute;inset:0;opacity:0;animation:ufxf 1.3s ease-out forwards}#ufx .rg{position:absolute;left:50%;top:46%;width:40px;height:40px;margin:-20px;border-radius:50%;border:4px solid;opacity:0;animation:ufxg 1.4s ease-out forwards}#ufx .sp{position:absolute;left:50%;top:46%;width:7px;height:7px;margin:-3px;border-radius:50%;opacity:0;animation:ufxs 1.5s ease-out forwards}'+
'#ufx .tx{position:absolute;left:0;right:0;top:30%;text-align:center;font:900 30px/1.2 Georgia,serif;letter-spacing:1px;opacity:0;animation:ufxt 1.9s ease-out forwards;text-shadow:0 0 14px currentColor,0 2px 0 #000}#ufx .tx small{display:block;font:600 14px system-ui,sans-serif;opacity:.9;margin-top:4px}'+
'@keyframes ufxf{0%{opacity:0}12%{opacity:1}100%{opacity:0}}@keyframes ufxg{0%{transform:scale(.3);opacity:1}100%{transform:scale(16);opacity:0}}@keyframes ufxs{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}@keyframes ufxt{0%{transform:scale(.4);opacity:0}18%{transform:scale(1.15);opacity:1}30%{transform:scale(1)}80%{opacity:1}100%{transform:translateY(-24px);opacity:0}}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* ---------- ô trang bị ---------- */
var raf=0,obs=null;
function kid(c,cl){for(var i=0;i<c.children.length;i++)if(c.children[i].className===cl)return c.children[i];return null}
function skin(){raf=0;try{var bag=document.getElementById('bag');if(!bag)return;
  bag.querySelectorAll('.ce[onclick^="pk("]').forEach(function(c){var m=/pk\('([be])',(\d+)\)/.exec(c.getAttribute('onclick')||'');if(!m)return;var it=m[1]==='b'?BAG[+m[2]]:EQ[+m[2]],u=(it&&it.u)|0,bd=kid(c,'ufb'),rg=kid(c,'ufr');
    c.classList.toggle('u7',u>=7&&u<10);c.classList.toggle('u10',u>=10);
    if(u>0){if(!bd){bd=document.createElement('b');bd.className='ufb';c.appendChild(bd)}if(bd.textContent!=='+'+u)bd.textContent='+'+u}else if(bd)bd.remove();
    if(u>=7){if(!rg){rg=document.createElement('i');rg.className='ufr';c.appendChild(rg)}}else if(rg)rg.remove()});
  if(obs)obs.takeRecords()}catch(e){}}
try{var b=document.getElementById('bag');if(b&&window.MutationObserver){obs=new MutationObserver(function(){if(!raf)raf=requestAnimationFrame(skin)});obs.observe(b,{childList:true,subtree:true})}}catch(e){}

/* ---------- bùng nổ khi lên +7 / +10 ---------- */
function burst(u,it){
  var low=(window.QL|0)>=2,gold=u>=10,c1=gold?'#ffd060':'#7ff0ff',c2=gold?'#ff5a20':'#ffffff',old=document.getElementById('ufx');if(old)old.remove();
  var o=document.createElement('div');o.id='ufx';var h=low?'':'<div class="fl" style="background:radial-gradient(circle at 50% 46%,'+c2+'cc 0,'+c1+'55 35%,transparent 70%)"></div>';
  for(var i=0;i<3;i++)h+='<div class="rg" style="border-color:'+(i%2?c2:c1)+';animation-delay:'+(i*.18)+'s"></div>';
  var n=low?8:gold?36:24;for(i=0;i<n;i++){var a=Math.random()*6.283,d=120+Math.random()*(gold?320:240);h+='<div class="sp" style="background:'+(i%3?c1:c2)+';box-shadow:0 0 8px '+c1+';--dx:'+Math.round(Math.cos(a)*d)+'px;--dy:'+Math.round(Math.sin(a)*d-60)+'px;animation-delay:'+(Math.random()*.25).toFixed(2)+'s"></div>'}
  h+='<div class="tx" style="color:'+c1+'">'+(gold?'🔥 +10 · THẦN KHÍ HIỂN HÓA':'✨ +7 · LINH QUANG HIỆN THẾ')+'<small>'+(it&&it.n?it.n:'')+'</small></div>';
  o.innerHTML=h;document.body.appendChild(o);
  try{var an=getComputedStyle(o.querySelector('.tx')).animationName;if(!an||an==='none'){[].slice.call(o.querySelectorAll('.fl,.rg,.sp')).forEach(function(x){x.remove()});o.querySelector('.tx').style.opacity=1}}catch(e){}setTimeout(function(){if(o.parentNode)o.remove()},2100);
  try{DT.push({x:P.x,y:190,s:gold?'🔥 Cường hóa +10!':'✨ Cường hóa +7!',c:c1,g:1,l:140})}catch(e){}}
if(typeof en1==='function'){var _en1=en1;en1=function(){var it=null,u0=0;try{it=sel&&sel.k==='e'?EQ[sel.i]:BAG[sel.i];u0=it?it.u|0:0}catch(e){}
  var r=_en1.apply(this,arguments);try{if(it&&(it.u|0)>u0&&(it.u===7||it.u===10))burst(it.u,it)}catch(e){}return r}}

/* ---------- hào quang nhân vật ---------- */
var cn=0,n7=0,n10=0,eqRef=null;
function aura(){
  if((window.QL|0)>=2)return;
  if(EQ!==eqRef||--cn<=0){eqRef=EQ;cn=30;n7=0;n10=0;for(var i=0;i<EQ.length;i++){var u=EQ[i]&&EQ[i].u|0;if(u>=10)n10++;else if(u>=7)n7++}}
  if(!n7&&!n10)return;var X=(P.x-cam)*s,gold=n10>0,c=gold?'255,190,70':'120,230,255',c2=gold?'255,80,30':'200,250,255',n=Math.min(6,n7+n10*2),t=fr;
  g.save();g.globalCompositeOperation='lighter';g.translate(X,GY);
  var q=g.createRadialGradient(0,-52*s,4*s,0,-52*s,(52+n*4)*s);q.addColorStop(0,'rgba('+c+','+(.16+n*.025)+')');q.addColorStop(1,'rgba('+c+',0)');g.fillStyle=q;g.beginPath();g.arc(0,-52*s,(52+n*4)*s,0,6.283);g.fill();
  var k=5+n*2;g.fillStyle='rgba('+c2+',.9)';for(var j=0;j<k;j++){var a=t*(gold?.05:.035)+j*6.283/k,r=(30+(j%3)*6)*s,y=-50*s+Math.sin(a*1.3+j)*34*s;g.globalAlpha=.55+.45*Math.sin(t*.12+j);g.beginPath();g.arc(Math.cos(a)*r,y,(1.6+(j%2))*s,0,6.283);g.fill()}
  if(gold){g.globalAlpha=1;for(j=0;j<6;j++){var p=((t*.018+j/6)%1),fx=(Math.sin(j*5.1)*22)*s,fy=-p*70*s;g.fillStyle='rgba(255,'+Math.round(200-p*140)+',40,'+(.5*(1-p))+')';g.beginPath();g.ellipse(fx,fy-6*s,(5-p*3)*s,(9-p*4)*s,0,0,6.283);g.fill()}}
  g.restore()}
if(typeof hero==='function'){var _hero=hero;hero=function(){_hero.apply(this,arguments);try{aura()}catch(e){}}}
window.UFX={burst:burst,skin:skin};
})();
