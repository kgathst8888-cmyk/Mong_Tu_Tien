/* ===== 🔮 ĐÚC LUYỆN HỒN PHÁCH + 🧘 BẾ QUAN ĐÀI =====
 * - Tab 🧘 Tu tiên trong túi: thêm mục "Hồn Phách" DƯỚI Tu vi + Linh căn (bọc window.lcUI). Tại đây CHỌN 1 trong 4 hồn phách
 *   (Phật Tôn · Yêu Hoàng · Tiên Đế · Minh Vương) — chọn xong KHÔNG thể đổi. Ảnh lấy từ assets/hon-phach-assets.js (HPA, tách từ ảnh 1).
 * - Thành Thị Linh Giới → cổng 4 "Bế Quan Đài" (vá LCT.gates[3], thay "Hư Không Truyền Tống"). Bản đồ nền = ảnh 2 (HPA.bg).
 *   Hồn phách đã chọn ngồi tu luyện giữa đài. Nhân vật PHẢI đi tới đài và chạm vào hồn phách mới mở bảng tu luyện (chạm từ xa → tự đi tới).
 * - Hồn phách có 9 cảnh giới (tên cảnh giới như RN: Sơ Khai … Hợp Thể, Đại Thừa). Lúc đầu CHỈ có hồn phách; đạt cảnh giới cuối (Đại Thừa)
 *   thì hiệu ứng phía sau xuất hiện (HPA.fx).
 * - Tu vi hồn phách = số HỒN PHÁCH đã nạp: quái thường rơi 1, Boss rơi 5 (nhặt tự bay vào túi hồn phách), nạp tại Bế Quan Đài. Mỗi CẢNH GIỚI +10% HP/sát thương/phòng thủ nhân vật (HONP.sm(), engine nhân vào atk/mx/df); tiểu cảnh không tăng.
 * - "Đúc thần thể" KHÔNG liên quan cảnh giới/tu vi (cập nhật sau); không còn chặn đột phá Hợp Thể → Đại Thừa.
 * - CÁCH TU LUYỆN: CHƯA CÓ (cập nhật sau). Đã chừa API: HONP.addXp(n) (tu vi hồn phách), HONP.forge(n) (đúc thần thể +n cấp),
 *   HONP.canBreak()/breakthrough(). Nút "Tu luyện"/"Đúc thần thể" trong bảng hiện báo "sẽ cập nhật sau".
 * Dữ liệu: PS[cur].hpc = {t:0..3 hồn phách, r:0..8 cảnh giới, x:tu vi đang có, b:cấp thần thể}.
 * Cảnh dựng theo mẫu Thành Thị Linh Giới (world/10): bọc vdraw/vstep, nút 🏘 quay về Thành Thị. Phụ thuộc: LCT.gates, lcUI, HPA, vdraw/vstep,
 * hero/drawEP/nameTag, g/W/H/s/GY/vw/cl/P/vt/vgo/gateGo/mvDir/fr/cam/c. Chỉnh số: khối CF. */
