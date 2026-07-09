-- Creator-facing aggregates: for the caller's own public places, expose the
-- average rating/price (creator + visitors), rounded to 0.5, and the visitor
-- count. Owner-only base data stays untouched; this only adds derived stats
-- so the creator can see them in their own popup.

create or replace function public.get_my_place_stats()
returns table (
  place_id uuid,
  avg_rating numeric,
  avg_price numeric,
  visit_count integer
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id as place_id,
    (
      select round(avg(val) * 2) / 2 from (
        select p.rating as val
        union all
        select v.rating from public.place_visits v where v.place_id = p.id
      ) ratings where val is not null
    ) as avg_rating,
    (
      select round(avg(val), 2) from (
        select p.price_level as val
        union all
        select v.price_level from public.place_visits v where v.place_id = p.id
      ) prices where val is not null
    ) as avg_price,
    (select count(*) from public.place_visits v where v.place_id = p.id)::integer as visit_count
  from public.places p
  where p.user_id = auth.uid()
    and p.is_public
    and exists (select 1 from public.place_visits v where v.place_id = p.id);
$$;

revoke all on function public.get_my_place_stats() from public;
grant execute on function public.get_my_place_stats() to authenticated;