-- Fix437: đồ đã cường hoá (u > 0) không được treo lên Chợ Giao Dịch.
-- Chặn ở máy chủ bằng trigger BEFORE INSERT trên cho_listing (ném ENHANCED_ITEM). Client cũng chặn trước nên đồ không rời túi.
-- Đá khảm đi qua chợ dạng món {gm:1} không có u nên không bị ảnh hưởng. Không đụng các tin đang bán/đã bán.
-- Hoàn tác: drop trigger cho_no_enhanced on public.cho_listing; drop function public.cho_no_enhanced();
create or replace function public.cho_no_enhanced() returns trigger
language plpgsql set search_path = public as $$
begin
  if coalesce((new.item->>'u')::numeric, 0) > 0 and coalesce(new.item->>'gm', '') <> '1' then
    raise exception 'ENHANCED_ITEM';
  end if;
  return new;
end $$;

drop trigger if exists cho_no_enhanced on public.cho_listing;
create trigger cho_no_enhanced before insert on public.cho_listing
  for each row execute function public.cho_no_enhanced();
