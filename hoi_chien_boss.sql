-- =====================================================================
-- HỘI CHIẾN BOSS (Supabase) — boss NHIỀU NGƯỜI CHƠI cùng đánh, mở mỗi 3 giờ
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. Chạy lại được.
-- CẦN CHẠY TRƯỚC: linh_thach_khoa.sql (dùng bảng cho_lock / cho_wallet / hàm _lks).
--
-- Lịch (giờ Việt Nam, tính theo đồng hồ MÁY CHỦ): 12:00, 15:00, 20:00 mỗi ngày (Fix388; trước đây 3 giờ / lần).
--   mỗi lần tồn tại 20 phút:  0–5 phút  = TẬP TRUNG (chưa có boss)
--                             5–20 phút = BOSS XUẤT HIỆN
--   Boss bị hạ sớm → 20 rương rơi trên đất, mở được trong 120 giây rồi đóng. Mỗi người mở tối đa 2 rương (hcb_k('per_p')).
--   Mỗi rương: 1 trang bị Thiên Thần (máy khách tạo) + 2 phần thưởng ngẫu nhiên do máy chủ tung (hàm hcb_roll).
-- Phần thưởng (máy chủ tự chống nhận trùng, không tin máy khách):
--   • Có đóng góp (>= min_dmg) mà boss KHÔNG bị hạ        → 3.000.000 vàng + 5 Linh Thạch khoá
--   • Boss bị hạ: mỗi người mở được 1 rương (1 trang bị Thiên Thần ngẫu nhiên, máy khách tạo)
--       - người kết liễu                                  → +20 Linh Thạch khoá
--       - người có sát thương cao nhất                    → +20 Linh Thạch khoá
--       - người không mở được rương (hết rương / bỏ lỡ)   → nhận phần "không hạ được boss" như trên
-- Máu boss: tính theo "triệu phần" (1.000.000 = 100%). Máy khách báo phần máu mình đã trừ,
--   máy chủ cộng dồn của mọi người → ai cũng thấy chung 1 thanh máu. Hệ số máu m (boss dày hơn
--   khi đông người) chốt 1 lần lúc boss xuất hiện = hp_base + hp_per × số người đã vào, tối đa hp_max.
-- Chỉnh cân bằng: sửa hàm hcb_k() bên dưới rồi chạy lại file.
-- =====================================================================

create table if not exists public.hcb_event(
  ev        bigint      primary key,                 -- số thứ tự lần mở (theo giờ VN, 3 giờ / lần)
  m         real,                                    -- hệ số máu boss (chốt lúc boss xuất hiện)
  dmg       bigint      not null default 0,          -- tổng sát thương đã gây (triệu phần máu boss)
  killed_at timestamptz,
  killer    text,
  k_uid     uuid,
  k_slot    smallint,
  created   timestamptz not null default now()
);

create table if not exists public.hcb_player(
  ev      bigint      not null,
  uid     uuid        not null,
  slot    smallint    not null,
  name    text        not null default 'Đạo Hữu',
  ci      smallint    not null default 0,
  br      smallint    not null default -1,
  tier    smallint    not null default 0,
  lv      int         not null default 1,
  x       real        not null default .5,
  ts      timestamptz not null default now(),         -- lần báo gần nhất (hiện diện)
  joined  timestamptz not null default now(),
  dmg     bigint      not null default 0,
  rep     timestamptz,                                -- lần gần nhất gây sát thương (xếp hạng khi bằng điểm)
  chest   smallint,                                   -- số rương đã mở (null = chưa mở)
  deaths  smallint    not null default 0,         -- số lần đã chết trong trận (quá hcb_k('respawns') = bị loại)
  c_paid  boolean     not null default false,         -- đã xử lý phần thưởng "tham gia"
  k_paid  boolean     not null default false,         -- đã xử lý thưởng kết liễu
  t_paid  boolean     not null default false,         -- đã xử lý thưởng sát thương cao nhất
  primary key(ev, uid, slot)
);
alter table public.hcb_player add column if not exists deaths smallint not null default 0;

