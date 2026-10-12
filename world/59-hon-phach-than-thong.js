/* ===== ☸️🐉⚡👹 THẦN THÔNG HỒN PHÁCH (BUFF) + HỒN PHÁCH RƠI TỪ QUÁI (world/59-hon-phach-than-thong.js) =====
 * Mỗi hồn phách (world/57-hon-phach.js) đi kèm 1 thần thông BUFF riêng, có ngay khi chọn hồn phách:
 *   Phật Tôn   ☸️ Đại Nhật Chân Thân — CHỦ ĐỘNG: BẤT TỬ 3s + tăng 10% sát thương trong 10s. Hồi chiêu 25s.
 *   Yêu Hoàng  🐉 Vạn Yêu Quy Tâm    — NỘI TẠI: tăng 20% sát thương mọi kỹ năng TRIỆU HỒI (thú triệu hồi PETS, quỷ ám / linh hồn của Ý Cảnh Ma Đạo).
 *   Tiên Đế    ⚡ Tiên Đạo Thánh Vận — NỘI TẠI: tăng 20% sát thương mọi kỹ năng TIÊN TU (thần thông Ý Cảnh Tiên Đạo + tiên thuật).
 *   Minh Vương 👹 U Minh Hồi Nguyên  — CHỦ ĐỘNG: XOÁ toàn bộ thời gian hồi chiêu của mọi kỹ năng đang có (kỹ năng thường, tiên thuật, thần thông hệ,
 *                                       thần thông Ý Cảnh). Hồi chiêu 25s.
 * Tu vi hồn phách càng cao càng mạnh: giá trị buff nhân (1 + CF.scale × cảnh giới hồn phách) — Sơ Khai đúng số liệt kê, Đại Thừa ×1,8. Đặt scale=0 để cố định.
 * MẢNH ĐÚC THẦN THỂ: mọi Boss rơi 1% (HONP.cfg.shardChance), ghép/đúc ở Bế Quan Đài (world/57: craft/anvil).
 * HỒN PHÁCH RƠI: quái thường rơi 1, Boss rơi 5 (HONP.cfg.dropN/dropB) — bay về phía nhân vật như tiền nhặt, cộng vào túi hồn phách; vào Bế Quan Đài nạp để tăng tu vi.
 * Nút #hp-bar (chỉ hiện với 2 hồn phách có kỹ năng chủ động, xếp vào #sk-side của world/52). Tự dùng khi bật AUTO (cách của world/49).
 * Móc: dm (nhân sát thương khi đang buff), ZC.shd (bất tử), ZS.zf (tiên thuật), PETS (p.m), world/49 mulOf (HONSK.skMul), world/34 TTHONG.cdReset, drop (rơi hồn phách).
 * Phụ thuộc: HONP (57), dm/step/cast/drop/ZC/ZS/P/E/FX/DT/cd/cz (engine). Chỉnh số: khối CF. */
