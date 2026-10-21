-- =====================================================================
-- TÔNG CHIẾN (hằng tuần, tông đấu tông) — Fix383 — chạy SAU tong_mon_xahoi.sql (dùng tm_logw, tm_addexp) và tong_mon_boss.sql (tm_wk)
-- AN TOÀN KHI CHẠY LẠI.
--   • Mỗi tuần (thứ Hai 00:00 giờ VN) tông có ĐỦ 5 THÀNH VIÊN trở lên được ghép đấu với 1 tông khác có SỨC MẠNH gần nhất
--     (sức mạnh = tổng tm_user.bref của thành viên lúc ghép; ghép lười khi 2 tông cùng chờ → tông lẻ chờ tới khi có đối thủ, cuối tuần chưa có = "bye").
--   • Mỗi tài khoản 2 lượt/ngày (đếm RIÊNG với Boss Tông Môn), mỗi lượt 60 giây; tổng sát thương của cả tông = ĐIỂM. Tuần kết thúc: điểm cao hơn thắng,
--     bằng nhau = hoà. Mỗi lượt: tông +15 exp, người chơi +20 cống hiến.
--   • Nhận thưởng (tm_war_claim) sau khi tuần kết thúc, trong 28 ngày, cần >= 2 lượt trong tuần đó. Lần nhận ĐẦU TIÊN của tông chốt kết quả:
--     thắng +400 exp tông / hoà +250 / thua +150 / bye +100 và ghi nhật ký. Cống hiến: thắng +200, còn lại +80.
--   • Chống lách: đối thủ bị giải tán giữa tuần coi như "bye"; tông dưới 5 người không được ghép.
--   Giới hạn: sát thương do máy khách báo (cùng mức tin cậy với Boss Tông Môn). Hai tài khoản tự lập hai tông để hưởng "thắng" là KHÔNG ngăn được
--   hoàn toàn — phần thưởng thắng giữ vừa phải và cần đủ 5 thành viên + 2 lượt/người.
-- =====================================================================
create table if not exists public.tm_war(
  wk       date   not null,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  opp      bigint,
  score    bigint not null default 0,
  power    bigint not null default 0,
  settled  boolean not null default false,
  primary key (wk, guild_id)
);
create table if not exists public.tm_warmem(
  wk       date   not null,
  guild_id bigint not null references public.tm_guild(id) on delete cascade,
  uid      uuid   not null,
  name     text   not null default '',
  dmg      bigint not null default 0,
  tries    int    not null default 0,
  claimed  boolean not null default false,
  upd      timestamptz not null default now(),
  primary key (wk, guild_id, uid)
);
create index if not exists tm_warmem_uid on public.tm_warmem (uid, wk);
create table if not exists public.tm_warrun(
  uid        uuid primary key,
  day        date,
  n          int not null default 0,
  pend       boolean not null default false,
  pend_at    timestamptz,
  pend_guild bigint,
  pend_wk    date
);
alter table public.tm_war    enable row level security;
alter table public.tm_warmem enable row level security;
alter table public.tm_warrun enable row level security;
revoke all on public.tm_war, public.tm_warmem, public.tm_warrun from anon, authenticated;

-- Đảm bảo tông có dòng đấu tuần này và ghép đối thủ (nội bộ)
create or replace function public.tm_war_row(p_gid bigint) returns void
language plpgsql security definer set search_path = public as $$
declare v_wk date := public.tm_wk(); v_opp bigint; v_o bigint; v_pow bigint;
begin
  insert into public.tm_war(wk, guild_id, power)
  select v_wk, p_gid, coalesce(sum(u.bref), 0) from public.tm_member m left join public.tm_user u on u.uid = m.uid where m.guild_id = p_gid
  on conflict (wk, guild_id) do nothing;
  select opp, power into v_o, v_pow from public.tm_war where wk = v_wk and guild_id = p_gid for update;
  if v_o is null then
    select w.guild_id into v_opp from public.tm_war w
     where w.wk = v_wk and w.opp is null and w.guild_id <> p_gid
     order by abs(w.power - v_pow), w.guild_id limit 1 for update skip locked;
    if v_opp is not null then
      update public.tm_war set opp = v_opp where wk = v_wk and guild_id = p_gid;
      update public.tm_war set opp = p_gid where wk = v_wk and guild_id = v_opp;
    end if;
  end if;
