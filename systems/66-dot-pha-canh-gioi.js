/* ===== ⚡ ĐỘT PHÁ CẢNH GIỚI v2 (window.DP) — systems/66-dot-pha-canh-gioi.js =====
 * Làm lại điều kiện đột phá cảnh giới tu tiên. Engine (core/01i-combat-core.js, ZC.bt) chỉ gọi 3 móc:
 *   DP.check(k) → '' nếu đủ điều kiện, ngược lại là câu báo thiếu gì (k = chỉ số cảnh giới ĐÍCH: 0 Luyện Khí … 7 Đại Thừa)
 *   DP.spend(k) → trừ nguyên liệu/đan, gọi ngay sau khi trừ vàng (cùng lúc với vàng, kể cả khi đột phá thất bại)
 *   DP.req(t) / DP.bolts(t) / DP.dmgTx(t) → chữ hiển thị trong tab Tu tiên
 * Điều kiện (tài nguyên khác — vàng, tỉ lệ — giữ nguyên trong core COST/RATE):
 *   Luyện Khí  : không cần gì thêm
 *   Trúc Cơ    : 10 Trúc Cơ Đan
 *   Kim Đan    : 10 Kim Đan Đan
 *   Nguyên Anh : 10 Nguyên Anh Đan + 10 Nguyên Liệu Đúc Nguyên Anh (Boss rơi 10%/lần) — lôi kiếp 3 đạo (cơ chế cũ)
 *   Hoá Thần   : 10 Hoá Thần Đan — lôi kiếp 6 đạo, mỗi đạo 10–25% HP tối đa (core/01h-skill-fx.js: trib)
 *   Luyện Hư   : 10 Luyện Hư Đan — lôi kiếp 9 đạo, cùng cách tính sát thương như Hoá Thần
 *   Hợp Thể    : (cũ) Linh Căn viên mãn + cảnh giới Hồn Phách (đúc linh hồn) đạt Hợp Thể — lôi kiếp 10 đạo (cơ chế cũ)
 *   Đại Thừa   : Hồn Phách đạt Đại Thừa + Thần Thể viên mãn — lôi kiếp 10 đạo (cơ chế cũ)
 * Đan cảnh giới: luyện ở tab ⚗ Luyện Đan (module systems/08), nguyên liệu rơi từ Boss (cùng các loại Boss rơi hạt giống).
 * Nguyên liệu của một cảnh giới CHỈ rơi khi nhân vật đang chơi chưa đạt cảnh giới đó (đột phá thành công là hết rơi).
 * Dữ liệu lưu: nguyên liệu trong FM.get().herbs, đan trong FM.get().pills (đã được lưu/tải cùng Linh Điền) — không thêm trường save mới.
 * Chỉnh cân bằng: khối CF. Phụ thuộc: FM (08, cần FM.PM/FM.HM/FM.PL), ZC, drop(), HONP (world/57, tuỳ chọn), lcMax (18, tuỳ chọn). */
