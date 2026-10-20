/* ===== ☯ CỘNG HƯỞNG MÔN PHÁI × LINH CĂN (world/122-cong-huong-mon-phai.js, Fix367) =====
 * Mỗi môn phái có một hệ chủ đạo (SECT_EL). So hệ đó với Linh Căn của người chơi (Tháp, PS[cur].tw.root) ra 4 bậc:
 *   3 Cộng Hưởng (cùng hệ) · 2 Tương Sinh (căn sinh hệ môn) · 1 Tiết Khí (hệ môn sinh căn) · 0 Bình Hoà / Xung Khắc (không thưởng, không phạt).
 * Mỗi bậc cho: +% sát thương kỹ năng môn phái (nhân thêm theo tầng Linh Căn 1→15) + cơ hội KÍCH HOẠT khi đòn trúng:
 *   • Hiệu ứng theo LINH CĂN: Hỏa thêm Thiêu · Mộc hồi máu · Thủy làm chậm + hồi MP · Kim xuyên giáp · Thổ choáng ngắn (boss: chỉ làm chậm).
 *   • Dấu ấn theo MÔN PHÁI (chỉ bậc 2–3): Phần Thiên +1 tầng Thiêu · Huyền Băng +1 Hàn Khí · Vạn Độc +1 tầng Độc · Thiên Kiếm cấp Kiếm Ý · Ngự Cổ cấp Cổ Độc · U Minh hút máu.
 *   • Bậc 3 + Linh Căn tầng 15 (Viên Mãn): tuyệt kỹ môn phái thêm +15% sát thương.
 * Cách làm (không sửa engine, không lưu thêm dữ liệu, không cần SQL): bọc MPK.run (world/99) rồi bọc A.hit của adapter của lần tung chiêu đó
 * (cùng chạy ở bản đồ thường world/72 và Tiên Giới world/81). Chỉ các chiêu đi qua MPK (cờ mk:1) mới được cộng hưởng.
 * Chỉnh cân bằng: CHM.CF (dmg / proc / icd / full) · SECT_EL. Tắt: bỏ <script> trong index.html (hoặc CHM.CF.enable=false).
 * API: CHM.info() · CHM.tier(sectId,root) · CHM.open() */
