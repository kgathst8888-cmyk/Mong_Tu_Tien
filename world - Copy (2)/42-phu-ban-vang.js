/* ===== 💰 PHỤ BẢN 3 "PHỤ BẢN VÀNG" =====
 * Mở từ bảng 🕳 Phụ Bản (world/40-phu-ban-2.js, thẻ số 3). Module riêng, không sửa engine.
 *   - 1 Boss Bất Tử KHÔNG THỂ CHẾT (cùng cách Boss Bất Tử hằng ngày world/27: máu ảo luôn hồi đầy, chỉ đo sát thương).
 *   - Người chơi có CF.secs = 180 giây để khiêu chiến (hoặc tới khi gục / rời trận). Hết giờ → tính vàng.
 *   - Vàng thưởng = sát thương × CF.rate, tối thiểu CF.min (nếu có gây sát thương), tối đa CF.perLv × cấp người chơi.
 *   - Hồi chiêu CF.cd = 1 giờ, tính từ lúc VÀO (lưu theo nhân vật: PS[cur].pv.cd, giống Địa Long Điện). Có thể thêm giới hạn lượt/ngày bằng CF.tries (0 = không giới hạn).
 *   - Dữ liệu lưu cùng save game: PS[cur].pv = {cd: mốc ms được vào lại, d: ngày, n: lượt đã dùng hôm nay, b: sát thương cao nhất, g: tổng vàng đã nhận}.
 *   - Chỉnh độ khó / thưởng ngay ở khối CF bên dưới.
 * Phụ thuộc (engine): dgTick/dgSp/dgHurt/dgHud/dgExit/dgFoe/init/bgd/xbg, PS/cur/P/E/DT/dg/gold/sv. Boss dùng cờ riêng e.pv / dg.pv
 * nên không đụng tới Boss Bất Tử (e.bi) hay Địa Long Điện (e.d2). */
