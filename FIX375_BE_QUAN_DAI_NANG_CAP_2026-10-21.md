# Fix375 — Bế Quan Đài nâng cấp (2026-10-21)
Module mới: `world/57b-be-quan-nang-cap.js` (load sau world/59). Dữ liệu: `PS[cur].hpc.bq`.

1. **Nhập định ngoại tuyến** 1/4/8h — 500 hồn phách/giờ ở Đài cấp 0, +25%/cấp; trần 8h/ngày, +2h/cấp. Thu hoạch tự nạp vào tu vi. Lùi giờ máy không được tính thêm.
2. **Tâm Ma Kiếp** (Đài cấp 2+) — đấu tâm, 3 lượt/ngày, thắng 4 lượt trước khi cạn đạo tâm; thưởng 4% tu vi cần của cảnh giới hiện tại + 20% Mảnh Đúc Thần Thể. Không đụng engine chiến đấu.
3. **Cộng hưởng** (Đài cấp 3+) — khắc ấn hồn phách phụ (300💎 lần đầu, 100💎 đổi): +2,5%/cảnh giới (đồng đạo Phật–Tiên, Yêu–Minh) hoặc +1,5%/cảnh giới (khác đạo) cho HP/sát thương/phòng thủ, qua `HONP.sm()`.
4. **Đài Trận Pháp** cấp 0→5: 50/100/200/400/800💎 (LT.spend, cần đăng nhập). Vẽ thêm vòng trận trên đài.

**Tu vi đột phá hồn phách ×25**: `CF.need` trong world/57 = 5.000 / 10.000 / 20.000 / 40.000 / 80.000 / 160.000 / 320.000 / 640.000 (cũ 200…25.600).

Sửa nhỏ trong world/57: mảng `need`, gọi `BQX.deco` trong `draw()`, chèn `BQX.btn()` trong `renderPanel()`. index.html: thêm script 57b, bump `?v=375`.
Chỉnh số: khối `CF` đầu file 57b.

## Fix376 — Nhân vật cũ tụt về cảnh giới đúng với tu vi
Nhân vật chọn hồn phách TRƯỚC mốc `CF.mig.cutoff` (57b) và chưa từng dùng Đài mới sẽ được tính lại **một lần** khi vào game:
tổng tu vi = tu vi các lần đột phá đã qua (bảng cũ 200…25.600) + tu vi đang có → xếp lại vào bảng ×25 → cảnh giới mới, phần dư giữ làm tu vi.
Ví dụ: Kim Đan (r=3) dư 100 → Sơ Khai, 1.500 tu vi · Đại Thừa (r=8) → Kim Đan, 16.000 tu vi.
Hồn phách chưa nạp, thần thể, mảnh/viên không đổi. Lưu `hpc.mg=1` (đã xử lý) và `hpc.mo={r,x}` (cảnh giới/tu vi cũ). Nhân vật tạo sau mốc hoặc đã có `hpc.bq` giữ nguyên.

## Fix377 — Tu vi đột phá từ cảnh giới 2 trở đi ×3 nữa
`CF.need` (world/57) = 5.000 / 30.000 / 60.000 / 120.000 / 240.000 / 480.000 / 960.000 / 1.920.000 (cảnh giới 1 → 2 giữ 5.000; từ cảnh giới 2 trở đi gấp 3 bảng ×25 trước).
Di trú nay có phiên bản: `hpc.mg=2` = đã xếp theo bảng hiện tại. Nhân vật chưa xử lý (mg trống) hoặc đã xử lý theo bản trước (mg=1) được tính lại từ tổng tu vi theo bảng mà họ đã chơi (gốc / ×25), rồi xếp vào bảng mới. Nhân vật tạo sau `CF.mig.cutoff2` giữ nguyên.
Tốc độ nhập định (500/giờ), thưởng Tâm Ma (4% tu vi cần) không đổi — thưởng Tâm Ma tự tăng theo bảng mới.

## Fix378 — rà lỗi
- Cộng hưởng chuyển vào `sm()` nội bộ của world/57 → bảng "hiện +X%" và bảng tu luyện hiển thị đúng (trước đó chỉ engine nhận, bảng hiển thị thiếu phần cộng hưởng).
- Sửa: sau khi nhập định xong, giao diện bị dựng lại mỗi giây (có thể nuốt chạm nút Thu hoạch trên điện thoại) → nay chỉ dựng lại 1 lần.
- Sửa: đổi nhân vật giữa ván Tâm Ma thì bỏ ván dở.
- Đính chính: chống chỉnh giờ chỉ chặn LÙI giờ máy; chỉnh TIẾN giờ máy vẫn lách được trần giờ/ngày và lượt Tâm Ma. Muốn chặn hẳn cần lấy giờ máy chủ (Supabase).
