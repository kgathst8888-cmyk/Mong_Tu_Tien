# Fix435 — Vạn Độc Chướng Lâm: thưởng Mảnh Thánh + giới hạn lượt ngày
- Sửa: `world/141-van-doc-chuong-lam.js` (`?v=435`); không sửa file khác.
- Thưởng kết thúc: hạ Boss có 3% (`VD.shP`) rơi thêm 1-2 Mảnh Thánh ngẫu nhiên (`VD.shMin/shMax`, qua `HL.addSH`). Cộng dồn với rương Boss (rương vẫn có 1% ra 1 Mảnh Thánh).
- Giới hạn: tối đa 2 lượt VÀO mỗi ngày (`VD.daily`), tính lúc bấm vào, reset 00:00 giờ Việt Nam (UTC+7) theo Date tin cậy (core/00b, chống chỉnh giờ máy). Lưu `PS[cur].vd9.day/dn`. Hồi chiêu 30 phút vẫn giữ. Thẻ phụ bản/lối tắt Linh Giới hiện 'còn x/2 lượt'.
