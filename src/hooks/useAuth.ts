import { useContext } from 'react'
import { AuthContext } from '../lib/authContextValue'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
