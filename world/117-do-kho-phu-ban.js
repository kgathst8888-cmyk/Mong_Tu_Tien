/* ===== 🔥 ĐỘ KHÓ + LỜI NGUYỀN PHỤ BẢN (world/117-do-kho-phu-ban.js) — Fix362 — nạp SAU world/114a, 115, 116 =====
 * Áp cho các phụ bản dùng lõi PBC (🪞 Huyễn Cảnh Kính Hồ, 💀 Cốt Hải Sa Mạc). Không sửa core/engine/115/116.
 * Trước khi vào phụ bản hiện bảng chọn: 3 độ khó + 3 Lời Nguyền (tối đa 3, cộng dồn):
 *   Độ khó   Máu quái  Sát thương quái  Thưởng   Nguyên liệu boss
 *   Thường     ×1        ×1              ×1        ×1   (cơ bản 2)
 *   Ác Mộng    ×1.5      ×1.25           ×1.6      ×2
 *   Địa Ngục   ×2.2      ×1.5            ×2.5      ×3
 *   Lời Nguyền: 🩸 Quái Cường Hoá (+40% máu quái) · 💢 Hung Bạo (+30% sát thương quái) · ☠ Hiểm Địa (hazard/phản đòn/bão cát +50% sát thương)
 *   Mỗi Lời Nguyền: thưởng ×(1+0.2 mỗi cái), tối đa ×4 (hệ số thưởng tổng).
 * CÁCH ÁP: hệ số nhân lên cfg.diff của map (hp/df theo loại quái, đúng cơ chế scaleMon của PBC) lúc vào; hazard: bọc api.hurtP/hurtPabs.
 * THƯỞNG (EXP, vàng, rơi đồ): bọc drop(e) — chạy thêm (hệ số−1) lần drop gốc cho quái trong phụ bản + cộng thêm EXP tương ứng (cùng công thức engine).
 * NGUYÊN LIỆU: boss phụ bản (e.b===3) rơi Tinh Hoa Kính Hồ (Kính Hồ) / Cốt Long Tủy (Cốt Hải) vào HKU (ui/103) — dùng nâng cấp Hoàng Kim.
 * Mọi sát thương hazard vẫn KHÔNG giết người chơi (còn tối thiểu 1 máu) như PBC.
 * Chỉnh: window.DKP.cfg {LV, CU, matBase, rwCap}. Gỡ = xoá thẻ script (diff về mặc định theo từng lần vào là cfg._dk0). */
