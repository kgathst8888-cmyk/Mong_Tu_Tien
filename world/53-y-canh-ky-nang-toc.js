/* ===== 🌟 KỸ NĂNG TIÊN TỘC / MA TỘC · HIỆU ỨNG MỚI + MỞ KHOÁ BẰNG NGỘ ĐẠO / MA KHÍ (world/53-y-canh-ky-nang-toc.js) =====
 * Mở rộng world/49-y-canh-than-thong.js (49 gọi YCTOC.fire / YCTOC.ok / YCTOC.lockMsg / YCTOC.lockShort / YCTOC.card). Giữ nguyên TÊN, MP, hồi chiêu, hệ số sát thương, trạng thái (STLAST) của 3 thần thông.
 * Màu hiệu ứng = màu sát thương Ý Cảnh của từng tộc (world/45): Tiên = vàng #ffe24a viền cam #ff9a00 · Ma = đen #0c0614 viền tím #b070ff. Sát thương đi qua dm() với SKF=1 (giữ sát thương phụ Ý Cảnh).
 * TIÊN TỘC: 1) Thiên thần cầm kiếm chém xuống · 2) Hai con rồng lao nhanh về phía địch (xuyên) · 3) Khe nứt hư không mở ra, rải thiên thạch.
 *   Mở khoá 2-3 bằng NGỘ ĐẠO: trồng cây (thu hoạch 1 cây = +1) và luyện đan (thành công 1 viên = +1); cần 1000 / 5000 điểm. Lưu ở PS[cur].yc.ng.
 * MA TỘC: 1) Nhiều bàn tay quỷ mọc từ lòng đất liên tục 3s · 2) Nhiều oán linh bay qua bay lại gây sát thương 3s · 3) Hố đen bắn nhiều tia ma khí; tia giết địch → triệu hồi quỷ xương (sống 5s, tối đa 5).
 *   Mở khoá 2-3 bằng MA KHÍ hấp thụ: mỗi Boss Ma (Ma Thần) bị hạ cho ngẫu nhiên 1-10 ma khí; cần 1000 / 5000. Lưu ở PS[cur].yc.mk.
 * Chỉnh số liệu: khối CF. Hiệu ứng tự giảm bớt khi nhiều FX/địch (light()). */