(function(){
'use strict';
if(typeof dgTick!=='function'||typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof dgExit!=='function'||typeof dgHud!=='function'||typeof dgFoe!=='function'||typeof init!=='function'||typeof PS==='undefined')return;

var CF={
 secs:180,        /* thời gian khiêu chiến (giây) */
 cd:3600000,      /* hồi chiêu sau mỗi lần VÀO (ms): 3.600.000 = 1 giờ */
 tries:0,         /* thêm giới hạn lượt/ngày/nhân vật (0 = không giới hạn, chỉ dùng hồi chiêu) */
 lv:1,            /* cấp tối thiểu để vào */
 hp:1e13,         /* máu "ảo" của boss — luôn hồi đầy mỗi nhịp, chỉ để đo sát thương */
 atk:1.4,         /* nhân sát thương boss gây ra so với Trùm Hầm Ngục */
 rate:0.01,       /* vàng cho mỗi 1 sát thương (0.01 = 100 sát thương → 1 vàng) */
 min:20000,       /* vàng tối thiểu nếu có gây sát thương */
 perLv:60000,     /* trần vàng mỗi lượt = perLv × cấp người chơi */
 name:'Hoàng Kim Thủ Hộ Giả',col:'#ffd54a',hue:40
};

/* ---------- tiện ích + dữ liệu ---------- */
function nf(n){return(Number(n)||0).toLocaleString('vi-VN')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function vnDay(){return new Date(Date.now()+25200000).toISOString().slice(0,10)}
function D(){var p=PS[cur];if(!p)return{cd:0,d:'',n:0,b:0,g:0};if(!p.pv||typeof p.pv!=='object')p.pv={cd:0,d:'',n:0,b:0,g:0};var d=vnDay();if(p.pv.d!==d){p.pv.d=d;p.pv.n=0}return p.pv}
function left(){var s=D(),n=Date.now(),c=+s.cd||0;if(c>n+CF.cd){c=n+CF.cd;s.cd=c}return Math.max(0,c-n)}
function fmt(ms){var t=Math.ceil(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function triesLeft(){return CF.tries>0?Math.max(0,CF.tries-(D().n|0)):9999}
function reward(dmg){dmg=Math.max(0,Math.round(dmg||0));if(dmg<=0)return 0;var cap=Math.max(CF.min,CF.perLv*Math.max(1,P.lv|0));return Math.max(CF.min,Math.min(cap,Math.round(dmg*CF.rate)))}
function status(){
 if(P.lv<CF.lv)return{txt:'🔒 Cần cấp '+CF.lv+' (hiện Lv'+P.lv+')',col:'#ff9a9a'};
 if(CF.tries>0&&triesLeft()<=0)return{txt:'⏳ Hết lượt hôm nay (0/'+CF.tries+') · đổi ngày lúc 00:00',col:'#ffd98a'};
 if(left()>0)return{txt:'⏳ Vào lại sau '+fmt(left()),col:'#ffd98a'};
 return{txt:'✅ Sẵn sàng · '+(CF.tries>0?'còn '+triesLeft()+'/'+CF.tries+' lượt hôm nay · ':'')+'chạm để vào',col:'#9dffa0'}}
function canEnter(){
 if(typeof started==='undefined'||!started||dg||(typeof over!=='undefined'&&over))return'Không thể vào lúc này';
 if(P.lv<CF.lv)return'🔒 Cần cấp '+CF.lv+' để vào Phụ Bản Vàng (hiện Lv'+P.lv+')';
 if(CF.tries>0&&triesLeft()<=0)return'⏳ Hôm nay bạn đã hết lượt Phụ Bản Vàng';
 if(left()>0)return'⏳ Phụ Bản Vàng hồi chiêu '+fmt(left());
 return true}

/* ---------- vào trận ---------- */
function enter(){
 var r=canEnter();if(r!==true)return r;
 hideRes();var q=D();q.n++;q.cd=Date.now()+CF.cd;try{sv()}catch(e){}
 bo=0;try{bag.style.display='none'}catch(e){}
 var l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 try{if(typeof LCT!=='undefined'&&LCT.on())LCT.off()}catch(e){}
 dg={t:0,n:20,kill:20,pv:1,bt:0,tt:CF.secs*60,dmg:0,lg0:l0,v0:v0,fin:0,out:0,res:null};
 DT.push({x:P.x,y:200,s:'💰 Phụ Bản Vàng · đánh '+CF.secs+' giây!',c:CF.col,g:1,l:150});
 return true}
function spawnBoss(){
 dgSp('boss');var e=E[E.length-1];if(!e||!e.dg)return;
 e.max=e.hp=CF.hp;e.pv=1;
 DT.push({x:P.x,y:220,s:'💰 '+CF.name+' xuất hiện!',c:CF.col,g:1,l:170})}

/* kết thúc lượt: ghi sát thương, phát vàng */
function finish(w,why){
 if(w.fin)return;w.fin=1;w.out=150;
 var dmg=Math.max(0,Math.round(w.dmg)),d=D(),g0=reward(dmg);
 E=E.filter(function(e){return !e.pv});PJ=[];
 d.b=Math.max(d.b|0,dmg);d.g=(d.g|0)+g0;gold+=g0;try{sv()}catch(e){}
 w.res={dmg:dmg,gold:g0,why:why,best:d.b|0,left:triesLeft()};
 DT.push({x:P.x,y:200,s:(why==='dead'?'💀 Gục ngã! ':why==='leave'?'🚪 Rời trận! ':'⏱ Hết giờ! ')+'Sát thương: '+nf(dmg),c:'#ffe08a',g:1,l:190});
 DT.push({x:P.x,y:240,s:'💰 +'+nf(g0)+' vàng',c:CF.col,g:1,l:200})}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();try{dgHud()}catch(e){}}

/* ---------- bảng kết quả ---------- */
var ov=null;
function hideRes(){if(ov)ov.style.display='none'}
function showRes(r){
 if(!r||typeof started==='undefined'||!started)return;
 if(!ov){ov=document.createElement('div');ov.id='pv-ov';ov.style.cssText='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3';
  ['pointerdown','touchstart','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){var t=e.target,a=t.closest&&t.closest('[data-pv]');if(a){if(a.dataset.pv==='again'){var m=enter();if(m!==true){note(m)}}else hideRes();return}if(t===ov)hideRes()});
  document.body.appendChild(ov)}
 var st=status(),again=canEnter()===true;
 ov.innerHTML='<div style="max-width:380px;width:100%;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px;text-align:center">'
  +'<h2 style="margin:0 0 8px;color:'+CF.col+';font-size:19px">💰 Phụ Bản Vàng · Kết quả</h2>'
  +'<div style="font-size:12.5px;opacity:.8">'+(r.why==='dead'?'💀 Bạn đã gục ngã':r.why==='leave'?'🚪 Bạn rời trận sớm':'⏱ Hết '+CF.secs+' giây')+'</div>'
  +'<div style="margin:10px 0;padding:10px;border:1px solid #5a4630;border-radius:10px;background:#140d0a;line-height:1.7">'
  +'⚔ Sát thương gây ra: <b style="color:#ffe9a0">'+nf(r.dmg)+'</b><br>💰 Vàng nhận được: <b style="color:'+CF.col+';font-size:18px">+'+nf(r.gold)+'</b><br>'
  +'<small style="opacity:.8">Sát thương cao nhất: '+nf(r.best)+' · quy đổi '+Math.round(1/CF.rate)+' sát thương = 1 vàng (tối đa '+nf(CF.perLv*Math.max(1,P.lv|0))+'/lượt)</small></div>'
  +'<div style="font-size:12.5px;color:'+st.col+';margin-bottom:8px">'+esc(st.txt.replace(' · chạm để vào',''))+'</div>'
  +'<button data-pv="again" '+(again?'':'disabled')+' style="width:100%;margin-top:4px;background:#8a6420;color:#fff;border:1px solid #ffd54a;border-radius:8px;padding:9px;font-weight:bold'+(again?'':';opacity:.45')+'">⚔ Khiêu chiến lại</button>'
  +'<button data-pv="x" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button></div>';
 ov.style.display='flex'}
function note(t){try{DT.push({x:P.x,y:190,s:t,c:'#ffd98a',l:90})}catch(e){}}

/* ---------- móc vào engine (cùng mẫu Boss Bất Tử world/27; chỉ xử lý khi dg.pv, còn lại chuyển tiếp) ---------- */
var _tick=dgTick;dgTick=function(){
 if(!dg||!dg.pv)return _tick.apply(this,arguments);
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;spawnBoss()}
 var b=E.find(function(e){return e.pv});
 if(b&&!dg.fin){
  var d=b.max-b.hp;if(d>0){dg.dmg+=d;b.hp=b.max}   /* boss bất tử: tính sát thương rồi hồi đầy máu */
  if(++dg.bt>=dg.tt)finish(dg,'time')}
 if(dg.fin&&--dg.out<=0)dgExit()};
var _exit=dgExit;dgExit=function(){var w=dg&&dg.pv?dg:null;if(w&&!w.fin)finish(w,'leave');_exit.apply(this,arguments);if(w){back(w);showRes(w.res)}};
var _init=init;init=function(){var w=dg&&dg.pv?dg:null;if(w&&!w.fin)finish(w,'dead');_init.apply(this,arguments);if(w){back(w);showRes(w.res)}};
var _hurt=dgHurt;dgHurt=function(e,mu){return _hurt.call(this,e,e&&e.pv?mu*CF.atk:mu)};
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);
 try{if(dg&&dg.pv){var sec=Math.max(0,Math.ceil((dg.tt-dg.bt)/60));
  dgh.innerHTML='<div class="dgt" style="color:'+CF.col+'">💰 Phụ Bản Vàng'+(dg.bs&&!dg.fin?' · ⏱ '+sec+'s':'')+'</div><div class="dgt">⚔ Sát thương: '+nf(dg.dmg)+'</div><div class="dgt" style="color:'+CF.col+'">💰 Vàng tạm tính: '+nf(reward(dg.dmg))+'</div>'}}catch(x){}};
var _foe=dgFoe;dgFoe=function(e){
 if(!e.pv)return _foe.apply(this,arguments);
 var col=CF.col,X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
 g.save();g.globalCompositeOperation='lighter';var q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,col+'99');q.addColorStop(.5,col+'44');q.addColorStop(1,col+'00');
 g.globalAlpha=.75+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
 g.save();try{if((window.QL|0)===0&&'filter' in g)g.filter='hue-rotate('+CF.hue+'deg) saturate(1.3)'}catch(x){}_foe.apply(this,arguments);g.restore();
 g.save();g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
 var ty=GY-((e.y||0)+268)*s,tx=CF.name+' · BẤT TỬ';g.strokeText(tx,X,ty);g.fillStyle=col;g.fillText(tx,X,ty);g.restore()};
var _bg=bgd;bgd=function(gy){
 if(dg&&dg.pv){try{xbg(gy,3);g.save();g.fillStyle='rgba(110,75,0,.38)';g.fillRect(0,0,W,H);g.restore();return}catch(e){}}
 return _bg.apply(this,arguments)};

window.PBV={cfg:CF,canEnter:canEnter,enter:enter,status:status,reward:reward,data:D,left:left};
})();
