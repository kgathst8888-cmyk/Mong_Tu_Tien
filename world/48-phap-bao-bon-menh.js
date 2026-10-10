/* ===== 🔮 PHÁP BẢO BỔN MỆNH (world/48-phap-bao-bon-menh.js) =====
 * Chỉ nhân vật ĐÃ THÀNH ĐẠO THỂ (HDAO.on(), Đạo Cảnh) mới mở khoá. Ở ô nhân vật có thẻ "Pháp Bảo Bổn Mệnh" → bảng luyện.
 * 4 pháp bảo, mỗi cái: 1 thuộc tính riêng (cộng theo cấp luyện) + 1 kỹ năng BỊ ĐỘNG + 1 kỹ năng CHỦ ĐỘNG. Pháp bảo bay lơ lửng SAU LƯNG nhân vật.
 *   🗡️ Kiếm Linh  : thuộc tính +sát thương · bị động: tự phóng 1 phi kiếm mỗi 6s · chủ động: kiếm xoè ra 8 phi kiếm rồi lao về địch.
 *   🏺 Hồ Lô      : thuộc tính +sức mạnh quái/thú triệu hồi · bị động: hồi máu theo giây · chủ động: triệu 4 quái vật tấn công địch, tồn tại 10s.
 *   🚩 Hồn Phiên  : thuộc tính +hiệu ứng kỹ năng (sát thương DoT, tỉ lệ choáng/băng, thời gian hiệu ứng) · bị động: hạ gục địch hồi máu/MP · chủ động: bóng ma trên tối đa 5 địch, sát thương theo thời gian.
 *   🪓 Cự Phủ     : thuộc tính +sát thương bạo kích · bị động: càng mất máu càng mạnh · chủ động: cự phủ khổng lồ bổ xuống đất, gây sát thương + choáng.
 * Dữ liệu: PS[cur].fb = {t: loại đang đeo (-1 chưa), lv:[cấp 4 loại; 0 = chưa luyện hoá], c:[số lần đã thi triển kỹ năng chủ động của từng loại]}. Lưu theo save hiện có (PS được sv() lưu sẵn).
 * CHỌN 1 trong 4 loại và CHỈ ĐƯỢC CHỌN 1 LẦN (không đổi được): CF.bindGold vàng, bắt đầu cấp 1. Cấp pháp bảo = cấp kỹ năng, tối đa CF.max=10.
 * Save cũ đã nâng cấp nhiều loại: hàm fix() tự giữ loại CẤP CAO NHẤT (bằng cấp: giữ loại đang đeo, rồi loại đứng trước), các loại khác về 0.
 * Lên cấp n→n+1: (1) thi triển kỹ năng chủ động đủ CF.castBase·2^(n-1) lần (1000, 2000, 4000...; mỗi loại đếm riêng, dư được giữ lại), (2) trả CF.ltBase·n Linh Thạch (50, 100, 150...; cần đăng nhập, trừ qua LT.spend). Không có đổi/chọn lại pháp bảo.
 * Cách làm (không sửa engine): bọc twB (cộng chỉ số qua SX: dmgp/cdmg/dotd/stnc/frzc), dm (bị động Cự Phủ, tăng sức mạnh thú triệu hồi trong pstep),
 *   step (cập nhật hiệu ứng), ZC.aura (vẽ sau lưng nhân vật), ZC.ui (thẻ ở ô nhân vật), ZC.kill, ZC.zauto (tự dùng khi bật AUTO).
 * Hình pháp bảo: assets/phap-bao-sprites.js (window.FABAO_IMG[0..3]); chuyển động: lò xo-giảm chấn (quán tính, nghiêng theo vận tốc), xoay trọn vòng khi tung chiêu (kiếm/phủ), lắc (hồ lô), bay phấp phới (phiên), vệt mờ khi di chuyển nhanh. Thiếu hình → dùng hình vẽ vector.
 * Hiệu ứng: sprite ánh sáng + gradient dùng lại, hạt sáng chung (giới hạn theo window.QL), pháp bảo bay theo có độ trễ mềm; QL>=2 tự bỏ vệt/vòng/hạt phụ.
 * Nút chủ động #fb-bar (bên trái cột Thần Thông) + phím F. Chỉnh số liệu: CF, FB. Không vẽ/không cập nhật hiệu ứng trong Đấu Trường và Làng (chỉ số cộng vẫn tính).
 * Phụ thuộc: PS, cur, P, E, PETS, DT, PT, FX, ZC, HDAO, dm, atk, SX, mx, mm, sv, ST (11-status-effects), step, init. */
