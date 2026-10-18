-- =====================================================================
-- MÃ QUÀ TẶNG (gift code) — Supabase
-- Chạy 1 lần: Supabase → SQL Editor → New query → dán toàn bộ → Run. An toàn khi chạy lại.
--
-- Điều kiện: đã chạy cho_giao_dich.sql (ví Linh Thạch) và admin.sql (hàm _admin_chk, _admin_log).
--
-- Cách hoạt động
--   * Admin tạo mã ở game: 🛡 Admin → tab 🎟 Mã quà (quà = vàng/vật phẩm/rương giống thư quà, thêm Linh Thạch tuỳ chọn).
--   * Người chơi bấm nút 🎟 Mã quà → nhập mã → máy chủ kiểm tra (đúng mã, còn hạn, còn lượt, tài khoản này chưa dùng).
--   * Mỗi TÀI KHOẢN dùng 1 mã đúng 1 lần (không phải mỗi nhân vật). Mã có thể giới hạn tổng số lượt dùng và hạn dùng.
--   * Linh Thạch (nếu có) được cộng thẳng vào ví KHÔNG KHOÁ ngay trên máy chủ. Phần còn lại gửi về Hòm Thư của
--     nhân vật đang chơi để bấm Nhận (có kiểm tra túi đầy).
--   * Nhập sai quá 8 lần trong 10 phút → tạm khoá nhập mã (chống dò mã).
--   * Nếu game bị tắt đúng lúc đang nhận, nhập lại mã sẽ được giao lại quà (chỉ khi lần trước chưa xác nhận xong).
-- =====================================================================

-- ---------- bảng ----------
create table if not exists public.kthm_giftcode(
  code     text primary key,                       -- CHỮ HOA, không dấu cách
  tieu_de  text not null default 'Quà Mã Quà Tặng',
  qua      jsonb,                                  -- cùng dạng quà của thư: {gold,csh,fe,hk,eq,it}
  lt       bigint not null default 0,              -- Linh Thạch cộng thẳng vào ví không khoá
  max_uses int,                                    -- null = không giới hạn số lượt
  used     int not null default 0,
  bat_dau  timestamptz,                            -- null = dùng được ngay
  het_han  timestamptz,                            -- null = không hết hạn
  active   boolean not null default true,
  note     text,
  tao_luc  timestamptz not null default now(),
  tao_boi  uuid
);
create table if not exists public.kthm_giftcode_use(
  code    text not null references public.kthm_giftcode(code) on delete cascade,
  uid     uuid not null,
  at      timestamptz not null default now(),
  claimed boolean not null default false,          -- true khi game đã xác nhận nhận xong
  primary key(code, uid)
);
create table if not exists public.kthm_giftcode_try(
  id  bigserial primary key,
  uid uuid not null,
  at  timestamptz not null default now()
);
create index if not exists kthm_giftcode_try_uid_at on public.kthm_giftcode_try(uid, at desc);

alter table public.kthm_giftcode     enable row level security;
alter table public.kthm_giftcode_use enable row level security;
alter table public.kthm_giftcode_try enable row level security;
revoke all on public.kthm_giftcode, public.kthm_giftcode_use, public.kthm_giftcode_try from anon, authenticated;

-- ---------- chuẩn hoá mã ----------
create or replace function public._gc_norm(p text) returns text
language sql immutable as $$
  select upper(regexp_replace(coalesce(p,''), '[\s]+', '', 'g'))
$$;

