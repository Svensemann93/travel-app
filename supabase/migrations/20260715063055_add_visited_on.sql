-- Travel date: when the user actually was at the place. created_at only records
-- when the row was captured in the app, which is why a trip entered years later
-- would otherwise be counted in the wrong year. Nullable on purpose: existing
-- rows keep falling back to created_at on the client.
alter table public.places add column if not exists visited_on date;

-- Visitors date their own visit to a foreign public place. The owner's
-- places.visited_on is that user's trip date and must not leak here.
alter table public.place_visits add column if not exists visited_on date;

-- The read model must expose the caller's own visit date so the visit editor can
-- show and update it. Return type changes, so the function has to be dropped
-- first; the grant is recreated because drop removes it.
drop function if exists public.get_public_places(
  double precision, double precision, double precision, double precision, integer
);

create function public.get_public_places(
  min_lat double precision default -90,
  max_lat double precision default 90,
  min_lng double precision default -180,
  max_lng double precision default 180,
  max_rows integer default 1000
)
returns table (
  id uuid,
  name text,
  description text,
  latitude double precision,
  longitude double precision,
  rating numeric,
  price_level integer,
  website_url text,
  category text,
  username text,
  country_code text,
  photos jsonb,
  avg_rating numeric,
  avg_price numeric,
  visit_count integer,
  my_rating numeric,
  my_price integer,
  my_visited_on date,
  visited_by_me boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id, p.name, p.description, p.latitude, p.longitude,
    p.rating, p.price_level, p.website_url, p.category, pr.username, p.country_code,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('id', ph.id, 'url', ph.url, 'thumb_url', ph.thumb_url)
          order by ph.position
        )
        from public.place_photos ph
        where ph.place_id = p.id and ph.is_public
      ),
      '[]'::jsonb
    ) as photos,
    (
      select round(avg(val) * 2) / 2 from (
        select p.rating as val
        union all
        select v.rating from public.place_visits v where v.place_id = p.id
      ) ratings where val is not null
    ) as avg_rating,
    (
      select round(avg(val), 2) from (
        select p.price_level as val
        union all
        select v.price_level from public.place_visits v where v.place_id = p.id
      ) prices where val is not null
    ) as avg_price,
    (1 + (select count(*) from public.place_visits v where v.place_id = p.id))::integer as visit_count,
    (
      select v.rating from public.place_visits v
      where v.place_id = p.id and v.user_id = auth.uid()
    ) as my_rating,
    (
      select v.price_level from public.place_visits v
      where v.place_id = p.id and v.user_id = auth.uid()
    ) as my_price,
    (
      select v.visited_on from public.place_visits v
      where v.place_id = p.id and v.user_id = auth.uid()
    ) as my_visited_on,
    exists (
      select 1 from public.place_visits v
      where v.place_id = p.id and v.user_id = auth.uid()
    ) as visited_by_me
  from public.places p
  join public.profiles pr on pr.id = p.user_id
  where p.is_public
    and p.user_id is distinct from auth.uid()
    and p.latitude between min_lat and max_lat
    and p.longitude between min_lng and max_lng
  limit least(greatest(max_rows, 1), 1000);
$$;

revoke all on function public.get_public_places(
  double precision, double precision, double precision, double precision, integer
) from public;
grant execute on function public.get_public_places(
  double precision, double precision, double precision, double precision, integer
) to authenticated;