import { createClient, SupabaseClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const BUCKET = 'place-photos'
const PAGE_SIZE = 1000
const REMOVE_BATCH = 100

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function listAllPaths(admin: SupabaseClient, root: string): Promise<string[]> {
  const paths: string[] = []
  const folders: string[] = [root]

  while (folders.length > 0) {
    const current = folders.pop() as string
    let offset = 0

    while (true) {
      const { data, error } = await admin.storage
        .from(BUCKET)
        .list(current, { limit: PAGE_SIZE, offset })
      if (error) throw error
      if (!data || data.length === 0) break

      for (const item of data) {
        if (item.id === null) folders.push(`${current}/${item.name}`)
        else paths.push(`${current}/${item.name}`)
      }

      if (data.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }
  }

  return paths
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SUPABASE_ANON_KEY') as string,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401)
  const userId = userData.user.id

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
    { auth: { persistSession: false } },
  )

  try {
    const paths = await listAllPaths(admin, userId)
    for (let i = 0; i < paths.length; i += REMOVE_BATCH) {
      const { error } = await admin.storage.from(BUCKET).remove(paths.slice(i, i + REMOVE_BATCH))
      if (error) throw error
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return json({ success: true }, 200)
  } catch (err) {
    console.error('delete-account failed', err)
    return json({ error: 'Deletion failed' }, 500)
  }
})