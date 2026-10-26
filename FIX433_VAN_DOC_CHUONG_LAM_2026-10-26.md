# Fix433 — Phụ bản 6 "Vạn Độc Chướng Lâm" (Đạo Thể)
- File mới: `world/141-van-doc-chuong-lam.js` (nạp cuối, `?v=433`, có trong MODULE_MANIFEST). Sửa nhỏ `world/40-phu-ban-2.js` (thẻ số 6 trong bảng 🕳 Phụ Bản: html/go/refresh). Không sửa engine, không đụng cờ `dg.cu` của Cửu U (module dùng cờ riêng `dg.vd`/`e.vd`).
- Vào: bảng 🕳 Phụ Bản (thẻ 6) hoặc lối tắt cạnh Linh Giới. Chỉ Đạo Thể, Đạo Cảnh Lv71 (Tiên Nhân/Chuyển Thế không cần cấp), hồi chiêu 30 phút từ lúc vào (`PS[cur].vd9`).
- Trận: 24 quái (Nấm Tinh, Nhện Tinh, Rắn Mẹ) -> Boss Độc Mẫu Chướng Vương. Chỉ số lấy từ bản đồ Linh Giới 5 (`LGMAP.cfg[4]`) nhân hệ số trong `VD`.
- Chướng khí: thanh 0-100% tự dâng (~48 giây đầy). Từ 25% trở lên mất máu theo % máu tối đa, KHÔNG tự giết (sàn 1 máu). Ao giải độc (3 ao): đứng trong ao thì chướng khí tụt + hồi chút máu, mỗi ao dùng được 300 khung (~5 giây) rồi héo, hồi lại sau 15 giây. Nấm Tinh/Rắn Mẹ chết nổ mây bào tử (đứng trong mây thì chướng khí dâng nhanh hơn).
- Liều độc đổi EXP: chướng khí càng cao, mỗi quái hạ được cộng thêm Đạo Linh/EXP (`VD.risk`). Tiên Đạo (Ý Cảnh): thanh tâm, chướng khí dâng chậm hơn, ao hiệu quả hơn.
- Boss: Độc Vụ Phun Trào (cột độc báo trước, để lại mây bào tử), Chướng Khí Bùng Phát ở 70% và 35% máu (đẩy chướng khí lên >=60%, thêm mây, gọi Nấm Tinh).
- Thưởng: KHÔNG rơi trang bị. Boss rơi 1 rương ngẫu nhiên (vàng 400k/800k · Quặng Sắt+Huyền Kim 150/300 · 1% Mảnh Thánh) + 10 Linh Thạch KHOÁ (`VD.lk`, cùng kiểu Cửu U).
- Tắt: bỏ `<script>` 141 trong index.html (thẻ 6 tự ẩn).
