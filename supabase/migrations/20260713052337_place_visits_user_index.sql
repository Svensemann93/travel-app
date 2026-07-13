create index if not exists place_visits_user_place_idx
  on public.place_visits (user_id, place_id);