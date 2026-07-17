-- The wishlist needs a list, and a list has no viewport. Rather than a second read
-- model that would duplicate get_public_places for one screen, the existing one
-- takes a flag: same columns, same permissions, same mapping on the client. The bbox
-- defaults already cover the whole world, so the page simply omits them.
drop function if exists public.get_public_places(
  double precision, double precision, double precision, double precision, integer
);

create function public.get_public_places(
  min_lat double precision default -90,
  max_lat double precision default 90,
  min_lng double precision default -180,
  max_lng double precision default 180,
  max_rows integer default 1000,
  only_wished boolean default false
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
    and (
      not only_wished
      or exists (
        select 1 from public.place_wishes w
        where w.place_id = p.id and w.user_id = auth.uid()
      )
    )
  limit least(greatest(max_rows, 1), 1000);
$$;

revoke all on function public.get_public_places(
  double precision, double precision, double precision, double precision, integer, boolean
) from public;
grant execute on function public.get_public_places(
  double precision, double precision, double precision, double precision, integer, boolean
) to authenticated;