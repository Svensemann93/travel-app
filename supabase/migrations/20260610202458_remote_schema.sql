


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."journal_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "journal_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "last_accessed_at" timestamp with time zone
);


ALTER TABLE "public"."journal_shares" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_journal_share"("p_journal_id" "uuid") RETURNS "public"."journal_shares"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_latest date;
  v_expires timestamptz;
  v_token text;
  v_row public.journal_shares;
begin
  if not exists (
    select 1 from public.journals j
    where j.id = p_journal_id and j.user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  select max(entry_date) into v_latest
  from public.journal_entries
  where journal_id = p_journal_id;

  v_expires := greatest(now(), coalesce(v_latest::timestamptz, now())) + interval '30 days';
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  insert into public.journal_shares (journal_id, token, expires_at)
  values (p_journal_id, v_token, v_expires)
  on conflict (journal_id) do update
    set token = v_token,
        expires_at = v_expires,
        created_at = now(),
        last_accessed_at = null
  returning * into v_row;

  return v_row;
end;
$$;


ALTER FUNCTION "public"."create_journal_share"("p_journal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_own_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."delete_own_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_shared_journal"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_share public.journal_shares;
  v_result jsonb;
begin
  select * into v_share
  from journal_shares
  where token = p_token and expires_at > now();

  if not found then
    return null;
  end if;

  update journal_shares
  set expires_at = greatest(expires_at, now() + interval '30 days'),
      last_accessed_at = now()
  where id = v_share.id;

  select jsonb_build_object(
    'title', j.title,
    'description', j.description,
    'entries', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'entry_date', e.entry_date,
          'title', e.title,
          'body', e.body,
          'place', case when pl.id is null then null else jsonb_build_object(
            'name', pl.name, 'latitude', pl.latitude, 'longitude', pl.longitude
          ) end,
          'place_photos', coalesce((
            select jsonb_agg(jsonb_build_object('id', pp.id, 'url', pp.url, 'thumb_url', pp.thumb_url) order by pp.position)
            from place_photos pp
            where pp.place_id = e.place_id
              and (e.place_photo_ids is null or pp.id = any(e.place_photo_ids))
          ), '[]'::jsonb),
          'entry_photos', coalesce((
            select jsonb_agg(jsonb_build_object('id', ep.id, 'url', ep.url, 'thumb_url', ep.thumb_url) order by ep.position)
            from journal_entry_photos ep
            where ep.entry_id = e.id
          ), '[]'::jsonb)
        ) order by e.position
      )
      from journal_entries e
      left join places pl on pl.id = e.place_id
      where e.journal_id = j.id
    ), '[]'::jsonb)
  )
  into v_result
  from journals j
  where j.id = v_share.journal_id;

  return v_result;
end;
$$;


ALTER FUNCTION "public"."get_shared_journal"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "journal_id" "uuid" NOT NULL,
    "place_id" "uuid",
    "entry_date" "date",
    "title" "text",
    "body" "text",
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "place_photo_ids" "uuid"[]
);


ALTER TABLE "public"."journal_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entry_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "thumb_url" "text",
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."journal_entry_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."journals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."place_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "place_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "thumb_url" "text"
);


ALTER TABLE "public"."place_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "rating" integer,
    "price_level" integer,
    "website_url" "text",
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    CONSTRAINT "places_price_level_check" CHECK ((("price_level" >= 1) AND ("price_level" <= 3))),
    CONSTRAINT "places_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "entry_latitude" double precision,
    "entry_longitude" double precision,
    "entry_label" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_places" (
    "trip_id" "uuid" NOT NULL,
    "place_id" "uuid" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "planned_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trips_date_range_check" CHECK ((("start_date" IS NULL) OR ("end_date" IS NULL) OR ("end_date" >= "start_date"))),
    CONSTRAINT "trips_name_check" CHECK ((("char_length"("name") >= 1) AND ("char_length"("name") <= 120)))
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_entry_photos"
    ADD CONSTRAINT "journal_entry_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_shares"
    ADD CONSTRAINT "journal_shares_journal_id_key" UNIQUE ("journal_id");



