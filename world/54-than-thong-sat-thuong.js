/* ===== ⚖️ CÂN BẰNG: SÁT THƯƠNG THẦN THÔNG LUÔN CAO HƠN KỸ NĂNG THƯỜNG =====
 * Trước đây nhiều thần thông yếu hơn kỹ năng phàm thể (đo trong game, hệ số nhân sát thương mỗi lần thi triển, Kiếm Khách):
 *   kỹ năng thường: 4,4–6,2 (chiêu thường) · 12,6 (tuyệt kỹ)     |   Tiên thuật ×3 · Thần thông hệ ×3,5 · Thần thông Ý Cảnh ×4,2 (thua cả chiêu thường)
 * Module này nâng "sàn" hệ số của từng bậc thần thông, KHÔNG sửa dữ liệu gốc của module khác ngoài việc nâng giá trị thấp:
 *   bậc nhỏ (CF.small = 7,5)  > chiêu thường mạnh nhất (6,2)      — tiên thuật ô1, thần thông hệ ô1, Ý Cảnh ô1
 *   bậc vừa (CF.mid   = 9,5)                                       — tiên thuật ô3 (diện rộng) và ô4, thần thông hệ ô2
 *   bậc lớn (CF.big   = 17)   > tuyệt kỹ thường mạnh nhất (12,6)   — tiên thuật ô5, thần thông hệ ô4 (cực nghĩa), Ý Cảnh ô3
 * Nhiều đòn (Ý Cảnh ô2: 5 đòn × 7,5) vốn đã vượt sàn nên giữ nguyên. Chỉ nâng khi thấp hơn sàn, không bao giờ hạ.
 * Cách áp dụng:  - Thần thông hệ (world/34): sửa trực tiếp TTHONG.cfg[j].m.   - Ý Cảnh (world/49): sửa YCTT.cfg.sk.*.mul.
 *                - Tiên thuật (engine ZC): bọc ZS.zf(i,col,f) nhân f với hệ số bù = sàn / hệ số gốc (BZK).
 * Đặt CF.on=false để tắt toàn bộ. Chỉnh sàn ở CF. Phụ thuộc (tuỳ chọn, thiếu thì bỏ qua phần đó): TTHONG, YCTT, ZS. */
(function(){
'use strict';
var CF={on:true,small:7.5,mid:9.5,big:17,
  /* hệ số gốc tiên thuật theo ô (nhỏ nhất giữa các lớp): ô1 ×3, ô3 ×6, ô4 2 đòn ×4,5 = 9, ô5 ×16; ô2 là buff */
  BZK:[3,0,6,9,16],ZK:['small',null,'mid','mid','big'],
  TT:{0:'small',1:'mid',3:'big'},                 /* thần thông hệ: chỉ số ô (SC[j]) → bậc */
  YC:{0:'small',2:'big'}                          /* Ý Cảnh: ô1, ô3 (ô2 nhiều đòn giữ nguyên) */
};
function floor(tier){return CF[tier]||0}
function lift(v,tier){var f=floor(tier);return v<f?f:v}

/* 1) Thần thông hệ — module 34: SC là mảng dùng trực tiếp trong fire(): đổi m tại chỗ */
function fixTT(){
  try{
    var sc=window.TTHONG&&TTHONG.cfg;if(!sc)return;
    Object.keys(CF.TT).forEach(function(j){var s=sc[j];if(s&&typeof s.m==='number')s.m=lift(s.m,CF.TT[j])});
  }catch(e){}
}
/* 2) Ý Cảnh — module 49: CF.sk.t/m[k].mul (mul là hệ số mỗi đòn; ô2 5 đòn không đụng) */
function fixYC(){
  try{
    var sk=window.YCTT&&YCTT.cfg&&YCTT.cfg.sk;if(!sk)return;
    ['t','m'].forEach(function(p){(sk[p]||[]).forEach(function(s,j){var t=CF.YC[j];if(t&&(s.h||1)===1&&typeof s.mul==='number')s.mul=lift(s.mul,t)})});
  }catch(e){}
}
/* 3) Tiên thuật — engine: ZS.zf(i,col,f), f = zf()×lcMul → nhân thêm hệ số bù để đạt sàn */
function fixZK(){
  try{
    if(typeof ZS==='undefined'||typeof ZS.zf!=='function'||ZS.__tts)return;
    var _zf=ZS.zf;
    ZS.zf=function(i,col,f){
      var t=CF.ZK[i],b=CF.BZK[i],k=1;
      if(CF.on&&t&&b>0)k=Math.max(1,floor(t)/b);
      return _zf.call(this,i,col,f*k);
    };
    ZS.__tts=1;
  }catch(e){}
}
function apply(){if(!CF.on)return;fixTT();fixYC();fixZK()}
apply();
/* các module 34/49 có thể nạp sau → thử lại vài lần rồi thôi (nâng giá trị là idempotent) */
var n=0,iv=setInterval(function(){apply();if(++n>=8)clearInterval(iv)},800);
window.TTSAT={cfg:CF,apply:apply,floor:floor};
})();
