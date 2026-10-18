# Fix238 — Bộ kỹ năng RIÊNG cho 6 môn phái + bóng mờ vũ khí trên trời (2026-10-18)

## Vấn đề
6 môn phái trước đây dùng chung các "kiểu chiêu" (proj/multi/dash/aoe/freeze/sweep/dot…), chỉ khác số liệu và hiệu ứng.

## Cách làm
- `world/72` SPEC: mỗi chiêu môn phái có kiểu riêng (`umt1…ngc5`, cờ `mk:1`). Giữ nguyên 3 chiêu vốn đã độc nhất: Huyết Ảnh Truy Hồn (mark), Ma Liêm Đoạt Mệnh (exec), Kim Giáp Cổ (shield).
- `world/99-mon-phai-co-che-rieng.js` (MPK): cơ chế từng chiêu, viết một lần, chạy qua adapter ở `world/72` (bản đồ thường, 1 chiều) và `world/81` (Tiên Giới, 2.5D).
- `world/99-mon-phai-than-thong.js`: hiệu ứng vẽ vector riêng từng chiêu + **bóng mờ vũ khí khổng lồ trên trời khi tung tuyệt kỹ** (ảnh `MPW3`), hiện dần, tồn tại đúng `sp.dur` giây của tuyệt kỹ, hết tuyệt kỹ thì tan biến. Độc lập với `TG8SK_CF.max`.
- `world/71`: mô tả kỹ năng mới. `world/83`: neo tâm hiệu ứng theo mục tiêu cho kiểu mới (`MPTT_AN`).

## Bản sắc từng môn
| Môn | Cơ chế đặc trưng |
|---|---|
| U Minh Ma Tông | hút máu, Ám Ảnh nổ chậm, phân thân đánh nhiều mục tiêu, kết liễu kẻ <25% |
| Huyền Băng Điện | Hàn Khí 5 tầng → Vỡ Băng nổ lan; giam băng rồi Nứt Vỡ; bão tuyết kết thúc Vỡ Băng hàng loạt |
| Phần Thiên Cốc | tầng Thiêu Đốt; Liệt Diễm Bạo Phát KÍCH NỔ tầng (+40%/tầng); phượng hoàng hồi 6% máu; thiên thạch ngẫu nhiên |
| Thiên Kiếm Tông | kiếm khí nảy chuyền 4 mục tiêu; phi kiếm tự truy kích; Kiếm Ý +30% chiêu kế; chém thủ lĩnh; kiếm trận tăng dần |
| Vạn Độc Môn | tầng Độc (10); độc châm rải 3 mục tiêu; kích độc + độc lan khi chết; độc xà săn mồi; Độc Phát cuối ult |
| Ngự Cổ Thánh Điện | cổ bám đổi mục tiêu; cổ độc +20% sát thương nhận; Cổ Vương đập + choáng; triều cổ lan vòng + Cổ Tử nổ |

## Chỉnh
`MPK.CF.enable` · `MPTT_CF.enable/ghost/ghostA/q` · cân bằng sửa `mul/cd` trong SPEC (world/72). Thử bóng mờ nhanh: `MPTT.ghost('tkt',300)`.

## Cập nhật hình khối riêng từng phái
Nền đất / vòng / trận pháp không còn dùng chung khung tròn nét đứt: U Minh = vết nứt gai nhọn + vòng cung đứt; Huyền Băng = tấm băng góc cạnh + vòng gai băng + hoa tuyết; Phần Thiên = vùng dung nham lượn sóng + tia mặt trời; Thiên Kiếm = hình thoi đường thẳng + lưới kiếm trận, kiếm khí là lưỡi thẳng; Vạn Độc = vũng độc loang + xoắn ốc + giọt nhỏ; Ngự Cổ = lục giác tổ ong. Tuyệt kỹ có màu không khí riêng (huyết tối · tuyết trắng xanh · cam nóng · cột sáng vàng · lục độc · tím cổ).
