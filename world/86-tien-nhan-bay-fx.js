/* ===== 🌸 HIỆU ỨNG BAY MỀM MẠI CỦA TIÊN NHÂN (world/86-tien-nhan-bay-fx.js) — nạp sau world/85 =====
 * Dùng chung cho world/73 (bản đồ 2D) và world/74 (Thành Tiên Giới 2.5D): vẽ quanh nhân vật đang bay lơ lửng
 *   • quầng sáng mờ sau lưng (nhịp thở chậm) · hồ linh khí dưới chân + 2 cung sáng xoay chậm
 *   • mây khói linh khí mềm bồng bềnh phía sau · đốm sao lấp lánh bay lên · 2 dải lụa mềm bay theo gió (lượn sóng, thon dần)
 * Toàn bộ dùng ảnh mờ dựng sẵn (không shadowBlur) nên nhẹ. Tắt: HOVFX_CF.enable=false (world/73/74 tự quay về hiệu ứng cũ). API: HOVFX.draw(g,màu,k,bp,hv,bx,by)
 *   k = độ chuyển động 0..1 · bp = nhịp thở · hv = độ bay 0..1 · (bx,by) = hướng "phía sau" nhân vật trên màn hình (đã chuẩn hoá nhẹ). Gốc toạ độ = chân nhân vật. */
(function(){
'use strict';
var CF=window.HOVFX_CF=window.HOVFX_CF||{};if(CF.enable===undefined)CF.enable=true;
var SP={},PI=3.14159;
function blob(col){
 if(SP[col])return SP[col];
 var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d'),
  r=parseInt(col.substr(1,2),16)||255,gg=parseInt(col.substr(3,2),16)||255,b=parseInt(col.substr(5,2),16)||255,
  hr=(r+255)>>1,hg=(gg+255)>>1,hb=(b+255)>>1,q=x.createRadialGradient(32,32,0,32,32,32);
 q.addColorStop(0,'rgba('+hr+','+hg+','+hb+',1)');q.addColorStop(.3,'rgba('+r+','+gg+','+b+',.5)');q.addColorStop(1,'rgba('+r+','+gg+','+b+',0)');
 x.fillStyle=q;x.fillRect(0,0,64,64);
 return SP[col]={im:c,hi:'rgb('+hr+','+hg+','+hb+')',lo:'rgb('+r+','+gg+','+b+')'};
}
function draw(g,col,k,bp,hv,bx,by){
 if(!CF.enable||hv<.01)return;
 var B=blob(col),i,j,t,u,ph,al,x,y,r,m=Math.hypot(bx,by)||1,pul=.5+.5*Math.sin(bp*1.3);bx/=m;by/=m;
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
 /* quầng sáng sau lưng */
 g.globalAlpha=hv*(.17+.06*pul+.07*k);g.drawImage(B.im,-48,-90,96,96);
 /* hồ linh khí dưới chân + cung sáng xoay chậm */
 g.save();g.translate(0,3);g.scale(1,.3);
 g.globalAlpha=hv*(.36+.1*pul);g.drawImage(B.im,-31,-31,62,62);
 g.strokeStyle=B.hi;g.lineWidth=1.5;
 for(i=0;i<2;i++){var a0=bp*.8+i*PI;g.globalAlpha=hv*.3;g.beginPath();g.arc(0,0,19+1.5*pul,a0,a0+1.6);g.stroke()}
 g.restore();
 /* mây khói linh khí */
 for(i=0;i<7;i++){
  ph=(bp*.24+i/7)%1;al=Math.sin(ph*PI);r=5+ph*10;
  x=Math.sin(i*2.1+bp*.4)*10+bx*ph*k*26;y=5+ph*13+by*ph*k*12;
  g.globalAlpha=hv*al*.28;g.drawImage(B.im,x-r,y-r,r*2,r*2)}
 /* đốm sao lấp lánh */
 for(i=0;i<6;i++){
  ph=(bp*.17+i*.19)%1;t=Math.sin(ph*PI);x=Math.sin(i*2.7+bp*.3)*22+bx*ph*k*12;y=-6-ph*62+by*ph*k*6;r=1.4+t*2;
  g.globalAlpha=hv*t*.85;g.drawImage(B.im,x-r*3,y-r*3,r*6,r*6);
  g.globalAlpha=hv*t*.55;g.strokeStyle=B.hi;g.lineWidth=.8;g.beginPath();g.moveTo(x-r*1.8,y);g.lineTo(x+r*1.8,y);g.moveTo(x,y-r*1.8);g.lineTo(x,y+r*1.8);g.stroke()}
 /* 2 dải lụa mềm bay theo gió */
 var len=15+k*24,px=-by,py=bx;
 for(j=0;j<2;j++){
  var sx=(j?5:-5),sy=-33+j*5,ph0=j*1.9,lx=sx,ly=sy,N=11;
  for(t=1;t<=N;t++){
   u=t/N;var w=Math.sin(bp*1.35-u*4.2+ph0)*(2+u*6)*(.55+.45*k+.3),
    cx=sx+bx*(u*len+3*u)+px*w*.6,cy=sy+by*u*len*.55+u*u*(12-6*k)+py*w*.35+Math.cos(bp*1.1-u*3.5+ph0)*u*3;
   g.strokeStyle=B.lo;g.lineWidth=4.2*(1-u)+.6;g.globalAlpha=hv*.34*(1-u*.8);g.beginPath();g.moveTo(lx,ly);g.lineTo(cx,cy);g.stroke();
   g.strokeStyle=B.hi;g.lineWidth=1.3*(1-u)+.2;g.globalAlpha=hv*.5*(1-u);g.beginPath();g.moveTo(lx,ly);g.lineTo(cx,cy);g.stroke();
   lx=cx;ly=cy}
 }
 g.restore();
}
window.HOVFX={draw:draw,CF:CF};
})();
