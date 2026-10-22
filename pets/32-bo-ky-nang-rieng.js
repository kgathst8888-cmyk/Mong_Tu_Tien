/* ===================================================================
   BỘ KỸ NĂNG RIÊNG CHO TỪNG THẦN THÚ (Fix419) — nạp SAU pets/31-than-thu-co-che.js
   Mỗi thú một lối chơi riêng, không con nào giống con nào. CHU TƯỚC GIỮ NGUYÊN (không đụng).

   🐯 Bạch Hổ  — SÁT THỦ CẬN CHIẾN: gầm choáng · loạt vuốt chảy máu · Liệp Sát Ấn (kết liễu địch yếu máu, hồi máu chủ)
                  · Bạch Hổ Phân Ảnh (8 giây bóng hổ chém liên tục).   Không có kỹ năng hồi máu.
   🐉 Thanh Long — PHÁP SƯ TẦM XA (gió–sét–mộc): Phong Nhận đẩy lùi · Liên Hoàn Lôi (sét chuyền nhiều địch)
                  · Thanh Mộc Hồi Xuân (hồi máu + năng lượng từ từ) · Cửu Thiên Long Ngâm (bão sấm 10 giây).
   💧 Huyền Vũ — HỘ VỆ KHỐNG CHẾ (thủy–băng): Huyền Thủy Hộ Thân · Hàn Băng Lao (đóng băng)
                  · Quy Giáp Bất Hoại (khiên giảm sát thương nhận) · Trấn Thiên (kéo địch + đóng băng + khiên).

   Móc: window.PETKIT[k] = { SKL, order(ev), cd(ev), heal, reb, skill(ev,x,M,p,sn), tick(p,ev) }
     - pets/31 (Thanh Long, Huyền Vũ) và pets/27 (Bạch Hổ) tra PETKIT[k] khi chọn/ chạy kỹ năng; xoá file này là về cơ chế cũ.
     - Khiên Huyền Vũ: bọc ZC.shd() (hệ số sát thương nhận) — cùng chỗ với Thần Thông / Hồn Phách.
   Chỉnh cân bằng: hằng số ở đầu mỗi khối kit (K0 / K2 / K3).
   =================================================================== */
(function(){
'use strict';
if(typeof PT4==='undefined'||typeof PSK==='undefined'||typeof E==='undefined'||typeof dm!=='function'||!window.PETX||!window.PFH){console.warn('[bộ kỹ năng riêng] thiếu engine, bỏ qua');return}
window.PETKIT=window.PETKIT||{};
const sX=x=>(x-cam)*s;
const alive=e=>!!e&&e.hp>0&&E.includes(e);
const tgs=(x,r)=>E.filter(e=>e.in<=0&&e.hp>0&&Math.abs(e.x-x)<r).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x));
const stat=(e,k,ch)=>{if(!alive(e)||Math.random()>=ch)return;try{window.ST&&ST.apply(e,k)}catch(x){}};
const heal=n=>{n=Math.round(n);if(n<=0)return;P.hp=Math.min(mx(),P.hp+n);DT.push({x:P.x,y:130,s:'+'+n,g:1,l:55})};
const FXD=o=>window.PFH.fx(o);
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

