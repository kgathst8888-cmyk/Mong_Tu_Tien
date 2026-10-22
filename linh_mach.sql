-- =====================================================================
-- LINH MẠCH ĐỘNG — bãi farm quái nhiều người (Supabase)
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI.
--
--   * Phòng chia theo dạng thể (0 Phàm / 1 Đạo / 2 Tiên), mỗi phòng tối đa lm_k('cap') người, đầy thì mở kênh mới.
--   * Mọi người hạ quái đều làm đầy thanh Linh Khí chung (0..100):
--        33  -> Triều Quái (60 giây, quái hồi sinh nhanh, EXP cao)
--        66  -> Linh Tuyền (90 giây, hồi máu + linh lực)
--       100  -> Boss Mạch Chủ (8 phút, chung 1 thanh máu; máu tính theo "triệu phần", như Hội Chiến Boss)
--   * Vòng kết thúc khi boss chết (+20 giây để mọi người thấy), hoặc boss quá 8 phút, hoặc vòng quá 30 phút.
--   * Thưởng tham gia do máy chủ cấp (lm_claim): chống nhận trùng, kẹp tốc độ hạ quái, giới hạn số vòng nhận thưởng/ngày.
-- Chỉnh cân bằng: sửa hàm lm_k() rồi chạy lại file. Gỡ: xem ROLLBACK ở cuối.
-- =====================================================================

create table if not exists public.lm_room(
  rk     int primary key,                 -- = tier*1000 + ch
  tier   smallint not null,
  ch     int      not null,
  cyc    bigint   not null default 1,     -- số thứ tự vòng
  pool   real     not null default 0,     -- Linh Khí 0..100
  stg    smallint not null default 0,     -- giai đoạn đã đạt: 0..3
  f1     timestamptz,                     -- lúc đạt 33 (Triều Quái)
  f2     timestamptz,                     -- lúc đạt 66 (Linh Tuyền)
  bs     timestamptz,                     -- lúc boss xuất hiện
  bm     real     not null default 1,     -- hệ số máu boss (chốt lúc boss xuất hiện)
  bdmg   bigint   not null default 0,     -- sát thương lên boss (triệu phần)
  bkill  timestamptz,
  killer text,
  cstart timestamptz not null default now(),
  ts     timestamptz not null default now()
);
create table if not exists public.lm_member(
  uid  uuid not null, slot smallint not null,
  rk   int  not null,
  name text not null default 'Đạo Hữu',
  ci smallint not null default 0, br smallint not null default -1, tier smallint not null default 0,
  lv int not null default 1, x real not null default .5,
  ts timestamptz not null default now(),
  primary key(uid, slot)
);
create index if not exists lm_member_rk on public.lm_member(rk, ts desc);
create table if not exists public.lm_part(
  uid uuid not null, slot smallint not null, rk int not null, cyc bigint not null,
  kills int not null default 0, dmg bigint not null default 0,
  stage smallint not null default 0, bk boolean not null default false,
  paid boolean not null default false, ts timestamptz not null default now(),
  primary key(uid, slot, rk, cyc)
);
create table if not exists public.lm_day(
  uid uuid not null, slot smallint not null, d date not null, n int not null default 0,
  primary key(uid, slot, d)
);
alter table public.lm_room   enable row level security;
alter table public.lm_member enable row level security;
alter table public.lm_part   enable row level security;
alter table public.lm_day    enable row level security;
revoke all on public.lm_room, public.lm_member, public.lm_part, public.lm_day from anon, authenticated;

