
/*==== THÁP THÍ LUYỆN · Tháp 9 tầng ở Thanh Vân Tiên Thôn ====
  - 9 tầng × 10 Boss, độ khó tăng dần. Hạ lần lượt từng Boss; hạ đủ 10 Boss thì lên tầng kế.
  - Boss mạnh hơn Trùm Thần Thoại (Hầm Ngục, màu cam-vàng "hoàng kim") ngay từ Boss đầu tiên.
  - Boss 1-9 mỗi tầng: 1% rơi trang bị Thiên Thần. Boss 10: rơi 1 Mảnh Linh Căn (nhận 1 lần/tầng).
  - Đủ 9 mảnh -> hợp thành Viên Linh Căn -> chọn thuộc tính Linh Căn (Kim/Mộc/Thủy/Hỏa/Thổ), cộng chỉ số vĩnh viễn.
  Chỉnh độ khó / tỉ lệ rơi ngay tại khối hằng số bên dưới. */
const TW_HP0=75,TW_HPS=5.5;      // Máu boss = Trùm Hầm Ngục ×(TW_HP0 + n*TW_HPS)/60  (n=0..89)
const TW_A0=1.3,TW_AS=.10;       // Sát thương boss gây ra = ×(TW_A0 + n*TW_AS) so với Trùm Hầm Ngục
const TW_DFS=.012;               // Giáp boss tăng thêm mỗi boss
const TW_B10=1.25;               // Boss 10 mỗi tầng (Tháp Chủ) máu ×1.25, sát thương ×1.15
const TW_DROP5=.01;              // Tỉ lệ rơi trang bị Thiên Thần (Boss 1-9 mỗi tầng)
const TW_GOLD=600;               // Vàng thưởng = TW_GOLD × cấp boss × (1+n/30)
const TW_REPLAY=true;            // Cho đánh lại boss đã hạ (vẫn có 1% Thiên Thần, KHÔNG nhận thêm mảnh Linh Căn)
const TW_TH=['Thạch Linh','Phong Lôi','Hàn Băng','Liệt Hỏa','Thanh Mộc','Hoàng Sa','U Minh','Kim Cang','Hỗn Độn'];
const TW_RK=['Hộ Vệ','Thống Lĩnh','Sứ Giả','Tướng Quân','Trưởng Lão','Hộ Pháp','Yêu Vương','Chiến Thần','Quân Chủ','Tháp Chủ'];
const TW_COL=['#c8b27a','#8fd0ff','#9fe8ff','#ff7a3a','#7be07a','#e0c060','#b070ff','#ffd860','#ff5ad0'];
const TW_HUE=[0,200,170,-20,90,30,250,40,300];
const TW_BG=[0,0,2,2,3,3,4,4,7];
const TW_XN={dmgp:'Sát thương',hpp:'Máu',mpp:'Nội lực',crit:'Chí mạng',cdmg:'ST chí mạng',dred:'Giảm ST nhận',dodge:'Né tránh',cspd:'Tốc độ niệm chú',aspd:'Tốc độ đánh',sdmg:'ST kỹ năng'};
const TW_ROOTS=[
 {n:'Kim',e:'⚔️',c:'#ffe08a',x:{dmgp:15,crit:8,cdmg:25}},
 {n:'Mộc',e:'🌿',c:'#7be07a',x:{hpp:20,dred:6,mpp:10}},
 {n:'Thủy',e:'💧',c:'#6fc8ff',x:{mpp:25,cspd:12}},
 {n:'Hỏa',e:'🔥',c:'#ff7a3a',x:{dmgp:12,sdmg:20,aspd:10}},
 {n:'Thổ',e:'⛰️',c:'#d0a060',x:{hpp:15,dred:10,dodge:5}}];
const twDesc=r=>Object.keys(r.x).map(k=>TW_XN[k]+' +'+r.x[k]+'%').join(' · ');
function twS(){const p=PS[cur];if(!p.tw)p.tw={p:0,fg:0,fz:0,pill:0,root:-1};return p.tw}
function twB(k){try{const t=PS[cur].tw;return t&&t.root>=0?(TW_ROOTS[t.root].x[k]||0):0}catch(e){return 0}}
const twPop=m=>{let n=0;for(let i=0;i<9;i++)if(m>>i&1)n++;return n};
const twName=n=>TW_RK[n%10]+' '+TW_TH[n/10|0];
const twHp=n=>(TW_HP0+n*TW_HPS)*(n%10==9?TW_B10:1);
const twAt=n=>(TW_A0+n*TW_AS)*(n%10==9?1.15:1);

/* ---------- bảng giao diện ---------- */
let twF=-1,twMsg='',twGoF=0;
{const st=document.createElement('style');st.textContent='#twp{display:none;position:fixed;inset:0;background:#000a;align-items:center;justify-content:center;z-index:9}#twp .twf{display:grid;grid-template-columns:repeat(9,1fr);gap:3px;margin:6px 0}#twp .twf button{margin:0;padding:6px 0;font-size:12px;position:relative}#twp .twf button.on{background:#8a6420}#twp .twf button.lk{opacity:.4}#twp .ar>div:first-child{min-width:0;flex:1}#twp .twm{background:#1c3a24;border:1px solid #7fe0a0;border-radius:6px;padding:6px 8px;margin:6px 0;font-size:12px}#twp .twfr{font-size:20px;letter-spacing:3px;text-align:center;margin:4px 0}';document.head.appendChild(st);
 const el=document.createElement('div');el.id='twp';el.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(el)}
