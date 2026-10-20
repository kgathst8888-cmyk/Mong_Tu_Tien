/* ===== NGŨ HÀNH TƯƠNG SINH TƯƠNG KHẮC (module riêng, Fix358 + Fix360: icon hệ trước tên, boss Hỗn Độn) =====
 * Hệ của người chơi = linh căn chọn ở Tháp (PS[cur].tw.root: 0 Kim · 1 Mộc · 2 Thủy · 3 Hỏa · 4 Thổ). Chưa có linh căn → trung tính.
 * Hệ của quái = hệ của bản đồ thường (mapSel) lúc quái xuất hiện (gắn e.hx). Quái ở map khác (phụ bản, tháp...) không có hệ → trung tính.
 * Khắc: Kim→Mộc→Thổ→Thủy→Hỏa→Kim.  Sinh: Mộc→Hỏa→Thổ→Kim→Thủy→Mộc.
 * Hook: bọc dm() (sát thương gây ra) + bọc spawn() (gắn hệ quái); sát thương nhận vào dùng NHX.inc(e) (patch 1 chỗ ở core/01e-step-loop.js).
 * Chỉnh cân bằng ở NHX.CF. */
(function(){
var N=[{n:'Kim',ic:'🪙',c:'#ffd76a'},{n:'Mộc',ic:'🌿',c:'#5adf7a'},{n:'Thủy',ic:'💧',c:'#5ab8ff'},{n:'Hỏa',ic:'🔥',c:'#ff6a3a'},{n:'Thổ',ic:'⛰️',c:'#c89a5a'},{n:'Hỗn Độn',ic:'🌀',c:'#c58bff'}];
var KHAC={0:1,1:4,4:2,2:3,3:0},SINH={1:3,3:4,4:0,0:2,2:1};
/* hệ của 8 bản đồ thường (theo MP): Thanh Vân, Rừng Bóng Đêm, Tuyết Hàn, Xích Viêm, U Minh, Cảng Chiến Hạm, Thiên Đài, Hư Không(-1 = trung tính) */
var MAPEL=[4,1,2,3,2,0,0,-1];
var CF={khac:1.30,biKhac:.80,duocSinh:1.10,sinhDich:.90,inKhac:1.25,inBiKhac:.80,inDuocSinh:.90,inSinhDich:1.10,hdIn:1.20};
var lastSay=-999;
function mine(){try{var t=PS[cur].tw;return t&&t.root>=0&&t.root<5?t.root:-1}catch(e){return -1}}
function mapEl(){try{var v=MAPEL[mapSel];return v==null?-1:v}catch(e){return -1}}
function rel(a,b){ /* 0 trung tính · 1 ta khắc địch · 2 địch khắc ta · 3 địch sinh ta · 4 ta sinh địch */
  if(a<0||b==null||b<0)return 0;
  if(KHAC[a]===b)return 1;if(KHAC[b]===a)return 2;if(SINH[b]===a)return 3;if(SINH[a]===b)return 4;return 0}
function boss(e){return !!e&&(e.b>0||(e.dg&&e.sp=='boss'))}
function out(e){if(boss(e))return 1;var r=rel(mine(),e&&e.hx);return r==1?CF.khac:r==2?CF.biKhac:r==3?CF.duocSinh:r==4?CF.sinhDich:1}
function inc(e){try{if(boss(e))return CF.hdIn;var r=rel(mine(),e&&e.hx);return r==1?CF.inBiKhac:r==2?CF.inKhac:r==3?CF.inDuocSinh:r==4?CF.inSinhDich:1}catch(z){return 1}}
function say(e,r){try{if(fr-lastSay<90)return;lastSay=fr;
  var t=r==1?'⚔️ Tương Khắc ×'+CF.khac:r==2?'⚠️ Bị Khắc ×'+CF.biKhac:r==3?'✨ Tương Sinh ×'+CF.duocSinh:'';
  if(t)DT.push({x:e.x,y:(e.hh||100)*SZ+34,s:t,c:r==2?'#ff8a8a':'#ffe27a',l:42})}catch(z){}}
if(typeof dm=='function'){var _dm=dm;dm=function(e,m,sl){var f=1;try{f=out(e);if(f!==1)say(e,rel(mine(),e.hx))}catch(z){f=1}return _dm(e,m*f,sl)}}
if(typeof spawn=='function'){var _sp=spawn;spawn=function(){var n=E.length,r=_sp.apply(this,arguments);
  try{var h=mapEl();for(var j=n;j<E.length;j++)if(E[j]&&E[j].hx===undefined)E[j].hx=h}catch(z){}return r}}
/* chip nhỏ hiển thị hệ bản đồ ↔ hệ của bạn */
var chip=null;
function mk(){chip=document.createElement('div');chip.id='nhxChip';
  chip.style.cssText='position:fixed;top:3px;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;font:600 11px/1.2 system-ui,sans-serif;color:#fff;background:rgba(10,10,20,.55);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:2px 8px;white-space:nowrap;display:none;text-shadow:0 1px 2px #000';
  document.body.appendChild(chip)}
function upd(){try{
  if(!chip)mk();
  var b=mapEl();if(!started||vil||over||b<0){chip.style.display='none';return}
  var a=mine(),B=N[b],t;
  if(a<0)t=B.ic+' Hệ '+B.n+' · chưa có Linh Căn';
  else{var A=N[a],r=rel(a,b);
    t=A.ic+A.n+' ⇢ '+B.ic+B.n+' · '+(r==1?'Khắc ×'+CF.khac:r==2?'Bị khắc ×'+CF.biKhac:r==3?'Tương sinh ×'+CF.duocSinh:r==4?'Sinh địch ×'+CF.sinhDich:'Cân bằng')}
  chip.textContent=t;chip.style.display='block'}catch(z){}}
setInterval(upd,600);
function ic(e){try{if(boss(e))return N[5].ic+' ';var h=e&&e.hx;return h>=0&&h<5?N[h].ic+' ':''}catch(z){return''}}
function icMe(){try{var a=mine();return a>=0?N[a].ic+' ':''}catch(z){return''}}
window.NHX={boss:boss,ic:ic,icMe:icMe,N:N,KHAC:KHAC,SINH:SINH,MAPEL:MAPEL,CF:CF,mine:mine,mapEl:mapEl,rel:rel,out:out,inc:inc};
})();