(function(){
'use strict';
if(typeof PS==='undefined'||!window.HONP||typeof dm!=='function')return;
var CF={scale:.10,cd:25,
 sk:[
  {n:'Đại Nhật Chân Thân',i:'☸️',c:'#ffd76a',bg:'#3a2a08',act:1,inv:3,dur:10,dmg:.10,d:'Đại Nhật chân thân: BẤT TỬ 3 giây và tăng 10% sát thương trong 10 giây. Hồi chiêu 25 giây.'},
  {n:'Vạn Yêu Quy Tâm',i:'🐉',c:'#b9a6ff',bg:'#1c1238',summon:.20,d:'Nội tại: tăng 20% sát thương mọi kỹ năng triệu hồi (thú triệu hồi, quỷ ám, linh hồn).'},
  {n:'Tiên Đạo Thánh Vận',i:'⚡',c:'#fff3b0',bg:'#2a2a3a',tien:.20,d:'Nội tại: tăng 20% sát thương mọi kỹ năng tiên tu (thần thông Tiên Đạo, tiên thuật).'},
  {n:'U Minh Hồi Nguyên',i:'👹',c:'#ff5a5a',bg:'#330a0e',act:1,d:'Xoá toàn bộ thời gian hồi chiêu của mọi kỹ năng đang có. Hồi chiêu 25 giây.'}
 ]};
var cdU=0,inStep=0,bar=null,btn=null,dmgUntil=0,dmgMul=1,invUntil=0,hp0=0;
function nf(v){return v.toFixed(2).replace('.',',')}
function soul(){try{var d=HONP.chosen();return d?{d:d,t:d.t,r:d.r,S:CF.sk[d.t]}:null}catch(e){return null}}
function sc(d){return 1+CF.scale*d.r}
function alive(){return E.filter(function(e){return e.hp>0&&!e.dead})}
function near(r){return alive().some(function(e){return Math.abs(e.x-P.x)<(r||640)})}
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#ffe9a0',g:1,l:110})}catch(e){}}
function sx(){return(P.x-(typeof cam!=='undefined'?cam:0))*s}
function isBoss(e){return !!e&&(e.b>0||e.k==='boss'||e.mt||e.ks)}

/* ---------- hệ số nội tại ---------- */
function skMul(path){var o=soul();if(!o)return 1;
  if(o.t===1&&path==='m')return 1+CF.sk[1].summon*sc(o.d);
  if(o.t===2&&path==='t')return 1+CF.sk[2].tien*sc(o.d);return 1}
function tienMul(){var o=soul();return o&&o.t===2?1+CF.sk[2].tien*sc(o.d):1}
function summonMul(){var o=soul();return o&&o.t===1?1+CF.sk[1].summon*sc(o.d):1}

/* ---------- móc engine ---------- */
var _dm=dm;dm=function(){var a=[].slice.call(arguments);if(dmgMul>1&&Date.now()<dmgUntil&&typeof a[1]==='number')a[1]*=dmgMul;return _dm.apply(this,a)};
try{if(typeof ZC!=='undefined'&&ZC.shd){var _shd=ZC.shd;ZC.shd=function(){return Date.now()<invUntil?0:_shd.apply(this,arguments)}}}catch(e){}
try{if(typeof ZS!=='undefined'&&ZS.zf&&!ZS.__hp59){var _zf=ZS.zf;ZS.zf=function(i,col,f){return _zf.call(this,i,col,f*tienMul())};ZS.__hp59=1}}catch(e){}
function post(){      /* sau mỗi step: bất tử giữ HP; nội tại triệu hồi nhân p.m 1 lần cho mỗi thú */
  try{
    if(Date.now()<invUntil){hp0=Math.max(hp0,Math.min(P.hp,mx()));if(P.hp<hp0)P.hp=hp0}
    var k=summonMul();if(k>1&&typeof PETS!=='undefined')PETS.forEach(function(p){if(p&&!p._hs&&typeof p.m==='number'){p.m*=k;p._hs=1}});
  }catch(e){}}
if(typeof step==='function'){var _step=step;step=function(){inStep=1;try{var r=_step.apply(this,arguments);post();return r}finally{inStep=0}}}

/* ---------- hiệu ứng ---------- */
function ring(wx,rad,life,stroke,fill,add){FX.push({x:wx,l:life,m:life,fn:function(f,p,X,gy){var k=.25+.75*Math.min(1,p*1.6);g.save();if(add)g.globalCompositeOperation='lighter';g.translate(X,gy-3*s);g.scale(1,.28);g.globalAlpha=1-p;
  if(fill){g.fillStyle=fill;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.fill()}g.strokeStyle=stroke;g.lineWidth=5*s;g.beginPath();g.arc(0,0,rad*s*k,0,6.283);g.stroke();g.restore()}})}
function aura(){   /* hào quang Đại Nhật bám theo nhân vật: 3s đầu bầu ánh sáng rực (bất tử), sau đó viền vàng mỏng đến hết 10s */
  var L=Math.round(CF.sk[0].dur*60);
  FX.push({x:P.x,l:L,m:L,fn:function(f,p,X,gy){var now=Date.now(),inv=now<invUntil,cx=sx(),cy=gy-34*s,r=(inv?58:44)*s;g.save();g.globalCompositeOperation='lighter';
    var q=g.createRadialGradient(cx,cy,r*.2,cx,cy,r*1.25);q.addColorStop(0,inv?'rgba(255,240,170,.55)':'rgba(255,215,106,.22)');q.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=q;g.beginPath();g.arc(cx,cy,r*1.25,0,6.283);g.fill();
    g.strokeStyle=inv?'rgba(255,250,210,.95)':'rgba(255,215,106,.55)';g.lineWidth=(inv?4:2)*s;g.beginPath();g.arc(cx,cy,r,0,6.283);g.stroke();
    if(inv){for(var k=0;k<8;k++){var a=k*.785+now*.002;g.beginPath();g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);g.lineTo(cx+Math.cos(a)*r*1.35,cy+Math.sin(a)*r*1.35);g.stroke()}}
    g.restore()}})}
function flash(c,l){try{if(typeof screenFlash==='function')screenFlash(c,l)}catch(e){}}

/* ---------- thi triển (2 hồn phách chủ động) ---------- */
function resetCds(){
  var n=0;
  try{if(typeof cd!=='undefined'){for(var i=0;i<cd.length;i++){if(cd[i]>0)n++;cd[i]=0}}}catch(e){}
  try{if(typeof cz!=='undefined'){for(var j=0;j<cz.length;j++){if(cz[j]>0)n++;cz[j]=0}}}catch(e){}
  try{if(window.TTHONG&&TTHONG.cdReset)TTHONG.cdReset()}catch(e){}
  try{if(window.YCTT&&YCTT.cd){for(var k=0;k<YCTT.cd.length;k++){if(YCTT.cd[k]>Date.now())n++;YCTT.cd[k]=0}}}catch(e){}
  return n}
function ready(){var o=soul();if(!o||!o.S.act||typeof started==='undefined'||!started||over||vil)return null;return o}
function castB(){
  var o=ready();if(!o)return false;var t=Date.now();if(cdU>t)return false;
  cdU=t+CF.cd*1000;var k=sc(o.d);
  if(o.t===0){
    var S=o.S;invUntil=t+S.inv*1000;dmgUntil=t+S.dur*1000;dmgMul=1+S.dmg*k;hp0=P.hp;
    ring(P.x,150,28,'#fff3b0','rgba(255,215,106,.25)',true);aura();flash('#ffe27a',6);
    say(S.i+' '+S.n+': bất tử '+S.inv+'s · +'+Math.round(S.dmg*k*100)+'% sát thương '+S.dur+'s',S.c)
  }else{
    var n=resetCds();ring(P.x,170,26,'#ff5a7a','rgba(120,10,30,.25)',true);ring(P.x,110,20,'#2a0010');flash('#8a0a1a',5);
    say(o.S.i+' '+o.S.n+': xoá toàn bộ hồi chiêu'+(n?' ('+n+' kỹ năng)':''),o.S.c)
  }
  return true}
function autoB(){var o=ready();if(!o||cdU>Date.now())return false;
  if(o.t===0){if(!near(560))return false}
  else{var busy=0;try{cd.forEach(function(v){if(v>60)busy++})}catch(e){}try{cz.forEach(function(v){if(v>60)busy++})}catch(e){}if(busy<2)return false}
  return castB()}
if(typeof cast==='function'){var _cast=cast;cast=function(i){if(inStep&&typeof auto!=='undefined'&&auto&&!P.pe&&!P.act&&autoB())return false;return _cast.apply(this,arguments)}}

/* ---------- nút #hp-bar ---------- */
function css(){var c=document.createElement('style');
  c.textContent='#hp-bar{display:none;flex-direction:column;gap:6px;z-index:2;contain:layout style}#hp-bar.fx{position:fixed;right:62px;top:calc(124px + env(safe-area-inset-top,0px))}'
  +'#hp-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid;color:#fff;font-size:21px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}'
  +'#hp-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#fff}#hp-bar button.cd{opacity:.6}#hp-bar button.on{animation:hpb 1s ease-in-out infinite alternate}@keyframes hpb{to{filter:brightness(1.6)}}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='hp-bar';btn=document.createElement('button');
  btn.onpointerdown=function(e){e.stopPropagation();e.preventDefault();castB()};btn.addEventListener('click',function(e){e.stopPropagation()});bar.appendChild(btn);document.body.appendChild(bar)}
setInterval(function(){if(document.hidden)return;try{
  if(!bar&&document.body)build();if(!bar)return;
  var o=soul(),act=!!o&&!!o.S.act&&typeof started!=='undefined'&&started&&!(typeof vil!=='undefined'&&vil);bar.style.display=act?'flex':'none';if(!act)return;
  var w=document.getElementById('sk-side');if(w){if(bar.parentNode!==w){w.appendChild(bar);bar.classList.remove('fx')}}else bar.classList.add('fx');
  var t=Date.now(),rem=Math.max(0,Math.ceil((cdU-t)/1000)),bf=o.t===0?Math.max(0,Math.ceil((dmgUntil-t)/1000)):0,key=o.t+'|'+rem+'|'+bf;
  if(btn._k!==key){btn._k=key;btn.className=(bf?'on':'')+(rem&&!bf?' cd':'');btn.style.borderColor=o.S.c;btn.style.background=o.S.bg;btn.style.boxShadow='0 0 9px '+o.S.c;btn.title=o.S.n;btn.innerHTML=o.S.i+(bf?'<small>'+bf+'s</small>':rem?'<small>'+rem+'s</small>':'')}
}catch(e){}},250);

/* ---------- hồn phách rơi từ quái: bay về phía nhân vật rồi cộng vào túi hồn phách ---------- */
function orb(e,i,col){
  FX.push({x:e.x,l:40,m:40,fn:function(f,p,X,gy){var sx0=X,sy0=gy-50*s,tx=sx(),ty=gy-38*s,u=Math.min(1,Math.max(0,(p*40-i*3)/30));if(u<=0)return;
    var ex=u*u*(3-2*u),x=sx0+(tx-sx0)*ex,y=sy0+(ty-sy0)*ex-Math.sin(ex*3.1416)*34*s;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=1-Math.max(0,(u-.85)/.15);
    var q=g.createRadialGradient(x,y,1,x,y,9*s);q.addColorStop(0,'#fff');q.addColorStop(.4,col);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,9*s,0,6.283);g.fill();g.restore()}});
  setTimeout(function(){try{HONP.collect(1)}catch(x){}},640+i*70)}
