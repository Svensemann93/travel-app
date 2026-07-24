-- Dropping a stop onto a travel day changes two things: the stop's planned date
-- and the positions of every stop in the trip. The client used to send those as
-- two separate requests, so a failure of the second one left the date already
-- written while the client rolled both back — the next load would then show the
-- stop in a day the user never confirmed.
--
-- A function keeps both writes in one transaction: either the move happens
-- completely or not at all. It runs as invoker, so the existing owner-only
-- policies on trip_places still decide who may write.
create or replace function public.move_trip_place(
  p_trip_id uuid,
  p_place_id uuid,
  p_planned_date date,
  p_notes text,
  p_ordered_place_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.trip_places
  set planned_date = p_planned_date,
      notes = p_notes
  where trip_id = p_trip_id
    and place_id = p_place_id;

  update public.trip_places tp
  set position = ordered.ord - 1
  from unnest(p_ordered_place_ids) with ordinality as ordered(place_id, ord)
  where tp.trip_id = p_trip_id
    and tp.place_id = ordered.place_id;
end;
$$;

revoke all on function public.move_trip_place(uuid, uuid, date, text, uuid[]) from public;
grant execute on function public.move_trip_place(uuid, uuid, date, text, uuid[]) to authenticated;