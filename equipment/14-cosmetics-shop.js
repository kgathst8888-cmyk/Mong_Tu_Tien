/* equipment/14-cosmetics-shop.js */

/*==== TIỆM Y PHỤC LINH VÂN · Ngoại trang (chỉ làm đẹp, không cộng chỉ số) ====
  Tiền tệ: 💠 Đồng Huyền Tinh — rơi từ Boss Thế Giới 🐲 và Boss Hoàng Kim 👑 (chỉnh ở HT_DROP).
  Tiệm hiện TRỐNG: thêm món bằng cách đẩy vào mảng FSI bên dưới. Mẫu:
   {id:'y1',c:'y',n:'Tên',e:'👘',r:1,p:30,d:'Mô tả',o:{h:172,sm:1,lm:1,la:0,gs:.18}}      // Y phục: nhuộm màu
       h = sắc độ đích 0-360 · h2 = sắc độ vùng sáng (tuỳ chọn) · sm = nhân bão hòa · lm/la = nhân/cộng độ sáng · gs = bão hòa vùng xám
   {id:'w1',c:'w',n:'Tên',e:'🪽',r:2,p:80,d:'...',draw:(g,t)=>{...}}                    // Cánh (vẽ sau lưng)
   {id:'a1',c:'a',n:'Tên',e:'🌸',r:2,p:80,d:'...',draw:(g,t,ph)=>{...}}                 // Hào quang (ph=0 sau thân, 1 trước thân)
   {id:'h1',c:'h',n:'Tên',e:'👑',r:3,p:150,d:'...',draw:(g,t)=>{...}}                   // Đầu quan
  Hàm draw vẽ trong khung nhân vật: chân ở (0,0), đầu ≈ y = -150, trục x đối xứng. Có sẵn FSH.util.glow / FSH.util.feather.
  Tuỳ chọn cho mọi món: cls:['w'] (chỉ lớp nhân vật w=Chiến binh/Kiếm Khách·Thương Thủ, m=Phù thủy, a=Cung thủ) + clsN (tên hiển thị) · fx:{gold:.2} (+20% vàng nhận được khi mặc) + fxD (mô tả hiệu ứng)
  · Y phục còn có bg(g,t) vẽ phía sau và ov(g,t) vẽ đè lên thân theo toạ độ ảnh gốc nhân vật (đầu, vai, ngực… dính theo chuyển động).
  p = giá bằng Đồng Huyền Tinh · r = phẩm 1-4. Mỗi nhân vật có tủ đồ riêng (PS[cur].fa); số Huyền Tinh dùng chung cả tài khoản. */
