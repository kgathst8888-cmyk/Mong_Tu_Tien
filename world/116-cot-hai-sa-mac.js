/* ===== 💀 CỐT HẢI SA MẠC (world/116-cot-hai-sa-mac.js · Fix361) =====
 * Phụ bản Lv100: vào bằng "Nhà Số 4" (TT3.houses[3]) của Làng Tân Thủ 3 (đổi tên thành Cốt Hải Sa Mạc, mở khoá riêng nhà này).
 * Dùng chỉ số quái/rơi đồ của map Nhân Giới số 4. Cơ chế:
 *  - Bão cát theo chu kỳ: yên 12–16 giây → báo trước 3 giây → bão 8 giây. Khi bão: tầm nhìn bị che (lớp phủ cát riêng, chỉ sáng quanh nhân vật),
 *    nhân vật mất 0.6% máu tối đa mỗi giây (không chết vì cát), quái bị chậm 50%.
 *  - Gai Cát: vòng cảnh báo nâu rồi gai xương trồi lên; trong vòng mất 12% máu tối đa (không chết), quái trong vòng mất 4%. Trong bão gai ra dày hơn.
 *  - Boss Sử Thi = Cốt Long Vương: mỗi ~14 giây chui xuống cát 4 giây (bất tử, không đánh được, ẩn hình), cuối đợt trồi lên cạnh nhân vật
 *    kèm 2 vòng Gai Cát cỡ lớn (20% máu tối đa). Luôn gọi 1 Gai Cát nhắm nhân vật mỗi 7 giây.
 * Độ khó: quái ×2.0 máu ×1.6 sát thương, Tinh Anh ×1.2/×1.1, Boss ×2.6 máu ×1.5 sát thương. Phần thưởng giữ theo map gốc.
 * Phụ thuộc: world/114a-phu-ban-core.js (PBC), window.TT3 (world/102). Tắt: bỏ <script> 116 trong index.html. */
