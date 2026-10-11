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

/* ---------- hiệu ứng TIÊN (vàng kim + trắng ngọc; nét sắc, viền mảnh, cộng sáng 'lighter' chỉ dùng cho ánh hào quang) ---------- */
function feather(x,y,ang,len,wd,c1,c2){
 g.save();g.translate(x,y);g.rotate(ang);var gr=g.createLinearGradient(0,0,len,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
 g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(len*.22,-wd,len*.78,-wd*.85,len,0);g.bezierCurveTo(len*.78,wd*.5,len*.25,wd*.75,0,0);g.fill();
 g.strokeStyle='rgba(214,128,0,.9)';g.lineWidth=.8;g.stroke();g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.7;g.beginPath();g.moveTo(len*.04,0);g.lineTo(len*.94,0);g.stroke();g.restore()}
function wingDraw(sd,flap,spread){
 g.save();g.scale(sd,1);
 [[134,9,'#e8b94a','#fff2b8'],[104,8,'#f3cf6a','#fffbe6'],[74,7,'#ffe08a','#ffffff']].forEach(function(L,li){
  for(var i=0;i<L[1];i++){var u=i/(L[1]-1),ang=-.88+u*(1.25+spread*.15)+flap*.2*u-li*.05,len=L[0]*(.45+.55*Math.pow(u,.7));
   feather(0,0,ang,len,9+li*1.4,L[2],L[3])}});
 g.restore()}
function angelFig(X,by,k,flap,sw,spread){
 var i,SKIN='#ffe9c8',GD='#e0a82a';
 g.save();g.translate(X,by);g.scale(k,k);
 g.save();g.globalCompositeOperation='lighter';for(i=0;i<10;i++){var a=i*.628+fr*.004;g.fillStyle='rgba(255,236,150,.085)';g.beginPath();g.moveTo(0,-20);g.lineTo(Math.cos(a-.022)*190,Math.sin(a-.022)*190-20);g.lineTo(Math.cos(a+.022)*190,Math.sin(a+.022)*190-20);g.closePath();g.fill()}blob(0,-30,110,'255,226,120',.35);g.restore();
 g.save();g.translate(-8,-38);wingDraw(-1,flap,spread);g.restore();g.save();g.translate(8,-38);wingDraw(1,flap,spread);g.restore();
 var rg=g.createLinearGradient(0,-40,0,52);rg.addColorStop(0,'#ffffff');rg.addColorStop(1,'#ffe9a8');g.fillStyle=rg;g.strokeStyle='#d9972a';g.lineWidth=1.1;
 g.beginPath();g.moveTo(-15,-40);g.lineTo(15,-40);g.lineTo(11,-6);for(i=0;i<=6;i++)g.lineTo(11+(i/6)*17-(i/6)*34*0+(0),-6+(i/6)*56+(i%2?3:0)+Math.sin(fr*.1+i)*2);g.lineTo(-28,50);g.lineTo(-11,-6);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(214,150,40,.55)';g.lineWidth=.9;for(i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3.5,-6);g.quadraticCurveTo(i*8+Math.sin(fr*.1+i)*2,22,i*11,50);g.stroke()}
 var ag=g.createLinearGradient(-12,-42,12,-18);ag.addColorStop(0,'#fff0a8');ag.addColorStop(1,'#d9972a');g.fillStyle=ag;g.strokeStyle='#8a5a10';g.lineWidth=1;g.beginPath();g.moveTo(-13,-40);g.lineTo(13,-40);g.lineTo(9,-17);g.lineTo(0,-12);g.lineTo(-9,-17);g.closePath();g.fill();g.stroke();
 g.fillStyle='#ff5a5a';g.beginPath();g.arc(0,-31,2.4,0,TAU);g.fill();g.strokeStyle='#fff';g.lineWidth=.6;g.stroke();
 g.fillStyle=GD;g.fillRect(-12,-9,24,4);g.fillStyle='#fff6c0';g.beginPath();g.arc(0,-7,2.6,0,TAU);g.fill();
 [[-14,-40],[14,-40]].forEach(function(o){var pg=g.createRadialGradient(o[0]-2,o[1]-2,1,o[0],o[1],9);pg.addColorStop(0,'#fff6c0');pg.addColorStop(1,'#c9871a');g.fillStyle=pg;g.strokeStyle='#8a5a10';g.lineWidth=.9;g.beginPath();g.arc(o[0],o[1],8,0,TAU);g.fill();g.stroke()});
 /* tóc */
 g.strokeStyle='#f3c24a';g.lineWidth=2.2;g.lineCap='round';for(i=0;i<7;i++){g.beginPath();g.moveTo(-3+i*1,-64);g.bezierCurveTo(-14-i*3,-60+Math.sin(fr*.12+i)*3,-22-i*4,-40+Math.sin(fr*.1+i*2)*6,-26-i*5,-18+i*3);g.stroke()}
 var hg=g.createRadialGradient(-2,-60,2,0,-56,11);hg.addColorStop(0,'#fff6e4');hg.addColorStop(1,'#f0c896');g.fillStyle=hg;g.strokeStyle='#b8823a';g.lineWidth=.9;g.beginPath();g.arc(0,-56,10,0,TAU);g.fill();g.stroke();
 g.strokeStyle='#6a4a20';g.lineWidth=1.3;g.beginPath();g.moveTo(1.5,-57);g.lineTo(6,-57);g.moveTo(-6,-57);g.lineTo(-1.5,-57);g.stroke();g.beginPath();g.arc(1,-52,2.6,.25,PI-.25);g.stroke();
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,236,150,.6)';g.lineWidth=7;g.beginPath();g.ellipse(0,-76,15,4.6,0,0,TAU);g.stroke();g.restore();g.strokeStyle='#ffd84a';g.lineWidth=3;g.beginPath();g.ellipse(0,-76,15,4.6,0,0,TAU);g.stroke();g.strokeStyle='#fffbe0';g.lineWidth=1.1;g.stroke();
 /* tay trái buông, tay phải cầm kiếm */
 g.strokeStyle='#e8c070';g.lineWidth=7;g.beginPath();g.moveTo(-14,-38);g.lineTo(-27,-14);g.stroke();g.strokeStyle='#fff6e4';g.lineWidth=5;g.stroke();g.fillStyle=SKIN;g.beginPath();g.arc(-28,-11,3.4,0,TAU);g.fill();
 var ang=-2.0+3.4*sw,hxx=14+Math.cos(ang*.8-.2)*30,hyy=-38+Math.sin(ang*.8-.2)*30;
 g.strokeStyle='#e8c070';g.lineWidth=8;g.beginPath();g.moveTo(14,-38);g.lineTo(hxx,hyy);g.stroke();g.strokeStyle='#fff6e4';g.lineWidth=6;g.stroke();g.strokeStyle='#d9972a';g.lineWidth=2;g.beginPath();g.moveTo(14+(hxx-14)*.7,-38+(hyy+38)*.7);g.lineTo(hxx,hyy);g.stroke();
 var ca=Math.cos(ang),sa=Math.sin(ang),LB=108;
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,226,120,.45)';g.lineWidth=11;g.beginPath();g.moveTo(hxx,hyy);g.lineTo(hxx+ca*LB,hyy+sa*LB);g.stroke();g.restore();
 g.strokeStyle='#8a5a10';g.lineWidth=4.6;g.beginPath();g.moveTo(hxx-ca*9,hyy-sa*9);g.lineTo(hxx,hyy);g.stroke();
 var bg2=g.createLinearGradient(hxx,hyy,hxx+ca*LB,hyy+sa*LB);bg2.addColorStop(0,'#ffffff');bg2.addColorStop(1,'#ffe9a0');g.fillStyle=bg2;g.strokeStyle='#e0a82a';g.lineWidth=1;
 g.beginPath();g.moveTo(hxx-sa*3.4,hyy+ca*3.4);g.lineTo(hxx+ca*LB*.93-sa*3,hyy+sa*LB*.93+ca*3);g.lineTo(hxx+ca*LB,hyy+sa*LB);g.lineTo(hxx+ca*LB*.93+sa*3,hyy+sa*LB*.93-ca*3);g.lineTo(hxx+sa*3.4,hyy-ca*3.4);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(214,150,40,.8)';g.lineWidth=.8;g.beginPath();g.moveTo(hxx+ca*10,hyy+sa*10);g.lineTo(hxx+ca*LB*.8,hyy+sa*LB*.8);g.stroke();
 g.strokeStyle='#ffd84a';g.lineWidth=3.2;g.beginPath();g.moveTo(hxx-sa*11,hyy+ca*11);g.lineTo(hxx+sa*11,hyy-ca*11);g.stroke();g.fillStyle='#ff5a5a';g.beginPath();g.arc(hxx,hyy,2.2,0,TAU);g.fill();
 g.restore();return{tx:hxx+ca*LB,ty:hyy+sa*LB,hx:hxx,hy:hyy,ang:ang}}
