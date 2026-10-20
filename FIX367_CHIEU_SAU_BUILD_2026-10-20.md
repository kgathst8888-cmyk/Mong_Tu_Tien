# Fix367 — Chiều sâu build: Cộng Hưởng Môn Phái × Linh Căn · Mốc Thức Tỉnh Thần Thú · Thức Tỉnh Pháp Bảo
- 3 phần độc lập, **không sửa engine, không lưu thêm dữ liệu, không cần chạy SQL**. Mỗi phần gỡ riêng được bằng cách xoá thẻ `<script>` tương ứng.
- File mới: `world/122-cong-huong-mon-phai.js` (window.CHM) · `world/123-phap-bao-thuc-tinh.js` (window.FBA). Viết lại: `ui/26-pet-evo4-lock.js` (window.PETEV4; giữ tên file cũ nên chỗ nạp không đổi). Sửa: `index.html` (2 thẻ script sau world/121 + `?v=367` cho ui/26), `MODULE_MANIFEST.json`.
- Phân biệt với Ngũ Hành (world/113): Ngũ Hành là sinh/khắc **giữa người và quái** (nhân sát thương gây/nhận theo hệ bản đồ). Cộng Hưởng là **kỹ năng môn phái hợp với Linh Căn** (thưởng + hiệu ứng kích hoạt), hai hệ cộng dồn độc lập.

## 1) Cộng Hưởng Môn Phái × Linh Căn (world/122)
Mỗi môn có một hệ chủ đạo: Phần Thiên Hỏa · Vạn Độc Mộc · Huyền Băng Thủy · U Minh Thủy · Thiên Kiếm Kim · Ngự Cổ Thổ (`SECT_EL`). So với Linh Căn (Tháp, `PS[cur].tw.root`):
| Bậc | Điều kiện | +% sát thương kỹ năng phái* | Kích hoạt/đòn trúng |
|---|---|---|---|
| 3 Cộng Hưởng | cùng hệ | +12% | 30% |
| 2 Tương Sinh | căn sinh hệ môn | +7% | 18% |
| 1 Tiết Khí | hệ môn sinh căn | +3% | 10% |
| 0 Bình Hoà / Xung Khắc | còn lại | 0 (không phạt) | – |
\*nhân hệ số tầng Linh Căn: 0,7 + 0,3 × tầng/15 (tầng 1 ≈ 72%, tầng 15 = 100%). Kích hoạt có hồi nội tại 30 khung (0,5 giây), không kích hoạt bằng sát thương DoT.
- **Hiệu ứng theo Linh Căn** (mọi bậc ≥1): Hỏa thêm Thiêu · Mộc hồi 0,6% máu · Thủy làm chậm + hồi 1% MP · Kim xuyên giáp · Thổ choáng ngắn (boss chỉ bị chậm).
- **Dấu ấn theo môn phái** (bậc 2–3): Phần Thiên +1 tầng Thiêu cho kẻ đang cháy · Huyền Băng +1 Hàn Khí · Vạn Độc +1 tầng Độc · Thiên Kiếm cấp Kiếm Ý · Ngự Cổ cấp Cổ Độc · U Minh hút 0,8% máu.
- **Viên Mãn:** bậc 3 + Linh Căn tầng 15 → tuyệt kỹ môn phái thêm +15%.
- Cách làm: bọc `MPK.run` (world/99) rồi bọc `A.hit` của adapter của riêng lần tung đó → chạy cả bản đồ thường (world/72) và Tiên Giới (world/81). Chỉ chiêu đi qua MPK (cờ `mk:1`) được cộng hưởng; Huyết Ảnh Truy Hồn, Ma Liêm Đoạt Mệnh, Kim Giáp Cổ giữ nguyên.
- UI: chip nhỏ “☯ Cộng Hưởng +x%” dưới chip Ngũ Hành ở giữa trên màn hình; bấm vào mở bảng 6 môn × 5 căn. Không có chip nếu chưa chọn môn/Linh Căn hoặc bậc 0.
- Chỉnh: `CHM_CF` (dmg · lvBase · proc · icd · full · enable) và `SECT_EL`. API: `CHM.info()` · `CHM.tier(môn,căn)` · `CHM.open()`.

