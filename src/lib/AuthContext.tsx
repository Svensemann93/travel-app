/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { AuthContext, type Profile } from './authContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error loading profile:', error)
      return null
    }

    return data as Profile | null
  }, [])

  const reloadProfile = useCallback(async () => {
    if (!session?.user) return
    const data = await loadProfile(session.user.id)
    setProfile(data)
  }, [session, loadProfile])

  // Listen to auth changes – sets session synchronously without awaits
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load profile whenever session.user.id changes
  useEffect(() => {
    const userId = session?.user?.id

    if (!userId) {
      setProfile(null)
      return
    }

    let isMounted = true

    loadProfile(userId).then((data) => {
      if (isMounted) {
        setProfile(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [session?.user?.id, loadProfile])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
