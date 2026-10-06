/* ===== ĐẤU TRƯỜNG v2 =====
   PvE/simulation foundation + trận đấu có thể xem trực tiếp.
   Không thay đổi combat chính; có thể nối backend thật sau này qua ArenaAPI.
*/
(function(){
'use strict';
var KEY='kthm2_arena_v2',ov=null,state=null,busy=false,timer=0,token=0,current=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function load(){try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){state=null}if(!state||typeof state!=='object')state={points:1000,wins:0,losses:0,streak:0,season:1,last:0,today:0,day:'',lastBattle:null};var d=new Date().toISOString().slice(0,10);if(state.day!==d){state.day=d;state.today=0;save()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function power(){try{return Math.max(1,Math.round((typeof atk==='function'?atk():100)*5+(typeof df==='function'?df():50)*.55+(typeof mx==='function'?mx():500)*.08))}catch(e){return 100}}
function pname(){try{return (typeof PS!=='undefined'&&PS[cur]&&(PS[cur].nm||PS[cur].name))||(typeof pn!=='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function realm(){try{return typeof ZC!=='undefined'&&ZC.nm?ZC.nm():'Tu sĩ'}catch(e){return 'Tu sĩ'}}
function opponents(){var p=power(),base=Math.max(300,p),names=['Huyền Vũ Kiếm Tôn','Thanh Liên Tiên Tử','Ma Đạo Cuồng Nhân','Thiên Cơ Đạo Nhân','U Minh Thánh Nữ','Cửu Thiên Kiếm Khách'],out=[];for(var i=0;i<5;i++){var mul=.84+i*.08+(Math.random()-.5)*.08;out.push({id:i,n:names[(i+state.season)%names.length],pw:Math.max(100,Math.round(base*mul)),lv:Math.max(1,Math.round((typeof P!=='undefined'&&P.lv||1)*(0.9+i*.04))),rank:Math.max(1,Math.round(50+i*18))})}return out}
function makeBattle(me,op){
 var mh=Math.max(100,typeof mx==='function'?mx():500),oh=Math.max(100,Math.round(mh*(op.pw/me.pw)*(.85+Math.random()*.3)));
 var ma=Math.max(1,me.pw*.18),oa=Math.max(1,op.pw*.18),mr=mh,or=oh,round=0,events=[];
 while(mr>0&&or>0&&round<18){
  round++;
  var first=round%2===1;
  var md=Math.max(1,Math.round(ma*(.72+Math.random()*.45))),od=Math.max(1,Math.round(oa*(.72+Math.random()*.45)));
  if(first){or-=md;events.push({r:round,side:'me',d:md,me:Math.max(0,mr),op:Math.max(0,or),text:pname()+' tung kiếm quyết, gây '+md+' sát thương!'});if(or<=0)break;mr-=od;events.push({r:round,side:'op',d:od,me:Math.max(0,mr),op:Math.max(0,or),text:op.n+' phản kích, gây '+od+' sát thương!'});}
  else{mr-=od;events.push({r:round,side:'op',d:od,me:Math.max(0,mr),op:Math.max(0,or),text:op.n+' tung pháp quyết, gây '+od+' sát thương!'});if(mr<=0)break;or-=md;events.push({r:round,side:'me',d:md,me:Math.max(0,mr),op:Math.max(0,or),text:pname()+' phản công, gây '+md+' sát thương!'});}
 }
 return {win:or<=0,round:round,meMax:mh,opMax:oh,events:events,meHp:Math.max(0,mr),opHp:Math.max(0,or)};
}
function reward(win){var pts=win?18:7;state.points=Math.max(0,state.points+(win?pts:-12));if(win){state.wins++;state.streak++;try{gold=(gold|0)+250+state.streak*20;frag=(frag|0)+(state.streak%3===0?1:0)}catch(e){}}else{state.losses++;state.streak=0}state.today++;state.last=Date.now();save();try{if(typeof sv==='function')sv()}catch(e){}return pts}
function rank(){return Math.max(1,Math.round(1200-Math.max(0,state.points-1000)*.9))}
function stopTimer(){if(timer){clearTimeout(timer);timer=0}}
function open(){load();if(!ov)build();ov.classList.add('on');render()}
function close(){stopTimer();busy=false;token++;if(ov)ov.classList.remove('on')}
function build(){
 ov=document.createElement('div');ov.id='arena-ov';
 ov.innerHTML='<div class="arena-bx"><div class="arena-h"><span>⚔️ Đấu Trường</span><button id="arena-x">✕</button></div><div id="arena-c"></div></div>';
 document.body.appendChild(ov);document.getElementById('arena-x').onclick=close;
 var st=document.createElement('style');st.textContent=''+
 '#arena-c .arena-battle{background:radial-gradient(circle at 50% 20%,#3a2415,#100906 72%);border:1px solid #76562b;border-radius:10px;padding:10px;overflow:hidden}'+
 '#arena-c .arena-fighters{display:grid;grid-template-columns:1fr 48px 1fr;gap:6px;align-items:center}'+
 '#arena-c .arena-fighter{background:#160e0a;border:1px solid #5b4327;border-radius:9px;padding:8px;min-width:0}'+
 '#arena-c .arena-fighter.me{box-shadow:inset 0 0 18px #1b2635}.arena-fighter.op{box-shadow:inset 0 0 18px #321b18}'+
 '#arena-c .arena-avatar{font-size:30px;text-align:center;line-height:1.1;margin-bottom:3px}.arena-fighter .arena-name{font-weight:bold;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.arena-fighter small{display:block;text-align:center;opacity:.7;margin:2px 0 5px}'+
 '#arena-c .arena-hp{height:12px;background:#050403;border:1px solid #5a4125;border-radius:8px;overflow:hidden}.arena-fighter .arena-hp i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#48b86b,#b6df65);transition:width .35s ease}.arena-fighter.op .arena-hp i{background:linear-gradient(90deg,#c94c4c,#e58a62)}'+
 '#arena-c .arena-hptext{text-align:center;font-size:10px;margin-top:3px;opacity:.8}.arena-vs{text-align:center;font-size:22px;font-weight:bold;color:#ffd86a;text-shadow:0 0 9px #b8863b}'+
 '#arena-c .arena-turn{text-align:center;color:#f2d58b;font-weight:bold;margin:8px 0 5px}.arena-log{height:118px;text-align:left;overflow:auto;background:#080605;border-radius:6px;padding:7px;margin:7px 0;font-size:11px;line-height:1.5}.arena-log .hit-me{color:#9fe6b0}.arena-log .hit-op{color:#ffaaa0}.arena-log .last{font-weight:bold}'+
 '#arena-c .arena-dmg{height:24px;text-align:center;font-size:16px;font-weight:bold;color:#ffd86a;opacity:0;transform:translateY(5px);transition:all .25s}.arena-dmg.show{opacity:1;transform:translateY(0)}'+
 '#arena-c .arena-controls{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}.arena-controls button,.arena-result button{background:#5a4220;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;padding:6px 9px;font:inherit}.arena-controls button.on{background:#8a6224;color:#fff}.arena-controls button:disabled{opacity:.45}'+
 '#arena-c .arena-result{margin-top:8px;text-align:center;background:#140d0a;border-radius:7px;padding:12px}.arena-result.win h3{color:#ffd86a}.arena-result.lose h3{color:#ff8a7a}'+
 '@media(max-width:640px){#arena-c .arena-fighters{grid-template-columns:1fr 34px 1fr}#arena-c .arena-avatar{font-size:26px}.arena-log{height:105px}}';document.head.appendChild(st)
}
function render(){
 load();if(busy)return;
 var c=ov.querySelector('#arena-c'),me=power(),ops=opponents(),left=Math.max(0,10-(state.today|0));
 c.innerHTML='<div class="arena-st"><b>'+esc(pname())+'</b><br><small>'+esc(realm())+' · Lực chiến '+me.toLocaleString()+' · Điểm '+state.points+' · Hạng #'+rank()+'</small><br><small>🏆 Thắng '+state.wins+' · Thua '+state.losses+' · 🔥 Chuỗi '+state.streak+' · Lượt hôm nay '+left+'/10</small></div>'+ops.map(function(o){var dis=left<=0?'disabled':'';return '<div class="arena-op"><div><b>'+esc(o.n)+'</b><br><small>Lv '+o.lv+' · Lực chiến '+o.pw.toLocaleString()+' · Hạng #'+o.rank+'</small></div><button data-id="'+o.id+'" '+dis+'>⚔️ Xem trận</button></div>'}).join('')+'<div class="arena-note">🎬 Bản v2 cho phép xem trận từng lượt, tạm dừng và tăng tốc. Kết quả vẫn là mô phỏng an toàn; chưa phải PvP server thật.</div>';
}
function battleView(op,b,isReplay){
 var c=ov.querySelector('#arena-c');
 c.innerHTML='<div class="arena-battle"><div class="arena-fighters"><div class="arena-fighter me"><div class="arena-avatar">🧙</div><div class="arena-name">'+esc(pname())+'</div><small>Lực chiến '+power().toLocaleString()+'</small><div class="arena-hp"><i id="arena-mep" style="width:100%"></i></div><div class="arena-hptext" id="arena-met">'+b.meMax+'/'+b.meMax+'</div></div><div class="arena-vs">VS</div><div class="arena-fighter op"><div class="arena-avatar">👹</div><div class="arena-name">'+esc(op.n)+'</div><small>Lực chiến '+op.pw.toLocaleString()+'</small><div class="arena-hp"><i id="arena-opp" style="width:100%"></i></div><div class="arena-hptext" id="arena-opt">'+b.opMax+'/'+b.opMax+'</div></div></div><div id="arena-turn" class="arena-turn">Trận đấu chuẩn bị bắt đầu...</div><div id="arena-dmg" class="arena-dmg">⚔️</div><div id="arena-log" class="arena-log"></div><div class="arena-controls"><button id="arena-pause">⏸ Tạm dừng</button><button data-speed="1" class="on">1×</button><button data-speed="2">2×</button><button data-speed="4">4×</button><button id="arena-skip">⏩ Bỏ qua</button></div></div>';
 var sp=1,paused=false,i=0,myToken=token;
 function append(ev){var log=document.getElementById('arena-log');if(!log)return;var row=document.createElement('div');row.className=ev.side==='me'?'hit-me':'hit-op';row.textContent='Lượt '+ev.r+': '+ev.text;log.appendChild(row);while(log.children.length>12)log.removeChild(log.firstChild);log.scrollTop=log.scrollHeight;var turn=document.getElementById('arena-turn');turn.textContent=ev.side==='me'?'⚔️ '+pname()+' tấn công!':'💥 '+op.n+' phản công!';var dmg=document.getElementById('arena-dmg');dmg.textContent=(ev.side==='me'?'⚔️ -':'💢 -')+ev.d+' HP';dmg.classList.remove('show');void dmg.offsetWidth;dmg.classList.add('show')}
 function paint(meHp,opHp){var mp=document.getElementById('arena-mep'),pp=document.getElementById('arena-opp'),mt=document.getElementById('arena-met'),pt=document.getElementById('arena-opt');if(mp)mp.style.width=Math.max(0,meHp/b.meMax*100)+'%';if(pp)pp.style.width=Math.max(0,opHp/b.opMax*100)+'%';if(mt)mt.textContent=meHp+'/'+b.meMax;if(pt)pt.textContent=opHp+'/'+b.opMax}
 function finish(){stopTimer();if(myToken!==token)return;busy=false;var pts=isReplay&&state.lastBattle?state.lastBattle.pts:reward(b.win);if(!isReplay){state.lastBattle={op:op.n,win:b.win,events:b.events,meMax:b.meMax,opMax:b.opMax,pts:pts,at:Date.now()};save();}var c2=ov.querySelector('#arena-c');c2.innerHTML='<div class="arena-result '+(b.win?'win':'lose')+'"><h3>'+(b.win?'🏆 CHIẾN THẮNG!':'💀 THẤT BẠI')+'</h3><div>'+esc(pname())+' <b>'+power().toLocaleString()+'</b> ⚔️ '+esc(op.n)+' <b>'+op.pw.toLocaleString()+'</b></div><p>'+(b.win?'+'+pts+' điểm · 🎁 Phần thưởng đã nhận':'-12 điểm · thử lại lần sau')+'</p><div class="arena-log">'+b.events.map(function(e){return esc('Lượt '+e.r+': '+e.text)}).join('<br>')+'</div><div class="arena-controls"><button id="arena-back">↩ Đấu Trường</button><button id="arena-replay">🔄 Xem lại trận</button></div></div>';document.getElementById('arena-back').onclick=render;document.getElementById('arena-replay').onclick=function(){busy=true;playReplay(op,b)};}
 function step(){if(myToken!==token||!ov.classList.contains('on'))return;if(paused){timer=setTimeout(step,250);return}if(i>=b.events.length){finish();return}var ev=b.events[i++];paint(ev.me,ev.op);append(ev);timer=setTimeout(step,Math.max(250,800/sp))}
 document.getElementById('arena-pause').onclick=function(){paused=!paused;this.textContent=paused?'▶ Tiếp tục':'⏸ Tạm dừng'};
 ov.querySelectorAll('[data-speed]').forEach(function(btn){btn.onclick=function(){sp=+btn.dataset.speed;ov.querySelectorAll('[data-speed]').forEach(function(x){x.classList.toggle('on',x===btn)})}});
 document.getElementById('arena-skip').onclick=function(){while(i<b.events.length){var ev=b.events[i++];paint(ev.me,ev.op);append(ev)}finish()};
 step();
}
function playReplay(op,b){stopTimer();token++;busy=true;current={op:op,b:b};battleView(op,b,true)}
function challenge(id){
 load();if(busy)return;if(state.today>=10){alert('Đã hết 10 lượt Đấu Trường hôm nay.');return}
 var o=opponents().find(function(x){return x.id==id});if(!o)return;var me=power();var b=makeBattle(me,o);busy=true;token++;current={op:o,b:b};battleView(o,b)
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#arena-c [data-id]');if(b)challenge(+b.dataset.id)});
window.Arena={open:open,close:close,save:save,load:load,api:{challenge:challenge}};
function addButton(){var b=document.createElement('button');b.id='arena-btn';b.className='sb';b.title='Đấu Trường';b.innerHTML='⚔️<small>Đấu</small>';b.onclick=open;document.body.appendChild(b)}
function init(){load();addButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
