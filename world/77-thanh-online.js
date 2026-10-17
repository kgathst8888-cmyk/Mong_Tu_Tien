/* ===== 🏙 THÀNH THỊ ONLINE (world/77-thanh-online.js) =====
 * Gặp người chơi khác ở Thành Thị Linh Giới (LCT, đi ngang 1 chiều) và Thành Thị Tiên Giới (TG, 2.5D).
 * Cần chạy thanh_online.sql 1 lần trong Supabase. Đăng nhập ☁ mới thấy / được thấy.
 *
 * Đồng bộ ngoại hình ĐẦY ĐỦ: lớp nhân vật, nhánh, cảnh giới, cánh, trang bị (vũ khí/giáp/cường hoá),
 *   trang phục tiệm thời trang, môn phái, đạo thể, pháp bảo bản mệnh, hồn phách, ý cảnh, thú nuôi.
 *   - Ngoại hình (ap) chỉ gửi khi thay đổi (hoặc 30s/lần); người khác tải riêng bằng cp_ap rồi lưu đệm → ping nhẹ.
 *   - Vẽ người khác bằng chính hero()/drawEP()/FABAO.ghost() của game: tạm mượn P/cur/EQ/PS[ci]/HDAO.on/EP rồi trả lại ngay
 *     (giống Đấu Trường), nên mọi hiệu ứng của các module bọc hero() (cánh, cường hoá, môn phái, thời trang, đạo thể...) tự hiện.
 * Cách móc:
 *   - Linh Giới: bọc nameTag() (LCT.draw gọi ngay sau hero() của mình) → vẽ người khác trong cùng khung.
 *   - Tiên Giới: world/61-tien-gioi-thanh.js gọi CITYOL.tgList()/tgDraw() để xếp chiều sâu cùng công trình; chạm → CITYOL.tap().
 *   - Làng thường vẫn do world/41-lang-online.js lo (41 đã tắt khi đang ở 2 thành thị này).
 * Chỉnh: PING (nhịp hỏi máy chủ), MAXO (số người tối đa vẽ), EMO. Cần ở sau 61-tien-gioi-thanh.js và world/48 trong index.html. */
