import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export type AuthContextType = {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  reloadProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
