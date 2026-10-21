-- =====================================================================
-- Fix392 — Admin tặng nguyên liệu Tinh Luyện Pháp Bảo Bổn Mệnh (kho Tuyết Ngục, nằm trên máy chủ)
--   ❄ Tuyết Tinh (mt_tt) · 🔷 Hàn Ngọc Tủy (mt_hn) · 🌙 Huyết Nguyệt Hạch (mt_hh)
-- Chạy 1 lần trong Supabase SQL Editor, SAU admin.sql và tuyet_nguc.sql (an toàn chạy lại).
-- Chỉ admin gọi được (kiểm tra _admin_chk). Mỗi lần cộng tối đa 100.000 mỗi loại; ghi nhật ký admin.
-- =====================================================================
create or replace function public.admin_tang_tn(p_uid uuid, p_tt int default 0, p_hn int default 0, p_hh int default 0) returns json
language plpgsql security definer set search_path = public as $$
declare r public.tn_user;
begin
  perform public._admin_chk();
  if p_uid is null then raise exception 'BAD_ARGS'; end if;
  if not exists(select 1 from auth.users where id = p_uid) then raise exception 'NO_USER'; end if;
  p_tt := coalesce(p_tt, 0); p_hn := coalesce(p_hn, 0); p_hh := coalesce(p_hh, 0);
  if p_tt < 0 or p_hn < 0 or p_hh < 0 or (p_tt + p_hn + p_hh) = 0 then raise exception 'BAD_ARGS'; end if;
  if p_tt > 100000 or p_hn > 100000 or p_hh > 100000 then raise exception 'AMOUNT_TOO_BIG'; end if;
  perform public.tn_touch(p_uid);
  update public.tn_user
     set mt_tt = mt_tt + p_tt, mt_hn = mt_hn + p_hn, mt_hh = mt_hh + p_hh
   where uid = p_uid
  returning * into r;
  perform public._admin_log('tn', p_uid, jsonb_build_object('tt', p_tt, 'hn', p_hn, 'hh', p_hh));
  return json_build_object('tt', r.mt_tt, 'hn', r.mt_hn, 'hh', r.mt_hh);
end $$;

revoke all on function public.admin_tang_tn(uuid, int, int, int) from public, anon;
grant execute on function public.admin_tang_tn(uuid, int, int, int) to authenticated;
