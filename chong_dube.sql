-- =====================================================================
-- CHỐNG NHÂN BẢN (DUPE) TRANG BỊ + KIỂM TRA ĐỒ KHI GIAO DỊCH — Supabase
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
-- Chạy SAU cho_giao_dich.sql (cần bảng cho_listing, cho_inbox). KHÔNG đổi nội dung các hàm cho_* hiện có
-- (cho_linh_thach_boss.sql / cho_linh_thach_spend.sql vẫn nguyên) — chỉ gắn TRIGGER vào bảng.
--
-- Mỗi món đồ trong game có mã duy nhất `uid` (client gán). Máy chủ giữ SỔ CÁI kthm_item_ledger(uid → chủ sở hữu, trạng thái):
--     listed = đang treo bán · inbox = đang nằm hòm nhận chờ người nhận · owned = người chơi đã nhận về túi
--   * Đăng bán một món: nếu mã đã có trong sổ cái mà (chủ khác) hoặc (chưa ở trạng thái owned) ⇒ từ chối DUPE_ITEM.
--     (Chặn kiểu: bán rồi nạp lại file lưu cũ để có món đó lần nữa; đăng 2 lần từ 2 bản lưu; mua rồi bản gốc của người bán đăng lại…)
--   * Bán xong → chủ = người mua, trạng thái inbox; hủy/hết hạn → chủ = người bán, inbox; người nhận xác nhận (xoá khỏi hòm) → owned.
--   * Kiểm tra hợp lệ món đồ (kthm_item_ok): cấp, chỉ số, opt nằm trong khoảng cho phép (gấp đôi mức tối đa) ⇒ chặn đồ làm giả chỉ số. BAD_ITEM.
--   * Giới hạn tần suất: tối đa 20 lượt đăng bán / 60 giây / tài khoản ⇒ RATE_LIMIT.
-- Lưu ý: món chưa từng lên chợ chưa có trong sổ cái nên bản sao đầu tiên đăng trước sẽ thắng, các bản sau bị chặn.
-- Gỡ: drop trigger kthm_listing_guard on public.cho_listing; drop trigger kthm_listing_state on public.cho_listing;
--      drop trigger kthm_inbox_ack on public.cho_inbox;
-- =====================================================================

create table if not exists public.kthm_item_ledger(
  uid     text primary key,
  owner   uuid        not null,
  state   text        not null check (state in ('listed','inbox','owned')),
  updated timestamptz not null default now()
);
create index if not exists kthm_item_ledger_owner on public.kthm_item_ledger(owner);
alter table public.kthm_item_ledger enable row level security;
revoke all on public.kthm_item_ledger from anon, authenticated;

-- Kiểm tra hợp lệ một món đồ (đã chuẩn hoá theo hệ opt mới, cho dung sai gấp đôi)
create or replace function public.kthm_item_ok(p_item jsonb) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  k text; v jsonb; n int;
  lim constant jsonb := '{"dmgp":20,"hpp":20,"mpp":20,"sdmg":30,"crit":10,"dodge":10,"acc":10,"prc":10,"dred":10,"stnc":10,"frzc":10,
    "dotd":40,"cdmg":30,"aspd":40,"cspd":40,"ndr":10,"defp":20,"eres":10,"ls":40,"ms":40,"goldp":60,
    "brnc":10,"psnc":10,"bldc":10,"shkc":10,"posc":10}';
