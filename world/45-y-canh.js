/* ===== 🌌 Ý CẢNH · TIÊN ĐẠO / MA ĐẠO =====
 * Cửa vào: Thành Thị Linh Giới → cổng "Hợp Đạo Đài" → khối "🌌 Ý Cảnh" trong bảng (world/33-hop-dao.js gọi YCANH.mini()).
 * Điều kiện bắt đầu: cảnh giới Luyện Hư trở lên (PS[cur].cv.r >= CF.needR = 5); nhân vật đã Hợp Đạo (Đạo Thể) cũng được vì đã vượt cảnh giới phàm thể.
 * Chỉ chọn 1 trong 2 đạo, không đổi lại. Chọn xong có ngay Ý Cảnh cấp 1 (cảnh giới 1 · Hạ).
 * Mỗi đạo 5 cảnh giới × 3 tiểu cảnh (Hạ / Trung / Thượng) → Ý Cảnh cấp 1–15. Dữ liệu: PS[cur].yc = {p:'t'|'m', r:1..5, s:0..2, t:ms}.
 * Hiệu ứng: MỌI sát thương từ kỹ năng + Thần Thông (engine dm() với cờ SKF=1; đánh thường không tính) sinh thêm 1 sát thương phụ =
 *   CF.pct[r-1] % sát thương vừa gây (10/20/30/40/50% theo cảnh giới). Ma Đạo: số màu ĐEN viền tím · Tiên Đạo: số VÀNG sáng viền cam.
 *   Engine vẽ số sát thương đọc thêm d.sc (màu viền) — patch 1 chữ trong core/01-engine.js.
 * Cách tu luyện: CHƯA làm (sẽ cập nhật sau). Đã chừa sẵn YCANH.up(n) để nâng n tiểu cảnh, YCANH.info() để đọc trạng thái.
 * Chưa làm: khắc chế PvP giữa 2 đạo (tin nhắn yêu cầu lần này không nhắc). Chỉnh số liệu: khối CF.
 * Phụ thuộc: dm/SKF/SZ/DT/PT/R/sv/ui (engine), HDAO (33, tuỳ chọn). Bảng Hợp Đạo Đài gọi YCANH.mini() / YCANH.open(). */
