/* ===== 🕳 PHỤ BẢN: BẢNG CHỌN + PHỤ BẢN 2 "ĐỊA LONG ĐIỆN" =====
 * Nút 🕳 Phụ bản (bên phải màn hình) giờ mở BẢNG CHỌN PHỤ BẢN thay vì vào thẳng Hầm Ngục:
 *   Phụ bản 1 · Hầm Ngục (cũ, không đổi cơ chế: mở mỗi 5 phút theo đồng hồ chung, dgEnter của engine)
 *   Phụ bản 2 · Địa Long Điện (mới): cần cấp 80 · mỗi nhân vật vào lại sau 10 phút (tính từ lúc VÀO, lưu PS[cur].dg2.cd) · 20 quái + Boss "Ngục Long Vương"
 * Boss Phụ Bản 2 = Trùm Hầm Ngục: máu ×5, sát thương ×5 (CF.hp/CF.atk), thủ ×2 (thủ chia sát thương người chơi nên không nhân ×5); quái thường máu/sát thương ×2.
 *   Chiêu riêng: Long Tức (luồng khí quét ngang, báo trước) · dưới 50% máu thêm Địa Long Chấn (3 trụ phun lên quanh người chơi).
 *   Hình: DGI.boss2 (world/39-dg-boss-art.js), cỡ lớn hơn (e.big), hào quang xanh ngọc (e.gc) — engine đọc e.big / e.gc / e.nm.
 * Phần thưởng: như Hầm Ngục (vàng, mảnh chế tạo, trang bị, mảnh cánh, đá cường hóa...) + 2–5 Mảnh Đan Đột Phá Cảnh Giới 4 Thần Thú mỗi lần hạ Boss (CF.fragRate = tỉ lệ rơi).
 * Đủ CF.need (100) mảnh → bấm Ghép trong bảng Phụ Bản để thành 1 Đan. Đan được Thú nuôi dùng khi tiến hoá cấp 3 → cấp 4 (engine đã chặn thú k==2; module này chặn thêm 3 thú còn lại;
 *   hiện tiến hoá cấp 4 vẫn bị khoá bởi ui/26-pet-evo4-lock.js — khi gỡ khoá, Đan tự bị trừ lúc tiến hoá thành công).
 * Dữ liệu: PS[cur].dg2 = {f: mảnh, cd: mốc ms được vào lại}; Đan = PS[cur].dan (dùng chung "Thức Tỉnh Đan" có sẵn của engine). Chỉnh độ khó/phần thưởng: khối CF.
 * Phụ thuộc: dgEnter/dgExit/dgSp/dgHurt/dgAI/dgHud/dgBtn/dgTick/drop/dgb/gcf (engine), pet/pev/petUI (pets), LCT, DGI.boss2 (39). */
