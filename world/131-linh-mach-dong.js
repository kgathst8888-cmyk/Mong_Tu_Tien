/* ===== 🌀 LINH MẠCH ĐỘNG · BÃI FARM QUÁI NHIỀU NGƯỜI (world/131-linh-mach-dong.js) =====
 * Phụ bản Lv100, vào bằng CỔNG RIÊNG 🌀 ở Làng Tân Thủ (bên trái Cổng Hội Chiến, lệch CF.gx so với Cổng Ma Thần). Cần chạy linh_mach.sql 1 lần trong Supabase + đăng nhập ☁.
 * Chưa chạy SQL / chưa đăng nhập: vẫn farm một mình bình thường (không có người khác, không có thưởng vòng).
 *
 * Mỗi người đánh quái BẢN SAO của mình (không tranh quái, rơi đồ riêng). Cái chung là:
 *   • Thanh Linh Khí 0..100 — mọi người hạ quái đều làm đầy.
 *   • Buff đồng đội: +5% EXP & tu vi cho mỗi người khác trong phòng (tối đa +50%).
 *   • 33  → ⚡ Triều Quái 60s: quái hồi sinh tức thì, thêm 3 ô quái, EXP/tu vi +50%.
 *   • 66  → 💎 Linh Tuyền 90s: hồi 2% máu và linh lực mỗi 2 giây.
 *   • 100 → 👹 Boss Mạch Chủ (8 phút): MỘT thanh máu chung (triệu phần, máu dày theo số người như Hội Chiến Boss).
 *   • Hết vòng → thưởng tham gia (vàng + Linh Thạch khoá khi boss chết) do máy chủ cấp qua lm_claim.
 * Người khác hiện dưới dạng "linh ảnh" (tên + Lv) chạy theo vị trí thật; chưa vẽ đầy đủ ngoại hình.
 * Phụ thuộc: world/114a-phu-ban-core.js (PBC), world/02 (gateX/gateY/gateDraw), core/01q (vstep), KCL.rpc. Chỉnh: window.LMD.cfg. Tắt: bỏ <script> 131-linh-mach-dong. */
