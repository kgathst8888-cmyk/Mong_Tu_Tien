-- =====================================================================
-- Fix432 · THU HỒI TOÀN BỘ ĐỒ THÁNH  (chạy 1 lần trong Supabase SQL Editor; an toàn chạy lại)
--   "Đồ Thánh" gồm:  (1) Trang bị Bộ Thánh (it.hl = 1) trong Túi + đang mặc, mọi nhân vật
--                     (2) Thánh Khí (Kiếm/Cung/Khiên/Trượng): món đang nằm trong kho tài khoản (tk_user.k1..k4)
--                         + món nhân vật đã chọn/nâng cấp (PS[slot].tkq)
--                     (3) đồ Thánh đang đăng bán ở Chợ / nằm trong hòm thư Chợ
--   KHÔNG đụng: Mảnh Thánh, Mảnh Thánh Khí, gói nguyên liệu chính (tk_user.p1..p4), nguyên liệu thô.
--   Có SAO LƯU trước khi xoá (bảng thanh_thuhoi_bak) và file ROLLBACK đi kèm.
--   Nhân vật thu hồi theo cách Fix420: máy khách hỏi RPC thanh_thuhoi khi đăng nhập → tự gỡ → đẩy mây → báo xong.
-- =====================================================================

-- 0) Sao lưu
create table if not exists public.thanh_thuhoi_bak(
  id bigserial primary key, kind text not null, payload jsonb not null, ts timestamptz not null default now());
alter table public.thanh_thuhoi_bak enable row level security;
revoke all on public.thanh_thuhoi_bak from public, anon, authenticated;

insert into public.thanh_thuhoi_bak(kind, payload)
select 'tk_user', to_jsonb(t) from public.tk_user t where t.k1 + t.k2 + t.k3 + t.k4 > 0
  and not exists (select 1 from public.thanh_thuhoi_bak b where b.kind='tk_user' and b.payload->>'uid' = t.uid::text);

insert into public.thanh_thuhoi_bak(kind, payload)
select 'cho_listing', to_jsonb(l) from public.cho_listing l
 where l.status = 'active' and coalesce(l.item->>'hl', '0') in ('1', 'true')
   and not exists (select 1 from public.thanh_thuhoi_bak b where b.kind='cho_listing' and b.payload->>'id' = l.id::text);

insert into public.thanh_thuhoi_bak(kind, payload)
select 'cho_inbox', to_jsonb(i) from public.cho_inbox i
 where coalesce(i.item->>'hl', '0') in ('1', 'true')
   and not exists (select 1 from public.thanh_thuhoi_bak b where b.kind='cho_inbox' and b.payload->>'id' = i.id::text);

-- 1) Danh sách nhân vật cần gỡ (có đồ Bộ Thánh trong Túi/đang mặc, hoặc có Thánh Khí tkq)
create table if not exists public.thanh_thuhoi(
  uid  uuid     not null,
  slot smallint not null,
  done boolean  not null default false,
  ts   timestamptz not null default now(),
  primary key(uid, slot)
);
alter table public.thanh_thuhoi enable row level security;
revoke all on public.thanh_thuhoi from anon, authenticated;

insert into public.thanh_thuhoi(uid, slot)
select s.user_id, i::smallint
  from public.saves s, generate_series(0, 2) as i
 where jsonb_typeof(s.data->'k2') = 'object'
   and ( jsonb_path_exists(case when jsonb_typeof(s.data->'k2'->'EQS'->i)  = 'array' then s.data->'k2'->'EQS'->i  else '[]'::jsonb end, '$[*] ? (@.hl == 1 || @.hl == true)')
      or jsonb_path_exists(case when jsonb_typeof(s.data->'k2'->'BAGS'->i) = 'array' then s.data->'k2'->'BAGS'->i else '[]'::jsonb end, '$[*] ? (@.hl == 1 || @.hl == true)')
      or jsonb_typeof(s.data->'k2'->'PS'->i->'tkq') = 'object')
on conflict (uid, slot) do nothing;

-- 2) Thu hồi phần máy chủ giữ: Thánh Khí trong kho tài khoản + đồ Thánh trên Chợ
update public.tk_user set k1 = 0, k2 = 0, k3 = 0, k4 = 0, updated = now() where k1 + k2 + k3 + k4 > 0;
delete from public.cho_listing where status = 'active' and coalesce(item->>'hl', '0') in ('1', 'true');
delete from public.cho_inbox   where coalesce(item->>'hl', '0') in ('1', 'true');

-- 3) Máy khách hỏi / báo đã xử lý (mỗi nhân vật 1 lần)
create or replace function public.thanh_thuhoi(p_slot int, p_ack boolean default false) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_d boolean;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select done into v_d from public.thanh_thuhoi where uid = v_u and slot = v_s;
  if not found or v_d then return json_build_object('status','none'); end if;
  if coalesce(p_ack, false) then
    update public.thanh_thuhoi set done = true, ts = now() where uid = v_u and slot = v_s;
    return json_build_object('status','ok');
  end if;
  return json_build_object('status','revoke');
end $$;
revoke all on function public.thanh_thuhoi(int, boolean) from public, anon;
grant execute on function public.thanh_thuhoi(int, boolean) to authenticated;

-- Xem tiến độ:      select done, count(*) from public.thanh_thuhoi group by done;
-- Miễn cho 1 người: delete from public.thanh_thuhoi where uid = '<uuid>' and done = false;
