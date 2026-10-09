/* ===== 🗡️ KIẾM THÁNH · BOSS THÀNH THỊ LINH GIỚI =====
 * Dựa trên Ma Thần (world/02-demon-realm.js): cùng kiểu trận đấu (dg), cùng công thức chỉ số nhưng mạnh gấp CF.hp / CF.atk lần.
 * CHỈ nhân vật ĐẠO THỂ (đã Hợp Đạo, HDAO.on()) mới đánh được: ask()/enter() chặn, ô cổng hiện "Chỉ Đạo Thể được đánh".
 * Cổng vào: Thành Thị Linh Giới → cổng 3 "Kiếm Thánh Đài" (thay ô "Thiên Giới Thí Luyện" sắp mở; vá trực tiếp mảng LCT.gates, không sửa file 10).
 * Hồi sinh: hạ Kiếm Thánh → CF.respawn (10 phút) sau boss mới xuất hiện. Mốc giờ lưu theo từng nhân vật: PS[cur].ks = {next:mốc ms (0 = đang sống), an:0/1 đã báo hồi sinh}.
 * Thông báo: mỗi lần hồi sinh hiện biển báo trên cùng màn hình (#ks-ann, ~8 giây) + chữ nổi trên màn hình chính, ở mọi bản đồ.
 * Phần thưởng: vàng, mảnh chế tạo, 4 trang bị, tu vi (như Ma Thần, vàng/mảnh ×CF.rw) + Mảnh Sách Thần Thông (TTHONG.drop(), 5–20 mảnh) cho Đạo Cảnh.
 * Chỉnh độ khó/hồi sinh: khối CF. DEF không nhân ×10 vì DEF chia sát thương người chơi (sẽ thành ×100 độ trâu) — giữ bằng Ma Thần (CF.def = MT_DEF).
 * Phụ thuộc: mtStats/mtExit/MT_* (02), dgSp/dgHurt/dgAI/dgTick/dgHud/dgFoe/bgd/drop (engine), LCT (10), TTHONG (34), PS, cur, E, P, DT, FX. */