ALTER TABLE ONLY "public"."journal_shares"
    ADD CONSTRAINT "journal_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_shares"
    ADD CONSTRAINT "journal_shares_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."place_photos"
    ADD CONSTRAINT "place_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."trip_places"
    ADD CONSTRAINT "trip_places_pkey" PRIMARY KEY ("trip_id", "place_id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_places_user_id" ON "public"."places" USING "btree" ("user_id");



CREATE INDEX "journal_entries_journal_id_idx" ON "public"."journal_entries" USING "btree" ("journal_id");



CREATE INDEX "journal_entry_photos_entry_id_idx" ON "public"."journal_entry_photos" USING "btree" ("entry_id");



CREATE INDEX "journals_user_id_idx" ON "public"."journals" USING "btree" ("user_id");



CREATE INDEX "place_photos_place_id_idx" ON "public"."place_photos" USING "btree" ("place_id");



CREATE INDEX "trip_places_place_id_idx" ON "public"."trip_places" USING "btree" ("place_id");



CREATE INDEX "trip_places_trip_id_position_idx" ON "public"."trip_places" USING "btree" ("trip_id", "position");



CREATE INDEX "trips_user_id_idx" ON "public"."trips" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trips_set_updated_at" BEFORE UPDATE ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."journal_entry_photos"
    ADD CONSTRAINT "journal_entry_photos_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entry_photos"
    ADD CONSTRAINT "journal_entry_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_shares"
    ADD CONSTRAINT "journal_shares_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."place_photos"
    ADD CONSTRAINT "place_photos_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."place_photos"
    ADD CONSTRAINT "place_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_places"
    ADD CONSTRAINT "trip_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_places"
    ADD CONSTRAINT "trip_places_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users manage entries of own journals" ON "public"."journal_entries" USING ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_entries"."journal_id") AND ("j"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_entries"."journal_id") AND ("j"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users manage own journal entry photos" ON "public"."journal_entry_photos" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own journals" ON "public"."journals" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."journal_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_entry_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owner deletes own shares" ON "public"."journal_shares" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_shares"."journal_id") AND ("j"."user_id" = "auth"."uid"())))));



CREATE POLICY "owner inserts own shares" ON "public"."journal_shares" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_shares"."journal_id") AND ("j"."user_id" = "auth"."uid"())))));



CREATE POLICY "owner reads own shares" ON "public"."journal_shares" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_shares"."journal_id") AND ("j"."user_id" = "auth"."uid"())))));



CREATE POLICY "owner updates own shares" ON "public"."journal_shares" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."journals" "j"
  WHERE (("j"."id" = "journal_shares"."journal_id") AND ("j"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."place_photos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "place_photos_delete_own" ON "public"."place_photos" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "place_photos_insert_own" ON "public"."place_photos" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "place_photos_select_own" ON "public"."place_photos" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "places_delete_own" ON "public"."places" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "places_insert_own" ON "public"."places" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "places_select_own" ON "public"."places" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "places_update_own" ON "public"."places" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_all_authenticated" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."trip_places" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trip_places_delete_own" ON "public"."trip_places" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trips" "t"
  WHERE (("t"."id" = "trip_places"."trip_id") AND ("t"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."places" "p"
  WHERE (("p"."id" = "trip_places"."place_id") AND ("p"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "trip_places_insert_own" ON "public"."trip_places" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trips" "t"
  WHERE (("t"."id" = "trip_places"."trip_id") AND ("t"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."places" "p"
  WHERE (("p"."id" = "trip_places"."place_id") AND ("p"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "trip_places_select_own" ON "public"."trip_places" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trips" "t"
  WHERE (("t"."id" = "trip_places"."trip_id") AND ("t"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."places" "p"
  WHERE (("p"."id" = "trip_places"."place_id") AND ("p"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "trip_places_update_own" ON "public"."trip_places" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trips" "t"
  WHERE (("t"."id" = "trip_places"."trip_id") AND ("t"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."places" "p"
  WHERE (("p"."id" = "trip_places"."place_id") AND ("p"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trips" "t"
  WHERE (("t"."id" = "trip_places"."trip_id") AND ("t"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."places" "p"
  WHERE (("p"."id" = "trip_places"."place_id") AND ("p"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trips_delete_own" ON "public"."trips" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "trips_insert_own" ON "public"."trips" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "trips_select_own" ON "public"."trips" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "trips_update_own" ON "public"."trips" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON TABLE "public"."journal_shares" TO "anon";
GRANT ALL ON TABLE "public"."journal_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_shares" TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_journal_share"("p_journal_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_journal_share"("p_journal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_journal_share"("p_journal_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_own_account"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_own_account"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_shared_journal"("p_token" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_shared_journal"("p_token" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";
























GRANT ALL ON TABLE "public"."journal_entries" TO "anon";
GRANT ALL ON TABLE "public"."journal_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_entries" TO "service_role";



GRANT ALL ON TABLE "public"."journal_entry_photos" TO "anon";
GRANT ALL ON TABLE "public"."journal_entry_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_entry_photos" TO "service_role";



GRANT ALL ON TABLE "public"."journals" TO "anon";
GRANT ALL ON TABLE "public"."journals" TO "authenticated";
GRANT ALL ON TABLE "public"."journals" TO "service_role";



GRANT ALL ON TABLE "public"."place_photos" TO "anon";
GRANT ALL ON TABLE "public"."place_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."place_photos" TO "service_role";



GRANT ALL ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT ALL ON TABLE "public"."places" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."trip_places" TO "anon";
GRANT ALL ON TABLE "public"."trip_places" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_places" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "storage_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'place-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "storage_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'place-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "storage_select_own"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'place-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



