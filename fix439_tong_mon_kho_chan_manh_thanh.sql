-- =====================================================================
-- FIX439 — KHO TÔNG MÔN: CHẶN 💠 Mảnh Thánh (kind = 'sh') — chống chuyển nguyên liệu đồ Thánh từ nick clone về nick chính.
-- Chạy SAU tong_mon_kho.sql. AN TOÀN KHI CHẠY LẠI.
--   • tm_depot_donate: chỉ nhận 'nt' (Mảnh Nguyệt Thạch); 'sh' → status 'blocked'.
--   • tm_depot_give: chỉ phát 'nt'; 'sh' → 'blocked' (không cho rút Mảnh Thánh khỏi kho).
--   • tm_gift_claim giữ nguyên: quà Mảnh Thánh ĐÃ phát từ trước vẫn nhận được (không làm mất đồ của người chơi).
--   • Số Mảnh Thánh đang nằm trong kho (cột sh) giữ nguyên, chỉ không rút/nạp thêm được.
-- =====================================================================
create or replace function public.tm_depot_donate(p_kind text, p_qty int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind = 'sh' then return json_build_object('status', 'blocked'); end if;
  if p_kind is null or p_kind <> 'nt' or p_qty is null or p_qty < 1 or p_qty > 500 then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  insert into public.tm_depot(guild_id) values (m.guild_id) on conflict (guild_id) do nothing;
  update public.tm_depot set nt = nt + p_qty where guild_id = m.guild_id;
  perform public.tm_logw(m.guild_id, 'kho', m.name || ' quyên ' || p_qty || ' Mảnh Nguyệt Thạch vào kho');
  return json_build_object('status', 'ok');
end $$;

create or replace function public.tm_depot_give(p_mid bigint, p_kind text, p_qty int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; t public.tm_member; d public.tm_depot; v_max int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_kind = 'sh' then return json_build_object('status', 'blocked'); end if;
  if p_kind is null or p_kind <> 'nt' or p_qty is null or p_qty < 1 then return json_build_object('status', 'bad'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  if m.role not in ('chu', 'lao') then return json_build_object('status', 'perm'); end if;
  v_max := case when m.role = 'chu' then 500 else 5 end;
  if p_qty > v_max then return json_build_object('status', 'max', 'max', v_max); end if;
  select * into t from public.tm_member where mid = p_mid and guild_id = m.guild_id;
  if not found then return json_build_object('status', 'gone'); end if;
  if m.role = 'lao' and t.uid = v_u then return json_build_object('status', 'self'); end if;
  select * into d from public.tm_depot where guild_id = m.guild_id for update;
  if not found or d.nt < p_qty then return json_build_object('status', 'poor'); end if;
  update public.tm_depot set nt = nt - p_qty where guild_id = m.guild_id;
  insert into public.tm_gift(uid, kind, qty, frm) values (t.uid, 'nt', p_qty, m.name);
  perform public.tm_logw(m.guild_id, 'kho', m.name || ' phát ' || p_qty || ' Mảnh Nguyệt Thạch cho ' || t.name);
  return json_build_object('status', 'ok');
end $$;

revoke all on function public.tm_depot_donate(text, int), public.tm_depot_give(bigint, text, int) from public, anon;
grant execute on function public.tm_depot_donate(text, int), public.tm_depot_give(bigint, text, int) to authenticated;