function angelSlash(cx,life){fx(cx,life,function(f,p,X,gy){
 var a=p<.86?1:(1-p)/.14,d=easeO(p/.34),sw=p<.34?0:Math.min(1,(p-.34)/.22),k=s*1.05,by=gy-(360-205*d)*s,i;
 g.save();g.globalAlpha=a;
 var r=angelFig(X,by,k,Math.sin(fr*.28)*.6*(1-sw*.5),sw,sw*.8+(p<.34?.3:0));
 if(sw>0){g.save();g.globalCompositeOperation='lighter';g.lineCap='round';var cxs=X+(r.hx*k),cys=by+r.hy*k,R_=(r.ang>-2.0?100:90)*k;
  [[14,.3,'#ffd84a'],[7,.6,'#fff3b0'],[2,.95,'#ffffff']].forEach(function(o){g.globalAlpha=a*o[1];g.strokeStyle=o[2];g.lineWidth=o[0]*s;g.beginPath();g.arc(cxs,cys,R_,-2.0,r.ang);g.stroke()});g.restore()}
 if(p>.5){var kk=Math.min(1,(p-.5)/.45),fa=a*(1-kk*.85),gx=X+36*s;
  g.save();g.globalCompositeOperation='lighter';
  var pw=(34+20*kk)*s,pg=g.createLinearGradient(0,gy-300*s,0,gy);pg.addColorStop(0,'rgba(255,230,120,0)');pg.addColorStop(.5,'rgba(255,240,170,.75)');pg.addColorStop(1,'rgba(255,255,255,.95)');g.globalAlpha=fa*(1-kk*.5);g.fillStyle=pg;g.fillRect(gx-pw/2,gy-300*s*Math.min(1,kk*3),pw,300*s*Math.min(1,kk*3));
  g.translate(gx,gy-3*s);g.scale(1,.28);g.globalAlpha=fa;[[7,'#fff3b0',1],[3,'#ffe24a',.7],[2,'#ffffff',.45]].forEach(function(o){g.strokeStyle=o[1];g.lineWidth=o[0]*s;g.beginPath();g.arc(0,0,300*s*kk*o[2],0,TAU);g.stroke()});
  g.fillStyle='rgba(255,226,74,.22)';g.beginPath();g.arc(0,0,300*s*kk*.7,0,TAU);g.fill();g.restore();
  for(i=0;i<10;i++){var u=(kk*1.3+i*.1)%1,fx0=gx+(hs(i+cx)-.5)*260*s,fy0=gy-(70+hs(i+9)*150)*s*(1-u*.2)+u*80*s;g.save();g.globalAlpha=fa*Math.sin(Math.min(1,u)*PI);g.translate(fx0,fy0);g.rotate(u*5+i);feather(0,0,0,13*s,3.4*s,'#fff6c0','#ffd84a');g.restore()}}
 g.restore()})}
