/* ===== 🌌 PHỤ BẢN 7 "BÍ CẢNH THƯỢNG CỔ" (world/142-bi-canh-thuong-co.js · Fix436) — chế độ roguelike =====
 * Mở từ bảng 🕳 Phụ Bản (thẻ số 7, patch nhỏ ở world/40-phu-ban-2.js). MỌI nhân vật cấp BC.req trở lên đều vào được (Đạo Thể cũng vậy).
 * Mỗi ngày BC.perDay lượt (giờ tin cậy của game, xem core/00b). Lượt tính lúc VÀO.
 * LUỒNG CHƠI: đi qua BC.rooms (10) phòng. Phòng thường: diệt hết đàn quái. Phòng 5 = Boss giữa, phòng 10 = Boss cuối.
 *   Dọn xong mỗi phòng → chọn 1 trong 3 "CƠ DUYÊN" (buff TẠM THỜI, mất khi rời bí cảnh, một số cộng dồn). Sau Boss giữa chỉ ra Cơ Duyên HIẾM.
 * THƯỞNG (KHÔNG rơi trang bị, để khỏi lệch cân bằng đồ): trả NGAY khi dọn mỗi phòng (vàng + EXP/Đạo Linh), nên chết/thoát giữa chừng vẫn giữ phần đã nhận;
 *   Boss giữa và Boss cuối thêm Rương ngẫu nhiên (vàng · Quặng Sắt + Huyền Kim · rất hiếm Mảnh Thánh); hạ Boss cuối thêm BC.lk Linh Thạch KHOÁ.
 *   Cơ Duyên "Vận May" tăng vàng + EXP thưởng.
 * KỶ LỤC TUẦN: lưu theo từng nhân vật (PS[cur].bc9 = {day,used,wk,wb,best,runs,wins}); CHƯA có bảng xếp hạng online (cần thêm SQL nếu muốn).
 * Quái dùng sprite/AI có sẵn của Hầm Ngục (impA/impB/boss), kiểu trận = phụ bản dg (cờ dg.bc) như world/136: bọc dgTick/dgHud/drop/dm/dgHurt,
 *   KHÔNG sửa engine. Phụ thuộc: dgHurt/dgAI/dgTick/dgHud/drop/dm/gcf/mtExit/gP/mx (engine), MN/HL/LT/QE/NHX (tuỳ chọn). Thiếu móc cốt lõi thì module tự tắt.
 * Tắt hẳn: bỏ <script> 142 trong index.html (thẻ số 7 tự ẩn). Chỉnh cân bằng: khối BC bên dưới. */
