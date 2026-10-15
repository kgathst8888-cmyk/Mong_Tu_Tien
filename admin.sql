-- =====================================================================
-- TRANG ADMIN (quản lý tài khoản · Linh Thạch · gửi quà) — Supabase
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
--
-- Điều kiện: đã chạy phien_dang_nhap.sql, cho_giao_dich.sql, chat.sql (và thong_bao_thu.sql, hoặc để file này tự tạo bảng thong_bao).
--
-- Cách hoạt động
--   * Chỉ tài khoản có trong bảng kthm_admin mới gọi được các hàm admin_*. Người chơi thường gọi sẽ bị NOT_ADMIN.
--   * Giao diện 🛡 Admin trong game (ui/70-admin-panel.js) chỉ hiện nút khi admin_is() = true.
--   * Mọi thao tác ghi vào kthm_admin_log (xem trong tab Nhật ký).
--
-- BƯỚC CUỐI (bắt buộc): tự cấp quyền admin cho tài khoản của bạn — đổi email rồi chạy:
--   insert into public.kthm_admin(uid, note) select id, 'chủ game' from auth.users where email = 'EMAIL_CUA_BAN@gmail.com'
--     on conflict do nothing;
-- Thu quyền:  delete from public.kthm_admin where uid = '<uuid>';
-- =====================================================================

-- ---------- bảng ----------
create table if not exists public.kthm_admin(
  uid   uuid primary key,
  note  text,
  since timestamptz not null default now()
);
create table if not exists public.kthm_admin_log(
  id     bigserial primary key,
  at     timestamptz not null default now(),
  admin  uuid,
  act    text not null,
  target uuid,
  detail jsonb
);
alter table public.kthm_admin     enable row level security;
alter table public.kthm_admin_log enable row level security;
revoke all on public.kthm_admin, public.kthm_admin_log from anon, authenticated;

-- thông báo/thư hệ thống (giống thong_bao_thu.sql) + cột uid để gửi riêng cho 1 tài khoản
create table if not exists public.thong_bao(
  id        bigserial primary key,
  loai      text not null default 'tb' check (loai in ('tb','thu')),
  tieu_de   text not null,
  noi_dung  text not null default '',
  qua       jsonb,
  tao_luc   timestamptz not null default now(),
  het_han   timestamptz
);
alter table public.thong_bao enable row level security;
alter table public.thong_bao add column if not exists uid uuid;   -- null = gửi tất cả

-- lay_thong_bao: người chơi chỉ thấy thư chung (uid null) hoặc thư gửi riêng cho mình
create or replace function public.lay_thong_bao() returns jsonb
language sql security definer set search_path=public as $$
  select coalesce(jsonb_agg(to_jsonb(t) order by t.id desc),'[]'::jsonb)
  from (select id,loai,tieu_de,noi_dung,qua,tao_luc from public.thong_bao
        where (het_han is null or het_han>now()) and (uid is null or uid = auth.uid())
        order by id desc limit 30) t
$$;
grant execute on function public.lay_thong_bao() to anon, authenticated;

-- ---------- kiểm tra quyền ----------
create or replace function public.admin_is() returns boolean
language plpgsql security definer set search_path = public stable as $$
begin
  return auth.uid() is not null and exists(select 1 from public.kthm_admin where uid = auth.uid());
end $$;

create or replace function public._admin_chk() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists(select 1 from public.kthm_admin where uid = auth.uid()) then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;
end $$;

