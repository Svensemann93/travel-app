import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

const MIN_LENGTH = 3
const DEBOUNCE_MS = 400

type Result = { name: string; status: 'available' | 'taken' | 'error' }

export function useUsernameAvailability(username: string): UsernameStatus {
  const trimmed = username.trim()
  const shouldCheck = trimmed.length >= MIN_LENGTH
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!shouldCheck) return
    let active = true

    const handle = setTimeout(async () => {
      const { data, error } = await supabase.rpc('is_username_available', {
        p_username: trimmed,
      })
      if (!active) return
      setResult({ name: trimmed, status: error ? 'error' : data ? 'available' : 'taken' })
    }, DEBOUNCE_MS)

    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [trimmed, shouldCheck])

  if (!shouldCheck) return 'idle'
  if (result && result.name === trimmed) return result.status
  return 'checking'
}
