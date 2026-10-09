
/* ================= XẾP HẠNG + TÊN NHÂN VẬT (RK) =================
   - Nút 🏆 nằm cạnh đồng hồ Boss Thế Giới ở HUD.
   - 3 bảng: Tu vi · Cấp độ · Lực chiến (từng hệ). Dữ liệu từng nhân vật lên Supabase qua xep_hang.sql.
   - Mỗi nhân vật 1 tên riêng: đặt lần đầu miễn phí, đổi lại được 1 lần (PS[i].nm / PS[i].rc). */
(function(){
'use strict';
const C={pushMs:60000,ttl:30000,limit:50,maxRename:1,
 pow:()=>Math.round(atk()*5+df()*3+mx()/5)};   /* công thức lực chiến: công×5 + thủ×3 + HP÷5 */
const RNm=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
const realm=(cr,cs)=>cr<0?'Sơ Khai':(RNm[cr]||'?')+' tầng '+cs;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>(Number(n)||0).toLocaleString('vi-VN');
const S={on:false,mode:'rank',tab:'cult',cls:'w',busy:false,err:'',legacy:false,data:{},at:{},ni:0,nmsg:''};
/* ---------- CSS + DOM ---------- */
const st=document.createElement('style');st.textContent=`
#rkb{position:fixed;z-index:2;width:34px;height:34px;box-sizing:border-box;border-radius:50%;border:2px solid #c9a24f;background:radial-gradient(circle at 50% 30%,#4b3a2c,#120b08 78%);box-shadow:0 3px 8px #000b,inset 0 0 8px #000;color:#ffe27a;font-size:16px;line-height:28px;text-align:center;padding:0;display:none;cursor:pointer}
#rkb::after{content:"Xếp hạng";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:bold 8px/9px KTH Serif,Songti SC,STKaiti,KaiTi,serif;color:#ffe9b0;text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;pointer-events:none;font-style:normal}
#rk-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:32;align-items:center;justify-content:center;font-family:'KTH Serif','Songti SC',STKaiti,KaiTi,serif;color:#f2e3b3}
#rk-ov.on{display:flex}
.rk-bx{background:#2a1a12;border:3px solid #b8964e;border-radius:10px;padding:10px;width:min(400px,94vw);max-height:90vh;overflow:auto;font-size:13px;box-sizing:border-box;-webkit-user-select:text;user-select:text}
.rk-h{display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:16px;margin-bottom:8px}
.rk-t{display:flex;gap:6px;margin-bottom:6px}.rk-t button{flex:1;margin:0!important}
.rk-bx button{margin:4px 4px 0 0;background:#5a4220;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;padding:7px 8px;font:inherit;cursor:pointer}
.rk-bx button.on{background:#8a6428}.rk-bx button:disabled{opacity:.45}
.rk-bx input{width:100%;box-sizing:border-box;margin:6px 0;padding:8px;background:#140d0a;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;font:inherit;font-size:15px;-webkit-user-select:text;user-select:text}
.rk-n{font-size:12px;opacity:.85;margin:6px 0;line-height:1.45}
.rk-m{margin:6px 0;padding:6px 8px;border-radius:5px;background:#140d0a;border:1px solid #5a4630;font-size:12.5px;line-height:1.45}
.rk-l{width:100%;border-collapse:collapse;font-size:12.5px}.rk-l td{padding:4px 3px;border-bottom:1px solid #4a3622;vertical-align:middle}
.rk-l tr.me{background:#4a3410;font-weight:bold}.rk-l .r{width:30px;text-align:center;color:#ffd54a}.rk-l .v{text-align:right;color:#ffe9a0;white-space:nowrap;padding-left:6px}
`;document.head.appendChild(st);
const btn=document.createElement('button');btn.id='rkb';btn.type='button';btn.textContent='🏆';btn.title='Xếp hạng';
btn.onpointerdown=e=>e.stopPropagation();btn.onclick=e=>{e.stopPropagation();open('cult')};document.body.appendChild(btn);
const ov=document.createElement('div');ov.id='rk-ov';ov.innerHTML='<div class="rk-bx"></div>';document.body.appendChild(ov);
['keydown','keyup','keypress'].forEach(n=>ov.addEventListener(n,e=>{e.stopPropagation();if(n=='keydown'&&e.key==='Enter'&&e.target&&e.target.id=='rk-nm')act('save')}));
ov.addEventListener('click',e=>{let n=e.target;while(n&&n!==ov&&!(n.getAttribute&&n.getAttribute('data-a')))n=n.parentNode;if(n&&n!==ov)act(n.getAttribute('data-a'));else if(e.target===ov)close()});
/* ---------- đặt vị trí nút theo HUD ---------- */
let lastPos='';
function place(){
 let show=false;try{show=!!started&&document.getElementById('mn').style.display==='none'}catch(e){}
 if(!show){if(btn.style.display!=='none')btn.style.display='none';const ab0=document.getElementById('arena-btn');if(ab0&&ab0.style.display!=='none')ab0.style.display='none';return}
 let x,y;
 if(W<640){const t=E.some(e=>e.b==2)?'🐲 Boss Thế Giới!':'🐲 00:00',n='⭐ 29/30 · 👑 99/100';g.save();g.font='bold 12px KTH Serif,Songti SC,STKaiti,KaiTi,serif';const tw=Math.max(g.measureText(t).width,g.measureText(n).width);g.restore();x=W-8-tw-8-34;y=103-17}
 else{const hs=cl(Math.min(H/540,W/420),.6,1.1);x=W-210*hs-6-34;y=(12+76)*hs-5*hs-17}
 const k=Math.round(x)+','+Math.round(y);
 if(k!==lastPos){lastPos=k;btn.style.left=Math.round(x)+'px';btn.style.top=Math.round(y)+'px'}
 const ab=document.getElementById('arena-btn');if(ab){const ax=Math.round(x-96)+'px',ay=Math.round(y)+'px';if(ab.style.left!==ax)ab.style.left=ax;if(ab.style.top!==ay)ab.style.top=ay;if(ab.style.display!=='flex')ab.style.display='flex'}
 if(btn.style.display!=='block')btn.style.display='block'}
const _draw=window.draw;if(typeof _draw=='function')window.draw=function(){const r=_draw.apply(this,arguments);try{place()}catch(e){}return r};
/* ---------- dữ liệu nhân vật ---------- */
function pows(){const c0=cur,e0=EQ,l0=P.lv,r=[];
 try{for(let i=0;i<CHR.length;i++){cur=i;EQ=EQS[i];P.lv=((i==c0?l0:PS[i].lv)|0)||1;r[i]=Math.max(0,C.pow())}}catch(e){}
 finally{cur=c0;EQ=e0;P.lv=l0}
 return r}
function chars(){const w=pows();return CHR.map((c,i)=>{const p=PS[i],cv=p.cv||{},br=p.br;
 return{slot:i,name:CN(i),cls:c.t,cn:(br>=0&&c.br&&c.br[br])?c.br[br].n:CL[c.t],lv:((i==cur?P.lv:p.lv)|0)||1,tier:p.tier|0,cr:typeof cv.r=='number'?cv.r:-1,cs:cv.s|0,pw:w[i]|0}})}
let lastH='',pushing=false;
async function push(force){
 if(pushing||!window.KCL||!KCL.OK||!KCL.sess()||typeof started=='undefined'||!started)return;
 const ch=chars(),h=JSON.stringify(ch.map(c=>[c.name,c.lv,c.tier,c.cr,c.cs,Math.round(c.pw/50)]));
 if(!force&&h===lastH)return;
 pushing=true;
 try{const r=await KCL.rpc('submit_chars',{p_chars:ch});if(r&&r.status==='ok')lastH=h}
 catch(e){if(e&&(e.status===404||e.code==='PGRST202'))lastH=h}   /* máy chủ chưa cài SQL: đừng thử lại liên tục */
 finally{pushing=false}}
setInterval(()=>push(false),C.pushMs);setTimeout(()=>push(false),9000);
/* ---------- tải bảng ---------- */
const keyOf=()=>S.tab+(S.tab=='pow'?':'+S.cls:'');
async function legacy(kind){
 const body={p_limit:50};let r;
 r=KCL.sess()?await KCL.rpc('get_leaderboard',body):await KCL.http('/rest/v1/rpc/get_leaderboard',{method:'POST',body});
 const top=((r&&r.top)||[]).map(x=>({name:x.name,cn:x.cls,lv:x.lv|0,cr:x.cult_r|0,cs:x.cult_s|0,pw:0,me:!!x.me}));
 if(kind=='cult')top.sort((a,b)=>(b.cr-a.cr)||(b.cs-a.cs)||(b.lv-a.lv));else top.sort((a,b)=>(b.lv-a.lv)||(b.cr-a.cr)||(b.cs-a.cs));
 top.forEach((x,i)=>x.rank=i+1);return{top,mine:[],total:r&&r.total|0,legacy:true}}
async function fetchRank(kind,cls){
 if(!window.KCL||!KCL.OK)return{top:[],mine:[],total:0,offline:true};
 const body={p_kind:kind,p_cls:kind=='pow'?cls:null,p_limit:C.limit};
 try{return KCL.sess()?await KCL.rpc('get_rank',body):await KCL.http('/rest/v1/rpc/get_rank',{method:'POST',body})}
 catch(e){if(e&&(e.status===404||e.code==='PGRST202')){if(kind=='pow')return{top:[],mine:[],total:0,legacy:true};return legacy(kind)}throw e}}
async function load(force){
 const k=keyOf();if(!force&&S.data[k]&&Date.now()-(S.at[k]||0)<C.ttl){render();return}
 S.busy=true;S.err='';render();
 try{await push(true);S.data[k]=await fetchRank(S.tab,S.cls);S.at[k]=Date.now()}
 catch(e){S.err=(e&&e.net)?e.message:((e&&e.message)||'Lỗi tải bảng xếp hạng')}
 S.busy=false;render()}
/* ---------- giao diện ---------- */
function open(tab){if(tab)S.tab=tab;S.mode='rank';S.on=true;ov.classList.add('on');render();load(false)}
function close(){S.on=false;ov.classList.remove('on')}
const medal=r=>['🥇','🥈','🥉'][r-1]||r;
function val(x){return S.tab=='cult'?esc(realm(x.cr|0,x.cs|0)):S.tab=='lv'?'Lv '+(x.lv|0):'⚔ '+nf(x.pw)}
function sub(x){return esc((x.cn||'')+' · Lv '+(x.lv|0)+(S.tab=='cult'?'':' · '+realm(x.cr|0,x.cs|0)))}
function rowH(x){return'<tr class="'+(x.me?'me':'')+'"><td class="r">'+medal(x.rank)+'</td><td>'+esc(x.name)+'<br><small style="opacity:.75">'+sub(x)+'</small></td><td class="v">'+val(x)+'</td></tr>'}
function mineLocal(){const f=S.tab=='pow'?(c=>c.cls==S.cls):(()=>true);return chars().filter(f).map(c=>({rank:'–',name:c.name,cn:c.cn,lv:c.lv,cr:c.cr,cs:c.cs,pw:c.pw,me:true}))}
function viewRank(){
 const TT={cult:'🧘 Tu vi',lv:'🎖 Cấp độ',pow:'⚔ Lực chiến'};
 let h='<div class="rk-t">'+Object.keys(TT).map(k=>'<button data-a="tab:'+k+'" class="'+(S.tab==k?'on':'')+'">'+TT[k]+'</button>').join('')+'</div>';
 if(S.tab=='pow')h+='<div class="rk-t">'+Object.keys(CL).map(k=>'<button data-a="cls:'+k+'" class="'+(S.cls==k?'on':'')+'">'+esc(CL[k])+'</button>').join('')+'</div>';
 h+='<div class="rk-n">'+(S.tab=='cult'?'Xếp theo cảnh giới › tầng › cấp độ.':S.tab=='lv'?'Xếp theo số lần chuyển chức › cấp độ › cảnh giới.':'Xếp riêng từng hệ. Lực chiến = công×5 + thủ×3 + HP÷5, cập nhật khi bạn chơi.')+' Mỗi nhân vật là một dòng riêng.</div>';
 const D=S.data[keyOf()];
 if(S.busy&&!D)h+='<div class="rk-m">Đang tải…</div>';
 if(S.err)h+='<div class="rk-m">⚠ '+esc(S.err)+'</div>';
 if(D){
  if(D.offline)h+='<div class="rk-m">Chưa cấu hình máy chủ, chỉ xem được nhân vật của bạn trên máy này.</div>';
  else if(D.legacy)h+='<div class="rk-m">⚠ Máy chủ chưa cài bảng xếp hạng nâng cao (file <b>xep_hang.sql</b>). '+(S.tab=='pow'?'Chưa có bảng lực chiến toàn máy chủ.':'Đang dùng bảng cũ: mỗi tài khoản chỉ hiện nhân vật mạnh nhất.')+'</div>';
  const top=D.top||[];
  if(top.length)h+='<table class="rk-l">'+top.map(rowH).join('')+'</table>';
  else if(!D.offline&&!D.legacy)h+='<div class="rk-m">Chưa có ai trên bảng này.</div>';
  const mine=(D.mine||[]).filter(x=>!top.some(t=>t.me&&t.name===x.name&&t.rank===x.rank));
  if(mine.length)h+='<div class="rk-n">Hạng của bạn:</div><table class="rk-l">'+mine.map(rowH).join('')+'</table>';
  if(D.total!=null&&!D.offline&&!D.legacy)h+='<div class="rk-n">Tổng '+(D.total|0)+' nhân vật'+((window.KCL&&KCL.sess())?'':' · đăng nhập ☁ để nhân vật của bạn lên bảng')+'</div>'}
 if(!D||D.legacy||D.offline){h+='<div class="rk-n">Nhân vật của bạn (trên máy):</div><table class="rk-l">'+mineLocal().map(rowH).join('')+'</table>'}
 return h+'<button data-a="ref"'+(S.busy?' disabled':'')+'>🔄 Làm mới</button>'}
function nameLeft(i){const p=PS[i];return p.nm?Math.max(0,C.maxRename-(p.rc|0)):C.maxRename}
function viewName(){const i=S.ni,p=PS[i],first=!p.nm,left=nameLeft(i);
 let h='<div class="rk-n">Nhân vật: <b>'+esc(CHR[i].n)+'</b> · '+esc(CL[CHR[i].t])+'<br>Tên hiện tại: <b>'+esc(CN(i))+'</b></div>';
 if(!first&&left<1)return h+'<div class="rk-m">🔒 Nhân vật này đã dùng hết lượt đổi tên.</div><button data-a="x">Đóng</button>';
 h+='<div class="rk-m">'+(first?'Đặt tên lần đầu <b>miễn phí</b>. Sau đó còn được đổi lại <b>'+C.maxRename+' lần</b>.':'Đây là lượt đổi tên <b>cuối cùng</b> (còn '+left+' lần). Sau khi đổi sẽ không đổi lại được.')+'</div>';
 h+='<input id="rk-nm" maxlength="12" placeholder="Tên mới (2–12 ký tự)" value="'+esc(p.nm||'')+'" autocomplete="off">';
 h+='<div class="rk-n">Tên của 3 nhân vật phải khác nhau. Chỉ dùng chữ, số, khoảng trắng, dấu . _ -</div>';
 if(S.nmsg)h+='<div class="rk-m">'+esc(S.nmsg)+'</div>';
 return h+'<button data-a="save">✔ Lưu tên</button><button data-a="x">Huỷ</button>'}
function render(){const b=ov.querySelector('.rk-bx');if(!b)return;
 const nm=S.mode=='name';
 b.innerHTML='<div class="rk-h"><span>'+(nm?'✏ Tên nhân vật':'🏆 Bảng Xếp Hạng')+'</span><button data-a="x">✕</button></div>'+(nm?viewName():viewRank());
 if(nm){const e=document.getElementById('rk-nm');if(e&&!e.dataset.f){e.dataset.f=1;try{e.focus();e.select()}catch(x){}}}}
/* ---------- đặt / đổi tên ---------- */
const clean=v=>String(v||'').normalize('NFC').replace(/\s+/g,' ').trim();
function saveName(){
 const i=S.ni,p=PS[i],first=!p.nm,e=document.getElementById('rk-nm'),v=clean(e&&e.value);
 if(!first&&nameLeft(i)<1){S.nmsg='Đã hết lượt đổi tên.';render();return}
 if(v.length<2||v.length>12){S.nmsg='Tên cần từ 2 đến 12 ký tự.';render();return}
 if(!/^[\p{L}\p{N} ._-]+$/u.test(v)){S.nmsg='Tên chứa ký tự không hợp lệ.';render();return}
 for(let j=0;j<CHR.length;j++)if(j!==i&&CN(j).toLowerCase()===v.toLowerCase()){S.nmsg='Tên này đã dùng cho nhân vật khác của bạn.';render();return}
 if(!first&&v===p.nm){S.nmsg='Tên mới trùng tên cũ. Hãy nhập tên khác.';render();return}
 p.nm=v;if(!first)p.rc=(p.rc|0)+1;
 try{sv()}catch(x){}
 S.nmsg='';close();try{ui()}catch(x){}
 push(true);S.data={};S.at={}}
function act(a){
 if(a=='x')return close();
 if(a=='ref')return load(true);
 if(a=='save')return saveName();
 if(a.indexOf('tab:')==0){S.tab=a.slice(4);render();load(false);return}
 if(a.indexOf('cls:')==0){S.cls=a.slice(4);render();load(false);return}}
window.RK={open,close,push,chars,pows,name:i=>{S.mode='name';S.ni=i|0;S.nmsg='';S.on=true;ov.classList.add('on');render()},nameLeft,realm};
})();