-- ---------- NGƯỜI CHƠI: nhập mã ----------
-- Trả về jsonb: {ok:true, code, title, qua, lt, again} hoặc {ok:false, err:'...'}
-- err: NOT_LOGGED_IN · BAD_CODE · TOO_MANY · INVALID_CODE · DISABLED · NOT_STARTED · EXPIRED · SOLD_OUT · ALREADY_USED
create or replace function public.redeem_giftcode(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_c   text := public._gc_norm(p_code);
  g     public.kthm_giftcode%rowtype;
  u     public.kthm_giftcode_use%rowtype;
  fails int;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'err', 'NOT_LOGGED_IN'); end if;
  if length(v_c) < 3 or length(v_c) > 40 then return jsonb_build_object('ok', false, 'err', 'BAD_CODE'); end if;

  -- chống dò mã: đếm lần nhập SAI trong 10 phút
  delete from public.kthm_giftcode_try where at < now() - interval '1 day';
  select count(*) into fails from public.kthm_giftcode_try where uid = v_uid and at > now() - interval '10 minutes';
  if fails >= 8 then return jsonb_build_object('ok', false, 'err', 'TOO_MANY'); end if;

  select * into g from public.kthm_giftcode where code = v_c for update;
  if not found then
    insert into public.kthm_giftcode_try(uid) values (v_uid);
    return jsonb_build_object('ok', false, 'err', 'INVALID_CODE');
  end if;

  if not g.active then return jsonb_build_object('ok', false, 'err', 'DISABLED'); end if;
  if g.bat_dau is not null and g.bat_dau > now() then return jsonb_build_object('ok', false, 'err', 'NOT_STARTED'); end if;
  if g.het_han is not null and g.het_han < now() then return jsonb_build_object('ok', false, 'err', 'EXPIRED'); end if;

  select * into u from public.kthm_giftcode_use where code = v_c and uid = v_uid;
  if found then
    if u.claimed then return jsonb_build_object('ok', false, 'err', 'ALREADY_USED'); end if;
    -- lần trước đã trừ lượt + cộng Linh Thạch nhưng game chưa xác nhận nhận quà → giao lại phần quà gửi thư
    return jsonb_build_object('ok', true, 'again', true, 'code', g.code, 'title', g.tieu_de, 'qua', g.qua, 'lt', 0);
  end if;

  if g.max_uses is not null and g.used >= g.max_uses then return jsonb_build_object('ok', false, 'err', 'SOLD_OUT'); end if;

  insert into public.kthm_giftcode_use(code, uid) values (v_c, v_uid);
  update public.kthm_giftcode set used = used + 1 where code = v_c;
  if g.lt > 0 then perform public.cho_admin_grant(v_uid, g.lt); end if;

  return jsonb_build_object('ok', true, 'again', false, 'code', g.code, 'title', g.tieu_de, 'qua', g.qua, 'lt', g.lt);
end $$;