(function(){
'use strict';
if(window.CHM||typeof PS==='undefined'||!window.MPK||typeof MPK.run!=='function')return;

/* thứ tự hệ ở module này = thứ tự Linh Căn (systems/18): 0 Hỏa · 1 Mộc · 2 Thủy · 3 Kim · 4 Thổ */
var EL=[{n:'Hỏa',ic:'🔥',c:'#ff6a3a'},{n:'Mộc',ic:'🌿',c:'#5adf7a'},{n:'Thủy',ic:'💧',c:'#5ab8ff'},{n:'Kim',ic:'🪙',c:'#ffd76a'},{n:'Thổ',ic:'⛰️',c:'#c89a5a'}];
var MAPTW=[3,1,2,0,4];                       /* PS[cur].tw.root (Kim,Mộc,Thủy,Hỏa,Thổ) → thứ tự ở đây */
var SINH={1:0,0:4,4:3,3:2,2:1};              /* Mộc→Hỏa→Thổ→Kim→Thủy→Mộc */
var KHAC={3:1,1:4,4:2,2:0,0:3};              /* Kim→Mộc→Thổ→Thủy→Hỏa→Kim */
var SECT_EL={ptc:0,vdm:1,hbd:2,umt:2,tkt:3,ngc:4};
var SECT_N={umt:'U Minh Ma Tông',hbd:'Huyền Băng Điện',ptc:'Phần Thiên Cốc',tkt:'Thiên Kiếm Tông',vdm:'Vạn Độc Môn',ngc:'Ngự Cổ Thánh Điện'};
var SECT_E={umt:'🦇',hbd:'❄️',ptc:'🔥',tkt:'⚔️',vdm:'☠️',ngc:'🐛'};
var SIG={ptc:'+1 tầng Thiêu Đốt cho kẻ đang cháy',hbd:'+1 Hàn Khí cho kẻ đang bị băng',vdm:'+1 tầng Độc cho kẻ đang trúng độc',tkt:'cấp Kiếm Ý (+30% chiêu kế)',ngc:'kẻ bị đánh chịu Cổ Độc (+20% sát thương phái)',umt:'hút 0,8% sinh lực'};
var TN=['Bình Hoà','Tiết Khí','Tương Sinh','Cộng Hưởng'];
var CF=window.CHM_CF={enable:true,
  dmg:[0,.03,.07,.12],                       /* +% sát thương theo bậc (nhân hệ số tầng Linh Căn bên dưới) */
  lvBase:.7,                                  /* hệ số = lvBase + (1-lvBase) × tầng/15 → tầng 1 ≈ 72%, tầng 15 = 100% */
  proc:[0,.10,.18,.30],                       /* xác suất kích hoạt trên mỗi đòn trúng (trừ sát thương DoT) */
  icd:30,                                     /* khung hình tối thiểu giữa 2 lần kích hoạt (60 khung = 1 giây) */
  full:.15,                                   /* Linh Căn tầng 15 + bậc 3: tuyệt kỹ +15% */
  sayEvery:120};

/* ---------- đọc dữ liệu người chơi (mọi hàm đều an toàn) ---------- */
function sect(){try{return window.VPD?VPD.sect():(window.VP?VP.get():'')}catch(e){return ''}}
function root(){try{var t=PS[cur].tw;return(t&&t.root>=0&&t.root<5)?MAPTW[t.root]:-1}catch(e){return -1}}
function lvl(r){try{var c=PS[cur].lc,v=(c&&c.lv&&c.lv[r])|0;return Math.max(1,v)+(window.TTLB&&TTLB.n?(TTLB.n()|0):0)}catch(e){return 1}}
function tier(id,r){var e=SECT_EL[id];if(e==null||r==null||r<0)return 0;
  if(r===e)return 3;if(SINH[r]===e)return 2;if(SINH[e]===r)return 1;return 0}
function relName(id,r){var e=SECT_EL[id];if(e==null||r<0)return '';
  var t=tier(id,r);if(t>0)return TN[t];if(KHAC[r]===e)return 'Xung Khắc (không thưởng, không phạt)';return 'Bình Hoà'}
function ctx(id){
  if(!CF.enable||!id)return null;var r=root();if(r<0)return null;var t=tier(id,r);if(t<=0)return null;
  var L=Math.min(15,lvl(r)),k=CF.lvBase+(1-CF.lvBase)*L/15;
  return{id:id,r:r,t:t,L:L,dm:1+CF.dmg[t]*k,pr:CF.proc[t],full:(t===3&&L>=15)}}

/* ---------- kích hoạt ---------- */
var lastProc=-999,lastSay=-999;
function say(A,txt,col){try{if(A.now()-lastSay<CF.sayEvery)return;lastSay=A.now();A.say(txt,col)}catch(e){}}
function isBoss(A,h){try{return !!A.info(h).boss}catch(e){return false}}
function rider(A,h,c){
  try{switch(c.r){
    case 0:A.status(h,{brn:1});break;                                              /* Hỏa: thiêu */
    case 1:A.heal(.006);break;                                                     /* Mộc: sinh cơ */
    case 2:A.status(h,{sl:70});try{if(typeof mm==='function')P.mp=Math.min(mm(),P.mp+mm()*.01)}catch(e){}break; /* Thủy: chậm + hồi MP */
    case 3:A.status(h,{prc:.08});break;                                            /* Kim: xuyên giáp */
    case 4:A.status(h,isBoss(A,h)?{sl:60}:{stn:30});break}                         /* Thổ: choáng ngắn */
  }catch(e){}}
function sign(A,h,c){
  try{var n=A.now(),t=A.tag(h),id=c.id;
    if(id==='ptc'){if((t.bn|0)>0&&(t.bnu|0)>n){t.bn=Math.min(5,t.bn+1);t.bnu=Math.max(t.bnu,n+240);return true}}
    else if(id==='hbd'){if((t.cd|0)>0&&(t.cdu|0)>n){t.cd=Math.min(4,t.cd+1);t.cdu=Math.max(t.cdu,n+480);return true}}
    else if(id==='vdm'){if((t.ps|0)>0&&(t.psu|0)>n){t.ps=Math.min(10,t.ps+1);t.psu=Math.max(t.psu,n+300);return true}}
    else if(id==='tkt'){if((MPK.buff.tkt|0)<=n){MPK.buff.tkt=n+300;return true}}
    else if(id==='ngc'){t.vu=Math.max(t.vu|0,n+240);return true}
    else if(id==='umt'){A.heal(.008);return true}
  }catch(e){}return false}
function proc(A,h,c,o){
  if(!h||h.hp<=0||(o&&o.dot))return;
  var n=A.now();if(n-lastProc<CF.icd)return;if(Math.random()>=c.pr)return;lastProc=n;
  rider(A,h,c);
  var s=c.t>=2?sign(A,h,c):false;
  say(A,EL[c.r].ic+' '+(c.t===3?'Cộng Hưởng':TN[c.t])+(s?' · '+SECT_E[c.id]:''),EL[c.r].c)}

/* ---------- móc vào MPK.run ---------- */
var _run=MPK.run;
MPK.run=function(A,s){
  try{
    var c=ctx(A&&A.k||sect());
    if(c&&A&&!A.__chm){
      A.__chm=1;var oh=A.hit,m=c.dm*((c.full&&s&&s.ult)?1+CF.full:1);
      A.hit=function(h,mul,o){var r=oh.call(A,h,mul*m,o);proc(A,h,c,o);return r}}
  }catch(e){}
  return _run.apply(this,arguments)};

/* ---------- chip + bảng thông tin ---------- */
var chip=null,ov=null,last='';
function esc(s){return String(s).replace(/[&<>]/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[x]})}
function info(){var id=sect(),r=root();
  if(!id||r<0)return{sect:id||'',root:r,tier:0,text:''};
  var t=tier(id,r),c=ctx(id);
  return{sect:id,root:r,tier:t,name:TN[t],dmg:c?Math.round((c.dm-1)*1000)/10:0,proc:c?c.pr:0,full:!!(c&&c.full),L:lvl(r),
    text:SECT_E[id]+' '+(SECT_N[id]||id)+' × '+EL[r].ic+' '+EL[r].n+' — '+relName(id,r)}}
function guard(el){['pointerdown','touchstart','keydown','keyup'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()})})}
function mkChip(){chip=document.createElement('div');chip.id='chmChip';
  chip.style.cssText='position:fixed;top:22px;left:50%;transform:translateX(-50%);z-index:6;font:600 11px/1.2 system-ui,sans-serif;color:#fff;background:rgba(10,10,20,.55);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:2px 8px;white-space:nowrap;display:none;text-shadow:0 1px 2px #000;cursor:pointer';
  guard(chip);chip.addEventListener('click',open);document.body.appendChild(chip)}
