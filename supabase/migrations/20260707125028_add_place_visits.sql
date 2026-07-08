-- Place visits: other users mark a public place as visited and contribute
-- their own rating/price. The creator's rating stays in places.rating; the
-- displayed average combines both. Core place fields stay owner-only, so
-- visitors contribute but never edit name/location/category or delete the place.

create table if not exists public.place_visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer check (rating between 1 and 5),
  price_level integer check (price_level between 1 and 4),
  created_at timestamptz not null default now(),
  unique (place_id, user_id)
);

create index if not exists idx_place_visits_place on public.place_visits (place_id);

alter table public.place_visits enable row level security;

-- Helper: may the caller mark this place as visited? (public place they don't
-- own). SECURITY DEFINER because a policy's own subquery runs under the caller's
-- owner-only RLS and would never see a foreign public place.
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
      and p.is_public
      and p.user_id is distinct from auth.uid()
  );
$$;

revoke all on function public.is_visitable_place(uuid) from public;
grant execute on function public.is_visitable_place(uuid) to authenticated;

-- Each user manages only their own visit row; insert is limited to visitable
-- places so nobody can attach a visit to an arbitrary place_id.
create policy "place_visits_select_own"
on public.place_visits for select to authenticated
using ((select auth.uid()) = user_id);

create policy "place_visits_insert_own"
on public.place_visits for insert to authenticated
with check ((select auth.uid()) = user_id and public.is_visitable_place(place_id));

create policy "place_visits_update_own"
on public.place_visits for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "place_visits_delete_own"
on public.place_visits for delete to authenticated
using ((select auth.uid()) = user_id);

-- Extend the read model: average rating/price (creator + visitors), the
-- visitor count, and the caller's own contribution.
drop function if exists public.get_public_places();
create function public.get_public_places()
returns table (
  id uuid,
  name text,
  description text,
  latitude double precision,
  longitude double precision,
  rating integer,
  price_level integer,
  website_url text,
  category text,
  username text,
  photos jsonb,
  avg_rating numeric,
  avg_price numeric,
  visit_count integer,
  my_rating integer,
  my_price integer,
  visited_by_me boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id, p.name, p.description, p.latitude, p.longitude,
    p.rating, p.price_level, p.website_url, p.category, pr.username,
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
      select round(avg(val), 2) from (
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
    exists (
      select 1 from public.place_visits v
      where v.place_id = p.id and v.user_id = auth.uid()
    ) as visited_by_me
  from public.places p
  join public.profiles pr on pr.id = p.user_id
  where p.is_public and p.user_id is distinct from auth.uid();
$$;

revoke all on function public.get_public_places() from public;
grant execute on function public.get_public_places() to authenticated;