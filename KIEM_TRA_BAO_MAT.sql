-- KIỂM TRA BẢO MẬT (CHỈ ĐỌC, chạy trong Supabase SQL Editor bất cứ lúc nào, nhất là sau mỗi file SQL mới)
-- Mong đợi: mục 1 và 2 trả về 0 dòng; mục 3 chỉ liệt kê bảng bạn chủ ý mở.

-- 1) Hàm SECURITY DEFINER mà người chơi đăng nhập gọi được NHƯNG tên giống hàm nội bộ/admin
--    (nội bộ: bắt đầu bằng '_', hoặc admin_*, *_unlock, *_scan, *_grant, *_strike). admin_* phải có _admin_chk() bên trong.
select p.oid::regprocedure as ham, 'GOI_DUOC_BOI_authenticated' as van_de,
       (pg_get_functiondef(p.oid) ilike '%_admin_chk()%') as co__admin_chk
from pg_proc p join pg_namespace s on s.oid = p.pronamespace
where s.nspname = 'public' and p.prosecdef
  and has_function_privilege('authenticated', p.oid, 'execute')
  and pg_get_functiondef(p.oid) not ilike '%_admin_chk()%'
  and (p.proname like '\_%' or p.proname like '%strike%' or p.proname like '%\_grant%' or p.proname like '%\_scan'
       or p.proname like 'admin\_%')
  and p.proname <> 'admin_is';

-- 2) Hàm SECURITY DEFINER chưa cố định search_path
select p.oid::regprocedure as ham, 'THIEU_search_path' as van_de
from pg_proc p join pg_namespace s on s.oid = p.pronamespace
where s.nspname = 'public' and p.prosecdef and p.proconfig is null;

-- 3) Bảng public chưa bật RLS (nếu có = ai cũng đọc/ghi được qua REST)
select c.relname as bang, 'CHUA_BAT_RLS' as van_de
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