## 2) Mốc Thức Tỉnh Thần Thú (ui/26)
Cả 4 thú đã có cơ chế đầy đủ nên không còn khoá cứng tiến hoá cấp 4. Thay bằng mốc (chỉ chặn bước cấp 3 → cấp 4, sau khi đã đủ điều kiện gốc của từng thú):
- Cảnh giới ≥ **Hoá Thần** (`realm:4`, cùng thang `ZC.rI()` với bảng EVO ở pets/31).
- **Linh Căn** đã chọn và đạt **tầng ≥ 8** (`lcLv`).
- **Phí Thức Tỉnh 20.000.000💰** (`gold`), thu thêm ngoài phí gốc, chỉ thu khi tiến hoá thật sự thành công.
- UI: bảng “Mốc Thức Tỉnh Thần Thú” với ✔/✘ từng mốc dưới thẻ thú; nút khoá cho tới khi đủ mốc. Thú đã cấp 4 từ trước giữ nguyên.
- Chỉnh: `PETEV4_CF` (`on` · `lock` · `realm` · `lcLv` · `gold`). Muốn khoá lại như cũ: `PETEV4_CF.lock=true`. Muốn bỏ mốc hoàn toàn: xoá thẻ script (về luật gốc).
- Lưu ý: Thanh Long vẫn cần Đan Đột Phá Cảnh Giới 4 theo luật gốc.

## 3) Thức Tỉnh Pháp Bảo Bổn Mệnh (world/123)
Hiệu ứng thêm vào **kỹ năng chủ động** của Pháp Bảo theo số ★ Tinh Luyện (`TLP.star()`, world/110) — nên vừa tạo chỗ tiêu cho Tinh Luyện, vừa không đụng world/48. Chưa Tinh Luyện hoặc ★<3 = không đổi gì.
| Pháp bảo | ★3 | ★5 (Đại Thành) |
|---|---|---|
| 🗡️ Kiếm Linh | Kiếm Vũ Tam Điệp: 3 nhát phi kiếm bồi thêm | Vạn Kiếm Quy Tông: 6 nhát + 6 giây +20% sát thương |
| 🏺 Hồ Lô | Dưỡng Linh Hồi Xuân: hồi 5% máu + 3% MP | Vạn Quỷ Triều: hồi 7,5% + 3 đợt sóng quanh người (đánh + làm chậm) |
| 🚩 Hồn Phiên | Hồn Phệ: 5 địch gần nhất nhiễm độc + hồi 6% MP | U Minh Bạo Hồn: sau 6 giây kẻ bị nhiễm còn sống nổ lan |
| 🪓 Cự Phủ | Chấn Địa Dư Chấn: thêm 1 chấn động + choáng sau 0,6 giây | Khai Thiên Tam Chấn: thêm chấn động thứ 3 + hồi 5% máu |
- Cách làm: theo dõi bộ đếm `FABAO.data().c[loại]` (tăng 1 mỗi lần tung thành công) rồi cộng hiệu ứng bằng `dm()`/`ST.apply()`; đổi loại pháp bảo, vào Làng, chết/khởi động lại đều xoá hiệu ứng đang chờ. Buff +20% của Kiếm cộng qua `twB('dmgp')`.
- Dòng “✨ Thức Tỉnh …” hiện dưới dòng ★ Tinh Luyện ở thẻ Pháp Bảo (ô nhân vật), cho biết ★3/★5 đã mở chưa.
- Chỉnh: `FBA_CF` (số nhát, hệ số, thời gian). API: `FBA.info()`.

## Đã kiểm tra
- `node --check` cả 3 file; mô phỏng 38 tình huống (bậc cộng hưởng, nhân sát thương, ICD, dấu ấn từng môn, mốc tiến hoá + phí, đếm nhát/sóng/chấn, huỷ khi vào Làng).
- Nạp game thật trong Chromium headless: không có lỗi script; gọi thật `CHM.info()`, `petUI()`, `FBA.info()` đều trả đúng.
- Chưa thử bằng tay: cảm giác cân bằng trong trận thật (số liệu mặc định chọn thận trọng), hiển thị chip trên điện thoại nhỏ.

## Gợi ý tiếp
Thêm vào bảng thống kê nhân vật dòng “Cộng Hưởng”; Tông Môn thêm buff Cộng Hưởng theo cấp tông; mở rộng cộng hưởng cho 3 chiêu chưa qua MPK (cần thêm `mk:1` ở SPEC world/72).
