-- Orphaned storage cleanup for cascade deletes.
-- When a place or journal entry is deleted, its *_photos rows cascade away,
-- but the underlying storage files do not. Postgres cannot delete storage
-- objects safely, so an after-delete trigger queues the paths and an edge
-- function drains the queue via the Storage API.

create table if not exists public.pending_storage_deletions (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.pending_storage_deletions enable row level security;
revoke all on table public.pending_storage_deletions from anon, authenticated;

create or replace function public.queue_photo_storage_deletion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pending_storage_deletions (path) values (old.url);
  if old.thumb_url is not null then
    insert into public.pending_storage_deletions (path) values (old.thumb_url);
  end if;
  return old;
end;
$$;

drop trigger if exists queue_storage_delete_on_place_photo on public.place_photos;
create trigger queue_storage_delete_on_place_photo
  after delete on public.place_photos
  for each row
  execute function public.queue_photo_storage_deletion();

drop trigger if exists queue_storage_delete_on_entry_photo on public.journal_entry_photos;
create trigger queue_storage_delete_on_entry_photo
  after delete on public.journal_entry_photos
  for each row
  execute function public.queue_photo_storage_deletion();