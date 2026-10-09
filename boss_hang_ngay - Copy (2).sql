-- =====================================================================
-- BOSS BẤT TỬ HẰNG NGÀY — bảng sát thương trên mây (Supabase)
-- Chạy 1 lần trong Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- An toàn khi chạy lại nhiều lần.
--
-- Quy tắc (khớp với world/27-immortal-boss.js):
--   * Ngày tính theo giờ Việt Nam (đổi ngày lúc 00:00 GMT+7).
--   * Mỗi nhân vật (slot) tối đa 3 lượt/ngày — máy chủ tự kiểm tra.
--   * Mỗi ngày chỉ giữ lượt sát thương CAO NHẤT để xếp hạng.
--   * Sang ngày mới, người chơi nhận thưởng theo hạng của ngày hôm trước
--     (tối đa 7 ngày gần nhất, mỗi ngày nhận 1 lần).
--   * Bảng không cho đọc/ghi trực tiếp; mọi thao tác đi qua các hàm bên dưới.
-- =====================================================================

create table if not exists public.boss_scores(
  day     date        not null,
  uid     uuid        not null,
  slot    int         not null default 0,
  name    text        not null default 'Đạo Hữu',
  cls     text        not null default '',
  lv      int         not null default 1,
  best    bigint      not null default 0,
  tries   int         not null default 0,
  pend    boolean     not null default false,
  pend_at timestamptz,
  claimed boolean     not null default false,
  upd     timestamptz not null default now(),
  primary key(day, uid, slot)
);
create index if not exists boss_scores_rank_idx on public.boss_scores(day, best desc, upd);

alter table public.boss_scores enable row level security;
revoke all on public.boss_scores from anon, authenticated;

-- Ngày hiện tại theo giờ VN
create or replace function public.boss_day() returns date
language sql stable as $$ select (now() at time zone 'Asia/Ho_Chi_Minh')::date $$;

-- ---------------------------------------------------------------------
-- Trạng thái: số lượt đã dùng, hạng của mình, top 20 hôm nay, thưởng chờ nhận
-- ---------------------------------------------------------------------
create or replace function public.boss_status(p_slot int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_d date := public.boss_day();
  v_me public.boss_scores;
  v_rk int; v_tot int; v_top json; v_pend json;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  select * into v_me from public.boss_scores where day = v_d and uid = v_u and slot = p_slot;
  select count(*) into v_tot from public.boss_scores where day = v_d and best > 0;

  if v_me.uid is not null and v_me.best > 0 then
    select 1 + count(*) into v_rk from public.boss_scores s
     where s.day = v_d and s.best > 0
       and (s.best > v_me.best or (s.best = v_me.best and s.upd < v_me.upd));
  end if;

  select coalesce(json_agg(t order by t.r), '[]'::json) into v_top from (
    select (row_number() over (order by b.best desc, b.upd asc))::int as r,
           b.name, b.cls, b.lv, b.best, (b.uid = v_u and b.slot = p_slot) as me
      from public.boss_scores b
     where b.day = v_d and b.best > 0
     order by b.best desc, b.upd asc
     limit 20) t;

  select coalesce(json_agg(x order by x.day desc), '[]'::json) into v_pend from (
    select s.day::text as day, s.best,
           (select (1 + count(*))::int from public.boss_scores o
             where o.day = s.day and o.best > 0
               and (o.best > s.best or (o.best = s.best and o.upd < s.upd))) as rank
      from public.boss_scores s
     where s.uid = v_u and s.slot = p_slot
       and s.day < v_d and s.day >= v_d - 7
       and s.best > 0 and not s.claimed) x;

  return json_build_object('status','ok','day',v_d::text,'tries',coalesce(v_me.tries,0),'max',3,
                           'best',coalesce(v_me.best,0),'rank',v_rk,'total',v_tot,
                           'top',v_top,'pending',v_pend);
end $$;

-- ---------------------------------------------------------------------
-- Bắt đầu 1 lượt: trừ lượt, đánh dấu "đang đánh"
-- ---------------------------------------------------------------------
create or replace function public.boss_begin(p_slot int, p_name text, p_cls text, p_lv int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_d date := public.boss_day();
  v_n int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  insert into public.boss_scores(day, uid, slot, name, cls, lv)
  values (v_d, v_u, p_slot,
          left(coalesce(nullif(p_name,''),'Đạo Hữu'), 24), left(coalesce(p_cls,''), 16),
          greatest(1, least(coalesce(p_lv,1), 999)))
  on conflict (day, uid, slot) do nothing;

  update public.boss_scores
     set tries = tries + 1, pend = true, pend_at = now(),
         name = left(coalesce(nullif(p_name,''), name), 24),
         cls  = left(coalesce(p_cls, cls), 16),
         lv   = greatest(1, least(coalesce(p_lv,1), 999))
   where day = v_d and uid = v_u and slot = p_slot and tries < 3
  returning tries into v_n;

  if v_n is null then return json_build_object('status','no_tries'); end if;
  return json_build_object('status','ok','tries',v_n);
end $$;

-- ---------------------------------------------------------------------
-- Kết thúc lượt: ghi sát thương (chỉ nhận nếu có lượt đang chờ trong 10 phút)
-- ---------------------------------------------------------------------
create or replace function public.boss_end(p_slot int, p_dmg numeric) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid();
  v_r public.boss_scores;
  v_v bigint;
  v_rk int; v_tot int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;

  select * into v_r from public.boss_scores
   where uid = v_u and slot = p_slot and pend and pend_at > now() - interval '10 minutes'
   order by day desc limit 1;
  if v_r.uid is null then return json_build_object('status','no_pending'); end if;

  v_v := greatest(0, least(floor(coalesce(p_dmg, 0)), 1000000000000))::bigint;   -- trần 1 nghìn tỉ / lượt

  update public.boss_scores
     set pend = false,
         best = greatest(best, v_v),
         upd  = case when v_v > best then now() else upd end
   where day = v_r.day and uid = v_u and slot = p_slot
  returning * into v_r;

  select count(*) into v_tot from public.boss_scores where day = v_r.day and best > 0;
  select (1 + count(*))::int into v_rk from public.boss_scores s
   where s.day = v_r.day and s.best > 0
     and (s.best > v_r.best or (s.best = v_r.best and s.upd < v_r.upd));

  return json_build_object('status','ok','best',v_r.best,'rank',v_rk,'total',v_tot);
end $$;

-- ---------------------------------------------------------------------
-- Xác nhận đã nhận thưởng của 1 ngày (chỉ ngày đã qua)
-- ---------------------------------------------------------------------
create or replace function public.boss_claim_ack(p_slot int, p_day text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid();
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  update public.boss_scores set claimed = true
   where uid = v_u and slot = p_slot and day = p_day::date and day < public.boss_day();
  return json_build_object('status','ok');
end $$;

-- Quyền gọi hàm: chỉ người đã đăng nhập
revoke execute on function public.boss_status(int)                        from public, anon;
revoke execute on function public.boss_begin(int, text, text, int)        from public, anon;
revoke execute on function public.boss_end(int, numeric)                  from public, anon;
revoke execute on function public.boss_claim_ack(int, text)               from public, anon;
grant  execute on function public.boss_status(int)                        to authenticated;
grant  execute on function public.boss_begin(int, text, text, int)        to authenticated;
grant  execute on function public.boss_end(int, numeric)                  to authenticated;
grant  execute on function public.boss_claim_ack(int, text)               to authenticated;
