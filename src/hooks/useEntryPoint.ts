import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type EntryPoint = { latitude: number; longitude: number; label: string | null }

export function useEntryPoint() {
  const { user } = useAuth()
  const userId = user?.id
  return useQuery({
    queryKey: ['entry-point', userId],
    enabled: !!userId,
    queryFn: async (): Promise<EntryPoint | null> => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('entry_latitude, entry_longitude, entry_label')
        .eq('id', userId)
        .single()
      if (error) throw error
      if (data.entry_latitude == null || data.entry_longitude == null) return null
      return {
        latitude: data.entry_latitude,
        longitude: data.entry_longitude,
        label: data.entry_label ?? null,
      }
    },
  })
}

export function useSetEntryPoint() {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (point: EntryPoint | null) => {
      if (!userId) throw new Error('Nicht angemeldet')
      const { error } = await supabase
        .from('profiles')
        .update({
          entry_latitude: point?.latitude ?? null,
          entry_longitude: point?.longitude ?? null,
          entry_label: point?.label ?? null,
        })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry-point'] })
    },
  })
}