/* tia sét gấp khúc giữa 2 điểm (toạ độ thế giới; y tính từ mặt đất lên) */
function zap(x0,y0,x1,y1,col,l,w){
 FXD({x:x0,l,fn:(f,p,X,gy)=>{const a=1-p*p,n=Math.floor(p*9),N=9;g.save();g.strokeStyle=col;g.lineWidth=(w||2.4)*s;g.globalAlpha=a;g.lineJoin='round';
  for(let b=0;b<2;b++){g.beginPath();g.moveTo(sX(x0),gy-y0*s);for(let j=1;j<=N;j++){const q=Math.sin((n+b*5+j)*91.7)*43758.5,rr=q-Math.floor(q),t=j/N;g.lineTo(sX(x0+(x1-x0)*t)+(rr-.5)*30*s*(j<N?1:0),gy-(y0+(y1-y0)*t)*s)}g.save();g.globalAlpha=a*.25;g.lineWidth=(w||2.4)*s*3.2;g.stroke();g.restore();g.stroke()}
  g.restore()}});
}
/* lưỡi gió hình trăng khuyết bay ngang */
function blade(x0,x1,y,col,l){
 FXD({x:x0,l,fn:(f,p,X,gy)=>{const u=Math.min(1,p*1.2),cx=sX(x0+(x1-x0)*u),a=p>.7?(1-p)/.3:1,d=x1>=x0?1:-1;g.save();g.translate(cx,gy-y*s);g.scale(d,1);g.globalAlpha=a*.9;g.strokeStyle=col;g.lineCap='round';
  for(let i=0;i<3;i++){g.lineWidth=(5-i*1.4)*s;g.beginPath();g.arc(-14*s*i,0,(26-i*4)*s,-1.0,1.0);g.stroke()}
  g.restore()}});
}
/* vệt chém trắng của bóng hổ */
function streak(x0,x1,y,col,l){
 FXD({x:x0,l,fn:(f,p,X,gy)=>{const a=1-p,u=sstep(0,.5,p);g.save();g.globalAlpha=a;g.strokeStyle=col;g.lineCap='round';g.beginPath();g.moveTo(sX(x0),gy-y*s);g.lineTo(sX(x0+(x1-x0)*u),gy-(y-26*u)*s);g.globalAlpha=a*.28;g.lineWidth=(6-4*p)*s*3;g.stroke();g.globalAlpha=a;g.lineWidth=(6-4*p)*s;g.stroke();g.restore()}});
}

/* ===================================================================
   🐯 BẠCH HỔ (ô 1) — Sát thủ cận chiến
   =================================================================== */