(function(){
'use strict';
if(typeof PS==='undefined'||typeof ZC==='undefined'||typeof dm!=='function'||!window.HDAO)return;
var CF={max:10,bindGold:3000000,castBase:1000,ltBase:50,cd:14,mp:45,
  sw:{n:8,base:.9,lv:.1,pas:.8,pasEvery:360,range:720},
  mn:{n:4,life:600,base:.8,lv:.08,cd:38},
  gh:{n:5,dur:360,tick:30,base:.3,lv:.03,range:760},
  ax:{base:5,lv:.5,r:330,fall:22}};
var FB=[
 {n:'Kiếm Linh',i:'🗡️',col:'#6fd0ff',attr:'Tăng sát thương',pa:{n:'Linh Kiếm Hộ Chủ',d:'Mỗi 6 giây, Kiếm Linh tự phóng 1 phi kiếm đánh địch gần nhất.'},ac:{n:'Bát Kiếm Phi Thiên',d:'Kiếm xoè ra '+CF.sw.n+' thanh phi kiếm rồi lao về phía địch.'}},
 {n:'Hồ Lô Dưỡng Linh',i:'🏺',col:'#ffb84a',attr:'Tăng sức mạnh quái triệu hồi',pa:{n:'Dưỡng Linh Khí',d:'Hồ lô nhả linh khí, hồi máu mỗi giây.'},ac:{n:'Vạn Quỷ Xuất Bình',d:'Triệu '+CF.mn.n+' quái vật tấn công mục tiêu, tồn tại 10 giây.'}},
 {n:'Hồn Phiên',i:'🚩',col:'#b585ff',attr:'Tăng hiệu ứng kỹ năng',pa:{n:'Hấp Hồn',d:'Hạ gục địch: hút hồn, hồi máu và MP.'},ac:{n:'U Minh Ảo Ảnh',d:'Gây bóng ma lên tối đa '+CF.gh.n+' địch, gây sát thương theo thời gian (6 giây).'}},
 {n:'Cự Phủ',i:'🪓',col:'#ff8a3a',attr:'Tăng sát thương bạo kích',pa:{n:'Huyết Chiến',d:'Càng mất nhiều máu, sát thương càng tăng.'},ac:{n:'Khai Thiên Phủ',d:'Cự phủ khổng lồ bổ mạnh xuống đất, gây sát thương diện rộng và CHOÁNG.'}}];

var IMU=window.FABAO_IMG||[],IM=[],SPR=[{h:58,pv:0,rot:-.5},{h:40,pv:0,rot:0},{h:70,pv:.34,rot:0},{h:60,pv:0,rot:.12}];
IMU.forEach(function(u,i){try{var im=new Image();im.src=u;IM[i]=im}catch(e){}});
function sprOk(i){var im=IM[i];return im&&im.complete&&im.naturalWidth>0?im:null}
function sprTag(i,hp){return IMU[i]?'<img src="'+IMU[i]+'" style="height:'+hp+'px;max-width:'+Math.round(hp*.9)+'px;object-fit:contain;vertical-align:middle">':FB[i].i}
/* ---------- tiện ích ---------- */
function on(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function fix(d){var lv=d.lv,n=0,b=-1,i;for(i=0;i<4;i++)if((lv[i]|0)>0){n++;if(b<0||lv[i]>lv[b]||(lv[i]===lv[b]&&i===d.t))b=i}
  if(n>1)for(i=0;i<4;i++)if(i!==b){lv[i]=0;if(d.c)d.c[i]=0}
  if(d.t!==b)d.t=b;return d}
function chosen(d){return d.lv[0]>0||d.lv[1]>0||d.lv[2]>0||d.lv[3]>0}
function D(){var p=PS[cur];if(!p.fb||typeof p.fb!=='object')p.fb={t:-1,lv:[0,0,0,0]};if(!p.fb.lv||p.fb.lv.length<4)p.fb.lv=[0,0,0,0];if(!p.fb.c||p.fb.c.length<4)p.fb.c=[0,0,0,0];return fix(p.fb)}
function eq(){try{if(!on())return -1;var d=PS[cur].fb;if(!d||!d.lv||d.lv.length<4)return -1;fix(d);return d.t>=0&&d.lv[d.t]>0?d.t:-1}catch(e){return -1}}
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

/* ---------- Hạt ánh sáng, sprite & gradient dùng lại (nhẹ, mượt) ---------- */
var PI2=Math.PI*2,GS={},GR={},RC={},SP=[],QLV=0;
function rc(c,a){var q=(a*20)|0,k=c+q,v=RC[k];return v||(RC[k]=rgba(c,q/20))}
function gsp(c){var v=GS[c];if(v)return v;v=document.createElement('canvas');v.width=v.height=64;var x=v.getContext('2d'),q=x.createRadialGradient(32,32,1,32,32,32);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.22,rgba(c,.9));q.addColorStop(.55,rgba(c,.28));q.addColorStop(1,rgba(c,0));x.fillStyle=q;x.fillRect(0,0,64,64);return GS[c]=v}
function glow(x,y,r,c,a){if(a<=.01)return;g.globalAlpha=a>1?1:a;g.drawImage(gsp(c),x-r,y-r,r*2,r*2)}
function lgr(k,x0,y0,x1,y1,st){var q=GR[k];if(q)return q;q=g.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)q.addColorStop(st[i],st[i+1]);return GR[k]=q}
function sp(x,y,c,n,spd,life,r,gv){var cap=QLV>=2?26:QLV===1?70:150;for(var i=0;i<n&&SP.length<cap;i++){var a=Math.random()*PI2,v=spd*(.4+Math.random()*.8);SP.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.8+spd*.15,l:life,L:life,r:r*(.6+Math.random()*.8),c:c,g:gv===undefined?-.12:gv})}}
function spUp(){var j=0;for(var i=0;i<SP.length;i++){var p=SP[i];if(--p.l>0){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.97;SP[j++]=p}}SP.length=j}
function pack(a){var j=0;for(var i=0;i<a.length;i++)if(!a[i].dead)a[j++]=a[i];a.length=j}
function puff(x,y,c,n){sp(x,y,c,n,3.2,26,5)}

/* ---------- Thực thể hiệu ứng ---------- */
var SW=[],GH=[],MN=[],AX=[],RG=[],pul=0,pasT=0,LS=0,cdT=0,AR={x:0,y:0,vx:0,vy:0,rot:0,vr:0,sp:0,init:0,h:[]};
function clearAll(){SW=[];GH=[];MN=[];AX=[];RG=[];SP=[];pul=0;pasT=0}
function arUpd(){var d=P.d||1,tx=P.x-d*46,ty=100+Math.sin(fr*.045)*4+Math.sin(fr*.11)*1;
  if(!AR.init||Math.abs(AR.x-tx)>600){AR.x=tx;AR.y=ty;AR.vx=AR.vy=AR.rot=AR.vr=0;AR.h=[];AR.init=1}
  AR.vx+=(tx-AR.x)*.07-AR.vx*.22;AR.vy+=(ty-AR.y)*.09-AR.vy*.25;AR.x+=AR.vx;AR.y+=AR.vy;
  AR.vr+=(Math.max(-.4,Math.min(.4,-AR.vx*.045))-AR.rot)*.12-AR.vr*.3;AR.rot+=AR.vr;AR.sp=Math.sqrt(AR.vx*AR.vx+AR.vy*AR.vy);
  AR.h.push(AR.x,AR.y,AR.rot);if(AR.h.length>30)AR.h.splice(0,3)}
function spawnSw(tg,delay,mul,i,tot){var fa=tot>1?(i-(tot-1)/2)*Math.min(.5,1.7/(tot-1)):0;SW.push({tg:tg,t:-delay,n:13,mul:mul,fa:fa,i:i,px:AR.x,py:AR.y,ppx:AR.x,ppy:AR.y,x0:undefined,y0:0,tx:undefined,ty:0,tr:[],ang:fa*.9,age:0,dead:0})}

