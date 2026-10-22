-- =====================================================================
-- Fix420: Rương Hội Chiến KHÔNG còn rơi nguyên Long Vũ Thiên Thần Dực (Cánh Cấp 4), chỉ rơi Mảnh Cánh Cấp 4.
--         + Thu hồi Cánh Cấp 4 đã rơi nguyên cái trước đó.
-- Chạy 1 lần trong Supabase SQL Editor (an toàn chạy lại).
-- =====================================================================

-- 1) Bảng tung thưởng mới: bỏ 'lv'. Mảnh Cánh 4 vẫn 5%, Bùa Chống Rơi 2%.
create or replace function public.hcb_roll(p_ex text default '') returns json
language plpgsql volatile as $$
declare v_r double precision; v_t text; v_i int := 0;
begin
  loop
    v_i := v_i + 1; v_r := random() * 100;
    if    v_r < 2  then v_t := 'bua';
    elsif v_r < 7  then v_t := 'mc';
    else v_t := (array['lt','da','g'])[1 + floor(random() * 3)::int];
    end if;
    exit when v_t <> coalesce(p_ex, '') or v_i >= 12;
  end loop;
  return case v_t
    when 'lt'  then json_build_object('t','lt','n', 10 + floor(random() * 41)::int)
    when 'da'  then json_build_object('t','da','k', case when random() < .5 then 'a' else 'b' end,'n', 1 + floor(random() * 2)::int)
    when 'g'   then json_build_object('t','g','n', (2 + floor(random() * 9)::int) * 1000000)
    when 'mc'  then json_build_object('t','mc','n', 1)
    else            json_build_object('t','bua','n', 1) end;
end $$;
revoke all on function public.hcb_roll(text) from public, anon;

-- 2) Danh sách nhân vật cần thu hồi (rương cũ không ghi lại ai trúng 'lv' nên lọc theo:
--    đã mở rương Hội Chiến  VÀ  bản lưu mây đang có ĐÚNG Cánh Cấp 4 (wg = 4)).
create table if not exists public.hcb_thuhoi(
  uid  uuid     not null,
  slot smallint not null,
  done boolean  not null default false,
  ts   timestamptz not null default now(),
  primary key(uid, slot)
);
alter table public.hcb_thuhoi enable row level security;
revoke all on public.hcb_thuhoi from anon, authenticated;

insert into public.hcb_thuhoi(uid, slot)
select distinct o.uid, o.slot
  from public.hcb_open o
  join public.saves s on s.user_id = o.uid
 where coalesce((s.data->'k2'->'PS'->(o.slot::int)->>'wg')::int, 0) = 4
on conflict (uid, slot) do nothing;

-- 3) Máy khách hỏi / báo đã xử lý
create or replace function public.hcb_thuhoi(p_slot int, p_ack boolean default false) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_d boolean;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select done into v_d from public.hcb_thuhoi where uid = v_u and slot = v_s;
  if not found or v_d then return json_build_object('status','none'); end if;
  if coalesce(p_ack, false) then
    update public.hcb_thuhoi set done = true, ts = now() where uid = v_u and slot = v_s;
    return json_build_object('status','ok');
  end if;
  return json_build_object('status','revoke');
end $$;
revoke all on function public.hcb_thuhoi(int, boolean) from public, anon;
grant execute on function public.hcb_thuhoi(int, boolean) to authenticated;

-- Xem danh sách trước khi người chơi đăng nhập:
--   select h.uid, h.slot, h.done from public.hcb_thuhoi h order by h.ts;
-- Miễn thu hồi cho người đã tự hợp cánh hợp lệ (xoá khỏi danh sách):
--   delete from public.hcb_thuhoi where uid = '<uuid>' and slot = <0|1|2>;
