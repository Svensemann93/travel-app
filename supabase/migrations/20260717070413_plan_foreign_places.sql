-- Planning is about other people's pins: you see a public place you have never been
-- to and want it in your trip. trip_places demanded that the place belong to the
-- caller, so the only thing you could do with a foreign pin was claim you had been
-- there. The trip is what has to be yours; the place only has to be one you are
-- allowed to see.

-- A foreign place is invisible to the owner-only places query, and a place the
-- creator turns private disappears from a trip mid-planning. The snapshot keeps the
-- stop on the list and on the map either way. Same pattern as place_visits.
alter table public.trip_places
  add column if not exists place_name text,
  add column if not exists place_latitude double precision,
  add column if not exists place_longitude double precision,
  add column if not exists place_category text,
  add column if not exists place_country_code text;

create or replace function public.snapshot_trip_place()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name, p.latitude, p.longitude, p.category, p.country_code
    into new.place_name, new.place_latitude, new.place_longitude,
         new.place_category, new.place_country_code
  from public.places p
  where p.id = new.place_id;
  return new;
end;
$$;

drop trigger if exists trip_places_snapshot on public.trip_places;
create trigger trip_places_snapshot
before insert or update of place_id on public.trip_places
for each row
execute function public.snapshot_trip_place();

update public.trip_places tp
set place_name = p.name,
    place_latitude = p.latitude,
    place_longitude = p.longitude,
    place_category = p.category,
    place_country_code = p.country_code
from public.places p
where p.id = tp.place_id;

-- The trip must be yours. The place only has to be one you may see, which is exactly
-- the set you may claim a visit to, so is_visitable_place decides both. Reading,
-- reordering and removing a stop ask nothing about the place: once it is in your
-- trip it stays yours to manage, even after the creator withdraws it.
drop policy if exists "trip_places_select_own" on public.trip_places;
drop policy if exists "trip_places_insert_own" on public.trip_places;
drop policy if exists "trip_places_update_own" on public.trip_places;
drop policy if exists "trip_places_delete_own" on public.trip_places;

create policy "trip_places_select_own" on public.trip_places
for select to authenticated
using (
  exists (
    select 1 from public.trips t
    where t.id = trip_places.trip_id and t.user_id = (select auth.uid())
  )
);

create policy "trip_places_insert_own" on public.trip_places
for insert to authenticated
with check (
  exists (
    select 1 from public.trips t
    where t.id = trip_places.trip_id and t.user_id = (select auth.uid())
  )
  and public.is_visitable_place(trip_places.place_id)
);

create policy "trip_places_update_own" on public.trip_places
for update to authenticated
using (
  exists (
    select 1 from public.trips t
    where t.id = trip_places.trip_id and t.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.trips t
    where t.id = trip_places.trip_id and t.user_id = (select auth.uid())
  )
);

create policy "trip_places_delete_own" on public.trip_places
for delete to authenticated
using (
  exists (
    select 1 from public.trips t
    where t.id = trip_places.trip_id and t.user_id = (select auth.uid())
  )
);

-- Adoption hands a private copy to everyone left with a ghost when the creator
-- deletes a public place. That used to mean visitors only. A planner has never been
-- there and has no visit, so they would lose their stop to the cascade without ever
-- being asked. Both hold a stake in the pin, so both inherit it — and a planner's
-- copy carries no visit, which is exactly right: they still have not been there.
create or replace function public.adopt_place_visits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stakeholder uuid;
  copy_id uuid;
begin
  for stakeholder in
    select v.user_id from public.place_visits v where v.place_id = old.id
    union
    select t.user_id
    from public.trip_places tp
    join public.trips t on t.id = tp.trip_id
    where tp.place_id = old.id
  loop
    if stakeholder is not distinct from old.user_id then
      continue;
    end if;

    insert into public.places (
      user_id, name, description, latitude, longitude, category,
      website_url, is_public, country_code, adopted
    )
    values (
      stakeholder, old.name, null, old.latitude, old.longitude, old.category,
      old.website_url, false, old.country_code, true
    )
    returning id into copy_id;

    update public.place_visits v
    set place_id = copy_id
    where v.place_id = old.id and v.user_id = stakeholder;

    update public.trip_places tp
    set place_id = copy_id
    from public.trips t
    where t.id = tp.trip_id
      and t.user_id = stakeholder
      and tp.place_id = old.id;
  end loop;

  return old;
end;
$$;