(function(){
'use strict';
if(typeof dm!=='function'||typeof PS==='undefined')return;
var CF={needR:5,pct:[10,20,30,40,50]};   /* needR: chỉ số PS[cur].cv.r của Luyện Hư (tên cảnh giới = RNL[r+1]; r=-1 là Sơ Khai) */
var RNL=['Sơ Khai','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hoá Thần','Luyện Hư','Hợp Thể','Đại Thừa'];
var SUB=['Hạ','Trung','Thượng'];
var K={
 t:{nm:'Tiên Đạo',ic:'☯',col:'#ffd84a',fill:'#ffe24a',stroke:'#ff9a00',part:['#fff3b0','#ffd84a'],bg:'linear-gradient(135deg,#3a2a08,#150e04)',bd:'#d8a830',
    names:['Thập Niệm Kính Cảnh','Vô Ngã Vô Tướng','Tự Nhiên Lĩnh Vực','Ý Quá Vạn Vật','Quy Nhất Viên Mãn'],fx:'sát thương phụ ánh vàng sáng rực'},
 m:{nm:'Ma Đạo',ic:'🌑',col:'#c8a0ff',fill:'#0c0614',stroke:'#b070ff',part:['#1a1024','#7a40c0'],bg:'linear-gradient(135deg,#1e0c30,#08040f)',bd:'#8a50d0',
    names:['Ma Sát Khơi Tâm','Dục Nương Thành Hình','Chủ Tể Lĩnh Vực','Vạn Niệm Câu Hồn','Thái Sơ Ngược Đạo'],fx:'sát thương phụ màu đen'}
};

/* ---------- dữ liệu ---------- */
function Y(){var p=PS[cur],y=p&&p.yc;if(!y||!K[y.p])return null;y.r=Math.min(5,Math.max(1,y.r|0||1));y.s=Math.min(2,Math.max(0,y.s|0));return y}
function lvl(y){return (y.r-1)*3+y.s+1}
function pct(y){return CF.pct[y.r-1]}
function realmIdx(){var c=PS[cur]&&PS[cur].cv;return c&&typeof c.r==='number'?c.r:-1}
function realmOk(){try{if(window.HDAO&&HDAO.on&&HDAO.on())return true}catch(e){}return realmIdx()>=CF.needR}
function realmName(){return RNL[Math.min(RNL.length-1,Math.max(0,realmIdx()+1))]}
function save(){try{sv()}catch(e){}}
function info(){var y=Y();return y?{path:y.p,realm:y.r,sub:y.s,level:lvl(y),pct:pct(y),name:K[y.p].names[y.r-1]}:null}
/* nâng n tiểu cảnh (dùng cho cách tu luyện sẽ làm sau) — trả về true nếu có thay đổi */
function up(n){var y=Y();if(!y)return false;n=n||1;var c=false;while(n-->0){if(y.r>=5&&y.s>=2)break;y.s++;if(y.s>2){y.s=0;y.r++}c=true}if(c){save();render()}return c}

/* ---------- sát thương phụ ---------- */
var _dm=dm;dm=function(e,m,sl){var y=null,h0=0;if(SKF&&e){y=Y();if(y)h0=e.hp}
  var r=_dm.apply(this,arguments);
  if(y){try{var dealt=h0-e.hp;if(dealt>0&&e.hp>0){var ex=Math.max(1,Math.round(dealt*pct(y)/100)),c=K[y.p];e.hp-=ex;
    DT.push({x:e.x+12,y:(e.hh||100)*SZ+26,s:ex,c:c.fill,sc:c.stroke,l:55});
    for(var i=0;i<3;i++)PT.push({x:e.x,y:60,vx:(R()-.5)*4,vy:R()*-3,l:24,c:c.part[i&1]})}}catch(x){}}
  return r};

/* ---------- giao diện ---------- */
var ov=null,cssOk=false;
function css(){if(cssOk)return;cssOk=true;var s=document.createElement('style');s.textContent='#yc-ov{position:fixed;inset:0;z-index:31;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,rgba(50,25,80,.93),rgba(6,3,10,.97));color:#eadcff;font-family:system-ui,sans-serif;padding:12px;box-sizing:border-box}#yc-ov .bx{max-width:440px;width:100%;max-height:94%;overflow-y:auto;border:2px solid #8a60c8;border-radius:14px;background:rgba(14,9,22,.92);padding:14px}#yc-ov h2{margin:0 0 4px;font-size:20px;color:#e0c8ff;text-align:center}#yc-ov .cd{border:2px solid;border-radius:12px;padding:10px;margin:8px 0}#yc-ov .cd b.n{font-size:16px}#yc-ov ol{margin:6px 0 4px;padding-left:20px;font-size:12.5px;line-height:1.55}#yc-ov button{width:100%;padding:10px;border:0;border-radius:9px;font-weight:700;font-size:14.5px;color:#fff;margin-top:6px}#yc-ov .row{display:flex;gap:6px;margin:6px 0}#yc-ov .sd{flex:1;height:9px;border-radius:5px;background:#2a2036;border:1px solid #5a4a78}#yc-ov .sd.on{background:linear-gradient(90deg,#8a50d0,#ffd84a)}#yc-ov table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}#yc-ov td{padding:4px 6px;border-bottom:1px solid #3a2e50}';document.head.appendChild(s)}
function build(){css();ov=document.createElement('div');ov.id='yc-ov';
  ['pointerdown','touchstart','keydown','keyup','keypress'].forEach(function(t){ov.addEventListener(t,function(e){e.stopPropagation()})});
  ov.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button[data-a]');if(!b)return;var a=b.dataset.a;if(a==='x')close();else if(a==='t'||a==='m')choose(a)});
  document.body.appendChild(ov)}
function card(p,can){var c=K[p];return '<div class="cd" style="border-color:'+c.bd+';background:'+c.bg+'"><b class="n" style="color:'+c.col+'">'+c.ic+' Ý Cảnh '+c.nm+'</b><div style="font-size:12.5px;margin-top:3px">Mọi kỹ năng và Thần Thông gây thêm <b style="color:'+c.col+'">'+c.fx+'</b> bằng <b>10%</b> sát thương gốc, tăng theo cảnh giới, tối đa <b>50%</b>.</div><ol>'+c.names.map(function(n,i){return'<li>'+n+' <span style="opacity:.7">· '+CF.pct[i]+'%</span></li>'}).join('')+'</ol><button data-a="'+p+'" style="background:'+(p==='t'?'#9a7418':'#5a2a9a')+'"'+(can?'':' disabled')+'>'+(can?'Chọn '+c.nm:'🔒 Cần cảnh giới Luyện Hư')+'</button></div>'}
function render(){if(!ov||ov.style.display==='none')return;
  var y=Y(),ok=realmOk(),h='<h2>🌌 Ý Cảnh</h2>';
  if(!y){
    h+='<div style="text-align:center;font-size:13px;opacity:.9">Chỉ được chọn <b>1</b> trong 2 đạo để tu luyện, <b style="color:#ff9a8a">không thể đổi lại</b>. Mỗi đạo có 5 cảnh giới, mỗi cảnh giới 3 tiểu cảnh (Hạ · Trung · Thượng).</div>'
      +'<div style="text-align:center;font-size:13px;margin:6px 0">Điều kiện: cảnh giới <b>Luyện Hư</b> '+(ok?'<b style="color:#7be07a">✔ đạt</b>':'<b style="color:#ff9a8a">(hiện: '+realmName()+')</b>')+'</div>'
      +card('t',ok)+card('m',ok)
  }else{
    var c=K[y.p],L=lvl(y);
    h+='<div class="cd" style="border-color:'+c.bd+';background:'+c.bg+';text-align:center"><div style="font-size:42px;line-height:1">'+c.ic+'</div><b class="n" style="color:'+c.col+'">Ý Cảnh '+c.nm+'</b><div style="font-size:13px;margin-top:2px">Ý Cảnh cấp <b>'+L+'</b>/15</div>'
      +'<div style="font-size:17px;margin:6px 0;color:'+c.col+'"><b>Cảnh giới '+y.r+': '+c.names[y.r-1]+'</b> · '+SUB[y.s]+'</div>'
      +'<div class="row">'+[0,1,2].map(function(i){return'<div class="sd'+(i<=y.s?' on':'')+'"></div>'}).join('')+'</div>'
      +'<div style="font-size:13px">Sát thương phụ: <b style="color:'+c.col+'">'+pct(y)+'%</b> sát thương kỹ năng / Thần Thông ('+c.fx+')</div></div>'
      +'<table>'+c.names.map(function(n,i){var cur_=i+1===y.r,dn=i+1<y.r;return'<tr style="'+(cur_?'background:rgba(138,96,200,.25);font-weight:700':'')+'"><td>'+(dn?'✔':cur_?'▶':'·')+' '+(i+1)+'. '+n+'</td><td style="text-align:right;color:'+c.col+'">'+CF.pct[i]+'%</td></tr>'}).join('')+'</table>'
      +'<div style="font-size:12.5px;opacity:.75;margin-top:8px;text-align:center">📜 Cách tu luyện: sẽ cập nhật sau.</div>'}
  h+='<button data-a="x" style="background:#3a3a3a">Đóng</button>';
  ov.innerHTML='<div class="bx">'+h+'</div>'}
function open(){if(!started)return;if(!ov)build();ov.style.display='flex';render()}
function close(){if(ov)ov.style.display='none'}
function choose(p){
  if(Y())return;
  if(!realmOk()){try{msg='🌌 Cần cảnh giới Luyện Hư để bắt đầu tu luyện Ý Cảnh';ui()}catch(e){}return}
  var c=K[p];
  if(!confirm('Chọn Ý Cảnh '+c.nm+'?\nChỉ được chọn 1 trong 2 đạo và KHÔNG thể đổi lại.\nBạn sẽ nhận ngay Ý Cảnh cấp 1: '+c.names[0]+' (Hạ).'))return;
  PS[cur].yc={p:p,r:1,s:0,t:Date.now()};save();
  try{DT.push({x:P.x,y:190,s:c.ic+' Ý Cảnh '+c.nm+' · cấp 1!',c:c.col,g:1,l:160})}catch(e){}
  try{ui()}catch(e){}
  render()}

/* khối hiển thị trong bảng Hợp Đạo Đài */
function mini(){var y=Y(),ok=realmOk(),s;
  if(y){var c=K[y.p];s='<b style="color:'+c.col+'">'+c.ic+' '+c.nm+'</b> · '+c.names[y.r-1]+' ('+SUB[y.s]+') · cấp '+lvl(y)+'/15 · sát thương phụ <b style="color:'+c.col+'">'+pct(y)+'%</b>'}
  else s=ok?'Chưa chọn đạo — chọn <b style="color:#ffd84a">Tiên Đạo</b> hoặc <b style="color:#c8a0ff">Ma Đạo</b> (chỉ 1).':'Cần cảnh giới <b>Luyện Hư</b> để bắt đầu (hiện: '+realmName()+').';
  return '<div class="rq" style="margin-top:10px;border:1px solid #7a5aa8;border-radius:10px;padding:8px;background:rgba(40,22,64,.5)"><b style="color:#e0c8ff">🌌 Ý Cảnh</b><br><span style="font-size:12.5px;line-height:1.5">'+s+'</span><button data-a="yc" style="margin-top:6px;width:100%;flex:none;background:#5a3a9a">🌌 Mở Ý Cảnh</button></div>'}

window.YCANH={open:open,close:close,mini:mini,info:info,up:up,cfg:CF};
})();
