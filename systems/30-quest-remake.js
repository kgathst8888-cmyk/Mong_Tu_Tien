/* ===================================================================
   NHIỆM VỤ — LÀM LẠI THEO CỐT TRUYỆN + TĂNG MẠNH VÀNG / EXP  (systems/30-quest-remake.js)
   Nạp SAU systems/29-quest-plus.js. Không sửa engine: chỉ thay dữ liệu QCH và bọc vài hàm qs*.
   - Chủ tuyến viết lại thành 4 hồi: Thanh Vân Tiên Thôn → Hư Không & Ma Thần → Linh Giới → Tiên Giới.
   - Mục tiêu mới đọc thẳng trạng thái nhân vật (Linh Giới, Đạo Thể, Ý Cảnh, Hồn Phách, Chuyển Thế)
     hoặc đếm sự kiện QE('ks'|'td'|'acma'|'pbmt'|'tgk') (móc 1 dòng ở các module boss).
   - Quà vàng / EXP nhân hệ số MG / MX (chỉnh ngay bên dưới). `G` = vàng cố định, không nhân theo cấp.
   - Save cũ: tự đổi chỉ số chương theo tên chương; chương mới chưa làm sẽ hiện ra để nhận (Nhận tất cả).
   =================================================================== */
(function(){
if(typeof QCH=='undefined'||typeof qsGive=='undefined'||window.__QREMAKE)return;
window.__QREMAKE=1;
var MG=10,MX=16;                         /* hệ số nhân vàng / EXP cho MỌI quà nhiệm vụ */

/* ---------- 1. mục tiêu mới: đọc trạng thái nhân vật ---------- */
var _p=window.qsP;
window.qsP=function(o,sn){
  var t=o[0],p=PS[cur];
  try{
    if(t=='lg')return p.lg?1:0;
    if(t=='hd')return window.HDAO&&HDAO.on()?1:0;
    if(t=='ct')return window.CTHE&&CTHE.on()?1:0;
    if(t=='yc'){var y=p.yc;return y&&y.r>=1?(y.r-1)*3+(y.s|0)+1:0}
    if(t=='hp'){var h=p.hpc;return h&&h.t>=0&&h.t<4?1:0}
    if(t=='hpr'){var h2=p.hpc;return h2&&h2.t>=0&&h2.t<4?(h2.r|0)+1:0}
  }catch(e){return 0}
  return _p(o,sn);
};

/* ---------- 2. chủ tuyến mới ---------- */
function N(t,s,o,r){return{t:t,s:s,o:o,r:r}}
var OLDT=QCH.map(function(c){return c.t});
var L=[
/* ===== HỒI 1 · THANH VÂN TIÊN THÔN ===== */
N('Hoang Mạc Sơ Hiện','Trưởng Lão Thanh Vân: "Hư Không nứt vỡ, quái vật tràn vào Hoang Mạc. Đạo hữu hãy ra tay dọn sạch bìa làng trước đã."',[['kill',20,'Hạ {n} quái Hư Không'],['lv',5,'Đạt cấp {n}']],{g:80,x:80,h:3,m:3,kk:1}),
N('Linh Khí Nhập Thể','"Muốn đứng vững nơi Hoang Mạc, phải dẫn linh khí vào thể. Hãy tu luyện đột phá và làm quen với chiêu thức."',[['rn',1,'Đột phá cảnh giới Luyện Khí'],['cast',30,'Thi triển {n} kỹ năng']],{g:120,x:120,p:3,f:3}),
N('Dưỡng Sinh Nhập Môn','Lão Dược Sư: "Thuốc là mạng thứ hai. Dùng đúng lúc, ngươi sống lâu hơn kẻ liều lĩnh."',[['pot',3,'Dùng {n} bình thuốc'],['kill',60,'Hạ {n} quái Hư Không'],['lv',8,'Đạt cấp {n}']],{g:140,x:140,h:5,m:5}),
N('Thử Luyện Tinh Anh','"Trong bầy quái có kẻ mạnh hơn hẳn, mang ánh sao trên trán. Hạ được chúng mới đủ tư cách rời làng."',[['elite',5,'Hạ {n} quái Tinh Anh ⭐'],['lv',15,'Đạt cấp {n}']],{g:170,x:170,e:[2],h:5}),
N('Chuyển Chức Lập Đạo','"Lv20 là cánh cửa đầu tiên. Hãy chọn con đường của riêng mình: gậy, sách, cung hay song đao."',[['tier',1,'Hoàn thành chuyển chức lần 1']],{g:220,x:220,p:6,e:[2],k:300,kk:1}),
N('Rèn Luyện Sơ Cấp','Thợ rèn hối thúc: "Đừng để đồ nằm yên trong túi. Cường hóa vài lần cho quen tay."',[['enhok',3,'Cường hóa thành công {n} lần'],['lv',22,'Đạt cấp {n}']],{g:250,x:250,p:3,f:5}),
N('Hầm Ngục Đầu Tiên','"Dưới lòng đất có ổ quái cổ xưa canh giữ báu vật. Vào Hầm Ngục, hạ Trùm Thần Thoại rồi trở ra."',[['dg',1,'Hoàn thành {n} Hầm Ngục'],['elite',15,'Hạ {n} quái Tinh Anh ⭐']],{g:300,x:300,f:8,e:[2,2]}),
N('Linh Thú Kết Duyên','"Sau khi chuyển chức, hãy tìm một linh thú đồng hành. Có thú, đường tu bớt cô độc."',[['pet',1,'Có thú nuôi đồng hành'],['lv',25,'Đạt cấp {n}']],{g:340,x:340,p:4,k:600,f:6}),
/* ===== HỒI 2 · HƯ KHÔNG & MA THẦN ===== */
N('Lửa Rèn Thần Binh','"Thần binh sinh ra từ lửa và búa. Cường hóa và chế tạo, đừng sợ thất bại."',[['enhok',8,'Cường hóa thành công {n} lần'],['craft',1,'Chế tạo {n} trang bị'],['eqr',3,'Đang mặc {n} món Hiếm trở lên',2]],{g:420,x:420,f:12,e:[3],m:8,nt:1}),
N('Kim Đan Kết Tụ','"Linh khí hóa lỏng, rồi kết thành đan. Kim Đan thành, Hoang Mạc này mới thật sự mở cửa với ngươi."',[['rn',3,'Đột phá cảnh giới Kim Đan'],['tier',2,'Hoàn thành chuyển chức lần 2']],{g:520,x:520,p:10,e:[3],w:[0,6],kk:1}),
N('Săn Trùm Thế Giới','"Boss Thế Giới tái sinh mỗi nửa canh giờ. Hạ chúng, mang về mảnh chế tạo cho thợ rèn."',[['boss',3,'Hạ {n} Boss'],['kill',500,'Hạ {n} quái']],{g:620,x:620,f:20,e:[3,3],h:8,nt:1}),
N('Lôi Kiếp Giáng Thế','"Nguyên Anh xuất khiếu, thiên lôi giáng xuống thử lòng. Vượt qua kiếp này, ngươi không còn là phàm nhân."',[['rn',4,'Đột phá cảnh giới Nguyên Anh'],['brk',2,'Đột phá thành công {n} lần']],{g:800,x:800,p:12,e:[4],f:25,w:[0,12],nt:2}),
N('Hóa Thần Chi Lộ','"Nguyên Anh vững rồi, tiến tới Hóa Thần. Thần thức mở rộng, thiên địa không còn che mắt."',[['rn',5,'Đột phá cảnh giới Hoá Thần'],['lv',80,'Đạt cấp {n}']],{g:1000,x:1000,p:15,e:[4],f:35,kk:2,nt:2}),
N('Ma Thần Thức Tỉnh','"Cổng Linh Giới bị Ma Thần phong ấn. Chỉ kẻ hạ được hắn mới được bước qua."',[['mt',1,'Hạ Ma Thần'],['boss',12,'Hạ {n} Boss']],{g:1600,x:1600,p:20,e:[4,4],f:50,w:[1,6],nt:3,kk:2}),
/* ===== HỒI 3 · THÀNH THỊ LINH GIỚI ===== */
N('Bước Qua Cổng Linh Giới','"Ma Thần đã gục, phong ấn vỡ tan. Phía bên kia cổng là Thành Thị Linh Giới — nơi tu sĩ khắp Hoang Mạc tụ hội."',[['lg',1,'Bước vào Thành Thị Linh Giới'],['lv',85,'Đạt cấp {n}']],{g:2200,x:2200,G:1000000,e:[4],f:60,nt:3,kk:2}),
N('Kiếm Thánh Đài','"Trên Kiếm Thánh Đài có kẻ mạnh gấp mười Ma Thần, mười phút lại sống dậy. Muốn đứng vững ở Linh Giới, hãy chém ngã hắn."',[['ks',1,'Hạ Kiếm Thánh']],{g:2800,x:2800,G:2000000,e:[4,4],f:80,nt:4,kk:3}),
N('Song Thánh Thánh Địa','"Thánh Địa mở ra: Ma Thần rồi tới Kiếm Thánh, hai đại ma đầu liên tiếp. Thông quan Thánh Địa, tên ngươi vang khắp Linh Giới."',[['td',1,'Thông quan Thánh Địa'],['elite',100,'Hạ {n} quái Tinh Anh ⭐']],{g:3500,x:3500,G:3000000,e:[5],f:100,nt:5,kk:3}),
N('Hợp Đạo Đạo Thể','"Lv100 là điểm tận cùng của phàm đạo. Đến Hợp Đạo Đài, đổi thân phàm lấy Đạo Thể — tu luyện lại từ đầu, mạnh gấp bội."',[['lv',100,'Đạt cấp {n}'],['hd',1,'Hợp Đạo thành công (Đạo Thể)']],{g:4500,x:4500,G:5000000,p:30,e:[5],f:120,nt:6,kk:4}),
N('Luyện Hư Ngộ Đạo','"Đạo Thể đã thành, đường tu lại mở. Luyện Hư là ngưỡng cửa để lĩnh ngộ Ý Cảnh."',[['rn',6,'Đột phá cảnh giới Luyện Hư'],['kill',3000,'Hạ {n} quái']],{g:5500,x:5500,G:6000000,p:20,e:[4,4],f:140,nt:6,kk:3}),
N('Ý Cảnh Tiên Ma','"Hợp Đạo Đài chỉ cho chọn một: Tiên đạo hay Ma đạo. Đã chọn thì không đổi — hãy nghĩ cho kỹ rồi khai mở Ý Cảnh."',[['yc',1,'Khai mở Ý Cảnh (chọn Tiên hoặc Ma đạo)'],['boss',25,'Hạ {n} Boss']],{g:6500,x:6500,G:8000000,p:25,e:[5],f:160,nt:8,kk:4}),
N('Bế Quan Hồn Phách','"Bế Quan Đài đang chờ. Chọn một hồn phách nhập thể, ngày đêm bế quan, sức mạnh tự khắc đến."',[['hp',1,'Chọn Hồn Phách nhập thể'],['enhok',60,'Cường hóa thành công {n} lần']],{g:7500,x:7500,G:8000000,p:20,e:[5],f:180,nt:8,kk:4}),
N('Tàn Ảnh Ma Thần','"Ma Thần lại hiện hình trong Phụ Bản. Máu hắn kết thành Tinh Huyết và Tố Tâm — thứ duy nhất nâng được thần thông Ý Cảnh."',[['pbmt',3,'Hạ Ma Thần trong Phụ Bản {n} lần'],['yc',4,'Nâng Ý Cảnh lên cấp {n}']],{g:9000,x:9000,G:10000000,p:30,e:[5],f:200,nt:10,kk:5}),
N('Ác Ma Thượng Giới','"Giữa Hợp Đạo Đài và Kiếm Thánh Đài có một cổng ma xoáy. Ác Ma Vương bước ra từ đó — chỉ Đạo Thể mới dám vào."',[['acma',1,'Hạ Ác Ma Vương'],['boss',60,'Hạ {n} Boss']],{g:11000,x:11000,G:15000000,p:35,e:[5,5],f:240,nt:12,kk:5}),
N('Hợp Thể Đại Đạo','"Thân và thần hợp nhất. Đại đạo ngay trước mắt, chỉ chờ ngươi bước tới."',[['rn',7,'Đột phá cảnh giới Hợp Thể'],['elite',300,'Hạ {n} quái Tinh Anh ⭐']],{g:13000,x:13000,G:20000000,p:40,e:[5,5],f:280,nt:12,kk:6}),
N('Ý Cảnh Viên Mãn','"Ý Cảnh là thứ vô hình mà nặng hơn cả thần binh. Tôi luyện tới cấp mười, người đời gọi ngươi là Đạo Chủ."',[['yc',10,'Nâng Ý Cảnh lên cấp {n}'],['pbmt',15,'Hạ Ma Thần trong Phụ Bản {n} lần']],{g:15000,x:15000,G:25000000,p:45,e:[5,5],f:320,nt:15,kk:8}),
N('Đại Thừa Viên Mãn','"Đại Thừa là đỉnh cao của đường tu. Vượt qua nó, ngươi chạm tới truyền thuyết."',[['rn',8,'Đột phá cảnh giới Đại Thừa'],['boss',100,'Hạ {n} Boss']],{g:18000,x:18000,G:30000000,p:60,e:[5,5],f:400,nt:18,kk:10}),
/* ===== HỒI 4 · TIÊN GIỚI ===== */
N('Chuyển Thế Tiên Nhân','"Cõi trên mở ra cho kẻ dám bỏ tất cả. Dốc linh thạch, vàng và khoáng thạch, Chuyển Thế thành Tiên Nhân."',[['ct',1,'Chuyển Thế thành Tiên Nhân']],{g:22000,x:22000,G:50000000,p:80,e:[5,5],f:500,nt:25,kk:12}),
N('Thiên Môn Tiên Giới','"Thiên Môn mở. Hư Không nơi Tiên Giới cũng nứt vỡ, tiên nhân phải tự mình dọn quái."',[['tgk',200,'Hạ {n} quái Tiên Giới'],['lv',30,'Đạt cấp {n} (Tiên Nhân)']],{g:26000,x:26000,G:40000000,p:50,e:[5],f:600,nt:25,kk:10}),
N('Vạn Tiên Chiến Trường','"Vạn tiên giao tranh, Ý Cảnh quyết định thắng thua. Đạt Ý Cảnh viên mãn, chém quái Tiên Giới không xuể."',[['tgk',3000,'Hạ {n} quái Tiên Giới'],['yc',15,'Ý Cảnh đạt cấp {n} (tối đa)']],{g:32000,x:32000,G:60000000,p:80,e:[5,5],f:800,nt:30,kk:15}),
N('Truyền Thuyết Hoang Mạc','"Tên ngươi được khắc lên bia đá Thanh Vân Tiên Thôn. Chiến công này người đời sau còn nhắc mãi."',[['kill',20000,'Hạ {n} quái Hư Không'],['boss',200,'Hạ {n} Boss'],['dg',100,'Hoàn thành {n} Hầm Ngục'],['ks',10,'Hạ Kiếm Thánh {n} lần']],{g:50000,x:50000,G:100000000,p:100,e:[5,5,5],f:1500,nt:50,kk:30})
];
QCH.length=0;L.forEach(function(c){QCH.push(c)});
var NEWT=L.map(function(c){return c.t});

/* ---------- 3. save cũ: đổi chỉ số chương theo TÊN chương đã làm ---------- */
function remap(d){
  if(!d||d.qv===3)return d;
  var c=Math.max(0,d.ch|0),done=OLDT.slice(0,c),i=0;
  while(i<NEWT.length&&done.indexOf(NEWT[i])>=0)i++;
  d.ch=i;d.nt=-1;d.qv=3;return d;
}
var _load=window.qsLoad;
window.qsLoad=function(){return remap(_load())};
if(typeof QS!='undefined'&&QS)remap(QS);

/* ---------- 4. nhân vàng / EXP cho mọi quà (chủ tuyến, ngày, tuần, rương, thành tựu) ---------- */
function sc(r){var o={};for(var k in r)o[k]=r[k];if(o.g)o.g=o.g*MG;if(o.x)o.x=o.x*MX;return o}
var _give=window.qsGive;
window.qsGive=function(r){
  r=sc(r||{});var o=_give(r);
  if(r.G){var v=typeof gP=='function'?gP(Math.round(r.G)):Math.round(r.G);gold+=v;o.push('💰'+fmtN(v))}
  return o;
};
var _chips=window.qsChips;
window.qsChips=function(r){
  r=sc(r||{});var h=_chips(r);
  if(r.G){var i=h.lastIndexOf('</div>');var s='<span>💰 '+fmtN(Math.round(r.G))+'</span>';h=i>=0?h.slice(0,i)+s+h.slice(i):h+s}
  return h;
};

/* ---------- 5. rương hoạt lực & thành tựu: thêm quà, thêm thành tựu theo nội dung mới ---------- */
var CHEST=[{g:100,h:5,m:4},{g:160,f:8,m:6,kk:1},{g:240,p:4,f:12,e:[2],nt:1},{g:340,e:[3],f:16,nt:2,kk:1},{g:520,p:8,e:[3,3],w:[0,5],nt:4,kk:2}];
QMS.forEach(function(m,k){if(CHEST[k])m[1]=CHEST[k]});
QAR.length=0;[{g:80,x:80,h:3},{g:240,f:8,p:3,m:4},{g:600,f:20,p:6,e:[2],nt:2},{g:1600,f:50,p:12,e:[3],nt:4,kk:2}].forEach(function(r){QAR.push(r)});
[['ks','🗡','Kiếm Thánh Đài','Hạ Kiếm Thánh {n} lần',[1,5,20,60]],
 ['td','🏛','Thánh Địa','Thông quan Thánh Địa {n} lần',[1,5,20,60]],
 ['acma','😈','Ác Ma Thượng Giới','Hạ Ác Ma Vương {n} lần',[1,5,20,60]],
 ['pbmt','👹','Tàn Ảnh Ma Thần','Hạ Ma Thần Phụ Bản {n} lần',[1,10,40,150]],
 ['yc','🔮','Ý Cảnh','Ý Cảnh đạt cấp {n}',[1,5,10,15]],
 ['tgk','🪽','Tiên Giới Chinh Chiến','Hạ {n} quái Tiên Giới',[200,2000,20000,100000]]
].forEach(function(d){if(!QAC.some(function(x){return x[0]==d[0]}))QAC.push(d)});

/* ---------- 6. NHIỆM VỤ VÒNG LẶP VÔ TẬN: hạ 250 quái → 100.000 EXP, lặp mãi (tab Chủ tuyến) ---------- */
var LP_N=250,LP_XP=100000;
function lpForm(){try{if(window.CTHE&&CTHE.on())return'Tiên Nhân';if(window.HDAO&&HDAO.on())return'Đạo Thể'}catch(e){}return'Phàm Thể'}
function lpS(){qsChk();if(!QS.lp)QS.lp={b:QS.T.kill|0,n:0};return QS.lp}
function lpV(){var l=lpS();return Math.max(0,(QS.T.kill|0)-l.b)}
var LP_MS=10,LP_MXP=200000,LP_MLT=100;   /* mỗi 10 vòng: +200k EXP và +100 Linh Thạch khoá */
function lpPay(){var l=lpS();try{if((l.pl|0)>0&&window.LT&&LT.logged&&LT.logged()){LT.earnKS(l.pl);l.pl=0}}catch(e){}}
function lpTake(){var l=lpS(),k=Math.floor(lpV()/LP_N);l.last=null;if(k<1){lpPay();return 0}l.b+=k*LP_N;l.n+=k;P.xp+=k*LP_XP;
  var ms=Math.floor(l.n/LP_MS)-(l.m|0);l.last={ms:0,lt:0};
  if(ms>0){l.m=(l.m|0)+ms;P.xp+=ms*LP_MXP;l.pl=(l.pl|0)+ms*LP_MLT;l.last={ms:ms,lt:ms*LP_MLT}}
  lpPay();return k}
function lpMsg(k){var l=lpS(),t='🔁 Vòng lặp vô tận ×'+k+': ✨'+fmtN(k*LP_XP)+' EXP';if(l.last&&l.last.ms){t+=' · 🎖 Mốc '+LP_MS+' vòng ×'+l.last.ms+': ✨'+fmtN(l.last.ms*LP_MXP)+' + 🔒'+fmtN(l.last.lt)+' Linh Thạch khoá'+((l.pl|0)>0?' (chờ đăng nhập ☁ để nhận)':'')}return t}
window.qsLp=function(){var k=lpTake();if(!k){return}msg=lpMsg(k);qsSave();sv();ui()};
var _ui=window.qsUI;
window.qsUI=function(){
  var h=_ui();
  if(qsub!=0)return h;
  var v=lpV(),l=lpS(),pv=v%LP_N,rd=v>=LP_N;
  return h+'<div class="qst-card'+(rd?' done':'')+'"><div style="display:flex;justify-content:space-between"><b>🔁 Vòng Lặp Vô Tận</b><span class="st">'+lpForm()+' · Lv'+P.lv+' · đã xong '+fmtN(l.n)+' vòng</span></div><div class="qo"><div>'+(rd?'✅':'⬜')+' Hạ '+LP_N+' quái</div>'+qsBar(rd?LP_N:pv,LP_N)+'</div><div class="qr"><span>✨ '+fmtN(LP_XP)+' EXP / vòng</span></div><div class="st" style="margin-top:4px">🎖 Mốc '+LP_MS+' vòng: <b>'+(l.n%LP_MS)+' / '+LP_MS+'</b> → ✨ '+fmtN(LP_MXP)+' EXP + 🔒 '+LP_MLT+' Linh Thạch khoá'+((l.pl|0)>0?' · <b>chờ nhận '+l.pl+' (đăng nhập ☁)</b>':'')+'</div><div class="qa"><button '+(rd?'':'disabled')+' onclick="qsLp()">'+(rd?'🎁 Nhận '+fmtN(Math.floor(v/LP_N)*LP_XP)+' EXP':'Đang thực hiện')+'</button></div></div>';
};
var _cnt=window.qsCnt;
window.qsCnt=function(){var c=_cnt();try{if(lpV()>=LP_N)c[0]++}catch(e){}return c};
var _all=window.qsAll;
window.qsAll=function(){var k=0;try{k=lpTake()}catch(e){}_all();if(k){var m0=msg;msg=(/^Chưa có/.test(m0||'')?'':(m0||'')+' · ')+lpMsg(k);qsSave();sv();ui()}};
})();
