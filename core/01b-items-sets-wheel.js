/* core/01b-items-sets-wheel.js — Bộ trang bị, rèn/gộp, tiệm, vòng quay (reward/spin)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
const MPX=[0,2,3,4,7],LR=[[1,20],[20,40],[40,60],[60,80],[80,100]],SZ=.7,LC=t=>t>=3?100:20*(t+1);const NS=11,TY=[0,1,2,3,4,5,6,7,9],PETN=['Sói Con','Cáo Băng','Hỏa Hồ','Linh Hồn Khuyển','Hư Không Long'],EP={x:0,cd:0},BZ=[1,1.12,1,1.3],MT=[1,1.35,1.8,2.4,3.2],MTN=['Cổ Thạch','Băng Tuyết','Hỏa Ngục','U Minh','Hư Không'];let lg=0,LGX=8,NK=0,pq=[0,0],fz=[],mapSel=0,vt=null,vgo=-1,vmk=0,frag=0,hpP=3,mpP=3,cq=null,pn='Đạo Hữu',pc=0,wbs=Math.floor(Date.now()/18e5),vil=0,started=0,cur=0,lm=0,SK=[];const setN=()=>EQ.filter(i=>i&&i.r>=4&&!i.hl).length,setOn=()=>setN()>=6;const mi=()=>lg?8:MPX[mapSel],al=i=>PS[cur].al[i],alS5=()=>Math.floor(al(0)/5),alD=()=>alS5()*.5+(P.lv*30+20+sm('d'))*al(1)*.002,df=()=>Math.round((P.lv*30+20+sm('d')+alD())*ZC.cb()*ZC.pd()*HL.df()*(1+SX('defp')/100)*(window.HONP?HONP.sm():1));
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
 shNeed:10,shFee:100,shRate:.2,   /* 10 Mảnh Thánh, 20% ra 1 món Thánh (trước đây 30%) */
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
 if(window.OPT2)Object.assign(x,OPT2.holyX());else Object.keys(AXU).sort(()=>R()-.5).slice(0,7).forEach(k=>x[k]=Math.round(AXU[k]*RMX[5]*1.3*2*(1+4*.08)*C.mult*10)/10);
 return{u:0,s,r:6,l:C.lv,mp:4,hl:1,v:p[1],x,...(window.TTLB&&TTLB.holyOk(s)?{ttl:TTLB.holy()}:{}),n:SL[s][0]+' Thánh · Thánh Quang',a:Math.round(b[0]*m),d:Math.round(b[1]*m),h:Math.round(b[2]*m)}}
const mat=()=>{try{return MN.get()}catch(e){return{fe:0,hk:0}}};
const say=t=>{msg=t;ui()};
function forge(k){const m=mat();k=Math.min(k|0,Math.floor((m.fe|0)/C.fe),Math.floor((m.hk|0)/C.hk),Math.floor(S.nt/C.nt));
 if(k<1){say('Thiếu nguyên liệu: cần '+C.fe+' Quặng Sắt, '+C.hk+' Huyền Kim, '+C.nt+' Mảnh Nguyệt Thạch cho mỗi Mảnh Thánh');return}
 m.fe-=C.fe*k;m.hk-=C.hk*k;S.nt-=C.nt*k;S.sh+=k;try{sv()}catch(e){}say('💠 Luyện thành '+k+' Mảnh Thánh (hiện có '+S.sh+')')}