(function(){
'use strict';
if(typeof dgHurt!=='function'||typeof dgTick!=='function'||typeof dgHud!=='function'||typeof drop!=='function'||typeof dm!=='function'||typeof gcf!=='function'||typeof mtExit!=='function')return;

var BC={
 req:30,perDay:3,rooms:10,midRoom:5,
 cap:6,gap:40,                                   /* số quái sống tối đa · nhịp xuất hiện (khung ≈ 60/giây) */
 base:5,perRoom:2,maxPack:18,                    /* số quái phòng thường = base + perRoom×phòng (tối đa maxPack) */
 hpRoom:.30,atRoom:.15,                          /* mỗi phòng sau: +30% máu, +15% sức đánh quái (Fix437: khó hơn) */
 bossHp:{mid:45,fin:130},bossDf:{mid:2.8,fin:3.6},bossAt:{mid:.6,fin:1.0},   /* × máu quái thường (cùng công thức Hầm Ngục: Trùm = ×60) */
 escort:{mid:6,fin:9},                           /* quái đi kèm Boss */
 healRoom:.08,                                   /* hồi % máu tối đa khi dọn xong 1 phòng */
 goldRoom:2000,xpRoom:6,                         /* vàng/phòng = gP(goldRoom × cấp × phòng) · EXP/phòng = EXP gốc × killMul × xpRoom × phòng */
 lk:15,                                          /* Linh Thạch KHOÁ khi hạ Boss cuối (cần đăng nhập ☁) */
 chest:{mid:[{w:70,t:'gold',v:600000},{w:25,t:'ore',v:200},{w:5,t:'ore',v:400}],
        fin:[{w:50,t:'gold',v:1500000},{w:35,t:'ore',v:500},{w:12,t:'ore',v:1000},{w:3,t:'sh',v:1}]}
};

/* ---------- tiện ích ---------- */
function nf(n){try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return String(n)}}
function say(t,c,l,y){try{DT.push({x:P.x,y:y||200,s:t,c:c||'#9fd8ff',g:1,l:l||150})}catch(e){}}
function p2(n){return n<10?'0'+n:''+n}
function today(){var d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function weekKey(){var d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function K(){
 var p=PS[cur];if(!p)return{day:'',used:0,wk:'',wb:0,best:0,runs:0,wins:0};
 if(!p.bc9||typeof p.bc9!=='object')p.bc9={day:'',used:0,wk:'',wb:0,best:0,runs:0,wins:0};
 var k=p.bc9,t=today(),w=weekKey();
 if(k.day!==t){k.day=t;k.used=0}
 if(k.wk!==w){k.wk=w;k.wb=0}
 return k}
function usedLeft(){return Math.max(0,BC.perDay-(K().used|0))}
function baseXp(){return Math.round(15*(1+Math.max(1,P.lv|0)/5))}
function killMul(){var k=3;try{if(window.HDAO&&HDAO.cfg&&HDAO.cfg.killMul)k=HDAO.cfg.killMul}catch(e){}return k}
function addXp(v){v=Math.round(v);if(!(v>0))return 0;try{if(typeof XR==='function')v=Math.round(XR(v))}catch(e){}P.xp+=v;return v}
function isBc(){return !!(dg&&dg.bc)}

/* ---------- Cơ Duyên (buff tạm thời) ---------- */
var POOL=[
 {id:'kiem',ic:'⚔️',n:'Kiếm Ý Thượng Cổ',d:'+18% sát thương gây ra',w:10,max:6},
 {id:'giap',ic:'🛡️',n:'Phong Thân Quyết',d:'Giảm 10% sát thương nhận vào',w:10,max:5},
 {id:'chung',ic:'🔔',n:'Kim Chung Tráo',d:'Hộ thuẫn = 30% máu tối đa (hấp thụ sát thương)',w:9,max:99},
 {id:'dich',ic:'🧪',n:'Hồi Xuân Dịch',d:'Hồi ngay 45% máu tối đa',w:9,max:99},
 {id:'huyet',ic:'🩸',n:'Huyết Ma Công',d:'Hút máu 5% sát thương gây ra',w:8,max:4},
 {id:'linh',ic:'🌿',n:'Tụ Linh Trận',d:'Hồi 1% máu tối đa mỗi giây',w:8,max:5},
 {id:'van',ic:'🍀',n:'Vận May Cổ Tu',d:'+35% vàng và EXP thưởng ở các phòng sau',w:7,max:4},
 {id:'cuong',ic:'🔥',n:'Cuồng Bạo Chi Lực',d:'+40% sát thương gây ra nhưng nhận thêm 15% sát thương',w:4,max:2,rare:1},
 {id:'hanh',ic:'☯️',n:'Ngũ Hành Cộng Hưởng',d:'+25% sát thương nếu đã có Linh Căn (chưa có: +10%)',w:4,max:2,rare:1},
 {id:'loi',ic:'⚡',n:'Thiên Lôi Ấn',d:'Mỗi 6 giây giáng sét lên mọi quái: 8% máu tối đa (Boss 1,2%)',w:4,max:3,rare:1}
];
function poolOf(id){for(var i=0;i<POOL.length;i++)if(POOL[i].id===id)return POOL[i];return null}
function hasRoot(){try{var t=PS[cur].tw;return !!(t&&t.root>=0&&t.root<5)}catch(e){return false}}
function calc(S){ /* gộp buff từ số lần chọn */
 var c=S.stk,b={dmg:1,dred:0,ls:0,regen:0,luck:1,vuln:1,loi:0},n;
 b.dmg+=.18*(c.kiem|0);
 b.dred=Math.min(.6,.10*(c.giap|0));
 b.ls=Math.min(.2,.05*(c.huyet|0));
 b.regen=.01*(c.linh|0);
 b.luck+=.35*(c.van|0);
 n=c.cuong|0;b.dmg+=.4*n;b.vuln+=.15*n;
 n=c.hanh|0;b.dmg+=(hasRoot()?.25:.10)*n;
 b.loi=c.loi|0;
 return b}
function pick3(S,rareOnly){
 var cand=[],i,o,tot=0,res=[],r,j;
 for(i=0;i<POOL.length;i++){o=POOL[i];if(rareOnly&&!o.rare)continue;if((S.stk[o.id]|0)>=o.max)continue;cand.push(o)}
 if(cand.length<3&&rareOnly){for(i=0;i<POOL.length;i++){o=POOL[i];if(!o.rare&&(S.stk[o.id]|0)<o.max&&cand.indexOf(o)<0)cand.push(o)}}
 while(res.length<3&&cand.length){
  tot=0;for(j=0;j<cand.length;j++)tot+=cand[j].w;
  r=R()*tot;for(j=0;j<cand.length;j++){r-=cand[j].w;if(r<0)break}
  if(j>=cand.length)j=cand.length-1;
  res.push(cand[j]);cand.splice(j,1)}
 return res}
function applyBuff(S,o){
 S.stk[o.id]=(S.stk[o.id]|0)+1;
 if(o.id==='chung'){S.sh+=mx()*.30}
 else if(o.id==='dich'){P.hp=Math.min(mx(),P.hp+mx()*.45)}
 S.b=calc(S)}

/* ---------- tạo quái ---------- */
function mkMon(kind,room,hk){
 var boss=kind==='mid'||kind==='fin',L=P.lv+(boss?5:Math.floor(R()*3)-1),m=Math.min(4,Math.floor((P.lv-1)/20)),
  base=3*(60+L*25)*(1+m*.5),fly=!boss&&kind==='fly',side=R()<.5?-1:1,
  x=boss?vw()+150:(P.x>vw()*.55?-60:vw()+60)+side*R()*50,
  hpk=boss?BC.bossHp[kind]:(fly?1.1:.9),hp=base*hpk*(1+BC.hpRoom*(room-1))*(hk||1),
  df=(8+L*2.2)*(1+m*.4)*(boss?BC.bossDf[kind]:1)*(1+.07*(room-1)),
  mm=(m+(boss?BC.bossAt[kind]:0))+BC.atRoom*(room-1)*.5;
 var e={dg:1,bcm:kind,k:boss?'boss':fly?'fly':'run',sp:boss?'boss':R()<.5?'impA':'impB',x:x,y:fly?140+R()*70:0,vx:0,vy:0,hp:hp,max:hp,df:df,b:boss?4:0,m:mm,lv:L,cd:boss?70:30+R()*50,sl:0,fl:0,in:boss?70:0,hh:boss?200:90,rg:boss?190:60,sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:0};
 if(boss){e.nm=kind==='fin'?'🌌 Thủ Hộ Thượng Cổ':'🗿 Cổ Tướng Trấn Cảnh';e.big=kind==='fin'?270:230;e.gc=kind==='fin'?['#10205a','#6ad0ff']:['#3a2a12','#ffc860']}
 E.push(e);
 for(var j=0;j<8;j++)PT.push({x:x,y:30,vx:(R()-.5)*3,vy:-R()*3,l:28,c:'#8fd0ff'});
 return e}
function packSize(room){return Math.min(BC.maxPack,BC.base+BC.perRoom*room)}
function isBossRoom(r){return r===BC.midRoom||r===BC.rooms}
function alive(){var n=0,i,e;for(i=0;i<E.length;i++){e=E[i];if(e&&e.bcm&&e.hp>0)n++}return n}

/* ---------- vòng đời ---------- */
function newState(){return{room:1,spawned:0,total:0,live:0,gap:100,pick:0,done:0,out:0,killed:0,stk:{},sh:0,b:calc({stk:{}}),boss:0,gold:0,xp:0}}
function startRoom(){
 var S=dg.bc,r=S.room,bossR=isBossRoom(r);
 S.spawned=0;S.boss=0;S.live=1;S.total=bossR?BC.escort[r===BC.rooms?'fin':'mid']:packSize(r);
 if(bossR){mkMon(r===BC.rooms?'fin':'mid',r);S.boss=1;
  say(r===BC.rooms?'👹 BOSS CUỐI · Thủ Hộ Thượng Cổ!':'🗿 BOSS GIỮA · Cổ Tướng Trấn Cảnh!','#ffd890',170,230)}
 else say('🌌 Phòng '+r+'/'+BC.rooms,'#9fd8ff',120,215)}
function spawnOne(){var S=dg.bc;S.spawned++;mkMon(R()<.35?'fly':'run',S.room)}
function recordBest(r){var k=K();if(r>(k.best|0))k.best=r;if(r>(k.wb|0))k.wb=r}
function pickChest(list){var t=0,i,r;for(i=0;i<list.length;i++)t+=list[i].w;r=R()*t;for(i=0;i<list.length;i++){r-=list[i].w;if(r<0)return list[i]}return list[0]}
function openChest(kind,mul){
 var c=pickChest(BC.chest[kind]),L='🎁 Rương Bí Cảnh: ',m,ok,col='#ffe27a',v=Math.round(c.v*(mul||1));
 if(c.t==='gold'){gold+=v;m=L+'+'+nf(v)+' 💰'}
 else if(c.t==='ore'){ok=false;try{var S=MN.get();S.fe=(S.fe|0)+v;S.hk=(S.hk|0)+v;ok=true}catch(x){}m=ok?L+'+'+nf(v)+' 🔩 Quặng Sắt · +'+nf(v)+' 🌑 Huyền Kim':L+'(không nhận được quặng)';col='#bff4ff'}
 else{ok=false;try{HL.addSH(c.v);ok=true}catch(x2){}m=ok?L+'+'+c.v+' 💠 Mảnh Thánh!!!':L+'(không nhận được Mảnh Thánh)';col='#ff9aff'}
 DT.push({x:P.x,y:150,s:m,c:col,g:1,l:240})}
function roomClear(){
 var S=dg.bc,r=S.room,b=S.b,g,x;
 S.live=0;
 g=gP(Math.round(BC.goldRoom*Math.max(1,P.lv)*r*b.luck));gold+=g;
 x=addXp(baseXp()*killMul()*BC.xpRoom*r*b.luck);
 S.gold+=g;S.xp+=x;
 recordBest(r);
 P.hp=Math.min(mx(),P.hp+mx()*BC.healRoom);
 say('✅ Dọn xong phòng '+r+' · +'+nf(g)+' 💰 · +'+nf(x)+' EXP','#9ff0ff',170,235);
 if(r===BC.midRoom)openChest('mid',b.luck);
 if(r>=BC.rooms){win();return}
 openPick(r===BC.midRoom)}
function win(){
 var S=dg.bc,k=K();S.done=1;S.out=420;
 k.wins=(k.wins|0)+1;recordBest(BC.rooms);
 openChest('fin',S.b.luck);
 try{QE('boss');QE('dg')}catch(e){}
 try{if(BC.lk>0&&window.LT&&LT.earnKS){LT.earnKS(BC.lk);say('🔒 +'+BC.lk+' 💎 Linh Thạch khoá','#9fd8ff',220,265)}}catch(e){}
 try{sv()}catch(e){}
 say('🏆 Vượt Bí Cảnh Thượng Cổ!','#ffd890',230,230)}
function enter(){
 try{if(typeof bo!=='undefined'&&bo&&typeof tg==='function')tg()}catch(e){}
 try{bo=0;bag.style.display='none'}catch(e){}
 try{if(window.LCT&&LCT.on&&LCT.on())LCT.off()}catch(e){}
 vil=0;lg=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 dg={t:0,n:20,kill:20,bc:newState()};
 say('🌌 Vào Bí Cảnh Thượng Cổ · '+BC.rooms+' phòng, mỗi phòng chọn 1 Cơ Duyên!','#9fd8ff',180)}
function exit(){closePick();mtExit()}

/* ---------- bảng chọn Cơ Duyên ---------- */
var ov=null;
function closePick(){if(ov){try{ov.remove()}catch(e){}ov=null}}
function openPick(rare){
 var S=dg.bc,opts=pick3(S,rare),h,i,o,n;
 if(!opts.length){closePick();S.room++;S.gap=90;return}
 S.pick=1;closePick();
 ov=document.createElement('div');ov.id='bc-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:32;display:flex;align-items:center;justify-content:center;background:rgba(4,8,18,.72);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#e6f2ff';
 ['pointerdown','touchstart','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
 h='<div style="max-width:420px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #6ad0ff;border-radius:14px;background:rgba(10,16,28,.97);padding:14px">'
  +'<div style="font-size:18px;font-weight:bold;color:#9fe0ff;text-align:center">🌌 Cơ Duyên '+(rare?'HIẾM ':'')+'· Phòng '+S.room+'/'+BC.rooms+' đã xong</div>'
  +'<div style="font-size:12.5px;opacity:.8;text-align:center;margin:4px 0 8px">Chọn 1 Cơ Duyên (chỉ có hiệu lực trong lần vào này)</div>';
 for(i=0;i<opts.length;i++){o=opts[i];n=S.stk[o.id]|0;
  h+='<div data-pk="'+o.id+'" style="display:flex;gap:10px;align-items:center;border:2px solid '+(o.rare?'#ffc860':'#6ad0ff')+';border-radius:12px;padding:10px;margin:7px 0;background:#0d1626;cursor:pointer">'
   +'<div style="font-size:30px;width:38px;text-align:center">'+o.ic+'</div><div style="flex:1"><b style="color:'+(o.rare?'#ffd890':'#bfe8ff')+'">'+o.n+(o.rare?' ✦':'')+'</b>'
   +'<div style="font-size:12.5px;opacity:.9;margin-top:2px">'+o.d+'</div>'+(n?'<div style="font-size:11.5px;opacity:.65;margin-top:2px">Đang có: ×'+n+'</div>':'')+'</div></div>'}
 h+='<div style="font-size:12px;opacity:.75;text-align:center;margin-top:6px">'+buffLine(S)+'</div></div>';
 ov.innerHTML=h;
 ov.addEventListener('click',function(ev){
  var t=ev.target,c=t.closest&&t.closest('[data-pk]');if(!c||!dg||!dg.bc)return;
  var o2=poolOf(c.dataset.pk);if(!o2)return;
  var S2=dg.bc;applyBuff(S2,o2);S2.pick=0;S2.room++;S2.gap=100;closePick();
  say(o2.ic+' '+o2.n,'#bfe8ff',130,225)});
 document.body.appendChild(ov)}
function buffLine(S){var s='',i,o,n;for(i=0;i<POOL.length;i++){o=POOL[i];n=S.stk[o.id]|0;if(n&&o.id!=='dich')s+=o.ic+'×'+n+' '}return s||'Chưa có Cơ Duyên nào'}
setInterval(function(){if(ov&&!isBc())closePick()},700);

/* ---------- bọc engine: tick / sát thương gây ra / sát thương nhận / rơi đồ / HUD ---------- */
var _tick=dgTick;
dgTick=function(){
 if(!dg||!dg.bc)return _tick.apply(this,arguments);
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 var S=dg.bc,b=S.b,i,e,a;
 if(S.done){if(--S.out<=0)exit();return}
 if(S.pick)return;
 if(dg.t%60===0&&b.regen>0&&P.hp>0)P.hp=Math.min(mx(),P.hp+mx()*b.regen);
 if(b.loi>0&&S.live&&dg.t%360===0){
  for(i=0;i<E.length;i++){e=E[i];if(!e||!e.bcm||e.hp<=0)continue;
   a=e.max*(e.b>0?.012:.08)*b.loi;e.hp-=a;DT.push({x:e.x,y:(e.hh||100)*SZ+20,s:'⚡'+nf(a),c:'#ffe27a',l:36});
   for(var j=0;j<4;j++)PT.push({x:e.x+(R()-.5)*30,y:60+R()*60,vx:(R()-.5)*2,vy:-R()*2,l:20,c:'#ffe27a'})}}
 if(!S.live){if(S.gap>0){if(--S.gap<=0)startRoom()}return}
 a=alive();
 if(S.spawned<S.total&&a<BC.cap&&dg.t%BC.gap===0)spawnOne();
 else if(S.spawned>=S.total&&a===0)roomClear()};

var _dm=dm;
dm=function(e,m,sl){
 if(!dg||!dg.bc)return _dm.apply(this,arguments);
 var b=dg.bc.b,h0=e&&e.hp,r=_dm.call(this,e,m*b.dmg,sl),d;
 try{if(b.ls>0&&P.hp>0){d=h0-e.hp;if(d>0)P.hp=Math.min(mx(),P.hp+Math.min(d*b.ls,mx()*.05))}}catch(x){}
 return r};

var _hurt=dgHurt;
dgHurt=function(e,mu){
 if(!dg||!dg.bc)return _hurt.apply(this,arguments);
 var S=dg.bc,b=S.b,h0=P.hp,r=_hurt.call(this,e,(mu||1)*b.vuln*(1-b.dred)),l;
 try{l=h0-P.hp;if(l>0&&S.sh>0){var ab=Math.min(S.sh,l);P.hp+=ab;S.sh-=ab}}catch(x){}
 return r};

var _drop=drop;
drop=function(e){
 if(!e||!e.bcm)return _drop.apply(this,arguments);
 if(dg&&dg.bc)dg.bc.killed++};

var _hud=dgHud;
dgHud=function(){
 _hud.apply(this,arguments);
 try{
  if(!isBc())return;
  var S=dg.bc,b=E.find(function(q){return q.bcm==='mid'||q.bcm==='fin'}),h;
  h='<div class="dgt" style="color:#9fe0ff">🌌 Bí Cảnh Thượng Cổ · Phòng '+Math.min(S.room,BC.rooms)+'/'+BC.rooms+(S.live?' · quái còn '+(Math.max(0,S.total-S.spawned)+alive()):'')+'</div>'
   +'<div class="dgt" style="font-size:12px;opacity:.9">'+buffLine(S)+(S.sh>0?' · 🔔'+nf(S.sh):'')+'</div>';
  if(b)h+='<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>';
  dgh.innerHTML=h}catch(e){}};
try{var _dp=dgb.onpointerdown;dgb.onpointerdown=function(ev){
 if(dg&&dg.bc){ev.stopPropagation();if(!started)return;gcf('Rời Bí Cảnh Thượng Cổ?\nLượt này sẽ mất (phần thưởng các phòng đã xong vẫn giữ).',exit);return}
 return _dp.call(this,ev)}}catch(e){}

/* ---------- vào phụ bản (thẻ số 6 trong bảng Phụ Bản) ---------- */
function status(){
 var k=K(),l=usedLeft();
 if(P.lv<BC.req)return{txt:'🔒 Cần cấp '+BC.req+' (hiện Lv'+P.lv+')',col:'#ff9a9a'};
 if(l<=0)return{txt:'⏳ Hết lượt hôm nay (0/'+BC.perDay+') · kỷ lục tuần: phòng '+(k.wb|0),col:'#ffd98a'};
 return{txt:'✅ Còn '+l+'/'+BC.perDay+' lượt hôm nay · kỷ lục tuần: phòng '+(k.wb|0)+' · chạm để vào',col:'#9dffa0'}}
function canEnter(){
 if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return'Không thể vào lúc này';
 if(P.lv<BC.req)return'🔒 Cần cấp '+BC.req+' để vào Bí Cảnh Thượng Cổ (hiện Lv'+P.lv+')';
 if(usedLeft()<=0)return'⏳ Hôm nay đã hết '+BC.perDay+' lượt Bí Cảnh, mai quay lại';
 return true}
function go(){var k=K();k.used=(k.used|0)+1;k.runs=(k.runs|0)+1;try{sv()}catch(e){}enter()}
function ask(){
 var r=canEnter();if(r!==true){say(r,'#ffd98a',160);return}
 gcf('Vào BÍ CẢNH THƯỢNG CỔ?\n'+BC.rooms+' phòng liên tiếp, mỗi phòng xong chọn 1 Cơ Duyên (buff tạm thời). Phòng '+BC.midRoom+' và '+BC.rooms+' có Boss.\nThưởng vàng + EXP sau mỗi phòng, Rương ở Boss (không rơi trang bị).\nCòn '+usedLeft()+'/'+BC.perDay+' lượt hôm nay (vào là tính 1 lượt).',go)}
function html(card){
 return card(7,'#6ad0ff','🌌','7. Bí Cảnh Thượng Cổ','Cần cấp '+BC.req+' · <b>'+BC.rooms+' phòng</b> liên tiếp, xong mỗi phòng chọn <b>1 trong 3 Cơ Duyên</b> (buff tạm thời, cộng dồn) · phòng '+BC.midRoom+' <b>Boss giữa</b>, phòng '+BC.rooms+' <b>Boss cuối</b> · thưởng vàng + EXP mỗi phòng, <b>Rương</b> ở Boss (không rơi trang bị) · <b>'+BC.perDay+' lượt/ngày</b> · có <b>kỷ lục tuần</b>')}

window.BICANH={cfg:BC,ask:ask,enter:enter,exit:exit,status:status,canEnter:canEnter,html:html,data:K,pool:POOL};
})();
