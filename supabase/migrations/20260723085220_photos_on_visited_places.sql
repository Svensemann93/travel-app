-- A photo belongs to the person who took it, not to the person who dropped the pin.
-- Visiting someone else's public place should let you keep your own pictures of it,
-- so the insert gate becomes the same predicate that already gates a visit and a wish.
--
-- This also closes a hole: the old policy checked only that user_id was yours and said
-- nothing about place_id, so a row could be attached to any place in the table —
-- including a private one the uploader may not see — and made public from there.
drop policy if exists "place_photos_insert_own" on public.place_photos;

create policy "place_photos_insert_own"
on public.place_photos
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and public.is_visitable_place(place_id)
);

-- Same reasoning for update: a photo must never be moved onto a place you cannot see.
drop policy if exists "place_photos_update_own" on public.place_photos;

create policy "place_photos_update_own"
on public.place_photos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and public.is_visitable_place(place_id)
);