(function(){
'use strict';
if(!window.PBC)return;
var CF={ping:2500,coop:.05,coopMax:.5,tideBonus:.5,tideSec:60,springSec:90,springPct:.02,springEvery:120,bossSec:480,
        base:4,req:100,label:'🌀 Linh Mạch Động',gx:-300,gy:0};
var S={inf:null,others:{},kills:0,acc:0,dmg:0,nextAt:0,busy:false,fail:0,err:'',boss:null,lastHp:0,lastCyc:0,claimAt:0,
       base:0,ext:0,frac:0,ui:null,uiT:0,sprT:0,seenDead:0,toast:null};
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
function logged(){return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function myName(){try{return (PS[cur]&&PS[cur].nm)||(typeof pn!=='undefined'&&pn)||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function canEnter(){try{return ((PS[cur]&&PS[cur].tier)|0)>=1||P.lv>=CF.req}catch(e){return false}}
function say(t,c){try{DT.push({x:P.x,y:210,s:t,c:c||'#bfe9ff',g:1,l:150})}catch(e){}}

/* ---------- trạng thái sự kiện (tính từ giờ máy chủ, quy về đồng hồ cục bộ lúc nhận) ---------- */
function age(k){var i=S.inf;if(!i||i[k]==null)return null;return i[k]+(Date.now()-S.rxAt)/1000}
function tideLeft(){var a=age('f1');return a==null?0:Math.max(0,CF.tideSec-a)}
function springLeft(){var a=age('f2');return a==null?0:Math.max(0,CF.springSec-a)}
function bossAge(){return age('bs')}
function nPlayers(){return S.inf?Math.max(1,S.inf.n|0):1}
function bonus(){var b=Math.min(CF.coopMax,CF.coop*(nPlayers()-1));if(tideLeft()>0)b+=CF.tideBonus;return b}

/* ---------- mạng ---------- */
async function ping(){
  if(S.busy)return;S.busy=true;
  try{
    var ps=PS[cur]||{},k=S.kills,d=Math.round(S.dmg);
    var r=await KCL.rpc('lm_ping',{p_slot:cur|0,p_name:myName(),p_ci:cur|0,p_br:((ps.br==null?-1:ps.br)|0),p_tier:(ps.tier|0),
      p_lv:P.lv|0,p_x:Math.max(0,Math.min(1,P.x/api.wmax())),p_kills:k,p_dmg:d});
    if(r&&r.status==='ok'){S.fail=0;S.err='';S.kills=Math.max(0,S.kills-k);S.dmg=Math.max(0,S.dmg-d);applyInf(r)}
    else if(r&&r.status==='auth')S.err='Hết phiên đăng nhập ☁'
  }catch(e){
    S.fail++;var m=String(e&&e.message||e);
    S.err=/lm_ping|function|schema|404/i.test(m)?'Chưa cài máy chủ (chạy linh_mach.sql) — đang farm một mình':(e&&e.net?'Mất kết nối mạng':'Linh Mạch: '+m.slice(0,50));
  }
  S.nextAt=Date.now()+CF.ping*(1+Math.min(S.fail,6)*(/Chưa cài/.test(S.err)?4:1));
  S.busy=false;
}
function applyInf(r){
  var prev=S.inf;S.inf=r;S.rxAt=Date.now();
  var o={},w=api.wmax();
  (r.list||[]).forEach(function(p){var e=S.others[p.id]||{x:p.x*w};e.name=String(p.name||'Đạo Hữu');e.lv=p.lv|0;e.tx=p.x*w;e.ci=p.ci|0;o[p.id]=e});
  S.others=o;
  if(prev&&prev.cyc!==r.cyc){ /* sang vòng mới */
    if(S.boss){try{S.boss.hp=0}catch(e){}S.boss=null}
    claim()
  }
  if(r.stg>=1&&(!prev||prev.stg<1))say('⚡ TRIỀU QUÁI!','#ffe27a');
  if(r.stg>=2&&(!prev||prev.stg<2))say('💎 Linh Tuyền xuất hiện','#8ff3ff');
  if(r.stg>=3&&(!prev||prev.stg<3))say('👹 Boss Mạch Chủ xuất hiện!','#ff9ad8');
}
async function claim(){
  if(!logged()||Date.now()<S.claimAt)return;S.claimAt=Date.now()+4000;
  try{
    var r=await KCL.rpc('lm_claim',{p_slot:cur|0});
    if(r&&r.status==='ok'&&((r.gold|0)>0||(r.lt|0)>0)){
      if((r.gold|0)>0){try{gold+=r.gold}catch(e){}}
      if((r.lt|0)>0){try{window.LT&&LT.refresh&&LT.refresh()}catch(e){}}
      try{sv()}catch(e){}
      toast('🌀 Linh Mạch — Thưởng vòng'+(r.bk?' (Boss đã hạ!)':''),
        '💰 <b>+'+nf(r.gold)+'</b>'+((r.lt|0)>0?' · 🔒 <b>+'+r.lt+'</b> Linh Thạch khoá':'')+(r.top?'<br>🥇 Sát thương cao nhất!':'')+'<br><span style="opacity:.6">Còn '+r.left+' vòng nhận thưởng hôm nay</span>');
    }
  }catch(e){}
}
function toast(h,b){
  try{if(S.toast)S.toast.remove()}catch(e){}
  var d=document.createElement('div');S.toast=d;
  d.style.cssText='position:fixed;left:50%;top:calc(110px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:99990;max-width:min(340px,92vw);background:linear-gradient(#10243a,#0a1220);border:2px solid #6fd0ff;border-radius:12px;padding:10px 14px;color:#dff4ff;font:13.5px/1.55 '+FONT+';box-shadow:0 6px 24px #0008';
  d.innerHTML='<div style="font-size:15px;color:#9fe3ff;margin-bottom:4px">'+h+'</div>'+b+'<div style="opacity:.55;font-size:11px;margin-top:4px">chạm để đóng</div>';
  d.onpointerdown=function(e){e.stopPropagation();try{d.remove()}catch(x){}};
  document.body.appendChild(d);setTimeout(function(){try{d.remove()}catch(e){}},12000);
}

/* ---------- HUD (DOM, cập nhật ~2 lần/giây) ---------- */
function hud(){
  if(S.ui)return S.ui;
  var d=document.createElement('div');
  d.style.cssText='position:fixed;left:50%;top:calc(172px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:9000;pointer-events:none;display:none;min-width:190px;max-width:min(260px,66vw);padding:4px 9px 5px;border-radius:10px;background:rgba(8,18,32,.72);border:1px solid #4aa8d8;color:#d8f2ff;font:10.5px/1.3 '+FONT+';text-align:center;text-shadow:0 1px 2px #000';
  document.body.appendChild(d);S.ui=d;return d;
}
function drawHud(){
  var d=hud(),i=S.inf;
  if(!api.on()){if(d.style.display!=='none')d.style.display='none';return}
  d.style.display='block';
  var pool=i?Math.min(100,i.pool):0,l1,l2='',tl=tideLeft(),sl=springLeft(),ba=bossAge(),b=Math.round(bonus()*100);
  l1='🌀 '+(i?'Kênh '+i.ch+' · 👥 '+i.n+'/20':'Linh Mạch · '+(S.err||'đang kết nối…'));
  if(i&&S.err&&S.fail)l2+='<div style="color:#ffb08a">'+esc(S.err)+'</div>';
  var bar='<div style="height:7px;border-radius:4px;background:#1a2c44;margin:3px 0;overflow:hidden"><div style="height:100%;width:'+pool.toFixed(1)+'%;background:linear-gradient(90deg,#36b6ff,#8ff3ff,#ffe27a)"></div></div>';
  var ev=[];
  if(tl>0)ev.push('⚡ Triều Quái '+Math.ceil(tl)+'s');
  if(sl>0)ev.push('💎 Linh Tuyền '+Math.ceil(sl)+'s');
  if(i&&ba!=null&&!i.dead&&S.boss){
    var fr=Math.max(0,1-(i.bdmg||0)/1e6);
    ev.push('👹 Boss Mạch Chủ '+(fr*100).toFixed(1)+'% · còn '+Math.max(0,Math.ceil(CF.bossSec-ba))+'s');
  }
  if(i&&i.dead)ev.push('🏆 Boss đã bị hạ'+(i.killer?' bởi '+esc(i.killer):'')+'!');
  var nxt=pool<33?'33 → Triều Quái':pool<66?'66 → Linh Tuyền':pool<100?'100 → Boss':'';
  d.innerHTML='<div>'+l1+'</div>'+bar+'<div style="opacity:.85">Linh Khí '+pool.toFixed(0)+'%'+(nxt?' · '+nxt:'')+' · buff +'+b+'%</div>'
    +(ev.length?'<div style="color:#ffe9a0">'+ev.join(' · ')+'</div>':'')+(i?'<div style="opacity:.7">Quái bạn hạ vòng này: '+(i.kills|0)+'/'+(i.min|0)+(i.kills>=i.min?' ✔':'')+'</div>':'')+l2;
}

/* ---------- Boss Mạch Chủ: máu chung ---------- */
function spawnBoss(){
  try{
    var m=MS.golem,L=Math.min(LR[mapSel][1],P.lv+3),
        h=3*(60+L*25)*(1+mi()*.5)*m.hm*(22+mi()*3)*cqM(),df=(8+L*2.2)*(1+mi()*.4)*2.3*(1+(cqM()-1)/2),sx=P.x>vw()*.55?-80:vw()+80;
    var e={k:'golem',sn:99,x:sx,hp:h,max:h,df:df,b:3,m:mi(),lv:L,cd:30,sl:0,fl:0,in:6,hh:m.h,rg:m.rg,_d:1,lm:1};
    E.push(e);hook(e);S.boss=e;S.lastHp=e.hp;S.acc=0;
    say('👹 Boss Mạch Chủ!','#ff9ad8');
  }catch(x){}
}
function hook(e){
  var h=e.hp;e._raw=0;e._dead=0;
  Object.defineProperty(e,'hp',{configurable:true,enumerable:true,get:function(){return h},
    set:function(v){v=+v;if(v!==v)return;
      var M=Math.max(1,+(S.inf&&S.inf.bm)||1);
      if(v<h&&!e._raw)v=h-(h-v)/M;    /* mọi đòn bị chia cho hệ số máu: boss "dày" theo số người */
      if(v<1&&!e._dead)v=1;            /* chỉ máy chủ quyết định boss chết */
      h=v}});
}
function setRaw(e,v){e._raw=1;try{e.hp=v}finally{e._raw=0}}
function bossStep(){
  var i=S.inf,ba=bossAge();
  if(!i||ba==null){return}
  if(i.dead){
    if(S.boss&&!S.boss._dead){S.boss._dead=1;setRaw(S.boss,0);say('🏆 Boss Mạch Chủ đã bị hạ!','#ffe27a');S.boss=null}
    return;
  }
  if(!S.boss||E.indexOf(S.boss)<0){
    if(S.boss){S.boss=null}
    if(ba<CF.bossSec)spawnBoss();
    return;
  }
  var e=S.boss;
  /* đồng bộ: máu cục bộ chỉ giảm theo máu chung, không hồi; phần giảm này KHÔNG tính là sát thương của mình */
  var tgt=e.max*Math.max(0,1-(i.bdmg||0)/1e6);
  if(e.hp>tgt+1){setRaw(e,Math.max(1,tgt));S.lastHp=e.hp}
  var h=e.hp;if(h<S.lastHp&&e.max>0)S.acc+=(S.lastHp-h)/e.max*1e6;S.lastHp=h;
  if(S.acc>=1){S.dmg+=S.acc;S.acc=0}
  if(ba>=CF.bossSec&&!e._dead){e._dead=1;setRaw(e,0);S.boss=null}
}

/* ---------- vòng lặp mỗi khung (qua PBC.step) ---------- */
function stepFn(a){
  var t=Date.now(),sl=springLeft();
  if(t>=S.nextAt&&logged()&&!document.hidden){S.nextAt=t+CF.ping;ping()}
  else if(!logged()&&!S.err)S.err='Cần đăng nhập ☁ để farm cùng người khác';
  /* linh ảnh người khác chạy mượt tới vị trí báo */
  for(var k in S.others){var o=S.others[k];o.x+=(o.tx-o.x)*.12}
  /* Triều Quái: quái hồi sinh tức thì + thêm 3 ô quái */
  try{
    if(tideLeft()>0){
      if(!S.ext){S.base=SLT.length;SLT.push(0,0,0);S.ext=1}
      for(var j=0;j<SLT.length;j++)if(SLT[j]>0)SLT[j]=0;
    }else if(S.ext){SLT.length=Math.min(SLT.length,S.base);S.ext=0}
  }catch(e){}
  /* Linh Tuyền */
  if(sl>0&&++S.sprT>=CF.springEvery){
    S.sprT=0;
    try{P.hp=Math.min(mx(),P.hp+mx()*CF.springPct);P.mp=Math.min(mm(),P.mp+mm()*CF.springPct);DT.push({x:P.x,y:140,s:'💎+',c:'#8ff3ff',l:40})}catch(e){}
  }
  bossStep();
  if(++S.uiT>=30){S.uiT=0;drawHud()}
}

/* ---------- buff đồng đội trên mỗi quái hạ (bọc ZC.kill, chỉ khi đang ở Linh Mạch) ---------- */
try{
  var _zk=ZC.kill;
  if(typeof _zk==='function')ZC.kill=function(e){
    var r=_zk.apply(this,arguments);
    try{
      if(api.on()){
        if(!e||!e.lm)S.kills++;
        var b=bonus();
        if(b>0&&e){
          var base=Math.round((e.dg?(e.b?150:12):e.b==3?200:e.b?80:15)*(1+(e.lv||1)/5));
          if(typeof XR==='function')P.xp+=XR(Math.round(base*b));else P.xp+=Math.round(base*b);
          S.frac+=b;while(S.frac>=1){S.frac-=1;_zk.call(this,e)}   /* tu vi: gọi thêm theo phần dư */
          if(S.frac>0&&Math.random()<S.frac){S.frac=0;_zk.call(this,e)}
        }
      }
    }catch(x){}
    return r;
  };
}catch(e){}

/* ---------- nền: linh ảnh người khác + mạch sáng ---------- */
function bgFn(gy,a){
  var t=a.tick(),w=a.wmax(),k,o,x,y,i,lite=a.lite();
  g.save();g.globalCompositeOperation='lighter';
  var pool=S.inf?S.inf.pool/100:0,pu=.5+.5*Math.sin(t*.04);
  /* mạch linh khí sáng dần theo thanh Linh Khí */
  g.strokeStyle='rgba(90,200,255,'+(.10+.35*pool+.06*pu)+')';g.lineWidth=(2+4*pool)*s;
  g.beginPath();
  for(i=0;i<=24;i++){x=w*s*i/24;y=gy+6*s+Math.sin(t*.03+i*.7)*3*s;if(i)g.lineTo(x,y);else g.moveTo(x,y)}
  g.stroke();
  if(tideLeft()>0&&!lite){g.fillStyle='rgba(255,220,110,'+(.05+.04*pu)+')';g.fillRect(0,0,w*s,gy)}
  if(springLeft()>0){
    var sx=w*s*.5;var q=g.createRadialGradient(sx,gy-30*s,4*s,sx,gy-30*s,70*s);
    q.addColorStop(0,'rgba(140,245,255,.55)');q.addColorStop(1,'rgba(140,245,255,0)');
    g.fillStyle=q;g.beginPath();g.arc(sx,gy-30*s,70*s,0,6.283);g.fill();
  }
  g.restore();
  /* linh ảnh */
  g.save();g.textAlign='center';
  for(k in S.others){
    o=S.others[k];x=o.x*s;y=gy-26*s+Math.sin(t*.06+x)*3*s;
    g.globalAlpha=.75;
    var q2=g.createRadialGradient(x,y,2*s,x,y,20*s);q2.addColorStop(0,'rgba(180,235,255,.9)');q2.addColorStop(1,'rgba(90,170,255,0)');
    g.fillStyle=q2;g.beginPath();g.arc(x,y,20*s,0,6.283);g.fill();
    g.fillStyle='rgba(230,250,255,.9)';g.beginPath();g.ellipse(x,y,6*s,9*s,0,0,6.283);g.fill();
    g.globalAlpha=1;g.font=Math.max(10,11*s)+'px '+FONT;g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.7)';
    var lb=o.name+' Lv'+o.lv;g.strokeText(lb,x,y-24*s);g.fillStyle='#d8f6ff';g.fillText(lb,x,y-24*s);
  }
  g.restore();
}

/* ---------- đăng ký phụ bản ---------- */
var api=PBC.make({
  id:'linhmach',label:CF.label,base:CF.base,req:CF.req,
  names:{gob:'Linh Ảnh Quỷ',wolf:'Mạch Lang',scorp:'Mạch Hạt',arch:'Linh Cung Thủ',mage:'Mạch Pháp Sư',ogre:'Mạch Tướng',golem:'Mạch Chủ'},
  diff:{hp:1.3,df:1.2,eHp:1.2,eDf:1.1,bHp:1,bDf:1},
  nameFn:function(e,nm){return e.lm?'Boss Mạch Chủ':nm},
  onEnter:function(a){
    S.inf=null;S.others={};S.kills=0;S.acc=0;S.dmg=0;S.boss=null;S.nextAt=0;S.fail=0;S.err='';S.ext=0;S.frac=0;S.uiT=30;
    if(logged())claim();
  },
  onLeave:function(a){
    try{if(logged())KCL.rpc('lm_leave',{p_slot:cur|0}).catch(function(){})}catch(e){}
    try{if(S.ext){SLT.length=Math.min(SLT.length,S.base);S.ext=0}}catch(e){}
    S.boss=null;S.inf=null;S.others={};
    try{hud().style.display='none'}catch(e){}
    if(logged()){S.claimAt=0;claim()}
  },
  step:stepFn,
  bg:bgFn
});

/* Đạo Thể / Tiên Nhân (tier>=1) vào được ở mọi cấp: PBC đọc cfg.req mỗi lần vào nên cho nó đọc động */
try{Object.defineProperty(api.cfg,'req',{configurable:true,enumerable:true,get:function(){return canEnter()?0:CF.req}})}catch(e){}

/* ---------- cổng riêng ở Làng Tân Thủ (cùng kiểu Cổng Hội Chiến, world/94) ---------- */
var gGo=0,ov=null,box=null,tmr=0;
function gx(){return gateX()+CF.gx}
function gyy(){return gateY()+CF.gy*s}
function plainVil(){try{return !window.VWD||(VWD.plain?VWD.plain():true)}catch(e){return true}}
function inMainVillage(){
  try{return !!(started&&!dg&&vil)&&!(window.CITYOL&&CITYOL.on())&&!(window.TT2&&TT2.on())&&!(window.TT3&&TT3.on())&&plainVil()}catch(e){return false}
}
function drawGate(){
  if(!inMainVillage())return;
  var x=gx()*s,y=gyy(),t=fr,RR=54*s*(2/3),RX=RR*.62,pu=.5+.5*Math.sin(t*.08),i,a,ok=true;
  ok=canEnter();
  var col=ok?'90,200,255':'130,150,175',ed=ok?'#7fdcff':'#7f93b8';
  g.save();g.globalCompositeOperation='lighter';
  var q=g.createRadialGradient(x,y,RR*.2,x,y,RR*2.3);q.addColorStop(0,'rgba('+col+','+(ok?.3+.22*pu:.15)+')');q.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=q;g.beginPath();g.arc(x,y,RR*2.3,0,6.283);g.fill();g.restore();
  g.save();g.translate(x,y);
  g.beginPath();g.ellipse(0,0,RX,RR,0,0,6.283);q=g.createRadialGradient(0,0,2,0,0,RR);
  q.addColorStop(0,ok?'#d8f6ff':'#1c2433');q.addColorStop(.6,ok?'#2f8fd0':'#222c40');q.addColorStop(1,ok?'#06223a':'#0a0f1a');
  g.fillStyle=q;g.fill();g.lineWidth=5*s;g.strokeStyle=ed;g.shadowColor=ed;g.shadowBlur=ok?8+8*pu:3;g.stroke();g.shadowBlur=0;
  g.strokeStyle='rgba(255,255,255,'+(ok?.45:.2)+')';g.lineWidth=1.5*s;
  for(i=0;i<3;i++){g.beginPath();g.ellipse(0,0,RX*(.3+i*.22),RR*(.3+i*.22),t*.04*(i%2?1:-1)+i,0,4.2);g.stroke()}
  for(i=0;i<12;i++){a=i/12*6.283+t*.012;
    g.strokeStyle='rgba('+col+','+(.35+.5*(.5+.5*Math.sin(t*.1+i))).toFixed(2)+')';g.lineWidth=2*s;
    g.beginPath();g.moveTo(Math.cos(a)*RX*1.22,Math.sin(a)*RR*1.22);g.lineTo(Math.cos(a)*RX*1.36,Math.sin(a)*RR*1.36);g.stroke()}
  g.font=Math.round(RR*.62)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=ok?1:.55;g.fillStyle='#fff';g.fillText('🌀',0,2*s);g.globalAlpha=1;
  g.restore();
  g.save();g.font='bold '+Math.max(12,15*s)+'px '+FONT;g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';
  g.strokeText('🌀 Linh Mạch',x,y-RR-14*s);g.fillStyle=ok?'#bfeaff':'#aab4c8';g.fillText('🌀 Linh Mạch',x,y-RR-14*s);
  g.font=Math.max(10,12*s)+'px '+FONT;var by=y+RR+18*s+Math.sin(t*.1)*3,tx=ok?'Farm chung':'🔒 Cần Lv'+CF.req+' hoặc Đạo Thể';
  g.strokeText(tx,x,by);g.fillStyle=ok?'#d8f2ff':'#8a96b0';g.fillText(tx,x,by);
  g.restore();
}
var _gd=gateDraw;gateDraw=function(){_gd.apply(this,arguments);try{drawGate()}catch(x){}};
c.addEventListener('pointerdown',function(e){
  gGo=0;if(!inMainVillage()||bo)return;
  var px=e.offsetX/s,py=e.offsetY;
  if(Math.abs(px-gx())<38&&Math.abs(py-gyy())<57*s){vt=cl(gx(),40,vw()-40);vgo=-1;gGo=1}});
var _vs=vstep;vstep=function(){
  _vs.apply(this,arguments);
  if(gGo){if(mvDir)gGo=0;else if(vt==null){gGo=0;if(Math.abs(P.x-cl(gx(),40,vw()-40))<16)openPanel()}}
};

/* ---------- bảng cổng ---------- */
function closePanel(){clearInterval(tmr);tmr=0;if(ov)ov.style.display='none'}
function openPanel(){
  if(!inMainVillage())return;
  if(!ov){
    ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:99980;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;padding:10px;box-sizing:border-box';
    ov.onpointerdown=function(e){if(e.target===ov){e.stopPropagation();closePanel()}};
    box=document.createElement('div');
    box.style.cssText='width:min(380px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(#10243a,#0a1220);border:2px solid #6fd0ff;border-radius:14px;padding:12px 14px;color:#dff4ff;font:13.5px/1.55 '+FONT+';box-shadow:0 8px 30px #000b';
    box.onpointerdown=function(e){e.stopPropagation()};
    ov.appendChild(box);document.body.appendChild(ov);
  }
  var ok=canEnter(),warn=!logged()?'Cần đăng nhập ☁ để farm cùng người khác (không đăng nhập vẫn vào farm một mình được).':'';
  box.innerHTML='<div style="text-align:center;font-size:18px;color:#9fe3ff;letter-spacing:1px">🌀 LINH MẠCH ĐỘNG</div>'
   +'<div style="text-align:center;font-size:12px;opacity:.75;margin-bottom:6px">Bãi farm quái chung · tối đa 20 người/kênh · không tranh quái</div>'
   +'<div style="font-size:12.5px;margin:6px 0">• Mỗi người khác trong phòng: <b>+5% EXP &amp; tu vi</b> (tối đa +50%).<br>'
   +'• Linh Khí 33 → <b>⚡ Triều Quái</b> · 66 → <b>💎 Linh Tuyền</b> · 100 → <b>👹 Boss Mạch Chủ</b> (chung 1 thanh máu).<br>'
   +'• Hết vòng: thưởng 💰 + 🔒 Linh Thạch khoá (hạ ≥40 quái, tối đa 12 vòng/ngày).<br>'
   +'• Rời bản đồ = thoát khỏi phòng; thưởng vòng đang chơi nhận ở lần vào/ra sau.</div>'
   +'<div style="font-size:12.5px;color:#ffb0a0;min-height:16px;text-align:center">'+(ok?warn:'🔒 Cần Lv'+CF.req+' hoặc đã lên Đạo Thể / Tiên Nhân')+'</div>'
   +'<div style="display:flex;gap:8px;margin-top:8px"><button id="lmd-go" style="flex:1;padding:10px;border-radius:10px;border:1px solid #6fd0ff;font:bold 14px '+FONT+';'
   +(ok?'background:linear-gradient(#1f7fc0,#0c3d66);color:#fff':'background:#2a2a34;color:#8a8a98')+'">'+(ok?'🌀 Vào Linh Mạch':'🔒 Chưa đủ cấp')+'</button>'
   +'<button id="lmd-x" style="padding:10px 16px;border-radius:10px;border:1px solid #3a6a8a;background:#0e1a2a;color:#dff4ff;font:14px '+FONT+'">Đóng</button></div>';
  ov.style.display='flex';
  document.getElementById('lmd-x').onclick=closePanel;
  document.getElementById('lmd-go').onclick=function(){if(!ok)return;closePanel();api.enter()};
}

window.LMD={api:api,cfg:CF,state:S,enter:api.enter,on:api.on,open:openPanel};
})();