(function(){
'use strict';
if(typeof dgEnter!=='function'||typeof dgSp!=='function'||typeof dgHurt!=='function'||typeof dgAI!=='function'||typeof dgb==='undefined'||typeof PS==='undefined')return;
var CF={lv:80,cd:600000,hp:5,atk:5,def:2,mhp:2,matk:2,need:100,fmin:2,fmax:5,fragRate:1};

/* ---------- dữ liệu ---------- */
function SD(){var p=PS[cur];if(!p)return{f:0,d:0,cd:0};if(!p.dg2||typeof p.dg2!=='object')p.dg2={f:0,d:0,cd:0};return p.dg2}
function left(){var s=SD(),n=Date.now(),c=+s.cd||0;if(c>n+CF.cd){c=n+CF.cd;s.cd=c}return Math.max(0,c-n)}
function fmt(ms){var t=Math.ceil(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function save(){try{sv()}catch(e){}}
function lvOk(){return P.lv>=CF.lv}
function ready2(){return started&&!dg&&lvOk()&&left()<=0}
function d1Left(){try{return Math.ceil((SLOT-Date.now()%SLOT)/1e3)}catch(e){return 0}}

/* ---------- bảng chọn phụ bản ---------- */
var ov=null;
function note(t){var m=document.getElementById('pb-msg');if(m&&ov&&ov.style.display!=='none'){m.textContent=t}else{try{DT.push({x:P.x,y:190,s:t,c:'#ffd98a',l:90})}catch(e){}}}
function card(id,col,ico,title,lines){return'<div data-go="'+id+'" style="display:flex;gap:10px;align-items:center;border:2px solid '+col+';border-radius:12px;padding:9px;margin:7px 0;background:#140d0a;cursor:pointer"><div style="font-size:30px;width:38px;text-align:center">'+ico+'</div><div style="flex:1"><b style="color:'+col+'">'+title+'</b><div style="font-size:12.5px;opacity:.85;margin-top:2px">'+lines+'</div><div id="pb-st'+id+'" style="font-size:13px;margin-top:4px;font-weight:bold"></div></div></div>'}
function html(){
  return'<h2 style="margin:0 0 6px;color:#ffe27a;font-size:19px">🕳 Phụ Bản</h2><div style="font-size:12.5px;opacity:.85;margin-bottom:4px">Chạm vào phụ bản để vào.</div>'
   +card(1,'#ff9a70','🕳','1. Hầm Ngục','20 quái + Trùm Thần Thoại · mở mỗi 5 phút · rơi trang bị, mảnh cánh')
   +card(2,'#7dffc0','🐉','2. Địa Long Điện','Cần cấp '+CF.lv+' · 20 quái + Boss <b>Ngục Long Vương</b> (mạnh gấp '+CF.hp+' lần Trùm Hầm Ngục) · vào lại sau '+Math.round(CF.cd/60000)+' phút · rơi trang bị + <b>Mảnh Đan Đột Phá Cảnh Giới 4 Thần Thú</b> ('+CF.fmin+'–'+CF.fmax+' mảnh/lần)')
   +'<div style="border:1px solid #6a5a3a;border-radius:10px;padding:8px;margin:8px 0;background:#1a120d"><div style="font-size:13.5px">💊 <b>Đan Đột Phá Cảnh Giới 4 Thần Thú</b> · đang có: <b id="pb-d">0</b></div><div style="margin-top:5px;height:9px;background:#000a;border-radius:5px;overflow:hidden"><div id="pb-bar" style="height:100%;width:0;background:linear-gradient(90deg,#16c46a,#7dffc0)"></div></div><div style="font-size:12.5px;margin-top:4px">Mảnh: <b id="pb-f">0</b>/'+CF.need+'</div><button data-comb="1" style="width:100%;margin-top:6px;background:#5a3a22;color:#fff;border:1px solid #b8964e;border-radius:8px;padding:8px">⚒ Ghép Đan ('+CF.need+' mảnh)</button><div style="font-size:11.5px;opacity:.7;margin-top:4px">Đan dùng cho Thú nuôi khi tiến hoá cấp 3 → cấp 4.</div></div>'
   +'<div id="pb-msg" style="min-height:18px;font-size:13px;color:#ffd98a;text-align:center"></div>'
   +'<button data-x="1" style="width:100%;margin-top:6px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button>'}
function refresh(){if(!ov||ov.style.display==='none')return;
  var a=document.getElementById('pb-st1'),b=document.getElementById('pb-st2');
  try{if(a){var o=dgOpen();a.textContent=o?'✅ Đang mở · chạm để vào':'⏳ Mở sau '+fmt(d1Left()*1000);a.style.color=o?'#9dffa0':'#ffd98a'}}catch(e){}
  if(b){if(!lvOk()){b.textContent='🔒 Cần cấp '+CF.lv+' (hiện Lv'+P.lv+')';b.style.color='#ff9a9a'}else if(left()>0){b.textContent='⏳ Vào lại sau '+fmt(left());b.style.color='#ffd98a'}else{b.textContent='✅ Sẵn sàng · chạm để vào';b.style.color='#9dffa0'}}
  var s=SD(),f=s.f|0,df=document.getElementById('pb-f'),dd=document.getElementById('pb-d'),br=document.getElementById('pb-bar');
  if(df)df.textContent=f;if(dd)dd.textContent=PS[cur].dan|0;if(br)br.style.width=Math.min(100,f/CF.need*100)+'%'}
function open(){if(!started)return;
  if(!ov){ov=document.createElement('div');ov.id='pb-ov';ov.style.cssText='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3';
    ['pointerdown','touchstart','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
    ov.addEventListener('click',function(e){var t=e.target,c=t.closest&&t.closest('[data-comb]');if(c){combine();return}c=t.closest&&t.closest('[data-go]');if(c){go(+c.dataset.go);return}if(t===ov||(t.closest&&t.closest('[data-x]')))close()});
    document.body.appendChild(ov)}
  ov.innerHTML='<div style="max-width:440px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px">'+html()+'</div>';
  ov.style.display='flex';refresh()}
function close(){if(ov)ov.style.display='none'}
setInterval(refresh,1000);

/* ---------- vào phụ bản ---------- */
function go(i){
  if(!started||dg)return;
  if(i===1){if(!dgOpen()){note('Hầm Ngục chưa mở, chờ đếm ngược');return}close();dgEnter();return}
  if(over)return;
  if(!lvOk()){note('🔒 Cần cấp '+CF.lv+' để vào Địa Long Điện (hiện Lv'+P.lv+')');return}
  if(left()>0){note('⏳ Địa Long Điện hồi chiêu '+fmt(left()));return}
  SD().cd=Date.now()+CF.cd;save();close();
  bo=0;bag.style.display='none';vil=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:0,kill:0,d2:1};
  try{if(LCT.on())LCT.off()}catch(e){}
  DT.push({x:P.x,y:200,s:'🐉 Vào Địa Long Điện: 20 quái + Ngục Long Vương!',c:'#7dffc0',g:1,l:150})}
function combine(){var s=SD();if((s.f|0)<CF.need){note('Chưa đủ '+CF.need+' mảnh ('+(s.f|0)+'/'+CF.need+')');return}
  s.f-=CF.need;PS[cur].dan=(PS[cur].dan|0)+1;save();note('✨ Ghép thành công 1 Đan Đột Phá Cảnh Giới 4 Thần Thú!');refresh()}

/* nút 🕳: chưa ở trong phụ bản → mở bảng chọn; đang ở trong → giữ hành vi cũ (Phụ Bản 2 có câu hỏi riêng) */
var _dp=dgb.onpointerdown;
dgb.onpointerdown=function(ev){
  if(!started)return _dp.call(this,ev);
  if(dg&&dg.d2){ev.stopPropagation();gcf('Rời Địa Long Điện? Lượt này sẽ mất (hồi chiêu '+Math.round(CF.cd/60000)+' phút vẫn tính).',dgExit);return}
  if(dg)return _dp.call(this,ev);
  ev.stopPropagation();open()};
var _btn=dgBtn;dgBtn=function(){_btn.apply(this,arguments);try{if(!dg&&started&&ready2()&&!dgOpen()){dgb.className='sb dgo';dgb.innerHTML='🕳<small>Phụ bản</small>'}}catch(e){}};

/* ---------- chỉ số ---------- */
var _sp=dgSp;dgSp=function(k){_sp.apply(this,arguments);
  try{if(!dg||!dg.d2)return;var e=E[E.length-1];if(!e||!e.dg)return;
    if(k=='boss'){e.d2=1;e.hp=e.max=e.hp*CF.hp;e.df*=CF.def;e.big=290;e.hh=250;e.nm='🐉 Ngục Long Vương';e.gc=['#0a8a5a','#7dffc0'];if(typeof DGI!=='undefined'&&DGI.boss2)e.sp='boss2'}
    else{e.d2=1;e.hp=e.max=e.hp*CF.mhp}}catch(x){}};
var _h=dgHurt;dgHurt=function(e,mu){return _h.call(this,e,e&&e.d2?mu*(e.k=='boss'?CF.atk:CF.matk):mu)};

/* ---------- chiêu: Long Tức / Địa Long Chấn ---------- */
var _ai=dgAI;dgAI=function(e){_ai.apply(this,arguments);if(!e||!e.d2||e.k!='boss'||e.in>0)return;
  e.lc=(e.lc|0)+1;var en=e.hp<e.max*.5;
  if(!e.lw&&e.lc>=(en?300:450)){e.lc=0;e.lw=60;e.ln=(e.ln|0)+1;e.lt=(en&&e.ln%2===0)?1:0;
    if(e.lt){e.lxs=[P.x-210,P.x,P.x+210];DT.push({x:e.x,y:250,s:'🐉 Địa Long Chấn!',c:'#7dffc0',g:1,l:70});
      e.lxs.forEach(function(wx){FX.push({x:wx,l:60,m:60,fn:function(f,p,X,gy){g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);g.fillStyle='rgba(60,255,160,'+(.1+.3*p)+')';g.strokeStyle='#7dffc0';g.lineWidth=6;g.beginPath();g.arc(0,0,120,0,6.283);g.fill();g.stroke();g.restore()}})})}
    else{e.ldr=Math.sign(P.x-e.x)||1;e.lbx=e.x;DT.push({x:e.x,y:250,s:'🐉 Long Tức!',c:'#7dffc0',g:1,l:70});var dr=e.ldr;
      FX.push({x:e.lbx,l:60,m:60,fn:function(f,p,X,gy){var x0=dr>0?X:X-600*s;g.save();g.globalAlpha=.3+.25*Math.sin(p*20);g.fillStyle='rgba(60,255,160,.35)';g.fillRect(x0,gy-70*s,600*s,74*s);g.globalAlpha=.8;g.strokeStyle='rgba(190,255,225,.8)';g.lineWidth=2;g.strokeRect(x0,gy-70*s,600*s,74*s);g.restore()}})}}
  if(e.lw>0&&--e.lw===0){
    if(e.lt){e.lxs.forEach(function(wx){FX.push({x:wx,l:24,m:24,fn:function(f,p,X,gy){g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(0,gy-420*s,0,gy);q.addColorStop(0,'rgba(60,220,140,0)');q.addColorStop(1,'rgba(220,255,240,'+(1-p)+')');g.fillStyle=q;g.fillRect(X-65*s*(1-p*.4),gy-420*s,130*s*(1-p*.4),420*s);g.restore()}})});
      dgFl=6;if(e.lxs.some(function(wx){return Math.abs(P.x-wx)<115}))dgHurt(e,1.1)}
    else{var d2=e.ldr,bx=e.lbx;FX.push({x:bx,l:26,m:26,fn:function(f,p,X,gy){var x0=d2>0?X:X-600*s;g.save();g.globalCompositeOperation='lighter';var q=g.createLinearGradient(X,0,X+d2*600*s,0);q.addColorStop(0,'rgba(235,255,245,'+(1-p)+')');q.addColorStop(1,'rgba(40,220,130,0)');g.fillStyle=q;g.fillRect(x0,gy-64*s,600*s,66*s);g.restore()}});
      dgFl=6;if((P.x-bx)*d2>0&&Math.abs(P.x-bx)<600&&(P.y||0)<80)dgHurt(e,1.3)}}};

/* ---------- HUD, thông báo, nền ---------- */
var _hud=dgHud;dgHud=function(){_hud.apply(this,arguments);try{if(dg&&dg.d2&&dgh.innerHTML)dgh.innerHTML=dgh.innerHTML.replace('🕳 Hầm Ngục','🕳 Địa Long Điện').replace('👹 Trùm Thần Thoại','🐉 Ngục Long Vương')}catch(e){}};
var _tk=dgTick;dgTick=function(){_tk.apply(this,arguments);try{if(dg&&dg.d2&&dg.bs&&!dg.nb){var l=DT[DT.length-1];if(l&&/Trùm Thần Thoại xuất hiện/.test(l.s||'')){l.s='🐉 Ngục Long Vương xuất hiện!';l.c='#7dffc0';dg.nb=1}}}catch(e){}};
var _bg=bgd;bgd=function(gy){if(dg&&dg.d2){xbg(gy,3);g.save();g.fillStyle='rgba(0,45,30,.4)';g.fillRect(0,0,W,H);g.restore()}else _bg.apply(this,arguments)};

/* ---------- rơi mảnh Đan ---------- */
var _drop=drop;drop=function(e){var r=_drop.apply(this,arguments);
  try{if(e&&e.d2&&e.k=='boss'&&R()<CF.fragRate){var n=CF.fmin+Math.floor(R()*(CF.fmax-CF.fmin+1)),s_=SD();s_.f=(s_.f|0)+n;
    DT.push({x:e.x,y:330,s:'🐉 +'+n+' Mảnh Đan Đột Phá Cảnh Giới 4 ('+s_.f+'/'+CF.need+')',c:'#7dffc0',l:200,g:1});
    if(s_.f>=CF.need)DT.push({x:e.x,y:365,s:'✨ Đủ mảnh! Ghép Đan ở bảng 🕳 Phụ Bản',c:'#ffe27a',l:200,g:1});save()}}catch(x){}
  return r};

/* ---------- Đan cho Thú nuôi (tiến hoá cấp 3 → 4) ----------
   Đan = PS[cur].dan (chính là "Thức Tỉnh Đan" mà engine đã chặn sẵn cho thú k==2 ở hình cuối, nay đổi tên thành Đan Đột Phá Cảnh Giới 4).
   Engine tự kiểm tra + trừ Đan cho thú k==2; ở đây áp luật tương tự cho 3 thần thú còn lại (k!=2). */
if(typeof pev==='function'&&typeof pet==='function'){var _pev=pev;pev=function(){var p=null;try{p=pet()}catch(e){}
  if(p&&p.ev===2&&p.k!==2){if((PS[cur].dan|0)<1){msg='🔒 Cần 1 Đan Đột Phá Cảnh Giới 4 Thần Thú (ghép từ '+CF.need+' mảnh, rơi ở Phụ Bản 2 · Địa Long Điện)';ui();return}
    var e0=p.ev;_pev.apply(this,arguments);if(p.ev>e0){PS[cur].dan=(PS[cur].dan|0)-1;save()}return}
  return _pev.apply(this,arguments)}}
if(typeof petUI==='function'&&typeof pet==='function'){var _pu=petUI;petUI=function(){var h=_pu.apply(this,arguments);
  try{var p=pet();if(typeof h==='string'&&p&&p.ev===2&&p.k!==2){h+='<div class="dt">💊 Đan Đột Phá Cảnh Giới 4: <b>'+(PS[cur].dan|0)+'</b>/1 cần để tiến hoá · mảnh '+(SD().f|0)+'/'+CF.need+'<br><small>Ghép Đan ở bảng 🕳 Phụ Bản (mảnh rơi từ Phụ Bản 2).</small></div>'}}catch(e){}
  return h}}

window.PB2={cfg:CF,open:open,go:go,left:left,data:SD};
})();
