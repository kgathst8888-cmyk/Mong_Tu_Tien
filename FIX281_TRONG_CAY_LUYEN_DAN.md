# Fix281 – Trồng cây +40% thời gian, luyện đan giảm tỉ lệ thành công
- File sửa: systems/08-farming-alchemy.js (khối CFG)
- CFG.growMul = 1.4: thời gian chín của mọi loại cây x1.4 (1 = như cũ). Cây đang trồng cũng chín muộn hơn theo thời gian mới.
- CFG.scMul = 0.4: tỉ lệ luyện thành nhân 0.4 (vd 90% -> 36%), vẫn trừ 2%/cảnh giới và không dưới scMin 30% (1 = như cũ).
