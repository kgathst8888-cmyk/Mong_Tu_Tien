-- Fix379 — Đồng hồ máy chủ (TUỲ CHỌN). Chỉ cần chạy nếu trình duyệt không đọc được tiêu đề `Date` của Supabase.
-- Trả mili-giây epoch theo giờ máy chủ để core/00b-dong-ho-tin-cay.js hiệu chỉnh giờ máy người chơi.
create or replace function public.kthm_now() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('ms', (extract(epoch from clock_timestamp())*1000)::bigint)
$$;
revoke all on function public.kthm_now() from public;
grant execute on function public.kthm_now() to authenticated;
-- Rollback: drop function if exists public.kthm_now();