function twRender(){
 const el=document.getElementById('twp'),st=twS(),p=st.p,fl=p>=90?8:(p/10|0);
 if(twF<0||twF>fl)twF=fl;
 const f=twF,col=TW_COL[f],nf=twPop(st.fg);
 let h='<div class="bx"><div class="bh"><span><b>🗼 Tháp Thí Luyện</b></span><span><button onclick="twClose()">✕</button></span></div>';
 if(twMsg){h+='<div class="twm">'+twMsg+'</div>';twMsg=''}
 h+='<div class="dt">9 tầng · mỗi tầng 10 Boss, <b>khó hơn cả Trùm Thần Thoại</b> (Hầm Ngục). Hạ lần lượt từng Boss để mở Boss kế và tầng kế.<br>🌟 Boss 1-9: <b>1%</b> rơi trang bị <b style="color:#ff5ad0">Thiên Thần</b> · 🔷 Boss 10: rơi <b>Mảnh Linh Căn</b> (lần đầu hạ).</div>';
 h+='<div class="qb" style="margin:6px 0"><i style="width:'+(p/90*100)+'%"></i><span>Tiến độ '+p+'/90 Boss</span></div>';
 h+='<div class="twf">'+Array.from({length:9},(_,i)=>{const lk=i>fl,dn=p>=(i+1)*10;return'<button class="'+(i==f?'on':'')+(lk?' lk':'')+'" '+(lk?'disabled':'onclick="twSel('+i+')"')+'>'+(dn?'✔':lk?'🔒':'T')+(dn||lk?'':(i+1))+'</button>'}).join('')+'</div>';
 h+='<div class="st" style="margin:2px 0 4px;color:'+col+'"><b>Tầng '+(f+1)+' · '+TW_TH[f]+'</b> — Boss: máu ×'+(twHp(f*10)/60).toFixed(1)+'→×'+(twHp(f*10+9)/60).toFixed(1)+' · sát thương ×'+twAt(f*10).toFixed(1)+'→×'+twAt(f*10+9).toFixed(1)+' (so với Trùm Thần Thoại)</div>';
 for(let i=0;i<10;i++){const n=f*10+i,dn=n<p,nx=n==p,ok=n<=p&&(TW_REPLAY||nx),rw=i<9?'🌟 1%':(st.fg>>f&1?'🔷 đã nhận':'🔷 Mảnh Linh Căn');
  h+='<div class="ar"><div><b style="color:'+(nx?'#ffe08a':dn?'#7fe0a0':'#8a7a68')+'">'+(dn?'✔':nx?'▶':'🔒')+' '+(i+1)+'. '+twName(n)+'</b><br><small>HP ×'+(twHp(n)/60).toFixed(1)+' · ST ×'+twAt(n).toFixed(1)+' · '+rw+'</small></div>'+(ok?'<button class="sm" onclick="twGo('+n+')">'+(dn?'Đánh lại':'Khiêu chiến')+'</button>':'')+'</div>'}
 const rt=st.root>=0?TW_ROOTS[st.root]:null;
 h+='<div class="qst-card"><h4>🔷 Linh Căn</h4>';
 if(rt)h+='<div>Linh căn của bạn: <b style="color:'+rt.c+'">'+rt.e+' '+rt.n+' Linh Căn</b><br><small>'+twDesc(rt)+'</small></div>';
 else if(st.pill)h+='<div class="qs">Viên Linh Căn đã thành! Chọn thuộc tính Linh Căn cho nhân vật này (không thể đổi lại):</div>'+TW_ROOTS.map((r,i)=>'<div class="ar"><div><b style="color:'+r.c+'">'+r.e+' '+r.n+' Linh Căn</b><br><small>'+twDesc(r)+'</small></div><button class="sm" onclick="twPick('+i+')">Chọn</button></div>').join('');
 else{h+='<div class="twfr">'+Array.from({length:9},(_,i)=>st.fg>>i&1?'🔷':'◇').join('')+'</div><div class="st" style="text-align:center">Mảnh Linh Căn '+nf+'/9 (mỗi tầng 1 mảnh từ Boss 10)</div>';
  if(nf>=9)h+='<div style="text-align:center"><button onclick="twFuse()">🔷 Hợp thành Viên Linh Căn</button></div>'}
 h+='</div></div>';
 el.innerHTML=h}
function twOpen(){if(!started)return;twRender();document.getElementById('twp').style.display='flex'}
function twClose(){document.getElementById('twp').style.display='none'}
function twSel(i){twF=i;twRender()}
function twFuse(){const st=twS();if(twPop(st.fg)<9||st.fz)return;st.fz=1;st.pill=1;sv();twMsg='✨ 9 mảnh hợp thành <b>Viên Linh Căn</b>! Hãy chọn thuộc tính bên dưới.';twRender()}
function twPick(i){const st=twS();if(!st.pill)return;const r=TW_ROOTS[i];if(!confirm('Dùng Viên Linh Căn để chọn '+r.n+' Linh Căn?\n'+twDesc(r)+'\nKhông thể đổi lại.'))return;st.root=i;st.pill=0;try{P.hp=Math.min(P.hp,mx())}catch(e){}sv();twMsg='✨ Linh căn <b style="color:'+r.c+'">'+r.e+' '+r.n+'</b> thức tỉnh!';twRender()}

/* ---------- vào trận ---------- */
function twGo(n){const st=twS();if(!started||!vil||n>st.p||n>89||(!TW_REPLAY&&n<st.p))return;
 twClose();bo=0;bag.style.display='none';const l0=lg;lg=0;vil=0;vt=null;vgo=-1;E=[];PETS=[];PJ=[];FX=[];P.pe=null;P.atk=0;P.x=120;P.hp=mx();P.mp=mm();SLT=[9e9,9e9,9e9,9e9,9e9];
 dg={t:0,n:20,kill:20,tw:1,tn:n,lg0:l0};DT.push({x:P.x,y:200,s:'🗼 Tháp Thí Luyện · Tầng '+((n/10|0)+1)+' · Boss '+(n%10+1),c:TW_COL[n/10|0],g:1,l:140})}
