# Fix333 — Cánh nằm dưới mông khi Tiên Nhân đi hướng lên (Tiên Giới)
- Nguyên nhân: world/74 nâng người theo độ bay up=fo+hv·nhấp nhô và nâng cả drawWings; riêng hướng lên (sec>=5) world/78 vẽ cánh SAU khi vẽ người (đè lên thân) nhưng KHÔNG nâng → cánh tụt xuống ngang mông.
- Vá world/78 hero wrapper: tịnh tiến -up*s khi vẽ cánh hướng lên (cùng công thức up của world/74).