if(typeof drop==='function'){var _drop=drop;drop=function(e){var r=_drop.apply(this,arguments);
  try{var o=soul();if(o&&e&&typeof e.x==='number'&&!e.arena){var n=isBoss(e)?HONP.cfg.dropB:HONP.cfg.dropN;if(FX.length<80)for(var i=0;i<n;i++)orb(e,i,o.S.c);else HONP.collect(n);
    if(isBoss(e)&&R()<HONP.cfg.shardChance){HONP.shard(1);DT.push({x:e.x,y:210,s:'🧩 +1 Mảnh Đúc Thần Thể',c:'#ffb050',g:1,l:110})}
    DT.push({x:e.x,y:(isBoss(e)?170:130),s:'🔮 +'+n,c:o.S.c,l:42})}}catch(x){}return r}}

/* ---------- thông tin trong mục Hồn Phách (Tu tiên) và bảng Bế Quan Đài ---------- */
function vals(o){var k=sc(o.d),S=o.S;
  if(o.t===0)return'bất tử '+S.inv+'s · +'+Math.round(S.dmg*k*100)+'% sát thương '+S.dur+'s · hồi '+CF.cd+'s';
  if(o.t===1)return'+'+Math.round(S.summon*k*100)+'% sát thương kỹ năng triệu hồi (nội tại)';
  if(o.t===2)return'+'+Math.round(S.tien*k*100)+'% sát thương kỹ năng tiên tu (nội tại)';
  return'xoá mọi hồi chiêu · hồi '+CF.cd+'s'}