(function(){
'use strict';
if(typeof LCT==='undefined'||!LCT.gates||!LCT.gates[3]||typeof vdraw!=='function'||typeof vstep!=='function'||!window.HPA||typeof PS==='undefined')return;

var CF={
 theMax:10,                                    /* cấp tối đa của "Đúc thần thể" */
 need:[200,400,800,1600,3200,6400,12800,25600],   /* tu vi = số hồn phách đã nạp (1 quái thường = 1, 1 Boss = 5) */
 stat:.10,dropN:1,dropB:5,
 shardChance:.01,shardPer:10,pillPer:10      /* Mảnh Đúc Thần Thể: 1% mỗi Boss · 10 mảnh = 1 viên · 10 viên = đúc 1 cấp thần thể */, /* tu vi để đột phá từ cảnh giới r lên r+1 (8 lần đột phá) */
 gate:3,                                       /* chỉ số cổng trong LCT.gates (cổng 4) */
 breakNeedsBody:-1                              /* từ cảnh giới index 7 (Hợp Thể) lên 8 (Đại Thừa) cần thần thể tối đa */
};
var SOULS=[
 {n:'Phật Tôn',e:'☸️',c:'#ffd76a',d:'Kim thân bất hoại, từ bi mà uy nghiêm — pháp tướng ba đầu sáu tay hiện sau lưng.'},
 {n:'Yêu Hoàng',e:'🐉',c:'#b9a6ff',d:'Song long quấn thân, một con mắt đỏ nhìn thấu vạn yêu — vua của mọi loài.'},
 {n:'Tiên Đế',e:'⚡',c:'#fff3b0',d:'Bạch y thánh quang, lôi đình vây quanh — đế vương của chư tiên.'},
 {n:'Minh Vương',e:'👹',c:'#ff5a5a',d:'Huyết ảnh sáu tay trấn U Minh — chúa tể cõi âm.'}
];
var REALMS=(typeof RN!=='undefined'&&RN&&RN.length>=9)?RN.slice(0,9):['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';

/* ---------- ảnh ---------- */
var IM={bg:new Image(),fx:[],fig:[],card:[]};
IM.bg.src=HPA.bg;
for(var i=0;i<4;i++){var a=new Image(),b=new Image(),d=new Image();a.src=HPA.fx[i];b.src=HPA.fig[i];d.src=HPA.card[i];IM.fx.push(a);IM.fig.push(b);IM.card.push(d)}
function ok(im){return im&&im.complete&&im.naturalWidth>0}

/* ---------- dữ liệu ---------- */
function D(){var p=PS[cur];return p&&p.hpc&&typeof p.hpc==='object'?p.hpc:null}
function chosen(){var d=D();return d&&d.t>=0&&d.t<4?d:null}
function nf(n){return(Number(n)||0).toLocaleString('vi-VN')}
function need(r){return CF.need[r]||0}
function maxed(d){return d.r>=8}
function bodyMax(d){return(d.b|0)>=CF.theMax}
function save(){try{sv()}catch(e){}try{ui()}catch(e){}}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:150})}catch(e){}}
function choose(t){
  if(chosen()||t<0||t>3)return false;
  var o=D();
  if(o){o.t=t;o.ts=Date.now()}   /* sau Vé Reset: giữ nguyên r/x/b/bag/m/v */
  else PS[cur].hpc={t:t,r:0,x:0,b:0,bag:0,m:0,v:0,ts:Date.now()};
  save();say('🔮 Hồn phách '+SOULS[t].n+' đã nhập thể! Đến Bế Quan Đài để tu luyện','#d9b8ff');return true}
function addXp(n){var d=chosen();if(!d||maxed(d))return false;d.x=(d.x|0)+Math.max(0,n|0);save();return true}
function forge(n){var d=chosen();if(!d)return false;d.b=Math.min(CF.theMax,(d.b|0)+Math.max(0,(n===undefined?1:n)|0));save();return true}
/* chỉ số cộng thẳng vào nhân vật: mỗi CẢNH GIỚI +CF.stat (10%) HP / sát thương / phòng thủ (tiểu cảnh không tăng) */
function sm(){var d=chosen();return d?1+CF.stat*Math.min(8,d.r|0):1}
function statPct(){return Math.round((sm()-1)*100)}
/* hồn phách rơi: quái thường +dropN, Boss +dropB (nhặt vào túi hồn phách, rồi nạp tại Bế Quan Đài) */
/* Mảnh Đúc Thần Thể (rơi từ Boss) → ghép viên → đúc thần thể. Không liên quan cảnh giới/tu vi. */
function shard(n){var d=chosen();if(!d||!(n>0))return 0;d.m=(d.m|0)+n;return d.m}
function craft(){var d=chosen();if(!d)return false;if((d.m|0)<CF.shardPer){say('Cần '+CF.shardPer+' Mảnh Đúc Thần Thể để ghép 1 viên ('+(d.m|0)+'/'+CF.shardPer+')','#ff9a9a');return false}d.m-=CF.shardPer;d.v=(d.v|0)+1;save();say('💠 Ghép được 1 Viên Đúc Thần Thể ('+d.v+'/'+CF.pillPer+')','#ffb050');return true}
function anvil(){var d=chosen();if(!d)return false;if((d.b|0)>=CF.theMax){say('Thần thể đã đúc tới cấp tối đa','#ff9a9a');return false}if((d.v|0)<CF.pillPer){say('Cần '+CF.pillPer+' Viên Đúc Thần Thể ('+(d.v|0)+'/'+CF.pillPer+')','#ff9a9a');return false}d.v-=CF.pillPer;d.b=(d.b|0)+1;save();say('🔥 Đúc thần thể thành công: cấp '+d.b+'/'+CF.theMax,'#ffd76a');return true}
function collect(n){var d=chosen();if(!d||!(n>0))return 0;d.bag=(d.bag|0)+n;return d.bag}
function deposit(){var d=chosen(),n=d?(d.bag|0):0;if(!d)return 0;if(maxed(d)){say('Hồn phách đã đạt cảnh giới cuối','#ff9a9a');return 0}if(n<=0){say('Chưa có hồn phách để nạp — hạ quái để nhặt','#ff9a9a');return 0}d.x=(d.x|0)+n;d.bag=0;save();say('🔮 Nạp '+nf(n)+' hồn phách → tu vi +'+nf(n),SOULS[d.t].c);return n}
function canBreak(){
  var d=chosen();if(!d||maxed(d))return{ok:false,why:maxed(d||{r:0})?'Đã đạt cảnh giới cuối':'Chưa có hồn phách'};
  if((d.x|0)<need(d.r))return{ok:false,why:'Chưa đủ tu vi hồn phách ('+nf(d.x)+'/'+nf(need(d.r))+')'};
  if(d.r===CF.breakNeedsBody&&!bodyMax(d))return{ok:false,why:'Phải đúc thần thể tới cấp tối đa ('+(d.b|0)+'/'+CF.theMax+') mới đột phá lên '+REALMS[8]};
  return{ok:true}}
