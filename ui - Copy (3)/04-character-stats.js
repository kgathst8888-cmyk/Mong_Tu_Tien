
/*==== BẢNG CHỈ SỐ NHÂN VẬT ====*/
(function(){
const stl=document.createElement('style');
stl.textContent='.sgt{margin:8px 0 3px;padding:2px 6px;font-weight:bold;font-size:13px;color:#ffd76a;background:linear-gradient(90deg,#5a3a1888,transparent);border-left:3px solid #b8964e}.sg{display:grid;grid-template-columns:1fr 1fr;gap:1px 12px}.sr{display:flex;justify-content:space-between;gap:6px;font-size:12px;padding:2px 2px;border-bottom:1px dashed #5a463055}.sr span{opacity:.82}.sr b{color:#ffe9a0;white-space:nowrap}.sr.z b{color:#8a7a60;font-weight:normal}.sr.w{grid-column:1/3}.sph{display:flex;gap:10px;align-items:center;background:#140d0a;border:2px solid #5a4630;border-radius:8px;padding:6px}.sph img{width:64px;height:64px;object-fit:contain;border:2px solid #b8964e;border-radius:50%;background:radial-gradient(#3a3050,#120c18)}.sph div{line-height:1.45;font-size:12px}.sph b{font-size:15px;color:#ffe9a0}.sbar{height:6px;background:#000a;border-radius:3px;overflow:hidden;margin-top:3px}.sbar i{display:block;height:100%;background:linear-gradient(#e8c050,#a07a20)}';
document.head.appendChild(stl);
const r1=v=>Math.round(v*10)/10,pc=v=>r1(v)+'%',sg=v=>(v>=0?'+':'')+r1(v)+'%';
const row=(a,b,z,w)=>'<div class="sr'+(z?' z':'')+(w?' w':'')+'"><span>'+a+'</span><b>'+b+'</b></div>';
function stUI(){
 const p=PS[cur],t=p.tier,pt=pet(),wv=wl(),ch=CHR[cur];
 const crit=Math.min(85,15+Math.floor(al(3)/5)*.5+ZC.crit()*100+(setOn()?10:0)+SX('crit')+HL.crit()*100),
  cdm=180+SX('cdmg')+Math.floor(al(3)/5)+HL.cdmg()*100,
  hit=cl(88+SX('acc')-(3+mi()*2),35,100),
  dod=Math.min(40,SX('dodge')),dre=Math.min(50,SX('dred')),
  flat=P.lv+Math.floor((sm('d')+alD())*ZC.pd()*HL.df()/5),
  asp=Math.min(100,SX('aspd')),csp=Math.min(100,SX('cspd')),
  cds=1;
 const z=v=>!v;
 let h='<div class="sph"><img src="'+PIC[cur]+'"><div><b>'+CN(cur)+'</b> · '+CL[ch.t]+'<br>'+TN[t]+(p.br>=0?' · '+ch.br[p.br].n:'')+' · Lv '+P.lv+'<br>🧘 '+ZC.nm()+'<div class="sbar"><i style="width:'+Math.min(100,P.xp/nx()*100)+'%"></i></div><small>KN '+P.xp+'/'+nx()+'</small></div></div>';
 h+='<div class="sgt">⚔️ Cơ bản</div><div class="sg">'+row('❤️ Sinh lực',mx())+row('💧 Năng lượng',mm())+row('🗡 Công',atk()*5)+row('🛡 Thủ',df())+'</div>';
 h+='<div class="sgt">💥 Tấn công</div><div class="sg">'+row('Chí mạng',pc(crit))+row('ST chí mạng',pc(cdm))+row('Chính xác (quái thường)',pc(hit))+row('Tăng % sát thương',sg(SX('dmgp')),z(SX('dmgp')))+row('ST kỹ năng',sg(SX('sdmg')),z(SX('sdmg')))+row('Tốc độ đánh',sg(asp),z(asp))+row('Tốc niệm chú',sg(csp),z(csp))+'</div>';
 h+='<div class="sgt">🛡 Phòng thủ</div><div class="sg">'+row('Né tránh',pc(dod),z(dod))+row('Giảm ST nhận',pc(dre),z(dre))+row('Giáp trừ cứng/đòn','−'+flat)+row('Tăng % máu',sg(SX('hpp')),z(SX('hpp')))+row('Tăng % năng lượng',sg(SX('mpp')),z(SX('mpp')))+'</div>';
 h+='<div class="sgt">⭐ Điểm cộng</div><div class="sg">'+ANM((a,i)=>row(a[0],p.al[i]+' <small>('+a[1]+')</small>',z(p.al[i]))).join('')+row('🍀 May mắn rơi đồ','+'+(Math.floor(al(1)/15)*.5)+'%',!Math.floor(al(1)/15))+row('Điểm chưa dùng','<span style="color:'+(p.pts?'#7fff9a':'inherit')+'">'+p.pts+'</span>',z(p.pts),1)+'</div>';
 const mult=[['Chuyển chức','×'+(1+.25*t).toFixed(2)+' công/máu',t>0],['Tu vi','×'+ZC.cb().toFixed(2)+' công/thủ/máu · ×'+ZC.mb().toFixed(2)+' MP',ZC.cb()>1.0001||ZC.mb()>1.0001],['Đan dược',(typeof FM!='undefined'?FM.sumTxt():''),(typeof FM!='undefined'&&FM.any())],['Bộ Thần Thoại',setN()+'/6'+(setOn()?' · +30% công/máu, +10% chí mạng':''),setN()>0],['Bộ Thánh',HL.n()+'/10'+HL.sum(),HL.n()>0]];
 h+='<div class="sgt">✨ Nguồn tăng chỉ số</div><div class="sg">'+mult.map(m=>row(m[0],m[1],!m[2],1)).join('');
 if(pt){const nm=PT4[pt.k].n[pt.ev],bs=['dmgp','crit','acc','cdmg','cdr','dred','hpp'].filter(k=>PB(k)).map(k=>AXN[k]+' +'+r1(PB(k))+'%').join(', ');h+=row('🐾 '+nm+' · Lv '+pt.lv,bs||'—',0,1)}else h+=row('🐾 Thú nuôi','chưa có',1,1);
 if(wv){const bs=['dmgp','hpp','dodge'].map(k=>AXN[k]+' +'+WB(k)+'%').join(', ');h+=row('🪽 '+WGN[wv-1]+' · Cấp '+wv,bs,0,1)}else h+=row('🪽 Cánh','chưa có',1,1);
 h+='</div>';
 h+='<div class="sgt">🔮 Thuộc tính phụ (tổng)</div><div class="sg">'+Object.keys(AXN).map(k=>row(AXN[k],sg(SX(k)),z(SX(k)))).join('')+'</div>';
 const eq=EQ.map((it,i)=>it?'<div class="sr w"><span>'+(SL[i]?SL[i][1]:'')+' <b style="color:'+RC[it.r]+'">'+it.n+(it.u?' +'+it.u:'')+'</b></span><b>'+ADJ[it.r]+'</b></div>':'').join('');
 h+='<div class="sgt">🎽 Trang bị đang mặc ('+EQ.filter(Boolean).length+'/'+NS+')</div><div class="sg">'+(eq||row('Chưa mặc trang bị nào','',1,1))+'</div>';
 return h}
window.stUI=stUI;
/* chạm vào chân dung (góc trên trái) để mở bảng chỉ số */
addEventListener('pointerdown',e=>{if(e.target!==c||!started||bo)return;const hs=cl(Math.min(H/540,W/420),.6,1.1);if(W<640?(e.offsetX<64&&e.offsetY<64):(e.offsetX<104*hs&&e.offsetY<106*hs)){e.stopPropagation();e.stopImmediatePropagation();tab=11;sel=null;msg='';tg()}},true);
const _dr=draw;draw=function(){_dr();const hs=cl(Math.min(H/540,W/420),.6,1.1);g.save();g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#2a1a10';g.strokeStyle='#b8964e';g.lineWidth=2;const mb=W<640,cx=mb?15:22*hs,cy=mb?50:94*hs,cr=mb?9:13*hs;g.beginPath();g.arc(cx,cy,cr,0,6.283);g.fill();g.stroke();g.font=Math.round(mb?10:14*hs)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('📊',cx,cy+1);g.restore()};
})();

