import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const BUCKET = 'place-photos'
const SIGN_TTL = 3600

type Photo = { id: string; url: string | null; thumb_url: string | null }

type Entry = {
  id: string
  entry_date: string | null
  title: string | null
  body: string | null
  place: { name: string; latitude: number; longitude: number } | null
  place_photos: Photo[]
  entry_photos: Photo[]
}

type SharedJournal = {
  title: string
  description: string | null
  cover_photo_path: string | null
  cover_focus_x: number | null
  cover_focus_y: number | null
  entries: Entry[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { token } = await req.json()
    if (typeof token !== 'string' || token.length < 20) {
      return json({ journal: null }, 200)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase.rpc('get_shared_journal', { p_token: token })
    if (error) throw error
    if (!data) return json({ journal: null }, 200)

    const shared = data as SharedJournal

    const paths = new Set<string>()
    if (shared.cover_photo_path) paths.add(shared.cover_photo_path)
    for (const entry of shared.entries ?? []) {
      for (const p of [...(entry.place_photos ?? []), ...(entry.entry_photos ?? [])]) {
        if (p.url) paths.add(p.url)
        if (p.thumb_url) paths.add(p.thumb_url)
      }
    }

    const signedMap = new Map<string, string>()
    const pathList = [...paths]
    if (pathList.length > 0) {
      const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(pathList, SIGN_TTL)
      if (signErr) throw signErr
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl)
      }
    }

    const sign = (path: string | null) => (path ? (signedMap.get(path) ?? null) : null)
    const mapPhotos = (list: Photo[]) =>
      (list ?? []).map((p) => ({ id: p.id, url: sign(p.url), thumb_url: sign(p.thumb_url) }))

    const journal = {
      title: shared.title,
      description: shared.description,
      cover_photo_path: sign(shared.cover_photo_path),
      cover_focus_x: shared.cover_focus_x,
      cover_focus_y: shared.cover_focus_y,
      entries: (shared.entries ?? []).map((e) => ({
        id: e.id,
        entry_date: e.entry_date,
        title: e.title,
        body: e.body,
        place: e.place,
        place_photos: mapPhotos(e.place_photos),
        entry_photos: mapPhotos(e.entry_photos),
      })),
    }

    return json({ journal }, 200)
  } catch (e) {
    console.error(e)
    return json({ error: 'server error' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}