/* ================= BOSS BẤT TỬ HẰNG NGÀY (BS) =================
   - Cửa vào: nút 💀 "Boss Bất Tử" nằm ngay bên trái nút 🏆 Xếp hạng.
   - Mỗi ngày (giờ VN, đổi lúc 00:00) có 1 Boss Bất Tử khác nhau (theo thứ). Boss KHÔNG THỂ BỊ GIẾT:
     mỗi lượt đánh kéo dài BC.secs giây (hoặc tới khi bạn gục), tổng sát thương gây ra được ghi lại.
   - Mỗi ngày 3 lượt/nhân vật. Mỗi lượt tham gia nhận ngay 1 túi vàng BC.gold.
   - Lượt có sát thương CAO NHẤT trong ngày được đưa lên bảng xếp hạng trên mây (Supabase, file boss_hang_ngay.sql).
   - Sang ngày mới, vào lại panel để nhận thưởng theo hạng của ngày hôm trước (xem bảng RW bên dưới).
   - Chưa đăng nhập ☁ / mất mạng: vẫn đánh được (chế độ cục bộ) nhưng chỉ nhận vàng, không lên bảng.
   Chỉnh độ khó / thưởng ngay tại khối hằng số BC và RW.
   Phụ thuộc: dgTick/dgSp/dgHurt/dgHud/dgExit/dgFoe/init (engine), KCL (12-cloud-save), HL.addSH (engine). */
