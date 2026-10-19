# Fix335 — Tối ưu hiệu ứng kỹ năng Tiên Nhân (hết giật lag khi tung chiêu)
- Nguyên nhân: >90% thời gian là tô pixel canvas. world/53 (thiên thần/rồng/thiên thạch Tiên tộc) ~1750 lệnh vẽ/khung khi AUTO 3 chiêu.
- world/53: blob() dùng sprite cache; cánh thiên thần cache theo tư thế (LRU 24); lông vũ rơi dùng sprite; rồng 46→32 đoạn khi đông; thiên thạch bớt khói/tia lửa khi đông.
- Chế độ nhẹ tự động window.FXSLOW (khung trung bình >26ms): bớt tia sáng/sao/chùm sáng; world/88 chỉ phủ 1 lớp. Ép: window.FXSLOW_FORCE=0|1.
- world/82: glow bỏ khi alpha<.035; vòng trận bỏ lớp quầng khi FXSLOW.
- Không đổi sát thương/hồi chiêu/logic. Đo: lệnh vẽ/khung giảm ~47%.
