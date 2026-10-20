# Fix361 — 2 phụ bản mới + tăng độ khó phụ bản
- File mới: `world/114a-phu-ban-core.js` (window.PBC, lõi dùng chung), `world/115-huyen-canh-kinh-ho.js`, `world/116-cot-hai-sa-mac.js`. Nạp sau 114 trong index.html (?v=361), có trong MODULE_MANIFEST.json. Không sửa core/engine; PBC bọc `gm`, `bgd`, `step`, `foe` đúng 1 lần.
- 🪞 Huyễn Cảnh Kính Hồ (Lv60): vào bằng "Nhà Bí Ẩn (1)" của Làng Tân Thủ 2 (đã đổi tên). Dùng chỉ số map Nhân Giới số 3.
  Quái Ảnh phản 20% sát thương; Sóng Hồ cặp vòng thật/giả đối xứng; boss Kính Hồ Tiên Tử: Thực Thể ↔ Ảnh Thể (Ảnh Thể hồi 85% sát thương, phản 25%), dưới 50% máu có Gương Vỡ.
- 💀 Cốt Hải Sa Mạc (Lv100): vào bằng "Nhà Số 1" của Làng Tân Thủ 3 (đã mở khoá riêng nhà này). Dùng chỉ số map Nhân Giới số 4.
  Bão cát (che tầm nhìn bằng lớp phủ riêng, -0.6% máu/giây, quái chậm 50%); Gai Cát; boss Cốt Long Vương chui cát 4 giây (bất tử) rồi trồi lên kèm 2 vòng gai lớn.
- Hình riêng cho boss (vẽ canvas): Kính Hồ Tiên Tử (2 hình thể), Cốt Long Vương.
- Độ khó (cả Thiên Lôi): Thiên Lôi quái ×1.8 máu ×1.4 sát thương, Boss ×2.4/×1.35, sét dày và đau hơn; Kính Hồ ×1.8/×1.45, Boss ×2.4/×1.35; Cốt Hải ×2.0/×1.6, Tinh Anh ×1.2/×1.1, Boss ×2.6/×1.5. Hệ số tuyệt đối theo loại quái, chỉnh trong `diff` của từng module (Thiên Lôi: `TLC.cfg`).
- Mọi sát thương hazard/phản đòn/bão cát đều KHÔNG giết người chơi (tối thiểu còn 1 máu); quái không bị hạ dưới 1 máu bởi hazard.
- Phần thưởng (EXP/rơi đồ) vẫn theo map gốc, chưa tăng theo độ khó.
- Tắt từng phụ bản: bỏ <script> tương ứng (115/116 cần 114a).
