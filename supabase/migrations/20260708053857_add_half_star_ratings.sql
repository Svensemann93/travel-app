-- Half-star ratings everywhere: both the creator's rating and visitor ratings
-- allow 0.5 steps. The average is rounded to the nearest 0.5.

alter table public.places drop constraint if exists places_rating_check;
alter table public.places alter column rating type numeric(2, 1);
alter table public.places add constraint places_rating_check
  check (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2));

alter table public.place_visits drop constraint if exists place_visits_rating_check;
alter table public.place_visits alter column rating type numeric(2, 1);
alter table public.place_visits add constraint place_visits_rating_check
  check (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2));

-- Recreate the read model so the average rating rounds to 0.5.
drop function if exists public.get_public_places();
create function public.get_public_places()
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
  photos jsonb,
  avg_rating numeric,
  avg_price numeric,
  visit_count integer,
  my_rating numeric,
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