-- =====================================================================
-- NHÀ TINH LUYỆN · LUYỆN THÁNH KHÍ (Làng Tân Thủ 3 · Nhà Số 5) — Fix394
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI.
--
--   * tk_user : MỖI TÀI KHOẢN 1 dòng — số gói nguyên liệu chính (Thánh Tinh Nguyên / Thần Hoả Tinh Phách /
--               Long Hồn Thần Lân / Thiên Đạo Phù Văn) và số Thánh Khí đã luyện (4 món). Máy chủ giữ, máy khách chỉ đọc.
--   * tk_me()        : đọc kho.
--   * tk_make(p_kind, p_n): +p_n (1..100) nguyên liệu chính (1=Tinh 2=Hoả 3=Long 4=Văn), mỗi cái ghép từ nguyên liệu thô. Máy khách đã trừ nguyên liệu thô + 1 triệu vàng/cái
--                      trước (nguyên liệu thô rơi/nằm trong save máy khách); lỗi thì máy khách tự hoàn.
--   * tk_fuse()      : cần đủ 100 mỗi loại trong 4 loại → trừ mỗi loại 100, ngẫu nhiên 1 trong 4 Thánh Khí (máy chủ quay), +1 món. NGUYÊN TỬ.
--                      Linh Thạch + 500 triệu vàng trừ ở máy khách trước; lỗi thì máy khách tự hoàn.
--   => Gói nguyên liệu chính và Thánh Khí KHÔNG thể tự thêm bằng cách sửa save.
--   (Tên/chỉ số 4 món Thánh Khí sẽ cập nhật sau — chỉ cần đổi phía JS, cột k1..k4 giữ nguyên.)
-- =====================================================================
create table if not exists public.tk_user(
  uid     uuid primary key references auth.users(id) on delete cascade,
  p1 int not null default 0, p2 int not null default 0, p3 int not null default 0, p4 int not null default 0,
  k1 int not null default 0, k2 int not null default 0, k3 int not null default 0, k4 int not null default 0,
  updated timestamptz not null default now()
);
alter table public.tk_user enable row level security;
revoke all on public.tk_user from anon, authenticated;

create or replace function public.tk_me() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tk_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  insert into public.tk_user(uid) values (v_u) on conflict (uid) do nothing;
  select * into r from public.tk_user where uid = v_u;
  return json_build_object('status', 'ok', 'p', json_build_array(r.p1, r.p2, r.p3, r.p4), 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
end $$;

-- Bản cũ tk_make(int) (nếu đã chạy trước đó) được thay bằng bản có p_n
drop function if exists public.tk_make(int);
create or replace function public.tk_make(p_kind int, p_n int default 1) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tk_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind is null or p_kind < 1 or p_kind > 4 or p_n is null or p_n < 1 or p_n > 100 then return json_build_object('status', 'bad'); end if;
  insert into public.tk_user(uid) values (v_u) on conflict (uid) do nothing;
  update public.tk_user set
      p1 = p1 + (p_kind = 1)::int * p_n, p2 = p2 + (p_kind = 2)::int * p_n,
      p3 = p3 + (p_kind = 3)::int * p_n, p4 = p4 + (p_kind = 4)::int * p_n, updated = now()
   where uid = v_u returning * into r;
  return json_build_object('status', 'ok', 'p', json_build_array(r.p1, r.p2, r.p3, r.p4), 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
end $$;

create or replace function public.tk_fuse() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tk_user; v_i int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  insert into public.tk_user(uid) values (v_u) on conflict (uid) do nothing;
  select * into r from public.tk_user where uid = v_u for update;
  if r.p1 < 100 or r.p2 < 100 or r.p3 < 100 or r.p4 < 100 then
    return json_build_object('status', 'poor', 'p', json_build_array(r.p1, r.p2, r.p3, r.p4), 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
  end if;
  v_i := 1 + floor(random() * 4)::int;
  update public.tk_user set
      p1 = p1 - 100, p2 = p2 - 100, p3 = p3 - 100, p4 = p4 - 100,
      k1 = k1 + (v_i = 1)::int, k2 = k2 + (v_i = 2)::int, k3 = k3 + (v_i = 3)::int, k4 = k4 + (v_i = 4)::int,
      updated = now()
   where uid = v_u returning * into r;
  return json_build_object('status', 'ok', 'idx', v_i - 1,
    'p', json_build_array(r.p1, r.p2, r.p3, r.p4), 'k', json_build_array(r.k1, r.k2, r.k3, r.k4));
end $$;

revoke all on function public.tk_me(), public.tk_make(int, int), public.tk_fuse() from public, anon;
grant execute on function public.tk_me(), public.tk_make(int, int), public.tk_fuse() to authenticated;