window.FSH=(()=>{
const FONT='KTH Serif,Songti SC,STKaiti,KaiTi,serif';
const HT_DROP={wb:[3,6],gb:[1,2]};      /* [ít nhất, nhiều nhất] mỗi lần hạ: Boss Thế Giới (wb) · Boss Hoàng Kim 👑 (gb) */
const GRD=[null,{n:'Tinh Phẩm',c:'#6fe08a'},{n:'Quý Phẩm',c:'#78b4ff'},{n:'Cực Phẩm',c:'#ffb040'},{n:'Tuyệt Thế',c:'#ff5ad0'}];
const CAT=[{k:'y',n:'Y Phục',e:'👘'},{k:'w',n:'Cánh',e:'🪽'},{k:'a',n:'Hào Quang',e:'🌸'},{k:'h',n:'Đầu Quan',e:'👑'}];

/* ---------- Bạch Long Kiếm Y (toạ độ ảnh gốc của Kiếm Khách / Thương Thủ: đầu ≈ (92,58), vai ≈ (50,98)/(130,104), ngực ≈ (92,110), khoá thắt lưng ≈ (105,166)) ---------- */
function blBg(g,t){const q=g.createRadialGradient(0,-80,6,0,-80,64);q.addColorStop(0,'rgba(190,225,255,'+(.2+.06*Math.sin(t*.05))+')');q.addColorStop(1,'rgba(190,225,255,0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(0,-80,64,0,6.283);g.fill();g.restore()}
function blOv(g,t){const pu=.5+.5*Math.sin(t*.07),GO='#dcbc78',GD='#8a6a2c';
 const sil=(x0,y0,x1,y1)=>{const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,'#ffffff');q.addColorStop(.5,'#dde4ef');q.addColorStop(1,'#929fb6');return q};
 const gem=(x,y,w,h)=>{g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(x,y,1,x,y,w*2.8);gl.addColorStop(0,'rgba(90,160,255,'+(.4+.3*pu)+')');gl.addColorStop(1,'rgba(90,160,255,0)');g.fillStyle=gl;g.beginPath();g.arc(x,y,w*2.8,0,6.283);g.fill();g.restore();
  const q=g.createLinearGradient(x-w,y-h,x+w,y+h);q.addColorStop(0,'#c8e8ff');q.addColorStop(.45,'#2f80ff');q.addColorStop(1,'#0a2a8c');g.fillStyle=q;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y);g.lineTo(x,y+h);g.lineTo(x-w,y);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=2.2;g.stroke();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.moveTo(x-w*.15,y-h*.82);g.lineTo(x+w*.5,y-h*.08);g.lineTo(x-w*.25,y-h*.2);g.closePath();g.fill()};
 const horn=(sd)=>{g.save();g.translate(92,0);g.scale(sd,1);const q=g.createLinearGradient(-24,30,-56,-14);q.addColorStop(0,GD);q.addColorStop(.35,'#f0dca8');q.addColorStop(1,'#fffbe8');g.fillStyle=q;g.beginPath();g.moveTo(-22,34);g.quadraticCurveTo(-48,30,-58,-14);g.quadraticCurveTo(-42,8,-16,22);g.closePath();g.fill();g.strokeStyle=GD;g.lineWidth=1.4;g.stroke();g.restore()};
 /* sừng + mão */
 horn(-1);horn(1);
 g.fillStyle=sil(70,-4,118,44);g.beginPath();g.moveTo(66,46);g.bezierCurveTo(58,20,74,-6,92,-6);g.bezierCurveTo(110,-6,126,20,118,46);g.lineTo(112,40);g.quadraticCurveTo(92,31,72,40);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=2.4;g.stroke();
 g.fillStyle=sil(86,-26,98,-2);g.beginPath();g.moveTo(84,-2);g.lineTo(92,-28);g.lineTo(100,-2);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=1.6;g.stroke();
 g.strokeStyle=GO;g.lineWidth=3;g.beginPath();g.moveTo(68,38);g.quadraticCurveTo(92,28,116,38);g.stroke();
 [[66,44,76,44,78,72,70,68],[118,44,108,44,106,72,114,68]].forEach(p=>{g.fillStyle=sil(66,44,76,72);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[2],p[3]);g.lineTo(p[4],p[5]);g.lineTo(p[6],p[7]);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=1.4;g.stroke()});
 gem(92,34,5.5,7.5);
 /* giáp vai rồng */
 const paul=(cx,cy,rx,ry,rot,sd)=>{g.save();g.translate(cx,cy);g.rotate(rot);for(let i=0;i<3;i++){g.fillStyle=sil(-rx,0,rx,ry*2);g.beginPath();g.ellipse(sd*2,ry*.55+i*ry*.36,rx*(.92-i*.09),ry*.34,0,0,Math.PI);g.fill();g.strokeStyle=GO;g.lineWidth=1.6;g.stroke()}
  for(let i=0;i<4;i++){const a=-2.55+i*.5+(sd>0?.35:0),bx=Math.cos(a)*rx*.95,by=Math.sin(a)*ry*.95,L=15-i*1.5;g.fillStyle='#f4f6fb';g.beginPath();g.moveTo(bx-4*Math.cos(a+1.57),by-4*Math.sin(a+1.57));g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.lineTo(bx+4*Math.cos(a+1.57),by+4*Math.sin(a+1.57));g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=1.2;g.stroke()}
  g.fillStyle=sil(-rx,-ry,rx,ry);g.beginPath();g.ellipse(0,0,rx,ry,0,0,6.283);g.fill();g.strokeStyle=GO;g.lineWidth=2.6;g.stroke();g.strokeStyle='rgba(120,135,160,.55)';g.lineWidth=1.4;g.beginPath();g.ellipse(0,0,rx*.62,ry*.6,0,0,6.283);g.stroke();g.restore()};
 paul(48,98,25,20,-.32,-1);paul(131,104,23,19,.3,1);
 /* ngực: huy hiệu rồng + ngọc lam */
 g.fillStyle=sil(80,92,104,134);g.beginPath();g.moveTo(92,90);g.lineTo(106,108);g.lineTo(92,134);g.lineTo(78,108);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=2.2;g.stroke();
 g.strokeStyle=GO;g.lineWidth=2.4;[-1,1].forEach(sd=>{g.beginPath();g.moveTo(92+sd*12,100);g.quadraticCurveTo(92+sd*22,98,92+sd*24,88);g.stroke()});
 gem(92,111,7,10);
 /* thắt lưng bạc + ngọc + túi nhỏ */
 g.fillStyle=sil(60,156,124,178);g.beginPath();g.roundRect?g.roundRect(60,156,64,20,6):g.rect(60,156,64,20);g.fill();g.strokeStyle=GO;g.lineWidth=2;g.stroke();g.fillStyle=GO;for(let i=0;i<6;i++){g.beginPath();g.arc(66+i*10.5,166,1.9,0,6.283);g.fill()}
 g.fillStyle=sil(92,152,120,182);g.beginPath();g.moveTo(106,150);g.lineTo(120,166);g.lineTo(106,184);g.lineTo(92,166);g.closePath();g.fill();g.strokeStyle=GO;g.lineWidth=2;g.stroke();gem(106,167,6.5,9);
 g.fillStyle='#f2f5fa';g.beginPath();g.roundRect?g.roundRect(56,184,24,22,5):g.rect(56,184,24,22);g.fill();g.strokeStyle=GO;g.lineWidth=1.8;g.stroke();g.fillStyle=GO;g.beginPath();g.arc(68,192,2.2,0,6.283);g.fill()}

const FSI=[                              /* <<< THÊM NGOẠI TRANG VÀO ĐÂY >>> */
 {id:'bl1',c:'y',n:'Bạch Long Kiếm Y',e:'🐉',r:4,p:1000,d:'Giáp bạc thêu vân rồng, mão sừng rồng, ngọc lam khảm ngực và eo.',cls:['w'],clsN:'Kiếm Khách · Thương Thủ',fx:{gold:.2},fxD:'✨ Mang vào: tỉ lệ vàng nhận được +20%',o:{h:215,sm:.1,lm:1.3,la:.4,gs:.05,dk:.15,dks:.2},bg:blBg,ov:blOv}
];
const FMAP=()=>{const m={};FSI.forEach(i=>m[i.id]=i);return m};
const can=i=>!i.cls||(CHR[cur]&&i.cls.indexOf(CHR[cur].t)>=0);
let on=false,cat='y',pv={},go=0,msg='',el=null,ht=0;
const fa=()=>{const p=PS[cur];if(!p.fa)p.fa={own:{},eq:{}};const f=p.fa,M=FMAP();for(const k in f.own)if(!M[k])delete f.own[k];for(const k in f.eq)if(!M[f.eq[k]])delete f.eq[k];return f};
const eqNow=()=>{const f=PS[cur]&&PS[cur].fa,e=Object.assign({},f?f.eq:{});if(on)for(const k in pv)e[k]=pv[k];const M=FMAP();for(const k in e)if(!M[e[k]]||!can(M[e[k]]))delete e[k];return e};
const busy=()=>(window.LCT&&LCT.on())||(typeof FM!='undefined'&&FM.isOn())||(typeof MN!='undefined'&&MN.isOn());
const bx=()=>vw()*.31,by=()=>GY-(PORT?300:268)*s;
const nf=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ---------- Đồng Huyền Tinh ---------- */
const rnd=(a,b)=>a+Math.floor(R()*(b-a+1));
function award(n,x){if(n<=0)return;ht+=n;DT.push({x:x,y:150,s:'💠 +'+n+' Đồng Huyền Tinh',c:'#7ad8ff',g:1,l:150});sv()}

/* ---------- nhuộm y phục (cache theo món + nhân vật) ---------- */
const TC={};
function rgb2hsl(r,g_,b){const mx=Math.max(r,g_,b),mn=Math.min(r,g_,b),l=(mx+mn)/2;let h=0,sa=0;if(mx!=mn){const d=mx-mn;sa=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g_-b)/d+(g_<b?6:0):mx==g_?(b-r)/d+2:(r-g_)/d+4;h*=60}return[h,sa,l]}
function hsl2rgb(h,sa,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p},q=l<.5?l*(1+sa):l+sa-l*sa,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]}
function recolor(im,o){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const q=c.getContext('2d');q.drawImage(im,0,0);const d=q.getImageData(0,0,c.width,c.height),a=d.data;
 for(let i=0;i<a.length;i+=4){if(a[i+3]<8)continue;const[h,sa,l]=rgb2hsl(a[i]/255,a[i+1]/255,a[i+2]/255);
  if(h>=4&&h<=58&&sa>=.14&&sa<=.78&&l>.24&&l<.9)continue; /* da, tóc, da thuộc: giữ nguyên */
  if(o.dk!=null&&l<o.dk&&sa<(o.dks==null?1:o.dks)){const[r0,g0,b0]=hsl2rgb(o.h,Math.min(sa,.18),l);a[i]=r0;a[i+1]=g0;a[i+2]=b0;continue}
  let nh=o.h,ns,nl=Math.max(0,Math.min(1,l*(o.lm==null?1:o.lm)+(o.la||0)));if(o.h2!=null)nh=o.h+(o.h2-o.h)*Math.max(0,Math.min(1,(l-.2)/.5));
  ns=sa<.1?(o.gs||0)*(.4+sa*6):Math.max(0,Math.min(1,sa*(o.sm==null?1:o.sm)));const[r,g_,b]=hsl2rgb(nh,ns,nl);a[i]=r;a[i+1]=g_;a[i+2]=b}
 q.putImageData(d,0,0);return c.toDataURL('image/png')}