(function(){
'use strict';
if(typeof LCT==='undefined'||typeof hero!=='function'||typeof nameTag!=='function'||typeof PS==='undefined'||typeof CHR==='undefined'||typeof EP==='undefined')return;
var PING=2500,MAXO=20,EMO=['','👋','😄','🙏','⚔️'],FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',
    others={},cache={},fetching=0,total=0,map=0,lastMap=0,busy=false,nextAt=0,fail=0,errMsg='',myEmo=0,sentH=null,apAt=0,
    bar,cnt,card,cardT=0;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function mapId(){try{if(!started||!vil||bo)return 0;if(window.TG&&TG.on&&TG.on())return 2;if(LCT.on&&LCT.on())return 1}catch(e){}return 0}
function WW(){try{return Math.max(300,(window.LGART&&LGART.ww)?LGART.ww():vw())}catch(e){return 1000}}
function hash(str){var h=5381,i;for(i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return h}
function hid(id){var h=0,i;for(i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;return Math.abs(h)}

/* ---------- ngoại hình của mình (danh sách trắng, gọn) ---------- */
function slim(o,max){var r={},k,v;if(!o||typeof o!=='object')return r;for(k in o){v=o[k];
  if(typeof v==='number'&&isFinite(v))r[k]=v;else if(typeof v==='boolean')r[k]=v;else if(typeof v==='string'&&v.length<=32)r[k]=v;
  if(max&&Object.keys(r).length>=max)break}return r}
function mkAp(){
  var ps=PS[cur]||{},ap={v:1,ci:cur|0,br:(ps.br==null?-1:ps.br)|0,tier:ps.tier|0,wg:ps.wg|0,dt:0,eq:[]};
  try{ap.dt=(window.HDAO&&HDAO.on())?1:0}catch(e){}
  try{if(ps.fa&&ps.fa.eq)ap.fa={eq:slim(ps.fa.eq,12)}}catch(e){}
  try{if(ps.vp&&typeof ps.vp==='object')ap.vp={id:String(ps.vp.id||'').slice(0,24),g:ps.vp.g==='f'?'f':'m',mx:ps.vp.mx|0}}catch(e){}
  try{if(ps.fb&&typeof ps.fb==='object'&&ps.fb.lv)ap.fb={t:ps.fb.t|0,lv:[0,1,2,3].map(function(i){return ps.fb.lv[i]|0})}}catch(e){}
  try{if(ps.hpc&&typeof ps.hpc==='object')ap.hpc={t:ps.hpc.t|0,r:ps.hpc.r|0,b:ps.hpc.b|0}}catch(e){}
  try{if(ps.yc&&typeof ps.yc==='object')ap.yc={p:ps.yc.p==='m'?'m':'t',r:ps.yc.r|0,s:ps.yc.s|0}}catch(e){}
  try{if(ps.cv&&typeof ps.cv==='object')ap.cv=slim(ps.cv,6)}catch(e){}
  try{if(ps.tier>0&&ps.pet&&ps.pet.k!=null)ap.pet={k:ps.pet.k|0,ev:ps.pet.ev|0}}catch(e){}
  try{(EQ||[]).slice(0,16).forEach(function(it){ap.eq.push(it&&typeof it==='object'?slim(it,14):null)})}catch(e){}
  return ap}
function myPos(){
  if(map===2){try{var h=TG.hero();return[+h[0]||0,+h[1]||0]}catch(e){return[0,0]}}
  return[clamp(P.x/WW(),0,1),0]}

/* ---------- mạng ---------- */
async function ping(){
  if(busy)return;busy=true;var m=map;
  try{
    var ap=mkAp(),js=JSON.stringify(ap),h=hash(js),now=Date.now(),send=(h!==sentH||now>apAt+30000)?ap:null,pos=myPos(),emo=myEmo;
    var r=await KCL.rpc('cp_ping',{p_map:m,p_name:myName(),p_ci:cur|0,p_lv:((P&&P.lv)|0)||1,p_x:pos[0],p_y:pos[1],
      p_d:(P.d<0?-1:1),p_mv:P.mv?1:0,p_apv:h,p_ap:send,p_emo:emo});
    if(r&&r.status==='ok'){fail=0;errMsg='';if(send){sentH=h;apAt=now}if(myEmo===emo)myEmo=0;if(m===map)apply(r.list||[],r.n|0)}
    else if(r&&r.status==='auth')errMsg='Hết phiên đăng nhập ☁';
  }catch(e){
    fail++;var t=String(e&&e.message||e);
    errMsg=/cp_ping|function|schema|404/i.test(t)?'Máy chủ chưa cài thành thị online (chạy thanh_online.sql).':(e&&e.net?'Mất kết nối mạng.':'Thành thị online: '+t.slice(0,60));
  }
  nextAt=Date.now()+PING*(1+Math.min(fail,6)*(/chưa cài/.test(errMsg)?4:1));
  busy=false}
function leave(){try{if(logged())KCL.rpc('cp_leave',{}).catch(function(){})}catch(e){}}
function fetchAp(id,apv){
  if(fetching>=2)return;fetching++;var m=map;
  KCL.rpc('cp_ap',{p_id:id,p_map:m}).then(function(r){
    cache[id]={v:apv,ap:(r&&r.status==='ok'&&r.ap&&typeof r.ap==='object')?r.ap:null,t:Date.now()}
  }).catch(function(){cache[id]={v:apv,ap:null,t:Date.now()}}).then(function(){fetching--})}
function newP(){return Object.assign({},P,{x:0,d:1,mv:0,atk:0,atkT:1,pe:null,act:null,jy:0,jr:0,ln:'',hp:1,mp:1,_wf:-1,_wk:0,_wp:0})}
function apply(list,n){
  var now=Date.now(),seen={};total=n;
  list.slice(0,MAXO).forEach(function(o){
    var e=others[o.id],ww=WW();seen[o.id]=1;
    if(!e){e=others[o.id]={id:o.id,P:newP(),h:hid(o.id),emT:0,emS:0,em:0,ar:{x:0,y:0,vx:0,vy:0,rot:0,vr:0,sp:0,init:0,h:[]}};e.init=0}
    e.name=String(o.name||'Đạo Hữu');e.ci=o.ci|0;e.lv=o.lv|0;e.apv=o.apv|0;e.dir=o.d<0?-1:1;e.mv=o.mv?1:0;
    if(map===2){e.tx=+o.x||0;e.ty=+o.y||0;if(!e.init){e.gx=e.tx;e.gy=e.ty;e.init=1}}
    else{e.tx=clamp((+o.x||0)*ww+((e.h%5)-2)*12,40,ww-40);if(!e.init){e.lx=e.tx;e.init=1}}
    var c=cache[o.id];
    if(c&&c.v===e.apv)e.ap=c.ap;
    else if(!c||now>c.t+15000||c.v!==e.apv)fetchAp(o.id,e.apv);
    if(o.emo>0){if(e.emS!==o.emo||now>e.emT+1000){e.em=o.emo;e.emT=now+4000}}
    e.emS=o.emo|0});
  for(var k in others)if(!seen[k]){delete others[k];delete cache[k]}}

function tick(){
  var m=mapId(),on=m>0&&logged()&&!document.hidden;
  if(on){
    if(m!==lastMap){others={};total=0;errMsg='';nextAt=0;fail=0;lastMap=m}
    map=m;if(Date.now()>=nextAt)ping()
  }else if(lastMap){lastMap=0;map=0;others={};cache={};total=0;errMsg='';sentH=null;leave()}else map=0;
  if(bar){bar.style.display=(on&&!errMsg)?'flex':'none';if(cnt)cnt.textContent='👥 '+(total+1)}
  if(card&&Date.now()>cardT)card.style.display='none'}

/* ---------- chuyển động mượt giữa 2 lần ping ---------- */
function stepE(e){
  if(e._f===fr)return;e._f=fr;
  if(map===2){
    if(e.gx==null)return;var dx=e.tx-e.gx,dy=e.ty-e.gy,dist=Math.hypot(dx,dy);
    if(dist>9){e.gx=e.tx;e.gy=e.ty;e.P.mv=0}
    else if(dist>.02){var st=Math.min(dist,.075);e.gx+=dx/dist*st;e.gy+=dy/dist*st;e.P.mv=1;var sd=dx-dy;if(Math.abs(sd)>.05)e.P.d=sd>0?1:-1}
    else e.P.mv=0;
  }else{
    if(e.lx==null)return;var d1=e.tx-e.lx;
    if(Math.abs(d1)>600){e.lx=e.tx;e.P.mv=0}
    else if(Math.abs(d1)>.6){e.lx+=(d1<0?-1:1)*Math.min(Math.abs(d1),3);e.P.d=d1<0?-1:1;e.P.mv=1}
    else{e.P.mv=0;if(!e.mv)e.P.d=e.dir}}}

/* ---------- vẽ ---------- */
function ready(ci){var R=RIGI[ci];return !!(CHR[ci]&&R&&R.base&&R.base.im&&R.base.im.naturalWidth)}
/* Vẽ 1 người: mode 1 = Linh Giới (world x, cam), mode 2 = Tiên Giới (toạ độ màn hình sx,sy; tỉ lệ K) */
function paint(e,mode,sx,sy,K){
  var cc=cache[e.id];if(cc&&cc.v===e.apv)e.ap=cc.ap;   /* ngoại hình vừa tải xong → dùng ngay, không chờ lần ping sau */
  var ap=e.ap||{},ci=CHR[ap.ci]?ap.ci:e.ci;if(!CHR[ci])return;
  var os=s,oP=P,oC=cur,oE=EQ,oCam=cam,oGY=GY,hd=window.HDAO,oOn=hd&&hd.on,ps=PS[ci],eb=Object.assign({},EP),
      bk={br:ps.br,tier:ps.tier,wg:ps.wg,fa:ps.fa,vp:ps.vp,fb:ps.fb,hpc:ps.hpc,yc:ps.yc,cv:ps.cv,pet:ps.pet};
  if(!ready(ci)){
    var X0=mode===2?sx:(e.lx-cam)*s,Y0=mode===2?sy:GY,k0=mode===2?s*K:s;
    g.save();g.fillStyle='rgba(8,12,28,.3)';g.beginPath();g.ellipse(X0,Y0+2*k0,16*k0,4.5*k0,0,0,6.283);g.fill();
    g.fillStyle=(CHR[ci].c||'#9ab')+'';g.globalAlpha=.8;g.beginPath();g.ellipse(X0,Y0-48*k0,15*k0,46*k0,0,0,6.283);g.fill();g.restore();label(e,ci,mode,sx,sy,K);return}
  try{
    ps.br=ap.br!=null?ap.br:-1;ps.tier=ap.tier|0;ps.wg=ap.wg|0;ps.fa=ap.fa;ps.vp=ap.vp;ps.fb=ap.fb;ps.hpc=ap.hpc;ps.yc=ap.yc;ps.cv=ap.cv||bk.cv;
    ps.pet=ap.pet?{k:ap.pet.k,ev:ap.pet.ev,lv:1,xp:0}:null;
    P=e.P;cur=ci;EQ=ap.eq||EQS[ci]||[];
    if(hd)hd.on=function(){return !!ap.dt};
    if(mode===2){s=os*K;P.x=sx/s;cam=0;GY=sy}else{P.x=e.lx}
    /* thú nuôi: đi theo sau chủ */
    if(ap.pet&&ap.tier>0){
      var tx=P.x-50*(P.d||1),ep=e.ep;
      if(!ep||ep.ps!==ap.pet.k){ep=e.ep=Object.assign({},eb,{t:fr,y:(PK&&PK[ap.pet.k]&&PK[ap.pet.k].al)||0,vx:0,d:1,at:0,atT:1,kind:0,sk:180,ph:0,hit:0,ps:ap.pet.k,x:tx,ox:tx,tgx:tx,tg:null})}
      if(e._pf!==fr){e._pf=fr;var nx=mode===2?tx:ep.x+(tx-ep.x)*.14;ep.vx=nx-ep.x;ep.x=nx;ep.ox=nx;ep.tgx=nx;ep.d=ep.vx<-.05?-1:ep.vx>.05?1:ep.d;ep.t++;ep.ph+=.1+Math.min(Math.abs(ep.vx),3)*.12;ep.at=0;ep.tg=null}
      Object.assign(EP,ep);try{drawEP()}catch(x){}Object.assign(ep,EP)}
    hero();
    if(window.FABAO&&FABAO.ghost&&ap.dt&&ap.fb)FABAO.ghost(e.ar,fr);
  }catch(x){}finally{
    s=os;P=oP;cur=oC;EQ=oE;cam=oCam;GY=oGY;if(hd)hd.on=oOn;Object.assign(EP,eb);
    ps.br=bk.br;ps.tier=bk.tier;ps.wg=bk.wg;ps.fa=bk.fa;ps.vp=bk.vp;ps.fb=bk.fb;ps.hpc=bk.hpc;ps.yc=bk.yc;ps.cv=bk.cv;ps.pet=bk.pet}
  label(e,ci,mode,sx,sy,K)}
function label(e,ci,mode,sx,sy,K){
  var k=mode===2?s*K:s,X=mode===2?sx:(e.lx-cam)*s,Y=mode===2?sy:GY,T=CHR[ci].t,ty=Y-(T=='m'?205:178)*k-(e.ly||0)*s,
      fs=Math.max(10,12*s),tx='Lv.'+e.lv+' '+e.name;
  e._hit={x:X,t:ty-14*s,b:Y+10*k,w:Math.max(30*k,30)};
  g.save();g.globalAlpha=1;g.font='bold '+fs+'px '+FONT;g.textAlign='center';g.textBaseline='alphabetic';
  g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(tx,X,ty);g.fillStyle='#bfe6ff';g.fillText(tx,X,ty);
  if(e.emT>Date.now()){
    var bs=Math.max(24,28*s),by=ty-bs*.75;
    g.fillStyle='rgba(14,10,8,.85)';g.strokeStyle='#b8964e';g.lineWidth=1.5;
    g.beginPath();g.arc(X,by,bs*.62,0,6.283);g.fill();g.stroke();
    g.font=Math.round(bs*.8)+'px sans-serif';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(EMO[e.em]||'',X,by+1)}
  g.restore()}
/* Linh Giới: vẽ tất cả (chỉ những người đang trong màn hình), nhãn so le 3 tầng */
function drawLinh(){
  var list=Object.keys(others).map(function(k){return others[k]}).filter(function(e){stepE(e);return e.lx!=null}).sort(function(a,b){return a.lx-b.lx}),
      edge=[-1e9,-1e9,-1e9];
  g.save();g.font='bold '+Math.max(10,12*s)+'px '+FONT;
  list.forEach(function(e){var wd=g.measureText('Lv.'+e.lv+' '+e.name).width/s,l=e.lx-wd/2,t=-1,i,m=0;
    for(i=0;i<3;i++){if(l>edge[i]+4){t=i;break}if(edge[i]<edge[m])m=i}if(t<0)t=m;e.ly=t*16;edge[t]=e.lx+wd/2});
  g.restore();
  list.forEach(function(e){var X=(e.lx-cam)*s;if(X<-140||X>W+140){e._hit=null;return}paint(e,1)})}
var _nt=nameTag;
nameTag=function(){_nt.apply(this,arguments);if(map===1&&!(window.TG&&TG.on&&TG.on())){try{drawLinh()}catch(e){try{console.warn('[Thành thị online]',e)}catch(x){}}}};

/* ---------- Tiên Giới: móc từ world/61-tien-gioi-thanh.js ---------- */
function tgList(){
  if(map!==2)return null;
  var a=[];for(var k in others){var e=others[k];stepE(e);if(e.gx==null)continue;e.d=e.gx+e.gy;a.push(e)}
  return a.length?a.sort(function(p,q){return p.d-q.d}):null}
function tgDraw(e,S2,sc,K){
  var a=S2(e.gx,e.gy);if(a[0]<-90||a[0]>W+90||a[1]<-60||a[1]>H+260){e._hit=null;return}
  g.save();g.fillStyle='rgba(0,0,30,.4)';g.beginPath();g.ellipse(a[0],a[1],22*sc*K,9*sc*K,0,0,6.283);g.fill();g.restore();
  e.ly=(hid(e.id)%3)*16;paint(e,2,a[0],a[1],K)}
/* chạm vào người khác (px,py theo toạ độ canvas) → thẻ hồ sơ */
function tap(px,py){
  if(!map)return false;var best=null,bd=1e9;
  for(var k in others){var e=others[k],h=e._hit;if(!h)continue;var d=Math.abs(px-h.x);if(d<h.w&&py>h.t&&py<h.b&&d<bd){bd=d;best=e}}
  if(best){showCard(best);return true}return false}

/* ---------- giao diện ---------- */
function build(){
  var st=document.createElement('style');
  st.textContent='#co-bar{position:fixed;left:8px;top:calc(232px + env(safe-area-inset-top,0px));flex-direction:row;align-items:center;gap:6px;z-index:3;display:none}'+
   '#co-bar .co-more{display:none;gap:6px}#co-bar.open .co-more{display:flex}'+
   '#co-bar button{width:38px;height:38px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);font-size:18px;line-height:1;padding:0}'+
   '#co-bar button:active{transform:scale(.92)}'+
   '#co-n{padding:3px 8px;border-radius:12px;background:rgba(14,10,8,.8);border:1px solid #b8964e;color:#cfe9ff;font:bold 12px system-ui,sans-serif;white-space:nowrap}'+
   '#co-card{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));max-width:86vw;padding:9px 14px;border-radius:12px;background:rgba(14,10,8,.94);border:1.5px solid #b8964e;color:#f2e3b3;font:13px/1.45 system-ui,sans-serif;z-index:9;display:none;text-align:center}'+
   '#co-card b{color:#ffd76a;font-size:15px}';
  document.head.appendChild(st);
  bar=document.createElement('div');bar.id='co-bar';
  var tg=document.createElement('button');tg.textContent='👋';tg.setAttribute('aria-label','Biểu cảm');
  tg.onpointerdown=function(ev){ev.stopPropagation()};
  tg.onclick=function(ev){ev.stopPropagation();bar.classList.toggle('open')};
  bar.appendChild(tg);
  var more=document.createElement('div');more.className='co-more';bar.appendChild(more);
  for(var i=1;i<EMO.length;i++){(function(i){var b=document.createElement('button');b.textContent=EMO[i];b.setAttribute('aria-label','Biểu cảm '+i);
    b.onpointerdown=function(ev){ev.stopPropagation()};
    b.onclick=function(ev){ev.stopPropagation();myEmo=i;nextAt=0;bar.classList.remove('open');try{DT.push({x:P.x,y:200,s:EMO[i],g:1,l:70})}catch(e){}};
    more.appendChild(b)})(i)}
  cnt=document.createElement('span');cnt.id='co-n';bar.appendChild(cnt);
  document.body.appendChild(bar);
  card=document.createElement('div');card.id='co-card';document.body.appendChild(card)}
function showCard(e){
  var ap=e.ap||{},ci=CHR[ap.ci]?ap.ci:e.ci,C=CHR[ci]||{},br=(ap.br>=0&&C.br&&C.br[ap.br])?C.br[ap.br].n:'',tn=(typeof TN!='undefined'&&TN[ap.tier|0])||'',
      wg=(ap.wg>0&&typeof WGN!='undefined'&&WGN[ap.wg-1])||'',extra=[];
  if(wg)extra.push('🪽 '+wg);if(ap.dt)extra.push('☯ Đạo Thể');if(ap.pet)extra.push('🐾 Có thú nuôi');
  card.innerHTML='<b>'+esc(e.name)+'</b><br>Lv.'+e.lv+' · '+esc(C.n||'')+(br?' · '+esc(br):'')+(tn?'<br>'+esc(tn):'')+(extra.length?'<br>'+esc(extra.join(' · ')):'');
  card.style.display='block';cardT=Date.now()+3500}
function hook(){
  c.addEventListener('pointerdown',function(ev){
    if(map!==1||bo)return;
    if(tap(ev.offsetX,ev.offsetY))ev.stopImmediatePropagation()},true)}
function boot(){
  try{build();hook()}catch(e){try{console.warn('[Thành thị online] boot',e)}catch(x){}return}
  setInterval(tick,500);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&lastMap){lastMap=0;map=0;others={};sentH=null;leave()}});
  window.addEventListener('pagehide',function(){if(lastMap){lastMap=0;leave()}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.CITYOL={on:function(){return map>0},map:function(){return map},tgList:tgList,tgDraw:tgDraw,tap:tap,others:function(){return others},count:function(){return Object.keys(others).length}};
})();
