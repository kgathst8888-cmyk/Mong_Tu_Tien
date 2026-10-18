/* ===== 🎭 AVATAR + KHUNG VIỀN + DANH HIỆU (world/51b-ho-so-avatar-danh-hieu.js) — Fix246 — nạp NGAY SAU world/51 (trước 91/92/96) =====
 * • Avatar + khung viền: hiện ở box 💬 Chat Thế Giới (systems/28-chat.js gọi PFD.avHTML / PFD.parse / PFD.meta).
 * • Danh hiệu: vẽ trên đầu nhân vật, phía TRÊN dòng "Tên · Cảnh giới" (bọc nameTag, cùng công thức vị trí với world/51).
 *   Mỗi danh hiệu có thuộc tính riêng (cộng qua twB → SX → vào mọi công thức chiến đấu, bảng chỉ số tự hiện).
 * • Lưu: PS[cur].pf = {av,fr,tt,own:{a:[],f:[],t:[]}} — theo từng nhân vật, đi cùng save/cloud save như PS.
 * • Mở bảng: nút 🎭 ở tab 🎒 Túi (góc dưới-trái khung nhân vật) hoặc nút 🎭 ở đầu box chat. API: PFD.open('a'|'f'|'t').
 * • Mở khoá: theo cấp độ (it.lv) hoặc tặng riêng (it.g=1 → PFD.grant('t',10)). Bảng AV/FR/TT bên dưới là chỗ chỉnh/thêm mục.
 * • Chat: gắn kèm mã ⟦avatar.khung.danhhieu⟧ (tối đa 10 ký tự) vào đầu tin nhắn — KHÔNG cần sửa SQL.
 * Chỉnh: PFD_CF.enable (bật/tắt vẽ danh hiệu) · .gap (khoảng cách trên tên, ×cỡ chữ) · .k (cỡ chữ danh hiệu ×cỡ chữ tên). */
