-- =====================================================================
-- TUYẾT NGỤC (Làng Tân Thủ 3 · Nhà Số 1) — Fix348
-- Supabase → SQL Editor → New query → dán toàn bộ → Run. AN TOÀN KHI CHẠY LẠI (giữ nguyên dữ liệu, chỉ thay hàm).
--
--   * tn_user : MỖI TÀI KHOẢN 1 dòng — lượt trong ngày (giờ VN), tầng cao nhất đã hạ, lượt đang mở,
--               kho nguyên liệu (❄ Tuyết Tinh · 🔷 Hàn Ngọc Tủy · 🌙 Huyết Nguyệt Hạch), bộ đếm bảo hiểm rơi đồ.
--   * Máy chủ TỰ QUAY phần thưởng (xác suất, hạn mức ngày, bảo hiểm) — máy khách chỉ báo "đã hạ boss".
--
--   Hằng số (đổi cả ở TNG_CF trong world/107-tuyet-nguc.js nếu sửa, vì bảng hiển thị tỉ lệ đọc từ đó):
--     3 lượt/ngày/tài khoản · 10 tầng · muốn vào tầng N phải đã hạ tầng N-1
--     vàng thưởng khi hạ: 2.000.000 + 1.000.000 × tầng (+5.000.000 nếu là lần đầu hạ tầng đó)
--     ❄ Tuyết Tinh      : tỉ lệ 22% + 4%/tầng (tối đa 60%) · tầng ≥ 6 có 25% ra 2 · tối đa 4/ngày
--     🔷 Hàn Ngọc Tủy   : từ tầng 3 · 6% + 1,5%/tầng · tối đa 2/ngày · bảo hiểm: 20 lần hạ liên tiếp không rơi → chắc chắn rơi
--     🌙 Huyết Nguyệt Hạch: từ tầng 7 · 1,5% + 0,5%/tầng · tối đa 1/ngày · bảo hiểm: 40 lần hạ liên tiếp không rơi → chắc chắn rơi
--     Lần đầu hạ 1 tầng: +2 ❄ (không tính hạn mức ngày); tầng 5: +1 🔷; tầng 10: +1 🌙
--     Báo hạ boss chỉ nhận trong khoảng 20 giây → 15 phút kể từ lúc vào (chống báo ngay lập tức).
--   Vàng + Linh Thạch phí vào trừ ở máy khách (giống Chiến Trường / Tông Môn); máy chủ giữ lượt, tầng, kho nguyên liệu.
-- =====================================================================
create table if not exists public.tn_user(
  uid       uuid primary key,
  day       date,
  used      int    not null default 0,
  best      int    not null default 0,
  run_tang  int,
  run_at    timestamptz,
  d_tt      int    not null default 0,
  d_hn      int    not null default 0,
  d_hh      int    not null default 0,
  mt_tt     bigint not null default 0,
  mt_hn     bigint not null default 0,
  mt_hh     bigint not null default 0,
  p_hn      int    not null default 0,
  p_hh      int    not null default 0,
  clears    bigint not null default 0
);
alter table public.tn_user enable row level security;
revoke all on public.tn_user from anon, authenticated;