let cbBusy=false;
function combine(){if(cbBusy)return;if(S.sh<C.shNeed){say('Cần '+C.shNeed+' Mảnh Thánh');return}
 if(BAG.length>=capN()){say('Túi đầy, hãy dọn chỗ trước khi kết hợp');return}
 const L=window.LT;if(!(L&&L.logged&&L.logged()&&L.spend)){say('☁ Cần đăng nhập tài khoản để trả phí kết hợp '+C.shFee+'💎');return}
 if(!confirm('Chi phí mỗi lần kết hợp: '+C.shNeed+' Mảnh Thánh + '+C.shFee+'💎 Linh Thạch.\n(Linh Thạch trừ cả khi thất bại; thất bại mất thêm mảnh theo luật cũ.)\nTỉ lệ thành công '+Math.round(C.shRate*100)+'%.\nThất bại sẽ mất '+C.shLose+' Mảnh Thánh.'))return;
 cbBusy=true;say('Đang trừ phí '+C.shFee+'💎…');
 L.spend(C.shFee,'ghep_thanh').then(r=>{cbBusy=false;
  if(!r||!r.ok){say(r&&r.err==='poor'?'Không đủ Linh Thạch: cần '+C.shFee+'💎, bạn có '+(r.lt|0)+'💎 (chưa mất mảnh nào)':'Không trừ được Linh Thạch ('+((r&&(r.msg||r.err))||'lỗi')+') — chưa mất mảnh nào');return}
  if(S.sh<C.shNeed){say('Không đủ Mảnh Thánh');return}
  S.tr++;
  if(R()<C.shRate){S.sh-=C.shNeed;S.ok++;const it=gen(PIECES[Math.floor(R()*PIECES.length)]);BAG.push(it);tab=0;sel={k:'b',i:BAG.length-1};try{sv()}catch(e){}msg='🌟 Kết hợp thành công! Nhận '+it.n+' (cần Lv'+it.l+' để mặc) · −'+C.shFee+'💎';ui()}
  else{S.sh-=Math.min(S.sh,C.shLose);try{sv()}catch(e){}say('💥 Kết hợp thất bại'+(C.shLose?', mất '+C.shLose+' Mảnh Thánh':'')+' · −'+C.shFee+'💎.')}
 }).catch(()=>{cbBusy=false;say('Không trừ được Linh Thạch (lỗi mạng) — chưa mất mảnh nào')})}
function addNT(k){S.nt+=k|0}
function addSH(k){S.sh+=k|0}
function chD(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function chN(){if(S.cd!==chD()){S.cd=chD();S.cn=0}return S.cn|0}
function chPrice(lv){return Math.round(1000*lv*(1+0.5*chN()))}
function chBump(){chN();S.cn++}
function shopNT(){if(R()<C.ntShop){S.nt++;return' · 🌙 +1 Mảnh Nguyệt Thạch!'}return''}
function tipTxt(){const k=n();return'<br><span style="color:#ffe27a">✦ Bộ Thánh '+k+'/10</span>'+OPT.map((o,i)=>{const a=k>=C.need[i];return'<br><span style="color:'+(a?'#ffe27a':'#8a8a8a')+'">'+(a?'✔':'🔒')+' '+C.need[i]+' món: '+(a?o:'???')+'</span>'}).join('')}
function ui_(){if(!vil)return NV;const m=mat(),fe=m.fe|0,hk=m.hk|0,mxk=Math.min(Math.floor(fe/C.fe),Math.floor(hk/C.hk),Math.floor(S.nt/C.nt));
 const row=(e,nm,v,need)=>'<div class="st">'+e+' '+nm+': <b style="color:'+(v>=need?'#7fe08a':'#ff7a7a')+'">'+fmtN(v)+'</b> / '+fmtN(need)+'</div>';
 let h='<div class="dt" style="color:#ffe27a"><b>✨ Lò Luyện Thánh Khí</b><br><small>Trang bị Thánh <b>không rơi</b> từ bất kỳ Boss nào, chỉ chế tạo tại đây. Cấp mặc định Lv'+C.lv+'.</small></div>';
 h+='<div class="dt"><b>① Luyện Mảnh Thánh</b><br>'+row('🔩','Quặng Sắt',fe,C.fe)+row('🌑','Huyền Kim',hk,C.hk)+row('🌙','Mảnh Nguyệt Thạch',S.nt,C.nt)
  +'<button '+(mxk<1?'disabled':'')+' onclick="HL.forge(1)">⚒ Luyện 1</button><button '+(mxk<1?'disabled':'')+' onclick="HL.forge('+mxk+')">Luyện tối đa ('+mxk+')</button></div>';
 h+='<div class="dt"><b>② Kết hợp Trang bị Thánh</b><br><div class="st">💠 Mảnh Thánh: <b style="color:'+(S.sh>=C.shNeed?'#7fe08a':'#ff7a7a')+'">'+S.sh+'</b> / '+C.shNeed+'</div><div class="st">'+C.shNeed+' Mảnh Thánh → <b>'+Math.round(C.shRate*100)+'%</b> ra 1 món Thánh ngẫu nhiên (10 vị trí). Thất bại mất '+C.shLose+' mảnh. Phí mỗi lần: <b>'+C.shFee+'💎</b>.</div><div class="st">Đã kết hợp: '+S.ok+' thành công / '+S.tr+' lần</div>'
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
 gen,forge,combine,addNT,addSH,shopNT,chN,chPrice,chBump,tipTxt,ui:ui_,loadImgs,
 save:()=>({sh:S.sh|0,nt:S.nt|0,tr:S.tr|0,ok:S.ok|0,cd:S.cd||'',cn:S.cn|0}),
 load:o=>{o=o||{};S.sh=o.sh|0;S.nt=o.nt|0;S.tr=o.tr|0;S.ok=o.ok|0;S.cd=o.cd||'';S.cn=o.cn|0},
 reset:()=>{S.sh=S.nt=S.tr=S.ok=0;S.cd='';S.cn=0}}
})();
HL.loadImgs([ASSET_URL("a003"), ASSET_URL("a004"), ASSET_URL("a005"), ASSET_URL("a006"), ASSET_URL("a007"), ASSET_URL("a008"), ASSET_URL("a009"), ASSET_URL("a010"), ASSET_URL("a011"), ASSET_URL("a012")]);
/* ================= VÒNG QUAY MAY MẮN (LW) =================
   10 ô bí ẩn · quay miễn phí mỗi 15 phút hoặc dùng Chìa Khóa (Boss Thế Giới rơi 10%) */
