alter table public.profiles
  add column display_name text,
  add column bio text,
  add column region text,
  add column interests text[] not null default '{}';

alter table public.profiles
  add constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 50),
  add constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 300),
  add constraint profiles_region_length
    check (region is null or char_length(region) <= 80),
  add constraint profiles_interests_count
    check (coalesce(array_length(interests, 1), 0) <= 20);