-- ---------------------------------------------------------------------
-- Nội bộ (KHÔNG cấp cho máy khách): tạo dòng + sang ngày mới thì đặt lại lượt / hạn mức ngày
-- ---------------------------------------------------------------------
create or replace function public.tn_touch(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  insert into public.tn_user(uid, day) values (p_uid, v_today) on conflict (uid) do nothing;
  update public.tn_user
     set day = v_today, used = 0, d_tt = 0, d_hn = 0, d_hh = 0, run_tang = null, run_at = null
   where uid = p_uid and day is distinct from v_today;
end $$;

-- ---------------------------------------------------------------------
-- Xem trạng thái
-- ---------------------------------------------------------------------
create or replace function public.tn_me() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u;
  return json_build_object('status', 'ok', 'used', r.used, 'left', greatest(3 - r.used, 0), 'best', r.best,
    'tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh, 'dtt', r.d_tt, 'dhn', r.d_hn, 'dhh', r.d_hh);
end $$;

-- ---------------------------------------------------------------------
-- Kiểm tra trước khi trừ phí (không đổi dữ liệu)
-- ---------------------------------------------------------------------
create or replace function public.tn_precheck(p_tang int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_tang is null or p_tang < 1 or p_tang > 10 then return json_build_object('status', 'bad'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u;
  if p_tang > r.best + 1 then return json_build_object('status', 'locked', 'best', r.best); end if;
  if r.used >= 3 then return json_build_object('status', 'limit'); end if;
  return json_build_object('status', 'ok', 'left', 3 - r.used);
end $$;

-- ---------------------------------------------------------------------
-- Vào trận: trừ 1 lượt + mở 1 lượt chơi (gọi SAU khi máy khách đã trừ phí)
-- ---------------------------------------------------------------------
create or replace function public.tn_enter(p_tang int) returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid(); r public.tn_user;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  if p_tang is null or p_tang < 1 or p_tang > 10 then return json_build_object('status', 'bad'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u for update;
  if p_tang > r.best + 1 then return json_build_object('status', 'locked', 'best', r.best); end if;
  if r.used >= 3 then return json_build_object('status', 'limit'); end if;
  update public.tn_user set used = used + 1, run_tang = p_tang, run_at = now() where uid = v_u;
  return json_build_object('status', 'ok', 'left', 3 - (r.used + 1));
end $$;

-- ---------------------------------------------------------------------
-- Thua / hết giờ / rời trận: đóng lượt đang mở (lượt đã trừ, không hoàn)
-- ---------------------------------------------------------------------
create or replace function public.tn_fail() returns json
language plpgsql security definer set search_path = public as $$
declare v_u uuid := auth.uid();
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  update public.tn_user set run_tang = null, run_at = null where uid = v_u;
  return json_build_object('status', 'ok');
end $$;

-- ---------------------------------------------------------------------
-- Hạ boss: máy chủ quay phần thưởng, cộng vào kho
-- ---------------------------------------------------------------------
create or replace function public.tn_claim() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u uuid := auth.uid(); r public.tn_user; v_t int; v_el numeric; v_first boolean; v_gold bigint;
  g_tt int := 0; g_hn int := 0; g_hh int := 0;      -- rơi ngẫu nhiên
  b_tt int := 0; b_hn int := 0; b_hh int := 0;      -- thưởng lần đầu hạ tầng
  n_phn int; n_phh int;
begin
  if v_u is null then return json_build_object('status', 'auth'); end if;
  perform public.tn_touch(v_u);
  select * into r from public.tn_user where uid = v_u for update;
  if r.run_tang is null then return json_build_object('status', 'norun'); end if;

  v_t  := r.run_tang;
  v_el := extract(epoch from (now() - r.run_at));
  update public.tn_user set run_tang = null, run_at = null where uid = v_u;   -- lượt này đóng dù thành công hay không
  if v_el < 20 or v_el > 900 then return json_build_object('status', 'expired'); end if;

  v_first := v_t > r.best;

  -- ❄ Tuyết Tinh
  if r.d_tt < 4 and random() < least(0.60, 0.22 + 0.04 * (v_t - 1)) then
    g_tt := 1 + case when v_t >= 6 and random() < 0.25 then 1 else 0 end;
    g_tt := least(g_tt, 4 - r.d_tt);
  end if;
  -- 🔷 Hàn Ngọc Tủy (từ tầng 3)
  if v_t >= 3 and r.d_hn < 2 then
    if r.p_hn >= 20 or random() < 0.06 + 0.015 * (v_t - 3) then g_hn := 1; end if;
  end if;
  -- 🌙 Huyết Nguyệt Hạch (từ tầng 7)
  if v_t >= 7 and r.d_hh < 1 then
    if r.p_hh >= 40 or random() < 0.015 + 0.005 * (v_t - 7) then g_hh := 1; end if;
  end if;

  n_phn := case when v_t >= 3 then (case when g_hn > 0 then 0 else r.p_hn + 1 end) else r.p_hn end;
  n_phh := case when v_t >= 7 then (case when g_hh > 0 then 0 else r.p_hh + 1 end) else r.p_hh end;

  if v_first then
    b_tt := 2;
    if v_t = 5  then b_hn := 1; end if;
    if v_t = 10 then b_hh := 1; end if;
  end if;
  v_gold := 2000000 + 1000000 * v_t + case when v_first then 5000000 else 0 end;

  update public.tn_user set
    best   = greatest(best, v_t),
    clears = clears + 1,
    d_tt = d_tt + g_tt, d_hn = d_hn + g_hn, d_hh = d_hh + g_hh,
    mt_tt = mt_tt + g_tt + b_tt, mt_hn = mt_hn + g_hn + b_hn, mt_hh = mt_hh + g_hh + b_hh,
    p_hn = n_phn, p_hh = n_phh
  where uid = v_u
  returning * into r;

  return json_build_object(
    'status', 'ok', 'tang', v_t, 'first', v_first, 'gold', v_gold,
    'g',   json_build_object('tt', g_tt + b_tt, 'hn', g_hn + b_hn, 'hh', g_hh + b_hh),
    'tot', json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh),
    'best', r.best, 'left', greatest(3 - r.used, 0));
end $$;

-- ---------------------------------------------------------------------
-- Quyền: chỉ người đã đăng nhập gọi được; tn_touch là nội bộ
-- ---------------------------------------------------------------------
revoke all on function public.tn_touch(uuid) from public, anon, authenticated;
revoke all on function public.tn_me(), public.tn_precheck(int), public.tn_enter(int), public.tn_fail(), public.tn_claim() from public, anon;
grant execute on function public.tn_me(), public.tn_precheck(int), public.tn_enter(int), public.tn_fail(), public.tn_claim() to authenticated;