end $$;

create or replace function public.tm_war_status() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; v_wk date := public.tm_wk();
  m public.tm_member; w public.tm_war; ow public.tm_war; v_cnt int; v_day date; v_n int;
  v_oname text; v_top json; v_pend json; v_my bigint;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select count(*) into v_cnt from public.tm_member where guild_id = m.guild_id;
  select day, n into v_day, v_n from public.tm_warrun where uid = v_u;
  if v_day is distinct from v_today then v_n := 0; end if;
  v_n := coalesce(v_n, 0);

  select coalesce(json_agg(t), '[]'::json) into v_pend from (
    select x.wk, g.name as guild, ww.score as my, coalesce(ow2.score, 0) as opp, og.name as oppname,
           case when ow2.guild_id is null then 'bye' when ww.score > ow2.score then 'win' when ww.score < ow2.score then 'lose' else 'draw' end as res
      from public.tm_warmem x
      join public.tm_war ww on ww.wk = x.wk and ww.guild_id = x.guild_id
      join public.tm_guild g on g.id = x.guild_id
      left join public.tm_war ow2 on ow2.wk = ww.wk and ow2.guild_id = ww.opp
      left join public.tm_guild og on og.id = ow2.guild_id
     where x.uid = v_u and not x.claimed and x.tries >= 2 and x.wk < v_wk and x.wk >= v_wk - 28
     order by x.wk desc) t;

  if v_cnt < 5 then
    return json_build_object('status', 'ok', 'small', true, 'cnt', v_cnt, 'wk', v_wk, 'left', 2 - v_n, 'pending', v_pend);
  end if;
  perform public.tm_war_row(m.guild_id);
  select * into w from public.tm_war where wk = v_wk and guild_id = m.guild_id;
  if w.opp is not null then
    select * into ow from public.tm_war where wk = v_wk and guild_id = w.opp;
    select name into v_oname from public.tm_guild where id = w.opp;
  end if;
  select coalesce(json_agg(t), '[]'::json) into v_top from (
    select x.name, x.dmg, x.tries, (x.uid = v_u) as me from public.tm_warmem x
     where x.guild_id = m.guild_id and x.wk = v_wk order by x.dmg desc, x.upd limit 20) t;
  select dmg into v_my from public.tm_warmem where wk = v_wk and guild_id = m.guild_id and uid = v_u;
  return json_build_object('status', 'ok', 'small', false, 'wk', v_wk, 'left', 2 - v_n,
    'score', w.score, 'opp', case when w.opp is null then null else json_build_object('id', w.opp, 'name', v_oname, 'score', coalesce(ow.score, 0)) end,
    'my', coalesce(v_my, 0), 'top', v_top, 'pending', v_pend);
end $$;

create or replace function public.tm_war_begin() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; v_wk date := public.tm_wk();
  m public.tm_member; v_cnt int; v_n int; v_day date; v_oid bigint;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found then return json_build_object('status', 'none'); end if;
  select count(*) into v_cnt from public.tm_member where guild_id = m.guild_id;
  if v_cnt < 5 then return json_build_object('status', 'small'); end if;
  perform public.tm_war_row(m.guild_id);
  insert into public.tm_warrun(uid) values (v_u) on conflict (uid) do nothing;
  select day, n into v_day, v_n from public.tm_warrun where uid = v_u for update;
  if v_day is distinct from v_today then v_n := 0; end if;
  if v_n >= 2 then return json_build_object('status', 'no_tries'); end if;
  update public.tm_warrun set day = v_today, n = v_n + 1, pend = true, pend_at = now(), pend_guild = m.guild_id, pend_wk = v_wk where uid = v_u;
  select opp into v_oid from public.tm_war where wk = v_wk and guild_id = m.guild_id;
  return json_build_object('status', 'ok', 'left', 2 - (v_n + 1), 'wk', v_wk, 'opp', coalesce(v_oid, 0));
