-- Public places: opt-in sharing of a pin with all authenticated users.
-- The places table stays owner-only (RLS). Foreign public pins are exposed
-- exclusively through get_public_places(), a SECURITY DEFINER read model
-- that returns only safe columns plus the owner's username (never the
-- owner's entry-point coordinates). Insert/update/delete stay owner-only,
-- so others can view but never modify.

alter table public.places
  add column if not exists is_public boolean not null default false;

create index if not exists idx_places_is_public
  on public.places (is_public) where is_public;

create or replace function public.get_public_places()
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
  username text
)
language sql
security definer
set search_path = ''
stable
as $$
  select p.id, p.name, p.description, p.latitude, p.longitude,
         p.rating, p.price_level, p.website_url, p.category, pr.username
  from public.places p
  join public.profiles pr on pr.id = p.user_id
  where p.is_public and p.user_id is distinct from auth.uid()
$$;

revoke all on function public.get_public_places() from public;
grant execute on function public.get_public_places() to authenticated;