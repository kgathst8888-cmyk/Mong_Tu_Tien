/* ===== ✨ HIỆU ỨNG KỸ NĂNG MỚI CHO MAP TREO (world/83-map-treo-fx-pro.js) — nạp sau world/82 =====
 * Đưa bộ hiệu ứng nâng cấp của Tiên Giới (world/82: trận bát quái, vệt đuôi, hạt theo hệ, trúng đòn) sang MAP TREO (bản đồ 2D chạy ngang, gồm cả map quái Tiên Giới của Tiên Nhân).
 * Chỉ bật khi đang ở Map Treo (AFKMAP.on()). Mọi bản đồ khác giữ nguyên hiệu ứng cũ. Không đổi sát thương/hồi chiêu — chỉ phần vẽ.
 * Cách móc (mỗi hệ 1 dòng gọi TGFX2.cast khi thi triển):
 *   • Kỹ năng môn phái (world/72): thay HẲN hiệu ứng cũ (ring/pillar/beam/slash/sparks tắt khi TGFX2.on()) + hiệu ứng trúng đòn qua TGFX2.hit.
 *   • Thần thông Ý Cảnh (world/49) · Pháp Bảo Bổn Mệnh (world/48) · Linh Căn (systems/18): hiệu ứng mới vẽ THÊM lên trên hiệu ứng gốc của từng hệ.
 * Góc nhìn ngang: nhân vật quay mặt trái/phải (P.d). Chiêu đánh vào điểm (aoe, trói, tụ lực...) tự dời tâm tới mục tiêu gần nhất.
 * Chỉnh: TGFX2_CF.enable=false để tắt · TGFX2_CF.scope: 'treo' (mặc định, chỉ Map Treo) | 'tien' (thêm Tiên Nhân ở mọi bản đồ 2D) | 'all' (mọi bản đồ 2D) · TGFX2_CF.maxFx (giới hạn số hiệu ứng, mặc định 70). */
(function(){
'use strict';
if(typeof FX==='undefined'||typeof g==='undefined'||typeof P==='undefined'||!window.TGFX||!window.TG8SK||!window.TG8SK.R)return;
var CF=window.TGFX2_CF=window.TGFX2_CF||{};
if(CF.enable===undefined)CF.enable=true;if(!CF.scope)CF.scope='treo';if(!CF.maxFx)CF.maxFx=70;
var R=window.TG8SK.R,PI=Math.PI,TGX=window.TGFX;
var SCOL={umt:'#c070ff',hbd:'#7fe4ff',ptc:'#ff9a4a',tkt:'#9fc8ff',vdm:'#7cf08a',ngc:'#ffd890'};
var FBT=[{i:'🗡️',c:'#6fd0ff'},{i:'🏺',c:'#ffb84a'},{i:'🚩',c:'#b585ff'},{i:'🪓',c:'#ff8a3a'}];
var LCT=[{i:'☄️',c:'#ff6a3a'},{i:'👹',c:'#5adf7a'},{i:'🌧️',c:'#5ab8ff'},{i:'🗡️',c:'#ffd76a'},{i:'🐉',c:'#c89a5a'}];
/* chiêu đánh vào 1 điểm: khoảng cách D (đơn vị recipe) từ nhân vật tới tâm chiêu → dời tâm tới mục tiêu */
var AN={exec:190,aoe:190,burst:180,freeze:190,mark:200,charge:200,dotT:170,ycB:210,fb3:220,lc2:150};
var FOLLOW={shield:1,dotS:1};
function active(){
 if(!CF.enable)return false;
 try{if(typeof vil!=='undefined'&&vil)return false}catch(e){}
 try{if(window.AFKMAP&&AFKMAP.on())return true}catch(e){}
 if(CF.scope==='all')return true;
 try{if(CF.scope==='tien'&&window.CTHE&&CTHE.on())return true}catch(e){}
 return false}
function spawn(name,col,ic,sp,ma,tg){
 var mk=R[name];if(!mk||FX.length>CF.maxFx)return;
 var dd=P.d||1,A=dd>0?0:PI,F={f:{A:A,c:Math.cos(A),sn:Math.sin(A)},col:col,ic:ic||'✨',sp:sp||{},ma:!!ma},rec;
 try{rec=mk(F)}catch(e){return}
 var an=(name==='ycS'&&!ma)?0:(AN[name]||(window.MPTT_AN&&MPTT_AN[name])),dx=(an&&tg&&typeof tg.x==='number')?(tg.x-P.x)-an*dd:0,
  dly=0,L=rec.life,m=L,fol=!!FOLLOW[name];
 FX.push({x:P.x,l:m,m:m,fn:function(f,p,X,gy){
  var pp=p;if(pp>=1)return;var hx=fol?(P.x-cam)*s:X;
  g.globalCompositeOperation='source-over';
  if(rec.aura&&pp<.3){g.save();g.translate(hx,gy);g.scale(s,s);try{rec.aura(pp)}catch(e){}g.restore()}
  g.save();g.translate(hx+dx*s,gy);g.scale(s,s);try{(rec.main||rec.draw)(pp)}catch(e){}g.restore()}})}
function cast(kind,o){
 if(!active()||!o)return;
 var name,col,ic,sp,ma=false;
 if(kind==='s'){var s0=o.s||{},t=s0.t;name=t==='dot'?(s0.ult?'dotU':s0.where==='tgt'?'dotT':'dotS'):t;col=SCOL[o.id]||'#ffffff';ic=s0.i;sp=s0}
 else if(kind==='y'){name='yc'+(o.k==='L'||o.k==='B'||o.k==='M'?o.k:'S');ma=!!o.ma;col=ma?'#c070ff':'#ffd84a';ic=o.ic}
 else if(kind==='f'){var T=FBT[o.t];if(!T)return;name='fb'+o.t;col=T.c;ic=T.i}
 else{var Lc=LCT[o.r];if(!Lc)return;name='lc'+o.r;col=Lc.c;ic=Lc.i}
 if(!R[name])name='aoe';
 spawn(name,col,ic,sp,ma,o.tg)}
/* trúng đòn của kỹ năng môn phái */
function hit(e,n0){
 if(!active()||!e||FX.length>CF.maxFx+40)return;
 var cr=false,i;try{for(i=n0|0;i<DT.length;i++)if(DT[i]&&DT[i].k){cr=true;break}}catch(x){}
 var c0=TGX.cur(),ok=!!(c0&&fr-c0.fr<160),dly=ok?(TGX.DLY[c0.t]||0):0,life=cr?32:24,tot=life+dly,
  hh=(e.hh||100)*(typeof SZ!=='undefined'?SZ:1)*.8,
  it={x:e.x,y:0,z:0,h:hh,c:ok?c0.c:'#bff4ff',E:ok?c0.E:TGX.EL0,crit:cr,sl:false,gen:!ok,sd:((e.sn|0)+1)*3.7+fr%97,nf:1};
 FX.push({x:e.x,l:tot,m:tot,fn:function(f,p,X,gy){
  var q=p*tot-dly;if(q<0)return;var pp=q/life;if(pp>=1)return;
  g.globalCompositeOperation='source-over';g.save();g.translate(X,gy-hh*.5*s);g.scale(s,s);try{TGX.hitFx(it,pp)}catch(x){}g.restore()}})}
window.TGFX2={on:active,cast:cast,hit:hit,CF:CF};
})();
