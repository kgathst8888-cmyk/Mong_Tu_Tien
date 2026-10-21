-- =====================================================================
-- TÔNG MÔN — XÃ HỘI (Fix380) — chạy SAU tong_mon.sql, tong_mon_boss.sql, tong_mon_shop.sql
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI.
--
--   1) Chế độ vào tông: 'open' (ai cũng vào) · 'apply' (xin vào, Tông Chủ/Trưởng Lão duyệt, đơn hết hạn sau 3 ngày) · 'closed' (đóng cửa).
--      Mỗi tài khoản chỉ có 1 đơn chờ. Chỉ Tông Chủ đổi chế độ.
--   2) Chat tông (tm_msg, giữ 200 tin gần nhất, 2 giây/tin, tối đa 120 ký tự) + Nhật ký tông (tm_log, giữ 100 dòng):
--      vào / rời / bị đuổi / phong chức / lên cấp tông / lập tông / hạ boss.
--   3) tm_tags(ids): tên tông của người chơi khác theo mã băm 10 ký tự (cùng mã vp_ping của làng online trả về) → hiện [Tông] cạnh tên.
--      chat_recent (chat thế giới) thêm cột tag.
--   4) Boss Tông Môn cộng cống hiến: +30 mỗi lượt đánh; nhận thưởng tuần +500 / +300 / +150 / +80 theo hạng (nếu còn ở tông đó).
--   Kỹ thuật: các hàm cũ chỉ cần thêm nhật ký/cống hiến được BỌC LẠI (bản cũ đổi tên thành <tên>0, KHÔNG cấp cho máy khách);
--   các hàm đổi hành vi (tm_join, tm_list, tm_me) được viết lại. Chạy lại file nhiều lần vẫn an toàn.
-- =====================================================================
alter table public.tm_guild add column if not exists join_mode text not null default 'open';
do $$ begin
  alter table public.tm_guild add constraint tm_guild_mode_ck check (join_mode in ('open', 'apply', 'closed'));
exception when duplicate_object then null; end $$;

create table if not exists public.tm_apply(
  uid      uuid primary key,
  aid      bigserial,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  name     text not null default '',
  ts       timestamptz not null default now()
);
create unique index if not exists tm_apply_aid_u on public.tm_apply (aid);
create index if not exists tm_apply_g on public.tm_apply (guild_id);

create table if not exists public.tm_log(
  id       bigserial primary key,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  ts       timestamptz not null default now(),
  kind     text not null default '',
  txt      text not null default ''
);
create index if not exists tm_log_g on public.tm_log (guild_id, id desc);

create table if not exists public.tm_msg(
  id       bigserial primary key,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  uid      uuid not null,
  name     text not null default '',
  body     text not null,
  ts       timestamptz not null default now()
);
create index if not exists tm_msg_g on public.tm_msg (guild_id, id desc);
create index if not exists tm_member_hid on public.tm_member ((substr(md5(uid::text), 1, 10)));

alter table public.tm_apply enable row level security;
alter table public.tm_log   enable row level security;
alter table public.tm_msg   enable row level security;
revoke all on public.tm_apply, public.tm_log, public.tm_msg from anon, authenticated;

-- Ghi nhật ký (nội bộ), giữ 100 dòng mới nhất mỗi tông
create or replace function public.tm_logw(p_gid bigint, p_kind text, p_txt text) returns void
language plpgsql security definer set search_path = public as $$
declare v_cut bigint;
begin
  insert into public.tm_log(guild_id, kind, txt) values (p_gid, coalesce(p_kind, ''), left(coalesce(p_txt, ''), 160));
  select id into v_cut from public.tm_log where guild_id = p_gid order by id desc offset 100 limit 1;
  if v_cut is not null then delete from public.tm_log where guild_id = p_gid and id <= v_cut; end if;
end $$;

-- ---------------------------------------------------------------------
-- BỌC các hàm cũ (đổi tên bản cũ → <tên>0 một lần, rồi tạo hàm mới gọi bản cũ)
-- ---------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'tm_addexp0') then
    alter function public.tm_addexp(bigint, bigint) rename to tm_addexp0;
    alter function public.tm_create(text, text) rename to tm_create0;
    alter function public.tm_leave() rename to tm_leave0;
    alter function public.tm_kick(bigint) rename to tm_kick0;
    alter function public.tm_role(bigint, text) rename to tm_role0;
    alter function public.tm_me(text) rename to tm_me0;
    alter function public.tm_boss_end(bigint) rename to tm_boss_end0;
    alter function public.tm_boss_claim(date) rename to tm_boss_claim0;
  end if;
