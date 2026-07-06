-- Account deletion now runs through the delete-account edge function,
-- which cleans up storage objects before removing the user.
-- Drop the old RPC so no code path can delete an account without cleanup.

drop function public.delete_own_account();