/* ---------- Kỹ năng chủ động ---------- */
function fireSw(){var l=LV(),a=nearL(CF.sw.range);if(!a.length)return false;var n=CF.sw.n;for(var k=0;k<n;k++)spawnSw(a[k%a.length],6+k*4,CF.sw.base+CF.sw.lv*l,k,n);sp(AR.x,AR.y,FB[0].col,10,2.6,22,5,.02);return true}
function fireMn(){var a=nearL(900);if(!a.length)return false;MN=[];var l=LV(),d=P.d||1;for(var k=0;k<CF.mn.n;k++)MN.push({x:P.x+d*(40+k*26),i:k,l:CF.mn.life,L:CF.mn.life,cd:10+k*6,atk:0,face:d,walk:0,sp:14,vx:0,mul:CF.mn.base+CF.mn.lv*l});
  RG.push({k:1,x:P.x+d*(40+CF.mn.n*13),t:0,n:48,c:FB[1].col});sp(P.x+d*80,60,'#ffd88a',14,3.2,26,5);return true}
function fireGh(){var l=LV(),a=nearL(CF.gh.range).slice(0,CF.gh.n);if(!a.length)return false;var dur=Math.round(CF.gh.dur*(1+extB()));
  a.forEach(function(e){var g0=null;for(var i=0;i<GH.length;i++)if(GH[i].e===e)g0=GH[i];if(g0){g0.t=0;g0.dur=dur;g0.mul=CF.gh.base+CF.gh.lv*l}else GH.push({e:e,t:0,dur:dur,mul:CF.gh.base+CF.gh.lv*l,fl:0,ph:Math.random()*6});sp(e.x,hh(e)*.5,FB[2].col,10,2.8,24,5,.03)});sp(AR.x,AR.y,FB[2].col,8,2.4,22,4.5,.03);return true}
function fireAx(){var a=nearL(640);if(!a.length)return false;AX.push({cx:a[0].x,t:0,n:CF.ax.fall,mul:CF.ax.base+CF.ax.lv*LV(),done:0,dis:0,dead:0});return true}
function axH(w){return w.t<w.n?50*2.6+560*(1-Math.pow(w.t/w.n,2)):50*2.6}
function impact(w){var cx=w.cx,fl=F('flash'),sk=F('shake'),gw=F('gwave');try{sk(10);fl('#ff8a3a',8);gw(cx,'#ff8a3a',CF.ax.r,26)}catch(e){}
  act().forEach(function(e){if(Math.abs(e.x-cx)<CF.ax.r){hit(e,w.mul);try{if(window.ST&&ST.apply)ST.apply(e,'stn');else e.sl=150}catch(x){}}});
  RG.push({k:0,x:cx,t:0,n:28},{k:0,x:cx,t:-6,n:28},{k:2,x:cx,t:0,n:46});sp(cx,14,'#ffb070',22,6.5,34,6,-.35);sp(cx,20,'#fff1c0',10,4.5,26,4.5,-.2)}
var SKL=[fireSw,fireMn,fireGh,fireAx];
function castFB(auto){
  var t=eq();if(t<0||!started||over||vil)return false;var now=Date.now();
  if(cdT>now)return false;if(P.mp<CF.mp){if(!auto)say('Không đủ MP');return false}
  if(!nearL(900).length){if(!auto)say('Không có địch trong tầm');return false}
  if(!AR.init)arUpd();if(!SKL[t]())return false;
  P.mp-=CF.mp;cdT=now+CF.cd*1000;pul=26;if(!auto)say(FB[t].i+' '+FB[t].ac.n);
  try{var fb=D();fb.c[t]=(fb.c[t]|0)+1;if(ov&&ov.style.display==='flex'&&!busy)render()}catch(e){}return true}

