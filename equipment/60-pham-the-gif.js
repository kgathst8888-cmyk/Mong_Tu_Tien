/* ===== 🚶 NHÂN VẬT PHÀM THỂ BƯỚC ĐI BẰNG ẢNH GIF (equipment/60-pham-the-gif.js) — nạp SAU assets/pham-the-gif-assets.js, cuối index.html =====
 * Khi nhân vật CỦA MÌNH còn ở cảnh giới Phàm Thể (chưa Hợp Đạo, chưa Chuyển Thể, chưa chọn môn phái), thân nhân vật 3 hệ
 * (Chiến binh / Pháp sư / Cung thủ) được thay bằng các khung ảnh bước đi tách từ IMG_5516.gif. Bản đồ 2D chỉ cần đi trái/phải:
 * ảnh gốc quay mặt trái, module lật sang phải; hero() của engine tự lật theo P.d như cũ.
 * Cách làm (giống equipment/51-dao-the-outfit.js): bọc hero() ở lớp NGOÀI CÙNG, trong lúc vẽ tạm đặt RIGI[cur] = "bộ xương phẳng"
 *   (1 mảnh thân + toạ độ vai/khuỷu/tay) rồi trả lại ngay. Nhờ vậy mọi lớp bọc bên trong vẫn chạy: cánh, mũ, hào quang, cường hóa,
 *   hiệu ứng trạng thái, và vũ khí / cung / chiêu đánh vẫn vẽ theo toạ độ tay (vũ khí vung quanh vai như cũ).
 * - Pha bước tính theo quãng đường P.x thực đi được (không trượt chân). Đứng yên → khung đứng yên.
 * - Đang đánh (P.atk>0): vẽ bằng bộ xương cũ nguyên bản để tay vung theo vũ khí/cung như trước, đánh xong trở lại ảnh GIF.
 * - Pháp sư: bản gốc lơ lửng 18 đơn vị; ở đây hạ xuống sát đất cho khớp ảnh đang bước (CF.mageDrop, 0 = lơ lửng như cũ).
 * - Không sửa engine, không đổi dữ liệu/save, không đụng module khác. Người chơi khác (Làng Online) và đối thủ Đấu Trường vẫn vẽ như cũ.
 * - Y Phục ở Tiệm Thời Trang tạm ẩn khi dùng ảnh này (lớp nhuộm khớp theo bộ mảnh cũ). Cánh/mũ/hào quang vẫn hiện.
 * - Ảnh chưa tải xong hoặc có lỗi → tự vẽ như cũ.
 * Tắt/bật khi chơi: window.PHAMTHE_GIF.enable=false|true. Chỉnh: CF.cyc (độ dài 1 vòng bước, lớn = bước chậm), CF.mageDrop. */
