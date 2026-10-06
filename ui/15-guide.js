
(function(){
const o=document.getElementById('gdp'),bx=o.querySelector('.gdb'),K='kthm_guide';
o.addEventListener('pointerdown',e=>e.stopPropagation());o.addEventListener('click',e=>{if(e.target===o)GD.close()});
document.getElementById('gd-x').onclick=()=>GD.close();
o.querySelectorAll('.gdn a').forEach(a=>a.onclick=()=>{const t=document.getElementById(a.dataset.t);if(t)bx.scrollTo({top:t.offsetTop-bx.querySelector('.gdt').offsetHeight+4,behavior:'smooth'})});
addEventListener('keydown',e=>{if(e.key=='Escape'&&o.classList.contains('on'))GD.close()});
const cs=[...o.querySelectorAll('#gd-cl input')];
const AUTO=[()=>P.lv>=5,null,null,()=>PS[cur].cv.r>=0,()=>PS[cur].tier>=1,()=>!!PS[cur].pet,()=>dgU>=0,null,()=>PS[cur].cv.r>=3,()=>lgDone()];
cs.forEach((c,i)=>{if(AUTO[i])c.nextElementSibling.insertAdjacentHTML('afterbegin','<i>✦</i> ')});
function load(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return[]}}
function up(save){let n=0;cs.forEach(c=>{c.parentNode.classList.toggle('on',c.checked);if(c.checked)n++});
document.getElementById('gd-bar').style.width=n/cs.length*100+'%';document.getElementById('gd-cnt').textContent=n+' / '+cs.length+' bước'+(n==cs.length?' · Hoàn tất, chúc đạo hữu phi thăng!':'');
if(save)try{localStorage.setItem(K,JSON.stringify(cs.map(c=>c.checked)))}catch(e){}}
function sync(){const st=load();cs.forEach((c,i)=>{let a=false;try{a=!!(AUTO[i]&&started&&AUTO[i]())}catch(e){}c.checked=!!st[i]||a});up(true)}
cs.forEach(c=>c.addEventListener('change',()=>up(true)));
document.getElementById('gd-rs').onclick=()=>{cs.forEach(c=>c.checked=false);up(true)};
window.GD={open(sec){sync();o.classList.add('on');bx.scrollTop=0;if(sec){const t=document.getElementById('gd-'+sec);if(t)bx.scrollTop=t.offsetTop-bx.querySelector('.gdt').offsetHeight}try{localStorage.setItem('kthm_gdseen','1')}catch(e){}},close(){o.classList.remove('on')}};
/* nút trong menu chính */
function inject(){const b=document.querySelector('#mn .bx');if(!b||b.querySelector('#gd-mb')||b.querySelector('#pn'))return;const x=document.createElement('button');x.id='gd-mb';x.textContent='📖 Cẩm nang người chơi';x.style.cssText='width:100%;padding:12px';x.onclick=()=>GD.open();b.appendChild(x)}
const _mn=window.mn;if(typeof _mn=='function')window.mn=function(){const r=_mn.apply(this,arguments);try{inject()}catch(e){}return r};
try{inject()}catch(e){}
/* game mới: mở cẩm nang cho người chơi mới */
const _ng=ng;ng=function(){const r=_ng.apply(this,arguments);try{localStorage.removeItem('kthm_guide');setTimeout(()=>window.TUT&&TUT.start(),800)}catch(e){}return r};
})();