(function(){
'use strict';
if(typeof mtStats!=='function'||typeof mtExit!=='function'||typeof MT_LV==='undefined'||typeof MT_ATK==='undefined'||typeof MT_DEF==='undefined'||typeof dgHurt!=='function'||typeof dgTick!=='function'||typeof LCT==='undefined'||!LCT.gates||typeof PS==='undefined')return;
var CF={hp:10,atk:10,def:3,rw:3,respawn:600000,gate:2};

/* ---------- mốc hồi sinh ---------- */
function K(){var p=PS[cur];if(!p)return null;if(!p.ks||typeof p.ks!=='object')p.ks={next:0,an:1};return p.ks}
function left(){var k=K();return k&&k.next>0?Math.max(0,k.next-Date.now()):0}
function alive(){return left()<=0}
function fmt(ms){var t=Math.ceil(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function say(t,c,l){try{DT.push({x:P.x,y:200,s:t,c:c||'#8fe8ff',g:1,l:l||150})}catch(e){}}
function save(){try{sv()}catch(e){}}

/* ---------- thông báo ---------- */
var bn=null,bt=0,cssOk=false;
function css(){if(cssOk)return;cssOk=true;var s=document.createElement('style');s.textContent='#ks-ann{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translate(-50%,-14px);z-index:9500;max-width:92vw;padding:10px 18px;border-radius:12px;border:2px solid #ffd870;background:linear-gradient(#4a1830ee,#14081cee);color:#fff2c0;font:bold 15px/1.35 "KTH Serif","Songti SC",STKaiti,KaiTi,serif;text-align:center;box-shadow:0 0 22px #ff6a7aaa,0 6px 20px #000a;opacity:0;transition:opacity .35s,transform .35s;pointer-events:none}#ks-ann.on{opacity:1;transform:translate(-50%,0)}';document.head.appendChild(s)}
function banner(t){try{css();if(!bn){bn=document.createElement('div');bn.id='ks-ann';document.body.appendChild(bn)}bn.textContent=t;void bn.offsetWidth;bn.classList.add('on');clearTimeout(bt);bt=setTimeout(function(){bn.classList.remove('on')},8000)}catch(e){}}
function announce(){var t='🗡️ KIẾM THÁNH đã hồi sinh tại Thành Thị Linh Giới!';banner(t);say(t,'#ff9aa8',220)}
function tick(){try{if(typeof started==='undefined'||!started||!PS[cur])return;var k=K(),n=Date.now();if(k.next>n+CF.respawn)k.next=n+CF.respawn;if(k.next>0&&n>=k.next)k.next=0;if(!k.next&&!k.an){k.an=1;announce();save()}}catch(e){}}
setInterval(tick,1000);

/* ---------- hộp xác nhận ---------- */
function confirmBox(text,yesLabel,noLabel,yes){if(document.getElementById('ks-cf'))return;var o=document.createElement('div');o.id='ks-cf';o.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center';var bx=document.createElement('div');bx.style.cssText='background:linear-gradient(#3a2618,#150d09);border:2px solid #b8964e;border-radius:14px;padding:16px 18px;max-width:82vw;color:#f2e3b3;text-align:center;font-size:15px;line-height:1.5;box-shadow:0 8px 30px #000';var t=document.createElement('div');t.style.cssText='white-space:pre-line;margin-bottom:14px';t.textContent=text;bx.appendChild(t);
 function mk(n,f){var b=document.createElement('button');b.textContent=n;b.style.cssText='margin:0 6px;padding:9px 20px;font-size:15px;border-radius:9px;border:1px solid #b8964e;background:#5a3a22;color:#fff;cursor:pointer';b.onpointerdown=function(e){e.stopPropagation()};b.onclick=function(e){e.stopPropagation();o.remove();if(f)f()};return b}
 bx.appendChild(mk(yesLabel,yes));bx.appendChild(mk(noLabel,null));o.appendChild(bx);['pointerdown','pointerup','click','touchstart','touchend'].forEach(function(ev){o.addEventListener(ev,function(e){e.stopPropagation()})});document.body.appendChild(o)}

/* ---------- vào / ra / thắng ---------- */
function stats(){var b=mtStats();return{hp:b.hp*CF.hp,df:b.df/MT_DEF*CF.def}}
function spawn(){dgSp('boss');var e=E[E.length-1],st=stats();e.ks=1;e.nm='🗡️ Kiếm Thánh';e.gc=['#2a78c8','#9fe8ff'];if(DGI.bossKS)e.sp='bossKS';e.lv=MT_LV;e.m=7;e.hp=e.max=st.hp;e.df=st.df;say('🗡️ KIẾM THÁNH giáng thế!','#8fe8ff',170)}
function enter(){if(!started||!alive()||!LCT.on())return;if(!(window.HDAO&&HDAO.on())){say('☯ Chỉ nhân vật Đạo Thể (đã Hợp Đạo) mới được đánh Kiếm Thánh','#ffd98a',160);return}if(bo)tg();try{LCT.off()}catch(e){}vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:20,kill:20,ks:1};say('🗡️ Khiêu chiến Kiếm Thánh!','#8fe8ff',130)}
function ask(){if(!started)return;if(!(window.HDAO&&HDAO.on())){say('☯ Chỉ nhân vật Đạo Thể (đã Hợp Đạo) mới được đánh Kiếm Thánh','#ffd98a',160);return}if(!alive()){say('⏳ Kiếm Thánh hồi sinh sau '+fmt(left()),'#ffd98a',150);return}
 confirmBox('Khiêu chiến KIẾM THÁNH (Lv'+MT_LV+', mạnh gấp '+CF.hp+' lần Ma Thần)?\nThất bại sẽ phải hồi sinh. Hạ được Kiếm Thánh, '+Math.round(CF.respawn/60000)+' phút sau hắn hồi sinh. Rơi Mảnh Sách Thần Thông.','Khiêu chiến','Thôi',enter)}
function exit(){mtExit();try{LCT.enter()}catch(e){}}
function win(){var k=K();k.next=Date.now()+CF.respawn;k.an=0;try{QE('boss')}catch(e){}try{if(window.LT&&LT.earnKS)LT.earnKS(2)}catch(e){}save();say('🏆 Hạ Kiếm Thánh! Hồi sinh sau '+Math.round(CF.respawn/60000)+' phút','#8fe8ff',220)}

/* ---------- cổng trong Thành Thị ---------- */
var G=LCT.gates[CF.gate];
if(G){G.sn='Kiếm Thánh';G.n='Kiếm Thánh Đài';G.e='🗡️';G.c='#ff7a8a';G.rgb='255,122,138';G.open=1;G.go=ask;
 Object.defineProperty(G,'sub',{configurable:true,enumerable:true,get:function(){try{if(!(window.HDAO&&HDAO.on()))return'☯ Chỉ Đạo Thể được đánh';return alive()?'Boss Lv'+MT_LV+' · chạm để đánh':'⏳ Hồi sinh '+fmt(left())}catch(e){return'Boss Lv'+MT_LV}}})}

/* ---------- sức mạnh: sát thương boss gây ra ×MT_ATK×CF.atk (Ma Thần chỉ ×MT_ATK) ---------- */
var _hurt=dgHurt;dgHurt=function(e,mu){return _hurt.call(this,e,e&&e.ks?mu*MT_ATK*CF.atk*2:mu)};

/* ---------- kỹ năng: Phi Kiếm Trảm / Vạn Kiếm Quy Tông (dưới 50% máu) ---------- */
var _ai=dgAI;dgAI=function(e){_ai.apply(this,arguments);if(!e||!e.ks||e.in>0)return;
 e.kc=(e.kc|0)+1;var en=e.hp<e.max*.5;
 if(e.kc>=(en?270:420)){e.kc=0;e.kw=60;e.ken=en;e.kxs=en?[P.x-200,P.x,P.x+200]:[P.x];
  DT.push({x:e.x,y:230,s:en?'🗡️ Vạn Kiếm Quy Tông!':'🗡️ Phi Kiếm Trảm!',c:'#8fe8ff',g:1,l:70});
  e.kxs.forEach(function(wx){FX.push({x:wx,l:60,m:60,fn:function(f,p,X,gy){g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);g.fillStyle='rgba(120,220,255,'+(.1+.3*p)+')';g.strokeStyle='#8fe8ff';g.lineWidth=6;g.beginPath();g.arc(0,0,en?120:170,0,6.283);g.fill();g.stroke();g.restore()}})})}
 if(e.kw>0&&--e.kw===0){var xs=e.kxs||[],rr=e.ken?110:170;
  xs.forEach(function(wx){FX.push({x:wx,l:24,m:24,fn:function(f,p,X,gy){var k=1-p*.4,c=colSpr(s);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=1-p;g.drawImage(c,X-70*s*k,gy-400*s,140*s*k,400*s);g.restore()}})});
  dgFl=6;if(xs.some(function(wx){return Math.abs(P.x-wx)<rr}))dgHurt(e,1.1)}};

/* ---------- vòng đời trận ---------- */
var _tick=dgTick;dgTick=function(){if(!dg||!dg.ks)return _tick.apply(this,arguments);if(over||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;spawn()}
 else if(dg.bs&&!E.some(function(e){return e.k=='boss'})&&!dg.done){dg.done=1;dg.out=300;win()}
 if(dg.done&&--dg.out<=0)exit()};

var _drop=drop;drop=function(e){if(!e||!e.ks)return _drop.apply(this,arguments);var L=MT_LV;gold+=gP(3000*L*CF.rw);var f=(30+Math.floor(R()*10))*CF.rw;frag+=f;DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:140});for(var i=0;i<4;i++)give(gen(L,4),e.x+(i-1.5)*40,150+i*30);try{ZC.gain(5000)}catch(x){}try{if(window.TTHONG)TTHONG.drop()}catch(x){}};

var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);if(dg&&dg.ks){var b=E.find(function(e){return e.k=='boss'});dgh.innerHTML='<div class="dgt">🗡️ KIẾM THÁNH · Lv'+MT_LV+' · ×'+CF.hp+' Ma Thần</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};

/* ---------- hình ảnh (tối ưu): sprite dựng sẵn 1 lần (theo tỉ lệ màn hình + DPR) thay vì tạo gradient/path mỗi khung;
   không vẽ phần phụ khi boss ngoài màn; tự giảm hiệu ứng khi máy yếu (đo thời gian khung hình): q0 đủ · q1 2 kiếm · q2 chỉ hào quang tĩnh ---------- */
var SP={},spN=0,fq={ms:16.7,t:0,q:0};
function dpr(){return typeof DPR==='number'&&DPR>0?DPR:1}
function spr(k,sc,w,h,draw){var key=k+'|'+Math.round(sc*50)+'|'+dpr(),c=SP[key];if(c)return c;if(++spN>14){SP={};spN=0}
 var d=dpr();c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*d));c.height=Math.max(1,Math.ceil(h*d));var q=c.getContext('2d');q.scale(d,d);draw(q);return SP[key]=c}