/* ---------- Cập nhật mỗi khung hình (gọi trong step) ---------- */
function dot(e,mul){var d=atk()*mul*(1+SX('dotd')/100);d=Math.max(1,Math.round(Math.min(d,(e.max||d)*(bossE(e)?.012:.08))));e.hp-=d;DT.push({x:e.x,y:hh(e),s:'👻'+d,c:'#cda8ff',l:40})}
function extend(){var ex=extB();if(!ex)return;E.forEach(function(e){var T=e.stt;if(!T||e.in>0||e.hp<=0)return;var p=e._fbp||(e._fbp={});['brn','psn','stn','frz'].forEach(function(k){var v=T[k]|0;if(v>0){if(v>(p[k]|0)){T[k]=Math.round(v*(1+ex));v=T[k]}p[k]=v}else p[k]=0})})}
function tick(){
  var t=eq(),Q=QLV=(window.QL|0);if(pul>0)pul--;arUpd();
  if(t>=0&&Q<2&&fr%(Q?9:5)===0)sp(AR.x+(Math.random()-.5)*16,AR.y+(Math.random()-.5)*20,FB[t].col,1,.5,34,3.4,(t===1||t===3)?.05:.02);
  if(t===0&&++pasT>=CF.sw.pasEvery){pasT=0;var a0=nearL(CF.sw.range);if(a0.length)spawnSw(a0[0],0,CF.sw.pas+.05*LV(),0,1)}
  if(t===2)extend();
  SW.forEach(function(w){
    w.age++;
    if(w.t<0){w.t++;w.px=AR.x+Math.sin(w.fa)*26;w.py=AR.y+8+Math.cos(w.fa)*8+Math.sin(fr*.2+w.i)*1.5;w.ang=w.fa*.9;return}
    if(w.x0===undefined){w.x0=w.px;w.y0=w.py}
    w.t++;var tg=w.tg;if(tg&&tg.hp>0&&tg.in<=0){w.tx=tg.x;w.ty=hh(tg)*.55}else if(w.tx===undefined){w.dead=1;return}
    var u=Math.min(1,w.t/w.n),e=Math.pow(u,1.7);w.ppx=w.px;w.ppy=w.py;
    w.px=w.x0+(w.tx-w.x0)*e;w.py=w.y0+(w.ty-w.y0)*e+Math.sin(u*Math.PI)*14*(1-u);
    var dx=w.px-w.ppx,dy=w.py-w.ppy;if(dx*dx+dy*dy>.01)w.ang=Math.atan2(dx,dy);
    w.tr.push({x:w.px,y:w.py});if(w.tr.length>7)w.tr.shift();
    if(Q<2)sp(w.px,w.py,'#bfefff',1,.8,16,3,0);
    if(w.t>=w.n){var h=(tg&&tg.hp>0&&tg.in<=0)?tg:act().filter(function(q){return Math.abs(q.x-w.tx)<160})[0];
      if(h){hit(h,w.mul);try{FX.push({t:'sl',x:h.x,br:0,c:'#bfefff',l:10,m:10})}catch(x){}sp(h.x,hh(h)*.5,'#bfefff',9,4.2,20,4,-.1)}w.dead=1}});
  pack(SW);
  GH.forEach(function(w){var e=w.e;if(!e||e.hp<=0||e.in>0||E.indexOf(e)<0){w.dead=1;return}w.t++;if(w.fl>0)w.fl--;
    if(Q<2&&w.t%7===0)sp(e.x+(Math.random()-.5)*30,hh(e)*.2,FB[2].col,1,.5,30,3.4,.06);
    if(w.t%CF.gh.tick===0){dot(e,w.mul);w.fl=6;sp(e.x,hh(e)*.5,FB[2].col,5,2.6,18,4,.02)}if(w.t>=w.dur)w.dead=1});
  pack(GH);
  if(MN.length){var pb=petB()*(t===1?1:0),ac=act();
    MN.forEach(function(m){
      m.l--;if(m.sp>0)m.sp--;if(m.l<=0){m.dead=1;return}
      var tg=null,bd=900;ac.forEach(function(q){var d=Math.abs(q.x-m.x);if(d<bd){bd=d;tg=q}});
      if(m.cd>0)m.cd--;if(m.atk>0)m.atk--;var want=0;
      if(tg){var dx=tg.x-m.x;m.face=dx<0?-1:1;if(Math.abs(dx)>46)want=m.face*3.4;else if(m.cd<=0){m.cd=CF.mn.cd;m.atk=10;try{dm(tg,m.mul*(1+pb))}catch(x){}sp(tg.x,hh(tg)*.4,FB[1].col,6,3.4,18,4,-.05)}}
      else{var tx=P.x-(P.d||1)*(70+m.i*34),ddx=tx-m.x;want=Math.abs(ddx)>6?Math.max(-3.4,Math.min(3.4,ddx*.08)):0;if(want)m.face=want<0?-1:1}
      m.vx+=(want-m.vx)*.3;m.x+=m.vx;if(Math.abs(m.vx)>.5){m.walk++;if(Q===0&&m.walk%7===0)sp(m.x,3,FB[1].col,1,.6,16,3,0)}});
    pack(MN)}
  AX.forEach(function(w){w.t++;if(Q<2&&w.t<w.n)sp(w.cx+(Math.random()-.5)*50,axH(w)+20,'#ffb070',1,1,14,4,0);
    if(!w.done&&w.t>=w.n){w.done=1;impact(w)}if(!w.dis&&w.t>=w.n+30){w.dis=1;sp(w.cx,70,'#ffb070',16,3,28,5,.05)}if(w.t>w.n+44)w.dead=1});
  pack(AX);
  RG.forEach(function(r){r.t++;if(r.t>=r.n)r.dead=1});pack(RG);spUp()}

var _step=step;
step=function(){_step.apply(this,arguments);try{LS=Date.now();if(vil||!started){if(SW.length||GH.length||MN.length||AX.length||RG.length||SP.length)clearAll();return}if(over){clearAll();return}if(on())tick()}catch(e){}};
if(typeof init==='function'){var _init=init;init=function(){clearAll();return _init.apply(this,arguments)}}
ZC.zauto=function(){var r=z0.zauto?z0.zauto.apply(this,arguments):undefined;try{if(eq()>=0&&started&&!over&&!vil)castFB(true)}catch(e){}return r};

/* ---------- Vẽ (sau lưng nhân vật). Hình vẽ theo "đơn vị" (g.scale) để gradient dùng lại được ---------- */
function X(wx){return (wx-cam)*s}
function Y(h){return GY-h*s}
function vis(wx){var x=X(wx);return x>-170&&x<W+170}
function S(f,a){g.save();try{f(a)}catch(e){}finally{g.restore()}}
function blade(k){g.save();g.scale(k,k);g.beginPath();g.moveTo(0,-34);g.lineTo(4.6,-12);g.lineTo(3.6,8);g.lineTo(-3.6,8);g.lineTo(-4.6,-12);g.closePath();
  g.fillStyle=lgr('bl',-5,0,5,0,[0,'#58b8ff',.5,'#f4fcff',1,'#58b8ff']);g.fill();g.lineWidth=.8;g.strokeStyle='rgba(255,255,255,.75)';g.stroke();
  g.fillStyle='#d9b45a';g.fillRect(-9,8,18,3);g.fillStyle='#5a3a22';g.fillRect(-1.8,11,3.6,12);g.fillStyle='#d9b45a';g.beginPath();g.arc(0,25,2.6,0,PI2);g.fill();g.restore()}
function gourd(tm,col){g.fillStyle=lgr('go',-16,0,16,0,[0,'#8a4a1a',.45,'#f0aa44',1,'#7a3a12']);
  g.beginPath();g.ellipse(0,9,16,15,0,0,PI2);g.fill();g.beginPath();g.ellipse(0,-12,10,10,0,0,PI2);g.fill();g.fillRect(-6,-6,12,8);
  g.fillStyle='#6a3a1a';g.fillRect(-4,-28,8,7);g.strokeStyle='#ffd76a';g.lineWidth=1.6;g.beginPath();g.moveTo(-8,-5);g.quadraticCurveTo(0,-1,8,-5);g.stroke();
  g.strokeStyle=rc(col,.9);g.lineWidth=1.2;g.beginPath();g.arc(0,9,7,0,PI2);g.stroke();
  g.globalCompositeOperation='lighter';glow(0,9,12,col,.45+Math.sin(tm*.08)*.15);for(var i=0;i<3;i++){var ph=(tm*.02+i/3)%1;glow(Math.sin(i*2.1+tm*.05)*5,-30-ph*22,(5.5-ph*3),col,.8*(1-ph))}}