-- Fix388: mỗi người mở được nhiều rương → mỗi rương đã mở ghi 1 dòng (idx chỉ 1 người mở được)
create table if not exists public.hcb_open(
  ev   bigint   not null,
  idx  smallint not null,
  uid  uuid     not null,
  slot smallint not null,
  ts   timestamptz not null default now(),
  primary key(ev, idx)
);
create index if not exists hcb_open_player on public.hcb_open(ev, uid, slot);
alter table public.hcb_open enable row level security;
revoke all on public.hcb_open from anon, authenticated;
create unique index if not exists hcb_player_chest_uq on public.hcb_player(ev, chest) where chest is not null;
create index if not exists hcb_player_ts on public.hcb_player(ev, ts desc);

alter table public.hcb_event  enable row level security;
alter table public.hcb_player enable row level security;
revoke all on public.hcb_event  from anon, authenticated;
revoke all on public.hcb_player from anon, authenticated;

-- ---------- hằng số cân bằng ----------
create or replace function public.hcb_k(p_k text) returns numeric
language sql immutable as $$
  select case p_k
    when 'slot'       then 10800     -- 3 giờ / lần
    when 'gather'     then 300       -- 5 phút tập trung
    when 'total'      then 1200      -- tổng 20 phút
    when 'chest_secs' then 120       -- rương tồn tại sau khi boss chết (giây)
    when 'chests'     then 20        -- số rương
    when 'hp_base'    then 6         -- máu boss = hp_base + hp_per × số người đã vào (so với 1 Ma Thần)
    when 'hp_per'     then 1
    when 'hp_max'     then 80
    when 'min_dmg'    then 500       -- đóng góp tối thiểu để được tính "tham gia" (500 = 0,05% máu boss)
    when 'cap_s'      then 30000     -- trần sát thương / giây của 1 người (3% máu boss) chống gian lận
    when 'gold'       then 3000000
    when 'lt_c'       then 5
    when 'lt_k'       then 20
    when 'lt_t'       then 20
    when 'per_p'      then 2         -- số rương mỗi người được mở
    when 'respawns'   then 3         -- số lần hồi sinh tối đa mỗi trận (chết lần thứ 4 → về làng)
    else 0 end $$;

-- pha hiện tại: gather | boss | chest | closed
create or replace function public.hcb_phase(p_t int, p_killed timestamptz) returns text
language sql stable as $$
  select case
    when p_killed is not null then
      (case when now() < p_killed + make_interval(secs => public.hcb_k('chest_secs')::double precision)
            then 'chest' else 'closed' end)
    when p_t < public.hcb_k('gather') then 'gather'
    when p_t < public.hcb_k('total')  then 'boss'
    else 'closed' end $$;

-- Fix388: lượt hiện tại theo lịch 12:00 / 15:00 / 20:00 (giờ VN).
--   ev = floor(giây-VN lúc bắt đầu lượt / 10800) → vẫn tăng dần (12h→ngày*8+4, 15h→+5, 20h→+6), không đụng số cũ
--   t  = giây kể từ lúc lượt bắt đầu (>= 1200 là đã đóng) · nx = giây tới lượt kế tiếp
create or replace function public.hcb_cur() returns table(ev bigint, t int, nx int)
language sql stable as $$
  with x as (select floor(extract(epoch from now()))::bigint + 25200 as e),
       d as (select e, e / 86400 as dd, (e % 86400)::int as sd from x),
       c as (select e, dd, sd,
                    case when sd >= 72000 then 72000 when sd >= 54000 then 54000 when sd >= 43200 then 43200 else null end as st from d)
  select case when st is null then ((dd - 1) * 86400 + 72000) / 10800 else (dd * 86400 + st) / 10800 end,
         (case when st is null then sd + 86400 - 72000 else sd - st end)::int,
         (case when st is null then 43200 - sd when st = 43200 then 54000 - sd when st = 54000 then 72000 - sd else 86400 + 43200 - sd end)::int
    from c $$;

