-- Daily cron that drains the storage-deletion queue by invoking the
-- process-storage-deletions edge function. The service-role key is read
-- from Vault at runtime, never stored in this migration.

create extension if not exists pg_net;

select cron.schedule(
  'process-storage-deletions',
  '0 2 * * *',
  $$
  select net.http_post(
    url := 'https://bomvrpytexfjwtjlnqya.supabase.co/functions/v1/process-storage-deletions',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);