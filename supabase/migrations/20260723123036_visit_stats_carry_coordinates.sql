-- The year review draws a map of where you were, which needs a point per visit.
-- Own places already carry their coordinates client-side; visits to other people's
-- public places did not, because this read model was deliberately lean.
--
-- Coordinates of a public place are already readable through get_public_places, so
-- returning them here exposes nothing new. They stay null when the place is no longer
-- visible to the visitor, since place_visits keeps no coordinate snapshot; the client
-- drops those rows from the map rather than guessing a position.
drop function if exists public.get_my_public_place_visit_stats();

create function public.get_my_public_place_visit_stats()
returns table (
  place_id uuid,
  name text,
  category text,
  country_code text,
  latitude double precision,
  longitude double precision,
  rating numeric,
  visited_on date,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    v.place_id,
    coalesce(p.name, v.place_name),
    coalesce(p.category, v.place_category),
    coalesce(p.country_code, v.place_country_code),
    p.latitude,
    p.longitude,
    v.rating,
    v.visited_on,
    v.created_at
  from public.place_visits v
  left join public.places own
    on own.id = v.place_id
   and own.user_id = auth.uid()
  left join public.places p
    on p.id = v.place_id
   and p.is_public
   and p.user_id is distinct from auth.uid()
  where v.user_id = auth.uid()
    and own.id is null
    and coalesce(p.category, v.place_category) is not null;
$$;

revoke all on function public.get_my_public_place_visit_stats() from public;
grant execute on function public.get_my_public_place_visit_stats() to authenticated;