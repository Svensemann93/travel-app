alter table public.profiles
  add column avatar_focus_x smallint not null default 50,
  add column avatar_focus_y smallint not null default 50,
  add column cover_focus_x smallint not null default 50,
  add column cover_focus_y smallint not null default 50;

alter table public.profiles
  add constraint profiles_focus_range check (
    avatar_focus_x between 0 and 100
    and avatar_focus_y between 0 and 100
    and cover_focus_x between 0 and 100
    and cover_focus_y between 0 and 100
  );