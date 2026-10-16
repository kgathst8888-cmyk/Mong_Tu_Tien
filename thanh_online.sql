-- =====================================================================
-- THÀNH THỊ ONLINE (Supabase) - gặp người chơi khác ở Thành Thị Linh Giới (map 1)
-- và Thành Thị Tiên Giới (map 2), kèm ngoại hình đầy đủ (cánh, trang bị, pháp bảo, thú nuôi...).
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
--   * Chỉ người đã đăng nhập ☁ mới thấy / được thấy.
--   * Bảng không cho đọc/ghi trực tiếp; mọi thao tác đi qua hàm bên dưới.
--   * Im lặng > 12 giây tự biến mất khỏi bản đồ.
--   * Máy khách không bao giờ nhận uid thật của người khác (chỉ mã băm).
--   * Ngoại hình (ap) chỉ gửi khi đổi, người khác tải riêng bằng cp_ap -> ping nhẹ.
-- =====================================================================

create table if not exists public.city_presence(
  uid    uuid primary key,
  map    smallint    not null default 1,
  name   text        not null default 'Đạo Hữu',
  ci     smallint    not null default 0,
  lv     int         not null default 1,
  x      real        not null default .5,
  y      real        not null default 0,
  d      smallint    not null default 1,
  mv     smallint    not null default 0,
  apv    int         not null default 0,
  ap     jsonb,
  emo    smallint    not null default 0,
  emo_ts timestamptz,
  ts     timestamptz not null default now()
);
create index if not exists city_presence_map_ts on public.city_presence(map, ts desc);

alter table public.city_presence enable row level security;
revoke all on public.city_presence from anon, authenticated;

-- Báo vị trí + nhận danh sách người cùng bản đồ (1 lượt gọi cho cả hai)
create or replace function public.cp_ping(
  p_map int, p_name text, p_ci int, p_lv int, p_x real, p_y real,
  p_d int, p_mv int, p_apv int, p_ap jsonb default null, p_emo int default 0
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_map int; v_n text; v_ci int; v_lv int; v_x real; v_y real; v_d int; v_mv int;
  v_et timestamptz; v_set boolean; v_ap jsonb; v_list json; v_cnt int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  v_map := case when p_map = 2 then 2 else 1 end;
  v_n   := left(btrim(regexp_replace(coalesce(nullif(p_name,''),'Đạo Hữu'), '[[:cntrl:]]+', ' ', 'g')), 16);
  if char_length(v_n) < 1 then v_n := 'Đạo Hữu'; end if;
  v_ci  := greatest(0, least(coalesce(p_ci,0), 9));
  v_lv  := greatest(1, least(coalesce(p_lv,1), 999));
  v_x   := greatest(-100, least(coalesce(p_x,0), 300));
  v_y   := greatest(-100, least(coalesce(p_y,0), 300));
  v_d   := case when coalesce(p_d,1) < 0 then -1 else 1 end;
  v_mv  := case when coalesce(p_mv,0) > 0 then 1 else 0 end;

  v_ap := null;
  if p_ap is not null and jsonb_typeof(p_ap) = 'object' and octet_length(p_ap::text) <= 8000 then
    v_ap := p_ap;
  end if;

  select emo_ts into v_et from public.city_presence where uid = v_u;
  v_set := coalesce(p_emo,0) between 1 and 4 and (v_et is null or v_et < now() - interval '3 seconds');

  insert into public.city_presence(uid,map,name,ci,lv,x,y,d,mv,apv,ap,emo,emo_ts,ts)
  values (v_u, v_map, v_n, v_ci, v_lv, v_x, v_y, v_d, v_mv, coalesce(p_apv,0), v_ap,
          case when v_set then p_emo else 0 end,
          case when v_set then now() else null end,
          now())
  on conflict (uid) do update set
    map = excluded.map, name = excluded.name, ci = excluded.ci, lv = excluded.lv,
    x = excluded.x, y = excluded.y, d = excluded.d, mv = excluded.mv,
    apv = excluded.apv,
    ap  = coalesce(excluded.ap, public.city_presence.ap),
    ts  = now(),
    emo    = case when v_set then p_emo else public.city_presence.emo end,
    emo_ts = case when v_set then now()  else public.city_presence.emo_ts end;

  if random() < .05 then
    delete from public.city_presence where ts < now() - interval '2 minutes';
  end if;

  select count(*) into v_cnt from public.city_presence
   where uid <> v_u and map = v_map and ts > now() - interval '12 seconds';

  select coalesce(json_agg(t), '[]'::json) into v_list from (
    select substr(md5(uid::text), 1, 10) as id, name, ci, lv, x, y, d, mv, apv,
           case when emo_ts > now() - interval '5 seconds' then emo else 0 end as emo
      from public.city_presence
     where uid <> v_u and map = v_map and ts > now() - interval '12 seconds'
     order by ((x - v_x) * (x - v_x) + (y - v_y) * (y - v_y)), uid
     limit 20) t;

  return json_build_object('status','ok','n',v_cnt,'list',v_list);
end $$;

-- Tải ngoại hình của 1 người (theo mã băm id nhận từ cp_ping), chỉ khi người đó còn đang online cùng bản đồ
create or replace function public.cp_ap(p_id text, p_map int) returns json
language plpgsql security definer set search_path = public as $$
declare v_ap jsonb;
begin
  if auth.uid() is null then return json_build_object('status','auth'); end if;
  select ap into v_ap from public.city_presence
   where substr(md5(uid::text), 1, 10) = left(coalesce(p_id,''), 10)
     and map = case when p_map = 2 then 2 else 1 end
     and ts > now() - interval '30 seconds'
   limit 1;
  return json_build_object('status','ok','ap',v_ap);
end $$;

-- Rời bản đồ
create or replace function public.cp_leave() returns json
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('status','auth'); end if;
  delete from public.city_presence where uid = auth.uid();
  return json_build_object('status','ok');
end $$;

revoke all on function public.cp_ping(int,text,int,int,real,real,int,int,int,jsonb,int),
                       public.cp_ap(text,int), public.cp_leave() from public, anon;
grant execute on function public.cp_ping(int,text,int,int,real,real,int,int,int,jsonb,int),
                          public.cp_ap(text,int), public.cp_leave() to authenticated;
