
/* ===== CƠ CHẾ TRẠNG THÁI: BỎNG · ĐỘC TỐ · CHOÁNG · XUYÊN GIÁP · ĐÓNG BĂNG ===== */
(function(){
const STP={
'Chém Mạnh':{stun:.12},'Xung Phong':{stun:.45},'Liên Hoàn Trảm':{pierce:.25},'Phong Ma Trảm':{freeze:.35},'Vạn Kiếm Quy Tông':{pierce:.5,stun:.3},
'Liên Thích':{pierce:.2},'Lưu Tinh Đột':{stun:.3},'Xuyên Tâm Thương':{pierce:.6},'Thương Vũ':{pierce:.3},'Địa Chấn':{stun:.6},'Long Đảm Phá':{pierce:.5,stun:.4},
'Hỏa Cầu':{burn:.3},'Hỏa Long Cầu':{burn:.6},'Sét Đánh':{stun:.2},
'Linh Hồn Cầu':{poison:.3},'Hấp Hồn Ấn':{poison:.7},'Vạn Linh Giáng Thế':{poison:1,stun:.35},
'Lôi Liên Chuỗi':{stun:.3},'Bão Tuyết':{freeze:.5},'Thiên Hỏa Giáng':{burn:1,stun:.25},
'Tên Nhanh':{pierce:.1},'Mưa Tên':{poison:.2},'Xạ Kích':{pierce:.4},'Tên Xuyên Giáp':{pierce:.7},'Tử Thần Tiễn':{pierce:.5,poison:.8},'Bẫy Kẹp':{stun:.7},'Mũi Tên Độc':{poison:.9},
'Ảnh Kích':{poison:.25},'Phi Đao Toàn Phong':{poison:.6},'Ám Sát Liên Hoàn':{pierce:.35},'Huyết Ảnh Trảm':{pierce:.4,poison:.5},'Vạn Ảnh Sát Vực':{pierce:.5,poison:.8,stun:.3},
'Long Đảm Xuyên Vân':{pierce:.4},'Địa Long Phá Thương':{stun:.7},'Vạn Thương Triều Tông':{pierce:.5},'Cửu Thiên Giáng Thương':{pierce:.6,stun:.5},
'Ngự Kiếm Trảm':{pierce:.3},'Phá Thiên Kiếm Vực':{stun:.7},'Vạn Kiếm Triều Tông':{pierce:.5},'Thiên Kiếm Trảm Địa':{pierce:.6,stun:.5},
'Ngũ Hành Hỏa Ấn':{burn:.8},'Băng Phong Vạn Lý':{freeze:.8},'Lôi Kiếp Thiên Phạt':{stun:.6},'Tinh Thần Diệt Thế':{burn:1,stun:.4},
'Ngũ Quỷ Phệ Hồn':{poison:.8},'Cửu U Minh Giới':{poison:1,freeze:.3},'Vạn Quỷ Dạ Hành':{poison:1},'Chúng Sinh Triệu Thiên':{poison:1,stun:.5},
'Truy Hồn Tiễn':{pierce:.35},'Vạn Tiễn Xuyên Tâm':{pierce:.7},'Phân Thân Huyễn Ảnh':{poison:.6},'Thiên Lang Phệ Nguyệt':{stun:.5,pierce:.4},
'Ảnh Phân Thập Sát':{poison:.7},'Hắc Nguyệt Liên Trảm':{poison:.8,freeze:.3},'Phân Thân Vạn Ảnh':{pierce:.5},'Thiên Địa Vô Ảnh Sát':{pierce:.6,stun:.5,poison:.8}};
const boss=e=>e.b>=2||e.k=='boss';
const lab=(e,t,c)=>DT.push({x:e.x,y:(e.hh||100)*SZ+16,s:t,c,l:55});
function base(e){const T=e.stt||(e.stt={});if(T.df0==null)T.df0=e.df||0;return T.df0}
function dot(e,d,c,ic){d*=(1+SX('dotd')/100)*HL.el();d=Math.max(1,Math.round(Math.min(d,(e.max||d)*(boss(e)?.012:.08))));e.hp-=d;DT.push({x:e.x,y:(e.hh||100)*SZ,s:ic+d,c,l:40})}
function apply(e,k,pw){const T=e.stt||(e.stt={}),bs=boss(e);
 if(k=='brn'){const was=T.brn>0;if(T.frz>0){T.frz=0;T.imm=60;const d=Math.max(1,Math.round(atk()*.5));e.hp-=d;DT.push({x:e.x,y:(e.hh||100)*SZ,s:'💧'+d,c:'#9fe0ff',l:45});lab(e,'Tan băng!','#cfeaff');for(let i=0;i<10;i++)PT.push({x:e.x,y:50,vx:(R()-.5)*6,vy:R()*-4,l:28,c:'#cfeaff'})}T.brn=300;T.bs=was?Math.min(3,(T.bs||1)+1):1;if(!was)lab(e,'🔥 Bỏng','#ff9a3a')}
 else if(k=='psn'){const was=T.psn>0;T.psn=480;T.ps=was?Math.min(5,(T.ps||1)+1):1;if(!was)lab(e,'☠ Độc tố','#7fe85a')}
 else if(k=='stn'){if(T.imm>0||T.stn>0||T.frz>0)return;T.stn=bs?36:90;lab(e,'💫 Choáng','#ffe66a')}
 else if(k=='frz'){if(T.imm>0||T.stn>0||T.frz>0)return;T.frz=bs?40:100;lab(e,'❄ Đóng băng','#9fe0ff')}
 else if(k=='prc'){const f=!(T.prc>0);base(e);T.prc=300;T.pa=Math.max(f?0:T.pa||0,Math.min(.8,pw));e.df=T.df0*(1-T.pa);if(f)lab(e,'🛡 Xuyên giáp','#ffb060')}}
function roll(e,pf){if(e.hp<=0)return;const T=e.stt||(e.stt={});
 const pb=SX('prc')/100;
 if(pf.pierce)apply(e,'prc',Math.min(.8,Math.max(.2,pf.pierce)+pb/2));
 const id=window.STLAST[1];if(T.rc===id)return;T.rc=id;
 if(!pf.pierce&&pb>0&&R()<Math.min(.9,pb*1.5))apply(e,'prc',.25+pb/2);
 if(pf.burn&&R()<pf.burn)apply(e,'brn');
 if(pf.poison&&R()<pf.poison)apply(e,'psn');
 const sc=(pf.stun||0)+SX('stnc')/100,fc=(pf.freeze||0)+SX('frzc')/100;
 if(sc>0&&R()<sc*(boss(e)?.6:1))apply(e,'stn');
 if(fc>0&&R()<fc*(boss(e)?.6:1))apply(e,'frz')}
function tick(e){const T=e.stt;if(!T||e.in>0||e.hp<=0)return;
 if(T.brn>0){T.brn--;if(T.brn%30==0)dot(e,atk()*.2*(T.bs||1),'#ff9a3a','🔥');if(!T.brn)T.bs=0}
 if(T.psn>0){T.psn--;if(T.psn%30==0)dot(e,atk()*.06*(T.ps||1),'#7fe85a','☠');if(!T.psn)T.ps=0}
 if(T.stn>0){if(--T.stn==0)T.imm=150}
 if(T.frz>0){if(--T.frz==0){T.imm=150;e.sl=Math.max(e.sl||0,90)}}
 if(T.imm>0)T.imm--;
 if(T.prc>0){if(--T.prc==0){e.df=T.df0;T.pa=0}}}
const _dm=dm;
dm=function(e,m,sl){const T=e.stt,pf=(SKF&&window.STLAST&&fr-window.STLAST[1]<200)?(STP[window.STLAST[0]]||{}):null;
 if(T&&T.frz>0)m*=1.25;if(pf&&HL.isEl(window.STLAST&&window.STLAST[0],pf))m*=HL.el();
 const pa=(T&&T.prc>0)?T.pa:0,inn=pf&&pf.pierce?Math.min(.8,pf.pierce+SX('prc')/200):0;let touched=false;
 if(pa||inn){const b=base(e);e.df=b*(1-Math.min(.85,pa+inn*(1-pa)));touched=true}
 const hp0=e.hp;_dm(e,m,sl);
 if(touched){const q=e.stt;e.df=q.prc>0?q.df0*(1-q.pa):q.df0}
 if(pf&&e.hp<hp0&&e.hp>0){roll(e,pf);const q=e.stt;if(q&&q.prc>0)e.df=q.df0*(1-q.pa)}};
const _step=step;
step=function(){const hold=[],act=!(bo||vil||!started||over);
 if(act)E.forEach(e=>{const T=e.stt;if(T&&(T.stn>0||T.frz>0)&&e.in<=0){hold.push([e,e.x,e.ph]);e.cd=Math.max(e.cd||0,3);if(typeof e.k1=='number')e.k1=Math.max(e.k1,3);if(typeof e.k2=='number')e.k2=Math.max(e.k2,3)}});
 const pre=act?E.map(e=>[e,e.cd||0]):[],hp0=P.hp,px0=P.x,pHold=act&&(PS_.stn>0||PS_.frz>0);if(pHold)P.atkT=Math.max(P.atkT||0,3);
 _step();
 if(vil||over){PS_.brn=PS_.psn=PS_.ps=PS_.stn=PS_.frz=PS_.imm=0}
 if(bo||vil||!started||over)return;
 if(pHold){P.x=px0;P.mv=0}
 if(P.hp<hp0){let at=pre.filter(q=>q[0].in<=0&&(q[0].cd||0)>q[1]+5&&q[0].hp>0).map(q=>q[0]);if(!at.length){const nr=E.filter(e=>e.in<=0&&Math.abs(e.x-P.x)<420).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];if(nr)at=[nr]}at.slice(0,2).forEach(inflict)}
 pTick();
 hold.forEach(h=>{h[0].x=h[1];h[0].mv=0;h[0].ph=h[2]});
 E.forEach(tick)};
function draw1(e){const T=e.stt;if(!T||!(T.brn>0||T.psn>0||T.stn>0||T.frz>0||T.prc>0))return;const m=MS[e.k]||e.fm;if(!m)return;
 const HH=m.h*BZ[e.b|0]*SZ*s,x=(e.x-cam)*s,gy=GY,tp=gy-HH,w=HH*.34,t=fr,sn=e.sn||0;g.save();
 if(T.frz>0){g.globalCompositeOperation='source-over';g.globalAlpha=.42;const q=g.createLinearGradient(x,tp,x,gy);q.addColorStop(0,'#e8f8ff');q.addColorStop(1,'#6fc0f0');g.fillStyle=q;g.beginPath();g.moveTo(x-w,gy);g.lineTo(x-w*1.05,tp+HH*.25);g.lineTo(x-w*.45,tp-HH*.04);g.lineTo(x+w*.5,tp);g.lineTo(x+w*1.05,tp+HH*.3);g.lineTo(x+w,gy);g.closePath();g.fill();g.globalAlpha=.9;g.strokeStyle='#fff';g.lineWidth=1.6*s;g.stroke();g.globalAlpha=.6;g.beginPath();g.moveTo(x-w*.5,gy-HH*.2);g.lineTo(x-w*.1,tp+HH*.3);g.lineTo(x+w*.3,gy-HH*.1);g.stroke();glowDraw(x,gy-HH*.5,HH*.6,'#9fe0ff',.25)}
 g.globalCompositeOperation='lighter';
 if(T.brn>0){glowDraw(x,gy-HH*.45,HH*.55,'#ff6a20',.28);for(let i=0;i<7;i++){const u=(t*.04+i/7+sn*.13)%1;glowDraw(x+Math.sin(i*2.3+sn)*w*.8,gy-u*HH*.95,(7-u*5)*s,i%2?'#ffd060':'#ff7a20',.95*(1-u))}}
 if(T.psn>0){glowDraw(x,gy-HH*.45,HH*.5,'#5fd040',.22);for(let i=0;i<6;i++){const u=(t*.018+i/6+sn*.1)%1,bx=x+Math.sin(i*2.7+u*4)*w*.9,by=gy-u*HH;g.globalAlpha=.8*(1-u);g.strokeStyle='#b8ff9a';g.lineWidth=1.4*s;g.beginPath();g.arc(bx,by,(2+u*4+(i%3))*s,0,6.283);g.stroke()}}
 if(T.stn>0){for(let i=0;i<3;i++){const a=t*.12+i*2.094;g.save();g.translate(x+Math.cos(a)*w*.6,tp-6*s+Math.sin(a)*4*s);g.rotate(t*.1);g.globalAlpha=1;g.fillStyle='#ffe66a';g.shadowColor='#ffd040';g.shadowBlur=8;star(5,6*s,2.6*s,0);g.fill();g.restore()}}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
 let ic='';if(T.brn>0)ic+='🔥'+(T.bs>1?T.bs:'');if(T.psn>0)ic+='☠️'+(T.ps>1?T.ps:'');if(T.stn>0)ic+='💫';if(T.frz>0)ic+='❄️';if(T.prc>0)ic+='🛡️💥';
 if(ic){g.font=Math.round(10*s)+'px sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.fillText(ic,x,tp-24*s)}
 g.restore()}
const _foe=foe;foe=function(e){_foe(e);try{draw1(e)}catch(x){}};

/* ---- Trạng thái lên người chơi (Kháng hiệu ứng giảm tỉ lệ và thời gian) ---- */
const PS_={brn:0,psn:0,ps:0,stn:0,frz:0,imm:0};window.PST=PS_;
const eres=()=>Math.min(.8,SX('eres')/100);
const plab=(t,c)=>DT.push({x:P.x,y:150,s:t,c,l:55});
function pApply(k,dur){if(P.hp<=0)return;
 if((k=='stn'||k=='frz')&&(PS_.imm>0||PS_.stn>0||PS_.frz>0))return;
 dur=Math.round(dur*(1-eres()*.7));if(dur<12)return;
 if(k=='brn'){if(!(PS_.brn>0))plab('🔥 Bỏng','#ff9a3a');PS_.brn=dur}
 else if(k=='psn'){PS_.ps=PS_.psn>0?Math.min(3,PS_.ps+1):1;if(PS_.ps==1)plab('☠ Trúng độc','#7fe85a');PS_.psn=dur}
 else if(k=='stn'){PS_.stn=Math.min(dur,60);plab('💫 Choáng!','#ffe66a')}
 else if(k=='frz'){PS_.frz=Math.min(dur,70);plab('❄ Bị đóng băng!','#9fe0ff')}}
function eKind(e){if(e.k=='boss')return['brn','stn','frz','psn'][Math.floor(R()*4)];const m={scorp:'psn',wolf:'psn',gob:'psn',mage:'brn',arch:'brn',ogre:'stn',golem:'stn',pal:'frz'}[e.k];if(m)return m;let h=0;String(e.k).split('').forEach(c=>h+=c.charCodeAt(0));return['brn','psn','stn','frz'][h%4]}
function inflict(e){const k=eKind(e),b=boss(e)?.22:e.b==1?.14:.08,ch=b*(1-eres())*((k=='stn'||k=='frz')?.7:1);if(R()<ch)pApply(k,(k=='brn'||k=='psn')?240:90)}
function pDot(d,c,ic){d=Math.max(1,Math.round(d*(1-Math.min(.5,SX('dred')/100))));P.hp=Math.max(1,P.hp-d);DT.push({x:P.x,y:100,s:ic+d,c,l:40})}
function pTick(){
 if(PS_.brn>0){PS_.brn--;if(PS_.brn%30==0)pDot(mx()*.012,'#ff9a3a','🔥')}
 if(PS_.psn>0){PS_.psn--;if(PS_.psn%30==0)pDot(mx()*.008*PS_.ps,'#7fe85a','☠');if(!PS_.psn)PS_.ps=0}
 if(PS_.stn>0){if(--PS_.stn==0)PS_.imm=120}
 if(PS_.frz>0){if(--PS_.frz==0)PS_.imm=120}
 if(PS_.imm>0)PS_.imm--}
const _cast=cast;cast=function(i){if(PS_.stn>0||PS_.frz>0)return;return _cast.apply(this,arguments)};
const _hero=hero;hero=function(){_hero.apply(this,arguments);try{draw1({x:P.x,b:0,sn:0,fm:{h:96},stt:{brn:PS_.brn,bs:1,psn:PS_.psn,ps:PS_.ps,stn:PS_.stn,frz:PS_.frz}})}catch(x){}};
window.ST={apply,STP,tick,pApply};
})();