function auraSpr(sc){var R1=225*sc;return spr('a',sc,R1*2,R1*2,function(q){var r=q.createRadialGradient(R1,R1,R1/15,R1,R1,R1);r.addColorStop(0,'rgba(190,240,255,.55)');r.addColorStop(.5,'rgba(70,150,230,.28)');r.addColorStop(1,'rgba(0,30,80,0)');q.fillStyle=r;q.fillRect(0,0,R1*2,R1*2)})}
function swordSpr(sc){return spr('w',sc,20*sc,48*sc,function(q){q.translate(10*sc,35*sc);q.fillStyle='#e8fbff';q.strokeStyle='#6fd8ff';q.lineWidth=1.5;q.beginPath();q.moveTo(0,-34*sc);q.lineTo(6*sc,6*sc);q.lineTo(0,12*sc);q.lineTo(-6*sc,6*sc);q.closePath();q.fill();q.stroke();q.fillStyle='#ffd870';q.fillRect(-9*sc,8*sc,18*sc,3*sc)})}
function colSpr(sc){return spr('c',sc,140*sc,400*sc,function(q){var r=q.createLinearGradient(0,0,0,400*sc);r.addColorStop(0,'rgba(120,200,255,0)');r.addColorStop(1,'rgba(220,250,255,1)');q.fillStyle=r;q.fillRect(0,0,140*sc,400*sc)})}
var _foe=dgFoe;dgFoe=function(e){if(e&&e.ks){
  var n=performance.now(),d=n-fq.t;fq.t=n;if(d>0&&d<250){fq.ms+=(d-fq.ms)*.05;fq.q=fq.ms>26?2:fq.ms>20?1:0}
  var X=(e.x-cam)*s,R1=225*s;
  if(X>-R1&&X<W+R1){var Y=GY-((e.y||0)+110)*s,R0=150*s;
   g.save();g.globalCompositeOperation='lighter';g.globalAlpha=fq.q>1?.9:.8+.2*Math.sin(fr*.1);g.drawImage(auraSpr(s),X-R1,Y-R1,R1*2,R1*2);g.restore();
   var ns=fq.q>1?0:fq.q?2:4;if(ns){var sw=swordSpr(s);for(var k=0;k<ns;k++){var a=fr*.03+k*(6.2832/ns),sx=X+Math.cos(a)*R0*.95,sy=Y+Math.sin(a)*R0*.35-R0*.15;g.save();g.translate(sx,sy);g.rotate(a+1.5708);g.drawImage(sw,-10*s,-35*s,20*s,48*s);g.restore()}}}}
 return _foe.apply(this,arguments)};
var _bg=bgd;bgd=function(gy){if(dg&&dg.ks){xbg(gy,7);g.save();g.fillStyle='rgba(10,50,90,.38)';g.fillRect(0,0,W,H);g.restore()}else _bg.apply(this,arguments)};

/* ---------- nút rời trận ---------- */
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){if(dg&&dg.ks){ev.stopPropagation();if(!started)return;confirmBox('Rời trận Kiếm Thánh?\nBạn sẽ về Thành Thị Linh Giới, có thể khiêu chiến lại bất cứ lúc nào.','Rời đi','Ở lại',exit);return}return _dp.call(this,ev)}}catch(e){}

window.KTHANH={cfg:CF,alive:alive,left:left,ask:ask,enter:enter};
})();
