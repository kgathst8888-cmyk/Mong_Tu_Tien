# Fix231 — Tối ưu hoạt ảnh Thành Thị Linh Giới (bớt loè loẹt, bớt giật lag)

Đo trong trình duyệt giả lập (render phần mềm, 393×852 @2x; chỉ để so sánh tương đối): thời gian vẽ 1 khung `LCT.draw()` — QL0 65→51 ms, QL1 (Cân bằng) 16→12 ms; QL2 giữ nguyên (đã tối giản).

## world/58-linh-gioi-city-art.js
- `MINQL=1`: cảnh này không bao giờ chạy mức "Cao" (QL0): bỏ cực quang, tia sáng trăng, thuyền thứ 2, các tiên nhân loại QL0. Muốn trả lại đầy đủ: đặt `MINQL=0`.
- `GLK=.7`: mọi quầng sáng cộng màu (`gl`, `glE`, `glow` của cổng) giảm 30% → bớt chói. Chỉnh `GLK`.
- Cache gradient (`lgc`/`rgc`, tự xoá khi đổi bố cục): nền trời, thác nước, hình chiếu cổng, sương biển, vignette, cột sáng → hết tạo gradient mới mỗi khung (giảm rác bộ nhớ/giật).
- Bớt hạt/hiệu ứng: sao 130→60 (mức vừa), sao nhấp nháy dịu hơn, bỏ chữ thập sao; đom đóm, bát quái quanh trận pháp, vòng nét đứt cột sáng chỉ ở QL0; cánh hoa anh đào 12→8; đèn dây nháy 1/2; khói nhang 6→4 sợi; đèn Khổng Minh ≤5; tia thác 5→3; hạt thuyền 8→4; tiên nhân: bụi sao ~½, bỏ vệt gió + ảnh tàn, phất trần 16→8 sợi, cánh hoa 14/9→8/5, vẽ thân bằng `imageSmoothingQuality='medium'`; hạc 5→3; cổng 3→2 cung sáng; `CAP` 1.5→1.25.
## world/58, 62, 65 — bỏ `shadowBlur` vẽ mỗi khung (rất nặng)
- Nhãn cổng: bóng đổ bằng hình chữ nhật lệch 2px thay `shadowBlur=8`.
- Khung xoáy cổng Ác Ma / Về Làng: halo nét dày mờ thay `shadowBlur`.
## world/62-ac-ma-thuong-gioi.js
- Cổng Ác Ma dịu hơn: quầng sáng giảm, tia 12→6, hạt lửa 10→5 (2 chỗ).