function twSpawn(){dgSp('boss');const e=E[E.length-1],n=dg.tn,k=n%10==9;
 e.max=e.hp=e.max/60*twHp(n);e.df*=1+n*TW_DFS;e.tw=1;e.tn=n;e.twN=twName(n);e.twA=twAt(n);e.twS=n/90*.9;
 DT.push({x:P.x,y:220,s:'🗼 '+e.twN+(k?' · THÁP CHỦ':'')+' xuất hiện!',c:TW_COL[n/10|0],g:1,l:170})}
function twBack(w){const st=twS();twF=Math.min(8,(w.tn/10|0)+(w.tn%10==9&&st.p>w.tn?1:0));lg=w.lg0|0;vil=1;vt=null;vgo=-1;P.x=cl(P.x,40,vw()-40);P.hp=mx();P.mp=mm();dgHud()}

const _dgTick4=dgTick;dgTick=function(){if(!dg||!dg.tw)return _dgTick4();if(over||vil||!started)return;SLT=[9e9,9e9,9e9,9e9,9e9];dg.t++;
 if(!dg.bs&&dg.t>45){dg.bs=1;twSpawn()}
 else if(dg.bs&&!E.some(e=>e.k=='boss')&&!dg.done){dg.done=1;dg.out=240;DT.push({x:P.x,y:220,s:'🏆 Hạ '+twName(dg.tn)+'!',c:'#ffe08a',g:1,l:200})}
 if(dg.done&&--dg.out<=0){dgExit();twOpen()}};
