# Phụ Bản Vàng (Phụ bản 3)
- Vào từ bảng 🕳 Phụ Bản → thẻ "3. Phụ Bản Vàng".
- 1 Boss Bất Tử không thể chết (máu ảo hồi đầy mỗi nhịp, chỉ đo sát thương) · 180 giây khiêu chiến (hoặc tới khi gục / rời trận).
- Vàng = sát thương × 0.01, tối thiểu 20.000 (nếu có gây sát thương), trần = 60.000 × cấp người chơi. Hồi chiêu 1 giờ tính từ lúc vào (theo từng nhân vật); không giới hạn lượt/ngày (đặt `tries` để thêm giới hạn).
- Chỉnh: khối `CF` đầu file `world/42-phu-ban-vang.js` (secs, cd, tries, rate, min, perLv, atk, lv...). `cd` tính bằng ms (3600000 = 1 giờ).
- Dữ liệu: PS[cur].pv = {d, n, b, g}. Module dùng cờ riêng e.pv / dg.pv nên không ảnh hưởng Boss Bất Tử (27) hay Địa Long Điện (40).