-- ---- hằng số cân bằng ----
create or replace function public.lm_k(p text) returns numeric language sql immutable as $$
  select case p
    when 'cap'      then 20        -- người tối đa / phòng
    when 'unit'     then 0.15      -- Linh Khí mỗi quái (1 người ~ 670 quái đầy; 10 người ~ 67 quái/người)
    when 'kps'      then 3         -- quái tối đa / giây / người (chống gian lận)
    when 'bm_base'  then 1
    when 'bm_per'   then 0.5       -- máu boss = 1 + 0.5 x số người (tối đa bm_max)
    when 'bm_max'   then 8
    when 'boss_sec' then 480       -- boss tồn tại tối đa 8 phút
    when 'cyc_sec'  then 1800      -- vòng tối đa 30 phút
    when 'min_kills'then 40        -- tối thiểu để có thưởng
    when 'gold'     then 120000    -- x (tier+1) x hệ số giai đoạn
    when 'lt_boss'  then 2         -- LT khoá khi boss chết: lt_boss x (tier+1)
    when 'lt_top'   then 3         -- thêm cho người sát thương cao nhất
    when 'day_cap'  then 12        -- số vòng nhận thưởng / ngày / nhân vật
    else 0 end
$$;

-- ---- báo vị trí + số quái đã hạ + sát thương boss; nhận trạng thái phòng ----
create or replace function public.lm_ping(
  p_slot int, p_name text, p_ci int, p_br int, p_tier int, p_lv int, p_x real,
  p_kills int default 0, p_dmg numeric default 0
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_t smallint := greatest(0, least(2, coalesce(p_tier, 0)));
  v_n text; v_m public.lm_member; v_r public.lm_room; v_rk int; v_dt real; v_k int; v_d bigint;
  v_cnt int; v_list json; v_pool real; v_stg smallint; v_my record; v_ch int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  v_n := left(btrim(regexp_replace(coalesce(nullif(p_name,''),'Đạo Hữu'), '[[:cntrl:]]+', ' ', 'g')), 16);
  if char_length(v_n) < 1 then v_n := 'Đạo Hữu'; end if;

  select * into v_m from public.lm_member where uid = v_u and slot = v_s;
  if found and v_m.tier = v_t and v_m.ts > now() - interval '25 seconds' then
    v_rk := v_m.rk;
  else
    select r.rk into v_rk from public.lm_room r
     where r.tier = v_t
       and (select count(*) from public.lm_member m where m.rk = r.rk and m.ts > now() - interval '12 seconds'
              and not (m.uid = v_u and m.slot = v_s)) < public.lm_k('cap')::int
     order by (select count(*) from public.lm_member m where m.rk = r.rk and m.ts > now() - interval '12 seconds') desc, r.ch
     limit 1;
    if v_rk is null then
      v_ch := coalesce((select max(ch) from public.lm_room where tier = v_t), 0) + 1;
      v_rk := v_t * 1000 + least(v_ch, 999);
      insert into public.lm_room(rk, tier, ch) values (v_rk, v_t, least(v_ch, 999)) on conflict do nothing;
    end if;
  end if;

  select * into v_r from public.lm_room where rk = v_rk for update;

  -- sang vòng mới
  if (v_r.bkill is not null and now() > v_r.bkill + interval '20 seconds')
     or (v_r.bs is not null and now() > v_r.bs + (public.lm_k('boss_sec') || ' seconds')::interval)
     or now() > v_r.cstart + (public.lm_k('cyc_sec') || ' seconds')::interval then
    update public.lm_room set cyc = cyc + 1, pool = 0, stg = 0, f1 = null, f2 = null, bs = null, bm = 1,
           bdmg = 0, bkill = null, killer = null, cstart = now()
     where rk = v_rk returning * into v_r;
  end if;

  -- quái đã hạ (kẹp theo thời gian từ lần ping trước)
  v_dt := least(10, greatest(1, extract(epoch from (now() - coalesce(v_m.ts, now() - interval '2 seconds')))))::real;
  v_k  := greatest(0, least(coalesce(p_kills, 0), (public.lm_k('kps') * v_dt)::int + 2));

  insert into public.lm_member(uid, slot, rk, name, ci, br, tier, lv, x, ts)
  values (v_u, v_s, v_rk, v_n, greatest(0,least(9,coalesce(p_ci,0))), greatest(-1,least(20,coalesce(p_br,-1))), v_t,
          greatest(1,least(999,coalesce(p_lv,1))), greatest(0,least(1,coalesce(p_x,.5))), now())
  on conflict (uid, slot) do update set rk = excluded.rk, name = excluded.name, ci = excluded.ci, br = excluded.br,
      tier = excluded.tier, lv = excluded.lv, x = excluded.x, ts = now();

  select count(*) into v_cnt from public.lm_member where rk = v_rk and ts > now() - interval '12 seconds';

  v_pool := v_r.pool; v_stg := v_r.stg;
  if v_r.bkill is null and v_k > 0 then
    v_pool := least(100, v_r.pool + v_k * public.lm_k('unit'));
  end if;
  if v_stg < 1 and v_pool >= 33  then v_stg := 1; v_r.f1 := now(); end if;
  if v_stg < 2 and v_pool >= 66  then v_stg := 2; v_r.f2 := coalesce(v_r.f2, now()); if v_r.f1 is null then v_r.f1 := now(); end if; end if;
  if v_stg < 3 and v_pool >= 100 then
    v_stg := 3; v_r.bs := now();
    v_r.bm := least(public.lm_k('bm_max'), public.lm_k('bm_base') + public.lm_k('bm_per') * v_cnt);
    if v_r.f1 is null then v_r.f1 := now(); end if;
    if v_r.f2 is null then v_r.f2 := now(); end if;
  end if;

  v_d := 0;
  if v_r.bs is not null and v_r.bkill is null then
    v_d := greatest(0, least(coalesce(p_dmg, 0)::bigint, 400000));
    v_r.bdmg := least(1000000, v_r.bdmg + v_d);
    if v_r.bdmg >= 1000000 then v_r.bkill := now(); v_r.killer := v_n; end if;
  end if;

  update public.lm_room set pool = v_pool, stg = v_stg, f1 = v_r.f1, f2 = v_r.f2, bs = v_r.bs, bm = v_r.bm,
         bdmg = v_r.bdmg, bkill = v_r.bkill, killer = v_r.killer, ts = now() where rk = v_rk;

  insert into public.lm_part(uid, slot, rk, cyc, kills, dmg, stage, bk)
  values (v_u, v_s, v_rk, v_r.cyc, v_k, v_d, v_stg, v_r.bkill is not null)
  on conflict (uid, slot, rk, cyc) do update set kills = public.lm_part.kills + v_k, dmg = public.lm_part.dmg + v_d,
        stage = greatest(public.lm_part.stage, v_stg), bk = public.lm_part.bk or (v_r.bkill is not null), ts = now();
  if v_r.bkill is not null or v_stg > 0 then
    update public.lm_part set stage = greatest(stage, v_stg), bk = bk or (v_r.bkill is not null)
     where rk = v_rk and cyc = v_r.cyc and (stage < v_stg or (v_r.bkill is not null and not bk))
       and ts > now() - interval '40 minutes';
  end if;

  select kills, dmg into v_my from public.lm_part where uid = v_u and slot = v_s and rk = v_rk and cyc = v_r.cyc;

  select coalesce(json_agg(json_build_object('id', left(md5(m.uid::text || m.slot::text), 8), 'name', m.name, 'ci', m.ci,
           'br', m.br, 'tier', m.tier, 'lv', m.lv, 'x', m.x)), '[]'::json) into v_list
    from (select * from public.lm_member where rk = v_rk and ts > now() - interval '12 seconds'
             and not (uid = v_u and slot = v_s) order by ts desc limit 30) m;

  if random() < 0.01 then
    delete from public.lm_member where ts < now() - interval '1 day';
    delete from public.lm_part where ts < now() - interval '3 days';
  end if;

  return json_build_object('status','ok','rk',v_rk,'ch',v_rk % 1000,'cyc',v_r.cyc,'n',v_cnt,'list',v_list,
    'pool',v_pool,'stg',v_stg,
    'f1',case when v_r.f1 is null then null else extract(epoch from now() - v_r.f1) end,
    'f2',case when v_r.f2 is null then null else extract(epoch from now() - v_r.f2) end,
    'bs',case when v_r.bs is null then null else extract(epoch from now() - v_r.bs) end,
    'bm',v_r.bm,'bdmg',v_r.bdmg,'dead',v_r.bkill is not null,'killer',v_r.killer,
    'kills',coalesce(v_my.kills,0),'dmg',coalesce(v_my.dmg,0),'min',public.lm_k('min_kills')::int,
    'bsec',public.lm_k('boss_sec')::int);
end $$;

-- ---- nhận thưởng các vòng đã kết thúc ----
create or replace function public.lm_claim(p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_s smallint := greatest(0, least(2, coalesce(p_slot, 0)));
  v_day date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_n int; r record; v_gold bigint := 0; v_lt bigint := 0; v_c int := 0; v_top int := 0; v_bk int := 0; v_mul numeric; v_tier int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.lm_day(uid, slot, d, n) values (v_u, v_s, v_day, 0) on conflict do nothing;
  select n into v_n from public.lm_day where uid = v_u and slot = v_s and d = v_day for update;

  for r in
    select p.* from public.lm_part p join public.lm_room m on m.rk = p.rk
     where p.uid = v_u and p.slot = v_s and not p.paid and p.cyc < m.cyc and p.ts > now() - interval '2 days'
     order by p.ts for update of p
  loop
    update public.lm_part set paid = true where uid = r.uid and slot = r.slot and rk = r.rk and cyc = r.cyc;
    if r.kills >= public.lm_k('min_kills') and v_n < public.lm_k('day_cap')::int then
      v_tier := r.rk / 1000;
      v_mul := case when r.bk then 3 when r.stage = 2 then 2 when r.stage = 1 then 1.5 else 1 end;
      v_gold := v_gold + (public.lm_k('gold') * (v_tier + 1) * v_mul)::bigint;
      if r.bk then
        v_lt := v_lt + (public.lm_k('lt_boss') * (v_tier + 1))::bigint; v_bk := v_bk + 1;
        if r.dmg > 0 and not exists (select 1 from public.lm_part q where q.rk = r.rk and q.cyc = r.cyc and q.dmg > r.dmg) then
          v_lt := v_lt + public.lm_k('lt_top')::bigint; v_top := v_top + 1;
        end if;
      end if;
      v_n := v_n + 1; v_c := v_c + 1;
    end if;
  end loop;
  update public.lm_day set n = v_n where uid = v_u and slot = v_s and d = v_day;

  if v_lt > 0 then
    insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
    insert into public.cho_lock(uid, slot, n) values (v_u, v_s, v_lt)
      on conflict (uid, slot) do update set n = public.cho_lock.n + excluded.n;
  end if;
  return json_build_object('status','ok','gold',v_gold,'lt',v_lt,'c',v_c,'bk',v_bk,'top',v_top,
                           'left',greatest(0, public.lm_k('day_cap')::int - v_n));
end $$;

create or replace function public.lm_leave(p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid();
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.lm_member set ts = now() - interval '1 minute'
   where uid = v_u and slot = greatest(0, least(2, coalesce(p_slot, 0)));
  return json_build_object('status','ok');
end $$;

revoke all on function public.lm_ping(int,text,int,int,int,int,real,int,numeric) from public, anon;
revoke all on function public.lm_claim(int) from public, anon;
revoke all on function public.lm_leave(int) from public, anon;
grant execute on function public.lm_ping(int,text,int,int,int,int,real,int,numeric) to authenticated;
grant execute on function public.lm_claim(int) to authenticated;
grant execute on function public.lm_leave(int) to authenticated;

-- ROLLBACK:
-- drop function if exists public.lm_ping(int,text,int,int,int,int,real,int,numeric), public.lm_claim(int), public.lm_leave(int), public.lm_k(text);
-- drop table if exists public.lm_day, public.lm_part, public.lm_member, public.lm_room;
