/* ===== 🔮 PHÁP BẢO BỔN MỆNH (world/48-phap-bao-bon-menh.js) =====
 * Chỉ nhân vật ĐÃ THÀNH ĐẠO THỂ (HDAO.on(), Đạo Cảnh) mới mở khoá. Ở ô nhân vật có thẻ "Pháp Bảo Bổn Mệnh" → bảng luyện.
 * 4 pháp bảo, mỗi cái: 1 thuộc tính riêng (cộng theo cấp luyện) + 1 kỹ năng BỊ ĐỘNG + 1 kỹ năng CHỦ ĐỘNG. Pháp bảo bay lơ lửng SAU LƯNG nhân vật.
 *   🗡️ Kiếm Linh  : thuộc tính +sát thương · bị động: tự phóng 1 phi kiếm mỗi 6s · chủ động: phóng 5 phi kiếm lao về địch.
 *   🏺 Hồ Lô      : thuộc tính +sức mạnh quái/thú triệu hồi · bị động: hồi máu theo giây · chủ động: triệu 4 quái vật tấn công địch, tồn tại 10s.
 *   🚩 Hồn Phiên  : thuộc tính +hiệu ứng kỹ năng (sát thương DoT, tỉ lệ choáng/băng, thời gian hiệu ứng) · bị động: hạ gục địch hồi máu/MP · chủ động: bóng ma trên tối đa 5 địch, sát thương theo thời gian.
 *   🪓 Cự Phủ     : thuộc tính +sát thương bạo kích · bị động: càng mất máu càng mạnh · chủ động: cự phủ khổng lồ bổ xuống đất, gây sát thương + choáng.
 * Dữ liệu: PS[cur].fb = {t: loại đang đeo (-1 chưa), lv:[cấp 4 loại; 0 = chưa luyện hoá], c:[số lần đã thi triển kỹ năng chủ động của từng loại]}. Lưu theo save hiện có (PS được sv() lưu sẵn).
 * Luyện hoá 1 loại: CF.bindGold vàng (cấp 1). Cấp pháp bảo = cấp kỹ năng, tối đa CF.max=10.
 * Lên cấp n→n+1: (1) thi triển kỹ năng chủ động đủ CF.castBase·2^(n-1) lần (1000, 2000, 4000...; mỗi loại đếm riêng, dư được giữ lại), (2) trả CF.ltBase·n Linh Thạch (50, 100, 150...; cần đăng nhập, trừ qua LT.spend). Đổi pháp bảo đã luyện hoá: miễn phí.
 * Cách làm (không sửa engine): bọc twB (cộng chỉ số qua SX: dmgp/cdmg/dotd/stnc/frzc), dm (bị động Cự Phủ, tăng sức mạnh thú triệu hồi trong pstep),
 *   step (cập nhật hiệu ứng), ZC.aura (vẽ sau lưng nhân vật), ZC.ui (thẻ ở ô nhân vật), ZC.kill, ZC.zauto (tự dùng khi bật AUTO).
 * Nút chủ động #fb-bar (bên trái cột Thần Thông) + phím F. Chỉnh số liệu: CF, FB. Không vẽ/không cập nhật hiệu ứng trong Đấu Trường và Làng (chỉ số cộng vẫn tính).
 * Phụ thuộc: PS, cur, P, E, PETS, DT, PT, FX, ZC, HDAO, dm, atk, SX, mx, mm, sv, ST (11-status-effects), step, init. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof ZC==='undefined'||typeof dm!=='function'||!window.HDAO)return;
var CF={max:10,bindGold:3000000,castBase:1000,ltBase:50,cd:14,mp:45,
  sw:{n:5,base:.9,lv:.1,pas:.8,pasEvery:360,range:720},
  mn:{n:4,life:600,base:.8,lv:.08,cd:38},
  gh:{n:5,dur:360,tick:30,base:.3,lv:.03,range:760},
  ax:{base:5,lv:.5,r:330,fall:22}};
var FB=[
 {n:'Kiếm Linh',i:'🗡️',col:'#6fd0ff',attr:'Tăng sát thương',pa:{n:'Linh Kiếm Hộ Chủ',d:'Mỗi 6 giây, Kiếm Linh tự phóng 1 phi kiếm đánh địch gần nhất.'},ac:{n:'Ngũ Kiếm Phi Thiên',d:'Phóng 5 thanh phi kiếm lao về phía địch.'}},
 {n:'Hồ Lô Dưỡng Linh',i:'🏺',col:'#ffb84a',attr:'Tăng sức mạnh quái triệu hồi',pa:{n:'Dưỡng Linh Khí',d:'Hồ lô nhả linh khí, hồi máu mỗi giây.'},ac:{n:'Vạn Quỷ Xuất Bình',d:'Triệu '+CF.mn.n+' quái vật tấn công mục tiêu, tồn tại 10 giây.'}},
 {n:'Hồn Phiên',i:'🚩',col:'#b585ff',attr:'Tăng hiệu ứng kỹ năng',pa:{n:'Hấp Hồn',d:'Hạ gục địch: hút hồn, hồi máu và MP.'},ac:{n:'U Minh Ảo Ảnh',d:'Gây bóng ma lên tối đa '+CF.gh.n+' địch, gây sát thương theo thời gian (6 giây).'}},
 {n:'Cự Phủ',i:'🪓',col:'#ff8a3a',attr:'Tăng sát thương bạo kích',pa:{n:'Huyết Chiến',d:'Càng mất nhiều máu, sát thương càng tăng.'},ac:{n:'Khai Thiên Phủ',d:'Cự phủ khổng lồ bổ mạnh xuống đất, gây sát thương diện rộng và CHOÁNG.'}}];

/* ---------- tiện ích ---------- */
function on(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function D(){var p=PS[cur];if(!p.fb||typeof p.fb!=='object')p.fb={t:-1,lv:[0,0,0,0]};if(!p.fb.lv||p.fb.lv.length<4)p.fb.lv=[0,0,0,0];if(!p.fb.c||p.fb.c.length<4)p.fb.c=[0,0,0,0];return p.fb}
function eq(){try{if(!on())return -1;var d=PS[cur].fb;if(!d||!d.lv)return -1;return d.t>=0&&d.lv[d.t]>0?d.t:-1}catch(e){return -1}}
function LV(){var t=eq();return t<0?0:PS[cur].fb.lv[t]}
function nf(n){return (Number(n)||0).toLocaleString('vi-VN')}
function say(t){try{DT.push({x:P.x,y:170,s:t,g:1,l:120})}catch(e){}}
function save(){try{sv()}catch(e){}try{if(typeof bo!=='undefined'&&bo&&typeof ui==='function')ui()}catch(e){}}
function rgba(h,a){var n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function V(n){try{return(0,eval)('typeof '+n+'===\"function\"?'+n+':null')}catch(e){return null}}
var FC={};function F(n){return function(){var f=FC[n]===undefined?(FC[n]=V(n)):FC[n];if(f)try{return f.apply(null,arguments)}catch(e){}}}
function bossE(e){return e.b>=2||e.k==='boss'}
function act(){return E.filter(function(e){return e.in<=0&&e.hp>0})}
function nearL(r){var a=act().filter(function(e){return Math.abs(e.x-P.x)<(r||700)});a.sort(function(x,y){return Math.abs(x.x-P.x)-Math.abs(y.x-P.x)});return a}
function hh(e){return (e.hh||100)*(typeof SZ!=='undefined'?SZ:1)}
function apos(){var d=P.d||1;return{x:P.x-d*54,y:118+Math.sin(fr*.05)*6}}
function hit(e,m){var f=typeof SKF!=='undefined';if(f)SKF=1;try{dm(e,m,0)}finally{if(f)SKF=0}}
function cost(l){return CF.ltBase*l}
function need(l){return CF.castBase*Math.pow(2,l-1)}
function ltHave(){try{return window.LT&&LT.logged&&LT.logged()?(LT.get()|0):0}catch(e){return 0}}
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}

/* ---------- Thuộc tính theo cấp luyện ---------- */
function stat(t,l){return [{dmgp:4*l},{pet:6*l},{dotd:8*l,stnc:1.5*l,frzc:1.5*l,ext:4*l},{cdmg:6*l}][t]}
function BON(k){var t=eq();if(t<0)return 0;var o=stat(t,PS[cur].fb.lv[t]);return o[k]||0}
if(typeof twB==='function'){var _tw=twB;twB=function(k){var v=_tw.apply(this,arguments);try{if(k==='dmgp'||k==='cdmg'||k==='dotd'||k==='stnc'||k==='frzc')v+=BON(k)}catch(e){}return v}}
function petB(){return BON('pet')/100}
function extB(){return BON('ext')/100}

/* ---------- Bị động + tăng sức mạnh thú triệu hồi (chỉ trong pstep) ---------- */
var PM=0,_dm=dm;
dm=function(e,m,sl){try{var t=eq();if(t===3){var q=1-P.hp/Math.max(1,mx());if(q>0)m*=1+(.12+.01*LV())*q}if(PM&&t===1)m*=1+petB()}catch(x){}return _dm.call(this,e,m,sl)};
if(typeof window.pstep==='function'){var _ps=window.pstep;window.pstep=function(){PM=1;try{return _ps.apply(this,arguments)}finally{PM=0}}}
var z0={kill:ZC.kill,zauto:ZC.zauto,ui:ZC.ui};
if(typeof z0.kill==='function')ZC.kill=function(){var r=z0.kill.apply(this,arguments);try{if(eq()===2&&started&&!over){var l=LV();P.hp=Math.min(mx(),P.hp+mx()*(.015+.001*l));P.mp=Math.min(mm(),P.mp+mm()*.01)}}catch(e){}return r};

/* ---------- Thực thể hiệu ứng ---------- */
var SW=[],GH=[],MN=[],AX=[],RG=[],pul=0,pasT=0,LS=0,cdT=0;
function clearAll(){SW=[];GH=[];MN=[];AX=[];RG=[];pul=0;pasT=0}
function spawnSw(tg,delay,mul){SW.push({tg:tg,t:-delay,n:13,mul:mul,x0:0,y0:0,tx:undefined,ty:0,tr:[]})}
function puff(x,y,col,n){try{for(var i=0;i<n;i++)PT.push({x:x,y:y,vx:(Math.random()-.5)*5,vy:Math.random()*-3.5,l:24,c:col})}catch(e){}}

/* ---------- Kỹ năng chủ động ---------- */
function fireSw(){var l=LV(),a=nearL(CF.sw.range);if(!a.length)return false;for(var k=0;k<CF.sw.n;k++)spawnSw(a[k%a.length],k*4,CF.sw.base+CF.sw.lv*l);return true}
function fireMn(){var a=nearL(900);if(!a.length)return false;MN=[];var l=LV(),d=P.d||1;for(var k=0;k<CF.mn.n;k++)MN.push({x:P.x+d*(40+k*26),i:k,l:CF.mn.life,L:CF.mn.life,cd:10+k*6,atk:0,face:d,walk:0,sp:12,mul:CF.mn.base+CF.mn.lv*l});
  puff(P.x+d*80,60,'#ffd88a',14);return true}
function fireGh(){var l=LV(),a=nearL(CF.gh.range).slice(0,CF.gh.n);if(!a.length)return false;var dur=Math.round(CF.gh.dur*(1+extB()));
  a.forEach(function(e){var g0=null;for(var i=0;i<GH.length;i++)if(GH[i].e===e)g0=GH[i];if(g0){g0.t=0;g0.dur=dur;g0.mul=CF.gh.base+CF.gh.lv*l}else GH.push({e:e,t:0,dur:dur,mul:CF.gh.base+CF.gh.lv*l,fl:0,ph:Math.random()*6})});return true}
function fireAx(){var a=nearL(640);if(!a.length)return false;var cx=a[0].x;AX.push({cx:cx,t:0,n:CF.ax.fall,mul:CF.ax.base+CF.ax.lv*LV(),done:0});return true}
function impact(w){var cx=w.cx,fl=F('flash'),sk=F('shake'),gw=F('gwave');try{sk(9);fl('#ff8a3a',8);gw(cx,'#ff8a3a',CF.ax.r,26)}catch(e){}
  act().forEach(function(e){if(Math.abs(e.x-cx)<CF.ax.r){hit(e,w.mul);try{if(window.ST&&ST.apply)ST.apply(e,'stn');else e.sl=150}catch(x){}}});
  RG.push({x:cx,t:0,n:26});puff(cx,30,'#ffb070',18);puff(cx,30,'#fff1c0',8)}
var SKL=[fireSw,fireMn,fireGh,fireAx];
function castFB(auto){
  var t=eq();if(t<0||!started||over||vil)return false;var now=Date.now();
  if(cdT>now)return false;if(P.mp<CF.mp){if(!auto)say('Không đủ MP');return false}
  if(!nearL(900).length){if(!auto)say('Không có địch trong tầm');return false}
  if(!SKL[t]())return false;
  P.mp-=CF.mp;cdT=now+CF.cd*1000;pul=26;if(!auto)say(FB[t].i+' '+FB[t].ac.n);
  try{var fb=D();fb.c[t]=(fb.c[t]|0)+1;if(ov&&ov.style.display==='flex'&&!busy)render()}catch(e){}return true}

/* ---------- Cập nhật mỗi khung hình (gọi trong step) ---------- */
function dot(e,mul){var d=atk()*mul*(1+SX('dotd')/100);d=Math.max(1,Math.round(Math.min(d,(e.max||d)*(bossE(e)?.012:.08))));e.hp-=d;DT.push({x:e.x,y:hh(e),s:'👻'+d,c:'#cda8ff',l:40})}
function extend(){var ex=extB();if(!ex)return;E.forEach(function(e){var T=e.stt;if(!T||e.in>0||e.hp<=0)return;var p=e._fbp||(e._fbp={});['brn','psn','stn','frz'].forEach(function(k){var v=T[k]|0;if(v>0){if(v>(p[k]|0)){T[k]=Math.round(v*(1+ex));v=T[k]}p[k]=v}else p[k]=0})})}
function tick(){
  var t=eq();if(pul>0)pul--;
  if(t===0&&++pasT>=CF.sw.pasEvery){pasT=0;var a=nearL(CF.sw.range);if(a.length)spawnSw(a[0],0,CF.sw.pas+.05*LV())}
  if(t===2)extend();
  SW.forEach(function(w){
    if(w.t<0){w.t++;var ap=apos();w.x0=ap.x;w.y0=ap.y;return}
    w.t++;var tg=w.tg;if(tg&&tg.hp>0&&tg.in<=0){w.tx=tg.x;w.ty=hh(tg)*.55}else if(w.tx===undefined){w.dead=1;return}
    var u=Math.min(1,w.t/w.n),e=u*u;w.px=w.x0+(w.tx-w.x0)*e;w.py=w.y0+(w.ty-w.y0)*e+Math.sin(u*Math.PI)*16;
    w.ang=Math.atan2(-(w.ty-w.y0)*.9,(w.tx-w.x0))+Math.PI/2;
    w.tr.push({x:w.px,y:w.py});if(w.tr.length>5)w.tr.shift();
    if(w.t>=w.n){var h=(tg&&tg.hp>0&&tg.in<=0)?tg:act().filter(function(q){return Math.abs(q.x-w.tx)<160})[0];
      if(h){hit(h,w.mul);try{FX.push({t:'sl',x:h.x,br:0,c:'#bfefff',l:10,m:10})}catch(x){}puff(h.x,hh(h)*.5,'#bfefff',6)}w.dead=1}});
  SW=SW.filter(function(w){return !w.dead});
  GH.forEach(function(w){var e=w.e;if(!e||e.hp<=0||e.in>0||E.indexOf(e)<0){w.dead=1;return}w.t++;if(w.fl>0)w.fl--;if(w.t%CF.gh.tick===0){dot(e,w.mul);w.fl=6}if(w.t>=w.dur)w.dead=1});
  GH=GH.filter(function(w){return !w.dead});
  var pb=petB()*(t===1?1:0),ac=act();
  MN.forEach(function(m){
    m.l--;if(m.sp>0)m.sp--;if(m.l<=0){m.dead=1;return}
    var tg=null,bd=900;ac.forEach(function(q){var d=Math.abs(q.x-m.x);if(d<bd){bd=d;tg=q}});
    if(m.cd>0)m.cd--;if(m.atk>0)m.atk--;
    if(tg){var dx=tg.x-m.x;m.face=dx<0?-1:1;if(Math.abs(dx)>46){m.x+=m.face*3.4;m.walk++}else if(m.cd<=0){m.cd=CF.mn.cd;m.atk=10;try{dm(tg,m.mul*(1+pb))}catch(x){}puff(tg.x,hh(tg)*.4,FB[1].col,4)}}
    else{var tx=P.x-(P.d||1)*(70+m.i*34);m.x+=(tx-m.x)*.06;m.walk++}});
  MN=MN.filter(function(m){return !m.dead});
  AX.forEach(function(w){w.t++;if(!w.done&&w.t>=w.n){w.done=1;impact(w)}if(w.t>w.n+44)w.dead=1});
  AX=AX.filter(function(w){return !w.dead});
  RG.forEach(function(r){r.t++});RG=RG.filter(function(r){return r.t<r.n})}

var _step=step;
step=function(){_step.apply(this,arguments);try{LS=Date.now();if(vil||!started){if(SW.length||GH.length||MN.length||AX.length||RG.length)clearAll();return}if(over){clearAll();return}if(on())tick()}catch(e){}};
if(typeof init==='function'){var _init=init;init=function(){clearAll();return _init.apply(this,arguments)}}
ZC.zauto=function(){var r=z0.zauto?z0.zauto.apply(this,arguments):undefined;try{if(eq()>=0&&started&&!over&&!vil)castFB(true)}catch(e){}return r};

/* ---------- Vẽ (sau lưng nhân vật) ---------- */
var PI2=Math.PI*2;
function X(wx){return (wx-cam)*s}
function Y(h){return GY-h*s}
function blade(u,c1,c2){g.beginPath();g.moveTo(0,-34*u);g.lineTo(4.6*u,-12*u);g.lineTo(3.6*u,8*u);g.lineTo(-3.6*u,8*u);g.lineTo(-4.6*u,-12*u);g.closePath();
  var q=g.createLinearGradient(-5*u,0,5*u,0);q.addColorStop(0,c2);q.addColorStop(.5,c1);q.addColorStop(1,c2);g.fillStyle=q;g.fill();g.lineWidth=.8*u;g.strokeStyle='rgba(255,255,255,.75)';g.stroke();
  g.fillStyle='#d9b45a';g.fillRect(-9*u,8*u,18*u,3*u);g.fillStyle='#5a3a22';g.fillRect(-1.8*u,11*u,3.6*u,12*u);g.fillStyle='#d9b45a';g.beginPath();g.arc(0,25*u,2.6*u,0,PI2);g.fill()}
function gourd(u,tm,col){var q=g.createLinearGradient(-16*u,0,16*u,0);q.addColorStop(0,'#8a4a1a');q.addColorStop(.45,'#e8a040');q.addColorStop(1,'#7a3a12');g.fillStyle=q;
  g.beginPath();g.ellipse(0,9*u,16*u,15*u,0,0,PI2);g.fill();g.beginPath();g.ellipse(0,-12*u,10*u,10*u,0,0,PI2);g.fill();g.fillRect(-6*u,-6*u,12*u,8*u);
  g.fillStyle='#6a3a1a';g.fillRect(-4*u,-28*u,8*u,7*u);g.strokeStyle='#ffd76a';g.lineWidth=1.6*u;g.beginPath();g.moveTo(-8*u,-5*u);g.quadraticCurveTo(0,-1*u,8*u,-5*u);g.stroke();
  g.strokeStyle=rgba(col,.9);g.lineWidth=1.2*u;g.beginPath();g.arc(0,9*u,7*u,0,PI2);g.stroke();
  g.globalCompositeOperation='lighter';for(var i=0;i<3;i++){var ph=(tm*.02+i/3)%1;g.fillStyle=rgba(col,.7*(1-ph));g.beginPath();g.arc(Math.sin(i*2.1+tm*.05)*5*u,-30*u-ph*20*u,(2.6-ph*1.4)*u,0,PI2);g.fill()}g.globalCompositeOperation='source-over'}
function flag(u,tm,col){g.strokeStyle='#6a4a2a';g.lineWidth=2.4*u;g.beginPath();g.moveTo(0,-36*u);g.lineTo(0,36*u);g.stroke();g.fillStyle='#d9b45a';g.beginPath();g.moveTo(0,-46*u);g.lineTo(3*u,-36*u);g.lineTo(-3*u,-36*u);g.closePath();g.fill();
  var w=Math.sin(tm*.11)*5*u,w2=Math.sin(tm*.11+1.3)*5*u,q=g.createLinearGradient(0,0,-46*u,0);q.addColorStop(0,'#3a1466');q.addColorStop(1,'#14081f');g.fillStyle=q;
  g.beginPath();g.moveTo(0,-34*u);g.bezierCurveTo(-14*u,-36*u+w,-30*u,-30*u+w2,-46*u,-33*u+w);g.lineTo(-42*u,-6*u+w2);g.bezierCurveTo(-30*u,-2*u+w,-14*u,-8*u+w2,0,-6*u);g.closePath();g.fill();g.strokeStyle=rgba(col,.8);g.lineWidth=1*u;g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=rgba(col,.9);g.lineWidth=1.3*u;g.beginPath();g.arc(-22*u,-19*u+w*.5,6*u,0,PI2);g.stroke();g.beginPath();g.moveTo(-22*u,-26*u+w*.5);g.lineTo(-22*u,-12*u+w*.5);g.moveTo(-29*u,-19*u+w*.5);g.lineTo(-15*u,-19*u+w*.5);g.stroke();g.globalCompositeOperation='source-over'}
function axe(u,col){g.fillStyle='#4a3022';g.fillRect(-2.2*u,-30*u,4.4*u,76*u);g.fillStyle='#d9b45a';g.fillRect(-2.8*u,14*u,5.6*u,2.4*u);g.fillRect(-2.8*u,30*u,5.6*u,2.4*u);
  for(var sd=-1;sd<=1;sd+=2){g.save();g.scale(sd,1);g.beginPath();g.moveTo(2*u,-30*u);g.bezierCurveTo(14*u,-42*u,36*u,-36*u,38*u,-14*u);g.bezierCurveTo(28*u,-18*u,18*u,-8*u,2*u,-6*u);g.closePath();
    var q=g.createLinearGradient(0,-40*u,38*u,-8*u);q.addColorStop(0,'#e9edf5');q.addColorStop(.6,'#8a96aa');q.addColorStop(1,col);g.fillStyle=q;g.fill();g.lineWidth=.9*u;g.strokeStyle='rgba(255,255,255,.8)';g.stroke();g.restore()}
  g.fillStyle='#e9edf5';g.beginPath();g.moveTo(0,-46*u);g.lineTo(3*u,-30*u);g.lineTo(-3*u,-30*u);g.closePath();g.fill()}
function glow(r,col,a){var q=g.createRadialGradient(0,0,r*.05,0,0,r);q.addColorStop(0,rgba(col,a));q.addColorStop(1,rgba(col,0));g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(0,0,r,0,PI2);g.fill();g.globalCompositeOperation='source-over'}
function drawArt(t,tm){
  var ap=apos(),x=X(ap.x),y=Y(ap.y),l=LV(),u=s*(1+l*.03)*(1+Math.max(0,pul)/26*.35),col=FB[t].col,lite=(window.QL|0)>=2;
  g.save();g.translate(x,y);g.rotate(Math.sin(tm*.05)*.05);if(!lite)glow((54+l*2)*u,col,.4+Math.max(0,pul)/26*.4);
  if(t===0){g.rotate(-.5);blade(u*1.15,'#e8f9ff','#58b8ff')}else if(t===1)gourd(u*1.05,tm,col);else if(t===2)flag(u*1.05,tm,col);else{g.rotate(.35);axe(u*.95,col)}
  g.restore()}
function drawSw(){SW.forEach(function(w){if(w.t<0||w.px===undefined)return;var u=s*.9;
  g.save();g.globalCompositeOperation='lighter';for(var k=0;k<w.tr.length;k++){var q=w.tr[k];g.globalAlpha=.12+k*.07;g.save();g.translate(X(q.x),Y(q.y));g.rotate(w.ang);blade(u,'#bfefff','#3a9ae0');g.restore()}g.restore();
  g.save();g.translate(X(w.px),Y(w.py));g.rotate(w.ang);blade(u*1.1,'#ffffff','#58b8ff');g.restore()})}
function drawGh(tm){GH.forEach(function(w){var e=w.e;if(!e)return;var H=hh(e)*s,x=X(e.x)+Math.sin(tm*.07+w.ph)*6*s,gy=GY,a=Math.min(1,w.t/12)*Math.min(1,(w.dur-w.t)/20)*.78,bw=Math.max(18*s,H*.3);
  g.save();g.globalAlpha=Math.max(0,a);var q=g.createLinearGradient(0,gy-H,0,gy);q.addColorStop(0,'rgba(205,170,255,.85)');q.addColorStop(1,'rgba(70,25,120,.08)');g.fillStyle=q;
  g.beginPath();g.moveTo(x,gy-H*1.02);g.bezierCurveTo(x-bw*.9,gy-H*.95,x-bw,gy-H*.55,x-bw*1.05,gy-H*.1);
  for(var i=0;i<4;i++){var fx=x-bw*1.05+(bw*2.1)*(i+1)/4;g.quadraticCurveTo(fx-bw*.26,gy+Math.sin(tm*.12+i+w.ph)*H*.05+H*.05,fx,gy-H*.06)}
  g.bezierCurveTo(x+bw,gy-H*.55,x+bw*.9,gy-H*.95,x,gy-H*1.02);g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle='#fff';g.beginPath();g.ellipse(x-bw*.28,gy-H*.78,bw*.13,bw*.2,0,0,PI2);g.ellipse(x+bw*.28,gy-H*.78,bw*.13,bw*.2,0,0,PI2);g.fill();
  if(w.fl>0){g.globalAlpha=w.fl/6*.7;g.strokeStyle='#d6b8ff';g.lineWidth=2*s;g.beginPath();g.arc(x,gy-H*.5,H*.55,0,PI2);g.stroke()}
  g.restore()})}
function drawMn(tm){MN.forEach(function(m){var u=s*1.15,x=X(m.x),gy=GY,col=FB[1].col,f=m.face,a=Math.min(1,m.l/40)*(m.sp>0?1-m.sp/12:1),lun=m.atk>0?Math.sin(m.atk/10*Math.PI)*9*u*f:0,wk=Math.sin(m.walk*.5)*3*u;
  g.save();g.globalAlpha=a;g.translate(x+lun,gy);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,16*u,3.5*u,0,0,PI2);g.fill();g.scale(f,1);
  g.fillStyle='#2a6a58';g.fillRect(-9*u+wk,-9*u,4*u,9*u);g.fillRect(6*u-wk,-9*u,4*u,9*u);
  var q=g.createLinearGradient(0,-26*u,0,-6*u);q.addColorStop(0,'#7cffc4');q.addColorStop(1,'#1c7a62');g.fillStyle=q;g.beginPath();g.ellipse(0,-15*u,16*u,9.5*u,0,0,PI2);g.fill();
  g.strokeStyle='#7cffc4';g.lineWidth=2*u;g.beginPath();g.moveTo(-14*u,-16*u);g.quadraticCurveTo(-24*u,-24*u+wk,-22*u,-30*u);g.stroke();
  g.fillStyle='#4ad6a0';g.beginPath();g.arc(15*u,-21*u,7.5*u,0,PI2);g.fill();g.fillStyle='#e8fff6';g.beginPath();g.moveTo(11*u,-26*u);g.lineTo(9*u,-35*u);g.lineTo(15*u,-27*u);g.fill();g.beginPath();g.moveTo(17*u,-27*u);g.lineTo(21*u,-35*u);g.lineTo(21*u,-26*u);g.fill();
  g.fillStyle='#ff4a4a';g.beginPath();g.arc(18*u,-22*u,1.8*u,0,PI2);g.fill();
  g.globalCompositeOperation='lighter';g.translate(0,-15*u);g.scale(1,1);glow(24*u,col,.3);g.restore()})}