function breakthrough(){
  var c=canBreak(),d=chosen();if(!c.ok){say('⚠ '+c.why,'#ff9a9a');return false}
  d.x-=need(d.r);d.r++;save();
  say('✨ Hồn phách đột phá: '+REALMS[d.r]+' ('+(d.r+1)+'/9)'+(d.r===8?' — hiệu ứng hồn phách hiển lộ!':''),SOULS[d.t].c);return true}

/* ---------- Vé Reset Hồn Phách (mua ở Shop Linh Thạch, CSH 'rh'): đặt lại lượt chọn, giữ nguyên tiến độ ---------- */
function rhCnt(){try{return window.CSH&&CSH.count?CSH.count('rh')|0:0}catch(e){return 0}}
function resetTk(){
  var d=chosen();if(!d){say('Chưa chọn hồn phách','#ff9a9a');return false}
  if(rhCnt()<1){say('Cần 1 Vé Reset Hồn Phách (mua ở 🛒 Shop)','#ff9a9a');return false}
  var go=function(){
    var c=chosen();if(!c||!(window.CSH&&CSH.use&&CSH.use('rh')))return;
    c.t=-1;c.rs=(c.rs|0)+1;save();
    say('🔮 Đã reset lượt chọn hồn phách — hãy chọn lại','#d9b8ff');
    setTimeout(function(){try{pick()}catch(e){}},60)};
  var msg='Dùng 1 Vé Reset Hồn Phách để chọn lại?\nCảnh giới, tu vi, thần thể giữ nguyên. Chọn lại xong KHÔNG thể đổi tiếp (trừ khi dùng thêm vé).';
  if(typeof gcf==='function')gcf(msg,go);else if(confirm(msg))go();
  return true}
function resetBox(){var n=rhCnt();
  return '<div style="margin-top:6px">'+(n>0
    ?'<button onclick="HONP.resetTk()" style="width:100%;background:#3a2a5a;color:#fff;border:1px solid #b890ff;border-radius:8px;padding:7px;font-size:12.5px">🎫 Dùng Vé Reset Hồn Phách (có '+n+') — chọn lại</button>'
    :'<div style="font-size:11.5px;opacity:.7">🎫 Muốn chọn lại hồn phách: mua <b>Vé Reset Hồn Phách</b> ở 🛒 Shop (Linh Thạch).</div>')+'</div>'}

