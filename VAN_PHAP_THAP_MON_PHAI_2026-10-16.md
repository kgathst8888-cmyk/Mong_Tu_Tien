# Vạn Pháp Tháp — chọn môn phái (Fix132)
- File mới: world/71-van-phap-mon-phai.js (nạp sau 66 trong index.html + MODULE_MANIFEST). Mở mục pagoda của Tiên Giới (open=1, go=mở bảng).
- 6 môn: U Minh Ma Tông, Huyền Băng Điện, Phần Thiên Cốc, Thiên Kiếm Tông, Vạn Độc Môn, Ngự Cổ Thánh Điện (4 kỹ năng + bị động + tuyệt kỹ mỗi môn).
- Lưu: FM.get().sect; sửa systems/08-farming-alchemy.js ld() để giữ trường sect. API: VP.get/set/open/SECTS.
- CHƯA gắn chiến đấu: hiệu ứng kỹ năng chưa hoạt động, chỉ chọn/lưu/xem mô tả.

## Fix133 — kỹ năng môn phái chạy trong chiến đấu (world/72-mon-phai-ky-nang.js)
- Chọn môn → kỹ năng 1 mở ngay; kỹ năng 2..6 mở theo cấp nhân vật CF.unlock=[0,10,20,30,40,50] (đã mở thì giữ mãi, lưu vp.mx).
- Cấp kỹ năng 1..10 theo SỐ LẦN DÙNG (bị động: số lần kích hoạt). Lên cấp L→L+1 cần CF.useBase(12)×L lần (tổng 540 lần); mỗi cấp +8% sát thương (CF.lvScale).
- Lưu: PS[cur].vp = {id, u:{môn:[6 số lần dùng]}, mx}. Mỗi nhân vật có môn riêng; mỗi môn giữ tiến độ riêng khi đổi môn.
- Nút #sp-bar (5 nút: KN1-4 + tuyệt kỹ), nằm trong khung #sk-side; tự dùng khi bật AUTO. MP: CF.mp.
- Bảng Vạn Pháp Tháp hiện khoá/cấp/tiến độ từng kỹ năng.
- Xấp xỉ: U Minh Độn chưa tăng tốc chạy; "né tránh" = 35% bỏ qua sát thương trúng mình; lá chắn = hấp thụ; Vạn Độc Mê Vụ chưa giảm công địch; Phệ Linh Cổ Quần giảm phòng thủ = xuyên giáp 10%.
- Chỉnh số liệu: SPEC + CF trong world/72.

## Fix134 — Vạn Pháp Tháp tạm khoá
- Chỉ mở khi cảnh giới bắt đầu bằng "Tiên Nhân" (VP.CF.realm, kiểm tra ZC.nm()). Game chưa có cảnh giới này nên hiện tạm khoá ("Cần cảnh giới Tiên Nhân"); thêm cảnh giới thì tự mở. Thử nhanh: VP.CF.force=true.
- Dữ liệu môn phái/kỹ năng đã có giữ nguyên.

## Fix135 — Ngoại hình theo môn phái + giới tính (world/73-mon-phai-ngoai-hinh.js)
- Trong Vạn Pháp Tháp, lúc chọn môn phái chọn luôn **Nam / Nữ** (có ảnh xem trước); đổi giới tính cùng môn phái cũng được (nút "Đổi giới tính thành…").
- Nhân vật của mình đổi sang hình môn phái + giới tính đã chọn (6 môn × 2 = 12 hình, cắt từ ảnh mẫu, `assets/mon-phai-sprites.js`). Chưa chọn môn → vẽ như cũ.
- Lưu giới tính: PS[cur].vp.g ('m'|'f', mặc định 'm'), mỗi nhân vật riêng. API: VPG.gender()/setGender()/preview(), cấu hình VPG_CF (enable, h = chiều cao vẽ, strips).
- Cách gắn: bọc hero() lớp ngoài cùng (như equipment/51); chỉ nhân vật của mình, Làng Online/Đấu Trường vẽ như cũ. Cánh vẫn hiện (gọi drawWings).
- Chuyển động 2.5D trên tranh đứng: nhún theo bước, nghiêng người về hướng chạy, vạt áo/tóc bay ngược chiều chạy, bóng + vòng sáng màu môn phái, tàn ảnh khi chạy, lao tới khi đánh; thu phóng theo chiều sâu của bản đồ (s/GY).
- Giới hạn: mỗi hình là 1 tư thế đứng (chưa có khung hình đi/chạy riêng), vũ khí không vẽ rời (hiệu ứng kỹ năng vẫn chạy như cũ); ảnh mẫu nhỏ nên hơi mờ khi phóng to.
