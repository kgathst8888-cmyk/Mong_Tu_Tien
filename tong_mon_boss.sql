-- =====================================================================
-- BOSS TÔNG MÔN (hằng tuần) — Fix348 — chạy SAU tong_mon.sql
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI (giữ nguyên dữ liệu, chỉ thay hàm).
--
--   * tm_boss    : boss của MỖI TÔNG theo TUẦN (tuần bắt đầu thứ Hai 00:00 giờ VN): máu chung (pool), sát thương cộng dồn, giờ bị hạ.
--   * tm_bossmem : sát thương từng thành viên trong tuần đó (tổng, lượt cao nhất, số lượt, đã nhận thưởng chưa).
--   * tm_bossrun : lượt đánh hôm nay của TÀI KHOẢN (tối đa 2 lượt/ngày giờ VN) + lượt đang đánh dở.
--   * tm_user.bref : lượt sát thương cao nhất từng đạt (dùng tính máu boss).
--
--   Luật:
--     - Mỗi lượt đánh 60 giây (máy khách), báo tổng sát thương bằng tm_boss_end. Lượt tính ngay khi tm_boss_begin (bỏ dở = mất lượt).
--     - MÁU BOSS tự co giãn theo sức mạnh thật: pool = 8 × (tổng bref của các thành viên hiện tại), CHỐT 1 lần ở lượt đầu tiên của tuần
--       (nếu chưa ai có bref thì chốt ở lượt kế tiếp). Mọi giai đoạn của game đều cân bằng; cả tông cần khoảng một nửa số lượt tối đa để hạ boss.
--     - Hạ boss: tông +500 exp. Mỗi lượt đánh: tông +20 exp. Sát thương mỗi lượt kẹp tối đa 1e12.
--     - Nhận thưởng (tm_boss_claim): tuần nào boss bị hạ và bạn đóng góp >= 0,2% máu boss; mỗi tuần nhận 1 lần, trong 28 ngày.
--   Giới hạn: sát thương do máy khách báo (cùng mức tin cậy với Boss Bất Tử / Đấu Trường); máy chủ giữ lượt, máu, thứ hạng, thưởng 1 lần.
-- =====================================================================
create table if not exists public.tm_boss(
  guild_id  bigint not null references public.tm_guild(id) on delete cascade,
  wk        date   not null,
  pool      bigint,
  dmg       bigint not null default 0,
  killed_at timestamptz,
  primary key (guild_id, wk)
);

create table if not exists public.tm_bossmem(
  wk       date   not null,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  uid      uuid   not null,
  name     text   not null default '',
  dmg      bigint not null default 0,
  best     bigint not null default 0,
  tries    int    not null default 0,
  claimed  boolean not null default false,
  upd      timestamptz not null default now(),
  primary key (wk, guild_id, uid)
);
create index if not exists tm_bossmem_rank on public.tm_bossmem (guild_id, wk, dmg desc);
create index if not exists tm_bossmem_uid on public.tm_bossmem (uid, wk);

create table if not exists public.tm_bossrun(
  uid        uuid primary key,
  day        date,
  n          int not null default 0,
  pend       boolean not null default false,
  pend_at    timestamptz,
  pend_guild bigint,
  pend_wk    date
);

alter table public.tm_user add column if not exists bref bigint not null default 0;

alter table public.tm_boss    enable row level security;
alter table public.tm_bossmem enable row level security;
alter table public.tm_bossrun enable row level security;
revoke all on public.tm_boss, public.tm_bossmem, public.tm_bossrun from anon, authenticated;

-- Thứ Hai đầu tuần hiện tại (giờ VN)
create or replace function public.tm_wk() returns date
language sql stable set search_path = public, pg_catalog as $$
  select date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh')::date
$$;

-- ---------------------------------------------------------------------
-- Vào trận: trừ 1 lượt (tối đa 2/ngày/tài khoản), ghi lượt đang đánh
-- ---------------------------------------------------------------------
create or replace function public.tm_boss_begin() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; v_wk date := public.tm_wk();
  m public.tm_member; v_kill timestamptz; v_n int; v_day date; v_lv int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select killed_at into v_kill from public.tm_boss where guild_id = m.guild_id and wk = v_wk;
  if v_kill is not null then return json_build_object('status', 'killed'); end if;
  insert into public.tm_bossrun(uid) values (v_u) on conflict (uid) do nothing;
  select day, n into v_day, v_n from public.tm_bossrun where uid = v_u for update;
  if v_day is distinct from v_today then v_n := 0; end if;
  if v_n >= 2 then return json_build_object('status', 'no_tries'); end if;
  update public.tm_bossrun
     set day = v_today, n = v_n + 1, pend = true, pend_at = now(), pend_guild = m.guild_id, pend_wk = v_wk
   where uid = v_u;
  select lv into v_lv from public.tm_guild where id = m.guild_id;
  return json_build_object('status', 'ok', 'left', 2 - (v_n + 1), 'glv', v_lv, 'wk', v_wk,
                           'boss', (abs((v_wk - date '2026-01-05') / 7)::int) % 8);
