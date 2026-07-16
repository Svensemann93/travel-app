-- When the creator deletes a public place, everyone who visited it is left with a
-- ghost: the pin is gone from their map, so they can no longer rate it, un-mark it,
-- add it to a trip or attach photos, and their visit lives on only as a number.
-- Deleting now hands each visitor a private copy of the place, so their own record
-- stays a real, editable pin. The copy can never be shared again: the creator
-- withdrew the place, and re-publishing it through a visitor would undo that.
alter table public.places
  add column if not exists adopted boolean not null default false;

alter table public.places
  drop constraint if exists places_adopted_stays_private;

alter table public.places
  add constraint places_adopted_stays_private
  check (not (adopted and is_public));

-- SECURITY DEFINER because places_insert_own only lets a user insert rows they own,
-- and this inserts rows owned by the visitors. Only facts about the physical place
-- are copied plus the visitor's own rating, price and date. The creator's notes and
-- photos are withdrawn with the place and are deliberately not carried over.
create or replace function public.adopt_place_visits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.places (
    user_id, name, description, latitude, longitude, category,
    rating, price_level, website_url, is_public, country_code, visited_on, adopted
  )
  select
    v.user_id, old.name, null, old.latitude, old.longitude, old.category,
    v.rating, v.price_level, old.website_url, false, old.country_code, v.visited_on, true
  from public.place_visits v
  where v.place_id = old.id;

  return old;
end;
$$;

drop trigger if exists places_adopt_visits on public.places;
create trigger places_adopt_visits
before delete on public.places
for each row
execute function public.adopt_place_visits();

-- The visit row must not survive its own adoption, or the place would be counted
-- twice: once as the adopted place and once as a visit. The snapshot columns stay
-- for the case this trigger does not cover, where the creator keeps the place but
-- turns it private.
alter table public.place_visits
  drop constraint if exists place_visits_place_id_fkey;

alter table public.place_visits
  add constraint place_visits_place_id_fkey
  foreign key (place_id) references public.places (id) on delete cascade;