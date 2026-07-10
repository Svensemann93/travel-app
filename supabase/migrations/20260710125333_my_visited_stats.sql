create function public.get_my_public_place_visit_stats()
returns table (
  category text,
  country_code text
)
language sql
security definer
set search_path = ''
stable
as $$
  select p.category, p.country_code
  from public.place_visits v
  join public.places p on p.id = v.place_id
  where v.user_id = auth.uid()
    and p.is_public
    and p.user_id is distinct from auth.uid();
$$;

revoke all on function public.get_my_public_place_visit_stats() from public;
grant execute on function public.get_my_public_place_visit_stats() to authenticated;