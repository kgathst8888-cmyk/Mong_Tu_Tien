-- =====================================================================
-- CHIẾN TRƯỜNG TIÊN · MA — PvP người thật (Fix340: tối ưu + sửa lỗi)
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI (cả khi đã chạy bản Fix326/339 trước đó: giữ nguyên bảng, chỉ thay hàm).
--
--   * ctm_room   : phòng trận (wait → active → done | expired).
--   * ctm_member : người trong phòng (phe Tiên / Ma, trạng thái ~3 lần/giây do máy khách gửi).
--   * ctm_day    : số trận PvP đã nhận thưởng trong ngày (giờ VN).
--   Hằng số trận (đổi cả ở CTM_CF.pv trong world/104): dur=150 giây · winPts=30 điểm · ptsKill=3 điểm/lần hạ.
--   Điểm phe = 3 × tổng số lần ngã của phe địch (mỗi máy khách báo số lần ngã của chính mình).
--   Phòng bắt đầu khi có CẢ 2 phe đang ONLINE (đã gửi tín hiệu trong 8 giây gần nhất) và đã chờ >= 10 giây (hoặc đủ 8 người).
--   Chờ >= 25 giây không có đối thủ → hết hạn, máy khách tự chuyển sang luyện tập với máy (không mất vé).
--
--   Fix340 so với bản trước:
--     - Người "ma" (đã thoát/đóng game khi đang chờ) không còn được tính để mở trận; bị dọn khỏi phòng chờ.
--     - Một phe mất hết người online > 8 giây sau khi trận bắt đầu → trận kết thúc, phe còn lại THẮNG (người bỏ đi không có thưởng).
--     - ctm_sync không còn khoá hàng phòng ở mỗi lần gọi (chỉ khoá khi đổi trạng thái) → nhẹ hơn nhiều khi đông người.
--     - Ghép vào phòng chỉ khi phòng còn >= 10 giây chờ; có chỉ mục + tự dọn phòng cũ (> 3 giờ).
--     - ctm_claim cho nhận lại 1 lần nếu phản hồi lần đầu bị mất mạng (trả lại đúng kết quả cũ, không thưởng đôi).
--   Giới hạn: kết quả do máy khách báo (cùng mức tin cậy với Đấu Trường); máy chủ giữ giờ, điểm phe, người thắng và hạn mức thưởng.
-- =====================================================================
create table if not exists public.ctm_room(
  id      bigserial primary key,
  st      text not null default 'wait',      -- wait | active | done | expired
  created timestamptz not null default now(),
  start_at timestamptz,
  end_at  timestamptz,
  sc_tien int not null default 0,
  sc_ma   int not null default 0,
  winner  text                               -- tien | ma | draw
);

create table if not exists public.ctm_member(
  room_id bigint not null references public.ctm_room(id) on delete cascade,
  n       int    not null,
  uid     uuid   not null,
  slot    int    not null default 0,
  side    text   not null check (side in ('tien','ma')),
  name    text   not null default '',
  state   jsonb,
  at      timestamptz not null default now(),
  claimed boolean not null default false
);
alter table public.ctm_member add column if not exists claim_res jsonb;
alter table public.ctm_member add column if not exists claim_n int not null default 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.ctm_member'::regclass and contype = 'p') then
    alter table public.ctm_member add primary key (room_id, uid);
  end if;
end $$;

create table if not exists public.ctm_day(
  uid uuid not null,
  day date not null,
  n   int  not null default 0,
  primary key(uid, day)
);

create index if not exists ctm_member_uid_idx   on public.ctm_member(uid, room_id desc);
create index if not exists ctm_room_created_idx on public.ctm_room(created);
create index if not exists ctm_room_wait_idx    on public.ctm_room(id) where st = 'wait';

alter table public.ctm_room   enable row level security;
alter table public.ctm_member enable row level security;
alter table public.ctm_day    enable row level security;
revoke all on public.ctm_room, public.ctm_member, public.ctm_day from anon, authenticated;