function upd(){try{
  if(!chip)mkChip();
  var i=info(),show=i.tier>0&&(typeof started==='undefined'||started)&&(typeof over==='undefined'||!over);
  if(!show){if(chip.style.display!=='none')chip.style.display='none';return}
  var t='☯ '+i.name+' +'+i.dmg+'%'+(i.full?' ★':'');
  if(t!==last){last=t;chip.textContent=t;chip.style.borderColor=EL[i.root].c}
  chip.style.display='block'}catch(e){}}
function grid(){var h='<table style="border-collapse:collapse;width:100%;font-size:13px;text-align:center"><tr><th style="text-align:left;padding:3px">Môn \\ Căn</th>'
  +EL.map(function(e){return '<th style="padding:3px">'+e.ic+'</th>'}).join('')+'</tr>';
  var mine=sect(),r0=root();
  Object.keys(SECT_N).forEach(function(id){h+='<tr'+(id===mine?' style="background:rgba(255,255,255,.10)"':'')+'><td style="text-align:left;padding:3px">'+SECT_E[id]+' '+esc(SECT_N[id])+'</td>'
    +EL.map(function(e,r){var t=tier(id,r);return '<td style="padding:3px;'+(id===mine&&r===r0?'outline:1px solid '+e.c+';':'')+'">'+(t===3?'◎':t===2?'●':t===1?'○':'·')+'</td>'}).join('')+'</tr>'});
  return h+'</table><div style="font-size:12px;opacity:.8;margin-top:4px">◎ Cộng Hưởng · ● Tương Sinh · ○ Tiết Khí · · Bình Hoà/Xung Khắc</div>'}