function flag(tm,col){g.strokeStyle='#6a4a2a';g.lineWidth=2.4;g.beginPath();g.moveTo(0,-36);g.lineTo(0,36);g.stroke();g.fillStyle='#d9b45a';g.beginPath();g.moveTo(0,-46);g.lineTo(3,-36);g.lineTo(-3,-36);g.closePath();g.fill();
  var w=Math.sin(tm*.11)*5,w2=Math.sin(tm*.11+1.3)*5;g.fillStyle=lgr('fl',0,0,-46,0,[0,'#3a1466',1,'#14081f']);
  g.beginPath();g.moveTo(0,-34);g.bezierCurveTo(-14,-36+w,-30,-30+w2,-46,-33+w);g.lineTo(-42,-6+w2);g.bezierCurveTo(-30,-2+w,-14,-8+w2,0,-6);g.closePath();g.fill();g.strokeStyle=rc(col,.8);g.lineWidth=1;g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=rc(col,.9);g.lineWidth=1.3;g.beginPath();g.arc(-22,-19+w*.5,6,0,PI2);g.moveTo(-22,-26+w*.5);g.lineTo(-22,-12+w*.5);g.moveTo(-29,-19+w*.5);g.lineTo(-15,-19+w*.5);g.stroke();
  glow(-22,-19+w*.5,13,col,.5+Math.sin(tm*.1)*.15);for(var i=0;i<2;i++){var a=tm*.05+i*3.14;glow(Math.cos(a)*30-6,-12+Math.sin(a)*14,5,col,.8)}}
function axe(k,col){g.save();g.scale(k,k);g.fillStyle='#4a3022';g.fillRect(-2.2,-30,4.4,76);g.fillStyle='#d9b45a';g.fillRect(-2.8,14,5.6,2.4);g.fillRect(-2.8,30,5.6,2.4);
  for(var sd=-1;sd<=1;sd+=2){g.save();g.scale(sd,1);g.beginPath();g.moveTo(2,-30);g.bezierCurveTo(14,-42,36,-36,38,-14);g.bezierCurveTo(28,-18,18,-8,2,-6);g.closePath();
    g.fillStyle=lgr('ax'+col,0,-40,38,-8,[0,'#e9edf5',.6,'#8a96aa',1,col]);g.fill();g.lineWidth=.9;g.strokeStyle='rgba(255,255,255,.8)';g.stroke();g.restore()}
  g.fillStyle='#e9edf5';g.beginPath();g.moveTo(0,-46);g.lineTo(3,-30);g.lineTo(-3,-30);g.closePath();g.fill();g.restore()}
function bannerWave(im,w,h,tm,pl){var n=14,iw=im.naturalWidth,ih=im.naturalHeight,amp=h*.02*(1+pl*1.2),ish=ih/n,k=h/ih;for(var i=0;i<n;i++){var u=(i+.5)/n,dx=Math.sin(tm*.09+i*.55)*amp*Math.sin(Math.PI*u)*(.4+u*.8),sh=Math.min(ish+1,ih-i*ish);g.drawImage(im,0,i*ish,iw,sh,-w/2+dx,-h/2+i*ish*k,w,sh*k)}}
function drawSpr(t,im,x,y,tm,pl,cp,sc,l){
  var sd=SPR[t],h=sd.h*s*(1+l*.015)*(1+.025*Math.sin(tm*.07+t))*sc,w=h*im.naturalWidth/im.naturalHeight,pv=sd.pv*h,ec=1-pl*pl*pl,sway=0,spin=0;
  if(t===0){sway=Math.sin(tm*.05)*.05;if(pul>0)spin=PI2*ec}
  else if(t===1)sway=Math.sin(tm*.07)*.05+(pul>0?Math.sin(cp*18)*.3*pl:0);
  else if(t===2)sway=Math.sin(tm*.055)*.07+Math.sin(tm*.13)*.02;
  else{sway=Math.sin(tm*.045)*.04;if(pul>0)spin=-PI2*ec}
  var rt=sd.rot+AR.rot+sway+spin;
  if(QLV===0&&AR.sp>2.2&&AR.h.length>=21)for(var k=1;k<=2;k++){var i=AR.h.length-3*(k*3+1);g.save();g.globalAlpha=.2/k;g.translate(X(AR.h[i]),Y(AR.h[i+1]));g.rotate(sd.rot+AR.h[i+2]+sway);g.drawImage(im,-w/2,-h/2,w,h);g.restore()}
  g.save();g.translate(x,y);g.translate(0,-pv);g.rotate(rt);g.translate(0,pv);
  if(t===2&&QLV<2)bannerWave(im,w,h,tm,pl);else g.drawImage(im,-w/2,-h/2,w,h);
  if(pl>0&&t!==2){g.globalCompositeOperation='lighter';g.globalAlpha=pl*.5;g.drawImage(im,-w/2,-h/2,w,h)}
  g.restore()}
function drawArt(tm){var t=eq();if(t<0)return;if(!AR.init)arUpd();
  var x=X(AR.x),y=Y(AR.y),l=LV(),pl=Math.max(0,pul)/26,cp=1-pl,sc=1+(pul>0?.22*Math.sin(cp*Math.PI):0),u=s*(1+l*.03)*(1+pl*.3),col=FB[t].col;
  g.globalCompositeOperation='lighter';glow(x,y,(40+l*1.5)*s*(1+pl*.6),col,.32+pl*.45);
  if(QLV<2){g.save();g.translate(x,y);g.scale(1,.9);g.strokeStyle=rc(col,.3+pl*.4);g.lineWidth=1.2*s;g.setLineDash([6*s,11*s]);g.lineDashOffset=-tm*.5*s;g.beginPath();g.arc(0,0,(28+pl*10)*u*.9,0,PI2);g.stroke();g.setLineDash([]);g.restore()}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  var im=sprOk(t);if(im){drawSpr(t,im,x,y,tm,pl,cp,sc,l);return}
  g.translate(x,y);g.rotate(Math.sin(tm*.05)*.05+AR.rot);g.scale(u*.62,u*.62);
  if(t===0){g.rotate(-.5);blade(1.15)}else if(t===1)gourd(tm*1.0,col);else if(t===2)flag(tm,col);else{g.rotate(.35);axe(.95,col)}}
