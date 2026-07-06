-- Public availability check for usernames used during registration.
-- The profiles table is owner-only (RLS), and the user isn't authenticated
-- yet at signup, so a direct select can't work. This SECURITY DEFINER
-- function returns only a boolean, exposing no profile data.

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1 from public.profiles where username = p_username
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;