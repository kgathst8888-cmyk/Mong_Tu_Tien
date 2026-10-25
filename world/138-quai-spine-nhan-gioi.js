/*==== QUÁI SPINE NHÂN GIỚI (Fix430) ====
  Thay hình quái thường / Tinh Anh / Sử Thi ở 2 bản đồ Nhân Giới bằng sprite sheet bake từ xương Spine:
    mapSel=1 Tuyết Hàn Ma Phong → "Băng Cự Ma Binh" (assets/quai-spine/troll_bang.webp)
    mapSel=3 U Minh Ma Cốc      → "U Minh Thi Binh"  (assets/quai-spine/thi_binh.webp)
  Chỉ đổi lớp VẼ + tên: máu/thủ/sát thương/rơi đồ giữ nguyên. Không áp cho 'pal', phụ bản, làng, Linh Giới, dungeon, map treo Tiên Nhân (tg12).
  Sheet 4x4 ô 320px: 0-3 đứng · 4-9 di chuyển · 10-15 tấn công. Bake lại bằng tools/bake_spine_quai.py (xem FIX430_QUAI_SPINE.md).
  Tắt nhanh: window.QSP.enable=false (quái cũ vẽ lại như trước). Đổi map: QSP.maps={1:'troll_bang',3:'thi_binh'}. */
(function(){
'use strict';
if(typeof spawn!=='function'||typeof foe!=='function'||typeof E==='undefined')return;
var CELL=320,TAU=Math.PI*2;
var D={
 troll_bang:{name:'Băng Cự Ma Binh',h:122,top:19.2,bot:223.8,cx:169.3,col:'rgba(127,208,255,'},
 thi_binh:{name:'U Minh Thi Binh',h:84,top:19.2,bot:163.4,cx:130.3,col:'rgba(176,112,255,'}
};
var CFG=window.QSP={enable:true,maps:{1:'troll_bang',3:'thi_binh'},path:'assets/quai-spine/',D:D};
var imgs={};
function img(id){
 var o=imgs[id];if(o)return o;
 o=imgs[id]={im:new Image(),ok:0,bad:0};
 o.im.onload=function(){o.ok=1};
 o.im.onerror=function(){o.bad=1;try{console.warn('[QSP] không tải được '+CFG.path+id+'.webp → vẽ quái cũ')}catch(e){}};
 o.im.src=CFG.path+id+'.webp';return o}
Object.keys(D).forEach(function(k){img(k)});CFG.imgs=imgs;

/* phụ bản (Huyễn Cảnh/Cốt Hải… dùng lại mapSel 2-4) đang chạy → không đổi hình */
function pbOn(){
 try{return !!(window.PBC&&PBC.maps&&PBC.maps.some(function(M){return M.on&&M.cfg&&M.cfg.base===(mapSel|0)}))}catch(x){return false}}

var _spawn=spawn;
spawn=function(i){
 var n0=E.length;_spawn.apply(this,arguments);
 try{
  if(E.length===n0||CFG.enable===false||typeof lg==='undefined'||lg||dg||vil)return;
  var id=CFG.maps[mapSel|0];if(!id||!D[id]||pbOn())return;
  var e=E[E.length-1];if(!e||e.k==='pal'||e.tg12||e.spn)return;
  e.spn=id;
 }catch(x){}
};

function aura(c,x,y,r,col,al){
 c.save();c.globalCompositeOperation='lighter';var q=c.createRadialGradient(x,y,0,x,y,r);
 q.addColorStop(0,col+al*.55+')');q.addColorStop(1,col+'0)');c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}

var _foe=foe;
foe=function(e){
 if(!e||!e.spn||CFG.enable===false)return _foe.apply(this,arguments);
 var d=D[e.spn],o=imgs[e.spn];
 if(!d||!o||o.bad||!o.ok||!o.im.naturalWidth)return _foe.apply(this,arguments);
 try{
  var bz=(typeof BZ!=='undefined'?BZ[e.b|0]:1)||1,H=d.h*bz,k=H/(d.bot-d.top),dir=Math.sign(P.x-e.x)||1,
   cd=e.cd||0,sn=e.sn|0,rg=e.rg>=200,f;
  if(cd>48)f=10+Math.min(5,Math.floor((1-Math.min(1,(cd-48)/16))*6));
  else if(e.mv)f=4+(Math.floor(fr/5)+sn)%6;
  else f=(Math.floor(fr/12)+sn)%4;
  var lg_=cd>48&&!rg?(cd-48)*1.3*dir:0,al=Math.max(.05,Math.min(1,1-(e.in||0)/30)),x=(e.x-cam+lg_)*s,
   ph=fr*.25+sn,bob=e.mv?Math.abs(Math.sin(ph))*5*s:0,lean=e.mv?Math.sin(ph)*.035*dir:0,
   br=e.mv?1:1+Math.sin(fr*.1+sn)*.012;
  g.globalAlpha=al;g.save();g.translate(x,GY-bob);g.scale(s*SZ,s*SZ);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,2,H*.36,7,0,0,TAU);g.fill();
  aura(g,0,-H*.45,H*.7,d.col,.3);
  g.save();g.rotate(lean);g.scale(dir,br);
  if(e.b==1||e.b==3){g.shadowColor=e.b==3?'#c070ff':'#7fd0ff';g.shadowBlur=20+Math.sin(fr*.1)*6}
  var sx=(f%4)*CELL,sy=Math.floor(f/4)*CELL,dw=CELL*k,dx=-d.cx*k,dy=-d.bot*k;
  g.drawImage(o.im,sx,sy,CELL,CELL,dx,dy,dw,dw);
  if(e.fl>0){g.shadowBlur=0;g.globalCompositeOperation='lighter';g.globalAlpha=.55*al;g.drawImage(o.im,sx,sy,CELL,CELL,dx,dy,dw,dw)}
  g.restore();
  if(e.sl>0){g.font='20px Ma Shan Zheng,KTH Serif,STKaiti,KaiTi,serif';g.textAlign='center';g.fillText('❄️',0,-H-4)}
  g.restore();
  var nx=(e.x-cam)*s,ny=GY-(H*SZ+8)*s,
   nm=((e.b==2?'🐲':e.b==3?'👑':e.b==1?'⭐':'')+(window.NHX&&NHX.ic?NHX.ic(e):'')+d.name)+' '+e.lv+' 🛡'+Math.round(e.df);
  g.font='bold '+6.5*s+'px KTH Serif,Songti SC,STKaiti,KaiTi,serif';g.textAlign='center';
  var w2=g.measureText(nm).width;
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(nx-w2/2-3,ny-8.5*s,w2+6,8.5*s);
  g.fillStyle=e.b==1?'#7fd0ff':e.b==3?'#d9a0ff':e.b?'#e8a0ff':'#fff';g.fillText(nm,nx,ny-2*s);
  g.fillStyle='#000a';g.fillRect(nx-30*s,ny+2,60*s,5*s);
  g.fillStyle='#e8c040';g.fillRect(nx-30*s,ny+2,60*s*Math.max(0,Math.min(1,e.hp/e.max)),5*s);
  g.globalAlpha=1;
 }catch(x){g.globalAlpha=1;
  try{console.warn('[QSP] lỗi vẽ: '+x.message)}catch(_){}
  e.spn=0;return _foe.apply(this,arguments)}
};
})();
