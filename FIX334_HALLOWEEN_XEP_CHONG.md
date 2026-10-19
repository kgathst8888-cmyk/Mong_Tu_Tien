# Fix334 — Halloween xếp chồng khi có người chơi online ở Làng
- Nguyên nhân: world/77 vẽ người chơi khác bằng drawEP() cho từng người; world/99 móc drawEP gọi drawAll() mỗi lần → trang trí/Sứ Giả vẽ N+1 lần/khung, lệch chỗ.
- Vá world/99: cờ drew (reset mỗi vdraw) + chỉ vẽ khi P là nhân vật của mình → mỗi khung chỉ vẽ 1 lần.
