/* ===== 🗺 LÕI PHỤ BẢN (world/114a-phu-ban-core.js · Fix361) =====
 * Khung dùng chung cho các phụ bản chạy "chế độ riêng" phủ lên một map Nhân Giới có sẵn (cfg.base = mapSel của map gốc,
 * nên chỉ số rơi đồ/EXP lấy từ map đó và 5 map cũ không đổi). Mỗi phụ bản là 1 module riêng gọi PBC.make(cfg):
 *   cfg = { id, label, base, req, names:{gob,wolf,scorp,arch,mage,ogre,golem}, diff:{hp,df,eHp,eDf,bHp,bDf},
 *           boss:{w,h,key(e),paint(cv,e,t)},   // hình riêng cho Boss Sử Thi (b==3), vẽ canvas
 *           nameFn(e,name)->name, onSpawn(e,api), step(api), bg(gy,api), foeSkip(e,api), foeAlt(e,m,api), foeAfter(e,m,api),
 *           strike(h,api), drawHazard(h,age,gy,api), onEnter(api), onLeave(api) }
 * api: on(), active(), enter(), tick(), say(t,col), lite(), wmax(), hurtP(pct,txt), hurtM(e,pct), addHazard(x,o), hazards[], ov().
 * Hazard = vòng cảnh báo trên đất: sau o.warn khung thì strike (mặc định: người trong bán kính R mất pPct máu tối đa, KHÔNG chết vì hazard;
 * quái trong vòng mất mPct nếu o.hitM, không dưới 1 máu).
 * PBC.bindHouse(TT, idx, api, {l1,l2,full,ch,col}) gắn phụ bản vào nhà trống của Làng 2 (TT2) / Làng 3 (TT3).
 * Bọc 1 lần: gm, bgd, step, foe. Phụ thuộc: gm, bgd, step, foe, mapSel, vil, lg, dg, started, P, E, DT, W, s, g, GY, MS, MI, mx, c. */
