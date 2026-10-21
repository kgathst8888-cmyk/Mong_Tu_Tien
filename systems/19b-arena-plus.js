/* ===== ĐẤU TRƯỜNG PLUS v1 (Fix374) =====
   Module nâng cấp Đấu Trường, nạp SAU systems/19-arena.js. Không sửa logic trận / SQL / điểm online.
   - Sàn đấu mới: bầu trời theo hạng, đấu trường cổ + khán đài, cờ, đuốc cháy, trận pháp xoay, tàn lửa (nền dựng 1 lần rồi cache -> nhẹ).
   - Cảnh VS vào trận (tên, môn phái, lực chiến, hạng) + "CHIẾN!".
   - Hiệu ứng đòn: tia lửa, vòng sóng, vệt chém, rung màn hình, loé trắng khi đòn nặng, viền đỏ khi máu thấp.
   - Hạng đấu trường (Tân Binh -> Chí Tôn) theo điểm, thanh tiến độ, thông báo thăng hạng.
   - Thưởng: vàng theo hạng + chuỗi thắng, rương mốc thắng trong ngày, thưởng cuối mùa (theo tháng) theo hạng cao nhất.
   - Giao diện sảnh / kết quả / bảng xếp hạng đẹp hơn (CSS + banner).
   Chỉnh cân bằng: ArenaPlus.cfg (winGold, chestAt, chestGold, chestLT, seasonGold, seasonLT, streakStep, streakCap).
   Gỡ <script> của file này thì Đấu Trường quay về như cũ (các điểm móc trong 19-arena.js đều có try/catch). */
(function(){
'use strict';
if(window.ArenaPlus)return;
var KEY='kthm2_arena_plus_v1',AKEY='kthm2_arena_v3';
var CFG={
 winGold:[10000,15000,25000,40000,60000,90000,130000,180000],
 streakStep:.05,streakCap:10,
 chestAt:[2,5,8],chestGold:[100000,250000,500000],chestLT:[0,0,3],
 seasonGold:[0,200000,400000,800000,1500000,2500000,4000000,6000000],
 seasonLT:[0,0,0,5,10,20,35,50]
};
var TIERS=[
 {n:'Tân Binh',min:0,ic:'🪨',c:'#b4b4b4',sky:['#0b0a16','#241a2a','#4a3436']},
 {n:'Thanh Đồng',min:1000,ic:'🥉',c:'#e09a58',sky:['#120a0a','#3a1c14','#8a4a2a']},
 {n:'Bạch Ngân',min:1100,ic:'🥈',c:'#d6e0f0',sky:['#08101c','#1c2a44','#4a6890']},
 {n:'Hoàng Kim',min:1250,ic:'🥇',c:'#ffd24a',sky:['#140e04','#40280a','#a8741c']},
 {n:'Bạch Kim',min:1450,ic:'💠',c:'#7ff0e0',sky:['#04121a','#0c3a44','#2a8a90']},
 {n:'Kim Cương',min:1700,ic:'💎',c:'#9cc8ff',sky:['#0a0820','#26205a','#5a5ad0']},
 {n:'Tiên Vương',min:2000,ic:'👑',c:'#ff7a9a',sky:['#14040c','#4a1030','#b8386a']},
 {n:'Chí Tôn',min:2400,ic:'🔱',c:'#ffb020',sky:['#050505','#1c1408','#6a4a10']}
];
function num(v,d){v=Number(v);return isFinite(v)?v:d}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function fmt(n){return Math.round(n).toLocaleString()}
function hexA(h,a){var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h||'');if(!m)return 'rgba(255,255,255,'+a+')';return 'rgba('+parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16)+','+a+')'}
function rnd(seed){var x=(seed|0)||1;return function(){x=(x*1664525+1013904223)|0;return(x>>>0)/4294967296}}
function cloudOn(){try{return !!(window.KCL&&KCL.OK&&KCL.sess&&KCL.sess())}catch(e){return false}}
function curPts(){var p=null;try{var S=window.Arena&&Arena.net&&Arena.net.sync;if(S&&S.pts!=null&&cloudOn())p=S.pts|0}catch(e){}
 if(p==null){try{var a=JSON.parse(localStorage.getItem(AKEY)||'null');p=a&&a.points!=null?(a.points|0):1000}catch(e){p=1000}}return p}
function tierOf(p){var t=0;for(var i=0;i<TIERS.length;i++)if(p>=TIERS[i].min)t=i;return t}
function dayKey(){return new Date().toISOString().slice(0,10)}
function seasonKey(){return new Date().toISOString().slice(0,7)}
function ld(){var s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
 if(!s||typeof s!=='object')s={};if(!Array.isArray(s.cl))s.cl=[];return s}
