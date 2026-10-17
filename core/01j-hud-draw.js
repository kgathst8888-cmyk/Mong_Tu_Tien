/* core/01j-hud-draw.js — pets(), mbar/mhud, draw() chính
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
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
mbar(bx,39,bw,12,P.xp/nx(),'#d8a830',(P.lv>=LC(PS[cur].tier)&&PS[cur].tier<3?'CẦN CHUYỂN CHỨC ':(window.HDAO&&HDAO.on()?'Đạo Linh ':'EXP '))+P.xp+'/'+nx(),9.5);
mbar(bx,54,bw,12,ZC.pg(),ZC.col(),ZC.nm()+' · Tu vi '+ZC.tx(),9.5);
const L=W-8;
mtx('Công '+atk()*5+' · Thủ '+df(),8,79,'left','#f2e3b3');mtx('💰 '+gold,L,79,'right','#ffd54a');
mtx('📜 '+qsHud()[0]+' '+qsHud()[1].split(' ')[0],8,95,'left','#ffe9a0');mtx('⭐ '+(NK%30)+'/30 · 👑 '+(NK%100)+'/100',L,95,'right','#9fe0ff');
const r=18e5-Date.now()%18e5;mtx('📍 '+(vil?((typeof MN!='undefined'&&MN.isOn())?'Hầm Mỏ Thanh Vân':(typeof FM!='undefined'&&FM.isOn())?'Linh Điền Động Thiên':((typeof LCT!='undefined'&&LCT.on())?'Thành Thị Linh Giới':'Thanh Vân Tiên Thôn')):MP[mi()].n),8,111,'left','#e8d5a0');mtx(E.some(e=>e.b==2)?'🐲 Boss Thế Giới!':'🐲 '+Math.floor(r/6e4)+':'+String(Math.floor(r/1e3)%60).padStart(2,'0'),L,111,'right','#ffa733');
g.restore()}
/* ===== SỐ SÁT THƯƠNG: tối ưu + phân biệt rõ chí mạng =====
 * Tối ưu: giới hạn DTMAX số cùng lúc (bỏ số thường cũ nhất trước, giữ chí mạng + thông báo), bỏ vẽ số ngoài màn hình, chỉ đổi g.font khi đổi cỡ chữ,
 *         số thường biến mất nhanh hơn (l ngắn) ; hạt PT giới hạn 240.
 * Chí mạng: chữ to hơn + dấu "!" + nảy phóng to rồi thu về (9 khung) + rung nhẹ + viền dày + quầng sáng + chùm tia lửa 1 lần; không có màu riêng thì đỏ cam (số thường vẫn vàng).
 * Số thường: nhỏ, không quầng sáng, không "!". */
const DTMAX=36;
function dtTrim(){let over=DT.length-DTMAX;if(over<=0)return;DT=DT.filter(d=>{if(over>0&&!d.k&&!d.g&&(typeof d.s==='number'||/^\D{0,4}\d+$/.test(String(d.s)))){over--;return false}return true})}
function drawDmgText(s,gy){
  const cw=g.canvas.width;let lf='';g.textAlign='center';
  for(let i=0;i<DT.length;i++){const d=DT[i],x0=(d.x-cam)*s;if(x0<-120||x0>cw+120)continue;
    const tx=String(d.s),nm=/^[+\-]?\d/.test(tx)||tx=='Trượt'||tx=='Né',crit=!!d.k&&/\d$/.test(tx),
      age=(d.l0||(d.l0=d.l))-d.l,pop=crit?1+.55*Math.max(0,1-age/9):1,
      sz=(nm?(d.k?44:32)*DNS:(d.k?44:32)*DTX*(d.it?.4:1))*s*pop,f='bold '+Math.round(sz)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';
    if(f!==lf){g.font=f;lf=f}
    const fill=d.c||(d.g?'#8fffa0':d.r?'#ff7070':crit?'#ff5a3c':'#ffd54a');
    g.lineWidth=crit?4:(nm?2:3);g.strokeStyle=d.sc||(d.g?'#063':d.r?'#400':crit?'#4a0a00':'#7a3a00');g.fillStyle=fill;
    g.globalAlpha=cl(d.l/20,0,1);
    const x=x0+(crit&&age<6?(age%2?2:-2)*s:0),y=gy-d.y*s,out=crit?tx+'!':tx;
    if(crit){g.shadowColor=d.c||'#ffb040';g.shadowBlur=10*s;
      if(!d.sp){d.sp=1;if(PT.length<160)for(let j=0;j<6;j++)PT.push({x:d.x,y:d.y,vx:(R()-.5)*5,vy:-(1+R()*3),l:18,c:d.c||'#ffb040'})}}
    g.strokeText(out,x,y);g.fillText(out,x,y);
    if(crit){g.shadowBlur=0;g.shadowColor='transparent'}
  }
  g.globalAlpha=1}
