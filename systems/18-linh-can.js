/* ===== LINH CĂN (tu tiên) =====
 * 5 linh căn: Hỏa / Mộc / Thủy / Kim / Thổ. Chọn 1 linh căn đang dùng.
 * - Passive: tăng sức mạnh thần thông (tiên thuật) cùng hệ + kỹ năng kèm theo.
 * - Kỹ năng kèm theo, mỗi cái luyện 15 tầng.
 * Dữ liệu lưu ở PS[cur].lc = {root:-1..4, lv:[5 số 1..15]} (tự lưu cùng PS).
 * Tiên thuật tầng 1..5 (nút bên phải) ứng với hệ: Hỏa, Mộc, Thủy, Kim, Thổ.
 */
(function(){
var MAXL=15;
var ROOTS=[
 {n:'Hỏa Linh Căn',el:'Hỏa',ic:'🔥',c:'#ff6a3a',sk:'Thiên Liệt Hỏa',si:'☄️',d:'Mưa cột lửa giáng xuống diệt địch, thiêu đốt kéo dài.'},
 {n:'Mộc Linh Căn',el:'Mộc',ic:'🌿',c:'#5adf7a',sk:'Triệu Hoá Ma Thần',si:'👹',d:'Triệu Ma Thần tự dùng 3 kỹ năng: Mộc Trảo, Địa Đằng Trói, Ma Thần Chấn. Tầng càng cao ma thần càng mạnh, tồn tại lâu.'},
 {n:'Thủy Linh Căn',el:'Thủy',ic:'💧',c:'#5ab8ff',sk:'Hô Phong Hoán Vũ',si:'🌧️',d:'Gọi mưa gió: đánh lùi, làm chậm địch, hồi máu và năng lượng cho bản thân.'},
 {n:'Kim Linh Căn',el:'Kim',ic:'🪙',c:'#ffd76a',sk:'Canh Kim Chỉ Lộ',si:'🗡️',d:'Hai đạo kim quang quét sạch lối đi, sau đó tăng sát thương trong thời gian ngắn.'},
 {n:'Thổ Linh Căn',el:'Thổ',ic:'⛰️',c:'#c89a5a',sk:'Địa Long Phiên Thần',si:'🐉',d:'Địa long trồi lên càn quét, làm choáng địch và phủ giáp đất giảm sát thương nhận.'}
];
var S={cd:0,cdMax:1,fires:[],cols:[],god:null,rain:null,blades:[],drag:[],kim:0,shield:0,shieldR:0,lastHp:0,fx:[]};

var MAPTW=[3,1,2,0,4]; /* thứ tự linh căn của Tháp (Kim,Mộc,Thủy,Hỏa,Thổ) -> thứ tự ở đây (Hỏa,Mộc,Thủy,Kim,Thổ) */
function LC(){var p=PS[cur];if(!p.lc||!p.lc.lv||p.lc.lv.length<5)p.lc={root:-1,lv:[1,1,1,1,1]};var t=p.tw;p.lc.root=(t&&t.root>=0&&t.root<5)?MAPTW[t.root]:-1;return p.lc}
function L0(){var c=LC();return c.root<0?0:c.lv[c.root]}
function pow(){var c=LC();return c.root<0?1:1.2+.02*c.lv[c.root]}
/* hook: nhân sức mạnh tiên thuật cùng hệ (i = 0..4 = Hỏa,Mộc,Thủy,Kim,Thổ) */
window.lcMul=function(i){try{return LC().root===i?pow():1}catch(e){return 1}};

function foes(){var w=vw();return E.filter(function(e){return e.hp>0&&e.x>-30&&e.x<w+30})}
function hit(e,m,slow){SKF=1;try{dm(e,m*pow(),slow?1:0)}finally{SKF=0}}
function say(x,y,t,c){DT.push({x:x,y:y,s:t,c:c,l:70,g:1})}
function cdF(L){return Math.max(900,1500-40*L)}
function mpC(L){return 30+4*L}

/* kim: buff sát thương */
if(typeof dm=='function'){var _dm=dm;dm=function(e,m,sl){if(S.kim>0)m*=1.25+.01*L0();return _dm(e,m,sl)}}

function cast(){
  var c=LC();if(c.root<0)return;
  if(over||bo||vil||!started||P.pe||P.act||S.cd>0)return;
  var L=c.lv[c.root],mp=mpC(L);if(P.mp<mp)return;
  var near=foes().filter(function(e){return Math.abs(e.x-P.x)<640});if(!near.length)return;
  P.mp-=mp;S.cd=S.cdMax=cdF(L);
  var R_=ROOTS[c.root];an(18);P.ln=R_.sk;
  var root=c.root;
  P.pe={l:18,t:5,n:R_.sk,f:function(){fire(root,L)}};
  say(P.x,230,R_.si+' '+R_.sk+' · Tầng '+L,R_.c);
}
function fire(root,L){
  if(root==0){S.fires.push({t:240+12*L,L:L,k:0})}
  else if(root==1){S.god={x:P.x+110,t:1200+60*L,L:L,k:0,nx:30,at:0,ph:0,name:'',nc:'#5adf7a'}}
  else if(root==2){S.rain={t:480+18*L,L:L}}
  else if(root==3){S.kim=360+20*L;S.blades=[{x:P.x,d:1,L:L,h:[],t:0},{x:P.x,d:-1,L:L,h:[],t:0}]}
  else if(root==4){
    var f=foes(),r=f.filter(function(e){return e.x>P.x}).length,l=f.length-r;
    S.drag.push({x:P.x,d:r>=l?1:-1,L:L,h:[],t:0});
    S.shield=480+20*L;S.shieldR=Math.min(.7,.4+.01*L);
  }
}

/* ===== cập nhật mỗi khung ===== */
function stepAll(){
  if(!started)return;
  if(vil||over){S.fires=[];S.cols=[];S.god=null;S.rain=null;S.blades=[];S.drag=[];S.fx=[];return}
  if(S.cd>0)S.cd--;
  if(S.kim>0)S.kim--;
  var c=LC(),L=L0(),sf=foes(),i,e;
  /* thiêu đốt */
  E.forEach(function(e){if(e.lcB>0){e.lcB--;if(e.hp>0&&fr%40==0)hit(e,e.lcBm||.3)}});
  /* HỎA */
  S.fires.forEach(function(f){
    f.t--;if(f.t%18==0&&sf.length){var tg=sf[Math.floor(R()*sf.length)];S.cols.push({x:tg.x+(R()-.5)*60,t:0,l:30,L:f.L,done:0})}
  });
  S.fires=S.fires.filter(function(f){return f.t>0});
  S.cols.forEach(function(q){
    q.t++;
    if(q.t==16&&!q.done){q.done=1;var rad=90+q.L*3;
      foes().forEach(function(e){if(Math.abs(e.x-q.x)<rad){hit(e,1.4+.3*q.L);e.lcB=300;e.lcBm=.25+.03*q.L}});
      for(i=0;i<10;i++)PT.push({x:q.x,y:20,vx:(R()-.5)*5,vy:R()*4,l:28,c:'#ff9a3a'})}
  });
  S.cols=S.cols.filter(function(q){return q.t<q.l});
  /* MỘC: ma thần */
  var g_=S.god;
  if(g_){
    g_.t--;g_.ph++;if(g_.at>0)g_.at--;
    var tx=P.x+110+Math.sin(g_.ph*.03)*14;g_.x+=(tx-g_.x)*.08;
    g_.nx--;
    if(g_.nx<=0&&sf.length){
      g_.nx=Math.max(50,90-2*g_.L);g_.at=24;var k=g_.k%3;g_.k++;var Lg=g_.L;
      var near=sf.slice().sort(function(a,b){return Math.abs(a.x-g_.x)-Math.abs(b.x-g_.x)});
      if(k==0){g_.name='Mộc Trảo';g_.nc='#9fff9a';hit(near[0],3+.5*Lg);S.fx.push({k:'claw',x:near[0].x,t:0,l:20})}
      else if(k==1){g_.name='Địa Đằng Trói';g_.nc='#5adf7a';sf.forEach(function(e){if(Math.abs(e.x-g_.x)<280){hit(e,1+.2*Lg,1);e.cd=Math.max(e.cd||0,70)}});S.fx.push({k:'vine',x:g_.x,t:0,l:34})}
      else{g_.name='Ma Thần Chấn';g_.nc='#c8ff7a';sf.forEach(function(e){if(Math.abs(e.x-g_.x)<220)hit(e,2.5+.45*Lg)});P.hp=Math.min(mx(),P.hp+mx()*.02);S.fx.push({k:'quake',x:g_.x,t:0,l:30});shake_()}
      say(g_.x,210+20*Math.min(1,Lg/15),g_.name,g_.nc);
    }
    if(g_.t<=0)S.god=null;
  }
  /* THỦY */
  var rn=S.rain;
  if(rn){
    rn.t--;
    if(rn.t%30==0){
      sf.forEach(function(e){hit(e,.5+.12*rn.L,1);e.x+=(e.x>=P.x?1:-1)*18});
      P.hp=Math.min(mx(),P.hp+mx()*(.012+.001*rn.L));P.mp=Math.min(mm(),P.mp+mm()*.02);
    }
    if(rn.t<=0)S.rain=null;
  }
  /* KIM */
  S.blades.forEach(function(b){
    b.t++;b.x+=b.d*34;
    foes().forEach(function(e){if(b.h.indexOf(e)<0&&Math.abs(e.x-b.x)<55){b.h.push(e);hit(e,4+.7*b.L);for(var j=0;j<6;j++)PT.push({x:e.x,y:50,vx:(R()-.5)*6,vy:R()*3,l:22,c:'#ffe27a'})}});
  });
  S.blades=S.blades.filter(function(b){return b.x>-100&&b.x<vw()+100&&b.t<80});
  /* THỔ */
  S.drag.forEach(function(d){
    d.t++;d.x+=d.d*16;
    foes().forEach(function(e){if(d.h.indexOf(e)<0&&Math.abs(e.x-d.x)<70){d.h.push(e);hit(e,3+.55*d.L,1);e.cd=Math.max(e.cd||0,150)}});
    if(d.t%2==0)PT.push({x:d.x,y:8,vx:(R()-.5)*3,vy:R()*3,l:20,c:'#b8924f'});
  });
  S.drag=S.drag.filter(function(d){return d.x>-300&&d.x<vw()+300&&d.t<160});
  S.fx.forEach(function(f){f.t++});S.fx=S.fx.filter(function(f){return f.t<f.l});
  /* giáp đất */
  if(S.shield>0){S.shield--;if(P.hp<S.lastHp&&P.hp>0){P.hp=Math.min(mx(),P.hp+(S.lastHp-P.hp)*S.shieldR)}}
  S.lastHp=P.hp;
  /* tự động */
  if(auto&&S.cd<=0&&c.root>=0)cast();
}
function shake_(){try{if(typeof ZS!='undefined'&&ZS.shake)ZS.shake(4)}catch(e){}}

/* ===== vẽ ===== */
function X(x){return (x-cam)*s}
function drawAll(){
  if(!started||vil||over)return;
  var c=LC(),sc=s,gy=GY,i,j;
  var any=S.cols.length||S.god||S.rain||S.blades.length||S.drag.length||S.fx.length||S.shield>0||S.kim>0;
  if(!any)return;
  g.save();g.setTransform(DPR,0,0,DPR,0,0);
  /* cột lửa */
  S.cols.forEach(function(q){
    var p=q.t/q.l,x=X(q.x),w=(16+q.L)*sc*(p<.5?p*2:1-(p-.5)*1.2);
    var gr=g.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'rgba(255,120,40,0)');gr.addColorStop(.6,'rgba(255,150,50,.75)');gr.addColorStop(1,'rgba(255,240,150,.95)');
    g.fillStyle=gr;g.fillRect(x-w/2,0,w,gy);
    if(p>.5){var rr=(90+q.L*3)*sc*(p-.5)*2;g.strokeStyle='rgba(255,170,60,'+(1-p)+')';g.lineWidth=5*sc;g.beginPath();g.ellipse(x,gy,rr,rr*.28,0,0,6.283);g.stroke()}
  });
  /* mưa */
  if(S.rain){
    var Hh=typeof H!='undefined'?H:gy+120;g.fillStyle='rgba(40,90,160,.14)';g.fillRect(0,0,W,Hh);
    g.strokeStyle='rgba(170,220,255,.55)';g.lineWidth=1.4;g.beginPath();
    for(i=0;i<70;i++){var rx=((i*97+fr*(6+i%5))%(W+80))-40,ry=(i*53+fr*18)%Hh;g.moveTo(rx,ry);g.lineTo(rx-8,ry+18)}
    g.stroke();
    g.strokeStyle='rgba(220,245,255,.35)';g.lineWidth=2;g.beginPath();
    for(i=0;i<6;i++){var wy=gy-30*sc-i*26*sc,wx=((fr*14+i*160)%(W+200))-100;g.moveTo(wx,wy);g.quadraticCurveTo(wx+50,wy-8,wx+100,wy)}
    g.stroke();
  }
  /* kim quang */
  S.blades.forEach(function(b){
    var x=X(b.x),h=150*sc;
    var gr=g.createLinearGradient(x-b.d*160*sc,0,x,0);gr.addColorStop(0,'rgba(255,215,106,0)');gr.addColorStop(1,'rgba(255,240,170,.8)');
    g.fillStyle=gr;g.fillRect(Math.min(x,x-b.d*160*sc),gy-h,160*sc,h);
    g.save();g.shadowColor='#ffe27a';g.shadowBlur=18;g.strokeStyle='#fff6c0';g.lineWidth=4*sc;
    g.beginPath();g.moveTo(x,gy-h);g.quadraticCurveTo(x+b.d*30*sc,gy-h/2,x,gy);g.stroke();g.restore();
  });
  /* địa long */
  S.drag.forEach(function(d){
    for(i=14;i>=0;i--){
      var px=X(d.x-d.d*i*34),arc=Math.abs(Math.sin(d.t*.25-i*.55)),py=gy-(8+arc*(70-i*2))*sc,r=(30-i*1.3)*sc;
      var gr=g.createRadialGradient(px,py-r*.3,2,px,py,r);gr.addColorStop(0,i==0?'#e0b878':'#c89a5a');gr.addColorStop(1,'#6a4a28');
      g.fillStyle=gr;g.beginPath();g.ellipse(px,py,r,r*.85,0,0,6.283);g.fill();
      if(i==0){
        g.fillStyle='#ffe27a';g.beginPath();g.arc(px+d.d*r*.35,py-r*.25,r*.16,0,6.283);g.fill();
        g.fillStyle='#8a5a2a';g.beginPath();g.moveTo(px-d.d*r*.2,py-r*.8);g.lineTo(px-d.d*r*.7,py-r*1.5);g.lineTo(px+d.d*r*.1,py-r*.8);g.fill();
      }
    }
  });
  /* hiệu ứng ma thần: vuốt / dây / chấn */
  S.fx.forEach(function(f){
    var p=f.t/f.l,x=X(f.x);
    if(f.k=='claw'){g.strokeStyle='rgba(180,255,150,'+(1-p)+')';g.lineWidth=4*sc;for(j=-1;j<=1;j++){g.beginPath();g.moveTo(x-30*sc+j*14*sc,gy-110*sc);g.lineTo(x+30*sc+j*14*sc,gy-10*sc);g.stroke()}}
    else if(f.k=='vine'){g.strokeStyle='rgba(90,223,122,'+(1-p)+')';g.lineWidth=5*sc;for(j=-3;j<=3;j++){var vx=x+j*45*sc;g.beginPath();g.moveTo(vx,gy);g.quadraticCurveTo(vx+14*sc,gy-40*sc*p*3,vx-6*sc,gy-70*sc*Math.min(1,p*2.5));g.stroke()}}
    else{var rr=220*sc*p;g.strokeStyle='rgba(200,255,120,'+(1-p)+')';g.lineWidth=6*sc;g.beginPath();g.ellipse(x,gy,rr,rr*.26,0,0,6.283);g.stroke()}
  });
  /* ma thần */
  if(S.god){
    var gd=S.god,k=(1+.06*gd.L)*sc,x=X(gd.x),bob=Math.sin(gd.ph*.08)*3*sc,arm=gd.at>0?Math.sin(gd.at/24*3.14)*40*k:0;
    g.save();g.translate(x,gy+bob);
    g.globalAlpha=Math.min(1,gd.t/40);
    var gl=g.createRadialGradient(0,-60*k,10,0,-60*k,110*k);gl.addColorStop(0,'rgba(120,255,140,.28)');gl.addColorStop(1,'rgba(120,255,140,0)');
    g.fillStyle=gl;g.fillRect(-110*k,-170*k,220*k,220*k);
    g.fillStyle='#14341e';g.fillRect(-22*k,-34*k,16*k,34*k);g.fillRect(6*k,-34*k,16*k,34*k);
    g.fillStyle='#1f4a2b';g.beginPath();g.ellipse(0,-62*k,34*k,38*k,0,0,6.283);g.fill();
    g.fillStyle='#2a6a3a';g.beginPath();g.ellipse(-30*k,-78*k-arm*.4,15*k,12*k,0,0,6.283);g.ellipse(30*k,-78*k-arm,15*k,12*k,0,0,6.283);g.fill();
    g.strokeStyle='#2a6a3a';g.lineWidth=11*k;g.lineCap='round';g.beginPath();g.moveTo(34*k,-76*k);g.lineTo(58*k,-56*k-arm);g.moveTo(-34*k,-76*k);g.lineTo(-58*k,-50*k);g.stroke();
    g.fillStyle='#1b3f27';g.beginPath();g.arc(0,-108*k,19*k,0,6.283);g.fill();
    g.fillStyle='#0d2214';g.beginPath();g.moveTo(-14*k,-120*k);g.lineTo(-26*k,-148*k);g.lineTo(-5*k,-124*k);g.moveTo(14*k,-120*k);g.lineTo(26*k,-148*k);g.lineTo(5*k,-124*k);g.fill();
    g.fillStyle='#c8ff7a';g.shadowColor='#c8ff7a';g.shadowBlur=10;g.beginPath();g.arc(-7*k,-110*k,3.4*k,0,6.283);g.arc(7*k,-110*k,3.4*k,0,6.283);g.fill();
    g.restore();
    g.fillStyle='#c8ff7a';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('Ma Thần · Tầng '+gd.L,x,gy-170*k);
  }
  /* giáp đất + kim buff quanh nhân vật */
  if(S.shield>0){
    var hx=X(P.x),a=Math.min(1,S.shield/40);
    g.strokeStyle='rgba(220,170,90,'+.7*a+')';g.lineWidth=4*sc;g.beginPath();g.ellipse(hx,gy-60*sc,46*sc,70*sc,0,0,6.283);g.stroke();
  }
  if(S.kim>0){
    var kx=X(P.x),ka=Math.min(1,S.kim/40);
    g.strokeStyle='rgba(255,226,122,'+.75*ka+')';g.lineWidth=3*sc;g.beginPath();g.ellipse(kx,gy-60*sc,40*sc,64*sc,0,0,6.283);g.stroke();
  }
  g.restore();
}

/* Giữ vị trí cuộn khi bảng (bag) được vẽ lại — tránh bị đẩy ngược lên đầu */
if(typeof ui=='function'){
  var _ui=ui,lastTab=-1;
  ui=function(){
    var b=document.getElementById('bag'),bx=b&&b.querySelector('.bx'),keep=(lastTab===tab),t1=bx?bx.scrollTop:0,t2=b?b.scrollTop:0;
    var r=_ui.apply(this,arguments);
    lastTab=tab;
    if(keep&&b){var nb=b.querySelector('.bx');if(nb&&t1)nb.scrollTop=t1;if(t2)b.scrollTop=t2}
    return r;
  };
}

/* ===== gắn vào vòng lặp ===== */
if(typeof step=='function'){var _st=step;step=function(){_st.apply(this,arguments);try{stepAll()}catch(e){console.warn('[linh can step]',e)}}}
if(typeof draw=='function'){var _dr=draw;draw=function(){_dr.apply(this,arguments);try{drawAll()}catch(e){console.warn('[linh can draw]',e)}}}

/* ===== nút kỹ năng ===== */
var btn=document.createElement('div');btn.id='lc-btn';btn.className='sb';btn.style.cssText='position:fixed;right:62px;top:calc(124px + env(safe-area-inset-top,0px));z-index:2;display:none';
btn.onpointerdown=function(e){e.stopPropagation();cast()};
document.body.appendChild(btn);
setInterval(function(){
  try{
    var c=LC(),ar=document.getElementById('arena-scene'),on=started&&!vil&&c.root>=0&&!(ar&&ar.classList.contains('on'));
    btn.style.display=on?'flex':'none';
    if(on){btn.textContent=ROOTS[c.root].si;btn.style.borderColor=ROOTS[c.root].c;btn.style.setProperty('--c',(S.cd/(S.cdMax||1))*360+'deg');btn.title=ROOTS[c.root].sk}
  }catch(e){}
},120);

/* ===== giao diện trong tab Tu Tiên ===== */
var UPC=function(L){return 800*L*L};
window.lcUp=function(i){
  var c=LC();if(c.root!==i)return;var L=c.lv[i];
  if(L>=MAXL){msg='Đã đạt tầng tối đa';ui();return}
  var cost=UPC(L);if(gold<cost){msg='Không đủ vàng ('+cost+'💰)';ui();return}
  gold-=cost;c.lv[i]=L+1;msg='🌟 '+ROOTS[i].sk+' lên tầng '+(L+1);ui();
};
function lcBody(){
  var c=LC(),t=PS[cur].tw||{},h='';
  if(c.root<0){
    var pc=0;try{pc=twPop(t.fg|0)}catch(e){}
    return '<div class="dt">🌟 <b>Linh Căn</b><br>Linh căn <b>không thể chọn tùy ý</b>. Cần <b>Viên Linh Căn</b>: hạ <b>Boss 10 (Tháp Chủ)</b> mỗi tầng của <b>Tháp Thí Luyện</b> (Thanh Vân Tiên Thôn) để nhận 1 Mảnh Linh Căn/tầng, đủ <b>9 mảnh</b> thì hợp thành Viên Linh Căn rồi dùng để chọn linh căn — <b>chỉ chọn 1 lần duy nhất, không đổi được</b>.<br><br>'+
      (t.pill?'✨ Bạn đã có <b>Viên Linh Căn</b>! Vào Tháp Thí Luyện (trong Làng) để dùng và chọn linh căn.':'🔷 Tiến độ mảnh: <b>'+pc+'/9</b>')+'</div>'+
      '<div class="dt" style="opacity:.6">'+ROOTS.map(function(r){return r.ic+' '+r.n+' · '+r.si+' '+r.sk}).join('<br>')+'</div>';
  }
  var i=c.root,r=ROOTS[i],L=c.lv[i],cost=L>=MAXL?0:UPC(L);
  h+='<div class="dt">🌟 <b>Linh Căn</b><br>Linh căn đã thức tỉnh từ Viên Linh Căn (cố định, không đổi). Tăng sức mạnh thần thông (tiên thuật) hệ <b>'+r.el+'</b> thêm <b>+'+Math.round((.2+.02*L)*100)+'%</b> (tối đa +50% ở tầng 15) và mở kỹ năng kèm theo: nút tròn cạnh cột tiên thuật, tự dùng khi bật AUTO. Tiên thuật tầng 1→5 lần lượt thuộc hệ Hỏa, Mộc, Thủy, Kim, Thổ.</div>';
  h+='<div class="dt" style="border:2px solid '+r.c+'"><b style="color:'+r.c+'">'+r.ic+' '+r.n+' · ĐÃ THỨC TỈNH</b><br>'+
    r.si+' <b>'+r.sk+'</b> · Tầng '+L+'/'+MAXL+'<br><small>'+r.d+'<br>'+mpC(L)+' MP · hồi '+(cdF(L)/60).toFixed(0)+'s</small><br>'+
    (L<MAXL?'<button onclick="lcUp('+i+')">Luyện tầng '+(L+1)+' · '+cost+'💰</button>':'<span style="color:#ffe27a">✦ Đại thành</span>')+'</div>';
  h+='<div class="dt" style="opacity:.55">🔒 Các linh căn khác đã khóa vĩnh viễn với nhân vật này.</div>';
  return h;
}
var VIEW=0;
window.lcTab=function(v){VIEW=v;ui()};
/* Tab Tu Tiên: 2 mục riêng — ☯ Tu Vi (cũ) và 🌟 Linh Căn */
window.lcUI=function(){
  var nav='<div class="dt" style="display:flex;gap:6px">'+
    '<button style="flex:1;'+(VIEW==0?'border-color:#ffd76a;color:#ffd76a':'')+'" onclick="lcTab(0)">☯ Tu Vi</button>'+
    '<button style="flex:1;'+(VIEW==1?'border-color:#ffd76a;color:#ffd76a':'')+'" onclick="lcTab(1)">🌟 Linh Căn</button></div>';
  return nav+(VIEW==1?lcBody():ZC.ui());
};
})();