function sv_(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function give(g,lt){
 try{if(g>0)gold=(gold|0)+Math.round(g)}catch(e){}
 try{if(lt>0&&window.LT&&LT.earnKS)LT.earnKS(lt)}catch(e){}
 try{if(typeof sv==='function')sv()}catch(e){}}
function toast(html){try{var d=document.createElement('div');d.className='ap-toast';d.innerHTML=html;d.onclick=function(){d.remove()};document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove()},9000)}catch(e){}}
function roll(){
 var s=ld(),k=seasonKey(),d=dayKey(),ch=false;
 if(s.day!==d){s.day=d;s.dw=0;s.dl=0;s.cl=[];ch=true}
 if(s.season!==k){
  var old=s.season,pk=s.peak|0;
  if(old&&pk>=1){var g=CFG.seasonGold[pk]||0,lt=CFG.seasonLT[pk]||0;give(g,lt);
   toast('🏆 Mùa '+esc(old)+' kết thúc · hạng cao nhất '+TIERS[pk].ic+' '+TIERS[pk].n+'<br>Thưởng: 💰 '+fmt(g)+(lt?' · 🔒 '+lt+' Linh Thạch khoá':''))}
  s.season=k;s.peak=0;s.lastTier=null;ch=true}
 if(ch)sv_(s);
 return s}
function note(pts){var s=ld(),t=tierOf(pts);s.lastTier=t;if(t>(s.peak|0))s.peak=t;sv_(s)}
function tag(p){var T=TIERS[tierOf(num(p,0))];return '<b class="ap-tg" style="color:'+T.c+'">'+T.ic+' '+T.n+'</b>'}

/* ===== Banner sảnh ===== */
function banner(pts){
 var s=roll();pts=num(pts,curPts());note(pts);
 var t=tierOf(pts),T=TIERS[t],N=TIERS[t+1],pct=N?Math.max(0,Math.min(100,(pts-T.min)/(N.min-T.min)*100)):100;
 var now=new Date(),end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1)),dl=Math.max(0,Math.ceil((end-now)/864e5));
 var nodes=CFG.chestAt.map(function(a){return '<em class="'+(s.dw>=a?'on':'')+'">🎁<small>'+a+'</small></em>'}).join('');
 var pk=s.peak|0,sr=pk>=1?'Thưởng cuối mùa (hạng cao nhất '+TIERS[pk].ic+' '+TIERS[pk].n+'): 💰 '+fmt(CFG.seasonGold[pk])+(CFG.seasonLT[pk]?' · 🔒 '+CFG.seasonLT[pk]+' LT khoá':''):'Đạt 🥉 Thanh Đồng trở lên để nhận thưởng cuối mùa';
 return '<div class="ap-ban" style="--c:'+T.c+'"><div class="ap-ico">'+T.ic+'</div><div class="ap-mid"><div class="ap-tn">'+T.n+' <i>Mùa '+esc(s.season||seasonKey())+' · còn '+dl+' ngày</i></div><div class="ap-bar"><u style="width:'+pct+'%"></u></div><small>'+(N?pts+' / '+N.min+' điểm → '+N.ic+' '+N.n:pts+' điểm · Hạng tối cao')+'</small></div></div>'
  +'<div class="ap-day"><span>Thắng hôm nay <b>'+(s.dw|0)+'</b></span><div class="ap-nodes">'+nodes+'</div></div><div class="ap-ssn">'+sr+'</div>'}

/* ===== Kết quả trận ===== */
function tierPanel(el){
 if(!el||!el.isConnected)return;
 var pts=curPts(),t=tierOf(pts),T=TIERS[t],N=TIERS[t+1],s=ld(),pct=N?Math.max(0,Math.min(100,(pts-T.min)/(N.min-T.min)*100)):100;
 var up=(s.lastTier!=null&&t>s.lastTier)||el.dataset.up==='1';if(up)el.dataset.up='1';
 el.style.setProperty('--c',T.c);el.classList.toggle('promo',up);
 el.innerHTML='<div class="ap-ico">'+T.ic+'</div><div class="ap-mid"><div class="ap-tn">'+T.n+' <i>'+pts+' điểm</i></div><div class="ap-bar"><u style="width:'+pct+'%"></u></div><small>'+(N?'Còn '+(N.min-pts)+' điểm → '+N.ic+' '+N.n:'Hạng tối cao')+'</small></div>'+(up?'<div class="ap-up">⬆ THĂNG HẠNG!</div>':'');
 s.lastTier=t;if(t>(s.peak|0))s.peak=t;sv_(s)}
