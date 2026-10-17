-- Một nhân vật / tài khoản: rank2_submit xoá các slot cũ không còn được gửi lên (dọn nhân vật thừa khỏi bảng xếp hạng).
-- Chạy 1 lần trong Supabase SQL Editor (thay thế hàm cũ trong xep_hang_v2.sql).
create or replace function public.rank2_submit(p_chars jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  c jsonb;
  n int := 0;
  v_slots int[] := '{}';
  v_slot int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_chars is null or jsonb_typeof(p_chars) <> 'array' then
    return json_build_object('status','bad');
  end if;

  for c in select * from jsonb_array_elements(p_chars) limit 3 loop
    v_slot := greatest(0, least(coalesce((c->>'slot')::int, 0), 2));
    v_slots := v_slots || v_slot;
    insert into public.rank2_chars(uid, slot, name, cls, cn, rm, lv, cr, cs, cq, pw, upd)
    values (
      v_u, v_slot,
      left(coalesce(nullif(trim(c->>'name'), ''), 'Dao Huu'), 24),
      left(coalesce(c->>'cls', ''), 16),
      left(coalesce(c->>'cn', ''), 24),
      greatest(0, least(coalesce((c->>'rm')::int, 0), 2)),
      greatest(1, least(coalesce((c->>'lv')::int, 1), 999)),
      greatest(-1, least(coalesce((c->>'cr')::int, -1), 7)),
      greatest(0, least(coalesce((c->>'cs')::int, 0), 9)),
      greatest(0, least(coalesce((c->>'cq')::numeric, 0), 1e15))::bigint,
      greatest(0, least(coalesce((c->>'pw')::numeric, 0), 1e13))::bigint,
      now()
    )
    on conflict (uid, slot) do update set
      name = excluded.name, cls = excluded.cls, cn = excluded.cn,
      rm = excluded.rm, lv = excluded.lv, cr = excluded.cr, cs = excluded.cs,
      cq = excluded.cq, pw = excluded.pw, upd = now();
    n := n + 1;
  end loop;

  if n > 0 then
    delete from public.rank2_chars where uid = v_u and not (slot = any(v_slots));
  end if;
  return json_build_object('status','ok','n',n);
end $$;
