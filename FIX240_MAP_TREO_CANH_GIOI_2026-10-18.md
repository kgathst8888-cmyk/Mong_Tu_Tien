# Fix240 — Map Treo: quái theo Lv + dạng thể, tu vi tu tiên 80%, cảnh báo ở bảng (2026-10-18)

## EXP lên cấp = 100% như map ngoài
`CF.realmXp = [1,1,1]` (không tăng theo dạng thể). Công thức EXP quái giữ nguyên engine.

## Hệ thống tu vi cảnh giới tu tiên ở map treo = 80% map ngoài (`CF.tvK = .8`)
Map ngoài có 2 nguồn tu vi, map treo nhận cả hai × 0.8:
1. Mỗi quái hạ: `ceil((3+Lv×.8)×TV.farm)` (×LGX ở Linh Giới).
2. Tự tu luyện mỗi giây: `(1+tầng×.6)×TV.auto` (×LGX ở Linh Giới).
- Online: bọc `ZC.kill` và `ZC.tick` (tạm nhân TV.farm / TV.auto). Offline: `tvOff()` tính cả 2 nguồn rồi `ZC.gain` 1 lần (tự lên tầng, dừng ở ngưỡng đột phá). Cảnh giới Hoá Thần trở lên (rI≥5) không tu vi qua đánh quái như map ngoài.
- Bảng Cổng Treo Máy có dòng 🧘 tu vi ước tính/giờ; báo cáo offline có dòng 🧘 Tu vi.
- Ví dụ 1 giờ, Lv45, Luyện Khí tầng 2: 360 quái → +13.056 tu vi (5.760 hạ quái + 7.296 tự tu), EXP +54.000 (100%).

## Quái theo Lv & dạng thể (Phàm / Đạo / Tiên)
máu `[1,1.5,2.5]` · thủ `[1,1.2,1.5]` · sát thương `[1,1.3,1.6]` · vàng `[1,1.5,2]` (khối CF đầu world/80).

## Cảnh báo ở bảng thông tin
Khối ⚠️ CẢNH BÁO · MAP TREO OFFLINE (quái mạnh theo dạng thể, tu vi 80% + EXP 100%, giờ trừ cả khi tắt game, rời map = mất treo offline, chỉ rơi EXP/vàng/nguyên liệu, chờ lưu xong rồi tắt).

## File đổi
`world/80-map-treo.js` · `core/01e-step-loop.js` (sát thương quái nhân `e.rm`, mặc định 1).
