/* ===== 🔨 KỸ NĂNG NGHỀ NGHIỆP (world/103-nghe-nghiep.js) — Fix315 — nạp SAU world/100, ui/101 =====
 * Nhà "Kỹ Năng Nghề Nghiệp" ở Làng Tân Thủ 2 (TT2.houses[2]). 5 nghề, MỖI NHÂN VẬT HỌC TỐI ĐA 2 NGHỀ (CF.maxLearn):
 *   ⛏ Khai Khoáng (kk) · 🌱 Linh Nông (ln) · ⚗ Luyện Đan (ld) · 🔨 Rèn Đúc (rd) · 💎 Giám Bảo (gb)
 * Mỗi nghề cấp 1→10, lên cấp bằng cách làm đúng việc của nghề (EXP nghề). Cấp nghề cho bonus thụ động (bảng B bên dưới).
 * HỌC: CF.learn (vàng + 💎 Linh Thạch qua LT.spend, cần đăng nhập ☁). QUÊN NGHỀ: CF.forget 💎, MẤT cấp nghề đó (để đổi nghề khác).
 * Lưu: PS[cur].ng = {a:['kk','ln'], d:{kk:{l:cấp,e:exp}}} (theo từng nhân vật).
 * MÓC (mỗi chỗ là 1 patch nhỏ, có kiểm tra window.NGH, gỡ module thì game vẫn chạy):
 *   world/13-mining.js  → NGH.mm / ex / hkp / xp('kk')           systems/08-farming-alchemy.js → NGH.grow / pest / yld / ldSc / ldTop / ldGold / xp('ln'|'ld')
 *   world/38-da-cuong-hoa.js → NGH.rdRate / rdGold / xp('rd')    equipment/64-duc-lo-kham-da.js → NGH.gbRate / gbCost / xp('gb')
 * Chỉnh cân bằng: CF (chi phí, EXP) và B (bonus theo cấp). API: NGH.open() · NGH.give(id,cấp) (thử nghiệm) · NGH.lv(id) */
