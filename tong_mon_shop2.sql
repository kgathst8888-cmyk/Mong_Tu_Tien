-- =====================================================================
-- CỬA HÀNG CỐNG HIẾN — DANH HIỆU TÔNG MÔN (Fix381) — chạy SAU tong_mon_shop.sql
-- AN TOÀN KHI CHẠY LẠI. Thêm 3 danh hiệu mua MỘT LẦN / TÀI KHOẢN (giới hạn trọn đời, không làm mới theo tuần):
--   ttl1 Đệ Tử Tông Môn 5.000 (Lv1) · ttl2 Hộ Pháp Tông Môn 25.000 (tông Lv4) · ttl3 Tông Sư Chi Danh 80.000 (tông Lv8)
-- Giới hạn trọn đời lưu trong tm_shop với wk = 2000-01-01. Máy khách tự cấp danh hiệu cho MỌI nhân vật của tài khoản khi thấy đã mua.
-- =====================================================================
drop function if exists public.tm_shop_cat(text);
create function public.tm_shop_cat(p_item text) returns table(cost bigint, lim int, minlv int, life boolean)
language sql immutable set search_path = public, pg_catalog as $$
  select c.cost, c.lim, c.minlv, c.life from (values
    ('nt3'::text,   2000::bigint, 5, 1, false),
    ('ch3'::text,   3000::bigint, 3, 1, false),
    ('sh1'::text,   8000::bigint, 2, 3, false),
    ('ch4'::text,  12000::bigint, 1, 5, false),
    ('ttl1'::text,  5000::bigint, 1, 1, true),
    ('ttl2'::text, 25000::bigint, 1, 4, true),
    ('ttl3'::text, 80000::bigint, 1, 8, true)
  ) as c(id, cost, lim, minlv, life) where c.id = p_item
$$;

create or replace function public.tm_shop_info() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v_lv int; v_buys json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select lv into v_lv from public.tm_guild where id = m.guild_id;
  select coalesce(json_object_agg(item, n), '{}'::json) into v_buys
    from public.tm_shop where uid = v_u and wk in (public.tm_wk(), date '2000-01-01');
  return json_build_object('status', 'ok', 'bal', m.contrib - m.spent, 'glv', v_lv, 'buys', v_buys);
end $$;

create or replace function public.tm_shop_buy(p_item text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_wk date; m public.tm_member; v_lv int;
  v_cost bigint; v_lim int; v_minlv int; v_life boolean; v_n int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select cost, lim, minlv, life into v_cost, v_lim, v_minlv, v_life from public.tm_shop_cat(p_item);
  if v_cost is null then return json_build_object('status', 'bad'); end if;
  v_wk := case when v_life then date '2000-01-01' else public.tm_wk() end;
  select * into m from public.tm_member where uid = v_u for update;
  if not found then return json_build_object('status', 'none'); end if;
  select lv into v_lv from public.tm_guild where id = m.guild_id;
  if v_lv < v_minlv then return json_build_object('status', 'lv', 'need', v_minlv); end if;
  insert into public.tm_shop(uid, wk, item) values (v_u, v_wk, p_item) on conflict (uid, wk, item) do nothing;
  select n into v_n from public.tm_shop where uid = v_u and wk = v_wk and item = p_item for update;
  if v_n >= v_lim then return json_build_object('status', 'limit'); end if;
  if m.contrib - m.spent < v_cost then return json_build_object('status', 'poor', 'bal', m.contrib - m.spent); end if;
  update public.tm_member set spent = spent + v_cost where uid = v_u;
  update public.tm_shop set n = n + 1 where uid = v_u and wk = v_wk and item = p_item;
  return json_build_object('status', 'ok', 'bal', m.contrib - m.spent - v_cost, 'left', v_lim - v_n - 1);
end $$;

revoke all on function public.tm_shop_cat(text) from public, anon, authenticated;
revoke all on function public.tm_shop_info(), public.tm_shop_buy(text) from public, anon;
grant execute on function public.tm_shop_info(), public.tm_shop_buy(text) to authenticated;
