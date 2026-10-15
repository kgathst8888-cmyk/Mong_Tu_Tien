# Kho riêng Mảnh Sách Thần Thông (world/34-than-thong.js)
- **Lỗi cũ**: mảnh sách nằm trong túi (BAG, `it.tt`) nên bị Bán nhanh / Dọn đồ yếu / tự bán cuốn mất.
- **Sửa**: mảnh giờ ở kho riêng `PS[cur].tsh = {"h_e": số mảnh}` (h = hệ 0–5, e = linh căn 0–4), KHÔNG vào túi — giống kho đá khảm `PS[cur].gm`. Lưu cùng PS nên save/cloud giữ nguyên.
- **Tự chuyển dữ liệu cũ**: mảnh kiểu cũ còn trong túi (kể cả chồng đã "Tách") tự chuyển sang kho riêng (`TTHONG.migrate()`, chạy lúc nạp và mỗi 0,7s).
- **Bảng Thần Thông**: hiển thị "Kho mảnh sách"; bỏ nút Tách (chợ giờ hỏi số lượng khi bán). Học/đổi ⇄ dùng kho mới.
- **Chợ** (systems/32-cho-giao-dich.js): tab Đăng bán liệt kê mỗi (hệ, linh căn) một dòng → bấm Bán → nhập số mảnh + giá. Món đi chợ: `{ts:1,h,e,q,s:10,r:4,l:1}` (không cần sửa SQL). Hủy/hết hạn/mua về → vào kho mảnh, không cần chỗ trong túi. Mảnh kiểu cũ đã đăng trước bản vá cũng về đúng kho.
- API: `TTHONG.cnt(h,e)`, `TTHONG.give(h,e,q)`, `TTHONG.list/peek/take/back` (cho chợ). Test: `?ttest` → nút "Nhặt thử".
