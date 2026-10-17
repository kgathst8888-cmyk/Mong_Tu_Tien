/* ===== ✨ THÁNH ĐỊA · BẢN ĐỒ 6 (Lv80-100) · 2 BOSS: MA THẦN + KIẾM THÁNH ×10 =====
 * Mở khoá ô "Thánh Địa" trong bảng chọn bản đồ Linh Giới (world/36-linh-gioi-maps.js: HOLY.open=true, go() gọi THANHDIA.ask()).
 * Trận kiểu phụ bản (dg.td): đánh lần lượt MA THẦN → KIẾM THÁNH. Tái sử dụng nguyên kỹ năng/hình ảnh của 2 boss gốc
 * (cờ e.mt của world/02, cờ e.ks của world/35) nên không viết lại AI, sprite hay chỉ số gốc.
 * Độ mạnh: máu ×TD.hp (10) và sát thương boss gây ra ×TD.atk (10) so với bản gốc (Kiếm Thánh gốc đã ×10 Ma Thần, nên Thánh Địa ×100 Ma Thần).
 *   Giáp (df) GIỮ NGUYÊN bản gốc: df chia sát thương người chơi, nhân ×10 sẽ thành ×100 độ trâu (cùng lý do với world/35).
 * Phần thưởng: KHÔNG rơi trang bị. Mỗi boss chết rơi 1 RƯƠNG NGẪU NHIÊN (bảng TD.chest, trọng số = tỉ lệ):
 *   tỉ lệ cao 500k / 1m vàng · tỉ lệ thấp 300 / 500 Quặng Sắt + Huyền Kim · tỉ lệ thấp 1 Mảnh Thánh.
 * Vé vào: tốn TD.cost (20) Linh Thạch qua ví tài khoản ☁ (LT.spend, cần đăng nhập) và chỉ 1 lần mỗi TD.cd (1 giờ). Mốc lưu PS[cur].td={next:ms}; chỉ tính khi trừ Linh Thạch thành công.
 * Phụ thuộc: mtStats/mtExit/MT_* (02), KTHANH.cfg (35), LGMAP (36), LCT (10), dgSp/dgHurt/dgTick/dgHud/dgFoe/bgd/drop/xbg/gcf (engine),
 *   MN.get() (13-mining: .fe/.hk), HL.addSH (01b), QE, sv, HDAO. Thiếu phụ thuộc nào thì module tự tắt, không ảnh hưởng game. */
