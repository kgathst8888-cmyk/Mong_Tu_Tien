/* ===== 🧿 HIỂN THỊ ĐẦY ĐỦ NHÂN VẬT Ở THÀNH TIÊN GIỚI (world/89-tien-gioi-nhan-vat-fx.js) — nạp sau world/88 =====
 * Trước đây heroDraw (world/61) chỉ vẽ drawEP()+hero()+nameTag(); phần "hiệu ứng nhân vật" nằm trong ZC.aura() (engine gọi ngay trước hero())
 * và pháp bảo bổn mệnh vẽ trong ZC.aura của world/48 (bị chặn khi vil) nên Tiên Giới không thấy. Module này bổ sung, chỉ khi TG.on() và là CHÍNH MÌNH:
 *   1) Thú nuôi: bước epstep() 1 lần/khung (trong thành không có địch → E tạm rỗng) để thú có hoạt ảnh, bay/đi theo; nếu nơi khác đã bước rồi thì bỏ qua.
 *   2) Hiệu ứng nhân vật: gọi ZC.aura() (aura cảnh giới tu tiên; Đạo Thể: trận pháp + luyện hư của world/46) bằng cách tạm đặt vil=false rồi trả lại ngay.
 *   3) Pháp bảo bổn mệnh: FABAO.ghost() với trạng thái bay riêng → bay lơ lửng cạnh người, có vệt đuôi như ngoài map đánh quái.
 * 4) Hiệu ứng TU TIÊN (aura cảnh giới) vẽ lại theo HƯỚNG 8 CHIỀU của nhân vật (đọc VPG8.state.ang của world/74): vòng trận dưới chân có mũi chỉ hướng, hào quang
 *    mỏng lại khi nhìn ngang, cánh sáng (cảnh giới ≥4) gập ra sau lưng khi quay ngang/xoè 2 bên khi nhìn thẳng/lưng. Hiện cả sau khi đã chọn môn phái. Đạo Thể vẫn dùng aura của world/46.
 * Móc: world/61 heroDraw gọi TGCH.pet() trước drawEP() và TGCH.pre() trước hero() (mỗi nơi 1 dòng, bọc try).
 * Chỉnh: TGCH_CF.enable=false tắt tất cả · TGCH_CF.pet / .aura / .fabao = false để tắt riêng từng phần · TGCH_CF.cult8=false để về aura tu tiên gốc (không xoay hướng). */