end $$;

create or replace function public.tm_addexp(p_gid bigint, p_amt bigint) returns void
language plpgsql security definer set search_path = public as $$
declare v_old int; v_new int;
begin
  select lv into v_old from public.tm_guild where id = p_gid;
  perform public.tm_addexp0(p_gid, p_amt);
  select lv into v_new from public.tm_guild where id = p_gid;
  if v_old is not null and v_new > v_old then perform public.tm_logw(p_gid, 'lv', 'Tông môn lên cấp ' || v_new || ' 🎉'); end if;
end $$;

create or replace function public.tm_create(p_name text, p_pname text) returns json
language plpgsql security definer set search_path = public as $$
declare v json;
begin
  v := public.tm_create0(p_name, p_pname);
  if v->>'status' = 'ok' then
    perform public.tm_logw((v->>'id')::bigint, 'new', left(public.tm_clean(p_pname), 24) || ' lập tông môn');
  end if;
  return v;
end $$;

create or replace function public.tm_leave() returns json
language plpgsql security definer set search_path = public as $$
declare m public.tm_member; v json;
begin
  select * into m from public.tm_member where uid = auth.uid();
  v := public.tm_leave0();
  if m.uid is not null and v->>'status' = 'ok' and exists (select 1 from public.tm_guild where id = m.guild_id) then
    perform public.tm_logw(m.guild_id, 'leave', m.name || ' rời tông môn');
  end if;
  return v;
end $$;

create or replace function public.tm_kick(p_mid bigint) returns json
language plpgsql security definer set search_path = public as $$
declare t public.tm_member; v json;
begin
  select * into t from public.tm_member where mid = p_mid;
  v := public.tm_kick0(p_mid);
  if t.uid is not null and v->>'status' = 'ok' then
    perform public.tm_logw(t.guild_id, 'kick', t.name || ' bị đuổi khỏi tông môn');
  end if;
  return v;
end $$;

create or replace function public.tm_role(p_mid bigint, p_role text) returns json
language plpgsql security definer set search_path = public as $$
declare t public.tm_member; v json;
begin
  select * into t from public.tm_member where mid = p_mid;
  v := public.tm_role0(p_mid, p_role);
  if t.uid is not null and v->>'status' = 'ok' then
    perform public.tm_logw(t.guild_id, 'role', t.name || case p_role
      when 'chu' then ' được nhường ngôi Tông Chủ 👑' when 'lao' then ' được phong Trưởng Lão 🎖' else ' bị hạ xuống Đệ Tử' end);
  end if;
  return v;
end $$;

