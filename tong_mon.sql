-- =====================================================================
-- TÔNG MÔN (bang hội) — Fix347
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI (giữ nguyên dữ liệu, chỉ thay hàm).
--
--   * tm_guild  : tông môn (tên duy nhất không phân biệt hoa/thường, cấp 1-10, exp, thông báo).
--   * tm_member : thành viên. MỖI TÀI KHOẢN chỉ ở 1 tông môn (không tính theo nhân vật) → điểm danh không nhân đôi theo nhân vật.
--   * tm_user   : điểm danh theo ngày VN, hạn mức quyên góp theo ngày, thời gian chờ sau khi rời/bị đuổi.
--
--   Hằng số (đổi cả ở TMG_CF trong world/106-tong-mon.js nếu sửa):
--     exp lên cấp L → L+1 = 3000 × L² · cấp tối đa 10 · sĩ số tối đa = 20 + cấp
--     điểm danh: +60 exp tông, +10 cống hiến, 1 lần/ngày/tài khoản (giờ VN)
--     quyên góp: 10.000 vàng = 1 exp tông + 1 cống hiến · mỗi lượt 100.000 → 100.000.000 · tối đa 200.000.000/ngày/tài khoản
--     rời / bị đuổi: chờ 24 giờ mới vào tông khác · Trưởng Lão tối đa 3
--   Vàng, Linh Thạch trừ ở máy khách (giống Chiến Trường / Nghề Nghiệp); máy chủ giữ danh sách, chức vụ, exp, cấp, điểm danh và hạn mức.
-- =====================================================================
create table if not exists public.tm_guild(
  id      bigserial primary key,
  name    text not null,
  leader  uuid not null,
  lv      int  not null default 1,
  exp     bigint not null default 0,
  notice  text not null default '',
  created timestamptz not null default now()
);
create unique index if not exists tm_guild_name_u on public.tm_guild (lower(name));

create table if not exists public.tm_member(
  uid      uuid primary key,
  mid      bigserial,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  role     text not null default 'de' check (role in ('chu','lao','de')),
  name     text not null default '',
  contrib  bigint not null default 0,
  joined   timestamptz not null default now(),
  seen     timestamptz not null default now()
);
create unique index if not exists tm_member_mid_u on public.tm_member (mid);
create index if not exists tm_member_g on public.tm_member (guild_id);

create table if not exists public.tm_user(
  uid     uuid primary key,
  ck      date,
  dn_day  date,
  dn_amt  bigint not null default 0,
  cool    timestamptz
);

alter table public.tm_guild  enable row level security;
alter table public.tm_member enable row level security;
alter table public.tm_user   enable row level security;
revoke all on public.tm_guild, public.tm_member, public.tm_user from anon, authenticated;

-- ---------------------------------------------------------------------
-- Tiện ích nội bộ (KHÔNG cấp cho máy khách)
-- ---------------------------------------------------------------------
create or replace function public.tm_clean(t text) returns text
language sql immutable set search_path = public, pg_catalog as $$
  select btrim(regexp_replace(translate(coalesce(t, ''), '<>&"''`\/{}[]%', ''), '[[:cntrl:]]', '', 'g'))
$$;

create or replace function public.tm_addexp(p_gid bigint, p_amt bigint) returns void
language plpgsql security definer set search_path = public as $$
declare g public.tm_guild;
begin
  if p_amt is null or p_amt <= 0 then return; end if;
  select * into g from public.tm_guild where id = p_gid for update;
  if not found then return; end if;
  g.exp := g.exp + p_amt;
  while g.lv < 10 and g.exp >= 3000 * g.lv * g.lv loop
    g.exp := g.exp - 3000 * g.lv * g.lv;
    g.lv := g.lv + 1;
  end loop;
  update public.tm_guild set lv = g.lv, exp = g.exp where id = p_gid;
end $$;

