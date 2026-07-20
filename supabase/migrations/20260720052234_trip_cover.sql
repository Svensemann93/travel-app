-- A trip cover works exactly like a journal cover: a stored path plus a focus point
-- for the crop. The one difference lives entirely on the client — a trip has no
-- photos of its own, so the picker offers the photos of its places plus a set of
-- static fallback illustrations. Both are just strings in this column; a path
-- starting with '/' is a public asset, anything else is a Storage path, which
-- useSignedUrl already distinguishes.
alter table public.trips
  add column if not exists cover_photo_path text,
  add column if not exists cover_focus_x smallint not null default 50,
  add column if not exists cover_focus_y smallint not null default 50;