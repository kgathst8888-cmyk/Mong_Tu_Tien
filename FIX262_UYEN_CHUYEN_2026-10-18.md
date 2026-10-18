# Fix262 — hoạt ảnh uyển chuyển, giống thật hơn (2026-10-18)

Nâng cấp world/93-mon-phai-tay.js (trên nền cắt rời bộ phận Fix261):
- **Nội suy cong** (Catmull-Rom) qua các tư thế thay cho từng đoạn rời → vận tốc liên tục, không còn cảm giác "bật từng mốc".
- **Lò xo quán tính** cho mọi biến điều khiển: hướng cẳng tay & khuỷu bám nhanh, **vũ khí vung trễ hơn tay và nảy nhẹ khi dừng** (follow-through), độ lao/ngả và sáng cũng qua lò xo → vào/ra chiêu êm, bấm chiêu liên tục không giật.
- **Kéo xiên theo gia tốc**: thân/đầu/áo dưới bị kéo xiên ngược hướng lao (đầu kéo nhiều hơn, rồi bắt kịp).
- **Nhịp thời gian**: lấy đà dài → chạm đỉnh → chém nhanh → theo đà → thu chậm; mặc định 62 khung/chiêu (`MPAR_CF.dur`).
- Các tuỳ chọn cũ giữ nguyên: `MPAR_CF.rig / power / always / trail / enable`.