end $$;

create or replace function public.tm_war_end(p_dmg bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tm_warrun; m public.tm_member; v_d bigint; v_score bigint;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  select * into r from public.tm_warrun where uid = v_u for update;
  if not found or not r.pend then return json_build_object('status', 'none'); end if;
  update public.tm_warrun set pend = false where uid = v_u;
  if r.pend_at < now() - interval '10 minutes' then return json_build_object('status', 'expired'); end if;
  select * into m from public.tm_member where uid = v_u;
  if not found or m.guild_id <> r.pend_guild then return json_build_object('status', 'moved'); end if;
  v_d := least(greatest(coalesce(p_dmg, 0), 0), 1000000000000);
  insert into public.tm_warmem(wk, guild_id, uid, name, dmg, tries) values (r.pend_wk, m.guild_id, v_u, m.name, v_d, 1)
  on conflict (wk, guild_id, uid) do update
     set dmg = public.tm_warmem.dmg + excluded.dmg, tries = public.tm_warmem.tries + 1, name = excluded.name, upd = now();
  update public.tm_war set score = score + v_d where wk = r.pend_wk and guild_id = m.guild_id returning score into v_score;
  insert into public.tm_user(uid, bref) values (v_u, v_d)
  on conflict (uid) do update set bref = greatest(public.tm_user.bref, excluded.bref);
  update public.tm_member set contrib = contrib + 20 where uid = v_u;
  perform public.tm_addexp(m.guild_id, 15);
  return json_build_object('status', 'ok', 'd', v_d, 'score', v_score);
end $$;

create or replace function public.tm_war_claim(p_wk date) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); v_wk date := public.tm_wk(); x public.tm_warmem; w public.tm_war; ow public.tm_war;
  v_res text; v_exp int; v_first boolean; v_ct int; v_on text;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_wk is null or p_wk >= v_wk or p_wk < v_wk - 28 then return json_build_object('status', 'old'); end if;
  select * into x from public.tm_warmem where uid = v_u and wk = p_wk and not claimed and tries >= 2 order by dmg desc limit 1 for update;
  if not found then return json_build_object('status', 'none'); end if;
  select * into w from public.tm_war where wk = x.wk and guild_id = x.guild_id for update;
  if not found then return json_build_object('status', 'none'); end if;
  select * into ow from public.tm_war where wk = w.wk and guild_id = w.opp;
  v_res := case when w.opp is null or ow.guild_id is null then 'bye' when w.score > ow.score then 'win' when w.score < ow.score then 'lose' else 'draw' end;
  v_exp := case v_res when 'win' then 400 when 'draw' then 250 when 'lose' then 150 else 100 end;
  update public.tm_war set settled = true where wk = w.wk and guild_id = w.guild_id and not settled returning true into v_first;
  if coalesce(v_first, false) then
    perform public.tm_addexp(w.guild_id, v_exp);
    select name into v_on from public.tm_guild where id = w.opp;
    perform public.tm_logw(w.guild_id, 'war', '⚔ Tông Chiến tuần ' || to_char(w.wk, 'DD/MM') || ': ' ||
      case v_res when 'win' then 'THẮNG ' when 'lose' then 'thua ' when 'draw' then 'hoà với ' else 'không có đối thủ' end || coalesce(v_on, ''));
  end if;
  update public.tm_warmem set claimed = true where wk = x.wk and guild_id = x.guild_id and uid = v_u;
  v_ct := case when v_res = 'win' then 200 else 80 end;
  update public.tm_member set contrib = contrib + v_ct where uid = v_u and guild_id = x.guild_id;
  return json_build_object('status', 'ok', 'res', v_res, 'my', w.score, 'opp', coalesce(ow.score, 0), 'ct', v_ct);
end $$;

revoke all on function public.tm_war_row(bigint) from public, anon, authenticated;
revoke all on function public.tm_war_status(), public.tm_war_begin(), public.tm_war_end(bigint), public.tm_war_claim(date) from public, anon;
grant execute on function public.tm_war_status(), public.tm_war_begin(), public.tm_war_end(bigint), public.tm_war_claim(date) to authenticated;
