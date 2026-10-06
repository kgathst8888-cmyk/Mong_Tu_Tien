/* ===== ĐẤU TRƯỜNG v1 =====
   PvE/simulation foundation: không phá combat hiện tại.
   Có thể nối backend thật sau này qua ArenaAPI.
*/
(function(){
'use strict';
var KEY='kthm2_arena_v1', ov=null, state=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function load(){try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){state=null}if(!state||typeof state!=='object')state={points:1000,wins:0,losses:0,streak:0,season:1,last:0,today:0,day:''};var d=new Date().toISOString().slice(0,10);if(state.day!==d){state.day=d;state.today=0;save()}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function power(){try{return Math.max(1,Math.round((atk?atk()*5:100)+(df?df():50)*.55+(mx?mx():500)*.08))}catch(e){return 100}}
function pname(){try{return (PS&&PS[cur]&&(PS[cur].nm||PS[cur].name))||pn||'Đạo Hữu'}catch(e){return 'Đạo Hữu'}}
function realm(){try{return typeof ZC!='undefined'&&ZC.nm?ZC.nm():'Tu sĩ'}catch(e){return 'Tu sĩ'}}
function opponents(){var p=power(),base=Math.max(300,p);var names=['Huyền Vũ Kiếm Tôn','Thanh Liên Tiên Tử','Ma Đạo Cuồng Nhân','Thiên Cơ Đạo Nhân','U Minh Thánh Nữ','Cửu Thiên Kiếm Khách'];var out=[];for(var i=0;i<5;i++){var mul=.84+i*.08+(Math.random()-.5)*.08;out.push({id:i,n:names[(i+state.season)%names.length],pw:Math.max(100,Math.round(base*mul)),lv:Math.max(1,Math.round((P&&P.lv||1)*(0.9+i*.04))),rank:Math.max(1,Math.round(50+i*18))})}return out}
function rollBattle(me,op){var mh=Math.max(100,(mx?mx():500)),oh=Math.max(100,Math.round(mh*(op.pw/me.pw)*(.85+Math.random()*.3)));var ma=Math.max(1,me.pw*.18),oa=Math.max(1,op.pw*.18);var mr=mh,or=oh,round=0,log=[];while(mr>0&&or>0&&round<18){round++;var md=Math.max(1,Math.round(ma*(.72+Math.random()*.45)));var od=Math.max(1,Math.round(oa*(.72+Math.random()*.45)));or-=md;log.push('Lượt '+round+': '+esc(pname())+' gây '+md+' sát thương.');if(or<=0)break;mr-=od;log.push('Đối thủ phản kích '+od+'.')}return{win:or<=0,round:round,log:log,mh:Math.max(0,mr),oh:Math.max(0,or)}}
function reward(win){var pts=win?18:7;state.points=Math.max(0,state.points+(win?pts:-12));if(win){state.wins++;state.streak++;gold=(gold|0)+250+state.streak*20;frag=(frag|0)+(state.streak%3===0?1:0)}else{state.losses++;state.streak=0}state.today++;save();try{sv()}catch(e){}return pts}
function rank(){return Math.max(1,Math.round(1200-Math.max(0,state.points-1000)*.9))}
function open(){load();if(!ov)build();ov.classList.add('on');render()}
function close(){if(ov)ov.classList.remove('on')}
function build(){ov=document.createElement('div');ov.id='arena-ov';ov.innerHTML='<div class="arena-bx"><div class="arena-h"><span>⚔️ Đấu Trường</span><button id="arena-x">✕</button></div><div id="arena-c"></div></div>';document.body.appendChild(ov);document.getElementById('arena-x').onclick=close}
function render(){load();var c=ov.querySelector('#arena-c'),me=power(),ops=opponents(),left=Math.max(0,10-(state.today|0));c.innerHTML='<div class="arena-st"><b>'+esc(pname())+'</b><br><small>'+esc(realm())+' · Lực chiến '+me.toLocaleString()+' · Điểm '+state.points+' · Hạng #'+rank()+'</small><br><small>🏆 Thắng '+state.wins+' · Thua '+state.losses+' · 🔥 Chuỗi '+state.streak+' · Lượt hôm nay '+left+'/10</small></div>'+ops.map(function(o){var dis=left<=0?'disabled':'';return '<div class="arena-op"><div><b>'+esc(o.n)+'</b><br><small>Lv '+o.lv+' · Lực chiến '+o.pw.toLocaleString()+' · Hạng #'+o.rank+'</small></div><button data-id="'+o.id+'" '+dis+'>⚔️ Khiêu chiến</button></div>'}).join('')+'<div class="arena-note">💡 Đây là bản Đấu Trường mô phỏng an toàn cho bản game hiện tại. Dữ liệu trận đấu đang lưu trên máy; có thể chuyển sang server thật ở bước multiplayer.</div>'}
function challenge(id){load();if(state.today>=10){alert('Đã hết 10 lượt Đấu Trường hôm nay.');return}var o=opponents().find(function(x){return x.id==id});if(!o)return;var me=power(),r=rollBattle(me,o),pts=reward(r.win);render();var c=ov.querySelector('#arena-c'),old=c.innerHTML;c.innerHTML='<div class="arena-result '+(r.win?'win':'lose')+'"><h3>'+(r.win?'🏆 CHIẾN THẮNG!':'💀 THẤT BẠI')+'</h3><div>'+esc(pname())+' <b>'+me.toLocaleString()+'</b> ⚔️ '+esc(o.n)+' <b>'+o.pw.toLocaleString()+'</b></div><p>'+(r.win?'+'+pts+' điểm · nhận phần thưởng':'-12 điểm · bảo toàn phần thưởng')+'</p><div class="arena-log">'+r.log.slice(0,10).map(esc).join('<br>')+'</div><button id="arena-back">↩ Quay lại Đấu Trường</button></div>';document.getElementById('arena-back').onclick=render}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#arena-c [data-id]');if(b)challenge(+b.dataset.id)});
window.Arena={open:open,close:close,save:save,load:load,api:{challenge:challenge}};
function addButton(){var b=document.createElement('button');b.id='arena-btn';b.className='sb';b.title='Đấu Trường';b.innerHTML='⚔️<small>Đấu</small>';b.onclick=open;document.body.appendChild(b)}
function init(){load();addButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