const _dgExit4=dgExit;dgExit=function(){const w=dg&&dg.tw?dg:null;_dgExit4();if(w)twBack(w)};
const _init4=init;init=function(){const w=dg&&dg.tw?dg:null;_init4();if(w){twBack(w);twMsg='💀 Bại trận trước <b>'+twName(w.tn)+'</b>. Hãy mạnh hơn rồi quay lại!';setTimeout(twOpen,300)}};
const _dgHurt4=dgHurt;dgHurt=function(e,mu){_dgHurt4(e,e&&e.tw?mu*e.twA:mu)};
const _dgAI4=dgAI;dgAI=function(e){_dgAI4(e);if(e.tw&&e.k=='boss'&&e.in<=0&&e.cd>0)e.cd-=e.twS};
const _dgHud4=dgHud;dgHud=function(){_dgHud4();if(dg&&dg.tw){const b=E.find(e=>e.k=='boss'),n=dg.tn;dgh.innerHTML='<div class="dgt" style="color:'+TW_COL[n/10|0]+'">🗼 Tầng '+((n/10|0)+1)+' · Boss '+(n%10+1)+'/10 · '+twName(n)+'</div>'+(b?'<div class="dgp"><i style="width:'+cl(b.hp/b.max*100,0,100)+'%"></i></div>':'')}};
const _dgFoe4=dgFoe;dgFoe=function(e){if(!e.tw)return _dgFoe4(e);const f=e.tn/10|0,col=TW_COL[f],X=(e.x-cam)*s,Y=GY-((e.y||0)+110)*s,R0=140*s;
 g.save();g.globalCompositeOperation='lighter';const q=g.createRadialGradient(X,Y,R0*.1,X,Y,R0*1.5);q.addColorStop(0,col+'88');q.addColorStop(.5,col+'44');q.addColorStop(1,col+'00');g.globalAlpha=.75+.2*Math.sin(fr*.1);g.fillStyle=q;g.beginPath();g.arc(X,Y,R0*1.5,0,6.283);g.fill();g.restore();
 g.save();try{if('filter' in g)g.filter='hue-rotate('+TW_HUE[f]+'deg)'}catch(x){}_dgFoe4(e);g.restore();
 g.save();g.font='bold '+Math.max(12,14*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';const ty=GY-((e.y||0)+268)*s;g.strokeText(e.twN,X,ty);g.fillStyle=col;g.fillText(e.twN,X,ty);g.restore()};

/*==== BẢN ĐỒ THÁP: "Đại Sảnh Mộc Điện" (dựng theo ảnh mẫu: sảnh gỗ bát giác nhiều tầng) ====
  Nền tĩnh vẽ 1 lần rồi cache; đèn lồng, cờ, bụi sáng, chùm sáng trời vẽ động mỗi khung hình.
  Mỗi tầng (1-9) đổi tông màu, màu đèn lồng và ánh cửa sổ. Tầng 5+ có linh khí bay lên. */
const TW_LN=['#ff9a3a','#ffb04a','#9fdcff','#ff6a3a','#8fe880','#ffd060','#c88aff','#ffe070','#ff8ae0'];
const TW_WG=['#ffe2a0','#ffe8b0','#d8f2ff','#ffc890','#e0ffb8','#fff0b0','#eed4ff','#fff2a8','#ffd8f4'];
const TWM={cv:null,k:''};
const twMix=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'};
const twRg=(h,a)=>'rgba('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')+','+a+')';
function twGeo(gy){const u=s,r=.58,vpY=gy*.5,yb=gy-36*u,Yf=(yb-vpY)/r,Yt=-(vpY-H*.2)/r,XW=W/2,cx=W/2,G=[0,.27,.47,.65,.83,1],Yk=G.map(a=>Yf+(Yt-Yf)*a),P=(X,Y,z)=>{const k=1-(1-r)*z;return[cx+X*k,vpY+Y*k]};return{u,r,vpY,yb,Yf,Yt,XW,cx,Yk,P}}

function twMapStatic(q,gy,f){
 const{u,r,vpY,yb,Yf,Yt,XW,cx,Yk,P}=twGeo(gy),wg=TW_WG[f],sc=z=>1-(1-r)*z,yy=Y=>vpY+Y*r;
 const poly=(pts,fill)=>{q.fillStyle=fill;q.beginPath();pts.forEach((p,i)=>i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1]));q.closePath();q.fill()};
 const lin=(a,b,col,w)=>{q.strokeStyle=col;q.lineWidth=w;q.beginPath();q.moveTo(a[0],a[1]);q.lineTo(b[0],b[1]);q.stroke()};
 const wq=(sd,Ya,Yb,za,zb,c0,c1,n)=>{n=n||8;for(let i=0;i<n;i++){const z0=za+(zb-za)*i/n,z1=za+(zb-za)*(i+1)/n+.004;poly([P(sd*XW,Ya,z0),P(sd*XW,Ya,z1),P(sd*XW,Yb,z1),P(sd*XW,Yb,z0)],twMix(c0,c1,(i+.5)/n))}};
 const win=(ptf,a0,a1,Y0,Y1)=>{const Ysh=Y1+(Y0-Y1)*.2,bl=ptf(a0,Y0),br=ptf(a1,Y0),tl=ptf(a0,Ysh),tr=ptf(a1,Ysh),ap=ptf((a0+a1)/2,Y1),cX=2*ap[0]-(tl[0]+tr[0])/2,cY=2*ap[1]-(tl[1]+tr[1])/2;
  const gr=q.createLinearGradient(0,ap[1],0,bl[1]);gr.addColorStop(0,twMix(wg,'#ffffff',.55));gr.addColorStop(1,twMix(wg,'#a8782c',.5));
  q.beginPath();q.moveTo(bl[0],bl[1]);q.lineTo(tl[0],tl[1]);q.quadraticCurveTo(cX,cY,tr[0],tr[1]);q.lineTo(br[0],br[1]);q.closePath();q.fillStyle=gr;q.fill();q.strokeStyle='#1c0f08';q.lineWidth=Math.max(1.2,1.8*u);q.stroke();
  const m0=ptf((a0+a1)/2,Y0),m1=ap,h0=ptf(a0,Y0+(Y1-Y0)*.5),h1=ptf(a1,Y0+(Y1-Y0)*.5);lin(m0,m1,'rgba(28,15,8,.75)',Math.max(1,1.2*u));lin(h0,h1,'rgba(28,15,8,.6)',Math.max(1,1.1*u));
  q.save();q.globalCompositeOperation='lighter';const rg=q.createRadialGradient(m0[0],(bl[1]+ap[1])/2,1,m0[0],(bl[1]+ap[1])/2,Math.abs(br[0]-bl[0])*1.4+10);rg.addColorStop(0,twRg(wg,.16));rg.addColorStop(1,twRg(wg,0));q.fillStyle=rg;q.fillRect(m0[0]-60*u,ap[1]-30*u,120*u,bl[1]-ap[1]+60*u);q.restore()};
 q.fillStyle='#0e0806';q.fillRect(0,0,W,H);
 /* trần + mái vòm bát giác + giếng trời */
 {const tl=P(-XW,Yt,0),bl=P(-XW,Yt,1),br=P(XW,Yt,1),tr=P(XW,Yt,0),gr=q.createLinearGradient(0,0,0,bl[1]);gr.addColorStop(0,'#4a2e16');gr.addColorStop(1,'#1c0f08');
  const cp=[[0,0],[W,0],[W,tr[1]],br,bl,[0,tl[1]]];poly(cp,gr);q.save();q.beginPath();cp.forEach((p,i)=>i?q.lineTo(p[0],p[1]):q.moveTo(p[0],p[1]));q.closePath();q.clip();
  const oct=(rr,k)=>{q.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8,x=cx+Math.cos(a)*rr*W,y=-H*.03+Math.sin(a)*rr*W*.36;i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath()};
  [.5,.4,.3,.21].forEach((rr,i)=>{oct(rr);q.fillStyle=i%2?'rgba(90,56,26,.55)':'rgba(40,22,10,.5)';q.fill();q.strokeStyle='rgba(224,170,80,'+(.5-i*.06)+')';q.lineWidth=Math.max(1,1.6*u);q.stroke()});
  for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;lin([cx+Math.cos(a)*.12*W,-H*.03+Math.sin(a)*.12*W*.36],[cx+Math.cos(a)*.5*W,-H*.03+Math.sin(a)*.5*W*.36],'rgba(224,170,80,.35)',Math.max(1,1.4*u))}
  oct(.13);const sg=q.createRadialGradient(cx,0,2,cx,0,.14*W);sg.addColorStop(0,'#ffffff');sg.addColorStop(.6,twMix(wg,'#ffffff',.6));sg.addColorStop(1,wg);q.fillStyle=sg;q.fill();q.strokeStyle='#e0b050';q.lineWidth=Math.max(1.5,2.4*u);q.stroke();
  for(let k=1;k<4;k++){const z=k/4,y=vpY+Yt*sc(z);lin([0,y],[W,y],'rgba(20,10,5,.7)',Math.max(1.5,3*u));lin([0,y+2*u],[W,y+2*u],'rgba(224,170,80,.25)',Math.max(1,1.2*u))}q.restore()}
 /* sàn đá */
 {const gr=q.createLinearGradient(0,yb,0,H);gr.addColorStop(0,'#52402f');gr.addColorStop(1,'#1e150e');q.fillStyle=gr;q.fillRect(0,yb,W,H-yb);
  for(let i=0;i<=8;i++){const z=i/8,y=vpY+Yf*sc(z);lin([P(-XW,Yf,z)[0],y],[P(XW,Yf,z)[0],y],'rgba(0,0,0,.28)',Math.max(1,1.2*u))}
  for(let i=-4;i<=4;i++)lin(P(i*XW/4,Yf,1),P(i*XW/4,Yf,0),'rgba(0,0,0,.24)',Math.max(1,1.1*u));
  q.save();q.globalCompositeOperation='lighter';const rg=q.createRadialGradient(cx,yb+(H-yb)*.35,4,cx,yb+(H-yb)*.35,W*.4);rg.addColorStop(0,twRg(wg,.2));rg.addColorStop(1,twRg(wg,0));q.fillStyle=rg;q.fillRect(0,yb,W,H-yb);q.restore()}
 /* tường các tầng: ground k=0, ban công k=1..4 */
 for(let k=0;k<5;k++){const Yb=Yk[k],Ya=Yk[k+1],Hh=Yb-Ya,Ye=Ya+.14*Hh,Yr=Yb-(k?.3:0)*Hh,x0=cx-XW*r,wB=2*XW*r;
  /* tường bên */
  for(const sd of[-1,1]){
   wq(sd,Ya,Ye,0,1,'#1a0e07','#3a2312');
   if(k==0){wq(sd,Ye,Yb,0,1,'#3a2616','#6a4424');[[.08,.25],[.41,.58],[.74,.91]].forEach(([a,b])=>{const yA=Ye+.12*(Yb-Ye),yB=Yb-.1*(Yb-Ye);wq(sd,yA,yB,a,b,'#2a190d','#4a2e18',3);const p=z=>[P(sd*XW,yA,z),P(sd*XW,yB,z)];lin(p(a)[0],p(b)[0],'rgba(224,170,80,.35)',Math.max(1,u));lin(p(a)[1],p(b)[1],'rgba(0,0,0,.5)',Math.max(1,u))})}
   else{wq(sd,Ye,Yr,0,1,'#5a4024','#b08848');wq(sd,Yr,Yb,0,1,'#2e1a0e','#5a381c');
    for(let z=.02;z<1;z+=.03){const a=P(sd*XW,Yr,z),b=P(sd*XW,Yb,z);lin(a,b,'rgba(14,6,3,.85)',Math.max(1,1.5*u*sc(z)))}
    lin(P(sd*XW,Yr,0),P(sd*XW,Yr,1),'#120804',Math.max(1.4,2.6*u));lin(P(sd*XW,Yr+.01*Hh,0),P(sd*XW,Yr+.01*Hh,1),'rgba(190,130,60,.7)',Math.max(1,1.1*u));
    [[.08,.25],[.41,.58],[.74,.91]].forEach(([a,b])=>win((z,Y)=>P(sd*XW,Y,z),a,b,Yr-.05*Hh,Ye+.1*Hh))}
   for(let z=.03;z<1;z+=.05){const a=P(sd*XW,Ye+.07*Hh,z);q.fillStyle='#d4a040';q.fillRect(a[0]-1.4*u,a[1]-1.4*u,2.8*u,2.8*u)}}
  /* tường sau */
  const yA=yy(Ya),yE=yy(Ye),yR=yy(Yr),yB=yy(Yb);
  let g1=q.createLinearGradient(0,yA,0,yB);
  if(k==0){g1.addColorStop(0,'#5a3a1e');g1.addColorStop(1,'#2e1c10');q.fillStyle=g1;q.fillRect(x0,yE,wB,yB-yE);for(let i=1;i<14;i++)lin([x0+wB*i/14,yE],[x0+wB*i/14,yB],'rgba(0,0,0,.3)',Math.max(1,u))}
  else{g1.addColorStop(0,'#8a6a3a');g1.addColorStop(1,'#c0985a');q.fillStyle=g1;q.fillRect(x0,yE,wB,yR-yE);q.fillStyle='#4a2c16';q.fillRect(x0,yR,wB,yB-yR);
   for(let X=-XW;X<=XW+1;X+=XW*.055){const x=cx+X*r;lin([x,yR],[x,yB],'rgba(14,6,3,.85)',Math.max(1,1.4*u))}
   lin([x0,yR],[x0+wB,yR],'#120804',Math.max(1.4,2.4*u));lin([x0,yR+1.6*u],[x0+wB,yR+1.6*u],'rgba(190,130,60,.7)',Math.max(1,1.1*u));
   [-.5,0,.5].forEach(c=>win((X,Y)=>P(X,Y,1),c*XW-.085*XW,c*XW+.085*XW,Yr-.05*Hh,Ye+.1*Hh))}
  q.fillStyle='#24140a';q.fillRect(x0,yA,wB,yE-yA);for(let i=0;i<40;i++){q.fillStyle='#d4a040';q.fillRect(x0+wB*(i+.5)/40-1.2*u,yA+(yE-yA)*.5-1.2*u,2.4*u,2.4*u)}
  lin([x0,yE],[x0+wB,yE],'rgba(224,170,80,.5)',Math.max(1,1.2*u))}
 /* cầu thang gỗ bên phải */
 {const n=9,z0=.06,z1=.62,rh=.1*(Yf-Yk[1]);for(let i=0;i<n;i++){const za=z0+(z1-z0)*i/n,zb=z0+(z1-z0)*(i+1)/n,Yh=Yf+(Yk[1]-Yf)*(i+1)/n;poly([P(XW,Yf,za),P(XW,Yh,za),P(XW,Yh,zb),P(XW,Yf,zb)],twMix('#2a190e','#44291a',i/n));lin(P(XW,Yh,za),P(XW,Yh,zb),'#b88a44',Math.max(1,1.6*u));
   const a=P(XW,Yh,(za+zb)/2),b=P(XW,Yh-rh,(za+zb)/2);lin(a,b,'#150a05',Math.max(1,1.6*u))}
  lin(P(XW,Yf-rh,z0),P(XW,Yk[1]-rh,z1),'#120804',Math.max(1.6,3*u));lin(P(XW,Yf-rh*1.04,z0),P(XW,Yk[1]-rh*1.04,z1),'rgba(190,130,60,.7)',Math.max(1,1.2*u))}
 /* cột */
 for(const sd of[-1,1])for(const z of[0,1/3,2/3,1]){const a=P(sd*XW,Yf,z),b=P(sd*XW,Yt,z),w=Math.max(6,24*u*sc(z)),g2=q.createLinearGradient(a[0]-w/2,0,a[0]+w/2,0);g2.addColorStop(0,'#1a0d06');g2.addColorStop(.5,'#52341a');g2.addColorStop(1,'#1a0d06');q.fillStyle=g2;q.fillRect(a[0]-w/2,b[1],w,a[1]-b[1]);q.fillStyle='rgba(224,170,80,.26)';q.fillRect(a[0]-w*.08,b[1],w*.16,a[1]-b[1]);
  Yk.forEach((Y,i)=>{if(i==0)return;const p=P(sd*XW,Y,z);q.fillStyle='#d4a040';q.fillRect(p[0]-w*.75,p[1]-2.2*u,w*1.5,4.4*u);q.fillStyle='#1a0d06';q.fillRect(p[0]-w*.75,p[1]+2.2*u,w*1.5,2*u)});q.fillStyle='#2a1409';q.fillRect(a[0]-w*.7,a[1]-5*u,w*1.4,5*u)}
 /* cửa ra vào bên trái + bàn thờ ở giữa */
 {const ab=P(0,Yf,1),ax=ab[0],ay=ab[1],hg=(Yf-Yk[1])*r,dX=-.62*XW,dp0=P(dX-.1*XW,Yf,1)[0],dp1=P(dX+.1*XW,Yf,1)[0],dh=hg*.78,dg=q.createLinearGradient(0,ay-dh,0,ay);dg.addColorStop(0,'#fffbe6');dg.addColorStop(1,'#ffd890');
  q.beginPath();q.moveTo(dp0,ay);q.lineTo(dp0,ay-dh+(dp1-dp0)*.5);q.quadraticCurveTo((dp0+dp1)/2,ay-dh-(dp1-dp0)*.5,dp1,ay-dh+(dp1-dp0)*.5);q.lineTo(dp1,ay);q.closePath();q.fillStyle=dg;q.fill();q.strokeStyle='#1c0f08';q.lineWidth=Math.max(2,3.4*u);q.stroke();
  q.save();q.globalCompositeOperation='lighter';const lg=q.createLinearGradient(0,ay,0,H);lg.addColorStop(0,'rgba(255,220,150,.26)');lg.addColorStop(1,'rgba(255,220,150,0)');q.fillStyle=lg;q.beginPath();q.moveTo(dp0,ay);q.lineTo(dp1,ay);q.lineTo(dp1+60*u,H);q.lineTo(dp0-30*u,H);q.fill();q.restore();
  q.fillStyle='#8a1c18';q.fillRect(ax-62*u,ay-30*u,24*u,30*u);q.fillStyle='#5a100e';q.fillRect(ax-62*u,ay-30*u,24*u,3*u);lin([ax-50*u,ay-27*u],[ax-50*u,ay],'#3a0a08',Math.max(1,1.2*u));
  q.fillStyle='#2a140c';q.fillRect(ax-38*u,ay-20*u,76*u,20*u);q.fillStyle='#9a2418';q.fillRect(ax-38*u,ay-20*u,76*u,5*u);q.fillStyle='#d4a040';q.fillRect(ax-38*u,ay-21.6*u,76*u,2*u);
  [[-17,.8],[0,1],[17,.8]].forEach(([dx,k])=>{const x=ax+dx*u,y=ay-21.6*u,sg=q.createRadialGradient(x,y-9*u*k,1,x,y-9*u*k,16*u*k);sg.addColorStop(0,'rgba(255,230,150,.55)');sg.addColorStop(1,'rgba(255,230,150,0)');q.fillStyle=sg;q.fillRect(x-16*u*k,y-26*u*k,32*u*k,32*u*k);q.fillStyle='#e8b84a';q.beginPath();q.moveTo(x-6*u*k,y);q.lineTo(x-4*u*k,y-9*u*k);q.lineTo(x+4*u*k,y-9*u*k);q.lineTo(x+6*u*k,y);q.fill();q.beginPath();q.arc(x,y-12.5*u*k,3.6*u*k,0,6.283);q.fill()});
  [-30,30].forEach(dx=>{const x=ax+dx*u;q.fillStyle='#3a8a5a';q.beginPath();q.ellipse(x,ay-26*u,5*u,6*u,0,0,6.283);q.fill();['#ff5a8a','#ffd04a','#ffffff','#ff8a3a'].forEach((c,i)=>{q.fillStyle=c;q.beginPath();q.arc(x+(i-1.5)*2.8*u,ay-30*u-(i%2)*3*u,2.2*u,0,6.283);q.fill()})});
  const py=yy(Yf+(Yk[1]-Yf)*.9);q.fillStyle='#1a0d06';q.fillRect(ax-62*u,py-8*u,124*u,16*u);q.strokeStyle='#d4a040';q.lineWidth=Math.max(1,1.4*u);q.strokeRect(ax-62*u,py-8*u,124*u,16*u);
  q.fillStyle=TW_COL[f];q.font='bold '+Math.max(7,8.4*u)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';q.textAlign='center';q.textBaseline='middle';q.fillText('THÁP THÍ LUYỆN · TẦNG '+(f+1),ax,py+.5*u)}
 /* tông màu theo tầng + tối góc */
 q.save();q.globalCompositeOperation='overlay';q.globalAlpha=.34;q.fillStyle=TW_COL[f];q.fillRect(0,0,W,H);q.restore();
 {const vg=q.createRadialGradient(cx,H*.5,H*.3,cx,H*.5,H*1);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.58)');q.fillStyle=vg;q.fillRect(0,0,W,H)}}

function twLant(x,y,w,col,ph){const sw=Math.sin(fr*.05+ph)*w*.2,h=w*1.35;g.save();g.translate(x,y);g.strokeStyle='#2a1208';g.lineWidth=Math.max(1,w*.07);g.beginPath();g.moveTo(0,-w*1.6);g.lineTo(sw*.4,0);g.stroke();g.translate(sw*.4,0);g.rotate(sw/(w*9));
 g.globalCompositeOperation='lighter';let q=g.createRadialGradient(0,h*.5,1,0,h*.5,w*2.7);q.addColorStop(0,twRg(col,.5+.1*Math.sin(fr*.15+ph)));q.addColorStop(1,twRg(col,0));g.fillStyle=q;g.beginPath();g.arc(0,h*.5,w*2.7,0,6.283);g.fill();g.globalCompositeOperation='source-over';
 g.fillStyle='#caa04a';g.fillRect(-w*.5,-w*.02,w,w*.2);q=g.createRadialGradient(0,h*.55,1,0,h*.55,w*.8);q.addColorStop(0,'#fff4c8');q.addColorStop(.55,col);q.addColorStop(1,'#7a2408');g.fillStyle=q;g.beginPath();g.ellipse(0,h*.58,w*.62,h*.46,0,0,6.283);g.fill();g.strokeStyle='rgba(90,30,8,.6)';g.lineWidth=Math.max(1,w*.05);g.beginPath();g.ellipse(0,h*.58,w*.3,h*.46,0,0,6.283);g.stroke();
 g.fillStyle='#caa04a';g.fillRect(-w*.42,h*1.0,w*.84,w*.16);g.strokeStyle='#d8321c';g.lineWidth=Math.max(1,w*.07);for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*w*.22,h*1.14);g.lineTo(i*w*.22+Math.sin(fr*.06+ph+i)*w*.12,h*1.14+w*.8);g.stroke()}g.restore()}
