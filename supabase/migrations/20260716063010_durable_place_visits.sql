-- A visit is the visitor's own record of having been somewhere, but today it
-- depends on the creator's place: `on delete cascade` removes it when they delete
-- the place, and the stats read model filters on is_public, so turning the place
-- private makes the visit vanish too. Either silently rewrites the visitor's
-- passport and year review. The visit now keeps its own copy of what it needs.
alter table public.place_visits
  add column if not exists place_name text,
  add column if not exists place_category text,
  add column if not exists place_country_code text;

update public.place_visits v
set place_name = p.name,
    place_category = p.category,
    place_country_code = p.country_code
from public.places p
where p.id = v.place_id
  and v.place_name is null;

-- The copy is pointless if the row still disappears with the place, so the visit
-- outlives it and only loses the link back to the map pin.
alter table public.place_visits
  drop constraint if exists place_visits_place_id_fkey;

alter table public.place_visits
  alter column place_id drop not null;

alter table public.place_visits
  add constraint place_visits_place_id_fkey
  foreign key (place_id) references public.places (id) on delete set null;

-- SECURITY DEFINER because places_select_own hides foreign places from the
-- visitor, so a trigger running as the caller would only ever write empty copies.
-- The columns are only overwritten when the place was actually found, and the
-- trigger is skipped once place_id is null, so the FK setting it null on delete
-- cannot wipe the very snapshot this migration exists to keep.
create or replace function public.snapshot_place_visit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  snapshot record;
begin
  select p.name, p.category, p.country_code into snapshot
  from public.places p
  where p.id = new.place_id;

  if found then
    new.place_name := snapshot.name;
    new.place_category := snapshot.category;
    new.place_country_code := snapshot.country_code;
  end if;

  return new;
end;
$$;

drop trigger if exists place_visits_snapshot on public.place_visits;
create trigger place_visits_snapshot
before insert or update on public.place_visits
for each row
when (new.place_id is not null)
execute function public.snapshot_place_visit();

-- Read the live place while it is still public, otherwise fall back to the
-- snapshot. Falling back rather than preferring it keeps a later correction by
-- the creator visible, without exposing the current state of a place they have
-- since made private. Return type changes, so drop, recreate and re-grant.
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
  select
    v.place_id,
    coalesce(p.name, v.place_name),
    coalesce(p.category, v.place_category),
    coalesce(p.country_code, v.place_country_code),
    v.rating,
    v.visited_on,
    v.created_at
  from public.place_visits v
  left join public.places p
    on p.id = v.place_id
   and p.is_public
   and p.user_id is distinct from auth.uid()
  where v.user_id = auth.uid()
    and coalesce(p.category, v.place_category) is not null;
$$;

revoke all on function public.get_my_public_place_visit_stats() from public;
grant execute on function public.get_my_public_place_visit_stats() to authenticated;