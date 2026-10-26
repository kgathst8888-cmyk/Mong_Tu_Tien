-- Fix436: đồ cường hoá +11..+15 (đồ Thánh, đồ thường) bị chợ từ chối (BAD_ITEM) và mất khỏi túi.
-- Nguyên nhân: kthm_item_ok (chong_dube.sql, Fix118) chỉ cho cường hoá u <= 10, trong khi game cho lên +15 (Đá Cường Hóa, MAXU=15).
-- Hàm này cũng được kthm_cheat_scan (chong_hack_khoa_tk.sql) dùng khi lưu: đồ +11..+15 trong túi/ô mặc bị tính nhầm là đồ làm giả -> cộng điểm vi phạm.
-- Chạy 1 lần trong Supabase SQL Editor. Chỉ đổi đúng 1 dòng (u > 10 -> u > 15), phần còn lại giữ nguyên.
-- Hoàn tác: chạy lại đoạn create function trong chong_dube.sql.

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
  if coalesce((p_item->>'u')::numeric, 0)   > 15 then return false; end if;   -- cường hoá tối đa +15 (world/38-da-cuong-hoa.js MAXU)
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