/* ---------- mục "Hồn Phách" trong tab Tu tiên (dưới Tu vi + Linh căn) ---------- */
function bar(p,c){return '<div style="height:9px;border:1px solid #8a7440;border-radius:6px;overflow:hidden;background:#1d1510;margin:3px 0"><div style="height:100%;width:'+Math.max(0,Math.min(100,p))+'%;background:'+c+'"></div></div>'}
function section(){
  var d=chosen(),h='<div style="border:1px solid #6a5a8a;border-radius:10px;padding:8px;margin:8px 0;background:#160f20"><div style="font-size:14px"><b>🔮 Hồn Phách</b></div>';
  if(!d){
    h+='<div style="font-size:12.5px;margin:4px 0;opacity:.9">'+(D()?'♻ Đã dùng Vé Reset — cảnh giới, tu vi, thần thể được giữ nguyên. ':'')+'Chưa có hồn phách. Chọn <b>1 trong 4</b>: Phật Tôn · Yêu Hoàng · Tiên Đế · Minh Vương. <span style="color:#ff9a9a">Chọn xong không thể thay đổi.</span></div>'+
       '<button onclick="HONP.pick()" style="width:100%;background:#5a3a8a;color:#fff;border:1px solid #b890ff;border-radius:8px;padding:8px">🔮 Chọn hồn phách</button>';
  }else{
    var S=SOULS[d.t],nd=need(d.r),pc=maxed(d)?100:nd?Math.floor((d.x|0)/nd*100):0;
    h+='<div style="display:flex;gap:8px;align-items:center;margin-top:4px"><img src="'+HPA.card[d.t]+'" style="width:96px;height:34px;object-fit:cover;border-radius:6px;border:1px solid '+S.c+'"><div style="flex:1;font-size:13px"><b style="color:'+S.c+'">'+S.e+' '+S.n+'</b><br>Cảnh giới <b>'+REALMS[d.r]+'</b> ('+(d.r+1)+'/9)</div></div>'+
       bar(pc,'linear-gradient(90deg,#6a3fb0,'+S.c+')')+'<div style="font-size:12px">Tu vi hồn phách: '+(maxed(d)?'viên mãn':nf(d.x)+' / '+nf(nd))+' · Đã nhặt: <b>'+nf(d.bag|0)+'</b> 🔮 · Thần thể: <b>'+(d.b|0)+'/'+CF.theMax+'</b> <span style="opacity:.75">· 🧩 '+(d.m|0)+' mảnh · 💠 '+(d.v|0)+' viên</span></div><div style="font-size:12px;margin-top:2px;color:#9fe0a0">Chỉ số nhân vật: +'+statPct()+'% HP / sát thương / phòng thủ (mỗi cảnh giới +'+Math.round(CF.stat*100)+'%)</div>'+
       '<div style="font-size:11.5px;opacity:.75;margin-top:4px">Đến <b>🧘 Bế Quan Đài</b> (cổng 4 · Thành Thị Linh Giới), chạm vào hồn phách để tu luyện. '+(d.r>=8?'Hiệu ứng hồn phách đã hiển lộ.':'Đạt '+REALMS[8]+' sẽ hiện hiệu ứng phía sau.')+'</div>'+(window.HONSK?HONSK.line():'');
  }
  return h+(d?resetBox():'')+'</div>'}
if(typeof window.lcUI==='function'){var _l=window.lcUI;window.lcUI=function(){var h=_l.apply(this,arguments);return(typeof h==='string')?h+section():h}}

/* ---------- bảng chọn hồn phách ---------- */
var pickSel=-1;
function pick(){
  if(chosen()){say('Hồn phách đã chọn, không thể thay đổi','#ff9a9a');return}
  pickSel=-1;var o=document.getElementById('hp-pick');if(!o){o=document.createElement('div');o.id='hp-pick';document.body.appendChild(stop(o))}
  renderPick(o);o.style.display='flex'}