(function(){
'use strict';
if(typeof ZC==='undefined'||typeof FM==='undefined'||!FM.PM||!FM.HM||!FM.PL||typeof PS==='undefined')return;

var CF={
 pillNeed:10,                     /* số đan cảnh giới tiêu hao mỗi lần đột phá */
 forgeNeed:10,                    /* số Nguyên Liệu Đúc Nguyên Anh khi đột phá Nguyên Anh */
 matPer:2,                        /* nguyên liệu đan cần cho 1 viên đan */
 brewOk:.9,                       /* tỉ lệ luyện đan thành công */
 drop:[.15,.25,.30,.25,.40],      /* tỉ lệ rơi 1 nguyên liệu đan / mỗi loại: [Tinh Anh, Boss Thế Giới, Boss Sử Thi, Trùm Hầm Ngục, Ma Thần] */
 forgeDrop:.10                    /* tỉ lệ rơi 1 Nguyên Liệu Đúc Nguyên Anh ở MỌI loại Boss */
};
/* k = cảnh giới đích. pill/mat = id đan & nguyên liệu; g0 = vàng cơ bản mỗi viên (nhân (cảnh giới+2)² như các đan khác) */
var RL={
 1:{pill:'dtc',mat:'mtc',pn:'Trúc Cơ Đan', mn:'Nguyên Liệu Trúc Cơ Đan', e:'🟡',me:'🪷',c:'#ffd76a',g0:50,  rn:'Trúc Cơ'},
 2:{pill:'dkd',mat:'mkd',pn:'Kim Đan Đan', mn:'Nguyên Liệu Kim Đan',    e:'🟠',me:'🔸',c:'#ffb040',g0:100, rn:'Kim Đan'},
 3:{pill:'dna',mat:'mna',pn:'Nguyên Anh Đan',mn:'Nguyên Liệu Nguyên Anh Đan',e:'🟣',me:'🔮',c:'#c090ff',g0:200,rn:'Nguyên Anh',forge:1},
 4:{pill:'dht',mat:'mht',pn:'Hoá Thần Đan',mn:'Nguyên Liệu Hoá Thần Đan',e:'🔴',me:'🌠',c:'#ff7ad9',g0:400, rn:'Hoá Thần'},
 5:{pill:'dlh',mat:'mlh',pn:'Luyện Hư Đan',mn:'Nguyên Liệu Luyện Hư Đan',e:'🔵',me:'🌀',c:'#5ff0d8',g0:800, rn:'Luyện Hư'}
};
var FORGE={id:'mdna',n:'Nguyên Liệu Đúc Nguyên Anh',e:'🧿',c:'#d8b8ff'};

/* ---------- đăng ký nguyên liệu (chỉ vào HM để hiển thị tên, KHÔNG vào HB nên không thành cây trồng) & đan (PL + PM) ---------- */
function reg(){
 for(var k in RL){var r=RL[k];
  if(!FM.HM[r.mat])FM.HM[r.mat]={id:r.mat,n:r.mn,e:r.me,c:r.c};
  if(!FM.PM[r.pill]){
   var rc={};rc[r.mat]=CF.matPer;
   var p={id:r.pill,n:r.pn,e:r.e,k:'rl',sc:CF.brewOk,rc:rc,g0:r.g0,rn:r.rn,
    d:'Đan đột phá <b>'+r.rn+'</b>: cần <b>'+CF.pillNeed+' viên</b>, tự tiêu hao khi đột phá (tab Tu tiên). Nguyên liệu rơi từ Boss, chỉ rơi khi chưa đạt '+r.rn+'.',
    ex:'tiêu hao khi đột phá '+r.rn};
   FM.PL.push(p);FM.PM[r.pill]=p;
  }
 }
 if(!FM.HM[FORGE.id])FM.HM[FORGE.id]={id:FORGE.id,n:FORGE.n,e:FORGE.e,c:FORGE.c};
}
reg();

function S(){try{return FM.get()}catch(e){return {herbs:{},pills:{}}}}
function hv(id){return(S().herbs[id]|0)}
function pl(id){return(S().pills[id]|0)}
function soul(){try{return(window.HONP&&HONP.chosen&&HONP.chosen())||null}catch(e){return null}}
function theMax(){try{return HONP.cfg.theMax|0}catch(e){return 10}}
function lcOk(){try{return typeof window.lcMax=='function'&&!!window.lcMax()}catch(e){return false}}
var SN=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];

/* danh sách điều kiện của cảnh giới đích k: [{ok, tx}] */
function list(k){
 var o=[],r=RL[k],d;
 if(r){
  o.push({ok:pl(r.pill)>=CF.pillNeed,tx:r.e+' '+r.pn+' '+pl(r.pill)+'/'+CF.pillNeed,
   msg:'💊 Cần '+CF.pillNeed+' '+r.pn+' ('+pl(r.pill)+'/'+CF.pillNeed+'). Luyện ở tab ⚗ Luyện Đan từ '+r.mn+' (rơi từ Boss).'});
  if(r.forge)o.push({ok:hv(FORGE.id)>=CF.forgeNeed,tx:FORGE.e+' '+FORGE.n+' '+hv(FORGE.id)+'/'+CF.forgeNeed,
   msg:'🧿 Cần '+CF.forgeNeed+' '+FORGE.n+' ('+hv(FORGE.id)+'/'+CF.forgeNeed+'). Boss rơi '+Math.round(CF.forgeDrop*100)+'%/lần.'});
 }
 if(k==6){
  o.push({ok:lcOk(),tx:'🌟 Linh Căn viên mãn',msg:''});
  d=soul();
  o.push({ok:!!(d&&(d.r|0)>=7),tx:'🔮 Linh hồn (Hồn Phách) đạt Hợp Thể'+(d?' · hiện: '+SN[d.r|0]:' · chưa chọn Hồn Phách'),
   msg:'🔮 Đột phá Hợp Thể cần cảnh giới đúc linh hồn (Hồn Phách) đạt Hợp Thể'+(d?' (hiện '+SN[d.r|0]+')':' — chưa chọn Hồn Phách')+'. Tu luyện tại 🧘 Bế Quan Đài.'});
 }
 if(k==7){
  d=soul();
  o.push({ok:!!(d&&(d.r|0)>=8),tx:'🔮 Linh hồn (Hồn Phách) đạt Đại Thừa'+(d?' · hiện: '+SN[d.r|0]:' · chưa chọn Hồn Phách'),
   msg:'🔮 Đột phá Đại Thừa cần cảnh giới linh hồn (Hồn Phách) đạt Đại Thừa'+(d?' (hiện '+SN[d.r|0]+')':' — chưa chọn Hồn Phách')+'.'});
  o.push({ok:!!(d&&(d.b|0)>=theMax()),tx:'🔥 Đúc Thần Thể viên mãn '+(d?(d.b|0):0)+'/'+theMax(),
   msg:'🔥 Đột phá Đại Thừa cần đúc Thần Thể viên mãn ('+(d?(d.b|0):0)+'/'+theMax()+') tại 🧘 Bế Quan Đài.'});
 }
 return o;
}

/* ---------- 3 móc cho engine ---------- */
function check(k){
 var a=list(k);
 for(var i=0;i<a.length;i++)if(!a[i].ok&&a[i].msg)return a[i].msg;
 return '';
}
function spend(k){
 var r=RL[k];if(!r)return;
 var s=S();
 s.pills[r.pill]=Math.max(0,(s.pills[r.pill]|0)-CF.pillNeed);
 if(r.forge)s.herbs[FORGE.id]=Math.max(0,(s.herbs[FORGE.id]|0)-CF.forgeNeed);
 try{if(typeof sv=='function')sv()}catch(e){}
}
function req(t){
 var a=list(t);if(!a.length)return '';
 var h='<div style="margin:5px 0;padding:5px 7px;border:1px dashed #b8964e;border-radius:7px;background:#0006">📋 <b>Điều kiện đột phá</b><br>';
 a.forEach(function(x){h+='<span style="color:'+(x.ok?'#8fe08f':'#ff9a8a')+'">'+(x.ok?'✔':'✖')+' '+x.tx+'</span><br>'});
 var r=RL[t];
 if(r)h+='<small style="opacity:.75">Nguyên liệu rơi từ Boss, luyện đan ở tab ⚗ ('+CF.matPer+' nguyên liệu → 1 đan). Đột phá xong sẽ không còn rơi nguyên liệu '+r.rn+'. Đan/nguyên liệu bị tiêu hao cả khi đột phá thất bại.</small><br>';
 return h+'</div>';
}
function bolts(t){return t>=6?10:t==5?9:t==4?6:t==3?3:0}
function dmgTx(t){
 if(t==4||t==5)return ' (mỗi đạo 10–25% HP tối đa, giảm bởi chỉ số Giảm sát thương & Tị Lôi Đan)';
 if(t>=6)return ' (7–15% HP tối đa mỗi đạo)';
 return '';
}

/* ---------- Rơi nguyên liệu từ Boss (bọc drop() sau cùng, cùng cách phân loại Boss với FM.seedDrop) ---------- */
function tier(e){
 if(!e)return -1;
 if(e.mt)return 4;
 if(e.dg)return e.k=='boss'?3:-1;
 if(e.b==3)return 2;
 if(e.b==2)return 1;
 if(e.b==1)return 0;
 return -1;
}
function matDrop(e){
 var ti=tier(e);if(ti<0)return;
 var cr=ZC.rI(),s=S(),n=0;
 function give(id,nm,em,col){
  s.herbs[id]=(s.herbs[id]|0)+1;
  try{DT.push({x:e.x+(n%2?70:-70),y:215+n*26,s:em+' '+nm,c:col,l:130})}catch(x){}
  n++;
 }
 for(var k in RL){
  var r=RL[k];
  if(cr>=+k)continue;                           /* đã đột phá thành công cảnh giới này → hết rơi */
  if(R()<CF.drop[ti])give(r.mat,r.mn,r.me,r.c);
 }
 if(cr<3&&R()<CF.forgeDrop)give(FORGE.id,FORGE.n,FORGE.e,FORGE.c);
}
if(typeof drop==='function'){var _d=drop;drop=function(e){_d.apply(this,arguments);try{matDrop(e)}catch(x){}}}

window.DP={check:check,spend:spend,req:req,bolts:bolts,dmgTx:dmgTx,cfg:CF,realms:RL,list:list};
})();