-- ---------------------------------------------------------------------
-- Vào hàng chờ: ghép vào phòng đang chờ còn chỗ cho phe mình (tối đa 5 mỗi phe), không có thì mở phòng mới
-- ---------------------------------------------------------------------
create or replace function public.ctm_join(p_slot int, p_side text, p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.ctm_room; v_n int;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_side is null or p_side not in ('tien','ma') then return json_build_object('status','bad'); end if;
  -- bỏ khỏi phòng chờ cũ của chính mình + dọn người "ma" (không còn gửi tín hiệu) khỏi mọi phòng chờ
  delete from public.ctm_member m using public.ctm_room x
   where m.room_id = x.id and x.st = 'wait' and (m.uid = v_u or m.at < now() - interval '12 seconds');
  update public.ctm_room set st = 'expired' where st = 'wait' and created < now() - interval '40 seconds';
  if random() < 0.03 then
    delete from public.ctm_room where created < now() - interval '3 hours';
  end if;
  select * into r from public.ctm_room x
   where x.st = 'wait' and x.created > now() - interval '15 seconds'
     and (select count(*) from public.ctm_member m where m.room_id = x.id and m.side = p_side) < 5
   order by x.id limit 1 for update skip locked;
  if not found then
    insert into public.ctm_room default values returning * into r;
  end if;
  select coalesce(max(n), 0) + 1 into v_n from public.ctm_member where room_id = r.id;
  insert into public.ctm_member(room_id, n, uid, slot, side, name, at)
  values (r.id, v_n, v_u, coalesce(p_slot, 0), p_side, left(coalesce(p_name, ''), 24), now());
  return json_build_object('status','ok','room',r.id,'n',v_n);
end $$;

-- ---------------------------------------------------------------------
-- Đồng bộ: gửi trạng thái của mình (hoặc null khi đang chờ), nhận danh sách mọi người + giờ + điểm
-- ---------------------------------------------------------------------
create or replace function public.ctm_sync(p_room bigint, p_state jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); r public.ctm_room; v_from text;
  v_t int; v_m int; v_ft int; v_fm int; v_sct int; v_scm int; v_left int; v_list json; v_go boolean := false; v_w text;
  c_dur constant int := 150; c_win constant int := 30; c_pk constant int := 3;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  if p_state is not null and jsonb_typeof(p_state) = 'object' and length(p_state::text) < 3000 then
    update public.ctm_member set state = p_state, at = now() where room_id = p_room and uid = v_u;
  else
    update public.ctm_member set at = now() where room_id = p_room and uid = v_u;
  end if;
  if not found then return json_build_object('status','gone'); end if;
  select * into r from public.ctm_room where id = p_room;
  if not found then return json_build_object('status','gone'); end if;
  v_from := r.st;

  select count(*) filter (where side = 'tien'),
         count(*) filter (where side = 'ma'),
         count(*) filter (where side = 'tien' and at > now() - interval '8 seconds'),
         count(*) filter (where side = 'ma'   and at > now() - interval '8 seconds')
    into v_t, v_m, v_ft, v_fm from public.ctm_member where room_id = p_room;

  v_sct := r.sc_tien; v_scm := r.sc_ma;
  if r.st = 'wait' then
    v_go := (v_ft > 0 and v_fm > 0 and (r.created < now() - interval '10 seconds' or v_ft + v_fm >= 8))
            or r.created < now() - interval '25 seconds';
  elsif r.st = 'active' then
    select coalesce(sum(case when side = 'ma'   then coalesce((state->>'dth')::int, 0) end), 0) * c_pk,
           coalesce(sum(case when side = 'tien' then coalesce((state->>'dth')::int, 0) end), 0) * c_pk
      into v_sct, v_scm from public.ctm_member where room_id = p_room;
    v_go := v_sct >= c_win or v_scm >= c_win or now() >= r.end_at
            or (r.start_at < now() - interval '8 seconds' and (v_ft = 0 or v_fm = 0));
  end if;

  if v_go then
    -- chỉ khoá phòng khi thật sự đổi trạng thái; nếu người khác đã đổi trước thì bỏ qua
    select * into r from public.ctm_room where id = p_room for update;
    if r.st = v_from then
      if r.st = 'wait' then
        if v_ft > 0 and v_fm > 0 then
          update public.ctm_room set st = 'active', start_at = now(), end_at = now() + make_interval(secs => c_dur)
           where id = p_room returning * into r;
        else
          update public.ctm_room set st = 'expired' where id = p_room returning * into r;
        end if;
      elsif r.st = 'active' then
        v_w := case when v_sct > v_scm then 'tien' when v_scm > v_sct then 'ma' else 'draw' end;
        if v_ft = 0 and v_fm > 0 then v_w := 'ma';
        elsif v_fm = 0 and v_ft > 0 then v_w := 'tien'; end if;
        update public.ctm_room set st = 'done', sc_tien = v_sct, sc_ma = v_scm, winner = v_w
         where id = p_room returning * into r;
      end if;
    end if;
    v_sct := case when r.st = 'done' then r.sc_tien else v_sct end;
    v_scm := case when r.st = 'done' then r.sc_ma   else v_scm end;
  end if;

  v_left := case when r.st = 'active' then greatest(0, ceil(extract(epoch from r.end_at - now())))::int else null end;

  select coalesce(json_agg(json_build_object(
           'n', m.n, 'side', m.side, 'name', m.name, 'state', m.state,
           'age', (extract(epoch from now() - m.at) * 1000)::int) order by m.n), '[]'::json)
    into v_list from public.ctm_member m where m.room_id = p_room;

  return json_build_object('status','ok','st',r.st,'left',v_left,
    'sc_tien',v_sct,'sc_ma',v_scm,'winner',r.winner,'nt',v_t,'nm',v_m,'members',v_list);
end $$;

-- ---------------------------------------------------------------------
-- Rời phòng (rút lui)
-- ---------------------------------------------------------------------
create or replace function public.ctm_leave(p_room bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.ctm_room;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into r from public.ctm_room where id = p_room;
  if not found then return json_build_object('status','gone'); end if;
  if r.st = 'wait' then
    delete from public.ctm_member where room_id = p_room and uid = v_u;
  else
    update public.ctm_member
       set state = jsonb_set(coalesce(state, '{}'::jsonb), '{left}', '1'::jsonb), at = now() - interval '1 minute'
     where room_id = p_room and uid = v_u;
  end if;
  return json_build_object('status','ok');
end $$;

-- ---------------------------------------------------------------------
-- Nhận thưởng sau trận (tối đa 6 trận có thưởng/ngày giờ VN). Máy khách tự mở rương theo số rương máy chủ trả về
-- (thắng 2, hoà/thua 1). Rời trận sớm / không còn online → afk, không thưởng.
-- Mất mạng giữa chừng: gọi lại lần 2 sẽ nhận đúng kết quả cũ (không thưởng đôi); từ lần 3 trở đi trả 'dup'.
-- ---------------------------------------------------------------------
create or replace function public.ctm_claim(p_room bigint) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); me public.ctm_member; r public.ctm_room; v_win boolean; v_n int; v_res json;
  v_d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; c_cap constant int := 6;
begin
  if v_u is null then return json_build_object('status','auth'); end if;
  select * into me from public.ctm_member where room_id = p_room and uid = v_u for update;
  if not found then return json_build_object('status','gone'); end if;
  select * into r from public.ctm_room where id = p_room;
  if r.st <> 'done' then return json_build_object('status','notdone'); end if;
  if me.claimed then
    if me.claim_n < 2 and me.claim_res is not null then
      update public.ctm_member set claim_n = claim_n + 1 where room_id = p_room and uid = v_u;
      return me.claim_res::json;
    end if;
    return json_build_object('status','dup');
  end if;
  if me.at < now() - interval '30 seconds' or coalesce((me.state->>'left')::int, 0) = 1 then
    v_res := json_build_object('status','afk');
    update public.ctm_member set claimed = true, claim_res = v_res::jsonb, claim_n = 1 where room_id = p_room and uid = v_u;
    return v_res;
  end if;
  v_win := (r.winner = me.side);
  insert into public.ctm_day(uid, day, n) values (v_u, v_d, 0) on conflict do nothing;
  select n into v_n from public.ctm_day where uid = v_u and day = v_d for update;
  if v_n >= c_cap then
    v_res := json_build_object('status','ok','capped',true,'win',v_win,'winner',r.winner);
  else
    update public.ctm_day set n = n + 1 where uid = v_u and day = v_d;
    v_res := json_build_object('status','ok','capped',false,'win',v_win,'winner',r.winner,
      'chests', case when v_win then 2 else 1 end,'left', c_cap - v_n - 1);
  end if;
  update public.ctm_member set claimed = true, claim_res = v_res::jsonb, claim_n = 1 where room_id = p_room and uid = v_u;
  return v_res;
end $$;

revoke all on function
  public.ctm_join(int, text, text), public.ctm_sync(bigint, jsonb),
  public.ctm_leave(bigint), public.ctm_claim(bigint)
from public, anon;
grant execute on function
  public.ctm_join(int, text, text), public.ctm_sync(bigint, jsonb),
  public.ctm_leave(bigint), public.ctm_claim(bigint)
to authenticated;
