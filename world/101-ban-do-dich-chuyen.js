/* ===== 🧭 DỊCH CHUYỂN TỪ MỤC BẢN ĐỒ (world/101-ban-do-dich-chuyen.js · Fix304) =====
 * Mục 🗺 Bản đồ (tab 6 trong core/01p-bag-pet-ui.js) có thêm khối "Dịch chuyển nhanh" gồm 4 điểm đến:
 *   🏘 Làng Tân Thủ 1 · 🏯 Làng Tân Thủ 2 · 🌀 Linh Giới (Thành Thị Linh Giới) · ☁️ Tiên Giới (Thành Thị Tiên Giới)
 * - Bấm điểm đến → đóng bảng, tự thoát chế độ phụ đang ở (Mỏ, Linh Điền, Linh Giới, Tiên Giới, Làng 2...) về Làng 1,
 *   rồi đi tiếp tới nơi cần đến bằng chính hàm vào của từng nơi (TT2.enter / LCT.enter / TG.enter) nên luật cũ giữ nguyên.
 * - Chưa đủ điều kiện → nút khoá 🔒 kèm điều kiện, bấm vào chỉ hiện thông báo.
 * - Đang trong phụ bản / boss (dg) → không dịch chuyển, nhắc thoát trước.
 * Điều kiện (sửa ở REQ): Làng 1 luôn mở · Làng 2 = TT2.eligible() (Lv60 Phàm Thể trở lên) · Linh Giới & Tiên Giới = đã hạ Ma Thần (lgDone).
 * Tắt: bỏ <script> trong index.html và dòng BDT trong core/01p-bag-pet-ui.js (không có BDT thì bảng bản đồ như cũ).
 * Phụ thuộc: vil, started, bo, dg, P, DT, tg, lgDone, #vl, TT2 (100), LCT (10), TG (61); mọi thứ khác đều kiểm tra tồn tại. */
(function(){
'use strict';
if(typeof vil==='undefined'||typeof started==='undefined'||typeof DT==='undefined')return;

function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:150})}catch(e){}}
function lgOK(){try{return typeof lgDone==='function'&&!!lgDone()}catch(e){return false}}
function t2OK(){try{return !!(window.TT2&&TT2.eligible())}catch(e){return false}}
function t3OK(){try{return !!(window.TT3&&TT3.eligible())}catch(e){return false}}
function lmOK(){try{return !!(window.LMD&&LMD.api&&LMD.api.eligible())}catch(e){return false}}
function has(o,f){return !!(o&&typeof o[f]==='function')}

/* ---------- đang ở chế độ phụ nào? ---------- */
function onOf(){
  var r=[];
  try{if(has(window.TT2,'on')&&TT2.on())r.push('tt2')}catch(e){}
  try{if(has(window.TT3,'on')&&TT3.on())r.push('tt3')}catch(e){}
  try{if(has(window.LCT,'on')&&LCT.on())r.push('lct')}catch(e){}
  try{if(has(window.TG,'on')&&TG.on())r.push('tg')}catch(e){}
  try{if(has(window.TGQA,'on')&&TGQA.on())r.push('tgqa')}catch(e){}
  try{if(has(window.HONP,'on')&&HONP.on())r.push('honp')}catch(e){}
  try{if(typeof MN!=='undefined'&&has(MN,'isOn')&&MN.isOn())r.push('mn')}catch(e){}
  try{if(typeof FM!=='undefined'&&has(FM,'isOn')&&FM.isOn())r.push('fm')}catch(e){}
  return r;
}

/* ---------- điểm đến ---------- */
var REQ={
  l1:{ok:function(){return true}},
  l2:{ok:t2OK,short:'Cần Lv60 Phàm Thể',need:function(){return 'Cần Lv'+((window.TT2&&TT2.req)||60)+' Phàm Thể trở lên'}},
  l3:{ok:t3OK,short:'Cần Lv100',need:function(){return 'Cần Lv'+((window.TT3&&TT3.req)||100)+' để vào Làng Tân Thủ 3'}},
  ll:{ok:lgOK,short:'Cần hạ Ma Thần',need:function(){return 'Cần hạ Ma Thần để mở cổng Linh Giới'}},
  tg:{ok:lgOK,short:'Cần hạ Ma Thần',need:function(){return 'Cần hạ Ma Thần để mở cổng Linh Giới'}},
  lm:{ok:lmOK,short:'Cần Lv80 / Đạo Thể',need:function(){return 'Cần Lv80 hoặc đã lên Đạo Thể / Tiên Nhân để vào Linh Mạch Động'}}
};
var DEST=[
  {k:'l1',e:'🏘',n:'Làng Tân Thủ 1',   sub:'Thôn khởi đầu'},
  {k:'l2',e:'🏯',n:'Làng Tân Thủ 2',   sub:'Chiến Trường · Nghề'},
  {k:'l3',e:'❄',n:'Làng Tân Thủ 3',   sub:'Lv100 · 5 nhà khoá'},
  {k:'ll',e:'🌀',n:'Linh Giới',        sub:'Thành thị'},
  {k:'tg',e:'☁️',n:'Tiên Giới',        sub:'Thành thị'},
  {k:'lm',e:'🌀',n:'Linh Mạch Động',   sub:'Farm chung · Lv80'}
];
function here(k){
  var o=onOf();
  if(k==='tg')return o.indexOf('tg')>=0;
  if(k==='ll')return o.indexOf('lct')>=0;
  if(k==='l2')return o.indexOf('tt2')>=0;
  if(k==='l3')return o.indexOf('tt3')>=0;
  if(k==='lm')return !!(window.LMD&&LMD.api&&LMD.api.on());
  return !!vil&&!o.length;                       /* Làng 1: ở làng và không trong chế độ phụ nào */
}