(function(){
'use strict';
if(window.PFD||typeof PS==='undefined'||typeof nameTag!=='function'||typeof g==='undefined')return;
var CF=window.PFD_CF={enable:true,gap:1.35,k:.95,size:{bt:30}};

/* ---------- DANH MỤC ---------- */
var AV=[
 {id:1,n:'Kiếm Khách',ic:'⚔️',bg:'#6b4a2a',lv:1},{id:2,n:'Xạ Thủ',ic:'🏹',bg:'#2a6b3a',lv:1},
 {id:3,n:'Pháp Sư',ic:'🔮',bg:'#4a2a8a',lv:1},{id:4,n:'Hoa Tiên',ic:'🌸',bg:'#b04a7a',lv:1},
 {id:5,n:'Hồ Ly',ic:'🦊',bg:'#c0642a',lv:10},{id:6,n:'Bạch Hổ',ic:'🐯',bg:'#7a8a9a',lv:20},
 {id:7,n:'Thanh Long',ic:'🐉',bg:'#1f7a6a',lv:30},{id:8,n:'Đại Bàng',ic:'🦅',bg:'#6a5a3a',lv:40},
 {id:9,n:'Hỏa Diệm',ic:'🔥',bg:'#a82a1a',lv:50},{id:10,n:'Hàn Băng',ic:'❄️',bg:'#2a6aa8',lv:60},
 {id:11,n:'Lôi Thần',ic:'⚡',bg:'#6a4ac8',lv:80},{id:12,n:'Nguyệt Tiên',ic:'🌙',bg:'#3a3a7a',lv:100},
 {id:13,n:'Chí Tôn',ic:'👑',bg:'#9a7a1a',g:1},{id:14,n:'Ma Tôn',ic:'😈',bg:'#4a1a3a',g:1}
];
/* c1,c2: màu khung · glow: màu phát sáng · an: 1 = chuyển màu động */
var FR=[
 {id:0,n:'Mặc định',c:['#5a4630','#3a2c1c'],lv:1},
 {id:1,n:'Đồng',c:['#e8a96c','#7a4a22'],lv:1},
 {id:2,n:'Bạc',c:['#f4f4f4','#8a8f99'],lv:10},
 {id:3,n:'Hoàng Kim',c:['#ffe27a','#b8860b'],glow:'#ffd24a',lv:20},
 {id:4,n:'Ngọc Bích',c:['#8ff5c8','#0c8a63'],glow:'#3ee6a0',lv:30},
 {id:5,n:'Hàn Băng',c:['#c4f0ff','#3a8fd8'],glow:'#7fd0ff',lv:50},
 {id:6,n:'Liệt Hỏa',c:['#ffd24a','#ff5a1a','#c01818'],glow:'#ff6a2a',an:1,lv:60},
 {id:7,n:'Tử Điện',c:['#e0b0ff','#7a3ae0','#3a1a8a'],glow:'#a86aff',an:1,lv:80},
 {id:8,n:'Cửu Thiên',c:['#ff6b6b','#ffd93d','#6bff95','#4dd2ff','#b86bff','#ff6b6b'],glow:'#fff0a0',an:1,lv:100},
 {id:9,n:'Chí Tôn Long Văn',c:['#fff3b0','#e0a020','#fff3b0','#e0a020'],glow:'#ffd24a',an:1,g:1}
];
/* c: màu chữ · r: độ hiếm 1-5 (từ 3 trở lên có quầng sáng) · x: thuộc tính (khoá SX: hpp dmgp crit cdmg dred sdmg eres goldp… đơn vị %) */
var TT=[
 {id:1,n:'Sơ Nhập Giang Hồ',c:'#dfe6ee',r:1,lv:1,x:{hpp:2}},
 {id:2,n:'Tân Binh Dũng Cảm',c:'#7be07a',r:1,lv:10,x:{hpp:2,dmgp:2}},
 {id:3,n:'Kiếm Khách Vô Danh',c:'#5fb4ff',r:2,lv:20,x:{dmgp:3,crit:1}},
 {id:4,n:'Hộ Thôn Anh Hùng',c:'#5fb4ff',r:2,lv:30,x:{hpp:4,dred:1}},
 {id:5,n:'Phá Quân Tướng',c:'#c58bff',r:3,lv:40,x:{dmgp:4,cdmg:5}},
 {id:6,n:'Bất Khuất Chiến Thần',c:'#c58bff',r:3,lv:50,x:{hpp:5,dred:2,eres:3}},
 {id:7,n:'Đạo Tâm Kiên Định',c:'#ffa94d',r:4,lv:60,x:{crit:2,cdmg:8,sdmg:3}},
 {id:8,n:'Thiên Hạ Vô Địch',c:'#ff7a45',r:4,lv:80,x:{dmgp:6,crit:3,cdmg:10}},
 {id:9,n:'Cửu Thiên Chí Tôn',c:'#ffd76a',r:5,lv:100,x:{dmgp:8,hpp:8,cdmg:15,sdmg:5}},
 {id:10,n:'Tiên Phong Alpha',c:'#7ef0ff',r:4,g:1,x:{goldp:5,dmgp:3}},
 {id:11,n:'Thiên Mệnh Chi Tử',c:'#ff5fd2',r:5,g:1,x:{dmgp:6,hpp:6,crit:2}}
];
var CAT={a:AV,f:FR,t:TT},FLD={a:'av',f:'fr',t:'tt'},KN={a:'a',f:'f',t:'t',avatar:'a',frame:'f',title:'t'};

/* ---------- DỮ LIỆU NHÂN VẬT ---------- */
function pf(){
 var p=PS[cur];if(!p)return null;var o=p.pf;
 if(!o||typeof o!=='object')o=p.pf={av:1,fr:0,tt:0,own:{a:[],f:[],t:[]}};
 if(!o.own||typeof o.own!=='object')o.own={a:[],f:[],t:[]};
 ['a','f','t'].forEach(function(k){if(!Array.isArray(o.own[k]))o.own[k]=[]});
 return o}
function lvl(){try{return (typeof P!=='undefined'&&P.lv|0)||1}catch(e){return 1}}
function find(k,id){var a=CAT[k];for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function owned(k,id){
 var it=find(k,id);if(!it)return false;var o=pf();if(!o)return false;
 if(o.own[k].indexOf(id)>=0)return true;
 return !it.g&&lvl()>=(it.lv||1)}
function eq(k){var o=pf();if(!o)return k==='a'?1:0;var id=o[FLD[k]]|0;return(id&&owned(k,id))?id:(k==='a'?1:0)}
function save(){try{if(typeof sv==='function')sv()}catch(e){}}
function reason(it){return it.g?'Phần thưởng đặc biệt / sự kiện':'Cần đạt Lv '+it.lv}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function statTxt(x){
 var a=[];for(var k in x){var nm=(typeof AXN!=='undefined'&&AXN[k])||k;a.push(nm+' +'+x[k]+'%')}
 return a.join(' · ')}

/* ---------- HTML avatar / khung / danh hiệu (dùng chung chat + bảng) ---------- */
function frStyle(f){
 if(!f)f=FR[0];
 var c=f.c,bg=c.length>2?'linear-gradient(120deg,'+c.join(',')+')':'linear-gradient(135deg,'+c[0]+','+c[1]+')';
 return '--fb:'+bg+(f.glow?';--fg:0 0 7px '+f.glow:'')}
function avHTML(av,fr,size,nm){
 var a=find('a',av|0),f=find('f',fr|0)||FR[0],sz=size||32;
 var inner=a?a.ic:esc(String(nm||'?').charAt(0).toUpperCase()),bg=a?a.bg:'#3a2c1c';
 return '<span class="pfa'+(f.an?' pfan':'')+'" style="--sz:'+sz+'px;'+frStyle(f)+'"><span class="pfi" style="--ab:radial-gradient(#fff3 0,'+bg+' 70%)">'+inner+'</span></span>'}
function ttHTML(id){
 var t=find('t',id|0);if(!t)return'';
 return '<i class="pftt r'+t.r+'" style="color:'+t.c+'">『'+esc(t.n)+'』</i>'}

/* ---------- CHAT: mã kèm tin nhắn ---------- */
function meta(){var o=pf();return o?'⟦'+eq('a')+'.'+eq('f')+'.'+eq('t')+'⟧':''}
function parse(txt){
 var m=/^⟦(\d{1,2})\.(\d{1,2})\.(\d{1,2})⟧/.exec(String(txt||''));
 if(!m)return{msg:String(txt||''),av:0,fr:0,tt:0};
 return{msg:String(txt).slice(m[0].length),av:+m[1],fr:+m[2],tt:+m[3]}}

/* ---------- THUỘC TÍNH DANH HIỆU (móc twB của SX) ---------- */
if(typeof twB==='function'&&!twB.__pf){
 var _tw=twB;
 twB=function(k){var v=_tw.apply(this,arguments);try{var id=eq('t');if(id){var t=find('t',id);if(t&&t.x&&t.x[k])v+=t.x[k]}}catch(e){}return v};
 twB.__pf=1}

/* ---------- VẼ DANH HIỆU TRÊN ĐẦU (trên dòng Tên · Cảnh giới) ---------- */
/* vẽ 1 danh hiệu: id, tâm X, đường nền y, cỡ chữ tên fs (dùng cho nhân vật mình và người chơi khác ở làng) */
function drawTT(id,X,y,fs){
 var t=find('t',id|0);if(!t)return false;
 var tx='『'+t.n+'』';
 g.save();g.globalAlpha=1;g.textBaseline='alphabetic';g.textAlign='center';
 g.font='bold '+Math.max(10,fs*CF.k)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
 if(t.r>=3){g.globalAlpha=.35;g.strokeStyle=t.c;g.lineWidth=6;g.strokeText(tx,X,y);g.globalAlpha=1}
 g.strokeStyle='#000';g.lineWidth=3;g.strokeText(tx,X,y);
 g.fillStyle=t.c;g.fillText(tx,X,y);g.restore();return true}
function ttWidth(id,fs){
 var t=find('t',id|0);if(!t)return 0;
 g.save();g.font='bold '+Math.max(10,fs*CF.k)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';var w=g.measureText('『'+t.n+'』').width;g.restore();return w}
var _nt=nameTag;
nameTag=function(){
 _nt.apply(this,arguments);
 if(!CF.enable)return;
 try{
  var id=eq('t');if(!id)return;
  var X=(P.x-cam)*s,fs=Math.max(10,12*s),bh=Math.max(2.5,3*s),mh=Math.max(2,2.25*s),
      yM=GY-80*s-mh,yH=yM-bh-2,yN=yH-4;
  drawTT(id,X,yN-fs*CF.gap,fs)
 }catch(e){}
};

/* ---------- CSS ---------- */
var st=document.createElement('style');st.id='pfd-css';
st.textContent='.pfa{display:inline-block;flex:none;vertical-align:middle;width:var(--sz,32px);height:var(--sz,32px);border-radius:50%;padding:max(2px,calc(var(--sz,32px)*.08));box-sizing:border-box;background:var(--fb,#5a4630);box-shadow:var(--fg,0 0 0 transparent)}'
+'.pfa.pfan{background-size:300% 300%;animation:pfsh 4s linear infinite}@keyframes pfsh{0%{background-position:0 50%}100%{background-position:300% 50%}}'
+'.pfi{display:flex;width:100%;height:100%;border-radius:50%;align-items:center;justify-content:center;background:var(--ab,#3a2c1c);font-size:calc(var(--sz,32px)*.5);line-height:1;overflow:hidden;color:#fff;font-weight:700}'
+'.pftt{font-style:normal;font-weight:700;font-size:11px;margin-right:4px;text-shadow:0 1px 2px #000}.pftt.r3,.pftt.r4,.pftt.r5{text-shadow:0 0 6px currentColor,0 1px 2px #000}'
+'.chp .pf-bt{position:absolute;left:4px;bottom:6px;z-index:3;cursor:pointer;-webkit-tap-highlight-color:transparent}'
+'.pf-ov{position:fixed;inset:0;z-index:99999;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px}'
+'.pf-bx{width:100%;max-width:360px;max-height:92vh;display:flex;flex-direction:column;background:#2a1b12;border:2px solid #b8964e;border-radius:12px;padding:12px;color:#f1e3c4;font-size:14px;box-shadow:0 0 18px #000}'
+'.pf-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}.pf-top b{font-size:16px;color:#ffe9a0;display:block}.pf-top small{display:block;opacity:.8;line-height:1.35;margin-top:2px}'
+'.pf-tb{display:flex;gap:6px;margin-bottom:8px}.pf-tb button{flex:1;padding:7px 2px;border:1px solid #6a5434;border-radius:8px;background:#1d1510;color:#f1e3c4;font-size:13px}.pf-tb button.on{background:#8a6420;border-color:#ffd76a;color:#fff}'
+'.pf-gd{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;min-height:120px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-content:start;padding:2px}'
+'.pf-it{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border:2px solid #4a3a2a;border-radius:8px;background:#1a110c;cursor:pointer;text-align:center;font-size:11px;line-height:1.2}'
+'.pf-it.on{border-color:#ffd76a;background:#3a2718}.pf-it.lk{opacity:.5;filter:grayscale(.7)}.pf-it em{font-style:normal;opacity:.75;font-size:10px}'
+'.pf-ls{grid-column:1/-1;display:flex;flex-direction:column;gap:2px;padding:7px 9px;border:2px solid #4a3a2a;border-radius:8px;background:#1a110c;cursor:pointer;text-align:left}'
+'.pf-ls.on{border-color:#ffd76a;background:#3a2718}.pf-ls.lk{opacity:.5;filter:grayscale(.6)}.pf-ls small{opacity:.8;font-size:12px;line-height:1.3}'
+'.pf-ms{min-height:18px;font-size:12px;color:#ffb48a;margin-top:6px}'
+'.pf-x{margin:8px 0 0 auto;padding:6px 16px;border:1px solid #b8964e;border-radius:8px;background:#3a2718;color:#f1e3c4;font-size:14px}';
document.head.appendChild(st);

/* ---------- BẢNG HỒ SƠ ---------- */
var tab='a';
function nm(){try{return CN(cur)}catch(e){return 'Đạo Hữu'}}
function btHTML(){return '<div class="pf-bt" data-pf="open" title="Avatar · Khung · Danh hiệu">'+avHTML(eq('a'),eq('f'),CF.size.bt,nm())+'</div>'}
function render(msg){
 var ov=document.getElementById('pf-ov');if(!ov)return;
 var o=pf(),a=eq('a'),f=eq('f'),t=eq('t'),T=find('t',t);
 var h='<div class="pf-bx"><div class="pf-top">'+avHTML(a,f,64,nm())+'<div><b>'+esc(nm())+'</b>'
  +(T?ttHTML(t)+'<small>'+statTxt(T.x)+'</small>':'<small>Chưa đeo danh hiệu</small>')+'</div></div>'
  +'<div class="pf-tb">'+[['a','🧑 Avatar'],['f','🖼 Khung'],['t','🏅 Danh hiệu']].map(function(z){return '<button data-tab="'+z[0]+'" class="'+(tab===z[0]?'on':'')+'">'+z[1]+'</button>'}).join('')+'</div>'
  +'<div class="pf-gd">';
 var cur_=eq(tab);
 if(tab==='t'){
  h+='<div class="pf-ls'+(!t?' on':'')+'" data-k="t" data-id="0"><b>Không đeo danh hiệu</b></div>';
  TT.forEach(function(it){var ok=owned('t',it.id);
   h+='<div class="pf-ls'+(t===it.id?' on':'')+(ok?'':' lk')+'" data-k="t" data-id="'+it.id+'">'+ttHTML(it.id)+'<small>'+statTxt(it.x)+(ok?'':' · 🔒 '+reason(it))+'</small></div>'})
 }else{
  CAT[tab].forEach(function(it){var ok=owned(tab,it.id),on=cur_===it.id;
   h+='<div class="pf-it'+(on?' on':'')+(ok?'':' lk')+'" data-k="'+tab+'" data-id="'+it.id+'">'
    +(tab==='a'?avHTML(it.id,f,44,nm()):avHTML(a,it.id,44,nm()))+'<span>'+esc(it.n)+'</span>'+(ok?'':'<em>🔒 '+(it.g?'Đặc biệt':'Lv '+it.lv)+'</em>')+'</div>'})
 }
 h+='</div><div class="pf-ms">'+(msg||'')+'</div><button class="pf-x" data-pf="close">Đóng</button></div>';
 ov.innerHTML=h}
function refreshBt(){var b=document.querySelector('#bag .eqd .chp .pf-bt');if(b)b.outerHTML=btHTML()}
function open(k){
 if(KN[k])tab=KN[k];close();
 var ov=document.createElement('div');ov.id='pf-ov';ov.className='pf-ov';
 ov.addEventListener('click',function(e){
  if(e.target===ov){close();return}
  var el=e.target.closest&&e.target.closest('[data-pf],[data-tab],[data-k]');if(!el)return;
  if(el.dataset.pf==='close'){close();return}
  if(el.dataset.tab){tab=el.dataset.tab;render();return}
  if(el.dataset.k){
   var k2=el.dataset.k,id=+el.dataset.id,o=pf();if(!o)return;
   if(id&&!owned(k2,id)){var it=find(k2,id);render('🔒 '+(it?it.n+': '+reason(it):''));return}
   o[FLD[k2]]=id;save();render();refreshBt()}
 });
 ['pointerdown','touchstart'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
 document.body.appendChild(ov);render()}
function close(){var o=document.getElementById('pf-ov');if(o)o.remove()}

/* ---------- NÚT 🎭 Ở TAB TÚI ---------- */
function inject(){
 var chp=document.querySelector('#bag .eqd .chp');if(!chp||chp.querySelector('.pf-bt'))return;
 chp.insertAdjacentHTML('beforeend',btHTML());
 var b=chp.querySelector('.pf-bt');b.addEventListener('click',function(e){e.stopPropagation();open()})}
if(typeof ui==='function'){
 var _ui=window.ui;
 window.ui=function(){var r=_ui.apply(this,arguments);try{inject()}catch(e){console.warn('PFD',e)}return r};
 try{if(typeof bo!=='undefined'&&bo)window.ui()}catch(e){}
}

/* ---------- API ---------- */
function grant(k,id){k=KN[k];var o=pf();if(!k||!o||!find(k,id))return false;if(o.own[k].indexOf(id)<0){o.own[k].push(id);save()}return true}
function revoke(k,id){k=KN[k];var o=pf();if(!k||!o)return false;var i=o.own[k].indexOf(id);if(i>=0){o.own[k].splice(i,1);save()}return true}
window.PFD={drawTT:drawTT,ttWidth:ttWidth,AV:AV,FR:FR,TT:TT,eq:eq,owned:owned,grant:grant,revoke:revoke,open:open,close:close,meta:meta,parse:parse,avHTML:avHTML,ttHTML:ttHTML,cfg:CF,
 /* thử nghiệm: PFD.unlockAll() mở khoá mọi mục của nhân vật hiện tại */
 unlockAll:function(){['a','f','t'].forEach(function(k){CAT[k].forEach(function(it){if(it.id)grant(k,it.id)})});refreshBt()}};
})();
