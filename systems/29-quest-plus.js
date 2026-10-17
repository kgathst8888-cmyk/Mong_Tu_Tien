/* ===================================================================
   NHIỆM VỤ+ : thêm chương chính tuyến, thêm nhiệm vụ hằng ngày/tuần/thành tựu, tăng quà
   - Chỉ sửa DỮ LIỆU (mảng QCH/QDP/QWP/QMS/QAC/QAR sửa tại chỗ), không đụng engine.
   - Chương mới xen giữa chương cũ; save cũ được đổi chỉ số chương (QMAP) để giữ nguyên vị trí đang làm.
   - Thêm khoá thưởng mới `kk` = Chìa Khóa Vòng Quay (LW.addKey).
   Chỉnh quà: hệ số UP_* và các bảng bên dưới.
   =================================================================== */
(function(){
if(typeof QCH=='undefined'||typeof QDP=='undefined'||window.__QPLUS)return;
window.__QPLUS=1;
var UP_CH=1.6,UP_WK=1.5;
function up(r,m,ex){var o={};for(var k in r)o[k]=r[k];['g','x','f','h','m','p'].forEach(function(k){if(o[k])o[k]=Math.round(o[k]*m)});for(var k2 in (ex||{}))o[k2]=ex[k2];return o}
function N(t,s,o,r){return{t:t,s:s,o:o,r:r}}
var OLD=QCH.slice();
var oldExtra={0:{kk:1},3:{kk:1,nt:1},5:{kk:1},6:{nt:1,kk:1},8:{nt:2,kk:2},9:{nt:3,kk:3},10:{nt:4,kk:4}};
var NEW={
 n1:N('Dưỡng Sinh Nhập Môn','"Lão Dược Sư: thuốc là mạng thứ hai. Dùng đúng lúc, ngươi sống lâu hơn kẻ liều lĩnh."',[['pot',3,'Dùng {n} bình thuốc'],['kill',60,'Hạ {n} quái Hư Không'],['lv',8,'Đạt cấp {n}']],{g:50,x:50,h:3,m:3}),
 n2:N('Rèn Luyện Sơ Cấp','"Thợ rèn hối thúc: đừng để đồ nằm yên trong túi. Cường hóa vài lần cho quen tay."',[['enhok',3,'Cường hóa thành công {n} lần'],['lv',12,'Đạt cấp {n}']],{g:70,x:70,p:2,f:2}),
 n3:N('Tinh Anh Liên Hoàn','"Tinh Anh xuất hiện mỗi ba mươi quái. Săn thêm vài con để tôi luyện chiêu thức."',[['elite',10,'Hạ {n} quái Tinh Anh ⭐'],['cast',100,'Thi triển {n} kỹ năng']],{g:90,x:90,e:[1],h:3,kk:1}),
 n4:N('Linh Thú Kết Duyên','"Sau khi chuyển chức, hãy tìm một linh thú đồng hành. Có thú, đường tu bớt cô độc."',[['pet',1,'Có thú nuôi đồng hành'],['lv',25,'Đạt cấp {n}']],{g:110,x:110,p:3,k:300,f:3}),
 n5:N('Chiến Thuật Thành Hình','"Một kỹ năng dùng đúng lúc đáng giá cả trăm đòn đánh liều."',[['cast',200,'Thi triển {n} kỹ năng'],['kill',300,'Hạ {n} quái Hư Không'],['lv',30,'Đạt cấp {n}']],{g:130,x:130,e:[2],p:3,m:5}),
 n6:N('Hầm Ngục Liên Chiến','"Một lần vào Hầm Ngục chưa đủ. Hãy chứng tỏ ngươi quen với bóng tối dưới lòng đất."',[['dg',5,'Hoàn thành {n} Hầm Ngục'],['boss',3,'Hạ {n} Boss']],{g:170,x:170,f:8,e:[2,2],nt:1}),
 n7:N('Trang Bị Hoàn Mỹ','"Đồ tốt chưa chắc đã mạnh nếu không biết phối hợp. Khoác lên mình sáu món Hiếm trở lên."',[['eqr',6,'Đang mặc {n} món Hiếm trở lên',2],['enhok',15,'Cường hóa thành công {n} lần']],{g:200,x:200,f:10,e:[3],kk:1}),
 n8:N('Đan Thành Cửu Chuyển','"Đan dược là bậc thang của tu sĩ. Dùng đan, săn Tinh Anh, tích lũy cho đột phá."',[['pot',20,'Dùng {n} bình thuốc'],['elite',40,'Hạ {n} quái Tinh Anh ⭐'],['lv',60,'Đạt cấp {n}']],{g:260,x:260,p:6,h:8,m:8,nt:1}),
 n9:N('Bách Chiến Bách Thắng','"Hoang Mạc không thương kẻ yếu. Tích đủ chiến công mới đáng tên tu sĩ."',[['kill',1500,'Hạ {n} quái Hư Không'],['boss',15,'Hạ {n} Boss']],{g:320,x:320,f:18,e:[3,3],kk:1}),
 n10:N('Thần Binh Tụ Linh','"Thần binh hấp thụ linh khí thiên địa. Ngươi cần ít nhất tám món Sử Thi trên người."',[['eqr',8,'Đang mặc {n} món Sử Thi trở lên',3],['enhok',40,'Cường hóa thành công {n} lần']],{g:400,x:400,f:25,e:[4],nt:2}),
 n11:N('Hóa Thần Chi Lộ','"Nguyên Anh vững rồi, tiến tới Hóa Thần. Thần thức mở rộng, thiên địa không còn che mắt."',[['rn',5,'Đột phá cảnh giới Hoá Thần'],['lv',80,'Đạt cấp {n}']],{g:500,x:500,p:12,e:[4],f:30,kk:2}),
 n12:N('Hậu Ma Thần Chi Chiến','"Ma Thần đã gục nhưng tàn dư còn lẩn khuất. Dọn sạch chúng trước khi bước qua cổng."',[['boss',20,'Hạ {n} Boss'],['dg',15,'Hoàn thành {n} Hầm Ngục'],['kill',2000,'Hạ {n} quái Hư Không']],{g:900,x:900,f:45,e:[4,4],nt:3,kk:2}),
 n13:N('Hợp Thể Đại Đạo','"Thân và thần hợp nhất. Đại đạo ngay trước mắt, chỉ chờ ngươi bước tới."',[['rn',7,'Đột phá cảnh giới Hợp Thể'],['elite',300,'Hạ {n} quái Tinh Anh ⭐']],{g:2000,x:2000,p:25,e:[4,4],f:100,nt:4,kk:3}),
 n14:N('Thần Thoại Tái Sinh','"Thần binh đủ đầy, khí thế ngút trời. Mười món Thần Thoại, trăm lần rèn luyện."',[['eqr',10,'Đang mặc {n} món Thần Thoại trở lên',4],['enhok',100,'Cường hóa thành công {n} lần']],{g:2500,x:2500,e:[5],f:120,nt:5,kk:3}),
 n15:N('Đại Thừa Viên Mãn','"Đại Thừa là đỉnh cao của đường tu. Vượt qua nó, ngươi chạm tới truyền thuyết."',[['rn',8,'Đột phá cảnh giới Đại Thừa'],['boss',60,'Hạ {n} Boss']],{g:3500,x:3500,p:40,e:[5,5],f:150,nt:6,kk:5}),
 n16:N('Truyền Thuyết Hoang Mạc','"Tên ngươi được khắc lên bia đá Thanh Vân Tiên Thôn. Chiến công này người đời sau còn nhắc mãi."',[['kill',20000,'Hạ {n} quái Hư Không'],['boss',200,'Hạ {n} Boss'],['dg',100,'Hoàn thành {n} Hầm Ngục']],{g:6000,x:6000,p:60,e:[5,5,5],f:300,nt:10,kk:10})
};
var SEQ=[0,'n1',1,'n2',2,'n3',3,'n4','n5',4,'n6',5,'n7',6,'n8',7,'n9',8,'n10','n11',9,'n12',10,'n13','n14','n15','n16'];
var QMAP=[],list=[];
SEQ.forEach(function(e){
  if(typeof e=='number'){var c=OLD[e];QMAP[e]=list.length;list.push({t:c.t,s:c.s,o:c.o,r:up(c.r,UP_CH,oldExtra[e])})}
  else list.push(NEW[e]);
});
QMAP[OLD.length]=QMAP[OLD.length-1]+1;   /* đã xong hết chương cũ → vào chương mới đầu tiên sau đó */
QCH.length=0;list.forEach(function(c){QCH.push(c)});
/* ---- hằng ngày: thêm 6 nhiệm vụ vào kho (mỗi ngày bốc 6) ---- */
[['kill',500,'Đại Tảo Hoang Mạc','Hạ {n} quái',25],['elite',10,'Liệp Sát Tinh Anh','Hạ {n} Tinh Anh ⭐',25],['pot',8,'Bình Thuốc Hộ Thân','Dùng {n} bình thuốc',15],
 ['dg',3,'Hầm Ngục Liên Hoàn','Hoàn thành {n} Hầm Ngục',30],['boss',3,'Tam Trảm Trùm','Hạ {n} Boss',30],['enhok',8,'Thiên Chùy Nhật Luyện','Cường hóa thành công {n} lần',25]].forEach(function(d){QDP.push(d)});
/* ---- hằng tuần: tăng quà + thêm 4 nhiệm vụ (mỗi tuần bốc 4) ---- */
QWP.forEach(function(d,i){d[4]=up(d[4],UP_WK,i%2?{nt:1}:{kk:1})});
[['kill',4000,'Tảo Địa Thiên Binh','Hạ {n} quái',{g:300,x:200,f:15,nt:1}],['elite',100,'Tinh Anh Đồ Sát','Hạ {n} Tinh Anh ⭐',{g:300,x:200,e:[3],nt:1}],
 ['boss',8,'Bát Trảm Liên Hoàn','Hạ {n} Boss',{g:400,f:30,e:[3],kk:1}],['pot',30,'Dược Đạo Chi Lộ','Dùng {n} bình thuốc',{g:200,h:10,m:10,p:3,kk:1}]].forEach(function(d){QWP.push(d)});
/* ---- rương hoạt lực ---- */
var CHEST=[{g:60,h:3,m:2},{g:100,f:5,m:4,kk:1},{g:160,p:3,f:8,e:[2],nt:1},{g:220,e:[3],f:10,nt:2,kk:1},{g:350,p:5,e:[3],w:[0,3],nt:3,kk:2}];
QMS.forEach(function(m,k){m[1]=CHEST[k]});
/* ---- thành tựu: thêm 3 loại + tăng quà các bậc ---- */
QAR.length=0;[{g:40,x:40,h:2},{g:120,f:5,p:2,m:3},{g:300,f:12,p:4,e:[2],nt:1},{g:800,f:30,p:8,e:[3],nt:2,kk:1}].forEach(function(r){QAR.push(r)});
[['pot','🧪','Dược Sư','Dùng {n} bình thuốc',[10,100,500,2000]],['mt','👹','Trảm Ma Thần','Hạ Ma Thần {n} lần',[1,3,10,30]],['rn','🧘','Đạo Đồ Rộng Mở','Đạt cảnh giới thứ {n}',[1,3,5,8]]].forEach(function(d){QAC.push(d)});
/* ---- quà `kk`: Chìa Khóa Vòng Quay ---- */
var _give=window.qsGive;
window.qsGive=function(r){var o=_give(r);if(r&&r.kk&&typeof LW!='undefined'){LW.addKey(r.kk);o.push('🗝'+r.kk)}return o};
var _chips=window.qsChips;
window.qsChips=function(r){var h=_chips(r);if(r&&r.kk){var i=h.lastIndexOf('</div>');if(i>=0)h=h.slice(0,i)+'<span>🗝 '+r.kk+' Chìa khóa</span>'+h.slice(i)}return h};
/* ---- save cũ: đổi chỉ số chương sang bảng chương mới ---- */
var _load=window.qsLoad;
window.qsLoad=function(){var d=_load();if(d&&d.qv!==2){var c=d.ch|0;d.ch=QMAP[Math.min(c,QMAP.length-1)];d.nt=-1;d.qv=2}return d};
if(typeof QS!='undefined'&&QS&&QS.qv!==2){var c0=QS.ch|0;QS.ch=QMAP[Math.min(c0,QMAP.length-1)];QS.nt=-1;QS.qv=2}
})();
