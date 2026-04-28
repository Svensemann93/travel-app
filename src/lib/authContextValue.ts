import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
