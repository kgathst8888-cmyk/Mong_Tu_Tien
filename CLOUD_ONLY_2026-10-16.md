# ☁ Chỉ lưu đám mây · chạy nền · bỏ "Game mới" · lưu nhanh (Fix152)

## 1. Chỉ lưu trên đám mây
- `systems/11-cloud-only.js` (nạp ĐẦU TIÊN, sau `core/00-error-handler.js`): các khoá `kthm2`, `kthm_qs`, `kthm_dg`, `kthm2_arena_v3` (+ chữ ký `kthm_sig_*`) **không còn ghi xuống localStorage** — chuyển vào RAM. Code cũ (sv/ld/qsSave/dgSave/arena) giữ nguyên.
- Lúc mở trang: nếu có phiên đăng nhập → gọi **đồng bộ** `pull_save` rồi đổ vào RAM trước khi game đọc. Đăng nhập xong trang tự tải lại để nạp.
- Người chơi cũ còn bản lưu trên máy: bản đó được đối chiếu/đẩy lên mây như trước, **chỉ xoá khỏi máy sau khi đã đồng bộ** (không mất dữ liệu).
- Còn lại trên máy (không phải tiến trình): phiên đăng nhập `kthm_cloud`, khoá tab, cờ giao diện (hướng dẫn, thông báo đã đọc, mức hiệu năng).
- Đã bỏ `kthm_localbak` (bản sao lưu cục bộ) và nút/ý "bản lưu trên máy" trong ☁ Tài khoản.
- Arena (`kthm2_arena_v3`) nay cũng lưu trong gói mây (khoá `ar`).

## 2. Thu nhỏ trình duyệt vẫn chạy
- Nguyên nhân: vòng lặp dùng `requestAnimationFrame`, bị trình duyệt dừng hẳn khi tab ẩn/thu nhỏ.
- `KTHM_TICK` (Web Worker, không bị hạ tốc) gọi `bgTick()` trong `core/01v-perf-boot.js`: chạy `step()` bù đủ nhịp (tối đa 3s/lần), không vẽ. Về lại tab → rAF tiếp quản.
- Đồng bộ mây cũng chạy theo nhịp Worker nên khi thu nhỏ vẫn lưu đều.

## 3. Bỏ "Game mới"
- Menu chính chỉ còn: ▶ Chơi tiếp · 💾 Lưu game (mây) · ⚡ Hiệu năng · ☁ Tài khoản.
- Tài khoản **chưa có bản lưu** → tự vào màn "Tạo nhân vật" (lần đầu duy nhất, không có nút Quay lại).

## 4. Lưu nhanh hơn
- Tự lưu trong game: 20s → **5s** (`core/01e-step-loop.js`, `fr%300`).
- Đẩy mây: trước đây ~30s + 2 lượt gọi; nay **gom thay đổi 2s rồi đẩy thẳng 1 lượt** (tối thiểu 5s giữa 2 lần), lỗi mạng tự thử lại 4s→8s→…→30s (`DEB`, `MINGAP` trong systems/12).
- Rời trang / ẩn tab / `beforeunload`: đẩy ngay (keepalive nếu gói < 60KB).
- Nút 💾 gọi `KTHM_CLOUD.saveNow()` (đẩy ngay).

## Lưu ý
- Máy chủ cần chấp nhận khoá `ar` trong `p_data` của `push_save` (jsonb tự do thì không sao). Nếu có giới hạn tần suất, tăng `MINGAP`.
- Mất mạng giữa chừng: game vẫn chạy, dữ liệu nằm trong RAM; **đóng tab khi chưa có mạng sẽ mất phần chưa đẩy lên**.

## Cập nhật Fix156
- Bỏ hẳn nút "💾 Lưu game" (menu chính + thanh menu trong game): game tự lưu lên mây, không còn khái niệm lưu thủ công/lưu trên máy.
- Nhanh hơn: tự ghi trạng thái 1,5s/lần (`fr%90`); gom thay đổi 0,7s rồi đẩy mây, tối thiểu 1,5s giữa 2 lần (`DEB`,`MINGAP`); kiểm tra hàng đợi mỗi 0,25s; lỗi mạng thử lại 2s→4s→…→15s.
