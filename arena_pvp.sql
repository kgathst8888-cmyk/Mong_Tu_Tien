-- =====================================================================
-- ĐẤU TRƯỜNG PvP (live + bản sao đầy đủ) — chạy SAU arena_online.sql
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
--
--   * arena_prof : hồ sơ chiến đấu ĐẦY ĐỦ (chỉ số thật, skill đã mở, trang bị để vẽ) của từng nhân vật.
--   * arena_online : ai đang mở game (nhân vật nào) trong 20 giây gần nhất.
--   * arena_live : trận LIVE giữa 2 người đang online (mời → chấp nhận → trao đổi trạng thái ~5 lần/giây).
--   Điểm/lượt/xếp hạng vẫn do arena_begin / arena_end (arena_online.sql) xử lý.
-- =====================================================================
create table if not exists public.arena_prof(
  uid  uuid  not null,
  slot int   not null default 0,
  prof jsonb not null,
  upd  timestamptz not null default now(),
  primary key(uid, slot)
);

create table if not exists public.arena_online(
  uid  uuid primary key,
  slot int  not null default 0,
  at   timestamptz not null default now()
);

create table if not exists public.arena_live(
  id      bigserial primary key,
  a_uid   uuid not null,
  a_slot  int  not null,
  b_uid   uuid not null,
  b_slot  int  not null,
  st      text not null default 'wait',   -- wait | active | declined | expired | done
  a_state jsonb,
  b_state jsonb,
  a_at    timestamptz,
  b_at    timestamptz,
  created timestamptz not null default now()
);
create index if not exists arena_live_b_idx on public.arena_live(b_uid, id desc);
create index if not exists arena_live_a_idx on public.arena_live(a_uid, id desc);

alter table public.arena_prof   enable row level security;
alter table public.arena_online enable row level security;
alter table public.arena_live   enable row level security;
revoke all on public.arena_prof, public.arena_online, public.arena_live from anon, authenticated;

-- ---------------------------------------------------------------------
create or replace function public.arena_touch(p_slot int) returns void
language sql security definer set search_path = public as $$
  insert into public.arena_online(uid, slot, at) values (auth.uid(), p_slot, now())
  on conflict (uid) do update set slot = excluded.slot, at = now();
$$;

