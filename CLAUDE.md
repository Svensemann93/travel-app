# CLAUDE.md

## Project

Personal mobile-first travel app (learning project, not yet public). Solo developer, German-speaking — conversation in German, but all code, comments, variable names, commit messages, PR titles and PR bodies in English.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS v4
- react-leaflet / Leaflet (OpenStreetMap tiles, Nominatim via leaflet-geosearch)
- react-router-dom v7, TanStack Query, react-i18next (de/en, fallback en)
- Supabase: Auth, Postgres (RLS), Storage, Edge Functions — project ref `bomvrpytexfjwtjlnqya`
- Sentry (no PII, sourcemaps hidden), Vercel (auto-deploy from main, branch protection)
- Dev environment: Windows, PowerShell — always give PowerShell commands, use `;` not `&&`

## Architecture rules

- `src/lib/categories.ts` is the single source of truth for category data (CategoryId union, CATEGORIES, CATEGORY_MAP, DEFAULT_CATEGORY). Category display names come from i18n only.
- RLS is always owner-only. Photos are referenced, never duplicated (e.g. `place_photo_ids uuid[]`: null = all, array = curated, empty = none).
- Accent colors: teal `#39BBDE`, sun `#F4C15A`.
- Keep files under ~100 lines where possible. No code comments.
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

## Current backlog (priority order)

Security (from completed audit; #1 profiles RLS and #4 security headers are DONE):

1. **Share-link hard expiry**: `get_shared_journal` extends `expires_at` by 30 days on every access — links never expire if accessed regularly. Add a hard maximum from `created_at` (e.g. 180 days) that is never extended. Migration.
2. **Storage cleanup on account deletion**: `delete_own_account` cascades DB rows but leaves Storage objects orphaned in `place-photos`. Delete the user's folder (`(storage.foldername(name))[1] = auth.uid()::text`) inside the function. GDPR-relevant. Migration.
3. **Signed URL expiry during long sessions**: `useSignedUrl` has TTL 60 min / staleTime 50 min but only refetches on mount/focus. Add `refetchInterval: 45 * 60 * 1000`.
4. **Cascade deletes bypass photo cleanup**: client-side storage deletion only runs on explicit user actions. Consider a `pending_storage_deletions` table filled by trigger + scheduled cleanup.

Other open items:

- Profile language sync PR (server-side language preference): open design decision on conflict resolution between profile value and localStorage before merging
- `index.html` has `lang="en"` — set `document.documentElement.lang` via `i18n.on('languageChanged')`
- Replace stray `console.error` calls with Sentry `captureException` where errors would otherwise be lost (e.g. `AuthContext.loadProfile`)
- Phase 3: category filter on map and list
- Phase 4: AI-generated journal text via Supabase Edge Function

## ⚠ Pre-launch checklist (before any public release)

- Add Vercel URL to Supabase URL Configuration (Site URL + Redirect URLs allowlist) — currently only localhost
- Enable leaked password protection in Supabase Auth settings
- Review auth rate limits in Supabase dashboard
- Verify CSP on the deployed app (headers do not apply in local dev): login, map tiles, search, photo upload/display, locate button

## Graphify

- A knowledge graph of this repo exists via graphify (`graphify-out/graph.json`)
- Use it for cross-file structure questions (call paths, dependencies, "what touches X") before grepping through files
- After larger refactors or new features, rebuild with `/graphify .`
