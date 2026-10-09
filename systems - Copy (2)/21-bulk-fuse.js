/* Hợp hàng loạt trang bị Sử Thi (tím) + gỡ thuộc tính "Giảm hồi chiêu" khỏi đồ cũ */
var bfc=0;
function bulkFuseUI(){
  if(!vil)return '';
  var n=BAG.filter(function(it){return it&&it.r==3}).length,g=Math.floor(n/3);
  if(g<1)return '<div class="st">Hợp hàng loạt: cần ít nhất 3 món Sử Thi (tím) trong túi.</div>';
  return '<div class="dt">⚗ <b>Hợp hàng loạt Sử Thi (tím)</b><br>Tự ghép mọi món tím trong túi theo từng bộ 3 (ưu tiên cấp cao). Mỗi bộ tốn phí như hợp thường, <b>10%</b> thành công lên Thần Thoại, <b>90%</b> mất cả 3 món. Dừng khi hết vàng.</div>'+
    '<button onclick="bulkFuse()">'+(bfc?'⚠ XÁC NHẬN hợp '+g+' bộ':'⚗ Hợp hàng loạt ('+g+' bộ · '+n+' món tím)')+'</button>';
}
function bulkFuse(){
  if(!vil){msg='Cần đến Thợ Rèn trong làng 🏘';ui();return}
  var L=[];BAG.forEach(function(it,i){if(it&&it.r==3)L.push({it:it,i:i})});
  L.sort(function(p,q){return (q.it.l|0)-(p.it.l|0)});
  var g=Math.floor(L.length/3);
  if(g<1){bfc=0;msg='Cần ít nhất 3 món Sử Thi (tím)';ui();return}
  if(!bfc){bfc=1;msg='⚠ Bấm lần nữa để xác nhận hợp '+g+' bộ: mỗi bộ thất bại sẽ MẤT CẢ 3 món!';ui();return}
  bfc=0;
  var used=[],made=[],ok=0,bad=0,spent=0;
  for(var k=0;k<g;k++){
    var a=L[3*k].it,b=L[3*k+1].it,c3=L[3*k+2].it,cost=fcost(a,b);
    if(gold<cost)break;
    gold-=cost;spent+=cost;
    used.push(L[3*k].i,L[3*k+1].i,L[3*k+2].i);
    if(R()<.1){
      var it=gen(Math.max(a.l,b.l,c3.l),a.r+1,a.s,Math.max(a.mp|0,b.mp|0,c3.mp|0));
      if(a.c||b.c||c3.c)it.c=1;
      made.push(it);ok++;
    }else bad++;
  }
  if(!used.length){msg='Không đủ vàng ('+fcost(L[0].it,L[1].it)+' / bộ)';ui();return}
  used.sort(function(x,y){return y-x}).forEach(function(i){BAG.splice(i,1)});
  made.forEach(function(it){BAG.push(it)});
  fz=[];fzc=0;
  msg='⚗ Hợp '+(ok+bad)+' bộ: 🌟 '+ok+' thành công, 💥 '+bad+' thất bại · -'+spent+'💰';
  ui();
}
/* Gỡ thuộc tính giảm hồi chiêu (cdr) khỏi mọi trang bị đang có */
function stripCdr(){
  try{[typeof BAGS!='undefined'?BAGS:[],typeof EQS!='undefined'?EQS:[]].forEach(function(all){
    all.forEach(function(arr){(arr||[]).forEach(function(it){if(it&&it.x&&'cdr' in it.x)delete it.x.cdr})})
  })}catch(e){}
}
stripCdr();setInterval(stripCdr,3000);
