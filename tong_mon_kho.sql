-- =====================================================================
-- KHO TÔNG MÔN (Fix382) — chạy SAU tong_mon_xahoi.sql (dùng tm_logw)
-- AN TOÀN KHI CHẠY LẠI. Kho chung CHỈ chứa 2 loại có thể cộng dồn: nt = Mảnh Nguyệt Thạch, sh = Mảnh Thánh (không chứa trang bị
-- để máy khách không thể bơm vật phẩm giả lên máy chủ). Không vàng / Linh Thạch.
--   • Quyên (tm_depot_donate): 1–500 mỗi lần. Máy khách TRỪ mảnh của mình trước. KHÔNG cộng cống hiến (tránh Tông Chủ tự quyên rồi tự nhận để đúc cống hiến).
--   • Phát (tm_depot_give): Tông Chủ (≤500/lần) hoặc Trưởng Lão (≤5/lần, không phát cho chính mình) → tạo "quà" gửi cho 1 thành viên.
--   • Nhận quà (tm_gift_claim): người nhận tự nhận, máy chủ đánh dấu 1 lần rồi máy khách mới cộng mảnh. Quà giữ nguyên dù người nhận đã rời tông.
--   Mọi thao tác đều ghi nhật ký tông.
-- =====================================================================
create table if not exists public.tm_depot(
  guild_id bigint primary key references public.tm_guild(id) on delete cascade,
  nt bigint not null default 0,
  sh bigint not null default 0
);
create table if not exists public.tm_gift(
  id      bigserial primary key,
  uid     uuid not null,
  kind    text not null check (kind in ('nt', 'sh')),
  qty     int  not null check (qty > 0),
  frm     text not null default '',
  ts      timestamptz not null default now(),
  claimed boolean not null default false
);
create index if not exists tm_gift_uid on public.tm_gift (uid) where not claimed;
alter table public.tm_depot enable row level security;
alter table public.tm_gift  enable row level security;
revoke all on public.tm_depot, public.tm_gift from anon, authenticated;

create or replace function public.tm_depot_info() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; d public.tm_depot; v json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select * into d from public.tm_depot where guild_id = m.guild_id;
  select coalesce(json_agg(json_build_object('id', x.id, 'kind', x.kind, 'qty', x.qty, 'frm', x.frm) order by x.id), '[]'::json)
    into v from public.tm_gift x where x.uid = v_u and not x.claimed;
  return json_build_object('status', 'ok', 'nt', coalesce(d.nt, 0), 'sh', coalesce(d.sh, 0), 'role', m.role, 'gifts', v);
end $$;

create or replace function public.tm_depot_donate(p_kind text, p_qty int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind is null or p_kind not in ('nt', 'sh') or p_qty is null or p_qty < 1 or p_qty > 500 then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  insert into public.tm_depot(guild_id) values (m.guild_id) on conflict (guild_id) do nothing;
  if p_kind = 'nt' then update public.tm_depot set nt = nt + p_qty where guild_id = m.guild_id;
  else update public.tm_depot set sh = sh + p_qty where guild_id = m.guild_id; end if;
  perform public.tm_logw(m.guild_id, 'kho', m.name || ' quyên ' || p_qty || (case p_kind when 'nt' then ' Mảnh Nguyệt Thạch' else ' Mảnh Thánh' end) || ' vào kho');
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_depot_give(p_mid bigint, p_kind text, p_qty int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; t public.tm_member; d public.tm_depot; v_max int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind is null or p_kind not in ('nt', 'sh') or p_qty is null or p_qty < 1 then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  v_max := case when m.role = 'chu' then 500 else 5 end;
  if p_qty > v_max then return json_build_object('status', 'max', 'max', v_max); end if;
  select * into t from public.tm_member where mid = p_mid and guild_id = m.guild_id;
  if not found then return json_build_object('status', 'gone'); end if;
  if m.role = 'lao' and t.uid = v_u then return json_build_object('status', 'self'); end if;
  select * into d from public.tm_depot where guild_id = m.guild_id for update;
  if not found or (case p_kind when 'nt' then d.nt else d.sh end) < p_qty then return json_build_object('status', 'poor'); end if;
  if p_kind = 'nt' then update public.tm_depot set nt = nt - p_qty where guild_id = m.guild_id;
  else update public.tm_depot set sh = sh - p_qty where guild_id = m.guild_id; end if;
  insert into public.tm_gift(uid, kind, qty, frm) values (t.uid, p_kind, p_qty, m.name);
  perform public.tm_logw(m.guild_id, 'kho', m.name || ' phát ' || p_qty || (case p_kind when 'nt' then ' Mảnh Nguyệt Thạch' else ' Mảnh Thánh' end) || ' cho ' || t.name);
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_gift_claim(p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); x public.tm_gift;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into x from public.tm_gift where id = p_id and uid = v_u and not claimed for update;
  if not found then return json_build_object('status', 'gone'); end if;
  update public.tm_gift set claimed = true where id = p_id;
  return json_build_object('status', 'ok', 'kind', x.kind, 'qty', x.qty);
end $$;

revoke all on function public.tm_depot_info(), public.tm_depot_donate(text, int), public.tm_depot_give(bigint, text, int), public.tm_gift_claim(bigint) from public, anon;
grant execute on function public.tm_depot_info(), public.tm_depot_donate(text, int), public.tm_depot_give(bigint, text, int), public.tm_gift_claim(bigint) to authenticated;
