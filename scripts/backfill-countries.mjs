import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function reverseGeocode(lat, lon) {
  const u =
    'https://nominatim.openstreetmap.org/reverse' +
    `?format=jsonv2&lat=${lat}&lon=${lon}&zoom=3&addressdetails=1`
  const res = await fetch(u, {
    headers: {
      'User-Agent': 'travel-app-backfill/1.0 (personal project)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  const code = data?.address?.country_code
  return code ? code.toUpperCase() : null
}

async function main() {
  const { data: places, error } = await supabase
    .from('places')
    .select('id, latitude, longitude')
    .is('country_code', null)
  if (error) throw error

  console.log(`Backfilling ${places.length} places...`)
  let done = 0
  for (const place of places) {
    const code = await reverseGeocode(place.latitude, place.longitude)
    if (code) {
      const { error: upErr } = await supabase
        .from('places')
        .update({ country_code: code })
        .eq('id', place.id)
      if (upErr) console.error(`  ${place.id}: update failed - ${upErr.message}`)
    }
    done += 1
    console.log(`  ${done}/${places.length} -> ${code ?? 'null'}`)
    await sleep(1100)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