(function(){
'use strict';
if(typeof PS==='undefined'||!window.YCTT||!window.YCANH||typeof FX==='undefined')return;
var CF={need:[0,1000,5000],mk:[1,10],mkOnlyMa:true,
 desc:{t:['Thiên thần cầm kiếm giáng xuống chém một nhát, sóng kiếm lan rộng quanh địch gần nhất, hồi 2% máu.','Hai con rồng vàng lao nhanh về phía kẻ địch, xuyên qua mọi địch trên đường.','Khe nứt hư không mở ra trên trời, rải thật nhiều thiên thạch xuống địch.'],
       m:['Nhiều bàn tay quỷ từ lòng đất mọc lên liên tục trong 3s, hút 2% máu.','Nhiều oán linh bay qua bay lại gây sát thương trong 3s, làm chậm.','Hố đen mở ra bắn nhiều tia ma khí đen vào địch; tia giết địch triệu hồi quỷ xương (sống 5s, tối đa 5).']},
 icon:{t:['👼','🐉','☄️'],m:['🖐️','👻','🕳️']}};
var PAL={t:{a:'#ffe24a',b:'#ff9a00',l:'#fff3b0',w:'#fffbe0'},m:{a:'#0c0614',b:'#b070ff',l:'#d8b0ff',m:'#7a40c0'}};
var PI=Math.PI,TAU=PI*2;

/* ---------- tiện ích ---------- */
function G(n){try{return(0,eval)('typeof '+n+'===\"function\"?'+n+':null')}catch(e){return null}}
var lt=null,fl=null,sk=null;
function later(n,f){lt=lt||G('later');if(lt)lt(n,f);else setTimeout(f,n*16)}
function flash(c,l){try{fl=fl||G('flash');if(fl)fl(c,l)}catch(e){}}
function shake(n){try{sk=sk||G('shake');if(sk)sk(n)}catch(e){}}
function Y(){var p=PS[cur],y=p&&p.yc;return y&&(y.p==='t'||y.p==='m')?y:null}
function say(t,c){try{DT.push({x:P.x,y:175,s:t,c:c||'#ffe27a',g:1,l:130})}catch(e){}}
function alive(){return E.filter(function(e){return e.in<=0&&e.hp>0})}
function light(){return FX.length>50||E.length>10}
function fx(wx,life,fn){var o={x:wx,l:life,m:life,fn:fn};FX.push(o);return o}
function rnd(a,b){return a+R()*(b-a)}
function skn(path,j){try{return YCTT.cfg.sk[path][j].n}catch(e){return'Thần thông'}}

/* ---------- tài nguyên mở khoá ---------- */
function res(y){return y.p==='t'?(y.ng|0):(y.mk|0)}
function ok(j,inf){if(j<=0)return true;var y=Y();return !!y&&res(y)>=CF.need[j]}
function lockShort(j,inf){return inf&&inf.path==='t'?'Ngộ '+CF.need[j]:'Khí '+CF.need[j]}
function lockMsg(j,inf){var y=Y(),n=CF.need[j];return inf&&inf.path==='t'?'cần '+n+' điểm ngộ đạo (hiện '+(y?y.ng|0:0)+') — trồng cây, luyện đan':'cần '+n+' ma khí (hiện '+(y?y.mk|0:0)+') — hạ Boss Ma Thần'}
function gain(y,key,n){
 var o=y[key]|0,v=o+n;y[key]=v;
 [1,2].forEach(function(j){if(o<CF.need[j]&&v>=CF.need[j]){say('🔓 Mở khoá thần thông: '+skn(y.p,j),PAL[y.p].b);flash(y.p==='t'?'#ffe27a':'#7a40c0',8);try{sv()}catch(e){}}})}
function ngo(n){var y=Y();if(!y||y.p!=='t')return;gain(y,'ng',n||1)}
function mkhi(n){var y=Y();if(!y||y.p!=='m')return;gain(y,'mk',n||1);try{DT.push({x:P.x,y:150,s:'🌑 +'+n+' ma khí',c:'#d8b0ff',g:1,l:90})}catch(e){}}
/* Boss Ma (Ma Thần: e.mt) bị hạ → hấp thụ ma khí. Bọc drop() như world/08 đã làm cho hạt giống. */
if(typeof drop==='function'){var _d=drop;drop=function(e){var r=_d.apply(this,arguments);try{var y=Y();if(y&&y.p==='m'&&e&&(e.mt||(!CF.mkOnlyMa&&(e.b||e.k==='boss'))))mkhi(CF.mk[0]+Math.floor(R()*(CF.mk[1]-CF.mk[0]+1)))}catch(x){}return r}}

/* ---------- hiệu ứng TIÊN (ánh sáng vàng, cộng 'lighter') ---------- */
function angelSlash(cx,life){fx(cx,life,function(f,p,X,gy){
 var a=p<.85?1:(1-p)/.15,d=Math.min(1,p/.36),sw=p<.36?0:Math.min(1,(p-.36)/.2),by=gy-(340-190*d)*s;
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;
 var q=g.createRadialGradient(X,by,4*s,X,by,130*s);q.addColorStop(0,'rgba(255,240,170,.75)');q.addColorStop(1,'rgba(255,190,30,0)');g.fillStyle=q;g.beginPath();g.arc(X,by,130*s,0,TAU);g.fill();
 for(var sd=-1;sd<=1;sd+=2){g.fillStyle='rgba(255,232,140,.9)';g.strokeStyle='#ff9a00';g.lineWidth=2*s;g.beginPath();g.moveTo(X+sd*10*s,by-8*s);
  g.bezierCurveTo(X+sd*70*s,by-96*s,X+sd*128*s,by-64*s,X+sd*98*s,by+12*s);g.bezierCurveTo(X+sd*80*s,by-10*s,X+sd*50*s,by+8*s,X+sd*14*s,by+22*s);g.closePath();g.fill();g.stroke()}
 g.fillStyle='#fff6cf';g.beginPath();g.moveTo(X-17*s,by+72*s);g.lineTo(X-9*s,by-12*s);g.lineTo(X+9*s,by-12*s);g.lineTo(X+17*s,by+72*s);g.closePath();g.fill();
 g.beginPath();g.arc(X,by-25*s,10*s,0,TAU);g.fill();
 g.strokeStyle='#ffe24a';g.lineWidth=2.6*s;g.beginPath();g.ellipse(X,by-43*s,14*s,4.5*s,0,0,TAU);g.stroke();
 var hx=X+14*s,hy=by+4*s,L=98*s,ang=-2.0+3.4*sw,tx=hx+Math.cos(ang)*L,ty=hy+Math.sin(ang)*L;
 if(sw>0){g.strokeStyle='rgba(255,226,74,.7)';g.lineWidth=12*s;g.lineCap='round';g.beginPath();g.arc(hx,hy,L*.92,-2.0,ang);g.stroke();g.strokeStyle='rgba(255,251,224,.9)';g.lineWidth=3*s;g.beginPath();g.arc(hx,hy,L*.92,-2.0,ang);g.stroke()}
 g.strokeStyle='#ff9a00';g.lineWidth=7*s;g.lineCap='round';g.beginPath();g.moveTo(hx,hy);g.lineTo(tx,ty);g.stroke();
 g.strokeStyle='#fffbe0';g.lineWidth=3*s;g.beginPath();g.moveTo(hx,hy);g.lineTo(tx,ty);g.stroke();
 g.strokeStyle='#ffe24a';g.lineWidth=4*s;g.beginPath();g.moveTo(hx-Math.sin(ang)*9*s,hy+Math.cos(ang)*9*s);g.lineTo(hx+Math.sin(ang)*9*s,hy-Math.cos(ang)*9*s);g.stroke();
 if(p>.52){var k=Math.min(1,(p-.52)/.4);g.translate(X,gy-3*s);g.scale(1,.28);g.globalAlpha=a*(1-k*.8);g.strokeStyle='#fff3b0';g.lineWidth=6*s;g.beginPath();g.arc(0,0,300*s*k,0,TAU);g.stroke();g.strokeStyle='#ffe24a';g.lineWidth=3*s;g.beginPath();g.arc(0,0,300*s*k*.7,0,TAU);g.stroke();
  g.fillStyle='rgba(255,226,74,.3)';g.beginPath();g.arc(0,0,300*s*k*.7,0,TAU);g.fill()}
 g.restore()})}
function dragonFx(px,dd,len,life,k){fx(px,life,function(f,p,X,gy){
 var a=p<.8?1:(1-p)/.2,e=Math.min(1,p/.8),y0=gy-(k?70:150)*s,ph=k?0:PI,pts=[],i;
 for(i=0;i<28;i++){var ei=Math.max(0,e-i*.016);pts.push([X+dd*len*s*ei,y0+Math.sin(ei*13+ph)*(17-i*.3)*s])}
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.lineCap='round';g.lineJoin='round';
 for(var pass=0;pass<2;pass++){for(i=27;i>0;i--){var w=(22-i*.62)*s*(pass?.42:1);if(w<1.5)w=1.5;g.strokeStyle=pass?'#fff3b0':'rgba(255,154,0,.75)';g.lineWidth=w;g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i-1][0],pts[i-1][1]);g.stroke()}}
 var hx=pts[0][0],hy=pts[0][1];g.fillStyle='#ffe24a';g.strokeStyle='#ff9a00';g.lineWidth=2*s;
 g.beginPath();g.moveTo(hx-dd*6*s,hy-14*s);g.lineTo(hx+dd*44*s,hy-5*s);g.lineTo(hx+dd*20*s,hy+6*s);g.lineTo(hx+dd*42*s,hy+14*s);g.lineTo(hx-dd*6*s,hy+14*s);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#fff3b0';g.lineWidth=2.5*s;g.beginPath();g.moveTo(hx-dd*2*s,hy-12*s);g.lineTo(hx-dd*30*s,hy-34*s);g.moveTo(hx+dd*6*s,hy-12*s);g.lineTo(hx-dd*16*s,hy-36*s);g.stroke();
 g.fillStyle='#fff';g.beginPath();g.arc(hx+dd*14*s,hy-5*s,3.6*s,0,TAU);g.fill();
 g.fillStyle='#fff3b0';for(i=3;i<26;i+=5){g.globalAlpha=a*.7;g.beginPath();g.arc(pts[i][0],pts[i][1]+Math.sin(fr*.3+i)*6*s,2.2*s,0,TAU);g.fill()}
 g.restore()})}
