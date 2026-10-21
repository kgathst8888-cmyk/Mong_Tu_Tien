# Fix393 — Halloween: đồ hoạ làng + bảng quà gọn (làm trên v40_Fix392_AdminTangNL)
File sửa: world/99-su-kien-halloween.js (duy nhất). Không đổi tỉ lệ rơi, công thức ghép, phần thưởng, dữ liệu lưu (PS[cur].hw).
- Bảng Sứ Giả: tách 3 tab (Làm kẹo / Mở quà / Móc quà), thẻ + thanh tiến độ + icon vẽ canvas; móc quà hiện thanh tiến trình có nút mốc, chỉ mốc đủ điều kiện mới sáng nút Nhận, badge số quà chờ nhận.
- Icon mới: Đường, Bột Mì, Mạch Nha, Kẹo Ngọt/Dẻo/Thối, Bí Ngô, Bí Ngô Ma Quái (dựng 1 lần, cache dataURL).
- Làng: 3 kiểu mặt bí ngô, cây khô, quạ đậu bia mộ, nến chập chờn, dây đèn 3 màu + đèn lồng bí ngô đung đưa + nhện treo, vạc phù thuỷ sủi bọt cạnh Sứ Giả, lá rụng.
- Hiệu năng: mọi hình dựng sẵn bằng sprite, mỗi khung chỉ drawImage; vẫn vẽ 1 lần/khung (giữ nguyên cơ chế Fix334).
- Kiểm tra: node --check OK; render thử bằng Chromium headless không lỗi.
