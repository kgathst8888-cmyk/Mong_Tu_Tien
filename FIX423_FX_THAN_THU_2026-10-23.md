# Fix423 — Hiệu ứng kỹ năng thần thú (phong cách tiên hiệp)

Module MỚI `pets/33-fx-than-thu.js` (nạp sau pets/32). Chỉ THÊM lớp hình ảnh bọc `PETKIT[0|2|3].skill`; KHÔNG đổi sát thương, hồi chiêu, cơ chế. Chu Tước không đổi.

- 🐯 Bạch Hổ: pháp trận vàng xoay, tia sáng toả, vệt chém trăng khuyết, ấn Liệp Sát trên mục tiêu, Phân Ảnh chém lớn.
- 🐉 Thanh Long: ruy-băng gió/rồng bay, sét nổ cầu, cánh hoa mộc xoáy + vòng hồi xuân, mây bão + rồng sét.
- 💧 Huyền Vũ: sóng gợn + bọt, mảnh băng + tuyết, khiên mai rùa lục giác (đúng thời gian khiên), xoáy nước Trấn Thiên, Bất Diệt khiên vàng.

Công tắc: `window.PETFX_OFF=true` tắt hết; `window.PETFX_LITE=true` giảm một nửa số hạt (máy yếu). Gỡ module: xoá dòng script trong index.html.
Helper dùng lại: `window.PETFX = {circ,rays,cres,spiral,ribbon,hex,cloud,snow,vortex}`.
Đã kiểm: node --check; trình duyệt headless cast 15 kỹ năng (3 thú × cấp 4 + hồi sinh) không lỗi, chụp ảnh xác nhận pháp trận và khiên lục giác hiển thị.
