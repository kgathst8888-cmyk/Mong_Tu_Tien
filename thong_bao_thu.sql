-- THÔNG BÁO + THƯ HỆ THỐNG (chạy 1 lần trong Supabase → SQL Editor)
-- Game gọi RPC lay_thong_bao() khi đã đăng nhập ☁. Chưa chạy file này thì game vẫn chạy bình thường
-- (chỉ dùng thông báo có sẵn trong ui/69-thong-bao-thu.js và thư gửi từ trong game).

create table if not exists public.thong_bao(
  id        bigserial primary key,
  loai      text not null default 'tb' check (loai in ('tb','thu')),  -- tb = thông báo · thu = thư hệ thống (có thể kèm quà)
  tieu_de   text not null,
  noi_dung  text not null default '',
  qua       jsonb,                    -- chỉ dùng cho loai='thu'
  tao_luc   timestamptz not null default now(),
  het_han   timestamptz               -- null = không hết hạn
);
alter table public.thong_bao enable row level security;  -- không tạo policy: người chơi chỉ đọc qua hàm bên dưới

create or replace function public.lay_thong_bao() returns jsonb
language sql security definer set search_path=public as $$
  select coalesce(jsonb_agg(to_jsonb(t) order by t.id desc),'[]'::jsonb)
  from (select id,loai,tieu_de,noi_dung,qua,tao_luc from public.thong_bao
        where het_han is null or het_han>now() order by id desc limit 30) t
$$;
grant execute on function public.lay_thong_bao() to anon, authenticated;

-- ===== VÍ DỤ (bỏ dấu -- để chạy) =====
-- Thông báo:
-- insert into public.thong_bao(loai,tieu_de,noi_dung) values ('tb','Bảo trì 22h tối nay','Máy chủ bảo trì khoảng 30 phút.');
-- Thư có quà (qua: gold · csh{b10,b15,b20,ham,g10,dh,vx,vt} · fe · hk · eq{r:0-5,n}). Mỗi nhân vật nhận 1 lần, thư trong 14 ngày gần nhất:
-- insert into public.thong_bao(loai,tieu_de,noi_dung,qua) values ('thu','Quà tạ lỗi bảo trì','Cảm ơn đạo hữu đã chờ!',
--   '{"gold":1000000,"csh":{"vx":1,"vt":1},"eq":{"r":3,"n":1}}');