(function(){
'use strict';
if(window.DKP||!window.PBC||!PBC.maps||!PBC.maps.length||typeof drop!=='function'||typeof P==='undefined')return;
var CFG={
  LV:[{n:'Thường',e:'🟢',hp:1,df:1,rw:1,mat:1},{n:'Ác Mộng',e:'🟠',hp:1.5,df:1.25,rw:1.6,mat:2},{n:'Địa Ngục',e:'🔴',hp:2.2,df:1.5,rw:2.5,mat:3}],
  CU:[{k:'hp',e:'🩸',n:'Quái Cường Hoá',d:'+40% máu quái',hp:1.4,rw:.2},
      {k:'df',e:'💢',n:'Hung Bạo',d:'+30% sát thương quái',df:1.3,rw:.2},
      {k:'hz',e:'☠',n:'Hiểm Địa',d:'Hazard, phản đòn, bão cát +50% sát thương',hz:1.5,rw:.2}],
  maxCurse:3,matBase:2,rwCap:4,
  matKey:{kinhho:'kh',cothai:'ct'},matName:{kinhho:'🪞 Tinh Hoa Kính Hồ',cothai:'💀 Cốt Long Tủy'},
  house:{kinhho:['TT2',4],cothai:['TT3',3]}};
var LV=CFG.LV,CU=CFG.CU;
function nf(n){try{return Math.round(n).toLocaleString('vi-VN')}catch(e){return ''+n}}
function x2(v){return (Math.round(v*100)/100).toString().replace('.',',')}
function mulOf(M){
  var d=M.dk||{lv:0,cu:[]},ck=d.lv+'|'+d.cu.join(',');if(M._mk===ck&&M._mv)return M._mv;
  var _r=mulOf0(M);M._mk=ck;M._mv=_r;return _r}
function mulOf0(M){
  var d=M.dk||{lv:0,cu:[]},L=LV[d.lv]||LV[0],hp=L.hp,df=L.df,hz=1,rw=0;
  CU.forEach(function(c){if(d.cu.indexOf(c.k)>=0){hp*=c.hp||1;df*=c.df||1;hz*=c.hz||1;rw+=c.rw}});
  var tot=Math.min(CFG.rwCap,L.rw*(1+rw));
  return{hp:hp,df:df,hz:hz,rw:tot,mat:Math.max(1,Math.round(CFG.matBase*L.mat*(1+rw)))}}
function curMap(){for(var i=0;i<PBC.maps.length;i++){var M=PBC.maps[i];try{if(M.api&&M.api.active())return M}catch(e){}}return null}
function applyDiff(M){
  var cf=M.cfg,d0=cf._dk0||(cf._dk0=JSON.parse(JSON.stringify(cf.diff||{}))),m=mulOf(M),o={},k;
  for(k in d0)o[k]=d0[k]*(/hp$/i.test(k)?m.hp:m.df);
  cf.diff=o}
/* ---------- bảng chọn ---------- */
var DLG=null,GOLD='#f2c14e';
var st=document.createElement('style');
st.textContent='.dkp-lv{display:flex;gap:6px;margin:8px 0}.dkp-lv div{flex:1;border:1px solid #5a4630;border-radius:8px;padding:8px 2px;text-align:center;cursor:pointer;background:#140d0a;font-size:12.5px;line-height:1.35}.dkp-lv div.on{border-color:#ffd870;background:#3a2a10}'
+'.dkp-lv b{display:block;font-size:13px}.dkp-cu{display:flex;gap:8px;align-items:center;border:1px solid #4a3828;border-radius:8px;padding:7px 8px;margin:5px 0;font-size:12.5px;cursor:pointer;background:#140d0a}.dkp-cu.on{border-color:#ff8a5a;background:#3a1a10}.dkp-cu i{font-style:normal;width:20px;text-align:center}.dkp-cu span{flex:1}'
+'.dkp-box{border:1px solid #5a4630;border-radius:8px;background:#140d0a;padding:8px;margin:8px 0;font-size:12.5px;line-height:1.55}.dkp-bt{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px}.dkp-bt button{margin:0!important}.dkp-ok{background:#6a4a14!important;border-color:#ffd870!important}';
document.head.appendChild(st);
function ov(){var o=document.getElementById('dkp-ov');if(o)o.remove();o=document.createElement('div');o.id='dkp-ov';o.className='tsm-ov';o.style.setProperty('--tc',GOLD);
  o.addEventListener('click',function(e){if(e.target===o)close()});document.body.appendChild(o);return o}
function close(){var o=document.getElementById('dkp-ov');if(o)o.remove();DLG=null}
function render(){
  var o=document.getElementById('dkp-ov');if(!o||!DLG)return;var M=DLG.M,d=M.dk,m=mulOf(M),id=M.cfg.id;
  var h='<div class="tsm-bx hkg-bx"><h3>'+M.cfg.label+'</h3><small>Chọn độ khó và Lời Nguyền (tối đa '+CFG.maxCurse+'). Càng khó, thưởng EXP · vàng · rơi đồ và nguyên liệu nâng Hoàng Kim càng nhiều.</small><div class="dkp-lv">';
  LV.forEach(function(L,i){h+='<div class="'+(d.lv===i?'on':'')+'" onclick="DKP.lv('+i+')">'+L.e+'<b>'+L.n+'</b>Máu ×'+x2(L.hp)+'<br>ST ×'+x2(L.df)+'<br>Thưởng ×'+x2(L.rw)+'</div>'});
  h+='</div><b style="color:'+GOLD+'">Lời Nguyền</b>';
  CU.forEach(function(c){var on=d.cu.indexOf(c.k)>=0;h+='<div class="dkp-cu'+(on?' on':'')+'" onclick="DKP.cu(\''+c.k+'\')"><i>'+(on?'☑':'☐')+'</i><span><b>'+c.e+' '+c.n+'</b><br><small style="margin:0;opacity:.8">'+c.d+' · thưởng +'+Math.round(c.rw*100)+'%</small></span></div>'});
  h+='<div class="dkp-box">Máu quái <b>×'+x2(m.hp)+'</b> · Sát thương quái <b>×'+x2(m.df)+'</b>'+(m.hz>1?' · Hazard <b>×'+x2(m.hz)+'</b>':'')
    +'<br>Thưởng (EXP · vàng · rơi đồ): <b style="color:#8ef0a8">×'+x2(m.rw)+'</b>'
    +'<br>Boss rơi '+(CFG.matName[id]||'nguyên liệu')+': <b style="color:#8ef0a8">≈ '+m.mat+'</b>'+(window.PBF&&PBF.line?PBF.line(id):'')+'</div>'
    +'<div class="dkp-bt"><button class="tsm-x dkp-ok" onclick="DKP.go()">⚔ Vào phụ bản</button><button class="tsm-x" onclick="DKP.close()">Huỷ</button></div></div>';
  var bx=o.firstElementChild,top=bx?bx.scrollTop:0;o.innerHTML=h;try{o.firstElementChild.scrollTop=top}catch(e){}}
function openDlg(M,cb){DLG={M:M,cb:cb};ov();render()}
/* ---------- gắn vào từng phụ bản ---------- */
function wrap(M){
  if(M._dk||!M.api)return;M._dk=1;M.dk={lv:0,cu:[]};
  var api=M.api,_enter=api.enter;
  function doEnter(self,args){
    applyDiff(M);var r=_enter.apply(self,args);
    try{var m=mulOf(M);if(M.dk.lv||M.dk.cu.length)api.say('🔥 '+LV[M.dk.lv].n+(M.dk.cu.length?' +'+M.dk.cu.length+' Lời Nguyền':'')+' · Thưởng ×'+x2(m.rw),'#ffb36b')}catch(e){}
    return r}
  api.enter=function(){
    if(M._dkGo){M._dkGo=0;return doEnter(this,arguments)}                 /* đã chọn xong → vào thật */
    if((typeof started!=='undefined'&&!started)||!api.eligible())return _enter.apply(this,arguments);   /* PBC tự báo "Cần LvXX" */
    var self=this,args=arguments;
    openDlg(M,function(){M._dkGo=1;try{api.enter.apply(self,args)}finally{M._dkGo=0}})};
  ['hurtP','hurtPabs'].forEach(function(n){
    var f=api[n];if(typeof f!=='function')return;
    api[n]=function(a,t){var k=mulOf(M).hz;if(k!==1&&api.active())a*=k;return f.call(this,a,t)}});
  /* nhà trong làng: hiện bảng chọn TRƯỚC khi rời làng */
  try{var hc=CFG.house[M.cfg.id],T=hc&&window[hc[0]],H=T&&T.houses&&T.houses[hc[1]];
    if(H&&typeof H.open==='function'&&!H._dk){var _o=H.open;H._dk=1;
      H.open=function(){
        if(typeof started!=='undefined'&&!started)return _o.apply(this,arguments);
        if(!api.eligible())return _o.apply(this,arguments);
        var self=this,args=arguments;
        openDlg(M,function(){M._dkGo=1;try{_o.apply(self,args)}finally{M._dkGo=0}})}}}catch(e){}}
PBC.maps.forEach(wrap);
/* ---------- thưởng tăng + nguyên liệu: bọc drop(e) ---------- */
var inX=0,_drop=drop;
drop=function(e){
  var r=_drop.apply(this,arguments);
  if(inX||!e||e.k==='pal'||e.dg)return r;
  try{
    var M=curMap();if(!M)return r;var m=mulOf(M);
    if(m.rw>1){
      inX=1;var _D=DT,_dp=Array.prototype.push,_dn=0,_own=Object.prototype.hasOwnProperty.call(_D,'push')?_D.push:null;
      /* Fix364: các lần drop thêm chỉ được hiện tối đa 3 dòng chữ nổi (chống đầy màn hình + lag) */
      _D.push=function(){return(++_dn<=3)?_dp.apply(this,arguments):this.length};
      try{
        var ex=m.rw-1,i,n;
        if(typeof XR==='function'){var base=(window.HDAO&&HDAO.xg?HDAO.xg():1)*Math.round((e.b==3?200:e.b?80:15)*(1+e.lv/5)),gx=Math.round(XR(base)*ex);if(gx>0)P.xp+=gx}
        n=Math.floor(ex);if(Math.random()<ex-n)n++;
        for(i=0;i<n;i++)_drop.apply(this,arguments)}
      finally{inX=0;if(_own)_D.push=_own;else delete _D.push}}
    if(e.b===3){var k=CFG.matKey[M.cfg.id];
      if(k&&window.HKU){HKU.addMat(k,m.mat);DT.push({x:e.x,y:260,s:(CFG.matName[M.cfg.id]||'Nguyên liệu')+' +'+m.mat,c:'#9fe7ff',l:140,g:1})}}
  }catch(x){inX=0}
  return r};
window.DKP={cfg:CFG,mul:function(id){for(var i=0;i<PBC.maps.length;i++)if(PBC.maps[i].cfg.id===id)return mulOf(PBC.maps[i]);return null},
  lv:function(i){if(!DLG)return;DLG.M.dk.lv=Math.max(0,Math.min(LV.length-1,i|0));render()},
  cu:function(k){if(!DLG)return;var a=DLG.M.dk.cu,j=a.indexOf(k);
    if(j>=0)a.splice(j,1);else if(a.length<CFG.maxCurse)a.push(k);render()},
  go:function(){var D=DLG;if(!D)return;close();try{D.cb()}catch(e){}},
  close:close};
})();
