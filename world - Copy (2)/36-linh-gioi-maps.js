/* ===== 🌀 BẢN ĐỒ LINH GIỚI (6 bản đồ) =====
 * Cổng 1 (Chiến Trường) của Thành Thị Linh Giới mở bảng chọn bản đồ. Đạo Thể còn có danh sách bản đồ ngay trong tab 🗺 Bản đồ.
 *   1 Chiến Trường Linh Giới: quái hiện tại Lv80-100 (mọi nhân vật đã mở Linh Giới)
 *   2–5 quái MỚI theo cấp Đạo Thể: Lv1-20 · 21-40 · 41-60 · 61-80 (chỉ Đạo Thể, phải ĐỦ cấp Đạo Cảnh tối thiểu của bản đồ mới vào; đây là nơi duy nhất Đạo Thể nhận Đạo Linh/EXP → LGMAP.expOk())
 *   6 Thánh Địa: Đạo Thể Lv100, hiện TẠM KHÓA (HOLY.open=false)
 * Cơ chế: vẫn là lg=1 (mapSel=4, mi()=8 → Đạo Cảnh vẫn nhận EXP, tu vi ×LGX). Bản đồ chọn lưu PS[cur].lgm (0..4).
 * LR[4] (khoảng cấp quái) được đổi theo bản đồ mỗi khung; spawn() được bọc để tính lại máu/thủ/sức đánh theo LGS.
 * Quái mới: thêm 4 chủ đề vào LVX.LT (chỉ số 5-8: nền + bảng màu quái), tên quái trong window.LGNMN (05-demon-boss.js đọc e.lgi/LGI/LGNMN).
 * Chỉnh độ khó: LGS. Mở Thánh Địa: HOLY.open=true và viết hàm vào bản đồ ở go(5). */
