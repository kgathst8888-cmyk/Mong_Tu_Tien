-- =====================================================================
-- ĐẤU TRƯỜNG ONLINE — thách đấu người chơi thật, điểm + xếp hạng trên mây (Supabase)
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- An toàn khi chạy lại nhiều lần.
--
-- Cách hoạt động (khớp với systems/19-arena.js):
--   * Khi mở Đấu Trường, game gửi "hồ sơ chiến đấu" của nhân vật (tên, lớp, cấp, lực chiến)
--     lên bảng arena_players. Người chơi nào đã mở Đấu Trường đều trở thành đối thủ của người khác.
--   * Thách đấu = đánh với bản sao (hồ sơ) của người chơi thật, kể cả khi họ đang offline.
--     Trận đấu chạy trên máy người thách đấu; máy chủ giữ ĐIỂM, HẠNG, LƯỢT và NHẬT KÝ.
--   * Mỗi nhân vật tối đa 10 lượt thách đấu/ngày (đổi ngày lúc 00:00 giờ Việt Nam) — máy chủ tự kiểm tra.
--   * Điểm tính kiểu Elo (hệ số 32): thắng đối thủ mạnh hơn được nhiều điểm hơn.
--     Người bị thách đấu mất/được nửa số điểm đó (đỡ thiệt khi offline).
--   * Chỉ ghi kết quả nếu có lượt đang chờ (arena_begin) trong vòng 15 phút.
--   * Bảng không cho đọc/ghi trực tiếp; mọi thao tác đi qua các hàm bên dưới (cần đăng nhập ☁).
-- =====================================================================

create table if not exists public.arena_players(
  uid         uuid        not null,
  slot        int         not null default 0,
  name        text        not null default 'Đạo Hữu',
  realm       text        not null default '',
  ci          int         not null default 0,
  br          int         not null default 0,
  lv          int         not null default 1,
  pw          bigint      not null default 100,
  pts         int         not null default 1000,
  wins        int         not null default 0,
  losses      int         not null default 0,
  streak      int         not null default 0,
  best_streak int         not null default 0,
  day         date,
  used        int         not null default 0,
  pend_uid    uuid,
  pend_slot   int,
  pend_at     timestamptz,
  seen        bigint      not null default 0,
  upd         timestamptz not null default now(),
  created     timestamptz not null default now(),
  primary key(uid, slot)
);
create index if not exists arena_players_pts_idx on public.arena_players(pts desc, created);
create index if not exists arena_players_upd_idx on public.arena_players(upd desc);

create table if not exists public.arena_log(
  id      bigserial   primary key,
  ts      timestamptz not null default now(),
  a_uid   uuid        not null,
  a_slot  int         not null,
  a_name  text        not null,
  d_uid   uuid        not null,
  d_slot  int         not null,
  d_name  text        not null,
  win     boolean     not null,
  a_delta int         not null default 0,
  d_delta int         not null default 0
);
create index if not exists arena_log_a_idx on public.arena_log(a_uid, a_slot, id desc);
create index if not exists arena_log_d_idx on public.arena_log(d_uid, d_slot, id desc);

alter table public.arena_players enable row level security;
alter table public.arena_log     enable row level security;
revoke all on public.arena_players, public.arena_log from anon, authenticated;

-- Ngày hiện tại theo giờ VN
create or replace function public.arena_day() returns date
language sql stable as $$ select (now() at time zone 'Asia/Ho_Chi_Minh')::date $$;

