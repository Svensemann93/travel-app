-- Adoption exists for other people: when the creator deletes a public place, every
-- visitor keeps a private copy instead of a ghost. It finds those people by reading
-- place_visits — which was safe while a creator could not be a visitor of their own
-- place. Since visits carry the rating, every place has its creator's own visit,
-- including the one being deleted, so adoption hands the creator a copy of the place
-- they just deleted and it reappears as an adopted pin. The creator is not left
-- behind by their own deletion: exclude them.
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
      and v.user_id is distinct from old.user_id
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