function drawRg(){RG.forEach(function(r){if(r.t<0||!vis(r.x))return;var u=r.t/r.n,cx=X(r.x),cy=GY-5*s;g.save();
  if(r.k===0){var rad=CF.ax.r*s*Math.sqrt(u);g.globalAlpha=(1-u)*.9;g.strokeStyle='#ffb070';g.lineWidth=(5-3*u)*s;g.beginPath();g.ellipse(cx,cy,rad,rad*.26,0,0,PI2);g.stroke();
    g.globalCompositeOperation='lighter';g.globalAlpha=(1-u)*.3;g.fillStyle='#ff8a3a';g.beginPath();g.ellipse(cx,cy,rad*.9,rad*.22,0,0,PI2);g.fill()}
  else if(r.k===1){var a=Math.sin(u*Math.PI),rad1=95*s*(.55+.45*Math.min(1,u*3));g.translate(cx,cy);g.scale(1,.26);g.globalCompositeOperation='lighter';glow(0,0,rad1*1.1,r.c,.4*a);
    g.strokeStyle=rc(r.c,.85*a);g.lineWidth=2.4*s;g.beginPath();g.arc(0,0,rad1,0,PI2);g.stroke();g.lineWidth=2*s;g.setLineDash([9*s,9*s]);g.lineDashOffset=-r.t*2*s;g.beginPath();g.arc(0,0,rad1*.72,0,PI2);g.stroke();g.setLineDash([])}
  else{var a2=(1-u)*.9,gr=Math.min(1,u*5);g.globalCompositeOperation='lighter';g.strokeStyle=rc('#ffb070',a2);g.lineWidth=2.6*s;g.beginPath();
    for(var i=0;i<9;i++){var an=i/9*PI2+.3,len=CF.ax.r*(.45+.5*((i*7)%5)/5)*gr*s,dx=Math.cos(an)*len,dy=Math.sin(an)*len*.26,j=((i*13)%7-3)*2*s;g.moveTo(cx,cy);g.lineTo(cx+dx*.45+j,cy+dy*.45-j*.3);g.lineTo(cx+dx,cy+dy)}g.stroke()}
  g.restore()})}
function drawGh(tm){GH.forEach(function(w){var e=w.e;if(!e||!vis(e.x))return;var H=hh(e)*s,x=X(e.x)+Math.sin(tm*.07+w.ph)*6*s,gy=GY,a=Math.max(0,Math.min(1,w.t/12)*Math.min(1,(w.dur-w.t)/20)*.8),bw=Math.max(18*s,H*.3);
  g.save();g.globalAlpha=a;g.translate(x,gy);g.scale(bw,H);g.fillStyle=lgr('gh',0,-1,0,0,[0,'rgba(205,170,255,.88)',1,'rgba(70,25,120,.08)']);
  g.beginPath();g.moveTo(0,-1.02);g.bezierCurveTo(-.9,-.95,-1,-.55,-1.05,-.1);
  for(var i=0;i<4;i++){var fx=-1.05+2.1*(i+1)/4;g.quadraticCurveTo(fx-.26,Math.sin(tm*.12+i+w.ph)*.05+.05,fx,-.06)}g.bezierCurveTo(1,-.55,.9,-.95,0,-1.02);g.fill();g.restore();
  g.save();g.globalCompositeOperation='lighter';glow(x-bw*.28,gy-H*.78,bw*.2,'#ffffff',a);glow(x+bw*.28,gy-H*.78,bw*.2,'#ffffff',a);glow(x,gy-H*.5,H*.62,FB[2].col,a*.22);
  if(QLV<2)for(var k=0;k<3;k++){var an=tm*.06+k*2.09;glow(x+Math.cos(an)*bw*1.15,gy-H*(.5+.3*Math.sin(an*1.3+k)),bw*.2,'#c9a0ff',a*.9)}
  if(w.fl>0){g.globalAlpha=w.fl/6*.7;g.strokeStyle='#d6b8ff';g.lineWidth=2*s;g.beginPath();g.arc(x,gy-H*.5,H*.55,0,PI2);g.stroke()}g.restore()})}
function beast(m,u){var f=m.face,mv=Math.abs(m.vx)>.5,bob=mv?Math.abs(Math.sin(m.walk*.25))*2.5:0,wk=mv?Math.sin(m.walk*.5)*3:0;g.scale(f,1);
  g.fillStyle='#2a6a58';g.fillRect(-9+wk,-9-bob,4,9);g.fillRect(6-wk,-9-bob,4,9);
  g.translate(0,-bob);g.fillStyle=lgr('mn',0,-26,0,-6,[0,'#7cffc4',1,'#1c7a62']);g.beginPath();g.ellipse(0,-15,16,9.5,0,0,PI2);g.fill();
  g.strokeStyle='#7cffc4';g.lineWidth=2;g.beginPath();g.moveTo(-14,-16);g.quadraticCurveTo(-24,-24+wk,-22,-30);g.stroke();
  g.fillStyle='#4ad6a0';g.beginPath();g.arc(15,-21,7.5,0,PI2);g.fill();g.fillStyle='#e8fff6';g.beginPath();g.moveTo(11,-26);g.lineTo(9,-35);g.lineTo(15,-27);g.fill();g.beginPath();g.moveTo(17,-27);g.lineTo(21,-35);g.lineTo(21,-26);g.fill();
  g.fillStyle='#ff4a4a';g.beginPath();g.arc(18,-22,1.8,0,PI2);g.fill()}
function drawMn(tm){MN.forEach(function(m){if(!vis(m.x))return;var u=s*1.15,x=X(m.x),gy=GY,pop=m.sp>0?1-m.sp/14:1,k=pop<1?.3+.7*(1-Math.pow(1-pop,3)):1,a=Math.min(1,m.l/40)*(pop<1?pop:1),lun=m.atk>0?Math.sin(m.atk/10*Math.PI)*9*u*m.face:0;
  g.save();g.globalAlpha=a;g.translate(x+lun,gy);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,0,16*u*k,3.5*u*k,0,0,PI2);g.fill();
  g.save();g.scale(u*k,u*k);beast(m,1);g.restore();
  g.globalCompositeOperation='lighter';glow(0,-15*u,26*u*k,FB[1].col,a*.34+(pop<1?(1-pop)*.5:0));if(m.atk>6){g.globalAlpha=a*(m.atk-6)/4;g.strokeStyle='#e8fff6';g.lineWidth=2*s;g.beginPath();g.arc(m.face*22*u,-18*u,16*u,-1.1,1.1);g.stroke()}
  g.restore()})}
