/* ===== 🗼 VẠN PHÁP THÁP — CHỌN MÔN PHÁI (world/71-van-phap-mon-phai.js) =====
 * Mục "Vạn Pháp Tháp" ở Thành Thị Tiên Giới (TG.spots id 'pagoda'): TẠM KHOÁ cho tới khi đạt cảnh giới Tiên Nhân, khi đó open=1, go=mở bảng.
 * Bảng: 6 môn phái, mỗi môn 4 kỹ năng + 1 bị động + 1 tuyệt kỹ; chạm tên môn để xem, nút "Chọn môn phái" để chọn/đổi.
 * Lưu: FM.get().sect (id môn) — đi cùng dữ liệu Linh Điền (systems/08, ld() giữ trường sect). API: VP.get() / VP.set(id) / VP.open() / VP.SECTS.
 * LƯU Ý: hiện chỉ chọn + lưu + xem mô tả; chưa gắn vào chiến đấu (làm ở bước sau, đọc VP.get() để biết môn đang chọn).
 * Chỉnh: mảng SECTS (tên, màu, kỹ năng). */
(function(){
'use strict';
if(typeof TG==='undefined'||!TG.spots||typeof FM==='undefined'||!FM.get)return;
var SECTS=[
{id:'umt',n:'U Minh Ma Tông',e:'🦇',c:'#c070ff',sk:[
['Ảnh Nhận Trảm','Huyết liêm chém 3 nhát liên tiếp, tổng 180% công kích; mỗi nhát hút 1,2% sinh lực tối đa.','Hồi chiêu 4 giây'],
['U Minh Độn','Lướt xuyên mục tiêu gây 120% công kích, né tránh 2 giây; để lại Ám Ảnh nổ sau 1,3 giây gây thêm sát thương và hút máu.','Hồi chiêu 8 giây'],
['Huyết Ảnh Truy Hồn','Đánh dấu mục tiêu 5 giây; đòn đánh tiếp theo gây thêm 100% công kích.','Hồi chiêu 12 giây'],
['Ma Liêm Đoạt Mệnh','Chém mục tiêu, gây 280% công kích; tăng sát thương khi mục tiêu còn ít sinh lực.','Hồi chiêu 18 giây'],
['Cửu U Ma Thể','Tăng tỷ lệ chí mạng 5%; đòn chí mạng hồi một lượng sinh lực nhỏ, có giới hạn kích hoạt.','Bị động'],
['Cửu U Đoạt Hồn','Triệu hồi 3 phân thân mỗi nhịp trong 5 giây, mỗi bóng đánh một kẻ khác nhau, tổng 850% công kích, thỉnh thoảng hút máu; nhịp cuối kết liễu kẻ dưới 25% sinh lực.','Tuyệt kỹ · Hồi chiêu 60 giây']]},
{id:'hbd',n:'Huyền Băng Điện',e:'❄️',c:'#7fe4ff',sk:[
['Hàn Băng Chỉ','Băng châm 130% công kích, làm chậm, tích 1 Hàn Khí; mục tiêu đã có từ 3 Hàn Khí chịu +25% và bị đóng băng ngắn. Đủ 5 Hàn Khí sẽ Vỡ Băng nổ lan.','Hồi chiêu 3 giây'],
['Băng Tinh Phá','Gai băng trồi lên 3 đợt liên tiếp, tổng 200% công kích, làm chậm và mỗi đợt tích 1 Hàn Khí.','Hồi chiêu 8 giây'],
['Huyền Băng Lao','Giam băng mục tiêu 1,6 giây, kẻ xung quanh bị làm chậm; hết giam thì Nứt Vỡ gây tổng 150% công kích lan sang kẻ gần.','Hồi chiêu 14 giây'],
['Băng Long Xuất Hải','Băng long xuyên thẳng 300% công kích, làm chậm mạnh, tích Hàn Khí và để lại vệt băng gây sát thương thêm 3 nhịp.','Hồi chiêu 18 giây'],
['Cực Hàn Chi Thể','Kỹ năng trúng đích tích Hàn Khí; đủ 5 tầng khiến đòn kế tiếp tăng sát thương 20%.','Bị động'],
['Băng Phong Vạn Lý','Bão tuyết 6 giây tổng 750% công kích, làm chậm mạnh và tích Hàn Khí mỗi nhịp; kết thúc Vỡ Băng hàng loạt lên kẻ có từ 3 Hàn Khí.','Tuyệt kỹ · Hồi chiêu 60 giây']]},
{id:'ptc',n:'Phần Thiên Cốc',e:'🔥',c:'#ff9a4a',sk:[
['Viêm Hỏa Chú','Hỏa cầu 140% công kích nổ lan nhẹ, mỗi mục tiêu trúng chịu 1 tầng Thiêu Đốt (tối đa 5 tầng, thiêu theo thời gian).','Hồi chiêu 3 giây'],
['Liệt Diễm Bạo Phát','Nổ lớn 220% công kích; KÍCH NỔ mọi tầng Thiêu Đốt trong vùng, mỗi tầng +40% sát thương rồi xoá tầng.','Hồi chiêu 8 giây'],
['Hỏa Liên Trận','Trận lửa 5 giây tổng 300% công kích, mỗi giây thêm 1 tầng Thiêu Đốt cho mọi kẻ trong trận.','Hồi chiêu 12 giây'],
['Phượng Hoàng Niết Bàn','Phượng hoàng xuyên thẳng 320% công kích, thêm 2 tầng Thiêu, hồi 6% sinh lực và nổ ở cuối đường bay.','Hồi chiêu 20 giây'],
['Chân Hỏa Linh Thể','Kẻ địch đang thiêu đốt nhận thêm 8% sát thương từ kỹ năng của phái.','Bị động'],
['Cửu Dương Phần Thiên','9 mặt trời trong 6 giây, mỗi nhịp một thiên thạch rơi xuống kẻ địch ngẫu nhiên tổng 900% công kích, thêm 2 tầng Thiêu; cuối cùng dẫn bạo mọi tầng còn lại.','Tuyệt kỹ · Hồi chiêu 60 giây']]},
{id:'tkt',n:'Thiên Kiếm Tông',e:'⚔️',c:'#ffe27a',sk:[
['Kiếm Khí Trảm','Kiếm khí 150% công kích NẢY CHUYỀN qua tối đa 4 mục tiêu, sát thương giảm dần mỗi lần nảy.','Hồi chiêu 3 giây'],
['Ngự Kiếm Quyết','5 phi kiếm ở lại 2,5 giây, tự truy kích kẻ gần nhất (đổi mục tiêu khi kẻ địch chết), tổng 275% công kích.','Hồi chiêu 8 giây'],
['Kiếm Bộ Vô Ảnh','Lướt xuyên mọi kẻ trên đường 180% công kích, né tránh 2 giây và tích Kiếm Ý: chiêu kế tiếp trong 5 giây +30% sát thương.','Hồi chiêu 10 giây'],
['Trảm Thiên Nhất Kiếm','Tích lực rồi chém THỦ LĨNH (kẻ nhiều sinh lực nhất) 400% công kích, boss chịu thêm; kiếm khí lan nhẹ sang kẻ gần.','Hồi chiêu 18 giây'],
['Kiếm Tâm Thông Minh','Mỗi 5 lần đánh trúng tích 1 tầng Kiếm Ý; đủ 5 tầng tăng sát thương kỹ năng tiếp theo 20%.','Bị động'],
['Vạn Kiếm Quy Tông','Kiếm trận 5 giây tổng 800% công kích, sức mạnh TĂNG DẦN mỗi nhịp; nhịp cuối quy tông toàn trận.','Tuyệt kỹ · Hồi chiêu 60 giây']]},
{id:'vdm',n:'Vạn Độc Môn',e:'☠️',c:'#7cf08a',sk:[
['Độc Châm Xuyên Tâm','3 độc châm rải lên 3 mục tiêu khác nhau, tổng 130% công kích, mỗi châm thêm 1 tầng Độc (tối đa 10 tầng, độc theo thời gian).','Hồi chiêu 3 giây'],
['Vạn Độc Mê Vụ','Sương độc 5 giây tổng 400% công kích, mỗi giây thêm 1 tầng Độc và làm chậm nhẹ kẻ trong sương.','Hồi chiêu 10 giây'],
['Phệ Tâm Độc Chú','180% công kích và KÍCH ĐỘC: mỗi tầng +22% sát thương, giữ lại nửa số tầng; mục tiêu chết thì độc LAN sang 2 kẻ gần.','Hồi chiêu 8 giây'],
['Bích Lân Độc Xà','Độc xà săn mồi 6 giây tổng 450% công kích, mỗi lần cắn chọn kẻ ít tầng Độc nhất và thêm 2 tầng.','Hồi chiêu 18 giây'],
['Vạn Độc Chi Thể','Tăng 8% sát thương độc. Khi mục tiêu đạt 5 tầng Độc, sát thương độc tiếp theo tăng 20%; hiệu ứng có thời gian hồi nội tại.','Bị động'],
['Vạn Độc Phệ Thiên','Độc vực 6 giây tổng 800% công kích, mỗi nhịp thêm 1 tầng Độc; kết thúc ĐỘC PHÁT — mọi tầng Độc nổ cùng lúc.','Tuyệt kỹ · Hồi chiêu 60 giây']]},
{id:'ngc',n:'Ngự Cổ Thánh Điện',e:'🐛',c:'#ffb0ff',sk:[
['Linh Cổ Xuất Khiếu','4 con cổ BÁM vào mục tiêu 3 giây tổng 150% công kích; mục tiêu chết thì cổ chuyển sang kẻ gần nhất.','Hồi chiêu 5 giây'],
['Kim Giáp Cổ','Triệu hồi cổ trùng hộ thể, tạo lá chắn bằng 12% sinh lực tối đa trong 6 giây.','Hồi chiêu 12 giây'],
['Phệ Linh Cổ Quần','Bầy cổ gặm 3 kẻ trong 5 giây tổng 250% công kích; kẻ bị gặm nhận thêm 20% sát thương kỹ năng của phái, giảm 10% phòng thủ.','Hồi chiêu 10 giây'],
['Thiên Túc Cổ Vương','Cổ Vương chiến đấu 8 giây tổng 600% công kích, đập vào cụm kẻ địch; mỗi nhịp thứ 4 giậm đất làm choáng diện rộng.','Hồi chiêu 20 giây'],
['Cổ Tâm Đồng Mệnh','Khi linh trùng tấn công, tích Cổ Lực. Đủ 5 tầng tăng 20% sát thương cho lần triệu hồi tiếp theo.','Bị động'],
['Vạn Cổ Triều Tông','6 đợt triều cổ lan vòng từ người ra ngoài trong 6 giây tổng 750% công kích; kẻ chết bởi triều nổ thành Cổ Tử gây sát thương lan.','Tuyệt kỹ · Hồi chiêu 60 giây']]}];
function byId(id){for(var i=0;i<SECTS.length;i++)if(SECTS[i].id===id)return SECTS[i];return null}
function get(){try{if(window.VPD)return VPD.sect()}catch(e){}try{return FM.get().sect||''}catch(e){return ''}}
function set(id){if(id&&!byId(id))return false;try{if(window.VPD)return VPD.setSect(id)}catch(e){}try{FM.get().sect=id||''}catch(e){return false}try{if(typeof sv==='function')sv()}catch(e){}return true}
var ov=null,cur='',pg='';
function gnow(){try{return window.VPG?VPG.gender():'m'}catch(e){return 'm'}}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function build(){ov=document.createElement('div');ov.id='vp-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(4,2,16,.82);display:none;align-items:center;justify-content:center;font:14px/1.45 KTH Serif,Songti SC,serif;color:#f2eaff';
 ov.addEventListener('pointerdown',function(e){e.stopPropagation()});
 ov.addEventListener('click',function(e){var t=e.target,k;while(t&&t!==ov&&!(t.getAttribute&&t.getAttribute('data-a')))t=t.parentNode;if(!t||t===ov){if(e.target===ov)close();return}
  k=t.getAttribute('data-a');if(k==='x')close();else if(k==='s'){cur=t.getAttribute('data-id');render()}else if(k==='g'){pg=t.getAttribute('data-g');render()}else if(k==='pick'){choose(cur)}});
 document.body.appendChild(ov)}
function render(){var s=byId(cur)||SECTS[0],mine=get(),h='',gsel=pg||gnow(),same=mine===s.id&&gsel===gnow(),gt=gsel==='f'?'Nữ':'Nam';
 h+='<div style="width:min(440px,94vw);max-height:90vh;display:flex;flex-direction:column;box-sizing:border-box;background:linear-gradient(#1e1a48,#0c0a24);border:2px solid '+s.c+';border-radius:14px;padding:12px;box-shadow:0 8px 30px #000a,0 0 24px '+s.c+'55">';
 h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:17px;color:#ffe27a">🗼 Vạn Pháp Tháp · Chọn Môn Phái</b><span data-a="x" style="padding:2px 10px;font-size:20px;cursor:pointer">✕</span></div>';
 h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
 SECTS.forEach(function(q){var a=q.id===s.id;h+='<span data-a="s" data-id="'+q.id+'" style="flex:1 1 30%;text-align:center;padding:6px 2px;border-radius:8px;cursor:pointer;font-size:13px;border:1px solid '+(a?q.c:'#5a4a9a')+';background:'+(a?q.c+'33':'#14102e')+'">'+q.e+' '+esc(q.n)+(mine===q.id?' ✓':'')+'</span>'});
 h+='</div>';
 var pv='';try{if(window.VPG)pv=VPG.preview(s.id,gsel)}catch(e){}
 h+='<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;padding:6px 8px;border-radius:10px;background:#ffffff0d">'+(pv?'<img src="'+pv+'" style="height:86px;width:auto;flex:0 0 auto;filter:drop-shadow(0 0 8px '+s.c+'99)">':'')+'<div style="flex:1"><div style="font-size:13px;color:#ffd98a;margin-bottom:5px">Giới tính nhân vật</div><div style="display:flex;gap:6px">'+[['m','♂ Nam'],['f','♀ Nữ']].map(function(q){var a=q[0]===gsel;return '<span data-a="g" data-g="'+q[0]+'" style="flex:1;text-align:center;padding:7px 2px;border-radius:8px;cursor:pointer;font-size:14px;border:1px solid '+(a?s.c:'#5a4a9a')+';background:'+(a?s.c+'33':'#14102e')+'">'+q[1]+'</span>'}).join('')+'</div><div style="font-size:12px;color:#c9bff0;margin-top:5px">Ngoại hình đổi theo môn phái + giới tính.</div></div></div>';
 h+='<div style="overflow:auto;-webkit-overflow-scrolling:touch;flex:1;padding-right:2px">';
 s.sk.forEach(function(k,i){var tag=i==4?'🔰':i==5?'🌟':(i+1)+'.',inf=null,ex='';try{if(window.VPD)inf=VPD.info(s.id,i)}catch(e){}
  if(inf){ex=!inf.unl?'<span style="font-size:12px;color:#ff9a8a">🔒 Mở ở cấp nhân vật '+inf.need+'</span>':(mine===s.id||inf.uses>0?'<span style="font-size:12px;color:#9affb0">Cấp '+inf.lv+'/'+inf.max+(inf.prog?' · '+inf.prog[0]+'/'+inf.prog[1]+' lần '+(i==4?'kích hoạt':'dùng'):' · tối đa')+'</span>':'<span style="font-size:12px;color:#9affb0">Mở khi chọn môn</span>')}
  h+='<div style="margin-bottom:7px;padding:6px 8px;border-radius:8px;background:#ffffff0d;'+(inf&&!inf.unl?'opacity:.6':'')+'"><div><b style="color:'+s.c+'">'+tag+' '+esc(k[0])+'</b> <span style="font-size:12px;color:#ffd98a">· '+esc(k[2])+'</span></div>'+(ex?'<div>'+ex+'</div>':'')+'<div style="font-size:13px;color:#e6defa">'+esc(k[1])+'</div></div>'});
 h+='</div><div data-a="pick" style="margin-top:8px;text-align:center;padding:9px;border-radius:10px;cursor:pointer;font-weight:bold;font-size:15px;color:#1a1030;background:'+(same?'#8a8aa8':'linear-gradient(#ffe27a,#d8a838)')+'">'+(same?'Đang theo môn phái này':(mine===s.id?'Đổi giới tính thành '+gt:'Chọn môn phái '+esc(s.n)+' · '+gt))+'</div></div>';
 ov.innerHTML=h}
function note(t){try{if(FM.note)FM.note(t)}catch(e){}}
function choose(id){var s=byId(id);if(!s)return;var g=pg||gnow(),old=byId(get());
 if(get()===id&&g===gnow())return;
 if(get()!==id&&old&&typeof confirm==='function'&&!confirm('Đổi từ '+old.n+' sang '+s.n+'?'))return;
 if(get()!==id&&!set(id))return;
 try{if(window.VPG)VPG.setGender(g)}catch(e){}
 note('Đã chọn '+s.n+' · '+(g==='f'?'Nữ':'Nam'));pg='';render()}
function open(){if(!ov)build();cur=get()||cur||SECTS[0].id;pg='';render();ov.style.display='flex'}
function close(){if(ov)ov.style.display='none'}
window.VP={CF:null,SECTS:SECTS,get:get,set:set,open:open,close:close};
/* Vạn Pháp Tháp chỉ mở khi đạt cảnh giới Tiên Nhân (CF.realm). Hiện game chưa có cảnh giới này nên tháp TẠM KHOÁ; khi thêm cảnh giới mới tự mở (kiểm tra 2 giây/lần).
 * Muốn mở thủ công để thử: VP.CF.force=true trong console. */
var CF={realm:'Tiên Nhân',force:false};
function realmOk(){if(CF.force)return true;try{if(window.CTHE&&CTHE.on())return true}catch(e){}try{var n=String(ZC.nm?ZC.nm():'');return n.indexOf(CF.realm)===0}catch(e){return false}}
var LOCK_SUB='Cần cảnh giới '+CF.realm,LOCK_DESC='Vạn Pháp Tháp chỉ mở khi đạt cảnh giới '+CF.realm+'. Hiện tạm khoá.';
function sync(){TG.spots.forEach(function(p){if(p.id!=='pagoda')return;var ok=realmOk();if(ok&&!p.open){p.open=1;p.go=open;p.sub='Chọn môn phái · Thí luyện vạn pháp';p.desc='Chọn môn phái của bạn.'}else if(!ok&&(p.open||p.sub!==LOCK_SUB)){p.open=0;p.go=null;p.sub=LOCK_SUB;p.desc=LOCK_DESC}})}
window.VP.CF=CF;sync();setInterval(sync,2000);
})();
