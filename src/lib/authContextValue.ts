import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']

export type AuthContextType = {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  reloadProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
