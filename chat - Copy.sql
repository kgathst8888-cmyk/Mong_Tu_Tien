-- =====================================================================
-- CHAT THẾ GIỚI (Supabase)
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- An toàn khi chạy lại nhiều lần.
--   * Chỉ người đã đăng nhập ☁ mới đọc/gửi được.
--   * Bảng không cho đọc/ghi trực tiếp; mọi thao tác đi qua hàm bên dưới.
--   * Tối đa 120 ký tự/tin, cách nhau >= 2 giây, chỉ giữ ~300 tin gần nhất.
--   * Tin bị >= 5 người khác nhau báo cáo sẽ tự bị xóa.
--   * Cấm người chơi: insert into public.chat_bans(uid, until, note) values ('<uuid>', null, 'spam');
--     (until = null là cấm vĩnh viễn)
-- =====================================================================

create table if not exists public.chat_msgs(
  id   bigserial primary key,
  uid  uuid        not null,
  name text        not null default 'Đạo Hữu',
  body text        not null,
  ts   timestamptz not null default now()
);
create index if not exists chat_msgs_uid_ts on public.chat_msgs(uid, ts desc);

create table if not exists public.chat_reports(
  msg_id bigint      not null,
  uid    uuid        not null,
  ts     timestamptz not null default now(),
  primary key(msg_id, uid)
);

create table if not exists public.chat_bans(
  uid   uuid primary key,
  until timestamptz,
  note  text
);

alter table public.chat_msgs    enable row level security;
alter table public.chat_reports enable row level security;
alter table public.chat_bans    enable row level security;
revoke all on public.chat_msgs, public.chat_reports, public.chat_bans from anon, authenticated;

-- Gửi tin
create or replace function public.chat_send(p_name text, p_text text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_t text; v_n text; v_last timestamptz; v_id bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if exists(select 1 from public.chat_bans where uid = v_u and (until is null or until > now())) then
    return json_build_object('status','banned');
  end if;
  v_t := btrim(regexp_replace(coalesce(p_text,''), '[[:cntrl:]]+', ' ', 'g'));
  v_n := left(btrim(coalesce(nullif(p_name,''), 'Đạo Hữu')), 16);
  if char_length(v_t) < 1 then return json_build_object('status','empty'); end if;
  v_t := left(v_t, 120);
  select max(ts) into v_last from public.chat_msgs where uid = v_u;
  if v_last is not null and v_last > now() - interval '2 seconds' then
    return json_build_object('status','slow');
  end if;
  insert into public.chat_msgs(uid, name, body) values (v_u, v_n, v_t) returning id into v_id;
  if v_id % 20 = 0 then delete from public.chat_msgs where id < v_id - 300; end if;
  return json_build_object('status','ok','id',v_id);
end $$;

-- Đọc tin mới (p_after = id tin cuối cùng đã có; 0 = lấy tin gần nhất)
create or replace function public.chat_recent(p_after bigint default 0, p_limit int default 40) returns json
language plpgsql security definer stable set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select coalesce(json_agg(t order by t.id), '[]'::json) into v from (
    select id, name, body as msg, extract(epoch from ts)::bigint as ts, (uid = v_u) as me
      from public.chat_msgs
     where id > coalesce(p_after, 0)
     order by id desc
     limit least(greatest(coalesce(p_limit, 40), 1), 60)) t;
  return json_build_object('status','ok','msgs',v);
end $$;

-- Báo cáo tin nhắn
create or replace function public.chat_report(p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_n int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.chat_reports(msg_id, uid) values (p_id, v_u) on conflict do nothing;
  select count(*) into v_n from public.chat_reports where msg_id = p_id;
  if v_n >= 5 then delete from public.chat_msgs where id = p_id; end if;
  return json_build_object('status','ok');
end $$;

revoke all on function public.chat_send(text,text), public.chat_recent(bigint,int), public.chat_report(bigint) from public, anon;
grant execute on function public.chat_send(text,text), public.chat_recent(bigint,int), public.chat_report(bigint) to authenticated;
