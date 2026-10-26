-- Hoàn tác Fix429b: trả quyền cũ (KHÔNG khuyến nghị: mở lại lỗ hổng khoá tài khoản người khác)
grant execute on function public._kthm_strike(uuid, text, integer, jsonb) to authenticated;
