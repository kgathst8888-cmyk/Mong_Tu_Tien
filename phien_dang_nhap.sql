-- =====================================================================
-- PHIÊN CHƠI DUY NHẤT (đăng nhập bắt buộc) — Supabase
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
--
-- Cách hoạt động
--   * Mỗi tài khoản (auth.users) chỉ có 1 dòng trong kthm_session = phiên chơi đang hiệu lực (sid).
--   * Game đăng nhập bằng Supabase Auth rồi gọi kthm_claim_session(sid mới): máy MỚI thay thế phiên cũ (chính sách "máy mới thắng").
--   * Mọi request có đăng nhập từ game đều kèm header  x-session-id: <sid>.
--   * kthm_check_session() được PostgREST gọi TRƯỚC MỌI request (db_pre_request): nếu người dùng đã đăng nhập mà sid thiếu/không khớp
--     phiên hiệu lực → từ chối ngay với HTTP 409 "SESSION_INVALID". Vì vậy máy cũ không thể TẢI hay CẬP NHẬT dữ liệu nhân vật
--     (pull_save, push_save, chợ, chat, xếp hạng… đều bị chặn) cho đến khi đăng nhập lại.
--   * Bản game cũ (không gửi x-session-id) cũng bị chặn → phải cập nhật bản mới.
--   * Khách (chưa đăng nhập, vai trò anon) không bị ảnh hưởng (vd. xem bảng xếp hạng công khai).
--
-- Tắt (nếu cần quay lại):
--   alter role authenticator reset pgrst.db_pre_request;  notify pgrst, 'reload config';
-- =====================================================================

create table if not exists public.kthm_session(
  uid    uuid primary key,
  sid    text        not null,
  device text,
  since  timestamptz not null default now(),   -- thời điểm phiên này bắt đầu
  seen   timestamptz not null default now()    -- lần cuối máy này báo còn hoạt động
);
alter table public.kthm_session enable row level security;
revoke all on public.kthm_session from anon, authenticated;

-- Kiểm tra phiên: chạy trước mọi request API
create or replace function public.kthm_check_session() returns void
language plpgsql security definer set search_path = public as $$
declare v_claims json; v_uid uuid; v_path text; v_sid text; v_cur text;
begin
  begin v_claims := nullif(current_setting('request.jwt.claims', true), '')::json;
  exception when others then v_claims := null; end;
  if v_claims is null or (v_claims->>'role') is distinct from 'authenticated' then return; end if;   -- khách / service: bỏ qua
  v_uid := nullif(v_claims->>'sub', '')::uuid;
  if v_uid is null then return; end if;
  v_path := coalesce(current_setting('request.path', true), '');
  if v_path in ('/rpc/kthm_claim_session', '/rpc/kthm_session_status', '/rpc/kthm_end_session') then return; end if;  -- 3 hàm quản lý phiên
  begin v_sid := (current_setting('request.headers', true)::json) ->> 'x-session-id';
  exception when others then v_sid := null; end;
  select sid into v_cur from public.kthm_session where uid = v_uid;
  if v_sid is null or v_cur is null or v_sid <> v_cur then
    raise exception 'SESSION_INVALID' using errcode = 'PT409', hint = 'Tài khoản đã đăng nhập ở máy khác hoặc chưa có phiên hợp lệ';
  end if;
end $$;
revoke all on function public.kthm_check_session() from public;
grant execute on function public.kthm_check_session() to anon, authenticated, service_role, authenticator;

-- Nhận phiên (đăng nhập máy mới → thay phiên cũ)
create or replace function public.kthm_claim_session(p_sid text, p_device text default null) returns json
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_old public.kthm_session%rowtype; v_rep boolean := false;
begin
  if v_uid is null then return json_build_object('status', 'auth'); end if;
  if p_sid is null or p_sid !~ '^[A-Za-z0-9_-]{16,64}$' then return json_build_object('status', 'bad'); end if;
  select * into v_old from public.kthm_session where uid = v_uid for update;
  v_rep := found and v_old.sid <> p_sid;
  insert into public.kthm_session(uid, sid, device, since, seen)
  values (v_uid, p_sid, left(coalesce(p_device, ''), 80), now(), now())
  on conflict (uid) do update
    set sid = excluded.sid, device = excluded.device,
        since = case when public.kthm_session.sid = excluded.sid then public.kthm_session.since else now() end,
        seen = now();
  return json_build_object('status', 'ok', 'replaced', v_rep,
    'prev_seen', case when v_rep then extract(epoch from v_old.seen)::bigint end,
    'prev_device', case when v_rep then v_old.device end);
end $$;

-- Máy này còn là phiên hiệu lực không? (đồng thời báo "còn hoạt động")
create or replace function public.kthm_session_status(p_sid text) returns json
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_ok boolean := false;
begin
  if v_uid is null then return json_build_object('valid', false, 'status', 'auth'); end if;
  update public.kthm_session set seen = now() where uid = v_uid and sid = p_sid returning true into v_ok;
  return json_build_object('valid', coalesce(v_ok, false));
end $$;

-- Đăng xuất: giải phóng phiên (chỉ khi đúng sid của máy này)
create or replace function public.kthm_end_session(p_sid text) returns json
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return json_build_object('status', 'auth'); end if;
  delete from public.kthm_session where uid = v_uid and sid = p_sid;
  return json_build_object('status', 'ok');
end $$;

revoke all on function public.kthm_claim_session(text, text), public.kthm_session_status(text), public.kthm_end_session(text) from public, anon;
grant execute on function public.kthm_claim_session(text, text), public.kthm_session_status(text), public.kthm_end_session(text) to authenticated;

-- Bật kiểm tra phiên cho MỌI request API
alter role authenticator set pgrst.db_pre_request = 'public.kthm_check_session';
notify pgrst, 'reload config';
