# Fix302 — Đấu Trường: auto dùng kỹ năng + đánh người khác trừ máu

File đổi: `systems/19-arena.js` (không đụng module khác).

1. **Auto không dùng kỹ năng**: vòng lặp đấu trường (`arenaStep`) không giảm hồi chiêu `cd[]` (chỉ `step()` của map mới giảm) → mỗi skill chỉ tung được 1 lần rồi kẹt hồi chiêu. Nay `cd` giảm 1/khung trong trận (đồng bộ với tốc độ x2/x4).
2. **Đánh không trừ máu**: `dm()` tính `công×100/(100+giáp)`; giáp hiện nay lên hàng chục nghìn nên sát thương PvP gần như 0. Nay giáp tính theo tỉ lệ `giáp/(giáp+K)`, `K = Arena.cfg.pvpK × công bên đánh` (mặc định 1). Áp cho cả đòn người chơi → đối thủ (giáp hiệu dụng gán vào `target.df`) và đối thủ → người chơi (`opHit`).
   - Muốn trận nhanh/đau hơn: tăng `Arena.cfg.pvpK` (vd 2); chậm hơn: giảm (vd 0.6).
   - Trận LIVE: mỗi máy tự tính sát thương mình gây ra rồi gửi `dl` như cũ, không đổi giao thức.
