-- =====================================================================
-- CỬA HÀNG CỐNG HIẾN TÔNG MÔN — Fix349 — chạy SAU tong_mon.sql (không cần tong_mon_boss.sql; chạy lại cùng tm_wk() cũng được)
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI (giữ nguyên dữ liệu, chỉ thay hàm).
--
--   * tm_member.spent : cống hiến đã tiêu. SỐ DƯ KHẢ DỤNG = contrib - spent. (Rời / bị đuổi khỏi tông thì mất số dư, như đã mất chỗ đứng trong tông.)
--   * tm_shop         : số lần mua từng món theo TUẦN (thứ Hai 00:00 giờ VN) của mỗi tài khoản → giới hạn mua mỗi tuần.
--   * Bảng giá nằm trong tm_shop_cat() bên dưới; máy khách (world/108) chỉ HIỂN THỊ lại — phát vật phẩm khi máy chủ trả status = ok.
--
--   Món (giá cống hiến · giới hạn/tuần · cấp tông tối thiểu):
--     nt3 = 3 Mảnh Nguyệt Thạch      2.000 · 5 · Lv1
--     ch3 = Rương Bí Bảo (ngẫu nhiên: Sử Thi / Thần Thoại / Nguyệt Thạch / 6% Mảnh Thánh)  3.000 · 3 · Lv1
--     sh1 = 1 Mảnh Thánh             8.000 · 2 · Lv3
--     ch4 = Rương Bí Bảo Cao Cấp (ngẫu nhiên, 25% có Mảnh Thánh)  12.000 · 1 · Lv5
--     (tỉ lệ rương nằm ở máy khách world/108; máy chủ chỉ giữ giá / giới hạn tuần / cấp tông)
--   (Cống hiến: 10.000 vàng quyên = 1; điểm danh +10. Không bán vàng / Linh Thạch để tránh vòng lặp vàng↔cống hiến và ảnh hưởng nạp thẻ.)
-- =====================================================================
alter table public.tm_member add column if not exists spent bigint not null default 0;

create table if not exists public.tm_shop(
  uid  uuid not null,
  wk   date not null,
  item text not null,
  n    int  not null default 0,
  primary key (uid, wk, item)
);
alter table public.tm_shop enable row level security;
revoke all on public.tm_shop from anon, authenticated;

-- Thứ Hai đầu tuần hiện tại (giờ VN) — cùng định nghĩa với tong_mon_boss.sql
create or replace function public.tm_wk() returns date
language sql stable set search_path = public, pg_catalog as $$
  select date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh')::date
$$;
revoke all on function public.tm_wk() from public, anon, authenticated;

-- Bảng giá (cost, giới hạn/tuần, cấp tông tối thiểu). Không có dòng = món không tồn tại.
create or replace function public.tm_shop_cat(p_item text) returns table(cost bigint, lim int, minlv int)
language sql immutable set search_path = public, pg_catalog as $$
  select c.cost, c.lim, c.minlv from (values
    ('nt3'::text,  2000::bigint, 5, 1),
    ('ch3'::text,  3000::bigint, 3, 1),
    ('sh1'::text,  8000::bigint, 2, 3),
    ('ch4'::text, 12000::bigint, 1, 5)
  ) as c(id, cost, lim, minlv) where c.id = p_item
$$;

-- tm_me: thêm 'bal' (số dư cống hiến khả dụng)
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
      'bal', m.contrib - m.spent,
      'ck', (v_ck is not null and v_ck = v_today),
      'dleft', greatest(200000000 - (case when v_dd = v_today then coalesce(v_da, 0) else 0 end), 0)),
    'members', coalesce(v_list, '[]'::json));
end $$;

-- Số dư + số lần đã mua tuần này
create or replace function public.tm_shop_info() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); m public.tm_member; v_lv int; v_buys json;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select lv into v_lv from public.tm_guild where id = m.guild_id;
  select coalesce(json_object_agg(item, n), '{}'::json) into v_buys from public.tm_shop where uid = v_u and wk = public.tm_wk();
  return json_build_object('status', 'ok', 'bal', m.contrib - m.spent, 'glv', v_lv, 'buys', v_buys);
end $$;

-- Mua 1 món: kiểm tra cấp tông, giới hạn tuần, số dư; trừ cống hiến. Máy khách chỉ phát vật phẩm khi status = ok.
create or replace function public.tm_shop_buy(p_item text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_wk date := public.tm_wk(); m public.tm_member; v_lv int;
  v_cost bigint; v_lim int; v_minlv int; v_n int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select cost, lim, minlv into v_cost, v_lim, v_minlv from public.tm_shop_cat(p_item);
  if v_cost is null then return json_build_object('status', 'bad'); end if;
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
revoke all on function public.tm_me(text), public.tm_shop_info(), public.tm_shop_buy(text) from public, anon;
grant execute on function public.tm_me(text), public.tm_shop_info(), public.tm_shop_buy(text) to authenticated;