function drawAx(){AX.forEach(function(w){if(!vis(w.cx))return;var x=X(w.cx),t=w.t,u=Math.min(1,t/w.n),k=2.6*s,col='#ff8a3a';
  g.save();
  if(t<w.n){g.save();g.translate(x,GY-4*s);g.scale(1,.26);var pu=.5+.3*Math.sin(t*.5);g.strokeStyle=rc('#ff5a2a',pu);g.lineWidth=3*s;g.beginPath();g.arc(0,0,CF.ax.r*s*(1-.25*u),0,PI2);g.stroke();
    g.fillStyle=rc('#ff5a2a',.05+.12*u);g.fill();g.restore()}
  var h=axH(w),a=t<w.n?Math.min(1,t/6):Math.max(0,1-(t-w.n-16)/26);
  g.globalCompositeOperation='lighter';if(t<w.n)for(var i=1;i<=4;i++)glow(x,Y(h+i*46),(96-i*14)*s,col,(.34-i*.06)*a);
  glow(x,Y(h),110*s,col,.4*a);
  g.globalCompositeOperation='source-over';g.globalAlpha=a;g.translate(x,Y(h));g.rotate(Math.PI);g.scale(k,k);var im=sprOk(3);if(im){var h3=100,w3=h3*im.naturalWidth/im.naturalHeight;g.drawImage(im,-w3/2,-h3/2,w3,h3)}else axe(1,col);
  g.restore()})}
function drawSw(){
  g.save();g.globalCompositeOperation='lighter';SW.forEach(function(w){if(w.px===undefined||!vis(w.px))return;var fa=Math.min(1,w.age/6);
    for(var k=0;k<w.tr.length;k++){var q=w.tr[k],f=(k+1)/w.tr.length;glow(X(q.x),Y(q.y),(5+9*f)*s,'#8fd8ff',.12+.3*f)}
    glow(X(w.px),Y(w.py),(w.t<0?14:19)*s,'#6fd0ff',(w.t<0?.3:.5)*fa)});g.restore();
  SW.forEach(function(w){if(w.px===undefined||!vis(w.px))return;var fa=Math.min(1,w.age/6),k=(.45+.55*(1-Math.pow(1-fa,3)))*s*(w.t<0?.95:1.12);
    g.save();g.globalAlpha=fa;g.translate(X(w.px),Y(w.py));g.rotate(w.ang);var im=sprOk(0);if(im){var h2=44*s*(.5+.5*fa)*(w.t<0?.9:1.05),w2=h2*im.naturalWidth/im.naturalHeight;g.drawImage(im,-w2/2,-h2/2,w2,h2)}else blade(k);g.restore()})}
function drawSp(){if(!SP.length)return;g.save();g.globalCompositeOperation='lighter';for(var i=0;i<SP.length;i++){var p=SP[i],a=p.l/p.L;glow(X(p.x),Y(p.y),p.r*s*(1.1+a*1.3),p.c,a*.95)}g.restore()}
function drawAll(){var tm=fr;QLV=window.QL|0;S(drawArt,tm);S(drawRg);S(drawGh,tm);S(drawMn,tm);S(drawAx);S(drawSw);S(drawSp)}
var _aura=ZC.aura;
ZC.aura=function(){var r=_aura.apply(this,arguments);try{if(Date.now()-LS<300&&started&&!vil&&on())drawAll()}catch(e){}return r};