(function(){
'use strict';
if(!window.PBC)return;
var rnd=PBC.rnd,S={init:0,ph:0,until:0,dot:0,shown:0},nextSpk=0,nextBoss=0;

/* ---------- hình boss: Cốt Long Vương (canvas 256x320, quay mặt phải) ---------- */
function paintBoss(cv,e,t){
  var c=cv.getContext('2d'),B='#e9dfc4',B2='#a99a78',O='#2e2314',i,q,pu=.5+.5*Math.sin(t*.1);
  c.clearRect(0,0,256,320);c.lineJoin='round';c.lineCap='round';
  function bone(w,col){c.strokeStyle=col||B;c.lineWidth=w}
  /* cánh xương */
  c.save();
  var wing=[[24,64],[48,36],[84,26],[112,40]];
  q=c.createLinearGradient(30,40,120,160);q.addColorStop(0,'rgba(60,40,20,.55)');q.addColorStop(1,'rgba(30,20,10,.15)');
  c.fillStyle=q;c.beginPath();c.moveTo(112,152);wing.forEach(function(p){c.lineTo(p[0],p[1])});c.closePath();c.fill();
  bone(5,B2);wing.forEach(function(p){c.beginPath();c.moveTo(112,152);c.lineTo(p[0],p[1]);c.stroke()});
  bone(3,B);c.beginPath();c.moveTo(24,64);c.lineTo(48,36);c.lineTo(84,26);c.lineTo(112,40);c.stroke();
  c.restore();
  /* đuôi + cột sống */
  bone(9,B2);c.beginPath();c.moveTo(18,296);c.bezierCurveTo(50,270,70,230,100,206);c.stroke();
  bone(6,B);c.beginPath();c.moveTo(18,296);c.bezierCurveTo(50,270,70,230,100,206);c.stroke();
  for(i=0;i<9;i++){var u=i/9,vx=18+u*80+Math.sin(u*3)*4,vy=296-u*88-Math.sin(u*3)*6;c.fillStyle=B;c.strokeStyle=O;c.lineWidth=1.5;c.beginPath();c.ellipse(vx,vy,5.5-u*1.5,4,-.6,0,6.283);c.fill();c.stroke()}
  /* lồng ngực + lửa ma */
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(112,196,2,112,196,50);q.addColorStop(0,'rgba(255,190,70,'+(.55+.25*pu)+')');q.addColorStop(1,'rgba(255,120,20,0)');
  c.fillStyle=q;c.beginPath();c.arc(112,196,50,0,6.283);c.fill();c.restore();
  for(i=0;i<6;i++){
    var rx=82+i*7,rh=44-Math.abs(i-2.4)*4;
    c.strokeStyle=O;c.lineWidth=7;c.beginPath();c.moveTo(rx,158);c.bezierCurveTo(rx-30,170+i*2,rx-28,208+i*2,rx+10,226-i*2);c.stroke();
    c.strokeStyle=B;c.lineWidth=4.5;c.beginPath();c.moveTo(rx,158);c.bezierCurveTo(rx-30,170+i*2,rx-28,208+i*2,rx+10,226-i*2);c.stroke();
  }
  bone(7,O);c.beginPath();c.moveTo(100,206);c.bezierCurveTo(112,176,126,150,140,128);c.stroke();
  /* cổ */
  bone(12,O);c.beginPath();c.moveTo(120,170);c.bezierCurveTo(130,130,150,106,170,86);c.stroke();
  bone(8,B);c.beginPath();c.moveTo(120,170);c.bezierCurveTo(130,130,150,106,170,86);c.stroke();
  for(i=0;i<7;i++){var uu=i/7,nx=120+(170-120)*uu+Math.sin(uu*3.1)*-6,ny=170+(86-170)*uu;c.fillStyle=B2;c.strokeStyle=O;c.lineWidth=1.4;c.beginPath();c.ellipse(nx,ny,6,4.5,-.9,0,6.283);c.fill();c.stroke()}
  /* chân trước */
  bone(9,O);c.beginPath();c.moveTo(106,214);c.lineTo(118,262);c.lineTo(134,292);c.stroke();
  bone(6,B);c.beginPath();c.moveTo(106,214);c.lineTo(118,262);c.lineTo(134,292);c.stroke();
  c.fillStyle=B;c.strokeStyle=O;c.lineWidth=1.5;
  for(i=0;i<3;i++){c.beginPath();c.moveTo(130+i*7,292);c.lineTo(138+i*7,306);c.lineTo(142+i*7,290);c.closePath();c.fill();c.stroke()}
  /* đầu: sọ rồng quay phải, hàm mở */
  c.fillStyle=B;c.strokeStyle=O;c.lineWidth=2.5;
  c.beginPath();c.moveTo(150,72);c.bezierCurveTo(158,50,194,48,208,64);c.lineTo(244,78);c.lineTo(240,88);c.lineTo(204,92);c.bezierCurveTo(190,100,160,100,150,72);c.closePath();c.fill();c.stroke();
  c.fillStyle=B2;c.beginPath();c.moveTo(176,96);c.lineTo(236,96);c.lineTo(246,122);c.lineTo(208,112);c.lineTo(180,108);c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff7e0';c.strokeStyle=O;c.lineWidth=1.2;
  for(i=0;i<6;i++){c.beginPath();c.moveTo(206+i*6,90);c.lineTo(209+i*6,102);c.lineTo(212+i*6,90);c.closePath();c.fill();c.stroke()}
  for(i=0;i<4;i++){c.beginPath();c.moveTo(210+i*8,98);c.lineTo(213+i*8,88);c.lineTo(216+i*8,98);c.closePath();c.fill();c.stroke()}
  /* sừng */
  bone(7,O);c.beginPath();c.moveTo(162,58);c.quadraticCurveTo(144,40,134,12);c.stroke();c.beginPath();c.moveTo(174,52);c.quadraticCurveTo(168,32,170,8);c.stroke();
  bone(4.5,B);c.beginPath();c.moveTo(162,58);c.quadraticCurveTo(144,40,134,12);c.stroke();c.beginPath();c.moveTo(174,52);c.quadraticCurveTo(168,32,170,8);c.stroke();
  /* mắt lửa */
  c.fillStyle='#1a1008';c.beginPath();c.ellipse(186,68,9,7,-.2,0,6.283);c.fill();
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(186,68,1,186,68,10);q.addColorStop(0,'#fff6c0');q.addColorStop(1,'rgba(255,150,30,.1)');
  c.fillStyle=q;c.beginPath();c.arc(186,68,5+pu*2,0,6.283);c.fill();c.restore();
  /* cát chân */
  c.fillStyle='rgba(196,150,86,.85)';
  c.beginPath();c.ellipse(70,312,70,12,0,0,6.283);c.fill();c.beginPath();c.ellipse(170,314,88,10,0,0,6.283);c.fill();
}

/* ---------- cấu hình phụ bản ---------- */
var api=PBC.make({
  id:'cothai',label:'💀 Cốt Hải Sa Mạc',base:4,req:100,
  names:{gob:'Cốt Binh',wolf:'Sa Lang',scorp:'Bọ Cạp Hộ Mộ',arch:'Cốt Cung Thủ',mage:'Cốt Pháp Sư',ogre:'Cốt Tướng',golem:'Cốt Long Vương'},
  diff:{hp:2.0,df:1.6,eHp:1.2,eDf:1.1,bHp:2.6,bDf:1.5},
  boss:{w:256,h:320,key:function(e){return Math.floor(PBC.tick()/(PBC.lite()?24:12))+''},paint:paintBoss},
  onEnter:function(){S.init=0;S.shown=0;nextSpk=PBC.tick()+120;nextBoss=0},
  onLeave:function(){S.init=0;S.shown=0},

  step:function(a){
    var t=a.tick(),i,e,k,o,ctx,x,y;
    if(!S.init){S.init=1;S.ph=0;S.until=t+720;S.dot=t+60}
    if(t>=S.until){
      if(S.ph===0){S.ph=1;S.until=t+180;a.say('🌪 Bão cát sắp ập tới!','#ffd9a0')}
      else if(S.ph===1){S.ph=2;S.until=t+480;S.dot=t+60;a.say('🌪 BÃO CÁT! Tầm nhìn bị che, quái chậm lại','#ffcf8a')}
      else{S.ph=0;S.until=t+720+Math.random()*240}
    }
    /* mất máu vì cát + làm chậm quái */
    if(S.ph===2&&t>=S.dot){a.hurtP(.006);S.dot=t+60}
    for(i=0;i<E.length;i++){
      e=E[i];if(!e||e.k==='pal'||typeof e.x!=='number')continue;
      if(S.ph===2&&e._lx!=null){var dx=e.x-e._lx;if(dx)e.x=e._lx+dx*.5}
      e._lx=e.x;
    }
    /* gai cát */
    if(t>=nextSpk&&a.hazards.length<6){
      var tx=(E.length&&Math.random()<.45&&E[(Math.random()*E.length)|0])||null;
      a.addHazard((tx&&typeof tx.x==='number'?tx.x:P.x)+(Math.random()-.5)*60,{kind:'spk',R:50,warn:62,pct:.12,mPct:.04,life:22});
      nextSpk=t+(a.lite()?1.3:1)*(S.ph===2?110:190)+Math.random()*100;
    }
    /* boss chui cát */
    for(i=0;i<E.length;i++){
      e=E[i];if(!e||e.b!==3||e.k==='pal'||!(e.max>0))continue;
      if(!e.burT){e.burT=t+840;e.bur=0;nextBoss=t+300}
      if(e.bur!==1&&t>=e.burT){e.bur=1;e.burEnd=t+240;e.bw=0;a.say('💀 Cốt Long Vương chui xuống cát!','#ffcf8a')}
      if(e.bur===1){
        if(e._lh>e.hp)e.hp=e._lh;
        if(t>=e.burEnd-70&&!e.bw){e.bw=1;e.tx=P.x;
          a.addHazard(e.tx,{kind:'spk',R:70,warn:70,pct:.2,mPct:0,life:26});a.addHazard(e.tx+100,{kind:'spk',R:60,warn:70,pct:.2,mPct:0,life:26})}
        if(t>=e.burEnd){e.bur=0;e.bw=0;e.burT=t+840+Math.random()*240;
          e.x=Math.max(40,Math.min(a.wmax()-40,(e.tx==null?P.x:e.tx)+(Math.random()<.5?-1:1)*70));
          a.say('💥 Cốt Long Vương trồi lên!','#ffb070')}
      }else if(t>=nextBoss){a.addHazard(P.x,{kind:'spk',R:52,warn:62,pct:.14,mPct:0,life:22});nextBoss=t+420}
    }
    /* lớp phủ bão cát (Fix364: vẽ ở nửa độ phân giải, cách 1 khung mới vẽ lại) */
    if(S.ph===0){S.shown=0;a.ovShow(false)}
    else if((t&1)===0||!S.shown){
      o=a.ov();ctx=o.ctx;S.shown=1;
      k=S.ph===1?Math.max(0,(t-(S.until-180))/180)*.5:1;
      a.ovShow(true);
      var w=o.w,h=o.h,hx=P.x*s,hy=GY-30*s;
      ctx.clearRect(0,0,w,h);
      var q=ctx.createRadialGradient(hx,hy,90*s,hx,hy,Math.max(w,h)*.6);
      q.addColorStop(0,'rgba(150,108,60,0)');q.addColorStop(.35,'rgba(150,108,60,'+(.5*k+.2*k*.5)+')');q.addColorStop(1,'rgba(110,76,40,'+(.86*k+.2*k*.3)+')');
      ctx.fillStyle=q;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(235,205,150,'+(.55*k)+')';ctx.lineWidth=Math.max(1,1.4*s);
      var n=a.lite()?20:48;ctx.beginPath();
      for(i=0;i<n;i++){
        x=((rnd(i)*w*1.5+t*(20+rnd(i+5)*16))%(w*1.3))-w*.15;y=rnd(i+9)*h;
        var L=(26+rnd(i+13)*46)*s;ctx.moveTo(x,y);ctx.lineTo(x+L,y+L*.18);
      }
      ctx.stroke();
    }
  },

  /* ---------- nền sa mạc xương ---------- */
  bgS:function(gy,a,g){
    var i,q;
    g.save();
    g.fillStyle='rgba(88,40,10,.34)';g.fillRect(0,0,W,gy);
    q=g.createRadialGradient(W*.25,gy*.3,4,W*.25,gy*.3,gy*.55);q.addColorStop(0,'rgba(255,200,120,.55)');q.addColorStop(1,'rgba(255,140,60,0)');
    g.fillStyle=q;g.beginPath();g.arc(W*.25,gy*.3,gy*.55,0,6.283);g.fill();
    g.fillStyle='rgba(255,226,170,.85)';g.beginPath();g.arc(W*.25,gy*.3,gy*.06,0,6.283);g.fill();
    g.fillStyle='rgba(120,70,30,.45)';
    for(var r=0;r<2;r++){g.beginPath();g.moveTo(0,gy);for(i=0;i<=20;i++){var xx=W*i/20;g.lineTo(xx,gy-(18+r*16)*s-Math.sin(i*.9+r*2)*(12+r*8)*s)}g.lineTo(W,gy);g.closePath();g.fill()}
    g.strokeStyle='rgba(235,224,196,.38)';g.lineCap='round';
    [[.18,1],[.52,1.35],[.86,.9]].forEach(function(p){
      var bx=W*p[0],sz=p[1]*46*s;g.lineWidth=7*s*p[1];
      for(var j=-2;j<=2;j++){g.beginPath();g.moveTo(bx+j*sz*.28,gy);g.quadraticCurveTo(bx+j*sz*.5,gy-sz*1.5,bx+j*sz*.1,gy-sz*.2*Math.abs(j)-sz*.9);g.stroke()}
    });
    q=g.createLinearGradient(0,gy,0,H);q.addColorStop(0,'rgba(196,150,86,.30)');q.addColorStop(1,'rgba(120,80,40,.34)');
    g.fillStyle=q;g.fillRect(0,gy,W,H-gy);
    g.restore();
  },

  drawHazard:function(h,age,gy,a){
    var x=h.x*s,R=h.R*s,t=a.tick(),i;
    g.save();
    if(age<h.warn){
      var u=age/h.warn,pu=.5+.5*Math.sin(t*(.22+u*.4));
      var q=g.createRadialGradient(x,gy,R*.1,x,gy,R*1.1);q.addColorStop(0,'rgba(190,120,50,'+(.2+.32*u)+')');q.addColorStop(1,'rgba(150,90,40,0)');
      g.fillStyle=q;g.beginPath();g.ellipse(x,gy,R*1.1,R*.32,0,0,6.283);g.fill();
      g.strokeStyle='rgba(245,205,140,'+(.45+.45*pu)+')';g.lineWidth=2.4*s;g.beginPath();g.ellipse(x,gy,R,R*.28,0,0,6.283);g.stroke();
      g.beginPath();g.ellipse(x,gy,R*(1-u),R*.28*(1-u),0,0,6.283);g.stroke();
    }else{
      var k=(age-h.warn)/h.life,hh=(h.R*1.9)*s*Math.min(1,k*3)*(1-Math.max(0,k-.6)*1.4);
      g.fillStyle='rgba(236,226,200,'+Math.max(0,1-k*.7)+')';g.strokeStyle='rgba(46,35,20,.8)';g.lineWidth=1.5*s;
      for(i=-3;i<=3;i++){
        var sx=x+i*R*.28,sh=hh*(1-Math.abs(i)*.14);
        g.beginPath();g.moveTo(sx-9*s,gy);g.lineTo(sx+(i*1.2)*s,gy-sh);g.lineTo(sx+9*s,gy);g.closePath();g.fill();g.stroke();
      }
      g.fillStyle='rgba(205,160,96,'+Math.max(0,.6-k*.5)+')';g.beginPath();g.ellipse(x,gy,R*(.8+k*.5),R*.22,0,0,6.283);g.fill();
    }
    g.restore();
  },

  /* boss chui cát: không vẽ sprite, chỉ gò cát + bụi */
  foeSkip:function(e){return e.b===3&&e.bur===1},
  foeAlt:function(e,m,a){
    var x=e.x*s,t=a.tick(),i;
    g.save();
    g.fillStyle='rgba(190,142,80,.95)';g.beginPath();g.ellipse(x,GY,64*s,20*s,0,0,6.283);g.fill();
    g.fillStyle='rgba(222,180,116,.9)';g.beginPath();g.ellipse(x,GY-6*s,42*s,13*s,0,0,6.283);g.fill();
    for(i=0;i<8;i++){var u=((t*.02+i*.17)%1);g.fillStyle='rgba(225,190,130,'+(.55*(1-u))+')';g.beginPath();g.arc(x+(rnd(i)-.5)*70*s,GY-u*60*s,(3+rnd(i+3)*3)*s,0,6.283);g.fill()}
    g.font=Math.max(9,Math.round(11*s))+'px sans-serif';g.textAlign='center';g.fillStyle='rgba(255,226,170,.9)';
    g.fillText('Cốt Long Vương · đang ẩn',x,GY-40*s);
    g.restore();
  }
});

/* ---------- gắn vào Nhà Số 1 của Làng Tân Thủ 3 ---------- */
/* Fix371: dùng Nhà Số 4 (TT3.houses[3]); houses[0] là Tuyết Ngục */
PBC.bindHouse(window.TT3,3,api,{l1:'Cốt Hải',l2:'Sa Mạc · Lv100',full:'Cốt Hải Sa Mạc',ch:'骨',col:'#b8864a'});
window.CHS={api:api,paintBoss:paintBoss,enter:api.enter,on:api.on};
})();