const LW=(()=>{
const C={freeMs:8*3600e3,keyRate:.1,keyDay:5,ntN:3,
 pNT:.01,pTT:.02,pG2:.02,pG1:.05,pGood:.2,pLv:.01,   /* còn lại 90% là phần thưởng ngẫu nhiên; pGood = tỉ lệ giữ Thần Thoại/Mảnh Thánh khi trúng ô ngẫu nhiên */
 g2:8e6,g1:4e6,gs:15e5,
 SEC:['nt','rd','g1','rd','tt','rd','g1','rd','g2','rd']};   /* 10 ô: 1 Nguyệt Thạch, 1 Thiên Thần, 1 túi 2M, 2 túi 1M, 5 ngẫu nhiên */
const S={t:0,key:0,sp:0,kd:'',kn:0};
const dayK=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const bossN=()=>{if(S.kd!==dayK()){S.kd=dayK();S.kn=0}return S.kn|0};
let rot=0,busy=false,rev={},last='';
const left=()=>Math.max(0,S.t+C.freeMs-Date.now());
const fmt=ms=>{const s=Math.ceil(ms/1000),p=n=>String(n).padStart(2,'0');return p(Math.floor(s/3600))+':'+p(Math.floor(s%3600/60))+':'+p(s%60)};
function reward(cat){
 if(cat=='nt'){HL.addNT(C.ntN);return['🌙',C.ntN+' Mảnh Nguyệt Thạch']}
 if(cat=='tt'){const it=gen(P.lv,5);BAG.push(it);return['🌟','trang bị Thiên Thần: '+it.n]}
 if(cat=='g2'){gold+=C.g2;return['💰','Túi vàng '+fmtN(C.g2)]}
 if(cat=='g1'){gold+=C.g1;return['💰','Túi vàng '+fmtN(C.g1)]}
 let k=Math.floor(R()*7);if((k==3||k==6)&&R()>C.pGood)k=0;
 if(k==0){const n=150+Math.floor(R()*151);frag+=n;return['🔹',n+' mảnh chế tạo']}
 if(k==1){hpP+=20;mpP+=20;return['🧪','20 bình HP + 20 bình MP']}
 if(k==2){gold+=C.gs;return['💰','Túi vàng '+fmtN(C.gs)]}
 if(k==3){const it=gen(P.lv,4);BAG.push(it);return['📦','trang bị Thần Thoại: '+it.n]}
 if(k==4&&R()<C.pLv&&P.lv<LC(PS[cur].tier)){const l0=P.lv,need=Math.max(1,Math.ceil(nx()-P.xp));try{if(window.TGQ&&TGQ.addXp)TGQ.addXp(need);else P.xp+=need}catch(e){P.xp+=need}try{if(window.TGQ&&TGQ.lvUp)TGQ.lvUp()}catch(e){}return['⬆️','Thăng ngay 1 cấp (Lv '+(l0+1)+')!']}
 if(k==4){const v=Math.round(nx()*1.5);P.xp+=v;return['✨',fmtN(v)+' kinh nghiệm']}
 if(k==6){HL.addSH(1);return['✨','1 Mảnh Thánh']}
 let m;try{m=MN.get()}catch(e){m=null}
 if(m){const f=1000+Math.floor(R()*2001),h=500+Math.floor(R()*1501);m.fe+=f;m.hk+=h;return['⛏',f+' Quặng Sắt + '+h+' Huyền Kim']}
 gold+=C.gs;return['💰','Túi vàng '+fmtN(C.gs)]}
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
 let h='<div class="dt" style="color:#ffe27a"><b>🎡 Vòng Quay May Mắn</b><br><small>10 ô bí ẩn. Quay miễn phí mỗi 8 giờ, hoặc dùng 🗝 Chìa Khóa (Boss Thế Giới rơi 10%, tối đa 5 chìa/ngày, hôm nay đã nhận '+bossN()+'/'+C.keyDay+').</small></div>';
 let lab='';for(let i=0;i<10;i++){const a=i*36+18;lab+='<div style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;transform:rotate('+a+'deg) translateY(-92px);text-align:center;font-size:24px;line-height:34px"><span style="display:inline-block;transform:rotate('+(-a)+'deg) rotate('+(-(rot%360))+'deg)">'+(rev[i]||'❓')+'</span></div>'}
 let grad='conic-gradient(';for(let i=0;i<10;i++)grad+=cols[i%2]+' '+i*36+'deg '+(i+1)*36+'deg'+(i<9?',':'');grad+=')';
 h+='<div style="position:relative;width:250px;height:262px;margin:6px auto"><div style="position:absolute;left:50%;top:0;margin-left:-12px;border:12px solid transparent;border-top:22px solid #ffe27a;width:0;height:0;z-index:3"></div>'
  +'<div id="lwW" style="position:absolute;left:5px;top:20px;width:240px;height:240px;border-radius:50%;background:'+grad+';border:4px solid #ffe27a;box-shadow:0 0 14px #ffe27a88;transform:rotate('+rot+'deg)">'+lab+'<div style="position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#2a1a10;border:3px solid #ffe27a;text-align:center;line-height:40px;font-size:22px">🎡</div></div></div>';
 h+='<div class="dt"><div class="st">⏱ Quay miễn phí: <b id="lwT" style="color:'+(rd?'#7fe08a':'#ffb070')+'">'+(rd?'SẴN SÀNG':fmt(left()))+'</b></div><div class="st">🗝 Chìa Khóa: <b>'+S.key+'</b> · Đã quay: '+S.sp+' lần</div>'
  +'<button '+(rd&&!busy?'':'disabled')+' onclick="LW.spin(0)">🎡 Quay miễn phí</button><button '+(S.key>0&&!busy?'':'disabled')+' onclick="LW.spin(1)">🗝 Quay bằng Chìa Khóa</button></div>';
 h+='<div class="dt"><small>Tỉ lệ: 🌙 3 Mảnh Nguyệt Thạch '+C.pNT*100+'% · 🌟 trang bị Thiên Thần '+C.pTT*100+'% · 💰 Túi vàng '+fmtN(C.g2)+' '+C.pG2*100+'% · 💰 Túi vàng '+fmtN(C.g1)+' '+C.pG1*100+'% · '+Math.round((1-C.pNT-C.pTT-C.pG2-C.pG1)*100)+'% còn lại: ngẫu nhiên (mảnh chế tạo, 20 bình HP/MP, túi vàng '+fmtN(C.gs)+', trang bị Thần Thoại, kinh nghiệm (ô kinh nghiệm có '+C.pLv*100+'% thăng ngay 1 cấp, mọi cảnh giới), quặng Sắt/Huyền Kim, Mảnh Thánh).</small></div>';
 return h}
setInterval(()=>{try{if(typeof tab=='undefined'||tab!=16||!bo||busy)return;const el=document.getElementById('lwT');if(!el)return;const r=left()<=0;if(r&&el.textContent!='SẴN SÀNG'){ui();return}if(!r)el.textContent=fmt(left())}catch(e){}},1000);
return{C,S,spin,ui:ui_,
 addKey:n=>{S.key+=n|0},
 bossKey:()=>{if(bossN()>=C.keyDay)return false;S.kn++;S.key++;return true},
 save:()=>({t:S.t|0?S.t:0,key:S.key|0,sp:S.sp|0,kd:S.kd||'',kn:S.kn|0}),
 load:o=>{o=o||{};S.t=+o.t||0;S.key=o.key|0;S.sp=o.sp|0;S.kd=o.kd||'';S.kn=o.kn|0},
 reset:()=>{S.t=0;S.key=0;S.sp=0;S.kd='';S.kn=0}}
})();
