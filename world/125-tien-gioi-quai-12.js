/* ===== 🐉 12 QUÁI TIÊN GIỚI MỚI (world/125-tien-gioi-quai-12.js) · Fix360 — nạp sau world/124 =====
 * Thay hình quái ở: (1) Thành Thị Tiên Giới – quái bay (world/81) · (2) Tiên Linh Chiến Cảnh (world/84, 8 hướng) · (3) Map Treo của Tiên Nhân (world/80, nhìn ngang).
 * CHỈ ĐỔI HÌNH + HOẠT ẢNH. Chỉ số, AI, va chạm, EXP, rơi đồ, sát thương đều do module gốc giữ nguyên (m.k vẫn là gob/wolf/scorp/arch/mage).
 * 12 loài: Thanh Linh Hạc, Ngọc Kỳ Lân, Thiên Tinh Hồ, Linh Thú Cự Quy, Huyền Vũ, Cửu Vĩ Ma Hồ, Thiên Đình Chiến Sĩ, Cự Ma, Lôi Điện Thần Sứ, Hắc Long, Thanh Trùng, Tiên Linh.
 *   • Tầm xa (m.k = arch/mage): Hạc, Lôi Điện Thần Sứ, Thanh Trùng, Tiên Linh · Cận chiến: 8 loài còn lại. Loài chọn cố định theo id quái.
 * Hình: assets/tien-gioi-quai/<id>.png (sprite-sheet 1024×1024, nền trong suốt, 4×4 khung 256px: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công).
 *   PNG không tải được (thiếu file/đường dẫn sai) → tự vẽ dự phòng bằng assets/tien-gioi-quai-art.js (cùng hình) và ghi cảnh báo vào console [TGM].
 * Chỉnh/tắt: TGM_CF.enable=false (về hình cũ) · TGM_CF.path (thư mục PNG) · TGM_CF.scale (cỡ quái) · hoặc xoá 2 thẻ <script> (art + 115) trong index.html. API: window.TGM. */
