type AuthErrorKey =
  | 'error.invalidCredentials'
  | 'error.emailInUse'
  | 'error.weakPassword'
  | 'error.emailNotConfirmed'
  | 'error.usernameTaken'
  | 'error.tooManyRequests'
  | 'error.generic'

export function authErrorKey(message: string): AuthErrorKey {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'error.invalidCredentials'
  if (normalized.includes('already registered') || normalized.includes('already in use'))
    return 'error.emailInUse'
  if (normalized.includes('password') && normalized.includes('weak')) return 'error.weakPassword'
  if (normalized.includes('email not confirmed')) return 'error.emailNotConfirmed'
  if (normalized.includes('database error saving new user')) return 'error.usernameTaken'
  if (normalized.includes('rate limit') || normalized.includes('too many requests'))
    return 'error.tooManyRequests'
  return 'error.generic'
}