(function(){
'use strict';
if(typeof LR==='undefined'||typeof lgEnter!=='function'||!window.LCT||!window.LVX)return;
var HOLY={open:false,minLv:100},LR0=[80,100];
var MAPS=[
 {n:'Chiến Trường Linh Giới',e:'⚔️',c:'#5ff0ff',lv:[80,100],d:'Quái hiện tại · Đạo Thể đánh ở đây không nhận Đạo Linh'},
 {n:'Tử Vân Linh Cảnh',e:'☁️',c:'#e0a0ff',lv:[1,20],d:'Vân Linh, linh lang tím · cần Đạo Thể Lv1'},
 {n:'Kim Quang Thiên Môn',e:'🏯',c:'#ffe27a',lv:[21,40],d:'Giáp vàng, kim lang · cần Đạo Thể Lv21'},
 {n:'Thủy Tinh Linh Hải',e:'🌊',c:'#7ff0ff',lv:[41,60],d:'Lưu ly, hải linh · cần Đạo Thể Lv41'},
 {n:'Thiên Hỏa Linh Nguyên',e:'🔥',c:'#ff9a5a',lv:[61,80],d:'Thiên hỏa, xích diễm · cần Đạo Thể Lv61'},
 {n:'Thánh Địa',e:'🌟',c:'#fff0a0',lv:[81,100],d:'Đạo Thể Lv100 mới vào được · tạm thời khóa',holy:1}];
/* Độ khó quái Đạo Thể (bản đồ 2–5). hpn = MÁU CỐ ĐỊNH của quái thường; Tinh Anh = ×LGE.e, Boss = ×LGE.b.
   m=cấp bản đồ trong công thức gốc · df=nhân thủ · at=nhân sức đánh (quái đánh theo (1+m*.35), trừ thẳng giáp người chơi; Tinh Anh ×1,5 và Boss ×2 thêm) · exp=nhân Đạo Linh */
var LGS=[null,{m:1.2,hpn:1e5,df:1.8,at:12,exp:.5},{m:2,hpn:2e5,df:2,at:14,exp:.5},{m:3,hpn:4e5,df:2.2,at:16,exp:.5},{m:4.2,hpn:8e5,df:2.4,at:20,exp:.5}],LGE={e:3,b:10};
var LGR=[LR0,[1,20],[21,40],[41,60],[61,80]];
/* chủ đề nền + bảng màu quái (chỉ số LT 5..8) */
var TH=[
 {n:'Tử Vân Linh Cảnh',sky:['#0e0620','#2a1050','#5a2a8a','#a85ab0','#f0a8d8'],neb:'210,120,255',moon:['#fff0ff','#a860d0','255,200,255'],far:'#3a1a5a',near:'#1a0a30',win:'255,200,240',rune:'#ffb0f0',runeG:'#d060e0',pil:['#080410','#2a1644','#0c0618'],fl:['#2e1a4a','#0a0418'],crack:'255,170,240',crackG:'#e070ff',circ:'#ffe0ff',circG:'#c070ff',cgb:'220,130,255',ca:.4,fx:'wisp',fc:['rgba(255,230,255,.9)','rgba(220,120,255,.7)','rgba(160,60,220,0)'],m:{a1:'#7a5a9a',a2:'#1c1030',s1:'#c080e0',s2:'#3a1a5a',gl:'#ffb0f0',gg:'#d060e0',ey:'#ff90f0',e2:'#fff0ff'}},
 {n:'Kim Quang Thiên Môn',sky:['#140c02','#3a2606','#8a5a10','#d8a028','#fff0a0'],neb:'255,200,80',moon:['#fffbe0','#d8a830','255,230,140'],far:'#4a3410',near:'#241808',win:'255,230,150',rune:'#ffe27a',runeG:'#ffb020',pil:['#0c0802','#3a2a0c','#100a04'],fl:['#3a2a10','#100a04'],crack:'255,225,120',crackG:'#ffc030',circ:'#fff4c0',circG:'#ffd050',cgb:'255,210,90',ca:.42,fx:'ember',fc:['rgba(255,250,200,.95)','rgba(255,200,60,.8)','rgba(255,150,10,0)'],m:{a1:'#8a7040',a2:'#241a08',s1:'#e0b040',s2:'#4a3208',gl:'#fff0a0',gg:'#ffc020',ey:'#fff080',e2:'#fffbe0'}},
 {n:'Thủy Tinh Linh Hải',sky:['#02101c','#06304a','#0e6a88','#28b0c8','#a8f0f0'],neb:'60,220,230',moon:['#e8ffff','#40a0c0','160,255,255'],far:'#0c3a50',near:'#062030',win:'150,255,255',rune:'#80f8ff',runeG:'#20c8e0',pil:['#020c12','#0c3448','#04121a'],fl:['#0e3a50','#04141c'],crack:'120,255,255',crackG:'#30e0f0',circ:'#d0ffff',circG:'#40d8f0',cgb:'70,220,240',ca:.42,fx:'snow',fc:['rgba(230,255,255,.9)','rgba(80,230,240,.7)','rgba(20,150,200,0)'],m:{a1:'#4a8a9a',a2:'#0c2a34',s1:'#58d0e0',s2:'#0e4a5a',gl:'#a0ffff',gg:'#20d0e8',ey:'#80ffff',e2:'#f0ffff'}},
 {n:'Thiên Hỏa Linh Nguyên',sky:['#1a0204','#4a0a10','#a01c14','#e84a20','#ffb060'],neb:'255,100,60',moon:['#fff0d0','#e86a20','255,190,100'],far:'#4a1010',near:'#240608',win:'255,210,130',rune:'#ffd070',runeG:'#ff6a20',pil:['#0c0204','#3a0e10','#120406'],fl:['#3a1010','#120406'],crack:'255,190,80',crackG:'#ff5a10',circ:'#ffe8c0',circG:'#ff7a30',cgb:'255,130,60',ca:.46,fx:'lava',fc:['rgba(255,245,190,.95)','rgba(255,130,30,.85)','rgba(255,60,10,0)'],m:{a1:'#8a4a30',a2:'#2a0c08',s1:'#f06030',s2:'#4a1008',gl:'#ffe080',gg:'#ff8020',ey:'#ffd060',e2:'#fff4d0'}}];
var NM=[
 {gob:'Vân Linh Tử',wolf:'Tử Vân Lang',scorp:'Linh Mạch Hạt',arch:'Linh Cung Thủ',mage:'Vân Pháp Sư',ogre:'Vân Linh Tướng',golem:'Linh Thạch Cự Nhân'},
 {gob:'Kim Giáp Quỷ',wolf:'Kim Quang Lang',scorp:'Kim Cương Hạt',arch:'Kim Vũ Xạ Thủ',mage:'Kim Quang Pháp Sư',ogre:'Kim Giáp Tướng',golem:'Hoàng Kim Cự Nhân'},
 {gob:'Thủy Tinh Quỷ',wolf:'Hải Linh Lang',scorp:'Lam Tinh Hạt',arch:'Lưu Ly Xạ Thủ',mage:'Hải Linh Pháp Sư',ogre:'Thủy Tinh Tướng',golem:'Lưu Ly Cự Nhân'},
 {gob:'Thiên Hỏa Quỷ',wolf:'Xích Diễm Lang',scorp:'Hỏa Tinh Hạt',arch:'Diễm Cung Thủ',mage:'Thiên Hỏa Pháp Sư',ogre:'Xích Diễm Tướng',golem:'Thiên Hỏa Cự Nhân'}];
var LT=LVX.LT;if(LT.length<9){TH.forEach(function(t,i){LT[5+i]=Object.assign({},LT[1],t)})}
window.LGNMN={};NM.forEach(function(n,i){window.LGNMN[5+i]=n});

function on(){try{return !!(window.HDAO&&HDAO.on())}catch(e){return false}}
function gm(){return (PS[cur].lgm|0)}
Object.defineProperty(window,'LGI',{configurable:true,get:function(){try{return(lg&&!dg&&gm()>0&&gm()<5)?4+gm():null}catch(e){return null}}});
function say(t,c){try{DT.push({x:P.x,y:200,s:t,c:c||'#8fe8ff',g:1,l:130})}catch(e){}}
function need(i){return MAPS[i].holy?HOLY.minLv:MAPS[i].lv[0]}
function canMap(i){if(i===0)return true;if(!on()||P.lv<need(i))return false;return MAPS[i].holy?HOLY.open:true}
function why(i){var m=MAPS[i];if(i===0)return'';if(!on())return'🔒 Chỉ dành cho Đạo Thể';if(P.lv<need(i))return'🔒 Cần Đạo Thể Lv'+need(i)+' (hiện Lv'+P.lv+')';if(m.holy&&!HOLY.open)return'🔒 Tạm khóa · mở khi Đạo Thể Lv'+HOLY.minLv;return''}
/* Đạo Thể chỉ nhận Đạo Linh (EXP) ở bản đồ Đạo Thể: Linh Giới bản đồ 2–6 (HDAO.xg đọc hàm này) */
function expMul(){try{return (LGS[gm()]&&LGS[gm()].exp)||1}catch(e){return 1}}
function expOk(){try{return !!(lg&&!dg&&gm()>=1&&gm()<=5)}catch(e){return false}}

/* ---------- vào bản đồ ---------- */
function go(i){
  if(!started||!lgDone()){return}
  if(!canMap(i)){say(why(i)||'Chưa vào được','#e0b0ff');return}
  PS[cur].lgm=i;
  try{if(LCT.on())LCT.leave();if(DT.length&&/Về Làng/.test(DT[DT.length-1].s||''))DT.pop()}catch(e){}
  vil=0;lgEnter();
  say('🌀 '+MAPS[i].n+' · quái Lv'+MAPS[i].lv[0]+'-'+MAPS[i].lv[1]);close();
}
window.lgMapGo=go;

/* ---------- khoảng cấp quái + chỉ số quái mới ---------- */
var _step=step;step=function(){var w=(lg&&gm()>0&&gm()<5)?LGR[gm()]:LR0;if(LR[4]!==w)LR[4]=w;_step()};
var _spawn=spawn;spawn=function(i){var n0=E.length;_spawn(i);
  try{if(!lg||dg||vil||E.length===n0)return;var g_=gm();if(g_<1||g_>4)return;var e=E[E.length-1];if(!e||e.k==='pal')return;
    var s_=LGS[g_],L=e.lv||1,b=e.b|0,hm=(MS[e.k]&&MS[e.k].hm)||1;
    e.hp=e.max=s_.hpn*(b===3?LGE.b:b?LGE.e:1);
    e.df=(8+L*2.2)*(1+s_.m*.4)*(b===3?2.3:b?1.8:1)*s_.df;e.m=((1+.35*s_.m)*s_.at*(b===3?2:b?1.5:1)-1)/.35;e.lgi=4+g_}catch(x){}};

/* ---------- giao diện: bảng chọn bản đồ ---------- */
var ov;
function card(i){var m=MAPS[i],ok=canMap(i),cur_=lg&&gm()===i&&!m.holy,w=why(i);
  return'<div data-i="'+i+'" style="display:flex;gap:10px;align-items:center;border:2px solid '+(cur_?'#ffe27a':ok?m.c:'#4a3828')+';border-radius:12px;padding:9px;margin:7px 0;background:'+(cur_?'#3a2a10':'#140d0a')+';opacity:'+(ok||m.holy?1:.55)+';cursor:pointer"><div style="font-size:30px;width:38px;text-align:center">'+(ok||!m.holy?m.e:'🔒')+'</div><div style="flex:1"><b style="color:'+m.c+'">'+(i+1)+'. '+m.n+'</b><div style="font-size:12px;opacity:.85">Quái Lv'+m.lv[0]+'-'+m.lv[1]+(m.holy?'':' · '+(i===0?'quái hiện tại':'quái mới'))+'</div><div style="font-size:12px;opacity:.8">'+(w||m.d)+(cur_?' · <b style="color:#7be07a">đang ở đây</b>':'')+'</div></div></div>'}
function html(){var h='<div style="font-size:12.5px;opacity:.85;margin-bottom:4px">'+(on()?'Đạo Thể: phải đủ cấp Đạo Cảnh mới vào được bản đồ 2–6, và chỉ tăng Đạo Linh (EXP) ở các bản đồ này. Quái bản đồ 2–5 cực mạnh: quái thường 100k máu ở bản đồ 2 (gấp đôi mỗi bản đồ sau), Tinh Anh ×3, Boss ×10, sức đánh rất cao, Đạo Linh nhận ×0.5. Trang bị thấp gần như không đánh nổi.':'Bản đồ 2–6 chỉ dành cho Đạo Thể (đã hợp đạo).')+'</div>';for(var i=0;i<MAPS.length;i++)h+=card(i);return h}
function open(){if(!started)return;if(!ov){ov=document.createElement('div');ov.id='lgm-ov';ov.style.cssText='position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:rgba(8,5,2,.82);padding:12px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#f2e3b3';
    ['pointerdown','touchstart','keydown','keyup'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
    ov.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('[data-i]');if(c)go(+c.dataset.i);else if(e.target===ov||(e.target.closest&&e.target.closest('[data-x]')))close()});document.body.appendChild(ov)}
  ov.innerHTML='<div style="max-width:440px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #b8964e;border-radius:14px;background:rgba(18,12,9,.97);padding:14px"><h2 style="margin:0 0 6px;color:#ffe27a;font-size:19px">🌀 Bản đồ Linh Giới</h2>'+html()+'<button data-x="1" style="width:100%;margin-top:8px;background:#3a3a3a;color:#fff;border:1px solid #777;border-radius:8px;padding:8px">Đóng</button></div>';ov.style.display='flex'}
function close(){if(ov)ov.style.display='none'}
window.LGMAP={open:open,close:close,go:go,maps:MAPS,cfg:LGS,elite:LGE,holy:HOLY,expOk:expOk,expMul:expMul};

/* cổng 1 mở bảng chọn bản đồ */
var g0=LCT.gates&&LCT.gates[0];if(g0){g0.sub='Chọn bản đồ · chạm để vào';g0.go=function(){open()}}

/* danh sách bản đồ Linh Giới trong tab 🗺 Bản đồ (Đạo Thể) */
var _lgUI=lgUI;lgUI=function(){var h=_lgUI();try{if(!on()||!lgDone())return h;
  var s='<div class="dt">🌀 <b>Bản đồ Linh Giới</b> · chạm để vào</div>';
  for(var i=0;i<MAPS.length;i++){var m=MAPS[i],ok=canMap(i),c=lg&&gm()===i&&!m.holy;s+='<div class="st" style="margin:4px 0"><button style="width:100%;text-align:left;'+(c?'background:#8a6420':'')+(ok||m.holy?'':'opacity:.5')+'" onclick="lgMapGo('+i+')">'+(m.holy&&!ok?'🔒':m.e)+' '+(i+1)+'. '+m.n+' · quái Lv'+m.lv[0]+'-'+m.lv[1]+(m.holy?' · '+why(i):i===0?' · quái hiện tại':' · quái mới')+(c?' (đang ở đây)':'')+'</button></div>'}
  return s}catch(e){return h}};
})();
