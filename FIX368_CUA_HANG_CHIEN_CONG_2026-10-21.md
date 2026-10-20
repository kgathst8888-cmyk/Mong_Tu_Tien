# Fix368 — Cửa Hàng Chiến Công (Chiến Trường Tiên·Ma)
- File mới: `world/124-chien-cong-shop.js` (window.CTS, cấu hình `CTS_CF`). Sửa: `index.html` (1 thẻ script sau world/123, `?v=368`), `MODULE_MANIFEST.json`. **Không sửa world/104, không cần SQL.** Gỡ thẻ script → nút biến mất, Chiến Trường vẫn chạy.
- Chiến Công (`PS[cur].ctm.pts`) trước đây chỉ để hiển thị, chưa có chỗ tiêu. Nay có nút **🏅 Cửa Hàng Chiến Công** ở cuối sảnh Nhà Chiến Trường (module theo dõi DOM `#ctm-ov` và chèn nút sau mỗi lần sảnh dựng lại). Đóng cửa hàng thì sảnh được dựng lại để số Chiến Công cập nhật.
- Bảng giá (mặc định, chỉnh ở `CTS_CF.cat`):
| Món | Giá | Giới hạn/tuần |
|---|---|---|
| 🌙 3 Mảnh Nguyệt Thạch | 120 | 5 |
| ⛏️ Gói quặng (500 Thiết + 500 Hắc Kim) | 200 | 3 |
| 🎁 Rương Chiến Công | 300 | 3 |
| 💠 1 Mảnh Thánh | 800 | 1 |
| 🎁 Rương Chiến Công Cao Cấp | 1.000 | 1 |
- Rương Chiến Công: Sử Thi 45% · Thần Thoại 15% · 3 Mảnh Nguyệt Thạch 25% · 2.000.000💰 10% · **1 Mảnh Thánh 5%**. Cao Cấp: Thần Thoại 45% · Thiên Thần 8% · 6 Mảnh Nguyệt Thạch 22% · **1 Mảnh Thánh 20%** · **2 Mảnh Thánh 5%**. Tỉ lệ hiển thị công khai trong cửa hàng.
- Giới hạn làm mới **thứ Hai 00:00 giờ VN**, lưu theo từng nhân vật ở `PS[cur].ctm.shop = {wk, b:{id:số lượt}}`.
- Thứ tự an toàn: kiểm tra lượt + số dư + chỗ trống túi (với rương/trang bị) → phát vật phẩm → rồi mới trừ Chiến Công; phát lỗi thì không mất Chiến Công.
- Cố ý không bán vàng / Linh Thạch. Mảnh Thánh đã rẻ hơn kỳ vọng từ trận thắng (đã có 1 Mảnh Thánh/ngày từ Chiến Trường), nên giới hạn 1/tuần.
- Mức tin cậy: máy khách (cùng mức với Chiến Công, vốn lưu ở máy khách). Nếu sau này muốn chống sửa dữ liệu thì đưa `pts` + lượt tuần lên máy chủ như Cống Hiến (world/108).
- **Cân bằng cần bạn xác nhận:** giá dựa trên ước lượng ~60–100 Chiến Công mỗi trận thắng (CF.winPts=60, winBonus=20, mỗi lính/tướng địch 1–3). Nếu thực tế khác nhiều, chỉnh `cost` trong `CTS_CF.cat`.
- Đã kiểm tra: node --check; chạy game thật (nút xuất hiện, còn sau khi sảnh dựng lại, mua trừ đúng, hết lượt chặn lần 2, rương phát trang bị, sảnh cập nhật số dư); kiểm tra mốc reset tuần (Chủ Nhật 23:59 vs Thứ Hai 00:01 giờ VN).
- API: `CTS.open()` · `CTS.buy(id)` · `CTS.week()` · `CTS.cfg`.
- Gợi ý tiếp: BXH tuần Chiến Công, ghép trận theo lực chiến, danh hiệu/khung avatar theo mùa dùng Chiến Công (hệ avatar/khung ở world/51b).
