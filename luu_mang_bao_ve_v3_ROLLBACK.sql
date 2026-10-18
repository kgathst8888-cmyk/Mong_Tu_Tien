-- Hoàn tác Fix297: bỏ trigger/bảng guard; khôi phục list_snapshots + restore_snapshot về bản Fix293 (chạy lại phần cuối luu_mang_snapshot_v2.sql)
drop trigger if exists saves_guard_before_update on public.saves;
drop function if exists public.saves_guard_trg();
-- (tuỳ chọn, MẤT các ảnh chụp guard)  drop table if exists public.saves_guard;
-- Sau đó chạy lại hai hàm list_snapshots / restore_snapshot trong luu_mang_snapshot_v2.sql
