-- place_photos never had an UPDATE policy because photos were only ever
-- inserted or deleted. Toggling a photo's is_public flag is the first update,
-- and without a policy RLS silently blocks it (0 rows, no error). Add the
-- owner-only UPDATE policy, matching the existing insert/select/delete ones.

create policy "place_photos_update_own"
on public.place_photos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);