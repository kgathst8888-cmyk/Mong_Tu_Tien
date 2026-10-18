-- Hoàn tác Fix293: trả push_save về bản cũ (chỉ snapshot hourly 48 bản), xoá list_snapshots/restore_snapshot.
create or replace function public.push_save(p_data jsonb, p_base_rev bigint, p_force boolean, p_backup boolean, p_name text, p_cls text, p_lv integer, p_tier integer, p_cr integer, p_cs integer)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  uid  uuid := auth.uid();
  r    public.saves;
  nrev bigint;
  nm   text;  lv int;  tr int;  cr int;  cs int;  pw bigint;
  bk   boolean;
  ot int; ol int; opw bigint; lastsnap timestamptz;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then raise exception 'bad data'; end if;
  if pg_column_size(p_data) > 3000000 then raise exception 'save too large'; end if;

  nm := left(btrim(coalesce(p_name, '')), 16);
  if nm = '' then nm := 'Đạo Hữu'; end if;
  lv := greatest(1,  least(coalesce(p_lv, 1),   999));
  tr := greatest(0,  least(coalesce(p_tier, 0), 9));
  cr := greatest(-1, least(coalesce(p_cr, -1),  20));
  cs := greatest(0,  least(coalesce(p_cs, 0),   9));
  pw := tr::bigint * 1000000 + lv::bigint * 1000 + ((cr + 1) * 10 + cs);

  select * into r from public.saves where user_id = uid for update;
  if not found then
    begin
      insert into public.saves(user_id, data, rev) values (uid, p_data, 1);
      nrev := 1;
    exception when unique_violation then
      select rev into nrev from public.saves where user_id = uid;
      return jsonb_build_object('status', 'conflict', 'rev', nrev);
    end;
  else
    if not coalesce(p_force, false) and r.rev <> p_base_rev then
      return jsonb_build_object('status', 'conflict', 'rev', r.rev);
    end if;

    select b.o_tier, b.o_lv, b.o_pw into ot, ol, opw from public.kthm_best(r.data) b;

    -- CHẶN TỤT CẤP: bản đẩy lên có bậc thấp hơn, hoặc cùng bậc mà cấp tụt từ 3 trở lên (trừ khi người chơi chủ động ép ghi đè)
    if not coalesce(p_force, false) and coalesce(opw, -1) >= 0 and (tr < ot or (tr = ot and lv <= ol - 3)) then
      return jsonb_build_object('status', 'regress', 'rev', r.rev,
        'cloud_lv', ol, 'cloud_tier', ot, 'new_lv', lv, 'new_tier', tr);
    end if;

    -- LỊCH SỬ: chụp bản đang có trên mây mỗi giờ (và mỗi lần ép ghi đè), giữ 48 bản mới nhất
    select max(taken_at) into lastsnap from public.saves_history where user_id = uid;
    if coalesce(p_force, false) or lastsnap is null or lastsnap < now() - interval '1 hour' then
      insert into public.saves_history(user_id, rev, tier, lv, why, data)
      values (uid, r.rev, ot, ol, case when coalesce(p_force,false) then 'force' else 'hourly' end, r.data);
      delete from public.saves_history
       where user_id = uid
         and id not in (select id from public.saves_history where user_id = uid order by taken_at desc, id desc limit 48);
    end if;

    nrev := r.rev + 1;
    bk := coalesce(p_force, false) or coalesce(p_backup, false)
          or r.backup_at is null or r.backup_at < now() - interval '1 hour';
    update public.saves set
      backup     = case when bk then r.data else backup end,
      backup_at  = case when bk then now()  else backup_at end,
      data       = p_data,
      rev        = nrev,
      updated_at = now()
    where user_id = uid;
  end if;

  -- BẢN CAO NHẤT TỪNG ĐẠT (chỉ ghi khi vượt kỷ lục cũ)
  insert into public.saves_peak(user_id, pw, tier, lv, rev, data)
  values (uid, pw, tr, lv, nrev, p_data)
  on conflict (user_id) do update
    set pw = excluded.pw, tier = excluded.tier, lv = excluded.lv, rev = excluded.rev, taken_at = now(), data = excluded.data
    where public.saves_peak.pw < excluded.pw;

  insert into public.leaderboard(user_id, name, cls, lv, tier, cult_r, cult_s, power, updated_at)
  values (uid, nm, left(coalesce(p_cls, ''), 24), lv, tr, cr, cs, pw, now())
  on conflict (user_id) do update set
    name = excluded.name, cls = excluded.cls, lv = excluded.lv, tier = excluded.tier,
    cult_r = excluded.cult_r, cult_s = excluded.cult_s, power = excluded.power,
    updated_at = now();

  return jsonb_build_object('status', 'ok', 'rev', nrev);
end $function$;

drop function if exists public.list_snapshots();
drop function if exists public.restore_snapshot(bigint);