function twFlag(x,y,L,ph,col,d){const wv=Math.sin(fr*.09+ph)*L*.2;g.save();g.translate(x,y);g.scale(d,1);g.strokeStyle='#2a1208';g.lineWidth=Math.max(1,L*.06);g.beginPath();g.moveTo(0,-L*.3);g.lineTo(0,L*.95);g.stroke();g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,wv,L,L*.2+wv*1.3);g.lineTo(0,L*.42);g.closePath();g.fill();g.restore()}
function twMapDyn(gy,f){const{u,r,vpY,XW,cx,Yk,P}=twGeo(gy),sc=z=>1-(1-r)*z,wg=TW_WG[f],ln=TW_LN[f],t=fr;
 g.save();g.globalCompositeOperation='lighter';const bm=g.createLinearGradient(0,0,0,gy);bm.addColorStop(0,twRg(wg,.26));bm.addColorStop(1,twRg(wg,0));g.globalAlpha=.6+.18*Math.sin(t*.03);g.fillStyle=bm;g.beginPath();g.moveTo(cx-W*.1,0);g.lineTo(cx+W*.1,0);g.lineTo(cx+W*.36,gy);g.lineTo(cx-W*.36,gy);g.fill();
 g.fillStyle=wg;for(let i=0;i<30;i++){const h1=(i*.6180339)%1,h2=(i*.7548776)%1,h3=(i*.5698403)%1,y=(h2*gy+t*(.12+h3*.22))%gy,x=cx+(h1-.5)*W*(.22+.5*y/gy)+Math.sin(t*.015+i)*8*u;g.globalAlpha=(.22+.5*Math.abs(Math.sin(t*.04+i)))*(1-y/gy*.55);g.fillRect(x,y,1.5*u+h3,1.5*u+h3)}
 if(f>=4){const n=10+f*2;g.fillStyle=TW_COL[f];for(let i=0;i<n;i++){const h1=(i*.6180339)%1,h2=(i*.7548776)%1,y=gy-((t*.35+h2*400)%(gy*.9)),x=W*(.06+.88*h1)+Math.sin(t*.02+i*2)*14*u;g.globalAlpha=.35+.35*Math.sin(t*.05+i);g.beginPath();g.arc(x,y,(1.6+h2*2)*u,0,6.283);g.fill()}}
 g.restore();
 /* cờ hiệu gắn trên cột */
 [[-1,1/3,2],[1,1/3,2],[-1,2/3,2],[1,2/3,2],[-1,2/3,3],[1,2/3,3],[-1,1/3,4],[1,1/3,4]].forEach(([sd,z,k],i)=>{const Hh=Yk[k]-Yk[k+1],p=P(sd*XW,Yk[k]-.45*Hh,z);twFlag(p[0],p[1],20*u*sc(z)*1.3,i*1.7,i%2?'#e0a820':'#d8321c',-sd)});
 /* đèn lồng treo dưới ban công */
 [[-.9,.06,1],[.9,.06,1],[-.9,.4,1],[.9,.4,1],[-.9,.72,1],[.9,.72,1],[-.6,1,1],[0,1,1],[.6,1,1],[-.9,.25,2],[.9,.25,2],[-.9,.6,2],[.9,.6,2],[-.3,1,2],[.3,1,2],[-.75,.9,3],[.75,.9,3]].forEach(([X,z,k],i)=>{const w=13*u*sc(z)*(1+(1-z)*.55),p=P(X*XW,Yk[k],z);twLant(p[0],p[1]+w*1.7,w,ln,i*1.3)})}
