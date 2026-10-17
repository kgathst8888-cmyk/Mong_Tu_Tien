/* core/01u-wings.js — Cánh (wg*, drawWings)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
const WGC=[3,4,5],WGG=[2e6,1e7,5e7],WGL=[20,100,200],WGD=[.1,.08,.06],WGT=[2,3,3],WGN=['Bạch Vũ Dực','Lam Phụng Dực','Thiên Phượng Dực'],WGH=[72,100,110],WGB=[.12,-.26,-.3],WGK=['#bfe8ff','#52c8ff','#ffb050'],
WGA=[{"b":ASSET_PAYLOAD("p004"),"w":208,"h":259,"px":189.0,"py":176.0,"cx":101.6,"cy":135.0},{"b":ASSET_PAYLOAD("p005"),"w":147,"h":380,"px":141.4,"py":214.3,"cx":76.0,"cy":177.1},{"b":ASSET_PAYLOAD("p006"),"w":169,"h":380,"px":149.0,"py":215.3,"cx":93.9,"cy":187.0}].map(o=>{const i=new Image();i.src='data:image/webp;base64,'+o.b;o.im=i;o.R=Math.hypot(Math.max(o.px,o.w-o.px),Math.max(o.py,o.h-o.py));return o}),
WS={ph:0,sp:.075,am:.13,pt:[],lf:-1},
WFR=i=>i==0?wfr:i==1?wf2:wf3,WFA=(i,n)=>{if(i==0)wfr+=n;else if(i==1)wf2+=n;else wf3+=n};
{const st=document.createElement('style');st.textContent=WGA.map((o,i)=>'.wgv'+i+'{background:url(data:image/webp;base64,'+o.b+') 0 0/100% 100% no-repeat}').join('')+'.wgp{display:flex;justify-content:center;align-items:flex-end;min-width:132px;min-height:84px}.wga{animation:wgf 1.7s ease-in-out infinite}@keyframes wgf{0%,100%{transform:rotate(-5deg) scaleX(1)}38%{transform:rotate(13deg) scaleX(.94)}}.wgc{display:flex;gap:10px;align-items:center}@media (prefers-reduced-motion:reduce){.wga{animation:none}}';document.head.appendChild(st)}
function wgUI(){const p=PS[cur],t=p.tier,l=wl();
let h='<div class="dt">🪽 <b>Cánh</b> — '+(l?WGN[l-1]+' · Cấp '+l+'<br><small>+'+8*l+'% công · +'+8*l+'% máu · +'+4*l+'% né</small>':'chưa có')+'<br><small>Mảnh cánh rơi từ Trùm 🕳 Hầm Ngục theo cấp cánh đang có: cấp 1 · '+WGD[0]*100+'%, cấp 2 · '+WGD[1]*100+'%, cấp 3 · '+WGD[2]*100+'%</small></div>';
for(let i=0;i<3;i++){const Wg=WGA[i],own=l>i,nxt=l==i,ok=t>=WGT[i],hv=WFR(i),c=WGC[i],z=80/Wg.h,bw=Math.round(Wg.w*z),o=(Wg.px/Wg.w*100).toFixed(1)+'% '+(Wg.py/Wg.h*100).toFixed(1)+'%',inner='<div class="wga wgv'+i+'" style="width:'+bw+'px;height:80px;transform-origin:'+o+'"></div>';
 h+='<div class="dt" style="'+(own||nxt?'':'opacity:.6')+'"><div class="wgc"><div class="wgp"><div class="wgm">'+inner+'</div><div class="wgm" style="transform:scaleX(-1)">'+inner+'</div></div><div><b style="color:'+WGK[i]+'">Cấp '+(i+1)+' · '+WGN[i]+'</b><br><small>+'+8*(i+1)+'% công · +'+8*(i+1)+'% máu · +'+4*(i+1)+'% né</small><br>'+(own?'✅ Đã sở hữu':'Mảnh cánh cấp '+(i+1)+': <b>'+hv+'</b>/'+c+(ok?'':'<br>🔒 Cần chuyển chức lần '+WGT[i]))+(nxt?'<br><button '+(ok&&hv>=c?'':'disabled')+' onclick="wgMake()">⚒ Hợp thành ('+c+' mảnh · '+fmtN(WGG[i])+'💰 · '+WGL[i]+'💎)</button>':'')+(!own&&!nxt?'<br>🔒 Cần Cánh Cấp '+i+' trước':'')+'</div></div></div>'}
return h}
let wgBusy=0;
function wgMake(){const p=PS[cur],l=wl();if(wgBusy||l>=3||p.tier<WGT[l]||WFR(l)<WGC[l])return;
 const g=WGG[l],c=WGL[l];
 if(gold<g){msg='Không đủ vàng: cần '+fmtN(g)+'💰';ui();return}
 if(!window.LT||!LT.spend){msg='Chưa có ví Linh Thạch (cần module Chợ Giao Dịch)';ui();return}
 if(!LT.logged()){msg='☁ Cần đăng nhập tài khoản để dùng Linh Thạch ('+c+'💎)';ui();return}
 const go=()=>{wgBusy=1;
  LT.spend(c,'wing'+(l+1)).then(r=>{wgBusy=0;
   if(!r.ok){msg=r.err==='poor'?'Không đủ Linh Thạch: cần '+c+'💎, bạn có '+fmtN(r.lt||0)+'💎':'Không trừ được Linh Thạch ('+(r.msg||r.err)+')';ui();return}
   const q=PS[cur];if(wl()!==l||gold<g||WFR(l)<WGC[l]){msg='Điều kiện hợp cánh đã thay đổi, hãy thử lại (đã trừ '+c+'💎)';ui();return}
   gold-=g;WFA(l,-WGC[l]);q.wg=l+1;dgSave();sv();msg='🪽 Đã hợp thành '+WGN[l]+' (Cánh Cấp '+(l+1)+')! (−'+fmtN(g)+'💰, −'+c+'💎)';ui()})};
 const q='Hợp '+WGN[l]+' (Cấp '+(l+1)+')?\nTốn '+WGC[l]+' mảnh cánh, '+fmtN(g)+' vàng và '+c+' Linh Thạch (khoá hoặc không khoá).';
 if(typeof gcf==='function')gcf(q,go);else if(confirm(q))go()}
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
