-- A place is a point on the map; a visit is the event of having been there. Until
-- now both lived in places: rating, price_level and visited_on described the owner's
-- one visit, while other users' visits already lived in place_visits. That asymmetry
-- is why the year review needs two code paths, why the owner of a place cannot be a
-- visitor of it, and why a pin you have never been to still counts as a trip.
-- Everything personal moves to place_visits, and a place without a visit simply
-- means: planned.

-- Every existing place means "I have been here", so each one keeps that meaning as
-- exactly one visit. Without this the whole collection would read as planned. The
-- snapshot trigger fills place_name, place_category and place_country_code.
insert into public.place_visits (place_id, user_id, rating, price_level, visited_on, created_at)
select
  p.id,
  p.user_id,
  p.rating,
  p.price_level,
  coalesce(p.visited_on, p.created_at::date),
  p.created_at
from public.places p
where not exists (
  select 1 from public.place_visits v
  where v.place_id = p.id and v.user_id = p.user_id
);

-- Visiting is no longer limited to other people's places: the owner is simply the
-- first visitor of their own place, and their own places are private, so is_public
-- can no longer be the gate. Foreign private places stay out of reach.
create or replace function public.is_visitable_place(p_place_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.places p
    where p.id = p_place_id
      and (p.user_id = auth.uid() or p.is_public)
  );
$$;

-- Adoption used to copy the visitor's rating, price and date onto the new place,
-- because that is where they lived. Now the visit itself carries them, so the copy
-- holds only the facts about the physical place and the existing visit is moved onto
-- it. Moving rather than deleting is also what keeps the visit out of the cascade:
-- by the time the old place is gone, no visit points at it any more.
create or replace function public.adopt_place_visits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  with adopted as (
    insert into public.places (
      user_id, name, description, latitude, longitude, category,
      website_url, is_public, country_code, adopted
    )
    select
      v.user_id, old.name, null, old.latitude, old.longitude, old.category,
      old.website_url, false, old.country_code, true
    from public.place_visits v
    where v.place_id = old.id
    returning id, user_id
  )
  update public.place_visits v
  set place_id = a.id
  from adopted a
  where v.place_id = old.id
    and v.user_id = a.user_id;

  return old;
end;
$$;

-- The creator is now one visitor among others, so the averages read from visits
-- alone instead of unioning the place with them, and the count no longer adds one
-- for the creator. Their own rating and price leave the read model entirely: the
-- popup never showed them, it only ever showed the average and the caller's own
-- contribution. Return type changes, so drop, recreate and re-grant.
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
    p.website_url, p.category, pr.username, p.country_code,
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
      select round(avg(v.rating) * 2) / 2
      from public.place_visits v
      where v.place_id = p.id and v.rating is not null
    ) as avg_rating,
    (
      select round(avg(v.price_level), 2)
      from public.place_visits v
      where v.place_id = p.id and v.price_level is not null
    ) as avg_price,
    (select count(*) from public.place_visits v where v.place_id = p.id)::integer as visit_count,
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

-- Same change for the creator's own view of their public places, plus one that only
-- looks like a detail: the exists guard used to mean "somebody visited this", but
-- after the backfill every place has the creator's own visit, so it has to ask for a
-- visit by someone else. Otherwise every public pin would suddenly report one visit
-- and an average made of nothing but the creator's own rating.
create or replace function public.get_my_place_stats()
returns table (
  place_id uuid,
  avg_rating numeric,
  avg_price numeric,
  visit_count integer
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id as place_id,
    (
      select round(avg(v.rating) * 2) / 2
      from public.place_visits v
      where v.place_id = p.id and v.rating is not null
    ) as avg_rating,
    (
      select round(avg(v.price_level), 2)
      from public.place_visits v
      where v.place_id = p.id and v.price_level is not null
    ) as avg_price,
    (select count(*) from public.place_visits v where v.place_id = p.id)::integer as visit_count
  from public.places p
  where p.user_id = auth.uid()
    and p.is_public
    and exists (
      select 1 from public.place_visits v
      where v.place_id = p.id and v.user_id is distinct from p.user_id
    );
$$;

revoke all on function public.get_my_place_stats() from public;
grant execute on function public.get_my_place_stats() to authenticated;

-- This read model exists so the passport and the year review can count visits to
-- foreign places, which the owner-only places query cannot see. Visits to the
-- caller's own places now live in the same table and would be returned here as well,
-- once through this function and once through their place: the own-place join
-- excludes them. It carries no is_public filter on purpose, so that a place turned
-- private still counts as the caller's own rather than as a stranger's.
-- rating was declared integer while the column has been numeric(2,1) since half
-- stars: every 4.5 arrived here as a whole number.
drop function if exists public.get_my_public_place_visit_stats();

create function public.get_my_public_place_visit_stats()
returns table (
  place_id uuid,
  name text,
  category text,
  country_code text,
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

-- The place keeps only what is true about the point on the map. Everything that was
-- an account of one person's experience of it now lives on their visit.
alter table public.places drop column if exists rating;
alter table public.places drop column if exists price_level;
alter table public.places drop column if exists visited_on;