import { createClient } from '@supabase/supabase-js'

const BUCKET = 'place-photos'
const BATCH = 100

Deno.serve(async (req) => {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  if (req.headers.get('Authorization') !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL') as string, serviceKey, {
    auth: { persistSession: false },
  })

  const { data: rows, error } = await admin
    .from('pending_storage_deletions')
    .select('id, path')
    .limit(BATCH)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 })
  }

  const { error: removeError } = await admin.storage.from(BUCKET).remove(rows.map((r) => r.path))
  if (removeError) {
    return new Response(JSON.stringify({ error: removeError.message }), { status: 500 })
  }

  const { error: deleteError } = await admin
    .from('pending_storage_deletions')
    .delete()
    .in(
      'id',
      rows.map((r) => r.id),
    )
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ processed: rows.length }), { status: 200 })
})