function twBgDraw(gy,f){const k=W+'|'+H+'|'+DPR+'|'+gy+'|'+f;if(TWM.k!==k){TWM.k=k;const cv=document.createElement('canvas');cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);const q=cv.getContext('2d');q.setTransform(DPR,0,0,DPR,0,0);twMapStatic(q,gy,f);TWM.cv=cv}g.drawImage(TWM.cv,0,0,W,H);twMapDyn(gy,f)}

const _bgd4=bgd;bgd=function(gy){if(dg&&dg.tw)twBgDraw(gy,dg.tn/10|0);else _bgd4(gy)};

/* ---------- phần thưởng ---------- */
const _drop4=drop;drop=function(e){if(!e.tw)return _drop4(e);
 const n=e.tn,f=n/10|0,i=n%10,L=e.lv,st=twS(),first=n==st.p;
 gold+=gP(Math.round(TW_GOLD*L*(1+n/30)));const fr_=10+Math.floor(n/3);frag+=fr_;DT.push({x:e.x,y:120,s:'🔹 +'+fr_+' mảnh chế tạo',c:'#6ff',l:120});
 for(let j=0;j<3;j++)give(gen(L,R()<.35?4:3),e.x+(j-1)*40,150+j*34);
 if(i<9){if(R()<TW_DROP5){DT.push({x:e.x,y:270,s:'🌟 Trang bị THIÊN THẦN!',c:RC[5],l:200,g:1});give(gen(L,5),e.x,240)}}
 else if(!(st.fg>>f&1)){st.fg|=1<<f;DT.push({x:e.x,y:270,s:'🔷 Mảnh Linh Căn Tầng '+(f+1)+' ('+twPop(st.fg)+'/9)',c:'#8fe8ff',l:220,g:1});if(twPop(st.fg)>=9)DT.push({x:e.x,y:310,s:'✨ Đủ 9 mảnh! Về Tháp để hợp Viên Linh Căn',c:'#ffe08a',l:240,g:1})}
 if(first){st.p=n+1;if(st.p>=90)DT.push({x:e.x,y:350,s:'👑 Chinh phục toàn bộ Tháp Thí Luyện!',c:'#ffe08a',l:260,g:1});else if(i==9)DT.push({x:e.x,y:350,s:'🗼 Mở Tầng '+(f+2)+'!',c:'#ffe08a',l:200,g:1})}
 try{ZC.gain(300+n*40)}catch(x){}sv()};

