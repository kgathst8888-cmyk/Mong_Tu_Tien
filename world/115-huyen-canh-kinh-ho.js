/* ===== 🪞 HUYỄN CẢNH KÍNH HỒ (world/115-huyen-canh-kinh-ho.js · Fix361) =====
 * Phụ bản Lv60: vào bằng "Nhà Bí Ẩn (1)" của Làng Tân Thủ 2 (đổi tên thành Huyễn Cảnh Kính Hồ). Dùng chỉ số quái/rơi đồ của map Nhân Giới số 3.
 * Cơ chế:
 *  - Quái "Ảnh" (~22% quái thường, tên có tiền tố "Ảnh", viền tím lung linh): đánh trúng thì phản lại 20% sát thương gây ra
 *    (tối đa 6% máu tối đa của nhân vật mỗi khung, không chết vì phản đòn).
 *  - Sóng Hồ: luôn hiện CẶP vòng cảnh báo đối xứng qua giữa map — vòng đặc sáng là thật, vòng nét đứt mờ là bóng giả. Đứng trong vòng thật
 *    khi nổ thì mất 10% máu tối đa (không chết vì sóng); quái trong vòng thật mất 4%.
 *  - Boss Sử Thi = Kính Hồ Tiên Tử, hai hình thể: Thực Thể (9 giây) ↔ Ảnh Thể (5 giây). Ở Ảnh Thể mọi sát thương gây lên boss bị hồi lại 85% và
 *    phản 25% về người đánh → nên ngừng đánh khi thấy chữ cảnh báo. Dưới 50% máu thêm "Gương Vỡ" (3 vòng, 1 thật).
 * Độ khó: quái ×1.8 máu ×1.45 sát thương, Boss ×2.4 máu ×1.35 sát thương (diff trong cfg bên dưới). Phần thưởng giữ theo map gốc.
 * Phụ thuộc: world/114a-phu-ban-core.js (PBC), window.TT2 (world/100). Tắt: bỏ <script> 115 trong index.html. */