function dragonFx(px,dd,len,life,k){fx(px,life,function(f,p,X,gy){
 var a=p<.8?1:(1-p)/.2,e=Math.min(1,p/.8),y0=gy-(k?70:150)*s,ph=k?0:PI,N=46,pts=[],i,W_=[];
 for(i=0;i<N;i++){var ei=Math.max(0,e-i*.0098);pts.push([X+dd*len*s*ei,y0+Math.sin(ei*13+ph)*(19-i*.25)*s]);W_.push((24*Math.pow(1-i/N,.85)+3.2)*s)}
 function nrm(i){var j=Math.max(1,i),dx=pts[j-1][0]-pts[j][0],dy=pts[j-1][1]-pts[j][1],l=Math.sqrt(dx*dx+dy*dy)||1;return[-dy/l*dd,dx/l*dd,dx/l,dy/l]}
 g.save();g.globalAlpha=a;g.lineCap='round';g.lineJoin='round';
 g.globalCompositeOperation='lighter';for(i=1;i<N;i+=2){var q=pts[i];blob(q[0],q[1],(30-i*.45)*s,k?'255,170,50':'255,214,90',.2*(1-i/N))}
 g.globalCompositeOperation='source-over';for(i=5;i<N;i+=5){var q2=pts[i];blob(q2[0]-dd*10*s,q2[1]+14*s,(20-i*.2)*s,'255,246,214',.2*(1-i/N))}
 /* thân: viền nâu, nền vàng chuyển màu, dải bụng sáng, vảy chữ V, gai lưng */
 for(i=N-1;i>0;i--){g.strokeStyle='#6a3200';g.lineWidth=W_[i]+4*s;g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i-1][0],pts[i-1][1]);g.stroke()}
 for(i=N-1;i>0;i--){var tt=i/N;g.strokeStyle='rgb('+Math.round(255-tt*40+(k?-20:0))+','+Math.round(214-tt*70-(k?30:0))+','+Math.round(70-tt*30)+')';g.lineWidth=W_[i];g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i-1][0],pts[i-1][1]);g.stroke()}
 for(i=N-1;i>1;i--){var n=nrm(i);g.strokeStyle='rgba(255,246,196,.95)';g.lineWidth=W_[i]*.38;g.beginPath();g.moveTo(pts[i][0]+n[0]*W_[i]*.3,pts[i][1]+n[1]*W_[i]*.3);g.lineTo(pts[i-1][0]+n[0]*W_[i-1]*.3,pts[i-1][1]+n[1]*W_[i-1]*.3);g.stroke()}
 g.lineWidth=.9*s;g.strokeStyle='rgba(120,60,0,.75)';
 for(i=4;i<N-2;i++){var n2=nrm(i),w2=W_[i]*.5;g.beginPath();g.moveTo(pts[i][0]-n2[0]*w2*.9-n2[2]*w2*.3,pts[i][1]-n2[1]*w2*.9-n2[3]*w2*.3);g.lineTo(pts[i][0]+n2[2]*0,pts[i][1]+n2[3]*0);g.lineTo(pts[i][0]-n2[0]*w2*.9+n2[2]*w2*.3,pts[i][1]-n2[1]*w2*.9+n2[3]*w2*.3);g.stroke()}
 g.fillStyle='#ff8a00';g.strokeStyle='#ffe06a';g.lineWidth=.8*s;
 for(i=3;i<N-3;i+=2){var n3=nrm(i),b3=-1,w3=W_[i]*.5;g.beginPath();g.moveTo(pts[i][0]+n3[0]*b3*w3,pts[i][1]+n3[1]*b3*w3);g.lineTo(pts[i][0]+n3[0]*b3*(w3+10*s*(1-i/N)+3*s)-n3[2]*5*s,pts[i][1]+n3[1]*b3*(w3+10*s*(1-i/N)+3*s)-n3[3]*5*s);g.lineTo(pts[i-1][0]+n3[0]*b3*w3,pts[i-1][1]+n3[1]*b3*w3);g.closePath();g.fill();g.stroke()}
 /* 4 chân có vuốt (gập về sau) */
 [10,22].forEach(function(ix){var n4=nrm(ix),bx=pts[ix][0]+n4[0]*W_[ix]*.45,by2=pts[ix][1]+n4[1]*W_[ix]*.45,tx2=-n4[2],ty2=-n4[3];
  g.strokeStyle='#6a3200';g.lineWidth=5*s;g.beginPath();g.moveTo(bx,by2);g.lineTo(bx+n4[0]*12*s+tx2*8*s,by2+n4[1]*12*s+ty2*8*s);g.lineTo(bx+n4[0]*14*s+tx2*22*s,by2+n4[1]*14*s+ty2*22*s);g.stroke();
  g.strokeStyle='#ffd24a';g.lineWidth=3*s;g.stroke();g.strokeStyle='#fffbe0';g.lineWidth=1.2*s;for(var c=-1;c<=1;c++){g.beginPath();g.moveTo(bx+n4[0]*14*s+tx2*22*s,by2+n4[1]*14*s+ty2*22*s);g.lineTo(bx+n4[0]*(18+c*3)*s+tx2*(30+c*2)*s,by2+n4[1]*(18+c*3)*s+ty2*(30+c*2)*s);g.stroke()}});
 /* đuôi: chùm lửa */
 var tp=pts[N-1];g.globalCompositeOperation='lighter';for(i=0;i<4;i++){g.strokeStyle='rgba(255,'+(170+i*20)+',60,.8)';g.lineWidth=2.4*s;g.beginPath();g.moveTo(tp[0],tp[1]);g.quadraticCurveTo(tp[0]-dd*16*s,tp[1]+(i-1.5)*7*s,tp[0]-dd*(34+i*5)*s,tp[1]+(i-1.5)*13*s+Math.sin(fr*.3+i)*4*s);g.stroke()}g.globalCompositeOperation='source-over';
 /* đầu rồng */
 var hx=pts[0][0],hy=pts[0][1],ang=Math.atan2(pts[0][1]-pts[4][1],pts[0][0]-pts[4][0]);
 g.save();g.translate(hx,hy);g.rotate(ang);g.scale(1.1*s,1.1*s*dd);
 g.globalCompositeOperation='lighter';for(i=0;i<6;i++){g.strokeStyle='rgba(255,'+(120+i*25)+',40,.75)';g.lineWidth=3.2;g.beginPath();g.moveTo(-4,-6+i*2.4);g.bezierCurveTo(-24,-14+i*5+Math.sin(fr*.3+i)*5,-44,-4+i*6+Math.sin(fr*.25+i*2)*7,-62-i*3,-10+i*8+Math.sin(fr*.2+i)*8);g.stroke()}g.globalCompositeOperation='source-over';
 g.strokeStyle='#fff6c8';g.lineWidth=1.8;[[1,0],[-1,1]].forEach(function(o){g.beginPath();g.moveTo(46,2+o[1]*5);g.bezierCurveTo(70,16*o[0]+10+Math.sin(fr*.3+o[1])*6,40,28+o[1]*8+Math.sin(fr*.25)*8,-6,18+o[1]*10+Math.sin(fr*.2+o[1])*9);g.stroke()});
 var hgd=g.createLinearGradient(0,-14,0,16);hgd.addColorStop(0,'#ffe36a');hgd.addColorStop(1,'#d98a1a');
 g.fillStyle='#4a0e00';g.beginPath();g.moveTo(14,2);g.lineTo(44,4);g.lineTo(30,13);g.lineTo(8,10);g.closePath();g.fill();
 g.fillStyle=hgd;g.strokeStyle='#6a3200';g.lineWidth=1.4;g.beginPath();g.moveTo(8,8);g.lineTo(36,17);g.lineTo(44,13);g.lineTo(12,3);g.closePath();g.fill();g.stroke();
 g.fillStyle='#fff';g.beginPath();for(i=0;i<5;i++){g.moveTo(16+i*5.6,13-i*.9);g.lineTo(18.4+i*5.6,16.5-i*.9);g.lineTo(21+i*5.6,13-i*.7)}g.fill();
 g.fillStyle=hgd;g.beginPath();g.ellipse(2,-1,17,12.5,0,0,TAU);g.fill();g.stroke();
 g.beginPath();g.moveTo(8,-9);g.lineTo(40,-7);g.lineTo(50,-1);g.lineTo(46,3);g.lineTo(14,3);g.closePath();g.fill();g.stroke();
 g.fillStyle='#fff';g.beginPath();for(i=0;i<5;i++){g.moveTo(18+i*5.6,3);g.lineTo(20.4+i*5.6,6.6);g.lineTo(23+i*5.6,3)}g.fill();
 g.fillStyle='#5a2400';g.beginPath();g.arc(42,-3,1.7,0,TAU);g.fill();
 g.strokeStyle='#fff3b8';g.lineWidth=3.6;g.lineCap='round';[[0,-30,-34],[1,-24,-40]].forEach(function(o){g.beginPath();g.moveTo(2+o[0]*4,-10);g.bezierCurveTo(-4,-22,-18,o[1],-34,o[2]);g.stroke();g.beginPath();g.moveTo(-14+o[0]*2,o[1]*.9);g.lineTo(-22,o[1]-12);g.stroke()});
 g.strokeStyle='rgba(214,128,0,.9)';g.lineWidth=.9;g.beginPath();g.moveTo(6,-10);g.bezierCurveTo(-4,-22,-18,-30,-34,-34);g.stroke();
 g.globalCompositeOperation='lighter';blob(15,-5,10,'255,255,255',.85);g.globalCompositeOperation='source-over';g.fillStyle='#fff8d0';g.beginPath();g.ellipse(15,-5,5.2,3.6,-.2,0,TAU);g.fill();g.fillStyle='#e07a00';g.beginPath();g.ellipse(15.6,-5,2.8,2.8,0,0,TAU);g.fill();g.fillStyle='#000';g.fillRect(14.6,-7.4,2,4.8);
 g.restore();g.restore()})}
function riftFx(cx,life){fx(cx,life,function(f,p,X,gy){
 var op=p<.14?easeO(p/.14):p>.86?(1-p)/.14:1,y=Math.max(50*s,gy-430*s),w=156*s*op,h=30*s*Math.min(1,op*1.5),i,n=30,top=[],bot=[];
 for(i=0;i<=n;i++){var t=i/n,env=Math.pow(Math.sin(Math.PI*t),.7),j=.55+.45*hs(i*3.1+cx*.01);top.push([X-w+2*w*t,y-env*h*j-(i&1?2:0)*s]);bot.push([X-w+2*w*t,y+env*h*(.55+.45*hs(i*5.3+cx*.02))+(i&1?0:2)*s])}
 function poly(){g.beginPath();top.forEach(function(q,m){m?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});for(var m=n;m>=0;m--)g.lineTo(bot[m][0],bot[m][1]);g.closePath()}
 g.save();g.globalCompositeOperation='lighter';g.globalAlpha=op;blob(X,y,w*1.7,'255,180,40',.28);
 for(i=0;i<7;i++){var rx=X+(i-3)*w*.28,rl=(150+hs(i+cx)*130)*s;var rg=g.createLinearGradient(0,y,0,y+rl);rg.addColorStop(0,'rgba(255,230,140,.2)');rg.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=rg;g.beginPath();g.moveTo(rx-w*.06,y);g.lineTo(rx+w*.06,y);g.lineTo(rx+(i-3)*20*s+w*.12,y+rl);g.lineTo(rx+(i-3)*20*s-w*.12,y+rl);g.closePath();g.fill()}
 g.restore();
 g.save();g.globalAlpha=op;poly();g.fillStyle='#02010a';g.fill();g.clip();
 var ng=g.createLinearGradient(0,y-h,0,y+h);ng.addColorStop(0,'#14083a');ng.addColorStop(.5,'#2a0f48');ng.addColorStop(1,'#07021a');g.fillStyle=ng;g.fillRect(X-w,y-h*1.2,w*2,h*2.4);
 g.globalCompositeOperation='lighter';blob(X-w*.3,y,w*.7,'255,170,60',.4);blob(X+w*.35,y+h*.2,w*.55,'200,80,200',.32);
 for(i=0;i<46;i++){var sx=X-w+hs(i)*w*2,sy=y-h+hs(i+60)*h*2,tw=.5+.5*Math.sin(fr*.15+i*2);g.fillStyle='rgba(255,255,255,'+(.4+.5*tw)+')';g.beginPath();g.arc(sx,sy,(.6+hs(i+9)*1.4)*s,0,TAU);g.fill()}
 g.restore();
 g.save();g.globalAlpha=op;g.lineJoin='round';g.globalCompositeOperation='lighter';poly();g.strokeStyle='rgba(255,170,30,.55)';g.lineWidth=9*s;g.stroke();poly();g.strokeStyle='#ffe24a';g.lineWidth=3.2*s;g.stroke();poly();g.strokeStyle='#ffffff';g.lineWidth=1.2*s;g.stroke();
 g.strokeStyle='rgba(255,226,120,.9)';g.lineWidth=1.4*s;
 for(i=0;i<12;i++){var bi=Math.floor(2+hs(i+cx)*26),isTop=i%2,bp=isTop?top[bi]:bot[bi],dir=isTop?-1:1,ln=(22+hs(i+7)*44)*s*op;g.beginPath();g.moveTo(bp[0],bp[1]);var mx2=bp[0]+(hs(i+3)-.5)*30*s,my2=bp[1]+dir*ln*.5;g.lineTo(mx2,my2);g.lineTo(mx2+(hs(i+5)-.5)*34*s,my2+dir*ln*.6);g.stroke()}
 g.restore()})}