-- Fix388: tung 1 phần thưởng ngẫu nhiên cho rương (p_ex = loại đã ra ở lần tung trước, để 2 phần thưởng khác loại)
--   bua 2% (Bùa Chống Rơi x1) · lv 5% (Long Vũ Thiên Dực x1) · mc 5% (Mảnh Cánh Cấp 4 x1)
--   còn lại 88% chia đều: lt (10–50 Linh Thạch khoá) · da (Đá cấp 1 hoặc 2, x1–2) · g (2–10 triệu vàng)
create or replace function public.hcb_roll(p_ex text default '') returns json
language plpgsql volatile as $$
declare v_r double precision; v_t text; v_i int := 0;
begin
  loop
    v_i := v_i + 1; v_r := random() * 100;
    if    v_r < 2  then v_t := 'bua';
    elsif v_r < 7  then v_t := 'lv';
    elsif v_r < 12 then v_t := 'mc';
    else v_t := (array['lt','da','g'])[1 + floor(random() * 3)::int];
    end if;
    exit when v_t <> coalesce(p_ex, '') or v_i >= 12;
  end loop;
  return case v_t
    when 'lt'  then json_build_object('t','lt','n', 10 + floor(random() * 41)::int)
    when 'da'  then json_build_object('t','da','k', case when random() < .5 then 'a' else 'b' end,'n', 1 + floor(random() * 2)::int)
    when 'g'   then json_build_object('t','g','n', (2 + floor(random() * 9)::int) * 1000000)
    when 'mc'  then json_build_object('t','mc','n', 1)
    when 'lv'  then json_build_object('t','lv','n', 1)
    else            json_build_object('t','bua','n', 1) end;
end $$;

