/* ===== ✨ HIỆU ỨNG TRẠNG THÁI THẦN THÔNG Ý CẢNH · TIÊN / MA (world/50-y-canh-hieu-ung.js) =====
 * Bổ sung hiệu ứng cho 6 thần thông của world/49-y-canh-than-thong.js (49 chỉ ghi window.STLAST=[tên chiêu, khung] khi tung chiêu):
 *   TIÊN ĐẠO: choáng · xuyên giáp (dùng cơ chế sẵn có của combat/11-status-effects.js qua ST.STP) · bạo kích (nhân 1,8 sát thương, xác suất riêng từng chiêu)
 *   MA ĐẠO:   trúng độc · thiêu đốt · đóng băng (cơ chế sẵn có qua ST.STP) + MỚI: hấp huyết (hồi % sát thương gây ra) · chảy máu (cộng dồn ≤5, đau hơn khi địch đang di chuyển)
 *             · làm chập (sét giật mỗi 0,6s, lan sang địch gần, địch chập chững đánh/ra chiêu) · quỷ ám (nhận thêm 25% sát thương, ma ảnh cắn địch lân cận, chết thì nổ linh hồn)
 * Trạng thái mới lưu trong e.stt (T.bld/bls · T.shk · T.pos). Boss: tỉ lệ ×0,6, thời gian ngắn hơn. Mỗi chiêu chỉ tung (roll) trạng thái 1 lần cho mỗi địch.
 * Chỉnh số liệu: bảng PROF (đồng thời STP). Phụ thuộc: ST (11), YCTT (49), dm/SKF/fr/E/atk/mx/P/DT/PT/MS/BZ/SZ/glowDraw/foe/step (engine). */
