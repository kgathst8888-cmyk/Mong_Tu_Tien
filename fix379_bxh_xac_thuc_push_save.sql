-- Fix379 · push_save v4: bảng xếp hạng/bản cao nhất lấy cấp-bậc từ dữ liệu lưu thật, không tin tham số client.
-- Hoàn tác: chạy lại luu_mang_bao_ve_v3b_push_save.sql
-- Fix298 · push_save v3: chặn tụt cấp cả khi p_force + nhận biết Hợp Đạo / Chuyển Thế / admin. Hoàn tác: luu_mang_snapshot_v2.sql (khối push_save)

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
  ot int; ol int; opw bigint; lastsnap timestamptz; lastfreq timestamptz;
  nt2 int; nl2 int; npw2 bigint; legit boolean; isadm boolean;
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
  -- Fix379: KHÔNG tin p_lv/p_tier/p_cr/p_cs của client cho bảng xếp hạng + bản cao nhất.
  -- Trần = cấp/bậc tính từ CHÍNH dữ liệu lưu gửi lên (kthm_best). Gửi p_lv=999 với save cấp thấp sẽ bị kéo về cấp thật.
  begin
    select b.o_tier, b.o_lv into nt2, nl2 from public.kthm_best(p_data) b;
    if nl2 is not null and nt2 is not null then
      tr := least(tr, greatest(0, nt2));
      lv := least(lv, greatest(1, nl2));
      pw := tr::bigint * 1000000 + lv::bigint * 1000 + ((cr + 1) * 10 + cs);
    end if;
  exception when others then null;
  end;

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

    -- CHẶN TỤT CẤP v3 (tính từ CHÍNH dữ liệu gửi lên, không tin số client): tụt bậc, hoặc cùng bậc mà tụt từ 3 cấp.
    --   * Áp dụng CẢ KHI p_force (trả 'protected'), vì ép ghi đè từ máy cũ là cách mất nhân vật.
    --   * Ngoại lệ hợp lệ: vừa Hợp Đạo (cờ hd mới bật) hoặc vừa Chuyển Thế (cờ ct mới bật) ở bất kỳ nhân vật nào; tài khoản admin.
    select b.o_tier, b.o_lv, b.o_pw into nt2, nl2, npw2 from public.kthm_best(p_data) b;
    isadm := exists(select 1 from public.kthm_admin a where a.uid = auth.uid());
    legit := exists(
      select 1 from jsonb_array_elements(coalesce(p_data->'k2'->'PS','[]'::jsonb)) with ordinality n(v,i)
       where jsonb_typeof(n.v) = 'object' and (
         ((n.v->'hd'->>'d') = '1' and coalesce((r.data->'k2'->'PS'->((n.i-1)::int))->'hd'->>'d','') <> '1')
         or ((n.v->'ct'->>'d') = '1' and coalesce((r.data->'k2'->'PS'->((n.i-1)::int))->'ct'->>'d','') <> '1')));
    if coalesce(opw, -1) >= 0 and not isadm and not legit and (nt2 < ot or (nt2 = ot and nl2 <= ol - 3)) then
      return jsonb_build_object('status', case when coalesce(p_force,false) then 'protected' else 'regress' end, 'rev', r.rev,
        'cloud_lv', ol, 'cloud_tier', ot, 'new_lv', nl2, 'new_tier', nt2);
    end if;

    -- LỊCH SỬ 2 TẦNG (chụp bản đang có trên mây TRƯỚC khi ghi đè):
    --   'hourly'/'force': mỗi giờ hoặc mỗi lần ép ghi đè, giữ 48 bản mới nhất
    --   'frequent'      : mỗi 10 phút, giữ 12 bản mới nhất (2 giờ gần nhất)
    select max(taken_at) filter (where why = 'frequent'),
           max(taken_at) filter (where why is distinct from 'frequent')
      into lastfreq, lastsnap
      from public.saves_history where user_id = uid;
    if coalesce(p_force, false) or lastsnap is null or lastsnap < now() - interval '1 hour' then
      insert into public.saves_history(user_id, rev, tier, lv, why, data)
      values (uid, r.rev, ot, ol, case when coalesce(p_force,false) then 'force' else 'hourly' end, r.data);
      delete from public.saves_history
       where user_id = uid and why is distinct from 'frequent'
         and id not in (select id from public.saves_history
                         where user_id = uid and why is distinct from 'frequent'
                         order by taken_at desc, id desc limit 48);
    elsif lastfreq is null or lastfreq < now() - interval '10 minutes' then
      insert into public.saves_history(user_id, rev, tier, lv, why, data)
      values (uid, r.rev, ot, ol, 'frequent', r.data);
      delete from public.saves_history
       where user_id = uid and why = 'frequent'
         and id not in (select id from public.saves_history
                         where user_id = uid and why = 'frequent'
                         order by taken_at desc, id desc limit 12);
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