(function(){
'use strict';
if(window.PBC)return;
if(typeof gm!=='function'||typeof bgd!=='function'||typeof step!=='function'||typeof foe!=='function'||typeof g==='undefined'||typeof P==='undefined')return;

var maps=[],cur=null,entering=false,tk=0,OV=null;
function rnd(a){var x=Math.sin(a*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function lite(){return (window.QL|0)>=2}
function say(t,col){try{DT.push({x:P.x,y:200,s:t,c:col||'#ffe9a0',g:1,l:150})}catch(e){}}
function wmax(){try{return W/s}catch(e){return 800}}

function overlay(){
  if(OV)return OV;
  var cv=document.createElement('canvas');
  cv.style.cssText='position:fixed;pointer-events:none;display:none;';
  try{c.insertAdjacentElement('afterend',cv)}catch(e){document.body.appendChild(cv)}
  OV={cv:cv,ctx:cv.getContext('2d'),shown:false,k:.5,w:0,h:0,rt:-99,cw:0,ch:0};
  return OV;
}
/* Fix364: lớp phủ vẽ ở nửa độ phân giải (o.w/o.h = kích thước logic theo c.width/c.height, ctx đã scale sẵn); rect chỉ đo lại mỗi 45 khung */
function ovSync(){
  var o=overlay(),r,k=lite()?.35:.5;
  try{
    if(o.cw!==c.width||o.ch!==c.height||o.k!==k){o.cw=c.width;o.ch=c.height;o.k=k;o.cv.width=Math.max(8,Math.round(c.width*k));o.cv.height=Math.max(8,Math.round(c.height*k));o.rt=-99}
    o.w=c.width;o.h=c.height;o.ctx.setTransform(k,0,0,k,0,0);
    if(tk-o.rt>45||tk<o.rt){o.rt=tk;r=c.getBoundingClientRect();
      o.cv.style.left=r.left+'px';o.cv.style.top=r.top+'px';o.cv.style.width=r.width+'px';o.cv.style.height=r.height+'px'}
  }catch(e){}
  return o;
}
function ovShow(v){var o=overlay();if(o.shown!==v){o.shown=v;o.cv.style.display=v?'block':'none';if(!v){o.ctx.setTransform(1,0,0,1,0,0);o.ctx.clearRect(0,0,o.cv.width,o.cv.height)}}}

function isActive(M){
  try{return M.on&&started&&!vil&&!lg&&!dg&&mapSel===M.cfg.base}catch(e){return false}
}
function eligibleM(M){try{return P.lv>=M.cfg.req}catch(e){return false}}

function make(cfg){
  var M={cfg:cfg,on:false,hz:[],bcKey:''};
  var api={
    cfg:cfg,hazards:M.hz,
    on:function(){return isActive(M)},active:function(){return isActive(M)},
    eligible:function(){return eligibleM(M)},
    tick:function(){return tk},say:say,lite:lite,wmax:wmax,rnd:rnd,
    ov:function(){return ovSync()},ovShow:ovShow,
    hurtP:function(pct,txt){
      var d=Math.max(1,Math.round(mx()*pct));P.hp=Math.max(1,P.hp-d);
      DT.push({x:P.x,y:100,s:d,r:1,l:45});if(txt)DT.push({x:P.x,y:150,s:txt,c:'#ffd9a0',g:1,l:60});return d;
    },
    hurtPabs:function(d,txt){
      d=Math.max(1,Math.round(d));P.hp=Math.max(1,P.hp-d);
      DT.push({x:P.x,y:100,s:d,r:1,l:45});if(txt)DT.push({x:P.x,y:150,s:txt,c:'#ffd9a0',g:1,l:60});return d;
    },
    hurtM:function(e,pct){
      var dm=Math.max(1,Math.round(e.max*pct));e.hp=Math.max(1,e.hp-dm);DT.push({x:e.x,y:110,s:dm,c:'#bfe0ff',l:40});
    },
    addHazard:function(x,o){
      if(M.hz.length>=9)return null;
      o=o||{};var h={x:Math.max(40,Math.min(wmax()-40,x)),t0:tk,warn:o.warn||60,R:o.R||48,pct:o.pct==null?.1:o.pct,mPct:o.mPct||0,
        kind:o.kind||'h',real:o.real!==false,life:o.life||18,seed:(Math.random()*1e4)|0,hit:false,d:o.d||null};
      M.hz.push(h);return h;
    },
    enter:function(){
      if(!started)return;
      if(!eligibleM(M)){say('🔒 Cần Lv'+cfg.req+' để vào '+cfg.label,'#ff9a8a');return}
      entering=true;try{gm(cfg.base)}finally{entering=false}
      maps.forEach(function(o){if(o!==M)o.on=false});
      M.on=true;M.hz.length=0;M.bgMiss=0;M.bgNo=0;
      try{cfg.onEnter&&cfg.onEnter(api)}catch(e){}
      say(cfg.label,'#e9d6ff');
    }
  };
  M.api=api;maps.push(M);return api;
}

/* ---------- bọc gm: đổi sang map khác thì tắt phụ bản ---------- */
var _gm=gm;
gm=function(){
  if(!entering){maps.forEach(function(M){if(M.on&&M.cfg.onLeave){try{M.cfg.onLeave(M.api)}catch(e){}}M.on=false;M.hz.length=0});ovShow(false)}
  return _gm.apply(this,arguments);
};

/* ---------- tăng độ khó: nhân chỉ số quái mới xuất hiện ---------- */
function scaleMon(M){
  var d=M.cfg.diff||{},i,e,hm,dm;
  for(i=0;i<E.length;i++){
    e=E[i];if(!e||e._d||!(e.max>0)||e.k==='pal')continue;
    e._d=1;
    /* hệ số tuyệt đối theo loại quái: thường = hp/df, Tinh Anh = eHp/eDf, Boss = bHp/bDf (thiếu thì lấy hệ số quái thường) */
    hm=e.b===3?(d.bHp||d.hp||1):e.b===1?(d.eHp||d.hp||1):(d.hp||1);
    dm=e.b===3?(d.bDf||d.df||1):e.b===1?(d.eDf||d.df||1):(d.df||1);
    e.hp*=hm;e.max*=hm;if(typeof e.df==='number')e.df*=dm;
    e._lh=e.hp;
    try{M.cfg.onSpawn&&M.cfg.onSpawn(e,M.api)}catch(x){}
  }
}

/* ---------- hazard ---------- */
function hazardStep(M){
  var i,h,age,R,j,e;
  for(i=M.hz.length-1;i>=0;i--){
    h=M.hz[i];age=tk-h.t0;
    if(age>=h.warn&&!h.hit){
      h.hit=true;
      try{
        if(M.cfg.strike)M.cfg.strike(h,M.api);
        else if(h.real){
          if(Math.abs(P.x-h.x)<h.R)M.api.hurtP(h.pct,'💥');
          if(h.mPct)for(j=0;j<E.length;j++){e=E[j];if(e&&e.k!=='pal'&&e.max>0&&Math.abs(e.x-h.x)<h.R)M.api.hurtM(e,h.mPct)}
        }
      }catch(x){}
    }
    if(age>h.warn+h.life)M.hz.splice(i,1);
  }
}

var _step=step;
step=function(){
  var r=_step.apply(this,arguments),i,M=null;
  try{
    tk++;
    for(i=0;i<maps.length;i++)if(isActive(maps[i])){M=maps[i];break}
    if(cur&&cur!==M){ovShow(false);cur.hz.length=0;cur.bgC=null;cur.bgKey='';cur.bgMiss=0;cur.bgNo=0;cur.bc=null;cur.bcKey=''}
    cur=M;
    if(!M){return r}
    scaleMon(M);
    M.cfg.step&&M.cfg.step(M.api);
    hazardStep(M);
    for(i=0;i<E.length;i++)if(E[i])E[i]._lh=E[i].hp;
  }catch(e){}
  return r;
};

/* ---------- bgd: nền map gốc + phủ riêng + vẽ hazard ---------- */
var _bgd=bgd;
/* Fix364: cfg.bgS(gy,api,ctx) = phần nền TĨNH, vẽ 1 lần vào canvas đệm rồi drawImage mỗi khung (đổi cỡ màn hình thì vẽ lại).
 * Nếu key đổi liên tục (rung màn hình...) quá 12 lần thì tự quay về vẽ trực tiếp. */
function drawStatic(M,gy){
  var cf=M.cfg,dp=(typeof DPR==='number'&&DPR>0)?DPR:1,key=W+'|'+H+'|'+gy+'|'+s+'|'+dp,cv=M.bgC;
  if(!M.bgNo&&(!cv||M.bgKey!==key)){
    if(tk-(M.bgLast||0)>120)M.bgMiss=0;M.bgLast=tk;
    if(++M.bgMiss>12){M.bgNo=1;M.bgC=null}
    else{
      try{
        if(!cv){cv=M.bgC=document.createElement('canvas')}
        if(cv.width!==c.width)cv.width=c.width;if(cv.height!==c.height)cv.height=c.height;
        var x=cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(dp,0,0,dp,0,0);
        cf.bgS(gy,M.api,x);M.bgKey=key;
      }catch(e){M.bgNo=1;M.bgC=null}
    }
  }
  if(M.bgC&&!M.bgNo&&M.bgKey===key){g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(M.bgC,0,0);g.restore()}
  else cf.bgS(gy,M.api,g);
}
bgd=function(gy){
  _bgd.apply(this,arguments);
  var M=cur;if(!M||!isActive(M))return;
  try{
    if(M.cfg.bgS)drawStatic(M,gy);
    M.cfg.bg&&M.cfg.bg(gy,M.api);
    if(M.cfg.drawHazard)for(var i=0;i<M.hz.length;i++)M.cfg.drawHazard(M.hz[i],tk-M.hz[i].t0,gy,M.api);
  }catch(e){}
};

/* ---------- foe: đổi tên, hình riêng cho boss, hiệu ứng thêm ---------- */
var _foe=foe;
foe=function(e){
  var M=cur;
  if(!e||!M||!isActive(M)||e.k==='pal'||typeof MS==='undefined'||!MS[e.k])return _foe.apply(this,arguments);
  var cf=M.cfg,m=MS[e.k],old=m.n,N=cf.names||{},nm=(e.b===3)?N.golem:(e.b===1&&e.k==='ogre')?N.ogre:N[e.k],r,sw=0,oIm,oF;
  if(cf.nameFn){try{nm=cf.nameFn(e,nm)||nm}catch(x){}}
  if(cf.foeSkip&&cf.foeSkip(e,M.api)){try{cf.foeAlt&&cf.foeAlt(e,m,M.api)}catch(x){}return}
  try{
    if(nm)m.n=nm;
    if(e.b===3&&cf.boss&&typeof MI!=='undefined'){
      var bc=M.bc||(M.bc=(function(){var v=document.createElement('canvas');v.width=cf.boss.w;v.height=cf.boss.h;v.naturalWidth=cf.boss.w;v.naturalHeight=cf.boss.h;return v})());
      var key=cf.boss.key(e);
      if(key!==M.bcKey){M.bcKey=key;try{cf.boss.paint(bc,e,tk)}catch(x){}}
      oIm=MI[e.k];oF=m.f;MI[e.k]=bc;m.f=1;sw=1;
    }
    r=_foe.apply(this,arguments);
  }finally{m.n=old;if(sw){MI[e.k]=oIm;m.f=oF}}
  try{cf.foeAfter&&cf.foeAfter(e,m,M.api)}catch(x){}
  return r;
};

/* ---------- gắn phụ bản vào nhà của Làng 2/3 ---------- */
function bindHouse(TT,idx,api,look){
  try{
    var H=TT&&TT.houses&&TT.houses[idx];if(!H)return false;
    var k;for(k in look)H[k]=look[k];
    H.open=function(){
      if(!api.eligible()){say('🔒 Cần Lv'+api.cfg.req+' để vào '+api.cfg.label,'#ff9a8a');return}
      try{TT.leave()}catch(e){}
      api.enter();
    };
    return true;
  }catch(e){return false}
}

window.PBC={make:make,bindHouse:bindHouse,rnd:rnd,lite:lite,tick:function(){return tk},maps:maps};
})();