-- ---------------------------------------------------------------------
-- Báo hiện diện + gửi sát thương + nhận toàn bộ trạng thái (1 lượt gọi)
--   p_join = true: vào bản đồ (chỉ được khi đang TẬP TRUNG / BOSS)
--   p_dmg  = phần máu boss đã trừ kể từ lần báo trước (triệu phần)
-- ---------------------------------------------------------------------
drop function if exists public.hcb_ping(int,text,int,int,int,int,real,numeric,boolean);
create or replace function public.hcb_ping(
  p_slot int, p_name text, p_ci int, p_br int, p_tier int, p_lv int, p_x real,
  p_dmg numeric default 0, p_join boolean default false
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid     := auth.uid();
  v_s    smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_e    bigint   := floor(extract(epoch from now()))::bigint + 25200;      -- giờ VN (UTC+7)
  v_ev   bigint   := (select c.ev from public.hcb_cur() c);
  v_t    int      := (select c.t  from public.hcb_cur() c);
  v_nx   int      := (select c.nx from public.hcb_cur() c);
  v_n text; v_ci int; v_br int; v_tier int; v_lv int; v_x real;
  v_m real; v_dmgT bigint; v_kat timestamptz; v_killer text;
  v_ph text; v_left int; v_cnt int; v_tot int; v_rank int;
  v_have boolean; v_mydmg bigint := 0; v_mychest smallint; v_myrep timestamptz; v_myts timestamptz;
  v_add bigint := 0; v_cap bigint; v_dt double precision; v_in numeric;
  v_top json; v_oth json; v_chests json; v_mine json := '[]'::json; v_opened int := 0;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  v_n    := left(btrim(regexp_replace(coalesce(nullif(p_name,''),'Đạo Hữu'), '[[:cntrl:]]+', ' ', 'g')), 16);
  if char_length(v_n) < 1 then v_n := 'Đạo Hữu'; end if;
  v_ci   := greatest(0,  least(coalesce(p_ci,0), 9));
  v_br   := greatest(-1, least(coalesce(p_br,-1), 3));
  v_tier := greatest(0,  least(coalesce(p_tier,0), 6));
  v_lv   := greatest(1,  least(coalesce(p_lv,1), 999));
  v_x    := greatest(0,  least(coalesce(p_x,.5), 1));

  insert into public.hcb_event(ev) values (v_ev) on conflict (ev) do nothing;
  select m, dmg, killed_at, killer into v_m, v_dmgT, v_kat, v_killer
    from public.hcb_event where ev = v_ev for update;         -- khoá dòng: tuần tự hoá việc cộng sát thương
  v_ph := public.hcb_phase(v_t, v_kat);

  select true, dmg, chest, rep, ts into v_have, v_mydmg, v_mychest, v_myrep, v_myts
    from public.hcb_player where ev = v_ev and uid = v_u and slot = v_s;
  v_have := coalesce(v_have, false);

  -- vào bản đồ
  if not v_have and coalesce(p_join, false) and v_ph in ('gather','boss') then
    insert into public.hcb_player(ev, uid, slot, name, ci, br, tier, lv, x)
    values (v_ev, v_u, v_s, v_n, v_ci, v_br, v_tier, v_lv, v_x)
    on conflict (ev, uid, slot) do nothing;
    v_have := true; v_mydmg := 0; v_mychest := null; v_myrep := null; v_myts := now();
  end if;

  -- chốt hệ số máu khi boss xuất hiện (1 lần cho cả trận)
  if v_ph in ('boss','chest') and v_m is null then
    select count(*) into v_cnt from public.hcb_player where ev = v_ev;
    v_m := least(public.hcb_k('hp_max'), public.hcb_k('hp_base') + public.hcb_k('hp_per') * v_cnt);
    update public.hcb_event set m = v_m where ev = v_ev;
  end if;

  -- cộng sát thương (chỉ khi đang BOSS, boss chưa chết, người chơi đã vào)
  if v_have and v_ph = 'boss' then
    v_dt  := extract(epoch from (now() - coalesce(v_myts, now() - interval '2 seconds')));
    v_dt  := greatest(1, least(8, v_dt));
    v_cap := floor(public.hcb_k('cap_s') * v_dt)::bigint;
    v_in  := floor(least(greatest(coalesce(p_dmg, 0), 0), 1000000000));
    v_add := greatest(0, least(v_in::bigint, v_cap, 1000000 - v_dmgT));
    if v_add > 0 then
      v_dmgT  := v_dmgT + v_add;
      v_mydmg := v_mydmg + v_add;
      update public.hcb_event set dmg = v_dmgT where ev = v_ev;
      update public.hcb_player set dmg = v_mydmg, rep = now() where ev = v_ev and uid = v_u and slot = v_s;
      v_myrep := now();
      if v_dmgT >= 999980 and v_dmgT < 1000000 then           -- Fix388: sót < 0,002% máu do làm tròn phía máy khách → coi như hạ (tránh boss hết máu không chết)
        v_mydmg := v_mydmg + (1000000 - v_dmgT); v_dmgT := 1000000;
        update public.hcb_event set dmg = v_dmgT where ev = v_ev;
        update public.hcb_player set dmg = v_mydmg where ev = v_ev and uid = v_u and slot = v_s;
      end if;
      if v_dmgT >= 1000000 then                               -- người trừ nốt = người kết liễu
        v_kat := now(); v_killer := v_n;
        update public.hcb_event set killed_at = v_kat, killer = v_n, k_uid = v_u, k_slot = v_s where ev = v_ev;
        v_ph := 'chest';
      end if;
    end if;
  end if;

  -- cập nhật hiện diện
  if v_have then
    update public.hcb_player
       set name = v_n, ci = v_ci, br = v_br, tier = v_tier, lv = v_lv, x = v_x, ts = now()
     where ev = v_ev and uid = v_u and slot = v_s;
  end if;

  if random() < .02 then                                      -- dọn dữ liệu cũ (> 3 ngày)
    delete from public.hcb_player where ev < v_ev - 24;
    delete from public.hcb_event  where ev < v_ev - 24;
  end if;

  v_left := case v_ph
              when 'gather' then (public.hcb_k('gather') - v_t)::int
              when 'boss'   then (public.hcb_k('total')  - v_t)::int
              when 'chest'  then greatest(0, ceil(extract(epoch from
                                   (v_kat + make_interval(secs => public.hcb_k('chest_secs')::double precision) - now()))))::int
              else 0 end;

  select count(*) into v_cnt from public.hcb_player where ev = v_ev and ts > now() - interval '12 seconds';
  select count(*) into v_tot from public.hcb_player where ev = v_ev;

  if v_have and v_mydmg > 0 then
    select 1 + count(*) into v_rank from public.hcb_player o
     where o.ev = v_ev and o.dmg > 0
       and (o.dmg > v_mydmg
            or (o.dmg = v_mydmg and (o.rep < v_myrep or (o.rep = v_myrep and (o.uid, o.slot) < (v_u, v_s)))));
  end if;

  select coalesce(json_agg(t order by t.r), '[]'::json) into v_top from (
    select (row_number() over (order by b.dmg desc, b.rep asc, b.uid, b.slot))::int as r,
           b.name, b.dmg, (b.uid = v_u and b.slot = v_s) as me
      from public.hcb_player b
     where b.ev = v_ev and b.dmg > 0
     order by b.dmg desc, b.rep asc, b.uid, b.slot
     limit 5) t;

  select coalesce(json_agg(t), '[]'::json) into v_oth from (
    select substr(md5(uid::text || ':' || slot::text), 1, 10) as id, name, ci, br, tier, lv, x
      from public.hcb_player
     where ev = v_ev and ts > now() - interval '12 seconds' and not (uid = v_u and slot = v_s)
     order by abs(x - v_x), uid, slot
     limit 24) t;

  select coalesce(json_agg(idx order by idx), '[]'::json) into v_chests
    from public.hcb_open where ev = v_ev;
  select coalesce(json_agg(idx order by idx), '[]'::json), count(*)::int into v_mine, v_opened
    from public.hcb_open where ev = v_ev and uid = v_u and slot = v_s;

  return json_build_object(
    'status','ok','sv', extract(epoch from now()),'ev', v_ev,'phase', v_ph,'t', v_t,
    'left', v_left,'next', v_nx,
    'm', coalesce(v_m, 0),'dmg', v_dmgT,'n', v_cnt,'tot', v_tot,
    'killed', v_kat is not null,'killer', v_killer,
    'joined', v_have,
    'my', json_build_object('dmg', coalesce(v_mydmg,0),'rank', v_rank,'chest', v_mychest,'mine', v_mine,'opened', v_opened,
                            'ok', coalesce(v_mydmg,0) >= public.hcb_k('min_dmg')),
    'top', v_top,'oth', v_oth,'chests', v_chests);
end $$;

-- ---------------------------------------------------------------------
-- Mở 1 rương (mỗi người 1 rương; rương mỗi số chỉ 1 người mở)
-- ---------------------------------------------------------------------
create or replace function public.hcb_chest(p_slot int, p_idx int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid     := auth.uid();
  v_s    smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_ev   bigint   := (select c.ev from public.hcb_cur() c);
  v_t    int      := (select c.t  from public.hcb_cur() c);
  v_kat timestamptz; v_have boolean; v_dmg bigint; v_cnt int;
  v_r1 json; v_r2 json; v_lt bigint := 0;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select killed_at into v_kat from public.hcb_event where ev = v_ev for update;
  if not found or v_kat is null then return json_build_object('status','no_boss'); end if;
  if public.hcb_phase(v_t, v_kat) <> 'chest' then return json_build_object('status','closed'); end if;

  select true, dmg into v_have, v_dmg
    from public.hcb_player where ev = v_ev and uid = v_u and slot = v_s;
  if not coalesce(v_have, false) or v_dmg < public.hcb_k('min_dmg') then
    return json_build_object('status','no_part');             -- chưa đóng góp đủ nên không được mở rương
  end if;
  select count(*)::int into v_cnt from public.hcb_open where ev = v_ev and uid = v_u and slot = v_s;
  if v_cnt >= public.hcb_k('per_p') then return json_build_object('status','had','opened', v_cnt); end if;
  if p_idx is null or p_idx < 0 or p_idx >= public.hcb_k('chests') then return json_build_object('status','bad'); end if;

  begin
    insert into public.hcb_open(ev, idx, uid, slot) values (v_ev, p_idx, v_u, v_s);
  exception when unique_violation then
    return json_build_object('status','taken');
  end;
  update public.hcb_player set chest = coalesce(chest, p_idx) where ev = v_ev and uid = v_u and slot = v_s;

  -- Fix388: 2 phần thưởng ngẫu nhiên (khác loại nhau). Linh Thạch khoá cộng thẳng vào cho_lock; phần còn lại máy khách áp theo kết quả trả về.
  v_r1 := public.hcb_roll('');
  v_r2 := public.hcb_roll(v_r1->>'t');
  if v_r1->>'t' = 'lt' then v_lt := v_lt + (v_r1->>'n')::bigint; end if;
  if v_r2->>'t' = 'lt' then v_lt := v_lt + (v_r2->>'n')::bigint; end if;
  if v_lt > 0 then
    insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
    insert into public.cho_lock(uid, slot, n) values (v_u, v_s, v_lt)
      on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
  end if;
  return json_build_object('status','ok','chest', p_idx,'opened', v_cnt + 1,'rw', json_build_array(v_r1, v_r2));
end $$;

-- ---------------------------------------------------------------------
-- Nhận thưởng (gộp mọi lần chưa nhận trong 24 giờ gần nhất). Idempotent: mỗi khoản chỉ trả 1 lần.
--   • thưởng kết liễu / sát thương cao nhất: nhận ngay khi boss chết
--   • thưởng "tham gia" (vàng + Linh Thạch khoá): nhận khi trận đã đóng
-- Linh Thạch khoá cộng THẲNG vào cho_lock của nhân vật p_slot; vàng do máy khách cộng theo số trả về.
-- ---------------------------------------------------------------------
create or replace function public.hcb_claim(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u    uuid     := auth.uid();
  v_s    smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_e    bigint   := floor(extract(epoch from now()))::bigint + 25200;
  v_ev   bigint   := (select c.ev from public.hcb_cur() c);
  v_t    int      := (select c.t  from public.hcb_cur() c);
  v_nx   int      := (select c.nx from public.hcb_cur() c);
  r record;
  v_gold bigint := 0; v_lt bigint := 0; v_ltc bigint := 0; v_ltk bigint := 0; v_ltt bigint := 0; v_c int := 0; v_k int := 0; v_tp int := 0;
  v_tu uuid; v_ts smallint; v_closed boolean;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  for r in
    select p.ev, p.dmg, p.chest, p.c_paid, p.k_paid, p.t_paid, e.killed_at, e.k_uid, e.k_slot
      from public.hcb_player p join public.hcb_event e on e.ev = p.ev
     where p.uid = v_u and p.slot = v_s and p.ev >= v_ev - 8
       and p.dmg >= public.hcb_k('min_dmg')
       and not (p.c_paid and p.k_paid and p.t_paid)
     order by p.ev
       for update of p
  loop
    v_closed := (r.ev < v_ev) or (public.hcb_phase(v_t, r.killed_at) = 'closed');

    if r.killed_at is not null and not r.k_paid then
      update public.hcb_player set k_paid = true where ev = r.ev and uid = v_u and slot = v_s;
      if r.k_uid = v_u and r.k_slot = v_s then
        v_lt := v_lt + public.hcb_k('lt_k')::bigint; v_ltk := v_ltk + public.hcb_k('lt_k')::bigint; v_k := v_k + 1;
      end if;
    end if;

    if r.killed_at is not null and not r.t_paid then            -- sau khi boss chết sát thương không đổi nữa
      update public.hcb_player set t_paid = true where ev = r.ev and uid = v_u and slot = v_s;
      select uid, slot into v_tu, v_ts from public.hcb_player
       where ev = r.ev and dmg > 0 order by dmg desc, rep asc, uid, slot limit 1;
      if v_tu = v_u and v_ts = v_s then
        v_lt := v_lt + public.hcb_k('lt_t')::bigint; v_ltt := v_ltt + public.hcb_k('lt_t')::bigint; v_tp := v_tp + 1;
      end if;
    end if;

    if v_closed and not r.c_paid then
      update public.hcb_player set c_paid = true where ev = r.ev and uid = v_u and slot = v_s;
      if r.killed_at is null or r.chest is null then            -- boss không bị hạ, hoặc không mở được rương
        v_gold := v_gold + public.hcb_k('gold')::bigint;
        v_lt   := v_lt   + public.hcb_k('lt_c')::bigint;
        v_ltc  := v_ltc  + public.hcb_k('lt_c')::bigint;
        v_c    := v_c + 1;
      end if;
      if r.killed_at is null then                               -- không có thưởng kết liễu / top → đóng luôn
        update public.hcb_player set k_paid = true, t_paid = true where ev = r.ev and uid = v_u and slot = v_s;
      end if;
    end if;
  end loop;

  if v_lt > 0 then
    insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
    insert into public.cho_lock(uid, slot, n) values (v_u, v_s, v_lt)
      on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
  end if;

  return json_build_object('status','ok','gold', v_gold,'lt', v_lt,'c', v_c,'k', v_k,'t', v_tp,'ltc', v_ltc,'ltk', v_ltk,'ltt', v_ltt,
                           'lks', public._lks(v_u));
end $$;

-- ---------------------------------------------------------------------
-- Rời bản đồ (biến mất khỏi danh sách người chơi ngay)
-- ---------------------------------------------------------------------
create or replace function public.hcb_leave(p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u  uuid := auth.uid();
  v_ev bigint := (select c.ev from public.hcb_cur() c);
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.hcb_player set ts = now() - interval '1 minute'
   where ev = v_ev and uid = v_u and slot = greatest(0, least(2, coalesce(p_slot, 0)));
  return json_build_object('status','ok');
end $$;

revoke all on function public.hcb_ping(int,text,int,int,int,int,real,numeric,boolean) from public, anon;
revoke all on function public.hcb_cur()  from public, anon;
revoke all on function public.hcb_roll(text)  from public, anon;
revoke all on function public.hcb_chest(int,int)  from public, anon;
revoke all on function public.hcb_claim(int)      from public, anon;
revoke all on function public.hcb_leave(int)      from public, anon;
grant execute on function public.hcb_ping(int,text,int,int,int,int,real,numeric,boolean) to authenticated;
grant execute on function public.hcb_cur()  to authenticated;
grant execute on function public.hcb_chest(int,int)  to authenticated;
grant execute on function public.hcb_claim(int)      to authenticated;
grant execute on function public.hcb_leave(int)      to authenticated;

-- ---------------------------------------------------------------------
-- Giới hạn hồi sinh: báo 1 lần chết (+1) / hỏi số lần đã chết của nhân vật trong trận hiện tại
-- ---------------------------------------------------------------------
create or replace function public.hcb_die(p_slot int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u  uuid     := auth.uid();
  v_s  smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_ev bigint   := (select c.ev from public.hcb_cur() c);
  v_d  smallint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.hcb_player set deaths = least(deaths + 1, 100)
   where ev = v_ev and uid = v_u and slot = v_s
   returning deaths into v_d;
  if not found then return json_build_object('status','no'); end if;
  return json_build_object('status','ok','deaths', v_d,'max', public.hcb_k('respawns')::int,
                           'out', v_d > public.hcb_k('respawns'));
end $$;

create or replace function public.hcb_deaths(p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u  uuid     := auth.uid();
  v_s  smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_ev bigint   := (select c.ev from public.hcb_cur() c);
  v_d  smallint := 0;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select deaths into v_d from public.hcb_player where ev = v_ev and uid = v_u and slot = v_s;
  v_d := coalesce(v_d, 0);
  return json_build_object('status','ok','deaths', v_d,'max', public.hcb_k('respawns')::int,
                           'out', v_d > public.hcb_k('respawns'));
end $$;

revoke all on function public.hcb_die(int)    from public, anon;
revoke all on function public.hcb_deaths(int) from public, anon;
grant execute on function public.hcb_die(int)    to authenticated;
grant execute on function public.hcb_deaths(int) to authenticated;
