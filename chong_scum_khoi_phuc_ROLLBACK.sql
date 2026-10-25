-- Hoàn tác Fix429: trả list_snapshots/restore_snapshot về bản luu_mang_bao_ve_v3.sql (chạy lại file đó), bỏ restore_status & log.
drop function if exists public.restore_status();
-- restore_backup: nếu trước đó server có bản riêng thì dán lại bản đó; nếu không có thể để nguyên.
-- drop table if exists public.restore_log;  -- chỉ bỏ nếu không cần nhật ký
