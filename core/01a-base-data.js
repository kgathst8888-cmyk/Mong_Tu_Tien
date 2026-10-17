/* core/01a-base-data.js — Canvas, resize, RNG, bảng dữ liệu nhân vật/ô trang bị (ADJ, SLS, CHR)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */

const c=document.getElementById('c'),g=c.getContext('2d');let W,H,s;
let GY,DPR=1,PORT=0;
function rs(){W=document.body.clientWidth;H=document.body.clientHeight;DPR=Math.min(window.devicePixelRatio||1,window.QCAP||2);c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);PORT=H>W*1.05;s=PORT?Math.max(.5,Math.min(W/520,H/760)):Math.min(H/540,W/760);GY=H*(PORT?.64:.8)}
addEventListener('resize',rs);addEventListener('orientationchange',()=>setTimeout(rs,250));rs();
const R=Math.random,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ADJ=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần','Thánh'],
SLS={w:[['Binh Khí','⚔️'],['Khiên','🛡️'],['Hộ Tâm Kính','🪞'],['Mũ Trụ','⛑️'],['Găng Sắt','🧤'],['Quần Giáp','👖'],['Giày Sắt','🥾'],['Nhẫn Hộ Vệ','💍'],['Nhẫn Dũng Khí','💍'],['Dây Chuyền','📿'],['Thú Nuôi','🐾']],
m:[['Trượng Phép','🪄'],['Khiên Pháp','🛡️'],['Pháp Kính','🪞'],['Mũ Pháp Sư','⛑️'],['Găng Vải','🧤'],['Quần Pháp','👖'],['Hài Vải','👞'],['Nhẫn Nguyên Tố','💍'],['Nhẫn Huyền Bí','💍'],['Dây Chuyền Ngọc','📿'],['Thú Nuôi','🐾']],
a:[['Cung Dài','🏹'],['Khiên Săn','🛡️'],['Hộ Tâm Kính','🪞'],['Mũ Săn','⛑️'],['Găng Da','🧤'],['Quần Da','👖'],['Ủng Da','👢'],['Nhẫn Săn Mồi','💍'],['Nhẫn Sắc Bén','💍'],['Dây Chuyền Nanh','📿'],['Thú Nuôi','🐾']]},
CHR=[{n:'Elowen',t:'w',a:1.1,h:1.45,m:.8,c:'#ffb040',k:[['Chém Mạnh','⚔️',5,50,2,2.2],['Xung Phong','💥',12,150,1,1.8,230]],br:[
{n:'Kiếm Khách',k:[['Liên Hoàn Trảm','🌀',14,170,1,2.6,260],['Hộ Thể','🛡️',10,400,3,.35],['Phong Ma Trảm','❄️',14,240,4,2.2,300],['Vạn Kiếm Quy Tông','🗡️',30,900,5,9]]},
{n:'Thương Thủ',b:[['Liên Thích','🔱',5,50,7,.8,0,{h:3}],['Lưu Tinh Đột','💨',12,150,13,2.8,0,{r:340}]],k:[['Xuyên Tâm Thương','🔱',13,160,18,3.4,0,{r:230}],['Thương Vũ','💫',14,190,14,.95,250,{h:3}],['Địa Chấn','🌋',16,240,16,3,330],['Long Đảm Phá','🐉',30,900,17,9.5,560]]}]},
{n:'Aldric',t:'m',a:1,h:.9,m:1.4,c:'#5adf9a',k:[['Hỏa Cầu','🔥',5,30,0,2.4],['Sét Đánh','⚡',12,100,2,3]],br:[
{n:'Triệu Hồi Sư',w:'Sách',b:[['Linh Hồn Cầu','👻',5,45,0,2.4],['Hấp Hồn Ấn','🔮',12,150,8,2.2,300,{hl:.1}]],k:[['Triệu Linh Lang','🐺',16,420,6,1,'wolf'],['Triệu Mộc Linh','🌳',10,400,6,.8,'tree'],['Triệu Cự Thạch','🗿',22,700,6,2,'golem'],['Vạn Linh Giáng Thế','👻',32,900,5,9]]},
{n:'Ma Thuật Sư',w:'Gậy',k:[['Lôi Liên Chuỗi','🌩️',14,110,11,2.4,0,{n:6}],['Băng Giáp','🧊',10,260,10,0,0,{s:300,mp:.3}],['Bão Tuyết','❄️',15,160,4,2.4,340],['Thiên Hỏa Giáng','☄️',32,600,5,10]]}]},
{n:'Kaelen',t:'a',a:1.2,h:.95,m:1,c:'#e0c070',k:[['Tên Nhanh','🏹',4,40,0,1.8],['Mưa Tên','🌧️',12,150,1,1.7,300]],br:[
{n:'Xạ Thủ',w:'Cung',k:[['Xạ Kích','🎯',13,170,2,3.6],['Điều Tức','🍃',10,400,10,0,0,{d:300,hp:.3}],['Tên Xuyên Giáp','➳',14,230,0,4.2],['Tử Thần Tiễn','☠️',30,900,5,9.5]]},
{n:'Thích Khách',w:'Song đao',b:[['Ảnh Kích','🗡️',4,40,7,1.15,0,{h:2}],['Phi Đao Toàn Phong','🌪️',12,150,1,1.9,230]],k:[['Ám Sát Liên Hoàn','🥷',13,190,7,1.05,0,{h:4}],['Ẩn Thân Bộ','👤',12,420,10,0,0,{d:420,hp:.15}],['Huyết Ảnh Trảm','🩸',20,330,12,3.4,280],['Vạn Ảnh Sát Vực','⚔️',30,900,5,9.5]]}]}],
PS=CHR.map(()=>({lv:1,xp:0,pts:0,tier:0,br:-1,al:[0,0,0,0],cv:{r:-1,s:0,q:0,f:0},pet:null})),
MP=[['Thanh Vân Sơn Môn','Thổ Phỉ',['#6e3358','#c4586c','#f0b0a0','#a04a66','#7c3752','#7a3640','#1e0d12'],'#a8322c','#5a2a7a'],
['Rừng Kỵ Sĩ Bóng Đêm','Lang Yêu',['#1f4a3a','#4f9a6a','#c8e8a8','#3a7a56','#2a5a42','#2f5a36','#0d2014'],'#6a8a3a','#2a5a4a'],
['Tuyết Hàn Tiên Phong','Tuyết Quái',['#304a7a','#7aa8d8','#e8f4ff','#8ab0d8','#6a8ab8','#9ab8d0','#2a3a50'],'#7ab4d8','#3a5aa0'],
['Xích Viêm Luyện Ngục','Hỏa Ma',['#3a0f0a','#c8421a','#ffc060','#7a2a14','#5a1c10','#5a2210','#1a0804'],'#e0541a','#a01010'],
['U Minh Quỷ Cốc','U Hồn',['#1a0f30','#5a2a8a','#b890e0','#3a2060','#2a1648','#2a1a44','#0a0614'],'#7a4ab0','#2a0a50'],
['Cảng Chiến Hạm Cổ','Hải Tặc',['#16406a','#2a8ab0','#f0e0b0','#2a6a90','#1c4e70','#c8a868','#4a3a20'],'#2a6a9a','#8a2a2a'],
['Thiên Đài Thánh Kỵ','Thiên Binh',['#3a5a9a','#e8c870','#fff4d8','#d8b060','#b89040','#e8d8a0','#6a5a30'],'#d8b040','#e0e0f0'],
['Hư Không Ma Điện','Hư Không Ma',['#08040f','#2a1050','#6030a0','#1a0a30','#12061f','#180a2a','#050208'],'#4a2a8a','#c0208a'],['Linh Giới','Linh Thú',['#06182e','#1a5a8a','#a8f0ff','#164a6a','#0e3a56','#12405a','#04101c'],'#40c8ff','#d8f8ff']].map(a=>({n:a[0],en:a[1],c:a[2],b:a[3],bb:a[4]}));