/* ---------- về Làng 1: bấm nút 🏘 (đã được các module bọc) tới khi hết chế độ phụ ---------- */
function clickVL(){
  var b=document.getElementById('vl');
  if(b&&typeof b.onpointerdown==='function'){try{b.onpointerdown({stopPropagation:function(){},preventDefault:function(){}})}catch(e){}}
}
function toL1(){
  var n=0;
  while(onOf().length&&n++<6)clickVL();
  if(!vil)clickVL();
  return !!vil&&!onOf().length;
}

/* ---------- đi ---------- */
function go(k){
  if(!started)return;
  var q=REQ[k];if(!q)return;
  if(!q.ok()){say('🔒 '+q.need(),'#ffb4a0');return}
  if(dg){say('Hãy thoát phụ bản / boss trước khi dịch chuyển','#ffb4a0');return}
  if(here(k)){say('Bạn đang ở đây rồi','#ffe9a0');return}
  try{if(bo)tg()}catch(e){}                       /* đóng bảng bản đồ */
  if(!toL1()){say('Không thể dịch chuyển lúc này','#ffb4a0');return}
  try{
    if(k==='l2')TT2.enter();
    else if(k==='l3')TT3.enter();
    else if(k==='ll')LCT.enter();
    else if(k==='tg')TG.enter();
    else if(k==='lm')LMD.api.enter();
  }catch(e){try{console.warn('BDT',e)}catch(x){}}
}

/* ---------- giao diện gọn: lưới thẻ 2×2 + nhóm có thể gập ---------- */
(function(){var st=document.createElement('style');st.id='bdt-css';st.textContent=
'.bdt{display:flex;flex-direction:column;gap:6px}'
+'.bdt-h{font-weight:bold;font-size:13px;margin:4px 0 0;opacity:.95}'
+'.bdt-g{display:grid;grid-template-columns:1fr 1fr;gap:6px}'
+'.bdt-c{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:8px 9px;margin:0;min-height:50px;background:#5a4220;border:1px solid #b8964e;border-radius:7px;color:var(--fg);font:inherit;cursor:pointer}'
+'.bdt-g .bdt-c:last-child:nth-child(odd){grid-column:1/-1}'
+'.bdt-c b{font-size:13px}.bdt-c small{font-size:11px;opacity:.8}'
+'.bdt-c.at{background:#8a6420;border-color:#ffd870}.bdt-c.lk{opacity:.55;background:#3a3340;border-color:#6a6078}'
+'.bdt .st{margin:2px 0!important;font-size:12px}.bdt .st button{padding:6px 8px;font-size:12px}'
+'.bdt .dt{min-height:0;padding:2px 0;background:none;font-size:12px;opacity:.85}'
+'.bdt details{background:#140d0a;border-radius:6px;padding:0 6px}.bdt summary{cursor:pointer;padding:7px 0;font-size:13px;font-weight:bold}'
+'.bdt-f{font-size:11px;opacity:.65;line-height:1.4}';
document.head.appendChild(st)})();

function grid(){
  var h='<div class="bdt-h">🧭 Dịch chuyển nhanh</div><div class="bdt-g">';
  DEST.forEach(function(d){
    var q=REQ[d.k],ok=q.ok(),at=here(d.k);
    h+='<button class="bdt-c'+(at?' at':ok?'':' lk')+'" onclick="BDT.go(\''+d.k+'\')"><b>'+(ok?d.e:'🔒')+' '+d.n+'</b><small>'
      +(at?'đang ở đây':ok?d.sub:q.short)+'</small></button>';
  });
  return h+'</div>';
}
/* mr = danh sách bản đồ luyện cấp, lu = khối Linh Giới (lgUI), ft = dòng ghi chú cuối (từ core/01p) */
function panel(mr,lu,ft){
  var h='<div class="bdt">'+grid();
  h+='<details open><summary>⚔ Bản đồ luyện cấp</summary>'+mr+'</details>';
  if(lu)h+='<details'+(window.lg?' open':'')+'><summary>🌀 Chiến trường Linh Giới</summary>'+lu+'</details>';
  return h+'<div class="bdt-f">'+String(ft||'').replace(/<[^>]+>/g,'')+'</div></div>';
}

window.BDT={go:go,panel:panel,here:here,dest:DEST,req:REQ};
})();
