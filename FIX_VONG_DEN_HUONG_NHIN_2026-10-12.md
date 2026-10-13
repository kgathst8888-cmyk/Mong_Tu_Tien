# Sửa 2 lỗi trong video (Fix72)
1. Vòng tròn đen hồi chiêu quá to ở nút kỹ năng góc phải: do world/52-skill-layout.js đặt các nút trong khung #sk-side bằng position:static. Lớp phủ hồi chiêu `.sb::after{position:absolute;inset:0}` mất khung chứa là chính nút, nên phình ra bằng cả khung #sk-side. Đổi sang position:relative → vòng đen chỉ phủ đúng nút.
2. Ngược hướng: trong lúc đang tung đòn (P.act) nhân vật không quay mặt theo mục tiêu nên khi quái đổi bên vẫn đánh/nhìn ngược. Nay luôn quay mặt về mục tiêu khi đứng yên (core/01-engine.js, bước di chuyển tự động). Khi chạy lùi vẫn quay mặt vào quái (bản vá cũ).

## Cập nhật (Fix73): cung thủ chạy lùi liên tục
- Nguyên nhân gốc: khoảng cách đứng bắn của cung thủ (DS.a=380) và pháp sư (DS.m=330) lớn bằng cả bề ngang màn hình điện thoại (~393). Điều kiện lùi là quái cách < DS-120 (260/210px) nên hầu như lúc nào có quái trong màn hình cung thủ cũng chạy lùi, về sát mép màn hình → trông như "đi ngược hướng".
- Sửa (core/01-engine.js, bước di chuyển tự động): khoảng cách giữ = min(DS, vw()*0.5) cho cung thủ/pháp sư (chiến binh giữ nguyên). Màn hình rộng (PC) hành vi như cũ. Trên điện thoại chỉ lùi khi quái sát dưới ~76px.
- Vẫn giữ: lúc lùi quay mặt vào quái; luôn quay mặt theo mục tiêu khi đứng yên/đang tung đòn.
