-- website_url is rendered as an href, including in other people's public popups, so
-- a value like javascript:... would run when someone else clicks it — stored XSS.
-- The client already refuses anything but http/https, but the database is the last
-- line: a check here holds regardless of which client writes the row. Existing rows
-- were all entered through the old form, which prefixed https, so none violate this;
-- if any did, this migration would fail loudly rather than silently, which is what we
-- want.
alter table public.places
  add constraint places_website_url_scheme
  check (website_url is null or website_url ~* '^https?://');