function line(){var o=soul();if(!o)return'';return '<div style="font-size:12px;margin-top:5px;color:'+o.S.c+'">'+o.S.i+' <b>'+o.S.n+'</b> · '+vals(o)+'</div>'}
function info(){
  var o=soul();if(!o)return'';
  return '<div style="border:1px solid '+o.S.c+';border-radius:9px;padding:8px;margin:6px 0 8px;background:'+o.S.bg+'"><div style="font-size:14px"><b style="color:'+o.S.c+'">'+o.S.i+' '+o.S.n+'</b> <span style="font-size:11px;opacity:.75">· thần thông hồn phách ('+(o.S.act?'chủ động':'nội tại')+')</span></div>'+
   '<div style="font-size:12.5px;margin:3px 0;opacity:.92">'+o.S.d+'</div>'+
   '<div style="font-size:12.5px">Hiện tại: <b>'+vals(o)+'</b></div>'+
   '<div style="font-size:11.5px;opacity:.7;margin-top:2px">Tu vi hồn phách càng cao (cảnh giới càng lớn) hiệu lực càng mạnh (×'+nf(sc(o.d))+').'+(o.S.act?' Dùng ở màn chiến đấu: nút bên phải hoặc tự dùng khi bật AUTO.':'')+'</div></div>'}

window.HONSK={cfg:CF,skMul:skMul,tienMul:tienMul,summonMul:summonMul,cast:castB,resetCds:resetCds,line:line,info:info,cd:function(){return Math.max(0,cdU-Date.now())},
  buff:function(){var t=Date.now();return{dmg:t<dmgUntil?dmgMul:1,inv:t<invUntil}}};
})();
