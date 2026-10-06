/* core/01-engine.js */

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
{n:'Aldric',t:'m',a:1,h:.9,m:1.4,c:'#5adf9a',k:[['Hỏa Cầu','🔥',5,45,0,2.4],['Sét Đánh','⚡',12,150,2,3]],br:[
{n:'Triệu Hồi Sư',w:'Sách',b:[['Linh Hồn Cầu','👻',5,45,0,2.4],['Hấp Hồn Ấn','🔮',12,150,8,2.2,300,{hl:.1}]],k:[['Triệu Linh Lang','🐺',16,420,6,1,'wolf'],['Triệu Mộc Linh','🌳',10,400,6,.8,'tree'],['Triệu Cự Thạch','🗿',22,700,6,2,'golem'],['Vạn Linh Giáng Thế','👻',32,900,5,9]]},
{n:'Ma Thuật Sư',w:'Gậy',k:[['Lôi Liên Chuỗi','🌩️',14,170,11,2.4,0,{n:6}],['Băng Giáp','🧊',10,400,10,0,0,{s:300,mp:.3}],['Bão Tuyết','❄️',15,250,4,2.4,340],['Thiên Hỏa Giáng','☄️',32,900,5,10]]}]},
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
const MPX=[0,2,3,4,7],LR=[[1,20],[20,40],[40,60],[60,80],[80,100]],SZ=.7,LC=t=>t>=3?100:20*(t+1);const NS=11,TY=[0,1,2,3,4,5,6,7,9],PETN=['Sói Con','Cáo Băng','Hỏa Hồ','Linh Hồn Khuyển','Hư Không Long'],EP={x:0,cd:0},BZ=[1,1.12,1,1.3],MT=[1,1.35,1.8,2.4,3.2],MTN=['Cổ Thạch','Băng Tuyết','Hỏa Ngục','U Minh','Hư Không'];let lg=0,LGX=8,NK=0,pq=[0,0],fz=[],mapSel=0,vt=null,vgo=-1,vmk=0,frag=0,hpP=3,mpP=3,cq=null,pn='Đạo Hữu',pc=0,wbs=Math.floor(Date.now()/18e5),vil=0,started=0,cur=0,lm=0,SK=[];const setN=()=>EQ.filter(i=>i&&i.r>=4&&!i.hl).length,setOn=()=>setN()>=6;const mi=()=>lg?8:MPX[mapSel],al=i=>PS[cur].al[i],df=()=>Math.round((P.lv*30+20+sm('d')+al(1))*ZC.cb()*ZC.pd()*HL.df());
/* ================= BỘ THÁNH (HL) =================
   - Không rơi từ Boss nào, chỉ chế tạo ở tab ✨ Lò Thánh.
   - Chỉnh cân bằng ở khối C bên dưới. */
const HL=(()=>{
const C={
 lv:80,                 /* cấp mặc định trang bị Thánh */
 mult:3,                /* mạnh gấp 3 lần Thiên Thần cao nhất (Lv100, bản đồ Hư Không, roll tối đa) */
 need:[2,4,6,8,10],     /* số món mặc để mở opt 1..5 */
 dmg:.5,                /* opt1: +50% sát thương */
 def:.5,                /* opt2: +50% phòng thủ và HP */
 elem:.3,               /* opt3: +30% sát thương mọi nguyên tố */
 crit:20,cdmg:50,dc:.05,/* opt4: +20% chí mạng, +50% ST chí mạng, 5% x2 ST chí mạng */
 pvp:.2,tn:.4,          /* opt5: +20% ST lên người chơi, +40% ST lên Quái Thiên Nhân */
 fe:1000,hk:1000,nt:10, /* 1 Mảnh Thánh = 1000 Quặng Sắt + 1000 Huyền Kim + 10 Mảnh Nguyệt Thạch */
 shNeed:10,shRate:.3,   /* 10 Mảnh Thánh, 30% ra 1 món Thánh */
 shLose:10,             /* thất bại mất bao nhiêu Mảnh Thánh (10 = mất hết, 0 = không mất) */
 ntShop:.05             /* tỉ lệ nhận 1 Mảnh Nguyệt Thạch khi mở Rương trang bị ở Tạp Hóa */
};
const OPT=['Tăng 50% sát thương','Tăng 50% phòng thủ và HP','Tăng 30% sát thương mọi nguyên tố','Chí mạng +20%, ST chí mạng +50%, 5% nhân đôi ST chí mạng','Tăng 20% ST lên người chơi, +40% ST lên Quái Thiên Nhân, kích hoạt hiệu ứng đặc biệt Bộ Thánh (cập nhật sau)'];
const PIECES=[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[9,0]];
const S={sh:0,nt:0,tr:0,ok:0};
const IMGS=[];
const n=()=>{try{return EQ.reduce((t,i,x)=>t+(i&&i.hl&&x<10?1:0),0)}catch(e){return 0}};
const on=k=>n()>=C.need[k];
const nOn=()=>C.need.filter((q,i)=>n()>=q).length;
function loadImgs(ic){ic.forEach((u,i)=>{const m=new Image();m.onload=()=>{try{Object.keys(CC).forEach(k=>delete CC[k]);Object.keys(IC).forEach(k=>delete IC[k]);if(typeof bo!='undefined'&&bo)ui()}catch(e){}};m.src=u;IMGS[i]=m})}
function gen(p){const s=p[0],m=C.mult*(1+100*.6)*RM[5]*MT[4],b=BS[s],x={};
 Object.keys(AXU).sort(()=>R()-.5).slice(0,6).forEach(k=>x[k]=Math.round(AXU[k]*RMX[5]*1.3*2*(1+4*.08)*C.mult*10)/10);
 return{u:0,s,r:6,l:C.lv,mp:4,hl:1,v:p[1],x,n:SL[s][0]+' Thánh · Thánh Quang',a:Math.round(b[0]*m),d:Math.round(b[1]*m),h:Math.round(b[2]*m)}}
const mat=()=>{try{return MN.get()}catch(e){return{fe:0,hk:0}}};
const say=t=>{msg=t;ui()};
function forge(k){const m=mat();k=Math.min(k|0,Math.floor((m.fe|0)/C.fe),Math.floor((m.hk|0)/C.hk),Math.floor(S.nt/C.nt));
 if(k<1){say('Thiếu nguyên liệu: cần '+C.fe+' Quặng Sắt, '+C.hk+' Huyền Kim, '+C.nt+' Mảnh Nguyệt Thạch cho mỗi Mảnh Thánh');return}
 m.fe-=C.fe*k;m.hk-=C.hk*k;S.nt-=C.nt*k;S.sh+=k;try{sv()}catch(e){}say('💠 Luyện thành '+k+' Mảnh Thánh (hiện có '+S.sh+')')}
function combine(){if(S.sh<C.shNeed){say('Cần '+C.shNeed+' Mảnh Thánh');return}
 if(BAG.length>=capN()){say('Túi đầy, hãy dọn chỗ trước khi kết hợp');return}
 if(!confirm('Dùng '+C.shNeed+' Mảnh Thánh để kết hợp?\nTỉ lệ thành công '+Math.round(C.shRate*100)+'%.\nThất bại sẽ mất '+C.shLose+' Mảnh Thánh.'))return;
 S.tr++;
 if(R()<C.shRate){S.sh-=C.shNeed;S.ok++;const it=gen(PIECES[Math.floor(R()*PIECES.length)]);BAG.push(it);tab=0;sel={k:'b',i:BAG.length-1};try{sv()}catch(e){}msg='🌟 Kết hợp thành công! Nhận '+it.n+' (cần Lv'+it.l+' để mặc)';ui()}
 else{S.sh-=Math.min(S.sh,C.shLose);try{sv()}catch(e){}say('💥 Kết hợp thất bại'+(C.shLose?', mất '+C.shLose+' Mảnh Thánh':'')+'.')}}
function addNT(k){S.nt+=k|0}
function shopNT(){if(R()<C.ntShop){S.nt++;return' · 🌙 +1 Mảnh Nguyệt Thạch!'}return''}
function tipTxt(){const k=n();return'<br><span style="color:#ffe27a">✦ Bộ Thánh '+k+'/10</span>'+OPT.map((o,i)=>{const a=k>=C.need[i];return'<br><span style="color:'+(a?'#ffe27a':'#8a8a8a')+'">'+(a?'✔':'🔒')+' '+C.need[i]+' món: '+(a?o:'???')+'</span>'}).join('')}
function ui_(){if(!vil)return NV;const m=mat(),fe=m.fe|0,hk=m.hk|0,mxk=Math.min(Math.floor(fe/C.fe),Math.floor(hk/C.hk),Math.floor(S.nt/C.nt));
 const row=(e,nm,v,need)=>'<div class="st">'+e+' '+nm+': <b style="color:'+(v>=need?'#7fe08a':'#ff7a7a')+'">'+fmtN(v)+'</b> / '+fmtN(need)+'</div>';
 let h='<div class="dt" style="color:#ffe27a"><b>✨ Lò Luyện Thánh Khí</b><br><small>Trang bị Thánh <b>không rơi</b> từ bất kỳ Boss nào, chỉ chế tạo tại đây. Cấp mặc định Lv'+C.lv+'.</small></div>';
 h+='<div class="dt"><b>① Luyện Mảnh Thánh</b><br>'+row('🔩','Quặng Sắt',fe,C.fe)+row('🌑','Huyền Kim',hk,C.hk)+row('🌙','Mảnh Nguyệt Thạch',S.nt,C.nt)
  +'<button '+(mxk<1?'disabled':'')+' onclick="HL.forge(1)">⚒ Luyện 1</button><button '+(mxk<1?'disabled':'')+' onclick="HL.forge('+mxk+')">Luyện tối đa ('+mxk+')</button></div>';
 h+='<div class="dt"><b>② Kết hợp Trang bị Thánh</b><br><div class="st">💠 Mảnh Thánh: <b style="color:'+(S.sh>=C.shNeed?'#7fe08a':'#ff7a7a')+'">'+S.sh+'</b> / '+C.shNeed+'</div><div class="st">'+C.shNeed+' Mảnh Thánh → <b>'+Math.round(C.shRate*100)+'%</b> ra 1 món Thánh ngẫu nhiên (10 vị trí). Thất bại mất '+C.shLose+' mảnh.</div><div class="st">Đã kết hợp: '+S.ok+' thành công / '+S.tr+' lần</div>'
  +'<button '+(S.sh<C.shNeed?'disabled':'')+' onclick="HL.combine()">✨ Kết hợp</button></div>';
 const k=n();
 h+='<div class="dt"><b>③ Bộ Thánh đang mặc: <span style="color:#ffe27a">'+k+'/10</span></b>'+OPT.map((o,i)=>{const a=k>=C.need[i];return'<div class="st" style="color:'+(a?'#ffe27a':'#8a8a8a')+'">'+(a?'✔':'🔒')+' '+C.need[i]+' món: '+(a?o:'???')+'</div>'}).join('')+'</div>';
 h+='<div class="dt"><small>🌙 Mảnh Nguyệt Thạch nhận từ: Rương hoạt lực (mốc 60/80/100), Rương trang bị ở Tạp Hóa (5%). Vòng quay may mắn (tab 🎡): 5% ra Mảnh Nguyệt Thạch. Boss Thánh: cập nhật sau.</small></div>';
 return h}
return{C,S,OPT,img:IMGS,n,on,nOn,
 dmg:()=>on(0)?1+C.dmg:1,df:()=>on(1)?1+C.def:1,hp:()=>on(1)?1+C.def:1,el:()=>on(2)?1+C.elem:1,
 crit:()=>on(3)?C.crit/100:0,cdmg:()=>on(3)?C.cdmg/100:0,dc:()=>on(3)?C.dc:0,
 vs:e=>on(4)?((e&&(e.pvp||e.isPlayer)?1+C.pvp:1)*(e&&(e.thienNhan||e.tnm)?1+C.tn:1)):1,
 special:()=>on(4),
 isEl:(nm,pf)=>!!(pf&&(pf.burn||pf.poison||pf.freeze))||/Hỏa|Băng|Lôi|Sét|Tuyết|Ngũ Hành|Phong/.test(nm||''),
 sum:()=>' · '+nOn()+'/5 opt',
 gen,forge,combine,addNT,shopNT,tipTxt,ui:ui_,loadImgs,
 save:()=>({sh:S.sh|0,nt:S.nt|0,tr:S.tr|0,ok:S.ok|0}),
 load:o=>{o=o||{};S.sh=o.sh|0;S.nt=o.nt|0;S.tr=o.tr|0;S.ok=o.ok|0},
 reset:()=>{S.sh=S.nt=S.tr=S.ok=0}}
})();
HL.loadImgs([ASSET_URL("a003"), ASSET_URL("a004"), ASSET_URL("a005"), ASSET_URL("a006"), ASSET_URL("a007"), ASSET_URL("a008"), ASSET_URL("a009"), ASSET_URL("a010"), ASSET_URL("a011"), ASSET_URL("a012")]);
/* ================= VÒNG QUAY MAY MẮN (LW) =================
   10 ô bí ẩn · quay miễn phí mỗi 15 phút hoặc dùng Chìa Khóa (Boss Thế Giới rơi 10%) */
const LW=(()=>{
const C={freeMs:15*60e3,keyRate:.1,
 pNT:.05,pTT:.10,pG2:.10,pG1:.20,   /* còn lại 55% là phần thưởng ngẫu nhiên */
 g2:2e6,g1:1e6,
 SEC:['nt','rd','g1','rd','tt','rd','g1','rd','g2','rd']};   /* 10 ô: 1 Nguyệt Thạch, 1 Thiên Thần, 1 túi 2M, 2 túi 1M, 5 ngẫu nhiên */
const S={t:0,key:0,sp:0};
let rot=0,busy=false,rev={},last='';
const left=()=>Math.max(0,S.t+C.freeMs-Date.now());
const fmt=ms=>{const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function reward(cat){
 if(cat=='nt'){HL.addNT(1);return['🌙','1 Mảnh Nguyệt Thạch']}
 if(cat=='tt'){const it=gen(P.lv,5);BAG.push(it);return['🌟','trang bị Thiên Thần: '+it.n]}
 if(cat=='g2'){gold+=C.g2;return['💰','Túi vàng '+fmtN(C.g2)]}
 if(cat=='g1'){gold+=C.g1;return['💰','Túi vàng '+fmtN(C.g1)]}
 const k=Math.floor(R()*6);
 if(k==0){const n=20+Math.floor(R()*21);frag+=n;return['🔹',n+' mảnh chế tạo']}
 if(k==1){hpP+=5;mpP+=5;return['🧪','5 bình HP + 5 bình MP']}
 if(k==2){gold+=300000;return['💰','Túi vàng '+fmtN(300000)]}
 if(k==3){const it=gen(P.lv,3);BAG.push(it);return['📦','trang bị Sử Thi: '+it.n]}
 if(k==4){const v=Math.round(nx()*.5);P.xp+=v;return['✨',fmtN(v)+' kinh nghiệm']}
 let m;try{m=MN.get()}catch(e){m=null}
 if(m){const f=100+Math.floor(R()*201),h=50+Math.floor(R()*101);m.fe+=f;m.hk+=h;return['⛏',f+' Quặng Sắt + '+h+' Huyền Kim']}
 gold+=300000;return['💰','Túi vàng '+fmtN(300000)]}
function spin(useKey){
 if(busy)return;
 if(BAG.length>=capN()-1){msg='Túi gần đầy, hãy dọn chỗ trước khi quay';ui();return}
 if(useKey){if(S.key<1){msg='Không có Chìa Khóa';ui();return}}
 else if(left()>0){msg='Chưa đến giờ quay miễn phí';ui();return}
 if(useKey)S.key--;else S.t=Date.now();
 S.sp++;
 const x=R(),cat=x<C.pNT?'nt':x<C.pNT+C.pTT?'tt':x<C.pNT+C.pTT+C.pG2?'g2':x<C.pNT+C.pTT+C.pG2+C.pG1?'g1':'rd';
 const ids=[];C.SEC.forEach((c,i)=>{if(c==cat)ids.push(i)});
 const sec=ids[Math.floor(R()*ids.length)],res=reward(cat);
 try{sv()}catch(e){}
 const cur=((rot%360)+360)%360,want=(((-(sec*36+18))%360)+360)%360,jit=(R()-.5)*20;
 rot=rot+360*5+((want-cur+360)%360)+jit;
 rev={};busy=true;last='';
 const el=document.getElementById('lwW');
 if(el){el.style.transition='transform 4s cubic-bezier(.12,.6,.1,1)';el.style.transform='rotate('+rot+'deg)'}
 setTimeout(()=>{busy=false;rev[sec]=res[0];last=res[0]+' Nhận được '+res[1]+'!';msg=last;if(typeof bo!='undefined'&&bo)ui()},el?4100:0)}
function ui_(){
 const rd=left()<=0,cols=['#5a3a7a','#3a2a5a'];
 let h='<div class="dt" style="color:#ffe27a"><b>🎡 Vòng Quay May Mắn</b><br><small>10 ô bí ẩn. Quay miễn phí mỗi 15 phút, hoặc dùng 🗝 Chìa Khóa (Boss Thế Giới rơi 10%).</small></div>';
 let lab='';for(let i=0;i<10;i++){const a=i*36+18;lab+='<div style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;transform:rotate('+a+'deg) translateY(-92px);text-align:center;font-size:24px;line-height:34px"><span style="display:inline-block;transform:rotate('+(-a)+'deg) rotate('+(-(rot%360))+'deg)">'+(rev[i]||'❓')+'</span></div>'}
 let grad='conic-gradient(';for(let i=0;i<10;i++)grad+=cols[i%2]+' '+i*36+'deg '+(i+1)*36+'deg'+(i<9?',':'');grad+=')';
 h+='<div style="position:relative;width:250px;height:262px;margin:6px auto"><div style="position:absolute;left:50%;top:0;margin-left:-12px;border:12px solid transparent;border-top:22px solid #ffe27a;width:0;height:0;z-index:3"></div>'
  +'<div id="lwW" style="position:absolute;left:5px;top:20px;width:240px;height:240px;border-radius:50%;background:'+grad+';border:4px solid #ffe27a;box-shadow:0 0 14px #ffe27a88;transform:rotate('+rot+'deg)">'+lab+'<div style="position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#2a1a10;border:3px solid #ffe27a;text-align:center;line-height:40px;font-size:22px">🎡</div></div></div>';
 h+='<div class="dt"><div class="st">⏱ Quay miễn phí: <b id="lwT" style="color:'+(rd?'#7fe08a':'#ffb070')+'">'+(rd?'SẴN SÀNG':fmt(left()))+'</b></div><div class="st">🗝 Chìa Khóa: <b>'+S.key+'</b> · Đã quay: '+S.sp+' lần</div>'
  +'<button '+(rd&&!busy?'':'disabled')+' onclick="LW.spin(0)">🎡 Quay miễn phí</button><button '+(S.key>0&&!busy?'':'disabled')+' onclick="LW.spin(1)">🗝 Quay bằng Chìa Khóa</button></div>';
 h+='<div class="dt"><small>Tỉ lệ: 🌙 Mảnh Nguyệt Thạch 5% · 🌟 trang bị Thiên Thần 10% · 💰 Túi vàng 2.000.000 10% · 💰 Túi vàng 1.000.000 20% · 55% còn lại: ngẫu nhiên (mảnh chế tạo, bình HP/MP, túi vàng nhỏ, trang bị Sử Thi, kinh nghiệm, quặng).</small></div>';
 return h}
setInterval(()=>{try{if(typeof tab=='undefined'||tab!=16||!bo||busy)return;const el=document.getElementById('lwT');if(!el)return;const r=left()<=0;if(r&&el.textContent!='SẴN SÀNG'){ui();return}if(!r)el.textContent=fmt(left())}catch(e){}},1000);
return{C,S,spin,ui:ui_,
 addKey:n=>{S.key+=n|0},
 save:()=>({t:S.t|0?S.t:0,key:S.key|0,sp:S.sp|0}),
 load:o=>{o=o||{};S.t=+o.t||0;S.key=o.key|0;S.sp=o.sp|0},
 reset:()=>{S.t=0;S.key=0;S.sp=0}}
})();
const CN=i=>{const p=PS[i];return(p&&p.nm)||CHR[i].n};
let SKF=0,bgp=0;const capN=()=>{const t=(PS[cur]||{}).tier|0;return 90+(t>=2?30:0)+(t>=3?30:0)},bgLk=k=>{const t=(PS[cur]||{}).tier|0;return k==3?t<2:k==4?t<3:false};let P,E,PJ,DT,PT,cd,auto=1,fr=0,cam=0,mvDir=0,over=0,Q,EQS=[0,1,2].map(()=>Array(NS).fill(null)),BAGS=[[],[],[]],EQ=EQS[0],BAG=BAGS[0],gold=0,bo=0,sel=null;
const AXN={dodge:'Né',acc:'Chính xác',crit:'Chí mạng',cdmg:'ST chí mạng',dred:'Giảm ST nhận',hpp:'Tăng % máu',dmgp:'Tăng % sát thương',mpp:'Tăng % năng lượng',cdr:'Giảm hồi chiêu',sdmg:'Sát thương kỹ năng',aspd:'Tốc độ tấn công',cspd:'Tốc độ niệm chú',dotd:'ST hiệu ứng độc & bỏng',prc:'Tỉ lệ xuyên giáp',eres:'Kháng hiệu ứng',stnc:'Tỉ lệ gây choáng',frzc:'Tỉ lệ đóng băng'},AXU={dodge:.8,acc:1.2,crit:.6,cdmg:2,dred:.6,hpp:1.5,dmgp:1.5,mpp:2,cdr:.5,sdmg:1.5,aspd:.8,cspd:.8,dotd:2,prc:1,eres:1,stnc:.8,frzc:.8},RMX=[1,1.4,1.9,2.6,3.5,4.6,13.8];
function rollX(r,l,mp){const ks=Object.keys(AXU).sort(()=>R()-.5).slice(0,r+1),x={};ks.forEach(k=>x[k]=Math.round(AXU[k]*RMX[r]*(.7+.6*R())*(1+l/100)*(1+(mp|0)*.08)*10)/10);return x}
const PT4=[{n:['Hổ Con','Mãnh Hổ','Bạch Hổ Sơn Quân','Thiên Cương Thần Hổ'],e:'🐯',m:.55,cd:70,rg:120,d:'Cận chiến mạnh · +% sát thương'},{n:['Ưng Non','Thương Ưng','Kim Sí Điêu','Cửu Thiên Thần Ưng'],e:'🦅',m:.35,cd:45,rg:340,d:'Tầm xa, đánh nhanh · +% chí mạng, chính xác'},{n:['Long Ấu','Hỏa Long','Thanh Vân Thần Long','Tinh Hà Long Vương'],e:'🐉',m:.34,cd:58,rg:270,d:'Bay lượn vỗ cánh, phun long tức tầm xa · +% ST chí mạng, giảm hồi chiêu'},{n:['Huyền Vũ Sơ Sinh','Huyền Vũ Chiến Binh','Cổ Đại Huyền Vũ','Tối Thượng Huyền Vũ'],e:'🐢',m:.24,cd:80,rg:120,d:'Thần thú Rùa-Rắn · cắn nhanh, hồi máu chủ nhân · +% giảm ST nhận, % máu'}],PCAP=[10,20,35,50],PEG=[3000,20000,100000],PCAPD=[15,30,45,60],PEGD=[9000,60000,300000],pcap=p=>p.k==2?PCAPD[p.ev]:PCAP[p.ev],peg=p=>p.k==2?PEGD[p.ev]:PEG[p.ev],PCL=['#d8d8d8','#6fdc6f','#c070ff','#ffa733'];
const pet=()=>PS[cur].tier>0?PS[cur].pet:null,pnd=p=>Math.round(40*Math.pow(1.12,p.lv)),pv=p=>1+.04*(p.lv-1)+.3*p.ev;
function PB(k){const p=pet();if(!p)return 0;const v=pv(p),t=p.k;return({dmgp:t==0?5*v:0,crit:t==1?3*v:0,acc:t==1?3*v:0,cdmg:t==2?8*v:0,cdr:t==2?2*v:0,dred:t==3?4*v:0,hpp:t==3?6*v:0})[k]||0}
const SX=k=>EQ.reduce((t,i)=>t+(i&&i.x?i.x[k]||0:0),0)+PB(k)+WB(k)+(typeof twB=='function'?twB(k):0);
function pcheck(p){while(p.lv<pcap(p)&&p.xp>=pnd(p)){p.xp-=pnd(p);p.lv++}}
function petGain(e){const p=pet();if(!p||p.lv>=pcap(p))return;p.xp+=(e.b?8:1)*(1+e.lv/10);pcheck(p)}
const sm=k=>EQ.reduce((t,i,x)=>t+(i&&(x!=10||PS[cur].tier>0)?Math.round(i[k]*(1+.15*i.u)):0),0),atk=()=>Math.round(.55*((20+P.lv*8)*CHR[cur].a+sm('a')+al(0)*3)*(1+.25*PS[cur].tier)*(setOn()?1.3:1)*ZC.cb()*ZC.pa()*HL.dmg()*(1+SX('dmgp')/100)),mx=()=>Math.round(((200+P.lv*60)*CHR[cur].h+sm('h')+al(1)*25)*(1+.25*PS[cur].tier)*(setOn()?1.3:1)*ZC.cb()*ZC.ph()*HL.hp()*(1+SX('hpp')/100)),mm=()=>Math.round(((60+P.lv*8)*CHR[cur].m+al(2)*8)*ZC.mb()*ZC.pm()*(1+SX('mpp')/100)),nx=()=>Math.round(100*Math.pow(P.lv,1.4));
function init(){P={x:120,pe:null,atkT:1,hp:1,mp:1,lv:P?P.lv:1,xp:P?P.xp:0,d:1,atk:0,mv:0};P.hp=mx();P.mp=mm();E=[];PJ=[];DT=[];PT=[];PETS=[];FX=[];SLT=[60,130,200,270,340];wbq=0;P.pe=null;cd=SK.map(()=>0);Q={k:0,n:20,done:0};over=0}
function dm(e,m,sl){if(R()>cl(.88+SX('acc')/100-(.03+mi()*.02+(e.b?.03:0)),.35,1)){DT.push({x:e.x,y:(e.hh||100)*SZ,s:'Trượt',c:'#aaa',l:35});return}let d=atk()*m*(.9+R()*.2)*100/(100+(e.df||0)),k=R()<Math.min(.85,.15+al(3)*.01+ZC.crit()+(setOn()?.1:0)+SX('crit')/100+HL.crit());if(k){d*=1.8+SX('cdmg')/100+HL.cdmg();if(R()<HL.dc()){d*=2;DT.push({x:e.x,y:(e.hh||100)*SZ+16,s:'✨ x2 Chí mạng!',c:'#ffe27a',l:45})}}d*=HL.vs(e);if(SKF)d*=1+SX('sdmg')/100;d=Math.round(d);e.hp-=d;e.fl=6;if(sl)e.sl=150;DT.push({x:e.x,y:(e.hh||100)*SZ,s:d,k,l:55});for(let i=0;i<4;i++)PT.push({x:e.x,y:60,vx:(R()-.5)*4,vy:R()*-3,l:25,c:'#ffd'})}
const near=(r)=>{let b=null;E.forEach(e=>{if(e.in>0)return;const d=Math.abs(e.x-P.x);if(d<r&&(!b||d<Math.abs(b.x-P.x)))b=e});return b};
let PETS=[],FX=[],SLT=[],wbq=0,pp={x:0};
const NYI=new Image();NYI.src=ASSET_URL("a013");const NYC={};
const KDI=new Image();KDI.src=ASSET_URL("a014");
const HQI=new Image();HQI.src=ASSET_URL("a015");
const nyi=c=>{if(!NYI.complete||!NYI.naturalWidth)return null;if(NYC[c])return NYC[c];const w=NYI.naturalWidth,h=NYI.naturalHeight,v=document.createElement('canvas');v.width=w;v.height=h;const q=v.getContext('2d');q.drawImage(NYI,0,0);q.globalCompositeOperation='source-atop';q.globalAlpha=.32;q.fillStyle=c;q.fillRect(0,0,w,h);return NYC[c]=v};
const NYD=(x,y,h,al,c)=>{const v=nyi(c);if(!v)return;const w=h*v.width/v.height;g.save();g.translate(x,y);g.globalCompositeOperation='source-over';g.globalAlpha=al*.85;g.drawImage(v,-w/2,-h/2,w,h);g.globalCompositeOperation='lighter';g.globalAlpha=al*.22;g.drawImage(v,-w/2,-h/2,w,h);g.restore()};
const SPR={golem:ASSET_URL("a016"),ogre:ASSET_URL("a017"),mage:ASSET_URL("a018"),gob:ASSET_URL("a019"),wolf:ASSET_URL("a020"),scorp:ASSET_URL("a021"),arch:ASSET_URL("a022"),pal:ASSET_URL("a023")},MI={};for(const k in SPR){MI[k]=new Image();MI[k].src=SPR[k]}
function TK(){const t=CHR[cur].t;return t=='a'&&PS[cur].br==1?'w':t}
function ZK(){const t=CHR[cur].t,b=PS[cur].br;return t=='w'&&b==1?'w1':t=='m'&&b==0?'m0':t=='a'&&b==1?'a1':t}
const sks=()=>{const p=PS[cur],c=CHR[cur],b=p.br>=0?c.br[p.br]:null;return[...(b&&b.b?b.b:c.k),...(b?b.k:[0,1,2,3].map(()=>['???','🔒',0,1e9,9,0]))]},
ok=i=>{const t=PS[cur].tier;return i<2||(i<4&&t>=1)||(i==4&&t>=2)||(i==5&&t>=3)},
DS={w:80,a:380,m:330},RG={w:210,a:560,m:520},ANI={w:22,a:30,m:40},DL={w:16,a:30,m:52},NF={w:1,m:1,a:1},
MS={gob:{n:'Goblin',h:62,f:1,hm:1,rg:60},wolf:{n:'Sói',h:56,f:-1,hm:1.2,rg:60},scorp:{n:'Bọ Cạp',h:60,f:1,hm:1.1,rg:60},arch:{n:'Xạ Đá',h:96,f:1,hm:.9,rg:340},mage:{n:'Goblin Pháp',h:62,f:-1,hm:.8,rg:320},ogre:{n:'Ogre',h:118,f:-1,hm:2,rg:90},golem:{n:'Golem',h:168,f:1,hm:1,rg:120},pal:{n:'Morakh',h:196,f:1,hm:1,rg:130}},
POOL=['gob','wolf','scorp','arch','mage','ogre','gob','wolf'],vw=()=>W/s,sx=i=>vw()*(.4+.115*i);
function rf(){SK=sks();SL=SLS[CHR[cur].t];NM=SL.map(q=>ADJ.map(a=>q[0]+' '+a));EQ=EQS[cur];BAG=BAGS[cur];cd=SK.map(()=>0);setSK()}
function an(D){P.atkT=D+12;P.atk=D+12}
const MR=150,DASHR=340;let MSGF=0;
function needMsg(){if(fr-MSGF>40){MSGF=fr;DT.push({x:P.x,y:130,s:'Cần áp sát quái!',c:'#ffb070',l:40})}}
function actEnd(){P.act=null;P.jy=0;P.jr=0}
function spawn(i){const wb=wbq&&i==2,bt=wb?2:(!E.some(e=>e.b==1||e.b==3)&&(pq[1]>0||pq[0]>0))?(pq[1]>0?3:1):0,b=bt==1||bt==3,k=wb?'pal':bt==3?'golem':bt==1?'ogre':POOL[Math.floor(R()*POOL.length)],m=MS[k],L=cl(P.lv+Math.floor(R()*5)-2+(wb||b?3:0),LR[mapSel][0],LR[mapSel][1]),h=3*(60+L*25)*(1+mi()*.5)*m.hm*(wb?40:bt==3?22+mi()*3:b?8+mi()*1.5:1)*(lg?2.2:1)*cqM(),df=(8+L*2.2)*(1+mi()*.4)*(wb?2.5:bt==3?2.3:b?1.8:1)*(lg?1.35:1)*(1+(cqM()-1)/2);if(wb)wbq=0;if(bt==3){pq[1]--;DT.push({x:P.x,y:210,s:'👑 Boss Sử Thi xuất hiện!',c:'#d9a0ff',l:150})}else if(bt==1){pq[0]--;DT.push({x:P.x,y:210,s:'⭐ Boss Tinh Anh xuất hiện!',c:'#7fd0ff',l:130})}const sxx=P.x>vw()*.55?-50-i*45:vw()+50+i*45;E.push({k,sn:i,x:sxx,hp:h,max:h,df,b:bt,m:mi(),lv:L,cd:30,sl:0,fl:0,in:6,hh:m.h,rg:m.rg});for(let j=0;j<10;j++)PT.push({x:sxx,y:30,vx:(R()-.5)*3,vy:-R()*3,l:30,c:'#d8a0ff'})}
function cast(i){const k=SK[i];if(over||bo||vil||!started||!ok(i)||cd[i]>0||P.mp<k[2]||P.pe||P.act)return;const t=k[4],T=TK();if(T=='w'){if(![3,6,10].includes(t)&&!near(t==13||t==17?DASHR:MR)){if(!auto)needMsg();return}}else if([0,1,2,4,7,8,11,12].includes(t)&&!near(RG[T]+60))return;P.mp-=k[2];QE('cast');cd[i]=k[3]*1.6;const D=Math.max(6,Math.round(DL[T]/(1+Math.min(1,SX('cspd')/100))));an(D);P.ln=k[0];P.pe={l:D,f:()=>fire(i),t,n:k[0]}}
function fire(i){const k=SK[i],t=k[4],T=TK(),c=CHR[cur].c,br=PS[cur].br;ZS.sfx(k,T,c);
if(t==0)PJ.push({x:P.x+40*P.d,vx:(T=='a'?12:8)*P.d,l:90,d:k[5],h:[],k:T,n:k[0],pi:k[5]>=4,big:k[5]>=3});
if(t==1){E.forEach(e=>{if(Math.abs(e.x-P.x)<k[6])dm(e,k[5])});0}
if(t==2){const e=near(T=='w'?MR+40:RG[T]+80);if(e){dm(e,k[5]);0}}
if(t==3){const q=Math.round(mx()*k[5]);P.hp=Math.min(mx(),P.hp+q);DT.push({x:P.x,y:120,s:'+'+q,g:1,l:55});0}
if(t==4){E.forEach(e=>{if(Math.abs(e.x-P.x)<k[6])dm(e,k[5],1)});0}
if(t==5){E.forEach(e=>dm(e,k[5]));0}
if(t==6){if(window.SUMC)SUMC(k);else{if(PETS.length>=3)PETS.shift();PETS.push({x:P.x-40,k:k[6],l:840,cd:0,m:k[5]});DT.push({x:P.x,y:140,s:'Triệu hồi '+k[0],g:1,l:60})}}if(t>=7)xfire(k)}
function xfire(k){const t=k[4],o=k[7]||{},rg=TK()=='w'?MR+40:RG[TK()]+80,heal=q=>{q=Math.round(mx()*q);P.hp=Math.min(mx(),P.hp+q);DT.push({x:P.x,y:120,s:'+'+q,g:1,l:55})};
if(t==7){const e=near(rg);if(!e)return;for(let j=0;j<(o.h||2);j++)ZS.later(j*4,()=>{if(e.hp>0)dm(e,k[5])})}
else if(t==8){let n=0;E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<k[6]){dm(e,k[5],o.sl);n++}});if(o.hl&&n)heal(o.hl)}
else if(t==10){if(o.s||o.d)ZC.setS(o.s||0,o.d||0);if(o.hp)heal(o.hp);if(o.mp){const q=Math.round(mm()*o.mp);P.mp=Math.min(mm(),P.mp+q);DT.push({x:P.x,y:90,s:'+'+q+' MP',c:'#7ab8ff',l:55})}}
else if(t==11){const L=E.filter(e=>e.in<=0).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x)).slice(0,o.n||5);L.forEach((e,i)=>ZS.later(i*3,()=>{if(e.hp>0)dm(e,k[5])}))}
else if(t==12){E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<k[6])dm(e,k[5]*(e.hp<e.max*.35?2:1))})}else if(t>=13)ZS.act.skill(k)}
function basic(T){const e=near(DS[T]+90);if(!e)return;if(T=='w'){dm(e,1);FX.push({t:'sl',x:e.x,br:PS[cur].br,c:CHR[cur].c,l:14,m:14})}else PJ.push({x:P.x+40*P.d,vx:(T=='a'?12:8)*P.d,l:70,d:T=='a'?1.1:1,h:[],k:T})}
const PSC=.58,DNS=.4,DTX=.56;
const PK=[{sp:4.6,sd:54,al:0,at:22,h:50,bc:'#ffa733'},{sp:5.6,sd:175,al:62,at:26,h:44,bc:'#ffe9a0'},{sp:3.6,sd:175,al:34,at:22,h:46,bc:'#bfe3ff'},{sp:2.9,sd:46,al:0,at:34,h:36,bc:'#6fe0ff'}],
PSK=[{n:'Hổ Khiếu',d:'gầm vang, chấn thương mọi địch quanh thú',cd:420,m:2.3},{n:'Phong Vũ',d:'mưa lông vũ xé gió đánh nhiều địch',cd:360,m:.9},{n:'Long Tức',d:'phun hơi thở rồng theo hệ từng cấp: Sương Giá · Liệt Hỏa · Lôi Thủy · Tinh Hà',cd:380,m:1.5},{n:'Huyền Vũ Hộ Thể',d:'hồi máu chủ nhân và dựng khiên nước',cd:520,m:0}],
GLC={};
function glowSpr(c){let o=GLC[c];if(!o){o=document.createElement('canvas');o.width=o.height=96;const q=o.getContext('2d'),r=q.createRadialGradient(48,48,0,48,48,48);r.addColorStop(0,RGBA(c,.9));r.addColorStop(.35,RGBA(c,.38));r.addColorStop(1,RGBA(c,0));q.fillStyle=r;q.fillRect(0,0,96,96);GLC[c]=o}return o}
function glowDraw(x,y,r,c,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSpr(c),x-r,y-r,r*2,r*2);g.restore()}
function pm(p){return PT4[p.k].m*(1+.06*(p.lv-1))*(1+.35*p.ev)}

/* ===== Huyền Vũ: tư thế cắn / gồng khiên + vẽ lát cắt (rắn uốn lượn) ===== */
const sm3=x=>x*x*(3-2*x);
function hvW(u,kind){if(kind)return 0;if(u<.3)return -.22*Math.sin(u/.3*1.5708);if(u<.5)return -.22+1.22*sm3((u-.3)/.2);return 1-sm3((u-.5)/.5)}
function hvY(u,kind){if(kind)return u<.5?Math.sin(u/.5*1.5708)*10:Math.cos((u-.5)/.5*1.5708)*10;const v=(u-.28)/.34;return v>0&&v<1?Math.sin(v*3.1416)*8:0}
function hvDraw(im,ww,hh,ev,at,atk,kind,mvf,t){const N=28,iw=im.naturalWidth,ih=im.naturalHeight,amp=(1.1+ev*.55+mvf*1.6)*s,w0=atk&&!kind?hvW(at,0):0,sa=atk&&kind?Math.sin(at*3.14):0;
 for(let i=0;i<N;i++){const v=1-(i+.5)/N,up=Math.max(0,(v-.3)/.7),up2=up*up;let off=0;
  if(ev>=1)off+=Math.sin(t*.075-v*4.2+EP.ph*.6)*amp*up2*1.6;
  off+=Math.sin(t*.11+v*2)*.55*s*up;
  off+=w0*(6+ev*2.5)*s*v*v*1.3;
  if(sa)off+=Math.sin(t*.35+v*5)*1.6*s*up2*sa;
  const y0=Math.floor(i*ih/N);g.drawImage(im,0,y0,iw,Math.min(Math.ceil(ih/N)+1,ih-y0),-ww/2+off,-hh+i*hh/N,ww,hh/N+.9)}}
function hvFx(cx,by,hh,ww,col,bc,k,atk,at,t){
 if(k==3&&atk&&EP.kind){g.save();g.globalCompositeOperation='lighter';g.fillStyle=bc;for(let i=0;i<14;i++){const a=t*.22+i*.45,u2=((i/14)+at*1.2)%1,r=ww*(.75-.45*u2);g.globalAlpha=.7*Math.sin(u2*3.14);g.beginPath();g.arc(cx+Math.cos(a)*r,by-u2*hh*1.1,(1.6+(i%3))*s,0,6.2832);g.fill()}g.restore()}
 if(EP.evT!==undefined&&fr-EP.evT<130&&fr-EP.evT>=0){const u=(fr-EP.evT)/130;g.save();g.globalCompositeOperation='lighter';
  const q=g.createLinearGradient(0,by-hh*3.2,0,by);q.addColorStop(0,RGBA(col,0));q.addColorStop(.7,RGBA(col,.55*(1-u)));q.addColorStop(1,RGBA(col,.15*(1-u)));g.fillStyle=q;const pw=ww*(.5+.5*Math.sin(Math.min(1,u*1.4)*3.14));g.fillRect(cx-pw/2,by-hh*3.2,pw,hh*3.2);
  g.strokeStyle=col;g.lineWidth=2.4*s;for(let j=0;j<3;j++){const p2=(u*1.5+j*.28)%1;g.globalAlpha=(1-p2)*(1-u*.6);g.beginPath();g.ellipse(cx,by-4*s,ww*(.3+p2*1.5),ww*(.3+p2*1.5)*.28,0,0,6.2832);g.stroke()}
  g.fillStyle='#fff';g.globalAlpha=1-u;for(let i=0;i<16;i++){const a=i*.39+u*3,r=ww*(.2+u*1.1),yy=by-hh*(.2+((i*.37+u*1.6)%1)*1.5);g.beginPath();g.arc(cx+Math.cos(a)*r,yy,(1.2+(i%3)*.8)*s,0,6.2832);g.fill()}g.restore()}}
function epstep(){const p=pet();if(!p)return;const T=PT4[p.k],K=PK[p.k],ev=p.ev,k=p.k;
if(EP.t===undefined)Object.assign(EP,{t:0,y:K.al,vx:0,d:1,at:0,atT:1,ox:EP.x,tgx:EP.x,tg:null,kind:0,sk:180,ph:0,hit:0,ps:-1});
if(EP.ps!==k){EP.ps=k;EP.y=K.al;EP.at=0;EP.vx=0;EP.sk=180}
if(Math.abs(EP.x-P.x)>480){EP.x=P.x-60*P.d;EP.vx=0;EP.at=0}
EP.t++;EP.cd--;EP.sk--;
let e=null,bd=1e9;E.forEach(q=>{if(q.in<=0){const d=Math.abs(q.x-EP.x);if(d<T.rg+170&&d<bd){bd=d;e=q}}});
const M=pm(p);
if(EP.at>0){const u=1-EP.at/EP.atT,w=Math.sin(Math.min(1,u)*3.1416),tg=EP.tg;
 if(tg&&E.includes(tg))EP.tgx=tg.x;
 const side=EP.ox<EP.tgx?-1:1,reach=[.92,.84,.12,.8][k],gx=EP.tgx+side*[34,70,0,30][k];
 EP.x=EP.ox+(gx-EP.ox)*(k==3?hvW(u,EP.kind):w)*reach;if(Math.abs(EP.tgx-EP.ox)>1)EP.d=Math.sign(EP.tgx-EP.ox);
 EP.y=k==0?w*(EP.kind?58:40):k==1?K.al+ev*8-w*(K.al+ev*8-16):k==3?hvY(u,EP.kind):k==2?K.al+ev*6+w*12:0;
 if(u>=.5&&!EP.hit){EP.hit=1;
  if(EP.kind==0){if(tg&&E.includes(tg)){dm(tg,M,k==2);ZS.pf.hit(k,ev,tg.x,0);if(k==3){const h=Math.round(mx()*.012*pv(p));P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:120,s:'+'+h,g:1,l:40})}}}
  else ZS.pf.skill(k,ev,EP.x,M,p)}
 EP.at--;if(EP.at<=0){EP.x=EP.ox;EP.vx=0}
 return}
let tx=Math.max(40,P.x-[52,80,68,40][k]*P.d),run=1;
if(e){const s2=EP.x<e.x?-1:1;tx=e.x+s2*K.sd;tx=k==0?cl(tx,Math.max(40,P.x-90),P.x+300):cl(tx,Math.max(40,P.x-95),P.x+30)}
const dx=tx-EP.x,far=Math.abs(EP.x-P.x)>200;if(far)run=1.9;
const des=Math.max(-K.sp*run,Math.min(K.sp*run,dx*.07*run));
EP.vx+=(des-EP.vx)*.16;if(Math.abs(dx)<4&&Math.abs(EP.vx)<.3)EP.vx*=.5;EP.x+=EP.vx;
if(Math.abs(EP.vx)>.35)EP.d=Math.sign(EP.vx);else if(e)EP.d=Math.sign(e.x-EP.x)||EP.d;else EP.d=P.d;
const mvf=Math.min(1,Math.abs(EP.vx)/2.2);EP.ph+=mvf*.3+.05;
const bob=Math.sin(EP.t*.07);if(k==3&&mvf>.45&&EP.t%7==0)PT.push({x:EP.x-EP.d*10+R()*6,y:2,vx:-EP.d*(.3+R()*.4),vy:.4+R()*.8,l:22,c:ev>=3?'#ffe9a0':'#bfe8ff'});
if(k==0){const hp=Math.abs(Math.sin(EP.ph*1.05))*(12+ev*3)*mvf;EP.y+=(hp-EP.y)*.5;if(mvf>.6&&EP.y<1.5&&EP.lastY>3&&EP.t%2==0){for(let i=0;i<3;i++)PT.push({x:EP.x-EP.d*8,y:2,vx:(R()-.5)*1.4-EP.d*.6,vy:.8+R()*1.6,l:20,c:'#c9a878'})}EP.lastY=EP.y}
else if(k==1)EP.y+=(K.al+ev*8+bob*8+mvf*Math.sin(EP.ph*2)*5-EP.y)*.12;
else if(k==2)EP.y+=(K.al+ev*6+bob*7+mvf*Math.sin(EP.ph*2)*4-EP.y)*.1;
else EP.y+=(Math.abs(Math.sin(EP.ph*1.1))*2.2*mvf-EP.y)*.4;
if(k==1&&mvf>.5&&EP.t%5==0)PT.push({x:EP.x-EP.d*14,y:EP.y+6,vx:-EP.d*.6,vy:.2,l:30,c:'#fff3c0'});
if(e&&EP.cd<=0&&EP.at<=0&&Math.abs(e.x-EP.x)<T.rg+30){
 const spec=EP.sk<=0;
 if(k==3&&!spec&&0){}
 EP.ox=EP.x;EP.tg=e;EP.tgx=e.x;EP.hit=0;EP.kind=spec?1:0;if(!spec&&(k==1||k==2))ZS.pf.shoot(k,EP.x,e.x,EP.y+20);EP.atT=spec?(k==3?54:36):K.at;EP.at=EP.atT;EP.cd=T.cd;if(spec)EP.sk=Math.round(PSK[k].cd*(1-.05*ev))}
else if(k==3&&EP.sk<=0&&EP.at<=0&&(P.hp<mx()*.85||E.length)){EP.ox=EP.x;EP.tg=null;EP.tgx=EP.x;EP.hit=0;EP.kind=1;EP.atT=54;EP.at=54;EP.sk=Math.round(PSK[3].cd*(1-.05*ev))}}

/* ---- Rồng: vẽ thân + cánh vỗ uyển chuyển ---- */
function drDraw(ev,ww,hh,mvf,atk,at,t){
 const M=DRG[ev],D=DRI[ev];if(!D.b.naturalWidth)return;
 const kk=hh/M.h;g.save();g.translate(-ww/2,-hh);g.scale(kk,kk);
 if(M.face<0){g.translate(M.w,0);g.scale(-1,1)}
 const dt=Math.max(0,Math.min(4,fr-(EP.lw==null?fr:EP.lw)));EP.lw=fr;
 EP.wp=(EP.wp||0)+dt*(.115+mvf*.05+(atk?.07:0));
 const ph=EP.wp,aw=atk?Math.sin(at*3.1416):0,amp=.36+ev*.025+mvf*.1;
 const up=.12+amp*(Math.sin(ph)+.3*Math.sin(2*ph-.9))+aw*.28,lag=.5*amp*Math.sin(ph-1.15);
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 M.wings.forEach((w,j)=>{const img=D.w[j];if(!img||!img.naturalWidth)return;
  const sg=Math.cos(w.ph)>=0?-1:1,N=Math.max(8,Math.round(w.len/4.5)),iw=img.naturalWidth,ih=img.naturalHeight,sw=(iw-w.wx)/N;
  g.save();g.translate(w.hx,w.hy);
  if(w.wx>.5){g.save();g.rotate(w.ph+sg*up*.55);g.drawImage(img,0,0,w.wx,ih,-w.wx,-w.wy,w.wx+.6,ih);g.restore()}
  let px=0,py=0;
  for(let i=0;i<N;i++){const u=(i+.5)/N,a=w.ph+sg*(up*(.55+.45*u)+lag*u*u*1.4);
   g.save();g.translate(px,py);g.rotate(a);g.drawImage(img,w.wx+i*sw,0,sw+.8,ih,0,-w.wy,sw+.8,ih);g.restore();
   px+=Math.cos(a)*sw;py+=Math.sin(a)*sw}
  g.restore()});
 const NB=16,iw=D.b.naturalWidth,ih=D.b.naturalHeight,am2=1.2+mvf*2.2+(atk?1.5:0);
 for(let i=0;i<NB;i++){const v=(i+.5)/NB,wv=Math.sin(ph*.8-v*4.5)*am2*Math.pow(Math.max(0,(v-.5)/.5),1.2)*1.4,y0=Math.floor(i*ih/NB);
  g.drawImage(D.b,0,y0,iw,Math.min(Math.ceil(ih/NB)+1,ih-y0),wv,y0*(M.h/ih),M.w,M.h/NB+1)}
 g.restore()}
function drawEP(){const p=pet();if(!p||EP.t===undefined||EP.ps!==p.k)return;const k=p.k,ev=p.ev,K=PK[k],im=k==3?HVI[ev]:k==2?DRI[ev].b:PTI[k],sz=k==3?HVZ[ev]:k==2?DRZ[ev]:PSZ[k],col=pcol(k,ev),bc=K.bc,t=fr;if(!im.naturalWidth)return;
const hh=(k==3?HVH[ev]:k==2?DRH[ev]:(K.h+ev*7)*PSC)*s,ww=hh*sz[0]/sz[1],at=EP.at>0?1-EP.at/EP.atT:0,cx=(EP.x-cam)*s,by=GY-EP.y*s,mvf=Math.min(1,Math.abs(EP.vx)/2.2),atk=EP.at>0;
g.save();
g.fillStyle='rgba(0,0,0,'+(.3-Math.min(.2,EP.y/260)).toFixed(3)+')';g.beginPath();g.ellipse(cx,GY+2,ww*.36*(1-Math.min(.45,EP.y/180)),4.5*s,0,0,6.2832);g.fill();
glowDraw(cx,by-hh*.5,hh*(.85+ev*.1)+(atk?hh*.4*Math.sin(at*3.14):0),atk&&EP.kind?bc:col,.38+ev*.08+(atk?.35*Math.sin(at*3.14):0));
if(ev>=1){g.save();g.translate(cx,GY+2);g.scale(1,.28);g.rotate(t*.02);g.strokeStyle=RGBA(col,.7);g.lineWidth=1.8*s;g.setLineDash([7*s,5*s]);g.beginPath();g.arc(0,0,ww*.62,0,6.2832);g.stroke();if(ev>=3){g.rotate(-t*.04);g.beginPath();g.arc(0,0,ww*.85,0,6.2832);g.stroke()}g.restore()}
g.translate(cx,by);g.scale(EP.d,1);
let sx=1,sy=1,rot=0,ox=0,oy=0;
if(k==0){const hp=Math.abs(Math.sin(EP.ph*1.05));sy=1+(.07*(1-hp)-.05*hp)*mvf;sx=1/sy;rot=EP.vx?.09*mvf*Math.sign(EP.d):0;if(atk){const w=Math.sin(at*3.14);rot=-.18+.5*w*(at>.5?1:-.3);sx=1+.1*w;sy=1-.06*w}else{sy+=Math.sin(t*.06)*.012}}
else if(k==1){rot=.1*mvf-(atk?.55*Math.sin(at*3.14):0)+Math.sin(t*.07)*.03;oy=-Math.sin(t*.4)*2*s;sy=1+Math.sin(EP.ph*2)*.025;if(atk&&EP.kind)sx=1+.12*Math.sin(at*3.14)}
else if(k==2){rot=.07*mvf;if(atk){const w=Math.sin(at*3.14);rot=-.16*w*(at<.5?1:-.6);sy=1+.04*w}else{sy=1+Math.sin(t*.07)*.012}}
else if(k==3){const stp=Math.sin(EP.ph*1.1);rot=stp*.045*mvf;sy=1-Math.abs(stp)*.04*mvf+Math.sin(t*.06)*.012*(1-mvf);sx=1/sy;if(atk){const w=Math.sin(at*3.14);if(EP.kind){sy=1+.13*w;sx=1-.05*w;rot=-.04*w}else{const hw=hvW(at,0),f=Math.max(0,hw),bk=Math.max(0,-hw)/.22;rot=.13*hw;sx=1+.09*f+.05*bk;sy=1-.08*bk+.04*f}}}
else{rot=Math.sin(t*.04)*.06+(atk?.2*Math.sin(at*3.14):0);sx=1+Math.sin(t*.05)*.015;sy=1/sx;if(atk&&EP.kind){const w=Math.sin(at*3.14);sx=1+.1*w;sy=1+.1*w}}
g.translate(ox,oy);g.rotate(rot);g.scale(sx,sy);
if(k==1){const fl=Math.sin(EP.ph*2.1+(atk?t*.3:0)),a=.85-fl*.95,wl=ww*(.62+ev*.07);g.save();for(let sd=-1;sd<=1;sd+=2){g.save();g.translate(sd*ww*.12,-hh*.52);g.scale(sd,1);g.rotate(-a-.15);const gr=g.createLinearGradient(0,0,wl,-wl*.2);gr.addColorStop(0,'#fff6d8');gr.addColorStop(.6,'#ffe9a0');gr.addColorStop(1,RGBA(col,.55));g.globalAlpha=.88;g.fillStyle=gr;g.beginPath();g.moveTo(0,0);for(let i=0;i<5;i++){const u=i/4,ang=-.5+u*.9,len=wl*(.78+.22*Math.sin(u*3.14));g.lineTo(Math.cos(ang)*len+ww*.02*u,Math.sin(ang)*len*.62-wl*.12*(1-u))}g.lineTo(wl*.45,wl*.2);g.lineTo(0,wl*.08);g.closePath();g.fill();g.globalAlpha=.7;g.strokeStyle='#fff';g.lineWidth=1.1*s;g.stroke();g.restore()}g.restore()}
if(k==2)drDraw(ev,ww,hh,mvf,atk,at,t);
else if(k==3)hvDraw(im,ww,hh,ev,at,atk,EP.kind,mvf,t);else g.drawImage(im,-ww/2,-hh,ww,hh);
if(ev>=2&&k!=2){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.16+.08*Math.sin(t*.1);g.drawImage(im,-ww/2*1.05,-hh*1.04,ww*1.05,hh*1.05);g.restore()}
g.restore();
g.save();g.globalCompositeOperation='lighter';g.fillStyle=col;for(let i=0;i<ev*2;i++){const a=t*.03+i*6.2832/(ev*2),rr=ww*.6,tw=(Math.sin(t*.1+i)+1)/2;g.globalAlpha=.4+tw*.5;g.beginPath();g.arc(cx+Math.cos(a)*rr,by-hh*.5+Math.sin(a)*rr*.55,(1.4+tw*1.6)*s,0,6.2832);g.fill()}g.restore();
if(atk&&EP.kind&&at<.5){const u=at/.5;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=bc;g.shadowColor=bc;g.shadowBlur=14;g.lineWidth=(3+3*u)*s;g.globalAlpha=.8*u;g.beginPath();g.arc(cx,by-hh*.5,hh*(1.1-u*.7),0,6.2832);g.stroke();g.restore()}hvFx(cx,by,hh,ww,col,bc,k,atk,at,t)}

function pstep(){epstep();PETS=PETS.filter(p=>--p.l>0);PETS.forEach((p,i)=>{let e=null;E.forEach(q=>{if(q.in<=0&&Math.abs(q.x-p.x)<300&&(!e||Math.abs(q.x-p.x)<Math.abs(e.x-p.x)))e=q});const tx=e?e.x-(p.x<e.x?55:-55):P.x-60-i*38;p.x+=(tx-p.x)*.06;p.cd--;if(e&&p.cd<=0&&Math.abs(e.x-p.x)<(p.k=='hawk'?260:110)){p.cd=p.k=='golem'?100:75;dm(e,p.m*.7);FX.push({t:'sl',x:e.x,br:0,c:'#fff',l:10,m:10})}})}

function cbar(x,y,w,h,v,col,t){g.fillStyle='#000a';g.fillRect(x,y,w,h);g.fillStyle=col;g.fillRect(x,y,w*cl(v,0,1),h);g.strokeStyle='#b8964e';g.lineWidth=2;g.strokeRect(x,y,w,h);if(t){g.fillStyle='#fff';g.font='bold 13px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(t,x+w/2,y+h-4)}}
const sk=document.getElementById('sk'),ult=document.getElementById('ult'),ae=document.getElementById('au'),bt=[];
[0,1,2,3,4,5].forEach((k,i)=>{const b=i===5?ult:document.createElement('div');b.className='sb';b.id=i===5?'ult':'';b.onpointerdown=e=>{e.stopPropagation();cast(i)};if(i<5)sk.appendChild(b);bt.push(b)});
ult.style.cssText='';ult.className='sb';ult.id='ult';
ae.onpointerdown=e=>{e.stopPropagation();auto=!auto;ae.style.opacity=auto?1:.5};
c.addEventListener('pointerdown',e=>{if(auto||vil)return;mvDir=e.offsetX<W/2?-1:1});addEventListener('pointerup',()=>mvDir=0);
addEventListener('keydown',e=>{if(e.key>='1'&&e.key<='6')cast(+e.key-1);{const zi='zxcvb'.indexOf(e.key);if(zi>=0)ZC.zcast(zi)}if(e.key==='a')ae.onpointerdown({stopPropagation(){}});if(e.key==='ArrowLeft')mvDir=-1;if(e.key==='ArrowRight')mvDir=1});addEventListener('keyup',()=>mvDir=0);
function step(){fr++;ZC.tick();if(vil&&!bo&&started)vstep();if(bo||vil||!started){if(P.act)actEnd();return}if(fr%600===0)sv();if(over){if(P.act)actEnd();if(--over===0)init();return}
ZC.cds();cd=cd.map(v=>v-(1+al(2)*.01)/(1-Math.min(.4,SX('cdr')/100)));bt.forEach((b,i)=>b.style.setProperty('--c',cl(cd[i]/(SK[i][3]*1.6),0,1)*360+'deg'));
P.mp=Math.min(mm(),P.mp+.09);P.hp=Math.min(mx(),P.hp+.05);P.atk--;P.mv=0;if(P.pe&&--P.pe.l<=0){const f=P.pe.f;P.pe=null;f()}pstep();if(P.hp<mx()*.35&&hpP>0){hpP--;P.hp=Math.min(mx(),P.hp+mx()*.5);DT.push({x:P.x,y:130,s:'🧪+'+Math.round(mx()*.5),g:1,l:50})}if(P.mp<mm()*.2&&mpP>0){mpP--;P.mp=Math.min(mm(),P.mp+mm()*.5)}
const t=near(2e3);let dir=0;
if(auto){if(t){const T0=TK(),dd=t.x-P.x,ds=DS[T0];dir=Math.abs(dd)>ds+8?(Math.abs(dd)<vw()*(T0=='w'?.95:.55)?Math.sign(dd):0):(T0!='w'&&Math.abs(dd)<ds-120&&canRet(-Math.sign(dd))?-Math.sign(dd):0);for(const i of[4,3,2,1,0]){const kk=SK[i];if((kk[4]==3&&P.hp>mx()*.5)||(kk[4]==10&&P.hp>mx()*.7))continue;if(kk[4]==6&&PETS.length>=2)continue;cast(i)}if(E.length>=3||E.some(e=>e.b))cast(5);ZC.zauto()}else dir=0}
if(!auto)dir=mvDir;if((P.pe&&CHR[cur].t!='w')||P.act)dir=0;if(!P.act)P.x=cl(P.x,40,W/s-40);if(dir){const nx=cl(P.x+dir*1.6,40,W/s-40);if(nx!==P.x||!auto){P.x=nx;P.d=dir;P.mv=1}else if(t&&!P.act)P.d=Math.sign(t.x-P.x)||P.d}else if(t&&!P.act)P.d=Math.sign(t.x-P.x)||P.d;
const T=TK(),iv=Math.max(ANI[T]+16,Math.round({w:72,a:64,m:88}[T]/(1+Math.min(1,SX('aspd')/100))));if(!P.pe&&!P.act&&P.atk<=0&&fr%iv===0&&near(DS[T]+70)){const D=Math.max(10,Math.round(ANI[T]/(1+Math.min(1,SX('aspd')/100)*.6)));an(D);P.ln='';P.pe={l:D,f:()=>basic(T)}}
SLT.forEach((v,i)=>{if(!E.some(e=>e.sn==i)){if(SLT[i]>0)SLT[i]--;else spawn(i)}});
const wl=Math.floor(Date.now()/18e5);if(wl!==wbs&&!dg){wbs=wl;if(!E.some(e=>e.b==2)){wbq=1;E=E.filter(e=>e.sn!=2);SLT[2]=0;DT.push({x:P.x,y:200,s:'🐲 Boss Thế Giới xuất hiện!',g:1,l:150})}}
E.forEach(e=>{if(e.dg){dgAI(e);return}if(e.in>0){e.in--;return}const d=P.x-e.x,sp=(e.b?.5:.8)*(e.sl>0?.4:1),home=sx(e.sn);e.sl--;e.fl--;e.cd--;const stp=Math.min(e.rg-8,e.rg>200?e.rg*.85:Math.max(34,e.rg*.7)+(e.sn%3)*12);e.mv=0;if(Math.abs(d)>stp){e.x+=Math.sign(d)*sp*2;e.mv=1}if(Math.abs(d)<=e.rg&&e.cd<=0){e.cd=e.b?120:105;const q=Math.max(1,Math.round(.65*(8+e.lv*3)*(1+e.m*.35)*(e.b?2:1)-P.lv-Math.floor((sm('d')+al(1))*ZC.pd()*HL.df()/5)));if(R()<Math.min(.4,SX('dodge')/100)+ZC.dg()){DT.push({x:P.x,y:100,s:'Né',c:'#7fe0ff',l:40})}else{const q2=Math.max(1,Math.round(q*(1-Math.min(.5,SX('dred')/100))*ZC.shd()));P.hp-=q2;DT.push({x:P.x,y:100,s:q2,r:1,l:45})}if(e.rg>200)FX.push({t:'ep',x:e.x,x2:P.x,l:10,m:10})}})
PJ.forEach(p=>{p.l--;if(p.vx){p.x+=p.vx;E.forEach(e=>{if(e.in<=0&&p.l>0&&!p.h.includes(e)&&Math.abs(e.x-p.x)<30+e.hh*.15){p.h.push(e);SKF=p.sk|0;dm(e,p.d);SKF=0;ZS.hit(p,e);if(!p.pi)p.l=0}})}});PJ=PJ.filter(p=>p.l>0);
E=E.filter(e=>{if(e.hp>0)return true;P.xp+=Math.round((e.dg?(e.b?150:12):e.b==3?200:e.b?80:15)*(1+e.lv/5));ZC.kill(e);petGain(e);Q.k++;QE('kill');if(!e.dg){if(e.b==1)QE('elite');if(e.b>=2){QE('boss');if(e.b==3)QE('sboss')}}if(!e.b&&!e.dg){NK++;if(NK%100==0)pq[1]++;else if(NK%30==0)pq[0]++}cqKill(e);drop(e);SLT[e.sn]=e.b?540:320;for(let i=0;i<14;i++)PT.push({x:e.x,y:40,vx:(R()-.5)*6,vy:-R()*5,l:35,c:'#c33'});return false});
if(Q.k>=Q.n){Q.k=0;Q.n+=10;Q.done++;P.xp+=60*P.lv;DT.push({x:P.x,y:160,s:'Hoàn thành nhiệm vụ!',g:1,l:90})}
while(P.xp>=nx()&&P.lv<LC(PS[cur].tier)){P.xp-=nx();P.lv++;PS[cur].pts+=5;P.hp=mx();P.mp=mm();DT.push({x:P.x,y:150,s:'Lên cấp '+P.lv+'! +5 điểm tiềm năng',g:1,l:90})}
FX=FX.filter(f=>--f.l>0);ZS.step();ZS.act.tick();DT.forEach(d=>{d.l--;d.y+=.7});DT=DT.filter(d=>d.l>0);PT.forEach(p=>{p.x+=p.vx;p.y-=p.vy;p.vy+=.2;p.l--});PT=PT.filter(p=>p.l>0);
if(mi()!==lm){lm=mi();DT.push({x:P.x,y:190,s:'Đến '+MP[lm].n,g:1,l:110})}cam=0;if(P.hp<=0){over=120;cqDie();E=[];PETS=[];P.pe=null;SLT=[90,150,210,270,330];DT.push({x:P.x,y:120,s:'Bại trận... hồi sinh',g:1,l:110});P.hp=1}}
function layer(f,col,base,amp,fq){g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W+16;x+=16){const wx=cam*f+x/s,y=base-(Math.sin(wx*fq)*.5+Math.sin(wx*fq*2.7+1)*.3+.5)*amp;g.lineTo(x,y)}g.lineTo(W,H);g.fill()}
function cren(x,y,w,n){for(let i=0;i<n;i++)g.fillRect(x+i*w/n,y-10,w/n*.55,10)}
function shield(x,y,r,c){g.fillStyle=c;g.beginPath();g.moveTo(x-r,y-r);g.lineTo(x+r,y-r);g.lineTo(x+r,y+r*.2);g.quadraticCurveTo(x+r,y+r*1.1,x,y+r*1.5);g.quadraticCurveTo(x-r,y+r*1.1,x-r,y+r*.2);g.fill();g.strokeStyle='#d9b04a';g.lineWidth=Math.max(1,r*.16);g.beginPath();g.moveTo(x,y-r*.7);g.lineTo(x,y+r);g.moveTo(x-r*.6,y-r*.1);g.lineTo(x+r*.6,y-r*.1);g.stroke()}
function glow(x,y,r,a){const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,'rgba(255,190,90,'+a+')');q.addColorStop(1,'rgba(255,120,30,0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.28);g.fill();g.restore()}
function bgd0(gy,VL){const u=s,t=fr;let q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,'#1d1e4a');q.addColorStop(.5,'#7a4a72');q.addColorStop(.88,'#f0a868');q.addColorStop(1,'#ffd9a0');g.fillStyle=q;g.fillRect(0,0,W,H);
g.fillStyle='#fff';for(let i=0;i<40;i++){g.globalAlpha=.2+.4*Math.abs(Math.sin(t*.02+i));g.fillRect((i*131)%W,(i*71)%(gy*.5),1.6*u,1.6*u)}g.globalAlpha=1;
const mx=W*(PORT?.78:.85),my=gy*.2;glow(mx,my,60*u,.5);g.fillStyle='#fff3d0';g.beginPath();g.arc(mx,my,22*u,0,6.28);g.fill();
g.fillStyle='rgba(255,200,190,.2)';for(let i=0;i<4;i++){g.beginPath();g.ellipse(((i*310+t*.12*(1+i*.3))%(W+300))-150,gy*(.3+.08*i),90*u,12*u,0,0,6.28);g.fill()}
layer(.1,'#4a3a66',gy-70*u,120*u,.004);layer(.18,'#2f3a52',gy-40*u,80*u,.007);
g.fillStyle='#1c2a2a';for(let x=0;x<W;x+=26*u){const h=(30+((x/u*7)%23))*u;g.beginPath();g.moveTo(x-12*u,gy-30*u);g.lineTo(x,gy-30*u-h);g.lineTo(x+12*u,gy-30*u);g.fill()}
if(!VL){const ST='#6b6470',SD='#4a4452',RF='#9c1f2b';g.save();g.translate(W*.5,gy-78*u);g.scale(u,u);
g.fillStyle=SD;g.fillRect(-200,-100,400,110);g.fillStyle=ST;cren(-200,-100,400,20);g.fillRect(-60,-230,120,240);cren(-60,-230,120,6);
for(const x of[-185,185]){g.fillStyle=ST;g.fillRect(x-30,-190,60,200);cren(x-30,-190,60,4);g.fillStyle=RF;g.beginPath();g.moveTo(x-38,-190);g.lineTo(x,-262);g.lineTo(x+38,-190);g.fill();g.fillStyle='#d9b04a';g.fillRect(x-2,-276,4,16)}
g.fillStyle='#150f18';g.beginPath();g.arc(0,-40,30,3.14,0);g.lineTo(30,10);g.lineTo(-30,10);g.fill();g.strokeStyle='#8a6a3a';g.lineWidth=2;for(let i=-24;i<=24;i+=12){g.beginPath();g.moveTo(i,-66);g.lineTo(i,10);g.stroke()}for(let j=-50;j<10;j+=18){g.beginPath();g.moveTo(-30,j);g.lineTo(30,j);g.stroke()}
for(const[x,y]of[[-185,-150],[185,-150],[-8,-200],[-8,-150]]){g.fillStyle='rgba(255,200,100,'+(.7+.3*Math.sin(t*.1+x))+')';g.fillRect(x,y,12,22)}
g.strokeStyle='#ccc';g.lineWidth=2;g.beginPath();g.moveTo(0,-230);g.lineTo(0,-285);g.stroke();g.fillStyle=RF;g.beginPath();g.moveTo(0,-285);g.lineTo(38+Math.sin(t*.08)*5,-275+Math.sin(t*.1)*2);g.lineTo(0,-262);g.fill();g.restore();
const wy=gy-84*u;g.fillStyle='#5b5560';g.fillRect(0,wy,W,84*u);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;for(let r=0;r<5;r++){const y=wy+r*17*u;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);for(let x=(r%2)*22*u;x<W;x+=44*u){g.moveTo(x,y);g.lineTo(x,y+17*u)}g.stroke()}
g.fillStyle='#6b6470';cren(0,wy,W,Math.round(W/(28*u)));g.fillStyle='#1c1620';for(let x=110*u;x<W;x+=230*u){g.beginPath();g.arc(x,wy+52*u,24*u,3.14,0);g.lineTo(x+24*u,gy);g.lineTo(x-24*u,gy);g.fill()}
for(let k=0,x=44*u;x<W;k++,x+=230*u){const sw=Math.sin(t*.05+k)*4*u;g.fillStyle='#9c1f2b';g.beginPath();g.moveTo(x-17*u,wy+6*u);g.lineTo(x+17*u,wy+6*u);g.lineTo(x+17*u+sw,wy+66*u);g.lineTo(x+sw,wy+54*u);g.lineTo(x-17*u+sw,wy+66*u);g.fill();shield(x+sw*.5,wy+22*u,9*u,'#7a1722');
const fy=gy-50*u;g.fillStyle='#2a1a10';g.fillRect(x+25*u,fy,5*u,16*u);glow(x+27*u,fy-4*u,(26+Math.sin(t*.3+k*2)*5)*u,.9)}}
g.fillStyle='#3a3a2a';g.fillRect(0,gy-8*u,W,8*u);
q=g.createLinearGradient(0,gy,0,H);q.addColorStop(0,'#7a7064');q.addColorStop(1,'#2e2924');g.fillStyle=q;g.fillRect(0,gy,W,H-gy);g.strokeStyle='rgba(20,15,12,.45)';g.lineWidth=1.5;
for(let r=0;r<7;r++){const y0=gy+(H-gy)*Math.pow(r/7,1.5),y1=gy+(H-gy)*Math.pow((r+1)/7,1.5),w=(36+r*16)*u;g.beginPath();g.moveTo(0,y0);g.lineTo(W,y0);for(let x=(r%2)*w/2;x<W;x+=w){g.moveTo(x,y0);g.lineTo(x,y1)}g.stroke()}
g.save();g.translate(24*u,gy);g.scale(u,u);g.fillStyle='#4a3020';g.fillRect(-26,-70,6,70);g.fillRect(20,-70,6,70);g.fillRect(-26,-62,52,6);g.fillRect(-26,-34,52,6);shield(-8,-52,10,'#9c1f2b');shield(10,-52,10,'#2a4a8a');g.strokeStyle='#cfd2d8';g.lineWidth=3;g.beginPath();g.moveTo(-14,-90);g.lineTo(-14,-30);g.moveTo(15,-92);g.lineTo(15,-30);g.stroke();g.restore();
g.save();g.translate(W-24*u,gy);g.scale(u,u);g.fillStyle='#2a2a30';g.fillRect(-3,-46,6,46);g.beginPath();g.moveTo(-18,-46);g.lineTo(18,-46);g.lineTo(11,-32);g.lineTo(-11,-32);g.fill();g.restore();glow(W-24*u,gy-52*u,(40+Math.sin(t*.35)*6)*u,.95);
g.fillStyle='rgba(255,190,90,.8)';for(let i=0;i<26;i++){g.fillRect((i*97+Math.sin(t*.03+i)*18)%W,gy-((i*53+t*(.4+i%3*.3))%(gy*.7)),2*u,2*u)}
q=g.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.75);q.addColorStop(0,'rgba(10,5,15,0)');q.addColorStop(1,'rgba(10,5,15,.5)');g.fillStyle=q;g.fillRect(0,0,W,H)}
const XP={'-1':{sk:['#3a2a6a','#e08a9a','#ffe0a8'],mt:['#7a5a8a','#5a4a7a','#3a3258'],gr:['#9a8a68','#3a2e22'],rc:'#a82a2a',wc:'#eadfc4',pn:'#1e3a2a',sun:'#fff0c8',fx:0,pg:5},
0:{sk:['#2a2050','#d8809a','#ffd8a0'],mt:['#6a4a7a','#4a3a6a','#33284f'],gr:['#8a7a5a','#352a22'],rc:'#a83030',wc:'#eadfc4',pn:'#1e3a2a',sun:'#fff0c8',fx:0,pg:4},
2:{sk:['#2a3a6a','#8ab4e0','#eaf6ff'],mt:['#7a98c8','#5a7aa8','#3f5a88'],gr:['#d0deec','#586a88'],rc:'#3a78b8',wc:'#e8f4ff',pn:'#2a4a5a',sun:'#ffffff',fx:1,pg:4},
3:{sk:['#2a0a08','#a02a10','#ff9a40'],mt:['#5a1a12','#3a100c','#240806'],gr:['#6a3a24','#1e0c08'],rc:'#2a1010',wc:'#5a2a22',pn:'#2a1008',sun:'#ff8a30',fx:2,pg:4,st:1},
4:{sk:['#0c0620','#3a1a62','#7a4aa8'],mt:['#3a2260','#281848','#180e30'],gr:['#3a3050','#150f24'],rc:'#4a2a7a',wc:'#3a3050',pn:'#150f24',sun:'#d8e8ff',fx:3,pg:3,st:1},
7:{sk:['#05020c','#2a0e50','#7a2a9a'],mt:['#2a1048','#1a0a30','#10061f'],gr:['#2a1840','#0c0618'],rc:'#5a2a8a',wc:'#2a1840',pn:'#10061f',sun:'#c0208a',fx:3,pg:5,st:1},8:{sk:['#07142e','#1b6a9e','#bff4ff'],mt:['#3a80b0','#2a6090','#184468'],gr:['#2a6a8a','#0c2a40'],rc:'#5ad8ff',wc:'#cfeeff',pn:'#0c2a40',sun:'#fff7c8',fx:1,pg:5,st:1}};
function pgd(x,y,u,n,wc,rc){g.save();g.translate(x,y);g.scale(u,u);for(let i=0;i<n;i++){const w=72-i*9,yy=-i*38;g.fillStyle=wc;g.fillRect(-w/2+7,yy-34,w-14,32);g.fillStyle='rgba(255,196,96,.85)';g.fillRect(-5,yy-26,10,14);g.fillStyle=rc;g.beginPath();g.moveTo(-w/2-20,yy-30);g.quadraticCurveTo(-w/2+6,yy-33,0,yy-52);g.quadraticCurveTo(w/2-6,yy-33,w/2+20,yy-30);g.lineTo(w/2+8,yy-25);g.lineTo(-w/2-8,yy-25);g.fill();g.fillStyle='#d9b04a';g.fillRect(-w/2-20,yy-32,6,5);g.fillRect(w/2+14,yy-32,6,5)}const ty=-n*38-14;g.fillStyle='#d9b04a';g.fillRect(-1.5,ty-26,3,30);g.beginPath();g.arc(0,ty-30,5,0,6.28);g.fill();g.restore()}
function isl(x,y,u,c1,c2,wc,rc,n){g.save();g.translate(x,y);g.scale(u,u);g.fillStyle=c2;g.beginPath();g.moveTo(-62,0);g.lineTo(62,0);g.quadraticCurveTo(40,34,14,58);g.lineTo(0,84);g.lineTo(-16,50);g.quadraticCurveTo(-46,30,-62,0);g.fill();g.fillStyle=c1;g.beginPath();g.ellipse(0,0,62,11,0,0,6.28);g.fill();g.restore();if(n)pgd(x,y-3*u,u*.5,n,wc,rc)}
function pine(x,y,u,c){g.fillStyle='#2a1a10';g.fillRect(x-2*u,y-14*u,4*u,14*u);g.fillStyle=c;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-(26-i*5)*u,y-(10+i*20)*u);g.lineTo(x,y-(38+i*20)*u);g.lineTo(x+(26-i*5)*u,y-(10+i*20)*u);g.fill()}}
function ln(x,y,u,t){g.strokeStyle='#3a2010';g.lineWidth=2*u;g.beginPath();g.moveTo(x,y-26*u);g.lineTo(x,y-10*u);g.stroke();glow(x,y,34*u,.5+.15*Math.sin(t*.1+x));g.fillStyle='#d22a2a';g.beginPath();g.ellipse(x,y,10*u,13*u,0,0,6.28);g.fill();g.fillStyle='#d9b04a';g.fillRect(x-6*u,y-14*u,12*u,3*u);g.fillRect(x-6*u,y+11*u,12*u,3*u);g.strokeStyle='#d9b04a';g.beginPath();g.moveTo(x,y+14*u);g.lineTo(x,y+24*u+Math.sin(t*.1)*2*u);g.stroke()}
function xbg(gy,m){const u=s,t=fr,p=XP[m];let q=g.createLinearGradient(0,0,0,gy);q.addColorStop(0,p.sk[0]);q.addColorStop(.6,p.sk[1]);q.addColorStop(1,p.sk[2]);g.fillStyle=q;g.fillRect(0,0,W,H);
if(p.st){g.fillStyle='#fff';for(let i=0;i<40;i++){g.globalAlpha=.2+.4*Math.abs(Math.sin(t*.02+i));g.fillRect((i*131)%W,(i*71)%(gy*.5),1.6*u,1.6*u)}g.globalAlpha=1}
const mx=W*(PORT?.78:.82),my=gy*.22;glow(mx,my,70*u,.5);g.fillStyle=p.sun;g.beginPath();g.arc(mx,my,24*u,0,6.28);g.fill();
layer(.1,p.mt[0],gy-80*u,190*u,.0035);g.fillStyle=p.sk[2];for(let i=0;i<3;i++){g.globalAlpha=.16;g.beginPath();g.ellipse(((i*340+t*.15*(1+i*.4))%(W+400))-200,gy-(40+i*34)*u,260*u,16*u,0,0,6.28);g.fill()}g.globalAlpha=1;
layer(.18,p.mt[1],gy-40*u,130*u,.006);
[[.14,.3,.9],[.42,.14,.62],[.92,.38,.6]].forEach((a,i)=>isl(W*a[0],gy*a[1]+Math.sin(t*.02+i*2)*5*u,a[2]*u,p.gr[0],p.mt[2],p.wc,p.rc,i==1?3:i?0:2));
pgd(W*(m<0?.6:.72),gy-30*u,1.4*u,p.pg,p.wc,p.rc);
layer(.24,p.mt[2],gy-14*u,70*u,.011);for(let x=30*u;x<W;x+=(120+(x*7)%60)*u)pine(x,gy-8*u,u*(.8+((x/u)%5)*.05),p.pn);
q=g.createLinearGradient(0,gy,0,H);q.addColorStop(0,p.gr[0]);q.addColorStop(1,p.gr[1]);g.fillStyle=q;g.fillRect(0,gy,W,H-gy);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(0,gy,W,3*u);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;for(let r=0;r<7;r++){const y0=gy+(H-gy)*Math.pow(r/7,1.5),y1=gy+(H-gy)*Math.pow((r+1)/7,1.5),w=(36+r*16)*u;g.beginPath();g.moveTo(0,y0);g.lineTo(W,y0);for(let x=(r%2)*w/2;x<W;x+=w){g.moveTo(x,y0);g.lineTo(x,y1)}g.stroke()}
for(const x of[26*u,W-26*u]){g.fillStyle='#3a1a10';g.fillRect(x-3*u,gy-120*u,6*u,120*u);g.fillRect(x-22*u,gy-120*u,44*u,5*u);ln(x,gy-100*u,u,t)}
if(m<0)for(let i=0;i<9;i++){const x=W*(.08+i*.105),y=gy*.36+Math.sin(i/8*3.14)*34*u;ln(x,y,.7*u,t+i*9)}
for(let i=0;i<34;i++){const f=p.fx,X=(i*97+Math.sin(t*.03+i)*22+t*(.3+i%3*.2))%W;if(f==1){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(X,(i*53+t*(1+i%3*.5))%H,2*u,2*u)}else if(f==0){g.fillStyle='rgba(255,170,190,.85)';g.beginPath();g.ellipse(X,(i*61+t*(.7+i%3*.3))%H,4*u,2*u,t*.05+i,0,6.28);g.fill()}else if(f==2){g.fillStyle='#ffa040';g.fillRect(X,H-((i*61+t*(.8+i%3*.4))%H),2*u,2*u)}else{g.fillStyle='rgba(150,255,230,.55)';g.beginPath();g.arc(X,H-((i*47+t*(.4+i%3*.2))%(H*.8)),3*u,0,6.28);g.fill()}}
q=g.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.75);q.addColorStop(0,'rgba(10,5,15,0)');q.addColorStop(1,'rgba(10,5,15,.45)');g.fillStyle=q;g.fillRect(0,0,W,H)}
function bgd(gy){xbg(gy,mi())}
function bgdOld(gy){const m=mi(),mc=MP[m].c,bn=MP[m].b,gr=g.createLinearGradient(0,0,0,gy);gr.addColorStop(0,mc[0]);gr.addColorStop(.55,mc[1]);gr.addColorStop(1,mc[2]);g.fillStyle=gr;g.fillRect(0,0,W,H);
g.fillStyle='rgba(255,235,200,.4)';g.beginPath();g.arc(W*.82,H*.2,32*s,0,6.28);g.fill();layer(.12,mc[3],gy-90*s,140*s,.004);
g.save();g.translate(W*.5,gy-86*s);g.scale(s,s);g.fillStyle=mc[4];g.fillRect(-190,-110,380,120);cren(-190,-110,380,19);g.fillRect(-70,-230,140,240);cren(-70,-230,140,7);
for(const x of[-175,175]){g.fillRect(x-32,-190,64,200);cren(x-32,-190,64,4);g.beginPath();g.moveTo(x-38,-190);g.lineTo(x,-250);g.lineTo(x+38,-190);g.fill()}
g.fillStyle=mc[6];g.beginPath();g.arc(0,-40,28,3.14,0);g.lineTo(28,10);g.lineTo(-28,10);g.fill();g.fillStyle='#ffd58a';for(const x of[-175,-5,165])g.fillRect(x,-150,10,22);g.fillRect(-5,-200,10,22);
g.strokeStyle='#ccc';g.lineWidth=2;g.beginPath();g.moveTo(0,-230);g.lineTo(0,-275);g.stroke();g.fillStyle=bn;g.beginPath();g.moveTo(0,-275);g.lineTo(32+Math.sin(fr*.08)*4,-266);g.lineTo(0,-257);g.fill();g.restore();
const wy=gy-88*s;g.fillStyle=mc[3];g.fillRect(0,wy,W,88*s);g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;for(let r=0;r<6;r++){const y=wy+r*15*s;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=(r%2)*20*s;x<W;x+=40*s){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+15*s);g.stroke()}}
g.fillStyle=mc[4];for(let x=0;x<W;x+=26*s)g.fillRect(x,wy-9*s,15*s,9*s);
g.fillStyle=mc[6];for(let x=110*s;x<W;x+=230*s){g.beginPath();g.arc(x,wy+52*s,26*s,3.14,0);g.lineTo(x+26*s,gy);g.lineTo(x-26*s,gy);g.fill()}
for(let k=0,x=40*s;x<W;k++,x+=230*s){g.fillStyle=mc[4];g.fillRect(x-11*s,gy-175*s,22*s,175*s);g.fillStyle=mc[3];g.fillRect(x-15*s,gy-181*s,30*s,9*s);g.fillStyle=bn;g.beginPath();g.moveTo(x-17*s,gy-165*s);g.lineTo(x+17*s,gy-165*s);g.lineTo(x+17*s,gy-100*s);g.lineTo(x,gy-86*s);g.lineTo(x-17*s,gy-100*s);g.fill();g.strokeStyle='#f2e3b3';g.lineWidth=3*s;g.beginPath();g.moveTo(x,gy-152*s);g.lineTo(x,gy-108*s);g.moveTo(x-9*s,gy-136*s);g.lineTo(x+9*s,gy-136*s);g.stroke();
const fy=gy-60*s,fl=(9+Math.sin(fr*.3+k*2)*3)*s,rg=g.createRadialGradient(x+22*s,fy,1,x+22*s,fy,fl*3);rg.addColorStop(0,'rgba(255,200,90,.9)');rg.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=rg;g.beginPath();g.arc(x+22*s,fy,fl*3,0,6.28);g.fill();g.fillStyle='#2a1a10';g.fillRect(x+19*s,fy,6*s,14*s)}
const f=g.createLinearGradient(0,gy,0,H);f.addColorStop(0,mc[5]);f.addColorStop(1,mc[6]);g.fillStyle=f;g.fillRect(0,gy,W,H-gy);g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1.5;for(let i=-10;i<=10;i++){g.beginPath();g.moveTo(W/2+i*34*s,gy);g.lineTo(W/2+i*150*s,H);g.stroke()}for(let r=1;r<5;r++){const y=gy+(H-gy)*(r*r/16);g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
g.fillStyle='rgba(255,220,170,.28)';g.fillRect(0,gy,W,2);
for(const x of[22,W/s-22]){g.save();g.translate(x*s,gy);g.scale(s,s);g.fillStyle=mc[4];g.fillRect(-16,-14,32,14);g.fillRect(-10,-62,20,48);g.beginPath();g.arc(0,-72,10,0,6.28);g.fill();g.fillRect(-4,-92,8,10);g.fillStyle=mc[3];g.fillRect(18,-58,5,48);g.fillRect(12,-50,17,4);g.fillStyle=bn;g.fillRect(-26,-56,14,24);g.restore()}
g.fillStyle='rgba(255,255,255,.75)';if(m==2)for(let i=0;i<45;i++)g.fillRect((i*97+fr*(.4+i%3*.3))%W,(i*53+fr*(1+i%3*.5))%H,2*s,2*s);
if(m==3){g.fillStyle='#ffa040';for(let i=0;i<35;i++)g.fillRect((i*89+Math.sin(fr*.03+i)*20)%W,H-((i*61+fr*(.8+i%3*.4))%H),2*s,2*s)}
if(m==4||m==7){const fg=g.createLinearGradient(0,gy-60*s,0,gy+30*s);fg.addColorStop(0,'rgba(180,150,255,0)');fg.addColorStop(1,'rgba(180,150,255,.22)');g.fillStyle=fg;g.fillRect(0,gy-60*s,W,90*s)}}
const RGC={},RGBA=(h,a)=>{let o=RGC[h];if(!o){let q=h;if(q.length==4)q='#'+q[1]+q[1]+q[2]+q[2]+q[3]+q[3];o=RGC[h]=[parseInt(q.slice(1,3),16),parseInt(q.slice(3,5),16),parseInt(q.slice(5,7),16)]}return'rgba('+o[0]+','+o[1]+','+o[2]+','+a+')'};
const rot2=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)],sg=(p,a,b)=>p<=a?0:p>=b?1:(p-a)/(b-a),es=u=>u*u*(3-2*u),ei=u=>u*u*u,eo=u=>1-Math.pow(1-u,3),lp=(a,b,u)=>a+(b-a)*u,
skCol=(n,d)=>!n?d:/Hỏa/.test(n)?'#ff8a3a':/Băng|Bão Tuyết/.test(n)?'#9fe0ff':/Sét|Lôi/.test(n)?'#cfe8ff':/Huyết|Ảnh|Ám Sát|Phi Đao|Ẩn Thân/.test(n)?'#e060a0':/Độc/.test(n)?'#7fe85a':/Tử Thần/.test(n)?'#c070ff':/Linh|Điều Tức/.test(n)?'#8fffb0':/Xuyên/.test(n)?'#9fe0ff':d;
function armXY(S,E,H,au,af){const e=rot2(E[0]-S[0],E[1]-S[1],au),f=rot2(H[0]-E[0],H[1]-E[1],au+af);return[S[0]+e[0]+f[0],S[1]+e[1]+f[1]]}
function dPc(p){if(!p)return;let c=p.im;try{const m=g.getTransform();c=CR(p.im,p.h*Math.hypot(m.a,m.b),.42)}catch(e){}g.drawImage(c,p.x,p.y,p.w,p.h)}
function dArm(R,k,au,af){const u=R[k+'u'],l=R[k+'l'],S=R[k+'_S'],E=R[k+'_E'];if(!S)return;g.save();g.translate(S[0],S[1]);g.rotate(au);g.translate(-S[0],-S[1]);dPc(u);g.translate(E[0],E[1]);g.rotate(af);g.translate(-E[0],-E[1]);dPc(l);g.restore()}
function dLeg(p,pv,a,lf){if(!p)return;g.save();g.translate(pv[0],pv[1]-lf);g.rotate(a);g.translate(-pv[0],-pv[1]);dPc(p);g.restore()}
function star(n,r1,r2,rot){g.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,r=i%2?r2:r1;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
function glowAt(x,y,r,c,a){glowDraw(x,y,r*1.15,c,Math.min(1,a));if(a>.5)glowDraw(x,y,r*.5,'#ffffff',a*.5)}
function hero(){const T=CHR[cur].t,R=RIGI[cur],bs=R&&R.base;if(!bs||!bs.im.naturalWidth)return;
const t=fr,HH=150,k=HH/R.H,w=R.W*k,aa=P.atk>0,at=aa?1-P.atk/P.atkT:0,rl=aa?(P.atkT-12)/P.atkT:1,cc=CHR[cur].c,tr=PS[cur].tier,br=PS[cur].br,AS=T=='a'&&br==1,mv0=P.mv,sk=aa&&!!P.ln,col=skCol(aa?P.ln:'',cc),I=sk?1:.55,
 ph=t*.3,sa=Math.sin(ph),sw=aa?Math.sin(Math.min(1,at)*3.14):0,bob=T=='m'?-(18+Math.sin(t*.07)*3.6+(mv0?Math.sin(t*.28)*.9:0)):mv0&&!aa?-Math.abs(Math.sin(ph))*4.5:Math.sin(t*.08)*1.4;
let aU=.05+Math.sin(t*.05)*.025,aF=-.14,bU=-.05-Math.sin(t*.05)*.025,bF=-.1,lL=Math.sin(t*.03)*.012,lR=-lL,fL=0,fR=0,wA=.2,th=0,bx=0,by=0,brot=0;
const K=(a,b,c,d)=>at<rl*.42?lp(a,b,es(sg(at,0,rl*.42))):at<rl?lp(b,c,ei(sg(at,rl*.42,rl))):lp(c,d,es(sg(at,rl,1)));
if(mv0&&!aa&&T!='m'){lL=-sa*.38;lR=sa*.38;fL=Math.max(0,Math.cos(ph))*16;fR=Math.max(0,-Math.cos(ph))*16;aU=-sa*.34;aF=-.22-Math.max(0,sa)*.34;bU=sa*.34;bF=-.22-Math.max(0,-sa)*.34;brot=.035}
if(mv0&&!aa&&T=='m'){aU=.08+Math.sin(ph)*.05;aF=-.2;brot=.075;wA=.06+Math.sin(ph)*.05}
if(aa&&(T=='w'||AS)){const sp=T=='w'&&br==1;
 if(!sp){aU=K(.05,-2.45,-.45,.05);aF=K(-.14,-.95,.05,-.14);wA=K(.2,-.75,1.85,.2);bU=K(-.05,.8,-.4,-.05);bF=K(-.1,-.25,-.5,-.1);lR=K(0,.14,-.4,0);lL=K(0,-.1,.32,0);bx=K(0,-6,13,0);brot=K(0,-.05,.08,0);by=K(0,-1,2,0)}
 else{aU=K(.05,-1.28,-1.5,.05);aF=K(-.14,1.15,-.1,-.14);wA=K(.1,1.5,1.5,.1);th=K(0,-8,16,0);bU=K(-.05,.55,-.25,-.05);bF=K(-.1,-.3,-.3,-.1);lR=K(0,.12,-.42,0);lL=K(0,-.08,.34,0);bx=K(0,-5,11,0);brot=K(0,-.04,.07,0)}}
let rel=0,a2=0;
if(aa&&T=='a'&&!AS){const a1=es(sg(at,0,rl*.25));a2=es(sg(at,rl*.25,rl*.98));rel=at>=rl?es(sg(at,rl,rl+.09)):0;const rc=es(sg(at,rl+.05,1));
 aU=at<rl?lp(.05,-1.5,a1):lp(-1.5,.05,rc);aF=at<rl?lp(-.14,-.04,a1):lp(-.04,-.14,rc);
 bU=at<rl?lp(-.05,-1.4,a1)+.18*a2:lp(-1.22,-.05,rc);
 bF=at<rl?lp(-.1,.1,a1)+3.05*a2:lp(lp(3.15,.45,rel),-.1,rc);
 lL=lp(0,.17,at<rl?a1:1-rc);lR=lp(0,-.15,at<rl?a1:1-rc);brot=at<rl?-.05*a2:lp(.04,0,rc);bx=at<rl?-5*a2:lp(4,0,rc)}
if(aa&&T=='m'){const m1=es(sg(at,0,rl*.55)),mt=at>=rl?eo(sg(at,rl,rl+.12)):0,mr=es(sg(at,rl+.1,1));
 aU=at<rl?lp(.06,-.95,m1):at<rl+.1?lp(-.95,-.35,mt):lp(-.35,.06,mr);aF=at<rl?lp(-.18,-1.25,m1)+Math.sin(t*.9)*.05*m1:at<rl+.1?lp(-1.25,-.55,mt):lp(-.55,-.18,mr);
 wA=at<rl?lp(.04,-.16,m1):at<rl+.1?lp(-.16,.8,mt):lp(.8,.04,mr);by=-(at<rl?8*m1:lp(8,0,mr));brot=at<rl?-.04*m1:lp(.07,0,mr);bx=at<rl?-3*m1:lp(5,0,mr)}
const pa=armXY(R.A_S,R.A_E,R.A_H,aU,aF),pb=R.B_S?armXY(R.B_S,R.B_E,R.B_H,bU,bF):null,hxA=-w/2+pa[0]*k,hyA=-HH+pa[1]*k;
const JY=vil?0:(P.jy||0),JK=Math.max(.5,1-JY/420);g.save();g.translate((P.x-cam)*s,GY-JY*s);g.scale(s,s);const MHV=T=='m'?.72+Math.sin(t*.07)*.05:1;g.fillStyle='rgba(0,0,0,'+(.35*Math.max(.3,1-JY/320)*(T=='m'?.7:1))+')';g.beginPath();g.ellipse(0,2+JY,36*SZ*JK*MHV,8*SZ*JK*MHV,0,0,6.28);g.fill();
{const ar=48+tr*6+(aa?14:0),ga=.11+tr*.045+(aa?.16:0)+Math.sin(t*.06)*.025;glowDraw(0,-36,ar,col,Math.min(1,ga*1.6))}
if(!vil&&P.jr){g.translate(0,-50);g.rotate(P.jr*P.d);g.translate(0,50)}g.scale(P.d*.7*SZ,.7*SZ);
if(T=='m'){const hp=Math.sin(t*.07);g.save();g.globalCompositeOperation='lighter';
g.save();g.translate(0,-2);g.scale(1,.26);const hq=g.createRadialGradient(0,0,2,0,0,48);hq.addColorStop(0,RGBA(cc,.6));hq.addColorStop(.6,RGBA(cc,.2));hq.addColorStop(1,RGBA(cc,0));g.globalAlpha=.65+hp*.1;g.fillStyle=hq;g.beginPath();g.arc(0,0,48,0,6.28);g.fill();g.strokeStyle=cc;g.lineWidth=1.8;g.globalAlpha=.5;g.beginPath();g.arc(0,0,22+hp*2,0,6.28);g.stroke();g.rotate(t*.04);g.setLineDash([5,7]);g.globalAlpha=.4;g.beginPath();g.arc(0,0,35,0,6.28);g.stroke();g.restore();
for(let i=0;i<6;i++){const u=(t*.028+i/6)%1,a=i*1.9+t*.03;g.globalAlpha=(1-u)*.85;g.fillStyle=i%2?'#fff':cc;g.beginPath();g.arc(Math.cos(a)*(8+u*12),-20+u*20,1.6+(1-u)*1.6,0,6.28);g.fill()}
g.restore()}
if(aa&&T=='m'){const cp=sg(at,0,rl),fa=at<rl?1:1-sg(at,rl,1),rr=(24+60*es(cp))*(.7+.5*I);g.save();g.globalCompositeOperation='lighter';g.translate(0,-2);g.scale(1,.3);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=16;g.globalAlpha=(.3+.6*cp)*fa;g.lineWidth=3.5;g.beginPath();g.arc(0,0,rr,0,6.28);g.stroke();g.lineWidth=1.8;g.beginPath();g.arc(0,0,rr*.72,0,6.28);g.stroke();g.save();g.rotate(t*.05);star(6,rr*.95,rr*.5,0);g.stroke();g.restore();g.save();g.rotate(-t*.07);star(3,rr*.7,rr*.34,.3);g.stroke();g.restore();g.globalAlpha=(.15+.25*cp)*fa;g.fillStyle=col;g.beginPath();g.arc(0,0,rr*.9,0,6.28);g.fill();g.restore();
 if(sk){const q=g.createLinearGradient(0,-260,0,0);q.addColorStop(0,RGBA(col,0));q.addColorStop(1,RGBA(col,.5*cp*fa));g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.fillRect(-26*cp-8,-260,(26*cp+8)*2,260);g.restore()}}
if(aa&&T=='a'&&!AS){const cp=sg(at,0,rl),fa=at<rl?1:1-sg(at,rl,1);g.save();g.globalCompositeOperation='lighter';g.translate(0,-2);g.scale(1,.3);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=12;g.globalAlpha=(.25+.6*cp)*fa*I;g.lineWidth=3;const r2=20+44*es(cp);g.beginPath();g.arc(0,0,r2,0,6.28);g.stroke();g.rotate(t*.06);for(let i=0;i<4;i++){g.rotate(1.5708);g.beginPath();g.moveTo(r2*.7,0);g.lineTo(r2*1.25,0);g.stroke()}g.restore()}
g.save();g.translate(bx,by+bob);g.rotate(brot+Math.sin(t*.045)*.008);g.scale(1,1+Math.sin(t*.07)*.012+(mv0?Math.sin(t*.3)*.01:0));
g.save();g.translate(-w/2,-HH);g.scale(k,k);
if(R.LL){dLeg(R.LL,R.pivL,lL,fL);dLeg(R.LR,R.pivR,lR,fR)}
if(T=='m'){const pbs=bs,N=28,sh=pbs.im.naturalHeight/N,MC=(()=>{try{return CR(pbs.im,pbs.h*Math.hypot(g.getTransform().a,g.getTransform().b),.42)}catch(e){return pbs.im}})(),MR=MC.height/pbs.im.naturalHeight,amp=6.5*(1+(mv0?.8:0)+(aa?.6:0))/k;for(let i=0;i<N;i++){const v=(pbs.y+(i+.5)*pbs.h/N)/R.H,f=Math.max(0,(v-.74)/.26),ox=Math.sin(t*.07-v*5)*amp*.35*f*f*f+(mv0?-(2.4+Math.sin(t*.18-v*3)*.8)*f/k:0);g.drawImage(MC,0,Math.floor(i*sh*MR),MC.width,Math.ceil(sh*MR),pbs.x+ox,pbs.y+i*pbs.h/N,pbs.w,pbs.h/N+.8)}}else dPc(bs);
if(R.B_S)dArm(R,'B',bU,bF);
dArm(R,'A',aU,aF);dPc(R.sh);g.restore();
if(T=='w'){const ln=br==1?1:0,img=WPI[ln*4+tr];if(img.naturalWidth){g.save();
 if(ln==0){const L=82,ww=img.naturalWidth/img.naturalHeight*L;g.translate(hxA,hyA);g.rotate(wA);WD(img,-ww/2,-L*.86,ww,L,tr,'#ffd890');
  if(aa&&at>rl*.42&&at<rl+.1){g.globalCompositeOperation='lighter';const u=sg(at,rl*.42,rl+.1);g.globalAlpha=(1-u)*.9;g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=14;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-L*.86);g.lineTo(0,-L*.15);g.stroke()}}
 else{const L=96,ww=img.naturalWidth/img.naturalHeight*L;g.translate(hxA,hyA);g.rotate(wA);g.translate(0,-th*0);const gr=g.createLinearGradient(-3,0,3,0);gr.addColorStop(0,'#2e1c10');gr.addColorStop(.5,'#9a6a3e');gr.addColorStop(1,'#2e1c10');g.fillStyle=gr;g.fillRect(-2.6,-8+th*.15,5.2,70);g.fillStyle='#c9a24f';g.fillRect(-3.4,54+th*.15,6.8,4);g.fillRect(-3.2,14+th*.15,6.4,2);WD(img,-ww/2,-L-4-th*.3,ww,L,tr,'#ffd890');}
 g.restore()}
 if(aa&&at>rl*.42&&at<rl+.14){const u=sg(at,rl*.42,rl+.14);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=16;g.globalAlpha=(1-u)*.9;g.lineCap='round';if(ln==1){g.lineWidth=9;g.beginPath();g.moveTo(hxA+10,hyA-4);g.lineTo(hxA+20+130*u,hyA-4);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.moveTo(hxA+30,hyA-4);g.lineTo(hxA+30+130*u,hyA-4);g.stroke()}else{g.lineWidth=10;g.beginPath();g.arc(hxA-30,hyA+8,86,-2.2,-2.2+u*3.5);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.arc(hxA-30,hyA+8,86,-2.0,-2.2+u*3.5);g.stroke()}g.restore()}}
if(T=='m'){g.save();g.translate(hxA,hyA);g.rotate(wA);const WS=WPNIMG(),SUMB=PS[cur].br==0;if(WS&&WS.naturalWidth){if(SUMB){g.save();g.translate(0,-64+Math.sin(t*.07)*3);g.rotate(-wA*.4);const Lh=38,ww=WS.naturalWidth/WS.naturalHeight*Lh;WD(WS,-ww/2,-Lh/2,ww,Lh,PS[cur].tier,'#c9a0ff');g.restore()}else{const Ls=120,ww=WS.naturalWidth/WS.naturalHeight*Ls;WD(WS,-ww/2,-Ls*.62,ww,Ls,PS[cur].tier,'#c9a0ff')}}else{const gr=g.createLinearGradient(-3,0,3,0);gr.addColorStop(0,'#33200f');gr.addColorStop(.5,'#9b6b3c');gr.addColorStop(1,'#33200f');g.fillStyle=gr;g.fillRect(-2.4,-118,4.8,192);g.fillStyle='#c9a24f';g.fillRect(-3.2,-12,6.4,3);g.fillRect(-3.2,26,6.4,3);g.strokeStyle='#c9a24f';g.lineWidth=2.4;g.beginPath();g.moveTo(-3,-116);g.quadraticCurveTo(-13,-134,-6,-146);g.moveTo(3,-116);g.quadraticCurveTo(13,-134,6,-146);g.stroke();}
 const cy2=SUMB?-64:-71,cpp=aa?sg(at,0,rl):0,pu=aa?(at<rl?1+cpp*1.6:1+(1-sg(at,rl,1))*1.2):1+Math.sin(t*.1)*.08;
 g.save();g.globalCompositeOperation='lighter';glowAt(0,cy2,(26+(aa?30*cpp*I:0))*pu,col,.9);if(aa){g.save();g.translate(0,cy2);g.rotate(t*.08);g.fillStyle=RGBA(col,.85*(.4+cpp*.6));star(4,(40+60*cpp*I)*(at<rl?1:1-sg(at,rl,1)),4,0);g.fill();g.rotate(.785);star(4,(26+36*cpp*I),3,0);g.fill();g.restore();
  for(let i=0;i<(sk?12:6);i++){const u=((t*.035+i/(sk?12:6))%1),a=i*2.4+t*.04,r0=(1-u)*(46+46*cpp);g.fillStyle=RGBA(col,.9*u);g.beginPath();g.arc(Math.cos(a)*r0,cy2+Math.sin(a)*r0*.8,2+u*2.4,0,6.28);g.fill()}
  if(at>=rl&&at<rl+.2){const u=sg(at,rl,rl+.2);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=20;g.lineWidth=7*(1-u);g.globalAlpha=1-u;g.beginPath();g.arc(0,cy2,18+130*eo(u)*(.7+.5*I),0,6.28);g.stroke();g.lineWidth=3*(1-u);g.strokeStyle='#fff';g.beginPath();g.arc(0,cy2,10+90*eo(u)*(.7+.5*I),0,6.28);g.stroke()}}
 g.restore();if(!(WS&&WS.naturalWidth)){g.fillStyle=col;g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.moveTo(0,cy2-13*pu);g.lineTo(7*pu,cy2);g.lineTo(0,cy2+13*pu);g.lineTo(-7*pu,cy2);g.closePath();g.fill();g.stroke();}
 g.fillStyle='#fff';for(let i=0;i<tr;i++){const a=t*.05+i*2.1;g.beginPath();g.arc(Math.cos(a)*18,cy2+Math.sin(a)*7,2.2,0,6.28);g.fill()}g.restore()}
if(T=='a'&&!AS){const BT=bowTips(WPNIMG(),hxA-11.48,hyA-4),r=46,cx=hxA-r+6,cy=hyA-2,ex=BT?BT.mx:cx+r*Math.cos(1),ey=r*Math.sin(1),dr=aa&&at<rl,hb=pb?[-w/2+pb[0]*k,-HH+pb[1]*k]:[ex,cy],sx=dr?Math.min(ex,hb[0]+4):ex,sy=dr?hb[1]:(BT?BT.my:cy),pl=aa?(at<rl?a2:1-rel):0;g.save();g.lineCap='round';
 if(aa){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=16;g.lineWidth=7+6*pl*I;g.globalAlpha=(.35+.5*pl)*I;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.restore()}
 const WB=WPNIMG();if(WB&&WB.naturalWidth){g.save();g.translate(cx+r*.62,cy-2);g.rotate(-.54);const Lb=104,ww=WB.naturalWidth/WB.naturalHeight*Lb;WD(WB,-ww/2,-Lb/2,ww,Lb,PS[cur].tier,'#8fe9ff');g.restore()}else{g.strokeStyle='#3d2210';g.lineWidth=6;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.strokeStyle='#d8a868';g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,-1.05,1.05);g.stroke();g.fillStyle='#c9a24f';g.fillRect(cx+r-3,cy-9,5,18);}
 if(tr>=1&&!(WB&&WB.naturalWidth)){g.strokeStyle=cc;g.globalAlpha=.45+.3*Math.sin(t*.1);g.lineWidth=1.8;g.beginPath();g.arc(cx,cy,r+4,-.95,.95);g.stroke();g.globalAlpha=1}
 if(BT)bowStr(BT,sx,sy,aa,at,rl,dr,PS[cur].tier|0,'#8fe9ff');else{g.strokeStyle='#fff';g.lineWidth=1.4;g.beginPath();g.moveTo(ex,cy-ey);g.lineTo(sx,sy);g.lineTo(ex,cy+ey);g.stroke()}
 if(dr){const L=96;g.strokeStyle='#ffe9a0';g.lineWidth=3.2;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex+34,sy);g.stroke();g.fillStyle='#fff';g.beginPath();g.moveTo(ex+46,sy);g.lineTo(ex+30,sy-6);g.lineTo(ex+30,sy+6);g.fill();g.strokeStyle='#ffd070';g.lineWidth=1.6;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-6,sy-7);g.moveTo(sx,sy);g.lineTo(sx-6,sy+7);g.stroke();
  g.save();g.globalCompositeOperation='lighter';glowAt(ex+40,sy,(10+34*a2)*(.7+.5*I),col,.5+.5*a2);glowAt(sx,sy,6+14*a2,'#fff',.6);g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=12;g.globalAlpha=.4+.5*a2;g.lineWidth=2;for(let h=0;h<2;h++){g.beginPath();for(let q=0;q<=20;q++){const u=q/20,xx=sx+(ex+40-sx)*u,yy=sy+Math.sin(u*14-t*.6+h*3.14)*(5+8*a2)*u;q?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
  if(sk){g.globalAlpha=.55*a2;g.lineWidth=2.4;g.beginPath();g.ellipse(ex+52,sy,10+10*a2,22+14*a2,0,0,6.28);g.stroke();g.beginPath();g.ellipse(ex+70,sy,7+8*a2,17+12*a2,0,0,6.28);g.stroke()}g.restore()}
 if(aa&&at>=rl&&at<rl+.18){const u=sg(at,rl,rl+.18);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=18;for(let i=0;i<(sk?9:5);i++){const yy=(i-(sk?4:2))*(sk?7:9);g.globalAlpha=(1-u)*.9;g.lineWidth=2.6-.2*Math.abs(i-(sk?4:2));g.beginPath();g.moveTo(ex+30+u*60,cy+yy);g.lineTo(ex+30+u*60+90*(1-u*.5),cy+yy*(1+u));g.stroke()}g.globalAlpha=(1-u);glowAt(ex+20,cy,50*(1-u*.5)*(.8+.4*I),col,.9);g.restore()}
 g.restore()}
if(AS){const dgR=WXI.dagR[tr],dgL=WXI.dagL[tr],fl=0,L=36,hb=pb?[-w/2+pb[0]*k,-HH+pb[1]*k]:[hxA-18,hyA+8],dd=(im,x,y,rot)=>{if(!im||!im.naturalWidth)return;const ww=im.naturalWidth/im.naturalHeight*L,oy=-L*(fl?.2:.8);g.save();g.translate(x,y);g.rotate(rot+(fl?Math.PI:0));WD(im,-ww/2,oy,ww,L,tr,'#ff9ab0');g.restore()};dd(dgL,hb[0],hb[1],.1+wA*.7);dd(dgR,hxA,hyA,wA);if(aa&&at>rl*.42&&at<rl+.14){const u=sg(at,rl*.42,rl+.14);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=16;g.globalAlpha=(1-u)*.9;g.lineCap='round';g.lineWidth=8;g.beginPath();g.arc(hxA-30,hyA+8,80,-2.2,-2.2+u*3.5);g.stroke();g.lineWidth=3;g.strokeStyle='#fff';g.beginPath();g.arc(hxA-30,hyA+8,80,-2.0,-2.2+u*3.5);g.stroke();g.restore()}}
g.restore();heroSpark();g.restore()}
function heroSpark(){const n=EQ.reduce((a,i)=>a+(i&&i.r>=4?2:i&&i.c?1:0),0);if(!n)return;const my=EQ.some(q=>q&&q.r>=4);for(let i=0;i<Math.min(n*2,16);i++){const tw=(Math.sin(fr*.12+i*1.9)+1)/2,x=Math.sin(fr*.026+i*3.1)*44,y=-14-((fr*.5+i*37)%140),r=1.5+tw*4.5,gd=my&&i%2==0;g.save();g.translate(x,y);g.globalAlpha=tw*.9;g.fillStyle=gd?'#ffe08a':'#9ff';g.shadowColor=gd?'#ffa733':'#4ff';g.shadowBlur=8;g.beginPath();g.moveTo(0,-r*2);g.lineTo(r*.5,-r*.5);g.lineTo(r*2,0);g.lineTo(r*.5,r*.5);g.lineTo(0,r*2);g.lineTo(-r*.5,r*.5);g.lineTo(-r*2,0);g.lineTo(-r*.5,-r*.5);g.closePath();g.fill();g.restore()}}
function foe(e){const m=MS[e.k],im=MI[e.k];if(!im||!im.naturalWidth)return;const HH=m.h*BZ[e.b|0],w=im.naturalWidth/im.naturalHeight*HH,dir=Math.sign(P.x-e.x)||1,lg=e.cd>48&&e.rg<200?(e.cd-48)*1.3*dir:0;
g.globalAlpha=cl(1-e.in/30,.05,1);g.save();g.translate((e.x-cam+lg)*s,GY-(e.mv?Math.abs(Math.sin(fr*.25+e.sn))*5*s:0));g.scale(s*SZ,s*SZ);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,2,w*.38,7,0,0,6.28);g.fill();g.save();g.scale(dir*m.f,1+Math.sin(fr*.12+e.sn)*.012);if(e.b==1||e.b==3){g.shadowColor=e.b==3?'#c070ff':'#7fd0ff';g.shadowBlur=20+Math.sin(fr*.1)*6}g.drawImage(im,-w/2,-HH,w,HH);if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.55;g.drawImage(im,-w/2,-HH,w,HH)}g.restore();if(e.sl>0){g.font='20px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText('❄️',0,-HH-4)}g.restore();
const x=(e.x-cam)*s,y=GY-(HH*SZ+8)*s;g.font='bold '+6.5*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';const nm=((e.b==2?'🐲':e.b==3?'👑':e.b==1?'⭐':'')+m.n)+' '+e.lv+' 🛡'+Math.round(e.df),w2=g.measureText(nm).width;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-w2/2-3,y-8.5*s,w2+6,8.5*s);g.fillStyle=e.b==1?'#7fd0ff':e.b==3?'#d9a0ff':e.b?'#e8a0ff':'#fff';g.fillText(nm,x,y-2*s);g.fillStyle='#000a';g.fillRect(x-30*s,y+2,60*s,5*s);g.fillStyle='#e8c040';g.fillRect(x-30*s,y+2,60*s*cl(e.hp/e.max,0,1),5*s);g.globalAlpha=1}
const ZS=(()=>{
let FP=[],TM=[],SHK=0,FLS=null;
const PI=Math.PI,TAU=PI*2;
const fp=(x,y,o)=>{if(FP.length<650)FP.push(Object.assign({x,y,vx:0,vy:0,g:0,f:.97,r:4,c:'#fff',k:'o',l:30},o,{m:(o&&o.l)||30}))};
const bst=(x,y,n,c,sp,l,r,o)=>{for(let i=0;i<n;i++){const a=R()*TAU,v=sp*(.3+R()*.7);fp(x,y,Object.assign({vx:Math.cos(a)*v,vy:Math.sin(a)*v,c,l:Math.round(l*(.6+R()*.7)),r:r*(.5+R()*.8)},o))}};
const later=(n,fn)=>{const k0=SKF;TM.push({l:Math.max(1,n),fn:()=>{const o=SKF;SKF=k0;try{fn()}finally{SKF=o}}})};
const fx=o=>FX.push(Object.assign({l:20},o,{m:o.l||20}));
const shake=n=>{SHK=Math.max(SHK,n)},flash=(c,l)=>{FLS={c,l,m:l}};
const rg=(x,r,c,l)=>fx({t:'ring',x,r,c,l:l||22});
const cres=(x,d,a,r,c,l)=>fx({t:'cres',x,d,a,r,c,l:l||14});
const rune=(x,r,c,l)=>fx({t:'rune',x,r,c,l:l||40});
const mkbolt=()=>{let m=[[0,300]],dx=0;for(let y=270;y>=30;y-=30){dx+=(R()-.5)*38;m.push([dx,y])}const r=[m];for(let b=0;b<2;b++){const i=2+Math.floor(R()*5),o=m[i],q=[[o[0],o[1]]];let bx=o[0];for(let j=1;j<4;j++){bx+=(R()<.5?-1:1)*(10+R()*20);q.push([bx,o[1]-j*28])}r.push(q)}const sh=m[m.length-1][0];r.forEach(a=>a.forEach(p=>p[0]-=sh));return r};
const mkcrack=rr=>{const r=[];for(const dr of[-1,1]){let x=0,pts=[[0,4]];while(Math.abs(x)<rr){x+=dr*(14+R()*18);pts.push([x,R()*14])}r.push(pts);for(let b=0;b<2;b++){const i=2+Math.floor(R()*(pts.length-3)),o=pts[Math.max(1,Math.min(i,pts.length-1))],q=[[o[0],o[1]]];let bx=o[0];for(let j=1;j<4;j++){bx+=dr*(8+R()*10);q.push([bx,o[1]+j*6+R()*4])}r.push(q)}}return r};
const bolt=x=>fx({t:'bolt',x,seg:mkbolt(),l:10});
const tgts=n=>{const a=E.flatMap(e=>[e.x-16,e.x+16]);while(a.length<n)a.push(P.x+P.d*R()*vw()*.8);return a};
const rain=(xs,kd,c,gap,fl,big)=>xs.forEach((x,i)=>later(i*gap,()=>{fx({t:'mv',k:kd,x0:x+(kd=='meteor'?200:kd=='arrow'?-50*P.d:0),y0:320,x1:x,y1:10,l:fl,c});later(fl,()=>{bst(x,12,big?14:5,c,big?6:3.5,18,big?6:3,{g:.2,f:.94});if(big)rg(x,90,c,18)})}));
const heal=(x,c)=>{rg(x,90,c,24);rune(x,50,c,30);for(let i=0;i<20;i++)later(i,()=>fp(x+Math.cos(i*.9)*34,4,{c,r:3,l:34,vy:2.2,vx:Math.cos(i*.9+1.6)*.6,k:'d'}))};
const summ=(x,c)=>{rune(x,70,c,46);fx({t:'pillar',x,w:46,c,l:30});for(let i=0;i<18;i++)fp(x+(R()-.5)*60,4,{c,r:3+R()*3,l:36,vy:2+R()*3,k:i%3?'o':'d'})};
const SFX={
'Liên Thích':({d,px,c,e})=>{const X=(e?e.x:px+d*150)+d*12;[0,1,2].forEach(i=>later(i*4,()=>{const y=40+(i-1)*9;fx({t:'beam',x:px+d*24,x2:X,y,w:12,c,l:9});fx({t:'beam',x:px+d*24,x2:X,y,w:4,c:'#fff',l:8});if(e)bst(e.x,y+4,6,'#fff',6,10,3,{k:'s'})}))},
'Chém Mạnh':({d,tx,c,e})=>{cres(tx-10*d,d,-.5,95,c,16);later(4,()=>cres(tx,d,.55,85,'#fff',14));if(e){bst(tx,52,14,'#ffe9a0',6,16,3,{k:'s'});bst(tx,52,8,c,4,18,5)}shake(3)},
'Xung Phong':({d,px,c,rr})=>{for(let i=0;i<10;i++)fp(px-d*(10+i*14),16+R()*50,{k:'s',c:'#fff3c0',vx:-d*(6+R()*5),l:14,r:3,f:.9});for(let i=0;i<12;i++)fp(px+d*R()*60,6,{c:'#c9a878',r:7+R()*6,l:26,vx:(R()-.5)*3,vy:1+R()*2,g:.05,f:.95});rg(px,rr,c,24);shake(4)},
'Liên Hoàn Trảm':({d,px,c,rr})=>{[0,3,6].forEach((q,i)=>later(q,()=>{cres(px+(i-1)*70,d*(i%2?-1:1),i*.9-.9,100,i==1?'#fff':c,14);bst(px+(i-1)*90,50,6,'#ffe9a0',5,12,2,{k:'s'})}));rg(px,rr,c,24);shake(3)},
'Hộ Thể':({px})=>{heal(px,'#8fff9f');fx({t:'dome',r:78,c:'#ffd76a',l:42})},
'Phong Ma Trảm':({d,px,rr})=>{cres(px+d*60,d,-.3,120,'#9fe0ff',18);cres(px-d*60,-d,-.3,120,'#cfeaff',18);for(let i=0;i<18;i++)fp(px+(R()-.5)*rr*1.6,10+R()*40,{k:'d',c:'#cfeaff',r:4+R()*3,l:30,vy:1+R()*3,vx:(R()-.5)*3,g:.08});rg(px,rr,'#9fe0ff',26);shake(4)},
'Vạn Kiếm Quy Tông':({c})=>{rain(tgts(18),'sword','#ffe9a0',2,12,0);flash(c,40);shake(7)},
'Hỏa Cầu':({d,px})=>{bst(px+d*44,48,8,'#ffb060',4,12,4)},
'Hỏa Long Cầu':({d,px})=>{bst(px+d*44,48,14,'#ff8a30',5,16,6);rg(px,90,'#ff8a30',16)},
'Sét Đánh':({tx,e})=>{bolt(tx);later(3,()=>bolt(tx+10));if(e){bst(tx,40,16,'#fff7a0',7,14,3,{k:'s'});rg(tx,90,'#88ccff',16);flash('#cfe8ff',6)}shake(3)},
'Triệu Linh Lang':({px})=>summ(px-40,'#9fe0ff'),
'Triệu Cự Thạch':({px})=>{summ(px-40,'#e0b070');shake(4)},
'Gọi Ưng':({px})=>summ(px-40,'#ffe9a0'),
'Triệu Mộc Linh':({px})=>heal(px,'#7fff9a'),
'Điều Tức':({px})=>{heal(px,'#a8f07a');for(let i=0;i<12;i++)fp(px-60+R()*40,20+R()*60,{k:'d',c:'#c8ff9a',r:4,l:40,vx:3+R()*2,vy:(R()-.5)*1.5,f:1})},
'Băng Giáp':({px})=>{fx({t:'dome',r:78,c:'#9fe0ff',l:50});fx({t:'orb',c:'#cfeaff',l:70});rg(px,90,'#9fe0ff',24)},
'Bão Tuyết':({px,rr})=>{fx({t:'storm',x:px,r:rr,l:60});E.forEach(e=>{if(Math.abs(e.x-px)<rr)fx({t:'spike',x:e.x,l:34})});rg(px,rr,'#9fe0ff',28);flash('#cfeaff',10)},
'Thiên Hỏa Giáng':()=>{rain(tgts(14),'meteor','#ff8a30',3,14,1);flash('#ff7a20',44);shake(8)},
'Vạn Linh Giáng Thế':({px})=>{tgts(12).forEach((x,i)=>later(i*2,()=>{fx({t:'mv',k:'ghost',x0:px,y0:60,x1:x,y1:30,arc:90+R()*60,l:20,c:'#bfffe8'});later(20,()=>{bst(x,36,10,'#bfffe8',5,18,4);rg(x,70,'#bfffe8',16)})}));rune(px,110,'#bfffe8',50);flash('#9ffff0',40);shake(5)},
'Tên Nhanh':({d,px})=>{for(let i=0;i<5;i++)fp(px+d*40,46+(R()-.5)*6,{k:'s',c:'#ffe9a0',vx:d*(6+R()*5),vy:(R()-.5)*2,l:10,r:3,f:.9})},
'Tên Xuyên Giáp':({d,px})=>{for(let i=0;i<9;i++)fp(px+d*40,46+(R()-.5)*8,{k:'s',c:'#bfe8ff',vx:d*(8+R()*6),vy:(R()-.5)*3,l:12,r:3,f:.9});rg(px,90,'#9fe0ff',16);shake(2)},
'Mưa Tên':({px,rr,c})=>{const xs=[];for(let i=0;i<22;i++)xs.push(px+(R()*2-1)*rr);rain(xs,'arrow','#ffe9a0',1,12,0);rune(px,rr*.5,c,36)},
'Xạ Kích':({d,px,tx,e})=>{fx({t:'beam',x:px+d*30,x2:tx,y:46,w:16,c:'#ffe9a0',l:16});fx({t:'cross',x:tx,l:18});if(e){bst(tx,46,14,'#fff',7,14,3,{k:'s'});rg(tx,70,'#ffd070',16)}shake(2)},
'Tử Thần Tiễn':({d,px})=>{fx({t:'beam',x:px+d*30,x2:px+d*vw()*.9,y:46,w:44,c:'#b050ff',l:24});E.forEach(e=>later(4,()=>{fx({t:'skull',x:e.x,l:50});fx({t:'claw',x:e.x,c:'#ff4060',l:16});bst(e.x,50,14,'#d060ff',6,22,4)}));flash('#7a20c0',40);shake(8)},
'Bẫy Kẹp':({rr})=>{E.forEach(e=>{if(Math.abs(e.x-P.x)<rr){fx({t:'trap',x:e.x,l:32});bst(e.x,10,8,'#dfe3f0',4,14,3,{k:'s'})}});rg(P.x,rr,'#c9cde0',24);shake(3)},
'Mũi Tên Độc':({px,rr})=>{const xs=[];for(let i=0;i<22;i++)xs.push(px+(R()*2-1)*rr);rain(xs,'arrow','#7fe85a',1,12,0);for(let i=0;i<14;i++)fp(px+(R()*2-1)*rr,6,{c:'#7fe85a',r:4+R()*4,l:50,vy:.6+R()*.8,sh:1});rg(px,rr,'#7fe85a',26)},
'Săn Mồi':({d,px})=>{fx({t:'mv',k:'wolf',x0:px,y0:40,x1:px+d*vw()*.7,y1:40,l:26,c:'#9fe0ff'});E.forEach(e=>later(Math.round(26*Math.min(1,Math.abs(e.x-px)/(vw()*.7))),()=>{fx({t:'claw',x:e.x,c:'#ff5040',l:16});bst(e.x,50,12,'#ff8070',6,16,3,{k:'s'})}));flash('#9fe0ff',30);shake(6)}
};

const ZF=[
(f,c)=>{const d=P.d,px=P.x;cres(px+d*50,d,-.4,130,c,16);later(3,()=>cres(px+d*50,d,.4,130,'#fff',16));cres(px-d*50,-d,-.4,110,c,16);E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<360){dm(e,3*f);bst(e.x,50,8,c,5,16,3,{k:'s'})}});for(let i=0;i<14;i++)fp(px+(R()-.5)*200,10+R()*60,{k:'d',c,r:3+R()*3,l:30,vx:d*(2+R()*3),vy:(R()-.5)*2});rg(px,360,c,24);shake(3)},
(f,c)=>{const px=P.x,q=Math.round(mx()*.28),m=Math.round(mm()*.35);P.hp=Math.min(mx(),P.hp+q);P.mp=Math.min(mm(),P.mp+m);DT.push({x:px,y:130,s:'+'+q+' HP',g:1,l:60});DT.push({x:px,y:100,s:'+'+m+' MP',c:'#7ab8ff',l:60});heal(px,c);fx({t:'dome',r:84,c,l:46});rune(px,80,c,44)},
(f,c)=>{const px=P.x;rune(px,150,c,50);fx({t:'orb',c,l:30});later(14,()=>{E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<430)dm(e,6*f,1)});rg(px,430,c,26);rg(px,300,'#fff',20);fx({t:'pillar',x:px,w:130,c,l:26});bst(px,50,36,c,9,28,6,{g:.1,f:.95});bst(px,50,20,'#fff',6,20,4,{k:'s'});flash(c,22);shake(9)})},
(f,c)=>{const px=P.x,L=E.filter(e=>e.in<=0).slice(0,8);rune(px,90,c,40);bst(px,100,16,c,3,30,4,{k:'d'});const ts=L.length?L:[null];ts.forEach((e,i)=>{const x1=e?e.x:px+P.d*220;later(6+i*4,()=>{fx({t:'mv',k:'baby',x0:px,y0:140,x1,y1:50,arc:70+R()*40,l:16,c});later(16,()=>{if(e&&e.hp>0){dm(e,4.5*f);later(5,()=>{if(e.hp>0)dm(e,4.5*f)})}fx({t:'claw',x:x1,c,l:14});bst(x1,50,12,c,6,18,4);rg(x1,80,c,16);shake(2)})})});flash(c,14)},
(f,c)=>{const px=P.x;rune(px,200,c,70);later(8,()=>rune(px,130,'#fff',50));flash(c,50);shake(10);E.forEach((e,i)=>{if(e.in>0)return;later(10+i*3,()=>{bolt(e.x);fx({t:'pillar',x:e.x,w:80,c,l:30});if(e.hp>0)dm(e,16*f);bst(e.x,50,22,c,8,24,5,{g:.1});rg(e.x,120,c,20);shake(5)})});for(let i=0;i<40;i++)later(i,()=>fp(px+(R()-.5)*600,R()*200,{k:'d',c,r:4,l:40,vy:2+R()*3,vx:(R()-.5)*2}));rg(px,520,c,40)}
];
const ZFC={w:[ZF[0],(f,c)=>{ZF[1](f,c);ZC.setS(300,0)},ZF[2],(f,c)=>{const L=E.filter(e=>e.in<=0).slice(0,8);rain(tgts(14),'sword','#ffe9a0',2,12,0);L.forEach((e,i)=>later(10+i*2,()=>{if(e.hp>0){dm(e,4.5*f);later(5,()=>{if(e.hp>0)dm(e,4.5*f)})}}));flash(c,20);shake(5)},(f,c)=>{ZF[4](f,c);rain(tgts(18),'sword','#fff3c0',1,12,0)}],
m:[(f,c)=>{const px=P.x;rune(px,120,'#ff8a30',34);later(8,()=>{E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<420){dm(e,3.2*f);bst(e.x,50,12,'#ff9a3a',5,20,5,{g:.15,f:.93});rg(e.x,80,'#ff8a30',16)}});shake(3)})},(f,c)=>{ZF[1](f,c);const q=Math.round(mm()*.25);P.mp=Math.min(mm(),P.mp+q);DT.push({x:P.x,y:80,s:'+'+q+' MP',c:'#7ab8ff',l:60});ZC.setS(180,0)},(f,c)=>{const px=P.x;fx({t:'storm',x:px,r:430,l:60});E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<430){dm(e,6*f,1);fx({t:'spike',x:e.x,l:34})}});rg(px,430,'#9fe0ff',28);flash('#cfeaff',10);shake(5)},(f,c)=>{const L=E.filter(e=>e.in<=0).slice(0,8);L.forEach((e,i)=>later(6+i*4,()=>{bolt(e.x);bolt(e.x+12);if(e.hp>0){dm(e,4.5*f);later(5,()=>{if(e.hp>0)dm(e,4.5*f)})}bst(e.x,40,14,'#fff7a0',7,14,3,{k:'s'});rg(e.x,90,'#88ccff',16)}));rune(P.x,110,'#88ccff',40);flash('#cfe8ff',14)},(f,c)=>{rain(tgts(14),'meteor','#ff8a30',3,14,1);E.forEach((e,i)=>{if(e.in<=0)later(14+i*2,()=>{if(e.hp>0)dm(e,16*f)})});flash('#ff7a20',44);shake(8)}],
a:[(f,c)=>{const xs=[];E.forEach(e=>{xs.push(e.x-10,e.x+10)});while(xs.length<10)xs.push(P.x+P.d*R()*vw()*.6);rain(xs,'arrow','#ffe9a0',1,12,0);E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<460)later(12,()=>dm(e,3*f))})},(f,c)=>{ZF[1](f,c);ZC.setS(0,300)},(f,c)=>{const d=P.d,px=P.x;fx({t:'beam',x:px+d*30,x2:px+d*vw()*.9,y:46,w:40,c,l:22});E.forEach(e=>{if(e.in<=0&&(e.x-px)*d>-40&&Math.abs(e.x-px)<vw()*.9){dm(e,6*f,1);bst(e.x,48,12,'#fff',7,14,3,{k:'s'})}});shake(5);flash(c,8)},(f,c)=>ZF[3](f,c),(f,c)=>{const d=P.d,px=P.x;fx({t:'mv',k:'wolf',x0:px,y0:40,x1:px+d*vw()*.8,y1:40,l:26,c});E.forEach(e=>{if(e.in>0)return;later(14,()=>{fx({t:'skull',x:e.x,l:50});fx({t:'claw',x:e.x,c:'#ff4060',l:16});if(e.hp>0)dm(e,16*f);bst(e.x,50,14,'#d060ff',6,22,4)})});flash('#7a20c0',40);shake(8)}]};
const SWD=(x,y,a,L,c)=>{g.save();g.translate(x,y);g.rotate(a);g.shadowColor=c;g.shadowBlur=14;const q=g.createLinearGradient(0,-L,0,L*.15);q.addColorStop(0,'#fff');q.addColorStop(1,c);g.fillStyle=q;g.beginPath();g.moveTo(0,-L);g.lineTo(L*.1,-L*.25);g.lineTo(L*.07,L*.12);g.lineTo(-L*.07,L*.12);g.lineTo(-L*.1,-L*.25);g.fill();g.fillStyle=c;g.fillRect(-L*.22,L*.12,L*.44,L*.05);g.fillRect(-L*.03,L*.17,L*.06,L*.22);g.restore()},
RUN=(x,gy,r,txt,c,rot,a)=>{g.save();g.translate(x,gy-6*s);g.scale(s,s*.3);g.globalAlpha=a;g.strokeStyle=c;g.fillStyle=c;g.shadowColor=c;g.shadowBlur=12;g.lineWidth=3;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.beginPath();g.arc(0,0,r*.8,0,TAU);g.stroke();g.font='bold 30px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='middle';for(let i=0;i<txt.length;i++){const q=rot+i*TAU/txt.length;g.fillText(txt[i],Math.cos(q)*r*.9,Math.sin(q)*r*.9)}g.restore()},
CLD=(x,y,w,c,a)=>{g.save();g.globalCompositeOperation='source-over';g.globalAlpha=a;for(let i=0;i<7;i++){const cx=x+(i-3)*w/6,cy=y+Math.sin(i*2.1+fr*.03)*10*s,q=g.createRadialGradient(cx,cy,2,cx,cy,w/4);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(cx-w/4,cy-w/4,w/2,w/2)}g.restore()},
AL=p=>Math.sin(Math.min(1,Math.max(0,p))*PI),
wr=(t,i,fn)=>{const o=ZFC[t][i];ZFC[t][i]=(f,c)=>{o(f,c);fn(f,c)}};
wr('w',0,(f,c)=>{const d=P.d;fx({x:P.x,l:26,fn:(o,p,x,gy)=>{for(let i=0;i<6;i++){const q=Math.max(0,p-i*.035),ox=x+d*(-90+q*380)*s,oy=gy-(55+Math.sin(q*PI)*70)*s;g.globalAlpha=(1-i/6)*AL(p+.1);SWD(ox,oy,d*(1.57+(q-.5)*.6),46*s,i?c:'#fff')}}})});
wr('w',1,(f,c)=>{ZC.setS(300,0);fx({x:P.x,l:70,fn:(o,p,x,gy)=>{const a=AL(p);RUN(x,gy,92,'金剛不壞',c,fr*.05,a);g.save();g.translate(x,gy);g.scale(s,s);g.globalAlpha=a*.5;const q=g.createRadialGradient(0,-60,10,0,-60,95);q.addColorStop(0,'rgba(255,230,140,0)');q.addColorStop(1,'#ffd76a');g.fillStyle=q;g.beginPath();g.ellipse(0,0,80,110,0,PI,0);g.fill();g.globalAlpha=a;g.strokeStyle='#fff3b0';g.lineWidth=3;g.stroke();g.font='bold 54px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.fillStyle='#fff3b0';g.textAlign='center';g.fillText('卍',0,-52);g.restore()}})});
wr('w',2,(f,c)=>fx({x:P.x,l:44,fn:(o,p,x,gy)=>{const a=AL(p),R0=(60+Math.min(p*3,1)*130)*s,rot=fr*.08;RUN(x,gy,R0/s,'劍陣天地',c,rot,a);for(let i=0;i<12;i++){const q=rot+i*TAU/12,rise=Math.min(1,p*4)*(40+Math.sin(fr*.2+i)*6);g.globalAlpha=a;SWD(x+Math.cos(q)*R0,gy-(10+rise)*s+Math.sin(q)*R0*.15,0,34*s,i%2?'#fff':c)}}}));
wr('w',3,(f,c)=>fx({x:P.x,l:50,fn:(o,p,x,gy)=>{const a=AL(p),hy=gy-(150+Math.min(p*3,1)*40)*s;RUN(x,hy+6*s,70,'萬劍歸宗',c,-fr*.07,a);for(let i=0;i<16;i++){const q=fr*.15+i*TAU/16,rr=(34+i%4*10)*s;g.globalAlpha=a;SWD(x+Math.cos(q)*rr,hy-i*5*s+Math.sin(q)*6*s,Math.cos(q)*.4,28*s,i%2?'#fff':c)}}}));
wr('w',4,(f,c)=>fx({x:P.x+P.d*120,l:56,fn:(o,p,x,gy)=>{const L=240*s,e=Math.min(1,p/.5),tip=gy-(1-e*e)*(gy+60);g.globalAlpha=p<.5?1:1-(p-.5)/.5;SWD(x,tip-L,PI,L,c);if(p>.45){const k=Math.min(1,(p-.45)*4),q=g.createLinearGradient(0,gy,0,0);q.addColorStop(0,'#fff');q.addColorStop(1,'rgba(255,200,80,0)');g.globalAlpha=(1-p)*.9;g.fillStyle=q;g.fillRect(x-30*s*k,0,60*s*k,gy)}}}));
wr('m',0,(f,c)=>fx({x:P.x+P.d*140,l:46,fn:(o,p,x,gy)=>{const a=AL(p),cs=['#ffd76a','#6fdc6f','#5ab8ff','#ff6a30','#c8a070'],r=(90+p*30)*s,rot=fr*.06;RUN(x,gy,110,'金木水火土',c,rot,a);const Q=cs.map((_,i)=>{const q=rot+i*TAU/5;return[x+Math.cos(q)*r,gy-80*s+Math.sin(q)*r*.35]});g.globalAlpha=a*.7;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();[0,2,4,1,3,0].forEach((k,i)=>i?g.lineTo(Q[k][0],Q[k][1]):g.moveTo(Q[k][0],Q[k][1]));g.stroke();Q.forEach((q,i)=>{const gr=g.createRadialGradient(q[0],q[1],1,q[0],q[1],20*s);gr.addColorStop(0,'#fff');gr.addColorStop(.4,cs[i]);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(q[0],q[1],20*s,0,TAU);g.fill()})}}));
wr('m',1,(f,c)=>fx({x:P.x,l:70,fn:(o,p,x,gy)=>{const a=AL(p),o2=Math.min(1,p*3);g.save();g.translate(x,gy-4*s);g.scale(s,s);for(let k=0;k<2;k++)for(let i=0;i<8;i++){const len=(50+k*26)*o2;g.save();g.scale(1,.3);g.rotate(i*TAU/8+k*.39);g.globalAlpha=a*.8;const gr=g.createLinearGradient(0,0,len,0);gr.addColorStop(0,'#ffe0f0');gr.addColorStop(1,k?'#8fffb0':'#ff9ad0');g.fillStyle=gr;g.shadowColor=k?'#8fffb0':'#ff9ad0';g.shadowBlur=10;g.beginPath();g.ellipse(len/2+10,0,len/2,13,0,0,TAU);g.fill();g.restore()}g.restore();for(let i=0;i<10;i++){const ph=(p*2+i/10)%1;g.globalAlpha=a*(1-ph);g.fillStyle='#bfffe8';g.beginPath();g.arc(x+Math.sin(i*7+ph*5)*40*s,gy-ph*130*s,3*s,0,TAU);g.fill()}}}));
wr('m',2,(f,c)=>fx({x:P.x,l:60,fn:(o,p,x,gy)=>{const a=AL(p),r=Math.min(1,p*2.5)*300*s;g.save();g.translate(x,gy-6*s);g.scale(1,.3);g.rotate(fr*.01);g.globalAlpha=a;g.strokeStyle='#cfeaff';g.shadowColor='#6fc8ff';g.shadowBlur=14;g.lineWidth=4*s;for(let i=0;i<6;i++){g.save();g.rotate(i*PI/3);g.beginPath();g.moveTo(0,0);g.lineTo(r,0);for(const b of[.35,.6,.82]){g.moveTo(r*b,0);g.lineTo(r*b+r*.14,r*.14);g.moveTo(r*b,0);g.lineTo(r*b+r*.14,-r*.14)}g.stroke();g.restore()}g.restore()}}));
wr('m',3,(f,c)=>fx({x:P.x,l:56,fn:(o,p,x,gy)=>{const a=AL(p);CLD(W/2,gy*.12,W*.9,'#2a2a48',a*.9);CLD(W/2,gy*.2,W*.7,'#5a4a8a',a*.6);if(fr%4<2){g.globalAlpha=a*.5;g.fillStyle='#cfe8ff';g.fillRect(0,0,W,gy*.15)}}}));
wr('m',4,(f,c)=>fx({x:P.x,l:70,fn:(o,p,x,gy)=>{const a=AL(p),r=Math.min(1,p*3)*Math.min(W*.42,300*s);g.save();g.translate(W/2,gy*.28);g.scale(1,.55);g.globalAlpha=a;g.strokeStyle='#ffb070';g.fillStyle='#ffd0a0';g.shadowColor='#ff7a20';g.shadowBlur=16;g.lineWidth=3;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.beginPath();g.arc(0,0,r*.72,0,TAU);g.stroke();g.rotate(fr*.015);g.font='bold '+r*.16+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='middle';'☰☱☲☳☴☵☶☷'.split('').forEach((t,i)=>{const q=i*TAU/8;g.fillText(t,Math.cos(q)*r*.86,Math.sin(q)*r*.86)});g.restore()}}));
wr('a',0,(f,c)=>{const ts=tgts(7);fx({x:P.x,l:36,ts,fn:(o,p,x,gy)=>{const a=AL(p),e=Math.min(1,p*1.6),y0=gy-60*s;o.ts.forEach((t,i)=>{const tx=(t-cam)*s,ty=gy-46*s,mx=(x+tx)/2,my=gy-(150+i*14)*s,B=u=>[(1-u)*(1-u)*x+2*(1-u)*u*mx+u*u*tx,(1-u)*(1-u)*y0+2*(1-u)*u*my+u*u*ty];g.globalAlpha=a*.5;g.strokeStyle='#9fe8ff';g.lineWidth=3*s;g.beginPath();for(let k=0;k<=10;k++){const q=B(e*k/10);g.lineTo(q[0],q[1])}g.stroke();const h=B(e);g.globalAlpha=a;g.fillStyle='#fff';g.beginPath();g.arc(h[0],h[1],5*s,0,TAU);g.fill()})}})});
wr('a',1,(f,c)=>fx({x:P.x,l:60,fn:(o,p,x,gy)=>{const a=AL(p);g.strokeStyle='#bfffc8';g.shadowColor='#6fe090';g.shadowBlur=10;g.lineCap='round';for(let j=0;j<3;j++){g.globalAlpha=a*.6;g.lineWidth=4*s;g.beginPath();for(let k=0;k<=24;k++){const t=k/24,q=t*9+fr*.12+j*2.1;g.lineTo(x+Math.cos(q)*(36+t*14)*s,gy-t*150*s+Math.sin(q)*8*s)}g.stroke()}g.fillStyle='#8fe88a';for(let i=0;i<10;i++){const q=fr*.1+i*.63,t=(i/10+p)%1;g.globalAlpha=a;g.beginPath();g.ellipse(x+Math.cos(q)*(50+t*20)*s,gy-t*150*s,5*s,2.5*s,q,0,TAU);g.fill()}}}));
wr('a',2,(f,c)=>{const d=P.d;fx({x:P.x,l:30,fn:(o,p,x,gy)=>{const a=AL(p);for(let i=-7;i<=7;i++){const L=(40+p*700)*s;g.save();g.translate(x+d*30*s,gy-46*s);g.rotate(d>0?i*.07:PI-i*.07);g.globalAlpha=a*(1-Math.abs(i)/9);g.strokeStyle='#ffe9a0';g.lineWidth=2*s;g.beginPath();g.moveTo(L-90*s,0);g.lineTo(L,0);g.stroke();g.fillStyle='#fff';g.beginPath();g.moveTo(L+12*s,0);g.lineTo(L-4*s,-4*s);g.lineTo(L-4*s,4*s);g.fill();g.restore()}}})});
wr('a',3,(f,c)=>fx({x:P.x,l:50,fn:(o,p,x,gy)=>{const a=AL(p),ox=P.x;RUN(x,gy,140,'分身幻影',c,fr*.05,a*.8);g.globalCompositeOperation='source-over';[-130,-65,70,135].forEach(dx=>{P.x=ox+dx;g.save();g.globalAlpha=a*.5;g.shadowColor=c;hero();g.restore()});P.x=ox}}));
wr('a',4,(f,c)=>{const d=P.d;fx({x:P.x,l:60,fn:(o,p,x,gy)=>{const a=AL(p),mx=W/2,my=gy*.3,r=70*s,q=g.createRadialGradient(mx,my,r*.4,mx,my,r*2.4);q.addColorStop(0,'rgba(255,245,200,.8)');q.addColorStop(1,'rgba(255,245,200,0)');g.globalAlpha=a;g.fillStyle=q;g.beginPath();g.arc(mx,my,r*2.4,0,TAU);g.fill();g.fillStyle='#fff8d8';g.beginPath();g.arc(mx,my,r,0,TAU);g.fill();const wx=x+d*(-100+p*vw()*.9)*s,wy=gy-(80+Math.sin(p*PI)*40)*s;g.globalAlpha=a*.7;g.globalCompositeOperation='source-over';g.font=200*s+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#9fe0ff';g.shadowBlur=30;if(d>0){g.scale(-1,1);g.fillText('🐺',-wx,wy)}else g.fillText('🐺',wx,wy)}})});
function sfx(k,T,c){const d=P.d,px=P.x,t=k[4],rr=k[6]||300,e=(t==2||t==7)?near(T=='w'?MR+40:RG[T]+80):null,tx=e?e.x:px+d*140,S=SFX[k[0]];
 if(S)S({d,px,c,rr,e,tx,k});
 else if(t==1||t==4)rg(px,rr,c);else if(t==3)heal(px,c);else if(t==5){flash(c,36);shake(6)}else if(t==2)fx({t:'beam',x:px+d*30,x2:tx,y:48,w:16,c,l:14})}
function hit(p,e){const n=p.n||p.k,y=50,B=p.big;
 if(n=='Hỏa Cầu'||n=='Hỏa Long Cầu'){bst(e.x,y,B?22:12,'#ff9a3a',B?7:5,22,B?8:5,{g:.15,f:.93});bst(e.x,y,B?10:5,'#ffe08a',B?4:3,16,5);rg(e.x,B?130:80,'#ff8a30',18);flare(e.x,y,'#ff8a30',B?160:100,18);gwave(e.x,'#ff8a30',B?150:90,18);if(B)shake(4)}
 else if(p.k=='m'){bst(e.x,y,22,CHR[cur].c,6,20,4);bst(e.x,y,8,'#fff',4,14,3,{k:'s'});rg(e.x,90,CHR[cur].c,18);flare(e.x,y,CHR[cur].c,100,16);if(B)shake(3)}
 else if(p.k=='a'){bst(e.x,y,p.pi?30:16,p.pi?'#bfe8ff':'#ffe9a0',p.pi?8:5,16,3,{k:'s'});flare(e.x,y,p.pi?'#9fe0ff':'#ffd86a',p.pi?120:80,14);rg(e.x,p.pi?110:70,p.pi?'#9fe0ff':'#ffd86a',16);if(p.pi)shake(2)}}
const mvp=f=>{const p=1-f.l/f.m,e=(f.k=='ghost'||f.k=='wolf')?p*p*(3-2*p):p;return[f.x0+(f.x1-f.x0)*e,f.y0+(f.y1-f.y0)*e+(f.arc||0)*Math.sin(p*PI),p]};
function step(){
 if(P.pe){const big=P.pe.t==5||P.pe.t==17,u=CHR[cur].c;for(let i=0;i<(big?3:CHR[cur].t=='w'?1:3);i++){const a=R()*TAU,r=(big?72:46)+R()*18;fp(P.x+P.d*24+Math.cos(a)*r,48+Math.sin(a)*r*.8,{c:u,l:12,r:3,vx:-Math.cos(a)*r/12,vy:-Math.sin(a)*r*.8/12,f:1})}}
 PJ.forEach(p=>{if(!p.vx)return;const n=p.n||p.k;if(n=='Hỏa Cầu'||n=='Hỏa Long Cầu'){for(let q=0;q<(p.big?4:2);q++)fp(p.x-p.vx*(.4+R()*.6),46+(R()-.5)*(p.big?18:11),{c:R()<.5?'#ff8a30':'#ffd060',r:(p.big?12:8)*(.6+R()*.6),l:20,vy:R()*1.8,vx:-p.vx*.1});if(R()<.6)fp(p.x,46+(R()-.5)*22,{c:'#fff3c0',r:2,l:24,k:'s',vy:(R()-.5)*3,vx:-p.vx*.2})}else if(p.k=='m'){for(let q=0;q<3;q++){const a=fr*.5+q*2.1;fp(p.x+Math.cos(a)*2,46+Math.sin(a)*14,{c:CHR[cur].c,r:3.5,l:18,vy:-Math.sin(a)*.5,vx:-p.vx*.1})}}else if(p.k=='a'){for(let q=0;q<(p.pi?4:2);q++)fp(p.x-p.vx*(.3+R()*.9),46+(R()-.5)*(p.pi?12:6),{c:p.pi?'#9fe0ff':'#ffe9a0',r:p.pi?4:2.6,l:p.pi?18:13,k:'s',vx:-p.vx*.3,vy:(R()-.5)*1.4})}});
 FX.forEach(f=>{if(f.t=='storm'){for(let i=0;i<4;i++)fp(f.x+(R()-.5)*f.r*2,170+R()*50,{c:'#e8f6ff',r:2+R()*2.5,l:48,vx:P.d*(2+R()*3),vy:-2.5-R()*2,f:1})}
 else if(f.t=='mv'){const[wx,wy]=mvp(f),k=f.k;if(k=='meteor')fp(wx,wy,{c:R()<.5?'#ff8a30':'#ffd060',r:8,l:16,vy:R()*1.5});else if(k=='ghost'||k=='wolf'||k=='baby')fp(wx,wy,{c:f.c,r:6,l:16,vy:R()*1.5,vx:(R()-.5)*2});else if(k=='sword')fp(wx,wy+20,{c:'#fff3c0',r:3,l:8})}
 else if(f.t=='dragon'){const p=1-f.l/f.m;fp(f.x+f.d*(40+p*(f.rch||720)),70+Math.sin(p*16)*32,{c:'#ff8a30',r:9,l:18,vy:R()*2})}});
 TM.forEach(q=>{if(--q.l<=0)q.fn()});TM=TM.filter(q=>q.l>0);
 FP.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy-=p.g;p.vx*=p.f;p.vy*=p.f;p.l--});FP=FP.filter(p=>p.l>0&&p.y>-30);
 if(FLS&&--FLS.l<=0)FLS=null}
function fxs(){const gy=GY;
FX.forEach(f=>{const x=(f.x-cam)*s,p=1-f.l/f.m;g.save();
if(f.fn){g.globalCompositeOperation='lighter';f.fn(f,p,x,gy)}
else if(f.t=='sl'){g.translate(x,gy-50*s);g.scale(s,s);g.strokeStyle='#fff';g.shadowColor=f.c;g.shadowBlur=14;g.lineWidth=7;g.globalAlpha=1-p*.6;g.beginPath();if(f.br==1){g.moveTo(-50,12);g.lineTo(50,-12)}else g.arc(0,0,48,-2.2+p*.8,-.6+p*.9);g.stroke()}
else if(f.t=='ep'){g.strokeStyle='#f66';g.lineWidth=3*s;g.globalAlpha=1-p;g.beginPath();g.moveTo((f.x2-cam)*s,gy-46*s);g.lineTo(x,gy-42*s);g.stroke()}
else if(f.t=='ring'){const R0=f.r*(1-(1-p)*(1-p)),al=1-p;g.translate(x,gy-8*s);g.scale(s,s*.24);g.globalCompositeOperation='lighter';const q=g.createRadialGradient(0,0,R0*.3,0,0,R0+1);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,f.c);g.fillStyle=q;g.globalAlpha=al*.4;g.beginPath();g.arc(0,0,R0,0,TAU);g.fill();g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=10;g.globalAlpha=al;g.lineWidth=7;g.beginPath();g.arc(0,0,R0,0,TAU);g.stroke();g.strokeStyle='#fff';g.lineWidth=2.5;g.globalAlpha=al*.7;g.beginPath();g.arc(0,0,R0*.86,0,TAU);g.stroke()}
else if(f.t=='cres'){g.translate(x-20*f.d*s,gy-52*s);g.scale(s*f.d,s);g.rotate(f.a);const r=f.r*(.55+p*.45);g.globalCompositeOperation='lighter';g.globalAlpha=1-p*p;g.shadowColor=f.c;g.shadowBlur=18;const q=g.createLinearGradient(-r*.2,0,r*1.1,0);q.addColorStop(0,f.c);q.addColorStop(1,'#fff');g.fillStyle=q;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*(.9+p*.5),0,0,r);g.quadraticCurveTo(r*(.35+p*.4),0,0,-r);g.fill()}
else if(f.t=='dome'){g.translate((P.x-cam)*s,gy);g.scale(s,s);const R0=f.r,al=Math.min(1,Math.sin(p*PI)*1.6);g.globalCompositeOperation='lighter';const q=g.createRadialGradient(0,-R0*.5,R0*.2,0,-R0*.5,R0*1.1);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,f.c);g.globalAlpha=al*.45;g.fillStyle=q;g.beginPath();g.ellipse(0,0,R0,R0*1.15,0,PI,0);g.fill();g.globalAlpha=al;g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=14;g.lineWidth=3;g.beginPath();g.ellipse(0,0,R0,R0*1.15,0,PI,0);g.stroke();g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,R0*.5,R0*1.15,0,PI,0);g.stroke()}
else if(f.t=='orb'){const al=p>.8?(1-p)/.2:Math.min(1,p*5);g.globalCompositeOperation='lighter';g.globalAlpha=al;g.fillStyle=f.c;g.shadowColor='#9fe0ff';g.shadowBlur=12;for(let i=0;i<6;i++){const a=fr*.06+i*1.047,ox=(P.x-cam)*s+Math.cos(a)*58*s,oy=gy-(50+Math.sin(a)*14)*s;g.beginPath();g.moveTo(ox,oy-14*s);g.lineTo(ox+6*s,oy);g.lineTo(ox,oy+14*s);g.lineTo(ox-6*s,oy);g.fill()}}
else if(f.t=='bolt'){g.translate(x,gy);g.scale(s,s);g.globalCompositeOperation='lighter';g.lineJoin='round';const fl=R()<.3?.5:1;f.seg.forEach((sg,j)=>{[['#88ccff',j?5:9,.6],['#fff',j?1.5:3,1]].forEach(([c,w,a])=>{g.strokeStyle=c;g.lineWidth=w;g.globalAlpha=a*fl*(1-p*.7);g.beginPath();sg.forEach((q,i)=>i?g.lineTo(q[0],-q[1]):g.moveTo(q[0],-q[1]));g.stroke()})})}
else if(f.t=='beam'){const X1=(f.x-cam)*s,X2=(f.x2-cam)*s,Y=gy-f.y*s,w=f.w*s*(1-p*.6),al=1-p;g.globalCompositeOperation='lighter';const q=g.createLinearGradient(X1,0,X2,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.7,f.c);q.addColorStop(1,'#fff');g.fillStyle=q;g.globalAlpha=al*.9;g.shadowColor=f.c;g.shadowBlur=16;g.beginPath();g.moveTo(X1,Y);g.lineTo(X2,Y-w/2);g.lineTo(X2,Y+w/2);g.fill();g.strokeStyle='#fff';g.lineWidth=Math.max(1,w*.22);g.globalAlpha=al;g.beginPath();g.moveTo(X1,Y);g.lineTo(X2,Y);g.stroke()}
else if(f.t=='rune'){g.translate(x,gy-6*s);g.scale(s,s*.3);g.globalCompositeOperation='lighter';const al=p<.15?p/.15:1-(p-.15)/.85,R0=f.r;g.globalAlpha=al;g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=12;g.lineWidth=4;g.beginPath();g.arc(0,0,R0,0,TAU);g.stroke();g.lineWidth=2;g.beginPath();g.arc(0,0,R0*.78,0,TAU);g.stroke();g.rotate(fr*.04);g.beginPath();for(let i=0;i<=5;i++){const a=i*4*PI/5-1.57,X=Math.cos(a)*R0*.78,Y=Math.sin(a)*R0*.78;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();for(let i=0;i<12;i++){const a=i*.5236;g.beginPath();g.moveTo(Math.cos(a)*R0*.82,Math.sin(a)*R0*.82);g.lineTo(Math.cos(a)*R0*.97,Math.sin(a)*R0*.97);g.stroke()}}
else if(f.t=='pillar'){const w=f.w*s*(1-p*.5);g.globalCompositeOperation='lighter';const q=g.createLinearGradient(0,gy,0,0);q.addColorStop(0,f.c);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=(1-p)*.8;g.fillStyle=q;g.fillRect(x-w/2,0,w,gy);g.fillStyle='#fff';g.globalAlpha=(1-p)*.6;g.fillRect(x-w*.15,0,w*.3,gy)}
else if(f.t=='crack'){g.translate(x,gy);g.scale(s,s);const gr=Math.min(1,p*3);g.globalCompositeOperation='lighter';g.strokeStyle='#ffa040';g.shadowColor='#ff6a20';g.shadowBlur=12;g.lineWidth=4;g.lineJoin='round';g.globalAlpha=1-Math.max(0,(p-.5)/.5);f.seg.forEach(sg=>{const n=Math.ceil(sg.length*gr);g.beginPath();for(let i=0;i<n;i++)i?g.lineTo(sg[i][0],sg[i][1]):g.moveTo(sg[i][0],sg[i][1]);g.stroke()})}
else if(f.t=='spike'){g.translate(x,gy);g.scale(s,s);const gr=Math.min(1,p*4);g.globalAlpha=1-Math.max(0,(p-.6)/.4);const q=g.createLinearGradient(0,0,0,-90);q.addColorStop(0,'#5ab8ff');q.addColorStop(1,'#fff');g.fillStyle=q;g.shadowColor='#9fe0ff';g.shadowBlur=14;[[-26,60],[0,92],[24,66]].forEach(([bx,h])=>{h*=gr;g.beginPath();g.moveTo(bx-9,0);g.lineTo(bx+(bx>0?3:-3),-h);g.lineTo(bx+9,0);g.fill()})}
else if(f.t=='trap'){g.translate(x,gy);g.scale(s,s);const o=(1-Math.min(1,p*3))*46;g.globalAlpha=p<.7?1:1-(p-.7)/.3;g.fillStyle='#dfe3f0';g.shadowColor='#9fb0ff';g.shadowBlur=8;for(let i=0;i<6;i++){const bx=-36+i*12;g.beginPath();g.moveTo(bx,-(o+54));g.lineTo(bx+6,-(o+14));g.lineTo(bx+12,-(o+54));g.fill();g.beginPath();g.moveTo(bx+6,0);g.lineTo(bx+12,-40);g.lineTo(bx+18,0);g.fill()}}
else if(f.t=='claw'){g.translate(x,gy-50*s);g.scale(s,s);g.lineCap='round';g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=12;g.globalAlpha=1-p*p;const L=Math.min(1,p*4);for(let i=-1;i<=1;i++){g.lineWidth=6-Math.abs(i)*2;g.beginPath();g.moveTo(-30+i*16,-44);g.lineTo(-30+i*16+60*L,-44+88*L);g.stroke()}}
else if(f.t=='whirl'){g.translate((P.x-cam)*s,gy-50*s);g.scale(s,s*.55);g.globalCompositeOperation='lighter';g.lineCap='round';const al=Math.sin(p*PI);for(let i=0;i<3;i++){const a=p*14+i*2.094;g.globalAlpha=al;g.strokeStyle=i?f.c:'#fff';g.lineWidth=7;g.shadowColor=f.c;g.shadowBlur=14;g.beginPath();g.arc(0,0,f.r*(.75+.25*Math.sin(p*6)),a,a+1.5);g.stroke()}}
else if(f.t=='cross'){g.translate(x,gy-46*s);g.scale(s,s);g.strokeStyle='#ff5040';g.lineWidth=2.5;g.globalAlpha=1-p;const r=38-p*14;g.beginPath();g.arc(0,0,r,0,TAU);g.moveTo(-r-10,0);g.lineTo(-r+10,0);g.moveTo(r-10,0);g.lineTo(r+10,0);g.moveTo(0,-r-10);g.lineTo(0,-r+10);g.moveTo(0,r-10);g.lineTo(0,r+10);g.stroke()}
else if(f.t=='skull'){g.font=(46*s)+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.shadowColor='#b050ff';g.shadowBlur=18;g.globalAlpha=Math.sin(p*PI);g.fillText('☠️',x,gy-(90+p*40)*s)}
else if(f.t=='mv'){const[wx,wy]=mvp(f),k=f.k;g.translate((wx-cam)*s,gy-wy*s);g.scale(s,s);g.globalCompositeOperation='lighter';
 if(k=='sword'){g.shadowColor=f.c;g.shadowBlur=14;g.fillStyle='#fff';g.beginPath();g.moveTo(0,28);g.lineTo(-5,-8);g.lineTo(5,-8);g.fill();g.fillStyle=f.c;g.fillRect(-11,-12,22,4);g.fillRect(-2,-26,4,14)}
 else if(k=='meteor'){const sg=Math.sign(f.x0-f.x1)||1,q=g.createLinearGradient(0,0,sg*90,-90);q.addColorStop(0,f.c);q.addColorStop(1,'rgba(255,80,0,0)');g.strokeStyle=q;g.lineWidth=22;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(sg*90,-90);g.stroke();const h=g.createRadialGradient(0,0,2,0,0,26);h.addColorStop(0,'#fff');h.addColorStop(.4,'#ffd060');h.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=h;g.beginPath();g.arc(0,0,26,0,TAU);g.fill()}
 else if(k=='arrow'){g.rotate(Math.atan2(f.y0-f.y1,f.x1-f.x0));g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=8;g.lineWidth=3;g.beginPath();g.moveTo(-38,0);g.lineTo(8,0);g.stroke();g.fillStyle='#fff';g.beginPath();g.moveTo(18,0);g.lineTo(6,-5);g.lineTo(6,5);g.fill()}
 else if(k=='baby'){[.05,.1,.15].forEach((d,i)=>{const p2=Math.max(0,p-d),q=mvp({x0:f.x0,y0:f.y0,x1:f.x1,y1:f.y1,arc:f.arc,k:'baby',l:f.m*(1-p2),m:f.m});NYD(q[0]-wx,-(q[1]-wy),58,.3-i*.08,f.c)});const h=g.createRadialGradient(0,0,2,0,0,54);h.addColorStop(0,'rgba(255,255,255,.55)');h.addColorStop(.4,f.c);h.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.4;g.fillStyle=h;g.beginPath();g.arc(0,0,54,0,TAU);g.fill();NYD(0,0,64,1,f.c)}
 else{const h=g.createRadialGradient(0,0,2,0,0,46);h.addColorStop(0,f.c);h.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.5;g.fillStyle=h;g.beginPath();g.arc(0,0,46,0,TAU);g.fill();g.globalCompositeOperation='source-over';g.globalAlpha=.9;g.font=(k=='wolf'?68:34)+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='middle';if(k=='wolf'&&f.x1>f.x0)g.scale(-1,1);g.fillText(k=='wolf'?'🐺':'👻',0,0)}}
else if(f.t=='dragon'){g.globalCompositeOperation='lighter';const al=Math.min(1,(1-p)*3),N=20,dd=f.d;for(let i=N;i>=0;i--){const t=p-i*.02;if(t<0)continue;const wx=f.x+dd*(40+t*(f.rch||720)),wy=70+Math.sin(t*16)*32,X=(wx-cam)*s,Y=gy-wy*s,r=(i?22*(1-i/(N+4)):30)*s,q=g.createRadialGradient(X,Y,1,X,Y,r);q.addColorStop(0,i%2?'#fff3c0':'#ffe08a');q.addColorStop(.6,i<6?'#ff9a30':'#ff5a20');q.addColorStop(1,'rgba(255,60,0,0)');g.globalAlpha=al*(1-i/(N+6));g.fillStyle=q;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill();
 if(!i){g.globalAlpha=al;g.fillStyle='#fff';g.beginPath();g.arc(X+dd*8*s,Y-6*s,3.5*s,0,TAU);g.fill();g.strokeStyle='#ffcf5a';g.lineWidth=4*s;g.lineCap='round';g.beginPath();g.moveTo(X-dd*6*s,Y-14*s);g.lineTo(X-dd*26*s,Y-34*s);g.moveTo(X+dd*2*s,Y-14*s);g.lineTo(X-dd*12*s,Y-38*s);g.stroke()}}}
g.restore()});
g.save();g.globalCompositeOperation='lighter';
FP.forEach(p=>{const a=p.l/p.m,x=(p.x-cam)*s,y=gy-p.y*s;g.globalAlpha=Math.min(1,a*1.4);g.fillStyle=p.c;g.strokeStyle=p.c;
 if(p.k=='s'){g.lineWidth=Math.max(1,p.r*.5*s);g.beginPath();g.moveTo(x,y);g.lineTo(x-p.vx*3*s,y+p.vy*3*s);g.stroke()}
 else if(p.k=='d'){g.save();g.translate(x,y);g.rotate(p.l*.2);const r=p.r*s*(.4+a*.6);g.beginPath();g.moveTo(0,-r*1.6);g.lineTo(r,0);g.lineTo(0,r*1.6);g.lineTo(-r,0);g.fill();g.restore()}
 else{const r=Math.max(.5,p.r*s*(p.sh?a:.5+a*.5));g.globalAlpha*=.35;g.beginPath();g.arc(x,y,r*2,0,TAU);g.fill();g.globalAlpha=Math.min(1,a*1.4);g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}});
g.restore();
if(FLS){g.save();g.globalAlpha=FLS.l/FLS.m*.35;g.fillStyle=FLS.c;g.fillRect(0,0,W,H);g.restore()}}
function pjs(){const gy=GY;PJ.forEach(p=>{if(!p.vx)return;const x=(p.x-cam)*s,n=p.n||p.k,dr=Math.sign(p.vx),T2=fr;g.save();g.translate(x,gy-46*s);g.scale(s*dr,s);g.globalCompositeOperation='lighter';
 if(p.k=='a'){const pi=p.pi,L=pi?150:92,Wd=pi?11:6.5,cA=pi?'#9fe0ff':'#ffd86a';
  for(let gI=3;gI>=1;gI--){g.globalAlpha=.16/gI;g.strokeStyle=cA;g.lineWidth=Wd*(1+gI*.5);g.lineCap='round';g.beginPath();g.moveTo(-L*(1+gI*.15),Math.sin(T2*.5+gI)*gI*2);g.lineTo(6,0);g.stroke()}
  g.globalAlpha=1;const q=g.createLinearGradient(-L,0,12,0);q.addColorStop(0,'rgba(255,230,160,0)');q.addColorStop(.7,pi?'rgba(159,224,255,.8)':'rgba(255,214,110,.8)');q.addColorStop(1,'#fff');g.strokeStyle=q;g.lineWidth=Wd;g.lineCap='round';g.beginPath();g.moveTo(-L,0);g.lineTo(12,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=Wd*.35;g.beginPath();g.moveTo(-L*.55,0);g.lineTo(16,0);g.stroke();
  g.strokeStyle=cA;g.lineWidth=1.8;for(let h=0;h<2;h++){g.globalAlpha=.75;g.beginPath();for(let i=0;i<=24;i++){const u=i/24,xx=-L*.9*(1-u)+4*u,yy=Math.sin(u*16-T2*.55+h*3.14)*(3+9*(1-u)*(pi?1.4:1));i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
  g.globalAlpha=1;g.shadowColor=cA;g.shadowBlur=18;g.fillStyle='#fff';g.beginPath();g.moveTo(32,0);g.lineTo(9,-8);g.lineTo(13,0);g.lineTo(9,8);g.fill();g.shadowBlur=0;
  const gq=g.createRadialGradient(22,0,0,22,0,pi?42:28);gq.addColorStop(0,'rgba(255,255,255,.95)');gq.addColorStop(.35,pi?'rgba(159,224,255,.55)':'rgba(255,214,110,.55)');gq.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gq;g.beginPath();g.arc(22,0,pi?42:28,0,6.2832);g.fill();
  if(pi){g.strokeStyle='#bfe8ff';g.lineWidth=2.4;for(let r=0;r<3;r++){g.globalAlpha=.7-r*.2;g.beginPath();g.ellipse(34+r*18,0,8+r*5,20+r*8,0,0,6.2832);g.stroke()}}}
 else{const B=p.big,r=B?20:13,c=CHR[cur].c,fire=n=='Hỏa Cầu'||n=='Hỏa Long Cầu',pu=1+Math.sin(T2*.6)*.1,R2=r*2.6*pu,q=g.createRadialGradient(0,0,1,0,0,R2);
  if(fire){q.addColorStop(0,'#fff');q.addColorStop(.25,'#ffe27a');q.addColorStop(.55,'#ff6a20');q.addColorStop(1,'rgba(255,60,0,0)')}else{q.addColorStop(0,'#fff');q.addColorStop(.3,c);q.addColorStop(1,'rgba(0,0,0,0)')}
  g.fillStyle=q;g.globalAlpha=.95;g.beginPath();g.arc(0,0,R2,0,6.2832);g.fill();g.globalAlpha=1;
  const tl=g.createLinearGradient(-r*7,0,0,0);tl.addColorStop(0,'rgba(255,100,30,0)');tl.addColorStop(1,fire?'rgba(255,150,50,.75)':RGBA(c,.7));g.fillStyle=tl;g.beginPath();g.moveTo(0,-r*.9);g.quadraticCurveTo(-r*3.5,-r*(.7+Math.sin(T2*.4)*.3),-r*7,0);g.quadraticCurveTo(-r*3.5,r*(.7+Math.cos(T2*.4)*.3),0,r*.9);g.fill();
  g.save();g.rotate(T2*.25);g.fillStyle=fire?'#fff0b0':'#fff';star(fire?6:4,r*1.7,r*.45,0);g.fill();g.restore();
  for(let i=0;i<(B?5:3);i++){const a=T2*.3+i*6.2832/(B?5:3);g.fillStyle=fire?'#ffd060':c;g.beginPath();g.arc(Math.cos(a)*r*1.9,Math.sin(a)*r*1.9*.7,B?4:3,0,6.2832);g.fill()}
  if(B){g.strokeStyle=fire?'#ff8a30':c;g.lineWidth=2.4;g.globalAlpha=.7;g.beginPath();g.ellipse(0,0,r*2.1,r*.9,T2*.15,0,6.2832);g.stroke();g.beginPath();g.ellipse(0,0,r*2.1,r*.9,-T2*.15+1.4,0,6.2832);g.stroke()}}
 g.restore()})}
const soulBirth=c=>fx({x:P.x,l:130,fn:(f,p)=>{const X=(P.x-cam)*s,e=1-Math.pow(1-Math.min(1,p/.55),3),y=GY-(70+126*e)*s,hh=(28+56*e)*s,al=p<.12?p/.12:p>.85?(1-p)/.15:1;
 const q=g.createRadialGradient(X,y,2,X,y,hh*1.4);q.addColorStop(0,'rgba(255,255,255,.7)');q.addColorStop(.4,c);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=al*.55;g.fillStyle=q;g.beginPath();g.arc(X,y,hh*1.4,0,TAU);g.fill();
 g.save();g.translate(X,y);g.rotate(p*2.2);g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=10;g.lineCap='round';for(let i=0;i<14;i++){g.rotate(TAU/14);const L=(hh*.7+p*hh*(i%2?1.8:1.2));g.lineWidth=(i%2?1.5:2.5)*s;g.globalAlpha=al*(1-p)*.7;g.beginPath();g.moveTo(hh*.55,0);g.lineTo(L,0);g.stroke()}g.restore();
 NYD(X,y,hh,al,c)}});
const cult=(c,big,k)=>{rune(P.x,big?130:80,c,50);fx({t:'pillar',x:P.x,w:big?90:50,c,l:big?44:28});bst(P.x,40,big?40:16,c,big?7:4,26,4,{k:'d',g:-.05});flash(c,big?36:12);if(big)shake(6);
 fx({t:'ring',x:P.x,r:big?240:120,c,l:big?34:22});
 if(big){later(8,()=>fx({t:'ring',x:P.x,r:340,c:'#fff',l:34}));later(16,()=>fx({t:'ring',x:P.x,r:450,c,l:38}));
  for(let i=0;i<40;i++)later(i,()=>{const a=R()*TAU,r=110+R()*70;fp(P.x+Math.cos(a)*r,60+Math.sin(a)*r*.6,{c,r:2.5+R()*3,l:16,vx:-Math.cos(a)*r/16,vy:-Math.sin(a)*r*.6/16,f:1,k:i%2?'o':'d'})});
  if(k>=3)later(14,()=>soulBirth(c))}};
const BS=(n,f)=>{const o=SFX[n];SFX[n]=o?(a=>{o(a);f(a)}):f};
const flare=(x,y,c,Rr,l)=>fx({x,l,fn:(f,p,X,gy)=>{const Y=gy-y*s,a=1-p,r=Rr*s*(.4+.9*Math.sin(Math.min(1,p*1.6)*1.57));g.save();g.translate(X,Y);const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,'rgba(255,255,255,'+a+')');q.addColorStop(.3,c);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=q;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.rotate(p*1.4);g.fillStyle='#fff';g.globalAlpha=a*.9;for(let i=0;i<8;i++){g.rotate(TAU/8);g.beginPath();g.moveTo(r*.15,0);g.lineTo(r*(i%2?.9:1.5),0);g.lineTo(r*.15,r*.08);g.fill()}g.restore()}});
const gwave=(x,c,Rr,l)=>fx({x,l,fn:(f,p,X,gy)=>{const r=Rr*s*Math.sin(Math.min(1,p*1.25)*1.57),a=1-p;g.save();g.translate(X,gy-3*s);g.scale(1,.26);g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=18;g.lineWidth=(10-8*p)*s;g.globalAlpha=a;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.lineWidth=3*s;g.strokeStyle='#fff';g.beginPath();g.arc(0,0,r*.92,0,TAU);g.stroke();g.restore()}});
const vcol=(x,c,w,l)=>fx({x,l,fn:(f,p,X,gy)=>{const a=p<.2?p/.2:1-(p-.2)/.8,ww=w*s*(1-p*.4),q=g.createLinearGradient(X-ww,0,X+ww,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.5,c);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a*.85;g.fillStyle=q;g.fillRect(X-ww,0,ww*2,gy)}});
const spin=(x,c,n,l,sp)=>{for(let i=0;i<n;i++)later(i,()=>{const a=i*.55;fp(x+Math.cos(a)*36,6,{c,r:3.5,l:l||40,vy:sp||3,vx:Math.cos(a+1.57)*1.2,k:'d'})})};
const mixc=()=>CHR[cur].c;
BS('Hỏa Cầu',({d,px})=>{flare(px+d*34,96,'#ff9a30',90,18);gwave(px,'#ff8a30',110,20);bst(px+d*40,66,26,'#ffb060',7,22,5,{g:.08});bst(px+d*40,66,12,'#fff3c0',5,16,3,{k:'s'});shake(2)});
BS('Hỏa Long Cầu',({d,px})=>{flare(px+d*34,96,'#ff7a20',150,24);gwave(px,'#ff7a20',170,26);later(5,()=>gwave(px,'#ffd060',120,22));vcol(px,'rgba(255,120,30,.9)',50,26);bst(px+d*40,66,44,'#ff8a30',9,28,7,{g:.1});spin(px,'#ffb060',26,46,3.5);flash('#ff9a40',10);shake(5)});
BS('Sét Đánh',({tx,px,d,e})=>{flare(px+d*34,98,'#cfe8ff',110,16);bolt(px+d*34);later(2,()=>bolt(tx-26));later(4,()=>bolt(tx+30));later(6,()=>bolt(tx));gwave(tx,'#88ccff',150,22);vcol(tx,'rgba(200,230,255,.9)',44,14);bst(tx,44,34,'#e8f4ff',9,20,4,{k:'s'});flash('#e0f0ff',9);shake(6)});
BS('Triệu Linh Lang',({px})=>{gwave(px-40,'#9fe0ff',140,28);vcol(px-40,'rgba(159,224,255,.9)',50,34);spin(px-40,'#9fe0ff',30,50,3.2);flare(px-40,60,'#9fe0ff',100,22);shake(3)});
BS('Triệu Cự Thạch',({px})=>{gwave(px-40,'#e0b070',170,30);later(6,()=>gwave(px-40,'#a07040',120,26));vcol(px-40,'rgba(224,176,112,.9)',60,38);for(let i=0;i<22;i++)fp(px-40+(R()-.5)*90,6,{c:'#c9a878',r:6+R()*7,l:34,vx:(R()-.5)*4,vy:2+R()*4,g:.2,f:.95});shake(7)});
BS('Triệu Mộc Linh',({px})=>{gwave(px,'#8fffb0',150,28);vcol(px,'rgba(143,255,176,.8)',56,34);spin(px,'#c8ffd8',30,56,2.8);flare(px,70,'#8fffb0',90,24)});
BS('Băng Giáp',({px})=>{gwave(px,'#9fe0ff',150,26);flare(px,70,'#cfeaff',110,26);bst(px,60,34,'#e8f8ff',6,30,4,{k:'s',g:-.02});vcol(px,'rgba(159,224,255,.8)',50,30);flash('#cfeaff',8)});
BS('Bão Tuyết',({px,rr})=>{gwave(px,'#9fe0ff',rr,34);later(6,()=>gwave(px,'#fff',rr*.7,28));for(let i=0;i<5;i++)later(i*3,()=>E.forEach(e=>{if(Math.abs(e.x-px)<rr)fx({t:'spike',x:e.x+(R()-.5)*40,l:30})}));for(let i=0;i<60;i++)later(i%30,()=>fp(px+(R()*2-1)*rr,150+R()*90,{c:'#eaf6ff',r:2+R()*3,l:50,vx:P.d*(1+R()*4),vy:2+R()*3,f:1,k:'s'}));flash('#dff2ff',14);shake(6)});
BS('Thiên Hỏa Giáng',()=>{later(10,()=>rain(tgts(12),'meteor','#ffb040',3,14,1));later(20,()=>rain(tgts(10),'meteor','#ff6a20',2,14,1));gwave(P.x,'#ff8a30',320,36);later(8,()=>gwave(P.x,'#ffd060',460,40));flash('#ff9a40',30);shake(11)});
BS('Vạn Linh Giáng Thế',({px})=>{gwave(px,'#bfffe8',260,40);later(6,()=>gwave(px,'#fff',380,40));vcol(px,'rgba(191,255,232,.9)',90,44);flare(px,90,'#bfffe8',160,30);tgts(8).forEach((x,i)=>later(10+i*2,()=>{fx({t:'mv',k:'ghost',x0:px,y0:80,x1:x,y1:30,arc:60+R()*70,l:18,c:'#d8fff4'});later(18,()=>{bst(x,36,12,'#bfffe8',6,20,4);gwave(x,'#bfffe8',90,16)})}));shake(7)});
BS('Tên Nhanh',({d,px})=>{flare(px+d*42,56,'#ffd86a',70,12);for(let i=0;i<8;i++)fp(px+d*42,56+(R()-.5)*14,{k:'s',c:'#fff3c0',vx:d*(8+R()*8),vy:(R()-.5)*3,l:12,r:3,f:.92});gwave(px,'#ffd86a',80,16)});
BS('Mưa Tên',({px,rr,c})=>{const mk=(col,dl)=>later(dl,()=>{const xs=[];for(let i=0;i<20;i++)xs.push(px+(R()*2-1)*rr);rain(xs,'arrow',col,1,12,0)});mk('#fff3c0',5);mk('#ffd86a',11);gwave(px,'#ffd86a',rr,34);later(4,()=>gwave(px,'#fff',rr*.6,28));vcol(px,'rgba(255,220,120,.7)',70,30);flash('#ffe9a0',12);shake(4)});
BS('Xạ Kích',({d,px,tx,e})=>{fx({t:'beam',x:px+d*30,x2:tx,y:46,w:34,c:'#fff3c0',l:14});flare(px+d*40,54,'#ffd070',100,14);flare(tx,50,'#ffd070',120,18);gwave(tx,'#ffd070',100,18);fx({t:'cross',x:tx,l:24});bst(tx,50,30,'#fff3c0',8,18,3,{k:'s'});shake(4)});
BS('Tên Xuyên Giáp',({d,px})=>{fx({t:'beam',x:px+d*30,x2:px+d*vw()*.95,y:46,w:30,c:'#bfe8ff',l:18});fx({t:'beam',x:px+d*30,x2:px+d*vw()*.95,y:46,w:10,c:'#fff',l:14});flare(px+d*40,54,'#9fe0ff',120,16);for(let i=0;i<16;i++)later(i,()=>fp(px+d*(60+i*40),46+(R()-.5)*10,{c:'#bfe8ff',r:3,l:18,k:'s',vy:(R()-.5)*2}));gwave(px,'#9fe0ff',110,20);shake(4)});
BS('Tử Thần Tiễn',({d,px})=>{fx({t:'beam',x:px+d*30,x2:px+d*vw()*.95,y:46,w:90,c:'#d090ff',l:30});later(3,()=>fx({t:'beam',x:px+d*30,x2:px+d*vw()*.95,y:46,w:30,c:'#fff',l:22}));flare(px+d*40,56,'#c070ff',200,28);gwave(px,'#c070ff',260,34);later(6,()=>gwave(px,'#fff',360,36));vcol(px,'rgba(190,100,255,.8)',70,34);E.forEach(e=>later(6,()=>{flare(e.x,50,'#ff4060',130,22);gwave(e.x,'#ff4060',100,20)}));flash('#a040ff',16);shake(10)});
BS('Bẫy Kẹp',({rr})=>{gwave(P.x,'#dfe3f0',rr,32);E.forEach(e=>{if(Math.abs(e.x-P.x)<rr){gwave(e.x,'#dfe3f0',90,22);bst(e.x,20,20,'#fff',6,20,3,{k:'s'})}});shake(4)});
BS('Mũi Tên Độc',({px,rr})=>{const mk=(col,dl)=>later(dl,()=>{const xs=[];for(let i=0;i<20;i++)xs.push(px+(R()*2-1)*rr);rain(xs,'arrow',col,1,12,0)});mk('#b8ff9a',6);mk('#7fe85a',12);gwave(px,'#7fe85a',rr,36);for(let i=0;i<30;i++)later(i%24,()=>fp(px+(R()*2-1)*rr,8+R()*30,{c:'#7fe85a',r:8+R()*8,l:60,vy:.4+R()*.8,vx:(R()-.5)*.8,f:1,sh:1}));flash('#a0ff80',10);shake(4)});
BS('Gọi Ưng',({px})=>{gwave(px-40,'#ffe9a0',150,28);vcol(px-40,'rgba(255,233,160,.9)',50,34);flare(px-40,70,'#ffe9a0',110,24);spin(px-40,'#fff3c0',26,50,3)});
BS('Điều Tức',({px})=>{gwave(px,'#a8f07a',140,28);vcol(px,'rgba(168,240,122,.8)',50,32);spin(px,'#d8ffb0',26,54,2.8)});
BS('Săn Mồi',({d,px})=>{gwave(px,'#9fe0ff',160,30);flare(px+d*40,54,'#9fe0ff',130,20);E.forEach(e=>later(16,()=>{flare(e.x,50,'#ff6050',120,20);gwave(e.x,'#ff6050',90,18)}));shake(7)});
BS('Hấp Hồn Ấn',({px,rr})=>{gwave(px,'#8fffb0',rr,32);later(5,()=>gwave(px,'#c8ffd8',rr*.6,26));for(let i=0;i<30;i++)later(i%20,()=>{const a=R()*TAU,r0=rr*(.4+R()*.6);fp(px+Math.cos(a)*r0,40+Math.sin(a)*r0*.2,{c:'#bfffe8',r:3+R()*3,l:24,vx:-Math.cos(a)*r0/24,vy:1+R(),f:1,k:'s'})});vcol(px,'rgba(143,255,176,.8)',60,30);flash('#8fffb0',8);shake(3)});
BS('Lôi Liên Chuỗi',({px})=>{flare(px+P.d*30,98,'#cfe8ff',110,16);E.filter(e=>e.in<=0).sort((a,b)=>Math.abs(a.x-px)-Math.abs(b.x-px)).slice(0,6).forEach((e,i)=>later(i*3,()=>{bolt(e.x);gwave(e.x,'#88ccff',100,18);bst(e.x,44,16,'#e8f4ff',7,16,3,{k:'s'})}));flash('#e0f0ff',8);shake(5)});
BS('Ảnh Kích',({e,px})=>{const x=e?e.x:px+P.d*70;for(let j=0;j<2;j++)later(j*4,()=>{fx({t:'claw',x:x+(R()-.5)*20,c:'#ff6080',l:12});bst(x,50,8,'#ff9aa8',6,14,3,{k:'s'})});shake(2)});
BS('Ám Sát Liên Hoàn',({e,px})=>{const x=e?e.x:px+P.d*70;gwave(px,'#d060ff',90,18);for(let j=0;j<4;j++)later(j*4,()=>{fx({t:'claw',x:x+(R()-.5)*30,c:j%2?'#fff':'#d060ff',l:12});bst(x,50,10,'#d060ff',6,16,3,{k:'s'})});later(14,()=>{rg(x,110,'#d060ff',18);shake(5)})});
BS('Ẩn Thân Bộ',({px})=>{gwave(px,'#6a4a9a',150,28);vcol(px,'rgba(106,74,154,.85)',56,34);for(let i=0;i<24;i++)later(i%14,()=>fp(px+(R()-.5)*70,10+R()*70,{c:'#2a1a3a',r:8+R()*8,l:50,vy:.5+R(),vx:(R()-.5)*1.2,f:1,sh:1}));flash('#3a2a5a',10)});
BS('Phi Đao Toàn Phong',({px,rr})=>{gwave(px,'#e8f4ff',rr,26);for(let i=0;i<20;i++)later(i%12,()=>{const a=i*.9;fp(px+Math.cos(a)*rr*.5,40+R()*40,{c:'#e8f4ff',r:3,l:18,k:'s',vx:Math.cos(a)*7,vy:(R()-.5)*2,f:.95})});rg(px,rr,'#fff',22);shake(4)});
BS('Huyết Ảnh Trảm',({px,rr})=>{gwave(px,'#ff4060',rr,32);later(4,()=>gwave(px,'#fff',rr*.7,24));E.forEach(e=>{if(Math.abs(e.x-px)<rr){fx({t:'claw',x:e.x,c:'#ff4060',l:16});bst(e.x,50,14,'#ff6080',7,18,3,{g:.1})}});flash('#ff4060',12);shake(7)});
BS('Vạn Ảnh Sát Vực',({px})=>{gwave(px,'#d060ff',300,36);later(6,()=>gwave(px,'#fff',420,36));E.forEach((e,i)=>later(8+i*2,()=>{fx({t:'claw',x:e.x,c:'#ff4060',l:16});fx({t:'claw',x:e.x+10,c:'#d060ff',l:16});bst(e.x,50,16,'#ff6080',7,20,4)}));flash('#7a20c0',24);shake(9)});
const PFX=1;const PF={
shoot:(k,x0,x1,y0)=>{const c=k==1?'#fff3c0':'#7fe85a';fx({x:x0,l:14,fn:(f,p,X,gy)=>{const u=Math.min(1,p*1.15),x=(x0+(x1-x0)*u-cam)*s,y=gy-(y0+(52-y0)*u)*s;for(let i=0;i<5;i++){const v=Math.max(0,u-i*.05);glowDraw((x0+(x1-x0)*v-cam)*s,gy-(y0+(52-y0)*v)*s,(9-i)*s,c,.85-i*.15)}glowDraw(x,y,14*s,'#ffffff',.9)}})},
hit:(k,ev,x,y)=>{const c=['#ffa733','#fff3c0','#7fe85a','#7fd8ff'][k];flare(x,52,c,90+ev*20,16);if(k==0){fx({t:'claw',x,c:'#ff8a30',l:16});bst(x,50,16,'#ffb060',6,16,3,{k:'s'});shake(3)}
 else if(k==1){cres(x,P.d,-.6,80,'#fff3c0',14);bst(x,54,14,'#fff',6,14,3,{k:'s'})}
 else if(k==2){fx({t:'claw',x,c:'#7fe85a',l:16});for(let i=0;i<10;i++)fp(x+(R()-.5)*30,40+R()*30,{c:'#7fe85a',r:3+R()*3,l:34,vy:.4+R()*.6,sh:1})}
 else{rg(x,70,'#7fd8ff',16);bst(x,44,12,'#cfeeff',5,16,3,{k:'s'});cres(x,P.d,-.5,60+ev*10,ev>=3?'#ffe9a0':'#9fe0ff',14);if(ev>=1)fx({t:'claw',x,c:'#6fe0c8',l:14});if(ev>=2)gwave(x,'#59a0ff',50+ev*14,22);if(ev>=3)bst(x,50,14,'#ffe9a0',6,18,3,{k:'s'});shake(2+ev*.5)}},
skill:(k,ev,x,M,p)=>{const T=PT4[k],r=[190+ev*20,360,150+ev*15,0][k];
 if(k==0){gwave(x,'#ffa733',r+40,30);later(4,()=>gwave(x,'#fff3c0',r,26));rg(x,r,'#ffa733',22);vcol(x,'rgba(255,167,51,.9)',46,24);bst(x,50,36,'#ffb060',8,22,5,{g:.06});flash('#ffa733',6);shake(7);E.forEach(e=>{if(Math.abs(e.x-x)<r){dm(e,M*PSK[0].m);fx({t:'claw',x:e.x,c:'#ff8a30',l:16})}})}
 else if(k==1){const xs=[],tg=E.filter(e=>Math.abs(e.x-x)<r).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)).slice(0,3+ev);tg.forEach(e=>{xs.push(e.x-14,e.x+14)});while(xs.length<8)xs.push(x+P.d*(60+R()*220));rain(xs,'arrow','#fff3c0',2,12,0);later(8,()=>rain(xs.map(q=>q+(R()-.5)*30),'arrow','#ffe9a0',2,12,0));gwave(x,'#ffe9a0',200,28);flare(x,70,'#ffe9a0',120,22);flash('#fff3c0',6);shake(4);tg.forEach((e,i)=>later(10+i*3,()=>{dm(e,M*PSK[1].m);dm(e,M*PSK[1].m*.5);cres(e.x,P.d,-.5,90,'#fff',14);bst(e.x,52,16,'#fff3c0',6,16,3,{k:'s'})}))}
 else if(k==2){const tg=E.filter(e=>Math.abs(e.x-x)<r+160).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0],cx=tg?tg.x:x+P.d*160;gwave(cx,'#7fe85a',r+30,36);later(5,()=>gwave(cx,'#b8ff9a',r,30));for(let i=0;i<34;i++)later(i%20,()=>fp(cx+(R()*2-1)*(r+10),6+R()*30,{c:'#7fe85a',r:9+R()*9,l:70,vy:.35+R()*.8,vx:(R()-.5)*.8,f:1,sh:1}));vcol(cx,'rgba(127,232,90,.8)',60,34);flash('#a0ff80',6);shake(3);E.forEach(e=>{if(Math.abs(e.x-cx)<r+10){dm(e,M*PSK[2].m,1);fx({t:'claw',x:e.x,c:'#7fe85a',l:16})}})}
 else{const h=Math.round(mx()*(.05+.015*ev)*pv(p));P.hp=Math.min(mx(),P.hp+h);DT.push({x:P.x,y:130,s:'+'+h,g:1,l:55});heal(P.x,'#7fd8ff');fx({t:'dome',r:78+ev*10,c:ev>=3?'#ffe9a0':'#9fe0ff',l:70+ev*10});gwave(x,'#7fd8ff',150,28);gwave(P.x,'#cfeeff',130,28);vcol(P.x,'rgba(127,216,255,.8)',50,34);flare(x,50,'#7fd8ff',110,22);for(let i=0;i<20+ev*8;i++)later(i%12,()=>fp(P.x+Math.cos(i*.9)*(30+i%5*8),8+R()*50,{c:i%3?'#9fe0ff':'#ffffff',r:2+R()*3,l:44,vy:.5+R()*1.2,vx:Math.cos(i*.9)*.2,f:1,sh:1}));if(ev>=2)gwave(P.x,'#59a0ff',190,32);if(ev>=3){flash('#ffe9a0',6);rg(P.x,120,'#ffd36a',24)}}}};

const sumPet=(k,m)=>{if(window.SUMA)SUMA(k,m);else{if(PETS.length>=3)PETS.shift();PETS.push({x:P.x-40,k,l:840,cd:0,m})}};
ZFC.w1=[(f,c)=>{const d=P.d,px=P.x;fx({t:'beam',x:px+d*30,x2:px+d*vw()*.7,y:50,w:34,c,l:18});fx({t:'beam',x:px+d*30,x2:px+d*vw()*.7,y:50,w:10,c:'#fff',l:14});E.forEach(e=>{if(e.in<=0&&(e.x-px)*d>-40&&Math.abs(e.x-px)<vw()*.7){dm(e,3.4*f);bst(e.x,50,10,c,6,16,3,{k:'s'})}});rg(px+d*60,120,c,20);flash(c,8);shake(5)},
(f,c)=>{ZF[1](f,c);ZC.setS(360,0);rune(P.x,100,c,50);fx({t:'dome',r:96,c,l:70})},
(f,c)=>{const px=P.x;rune(px,160,c,50);later(12,()=>{E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<440){dm(e,6*f,1);fx({t:'spike',x:e.x,l:34});fx({t:'pillar',x:e.x,w:50,c,l:24})}});rg(px,440,c,26);rg(px,300,'#fff',20);flash(c,18);shake(10)})},
(f,c)=>{const L=E.filter(e=>e.in<=0).slice(0,8);rain(tgts(16),'arrow',c,2,12,0);rune(P.x,110,c,40);L.forEach((e,i)=>later(10+i*3,()=>{if(e.hp>0){dm(e,4.5*f);later(4,()=>{if(e.hp>0)dm(e,4.5*f)})}fx({t:'pillar',x:e.x,w:40,c,l:18});bst(e.x,50,12,c,6,18,4)}));flash(c,16)},
(f,c)=>{const px=P.x;rune(px,200,c,70);flash(c,50);shake(11);E.forEach((e,i)=>{if(e.in>0)return;later(10+i*3,()=>{bolt(e.x);fx({t:'pillar',x:e.x,w:90,c,l:30});if(e.hp>0)dm(e,16*f);bst(e.x,50,22,c,8,24,5,{g:.1});rg(e.x,120,c,20)})});rain(tgts(20),'arrow','#fff3c0',1,12,0);rg(px,520,c,40)}];
ZFC.m0=[(f,c)=>{const L=E.filter(e=>e.in<=0&&Math.abs(e.x-P.x)<480).slice(0,5);rune(P.x,90,c,40);(L.length?L:[null]).forEach((e,i)=>{const x1=e?e.x:P.x+P.d*220;later(4+i*3,()=>{fx({t:'mv',k:'ghost',x0:P.x,y0:110,x1,y1:40,arc:60+R()*50,l:16,c:'#d8fff4'});later(16,()=>{if(e&&e.hp>0){dm(e,1.7*f);later(4,()=>{if(e.hp>0)dm(e,1.7*f)})}fx({t:'claw',x:x1,c,l:14});bst(x1,40,12,c,6,18,4)})})});flash(c,10)},
(f,c)=>{ZF[1](f,c);ZC.setS(300,0);sumPet('wolf',1.2);rune(P.x,120,c,50)},
(f,c)=>{ZF[2](f,c);rg(P.x,300,'#8a40d0',30)},
(f,c)=>{ZF[3](f,c);rain(tgts(10),'meteor','#8a40d0',2,12,0)},
(f,c)=>{ZF[4](f,c);sumPet('golem',2);sumPet('wolf',1.4);gwave(P.x,'#bfffe8',320,40)}];
ZFC.a1=[(f,c)=>{const d=P.d,px=P.x;fx({t:'mv',k:'wolf',x0:px,y0:40,x1:px+d*vw()*.7,y1:40,l:18,c});fx({t:'beam',x:px+d*20,x2:px+d*vw()*.7,y:46,w:14,c,l:16});E.forEach(e=>{if(e.in<=0&&(e.x-px)*d>-40&&Math.abs(e.x-px)<vw()*.7){later(Math.round(Math.abs(e.x-px)/vw()*14),()=>{if(e.hp>0)dm(e,3.4*f);fx({t:'claw',x:e.x,c,l:14});bst(e.x,50,10,'#fff',6,14,3,{k:'s'})})}});flash(c,8);shake(4)},
(f,c)=>{ZF[1](f,c);ZC.setS(0,360);for(let i=0;i<20;i++)later(i%14,()=>fp(P.x+(R()-.5)*80,10+R()*80,{c:'#2a1a3a',r:8+R()*8,l:50,vy:.5+R(),vx:(R()-.5)*1.2,f:1,sh:1}))},
(f,c)=>{const px=P.x;rune(px,150,c,40);for(let i=0;i<6;i++)later(i*3,()=>cres(px+(R()-.5)*300,P.d,.4*(i%2?1:-1),140,i%2?'#fff':c,16));later(8,()=>{E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<430){dm(e,6*f,1);fx({t:'claw',x:e.x,c,l:16})}});rg(px,430,c,26);flash(c,14);shake(8)})},
(f,c)=>ZFC.a[3](f,c),
(f,c)=>{rune(P.x,200,c,60);flash('#7a20c0',44);shake(10);E.forEach((e,i)=>{if(e.in>0)return;later(10+i*3,()=>{fx({t:'skull',x:e.x,l:46});for(let j=0;j<3;j++)later(j*3,()=>fx({t:'claw',x:e.x+(j-1)*14,c:j%2?'#fff':'#ff4060',l:14}));if(e.hp>0)dm(e,16*f);bst(e.x,50,18,'#d060ff',7,22,4)})});rg(P.x,520,c,40)}];

const trib=(k,done)=>{const n=Math.min(9,2*k-3),pct=.06+.008*(k-3),c='#cfe0ff',T0=70,GAP=48,total=T0+(n-1)*GAP+70;let die=0;P.pe=null;E=[];DT.push({x:P.x,y:200,s:'⚡ LÔI KIẾP GIÁNG XUỐNG ⚡',c:'#cfe0ff',g:1,l:110});rune(P.x,180,c,total);flash('#1a1a30',20);shake(5);
fx({x:P.x,l:total,fn:(o,p,x,gy)=>{const a=Math.min(1,p*10)*Math.min(1,(1-p)*10);g.save();g.globalAlpha=a*.4;g.fillStyle='#05050f';g.fillRect(0,0,W,gy+80);g.restore();CLD(W/2,gy*.1,W*1.0,'#14142a',a*.95);CLD(W/2,gy*.2,W*.8,'#2a2a4a',a*.8);CLD(W/2,gy*.3,W*.6,'#3a3a66',a*.5);if(fr%9<2){g.globalAlpha=a*.3;g.fillStyle='#cfe0ff';g.fillRect(0,0,W,gy*.28)}}});
for(let i=0;i<n;i++){const last=i==n-1;later(T0+i*GAP,()=>{if(die)return;rg(P.x,last?110:70,'#ff6060',16);fx({t:'pillar',x:P.x,w:last?70:40,c:'#ff9090',l:14});later(18,()=>{if(die)return;bolt(P.x-20+R()*40);if(last)bolt(P.x);flash('#fff',last?24:8);shake(last?13:8);bst(P.x,60,last?36:18,c,8,22,4,{k:'s'});rg(P.x,last?300:150,c,18);if(ZC.dg()>0&&R()<ZC.dg()+.25){DT.push({x:P.x,y:100,s:'Né',c:'#7fe0ff',l:40});return}const q=Math.max(1,Math.round(mx()*pct*(last?2:1)*(1-Math.min(.5,SX('dred')/100))*ZC.shd()*ZC.tdm()));P.hp-=q;DT.push({x:P.x,y:100,s:q,r:1,l:45});dgFl=7;if(P.hp<=0){P.hp=1;die=1;DT.push({x:P.x,y:150,s:'Không chịu nổi lôi kiếp!',c:'#ff8080',g:1,l:80})}})})}
later(total,()=>{done(!die)})};


/* ===== HÀNH ĐỘNG CẬN CHIẾN: lướt đến mục tiêu / nhảy lên trời lao xuống ===== */
const ACT=(()=>{
 const gw=()=>W/s-40;
 const ghost=c=>fx({x:P.x,l:12,c,x0:P.x,dd:P.d,jy0:P.jy||0,jr0:P.jr||0,fn:(o,p)=>{const ox=P.x,od=P.d,oj=P.jy,orr=P.jr;P.x=o.x0;P.d=o.dd;P.jy=o.jy0;P.jr=o.jr0;g.save();g.globalAlpha=(1-p)*.4;g.shadowColor=o.c;g.shadowBlur=14;try{hero()}finally{g.restore();P.x=ox;P.d=od;P.jy=oj;P.jr=orr}}});
 function dash(tx,n,c,done,pass){const d=Math.sign(tx-P.x)||P.d;P.d=d;P.act={k:'dash',t:0,n:Math.max(4,n|0),x0:P.x,x1:cl(tx,40,gw()),c,done,sk:SKF,pass:pass||null};
  for(let i=0;i<10;i++)fp(P.x-d*R()*20,6,{c:'#c9a878',r:5+R()*5,l:22,vx:-d*(2+R()*3),vy:1+R()*2,g:.04,f:.95});rg(P.x,70,c,14)}
 function hold(n,done){P.act={k:'hold',t:0,n,done,sk:SKF}}
 function slam(lx,o){const d=Math.sign(lx-P.x)||P.d;P.d=d;P.act={k:'jump',t:0,x0:P.x,x1:cl(lx,40,gw()),H:o.H||190,n1:o.n1||18,hold:o.hold==null?4:o.hold,n2:o.n2||6,c:o.c,done:o.done,sk:SKF};
  rg(P.x,110,o.c,16);for(let i=0;i<16;i++)fp(P.x+(R()-.5)*50,4,{c:R()<.5?'#a07850':'#d8c090',r:4+R()*5,l:26,vx:(R()-.5)*4,vy:1+R()*3,g:.12,f:.96});shake(3)}
 function tick(){const a=P.act;if(!a)return;const o=SKF;SKF=a.sk;try{a.t++;
  if(a.k=='dash'){const u=Math.min(1,a.t/a.n),e=1-Math.pow(1-u,3);P.x=a.x0+(a.x1-a.x0)*e;P.mv=1;
   if(a.t%2==1){ghost(a.c);for(let i=0;i<3;i++)fp(P.x-P.d*10,10+R()*50,{k:'s',c:'#fff3c0',vx:-P.d*(5+R()*4),l:10,r:3,f:.9})}
   if(a.pass)a.pass.forEach(q=>{if(!q.h&&(P.x-q.e.x)*P.d>=-18){q.h=1;if(q.e.hp>0&&E.includes(q.e)){dm(q.e,q.m);fx({t:'claw',x:q.e.x,c:a.c,l:14});bst(q.e.x,50,10,'#fff',6,14,3,{k:'s'})}}});
   if(u>=1){P.act=null;const f=a.done;if(f)f()}}
  else if(a.k=='hold'){if(a.t>=a.n){P.act=null;const f=a.done;if(f)f()}}
  else if(a.k=='jump'){const T1=a.n1,T2=T1+a.hold,T3=T2+a.n2,gu=Math.min(1,a.t/T3);P.x=a.x0+(a.x1-a.x0)*gu*gu*(3-2*gu);
   if(a.t<=T1){const u=a.t/T1;P.jy=a.H*(1-(1-u)*(1-u));P.jr=-.28*u}
   else if(a.t<=T2){P.jy=a.H+Math.sin((a.t-T1)*1.3)*3;P.jr=-.12}
   else{const u=Math.min(1,(a.t-T2)/a.n2);if(a.t==T2+1)an(a.n2+4);P.jy=a.H*(1-u*u);P.jr=-.12+1.1*Math.min(1,u*2.2);ghost(a.c)}
   if(a.t>=T3){P.jy=0;P.jr=0;P.act=null;const f=a.done;if(f)f()}}
 }finally{SKF=o}}
 function quakeHit(lx,rad,m,c){fx({t:'crack',x:lx,seg:mkcrack(rad),l:42});
  for(let i=0;i<28;i++)fp(lx+(R()-.5)*rad*1.5,4,{k:'d',c:R()<.5?'#a07850':'#ffb060',r:4+R()*4,l:36,vy:3+R()*6,vx:(R()-.5)*4,g:.3,f:.99});
  rg(lx,rad,'#c8a070',26);rg(lx,rad*.55,'#fff3c0',18);fx({t:'pillar',x:lx,w:80,c,l:16});flash(c,10);shake(13);
  E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-lx)<rad){dm(e,m*(Math.abs(e.x-lx)<110?1.35:1),1);fx({t:'pillar',x:e.x,w:36,c:'#ffb060',l:16});bst(e.x,40,8,'#ffcf90',5,16,3,{k:'s'})}})}
 function skill(k){const t=k[4],o=k[7]||{},c=CHR[cur].c,m=k[5];
  if(t==13){const e=near(o.r||DASHR);if(!e)return;const sd=Math.sign(e.x-P.x)||P.d,dist=Math.abs(e.x-P.x),tx=dist<54?P.x:e.x-sd*50;
   dash(tx,Math.round(dist/38),c,()=>{if(E.includes(e)&&e.hp>0)dm(e,m);E.forEach(q=>{if(q!==e&&q.in<=0&&Math.abs(q.x-e.x)<150)dm(q,m*.5)});const d=P.d;
    fx({t:'beam',x:P.x+d*10,x2:e.x+d*40,y:48,w:30,c,l:14});fx({t:'beam',x:P.x+d*10,x2:e.x+d*40,y:48,w:9,c:'#fff',l:12});bst(e.x,48,16,'#fff',7,14,3,{k:'s'});rg(e.x,110,c,18);shake(5)})}
  else if(t==14){const r=k[6]||250,h=o.h||3;for(let j=0;j<h;j++)later(j*8,()=>{E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<r)dm(e,m)});fx({t:'whirl',r:110,c,l:16});rg(P.x,r,c,14);for(let i=0;i<8;i++){const a=R()*TAU;fp(P.x,50,{k:'s',c:'#fff',vx:Math.cos(a)*8,vy:Math.sin(a)*8,l:12,r:3,f:.92})}if(j==h-1)shake(4)})}
  else if(t==18){const d=P.d,r=o.r||230,px=P.x;fx({t:'beam',x:px+d*20,x2:px+d*r,y:48,w:28,c,l:14});fx({t:'beam',x:px+d*20,x2:px+d*r,y:48,w:8,c:'#fff',l:12});
   E.forEach(e=>{if(e.in<=0&&(e.x-px)*d>-30&&Math.abs(e.x-px)<r+24){dm(e,m);bst(e.x,48,14,c,6,14,3,{k:'s'})}});rg(px+d*r*.55,90,c,14);shake(3)}
  else if(t==16){const e=near(MR+60),lx=e?e.x-(Math.sign(e.x-P.x)||P.d)*40:P.x+P.d*50;slam(lx,{H:o.H||190,c,done:()=>quakeHit(P.x,k[6]||330,m,c)})}
  else if(t==17){const e=near(o.r||DASHR);if(!e)return;const sd=Math.sign(e.x-P.x)||P.d,dist=Math.abs(e.x-P.x),tx=dist<54?P.x:e.x-sd*50,rad=k[6]||560;
   dash(tx,Math.round(dist/38),c,()=>{const d=P.d;
    hold(30,()=>{const bx=P.x;fx({t:'dragon',x:bx,d:1,l:46,rch:rad});fx({t:'dragon',x:bx,d:-1,l:46,rch:rad});rg(bx,rad,c,30);rg(bx,rad*.6,'#fff3c0',22);rune(bx,150,c,40);flash('#ffb040',40);shake(12);
     E.forEach(q=>{if(q.in<=0&&Math.abs(q.x-bx)<rad){dm(q,m*.85);bst(q.x,50,16,'#ffb040',7,20,4)}})});
    for(let j=0;j<4;j++)later(j*5,()=>{if(E.includes(e)&&e.hp>0)dm(e,m*.1);const y=36+j*8;fx({t:'beam',x:P.x+d*14,x2:e.x+d*30,y,w:16,c,l:9});bst(e.x,y+8,8,'#ffd070',6,12,3,{k:'s'});shake(2)})})}
 }
 /* kỹ năng tu luyện của Thương Thủ: toàn bộ thành cận chiến */
 ZFC.w1[0]=(f,c)=>{const d=P.d,px=P.x,L=E.filter(e=>e.in<=0&&(e.x-px)*d>-30&&Math.abs(e.x-px)<440).sort((a,b)=>Math.abs(a.x-px)-Math.abs(b.x-px));
  const far=L.length?Math.abs(L[L.length-1].x-px)+80:230,x1=px+d*Math.min(far,440);
  fx({t:'beam',x:px+d*20,x2:x1,y:50,w:34,c,l:18});fx({t:'beam',x:px+d*20,x2:x1,y:50,w:10,c:'#fff',l:14});
  dash(x1,Math.max(6,Math.round(Math.abs(x1-px)/34)),c,()=>{rg(P.x,120,c,20);flash(c,8);shake(5)},L.map(e=>({e,m:3.4*f,h:0})))};
 ZFC.w1[2]=(f,c)=>{const px=P.x;rune(px,170,c,56);later(8,()=>{fx({t:'crack',x:px,seg:mkcrack(440),l:44});rg(px,160,c,16);later(5,()=>rg(px,300,c,18));later(10,()=>rg(px,440,c,22));shake(9);flash(c,10);
  E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-px)<440){later(Math.round(Math.abs(e.x-px)/440*14),()=>{if(e.hp>0)dm(e,6*f,1);fx({t:'spike',x:e.x,l:34});fx({t:'pillar',x:e.x,w:50,c,l:24});bst(e.x,40,12,c,6,18,4)})}})})};
 ZFC.w1[3]=(f,c)=>{const px=P.x,L=E.filter(e=>e.in<=0&&Math.abs(e.x-px)<540).sort((a,b)=>Math.abs(a.x-px)-Math.abs(b.x-px)).slice(0,8);if(!L.length)return;const gap=6;rune(px,100,c,40);hold(8+L.length*gap+8);
  L.forEach((e,i)=>later(6+i*gap,()=>{if(!E.includes(e)||e.hp<=0)return;const sd=Math.sign(e.x-P.x)||P.d,ox=P.x,nx=cl(e.x-sd*46,40,gw());ghost(c);P.d=sd;P.x=nx;fx({t:'beam',x:ox,x2:nx,y:50,w:22,c,l:10});dm(e,4.5*f);later(3,()=>{if(E.includes(e)&&e.hp>0)dm(e,4.5*f)});fx({t:'claw',x:e.x,c,l:14});bst(e.x,50,12,c,6,18,4);an(8)}));flash(c,12)};
 ZFC.w1[4]=(f,c)=>{const e=near(MR+60),lx=e?e.x-(Math.sign(e.x-P.x)||P.d)*30:P.x;rune(P.x,160,c,60);flash(c,14);
  slam(lx,{H:300,n1:24,hold:8,n2:6,c,done:()=>{const bx=P.x;rune(bx,220,c,70);rg(bx,520,c,40);rg(bx,300,'#fff',22);rg(bx,160,c,18);flash(c,50);shake(15);fx({t:'pillar',x:bx,w:120,c,l:26});
   E.forEach(q=>{if(q.in>0)return;later(Math.round(Math.abs(q.x-bx)/vw()*10),()=>{bolt(q.x);fx({t:'pillar',x:q.x,w:90,c,l:30});if(q.hp>0)dm(q,16*f);bst(q.x,50,22,c,8,24,5,{g:.1});rg(q.x,120,c,20)})})}})};
 window.PFX={spawn(k,x){const c={wolf:'#9fe0ff',golem:'#ffd070',tree:'#7fe85a'}[k]||'#fff';sigil(x,c,90,34,'#fff');gwave(x,c,120,26);for(let i=0;i<14;i++)fp(x+(R()-.5)*60,6,{c,r:3+R()*3,l:34,vy:1.5+R()*2.5,vx:(R()-.5)*1.5,g:-.02,f:.97})},
dash(x0,x1){fx({t:'mv',k:'wolf',x0,y0:34,x1,y1:34,l:14,c:'#9fe0ff'});shTrail(x0,x1,'#9fe0ff',16,8)},
bite(x){slashXX(x,40,'#fff',46,10)},
slam(x,r,big){gwave(x,'#e0b070',r,big?36:22);if(big){gwave(x,'#fff3c0',r*.6,26);fx({t:'crack',x,seg:mkcrack(r*.8),l:36})}for(let i=0;i<(big?18:8);i++)later(i%6,()=>fp(x+(R()-.5)*r*.7,4,{c:i%2?'#a07040':'#e0b070',r:4+R()*6,l:42,vx:(R()-.5)*3.5,vy:3+R()*5,g:.25,f:.97}));shake(big?8:3)},
bloom(x){gwave(x,'#8fffb0',220,32);vcol(x,'rgba(143,255,176,.8)',56,34);soulSpiral(x,'#c8ffd8',36,150,8)},
vine(x){vcol(x,'rgba(100,190,70,.85)',34,26);for(let i=0;i<7;i++)fp(x+(R()-.5)*40,4,{c:'#7fe85a',r:3+R()*3,l:26,vy:2+R()*3,vx:(R()-.5)*2,g:.15,f:.96})}};
return{skill,tick}})();

/* ===== NÂNG CẤP HIỆU ỨNG: TRIỆU HỒI SƯ & THÍCH KHÁCH ===== */
const SXc=x=>(x-cam)*s;
const wisp=(x0,y0,x1,y1,c,l,arc,sz)=>fx({x:x0,l,fn:(f,p)=>{const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,gy=GY,Z=sz||13,bz=u=>[SXc(x0+(x1-x0)*u),gy-(y0+(y1-y0)*u+Math.sin(u*PI)*arc)*s];for(let i=0;i<9;i++){const q=bz(Math.max(0,e-i*.045));glowDraw(q[0],q[1],(Z-i*1.1)*s,c,.8-i*.08)}const h=bz(e);glowDraw(h[0],h[1],Z*.55*s,'#fff',.95)}});
const sigil=(x,c,Rr,l,c2)=>fx({x,l,fn:(f,p,X,gy)=>{const a=p<.15?p/.15:p>.7?(1-p)/.3:1,r=Rr*s*Math.min(1,.4+p*2.2);g.save();g.translate(X,gy-3*s);g.scale(1,.27);g.lineCap='round';g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=16;g.globalAlpha=a*.9;g.lineWidth=3*s;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.lineWidth=1.6*s;g.globalAlpha=a*.6;g.beginPath();g.arc(0,0,r*.78,0,TAU);g.stroke();g.save();g.rotate(p*3.2);g.globalAlpha=a*.85;g.lineWidth=2.2*s;star(5,r*.78,r*.3,-1.5708);g.stroke();g.restore();g.save();g.rotate(-p*2.4);g.globalAlpha=a*.7;g.strokeStyle=c2||'#fff';g.lineWidth=1.6*s;star(6,r*.62,r*.36,0);g.stroke();g.restore();for(let i=0;i<12;i++){const t=i*TAU/12+p*1.2;g.globalAlpha=a*.8;g.beginPath();g.arc(Math.cos(t)*r*.9,Math.sin(t)*r*.9,2.2*s,0,TAU);g.stroke()}g.globalAlpha=a*.16;g.fillStyle=c;g.beginPath();g.arc(0,0,r*.78,0,TAU);g.fill();g.restore()}});
const soulSpiral=(x,c,l,H,n)=>fx({x,l,fn:(f,p,X,gy)=>{const a=p<.12?p/.12:p>.75?(1-p)/.25:1,N=n||7;for(let i=0;i<N;i++){const ph=(p*1.3+i/N)%1,ang=ph*9+i*2.1,r=(34-ph*14)*s*(.6+.4*Math.sin(i)),x2=X+Math.cos(ang)*r,y2=gy-(4+ph*(H||160))*s+Math.sin(ang)*r*.25;glowDraw(x2,y2,(9-ph*4)*s,c,a*(1-ph)*.9);glowDraw(x2,y2,3.2*s,'#fff',a*(1-ph))}}});
const slashX=(x,y,c,len,ang,l)=>fx({x,l:l||12,fn:(f,p,X,gy)=>{const u=Math.min(1,p*2.2),a=1-p,L=len*s;g.save();g.translate(X,gy-y*s);g.rotate(ang);g.lineCap='round';g.shadowColor=c;g.shadowBlur=18;const q=g.createLinearGradient(-L,0,L,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,c);q.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=q;g.globalAlpha=a;g.lineWidth=(9-6*p)*s;g.beginPath();g.moveTo(-L*u,0);g.lineTo(L*u,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=(2.6-1.6*p)*s;g.beginPath();g.moveTo(-L*u*.9,0);g.lineTo(L*u*.9,0);g.stroke();g.restore()}});
const slashXX=(x,y,c,len,l)=>{slashX(x,y,c,len,-.62,l);slashX(x,y,'#fff',len*.9,.62,l)};
const shTrail=(x0,x1,c,l,n)=>fx({x:x0,l,fn:(f,p,X,gy)=>{const N=n||7;for(let i=0;i<N;i++){const u=i/(N-1),px=SXc(x0+(x1-x0)*u),a=Math.max(0,.55*(1-Math.abs(p*1.4-u)*2.4));if(a<=0)continue;g.globalCompositeOperation='source-over';g.globalAlpha=a;g.fillStyle='rgba(30,10,50,.9)';g.beginPath();g.ellipse(px,gy-34*s,9*s,26*s,0,0,TAU);g.fill();g.beginPath();g.arc(px,gy-66*s,8*s,0,TAU);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.strokeStyle=c;g.lineWidth=1.6*s;g.beginPath();g.ellipse(px,gy-34*s,9*s,26*s,0,0,TAU);g.stroke();g.beginPath();g.arc(px,gy-66*s,8*s,0,TAU);g.stroke()}}});
const bladeRing=(x,c,Rr,l)=>fx({x,l,fn:(f,p,X,gy)=>{const a=1-p*p,r=Rr*s*Math.sin(Math.min(1,p*1.3)*1.57);for(let i=0;i<14;i++){const t=i*TAU/14+p*9,qx=X+Math.cos(t)*r,qy=gy-(46+Math.sin(t*2)*10)*s+Math.sin(t)*r*.18;g.save();g.translate(qx,qy);g.rotate(t+1.57+p*14);g.globalAlpha=a;g.fillStyle=i%2?'#fff':c;g.shadowColor=c;g.shadowBlur=10;g.beginPath();g.moveTo(0,-10*s);g.lineTo(3.4*s,2*s);g.lineTo(0,5*s);g.lineTo(-3.4*s,2*s);g.closePath();g.fill();g.restore()}}});
const moonSlash=(x,y,c,Rr,l,dir)=>fx({x,l,fn:(f,p,X,gy)=>{const a=p<.15?p/.15:1-(p-.15)/.85,r=Rr*s*(.5+.6*Math.sin(Math.min(1,p*1.4)*1.57));g.save();g.translate(X,gy-y*s);g.scale(dir||1,1);g.rotate(-.6+p*1.2);g.shadowColor=c;g.shadowBlur=24;g.globalAlpha=a;g.fillStyle=c;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*1.25,0,0,r);g.quadraticCurveTo(r*.45,0,0,-r);g.closePath();g.fill();g.strokeStyle='#fff';g.lineWidth=2*s;g.globalAlpha=a*.9;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*1.25,0,0,r);g.stroke();g.restore()}});
const dim=(c,l,a0)=>fx({x:P.x,l,fn:(f,p)=>{const a=(p<.2?p/.2:1-(p-.2)/.8)*(a0||.45);g.globalCompositeOperation='source-over';g.globalAlpha=a;g.fillStyle=c;g.fillRect(0,0,W,H)}});
/* Triệu Hồi Sư */
BS('Linh Hồn Cầu',({d,px})=>{soulSpiral(px+d*30,'#8fffb0',22,90,5);flare(px+d*36,62,'#8fffb0',80,16);bst(px+d*44,60,10,'#d8fff4',5,16,3,{k:'s'})});
BS('Hấp Hồn Ấn',({px,rr})=>{sigil(px,'#8fffb0',rr,34,'#d8fff4');soulSpiral(px,'#bfffe8',40,170,9);E.forEach((e,i)=>{if(Math.abs(e.x-px)<rr)later(i*2,()=>wisp(e.x,50,px,70,'#8fffb0',18,40,10))})});
BS('Triệu Linh Lang',({px})=>{sigil(px-40,'#9fe0ff',110,34,'#fff');soulSpiral(px-40,'#9fe0ff',34,150,8);wisp(px-40,150,px-40,40,'#d8f6ff',16,0,16)});
BS('Triệu Cự Thạch',({px})=>{sigil(px-40,'#e0b070',130,38,'#fff3c0');fx({t:'crack',x:px-40,seg:mkcrack(160),l:36});for(let i=0;i<16;i++)later(i%8,()=>fp(px-40+(R()-.5)*100,4,{c:i%2?'#a07040':'#e0b070',r:4+R()*6,l:40,vx:(R()-.5)*3,vy:3+R()*5,g:.25,f:.97}))});
BS('Triệu Mộc Linh',({px})=>{sigil(px,'#8fffb0',90,36,'#fff');soulSpiral(px,'#c8ffd8',36,150,8)});
BS('Vạn Linh Giáng Thế',({px})=>{sigil(px,'#bfffe8',300,48,'#fff');later(8,()=>sigil(px,'#8fffb0',200,40));dim('#001a14',50,.4);tgts(14).forEach((x,i)=>later(6+i*2,()=>wisp(x+(R()-.5)*80,330,x,36,'#d8fff4',18,0,14)));for(let i=0;i<5;i++)later(i*5,()=>soulSpiral(px+(i-2)*60,'#bfffe8',36,200,6))});
/* Thích Khách */
BS('Ảnh Kích',({e,px,d})=>{const x=e?e.x:px+d*70;shTrail(px,x,'#e060a0',14,5);slashXX(x,50,'#ff6080',46,12)});
BS('Ám Sát Liên Hoàn',({e,px,d})=>{const x=e?e.x:px+d*70;shTrail(px,x,'#d060ff',16,6);for(let j=0;j<4;j++)later(j*4,()=>slashX(x+(R()-.5)*24,38+R()*26,j%2?'#fff':'#d060ff',58,(R()-.5)*3,12));later(14,()=>sigil(x,'#d060ff',90,20))});
BS('Phi Đao Toàn Phong',({px,rr})=>{bladeRing(px,'#e8f4ff',rr,30);later(5,()=>bladeRing(px,'#9fe0ff',rr*.65,24))});
BS('Ẩn Thân Bộ',({px})=>{sigil(px,'#6a4a9a',90,34,'#d9b0ff');shTrail(px-40,px+40,'#a070ff',30,6);soulSpiral(px,'#a070ff',34,120,8);dim('#10001c',34,.35)});
BS('Huyết Ảnh Trảm',({px,rr,d})=>{moonSlash(px+d*30,60,'#ff4060',rr*.5,24,d);E.forEach((e,i)=>{if(Math.abs(e.x-px)<rr)later(4+i*2,()=>{slashXX(e.x,50,'#ff4060',60,14);for(let j=0;j<8;j++)fp(e.x,50,{c:'#ff2040',r:2+R()*3,l:28,vx:(R()-.5)*7,vy:2+R()*5,g:.3,f:.97})})})});
BS('Vạn Ảnh Sát Vực',({px})=>{sigil(px,'#d060ff',320,50,'#ff4060');dim('#12001e',52,.55);shTrail(px-200,px+200,'#d060ff',34,9);E.forEach((e,i)=>{for(let j=0;j<3;j++)later(10+i*2+j*4,()=>slashX(e.x+(R()-.5)*24,34+R()*36,j==1?'#fff':j?'#ff4060':'#d060ff',70,(R()-.5)*3.1,14))})});
/* Kỹ năng tu tiên: Triệu Hồi (m0) */
wr('m0',0,(f,c)=>{const px=P.x;sigil(px,c,100,40,'#fff');E.filter(e=>e.in<=0&&Math.abs(e.x-px)<480).slice(0,5).forEach((e,i)=>later(4+i*3,()=>{wisp(px,110,e.x,40,'#d8fff4',16,70,14);later(16,()=>{fx({t:'skull',x:e.x,l:30});soulSpiral(e.x,c,24,110,6)})}))});
wr('m0',1,(f,c)=>{const px=P.x;sigil(px,c,110,50,'#fff');soulSpiral(px,c,50,190,10);wisp(px-40,200,px-40,40,'#d8f6ff',20,0,18)});
wr('m0',2,(f,c)=>{const px=P.x;sigil(px,'#8a40d0',440,60,'#d8b0ff');later(6,()=>sigil(px,c,300,50));dim('#0e0018',60,.45);E.forEach((e,i)=>{if(e.in<=0&&Math.abs(e.x-px)<440)later(12+i*2,()=>{soulSpiral(e.x,'#b070ff',40,160,8);vcol(e.x,'rgba(138,64,208,.8)',40,26)})})});
wr('m0',3,(f,c)=>{const px=P.x,dr=P.d;dim('#0a0014',50,.4);for(let i=0;i<24;i++)later(8+i,()=>{const y=30+R()*110;wisp(px-dr*(80+R()*60),y+60,px+dr*(120+R()*520),y,i%3?'#b070ff':'#d8fff4',22,30+R()*40,12)});E.filter(e=>e.in<=0).slice(0,8).forEach((e,i)=>later(16+i*3,()=>{fx({t:'skull',x:e.x,l:36});slashXX(e.x,50,'#b070ff',56,14)}))});
wr('m0',4,(f,c)=>{const px=P.x;sigil(px,c,520,70,'#fff');later(6,()=>sigil(px,'#bfffe8',360,60));dim('#00140e',64,.5);for(let i=0;i<30;i++)later(8+i,()=>{const x=px+(R()*2-1)*vw()*.6;wisp(x,340,x+(R()-.5)*60,30,i%2?'#d8fff4':c,18,0,15)});for(let i=0;i<5;i++)later(i*6,()=>vcol(px+(i-2)*90,'rgba(191,255,232,.8)',50,40))});
/* Kỹ năng tu tiên: Thích Khách (a1) */
wr('a1',0,(f,c)=>{const d=P.d,px=P.x;shTrail(px,px+d*vw()*.7,c,22,10);E.forEach(e=>{if(e.in<=0&&(e.x-px)*d>-40&&Math.abs(e.x-px)<vw()*.7)later(Math.round(Math.abs(e.x-px)/vw()*14),()=>slashXX(e.x,50,c,64,14))})});
wr('a1',1,(f,c)=>{const px=P.x;sigil(px,c,100,50,'#d9b0ff');shTrail(px-60,px+60,c,40,7);soulSpiral(px,'#a070ff',50,140,10);dim('#10001c',46,.35)});
wr('a1',2,(f,c)=>{const px=P.x;dim('#06000c',48,.5);moonSlash(px+P.d*80,90,c,200,34,P.d);later(5,()=>moonSlash(px-P.d*60,70,'#fff',160,28,-P.d));E.forEach((e,i)=>{if(e.in<=0&&Math.abs(e.x-px)<430)later(8+i*2,()=>slashXX(e.x,50,c,60,14))});sigil(px,c,430,44,'#fff')});
wr('a1',3,(f,c)=>{E.filter(e=>e.in<=0).slice(0,8).forEach((e,i)=>later(10+i*3,()=>{shTrail(e.x-70,e.x+70,'#d060ff',16,5);slashXX(e.x,50,c,60,14)}));sigil(P.x,'#d060ff',160,40,c)});
wr('a1',4,(f,c)=>{const px=P.x;dim('#0c0014',60,.6);sigil(px,c,520,64,'#ff4060');for(let i=0;i<26;i++)later(6+i,()=>{const x=px+(R()*2-1)*vw()*.6;slashX(x,30+R()*90,i%3?'#d060ff':'#fff',90,(R()-.5)*3.1,14)});E.forEach((e,i)=>{if(e.in<=0)later(14+i*3,()=>{slashXX(e.x,50,'#ff4060',90,16);fx({t:'skull',x:e.x,l:40})})})});

/* ---- Thú nuôi Rồng: long tức & hiệu ứng theo 4 cấp ---- */
const DCL=[['#bfe3ff','#f2fbff'],['#ff5a3a','#ffd070'],['#4fe0e8','#ffd870'],['#8a96ff','#e8dcff']];
const drMouth=ev=>{const M=DRG[ev],W2=DRH[ev]*M.w/M.h,o=(M.face>0?M.mx-.5:.5-M.mx)*W2;return{x:EP.x+(EP.d||1)*o,y:(EP.y||0)+(1-M.my)*DRH[ev]}};
const drShoot=(x0,x1,y0,ev)=>{const[c1,c2]=DCL[ev];
 fx({x:x0,l:16,fn:(f,p,X,gy)=>{const u=Math.min(1,p*1.15),pos=v=>[(x0+(x1-x0)*v-cam)*s,gy-(y0+(52-y0)*v+Math.sin(v*12+ev)*2.5*(1-v))*s];
  for(let i=0;i<10;i++){const q=pos(Math.max(0,u-i*.04));glowDraw(q[0],q[1],(11-i*.8+ev*.7)*s,i%2?c2:c1,.8-i*.07)}
  const h=pos(u);glowDraw(h[0],h[1],15*s,'#fff',.85);
  g.save();g.translate(h[0],h[1]);g.rotate(p*9);g.fillStyle=c2;g.shadowColor=c1;g.shadowBlur=10;
  if(ev==0)star(6,9*s,3.6*s,0);else if(ev==1)star(3,10*s,4*s,-1.57);else if(ev==2)star(8,10*s,2.6*s,0);else star(4,11*s,2.4*s,0);
  g.fill();g.restore()}});
 for(let i=0;i<8;i++)later(i*2,()=>{const v=i/8;fp(x0+(x1-x0)*v*.8,y0+(52-y0)*v*.8,{c:i%2?c1:c2,r:2.6+R()*2,l:22,vy:ev==1?.9:.2,vx:(R()-.5)*.8,f:.93,k:'s'})})};
const drHit=(ev,x)=>{const[c1,c2]=DCL[ev];flare(x,52,c1,95+ev*18,16);
 if(ev==0){bst(x,52,16,'#e8f6ff',6,22,3,{k:'s',g:.05});rg(x,70,c1,16)}
 else if(ev==1){bst(x,40,16,'#ffb060',5,24,4,{f:.94});for(let i=0;i<6;i++)fp(x+(R()-.5)*26,10+R()*20,{c:i%2?c1:c2,r:5+R()*4,l:26,vy:1.2+R(),f:.97,sh:1})}
 else if(ev==2){bolt(x);rg(x,80,c1,18);bst(x,50,12,'#fff3b0',7,16,3,{k:'s'})}
 else{bst(x,56,18,c2,7,24,3,{k:'s'});rg(x,90,c1,20)}
 const e=E.find(q=>Math.abs(q.x-x)<26&&q.in<=0);if(e&&window.ST&&R()<[.2,.35,.18,.25][ev])ST.apply(e,['frz','brn','stn','frz'][ev])};
const drSkill=(ev,x,M)=>{const[c1,c2]=DCL[ev],d=EP.d||1,r=[230,250,270,300][ev],mo=drMouth(ev),L=r+120;
 const tg=E.filter(e=>e.in<=0&&(e.x-x)*d>-30&&Math.abs(e.x-x)<L+60);
 fx({x:mo.x,l:16,fn:(f,p,X,gy)=>{glowDraw(X,gy-mo.y*s,(30-p*18)*s,c1,.9*(1-p));glowDraw(X,gy-mo.y*s,12*s,'#fff',.9*(1-p))}});
 fx({x:mo.x,l:36,fn:(f,p,X,gy)=>{const a=p<.15?p/.15:p>.7?(1-p)/.3:1,N=56,len=L*Math.min(1,p*3.2)*s,Y0=gy-mo.y*s;
  const bm=g.createLinearGradient(X,0,X+d*len,0);bm.addColorStop(0,RGBA(c2,.55*a));bm.addColorStop(1,RGBA(c1,0));
  g.save();g.strokeStyle=bm;g.lineCap='round';g.lineWidth=(10+ev*3)*s;g.beginPath();g.moveTo(X,Y0);g.lineTo(X+d*len,gy-52*s);g.stroke();g.restore();
  for(let i=0;i<N;i++){const u=((p*1.8+i/N)%1),sd=Math.sin(i*12.9898)*43758.5453,rn=sd-Math.floor(sd),lat=(rn-.5)*2*u*(46+ev*8)*s,xx=X+d*u*len,yy=Y0+(gy-52*s-Y0)*u+lat,al=a*(1-u*.5);
   if(ev==0){glowDraw(xx,yy,(6+u*14)*s,c1,.34*al);if(i%3==0){g.save();g.translate(xx,yy);g.rotate(i+p*6);g.fillStyle=c2;star(6,4.4*s,1.7*s,0);g.fill();g.restore()}}
   else if(ev==1){glowDraw(xx,yy-u*10*s,(7+u*16)*s,i%2?c1:c2,.42*al);if(i%4==0)glowDraw(xx,yy-u*30*s,3*s,'#fff',.7*al)}
   else if(ev==2){glowDraw(xx,yy,(5+u*12)*s,i%2?c1:c2,.38*al)}
   else{glowDraw(xx,yy,(5+u*13)*s,i%2?c1:'#5a64ff',.34*al);if(i%3==0){g.save();g.translate(xx,yy);g.rotate(p*3+i);g.globalAlpha=.4+.6*Math.abs(Math.sin(p*8+i));g.fillStyle=c2;star(4,6*s,1.4*s,0);g.fill();g.restore()}}}
  if(ev==2){g.save();g.strokeStyle=c2;g.shadowColor=c1;g.shadowBlur=10;g.lineWidth=2*s;g.globalAlpha=a;const sd=Math.floor(p*14);for(let b=0;b<2;b++){g.beginPath();g.moveTo(X,Y0);for(let j=1;j<=9;j++){const q=Math.sin((sd+b*7+j)*91.7)*43758.5,rr=q-Math.floor(q);g.lineTo(X+d*len*j/9,Y0+(gy-52*s-Y0)*j/9+(rr-.5)*34*s*(j<9?1:0))}g.stroke()}g.restore()}
 }});
 tg.forEach((e,i)=>later(6+Math.round(Math.abs(e.x-x)/L*10),()=>{if(!E.includes(e))return;dm(e,M*PSK[2].m,1);drHit(ev,e.x);
  if(ev==0){gwave(e.x,c1,100,26);vcol(e.x,'rgba(191,227,255,.75)',44,22)}
  else if(ev==1){gwave(e.x,c1,110,26);vcol(e.x,'rgba(255,110,50,.85)',54,30)}
  else if(ev==2){gwave(e.x,c1,120,28);bolt(e.x)}
  else gwave(e.x,c1,130,30);
  if(window.ST&&R()<[.5,1,.45,.4][ev])ST.apply(e,['frz','brn','stn','frz'][ev])}));
 if(ev==3&&tg.length){const xs=tg.slice(0,5).map(e=>e.x);
  fx({x:xs[0],l:50,fn:(f,p,X,gy)=>{const a=p<.2?p/.2:p>.7?(1-p)/.3:1,pts=xs.map((q,i)=>[(q-cam)*s,gy-(90+Math.sin(i*2.7)*30)*s]);g.save();g.strokeStyle=c2;g.shadowColor=c1;g.shadowBlur=10;g.lineWidth=1.6*s;g.globalAlpha=a*.8;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();g.restore();pts.forEach((q,i)=>{glowDraw(q[0],q[1],(12+Math.sin(p*14+i)*4)*s,c2,.8*a);g.save();g.translate(q[0],q[1]);g.rotate(p*2+i);g.fillStyle='#fff';g.globalAlpha=a;star(4,8*s,1.8*s,0);g.fill();g.restore()})}});
  rain(xs.map(q=>q+(R()-.5)*30),'meteor',c1,3,12,1);
  xs.forEach((q,i)=>later(14+i*3,()=>{const e=E.find(z=>Math.abs(z.x-q)<40);if(e)dm(e,M*PSK[2].m*.6,1)}))}
 flash(c1,ev==1?10:7);shake(3+ev)};
const _pfS=PF.shoot,_pfH=PF.hit,_pfK=PF.skill;
PF.shoot=(k,x0,x1,y0)=>{if(k!=2)return _pfS(k,x0,x1,y0);const ev=pet()?pet().ev:0,m=drMouth(ev);drShoot(m.x,x1,m.y,ev)};
PF.hit=(k,ev,x,y)=>{if(k!=2)return _pfH(k,ev,x,y);drHit(ev,x)};
PF.skill=(k,ev,x,M,p)=>{if(k!=2)return _pfK(k,ev,x,M,p);drSkill(ev,x,M)};
const _sfxST=sfx;sfx=function(k,T,c){window.STLAST=[k[0],fr];return _sfxST(k,T,c)};
return{trib,act:ACT,pf:PF,zf:(i,c,f)=>{window.STLAST=[(window.__ZK_NAMES&&window.__ZK_NAMES[i])||"",fr];return(ZFC[ZK()]||ZF)[i](f,c)},later,cult,step,fxs,pjs,hit,sfx,sh:()=>{if(SHK>.3){g.translate((R()-.5)*SHK,(R()-.5)*SHK);SHK*=.86}else SHK=0}}})();
const ZC=(()=>{
const RN=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'],RCL=['#c8c8c8','#9fe0ff','#ffd76a','#ffb040','#c090ff','#ff7ad9','#5ff0d8','#ff6a5a','#fff2a8'],REQ=[5,20,40,60,80],COST=[100,1000,8000,50000,300000,800000,2500000,8000000],RATE=[100,80,65,50,35,30,25,20],TAU=Math.PI*2;
const V=()=>PS[cur].cv||(PS[cur].cv={r:-1,s:0,q:0,f:0});
const n=()=>{const c=V();return c.r<0?0:c.r*9+c.s},need=()=>{const q=n();return Math.round(q<=45?40*Math.pow(1.17,q):40*Math.pow(1.17,45)*Math.pow(1.05,q-45))},maxed=()=>{const c=V();return c.r==7&&c.s==9},ready=()=>{const c=V();return !maxed()&&(c.r<0||c.s==9)&&c.q>=need()};
const nm=()=>{const c=V();return c.r<0?'Sơ Khai':RN[c.r+1]+' tầng '+c.s},rn=()=>{const c=V();return c.r<0?'Sơ Khai':RN[c.r+1]};
const ZKA={w1:[['Long Đảm Xuyên Vân','🔱',12,170,'Luyện Khí','lướt xuyên qua mọi địch phía trước ×3,4'],['Bất Động Thương Trận','🛡️',18,420,'Trúc Cơ','hồi 28% HP, 35% MP, giảm 50% sát thương nhận 6 giây'],['Địa Long Phá Thương','💥',28,300,'Kim Đan','cắm thương, sóng đất trồi diện rộng ×6, làm chậm'],['Vạn Thương Triều Tông','🎯',38,600,'Nguyên Anh','lướt chớp qua tối đa 8 địch, 2 đòn ×4,5'],['Cửu Thiên Giáng Thương','⚡',55,1100,'Hoá Thần','nhảy vọt lên trời, thương lôi giáng xuống toàn màn hình ×16']],m0:[['Ngũ Quỷ Phệ Hồn','👻',12,170,'Luyện Khí','5 oan hồn truy sát, mỗi địch 2 đòn ×1,7'],['Linh Thể Hộ Chủ','🌿',18,420,'Trúc Cơ','hồi 28% HP, 35% MP, giảm 50% sát thương 5 giây, triệu thêm Linh Lang'],['Cửu U Minh Giới','🌑',28,300,'Kim Đan','minh giới diện rộng ×6, làm chậm'],['Vạn Quỷ Dạ Hành','☠️',38,600,'Nguyên Anh','bách quỷ đánh tối đa 8 địch, 2 đòn ×4,5'],['Chúng Sinh Triệu Thiên','🐉',55,1100,'Hoá Thần','đại triệu hồi toàn màn hình ×16, triệu Cự Thạch + Linh Lang']],a1:[['Ảnh Phân Thập Sát','🥷',12,170,'Luyện Khí','lướt qua chém mọi địch phía trước ×3,4'],['Ẩn Nặc Hóa Ảnh','👤',18,420,'Trúc Cơ','hồi 28% HP, 35% MP, +50% né 6 giây'],['Hắc Nguyệt Liên Trảm','🌑',28,300,'Kim Đan','trảm nguyệt diện rộng ×6, làm chậm'],['Phân Thân Vạn Ảnh','👥',38,600,'Nguyên Anh','phân thân tối đa 8 địch, 2 đòn ×4,5'],['Thiên Địa Vô Ảnh Sát','🗡️',55,1100,'Hoá Thần','ám sát toàn màn hình ×16']],w:[['Ngự Kiếm Trảm','🗡️',12,170,'Luyện Khí','kiếm khí hai phía ×3'],['Kim Cang Hộ Thể','🛡️',18,420,'Trúc Cơ','hồi 28% HP, 35% MP, giảm 50% sát thương nhận 5 giây'],['Phá Thiên Kiếm Vực','💥',28,300,'Kim Đan','kiếm vực diện rộng ×6, làm chậm'],['Vạn Kiếm Triều Tông','⚔️',38,600,'Nguyên Anh','mưa kiếm đánh tối đa 8 địch, 2 đòn ×4,5'],['Thiên Kiếm Trảm Địa','⚡',55,1100,'Hoá Thần','kiếm lôi toàn màn hình ×16']],m:[['Ngũ Hành Hỏa Ấn','🔥',12,170,'Luyện Khí','hỏa ấn diện rộng ×3,2'],['Linh Tuyền Quyết','🌿',18,420,'Trúc Cơ','hồi 28% HP, 35%+25% MP, giảm 50% sát thương 3 giây'],['Băng Phong Vạn Lý','❄️',28,300,'Kim Đan','bão tuyết ×6, làm chậm'],['Lôi Kiếp Thiên Phạt','🌩️',38,600,'Nguyên Anh','sét đánh tối đa 8 địch, 2 đòn ×4,5'],['Tinh Thần Diệt Thế','☄️',55,1100,'Hoá Thần','mưa sao băng toàn màn hình ×16']],a:[['Truy Hồn Tiễn','🏹',12,170,'Luyện Khí','mưa tên truy đuổi ×3'],['Phong Hành Điều Tức','🍃',18,420,'Trúc Cơ','hồi 28% HP, 35% MP, +50% né 5 giây'],['Vạn Tiễn Xuyên Tâm','🎯',28,300,'Kim Đan','tia xuyên thấu ×6, làm chậm'],['Phân Thân Huyễn Ảnh','👥',38,600,'Nguyên Anh','phân thân đánh tối đa 8 địch, 2 đòn ×4,5'],['Thiên Lang Phệ Nguyệt','🐺',55,1100,'Hoá Thần','sói thần càn quét ×16']]},ZKf=()=>ZKA[ZK()];window.__ZK_NAMES=ZKA[ZK()].map(x=>x[0]);cz=[0,0,0,0,0],zk=document.createElement('div');zk.id='zk';document.body.appendChild(zk);const zb=ZKf().map((k,i)=>{const b=document.createElement('div');b.className='sb zb';b.onpointerdown=e=>{e.stopPropagation();zcast(i)};zk.appendChild(b);return b});
const zf=()=>1+.015*n();
function refresh(){const c=V();zb.forEach((b,i)=>{const u=c.r>=i;b.innerHTML=u?ZKf()[i][1]+'<small>'+ZKf()[i][0].split(' ').slice(-2).join(' ')+'</small>':'🔒';b.style.opacity=u?1:.3;b.style.borderColor=u?RCL[i+1]:'#b8964e'})}
function zcast(i){const c=V();if(over||bo||vil||!started||c.r<i||cz[i]>0||P.mp<ZKf()[i][2]||P.pe||P.act)return;if(i!=1){const mr=TK()=='w'?(ZK()=='w1'&&i==0?DASHR:MR):700;if(!near(mr)){if(TK()=='w'&&!auto)needMsg();return}}P.mp-=ZKf()[i][2];cz[i]=ZKf()[i][3]*1.6;const D=Math.max(6,Math.round(DL[TK()]/(1+Math.min(1,SX('cspd')/100)))),f=zf(),col=RCL[i+1];an(D);P.ln=ZKf()[i][0];P.pe={l:D,f:()=>{SKF=1;try{ZS.zf(i,col,f)}finally{SKF=0}},t:i==4?5:1,n:ZKf()[i][0]}}
function cds(){zsh--;zdg--;for(let i=0;i<5;i++){cz[i]-=(1+al(2)*.01)/(1-Math.min(.4,SX('cdr')/100));zb[i].style.setProperty('--c',cl(cz[i]/(ZKf()[i][3]*1.6),0,1)*360+'deg')}if(fr%30==0)refresh()}
function zauto(){const c=V();for(let i=4;i>=0;i--){if(c.r<i)continue;if(i==1&&P.hp>mx()*.55&&P.mp>mm()*.3)continue;zcast(i)}}
let zsh=0,zdg=0;const shd=()=>zsh>0?.5:1,dg=()=>zdg>0?.5:0,setS=(a,b)=>{if(a)zsh=a;if(b)zdg=b};const cb=()=>1+.03*n()+.1*(V().r+1),mb=()=>1+.02*n();
function gain(a){const c=V();if(maxed()){c.q=Math.min(need(),c.q+a);return}c.q+=a;let up=0;while(c.q>=need()){if(c.r>=0&&c.s<9){c.q-=need();c.s++;up++}else{c.q=need();break}}
 if(up){if(!vil){ZS.cult(RCL[c.r+1],false);DT.push({x:P.x,y:170,s:'Tu vi đột tiến: '+nm(),g:1,l:80})}if(bo&&tab==8)ui()}}
function kill(e){if(V().r>=5)return;gain(Math.ceil((3+(e.lv||1)*.8)*(e.b?5:1))*(lg&&!vil?LGX:1))}
function tick(){if(!started||over||fr%60)return;if(V().r>=5)return;gain((1+n()*.6)*(vil?4:lg?LGX:1));if(bo&&tab==8&&fr%300==0)ui()}
const TRK=3;let TB=0;
function fin(k,sv){const c=V();TB=0;if(k>=TRK)c.td=0;if(sv&&R()*100<Math.min(100,RATE[k]+c.f*5)){c.r=k;c.s=1;c.q=0;c.f=0;QE('brk');if(!vil){ZS.cult(RCL[k+1],true,k);DT.push({x:P.x,y:190,s:'Đột phá '+RN[k+1]+'!',g:1,l:110})}msg='✨ Đột phá thành công: '+nm()+'!'}else{c.f++;c.q=Math.round(need()*.7);if(!sv)DT.push({x:P.x,y:190,s:'Độ kiếp thất bại, tu vi hao tổn',c:'#ff8080',g:1,l:120});msg=sv?'💥 Đột phá thất bại, tu vi hao tổn. Lần sau +5% tỉ lệ.':'⚡ Không chịu nổi lôi kiếp, đột phá thất bại, tu vi hao tổn. Lần sau +5% tỉ lệ.'}ui()}
function bt(){const c=V();if(TB)return;if(!ready()){msg='Tu vi chưa đủ để đột phá';ui();return}const k=c.r+1;if(k>=5&&!(lg&&!vil)){msg='🌌 Cần đứng ở Linh Giới (không phải trong Làng) để đột phá '+RN[k+1]+'.';ui();return}if(k>=TRK&&vil){msg='⚡ Đột phá '+RN[k+1]+' có Lôi Kiếp, hãy ra ngoài bản đồ (không phải trong Làng) để độ kiếp.';ui();return}if(gold<COST[k]){msg='Thiếu vàng: cần '+COST[k]+'💰';ui();return}
gold-=COST[k];if(k>=TRK){TB=1;bo=0;bag.style.display='none';ZS.trib(k,sv=>fin(k,sv));return}fin(k,1)}
const crit=()=>n()*.003,pg=()=>V().q/need(),col=()=>RCL[V().r+1],tx=()=>ready()?'SẴN SÀNG ĐỘT PHÁ':maxed()?'ĐẠI VIÊN MÃN':Math.floor(V().q)+'/'+need();
function aura(){const c=V();if(c.r<0||vil)return;const k=c.r,st=c.s/9,x=(P.x-cam)*s,gy=GY,cc=RCL[k+1],t=fr,PI=Math.PI,GL=['道','玄','天','元','嬰','靈','真','神'];g.save();g.globalCompositeOperation='lighter';
 if(k>=1){const w=(26+k*10+st*10)*s,q=g.createLinearGradient(0,gy,0,gy-250*s);q.addColorStop(0,cc);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.1+.05*k+.06*st+Math.sin(t*.05)*.02;g.fillStyle=q;g.fillRect(x-w/2,gy-250*s,w,250*s)}
 if(k>=4){for(const sd of[-1,1])for(let L=0;L<3;L++){const fl=1+Math.sin(t*.07+L*.9)*.08,sc=1-L*.22,q=g.createLinearGradient(x,0,x+sd*140*s,0);q.addColorStop(0,'rgba(255,200,240,.55)');q.addColorStop(1,'rgba(255,120,220,0)');g.fillStyle=q;g.globalAlpha=.42-L*.08;g.beginPath();g.moveTo(x+sd*12*s,gy-100*s);g.quadraticCurveTo(x+sd*110*s*fl*sc,gy-(195-L*18)*s,x+sd*(125*sc+L*6)*s*fl,gy-(60+L*22)*s);g.quadraticCurveTo(x+sd*70*s,gy-(90-L*6)*s,x+sd*12*s,gy-65*s);g.fill()}}
 if(k>=3){g.save();g.translate(x,gy-80*s);g.strokeStyle=k>=4?'#ffd0f0':'#e0c8ff';g.shadowColor=cc;g.shadowBlur=14;g.lineWidth=2.5*s;g.globalAlpha=.3+.15*Math.sin(t*.05);g.beginPath();g.ellipse(0,0,(60+(k-3)*6)*s,(92+(k-3)*6)*s,0,0,TAU);g.stroke();g.restore()}
 g.save();g.translate(x,gy-4*s);g.scale(s,s*.28);g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=12;const R0=44+st*30;
 g.lineWidth=3;g.globalAlpha=.3+.4*st;g.setLineDash([10,8]);g.lineDashOffset=-t;g.beginPath();g.arc(0,0,R0,0,TAU);g.stroke();g.setLineDash([]);
 if(k>=1){g.save();g.rotate(t*.02);g.beginPath();for(let i=0;i<6;i++){const a=i*PI/3;g.lineTo(Math.cos(a)*R0*.8,Math.sin(a)*R0*.8)}g.closePath();g.stroke();g.restore()}
 if(k>=2){g.save();g.rotate(-t*.015);g.lineWidth=2;g.globalAlpha=.25+.35*st;g.beginPath();for(let i=0;i<=5;i++){const a=i*4*PI/5-1.57,X=Math.cos(a)*R0*.92,Y=Math.sin(a)*R0*.92;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();g.restore()}
 if(k>=3){const R1=R0*1.3;g.lineWidth=2;g.globalAlpha=.35+.3*st;g.beginPath();g.arc(0,0,R1,0,TAU);g.stroke();g.save();g.rotate(t*.01);g.lineWidth=3;for(let i=0;i<8;i++){const a=i*TAU/8;g.save();g.translate(Math.cos(a)*R1*1.14,Math.sin(a)*R1*1.14);g.rotate(a+PI/2);for(let j=0;j<3;j++){const y=(j-1)*6;g.beginPath();if((i>>j)&1){g.moveTo(-9,y);g.lineTo(9,y)}else{g.moveTo(-9,y);g.lineTo(-2.5,y);g.moveTo(2.5,y);g.lineTo(9,y)}g.stroke()}g.restore()}g.restore()}
 if(k>=4){const R2=R0*1.8;g.save();g.rotate(-t*.008);g.lineWidth=2;g.globalAlpha=.3+.25*st;g.setLineDash([4,10]);g.beginPath();g.arc(0,0,R2,0,TAU);g.stroke();g.setLineDash([]);g.lineWidth=2.5;for(let i=0;i<12;i++){const a=i*TAU/12;g.beginPath();g.moveTo(Math.cos(a)*R2*.92,Math.sin(a)*R2*.92);g.lineTo(Math.cos(a)*R2*1.06,Math.sin(a)*R2*1.06);g.stroke()}g.restore()}
 g.restore();
 if(k>=2){const bob=Math.sin(t*.06)*4;
  if(k==2){if(KDI.complete&&KDI.naturalWidth){const oy=gy-(188+bob)*s,d=(24+st*8)*s*(1+Math.sin(t*.1)*.04);const q=g.createRadialGradient(x,oy,d*.3,x,oy,d*.95);q.addColorStop(0,'rgba(255,190,90,.55)');q.addColorStop(1,'rgba(255,150,40,0)');g.globalAlpha=.7;g.fillStyle=q;g.beginPath();g.arc(x,oy,d*.95,0,TAU);g.fill();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(KDI,x-d/2,oy-d/2,d,d)}}
  else if(k>=5){if(HQI.complete&&HQI.naturalWidth){const hx=x,hy=gy-66*s,d=(100+st*14)*s*(1+Math.sin(t*.06)*.025);g.save();g.translate(hx,hy);g.rotate(t*.004);g.globalCompositeOperation='lighter';g.globalAlpha=.9+Math.sin(t*.07)*.08;g.drawImage(HQI,-d/2,-d/2,d,d);g.restore()}}
  else{const K4=k>=4,h=((K4?100:78)+st*(K4?14:12))*s,cy=gy-((K4?196:184)+bob)*s,r=h*.62,rr=h*.74,ry=cy+h*.3;
   const q0=g.createLinearGradient(0,gy-112*s,0,cy+h*.45);q0.addColorStop(0,'rgba(0,0,0,0)');q0.addColorStop(1,cc);g.strokeStyle=q0;g.lineWidth=2*s;g.globalAlpha=.5;g.beginPath();g.moveTo(x,gy-112*s);g.bezierCurveTo(x+Math.sin(t*.07)*14*s,gy-135*s,x-Math.sin(t*.07)*14*s,cy+h*.8,x,cy+h*.45);g.stroke();
   const q=g.createRadialGradient(x,cy,r*.2,x,cy,r*1.55);q.addColorStop(0,'rgba(255,255,255,.4)');q.addColorStop(.45,cc);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.26+.06*Math.sin(t*.07);g.fillStyle=q;g.beginPath();g.arc(x,cy,r*1.55,0,TAU);g.fill();
   g.save();g.globalCompositeOperation='source-over';const qd=g.createRadialGradient(x,cy,r*.15,x,cy,r*1.12);qd.addColorStop(0,'rgba(24,8,52,.62)');qd.addColorStop(.7,'rgba(24,8,52,.38)');qd.addColorStop(1,'rgba(24,8,52,0)');g.globalAlpha=1;g.fillStyle=qd;g.beginPath();g.arc(x,cy,r*1.12,0,TAU);g.fill();g.restore();
   g.save();g.translate(x,cy);g.strokeStyle=cc;g.shadowColor=cc;g.shadowBlur=14;g.lineWidth=2*s;g.globalAlpha=.55;g.beginPath();g.arc(0,0,r*1.08,0,TAU);g.stroke();g.globalAlpha=.3;g.setLineDash([6*s,8*s]);g.lineDashOffset=-t*.5;g.beginPath();g.arc(0,0,r*1.28,0,TAU);g.stroke();g.restore();
   const gl=fr2=>{g.font='bold '+(15*s)+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor=cc;g.shadowBlur=10;g.fillStyle='#fff';for(let i=0;i<GL.length;i++){const a=t*.02+i*TAU/GL.length,sn=Math.sin(a);if((sn>=0)!=fr2)continue;g.globalAlpha=fr2?.9:.35;g.fillText(GL[i],x+Math.cos(a)*rr,ry+sn*rr*.28)}g.shadowBlur=0};
   gl(false);NYD(x,cy,h,.95,cc);gl(true);
   g.fillStyle='#fff';for(let i=0;i<5;i++){const ph=(t*.015+i*.2)%1,a=i*1.9+t*.01,X=x+Math.cos(a)*r*1.2,Y=cy+Math.sin(a*1.3)*r*.9,z=(2+Math.sin(ph*PI)*4)*s;g.globalAlpha=Math.sin(ph*PI)*.9;g.beginPath();g.moveTo(X,Y-z*2);g.lineTo(X+z*.5,Y);g.lineTo(X,Y+z*2);g.lineTo(X-z*.5,Y);g.fill();g.beginPath();g.moveTo(X-z*2,Y);g.lineTo(X,Y+z*.5);g.lineTo(X+z*2,Y);g.lineTo(X,Y-z*.5);g.fill()}
   }}
 g.restore()}
function panel(){const c=V(),k=c.r,p=pg(),rd=ready(),cc=col();let h=(k>=3&&k<5?`<div class="nyc" style="--g:${cc}"><img src="${NYI.src}" draggable="false"><small>Nguyên Anh xuất khiếu</small></div>`:'')+`<div class="dt">🧘 <b>Tu Tiên</b> — độc lập với cấp nhân vật.<br>Cảnh giới: <b style="color:${cc}">${nm()}</b>${maxed()?' · <b>Đại viên mãn</b>':''}<br>Tu vi: ${Math.floor(c.q)}/${need()}<div style="background:#000a;border:1px solid #b8964e;height:10px;margin:4px 0"><div style="width:${Math.min(100,p*100)}%;height:100%;background:${cc}"></div></div>Công/Thủ/HP ×${cb().toFixed(2)} · MP ×${mb().toFixed(2)} · Bạo kích +${(n()*.3).toFixed(1)}%</div>`+(typeof FM!='undefined'?FM.tvBar():'');
 if(!maxed()&&(k<0||c.s==9)){const t=k+1,rt=Math.min(100,RATE[t]+c.f*5);h+=`<div class="dt">🌟 Đột phá <b>${RN[t+1]}</b><br>Cần: ${COST[t]}💰 · tỉ lệ ${rt}%${c.f?' (đã cộng '+c.f*5+'%)':''}<br>${t>=TRK?`<span style="color:#ffd76a">⚡ Có <b>Lôi Kiếp</b>: ${Math.min(9,2*t-1)} đạo sét giáng xuống. Cần ra ngoài bản đồ, chuẩn bị Hộ Thể/Né/HP đầy!</span><br>`:''}${rd?'':'<span style="opacity:.7">Chưa đủ tu vi.</span><br>'}${t>=5&&!(lg&&!vil)?'<span style="color:#9fe8ff">🌌 Cần đứng ở <b>Linh Giới</b> để đột phá cảnh giới này.</span><br>':''}<button ${rd?'':'disabled'} onclick="ZC.bt()">⚡ Đột phá</button></div>`}
 else if(!maxed())h+=`<div class="dt">Đủ tu vi sẽ tự lên tầng ${c.s+1}. Tầng 9 cần đột phá để lên cảnh giới mới.</div>`;
 h+='<div class="dt"><b>Tiên thuật</b> (nút bên phải màn hình, tự dùng khi bật AUTO)<br>'+ZKf().map((k,i)=>c.r>=i?`${k[1]} <b style="color:${RCL[i+1]}">${k[0]}</b> · ${k[2]}MP · hồi ${(k[3]/60).toFixed(1)}s<br><small>${k[5]}, mạnh thêm theo tiểu cảnh</small>`:`🔒 <span style="opacity:.6">${k[0]} — mở khi đột phá ${k[4]}</span>`).join('<br>')+'</div><div class="st">'+RN.map((r,i)=>`<span style="color:${RCL[i]}">${i-1<k?'✔':i-1==k?'➤':'🔒'} ${r}${i?' · '+COST[i-1]+'💰 · '+RATE[i-1]+'%':''}</span>`).join('<br>')+'</div><div class="st">'+(V().r>=5?'<b style="color:#ffb070">⛔ Từ Luyện Hư trở lên, tu vi KHÔNG còn tự tăng (hạ quái, tu luyện ngầm, tọa thiền đều vô hiệu). Phải dùng Đan Tu Vi: trồng dược thảo ở tab 🌱, luyện đan ở tab ⚗.</b> ':'Tu vi nhận khi hạ quái (Tinh Anh/Boss nhiều hơn) và tự tu luyện ngầm; ở 🏘 Làng tọa thiền nhanh ×4. Từ Luyện Hư trở lên chỉ tăng bằng Đan Tu Vi. ')+'Mỗi nhân vật tu luyện riêng.</div>';return h}
/* ---- Đan dược (Linh Điền/Luyện Đan) ---- */
const PLIM=8,PEF={a:.015,d:.015,h:.015,m:.02},TDE=.12,TDM=4;
const pU=()=>{const c=V();return c.pu||(c.pu={})},pCnt=(k,r)=>{const u=pU()[r==null?V().r:r];return u?(u[k]|0):0},pTot=k=>{let s=0;const u=pU();for(const r in u)s+=u[r][k]|0;return s};
const pa=()=>1+pTot('a')*PEF.a,pd=()=>1+pTot('d')*PEF.d,ph=()=>1+pTot('h')*PEF.h,pm=()=>1+pTot('m')*PEF.m,tdn=()=>V().td|0,tdm=()=>1-Math.min(.5,tdn()*TDE),rI=()=>V().r,auto=()=>V().r<5;
function pillStat(k){if(pCnt(k)>=PLIM)return false;const u=pU(),r=V().r;(u[r]||(u[r]={}))[k]=pCnt(k)+1;return true}
function pillTd(){const c=V();if(c.r+1<TRK||maxed()||tdn()>=TDM)return false;c.td=tdn()+1;return true}
function pillTv(f){if(maxed()||ready())return false;gain(Math.max(1,Math.ceil(need()*f)));return true}
const tvInfo=()=>{const c=V();return{need:need(),q:c.q,cap:c.r<0||c.s==9,done:maxed()||ready()}};
return{shd,dg,setS,cds,zauto,zcast,refresh,gain,kill,tick,bt,crit,cb,mb,pg,col,tx,nm,rn,aura,ui:panel,pa,pd,ph,pm,tdn,tdm,rI,auto,pillStat,pillTd,pillTv,pCnt,pTot,tvInfo,PLIM,PEF,TDE,TDM}})();
function fxs(){ZS.fxs()}
function pets(){drawEP();PETS.forEach((p,i)=>{const sz={wolf:34,golem:54,hawk:30}[p.k],j=p.k=='hawk'?42+Math.sin(fr*.1+i)*8:Math.abs(Math.sin(fr*.2+i))*6;g.save();g.translate((p.x-cam)*s,GY-j*s);g.scale(s,s);g.font=sz+'px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.globalAlpha=cl(p.l/30,0,1);g.fillText({wolf:'🐺',golem:'🗿',hawk:'🦅'}[p.k],0,-4);g.restore()})}
function hrr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function mbar(x,y,w,h,v,col,t,fs){const F='KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.save();hrr(x,y,w,h,h/2);g.fillStyle='rgba(10,5,12,.62)';g.fill();g.clip();g.fillStyle=col;g.fillRect(x,y,w*cl(v,0,1),h);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x,y,w*cl(v,0,1),h*.4);g.restore();hrr(x,y,w,h,h/2);g.strokeStyle='#b8964e';g.lineWidth=1.2;g.stroke();if(t){g.font='bold '+fs+'px '+F;const mw=g.measureText(t).width,mx0=w-14;if(mw>mx0)g.font='bold '+(fs*mx0/mw)+'px '+F;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(t,x+w/2,y+h/2+.5);g.fillStyle='#fff';g.fillText(t,x+w/2,y+h/2+.5);g.textBaseline='alphabetic'}}
function mtx(t,x,y,al,col,fs){g.font='bold '+(fs||12)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign=al;g.textBaseline='middle';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(t,x,y);g.fillStyle=col;g.fillText(t,x,y);g.textBaseline='alphabetic'}
function mhud(){g.save();const bx=62,bw=Math.min(W-bx-8,196);
const k=.57;g.save();g.translate(32-60*k,32-60*k);g.scale(k,k);const pg=g.createRadialGradient(60,60,5,60,60,42);pg.addColorStop(0,'#3a3050');pg.addColorStop(1,'#120c18');g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.fillStyle='#f2d6b8';g.beginPath();g.arc(60,64,15,0,6.28);g.fill();g.fillStyle='#16121f';g.beginPath();g.arc(60,58,17,3.1,6.3);g.fill();g.beginPath();g.arc(60,40,7,0,6.28);g.fill();g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.save();g.beginPath();g.arc(60,60,42,0,6.28);g.clip();if(IM[cur].naturalWidth){const m=IM[cur],w=m.naturalWidth,h=m.naturalHeight;const d=HD[cur];g.drawImage(m,d[0],d[1],d[2],d[3],17,15,86,86*d[3]/d[2])}g.restore();g.strokeStyle='#b8964e';g.lineWidth=4;g.beginPath();g.arc(60,60,42,0,6.28);g.stroke();
g.fillStyle='#2a1a10';g.beginPath();g.arc(92,92,16,0,6.28);g.fill();g.stroke();g.fillStyle='#ffe9a0';g.font='bold 20px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(P.lv,92,98);g.restore();
mbar(bx,5,bw,16,P.hp/mx(),'#c83030',Math.ceil(P.hp)+'/'+mx(),11);
mbar(bx,24,bw,12,P.mp/mm(),'#3a7ae0',Math.floor(P.mp)+'/'+mm(),9.5);
mbar(bx,39,bw,12,P.xp/nx(),'#d8a830',(P.lv>=LC(PS[cur].tier)&&PS[cur].tier<3?'CẦN CHUYỂN CHỨC ':'EXP ')+P.xp+'/'+nx(),9.5);
mbar(bx,54,bw,12,ZC.pg(),ZC.col(),ZC.nm()+' · Tu vi '+ZC.tx(),9.5);
const L=W-8;
mtx('Công '+atk()*5+' · Thủ '+df(),8,79,'left','#f2e3b3');mtx('💰 '+gold,L,79,'right','#ffd54a');
mtx('📜 '+qsHud()[0]+' '+qsHud()[1].split(' ')[0],8,95,'left','#ffe9a0');mtx('⭐ '+(NK%30)+'/30 · 👑 '+(NK%100)+'/100',L,95,'right','#9fe0ff');
const r=18e5-Date.now()%18e5;mtx('📍 '+(vil?((typeof MN!='undefined'&&MN.isOn())?'Hầm Mỏ Thanh Vân':(typeof FM!='undefined'&&FM.isOn())?'Linh Điền Động Thiên':((typeof LCT!='undefined'&&LCT.on())?'Thành Thị Linh Giới':'Thanh Vân Tiên Thôn')):MP[mi()].n),8,111,'left','#e8d5a0');mtx(E.some(e=>e.b==2)?'🐲 Boss Thế Giới!':'🐲 '+Math.floor(r/6e4)+':'+String(Math.floor(r/1e3)%60).padStart(2,'0'),L,111,'right','#ffa733');
g.restore()}
function draw(){const gy=GY;g.setTransform(DPR,0,0,DPR,0,0);g.globalAlpha=1;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';ZS.sh();if(vil)vdraw();else{bgd(gy);E.slice().sort((a,b)=>a.x-b.x).forEach(foe);pets();ZC.aura();hero();fxs();nameTag();
ZS.pjs()}

PT.forEach(p=>{g.globalAlpha=cl(p.l/25,0,1);g.fillStyle=p.c;g.fillRect((p.x-cam)*s,gy-p.y*s,4*s,4*s)});g.globalAlpha=1;
DT.forEach(d=>{const tx=String(d.s),nm=/^[+\-]?\d/.test(tx)||tx=='Trượt'||tx=='Né',sz=(nm?(d.k?44:32)*DNS:(d.k?44:32)*DTX*(d.it?.4:1))*s;g.font='bold '+sz+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=nm?2:3;g.strokeStyle=d.g?'#063':d.r?'#400':'#7a3a00';g.fillStyle=d.c||(d.g?'#8fffa0':d.r?'#ff7070':'#ffd54a');g.globalAlpha=cl(d.l/20,0,1);const x=(d.x-cam)*s,y=gy-d.y*s;g.strokeText(d.s,x,y);g.fillText(d.s,x,y)});g.globalAlpha=1;
const hs=cl(Math.min(H/540,W/420),.6,1.1),ly=12;if(W<640)mhud();else{g.save();g.scale(hs,hs);
const pg=g.createRadialGradient(60,60,5,60,60,42);pg.addColorStop(0,'#3a3050');pg.addColorStop(1,'#120c18');g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.fillStyle='#f2d6b8';g.beginPath();g.arc(60,64,15,0,6.28);g.fill();g.fillStyle='#16121f';g.beginPath();g.arc(60,58,17,3.1,6.3);g.fill();g.beginPath();g.arc(60,40,7,0,6.28);g.fill();g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.save();g.beginPath();g.arc(60,60,42,0,6.28);g.clip();if(IM[cur].naturalWidth){const m=IM[cur],w=m.naturalWidth,h=m.naturalHeight;const d=HD[cur];g.drawImage(m,d[0],d[1],d[2],d[3],17,15,86,86*d[3]/d[2])}g.restore();g.strokeStyle='#b8964e';g.lineWidth=4;g.beginPath();g.arc(60,60,42,0,6.28);g.stroke();
g.fillStyle='#2a1a10';g.beginPath();g.arc(92,92,16,0,6.28);g.fill();g.stroke();g.fillStyle='#ffe9a0';g.font='bold 17px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(P.lv,92,98);
cbar(112,18,240,20,P.hp/mx(),'#c83030',Math.ceil(P.hp)+'/'+mx());cbar(112,42,240,16,P.mp/mm(),'#3a7ae0',Math.floor(P.mp)+'/'+mm());cbar(112,62,240,16,P.xp/nx(),'#d8a830',(P.lv>=LC(PS[cur].tier)&&PS[cur].tier<3?'CẦN CHUYỂN CHỨC ':'EXP ')+P.xp+'/'+nx());cbar(112,110,240,16,ZC.pg(),ZC.col(),'Tu vi '+ZC.tx());{const rt=ZC.nm();g.fillStyle='#2a1a10';g.fillRect(10,110,96,16);g.strokeStyle=ZC.col();g.lineWidth=2;g.strokeRect(10,110,96,16);g.font='bold 13px KTH Serif,Songti SC,STKaiti,KaiTi,serif';const w0=g.measureText(rt).width;g.font='bold '+Math.floor(13*Math.min(1,86/w0))+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillStyle=ZC.col();g.fillText(rt,58,122)}
g.fillStyle='#2a1a10cc';g.fillRect(112,84,110,22);g.fillRect(230,84,110,22);g.fillStyle='#f2e3b3';g.font='bold 14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('công '+atk()*5,167,100);g.fillText('thủ '+df(),285,100);
g.fillStyle='#e8d5a0';g.fillRect(10,140,200,86);g.strokeStyle='#8a6d3b';g.lineWidth=3;g.strokeRect(10,140,200,86);g.fillStyle='#6a4a20';g.textAlign='left';g.font='14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('Chương '+(QS.ch+1)+' · Chính tuyến',22,162);g.fillStyle='#2a1a0a';g.font='bold 16px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText(qsHud()[0],22,188);g.font='14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText(qsHud()[1],22,212);
g.restore();g.fillStyle='#e8d5a0';g.fillRect(W-210*hs,ly*hs,198*hs,34*hs);g.strokeStyle='#8a6d3b';g.lineWidth=3;g.strokeRect(W-210*hs,12*hs,198*hs,34*hs);g.fillStyle='#2a1a0a';g.font='bold '+16*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(vil?((typeof MN!='undefined'&&MN.isOn())?'Hầm Mỏ Thanh Vân':(typeof FM!='undefined'&&FM.isOn())?'Linh Điền Động Thiên':((typeof LCT!='undefined'&&LCT.on())?'Thành Thị Linh Giới':'Thanh Vân Tiên Thôn')):MP[mi()].n,W-111*hs,(ly+23)*hs);g.fillStyle='#ffd54a';g.font='bold '+15*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('💰 '+gold,W-111*hs,(ly+54)*hs);g.fillStyle='#ffa733';g.font='bold '+13*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';{const r=18e5-Date.now()%18e5;g.fillText(E.some(e=>e.b==2)?'🐲 Boss Thế Giới đang xuất hiện!':'🐲 Boss thế giới: '+Math.floor(r/6e4)+':'+String(Math.floor(r/1e3)%60).padStart(2,'0'),W-111*hs,(ly+76)*hs);g.fillStyle='#9fe0ff';g.fillText('⭐ '+(NK%30)+'/30 · 👑 '+(NK%100)+'/100',W-111*hs,(ly+98)*hs)}}
g.fillStyle='#8fffa0';g.font=14*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='left';g.fillText(vil||auto?'':(W<640?'Thủ công · chạm kỹ năng':'Thủ công: bấm nút kỹ năng để đánh'),14,H-((document.getElementById('dock')||{offsetHeight:56}).offsetHeight+26));
if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H)}}

let SL=[['Kiếm','⚔️'],['Giáp','🥋'],['Mũ','🎓'],['Giày','👢'],['Nhẫn','💍'],['Bội','📿']],
RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần','Thánh'],RC=['#cccccc','#6fdc6f','#5aa8ff','#c070ff','#ffa733','#ff5ad0','#ffe27a'],RM=[1,1.4,1.9,2.6,3.6,5,15],
NM=[],
BS=[[10,0,0],[2,2,6],[0,5,18],[0,2,10],[2,1,4],[0,3,12],[0,2,6],[3,1,6],[3,1,6],[2,1,22],[4,1,14]];
const PAL=[{m:'#a9afba',d:'#4a4452',a:'#c4586c',t:'#d9b04a',l:'#e8ebf0'},{m:'#a8d4f4',d:'#3a5a8a',a:'#e8f8ff',t:'#7ab4d8',l:'#ffffff'},{m:'#4a2a22',d:'#160604',a:'#ff7a2a',t:'#ffc060',l:'#ff9a50'},{m:'#d8d0bc',d:'#2a1648',a:'#c090f0',t:'#8a5ac0',l:'#f4ecdc'},{m:'#341866',d:'#08040f',a:'#f050d0',t:'#a07af8',l:'#d0b0ff'}],IC={},CC={};
function mkIcon(cls,sl,mp,r){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),P=PAL[mp],gl=RC[r];
x.globalAlpha=.3+r*.06;let q=x.createRadialGradient(32,32,2,32,32,31);q.addColorStop(0,gl);q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,64,64);x.globalAlpha=1;x.lineJoin='round';x.lineCap='round';
const F=c=>{x.fillStyle=c},S=(c,w)=>{x.strokeStyle=c;x.lineWidth=w},G=(a,b,c,d,c0,c1)=>{const z=x.createLinearGradient(a,b,c,d);z.addColorStop(0,c0);z.addColorStop(1,c1);return z},
poly=(pts,f,st)=>{x.beginPath();pts.forEach((u,i)=>i?x.lineTo(u[0],u[1]):x.moveTo(u[0],u[1]));x.closePath();if(f){F(f);x.fill()}if(st){S(st,2);x.stroke()}},
circ=(cx,cy,rr,f,st)=>{x.beginPath();x.arc(cx,cy,rr,0,6.283);if(f){F(f);x.fill()}if(st){S(st,2);x.stroke()}},
glow=(c,b)=>{x.shadowColor=c;x.shadowBlur=b},
gem=(cx,cy,rr)=>{glow(P.a,10);circ(cx,cy,rr,G(cx,cy-rr,cx,cy+rr,P.l,P.a),P.d);glow('transparent',0);F('#fff');x.globalAlpha=.7;x.fillRect(cx-rr*.4,cy-rr*.5,rr*.3,rr*.3);x.globalAlpha=1},
star=(cx,cy,rr,c)=>{x.beginPath();for(let i=0;i<10;i++){const a=i*.628-1.57,d=i%2?rr*.45:rr;x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d)}x.closePath();F(c);x.fill()};
const M=G(0,10,0,54,P.l,P.m),LT=cls=='a'?'#7a5a38':P.m;
if(sl==0){x.save();if(cls=='w'){x.translate(32,34);x.rotate(.7);if(mp>=1)glow(P.a,mp>=2?12:6);poly([[0,-30],[6,-22],[6,8],[-6,8],[-6,-22]],G(-6,0,6,0,P.l,P.m),P.d);glow('transparent',0);S(P.a,2);x.beginPath();x.moveTo(0,-22);x.lineTo(0,4);x.stroke();poly([[-15,8],[15,8],[12,14],[-12,14]],P.t,P.d);F('#5a3a22');x.fillRect(-3,14,6,12);circ(0,29,4,P.t,P.d);if(mp>=3){poly([[-15,8],[-20,0],[-12,6]],P.t);poly([[15,8],[20,0],[12,6]],P.t)}}
else if(cls=='m'){x.translate(32,34);x.rotate(.55);F('#5a3a22');x.fillRect(-2.5,-4,5,38);F(P.t);x.fillRect(-4,8,8,3);x.fillRect(-4,20,8,3);S(P.t,3.5);x.beginPath();x.arc(0,-14,12,3.5,5.9);x.stroke();gem(0,-14,8);if(mp>=3){star(-14,-26,4,P.a);star(14,-4,3,P.a)}}
else{S('#7a4a28',6);x.beginPath();x.arc(46,32,27,2.2,4.08);x.stroke();S(P.t,2);x.beginPath();x.arc(46,32,27,2.2,4.08);x.stroke();S('#eee',1.5);x.beginPath();x.moveTo(30.4,10);x.lineTo(30.4,54);x.stroke();S(P.l,2.5);x.beginPath();x.moveTo(16,32);x.lineTo(54,32);x.stroke();if(mp>=1)glow(P.a,8);poly([[60,32],[52,27],[52,37]],P.a);glow('transparent',0);poly([[16,32],[10,27],[20,32],[10,37]],P.a)}x.restore()}
else if(sl==1){if(cls=='w'){x.beginPath();x.moveTo(12,10);x.lineTo(52,10);x.lineTo(52,32);x.quadraticCurveTo(52,52,32,59);x.quadraticCurveTo(12,52,12,32);x.closePath();F(G(12,10,52,59,P.l,P.m));x.fill();S(P.d,2.5);x.stroke();S(P.t,3);x.beginPath();x.moveTo(32,12);x.lineTo(32,56);x.moveTo(14,28);x.lineTo(50,28);x.stroke();circ(32,28,7,P.a,P.d);if(mp>=2){poly([[12,10],[8,2],[18,10]],P.t);poly([[52,10],[56,2],[46,10]],P.t)}}
else if(cls=='m'){poly([[12,8],[50,8],[50,57],[12,57]],G(0,8,0,57,P.m,P.d),P.d);F('#f0e8d0');x.fillRect(46,10,6,45);S('#bbb',1);for(let i=0;i<5;i++){x.beginPath();x.moveTo(47,14+i*9);x.lineTo(52,14+i*9);x.stroke()}F(P.t);x.fillRect(12,8,6,49);glow(P.a,10);star(32,32,11,P.a);glow('transparent',0);circ(32,32,4,P.l);F(P.t);x.fillRect(40,28,8,5)}
else{x.save();x.translate(32,34);x.rotate(.3);S(P.l,2);for(const[a,b]of[[-5,-24],[0,-26],[5,-23]]){x.beginPath();x.moveTo(a,-2);x.lineTo(a-1,b);x.stroke();poly([[a-1,b],[a-4,b+7],[a+2,b+7]],P.a)}F('#6a4a2a');x.fillRect(-10,-4,20,32);S(P.d,1.5);x.strokeRect(-10,-4,20,32);F(P.t);x.fillRect(-10,4,20,4);x.fillRect(-10,20,20,4);circ(0,14,3,P.a);x.restore()}}
else if(sl==2){if(cls=='w'){circ(12,22,9,G(0,13,0,31,P.l,P.m),P.d);circ(52,22,9,G(0,13,0,31,P.l,P.m),P.d);poly([[16,18],[24,10],[40,10],[48,18],[50,36],[44,54],[20,54],[14,36]],M,P.d);S(P.t,2);x.beginPath();x.moveTo(32,12);x.lineTo(32,52);x.stroke();F(P.t);x.fillRect(18,42,28,4);poly([[32,22],[38,30],[32,38],[26,30]],P.a,P.d);if(mp>=2){poly([[10,16],[6,6],[16,12]],P.t);poly([[54,16],[58,6],[48,12]],P.t)}}
else if(cls=='m'){poly([[24,8],[40,8],[56,56],[8,56]],G(0,8,0,56,P.m,P.d),P.d);poly([[24,10],[10,36],[17,42],[26,26]],P.m,P.d);poly([[40,10],[54,36],[47,42],[38,26]],P.m,P.d);poly([[24,8],[32,26],[40,8]],P.a,P.d);F(P.t);x.fillRect(20,34,24,4);S(P.t,2.5);x.beginPath();x.moveTo(9,55);x.lineTo(55,55);x.stroke();gem(32,36,4)}
else{poly([[14,12],[26,10],[32,20],[38,10],[50,12],[54,26],[47,54],[17,54],[10,26]],M,P.d);x.setLineDash([3,3]);S(P.d,1.5);x.beginPath();x.moveTo(32,20);x.lineTo(32,54);x.stroke();x.setLineDash([]);S(P.t,3.5);x.beginPath();x.moveTo(14,16);x.lineTo(46,50);x.moveTo(50,16);x.lineTo(18,50);x.stroke();circ(32,34,4,P.a,P.d)}}
else if(sl==3){const C0=cls=='w'?P.a:cls=='m'?P.t:P.m,pts=cls=='a'?[[18,8],[46,8],[56,34],[50,56],[44,48],[38,58],[32,50],[26,58],[20,48],[14,56],[8,34]]:cls=='m'?[[20,10],[44,10],[56,56],[8,56]]:[[18,8],[46,8],[58,56],[6,56]];poly(pts,G(0,8,0,56,C0,P.d),P.d);S(P.d,1.5);x.globalAlpha=.55;x.beginPath();x.moveTo(32,14);x.lineTo(22,54);x.moveTo(32,14);x.lineTo(32,56);x.moveTo(32,14);x.lineTo(42,54);x.stroke();x.globalAlpha=1;
if(cls=='w'){S(P.t,3);x.beginPath();x.moveTo(8,55);x.lineTo(56,55);x.stroke()}if(cls=='m'){x.beginPath();x.arc(32,14,13,3.14,6.283);F(G(0,2,0,14,P.t,P.d));x.fill();S(P.d,2);x.stroke();star(22,40,3.5,P.l);star(42,32,3,P.l);star(34,48,2.5,P.l)}circ(32,13,4,P.t,P.d)}
else if(sl==4){const fg=(c,w)=>{S(c,w);[[20,38,18,16],[28,37,28,11],[36,37,36,10],[44,38,43,15]].forEach(f=>{x.beginPath();x.moveTo(f[0],f[1]);x.lineTo(f[2],f[3]);x.stroke()});x.beginPath();x.moveTo(14,44);x.lineTo(7,33);x.stroke()};fg(P.d,11);fg(LT,7);poly([[14,35],[50,35],[48,48],[16,48]],cls=='a'?LT:M,P.d);poly([[14,48],[50,48],[53,58],[11,58]],cls=='w'?G(0,48,0,58,P.t,P.m):cls=='m'?P.a:'#5a3a22',P.d);if(cls=='w'){for(const a of[22,30,38,46])circ(a,39,2,P.t)}else if(cls=='m')gem(32,42,4);else{S(P.t,2.5);x.beginPath();x.moveTo(16,41);x.lineTo(48,41);x.stroke()}}
else if(sl==5){poly([[16,8],[48,8],[52,56],[37,56],[32,28],[27,56],[12,56]],G(0,8,0,56,LT,P.d),P.d);F(cls=='m'?P.a:P.t);x.fillRect(16,8,32,7);if(cls=='w'){circ(22,38,5,P.l,P.d);circ(42,38,5,P.l,P.d);S(P.t,2);x.beginPath();x.moveTo(13,54);x.lineTo(28,54);x.moveTo(36,54);x.lineTo(51,54);x.stroke()}else if(cls=='m'){gem(32,11,3.5);S(P.t,1.5);x.beginPath();x.moveTo(22,20);x.lineTo(18,54);x.moveTo(42,20);x.lineTo(46,54);x.stroke()}else{x.setLineDash([3,3]);S(P.d,1.5);x.beginPath();x.moveTo(23,16);x.lineTo(20,54);x.moveTo(41,16);x.lineTo(44,54);x.stroke();x.setLineDash([]);F(P.a);x.fillRect(29,8,6,7)}}
else if(sl==6){const t=cls=='m'?[[22,12],[40,12],[40,34],[52,42],[58,34],[60,46],[52,54],[16,54],[20,38]]:[[22,8],[40,8],[41,34],[56,42],[56,54],[16,54],[20,38]];poly(t,G(0,8,0,54,P.l,P.m),P.d);F(P.d);x.fillRect(15,52,43,5);F(cls=='m'?P.t:P.d);x.fillRect(20,cls=='m'?12:8,22,6);if(cls=='w'){F(P.a);x.fillRect(24,26,14,4);F(P.t);x.fillRect(20,8,22,6)}else if(cls=='a'){S(P.d,1.5);for(let i=0;i<4;i++){x.beginPath();x.moveTo(23,20+i*6);x.lineTo(38,22+i*6);x.stroke()}}else gem(31,30,3.5);if(mp>=3)poly([[16,54],[10,58],[22,56]],P.t)}
else if(sl<=8){S(P.t,7);x.beginPath();x.arc(32,41,15,0,6.283);x.stroke();S(P.l,2);x.beginPath();x.arc(32,41,15,3.6,5.2);x.stroke();if(cls=='w'){glow(P.a,10);poly([[32,12],[41,17],[41,27],[32,32],[23,27],[23,17]],G(0,12,0,32,P.l,P.a),P.d);glow('transparent',0)}else if(cls=='m')gem(32,22,9);else{glow(P.a,10);poly([[24,30],[32,8],[40,30]],G(0,8,0,30,P.l,P.a),P.d);glow('transparent',0)}}
else if(sl==9){S(P.t,2.5);x.beginPath();x.arc(32,6,26,.55,2.59);x.stroke();if(cls=='w'){circ(32,45,13,G(0,32,0,58,P.t,P.m),P.d);circ(32,45,9,null,P.d);star(32,45,7,P.a)}else if(cls=='m'){glow(P.a,12);x.beginPath();x.moveTo(32,28);x.quadraticCurveTo(52,44,32,62);x.quadraticCurveTo(12,44,32,28);F(G(0,28,0,62,P.l,P.a));x.fill();S(P.t,3);x.stroke();glow('transparent',0)}else{x.beginPath();x.moveTo(24,32);x.quadraticCurveTo(26,50,36,61);x.quadraticCurveTo(43,46,40,32);x.closePath();F(G(0,32,0,61,P.l,P.m));x.fill();S(P.d,2);x.stroke();circ(32,31,3.5,P.a,P.d)}}
else{S(P.d,10);x.beginPath();x.moveTo(16,40);x.quadraticCurveTo(4,38,6,22);x.stroke();S(P.m,6);x.beginPath();x.moveTo(16,40);x.quadraticCurveTo(4,38,6,22);x.stroke();
if(mp==2){glow(P.a,12);poly([[6,24],[0,8],[10,16],[10,4],[14,22]],P.a);glow('transparent',0)}if(mp==1)circ(6,21,7,P.l,P.t);if(mp==4){poly([[26,34],[6,8],[34,28]],P.t,P.d);poly([[32,32],[22,3],[44,28]],P.a,P.d)}
x.beginPath();x.ellipse(30,41,17,11,0,0,6.283);F(G(0,30,0,52,P.l,P.m));x.fill();S(P.d,2);x.stroke();for(const lx of[18,25,36,43]){F(P.m);x.fillRect(lx,46,6,9);S(P.d,1.5);x.strokeRect(lx,46,6,9)}
if(mp==1){poly([[22,31],[25,17],[29,31]],P.a,P.t);poly([[30,30],[34,13],[38,30]],P.a,P.t)}if(mp==3){for(let k=0;k<4;k++)poly([[20+k*7,32],[23+k*7,21],[26+k*7,32]],P.l,P.d)}
circ(47,29,11,G(0,18,0,40,P.l,P.m),P.d);poly([[40,22],[41,8],[48,19]],P.m,P.d);poly([[48,19],[55,9],[56,24]],P.m,P.d);if(mp==2||mp==4){poly([[44,19],[40,4],[49,17]],P.t,P.d)}
glow(P.a,6);circ(50,28,2.6,P.a);glow('transparent',0);F('#fff');x.fillRect(49,27,1.5,1.5);circ(57,32,3.5,P.d);if(mp==3){star(12,14,4,P.a);star(54,52,3,P.a)}}
return cv}
/* ---- icon trang bị: 4 bộ × 10 món (Lv1-20, 21-40, 41-60, 61+), sprite WebP 960×384 ---- */
const ISH=new Image(),ISC=[1,6,7,5,2,9,4,3,8,0],ISET=i=>Math.min(3,Math.max(0,Math.floor(((i.l|0)-1)/20)));ISH.onload=()=>{try{if(typeof bo!='undefined'&&bo)ui()}catch(e){}};ISH.src=ASSET_URL("a024");
const GHC={},ghost=s=>{if(!(s<=9&&ISH.complete&&ISH.naturalWidth>0))return SL[s][1];const w0=s==0?wimg():null,k=s+(w0?wkey():'');if(!GHC[k]){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');if(w0)drawWpn(x,w0,96,9);else x.drawImage(ISH,ISC[s]*96,0,96,96,0,0,96,96);GHC[k]=c.toDataURL()}return`<img src="${GHC[k]}" draggable="false" style="width:100%;height:100%;object-fit:contain;filter:grayscale(.7)">`};const wimg=()=>{if(CHR[cur].t=='w')return null;try{const m=WPNIMG();return m&&(m.naturalWidth||m.width)?m:null}catch(e){return null}},wkey=()=>'w'+(PS[cur].tier|0)+'_'+(PS[cur].br|0),inew=i=>i.s<=9&&ISH.complete&&ISH.naturalWidth>0;
function drawWpn(x,m,z,mg){const w=m.naturalWidth||m.width,h=m.naturalHeight||m.height,sc=Math.min((z-mg*2)/w,(z-mg*2)/h);x.imageSmoothingQuality='high';x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=4;x.drawImage(m,z/2-w*sc/2,z/2-h*sc/2,w*sc,h*sc);x.restore()}
function mkIcon2(i){const cv=document.createElement('canvas');cv.width=cv.height=96;const x=cv.getContext('2d'),gl=RC[i.r];x.globalAlpha=.3+i.r*.07;let q=x.createRadialGradient(48,48,3,48,48,47);q.addColorStop(0,gl);q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,96,96);x.globalAlpha=1;x.imageSmoothingQuality='high';if(i.hl){const hm=HL.img[i.s==7&&i.v?8:i.s];if(hm&&hm.complete&&hm.naturalWidth)x.drawImage(hm,0,0,128,128,0,0,96,96);return cv}const w0=i.s==0?wimg():null;if(w0)drawWpn(x,w0,96,9);else x.drawImage(ISH,ISC[i.s]*96,ISET(i)*96,96,96,0,0,96,96);return cv}
const ik=i=>inew(i)?'n'+i.s+(i.v?'v':'')+'_'+ISET(i)+'_'+i.r+(i.s==0&&wimg()?wkey():''):CHR[cur].t+i.s+(i.mp|0)+i.r,icv=i=>CC[ik(i)]||(CC[ik(i)]=inew(i)?mkIcon2(i):mkIcon(CHR[cur].t,i.s,i.mp|0,i.r)),ico=i=>IC[ik(i)]||(IC[ik(i)]=icv(i).toDataURL()),IMG=(i,z)=>`<img src="${ico(i)}" draggable="false" style="${z?'width:'+z+'px;height:'+z+'px;vertical-align:middle':'width:100%;height:100%;object-fit:contain'}">`;
const BIMG=i=>{ico(i);return'<img data-ik="'+ik(i)+'" draggable="false" style="width:100%;height:100%;object-fit:contain">'};
const sc=i=>i?i.a*3+i.d*2+i.h/4+(i.x?Object.values(i.x).reduce((a,b)=>a+b,0)*8:0):0,sell=i=>Math.round(sc(i)*(1+i.r)/2+2),
BR=()=>{const m=mi();return[.05*Math.pow(.72,m),.17*Math.pow(.8,m),.38*Math.pow(.9,m)]},
rr=b=>{const x=R();if(!b)return x<.005?3:x<.1?2:x<.35?1:0;const[a,e,r]=BR();return x<a?4:x<a+e?3:x<a+e+r?2:1};
const tgt=it=>it.s==7?(!EQ[7]?7:!EQ[8]?8:sc(EQ[7])<=sc(EQ[8])?7:8):it.s;
function gen(l,r,sl,mo){const s=sl??TY[Math.floor(R()*TY.length)],mp=mo??mapSel,m=(1+l*.6)*RM[r]*MT[mp],b=BS[s];return{u:0,s,r,l,mp,x:rollX(r,l,mp),n:(s==10?PETN[mp]+' '+ADJ[r]:NM[s][r])+' · '+MTN[mp],a:Math.round(b[0]*m),d:Math.round(b[1]*m),h:Math.round(b[2]*m)}}
function eqp(it,idx,fs){if(it.l>P.lv&&!it.c){msg='⛔ Cần Lv'+it.l+' mới mặc được (hiện Lv'+P.lv+')';return}if(tgt(it)==10&&PS[cur].tier<1){msg='🐾 Thú nuôi mở khi chuyển chức 1 (Lv20)';return}const T=(it.s==7&&(fs==7||fs==8))?fs:tgt(it),o=EQ[T];EQ[T]=it;if(idx>=0)BAG.splice(idx,1);if(o){if(idx>=0)BAG.splice(idx,0,o);else if(BAG.length<capN())BAG.push(o);else gold+=sell(o)}P.hp=Math.min(P.hp,mx())}
let AS=0,qs=0;const SPK=i=>i.r>=4||i.c;
function give(it,x,y){const sp=SPK(it);DT.push({x,y,s:(sp?'✨ ':'')+SL[it.s][1]+' '+it.n+(it.c?' ✦':''),c:RC[it.r],l:sp?130:80,k:sp,it:1});if(sp)for(let i=0;i<22;i++)PT.push({x,y:60+R()*50,vx:(R()-.5)*5,vy:-R()*4,l:45,c:it.r>=4?'#ffd060':'#8ff0ff'});
if(it.l<=P.lv&&(tgt(it)!=10||PS[cur].tier>0)&&sc(it)>sc(EQ[tgt(it)])&&!(EQ[tgt(it)]&&SPK(EQ[tgt(it)])&&!SPK(it))){eqp(it,-1);DT.push({x,y:y+32,s:'🔄 Tự mặc '+it.n,c:'#9fffb0',l:70})}else if(!SPK(it)&&it.r<AS){const v=sell(it);gold+=v;DT.push({x,y:y-26,s:'+'+v+'💰',c:'#ffd54a',l:50})}else if(BAG.length<capN())BAG.push(it);else gold+=sell(it)}
function drop(e){const m=mi();if(e.b==2){const n=5+Math.floor(R()*5);frag+=n;DT.push({x:e.x,y:110,s:'🔹 +'+n+' mảnh chế tạo',c:'#6ff',l:110});if(R()<LW.C.keyRate){LW.addKey(1);DT.push({x:e.x,y:150,s:'🗝 Chìa Khóa Vòng Quay!',c:'#ffe27a',l:130,g:1})}if(R()<.12*Math.pow(.75,m))give(gen(e.lv,4),e.x,190)}
gold+=(e.b==3?100:e.b?40:4)*e.lv;const n=e.b==3?3:e.b?2:(R()<.4?1:0);for(let i=0;i<n;i++){const x=R(),r=e.b==3?(x<.4?3:2):e.b==1?(x<.02?3:x<.5?2:1):rr(e.b);give(gen(e.lv,r),e.x,70+i*34)}if(e.b==3&&R()<.05){DT.push({x:e.x,y:230,s:'👑 Rơi Thần Thoại!',c:RC[4],l:120});give(gen(e.lv,4),e.x,200)}}
const bag=document.getElementById('bag'),bgb=document.getElementById('bg');
const ev=(i,k)=>Math.round(i[k]*(1+.15*i.u)),tip=i=>`<b style="color:${RC[i.r]}">${IMG(i,30)} ${i.n}${i.u?' +'+i.u:''}</b><br>${i.c?'✦ Chế tác · ':''}${RN[i.r]} · ${SL[i.s][0]} · <span style="color:${i.l>P.lv?'#ff6a6a':'inherit'}">Lv${i.l}</span> · Bán ${sell(i)}💰<br>`+(i.a?`Công +${ev(i,'a')} `:'')+(i.d?`Thủ +${ev(i,'d')} `:'')+(i.h?`HP +${ev(i,'h')}`:'')+(i.x?'<br>'+Object.keys(i.x).map(k=>`<span style="color:#9fe0ff">${AXN[k]} +${i.x[k]}%</span>`).join(' · '):'')+(i.hl?HL.tipTxt():i.r>=4?`<br><span style="color:#ffa733">✦ Bộ Thần Thoại ${setN()}/6: ${setOn()?'ĐÃ KÍCH HOẠT (+30% công/HP, +10% bạo kích)':'??? mặc đủ 6 món để lộ opt ẩn'}</span>`:'');
let tab=0,msg='';const cost=i=>Math.round((30+sc(i)*3)*(1+i.u)*(1+i.r*.5)),RT=[100,100,90,80,70,60,45,35,25,15],
AN=[['Lực','+3 công'],['Thể','+25 HP, +1 thủ'],['Linh','+8 MP, -1% hồi chiêu'],['Mẫn','+1% bạo kích']],
PIC=[ASSET_URL("a025"),ASSET_URL("a026"),ASSET_URL("a027")],IM=PIC.map(u=>{const i=new Image();i.src=u;return i}); const RIGD=[{"W":176,"H":420,"base":{"img":ASSET_URL("a028"),"x":3,"y":0,"w":170,"h":301,"n":14324},"Au":{"img":ASSET_URL("a029"),"x":121,"y":117,"w":28,"h":53,"n":1068},"Al":{"img":ASSET_URL("a030"),"x":124,"y":155,"w":36,"h":74,"n":1514},"A_S":[132,108],"A_E":[148,160],"A_H":[150,214],"Bu":{"img":ASSET_URL("a031"),"x":15,"y":117,"w":38,"h":49,"n":1150},"Bl":{"img":ASSET_URL("a032"),"x":15,"y":152,"w":29,"h":84,"n":1680},"B_S":[38,108],"B_E":[22,158],"B_H":[30,218],"LL":{"img":ASSET_URL("a033"),"x":3,"y":286,"w":91,"h":134,"n":3270},"LR":{"img":ASSET_URL("a034"),"x":87,"y":286,"w":87,"h":121,"n":3216},"pivL":[62,296],"pivR":[116,296],"sh":{"img":ASSET_URL("a035"),"x":23,"y":74,"w":128,"h":53,"n":3172}},{"W":219,"H":420,"base":{"img":ASSET_URL("a036"),"x":2,"y":21,"w":214,"h":399,"n":21380},"Au":{"img":ASSET_URL("a037"),"x":152,"y":112,"w":30,"h":69,"n":1376},"Al":{"img":ASSET_URL("a038"),"x":158,"y":162,"w":47,"h":66,"n":1694},"A_S":[163,118],"A_E":[177,168],"A_H":[197,220],"sh":{"img":ASSET_URL("a039"),"x":139,"y":94,"w":28,"h":44,"n":1238}},{"W":161,"H":420,"base":{"img":ASSET_URL("a040"),"x":14,"y":34,"w":145,"h":242,"n":9814},"Au":{"img":ASSET_URL("a041"),"x":126,"y":128,"w":20,"h":53,"n":882},"Al":{"img":ASSET_URL("a042"),"x":129,"y":167,"w":29,"h":79,"n":1522},"A_S":[133,120],"A_E":[146,172],"A_H":[149,232],"Bu":{"img":ASSET_URL("a043"),"x":48,"y":131,"w":31,"h":46,"n":1038},"Bl":{"img":ASSET_URL("a044"),"x":43,"y":162,"w":29,"h":85,"n":1636},"B_S":[71,122],"B_E":[53,168],"B_H":[53,232],"LL":{"img":ASSET_URL("a045"),"x":2,"y":261,"w":97,"h":159,"n":3478},"LR":{"img":ASSET_URL("a046"),"x":92,"y":261,"w":66,"h":145,"n":2860},"pivL":[75,270],"pivR":[117,270],"sh":{"img":ASSET_URL("a047"),"x":53,"y":96,"w":84,"h":46,"n":2282}}],RIGI=RIGD.map(o=>{const r={};for(const k in o){const v=o[k];if(v&&v.img){const im=new Image();im.src=v.img;r[k]={im,x:v.x,y:v.y,w:v.w,h:v.h}}else r[k]=v}return r});
const HVU=[ASSET_URL("a048"), ASSET_URL("a049"), ASSET_URL("a050"), ASSET_URL("a051")],HVI=HVU.map(u=>{const i=new Image();i.src=u;return i}),HVZ=[[246, 132], [174, 156], [182, 175], [199, 173]],HVH=[30,40,50,62],HVC=['#bfe8ff','#6fe0c8','#59a0ff','#ffd36a'];
const DRG=[{"w":90,"h":138,"body":ASSET_URL("a052"),"wings":[{"u":ASSET_URL("a053"),"hx":56.0,"hy":65.8,"wx":11.9,"wy":36.4,"ph":-2.2796,"ww":80,"wh":69,"len":68.6}],"ico":ASSET_URL("a054"),"face":1,"mx":0.949,"my":0.391},{"w":183,"h":144,"body":ASSET_URL("a055"),"wings":[{"u":ASSET_URL("a056"),"hx":69.3,"hy":60.9,"wx":9.1,"wy":42.7,"ph":-2.3923,"ww":93,"wh":72,"len":84.0},{"u":ASSET_URL("a057"),"hx":123.9,"hy":56.7,"wx":4.9,"wy":29.4,"ph":-0.851,"ww":81,"wh":62,"len":76.3}],"ico":ASSET_URL("a058"),"face":-1,"mx":0.402,"my":0.442},{"w":120,"h":177,"body":ASSET_URL("a059"),"wings":[{"u":ASSET_URL("a060"),"hx":82.6,"hy":76.3,"wx":13.3,"wy":24.5,"ph":-1.2348,"ww":87,"wh":50,"len":73.5}],"ico":ASSET_URL("a061"),"face":-1,"mx":0.222,"my":0.399},{"w":113,"h":142,"body":ASSET_URL("a062"),"wings":[{"u":ASSET_URL("a063"),"hx":43.4,"hy":60.2,"wx":12.6,"wy":32.2,"ph":-2.2398,"ww":76,"wh":50,"len":63.7},{"u":ASSET_URL("a064"),"hx":70.0,"hy":63.0,"wx":14.0,"wy":24.5,"ph":-1.008,"ww":85,"wh":56,"len":70.7}],"ico":ASSET_URL("a065"),"face":-1,"mx":0.359,"my":0.315}],DRU=DRG.map(d=>d.ico),DRC=['#bfe3ff','#ff6a3a','#4fe0e8','#8a96ff'],DRH=[42,50,58,66],DRZ=DRG.map(d=>[d.w,d.h]),DRI=DRG.map(d=>{const i=new Image();i.src=d.body;return{b:i,w:d.wings.map(w=>{const j=new Image();j.src=w.u;return j})}});
const pimg=(k,ev)=>k==3?HVU[ev]:k==2?DRU[ev]:PTU[k],pcol=(k,ev)=>k==3?HVC[ev]:k==2?DRC[ev]:PCL[ev];
const WPU=[ASSET_URL("a066"),ASSET_URL("a067"),ASSET_URL("a068"),ASSET_URL("a069"),ASSET_URL("a070"),ASSET_URL("a071"),ASSET_URL("a072"),ASSET_URL("a073")],WPI=WPU.map(u=>{const i=new Image();i.src=u;return i}),PSZ=[[251, 300], [267, 300], [263, 300], [246, 132]],PTU=[ASSET_URL("a074"),ASSET_URL("a075"),DRU[0],HVU[0]],PTI=PTU.map(u=>{const i=new Image();i.src=u;return i}),HU=[[0.8446, 0.5267], [0.3636, 0.4124], [0.6925, 0.5234]],HD=[[50, 0, 91, 97], [86, 19, 88, 94], [67, 32, 74, 88]],WN=[["Sư Hống Kiếm","Cự Linh Kiếm","Huyết Long Kiếm","Tinh Hà Thần Kiếm"],["Phá Giáp Thương","Xích Xà Thương","Hỏa Long Thương","Tinh Hà Kích"]];
const WX={staff:[ASSET_URL("a076"),ASSET_URL("a077"),ASSET_URL("a078"),ASSET_URL("a079")],book:[ASSET_URL("a080"),ASSET_URL("a081"),ASSET_URL("a082"),ASSET_URL("a083")],bow:[ASSET_URL("a084"),ASSET_URL("a085"),ASSET_URL("a086"),ASSET_URL("a087")],dagger:[ASSET_URL("a088"),ASSET_URL("a089"),ASSET_URL("a090"),ASSET_URL("a091")],dagL:[ASSET_URL("a092"),ASSET_URL("a093"),ASSET_URL("a094"),ASSET_URL("a095")],dagR:[ASSET_URL("a096"),ASSET_URL("a097"),ASSET_URL("a098"),ASSET_URL("a099")]},WXI={};for(const k in WX)WXI[k]=WX[k].map(u=>{const i=new Image();i.src=u;return i});
const WSET={w:{def:0,L:[['⚔️ Hệ Kiếm','Kiếm Khách',WPU.slice(0,4),WN[0]],['🔱 Hệ Thương','Thương Thủ',WPU.slice(4),WN[1]]]},m:{def:1,L:[['📖 Hệ Triệu Hồi','Triệu Hồi Sư · sách',WX.book,['Cổ Thư Tập Sự','Pháp Điển Thực Tập','Thần Thư Chuyên Nghiệp','Thần Thư Ma Thuật Vô Thượng']],['🪄 Hệ Ma Thuật','Ma Thuật Sư · gậy',WX.staff,['Gậy Tập Sự','Gậy Thực Tập','Gậy Chuyên Nghiệp','Gậy Ma Thuật Vô Thượng']]]},a:{def:0,L:[['🏹 Hệ Xạ Thủ','Xạ Thủ · cung',WX.bow,['Cung Tập Sự','Cung Thực Tập','Cung Huyền Thoại','Cung Ma Thuật Vô Thượng']],['🗡 Hệ Thích Khách','Thích Khách · song đao',WX.dagger,['Giao Găm Song Hành · Tân Binh','Song Trâm Trăng Khuyết','Huyền Thoại Đôi','Phong Thần Đôi Đao']]]}};

const CRW=new WeakMap();
function CR(im,hpx,A){A=A||.55;const nh=im.naturalHeight,nw=im.naturalWidth;hpx=Math.max(12,Math.ceil(hpx/8)*8);if(hpx>=nh)return im;let m=CRW.get(im);if(!m){m=new Map();CRW.set(im,m)}const ky=hpx+':'+A;let c=m.get(ky);if(c)return c;
let src=im,sh=nh,sw=nw;while(sh/2>=hpx){const h2=Math.round(sh/2),w2=Math.max(1,Math.round(sw/2)),k=document.createElement('canvas');k.width=w2;k.height=h2;const x=k.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(src,0,0,w2,h2);src=k;sh=h2;sw=w2}
const tw=Math.max(1,Math.round(nw*hpx/nh));c=document.createElement('canvas');c.width=tw;c.height=hpx;const cx=c.getContext('2d');cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';cx.drawImage(src,0,0,tw,hpx);
try{const d=cx.getImageData(0,0,tw,hpx),a=d.data,o=new Uint8ClampedArray(a);for(let y=1;y<hpx-1;y++)for(let x=1;x<tw-1;x++){const i=(y*tw+x)*4,al=a[i+3];if(al<8)continue;for(let ch=0;ch<3;ch++){const p=(j)=>a[j+ch]*a[j+3]/255,v=p(i)*(1+4*A)-A*(p(i-4)+p(i+4)+p(i-tw*4)+p(i+tw*4));const u=Math.max(0,Math.min(al,v))*255/al;o[i+ch]=Math.min(255,u)}}d.data.set(o);cx.putImageData(d,0,0)}catch(e){}
m.set(ky,c);return c}
function WD(im,x,y,w,h,tier,col){const mt=g.getTransform(),sc=Math.hypot(mt.a,mt.b)||1;let c=im;try{c=CR(im,h*sc)}catch(e){}
if(tier>=3){const p=.5+.5*Math.sin(fr*.1);g.save();g.shadowColor=col;g.shadowBlur=(8+7*p)*(typeof DPR=='number'?DPR:1);g.drawImage(c,x,y,w,h);g.restore();
g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.08+.12*p;g.drawImage(c,x,y,w,h);g.shadowColor=col;g.shadowBlur=6;g.fillStyle='#fff';for(let i=0;i<5;i++){const u=(fr*.011+i*.2)%1,px=x+w*(.25+.5*(((i*7)%5)/4)),py=y+h*(1-u),al=Math.sin(u*Math.PI),r=1+1.4*al;g.globalAlpha=al*.95;g.fillRect(px-r,py-.5,r*2,1);g.fillRect(px-.5,py-r,1,r*2)}g.restore()}
else g.drawImage(c,x,y,w,h)}
function canRet(d){if(!d)return false;const sp=d<0?P.x-40:(W/s-40)-P.x;if(sp<80)return false;return !E.some(e=>e.hp>0&&(e.x-P.x)*d>0&&Math.abs(e.x-P.x)<240)}

const BWI=[[122,4,4,199,127,[124.65,-.607]],[121,3,4,199,133,[123.79,-.628]],[126,3,4,199,129,[130.13,-.6485]],[123,8,10,198,130,null]],BWC=[];
(function(){WXI.bow.forEach((im,k)=>{const f=BWI[k][5];if(!f)return;const go=()=>{try{const W=im.naturalWidth,H=im.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H),a=d.data,cs=Math.cos(Math.atan(f[1]));for(let y=Math.round(H*.07);y<H*.93;y++){const c0=f[0]+f[1]*y;for(let xx=Math.max(0,Math.floor(c0-4));xx<=Math.min(W-1,Math.ceil(c0+4));xx++){if(Math.abs(xx-c0)*cs<=2.1)a[(y*W+xx)*4+3]=0}}x.putImageData(d,0,0);const ni=new Image();ni.onload=()=>{BWC[k]=ni};ni.src=c.toDataURL('image/png')}catch(e){}};if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go)})})();
function bowTips(im,X,Y){if(!im||!im.naturalWidth)return null;const sp=BWI[PS[cur].tier|0];if(!sp)return null;const Lb=104,ww=im.naturalWidth/im.naturalHeight*Lb,cs=Math.cos(.54),sn=Math.sin(.54),pt=(px,py)=>{const lx=(px/sp[4]-.5)*ww,ly=(py/210-.5)*Lb;return[X+lx*cs+ly*sn,Y-lx*sn+ly*cs]},T=pt(sp[0],sp[1]),B=pt(sp[2],sp[3]);return{tx:T[0],ty:T[1],bx:B[0],by:B[1],mx:(T[0]+B[0])/2,my:(T[1]+B[1])/2}}
function bowStr(B,sx,sy,aa,at,rl,dr,tr,col){let nx=sx,ny=sy;if(!dr){let vib=0;if(aa&&at>=rl){const q=Math.min(1,(at-rl)/Math.max(.05,1-rl));vib=Math.sin(q*28)*(1-q)*(1-q)*6}const dx=B.bx-B.tx,dy=B.by-B.ty,L=Math.hypot(dx,dy)||1;nx=B.mx-dy/L*vib;ny=B.my+dx/L*vib}
g.save();g.lineCap='round';g.lineJoin='round';const path=()=>{g.beginPath();g.moveTo(B.tx,B.ty);g.lineTo(nx,ny);g.lineTo(B.bx,B.by);g.stroke()};
g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=2;g.save();g.translate(.8,.8);path();g.restore();
if(tr>=3){g.shadowColor=col;g.shadowBlur=8;g.strokeStyle='#d8fbff';g.lineWidth=1.4;path();g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.lineWidth=2.6;g.strokeStyle=col;path()}else{g.strokeStyle='#efe4c8';g.lineWidth=1.1;path()}
g.restore()}
function WPNIMG(){const t=CHR[cur].t,p=PS[cur];if(t=='m')return(p.br==0?WXI.book:WXI.staff)[p.tier];if(t=='a')return p.br==1?WXI.dagger[p.tier]:(BWC[p.tier]||WXI.bow[p.tier]);return null}
function WCARD(){const S=WSET[CHR[cur].t],p=PS[cur],l=S.L[p.br<0?S.def:p.br];return'<div style="text-align:center"><img src="'+l[2][p.tier]+'" style="height:104px;filter:drop-shadow(0 0 8px #ffd76a)"><br>⚔️ Nhận vũ khí: <b>'+l[3][p.tier]+'</b></div>'}
let wo=0;
function bar(v,m,c){return'<div style="height:7px;background:#000a;border-radius:4px;overflow:hidden;margin-top:2px"><div style="width:'+Math.max(0,Math.min(100,v/m*100))+'%;height:100%;background:'+c+'"></div></div>'}
function ap5(i){const n=Math.min(5,PS[cur].pts);if(n>0){PS[cur].pts-=n;PS[cur].al[i]+=n;ui()}}
function charUI(){const p=PS[cur],t=p.tier,c=CHR[cur],S=WSET[c.t],wl=S.L[p.br<0?S.def:p.br];
let h='<div style="display:flex;gap:6px;margin:6px 0">'+CHR.map((x,i)=>'<div onclick="sw('+i+')" style="flex:1;border:2px solid '+(i==cur?'#ffd54a':'#5a4630')+';border-radius:8px;background:#140d0a;text-align:center;padding:2px 0;cursor:pointer;opacity:'+(i==cur?1:.6)+'"><img src="'+PIC[i]+'" style="height:34px;max-width:100%;object-fit:contain"><div style="font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px">'+CN(i)+'</div></div>').join('')+'</div>';
h+='<div class="cc"><img src="'+PIC[cur]+'"><div style="flex:1;min-width:0"><b style="font-size:15px">'+CN(cur)+'</b> <button class="sm" onclick="RK.name(cur)" title="Đặt / đổi tên" style="padding:1px 6px">✏</button> <span class="tg">Lv'+P.lv+'</span><div class="st">'+CL[c.t]+' · '+TN[t]+(p.br>=0?' · '+c.br[p.br].n:'')+'</div><div class="st">🧘 '+ZC.nm()+'</div><div class="st" style="margin-top:4px">❤ '+Math.max(0,Math.round(P.hp))+'/'+mx()+'</div>'+bar(P.hp,mx(),'#d04040')+'<div class="st" style="margin-top:3px">💧 '+Math.round(P.mp)+'/'+mm()+'</div>'+bar(P.mp,mm(),'#4a8ae0')+'</div></div>';
const sd=Math.round(SX('sdmg')*10)/10,as=Math.round(Math.min(100,SX('aspd'))*10)/10,cs=Math.round(Math.min(100,SX('cspd'))*10)/10;
h+='<div class="cs"><div><span>⚔ Công</span><b>'+atk()*5+'</b></div><div><span>🛡 Thủ</span><b>'+df()+'</b></div><div><span>❤ HP</span><b>'+mx()+'</b></div><div><span>💧 MP</span><b>'+mm()+'</b></div></div><div class="cs c3"><div><span>ST kỹ năng</span><b>+'+sd+'%</b></div><div><span>Tốc đánh</span><b>+'+as+'%</b></div><div><span>Tốc niệm</span><b>+'+cs+'%</b></div></div>';
h+='<div class="dt" style="min-height:0"><div style="display:flex;justify-content:space-between;align-items:center"><b>Tiềm năng</b><span class="tg" style="'+(p.pts?'background:#8a6420':'')+'">Điểm: '+p.pts+'</span></div>'+AN.map((a,i)=>'<div class="ar"><span><b>'+a[0]+' '+p.al[i]+'</b><br><small>'+a[1]+'</small></span><span><button class="sm" '+(p.pts?'':'disabled')+' onclick="ap('+i+')">+1</button><button class="sm" '+(p.pts?'':'disabled')+' onclick="ap5('+i+')">+5</button></span></div>').join('')+'</div>';
h+='<div class="st" style="margin-top:8px"><b>Kỹ năng</b></div><div class="sk">'+SK.map((k,i)=>ok(i)?'<div><span style="font-size:20px">'+k[1]+'</span><span><b>'+k[0]+'</b><br><small>'+k[2]+'MP · '+(k[3]/60).toFixed(1)+'s</small></span></div>':'<div style="opacity:.45"><span style="font-size:20px">🔒</span><small>Mở khi chuyển chức '+(i>=5?3:i>=4?2:1)+'</small></div>').join('')+'</div>';
h+='<details class="wd" '+(wo?'open':'')+' ontoggle="wo=this.open?1:0"><summary><img src="'+wl[2][t]+'" style="height:30px;vertical-align:middle"> <b>'+wl[3][t]+'</b> <small>· xem các cấp vũ khí</small></summary>'+wpnUI()+'</details>';
return h}
function wpnUI(){const S=WSET[CHR[cur].t],p=PS[cur],t=p.tier,SN=['Tân Thủ','Chuyển chức 1','Chuyển chức 2','Chuyển chức 3'];return'<div class="dt"><b>Vũ khí '+CL[CHR[cur].t]+'</b> <small>(đổi theo từng lần chuyển chức)</small>'+S.L.map((l,ln)=>{const mine=p.br==ln||(p.br<0&&ln==S.def);return'<div style="margin-top:6px;opacity:'+(mine||p.br<0?1:.55)+'"><small><b>'+l[0]+'</b> · '+l[1]+(p.br<0?' · chọn khi chuyển chức 1':'')+'</small><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:3px">'+[0,1,2,3].map(i=>{const un=p.br<0?(ln==S.def&&i==0):(p.br==ln&&i<=t),now=mine&&i==t&&p.br>=0||(p.br<0&&ln==S.def&&i==0);return'<div style="border:2px solid '+(now?'#ffd54a':un?'#8a6d3b':'#3a2a20')+';border-radius:6px;background:#140d0a;text-align:center;padding:3px 0;'+(un?'':'filter:brightness(.35) grayscale(.6)')+'"><img src="'+l[2][i]+'" style="height:70px;max-width:100%;object-fit:contain"><div style="font-size:9px;line-height:1.2">'+l[3][i]+'</div><div style="font-size:9px;opacity:.7">'+SN[i]+'</div></div>'}).join('')+'</div></div>'}).join('')+'</div>'}


const CL={w:'Chiến binh',m:'Phù thủy',a:'Cung thủ'},TN=['Tân Thủ','Chuyển chức 1','Chuyển chức 2','Chuyển chức 3'],NV='<div class="dt">Hãy vào 🏘 Làng Tân Thủ để dùng dịch vụ này.</div>';
/* ===== Thanh tab menu (thiết kế lại) ===== */
const NAVI=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`,
NAV=[
['Túi đồ','Túi',NAVI('<rect x="5" y="7" width="14" height="14" rx="4"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/><path d="M5 12.5h14"/><path d="M10.5 12v3h3v-3"/>')],
['Nhân vật','Nhân vật',NAVI('<circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c0-4 3-6.6 7-6.6s7 2.6 7 6.6"/>')],
['Thợ rèn','Rèn',NAVI('<path d="M3.5 7.5h14.5c0 2.3-1.7 3.8-4 4.1V14h2.5v3.5h-9V14H10v-2.4C6.6 11.2 4.6 9.7 3.5 7.5z"/><path d="M18 7.5h2.5"/><path d="M6 20.5h12"/>')],
['Tạp hóa','Tạp hóa',NAVI('<path d="M3 4h2.6l2.2 11.2h9.6L20 8H6.6"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>')],
['Dược điếm','Dược',NAVI('<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M12 8.5v7" transform="rotate(-45 12 12)"/>')],
['Nhiệm vụ','Nhiệm vụ',NAVI('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M12 7.5v5.5"/><path d="M12 16.6h.01" stroke-width="2.4"/>')],
['Bản đồ','Bản đồ',NAVI('<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>')],
['Hợp trang bị','Hợp',NAVI('<path d="M9.5 3h5M10.5 3v6L5.2 18.4A2 2 0 0 0 7 21.5h10a2 2 0 0 0 1.8-3.1L13.5 9V3"/><path d="M7.6 15.5h8.8"/>')],
['Tu tiên','Tu tiên',NAVI('<path d="M12 3.5c2.4 2.6 3.2 5.6 0 9.5-3.2-3.9-2.4-6.9 0-9.5z"/><path d="M4 9c3.4-.2 6 1.6 8 4.8-3.2 1.2-6.6.2-8-4.8z"/><path d="M20 9c-3.4-.2-6 1.6-8 4.8 3.2 1.2 6.6.2 8-4.8z"/><path d="M5 18c4 2 10 2 14 0"/>')],
['Thú nuôi','Thú',NAVI('<ellipse cx="6" cy="10.5" rx="1.7" ry="2.3"/><ellipse cx="9.6" cy="6.3" rx="1.7" ry="2.3"/><ellipse cx="14.4" cy="6.3" rx="1.7" ry="2.3"/><ellipse cx="18" cy="10.5" rx="1.7" ry="2.3"/><path d="M12 11.5c-3 0-5.5 3-5.5 5.3 0 1.8 1.5 2.4 3 2.1 1-.2 1.6-.5 2.5-.5s1.5.3 2.5.5c1.5.3 3-.3 3-2.1 0-2.3-2.5-5.3-5.5-5.3z"/>')],
['Cánh','Cánh',NAVI('<path d="M3.5 19C2.5 11 7 5.5 20.5 4.5c-.6 4-2.8 7.2-6.6 9.2 1.4.1 2.5.6 3.4 1.4-3 .2-5.3 1.2-7 3 .6.1 1.1.4 1.5.8-3.3.8-6.6.7-9.8.1z"/><path d="M7 17c2-4 5-7 9.5-9"/>')],
['Chỉ số','Chỉ số',NAVI('<path d="M5.5 20v-7.5M12 20V5M18.5 20v-10.5"/><path d="M3 20.8h18"/>')],
['Linh điền','Trồng',NAVI('<path d="M12 21v-9"/><path d="M12 12c0-4 3-6.5 7-6.5 0 4-2.8 6.5-7 6.5z"/><path d="M12 15c0-3-2.4-5-6-5 0 3 2.2 5 6 5z"/><path d="M7 21h10"/>')],
['Luyện đan','Đan',NAVI('<path d="M5 9h14v3a7 7 0 0 1-14 0z"/><path d="M4 9h16"/><path d="M8 21l1.2-2.2M16 21l-1.2-2.2"/><path d="M9 5.5c0-1 1-1.3 1-2.3M13 5.5c0-1 1-1.3 1-2.3"/>')],
['Khai khoáng','Mỏ',NAVI('<path d="M5 20L13 12"/><path d="M14 5c3-1.2 6 .2 7 3"/><path d="M14 5c-2 2.6-2 6.2.4 8.6"/><path d="M21 8c-2.6 0-6 1.4-7.6 3.4"/>')]
,['Lò Thánh','Thánh',NAVI('<path d="M12 3l2.6 5.4 5.9.9-4.3 4.2 1 5.9L12 16.6 6.8 19.4l1-5.9L3.5 9.3l5.9-.9z"/>')]
,['Vòng quay','Quay',NAVI('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5v6.5M12 14v6.5M3.5 12H10M14 12h6.5"/>')]
],
NAVLK=[2,3,7,15],
fmtN=n=>{try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return ''+n}};
function tabBar(p){
 let rd=0;try{rd=ZC.tx()=='SẴN SÀNG ĐỘT PHÁ'}catch(e){}
 const dot=[BAG.length>=capN()*.9,p.pts>0,0,0,0,qsDot(),0,0,rd,p.tier>=1&&!p.pet,0,0,FM.rdy(),0,0];
 const tabs=NAV.map((n,i)=>`<button class="tbt${tab==i?' on':''}${!vil&&NAVLK.includes(i)?' lk':''}" onclick="tb(${i})" title="${n[0]}${!vil&&NAVLK.includes(i)?' (cần ở Làng)':''}">${n[2]}<span>${n[1]}</span>${dot[i]?'<i class="nd"></i>':''}</button>`).join('');
 const cur=NAV[tab]||NAV[0];
 return `<div class="bx"><div class="bhw"><div class="bhd"><div class="bti">${cur[2]}<b>${cur[0]}</b></div><div class="bac">`
 +`<button class="ib" title="Cẩm nang" onclick="GD.open()">${NAVI('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6"/>')}</button>`
+`<button class="ib" title="Lưu game" onclick="sv();msg='💾 Đã lưu';ui()">${NAVI('<path d="M5 3.5h11l3.5 3.5v13.5H5z"/><path d="M8 3.5v5h7v-5"/><path d="M8 20.5v-6.5h8v6.5"/>')}</button>`
 +`<button class="ib" title="Menu" onclick="mn(0)">${NAVI('<path d="M5 7h14M5 12h14M5 17h14"/>')}</button>`
 +`<button class="ib x" title="Đóng" onclick="tg()">${NAVI('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div></div>`
 +`<div class="tbar">${tabs}</div></div>`
 +`<div class="rsr"><span class="chip" title="Vàng">💰 ${fmtN(gold)}</span><span class="chip" title="Mảnh chế tạo">🔹 ${fmtN(frag)}</span>`
 +`<button class="chip" ${hpP<1?'disabled':''} onclick="up(0)" title="Dùng bình HP (Q)">🧪 ${hpP}<small>Dùng</small></button>`
 +`<button class="chip" ${mpP<1?'disabled':''} onclick="up(1)" title="Dùng bình MP (E)">💧 ${mpP}<small>Dùng</small></button></div>`
 +(msg?`<div class="st msgl">${msg}</div>`:'');
}
/* ===== HỆ THỐNG NHIỆM VỤ MỚI: Chủ tuyến · Hằng ngày · Hằng tuần · Thành tựu ===== */
const QCH=[
{t:'Hoang Mạc Sơ Hiện',s:'Trưởng Lão Thanh Vân: "Hư Không nứt vỡ, quái vật tràn vào Hoang Mạc. Đạo hữu hãy ra tay dọn sạch bìa làng trước đã."',o:[['kill',20,'Hạ {n} quái Hư Không'],['lv',5,'Đạt cấp {n}']],r:{g:40,x:40,h:2,m:2,e:[1]}},
{t:'Linh Khí Nhập Thể',s:'"Muốn đứng vững nơi Hoang Mạc, phải dẫn linh khí vào thể. Hãy tu luyện đột phá và làm quen với chiêu thức."',o:[['rn',1,'Đột phá cảnh giới Luyện Khí'],['cast',30,'Thi triển {n} kỹ năng']],r:{g:60,x:60,p:3,f:2}},
{t:'Thử Luyện Tinh Anh',s:'"Trong bầy quái có kẻ mạnh hơn hẳn, mang ánh sao trên trán. Hạ được chúng mới đủ tư cách rời làng."',o:[['elite',5,'Hạ {n} quái Tinh Anh ⭐'],['lv',15,'Đạt cấp {n}']],r:{g:80,x:80,e:[2],h:3}},
{t:'Chuyển Chức Lập Đạo',s:'"Lv20 là cánh cửa đầu tiên. Hãy chọn con đường của riêng mình: gậy, sách, cung hay song đao."',o:[['tier',1,'Hoàn thành chuyển chức lần 1']],r:{g:100,x:100,p:5,e:[2],k:200}},
{t:'Hầm Ngục Đầu Tiên',s:'"Dưới lòng đất có ổ quái cổ xưa canh giữ báu vật. Vào Hầm Ngục, hạ Trùm Thần Thoại rồi trở ra."',o:[['dg',1,'Hoàn thành {n} Hầm Ngục'],['elite',15,'Hạ {n} quái Tinh Anh ⭐']],r:{g:120,x:120,f:5,e:[2,2]}},
{t:'Lửa Rèn Thần Binh',s:'"Thợ rèn nói: thần binh sinh ra từ lửa và búa. Cường hóa và chế tạo, đừng sợ thất bại."',o:[['enhok',5,'Cường hóa thành công {n} lần'],['craft',1,'Chế tạo {n} trang bị'],['eqr',3,'Đang mặc {n} món Hiếm trở lên',2]],r:{g:150,x:150,f:8,e:[3],m:5}},
{t:'Kim Đan Kết Tụ',s:'"Linh khí hóa lỏng, rồi kết thành đan. Kim Đan thành, Hoang Mạc này mới thật sự mở cửa với ngươi."',o:[['rn',3,'Đột phá cảnh giới Kim Đan'],['tier',2,'Hoàn thành chuyển chức lần 2']],r:{g:200,x:200,p:8,e:[3],w:[0,5]}},
{t:'Săn Trùm Thế Giới',s:'"Boss Thế Giới tái sinh mỗi nửa canh giờ. Hạ chúng, mang về mảnh chế tạo cho thợ rèn."',o:[['boss',2,'Hạ {n} Boss'],['kill',500,'Hạ {n} quái']],r:{g:250,x:250,f:15,e:[3,3],h:5}},
{t:'Lôi Kiếp Giáng Thế',s:'"Nguyên Anh xuất khiếu, thiên lôi giáng xuống thử lòng. Vượt qua kiếp này, ngươi không còn là phàm nhân."',o:[['rn',4,'Đột phá cảnh giới Nguyên Anh'],['brk',2,'Đột phá thành công {n} lần']],r:{g:400,x:400,p:10,e:[4],f:20,w:[0,10]}},
{t:'Ma Thần Thức Tỉnh',s:'"Cổng Linh Giới bị Ma Thần phong ấn. Chỉ kẻ hạ được hắn mới được bước qua."',o:[['mt',1,'Hạ Ma Thần'],['boss',10,'Hạ {n} Boss']],r:{g:800,x:800,p:15,e:[4,4],f:40,w:[1,5]}},
{t:'Linh Giới Chung Chiến',s:'"Bên kia cổng là chiến trường tối hậu. Luyện Hư, Hợp Thể, Đại Thừa... đường tu tiên không có điểm dừng."',o:[['rn',6,'Đột phá cảnh giới Luyện Hư'],['kill',3000,'Hạ {n} quái']],r:{g:1500,x:1500,p:20,e:[4,4,4],f:80,w:[1,10]}}
];
const QDP=[['kill',80,'Quét Hư Không','Hạ {n} quái',20],['kill',250,'Thanh Trừ Bầy Quái','Hạ {n} quái',20],['elite',4,'Săn Tinh Anh','Hạ {n} Tinh Anh ⭐',20],['cast',60,'Luyện Chiêu','Thi triển {n} kỹ năng',15],['pot',3,'Dưỡng Sinh','Dùng {n} bình thuốc',10],['dg',1,'Xông Hầm Ngục','Hoàn thành {n} Hầm Ngục',25],['enhok',3,'Rèn Luyện','Cường hóa thành công {n} lần',20],['boss',1,'Trảm Trùm','Hạ {n} Boss',25]];
const QWP=[['kill',1500,'Thanh Trừ Hoang Mạc','Hạ {n} quái',{g:150,x:150,f:10,e:[2]}],['elite',60,'Tinh Anh Chi Họa','Hạ {n} Tinh Anh ⭐',{g:200,x:120,f:12,p:2}],['boss',4,'Phá Trùm Liên Hoàn','Hạ {n} Boss',{g:250,f:20,e:[3]}],['dg',7,'Thâm Nhập Hầm Ngục','Hoàn thành {n} Hầm Ngục',{g:200,e:[3],m:5}],['cast',800,'Vạn Pháp Quy Tông','Thi triển {n} kỹ năng',{x:250,p:3,h:5}],['enhok',20,'Thiên Chùy Bách Luyện','Cường hóa thành công {n} lần',{f:15,m:10,g:150}]];
const QMS=[[20,{g:30,h:2}],[40,{g:50,f:3,m:2}],[60,{g:80,p:2,f:4,nt:1}],[80,{g:100,e:[2],f:5,nt:2}],[100,{g:150,p:3,e:[3],w:[0,2],nt:3}]];
const QAC=[['kill','⚔️','Sát Quái','Hạ {n} quái',[100,1000,10000,50000]],['elite','⭐','Thợ Săn Tinh Anh','Hạ {n} Tinh Anh',[10,100,1000,5000]],['boss','👑','Diệt Trùm','Hạ {n} Boss',[3,20,100,500]],['dg','🕳','Thám Hiểm Hầm Ngục','Hoàn thành {n} Hầm Ngục',[3,20,100,300]],['cast','✨','Pháp Thuật Vô Biên','Thi triển {n} kỹ năng',[200,2000,20000,100000]],['enhok','🔨','Thiên Chùy','Cường hóa thành công {n} lần',[5,50,300,1000]],['craft','⚒','Thợ Rèn Tài Ba','Chế tạo {n} trang bị',[1,10,50,200]],['brk','🌟','Đạo Đồ Rộng Mở','Đột phá thành công {n} lần',[1,3,6,8]],['lv','📈','Cao Thủ','Đạt cấp {n}',[20,50,80,100]]];
const QAR=[{g:20,x:20,h:1},{g:60,f:3,p:1},{g:150,f:8,p:3,e:[2]},{g:400,f:20,p:5,e:[3]}];
const QRN=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
let QS=null,qsub=0;
const qsDay=()=>{const d=new Date();return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate()},
qsWeek=()=>{const d=new Date(),t=new Date(d.getFullYear(),d.getMonth(),d.getDate());t.setDate(t.getDate()-(t.getDay()+6)%7);return t.getFullYear()*1e4+(t.getMonth()+1)*100+t.getDate()},
qsRng=s=>{let a=(s>>>0)||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
function qsNew(){const T={};T.kill=typeof NK!='undefined'?NK|0:0;return{v:1,T,ch:0,sc:Object.assign({},T),dk:0,wk:0,dq:[],wq:[],act:0,am:[0,0,0,0,0],sd:{},sw:{},ac:{}}}
function qsLoad(){try{const d=JSON.parse(localStorage.getItem('kthm_qs'));if(d&&d.v)return d}catch(e){}return qsNew()}
function qsSave(){try{localStorage.setItem('kthm_qs',JSON.stringify(QS))}catch(e){}}
function qsChk(){if(!QS)QS=qsLoad();const dk=qsDay(),wk=qsWeek();if(QS.dk!==dk){const r=qsRng(dk),pool=QDP.map((_,i)=>i),pick=[];while(pick.length<6){const j=Math.floor(r()*pool.length);pick.push(pool.splice(j,1)[0])}QS.dk=dk;QS.sd=Object.assign({},QS.T);QS.dq=pick.map(i=>({i,c:0,n2:0}));QS.act=0;QS.am=[0,0,0,0,0]}
if(QS.wk!==wk){const r=qsRng(wk+7),pool=QWP.map((_,i)=>i),pick=[];while(pick.length<4){const j=Math.floor(r()*pool.length);pick.push(pool.splice(j,1)[0])}QS.wk=wk;QS.sw=Object.assign({},QS.T);QS.wq=pick.map(i=>({i,c:0,n2:0}))}}
function qsP(o,sn){const t=o[0],p=PS[cur];if(t=='lv')return P.lv;if(t=='rn')return p.cv.r+1;if(t=='tier')return p.tier;if(t=='pet')return p.pet?1:0;if(t=='wg')return p.wg|0;if(t=='eqr')return EQ.filter(i=>i&&i.r>=o[3]).length;return Math.max(0,(QS.T[t]|0)-((sn&&sn[t])|0))}
const qsChD=()=>{const c=QCH[QS.ch];return!!c&&c.o.every(o=>qsP(o,QS.sc)>=o[1])};
function QE(t,n=1){if(!QS)qsChk();QS.T[t]=(QS.T[t]|0)+n;try{if(vil||!P)return;if(QS.nt!==QS.ch&&qsChD()){QS.nt=QS.ch;DT.push({x:P.x,y:200,s:'📖 Hoàn thành chương: '+QCH[QS.ch].t,c:'#ffe08a',g:1,l:130})}QS.dq.forEach(q=>{const d=QDP[q.i];if(!q.n2&&qsP(d,QS.sd)>=d[1]){q.n2=1;DT.push({x:P.x,y:175,s:'✔ '+d[2],c:'#9fe0a0',g:1,l:90})}})}catch(e){}}
function qsGive(r){const L=P.lv,o=[];if(r.g){const v=Math.round(r.g*L);gold+=v;o.push('💰'+fmtN(v))}if(r.x){const v=Math.round(r.x*L*1.5);P.xp+=v;o.push('✨'+fmtN(v))}if(r.f){frag+=r.f;o.push('🔹'+r.f)}if(r.nt){HL.addNT(r.nt);o.push('🌙'+r.nt)}if(r.h){hpP+=r.h;o.push('🧪'+r.h)}if(r.m){mpP+=r.m;o.push('💧'+r.m)}if(r.p){PS[cur].pts+=r.p;o.push('⭐'+r.p+' điểm')}(r.e||[]).forEach(q=>{const it=gen(L,q);if(BAG.length<capN()){BAG.push(it);o.push(SL[it.s][1]+' '+RN[q])}else{const v=sell(it);gold+=v;o.push('💰'+v+' (túi đầy)')}});if(r.w){WFA(r.w[0],r.w[1]);o.push('🪽'+r.w[1])}if(r.k){const p=pet();if(p){p.xp+=r.k;pcheck(p);o.push('🐾'+r.k)}}return o}
function qsChips(r){const L=P.lv,o=[];if(r.g)o.push('💰 '+fmtN(Math.round(r.g*L)));if(r.x)o.push('✨ '+fmtN(Math.round(r.x*L*1.5)));if(r.f)o.push('🔹 '+r.f);if(r.nt)o.push('🌙 '+r.nt+' Nguyệt Thạch');if(r.h)o.push('🧪 '+r.h);if(r.m)o.push('💧 '+r.m);if(r.p)o.push('⭐ '+r.p+' điểm');(r.e||[]).forEach(q=>o.push('<span style="color:'+RC[q]+';border-color:'+RC[q]+'">📦 '+RN[q]+'</span>'));if(r.w)o.push('🪽 '+r.w[1]);if(r.k)o.push('🐾 '+r.k);return'<div class="qr">'+o.map(x=>x.startsWith('<span')?x:'<span>'+x+'</span>').join('')+'</div>'}
const qsTx=o=>o[2].replace('{n}',fmtN(o[1]));
function qsBar(v,n){return'<div class="qb"><i style="width:'+Math.min(100,v/n*100)+'%"></i><span>'+fmtN(Math.min(v,n))+' / '+fmtN(n)+'</span></div>'}
function qsOb(o,sn){const v=qsP(o,sn),d=v>=o[1];return'<div class="qo"><div>'+(d?'✅':'⬜')+' '+qsTx(o)+'</div>'+qsBar(v,o[1])+'</div>'}
function qsMsg(a,t){msg='🎁 '+t+(a.length?': '+a.join(' · '):'');qsSave();sv();ui()}
function qsCh(){qsChk();const c=QCH[QS.ch];if(!c||!qsChD())return;const a=qsGive(c.r);QS.ch++;QS.sc=Object.assign({},QS.T);QS.nt=-1;qsMsg(a,'Hoàn thành "'+c.t+'"')}
function qsDq(k){qsChk();const q=QS.dq[k],d=QDP[q.i];if(q.c||qsP(d,QS.sd)<d[1])return;q.c=1;QS.act+=d[4];const a=qsGive({g:12,x:12});qsMsg(a,'+'+d[4]+' hoạt lực')}
function qsMs(k){qsChk();if(QS.am[k]||QS.act<QMS[k][0])return;QS.am[k]=1;qsMsg(qsGive(QMS[k][1]),'Rương hoạt lực '+QMS[k][0])}
function qsWq(k){qsChk();const q=QS.wq[k],d=QWP[q.i];if(q.c||qsP(d,QS.sw)<d[1])return;q.c=1;qsMsg(qsGive(d[4]),'Nhiệm vụ tuần')}
function qsAc(k){qsChk();const d=QAC[k],c=QS.ac[d[0]]|0;if(c>=4||qsP([d[0]],{})<d[4][c])return;QS.ac[d[0]]=c+1;qsMsg(qsGive(QAR[c]),'Thành tựu "'+d[2]+'"')}
function qsAll(){qsChk();const b0={g:gold,f:frag,h:hpP,m:mpP,p:PS[cur].pts,x:P.xp,b:BAG.length};let a=[],n=0;while(QCH[QS.ch]&&qsChD()&&n<20){a=a.concat(qsGive(QCH[QS.ch].r));QS.ch++;QS.sc=Object.assign({},QS.T);n++}QS.dq.forEach(q=>{const d=QDP[q.i];if(!q.c&&qsP(d,QS.sd)>=d[1]){q.c=1;QS.act+=d[4];a=a.concat(qsGive({g:12,x:12}));n++}});QMS.forEach((m,k)=>{if(!QS.am[k]&&QS.act>=m[0]){QS.am[k]=1;a=a.concat(qsGive(m[1]));n++}});QS.wq.forEach(q=>{const d=QWP[q.i];if(!q.c&&qsP(d,QS.sw)>=d[1]){q.c=1;a=a.concat(qsGive(d[4]));n++}});QAC.forEach(d=>{let c=QS.ac[d[0]]|0;while(c<4&&qsP([d[0]],{})>=d[4][c]){a=a.concat(qsGive(QAR[c]));c++;n++}QS.ac[d[0]]=c});if(!n){msg='Chưa có phần thưởng nào để nhận';ui();return}QS.nt=-1;{const t=[];if(gold>b0.g)t.push('💰'+fmtN(gold-b0.g));if(P.xp>b0.x)t.push('✨'+fmtN(Math.round(P.xp-b0.x)));if(frag>b0.f)t.push('🔹'+(frag-b0.f));if(hpP>b0.h)t.push('🧪'+(hpP-b0.h));if(mpP>b0.m)t.push('💧'+(mpP-b0.m));if(PS[cur].pts>b0.p)t.push('⭐'+(PS[cur].pts-b0.p)+' điểm');if(BAG.length>b0.b)t.push('📦'+(BAG.length-b0.b)+' trang bị');msg='🎁 Nhận '+n+' phần thưởng: '+t.join(' · ')}qsSave();sv();ui()}
function qsCnt(){qsChk();const c={0:qsChD()?1:0,1:0,2:0,3:0,4:(typeof cq!='undefined'&&cq&&cqOK())?1:0};QS.dq.forEach(q=>{const d=QDP[q.i];if(!q.c&&qsP(d,QS.sd)>=d[1])c[1]++});QMS.forEach((m,k)=>{if(!QS.am[k]&&QS.act>=m[0])c[1]++});QS.wq.forEach(q=>{const d=QWP[q.i];if(!q.c&&qsP(d,QS.sw)>=d[1])c[2]++});QAC.forEach(d=>{const k=QS.ac[d[0]]|0;if(k<4&&qsP([d[0]],{})>=d[4][k])c[3]++});return c}
const qsDot=()=>{try{const c=qsCnt();return c[0]+c[1]+c[2]+c[3]+c[4]>0}catch(e){return 0}};
function qsHud(){try{qsChk();const c=QCH[QS.ch];if(!c)return['Hoang Mạc Truyện','Săn quái '+Q.k+'/'+Q.n];const o=c.o.find(o=>qsP(o,QS.sc)<o[1]);if(!o)return[c.t,'✔ Mở 📖 để nhận thưởng'];let tx=qsTx(o);if(tx.length>14)tx=tx.slice(0,13)+'…';return[c.t,qsP(o,QS.sc)+'/'+o[1]+' '+tx]}catch(e){return['Chính tuyến','']}}
const qsCd=ms=>{const h=Math.floor(ms/36e5),d=Math.floor(h/24);return d>0?d+' ngày '+(h%24)+' giờ':h+' giờ '+Math.floor(ms%36e5/6e4)+' phút'};
function qsUI(){qsChk();const c=qsCnt(),T=[['📖','Chủ tuyến'],['📅','Hằng ngày'],['🗓','Hằng tuần'],['🏅','Thành tựu'],['🎓','Chuyển chức']];let tot=c[0]+c[1]+c[2]+c[3]+c[4];
let h='<div class="qpl">'+T.map((x,i)=>'<button class="'+(qsub==i?'on':'')+'" onclick="qsub='+i+';ui()"><span style="font-size:17px">'+x[0]+'</span><br><span style="font-size:10px">'+x[1]+'</span>'+(c[i]?'<i class="nd2"></i>':'')+'</button>').join('')+'</div>';
if(tot)h+='<div class="qa"><button onclick="qsAll()" style="background:#8a6420;border-color:#ffd54a">🎁 Nhận tất cả ('+tot+')</button></div>';
if(qsub==0){const i=QS.ch;if(!QCH[i])h+='<div class="qc done"><h4>🏆 Hoang Mạc Truyện — Hoàn tất</h4><div class="qs">Ngươi đã đi hết con đường từ Thanh Vân Tiên Thôn tới Linh Giới. Đường tu tiên còn dài, hãy tiếp tục với nhiệm vụ ngày, tuần và thành tựu.</div></div>';
else{const ch=QCH[i],dn=qsChD();h+='<div class="qc'+(dn?' done':'')+'"><div class="st">Chương '+(i+1)+' / '+QCH.length+'</div><h4>📖 '+ch.t+'</h4><div class="qs">'+ch.s+'</div>'+ch.o.map(o=>qsOb(o,QS.sc)).join('')+'<div class="st" style="margin-top:6px">Phần thưởng</div>'+qsChips(ch.r)+'<div class="qa"><button '+(dn?'':'disabled')+' onclick="qsCh()">'+(dn?'🎁 Hoàn thành chương':'Chưa đủ điều kiện')+'</button></div></div>';
if(QCH[i+1])h+='<div class="qc" style="opacity:.6"><div class="st">Chương kế</div><b>🔒 '+QCH[i+1].t+'</b><div class="st">'+QCH[i+1].o.map(qsTx).join(' · ')+'</div></div>'}
h+='<div class="qc"><b>🐺 Săn Hư Không vô tận</b><div class="st">Hạ quái liên tục, mỗi mốc hoàn thành nhận kinh nghiệm (mỗi lần mốc tăng thêm 10 quái).</div>'+qsBar(Q.k,Q.n)+'</div>'}
else if(qsub==1){const ms=(()=>{const n=new Date();n.setHours(24,0,0,0);return n-new Date()})();h+='<div class="qc"><div style="display:flex;justify-content:space-between"><b>⚡ Hoạt lực: '+QS.act+' / 100</b><span class="st">Làm mới sau '+qsCd(ms)+'</span></div>'+qsBar(QS.act,100)+'<div class="qm">'+QMS.map((m,k)=>'<button class="'+(QS.am[k]?'got':QS.act>=m[0]?'rdy':'')+'" '+((QS.am[k]||QS.act<m[0])?'disabled':'')+' onclick="qsMs('+k+')">🎁<br><small>'+m[0]+'</small></button>').join('')+'</div><details><summary class="st" style="cursor:pointer">Xem phần thưởng rương</summary>'+QMS.map(m=>'<div style="border-top:1px solid #2e2018;margin-top:4px"><b style="font-size:12px">🎁 '+m[0]+' hoạt lực</b>'+qsChips(m[1])+'</div>').join('')+'</details></div>';
h+=QS.dq.map((q,k)=>{const d=QDP[q.i],v=qsP(d,QS.sd),dn=v>=d[1];return'<div class="qc'+(dn?' done':'')+'"><div style="display:flex;justify-content:space-between"><b>'+d[2]+'</b><span class="st">+'+d[4]+' hoạt lực</span></div><div class="qo"><div>'+(dn?'✅':'⬜')+' '+d[3].replace('{n}',fmtN(d[1]))+'</div>'+qsBar(v,d[1])+'</div><div class="qa"><button '+((q.c||!dn)?'disabled':'')+' onclick="qsDq('+k+')">'+(q.c?'Đã nhận':dn?'🎁 Nhận thưởng':'Đang thực hiện')+'</button></div></div>'}).join('')}
else if(qsub==2){const ms=(()=>{const n=new Date();n.setHours(24,0,0,0);n.setDate(n.getDate()+(8-(n.getDay()||7))%7);return n-new Date()})();h+='<div class="st" style="margin:6px 0">🗓 Nhiệm vụ tuần · làm mới sau '+qsCd(ms)+'</div>'+QS.wq.map((q,k)=>{const d=QWP[q.i],v=qsP(d,QS.sw),dn=v>=d[1];return'<div class="qc'+(dn?' done':'')+'"><b>'+d[2]+'</b><div class="qo"><div>'+(dn?'✅':'⬜')+' '+d[3].replace('{n}',fmtN(d[1]))+'</div>'+qsBar(v,d[1])+'</div>'+qsChips(d[4])+'<div class="qa"><button '+((q.c||!dn)?'disabled':'')+' onclick="qsWq('+k+')">'+(q.c?'Đã nhận':dn?'🎁 Nhận thưởng':'Đang thực hiện')+'</button></div></div>'}).join('')}
else if(qsub==3){h+=QAC.map((d,k)=>{const c=QS.ac[d[0]]|0,v=qsP([d[0]],{}),mx2=c>=4,n=d[4][Math.min(c,3)];return'<div class="qc'+((!mx2&&v>=n)?' done':'')+'"><div style="display:flex;justify-content:space-between;align-items:center"><b>'+d[1]+' '+d[2]+'</b><span class="st">Bậc '+Math.min(c+1,4)+'/4'+(mx2?' ✔':'')+'</span></div>'+(mx2?'<div class="st">Đã đạt tối đa</div>':'<div class="qo"><div>'+d[3].replace('{n}',fmtN(n))+'</div>'+qsBar(v,n)+'</div>'+qsChips(QAR[c])+'<div class="qa"><button '+(v>=n?'':'disabled')+' onclick="qsAc('+k+')">'+(v>=n?'🎁 Nhận thưởng':'Chưa đạt')+'</button></div>')+'</div>'}).join('')}
else{const p=PS[cur],t=p.tier;h+='<div class="qc"><b>🎓 Nhiệm vụ chuyển chức</b><div class="st">Cảnh giới hiện tại: <b>'+TN[t]+'</b></div>';
if(t>=3)h+='<div class="st">Đã đạt cảnh giới tối cao.</div>';
else if(P.lv<20*(t+1))h+='<div class="st">Cần đạt cấp '+20*(t+1)+' (hiện Lv'+P.lv+').</div>'+qsBar(P.lv,20*(t+1));
else if(!cq)h+=!vil?NV:'<div class="st">'+cqDesc(t)+'</div><div class="qa"><button onclick="cq1()">Nhận nhiệm vụ</button></div>';
else if(!cqOK())h+=cqUI();
else h+=!vil?NV:'<div class="st">Hoàn thành! Hãy chọn:</div><div class="qa">'+(t==0?CHR[cur].br.map((b,j)=>'<button onclick="cq1('+j+')">'+b.n+(b.w?' ('+b.w+')':'')+'</button>').join(''):'<button onclick="cq1()">Chuyển chức → '+TN[t+1]+'</button>')+'</div>';
h+='</div>'}
return h}
const _qsSv=sv;sv=function(){_qsSv();try{qsSave()}catch(e){}};
const _qsNg=ng;ng=function(){QS=qsNew();QS.dk=0;QS.wk=0;qsSave();_qsNg()};
QS=qsLoad();

function ui(){if(!bo)return;const p=PS[cur],T=['🎒','👤'+(p.pts?'●':''),'⚒','🛒','💊','❗','🗺','⚗','🧘','🐾','🪽','📊'];
let h=tabBar(p);
const it=sel?(sel.k=='e'?EQ[sel.i]:BAG[sel.i]):null,t=p.tier;
if(tab==1){h+=charUI()}
else if(tab==2){h+=!vil?NV:`<div class="dt">⚒ Thợ Rèn: cường hóa ở tab 🎒. Chế tạo cần mảnh 🔹 rơi từ Boss Thế Giới (30 phút/lần).</div>`+SL.map((s,i)=>(i==8||i==10)?'':`<div class="st">${s[1]} ${s[0]} <button onclick="cr(${i},3)">Sử Thi 5🔹</button><button onclick="cr(${i},4)">Thần Thoại 12🔹</button></div>`).join('')+'<div class="dt"><button onclick="tb(7)">⚗ Hợp trang bị</button></div>'}
else if(tab==3){h+=!vil?NV:`<div class="dt">🛒 Tạp Hóa<br><button onclick="sa()">Bán đồ Thường/Tinh Anh</button><button onclick="bc()">Rương trang bị ${150*P.lv}💰</button> <small>(5% nhận 🌙 Mảnh Nguyệt Thạch)</small></div>`}
else if(tab==4){const pr=20+P.lv*3;h+=`<div class="dt">🧴 Đài Hồi Phục — dùng bất cứ lúc nào (hồi 50%)<br>🧪 Bình HP: ${hpP} <button onclick="up(0)">Dùng</button> · 💧 Bình MP: ${mpP} <button onclick="up(1)">Dùng</button></div>`+(!vil?NV:`<div class="dt">💊 Dược Điếm (tự dùng khi HP&lt;35% / MP&lt;20%)<br>Thuốc HP ${pr}💰 <button onclick="bp(0,1)">Mua 1</button><button onclick="bp(0,10)">x10</button><br>Thuốc MP ${pr}💰 <button onclick="bp(1,1)">Mua 1</button><button onclick="bp(1,10)">x10</button></div>`)}
else if(tab==5){h+=qsUI()}
else if(tab==8){h+=ZC.ui()}else if(tab==11){h+=stUI()}else if(tab==12){h+=FM.farmUI()}else if(tab==13){h+=FM.alchUI()}else if(tab==14){h+=MN.ui()}else if(tab==15){h+=HL.ui()}else if(tab==16){h+=LW.ui()}
else if(tab==9){h+=petUI()}else if(tab==10){h+=wgUI()}
else if(tab==7){const A=BAG[fz[0]],B=BAG[fz[1]],C3=BAG[fz[2]];h+=!vil?NV:`<div class="dt">⚗ Hợp trang bị<br>Chọn 3 món <b>cùng phẩm chất</b> (Sử Thi hoặc Thần Thoại) trong túi. <b>10%</b> thành công: nhận 1 món cùng loại với món đầu, phẩm chất cao hơn. <b>90% thất bại: mất cả 3 món.</b></div><div class="gr5">${BAG.map((it,i)=>it.r>=3&&it.r<5?`<div class="ce spk ${it.r>=5?'my ete':it.r==4?'my':'cf'}" onclick="fzt(${i})" style="border-color:${RC[it.r]};${fz.includes(i)?'outline:3px solid #fff':''}">${IMG(it)}</div>`:'').join('')||'<div class="st">Chưa có trang bị Sử Thi trở lên trong túi.</div>'}</div>`+(A?`<div class="dt">${tip(A)}</div>`:'')+(B?`<div class="dt">${tip(B)}</div>`:'')+(C3?`<div class="dt">${tip(C3)}</div>`:'')+(A&&B&&C3?`<div class="st">Phí: ${fcost(A,B)}💰 · 10% lên ${RN[Math.min(A.r+1,5)]} · 90% mất 3 món</div><button onclick="fuse()">${fzc?'⚠ Xác nhận hợp':'⚗ Hợp'}</button>`:'')}
else if(tab==6){h+=`<div class="dt">🗺 Chọn bản đồ theo cấp quái</div>`+LR.map((r,i)=>`<div class="st" style="margin:4px 0"><button style="width:100%;text-align:left;${mapSel==i&&!lg?'background:#8a6420':''}" onclick="gm(${i})">${['🏰','❄️','🔥','💀','🌌'][i]} ${MP[MPX[i]].n} · quái Lv${r[0]}-${r[1]}${mapSel==i&&!lg?' (đang ở đây)':''}</button></div>`).join('')+lgUI()+`<div class="st">Cấp tối đa của nhân vật hiện tại: ${LC(PS[cur].tier)}. Bản đồ cao rơi nhiều vàng và đồ cấp cao hơn, boss khó hơn.</div>`}
else{const cell=(it,k,i,ic)=>`<div class="ce${it&&SPK(it)?(it.r>=5?' spk my ete':it.r>=4?' spk my':' spk cf'):''}" onclick="pk('${k}',${i})" title="${k=='e'?SL[i][0]:''}" style="border-color:${it?RC[it.r]:'#5a4630'};opacity:${it||!ic?1:.35};${sel&&sel.k==k&&sel.i==i?'box-shadow:0 0 8px #fff;':''}">${it?BIMG(it):ic}</div>`;
h+=`<div class="st" style="${BAG.length>=capN()*.9?'color:#ff8a7a;font-weight:bold':''}">Túi ${BAG.length}/${capN()}${BAG.length>=capN()?' · ĐẦY':BAG.length>=capN()*.9?' · sắp đầy':''} · Bộ Thần Thoại ${setN()}/6${HL.n()?' · Bộ Thánh '+HL.n()+'/10':''}</div><details class="st"><summary>ℹ️ Mẹo rơi đồ</summary>⭐ Tinh Anh (mỗi 30 quái): Sử Thi 8%, Hiếm 42%. 👑 Boss Sử Thi (mỗi 100 quái): 3 món Hiếm/Sử Thi + 5% rơi Thần Thoại. Trang bị mạnh dần theo bản đồ.</details><div style="display:flex;flex-wrap:wrap;gap:4px"><button onclick="bsort()">↕ Sắp xếp</button><button onclick="bclean()">🧹 Dọn đồ yếu</button><button onclick="qs=!qs;ui()" style="${qs?'background:#8a6420':''}">⚡ Bán nhanh: ${qs?'BẬT':'TẮT'}</button><button onclick="sa(2)">Bán ≤Tinh Anh</button><button onclick="sa(3)">Bán ≤Hiếm</button><button onclick="AS=(AS+1)%4;ui()">Tự bán: ${['tắt','Thường','≤Tinh Anh','≤Hiếm'][AS]}</button></div>${qs?'<div class="st">Chạm món Thường/Tinh Anh/Hiếm trong túi để bán ngay. Đồ Sử Thi, Thần Thoại, chế tác và đã cường hóa được giữ lại.</div>':''}${(()=>{const L=[9,0,4,7,6],Rr=[3,2,1,8,5],w=(i,c,r)=>`<div style="grid-column:${c};grid-row:${r}">${cell(EQ[i],'e',i,ghost(i))}</div>`;return `<div class="eqd">${L.map((i,r)=>w(i,1,r+1)).join('')}<div class="chp${setOn()?' my':''}"><img src="${PIC[cur]}"><span>${CHR[cur].n} · Lv${P.lv}</span></div>${Rr.map((i,r)=>w(i,3,r+1)).join('')}<div style="grid-column:2;grid-row:5;justify-self:center;width:52px"><div class="ce" onclick="tb(9)" style="border-color:${pet()?pcol(pet().k,pet().ev):'#5a4630'};opacity:${PS[cur].tier<1?.5:1}">${PS[cur].tier<1?'🔒':pet()?`<img src="${pimg(pet().k,pet().ev)}" style="width:100%;height:100%;object-fit:contain">`:'❓'}</div></div></div>`})()}<div class="st">Công ${atk()*5} · Thủ ${df()} · HP ${mx()}</div><div style="display:flex;gap:4px;margin:4px 0">${(bgLk(bgp)&&(bgp=0),'')}${[0,1,2,3,4].map(k=>bgLk(k)?`<button onclick="msg='🔒 Túi ${k+1} mở khi chuyển chức lần ${k-1}';ui()" style="flex:1;padding:4px 0;opacity:.55">🔒${k+1}<br><small>Chức ${k-1}</small></button>`:`<button onclick="bgp=${k};sel=null;ui()" style="flex:1;padding:4px 0;${bgp==k?'background:#8a6420;border-color:#ffd54a':''}">🎒${k+1}<br><small>${Math.min(30,Math.max(0,BAG.length-k*30))}/30</small></button>`).join('')}</div><div class="gr5">${Array.from({length:30},(_,j)=>{const i=bgp*30+j;return cell(BAG[i],'b',i,'')}).join('')}</div>
${it?`<div class="ipb" onclick="sel=null;ui()"></div><div class="ipp"><button class="ipx" onclick="sel=null;ui()">✕</button><div>${tip(it)+cmp(it)}</div>${msg?'<div class="st msgl">'+msg+'</div>':''}<div class="ipa">${it&&sel.k=='b'?(it.s==7?`<button onclick="eq1(7)">Mặc trái</button><button onclick="eq1(8)">Mặc phải</button>`:`<button onclick="eq1()">Mặc</button>`)+`<button onclick="sl1()">Bán ${sell(it)}💰</button>`:''}${it&&sel.k=='e'?'<button onclick="un()">Tháo</button>'+(it.s==7?'<button onclick="swr()">⇄ Đổi bên</button>':''):''}${it&&it.u<10?`<button onclick="en1()">⚒ Cường hóa +${it.u+1} (${cost(it)}💰 · ${RT[it.u]}%)</button>`:''}</div></div>`:'<div class="st" style="text-align:center;opacity:.7;margin-top:6px">Chạm vào một món đồ để xem thuộc tính</div>'}`}
bag.innerHTML=h+'</div>';bag.querySelectorAll('img[data-ik]').forEach(m=>{m.src=IC[m.dataset.ik]})}
function cmp(i){if(sel.k!='b')return'';const q=EQ[tgt(i)],d=(k,n)=>{const v=ev(i,k)-(q?ev(q,k):0);return v?`<span style="color:${v>0?'#7fe08a':'#ff7a7a'}">${n}${v>0?'+':''}${v}</span> `:''};return '<br><span class="st">So với đồ đang mặc: '+(q?(d('a','Công ')+d('d','Thủ ')+d('h','HP ')+Object.keys(AXN).map(k=>{const v=Math.round(((i.x&&i.x[k])||0)*10-((q&&q.x&&q.x[k])||0)*10)/10;return v?'<span style="color:'+(v>0?'#7fe08a':'#ff7a7a')+'">'+AXN[k]+' '+(v>0?'+':'')+v+'% </span>':''}).join('')||'tương đương'):'chưa mặc món nào')+'</span>'}
function setSK(){bt.forEach((b,i)=>{b.innerHTML=SK[i][1]+'<small>'+SK[i][0]+'</small>';b.style.opacity=ok(i)?1:.35})}
function petUI(){const t=PS[cur].tier,p=PS[cur].pet;if(t<1)return'<div class="dt">🐾 Thú nuôi mở khi chuyển chức lần đầu (Lv20).</div>';if(!p)return'<div class="dt">🐾 <b>Chọn 1 trong 4 thần thú</b> (không đổi được):</div>'+PT4.map((T,i)=>`<div class="dt"><img src="${PTU[i]}" style="width:48px;height:48px;object-fit:contain;vertical-align:middle;margin-right:4px"> <b>${T.n[0]}</b> → ${T.n[3]}<br><small>${T.d}</small><br><button onclick="pcz(${i})">Chọn</button></div>`).join('');const T=PT4[p.k],cap=pcap(p),full=p.lv>=cap;return`<div class="dt"><img class="pvw" src="${pimg(p.k,p.ev)}" style="width:76px;height:64px;object-fit:contain;vertical-align:middle;filter:drop-shadow(0 0 ${4+p.ev*3}px ${pcol(p.k,p.ev)})"> <b style="color:${pcol(p.k,p.ev)}">${T.n[p.ev]}</b> · Tiến hóa ${p.ev+1}/4<br>Cấp ${p.lv}/${cap} · EXP ${Math.floor(p.xp)}/${pnd(p)} (nhận thêm khi hạ quái)<br><small>${T.d}</small><br><small>🌟 Kỹ năng riêng: <b>${PSK[p.k].n}</b> — ${PSK[p.k].d}</small><br>Thưởng: ${['dmgp','crit','acc','cdmg','cdr','dred','hpp'].filter(k=>PB(k)).map(k=>AXN[k]+' +'+PB(k).toFixed(1)+'%').join(', ')}</div>${(p.k==3||p.k==2)?evStrip(p):''}<div class="dt">🍖 Nuôi dưỡng (ở 🏘 Làng)<br><button onclick="pfd(0)">Thịt 50💰 +30</button><button onclick="pfd(1)">Linh nhục 500💰 +400</button></div>`+(p.ev<3?`<div class="dt">🌟 Tiến hóa → <b>${T.n[p.ev+1]}</b><br>Cần cấp ${cap} · ${peg(p)}💰${p.k==2&&p.ev==2?'<br>🔮 Cần <b>Thức Tỉnh Đan</b> ('+(PS[cur].dan|0)+'/1) · <small>sẽ cập nhật sau</small>':''}<br><button ${full&&(!(p.k==2&&p.ev==2)||(PS[cur].dan|0)>=1)?'':'disabled'} onclick="pev()">Tiến hóa</button></div>`:'<div class="dt">Đã tiến hóa tối đa.</div>')}
function pcz(i){if(PS[cur].pet)return;PS[cur].pet={k:i,lv:1,xp:0,ev:0};msg='🐾 Đã nhận '+PT4[i].n[0];ui()}
function pfd(k){const p=pet();if(!p)return;if(!vil){msg='Về 🏘 Làng để cho ăn';ui();return}const c=k?500:50;if(p.lv>=pcap(p)){msg='Đã đạt giới hạn, hãy tiến hóa';ui();return}if(gold<c){msg='Không đủ vàng';ui();return}gold-=c;p.xp+=k?400:30;pcheck(p);msg='Thú nuôi ăn rất ngon';ui()}

function petEvo(k,ev){const c=pcol(k,ev),d=document.createElement('div');d.className='evo';d.style.setProperty('--c',c);let sp='';for(let i=0;i<30;i++){const a=Math.random()*6.283,r=90+Math.random()*190;sp+='<s style="--x:'+Math.round(Math.cos(a)*r)+'px;--y:'+Math.round(Math.sin(a)*r)+'px;--d:'+(1.1+Math.random()*1.5).toFixed(2)+'s"></s>'}
 d.innerHTML='<div class="evr"></div><i class="evc"></i><i class="evc c2"></i><i class="evc c3"></i>'+sp+'<img class="evo-o" src="'+pimg(k,ev-1)+'"><img class="evo-n" src="'+pimg(k,ev)+'"><div class="evt">'+(ev>=3?'✨ TỐI THƯỢNG ✨':'🌟 TIẾN HOÁ!')+'<b>'+PT4[k].n[ev]+'</b></div>';
 d.onclick=()=>d.remove();document.body.appendChild(d);setTimeout(()=>{try{d.remove()}catch(e){}},4200)}
function evStrip(p){return'<div class="evs">'+[0,1,2,3].map(i=>'<div class="'+(i<=p.ev?'on':'')+(i==p.ev?' cur':'')+'"><img src="'+pimg(p.k,i)+'"><small>'+PT4[p.k].n[i]+'</small></div>').join('')+'</div>'}
function pev(){const p=pet();if(!p||p.ev>=3||p.lv<pcap(p))return;const c=peg(p);if(p.k==2&&p.ev==2&&!((PS[cur].dan|0)>=1)){msg='🔮 Cần 1 Thức Tỉnh Đan để tiến hóa hình cuối (sẽ cập nhật sau)';ui();return}if(!vil){msg='Về 🏘 Làng để tiến hóa';ui();return}if(gold<c){msg='Thiếu vàng ('+c+')';ui();return}gold-=c;if(p.k==2&&p.ev==2)PS[cur].dan=(PS[cur].dan|0)-1;p.ev++;p.xp=0;msg='🌟 Tiến hóa thành '+PT4[p.k].n[p.ev]+'!';EP.evT=fr;try{petEvo(p.k,p.ev)}catch(e){}ui()}
function tb(t){tab=t;sel=null;msg='';ui()}
function ap(i){if(PS[cur].pts>0){PS[cur].pts--;PS[cur].al[i]++;ui()}}
function sw(i){if(i==cur)return;PS[cur].lv=P.lv;PS[cur].xp=P.xp;cur=i;P.lv=PS[i].lv;P.xp=PS[i].xp;rf();P.hp=mx();P.mp=mm();E=[];PETS=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;sel=null;ui()}
function en1(){if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}const it=sel.k=='e'?EQ[sel.i]:BAG[sel.i],c=cost(it);if(gold<c){msg='Không đủ vàng!';ui();return}gold-=c;if(R()*100<RT[it.u]){it.u++;QE('enhok');msg='✅ Cường hóa thành công! +'+it.u}else{const d=it.u>=5;if(d)it.u--;msg='❌ Thất bại'+(d?', tụt về +'+it.u:'')}P.hp=Math.min(P.hp,mx());ui()}
function tg(){bo=!bo;sel=null;bag.style.display=bo?'flex':'none';ui()}
function gm(i){lg=0;mapSel=i;vil=0;E=[];PETS=[];PJ=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;P.atk=0;P.x=120;lm=mi();DT.push({x:P.x,y:190,s:'Đến '+MP[mi()].n,g:1,l:110});if(bo)tg()}
function up(k){if(k?mpP<1:hpP<1){msg='Hết bình, hãy mua ở Dược Điếm';ui();return}if(k){mpP--;P.mp=Math.min(mm(),P.mp+mm()*.5)}else{hpP--;P.hp=Math.min(mx(),P.hp+mx()*.5)}QE('pot');DT.push({x:P.x,y:130,s:k?'💧+'+Math.round(mm()*.5):'🧪+'+Math.round(mx()*.5),g:1,l:50});msg=k?'Đã dùng bình MP':'Đã dùng bình HP';ui()}
function openB(i){bo=1;tab=i<4?2+i:6;sel=null;msg='';bag.style.display='flex';ui()}
let fzc=0;function fzt(i){const it=BAG[i];if(!it||it.r<3||it.r>4)return;fzc=0;const k=fz.indexOf(i);if(k>=0)fz.splice(k,1);else{if(fz.length&&BAG[fz[0]]&&BAG[fz[0]].r!=it.r){msg='Ba món phải cùng phẩm chất';ui();return}if(fz.length>=3)fz.shift();fz.push(i)}msg='';ui()}
const fcost=(a,b)=>Math.round(300*Math.max(a.l,b.l)*(a.r-2));
function fuse(){if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}const a=BAG[fz[0]],b=BAG[fz[1]],c3=BAG[fz[2]];if(fz.length<3||!a||!b||!c3){msg='Chọn đủ 3 món';ui();return}const c=fcost(a,b);if(gold<c){msg='Không đủ vàng ('+c+')';ui();return}if(!fzc){fzc=1;msg='⚠ Bấm lần nữa để xác nhận: nếu thất bại sẽ MẤT CẢ 3 món!';ui();return}fzc=0;gold-=c;const ok=R()<.1,its=[a,b,c3];[...fz].sort((x,y)=>y-x).forEach(i=>BAG.splice(i,1));fz=[];if(ok){const r=a.r+1,it=gen(Math.max(a.l,b.l,c3.l),r,a.s,Math.max(a.mp|0,b.mp|0,c3.mp|0));if(its.some(x=>x.c))it.c=1;BAG.push(it);msg='🌟 Đột phá thành công! '+RN[r]+': '+it.n}else msg='💥 Dung hợp thất bại, mất 3 món trang bị.';ui()}
function pk(k,i){const it=k=='b'?BAG[i]:null;if(qs&&it&&it.r<3&&!it.c&&!it.u){const v=sell(it);gold+=v;BAG.splice(i,1);sel=null;msg='💰 +'+v;ui();return}sel={k,i};msg='';ui()}
function eq1(fs){if(!BAG[sel.i]){sel=null;ui();return}if(BAG[sel.i].l>P.lv&&!BAG[sel.i].c){msg='⛔ Cần Lv'+BAG[sel.i].l+' mới mặc được (hiện Lv'+P.lv+')';ui();return}eqp(BAG[sel.i],sel.i,fs);sel=null;ui()}
function swr(){const a=EQ[7];EQ[7]=EQ[8];EQ[8]=a;sel=null;msg='💍 Đã đổi nhẫn trái ↔ phải';ui()}
function sl1(){gold+=sell(BAG[sel.i]);BAG.splice(sel.i,1);sel=null;ui()}
function un(){if(BAG.length<capN()){BAG.push(EQ[sel.i]);EQ[sel.i]=null;P.hp=Math.min(P.hp,mx());sel=null;ui()}}
function sa(n=2){let t=0,k=0;for(let j=BAG.length-1;j>=0;j--){const i=BAG[j];if(!(i.r>=n||i.c||i.u>0)){t+=sell(i);k++;BAG.splice(j,1)}}gold+=t;sel=null;msg='💰 Bán '+k+' món, +'+t;ui()}
function bsort(){BAG.sort((a,b)=>(b.r-a.r)||(a.s-b.s)||(sc(b)-sc(a)));sel=null;fz.length=0;bgp=0;msg='↕ Đã sắp xếp túi: phẩm chất cao lên trước, cùng loại gom lại';ui()}
function bclean(){let t=0,k=0;const W=i=>{if(i.s==7){const a=EQ[7],b=EQ[8];return a&&b?Math.min(sc(a),sc(b)):-1}if(i.s==10&&PS[cur].tier<1)return -1;const q=EQ[i.s];return q?sc(q):-1};for(let j=BAG.length-1;j>=0;j--){const i=BAG[j];if(SPK(i)||i.u>0||i.r>2)continue;const w=W(i);if(w>=0&&sc(i)<=w){t+=sell(i);k++;BAG.splice(j,1)}}gold+=t;sel=null;fz.length=0;msg=k?'🧹 Dọn '+k+' món yếu hơn đồ đang mặc, +'+t+'💰':'Không có món nào yếu hơn đồ đang mặc để dọn';ui()}
bgb.onpointerdown=e=>{e.stopPropagation();tg()};bag.onpointerdown=e=>e.stopPropagation();
addEventListener('keydown',e=>{if(e.key==='b'||e.key==='i')tg();if(e.key==='q')up(0);if(e.key==='e')up(1)});


function nameTag(){const X=(P.x-cam)*s,fs=Math.max(10,12*s),bw=Math.max(28,31*s),bh=Math.max(2.5,3*s),mh=Math.max(2,2.25*s),yM=GY-80*s-mh,yH=yM-bh-2,yN=yH-4,dr=(y,h,v,c1)=>{const f=bw*cl(v,0,1);g.fillStyle='rgba(0,0,0,.7)';g.fillRect(X-bw/2-1,y-1,bw+2,h+2);g.fillStyle=c1;g.fillRect(X-bw/2,y,f,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(X-bw/2,y,f,Math.max(1,h*.35));g.strokeStyle='#b8964e';g.lineWidth=1;g.strokeRect(X-bw/2-.5,y-.5,bw+1,h+1)};g.save();g.globalAlpha=1;g.textBaseline='alphabetic';dr(yH,bh,P.hp/mx(),P.hp/mx()<.3?'#ff3b3b':'#d63838');dr(yM,mh,P.mp/mm(),'#3a7ae0');g.font='bold '+fs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='left';g.strokeStyle='#000';g.lineWidth=3;const a=CN(cur)+' · ',b=ZC.rn(),wa=g.measureText(a).width,wb=g.measureText(b).width;let x=X-(wa+wb)/2;g.strokeText(a,x,yN);g.fillStyle='#ffe9a0';g.fillText(a,x,yN);x+=wa;g.strokeText(b,x,yN);g.fillStyle=ZC.col();g.fillText(b,x,yN);g.restore()}
const BN=['Thợ Rèn','Tạp Hóa','Hồi Phục','Nhiệm Vụ','Bản Đồ'],bxx=i=>vw()*(.14+.18*i),bww=()=>Math.min(130,vw()*.16);
function vstep(){if(pet())EP.x+=(P.x-50*P.d-EP.x)*.07;const sp=3;let d=0;if(mvDir){vt=null;vgo=-1;d=mvDir}else if(vt!=null){const q=vt-P.x;if(Math.abs(q)<sp+1){vt=null;if(vgo>=0){const b=vgo;vgo=-1;openB(b)}}else d=Math.sign(q)}P.mv=d?1:0;P.atk=0;if(d){P.x=cl(P.x+d*sp,40,vw()-40);P.d=d}}
function bld(i){const t=fr,k=bww()/120;g.save();g.translate(bxx(i)*s,GY);g.scale(s*k,s*k);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,2,68,9,0,0,6.28);g.fill();
const rf=(w,y,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(-w-20,y-4);g.quadraticCurveTo(-w+4,y+2,0,y-30);g.quadraticCurveTo(w-4,y+2,w+20,y-4);g.lineTo(w+6,y+8);g.lineTo(-w-6,y+8);g.fill();g.fillStyle='#d9b04a';g.fillRect(-w-6,y+6,w*2+12,3)};
g.fillStyle='#7a7468';g.fillRect(-60,-8,120,8);
if(i==4){g.save();g.beginPath();g.arc(0,-62,40,0,6.28);g.clip();const q=g.createRadialGradient(0,-62,3,0,-62,44);q.addColorStop(0,'#e8c8ff');q.addColorStop(.5,'#6a2ac0');q.addColorStop(1,'#1a0a30');g.fillStyle=q;g.fillRect(-44,-106,88,88);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;for(let j=0;j<4;j++){g.beginPath();g.ellipse(0,-62,8+j*8,16+j*7,t*.04*(j%2?1:-1)+j,0,4);g.stroke()}g.restore();g.strokeStyle='#9a948a';g.lineWidth=11;g.beginPath();g.arc(0,-62,45,0,6.28);g.stroke();g.strokeStyle='#d9b04a';g.lineWidth=2;g.stroke();rf(40,-104,'#5a2a7a');glow(0,-62,70,.35+.2*Math.sin(t*.1))}
else{const C=['#8a2a22','#9a4a1c','#1f6a5a','#5a2a7a'][i];g.fillStyle='#eadfc4';g.fillRect(-48,-70,96,62);g.fillStyle=C;g.fillRect(-50,-72,9,66);g.fillRect(41,-72,9,66);g.fillStyle='rgba(255,200,100,.85)';g.fillRect(-34,-58,26,26);g.strokeStyle=C;g.lineWidth=2;g.strokeRect(-34,-58,26,26);g.beginPath();g.moveTo(-21,-58);g.lineTo(-21,-32);g.moveTo(-34,-45);g.lineTo(-8,-45);g.stroke();g.fillStyle='#3a1a10';g.fillRect(8,-54,26,46);g.fillStyle='#d9b04a';g.fillRect(19,-32,4,4);
rf(58,-72,C);g.fillStyle='#eadfc4';g.fillRect(-28,-104,56,30);rf(42,-104,C);g.font='bold 22px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.fillStyle=C;g.fillText('鍛貨藥令'[i],0,-80);ln(-52,-58,.8,t);ln(52,-58,.8,t);
if(i==0){glow(20,-30,40,.4+.3*Math.sin(t*.2));for(let j=0;j<4;j++){g.fillStyle='rgba(205,205,215,'+(.4-j*.08)+')';g.beginPath();g.arc(40+Math.sin(t*.04+j)*6,-112-((t*.4+j*13)%44),6+j*2,0,6.28);g.fill()}}
if(i==2){g.fillStyle='#6fdc6f';g.beginPath();g.arc(-62,-30,8,0,6.28);g.arc(-62,-44,5,0,6.28);g.fill()}
if(i==3){g.fillStyle='#f2e3b3';g.fillRect(56,-70,12,40);g.fillStyle='#8a2a22';g.fillRect(55,-72,14,4)}}
g.font='bold 15px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle='#ffe9a0';g.strokeText(BN[i],0,-152);g.fillText(BN[i],0,-152);g.fillStyle='#ffd54a';g.fillText('▼',0,-136+Math.sin(t*.12+i)*4);g.restore()}
function vdraw(){const gy=GY;xbg(gy,-1);for(let i=0;i<5;i++)bld(i);
if(vt!=null){const a=(fr%40)/40;g.strokeStyle='rgba(255,230,140,'+(1-a)+')';g.lineWidth=3;g.beginPath();g.ellipse(vt*s,gy+12*s,(10+a*22)*s,(4+a*8)*s,0,0,6.28);g.stroke()}
drawEP();hero();nameTag();g.fillStyle='#000b';const tx='Chạm hoặc bấm chuột để đi · chạm tòa nhà để vào',ty=gy+(H-gy)*.55;g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';const tw=g.measureText(tx).width;g.fillRect(W/2-tw/2-12,ty-18*Math.max(.8,s),tw+24,28*Math.max(.8,s));g.fillStyle='#ffe9a0';g.fillText(tx,W/2,ty)}
c.addEventListener('pointerdown',e=>{if(!vil||bo||!started)return;const x=e.offsetX/s,y=e.offsetY;let h=-1;for(let i=0;i<5;i++)if(Math.abs(x-bxx(i))<bww()/2+12&&y>GY-190*s&&y<GY+40*s)h=i;if(h>=0){vt=bxx(h);vgo=h}else{vt=cl(x,40,vw()-40);vgo=-1}});
document.getElementById('mpb').onpointerdown=e=>{e.stopPropagation();if(!started)return;tab=6;sel=null;msg='';if(!bo)tg();else ui()};
document.getElementById('vl').onpointerdown=e=>{e.stopPropagation();if(!started)return;vil=!vil;if(vil){P.hp=mx();P.mp=mm();P.atk=0;P.pe=null;vt=null;vgo=-1;P.x=cl(P.x,40,vw()-40)}};
function cr(s,r){const f=r==4?12:5,gd=(r==4?600:100)*P.lv;if(frag<f||gold<gd||BAG.length>=capN()){msg=frag<f?'Thiếu mảnh chế tạo':gold<gd?'Thiếu vàng':'Túi đầy';ui();return}frag-=f;gold-=gd;{const it=gen(P.lv,r,s);it.c=1;BAG.push(it);tab=0;sel={k:'b',i:BAG.length-1}}QE('craft');msg='⚒ Chế tạo thành công! Bấm Mặc để trang bị.';ui()}
function bp(k,n){const pr=(20+P.lv*3)*n;if(gold<pr){msg='Không đủ vàng';ui();return}gold-=pr;if(k)mpP+=n;else hpP+=n;msg='Đã mua';ui()}
function bc(){const pr=150*P.lv;if(gold<pr||BAG.length>=capN()){msg=gold<pr?'Không đủ vàng':'Túi đầy';ui();return}gold-=pr;const it=gen(P.lv,1+Math.floor(R()*R()*3));BAG.push(it);msg='Nhận: '+tip(it).split('<br>')[0]+HL.shopNT();ui()}
/* ==== NHIỆM VỤ CHUYỂN CHỨC (khó hơn ở lần 2, 3) ==== */
const CQR=[{n:30,e:0,b:0,m:0},{n:120,e:4,b:1,m:1},{n:250,e:8,b:2,m:2}];
function cqNew(t){const r=CQR[t]||CQR[2];return{k:0,n:r.n,e:0,en:r.e,b:0,bn:r.b,t:t,v:2}}
function cqFix(){if(cq&&cq.v!==2){const t=cl(Math.round(((cq.n|0)-30)/15),0,2),o=cq;cq=cqNew(t);cq.k=Math.min(o.k|0,cq.n)}}
function cqOK(){cqFix();return !!cq&&cq.k>=cq.n&&(cq.e|0)>=cq.en&&(cq.b|0)>=cq.bn}
function cqM(){cqFix();return cq&&cq.t>=1&&mapSel>=CQR[cq.t].m&&!lg&&!cqOK()?1+.3*cq.t:1}
function cqKill(e){cqFix();if(!cq||e.dg||lg||cqOK()||mapSel<CQR[cq.t].m)return;if(e.b==1){if(cq.e<cq.en)cq.e++}else if(e.b>=2){if(cq.b<cq.bn)cq.b++}else if(cq.k<cq.n)cq.k++}
function cqDie(){cqFix();if(!cq||dg||cq.t<1||cqOK()||mapSel<CQR[cq.t].m)return;const l=Math.ceil(cq.k*.1);if(l>0){cq.k-=l;DT.push({x:P.x,y:230,s:'☠ Thử luyện: mất '+l+' quái tiến độ',c:'#ff9a8a',l:130})}}
function cqDesc(t){const r=CQR[t];return t==0?'Hạ '+r.n+' quái để lên <b>'+TN[1]+'</b>.':'<b>⚔ Thử luyện '+TN[t+1]+'</b> (khó):<br>• Hạ <b>'+r.n+'</b> quái + <b>'+r.e+'</b> Tinh Anh ⭐ + <b>'+r.b+'</b> Boss 👑<br>• Chỉ tính ở <b>'+MP[MPX[r.m]].n+'</b> trở lên<br>• Quái ×'+(1+.3*t).toFixed(1)+' máu trong lúc thử luyện<br>• Tử trận mất 10% tiến độ quái thường'}
function cqUI(){const c=cq,r=CQR[c.t|0];return'<div class="st">Tiến độ '+(c.t?'thử luyện':'chuyển chức')+'</div><div class="st">Quái thường</div>'+qsBar(c.k,c.n)+(c.en?'<div class="st">Tinh Anh ⭐</div>'+qsBar(c.e|0,c.en):'')+(c.bn?'<div class="st">Boss 👑</div>'+qsBar(c.b|0,c.bn):'')+(r.m?'<div class="st" style="opacity:.85">Chỉ tính ở '+MP[MPX[r.m]].n+' trở lên'+(mapSel<r.m?' <b style="color:#ff8a7a">(đang ở bản đồ thấp hơn: không tính!)</b>':'')+' · quái ×'+(1+.3*c.t).toFixed(1)+' máu · tử trận -10%</div>':'')}
function cq1(b){const p=PS[cur],t=p.tier;cqFix();if(!cq){cq=cqNew(t);msg='📜 Nhận nhiệm vụ: '+cqDesc(t).replace(/<br>/g,' ').replace(/<[^>]+>/g,'')}else if(cqOK()){if(t==0&&b===undefined)return;p.tier++;if(t==0)p.br=b;p.pts+=10;cq=null;rf();P.hp=mx();P.mp=mm();msg='🎉 Chuyển chức: '+(t==0?CHR[cur].br[b].n:TN[t+1])+' — mở khóa kỹ năng mới!'+(t==0?' Hãy chọn thần thú!':'')+WCARD();if(t==0)tab=9}ui()}
function sv(){if(!started)return;PS[cur].lv=P.lv;PS[cur].xp=P.xp;try{localStorage.setItem('kthm2',JSON.stringify({PS,cur,EQS,BAGS,gold,frag,hpP,mpP,cq,pn,AS,mapSel,NK,lg,FM:(typeof FM!='undefined'?FM.save():0),MN:(typeof MN!='undefined'?MN.save():0),HT:(typeof FSH!='undefined'?FSH.save():0),HL:HL.save(),LW:LW.save(),v:4}))}catch(e){}}
function st(){started=1;cm()}
function cm(){document.getElementById('mn').style.display='none'}
function ng(){const e=document.getElementById('pn');if(e)pn=e.value||pn;PS.forEach(x=>{x.lv=1;x.xp=0;x.pts=0;x.tier=0;x.br=-1;x.al=[0,0,0,0];x.cv={r:-1,s:0,q:0,f:0};x.pet=null;x.wg=0;x.lg=0;x.nm='';x.rc=0});lg=0;EQS=[0,1,2].map(()=>Array(NS).fill(null));BAGS=[[],[],[]];HL.reset();LW.reset();gold=100;frag=0;hpP=3;mpP=3;cq=null;NK=0;pq=[0,0];fz=[];PS[pc].nm=String(pn||'').replace(/\s+/g,' ').trim().slice(0,12);cur=pc;rf();P=null;init();cam=0;pp.x=0;wbs=Math.floor(Date.now()/18e5);vil=1;st()}
function mig(){const c0=cur;for(let ci=0;ci<3;ci++){cur=ci;rf();const t=CHR[ci].t,OM=[0,2,4,6,7,t=='a'?1:9],cv=it=>{const n=gen(it.l,it.r,OM[it.s],it.mp|0);n.u=it.u|0;if(it.c)n.c=1;return n},nE=Array(NS).fill(null);(EQS[ci]||[]).forEach(it=>{if(it){const n=cv(it);nE[n.s]=n}});EQS[ci]=nE;BAGS[ci]=(BAGS[ci]||[]).map(cv)}cur=c0;rf()}
function mig2(){const c0=cur;for(let ci=0;ci<3;ci++){cur=ci;rf();const f=it=>{it.x=it.x||rollX(it.r,it.l,it.mp|0);if(NM[it.s])it.n=NM[it.s][it.r]+' · '+MTN[it.mp|0];return it};EQS[ci]=EQS[ci].map(it=>{if(it&&it.s==10){gold+=sell(it);return null}return it?f(it):it});BAGS[ci]=BAGS[ci].filter(it=>{if(it.s==10){gold+=sell(it);return false}return true}).map(f)}cur=c0;rf()}
const ONM={w:{2:'Giáp Trụ',3:'Áo Choàng'},m:{1:'Pháp Điển',2:'Pháp Bào',3:'Áo Choàng Pháp'},a:{1:'Ống Tên',2:'Giáp Da',3:'Áo Choàng Săn'}};
function fixNm(){for(let ci=0;ci<3;ci++){const t=CHR[ci].t,o=ONM[t],n=SLS[t],f=it=>{if(it&&o[it.s]&&typeof it.n=='string'){const a=o[it.s];if(it.n.startsWith(a+' '))it.n=n[it.s][0]+it.n.slice(a.length)}};EQS[ci].forEach(f);BAGS[ci].forEach(f)}}
function ld(){try{setTimeout(()=>ZC.refresh(),50);const d=JSON.parse(localStorage.getItem('kthm2'));if(!d)return;d.PS.forEach((x,i)=>Object.assign(PS[i],x));EQS=d.EQS;BAGS=d.BAGS;fixNm();gold=d.gold;frag=d.frag;hpP=d.hpP;mpP=d.mpP;cq=d.cq;pn=d.pn;if(!PS.some(x=>x&&x.nm)&&pn)PS[d.cur|0].nm=String(pn).slice(0,12);AS=d.AS||0;mapSel=d.mapSel||0;lg=d.lg|0;NK=d.NK|0;if(typeof FM!='undefined')FM.load(d.FM);try{if(typeof MN!='undefined')MN.load(d.MN)}catch(e){}try{if(typeof FSH!='undefined')FSH.load(d.HT)}catch(e){}try{HL.load(d.HL)}catch(e){}try{LW.load(d.LW)}catch(e){}pq=[0,0];cur=d.cur;rf();if(!d.v)mig();if((d.v|0)<4)mig2();P=null;init();P.lv=PS[cur].lv;P.xp=PS[cur].xp;P.hp=mx();P.mp=mm();cam=0;pp.x=0;wbs=Math.floor(Date.now()/18e5);vil=0;st()}catch(e){}}
function mn(m){const o=document.getElementById('mn'),e=document.getElementById('pn');if(e)pn=e.value||pn;o.style.display='flex';let hs=0;try{hs=!!localStorage.getItem('kthm2')}catch(x){}
if(m==1)o.innerHTML=`<div class="bx"><div class="bh">Tạo nhân vật</div><input id="pn" value="${pn}" maxlength="12" style="width:100%;box-sizing:border-box;padding:6px;background:#140d0a;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;font:inherit"><div class="gr6" style="grid-template-columns:repeat(4,1fr)">${CHR.map((x,i)=>`<div class="ce" onclick="pc=${i};mn(1)" style="border-color:${i==pc?'#ffd54a':'#5a4630'};padding:0"><img src="${PIC[i]}" style="width:100%;height:100%;object-fit:contain"></div>`).join('')}</div><div class="dt"><b>${CHR[pc].n}</b> · ${CL[CHR[pc].t]}<br>${CHR[pc].k.map(k=>k[1]+k[0]).join(' · ')}</div><button onclick="ng()">Bắt đầu</button><button onclick="mn(0)">Quay lại</button></div>`;
else o.innerHTML=`<div class="bx"><div class="bh" style="justify-content:center;font-size:20px">⚔️ Kiếm Tiên Hoang Mạc</div><button style="width:100%;padding:12px" onclick="mn(1)">🆕 Game mới</button><button style="width:100%;padding:12px" ${hs?'':'disabled'} onclick="ld()">▶ Chơi tiếp</button><button style="width:100%;padding:12px" ${started?'':'disabled'} onclick="sv();this.textContent='✔ Đã lưu'">💾 Lưu game</button>${started?'<button style="width:100%;padding:12px" onclick="cm()">↩ Quay lại game</button>':''}</div>`}
/*==== HẦM NGỤC + CÁNH ====*/
const DGI={};{const S={boss:ASSET_PAYLOAD("p001"),impA:ASSET_PAYLOAD("p002"),impB:ASSET_PAYLOAD("p003")};for(const k in S){const i=new Image();i.src='data:image/webp;base64,'+S[k];DGI[k]=i}}
let dg=null,dgU=-1,wfr=0,wf2=0,wf3=0,dgFl=0;
try{const d=JSON.parse(localStorage.getItem('kthm_dg'));if(d){dgU=d.u;wfr=d.w|0;wf2=d.w2|0;wf3=d.w3|0}}catch(e){}
const dgSave=()=>{try{localStorage.setItem('kthm_dg',JSON.stringify({u:dgU,w:wfr,w2:wf2,w3:wf3}))}catch(e){}},SLOT=3e5,dgSlot=()=>Math.floor(Date.now()/SLOT),dgOpen=()=>dgSlot()!==dgU,
WGR=.1,BOSSMY=.3,dgM=()=>Math.min(4,Math.floor((P.lv-1)/20)),
wl=()=>PS[cur].tier>=2?(PS[cur].wg|0):0,WB=k=>wl()*({dmgp:8,hpp:8,dodge:4}[k]||0);
const dgh=document.getElementById('dgh'),dgb=document.getElementById('dgb');
function dgBtn(){const o=dgOpen(),q=Math.ceil((SLOT-Date.now()%SLOT)/1e3);dgb.className='sb'+(o&&!dg?' dgo':'');dgb.innerHTML=dg?'🚪<small>Thoát</small>':'🕳<small>'+(o?'Mở!':Math.floor(q/60)+':'+String(q%60).padStart(2,'0'))+'</small>'}
function dgHud(){if(!dg){if(dgh.innerHTML)dgh.innerHTML='';return}const b=E.find(e=>e.k=='boss');dgh.innerHTML='<div class="dgt">🕳 Hầm Ngục · Lv'+P.lv+' · '+(dg.bs?'👹 Trùm Thần Thoại':'Quái '+Math.min(20,dg.kill)+'/20')+'</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}
function dgEnter(){bo=0;bag.style.display='none';vil=0;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();dg={t:0,n:0,kill:0};dgU=dgSlot();dgSave();DT.push({x:P.x,y:200,s:'🕳 Vào Hầm Ngục: 20 quái + Trùm!',c:'#ff9a70',g:1,l:130})}
function dgExit(){dg=null;E=[];PETS=[];PJ=[];FX=[];SLT=[60,130,200,270,340];P.pe=null;P.x=120;dgHud()}
function gcf(msg,yes){if(document.getElementById('gcf'))return;const o=document.createElement('div');o.id='gcf';o.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center';const bx=document.createElement('div');bx.style.cssText='background:linear-gradient(#3a2618,#150d09);border:2px solid #b8964e;border-radius:14px;padding:16px 18px;max-width:82vw;color:#f2e3b3;text-align:center;font-size:15px;line-height:1.5;box-shadow:0 8px 30px #000';const t=document.createElement('div');t.style.cssText='white-space:pre-line;margin-bottom:14px';t.textContent=msg;bx.appendChild(t);const mk=(n,f)=>{const b=document.createElement('button');b.textContent=n;b.style.cssText='margin:0 6px;padding:9px 20px;font-size:15px;border-radius:9px;border:1px solid #b8964e;background:#5a3a22;color:#fff;cursor:pointer';b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();o.remove();if(f)f()};return b};bx.appendChild(mk('Rời đi',yes));bx.appendChild(mk('Ở lại',null));o.appendChild(bx);['pointerdown','pointerup','click','touchstart','touchend'].forEach(ev=>o.addEventListener(ev,e=>e.stopPropagation()));document.body.appendChild(o)}
dgb.onpointerdown=e=>{e.stopPropagation();if(!started)return;if(dg){if(dg.mt)gcf('Rời trận Ma Thần?\nBạn sẽ về Làng, có thể khiêu chiến lại bất cứ lúc nào.',mtExit);else gcf('Rời Hầm Ngục? Lượt này sẽ mất.',dgExit);return}if(!dgOpen()){DT.push({x:P.x,y:190,s:'Hầm Ngục chưa mở, chờ đếm ngược',c:'#ccc',l:70});return}dgEnter()};
function dgSp(k){const bs=k=='boss',L=P.lv+(bs?5:Math.floor(R()*3)-1),m=dgM(),base=3*(60+L*25)*(1+m*.5),side=R()<.5?-1:1,x=bs?vw()+150:(P.x>vw()*.55?-60:vw()+60)+side*R()*50;
E.push({dg:1,k,sp:bs?'boss':R()<.5?'impA':'impB',x,y:k=='fly'?140+R()*70:0,vx:0,vy:0,hp:base*(bs?60:k=='run'?.9:1.1),max:base*(bs?60:k=='run'?.9:1.1),df:(8+L*2.2)*(1+m*.4)*(bs?2.6:1),b:bs?4:0,m,lv:L,cd:bs?70:30+R()*50,sl:0,fl:0,in:bs?70:0,hh:bs?200:90,rg:bs?190:60,sn:-1,st:0,tm:0,ph:R()*6,o:R(),mv:0});
for(let j=0;j<10;j++)PT.push({x,y:30,vx:(R()-.5)*3,vy:-R()*3,l:30,c:'#ff6a40'})}
function dgHurt(e,mu){const q=Math.max(1,Math.round(.65*(8+e.lv*3)*(1+e.m*.35)*mu-P.lv-Math.floor((sm('d')+al(1))*ZC.pd()*HL.df()/5)));if(R()<Math.min(.4,SX('dodge')/100)+ZC.dg()){DT.push({x:P.x,y:100,s:'Né',c:'#7fe0ff',l:40});return}const q2=Math.max(1,Math.round(q*(1-Math.min(.5,SX('dred')/100))*ZC.shd()));P.hp-=q2;DT.push({x:P.x,y:100,s:q2,r:1,l:45});dgFl=7}
function dgRing(e,sm_){FX.push({x:e.x,l:24,m:24,fn:(f,p,X,gy)=>{g.save();g.translate(X,gy-4*s);g.scale(s,s*.25);g.strokeStyle='#ff8a40';g.shadowColor='#ff5020';g.shadowBlur=18;g.lineWidth=14*(1-p)+2;g.globalAlpha=1-p;g.beginPath();g.arc(0,0,40+p*(sm_?190:250),0,6.283);g.stroke();g.restore()}});for(let i=0;i<14;i++)PT.push({x:e.x+(R()-.5)*120,y:6,vx:(R()-.5)*6,vy:-R()*4,l:30,c:'#b08a60'});dgFl=6}
function dgAxe(e,dr){FX.push({x:e.x+dr*30,l:18,m:18,fn:(f,p,X,gy)=>{g.save();g.translate(X,gy-80*s);g.scale(s*dr,s);g.rotate(-.7+p*1.3);g.lineCap='round';g.shadowColor='#ff5020';g.shadowBlur=24;g.globalAlpha=1-p*.8;g.strokeStyle='#ffb060';g.lineWidth=28*(1-p);g.beginPath();g.arc(0,0,125,-1.1,1.1);g.stroke();g.strokeStyle='#fff';g.lineWidth=7*(1-p);g.stroke();g.restore()}});dgRing(e,1)}
function dgBoss(e,d,ad,dr){const en=e.hp<e.max*.5,sp=(en?2.1:1.5)*(e.sl>0?.6:1);
if(e.in>0){e.in--;e.x-=2.4;e.mv=1;return}
if(e.st==0){if(ad>105){e.x+=dr*sp;e.mv=1}if(e.cd<=0&&ad<200){if(R()<.35){e.st=3;e.tm=44;e.tx=P.x;e.x0=e.x}else{e.st=1;e.tm=26}}}
else if(e.st==1){e.tm--;if(e.tm<=0){e.st=2;e.tm=9;e.hit=0}}
else if(e.st==2){e.tm--;if(!e.hit&&e.tm<=4){e.hit=1;e.x+=dr*22;if(Math.abs(P.x-e.x)<200)dgHurt(e,1);dgAxe(e,dr)}if(e.tm<=0){e.st=4;e.tm=22}}
else if(e.st==3){e.tm--;const u=1-e.tm/44;e.x=e.x0+(e.tx-e.x0)*u;e.y=Math.sin(u*Math.PI)*170;if(e.tm<=0){e.y=0;if(Math.abs(P.x-e.x)<220)dgHurt(e,1.3);dgRing(e);e.st=4;e.tm=26}}
else{e.tm--;if(e.tm<=0){e.st=0;e.cd=en?55:90}}
e.x=cl(e.x,30,vw()+160)}
function dgAI(e){e.sl--;e.fl--;e.cd--;e.ph+=.3;const d=P.x-e.x,ad=Math.abs(d),dr=Math.sign(d)||1,sl=e.sl>0?.45:1;e.mv=0;if(e.k=='boss')return dgBoss(e,d,ad,dr);
if(e.k=='fly'){
if(e.st==0){const tx=P.x+(e.o<.5?-1:1)*(90+e.o*160),ty=90+e.o*70+Math.sin(e.ph*.5)*14;e.vx+=(cl((tx-e.x)*.05,-3.2,3.2)*sl-e.vx)*.1;e.vy+=(cl((ty-e.y)*.06,-2.5,2.5)-e.vy)*.1;if(e.cd<=0&&ad<320){e.st=1;e.tm=16}}
else if(e.st==1){e.vx*=.8;e.vy+=(2.2-e.vy)*.2;if(--e.tm<=0){e.st=2;e.tm=45}}
else if(e.st==2){const dx=P.x-e.x,dy=34-e.y,dd=Math.hypot(dx,dy)||1;e.vx=dx/dd*9*sl;e.vy=dy/dd*9*sl;e.tm--;if(dd<32){dgHurt(e,1.1);e.st=3;e.tm=26;e.cd=95+R()*60;e.vx=-dr*5;e.vy=6}else if(e.tm<=0){e.st=3;e.tm=26;e.cd=60}}
else{e.vx*=.94;e.vy+=(3-e.vy)*.08;if(--e.tm<=0)e.st=0}
e.x+=e.vx;e.y=Math.max(10,e.y+e.vy);e.mv=1}
else{
if(e.st==0){e.y=0;if(ad>46){e.vx+=(dr*3.6*sl-e.vx)*.12}else e.vx*=.7;e.mv=1;if(e.cd<=0&&ad<150){e.st=1;e.tm=10}}
else if(e.st==1){e.vx*=.7;if(--e.tm<=0){e.st=2;e.vy=8.5;e.vx=dr*Math.min(7,ad*.1+3)}}
else{e.vy-=.55;e.y+=e.vy;if(e.y<=0){e.y=0;e.vy=0;e.vx*=.3;if(Math.abs(P.x-e.x)<60)dgHurt(e,1.1);e.st=0;e.cd=80+R()*50}}
e.x+=e.vx}
e.x=cl(e.x,-90,vw()+90);e.hh=e.y+70}
function dgTick(){if(!dg||over||bo||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;const a=E.filter(e=>e.dg&&e.k!='boss').length;
if(dg.n<20){if(dg.t>60&&a<8&&dg.t%38==0){const q=dg.n%10;dgSp(q==2||q==5||q==8?'run':'fly');dg.n++}}
else if(!dg.bs&&!a){dg.bs=1;dgSp('boss');DT.push({x:P.x,y:210,s:'👹 Trùm Thần Thoại xuất hiện!',c:'#ff8a50',g:1,l:150})}
else if(dg.bs&&!E.some(e=>e.k=='boss')&&!dg.done){dg.done=1;dg.out=260;QE('dg');DT.push({x:P.x,y:200,s:'🏆 Hoàn thành Hầm Ngục!',c:'#ffe08a',g:1,l:200})}
if(dg.done&&--dg.out<=0)dgExit()}
const _drop=drop;drop=function(e){if(!e.dg)return _drop(e);const L=e.lv;if(e.k!='boss'){dg.kill++;gold+=6*L;if(R()<.3)give(gen(L,rr(0)),e.x,90);if(R()<.01)give(gen(L,4),e.x,150);return}
gold+=400*L;const f=8+Math.floor(R()*6);frag+=f;DT.push({x:e.x,y:120,s:'🔹 +'+f+' mảnh chế tạo',c:'#6ff',l:120});
for(let i=0;i<3;i++){const x=R();give(gen(L,x<.15?3:x<.6?2:1),e.x+(i-1)*40,150+i*34)}
if(R()<BOSSMY){DT.push({x:e.x,y:260,s:'✨ Trang bị Thần Thoại!',c:RC[4],l:150,g:1});give(gen(L,4),e.x,230)}
{const wv=wl(),nl=Math.min(2,wv);if(wv<3&&R()<WGD[nl]){WFA(nl,1);dgSave();DT.push({x:e.x,y:300,s:'🪽 +1 Mảnh Cánh Cấp '+(nl+1),c:['#fff3c0','#8fdcff','#ffc070'][nl],l:170,g:1})}}}
const _fire=fire;fire=function(i){const n0=PJ.length;SKF=1;try{_fire(i)}finally{SKF=0}for(let j=n0;j<PJ.length;j++)PJ[j].sk=1};
const _foe=foe;foe=function(e){e.dg?dgFoe(e):_foe(e)};
const _stp=step;step=function(){if(started&&fr%30==0)dgBtn();if(fr%6==0)dgHud();dgTick();_stp()};
const _init=init;init=function(){dg=null;_init()};
const _bgd=bgd;bgd=function(gy){if(dg){xbg(gy,3);g.save();g.fillStyle='rgba(50,0,0,.3)';g.fillRect(0,0,W,H);g.restore()}else _bgd(gy)};
const _draw=draw;draw=function(){_draw();if(dgFl>0){g.save();g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='rgba(255,40,20,'+dgFl*.03+')';g.fillRect(0,0,W,H);g.restore();dgFl--}};
function dgFoe(e){const im=DGI[e.sp];if(!im||!im.naturalWidth)return;const bs=e.k=='boss',HH=bs?(e.mt?300:230):96,w=im.naturalWidth/im.naturalHeight*HH,dir=Math.sign(P.x-e.x)||1,X=(e.x-cam)*s;
g.save();g.globalAlpha=1;g.fillStyle='rgba(0,0,0,'+(.35-Math.min(.25,e.y/500)).toFixed(2)+')';g.beginPath();g.ellipse(X,GY+2,w*SZ*s*.32*(1-Math.min(.5,e.y/400)),6*s,0,0,6.28);g.fill();
let rot=0,sx=1,sy=1,ox=0,oy=0;
if(bs){const st=e.st;if(e.mv&&st==0){oy=-Math.abs(Math.sin(e.ph))*6;sy=1+.025*Math.sin(e.ph*2);rot=-.03*Math.sin(e.ph)}else sy=1+.012*Math.sin(fr*.08);
if(st==1){const u=1-e.tm/26,q=1-(1-u)*(1-u);rot=.32*q;sy=1+.04*q;ox=10*q}
else if(st==2){const u=1-e.tm/9;rot=.32-.78*u*u;ox=10-38*u;sy=1-.04*u}
else if(st==4){const u=e.tm/22;rot=-.46*u;ox=-28*u;sy=1-.03*u}
else if(st==3){const u=1-e.tm/44;sy=u<.1?.88:1+.1*Math.sin(u*Math.PI);rot=-.14*Math.sin(u*Math.PI)}
if(e.in>0)g.globalAlpha=cl(1-e.in/80,.15,1)}
else if(e.k=='fly'){const f=Math.sin(e.ph*1.7);sx=1+.11*f;sy=1-.05*f;rot=cl(e.vx*.05,-.45,.45);oy=Math.sin(e.ph*1.2)*3;if(e.st==2)rot=cl(e.vx*.07,-.7,.7)}
else{const f=Math.abs(Math.sin(e.ph));rot=dir*.16;if(e.st==0){oy=-f*7;sy=1+.04*Math.cos(e.ph*2)}else if(e.st==1){sy=.85;sx=1.1}else{rot=dir*(.5-e.vy*.05);sy=1.12}}
g.translate(X+ox*s*SZ,GY-e.y*s+oy*s);g.scale(s*SZ,s*SZ);g.scale(bs?-dir:1,1);g.rotate(rot*(bs?1:1));g.scale(sx,sy);
if(bs){g.shadowColor=e.st==1||e.st==2?'#ff7030':'#a01810';g.shadowBlur=18+(e.st==1?14:0)}
g.drawImage(im,-w/2,-HH,w,HH);if(e.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(im,-w/2,-HH,w,HH)}
g.restore();
const y=GY-(e.y+HH*SZ+10)*s,bw=(bs?110:46)*s;g.save();g.font='bold '+(bs?14:11)*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';const nm=(bs?'👹 Ma Vương Huyết Phủ (Thần Thoại)':e.k=='fly'?'Tiểu Quỷ Dơi':'Tiểu Quỷ Chạy')+' Lv'+e.lv;g.strokeText(nm,X,y-6*s);g.fillStyle=bs?'#ffb070':'#fff';g.fillText(nm,X,y-6*s);g.fillStyle='#000a';g.fillRect(X-bw/2,y,bw,5*s);g.fillStyle=bs?'#e03030':'#e8c040';g.fillRect(X-bw/2,y,bw*cl(e.hp/e.max,0,1),5*s);g.restore()}
const WGC=[3,4,5],WGD=[.1,.08,.06],WGT=[2,3,3],WGN=['Bạch Vũ Dực','Lam Phụng Dực','Thiên Phượng Dực'],WGH=[72,100,110],WGB=[.12,-.26,-.3],WGK=['#bfe8ff','#52c8ff','#ffb050'],
WGA=[{"b":ASSET_PAYLOAD("p004"),"w":208,"h":259,"px":189.0,"py":176.0,"cx":101.6,"cy":135.0},{"b":ASSET_PAYLOAD("p005"),"w":147,"h":380,"px":141.4,"py":214.3,"cx":76.0,"cy":177.1},{"b":ASSET_PAYLOAD("p006"),"w":169,"h":380,"px":149.0,"py":215.3,"cx":93.9,"cy":187.0}].map(o=>{const i=new Image();i.src='data:image/webp;base64,'+o.b;o.im=i;o.R=Math.hypot(Math.max(o.px,o.w-o.px),Math.max(o.py,o.h-o.py));return o}),
WS={ph:0,sp:.075,am:.13,pt:[],lf:-1},
WFR=i=>i==0?wfr:i==1?wf2:wf3,WFA=(i,n)=>{if(i==0)wfr+=n;else if(i==1)wf2+=n;else wf3+=n};
{const st=document.createElement('style');st.textContent=WGA.map((o,i)=>'.wgv'+i+'{background:url(data:image/webp;base64,'+o.b+') 0 0/100% 100% no-repeat}').join('')+'.wgp{display:flex;justify-content:center;align-items:flex-end;min-width:132px;min-height:84px}.wga{animation:wgf 1.7s ease-in-out infinite}@keyframes wgf{0%,100%{transform:rotate(-5deg) scaleX(1)}38%{transform:rotate(13deg) scaleX(.94)}}.wgc{display:flex;gap:10px;align-items:center}@media (prefers-reduced-motion:reduce){.wga{animation:none}}';document.head.appendChild(st)}
function wgUI(){const p=PS[cur],t=p.tier,l=wl();
let h='<div class="dt">🪽 <b>Cánh</b> — '+(l?WGN[l-1]+' · Cấp '+l+'<br><small>+'+8*l+'% công · +'+8*l+'% máu · +'+4*l+'% né</small>':'chưa có')+'<br><small>Mảnh cánh rơi từ Trùm 🕳 Hầm Ngục theo cấp cánh đang có: cấp 1 · '+WGD[0]*100+'%, cấp 2 · '+WGD[1]*100+'%, cấp 3 · '+WGD[2]*100+'%</small></div>';
for(let i=0;i<3;i++){const Wg=WGA[i],own=l>i,nxt=l==i,ok=t>=WGT[i],hv=WFR(i),c=WGC[i],z=80/Wg.h,bw=Math.round(Wg.w*z),o=(Wg.px/Wg.w*100).toFixed(1)+'% '+(Wg.py/Wg.h*100).toFixed(1)+'%',inner='<div class="wga wgv'+i+'" style="width:'+bw+'px;height:80px;transform-origin:'+o+'"></div>';
 h+='<div class="dt" style="'+(own||nxt?'':'opacity:.6')+'"><div class="wgc"><div class="wgp"><div class="wgm">'+inner+'</div><div class="wgm" style="transform:scaleX(-1)">'+inner+'</div></div><div><b style="color:'+WGK[i]+'">Cấp '+(i+1)+' · '+WGN[i]+'</b><br><small>+'+8*(i+1)+'% công · +'+8*(i+1)+'% máu · +'+4*(i+1)+'% né</small><br>'+(own?'✅ Đã sở hữu':'Mảnh cánh cấp '+(i+1)+': <b>'+hv+'</b>/'+c+(ok?'':'<br>🔒 Cần chuyển chức lần '+WGT[i]))+(nxt?'<br><button '+(ok&&hv>=c?'':'disabled')+' onclick="wgMake()">⚒ Hợp thành ('+c+' mảnh)</button>':'')+(!own&&!nxt?'<br>🔒 Cần Cánh Cấp '+i+' trước':'')+'</div></div></div>'}
return h}
function wgMake(){const p=PS[cur],l=wl();if(l>=3||p.tier<WGT[l]||WFR(l)<WGC[l])return;WFA(l,-WGC[l]);p.wg=l+1;dgSave();sv();msg='🪽 Đã hợp thành '+WGN[l]+' (Cánh Cấp '+(l+1)+')!';ui()}
const wgWv=q=>Math.sin(q)+.28*Math.sin(2*q+.6);
function wgSide(Wg,sd,k,th,am,ph0,al,comp,sx,N){const R0=Wg.R;g.save();g.scale(sd,1);g.globalCompositeOperation=comp;
 for(let i=0;i<N;i++){const u=(i+.5)/N,a=th+am*wgWv(WS.ph+ph0-.9*u)*(.7+.6*u),r0=R0*i/N*k,r1=(R0*(i+1)/N+(i<N-1?2:8))*k;
  g.save();g.beginPath();g.arc(0,0,r1,0,6.2832);if(i)g.arc(0,0,r0,0,6.2832,true);g.clip();g.rotate(a);g.scale(sx,1);g.globalAlpha=al;g.drawImage(Wg.im,-Wg.px*k,-Wg.py*k,Wg.w*k,Wg.h*k);g.restore()}
 g.restore()}
function drawWings(){const l=wl();if(!l)return;const Wg=WGA[l-1];if(!Wg.im.naturalWidth)return;
const aa=P.atk>0,mv=!!P.mv&&!aa,k=WGH[l-1]/Wg.h,t=fr,col=WGK[l-1];
if(WS.lf!==fr){WS.lf=fr;WS.sp+=((aa?.3:mv?.2:.075)-WS.sp)*.08;WS.am+=((aa?.4:mv?.28:.13)-WS.am)*.08;WS.ph+=WS.sp;
 const kf=k*.88;if(0&&WS.pt.length<(l==3?46:30)&&R()<.07+.07*l){const sd=R()<.5?-1:1,kk=sd==P.d?kf:k,u=.5+R()*.95,dx=(Wg.cx-Wg.px)*u*kk+(R()-.5)*9,dy=(Wg.cy-Wg.py)*u*kk+(R()-.5)*9,m=l==1?70:l==2?55:50;WS.pt.push({x:P.x+sd*dx,y:52-dy,vx:(R()-.5)*.25,vy:l==1?-.14:l==2?.1:.26,l:m,m:m,r:.9+R()*1.3,c:l==3&&R()<.4?'#8fe8ff':col,e:l==1,ro:R()*6.28,sd:sd})}
 WS.pt=WS.pt.filter(q=>{q.x+=q.vx+Math.sin((q.m-q.l)*.12+q.ro)*.12;q.y+=q.vy;return--q.l>0})}
const f=wgWv(WS.ph),th0=WGB[l-1]+(mv?.05:0),by=mv?-Math.abs(Math.sin(t*.3))*2.2:Math.sin(t*.08)*.7,sx=1-.1*Math.max(0,-f)*(WS.am/.3+.4),
ax=(P.x-cam)*s-P.d*2*s,ay=GY-(52-by)*s,pul=(.2+.09*l)*(.75+.25*Math.sin(t*.07)),rr=WGH[l-1]*.62;
g.save();g.translate(ax,ay);g.scale(s,s);
g.save();g.globalCompositeOperation='lighter';{const q=g.createRadialGradient(0,-4,2,0,-4,rr);q.addColorStop(0,RGBA(col,.22+.07*l));q.addColorStop(1,RGBA(col,0));g.fillStyle=q;g.beginPath();g.arc(0,-4,rr,0,6.2832);g.fill()}g.restore();
wgSide(Wg,-P.d,k,th0,WS.am,0,1,'source-over',sx,8);
wgSide(Wg,P.d,k*.88,th0*.9,WS.am*.92,.35,.9,'source-over',sx,8);
wgSide(Wg,-P.d,k,th0,WS.am,0,pul,'lighter',sx,4);
wgSide(Wg,P.d,k*.88,th0*.9,WS.am*.92,.35,pul*.8,'lighter',sx,4);
g.restore();
g.save();g.globalCompositeOperation='lighter';for(const q of WS.pt){const a=Math.min(1,q.l/q.m*1.6)*(q.l/q.m>.85?(1-q.l/q.m)/.15:1);g.globalAlpha=a*.9;g.fillStyle=q.c;g.beginPath();if(q.e)g.ellipse((q.x-cam)*s,GY-q.y*s,q.r*1.9*s,q.r*.7*s,q.ro+q.l*.04,0,6.2832);else g.arc((q.x-cam)*s,GY-q.y*s,q.r*s,0,6.2832);g.fill()}g.restore()}
const _hero=hero;hero=function(){const j=!vil&&P.jy?P.jy:0;if(j){g.save();g.translate(0,-j*s)}drawWings();if(j)g.restore();_hero()};
dgBtn();

try{document.fonts.load('700 16px "KTH Serif"');document.fonts.load('16px "KTH Serif"');document.fonts.load('22px "Ma Shan Zheng"','道玄天')}catch(e){}
rf();init();mn(0);window.QL=0;window.QCAP=2;
(function(){
try{
 if(typeof CanvasRenderingContext2D==='undefined')return;
 const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');
 if(!d||typeof d.get!=='function'||typeof d.set!=='function')return;
 Object.defineProperty(g,'shadowBlur',{configurable:true,get(){return d.get.call(this)},set(v){d.set.call(this,window.QL>=2?0:v)}});
}catch(e){try{console.warn('[Mong Tu Tien] shadowBlur optimization skipped',e)}catch(x){}}
})();
(function(){const STEP=1000/60;let last=performance.now(),acc=0,ema=16.7,cnt=0,t0=last;
function loop(now){requestAnimationFrame(loop);let dt=now-last;last=now;if(dt>250)dt=250;acc+=dt;let n=0;
while(acc>=STEP&&n<3){step();acc-=STEP;n++}if(n==3)acc=0;
if(n>0){draw();
 if(dt<100&&now-t0>4000){ema=ema*.93+dt*.07;if(++cnt>=90){cnt=0;
  if(ema>27&&window.QL<2){window.QL++;window.QCAP=[2,1.5,1][window.QL];ema=16.7;t0=now-2500;try{rs()}catch(e){}}}}}}
requestAnimationFrame(loop)})();