-- game gọi sau khi đã đưa quà vào thư + lưu xong
create or replace function public.gc_confirm(p_code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then return false; end if;
  update public.kthm_giftcode_use set claimed = true where code = public._gc_norm(p_code) and uid = auth.uid();
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- ---------- ADMIN ----------
-- Tạo mã. p_count = 1: dùng p_code (để trống = tự sinh). p_count > 1: tự sinh p_count mã, mỗi mã dùng được 1 lần.
-- Trả về mảng các mã vừa tạo.
create or replace function public.admin_gc_create(
  p_code text, p_title text, p_qua jsonb, p_lt bigint, p_max int, p_days int, p_note text, p_count int default 1
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  n      int := least(greatest(coalesce(p_count, 1), 1), 200);
  v_lt   bigint := coalesce(p_lt, 0);
  v_exp  timestamptz := case when coalesce(p_days, 0) > 0 then now() + make_interval(days => least(p_days, 3650)) else null end;
  v_max  int := case when coalesce(p_max, 0) > 0 then p_max else null end;
  v_code text;
  out_codes jsonb := '[]'::jsonb;
  alpha  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   -- bỏ I, O, 0, 1 cho dễ đọc
  i int; k int; tries int;
begin
  perform public._admin_chk();
  if p_qua is not null and jsonb_typeof(p_qua) <> 'object' then raise exception 'BAD_QUA'; end if;
  if p_qua is not null and (p_qua - array['gold','csh','fe','hk','eq','it']) <> '{}'::jsonb then raise exception 'BAD_QUA'; end if;
  if p_qua = '{}'::jsonb then p_qua := null; end if;
  if v_lt < 0 or v_lt > 100000000 then raise exception 'AMOUNT_TOO_BIG'; end if;
  if p_qua is null and v_lt = 0 then raise exception 'NO_REWARD'; end if;

  if n > 1 then v_max := 1; end if;
  for i in 1..n loop
    if n = 1 and public._gc_norm(p_code) <> '' then
      v_code := public._gc_norm(p_code);
      if length(v_code) < 3 or length(v_code) > 40 or v_code !~ '^[A-Z0-9_-]+$' then raise exception 'BAD_CODE'; end if;
      if exists(select 1 from public.kthm_giftcode where code = v_code) then raise exception 'CODE_EXISTS'; end if;
    else
      tries := 0;
      loop
        v_code := 'KT';
        for k in 1..10 loop v_code := v_code || substr(alpha, 1 + floor(random() * length(alpha))::int, 1); end loop;
        exit when not exists(select 1 from public.kthm_giftcode where code = v_code);
        tries := tries + 1;
        if tries > 20 then raise exception 'GEN_FAIL'; end if;
      end loop;
    end if;
    insert into public.kthm_giftcode(code, tieu_de, qua, lt, max_uses, het_han, note, tao_boi)
      values (v_code, left(coalesce(nullif(trim(p_title), ''), 'Quà Mã Quà Tặng'), 80), p_qua, v_lt, v_max, v_exp,
              left(coalesce(p_note, ''), 200), auth.uid());
    out_codes := out_codes || to_jsonb(v_code);
  end loop;

  perform public._admin_log('gc_new', null, jsonb_build_object('codes', case when n > 5 then jsonb_build_array(out_codes->0, '…', n) else out_codes end,
    'qua', p_qua, 'lt', v_lt, 'max', v_max, 'het_han', v_exp));
  return out_codes;
end $$;

create or replace function public.admin_gc_list() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_chk();
  return coalesce((
    select jsonb_agg(to_jsonb(t) order by t.tao_luc desc)
    from (select code, tieu_de, qua, lt, max_uses, used, het_han, active, note, tao_luc,
                 (het_han is not null and het_han < now()) as expired
          from public.kthm_giftcode order by tao_luc desc limit 200) t
  ), '[]'::jsonb);
end $$;

create or replace function public.admin_gc_set(p_code text, p_active boolean) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public._admin_chk();
  update public.kthm_giftcode set active = coalesce(p_active, false) where code = public._gc_norm(p_code);
  get diagnostics n = row_count;
  if n > 0 then perform public._admin_log('gc_set', null, jsonb_build_object('code', public._gc_norm(p_code), 'active', p_active)); end if;
  return n > 0;
end $$;

create or replace function public.admin_gc_del(p_code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public._admin_chk();
  delete from public.kthm_giftcode where code = public._gc_norm(p_code);
  get diagnostics n = row_count;
  if n > 0 then perform public._admin_log('gc_del', null, jsonb_build_object('code', public._gc_norm(p_code))); end if;
  return n > 0;
end $$;

-- ---------- quyền ----------
revoke all on function public._gc_norm(text) from public, anon, authenticated;
revoke all on function public.redeem_giftcode(text), public.gc_confirm(text),
  public.admin_gc_create(text,text,jsonb,bigint,int,int,text,int), public.admin_gc_list(),
  public.admin_gc_set(text,boolean), public.admin_gc_del(text) from public, anon;
grant execute on function public.redeem_giftcode(text), public.gc_confirm(text) to authenticated;
grant execute on function public.admin_gc_create(text,text,jsonb,bigint,int,int,text,int), public.admin_gc_list(),
  public.admin_gc_set(text,boolean), public.admin_gc_del(text) to authenticated;
