# CLAUDE.md

## Project

Personal mobile-first travel app. Solo developer, German-speaking — conversation in German, but all code, variable names, commit messages, PR titles and PR bodies in English. Built to be team-ready even though development is currently solo.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS v4
- react-leaflet / Leaflet (OpenStreetMap tiles; Nominatim via leaflet-geosearch for search, direct `reverse` endpoint for country lookup)
- react-router-dom v7 (route-level code splitting via `lazy`), TanStack Query, react-i18next (de/en, fallback en)
- d3-geo + topojson-client + world-atlas for the passport world map (react-simple-maps rejected — React 18 only)
- Supabase: Auth, Postgres (RLS), Storage, Edge Functions, pg_cron, Vault — project ref `bomvrpytexfjwtjlnqya`
- Sentry (no PII, sourcemaps hidden), Vercel (auto-deploy from main, branch protection)
- Dev environment: Windows, PowerShell — always give PowerShell commands, use `;` not `&&`
- The Supabase CLI is a local devDependency — call it via `npx supabase ...` (bare `supabase` is not on PATH)

## Architecture rules

- `src/lib/categories.ts` is the single source of truth for category data (CategoryId union, CATEGORIES, CATEGORY_MAP, DEFAULT_CATEGORY). Category display names come from i18n only.
- `src/lib/achievements.ts` is the single source of truth for passport achievements (AchievementId union; thresholds with icon/ink/target/value; ACHIEVEMENTS with current/earned helpers). Same pattern as categories.ts.
- RLS is owner-only by default. Exception: places and their photos can be shared read-only via `is_public` flags, exposed to other authenticated users exclusively through the `get_public_places()` SECURITY DEFINER read model (never the base tables). Insert/update/delete stay owner-only.
- Photos are referenced, never duplicated (e.g. `place_photo_ids uuid[]`: null = all, array = curated, empty = none).
- A place is a point on the map; a visit (`place_visits`) is the event of having been there and carries `rating`, `price_level` and `visited_on`. The owner is simply the first visitor of their own place, so own and foreign visits are the same thing — never add a personal field to `places`. A place without a visit is **planned** and stays out of the year review and passport stats.
- All user-facing strings go through i18n (de/en). i18next keys are typed — dynamic keys (e.g. `achievements.${id}.title`) require the id to be a literal union, not `string`. Internal thrown errors stay plain English.
- Accent colors: teal `#39BBDE`, sun `#F4C15A`.
- Keep files under ~100 lines where possible. No code comments (SQL migrations are exempt — they document schema history).
- `supabase/` and `scripts/` are excluded from ESLint and Prettier.
- Mobile-first: check the mobile view first for every UI decision. Controls placed right (thumb-friendly); dropdowns/panels open right-aligned.
- Never use `useEffect` to sync local state from props — use the `key` prop to force remount. Never call `setState` synchronously in an effect body (`react-hooks/set-state-in-effect` fails the build) — decide via a `useState` lazy initializer, or defer with `queueMicrotask`.
- DOM measurement logic must live in the component that is actually mounted when measuring.

## Public places (read model + viewport loading)

- `get_public_places(bbox?, max_rows?)` is the only way other users' public places are exposed — base tables are never read directly. `max_rows` is clamped server-side to 1..1000. A partial btree index `places_public_coords_idx` on `(latitude, longitude) where is_public` supports the bbox scan (PostGIS + GiST is the later option for real growth).
- The map passes the current viewport so only visible pins load; the public toggle is a display-only filter. The first viewport is applied immediately, later pans/zooms are debounced (`MapPage`).
- `normalizeBounds` snaps the viewport **outward** to the 0.05° grid (floor min / ceil max). The **same** normalized box must drive both the React Query key and the request, so panning within a cell can't serve cached data that misses edge pins. Unit-tested in `publicBounds.test.ts`.
- Passport & `AchievementToast` never load full public places. They read visited foreign places from the lean `get_my_public_place_visit_stats()` RPC (only `category` + `country_code`). `useMyVisitedStats` is keyed `['my-visited-stats', userId]`; visit mutations invalidate it.
- `AchievementToast`: the seen-set is per user (`achievementsSeen:${userId}`) and **monotonic** — `reconcileSeen` never removes ids, so a transient undercount can't resurface dismissed stamps. The queue is cleared on user change. Own place/trip/journal stamps are still evaluated when `useMyVisitedStats` errors (visited treated as empty, reported to Sentry); the toast only waits while the visit RPC is genuinely pending for the first evaluation.

## Workflow (ALWAYS in this exact order — never start by editing files)

1. Create feature branch from up-to-date main
2. Read the current files before changing anything — never reconstruct from memory
3. Run checks locally in this order: `npm run format` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`
4. Push
5. Open PR on GitHub
6. Merge (user confirms)
7. Cleanup: `git checkout main; git pull; git branch -d <branch>; git fetch --prune` — never skip `--prune`
8. CLAUDE.md is updated within the same feature branch as the work — never a separate docs branch
9. Migrations: `npx supabase migration new <name>` → paste SQL → `npx supabase db push`

## Git conventions

- Always `git add .`; deliver stage + commit + push as ONE combined command block
- Commit messages and PR titles: English conventional-commit format
- PR body: English markdown with sections "What's new / Frontend / Architecture notes"

## Communication style

- Short, direct answers. No preamble, no recaps, no unsolicited suggestions. Evaluate external feedback honestly before implementing.