function drawAx(tm){AX.forEach(function(w){var u=s*2.6,x=X(w.cx),a=1,hgt;
  if(w.t<w.n){var e=Math.pow(w.t/w.n,2);hgt=44*2.6+560*(1-e);a=Math.min(1,w.t/6)}else{hgt=44*2.6;a=Math.max(0,1-(w.t-w.n-16)/26)}
  g.save();g.globalAlpha=a;g.translate(x,Y(hgt));g.rotate(Math.PI);glow(90*s,'#ff8a3a',.5);axe(u,'#ff8a3a');g.restore()})}
function drawRg(){RG.forEach(function(r){var u=r.t/r.n,rad=CF.ax.r*s*Math.sqrt(u);g.save();g.globalAlpha=(1-u)*.9;g.strokeStyle='#ffb070';g.lineWidth=(5-3*u)*s;g.beginPath();g.ellipse(X(r.x),GY-5*s,rad,rad*.26,0,0,PI2);g.stroke();
  g.globalCompositeOperation='lighter';g.globalAlpha=(1-u)*.35;g.fillStyle='#ff8a3a';g.beginPath();g.ellipse(X(r.x),GY-5*s,rad*.9,rad*.22,0,0,PI2);g.fill();g.restore()})}
function drawAll(){var t=eq(),tm=fr;g.save();try{if(t>=0)drawArt(t,tm);drawRg();drawGh(tm);drawMn(tm);drawSw();drawAx(tm)}catch(e){}finally{g.restore()}}
var _aura=ZC.aura;
ZC.aura=function(){var r=_aura.apply(this,arguments);try{if(Date.now()-LS<300&&started&&!vil&&on())drawAll()}catch(e){}return r};

