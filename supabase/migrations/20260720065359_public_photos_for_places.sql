-- A trip cover can be picked from the photos of its places, but a foreign place's
-- photos are invisible: place_photos is owner-only, so the embedded trip query
-- returns nothing for them. Their public photos do exist and are already exposed
-- through get_public_places — but that read model is bbox-driven, and a trip stop
-- has no viewport. This is the same is_public filter, addressed by id instead of by
-- bounding box, so the cover picker can offer a foreign place's public photos
-- without opening any new read path into place_photos.
create or replace function public.get_public_place_photos(place_ids uuid[])
returns table (
  id uuid,
  place_id uuid,
  url text,
  thumb_url text,
  "position" integer
)
language sql
security definer
set search_path = ''
stable
as $$
  select ph.id, ph.place_id, ph.url, ph.thumb_url, ph."position"
  from public.place_photos ph
  join public.places p on p.id = ph.place_id
  where ph.place_id = any(place_ids)
    and ph.is_public
    and p.is_public
  order by ph.place_id, ph."position";
$$;

revoke all on function public.get_public_place_photos(uuid[]) from public;
grant execute on function public.get_public_place_photos(uuid[]) to authenticated;