# Thanh Long & Huyền Vũ — cơ chế như Chu Tước (2026-10-14)

Chỉ đụng phần thú nuôi. File mới: `pets/31-than-thu-co-che.js` (nạp sau `pets/24-than-thu-bay.js`).

## Cơ chế (giống Chu Tước)
- Bay lượn tự do, đánh linh hoạt: bắn liên hoàn (cấp 3 bắn 2, cấp 4 bắn 3), bổ nhào từ cấp 2, kỹ năng riêng xoay vòng; mỗi cấp mở thêm kỹ năng.
- Cấp 4 có kỹ năng hồi sinh chủ nhân (Long Hồn Hộ Thể 35% máu / Huyền Vũ Bất Diệt 40% máu, hồi chiêu 120 giây).
- Tiến hoá khó dần: cấp thú đủ mức + cảnh giới (Trúc Cơ / Kim Đan / Nguyên Anh) + vàng + dược thảo Linh Điền.
  - Thanh Long: Tị Lôi Trúc (chính), Linh Chi Thảo, Thiên Tâm Sâm, Xích Hỏa Hoa, Băng Tâm Liên.
  - Huyền Vũ: Băng Tâm Liên (chính), Linh Chi Thảo, Thiên Tâm Sâm, Tị Lôi Trúc, Xích Hỏa Hoa.
  - Thanh Long lên hình cuối vẫn cần Đan Đột Phá Cảnh Giới 4 (như cũ).
- Đòn thú gây trạng thái bằng hệ combat/11-status-effects.js: Thanh Long (cấp 1 đóng băng · cấp 2 bỏng · cấp 3 choáng · cấp 4 băng + bỏng), Huyền Vũ (làm chậm → đóng băng → choáng).
- Hiệu ứng theo hình: Thanh Long sương giá / liệt hỏa / lôi thủy / tinh hà (mưa sao băng, nối chòm sao); Huyền Vũ nước băng, cột băng, khiên rùa, sóng trấn thiên.

## Móc trong core/01-engine.js (cạnh PHX / PTG)
`window.PETX[k]` với step / draw / skill / rebirth / skillsHtml / evoHtml / can / pay — chèn tại epstep, drawEP, ZS.pf.skill, hồi sinh, petUI, pev. Không sửa mảng gốc.
`ui/25-pet-preview.js`: bản xem trước ghi cả 4 thú đã hoàn chỉnh và hiện kỹ năng Thanh Long / Huyền Vũ.

## Chỉnh cân bằng
Trong `31-than-thu-co-che.js`: `EVO` (vàng, dược thảo, cảnh giới), `SKL` (mô tả), `TL_RATE` / `HV_RATE` (tỉ lệ trạng thái), `reb` (hồi sinh).

## Chưa đổi
`ui/26-pet-evo4-lock.js` vẫn khoá tiến hoá cấp 4 (LOCK_EV4=true). Cả 4 thú đã có cơ chế, nếu muốn mở thì đổi `LOCK_EV4` thành false.
