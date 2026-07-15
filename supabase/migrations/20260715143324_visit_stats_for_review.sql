-- The year-in-review has to date, name and rate a visit to a foreign public
-- place, not just count it. Only the visitor's own visit row is exposed, so the
-- owner's places.visited_on (their trip date) still never leaks. Names and
-- ratings here belong to places that are public and already visible on the map.
-- The return type changes, so drop and recreate; the grant is recreated because
-- drop removes it.
drop function if exists public.get_my_public_place_visit_stats();

create function public.get_my_public_place_visit_stats()
returns table (
  place_id uuid,
  name text,
  category text,
  country_code text,
  rating integer,
  visited_on date,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select p.id, p.name, p.category, p.country_code, v.rating, v.visited_on, v.created_at
  from public.place_visits v
  join public.places p on p.id = v.place_id
  where v.user_id = auth.uid()
    and p.is_public
    and p.user_id is distinct from auth.uid();
$$;

revoke all on function public.get_my_public_place_visit_stats() from public;
grant execute on function public.get_my_public_place_visit_stats() to authenticated;