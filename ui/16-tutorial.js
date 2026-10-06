
(function(){
const K='kthm_tut',qc=()=>((QS&&QS.T&&QS.T.cast)|0),sig=()=>EQ.map(i=>i?i.n+'|'+i.u:'').join(),ST=()=>typeof started!=='undefined'&&started;
const S=[
{t:'Chào mừng, đạo hữu!',x:'Ta là <b>Trưởng Lão Thanh Vân</b>. Hư Không nứt vỡ, quái vật tràn vào Hoang Mạc. Ta sẽ chỉ ngươi từng bước, làm xong có quà.',btn:'Bắt đầu'},
{t:'Đánh quái tự động',x:'Nút <b>AUTO</b> giúp nhân vật tự đánh. Hãy để AUTO bật và hạ <b>5 quái</b>.',sel:'#au',f:1,base:()=>NK,ok:b=>NK-b>=5,prog:b=>'Đã hạ '+Math.max(0,Math.min(5,NK-b))+'/5'},
{t:'Dùng kỹ năng',x:'Các nút tròn bên phải là <b>kỹ năng</b> (tốn MP), nút lớn là <b>tuyệt kỹ</b>. Hãy thi triển <b>3 chiêu</b> (AUTO cũng tính).',sel:'#sk .sb',f:1,base:qc,ok:b=>qc()-b>=3,prog:b=>'Đã dùng '+Math.max(0,Math.min(3,qc()-b))+'/3'},
{t:'Mở túi · Nhân vật',x:'Chạm 🎒 để mở menu, rồi vào tab <b>Nhân vật</b> xem chỉ số.',tab:1,ok:()=>bo&&tab==1},
{t:'Cộng điểm tiềm năng',x:'Mỗi cấp được điểm. <b>Lực</b> +công · <b>Thể</b> +HP/thủ · <b>Linh</b> +MP · <b>Mẫn</b> +bạo kích. Chạm nút <b>+</b> để cộng.',tab:1,sel:'#bag .ar button.sm:not([disabled])',skip:()=>PS[cur].pts<1,base:()=>PS[cur].pts,ok:b=>PS[cur].pts<b},
{t:'Mặc trang bị',x:'Quái rơi đồ. Chạm một món trong túi rồi bấm <b>Mặc</b> (chữ xanh = mạnh hơn). Viền màu là phẩm chất: Thường → Thiên Thần.',tab:0,sel:['#bag .ipa button','#bag [onclick^="pk(\'b\'"]'],skip:()=>BAG.length<1,base:sig,ok:b=>sig()!==b},
{t:'Nhiệm vụ chủ tuyến',x:'Tab ❗ <b>Nhiệm vụ</b>: chương 1 cần hạ 20 quái và đạt Lv5. Đủ điều kiện thì bấm nhận thưởng (cứ đánh tiếp rồi quay lại).',tab:5,sel:'#bag .qa button:not([disabled])',base:()=>QS.ch,ok:b=>QS.ch>b},
{t:'Về Làng',x:'Làng có Thợ rèn, Tạp hóa, Dược điếm, chuyển chức... Bấm 🏘 để về Làng (HP/MP hồi đầy).',sel:'#vl',ok:()=>vil},
{t:'Mua thuốc',x:'Ở tab <b>Dược</b> mua bình HP/MP. Game tự uống khi HP dưới 35% hoặc MP dưới 20%.',v:1,tab:4,sel:'#bag [onclick="bp(0,1)"]',base:()=>hpP+mpP,ok:b=>hpP+mpP>b},
{t:'Tu tiên',x:'Tab 🧘 <b>Tu tiên</b>: tu vi tăng khi hạ quái. Đầy thì bấm <b>Đột phá</b> (100💰) lên Luyện Khí. Tu tiên <b>không phụ thuộc cấp</b> nhân vật.',tab:8,sel:'#bag .dt button:not([disabled])',btn:'Đã hiểu',ok:()=>PS[cur].cv.r>=0},
{t:'Mục tiêu tiếp theo',x:'<b>Lv20:</b> chuyển chức (tab ❗) mở nhánh nghề, kỹ năng, thú 🐾. <b>🕳 Hầm Ngục</b> mở mỗi 5 phút. <b>Boss Thế Giới</b> mỗi 30 phút rơi 🔹. Cần xem lại thì mở 📖 Cẩm nang.',btn:'Nhận quà (500💰, 5 bình HP, 5 bình MP)',fin:1}
];
let st=null,en=-1,B=0;try{st=JSON.parse(localStorage.getItem(K))}catch(e){}
const wr=()=>{try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}};
const mk=(t,id)=>{const e=document.createElement(t);e.id=id;document.body.appendChild(e);return e},card=mk('div','tut'),ring=mk('div','tut-r'),arr=mk('div','tut-a');
function hide(){card.style.display=ring.style.display=arr.style.display='none'}
function finish(r){if(r){gold+=500;hpP+=5;mpP+=5;try{DT.push({x:P.x,y:200,s:'🎁 Hoàn thành hướng dẫn!',g:1,l:160})}catch(e){}try{sv()}catch(e){}}st.d=1;wr();hide()}
function go(i){if(i>=S.length)return finish(0);st.s=i;wr();en=-1}
function draw(){const s=S[st.s];card.innerHTML='<div class="th"><b>🎓 '+s.t+'</b><span><small>'+(st.s+1)+'/'+S.length+'</small> <a id="tut-m">▾</a></span></div><div class="tb">'+s.x+'<div class="tp" id="tut-p"></div><div class="tt" id="tut-h"></div></div><div class="ta">'+(s.btn?'<button id="tut-n">'+s.btn+'</button>':'')+'<a id="tut-s">Bỏ qua bước</a><a id="tut-x">Tắt</a></div>';
card.querySelector('#tut-m').onclick=()=>card.classList.toggle('mini');
const n=card.querySelector('#tut-n');if(n)n.onclick=()=>s.fin?finish(1):go(st.s+1);
card.querySelector('#tut-s').onclick=()=>go(st.s+1);
card.querySelector('#tut-x').onclick=()=>gcf('Tắt hướng dẫn tân thủ?\nBạn có thể bật lại trong menu chính hoặc trong 📖 Cẩm nang.',()=>{st.d=1;wr();hide()})}
function find(sel){for(const q of [].concat(sel||[])){const e=document.querySelector(q);if(e){const r=e.getBoundingClientRect();if(r.width>4&&r.height>4)return e}}return null}
function target(s){if(s.f){if(vil)return{sel:'#vl',m:'Bấm 🏘 để ra bản đồ chiến đấu'};if(bo)return{sel:'#bag .ib.x',m:'Đóng túi để quay lại chiến đấu'}}
if(s.v&&!vil)return{sel:'#vl',m:'Bấm 🏘 để về Làng'};
if(s.tab!=null){if(!bo)return{sel:'#bg',m:'Chạm 🎒 để mở túi'};if(tab!=s.tab)return{sel:'#bag .tbt[onclick="tb('+s.tab+')"]',m:'Chọn tab này'}}
return{sel:s.sel,m:''}}
function tick(){const g=document.getElementById('gdp');
if(!st||st.d||!ST()||(g&&g.classList.contains('on'))){hide();return}
const s=S[st.s];if(!s){finish(0);return}
if(en!==st.s){en=st.s;B=s.base?s.base():0;if(s.skip&&s.skip())return go(st.s+1);draw()}
if(s.ok&&s.ok(B))return go(st.s+1);
card.style.display='block';card.classList.toggle('bo',!!bo);
const p=card.querySelector('#tut-p');if(p)p.textContent=s.prog?s.prog(B):'';
const T=target(s),e=find(T.sel),h=card.querySelector('#tut-h');if(h)h.textContent=T.m?'👉 '+T.m:'';
if(e){const r=e.getBoundingClientRect();ring.style.cssText='display:block;left:'+(r.left-4)+'px;top:'+(r.top-4)+'px;width:'+(r.width+2)+'px;height:'+(r.height+2)+'px';
const up=r.top<110;arr.textContent=up?'👆':'👇';arr.style.cssText='display:block;left:'+(r.left+r.width/2-14)+'px;top:'+(up?r.bottom+4:r.top-36)+'px'}else{ring.style.display=arr.style.display='none'}}
setInterval(tick,250);
window.TUT={start(){st={s:0,d:0};wr();en=-1;try{if(typeof cm=='function')cm()}catch(e){}},active:()=>!!st&&!st.d};
setTimeout(()=>{if(!st&&ST()&&P.lv<=5)TUT.start()},2500);
/* nút bật lại */
function inject(){const b=document.querySelector('#mn .bx');if(!b||b.querySelector('#tut-mb')||b.querySelector('#pn'))return;const x=document.createElement('button');x.id='tut-mb';x.textContent='🎓 Hướng dẫn tân thủ';x.style.cssText='width:100%;padding:12px';x.onclick=()=>TUT.start();b.appendChild(x)}
const _m=window.mn;if(typeof _m=='function')window.mn=function(){const r=_m.apply(this,arguments);try{inject()}catch(e){}return r};try{inject()}catch(e){}
const h=document.querySelector('#gdp .gdh');if(h){const b=document.createElement('button');b.textContent='🎓';b.title='Làm lại hướng dẫn tân thủ';b.style.marginLeft='auto';b.style.marginRight='6px';b.onclick=()=>{GD.close();TUT.start()};h.insertBefore(b,h.lastElementChild)}
})();