function result(p,op,b,pts,replay){
 var card=p.querySelector('.result-card'),sub=p.querySelector('.result-sub');if(!card||!sub)return;
 var s=roll(),info=null,at=0,st=null;
 try{st=JSON.parse(localStorage.getItem(AKEY)||'null')||{};at=(st.lastBattle&&st.lastBattle.at)||0}catch(e){st={}}
 if(replay)info=s.lastInfo||null;
 else if(op&&op.invited)info={inv:1};
 else if(at&&at!==s.lastAt){
  s.lastAt=at;var t=tierOf(curPts());info={win:!!b.win,g:0,lt:0,ch:[]};
  if(b.win){
   s.dw=(s.dw|0)+1;s.w=(s.w|0)+1;var stk=st.streak|0;info.stk=stk;
   info.g=Math.round((CFG.winGold[t]||0)*(1+Math.min(stk,CFG.streakCap)*CFG.streakStep));
   for(var i=0;i<CFG.chestAt.length;i++){if(s.dw>=CFG.chestAt[i]&&s.cl.indexOf(i)<0){s.cl.push(i);
    var cg=Math.round(CFG.chestGold[i]*(1+t*.3)),cl=CFG.chestLT[i]>0?CFG.chestLT[i]+t:0;info.ch.push({i:i,g:cg,lt:cl});info.g+=cg;info.lt+=cl}}
   give(info.g,info.lt);
  }else{s.dl=(s.dl|0)+1;s.l=(s.l|0)+1}
  s.lastInfo=info;sv_(s)}
 else info=s.lastInfo||null;
 var h='<div class="ap-res"><div class="ap-tier" id="ap-tier"></div>';
 if(info&&info.inv)h+='<div class="ap-chips"><span>🤝 Trận LIVE được mời — không tính thưởng mốc</span></div>';
 else if(info){
  var c='';
  if(info.win){c+='<span>💰 +'+fmt(info.g)+'</span>';if(info.lt)c+='<span>🔒 +'+info.lt+' LT khoá</span>';if(info.stk>1)c+='<span>🔥 Chuỗi '+info.stk+'</span>';
   (info.ch||[]).forEach(function(x){c+='<span class="ch">🎁 Rương mốc '+(x.i+1)+'</span>'})}
  var nx=null;for(var j=0;j<CFG.chestAt.length;j++)if((s.dw|0)<CFG.chestAt[j]){nx=CFG.chestAt[j];break}
  c+='<span>'+(nx?'🎁 Thắng thêm '+(nx-(s.dw|0))+' trận tới rương mốc':'🎁 Đã nhận hết rương mốc hôm nay')+'</span>';
  h+='<div class="ap-chips">'+c+'</div>'}
 sub.insertAdjacentHTML('afterend',h+'</div>');
 var el=card.querySelector('#ap-tier');tierPanel(el);setTimeout(function(){tierPanel(el)},1300);setTimeout(function(){tierPanel(el)},3000);
 if(b.win&&!replay){var cf='<div class="ap-cf">',cc=TIERS[tierOf(curPts())].c;for(var k=0;k<18;k++)cf+='<i style="left:'+(k*5.5+Math.random()*4).toFixed(1)+'%;animation-delay:'+(Math.random()*.7).toFixed(2)+'s;background:'+(k%3?cc:'#fff')+'"></i>';card.insertAdjacentHTML('afterbegin',cf+'</div>')}}

/* ===== Cảnh VS vào trận ===== */
function myInfo(){var o={n:'Đạo Hữu',r:'',pw:0,ci:0};
 try{o.ci=cur;var q=PS[cur];o.n=(q&&(q.nm||q.name))||o.n}catch(e){}
 try{o.r=ZC.nm()}catch(e){}
 try{o.pw=Math.max(1,Math.round(atk()*5+df()*.55+mx()*.08))}catch(e){}
 return o}
function side(cls,n,ci,realm,pw,pts){
 var c=null;try{c=CHR[ci]}catch(e){}var col=(c&&c.c)||'#ffd86a',ic=(c&&c.t==='a')?'🏹':(c&&c.t==='w')?'🗡️':'✨';
 return '<div class="ap-side '+cls+'" style="--c:'+col+'"><div class="ap-av">'+ic+'</div><b>'+esc(n)+'</b><small>'+esc((c&&c.n)||'Tu sĩ')+(realm?' · '+esc(realm):'')+'</small><small>⚔ '+fmt(pw)+'</small>'+(pts!=null?tag(pts):'')+'</div>'}
function intro(A,root){
 if(!root||!A||!A.op)return;
 var old=document.getElementById('ap-vs');if(old)old.remove();
 var m=myInfo(),op=A.op,live=!!A.live,d=document.createElement('div');
 d.id='ap-vs';d.className='ap-vs'+(live?' fast':'');
 d.innerHTML='<div class="ap-vs-bg"></div>'+side('L',m.n,m.ci,m.r,m.pw,curPts())+'<div class="ap-vsmark">VS</div>'+side('R',op.n,op.ci,op.realm,num(op.pw,0),op.pts!=null?num(op.pts,null):null)+'<div class="ap-go">CHIẾN!</div>';
 root.appendChild(d);
 var ms=live?1250:1700;
 if(!live){A.paused=true;if(A.tLimit)A.tLimit+=Math.round(ms/1000*60);setTimeout(function(){if(A.active&&A.paused)A.paused=false},ms)}
 setTimeout(function(){if(d.parentNode)d.remove()},ms+150)}