/* ---------- Giao diện ---------- */
var bar,btn,pb,ov;
function css(){var c=document.createElement('style');c.textContent='#fb-bar{position:fixed;right:60px;top:calc(124px + env(safe-area-inset-top,0px));display:none;flex-direction:column;gap:6px;z-index:2;contain:layout style}@media (min-width:641px){#fb-bar{top:calc(128px + env(safe-area-inset-top,0px))}}'+
'#fb-bar button{position:relative;width:44px;height:44px;border-radius:50%;border:2px solid #b8964e;background:#1d1510;color:#fff;font-size:20px;line-height:1;padding:0;overflow:hidden;touch-action:manipulation}#fb-bar button small{position:absolute;left:0;right:0;bottom:1px;font-size:9px;color:#ffe9a0}#fb-bar button.cd{opacity:.6}#fb-bar button.p{width:30px;height:30px;font-size:14px;align-self:center}'+
'#fb-ov{position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3}#fb-ov .bx{max-width:470px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px}'+
'#fb-ov h2{margin:0 0 4px;color:#ffe27a;font-size:19px}#fb-ov .sm{font-size:12.5px;opacity:.82;line-height:1.5}#fb-ov .cd{display:flex;gap:10px;align-items:flex-start;border:1px solid #4a3828;border-radius:10px;padding:8px;margin:7px 0;background:#140d0a}#fb-ov .cd.on{border-color:#ffe27a}#fb-ov .cd .ic{font-size:30px;width:46px;text-align:center}#fb-ov .cd .t{font-size:12px;opacity:.9;line-height:1.5}'+
'#fb-ov button{background:#8a6420;color:#fff;border:1px solid #ffe27a;border-radius:7px;padding:4px 10px;font-size:13px;margin:2px 3px 2px 0}#fb-ov button:disabled{opacity:.4}#fb-ov .row{display:flex;gap:8px;margin-top:10px}#fb-ov .row button.g{background:#3a3a3a;border-color:#777;flex:1}';document.head.appendChild(c)}
function build(){css();bar=document.createElement('div');bar.id='fb-bar';btn=document.createElement('button');
  btn.onpointerdown=function(e){e.stopPropagation();e.preventDefault();castFB(false)};btn.addEventListener('click',function(e){e.stopPropagation()});bar.appendChild(btn);
  pb=document.createElement('button');pb.className='p';pb.textContent='🔮';pb.onpointerdown=function(e){e.stopPropagation();e.preventDefault();open()};bar.appendChild(pb);document.body.appendChild(bar);
  ov=document.createElement('div');ov.id='fb-ov';['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(!b){if(e.target===ov)close();return}var a=b.dataset.a,i=+b.dataset.i;if(a==='x')close();else if(a==='b'){if(!chosen(D())){pend=i;render()}}else if(a==='y')bind(i);else if(a==='n'){pend=-1;render()}else if(a==='u')up(i)});document.body.appendChild(ov)}
var pend=-1;
function bind(i){if(!on()){say('Cần thành Đạo Thể');return}var d=D();if(chosen(d)){pend=-1;say('Đã chọn pháp bảo bổn mệnh, không thể chọn lại');render();return}if(gold<CF.bindGold){say('Không đủ vàng ('+nf(CF.bindGold)+')');return}gold-=CF.bindGold;d.lv[i]=1;d.t=i;d.c[i]=0;pend=-1;clearAll();cdT=0;say('🔮 Đã chọn '+FB[i].n);save();render()}
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
function render(){if(!ov||ov.style.display==='none')return;var d=D(),o='<div class="bx"><h2>🔮 Pháp Bảo Bổn Mệnh</h2><div class="sm">Chỉ Đạo Thể mới có. <b style="color:#ffe27a">Chỉ được chọn 1 trong 4 pháp bảo và chỉ chọn 1 LẦN</b> (không thể đổi). Pháp bảo bay sau lưng, kèm 1 kỹ năng bị động và 1 kỹ năng chủ động (nút 🔮 bên trái cột Thần Thông hoặc phím F; tự dùng khi bật AUTO). Hồi chiêu '+CF.cd+'s · '+CF.mp+' MP.<br>Vàng: <b style="color:#ffe27a">'+nf(gold)+'</b> · Linh Thạch: <b style="color:#8fe9ff">'+(ltOk()?nf(ltHave())+'💎':'cần đăng nhập ☁')+'</b><br>Lên cấp (tối đa Lv'+CF.max+'): thi triển kỹ năng chủ động đủ '+nf(CF.castBase)+' lần để lên Lv2, mỗi cấp sau gấp đôi (×2); và tốn '+CF.ltBase+'💎 Linh Thạch, tăng dần theo cấp.</div>';
  for(var i=0;i<4;i++){var f=FB[i],l=d.lv[i],has=l>0,eqd=d.t===i&&has,lc=Math.max(1,l),ch=chosen(d);
    o+='<div class="cd'+(eqd?' on':'')+'"'+(ch&&!has?' style="opacity:.5"':'')+'><div class="ic">'+sprTag(i,56)+'</div><div style="flex:1"><b style="color:'+f.col+'">'+f.n+'</b> <span class="sm">· '+f.attr+(has?' · Cấp '+l+'/'+CF.max:(ch?' · không thể chọn':' · chưa chọn'))+(eqd?' · <b style="color:#7be07a">Đã chọn</b>':'')+'</span>'+
      '<div class="t">📈 '+statTx(i,lc)+(has&&l<CF.max?' → <span style="color:#7be07a">'+statTx(i,l+1)+'</span>':'')+
      '<br>🛡️ <b>Bị động · '+f.pa.n+':</b> '+f.pa.d+'<br>⚔️ <b>Chủ động · '+f.ac.n+':</b> '+f.ac.d+' <span class="sm">('+actTx(i,lc)+')</span></div><div>'+
      (!has?(ch?'<span class="sm">🔒 Đã chọn pháp bảo khác, không thể đổi</span>':(pend===i?'<div class="sm" style="margin:2px 0;color:#ffe27a">Chọn <b>'+f.n+'</b>? Chỉ được chọn 1 lần, <b>KHÔNG thể đổi</b>.</div><button data-a="y" data-i="'+i+'"'+(gold>=CF.bindGold?'':' disabled')+'>Xác nhận ('+nf(CF.bindGold)+'💰)</button><button data-a="n" data-i="'+i+'" style="background:#444;border-color:#888">Huỷ</button>':'<button data-a="b" data-i="'+i+'">Chọn pháp bảo này</button>')):
        (l<CF.max?'<button data-a="u" data-i="'+i+'"'+(((d.c[i]|0)>=need(l)&&!busy)?'':' disabled')+'>Lên Lv'+(l+1)+' ('+cost(l)+'💎)</button>':'<span class="sm">Đã đạt cấp tối đa</span>'))+'</div>'+
      (has&&l<CF.max?'<div class="sm" style="margin-top:3px">Thi triển: <b>'+nf(Math.min(d.c[i]|0,need(l)))+'/'+nf(need(l))+'</b> lần'+((d.c[i]|0)>=need(l)?' <b style="color:#7be07a">· đủ điều kiện</b>':'')+'</div>':'')+'</div></div>'}
  o+='<div class="row"><button class="g" data-a="x">Đóng</button></div></div>';ov.innerHTML=o}
function open(){if(!on()){say('Chỉ Đạo Thể (đã hợp đạo) mới có Pháp Bảo Bổn Mệnh');return}if(!ov)build();ov.style.display='flex';render()}
function close(){pend=-1;if(ov)ov.style.display='none'}
function card(){
  if(!on())return'<div class="dt">🔒 <b>Pháp Bảo Bổn Mệnh</b><br><span style="opacity:.8">Mở khoá khi thành Đạo Thể (Hợp Đạo): kiếm linh · hồ lô · hồn phiên · cự phủ.</span></div>';
  var t=eq(),b=t>=0?FB[t]:null,l=LV();
  return'<div class="dt">🔮 <b>Pháp Bảo Bổn Mệnh</b><br>'+(b?sprTag(t,24)+' <b style="color:'+b.col+'">'+b.n+'</b> · Cấp '+l+'/'+CF.max+'<br><span style="opacity:.85">'+statTx(t,l)+'</span><br>':'<span style="opacity:.85">Chưa chọn pháp bảo bổn mệnh. Chỉ được chọn 1 trong 4 loại và chỉ 1 lần.</span><br>')+'<button onclick="FABAO.open()">Mở bảng Pháp Bảo</button></div>'}
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
    var rem=Math.max(0,Math.ceil((cdT-t)/1000)),key=k+'|'+rem;if(btn._k!==key){btn._k=key;btn.className=rem?'cd':'';btn.style.borderColor=FB[k].col;btn.innerHTML=sprTag(k,30)+(rem?'<small>'+rem+'s</small>':'')}
    if(k===1&&!over&&dt&&P.hp>0)P.hp=Math.min(mx(),P.hp+mx()*(.0025+.0003*LV())*dt);
  }catch(e){}
},250);

window.FABAO={open:open,close:close,on:on,cast:function(){return castFB(false)},data:D,cfg:CF,defs:FB,type:eq,level:LV};
})();
