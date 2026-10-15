# Đục lỗ trang bị & Khảm đá (equipment/64-duc-lo-kham-da.js)
- **Đục lỗ** (mở món đồ trong túi/đang mặc → khối 💎 Lỗ khảm): tối đa 2 lỗ. Lỗ 1 = 1 🔨 + 10.000.000💰 + 20💎; lỗ 2 = 3 🔨 + 30.000.000💰 + 60💎. Búa mua ở 🛒 Shop Linh Thạch. Dữ liệu: `it.ho`, `it.gz[]`.
- **Đá**: chỉ rơi Thánh Địa (mỗi boss chết 10% → 1–3 đá cấp 1 chưa mài). Kho riêng `PS[cur].gm` (không vào túi → không bị tự bán). Mài 10💎/viên → opt ngẫu nhiên (không có opt thần thông ttl/sk).
- **Giá trị**: cấp 5 = opt MAX (OPT2.val(k,10)); cấp 4/3/2/1 = 80/60/40/20%.
- **Ghép** 3 đá đã mài cùng cấp → cấp trên (tối đa 5): 40/30/20/10%, phí 10/20/30/40💎, thất bại mất 2 viên (giữ viên ⭐ chọn đầu). **Thành công → đá cấp trên CHƯA MÀI** (mài 10💎 để ra opt ngẫu nhiên mới, giữ nguyên cấp).
- **Tháo đá**: nút "Tháo" cạnh lỗ đã khảm → đá về kho (miễn phí, giữ cấp & opt). Bùa Ghép Ngọc +10% bật trong bảng Đá Khảm.
- **Đá cấp 5**: +50 cả 4 thuộc tính (Sức mạnh/Nhanh nhẹn/Trí tuệ/Thể lực) mỗi viên đang khảm trên đồ ĐANG MẶC (getter trên `PS[i].al`, `toJSON` giữ save nguyên vẹn).
- **Chợ**: đá bán ở Chợ Giao Dịch (tab Đăng bán). Đá đi chợ dưới dạng "món" s=10,gm=1 (không cần sửa SQL), về lại tự vào kho đá. Lưu ý: ở bộ lọc loại của chợ, đá nằm chung nhóm slot 10.
- **Bảo vệ**: món đã đục lỗ không bị Bán nhanh/Dọn đồ yếu/Hợp hàng loạt/Chọn ghép.
- API: `GEMX.add(n)` (thêm đá chưa mài để test), `GEMX.count()`, `GEMX.open()`. Chỉnh số ở khối `CF` đầu file.
