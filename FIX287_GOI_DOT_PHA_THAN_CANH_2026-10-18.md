# Fix287 — 2 gói quà mới ở 🎉 Sự kiện → 🎁 Gói quà (ui/82-su-kien-nap-the.js)
- 💊 **Gói Đột Phá · 500💎**: Trúc Cơ Đan ×10 · Kim Đan Đan ×10 · Nguyên Anh Đan ×10 · Bùa EXP +50% ×2 (vé tăng 50% EXP, 2 giờ/vé).
- 🪽 **Gói Thần Cánh 1 · 200💎**: Mảnh Cánh Cấp 1 ×3 · Mảnh Cánh Cấp 2 ×1.
- Mua bằng 💎 KHÔNG KHOÁ, mỗi nhân vật 1 lần/gói (như các gói cũ). Đan vào Linh Điền (FM.get().pills), mảnh cánh vào kho mảnh cánh (WFA + dgSave), bùa EXP vào Cash Shop.
- Code: thêm 2 dòng vào `CFG.gq`; `desc/merge/grant` hỗ trợ trường mới `pl:{dtc,dkd,dna}` (đan) và `wf:{0,1,2}` (mảnh cánh cấp 1/2/3) — dùng lại được cho sự kiện, điểm danh, Thẻ Trưởng Thành.
- Đã thử trong game: mua → đủ đan/mảnh/bùa, trừ đúng 💎, mua lần 2 bị chặn.
