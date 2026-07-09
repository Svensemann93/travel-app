-- queue_photo_storage_deletion is an AFTER DELETE trigger function and is never
-- called directly by clients. Triggers fire regardless of EXECUTE grants, so
-- revoking execute from client roles clears the Security Advisor warning with
-- no behavioural change.
revoke execute on function public.queue_photo_storage_deletion() from public, anon, authenticated;