function draw(){const gy=GY;g.setTransform(DPR,0,0,DPR,0,0);g.globalAlpha=1;g.imageSmoothingEnabled=true;g.imageSmoothingQuality=['high','medium','low'][window.QL|0];ZS.sh();if(vil)vdraw();else{bgd(gy);E.slice().sort((a,b)=>a.x-b.x).forEach(foe);pets();ZC.aura();hero();fxs();nameTag();
ZS.pjs()}

PT.length=0;g.globalAlpha=1; /* Fix194c: bỏ toàn bộ hạt PT */
drawDmgText(s,gy);g.globalAlpha=1;
const hs=cl(Math.min(H/540,W/420),.6,1.1),ly=12;if(W<640)mhud();else{g.save();g.scale(hs,hs);
const pg=g.createRadialGradient(60,60,5,60,60,42);pg.addColorStop(0,'#3a3050');pg.addColorStop(1,'#120c18');g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.fillStyle='#f2d6b8';g.beginPath();g.arc(60,64,15,0,6.28);g.fill();g.fillStyle='#16121f';g.beginPath();g.arc(60,58,17,3.1,6.3);g.fill();g.beginPath();g.arc(60,40,7,0,6.28);g.fill();g.fillStyle=pg;g.beginPath();g.arc(60,60,42,0,6.28);g.fill();g.save();g.beginPath();g.arc(60,60,42,0,6.28);g.clip();if(IM[cur].naturalWidth){const m=IM[cur],w=m.naturalWidth,h=m.naturalHeight;const d=HD[cur];g.drawImage(m,d[0],d[1],d[2],d[3],17,15,86,86*d[3]/d[2])}g.restore();g.strokeStyle='#b8964e';g.lineWidth=4;g.beginPath();g.arc(60,60,42,0,6.28);g.stroke();
g.fillStyle='#2a1a10';g.beginPath();g.arc(92,92,16,0,6.28);g.fill();g.stroke();g.fillStyle='#ffe9a0';g.font='bold 17px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(P.lv,92,98);
cbar(112,18,240,20,P.hp/mx(),'#c83030',Math.ceil(P.hp)+'/'+mx());cbar(112,42,240,16,P.mp/mm(),'#3a7ae0',Math.floor(P.mp)+'/'+mm());cbar(112,62,240,16,P.xp/nx(),'#d8a830',(P.lv>=LC(PS[cur].tier)&&PS[cur].tier<3?'CẦN CHUYỂN CHỨC ':(window.HDAO&&HDAO.on()?'Đạo Linh ':'EXP '))+P.xp+'/'+nx());cbar(112,110,240,16,ZC.pg(),ZC.col(),'Tu vi '+ZC.tx());{const rt=ZC.nm();g.fillStyle='#2a1a10';g.fillRect(10,110,96,16);g.strokeStyle=ZC.col();g.lineWidth=2;g.strokeRect(10,110,96,16);g.font='bold 13px KTH Serif,Songti SC,STKaiti,KaiTi,serif';const w0=g.measureText(rt).width;g.font='bold '+Math.floor(13*Math.min(1,86/w0))+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillStyle=ZC.col();g.fillText(rt,58,122)}
g.fillStyle='#2a1a10cc';g.fillRect(112,84,110,22);g.fillRect(230,84,110,22);g.fillStyle='#f2e3b3';g.font='bold 14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('công '+atk()*5,167,100);g.fillText('thủ '+df(),285,100);
g.fillStyle='#e8d5a0';g.fillRect(10,140,200,86);g.strokeStyle='#8a6d3b';g.lineWidth=3;g.strokeRect(10,140,200,86);g.fillStyle='#6a4a20';g.textAlign='left';g.font='14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('Chương '+(QS.ch+1)+' · Chính tuyến',22,162);g.fillStyle='#2a1a0a';g.font='bold 16px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText(qsHud()[0],22,188);g.font='14px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText(qsHud()[1],22,212);
g.restore();g.fillStyle='#e8d5a0';g.fillRect(W-210*hs,ly*hs,198*hs,34*hs);g.strokeStyle='#8a6d3b';g.lineWidth=3;g.strokeRect(W-210*hs,12*hs,198*hs,34*hs);g.fillStyle='#2a1a0a';g.font='bold '+16*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText(vil?((typeof MN!='undefined'&&MN.isOn())?'Hầm Mỏ Thanh Vân':(typeof FM!='undefined'&&FM.isOn())?'Linh Điền Động Thiên':((typeof LCT!='undefined'&&LCT.on())?'Thành Thị Linh Giới':'Thanh Vân Tiên Thôn')):MP[mi()].n,W-111*hs,(ly+23)*hs);g.fillStyle='#ffd54a';g.font='bold '+15*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.fillText('💰 '+gold,W-111*hs,(ly+54)*hs);g.fillStyle='#ffa733';g.font='bold '+13*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';{const r=18e5-Date.now()%18e5;g.fillText(E.some(e=>e.b==2)?'🐲 Boss Thế Giới đang xuất hiện!':'🐲 Boss thế giới: '+Math.floor(r/6e4)+':'+String(Math.floor(r/1e3)%60).padStart(2,'0'),W-111*hs,(ly+76)*hs);g.fillStyle='#9fe0ff';g.fillText('⭐ '+(NK%30)+'/30 · 👑 '+(NK%100)+'/100',W-111*hs,(ly+98)*hs)}}
g.fillStyle='#8fffa0';g.font=14*hs+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='left';g.fillText(vil||auto?'':(W<640?'Thủ công · chạm kỹ năng':'Thủ công: bấm nút kỹ năng để đánh'),14,H-((document.getElementById('dock')||{offsetHeight:56}).offsetHeight+26));
if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H)}}

let SL=[['Kiếm','⚔️'],['Giáp','🥋'],['Mũ','🎓'],['Giày','👢'],['Nhẫn','💍'],['Bội','📿']],
RN=['Thường','Tinh Anh','Hiếm','Sử Thi','Thần Thoại','Thiên Thần','Thánh'],RC=['#cccccc','#6fdc6f','#5aa8ff','#c070ff','#ffa733','#ff5ad0','#ffe27a'],RM=[1,1.4,1.9,2.6,3.6,5,15],
NM=[],
BS=[[10,0,0],[2,2,6],[0,5,18],[0,2,10],[2,1,4],[0,3,12],[0,2,6],[3,1,6],[3,1,6],[2,1,22],[4,1,14]];
