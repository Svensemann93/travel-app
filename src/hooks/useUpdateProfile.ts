import { useMutation } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export type ProfilePatch = {
  display_name?: string | null
  bio?: string | null
  interests?: string[]
  avatar_path?: string | null
  cover_path?: string | null
}

export function useUpdateProfile() {
  const { user, reloadProfile } = useAuth()

  return useMutation({
    mutationFn: async (patch: ProfilePatch) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => reloadProfile(),
  })
}
