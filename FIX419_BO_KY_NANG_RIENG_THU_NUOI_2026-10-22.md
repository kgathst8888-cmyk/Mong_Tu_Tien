# Fix419 — Mỗi thần thú một bộ kỹ năng riêng + thu nhỏ hình cấp 2-3-4

Chu Tước GIỮ NGUYÊN (không sửa pets/22-chu-tuoc.js).

## File đổi
- `pets/32-bo-ky-nang-rieng.js` (MỚI, nạp sau pets/31): `window.PETKIT[0|2|3]` = SKL / order / cd / heal / reb / skill / tick. Xoá file này (và dòng script trong index.html) là về cơ chế cũ.
- `pets/31-than-thu-co-che.js`: make() tra PETKIT (chọn kỹ năng, hồi chiêu, hồi sinh, mô tả, tick); TL_RATE bỏ bỏng/đóng băng (thiên gió–sét); `PETSZ=[1,.8,.8,.8]` áp cho Thanh Long + Huyền Vũ (cả vị trí nòng bắn).
- `pets/27-bach-ho.js`: HH nhân PETSZ; chọn kỹ năng / hồi chiêu / tick tra PETKIT[0].
- `index.html` (?v=419), `MODULE_MANIFEST.json`.

## Bộ kỹ năng mới
| Thú | Vai | Kỹ năng (mở theo cấp 1→4) |
|---|---|---|
| 🐯 Bạch Hổ | Sát thủ cận chiến, KHÔNG hồi máu | Hổ Khiếu Chấn Nhiếp (choáng + hạ giáp) → Kim Phong Bạo (loạt vuốt chảy máu) → Liệp Sát Ấn (kết liễu địch yếu máu, hạ gục: hồi máu chủ + giảm hồi chiêu) → Bạch Hổ Phân Ảnh (8 giây bóng hổ chém liên tục) · hồi sinh 45%/90s |
| 🐉 Thanh Long | Pháp sư tầm xa gió–sét–mộc | Phong Nhận Hoành Tảo (đẩy lùi + chậm) → Liên Hoàn Lôi (sét chuyền 3+ev địch, choáng) → Thanh Mộc Hồi Xuân (hồi máu + năng lượng 6 giây) → Cửu Thiên Long Ngâm (bão sấm 10 giây) · hồi sinh 35%/120s + bão sét · đòn thường: chậm/choáng |
| 💧 Huyền Vũ | Hộ vệ khống chế thủy–băng | Huyền Thủy Hộ Thân (hồi máu + màn nước) → Hàn Băng Lao (cột băng, đóng băng) → Quy Giáp Bất Hoại (khiên 6s giảm 55% ST nhận + hất lùi/choáng) → Trấn Thiên (kéo địch về, đóng băng, khiên 4s giảm 40%) · hồi sinh 40%/120s + khiên 8s giảm 60% · đòn thường: chậm/đóng băng |
Chu Tước (giữ nguyên): Hỏa Vũ, Thiêu Đốt (bỏng), Lao Xuống, Niết Bàn (hồi máu), Thiên Hỏa Phần Thiên, Niết Bàn Trùng Sinh.

## Khiên Huyền Vũ
Bọc `ZC.shd()` (hệ số sát thương nhận, cùng chỗ với Thần Thông/Hồn Phách): `window.HVSH={until,v}`.

## Kích thước
Hình cấp 2, 3, 4 (ev 1..3) của Bạch Hổ / Thanh Long / Huyền Vũ × 0,8 (`PETSZ` ở pets/31). Cấp 1 và Chu Tước không đổi. Muốn đổi: sửa `window.PETSZ=[1,.8,.8,.8]`.
(Tên `PSZ` đã bị core/01l dùng cho kích thước sprite nên dùng `PETSZ`.)

## Chỉnh cân bằng
Hằng số ở khối K0 (Bạch Hổ) / K2 (Thanh Long) / K3 (Huyền Vũ) trong pets/32: hệ số sát thương `mm*…`/`md*…`, hồi chiêu `cd(ev)`, thứ tự xoay chiêu `order(ev)`, thời gian khiên.

## Đã kiểm
node --check 3 file; chạy trình duyệt headless: tải game không lỗi, thi triển đủ mọi kỹ năng ở mọi cấp (3 thú × 4 cấp), hồi sinh, khiên (ZC.shd 1 → 0,45), vẽ thú, UI tab Thú + xem trước; đo chiều cao vẽ cấp 2-3-4 đúng ×0,8. Chưa đánh giá cân bằng sát thương khi chơi thật.