/* ===== Sàn đấu ===== */
var BG={key:'',cv:null,tt:0,t:0,glow:null};
function glowSprite(){if(BG.glow)return BG.glow;var c=document.createElement('canvas');c.width=c.height=96;var x=c.getContext('2d'),g=x.createRadialGradient(48,48,2,48,48,48);
 g.addColorStop(0,'rgba(255,230,160,1)');g.addColorStop(.35,'rgba(255,150,60,.55)');g.addColorStop(1,'rgba(255,100,20,0)');x.fillStyle=g;x.fillRect(0,0,96,96);BG.glow=c;return c}
function buildBG(W,H,GY,t){
 var dpr=(typeof DPR==='number'&&DPR>0)?DPR:1,cv=document.createElement('canvas');cv.width=Math.max(2,Math.ceil(W*dpr));cv.height=Math.max(2,Math.ceil(H*dpr));
 var c=cv.getContext('2d');c.scale(dpr,dpr);var T=TIERS[t],sk=T.sky,r=rnd(77+t*13),i,x,y;
 var gr=c.createLinearGradient(0,0,0,GY);gr.addColorStop(0,sk[0]);gr.addColorStop(.6,sk[1]);gr.addColorStop(1,sk[2]);c.fillStyle=gr;c.fillRect(0,0,W,GY+2);
 for(i=0;i<70;i++){c.globalAlpha=.25+r()*.6;c.fillStyle='#fff';var z=r()<.15?2:1;c.fillRect(r()*W,r()*GY*.65,z,z)}c.globalAlpha=1;
 var mx0=W*.5,my0=GY*.3,mr=Math.min(W,H)*.085,mg=c.createRadialGradient(mx0,my0,mr*.2,mx0,my0,mr*3.4);
 mg.addColorStop(0,hexA(T.c,.5));mg.addColorStop(1,hexA(T.c,0));c.fillStyle=mg;c.beginPath();c.arc(mx0,my0,mr*3.4,0,6.283);c.fill();
 c.globalAlpha=.92;c.fillStyle=T.c;c.beginPath();c.arc(mx0,my0,mr,0,6.283);c.fill();c.globalAlpha=.13;c.fillStyle='#000';
 for(i=0;i<5;i++){c.beginPath();c.arc(mx0+(r()-.5)*mr,my0+(r()-.5)*mr,mr*(.08+r()*.14),0,6.283);c.fill()}c.globalAlpha=1;
 function ridge(y0,amp,col,steps){c.fillStyle=col;c.beginPath();c.moveTo(0,GY+4);c.lineTo(0,y0);var xx=0;while(xx<=W){c.lineTo(xx,y0-r()*amp);xx+=W/steps}c.lineTo(W,y0);c.lineTo(W,GY+4);c.closePath();c.fill()}
 ridge(GY*.80,GY*.16,'rgba(12,8,22,.55)',9);ridge(GY*.88,GY*.12,'rgba(8,5,16,.75)',13);
 /* khán đài + vòm */
 var wallH=Math.max(60,GY*.3),wt=GY-wallH,n=Math.max(5,Math.round(W/92)),aw=W/n;
 c.fillStyle='#17101c';c.fillRect(0,wt,W,wallH+2);
 c.fillStyle='rgba(8,6,14,.95)';for(x=0;x<W;x+=8){var hh=3+r()*2;c.beginPath();c.arc(x+4,wt-6-r()*3,hh,0,6.283);c.fill();c.fillRect(x+1,wt-4,6,5)}
 for(x=0;x<W;x+=26){if(r()<.18){c.fillStyle=hexA(T.c,.75);c.fillRect(x+3,wt-13,3,3)}}
 for(i=0;i<n;i++){var ax=i*aw+aw*.14,w2=aw*.72,ah=wallH*.62;c.fillStyle='#07050d';c.beginPath();c.moveTo(ax,GY);c.lineTo(ax,GY-ah+w2/2);c.arc(ax+w2/2,GY-ah+w2/2,w2/2,Math.PI,0);c.lineTo(ax+w2,GY);c.closePath();c.fill();
  c.strokeStyle=hexA(T.c,.35);c.lineWidth=1.5;c.stroke()}
 c.fillStyle=hexA(T.c,.5);c.fillRect(0,wt,W,2);c.fillStyle='rgba(255,255,255,.07)';c.fillRect(0,wt+2,W,1);
 /* cờ */
 [.17,.83].forEach(function(f){var bx=W*f,by=wt-72;c.fillStyle='#2a1a10';c.fillRect(bx-14,by-4,28,4);var bg=c.createLinearGradient(0,by,0,by+78);bg.addColorStop(0,hexA(T.c,.95));bg.addColorStop(1,hexA(T.c,.45));
  c.fillStyle=bg;c.beginPath();c.moveTo(bx-11,by);c.lineTo(bx+11,by);c.lineTo(bx+11,by+70);c.lineTo(bx,by+60);c.lineTo(bx-11,by+70);c.closePath();c.fill();
  c.strokeStyle='rgba(255,230,160,.8)';c.lineWidth=1.2;c.stroke();c.fillStyle='rgba(20,10,5,.75)';c.font='bold 15px serif';c.textAlign='center';c.fillText('⚔',bx,by+34)});
 /* sàn */
 var fg=c.createLinearGradient(0,GY,0,H);fg.addColorStop(0,'#41343a');fg.addColorStop(.5,'#2a1f27');fg.addColorStop(1,'#120c12');c.fillStyle=fg;c.fillRect(0,GY,W,H-GY);
 c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;
 for(i=-9;i<=9;i++){c.beginPath();c.moveTo(W/2+i*W/46,GY);c.lineTo(W/2+i*W/5.4,H);c.stroke()}
 for(i=1;i<8;i++){y=GY+(H-GY)*Math.pow(i/8,1.7);c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
 var eg=c.createLinearGradient(0,0,W,0);eg.addColorStop(0,hexA(T.c,0));eg.addColorStop(.5,hexA(T.c,.75));eg.addColorStop(1,hexA(T.c,0));c.fillStyle=eg;c.fillRect(0,GY,W,3);
 var cx=W/2,cy=GY+(H-GY)*.46,rx=Math.min(W*.36,420),ry=Math.max(18,(H-GY)*.3);
 c.strokeStyle=hexA(T.c,.28);c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.283);c.stroke();c.beginPath();c.ellipse(cx,cy,rx*.78,ry*.78,0,0,6.283);c.stroke();
 for(i=0;i<24;i++){var a=i/24*6.283,ca=Math.cos(a),sa=Math.sin(a);c.beginPath();c.moveTo(cx+ca*rx*.78,cy+sa*ry*.78);c.lineTo(cx+ca*rx,cy+sa*ry);c.stroke()}
 var vg=c.createRadialGradient(W/2,H*.55,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=vg;c.fillRect(0,0,W,H);
 return cv}
function dyn(g,W,H,GY,t,f){
 var T=TIERS[t],cx=W/2,cy=GY+(H-GY)*.46,rx=Math.min(W*.36,420),ry=Math.max(18,(H-GY)*.3),gl=glowSprite(),i;
 g.save();g.globalCompositeOperation='lighter';
 g.globalAlpha=.1+.06*Math.sin(f*.05);g.drawImage(gl,cx-rx*.9,cy-ry*1.6,rx*1.8,ry*3.2);
 g.strokeStyle=T.c;g.lineWidth=3;g.globalAlpha=.3+.15*Math.sin(f*.05);g.setLineDash([18,14]);g.lineDashOffset=-f*.6;g.beginPath();g.ellipse(cx,cy,rx*.89,ry*.89,0,0,6.283);g.stroke();
 g.lineDashOffset=f*.9;g.globalAlpha=.22;g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,rx*.62,ry*.62,0,0,6.283);g.stroke();g.setLineDash([]);
 var wallH=Math.max(60,GY*.3),pos=[.06,.28,.72,.94];
 for(i=0;i<4;i++){var tx=W*pos[i],ty=GY-Math.min(78,wallH*.5),fl=Math.sin(f*.31+i*1.7),fl2=Math.sin(f*.47+i*2.3);
  g.globalAlpha=.55+.2*fl;g.drawImage(gl,tx-46,ty-52,92,92);
  g.globalAlpha=.9;g.fillStyle='#ff8a2a';g.beginPath();g.ellipse(tx,ty-7,6+fl*1.2,15+fl2*2.5,0,0,6.283);g.fill();
  g.fillStyle='#ffd45a';g.beginPath();g.ellipse(tx,ty-5,3.8+fl*.8,10+fl2*2,0,0,6.283);g.fill();
  g.fillStyle='#fff6d0';g.beginPath();g.ellipse(tx,ty-3,1.8,5.5+fl2,0,0,6.283);g.fill()}
 g.fillStyle=T.c;
 for(i=0;i<22;i++){var ex=((i*97.3+f*(.18+(i%5)*.07))%(W+40))-20+Math.sin(f*.04+i)*6,ey=GY-((i*53.7+f*(.35+(i%4)*.12))%(GY*.82));g.globalAlpha=.35+.35*Math.sin(f*.08+i*1.3);g.fillRect(ex,ey,2,2)}
 g.restore();
 g.save();g.fillStyle='#2a1a10';for(i=0;i<4;i++){var px=W*pos[i],py=GY-Math.min(78,wallH*.5);g.fillRect(px-2.5,py+4,5,GY-py-2);g.fillRect(px-7,py+1,14,4)}g.restore()}
