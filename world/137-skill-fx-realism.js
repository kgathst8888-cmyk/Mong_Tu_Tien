/* ===== 🎞 HIỆU ỨNG THẦN THÔNG — CHÂN THỰC & NÉT (world/137-skill-fx-realism.js) — Fix426 =====
 * Bộ lọc tông màu dùng chung cho MỌI hiệu ứng kỹ năng/thần thông đã có (core/01h, world/*, pets/*):
 * các file này vẽ bằng pha trộn cộng sáng ('lighter') + quầng sáng shadowBlur nên dễ chói, loè, mất chi tiết.
 * Module này chỉ chặn ở tầng vẽ canvas 2D — KHÔNG đổi sát thương, hồi chiêu, logic, dữ liệu.
 *   1) Giảm độ chói: nét vẽ 'lighter' nhân alpha (glare), thu nhỏ/cắt quầng shadowBlur (blur, maxBlur).
 *   2) Tăng độ nét: nét 'lighter' dày (>=5px) được thu mảnh lại (band) và thêm LÕI SÁNG MẢNH ở giữa → tia/kiếm khí/sét
 *      có lõi rõ, viền gọn thay vì một dải mờ.
 *   3) Chống loé trắng toàn màn hình: ô cộng sáng phủ ≥70% màn hình bị giảm alpha (flash).
 *   4) Quầng shadowBlur lớn ở pha trộn thường cũng được rút gọn.
 * Chỉnh/tắt: window.SKFXR_CF = {enable, glare, band, blur, maxBlur, core, flash}
 *   SKFXR.preset('off'|'soft'|'real'|'vivid') · enable=false → trả đúng như cũ.
 * Lõi core/01h-skill-fx.js đã được viết lại riêng (dùng 'screen', không shadowBlur) nên không bị lọc 2 lần. */
(function(){
'use strict';
var CF=window.SKFXR_CF=window.SKFXR_CF||{};
var DEF={enable:true,glare:.74,band:.66,blur:.35,maxBlur:6,core:true,flash:.4,soft:6};
for(var k in DEF)if(CF[k]===undefined)CF[k]=DEF[k];
var PRE={off:{enable:false},soft:{enable:true,glare:.6,band:.6,blur:.25,maxBlur:4,core:true,flash:.3},
 real:{enable:true,glare:.74,band:.66,blur:.35,maxBlur:6,core:true,flash:.4},
 vivid:{enable:true,glare:.9,band:.8,blur:.6,maxBlur:9,core:true,flash:.6}};
window.SKFXR={cf:CF,preset:function(n){var p=PRE[n];if(!p)return false;for(var k in p)CF[k]=p[k];return true},busy:0};
var P=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
if(!P||P.__skfxr)return;P.__skfxr=1;
var busy=false,cc={};
function rgb(c){var v=cc[c];if(v)return v;var m=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
 if(m){var h=m[1];if(h.length==3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];v=[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4),16)]}
 else{var r=/rgba?\(([^)]+)\)/.exec(c);v=r?r[1].split(',').slice(0,3).map(Number):null}
 if(Object.keys(cc).length>400)cc={};return cc[c]=v}
function core(st){if(typeof st!=='string')return 'rgba(255,255,255,.8)';var v=rgb(st);if(!v)return 'rgba(255,255,255,.8)';
 return 'rgb('+Math.round(v[0]+(255-v[0])*.68)+','+Math.round(v[1]+(255-v[1])*.68)+','+Math.round(v[2]+(255-v[2])*.68)+')'}
function tame(ctx,add){var b=ctx.shadowBlur;if(!b)return b;
 ctx.shadowBlur=add?Math.min(CF.maxBlur,b*CF.blur):(b>CF.soft?CF.soft+(b-CF.soft)*.35:b);return b}
function wrap(name,flashAware){var o=P[name];if(!o)return;
 P[name]=function(){
  if(busy||!CF.enable)return o.apply(this,arguments);
  var add=this.globalCompositeOperation==='lighter';
  var b0=this.shadowBlur;
  if(!add&&b0<=CF.soft)return o.apply(this,arguments);
  var a=this.globalAlpha,k=add?CF.glare:1;
  if(add&&flashAware&&arguments[2]>=300&&arguments[3]>=300){try{var m=this.getTransform();if(arguments[2]*m.a>=this.canvas.width*.7)k*=CF.flash}catch(e){}}
  busy=true;
  try{
   this.globalAlpha=a*k;tame(this,add);
   if(name==='stroke'&&add&&CF.core&&this.lineWidth>=5){
    var lw=this.lineWidth,st=this.strokeStyle,bl=this.shadowBlur;
    this.lineWidth=lw*CF.band;o.apply(this,arguments);
    this.shadowBlur=0;this.lineWidth=Math.max(1,lw*.14);this.strokeStyle=core(st);this.globalAlpha=Math.min(1,a*.92);
    o.apply(this,arguments);
    this.lineWidth=lw;this.strokeStyle=st;
   }else return o.apply(this,arguments);
  }finally{this.globalAlpha=a;this.shadowBlur=b0;busy=false}
 }}
['fill','stroke','fillRect','strokeRect','drawImage','fillText','strokeText'].forEach(function(n){wrap(n,n==='fillRect')});
})();
