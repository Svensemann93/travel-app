# Travel App

A personal, mobile-first travel app built around a **place-first** philosophy: every
memory is pinned to an exact spot, not just a city. The core workflow is
**plan → document → share** — drop pins for places worth visiting, capture trips and
photos in a travel journal, and share read-only journals via private links.

> Status: private project, not yet publicly available.

## Features

- **Place-first map** — categorized pins (restaurants, cafés, sights, nature, …) with
  color-coded markers, ratings, prices, photos, and per-category filtering.
- **Travel journal ("Reisetagebuch")** — full CRUD entries, trip import, and photos
  referenced from your places (no duplicate storage).
- **Journal cover & focal point** — pick a cover image and frame it with a focal point.
- **Interactive read view** — map and timeline are linked: scrolling highlights the
  active pin, clicking a pin jumps to its entry.
- **Private share links** — share a read-only journal via an unguessable link with a
  sliding 30-day expiry.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Map:** Leaflet / react-leaflet with OpenStreetMap tiles
- **Routing & data:** react-router-dom v7, TanStack Query
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions on Deno, pg_cron)
- **Monitoring:** Sentry
- **Testing:** Vitest

The UI language is German. Photos live in a private Supabase Storage bucket and are
served via signed URLs.

## Getting started

### Prerequisites

- Node.js **>= 22**
- A Supabase project (Auth, Postgres, Storage)

### Setup

```bash
npm install
```

Create a `.env` file in the project root with your Supabase project values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run

```bash
npm run dev
```

The app runs on the Vite dev server (default `http://localhost:5173`).

## Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server                 |
| `npm run build`        | Type-check and build for production  |
| `npm run preview`      | Preview the production build locally |
| `npm run lint`         | Run ESLint                           |
| `npm run typecheck`    | Type-check the project               |
| `npm test`             | Run the test suite (Vitest)          |
| `npm run format`       | Format with Prettier                 |
| `npm run format:check` | Check formatting                     |

## Supabase

Database schema and Edge Functions are versioned under `supabase/`.

- **Migrations** are the source of truth — apply them with `supabase db push`.
- **Edge Functions** run on Deno and deploy with `supabase functions deploy <name>`.
- Syncing the remote schema (`supabase db pull`) and creating snapshots
  (`supabase db dump`) require a running Docker engine; `db push` and
  `functions deploy` do not.

The `supabase/` folder is excluded from ESLint and Prettier.

## Deployment

The app is deployed on **Vercel**. Before going live, the deployed URL must be added to
the Supabase **URL Configuration** (Site URL + Redirect Allowlist) so authentication
works on the production domain.