function bg(g,W,H,s,GY,A){
 try{
  var now=Date.now();if(now-BG.tt>1500){BG.tt=now;BG.t=tierOf(curPts())}
  var t=BG.t,key=Math.round(W)+'x'+Math.round(H)+'|'+t+'|'+Math.round(GY)+'|'+((typeof DPR==='number')?DPR:1);
  if(BG.key!==key){BG.cv=buildBG(W,H,GY,t);BG.key=key}
  g.globalAlpha=1;g.drawImage(BG.cv,0,0,W,H);
  dyn(g,W,H,GY,t,(A&&A.frame)||0);
  return true
 }catch(e){BG.key='';return false}}

/* ===== Hiệu ứng đòn ===== */
var FX={ph:null,oh:null,f:0,parts:[],rings:[],slash:[],shake:0,flash:0,dx:0,dy:0};
function hit(x,hp,prev,max,col){
 if(prev==null||hp>=prev)return;
 var d=prev-hp,r=Math.min(1,d/Math.max(1,max)),n=Math.min(22,6+Math.round(r*60)),i;
 for(i=0;i<n&&FX.parts.length<110;i++){var ang=Math.random()*Math.PI*1.15-.1,sp=1.5+Math.random()*(3+r*14);
  FX.parts.push({x:x,y:46+Math.random()*26,vx:Math.cos(ang)*sp*(Math.random()<.5?-1:1),vy:Math.sin(ang)*sp+1,l:16+Math.random()*14,m:30,c:Math.random()<.5?'#fff':col})}
 FX.rings.push({x:x,y:58,r:6,l:14,m:14,c:col});
 FX.slash.push({x:x,y:58,a:(Math.random()<.5?1:-1)*(Math.PI/3)+(Math.random()-.5)*.5,l:9,m:9});
 FX.shake=Math.min(11,Math.max(FX.shake,2+r*45));
 if(r>.15)FX.flash=.14}
