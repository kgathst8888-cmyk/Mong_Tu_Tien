/* Bấm vào phần nhiệm vụ 📜 trên màn hình chính → mở bảng chi tiết nhiệm vụ (chính tuyến, hằng ngày, hằng tuần).
   Mobile: dòng nhiệm vụ dưới thanh EXP/Tu vi. Máy tính: khung "Chương … · Chính tuyến" bên trái. */
(function(){
var cv=document.getElementById('c');if(!cv)return;
var st=document.createElement('style');st.textContent=
'#qd-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.74);z-index:33;align-items:center;justify-content:center;font-family:"KTH Serif","Songti SC",STKaiti,KaiTi,serif;color:#f2e3b3}'
+'#qd-ov.on{display:flex}'
+'.qd-bx{background:#2a1a12;border:3px solid #b8964e;border-radius:10px;padding:10px;width:min(400px,94vw);max-height:88vh;overflow:auto;font-size:13px;box-sizing:border-box}'
+'.qd-h{display:flex;justify-content:space-between;align-items:center;font-size:16px;margin-bottom:6px}'
+'.qd-bx button{margin:4px 4px 0 0;background:#5a4220;color:#f2e3b3;border:1px solid #b8964e;border-radius:5px;padding:7px 10px;font:inherit;cursor:pointer}'
+'.qd-bx button:disabled{opacity:.4}.qd-bx .qd-sm{padding:3px 8px;font-size:12px;margin:0 0 0 6px}'
+'.qd-row{display:flex;justify-content:space-between;align-items:center;gap:6px}';
document.head.appendChild(st);
var ov=document.createElement('div');ov.id='qd-ov';ov.innerHTML='<div class="qd-bx"></div>';document.body.appendChild(ov);
var box=ov.firstChild;
function dailyHtml(){
  var h='<div class="qc"><div class="qd-row"><b>📅 Hằng ngày</b><span class="st">⚡ Hoạt lực '+QS.act+' / 100</span></div>';
  QS.dq.forEach(function(q,k){var d=QDP[q.i],v=qsP(d,QS.sd),ok=!q.c&&v>=d[1];
    h+='<div class="qo"><div class="qd-row"><span>'+(q.c?'🏁':v>=d[1]?'✅':'⬜')+' '+d[2]+' <span class="st">· '+d[3].replace('{n}',fmtN(d[1]))+'</span></span>'+(ok?'<button class="qd-sm" data-a="dq:'+k+'">Nhận</button>':'')+'</div>'+qsBar(v,d[1])+'</div>'});
  return h+'</div>'}
function weeklyHtml(){
  var h='<div class="qc"><b>🗓 Hằng tuần</b>';
  QS.wq.forEach(function(q,k){var d=QWP[q.i],v=qsP(d,QS.sw),ok=!q.c&&v>=d[1];
    h+='<div class="qo"><div class="qd-row"><span>'+(q.c?'🏁':v>=d[1]?'✅':'⬜')+' '+d[2]+' <span class="st">· '+d[3].replace('{n}',fmtN(d[1]))+'</span></span>'+(ok?'<button class="qd-sm" data-a="wq:'+k+'">Nhận</button>':'')+'</div>'+qsBar(v,d[1])+(q.c?'':qsChips(d[4]))+'</div>'});
  return h+'</div>'}
function classHtml(){
  var p=PS[cur],t=p.tier,h='<div class="qc"><b>🎓 Chuyển chức</b> <span class="st">'+TN[t]+'</span>';
  if(t>=3)return h+'<div class="st">Đã đạt cảnh giới tối cao.</div></div>';
  if(P.lv<20*(t+1))return h+'<div class="st">Cần đạt cấp '+20*(t+1)+' (hiện Lv'+P.lv+').</div>'+qsBar(P.lv,20*(t+1))+'</div>';
  if(!cq)return h+'<div class="st">'+cqDesc(t)+'</div><button data-a="cq">📜 Nhận nhiệm vụ chuyển chức</button></div>';
  if(!cqOK())return h+cqUI()+'</div>';
  return h+'<div class="st">Hoàn thành! Hãy chọn:</div>'+(t==0?CHR[cur].br.map(function(b,j){return '<button data-a="cqb:'+j+'">'+b.n+(b.w?' ('+b.w+')':'')+'</button>'}).join(''):'<button data-a="cq">Chuyển chức → '+TN[t+1]+'</button>')+'</div>';
}
function render(){
  try{
    qsChk();
    var h='<div class="qd-h"><b>📜 Nhiệm vụ</b><button data-a="x">✕</button></div>',c=QCH[QS.ch];
    if(!c)h+='<div class="qc done"><h4>🏆 Hoang Mạc Truyện — Hoàn tất</h4><div class="qs">Ngươi đã đi hết chính tuyến. Hãy tiếp tục với nhiệm vụ hằng ngày, hằng tuần và thành tựu.</div></div>';
    else{
      var dn=qsChD();
      h+='<div class="qc'+(dn?' done':'')+'"><div class="st">Chương '+(QS.ch+1)+' / '+QCH.length+' · Chính tuyến</div><h4>📖 '+c.t+'</h4><div class="qs">'+c.s+'</div>'
        +c.o.map(function(o){return qsOb(o,QS.sc)}).join('')
        +'<div class="st" style="margin-top:6px">🎁 Phần thưởng</div>'+qsChips(c.r)
        +(dn?'<button data-a="claim">🎁 Nhận thưởng chương</button>':'')+'</div>';
      var nx=QCH[QS.ch+1];
      if(nx)h+='<div class="qc" style="opacity:.65"><div class="st">Chương kế</div><b>🔒 '+nx.t+'</b><div class="st">'+nx.o.map(qsTx).join(' · ')+'</div></div>'}
    h+=dailyHtml()+weeklyHtml()+classHtml();
    h+='<button data-a="all">🎁 Nhận tất cả</button><button data-a="tab">📖 Mở bảng nhiệm vụ đầy đủ</button>';
    box.innerHTML=h;
  }catch(err){box.innerHTML='<div class="qd-h"><b>📜 Nhiệm vụ</b><button data-a="x">✕</button></div><div class="st">Không đọc được nhiệm vụ.</div>';console.warn('[quest hud]',err)}
}
function open(){ov.classList.add('on');render()}
function close(){ov.classList.remove('on')}
ov.addEventListener('click',function(e){
  var n=e.target;while(n&&n!==ov&&!(n.getAttribute&&n.getAttribute('data-a')))n=n.parentNode;
  if(n&&n!==ov){
    var a=n.getAttribute('data-a');
    try{
      if(a=='x')return close();
      if(a=='claim')qsCh();
      else if(a=='all')qsAll();
      else if(a=='cq')cq1();
      else if(a.indexOf('cqb:')==0)cq1(+a.slice(4));
      else if(a=='tab'){close();if(!bo){tab=5;sel=null;msg='';tg()}else tb(5);return}
      else if(a.indexOf('dq:')==0)qsDq(+a.slice(3));
      else if(a.indexOf('wq:')==0)qsWq(+a.slice(3));
    }catch(err){console.warn('[quest hud]',err)}
    render();
  }else if(e.target===ov)close();
});
['keydown','keyup','keypress'].forEach(function(n){ov.addEventListener(n,function(e){e.stopPropagation()})});
function hit(e){
  var x=e.offsetX,y=e.offsetY;
  if(W<640)return y>=84&&y<=106&&x<=Math.max(120,W-150);
  var hs=Math.max(.6,Math.min(1.1,Math.min(H/540,W/420)));
  return x>=10*hs&&x<=210*hs&&y>=140*hs&&y<=226*hs;
}
cv.addEventListener('pointerdown',function(e){
  try{
    if(!started)return;
    var ar=document.getElementById('arena-scene');if(ar&&ar.classList.contains('on'))return;
    if(!hit(e))return;
    mvDir=0;e.stopPropagation();open();
  }catch(err){console.warn('[quest hud]',err)}
});
window.QDET={open:open,close:close};
})();
