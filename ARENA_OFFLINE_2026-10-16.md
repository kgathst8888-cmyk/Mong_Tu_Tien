# Arena — đấu người chơi offline kể cả khi chưa có hồ sơ đầy đủ (chỉ sửa systems/19-arena.js)
- Trước: người chơi offline chưa có hồ sơ chiến đấu (arena_prof) thì nút ĐẤU bị khóa.
- Nay: nút ĐẤU luôn bấm được. Có hồ sơ đầy đủ -> dùng như cũ. Chưa có -> hàm estProf() dựng bản sao ước tính (HP/MP/công/thủ = chỉ số bạn x tỉ lệ lực chiến; skill theo lớp/nhánh/tier).
- Điểm/lượt vẫn do arena_begin/arena_end xử lý, không đổi SQL.