function colOf(ci){try{return CHR[ci].c||'#ffd86a'}catch(e){return '#ffd86a'}}
function pre(g,s,A){
 var op=A&&A.op;if(!op||!op.p)return;
 var mxp=1;try{mxp=mx()}catch(e){mxp=Math.max(1,P.hp)}
 if(FX.ph==null||A.frame<FX.f){FX.ph=P.hp;FX.oh=op.p.hp;FX.parts.length=0;FX.rings.length=0;FX.slash.length=0;FX.shake=0;FX.flash=0}
 FX.f=A.frame;
 hit(P.x,P.hp,FX.ph,mxp,colOf(op.ci));
 hit(op.p.x,op.p.hp,FX.oh,op.p.max,colOf(typeof cur==='number'?cur:0));
 FX.ph=P.hp;FX.oh=op.p.hp;
 if(FX.shake>.3){FX.dx=(Math.random()-.5)*FX.shake;FX.dy=(Math.random()-.5)*FX.shake*.6;FX.shake*=.84;g.translate(FX.dx,FX.dy)}else{FX.dx=FX.dy=0;FX.shake=0}}
function fx(g,W,H,s,GY,A){
 var i,q;
 g.save();g.globalCompositeOperation='lighter';
 for(i=0;i<FX.parts.length;i++){q=FX.parts[i];q.x+=q.vx;q.y+=q.vy;q.vy-=.25;q.l--;
  g.globalAlpha=Math.max(0,q.l/q.m);g.strokeStyle=q.c;g.lineWidth=2;g.beginPath();g.moveTo(q.x*s,GY-q.y*s);g.lineTo((q.x-q.vx*1.6)*s,GY-(q.y-q.vy*1.6)*s);g.stroke()}
 FX.parts=FX.parts.filter(function(p){return p.l>0});
 for(i=0;i<FX.rings.length;i++){q=FX.rings[i];q.r+=3.4;q.l--;g.globalAlpha=Math.max(0,q.l/q.m)*.8;g.strokeStyle=q.c;g.lineWidth=3;g.beginPath();g.arc(q.x*s,GY-q.y*s,q.r*s,0,6.283);g.stroke()}
 FX.rings=FX.rings.filter(function(p){return p.l>0});
 for(i=0;i<FX.slash.length;i++){q=FX.slash[i];q.l--;var u=1-q.l/q.m,len=(16+46*u)*s,ca=Math.cos(q.a)*len,sa=Math.sin(q.a)*len,px=q.x*s,py=GY-q.y*s;
  g.globalAlpha=Math.max(0,q.l/q.m);g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(px-ca,py+sa);g.lineTo(px+ca,py-sa);g.stroke();
  g.globalAlpha*=.4;g.lineWidth=8;g.stroke()}
 FX.slash=FX.slash.filter(function(p){return p.l>0});
 g.restore();
 if(FX.dx||FX.dy){g.translate(-FX.dx,-FX.dy)}
 if(FX.flash>.01){g.globalAlpha=FX.flash;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.globalAlpha=1;FX.flash*=.8}
 g.globalAlpha=1}


/* ===== Đối thủ sát thật: hình ảnh (mọi trường hiển thị của nhân vật) + né/giảm sát thương ===== */
function vis(ps){var o={},n=0,k,v;if(!ps)return o;for(k in ps){if(!Object.prototype.hasOwnProperty.call(ps,k)||n>=80)continue;v=ps[k];
 if(typeof v==='number'?isFinite(v):typeof v==='boolean'||(typeof v==='string'&&v.length<=40)){o[k]=v;n++}}return o}
