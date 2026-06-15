create or replace function public.get_shared_journal(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share public.journal_shares;
  v_result jsonb;
begin
  select * into v_share
  from journal_shares
  where token = p_token and expires_at > now();

  if not found then
    return null;
  end if;

  update journal_shares
  set expires_at = greatest(expires_at, now() + interval '30 days'),
      last_accessed_at = now()
  where id = v_share.id;

  select jsonb_build_object(
    'title', j.title,
    'description', j.description,
    'cover_photo_path', j.cover_photo_path,
    'cover_focus_x', j.cover_focus_x,
    'cover_focus_y', j.cover_focus_y,
    'entries', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'entry_date', e.entry_date,
          'title', e.title,
          'body', e.body,
          'place', case when pl.id is null then null else jsonb_build_object(
            'name', pl.name, 'latitude', pl.latitude, 'longitude', pl.longitude
          ) end,
          'place_photos', coalesce((
            select jsonb_agg(jsonb_build_object('id', pp.id, 'url', pp.url, 'thumb_url', pp.thumb_url) order by pp.position)
            from place_photos pp
            where pp.place_id = e.place_id
              and (e.place_photo_ids is null or pp.id = any(e.place_photo_ids))
          ), '[]'::jsonb),
          'entry_photos', coalesce((
            select jsonb_agg(jsonb_build_object('id', ep.id, 'url', ep.url, 'thumb_url', ep.thumb_url) order by ep.position)
            from journal_entry_photos ep
            where ep.entry_id = e.id
          ), '[]'::jsonb)
        ) order by e.position
      )
      from journal_entries e
      left join places pl on pl.id = e.place_id
      where e.journal_id = j.id
    ), '[]'::jsonb)
  )
  into v_result
  from journals j
  where j.id = v_share.journal_id;

  return v_result;
end;
$$;

revoke all on function public.get_shared_journal(text) from public, anon, authenticated;
grant execute on function public.get_shared_journal(text) to service_role;