function render(){
  var i=info(),b='';
  if(!i.sect)b='<p>Bạn chưa chọn môn phái (Vạn Pháp Tháp ở Tiên Giới).</p>';
  else if(i.root<0)b='<p>Bạn chưa có Linh Căn (chọn ở Tháp Thí Luyện) nên chưa có cộng hưởng.</p>';
  else{b='<p><b>'+esc(i.text)+'</b></p>';
    if(i.tier>0){b+='<p>Sát thương kỹ năng môn phái <b>+'+i.dmg+'%</b> (theo tầng Linh Căn '+Math.min(15,i.L)+'/15) · kích hoạt <b>'+Math.round(i.proc*100)+'%</b> mỗi đòn trúng.</p>'
      +'<p>🌀 Hiệu ứng căn: '+['bốc cháy','hồi máu','làm chậm + hồi MP','xuyên giáp','choáng ngắn'][i.root]+'</p>';
      if(i.tier>=2)b+='<p>'+SECT_E[i.sect]+' Dấu ấn môn phái: '+esc(SIG[i.sect])+'</p>';
      b+='<p>'+(i.tier===3?(i.full?'✨ Viên Mãn: tuyệt kỹ +'+Math.round(CF.full*100)+'%':'🔒 Linh Căn tầng 15 + Cộng Hưởng: tuyệt kỹ +'+Math.round(CF.full*100)+'%'):'')+'</p>'}
    else b+='<p>Hai hệ này chưa hợp nhau nên không có thưởng (cũng không bị phạt). Đổi môn phái hoặc xem bảng dưới.</p>'}
  return b+grid()}
function open(){
  try{if(ov){ov.remove();ov=null;return}
    ov=document.createElement('div');ov.id='chmOv';
    ov.style.cssText='position:fixed;inset:0;z-index:70;background:rgba(4,2,16,.82);display:flex;align-items:center;justify-content:center;font:14px/1.45 system-ui,sans-serif;color:#f2eaff';
    ov.innerHTML='<div style="background:#150f2a;border:1px solid #6a50b0;border-radius:12px;padding:14px;width:min(92vw,420px);max-height:86vh;overflow:auto"><div style="font-size:16px;font-weight:700;margin-bottom:6px">☯ Cộng Hưởng Môn Phái × Linh Căn</div>'+render()
      +'<button id="chmX" style="margin-top:8px;padding:6px 14px;border-radius:8px;border:0;background:#6a50b0;color:#fff">Đóng</button></div>';
    guard(ov);document.body.appendChild(ov);
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.id==='chmX'){ov.remove();ov=null}})}catch(e){}}

window.CHM={CF:CF,info:info,tier:tier,open:open,SECT_EL:SECT_EL};
try{setInterval(upd,1000)}catch(e){}
})();