begin
  if p_item is null or jsonb_typeof(p_item) <> 'object' then return false; end if;
  if length(p_item::text) > 6000 then return false; end if;
  select count(*) into n from jsonb_object_keys(p_item);
  if n > 40 then return false; end if;
  if coalesce(p_item->>'uid', '') !~ '^[0-9a-f]{16,40}$' then return false; end if;
  -- trường số: cấp, cường hoá, mp, chỉ số gốc
  for k, v in select * from jsonb_each(p_item) loop
    if k in ('l','u','mp','s','r','a','d','h','ttl') then
      if jsonb_typeof(v) <> 'number' then return false; end if;
      if (v #>> '{}')::numeric < 0 then return false; end if;
    end if;
  end loop;
  if (p_item->>'l')::numeric  > 120 then return false; end if;
  if coalesce((p_item->>'u')::numeric, 0)   > 10 then return false; end if;
  if coalesce((p_item->>'mp')::numeric, 0)  > 10 then return false; end if;
  if coalesce((p_item->>'ttl')::numeric, 0) > 3  then return false; end if;
  if coalesce((p_item->>'a')::numeric, 0) > 1e7 or coalesce((p_item->>'d')::numeric, 0) > 1e7 or coalesce((p_item->>'h')::numeric, 0) > 1e7 then return false; end if;
  if p_item ? 'sk' and (p_item->>'sk') not in ('mb','hb') then return false; end if;
  -- dòng opt
  if p_item ? 'x' then
    if jsonb_typeof(p_item->'x') <> 'object' then return false; end if;
    select count(*) into n from jsonb_object_keys(p_item->'x');
    if n > 8 then return false; end if;
    for k, v in select * from jsonb_each(p_item->'x') loop
      if not (lim ? k) then return false; end if;
      if jsonb_typeof(v) <> 'number' then return false; end if;
      if (v #>> '{}')::numeric < 0 or (v #>> '{}')::numeric > (lim->>k)::numeric then return false; end if;
    end loop;
  end if;
  return true;
exception when others then
  return false;
end $$;

-- Trước khi đăng bán: giới hạn tần suất + kiểm tra đồ + đối chiếu sổ cái
create or replace function public.kthm_listing_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_uid text; v_led public.kthm_item_ledger%rowtype; v_cnt int;
begin
  select count(*) into v_cnt from public.cho_listing where seller = new.seller and created > now() - interval '60 seconds';
  if v_cnt >= 20 then raise exception 'RATE_LIMIT'; end if;
  if not public.kthm_item_ok(new.item) then raise exception 'BAD_ITEM'; end if;
  v_uid := new.item->>'uid';
  select * into v_led from public.kthm_item_ledger where uid = v_uid for update;
  if found and (v_led.owner <> new.seller or v_led.state <> 'owned') then
    raise exception 'DUPE_ITEM';
  end if;
  insert into public.kthm_item_ledger(uid, owner, state) values (v_uid, new.seller, 'listed')
  on conflict (uid) do update set owner = excluded.owner, state = 'listed', updated = now();
  return new;
end $$;
drop trigger if exists kthm_listing_guard on public.cho_listing;
create trigger kthm_listing_guard before insert on public.cho_listing
  for each row execute function public.kthm_listing_guard();

-- Khi đổi trạng thái tin đăng: bán xong → chủ = người mua; hủy/hết hạn → chủ = người bán; cả hai chờ ở hòm nhận
create or replace function public.kthm_listing_state() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and (new.item->>'uid') is not null then
    if new.status = 'sold' then
      update public.kthm_item_ledger set owner = new.buyer, state = 'inbox', updated = now() where uid = new.item->>'uid';
    elsif new.status in ('cancelled','expired') then
      update public.kthm_item_ledger set owner = new.seller, state = 'inbox', updated = now() where uid = new.item->>'uid';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists kthm_listing_state on public.cho_listing;
create trigger kthm_listing_state after update of status on public.cho_listing
  for each row execute function public.kthm_listing_state();

-- Người nhận xác nhận (xoá khỏi hòm nhận) → món đồ đã về túi: trạng thái owned
create or replace function public.kthm_inbox_ack() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (old.item->>'uid') is not null then
    update public.kthm_item_ledger set state = 'owned', owner = old.uid, updated = now()
     where uid = old.item->>'uid' and state = 'inbox';
  end if;
  return old;
end $$;
drop trigger if exists kthm_inbox_ack on public.cho_inbox;
create trigger kthm_inbox_ack after delete on public.cho_inbox
  for each row execute function public.kthm_inbox_ack();