(function(){
'use strict';
if(!window.PBC)return;
var rnd=PBC.rnd,nextRip=0,nextBoss=0,nextBroken=0;

/* ---------- hình boss: Kính Hồ Tiên Tử (canvas 256x320, quay mặt phải) ---------- */
var PAL=[
 {a:'130,235,235',c:'#7ff0f0',w:'#eaffff',g1:'#2f86a6',g2:'#0b2a58',hair:'#3fd6c8',skin:'#e9f6f8'},
 {a:'205,155,255',c:'#d6a6ff',w:'#fbefff',g1:'#8156c8',g2:'#251052',hair:'#c58cff',skin:'#efe4fa'}];
function body(c,K,t,dx,al){
  var i,q,sw=Math.sin(t*.05),pu=.5+.5*Math.sin(t*.12);
  c.save();c.translate(dx,0);c.globalAlpha=al;c.lineJoin='round';c.lineCap='round';
  /* tóc dài bay */
  c.strokeStyle=K.hair;c.lineWidth=7;
  for(i=0;i<5;i++){c.beginPath();c.moveTo(112+i*8,70);c.bezierCurveTo(86-i*10+sw*8,120,70-i*12-sw*10,190,76-i*8+sw*14,262+i*4);c.stroke()}
  /* vòng gương sau đầu */
  c.save();c.globalCompositeOperation='lighter';
  q=c.createRadialGradient(128,88,8,128,88,84);q.addColorStop(0,'rgba('+K.a+',.40)');q.addColorStop(1,'rgba('+K.a+',0)');
  c.fillStyle=q;c.beginPath();c.arc(128,88,84,0,6.283);c.fill();c.restore();
  q=c.createLinearGradient(70,30,190,150);q.addColorStop(0,'#f4fbff');q.addColorStop(.5,'#9fc9de');q.addColorStop(1,'#e6f4fb');
  c.fillStyle=q;c.globalAlpha=al*.55;c.beginPath();c.arc(128,88,60,0,6.283);c.fill();c.globalAlpha=al;
  c.strokeStyle='rgba('+K.a+',.95)';c.lineWidth=4;c.beginPath();c.arc(128,88,60,0,6.283);c.stroke();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.5;
  c.beginPath();c.moveTo(90,52);c.lineTo(112,72);c.lineTo(104,100);c.stroke();c.beginPath();c.moveTo(168,60);c.lineTo(150,84);c.lineTo(160,112);c.stroke();
  /* váy nước */
  q=c.createLinearGradient(0,126,0,306);q.addColorStop(0,K.g1);q.addColorStop(1,K.g2);
  c.fillStyle=q;c.beginPath();c.moveTo(106,126);c.lineTo(150,126);c.quadraticCurveTo(190,210,230,300);
  for(i=0;i<10;i++)c.quadraticCurveTo(222-i*20.5,306+(i%2?-8:8),216-(i+1)*20.5+8,300);
  c.quadraticCurveTo(66,210,106,126);c.closePath();c.fill();
  c.strokeStyle='rgba('+K.a+',.7)';c.lineWidth=2;c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba('+K.a+',.28)';c.lineWidth=2;
  for(i=0;i<5;i++){c.beginPath();c.ellipse(128,170+i*30,26+i*18,6+i*2,0,0,6.283);c.stroke()}c.restore();
  /* thân trên + tay */
  c.fillStyle=K.skin;c.beginPath();c.moveTo(108,124);c.lineTo(148,124);c.lineTo(142,172);c.lineTo(114,172);c.closePath();c.fill();
  c.strokeStyle=K.skin;c.lineWidth=8;c.beginPath();c.moveTo(108,132);c.lineTo(78,160);c.lineTo(66,186);c.stroke();
  c.beginPath();c.moveTo(148,132);c.lineTo(184,150);c.lineTo(206,166);c.stroke();
  /* gương cầm tay */
  c.strokeStyle='#cfe7f2';c.lineWidth=5;c.beginPath();c.moveTo(210,184);c.lineTo(206,166);c.stroke();
  q=c.createRadialGradient(218,140,2,218,140,24);q.addColorStop(0,'#ffffff');q.addColorStop(1,'#8fd0e8');
  c.fillStyle=q;c.beginPath();c.arc(218,140,24,0,6.283);c.fill();c.strokeStyle='rgba('+K.a+',1)';c.lineWidth=3;c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba('+K.a+','+(.25+.35*pu)+')';c.beginPath();c.arc(218,140,30,0,6.283);c.fill();c.restore();
  /* đầu */
  c.fillStyle=K.skin;c.beginPath();c.ellipse(128,92,19,23,0,0,6.283);c.fill();
  c.strokeStyle='#5a4a8a';c.lineWidth=2;c.beginPath();c.arc(120,92,4.5,.2,2.9);c.stroke();c.beginPath();c.arc(137,92,4.5,.2,2.9);c.stroke();
  c.fillStyle='#d98aa8';c.beginPath();c.ellipse(128,106,4,2,0,0,6.283);c.fill();
  /* mão miện pha lê */
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=K.w;
  [[128,26,0],[110,40,-.35],[146,40,.35],[96,58,-.7],[160,58,.7]].forEach(function(p){
    c.save();c.translate(p[0],p[1]);c.rotate(p[2]);c.beginPath();c.moveTo(0,-14);c.lineTo(5,6);c.lineTo(0,12);c.lineTo(-5,6);c.closePath();c.fill();c.restore()});
  c.restore();
  /* gợn sóng dưới chân */
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba('+K.a+',.55)';c.lineWidth=2;
  for(i=0;i<3;i++){var u=((t*.012+i/3)%1);c.globalAlpha=al*(1-u);c.beginPath();c.ellipse(128,306,40+u*90,8+u*14,0,0,6.283);c.stroke()}
  c.restore();
  c.restore();
}
function paintBoss(cv,e,t){
  var c=cv.getContext('2d'),f=(e.fm|0)===1?1:0,K=PAL[f];
  c.clearRect(0,0,256,320);
  if(f){body(c,K,t,-12,.35);body(c,K,t,0,.72)}else body(c,K,t,0,1);
}

/* ---------- cấu hình phụ bản ---------- */
var api=PBC.make({
  id:'kinhho',label:'🪞 Huyễn Cảnh Kính Hồ',base:3,req:60,
  names:{gob:'Ảnh Nhân',wolf:'Kính Yêu',scorp:'Thủy Mị',arch:'Kính Cung',mage:'Ảnh Pháp Sư',ogre:'Kính Tướng',golem:'Kính Hồ Tiên Tử'},
  diff:{hp:1.8,df:1.45,eHp:1.1,eDf:1.05,bHp:2.4,bDf:1.35},
  boss:{w:256,h:320,key:function(e){return ((e.fm|0))+':'+Math.floor(PBC.tick()/(PBC.lite()?20:10))},paint:paintBoss},
  nameFn:function(e,nm){
    if(e.b===3)return (e.fm|0)===1?'Kính Hồ Tiên Tử · Ảnh Thể':'Kính Hồ Tiên Tử · Thực Thể';
    return e.mir?'Ảnh '+nm:nm;
  },
  onSpawn:function(e){if(e.b===0&&rnd(e.sn*7.3+PBC.tick())>.78)e.mir=1},
  onEnter:function(){nextRip=PBC.tick()+110;nextBoss=0;nextBroken=0},

  step:function(a){
    var t=a.tick(),i,e,d,pair;
    function ripple(x,pct){
      var real=Math.random()<.5,mx2=a.wmax()-x;
      a.addHazard(x,{kind:'rip',real:real,pct:pct,mPct:.04,warn:66,R:50});
      a.addHazard(mx2,{kind:'rip',real:!real,pct:pct,mPct:.04,warn:66,R:50});
    }
    if(t>=nextRip&&a.hazards.length<5){
      ripple(Math.max(60,Math.min(a.wmax()-60,P.x+(Math.random()-.5)*260)),.10);
      nextRip=t+(a.lite()?1.3:1)*170+Math.random()*80;
    }
    for(i=0;i<E.length;i++){
      e=E[i];if(!e||!(e.max>0)||e.k==='pal')continue;
      if(e._lh!=null&&e._lh>e.hp){
        d=e._lh-e.hp;
        if(e.b===3&&(e.fm|0)===1){e.hp=e._lh-d*.15;a.hurtPabs(Math.min(d*.25,mx()*.07),'🪞 Phản chiếu!')}
        else if(e.mir)a.hurtPabs(Math.min(d*.2,mx()*.06),'🪞');
      }
      if(e.b===3){
        if(e.fm==null){e.fm=0;e.fmT=t+540;nextBoss=t+200;nextBroken=t+300}
        if(t>=e.fmT){
          e.fm=1-e.fm;e.fmT=t+(e.fm?300:540);
          a.say(e.fm?'🪞 Tiên Tử hóa ẢNH — ĐỪNG ĐÁNH!':'✨ Tiên Tử trở lại Thực Thể — đánh đi!',e.fm?'#e0b0ff':'#9ff0ff');
        }
        if(t>=nextBoss){ripple(P.x,.14);nextBoss=t+260}
        if(e.hp/e.max<.5&&t>=nextBroken){
          a.say('💥 Gương Vỡ!','#ffd0ff');
          var rl=(Math.random()*3)|0;
          for(var j=0;j<3;j++)a.addHazard(P.x+(j-1)*90,{kind:'rip',real:j===rl,pct:.14,mPct:0,warn:70,R:46});
          nextBroken=t+400;
        }
      }
    }
  },

  /* ---------- nền hồ gương ---------- */
  bgS:function(gy,a,g){
    var q,mx_=W*.78,my=gy*.26;
    g.save();
    g.fillStyle='rgba(22,10,56,.42)';g.fillRect(0,0,W,gy);
    q=g.createRadialGradient(mx_,my,4,mx_,my,gy*.5);q.addColorStop(0,'rgba(230,240,255,.55)');q.addColorStop(1,'rgba(150,170,255,0)');
    g.fillStyle=q;g.beginPath();g.arc(mx_,my,gy*.5,0,6.283);g.fill();
    g.fillStyle='rgba(245,250,255,.9)';g.beginPath();g.arc(mx_,my,gy*.065,0,6.283);g.fill();
    /* mặt hồ phản chiếu ở nền đất */
    q=g.createLinearGradient(0,gy,0,H);q.addColorStop(0,'rgba(90,170,210,.34)');q.addColorStop(1,'rgba(40,40,110,.30)');
    g.fillStyle=q;g.fillRect(0,gy,W,H-gy);
    g.restore();
  },
  /* phần động (Fix364: gợn sóng + cột trăng) — rẻ, vẽ mỗi khung */
  bg:function(gy,a){
    var t=a.tick(),i,mx_=W*.78;
    g.save();
    g.globalCompositeOperation='lighter';g.lineWidth=2*s;
    for(i=0;i<9;i++){
      var rx=((i*.113+.05+t*.0006*(1+i%3*.3))%1)*W,ry=gy+(H-gy)*(.15+(i%5)*.17),rw=40*s+i%4*26*s;
      g.strokeStyle='rgba(180,225,255,'+(.10+.08*Math.sin(t*.05+i))+')';
      g.beginPath();g.ellipse(rx,ry,rw,rw*.18,0,0,6.283);g.stroke();
    }
    g.fillStyle='rgba(235,245,255,.20)';
    for(i=0;i<7;i++){var sy=gy+(H-gy)*(.08+i*.13);g.fillRect(mx_-(18-i*1.5)*s+Math.sin(t*.06+i)*5*s,sy,(36-i*3)*s,2.2*s)}
    g.restore();
  },

  drawHazard:function(h,age,gy,a){
    var x=h.x*s,R=h.R*s,t=a.tick(),i;
    g.save();g.globalCompositeOperation='lighter';
    if(age<h.warn){
      var u=age/h.warn,pu=.5+.5*Math.sin(t*(.22+u*.4));
      if(h.real){
        var q=g.createRadialGradient(x,gy,R*.1,x,gy,R*1.1);q.addColorStop(0,'rgba(150,235,255,'+(.15+.3*u)+')');q.addColorStop(1,'rgba(90,170,255,0)');
        g.fillStyle=q;g.beginPath();g.ellipse(x,gy,R*1.1,R*.32,0,0,6.283);g.fill();
        g.strokeStyle='rgba(215,248,255,'+(.4+.5*pu)+')';g.lineWidth=2.4*s;g.beginPath();g.ellipse(x,gy,R,R*.28,0,0,6.283);g.stroke();
        g.beginPath();g.ellipse(x,gy,R*(1-u),R*.28*(1-u),0,0,6.283);g.stroke();
      }else{
        g.setLineDash([7*s,6*s]);g.strokeStyle='rgba(200,180,255,'+(.22+.16*pu)+')';g.lineWidth=2*s;
        g.beginPath();g.ellipse(x,gy,R,R*.28,0,0,6.283);g.stroke();g.setLineDash([]);
      }
    }else if(h.real){
      var k=(age-h.warn)/h.life,al=Math.max(0,1-k);
      var cg=g.createLinearGradient(0,gy-130*s,0,gy);cg.addColorStop(0,'rgba(170,230,255,0)');cg.addColorStop(1,'rgba(190,240,255,'+(.8*al)+')');
      g.fillStyle=cg;g.fillRect(x-R*.45*(1-k*.4),gy-130*s,R*.9*(1-k*.4),130*s);
      g.strokeStyle='rgba(230,250,255,'+al+')';g.lineWidth=3*s*al;
      var rr=R*(.5+k*.9);g.beginPath();g.ellipse(x,gy,rr,rr*.28,0,0,6.283);g.stroke();
    }
    g.restore();
  },

  /* ---------- hiệu ứng thêm trên quái ---------- */
  foeAfter:function(e,m,a){
    var f=(e.b===3&&(e.fm|0)===1);
    if(!e.mir&&!f)return;
    var HH=m.h*(typeof BZ!=='undefined'?(BZ[e.b|0]||1):1)*SZ*s,x=e.x*s,cy=GY-HH*.5,t=a.tick(),al=Math.max(.05,Math.min(1,1-e.in/30));
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=al;
    if(f&&!a.lite()){var q=g.createRadialGradient(x,cy,HH*.1,x,cy,HH*.7);q.addColorStop(0,'rgba(210,160,255,.38)');q.addColorStop(1,'rgba(150,100,255,0)');
      g.fillStyle=q;g.beginPath();g.arc(x,cy,HH*.7,0,6.283);g.fill()}
    g.setLineDash([5*s,5*s]);g.lineDashOffset=-t*.4;g.strokeStyle='rgba(215,185,255,.75)';g.lineWidth=1.6*s;
    g.beginPath();g.ellipse(x,cy,HH*.38,HH*.52,0,0,6.283);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(240,225,255,.9)';
    for(var i=0;i<3;i++){var sa=t*.04+i*2.1,sx=x+Math.cos(sa)*HH*.34,sy=cy+Math.sin(sa*1.3)*HH*.46;g.fillRect(sx-1.5*s,sy-1.5*s,3*s,3*s)}
    g.restore();
  }
});

/* ---------- gắn vào Nhà Bí Ẩn (1) của Làng Tân Thủ 2 ---------- */
PBC.bindHouse(window.TT2,3,api,{l1:'Huyễn Cảnh',l2:'Kính Hồ · Lv60',full:'Huyễn Cảnh Kính Hồ',ch:'鏡',col:'#4a6ab8'});
window.KHO={api:api,paintBoss:paintBoss,enter:api.enter,on:api.on};
})();