(function(){
'use strict';
if(typeof hero!=='function'||typeof RIGI==='undefined'||typeof PS==='undefined'||typeof CHR==='undefined'||typeof HDAO==='undefined'||typeof P==='undefined'||!window.PTGIF||!window.PTGIF.meta)return;
var CF=window.PHAMTHE_GIF=window.PHAMTHE_GIF||{};
if(CF.enable===undefined)CF.enable=true;
if(!CF.cyc)CF.cyc=1.15;
if(CF.mageDrop===undefined)CF.mageDrop=16;
var DATA=window.PTGIF,RIG={},LOAD={},ST={};
/* chỉ nhân vật của mình (người khác ở Làng Online / đối thủ Đấu Trường mượn bản sao P) */
function own(){return typeof P==='object'&&P&&!('maxMp' in P)&&!(P.hp===1&&P.mp===1&&P.atkT===1)}
function cls(){try{return CHR[cur].t}catch(e){return ''}}
/* dựng bộ xương phẳng cho 1 hệ từ ảnh sprite (lật sang phải) */
function build(key,im){
 var m=DATA.meta[key],n=m.n,cw=m.cw,ch=m.ch,p=m.pad,cell_w=cw+2*p,cell_h=ch+2*p,hm=m.h,frames=[],i,c,x;
 for(i=0;i<n;i++){
  c=document.createElement('canvas');c.width=cw;c.height=ch;x=c.getContext('2d');
  x.translate(cw,0);x.scale(-1,1);
  x.drawImage(im,(i%m.cols)*cell_w+p,Math.floor(i/m.cols)*cell_h+p,cw,ch,0,0,cw,ch);
  c.naturalWidth=cw;c.naturalHeight=ch; /* engine kiểm tra im.naturalWidth/Height như với ảnh thường */
  frames.push(c);
 }
 var RH=hm*150/148,RW=cw,ax=cw-m.left,bx=RW/2-ax,by=RH-m.floor+(key==='m'?CF.mageDrop*RH/150:0),
  ysh=m.floor-hm+.20*hm; /* hàng vai trong khung ảnh */
 var S=[bx+ax+.02*hm,by+ysh],E=[bx+ax+.05*hm,by+ysh+.16*hm],H=[bx+ax+.10*hm,by+ysh+.30*hm];
 return {W:RW,H:RH,base:{im:frames[0],x:bx,y:by,w:cw,h:ch},A_S:S,A_E:E,A_H:H,_fr:frames,_m:m};
}
function ready(key){
 if(RIG[key])return true;
 if(LOAD[key]===undefined){
  LOAD[key]=0;
  try{
   var im=new Image();
   im.onload=function(){try{RIG[key]=build(key,im)}catch(e){LOAD[key]=-1;console.error('PTGIF',e)}};
   im.onerror=function(){LOAD[key]=-1};
   im.src=DATA.src[key];
  }catch(e){LOAD[key]=-1}
 }
 return false;
}
function active(){
 try{
  if(!CF.enable||!own())return false;
  if(HDAO.on())return false;
  if(P.atk>0&&!CF.gifAttack)return false; /* đang đánh: dùng bộ xương cũ để tay vung theo vũ khí như trước (CF.gifAttack=true để dùng ảnh GIF cả lúc đánh) */
  if(window.CTHE&&CTHE.on())return false;
  try{if(window.VP&&VP.get&&VP.get())return false}catch(e){}
  var k=cls();
  return !!(DATA.meta[k]&&ready(k));
 }catch(e){return false}
}
/* chọn khung theo quãng đường đi (mỗi frame game chỉ tính 1 lần; các lần gọi hero() thêm trong cùng frame — tàn ảnh, kỹ năng — dùng lại) */
function step(key){
 var R=RIG[key],m=R._m,n=m.n,s=ST[key]||(ST[key]={f:-1,lx:null,ph:0,k:0});
 if(s.f!==fr){
  s.f=fr;
  var aa=P.atk>0,mv=!!P.mv&&!aa,dx=s.lx==null?-1:Math.min(6,Math.abs(P.x-s.lx));s.lx=P.x;
  s.k=mv?Math.min(1,s.k+.25):Math.max(0,s.k-.25);
  if(mv){
   var L=105*(typeof SZ==='number'?SZ:.7)*CF.cyc; /* quãng đường (đơn vị thế giới) cho 1 vòng bước */
   s.ph+=dx<=0.05?.18:Math.max(.12,Math.min(1.4,dx*(m.pp?2*n-2:n)/L));
  }
  if(mv||s.k>.5){
   if(m.pp&&n>2){var per=2*n-2,j=(Math.floor(s.ph)%per+per)%per;s.idx=j<n?j:per-j} /* chạy xuôi rồi ngược (pháp sư: váy dài che chân) */
   else s.idx=(Math.floor(s.ph)%n+n)%n;
  }else s.idx=m.idle;
 }
 R.base.im=R._fr[s.idx==null?m.idle:s.idx];
 return R;
}
var _hero=hero;
hero=function(){
 if(!active())return _hero.apply(this,arguments);
 var key=cls(),ci=cur,old=RIGI[ci],fa=PS[ci]&&PS[ci].fa,eq=fa&&fa.eq,sy=eq&&eq.y,R;
 try{R=step(key)}catch(e){return _hero.apply(this,arguments)}
 try{RIGI[ci]=R;if(sy)eq.y=0;return _hero.apply(this,arguments)}
 finally{RIGI[ci]=old;if(sy)eq.y=sy}
};
})();
