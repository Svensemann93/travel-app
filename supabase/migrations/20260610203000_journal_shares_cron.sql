select cron.schedule(
  'delete-expired-journal-shares',
  '0 3 * * *',
  $$ delete from public.journal_shares where expires_at < now() $$
);