(function(){
'use strict';
if(typeof g==='undefined'||typeof MS==='undefined'||!window.TGMART)return;
var CF=window.TGM_CF=window.TGM_CF||{};
function def(k,v){if(CF[k]===undefined)CF[k]=v}
def('enable',true);def('path','assets/tien-gioi-quai/');def('scale',1);def('png',true);def('wait',2500);
var SP=TGMART.SP,FR=TGMART.FR,SZ_=FR.size,PI=Math.PI,TAU=PI*2;
var RANGED_POOL=[0,8,10,11],MELEE_POOL=[1,2,3,4,5,6,7,9];
var sheets=[],warned={},scratch=null,sc2=null;
function warn(k,t){if(!warned[k]){warned[k]=1;try{console.warn('[TGM] '+t)}catch(e){}}}
function sheet(i){var o=sheets[i];if(o)return o;o=sheets[i]={img:null,ok:0,bad:0,cv:null,t0:Date.now()};
 if(CF.png){var im=new Image();o.img=im;im.onload=function(){o.ok=1};im.onerror=function(){o.bad=1;warn('png'+i,'không tải được '+CF.path+SP[i].id+'.png → vẽ dự phòng')};im.src=CF.path+SP[i].id+'.png'}else o.bad=1;
 return o}
function fallback(i,o){if(o.cv)return o.cv;var cv=document.createElement('canvas');cv.width=cv.height=SZ_*FR.cols;var c=cv.getContext('2d');
 for(var f=0;f<FR.n;f++){c.save();c.translate((f%FR.cols)*SZ_,Math.floor(f/FR.cols)*SZ_);c.beginPath();c.rect(0,0,SZ_,SZ_);c.clip();TGMART.draw(c,i,f);c.restore()}
 return o.cv=cv}
function srcOf(i){var o=sheet(i);if(o.ok&&o.img.naturalWidth)return o.img;if(o.bad||Date.now()-o.t0>CF.wait)return fallback(i,o);return null}
function on(){return CF.enable!==false}
/* chọn loài cho quái (cố định theo id) */
function spOf(m){if(m.tgs!==undefined)return m.tgs;var rg=(m.k==='arch'||m.k==='mage'||(m.rg>=200)),p=rg?RANGED_POOL:MELEE_POOL,h=(((m.id||m.sn||0)*2654435761)>>>0);return m.tgs=p[(h>>>7)%p.length]}
function nameOf(m){return SP[spOf(m)].name}
/* chọn khung hình: đứng / di chuyển / tấn công */
function frameOf(m,fr,rg){var f,sn=m.sn|0;
 if(m.atk>0&&!rg){f=10+Math.min(5,Math.floor((1-m.atk/22)*6))}
 else{var cd=m.cd||0;if(m.tgc!==undefined&&cd>m.tgc+30)m.tga=fr;m.tgc=cd;
  if(m.tga!==undefined&&fr-m.tga<24)f=10+Math.min(5,Math.floor((fr-m.tga)/4));
  else if(m.mv)f=4+(Math.floor(fr/5)+sn)%6;else f=(Math.floor(fr/12)+sn)%4}
 return f}
function put(c,i,f,h,flash){var s_=srcOf(i);if(!s_)return false;var dh=h*SZ_/220*CF.scale,sx=(f%FR.cols)*SZ_,sy=Math.floor(f/FR.cols)*SZ_,dx=-dh*FR.ox/SZ_,dy=-dh*FR.oy/SZ_;
 c.drawImage(s_,sx,sy,SZ_,SZ_,dx,dy,dh,dh);
 if(flash){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.55;c.drawImage(s_,sx,sy,SZ_,SZ_,dx,dy,dh,dh);c.restore()}return true}
/* vẽ khung phủ tối (quay lưng) bằng canvas tạm */
function putTint(c,i,f,h,col){var s_=srcOf(i);if(!s_)return false;if(!scratch){scratch=document.createElement('canvas');scratch.width=scratch.height=SZ_;sc2=scratch.getContext('2d')}
 sc2.clearRect(0,0,SZ_,SZ_);sc2.globalCompositeOperation='source-over';sc2.drawImage(s_,(f%FR.cols)*SZ_,Math.floor(f/FR.cols)*SZ_,SZ_,SZ_,0,0,SZ_,SZ_);sc2.globalCompositeOperation='source-atop';sc2.fillStyle=col||'rgba(14,6,44,.5)';sc2.fillRect(0,0,SZ_,SZ_);
 var dh=h*SZ_/220*CF.scale;c.drawImage(scratch,-dh*FR.ox/SZ_,-dh*FR.oy/SZ_,dh,dh);return true}
function plate(c,s,X,y,nm,col,hp,max,al){c.save();c.globalAlpha=al;c.font='bold '+Math.round(11*s)+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';c.textAlign='center';var tw=c.measureText(nm).width;
 c.fillStyle='rgba(0,0,0,.6)';c.fillRect(X-tw/2-3,y-11*s,tw+6,12*s);c.fillStyle=col;c.fillText(nm,X,y-1*s);
 c.fillStyle='#000a';c.fillRect(X-30*s,y+3*s,60*s,5*s);c.fillStyle='#e8c040';c.fillRect(X-30*s,y+3*s,60*s*Math.max(0,Math.min(1,hp/max)),5*s);c.restore()}
function aura(c,x,y,r,col,al){c.save();c.globalCompositeOperation='lighter';var q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col+al*.55+')');q.addColorStop(1,col+'0)');c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function rgb(h){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','}
function face(m,X,hs){if(hs){var d=hs-X;if(m.tgf===undefined)m.tgf=d>=0?1:-1;else if(Math.abs(d)>14)m.tgf=d>0?1:-1}return m.tgf||1}

/* (1) Thành Thị Tiên Giới – quái bay (world/81). Trả true nếu đã vẽ */
function d81(m,X,Y,s,z){if(!on())return false;var i=spOf(m),sp=SP[i],rg=sp.rg>0||m.k==='arch'||m.k==='mage',f=frameOf(m,fr,rg),hs=null;
 try{var h=TG.hero();hs=TG.S2(h[0],h[1])[0]}catch(e){}
 var dir=face(m,X,hs),sc=s*((typeof SZ==='number'&&SZ)||1),fy=Y-z;
 g.save();g.globalAlpha=.3*Math.max(.35,1-m.z/180);g.fillStyle='#02021a';g.beginPath();g.ellipse(X,Y,26*s,10*s,0,0,TAU);g.fill();g.restore();
 aura(g,X,fy-sp.h*.45*sc,sp.h*.7*sc,rgb(sp.col),.4+.1*Math.sin(fr*.1+m.ph));
 g.save();g.translate(X,fy+(m.mv?-Math.abs(Math.sin(fr*.25+m.sn))*4*s:0));g.scale(dir*sc,sc);
 var ok=put(g,i,f,sp.h,m.fl>0);g.restore();if(!ok)return false;
 plate(g,s,X,fy-sp.h*CF.scale*sc-10*s,sp.name+' Lv'+m.lv,'#ffffff',m.hp,m.max,1);return true}

/* (2) Tiên Linh Chiến Cảnh – 8 hướng (world/84): o={size,col,al,hd,fin} */
var WX=[1,.88,.7,.88,1,.88,.7,.88];
function d84(m,X,Y,s,o){if(!on())return false;var i=spOf(m),sp=SP[i],rg=sp.rg>0||m.k==='arch'||m.k==='mage',k=m.hd|0,th=k*PI/4,cs=Math.cos(th),sn=Math.sin(th),back=(k===5||k===6||k===7),f=frameOf(m,fr,rg);
 if(k===7||k===0||k===1)m.fx=1;else if(k===3||k===4||k===5)m.fx=-1;
 var sc=s*((typeof SZ==='number'&&SZ)||1)*o.size,al=Math.max(.05,Math.min(1,1-m.fin/22)),col=o.col,lung=m.atk>0?(m.atk>11?(22-m.atk)/11:m.atk/11):0,
  bob=m.mv?Math.abs(Math.sin(fr*.25+m.sn))*4*sc:Math.sin(fr*.06+m.ph)*1.2*sc,ox=cs*20*sc*lung,oy=sn*10*sc*lung;
 var s_=srcOf(i);if(!s_)return false;
 g.save();g.globalAlpha=al;
 g.save();g.translate(X,Y);g.scale(1,.5);var R=30*sc;g.fillStyle='rgba(0,0,20,.34)';g.beginPath();g.arc(0,0,R*.78,0,TAU);g.fill();
 g.strokeStyle=col;g.globalAlpha=al*.55;g.lineWidth=2*s;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
 g.globalCompositeOperation='lighter';g.globalAlpha=al*.55;g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.arc(0,0,R*1.12,th-.4,th+.4);g.closePath();g.fill();g.restore();
 aura(g,X+ox,Y+oy-bob-sp.h*.45*sc,sp.h*.7*sc,rgb(sp.col),.3*al);
 g.save();g.globalAlpha=al;g.translate(X+ox,Y+oy-bob);g.scale((m.fx||1)*WX[k]*sc,sc*(1+Math.sin(fr*.12+m.sn)*.012));
 if(back)putTint(g,i,f,sp.h);else put(g,i,f,sp.h,m.fl>0);g.restore();
 plate(g,s,X,Y-sp.h*CF.scale*sc-14*s,sp.name+' Lv'+m.lv,'#ffd6ff',m.hp,m.max,al);g.restore();return true}

/* (3) Map Treo của Tiên Nhân – nhìn ngang (engine foe) : quái có cờ e.tg12 */
function w2d(){
 if(typeof foe!=='function'||typeof GY==='undefined'||typeof cam==='undefined')return;
 var _foe=foe;
 foe=function(e){
  if(!on()||!e||!e.tg12)return _foe(e);
  try{
   var i=spOf(e),sp=SP[i],bz=(typeof BZ!=='undefined'?BZ[e.b|0]:1)||1,H=sp.h*bz,dir=Math.sign(P.x-e.x)||1,rg=sp.rg>0||e.rg>=200,f;
   var cd=e.cd||0;if(cd>48)f=10+Math.min(5,Math.floor((1-Math.min(1,(cd-48)/16))*6));else if(e.mv)f=4+(Math.floor(fr/5)+(e.sn|0))%6;else f=(Math.floor(fr/12)+(e.sn|0))%4;
   var lg=cd>48&&e.rg<200?(cd-48)*1.3*dir:0,al=Math.max(.05,Math.min(1,1-(e.in||0)/30)),x=(e.x-cam+lg)*s;
   if(!srcOf(i))return;
   g.globalAlpha=al;g.save();g.translate(x,GY-(e.mv?Math.abs(Math.sin(fr*.25+e.sn))*5*s:0));g.scale(s*SZ,s*SZ);
   g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,2,H*.34,7,0,0,TAU);g.fill();
   aura(g,0,-H*.45,H*.7,rgb(sp.col),.35);
   g.save();g.scale(dir,1+Math.sin(fr*.12+e.sn)*.012);
   if(e.b==1||e.b==3){g.shadowColor=e.b==3?'#c070ff':'#7fd0ff';g.shadowBlur=20+Math.sin(fr*.1)*6}
   put(g,i,f,H,e.fl>0);g.restore();
   if(e.sl>0){g.font='20px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText('❄️',0,-H-4)}
   g.restore();
   var nx=(e.x-cam)*s,ny=GY-(H*SZ+8)*s,nm=((e.b==2?'🐲':e.b==3?'👑':e.b==1?'⭐':'')+(window.NHX&&NHX.ic?NHX.ic(e):'')+sp.name)+' '+e.lv+' 🛡'+Math.round(e.df);
   g.font='bold '+6.5*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';var w2=g.measureText(nm).width;
   g.fillStyle='rgba(0,0,0,.6)';g.fillRect(nx-w2/2-3,ny-8.5*s,w2+6,8.5*s);g.fillStyle=e.b==1?'#7fd0ff':e.b==3?'#d9a0ff':e.b?'#e8a0ff':'#fff';g.fillText(nm,nx,ny-2*s);
   g.fillStyle='#000a';g.fillRect(nx-30*s,ny+2,60*s,5*s);g.fillStyle='#e8c040';g.fillRect(nx-30*s,ny+2,60*s*Math.max(0,Math.min(1,e.hp/e.max)),5*s);g.globalAlpha=1
  }catch(x){g.globalAlpha=1;warn('foe','lỗi vẽ 2D: '+x.message);return _foe(e)}}}
try{w2d()}catch(e){warn('w2d','không móc được foe: '+e.message)}

/* kiểm tra tài nguyên: window.TGM.check() → Promise<{id,ok}> */
function check(){return Promise.all(SP.map(function(p,i){return new Promise(function(res){var im=new Image();im.onload=function(){res({id:p.id,ok:im.naturalWidth===SZ_*FR.cols&&im.naturalHeight===SZ_*FR.cols,w:im.naturalWidth,h:im.naturalHeight})};im.onerror=function(){res({id:p.id,ok:false})};im.src=CF.path+p.id+'.png'})}))}
window.TGM={d81:d81,d84:d84,spOf:spOf,nameOf:nameOf,frameOf:frameOf,SP:SP,CF:CF,check:check,preload:function(){SP.forEach(function(p,i){sheet(i)})}};
setTimeout(function(){try{window.TGM.preload()}catch(e){}},300);
})();
