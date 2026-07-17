-- A wish is the far end of a visit: a visit records that you were somewhere, a wish
-- records that you want to be. It hangs off the place instead of living in a trip
-- because a trip is an itinerary — ordered, dated, one of many — while the wishlist
-- is a single unordered set of someday. People were already building it by hand as a
-- trip named "Wishlist", which is the tell that it was missing.
create table public.place_wishes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (place_id, user_id)
);

create index place_wishes_user_idx on public.place_wishes(user_id);

alter table public.place_wishes enable row level security;

-- Same gate as a visit, and deliberately so: is_visitable_place asks whether you may
-- see the place, not what you may feel about it. A wish has no fields, so there is
-- nothing to update — you add it or you drop it.
create policy "place_wishes_select_own" on public.place_wishes
for select to authenticated
using (user_id = (select auth.uid()));

create policy "place_wishes_insert_own" on public.place_wishes
for insert to authenticated
with check (user_id = (select auth.uid()) and public.is_visitable_place(place_id));

create policy "place_wishes_delete_own" on public.place_wishes
for delete to authenticated
using (user_id = (select auth.uid()));

-- The map needs to know which pins you want, the same way it already knows which you
-- have visited. Return type changes, so drop, recreate and re-grant.
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
  visited_by_me boolean,
  wished_by_me boolean
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
    ) as visited_by_me,
    exists (
      select 1 from public.place_wishes w
      where w.place_id = p.id and w.user_id = auth.uid()
    ) as wished_by_me
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