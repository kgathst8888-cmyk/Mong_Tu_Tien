-- =====================================================================
-- XEP HANG V2 (Supabase) - 2 bang: CAP DO + LUC CHIEN
-- Chay 1 lan trong Supabase -> SQL Editor -> New query -> dan toan bo -> Run.
-- An toan khi chay lai nhieu lan. Khong dong den bang/ham xep hang cu.
--
-- Quy tac (khop voi ui/17-ranking-name.js):
--   * Bang CAP DO sap theo: canh gioi (Tien Nhan > Dao The > Pham The)
--       -> cap do -> tu vi (canh gioi tu tien cr, tang cs, diem tu vi cq).
--   * Bang LUC CHIEN sap theo luc chien (pw), bang nhau thi theo canh gioi/cap do.
--   * Moi nhan vat (slot) la 1 dong rieng. Client day du lieu len moi ~60 giay.
--   * Bang khong cho doc/ghi truc tiep; moi thao tac di qua 2 ham ben duoi.
-- =====================================================================

create table if not exists public.rank2_chars(
  uid   uuid        not null,
  slot  int         not null,
  name  text        not null default 'Dao Huu',
  cls   text        not null default '',
  cn    text        not null default '',
  rm    int         not null default 0,   -- 0 Pham The, 1 Dao The, 2 Tien Nhan
  lv    int         not null default 1,
  cr    int         not null default -1,  -- canh gioi tu tien (-1 = So Khai, 0..7)
  cs    int         not null default 0,   -- tang (1..9)
  cq    bigint      not null default 0,   -- diem tu vi trong tang
  pw    bigint      not null default 0,   -- luc chien
  upd   timestamptz not null default now(),
  primary key(uid, slot)
);
create index if not exists rank2_lv_idx  on public.rank2_chars(rm desc, lv desc, cr desc, cs desc, cq desc, upd);
create index if not exists rank2_pow_idx on public.rank2_chars(pw desc, upd);

alter table public.rank2_chars enable row level security;
revoke all on public.rank2_chars from anon, authenticated;

-- ---------------------------------------------------------------------
-- Day du lieu cac nhan vat cua tai khoan dang dang nhap
-- p_chars = [{slot,name,cls,cn,rm,lv,cr,cs,cq,pw}, ...]
-- ---------------------------------------------------------------------
create or replace function public.rank2_submit(p_chars jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  c jsonb;
  n int := 0;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_chars is null or jsonb_typeof(p_chars) <> 'array' then
    return json_build_object('status','bad');
  end if;

  for c in select * from jsonb_array_elements(p_chars) limit 3 loop
    insert into public.rank2_chars(uid, slot, name, cls, cn, rm, lv, cr, cs, cq, pw, upd)
    values (
      v_u,
      greatest(0, least(coalesce((c->>'slot')::int, 0), 2)),
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

  return json_build_object('status','ok','n',n);
end $$;

-- ---------------------------------------------------------------------
-- Lay bang: p_kind = 'lv' (cap do) hoac 'pow' (luc chien)
-- Tra ve {status, top:[{rank,name,cn,rm,lv,cr,cs,cq,pw,me}], mine:[...], total}
-- Goi duoc ca khi chua dang nhap (chi khong co dong "me"/"mine").
-- ---------------------------------------------------------------------
create or replace function public.rank2_get(p_kind text default 'lv', p_limit int default 50) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_u   uuid := auth.uid();
  v_k   text := case when p_kind = 'pow' then 'pow' else 'lv' end;
  v_lim int  := greatest(1, least(coalesce(p_limit, 50), 100));
  v_top json; v_mine json; v_tot int;
begin
  select count(*) into v_tot from public.rank2_chars;

  with r as (
    select c.*,
           (row_number() over (
              order by case when v_k = 'pow' then c.pw end desc nulls last,
                       c.rm desc, c.lv desc, c.cr desc, c.cs desc, c.cq desc, c.upd asc
           ))::int as rk
      from public.rank2_chars c
  )
  select
    coalesce((select json_agg(t order by t.rank) from (
      select rk as rank, name, cn, rm, lv, cr, cs, cq, pw, (uid = v_u) as me
        from r where rk <= v_lim order by rk) t), '[]'::json),
    coalesce((select json_agg(t order by t.rank) from (
      select rk as rank, name, cn, rm, lv, cr, cs, cq, pw, true as me
        from r where v_u is not null and uid = v_u order by rk) t), '[]'::json)
  into v_top, v_mine;

  return json_build_object('status','ok','kind',v_k,'top',v_top,'mine',v_mine,'total',v_tot);
end $$;

grant execute on function public.rank2_submit(jsonb)      to anon, authenticated;
grant execute on function public.rank2_get(text, int)     to anon, authenticated;