function meteorFx(tx,life,dx,top,sz){
 var rot=hs(tx*.31)*TAU,sz0=sz||(.8+hs(tx*.7)*.8),vs=[],v;for(v=0;v<9;v++)vs.push(.74+hs(tx+v*1.7)*.5);
 fx(tx,life,function(f,p,X,gy){
  var fl=Math.min(1,p/.72),e=fl*fl,gy2=gy-6*s,x=X+dx*s*(1-e),y=top+(gy2-top)*e,r=15*s*sz0,al=p<.72?1:0,i;
  var vx=-dx*s,vy=gy2-top,vl=Math.sqrt(vx*vx+vy*vy)||1,ux=vx/vl,uy=vy/vl;
  if(al){g.save();
   g.globalCompositeOperation='source-over';for(i=1;i<=6;i++){g.globalAlpha=.22*(1-i/7);blob(x-ux*i*20*s*sz0,y-uy*i*20*s*sz0,(r*1.2+i*3*s),'40,26,18',1)}
   g.globalCompositeOperation='lighter';
   var tl=r*7.5,tg=g.createLinearGradient(x,y,x-ux*tl,y-uy*tl);tg.addColorStop(0,'rgba(255,250,210,.95)');tg.addColorStop(.25,'rgba(255,190,60,.8)');tg.addColorStop(1,'rgba(255,90,0,0)');
   var nx=-uy,ny=ux;g.fillStyle=tg;g.beginPath();g.moveTo(x+nx*r*1.1,y+ny*r*1.1);g.lineTo(x-ux*tl+Math.sin(fr*.5)*3*s,y-uy*tl);g.lineTo(x-nx*r*1.1,y-ny*r*1.1);g.closePath();g.fill();
   for(i=0;i<9;i++){var uu=(fr*.08+i*.11+hs(i+tx))%1;g.globalAlpha=1-uu;g.fillStyle=i%2?'#ffd24a':'#fff';g.beginPath();g.arc(x-ux*uu*tl*.9+(hs(i*7+tx)-.5)*r*2.2,y-uy*uu*tl*.9+(hs(i*3+tx)-.5)*r*2.2,(1.8-uu)*s,0,TAU);g.fill()}
   g.globalAlpha=1;g.globalCompositeOperation='source-over';
   g.translate(x,y);g.rotate(rot+p*7);var rg=g.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r*1.2);rg.addColorStop(0,'#8a5a30');rg.addColorStop(.6,'#3a2214');rg.addColorStop(1,'#120a06');
   g.fillStyle=rg;g.beginPath();vs.forEach(function(m,q){var an=q/9*TAU;q?g.lineTo(Math.cos(an)*r*m,Math.sin(an)*r*m):g.moveTo(Math.cos(an)*r*m,Math.sin(an)*r*m)});g.closePath();g.fill();g.strokeStyle='rgba(255,170,60,.9)';g.lineWidth=1.3*s;g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,140,20,.95)';g.lineWidth=1.5*s;for(i=0;i<4;i++){g.beginPath();g.moveTo(Math.cos(i*1.7+1)*r*.2,Math.sin(i*1.7+1)*r*.2);g.lineTo(Math.cos(i*1.7+1.3)*r*.8,Math.sin(i*1.7+1.3)*r*.8);g.stroke()}
   blob(0,0,r*1.6,'255,170,50',.35);g.restore()}
  else{var k=(p-.72)/.28,ia=1-k;g.save();
   g.globalCompositeOperation='lighter';g.globalAlpha=ia*.9;blob(X,gy2-8*s,(60+80*k)*s*sz0,'255,200,80',.7*(1-k));blob(X,gy2-6*s,(110*sz0)*s*(1-k*.5),'255,120,20',.35*ia);
   g.translate(X,gy2);g.scale(1,.3);g.strokeStyle='#fff3b0';g.lineWidth=5*s*ia;g.globalAlpha=ia;g.beginPath();g.arc(0,0,(20+130*k)*s*sz0,0,TAU);g.stroke();g.strokeStyle='#ff9a20';g.lineWidth=3*s;g.beginPath();g.arc(0,0,(10+85*k)*s*sz0,0,TAU);g.stroke();g.setTransform(1,0,0,1,0,0);g.restore();
   g.save();g.globalAlpha=ia;g.fillStyle='#2a1a10';for(i=0;i<9;i++){var an=hs(i+tx)*TAU,dd2=(18+hs(i+9)*80)*k*s*sz0,hy2=gy2-Math.sin(k*PI)*(40+hs(i+3)*60)*s*sz0+k*k*30*s;g.fillRect(X+Math.cos(an)*dd2,hy2,(2+hs(i)*3)*s,(2+hs(i+1)*3)*s)}
   g.globalCompositeOperation='source-over';blob(X+(hs(tx)-.5)*30*s,gy2-14*s*k,(38+30*k)*s*sz0,'120,92,60',.28*ia);g.restore()}
 })}