function riftFx(cx,life){fx(cx,life,function(f,p,X,gy){
 var op=p<.14?p/.14:p>.86?(1-p)/.14:1,y=Math.max(46*s,gy-430*s),w=130*s*op,h=34*s*op,pts=[],i,n=18;
 for(i=0;i<=n;i++){var t=i/n*TAU,r=1+.45*Math.sin(i*7.3+cx*.01)*Math.cos(i*3.1);pts.push([X+Math.cos(t)*w*r,y+Math.sin(t)*h*r])}
 g.save();g.globalCompositeOperation='lighter';
 var q=g.createRadialGradient(X,y,6*s,X,y,w*1.8);q.addColorStop(0,'rgba(255,230,120,.55)');q.addColorStop(1,'rgba(255,170,0,0)');g.globalAlpha=op;g.fillStyle=q;g.beginPath();g.arc(X,y,w*1.8,0,TAU);g.fill();
 g.globalCompositeOperation='source-over';g.fillStyle='#1a0e00';g.beginPath();pts.forEach(function(q,i){i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.closePath();g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle='#ffe24a';g.lineWidth=5*s;g.stroke();g.strokeStyle='#fffbe0';g.lineWidth=2*s;g.stroke();
 g.restore()})}
function meteorFx(tx,life,dx,top){fx(tx,life,function(f,p,X,gy){
 var e=p*p,x=X+dx*s*(1-e),y=top+(gy-6*s-top)*e,a=p<.9?1:(1-p)/.1;
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;
 var tx0=x+dx*s*.28,ty0=y-(gy-top)*.28;g.strokeStyle='rgba(255,154,0,.8)';g.lineWidth=9*s;g.lineCap='round';g.beginPath();g.moveTo(tx0,ty0);g.lineTo(x,y);g.stroke();
 g.strokeStyle='#fff3b0';g.lineWidth=3*s;g.beginPath();g.moveTo(tx0,ty0);g.lineTo(x,y);g.stroke();
 var q=g.createRadialGradient(x,y,2*s,x,y,18*s);q.addColorStop(0,'#fffbe0');q.addColorStop(.5,'#ffe24a');q.addColorStop(1,'rgba(255,154,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,18*s,0,TAU);g.fill();
 if(p>.82){var k=(p-.82)/.18;g.translate(X,gy-4*s);g.scale(1,.3);g.globalAlpha=1-k;g.strokeStyle='#ffe24a';g.lineWidth=4*s;g.beginPath();g.arc(0,0,(18+70*k)*s,0,TAU);g.stroke()}
 g.restore()})}

/* ---------- hiệu ứng MA (khối tối chồng 'source-over', viền tím) ---------- */
function handFx(wx,life){var lean=Math.sin(wx*7.13)*14;fx(wx,life,function(f,p,X,gy){
 var up=Math.min(1,p*3.2),a=p<.65?1:(1-p)/.35,h=112*s*up,wy=gy-h,l=lean*s,hx=X+l;
 g.save();g.globalAlpha=a;
 g.fillStyle='rgba(176,112,255,.25)';g.beginPath();g.ellipse(X,gy-2*s,24*s*up,6*s*up,0,0,TAU);g.fill();
 g.fillStyle='#0c0614';g.strokeStyle='#b070ff';g.lineWidth=2*s;
 g.beginPath();g.moveTo(X-9*s,gy);g.quadraticCurveTo(X-12*s+l,gy-h*.5,hx-7*s,wy);g.lineTo(hx+7*s,wy);g.quadraticCurveTo(X+12*s+l,gy-h*.5,X+9*s,gy);g.closePath();g.fill();g.stroke();
 g.beginPath();g.ellipse(hx,wy-8*s,12*s,10*s,0,0,TAU);g.fill();g.stroke();
 g.lineCap='round';for(var i=-2;i<=2;i++){var fx0=hx+i*5*s,fy0=wy-14*s,cx=hx+i*12*s,cy=wy-(30+(2-Math.abs(i))*3)*s,ex=hx+i*17*s+i*3*s,ey=wy-(44-Math.abs(i)*5)*s;
  g.strokeStyle='#0c0614';g.lineWidth=6*s;g.beginPath();g.moveTo(fx0,fy0);g.quadraticCurveTo(cx,cy,ex,ey);g.stroke();
  g.strokeStyle='#b070ff';g.lineWidth=1.8*s;g.beginPath();g.moveTo(fx0,fy0);g.quadraticCurveTo(cx,cy,ex,ey);g.stroke()}
 g.restore()})}
function wraithDraw(x,y,dir,a,t){
 g.save();g.globalAlpha=a;g.fillStyle='#0c0614';g.strokeStyle='#b070ff';g.lineWidth=2*s;
 g.beginPath();g.arc(x,y,11*s,0,TAU);g.fill();g.stroke();
 g.beginPath();g.moveTo(x-dir*4*s,y+6*s);
 for(var i=1;i<=5;i++)g.lineTo(x-dir*(4+i*9)*s,y+(i*4+Math.sin(t*.3+i*1.7)*7)*s);
 for(i=5;i>=1;i--)g.lineTo(x-dir*(4+i*9)*s,y+(i*4-5+Math.sin(t*.3+i*1.7)*7+i*2)*s);
 g.lineTo(x-dir*2*s,y-6*s);g.closePath();g.fill();g.stroke();
 g.fillStyle='#e0b8ff';g.shadowColor='#b070ff';g.shadowBlur=0;g.beginPath();g.arc(x+dir*4*s,y-2*s,2.2*s,0,TAU);g.arc(x-dir*1*s,y-2*s,2.2*s,0,TAU);g.fill();
 g.fillStyle='#000';g.beginPath();g.ellipse(x+dir*2*s,y+5*s,3*s,4.5*s,0,0,TAU);g.fill();g.restore()}
function wraithX(i,tf,dd){return dd*140+Math.sin(tf*(.09+(i%3)*.025)+i*1.1)*(280+i*30)}
function wraithsFx(px,dd,life){fx(px,life,function(f,p,X,gy){
 var a=p<.1?p/.1:p>.88?(1-p)/.12:1;
 for(var i=0;i<6;i++){var tf=fr,sp=.09+(i%3)*.025,dir=Math.cos(tf*sp+i*1.1)>0?1:-1;
  wraithDraw(X+wraithX(i,tf,dd)*s,gy-(58+(i%3)*52+Math.sin(tf*.13+i)*14)*s,dir,a,tf)}})}
function holeFx(cx,life,hy){fx(cx,life,function(f,p,X,gy){
 var op=p<.16?p/.16:p>.86?(1-p)/.14:1,y=Math.max(70*s,gy-hy*s),rr=62*s*op;
 g.save();g.globalAlpha=op;
 var q=g.createRadialGradient(X,y,rr*.4,X,y,rr*2.4);q.addColorStop(0,'rgba(120,60,200,.55)');q.addColorStop(1,'rgba(80,30,150,0)');g.fillStyle=q;g.beginPath();g.arc(X,y,rr*2.4,0,TAU);g.fill();
 g.fillStyle='#000';g.beginPath();g.ellipse(X,y,rr,rr*.58,0,0,TAU);g.fill();
 for(var i=0;i<3;i++){g.strokeStyle=i%2?'#b070ff':'#7a40c0';g.lineWidth=(4-i)*s;var a0=fr*.07*(i%2?1:-1)+i*2,k=1+i*.2;g.beginPath();g.ellipse(X,y,rr*k,rr*.58*k,0,a0,a0+4.2);g.stroke()}
 g.restore()})}
function beamFx(hx,tx,life,hy){fx(tx,life,function(f,p,X,gy){
 var a=1-p,x0=X+(hx-tx)*s,y0=Math.max(70*s,gy-hy*s),y1=gy-52*s,n=7,pts=[],i;
 for(i=0;i<=n;i++){var t=i/n;pts.push([x0+(X-x0)*t+(i&&i<n?Math.sin(i*5.3+tx)*14*s:0),y0+(y1-y0)*t])}
 g.save();g.globalAlpha=a;g.lineJoin='round';g.lineCap='round';
 [['rgba(176,112,255,.55)',11*s],['#0c0614',6*s],['#7a40c0',1.6*s]].forEach(function(o){g.strokeStyle=o[0];g.lineWidth=o[1];g.beginPath();pts.forEach(function(q,i){i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.stroke()});
 g.fillStyle='rgba(12,6,20,.8)';g.strokeStyle='#b070ff';g.lineWidth=2*s;g.beginPath();g.arc(X,y1,(10+16*p)*s,0,TAU);g.fill();g.stroke();g.restore()})}
function skelDraw(X,gy,dir,t,a,grow){
 var k=Math.max(.05,Math.min(1,grow)),sw=Math.sin(t*.4)*8;
 g.save();g.globalAlpha=a;g.translate(X,gy);g.scale(1,k);g.lineCap='round';
 g.strokeStyle='#b070ff';g.lineWidth=3.2*s;g.fillStyle='#0c0614';
 g.beginPath();g.moveTo(0,-48*s);g.lineTo(0,-20*s);g.moveTo(-5*s,-20*s);g.lineTo(-8*s+sw*s,0);g.moveTo(5*s,-20*s);g.lineTo(8*s-sw*s,0);
 g.moveTo(0,-44*s);g.lineTo(dir*14*s,-32*s);g.lineTo(dir*26*s,-40*s);g.moveTo(0,-44*s);g.lineTo(-dir*10*s,-30*s);g.stroke();
 g.lineWidth=2*s;for(var i=0;i<3;i++){g.beginPath();g.moveTo(-8*s,(-42+i*7)*s);g.lineTo(8*s,(-42+i*7)*s);g.stroke()}
 g.lineWidth=2.4*s;g.beginPath();g.moveTo(dir*26*s,-40*s);g.lineTo(dir*40*s,-56*s);g.stroke();
 g.lineWidth=2*s;g.beginPath();g.arc(0,-58*s,9*s,0,TAU);g.fill();g.stroke();
 g.fillStyle='#e0b8ff';g.beginPath();g.arc(-3.4*s,-59*s,2*s,0,TAU);g.arc(3.4*s,-59*s,2*s,0,TAU);g.fill();g.restore()}

/* ---------- thi triển ---------- */
var skels=[];
function summon(x,dd,hit){
 var now=fr,live=skels.filter(function(o){return !o.dead&&now-o.born<300});
 if(live.length>=5){var old=live[0];old.dead=1;old.fx.l=Math.min(old.fx.l,8)}
 var o={x:x,born:now,dead:0,dir:dd};skels=skels.filter(function(q){return !q.dead&&now-q.born<300});
 o.fx=fx(x,300,function(f,p,X,gy){var t=fr-o.born,a=o.fx.l<12?o.fx.l/12:1;skelDraw(X,gy,o.dir,t,a,t/12)});skels.push(o);
 (function loop(n){if(n>=10||o.dead)return;later(30,function(){if(o.dead||fr-o.born>=300)return;
  var t=null,bd=1e9;alive().forEach(function(e){var d=Math.abs(e.x-o.x);if(d<bd){bd=d;t=e}});
  if(t&&bd<=420){o.dir=t.x>=o.x?1:-1;if(bd>70){o.x+=o.dir*Math.min(34,bd-60);o.fx.x=o.x}else{hit(t,.3);shake(1)}}
  loop(n+1)})})(0)}
function fire(j,S_,inf,hit,es,near,mul){
 var T=inf.path,px=P.x,dd=P.d||1,lg=light(),n0=es.length,i;
 if(T==='t'){
  if(j===0){var cx=near?near.x:px+dd*140;angelSlash(cx,36);
   later(14,function(){es.forEach(function(e){if(e.hp>0&&Math.abs(e.x-cx)<S_.r)hit(e)});flash('#ffe27a',6);shake(4)});
   if(S_.heal)P.hp=Math.min(mx(),P.hp+mx()*S_.heal);return true}
  if(j===1){var far=es.filter(function(e){return(e.x-px)*dd>-30&&Math.abs(e.x-px)<720}).sort(function(a,b){return Math.abs(b.x-px)-Math.abs(a.x-px)})[0],
    len=Math.max(260,far?Math.abs(far.x-px)+60:520);
   for(var k=0;k<2;k++)(function(k){dragonFx(px,dd,len,30+k*3,k);
    es.forEach(function(e){var dx=(e.x-px)*dd;if(dx>-40&&dx<len){later(Math.round(Math.max(0,dx)/len*24*(k?1.1:1)),function(){if(e.hp>0){hit(e,.5);if(!lg)ring2(e.x)}})}})})(k);
   flash('#ffe27a',4);shake(3);return true}
  if(j===2){var cx2=n0?es.reduce(function(a,e){return a+e.x},0)/n0:px+dd*200;riftFx(cx2,130);flash('#ffe27a',8);shake(4);
   var M=lg?16:28,k0=.8*Math.max(1,n0)/M;
   for(i=0;i<M;i++)(function(i){later(14+Math.round(i*96/M),function(){var A=alive();if(!A.length)return;var tg=A[Math.floor(R()*A.length)],tx=tg.x+rnd(-24,24);
     meteorFx(tx,16,rnd(110,190),Math.max(46*s,GY-430*s));later(14,function(){if(tg.hp>0)hit(tg,k0)})})})(i);
   return true}
 }else{
  if(j===0){for(var w=0;w<18;w++)(function(w){later(w*10,function(){var A=alive().filter(function(e){return Math.abs(e.x-px)<S_.r});
    A.slice(0,lg?4:9).forEach(function(e){handFx(e.x+rnd(-26,26),36)});A.forEach(function(e){hit(e,1/18)});if(w===0){shake(2)}})})(w);
   if(S_.heal)later(170,function(){P.hp=Math.min(mx(),P.hp+mx()*S_.heal)});return true}
  if(j===1){wraithsFx(px,dd,190);var T0=fr;
   for(var q=0;q<15;q++)(function(q){later(q*12,function(){var tf=fr;alive().forEach(function(e){var c=0;for(var i2=0;i2<6;i2++)if(Math.abs(px+wraithX(i2,tf,dd)-e.x)<70)c++;if(c)hit(e,1.3/15*Math.min(3,c))})})})(q);return true}
  if(j===2){var cx3=n0?es.reduce(function(a,e){return a+e.x},0)/n0:px+dd*200,HY=300;holeFx(cx3,110,HY);shake(4);
   var nb=lg?10:16,kb=.8*Math.max(1,n0)/nb;
   for(i=0;i<nb;i++)(function(i){later(14+Math.round(i*70/nb),function(){var A=alive().filter(function(e){return Math.abs(e.x-cx3)<760});if(!A.length)return;var tg=A[Math.floor(R()*A.length)];
     beamFx(cx3,tg.x,14,HY);hit(tg,kb);if(tg.hp<=0)summon(tg.x,dd,hit)})})(i);return true}
 }
 return false}
function ring2(x){fx(x,14,function(f,p,X,gy){g.save();g.globalCompositeOperation='lighter';g.translate(X,gy-4*s);g.scale(1,.3);g.globalAlpha=1-p;g.strokeStyle='#ffe24a';g.lineWidth=4*s;g.beginPath();g.arc(0,0,(20+60*p)*s,0,TAU);g.stroke();g.restore()})}

/* ---------- mô tả + giao diện ---------- */
function applyText(){try{['t','m'].forEach(function(p){YCTT.cfg.sk[p].forEach(function(S_,j){var rest=S_._d0||S_.d,i=rest.indexOf('. ');S_._d0=rest;S_.d=CF.desc[p][j]+(i>=0?' '+rest.slice(i+2):'');S_.i=CF.icon[p][j]})})}catch(e){}}
applyText();
function bar(v,mx_,col){var p=Math.max(0,Math.min(1,v/mx_))*100;return'<div style="height:6px;border-radius:3px;background:#2a2036;overflow:hidden;margin:3px 0"><div style="width:'+p+'%;height:100%;background:'+col+'"></div></div>'}
function card(inf){var y=Y();if(!y)return'';var t=y.p==='t',v=res(y),c=PAL[y.p].b,nm=t?'☯ Điểm ngộ đạo':'🌑 Ma khí hấp thụ';
 return'<div style="margin-top:8px;border:1px solid '+c+';border-radius:9px;padding:7px;font-size:12.5px"><b style="color:'+c+'">'+nm+': '+v.toLocaleString('vi-VN')+'</b> <span style="opacity:.75">(mở thần thông 2 ở '+CF.need[1]+', thần thông 3 ở '+CF.need[2]+')</span>'+bar(v,CF.need[2],c)
  +'<div style="opacity:.8;line-height:1.45">'+(t?'Thu hoạch 1 cây = +1 điểm · luyện thành 1 viên đan = +1 điểm.':'Hạ Boss Ma Thần: ngẫu nhiên hấp thụ '+CF.mk[0]+'-'+CF.mk[1]+' ma khí.')+'</div></div>'}

window.YCTOC={cfg:CF,fire:fire,ok:ok,lockMsg:lockMsg,lockShort:lockShort,card:card,ngo:ngo,mk:mkhi,res:function(){var y=Y();return y?res(y):0}};
})();
