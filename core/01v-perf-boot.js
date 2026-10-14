/* core/01v-perf-boot.js — Tối ưu hiệu năng + khởi động (rf(); init(); loop)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
/* ===== HIỆU NĂNG (giảm giật/nóng máy): QL 0 Cao 60fps · 1 Cân bằng 30fps · 2 Tiết kiệm. Mặc định Tự động (điện thoại = Cân bằng, PC = Cao); máy yếu tự hạ ===== */
(function(){
 const QC=[2,1.5,1],NM=['Cao','Cân bằng','Tiết kiệm'],root=document.documentElement;
 let pref='a',ql=0;try{pref=localStorage.getItem('kthm_ql')||'a'}catch(e){}
 if(!/^[a012]$/.test(pref))pref='a';
 const coarse=(()=>{try{return matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)}catch(e){return false}})();
 const base=()=>pref==='a'?(coarse?1:0):+pref;
 ql=base();window.QCAP=QC[ql];root.setAttribute('data-ql',ql);
 Object.defineProperty(window,'QL',{configurable:true,get(){return ql},set(v){v=Math.max(0,Math.min(2,v|0));if(v===ql)return;ql=v;window.QCAP=QC[v];root.setAttribute('data-ql',v);try{rs()}catch(e){}}});
 window.PFAUTO=()=>pref==='a';
 window.pfLabel=()=>'⚡ Hiệu năng: '+(pref==='a'?'Tự động ('+NM[ql]+')':NM[+pref]);
 window.pfCycle=()=>{pref={a:'0','0':'1','1':'2','2':'a'}[pref];try{localStorage.setItem('kthm_ql',pref)}catch(e){}window.QL=base();if(window.PFRESET)window.PFRESET();mn(0)};
 try{const st=document.createElement('style');st.textContent='html[data-ql="1"] #dock,html[data-ql="2"] #dock{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}html[data-ql="1"] #ult.sb::before,html[data-ql="2"] #ult.sb::before{animation:none!important}html[data-ql="2"] *,html[data-ql="2"] *::before,html[data-ql="2"] *::after{animation-iteration-count:1!important}';(document.head||root).appendChild(st)}catch(e){}
 const sv2=()=>{try{if(started)sv()}catch(e){}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)sv2()});addEventListener('pagehide',sv2);
 try{rs()}catch(e){}
})();
rf();init();mn(0);
(function(){
try{
 if(typeof CanvasRenderingContext2D==='undefined')return;
 const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');
 if(!d||typeof d.get!=='function'||typeof d.set!=='function')return;
 Object.defineProperty(g,'shadowBlur',{configurable:true,get(){return d.get.call(this)},set(v){const q=window.QL;d.set.call(this,q>=2?0:q==1?v*.5:v)}});
}catch(e){try{console.warn('[Mong Tu Tien] shadowBlur optimization skipped',e)}catch(x){}}
})();
(function(){const STEP=1000/60;let last=performance.now(),acc=0,lastDraw=0,ema=16.7,cnt=0,t0=last,wk=6,wn=0,fchk=0,foc=1,arH=0,arEl=null;
window.PFRESET=()=>{ema=16.7;cnt=0;wk=6;wn=0;t0=performance.now()};
document.addEventListener('visibilitychange',()=>{last=performance.now();acc=0});
function loop(now){requestAnimationFrame(loop);
if(document.hidden){last=now;acc=0;return}
let dt=now-last;last=now;if(dt>250)dt=250;acc+=dt;let n=0;const ta=performance.now();
while(acc>=STEP&&n<3){step();acc-=STEP;n++}if(n==3)acc=0;
if(n>0){
 if(--fchk<=0){fchk=30;try{foc=document.hasFocus()?1:0}catch(e){foc=1}arEl=arEl||document.getElementById('arena-scene');arH=arEl&&arEl.classList.contains('on')&&!arEl.classList.contains('battle')?1:0}
 const q=window.QL,gap=!foc?95:q>=1?30:0;
 if(!arH&&now-lastDraw>=gap){lastDraw=now;draw();
  const w=performance.now()-ta;
  if(foc&&dt<100&&now-t0>4000){ema=ema*.93+dt*.07;wk+=(w-wk)*.04;
   if(++cnt>=90){cnt=0;
    if(q<2&&(ema>27||(window.PFAUTO()&&wk>9&&++wn>=3))){window.QL=q+1;ema=16.7;wk=6;wn=0;t0=now-2500}else if(wk<=9)wn=0}}}}}
requestAnimationFrame(loop)})();