(function(){
'use strict';
if(typeof g==='undefined'||typeof hero!=='function'||!window.TG)return;
var CF=window.TGCH_CF=window.TGCH_CF||{};
if(CF.enable===undefined)CF.enable=true;
if(CF.pet===undefined)CF.pet=true;
if(CF.aura===undefined)CF.aura=true;
if(CF.fabao===undefined)CF.fabao=true;
if(CF.cult8===undefined)CF.cult8=true;
var AR={x:0,y:0,vx:0,vy:0,rot:0,vr:0,sp:0,init:0,h:[]},lastT=-1,lastF=-1;
function tgOn(){try{return !!window.TG.on()}catch(e){return false}}
function petStep(){
 if(!CF.enable||!CF.pet||!tgOn())return;
 if(typeof epstep!=='function'||typeof EP==='undefined'||typeof E==='undefined')return;
 var p;try{p=window.pet&&window.pet()}catch(e){return}if(!p||lastF===fr)return;lastF=fr;
 if(EP.t!==undefined&&lastT>=0&&EP.t!==lastT){lastT=EP.t;return}   /* nơi khác đã bước thú khung này */
 var oe,sw=false;try{oe=E;E=[];sw=true}catch(e){}
 try{epstep()}catch(e){}finally{if(sw){try{E=oe}catch(e){}}}
 lastT=EP.t}

/* ---------- aura tu tiên xoay 8 hướng ---------- */
var RCL=['#c8c8c8','#9fe0ff','#ffd76a','#ffb040','#c090ff','#ff7ad9','#5ff0d8','#ff6a5a','#fff2a8'],GL=['道','玄','天','元','嬰','靈','真','神'],GSP={},PI=Math.PI,TAU=PI*2;
function gsp(c){var o=GSP[c];if(o)return o;o=document.createElement('canvas');o.width=o.height=64;var q=o.getContext('2d'),r=q.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,c);r.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=r;q.fillRect(0,0,64,64);return GSP[c]=o}
function gl(x,y,r,c,al){if(r<1||al<=.01)return;g.globalAlpha=al>1?1:al;g.drawImage(gsp(c),x-r,y-r,r*2,r*2)}
function face(){var a=PI/2;try{if(window.VPG8&&VPG8.state&&typeof VPG8.state.ang==='number')a=VPG8.state.ang}catch(e){}return a}
function cult8(){
 var cv=null;try{cv=PS[cur].cv}catch(e){}if(!cv||!(cv.r>=0))return false;
 var k=Math.min(7,cv.r|0),st=((cv.s|0)%10)/9,cc=RCL[k+1]||'#ffffff',x=(P.x-cam)*s,gy=GY,t=fr,a=face(),fx=Math.cos(a),fy=Math.sin(a),af=Math.abs(fy),sx=fx>=0?1:-1,i,w,q,R0=44+st*30;
 g.save();g.globalCompositeOperation='lighter';
 if(k>=1){w=(26+k*10+st*10)*s;q=g.createLinearGradient(0,gy,0,gy-250*s);q.addColorStop(0,cc);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.1+.05*k+.06*st+Math.sin(t*.05)*.02;g.fillStyle=q;g.fillRect(x-w/2,gy-250*s,w,250*s)}
 /* cánh sáng: nhìn thẳng/lưng xoè 2 bên · nhìn ngang gập ra sau lưng */
 if(k>=4){for(var sd=-1;sd<=1;sd+=2){var back=sd===-sx,aF=back?1:af,dx=sd*af+(-sx)*(1-af),ad=Math.max(.35,Math.abs(dx)),dr=dx>=0?1:-1;
   for(var L=0;L<3;L++){var fl=1+Math.sin(t*.07+L*.9)*.08,sc=1-L*.22;q=g.createLinearGradient(x,0,x+dr*140*s,0);q.addColorStop(0,'rgba(255,200,240,.55)');q.addColorStop(1,'rgba(255,120,220,0)');g.fillStyle=q;g.globalAlpha=(.42-L*.08)*aF;
    g.beginPath();g.moveTo(x+dr*12*s,gy-100*s);g.quadraticCurveTo(x+dr*110*s*ad*fl*sc,gy-(195-L*18)*s,x+dr*(125*sc+L*6)*s*ad*fl,gy-(60+L*22)*s);g.quadraticCurveTo(x+dr*70*s*ad,gy-(90-L*6)*s,x+dr*12*s,gy-65*s);g.fill()}}}
 /* hào quang sau người: mỏng lại khi nhìn ngang */
 if(k>=3){g.save();g.translate(x,gy-80*s);g.strokeStyle=k>=4?'#ffd0f0':'#e0c8ff';g.globalAlpha=.3+.15*Math.sin(t*.05);g.lineWidth=2.5*s;g.beginPath();g.ellipse(0,0,(60+(k-3)*6)*s*(.2+.8*af),(92+(k-3)*6)*s,0,0,TAU);g.stroke();
  g.lineWidth=6*s;g.globalAlpha*=.3;g.stroke();g.restore()}
 /* vòng trận dưới chân (mặt đất dẹt 2:1) + mũi chỉ hướng + chữ cảnh giới */
 g.save();g.translate(x,gy-4*s);g.scale(s,s*.5);g.strokeStyle=cc;g.lineWidth=3;g.globalAlpha=.3+.4*st;g.setLineDash([10,8]);g.lineDashOffset=-t;g.beginPath();g.arc(0,0,R0,0,TAU);g.stroke();g.setLineDash([]);
 g.globalAlpha=.25+.3*st;g.lineWidth=2;g.beginPath();g.arc(0,0,R0*.62,0,TAU);g.stroke();
 g.globalAlpha=.85;g.lineWidth=7;g.beginPath();g.arc(0,0,R0+9,a-.42,a+.42);g.stroke();
 g.globalAlpha=.9;g.lineWidth=3;g.beginPath();g.moveTo(Math.cos(a)*(R0+22),Math.sin(a)*(R0+22));g.lineTo(Math.cos(a-.12)*(R0+4),Math.sin(a-.12)*(R0+4));g.moveTo(Math.cos(a)*(R0+22),Math.sin(a)*(R0+22));g.lineTo(Math.cos(a+.12)*(R0+4),Math.sin(a+.12)*(R0+4));g.stroke();
 g.fillStyle=cc;g.font='bold 15px serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=.55+.3*Math.sin(t*.06);
 for(i=0;i<8;i++){var ga=i*PI/4+t*.012;g.fillText(GL[(i+k)%8],Math.cos(ga)*R0*.8,Math.sin(ga)*R0*.8)}
 g.restore();
 /* ngọc linh khí quay quanh người + hạt bay lên */
 for(i=0;i<6;i++){var ph=t*.03+i*PI/3,dp=Math.sin(ph);gl(x+Math.cos(ph)*(46+k*2)*s,gy-(70+10*Math.sin(t*.05+i))*s+dp*10*s,(5+k*.5)*s,cc,.5+.35*dp)}
 for(i=0;i<8;i++){var u=(t*.012+i/8)%1;gl(x+Math.sin(i*2.4+t*.02)*30*s,gy-(6+u*150)*s,3.2*s,cc,(1-u)*.8*Math.min(1,.4+k*.15))}
 g.restore();g.globalAlpha=1;return true}
function pre(){
 if(!CF.enable||!tgOn())return;
 var dt=false;try{dt=!!(window.DTFX&&DTFX.isDT&&DTFX.isDT())}catch(e){}
 var done8=false;if(CF.aura&&CF.cult8&&!dt){try{done8=cult8()}catch(e){try{g.restore()}catch(x){}}g.globalAlpha=1;g.globalCompositeOperation='source-over'}
 if(CF.aura&&!done8&&typeof ZC!=='undefined'&&ZC&&typeof ZC.aura==='function'){
  var ov,sw=false;try{ov=vil;vil=false;sw=true}catch(e){}
  g.save();try{ZC.aura()}catch(e){}finally{g.restore();g.globalAlpha=1;g.globalCompositeOperation='source-over';if(sw){try{vil=ov}catch(e){}}}}
 if(CF.fabao&&window.FABAO&&FABAO.ghost&&FABAO.on&&FABAO.type){
  try{if(FABAO.on()&&FABAO.type()>=0)FABAO.ghost(AR,fr)}catch(e){}}}
window.TGCH={pet:petStep,pre:pre,CF:CF};
})();