(function(){
'use strict';
if(window.NGH||typeof PS==='undefined'||typeof document==='undefined')return;
var FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif',GOLD='#5fd0a8';
var CF={
  maxLearn:2,maxLv:10,
  learn:{gold:20000000,lt:50},          /* học 1 nghề */
  forget:{lt:100},                       /* quên nghề (mất cấp) */
  need:function(L){return Math.round(40*L*L)},   /* EXP lên cấp L→L+1 */
  xp:{kk:1,ln:6,ld:4,ldMax:10,rd:8,gb:3,gbMerge:12}
};
var N=[
 {id:'kk',e:'⛏',n:'Khai Khoáng',col:'#d9a441',src:'Đào ở Mỏ (mỗi nhát +EXP)',
  tx:function(L){return '+'+5*L+'% sản lượng vàng/quặng · '+3*L+'% ra thêm +1 quặng · +'+2*L+'% ra Huyền Kim · Nguyên Anh thu khoáng nhanh +'+5*L+'%'}},
 {id:'ln',e:'🌱',n:'Linh Nông',col:'#6bd08a',src:'Thu hoạch Linh Điền (mỗi ô +EXP)',
  tx:function(L){return 'Cây chín nhanh −'+3*L+'% · giảm '+8*L+'% sâu bệnh · +'+4*L+'% sản lượng thu hoạch'}},
 {id:'ld',e:'⚗',n:'Luyện Đan',col:'#c98cff',src:'Luyện đan (mỗi lò +EXP)',
  tx:function(L){return '+'+2*L+'% tỉ lệ thành đan · +'+L+'% ra thượng phẩm · −'+2*L+'% phí vàng mỗi lò'}},
 {id:'rd',e:'🔨',n:'Rèn Đúc',col:'#ff8a5c',src:'Cường hóa trang bị (mỗi lần +EXP)',
  tx:function(L){return '+'+(L*.5)+'% tỉ lệ cường hóa · −'+2*L+'% phí vàng cường hóa'}},
 {id:'gb',e:'💎',n:'Giám Bảo',col:'#5aa8ff',src:'Mài / ghép đá khảm (mỗi lần +EXP)',
  tx:function(L){return '+'+L+'% tỉ lệ ghép đá · −'+2*L+'% phí 💎 mài và ghép đá'}}
];
var NM={};N.forEach(function(x){NM[x.id]=x});
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function say(s,c){try{DT.push({x:P.x,y:190,s:s,c:c||'#ffe9a8',l:130,g:1})}catch(e){}}
function sav(){try{if(typeof sv==='function')sv()}catch(e){}}
function rnd(){try{return typeof R==='function'?R():Math.random()}catch(e){return Math.random()}}
function D(){var p=PS[cur];if(!p)return null;var o=p.ng;
  if(!o||typeof o!=='object'||!Array.isArray(o.a)||!o.d||typeof o.d!=='object')o=p.ng={a:[],d:{}};
  return o}
function lv(id){var o=D();if(!o||o.a.indexOf(id)<0)return 0;var d=o.d[id];return d?Math.max(1,Math.min(CF.maxLv,d.l|0||1)):0}
/* ---------- EXP ---------- */
function xp(id,n){
  try{var o=D();if(!o||o.a.indexOf(id)<0||!(n>0))return;
    var d=o.d[id]||(o.d[id]={l:1,e:0});
    if((d.l|0)>=CF.maxLv)return;
    d.e=(d.e|0)+Math.round(n);
    var up=0;while(d.l<CF.maxLv&&d.e>=CF.need(d.l)){d.e-=CF.need(d.l);d.l++;up=1}
    if(d.l>=CF.maxLv)d.e=0;
    if(up){say(NM[id].e+' '+NM[id].n+' lên cấp '+d.l+'!',NM[id].col);sav();if(isOpen)render()}
  }catch(e){}}
/* ---------- bonus (đọc bởi các module khác) ---------- */
var B={
  mm:function(){return 1+.05*lv('kk')},
  ex:function(){return rnd()<.03*lv('kk')?1:0},
  hkp:function(){return .02*lv('kk')},
  grow:function(){return 1-.03*lv('ln')},
  pest:function(){return Math.max(.2,1-.08*lv('ln'))},
  yld:function(){return 1+.04*lv('ln')},
  ldSc:function(){return .02*lv('ld')},
  ldTop:function(){return .01*lv('ld')},
  ldGold:function(){return 1-.02*lv('ld')},
  rdRate:function(){return .5*lv('rd')},
  rdGold:function(){return 1-.02*lv('rd')},
  gbRate:function(){return 1*lv('gb')},
  gbCost:function(){return 1-.02*lv('gb')}
};
/* ---------- Linh Thạch ---------- */
function ltOk(){try{return !!(window.LT&&LT.logged&&LT.logged()&&LT.spend)}catch(e){return false}}
function spend(n,why){
  if(!ltOk())return Promise.resolve({ok:false,err:'login'});
  try{return Promise.resolve(LT.spend(n,why)).catch(function(){return{ok:false,err:'net'}})}catch(e){return Promise.resolve({ok:false,err:'net'})}}
function spErr(r){return !r||r.err==='net'?'Lỗi mạng, chưa trừ Linh Thạch':r.err==='poor'?'💎 Không đủ Linh Thạch':r.err==='login'?'☁ Cần đăng nhập tài khoản để dùng Linh Thạch':'Không trừ được Linh Thạch'}
/* ---------- học / quên ---------- */
var busy=false,note='';
function learn(id){
  var o=D();if(!o||busy||!NM[id]||o.a.indexOf(id)>=0)return;
  if(o.a.length>=CF.maxLearn){note='Chỉ học tối đa '+CF.maxLearn+' nghề. Hãy quên một nghề trước.';render();return}
  if(gold<CF.learn.gold){note='Không đủ vàng: cần '+nf(CF.learn.gold)+'💰';render();return}
  if(!ltOk()){note=spErr({err:'login'});render();return}
  busy=true;note='⏳ Đang học nghề...';render();
  spend(CF.learn.lt,'hoc_nghe').then(function(r){
    busy=false;
    if(!(r&&r.ok)){note=spErr(r);render();return}
    var o2=D();
    if(!o2||o2.a.length>=CF.maxLearn||gold<CF.learn.gold){note='Điều kiện đã thay đổi — học nghề bị huỷ (đã trừ '+CF.learn.lt+'💎)';render();return}
    gold-=CF.learn.gold;o2.a.push(id);o2.d[id]={l:1,e:0};
    note='✅ Đã học nghề '+NM[id].n+'!';say(NM[id].e+' Học nghề '+NM[id].n,NM[id].col);sav();render()})}
function forget(id){
  var o=D();if(!o||busy||o.a.indexOf(id)<0)return;
  var ask=typeof gcf==='function'?gcf:function(t,fn){if(confirm(t))fn()};
  ask('Quên nghề '+NM[id].n+'? Bạn MẤT toàn bộ cấp nghề ('+lv(id)+') và tốn '+CF.forget.lt+'💎.',function(){
    if(!ltOk()){note=spErr({err:'login'});render();return}
    busy=true;note='⏳ Đang xử lý...';render();
    spend(CF.forget.lt,'quen_nghe').then(function(r){
      busy=false;
      if(!(r&&r.ok)){note=spErr(r);render();return}
      var o2=D(),k=o2?o2.a.indexOf(id):-1;
      if(k>=0){o2.a.splice(k,1);delete o2.d[id]}
      note='Đã quên nghề '+NM[id].n+'.';sav();render()})})}
/* ---------- giao diện ---------- */
var isOpen=false,ovEl=null;
(function css(){var st=document.createElement('style');st.id='ngh-css';
 st.textContent='.ngh-bx{max-width:390px!important;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:'+FONT+'}'
 +'.ngh-cd{border:2px solid #3b4a44;border-radius:10px;background:#0f1a16;padding:8px 10px;margin:8px 0}'
 +'.ngh-cd.has{border-color:var(--c,#5fd0a8);box-shadow:0 0 8px #5fd0a844}'
 +'.ngh-cd b{font-size:15px}.ngh-cd small{display:block;opacity:.8;margin-top:2px;line-height:1.35}'
 +'.ngh-bar{height:7px;border-radius:4px;background:#26342f;margin:6px 0 2px;overflow:hidden}.ngh-bar i{display:block;height:100%;background:var(--c,#5fd0a8)}'
 +'.ngh-bt{margin-top:6px;padding:6px 12px;border-radius:8px;border:1px solid #5fd0a8;background:#173229;color:#e8fff4;font-size:13px;font-family:inherit}'
 +'.ngh-bt.fg{border-color:#a05a5a;background:#321a1a}.ngh-bt[disabled]{opacity:.45}'
 +'.ngh-nt{min-height:18px;color:#ffe9a8;font-size:12px;margin:6px 0}';
 document.head.appendChild(st)})();
function render(){
  if(!ovEl||!document.body.contains(ovEl))return;
  var o=D(),h='<div class="tsm-bx ngh-bx"><h3>🔨 Nhà Kỹ Năng Nghề Nghiệp</h3>'
   +'<small>Mỗi nhân vật học tối đa '+CF.maxLearn+' nghề ('+(o?o.a.length:0)+'/'+CF.maxLearn+'). Học: '+nf(CF.learn.gold)+'💰 + '+CF.learn.lt+'💎. Quên nghề: '+CF.forget.lt+'💎 (mất cấp).</small>';
  h+='<div class="ngh-nt">'+(note||'')+'</div>';
  N.forEach(function(x){
    var L=lv(x.id),has=L>0,d=o&&o.d[x.id],need=CF.need(L||1),e=d?(d.e|0):0,pct=L>=CF.maxLv?100:Math.min(100,Math.round(e/need*100));
    h+='<div class="ngh-cd'+(has?' has':'')+'" style="--c:'+x.col+'"><b>'+x.e+' '+x.n+(has?' · Cấp '+L+(L>=CF.maxLv?' (MAX)':''):'')+'</b>'
      +'<small>'+x.src+'</small>'
      +'<small>'+(has?'Hiện tại: ':'Cấp 10: ')+x.tx(has?L:CF.maxLv)+'</small>';
    if(has){h+='<div class="ngh-bar"><i style="width:'+pct+'%"></i></div><small>EXP '+(L>=CF.maxLv?'đầy':nf(e)+' / '+nf(need))+'</small>'
      +'<button class="ngh-bt fg" '+(busy?'disabled ':'')+'onclick="NGH.forget(\''+x.id+'\')">Quên nghề</button>'}
    else{h+='<button class="ngh-bt" '+(busy||(o&&o.a.length>=CF.maxLearn)?'disabled ':'')+'onclick="NGH.learn(\''+x.id+'\')">Học nghề</button>'}
    h+='</div>'});
  h+='<button class="ngh-bt" onclick="NGH.close()">Đóng</button></div>';
  ovEl.innerHTML=h}
function open(){
  var old=document.getElementById('ngh-ov');if(old)old.remove();
  ovEl=document.createElement('div');ovEl.id='ngh-ov';ovEl.className='tsm-ov';ovEl.style.setProperty('--tc',GOLD);
  ovEl.addEventListener('click',function(e){if(e.target===ovEl)close()});
  document.body.appendChild(ovEl);isOpen=true;note='';render()}
function close(){isOpen=false;if(ovEl){ovEl.remove();ovEl=null}}
/* ---------- gắn vào Nhà Kỹ Năng Nghề Nghiệp (TT2.houses[2]) ---------- */
function hook(){try{if(window.TT2&&TT2.houses&&TT2.houses[2]){TT2.houses[2].open=function(){open()};return true}}catch(e){}return false}
if(!hook()){var n=0,iv=setInterval(function(){if(hook()||++n>40)clearInterval(iv)},500)}
window.NGH={cfg:CF,open:open,close:close,learn:learn,forget:forget,lv:lv,xp:function(id,n){
    if(id==='ld')n=Math.min(n,CF.xp.ldMax*CF.xp.ld);xp(id,n)},
  give:function(id,l){var o=D();if(!o||!NM[id])return;if(o.a.indexOf(id)<0)o.a.push(id);o.d[id]={l:Math.max(1,Math.min(CF.maxLv,l|0||1)),e:0};sav();render()},
  mm:B.mm,ex:B.ex,hkp:B.hkp,grow:B.grow,pest:B.pest,yld:B.yld,ldSc:B.ldSc,ldTop:B.ldTop,ldGold:B.ldGold,
  rdRate:B.rdRate,rdGold:B.rdGold,gbRate:B.gbRate,gbCost:B.gbCost};
})();
