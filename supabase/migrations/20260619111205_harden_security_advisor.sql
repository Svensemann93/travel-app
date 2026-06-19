alter function public.create_journal_share(uuid) set search_path = 'public';

revoke execute on function public.clear_dangling_journal_cover() from public, anon, authenticated;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;