-- Gửi hồ sơ chiến đấu đầy đủ
create or replace function public.arena_prof_put(p_slot int, p_prof jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid();
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_prof is null or jsonb_typeof(p_prof) <> 'object' or length(p_prof::text) > 24000 then
    return json_build_object('status','bad');
  end if;
  insert into public.arena_prof(uid, slot, prof, upd) values (v_u, p_slot, p_prof, now())
  on conflict (uid, slot) do update set prof = excluded.prof, upd = now();
  perform public.arena_touch(p_slot);
  return json_build_object('status','ok');
end $$;

-- Lấy hồ sơ đầy đủ của đối thủ
create or replace function public.arena_prof_get(p_uid uuid, p_oslot int) returns json
language plpgsql security definer set search_path = public as $$
declare v_p jsonb;
begin
  if auth.uid() is null then return json_build_object('status','auth'); end if;
  select prof into v_p from public.arena_prof where uid = p_uid and slot = p_oslot;
  if v_p is null then return json_build_object('status','noprof'); end if;
  return json_build_object('status','ok','prof',v_p);
end $$;

-- Danh sách đối thủ (người đang online lên đầu, rồi theo điểm gần nhất)
create or replace function public.arena_pvp_list(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid := auth.uid();
  v_me   public.arena_players;
  v_list json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into v_me from public.arena_players where uid = v_u and slot = p_slot;
  if not found then return json_build_object('status','nosync'); end if;
  perform public.arena_touch(p_slot);

  select coalesce(json_agg(row_to_json(t) order by t.o1, t.d), '[]'::json) into v_list from (
    select o.uid::text as uid, o.slot, o.name, o.realm, o.ci, o.br, o.lv, o.pw,
           o.pts, o.wins, o.losses,
           (ao.uid is not null and ao.slot = o.slot and ao.at > now() - interval '20 seconds') as online,
           (pf.uid is not null) as has_prof,
           case when ao.uid is not null and ao.slot = o.slot and ao.at > now() - interval '20 seconds' then 0 else 1 end as o1,
           (abs(o.pts - v_me.pts) + random() * 80) as d
      from public.arena_players o
      left join public.arena_online ao on ao.uid = o.uid
      left join public.arena_prof  pf on pf.uid = o.uid and pf.slot = o.slot
     where o.uid <> v_u
       and o.upd > now() - interval '30 days'
     order by o1, d
     limit 8) t;

  return json_build_object('status','ok','list',v_list);
end $$;

-- ---------------------------------------------------------------------
-- LIVE: mời
-- ---------------------------------------------------------------------
create or replace function public.arena_live_invite(p_slot int, p_uid uuid, p_oslot int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_id bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_uid = v_u then return json_build_object('status','self'); end if;
  if not exists(select 1 from public.arena_players where uid = v_u and slot = p_slot) then
    return json_build_object('status','nosync');
  end if;
  if not exists(select 1 from public.arena_players where uid = p_uid and slot = p_oslot) then
    return json_build_object('status','gone');
  end if;
  if not exists(select 1 from public.arena_online where uid = p_uid and slot = p_oslot and at > now() - interval '20 seconds') then
    return json_build_object('status','offline');
  end if;
  if exists(select 1 from public.arena_live l
             where (l.a_uid = p_uid or l.b_uid = p_uid)
               and ((l.st = 'wait' and l.created > now() - interval '45 seconds')
                 or (l.st = 'active' and coalesce(greatest(l.a_at, l.b_at), l.created) > now() - interval '20 seconds'))) then
    return json_build_object('status','busy');
  end if;
  update public.arena_live set st = 'done' where a_uid = v_u and st in ('wait','active');
  insert into public.arena_live(a_uid, a_slot, b_uid, b_slot) values (v_u, p_slot, p_uid, p_oslot) returning id into v_id;
  perform public.arena_touch(p_slot);
  return json_build_object('status','ok','id',v_id);
end $$;

-- LIVE: kiểm tra có ai mời mình không (đồng thời báo "đang online")
create or replace function public.arena_live_poll(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.arena_live; a public.arena_players;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  perform public.arena_touch(p_slot);
  if random() < 0.01 then delete from public.arena_live where created < now() - interval '1 day'; end if;
  select * into m from public.arena_live
   where b_uid = v_u and b_slot = p_slot and st = 'wait' and created > now() - interval '45 seconds'
   order by id desc limit 1;
  if not found then return json_build_object('status','ok'); end if;
  select * into a from public.arena_players where uid = m.a_uid and slot = m.a_slot;
  return json_build_object('status','ok','inv', json_build_object(
    'id', m.id, 'uid', m.a_uid::text, 'slot', m.a_slot,
    'name', coalesce(a.name,'Đạo Hữu'), 'realm', coalesce(a.realm,''), 'lv', coalesce(a.lv,1),
    'pw', coalesce(a.pw,100), 'ci', coalesce(a.ci,0), 'br', coalesce(a.br,0),
    'age', extract(epoch from now() - m.created)::int));
end $$;

-- LIVE: chấp nhận / từ chối
create or replace function public.arena_live_reply(p_id bigint, p_accept boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.arena_live;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.arena_live
     set st = case when p_accept then 'active' else 'declined' end, b_at = now()
   where id = p_id and b_uid = v_u and st = 'wait' and created > now() - interval '45 seconds'
  returning * into m;
  if not found then return json_build_object('status','gone'); end if;
  return json_build_object('status','ok','uid',m.a_uid::text,'slot',m.a_slot);
end $$;

-- LIVE: trao đổi trạng thái (gửi của mình, nhận của đối thủ)
create or replace function public.arena_live_sync(p_id bigint, p_state jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.arena_live; v_a boolean; v_opp jsonb; v_at timestamptz;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into m from public.arena_live where id = p_id and (a_uid = v_u or b_uid = v_u);
  if not found then return json_build_object('status','gone'); end if;
  v_a := (m.a_uid = v_u);
  if m.st = 'wait' and m.created < now() - interval '45 seconds' then
    update public.arena_live set st = 'expired' where id = p_id;
    m.st := 'expired';
  end if;
  if p_state is not null and length(p_state::text) < 2000 and m.st = 'active' then
    if v_a then update public.arena_live set a_state = p_state, a_at = now() where id = p_id;
    else update public.arena_live set b_state = p_state, b_at = now() where id = p_id; end if;
  end if;
  perform public.arena_touch(case when v_a then m.a_slot else m.b_slot end);
  if v_a then v_opp := m.b_state; v_at := m.b_at; else v_opp := m.a_state; v_at := m.a_at; end if;
  return json_build_object('status','ok','st',m.st,'opp',v_opp,
    'age', case when v_at is null then null else (extract(epoch from now() - v_at) * 1000)::int end);
end $$;

-- LIVE: kết thúc / huỷ
create or replace function public.arena_live_end(p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('status','auth'); end if;
  update public.arena_live set st = 'done' where id = p_id and (a_uid = auth.uid() or b_uid = auth.uid());
  return json_build_object('status','ok');
end $$;

revoke all on function
  public.arena_touch(int), public.arena_prof_put(int, jsonb), public.arena_prof_get(uuid, int),
  public.arena_pvp_list(int), public.arena_live_invite(int, uuid, int), public.arena_live_poll(int),
  public.arena_live_reply(bigint, boolean), public.arena_live_sync(bigint, jsonb), public.arena_live_end(bigint)
from public, anon;
grant execute on function
  public.arena_prof_put(int, jsonb), public.arena_prof_get(uuid, int),
  public.arena_pvp_list(int), public.arena_live_invite(int, uuid, int), public.arena_live_poll(int),
  public.arena_live_reply(bigint, boolean), public.arena_live_sync(bigint, jsonb), public.arena_live_end(bigint)
to authenticated;
