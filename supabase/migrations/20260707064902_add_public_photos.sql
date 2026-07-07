-- Per-photo public visibility for public places.
-- A photo is readable by other authenticated users only when the photo itself
-- is public AND its place is public. Photos default to private, so making a
-- place public never exposes its photos until each one is opted in.

alter table public.place_photos
  add column if not exists is_public boolean not null default false;

-- Indexes support the object-path lookup used by the storage policy helper.
create index if not exists idx_place_photos_url on public.place_photos (url);
create index if not exists idx_place_photos_thumb_url on public.place_photos (thumb_url);

-- SECURITY DEFINER helper: decides whether a storage object path belongs to a
-- public photo of a public place. Runs RLS-free (so it can see other users'
-- rows) and returns only a boolean. This is required because a storage policy's
-- own subquery would run under the caller's RLS and never see foreign rows.
create or replace function public.is_public_photo_object(object_name text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.place_photos pp
    join public.places p on p.id = pp.place_id
    where (pp.url = object_name or pp.thumb_url = object_name)
      and pp.is_public
      and p.is_public
  );
$$;

revoke all on function public.is_public_photo_object(text) from public;
grant execute on function public.is_public_photo_object(text) to authenticated;

-- Storage: authenticated users may read public photo objects. Owner-only
-- insert/update/delete and owner read stay untouched; this policy is additive.
drop policy if exists "place_photos_public_read" on storage.objects;
create policy "place_photos_public_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'place-photos'
  and public.is_public_photo_object(name)
);

-- Extend the public read model to include each place's public photos.
-- The return type changes, so drop and recreate (create-or-replace can't
-- change a function's return signature).
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
  photos jsonb
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
    ) as photos
  from public.places p
  join public.profiles pr on pr.id = p.user_id
  where p.is_public and p.user_id is distinct from auth.uid();
$$;

revoke all on function public.get_public_places() from public;
grant execute on function public.get_public_places() to authenticated;