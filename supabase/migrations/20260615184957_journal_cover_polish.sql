alter table public.journals
  add column if not exists cover_focus_x smallint not null default 50,
  add column if not exists cover_focus_y smallint not null default 50;

create or replace function public.clear_dangling_journal_cover()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.journals
  set cover_photo_path = null,
      cover_focus_x = 50,
      cover_focus_y = 50
  where cover_photo_path = old.url;
  return old;
end;
$$;

drop trigger if exists clear_cover_on_entry_photo_delete on public.journal_entry_photos;
create trigger clear_cover_on_entry_photo_delete
  after delete on public.journal_entry_photos
  for each row
  execute function public.clear_dangling_journal_cover();

drop trigger if exists clear_cover_on_place_photo_delete on public.place_photos;
create trigger clear_cover_on_place_photo_delete
  after delete on public.place_photos
  for each row
  execute function public.clear_dangling_journal_cover();