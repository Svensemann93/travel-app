type AuthErrorKey =
  | 'error.invalidCredentials'
  | 'error.emailInUse'
  | 'error.weakPassword'
  | 'error.emailNotConfirmed'
  | 'error.generic'

export function authErrorKey(message: string): AuthErrorKey {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'error.invalidCredentials'
  if (normalized.includes('already registered') || normalized.includes('already in use'))
    return 'error.emailInUse'
  if (normalized.includes('password') && normalized.includes('weak')) return 'error.weakPassword'
  if (normalized.includes('email not confirmed')) return 'error.emailNotConfirmed'
  return 'error.generic'
}