function visApply(ps,snap){if(!snap||!ps)return null;var old={},had={},k;
 for(k in snap){if(k==='br'||k==='tier'||k==='fa')continue;had[k]=Object.prototype.hasOwnProperty.call(ps,k);old[k]=ps[k];ps[k]=snap[k]}
 return function(){for(var q in old){if(had[q])ps[q]=old[q];else delete ps[q]}}}
var M={last:null,f:0};
function mit(A){
 if(!A||A.live||!A.op||!A.target)return;
 var T=A.target,pf=A.op.pf||{};
 if(M.last==null||A.frame<M.f)M.last=T.hp;
 M.f=A.frame;var loss=M.last-T.hp;
 if(loss>0){
  if(Math.random()<Math.min(.22,num(pf.dodge,0)/100)){T.hp=M.last;try{DT.push({x:A.op.p.x,y:120,s:'Né',c:'#7fe0ff',l:38})}catch(e){}}
  else{var rf=Math.min(.45,num(pf.dred,0)/100);if(rf>0)T.hp=Math.min(M.last,T.hp+Math.round(loss*rf))}}
 M.last=T.hp}

/* ===== CSS ===== */
function styles(){
 if(document.getElementById('arena-plus-style'))return;
 var st=document.createElement('style');st.id='arena-plus-style';
 st.textContent=[
 '.arena-lobby{background:radial-gradient(120% 70% at 50% 0%,rgba(90,60,20,.45),rgba(16,10,8,.97) 62%)!important;border-color:#d1a85a!important;box-shadow:0 20px 90px #000,0 0 40px rgba(255,200,90,.12) inset!important}',
 '.lobby-title{letter-spacing:.06em;background:linear-gradient(90deg,#ffb94a,#fff3b0,#ffb94a);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:apShine 4s linear infinite;filter:drop-shadow(0 2px 6px rgba(255,170,40,.35))}',
 '@keyframes apShine{to{background-position:200% 0}}',
 '.ap-ban{display:flex;align-items:center;gap:12px;margin:10px 0 6px;padding:10px;border-radius:12px;border:1px solid var(--c);background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(0,0,0,.35));box-shadow:0 0 18px rgba(0,0,0,.5),0 0 14px var(--c) inset}',
 '.ap-ico{font-size:42px;line-height:1;filter:drop-shadow(0 0 10px var(--c));flex:none}',
 '.ap-mid{flex:1;min-width:0}.ap-tn{font-size:17px;font-weight:800;color:var(--c)}.ap-tn i{font-style:normal;font-size:11px;font-weight:600;color:#cdbf9f;margin-left:6px}',
 '.ap-bar{height:9px;border-radius:6px;background:#0c0806;border:1px solid #4a3920;overflow:hidden;margin:5px 0 3px}.ap-bar u{display:block;height:100%;background:linear-gradient(90deg,var(--c),#fff8d0);box-shadow:0 0 8px var(--c);transition:width .8s ease}',
 '.ap-mid small{font-size:11px;color:#c8b995}',
 '.ap-day{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:8px;background:rgba(0,0,0,.35);font-size:12px;color:#e9d9b6}.ap-day b{color:#ffd86a;font-size:15px}',
 '.ap-nodes{display:flex;gap:8px}.ap-nodes em{font-style:normal;position:relative;opacity:.35;filter:grayscale(1);font-size:20px}.ap-nodes em.on{opacity:1;filter:none;animation:apBob 1.6s ease-in-out infinite}.ap-nodes em small{position:absolute;right:-5px;bottom:-4px;background:#2a1a10;border:1px solid #b18b4c;border-radius:7px;padding:0 3px;font-size:9px;color:#ffe9a0}',
 '@keyframes apBob{50%{transform:translateY(-3px)}}',
 '.ap-ssn{margin:6px 0 0;text-align:center;font-size:11px;color:#bcae91;line-height:1.4}',
 '.ap-tg{font-size:10px;margin-left:6px;font-weight:700}',
 '.arena-op{background:linear-gradient(90deg,rgba(255,255,255,.04),rgba(25,16,12,.95))!important;border-left:3px solid #b18b4c!important;transition:transform .12s,border-color .12s}.arena-op:active{transform:scale(.99)}.arena-op b{color:#ffe9b0}',
 '.arena-op button{background:linear-gradient(180deg,#7a5a24,#4a3416)!important;box-shadow:0 2px 0 #1a1008}',
 '.arena-tabs button{transition:background .15s}.arena-tabs button.on{box-shadow:0 0 10px rgba(255,216,106,.35)}',
 '.arena-rk{border-radius:8px;margin-bottom:3px;border-bottom:0!important;background:rgba(255,255,255,.03)}.arena-rk.me{outline:1px solid #ffd86a;background:rgba(255,216,106,.1)!important}',
 '.arena-rk.top1{background:linear-gradient(90deg,rgba(255,210,70,.28),rgba(255,255,255,.03))}.arena-rk.top2{background:linear-gradient(90deg,rgba(200,215,235,.22),rgba(255,255,255,.03))}.arena-rk.top3{background:linear-gradient(90deg,rgba(224,154,88,.24),rgba(255,255,255,.03))}.arena-rk.top1 .n,.arena-rk.top2 .n,.arena-rk.top3 .n{font-size:20px}',
 '.arena-result .result-card{background:radial-gradient(120% 80% at 50% 0%,rgba(110,70,20,.5),#0c0908 65%)!important;position:relative;animation:apIn .35s ease-out}',
 '@keyframes apIn{from{transform:scale(.92);opacity:0}}',
 '.arena-result .result-title.win{font-size:30px!important;letter-spacing:.08em;text-shadow:0 0 18px rgba(255,200,60,.8);animation:apPop .6s ease-out}.arena-result .result-title.lose{text-shadow:0 0 14px rgba(255,80,60,.4)}',
 '@keyframes apPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}',
 '.ap-res{margin:8px 0}.ap-tier{display:flex;align-items:center;gap:12px;padding:9px;border-radius:12px;border:1px solid var(--c,#b18b4c);background:rgba(0,0,0,.4);position:relative;overflow:hidden}',
 '.ap-tier.promo{animation:apGlow 1s ease-in-out 3;box-shadow:0 0 22px var(--c)}@keyframes apGlow{50%{box-shadow:0 0 38px var(--c),0 0 12px #fff inset}}',
 '.ap-up{position:absolute;right:8px;top:6px;background:#fff3b0;color:#3a2200;font-weight:900;font-size:11px;padding:2px 7px;border-radius:8px;animation:apBob 1s infinite}',
 '.ap-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}.ap-chips span{background:rgba(0,0,0,.45);border:1px solid #6a5028;border-radius:14px;padding:3px 9px;font-size:12px;color:#ffe9b0}.ap-chips span.ch{border-color:#ffd86a;background:rgba(255,216,106,.16)}',
 '.ap-cf{position:absolute;left:0;right:0;top:0;height:100%;pointer-events:none;overflow:hidden;z-index:2}.ap-cf i{position:absolute;top:-12px;width:7px;height:12px;opacity:0;animation:apFall 2.4s ease-in forwards}',
 '@keyframes apFall{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(420px) rotate(540deg)}}',
 '.ap-toast{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:100001;background:linear-gradient(180deg,#3a2810,#1a1008);border:1px solid #ffd86a;border-radius:12px;padding:10px 16px;color:#ffe9b0;font-size:13px;line-height:1.5;text-align:center;box-shadow:0 8px 30px #000;max-width:88vw}',
 '.ap-vs{position:absolute;inset:0;z-index:7;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:apFade .3s ease var(--fd,1.4s) forwards}.ap-vs.fast{--fd:.95s}',
 '@keyframes apFade{to{opacity:0}}',
 '.ap-vs-bg{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.35),rgba(0,0,0,.78));animation:apFade .3s ease 0s reverse both}',
 '.ap-side{position:relative;width:38%;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;color:#fff}.ap-side b{font-size:17px;text-shadow:0 2px 6px #000}.ap-side small{font-size:11px;color:#e9d9b6;text-shadow:0 1px 4px #000}',
 '.ap-av{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;border:3px solid var(--c);background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.2),rgba(0,0,0,.65));box-shadow:0 0 22px var(--c)}',
 '.ap-side.L{animation:apL .45s cubic-bezier(.2,.9,.3,1) both}.ap-side.R{animation:apR .45s cubic-bezier(.2,.9,.3,1) both}',
 '@keyframes apL{from{transform:translateX(-130%);opacity:0}}@keyframes apR{from{transform:translateX(130%);opacity:0}}',
 '.ap-vsmark{font-size:50px;font-weight:900;font-style:italic;background:linear-gradient(180deg,#fff7c0,#ff9a2a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 8px #000);animation:apSlam .4s .35s cubic-bezier(.2,1.4,.4,1) both}',
 '@keyframes apSlam{from{transform:scale(3.2);opacity:0}}',
 '.ap-go{position:absolute;left:0;right:0;top:50%;margin-top:-34px;text-align:center;font-size:56px;font-weight:900;color:#fff;letter-spacing:.1em;text-shadow:0 0 24px #ff9a2a,0 4px 10px #000;opacity:0;animation:apGo .5s 1.05s ease-out both}.ap-vs.fast .ap-go{animation-delay:.7s}',
 '@keyframes apGo{0%{opacity:0;transform:scale(.4)}40%{opacity:1;transform:scale(1.25)}100%{opacity:1;transform:scale(1)}}',
 '@media(max-width:640px){.ap-ico{font-size:34px}.ap-av{width:56px;height:56px;font-size:28px}.ap-vsmark{font-size:38px}.ap-go{font-size:40px}.ap-side b{font-size:14px}}'
 ].join('');
 document.head.appendChild(st)}

window.ArenaPlus={cfg:CFG,tiers:TIERS,bg:bg,pre:pre,fx:fx,intro:intro,result:result,vis:vis,visApply:visApply,mit:mit,banner:banner,tag:tag,tierOf:tierOf,curPts:curPts,state:ld,roll:roll};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',styles);else styles();
})();
