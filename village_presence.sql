-- =====================================================================
-- LÀNG ONLINE (Supabase) - gặp người chơi khác ở thôn tân thủ
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- An toàn khi chạy lại nhiều lần.
--   * Chỉ người đã đăng nhập ☁ mới thấy / được thấy.
--   * Bảng không cho đọc/ghi trực tiếp; mọi thao tác đi qua hàm bên dưới.
--   * Người chơi im lặng > 12 giây tự biến mất khỏi làng.
--   * Máy khách không bao giờ nhận uid thật của người khác (chỉ mã băm).
-- =====================================================================

create table if not exists public.village_presence(
  uid    uuid primary key,
  name   text        not null default 'Đạo Hữu',
  ci     smallint    not null default 0,
  br     smallint    not null default -1,
  tier   smallint    not null default 0,
  lv     int         not null default 1,
  x      real        not null default .5,
  emo    smallint    not null default 0,
  emo_ts timestamptz,
  ts     timestamptz not null default now()
);
create index if not exists village_presence_ts on public.village_presence(ts desc);

alter table public.village_presence enable row level security;
revoke all on public.village_presence from anon, authenticated;

-- Báo vị trí của mình + nhận danh sách người khác (1 lượt gọi cho cả hai)
create or replace function public.vp_ping(
  p_name text, p_ci int, p_br int, p_tier int, p_lv int, p_x real, p_emo int default 0
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_n text; v_ci int; v_br int; v_tier int; v_lv int; v_x real;
  v_et timestamptz; v_set boolean; v_list json; v_cnt int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  v_n    := left(btrim(regexp_replace(coalesce(nullif(p_name,''),'Đạo Hữu'), '[[:cntrl:]]+', ' ', 'g')), 16);
  if char_length(v_n) < 1 then v_n := 'Đạo Hữu'; end if;
  v_ci   := greatest(0,  least(coalesce(p_ci,0), 9));
  v_br   := greatest(-1, least(coalesce(p_br,-1), 3));
  v_tier := greatest(0,  least(coalesce(p_tier,0), 6));
  v_lv   := greatest(1,  least(coalesce(p_lv,1), 999));
  v_x    := greatest(0,  least(coalesce(p_x,.5), 1));

  select emo_ts into v_et from public.village_presence where uid = v_u;
  v_set := coalesce(p_emo,0) between 1 and 4 and (v_et is null or v_et < now() - interval '3 seconds');

  insert into public.village_presence(uid,name,ci,br,tier,lv,x,emo,emo_ts,ts)
  values (v_u, v_n, v_ci, v_br, v_tier, v_lv, v_x,
          case when v_set then p_emo else 0 end,
          case when v_set then now() else null end,
          now())
  on conflict (uid) do update set
    name = excluded.name, ci = excluded.ci, br = excluded.br, tier = excluded.tier,
    lv = excluded.lv, x = excluded.x, ts = now(),
    emo    = case when v_set then p_emo else public.village_presence.emo end,
    emo_ts = case when v_set then now()  else public.village_presence.emo_ts end;

  if random() < .05 then
    delete from public.village_presence where ts < now() - interval '2 minutes';
  end if;

  select count(*) into v_cnt from public.village_presence
   where uid <> v_u and ts > now() - interval '12 seconds';

  select coalesce(json_agg(t), '[]'::json) into v_list from (
    select substr(md5(uid::text), 1, 10) as id, name, ci, br, tier, lv, x,
           case when emo_ts > now() - interval '5 seconds' then emo else 0 end as emo
      from public.village_presence
     where uid <> v_u and ts > now() - interval '12 seconds'
     order by abs(x - v_x), uid
     limit 14) t;

  return json_build_object('status','ok','n',v_cnt,'list',v_list);
end $$;

-- Rời làng
create or replace function public.vp_leave() returns json
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('status','auth'); end if;
  delete from public.village_presence where uid = auth.uid();
  return json_build_object('status','ok');
end $$;

revoke all on function public.vp_ping(text,int,int,int,int,real,int), public.vp_leave() from public, anon;
grant execute on function public.vp_ping(text,int,int,int,int,real,int), public.vp_leave() to authenticated;