-- Boss Tông Môn: +30 cống hiến mỗi lượt đánh, nhật ký khi hạ boss
create or replace function public.tm_boss_end(p_dmg bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v json; m public.tm_member;
begin
  v := public.tm_boss_end0(p_dmg);
  if v->>'status' = 'ok' then
    update public.tm_member set contrib = contrib + 30 where uid = auth.uid() returning * into m;
    if m.uid is not null and (v->>'kill_now')::boolean then
      perform public.tm_logw(m.guild_id, 'boss', '🐉 Boss tuần đã bị hạ! ' || m.name || ' giáng đòn kết liễu');
    end if;
  end if;
  return v;
end $$;

-- Nhận thưởng boss: + cống hiến theo hạng (chỉ nếu còn ở đúng tông đó)
create or replace function public.tm_boss_claim(p_wk date) returns json
language plpgsql security definer set search_path = public as $$
declare v json; v_ct int; v_rank int; v_gid bigint;
begin
  v := public.tm_boss_claim0(p_wk);
  if v->>'status' = 'ok' then
    v_rank := (v->>'rank')::int;
    v_ct := case when v_rank = 1 then 500 when v_rank <= 3 then 300 when v_rank <= 10 then 150 else 80 end;
    select guild_id into v_gid from public.tm_bossmem where uid = auth.uid() and wk = p_wk and claimed order by upd desc limit 1;
    update public.tm_member set contrib = contrib + v_ct where uid = auth.uid() and guild_id = v_gid;
    return (v::jsonb || jsonb_build_object('ct', v_ct))::json;
  end if;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- Vào tông theo chế độ (viết lại) · duyệt đơn · đổi chế độ
-- ---------------------------------------------------------------------
create or replace function public.tm_join(p_gid bigint, p_pname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); g public.tm_guild; v_cool timestamptz; v_cnt int; v_n text;
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
  if g.join_mode = 'closed' then return json_build_object('status', 'closed'); end if;
  v_n := left(public.tm_clean(p_pname), 24);
  if g.join_mode = 'apply' then
    delete from public.tm_apply where uid = v_u;
    insert into public.tm_apply(uid, guild_id, name) values (v_u, g.id, v_n);
    return json_build_object('status', 'applied', 'guild', g.name);
  end if;
  insert into public.tm_member(uid, guild_id, role, name) values (v_u, g.id, 'de', v_n);
  delete from public.tm_apply where uid = v_u;
  perform public.tm_logw(g.id, 'join', v_n || ' gia nhập tông môn');
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_apps() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  delete from public.tm_apply where guild_id = m.guild_id and ts < now() - interval '3 days';
  select coalesce(json_agg(json_build_object('aid', a.aid, 'name', a.name,
           'ago', ceil(extract(epoch from (now() - a.ts)) / 3600)::int) order by a.aid), '[]'::json)
    into v from public.tm_apply a where a.guild_id = m.guild_id;
  return json_build_object('status', 'ok', 'list', v);
end $$;

create or replace function public.tm_app_do(p_aid bigint, p_ok boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; a public.tm_apply; g public.tm_guild; v_cnt int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  select * into a from public.tm_apply where aid = p_aid and guild_id = m.guild_id for update;
  if not found then return json_build_object('status', 'gone'); end if;
  if not coalesce(p_ok, false) then
    delete from public.tm_apply where uid = a.uid;
    return json_build_object('status', 'ok', 'res', 'no');
  end if;
  select * into g from public.tm_guild where id = m.guild_id for update;
  select count(*) into v_cnt from public.tm_member where guild_id = g.id;
  if v_cnt >= 20 + g.lv then return json_build_object('status', 'full'); end if;
  if exists (select 1 from public.tm_member where uid = a.uid) then
    delete from public.tm_apply where uid = a.uid;
    return json_build_object('status', 'gone');
  end if;
  insert into public.tm_member(uid, guild_id, role, name) values (a.uid, g.id, 'de', a.name);
  delete from public.tm_apply where uid = a.uid;
  perform public.tm_logw(g.id, 'join', a.name || ' được duyệt vào tông môn');
  return json_build_object('status', 'ok', 'res', 'yes');
end $$;

create or replace function public.tm_apply_cancel() returns json
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('status', 'auth'); end if;
  delete from public.tm_apply where uid = auth.uid();
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_mode(p_mode text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_mode is null or p_mode not in ('open', 'apply', 'closed') then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role <> 'chu' then return json_build_object('status', 'perm'); end if;
  update public.tm_guild set join_mode = p_mode where id = m.guild_id;
  return json_build_object('status', 'ok');
end $$;

-- tm_me: thêm mode, số đơn chờ (Tông Chủ / Trưởng Lão), tông đang xin vào (người chưa có tông)
create or replace function public.tm_me(p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare v json; v_u uuid := auth.uid(); m public.tm_member; g public.tm_guild; v_apps int := 0; v_ap text;
begin
  v := public.tm_me0(p_name);
  if v->>'status' <> 'ok' then return v; end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then
    select g2.name into v_ap from public.tm_apply a join public.tm_guild g2 on g2.id = a.guild_id where a.uid = v_u;
    return (v::jsonb || jsonb_build_object('applied', v_ap))::json;
  end if;
  select * into g from public.tm_guild where id = m.guild_id;
  if m.role in ('chu', 'lao') then
    select count(*) into v_apps from public.tm_apply where guild_id = m.guild_id and ts > now() - interval '3 days';
  end if;
  return jsonb_set(jsonb_set(v::jsonb, '{guild,mode}', to_jsonb(g.join_mode)), '{guild,apps}', to_jsonb(v_apps))::json;
end $$;

-- tm_list: thêm mode cho từng tông
create or replace function public.tm_list(p_q text, p_off int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_q text := lower(public.tm_clean(p_q)); v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select coalesce(json_agg(t), '[]'::json) into v from (
    select g.id, g.name, g.lv, g.join_mode as mode,
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
-- Chat tông + nhật ký
-- ---------------------------------------------------------------------
create or replace function public.tm_chat_send(p_text text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v_t text; v_last timestamptz; v_cut bigint;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  v_t := left(btrim(regexp_replace(translate(coalesce(p_text, ''), '<>`', ''), '[[:cntrl:]]', '', 'g')), 120);
  if char_length(v_t) < 1 then return json_build_object('status', 'empty'); end if;
  select max(ts) into v_last from public.tm_msg where uid = v_u;
  if v_last is not null and v_last > now() - interval '2 seconds' then return json_build_object('status', 'slow'); end if;
  insert into public.tm_msg(guild_id, uid, name, body) values (m.guild_id, v_u, m.name, v_t);
  select id into v_cut from public.tm_msg where guild_id = m.guild_id order by id desc offset 200 limit 1;
  if v_cut is not null then delete from public.tm_msg where guild_id = m.guild_id and id <= v_cut; end if;
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_chat_recent(p_after bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select coalesce(json_agg(t order by t.id), '[]'::json) into v from (
    select x.id, x.name, x.body as msg, extract(epoch from x.ts)::bigint as ts, (x.uid = v_u) as me
      from public.tm_msg x where x.guild_id = m.guild_id and x.id > coalesce(p_after, 0)
     order by x.id desc limit 40) t;
  return json_build_object('status', 'ok', 'msgs', v);
end $$;

create or replace function public.tm_log_recent() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select coalesce(json_agg(t order by t.id desc), '[]'::json) into v from (
    select x.id, x.kind, x.txt, extract(epoch from x.ts)::bigint as ts
      from public.tm_log x where x.guild_id = m.guild_id order by x.id desc limit 40) t;
  return json_build_object('status', 'ok', 'log', v);
end $$;

-- ---------------------------------------------------------------------
-- Tên tông của người chơi khác (mã băm 10 ký tự trùng mã vp_ping) + chat thế giới trả thêm tag
-- ---------------------------------------------------------------------
create or replace function public.tm_tags(p_ids text[]) returns json
language plpgsql stable security definer set search_path = public as $$
declare v json;
begin
  if auth.uid() is null then return json_build_object('status', 'auth'); end if;
  select coalesce(json_object_agg(substr(md5(m.uid::text), 1, 10), g.name), '{}'::json) into v
    from public.tm_member m join public.tm_guild g on g.id = m.guild_id
   where substr(md5(m.uid::text), 1, 10) = any (p_ids[1:40]);
  return json_build_object('status', 'ok', 'tags', v);
end $$;

create or replace function public.chat_recent(p_after bigint default 0, p_limit integer default 40) returns json
language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_u uuid := auth.uid();
  v json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select coalesce(json_agg(t order by t.id), '[]'::json) into v from (
    select c.id, c.name, c.body as msg, extract(epoch from c.ts)::bigint as ts, (c.uid = v_u) as me,
           (select g.name from public.tm_member mm join public.tm_guild g on g.id = mm.guild_id where mm.uid = c.uid) as tag
      from public.chat_msgs c
     where c.id > coalesce(p_after, 0)
     order by c.id desc
     limit least(greatest(coalesce(p_limit, 40), 1), 60)) t;
  return json_build_object('status','ok','msgs',v);
end $$;

-- ---------------------------------------------------------------------
-- Quyền
-- ---------------------------------------------------------------------
revoke all on function public.tm_logw(bigint, text, text), public.tm_addexp0(bigint, bigint), public.tm_addexp(bigint, bigint),
  public.tm_create0(text, text), public.tm_leave0(), public.tm_kick0(bigint), public.tm_role0(bigint, text),
  public.tm_me0(text), public.tm_boss_end0(bigint), public.tm_boss_claim0(date) from public, anon, authenticated;
revoke all on function public.tm_create(text, text), public.tm_leave(), public.tm_kick(bigint), public.tm_role(bigint, text),
  public.tm_me(text), public.tm_boss_end(bigint), public.tm_boss_claim(date), public.tm_join(bigint, text), public.tm_apps(),
  public.tm_app_do(bigint, boolean), public.tm_apply_cancel(), public.tm_mode(text), public.tm_list(text, int),
  public.tm_chat_send(text), public.tm_chat_recent(bigint), public.tm_log_recent(), public.tm_tags(text[]) from public, anon;
grant execute on function public.tm_create(text, text), public.tm_leave(), public.tm_kick(bigint), public.tm_role(bigint, text),
  public.tm_me(text), public.tm_boss_end(bigint), public.tm_boss_claim(date), public.tm_join(bigint, text), public.tm_apps(),
  public.tm_app_do(bigint, boolean), public.tm_apply_cancel(), public.tm_mode(text), public.tm_list(text, int),
  public.tm_chat_send(text), public.tm_chat_recent(bigint), public.tm_log_recent(), public.tm_tags(text[]) to authenticated;
