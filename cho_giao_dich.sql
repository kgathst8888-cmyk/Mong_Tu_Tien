-- =====================================================================
-- CHỢ GIAO DỊCH ONLINE + VÍ LINH THẠCH (Supabase)
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- An toàn khi chạy lại nhiều lần.
--   * Chỉ người đã đăng nhập ☁ mới dùng được. Bảng không cho đọc/ghi trực tiếp.
--   * Linh Thạch nằm trong "ví" trên máy chủ (theo tài khoản ☁, dùng chung mọi nhân vật).
--   * Đăng bán: trang bị bị lấy khỏi túi và giữ ở máy chủ (ký gửi) tới khi bán / hủy / hết hạn.
--   * Mua: trừ ví người mua, cộng ví người bán (đã trừ phí 5%), món đồ vào HÒM NHẬN của người mua.
--   * Hủy / hết hạn (48 giờ): món đồ về HÒM NHẬN của người bán. Túi đầy thì đồ nằm lại hòm, không mất.
--   * Tối đa 10 món đang bán / tài khoản. Giá 1 .. 1.000.000.000 Linh Thạch.
--   * Cấp Linh Thạch thủ công (cho tới khi có cách kiếm trong game):
--       select public.cho_admin_grant('<uuid tài khoản>', 1000);
-- =====================================================================

create table if not exists public.cho_wallet(
  uid     uuid primary key,
  lt      bigint      not null default 0 check (lt >= 0),
  updated timestamptz not null default now()
);

create table if not exists public.cho_listing(
  id      bigserial primary key,
  seller  uuid        not null,
  sname   text        not null default 'Đạo Hữu',
  item    jsonb       not null,
  slot    int         not null,
  rar     int         not null,
  lv      int         not null,
  price   bigint      not null check (price between 1 and 1000000000),
  status  text        not null default 'active',   -- active | sold | cancelled | expired
  buyer   uuid,
  seen    boolean     not null default false,      -- người bán đã thấy thông báo "đã bán" chưa
  created timestamptz not null default now(),
  expires timestamptz not null default now() + interval '48 hours',
  sold_at timestamptz
);
create index if not exists cho_listing_act  on public.cho_listing(status, slot, price);
create index if not exists cho_listing_sell on public.cho_listing(seller, status);

create table if not exists public.cho_inbox(
  id   bigserial primary key,
  uid  uuid        not null,
  item jsonb       not null,
  why  text,
  ts   timestamptz not null default now()
);
create index if not exists cho_inbox_uid on public.cho_inbox(uid);

alter table public.cho_wallet  enable row level security;
alter table public.cho_listing enable row level security;
alter table public.cho_inbox   enable row level security;
revoke all on public.cho_wallet, public.cho_listing, public.cho_inbox from anon, authenticated;

-- Trạng thái của tôi: ví, hòm nhận, món đang bán, thông báo đã bán
create or replace function public.cho_me() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_lt bigint; v_in json; v_my json; v_sold json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  -- món hết hạn → về hòm nhận
  with ex as (
    update public.cho_listing set status = 'expired'
     where seller = v_u and status = 'active' and expires <= now() returning item)
  insert into public.cho_inbox(uid, item, why) select v_u, item, 'Hết hạn' from ex;
  select lt into v_lt from public.cho_wallet where uid = v_u;
  select coalesce(json_agg(t order by t.id), '[]'::json) into v_in from (
    select id, item, why from public.cho_inbox where uid = v_u order by id limit 50) t;
  select coalesce(json_agg(t order by t.id desc), '[]'::json) into v_my from (
    select id, item, price, extract(epoch from expires)::bigint as exp
      from public.cho_listing where seller = v_u and status = 'active') t;
  with s as (
    update public.cho_listing set seen = true
     where seller = v_u and status = 'sold' and not seen
     returning id, item, price, (price * 95 / 100) as net)
  select coalesce(json_agg(s), '[]'::json) into v_sold from s;
  return json_build_object('status','ok','lt',v_lt,'inbox',v_in,'mine',v_my,'sold',v_sold);
end $$;