/* ---------- Giao diện ---------- */
var bar,btn,pb,ov;
function css(){var c=document.createElement('style');c.textContent='#fb-bar{position:fixed;right:60px;top:calc(124px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;z-index:2;contain:layout style}@media (min-width:641px){#fb-bar{top:calc(128px + env(safe-area-inset-top,0px))}}'+
'#fb-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid #b8964e;background:#1d1510;color:#fff;font-size:20px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}#fb-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#ffe9a0}#fb-bar button.cd{opacity:.6}#fb-bar button.p{width:30px;height:30px;font-size:14px;align-self:center}'+
'#fb-ov{position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3}#fb-ov .bx{max-width:470px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px}'+
'#fb-ov h2{margin:0 0 4px;color:#ffe27a;font-size:19px}#fb-ov .sm{font-size:12.5px;opacity:.82;line-height:1.5}#fb-ov .cd{display:flex;gap:10px;align-items:flex-start;border:1px solid #4a3828;border-radius:10px;padding:8px;margin:7px 0;background:#140d0a}#fb-ov .cd.on{border-color:#ffe27a}#fb-ov .cd .ic{font-size:30px;width:38px;text-align:center}#fb-ov .cd .t{font-size:12px;opacity:.9;line-height:1.5}'+
'#fb-ov button{background:#8a6420;color:#fff;border:1px solid #ffe27a;border-radius:7px;padding:4px 10px;font-size:13px;margin:2px 3px 2px 0}#fb-ov button:disabled{opacity:.4}#fb-ov .row{display:flex;gap:8px;margin-top:10px}#fb-ov .row button.g{background:#3a3a3a;border-color:#777;flex:1}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='fb-bar';btn=document.createElement('button');
  btn.onpointerdown=function(e){e.stopPropagation();e.preventDefault();castFB(false)};btn.addEventListener('click',function(e){e.stopPropagation()});bar.appendChild(btn);
  pb=document.createElement('button');pb.className='p';pb.textContent='🔮';pb.onpointerdown=function(e){e.stopPropagation();e.preventDefault();open()};bar.appendChild(pb);document.body.appendChild(bar);
  ov=document.createElement('div');ov.id='fb-ov';['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(!b){if(e.target===ov)close();return}var a=b.dataset.a,i=+b.dataset.i;if(a==='x')close();else if(a==='b')bind(i);else if(a==='e')equip(i);else if(a==='u')up(i)});document.body.appendChild(ov)}
function bind(i){if(!on()){say('Cần thành Đạo Thể');return}var d=D();if(d.lv[i]>0)return;if(gold<CF.bindGold){say('Không đủ vàng ('+nf(CF.bindGold)+')');return}gold-=CF.bindGold;d.lv[i]=1;d.t=i;clearAll();say('🔮 Luyện hoá '+FB[i].n);save();render()}
function equip(i){var d=D();if(d.lv[i]<1||d.t===i)return;d.t=i;clearAll();cdT=0;say('🔮 Đeo '+FB[i].n);save();render()}
var busy=false;
function up(i){var d=D(),l=d.lv[i];if(l<1||l>=CF.max||busy)return;var nd=need(l);if((d.c[i]|0)<nd){say('Chưa đủ lượt thi triển ('+nf(d.c[i]|0)+'/'+nf(nd)+')');return}
  var c=cost(l);if(!ltOk()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+c+'💎)');return}
  busy=true;render();
  LT.spend(c,'phapbao').then(function(r){busy=false;
    if(!r||!r.ok){say(r&&r.err==='poor'?'Không đủ Linh Thạch: cần '+c+'💎, bạn có '+nf(r.lt)+'💎':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+')');render();return}
    var q=D();if(q.lv[i]===l&&(q.c[i]|0)>=nd){q.lv[i]=l+1;q.c[i]-=nd;say('🔮 '+FB[i].n+' lên Lv '+(l+1)+' (−'+c+'💎)');save()}render()
  }).catch(function(){busy=false;say('Không trừ được Linh Thạch (lỗi mạng)');render()})}
function statTx(t,l){var o=stat(t,l);return t===0?'+'+o.dmgp+'% sát thương':t===1?'+'+o.pet+'% sức mạnh quái/thú triệu hồi':t===2?'+'+o.dotd+'% sát thương DoT · +'+o.stnc+'% choáng · +'+o.frzc+'% đóng băng · +'+o.ext+'% thời gian hiệu ứng':'+'+o.cdmg+'% sát thương bạo kích'}
function actTx(t,l){var m=t===0?CF.sw.n+' kiếm × '+Math.round((CF.sw.base+CF.sw.lv*l)*100)+'%':t===1?CF.mn.n+' quái × '+Math.round((CF.mn.base+CF.mn.lv*l)*100)+'% mỗi đòn':t===2?'mỗi 0,5s: '+Math.round((CF.gh.base+CF.gh.lv*l)*100)+'% sát thương':Math.round((CF.ax.base+CF.ax.lv*l)*100)+'% sát thương';return m}
function render(){if(!ov||ov.style.display==='none')return;var d=D(),o='<div class="bx"><h2>🔮 Pháp Bảo Bổn Mệnh</h2><div class="sm">Chỉ Đạo Thể mới luyện được. Pháp bảo bay sau lưng, kèm 1 kỹ năng bị động và 1 kỹ năng chủ động (nút 🔮 bên trái cột Thần Thông hoặc phím F; tự dùng khi bật AUTO). Hồi chiêu '+CF.cd+'s · '+CF.mp+' MP.<br>Vàng: <b style="color:#ffe27a">'+nf(gold)+'</b> · Linh Thạch: <b style="color:#8fe9ff">'+(ltOk()?nf(ltHave())+'💎':'cần đăng nhập ☁')+'</b><br>Lên cấp (tối đa Lv'+CF.max+'): thi triển kỹ năng chủ động đủ '+nf(CF.castBase)+' lần để lên Lv2, mỗi cấp sau gấp đôi (×2); và tốn '+CF.ltBase+'💎 Linh Thạch, tăng dần theo cấp.</div>';
  for(var i=0;i<4;i++){var f=FB[i],l=d.lv[i],has=l>0,eqd=d.t===i&&has,lc=Math.max(1,l);
    o+='<div class="cd'+(eqd?' on':'')+'"><div class="ic">'+f.i+'</div><div style="flex:1"><b style="color:'+f.col+'">'+f.n+'</b> <span class="sm">· '+f.attr+(has?' · Cấp '+l+'/'+CF.max:' · chưa luyện hoá')+(eqd?' · <b style="color:#7be07a">Đang đeo</b>':'')+'</span>'+
      '<div class="t">📈 '+statTx(i,lc)+(has&&l<CF.max?' → <span style="color:#7be07a">'+statTx(i,l+1)+'</span>':'')+
      '<br>🛡️ <b>Bị động · '+f.pa.n+':</b> '+f.pa.d+'<br>⚔️ <b>Chủ động · '+f.ac.n+':</b> '+f.ac.d+' <span class="sm">('+actTx(i,lc)+')</span></div><div>'+
      (!has?'<button data-a="b" data-i="'+i+'"'+(gold>=CF.bindGold?'':' disabled')+'>Luyện hoá ('+nf(CF.bindGold)+'💰)</button>':
        (eqd?'':'<button data-a="e" data-i="'+i+'">Đeo</button>')+(l<CF.max?'<button data-a="u" data-i="'+i+'"'+(((d.c[i]|0)>=need(l)&&!busy)?'':' disabled')+'>Lên Lv'+(l+1)+' ('+cost(l)+'💎)</button>':'<span class="sm">Đã đạt cấp tối đa</span>'))+'</div>'+
      (has&&l<CF.max?'<div class="sm" style="margin-top:3px">Thi triển: <b>'+nf(Math.min(d.c[i]|0,need(l)))+'/'+nf(need(l))+'</b> lần'+((d.c[i]|0)>=need(l)?' <b style="color:#7be07a">· đủ điều kiện</b>':'')+'</div>':'')+'</div></div>'}
  o+='<div class="row"><button class="g" data-a="x">Đóng</button></div></div>';ov.innerHTML=o}
function open(){if(!on()){say('Chỉ Đạo Thể (đã hợp đạo) mới có Pháp Bảo Bổn Mệnh');return}if(!ov)build();ov.style.display='flex';render()}
function close(){if(ov)ov.style.display='none'}
function card(){
  if(!on())return'<div class="dt">🔒 <b>Pháp Bảo Bổn Mệnh</b><br><span style="opacity:.8">Mở khoá khi thành Đạo Thể (Hợp Đạo): kiếm linh · hồ lô · hồn phiên · cự phủ.</span></div>';
  var t=eq(),b=t>=0?FB[t]:null,l=LV();
  return'<div class="dt">🔮 <b>Pháp Bảo Bổn Mệnh</b><br>'+(b?b.i+' <b style="color:'+b.col+'">'+b.n+'</b> · Cấp '+l+'/'+CF.max+'<br><span style="opacity:.85">'+statTx(t,l)+'</span><br>':'<span style="opacity:.85">Chưa luyện hoá pháp bảo nào. Chọn 1 trong 4 loại.</span><br>')+'<button onclick="FABAO.open()">Mở bảng Pháp Bảo</button></div>'}
ZC.ui=function(){var h=z0.ui.apply(this,arguments);try{h+=card()}catch(e){}return h};
addEventListener('keydown',function(e){try{if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey){var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||(e.target&&e.target.isContentEditable))return;castFB(false)}}catch(x){}});

/* ---------- Vòng cập nhật chậm (nút, hồi máu bị động) ---------- */
var last=Date.now();
setInterval(function(){
  if(document.hidden)return;var t=Date.now(),dt=Math.min(1,(t-last)/1000);last=t;
  try{
    if(!bar&&document.body)build();if(!bar)return;
    var k=eq(),show=k>=0&&typeof started!=='undefined'&&started&&!(typeof vil!=='undefined'&&vil);bar.style.display=show?'flex':'none';
    if(!show)return;
    var rem=Math.max(0,Math.ceil((cdT-t)/1000)),key=k+'|'+rem;if(btn._k!==key){btn._k=key;btn.className=rem?'cd':'';btn.style.borderColor=FB[k].col;btn.innerHTML=FB[k].i+(rem?'<small>'+rem+'s</small>':'')}
    if(k===1&&!over&&dt&&P.hp>0)P.hp=Math.min(mx(),P.hp+mx()*(.0025+.0003*LV())*dt);
  }catch(e){}
},250);

window.FABAO={open:open,close:close,on:on,cast:function(){return castFB(false)},data:D,cfg:CF,defs:FB,type:eq,level:LV};
})();