-- ---------------------------------------------------------------------
-- Thông tin của tôi: có tông môn thì trả cả danh sách thành viên
-- ---------------------------------------------------------------------
create or replace function public.tm_me(p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_ck date; v_dd date; v_da bigint; v_cool timestamptz; v_cs int := 0;
  m public.tm_member; g public.tm_guild; v_cnt int; v_list json; v_nm text;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select ck, dn_day, dn_amt, cool into v_ck, v_dd, v_da, v_cool from public.tm_user where uid = v_u;
  if v_cool is not null and v_cool > now() then v_cs := ceil(extract(epoch from (v_cool - now())))::int; end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then
    return json_build_object('status', 'ok', 'guild', null, 'cool', v_cs);
  end if;
  v_nm := left(public.tm_clean(p_name), 24);
  update public.tm_member set seen = now(), name = case when length(v_nm) > 0 then v_nm else name end
   where uid = v_u returning * into m;
  select * into g from public.tm_guild where id = m.guild_id;
  select count(*) into v_cnt from public.tm_member where guild_id = g.id;
  select json_agg(json_build_object(
           'mid', x.mid, 'name', x.name, 'role', x.role, 'ct', x.contrib,
           'ago', ceil(extract(epoch from (now() - x.seen)) / 60)::int)
         order by (case x.role when 'chu' then 0 when 'lao' then 1 else 2 end), x.contrib desc, x.mid)
    into v_list from public.tm_member x where x.guild_id = g.id;
  return json_build_object('status', 'ok', 'cool', v_cs,
    'guild', json_build_object(
      'id', g.id, 'name', g.name, 'lv', g.lv, 'exp', g.exp, 'need', 3000 * g.lv * g.lv,
      'notice', g.notice, 'max', 20 + g.lv, 'cnt', v_cnt, 'role', m.role, 'me', m.mid, 'ct', m.contrib,
      'ck', (v_ck is not null and v_ck = v_today),
      'dleft', greatest(200000000 - (case when v_dd = v_today then coalesce(v_da, 0) else 0 end), 0)),
    'members', coalesce(v_list, '[]'::json));
end $$;

-- ---------------------------------------------------------------------
-- Danh sách / tìm tông môn (xếp theo cấp, exp). Lấy 16 dòng để máy khách biết còn trang sau.
-- ---------------------------------------------------------------------
create or replace function public.tm_list(p_q text, p_off int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_q text := lower(public.tm_clean(p_q)); v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select coalesce(json_agg(t), '[]'::json) into v from (
    select g.id, g.name, g.lv,
           (select count(*) from public.tm_member m where m.guild_id = g.id)::int as cnt,
           20 + g.lv as max, g.notice,
           (select m2.name from public.tm_member m2 where m2.uid = g.leader) as leader
      from public.tm_guild g
     where v_q = '' or position(v_q in lower(g.name)) > 0
     order by g.lv desc, g.exp desc, g.id
     limit 16 offset greatest(coalesce(p_off, 0), 0)) t;
  return json_build_object('status', 'ok', 'list', v);
end $$;

-- ---------------------------------------------------------------------
-- Kiểm tra trước khi lập (máy khách gọi TRƯỚC khi trừ vàng/Linh Thạch)
-- ---------------------------------------------------------------------
create or replace function public.tm_precheck(p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_n text := public.tm_clean(p_name); v_cool timestamptz;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if exists (select 1 from public.tm_member where uid = v_u) then return json_build_object('status', 'in'); end if;
  select cool into v_cool from public.tm_user where uid = v_u;
  if v_cool is not null and v_cool > now() then
    return json_build_object('status', 'cool', 'secs', ceil(extract(epoch from (v_cool - now())))::int);
  end if;
  if v_n <> btrim(coalesce(p_name, '')) or char_length(v_n) < 2 or char_length(v_n) > 12 then
    return json_build_object('status', 'bad');
  end if;
  if exists (select 1 from public.tm_guild where lower(name) = lower(v_n)) then return json_build_object('status', 'dup'); end if;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_create(p_name text, p_pname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_n text := public.tm_clean(p_name); v_cool timestamptz; g public.tm_guild;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if exists (select 1 from public.tm_member where uid = v_u) then return json_build_object('status', 'in'); end if;
  select cool into v_cool from public.tm_user where uid = v_u;
  if v_cool is not null and v_cool > now() then
    return json_build_object('status', 'cool', 'secs', ceil(extract(epoch from (v_cool - now())))::int);
  end if;
  if v_n <> btrim(coalesce(p_name, '')) or char_length(v_n) < 2 or char_length(v_n) > 12 then
    return json_build_object('status', 'bad');
  end if;
  begin
    insert into public.tm_guild(name, leader) values (v_n, v_u) returning * into g;
  exception when unique_violation then
    return json_build_object('status', 'dup');
  end;
  insert into public.tm_member(uid, guild_id, role, name)
  values (v_u, g.id, 'chu', left(public.tm_clean(p_pname), 24));
  return json_build_object('status', 'ok', 'id', g.id);
end $$;

create or replace function public.tm_join(p_gid bigint, p_pname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); g public.tm_guild; v_cool timestamptz; v_cnt int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if exists (select 1 from public.tm_member where uid = v_u) then return json_build_object('status', 'in'); end if;
  select cool into v_cool from public.tm_user where uid = v_u;
  if v_cool is not null and v_cool > now() then
    return json_build_object('status', 'cool', 'secs', ceil(extract(epoch from (v_cool - now())))::int);
  end if;
  select * into g from public.tm_guild where id = p_gid for update;
  if not found then return json_build_object('status', 'gone'); end if;
  select count(*) into v_cnt from public.tm_member where guild_id = g.id;
  if v_cnt >= 20 + g.lv then return json_build_object('status', 'full'); end if;
  insert into public.tm_member(uid, guild_id, role, name)
  values (v_u, g.id, 'de', left(public.tm_clean(p_pname), 24));
  return json_build_object('status', 'ok');
end $$;

-- ---------------------------------------------------------------------
-- Rời tông / giải tán / đuổi / đổi chức / thông báo
-- ---------------------------------------------------------------------
create or replace function public.tm_leave() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v_cnt int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role = 'chu' then
    select count(*) into v_cnt from public.tm_member where guild_id = m.guild_id;
    if v_cnt > 1 then return json_build_object('status', 'leader'); end if;
    delete from public.tm_guild where id = m.guild_id;
    return json_build_object('status', 'ok');
  end if;
  delete from public.tm_member where uid = v_u;
  insert into public.tm_user(uid, cool) values (v_u, now() + interval '24 hours')
  on conflict (uid) do update set cool = excluded.cool;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_disband() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role <> 'chu' then return json_build_object('status', 'perm'); end if;
  delete from public.tm_guild where id = m.guild_id;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_kick(p_mid bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); me public.tm_member; t public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into me from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if me.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  select * into t from public.tm_member where mid = p_mid and guild_id = me.guild_id;
  if not found then return json_build_object('status', 'gone'); end if;
  if t.uid = v_u then return json_build_object('status', 'self'); end if;
  if me.role = 'lao' and t.role <> 'de' then return json_build_object('status', 'perm'); end if;
  delete from public.tm_member where uid = t.uid;
  insert into public.tm_user(uid, cool) values (t.uid, now() + interval '24 hours')
  on conflict (uid) do update set cool = excluded.cool;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_role(p_mid bigint, p_role text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); me public.tm_member; t public.tm_member; v_lao int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_role is null or p_role not in ('chu', 'lao', 'de') then return json_build_object('status', 'bad'); end if;
  select * into me from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if me.role <> 'chu' then return json_build_object('status', 'perm'); end if;
  select * into t from public.tm_member where mid = p_mid and guild_id = me.guild_id for update;
  if not found then return json_build_object('status', 'gone'); end if;
  if t.uid = v_u then return json_build_object('status', 'self'); end if;
  if p_role = 'lao' then
    select count(*) into v_lao from public.tm_member where guild_id = me.guild_id and role = 'lao';
    if v_lao >= 3 and t.role <> 'lao' then return json_build_object('status', 'full'); end if;
  end if;
  if p_role = 'chu' then
    update public.tm_member set role = 'chu' where uid = t.uid;
    update public.tm_member set role = 'lao' where uid = v_u;
    update public.tm_guild set leader = t.uid where id = me.guild_id;
  else
    update public.tm_member set role = p_role where uid = t.uid;
  end if;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_notice(p_text text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); me public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into me from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if me.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  update public.tm_guild set notice = left(public.tm_clean(p_text), 80) where id = me.guild_id;
  return json_build_object('status', 'ok');
end $$;

-- ---------------------------------------------------------------------
-- Điểm danh (1 lần/ngày/tài khoản, giờ VN) và quyên góp vàng
-- ---------------------------------------------------------------------
create or replace function public.tm_checkin() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  m public.tm_member; v_ck date; v_lv int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  insert into public.tm_user(uid) values (v_u) on conflict (uid) do nothing;
  select ck into v_ck from public.tm_user where uid = v_u for update;
  if v_ck is not null and v_ck = v_today then return json_build_object('status', 'done'); end if;
  update public.tm_user set ck = v_today where uid = v_u;
  update public.tm_member set contrib = contrib + 10 where uid = v_u;
  perform public.tm_addexp(m.guild_id, 60);
  select lv into v_lv from public.tm_guild where id = m.guild_id;
  return json_build_object('status', 'ok', 'lv', v_lv);
end $$;

create or replace function public.tm_donate(p_gold bigint) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  m public.tm_member; v_dd date; v_da bigint; v_used bigint; v_pts bigint;
  c_cap constant bigint := 200000000;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_gold is null or p_gold < 100000 or p_gold > 100000000 then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  insert into public.tm_user(uid) values (v_u) on conflict (uid) do nothing;
  select dn_day, dn_amt into v_dd, v_da from public.tm_user where uid = v_u for update;
  v_used := case when v_dd = v_today then coalesce(v_da, 0) else 0 end;
  if v_used + p_gold > c_cap then
    return json_build_object('status', 'cap', 'left', greatest(c_cap - v_used, 0));
  end if;
  update public.tm_user set dn_day = v_today, dn_amt = v_used + p_gold where uid = v_u;
  v_pts := p_gold / 10000;
  update public.tm_member set contrib = contrib + v_pts where uid = v_u;
  perform public.tm_addexp(m.guild_id, v_pts);
  return json_build_object('status', 'ok', 'pts', v_pts, 'left', c_cap - (v_used + p_gold));
end $$;

-- ---------------------------------------------------------------------
-- Quyền: chỉ người đã đăng nhập gọi được; tm_clean / tm_addexp là nội bộ
-- ---------------------------------------------------------------------
revoke all on function public.tm_clean(text), public.tm_addexp(bigint, bigint) from public, anon, authenticated;
revoke all on function
  public.tm_me(text), public.tm_list(text, int), public.tm_precheck(text), public.tm_create(text, text),
  public.tm_join(bigint, text), public.tm_leave(), public.tm_disband(), public.tm_kick(bigint),
  public.tm_role(bigint, text), public.tm_notice(text), public.tm_checkin(), public.tm_donate(bigint)
from public, anon;
grant execute on function
  public.tm_me(text), public.tm_list(text, int), public.tm_precheck(text), public.tm_create(text, text),
  public.tm_join(bigint, text), public.tm_leave(), public.tm_disband(), public.tm_kick(bigint),
  public.tm_role(bigint, text), public.tm_notice(text), public.tm_checkin(), public.tm_donate(bigint)
to authenticated;