function tinted(id,ci){const k=id+'|'+ci;let e=TC[k];if(e)return e.ok?e.m:null;const R_=RIGI[ci],O=FMAP()[id];if(!R_||!O||!O.o||!R_.base||!R_.base.im.naturalWidth)return null;e=TC[k]={ok:0,m:{}};let n=0,dn=0;for(const key in R_){const v=R_[key];if(v&&v.im&&v.im.naturalWidth)n++}for(const key in R_){const v=R_[key];if(v&&v.im&&v.im.naturalWidth){const im=new Image();im.onload=()=>{e.m[key]=im;if(++dn==n)e.ok=1};im.src=recolor(v.im,O.o)}}return null}

/* ---------- vẽ trong khung nhân vật ---------- */
function frame(fn){const aa=P.atk>0,t=fr,bob=P.mv&&!aa?-Math.abs(Math.sin(t*.3))*4.5:Math.sin(t*.08)*1.4,JY=vil?0:(P.jy||0);g.save();g.translate((P.x-cam)*s,GY-JY*s);g.scale(s,s);if(!vil&&P.jr){g.translate(0,-50);g.rotate(P.jr*P.d);g.translate(0,50)}g.scale(P.d*.7*SZ,.7*SZ);g.translate(0,bob);try{fn()}catch(x){}g.restore()}
const glow=(x,y,r,rgb,al)=>{const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,'rgba('+rgb+','+al+')');q.addColorStop(1,'rgba('+rgb+',0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.restore()};
function feather(L,wd,c1,c2,shape,t,i){const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.beginPath();
 if(shape=='shard'){g.moveTo(0,0);g.lineTo(L*.55,-wd);g.lineTo(L,-wd*.1);g.lineTo(L*.6,wd*.5);g.closePath()}
 else if(shape=='flame'){const w=Math.sin(t*.12+i*1.3)*wd*.5;g.moveTo(0,0);g.bezierCurveTo(L*.3,-wd*1.3+w,L*.7,-wd*.4-w,L,w*.6);g.bezierCurveTo(L*.7,wd*.5+w,L*.3,wd*.6,0,0)}
 else{g.moveTo(0,0);g.quadraticCurveTo(L*.5,-wd,L,0);g.quadraticCurveTo(L*.5,wd*.6,0,0)}g.fill()}

/* ---------- bọc hàm hero() ---------- */
if(typeof drawWings=='function'){const _dw=drawWings;drawWings=function(){const e=eqNow(),M=FMAP();if(e.w&&M[e.w]&&M[e.w].draw)return;_dw()}}
const OV={fn:null,sh:null};
const _dPc=dPc;dPc=function(p){_dPc(p);if(OV.fn&&p&&p===OV.sh){g.save();try{OV.fn(g,fr)}catch(x){}g.restore()}};
const _hero=hero;
hero=function(){const R_=RIGI[cur];if(!R_||!R_.base||!R_.base.im.naturalWidth)return _hero();const e=eqNow(),M=FMAP(),t=fr,dw=k=>M[e[k]]&&M[e[k]].draw;
 const yi=M[e.y];if(yi&&yi.bg)frame(()=>yi.bg(g,t));if(dw('w'))frame(()=>M[e.w].draw(g,t));if(dw('a'))frame(()=>M[e.a].draw(g,t,0));
 let m=null;if(e.y)m=tinted(e.y,cur);const old={};if(m)for(const k in m){old[k]=R_[k].im;R_[k].im=m[k]}
 OV.fn=yi&&yi.ov||null;OV.sh=R_.sh;
 try{_hero()}finally{OV.fn=null;for(const k in old)R_[k].im=old[k]}
 if(dw('a'))frame(()=>M[e.a].draw(g,t,1));if(dw('h'))frame(()=>M[e.h].draw(g,t))};

/* ---------- phòng thử đồ ---------- */
const pw=()=>PORT?W:Math.min(350,W*.46);
function stage(){const t=fr,sw=PORT?W:W-pw(),sh=PORT?H*.46:H,q=g.createLinearGradient(0,0,0,sh);q.addColorStop(0,'#150c2a');q.addColorStop(.6,'#3a2056');q.addColorStop(1,'#6a3a6a');g.fillStyle=q;g.fillRect(0,0,PORT?W:sw,PORT?sh:H);if(!PORT){g.fillStyle='#150c2a';g.fillRect(sw,0,W-sw,H)}
 const cx=sw/2,fy=sh*(PORT?.86:.8);g.save();g.globalCompositeOperation='lighter';const sp=g.createRadialGradient(cx,fy-sh*.3,10,cx,fy-sh*.3,sh*.7);sp.addColorStop(0,'rgba(255,230,190,.35)');sp.addColorStop(1,'rgba(255,230,190,0)');g.fillStyle=sp;g.fillRect(0,0,sw,sh);g.restore();
 g.save();g.beginPath();g.rect(0,0,sw,sh);g.clip();
 for(let i=0;i<22;i++){const x=(i*97+t*.2*(1+i%3))%sw,y=((i*61.7)%sh*.8+Math.sin(t*.02+i)*6),a=.2+.5*Math.abs(Math.sin(t*.03+i));g.fillStyle='rgba(255,235,200,'+a+')';g.fillRect(x,y,2,2)}
 const pr=Math.min(sw*.3,sh*.34);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,fy+4,pr*1.05,pr*.26,0,0,6.283);g.fill();const pg=g.createLinearGradient(0,fy-8,0,fy+14);pg.addColorStop(0,'#e8d8b8');pg.addColorStop(1,'#8a7048');g.fillStyle=pg;g.beginPath();g.ellipse(cx,fy,pr,pr*.24,0,0,6.283);g.fill();g.strokeStyle='#ffe9a0';g.lineWidth=2;g.beginPath();g.ellipse(cx,fy,pr*.86,pr*.2,0,0,6.283);g.stroke();
 const sk=Math.min(sh*.5/73.5,sw*.62/(2*118*.49));const o={x:P.x,d:P.d,mv:P.mv,atk:P.atk,s:s,GY:GY,cam:cam,jy:P.jy,jr:P.jr};P.d=1;P.mv=0;P.atk=0;P.jy=0;P.jr=0;cam=0;s=sk;GY=fy-pr*.04;P.x=cx/sk;
 try{hero()}finally{P.x=o.x;P.d=o.d;P.mv=o.mv;P.atk=o.atk;s=o.s;GY=o.GY;cam=o.cam;P.jy=o.jy;P.jr=o.jr}
 g.restore();g.font='bold '+Math.max(12,14*Math.min(1,s+.2))+'px '+FONT;g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000c';g.fillStyle='#ffe9a0';const lb='🪞 Phòng thử đồ';g.strokeText(lb,cx,fy+pr*.24+22);g.fillText(lb,cx,fy+pr*.24+22)}

/* ---------- bảng cửa hàng ---------- */
function mkEl(){const st=document.createElement('style');st.textContent='#fsp{display:none;position:fixed;z-index:10;background:linear-gradient(#2a1a2e,#120a16);color:#f0e4c8;font-family:'+FONT+';overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:8px 10px 14px}#fsp.pt{left:0;right:0;bottom:0;top:46%;border-top:2px solid #b8964e}#fsp.ls{top:0;bottom:0;right:0;border-left:2px solid #b8964e}#fsp button{font:inherit;color:#ffe9a0;background:linear-gradient(#8a6420,#5a3e12);border:1px solid #c9a24f;border-radius:6px;padding:5px 9px;cursor:pointer}#fsp button:disabled{opacity:.45}#fsp .fh{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:bold;margin-bottom:6px}#fsp .fc{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px}#fsp .fc button{padding:6px 2px;font-size:12px}#fsp .fc button.on{background:linear-gradient(#c08a2a,#8a5e14);border-color:#fff0a0}#fsp .fr{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid #4a3a50}#fsp .fi{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;background:#0006;border:2px solid;flex:none}#fsp .fm{flex:1;min-width:0;font-size:12px}#fsp .fm b{font-size:13.5px}#fsp .fm small{opacity:.75;display:block}#fsp .fb{display:flex;flex-direction:column;gap:3px;flex:none}#fsp .fb button{font-size:12px;padding:4px 8px}#fsp .ft{background:#1d4a2a;border:1px solid #7fe0a0;border-radius:6px;padding:5px 8px;margin-bottom:6px;font-size:12px}#fsp .fe{text-align:center;opacity:.75;padding:26px 8px;font-size:13px;line-height:1.6}';document.head.appendChild(st);
 el=document.createElement('div');el.id='fsp';el.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(el)}
function render(){if(!el)mkEl();const f=fa(),e=eqNow();el.className=PORT?'pt':'ls';if(!PORT)el.style.width=pw()+'px';else el.style.width='';
 let h='<div class="fh"><span>👘 Tiệm Y Phục Linh Vân</span><span><button onclick="FSH.close()">✕</button></span></div><div style="font-size:12px;margin-bottom:5px;color:#7ad8ff">💠 '+nf(ht)+' Đồng Huyền Tinh <span style="opacity:.7;color:#f0e4c8">· ngoại trang, một số món có thêm hiệu ứng</span></div>';
 if(msg){h+='<div class="ft">'+msg+'</div>';msg=''}
 h+='<div class="fc">'+CAT.map(c=>'<button class="'+(c.k==cat?'on':'')+'" onclick="FSH.cat(\''+c.k+'\')">'+c.e+'<br>'+c.n+'</button>').join('')+'</div>';
 const list=FSI.filter(i=>i.c==cat);
 if(!FSI.length)h+='<div class="fe">Tiệm chưa có ngoại trang nào.<br>Hạ 🐲 Boss Thế Giới và 👑 Boss Hoàng Kim để nhận 💠 Đồng Huyền Tinh — ngoại trang sẽ mở bán sau!</div>';
 else if(!list.length)h+='<div class="fe">Mục này chưa có ngoại trang.</div>';
 list.forEach(i=>{const own=!!f.own[i.id],wear=f.eq[i.c]==i.id,pvw=pv[i.c]==i.id,G=GRD[i.r]||GRD[1],ok=can(i),dis=ok?'':' disabled';
  h+='<div class="fr"'+(ok?'':' style="opacity:.62"')+'><div class="fi" style="border-color:'+G.c+'">'+(i.e||'✨')+'</div><div class="fm"><b style="color:'+G.c+'">'+i.n+'</b> <small style="display:inline">['+G.n+']</small><small>'+(i.d||'')+'</small>'+(i.fxD?'<small style="color:#ffd54a">'+i.fxD+'</small>':'')+(i.cls?'<small style="color:'+(ok?'#9fe8b0':'#ff9a8a')+'">'+(ok?'✔':'🔒')+' Chỉ '+(i.clsN||'một số nhân vật')+' mang được</small>':'')+(own?'<small style="color:#7fe0a0">'+(wear?'✔ Đang mặc':'Đã sở hữu')+'</small>':'<small style="color:#7ad8ff">💠 '+nf(i.p)+'</small>')+'</div><div class="fb">'
   +(own?'<button onclick="FSH.wear(\''+i.id+'\')"'+dis+'>'+(wear?'Tháo':'Mặc')+'</button>':'<button onclick="FSH.buy(\''+i.id+'\')"'+dis+(ok&&ht<i.p?' style="opacity:.6"':'')+'>Mua</button><button onclick="FSH.tryOn(\''+i.id+'\')"'+dis+'>'+(pvw?'Bỏ thử':'Thử đồ')+'</button>')+'</div></div>'});
 if(FSI.length)h+='<div style="text-align:center;margin-top:8px"><button onclick="FSH.clear()">Tháo tất cả</button></div>';
 el.innerHTML=h}
function open(){if(!started||!vil||on||busy())return;if(bo)tg();on=true;pv={};cat='y';go=0;vt=null;vgo=-1;P.d=1;render();el.style.display='block'}
function close(){on=false;pv={};if(el)el.style.display='none';vt=null}
function buy(id){const i=FMAP()[id],f=fa();if(!i||f.own[id])return;if(!can(i)){msg='🔒 Chỉ '+(i.clsN||'nhân vật phù hợp')+' mới mang được bộ này';render();return}if(ht<i.p){msg='Không đủ 💠: cần '+nf(i.p)+' Đồng Huyền Tinh';render();return}ht-=i.p;f.own[id]=1;f.eq[i.c]=id;delete pv[i.c];msg='✨ Đã mua và mặc <b>'+i.n+'</b>';sv();render()}
function wear(id){const i=FMAP()[id],f=fa();if(!i||!f.own[id]||!can(i))return;if(f.eq[i.c]==id)delete f.eq[i.c];else f.eq[i.c]=id;delete pv[i.c];sv();render()}
function tryOn(id){const i=FMAP()[id];if(!i||!can(i))return;if(pv[i.c]==id)delete pv[i.c];else pv[i.c]=id;render()}
function clear(){const f=fa();f.eq={};pv={};sv();render()}
function setCat(k){cat=k;render()}

/* ---------- biển hiệu trong Làng ---------- */
function banner(){const t=fr,x=bx()*s,y=by(),u=s,sw=Math.sin(t*.04)*2.2*u;g.save();
 g.fillStyle='#4a2a14';g.fillRect(x-26*u,y-34*u,52*u,5*u);g.fillStyle='#c9a24f';g.fillRect(x-28*u,y-35*u,4*u,7*u);g.fillRect(x+24*u,y-35*u,4*u,7*u);
 g.strokeStyle='#2a1208';g.lineWidth=1.4*u;[-14,14].forEach(d=>{g.beginPath();g.moveTo(x+d*u,y-29*u);g.lineTo(x+d*u,y-24*u);g.stroke()});
 const gr=g.createLinearGradient(0,y-26*u,0,y+34*u);gr.addColorStop(0,'#d8343a');gr.addColorStop(1,'#7a1418');g.fillStyle=gr;g.beginPath();g.moveTo(x-18*u,y-26*u);g.lineTo(x+18*u,y-26*u);g.lineTo(x+18*u+sw,y+34*u);g.lineTo(x+sw,y+24*u);g.lineTo(x-18*u+sw,y+34*u);g.closePath();g.fill();g.strokeStyle='#f2c24a';g.lineWidth=1.8*u;g.stroke();
 g.fillStyle='#ffe58a';g.font='bold '+Math.round(28*u)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('裳',x+sw*.35,y+2*u);g.textBaseline='alphabetic';
 g.fillStyle='#f2c24a';g.beginPath();g.arc(x+sw,y+36*u,2.6*u,0,6.283);g.fill();
 const L=(tx,yy,px,fill)=>{g.font='bold '+Math.round(px)+'px '+FONT;g.lineWidth=Math.max(3,px*.28);g.strokeStyle='#000c';g.strokeText(tx,x,yy);g.fillStyle=fill;g.fillText(tx,x,yy)};
 L('👘 Tiệm Y Phục',y+52*u,Math.max(11,13*u),'#ffe9a0');g.restore()}
c.addEventListener('pointerdown',e=>{go=0;if(on||!vil||bo||!started||busy())return;const px=e.offsetX,py=e.offsetY,u=s;if(Math.abs(px-bx()*s)<30*u&&py>by()-40*u&&py<by()+72*u){vt=cl(bx(),40,vw()-40);vgo=-1;go=1;try{gateGo=0;twGoF=0}catch(x){}}});


/* ---------- hiệu ứng: + % vàng nhận được (tính theo phần vàng tăng lên mỗi khung hình, mọi nguồn) ---------- */
let gL=null,gC=0;
const goldBonus=()=>{const f=PS[cur]&&PS[cur].fa;if(!f)return 0;const M=FMAP();let b=0;for(const k in f.eq){const i=M[f.eq[k]];if(i&&i.fx&&i.fx.gold&&can(i))b+=i.fx.gold}return b};
function goldTick(){if(!started){gL=null;return}if(gL==null){gL=gold;return}const d=gold-gL;if(d>0){const b=goldBonus();if(b>0){gC+=d*b;const a=Math.floor(gC);if(a>0){gC-=a;gold+=a}}}gL=gold}
/* ---------- nối vào vòng lặp ---------- */
const _vd=vdraw;vdraw=function(){if(on){stage();return}_vd();if(vil&&!bo&&started&&!busy())banner()};
const _vs=vstep;vstep=function(){if(on){vt=null;return}_vs();if(go){if(mvDir)go=0;else if(vt==null){go=0;if(Math.abs(P.x-cl(bx(),40,vw()-40))<12)open()}}};
const _st=step;step=function(){if(on&&!vil)close();goldTick();_st()};
const _ld=ld;ld=function(){const r=_ld.apply(this,arguments);gL=null;gC=0;return r};
const _ng=ng;ng=function(){close();ht=0;gL=null;gC=0;PS.forEach(x=>{delete x.fa});_ng()};
/* rơi Đồng Huyền Tinh: Boss Thế Giới (b==2) và Boss Hoàng Kim 👑 (b==3) ngoài đồng; không tính Hầm Ngục/Tháp */
const _drop=drop;drop=function(e){_drop(e);if(!e.dg&&!e.tw&&!e.mt){if(e.b==2)award(rnd(HT_DROP.wb[0],HT_DROP.wb[1]),e.x);else if(e.b==3)award(rnd(HT_DROP.gb[0],HT_DROP.gb[1]),e.x)}};
return{open:()=>on,show:open,close,buy,wear,tryOn,clear,cat:setCat,items:FSI,util:{glow,feather},
 ht:()=>ht,goldBonus,add:n=>{ht+=n|0;sv()},award,save:()=>({ht:ht}),load:o=>{ht=Math.max(0,(o&&o.ht)|0)}}})();