(function(){
'use strict';
if(typeof dgTick!=='function'||typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof init!=='function')return;

const BC={
 tries:3,          /* số lượt đánh mỗi ngày (mỗi nhân vật) */
 secs:60,          /* thời lượng mỗi lượt (giây) */
 gold:500000,      /* túi vàng nhận được mỗi lượt tham gia */
 hp:1e13,          /* máu "ảo" của boss — luôn được hồi đầy mỗi nhịp, chỉ dùng để đo sát thương */
 lvAdd:6,          /* cấp boss = cấp người chơi + lvAdd */
 atk:1.7,          /* nhân sát thương boss gây ra so với Trùm Hầm Ngục */
 mapMin:2,         /* trang bị thưởng tính theo bản đồ >= mốc này (0..4) để đồ thưởng không quá yếu */
 keep:30,          /* nhớ các ngày đã nhận thưởng trong bao nhiêu ngày */
 days:[            /* theo thứ (0 = Chủ nhật): [tên, màu, hue-rotate] */
  ['Thiên Ma Bất Diệt','#ff5ad0',300],['Hắc Long Bất Tử','#b070ff',250],['Hỏa Quỷ Vương Bất Tử','#ff7a3a',-20],
  ['Băng Hoàng Bất Tử','#9fe8ff',170],['Cổ Mộc Yêu Vương Bất Tử','#7be07a',90],['Kim Cang Bất Tử','#ffd860',40],['Hư Vô Ma Tôn Bất Tử','#c8c8ff',200]]
};
/* Phần thưởng theo hạng. w = bảng tỉ lệ trang bị trong rương: [[độ hiếm, trọng số],...]
   Độ hiếm: 0 Thường · 1 Tinh Anh · 2 Hiếm · 3 Sử Thi · 4 Thần Thoại (huyền thoại) · 5 Thiên Thần. Không có Thánh. */
const RW=[
 {t:'Top 1',    a:1,b:1,  sh:2,nt:0,w:[[5,3],[4,97]]},
 {t:'Top 2-3',  a:2,b:3,  sh:0,nt:5,w:[[5,1],[4,64],[3,35]]},
 {t:'Top 4-10', a:4,b:10, sh:0,nt:2,w:[[5,.5],[4,39.5],[3,45],[2,15]]},
 {t:'Còn lại',  a:11,b:9e9,sh:0,nt:0,w:[[0,20],[1,25],[2,25],[3,18],[4,11.7],[5,.3]]}];
const RNAME=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần'];
const COL=['#cccccc','#6fdc6f','#5aa8ff','#c070ff','#ffa733','#ff5ad0'];

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>(Number(n)||0).toLocaleString('vi-VN');
const vnDay=()=>new Date(Date.now()+25200000).toISOString().slice(0,10);
const vnDow=()=>new Date(Date.now()+25200000).getUTCDay();
const today=()=>BC.days[vnDow()];
const cloudOn=()=>!!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess());
const tierOf=r=>RW.findIndex(t=>r>=t.a&&r<=t.b);
function pickW(w){let t=0;w.forEach(x=>t+=x[1]);let r=Math.random()*t;for(const x of w){if((r-=x[1])<0)return x[0]}return w[w.length-1][0]}

/* ---------- dữ liệu cục bộ theo nhân vật (lưu cùng save game: PS[cur].bs) ---------- */
function bs(){const p=PS[cur];if(!p.bs)p.bs={cl:{},d:'',n:0,b:0};if(!p.bs.cl)p.bs.cl={};
 const d=vnDay();if(p.bs.d!==d){p.bs.d=d;p.bs.n=0;p.bs.b=0}return p.bs}

/* ---------- giao diện ---------- */
const S={on:false,busy:false,st:null,err:'',msg:'',res:null,got:null};
const css=document.createElement('style');css.textContent=`
#bsw{position:fixed;z-index:2;width:58px;margin-left:-12px;display:none;text-align:center;pointer-events:none}
#bsb{pointer-events:auto;width:34px;height:34px;box-sizing:border-box;border-radius:50%;border:2px solid #c95a4f;background:radial-gradient(circle at 50% 30%,#5a2a2a,#120808 78%);box-shadow:0 3px 8px #000b,inset 0 0 8px #000;color:#ffb0a0;font-size:16px;line-height:28px;text-align:center;padding:0;cursor:pointer;margin-left:12px}
#bsw span{display:block;margin:1px 0 0 0;font:bold 8px/9px KTH Serif,Songti SC,STKaiti,KaiTi,serif;color:#ffd0c0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none}
#bsw.hot #bsb{animation:bsg 1.4s ease-in-out infinite}@keyframes bsg{50%{box-shadow:0 0 12px #ff5a40,inset 0 0 8px #000}}
#bs-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:32;align-items:center;justify-content:center;font-family:'KTH Serif','Songti SC',STKaiti,KaiTi,serif;color:#f2e3b3}
#bs-ov.on{display:flex}
.bs-bx{background:#2a1a12;border:3px solid #b8964e;border-radius:10px;padding:10px;width:min(400px,94vw);max-height:90vh;overflow:auto;font-size:13px;box-sizing:border-box}
.bs-h{display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:16px;margin-bottom:8px}
.bs-bx button{margin:4px 4px 0 0;background:#5a4220;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;padding:7px 10px;font:inherit;cursor:pointer}
.bs-bx button:disabled{opacity:.45;cursor:default}.bs-bx button.go{background:#8a2a1a;border-color:#ff9a7a;font-weight:bold}
.bs-c{margin:6px 0;padding:7px 9px;border-radius:6px;background:#140d0a;border:1px solid #5a4630;line-height:1.5}
.bs-c.ok{border-color:#7fe0a0;background:#1c3a24}.bs-c.er{border-color:#ff7a7a}
.bs-l{width:100%;border-collapse:collapse;font-size:12.5px}.bs-l td{padding:3px;border-bottom:1px solid #4a3622}
.bs-l tr.me{background:#4a3410;font-weight:bold}.bs-l .r{width:28px;text-align:center;color:#ffd54a}.bs-l .v{text-align:right;color:#ffe9a0;white-space:nowrap}
.bs-bx details{margin:6px 0}.bs-bx summary{cursor:pointer;padding:3px 0}.bs-bx small{opacity:.8}
`;document.head.appendChild(css);

const wrap=document.createElement('div');wrap.id='bsw';
wrap.innerHTML='<button id="bsb" type="button" title="Boss Bất Tử hằng ngày">💀</button><span>Boss Bất Tử</span>';document.body.appendChild(wrap);
const btn=wrap.firstChild;btn.onpointerdown=e=>e.stopPropagation();btn.onclick=e=>{e.stopPropagation();open()};
const ov=document.createElement('div');ov.id='bs-ov';ov.innerHTML='<div class="bs-bx"></div>';document.body.appendChild(ov);
['keydown','keyup','keypress'].forEach(n=>ov.addEventListener(n,e=>e.stopPropagation()));
ov.addEventListener('pointerdown',e=>e.stopPropagation());
ov.addEventListener('click',e=>{let n=e.target;while(n&&n!==ov&&!(n.getAttribute&&n.getAttribute('data-a')))n=n.parentNode;
 if(n&&n!==ov)act(n.getAttribute('data-a'));else if(e.target===ov)close()});

/* đặt nút ngay bên trái nút 🏆 (rkb do module xếp hạng đặt) */
let lastPos='';
function place(){
 const rk=document.getElementById('rkb');
 const show=!!(rk&&rk.style.display==='block'&&!(typeof dg!=='undefined'&&dg&&dg.bi));
 if(!show){if(wrap.style.display!=='none')wrap.style.display='none';return}
 const x=parseFloat(rk.style.left)-52,y=parseFloat(rk.style.top),k=Math.round(x)+','+Math.round(y);
 if(k!==lastPos){lastPos=k;wrap.style.left=Math.round(x)+'px';wrap.style.top=Math.round(y)+'px'}
 if(wrap.style.display!=='block')wrap.style.display='block';
 const hot=!!(S.st&&S.st.pending&&S.st.pending.some(p=>!bs().cl[p.day]))||bs().n<BC.tries;
 wrap.className=hot?'hot':''}
const _draw=window.draw;if(typeof _draw=='function')window.draw=function(){const r=_draw.apply(this,arguments);try{place()}catch(e){}return r};

/* ---------- panel ---------- */
function render(){
 const el=ov.firstChild,b=bs(),tb=today(),st=S.st,cl=cloudOn();
 const used=cl&&st&&st.status==='ok'?Math.max(st.tries|0,b.n):b.n,left=Math.max(0,BC.tries-used);
 let h='<div class="bs-h"><span style="color:'+tb[1]+'">💀 '+esc(tb[0])+'</span><button data-a="close">✕</button></div>';
 h+='<div class="bs-c">Boss Bất Tử không thể bị hạ. Mỗi lượt <b>'+BC.secs+' giây</b> (hoặc tới khi bạn gục), tổng sát thương được ghi lại. '
  +'Mỗi ngày <b>'+BC.tries+' lượt</b>, mỗi lượt nhận <b>💰 '+nf(BC.gold)+'</b>. Lượt cao nhất trong ngày được xếp hạng; sang ngày mới nhận thưởng theo hạng.</div>';
 if(S.msg)h+='<div class="bs-c ok">'+S.msg+'</div>';
 if(S.err)h+='<div class="bs-c er">'+esc(S.err)+'</div>';
 if(S.res){const r=S.res;h+='<div class="bs-c ok"><b>⚔ Kết quả lượt vừa rồi</b><br>Sát thương: <b style="color:#ffe9a0">'+nf(r.dmg)+'</b> · 💰 +'+nf(r.gold)
  +(r.rank?'<br>Hạng hiện tại của bạn: <b>#'+r.rank+'</b>/'+r.total+' (tốt nhất hôm nay: '+nf(r.best)+')':(r.cloud?(r.err?'<br><span style="color:#ff9a7a">Chưa gửi được lên bảng: '+esc(r.err)+'</span>':'<br>Đang gửi lên bảng…'):'<br><small>Chế độ cục bộ — không lên bảng xếp hạng.</small>'))+'</div>'}
 /* thưởng chờ nhận */
 const pend=(cl&&st&&st.pending||[]).filter(p=>!b.cl[p.day]);
 pend.forEach(p=>{const T=RW[tierOf(p.rank)]||RW[3];
  h+='<div class="bs-c" style="border-color:#ffd54a"><b>🎁 Thưởng ngày '+esc(p.day)+'</b> · hạng <b>#'+p.rank+'</b> ('+T.t+') · '+nf(p.best)+' ST<br><small>'+rwText(T)+'</small><br>'
   +'<button class="go" data-a="claim:'+esc(p.day)+':'+p.rank+'">Nhận thưởng</button></div>'});
 if(S.got)h+='<div class="bs-c ok">'+S.got+'</div>';
 /* lượt đánh */
 h+='<div class="bs-c">Lượt còn lại hôm nay: <b style="color:'+(left?'#7fe08a':'#ff7a7a')+'">'+left+'/'+BC.tries+'</b>'
  +(cl&&st&&st.status==='ok'?(st.rank?' · Hạng: <b>#'+st.rank+'</b>/'+st.total+' · Tốt nhất: <b>'+nf(st.best)+'</b>':' · Chưa có sát thương lên bảng'):'')
  +(cl?'':'<br><small>☁ Chưa đăng nhập/mất mạng: đánh ở chế độ cục bộ (chỉ nhận vàng, không lên bảng).</small>')
  +'<br><button class="go" data-a="go"'+(left<=0||S.busy||typeof started=='undefined'||!started?' disabled':'')+'>⚔ Khiêu chiến ('+left+' lượt)</button>'
  +(cl?'':'<button data-a="login">☁ Đăng nhập</button>')+'<button data-a="refresh"'+(S.busy?' disabled':'')+'>↻</button></div>';
 /* bảng xếp hạng hôm nay */
 if(cl&&st&&st.status==='ok'){
  h+='<div class="bs-c"><b>🏆 Bảng sát thương hôm nay</b> <small>('+esc(st.day)+')</small>';
  if(st.top&&st.top.length){h+='<table class="bs-l">'+st.top.map(r=>'<tr class="'+(r.me?'me':'')+'"><td class="r">'+r.r+'</td><td>'+esc(r.name)+' <small>'+esc(r.cls)+' Lv'+(r.lv|0)+'</small></td><td class="v">'+nf(r.best)+'</td></tr>').join('')+'</table>'}
  else h+='<br><small>Chưa có ai ghi sát thương. Hãy là người đầu tiên!</small>';
  h+='</div>'}
 /* bảng thưởng */
 h+='<details><summary>🎁 Bảng phần thưởng theo hạng</summary>'+RW.map(T=>'<div class="bs-c"><b>'+T.t+'</b><br><small>'+rwText(T)+'</small></div>').join('')+'</details>';
 el.innerHTML=h}
function rwText(T){
 const a=[];if(T.sh)a.push('💠 '+T.sh+' Mảnh Thánh');if(T.nt)a.push('🌙 '+T.nt+' Mảnh Nguyệt Thạch');
 let t=0;T.w.forEach(x=>t+=x[1]);
 a.push('📦 1 Rương trang bị ('+T.w.map(x=>'<span style="color:'+COL[x[0]]+'">'+Math.round(x[1]/t*100)+'% '+RNAME[x[0]]+'</span>').join(' · ')+')');
 return a.join('<br>')}

async function refresh(){
 if(!cloudOn()){S.st=null;render();return}
 S.busy=true;S.err='';render();
 try{const r=await KCL.rpc('boss_status',{p_slot:cur|0});S.st=r&&r.status==='ok'?r:null;if(r&&r.status!=='ok')S.err='Cần đăng nhập ☁ để xem bảng xếp hạng.'}
 catch(e){S.st=null;S.err=svErr(e)}
 S.busy=false;if(S.on)render()}
const svErr=e=>{const m=String(e&&e.message||e);return /boss_|function|schema|404/i.test(m)?'Máy chủ chưa cài Boss Bất Tử (chạy file boss_hang_ngay.sql trong Supabase).':m};
function open(){if(typeof started=='undefined'||!started)return;S.on=true;S.msg='';S.got=null;ov.classList.add('on');render();refresh()}
function close(){S.on=false;ov.classList.remove('on')}
function act(a){
 if(a==='close')close();else if(a==='refresh')refresh();
 else if(a==='login'){close();try{KTHM_CLOUD.open('acc')}catch(e){}}
 else if(a==='go')start();
 else if(a.startsWith('claim:')){const p=a.split(':');claim(p[1],+p[2])}}

/* ---------- nhận thưởng theo hạng ---------- */
async function claim(day,rank){
 const b=bs(),T=RW[tierOf(rank)]||RW[3];
 if(b.cl[day])return;
 if(BAG.length>=capN()){S.err='Túi đồ đã đầy — hãy chừa ít nhất 1 ô trống rồi nhận thưởng.';render();return}
 S.err='';
 const r=pickW(T.w),it=gen(P.lv,r,undefined,Math.max(mapSel|0,BC.mapMin));BAG.push(it);
 if(T.sh&&typeof HL.addSH=='function')HL.addSH(T.sh);
 if(T.nt)HL.addNT(T.nt);
 b.cl[day]=1;pruneCl(b);try{sv()}catch(e){}
 S.got='🎉 Nhận thưởng hạng #'+rank+': '+(T.sh?'💠 '+T.sh+' Mảnh Thánh · ':'')+(T.nt?'🌙 '+T.nt+' Mảnh Nguyệt Thạch · ':'')
  +'📦 <b style="color:'+COL[it.r]+'">'+esc(it.n)+'</b> ('+RNAME[it.r]+', cần Lv'+it.l+')';
 render();
 try{await KCL.rpc('boss_claim_ack',{p_slot:cur|0,p_day:day})}catch(e){}
 refresh()}
function pruneCl(b){const lim=new Date(Date.now()+25200000-BC.keep*864e5).toISOString().slice(0,10);Object.keys(b.cl).forEach(k=>{if(k<lim)delete b.cl[k]})}

/* ---------- vào trận ---------- */
async function start(){
 if(S.busy||typeof started=='undefined'||!started||dg||over)return;
 const b=bs();if(b.n>=BC.tries){S.err='Hôm nay bạn đã hết lượt.';render();return}
 let cloud=cloudOn();
 S.busy=true;S.err='';S.res=null;S.got=null;render();
 if(cloud){
  try{const r=await KCL.rpc('boss_begin',{p_slot:cur|0,p_name:charName(),p_cls:clsLabel(),p_lv:P.lv});
   if(!r||r.status==='no_tries'){S.busy=false;b.n=BC.tries;S.err='Máy chủ báo bạn đã hết lượt hôm nay.';render();refresh();return}
   if(r.status!=='ok'){cloud=false}}
  catch(e){S.busy=false;S.err=svErr(e)+' — thử lại sau.';render();return}}
 S.busy=false;b.n++;try{sv()}catch(e){}
 go(cloud)}
function clsLabel(){try{const c=CHR[cur],br=PS[cur].br;return br>=0&&c.br&&c.br[br]?c.br[br].n:(CL[c.t]||c.n)}catch(e){return ''}}
function charName(){try{return PS[cur].nm||(typeof CN=='function'?CN(cur):'')||pn||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function go(cloud){
 close();bo=0;try{bag.style.display='none'}catch(e){}
 const l0=lg,v0=vil;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 const tb=today();
 dg={t:0,n:20,kill:20,bi:1,bt:0,tt:BC.secs*60,dmg:0,cloud,lg0:l0,v0,fin:0,out:0};
 DT.push({x:P.x,y:200,s:'💀 '+tb[0]+' · đánh '+BC.secs+' giây!',c:tb[1],g:1,l:150})}
function spawnBoss(){
 dgSp('boss');const e=E[E.length-1],tb=today();
 e.max=e.hp=BC.hp;e.lv=P.lv+BC.lvAdd;e.bi=1;e.biN=tb[0];e.biC=tb[1];e.biH=tb[2];e.biA=BC.atk;
 DT.push({x:P.x,y:220,s:'💀 '+tb[0]+' xuất hiện!',c:tb[1],g:1,l:170})}

/* kết thúc lượt: ghi sát thương, phát vàng, gửi lên mây */
function finish(w,why){
 if(w.fin)return;w.fin=1;w.out=150;
 const dmg=Math.max(0,Math.round(w.dmg)),b=bs();
 E=E.filter(e=>!e.bi);PJ=[];
 b.b=Math.max(b.b,dmg);gold+=BC.gold;try{sv()}catch(e){}try{window.LT&&LT.earn&&LT.earn(1)}catch(e){}
 const res={dmg,gold:BC.gold,cloud:w.cloud,rank:0,best:0,total:0,err:''};S.res=res;
 DT.push({x:P.x,y:200,s:(why==='dead'?'💀 Gục ngã! ':'⏱ Hết giờ! ')+'Sát thương: '+nf(dmg),c:'#ffe08a',g:1,l:190});
 if(w.cloud)KCL.rpc('boss_end',{p_slot:cur|0,p_dmg:dmg}).then(r=>{
   if(r&&r.status==='ok'){res.rank=r.rank|0;res.best=r.best||0;res.total=r.total|0}else res.err='không có lượt đang chờ hợp lệ';
   if(S.on)render();refresh()}).catch(e=>{res.err=svErr(e);if(S.on)render()})}
function back(w){lg=w.lg0|0;vil=w.v0?1:0;vt=null;vgo=-1;try{P.x=cl(P.x,40,vw()-40)}catch(e){}P.hp=mx();P.mp=mm();dgHud()}

/* ---------- móc vào engine (cùng cách Tháp Thí Luyện) ---------- */
const _tick=dgTick;dgTick=function(){
 if(!dg||!dg.bi)return _tick();
 if(over||vil||!started)return;
 SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;spawnBoss()}
 const b=E.find(e=>e.bi);
 if(b&&!dg.fin){
  const d=b.max-b.hp;if(d>0){dg.dmg+=d;b.hp=b.max}   /* boss bất tử: tính sát thương rồi hồi đầy máu */
  if(++dg.bt>=dg.tt)finish(dg,'time')}
 if(dg.fin&&--dg.out<=0)dgExit()};
const _exit=dgExit;dgExit=function(){const w=dg&&dg.bi?dg:null;if(w&&!w.fin)finish(w,'leave');_exit();if(w){back(w);if(!S.on){S.on=true;ov.classList.add('on')}render();refresh()}};
const _init=init;init=function(){const w=dg&&dg.bi?dg:null;if(w&&!w.fin)finish(w,'dead');_init();if(w){back(w);S.on=true;ov.classList.add('on');render();refresh()}};
const _hurt=dgHurt;dgHurt=function(e,mu){_hurt(e,e&&e.bi?mu*e.biA:mu)};
const _hud=dgHud;dgHud=function(){_hud();if(dg&&dg.bi){const tb=today(),sec=Math.max(0,Math.ceil((dg.tt-dg.bt)/60));
 dgh.innerHTML='<div class="dgt" style="color:'+tb[1]+'">💀 '+esc(tb[0])+(dg.bs&&!dg.fin?' · ⏱ '+sec+'s':'')+'</div><div class="dgt">⚔ Sát thương: '+nf(dg.dmg)+'</div>'}};
const _foe=dgFoe;dgFoe=function(e){
 if(!e.bi)return _foe(e);
 const col=e.biC,X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
 g.save();g.globalCompositeOperation='lighter';const q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,col+'88');q.addColorStop(.5,col+'44');q.addColorStop(1,col+'00');
 g.globalAlpha=.75+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
 g.save();try{if('filter' in g)g.filter='hue-rotate('+e.biH+'deg)'}catch(x){}_foe(e);g.restore();
 g.save();g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
 const ty=GY-((e.y||0)+268)*s;g.strokeText(e.biN+' · BẤT TỬ',X,ty);g.fillStyle=col;g.fillText(e.biN+' · BẤT TỬ',X,ty);g.restore()};

window.BOSSBT={open,close,cfg:BC,rewards:RW};
})();
