# CLAUDE.md

## Project

Personal mobile-first travel app. Solo developer, German-speaking — conversation in German, but all code, comments, variable names, commit messages, PR titles and PR bodies in English. Built to be team-ready even though development is currently solo.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS v4
- react-leaflet / Leaflet (OpenStreetMap tiles, Nominatim via leaflet-geosearch)
- react-router-dom v7, TanStack Query, react-i18next (de/en, fallback en)
- Supabase: Auth, Postgres (RLS), Storage, Edge Functions — project ref `bomvrpytexfjwtjlnqya`
- Sentry (no PII, sourcemaps hidden), Vercel (auto-deploy from main, branch protection)
- Dev environment: Windows, PowerShell — always give PowerShell commands, use `;` not `&&`

## Architecture rules

- `src/lib/categories.ts` is the single source of truth for category data (CategoryId union, CATEGORIES, CATEGORY_MAP, DEFAULT_CATEGORY). Category display names come from i18n only.
- RLS is owner-only by default. Exception: places and their photos can be shared read-only via `is_public` flags, exposed to other authenticated users exclusively through the `get_public_places()` SECURITY DEFINER read model (never the base tables). Insert/update/delete stay owner-only.
- Photos are referenced, never duplicated (e.g. `place_photo_ids uuid[]`: null = all, array = curated, empty = none).
- All user-facing strings go through i18n (de/en). Non-component code (e.g. `imageResize.ts`) uses the i18n instance for user-facing messages; internal thrown errors stay plain English.
- Accent colors: teal `#39BBDE`, sun `#F4C15A`.
- Keep files under ~100 lines where possible. No code comments (SQL migrations are exempt — they document schema history).
- `supabase/` is excluded from ESLint and Prettier.
- Mobile-first: check the mobile view first for every UI decision. Controls placed right (thumb-friendly), dropdowns/panels open right-aligned.
- Never use `useEffect` to sync local state from props — use the `key` prop to force remount.
- DOM measurement logic must live in the component that is actually mounted when measuring.

## Workflow (ALWAYS in this exact order — never start by editing files)

1. Create feature branch from up-to-date main
2. Read the current files before changing anything — never reconstruct from memory
3. Run checks locally in this order: `npm run format` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`
4. Push
5. Open PR on GitHub
6. Merge (user confirms)
7. Cleanup: `git checkout main; git pull; git branch -d <branch>; git fetch --prune` — never skip `--prune`

## Git conventions

- Always `git add .`; deliver stage + commit + push as ONE combined command block
- Commit messages and PR titles: English conventional-commit format
- PR body: English markdown with sections "What's new / Frontend / Architecture notes"

## Communication style

- Short, direct answers. No preamble, no recaps, no unsolicited suggestions.
- Explain the "why" behind non-obvious decisions briefly and understandably (user is a trained application developer but learning this stack).
- Plan before execution: for any non-trivial task, state a short plan first.
- One task at a time, complete it fully before proposing the next.

## Security hardening (done)

The launch security audit is complete. For context when touching these areas:

- Profiles RLS is owner-only (`profiles_select_own`, `(select auth.uid()) = id`)
- HTTP security headers set in `vercel.json` (CSP, HSTS, X-Frame-Options, etc.)
- Share links have a hard 180-day cap from `created_at` that is never extended
- Account deletion runs through the `delete-account` edge function, which removes the user's storage objects before deleting the user
- Signed URLs refetch every 45 min (`useSignedUrl`) to avoid expiry on long sessions
- Cascade deletes queue orphaned photo paths (`pending_storage_deletions` trigger) drained daily by the `process-storage-deletions` edge function via pg_cron + pg_net; service-role key lives in Supabase Vault

## Registration hardening (done)

- Live username availability check via `is_username_available` SECURITY DEFINER RPC (debounced `useUsernameAvailability` hook)
- `RegisterPage` detects Supabase's email-enumeration fake-success (empty `identities`) and shows "email already in use" instead of a false success screen
- `authErrors.ts` maps rate-limit (429) and duplicate-username DB errors to clear messages

## Public places & photos (done)

- `places.is_public` and `place_photos.is_public` (both default false — private by default)
- `get_public_places()` returns only safe columns plus owner username and public photos, excluding the caller's own pins
- Foreign public pins render with a distinct hollow marker, read-only popup, "shared by @username" attribution, and a show/hide toggle
- Storage read for public photos goes through the `is_public_photo_object(name)` SECURITY DEFINER helper called by a storage policy (a policy's own subquery would run under the caller's owner-only RLS and never see foreign rows)
- `place_photos` has an owner-only UPDATE policy (added so visibility toggles actually persist)

## Backlog (priority order)

- Profile language sync PR (server-side language preference): open design decision on conflict resolution between profile value and localStorage before merging
- `index.html` has `lang="en"` — set `document.documentElement.lang` via `i18n.on('languageChanged')`
- Replace stray `console.error` calls with Sentry `captureException` where errors would otherwise be lost (e.g. `AuthContext.loadProfile`)
- Category filter on the list view (map filter already implemented)
- Route-level code splitting (bundle size optimization)
- AI-generated journal text via Supabase Edge Function

## ⚠ Pre-launch checklist (before any public release)

- Add Vercel URL to Supabase URL Configuration (Site URL + Redirect URLs allowlist) — currently only localhost
- Enable leaked password protection in Supabase Auth settings
- Review auth rate limits in Supabase dashboard
- Set up a production SMTP provider (the built-in email service is rate-limited and not for production — caused 429s during testing)
- Verify CSP on the deployed app (headers do not apply in local dev): login, map tiles, search, photo upload/display, locate button

## Graphify

- A knowledge graph of this repo exists via graphify (`graphify-out/graph.json`)
- Use it for cross-file structure questions (call paths, dependencies, "what touches X") before grepping through files
- After larger refactors or new features, rebuild with `/graphify .`