(function(){
'use strict';
if(typeof mtStats!=='function'||typeof mtExit!=='function'||typeof MT_LV==='undefined'||typeof MT_ATK==='undefined'||typeof MT_DEF==='undefined'||typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof dgTick!=='function'||typeof gcf!=='function'||typeof LCT==='undefined'||!LCT.on||typeof PS==='undefined'||!window.KTHANH||!window.LGMAP)return;

var TD={hp:10,atk:10,gap:120,cost:20,cd:3600e3, /* cost = Linh Thạch 💎 mỗi lần vào · cd = 1 giờ/lần (theo từng nhân vật: PS[cur].td.next) */
 chest:[ /* w = trọng số (tổng 100 → % trực tiếp) */
  {w:62,t:'gold',v:500000},
  {w:30,t:'gold',v:1000000},
  {w:4,t:'ore',v:300},
  {w:2,t:'ore',v:500},
  {w:2,t:'sh',v:1}]};

function say(t,c,l,y){try{DT.push({x:P.x,y:y||200,s:t,c:c||'#ffe27a',g:1,l:l||150})}catch(e){}}
function nf(n){try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return String(n)}}
function hdao(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function isBoss(e){return e.k=='boss'}

/* ---------- vào / ra ---------- */
function enter(){
 if(!started||!hdao())return;
 if(bo)tg();
 try{if(LCT.on())LCT.off()}catch(e){}
 vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();
 dg={t:0,n:20,kill:20,td:1,ph:0};
 say('✨ Vào Thánh Địa · Ma Thần ×'+TD.hp+' & Kiếm Thánh ×'+TD.hp,'#fff0a0',170)}
function K(){var p=PS[cur];if(!p)return null;if(!p.td||typeof p.td!=='object')p.td={next:0};return p.td}
function left(){var k=K(),n=k&&k.next>0?k.next-Date.now():0;if(n>TD.cd)n=TD.cd;return Math.max(0,n)}
function fmt(ms){var t=Math.ceil(ms/1000),m=Math.floor(t/60);return m+':'+String(t%60).padStart(2,'0')}
function status(){var l=left();return l>0?'⏳ Cổng mở lại sau '+fmt(l):'✅ Cổng đã mở · '+TD.cost+'💎/lượt · 1 giờ/lần'}
/* thông báo khi cổng mở lại: biển báo trên cùng màn hình (~8 giây) + chữ nổi, ở mọi bản đồ */
var bn=null,bt=0;
function banner(t){try{if(!bn){bn=document.createElement('div');bn.id='td-ann';bn.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translate(-50%,-14px);z-index:9500;max-width:92vw;padding:10px 18px;border-radius:12px;border:2px solid #ffd870;background:linear-gradient(#4a3a10ee,#14100aee);color:#fff2c0;font:bold 15px/1.35 "KTH Serif","Songti SC",STKaiti,KaiTi,serif;text-align:center;box-shadow:0 0 22px #ffd070aa,0 6px 20px #000a;opacity:0;transition:opacity .35s,transform .35s;pointer-events:none';document.body.appendChild(bn)}
 bn.textContent=t;bn.style.opacity=1;bn.style.transform='translate(-50%,0)';clearTimeout(bt);bt=setTimeout(function(){bn.style.opacity=0;bn.style.transform='translate(-50%,-14px)'},8000)}catch(e){}}
setInterval(function(){try{if(typeof started==='undefined'||!started||!PS[cur])return;var k=K(),n=Date.now();if(k.next>n+TD.cd)k.next=n+TD.cd;
 if(k.next>0&&n>=k.next){k.next=0;var t='✨ Cổng THÁNH ĐỊA đã mở! Vào lại được ('+TD.cost+'💎)';banner(t);say(t,'#fff0a0',220);try{sv()}catch(e){}}}catch(e){}},1000);
var busy=0;
function pay(){
 if(busy)return;
 if(!window.LT||!LT.spend){say('Chưa có ví Linh Thạch (cần module Chợ Giao Dịch)','#ffd98a',160);return}
 try{if(!LT.logged()){say('☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+TD.cost+'💎)','#ffd98a',170);return}}catch(e){return}
 if(left()>0){say('⏳ Thánh Địa mở lại sau '+fmt(left()),'#ffd98a',150);return}
 busy=1;
 LT.spend(TD.cost,'thanh_dia').then(function(r){busy=0;
  if(r&&r.ok){var k=K();if(k)k.next=Date.now()+TD.cd;try{sv()}catch(e){}enter()}
  else if(r&&r.err==='poor')say('💎 Không đủ Linh Thạch (cần '+TD.cost+')','#ffd98a',170);
  else say('Không trừ được Linh Thạch, thử lại sau','#ffd98a',150)
 },function(){busy=0;say('Lỗi mạng, chưa trừ Linh Thạch','#ffd98a',150)})}
function ask(){
 if(!started)return;
 if(!hdao()){say('☯ Chỉ nhân vật Đạo Thể (đã Hợp Đạo) mới vào được Thánh Địa','#ffd98a',160);return}
 if(dg)return;
 if(left()>0){say('⏳ Cổng Thánh Địa mở lại sau '+fmt(left())+' (1 giờ vào 1 lần)','#ffd98a',170);return}
 gcf('Vào THÁNH ĐỊA? Tốn '+TD.cost+' 💎 Linh Thạch, 1 giờ vào 1 lần.\nĐánh lần lượt MA THẦN rồi KIẾM THÁNH, mỗi boss mạnh gấp '+TD.hp+' lần bản thường.\nThất bại sẽ phải hồi sinh. Mỗi boss hạ được rơi 1 Rương ngẫu nhiên (không rơi trang bị).',pay)}
function exit(){mtExit();try{LCT.enter()}catch(e){}}

/* ---------- boss ---------- */
function spawnBoss(i){
 dgSp('boss');var e=E[E.length-1];if(!e)return;
 var b=mtStats(),K=window.KTHANH.cfg||{hp:10,def:3};
 e.td=1;e.lv=MT_LV;e.m=7;
 if(i===0){e.mt=1;e.nm='👹 Ma Thần · Thánh Địa';e.hp=e.max=b.hp*TD.hp;e.df=b.df;
  say('👹 MA THẦN giáng thế tại Thánh Địa!','#d070ff',170,230)}
 else{e.ks=1;e.nm='🗡️ Kiếm Thánh · Thánh Địa';e.gc=['#2a78c8','#9fe8ff'];try{if(DGI.bossKS)e.sp='bossKS'}catch(x){}
  e.hp=e.max=b.hp*K.hp*TD.hp;e.df=b.df/MT_DEF*K.def;
  say('🗡️ KIẾM THÁNH giáng thế tại Thánh Địa!','#8fe8ff',170,230)}}

/* sát thương boss gây ra ×TD.atk; wrapper gốc của 02/35 (e.mt / e.ks) nhân tiếp phần của chúng */
var _hurt=dgHurt;dgHurt=function(e,mu){return _hurt.call(this,e,e&&e.td?mu*TD.atk:mu)};

/* ---------- vòng đời trận: Ma Thần → nghỉ → Kiếm Thánh → xong ---------- */
function win(){try{QE('boss');QE('td')}catch(e){}try{sv()}catch(e){}say('🏆 Hạ cả Ma Thần và Kiếm Thánh · Thánh Địa!','#fff0a0',220,230)}
var _tick=dgTick;dgTick=function(){
 if(!dg||!dg.td)return _tick.apply(this,arguments);
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;dg.ph=0;spawnBoss(0)}
 else if(dg.bs&&!dg.done&&!E.some(isBoss)){
  if(dg.ph===0){dg.ph=1;dg.w=TD.gap;say('⚔️ Kiếm Thánh sắp xuất hiện...','#8fe8ff',110)}
  else if(dg.ph===1){if(--dg.w<=0){dg.ph=2;spawnBoss(1)}}
  else if(dg.ph===2){dg.done=1;dg.out=300;win()}}
 if(dg.done&&--dg.out<=0)exit()};

/* ---------- rương ngẫu nhiên (KHÔNG trang bị) ---------- */
function pickChest(){var t=0,i;for(i=0;i<TD.chest.length;i++)t+=TD.chest[i].w;var r=R()*t;for(i=0;i<TD.chest.length;i++){r-=TD.chest[i].w;if(r<0)return TD.chest[i]}return TD.chest[0]}
function openChest(e){
 var c=pickChest(),x=e&&e.x||P.x,L='🎁 Rương Thánh Địa: ',m,col='#ffe27a';
 if(c.t==='gold'){gold+=c.v;m=L+'+'+nf(c.v)+' 💰'}
 else if(c.t==='ore'){var ok=false;try{var S=MN.get();S.fe=(S.fe|0)+c.v;S.hk=(S.hk|0)+c.v;ok=true}catch(x2){}
  m=ok?L+'+'+nf(c.v)+' 🔩 Quặng Sắt · +'+nf(c.v)+' 🌑 Huyền Kim':L+'(không nhận được quặng)';col='#bff4ff'}
 else{var ok2=false;try{HL.addSH(c.v);ok2=true}catch(x3){}
  m=ok2?L+'+'+c.v+' 💠 Mảnh Thánh!!!':L+'(không nhận được Mảnh Thánh)';col='#ff9aff'}
 DT.push({x:x,y:150,s:m,c:col,g:1,l:240});
 try{sv()}catch(x4){}}
var _drop=drop;drop=function(e){if(!e||!e.td)return _drop.apply(this,arguments);openChest(e)};

/* ---------- HUD / nền / nút rời trận ---------- */
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);
 if(dg&&dg.td){var b=E.find(isBoss),n=dg.ph>=2?'🗡️ KIẾM THÁNH':'👹 MA THẦN';
  dgh.innerHTML='<div class="dgt">✨ THÁNH ĐỊA · '+n+' · Lv'+MT_LV+' · ×'+TD.hp+'</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};
var _bg=bgd;bgd=function(gy){if(dg&&dg.td){xbg(gy,7);g.save();g.fillStyle=dg.ph>=2?'rgba(10,50,90,.38)':'rgba(60,0,90,.35)';g.fillRect(0,0,W,H);g.restore()}else _bg.apply(this,arguments)};
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){
 if(dg&&dg.td){ev.stopPropagation();if(!started)return;gcf('Rời Thánh Địa?\nBạn sẽ về Thành Thị Linh Giới, có thể vào lại bất cứ lúc nào.',exit);return}
 return _dp.call(this,ev)}}catch(e){}

window.THANHDIA={cfg:TD,ask:ask,left:left,status:status,exit:exit};
})();
