
/* ===================================================================
   LINH ĐIỀN (trồng cây) + LUYỆN ĐAN
   - Hạt giống rơi ngẫu nhiên (tỉ lệ riêng từng loại) ở MỌI loại Boss
   - Cây lớn theo thời gian thật (offline vẫn lớn), thu hoạch ra dược thảo
   - Luyện đan: Đan Tu Vi · Đan thuộc tính (giới hạn mỗi cảnh giới) · Tị Lôi Đan
   - Từ Luyện Hư: tu vi không còn tự tăng, chỉ tăng bằng Đan Tu Vi
   Chỉnh cân bằng ở khối CFG / HB / PL bên dưới.
   =================================================================== */
const FM=(()=>{
const CFG={
 plots0:6,            /* số ô đất ban đầu */
 plotsMax:12,         /* số ô đất tối đa */
 plotCost:n=>4000*(n-5)*(n-5), /* vàng mở ô thứ (n+1), n = số ô hiện có */
 seedBack:.4,         /* xác suất nhận lại 1 hạt khi thu hoạch */
 gold:{tv1:150,tv2:450,pa:200,pd:200,ph:200,pm:200,pt:300,tt:300} /* vàng cơ bản mỗi viên, nhân (cảnh giới+2)² */
};
/* Dược thảo / hạt giống.  d = tỉ lệ rơi hạt [Tinh Anh, Boss Thế Giới, Boss Sử Thi, Trùm Hầm Ngục, Ma Thần] */
const HB=[
 {id:'chi', n:'Linh Chi Thảo', e:'🍄',c:'#ffd76a',g:180,y:[3,5],d:[.14,.55,.40,.35,.70],u:'Tụ Linh Đan · Thiên Tâm Đan'},
 {id:'sam', n:'Thiên Tâm Sâm', e:'🥕',c:'#ff9ad0',g:600,y:[2,3],d:[.04,.22,.15,.12,.35],u:'Thiên Tâm Đan'},
 {id:'hoa', n:'Xích Hỏa Hoa', e:'🌺',c:'#ff7a5a',g:300,y:[3,5],d:[.08,.35,.25,.22,.45],u:'Phá Quân Đan (Công)'},
 {id:'dang',n:'Huyền Quy Đằng',e:'🌿',c:'#9fd070',g:300,y:[3,5],d:[.08,.35,.25,.22,.45],u:'Kim Cang Đan (Thủ)'},
 {id:'thao',n:'Hồi Sinh Thảo', e:'🍀',c:'#7fe08a',g:300,y:[3,5],d:[.08,.35,.25,.22,.45],u:'Dưỡng Mệnh Đan (HP)'},
 {id:'lien',n:'Băng Tâm Liên', e:'❄️',c:'#8fe0ff',g:300,y:[3,5],d:[.08,.35,.25,.22,.45],u:'Ngưng Thần Đan (MP)'},
 {id:'truc',n:'Tị Lôi Trúc',   e:'🎋',c:'#c0a0ff',g:480,y:[2,4],d:[.05,.25,.18,.15,.40],u:'Tị Lôi Đan (giảm sát thương lôi kiếp)'},
 {id:'cot', n:'Cốt Linh Thảo', e:'🦴',c:'#e8d8a8',g:540,y:[2,4],d:[.06,.28,.20,.18,.42],u:'Tôi Thể Đan (chuyển cấp Phàm Nhân → Đạo Thể)'}
];
const HM={};HB.forEach(b=>HM[b.id]=b);
const BN=['Tinh Anh','Boss Thế Giới','Boss Sử Thi','Trùm Hầm Ngục','Ma Thần'];
/* Đan dược. k: tv = tu vi · a/d/h/m = thuộc tính · td = giảm sát thương lôi kiếp */
const PL=[
 {id:'tv1',n:'Tụ Linh Đan',  e:'🔴',k:'tv',f:.05,sc:.95,rc:{chi:3},d:'Cộng <b>+5%</b> tu vi cần để lên tầng kế tiếp.'},
 {id:'tv2',n:'Thiên Tâm Đan',e:'🟣',k:'tv',f:.10,sc:.90,rc:{sam:2,chi:2},d:'Cộng <b>+10%</b> tu vi cần để lên tầng kế tiếp.'},
 {id:'pa', n:'Phá Quân Đan', e:'🟠',k:'a', sc:.90,rc:{hoa:3},d:'Vĩnh viễn <b>+1,5% Công</b> mỗi viên.'},
 {id:'pd', n:'Kim Cang Đan', e:'🟤',k:'d', sc:.90,rc:{dang:3},d:'Vĩnh viễn <b>+1,5% Thủ</b> mỗi viên.'},
 {id:'ph', n:'Dưỡng Mệnh Đan',e:'🟢',k:'h',sc:.90,rc:{thao:3},d:'Vĩnh viễn <b>+1,5% HP</b> mỗi viên.'},
 {id:'pm', n:'Ngưng Thần Đan',e:'🔵',k:'m',sc:.90,rc:{lien:3},d:'Vĩnh viễn <b>+2% MP</b> mỗi viên.'},
 {id:'pt', n:'Tị Lôi Đan',   e:'🟡',k:'td',sc:.90,rc:{truc:3},d:'Giảm <b>12% sát thương Lôi Kiếp</b> của lần độ kiếp kế tiếp (tối đa 4 viên = −48%).'},
 {id:'tt',n:'Tôi Thể Đan',  e:'⚪',k:'tt',sc:.85,rc:{cot:2,thao:1},d:'Dược liệu tôi luyện thân thể: <b>cần 100 viên</b> để chuyển cấp từ <b>Phàm Nhân lên Đạo Thể</b> (Hợp Đạo Đài). Không dùng trực tiếp.'}
];
const PM={};PL.forEach(p=>PM[p.id]=p);
const KN={a:'Công',d:'Thủ',h:'HP',m:'MP'};
const fresh=()=>({seeds:{},herbs:{},pills:{},np:CFG.plots0,plots:Array(CFG.plots0).fill(null),sel:'chi'});
let S=fresh();
const ft=s=>{s=Math.max(0,Math.ceil(s));const m=Math.floor(s/60),x=s%60;return m+':'+String(x).padStart(2,'0')};
const gc=p=>Math.round(CFG.gold[p.id]*Math.pow(ZC.rI()+2,2));
const rcTx=p=>Object.keys(p.rc).map(h=>HM[h].e+' '+HM[h].n+' ×'+p.rc[h]+' <span style="opacity:.7">('+(S.herbs[h]|0)+')</span>').join(' + ');
const save=()=>{try{if(typeof started!='undefined'&&started)sv()}catch(e){}};
let on=false,NT={s:'',c:'#ffe9a0',t:0};
const note=(s,c)=>{NT={s:String(s).replace(/<[^>]+>/g,''),c:c||'#ffe9a0',t:170}};
const noF=()=>0;   /* trồng/thu hoạch được ngay trong túi, không cần vào bản đồ Linh Điền */
const fin=m=>{msg=m;if(on)note(m);save();ui()};
const grow=p=>p.t0+HM[p.id].g*1000;

/* ---------- Rơi hạt giống từ Boss ---------- */
function seedDrop(e){
 if(!e)return;
 let ti=-1;
 if(e.mt)ti=4;
 else if(e.dg){if(e.k=='boss')ti=3}
 else if(e.b==3)ti=2;
 else if(e.b==2)ti=1;
 else if(e.b==1)ti=0;
 if(ti<0)return;
 let n=0;
 HB.forEach(b=>{if(R()<b.d[ti]){S.seeds[b.id]=(S.seeds[b.id]|0)+1;DT.push({x:e.x+(n%2?26:-26),y:215+n*26,s:'🌱 Hạt '+b.n,c:b.c,l:130});n++}});
}

/* ---------- Trồng cây ---------- */
function sel(id){S.sel=id;ui()}
function plant(i){
 if(noF())return;if(S.plots[i])return;
 const id=S.sel;
 if(!(S.seeds[id]>0)){msg='Hết hạt '+HM[id].n+'. Hạt giống rơi từ các Boss.';ui();return}
 S.seeds[id]--;S.plots[i]={id,t0:Date.now()};
 fin('🌱 Đã gieo '+HM[id].n+' · chín sau '+ft(HM[id].g));
}
function plantAll(){
 if(noF())return;const id=S.sel;let c=0;
 for(let i=0;i<S.plots.length;i++){if(!S.plots[i]&&S.seeds[id]>0){S.seeds[id]--;S.plots[i]={id,t0:Date.now()};c++}}
 fin(c?'🌱 Đã gieo '+c+' ô '+HM[id].n:'Không có ô trống hoặc hết hạt '+HM[id].n);
}
function harvOne(i,o){
 const p=S.plots[i];if(!p||Date.now()<grow(p))return 0;
 const b=HM[p.id],n=b.y[0]+Math.floor(R()*(b.y[1]-b.y[0]+1));
 S.herbs[b.id]=(S.herbs[b.id]|0)+n;o.h[b.id]=(o.h[b.id]|0)+n;
 if(R()<CFG.seedBack){S.seeds[b.id]=(S.seeds[b.id]|0)+1;o.s[b.id]=(o.s[b.id]|0)+1}
 S.plots[i]=null;return 1;
}
function harvTx(o){
 const a=Object.keys(o.h).map(k=>HM[k].e+HM[k].n+' ×'+o.h[k]).join(', '),b=Object.keys(o.s).map(k=>'🌱'+HM[k].n+' ×'+o.s[k]).join(', ');
 return '🌾 Thu hoạch: '+a+(b?' · nhận lại hạt: '+b:'');
}
function harv(i){if(noF())return;const o={h:{},s:{}};if(harvOne(i,o))fin(harvTx(o))}
function harvAll(){if(noF())return;const o={h:{},s:{}};let c=0;for(let i=0;i<S.plots.length;i++)c+=harvOne(i,o);if(c)fin(harvTx(o));else{msg='Chưa có cây nào chín';ui()}}
function buyPlot(){
 if(noF())return;if(S.np>=CFG.plotsMax)return;
 const c=CFG.plotCost(S.np);
 if(gold<c){msg='Thiếu vàng: cần '+fmtN(c)+'💰 để mở thêm ô đất';ui();return}
 gold-=c;S.np++;S.plots.push(null);fin('🟫 Đã mở thêm ô đất ('+S.np+'/'+CFG.plotsMax+')');
}
const rdy=()=>S.plots.some(p=>p&&Date.now()>=grow(p));

function farmFull(){
 const now=Date.now(),sb=HM[S.sel];
 let h='<div class="dt">🌱 <b>Linh Điền</b><br><small>Hạt giống rơi ngẫu nhiên từ <b>mọi Boss</b> (Tinh Anh, Thế Giới, Sử Thi, Trùm Hầm Ngục, Ma Thần), mỗi loại có tỉ lệ riêng. Cây lớn theo thời gian thật, cả khi bạn thoát game. Thu hoạch ra dược thảo để luyện đan ở tab ⚗ Đan.</small></div>';
 h+='<div class="fm-g">'+HB.map(b=>`<button class="fmsel${S.sel==b.id?' on':''}" style="--c:${b.c}" onclick="FM.sel('${b.id}')"><span class="fe">${b.e}</span><b>${b.n}</b><small>Hạt <b>${S.seeds[b.id]|0}</b> · Thảo <b>${S.herbs[b.id]|0}</b></small><small>⏱ ${ft(b.g)} · ${b.y[0]}-${b.y[1]} thảo</small></button>`).join('')+'</div>';
 h+=`<div class="st" style="margin:2px 0 4px">Đang chọn gieo: <b style="color:${sb.c}">${sb.e} ${sb.n}</b> — dùng cho ${sb.u}</div>`;
 h+='<div class="fm-p">'+S.plots.map((p,i)=>{
  if(!p)return `<button class="fmp empty" onclick="FM.plant(${i})"><span class="fe">＋</span><small>Gieo ${sb.n}</small></button>`;
  const b=HM[p.id],rem=(grow(p)-now)/1000;
  if(rem<=0)return `<button class="fmp ready" style="--c:${b.c}" onclick="FM.harv(${i})"><span class="fe">${b.e}</span><b>Chín rồi!</b><small>Chạm thu hoạch</small></button>`;
  const pc=Math.min(100,100-rem/b.g*100);
  return `<div class="fmp grow" style="--c:${b.c}"><span class="fe">${b.e}</span><b>${b.n}</b><div class="fmbar"><i data-fmb="${i}" style="width:${pc}%"></i></div><small data-fmt="${i}">${ft(rem)}</small></div>`}).join('')+'</div>';
 h+='<div class="fmb"><button onclick="FM.harvAll()"'+(rdy()?'':' disabled')+'>🌾 Thu hoạch tất cả</button><button onclick="FM.plantAll()">🌱 Gieo đầy ô trống</button>';
 if(S.np<CFG.plotsMax)h+=`<button onclick="FM.buyPlot()">🟫 Mở ô đất (${fmtN(CFG.plotCost(S.np))}💰)</button>`;
 h+='</div>';
 h+='<details class="wd"><summary>📊 Tỉ lệ rơi hạt giống theo Boss</summary><div class="dt" style="font-size:12px">'+
  '<table class="fmt"><tr><th></th>'+BN.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+
  HB.map(b=>'<tr><td>'+b.e+' '+b.n+'</td>'+b.d.map(v=>'<td>'+Math.round(v*100)+'%</td>').join('')+'</tr>').join('')+'</table></div></details>';
 return h;
}

/* chạm ô đất trong bản đồ Linh Điền */
function tapPlot(i){
 if(i<0||i>=S.plots.length)return;
 const p=S.plots[i];
 if(!p){if(S.seeds[S.sel]>0)plant(i);else note('Hết hạt '+HM[S.sel].n+' · chọn loại hạt khác ở thanh dưới','#ffb070')}
 else if(Date.now()>=grow(p))harv(i);
 else note(HM[p.id].e+' '+HM[p.id].n+' còn '+ft((grow(p)-Date.now())/1000)+' nữa chín','#bff4ff');
}

function farmSum(){
 const now=Date.now(),L=[];S.plots.forEach((p,i)=>{if(p)L.push([p,i])});
 let h='<div class="dt">🌱 <b>Linh Điền</b> · đang trồng <b>'+L.length+'/'+S.np+'</b> ô<br><small>Muốn <b>trồng và thu hoạch</b> phải vào bản đồ <b>Linh Điền</b>: chạm cổng 🌱 trên trời Làng Thanh Vân (🏘 Làng). Cây vẫn lớn khi bạn đi đánh quái hoặc thoát game.</small></div>';
 if(!L.length)return h+'<div class="dt">Chưa trồng cây nào.</div>';
 h+='<div class="fm-p">'+L.map(([p,i])=>{
  const b=HM[p.id],rem=(grow(p)-now)/1000;
  if(rem<=0)return `<div class="fmp ready" style="--c:${b.c};cursor:default"><span class="fe">${b.e}</span><b>${b.n}</b><small>Đã chín!</small><small>Vào Linh Điền thu hoạch</small></div>`;
  const pc=Math.min(100,100-rem/b.g*100);
  return `<div class="fmp grow" style="--c:${b.c}"><span class="fe">${b.e}</span><b>${b.n}</b><div class="fmbar"><i data-fmb="${i}" style="width:${pc}%"></i></div><small data-fmt="${i}">${ft(rem)}</small></div>`}).join('')+'</div>';
 return h;
}
function farmUI(){return farmFull()}

/* ---------- Luyện đan ---------- */
const maxBrew=p=>Math.max(0,Math.min(Math.floor(gold/gc(p)),...Object.keys(p.rc).map(h=>Math.floor((S.herbs[h]|0)/p.rc[h]))));
function brew(id,n){
 const p=PM[id];if(!p)return;
 let m=maxBrew(p);if(n<=0||n>m)n=m;
 if(n<1){msg=gold<gc(p)?'Thiếu vàng: cần '+fmtN(gc(p))+'💰 mỗi viên':'Thiếu dược thảo để luyện '+p.n;ui();return}
 let ok=0;
 for(let i=0;i<n;i++){
  Object.keys(p.rc).forEach(h=>S.herbs[h]-=p.rc[h]);gold-=gc(p);
  if(R()<p.sc){ok++;S.pills[id]=(S.pills[id]|0)+1}
 }
 fin(ok==n?'⚗ Luyện thành '+ok+' '+p.n+' ✨':'⚗ Luyện '+n+' lò: thành '+ok+' '+p.n+', hỏng '+(n-ok));
}
function canUse(p){
 if(!(S.pills[p.id]>0))return 0;
 if(p.k=='tv')return ZC.tvInfo().done?0:1;
 if(p.k=='tt')return 0;
 if(p.k=='td')return(ZC.rI()+1>=3&&ZC.tdn()<ZC.TDM)?1:0;
 return ZC.pCnt(p.k)<ZC.PLIM?1:0;
}
function use(id,n){
 const p=PM[id];if(!p)return;
 if(!(S.pills[id]>0)){msg='Hết '+p.n;ui();return}
 if(p.k=='tt'){msg='Tôi Thể Đan dùng để chuyển cấp Đạo Thể ở Hợp Đạo Đài (cần 100 viên).';ui();return}
 let c=0;const lim=n<=0?9999:n;
 while(c<lim&&S.pills[id]>0){
  let ok=0;
  if(p.k=='tv')ok=ZC.pillTv(p.f);else if(p.k=='td')ok=ZC.pillTd();else ok=ZC.pillStat(p.k);
  if(!ok)break;
  S.pills[id]--;c++;
 }
 if(!c){
  msg=p.k=='tv'?'Tu vi đã đầy — hãy đột phá cảnh giới/tầng kế tiếp!':p.k=='td'?(ZC.rI()+1<3?'Chỉ cần Tị Lôi Đan khi sắp đột phá Nguyên Anh trở lên':'Đã đạt tối đa '+ZC.TDM+' viên Tị Lôi Đan'):'Đã đạt giới hạn '+ZC.PLIM+' viên '+p.n+' ở cảnh giới này. Đột phá để dùng tiếp!';
  ui();return;
 }
 fin('💊 Đã dùng '+c+' '+p.n+(p.k=='tv'?' → '+ZC.nm():''));
}
/* dùng đan tu vi cho tới khi đầy (ưu tiên viên vừa đủ, tránh phí ở tầng 9) */
function useAllTv(){
 const L=PL.filter(p=>p.k=='tv').sort((a,b)=>b.f-a.f);let c=0;
 for(let g=0;g<400;g++){
  const I=ZC.tvInfo();if(I.done)break;
  const rem=I.need-I.q,av=L.filter(p=>S.pills[p.id]>0);if(!av.length)break;
  let p=I.cap?av.find(x=>I.need*x.f<=rem+1)||av[av.length-1]:av[0];
  if(!ZC.pillTv(p.f))break;S.pills[p.id]--;c++;
 }
 fin(c?'💊 Đã dùng '+c+' Đan Tu Vi → '+ZC.nm():(ZC.tvInfo().done?'Tu vi đã đầy — hãy đột phá!':'Không có Đan Tu Vi. Hãy trồng Linh Chi Thảo / Thiên Tâm Sâm rồi luyện đan.'));
}

function alchUI(){
 let h='<div class="dt">⚗ <b>Luyện Đan</b><br><small>Dùng dược thảo từ Linh Điền + vàng để luyện đan (có thể hỏng lò).<br>• <b>Đan Tu Vi</b>: cộng tu vi — <b>từ Luyện Hư trở lên đây là cách duy nhất để lên tu vi</b>.<br>• <b>Đan thuộc tính</b>: tăng vĩnh viễn, giới hạn <b>'+ZC.PLIM+' viên/loại ở mỗi cảnh giới</b>.<br>• <b>Tị Lôi Đan</b>: giảm sát thương Lôi Kiếp lần độ kiếp kế tiếp.<br>• <b>Tôi Thể Đan</b>: cần 100 viên để chuyển cấp Phàm Nhân → Đạo Thể (Hợp Đạo Đài).</small></div>';
 PL.forEach(p=>{
  const have=S.pills[p.id]|0,mb=maxBrew(p);let ex='';
  if(p.k=='tv'){const I=ZC.tvInfo();ex=`<div class="st">Tu vi hiện tại: ${fmtN(I.q)}/${fmtN(I.need)}${ZC.auto()?'':' <span style="color:#ffb070">(không tự tăng)</span>'}</div>`}
  else if(p.k=='td'){ex=`<div class="st">Đang có hiệu lực: <b>${ZC.tdn()}/${ZC.TDM}</b> viên · giảm <b>${Math.round((1-ZC.tdm())*100)}%</b> sát thương lôi kiếp kế tiếp${ZC.rI()+1<3?' <span style="opacity:.7">(dùng khi sắp đột phá Nguyên Anh+)</span>':''}</div>`}
  else if(p.k=='tt'){ex=`<div class="st">Đang có <b>${have}</b>/100 · dùng để chuyển cấp Phàm Nhân → Đạo Thể tại Hợp Đạo Đài (Thành Thị Linh Giới)</div>`}
  else{const u=ZC.pCnt(p.k),t=ZC.pTot(p.k);ex=`<div class="st">Cảnh giới này: <b>${u}/${ZC.PLIM}</b> · Tổng đã dùng ${t} → ${KN[p.k]} <b>+${(t*ZC.PEF[p.k]*100).toFixed(1)}%</b></div>`}
  h+=`<div class="dt fmpl"><div class="fmh">${p.e} <b>${p.n}</b><span class="fmc">Có ${have}</span></div><div class="st">${p.d}</div><div class="st">Nguyên liệu: ${rcTx(p)} · ${fmtN(gc(p))}💰 · thành ${Math.round(p.sc*100)}%</div>${ex}<div class="fmb"><button ${mb<1?'disabled':''} onclick="FM.brew('${p.id}',1)">Luyện ×1</button><button ${mb<5?'disabled':''} onclick="FM.brew('${p.id}',5)">×5</button><button ${mb<1?'disabled':''} onclick="FM.brew('${p.id}',0)">Tối đa (${mb})</button><button ${canUse(p)?'':'disabled'} onclick="FM.use('${p.id}',1)">💊 Dùng</button>${p.k=='tv'?`<button ${canUse(p)?'':'disabled'} onclick="FM.useAllTv()">Dùng hết</button>`:''}</div></div>`;
 });
 return h;
}
/* khối nhỏ hiển thị trong tab Tu tiên */
function tvBar(){
 const I=ZC.tvInfo();
 let h=`<div class="dt">💊 <b>Đan dược</b> ${ZC.auto()?'':'<span style="color:#ffb070">· tu vi KHÔNG còn tự tăng, chỉ tăng bằng đan</span>'}<br>🔴 Tụ Linh Đan <b>${S.pills.tv1|0}</b> · 🟣 Thiên Tâm Đan <b>${S.pills.tv2|0}</b><br>`+
  `<button ${(S.pills.tv1|0)&&!I.done?'':'disabled'} onclick="FM.use('tv1',1)">Dùng Tụ Linh</button><button ${(S.pills.tv2|0)&&!I.done?'':'disabled'} onclick="FM.use('tv2',1)">Dùng Thiên Tâm</button><button ${((S.pills.tv1|0)+(S.pills.tv2|0))&&!I.done?'':'disabled'} onclick="FM.useAllTv()">Dùng tối đa</button>`;
 if(ZC.rI()+1>=3&&!I.done||ZC.rI()+1>=3&&ZC.tdn()>0)h+=`<br>🟡 Tị Lôi Đan: <b>${S.pills.pt|0}</b> · hiệu lực ${ZC.tdn()}/${ZC.TDM} (−${Math.round((1-ZC.tdm())*100)}% lôi kiếp) <button ${canUse(PM.pt)?'':'disabled'} onclick="FM.use('pt',1)">Dùng Tị Lôi Đan</button>`;
 return h+'</div>';
}
const sumTxt=()=>'Công ×'+ZC.pa().toFixed(3)+' · Thủ ×'+ZC.pd().toFixed(3)+' · HP ×'+ZC.ph().toFixed(3)+' · MP ×'+ZC.pm().toFixed(3);
const any=()=>ZC.pa()>1||ZC.pd()>1||ZC.ph()>1||ZC.pm()>1;

/* ---------- Lưu / tải ---------- */
function ld(o){
 S=fresh();on=false;
 if(o&&typeof o=='object'){
  S.seeds=o.seeds||{};S.herbs=o.herbs||{};S.pills=o.pills||{};S.sel=HM[o.sel]?o.sel:'chi';
  S.np=Math.max(CFG.plots0,Math.min(CFG.plotsMax,o.np|0||CFG.plots0));
  S.plots=Array(S.np).fill(null);(o.plots||[]).forEach((p,i)=>{if(i<S.np&&p&&HM[p.id])S.plots[i]={id:p.id,t0:+p.t0||Date.now()}});
 }
}
const sv_=()=>JSON.parse(JSON.stringify(S));

/* cập nhật đồng hồ cây khi đang mở tab Linh Điền */
setInterval(()=>{
 try{
  if(!bo||tab!=12)return;
  const now=Date.now();let re=0;
  S.plots.forEach((p,i)=>{
   if(!p)return;
   const b=HM[p.id],rem=(grow(p)-now)/1000;
   if(rem<=0){re=1;return}
   const t=bag.querySelector('[data-fmt="'+i+'"]'),bb=bag.querySelector('[data-fmb="'+i+'"]');
   if(t)t.textContent=ft(rem);if(bb)bb.style.width=Math.min(100,100-rem/b.g*100)+'%';
  });
  if(re)ui();
 }catch(e){}
},1000);

return{isOn:()=>on,setOn:v=>{on=!!v},note,nt:()=>NT,tickNote:()=>{if(NT.t>0)NT.t--},tap:tapPlot,get:()=>S,ft,HM,seedDrop,sel,plant,plantAll,harv,harvAll,buyPlot,farmUI,alchUI,brew,use,useAllTv,tvBar,sumTxt,any,rdy,save:sv_,load:ld,reset:()=>{S=fresh();on=false},HB,PL}
})();
/* Rơi hạt giống ở mọi Boss: bọc hàm drop() sau cùng để bao trùm Boss thường, Trùm Hầm Ngục, Ma Thần */
(()=>{const _d=drop;drop=function(e){_d(e);try{FM.seedDrop(e)}catch(x){}}})();
/* Game mới: xóa dữ liệu Linh Điền */
(()=>{const _n=ng;ng=function(){try{FM.reset()}catch(x){}_n()}})();
