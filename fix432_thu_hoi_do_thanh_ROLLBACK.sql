-- Hoàn tác Fix432 (phần máy chủ). Chạy TRƯỚC khi người chơi đăng nhập để chặn thu hồi những nhân vật chưa xử lý.
delete from public.thanh_thuhoi where done = false;            -- ngừng thu hồi nhân vật chưa đăng nhập
-- Trả Thánh Khí kho tài khoản:
update public.tk_user t set k1 = (b.payload->>'k1')::int, k2 = (b.payload->>'k2')::int, k3 = (b.payload->>'k3')::int, k4 = (b.payload->>'k4')::int, updated = now()
  from public.thanh_thuhoi_bak b where b.kind = 'tk_user' and (b.payload->>'uid')::uuid = t.uid;
-- Trả đồ Thánh trong hòm thư Chợ:
insert into public.cho_inbox(uid, item, why, ts)
select (b.payload->>'uid')::uuid, b.payload->'item', coalesce(b.payload->>'why', 'khôi phục'), now()
  from public.thanh_thuhoi_bak b where b.kind = 'cho_inbox';
-- Trả đồ Thánh đang bán về hòm thư người bán:
insert into public.cho_inbox(uid, item, why, ts)
select (b.payload->>'seller')::uuid, b.payload->'item', 'khôi phục', now()
  from public.thanh_thuhoi_bak b where b.kind = 'cho_listing';
-- Nhân vật ĐÃ bị gỡ đồ: khôi phục từ bản lưu mây (saves_guard 'daily'/'drop' hoặc restore_snapshot trong game) — không có trong file này.