/* ---------- nhãn + chạm vào tháp trong làng ---------- */
const _vdraw4=vdraw;vdraw=function(){_vdraw4();if(!vil||bo||!started||!window.TWPG)return;const x=TWPG.cx,y=GY-235*s,st=twS();
 g.save();g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';g.font='bold '+Math.max(13,16*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
 const a='🗼 Tháp Thí Luyện';g.strokeText(a,x,y);g.fillStyle='#ffe9a0';g.fillText(a,x,y);
 g.font=Math.max(10,12*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';const b='Tầng '+((st.p>=90?8:st.p/10|0)+1)+'/9 · '+st.p+'/90 Boss · chạm để vào';g.strokeText(b,x,y+16*s);g.fillStyle='#bff4ff';g.fillText(b,x,y+16*s);
 g.fillStyle='#ffd54a';g.font='bold '+Math.max(12,15*s)+'px KTH Serif,serif';g.fillText('▼',x,y+34*s+Math.sin(fr*.12)*4);g.restore()};
c.addEventListener('pointerdown',e=>{twGoF=0;if(!vil||bo||!started||gateGo||!window.TWPG)return;const px=e.offsetX,py=e.offsetY;
 if(Math.abs(px-TWPG.cx)<TWPG.w*.9&&py>TWPG.top&&py<GY-192*s){vt=cl(TWPG.cx/s,40,vw()-40);vgo=-1;twGoF=1}});
const _vstep4=vstep;vstep=function(){_vstep4();if(twGoF){if(mvDir)twGoF=0;else if(vt==null){twGoF=0;if(Math.abs(P.x-cl(TWPG.cx/s,40,vw()-40))<10)twOpen()}}};

/* ---------- hiện Linh Căn trong tab nhân vật ---------- */
const _charUI4=charUI;charUI=function(){let h=_charUI4();try{const st=twS();if(st.root>=0){const r=TW_ROOTS[st.root];h+='<div class="dt" style="margin-top:6px">🔷 <b style="color:'+r.c+'">'+r.e+' '+r.n+' Linh Căn</b><br><small>'+twDesc(r)+'</small></div>'}else if(st.pill)h+='<div class="dt" style="margin-top:6px">🔷 Bạn có Viên Linh Căn chưa dùng — chạm Tháp Thí Luyện ở Làng để chọn thuộc tính.</div>'}catch(e){}return h};

const _ng4=ng;ng=function(){PS.forEach(x=>{delete x.tw});_ng4()};