(function(){
'use strict';
if(!window.ST||!ST.STP||!window.YCTT||typeof dm!=='function'||typeof step!=='function'||typeof foe!=='function')return;
/* STP = cơ chế sẵn có của module 11 (stun/pierce/burn/poison/freeze). PROF = phần mới (crit/ls/bleed/shock/possess). */
var PROF={
 'Kim Quang Phổ Chiếu':{stp:{stun:.3,pierce:.35},crit:.3},
 'Vô Ngã Kiếm Vũ':{stp:{stun:.2,pierce:.6},crit:.4},
 'Quy Nhất Thiên Phạt':{stp:{stun:.6,pierce:.6},crit:.55},
 'Ma Sát Phệ Hồn':{stp:{poison:.6},ls:.12,bleed:.5},
 'Dục Nương Huyết Chú':{stp:{burn:.35},ls:.08,bleed:.8,possess:.35},
 'Vạn Niệm Câu Hồn':{stp:{freeze:.3,poison:.4,burn:.3},ls:.05,shock:.5,possess:.6}};
Object.keys(PROF).forEach(function(n){ST.STP[n]=PROF[n].stp});
function boss(e){return e.b>=2||e.k==='boss'}
function lab(e,t,c){DT.push({x:e.x,y:(e.hh||100)*SZ+30,s:t,c:c,l:55})}
function dotX(e,d,c,ic){d=Math.max(1,Math.round(Math.min(d,(e.max||d)*(boss(e)?.012:.08))));e.hp-=d;DT.push({x:e.x,y:(e.hh||100)*SZ,s:ic+d,c:c,l:40})}
function near2(e,r){var b=null,bd=r;E.forEach(function(q){if(q===e||q.in>0||q.hp<=0)return;var d=Math.abs(q.x-e.x);if(d<bd){bd=d;b=q}});return b}
function ap(e,k){var T=e.stt||(e.stt={}),bs=boss(e);
  if(k==='bld'){var was=T.bld>0;T.bld=bs?240:360;T.bls=was?Math.min(5,(T.bls||1)+1):1;if(!was)lab(e,'🩸 Chảy máu','#ff4a6a')}
  else if(k==='shk'){if(!(T.shk>0))lab(e,'⚡ Làm chập','#9fe8ff');T.shk=bs?120:210}
  else if(k==='pos'){if(!(T.pos>0))lab(e,'👻 Quỷ ám','#c070ff');T.pos=bs?200:360}}
function rollX(e,pf,id){var T=e.stt||(e.stt={});if(T.rx===id)return;T.rx=id;var k=boss(e)?.6:1;
  if(pf.bleed&&Math.random()<pf.bleed*k)ap(e,'bld');
  if(pf.shock&&Math.random()<pf.shock*k)ap(e,'shk');
  if(pf.possess&&Math.random()<pf.possess*k)ap(e,'pos')}
function soulBurst(e){var T=e.stt;if(!T||!(T.pos>0)||T.pb)return;T.pb=1;T.pos=0;lab(e,'👻 Linh hồn nổ!','#d9a0ff');
  for(var i=0;i<12;i++)try{PT.push({x:e.x,y:30+Math.random()*70,vx:(Math.random()-.5)*7,vy:-Math.random()*4,l:30,c:'#c070ff'})}catch(x){}
  E.forEach(function(q){if(q!==e&&q.in<=0&&q.hp>0&&Math.abs(q.x-e.x)<240)dotX(q,atk()*.5,'#c070ff','👻')})}

/* ---------- bọc dm: bạo kích · hấp huyết · quỷ ám (+25% sát thương nhận) · tung trạng thái mới ---------- */
var _dm=dm;
dm=function(e,m,sl){
  var L=window.STLAST,pf=(typeof SKF!=='undefined'&&SKF&&L&&fr-L[1]<200)?PROF[L[0]]:null,T=e.stt;
  if(T&&T.pos>0)m*=1.25;
  if(pf&&pf.crit&&Math.random()<pf.crit){m*=1.8;var t0=e.stt||(e.stt={});if(t0.cx!==L[1]){t0.cx=L[1];lab(e,'💥 Bạo kích!','#ffd060')}}
  var hp0=e.hp;_dm.call(this,e,m,sl);
  if(pf&&pf.ls){var dealt=hp0-e.hp;if(dealt>0){var h=Math.max(1,Math.round(Math.min(dealt*pf.ls,mx()*.04)));P.hp=Math.min(mx(),P.hp+h);if(h>=mx()*.004||Math.random()<.3)DT.push({x:P.x,y:130,s:'🩸+'+h,c:'#ff6a8a',g:1,l:40})}}
  if(e.hp>0){if(pf)rollX(e,pf,L[1])}else if(e.stt&&e.stt.pos>0)soulBurst(e)};

/* ---------- tick mỗi khung ---------- */
function tickX(e){var T=e.stt;if(!T||e.in>0||e.hp<=0)return;
  if(T.bld>0){T.bld--;if(T.bld%30===0)dotX(e,atk()*.14*(T.bls||1)*(e.mv?1.5:1),'#ff2a4a','🩸');if(!T.bld)T.bls=0}
  if(T.shk>0){T.shk--;if(T.shk%36===0){dotX(e,atk()*.22,'#9fe8ff','⚡');var q=near2(e,220);if(q)dotX(q,atk()*.12,'#9fe8ff','⚡');if(Math.random()<.5){e.cd=Math.max(e.cd||0,24);if(typeof e.k1==='number')e.k1=Math.max(e.k1,12)}}}
  if(T.pos>0){T.pos--;if(T.pos%60===0){var o=near2(e,260);if(o){dotX(o,atk()*.18,'#c070ff','👻');try{for(var i=0;i<5;i++)PT.push({x:o.x,y:40+Math.random()*50,vx:(Math.random()-.5)*4,vy:-Math.random()*3,l:22,c:'#d9a0ff'})}catch(x){}}}if(!T.pos)T.pb=0}}
var _step=step;
step=function(){_step.apply(this,arguments);if(vil||!started||over)return;E.forEach(tickX)};

/* ---------- hiệu ứng nhìn thấy trên địch ---------- */
function drawX(e){var T=e.stt;if(!T||!(T.bld>0||T.shk>0||T.pos>0))return;var m=MS[e.k]||e.fm;if(!m)return;
  var HH=m.h*BZ[e.b|0]*SZ*s,x=(e.x-cam)*s,gy=GY,tp=gy-HH,w=HH*.34,t=fr,i,u;
  g.save();g.globalCompositeOperation='lighter';
  if(T.bld>0)for(i=0;i<4;i++){u=(t*.03+i/4)%1;glowDraw(x+Math.sin(i*2.1)*w*.7,tp+HH*.3+u*HH*.6,(4+(i%2)*2)*s,'#ff2a4a',.9*(1-u))}
  if(T.pos>0){glowDraw(x,gy-HH*.55,HH*.6,'#8a40d0',.22);for(i=0;i<3;i++){u=(t*.02+i/3)%1;glowDraw(x+Math.sin(u*6+i)*w,gy-HH*.2-u*HH*.9,(6-u*3)*s,'#d9a0ff',.7*(1-u))}}
  if(T.shk>0){g.strokeStyle='#bff4ff';g.lineWidth=1.6*s;g.globalAlpha=.55+.45*Math.sin(t*.9);for(i=0;i<2;i++){var xx=x+(Math.random()-.5)*w*1.6,yy=tp+Math.random()*HH*.3;g.beginPath();g.moveTo(xx,yy);for(var k=0;k<4;k++){xx+=(Math.random()-.5)*w*.7;yy+=HH*.18;g.lineTo(xx,yy)}g.stroke()}}
  g.restore();
  var ic='';if(T.bld>0)ic+='🩸'+(T.bls>1?T.bls:'');if(T.shk>0)ic+='⚡';if(T.pos>0)ic+='👻';
  if(ic){g.save();g.globalAlpha=1;g.font=Math.round(10*s)+'px sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.fillText(ic,x,tp-36*s);g.restore()}}
var _foe=foe;foe=function(e){_foe(e);try{drawX(e)}catch(x){}};
window.YCFX={prof:PROF,apply:ap};
})();
