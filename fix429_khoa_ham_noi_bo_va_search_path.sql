-- Fix429b · KHOÁ HÀM NỘI BỘ + CỐ ĐỊNH search_path  (ĐÃ ĐẨY LÊN SUPABASE 2026-10-26; an toàn chạy lại)
-- Lỗ hổng: _kthm_strike(uid, kind, score, detail) là SECURITY DEFINER nhưng 'authenticated' vẫn gọi được qua
--          /rest/v1/rpc/_kthm_strike (chong_hack_khoa_tk.sql chỉ thu quyền của public/anon, mà Supabase cấp sẵn cho authenticated).
--          => bất kỳ người chơi đăng nhập nào cũng có thể "phạt điểm" tài khoản người khác để khoá họ 100 năm.
-- Vá:      1) _kthm_strike chỉ còn service_role + hàm SECURITY DEFINER khác (kthm_report_cheat...) dùng được.
--          2) Mọi hàm trigger SECURITY DEFINER trong public: thu quyền gọi qua RPC (trigger vẫn chạy bình thường).
--          3) Cố định search_path cho 7 hàm tiện ích còn để mặc định.
-- Client KHÔNG gọi các hàm này (đã grep) nên không ảnh hưởng game.
do $$
declare r record;
begin
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace s on s.oid=p.pronamespace
           where s.nspname='public' and p.proname in ('_kthm_strike')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
    execute format('grant execute on function %s to service_role', r.sig);
  end loop;

  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace s on s.oid=p.pronamespace
           where s.nspname='public' and p.prosecdef and p.prorettype = 'pg_catalog.trigger'::regtype
  loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
  end loop;

  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace s on s.oid=p.pronamespace
           where s.nspname='public'
             and p.proname in ('boss_day','_gc_norm','hcb_k','hcb_phase','hcb_roll','hcb_cur','lm_k')
  loop
    execute format('alter function %s set search_path = public, pg_catalog', r.sig);
  end loop;
end $$;
