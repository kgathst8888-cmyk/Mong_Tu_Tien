/* core/01r-class-quest.js — Nhiệm vụ chuyển chức (cq*)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
/* ==== NHIỆM VỤ CHUYỂN CHỨC (khó hơn ở lần 2, 3) ==== */
const CQR=[{n:30,e:0,b:0,m:0},{n:120,e:4,b:1,m:1},{n:250,e:8,b:2,m:2}];
function cqNew(t){const r=CQR[t]||CQR[2];return{k:0,n:r.n,e:0,en:r.e,b:0,bn:r.b,t:t,v:2}}
function cqFix(){if(cq&&cq.v!==2){const t=cl(Math.round(((cq.n|0)-30)/15),0,2),o=cq;cq=cqNew(t);cq.k=Math.min(o.k|0,cq.n)}}
function cqOK(){cqFix();return !!cq&&cq.k>=cq.n&&(cq.e|0)>=cq.en&&(cq.b|0)>=cq.bn}
function cqM(){cqFix();return cq&&cq.t>=1&&mapSel>=CQR[cq.t].m&&!lg&&!cqOK()?1+.3*cq.t:1}
function cqKill(e){cqFix();if(!cq||e.dg||lg||cqOK()||mapSel<CQR[cq.t].m)return;if(e.b==1){if(cq.e<cq.en)cq.e++}else if(e.b>=2){if(cq.b<cq.bn)cq.b++}else if(cq.k<cq.n)cq.k++}
function cqDie(){cqFix();if(!cq||dg||cq.t<1||cqOK()||mapSel<CQR[cq.t].m)return;const l=Math.ceil(cq.k*.1);if(l>0){cq.k-=l;DT.push({x:P.x,y:230,s:'☠ Thử luyện: mất '+l+' quái tiến độ',c:'#ff9a8a',l:130})}}
function cqDesc(t){const r=CQR[t];return t==0?'Hạ '+r.n+' quái để lên <b>'+TN[1]+'</b>.':'<b>⚔ Thử luyện '+TN[t+1]+'</b> (khó):<br>• Hạ <b>'+r.n+'</b> quái + <b>'+r.e+'</b> Tinh Anh ⭐ + <b>'+r.b+'</b> Boss 👑<br>• Chỉ tính ở <b>'+MP[MPX[r.m]].n+'</b> trở lên<br>• Quái ×'+(1+.3*t).toFixed(1)+' máu trong lúc thử luyện<br>• Tử trận mất 10% tiến độ quái thường'}
function cqUI(){const c=cq,r=CQR[c.t|0];return'<div class="st">Tiến độ '+(c.t?'thử luyện':'chuyển chức')+'</div><div class="st">Quái thường</div>'+qsBar(c.k,c.n)+(c.en?'<div class="st">Tinh Anh ⭐</div>'+qsBar(c.e|0,c.en):'')+(c.bn?'<div class="st">Boss 👑</div>'+qsBar(c.b|0,c.bn):'')+(r.m?'<div class="st" style="opacity:.85">Chỉ tính ở '+MP[MPX[r.m]].n+' trở lên'+(mapSel<r.m?' <b style="color:#ff8a7a">(đang ở bản đồ thấp hơn: không tính!)</b>':'')+' · quái ×'+(1+.3*c.t).toFixed(1)+' máu · tử trận -10%</div>':'')}
function cq1(b){const p=PS[cur],t=p.tier;cqFix();if(!cq){cq=cqNew(t);msg='📜 Nhận nhiệm vụ: '+cqDesc(t).replace(/<br>/g,' ').replace(/<[^>]+>/g,'')}else if(cqOK()){if(t==0&&b===undefined)return;p.tier++;if(t==0)p.br=b;p.pts+=10;cq=null;rf();P.hp=mx();P.mp=mm();msg='🎉 Chuyển chức: '+(t==0?CHR[cur].br[b].n:TN[t+1])+' — mở khóa kỹ năng mới!'+(t==0?' Hãy chọn thần thú!':'')+WCARD();if(t==0)tab=9}ui()}