-- Xem chợ (p_slot null = tất cả; p_sort: new | asc | desc)
create or replace function public.cho_list(p_slot int default null, p_sort text default 'new', p_off int default 0) returns json
language plpgsql security definer stable set search_path = public as $$
declare v_u uuid := auth.uid(); v json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select coalesce(json_agg(t), '[]'::json) into v from (
    select id, sname, item, price, (seller = v_u) as mine
      from public.cho_listing
     where status = 'active' and expires > now() and (p_slot is null or slot = p_slot)
     order by case when p_sort = 'asc'  then price end asc,
              case when p_sort = 'desc' then price end desc,
              id desc
     offset greatest(coalesce(p_off, 0), 0) limit 20) t;
  return json_build_object('status','ok','rows',v);
end $$;

-- Đăng bán (ký gửi)
create or replace function public.cho_post(p_item jsonb, p_price bigint, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_s int; v_r int; v_l int; v_id bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_item is null or jsonb_typeof(p_item) <> 'object' or length(p_item::text) > 6000
     or p_price is null or p_price < 1 or p_price > 1000000000 then
    return json_build_object('status','bad');
  end if;
  begin
    v_s := (p_item->>'s')::int; v_r := (p_item->>'r')::int; v_l := (p_item->>'l')::int;
  exception when others then return json_build_object('status','bad'); end;
  if v_s is null or v_r is null or v_l is null or v_s not between 0 and 10
     or v_r not between 0 and 6 or v_l not between 1 and 999 then
    return json_build_object('status','bad');
  end if;
  if (select count(*) from public.cho_listing where seller = v_u and status = 'active' and expires > now()) >= 10 then
    return json_build_object('status','full');
  end if;
  insert into public.cho_listing(seller, sname, item, slot, rar, lv, price)
  values (v_u, left(btrim(coalesce(nullif(p_name,''), 'Đạo Hữu')), 16), p_item, v_s, v_r, v_l, p_price)
  returning id into v_id;
  return json_build_object('status','ok','id',v_id);
end $$;

-- Mua
create or replace function public.cho_buy(p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v public.cho_listing%rowtype; v_lt bigint;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into v from public.cho_listing where id = p_id for update;
  if not found or v.status <> 'active' or v.expires <= now() then return json_build_object('status','gone'); end if;
  if v.seller = v_u then return json_build_object('status','own'); end if;
  insert into public.cho_wallet(uid) values (v_u) on conflict do nothing;
  update public.cho_wallet set lt = lt - v.price, updated = now()
   where uid = v_u and lt >= v.price returning lt into v_lt;
  if not found then return json_build_object('status','poor'); end if;
  update public.cho_listing set status = 'sold', buyer = v_u, sold_at = now() where id = v.id;
  insert into public.cho_wallet(uid, lt) values (v.seller, v.price * 95 / 100)
    on conflict (uid) do update set lt = public.cho_wallet.lt + excluded.lt, updated = now();
  insert into public.cho_inbox(uid, item, why) values (v_u, v.item, 'Đã mua');
  return json_build_object('status','ok','lt',v_lt);
end $$;

-- Hủy bán (đồ về hòm nhận)
create or replace function public.cho_cancel(p_id bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); v_item jsonb;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.cho_listing set status = 'cancelled'
   where id = p_id and seller = v_u and status = 'active' returning item into v_item;
  if v_item is null then return json_build_object('status','gone'); end if;
  insert into public.cho_inbox(uid, item, why) values (v_u, v_item, 'Đã hủy bán');
  return json_build_object('status','ok');
end $$;

-- Xác nhận đã nhận đồ từ hòm vào túi
create or replace function public.cho_ack(p_ids bigint[]) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid();
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  delete from public.cho_inbox where uid = v_u and id = any(coalesce(p_ids, '{}'));
  return json_build_object('status','ok');
end $$;

-- Cấp Linh Thạch (chỉ chạy được trong SQL Editor, người chơi không gọi được)
create or replace function public.cho_admin_grant(p_uid uuid, p_amt bigint) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  insert into public.cho_wallet(uid, lt) values (p_uid, greatest(p_amt, 0))
    on conflict (uid) do update set lt = greatest(public.cho_wallet.lt + p_amt, 0), updated = now()
    returning lt into v;
  return v;
end $$;

revoke all on function public.cho_me(), public.cho_list(int,text,int), public.cho_post(jsonb,bigint,text),
  public.cho_buy(bigint), public.cho_cancel(bigint), public.cho_ack(bigint[]), public.cho_admin_grant(uuid,bigint)
  from public, anon, authenticated;
grant execute on function public.cho_me(), public.cho_list(int,text,int), public.cho_post(jsonb,bigint,text),
  public.cho_buy(bigint), public.cho_cancel(bigint), public.cho_ack(bigint[]) to authenticated;