/* ---------- hiệu ứng MA (đen + tím huyết; nhiều lớp: bóng/khói tối 'source-over' + ánh tím 'lighter') ---------- */
function hs(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function blob(x,y,r,col,a){if(a<=.004||r<=0.5)return;var q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+col+','+a+')');q.addColorStop(1,'rgba('+col+',0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
function easeO(t){t=Math.max(0,Math.min(1,t));return 1-(1-t)*(1-t)*(1-t)}
/* --- 1) QUỶ THỦ: bàn tay quỷ có cẳng tay gai, 4 ngón 3 đốt + ngón cái, móng xương; mọc lên → xoè → siết chặt → chìm xuống; đất nứt, bụi đá, khói tối --- */
function handFx(wx,life,sc0){
 var sc=sc0||(.7+hs(wx*.37)*.8),lean=(hs(wx*.91)-.5)*40,sw=hs(wx*1.7)*6,seed=wx*.13;
 fx(wx,life,function(f,p,X,gy){
  var rise=p<.2?easeO(p/.2)*(1+.06*Math.sin(p*40)):1,open=p<.2?0:p<.5?(p-.2)/.3:1,grasp=p<.5?0:p<.74?(p-.5)/.24:1,sink=p>.78?(p-.78)/.22:0,
      al=1-sink*.92,k=sc*s,Hh=118*k*rise*(1-sink*.55),wxp=X+(lean*rise+Math.sin(fr*.16+sw)*3)*s,wyp=gy+2*s-Hh,i,j;
  g.save();
  /* hố nứt + ánh tím dưới đất */
  g.globalAlpha=al*Math.min(1,p*6);g.fillStyle='rgba(6,2,12,.9)';g.beginPath();g.ellipse(X,gy-1*s,30*k,8*k,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  for(i=0;i<8;i++){var a0=hs(seed+i)*TAU,L=(26+hs(seed+i+9)*34)*k;g.strokeStyle='rgba(176,112,255,'+(.55*al*(.6+.4*Math.sin(fr*.3+i)))+')';g.lineWidth=1.6*s;g.beginPath();g.moveTo(X,gy-1*s);g.lineTo(X+Math.cos(a0)*L*.55,gy-1*s+Math.sin(a0)*L*.16+(hs(seed+i+3)-.5)*4*s);g.lineTo(X+Math.cos(a0)*L,gy-1*s+Math.sin(a0)*L*.2);g.stroke()}
  blob(X,gy-2*s,46*k,'140,70,230',.34*al);g.globalCompositeOperation='source-over';
  /* khói tối quanh chân tay */
  blob(X,gy-14*s,58*k,'8,3,16',.55*al);blob(X+Math.sin(fr*.1+sw)*10*s,gy-Hh*.45,34*k,'24,10,44',.42*al);
  /* cẳng tay: gradient đen→tím, mép sáng tím, gai xương */
  var lg=g.createLinearGradient(0,gy,0,wyp);lg.addColorStop(0,'#050208');lg.addColorStop(1,'#34195a');
  var wl=13*k,wr=8.5*k,mx_=(X+wxp)/2,my=(gy+wyp)/2;
  g.globalAlpha=al;g.fillStyle=lg;g.beginPath();g.moveTo(X-wl,gy+2*s);g.quadraticCurveTo(mx_-wl-6*k,my,wxp-wr,wyp);g.lineTo(wxp+wr,wyp);g.quadraticCurveTo(mx_+wl+4*k,my,X+wl,gy+2*s);g.closePath();g.fill();
  g.strokeStyle='rgba(176,112,255,.75)';g.lineWidth=1.6*s;g.beginPath();g.moveTo(X+wl,gy+2*s);g.quadraticCurveTo(mx_+wl+4*k,my,wxp+wr,wyp);g.stroke();
  g.strokeStyle='rgba(60,30,100,.9)';g.beginPath();g.moveTo(X-wl,gy+2*s);g.quadraticCurveTo(mx_-wl-6*k,my,wxp-wr,wyp);g.stroke();
  g.fillStyle='#1a0f2a';for(i=1;i<=3;i++){var tt=i*.24,bx=(1-tt)*(1-tt)*(X-wl)+2*(1-tt)*tt*(mx_-wl-6*k)+tt*tt*(wxp-wr),by=(1-tt)*(1-tt)*(gy+2*s)+2*(1-tt)*tt*my+tt*tt*wyp;
   g.beginPath();g.moveTo(bx,by-5*k);g.lineTo(bx-9*k,by-1*k);g.lineTo(bx,by+4*k);g.closePath();g.fill();g.stroke()}
  /* gân máu tím sáng chạy dọc tay */
  g.globalCompositeOperation='lighter';g.lineWidth=1.3*s;
  for(i=0;i<2;i++){g.strokeStyle='rgba(255,42,106,'+(.45*al*(.5+.5*Math.sin(fr*.25+i*2)))+')';g.beginPath();var tx0=X+(i?4:-4)*k,ty0=gy;g.moveTo(tx0,ty0);
   for(j=1;j<=6;j++){var t2=j/6;g.lineTo(tx0+(wxp-X)*t2+Math.sin(j*2.3+i*4+fr*.2)*3.5*k,gy-(gy-wyp)*t2)}g.stroke()}
  g.globalCompositeOperation='source-over';
  /* bàn tay: lòng bàn tay + 4 ngón (3 đốt, co khi siết) + ngón cái + móng xương */
  var py=wyp-7*k;g.globalAlpha=al;
  var pg=g.createRadialGradient(wxp,py,2*k,wxp,py,15*k);pg.addColorStop(0,'#3a1c60');pg.addColorStop(1,'#0a0412');g.fillStyle=pg;g.beginPath();g.ellipse(wxp,py,13*k,11*k,0,0,TAU);g.fill();g.strokeStyle='rgba(176,112,255,.7)';g.lineWidth=1.4*s;g.stroke();
  g.lineCap='round';g.lineJoin='round';
  var fing=[[-1.5,22,17,12],[-.5,26,20,14],[.5,25,19,13],[1.5,20,15,11],[-2.5,15,12,9]];
  for(i=0;i<5;i++){var F=fing[i],th=i===4,sp=th?-1.15-open*.35:(F[0]*(.16+.2*open)),ang=-PI/2+sp+(hs(seed+i*3)-.5)*.1,dirC=th?1:(F[0]<0?1:-1),
    px0=wxp+(th?-9:F[0]*5.4)*k,py0=py-(th?-2:8)*k,pts=[[px0,py0]],aa=ang,cx=px0,cy=py0;
   for(j=1;j<=3;j++){aa+=dirC*grasp*(.5+.22*j)*(th?.8:1)+Math.sin(fr*.2+i+j)*.04;cx+=Math.cos(aa)*F[j]*k;cy+=Math.sin(aa)*F[j]*k;pts.push([cx,cy])}
   [[8.5,'#07030d'],[5.6,'#2a1448']].forEach(function(o2,pass){g.lineWidth=o2[0]*k*(pass?.9:1);g.strokeStyle=o2[1];g.beginPath();pts.forEach(function(q,m){m?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.stroke()});
   g.strokeStyle='rgba(176,112,255,.55)';g.lineWidth=1.1*s;g.beginPath();pts.forEach(function(q,m){m?g.lineTo(q[0]+1.5*s,q[1]):g.moveTo(q[0]+1.5*s,q[1])});g.stroke();
   g.fillStyle='#0f0818';pts.forEach(function(q,m){if(m&&m<3){g.beginPath();g.arc(q[0],q[1],3.2*k,0,TAU);g.fill()}});
   var ex=cx+Math.cos(aa)*10*k,ey=cy+Math.sin(aa)*10*k;g.fillStyle='#e8dff5';g.beginPath();g.moveTo(cx+Math.cos(aa+1.57)*2.8*k,cy+Math.sin(aa+1.57)*2.8*k);g.lineTo(ex,ey);g.lineTo(cx+Math.cos(aa-1.57)*2.8*k,cy+Math.sin(aa-1.57)*2.8*k);g.closePath();g.fill()}
  if(grasp>.6){g.globalCompositeOperation='lighter';blob(wxp,py-8*k,26*k,'255,42,106',.22*al*grasp);blob(wxp,py-8*k,18*k,'180,100,255',.3*al*grasp);g.globalCompositeOperation='source-over'}
  /* bụi đá văng lên */
  g.fillStyle='#1a1226';for(i=0;i<7;i++){var vx=(hs(seed+i+20)-.5)*84*k*Math.min(1,p*2),vy=-(70*hs(seed+i+30))*k*Math.sin(Math.min(1,p*1.6)*PI)+22*k*p*p;g.globalAlpha=al*(1-p*.8);g.fillRect(X+vx,gy+vy,(2+hs(seed+i)*3)*s,(2+hs(seed+i+1)*3)*s)}
  g.restore()})}
/* --- 2) OÁN LINH: bóng ma áo choàng rách, tóc bay, mắt trống rỗng phát sáng, tay xương vươn móng, vệt bóng mờ phía sau --- */
function wraithDraw(x,y,dir,a,tf,i,sc,ghost){
 var k=sc*s,L=104*k,j,t;
 g.save();g.globalAlpha=a;
 if(!ghost){g.globalCompositeOperation='lighter';blob(x,y,58*k,'150,80,235',.3);g.globalCompositeOperation='source-over'}
 var lg=g.createLinearGradient(x,y,x-dir*L,y);lg.addColorStop(0,'rgba(14,5,26,.97)');lg.addColorStop(.55,'rgba(64,26,108,.6)');lg.addColorStop(1,'rgba(130,70,210,0)');
 if(ghost){g.globalAlpha=a*3.2;blob(x-dir*26*k,y+6*k,46*k,'70,28,120',.55);blob(x,y,18*k,'110,50,190',.5);g.restore();return}
 g.fillStyle=lg;g.beginPath();g.moveTo(x+dir*3*k,y-15*k);
 for(j=0;j<=10;j++){t=j/10;g.lineTo(x-dir*t*L,y-15*k*(1-t)+Math.sin(tf*.17+i+t*5.5)*11*k*t)}
 for(j=10;j>=0;j--){t=j/10;g.lineTo(x-dir*t*L,y+(12+30*(1-t))*k+Math.sin(tf*.21+i*1.3+t*6.5+1)*13*k*t+(j%2?7:-3)*k*t)}
 g.quadraticCurveTo(x+dir*22*k,y+14*k,x+dir*3*k,y-15*k);g.closePath();g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle='rgba(176,112,255,.5)';g.lineWidth=1.4*s;g.beginPath();
 for(j=0;j<=10;j++){t=j/10;var yy=y-15*k*(1-t)+Math.sin(tf*.17+i+t*5.5)*11*k*t;j?g.lineTo(x-dir*t*L,yy):g.moveTo(x-dir*t*L,yy)}g.stroke();
 g.globalCompositeOperation='source-over';
 /* tóc rối bay ngược */
 g.strokeStyle='rgba(10,4,20,.9)';g.lineWidth=2.2*k;g.lineCap='round';
 for(j=0;j<5;j++){var hy0=y-16*k+j*1.5*k;g.beginPath();g.moveTo(x-dir*2*k,hy0);g.bezierCurveTo(x-dir*28*k,hy0-10*k+Math.sin(tf*.2+j)*8*k,x-dir*52*k,hy0+6*k+Math.sin(tf*.17+j*2)*10*k,x-dir*(70+j*6)*k,hy0+(j-2)*7*k);g.stroke()}
 /* tay xương vươn tới trước + móng */
 g.strokeStyle='#cdbfe6';g.lineWidth=2*k;
 for(j=0;j<2;j++){var sy=y+(6+j*8)*k,sw2=Math.sin(tf*.22+i+j*1.7)*6*k,ex=x+dir*(34+j*8)*k,ey=sy+(8+sw2)*k;
  g.beginPath();g.moveTo(x+dir*5*k,sy);g.quadraticCurveTo(x+dir*20*k,sy-8*k+sw2,ex,ey);g.stroke();
  for(var c=-1;c<=1;c++){g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+dir*(9+c*c)*k,ey+c*5*k);g.stroke()}}
 /* đầu: sọ tối, hốc mắt phát sáng, miệng gào */
 var hg=g.createRadialGradient(x+dir*2*k,y-3*k,2*k,x,y,15*k);hg.addColorStop(0,'#4a3a66');hg.addColorStop(1,'#0c0614');
 g.fillStyle=hg;g.strokeStyle='rgba(176,112,255,.7)';g.lineWidth=1.4*s;g.beginPath();g.ellipse(x,y,12*k,14*k,0,0,TAU);g.fill();g.stroke();
 g.fillStyle='#000';g.beginPath();g.ellipse(x+dir*5*k,y-4*k,3.6*k,4.6*k,0,0,TAU);g.ellipse(x-dir*3*k,y-4*k,3.6*k,4.6*k,0,0,TAU);g.fill();g.globalCompositeOperation='lighter';blob(x+dir*5*k,y-4*k,6.5*k,'224,184,255',.9);blob(x-dir*3*k,y-4*k,6.5*k,'224,184,255',.9);blob(x+dir*5*k,y-4*k,2.2*k,'255,255,255',1);blob(x-dir*3*k,y-4*k,2.2*k,'255,255,255',1);
 g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();g.ellipse(x+dir*2*k,y+7*k,3.6*k,6*k+Math.sin(tf*.4+i)*1.4*k,0,0,TAU);g.fill();
 g.restore()}
function wraithX(i,tf,dd){return dd*140+Math.sin(tf*(.09+(i%3)*.025)+i*1.1)*(280+i*30)}
function wraithsFx(px,dd,life){fx(px,life,function(f,p,X,gy){
 var a=p<.1?p/.1:p>.88?(1-p)/.12:1;
 g.save();g.globalAlpha=.22*a;g.fillStyle='#06020c';g.fillRect(0,0,W,H);g.restore();
 for(var i=0;i<6;i++){var tf=fr,sp=.09+(i%3)*.025,sc=.85+(i%3)*.17,dir=Math.cos(tf*sp+i*1.1)>0?1:-1,hy=function(t2){return gy-(58+(i%3)*52+Math.sin(t2*.13+i)*14)*s};
  for(var k=4;k>=1;k--){var t2=tf-k*3.2,dr=Math.cos(t2*sp+i*1.1)>0?1:-1;wraithDraw(X+wraithX(i,t2,dd)*s,hy(t2),dr,a*.16,t2,i,sc,true)}
  wraithDraw(X+wraithX(i,tf,dd)*s,hy(tf),dir,a,tf,i,sc,false);
  g.save();g.globalCompositeOperation='lighter';for(var q=0;q<3;q++){var u=(tf*.02+q/3+i*.17)%1;g.globalAlpha=a*(1-u)*.8;g.fillStyle='#e0b8ff';var wx2=X+wraithX(i,tf,dd)*s-dir*(18+u*70)*s*sc,wy2=hy(tf)+(hs(i*9+q)-.5)*24*s-u*18*s;g.beginPath();g.arc(wx2,wy2,(2.4-u*1.6)*s,0,TAU);g.fill()}g.restore()}})}
/* --- 3) HỐ ĐEN: tối màn hình, đĩa bồi tụ xoắn, hạt bị hút, vành sáng; TIA MA KHÍ: xúc tu đen uốn lượn + khói + vụ nổ gai; QUỶ XƯƠNG chi tiết --- */
function holeFx(cx,life,hy){fx(cx,life,function(f,p,X,gy){
 var op=p<.14?p/.14:p>.86?(1-p)/.14:1,y=Math.max(70*s,gy-hy*s),R=64*s*op,t=fr,i,arm;
 g.save();g.globalAlpha=.34*op;g.fillStyle='#06020c';g.fillRect(0,0,W,H);
 g.globalAlpha=op;blob(X,y,R*3.4,'60,16,120',.5);blob(X,y,R*2,'12,4,24',.85);
 if(p<.28){var rk=p/.28;g.strokeStyle='rgba(176,112,255,'+(1-rk)*.8+')';g.lineWidth=3*s;g.beginPath();g.ellipse(X,y,R*(1+rk*2.4),R*.5*(1+rk*2.4),0,0,TAU);g.stroke()}
 g.globalCompositeOperation='lighter';
 for(arm=0;arm<3;arm++){var a0=t*.06+arm*2.0944;
  for(var pass=0;pass<2;pass++){g.strokeStyle=pass?'rgba(255,60,120,.55)':'rgba(150,80,235,.5)';g.lineWidth=(pass?3:9)*s*op;g.lineCap='round';g.beginPath();
   for(i=0;i<=16;i++){var r=R*(.95+i*.085),an=a0+i*.22;i?g.lineTo(X+Math.cos(an)*r,y+Math.sin(an)*r*.46):g.moveTo(X+Math.cos(an)*r,y+Math.sin(an)*r*.46)}g.stroke()}}
 for(i=0;i<30;i++){var u=(t*.012*(.6+hs(i)*.8)+hs(i+7))%1,rr=R*(2.6-2.2*u),aq=hs(i+3)*TAU+t*.05+u*3;g.globalAlpha=op*Math.sin(u*PI)*.9;g.fillStyle=i%3?'#c9a0ff':'#ff4d8a';g.beginPath();g.arc(X+Math.cos(aq)*rr,y+Math.sin(aq)*rr*.46,(1+1.6*(1-u))*s,0,TAU);g.fill()}
 g.globalAlpha=op;g.globalCompositeOperation='source-over';
 var eg=g.createRadialGradient(X,y,0,X,y,R*1.05);eg.addColorStop(0,'#000');eg.addColorStop(.85,'#000');eg.addColorStop(1,'#0c0616');g.fillStyle=eg;g.beginPath();g.ellipse(X,y,R,R*.5,0,0,TAU);g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle='rgba(235,205,255,.9)';g.lineWidth=2*s;g.beginPath();g.ellipse(X,y,R*1.01,R*.51,0,0,TAU);g.stroke();g.strokeStyle='rgba(255,50,110,.6)';g.lineWidth=3.4*s;g.beginPath();g.ellipse(X,y,R*1.08,R*.55,0,.4,.4+PI*1.3);g.stroke();
 g.restore()})}
function beamFx(hx,tx,life,hy){fx(tx,life,function(f,p,X,gy){
 var a=p<.7?1:(1-p)/.3,x0=X+(hx-tx)*s,y0=Math.max(70*s,gy-hy*s),y1=gy-50*s,i,N=16,pts=[],bx=(x0+X)/2+Math.sin(tx*.3)*46*s,by=(y0+y1)/2-26*s,grow=Math.min(1,p*3.4);
 for(i=0;i<=N;i++){var u=i/N*grow,q=1-u,px=q*q*x0+2*q*u*bx+u*u*X,py=q*q*y0+2*q*u*by+u*u*y1,nx=-(2*q*(by-y0)+2*u*(y1-by)),ny=2*q*(bx-x0)+2*u*(X-bx),nl=Math.sqrt(nx*nx+ny*ny)||1,w=Math.sin(i*1.3+fr*.55+tx)*7*s*Math.sin(Math.min(1,i/N)*PI);pts.push([px+nx/nl*w,py+ny/nl*w])}
 g.save();g.lineCap='round';g.lineJoin='round';
 g.globalAlpha=a*.35;g.globalCompositeOperation='lighter';g.strokeStyle='#7a3fd0';
 for(i=1;i<=N;i++){g.lineWidth=(34-i*1.4)*s;g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.globalCompositeOperation='source-over';g.globalAlpha=a*.97;g.strokeStyle='#07030d';
 for(i=1;i<=N;i++){g.lineWidth=(19-i*.75)*s;g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
 g.globalCompositeOperation='lighter';g.globalAlpha=a*.7;g.strokeStyle='#b88cf0';
 for(i=1;i<=N;i++){g.lineWidth=(2.6-i*.1)*s;g.beginPath();g.moveTo(pts[i-1][0]+Math.sin(i+fr)*s,pts[i-1][1]);g.lineTo(pts[i][0]+Math.sin(i+1+fr)*s,pts[i][1]);g.stroke()}
 g.globalCompositeOperation='source-over';
 for(i=2;i<N;i+=3){var m=pts[i];blob(m[0]+(hs(i+tx)-.5)*12*s,m[1]+(hs(i*3+tx)-.5)*10*s,(15+hs(i)*9)*s,'30,10,56',.5*a)}
 if(p>.45){var ik=Math.min(1,(p-.45)/.4),ia=1-Math.max(0,(p-.75)/.25);g.globalAlpha=ia;blob(X,y1,60*s*ik,'18,6,34',.8);
  g.fillStyle='#07030d';g.strokeStyle='#c9a0ff';g.lineWidth=1.6*s;
  for(i=0;i<11;i++){var an=i/11*TAU+tx,rl=(24+hs(i+tx)*34)*s*ik;g.beginPath();g.moveTo(X+Math.cos(an-.14)*8*s,y1+Math.sin(an-.14)*8*s*.8);g.lineTo(X+Math.cos(an)*rl,y1+Math.sin(an)*rl*.8);g.lineTo(X+Math.cos(an+.14)*8*s,y1+Math.sin(an+.14)*8*s*.8);g.closePath();g.fill();g.stroke()}
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(176,112,255,'+ia+')';g.lineWidth=3*s;g.beginPath();g.ellipse(X,y1+22*s,(16+80*ik)*s,(5+22*ik)*s,0,0,TAU);g.stroke();
  for(i=0;i<5;i++){var wu=(ik+i*.2)%1;g.globalAlpha=ia*(1-wu)*.8;g.fillStyle='#e0b8ff';g.beginPath();g.arc(X+(hs(i+tx)-.5)*40*s,y1-wu*70*s,(2.6-wu*1.6)*s,0,TAU);g.fill()}}
 g.restore()})}
function skelDraw(X,gy,dir,t,a,grow){
 var k=Math.min(1,grow),ph=t*.3,B='#5b4880',BD='#0c0614',HL='#c4a8f5',i;
 g.save();g.globalAlpha=a;
 g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(X,gy-1*s,24*s,6*s,0,0,TAU);g.fill();
 blob(X,gy-6*s,38*s,'20,6,40',.5*a);
 if(k<1){g.globalAlpha=a*(1-k);g.fillStyle='#1a1226';for(i=0;i<8;i++){g.fillRect(X+(hs(i+t)-.5)*50*s,gy-(hs(i+4)*40)*k*s-2*s,3*s,3*s)}g.globalAlpha=a;g.beginPath();g.rect(X-80*s,gy-170*s,160*s,170*s+2*s);g.clip()}
 g.translate(X,gy+(1-k)*80*s);g.scale(dir*s,s);g.lineCap='round';g.lineJoin='round';
 function bone(x1,y1,x2,y2,w){g.strokeStyle=BD;g.lineWidth=w+2.4;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=B;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=HL;g.globalAlpha=a*.7;g.lineWidth=w*.28;g.beginPath();g.moveTo(x1-.7,y1);g.lineTo(x2-.7,y2);g.stroke();g.globalAlpha=a}
 function joint(x,y,r){g.fillStyle=BD;g.beginPath();g.arc(x,y,r+1.2,0,TAU);g.fill();g.fillStyle='#7a66a8';g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
 var hip=[0,-36+Math.abs(Math.sin(ph))*1.6],sh=[1,-70+Math.abs(Math.sin(ph))*1.6];
 /* áo choàng rách phía sau lưng */
 g.fillStyle='rgba(20,8,36,.85)';g.beginPath();g.moveTo(-3,sh[1]+2);for(i=0;i<=5;i++)g.lineTo(-8-i*5,sh[1]+4+i*8+Math.sin(t*.2+i)*3);g.lineTo(-4,hip[1]+6);g.closePath();g.fill();
 /* chân: đùi–gối–cẳng–bàn chân, bước đi */
 [[1,0],[-1,PI]].forEach(function(o){var sg=o[0],a1=Math.sin(ph+o[1])*.55,kx=hip[0]+Math.sin(a1)*18,ky=hip[1]+Math.cos(a1)*18,a2=a1*.3+(Math.sin(ph+o[1]+1.2)>0?.55:.05),fx2=kx+Math.sin(a2)*18*-sg*0+Math.sin(a2)*18,fy=Math.min(0,ky+Math.cos(a2)*18);
  bone(hip[0],hip[1],kx,ky,4.4);bone(kx,ky,fx2,fy,3.8);joint(kx,ky,3);g.strokeStyle=BD;g.lineWidth=3.6;g.beginPath();g.moveTo(fx2,fy);g.lineTo(fx2+7,fy);g.stroke();g.strokeStyle=B;g.lineWidth=2;g.stroke()});
 /* xương chậu, cột sống, khung sườn */
 g.fillStyle=BD;g.beginPath();g.moveTo(-8,hip[1]-2);g.lineTo(8,hip[1]-2);g.lineTo(5,hip[1]+6);g.lineTo(-5,hip[1]+6);g.closePath();g.fill();g.fillStyle=B;g.beginPath();g.moveTo(-6.5,hip[1]-1);g.lineTo(6.5,hip[1]-1);g.lineTo(4,hip[1]+4);g.lineTo(-4,hip[1]+4);g.closePath();g.fill();
 for(i=0;i<8;i++){joint(hip[0]+(sh[0]-hip[0])*i/7,hip[1]+(sh[1]-hip[1])*i/7,2.2)}
 for(i=0;i<5;i++){var ry=sh[1]+3+i*5.4,rw=11-i*1.5;[1,-1].forEach(function(sg){g.strokeStyle=BD;g.lineWidth=4.2;g.beginPath();g.moveTo(sh[0],ry);g.quadraticCurveTo(sh[0]+sg*rw*1.1,ry-3,sh[0]+sg*rw,ry+4);g.stroke();g.strokeStyle=B;g.lineWidth=2.4;g.stroke();g.strokeStyle=HL;g.globalAlpha=a*.6;g.lineWidth=.8;g.stroke();g.globalAlpha=a})}
 /* tay sau: buông; tay trước: cầm kiếm gỉ, vung */
 var sw=-1.15+Math.sin(t*.22)*.95,bsx=sh[0]-9,bsy=sh[1]+4;bone(bsx,bsy,bsx-6,bsy+13,3.4);bone(bsx-6,bsy+13,bsx-4+Math.sin(ph)*3,bsy+26,3);joint(bsx-6,bsy+13,2.4);
 var fsx=sh[0]+9,fsy=sh[1]+3,elx=fsx+10,ely=fsy+9,hnx=elx+Math.cos(sw+.6)*13,hny=ely+Math.sin(sw+.6)*13;bone(fsx,fsy,elx,ely,3.4);bone(elx,ely,hnx,hny,3);joint(elx,ely,2.4);joint(fsx,fsy,2.6);
 var tx=hnx+Math.cos(sw)*40,ty=hny+Math.sin(sw)*40;g.strokeStyle='#0c0614';g.lineWidth=7;g.beginPath();g.moveTo(hnx,hny);g.lineTo(tx,ty);g.stroke();g.strokeStyle='#6a5a82';g.lineWidth=4;g.stroke();
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(190,120,255,.8)';g.lineWidth=1.8;g.beginPath();g.moveTo(hnx,hny);g.lineTo(tx,ty);g.stroke();g.restore();
 g.strokeStyle=BD;g.lineWidth=3.2;g.beginPath();g.moveTo(hnx-Math.sin(sw)*6,hny+Math.cos(sw)*6);g.lineTo(hnx+Math.sin(sw)*6,hny-Math.cos(sw)*6);g.stroke();
 /* cổ + đầu lâu: xương gò má, hàm, răng, hốc mắt phát sáng, lửa hồn */
 for(i=0;i<3;i++)joint(sh[0]+1,sh[1]-3-i*3.2,1.9);
 var hx=sh[0]+3,hy=sh[1]-19;
 g.fillStyle=BD;g.beginPath();g.ellipse(hx,hy,10.6,10.2,0,0,TAU);g.fill();var sg2=g.createRadialGradient(hx+2,hy-3,2,hx,hy,10);sg2.addColorStop(0,'#8a76b8');sg2.addColorStop(1,'#43345f');g.fillStyle=sg2;g.beginPath();g.ellipse(hx,hy,9.4,9,0,0,TAU);g.fill();
 g.fillStyle=BD;g.beginPath();g.moveTo(hx-6,hy+6);g.lineTo(hx+6,hy+6);g.lineTo(hx+4.5,hy+13+Math.abs(Math.sin(t*.3))*1.6);g.lineTo(hx-4.5,hy+13+Math.abs(Math.sin(t*.3))*1.6);g.closePath();g.fill();g.fillStyle='#6a5a90';g.fillRect(hx-3.6,hy+7,7.2,4);
 g.strokeStyle=BD;g.lineWidth=1;for(i=-1;i<=1;i++){g.beginPath();g.moveTo(hx+i*2.4,hy+7);g.lineTo(hx+i*2.4,hy+11);g.stroke()}
 g.fillStyle='#000';g.beginPath();g.ellipse(hx-3.8,hy-1,2.9,3.4,0,0,TAU);g.ellipse(hx+3.8,hy-1,2.9,3.4,0,0,TAU);g.fill();g.beginPath();g.moveTo(hx,hy+2);g.lineTo(hx-1.6,hy+5.4);g.lineTo(hx+1.6,hy+5.4);g.fill();
 g.save();g.globalCompositeOperation='lighter';blob(hx-3.8,hy-1,8,'224,184,255',.95);blob(hx+3.8,hy-1,8,'224,184,255',.95);blob(hx,hy-6,24,'150,80,235',.25);
 for(i=0;i<3;i++){var fl=Math.sin(t*.35+i*2)*2.5;g.fillStyle='rgba('+(i?'255,80,150':'190,120,255')+',.85)';g.beginPath();g.moveTo(hx-5+i*5,hy-9);g.quadraticCurveTo(hx-8+i*5+fl,hy-17-i,hx-5+i*5+fl*.6,hy-22-i*2);g.quadraticCurveTo(hx-2+i*5,hy-15,hx-5+i*5,hy-9);g.fill()}
 g.restore();g.restore()}

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
  if(j===0){var cx=near?near.x:px+dd*140;angelSlash(cx,44);
   later(19,function(){es.forEach(function(e){if(e.hp>0&&Math.abs(e.x-cx)<S_.r)hit(e)});flash('#ffe27a',6);shake(4)});
   if(S_.heal)P.hp=Math.min(mx(),P.hp+mx()*S_.heal);return true}
  if(j===1){var far=es.filter(function(e){return(e.x-px)*dd>-30&&Math.abs(e.x-px)<720}).sort(function(a,b){return Math.abs(b.x-px)-Math.abs(a.x-px)})[0],
    len=Math.max(260,far?Math.abs(far.x-px)+60:520);
   for(var k=0;k<2;k++)(function(k){dragonFx(px,dd,len,30+k*3,k);
    es.forEach(function(e){var dx=(e.x-px)*dd;if(dx>-40&&dx<len){later(Math.round(Math.max(0,dx)/len*24*(k?1.1:1)),function(){if(e.hp>0){hit(e,.5);if(!lg)ring2(e.x)}})}})})(k);
   flash('#ffe27a',4);shake(3);return true}
  if(j===2){var cx2=n0?es.reduce(function(a,e){return a+e.x},0)/n0:px+dd*200;riftFx(cx2,130);flash('#ffe27a',8);shake(4);
   var M=lg?16:28,k0=.8*Math.max(1,n0)/M;
   for(i=0;i<M;i++)(function(i){later(14+Math.round(i*96/M),function(){var A=alive();if(!A.length)return;var tg=A[Math.floor(R()*A.length)],tx=tg.x+rnd(-24,24);
     meteorFx(tx,24,rnd(110,190),Math.max(46*s,GY-430*s),rnd(.8,1.5));later(17,function(){if(tg.hp>0)hit(tg,k0)})})})(i);
   return true}
 }else{
  if(j===0){for(var w=0;w<18;w++)(function(w){later(w*10,function(){var A=alive().filter(function(e){return Math.abs(e.x-px)<S_.r});
    A.slice(0,lg?3:5).forEach(function(e){handFx(e.x+rnd(-30,30),46,rnd(.6,1.12))});A.forEach(function(e){hit(e,1/18)});if(w===0){shake(2)}})})(w);
   if(S_.heal)later(170,function(){P.hp=Math.min(mx(),P.hp+mx()*S_.heal)});return true}
  if(j===1){wraithsFx(px,dd,190);var T0=fr;
   for(var q=0;q<15;q++)(function(q){later(q*12,function(){var tf=fr;alive().forEach(function(e){var c=0;for(var i2=0;i2<6;i2++)if(Math.abs(px+wraithX(i2,tf,dd)-e.x)<70)c++;if(c)hit(e,1.3/15*Math.min(3,c))})})})(q);return true}
  if(j===2){var cx3=n0?es.reduce(function(a,e){return a+e.x},0)/n0:px+dd*200,HY=300;holeFx(cx3,120,HY);shake(4);
   var nb=lg?10:16,kb=.8*Math.max(1,n0)/nb;
   for(i=0;i<nb;i++)(function(i){later(14+Math.round(i*70/nb),function(){var A=alive().filter(function(e){return Math.abs(e.x-cx3)<760});if(!A.length)return;var tg=A[Math.floor(R()*A.length)];
     beamFx(cx3,tg.x,18,HY);hit(tg,kb);if(tg.hp<=0)summon(tg.x,dd,hit)})})(i);return true}
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
