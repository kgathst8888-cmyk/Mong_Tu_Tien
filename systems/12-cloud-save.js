
/*==== ☁ LƯU GAME TRÊN MẠNG (Supabase) · đăng nhập + đồng bộ + bảng xếp hạng ====
  Điền 2 giá trị dưới đây (xem HUONG_DAN_CLOUD.md). Để trống = game chạy như cũ, chỉ lưu trên máy. */
(function(){
'use strict';
const CFG={url:'https://fdaoswcyhbkzzuwlbrdp.supabase.co',key:'sb_publishable_QJOcJQ3Wy2qU_HlsBQVCIQ_RVLiCedw'}; // khoá publishable (công khai, an toàn khi để trong game)
const OK=!!(CFG.url&&CFG.key);
CFG.url=(CFG.url||'').replace(/\/+$/,'');
const KS='kthm_cloud',KEYS=['kthm2','kthm_qs','kthm_dg'],MAP=[['kthm2','k2'],['kthm_qs','qs'],['kthm_dg','dg']];
const RN=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
const _get=Storage.prototype.getItem,_set=Storage.prototype.setItem,_rem=Storage.prototype.removeItem;
const S={sess:null,meta:null,busy:false,block:false,conflict:null,cf:null,cloud:null,st:OK?'out':'off',err:'',fail:0,next:0,chk:false,vis:0,okAt:0,tab:'acc',view:'',msg:'',em:'',pw:'',lb:null,lbBusy:false,lbErr:'',lbAt:0,bk:false,openCf:false};
const ls=k=>{try{return _get.call(localStorage,k)}catch(e){return null}};
const lsSet=(k,v)=>{try{v==null?_rem.call(localStorage,k):_set.call(localStorage,k,v)}catch(e){}};
Storage.prototype.setItem=function(k,v){if(S.block&&this===localStorage&&KEYS.indexOf(k)>=0)return;return _set.call(this,k,v)};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loadStore(){try{const d=JSON.parse(ls(KS));if(d){S.sess=d.sess||null;S.meta=d.meta||null}}catch(e){}}
function persist(){lsSet(KS,JSON.stringify({sess:S.sess,meta:S.meta}))}
const uid=()=>S.sess&&S.sess.user&&S.sess.user.id;
const mine=()=>S.meta&&S.meta.uid===uid()?S.meta:null;
/* ---------- dữ liệu cục bộ ---------- */
function hashLocal(){let h=5381;for(const k of KEYS){const v=ls(k)||'';for(let i=0;i<v.length;i++)h=((h<<5)+h+v.charCodeAt(i))|0;h=((h<<5)+h+124)|0}return String(h>>>0)}
function pack(){const o={};for(const[k,n]of MAP){try{o[n]=JSON.parse(ls(k))}catch(e){o[n]=null}}return o}
function best(k2){let b=null;((k2&&k2.PS)||[]).forEach((p,i)=>{if(!p)return;const cv=p.cv||{},cr=typeof cv.r=='number'?cv.r:-1,cs=cv.s|0,lv=(p.lv|0)||1,pw=(p.tier|0)*1e6+lv*1e3+((cr+1)*10+cs);if(!b||pw>b.pw)b={i,lv,tier:p.tier|0,br:typeof p.br=='number'?p.br:-1,cr,cs,pw}});return b}
function clsName(b){try{const c=CHR[b.i];return b.br>=0&&c.br&&c.br[b.br]?c.br[b.br].n:(CL[c.t]||c.n)}catch(e){return''}}
function stats(k2){const b=best(k2)||{i:0,lv:1,tier:0,br:-1,cr:-1,cs:0};return{name:(k2&&k2.PS&&k2.PS[b.i]&&k2.PS[b.i].nm)||(k2&&k2.pn)||'Đạo Hữu',cls:clsName(b),lv:b.lv,tier:b.tier,cr:b.cr,cs:b.cs}}
const realm=(cr,cs)=>cr<0?'Sơ Khai':(RN[cr]||'?')+' tầng '+cs;
/* ---------- mạng ---------- */
const hdr=(auth,json)=>{const h={apikey:CFG.key};if(json)h['Content-Type']='application/json';if(auth&&S.sess)h.Authorization='Bearer '+S.sess.access_token;return h};
async function http(path,o){o=o||{};const ctl=typeof AbortController!='undefined'?new AbortController():null,to=setTimeout(()=>{if(ctl)ctl.abort()},o.timeout||25000);let r,tx;
 try{r=await fetch(CFG.url+path,{method:o.method||'GET',headers:Object.assign(hdr(o.auth,o.body!==undefined),o.headers||{}),body:o.body!==undefined?JSON.stringify(o.body):undefined,signal:ctl?ctl.signal:undefined});tx=await r.text()}
 catch(e){const x=new Error(e&&e.name=='AbortError'?'Hết thời gian chờ máy chủ':'Không kết nối được máy chủ');x.net=true;throw x}finally{clearTimeout(to)}
 let j=null;try{j=tx?JSON.parse(tx):null}catch(e){}
 if(!r.ok){const x=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('Lỗi '+r.status));x.status=r.status;x.code=j&&(j.error_code||j.code);throw x}
 return j}
function vi(e){const c=String(e.code||''),m=String(e.message||'').toLowerCase();
 if(e.net)return e.message;
 if(c=='invalid_credentials'||m.indexOf('invalid login')>=0)return 'Sai email hoặc mật khẩu.';
 if(c=='email_not_confirmed'||m.indexOf('not confirmed')>=0)return 'Email chưa xác nhận — hãy mở thư xác nhận rồi đăng nhập lại.';
 if(c=='user_already_exists'||m.indexOf('already registered')>=0)return 'Email này đã đăng ký, hãy đăng nhập.';
 if(c=='weak_password'||m.indexOf('password should')>=0)return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
 if(c=='over_email_send_rate_limit'||e.status===429||m.indexOf('rate limit')>=0)return 'Thao tác quá nhanh, hãy thử lại sau ít phút.';
 if(c=='validation_failed'||m.indexOf('valid email')>=0)return 'Email không hợp lệ.';
 return e.message||'Lỗi không xác định'}
function setSess(j){const now=Date.now()/1000,u=j.user||{},old=(S.sess&&S.sess.user)||{};S.sess={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||(now+(j.expires_in||3600)),user:{id:u.id||old.id,email:u.email||old.email}};persist()}
let rfp=null;
function refresh(){if(rfp)return rfp;rfp=(async()=>{try{const j=await http('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:S.sess.refresh_token}});setSess(j)}catch(e){if(e.status===400||e.status===401||e.status===403)out('Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.');throw e}finally{rfp=null}})();return rfp}
async function tok(){if(!S.sess){const e=new Error('Chưa đăng nhập');e.status=401;throw e}if(S.sess.expires_at*1000-Date.now()<60000)await refresh()}
async function rpc(fn,args){await tok();const go=()=>http('/rest/v1/rpc/'+fn,{method:'POST',auth:true,body:args||{}});try{return await go()}catch(e){if(e.status===401&&S.sess){await refresh();return go()}throw e}}
const redir=()=>/^https?:/.test(location.protocol)?'?redirect_to='+encodeURIComponent(location.origin+location.pathname):'';
async function signUp(em,pw){const j=await http('/auth/v1/signup'+redir(),{method:'POST',body:{email:em,password:pw}});if(j&&j.access_token){setSess(j);return'in'}return'confirm'}
async function signIn(em,pw){const j=await http('/auth/v1/token?grant_type=password',{method:'POST',body:{email:em,password:pw}});setSess(j)}
function out(msg){S.sess=null;S.conflict=null;S.cf=null;S.cloud=null;S.st=OK?'out':'off';S.view='';if(msg)S.msg=msg;persist();ui(true)}
/* ---------- đồng bộ ---------- */
let q=Promise.resolve();
function enq(f){const p=q.then(f);q=p.then(()=>{},()=>{});return p}
async function guard(f){S.busy=true;S.st='busy';ui();try{await f();S.fail=0;S.err='';S.next=Date.now()+30000;if(S.conflict)S.st='conf';else{S.st=S.sess?'ok':'out';S.okAt=Date.now()}}catch(e){S.fail++;S.err=e.net?e.message:vi(e);S.st=S.sess?'err':'out';S.next=Date.now()+Math.min(300000,15000*Math.pow(2,S.fail))}finally{S.busy=false;ui()}}
function reconcile(){if(!OK||!S.sess||S.block)return Promise.resolve();if(S.conflict){S.view='cf';return Promise.resolve()}
 return enq(()=>guard(async()=>{
  if(!S.sess||S.block)return;
  const cl=await rpc('pull_save',{p_meta_only:true}),m=mine(),lh=hashLocal(),hasL=!!ls('kthm2');
  S.cloud=cl.exists?{rev:cl.rev,at:cl.updated_at,bk:cl.has_backup,bkat:cl.backup_at}:null;
  if(!cl.exists){
   if(!hasL){S.meta={uid:uid(),rev:0,hash:lh};persist();return}
   if(S.meta&&S.meta.uid&&S.meta.uid!==uid()&&!confirm('Bản lưu trên máy này đang gắn với tài khoản khác. Tải nó lên tài khoản '+S.sess.user.email+'?'))return;
   return doPush(0,false)}
  if(hasL&&cl.h&&cl.h===lh){S.meta={uid:uid(),rev:cl.rev,hash:lh,at:Date.now()};persist();return}  // máy và mây đang giống hệt nhau
  if(m&&m.rev===cl.rev){if(lh!==m.hash)return doPush(m.rev,false);return}
  if(!hasL||(m&&cl.rev>m.rev&&lh===m.hash))return applyData(await rpc('pull_save',{p_meta_only:false}),hasL?'☁ Đã cập nhật tiến trình từ thiết bị khác':'☁ Đã tải tiến trình từ mây');
  return conflict()
 }))}
async function doPush(base,force){
 const k=pack();if(!k.k2)return;const h=hashLocal(),st=stats(k.k2),bk=S.bk;
 const r=await rpc('push_save',{p_data:{v:1,t:Date.now(),h,k2:k.k2,qs:k.qs,dg:k.dg},p_base_rev:base,p_force:!!force,p_backup:!!bk,p_name:st.name,p_cls:st.cls,p_lv:st.lv,p_tier:st.tier,p_cr:st.cr,p_cs:st.cs});
 if(r&&r.status==='ok'){S.bk=false;S.meta={uid:uid(),rev:r.rev,hash:h,at:Date.now()};persist();S.cloud=Object.assign(S.cloud||{},{rev:r.rev,at:new Date().toISOString()});return}
 return conflict()}
async function conflict(){const full=await rpc('pull_save',{p_meta_only:false});if(!full.exists)return;
 S.conflict=true;S.cf={full,loc:pack().k2};S.view='cf';S.st='conf';
 const mnEl=document.getElementById('mn'),inMenu=typeof started=='undefined'||!started||(mnEl&&mnEl.style.display!=='none');
 if(inMenu||S.openCf)open('acc');else toast('⚠ Bản lưu trên máy ≠ trên mây — mở ☁ trong menu để chọn');S.openCf=false}
function applyData(full,msg){
 const d=full.data||{};
 try{const bak={t:Date.now()};KEYS.forEach(k=>{bak[k]=ls(k)});_set.call(localStorage,'kthm_localbak',JSON.stringify(bak))}catch(e){}
 S.block=true;
 MAP.forEach(([k,n])=>lsSet(k,d[n]==null?null:JSON.stringify(d[n])));
 S.meta={uid:uid(),rev:full.rev,hash:hashLocal(),at:Date.now()};S.conflict=null;S.cf=null;persist();
 try{sessionStorage.setItem('kthm_resume','1')}catch(e){}
 toast(msg||'☁ Đã tải tiến trình từ mây');
 setTimeout(()=>location.reload(),900)}
function tick(){if(!OK||!S.sess||S.busy||S.block||S.conflict||!S.chk||Date.now()<S.next)return;S.chk=false;const m=mine();if(m&&hashLocal()===m.hash)return;reconcile()}
function flush(){try{if(typeof started!='undefined'&&started&&typeof sv=='function')sv()}catch(e){}
 if(!OK||!S.sess||S.block||S.conflict||S.busy)return;const m=mine();if(!m||m.rev<1||hashLocal()===m.hash)return;if(S.sess.expires_at*1000-Date.now()<5000)return;
 const k=pack();if(!k.k2)return;const h=hashLocal(),st=stats(k.k2),body=JSON.stringify({p_data:{v:1,t:Date.now(),h,k2:k.k2,qs:k.qs,dg:k.dg},p_base_rev:m.rev,p_force:false,p_backup:false,p_name:st.name,p_cls:st.cls,p_lv:st.lv,p_tier:st.tier,p_cr:st.cr,p_cs:st.cs});
 try{fetch(CFG.url+'/rest/v1/rpc/push_save',{method:'POST',headers:hdr(true,true),body,keepalive:body.length<60000}).then(r=>r.ok?r.json():null).then(r=>{if(r&&r.status==='ok'){S.meta={uid:m.uid,rev:r.rev,hash:h,at:Date.now()};persist()}}).catch(()=>{})}catch(e){}}
/* ---------- giao diện ---------- */
let ov=null;
function css(){const st=document.createElement('style');st.textContent=`
#cl-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:30;align-items:center;justify-content:center;font-family:'KTH Serif','Songti SC',STKaiti,KaiTi,serif;color:#f2e3b3}
#cl-ov.on{display:flex}
.cl-bx{background:#2a1a12;border:3px solid #b8964e;border-radius:10px;padding:10px;width:min(380px,94vw);max-height:90vh;overflow:auto;font-size:13px;box-sizing:border-box;-webkit-user-select:text;user-select:text}
.cl-h{display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:16px;margin-bottom:8px}
.cl-tabs{display:flex;gap:6px;margin-bottom:8px}.cl-tabs button{flex:1;margin:0!important}
.cl-bx button{margin:4px 4px 0 0;background:#5a4220;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;padding:7px 10px;font:inherit;cursor:pointer}
.cl-bx button.on{background:#8a6428}.cl-bx button:disabled{opacity:.45}
.cl-bx input{width:100%;box-sizing:border-box;margin:4px 0;padding:8px;background:#140d0a;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;font:inherit;font-size:14px;-webkit-user-select:text;user-select:text}
.cl-note{font-size:12px;opacity:.8;margin:6px 0;line-height:1.45}
.cl-msg{margin:6px 0;padding:6px 8px;border-radius:5px;background:#140d0a;border:1px solid #5a4630;font-size:12.5px;line-height:1.45}
.cl-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:middle}
.cl-lb{width:100%;border-collapse:collapse;font-size:12.5px}.cl-lb td{padding:4px 3px;border-bottom:1px solid #4a3622}.cl-lb tr.me{background:#4a3410;font-weight:bold}.cl-lb .r{width:32px;text-align:center;color:#ffd54a}
.cl-cmp{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.cl-cmp>div{background:#140d0a;border:1px solid #5a4630;border-radius:6px;padding:7px;font-size:12px;line-height:1.5}
#cl-toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:31;background:#140d0aee;border:1px solid #b8964e;border-radius:8px;padding:7px 12px;color:#f2e3b3;font:13px 'KTH Serif','Songti SC',serif;display:none;max-width:86vw;text-align:center;pointer-events:none}`;
 document.head.appendChild(st)}
function dom(){ov=document.createElement('div');ov.id='cl-ov';ov.innerHTML='<div class="cl-bx"></div>';document.body.appendChild(ov);
 const t=document.createElement('div');t.id='cl-toast';document.body.appendChild(t);
 ['keydown','keyup','keypress'].forEach(n=>ov.addEventListener(n,e=>{e.stopPropagation();if(n=='keydown'&&e.key==='Enter'&&e.target&&e.target.id=='cl-pw'&&S.view!='rec')act('in')}));
 ov.addEventListener('input',e=>{const i=e.target&&e.target.id;if(i=='cl-em')S.em=e.target.value;else if(i=='cl-pw')S.pw=e.target.value});
 ov.addEventListener('click',e=>{let n=e.target;while(n&&n!==ov&&!(n.getAttribute&&n.getAttribute('data-a')))n=n.parentNode;if(n&&n!==ov){act(n.getAttribute('data-a'))}else if(e.target===ov)close()})}
let tt=0;function toast(m){const t=document.getElementById('cl-toast');if(!t)return;t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>{t.style.display='none'},3200)}
function open(tab){if(!ov)return;if(tab)S.tab=tab;ov.classList.add('on');render();if(S.tab=='lb'&&Date.now()-S.lbAt>20000)loadLb()}
function close(){if(ov)ov.classList.remove('on')}
const COL={off:'#777',out:'#888',busy:'#e8b84a',ok:'#6fd36f',err:'#e05a4a',conf:'#e8b84a'};
const fmt=t=>{try{return new Date(t).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}catch(e){return''}};
function stText(){return S.st=='off'?'Chưa cấu hình':S.st=='out'?'Chưa đăng nhập':S.st=='busy'?'Đang đồng bộ…':S.st=='ok'?'Đã đồng bộ'+(S.okAt?' lúc '+fmt(S.okAt):''):S.st=='conf'?'Cần chọn bản lưu (máy ≠ mây)':'Lỗi: '+S.err+' (sẽ tự thử lại)'}
function mb(){const x=document.getElementById('cl-mb');if(x)x.innerHTML='<span class="cl-dot" style="background:'+COL[S.st]+'"></span>☁ Tài khoản &amp; Xếp hạng'}
function inject(){const b=document.querySelector('#mn .bx');if(!b||b.querySelector('#cl-mb')||b.querySelector('#pn'))return;const x=document.createElement('button');x.id='cl-mb';x.style.cssText='width:100%;padding:12px';x.onclick=()=>open('acc');b.appendChild(x);mb()}
function ui(force){mb();if(!ov||!ov.classList.contains('on'))return;const a=document.activeElement;if(!force&&a&&a.tagName=='INPUT'&&ov.contains(a))return;render()}
const msgBox=()=>S.msg?'<div class="cl-msg">'+esc(S.msg)+'</div>':'';
function sumHtml(k2,t){const s=stats(k2);return'<b>'+esc(s.name)+'</b><br>'+esc(s.cls)+' · Lv '+s.lv+'<br>'+esc(realm(s.cr,s.cs))+'<br>💰 '+(Number(k2&&k2.gold)||0).toLocaleString('vi-VN')+(t?'<br><small>'+esc(t)+'</small>':'')}
function viewAcc(){
 if(!OK)return'<div class="cl-msg">Chưa cấu hình máy chủ. Mở file game, tìm <b>const CFG</b> trong khối “LƯU GAME TRÊN MẠNG” và điền <b>url</b> + <b>key</b> của Supabase (xem HUONG_DAN_CLOUD.md). Khi chưa cấu hình, game vẫn lưu trên máy như bình thường.</div>';
 if(S.view=='rec')return'<div class="cl-note">Đặt mật khẩu mới cho tài khoản của bạn.</div><input id="cl-pw" type="password" placeholder="Mật khẩu mới (từ 6 ký tự)" autocomplete="new-password" value="'+esc(S.pw)+'">'+msgBox()+'<button data-a="setpw">Đổi mật khẩu</button>';
 if(!S.sess)return'<div class="cl-note">Đăng nhập để lưu tiến trình lên mạng và chơi trên nhiều thiết bị. Không đăng nhập vẫn chơi bình thường (lưu trên máy).</div><input id="cl-em" type="email" inputmode="email" autocomplete="username" placeholder="Email" value="'+esc(S.em)+'"><input id="cl-pw" type="password" autocomplete="current-password" placeholder="Mật khẩu (từ 6 ký tự)" value="'+esc(S.pw)+'">'+msgBox()+'<button data-a="in">Đăng nhập</button><button data-a="up">Đăng ký</button><button data-a="fg">Quên mật khẩu?</button>';
 let h='<div class="cl-msg"><span class="cl-dot" style="background:'+COL[S.st]+'"></span>'+esc(stText())+'</div><div class="cl-note">Tài khoản: <b>'+esc(S.sess.user.email)+'</b>'+(S.cloud&&S.cloud.at?'<br>Bản trên mây: cập nhật '+esc(fmt(S.cloud.at)):'')+'</div>'+msgBox();
 if(S.conflict)h+='<button data-a="cf">⚠ Chọn bản lưu</button>';
 h+='<button data-a="sync">🔄 Đồng bộ ngay</button><button data-a="bk"'+(S.cloud&&S.cloud.bk?'':' disabled')+'>🕘 Khôi phục bản sao lưu</button><button data-a="out">Đăng xuất</button><div class="cl-note">Tự đồng bộ khoảng 30 giây một lần khi có thay đổi, và khi bạn rời trang. Mất mạng vẫn chơi bình thường, có mạng lại sẽ tự đồng bộ.</div>';return h}
function viewCf(){const f=S.cf;if(!f)return viewAcc();const c=f.full;
 return'<div class="cl-msg">⚠ Tiến trình trên máy này và trên mây khác nhau. Chọn bản muốn giữ — bản còn lại sẽ bị thay thế (có bản sao lưu để khôi phục).</div><div class="cl-cmp"><div>📱 <b>Trên máy này</b><br>'+sumHtml(f.loc)+'</div><div>☁ <b>Trên mây</b><br>'+sumHtml(c.data&&c.data.k2,fmt(c.updated_at))+'</div></div><button data-a="useCloud">☁ Dùng bản trên mây</button><button data-a="useLocal">📱 Dùng bản trên máy này</button><button data-a="later">Để sau</button>'}
function row(r){const m=['🥇','🥈','🥉'][r.rank-1]||r.rank;return'<tr class="'+(r.me?'me':'')+'"><td class="r">'+m+'</td><td>'+esc(r.name)+'<br><small style="opacity:.75">'+esc(r.cls||'')+' · Lv '+(r.lv|0)+' · '+esc(realm(r.cult_r|0,r.cult_s|0))+'</small></td></tr>'}
function viewLb(){if(!OK)return viewAcc();let h='<div class="cl-note">Xếp theo: bậc › cấp độ › cảnh giới tu luyện (nhân vật mạnh nhất của mỗi tài khoản).</div>';
 if(S.lbBusy&&!S.lb)h+='<div class="cl-msg">Đang tải…</div>';if(S.lbErr)h+='<div class="cl-msg">⚠ '+esc(S.lbErr)+'</div>';
 const L=S.lb;if(L){const top=L.top||[];h+=top.length?'<table class="cl-lb">'+top.map(row).join('')+'</table>':'<div class="cl-msg">Chưa có ai trên bảng xếp hạng.</div>';
  if(L.me&&!top.some(r=>r.me))h+='<div class="cl-note">Hạng của bạn:</div><table class="cl-lb">'+row(Object.assign({me:true},L.me))+'</table>';
  h+='<div class="cl-note">Tổng '+(L.total|0)+' người chơi'+(S.sess?'':' · đăng nhập để có tên trên bảng')+'</div>'}
 return h+'<button data-a="lbr"'+(S.lbBusy?' disabled':'')+'>🔄 Làm mới</button>'}
function render(){const b=ov&&ov.querySelector('.cl-bx');if(!b)return;
 b.innerHTML='<div class="cl-h"><span>☁ Tài khoản &amp; Xếp hạng</span><button data-a="x">✕</button></div><div class="cl-tabs"><button data-a="tab:acc" class="'+(S.tab=='acc'?'on':'')+'">Tài khoản</button><button data-a="tab:lb" class="'+(S.tab=='lb'?'on':'')+'">Xếp hạng</button></div>'+(S.tab=='lb'?viewLb():S.view=='cf'?viewCf():viewAcc())}
async function loadLb(){S.lbBusy=true;S.lbErr='';render();try{S.lb=S.sess?await rpc('get_leaderboard',{p_limit:50}):await http('/rest/v1/rpc/get_leaderboard',{method:'POST',body:{p_limit:50}});S.lbAt=Date.now()}catch(e){S.lbErr=e.net?e.message:vi(e)}S.lbBusy=false;render()}
function afterLogin(){S.msg='';S.pw='';S.openCf=true;S.next=0;S.st='busy';ui(true);reconcile()}
async function doAuth(kind){const em=(S.em||'').trim(),pw=S.pw||'';if(!em||pw.length<6){S.msg=!em?'Nhập email.':'Mật khẩu cần từ 6 ký tự.';render();return}
 S.msg='Đang xử lý…';render();
 try{if(kind=='in')await signIn(em,pw);else{const r=await signUp(em,pw);if(r=='confirm'){S.msg='Đã gửi thư xác nhận tới '+em+'. Mở thư, bấm liên kết xác nhận rồi quay lại đây đăng nhập. (Nếu email đã đăng ký, hãy chọn Đăng nhập.)';render();return}}afterLogin()}
 catch(e){S.msg=vi(e);render()}}
async function doRecover(){const em=(S.em||'').trim();if(!em){S.msg='Nhập email trước rồi bấm “Quên mật khẩu?”.';render();return}
 try{await http('/auth/v1/recover'+redir(),{method:'POST',body:{email:em}});S.msg='Nếu email này đã đăng ký, thư đặt lại mật khẩu đã được gửi.'}catch(e){S.msg=vi(e)}render()}
async function doSetPw(){const pw=S.pw||'';if(pw.length<6){S.msg='Mật khẩu cần từ 6 ký tự.';render();return}
 try{await http('/auth/v1/user',{method:'PUT',auth:true,body:{password:pw}});S.view='';toast('Đã đổi mật khẩu');afterLogin()}catch(e){S.msg=vi(e);render()}}
async function logout(){if(!confirm('Đăng xuất? Bản lưu trên máy vẫn được giữ.'))return;try{if(!S.conflict)await reconcile()}catch(e){}try{await http('/auth/v1/logout',{method:'POST',auth:true,timeout:6000})}catch(e){}S.msg='';out('')}
function manual(){S.msg='';if(S.conflict){S.view='cf';render();return}S.openCf=true;S.next=0;reconcile().then(()=>{if(S.st=='ok')toast('☁ Đã đồng bộ')})}
function restoreBk(){if(!confirm('Khôi phục bản sao lưu trên mây? Bản hiện tại sẽ trở thành bản sao lưu (có thể đổi lại).'))return;
 enq(()=>guard(async()=>{const r=await rpc('restore_backup',{});if(!r||r.status!=='ok')throw new Error('Chưa có bản sao lưu');applyData({data:r.data,rev:r.rev},'☁ Đã khôi phục bản sao lưu')}))}
function act(a){
 if(a=='x')return close();
 if(a.indexOf('tab:')==0){S.tab=a.slice(4);S.msg='';render();if(S.tab=='lb'&&Date.now()-S.lbAt>20000)loadLb();return}
 if(a=='in'||a=='up')return doAuth(a);if(a=='fg')return doRecover();if(a=='setpw')return doSetPw();
 if(a=='sync')return manual();if(a=='out')return logout();if(a=='bk')return restoreBk();if(a=='lbr')return loadLb();
 if(a=='cf'){S.view='cf';return render()}
 if(a=='later'){S.view='';return render()}
 if(a=='useCloud'){if(S.cf)applyData(S.cf.full);return}
 if(a=='useLocal'){if(!S.cf||!confirm('Ghi đè bản trên mây bằng bản trên máy này? (Bản mây hiện tại được giữ làm bản sao lưu)'))return;
  const base=S.cf.full.rev;S.conflict=null;S.cf=null;S.view='';S.st='busy';render();enq(()=>guard(()=>doPush(base,true))).then(()=>toast('☁ Đã ghi đè bản trên mây'));return}}
async function consumeHash(){const h=location.hash;if(!h||!/access_token=|error_description=/.test(h))return;const p=new URLSearchParams(h.slice(1));
 try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
 if(p.get('error_description')){S.msg=p.get('error_description').replace(/\+/g,' ');open('acc');return}
 const at=p.get('access_token'),rt=p.get('refresh_token');if(!at||!rt)return;
 try{const u=await http('/auth/v1/user',{headers:{Authorization:'Bearer '+at}});setSess({access_token:at,refresh_token:rt,expires_in:+p.get('expires_in')||3600,user:u});
  if(p.get('type')=='recovery'){S.view='rec';S.msg='';open('acc')}else{toast('☁ Đã xác nhận email, đang đồng bộ…');afterLogin()}}
 catch(e){S.msg=vi(e);open('acc')}}
/* ---------- khởi động ---------- */
loadStore();css();dom();
/* Bọc sv/ng/mn SAU CÙNG (khi mọi script khác đã chạy xong) để nằm lớp ngoài cùng: bấm Huỷ ở hộp xác nhận "Game mới" thì các lớp bọc khác (reset hầm mỏ, linh điền, cẩm nang…) không kịp chạy. */
function wrapAll(){
const _mn=window.mn;if(typeof _mn=='function')window.mn=function(){const r=_mn.apply(this,arguments);try{inject()}catch(e){}return r};
const _sv=window.sv;if(typeof _sv=='function')window.sv=function(){if(S.block)return;const r=_sv.apply(this,arguments);S.chk=true;return r};
const _ng=window.ng;if(typeof _ng=='function')window.ng=function(){const m=mine();if(S.sess&&m&&m.rev>0){if(!confirm('Bạn đang đăng nhập ☁. Bắt đầu game mới sẽ ghi đè tiến trình trên mây ở lần đồng bộ tới (có bản sao lưu để khôi phục). Tiếp tục?'))return;S.bk=true}return _ng.apply(this,arguments)};
inject();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrapAll);else wrapAll();
if(OK){
 setInterval(tick,5000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();else if(S.sess&&Date.now()-S.vis>60000){S.vis=Date.now();S.next=0;reconcile()}});
 addEventListener('pagehide',flush);
 addEventListener('online',()=>{if(S.sess){S.next=0;S.chk=true}});
 setTimeout(()=>{consumeHash();if(S.sess){S.vis=Date.now();reconcile()}},1200)}
try{if(sessionStorage.getItem('kthm_resume')){sessionStorage.removeItem('kthm_resume');setTimeout(()=>{try{if(ls('kthm2')&&typeof ld=='function')ld()}catch(e){}},400)}}catch(e){}
window.KTHM_CLOUD={open:t=>open(t||'acc'),sync:()=>reconcile(),status:()=>S.st};window.KCL={OK,rpc,http,sess:()=>S.sess};
if(window.__CLOUD_TEST)window.__CLOUD_TEST_API={S,reconcile,act,tick,flush,render,open,loadLb,doAuth,hashLocal,mine,applyData,stats,toast};
})();