create or replace function public._admin_log(p_act text, p_target uuid, p_detail jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.kthm_admin_log(admin, act, target, detail) values (auth.uid(), p_act, p_target, p_detail);
end $$;

-- ---------- tìm tài khoản ----------
-- p_q: một phần email, hoặc uuid, hoặc ':online' (đang online trong 3 phút gần nhất), để trống = mới đăng nhập gần nhất
create or replace function public.admin_find(p_q text default '') returns json
language plpgsql security definer set search_path = public as $$
declare r json; q text := coalesce(trim(p_q), '');
begin
  perform public._admin_chk();
  select coalesce(json_agg(t), '[]'::json) into r from (
    select u.id, u.email, u.created_at, u.last_sign_in_at, u.banned_until,
           coalesce(w.lt, 0) as lt,
           (s.seen is not null and s.seen > now() - interval '3 minutes') as online,
           s.device, s.seen,
           (b.uid is not null and (b.until is null or b.until > now())) as chat_ban,
           exists(select 1 from public.kthm_admin a where a.uid = u.id) as is_admin
      from auth.users u
      left join public.cho_wallet   w on w.uid = u.id
      left join public.kthm_session s on s.uid = u.id
      left join public.chat_bans    b on b.uid = u.id
     where case when q = ':online' then (s.seen is not null and s.seen > now() - interval '3 minutes')
                else (q = '' or u.email ilike '%' || q || '%' or u.id::text = q) end
     order by u.last_sign_in_at desc nulls last
     limit 30) t;
  return r;
end $$;

-- ---------- Linh Thạch (cộng: số dương · trừ: số âm; ví không xuống dưới 0) ----------
create or replace function public.admin_grant_lt(p_uid uuid, p_amt bigint) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  perform public._admin_chk();
  if p_uid is null or p_amt is null or p_amt = 0 then raise exception 'BAD_ARGS'; end if;
  if abs(p_amt) > 100000000 then raise exception 'AMOUNT_TOO_BIG'; end if;
  if not exists(select 1 from auth.users where id = p_uid) then raise exception 'NO_USER'; end if;
  v := public.cho_admin_grant(p_uid, p_amt);
  perform public._admin_log('lt', p_uid, jsonb_build_object('amt', p_amt, 'after', v));
  return v;
end $$;

-- ---------- thư quà ----------
-- p_uid null = gửi tất cả · p_qua: {"gold":..,"csh":{"b10":1,..},"fe":..,"hk":..,"eq":{"r":0-5,"n":1-20}} · p_days 1..14
create or replace function public.admin_send_mail(p_uid uuid, p_title text, p_body text, p_qua jsonb, p_days int default 14) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint; d int := least(greatest(coalesce(p_days, 14), 1), 14);
begin
  perform public._admin_chk();
  if coalesce(trim(p_title), '') = '' then raise exception 'NO_TITLE'; end if;
  if p_uid is not null and not exists(select 1 from auth.users where id = p_uid) then raise exception 'NO_USER'; end if;
  insert into public.thong_bao(loai, tieu_de, noi_dung, qua, het_han, uid)
    values ('thu', left(p_title, 80), left(coalesce(p_body, ''), 2000), p_qua, now() + make_interval(days => d), p_uid)
    returning id into v;
  perform public._admin_log('mail', p_uid, jsonb_build_object('id', v, 'title', left(p_title, 80), 'qua', p_qua, 'days', d));
  return v;
end $$;

create or replace function public.admin_list_mail() returns json
language plpgsql security definer set search_path = public as $$
declare r json;
begin
  perform public._admin_chk();
  select coalesce(json_agg(t), '[]'::json) into r from (
    select m.id, m.tieu_de, m.noi_dung, m.qua, m.tao_luc, m.het_han, m.uid, u.email,
           (m.het_han is not null and m.het_han <= now()) as expired
      from public.thong_bao m left join auth.users u on u.id = m.uid
     where m.loai = 'thu' order by m.id desc limit 30) t;
  return r;
end $$;

-- thu hồi thư CHƯA nhận (xoá thư khỏi máy chủ; người đã nhận quà rồi thì không thu lại được)
create or replace function public.admin_del_mail(p_id bigint) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public._admin_chk();
  delete from public.thong_bao where id = p_id and loai = 'thu';
  get diagnostics n = row_count;
  if n > 0 then perform public._admin_log('mail_del', null, jsonb_build_object('id', p_id)); end if;
  return n > 0;
end $$;

-- ---------- phiên / khoá / cấm chat ----------
create or replace function public.admin_kick(p_uid uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public._admin_chk();
  delete from public.kthm_session where uid = p_uid;
  get diagnostics n = row_count;
  perform public._admin_log('kick', p_uid, null);
  return n > 0;
end $$;

-- khoá đăng nhập p_hours giờ (876000 ≈ vĩnh viễn) · p_hours null hoặc <=0 = mở khoá
create or replace function public.admin_ban(p_uid uuid, p_hours int) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v timestamptz;
begin
  perform public._admin_chk();
  if exists(select 1 from public.kthm_admin where uid = p_uid) then raise exception 'CANNOT_TARGET_ADMIN'; end if;
  if p_hours is null or p_hours <= 0 then v := null; else v := now() + make_interval(hours => least(p_hours, 876000)); end if;
  update auth.users set banned_until = v where id = p_uid;
  if v is not null then delete from public.kthm_session where uid = p_uid; end if;   -- đá khỏi game ngay
  perform public._admin_log(case when v is null then 'unban' else 'ban' end, p_uid, jsonb_build_object('until', v));
  return v;
end $$;

-- cấm chat p_hours giờ · null hoặc <=0 = gỡ cấm
create or replace function public.admin_chat_ban(p_uid uuid, p_hours int, p_note text default null) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_chk();
  if p_hours is null or p_hours <= 0 then
    delete from public.chat_bans where uid = p_uid;
    perform public._admin_log('chat_unban', p_uid, null);
    return false;
  end if;
  insert into public.chat_bans(uid, until, note) values (p_uid, now() + make_interval(hours => least(p_hours, 876000)), left(p_note, 200))
    on conflict (uid) do update set until = excluded.until, note = excluded.note;
  perform public._admin_log('chat_ban', p_uid, jsonb_build_object('hours', p_hours));
  return true;
end $$;

-- ---------- nhật ký ----------
create or replace function public.admin_logs() returns json
language plpgsql security definer set search_path = public as $$
declare r json;
begin
  perform public._admin_chk();
  select coalesce(json_agg(t), '[]'::json) into r from (
    select l.id, l.at, l.act, l.detail, a.email as admin_email, u.email as target_email
      from public.kthm_admin_log l
      left join auth.users a on a.id = l.admin
      left join auth.users u on u.id = l.target
     order by l.id desc limit 40) t;
  return r;
end $$;

-- ---------- quyền gọi ----------
revoke all on function public.admin_is(), public._admin_chk(), public._admin_log(text,uuid,jsonb),
  public.admin_find(text), public.admin_grant_lt(uuid,bigint), public.admin_send_mail(uuid,text,text,jsonb,int),
  public.admin_list_mail(), public.admin_del_mail(bigint), public.admin_kick(uuid), public.admin_ban(uuid,int),
  public.admin_chat_ban(uuid,int,text), public.admin_logs() from public, anon, authenticated;
grant execute on function public.admin_is(), public.admin_find(text), public.admin_grant_lt(uuid,bigint),
  public.admin_send_mail(uuid,text,text,jsonb,int), public.admin_list_mail(), public.admin_del_mail(bigint),
  public.admin_kick(uuid), public.admin_ban(uuid,int), public.admin_chat_ban(uuid,int,text), public.admin_logs()
  to authenticated;

-- ---------- thông báo toàn game (mục 📢 Thông báo) ----------
-- p_days: số ngày hiển thị (1..365); null hoặc <=0 = không hết hạn
create or replace function public.admin_send_notice(p_title text, p_body text, p_days int default 7) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  perform public._admin_chk();
  if coalesce(trim(p_title), '') = '' then raise exception 'NO_TITLE'; end if;
  insert into public.thong_bao(loai, tieu_de, noi_dung, het_han, uid)
    values ('tb', left(p_title, 80), left(coalesce(p_body, ''), 3000),
            case when p_days is null or p_days <= 0 then null else now() + make_interval(days => least(p_days, 365)) end, null)
    returning id into v;
  perform public._admin_log('notice', null, jsonb_build_object('id', v, 'title', left(p_title, 80), 'days', p_days));
  return v;
end $$;

create or replace function public.admin_list_notice() returns json
language plpgsql security definer set search_path = public as $$
declare r json;
begin
  perform public._admin_chk();
  select coalesce(json_agg(t), '[]'::json) into r from (
    select id, tieu_de, noi_dung, tao_luc, het_han, (het_han is not null and het_han <= now()) as expired
      from public.thong_bao where loai = 'tb' order by id desc limit 30) t;
  return r;
end $$;

create or replace function public.admin_del_notice(p_id bigint) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public._admin_chk();
  delete from public.thong_bao where id = p_id and loai = 'tb';
  get diagnostics n = row_count;
  if n > 0 then perform public._admin_log('notice_del', null, jsonb_build_object('id', p_id)); end if;
  return n > 0;
end $$;

revoke all on function public.admin_send_notice(text,text,int), public.admin_list_notice(), public.admin_del_notice(bigint) from public, anon, authenticated;
grant execute on function public.admin_send_notice(text,text,int), public.admin_list_notice(), public.admin_del_notice(bigint) to authenticated;

notify pgrst, 'reload schema';