-- ---------------------------------------------------------------------
-- Đồng bộ hồ sơ chiến đấu + trạng thái của mình (điểm, hạng, lượt còn lại, lượt bị thách đấu chưa xem)
-- ---------------------------------------------------------------------
create or replace function public.arena_sync(
  p_slot int, p_name text, p_realm text, p_ci int, p_br int, p_lv int, p_power numeric
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u   uuid := auth.uid();
  v_d   date := public.arena_day();
  v_me  public.arena_players;
  v_pw  bigint;
  v_rk  int;
  v_tot int;
  v_un  int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  v_pw := greatest(1, least(coalesce(p_power, 100), 1000000000000))::bigint;

  insert into public.arena_players(uid, slot, name, realm, ci, br, lv, pw, day)
  values (v_u, p_slot,
          left(coalesce(nullif(btrim(p_name),''),'Đạo Hữu'), 24),
          left(coalesce(p_realm,''), 24),
          greatest(0, least(coalesce(p_ci,0), 31)),
          greatest(-1, least(coalesce(p_br,0), 3)),
          greatest(1, least(coalesce(p_lv,1), 999)),
          v_pw, v_d)
  on conflict (uid, slot) do update
     set name  = excluded.name,
         realm = excluded.realm,
         ci    = excluded.ci,
         br    = excluded.br,
         lv    = excluded.lv,
         pw    = excluded.pw,
         upd   = now();

  update public.arena_players set day = v_d, used = 0
   where uid = v_u and slot = p_slot and (day is null or day <> v_d);

  select * into v_me from public.arena_players where uid = v_u and slot = p_slot;

  select 1 + count(*) into v_rk from public.arena_players o
   where o.pts > v_me.pts or (o.pts = v_me.pts and o.created < v_me.created);
  select count(*) into v_tot from public.arena_players;
  select count(*) into v_un from public.arena_log
   where d_uid = v_u and d_slot = p_slot and id > v_me.seen;

  return json_build_object('status','ok','day',v_d::text,
    'pts',v_me.pts,'wins',v_me.wins,'losses',v_me.losses,'streak',v_me.streak,
    'rank',v_rk,'total',v_tot,'left',greatest(0, 10 - v_me.used),'unseen',v_un);
end $$;

-- ---------------------------------------------------------------------
-- Danh sách 5 đối thủ thật có điểm gần mình (có xáo trộn nhẹ để mỗi lần làm mới khác nhau)
-- ---------------------------------------------------------------------
create or replace function public.arena_opponents(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid := auth.uid();
  v_me   public.arena_players;
  v_list json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into v_me from public.arena_players where uid = v_u and slot = p_slot;
  if not found then return json_build_object('status','nosync'); end if;

  select coalesce(json_agg(row_to_json(t) order by t.d), '[]'::json) into v_list from (
    select o.uid::text as uid, o.slot, o.name, o.realm, o.ci, o.br, o.lv, o.pw,
           o.pts, o.wins, o.losses,
           (abs(o.pts - v_me.pts) + random() * 80) as d
      from public.arena_players o
     where o.uid <> v_u
       and o.upd > now() - interval '30 days'
     order by d
     limit 5) t;

  return json_build_object('status','ok','list',v_list);
end $$;

-- ---------------------------------------------------------------------
-- Bắt đầu thách đấu: trừ 1 lượt, ghi đối thủ đang chờ
-- ---------------------------------------------------------------------
create or replace function public.arena_begin(p_slot int, p_uid uuid, p_oslot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid := auth.uid();
  v_d    date := public.arena_day();
  v_me   public.arena_players;
  v_used int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_uid = v_u then return json_build_object('status','self'); end if;

  update public.arena_players set day = v_d, used = 0
   where uid = v_u and slot = p_slot and (day is null or day <> v_d);

  select * into v_me from public.arena_players where uid = v_u and slot = p_slot for update;
  if not found then return json_build_object('status','nosync'); end if;
  if v_me.used >= 10 then return json_build_object('status','no_tries'); end if;

  if not exists(select 1 from public.arena_players where uid = p_uid and slot = p_oslot) then
    return json_build_object('status','gone');
  end if;

  update public.arena_players
     set used = used + 1, pend_uid = p_uid, pend_slot = p_oslot, pend_at = now()
   where uid = v_u and slot = p_slot
  returning used into v_used;

  return json_build_object('status','ok','left',greatest(0, 10 - v_used));
end $$;

-- ---------------------------------------------------------------------
-- Kết thúc trận: tính điểm Elo cho cả hai bên, ghi nhật ký
-- ---------------------------------------------------------------------
create or replace function public.arena_end(p_slot int, p_win boolean) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid := auth.uid();
  v_me   public.arena_players;
  v_op   public.arena_players;
  v_e    numeric;
  v_a    int;
  v_dd   int;
  v_old  int;
  v_new  int;
  v_id   bigint;
  v_rk   int;
  v_tot  int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  select * into v_me from public.arena_players where uid = v_u and slot = p_slot for update;
  if not found or v_me.pend_uid is null or v_me.pend_at is null
     or v_me.pend_at < now() - interval '15 minutes' then
    return json_build_object('status','nopend');
  end if;

  select * into v_op from public.arena_players
   where uid = v_me.pend_uid and slot = v_me.pend_slot for update;
  if not found then
    update public.arena_players set pend_uid = null, pend_slot = null, pend_at = null
     where uid = v_u and slot = p_slot;
    return json_build_object('status','gone');
  end if;

  v_e := 1.0 / (1.0 + power(10.0, (v_op.pts - v_me.pts) / 400.0));
  if p_win then
    v_a  := greatest(1, round(32 * (1 - v_e))::int);
    v_dd := -greatest(1, round(v_a * 0.5)::int);
  else
    v_a  := -greatest(1, round(32 * v_e)::int);
    v_dd := greatest(1, round(32 * v_e * 0.5)::int);
  end if;

  v_old := v_me.pts;
  v_new := greatest(0, v_old + v_a);

  update public.arena_players
     set pts = v_new,
         wins = wins + (case when p_win then 1 else 0 end),
         losses = losses + (case when p_win then 0 else 1 end),
         streak = case when p_win then streak + 1 else 0 end,
         best_streak = greatest(best_streak, case when p_win then streak + 1 else 0 end),
         pend_uid = null, pend_slot = null, pend_at = null
   where uid = v_u and slot = p_slot;

  update public.arena_players set pts = greatest(0, pts + v_dd)
   where uid = v_op.uid and slot = v_op.slot;

  insert into public.arena_log(a_uid, a_slot, a_name, d_uid, d_slot, d_name, win, a_delta, d_delta)
  values (v_u, p_slot, v_me.name, v_op.uid, v_op.slot, v_op.name, p_win, v_new - v_old, v_dd)
  returning id into v_id;
  if v_id % 50 = 0 then delete from public.arena_log where id < v_id - 5000; end if;

  select * into v_me from public.arena_players where uid = v_u and slot = p_slot;
  select 1 + count(*) into v_rk from public.arena_players o
   where o.pts > v_me.pts or (o.pts = v_me.pts and o.created < v_me.created);
  select count(*) into v_tot from public.arena_players;

  return json_build_object('status','ok','win',p_win,'delta',v_new - v_old,
    'pts',v_me.pts,'wins',v_me.wins,'losses',v_me.losses,'streak',v_me.streak,
    'rank',v_rk,'total',v_tot,'left',greatest(0, 10 - v_me.used));
end $$;

-- ---------------------------------------------------------------------
-- Bảng xếp hạng top 20 + hạng của mình
-- ---------------------------------------------------------------------
create or replace function public.arena_ranking(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u   uuid := auth.uid();
  v_me  public.arena_players;
  v_top json;
  v_rk  int;
  v_tot int;
  v_has boolean;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  select * into v_me from public.arena_players where uid = v_u and slot = p_slot;
  v_has := found;
  select count(*) into v_tot from public.arena_players;
  if v_has then
    select 1 + count(*) into v_rk from public.arena_players o
     where o.pts > v_me.pts or (o.pts = v_me.pts and o.created < v_me.created);
  end if;

  select coalesce(json_agg(t order by t.r), '[]'::json) into v_top from (
    select (row_number() over (order by b.pts desc, b.created asc))::int as r,
           b.name, b.realm, b.ci, b.br, b.lv, b.pw, b.pts, b.wins, b.losses,
           (b.uid = v_u and b.slot = p_slot) as me
      from public.arena_players b
     order by b.pts desc, b.created asc
     limit 20) t;

  return json_build_object('status','ok','top',v_top,'rank',v_rk,'total',v_tot);
end $$;

-- ---------------------------------------------------------------------
-- Nhật ký 20 trận gần nhất (mình thách đấu + mình bị thách đấu); đánh dấu đã xem
-- ---------------------------------------------------------------------
create or replace function public.arena_history(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u   uuid := auth.uid();
  v_lst json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  select coalesce(json_agg(t order by t.id desc), '[]'::json) into v_lst from (
    select l.id,
           extract(epoch from l.ts)::bigint as ts,
           (l.a_uid = v_u and l.a_slot = p_slot) as atk,
           case when l.a_uid = v_u and l.a_slot = p_slot then l.d_name else l.a_name end as opp,
           case when l.a_uid = v_u and l.a_slot = p_slot then l.win else not l.win end as win,
           case when l.a_uid = v_u and l.a_slot = p_slot then l.a_delta else l.d_delta end as delta
      from public.arena_log l
     where (l.a_uid = v_u and l.a_slot = p_slot) or (l.d_uid = v_u and l.d_slot = p_slot)
     order by l.id desc
     limit 20) t;

  update public.arena_players
     set seen = coalesce((select max(id) from public.arena_log
                           where d_uid = v_u and d_slot = p_slot), 0)
   where uid = v_u and slot = p_slot;

  return json_build_object('status','ok','list',v_lst);
end $$;

revoke all on function
  public.arena_sync(int,text,text,int,int,int,numeric),
  public.arena_opponents(int),
  public.arena_begin(int,uuid,int),
  public.arena_end(int,boolean),
  public.arena_ranking(int),
  public.arena_history(int)
from public, anon;
grant execute on function
  public.arena_sync(int,text,text,int,int,int,numeric),
  public.arena_opponents(int),
  public.arena_begin(int,uuid,int),
  public.arena_end(int,boolean),
  public.arena_ranking(int),
  public.arena_history(int)
to authenticated;