end $$;

-- ---------------------------------------------------------------------
-- Kết thúc lượt: ghi sát thương, chốt máu boss (lần đầu), kiểm tra hạ boss
-- ---------------------------------------------------------------------
create or replace function public.tm_boss_end(p_dmg bigint) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); r public.tm_bossrun; m public.tm_member; b public.tm_boss;
  v_d bigint; v_s bigint; v_kill boolean := false; v_rank int; v_my bigint;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into r from public.tm_bossrun where uid = v_u for update;
  if not found or not r.pend then return json_build_object('status', 'none'); end if;
  update public.tm_bossrun set pend = false where uid = v_u;
  if r.pend_at < now() - interval '10 minutes' then return json_build_object('status', 'expired'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found or m.guild_id <> r.pend_guild then return json_build_object('status', 'moved'); end if;

  v_d := least(greatest(coalesce(p_dmg, 0), 0), 1000000000000);

  insert into public.tm_boss(guild_id, wk) values (m.guild_id, r.pend_wk) on conflict (guild_id, wk) do nothing;
  select * into b from public.tm_boss where guild_id = m.guild_id and wk = r.pend_wk for update;

  insert into public.tm_bossmem(wk, guild_id, uid, name, dmg, best, tries)
  values (r.pend_wk, m.guild_id, v_u, m.name, v_d, v_d, 1)
  on conflict (wk, guild_id, uid) do update
     set dmg = public.tm_bossmem.dmg + excluded.dmg, best = greatest(public.tm_bossmem.best, excluded.best),
         tries = public.tm_bossmem.tries + 1, name = excluded.name, upd = now();

  insert into public.tm_user(uid, bref) values (v_u, v_d)
  on conflict (uid) do update set bref = greatest(public.tm_user.bref, excluded.bref);

  if b.pool is null then
    select coalesce(sum(u.bref), 0) into v_s
      from public.tm_member mm join public.tm_user u on u.uid = mm.uid where mm.guild_id = m.guild_id;
    if v_s > 0 then
      b.pool := 8 * v_s;
      update public.tm_boss set pool = b.pool where guild_id = m.guild_id and wk = r.pend_wk;
    end if;
  end if;

  b.dmg := b.dmg + v_d;
  update public.tm_boss set dmg = b.dmg where guild_id = m.guild_id and wk = r.pend_wk;
  if b.pool is not null and b.killed_at is null and b.dmg >= b.pool then
    update public.tm_boss set killed_at = now() where guild_id = m.guild_id and wk = r.pend_wk;
    b.killed_at := now(); v_kill := true;
    perform public.tm_addexp(m.guild_id, 500);
  end if;
  perform public.tm_addexp(m.guild_id, 20);

  select dmg into v_my from public.tm_bossmem where wk = r.pend_wk and guild_id = m.guild_id and uid = v_u;
  select count(*) + 1 into v_rank from public.tm_bossmem
   where wk = r.pend_wk and guild_id = m.guild_id and dmg > v_my;
  return json_build_object('status', 'ok', 'd', v_d, 'pool', b.pool, 'dmg', b.dmg, 'killed', (b.killed_at is not null),
                           'kill_now', v_kill, 'rank', v_rank, 'my', v_my);
end $$;

-- ---------------------------------------------------------------------
-- Trạng thái: boss tuần này, bảng sát thương của tông, đua hạ boss giữa các tông, thưởng chờ nhận
-- ---------------------------------------------------------------------
create or replace function public.tm_boss_status() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; v_wk date := public.tm_wk();
  m public.tm_member; b public.tm_boss; v_day date; v_n int; v_top json; v_race json; v_pend json; v_my bigint; v_tr int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  select day, n into v_day, v_n from public.tm_bossrun where uid = v_u;
  if v_day is distinct from v_today then v_n := 0; end if;
  v_n := coalesce(v_n, 0);

  select coalesce(json_agg(t), '[]'::json) into v_pend from (
    select x.wk, g.name as guild, x.dmg,
           (select count(*) + 1 from public.tm_bossmem y where y.guild_id = x.guild_id and y.wk = x.wk and y.dmg > x.dmg)::int as rank,
           (select count(*) from public.tm_bossmem y where y.guild_id = x.guild_id and y.wk = x.wk)::int as cnt,
           (x.dmg * 500 >= bb.pool) as ok
      from public.tm_bossmem x
      join public.tm_boss bb on bb.guild_id = x.guild_id and bb.wk = x.wk and bb.killed_at is not null
      join public.tm_guild g on g.id = x.guild_id
     where x.uid = v_u and not x.claimed and x.tries > 0 and x.wk >= v_wk - 28
     order by x.wk desc) t;

  select coalesce(json_agg(t), '[]'::json) into v_race from (
    select g.name, g.lv, extract(epoch from (bb.killed_at - (v_wk::timestamp at time zone 'Asia/Ho_Chi_Minh')))::bigint as secs
      from public.tm_boss bb join public.tm_guild g on g.id = bb.guild_id
     where bb.wk = v_wk and bb.killed_at is not null
     order by bb.killed_at limit 10) t;

  if m.uid is null then
    return json_build_object('status', 'ok', 'guild', false, 'wk', v_wk, 'left', 2 - v_n, 'pending', v_pend, 'race', v_race);
  end if;

  select * into b from public.tm_boss where guild_id = m.guild_id and wk = v_wk;
  select coalesce(json_agg(t), '[]'::json) into v_top from (
    select x.name, x.dmg, x.tries, (x.uid = v_u) as me
      from public.tm_bossmem x where x.guild_id = m.guild_id and x.wk = v_wk
     order by x.dmg desc, x.upd limit 30) t;
  select dmg, tries into v_my, v_tr from public.tm_bossmem where wk = v_wk and guild_id = m.guild_id and uid = v_u;

  return json_build_object('status', 'ok', 'guild', true, 'wk', v_wk,
    'boss', (abs((v_wk - date '2026-01-05') / 7)::int) % 8,
    'pool', b.pool, 'dmg', coalesce(b.dmg, 0), 'killed', (b.killed_at is not null),
    'left', 2 - v_n, 'my', coalesce(v_my, 0), 'tries', coalesce(v_tr, 0),
    'top', v_top, 'race', v_race, 'pending', v_pend);
end $$;

-- ---------------------------------------------------------------------
-- Nhận thưởng tuần (1 lần/tuần). Máy khách chỉ phát thưởng khi status = ok.
-- ---------------------------------------------------------------------
create or replace function public.tm_boss_claim(p_wk date) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_wk date := public.tm_wk(); x public.tm_bossmem; v_pool bigint; v_rank int; v_cnt int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_wk is null or p_wk > v_wk or p_wk < v_wk - 28 then return json_build_object('status', 'old'); end if;
  select m.* into x from public.tm_bossmem m
   where m.uid = v_u and m.wk = p_wk and not m.claimed and m.tries > 0
     and exists (select 1 from public.tm_boss b where b.guild_id = m.guild_id and b.wk = m.wk and b.killed_at is not null)
   order by m.dmg desc limit 1 for update;
  if not found then return json_build_object('status', 'none'); end if;
  select pool into v_pool from public.tm_boss where guild_id = x.guild_id and wk = x.wk;
  if v_pool is null or x.dmg * 500 < v_pool then return json_build_object('status', 'low'); end if;
  update public.tm_bossmem set claimed = true where wk = x.wk and guild_id = x.guild_id and uid = v_u;
  select count(*) + 1 into v_rank from public.tm_bossmem where wk = x.wk and guild_id = x.guild_id and dmg > x.dmg;
  select count(*) into v_cnt from public.tm_bossmem where wk = x.wk and guild_id = x.guild_id;
  return json_build_object('status', 'ok', 'rank', v_rank, 'cnt', v_cnt, 'dmg', x.dmg);
end $$;

revoke all on function public.tm_wk() from public, anon, authenticated;
revoke all on function public.tm_boss_begin(), public.tm_boss_end(bigint), public.tm_boss_status(), public.tm_boss_claim(date) from public, anon;
grant execute on function public.tm_boss_begin(), public.tm_boss_end(bigint), public.tm_boss_status(), public.tm_boss_claim(date) to authenticated;