function stop(o){['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){o.addEventListener(t,function(e){e.stopPropagation()})});return o}
function renderPick(o){
  o.style.cssText='position:fixed;inset:0;z-index:13;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);font-family:system-ui,sans-serif;color:#f2e3b3;padding:10px;box-sizing:border-box';
  var cards=SOULS.map(function(S,i){return '<div data-p="'+i+'" style="border:2px solid '+(pickSel===i?S.c:'#4a3a2a')+';border-radius:10px;overflow:hidden;margin:6px 0;background:#150f0c;'+(pickSel===i?'box-shadow:0 0 14px '+S.c:'')+'"><img src="'+HPA.card[i]+'" style="width:100%;display:block"><div style="padding:6px 10px"><b style="color:'+S.c+'">'+S.e+' '+S.n+'</b><div style="font-size:12px;opacity:.85">'+S.d+'</div></div></div>'}).join('');
  o.innerHTML='<div style="width:min(460px,100%);max-height:96%;display:flex;flex-direction:column;border:2px solid #b890ff;border-radius:14px;background:#120c1c"><div style="padding:10px 14px;border-bottom:1px solid #4a3a6a;font-weight:700">🔮 Chọn hồn phách <span style="font-weight:400;font-size:12px;color:#ff9a9a">(không thể thay đổi)</span></div><div style="flex:1;overflow-y:auto;padding:4px 12px">'+cards+'</div><div style="display:flex;gap:8px;padding:10px 12px;border-top:1px solid #4a3a6a"><button data-a="x" style="flex:1;padding:10px;border:0;border-radius:9px;background:#3a3a3a;color:#fff">Đóng</button><button data-a="ok" style="flex:2;padding:10px;border:0;border-radius:9px;background:'+(pickSel>=0?'#5a3a8a':'#333')+';color:#fff;font-weight:700"'+(pickSel>=0?'':' disabled')+'>'+(pickSel>=0?'Chọn '+SOULS[pickSel].n:'Chạm để chọn một hồn phách')+'</button></div></div>';
  o.onclick=function(e){
    var a=e.target.closest&&e.target.closest('[data-a]'),p=e.target.closest&&e.target.closest('[data-p]');
    if(p){pickSel=+p.dataset.p;renderPick(o);return}
    if(!a){if(e.target===o)o.style.display='none';return}
    if(a.dataset.a==='x'){o.style.display='none';return}
    if(a.dataset.a==='ok'&&pickSel>=0){
      var go=function(){if(choose(pickSel))o.style.display='none'};
      var msg='Chọn hồn phách '+SOULS[pickSel].n+'?\nSau khi chọn KHÔNG thể thay đổi.';
      if(typeof gcf==='function')gcf(msg,go);else if(confirm(msg))go();
    }}}

/* ---------- Bế Quan Đài (cảnh) ---------- */
var on=false,pend=false,ov=null;
function sx(){return W/2}
function soulWX(){return sx()/s}
function geom(){var im=IM.bg,gy=GY;
  if(!ok(im))return null;
  var sc=Math.max(W/im.naturalWidth,H/im.naturalHeight),iw=im.naturalWidth*sc,ih=im.naturalHeight*sc,ox=(W-iw)/2,oy=Math.min(0,Math.max(H-ih,gy-.66*ih));
  return{iw:iw,ih:ih,ox:ox,oy:oy}}
function figH(){return Math.min(H*.26,215*s)}
function drawSoul(t){
  var d=chosen(),gy=GY,x=sx(),hh=figH(),feet=gy-2*s;
  if(!d){                                      /* chưa có hồn phách: vòng sáng trống trên đài */
    g.save();g.strokeStyle='rgba(190,160,255,'+(.4+.2*Math.sin(t*.06))+')';g.lineWidth=2;g.beginPath();g.ellipse(x,feet-8*s,70*s,18*s,0,0,6.283);g.stroke();
    g.font='bold '+Math.max(12,13*s)+'px '+FONT;g.textAlign='center';g.fillStyle='#e8d8ff';g.strokeStyle='#000b';g.lineWidth=3;
    var tx='Chưa có hồn phách · chọn trong Túi → 🧘 Tu tiên';g.strokeText(tx,x,feet-hh*.45);g.fillText(tx,x,feet-hh*.45);g.restore();return}
  var S=SOULS[d.t],breath=1+.012*Math.sin(t*.045),r9=d.r>=8,glow=.12+.28*(d.r/8);
  g.save();g.globalCompositeOperation='lighter';
  var q=g.createRadialGradient(x,feet-hh*.5,2,x,feet-hh*.5,hh*(r9?1.1:.8));q.addColorStop(0,S.c+(r9?'66':'33'));q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=glow+.1*Math.sin(t*.05);g.fillStyle=q;g.beginPath();g.arc(x,feet-hh*.5,hh*(r9?1.1:.8),0,6.283);g.fill();g.restore();
  /* bóng đổ mềm dưới hồn phách + vòng ấn xoay trên mặt đài (nhiều vòng hơn khi cảnh giới cao) */
  g.save();g.translate(x,feet);g.scale(1,.2);var sg=g.createRadialGradient(0,0,2,0,0,hh*.62);sg.addColorStop(0,'rgba(18,28,22,.42)');sg.addColorStop(1,'rgba(18,28,22,0)');g.fillStyle=sg;g.beginPath();g.arc(0,0,hh*.62,0,6.283);g.fill();g.restore();
  g.save();g.translate(x,feet-2*s);g.scale(1,.2);g.lineCap='round';
  for(var rg=0;rg<1+(d.r>=3?1:0)+(d.r>=6?1:0);rg++){g.setLineDash([9*s,13*s]);g.lineDashOffset=(rg%2?1:-1)*t*.45;g.strokeStyle=S.c;g.globalAlpha=.30+.12*Math.sin(t*.04+rg);g.lineWidth=(2.4-rg*.4)*s;g.beginPath();g.arc(0,0,(hh*.52+rg*hh*.16),0,6.283);g.stroke()}
  g.restore();
  var M=HPA.meta&&HPA.meta[d.t],fxi=IM.fx[d.t],f=IM.fig[d.t],Hp=hh/.72,Wp=ok(fxi)?Hp*fxi.naturalWidth/fxi.naturalHeight:Hp*2.8,topY=feet-hh;
  g.save();g.translate(x,feet);g.scale(breath,breath);g.translate(-x,-feet);
  if(M){
    var pt=feet-M.y1*Hp;topY=pt+M.y0*Hp;
    if(r9&&ok(fxi)){g.save();g.globalAlpha=.84+.12*Math.sin(t*.04);g.drawImage(fxi,x-Wp/2,pt,Wp,Hp);g.restore()}   /* cảnh giới cuối: hiệu ứng phía sau hiển lộ */
    if(ok(f)){g.save();g.globalAlpha=.97;g.shadowColor=S.c;g.shadowBlur=14*s;g.drawImage(f,x-Wp/2+M.x0*Wp,topY,(M.x1-M.x0)*Wp,(M.y1-M.y0)*Hp);g.restore()}
  }else if(ok(f)){var fw2=hh*f.naturalWidth/f.naturalHeight;g.save();g.shadowColor=S.c;g.shadowBlur=14*s;g.drawImage(f,x-fw2/2,feet-hh,fw2,hh);g.restore()}
  g.restore();
  /* tia sáng nhỏ bay lên quanh hồn phách */
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=S.c;
  for(var k=0;k<12;k++){var ph=((t*.010)+k/12)%1,px_=x+Math.sin(k*7.3+t*.012)*hh*(.18+.30*((k*37)%10)/10),py_=feet-hh*.15-ph*hh*1.05;g.globalAlpha=Math.sin(ph*3.1416)*(r9?.8:.55);g.beginPath();g.arc(px_,py_,(1.2+((k*13)%3)*.7)*s,0,6.283);g.fill()}
  g.restore();
  /* nhãn: viên mờ + viền theo màu hồn phách */
  g.save();var nm=S.e+' '+S.n+' · '+REALMS[d.r]+' ('+(d.r+1)+'/9)',ly=Math.min(topY,feet-hh*.55)-12*s,fs=Math.max(11,12.5*s);g.font='bold '+fs+'px '+FONT;g.textAlign='center';
  var tw=g.measureText(nm).width+22*s,th=fs+10*s;g.fillStyle='rgba(18,10,30,.66)';g.strokeStyle=S.c;g.lineWidth=1.2*s;g.beginPath();
  if(g.roundRect)g.roundRect(x-tw/2,ly-th*.72,tw,th,th/2);else g.rect(x-tw/2,ly-th*.72,tw,th);g.fill();g.stroke();
  g.fillStyle=S.c;g.fillText(nm,x,ly+fs*.22);
  if(Math.abs(P.x-soulWX())<260){g.font=Math.max(10,10.5*s)+'px '+FONT;g.fillStyle='rgba(255,255,255,.9)';g.globalAlpha=.65+.3*Math.sin(t*.08);g.fillText('▾ chạm để tu luyện',x,ly+th*.95)}
  g.restore()}
function draw(){
  var t=fr,gy=GY,gm=geom();
  if(gm)g.drawImage(IM.bg,gm.ox,gm.oy,gm.iw,gm.ih);else{g.fillStyle='#9fb9c8';g.fillRect(0,0,W,H)}
  /* mây trôi nhẹ */
  g.save();for(var i=0;i<6;i++){var x=((i*181+t*(.12+(i%3)*.06))%(W+280))-140,y=gy+(40+(i%3)*16)*s+(H-gy)*.1*(i%2),w=(130+(i%4)*40)*s;g.fillStyle='rgba(255,255,255,'+(.35+.1*(i%3))+')';g.beginPath();g.ellipse(x,y,w*.5,15*s,0,0,6.283);g.ellipse(x-w*.28,y+4*s,w*.3,11*s,0,0,6.283);g.ellipse(x+w*.3,y+5*s,w*.32,10*s,0,0,6.283);g.fill()}g.restore();
  drawSoul(t);
  if(vt!=null){var a=(t%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s,(10+a*22)*s,(4+a*8)*s,0,0,6.28);g.stroke()}
  try{drawEP();hero();nameTag()}catch(e){}
  var tx=PORT?'Chạm hồn phách để tu luyện':'Chạm hồn phách để tu luyện · nút 🏘 để về Thành Thị',ty=gy+(H-gy)*.55;
  g.save();g.font='bold '+Math.max(12,14*s)+'px '+FONT;g.textAlign='center';var tw=g.measureText(tx).width;g.fillStyle='#000b';g.fillRect(W/2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#ffe9a0';g.fillText(tx,W/2,ty);g.restore()}

function enter(){
  if(!started||!vil)return;
  try{LCT.off()}catch(e){}
  on=true;pend=false;vt=null;vgo=-1;gateGo=0;try{twGoF=0}catch(e){}
  if(bo)tg();cam=0;P.atk=0;P.pe=null;P.x=cl(vw()*.12,40,vw()-40);P.hp=mx();P.mp=mm();
  say('🧘 Đến Bế Quan Đài','#c8f0d8')}
function leave(){
  on=false;pend=false;closePanel();vt=null;vgo=-1;gateGo=0;
  try{LCT.enter()}catch(e){}
  try{if(DT.length&&/Đến Thành Thị Linh Giới/.test(DT[DT.length-1].s||''))DT.pop()}catch(e){}
  say('🌀 Về Thành Thị Linh Giới','#8fe8ff')}
function off(){on=false;pend=false;closePanel()}

/* chạm: hồn phách (tự đi tới) hoặc di chuyển */
function hitSoul(px,py){
  var x=sx(),hh=figH(),feet=GY-2*s;if(!chosen())return Math.abs(px-x)<90*s&&py>feet-hh&&py<feet+30*s;
  return Math.abs(px-x)<hh*.9&&py>feet-hh*1.1&&py<feet+30*s}
document.addEventListener('pointerdown',function(e){
  if(!on||e.target!==c||!vil||bo||!started)return;
  e.stopImmediatePropagation();e.stopPropagation();
  var px=e.offsetX,py=e.offsetY;
  if(hitSoul(px,py)){
    if(!chosen()){say('Chưa có hồn phách — chọn trong Túi → 🧘 Tu tiên','#e8d8ff');return}
    var wx=soulWX();
    if(Math.abs(P.x-wx)<130){pend=false;vt=null;openPanel();return}
    pend=true;vt=cl(wx+(P.x<wx?-90:90),40,vw()-40);vgo=-1;return}
  pend=false;vt=cl(px/s,40,vw()-40);vgo=-1},true);

/* ---------- bảng tu luyện (chỉ mở được tại Bế Quan Đài) ---------- */
function openPanel(){
  if(!on||!chosen())return;
  if(!ov){ov=document.createElement('div');ov.id='hp-ov';document.body.appendChild(stop(ov))}
  renderPanel();ov.style.display='flex'}
function closePanel(){if(ov)ov.style.display='none'}
function later(){say('🧘 Cách tu luyện hồn phách sẽ được cập nhật sau','#e0b0ff');renderPanel()}
function renderPanel(){
  var d=chosen();if(!d||!ov)return;
  var S=SOULS[d.t],nd=need(d.r),pc=maxed(d)?100:nd?Math.floor((d.x|0)/nd*100):0,cb=canBreak();
  var chips=REALMS.map(function(n,i){return '<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:10px;font-size:11.5px;border:1px solid '+(i===d.r?S.c:'#4a3a2a')+';background:'+(i<d.r?'#3a2a50':i===d.r?'#5a3a8a':'#1a1210')+';color:'+(i<=d.r?'#fff':'#8a7a6a')+'">'+(i+1)+'. '+n+'</span>'}).join('');
  ov.style.cssText='position:fixed;inset:0;z-index:13;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.8);font-family:system-ui,sans-serif;color:#f2e3b3;padding:10px;box-sizing:border-box';
  ov.innerHTML='<div style="width:min(460px,100%);max-height:96%;overflow-y:auto;border:2px solid '+S.c+';border-radius:14px;background:#120c1c;padding:12px 14px">'+
   '<div style="display:flex;align-items:center;margin-bottom:6px"><b style="flex:1;font-size:16px;color:'+S.c+'">'+S.e+' '+S.n+' · Luyện hồn phách</b><button data-a="x" style="background:none;border:0;color:#f2e3b3;font-size:20px">✕</button></div>'+
   '<img src="'+HPA.card[d.t]+'" style="width:100%;border-radius:8px;border:1px solid '+S.c+'">'+
   '<div style="margin:8px 0 2px;font-size:14px">Cảnh giới: <b style="color:'+S.c+'">'+REALMS[d.r]+'</b> ('+(d.r+1)+'/9)</div>'+chips+
   '<div style="margin-top:8px;font-size:13px">Tu vi hồn phách: <b>'+(maxed(d)?'viên mãn':nf(d.x)+' / '+nf(nd))+'</b></div>'+bar(pc,'linear-gradient(90deg,#6a3fb0,'+S.c+')')+
   '<div style="border:1px solid #b8641e;border-radius:9px;padding:8px;margin:6px 0;background:#201008"><div style="font-size:13.5px">🔥 <b>Đúc thần thể</b>: cấp <b>'+(d.b|0)+' / '+CF.theMax+'</b></div>'+bar((d.b|0)/CF.theMax*100,'linear-gradient(90deg,#b8641e,#ffd76a)')+'<div style="font-size:12.5px">🧩 Mảnh: <b>'+(d.m|0)+'</b> <span style="opacity:.7">(cần '+CF.shardPer+' ghép 1 viên)</span><br>💠 Viên: <b>'+(d.v|0)+'</b> <span style="opacity:.7">(cần '+CF.pillPer+' viên đúc 1 cấp)</span></div>'+'<div style="display:flex;gap:6px;margin-top:6px"><button data-a="cr" style="flex:1;padding:9px;border:0;border-radius:9px;background:#5a3a1a;color:#fff;opacity:'+((d.m|0)>=CF.shardPer?1:.5)+'">🧩 Ghép viên</button><button data-a="an" style="flex:1;padding:9px;border:0;border-radius:9px;background:#8a4a14;color:#fff;opacity:'+((d.v|0)>=CF.pillPer&&(d.b|0)<CF.theMax?1:.5)+'">🔥 Đúc thần thể</button></div>'+'<div style="font-size:11.5px;opacity:.65;margin-top:4px">Mảnh Đúc Thần Thể rơi '+Math.round(CF.shardChance*100)+'% từ mọi Boss. Hiệu lực thần thể: cập nhật sau.</div></div>'+
   '<div style="font-size:12px;opacity:.8;margin:2px 0 8px">Hạ quái nhặt <b>hồn phách</b> (quái thường 1, Boss 5), nạp tại đây để tăng tu vi. Mỗi <b>cảnh giới</b> +'+Math.round(CF.stat*100)+'% HP / sát thương / phòng thủ cho nhân vật (hiện +'+statPct()+'%), tiểu cảnh không tăng. Đạt <b>'+REALMS[8]+'</b> sẽ hiện hiệu ứng phía sau hồn phách. Đúc thần thể <b>không liên quan</b> cảnh giới/tu vi (hiệu lực: cập nhật sau).</div>'+
   (window.HONSK?HONSK.info():'')+'<div style="display:flex;gap:6px"><button data-a="dp" style="flex:1;padding:10px;border:0;border-radius:9px;background:#3a2a50;color:#fff">🔮 Nạp hồn phách ('+nf(d.bag|0)+')</button></div>'+
   '<button data-a="bt" style="width:100%;margin-top:6px;padding:10px;border:0;border-radius:9px;background:'+(cb.ok?'#7a4ad0':'#333')+';color:#fff;font-weight:700;opacity:'+(cb.ok?1:.6)+'">⚡ Đột phá cảnh giới'+(cb.ok?'':' — '+cb.why)+'</button>'+
   '<div style="font-size:11.5px;opacity:.65;margin-top:6px;text-align:center">Tu vi cần để đột phá cảnh giới: '+nf(nd)+' · Hiệu lực thần thể: cập nhật sau</div></div>';
  ov.onclick=function(e){var a=e.target.closest&&e.target.closest('[data-a]');if(!a){if(e.target===ov)closePanel();return}
    var k=a.dataset.a;if(k==='x')closePanel();else if(k==='dp'){deposit();renderPanel()}else if(k==='cr'){craft();renderPanel()}else if(k==='an'){anvil();renderPanel()}else if(k==='bt'){if(breakthrough())renderPanel();else renderPanel()}}}

/* ---------- móc vào cảnh làng (cùng mẫu Thành Thị Linh Giới) ---------- */
var _vd=vdraw;vdraw=function(){if(on){draw();return}_vd()};
var _vs=vstep;vstep=function(){
  if(on){vgo=-1;gateGo=0;try{twGoF=0}catch(e){}}
  _vs();
  if(on&&pend){if(typeof mvDir!=='undefined'&&mvDir)pend=false;else if(vt==null){pend=false;if(Math.abs(P.x-soulWX())<150)openPanel()}}};
if(typeof ng==='function'){var _ng=ng;ng=function(){off();_ng()}}
var vlb=document.getElementById('vl');
if(vlb){var _vl=vlb.onpointerdown;vlb.onpointerdown=function(e){if(on){e.stopPropagation();if(started)leave();return}if(_vl)_vl.call(this,e)}}

/* ---------- cổng 4 trong Thành Thị Linh Giới ---------- */
var G=LCT.gates[CF.gate];
G.sn='Bế Quan';G.n='Bế Quan Đài';G.e='🧘';G.c='#9fe0c0';G.rgb='150,230,190';G.open=1;G.go=enter;
Object.defineProperty(G,'sub',{configurable:true,enumerable:true,set:function(){},get:function(){try{var d=chosen();return d?SOULS[d.t].n+' · '+REALMS[d.r]+' · chạm để vào':'Chọn hồn phách trong Túi → Tu tiên'}catch(e){return'Hồn phách · chạm để vào'}}});

window.HONP={resetTk:resetTk,shard:shard,craft:craft,anvil:anvil,sm:sm,statPct:statPct,collect:collect,deposit:deposit,cfg:CF,souls:SOULS,get:D,chosen:chosen,choose:choose,pick:pick,addXp:addXp,forge:forge,canBreak:canBreak,breakthrough:breakthrough,enter:enter,leave:leave,on:function(){return on},open:openPanel,realms:REALMS};
})();