const K0={
 SKL:[
  {ev:0,n:'Hổ Trảo',d:'Đòn thường: lao tới vồ cào cận chiến. Cấp 2 chảy máu, cấp 3 cào 2 nhát, cấp 4 cào 3 nhát.'},
  {ev:0,n:'Hổ Khiếu Chấn Nhiếp',d:'Gầm vang: sóng âm làm choáng địch quanh thú và hạ giáp của chúng.'},
  {ev:1,n:'Kim Phong Bạo',d:'Vồ nhảy tới địch, tung loạt vuốt xé nhiều địch cùng lúc, mỗi nhát gây chảy máu.'},
  {ev:2,n:'Liệp Sát Ấn',d:'Lao tới địch yếu máu nhất, chém kết liễu (càng ít máu càng đau). Hạ gục: hồi máu chủ nhân và rút ngắn hồi chiêu.'},
  {ev:3,n:'Bạch Hổ Phân Ảnh',d:'Đại chiêu: 8 giây các bóng hổ lao đi chém liên tục vào địch ngẫu nhiên, mỗi nhát chảy máu.'},
  {ev:3,n:'Thần Hổ Thủ Hộ',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 45% máu kèm sóng chém (hồi chiêu 90 giây).'}
 ],
 order:ev=>[[0],[0,1],[1,0,2],[1,2,0,3]][Math.min(3,ev)],
 cd:ev=>Math.round(300*(1-.07*ev)),     /* hồi chiêu kỹ năng riêng (frame): Bạch Hổ xoay chiêu nhanh nhất */
 heal:[],                               /* không có kỹ năng hồi máu để né */
 skill(ev,x,M,p,sn){
  const H=window.PFH,{later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,rune}=H,bleed=(typeof PTG!=='undefined'&&PTG.bleed)||(()=>{});
  const c1='#bfe6ff',c2='#ffffff',c3='#ffe9a0',r=190+ev*30,mm=M*PSK[0].m;
  if(sn==0){            /* Hổ Khiếu Chấn Nhiếp: sóng âm choáng + hạ giáp */
   gwave(x,c1,r+60,30);later(4,()=>gwave(x,c2,r,26));later(9,()=>gwave(x,c1,r-40,22));rg(x,r,c1,22);vcol(x,'rgba(190,230,255,.85)',50,26);flare(x,60,c2,120+ev*10,20);flash(c2,6);shake(6);
   tgs(x,r+120).forEach((e,i)=>later(6+i*2,()=>{if(!alive(e))return;dm(e,mm*1.0);stat(e,'stn',.42);stat(e,'prc',.5);fx({t:'claw',x:e.x,c:c1,l:16});bst(e.x,52,12,c2,6,16,3,{k:'s'})}));
  }else if(sn==1){      /* Kim Phong Bạo: loạt vuốt xé nhiều địch */
   const tg=tgs(x,r+160).slice(0,3+ev);gwave(x,c1,170,26);flash(c1,5);shake(5);vcol(x,'rgba(220,240,255,.8)',56,30);
   tg.forEach((e,i)=>{for(let k=0;k<3;k++)later(8+i*4+k*4,()=>{if(alive(e)){dm(e,mm*.7);bleed(e,200,M*.22);fx({t:'claw',x:e.x+(k-1)*10,c:k%2?c2:c1,l:16});bst(e.x,52,8,c2,5,14,3,{k:'s'})}})});
   for(let i=0;i<18;i++)later(i%12,()=>fp(x+(R()*2-1)*r,8+R()*34,{c:i%2?c1:c2,r:7+R()*7,l:60,vy:.4+R()*.8,vx:(R()-.5)*1.6,f:1,sh:1}));
  }else if(sn==2){      /* Liệp Sát Ấn: kết liễu địch yếu máu nhất */
   const cand=tgs(x,r+260);if(!cand.length)return;
   const e=cand.reduce((a,b)=>(b.hp/Math.max(1,b.max||b.hp))<(a.hp/Math.max(1,a.max||a.hp))?b:a);
   rune(e.x,60,c3,40);fx({t:'pillar',x:e.x,w:46,c:c3,l:22});flash(c3,4);
   later(8,()=>{if(!alive(e))return;
    const ox=EP.x;EP.x=e.x+(ox<e.x?-34:34);EP.d=ox<e.x?1:-1;       /* lao tới nơi mục tiêu */
    for(let i=0;i<10;i++)fp(ox+(e.x-ox)*i/10,20+R()*30,{c:i%2?c1:c2,r:6+R()*5,l:30,vy:.3,vx:0,f:1,sh:1});
    streak(ox,e.x,60,c2,14);
    const miss=1-Math.max(0,Math.min(1,e.hp/Math.max(1,e.max||e.hp)));
    for(let k=0;k<3;k++)later(k*4,()=>{if(!alive(e))return;dm(e,mm*(k==2?(1.4+3.6*miss):.7));fx({t:'claw',x:e.x+(k-1)*12,c:k%2?c3:c1,l:16});bst(e.x,52,10,c2,6,16,3,{k:'s'})});
    later(14,()=>{if(!e||e.hp>0)return;heal(mx()*(.05+.02*ev));if(EP)EP.sk=Math.max(0,(EP.sk|0)-150);flare(e.x,60,c3,110,20);gwave(e.x,c3,120,22);shake(5);DT.push({x:e.x,y:150,s:'☠ Liệp Sát!',c:c3,g:1,l:60})});
    tgs(e.x,110).filter(q=>q!==e).slice(0,3).forEach(q=>later(10,()=>{if(alive(q)){dm(q,mm*.5);bleed(q,150,M*.15)}}));
   });
  }else{                /* sn 3 / 4: Bạch Hổ Phân Ảnh (sn 4 = hồi sinh: bản ngắn kèm sóng chém) */
   const big=sn==4,N=big?7:14,gap=big?24:34;
   rune(P.x,160,c3,70);flash(c3,big?18:12);shake(big?9:7);gwave(P.x,c1,big?420:300,34);later(5,()=>gwave(P.x,c2,big?320:220,28));vcol(P.x,'rgba(255,233,160,.8)',60,36);
   if(big)tgs(P.x,360).forEach(e=>{dm(e,mm*1.8);bleed(e,180,M*.2);fx({t:'claw',x:e.x,c:c1,l:16})});
   for(let i=0;i<N;i++)later(14+i*gap,()=>{
    const pool=tgs(EP.x,520);if(!pool.length)return;const e=pool[(R()*Math.min(3,pool.length))|0];
    const fromL=R()<.5,sx=e.x+(fromL?-170:170);
    streak(sx,e.x,70,fromL?c1:c3,14);
    later(5,()=>{if(!alive(e))return;
     for(let k=0;k<2;k++)later(k*3,()=>{if(alive(e)){dm(e,mm*(.85+.1*ev));fx({t:'claw',x:e.x+(k?10:-10),c:k?c2:c1,l:16})}});
     bleed(e,220,M*.24);bst(e.x,52,14,c2,6,18,4,{k:'s'});gwave(e.x,c1,90,18);shake(2)});
   });
  }
 }
};
window.PETKIT[0]=K0;
/* Bạch Hổ nằm riêng trong pets/27 (PTG): thay hàm kỹ năng + khung mô tả bằng thuộc tính */
if(typeof PTG!=='undefined'){
 PTG.skill=K0.skill;
 PTG.skillsHtml=function(p){
  const rb=(typeof EP!=='undefined'&&(EP.rb|0)>0);
  return '<br>🌟 <b>Kỹ năng Bạch Hổ</b>'+K0.SKL.map(k=>{const on=p.ev>=k.ev;return `<br><small style="opacity:${on?1:.45};color:${on?'#d8f0ff':'#aaa'}">${on?'🐯':'🔒'} <b>${k.n}</b>${on?'':' (Tiến hóa '+(k.ev+1)+')'}: ${k.d}</small>`}).join('')+(p.ev>=3?`<br><small>Thủ Hộ: ${rb?'hồi chiêu '+Math.ceil(EP.rb/60)+'s':'<b style="color:#7fe08a">sẵn sàng</b>'}</small>`:'');
 };
}

/* ===================================================================
   🐉 THANH LONG (ô 3) — Pháp sư tầm xa: gió · sét · mộc
   =================================================================== */
const TLC1=['#bfe3ff','#8fe0a8','#4fe0e8','#b8a8ff'],TLC2=['#f2fbff','#e8ffd8','#ffd870','#fff2d0'];
const K2={
 SKL:[
  {ev:0,n:'Long Tức',d:'Đòn thường: phun hơi thở rồng tầm xa. Cấp 1 làm chậm, cấp 2+ có thể gây choáng (sét). Cấp 3 bắn 2 luồng, cấp 4 bắn 3 luồng.'},
  {ev:0,n:'Phong Nhận Hoành Tảo',d:'Năm lưỡi gió quét một dải trước mặt: gây sát thương, đẩy lùi và làm chậm địch.'},
  {ev:1,n:'Liên Hoàn Lôi',d:'Sét đánh địch gần nhất rồi chuyền sang các địch khác (nhiều mắt xích hơn khi tiến hóa), có thể gây choáng.'},
  {ev:2,n:'Thanh Mộc Hồi Xuân',d:'Mưa sinh khí: hồi máu và năng lượng cho chủ nhân dần trong 6 giây.'},
  {ev:3,n:'Cửu Thiên Long Ngâm',d:'Đại chiêu: bão sấm 10 giây, sét giáng liên tục xuống địch ngẫu nhiên trên toàn màn hình.'},
  {ev:3,n:'Long Hồn Hộ Thể',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 35% máu kèm bão sét (hồi chiêu 120 giây).'}
 ],
 order:ev=>[[0],[0,1],[1,0,1,2],[1,0,1,2,1,3]][Math.min(3,ev)],
 cd:ev=>Math.round(270-18*ev),          /* tầm xa, ra chiêu dày */
 heal:[2],
 reb:{cd:7200,hp:.35,txt:'🐉 Long Hồn Hộ Thể!',short:'Long Hồn Hộ Thể'},
 skill(ev,x,M,p,sn){
  const H=window.PFH,{later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal:hfx,rune}=H;
  const d=EP.d||1,md=M*PSK[2].m,c1=TLC1[Math.min(3,sn==4?3:Math.max(ev,sn>=2?sn:ev))],c2=TLC2[Math.min(3,ev)],my=(EP.y||0)+40;
  const bolt=(e,k)=>{const sx=e.x+(R()-.5)*60;zap(sx,330,e.x,52,k%2?c1:c2,13,3);zap(sx+20,330,e.x,52,c2,11,1.8)};
  if(sn==0){            /* Phong Nhận Hoành Tảo */
   const L=300+ev*40;flash(c1,5);shake(3);gwave(x,c1,150,24);
   for(let i=0;i<5;i++)later(i*3,()=>blade(x+d*30,x+d*(L+60),22+i*14,i%2?c1:c2,26));
   tgs(x,L+60).filter(e=>(e.x-x)*d>-30).forEach(e=>later(8+Math.round(Math.abs(e.x-x)/L*10),()=>{if(!alive(e))return;dm(e,md*1.1);e.x+=d*38;e.sl=Math.max(e.sl||0,100);gwave(e.x,c1,90,22);bst(e.x,52,12,c2,6,18,3,{k:'s'})}));
  }else if(sn==1){      /* Liên Hoàn Lôi: sét chuyền */
   const n=3+ev;let cur=tgs(x,420)[0];if(!cur)return;const hit=[],pts=[[x,my]];
   flash(c2,5);shake(4);
   for(let i=0;i<n&&cur;i++){hit.push(cur);pts.push([cur.x,52]);
    const nx=E.filter(e=>e.in<=0&&e.hp>0&&!hit.includes(e)&&Math.abs(e.x-cur.x)<280).sort((a,b)=>Math.abs(a.x-cur.x)-Math.abs(b.x-cur.x))[0];cur=nx}
   hit.forEach((e,i)=>later(4+i*5,()=>{if(!alive(e))return;zap(pts[i][0],pts[i][1],e.x,52,i%2?c1:c2,12,3.2);
    dm(e,md*1.3*Math.pow(.9,i));stat(e,'stn',.3);gwave(e.x,c1,110,24);rg(e.x,80,c1,16);bst(e.x,52,12,c2,7,16,3,{k:'s'})}));
  }else if(sn==2){      /* Thanh Mộc Hồi Xuân: hồi máu + năng lượng dần */
   const tot=mx()*(.12+.03*ev)*pv(p),mp=mm()*(.12+.03*ev);
   hfx(P.x,'#8fe8a0');fx({t:'dome',r:96,c:'#c8ffd0',l:360});gwave(P.x,'#8fe8a0',200,30);vcol(P.x,'rgba(143,232,160,.8)',50,34);
   for(let i=1;i<=6;i++)later(i*40,()=>{heal(tot/6);P.mp=Math.min(mm(),P.mp+mp/6);hfx(P.x,'#8fe8a0');
    for(let j=0;j<12;j++)fp(P.x+(R()-.5)*100,40+R()*60,{c:j%2?'#8fe8a0':'#e8ffd8',r:3+R()*3,l:40,vy:-.5-R()*.4,vx:(R()-.5)*.8,sh:1})});
  }else{                /* sn 3 / 4: Cửu Thiên Long Ngâm — bão sấm (sn 4: hồi sinh, bản ngắn) */
   const big=sn==4,N=big?8:12,gap=big?16:48;
   flash(c1,big?20:16);shake(big?9:8);gwave(P.x,c1,big?380:460,34);later(5,()=>gwave(P.x,c2,320,30));vcol(P.x,'rgba(184,168,255,.8)',64,36);
   if(big)fx({t:'dome',r:120,c:c2,l:110});
   for(let i=0;i<N;i++)later(10+i*gap/(big?1:2),()=>{
    const pool=E.filter(e=>e.in<=0&&e.hp>0&&Math.abs(e.x-P.x)<640);if(!pool.length)return;const e=pool[(R()*pool.length)|0];
    bolt(e,i);dm(e,md*(big?1.1:1.25));stat(e,'stn',.2);gwave(e.x,c1,120,26);rg(e.x,90,c1,18);bst(e.x,52,16,c2,7,20,3,{k:'s'});shake(2)});
  }
 },
 tick(){}
};
window.PETKIT[2]=K2;

/* ===================================================================
   💧 HUYỀN VŨ (ô 4) — Hộ vệ khống chế: thủy · băng · khiên
   =================================================================== */
const HVSH={until:0,v:1};                         /* khiên rùa: HVSH.v = hệ số sát thương nhận khi còn hiệu lực */
window.HVSH=HVSH;
try{if(typeof ZC!=='undefined'&&ZC.shd&&!ZC.shd.__hv){const o=ZC.shd;ZC.shd=function(){const v=o.apply(this,arguments);return(HVSH.until>fr)?v*HVSH.v:v};ZC.shd.__hv=1}}catch(e){console.warn('[Huyền Vũ] không móc được ZC.shd',e)}
const HVC1=['#9fe0ff','#6fe0c8','#59a0ff','#ffd36a'],HVC2=['#e6f7ff','#d8fff4','#cfe4ff','#fff0b8'];
const K3={
 SKL:[
  {ev:0,n:'Băng Thủy Đạn',d:'Đòn thường: bắn đạn nước băng tầm xa. Cấp 1 làm chậm, cấp 2+ có thể đóng băng. Cấp 3 bắn 2 đạn, cấp 4 bắn 3 đạn.'},
  {ev:0,n:'Huyền Thủy Hộ Thân',d:'Dựng màn nước quanh chủ nhân, hồi máu tức thì.'},
  {ev:1,n:'Hàn Băng Lao',d:'Cột băng trồi dưới chân vài địch, gây sát thương và có thể đóng băng.'},
  {ev:2,n:'Quy Giáp Bất Hoại',d:'Khiên rùa 6 giây: chủ nhân giảm 55% sát thương nhận; bùng nổ hất lùi và làm choáng địch gần.'},
  {ev:3,n:'Huyền Vũ Trấn Thiên',d:'Đại chiêu: sóng lớn kéo mọi địch về phía chủ nhân, đóng băng diện rộng, kèm khiên 4 giây giảm 40% sát thương.'},
  {ev:3,n:'Huyền Vũ Bất Diệt',d:'Khi chủ nhân gục ngã sẽ hồi sinh với 40% máu kèm khiên 8 giây giảm 60% sát thương (hồi chiêu 120 giây).'}
 ],
 order:ev=>[[0],[0,1],[1,2,0,1],[2,1,3,2,0]][Math.min(3,ev)],
 cd:ev=>Math.round(350-18*ev),
 heal:[0],
 reb:{cd:7200,hp:.4,txt:'💧 Huyền Vũ Bất Diệt!',short:'Huyền Vũ Bất Diệt'},
 skill(ev,x,M,p,sn){
  const H=window.PFH,{later,gwave,flare,flash,shake,fx,bst,rg,vcol,fp,heal:hfx}=H;
  const mm=M*PSK[3].m,c1=HVC1[sn==4?3:Math.min(3,Math.max(ev,sn))],c2=HVC2[sn==4?3:Math.min(3,Math.max(ev,sn))],r=190+ev*28;
  const shield=(sec,v,rad,col)=>{HVSH.until=fr+sec*60;HVSH.v=v;HVSH.col=col;fx({t:'dome',r:rad,c:col,l:Math.min(120,sec*60)});DT.push({x:P.x,y:150,s:'🛡 Giảm '+Math.round((1-v)*100)+'% ST',c:col,g:1,l:70})};
  if(sn==0){            /* Huyền Thủy Hộ Thân */
   const hp0=Math.round(mx()*(.06+.02*ev)*pv(p));heal(hp0);hfx(P.x,c1);fx({t:'dome',r:78+ev*10,c:c2,l:70+ev*10});gwave(P.x,c1,150,28);later(5,()=>gwave(P.x,c2,120,26));vcol(P.x,'rgba(127,216,255,.8)',50,34);
   for(let i=0;i<22;i++)later(i%12,()=>fp(P.x+(R()-.5)*90,10+R()*60,{c:i%2?c1:c2,r:3+R()*3,l:36,vy:.5+R()*.7,sh:1}));
  }else if(sn==1){      /* Hàn Băng Lao */
   tgs(x,r+160).slice(0,2+ev*2).forEach((e,i)=>later(4+i*3,()=>{if(!alive(e))return;fx({t:'pillar',x:e.x,w:44,c:c1,l:30});dm(e,mm*1.4);gwave(e.x,c1,100,26);bst(e.x,50,16,c2,6,22,3,{k:'s'});stat(e,'frz',.6)}));
   flash(c1,6);shake(4);
  }else if(sn==2){      /* Quy Giáp Bất Hoại: khiên giảm sát thương */
   shield(6,.45,Math.round(100+ev*4),c2);gwave(P.x,c1,260,30);later(6,()=>gwave(P.x,c2,200,26));vcol(P.x,'rgba(89,160,255,.85)',58,34);
   E.forEach(e=>{if(e.in<=0&&e.hp>0&&Math.abs(e.x-P.x)<240){dm(e,mm*1.1);e.x+=(e.x<P.x?-1:1)*45;stat(e,'stn',.4);bst(e.x,52,14,c2,6,20,3,{k:'s'})}});
   flash(c1,8);shake(6);
  }else if(sn==3){      /* Trấn Thiên: kéo địch + đóng băng + khiên ngắn */
   flash(c1,18);shake(9);gwave(P.x,c2,520,40);later(5,()=>gwave(P.x,c1,420,34));later(10,()=>gwave(P.x,c2,320,30));
   shield(4,.6,118,c2);
   E.filter(e=>e.in<=0&&e.hp>0&&Math.abs(e.x-P.x)<620).forEach((e,i)=>later(8+i*3,()=>{if(!alive(e))return;
    e.x+=(P.x+(P.d||1)*130-e.x)*.45;fx({t:'pillar',x:e.x,w:70,c:c1,l:30});dm(e,mm*1.8);gwave(e.x,c1,140,30);rg(e.x,110,c2,20);stat(e,'frz',.65)}));
  }else{                /* sn 4: Bất Diệt — khiên 8 giây + sóng băng khi hồi sinh */
   shield(8,.4,125,c2);flash(c2,22);shake(9);hfx(P.x,c1);gwave(P.x,c1,400,34);later(5,()=>gwave(P.x,c2,320,30));vcol(P.x,'rgba(255,211,106,.85)',64,36);
   E.forEach(e=>{if(e.in<=0&&e.hp>0&&Math.abs(e.x-P.x)<380){dm(e,mm*1.5);stat(e,'frz',.5);stat(e,'stn',.3);bst(e.x,52,16,c2,7,22,3,{k:'s'})}});
  }
 },
 tick(){                                         /* làm mới vòng khiên khi còn hiệu lực */
  if(HVSH.until>fr&&(HVSH.until-fr)%80==0)try{window.PFH.fx({t:'dome',r:105,c:HVSH.col||'#cfe4ff',l:80})}catch(e){}
 }
};
window.PETKIT[3]=K3;

/* ---------- Cập nhật mô tả thú & trạng thái đòn thường (không sửa mảng gốc) ---------- */
try{
 Object.assign(PT4[0],{d:'Thần thú SÁT THỦ cận chiến: vồ cào chảy máu · Liệp Sát kết liễu địch yếu máu · Phân Ảnh chém liên hoàn · +% sát thương'});
 Object.assign(PSK[0],{n:'Liệp Sát Bạch Hổ',d:'sát thủ: gầm choáng, vuốt chảy máu, Liệp Sát Ấn, Phân Ảnh'});
 Object.assign(PT4[2],{d:'Thần thú PHÁP SƯ tầm xa (gió–sét–mộc): Phong Nhận · sét chuyền · hồi sinh lực · bão sấm · +% chí mạng, giảm hồi chiêu'});
 Object.assign(PSK[2],{n:'Long Tức Thanh Long',d:'pháp sư: Phong Nhận, Liên Hoàn Lôi, Thanh Mộc Hồi Xuân, Long Ngâm'});
 Object.assign(PT4[3],{d:'Thần thú HỘ VỆ khống chế (thủy–băng): khiên giảm sát thương · cột băng · kéo địch đóng băng · +% giảm ST nhận, máu'});
 Object.assign(PSK[3],{n:'Huyền Thủy Huyền Vũ',d:'hộ vệ: màn nước, Hàn Băng Lao, Quy Giáp, Trấn Thiên'});
}catch(e){console.error('[bộ kỹ năng riêng] không áp được mô tả',e)}
})();
