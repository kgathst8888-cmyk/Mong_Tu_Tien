/* ===== 🏮 LÀNG ONLINE =====
 * Gặp người chơi khác ở thôn tân thủ. Cần chạy village_presence.sql 1 lần trong Supabase.
 * - Chỉ hoạt động khi đang ở làng (vil) và đã đăng nhập ☁.
 * - Hỏi máy chủ mỗi ~2.5s (polling, giống chat) → không cần bật Realtime.
 * - Vẽ người khác bằng chính hero() của game (mượn tạm P/cur/EQ như Arena).
 * - Chạm vào người khác: xem hồ sơ. Nút bên trái: gửi biểu cảm 👋😄🙏⚔️.
 * Script này PHẢI nằm ngay sau world/03-village.js để các màn hình thay thế làng
 * (nông trại, hầm mỏ, cửa hàng thời trang...) tự che lớp vẽ này.
 */
(function(){
'use strict';
var PING=2500,EMO=['','👋','😄','🙏','⚔️'],others={},total=0,inV=false,busyP=false,nextAt=0,fail=0,errMsg='',myEmo=0,
    bar,card,cardT=0,FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function inVillage(){try{return !!(vil&&started)}catch(e){return false}}
function clamp(v,a,b){return v<a?a:v>b?b:v}

/* ---------- mạng ---------- */
async function ping(){
  if(busyP)return;busyP=true;
  try{
    var ps=PS[cur]||{},emo=myEmo;
    var r=await KCL.rpc('vp_ping',{p_name:myName(),p_ci:cur|0,p_br:((ps.br==null?-1:ps.br)|0),p_tier:(ps.tier|0),
      p_lv:((P&&P.lv)|0)||1,p_x:clamp(P.x/vw(),0,1),p_emo:emo});
    if(r&&r.status==='ok'){fail=0;errMsg='';if(myEmo===emo)myEmo=0;apply(r.list||[],r.n|0)}
    else if(r&&r.status==='auth'){errMsg='Hết phiên đăng nhập ☁'}
  }catch(e){
    fail++;var m=String(e&&e.message||e);
    errMsg=/vp_ping|function|schema|404/i.test(m)?'Máy chủ chưa cài làng online (chạy village_presence.sql).':(e&&e.net?'Mất kết nối mạng.':'Làng online: '+m.slice(0,60));
  }
  nextAt=Date.now()+PING*(1+Math.min(fail,6)*(/chưa cài/.test(errMsg)?4:1));
  busyP=false;
}
function leave(){try{if(logged())KCL.rpc('vp_leave',{}).catch(function(){})}catch(e){}}

function apply(list,n){
  var now=Date.now(),seen={},w=vw();total=n;
  list.forEach(function(o){
    var e=others[o.id];seen[o.id]=1;
    if(!e){e=others[o.id]={id:o.id,lx:o.x*w,d:1,mv:0,em:0,emT:0,emS:0}}
    e.name=String(o.name||'Đạo Hữu');e.ci=o.ci|0;e.br=o.br|0;e.tier=o.tier|0;e.lv=o.lv|0;e.fx=clamp(+o.x||0,0,1);
    if(o.emo>0){if(e.emS!==o.emo||now>e.emT+1000){e.em=o.emo;e.emT=now+4000}}
    e.emS=o.emo|0;
  });
  for(var k in others)if(!seen[k])delete others[k];
}

function tick(){
  var on=inVillage()&&logged()&&!document.hidden;
  if(on){
    if(!inV){inV=true;nextAt=0;fail=0}
    if(Date.now()>=nextAt)ping();
  }else if(inV){inV=false;others={};total=0;errMsg='';leave()}
  if(bar)bar.style.display=(on&&!bo&&!errMsg)?'flex':'none';
  if(card&&Date.now()>cardT)card.style.display='none';
}

/* ---------- vẽ ---------- */
function ready(ci){var R=RIGI[ci];return !!(CHR[ci]&&R&&R.base&&R.base.im&&R.base.im.naturalWidth)}
/* nửa bề rộng thân nhân vật (đơn vị logic) - dùng để tách không cho đè nhau */
function halfW(ci){var R=RIGI[ci];return ready(ci)?Math.max(24,R.W*150/R.H*.3):26}
/* Tách vị trí: không ai đứng đè lên mình hoặc lên người khác. Chỗ chật thì dạt ra hai bên. */
function resolve(list){
  var w=vw(),lo=40,hi=w-40,placed=[{x:P.x,h:halfW(cur)}];
  list.slice().sort(function(a,b){return a.fx-b.fx||(a.id<b.id?-1:1)}).forEach(function(e){
    var h=halfW(e.ci),want=clamp(e.fx*w,lo,hi),cand=[want],i;
    for(i=0;i<placed.length;i++){cand.push(placed[i].x-placed[i].h-h,placed[i].x+placed[i].h+h)}
    var best=null,bd=1e9;
    cand.forEach(function(c){
      if(c<lo||c>hi)return;
      for(var j=0;j<placed.length;j++)if(Math.abs(c-placed[j].x)<placed[j].h+h-.5)return;
      var d=Math.abs(c-want);if(d<bd){bd=d;best=c}
    });
    e.tx=best==null?want:best;           /* hết chỗ: chấp nhận gần nhau, nhãn sẽ so le */
    placed.push({x:e.tx,h:h});
    if(!e.init){e.lx=e.tx;e.init=1}      /* người mới hiện ở đúng chỗ đã tách, không chồng rồi mới tách */
  });
}
function drawOne(e){
  var ci=e.ci;if(!CHR[ci])return;
  var dx=e.tx-e.lx;
  if(Math.abs(dx)>420)e.lx=e.tx;
  else if(Math.abs(dx)>.6){e.lx+=(dx<0?-1:1)*Math.min(Math.abs(dx),2.4);e.d=dx<0?-1:1;e.mv=1}else e.mv=0;
  var X=(e.lx-cam)*s;
  if(ready(ci)){
    var oP=P,oC=cur,oE=EQ,ps=PS[ci],oB=ps.br,oT=ps.tier;
    try{
      ps.br=e.br;ps.tier=e.tier;
      P=Object.assign({},oP,{x:e.lx,d:e.d,mv:e.mv,atk:0,atkT:1,pe:null,act:null,jy:0,jr:0,ln:'',hp:1,mp:1});
      cur=ci;EQ=EQS[ci]||[];hero();
    }catch(x){}finally{ps.br=oB;ps.tier=oT;P=oP;cur=oC;EQ=oE}
  }else{
    g.save();g.fillStyle='rgba(8,12,28,.3)';g.beginPath();g.ellipse(X,GY+2*s,16*s,4.5*s,0,0,6.283);g.fill();
    g.fillStyle=(CHR[ci].c||'#9ab')+'';g.globalAlpha=.8;g.beginPath();g.ellipse(X,GY-48*s,15*s,46*s,0,0,6.283);g.fill();g.restore();
  }
  /* tên + cấp (e.ly: nâng cao thêm khi nhãn kề bên bị chạm nhau) */
  var T=CHR[ci].t,ty=GY-(T=='m'?205:178)*s-(e.ly||0)*s,fs=Math.max(10,12*s),tx='Lv.'+e.lv+' '+e.name;
  g.save();g.globalAlpha=1;g.font='bold '+fs+'px '+FONT;g.textAlign='center';g.textBaseline='alphabetic';
  g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(tx,X,ty);g.fillStyle='#bfe6ff';g.fillText(tx,X,ty);
  if(e.emT>Date.now()){
    var bs=Math.max(24,28*s),by=ty-bs*.75;
    g.fillStyle='rgba(14,10,8,.85)';g.strokeStyle='#b8964e';g.lineWidth=1.5;
    g.beginPath();g.arc(X,by,bs*.62,0,6.283);g.fill();g.stroke();
    g.font=Math.round(bs*.8)+'px sans-serif';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(EMO[e.em]||'',X,by+1);
  }
  g.restore();
}
/* xếp nhãn tên vào 3 tầng độ cao sao cho nhãn không chạm nhau */
function stagger(list){
  var fs=Math.max(10,12*s),edge=[-1e9,-1e9,-1e9];g.save();g.font='bold '+fs+'px '+FONT;
  list.forEach(function(e){
    var wd=g.measureText('Lv.'+e.lv+' '+e.name).width/s,l=e.lx-wd/2,t=-1,i,m=0;
    for(i=0;i<3;i++){if(l>edge[i]+4){t=i;break}if(edge[i]<edge[m])m=i}
    if(t<0)t=m;e.ly=t*16;edge[t]=e.lx+wd/2;
  });
  g.restore();
}
function drawAll(){
  var all=Object.keys(others).map(function(k){return others[k]});
  resolve(all);
  var list=all.sort(function(a,b){return a.lx-b.lx});
  stagger(list);
  list.forEach(drawOne);
  var tx=!logged()?'Đăng nhập ☁ để gặp người chơi khác':errMsg?errMsg:'🏮 Làng online: '+(total+1)+' người',
      ty=GY+(H-GY)*.55+34*Math.max(.8,s),fs=Math.max(10,12*s);
  g.save();g.font='bold '+fs+'px '+FONT;g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=3;
  g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(tx,W/2,ty);g.fillStyle=errMsg?'#ff9a8a':'#cfe9ff';g.fillText(tx,W/2,ty);g.restore();
}
var _vd=vdraw;
vdraw=function(){_vd();try{drawAll()}catch(e){try{console.warn('[Lang online]',e)}catch(x){}}};

/* ---------- giao diện ---------- */
function build(){
  var st=document.createElement('style');
  st.textContent='#vp-bar{position:fixed;left:8px;top:calc(232px + env(safe-area-inset-top,0px));flex-direction:row;align-items:center;gap:6px;z-index:3;display:none}'+
   '#vp-bar .vp-more{display:none;gap:6px}#vp-bar.open .vp-more{display:flex}'+
   '#vp-bar button{width:38px;height:38px;border-radius:50%;border:2px solid #b8964e;background:radial-gradient(#3a2a22,#140d0a);font-size:18px;line-height:1;padding:0}'+
   '#vp-bar button:active{transform:scale(.92)}'+
   '#vp-card{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));max-width:86vw;padding:9px 14px;border-radius:12px;background:rgba(14,10,8,.94);border:1.5px solid #b8964e;color:#f2e3b3;font:13px/1.45 system-ui,sans-serif;z-index:9;display:none;text-align:center}'+
   '#vp-card b{color:#ffd76a;font-size:15px}';
  document.head.appendChild(st);
  bar=document.createElement('div');bar.id='vp-bar';
  var tg=document.createElement('button');tg.textContent='👋';tg.setAttribute('aria-label','Biểu cảm');
  tg.onpointerdown=function(ev){ev.stopPropagation()};
  tg.onclick=function(ev){ev.stopPropagation();bar.classList.toggle('open')};
  bar.appendChild(tg);
  var more=document.createElement('div');more.className='vp-more';bar.appendChild(more);
  for(var i=1;i<EMO.length;i++){(function(i){var b=document.createElement('button');b.textContent=EMO[i];b.setAttribute('aria-label','Biểu cảm '+i);
    b.onpointerdown=function(ev){ev.stopPropagation()};
    b.onclick=function(ev){ev.stopPropagation();myEmo=i;nextAt=0;bar.classList.remove('open');
      try{DT.push({x:P.x,y:200,s:EMO[i],g:1,l:70})}catch(e){}};
    more.appendChild(b)})(i)}
  document.body.appendChild(bar);
  card=document.createElement('div');card.id='vp-card';document.body.appendChild(card);
}
function showCard(e){
  var C=CHR[e.ci]||{},br=(e.br>=0&&C.br&&C.br[e.br])?C.br[e.br].n:'',tn=(typeof TN!='undefined'&&TN[e.tier])||'';
  card.innerHTML='<b>'+esc(e.name)+'</b><br>Lv.'+e.lv+' · '+esc(C.n||'')+(br?' · '+esc(br):'')+(tn?'<br>'+esc(tn):'');
  card.style.display='block';cardT=Date.now()+3500;
}
function hook(){
  c.addEventListener('pointerdown',function(ev){
    if(!inVillage()||bo)return;
    var x=ev.offsetX/s,y=ev.offsetY,best=null,bd=1e9;
    for(var k in others){var e=others[k],d=Math.abs(x-e.lx);
      if(d<34&&y>GY-200*s&&y<GY+30*s&&d<bd){bd=d;best=e}}
    if(best){ev.stopImmediatePropagation();showCard(best)}
  },true);
}
function boot(){
  try{build();hook()}catch(e){try{console.warn('[Lang online] boot',e)}catch(x){}return}
  setInterval(tick,500);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&inV){inV=false;others={};leave()}});
  window.addEventListener('pagehide',function(){if(inV){inV=false;leave()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.LANGOL={count:function(){return Object.keys(others).length},others:function(){return others}};
})();
